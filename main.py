#!/usr/bin/env python3
"""
PDF Screen Shotter — entry point.

Initializes logging, creates the PySide6 application, applies the
application-wide stylesheet, and shows the main window.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import PySide6
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont
from PySide6.QtWidgets import QApplication

from core.config import APP_NAME
from core.logger import setup_logging

# Ensure Qt can find its platform plugins when running inside a virtualenv.
# This resolves the "Could not find the Qt platform plugin 'cocoa'" error.
_pyside6_dir = Path(PySide6.__path__[0])
_qt_plugin_dir = _pyside6_dir / "Qt" / "plugins"
if _qt_plugin_dir.is_dir():
    os.environ.setdefault("QT_PLUGIN_PATH", str(_qt_plugin_dir))


def _build_stylesheet() -> str:
    """Return the application-wide QSS stylesheet."""
    return """
    /* ---- Global ---- */
    QWidget {
        font-family: "SF Pro Text", "Helvetica Neue", "Segoe UI", Arial, sans-serif;
        font-size: 13px;
        color: #e0e0e0;
        background-color: #1e1e2e;
    }

    /* ---- Group Boxes ---- */
    QGroupBox {
        border: 1px solid #3a3a5c;
        border-radius: 8px;
        margin-top: 14px;
        padding: 14px 12px 10px 12px;
        font-weight: 600;
        color: #b0b0d0;
    }
    QGroupBox::title {
        subcontrol-origin: margin;
        subcontrol-position: top left;
        padding: 2px 8px;
        background-color: #1e1e2e;
        left: 10px;
    }

    /* ---- Line Edits ---- */
    QLineEdit {
        background-color: #2a2a3e;
        border: 1px solid #3a3a5c;
        border-radius: 6px;
        padding: 7px 10px;
        color: #e0e0e0;
        selection-background-color: #6c63ff;
    }
    QLineEdit:read-only {
        color: #a0a0c0;
    }

    /* ---- Buttons ---- */
    QPushButton {
        background-color: #2d2d44;
        border: 1px solid #3a3a5c;
        border-radius: 6px;
        padding: 7px 18px;
        color: #d0d0e8;
        min-width: 80px;
    }
    QPushButton:hover {
        background-color: #3a3a56;
        border-color: #6c63ff;
    }
    QPushButton:pressed {
        background-color: #4a4a6a;
    }
    QPushButton:disabled {
        background-color: #1a1a2a;
        color: #555570;
        border-color: #2a2a3e;
    }
    QPushButton#primaryButton {
        background-color: #6c63ff;
        border: none;
        color: #ffffff;
        font-weight: 600;
        padding: 8px 28px;
    }
    QPushButton#primaryButton:hover {
        background-color: #7b73ff;
    }
    QPushButton#primaryButton:pressed {
        background-color: #5a52e0;
    }
    QPushButton#primaryButton:disabled {
        background-color: #3a3a5c;
        color: #555570;
    }
    QPushButton#cancelBtn {
        background-color: #44293a;
        border: 1px solid #6b3a4a;
        color: #e08090;
    }
    QPushButton#cancelBtn:hover {
        background-color: #5a3548;
        border-color: #e74c3c;
    }
    QPushButton#cancelBtn:disabled {
        background-color: #1a1a2a;
        color: #555570;
        border-color: #2a2a3e;
    }
    QPushButton#openFolderBtn {
        background-color: #1a3a2a;
        border: 1px solid #2a6a3a;
        color: #80e0a0;
    }
    QPushButton#openFolderBtn:hover {
        background-color: #2a4a3a;
        border-color: #40c060;
    }
    QPushButton#openFolderBtn:disabled {
        background-color: #1a1a2a;
        color: #555570;
        border-color: #2a2a3e;
    }

    /* ---- Combo Box ---- */
    QComboBox {
        background-color: #2a2a3e;
        border: 1px solid #3a3a5c;
        border-radius: 6px;
        padding: 6px 10px;
        color: #e0e0e0;
        min-width: 160px;
    }
    QComboBox::drop-down {
        border: none;
        width: 28px;
    }
    QComboBox QAbstractItemView {
        background-color: #2a2a3e;
        border: 1px solid #3a3a5c;
        color: #e0e0e0;
        selection-background-color: #6c63ff;
        selection-color: #ffffff;
    }

    /* ---- Progress Bar ---- */
    QProgressBar {
        background-color: #2a2a3e;
        border: 1px solid #3a3a5c;
        border-radius: 6px;
        text-align: center;
        color: #e0e0e0;
        height: 22px;
    }
    QProgressBar::chunk {
        background: qlineargradient(
            x1:0, y1:0, x2:1, y2:0,
            stop:0 #6c63ff, stop:1 #a78bfa
        );
        border-radius: 5px;
    }

    /* ---- Log Area ---- */
    QTextEdit#logArea {
        background-color: #16162a;
        border: 1px solid #2a2a3e;
        border-radius: 6px;
        padding: 8px;
        font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
        font-size: 12px;
        color: #b0b0d0;
    }

    /* ---- Status & Summary Labels ---- */
    QLabel#statusLabel {
        color: #a0a0c0;
        font-size: 12px;
        padding-left: 4px;
    }
    QLabel#summaryLabel {
        color: #c0c0e0;
        font-size: 12px;
        padding: 4px;
        line-height: 1.5;
    }

    /* ---- Scrollbar ---- */
    QScrollBar:vertical {
        background: #1e1e2e;
        width: 10px;
        border-radius: 5px;
    }
    QScrollBar::handle:vertical {
        background: #3a3a5c;
        border-radius: 5px;
        min-height: 30px;
    }
    QScrollBar::handle:vertical:hover {
        background: #5a5a7c;
    }
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
        height: 0;
    }
    """


def main() -> None:
    """Application entry point."""
    setup_logging()

    # ---- Resolve PySide6 Qt plugin paths before QApplication creation ----
    qt_dir = str(_pyside6_dir / "Qt")
    qt_plugin_dir = str(_qt_plugin_dir)

    # Force environment variables
    os.environ["QT_PLUGIN_PATH"] = qt_plugin_dir
    os.environ["QT_QPA_PLATFORM_PLUGIN_PATH"] = str(
        _pyside6_dir / "Qt" / "plugins" / "platforms"
    )

    # Pre-set library paths via QApplication static method (before construction)
    QApplication.setLibraryPaths([qt_plugin_dir, qt_dir])

    app = QApplication(sys.argv)
    app.addLibraryPath(qt_plugin_dir)
    app.setApplicationName(APP_NAME)
    app.setStyle("Fusion")
    app.setStyleSheet(_build_stylesheet())

    # Import here to avoid circular imports and ensure logging is ready
    from ui.main_window import MainWindow

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
