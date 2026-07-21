// The JPG tool shares the whole pipeline with PNG except the encode call —
// make sure that path actually produces a JPEG (PRD: /pdf-to-jpg = same shell,
// format parameter).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

describe('jpg encoding', () => {
  it('renders a page as JPEG bytes', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const buf = readFileSync(path.join(FIXTURES, 'sample-20p.pdf'));
    const doc = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
    try {
      const out = await engine.renderPage(doc, 1, 150, 'jpg', 0.8);
      // JPEG magic: FF D8 FF
      expect([...out.data.slice(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
      expect(out.width).toBe(1240);
    } finally {
      engine.close(doc);
    }
  });
});
