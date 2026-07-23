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

  async merge(docs: PdfDoc[]): Promise<Uint8Array> {
    const m = this.require();
    const out = new m.PDFDocument();
    try {
      let at = 0;
      for (const doc of docs) {
        const src = (doc as MuPdfDoc).handle.asPDF();
        if (!src) throw new Error('merge: source document is not a PDF');
        const count = (doc as MuPdfDoc).handle.countPages();
        for (let i = 0; i < count; i++) {
          out.graftPage(at, src, i);
          at++;
        }
      }
      const buf = out.saveToBuffer();
      try {
        // asUint8Array() copies out of WASM memory (same pattern as
        // pixmap.asPNG() in renderPage() below — safe to destroy right after).
        return buf.asUint8Array();
      } finally {
        buf.destroy();
      }
    } finally {
      out.destroy();
    }
  }

  async renderPage(
    doc: PdfDoc,
    page: number,
    dpi: number,
    format: 'png' | 'jpg',
    jpgQuality = 0.8,
    backgroundColor: 'white' | 'black' | 'transparent' = 'white',
  ): Promise<RenderOutput> {
    const m = this.require();
    const p = (doc as MuPdfDoc).handle.loadPage(page - 1);
    try {
      const scale = dpi / 72;
      if (backgroundColor === 'white') {
        // Unchanged path — byte-identical to the golden-file fixtures.
        const pixmap = p.toPixmap(m.Matrix.scale(scale, scale), m.ColorSpace.DeviceRGB, false, true);
        try {
          const data =
            format === 'png' ? pixmap.asPNG() : pixmap.asJPEG(Math.round(jpgQuality * 100), false);
          return { data, width: pixmap.getWidth(), height: pixmap.getHeight() };
        } finally {
          pixmap.destroy();
        }
      }
      // black / transparent both need a real alpha channel to know which
      // pixels the page didn't paint.
      const pixmap = p.toPixmap(m.Matrix.scale(scale, scale), m.ColorSpace.DeviceRGB, true, true);
      try {
        const width = pixmap.getWidth();
        const height = pixmap.getHeight();
        const rgba = pixmap.asPNG();
        if (backgroundColor === 'transparent') {
          if (format === 'jpg') {
            // JPEG has no alpha channel — fall back to compositing on white
            // rather than silently discarding the user's choice.
            const data = await compositeOnBackground(rgba, width, height, '#ffffff', format, jpgQuality);
            return { data, width, height };
          }
          return { data: rgba, width, height };
        }
        const data = await compositeOnBackground(rgba, width, height, '#000000', format, jpgQuality);
        return { data, width, height };
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

// Flattens a transparent (alpha) PNG onto a solid backdrop — used for the
// 'black' background option, and as JPEG's transparent-mode fallback (JPEG
// has no alpha channel). OffscreenCanvas is worker-safe in every browser this
// tool already requires (WASM + Worker modules).
async function compositeOnBackground(
  rgbaPng: Uint8Array,
  width: number,
  height: number,
  color: string,
  format: 'png' | 'jpg',
  jpgQuality: number,
): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(new Blob([rgbaPng as BlobPart], { type: 'image/png' }));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvas.convertToBlob(
    format === 'png' ? { type: 'image/png' } : { type: 'image/jpeg', quality: jpgQuality },
  );
  return new Uint8Array(await blob.arrayBuffer());
}
