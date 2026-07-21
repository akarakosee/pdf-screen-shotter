// MuPDF.js implementation of the PdfEngine adapter (ADR-001).
// Worker-only module: importing this on the main thread is forbidden.

import type { PdfDoc, PdfEngine, RenderOutput } from './PdfEngine';
import { EncryptedError } from './PdfEngine';

type Mupdf = typeof import('mupdf');

interface MuPdfDoc extends PdfDoc {
  readonly handle: import('mupdf').Document;
}

export class MuPdfEngine implements PdfEngine {
  private mupdf: Mupdf | null = null;

  async init(): Promise<void> {
    if (this.mupdf) return;
    // Dynamic import so the ~4.5MB (gzip) WASM loads only when the engine is
    // actually needed (preload strategy is driven by the UI, ADR-001).
    this.mupdf = await import('mupdf');
  }

  async open(data: ArrayBuffer): Promise<PdfDoc> {
    const m = this.require();
    const doc = m.Document.openDocument(data, 'application/pdf');
    if (doc.needsPassword()) {
      doc.destroy();
      throw new EncryptedError();
    }
    return { handle: doc } satisfies MuPdfDoc;
  }

  pageCount(doc: PdfDoc): number {
    return (doc as MuPdfDoc).handle.countPages();
  }

  async renderPage(
    doc: PdfDoc,
    page: number,
    dpi: number,
    format: 'png' | 'jpg',
    jpgQuality = 0.8,
  ): Promise<RenderOutput> {
    const m = this.require();
    const p = (doc as MuPdfDoc).handle.loadPage(page - 1);
    try {
      const scale = dpi / 72;
      const pixmap = p.toPixmap(m.Matrix.scale(scale, scale), m.ColorSpace.DeviceRGB, false, true);
      try {
        const data =
          format === 'png'
            ? pixmap.asPNG()
            : pixmap.asJPEG(Math.round(jpgQuality * 100), false);
        return { data, width: pixmap.getWidth(), height: pixmap.getHeight() };
      } finally {
        pixmap.destroy();
      }
    } finally {
      p.destroy();
    }
  }

  close(doc: PdfDoc): void {
    (doc as MuPdfDoc).handle.destroy();
  }

  private require(): Mupdf {
    if (!this.mupdf) throw new Error('PdfEngine.init() must be called first');
    return this.mupdf;
  }
}
