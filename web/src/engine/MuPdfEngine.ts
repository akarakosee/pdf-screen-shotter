// MuPDF.js implementation of the PdfEngine adapter (ADR-001).
// Worker-only module: importing this on the main thread is forbidden.

import type { PdfDoc, PdfEngine, RenderOutput } from './PdfEngine';
import { EncryptedError } from './PdfEngine';
import { PDFDocument } from 'pdf-lib';

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
        // asUint8Array() returns a view into WASM memory. We MUST .slice() it
        // so we have a distinct JS copy before we destroy the WASM buffer.
        return buf.asUint8Array().slice();
      } finally {
        buf.destroy();
      }
    } finally {
      out.destroy();
    }
  }

  async split(doc: PdfDoc, pages: number[]): Promise<Uint8Array> {
    const m = this.require();
    const out = new m.PDFDocument();
    try {
      const src = (doc as MuPdfDoc).handle.asPDF();
      if (!src) throw new Error('split: source document is not a PDF');
      for (let i = 0; i < pages.length; i++) {
        // pages array is 1-indexed (from the UI), MuPDF expects 0-indexed
        out.graftPage(i, src, pages[i]! - 1);
      }
      const buf = out.saveToBuffer();
      try {
        return buf.asUint8Array().slice();
      } finally {
        buf.destroy();
      }
    } finally {
      out.destroy();
    }
  }

  async renderSvgPage(doc: PdfDoc, page: number): Promise<Uint8Array> {
    const p = (doc as MuPdfDoc).handle.loadPage(page - 1);
    try {
      const svgStr = (p as any).toSVG();
      return new TextEncoder().encode(svgStr);
    } finally {
      p.destroy();
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

  async extractText(doc: PdfDoc): Promise<string[]> {
    const texts: string[] = [];
    const count = this.pageCount(doc);
    for (let i = 0; i < count; i++) {
      const p = (doc as MuPdfDoc).handle.loadPage(i);
      try {
        const stext = p.toStructuredText('preserve-whitespace');
        try {
          texts.push(stext.asText());
        } finally {
          stext.destroy();
        }
      } finally {
        p.destroy();
      }
    }
    return texts;
  }

  async extractTextJSON(doc: PdfDoc, pageIndex: number): Promise<any> {
    const p = (doc as MuPdfDoc).handle.loadPage(pageIndex);
    try {
      const stext = p.toStructuredText('preserve-whitespace');
      try {
        return JSON.parse(stext.asJSON());
      } finally {
        stext.destroy();
      }
    } finally {
      p.destroy();
    }
  }

  async extractHTML(doc: PdfDoc, pageIndex: number): Promise<string> {
    const p = (doc as MuPdfDoc).handle.loadPage(pageIndex);
    try {
      const stext = p.toStructuredText('preserve-whitespace');
      try {
        // According to mupdf.js docs, asHTML() returns a string
        return stext.asHTML();
      } finally {
        stext.destroy();
      }
    } finally {
      p.destroy();
    }
  }

  async extractImages(
    doc: PdfDoc,
    onProgress?: (page: number, total: number, extracted: number) => void
  ): Promise<{ name: string; data: Uint8Array }[]> {
    const count = this.pageCount(doc);
    const images: { name: string; data: Uint8Array }[] = [];
    const visited = new Set<string>();
    for (let i = 0; i < count; i++) {
      const p = (doc as MuPdfDoc).handle.loadPage(i);
      try {
        const res = p.getObject().getInheritable('Resources');
        const xobj = res?.get('XObject');
        let imgIndex = 0;
        if (xobj && xobj.isDictionary()) {
          xobj.forEach((obj, _key) => {
            if (obj.get('Subtype')?.asName() === 'Image') {
              const refId = obj.asIndirect() ? String(obj.asIndirect()) : obj.toString();
              if (visited.has(refId)) return;
              visited.add(refId);
              imgIndex++;
              const filter = obj.get('Filter')?.asName();
              const isJpeg = filter === 'DCTDecode';
              if (isJpeg) {
                const raw = obj.readRawStream();
                if (raw) {
                  const data = raw.asUint8Array().slice();
                  images.push({
                    name: `page_${String(i + 1).padStart(2, '0')}_img_${String(imgIndex).padStart(2, '0')}.jpg`,
                    data,
                  });
                }
              } else {
                try {
                  const image = (doc as MuPdfDoc).handle.loadImage(obj);
                  const pix = image.toPixmap();
                  const data = pix.asPNG().slice();
                  images.push({
                    name: `page_${String(i + 1).padStart(2, '0')}_img_${String(imgIndex).padStart(2, '0')}.png`,
                    data,
                  });
                } catch (e) {
                  console.warn('[MuPdfEngine] loadImage error:', e);
                }
              }
            }
          });
        }
      } finally {
        p.destroy();
      }
      if (onProgress) onProgress(i + 1, count, images.length);
    }
    return images;
  }

  close(doc: PdfDoc): void {
    (doc as MuPdfDoc).handle.destroy();
  }

  async compress(
    doc: PdfDoc,
    level: 'recommended' | 'extreme' | 'fast' = 'recommended',
  ): Promise<Uint8Array> {
    const pdf = (doc as MuPdfDoc).handle.asPDF();
    if (!pdf) throw new Error('compress: document is not a PDF');
    const opts = 'garbage=deduplicate,compress=yes,clean=yes';
    const buf = pdf.saveToBuffer(opts);
    try {
      return buf.asUint8Array().slice();
    } finally {
      buf.destroy();
    }
  }

  async repair(doc: PdfDoc): Promise<Uint8Array> {
    const pdf = (doc as MuPdfDoc).handle.asPDF();
    if (!pdf) throw new Error('repair: document is not a PDF');
    // Using default save options which inherently rebuilds the xref table
    const buf = pdf.saveToBuffer('garbage=deduplicate,clean=yes');
    try {
      return buf.asUint8Array().slice();
    } finally {
      buf.destroy();
    }
  }

  async detectBlankPages(
    doc: PdfDoc,
    onProgress?: (page: number, total: number) => void
  ): Promise<number[]> {
    const m = this.require();
    const count = this.pageCount(doc);
    const blankIndices: number[] = [];
    
    // Scale 0.5 (~36 DPI) is enough to check for visible ink
    for (let i = 0; i < count; i++) {
      const p = (doc as MuPdfDoc).handle.loadPage(i);
      try {
        const pixmap = p.toPixmap(m.Matrix.scale(0.5, 0.5), m.ColorSpace.DeviceGray, false, true);
        try {
          const pixels = pixmap.getPixels(); // Uint8ClampedArray (Grayscale, 1 byte per pixel)
          let whitePixels = 0;
          for (let j = 0; j < pixels.length; j++) {
            if (pixels[j] > 250) {
              whitePixels++;
            }
          }
          const whiteRatio = whitePixels / pixels.length;
          // If 99.5% of pixels are near white, we consider it a blank page
          if (whiteRatio > 0.995) {
            blankIndices.push(i);
          }
        } finally {
          pixmap.destroy();
        }
      } finally {
        p.destroy();
      }
      if (onProgress) onProgress(i + 1, count);
    }
    return blankIndices;
  }

  async rasterizeToGrayscale(
    doc: PdfDoc,
    onProgress?: (page: number, total: number) => void
  ): Promise<Uint8Array> {
    const m = this.require();
    const count = this.pageCount(doc);
    const pdf = await PDFDocument.create();
    
    for (let i = 0; i < count; i++) {
      const p = (doc as MuPdfDoc).handle.loadPage(i);
      try {
        const bounds = p.getBounds();
        const width = bounds[2] - bounds[0];
        const height = bounds[3] - bounds[1];
        
        // 2x scale (~144 DPI) for a good balance of readability and file size
        const scale = 2.0; 
        const pixmap = p.toPixmap(m.Matrix.scale(scale, scale), m.ColorSpace.DeviceGray, false, true);
        let jpgBytes: Uint8Array;
        try {
          // 85% quality to keep file size reasonable since it's now full images
          jpgBytes = pixmap.asJPEG(85, false).slice();
        } finally {
          pixmap.destroy();
        }
        
        const image = await pdf.embedJpg(jpgBytes);
        const page = pdf.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      } finally {
        p.destroy();
      }
      if (onProgress) onProgress(i + 1, count);
    }
    
    return await pdf.save();
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
