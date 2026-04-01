"""
Main application window.

Single-window desktop UI with:
  • PDF file selector
  • output directory selector
  • quality dropdown
  • start / cancel button
  • progress bar + status label
  • scrolling log area
  • completion summary
  • "open output folder" button
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from PySide6.QtCore import QThread, Qt, Slot
from PySide6.QtGui import QFont, QIcon
from PySide6.QtWidgets import (
    QApplication,
    QFileDialog,
    QHBoxLayout,
    QMainWindow,
    QMessageBox,
    QVBoxLayout,
    QWidget,
)

from core.config import (
    APP_NAME,
    APP_VERSION,
    DEFAULT_QUALITY_LABEL,
    QUALITY_PRESETS,
    WINDOW_MIN_HEIGHT,
    WINDOW_MIN_WIDTH,
)
from core.logger import get_logger
from core.utils import format_duration
from models.export_options import ExportOptions
from models.export_result import ExportResult
from models.progress_data import ProgressData
from ui.export_worker import ExportWorker
from ui.widgets import (
    make_button,
    make_combo_box,
    make_group_box,
    make_label,
    make_line_edit,
    make_log_area,
    make_progress_bar,
    make_row,
)

logger = get_logger(__name__)


class MainWindow(QMainWindow):
    """Primary application window."""

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle(f"{APP_NAME} v{APP_VERSION}")
        self.setMinimumSize(WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT)

        # Worker state
        self._thread: QThread | None = None
        self._worker: ExportWorker | None = None
        self._last_output_folder: Path | None = None

        self._build_ui()
        self._connect_signals()

    # ------------------------------------------------------------------
    # UI Construction
    # ------------------------------------------------------------------

    def _build_ui(self) -> None:
        central = QWidget()
        self.setCentralWidget(central)
        root_layout = QVBoxLayout(central)
        root_layout.setSpacing(12)
        root_layout.setContentsMargins(20, 20, 20, 20)

        # --- PDF selection ---
        self._pdf_path_edit = make_line_edit(
            placeholder="PDF dosyasını seçin…",
            read_only=True,
            object_name="pdfPathEdit",
        )
        self._pdf_select_btn = make_button("PDF Seç", object_name="pdfSelectBtn")

        pdf_row = make_row(self._pdf_path_edit, self._pdf_select_btn)
        self._pdf_path_edit.setMinimumWidth(400)
        pdf_group = make_group_box("PDF Dosyası", pdf_row)
        root_layout.addWidget(pdf_group)

        # --- Output directory ---
        self._output_dir_edit = make_line_edit(
            placeholder="Çıktı klasörü…",
            read_only=True,
            object_name="outputDirEdit",
        )
        self._output_dir_btn = make_button("Klasör Seç", object_name="outputDirBtn")

        output_row = make_row(self._output_dir_edit, self._output_dir_btn)
        output_group = make_group_box("Çıktı Klasörü", output_row)
        root_layout.addWidget(output_group)

        # --- Quality + action row ---
        quality_label = make_label("Kalite:")
        self._quality_combo = make_combo_box(
            list(QUALITY_PRESETS.keys()),
            default=DEFAULT_QUALITY_LABEL,
            object_name="qualityCombo",
        )
        self._start_btn = make_button(
            "Dönüştür",
            primary=True,
            object_name="startBtn",
        )
        self._cancel_btn = make_button(
            "İptal",
            object_name="cancelBtn",
            enabled=False,
        )

        action_row = make_row(
            quality_label, self._quality_combo, self._start_btn, self._cancel_btn,
        )
        action_row.addStretch()
        action_widget = QWidget()
        action_widget.setLayout(action_row)
        root_layout.addWidget(action_widget)

        # --- Progress ---
        self._progress_bar = make_progress_bar()
        self._status_label = make_label("Hazır.", object_name="statusLabel")

        progress_layout = QVBoxLayout()
        progress_layout.setSpacing(6)
        progress_layout.addWidget(self._progress_bar)
        progress_layout.addWidget(self._status_label)
        progress_group = make_group_box("İlerleme", progress_layout)
        root_layout.addWidget(progress_group)

        # --- Log area ---
        self._log_area = make_log_area()
        log_layout = QVBoxLayout()
        log_layout.addWidget(self._log_area)
        log_group = make_group_box("Durum Günlüğü", log_layout)
        root_layout.addWidget(log_group)

        # --- Summary + open folder ---
        self._summary_label = make_label("", object_name="summaryLabel")
        self._summary_label.setWordWrap(True)
        self._open_folder_btn = make_button(
            "Çıktı Klasörünü Aç",
            object_name="openFolderBtn",
            enabled=False,
        )

        summary_row = QHBoxLayout()
        summary_row.addWidget(self._summary_label, stretch=1)
        summary_row.addWidget(self._open_folder_btn)
        summary_widget = QWidget()
        summary_widget.setLayout(summary_row)
        root_layout.addWidget(summary_widget)

    # ------------------------------------------------------------------
    # Signal / slot wiring
    # ------------------------------------------------------------------

    def _connect_signals(self) -> None:
        self._pdf_select_btn.clicked.connect(self._on_select_pdf)
        self._output_dir_btn.clicked.connect(self._on_select_output_dir)
        self._start_btn.clicked.connect(self._on_start_export)
        self._cancel_btn.clicked.connect(self._on_cancel_export)
        self._open_folder_btn.clicked.connect(self._on_open_folder)

    # ------------------------------------------------------------------
    # Slots — file / folder selectors
    # ------------------------------------------------------------------

    @Slot()
    def _on_select_pdf(self) -> None:
        path, _ = QFileDialog.getOpenFileName(
            self,
            "PDF Dosyası Seçin",
            "",
            "PDF Dosyaları (*.pdf);;Tüm Dosyalar (*)",
        )
        if path:
            self._pdf_path_edit.setText(path)
            # Auto-set output dir to the same directory as the PDF
            if not self._output_dir_edit.text():
                self._output_dir_edit.setText(str(Path(path).parent))
            self._log(f"PDF seçildi: {Path(path).name}")

    @Slot()
    def _on_select_output_dir(self) -> None:
        start_dir = self._output_dir_edit.text() or ""
        directory = QFileDialog.getExistingDirectory(
            self, "Çıktı Klasörünü Seçin", start_dir,
        )
        if directory:
            self._output_dir_edit.setText(directory)
            self._log(f"Çıktı klasörü: {directory}")

    # ------------------------------------------------------------------
    # Slots — export lifecycle
    # ------------------------------------------------------------------

    @Slot()
    def _on_start_export(self) -> None:
        # --- Validate user inputs ---
        pdf_path_str = self._pdf_path_edit.text().strip()
        if not pdf_path_str:
            QMessageBox.warning(self, "Uyarı", "Lütfen bir PDF dosyası seçin.")
            return

        output_dir_str = self._output_dir_edit.text().strip()
        if not output_dir_str:
            QMessageBox.warning(self, "Uyarı", "Lütfen bir çıktı klasörü seçin.")
            return

        pdf_path = Path(pdf_path_str)
        output_dir = Path(output_dir_str)

        if not pdf_path.exists():
            QMessageBox.critical(self, "Hata", f"PDF dosyası bulunamadı:\n{pdf_path}")
            return

        if not output_dir.is_dir():
            QMessageBox.critical(
                self, "Hata",
                f"Çıktı klasörü geçersiz veya mevcut değil:\n{output_dir}",
            )
            return

        # --- Build options ---
        quality_label = self._quality_combo.currentText()
        dpi = QUALITY_PRESETS.get(quality_label, 200)

        options = ExportOptions(
            pdf_path=pdf_path,
            output_dir=output_dir,
            dpi=dpi,
        )

        # --- Reset UI ---
        self._reset_for_new_export()
        self._log(f"Dönüştürme başlatılıyor — {quality_label}")

        # --- Launch worker ---
        self._thread = QThread()
        self._worker = ExportWorker(options)
        self._worker.moveToThread(self._thread)

        self._thread.started.connect(self._worker.run)
        self._worker.progress.connect(self._on_worker_progress)
        self._worker.finished.connect(self._on_worker_finished)
        self._worker.error.connect(self._on_worker_error)
        self._worker.finished.connect(self._thread.quit)
        self._worker.error.connect(self._thread.quit)
        self._thread.finished.connect(self._cleanup_worker)

        self._thread.start()

    @Slot()
    def _on_cancel_export(self) -> None:
        if self._worker is not None:
            self._worker.request_cancel()
            self._cancel_btn.setEnabled(False)
            self._status_label.setText("İptal ediliyor…")

    @Slot()
    def _on_open_folder(self) -> None:
        if self._last_output_folder and self._last_output_folder.is_dir():
            folder_str = str(self._last_output_folder)
            if sys.platform == "darwin":
                subprocess.Popen(["open", folder_str])
            elif sys.platform == "win32":
                os.startfile(folder_str)  # type: ignore[attr-defined]
            else:
                subprocess.Popen(["xdg-open", folder_str])

    # ------------------------------------------------------------------
    # Slots — worker signals
    # ------------------------------------------------------------------

    @Slot(ProgressData)
    def _on_worker_progress(self, data: ProgressData) -> None:
        self._status_label.setText(data.message)

        if data.total_pages > 0 and data.current_page > 0:
            pct = int((data.current_page / data.total_pages) * 100)
            self._progress_bar.setValue(pct)

        color = "#e74c3c" if data.is_error else ""
        styled = (
            f'<span style="color:{color};">{data.message}</span>'
            if color else data.message
        )
        self._log_area.append(styled)

    @Slot(ExportResult)
    def _on_worker_finished(self, result: ExportResult) -> None:
        self._set_ui_idle()

        self._last_output_folder = result.output_folder

        # Build summary text
        duration = format_duration(result.duration_seconds)
        lines: list[str] = []

        if result.cancelled:
            lines.append("⚠️ Dönüştürme iptal edildi.")
        elif result.all_succeeded:
            lines.append("✅ Dönüştürme başarıyla tamamlandı!")
        else:
            lines.append("⚠️ Dönüştürme kısmen başarılı.")

        lines.append(f"Toplam sayfa: {result.total_pages}")
        lines.append(f"Başarılı: {result.success_count}")
        if result.failed_count > 0:
            lines.append(f"Başarısız: {result.failed_count}")
            for page_num, msg in result.failed_pages:
                lines.append(f"  • Sayfa {page_num}: {msg}")
        lines.append(f"Süre: {duration}")
        if result.output_folder:
            lines.append(f"Klasör: {result.output_folder}")

        summary = "\n".join(lines)
        self._summary_label.setText(summary)
        self._log(summary)

        if result.output_folder and result.output_folder.is_dir():
            self._open_folder_btn.setEnabled(True)

        self._progress_bar.setValue(100 if not result.cancelled else self._progress_bar.value())

    @Slot(str)
    def _on_worker_error(self, message: str) -> None:
        self._set_ui_idle()
        self._status_label.setText("Hata oluştu.")
        self._log(f"HATA: {message}")
        QMessageBox.critical(self, "Hata", message)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _reset_for_new_export(self) -> None:
        """Prepare UI state for a fresh export run."""
        self._progress_bar.setValue(0)
        self._status_label.setText("Başlatılıyor…")
        self._summary_label.setText("")
        self._log_area.clear()
        self._open_folder_btn.setEnabled(False)
        self._last_output_folder = None

        self._start_btn.setEnabled(False)
        self._cancel_btn.setEnabled(True)
        self._pdf_select_btn.setEnabled(False)
        self._output_dir_btn.setEnabled(False)
        self._quality_combo.setEnabled(False)

    def _set_ui_idle(self) -> None:
        """Restore interactive UI state after export ends."""
        self._start_btn.setEnabled(True)
        self._cancel_btn.setEnabled(False)
        self._pdf_select_btn.setEnabled(True)
        self._output_dir_btn.setEnabled(True)
        self._quality_combo.setEnabled(True)

    def _cleanup_worker(self) -> None:
        """Release worker and thread objects after the thread finishes."""
        if self._worker is not None:
            self._worker.deleteLater()
            self._worker = None
        if self._thread is not None:
            self._thread.deleteLater()
            self._thread = None

    def _log(self, message: str) -> None:
        """Append a plain-text line to the log area."""
        self._log_area.append(message)
        logger.info(message)
