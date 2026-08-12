import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

describe('compress engine method', () => {
  it('compresses sample PDF across all 3 levels without error', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const buf = readFileSync(path.join(FIXTURES, 'sample-20p.pdf'));

    const doc1 = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
    try {
      const outRecommended = await engine.compress(doc1, 'recommended');
      expect(outRecommended.length).toBeGreaterThan(0);
      expect(outRecommended.length).toBeLessThan(buf.length);
    } finally {
      engine.close(doc1);
    }

    const doc2 = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
    try {
      const outExtreme = await engine.compress(doc2, 'extreme');
      expect(outExtreme.length).toBeGreaterThan(0);
      expect(outExtreme.length).toBeLessThan(buf.length);
    } finally {
      engine.close(doc2);
    }

    const doc3 = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
    try {
      const outFast = await engine.compress(doc3, 'fast');
      expect(outFast.length).toBeGreaterThan(0);
      expect(outFast.length).toBeLessThan(buf.length);
    } finally {
      engine.close(doc3);
    }
  });
});
