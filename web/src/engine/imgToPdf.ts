import { PDFDocument } from 'pdf-lib';

export type PageSizePreset = 'fit' | 'a4' | 'letter';
export type Orientation = 'auto' | 'portrait' | 'landscape';

export interface ImgToPdfOptions {
  pageSize: PageSizePreset;  // 'fit': page = image's own pixel dimensions, orientation ignored
  orientation: Orientation;  // used only when pageSize !== 'fit'
  marginPt: number;          // uniform margin, default 0; image scaled to fit inside margins, centered
}

export interface ImgToPdfResult {
  output: Blob;
  outputName: string;
  pageCount: number;
  durationMs: number;
}

const PAGE_SIZES: Record<'a4' | 'letter', [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

async function decodeToPngBuffer(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function buildPdfFromImages(files: File[], options: ImgToPdfOptions): Promise<ImgToPdfResult> {
  const start = performance.now();
  const doc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buf = new Uint8Array(arrayBuffer);
    const name = file.name.toLowerCase();

    let embeddedImg;
    try {
      if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        embeddedImg = await doc.embedJpg(buf);
      } else if (name.endsWith('.png')) {
        embeddedImg = await doc.embedPng(buf);
      } else {
        // For webp or other formats, decode to PNG via canvas
        const pngBuf = await decodeToPngBuffer(file);
        embeddedImg = await doc.embedPng(pngBuf);
      }
    } catch {
      // Fallback: if embedJpg/embedPng fails, try canvas PNG conversion
      const pngBuf = await decodeToPngBuffer(file);
      embeddedImg = await doc.embedPng(pngBuf);
    }

    const imgW = embeddedImg.width;
    const imgH = embeddedImg.height;

    let pageW: number;
    let pageH: number;
    let drawX: number;
    let drawY: number;
    let drawW: number;
    let drawH: number;

    if (options.pageSize === 'fit') {
      pageW = imgW;
      pageH = imgH;
      drawX = 0;
      drawY = 0;
      drawW = imgW;
      drawH = imgH;
    } else {
      const baseSize = PAGE_SIZES[options.pageSize] || PAGE_SIZES.a4;
      let [w, h] = baseSize;

      const isLandscape =
        options.orientation === 'landscape' ||
        (options.orientation === 'auto' && imgW > imgH);

      if (isLandscape) {
        pageW = h;
        pageH = w;
      } else {
        pageW = w;
        pageH = h;
      }

      const margin = Math.max(0, options.marginPt);
      const availW = Math.max(1, pageW - 2 * margin);
      const availH = Math.max(1, pageH - 2 * margin);

      const scale = Math.min(availW / imgW, availH / imgH);
      drawW = imgW * scale;
      drawH = imgH * scale;

      drawX = (pageW - drawW) / 2;
      drawY = (pageH - drawH) / 2;
    }

    const page = doc.addPage([pageW, pageH]);
    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await doc.save();
  const output = new Blob([pdfBytes], { type: 'application/pdf' });
  const durationMs = Math.round(performance.now() - start);

  let baseName = 'images';
  if (files.length === 1 && files[0]) {
    baseName = files[0].name.replace(/\.[^/.]+$/, '');
  }
  const outputName = `${baseName}-converted.pdf`;

  return {
    output,
    outputName,
    pageCount: files.length,
    durationMs,
  };
}
