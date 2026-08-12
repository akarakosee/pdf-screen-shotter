import * as mupdf from 'mupdf';
import fs from 'fs';

try {
  const doc = mupdf.Document.openDocument(fs.readFileSync('test.pdf'), 'application/pdf');
  const iter = new mupdf.OutlineIterator(doc);
  if (iter) {
     console.log('Iterator exists');
  } else {
     console.log('No outline');
  }
} catch (e) {
  console.log("Error:", e.message);
}
