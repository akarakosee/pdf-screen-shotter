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
  /** Extracts the specified 1-based pages from a doc into one new PDF. */
  split(doc: PdfDoc, pages: number[]): Promise<Uint8Array>;
  extractText?(doc: PdfDoc): Promise<string[]>;
  renderSvgPage?(doc: PdfDoc, page: number): Promise<Uint8Array>;
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
  /** Attempts to repair a corrupted PDF by re-saving it through MuPDF's parser. */
  repair?(doc: PdfDoc): Promise<Uint8Array>;
  /** Rasterizes the entire PDF to grayscale images and rebuilds it. */
  rasterizeToGrayscale?(doc: PdfDoc, onProgress?: (page: number, total: number) => void): Promise<Uint8Array>;
}
