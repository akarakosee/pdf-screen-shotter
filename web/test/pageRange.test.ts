import { describe, expect, it } from 'vitest';
import { PageRangeError, parsePageRange } from '../src/app/pageRange';

describe('parsePageRange', () => {
  it('parses the documented syntax "1-5,8,11-13"', () => {
    expect(parsePageRange('1-5,8,11-13', 20)).toEqual({
      pages: [1, 2, 3, 4, 5, 8, 11, 12, 13],
      clamped: false,
    });
  });

  it('handles single pages and whitespace', () => {
    expect(parsePageRange(' 3 , 1 ', 10).pages).toEqual([1, 3]);
  });

  it('deduplicates overlapping ranges', () => {
    expect(parsePageRange('1-4,3-6', 10).pages).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('clamps ranges past the page count and flags it (R2)', () => {
    expect(parsePageRange('18-25', 20)).toEqual({ pages: [18, 19, 20], clamped: true });
    expect(parsePageRange('1,30', 20)).toEqual({ pages: [1], clamped: true });
  });

  it('throws on invalid input', () => {
    for (const bad of ['', 'abc', '5-2', '0', '1-', '-3', '1,,2', '1;3']) {
      expect(() => parsePageRange(bad, 20), bad).toThrow(PageRangeError);
    }
  });

  it('throws when the whole range is outside the document', () => {
    expect(() => parsePageRange('25-30', 20)).toThrow(PageRangeError);
  });
});
