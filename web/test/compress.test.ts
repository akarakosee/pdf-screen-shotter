import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

describe('compress exploration', () => {
  it('tests saving with garbage collection and compression options', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const buf = readFileSync(path.join(FIXTURES, 'sample-20p.pdf'));
    const doc = await engine.open(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    );
    try {
      const pdf = (doc as any).handle.asPDF();
      const b1 = pdf.saveToBuffer('garbage=compact,compress=yes,clean=yes');
      const data1 = b1.asUint8Array().slice();
      b1.destroy();

      const b2 = pdf.saveToBuffer('garbage=deduplicate,compress=yes,clean=yes');
      const data2 = b2.asUint8Array().slice();
      b2.destroy();

      const b3 = pdf.saveToBuffer('garbage=compact,compress=yes');
      const data3 = b3.asUint8Array().slice();
      b3.destroy();

      console.log('Original:', buf.length, 'compact+clean:', data1.length, 'dedup+clean:', data2.length, 'compact-only:', data3.length);
      expect(data1.length).toBeGreaterThan(0);
      expect(data2.length).toBeGreaterThan(0);
      expect(data3.length).toBeGreaterThan(0);
    } finally {
      engine.close(doc);
    }
  });
});
