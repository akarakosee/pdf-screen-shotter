// Engine adapter contract — SISTEM_TASARIMI.md §3.2.
// Rules: the engine lives ONLY inside the worker (never imported on the main
// thread); the UI never knows the engine type; swapping MuPDF ↔ PDF.js is a
// single-module change.

export interface PdfDoc {
  /** Opaque engine-native handle. Callers must not inspect it. */
  readonly handle: unknown;
}

export class EncryptedError extends Error {
  constructor(message = 'PDF is password-protected') {
    super(message);
    this.name = 'EncryptedError';
  }
}

export interface RenderOutput {
  /** Encoded image bytes (PNG or JPEG). */
  data: Uint8Array;
  width: number;
  height: number;
}

export interface PdfEngine {
  /** Load/initialize the WASM module. Idempotent. */
  init(): Promise<void>;
  /** Throws EncryptedError for password-protected files. */
  open(data: ArrayBuffer): Promise<PdfDoc>;
  pageCount(doc: PdfDoc): number;
  /** Combines pages from every doc, in array order, into one new PDF. */
  merge(docs: PdfDoc[]): Promise<Uint8Array>;
  renderPage(
    doc: PdfDoc,
    page: number, // 1-based
    dpi: number,
    format: 'png' | 'jpg',
    jpgQuality?: number,
    backgroundColor?: 'white' | 'black' | 'transparent', // default 'white'
  ): Promise<RenderOutput>;
  /** Release WASM memory for the document. */
  close(doc: PdfDoc): void;
}
