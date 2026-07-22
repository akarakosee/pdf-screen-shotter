# Signature Hero + Taste-Skill Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage's "Developing Tray" from a small, symbolic, static corner
card into the hero itself — a real, live PDF-to-image conversion running in the
browser on page load — and fix the concrete AI-slop patterns (`taste-skill` audit,
ADR-006) found across the homepage and tool pages: the 3-equal-card "How it works"
section, decorative status dots, border-per-row FAQ lists, and total layout symmetry.

**Architecture:** The existing single-worker render pipeline (`render.worker.ts`,
`MuPdfEngine`, `JobController`) gains one new message pair (`demo-render` →
`demo-page`/`demo-done`/`demo-error`) that renders a small bundled sample PDF page by
page, exactly like `start()` already does for real conversions — no new engine, no
new worker. A homepage-only React island (`DevelopingTray.tsx`, `client:idle`) owns a
dedicated `JobController` instance and renders each page's real thumbnail into the
tray grid as it arrives. Everything else (filmstrip, FAQ grouping, asymmetric grid,
scroll-reveal) is Astro/CSS-only, no new JS runtime surface.

**Tech Stack:** Astro 5, React islands, TypeScript, Tailwind v4 (`web/src/styles/global.css` `@theme`), Vitest, Playwright, MuPDF WASM (`mupdf` npm package) — all already in the project, no new dependencies.

## Global Constraints

- ADR-006 is the binding spec: `/Users/ayberk/Desktop/PDF_Screen_Shotter/ADR-006-imza-hero-ve-taste-skill-denetimi.md`. Read it before starting Task 1.
- No new color tokens (ADR-005/006 both close that door). Reuse existing `--color-*` tokens from `web/src/styles/global.css`.
- All motion: `transform`/`opacity` only (no animated `box-shadow`, `width`, layout properties). `prefers-reduced-motion` must neutralize every new animation — the existing global rule in `global.css` (`@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; ... } }`) already does this for any standard CSS `animation`; do not bypass it with JS-driven animation loops that ignore it.
- No new AI-tell patterns: no 3-equal-card grids, no decorative status dots without a real state behind them, no `border-b` on every row of a list >3 items, no full symmetry across an entire page.
- The demo asset must be a real, already-existing fixture (`test/fixtures/sample-20p.pdf`) — do not fabricate a new "sample" PDF.
- Existing test suite (22 unit + 9 e2e as of ADR-005) must stay green throughout; new tests are additive.
- `npm run build` + `node scripts/check-wasm-budget.mjs` must stay under the 6 MB gzip WASM budget (ADR-001) — this plan adds zero new WASM, only a new small PDF asset and a static PNG fallback, both tiny.
- EN and TR pages must stay in parity (`web/src/pages/index.astro` and `web/src/pages/tr/index.astro` mirror each other; same for `pdf-to-png`/`pdf-to-jpg` EN+TR via the shared `ToolPage.astro`).

---

## File Structure

New files:
- `web/src/workers/demoRender.ts` — pure, unit-testable page-render loop shared by the worker and its test.
- `web/test/demoRender.test.ts` — unit tests for the loop above (real fixture, real MuPDF).
- `web/test/jobControllerDemo.test.ts` — unit tests for `JobController`'s new demo methods (`FakeWorker` pattern, mirrors `jobControllerRespawn.test.ts`).
- `web/src/components/DevelopingTray.tsx` — homepage-only React island, live tray demo.
- `web/public/demo-sample.pdf` — copy of `test/fixtures/sample-20p.pdf` (fetchable asset for the homepage).
- `web/public/demo-fallback.png` — copy of `test/fixtures/golden-sample-20p-p1-150dpi.png` (real image, no-WASM/error fallback).
- `web/e2e/home.spec.ts` — e2e coverage for the live tray (real thumbnails render, no cross-origin egress).

Modified files:
- `web/src/core/types.ts` — new worker message variants.
- `web/src/workers/render.worker.ts` — wire the new message to `demoRender.ts`.
- `web/src/app/JobController.ts` — `demoRender()` method + 3 new `JobEvents` callbacks.
- `web/src/styles/global.css` — tray effect keyframes/classes, filmstrip classes, scroll-reveal class, DropZone breathing amplitude bump.
- `web/src/pages/index.astro` + `web/src/pages/tr/index.astro` — hero reorder (headline above tray), mount `DevelopingTray`, replace "How it works" 3-card grid with the filmstrip, remove the old inline `devTray`/`devAppear` script.
- `web/src/layouts/ToolPage.astro` — FAQ grouped-cluster layout (removes `border-b` per row), scroll-reveal wiring for "How it works"/FAQ sections.
- `web/src/components/ToolShell.tsx` — options-phase grid `3fr/2fr` → `2fr/3fr`.

---

### Task 1: Worker protocol — `demo-render` message types

**Files:**
- Modify: `web/src/core/types.ts`

**Interfaces:**
- Produces: `UiToWorkerMessage` variant `{ type: 'demo-render'; file: ArrayBuffer; dpi: number; maxPages: number }`; `WorkerToUiMessage` variants `{ type: 'demo-page'; page: number; blob: Blob }`, `{ type: 'demo-done' }`, `{ type: 'demo-error'; message: string }`.

- [ ] **Step 1: Add the new message variants**

In `web/src/core/types.ts`, find the `UiToWorkerMessage` union and add the new variant:

```ts
export type UiToWorkerMessage =
  | { type: 'start'; files: ArrayBuffer[]; meta: FileMeta[]; options: ExportOptions }
  | { type: 'preview'; file: ArrayBuffer; dpi: number }
  | { type: 'inspect'; fileId: string; file: ArrayBuffer } // ADR-003: page count, no render
  | { type: 'demo-render'; file: ArrayBuffer; dpi: number; maxPages: number } // ADR-006: homepage live hero demo
  | { type: 'cancel' };
```

