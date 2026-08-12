import { PDFDocument, PDFName } from 'pdf-lib';

export interface FlattenPdfOptions {
  removeAnnotations: boolean; // strip remaining non-form annotations (links, comments) after form flatten; default true
}

export interface FlattenPdfResult {
  output: Blob;
  outputName: string;
  durationMs: number;
  hadForm: boolean;
  removedAnnots: boolean;
}

export async function flattenPdf(file: File, options: FlattenPdfOptions): Promise<FlattenPdfResult> {
  const start = performance.now();

  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(new Uint8Array(arrayBuffer), { ignoreEncryption: true });

  if (doc.isEncrypted) {
    throw new Error('ENCRYPTED_PDF_UNSUPPORTED');
  }

  let hadForm = false;
  try {
    const form = doc.getForm();
    const fields = form.getFields();
    if (fields && fields.length > 0) {
      hadForm = true;
      form.flatten();
    }
  } catch (err) {
    // If AcroForm is missing or cannot be flattened, skip safely
  }

  let removedAnnots = false;
  if (options.removeAnnotations) {
    const pages = doc.getPages();
    for (const page of pages) {
      const annots = page.node.lookup(PDFName.of('Annots'));
      if (annots) {
        page.node.delete(PDFName.of('Annots'));
        removedAnnots = true;
      }
    }
  }

  const savedBytes = await doc.save();
  const output = new Blob([savedBytes], { type: 'application/pdf' });
  const baseName = (file.name || 'document.pdf').replace(/\.[^/.]+$/, '');
  const outputName = `${baseName}_flattened.pdf`;
  const durationMs = Math.round(performance.now() - start);

  return {
    output,
    outputName,
    durationMs,
    hadForm,
    removedAnnots,
  };
}
