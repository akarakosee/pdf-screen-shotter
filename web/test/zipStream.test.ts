// Verifies the streaming ZIP writer: entries are stored, retrievable, and the
// internal buffer only ever holds compressed output chunks (bounded-memory
// invariant of SISTEM_TASARIMI §3.4 at the unit level).

import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { ZipStream } from '../src/workers/zipStream';

describe('ZipStream', () => {
  it('round-trips entries through a valid ZIP', async () => {
    const zip = new ZipStream();
    const a = new TextEncoder().encode('page one bytes');
    const b = new TextEncoder().encode('page two bytes');
    zip.add('doc_page_001.png', a);
    zip.add('doc_page_002.png', b);
    const blob = await zip.toBlob();
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    expect(Object.keys(files)).toEqual(['doc_page_001.png', 'doc_page_002.png']);
    expect(files['doc_page_001.png']).toEqual(a);
    expect(files['doc_page_002.png']).toEqual(b);
  });

  it('accumulates roughly only the stored bytes (no page buffering)', () => {
    const zip = new ZipStream();
    const page = new Uint8Array(100_000).fill(7);
    zip.add('p1.png', page);
    // Stored entry ≈ payload + small header; wildly larger would mean buffering.
    expect(zip.byteLength).toBeGreaterThan(90_000);
    expect(zip.byteLength).toBeLessThan(110_000);
  });

  it('produces a valid partial ZIP when finalized early (cancel path)', async () => {
    const zip = new ZipStream();
    zip.add('p1.png', new Uint8Array([1, 2, 3]));
    const blob = await zip.toBlob();
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
    expect(files['p1.png']).toEqual(new Uint8Array([1, 2, 3]));
  });
});
