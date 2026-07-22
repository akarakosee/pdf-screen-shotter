// Unit tests for the homepage live-demo render loop (ADR-006). Uses the same
// real fixture and MuPdfEngine as golden.test.ts — no worker/self globals
// needed since the loop itself is a plain async function.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';
import { renderDemoPages } from '../src/workers/demoRender';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

describe('renderDemoPages', () => {
  it('renders pages 1..maxPages in order as PNG bytes', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const doc = await engine.open(
      toArrayBuffer(readFileSync(path.join(FIXTURES, 'sample-20p.pdf'))),
    );
    try {
      const seen: number[] = [];
      await renderDemoPages(engine, doc, 100, 6, ({ page, data }) => {
        seen.push(page);
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toBe(0x89); // PNG magic bytes
        expect(data[1]).toBe(0x50);
      });
      expect(seen).toEqual([1, 2, 3, 4, 5, 6]);
    } finally {
      engine.close(doc);
    }
  });

  it('stops at the document page count when it is smaller than maxPages', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const doc = await engine.open(
      toArrayBuffer(readFileSync(path.join(FIXTURES, 'sample-20p.pdf'))),
    );
    try {
      const seen: number[] = [];
      await renderDemoPages(engine, doc, 100, 999, ({ page }) => seen.push(page));
      expect(seen).toHaveLength(20);
    } finally {
      engine.close(doc);
    }
  });
});
