import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { flattenPdf } from '../src/engine/flattenPdf';

describe('flattenPdf engine', () => {
  it('flattens a standard PDF document without errors', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595, 842]);
    page.drawText('Hello Flatten');
    const bytes = await doc.save();
    const file = new File([bytes], 'test.pdf', { type: 'application/pdf' });

    const res = await flattenPdf(file, { removeAnnotations: true });
    expect(res.output).toBeInstanceOf(Blob);
    expect(res.output.type).toBe('application/pdf');
    expect(res.outputName).toBe('test_flattened.pdf');
    expect(typeof res.durationMs).toBe('number');
  });
});
