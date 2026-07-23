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
        pdf_paths:    List of absolute paths to the source PDFs.
        output_dir:   Parent directory where output folders will be created.
        dpi:          Rendering resolution in dots per inch.
        image_format: Output image format (e.g. ``"png"``).
    """

    pdf_paths: list[Path]
    output_dir: Path
    dpi: int = DEFAULT_DPI
    image_format: str = DEFAULT_IMAGE_FORMAT

    def __post_init__(self) -> None:
        # Coerce str paths to Path objects for downstream consistency
        if isinstance(self.pdf_paths, (str, Path)):
            object.__setattr__(self, "pdf_paths", [Path(self.pdf_paths)])
        else:
            object.__setattr__(
                self, "pdf_paths", [Path(p) if isinstance(p, str) else p for p in self.pdf_paths],
            )

        if isinstance(self.output_dir, str):
            object.__setattr__(self, "output_dir", Path(self.output_dir))