Find `WorkerToUiMessage` and add the three new variants:

```ts
export type WorkerToUiMessage =
  | { type: 'ready' }
  | { type: 'preview-done'; blob: Blob }
  | { type: 'preview-error'; message: string } // a single bad preview never tears down the worker
  | { type: 'inspect-done'; fileId: string; pageCount: number } // ADR-003; errors reuse file-error
  | { type: 'progress'; data: ProgressData }
  | { type: 'page-error'; error: PageError } // page skipped, run continues
  | { type: 'file-error'; fileId: string; message: string } // file skipped, next file
  | { type: 'done'; result: ExportResult }
  | { type: 'demo-page'; page: number; blob: Blob } // ADR-006: one real thumbnail arrived
  | { type: 'demo-done' } // ADR-006: demo finished
  | { type: 'demo-error'; message: string } // ADR-006: demo failed, never fatal
  | { type: 'fatal'; message: string }; // JobController terminates + respawns worker
```

- [ ] **Step 2: Typecheck**

Run: `cd web && npm run check`
Expected: `0 errors` (the new variants are additive; nothing currently exhaustively switches over these unions in a way that would break — `render.worker.ts`'s `self.onmessage` handler and `JobController`'s `handle()` both use `if`/`switch` with a default no-op, not an exhaustive check).

- [ ] **Step 3: Commit**

```bash
git add web/src/core/types.ts
git commit -m "feat(web): add demo-render worker message types (ADR-006)"
```

---

### Task 2: `renderDemoPages` — pure, testable page-render loop

**Files:**
- Create: `web/src/workers/demoRender.ts`
- Create: `web/test/demoRender.test.ts`

**Interfaces:**
- Consumes: `PdfEngine`, `PdfDoc` from `web/src/engine/PdfEngine.ts` (exact signatures: `renderPage(doc, page, dpi, format, jpgQuality?): Promise<RenderOutput>`, `pageCount(doc): number`).
- Produces: `renderDemoPages(engine: PdfEngine, doc: PdfDoc, dpi: number, maxPages: number, onPage: (result: DemoPage) => void): Promise<void>`, and the `DemoPage` type (`{ page: number; data: Uint8Array }`), consumed by Task 3's `render.worker.ts` wiring.

- [ ] **Step 1: Write the failing test**

Create `web/test/demoRender.test.ts`:

```ts
// Unit tests for the homepage live-demo render loop (ADR-006). Uses the same
// real fixture and MuPdfEngine as golden.test.ts — no worker/self globals
// needed since the loop itself is a plain async function.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MuPdfEngine } from '../src/engine/MuPdfEngine';
import { renderDemoPages } from '../src/workers/demoRender';

const FIXTURES = path.resolve(__dirname, '../../test/fixtures');

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

describe('renderDemoPages', () => {
  it('renders pages 1..maxPages in order as PNG bytes', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const doc = await engine.open(
      toArrayBuffer(readFileSync(path.join(FIXTURES, 'sample-20p.pdf'))),
    );
    try {
      const seen: number[] = [];
      await renderDemoPages(engine, doc, 100, 6, ({ page, data }) => {
        seen.push(page);
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toBe(0x89); // PNG magic bytes
        expect(data[1]).toBe(0x50);
      });
      expect(seen).toEqual([1, 2, 3, 4, 5, 6]);
    } finally {
      engine.close(doc);
    }
  });

  it('stops at the document page count when it is smaller than maxPages', async () => {
    const engine = new MuPdfEngine();
    await engine.init();
    const doc = await engine.open(
      toArrayBuffer(readFileSync(path.join(FIXTURES, 'sample-20p.pdf'))),
    );
    try {
      const seen: number[] = [];
      await renderDemoPages(engine, doc, 100, 999, ({ page }) => seen.push(page));
      expect(seen).toHaveLength(20);
    } finally {
      engine.close(doc);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run test/demoRender.test.ts`
Expected: FAIL — `Cannot find module '../src/workers/demoRender'`

- [ ] **Step 3: Write the implementation**

Create `web/src/workers/demoRender.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run test/demoRender.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add web/src/workers/demoRender.ts web/test/demoRender.test.ts
git commit -m "feat(web): renderDemoPages loop for the live hero demo (ADR-006)"
```

---

### Task 3: Wire `demo-render` into `render.worker.ts`

**Files:**
- Modify: `web/src/workers/render.worker.ts`

**Interfaces:**
- Consumes: `renderDemoPages` from Task 2 (`web/src/workers/demoRender.ts`); `EncryptedError` from `../engine/PdfEngine`.
- Produces: worker now handles `demo-render` messages and posts `demo-page`/`demo-done`/`demo-error`, consumed by Task 4's `JobController`.

- [ ] **Step 1: Import the new loop**

In `web/src/workers/render.worker.ts`, add to the top-of-file imports:

```ts
import { renderDemoPages } from './demoRender';
```

- [ ] **Step 2: Route the message in `self.onmessage`**

Find this block:

```ts
    try {
      await ready;
      if (msg.type === 'preview') await preview(msg.file, msg.dpi ?? PREVIEW_DPI);
      else if (msg.type === 'inspect') await inspect(msg.fileId, msg.file);
      else if (msg.type === 'start') await run(msg.files, msg.meta, msg.options);
    } catch (e) {
```

Replace with:

```ts
    try {
      await ready;
      if (msg.type === 'preview') await preview(msg.file, msg.dpi ?? PREVIEW_DPI);
      else if (msg.type === 'inspect') await inspect(msg.fileId, msg.file);
      else if (msg.type === 'start') await run(msg.files, msg.meta, msg.options);
      else if (msg.type === 'demo-render') await demoRenderHandler(msg.file, msg.dpi, msg.maxPages);
    } catch (e) {
```

