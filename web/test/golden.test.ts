// Golden-file engine tests (quality gate 1, ADR-001).
// Renders test/fixtures/sample-20p.pdf through the PdfEngine adapter and
// pixel-compares decoded output against the golden references:
//   - golden-sample-20p-p1-150dpi.png  (PyMuPDF, desktop engine — 0% diff proven)
//   - mupdf-sample-20p-p1-300dpi.png   (MuPDF.js 300 DPI regression reference)
// Comparison is on decoded pixels, not file bytes (encoder metadata may differ).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function decode(data: Uint8Array): PNG {
  return PNG.sync.read(Buffer.from(data));
}

async function renderPage1(dpi: number): Promise<PNG> {
  const engine = new MuPdfEngine();
  await engine.init();
  const doc = await engine.open(toArrayBuffer(readFileSync(path.join(FIXTURES, 'sample-20p.pdf'))));
  try {
    expect(engine.pageCount(doc)).toBe(20);
    const out = await engine.renderPage(doc, 1, dpi, 'png');
    return decode(out.data);
  } finally {
    engine.close(doc);
  }
}

function expectPixelEqual(actual: PNG, golden: PNG) {
  expect(actual.width).toBe(golden.width);
  expect(actual.height).toBe(golden.height);
  // ADR-001 tolerance: effectively 0% diff → exact pixel equality.
  let diff = 0;
  for (let i = 0; i < golden.data.length; i++) {
    if (actual.data[i] !== golden.data[i]) diff++;
  }
  expect(diff, `${diff} differing bytes of ${golden.data.length}`).toBe(0);
}

describe('golden-file render equivalence', () => {
  it('matches the desktop PyMuPDF reference at 150 DPI', async () => {
    const golden = decode(readFileSync(path.join(FIXTURES, 'golden-sample-20p-p1-150dpi.png')));
    expectPixelEqual(await renderPage1(150), golden);
  });

  it('matches the 300 DPI regression reference', async () => {
    const golden = decode(readFileSync(path.join(FIXTURES, 'mupdf-sample-20p-p1-300dpi.png')));
    expectPixelEqual(await renderPage1(300), golden);
  });
});
