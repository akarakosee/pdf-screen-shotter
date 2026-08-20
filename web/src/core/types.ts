// Type contracts — SISTEM_TASARIMI.md §3.1 (data model) and §3.3 (worker protocol).
// Implement exactly; these are shared by UI, JobController, and the worker.

export type ToolId = 'pdf-to-png' | 'pdf-to-jpg' | 'merge' | 'split' | 'organize' | 'rotate' | 'img-to-pdf' | 'flatten-pdf' | 'sign-pdf' | 'extract-images' | 'compress' | 'remove-blank' | 'reverse-pdf' | 'bates-numbering' | 'n-up' | 'pdf-a';

export type FileStatus = 'queued' | 'valid' | 'invalid' | 'processing' | 'done' | 'failed';

export interface ExportOptions {
  dpi: 100 | 150 | 200 | 300;
  format: 'png' | 'jpg';
  jpgQuality?: number; // default 0.8
  pageRange?: string; // "1-5,8,11-13" — parsed to number[] by the range parser
  backgroundColor?: 'white' | 'black' | 'transparent'; // default 'white'
  deliveryMethod?: 'zip' | 'individual'; // default 'zip'; single-page results are always a direct download regardless
}

// Per-file render settings (dpi/pageRange/backgroundColor) — each file in a
// batch renders with its own. deliveryMethod stays batch-level: it decides
// how the ONE final ExportResult is packaged, not how any single page
// renders, so mixing it per-file would mean one result trying to be both a
// ZIP and a loose-files list at once.
export interface PerFileExportOptions {
  dpi: 100 | 150 | 200 | 300;
  pageRange?: string;
  backgroundColor?: 'white' | 'black' | 'transparent';
}

export interface JobFile {
  id: string;
  file: File;
  pageCount: number;
  status: FileStatus;
}

export interface ProgressData {
  fileId: string;
  page: number;
  totalPages: number;
  fileIndex: number;
  totalFiles: number;
}

export interface PageError {
  fileId: string;
  page: number;
  message: string;
}

export interface ExportResult {
  totalPages: number;
  succeeded: number;
  failed: PageError[];
  durationMs: number;
  /** Present unless deliveryMethod: 'individual' produced multiple files —
   * in that case `pages` is set instead and `output`/`outputName` are omitted. */
  output?: Blob;
  outputName?: string;
  /** deliveryMethod: 'individual' with >1 successful page: one entry per file. */
  pages?: { name: string; blob: Blob }[];
  cancelled: boolean;
}

export interface MergeResult {
  totalPages: number;
  mergedFiles: number;
  durationMs: number;
  cancelled: boolean;
  /** Absent if every input file failed, or the merge was cancelled before any output existed. */
  output?: Blob;
  outputName?: string;
}

export interface SplitResult {
  totalPages: number;
  extractedPages: number;
  durationMs: number;
  cancelled: boolean;
  output?: Blob; // Present for 'extract' mode
  outputName?: string;
  pages?: { name: string; blob: Blob }[]; // Present for 'burst' mode
}

export interface OrganizeResult {
  totalPages: number;
  durationMs: number;
  cancelled: boolean;
  output?: Blob;
  outputName?: string;
}

export interface ExtractImagesResult {
  totalPages: number;
  extractedImages: number;
  durationMs: number;
  cancelled: boolean;
  output?: Blob; // ZIP file containing extracted images
  outputName?: string;
}

export interface CompressResult {
  originalSize: number;
  compressedSize: number;
  durationMs: number;
  cancelled: boolean;
  output?: Blob;
  outputName?: string;
}

// ── Worker message protocol (§3.3) ──────────────────────────────────────────

export interface FileMeta {
  fileId: string;
  name: string;
}

