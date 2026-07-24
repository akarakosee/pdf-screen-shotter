// JobController — queue, cancel, worker lifecycle (SISTEM_TASARIMI §2.2/§3.3).
// Owns the single render worker. On `fatal` it terminates and respawns the
// worker so one bad PDF cannot take down the tab.
//
// Respawn is capped: if the worker fails to even initialize (a broken module
// in its graph, not a runtime crash after loading), every respawn re-fetches
// the identical broken graph and fails identically — this happened for real
// with an unbundled worker dependency, producing an unbounded loop of failed
// requests. After MAX_FATALS_PER_WINDOW fatals within FATAL_WINDOW_MS, stop
// respawning and surface onUnavailable once instead of retrying forever.

import type {
  ExportOptions,
  ExportResult,
  FileMeta,
  MergeResult,
  PageError,
  PerFileExportOptions,
  ProgressData,
  SplitResult,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from '../core/types';
import { PREVIEW_DPI } from '../core/config';

export interface JobEvents {
  onReady?: () => void;
  onInspect?: (fileId: string, pageCount: number) => void;
  onProgress?: (data: ProgressData) => void;
  onPageError?: (error: PageError) => void;
  onFileError?: (fileId: string, message: string) => void;
  onDone?: (result: ExportResult) => void;
  /** ADR-008: one file finished opening during a merge run. */
  onMergeProgress?: (fileIndex: number, totalFiles: number) => void;
  /** ADR-008: the merge finished (or was cancelled). */
  onMergeDone?: (result: MergeResult) => void;
  onSplitProgress?: (extractedPages: number, totalSelected: number) => void;
  onSplitDone?: (result: SplitResult) => void;
  onFatal?: (message: string) => void;
  /** Fired once, instead of onFatal, when the worker has failed too many
   * times in a row and JobController has given up respawning it. Every
   * method becomes a no-op after this until the page is reloaded. */
  onUnavailable?: (message: string) => void;
  /** ADR-006: one real thumbnail from the homepage live demo arrived. */
  onDemoPage?: (page: number, blob: Blob) => void;
  /** ADR-006: the demo finished rendering all its pages. */
  onDemoDone?: () => void;
  /** ADR-006: the demo failed — never fatal, caller falls back to a static image. */
  onDemoError?: (message: string) => void;
}

export class JobController {
  private static readonly MAX_FATALS_PER_WINDOW = 3;
  private static readonly FATAL_WINDOW_MS = 10_000;
  private static nextRequestId = 0;

  private worker: Worker | null = null;
  private events: JobEvents;
  private running = false;
  private disabled = false;
  private fatalTimestamps: number[] = [];
  private pendingPreviewPages = new Map<
    string,
    { resolve: (blob: Blob) => void; reject: (err: Error) => void }
  >();

  constructor(events: JobEvents) {
    this.events = events;
  }

  /** Idempotent. Called from preload triggers (hover/dragenter) so the WASM is
   * usually warm before the user drops a file (ADR-001 preload strategy). */
  preload(): void {
    if (this.disabled) return;
    this.ensureWorker();
  }

  /** ADR-003: page count without rendering; errors arrive as file-error. */
  async inspect(fileId: string, file: File): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'inspect', fileId, file: buf }, [buf]);
  }

  /** ADR-007: one filmstrip thumbnail. Always renders at the fixed
   * PREVIEW_DPI (72), independent of the user's chosen export DPI — thumbnails
   * stay small and fast regardless of what resolution will actually be
   * exported. Correlated by requestId so many concurrent page requests
   * (scrolling the filmstrip, multiple queued files) resolve independently. */
  previewPage(file: File, page: number): Promise<Blob> {
    if (this.disabled) return Promise.reject(new Error('disabled'));
    const requestId = `p${++JobController.nextRequestId}`;
    const result = new Promise<Blob>((resolve, reject) => {
      this.pendingPreviewPages.set(requestId, { resolve, reject });
    });
    void file.arrayBuffer().then((buf) => {
      this.post({ type: 'preview-page', file: buf, dpi: PREVIEW_DPI, page, requestId }, [buf]);
    });
    return result;
  }

  /** ADR-006: renders up to maxPages of a bundled sample PDF for the
   * homepage's live hero demo. Never throws — failures arrive as
   * onDemoError, same scoped-error pattern as previewPage(). */
  async demoRender(file: File, dpi: number, maxPages: number): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'demo-render', file: buf, dpi, maxPages }, [buf]);
  }

  /** Each file carries its own render settings (dpi/pageRange/backgroundColor);
   * `shared` is the batch-level format and delivery packaging (ADR-008). */
  async start(
    files: (PerFileExportOptions & { file: File; fileId: string })[],
    shared: { format: ExportOptions['format']; jpgQuality?: number; deliveryMethod?: ExportOptions['deliveryMethod'] },
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    const perFileOptions: PerFileExportOptions[] = files.map((f) => ({
      dpi: f.dpi,
      pageRange: f.pageRange,
      backgroundColor: f.backgroundColor,
    }));
    this.post({ type: 'start', files: buffers, meta, perFileOptions, ...shared }, buffers);
  }

  /** ADR-008: combines every given file's pages, in array order, into one
   * merged PDF. Unlike start(), there is no per-file render config — merge
   * has no DPI/page-range/background concept. */
  async mergeFiles(files: { file: File; fileId: string }[]): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    this.post({ type: 'merge-start', files: buffers, meta }, buffers);
  }

  async splitFiles(file: File, fileId: string, selectedPages: number[], mode: 'extract' | 'burst'): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'split-start', file: buf, meta: { fileId, name: file.name }, selectedPages, mode }, [buf]);
  }

  cancel(): void {
    if (this.disabled) return;
    this.post({ type: 'cancel' });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private post(msg: UiToWorkerMessage, transfer: Transferable[] = []): void {
    if (this.disabled) return;
    this.ensureWorker().postMessage(msg, transfer);
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../workers/render.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (ev: MessageEvent<WorkerToUiMessage>) => this.handle(ev.data);
    worker.onerror = () => this.handleFatal('worker crashed');
    this.worker = worker;
    return worker;
  }

  private handle(msg: WorkerToUiMessage): void {
    switch (msg.type) {
      case 'ready':
        this.events.onReady?.();
        break;
      case 'preview-page-done':
        this.pendingPreviewPages.get(msg.requestId)?.resolve(msg.blob);
        this.pendingPreviewPages.delete(msg.requestId);
        break;
      case 'preview-page-error':
        this.pendingPreviewPages.get(msg.requestId)?.reject(new Error(msg.message));
        this.pendingPreviewPages.delete(msg.requestId);
        break;
      case 'inspect-done':
        this.events.onInspect?.(msg.fileId, msg.pageCount);
        break;
      case 'progress':
        this.events.onProgress?.(msg.data);
        break;
      case 'page-error':
        this.events.onPageError?.(msg.error);
        break;
      case 'file-error':
        this.events.onFileError?.(msg.fileId, msg.message);
        break;
      case 'done':
        this.running = false;
        this.events.onDone?.(msg.result);
        break;
      case 'merge-progress':
        this.events.onMergeProgress?.(msg.fileIndex, msg.totalFiles);
        break;
      case 'merge-done':
        this.running = false;
        this.events.onMergeDone?.(msg.result);
        break;
      case 'split-progress':
        this.events.onSplitProgress?.(msg.extractedPages, msg.totalSelected);
        break;
      case 'split-done':
        this.running = false;
        this.events.onSplitDone?.(msg.result);
        break;
      case 'fatal':
        this.handleFatal(msg.message);
        break;
      case 'demo-page':
        this.events.onDemoPage?.(msg.page, msg.blob);
        break;
      case 'demo-done':
        this.events.onDemoDone?.();
        break;
      case 'demo-error':
        this.events.onDemoError?.(msg.message);
        break;
    }
  }

  private handleFatal(message: string): void {
    this.running = false;
    this.dispose();
    for (const { reject } of this.pendingPreviewPages.values()) reject(new Error(message));
    this.pendingPreviewPages.clear();

    const now = Date.now();
    this.fatalTimestamps = [...this.fatalTimestamps, now].filter(
      (t) => now - t < JobController.FATAL_WINDOW_MS,
    );

    if (this.fatalTimestamps.length > JobController.MAX_FATALS_PER_WINDOW) {
      // Respawning has failed repeatedly in a short window — almost
      // certainly the same broken module graph every time, not independent
      // one-off crashes. Stop hammering it and surface a single error.
      this.disabled = true;
      this.events.onUnavailable?.(message);
      return;
    }

    this.ensureWorker(); // respawn — most fatals are a one-off (e.g. WASM OOM)
    this.events.onFatal?.(message);
  }
}
