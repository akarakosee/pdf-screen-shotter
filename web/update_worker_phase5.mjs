import fs from 'fs';

const runners = `
async function extractJavascriptRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const scripts: string[] = [];
    
    // We scan ALL indirect objects in the PDF for Javascript actions!
    // This is 100% foolproof and bypasses complex tree traversals.
    const objects = doc.context.enumerateIndirectObjects();
    for (const [ref, obj] of objects) {
       if (obj instanceof PDFDict) {
           const type = obj.lookup(PDFName.of('S'));
           if (type === PDFName.of('JavaScript')) {
               const jsNode = obj.lookupMaybe(PDFName.of('JS'));
               let jsStr = '';
               if (jsNode instanceof PDFString || jsNode instanceof PDFHexString) {
                   jsStr = jsNode.decodeText();
               } else if (jsNode instanceof PDFRawStream) {
                   let decoded = jsNode.contents;
                   const filter = jsNode.dict.lookup(PDFName.of('Filter'));
                   if (filter === PDFName.of('FlateDecode')) {
                       try { decoded = unzlibSync(jsNode.contents); } catch(e) {}
                   }
                   jsStr = new TextDecoder('utf-8').decode(decoded);
               }
               if (jsStr) {
                  scripts.push(\`/* --- Script found at \${ref.toString()} --- */\\n\${jsStr}\\n\`);
                  succeeded++;
               }
           }
       }
    }
    
    if (!cancelled && scripts.length > 0) {
      const content = scripts.join('\\n');
      output = new Blob([content], { type: 'application/javascript' });
      outputName = meta.name.replace(/\\.pdf$/i, '_extracted_js.js');
    }
  } catch (err: any) {
    console.error('ExtractJavascript error:', err);
  }
  
  post({
    type: 'extract-javascript-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function splitBookmarksRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    const catalog = doc.catalog;
    
    let bookmarks: { title: string, ref: any }[] = [];
    
    function parseOutline(node: any) {
       if (!node) return;
       let current = doc.context.lookup(node.lookupMaybe(PDFName.of('First')));
       while (current && current instanceof PDFDict) {
          let title = 'Chapter';
          const titleNode = current.lookupMaybe(PDFName.of('Title'));
          if (titleNode instanceof PDFString || titleNode instanceof PDFHexString) {
              title = titleNode.decodeText();
          }
          
          let dest;
          const destNode = doc.context.lookup(current.lookupMaybe(PDFName.of('Dest')));
          if (destNode) dest = destNode;
          else {
             const action = doc.context.lookup(current.lookupMaybe(PDFName.of('A')));
             if (action instanceof PDFDict && action.lookup(PDFName.of('S')) === PDFName.of('GoTo')) {
                dest = doc.context.lookup(action.lookupMaybe(PDFName.of('D')));
             }
          }
          
          let pageRef;
          if (dest instanceof PDFArray) {
             pageRef = dest.get(0);
          }
          // Note: Ignoring Named Destinations for now to keep it completely local and simple, 
          // most standard TOCs use explicit arrays.
          
          if (pageRef) {
             bookmarks.push({ title, ref: pageRef });
          }
          
          parseOutline(current); // parse children
          current = doc.context.lookup(current.lookupMaybe(PDFName.of('Next')));
       }
    }
    
    parseOutline(catalog.lookupMaybe(PDFName.of('Outlines'), PDFDict));
    
    const pages = doc.getPages();
    let mappedBookmarks = bookmarks
       .map(b => ({ title: b.title.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Chapter', index: pages.findIndex(p => p.ref === b.ref) }))
       .filter(b => b.index !== -1)
       .sort((a,b) => a.index - b.index);
       
    // Remove duplicates pointing to the same page
    mappedBookmarks = mappedBookmarks.filter((v, i, a) => a.findIndex(t => t.index === v.index) === i);
    
    if (mappedBookmarks.length > 0) {
       const zip = new JSZip();
       
       // Calculate ranges
       for (let i = 0; i < mappedBookmarks.length; i++) {
          if (cancelled) break;
          post({ type: 'split-bookmarks-progress', processedPages: i + 1, totalPages: mappedBookmarks.length });
          
          const start = mappedBookmarks[i].index;
          const end = (i + 1 < mappedBookmarks.length) ? mappedBookmarks[i+1].index : totalPages;
          if (start >= end) continue;
          
          const subDoc = await PDFDocument.create();
          const copied = await subDoc.copyPages(doc, Array.from({length: end - start}, (_, k) => start + k));
          copied.forEach(p => subDoc.addPage(p));
          
          const pdfBytes = await subDoc.save();
          const safeName = \`\${String(i+1).padStart(2, '0')} - \${mappedBookmarks[i].title}.pdf\`;
          zip.file(safeName, pdfBytes);
          succeeded++;
       }
       
       if (!cancelled && succeeded > 0) {
          output = await zip.generateAsync({ type: 'blob' });
          outputName = meta.name.replace(/\\.pdf$/i, '_chapters.zip');
       }
    }
  } catch (err: any) {
    console.error('SplitBookmarks error:', err);
  }
  
  post({
    type: 'split-bookmarks-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function splitBlankRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const { mupdf } = await ensureEngine();
    const muDoc = mupdf.Document.openDocument(file, "application/pdf");
    const totalPages = muDoc.countPages();
    const blankIndices: number[] = [];
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'split-blank-progress', processedPages: i + 1, totalPages: totalPages * 2 }); // rendering phase
      
      const page = muDoc.loadPage(i);
      // Render at very low resolution to save memory and speed up
      const pixmap = page.toPixmap(mupdf.Matrix.scale(0.1, 0.1), mupdf.ColorSpace.DeviceRGB, false, false);
      const samples = pixmap.getSamples();
      
      let sum = 0;
      for (let j = 0; j < samples.length; j++) sum += samples[j];
      const avg = sum / samples.length;
      
      // If average pixel value is > 252 (out of 255), it's a blank/white page (with possible scan noise)
      if (avg > 252) {
         blankIndices.push(i);
      }
    }
    
    if (!cancelled && blankIndices.length > 0) {
       const doc = await PDFDocument.load(file);
       const zip = new JSZip();
       
       // Add an implicit blank page at the end to close the last segment
       if (blankIndices[blankIndices.length - 1] !== totalPages) {
          blankIndices.push(totalPages);
       }
       
       let segmentStart = 0;
       for (let i = 0; i < blankIndices.length; i++) {
          if (cancelled) break;
          post({ type: 'split-blank-progress', processedPages: totalPages + i + 1, totalPages: totalPages * 2 }); // splitting phase
          
          const segmentEnd = blankIndices[i];
          if (segmentEnd > segmentStart) {
             const subDoc = await PDFDocument.create();
             const copied = await subDoc.copyPages(doc, Array.from({length: segmentEnd - segmentStart}, (_, k) => segmentStart + k));
             copied.forEach(p => subDoc.addPage(p));
             
             const pdfBytes = await subDoc.save();
             zip.file(\`Document_\${succeeded + 1}.pdf\`, pdfBytes);
             succeeded++;
          }
          segmentStart = segmentEnd + 1; // skip the blank page itself!
       }
       
       if (!cancelled && succeeded > 0) {
          output = await zip.generateAsync({ type: 'blob' });
          outputName = meta.name.replace(/\\.pdf$/i, '_split.zip');
       }
    }
  } catch (err: any) {
    console.error('SplitBlank error:', err);
  }
  
  post({
    type: 'split-blank-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}
`;

const handlers = `      case 'extract-javascript-start':
        cancelled = false;
        extractJavascriptRun(msg.file, msg.meta);
        break;
      case 'split-bookmarks-start':
        cancelled = false;
        splitBookmarksRun(msg.file, msg.meta);
        break;
      case 'split-blank-start':
        cancelled = false;
        splitBlankRun(msg.file, msg.meta);
        break;`;

let content = fs.readFileSync('./src/workers/render.worker.ts', 'utf8');
content = content.replace('// --- RUNNERS ---', runners + '\\n\\n// --- RUNNERS ---');
content = content.replace('      case \'cancel\':', handlers + '\\n      case \'cancel\':');
fs.writeFileSync('./src/workers/render.worker.ts', content);

console.log('Worker updated with Phase 5');
