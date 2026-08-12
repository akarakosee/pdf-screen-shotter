import fs from 'fs';

const runners = `
import { unzlibSync, zlibSync } from 'fflate';

async function extractAttachmentsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const zip = new JSZip();
    const doc = await PDFDocument.load(file);
    const catalog = doc.catalog;
    
    function processNameTree(dict: any) {
      if (!dict) return;
      const names = dict.lookupMaybe(PDFName.of('Names'), PDFArray);
      if (names) {
        for (let i = 0; i < names.size(); i += 2) {
           const fileSpec = doc.context.lookup(names.get(i + 1), PDFDict);
           if (fileSpec) {
             const ef = fileSpec.lookupMaybe(PDFName.of('EF'), PDFDict);
             if (ef) {
               const stream = doc.context.lookup(ef.get(PDFName.of('F')), PDFRawStream);
               if (stream) {
                 const fileNameStr = fileSpec.lookupMaybe(PDFName.of('F'), PDFString)?.decodeText() || \`attachment_\${succeeded}\`;
                 let decodedContents = stream.contents;
                 const filter = stream.dict.lookup(PDFName.of('Filter'));
                 if (filter === PDFName.of('FlateDecode')) {
                    try { decodedContents = unzlibSync(stream.contents); } catch(e) {}
                 }
                 zip.file(fileNameStr, decodedContents);
                 succeeded++;
               }
             }
           }
        }
      }
      const kids = dict.lookupMaybe(PDFName.of('Kids'), PDFArray);
      if (kids) {
        for (let i = 0; i < kids.size(); i++) {
           processNameTree(doc.context.lookup(kids.get(i), PDFDict));
        }
      }
    }

    const namesDict = catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
    if (namesDict) {
      const embeddedFiles = namesDict.lookupMaybe(PDFName.of('EmbeddedFiles'), PDFDict);
      if (embeddedFiles) {
         processNameTree(embeddedFiles);
      }
    }
    
    // Also check FileAttachment annotations
    const totalPages = doc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-attachments-progress', processedPages: i + 1, totalPages });
      
      const page = doc.getPage(i);
      const annots = page.node.Annots();
      if (annots) {
        for (let j = 0; j < annots.size(); j++) {
           const annot = doc.context.lookup(annots.get(j), PDFDict);
           if (annot && annot.lookup(PDFName.of('Subtype')) === PDFName.of('FileAttachment')) {
             const fileSpec = doc.context.lookup(annot.get(PDFName.of('FS')), PDFDict);
             if (fileSpec) {
               const ef = fileSpec.lookupMaybe(PDFName.of('EF'), PDFDict);
               if (ef) {
                 const stream = doc.context.lookup(ef.get(PDFName.of('F')), PDFRawStream);
                 if (stream) {
                    const fileNameStr = fileSpec.lookupMaybe(PDFName.of('F'), PDFString)?.decodeText() || \`annot_attach_\${succeeded}\`;
                    let decodedContents = stream.contents;
                    const filter = stream.dict.lookup(PDFName.of('Filter'));
                    if (filter === PDFName.of('FlateDecode')) {
                       try { decodedContents = unzlibSync(stream.contents); } catch(e) {}
                    }
                    zip.file(fileNameStr, decodedContents);
                    succeeded++;
                 }
               }
             }
           }
        }
      }
    }
    
    if (!cancelled && succeeded > 0) {
      output = await zip.generateAsync({ type: 'blob' });
      outputName = meta.name.replace(/\\.pdf$/i, '_attachments.zip');
    }
  } catch (err: any) {
    console.error('ExtractAttachments error:', err);
  }
  
  post({
    type: 'extract-attachments-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}

async function extractColorsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    const colors = new Set<string>();
    
    function rgbToHex(r: number, g: number, b: number) {
      const toHex = (c: number) => {
        const hex = Math.round(Math.min(Math.max(0, c), 1) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'extract-colors-progress', processedPages: i + 1, totalPages });
      
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
            const regex = /([0-9.]+)\\s+([0-9.]+)\\s+([0-9.]+)\\s+(rg|RG)\\b/g;
            let match;
            while ((match = regex.exec(str)) !== null) {
               const r = parseFloat(match[1]);
               const g = parseFloat(match[2]);
               const b = parseFloat(match[3]);
               colors.add(rgbToHex(r, g, b).toUpperCase());
               succeeded++;
            }
         }
      }
    }
    
    if (!cancelled && colors.size > 0) {
      let content = 'Extracted PDF Color Palette (HEX):\\n\\n' + Array.from(colors).join('\\n');
      output = new Blob([content], { type: 'text/plain' });
      outputName = meta.name.replace(/\\.pdf$/i, '_palette.txt');
    }
  } catch (err: any) {
    console.error('ExtractColors error:', err);
  }
  
  post({
    type: 'extract-colors-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded: colors.size }
  });
}

async function removeTextRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let succeeded = 0;
  
  try {
    const doc = await PDFDocument.load(file);
    const totalPages = doc.getPageCount();
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      post({ type: 'remove-text-progress', processedPages: i + 1, totalPages });
      
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
            let wasFlate = false;
            if (filter === PDFName.of('FlateDecode')) {
               try { decoded = unzlibSync(stream.contents); wasFlate = true; } catch(e) {}
            }
            const str = new TextDecoder('utf-8').decode(decoded);
            
            // Remove BT...ET blocks which contain text drawing operators
            const newStr = str.replace(/BT[\\s\\S]*?ET/g, '');
            if (newStr !== str) {
               const newBytes = new TextEncoder().encode(newStr);
               if (wasFlate) {
                  stream.contents = zlibSync(newBytes);
               } else {
                  stream.contents = newBytes;
               }
               succeeded++;
            }
         }
      }
    }
    
    if (!cancelled) {
      const bytes = await doc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = meta.name.replace(/\\.pdf$/i, '_no_text.pdf');
      succeeded = totalPages;
    }
  } catch (err: any) {
    console.error('RemoveText error:', err);
  }
  
  post({
    type: 'remove-text-done',
    result: { originalSize: file.byteLength, compressedSize: output?.size || 0, durationMs: Date.now() - started, cancelled, output, outputName, succeeded }
  });
}
`;

const handlers = `      case 'extract-attachments-start':
        cancelled = false;
        extractAttachmentsRun(msg.file, msg.meta);
        break;
      case 'extract-colors-start':
        cancelled = false;
        extractColorsRun(msg.file, msg.meta);
        break;
      case 'remove-text-start':
        cancelled = false;
        removeTextRun(msg.file, msg.meta);
        break;`;

let content = fs.readFileSync('./src/workers/render.worker.ts', 'utf8');
content = content.replace('// --- RUNNERS ---', runners + '\\n\\n// --- RUNNERS ---');
content = content.replace('      case \'cancel\':', handlers + '\\n      case \'cancel\':');
fs.writeFileSync('./src/workers/render.worker.ts', content);

console.log('Worker updated with Phase 4');
