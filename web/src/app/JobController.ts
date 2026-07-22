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
  PageError,
  ProgressData,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from '../core/types';
import { PREVIEW_DPI } from '../core/config';

export interface JobEvents {
  onReady?: () => void;
  onPreview?: (blob: Blob) => void;
  onPreviewError?: (message: string) => void;
  onInspect?: (fileId: string, pageCount: number) => void;
  onProgress?: (data: ProgressData) => void;
  onPageError?: (error: PageError) => void;
  onFileError?: (fileId: string, message: string) => void;
  onDone?: (result: ExportResult) => void;
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

  private worker: Worker | null = null;
  private events: JobEvents;
  private running = false;
  private disabled = false;
  private fatalTimestamps: number[] = [];

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

  async preview(file: File, dpi: number = PREVIEW_DPI): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'preview', file: buf, dpi }, [buf]);
  }

  /** ADR-006: renders up to maxPages of a bundled sample PDF for the
   * homepage's live hero demo. Never throws — failures arrive as
   * onDemoError, same scoped-error pattern as preview(). */
  async demoRender(file: File, dpi: number, maxPages: number): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'demo-render', file: buf, dpi, maxPages }, [buf]);
  }

  async start(files: { file: File; fileId: string }[], options: ExportOptions): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    this.post({ type: 'start', files: buffers, meta, options }, buffers);
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
      case 'preview-done':
        this.events.onPreview?.(msg.blob);
        break;
      case 'preview-error':
        this.events.onPreviewError?.(msg.message);
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