- [ ] **Step 3: Add the handler function**

Add this function after `preview()` (before `run()`):

```ts
// ADR-006: renders a bundled sample PDF page-by-page for the homepage's live
// hero demo. A failure here (bad asset, WASM hiccup) never takes the worker
// down — same pattern as preview()'s scoped error handling.
async function demoRenderHandler(file: ArrayBuffer, dpi: number, maxPages: number): Promise<void> {
  let doc;
  try {
    doc = await engine.open(file);
  } catch (e) {
    console.error('[worker] demo-render: engine.open failed:', e);
    post({ type: 'demo-error', message: e instanceof Error ? e.message : String(e) });
    return;
  }
  try {
    await renderDemoPages(engine, doc, dpi, maxPages, ({ page, data }) => {
      post({ type: 'demo-page', page, blob: new Blob([data as BlobPart], { type: 'image/png' }) });
    });
    post({ type: 'demo-done' });
  } catch (e) {
    console.error('[worker] demo-render: renderPage failed:', e);
    post({ type: 'demo-error', message: e instanceof Error ? e.message : String(e) });
  } finally {
    engine.close(doc);
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `cd web && npm run check`
Expected: `0 errors`

- [ ] **Step 5: Commit**

```bash
git add web/src/workers/render.worker.ts
git commit -m "feat(web): handle demo-render in the render worker (ADR-006)"
```

---

### Task 4: `JobController.demoRender()` + events

**Files:**
- Modify: `web/src/app/JobController.ts`
- Create: `web/test/jobControllerDemo.test.ts`

**Interfaces:**
- Produces: `JobController.demoRender(file: File, dpi: number, maxPages: number): Promise<void>`; `JobEvents.onDemoPage?: (page: number, blob: Blob) => void`, `onDemoDone?: () => void`, `onDemoError?: (message: string) => void` — consumed by Task 6's `DevelopingTray.tsx`.

- [ ] **Step 1: Write the failing test**

Create `web/test/jobControllerDemo.test.ts`:

```ts
// Unit tests for JobController's demo-render wiring (ADR-006). Mirrors the
// FakeWorker pattern from jobControllerRespawn.test.ts — no real Worker/WASM.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobController } from '../src/app/JobController';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage: ((ev: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  posted: unknown[] = [];

  constructor(
    public url: URL,
    public opts: unknown,
  ) {
    FakeWorker.instances.push(this);
  }

  postMessage(msg: unknown): void {
    this.posted.push(msg);
  }

  terminate(): void {
    /* no-op */
  }

  emit(data: unknown): void {
    this.onmessage?.({ data });
  }
}

function latestWorker(): FakeWorker {
  return FakeWorker.instances[FakeWorker.instances.length - 1]!;
}

