const fs = require('fs');

const newWorkers = `
async function removeAnnotationsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  try {
    const pdfLib = await import('pdf-lib');
    const doc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      if (cancelled) break;
      pages[i].node.delete(pdfLib.PDFName.of('Annots'));
      post({ type: 'remove-annotations-progress', processedPages: i + 1, totalPages: pages.length });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled) {
      const bytes = await doc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = \`\${sanitizeBaseName(meta.name)}-clean.pdf\`;
    }
  } catch (e: any) {
    console.error('[worker] removeAnnotationsRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e.message });
  }
  post({
    type: 'remove-annotations-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}

async function pdfToWebpRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  try {
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    let success = 0;
    
    for (let i = 1; i <= count; i++) {
      if (cancelled) break;
      try {
        const out = await engine.renderPage(doc, i, 150, 'png');
        const bmp = await createImageBitmap(new Blob([out.data as BlobPart], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);
        const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
        const webpBuf = await webpBlob.arrayBuffer();
        zip.file(\`page_\${i}.webp\`, webpBuf);
        success++;
      } catch(e) {
        console.warn('Failed to render page', i, e);
      }
      post({ type: 'pdf-to-webp-progress', processedPages: i, totalPages: count });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled && success > 0) {
      if (success === 1 && count === 1) {
        const zipFiles = Object.values(zip.files);
        const data = await zipFiles[0].async('uint8array');
        output = new Blob([data], { type: 'image/webp' });
        outputName = \`\${sanitizeBaseName(meta.name)}.webp\`;
      } else {
        const zipBytes = await zip.generateAsync({ type: 'uint8array' });
        output = new Blob([zipBytes], { type: 'application/zip' });
        outputName = \`\${sanitizeBaseName(meta.name)}-webp.zip\`;
      }
    }
  } catch (e: any) {
    console.error('[worker] pdfToWebpRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e.message });
  } finally {
    if (doc) engine.close(doc);
  }
  post({
    type: 'pdf-to-webp-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}

async function autoCropRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  try {
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    
    const pdfLib = await import('pdf-lib');
    const outDoc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pages = outDoc.getPages();

    for (let i = 1; i <= count; i++) {
      if (cancelled) break;
      try {
        const out = await engine.renderPage(doc, i, 72, 'png'); // 72 DPI is exactly 1 pt per pixel
        const bmp = await createImageBitmap(new Blob([out.data as BlobPart], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(bmp, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        const data = imgData.data;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
            if (a > 0 && (r < 250 || g < 250 || b < 250)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        if (minX <= maxX && minY <= maxY) {
          // Found content
          const page = pages[i - 1];
          const height = page.getHeight();
          const padding = 10;
          minX = Math.max(0, minX - padding);
          maxX = Math.min(canvas.width, maxX + padding);
          minY = Math.max(0, minY - padding);
          maxY = Math.min(canvas.height, maxY + padding);
          
          page.setCropBox(minX, height - maxY, maxX - minX, maxY - minY);
        }
      } catch(e) {
        console.warn('Failed to auto-crop page', i, e);
      }
      post({ type: 'auto-crop-progress', processedPages: i, totalPages: count });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled) {
      const bytes = await outDoc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = \`\${sanitizeBaseName(meta.name)}-cropped.pdf\`;
    }
  } catch (e: any) {
    console.error('[worker] autoCropRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e.message });
  } finally {
    if (doc) engine.close(doc);
  }
  post({
    type: 'auto-crop-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}
`;

fs.appendFileSync('./src/workers/render.worker.ts', '\n' + newWorkers);
console.log('Done!');
