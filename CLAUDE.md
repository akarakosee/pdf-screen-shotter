# CLAUDE.md — persistent working memory (web build)

Repo layout: Python desktop app at root (untouched); web product lives in `web/`.
Source of truth, in order: WEB_PLANI.md → SISTEM_TASARIMI.md → ADR-001 / ADR-002
(ADR-002 supersedes SISTEM_TASARIMI §3.5 COOP/COEP line) → PRD-pdf-to-png.md →
UI_UX_TASARIM.md (binding design values). Deviations require a new ADR — no silent drift.

## Commands

```sh
cd web
npm install
npm run dev        # dev server (localhost:4321)
npm run build      # static build → dist/
npm run preview    # serve dist/
npm test           # vitest
npm run check      # astro check (TS)
node scripts/check-wasm-budget.mjs   # after build; warns >6MB gzip WASM (ADR-001)
```

CI: `.github/workflows/web-ci.yml` (check → test → build → wasm budget). Lighthouse CI
and Playwright jobs to be added in later increments (quality gates: AI_BUILD_PROMPT §3).

## Phase status

- [x] **Increment 1 — Scaffold** (done 2026-07-21): Astro 5 + React islands + TS +
  Tailwind v4 in `web/`; design tokens from UI_UX_TASARIM §2 as the only palette
  (`src/styles/global.css` @theme block); self-hosted fonts (Inter Variable /
  Newsreader Variable / JetBrains Mono via @fontsource); class-based dark mode with
  system detection + manual toggle (inline head script, no FOUC); `_headers` with
  immutable cache + CSP, NO COOP/COEP (ADR-002); home page EN + /tr/ with the
  editorial "why private" paragraph + mono proof line (3-column icon block banned);
  about/privacy/terms/contact pages pending (increment 5). Build passes; pages ship
  zero JS (no islands yet).
- [x] **Increment 2 — Engine + worker + golden harness** (done 2026-07-21):
  `core/types.ts` + `core/config.ts` (contracts exactly per SISTEM_TASARIMI §3.1);
  `engine/PdfEngine.ts` interface + `EncryptedError`; `engine/MuPdfEngine.ts`
  (mupdf 1.28.0, dynamic import, pixmap/page destroy after each render);
  `workers/render.worker.ts` implementing the full §3.3 protocol (cooperative
  cancel, page-error/file-error taxonomy, partial ZIP on cancel, fatal→respawn
  contract); `workers/zipStream.ts` (fflate streaming, STORED entries, ≤1 page
  buffered); `app/pageRange.ts` parser with clamp+flag; `app/naming.ts` (R6
  naming, Turkish-safe). Tests: 15 passing, incl. golden-file pixel comparison —
  **0 differing bytes vs PyMuPDF golden @150 DPI and vs 300 DPI reference**.
- [x] **Increment 3 — ToolShell + components** (done 2026-07-21): JobController
  (worker lifecycle, fatal→terminate+respawn, transferable buffers), validators
  (extension + %PDF- magic bytes in first 1024B), download helper; components
  per UI_UX_TASARIM §3: Button (4 variants + loading), DropZone (whole-viewport
  drop target + overlay + Esc exit, Enter/Space opens picker), FileChip,
  OptionsPanel (segmented DPI with "150 · Recommended", mono range input, inline
  validation), Preview, ProgressPanel (aria-live, secondary non-red Cancel),
  ResultPanel (single primary download, ghost Convert more, plain-link cross
  suggestion), PrivacyLine, Toast; ToolShell upload→options→processing→done
  with fixed min-height region. /pdf-to-png page mounts it (content/FAQ section
  comes in increments 4–5). Vite `worker.format: 'es'` needed for the worker's
  dynamic mupdf import. Browser-verified: drop → preview → range convert →
  partial-range ZIP download, dark mode. WASM ships at 4.54 MB gzip (budget 6).
  Known gap for increment 4: UI never learns per-file pageCount (protocol §3.3
  has no inspect message) → FileChip shows size only, and range clamp feedback
  (R2) happens silently in the worker; resolve in increment 4 (likely via
  preview/open metadata — needs a small ADR if the protocol is extended).
