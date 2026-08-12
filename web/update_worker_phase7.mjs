import fs from 'fs';

const runners = `
async function extractTablesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = mupdf.Document.openDocument(file, "application/pdf");
    const totalPages = doc.countPages();
    let csv = '\\uFEFF'; // BOM for Excel UTF-8
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-tables-progress', processedPages: i + 1, totalPages });
      
      const page = doc.loadPage(i);
      const stext = page.toStructuredText("preserve-whitespace");
      const json = JSON.parse(stext.asJSON());
      
      let lines: { text: string, y: number, x: number }[] = [];
      for (const block of json.blocks) {
          if (block.type !== 'text') continue;
          for (const line of block.lines) {
              let avgY = 0;
              let text = '';
              let minX = 9999;
              for (const char of line.chars) {
                 avgY += char.bbox[1];
                 minX = Math.min(minX, char.bbox[0]);
                 text += char.c;
              }
              if (line.chars.length > 0) avgY /= line.chars.length;
              if (text.trim()) {
                 lines.push({ text: text.trim(), y: avgY, x: minX });
              }
          }
      }
      
      // Group lines into rows by Y-coordinate proximity (e.g. within 5 units)
      lines.sort((a, b) => a.y - b.y);
      let rows: any[][] = [];
      let currentRow: any[] = [];
      let lastY = lines[0]?.y;
      
      for (const line of lines) {
         if (lastY !== undefined && Math.abs(line.y - lastY) > 6) {
            rows.push(currentRow);
            currentRow = [];
         }
         currentRow.push(line);
         lastY = line.y;
      }
      if (currentRow.length > 0) rows.push(currentRow);
      
      // Build CSV output
      if (rows.length > 0) {
          csv += \`--- Page \${i + 1} ---\\n\`;
          for (const row of rows) {
             row.sort((a: any, b: any) => a.x - b.x);
             csv += row.map((cell: any) => \`"\${cell.text.replace(/"/g, '""')}"\`).join(',') + '\\n';
          }
          csv += '\\n';
          succeeded++;
      }
    }
    
    if (!cancelled && succeeded > 0) {
      output = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      outputName = meta.name.replace(/\\.pdf$/i, '_tables.csv');
    }
  } catch (err: any) {
    console.error('ExtractTables error:', err);
  }
  
  post({
    type: 'extract-tables-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function pdfToJsonRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const doc = mupdf.Document.openDocument(file, "application/pdf");
    const totalPages = doc.countPages();
    let out = [];
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'pdf-to-json-progress', processedPages: i + 1, totalPages });
      const page = doc.loadPage(i);
      const stext = page.toStructuredText("preserve-whitespace");
      out.push(JSON.parse(stext.asJSON()));
    }
    
    if (!cancelled) {
      const jsonStr = JSON.stringify({ filename: meta.name, pages: out }, null, 2);
      output = new Blob([jsonStr], { type: 'application/json' });
      outputName = meta.name.replace(/\\.pdf$/i, '_structure.json');
    }
  } catch (err: any) {
    console.error('PdfToJson error:', err);
  }
  
  post({
    type: 'pdf-to-json-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded: output ? 1 : 0 }
  });
}

async function scanToPdfRun(files: ArrayBuffer[], meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const pdfDoc = await PDFDocument.create();
    let processed = 0;
    
    for (const buf of files) {
      if (cancelled) break;
      post({ type: 'scan-to-pdf-progress', processedPages: processed + 1, totalPages: files.length });
      
      let image;
      try {
         // Assume JPEG from webcam
         image = await pdfDoc.embedJpg(buf);
      } catch (e) {
         try {
             image = await pdfDoc.embedPng(buf);
         } catch (err) {
             console.error('Failed to embed scan image', err);
             continue;
         }
      }
      
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      processed++;
      succeeded++;
    }
    
    if (!cancelled && succeeded > 0) {
      const bytes = await pdfDoc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = meta.name;
    }
  } catch (err: any) {
    console.error('ScanToPdf error:', err);
  }
  
  const originalSize = files.reduce((acc, val) => acc + val.byteLength, 0);
  post({
    type: 'scan-to-pdf-done',
    result: { originalSize, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function audioReaderRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = mupdf.Document.openDocument(file, "application/pdf");
    const totalPages = doc.countPages();
    let text = '';
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'audio-reader-progress', processedPages: i + 1, totalPages });
      
      const page = doc.loadPage(i);
      const stext = page.toStructuredText("preserve-whitespace");
      const json = JSON.parse(stext.asJSON());
      
      for (const block of json.blocks) {
          if (block.type !== 'text') continue;
          for (const line of block.lines) {
              let lineText = '';
              for (const char of line.chars) lineText += char.c;
              text += lineText.trim() + ' ';
          }
          text += '\\n';
      }
      text += '\\n\\n';
      succeeded++;
    }
    
    if (!cancelled && text.trim().length > 0) {
      output = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      outputName = meta.name.replace(/\\.pdf$/i, '_audio_script.txt');
    }
  } catch (err: any) {
    console.error('AudioReader error:', err);
  }
  
  post({
    type: 'audio-reader-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}
`;

const handlers = `      case 'extract-tables-start':
        cancelled = false;
        extractTablesRun(msg.file, msg.meta);
        break;
      case 'pdf-to-json-start':
        cancelled = false;
        pdfToJsonRun(msg.file, msg.meta);
        break;
      case 'audio-reader-start':
        cancelled = false;
        audioReaderRun(msg.file, msg.meta);
        break;
      case 'scan-to-pdf-start':
        cancelled = false;
        scanToPdfRun(msg.files, msg.meta);
        break;`;

let content = fs.readFileSync('./src/workers/render.worker.ts', 'utf8');
content = content.replace('// --- RUNNERS ---', runners + '\\n\\n// --- RUNNERS ---');
content = content.replace('      case \'cancel\':', handlers + '\\n      case \'cancel\':');
fs.writeFileSync('./src/workers/render.worker.ts', content);

console.log('Worker updated with Phase 7');
