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

from PySide6.QtCore import QLibraryInfo
from PySide6.QtWidgets import QApplication

from core.config import APP_NAME
from core.logger import setup_logging

def _load_stylesheet() -> str:
    """Load the application-wide QSS stylesheet from file."""
    qss_path = Path(__file__).parent / "ui" / "styles.qss"
    if qss_path.exists():
        return qss_path.read_text(encoding="utf-8")
    return ""


def _configure_qt_runtime() -> None:
    """Seed Qt plugin paths from the active PySide6 installation."""
    plugins_path = Path(QLibraryInfo.path(QLibraryInfo.LibraryPath.PluginsPath))
    if not plugins_path.is_dir():
        return

    os.environ.setdefault("QT_PLUGIN_PATH", str(plugins_path))

    platforms_path = plugins_path / "platforms"
    if platforms_path.is_dir():
        os.environ.setdefault("QT_QPA_PLATFORM_PLUGIN_PATH", str(platforms_path))


def main() -> None:
    """Application entry point."""
    setup_logging()
    _configure_qt_runtime()

    app = QApplication(sys.argv)
    app.setApplicationName(APP_NAME)
    app.setStyle("Fusion")
    app.setStyleSheet(_load_stylesheet())

    # Import here to avoid circular imports and ensure logging is ready
    from ui.main_window import MainWindow

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
