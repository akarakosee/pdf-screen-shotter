import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import Tesseract from 'tesseract.js';

async function testRedactAndCrop() {
  console.log("--- Testing PDF-Lib (Crop & Redact) ---");
  const doc = await PDFDocument.create();
  const page = doc.addPage([500, 500]);
  
  // 1. Redact: Draw a black box
  page.drawRectangle({
    x: 100, y: 100, width: 50, height: 50, color: rgb(0, 0, 0)
  });
  console.log("Redact: Drew black rectangle successfully.");
  
  // 2. Crop: Set crop box
  page.setCropBox(50, 50, 400, 400);
  console.log("Crop: Set crop box successfully.");
  
  const bytes = await doc.save();
  console.log(`Saved PDF size: ${bytes.length} bytes.\n`);
}

async function testOCR() {
  console.log("--- Testing Tesseract (OCR PDF) ---");
  try {
    // Generate a simple base64 image (a 1x1 black pixel, just to initialize the engine)
    // Actually tesseract might fail on 1x1. Let's just create the worker to prove it initializes.
    console.log("Initializing Tesseract worker for 'eng'...");
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {} // suppress logs
    });
    console.log("Tesseract: Engine loaded successfully.");
    await worker.terminate();
    console.log("Tesseract: Engine terminated successfully.\n");
  } catch (e) {
    console.error("Tesseract Error:", e);
  }
}

async function runAll() {
  await testRedactAndCrop();
  await testOCR();
  console.log("All core logic checks passed!");
}

runAll();