- [x] **Increment 4 — PRD R1–R9** (done 2026-07-21). ADR-003 written (worker
  `inspect` message; SISTEM_TASARIMI §3.3 updated). P0 checklist:
  - [x] R1 intake: drag-drop + picker, multi-file, magic-bytes validation;
        fake-extension rejected client-side, valid files unaffected (e2e).
  - [x] R2 options: DPI segmented control (150 Recommended default), range
        parser; invalid range → inline error + Convert disabled (e2e); range
        past last page → trimmed + warning notice (e2e, via ADR-003 inspect).
  - [x] R3 preview: first page, follows DPI changes. (<3s p75 measurement is a
        launch metric, not CI-assertable — verified fast locally.)
  - [x] R4 conversion: worker page-by-page, progress file x/y page n/m, cancel
        ≤1s (per-page macrotask yield), partial ZIP downloadable after cancel
        (e2e). 1000p@300DPI memory ceiling: by construction (streaming ZIP,
        ≤1 page buffered) + manual large-file run pending in increment 6.
  - [x] R5 resilience: page errors counted + skipped; encrypted/corrupt/
        zero-page files skip per-file, batch continues, no fatal (e2e); result
        panel shows per-file skipped table with reasons.
  - [x] R6 output: single page → direct PNG; multi → `<name>_pages.zip` with
        `<name>_page_001.png`; Turkish-safe sanitization (unit tests).
  - [x] R7 privacy proof: PrivacyLine permanent under DropZone; **e2e asserts
        zero requests with a body and zero off-origin requests during
        conversion** — CI-enforced.
  - [x] R8 graceful degradation: WASM/Worker feature detection → info card +
        desktop app link (code path; no automated no-WASM browser in CI).
  - [x] R9 page basis: SEO meta, HowTo+FAQ JSON-LD schema, How-it-works +
        6-question FAQ (plain list, not accordion), AdSlot with fixed-height
        reservation (CLS≈0). TR translation of the tool page → increment 5;
        Lighthouse CI job → increment 6.
  CI: e2e job added (playwright chromium).
- [x] **Increment 5 — pages + i18n** (done 2026-07-21): shared ToolPage layout
  (tool pages = data in `i18n/toolCopy.ts`); /pdf-to-jpg EN+TR on own URLs with
  cross-links as plain text links; home tool grid (2 cards, icon+name+one line,
  Lucide via lucide-react SSR, zero client JS); full TR string catalogue
  (`i18n/tr.ts`, typed against Strings); hreflang en/tr/x-default in Base +
  language switcher preserves the current page; header tool menu + mobile
  overflow menu (native <details>) collapsing lang+theme per binding rule;
  footer gains tool + desktop links; about/privacy/terms/contact EN+TR with
  final copy (Prose layout, 640px, display serif headings); AGPL-3.0 LICENSE
  added (ADR-001 action item); jpg encode path unit-tested (JPEG magic bytes).
  14 pages build; 20 unit tests + 6 e2e green. NOTE: site URL is still the
  example.pages.dev placeholder in astro.config.mjs — set the real domain
  before launch (hreflang/canonical URLs derive from it).
- [x] **Increment 6 — quality gates** (done 2026-07-21):
  - [x] Lighthouse CI job (`lighthouserc.cjs`, asserts ≥95 all categories + CLS
        ≤0.02 on `/` and `/pdf-to-png`). Local run: 100/100/96/100 (home),
        99/100/96/100 (tool), **CLS 0.0000** after font preload (was 0.048 —
        font-swap reflow). best-practices 96 is the known `'unsafe-inline'` CSP
        gap, already tracked below.
  - [x] Visual review via real Playwright screenshots (`scripts/screenshots.mjs
        --responsive`, 360/768/1280 × light/dark × home/home-tr/tool states) —
        not just markup inspection. Found and fixed: (1) segmented DPI control
        clipped "150 · Recommended"; (2) mobile scroll jumped on Convert,
        violating §4.1's "scroll position never jumps" rule — region now pins
        pre-convert height and scrolls the active panel into view once.
  - [x] Manual large-file run (`scripts/memory-run.mjs`): 1000-page synthetic
        PDF (grafted from sample-20p.pdf) @300 DPI converted successfully in
        163s (~6.1 pages/sec), no crash, no fatal/worker-respawn. **Caveat:**
        the script's heap sampling via `performance.memory` is NOT valid
        evidence of the streaming-memory design — it reports a fingerprint-
        resistant quantized value from the main *frame* only, never the
        worker where mupdf/fflate actually run (flat 10MB every sample,
        confirmed as a measurement artifact, not real data). The only
        validated claim from this run is R4's literal criterion — completes
        without crashing — not the memory ceiling. Proper verification would
        need CDP `Performance.getMetrics` scoped to the worker target; not
        done here.
