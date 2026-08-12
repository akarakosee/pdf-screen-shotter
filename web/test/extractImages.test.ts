import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

describe('extractImages engine', () => {
  it('runs extractImages on a sample PDF without errors and calls progress', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const buf = readFileSync(path.join(FIXTURES, 'sample-20p.pdf'));
    const doc = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );

    let progressCalls = 0;
    try {
      const images = await engine.extractImages(doc, (page, total, extracted) => {
        progressCalls++;
        expect(page).toBeGreaterThanOrEqual(1);
        expect(total).toBe(20);
        expect(typeof extracted).toBe('number');
      });

      expect(Array.isArray(images)).toBe(true);
      expect(progressCalls).toBe(20);
    } finally {
      engine.close(doc);
    }
  });
});
