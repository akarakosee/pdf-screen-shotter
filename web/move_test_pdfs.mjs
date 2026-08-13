import fs from 'fs';
import path from 'path';

const tools = [
  "Extract Tables", "PDF to JSON", "Scan to PDF", "Audio Reader", "Viewer Preferences",
  "Extract Hidden Text", "Wipe Bookmarks", "Extract JavaScript", "Split by Bookmarks",
  "Split by Blank Page", "Extract Attachments", "Extract Color Palette", "Remove Text",
  "PDF to HTML", "Extract Fonts", "Remove Images", "Extract URLs", "Remove Duplicates",
  "Auto-Redact", "Smart Markdown", "Enhance Scan", "Extract Bookmarks", "Add Letterhead",
  "Change Background", "Remove Annotations", "PDF to WebP", "Auto-Crop PDF", "Extract Images",
  "Add Page Numbers", "Remove Blank Pages", "Mix PDF", "Split in Half", "Extract by Keyword",
  "Split by Size", "Add Margins", "PDF to SVG", "PDF to PNG", "PDF to JPG", "PNG to PDF",
  "JPG to PDF", "Merge PDF", "Split PDF", "Organize PDF", "Protect PDF", "Unlock PDF",
  "Extract Text", "OCR PDF", "Compress PDF", "Sanitize PDF", "Watermark PDF", "Flatten PDF",
  "Sign PDF", "Rotate PDF", "Remove Pages", "Crop PDF", "Booklet PDF", "PDF Compare",
  "Redact PDF", "Repair PDF", "Grayscale PDF", "Resize PDF", "Bates Numbering", "N-Up PDF",
  "PDF to PDF-A", "Reverse PDF", "Edit Metadata", "Base64 to PDF", "Invert PDF Colors",
  "Markdown to PDF", "HTML to PDF", "Extract Pages", "Annotate PDF", "Edit PDF", "PDF Forms"
];

const desktopDir = '/Users/ayberk/Desktop/';
const targetDir = path.join(desktopDir, 'PDF_Test_Dosyalari');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

for (let name of tools) {
  name = name.replace(/\//g, '-');
  const sourcePath = path.join(desktopDir, `${name}.pdf`);
  const targetPath = path.join(targetDir, `${name}.pdf`);
  
  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
  }
}
console.log('Moved all test PDFs to a folder!');
