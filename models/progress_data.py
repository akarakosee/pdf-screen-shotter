"""
Data class carrying per-page progress information.

Emitted by the worker thread and consumed by the UI layer to update
the progress bar, status label, and log area.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ProgressData:
    """Immutable snapshot of export progress for one step.

    Attributes:
        current_page: 1-based index of the page being processed
                      (0 during pre-export phases like folder creation).
        total_pages:  Total pages detected in the PDF.
        message:      Human-readable status message (Turkish).
        is_error:     ``True`` if this message reports a non-fatal error
                      (e.g. a single page failed to render).
    """

    current_page: int
    total_pages: int
    message: str
    is_error: bool = False
