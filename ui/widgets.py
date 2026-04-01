"""
Reusable widget factory functions for consistent styling.

Every factory returns a ready-to-use PySide6 widget with appropriate
sizing, fonts, and object names for stylesheet targeting.
"""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QComboBox,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QProgressBar,
    QPushButton,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)


def make_label(text: str, *, bold: bool = False, object_name: str = "") -> QLabel:
    """Create a styled ``QLabel``."""
    label = QLabel(text)
    if bold:
        label.setStyleSheet("font-weight: 600;")
    if object_name:
        label.setObjectName(object_name)
    return label


def make_line_edit(
    *,
    placeholder: str = "",
    read_only: bool = False,
    object_name: str = "",
) -> QLineEdit:
    """Create a styled ``QLineEdit``."""
    edit = QLineEdit()
    edit.setPlaceholderText(placeholder)
    edit.setReadOnly(read_only)
    if object_name:
        edit.setObjectName(object_name)
    return edit


def make_button(
    text: str,
    *,
    object_name: str = "",
    enabled: bool = True,
    primary: bool = False,
) -> QPushButton:
    """Create a styled ``QPushButton``.

    If *primary* is ``True`` the button receives the ``primaryButton``
    object name for stylesheet differentiation.
    """
    btn = QPushButton(text)
    btn.setEnabled(enabled)
    if primary:
        object_name = object_name or "primaryButton"
    if object_name:
        btn.setObjectName(object_name)
    return btn


def make_combo_box(
    items: list[str],
    *,
    default: str = "",
    object_name: str = "",
) -> QComboBox:
    """Create a ``QComboBox`` pre-populated with *items*."""
    combo = QComboBox()
    combo.addItems(items)
    if default and default in items:
        combo.setCurrentText(default)
    if object_name:
        combo.setObjectName(object_name)
    return combo


def make_progress_bar(*, object_name: str = "exportProgressBar") -> QProgressBar:
    """Create a ``QProgressBar`` with range 0–100."""
    bar = QProgressBar()
    bar.setRange(0, 100)
    bar.setValue(0)
    bar.setTextVisible(True)
    bar.setObjectName(object_name)
    return bar


def make_log_area(*, object_name: str = "logArea") -> QTextEdit:
    """Create a read-only ``QTextEdit`` used as a scrolling log pane."""
    area = QTextEdit()
    area.setReadOnly(True)
    area.setObjectName(object_name)
    area.setMinimumHeight(140)
    return area


def make_group_box(title: str, layout: QVBoxLayout | QHBoxLayout) -> QGroupBox:
    """Wrap a layout inside a titled ``QGroupBox``."""
    group = QGroupBox(title)
    group.setLayout(layout)
    return group


def make_row(*widgets: QWidget, spacing: int = 8) -> QHBoxLayout:
    """Create an ``QHBoxLayout`` containing the given widgets."""
    row = QHBoxLayout()
    row.setSpacing(spacing)
    for w in widgets:
        row.addWidget(w)
    return row
