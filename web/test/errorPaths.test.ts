// Error-path tests against the broken fixture set (PRD R1/R5, §3.6 taxonomy).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';
import { EncryptedError } from '../src/engine/PdfEngine';

const BROKEN = path.resolve(__dirname, '../../test/fixtures/broken');

function load(name: string): ArrayBuffer {
  const buf = readFileSync(path.join(BROKEN, name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function engine(): Promise<MuPdfEngine> {
  const e = new MuPdfEngine();
  await e.init();
  return e;
}

describe('engine error taxonomy', () => {
  it('throws EncryptedError for password-protected PDFs', async () => {
    const e = await engine();
    await expect(e.open(load('encrypted.pdf'))).rejects.toThrow(EncryptedError);
  });

  it('throws (non-Encrypted) for unrepairable garbage', async () => {
    const e = await engine();
    const err = await e.open(load('corrupt-garbage.pdf')).catch((x) => x);
    expect(err).toBeInstanceOf(Error);
    expect(err).not.toBeInstanceOf(EncryptedError);
  });

  it('reports zero pages for an empty page tree', async () => {
    const e = await engine();
    const doc = await e.open(load('zero-pages.pdf'));
    try {
      expect(e.pageCount(doc)).toBe(0);
    } finally {
      e.close(doc);
    }
  });

  it('truncated file: repaired and rendered without crashing (degraded output)', async () => {
    // Measured behavior: MuPDF repairs the xref and renders missing pages as
    // blanks instead of throwing — the resilience requirement is "no crash".
    const e = await engine();
    const doc = await e.open(load('corrupt-truncated.pdf'));
    try {
      expect(e.pageCount(doc)).toBe(20);
      const out = await e.renderPage(doc, 20, 100, 'png');
      expect(out.width).toBeGreaterThan(0);
    } finally {
      e.close(doc);
    }
  });
});