describe('JobController demo-render', () => {
  beforeEach(() => {
    FakeWorker.instances = [];
    vi.stubGlobal('Worker', FakeWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts a demo-render message with dpi and maxPages', async () => {
    const controller = new JobController({});
    const file = new File(['%PDF-'], 'demo-sample.pdf', { type: 'application/pdf' });

    await controller.demoRender(file, 100, 6);

    const posted = latestWorker().posted[0] as { type: string; dpi: number; maxPages: number };
    expect(posted.type).toBe('demo-render');
    expect(posted.dpi).toBe(100);
    expect(posted.maxPages).toBe(6);
  });

  it('dispatches demo-page, demo-done, and demo-error to their handlers', async () => {
    const onDemoPage = vi.fn();
    const onDemoDone = vi.fn();
    const onDemoError = vi.fn();
    const controller = new JobController({ onDemoPage, onDemoDone, onDemoError });
    const file = new File(['%PDF-'], 'demo-sample.pdf', { type: 'application/pdf' });
    await controller.demoRender(file, 100, 6);

    const blob = new Blob(['x'], { type: 'image/png' });
    latestWorker().emit({ type: 'demo-page', page: 1, blob });
    latestWorker().emit({ type: 'demo-done' });
    latestWorker().emit({ type: 'demo-error', message: 'boom' });

    expect(onDemoPage).toHaveBeenCalledWith(1, blob);
    expect(onDemoDone).toHaveBeenCalledTimes(1);
    expect(onDemoError).toHaveBeenCalledWith('boom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run test/jobControllerDemo.test.ts`
Expected: FAIL — `controller.demoRender is not a function`

- [ ] **Step 3: Add `demoRender()` and the new events**

In `web/src/app/JobController.ts`, extend the `JobEvents` interface:

```ts
export interface JobEvents {
  onReady?: () => void;
  onPreview?: (blob: Blob) => void;
  onPreviewError?: (message: string) => void;
  onInspect?: (fileId: string, pageCount: number) => void;
  onProgress?: (data: ProgressData) => void;
  onPageError?: (error: PageError) => void;
  onFileError?: (fileId: string, message: string) => void;
  onDone?: (result: ExportResult) => void;
  onFatal?: (message: string) => void;
  /** Fired once, instead of onFatal, when the worker has failed too many
   * times in a row and JobController has given up respawning it. Every
   * method becomes a no-op after this until the page is reloaded. */
  onUnavailable?: (message: string) => void;
  /** ADR-006: one real thumbnail from the homepage live demo arrived. */
  onDemoPage?: (page: number, blob: Blob) => void;
  /** ADR-006: the demo finished rendering all its pages. */
  onDemoDone?: () => void;
  /** ADR-006: the demo failed — never fatal, caller falls back to a static image. */
  onDemoError?: (message: string) => void;
}
```

Add the method next to `preview()`:

```ts
  /** ADR-006: renders up to maxPages of a bundled sample PDF for the
   * homepage's live hero demo. Never throws — failures arrive as
   * onDemoError, same scoped-error pattern as preview(). */
  async demoRender(file: File, dpi: number, maxPages: number): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'demo-render', file: buf, dpi, maxPages }, [buf]);
  }
```

Extend the `handle()` switch:

```ts
      case 'fatal':
        this.handleFatal(msg.message);
        break;
      case 'demo-page':
        this.events.onDemoPage?.(msg.page, msg.blob);
        break;
      case 'demo-done':
        this.events.onDemoDone?.();
        break;
      case 'demo-error':
        this.events.onDemoError?.(msg.message);
        break;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run test/jobControllerDemo.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full unit suite to check nothing else broke**

Run: `cd web && npm test`
Expected: all suites PASS (previous 22 + 4 new = 26)

- [ ] **Step 6: Commit**

```bash
git add web/src/app/JobController.ts web/test/jobControllerDemo.test.ts
git commit -m "feat(web): JobController.demoRender + demo events (ADR-006)"
```

---

### Task 5: Demo assets — real sample PDF + real fallback image

**Files:**
- Create: `web/public/demo-sample.pdf` (copy of `test/fixtures/sample-20p.pdf`)
- Create: `web/public/demo-fallback.png` (copy of `test/fixtures/golden-sample-20p-p1-150dpi.png`)

**Interfaces:**
- Produces: `/demo-sample.pdf` and `/demo-fallback.png` as fetchable static assets, consumed by Task 6's `DevelopingTray.tsx`.

- [ ] **Step 1: Copy the fixture PDF into `public/`**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
cp test/fixtures/sample-20p.pdf web/public/demo-sample.pdf
```

This is the same real, already-golden-tested fixture used by `golden.test.ts` — no new document is invented (ADR-006 self-review note).

- [ ] **Step 2: Copy the real golden PNG as the static fallback**

```bash
cp test/fixtures/golden-sample-20p-p1-150dpi.png web/public/demo-fallback.png
```

- [ ] **Step 3: Verify both are real, non-empty files**

```bash
file web/public/demo-sample.pdf web/public/demo-fallback.png
```

Expected: `web/public/demo-sample.pdf: PDF document...` and `web/public/demo-fallback.png: PNG image data...`

- [ ] **Step 4: Commit**

```bash
git add web/public/demo-sample.pdf web/public/demo-fallback.png
git commit -m "chore(web): add homepage demo assets (real fixture copies, ADR-006)"
```

---

### Task 6: `DevelopingTray.tsx` — live tray component

**Files:**
- Create: `web/src/components/DevelopingTray.tsx`

**Interfaces:**
- Consumes: `JobController` + `JobEvents` from Task 4 (`web/src/app/JobController.ts`).
- Produces: `DevelopingTray` React component with props `{ trayLabel: string; processingLabel: string; sampleLabel: string }`, consumed by Task 7's `index.astro`/`tr/index.astro`.

- [ ] **Step 1: Write the component**

Create `web/src/components/DevelopingTray.tsx`:

```tsx
// Homepage hero — live "Developing Tray" demo (ADR-006). Loaded with
// client:idle so it never blocks the hero's first paint. A real bundled PDF
// is rendered by the same MuPDF WASM engine and worker protocol the tool
// pages use, one page at a time, straight into real thumbnails — not
// symbolic placeholder blocks.

import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';

const DEMO_URL = '/demo-sample.pdf';
const FALLBACK_URL = '/demo-fallback.png';
const DEMO_PAGES = 6;
const DEMO_DPI = 100;

interface Props {
  trayLabel: string;
  processingLabel: string;
  sampleLabel: string;
}

type Mode = 'loading' | 'live' | 'fallback';

export function DevelopingTray({ trayLabel, processingLabel, sampleLabel }: Props) {
  const [urls, setUrls] = useState<(string | null)[]>(Array(DEMO_PAGES).fill(null));
  const [mode, setMode] = useState<Mode>('loading');
  const controllerRef = useRef<JobController | null>(null);
  const playedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const play = useCallback(async () => {
    if (playedRef.current) return;
    playedRef.current = true;

    const supported = typeof WebAssembly !== 'undefined' && typeof Worker !== 'undefined';
    if (!supported) {
      setMode('fallback');
      return;
    }

    let buf: ArrayBuffer;
    try {
      const res = await fetch(DEMO_URL);
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
      buf = await res.arrayBuffer();
    } catch {
      setMode('fallback');
      return;
    }

    const file = new File([buf], 'demo-sample.pdf', { type: 'application/pdf' });
    const controller = new JobController({
      onDemoPage: (page, blob) => {
        setUrls((cur) => {
          const next = [...cur];
          next[page - 1] = URL.createObjectURL(blob);
          return next;
        });
      },
      onDemoDone: () => setMode('live'),
      onDemoError: () => setMode('fallback'),
      onFatal: () => setMode('fallback'),
    });
    controllerRef.current = controller;
    setMode('live');
    await controller.demoRender(file, DEMO_DPI, DEMO_PAGES);
  }, []);

  // Idle-load: never compete with the hero's first paint.
  useEffect(() => {
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = w.cancelIdleCallback ?? window.clearTimeout;
    const id = idle(() => void play());
    return () => {
      cancelIdle(id as number);
      controllerRef.current?.dispose();
      setUrls((cur) => {
        for (const u of cur) if (u) URL.revokeObjectURL(u);
        return cur;
      });
    };
  }, [play]);

  // Replay once if the user scrolls away and back — never on a timer (no
  // perpetual loop, taste-skill §9.F), and never under reduced-motion.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !rootRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let wasVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry!.isIntersecting && !wasVisible && mode === 'live') {
          playedRef.current = false;
          setUrls(Array(DEMO_PAGES).fill(null));
          void play();
        }
        wasVisible = entry!.isIntersecting;
      },
      { threshold: 0.4 },
    );
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [mode, play]);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-m border dark:border-white/[0.14]"
    >
      <div className="flex items-center justify-between border-b px-5 py-3 font-mono text-[11px] text-ink-muted dark:text-ink-faint-dark">
        <span>{trayLabel}</span>
        <span className="flex items-center gap-1.5 text-accent dark:text-teal-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-teal-dark" />
          {mode === 'fallback' ? sampleLabel : processingLabel}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2.5 p-6 sm:grid-cols-6">
        {urls.map((url, i) =>
          mode === 'fallback' ? (
            <img
              key={i}
              src={FALLBACK_URL}
              alt=""
              className="tray-cell aspect-[3/4] rounded-[3px] object-cover"
            />
          ) : url ? (
            <img
              key={i}
              src={url}
              alt=""
              className="tray-cell tray-cell--develop aspect-[3/4] rounded-[3px] object-cover"
            />
          ) : (
            <div key={i} className="tray-cell aspect-[3/4] rounded-[3px] bg-bg-2-dark" />
          ),
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd web && npm run check`
Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
git add web/src/components/DevelopingTray.tsx
git commit -m "feat(web): DevelopingTray live hero component (ADR-006)"
```

---

### Task 7: Tray effect CSS — `.tray-cell--develop`, filmstrip, scroll-reveal

**Files:**
- Modify: `web/src/styles/global.css`

**Interfaces:**
- Produces: CSS classes `.tray-cell`, `.tray-cell--develop`, `.filmstrip`, `.filmstrip-frame`, `.filmstrip-frame--mid`, `.filmstrip-sprockets`, `.reveal`, `.reveal-in` — consumed by Task 8 (index.astro), Task 9 (ToolPage.astro filmstrip N/A — filmstrip is home-only; ToolPage uses `.reveal`).

- [ ] **Step 1: Add the Developing Tray effect keyframes and classes**

In `web/src/styles/global.css`, inside the existing `@layer components { ... }` block (after the `.progress-fill` dark override, before the closing `}`), add:

```css
  /* Developing Tray (ADR-006): each real thumbnail "develops" as it arrives —
     desaturated/dark to full color with a slight settle-bounce, plus a
     scanning wash bar while the transition runs. Motivated by the actual
     render event, not decorative. */
  .tray-cell {
    background: var(--color-bg-2-dark);
    position: relative;
    overflow: hidden;
  }
  .tray-cell--develop {
    animation:
      tray-develop 700ms ease-out both,
      tray-settle 260ms var(--ease-spring) 700ms both;
  }
  .tray-cell--develop::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(232, 182, 95, 0.5) 45%,
      transparent 100%
    );
    animation: tray-scan 700ms ease-out both;
  }
```

- [ ] **Step 2: Add the keyframes**

Right after the `.tray-cell--develop::after` rule (still inside `@layer components`, or as top-level `@keyframes` alongside the existing `@keyframes hero-shimmer` etc. — follow the existing file's pattern of top-level `@keyframes` after the `@layer components` block):

```css
@keyframes tray-develop {
  0% {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
    filter: brightness(0.15) contrast(1.6) saturate(0.4);
  }
  12% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: brightness(0.15) contrast(1.6) saturate(0.4);
  }
  60% {
    filter: brightness(1) contrast(1) saturate(1);
  }
  100% {
    filter: brightness(1) contrast(1) saturate(1);
    transform: scale(1.03);
  }
}
@keyframes tray-settle {
  0% {
    transform: scale(1.03);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes tray-scan {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}
```

- [ ] **Step 3: Add filmstrip classes (home "How it works" replacement, Task 8)**

Add to the same `@layer components` block:

```css
  /* Filmstrip (ADR-006): replaces the banned 3-equal-card "How it works"
     pattern with a single connected object — sprocket-hole dividers, a
     slightly raised middle frame — read as one physical film strip, not
     three interchangeable boxes. */
  .filmstrip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-radius: var(--radius-m);
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.09);
  }
  .dark .filmstrip {
    border-color: rgba(255, 255, 255, 0.1);
  }
  .filmstrip-frame {
    position: relative;
    padding: 22px 18px 18px;
    background: var(--color-surface);
  }
  .dark .filmstrip-frame {
    background: var(--color-surface-dark);
  }
  .filmstrip-frame + .filmstrip-frame {
    border-left: 1px dashed rgba(0, 0, 0, 0.14);
  }
  .dark .filmstrip-frame + .filmstrip-frame {
    border-left-color: rgba(255, 255, 255, 0.14);
  }
  .filmstrip-frame--mid {
    transform: translateY(-6px);
  }
  .filmstrip-sprockets {
    position: absolute;
    top: 7px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
  }
  .filmstrip-sprockets::before,
  .filmstrip-sprockets::after {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 1px;
    background: rgba(0, 0, 0, 0.12);
  }
  .dark .filmstrip-sprockets::before,
  .dark .filmstrip-sprockets::after {
    background: rgba(255, 255, 255, 0.14);
  }
  @media (max-width: 640px) {
    .filmstrip {
      grid-template-columns: 1fr;
    }
    .filmstrip-frame + .filmstrip-frame {
      border-left: none;
      border-top: 1px dashed rgba(0, 0, 0, 0.14);
    }
    .dark .filmstrip-frame + .filmstrip-frame {
      border-top-color: rgba(255, 255, 255, 0.14);
    }
    .filmstrip-frame--mid {
      transform: none;
    }
  }

  /* Scroll-reveal (ADR-006, tool pages): "How it works"/FAQ fade+drift in
     once, on first intersection. JS toggles .reveal-in; reduced-motion users
     get it added immediately (see ToolPage.astro's script) and the global
     reduced-motion rule also collapses the transition to 0. */
  .reveal {
    opacity: 0;
    transform: translateY(6px);
  }
  .reveal.reveal-in {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--duration-base) var(--ease-base),
      transform var(--duration-base) var(--ease-base);
  }
```

- [ ] **Step 4: Bump the DropZone breathing amplitude**

Find the existing `dz-breathe`/`dz-breathe-dark` keyframes and replace their peak alpha values:

```css
@keyframes dz-breathe {
  0%,
  100% {
    border-color: rgba(0, 0, 0, 0.09);
  }
  50% {
    border-color: rgba(27, 90, 83, 0.32);
  }
}
@keyframes dz-breathe-dark {
  0%,
  100% {
    border-color: rgba(255, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(46, 145, 134, 0.32);
  }
}
```

(Only the two `50%` alpha values change, from `0.2` to `0.32`.)

- [ ] **Step 5: Build to verify no CSS errors**

Run: `cd web && npm run build`
Expected: build succeeds, `[build] Complete!`

- [ ] **Step 6: Commit**

```bash
git add web/src/styles/global.css
git commit -m "feat(web): tray/filmstrip/reveal CSS + stronger DropZone breathing (ADR-006)"
```

---

### Task 8: Homepage hero rebuild — live tray + filmstrip (EN)

**Files:**
- Modify: `web/src/pages/index.astro`

**Interfaces:**
- Consumes: `DevelopingTray` from Task 6, `.filmstrip`/`.filmstrip-frame`/`.filmstrip-frame--mid`/`.filmstrip-sprockets` from Task 7.

- [ ] **Step 1: Replace the hero + tray sections**

In `web/src/pages/index.astro`, replace the import line and add the new one:

```astro
---
import Base from '../layouts/Base.astro';
import { FileImage, Image } from 'lucide-react';
import { DevelopingTray } from '../components/DevelopingTray';
```

Replace the hero `<section>` (currently ending in `Works entirely in your browser, the way a darkroom makes prints — nothing ever leaves the tray.`) with:

```astro
  <section class="mx-auto max-w-[720px] px-4 pt-16 pb-10 text-center">
    <span
      class="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] text-amber uppercase dark:border-amber-dim-dark/60 dark:text-amber-dark"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)] dark:bg-amber-dark dark:shadow-[0_0_8px_var(--color-amber-dark)]"></span>
      No uploads · no signup · free
    </span>
    <h1 class="font-display text-2xl font-semibold tracking-tight sm:text-[40px]">
      PDF tools that <em class="hero-develop not-italic">never see</em> your files.
    </h1>
    <p class="mx-auto mt-4 max-w-[480px] text-md text-ink-muted dark:text-ink-muted-dark">
      Watch it happen below — this is a real file, converting live, on this device.
    </p>
  </section>

  <section class="mx-auto max-w-[720px] px-4 pb-14">
    <DevelopingTray
      client:idle
      trayLabel="DEVELOPING TRAY"
      processingLabel="PROCESSING"
      sampleLabel="SAMPLE"
    />
  </section>
