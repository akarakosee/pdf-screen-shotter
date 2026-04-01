"""
Export orchestration service.

Drives the full export pipeline:
  validate → create folder → iterate pages → render → save → report

This module is **thread-safe by design**: it receives a cancel-check
callable and a progress callback, but never touches any GUI object.
"""

from __future__ import annotations

import time
from pathlib import Path
from typing import Callable

from core.logger import get_logger
from core.utils import (
    create_unique_folder,
    derive_output_folder_name,
    format_page_filename,
)
from models.export_options import ExportOptions
from models.export_result import ExportResult
from models.progress_data import ProgressData
from services.pdf_service import (
    PDFPasswordProtectedError,
    PDFRenderError,
    PDFValidationError,
    get_page_count,
    open_document,
    render_page_to_bytes,
    validate_pdf,
)

logger = get_logger(__name__)

# Type aliases for callbacks
ProgressCallback = Callable[[ProgressData], None]
CancelCheck = Callable[[], bool]


def run_export(
    options: ExportOptions,
    on_progress: ProgressCallback,
    is_cancelled: CancelCheck,
) -> ExportResult:
    """Execute the full PDF-to-image export pipeline.

    This function is designed to run **in a worker thread**.  It communicates
    exclusively through the *on_progress* callback and returns an
    :class:`ExportResult` when finished.

    Args:
        options:      Export parameters chosen by the user.
        on_progress:  Called after each meaningful step with a
                      :class:`ProgressData` instance.
        is_cancelled: Called before each page render; if it returns ``True``
                      the export stops gracefully.

    Returns:
        A populated :class:`ExportResult`.

    Raises:
        PDFValidationError: Propagated if the PDF fails validation
                            (caller should catch and surface to the user).
        PDFPasswordProtectedError: Propagated for encrypted PDFs.
        OSError: Propagated if the output folder cannot be created.
    """
    result = ExportResult()
    start_time = time.monotonic()

    # ------------------------------------------------------------------
    # 1. Validate the PDF
    # ------------------------------------------------------------------
    on_progress(ProgressData(
        current_page=0,
        total_pages=0,
        message="PDF doğrulanıyor…",
    ))
    validate_pdf(options.pdf_path)

    # ------------------------------------------------------------------
    # 2. Get page count
    # ------------------------------------------------------------------
    total_pages = get_page_count(options.pdf_path)
    result.total_pages = total_pages
    on_progress(ProgressData(
        current_page=0,
        total_pages=total_pages,
        message=f"Toplam {total_pages} sayfa tespit edildi.",
    ))

    # ------------------------------------------------------------------
    # 3. Create output folder
    # ------------------------------------------------------------------
    folder_name = derive_output_folder_name(options.pdf_path)
    on_progress(ProgressData(
        current_page=0,
        total_pages=total_pages,
        message=f"Çıktı klasörü oluşturuluyor: {folder_name}",
    ))

    try:
        output_folder = create_unique_folder(options.output_dir, folder_name)
    except OSError as exc:
        on_progress(ProgressData(
            current_page=0,
            total_pages=total_pages,
            message=f"Klasör oluşturulamadı: {exc}",
            is_error=True,
        ))
        raise

    result.output_folder = output_folder
    on_progress(ProgressData(
        current_page=0,
        total_pages=total_pages,
        message=f"Çıktı klasörü oluşturuldu: {output_folder}",
    ))

    # ------------------------------------------------------------------
    # 4. Open document and iterate pages
    # ------------------------------------------------------------------
    doc = open_document(options.pdf_path)
    try:
        for page_idx in range(total_pages):
            page_num = page_idx + 1  # 1-based for display

            # --- Cancellation check ---
            if is_cancelled():
                result.cancelled = True
                on_progress(ProgressData(
                    current_page=page_num,
                    total_pages=total_pages,
                    message="Dönüştürme iptal edildi.",
                ))
                logger.info("Export cancelled by user at page %d/%d", page_num, total_pages)
                break

            on_progress(ProgressData(
                current_page=page_num,
                total_pages=total_pages,
                message=f"Sayfa {page_num}/{total_pages} işleniyor…",
            ))

            # --- Render ---
            try:
                png_data = render_page_to_bytes(doc, page_idx, options.dpi)
            except PDFRenderError as exc:
                error_msg = str(exc)
                logger.warning("Render failed for page %d: %s", page_num, error_msg)
                result.failed_pages.append((page_num, error_msg))
                on_progress(ProgressData(
                    current_page=page_num,
                    total_pages=total_pages,
                    message=f"HATA: Sayfa {page_num} işlenemedi — {error_msg}",
                    is_error=True,
                ))
                continue

            # --- Save to disk ---
            filename = format_page_filename(
                page_num, total_pages, options.image_format,
            )
            file_path = output_folder / filename

            try:
                file_path.write_bytes(png_data)
            except OSError as exc:
                error_msg = f"Dosya kaydedilemedi: {exc}"
                logger.warning("Save failed for page %d: %s", page_num, error_msg)
                result.failed_pages.append((page_num, error_msg))
                on_progress(ProgressData(
                    current_page=page_num,
                    total_pages=total_pages,
                    message=f"HATA: {filename} kaydedilemedi — {error_msg}",
                    is_error=True,
                ))
                continue

            result.success_count += 1
            on_progress(ProgressData(
                current_page=page_num,
                total_pages=total_pages,
                message=f"Kaydedildi: {filename}",
            ))

            # Release PNG bytes immediately
            del png_data

    finally:
        doc.close()

    result.duration_seconds = time.monotonic() - start_time
    logger.info(
        "Export finished: %d/%d pages, %.1f s, cancelled=%s",
        result.success_count, result.total_pages,
        result.duration_seconds, result.cancelled,
    )
    return result
