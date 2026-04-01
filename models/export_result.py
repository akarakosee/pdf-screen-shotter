"""
Data class describing the outcome of a completed (or cancelled) export run.

Returned from the service layer to the UI layer for the completion summary.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ExportResult:
    """Mutable result accumulated during an export run.

    Attributes:
        total_pages:       Number of pages detected in the PDF.
        success_count:     Pages that were rendered and saved successfully.
        failed_pages:      List of ``(page_number, error_message)`` tuples.
        output_folder:     The created output directory (may be ``None`` if
                           the run failed before folder creation).
        duration_seconds:  Wall-clock time for the entire export.
        cancelled:         ``True`` if the user cancelled mid-export.
    """

    total_pages: int = 0
    success_count: int = 0
    failed_pages: list[tuple[int, str]] = field(default_factory=list)
    output_folder: Path | None = None
    duration_seconds: float = 0.0
    cancelled: bool = False

    @property
    def failed_count(self) -> int:
        return len(self.failed_pages)

    @property
    def all_succeeded(self) -> bool:
        return self.failed_count == 0 and self.success_count == self.total_pages