```

- [ ] **Step 2: Replace the "How it works" 3-card grid with the filmstrip**

Replace this block:

```astro
  <section class="mx-auto max-w-[720px] px-4 pb-14">
    <div class="grid gap-3 sm:grid-cols-3">
      {
        steps.map((step) => (
          <div class="rounded-m border bg-surface p-5 dark:bg-surface-dark">
            <div class="font-heading text-lg font-semibold text-accent dark:text-amber-dark">{step.n}</div>
            <h3 class="mt-3 text-sm font-semibold">{step.h}</h3>
            <p class="mt-1.5 text-xs text-ink-muted dark:text-ink-muted-dark">{step.p}</p>
          </div>
        ))
      }
    </div>
  </section>
```

with:

```astro
  <section class="mx-auto max-w-[720px] px-4 pb-14">
    <div class="filmstrip">
      {
        steps.map((step, i) => (
          <div class={`filmstrip-frame ${i === 1 ? 'filmstrip-frame--mid' : ''}`}>
            <div class="filmstrip-sprockets" aria-hidden="true" />
            <div class="font-heading text-lg font-semibold text-accent dark:text-amber-dark">{step.n}</div>
            <h3 class="mt-3 text-sm font-semibold">{step.h}</h3>
            <p class="mt-1.5 text-xs text-ink-muted dark:text-ink-muted-dark">{step.p}</p>
          </div>
        ))
      }
    </div>
  </section>
