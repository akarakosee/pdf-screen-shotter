// Product constants — counterpart of the desktop app's core/config.py.

export const DPI_PRESETS = [100, 150, 200, 300] as const;
export const DEFAULT_DPI = 150; // marked "Recommended" in the UI
export const DEFAULT_JPG_QUALITY = 0.8;
export const PREVIEW_DPI = 72;

// Memory guard rail (SISTEM_TASARIMI §3.4): warn when a single rendered page
// bitmap is estimated above this many bytes (e.g. A0 poster @300 DPI).
export const PAGE_BITMAP_WARN_BYTES = 500 * 1024 * 1024;
