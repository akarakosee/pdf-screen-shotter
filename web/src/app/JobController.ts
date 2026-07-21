// JobController — queue, cancel, worker lifecycle (SISTEM_TASARIMI §2.2/§3.3).
// Owns the single render worker. On `fatal` it terminates and respawns the
// worker so one bad PDF cannot take down the tab.

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
  onInspect?: (fileId: string, pageCount: number) => void;
  onProgress?: (data: ProgressData) => void;
  onPageError?: (error: PageError) => void;
  onFileError?: (fileId: string, message: string) => void;
  onDone?: (result: ExportResult) => void;
  onFatal?: (message: string) => void;
}

export class JobController {
  private worker: Worker | null = null;
  private events: JobEvents;
  private running = false;

  constructor(events: JobEvents) {
    this.events = events;
  }

  /** Idempotent. Called from preload triggers (hover/dragenter) so the WASM is
   * usually warm before the user drops a file (ADR-001 preload strategy). */
  preload(): void {
    this.ensureWorker();
  }

  /** ADR-003: page count without rendering; errors arrive as file-error. */
  async inspect(fileId: string, file: File): Promise<void> {
    const buf = await file.arrayBuffer();
    this.post({ type: 'inspect', fileId, file: buf }, [buf]);
  }

  async preview(file: File, dpi: number = PREVIEW_DPI): Promise<void> {
    const buf = await file.arrayBuffer();
    this.post({ type: 'preview', file: buf, dpi }, [buf]);
  }

  async start(files: { file: File; fileId: string }[], options: ExportOptions): Promise<void> {
    if (this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    this.post({ type: 'start', files: buffers, meta, options }, buffers);
  }

  cancel(): void {
    this.post({ type: 'cancel' });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private post(msg: UiToWorkerMessage, transfer: Transferable[] = []): void {
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
    }
  }

  private handleFatal(message: string): void {
    this.running = false;
    this.dispose();
    this.ensureWorker(); // respawn immediately so the tool stays usable
    this.events.onFatal?.(message);
  }
}