```

- [ ] **Step 3: Remove the old inline `devTray`/`devAppear` script**

Delete the entire trailing `<script>` block at the bottom of the file (the one building 12 placeholder divs and injecting `@keyframes devAppear`) — `DevelopingTray.tsx` now owns this behavior entirely.

- [ ] **Step 4: Typecheck and build**

Run: `cd web && npm run check && npm run build`
Expected: `0 errors`; build succeeds; 14 pages built (unchanged count — no new routes).

- [ ] **Step 5: Commit**

```bash
git add web/src/pages/index.astro
git commit -m "feat(web): homepage hero rebuild — live tray + filmstrip (ADR-006, EN)"
```

---

### Task 9: Homepage hero rebuild — live tray + filmstrip (TR)

**Files:**
- Modify: `web/src/pages/tr/index.astro`

Mirrors Task 8 exactly, with the existing Turkish copy preserved (no copy rewrite — ADR-006 didn't ask for one).

- [ ] **Step 1: Replace the import and hero section**

```astro
---
import Base from '../../layouts/Base.astro';
import { FileImage, Image } from 'lucide-react';
import { DevelopingTray } from '../../components/DevelopingTray';
```

Replace the hero `<section>` with:

```astro
  <section class="mx-auto max-w-[720px] px-4 pt-16 pb-10 text-center">
    <span
      class="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.06em] text-amber uppercase dark:border-amber-dim-dark/60 dark:text-amber-dark"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)] dark:bg-amber-dark dark:shadow-[0_0_8px_var(--color-amber-dark)]"></span>
      Yükleme yok · kayıt yok · ücretsiz
    </span>
    <h1 class="font-display text-2xl font-semibold tracking-tight sm:text-[40px]">
      Dosyalarınızı <em class="hero-develop not-italic">hiç görmeyen</em> PDF araçları.
    </h1>
    <p class="mx-auto mt-4 max-w-[480px] text-md text-ink-muted dark:text-ink-muted-dark">
      Aşağıda gerçekleşiyor — bu gerçek bir dosya, bu cihazda, canlı olarak dönüştürülüyor.
    </p>
  </section>

  <section class="mx-auto max-w-[720px] px-4 pb-14">
    <DevelopingTray
      client:idle
      trayLabel="GELİŞTİRME TEPSİSİ"
      processingLabel="İŞLENİYOR"
      sampleLabel="ÖRNEK"
    />
  </section>
