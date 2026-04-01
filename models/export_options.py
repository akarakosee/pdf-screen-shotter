"""
Data class describing the user's chosen export settings.

Passed from the UI layer to the service layer to drive the export pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from core.config import DEFAULT_DPI, DEFAULT_IMAGE_FORMAT


@dataclass(frozen=True)
class ExportOptions:
    """Immutable bundle of export parameters.

    Attributes:
        pdf_path:     Absolute path to the source PDF.
        output_dir:   Parent directory where the output folder will be created.
        dpi:          Rendering resolution in dots per inch.
        image_format: Output image format (e.g. ``"png"``).
    """

    pdf_path: Path
    output_dir: Path
    dpi: int = DEFAULT_DPI
    image_format: str = DEFAULT_IMAGE_FORMAT

    def __post_init__(self) -> None:
        # Coerce str paths to Path objects for downstream consistency
        if isinstance(self.pdf_path, str):
            object.__setattr__(self, "pdf_path", Path(self.pdf_path))
        if isinstance(self.output_dir, str):
            object.__setattr__(self, "output_dir", Path(self.output_dir))
