import fs from 'fs';

const runners = `
async function viewerPrefsRun(file: ArrayBuffer, meta: FileMeta, prefs: { fullScreen: boolean; hideToolbar: boolean; hideMenubar: boolean; fitWindow: boolean; centerWindow: boolean }): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const doc = await PDFDocument.load(file);
    const catalog = doc.catalog;
    
    const prefsDict = doc.context.obj({
       HideToolbar: prefs.hideToolbar,
       HideMenubar: prefs.hideMenubar,
       FitWindow: prefs.fitWindow,
       CenterWindow: prefs.centerWindow
    });
    
    catalog.set(PDFName.of('ViewerPreferences'), prefsDict);
    
    if (prefs.fullScreen) {
        catalog.set(PDFName.of('PageMode'), PDFName.of('FullScreen'));
    } else {
        catalog.delete(PDFName.of('PageMode'));
    }
    
    const bytes = await doc.save();
    output = new Blob([bytes], { type: 'application/pdf' });
    outputName = meta.name.replace(/\\.pdf$/i, '_prefs.pdf');
  } catch (err: any) {
    console.error('ViewerPrefs error:', err);
  }
  
  post({
    type: 'viewer-prefs-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded: output ? 1 : 0 }
  });
}

async function extractHiddenTextRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    let report = '--- PDF HIDDEN TEXT / FORENSICS REPORT ---\\n\\n';
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-hidden-text-progress', processedPages: i + 1, totalPages });
      
      const page = doc.getPage(i);
      const contents = page.node.get(PDFName.of('Contents'));
      let streams: any[] = [];
      if (contents instanceof PDFArray) {
        for (let s = 0; s < contents.size(); s++) streams.push(doc.context.lookup(contents.get(s)));
      } else if (contents) {
        streams.push(doc.context.lookup(contents));
      }
      
      for (const stream of streams) {
         if (stream instanceof PDFRawStream) {
            let decoded = stream.contents;
            const filter = stream.dict.lookup(PDFName.of('Filter'));
            if (filter === PDFName.of('FlateDecode')) {
               try { decoded = unzlibSync(stream.contents); } catch(e) {}
            }
            const str = new TextDecoder('utf-8').decode(decoded);
            
            // Check for Invisible Rendering Mode (3 Tr)
            if (str.match(/\\b3\\s+Tr\\b/)) {
               report += \`[!] Invisible Text Mode (3 Tr) detected on Page \${i + 1}\\n\`;
               // Dump all text strings (...) found in this stream as raw forensics data
               const textMatches = str.match(/\\((.*?)\\)/g);
               if (textMatches) {
                  report += '    Raw Decoded Strings: ' + textMatches.map(t => t.replace(/^\\(/, '').replace(/\\)$/, '')).join(' ') + '\\n\\n';
               }
               succeeded++;
            }
         }
      }
    }
    
    if (!cancelled && succeeded > 0) {
      output = new Blob([report], { type: 'text/plain' });
      outputName = meta.name.replace(/\\.pdf$/i, '_hidden_text_report.txt');
    }
  } catch (err: any) {
    console.error('ExtractHiddenText error:', err);
  }
  
  post({
    type: 'extract-hidden-text-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function wipeBookmarksRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const doc = await PDFDocument.load(file);
    const catalog = doc.catalog;
    
    // Completely wipe the Outlines dictionary from the document catalog
    catalog.delete(PDFName.of('Outlines'));
    // Ensure the bookmarks panel does not open automatically
    const pageMode = catalog.lookup(PDFName.of('PageMode'));
    if (pageMode === PDFName.of('UseOutlines')) {
        catalog.delete(PDFName.of('PageMode'));
    }
    
    const bytes = await doc.save();
    output = new Blob([bytes], { type: 'application/pdf' });
    outputName = meta.name.replace(/\\.pdf$/i, '_no_bookmarks.pdf');
  } catch (err: any) {
    console.error('WipeBookmarks error:', err);
  }
  
  post({
    type: 'wipe-bookmarks-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded: output ? 1 : 0 }
  });
}
`;

const handlers = `      case 'viewer-prefs-start':
        cancelled = false;
        viewerPrefsRun(msg.file, msg.meta, msg.prefs);
        break;
      case 'extract-hidden-text-start':
        cancelled = false;
        extractHiddenTextRun(msg.file, msg.meta);
        break;
      case 'wipe-bookmarks-start':
        cancelled = false;
        wipeBookmarksRun(msg.file, msg.meta);
        break;`;

let content = fs.readFileSync('./src/workers/render.worker.ts', 'utf8');
content = content.replace('// --- RUNNERS ---', runners + '\\n\\n// --- RUNNERS ---');
content = content.replace('      case \'cancel\':', handlers + '\\n      case \'cancel\':');
fs.writeFileSync('./src/workers/render.worker.ts', content);

console.log('Worker updated with Phase 6');