```

- [ ] **Step 2: Replace the "How it works" 3-card grid with the filmstrip**

Same swap as Task 8 Step 2, using the existing TR `steps` array already in this file (no copy change).

- [ ] **Step 3: Remove the old inline `devTray`/`devAppear` script**

Same as Task 8 Step 3.

- [ ] **Step 4: Typecheck and build**

Run: `cd web && npm run check && npm run build`
Expected: `0 errors`; 14 pages built.

- [ ] **Step 5: Commit**

```bash
git add web/src/pages/tr/index.astro
git commit -m "feat(web): homepage hero rebuild — live tray + filmstrip (ADR-006, TR)"
```

---

### Task 10: Tool pages — FAQ grouping, scroll-reveal, asymmetric grid

**Files:**
- Modify: `web/src/layouts/ToolPage.astro`
- Modify: `web/src/components/ToolShell.tsx`

**Interfaces:**
- Consumes: `.reveal`/`.reveal-in` from Task 7.

- [ ] **Step 1: Add a `chunk` helper and regroup the FAQ**

In `web/src/layouts/ToolPage.astro`, add this helper to the frontmatter (after the `schema` object, before the closing `---`):

```ts
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
```

Replace the FAQ section:

```astro
    <section class="mt-10">
      <h2 class="font-heading text-lg font-semibold">{p.faqTitle}</h2>
      <dl class="mt-3 flex flex-col gap-0">
        {
          p.faq.map((item) => (
            <div class="border-b py-4.5 first:pt-3 last:border-b-0">
              <dt class="text-sm font-medium">{item.q}</dt>
              <dd class="mt-2 text-sm text-ink-muted dark:text-ink-muted-dark">{item.a}</dd>
            </div>
          ))
        }
      </dl>
    </section>
```

with:

```astro
    <section class="reveal mt-10" data-reveal>
      <h2 class="font-heading text-lg font-semibold">{p.faqTitle}</h2>
      <div class="mt-3 flex flex-col gap-6">
        {
          chunk(p.faq, 3).map((group) => (
            <dl class="flex flex-col gap-5 border-t pt-5">
              {group.map((item) => (
                <div>
                  <dt class="text-sm font-medium">{item.q}</dt>
                  <dd class="mt-2 text-sm text-ink-muted dark:text-ink-muted-dark">{item.a}</dd>
                </div>
              ))}
            </dl>
          ))
        }
      </div>
    </section>
```

- [ ] **Step 2: Mark "How it works" for scroll-reveal too**

Find the "How it works" `<section>`:

```astro
    <section>
      <h2 class="font-heading text-lg font-semibold">{p.howItWorks}</h2>
```

Replace with:

```astro
    <section class="reveal" data-reveal>
      <h2 class="font-heading text-lg font-semibold">{p.howItWorks}</h2>
```

- [ ] **Step 3: Add the scroll-reveal script**

Add this `<script>` block right before the closing `</Base>` tag:

```astro
  </div>
</Base>

<script>
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add('reveal-in');
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    for (const el of targets) io.observe(el);
  }
</script>
```

(Note: this replaces the file's existing final `</div>\n</Base>` lines — keep the `<AdSlot />` and its wrapping `<div class="mt-10">` exactly where they already are, just before this closing tag; only the script is new.)

- [ ] **Step 4: Flip the options-phase grid ratio in `ToolShell.tsx`**

In `web/src/components/ToolShell.tsx`, find:

```tsx
          <div class="grid gap-5 md:grid-cols-[3fr_2fr]">
```

(it's actually JSX, so `className`, not `class` — find the literal line):

```tsx
            <OptionsPanel
```

Locate the enclosing div two lines above it:

```tsx
          <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
```

Replace with:

```tsx
          <div className="grid gap-5 md:grid-cols-[2fr_3fr]">
```

- [ ] **Step 5: Typecheck and build**

Run: `cd web && npm run check && npm run build`
Expected: `0 errors`; 14 pages built.

- [ ] **Step 6: Run the unit suite**

Run: `cd web && npm test`
Expected: all suites still PASS (no unit test touches this markup directly, but this confirms nothing else regressed).

- [ ] **Step 7: Commit**

```bash
git add web/src/layouts/ToolPage.astro web/src/components/ToolShell.tsx
git commit -m "fix(web): FAQ grouped clusters, scroll-reveal, asymmetric options grid (ADR-006)"
```

---

### Task 11: e2e coverage for the live homepage tray

**Files:**
- Create: `web/e2e/home.spec.ts`

**Interfaces:**
- Consumes: existing Playwright `page` fixture pattern from `web/e2e/pdf-to-png.spec.ts` (`test`, `expect` from `@playwright/test`).

- [ ] **Step 1: Write the test**

Create `web/e2e/home.spec.ts`:

```ts
// E2E for the homepage live "Developing Tray" hero (ADR-006). Covers: real
// thumbnails actually render (not placeholder divs), and the demo's own
// fetch stays same-origin (R7's zero-egress claim extends to the hero too).

