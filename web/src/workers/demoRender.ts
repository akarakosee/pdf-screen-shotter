// Pure page-render loop for the homepage's live Developing Tray demo
// (ADR-006). Extracted out of render.worker.ts so the loop is unit-testable
// without a Worker global (self.postMessage/onmessage) in scope — the worker
// wraps each yielded page in a postMessage, this file knows nothing about
// messaging.

import type { PdfDoc, PdfEngine } from '../engine/PdfEngine';

export interface DemoPage {
  page: number; // 1-based
  data: Uint8Array; // PNG bytes
}

/** Renders pages 1..min(engine.pageCount(doc), maxPages) of an already-open
 * doc as PNG, calling onPage once per page in order as it completes. */
export async function renderDemoPages(
  engine: PdfEngine,
  doc: PdfDoc,
  dpi: number,
  maxPages: number,
  onPage: (result: DemoPage) => void,
): Promise<void> {
  const count = Math.min(engine.pageCount(doc), maxPages);
  for (let page = 1; page <= count; page++) {
    const out = await engine.renderPage(doc, page, dpi, 'png');
    onPage({ page, data: out.data });
  }
}
