import { PDFDocument } from 'pdf-lib';

export interface SignaturePlacement {
  pageIndex: number;      // 0-indexed page number
  xFrac: number;          // 0-1, top-left screen origin
  yFrac: number;          // 0-1, top-left screen origin
  widthFrac: number;      // 0-1 fraction of page width
  heightFrac: number;     // 0-1 fraction of page height
}

export interface SignPdfOptions {
  signatureBytes: Uint8Array;
  placements: SignaturePlacement[];
}

export interface SignPdfResult {
  output: Blob;
  outputName: string;
  durationMs: number;
  pagesSigned: number;
}

export async function signPdf(file: File, options: SignPdfOptions): Promise<SignPdfResult> {
  const start = performance.now();

  if (!options.signatureBytes || options.signatureBytes.length === 0) {
    throw new Error('MISSING_SIGNATURE_BYTES');
  }

  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(new Uint8Array(arrayBuffer), { ignoreEncryption: true });

  if (doc.isEncrypted) {
    throw new Error('ENCRYPTED_PDF_UNSUPPORTED');
  }

  const totalPages = doc.getPageCount();
  if (totalPages === 0) {
    throw new Error('EMPTY_PDF_DOCUMENT');
  }

  // Detect PNG vs JPG magic bytes
  let image;
  const head = options.signatureBytes;
  if (head.length > 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    image = await doc.embedJpg(options.signatureBytes);
  } else {
    image = await doc.embedPng(options.signatureBytes);
  }

  let placements = options.placements;
  if (!placements || placements.length === 0) {
    // Default to stamping on the last page at bottom-right
    placements = [
      {
        pageIndex: totalPages - 1,
        xFrac: 0.65,
        yFrac: 0.82,
        widthFrac: 0.28,
        heightFrac: 0.12,
      },
    ];
  }

  let pagesSigned = 0;
  for (const placement of placements) {
    const targetPages: number[] = [];
    if (placement.pageIndex === -1) {
      targetPages.push(totalPages - 1);
    } else if (placement.pageIndex === -2) {
      for (let i = 0; i < totalPages; i++) {
        targetPages.push(i);
      }
    } else if (placement.pageIndex >= 0 && placement.pageIndex < totalPages) {
      targetPages.push(placement.pageIndex);
    }

    for (const idx of targetPages) {
      const page = doc.getPage(idx);
      const { width: W, height: H } = page.getSize();

      const width = placement.widthFrac * W;
      const height = placement.heightFrac * H;
      const x = placement.xFrac * W;
      // PDF Y coordinate origin is bottom-left; screen Y origin is top-left
      const y = H - (placement.yFrac * H) - height;

      page.drawImage(image, { x, y, width, height });
      pagesSigned++;
    }
  }

  const savedBytes = await doc.save();
  const output = new Blob([savedBytes], { type: 'application/pdf' });
  const baseName = (file.name || 'document.pdf').replace(/\.[^/.]+$/, '');
  const outputName = `${baseName}_signed.pdf`;
  const durationMs = Math.round(performance.now() - start);

  return {
    output,
    outputName,
    durationMs,
    pagesSigned,
  };
}