import { expect, test } from '@playwright/test';

test('Developing Tray renders real page thumbnails on load', async ({ page }) => {
  await page.goto('/');
  // The tray starts as empty dark cells; real <img> thumbnails replace them
  // once the idle-loaded demo finishes rendering pages via the WASM worker.
  const firstThumb = page.locator('.tray-cell--develop').first();
  await expect(firstThumb).toBeVisible({ timeout: 15_000 });
  const src = await firstThumb.getAttribute('src');
  expect(src).toMatch(/^blob:/);
});

test('the demo fetch never leaves the origin', async ({ page }) => {
  const offenders: string[] = [];
  page.on('request', (req) => {
    const local =
      req.url().startsWith('http://localhost:4321') ||
      req.url().startsWith('blob:http://localhost:4321');
    if (!local) offenders.push(req.url());
  });
  await page.goto('/');
  await expect(page.locator('.tray-cell--develop').first()).toBeVisible({ timeout: 15_000 });
  expect(offenders, `off-origin requests: ${offenders.join(', ')}`).toEqual([]);
});
```

- [ ] **Step 2: Run it**

Run: `cd web && npx playwright test e2e/home.spec.ts`
Expected: 2 passed

- [ ] **Step 3: Run the full e2e suite to confirm no regression**

Run: `cd web && npx playwright test`
Expected: all suites PASS (previous 9 + 2 new = 11)

- [ ] **Step 4: Commit**

```bash
git add web/e2e/home.spec.ts
git commit -m "test(web): e2e coverage for the live Developing Tray hero (ADR-006)"
```

---

### Task 12: Full gate run + Lighthouse re-measure + doc closeout

**Files:**
- Modify: `ADR-006-imza-hero-ve-taste-skill-denetimi.md` (check off action items)
- Modify: `CLAUDE.md` (phase log entry)

- [ ] **Step 1: Full unit + e2e + build + budget run**

```bash
cd web
npm run check
npm test
npm run build
node scripts/check-wasm-budget.mjs
npx playwright test
```

Expected: all green; WASM budget still within 6 MB gzip (this plan adds no new WASM).

- [ ] **Step 2: Lighthouse CI, homepage specifically**

```bash
cd web
npx lhci autorun --config=lighthouserc.cjs
```

Expected: all categories ≥95, home CLS ≤0.02. This is the ADR-006 action item that matters most — the homepage went from zero-JS to loading the WASM engine on idle. If LCP or CLS regresses:
- Check the tray's empty cells (`.tray-cell` with no `--develop` class) have the same `aspect-[3/4]` sizing as developed ones — if not, that's the CLS source, fix by ensuring the grid never reflows between empty/developed states (it shouldn't, since both are the same grid cell size, just different background/content).
- Confirm `requestIdleCallback` (not a synchronous call) is what triggers `play()` in `DevelopingTray.tsx` — a build tool minifying it away would be a real regression, verify via `npm run preview` + browser devtools Network tab that the `mupdf` WASM fetch happens after the `load` event, not blocking it.

- [ ] **Step 2: Manual screenshot pass**

Run: `cd web && node scripts/screenshots.mjs --responsive`
Review 360/768/1280 × light/dark for: home hero (idle + mid-develop + fully-developed states), tool page FAQ (grouped clusters, no per-row lines), tool page options phase (asymmetric grid), filmstrip at mobile width (single column, top border not left border).

- [ ] **Step 3: Check off ADR-006 action items**

In `ADR-006-imza-hero-ve-taste-skill-denetimi.md`, change all 7 `- [ ]` action items to `- [x]`, and append one line to each noting the actual result (mirroring the style already used in ADR-004/ADR-005's checked action items — e.g. "(done 2026-07-22): X unit + Y e2e green, Lighthouse scores Z").

- [ ] **Step 4: Update CLAUDE.md phase log**

Add a new `- [x] **ADR-006 signature hero + taste-skill audit**` bullet to the "## Phase status" list in `CLAUDE.md`, following the exact style of the existing ADR-004/ADR-005 bullets (one-paragraph summary of what shipped, gate results, any caveats found during the Lighthouse re-measure).

- [ ] **Step 5: Commit**

```bash
git add ADR-006-imza-hero-ve-taste-skill-denetimi.md CLAUDE.md
git commit -m "docs(web): close ADR-006 action items after full gate run"
```

---

## Self-Review Notes

- **Spec coverage:** ADR-006 §Decision.1 (live hero) → Tasks 1-6, 8-9. §Decision.2 (tray effects) → Task 7 Steps 1-2. §Decision.3 (filmstrip) → Task 7 Step 3, Tasks 8-9 Step 2. §Decision.4 (tool page motion/asymmetry) → Task 7 Step 4 (breathing), Task 10 (FAQ/reveal/grid). Consequences (Lighthouse re-measure, SISTEM_TASARIMI §3.3 update) → Task 12; the SISTEM_TASARIMI §3.3 protocol doc update itself is intentionally left to a follow-up ADR-007 per ADR-006's own text — not silently skipped, explicitly deferred.
- **Type consistency checked:** `DemoPage` (Task 2) → `renderDemoPages` signature (Task 2) → `demoRenderHandler` (Task 3) → `demo-page`/`demo-done`/`demo-error` message shapes (Task 1) → `JobController.demoRender`/`JobEvents` (Task 4) → `DevelopingTray`'s `onDemoPage(page, blob)`/`onDemoDone()`/`onDemoError()` (Task 6) — names and parameter shapes match end to end.
- **No placeholders:** every step has complete, real code or a real shell command with expected output.
