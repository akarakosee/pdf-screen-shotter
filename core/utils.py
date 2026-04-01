"""
Shared utility functions for file-system operations and naming.

These helpers are intentionally pure functions (no side-effects beyond
file-system writes) so they remain easy to test and reuse.
"""

from __future__ import annotations

import os
import re
import unicodedata
from pathlib import Path

from core.config import OUTPUT_FOLDER_SUFFIX, PAGE_FILENAME_PREFIX


# ---------------------------------------------------------------------------
# Folder helpers
# ---------------------------------------------------------------------------

def sanitize_folder_name(name: str) -> str:
    """Remove or replace characters that are unsafe in folder names.

    Preserves Unicode letters (including Turkish characters) but strips
    control characters and replaces filesystem-unfriendly symbols.
    """
    # Normalize unicode to NFC for consistent representation
    name = unicodedata.normalize("NFC", name)
    # Replace characters that are problematic on Windows / macOS / Linux
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", name)
    # Collapse multiple underscores / spaces
    name = re.sub(r"[_\s]+", "_", name)
    # Strip leading/trailing underscores and dots
    name = name.strip("_. ")
    return name if name else "output"


def derive_output_folder_name(pdf_path: str | Path) -> str:
    """Derive a base output folder name from a PDF filename.

    Example:
        ``rapor.pdf`` → ``rapor_pages``
        ``my report (v2).pdf`` → ``my_report_(v2)_pages``
    """
    stem = Path(pdf_path).stem
    sanitized = sanitize_folder_name(stem)
    return f"{sanitized}{OUTPUT_FOLDER_SUFFIX}"


def create_unique_folder(parent_dir: str | Path, folder_name: str) -> Path:
    """Create a uniquely-named folder, handling name collisions.

    If ``folder_name`` already exists under ``parent_dir``, appends
    ``_1``, ``_2``, … until a free name is found.

    Returns:
        The ``Path`` of the created directory.

    Raises:
        OSError: If the directory cannot be created for any reason
                 other than name collision.
    """
    parent = Path(parent_dir)
    candidate = parent / folder_name

    if not candidate.exists():
        candidate.mkdir(parents=True, exist_ok=False)
        return candidate

    counter = 1
    while True:
        numbered = parent / f"{folder_name}_{counter}"
        if not numbered.exists():
            numbered.mkdir(parents=True, exist_ok=False)
            return numbered
        counter += 1
        # Safety valve — extremely unlikely but prevents infinite loop
        if counter > 10_000:
            raise OSError(
                f"Could not create a unique folder for '{folder_name}' "
                f"under '{parent}' after 10 000 attempts."
            )


# ---------------------------------------------------------------------------
# Filename helpers
# ---------------------------------------------------------------------------

def format_page_filename(
    page_number: int,
    total_pages: int,
    extension: str = "png",
) -> str:
    """Generate a zero-padded page filename.

    Padding width adapts to ``total_pages`` but is never less than 3 digits.

    Examples:
        format_page_filename(1, 40)    → "sayfa_001.png"
        format_page_filename(350, 350) → "sayfa_350.png"
        format_page_filename(1, 1200)  → "sayfa_0001.png"
    """
    min_width = 3
    width = max(min_width, len(str(total_pages)))
    padded = str(page_number).zfill(width)
    ext = extension.lstrip(".")
    return f"{PAGE_FILENAME_PREFIX}_{padded}.{ext}"


# ---------------------------------------------------------------------------
# Duration formatting
# ---------------------------------------------------------------------------

def format_duration(seconds: float) -> str:
    """Format a duration in seconds into a human-readable Turkish string.

    Examples:
        format_duration(3.7)   → "3.7 saniye"
        format_duration(72.1)  → "1 dakika 12.1 saniye"
        format_duration(0.45)  → "0.5 saniye"
    """
    if seconds < 60:
        return f"{seconds:.1f} saniye"
    minutes = int(seconds // 60)
    remaining = seconds % 60
    return f"{minutes} dakika {remaining:.1f} saniye"
