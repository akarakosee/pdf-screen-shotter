import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { signPdf } from '../src/engine/signPdf';

// Minimal 1x1 transparent PNG Uint8Array
const MINIMAL_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82
]);

describe('signPdf engine', () => {
  it('stamps a signature onto a PDF document without errors', async () => {
    const doc = await PDFDocument.create();
    doc.addPage([595, 842]);
    const bytes = await doc.save();
    const file = new File([bytes], 'test.pdf', { type: 'application/pdf' });

    const res = await signPdf(file, {
      signatureBytes: MINIMAL_PNG,
      placements: [
        {
          pageIndex: -1,
          xFrac: 0.65,
          yFrac: 0.82,
          widthFrac: 0.28,
          heightFrac: 0.12,
        },
      ],
    });

    expect(res.output).toBeInstanceOf(Blob);
    expect(res.output.type).toBe('application/pdf');
    expect(res.outputName).toBe('test_signed.pdf');
    expect(res.pagesSigned).toBe(1);
    expect(typeof res.durationMs).toBe('number');
  });

  it('throws MISSING_SIGNATURE_BYTES if signature array is empty', async () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    await expect(
      signPdf(file, {
        signatureBytes: new Uint8Array(),
        placements: [],
      })
    ).rejects.toThrow('MISSING_SIGNATURE_BYTES');
  });
});
