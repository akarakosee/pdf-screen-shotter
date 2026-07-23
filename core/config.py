"""
Application-wide configuration constants and quality presets.

All rendering quality presets and default values are defined here
so they can be referenced consistently across the service and UI layers.
"""

from __future__ import annotations

APP_NAME: str = "PDF Screen Shotter"
APP_VERSION: str = "1.0.0"

# ---------------------------------------------------------------------------
# Quality presets — mapping human-readable label → DPI value
# Keys are Turkish UI labels; values are the rendering resolution.
# ---------------------------------------------------------------------------
QUALITY_PRESETS: dict[str, int] = {
    "Düşük (100 DPI)": 100,
    "Orta (150 DPI)": 150,
    "Yüksek (200 DPI)": 200,
    "Çok Yüksek (300 DPI)": 300,
}

DEFAULT_QUALITY_LABEL: str = "Yüksek (200 DPI)"
DEFAULT_DPI: int = QUALITY_PRESETS[DEFAULT_QUALITY_LABEL]

# ---------------------------------------------------------------------------
# Output defaults
# ---------------------------------------------------------------------------
DEFAULT_IMAGE_FORMAT: str = "png"
PAGE_FILENAME_PREFIX: str = "sayfa"
OUTPUT_FOLDER_SUFFIX: str = "_pages"

# ---------------------------------------------------------------------------
# UI constants
# ---------------------------------------------------------------------------
WINDOW_MIN_WIDTH: int = 1180
WINDOW_MIN_HEIGHT: int = 760
