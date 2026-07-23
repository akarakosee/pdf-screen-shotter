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
    """Execute the full PDF-to-image export pipeline for one or more files.

    Args:
        options:      Export parameters (including a list of pdf_paths).
        on_progress:  Progress update callback.
        is_cancelled: Cancellation check callback.

    Returns:
        A populated :class:`ExportResult` covering all processed files.
    """
    result = ExportResult()
    start_time = time.monotonic()

    # 1. Pre-scan: Get total pages across all PDFs
    on_progress(ProgressData(0, 0, "PDF dosyaları taranıyor…"))
    
    valid_pdfs: list[tuple[Path, int]] = []
    total_batch_pages = 0
    
    for pdf_path in options.pdf_paths:
        try:
            validate_pdf(pdf_path)
            count = get_page_count(pdf_path)
            valid_pdfs.append((pdf_path, count))
            total_batch_pages += count
        except (PDFValidationError, PDFPasswordProtectedError) as exc:
            logger.error("Skipping invalid PDF %s: %s", pdf_path, exc)
            result.failed_pages.append((0, f"{pdf_path.name}: {exc}"))
            on_progress(ProgressData(0, 0, f"HATA: {pdf_path.name} atlanıyor — {exc}", True))

    result.total_pages = total_batch_pages
    on_progress(ProgressData(0, total_batch_pages, f"Toplam {len(valid_pdfs)} dosyada {total_batch_pages} sayfa bulundu."))

    processed_pages_global = 0

    # 2. Iterate through each PDF
    for pdf_path, pdf_page_count in valid_pdfs:
        if is_cancelled():
            result.cancelled = True
            break

        on_progress(ProgressData(
            processed_pages_global, total_batch_pages, 
            f"İşleniyor: {pdf_path.name} ({pdf_page_count} sayfa)",
        ))

        # Create subfolder for this PDF
        folder_name = derive_output_folder_name(pdf_path)
        try:
            output_folder = create_unique_folder(options.output_dir, folder_name)
            result.created_folders.append(output_folder)
        except OSError as exc:
            logger.error("Could not create folder for %s: %s", pdf_path, exc)
            result.failed_pages.append((0, f"{pdf_path.name}: Klasör oluşturulamadı — {exc}"))
            processed_pages_global += pdf_page_count
            continue

        try:
            doc = open_document(pdf_path)
        except Exception as exc:
            logger.error("Could not open PDF %s for export: %s", pdf_path, exc)
            result.failed_pages.append((0, f"{pdf_path.name}: PDF açılamadı — {exc}"))
            processed_pages_global += pdf_page_count
            continue

        try:
            for page_idx in range(pdf_page_count):
                page_num = page_idx + 1
                processed_pages_global += 1

                if is_cancelled():
                    result.cancelled = True
                    break

                on_progress(ProgressData(
                    processed_pages_global, total_batch_pages,
                    f"{pdf_path.name} — Sayfa {page_num}/{pdf_page_count}...",
                ))

                # Render & Save
                png_data = None
                try:
                    png_data = render_page_to_bytes(doc, page_idx, options.dpi)
                    filename = format_page_filename(page_num, pdf_page_count, options.image_format)
                    (output_folder / filename).write_bytes(png_data)
                    result.success_count += 1
                except (PDFRenderError, OSError) as exc:
                    err_msg = f"{pdf_path.name} P{page_num}: {exc}"
                    logger.warning(err_msg)
                    result.failed_pages.append((page_num, err_msg))
                    on_progress(ProgressData(processed_pages_global, total_batch_pages, f"HATA: {err_msg}", True))

                if png_data is not None:
                    del png_data

            if result.cancelled:
                break

        finally:
            doc.close()

    if len(result.created_folders) == 1:
        result.output_folder = result.created_folders[0]
    elif len(result.created_folders) > 1:
        result.output_folder = options.output_dir

    result.duration_seconds = time.monotonic() - start_time
    logger.info(
        "Export finished: %d/%d pages, %.1f s, cancelled=%s",
        result.success_count, result.total_pages,
        result.duration_seconds, result.cancelled,
    )
    return result
