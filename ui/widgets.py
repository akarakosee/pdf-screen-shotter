"""
Reusable widget factory functions for consistent styling.

Every factory returns a ready-to-use PySide6 widget with appropriate
sizing, fonts, and object names for stylesheet targeting.
"""

from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QComboBox,
    QFrame,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QProgressBar,
    QPushButton,
    QTextEdit,
    QVBoxLayout,
    QWidget,
    QSizePolicy,
)


class SectionCard(QFrame):
    """Simple section container with a title, description, and content area."""

    def __init__(
        self,
        title: str,
        description: str = "",
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        self.setObjectName("sectionCard")
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Preferred)

        shell = QVBoxLayout(self)
        shell.setContentsMargins(18, 18, 18, 18)
        shell.setSpacing(12)

        header = QVBoxLayout()
        header.setContentsMargins(0, 0, 0, 0)
        header.setSpacing(2)

        title_label = QLabel(title)
        title_label.setObjectName("sectionTitle")
        header.addWidget(title_label)

        if description:
            description_label = QLabel(description)
            description_label.setObjectName("sectionDescription")
            description_label.setWordWrap(True)
            header.addWidget(description_label)

        shell.addLayout(header)

        self.content_layout = QVBoxLayout()
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.setSpacing(12)
        shell.addLayout(self.content_layout)


class DropZone(QFrame):
    """A custom widget that handles drag-and-drop of PDF files."""

    filesDropped = Signal(list)
    clicked = Signal()

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setObjectName("dropZone")
        self.setAcceptDrops(True)
        self.setFixedHeight(112)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 18, 20, 18)
        layout.setAlignment(Qt.AlignCenter)

        self.label = QLabel("PDF dosyalarını sürükleyip bırak\nveya Gözat'a tıkla")
        self.label.setObjectName("dropZoneLabel")
        self.label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.label)

    def dragEnterEvent(self, event) -> None:
        if event.mimeData().hasUrls() and any(
            url.isLocalFile() and url.toLocalFile().lower().endswith(".pdf")
            for url in event.mimeData().urls()
        ):
            event.acceptProposedAction()
            self.setStyleSheet("background-color: #1e1e22; border-color: #3b82f6;")
        else:
            event.ignore()

    def dragLeaveEvent(self, event) -> None:
        self.setStyleSheet("")
        event.accept()

    def dropEvent(self, event) -> None:
        self.setStyleSheet("")
        urls = event.mimeData().urls()
        files = [u.toLocalFile() for u in urls if u.toLocalFile().lower().endswith(".pdf")]
        if files:
            self.filesDropped.emit(files)
            event.acceptProposedAction()
        else:
            event.ignore()

    def mousePressEvent(self, event) -> None:
        """Emit a click signal so the drop zone can act like a file picker."""
        if event.button() == Qt.LeftButton:
            self.clicked.emit()
            event.accept()
            return
        super().mousePressEvent(event)


def make_drop_zone() -> DropZone:
    """Create a styled ``DropZone``."""
    return DropZone()


def make_section_card(title: str, description: str = "") -> SectionCard:
    """Create a styled section card used across the main window."""
    return SectionCard(title, description)


def make_preview_area() -> QLabel:
    """Create a styled ``QLabel`` for displaying a PDF page preview."""
    label = QLabel("Önizleme Yok")
    label.setAlignment(Qt.AlignCenter)
    label.setObjectName("previewArea")
    label.setMinimumSize(220, 200)
    label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
    return label


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
    edit.setMinimumHeight(42)
    edit.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
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
    btn.setMinimumHeight(42)
    btn.setMinimumWidth(112)
    btn.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Fixed)
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
    combo.setMinimumHeight(42)
    combo.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
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
    bar.setTextVisible(False)
    bar.setFixedHeight(18)
    bar.setObjectName(object_name)
    return bar


def make_log_area(*, object_name: str = "logArea") -> QTextEdit:
    """Create a read-only ``QTextEdit`` used as a scrolling log pane."""
    area = QTextEdit()
    area.setReadOnly(True)
    area.setObjectName(object_name)
    area.setMinimumHeight(120)
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
