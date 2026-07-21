import { describe, expect, it } from 'vitest';
import { pageFileName, sanitizeBaseName, zipFileName } from '../src/app/naming';

describe('output naming (R6)', () => {
  it('strips extension and keeps Turkish characters', () => {
    expect(sanitizeBaseName('Sözleşme Taslağı.pdf')).toBe('Sözleşme Taslağı');
  });

  it('replaces filesystem-unsafe characters', () => {
    expect(sanitizeBaseName('a/b\\c:d*e?f"g<h>i|j.pdf')).toBe('a_b_c_d_e_f_g_h_i_j');
  });

  it('falls back for empty results', () => {
    expect(sanitizeBaseName('???.pdf')).toBe('___');
    expect(sanitizeBaseName('.pdf')).toBe('document');
  });

  it('builds page and zip names per PRD R6', () => {
    expect(pageFileName('report', 7, 'png')).toBe('report_page_007.png');
    expect(zipFileName('report')).toBe('report_pages.zip');
  });
});
