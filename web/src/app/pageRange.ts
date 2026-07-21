// Page-range parser (PRD R2): "1-5,8,11-13" syntax.
// Invalid input throws; ranges beyond the page count are clamped and flagged
// so the UI can tell the user (R2 acceptance criterion).

export interface ParsedRange {
  pages: number[]; // sorted, unique, 1-based
  clamped: boolean; // true if any part exceeded pageCount and was cut
}

export class PageRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageRangeError';
  }
}

const PART = /^(\d+)(?:-(\d+))?$/;

export function parsePageRange(input: string, pageCount: number): ParsedRange {
  const trimmed = input.trim();
  if (trimmed === '') throw new PageRangeError('empty range');
  const pages = new Set<number>();
  let clamped = false;

  for (const rawPart of trimmed.split(',')) {
    const part = rawPart.trim();
    const m = PART.exec(part);
    if (!m) throw new PageRangeError(`invalid part: "${part}"`);
    const start = parseInt(m[1]!, 10);
    const end = m[2] !== undefined ? parseInt(m[2]!, 10) : start;
    if (start < 1 || end < start) throw new PageRangeError(`invalid part: "${part}"`);
    if (start > pageCount) {
      clamped = true;
      continue;
    }
    const cappedEnd = Math.min(end, pageCount);
    if (cappedEnd < end) clamped = true;
    for (let p = start; p <= cappedEnd; p++) pages.add(p);
  }

  if (pages.size === 0) throw new PageRangeError('range is entirely outside the document');
  return { pages: [...pages].sort((a, b) => a - b), clamped };
}
