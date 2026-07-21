// Type contracts — SISTEM_TASARIMI.md §3.1 (data model) and §3.3 (worker protocol).
// Implement exactly; these are shared by UI, JobController, and the worker.

export type ToolId = 'pdf-to-png' | 'pdf-to-jpg' | 'merge' | 'split' | 'rotate' | 'img-to-pdf';

export type FileStatus = 'queued' | 'valid' | 'invalid' | 'processing' | 'done' | 'failed';

export interface ExportOptions {
  dpi: 100 | 150 | 200 | 300;
  format: 'png' | 'jpg';
  jpgQuality?: number; // default 0.8
  pageRange?: string; // "1-5,8,11-13" — parsed to number[] by the range parser
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
  output: Blob;
  outputName: string;
  cancelled: boolean;
}

// ── Worker message protocol (§3.3) ──────────────────────────────────────────

export interface FileMeta {
  fileId: string;
  name: string;
}

export type UiToWorkerMessage =
  | { type: 'start'; files: ArrayBuffer[]; meta: FileMeta[]; options: ExportOptions }
  | { type: 'preview'; file: ArrayBuffer; dpi: number }
  | { type: 'cancel' };

export type WorkerToUiMessage =
  | { type: 'ready' }
  | { type: 'preview-done'; blob: Blob }
  | { type: 'progress'; data: ProgressData }
  | { type: 'page-error'; error: PageError } // page skipped, run continues
  | { type: 'file-error'; fileId: string; message: string } // file skipped, next file
  | { type: 'done'; result: ExportResult }
  | { type: 'fatal'; message: string }; // JobController terminates + respawns worker