- [x] **Post-increment-6 bug fix** (done 2026-07-21, found via real-world PDF,
  not a fixture): `preview()` in `render.worker.ts` had no catch around
  `engine.open()`, unlike `inspect()`/`run()`. When a real PDF failed to open
  for preview (but not necessarily for inspect/run — MuPDF's preview path can
  hit edge cases a full open doesn't), the throw fell through to the worker's
  top-level handler and posted `fatal`. `JobController.handleFatal()` then
  terminated and respawned the worker, **silently dropping any other message
  still queued behind it** — specifically the `inspect` call queued for the
  same file (both fire back-to-back from `ToolShell.addFiles()`). Net effect:
  the FileChip never got a page count or a failed status, and the preview
  card was stuck on "Rendering preview…" forever, even after the fatal toast
  fired, because `onFatal` never reset `previewState`. Fixed: `preview()` now
  catches both `open()` and `renderPage()` failures and posts a new
  `preview-error` message (scoped to the one operation, doesn't kill the
  worker); `onFatal` and the new `onPreviewError` both reset `previewState` to
  `'unavailable'`. Real MuPDF error messages are now `console.error`'d in the
  worker (inspect/preview/run) instead of being fully collapsed into the
  generic file-error taxonomy, so a genuine corrupt file vs. a MuPDF parsing
  edge case on a valid PDF can be told apart from devtools. Regression test:
  `e2e/pdf-to-png.spec.ts` — "an unpreviewable file does not crash the worker
  or lose its inspect result" (uses `encrypted.pdf`, whose `open()` fails for
  both preview and inspect, reproducing the exact race).
  **Open general gap (not fixed, flagging per user request):** any time
  `fatal` fires, whatever other messages were queued behind the failing one
  are lost with no user-facing signal — this bug was one instance of that
  pattern, not the only possible one. A full fix would need the worker to
  track in-flight request IDs and have `JobController` re-deliver or report
  failure for anything still queued at respawn time. Not done; revisit if
  another symptom of the same root cause shows up.

## Implementation decisions (one-line rationale each)

- Tailwind v4 (@tailwindcss/vite, CSS `@theme` tokens) instead of v3 JS config —
  current default for new Astro projects; tokens live in one CSS block, palette reset
  via `--color-*: initial` so no non-token colors exist.
- Fonts via @fontsource packages (self-hosted, same-origin) — no font CDN; keeps CSP
  strict and Lighthouse/CLS safe. Build-time asset, not a runtime dependency, so no ADR.
- Dark-mode tokens: added `--color-ink-dark #ECECEF` / `--color-ink-muted-dark #A3A3AB`
  as the dark-mode counterparts of ink/ink-muted (UI_UX_TASARIM defines dark surfaces
  but not dark text values; chosen for ≥4.5:1 on #101012/#1A1A1E).
- Working name "localpdf" in header — placeholder brand pending domain decision
  (WEB_PLANI open question 1); single token to replace later.
- CSP includes `'unsafe-inline'` for script/style — Astro inlines the theme script and
  Tailwind styles; revisit with hashes before launch; AdSense domains added when ads land.
- vitest `passWithNoTests: true` — CI green before test suites arrive in increment 2.
- Worker messages are serialized through a promise queue — the mupdf WASM is not
  reentrant; concurrent inspect/preview handlers corrupted state (spurious fatal).
  `cancel` bypasses the queue; the cancelled flag resets on `start` arrival, not
  when the queued run begins (prevents lost cancels).
- Per-page `setTimeout(0)` yield in the render loop — synchronous WASM renders
  otherwise starve the worker event loop, so `cancel` could never be delivered
  mid-run (R4's ≤1s cancel).
- MuPDF repair tolerance (measured): truncated PDFs open and render blanks
  instead of throwing → per-page render errors are rare; worker page-error branch
  is covered by try/catch, not a reproducible fixture.

## Known deviations from planning docs

- None. (Dark text tokens above are an addition where the doc was silent, not a conflict.)

## PdfEngine contract (never re-derive)

Interface per SISTEM_TASARIMI §3.2: `init() / open(ArrayBuffer)→PdfDoc (encrypted →
EncryptedError) / pageCount / renderPage(doc,page,dpi) / close`. Engine lives ONLY in
the worker; UI never knows the engine type. Worker protocol §3.3: UI→worker
start/preview/cancel; worker→UI ready/preview-done/progress/page-error/file-error/
done/fatal. ArrayBuffers transferred, not copied. Cancel cooperative per page; fatal →
JobController terminates and respawns worker.

## Fixtures

`test/fixtures/`: sample-20p.pdf + golden-sample-20p-p1-150dpi.png (PyMuPDF ref) +
mupdf-sample-20p-p1-300dpi.png. Never regenerate.

Broken fixtures (`test/fixtures/broken/`, generated increment 4) — failure types
covered, for cross-check against the desktop edge-case matrix:
1. **Password-protected** — `encrypted.pdf` (AES-256, pw "secret") → EncryptedError
   → file-error "encrypted" → verbatim microcopy on chip.
2. **Unrepairable corrupt** — `corrupt-garbage.pdf` (%PDF- header + random bytes)
   → open throws → file-error "corrupt".
3. **Truncated/repairable corrupt** — `corrupt-truncated.pdf` (first 40KB of
   sample) → MuPDF repairs; missing pages render blank (measured — no throw).
4. **Zero-page PDF** — `zero-pages.pdf` (valid empty /Pages tree) → file-error
   "zero-pages".
5. **Fake .pdf extension** — `fake-extension.pdf` (PNG bytes) → rejected by
   magic-bytes validator before reaching the engine.
Not covered by fixture (rare with MuPDF): single-page render throw mid-file —
worker's page-error try/catch branch exists but has no reproducible trigger.