export type UiToWorkerMessage =
  | {
      type: 'start';
      files: ArrayBuffer[];
      meta: FileMeta[];
      perFileOptions: PerFileExportOptions[]; // aligned by index with files/meta
      format: 'png' | 'jpg';
      jpgQuality?: number;
      deliveryMethod?: 'zip' | 'individual';
    }
  | { type: 'preview-page'; file: ArrayBuffer; dpi: number; page: number; requestId: string } // ADR-007: filmstrip thumbnails
  | { type: 'inspect'; fileId: string; file: ArrayBuffer } // ADR-003: page count, no render
  | { type: 'merge-start'; files: ArrayBuffer[]; meta: FileMeta[] } // ADR-008: combine N PDFs into one
  | { type: 'split-start'; file: ArrayBuffer; meta: FileMeta; selectedPages: number[]; mode: 'extract' | 'burst' }
  | { type: 'organize-start'; file: ArrayBuffer; meta: FileMeta; pages: { pageIndex: number; rotation: number }[] }
  | {
      type: 'extract-images-start';
      file: ArrayBuffer;
      meta: FileMeta;
      format?: 'original' | 'png' | 'jpg';
      minSize?: number;
      pageRange?: 'all' | 'first';
    }
  | { type: 'compress-start'; file: ArrayBuffer; meta: FileMeta; level: 'recommended' | 'extreme' | 'fast' }
  | { type: 'remove-blank-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'reverse-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'bates-start'; file: ArrayBuffer; meta: FileMeta; prefix: string; suffix: string; startNumber: number; padding: number }
  | { type: 'n-up-start'; file: ArrayBuffer; meta: FileMeta; grid: 2 | 4 | 9 | 16 }
  | { type: 'pdf-a-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'repair-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'grayscale-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'resize-start'; file: ArrayBuffer; meta: FileMeta; pageSize: 'A4' | 'Letter' | 'Fit'; margin: number }
  | { type: 'split-half-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'add-margins-start'; file: ArrayBuffer; meta: FileMeta; marginPt: number }
  | { type: 'pdf-to-svg-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'split-by-size-start'; file: ArrayBuffer; meta: FileMeta; maxSizeMB: number }
  | { type: 'extract-by-keyword-start'; file: ArrayBuffer; meta: FileMeta; keyword: string; caseSensitive: boolean }
  | { type: 'mix-pdf-start'; files: ArrayBuffer[]; meta: FileMeta[] }
  | {
      type: 'remove-annotations-start';
      file: ArrayBuffer;
      meta: FileMeta;
      removeHighlights?: boolean;
      removeComments?: boolean;
      removeDrawings?: boolean;
      preserveLinks?: boolean;
    }
  | { type: 'pdf-to-webp-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'auto-crop-start'; file: ArrayBuffer; meta: FileMeta; padding?: number }
  | { type: 'extract-toc-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'overlay-pdf-start'; file: ArrayBuffer; meta: FileMeta; templateFile: ArrayBuffer; mode?: 'background' | 'foreground'; pageRange?: 'all' | 'first' | 'except-first' }
  | { type: 'change-bg-start'; file: ArrayBuffer; meta: FileMeta; hexColor: string }
  | { type: 'auto-redact-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'smart-markdown-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'contrast-enhancer-start'; file: ArrayBuffer; meta: FileMeta; brightness: number; contrast: number }
  | { type: 'pdf-to-html-start'; file: ArrayBuffer; meta: FileMeta }

  | { type: 'extract-fonts-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'remove-images-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'extract-urls-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'remove-duplicates-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'extract-attachments-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'extract-colors-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'remove-text-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'extract-javascript-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'split-bookmarks-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'split-blank-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'viewer-prefs-start'; file: ArrayBuffer; meta: FileMeta; prefs: { fullScreen: boolean; hideToolbar: boolean; hideMenubar: boolean; fitWindow: boolean; centerWindow: boolean } }
  | { type: 'extract-hidden-text-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'wipe-bookmarks-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'extract-tables-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'pdf-to-json-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'audio-reader-start'; file: ArrayBuffer; meta: FileMeta }
  | { type: 'scan-to-pdf-start'; files: ArrayBuffer[]; meta: FileMeta }
  | { type: 'demo-render'; file: ArrayBuffer; dpi: number; maxPages: number } // ADR-006: homepage live hero demo
  | { type: 'cancel' };

export type WorkerToUiMessage =
  | { type: 'ready' }
  | { type: 'preview-page-done'; requestId: string; page: number; blob: Blob } // ADR-007
  | { type: 'preview-page-error'; requestId: string; page: number; message: string } // ADR-007: a single bad thumbnail never tears down the worker
  | { type: 'inspect-done'; fileId: string; pageCount: number } // ADR-003; errors reuse file-error
  | { type: 'merge-progress'; fileIndex: number; totalFiles: number } // ADR-008
  | { type: 'merge-done'; result: MergeResult } // ADR-008
  | { type: 'split-progress'; extractedPages: number; totalSelected: number }
  | { type: 'split-done'; result: SplitResult }
  | { type: 'organize-progress'; processedPages: number; totalPages: number }
  | { type: 'organize-done'; result: OrganizeResult }
  | { type: 'extract-images-progress'; extractedImages: number; totalPages: number; currentPage: number }
  | { type: 'extract-images-done'; result: ExtractImagesResult }
  | { type: 'compress-done'; result: CompressResult }
  | { type: 'remove-blank-progress'; processedPages: number; totalPages: number }
  | { type: 'reverse-progress'; processedPages: number; totalPages: number }
  | { type: 'bates-progress'; processedPages: number; totalPages: number }
  | { type: 'n-up-progress'; processedPages: number; totalPages: number }
  | { type: 'pdf-a-progress'; processedPages: number; totalPages: number }
  | { type: 'split-half-progress'; processedPages: number; totalPages: number }
  | { type: 'add-margins-progress'; processedPages: number; totalPages: number }
  | { type: 'add-margins-done'; result: ExportResult }
  | { type: 'pdf-to-svg-progress'; processedPages: number; totalPages: number }
  | { type: 'pdf-to-svg-done'; result: ExportResult }
  | { type: 'split-by-size-progress'; processedPages: number; totalPages: number }
  | { type: 'split-by-size-done'; result: ExportResult }
  | { type: 'extract-by-keyword-progress'; phase: 'extracting' | 'splitting'; processed: number; total: number }
  | { type: 'extract-by-keyword-done'; result: ExportResult; pagesKept: number }
  | { type: 'mix-pdf-progress'; processedPages: number; totalPages: number }
  | { type: 'mix-pdf-done'; result: ExportResult }
  | { type: 'split-half-done'; result: ExportResult }
  | { type: 'remove-annotations-progress'; processedPages: number; totalPages: number }
  | { type: 'remove-annotations-done'; result: ExportResult }
  | { type: 'pdf-to-webp-progress'; processedPages: number; totalPages: number }
  | { type: 'pdf-to-webp-done'; result: ExportResult }
  | { type: 'auto-crop-progress'; processedPages: number; totalPages: number }
  | { type: 'auto-crop-done'; result: ExportResult }
  | { type: 'extract-toc-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-toc-done'; result: ExportResult }
  | { type: 'overlay-pdf-progress'; processedPages: number; totalPages: number }
  | { type: 'overlay-pdf-done'; result: ExportResult }
  | { type: 'change-bg-progress'; processedPages: number; totalPages: number }
  | { type: 'change-bg-done'; result: ExportResult }
  | { type: 'auto-redact-progress'; processedPages: number; totalPages: number }
  | { type: 'auto-redact-done'; result: ExportResult }
  | { type: 'smart-markdown-progress'; processedPages: number; totalPages: number }
  | { type: 'smart-markdown-done'; result: ExportResult }
  | { type: 'contrast-enhancer-progress'; processedPages: number; totalPages: number }
  | { type: 'contrast-enhancer-done'; result: ExportResult }
  | { type: 'pdf-to-html-progress'; processedPages: number; totalPages: number }
  | { type: 'pdf-to-html-done'; result: ExportResult }
  | { type: 'extract-fonts-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-fonts-done'; result: ExportResult }
  | { type: 'remove-images-progress'; processedPages: number; totalPages: number }
  | { type: 'remove-images-done'; result: ExportResult }
  | { type: 'extract-urls-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-urls-done'; result: ExportResult }
  | { type: 'remove-duplicates-progress'; processedPages: number; totalPages: number }
  | { type: 'remove-duplicates-done'; result: ExportResult }
  | { type: 'extract-attachments-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-attachments-done'; result: ExportResult }
  | { type: 'extract-colors-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-colors-done'; result: ExportResult }
  | { type: 'remove-text-progress'; processedPages: number; totalPages: number }
  | { type: 'remove-text-done'; result: ExportResult }
  | { type: 'extract-javascript-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-javascript-done'; result: ExportResult }
  | { type: 'split-bookmarks-progress'; processedPages: number; totalPages: number }
  | { type: 'split-bookmarks-done'; result: ExportResult }
  | { type: 'split-blank-progress'; processedPages: number; totalPages: number }
  | { type: 'split-blank-done'; result: ExportResult }
  | { type: 'viewer-prefs-done'; result: ExportResult }
  | { type: 'extract-hidden-text-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-hidden-text-done'; result: ExportResult }
  | { type: 'wipe-bookmarks-done'; result: ExportResult }
  | { type: 'extract-tables-progress'; processedPages: number; totalPages: number }
  | { type: 'extract-tables-done'; result: ExportResult }
  | { type: 'pdf-to-json-progress'; processedPages: number; totalPages: number }
  | { type: 'pdf-to-json-done'; result: ExportResult }
  | { type: 'audio-reader-progress'; processedPages: number; totalPages: number }
  | { type: 'audio-reader-done'; result: ExportResult }
  | { type: 'scan-to-pdf-progress'; processedPages: number; totalPages: number }
  | { type: 'scan-to-pdf-done'; result: ExportResult }
  | { type: 'progress'; data: ProgressData }
  | { type: 'page-error'; error: PageError } // page skipped, run continues
  | { type: 'file-error'; fileId: string; message: string } // file skipped, next file
  | { type: 'done'; result: ExportResult }
  | { type: 'demo-page'; page: number; blob: Blob } // ADR-006: one real thumbnail arrived
  | { type: 'demo-done' } // ADR-006: demo finished
  | { type: 'demo-error'; message: string } // ADR-006: demo failed, never fatal
  | { type: 'fatal'; message: string }; // JobController terminates + respawns worker
