"""
Main application window.

Single-window desktop UI with:
  • PDF file selector (Batch Support)
  • Drag & Drop Zone
  • Live Preview
  • Output directory selector
  • Quality dropdown
  • Start / cancel button
  • Progress bar + status label
  • Scrolling log area
  • Completion summary
  • "Open output folder" button
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from PySide6.QtCore import QThread, Qt, Slot
from PySide6.QtGui import QImage, QPixmap
from PySide6.QtWidgets import QFileDialog, QFrame, QHBoxLayout, QMainWindow, QMessageBox, QScrollArea, QSizePolicy, QVBoxLayout, QWidget

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
from services.pdf_service import open_document, render_page_to_bytes
from ui.export_worker import ExportWorker
from ui.widgets import (
    make_button,
    make_combo_box,
    make_drop_zone,
    make_label,
    make_line_edit,
    make_log_area,
    make_preview_area,
    make_progress_bar,
    make_row,
    make_section_card,
)

logger = get_logger(__name__)


class MainWindow(QMainWindow):
    """Primary application window."""

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle(f"{APP_NAME} v{APP_VERSION}")
        self.setMinimumSize(WINDOW_MIN_WIDTH, WINDOW_MIN_HEIGHT)
        self.resize(1260, 860)

        # Worker state
        self._thread: QThread | None = None
        self._worker: ExportWorker | None = None
        self._last_output_folder: Path | None = None
        self._pending_files: list[Path] = []

        self._build_ui()
        self._connect_signals()

    # ------------------------------------------------------------------
    # UI Construction
    # ------------------------------------------------------------------

    def _build_ui(self) -> None:
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.setCentralWidget(scroll)

        content = QWidget()
        content.setObjectName("appShell")
        scroll.setWidget(content)

        root_layout = QVBoxLayout(content)
        root_layout.setSpacing(12)
        root_layout.setContentsMargins(18, 16, 18, 16)

        header_layout = QHBoxLayout()
        header_layout.setSpacing(16)

        title_block = QVBoxLayout()
        title_block.setSpacing(2)

        eyebrow = make_label("PDF TO IMAGE DESKTOP TOOL", object_name="windowEyebrow")
        title = make_label(APP_NAME, object_name="heroTitle")
        subtitle = make_label(
            "Kaynak PDF'leri seç, çıktı kalitesini belirle ve sonucu tek ekranda takip et.",
            object_name="heroSubtitle",
        )
        subtitle.setWordWrap(True)

        title_block.addWidget(eyebrow)
        title_block.addWidget(title)
        title_block.addWidget(subtitle)
        header_layout.addLayout(title_block, 1)
        root_layout.addLayout(header_layout)

        main_layout = QHBoxLayout()
        main_layout.setSpacing(12)

        left_column = QVBoxLayout()
        left_column.setSpacing(12)
        right_column = QVBoxLayout()
        right_column.setSpacing(12)

        source_card = make_section_card("Kaynak PDF'ler")
        source_card.setFixedHeight(304)
        self._drop_zone = make_drop_zone()
        self._pdf_select_btn = make_button("Gözat", object_name="pdfSelectBtn")
        self._pdf_clear_btn = make_button("Temizle", object_name="pdfClearBtn")
        self._pdf_select_btn.setFixedWidth(132)
        self._pdf_clear_btn.setFixedWidth(132)
        self._selection_summary = make_label("", object_name="selectionSummary")
        self._selection_summary.setFixedHeight(42)
        self._selection_summary.setAlignment(Qt.AlignVCenter | Qt.AlignLeft)

        source_buttons = QHBoxLayout()
        source_buttons.setSpacing(8)
        source_buttons.addStretch()
        source_buttons.addWidget(self._pdf_select_btn)
        source_buttons.addWidget(self._pdf_clear_btn)

        source_footer_shell = QWidget()
        source_footer_shell.setObjectName("sourceFooter")
        source_footer_shell.setFixedHeight(108)
        source_footer_layout = QVBoxLayout(source_footer_shell)
        source_footer_layout.setContentsMargins(12, 12, 12, 12)
        source_footer_layout.setSpacing(10)
        source_footer_layout.addWidget(self._selection_summary)
        source_footer_layout.addLayout(source_buttons)

        source_card.content_layout.addWidget(self._drop_zone)
        source_card.content_layout.addWidget(source_footer_shell)
        left_column.addWidget(source_card)

        self._preview_area = make_preview_area()
        preview_card = make_section_card("İlk Sayfa Önizlemesi")
        preview_card.setFixedHeight(344)
        preview_card.content_layout.addWidget(self._preview_area, stretch=1)
        right_column.addWidget(preview_card)

        settings_card = make_section_card("Çıktı Ayarları")
        settings_card.setFixedHeight(388)

        output_block = QVBoxLayout()
        output_block.setSpacing(6)
        output_block.addWidget(make_label("Çıktı klasörü", object_name="fieldLabel"))
        self._output_dir_edit = make_line_edit(
            placeholder="Çıktı klasörü…",
            read_only=True,
            object_name="outputDirEdit",
        )
        self._output_dir_btn = make_button("Seç", object_name="outputDirBtn")
        output_row = make_row(self._output_dir_edit, self._output_dir_btn, spacing=10)
        output_row.setStretch(0, 1)
        output_block.addLayout(output_row)

        quality_block = QVBoxLayout()
        quality_block.setSpacing(6)
        quality_block.addWidget(make_label("Kalite", object_name="fieldLabel"))
        self._quality_combo = make_combo_box(
            list(QUALITY_PRESETS.keys()),
            default=DEFAULT_QUALITY_LABEL,
            object_name="qualityCombo",
        )
        quality_block.addWidget(self._quality_combo)

        action_block = QVBoxLayout()
        action_block.setSpacing(6)
        action_block.addWidget(make_label("İşlem", object_name="fieldLabel"))
        self._start_btn = make_button("Dönüştür", primary=True, object_name="primaryButton")
        self._cancel_btn = make_button("İptal", object_name="cancelBtn", enabled=False)
        actions_row = make_row(self._start_btn, self._cancel_btn, spacing=12)
        actions_row.setStretch(0, 1)
        actions_row.setStretch(1, 1)
        action_block.addLayout(actions_row)

        progress_block = QVBoxLayout()
        progress_block.setSpacing(8)
        progress_block.addWidget(make_label("İlerleme", object_name="fieldLabel"))
        self._progress_bar = make_progress_bar()
        self._status_label = make_label("Hazır.", object_name="statusLabel")
        self._status_label.setFixedHeight(36)
        self._status_label.setAlignment(Qt.AlignVCenter | Qt.AlignLeft)
        progress_shell = QWidget()
        progress_shell.setObjectName("progressPanel")
        progress_shell.setFixedHeight(88)
        progress_shell_layout = QVBoxLayout(progress_shell)
        progress_shell_layout.setContentsMargins(10, 10, 10, 10)
        progress_shell_layout.setSpacing(6)
        progress_shell_layout.addWidget(self._progress_bar)
        progress_shell_layout.addWidget(self._status_label)
        progress_block.addWidget(progress_shell)

        settings_card.content_layout.addLayout(output_block)
        settings_card.content_layout.addLayout(quality_block)
        settings_card.content_layout.addLayout(action_block)
        settings_card.content_layout.addLayout(progress_block)
        left_column.addWidget(settings_card)
        left_column.addStretch()

        summary_card = make_section_card("Özet")
        summary_card.setFixedHeight(236)
        summary_vbox = QVBoxLayout()
        summary_vbox.setSpacing(12)

        self._summary_label = make_label("", object_name="summaryLabel")
        self._summary_label.setWordWrap(True)
        self._summary_label.setAlignment(Qt.AlignTop | Qt.AlignLeft)
        summary_vbox.addWidget(self._summary_label)

        self._open_folder_btn = make_button(
            "Klasörü Aç",
            object_name="openFolderBtn",
            enabled=False,
        )
        summary_vbox.addStretch()
        summary_vbox.addWidget(self._open_folder_btn)
        summary_card.content_layout.addLayout(summary_vbox)
        right_column.addWidget(summary_card)
        right_column.addStretch()

        main_layout.addLayout(left_column, 5)
        main_layout.addLayout(right_column, 3)
        root_layout.addLayout(main_layout)

        log_card = make_section_card("İşlem Günlüğü")
        log_card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        log_card.setMinimumHeight(140)
        self._log_area = make_log_area()
        log_card.content_layout.addWidget(self._log_area)
        root_layout.addWidget(log_card, 1)

        self._set_selection_summary()
        self._set_summary_placeholder()

    # ------------------------------------------------------------------
    # Signal / slot wiring
    # ------------------------------------------------------------------

    def _connect_signals(self) -> None:
        self._pdf_select_btn.clicked.connect(self._on_select_pdf)
        self._pdf_clear_btn.clicked.connect(self._on_clear_files)
        self._output_dir_btn.clicked.connect(self._on_select_output_dir)
        self._start_btn.clicked.connect(self._on_start_export)
        self._cancel_btn.clicked.connect(self._on_cancel_export)
        self._open_folder_btn.clicked.connect(self._on_open_folder)
        self._drop_zone.filesDropped.connect(self._on_files_dropped)
        self._drop_zone.clicked.connect(self._on_select_pdf)
        self._quality_combo.currentTextChanged.connect(self._on_quality_changed)

    # ------------------------------------------------------------------
    # Slots — file / folder selectors
    # ------------------------------------------------------------------

    @Slot(list)
    def _on_files_dropped(self, file_paths: list[str]) -> None:
        if not file_paths:
            return
        
        self._pending_files = [Path(p) for p in file_paths]
        self._set_selection_summary()
        self._update_preview(self._pending_files[0])
            
        # Auto-set output dir to the first PDF's parent
        if not self._output_dir_edit.text():
            self._output_dir_edit.setText(str(self._pending_files[0].parent))
            
        self._log(f"{len(self._pending_files)} dosya yüklendi.")

    @Slot()
    def _on_clear_files(self) -> None:
        self._pending_files = []
        self._preview_area.setPixmap(QPixmap())
        self._preview_area.setText("Önizleme Yok")
        self._set_selection_summary()
        self._set_summary_placeholder()
        self._log("Dosya listesi temizlendi.")

    @Slot()
    def _on_select_pdf(self) -> None:
        paths, _ = QFileDialog.getOpenFileNames(
            self,
            "PDF Dosyaları Seçin",
            "",
            "PDF Dosyaları (*.pdf);;Tüm Dosyalar (*)",
        )
        if paths:
            self._on_files_dropped(paths)

    @Slot(str)
    def _on_quality_changed(self, _label: str) -> None:
        if self._pending_files:
            self._update_preview(self._pending_files[0])

    def _update_preview(self, pdf_path: Path) -> None:
        """Render and display the first page of the PDF as a preview."""
        doc = None
        try:
            doc = open_document(pdf_path)
            preview_dpi = min(QUALITY_PRESETS.get(self._quality_combo.currentText(), 72), 144)
            png_data = render_page_to_bytes(doc, 0, preview_dpi)

            image = QImage.fromData(png_data)
            pixmap = QPixmap.fromImage(image)

            # Scale to fit preview area
            scaled_pixmap = pixmap.scaled(
                self._preview_area.size(),
                Qt.KeepAspectRatio,
                Qt.SmoothTransformation,
            )
            self._preview_area.setPixmap(scaled_pixmap)
            self._preview_area.setText("")
        except Exception as exc:
            logger.error("Preview failed for %s: %s", pdf_path, exc)
            self._preview_area.setPixmap(QPixmap())
            self._preview_area.setText("Hata")
        finally:
            if doc is not None:
                doc.close()

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
        if not self._pending_files:
            QMessageBox.warning(self, "Uyarı", "Lütfen en az bir PDF dosyası seçin.")
            return

        output_dir_str = self._output_dir_edit.text().strip()
        if not output_dir_str:
            QMessageBox.warning(self, "Uyarı", "Lütfen bir çıktı klasörü seçin.")
            return

        output_dir = Path(output_dir_str)
        if not output_dir.is_dir():
            QMessageBox.critical(
                self, "Hata",
                f"Çıktı klasörü geçersiz veya mevcut değil:\n{output_dir}",
            )
            return

        # Ensure we have Path objects
        pdf_paths = self._pending_files

        # --- Build options ---
        quality_label = self._quality_combo.currentText()
        dpi = QUALITY_PRESETS.get(quality_label, 200)

        options = ExportOptions(
            pdf_paths=pdf_paths,
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

        color = "#ef4444" if data.is_error else "" # Red-500
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
            lines.append("Dönüştürme iptal edildi.")
        elif result.all_succeeded:
            lines.append("Dönüştürme başarıyla tamamlandı.")
        else:
            lines.append("Dönüştürme kısmen başarılı.")

        lines.append(f"Toplam sayfa: {result.total_pages}")
        lines.append(f"Başarılı: {result.success_count}")
        if len(result.created_folders) > 1:
            lines.append(f"Oluşturulan klasör: {len(result.created_folders)} adet")
        if result.failed_count > 0:
            lines.append(f"Başarısız: {result.failed_count}")
            for _page_num, msg in result.failed_pages:
                lines.append(f"  • {msg}")
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
        self._summary_label.setText(f"İşlem başlatılamadı.\n\n{message}")
        self._log(f"HATA: {message}")
        QMessageBox.critical(self, "Hata", message)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _reset_for_new_export(self) -> None:
        """Prepare UI state for a fresh export run."""
        self._progress_bar.setValue(0)
        self._status_label.setText("Başlatılıyor…")
        self._summary_label.setText(
            "İşlem sürüyor...\n\nTamamlandığında başarı, hata ve klasör bilgisi burada görünecek."
        )
        self._log_area.clear()
        self._open_folder_btn.setEnabled(False)
        self._last_output_folder = None

        self._start_btn.setEnabled(False)
        self._cancel_btn.setEnabled(True)
        self._pdf_select_btn.setEnabled(False)
        self._pdf_clear_btn.setEnabled(False)
        self._output_dir_btn.setEnabled(False)
        self._quality_combo.setEnabled(False)

    def _set_ui_idle(self) -> None:
        """Restore interactive UI state after export ends."""
        self._start_btn.setEnabled(True)
        self._cancel_btn.setEnabled(False)
        self._pdf_select_btn.setEnabled(True)
        self._pdf_clear_btn.setEnabled(True)
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

    def _set_selection_summary(self) -> None:
        """Refresh the compact selection summary shown under the drop zone."""
        if not self._pending_files:
            self._selection_summary.setText("Henüz PDF seçilmedi.")
            return

        if len(self._pending_files) == 1:
            pdf = self._pending_files[0]
            self._selection_summary.setText(f"1 PDF secildi: {pdf.name}")
            return

        names = [path.name for path in self._pending_files[:3]]
        remaining = len(self._pending_files) - len(names)
        summary = " · ".join(names)
        if remaining > 0:
            summary = f"{summary} · +{remaining} dosya daha"

        self._selection_summary.setText(f"{len(self._pending_files)} PDF secildi: {summary}")

    def _set_summary_placeholder(self) -> None:
        """Show a friendly empty state until the first export completes."""
        self._summary_label.setText(
            "Henüz işlem yapılmadı.\n\nDönüştürme tamamlandığında klasör yolu, sayfa sayısı ve olası hatalar burada listelenecek."
        )
