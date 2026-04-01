"""
PDF reading, validation, and page rendering service.

This module encapsulates all direct interaction with PyMuPDF (``fitz``).
No other module in the project should import ``fitz`` directly — all PDF
operations go through this service.
"""

from __future__ import annotations

from pathlib import Path
from typing import TYPE_CHECKING

import fitz  # PyMuPDF

from core.logger import get_logger

if TYPE_CHECKING:
    pass

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------

class PDFValidationError(Exception):
    """Raised when a PDF file fails validation checks."""


class PDFPasswordProtectedError(PDFValidationError):
    """Raised when a PDF is encrypted and requires a password."""


class PDFRenderError(Exception):
    """Raised when a single page fails to render."""


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_pdf(path: Path) -> None:
    """Validate that *path* points to a readable, non-encrypted PDF.

    Raises:
        PDFValidationError: If the file doesn't exist, isn't a PDF,
                            can't be opened, or has zero pages.
        PDFPasswordProtectedError: If the PDF is encrypted.
    """
    if not path.exists():
        raise PDFValidationError(f"Dosya bulunamadı: {path}")

    if not path.is_file():
        raise PDFValidationError(f"Geçersiz dosya yolu: {path}")

    if path.suffix.lower() != ".pdf":
        raise PDFValidationError(
            f"Dosya bir PDF değil (uzantı: {path.suffix}): {path.name}"
        )

    try:
        doc = fitz.open(str(path))
    except Exception as exc:
        raise PDFValidationError(
            f"PDF dosyası açılamadı: {exc}"
        ) from exc

    try:
        if doc.is_encrypted:
            raise PDFPasswordProtectedError(
                "PDF şifre korumalıdır. Şifre korumalı PDF'ler desteklenmiyor."
            )

        page_count = doc.page_count
        if page_count == 0:
            raise PDFValidationError("PDF dosyası 0 sayfa içeriyor.")
    finally:
        doc.close()

    logger.info("PDF doğrulandı: %s (%d sayfa)", path.name, page_count)


# ---------------------------------------------------------------------------
# Page count
# ---------------------------------------------------------------------------

def get_page_count(path: Path) -> int:
    """Return the total number of pages in the PDF at *path*.

    The caller should have already validated the file with
    :func:`validate_pdf`.
    """
    doc = fitz.open(str(path))
    try:
        count = doc.page_count
    finally:
        doc.close()
    return count


# ---------------------------------------------------------------------------
# Page rendering
# ---------------------------------------------------------------------------

def render_page_to_bytes(
    doc: fitz.Document,
    page_index: int,
    dpi: int,
) -> bytes:
    """Render a single page to PNG bytes at the given *dpi*.

    Args:
        doc:        An already-open ``fitz.Document``.
        page_index: Zero-based page index.
        dpi:        Target resolution.

    Returns:
        Raw PNG image data as ``bytes``.

    Raises:
        PDFRenderError: If the page cannot be rendered.
    """
    try:
        page = doc.load_page(page_index)
        # fitz default resolution is 72 DPI; zoom factor = target / 72
        zoom = dpi / 72.0
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        png_data: bytes = pixmap.tobytes("png")
        # Explicitly release the native pixmap memory
        pixmap = None  # noqa: F841 — intentional release
        return png_data
    except Exception as exc:
        raise PDFRenderError(
            f"Sayfa {page_index + 1} işlenemedi: {exc}"
        ) from exc


def open_document(path: Path) -> fitz.Document:
    """Open a PDF document for sequential page rendering.

    The caller is responsible for closing the returned document.
    """
    return fitz.open(str(path))
