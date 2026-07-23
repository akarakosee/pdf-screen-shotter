// Output naming rules (PRD R6) — consistent with the desktop app's folder
// naming: `<name>_pages.zip` containing `<name>_page_001.png` …
// Turkish/special characters are sanitized to filesystem-safe names.

const UNSAFE_CHARS = /[\\/:*?"<>|]/g;
const CONTROL_CHARS = /[\x00-\x1f]/g;

/** Strip the extension and make a name safe for ZIP entries and downloads. */
export function sanitizeBaseName(fileName: string): string {
  const base = fileName.replace(/\.[^.]*$/, '');
  const cleaned = base
    .replace(CONTROL_CHARS, '')
    .replace(UNSAFE_CHARS, '_')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : 'document';
}

export function pageFileName(base: string, page: number, format: 'png' | 'jpg'): string {
  return `${base}_page_${String(page).padStart(3, '0')}.${format}`;
}

export function zipFileName(base: string): string {
  return `${base}_pages.zip`;
}

export function mergedFileName(): string {
  return 'merged.pdf';
}
