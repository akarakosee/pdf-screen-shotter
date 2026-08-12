import fs from 'fs';

const runners = `

async function pdfToHtmlRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await engine.open(file);
    const totalPages = await engine.getPageCount(doc);
    let htmlContent = '<!DOCTYPE html>\\n<html>\\n<head>\\n<meta charset="utf-8">\\n<title>' + meta.name + '</title>\\n<style>body { font-family: sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }</style>\\n</head>\\n<body>\\n';
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'pdf-to-html-progress', processedPages: i + 1, totalPages });
      
      const pageHtml = await engine.extractHTML(doc, i);
      htmlContent += \`<div class="page" id="page-\${i+1}">\\n\${pageHtml}\\n</div>\\n<hr/>\\n\`;
      succeeded++;
    }
    htmlContent += '</body>\\n</html>';
    engine.close(doc);
    
    if (!cancelled && succeeded > 0) {
      output = new Blob([htmlContent], { type: 'text/html' });
      outputName = meta.name.replace(/\\.pdf$/i, '.html');
    }
  } catch (err: any) {
    console.error('PdfToHtml error:', err);
  }
  
  post({
    type: 'pdf-to-html-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

import JSZip from 'jszip';

async function extractFontsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const zip = new JSZip();
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    const extractedFonts = new Set<string>();
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-fonts-progress', processedPages: i + 1, totalPages });
      
      const page = doc.getPage(i);
      const resources = page.node.Resources();
      if (resources) {
        const fonts = resources.lookupMaybe(PDFName.of('Font'), PDFDict);
        if (fonts) {
          for (const [key, val] of fonts.entries()) {
            try {
              const fontDict = doc.context.lookup(val, PDFDict);
              const descriptor = fontDict.lookupMaybe(PDFName.of('FontDescriptor'), PDFDict);
              if (descriptor) {
                let fontFile = descriptor.lookupMaybe(PDFName.of('FontFile2'), PDFRawStream) || descriptor.lookupMaybe(PDFName.of('FontFile3'), PDFRawStream);
                if (fontFile) {
                  const fontData = fontFile.contents;
                  const fontName = descriptor.lookup(PDFName.of('FontName'))?.toString().replace('/', '') || \`Font_\${succeeded}\`;
                  const ext = fontFile === descriptor.lookupMaybe(PDFName.of('FontFile3'), PDFRawStream) ? '.otf' : '.ttf';
                  const fileName = fontName + ext;
                  
                  if (!extractedFonts.has(fileName)) {
                    extractedFonts.add(fileName);
                    zip.file(fileName, fontData);
                    succeeded++;
                  }
                }
              }
            } catch (e) {
               console.error('Failed to extract font', e);
            }
          }
        }
      }
    }
    
    if (!cancelled && succeeded > 0) {
      output = await zip.generateAsync({ type: 'blob' });
      outputName = meta.name.replace(/\\.pdf$/i, '_fonts.zip');
    }
  } catch (err: any) {
    console.error('ExtractFonts error:', err);
  }
  
  post({
    type: 'extract-fonts-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function removeImagesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'remove-images-progress', processedPages: i + 1, totalPages });
      
      const page = doc.getPage(i);
      const resources = page.node.Resources();
      if (resources) {
        const xobjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
        if (xobjects) {
          for (const [key, val] of xobjects.entries()) {
             const obj = doc.context.lookup(val, PDFRawStream);
             if (obj && obj.dict && obj.dict.lookup(PDFName.of('Subtype')) === PDFName.of('Image')) {
                // Delete the image reference
                xobjects.delete(key);
                succeeded++;
             }
          }
        }
      }
    }
    
    if (!cancelled) {
      const bytes = await doc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = meta.name.replace(/\\.pdf$/i, '_no_images.pdf');
      succeeded = totalPages;
    }
  } catch (err: any) {
    console.error('RemoveImages error:', err);
  }
  
  post({
    type: 'remove-images-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function extractUrlsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    const urls = new Set<string>();
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-urls-progress', processedPages: i + 1, totalPages });
      
      const page = doc.getPage(i);
      const annots = page.node.Annots();
      if (annots) {
        for (let j = 0; j < annots.size(); j++) {
           const annot = doc.context.lookup(annots.get(j), PDFDict);
           if (annot && annot.lookup(PDFName.of('Subtype')) === PDFName.of('Link')) {
              const action = annot.lookupMaybe(PDFName.of('A'), PDFDict);
              if (action && action.lookup(PDFName.of('S')) === PDFName.of('URI')) {
                 const uriObj = action.get(PDFName.of('URI'));
                 if (uriObj) {
                    let uriStr = uriObj.toString();
                    if (uriStr.startsWith('(') && uriStr.endsWith(')')) {
                       uriStr = uriStr.slice(1, -1);
                    } else if (uriStr.startsWith('<') && uriStr.endsWith('>')) {
                       // Hex decoding for PDF string (rudimentary fallback)
                       uriStr = uriStr.slice(1, -1); 
                    }
                    urls.add(uriStr);
                    succeeded++;
                 }
              }
           }
        }
      }
    }
    
    if (!cancelled && urls.size > 0) {
      let content = 'Extracted URLs:\\n\\n' + Array.from(urls).join('\\n');
      output = new Blob([content], { type: 'text/plain' });
      outputName = meta.name.replace(/\\.pdf$/i, '_urls.txt');
    }
  } catch (err: any) {
    console.error('ExtractUrls error:', err);
  }
  
  post({
    type: 'extract-urls-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded: urls.size }
  });
}

async function removeDuplicatesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const hashes = new Set<string>();
    const uniquePages: number[] = [];
    
    const muDoc = await engine.open(file);
    const totalPages = await engine.getPageCount(muDoc);
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'remove-duplicates-progress', processedPages: i + 1, totalPages });
      
      const { data } = await engine.renderPage(muDoc, i, 0.1, 'png', undefined, '#ffffff');
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashStr = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (!hashes.has(hashStr)) {
         hashes.add(hashStr);
         uniquePages.push(i);
      } else {
         succeeded++; // count of removed duplicates
      }
    }
    engine.close(muDoc);
    
    if (!cancelled && uniquePages.length > 0) {
       const originalDoc = await PDFDocument.load(file);
       const newDoc = await PDFDocument.create();
       const copiedPages = await newDoc.copyPages(originalDoc, uniquePages);
       copiedPages.forEach(p => newDoc.addPage(p));
       const bytes = await newDoc.save();
       output = new Blob([bytes], { type: 'application/pdf' });
       outputName = meta.name.replace(/\\.pdf$/i, '_deduped.pdf');
    }
  } catch (err: any) {
    console.error('RemoveDuplicates error:', err);
  }
  
  post({
    type: 'remove-duplicates-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}
`;

const handlers = `      case 'pdf-to-html-start':
        cancelled = false;
        pdfToHtmlRun(msg.file, msg.meta);
        break;
      case 'extract-fonts-start':
        cancelled = false;
        extractFontsRun(msg.file, msg.meta);
        break;
      case 'remove-images-start':
        cancelled = false;
        removeImagesRun(msg.file, msg.meta);
        break;
      case 'extract-urls-start':
        cancelled = false;
        extractUrlsRun(msg.file, msg.meta);
        break;
      case 'remove-duplicates-start':
        cancelled = false;
        removeDuplicatesRun(msg.file, msg.meta);
        break;`;

let content = fs.readFileSync('./src/workers/render.worker.ts', 'utf8');
content = content.replace('// --- RUNNERS ---', runners + '\\n\\n// --- RUNNERS ---');
content = content.replace('      case \'cancel\':', handlers + '\\n      case \'cancel\':');
fs.writeFileSync('./src/workers/render.worker.ts', content);

console.log('Worker updated');
