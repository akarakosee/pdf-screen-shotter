import * as mupdf from 'mupdf';
import fs from 'fs';

try {
  // Let's just see if mupdf.Document exists
  console.log(Object.keys(mupdf));
} catch (e) {
  console.log("Error:", e.message);
}
