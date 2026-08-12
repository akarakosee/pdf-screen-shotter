import * as mupdf from 'mupdf';
import fs from 'fs';

try {
  // Create a dummy PDF with an outline using pdf-lib
  const { PDFDocument } = require('pdf-lib');
  // pdf-lib doesn't support creating outlines easily. Let's just create a generic PDF and see if OutlineIterator doesn't crash.
  
  const doc = mupdf.Document.openDocument(fs.readFileSync('package.json'), 'application/pdf');
  const iter = new mupdf.OutlineIterator(doc);
  console.log("Success");
} catch (e) {
  console.log("Error:", e.message);
}
