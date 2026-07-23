// web/test/mergeEngine.test.ts
// Verifies MuPdfEngine.merge() produces a real merged PDF (page count is the
// sum of inputs), using mupdf.PDFDocument.graftPage. No byte-level golden
// comparison — merge output isn't pixel-compared the way render() is.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

function load(name: string): ArrayBuffer {
  const buf = readFileSync(path.join(FIXTURES, name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function engine(): Promise<MuPdfEngine> {
  const e = new MuPdfEngine();
  await e.init();
  return e;
}

describe('MuPdfEngine.merge', () => {
  it('merges two documents into one whose page count is the sum of both', async () => {
    const e = await engine();
    const a = await e.open(load('sample-20p.pdf'));
    const b = await e.open(load('sample-20p.pdf'));
    try {
      const merged = await e.merge([a, b]);
      expect(merged).toBeInstanceOf(Uint8Array);
      expect(merged.length).toBeGreaterThan(0);

      // Re-open the merged bytes to confirm the real page count.
      const check = await e.open(merged.buffer.slice(merged.byteOffset, merged.byteOffset + merged.byteLength) as ArrayBuffer);
      try {
        expect(e.pageCount(check)).toBe(40);
      } finally {
        e.close(check);
      }
    } finally {
      e.close(a);
      e.close(b);
    }
  });

  it('merges a single document without error (identity case)', async () => {
    const e = await engine();
    const a = await e.open(load('sample-20p.pdf'));
    try {
      const merged = await e.merge([a]);
      const check = await e.open(merged.buffer.slice(merged.byteOffset, merged.byteOffset + merged.byteLength) as ArrayBuffer);
      try {
        expect(e.pageCount(check)).toBe(20);
      } finally {
        e.close(check);
      }
    } finally {
      e.close(a);
    }
  });
});
