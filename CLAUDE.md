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
- [ ] Increment 3 — ToolShell state machine + component set
- [ ] Increment 4 — PRD R1–R9 one by one (checklist below when started)
- [ ] Increment 5 — remaining pages, i18n, SEO, legal, ad slots
- [ ] Increment 6 — full quality gates + manual 360/768/1440 light+dark pass

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
mupdf-sample-20p-p1-300dpi.png. Never regenerate. Broken fixtures (encrypted, corrupt,
zero-page, fake-extension) to be added in increment 4 — list failure types covered here
when done, for cross-check against the desktop edge-case matrix.
