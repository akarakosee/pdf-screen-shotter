// Type contracts — SISTEM_TASARIMI.md §3.1 (data model) and §3.3 (worker protocol).
// Implement exactly; these are shared by UI, JobController, and the worker.

export type ToolId = 'pdf-to-png' | 'pdf-to-jpg' | 'merge' | 'split' | 'rotate' | 'img-to-pdf';

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
  | { type: 'demo-render'; file: ArrayBuffer; dpi: number; maxPages: number } // ADR-006: homepage live hero demo
  | { type: 'cancel' };

export type WorkerToUiMessage =
  | { type: 'ready' }
  | { type: 'preview-page-done'; requestId: string; page: number; blob: Blob } // ADR-007
  | { type: 'preview-page-error'; requestId: string; page: number; message: string } // ADR-007: a single bad thumbnail never tears down the worker
  | { type: 'inspect-done'; fileId: string; pageCount: number } // ADR-003; errors reuse file-error
  | { type: 'progress'; data: ProgressData }
  | { type: 'page-error'; error: PageError } // page skipped, run continues
  | { type: 'file-error'; fileId: string; message: string } // file skipped, next file
  | { type: 'done'; result: ExportResult }
  | { type: 'demo-page'; page: number; blob: Blob } // ADR-006: one real thumbnail arrived
  | { type: 'demo-done' } // ADR-006: demo finished
  | { type: 'demo-error'; message: string } // ADR-006: demo failed, never fatal
  | { type: 'fatal'; message: string }; // JobController terminates + respawns worker
