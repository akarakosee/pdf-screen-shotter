import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
  "PDF to PDF/A", "Reverse PDF", "Edit Metadata", "Base64 to PDF", "Invert PDF Colors",
  "Markdown to PDF", "HTML to PDF", "Extract Pages", "Annotate PDF", "Edit PDF", "PDF Forms"
];

async function createPDFs() {
  const desktopDir = '/Users/ayberk/Desktop/';
  
  for (const name of tools) {
    if (name.includes("to PDF") && !name.includes("PDF to")) continue; // Skip image to PDF tools which need images, not PDFs

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    
    // Add title
    page.drawText(`Test File for: ${name}`, {
      x: 50,
      y: height - 100,
      size: 24,
      font: fontBold,
      color: rgb(0, 0.4, 0.8),
    });
    
    page.drawText('This is a test PDF generated automatically by AI.', {
      x: 50, y: height - 150, size: 12, font, color: rgb(0,0,0)
    });
    
    // Customizations based on tool type
    if (name === "Extract Hidden Text") {
      page.drawText('THIS IS SUPER SECRET HIDDEN TEXT (White on White)', {
        x: 50, y: height - 200, size: 12, font, color: rgb(1,1,1) // White text on white background
      });
      page.drawText('(A secret message is written above in white text)', {
        x: 50, y: height - 220, size: 10, font, color: rgb(0.5,0.5,0.5)
      });
    }
    
    if (name === "Extract URLs") {
      page.drawText('https://gosecurepdf.com', {
        x: 50, y: height - 200, size: 12, font, color: rgb(0,0,1)
      });
      page.drawText('https://google.com', {
        x: 50, y: height - 220, size: 12, font, color: rgb(0,0,1)
      });
    }

    if (name === "Extract Tables") {
      page.drawText('Header 1, Header 2, Header 3\nData A1, Data A2, Data A3\nData B1, Data B2, Data B3', {
        x: 50, y: height - 220, size: 12, font, color: rgb(0,0,0), lineHeight: 16
      });
    }
    
    if (name.includes("Blank") || name.includes("Remove Pages") || name.includes("Reverse") || name.includes("Split")) {
      pdfDoc.addPage([595, 842]); // Blank page 2
      const p3 = pdfDoc.addPage([595, 842]);
      p3.drawText('Page 3 - End', { x: 50, y: height - 100, size: 24, font: fontBold });
    }
    
    if (name.includes("Images") || name.includes("Colors") || name.includes("Watermark") || name.includes("Scan")) {
       // Draw some colored rectangles
       page.drawRectangle({ x: 50, y: height - 400, width: 100, height: 100, color: rgb(0.8, 0.2, 0.2) });
       page.drawRectangle({ x: 170, y: height - 400, width: 100, height: 100, color: rgb(0.2, 0.8, 0.2) });
       page.drawRectangle({ x: 290, y: height - 400, width: 100, height: 100, color: rgb(0.2, 0.2, 0.8) });
    }

    const pdfBytes = await pdfDoc.save();
    
    // Replace slash to prevent directory path errors
    const safeName = name.replace(/\//g, '-');
    fs.writeFileSync(path.join(desktopDir, `${safeName}.pdf`), pdfBytes);
  }
  console.log('All test PDFs generated on Desktop!');
}

createPDFs().catch(console.error);
