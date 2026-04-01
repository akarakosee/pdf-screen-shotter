"""
Background worker that drives the export pipeline in a ``QThread``.

Signals:
    progress(ProgressData) — emitted after each step.
    finished(ExportResult) — emitted when the export completes or is cancelled.
    error(str)             — emitted if a fatal error prevents the export
                             from running at all (e.g. PDF validation failure).
"""

from __future__ import annotations

import threading

from PySide6.QtCore import QObject, QThread, Signal

from core.logger import get_logger
from models.export_options import ExportOptions
from models.export_result import ExportResult
from models.progress_data import ProgressData
from services.export_service import run_export

logger = get_logger(__name__)


class ExportWorker(QObject):
    """Runs :func:`services.export_service.run_export` off the main thread.

    Usage::

        thread = QThread()
        worker = ExportWorker(options)
        worker.moveToThread(thread)

        thread.started.connect(worker.run)
        worker.finished.connect(thread.quit)
        # … connect progress / finished / error signals …

        thread.start()
    """

    # ---- Signals ----
    progress = Signal(ProgressData)
    finished = Signal(ExportResult)
    error = Signal(str)

    def __init__(self, options: ExportOptions, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self._options = options
        self._cancel_event = threading.Event()

    # ---- Public API ----

    def request_cancel(self) -> None:
        """Thread-safe cancellation request."""
        self._cancel_event.set()
        logger.info("Cancellation requested by user.")

    # ---- Slot ----

    def run(self) -> None:  # noqa: D401 — Qt slot naming convention
        """Execute the export pipeline.  Connected to ``QThread.started``."""
        try:
            result = run_export(
                options=self._options,
                on_progress=self._emit_progress,
                is_cancelled=self._cancel_event.is_set,
            )
            self.finished.emit(result)
        except Exception as exc:
            logger.exception("Fatal export error")
            self.error.emit(str(exc))

    # ---- Internal ----

    def _emit_progress(self, data: ProgressData) -> None:
        """Forward progress data to the Qt signal (thread-safe)."""
        self.progress.emit(data)
