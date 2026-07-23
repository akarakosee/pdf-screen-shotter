# → Claude Code'a yapıştırılacak tek prompt (aşağıdaki kod bloğunun tamamı)

Bunu proje kök dizininde (`PDF_Screen_Shotter/`) Claude Code'a birebir yapıştır. Tüm planlama dokümanları (`WEB_PLANI.md`, `SISTEM_TASARIMI.md`, `ADR-001-pdf-motoru.md`, `ADR-002-coop-coep-adsense.md`, `PRD-pdf-to-png.md`, `UI_UX_TASARIM.md`, `AI_BUILD_PROMPT.md`) ve `test/fixtures/` (golden PDF + referans PNG'ler) zaten aynı klasörde — prompt onlara atıf yapıyor.

---

```
You are the lead engineer building a production PDF tool suite website. You are not
prototyping — every line you write is intended to ship. Read this entire prompt before
writing any code.

═══════════════════════════════════════════════════════════════════════════════
0. GROUND RULES
═══════════════════════════════════════════════════════════════════════════════

1. Read the planning documents first, in this order, and treat them as source of truth:
   WEB_PLANI.md (strategy) → SISTEM_TASARIMI.md (architecture) → ADR-001-pdf-motoru.md
   and ADR-002-coop-coep-adsense.md (binding decisions) → PRD-pdf-to-png.md (feature
   spec) → UI_UX_TASARIM.md (binding design values). Where they conflict with your own
   instincts, the documents win. Where documents conflict with each other, the newer
   decision wins — ADR-002 supersedes the COOP/COEP line in SISTEM_TASARIMI §3.5 (already
   annotated there).

2. Memory discipline. Maintain a CLAUDE.md at repo root as your persistent working
   memory across sessions. After every completed phase, update it with: current phase
   status, decisions made during implementation (one-line rationale each), known
   deviations from the planning docs (should be almost none — see rule 3), and the exact
   commands to build/test/run this project. If a memory/codebase-memory MCP tool is
   available to you, additionally persist: each ADR's one-paragraph summary, the design
   token values (§2 below), and the PdfEngine adapter contract — these are facts you must
   never re-derive, guess, or contradict in a later session. Never rely on conversation
   history as memory; rely on CLAUDE.md and the docs in the repo.

3. Decision discipline. If you must deviate from any planning document, STOP, write a new
   ADR-00N-*.md file in the established format (Context / Decision / Options Considered /
   Trade-off Analysis / Consequences), mark the superseded text in the old doc, and only
   then implement. Silent deviation from the plan is the single worst failure mode here.

4. No AI slop — this is a hard product requirement, not a taste preference. Banned
   outright: gradient backgrounds, glassmorphism/backdrop-blur, neon/glow effects, emoji
   in UI copy, stock illustrations or 3D blobs, auto-playing carousels, fake social proof
   ("10M+ users"), filler marketing copy ("unleash", "supercharge", "seamlessly",
   "revolutionize"), border-radius above 10px, purple-blue generic SaaS gradients, any
   "AI" branding used as decoration, mixed icon libraries, and — caught in an internal
   design-critique pass on this very spec — the generic "3-column icon + headline + one
   sentence" feature block. That exact pattern is one of the most recognizable
   AI-template signatures and is explicitly banned on the home page (see §1 home page
   spec below for the replacement). Aesthetic target: "quiet mastery" — Linear's
   discipline, Stripe-docs calm, a native-utility feel. When in doubt, remove the element
   rather than decorate it.

═══════════════════════════════════════════════════════════════════════════════
1. WHAT YOU ARE BUILDING
═══════════════════════════════════════════════════════════════════════════════

A static, SEO-first website where 100% of PDF processing happens client-side in WASM —
files never touch a server. This is the product's core promise and a hard non-functional
requirement (privacy = the differentiator vs. iLovePDF/Smallpdf-style competitors).

Binding tech stack (do not substitute without an ADR):
- Astro + React islands + TypeScript + Tailwind CSS
- PDF engine: MuPDF.js (WASM), running only inside a single Web Worker, behind a
  PdfEngine adapter interface (see ADR-001 — measured 0.000% pixel diff vs the desktop
  app's PyMuPDF output, ~35-45% faster than pdf.js, gzip WASM ~4.5MB)
- ZIP output: fflate, streaming (never hold more than ~1 rendered page in memory —
  SISTEM_TASARIMI §3.4)
- Hosting: Cloudflare Pages (free tier), GitHub push → auto deploy
- NO COOP/COEP headers, ever (ADR-002: MuPDF.js is single-threaded / no
  SharedArrayBuffer use, and Google's ad tech (GPT/AdSense) does not support COEP pages —
  measured and confirmed). _headers file = cache-control (immutable, hashed assets) + CSP
  only (allowlist AdSense domains in CSP when that's added).

Directory layout — follow SISTEM_TASARIMI.md §2.2 exactly:
  src/pages/ (Astro routes, one per tool)  src/components/ (React islands)
  src/app/ (JobController, validators, download)  src/workers/ (render.worker.ts)
  src/engine/ (PdfEngine.ts interface + MuPdfEngine.ts impl)  src/tools/ (per-tool
  orchestration)  src/i18n/  src/core/ (types.ts, config.ts)

Type contracts — implement exactly as SISTEM_TASARIMI.md §3.1 (ExportOptions, JobFile,
ProgressData, PageError, ExportResult) and the worker message protocol exactly as §3.3
(start/preview/cancel from UI; ready/preview-done/progress/page-error/file-error/done/
fatal from worker). ArrayBuffers are transferred, not copied. Cancel is cooperative
(checked per page); a `fatal` message causes the JobController to terminate and respawn
the worker so one bad PDF can't crash the tab.

First shippable scope — ONE tool end-to-end: /pdf-to-png, implementing every P0
requirement (R1–R9) in PRD-pdf-to-png.md, with its Given/When/Then acceptance criteria as
your literal test checklist. /pdf-to-jpg is the same ToolShell with a format parameter,
on its own URL (SEO decision already made — separate URL per tool, not a format tab).

Pages to build: / (home, tool grid), /pdf-to-png, /pdf-to-jpg, /about, /privacy, /terms,
/contact — English + Turkish via subdirectory i18n routing (/tr/...) with hreflang tags.

Home page "why private" section — do NOT build the generic 3-icon-column pattern. Instead:
one editorial paragraph in body font (not display serif), 640px wide, making the actual
technical claim in plain language, followed by a small monospace "proof" line styled like
a code block (e.g. showing that zero network requests carry file data) — a real claim,
not decoration.

Test fixtures are already in the repo at test/fixtures/ (see test/fixtures/README.md):
sample-20p.pdf plus golden PyMuPDF reference PNGs at 150 and 300 DPI. Use these directly
for your golden-file test harness — do not regenerate them.

═══════════════════════════════════════════════════════════════════════════════
2. DESIGN — BINDING VALUES (from UI_UX_TASARIM.md, apply literally)
═══════════════════════════════════════════════════════════════════════════════

Design tokens (put these in Tailwind config as the only palette — no other colors):

  --bg:            #FAFAF8   (light mode background — warm off-white, not pure white)
  --surface:       #FFFFFF
  --bg-dark:       #101012   (dark mode background)
  --surface-dark:  #1A1A1E
  --ink:           #1A1A1E   (primary text)
  --ink-muted:     #5C5C64   (darkened after a contrast audit — 4.84:1 was too tight
                              against AA's 4.5 floor; this gives ~5.8:1)
  --accent:        #0D7377   (dark teal — deliberate break from generic AI purple/blue;
                              measured contrast vs white: 5.62:1, comfortably passes AA)
  --accent-hover:  #0A5D60
  --success: #1A7F37   --danger: #B42318   --warning: #B54708
  --icon-lib: Lucide (bind ALL icons to this one library — never mix icon sets, it's an
                       instant tell of unpolished/AI-generated UI)

  All interactive elements (buttons, icons, chips) get a minimum 44x44px touch target
  even where the visible glyph is smaller.

  Fonts: Inter Variable (UI/body), Newsreader (H1 and editorial headings ONLY — the one
  deliberate serif touch that breaks generic-SaaS monotony), JetBrains Mono (file names,
  page-range input, log/progress text). Type scale: 13/15(body)/17/22/28/40px. Weights:
  400 and 500 everywhere, 650 only on Newsreader display text.

  Geometry: radius-s 6px, radius-m 10px — NEVER larger (no "bubble" aesthetic). Borders:
  1px solid rgba(0,0,0,0.09). Shadows: exactly two levels (0 1px 2px rgba(0,0,0,.05) for
  resting cards; 0 4px 16px rgba(0,0,0,.10) for drag/modal states) — nothing else.
  Motion: ease cubic-bezier(0.2,0,0,1), 120ms fast / 200ms base, all transitions disabled
  under prefers-reduced-motion.

Component inventory (build with these exact states — full spec in UI_UX_TASARIM.md §3):
Button, DropZone (idle/dragover/has-files/error — dragover makes the WHOLE viewport a
drop target), FileChip, OptionsPanel (DPI as a 4-way segmented control with "150 ·
Recommended" marked, mono-font page-range input with inline validation, format as
separate page not a tab), Preview card, ProgressPanel, ResultPanel (success/partial/
failed states, partial shows a table of skipped files+reasons), PrivacyLine (permanent
line under the DropZone: lock icon + "Files are processed on your device — nothing is
uploaded." + a "verify" link to the open-source repo), Toast, Header/Footer, AdSlot
(fixed-height reservation so ads never cause layout shift — CLS≈0 is a hard requirement).

Tool page layout (§4.1): single column, max-width 720px for the tool area. Order: H1 +
one-sentence description (display serif, 2 lines max) → DropZone + PrivacyLine (fully
visible in the first viewport, no hero image above it) → [on file select] FileChip list +
OptionsPanel + Preview (60/40 side-by-side on desktop, stacked on mobile) + primary
Convert button → [processing] ProgressPanel in the same region, region has a fixed
min-height so nothing jumps → [done] ResultPanel → content section (max-w 640px): "How it
works" (3 steps) → FAQ (5-6 questions, plain list not an accordion — better for SEO and
a11y) → AdSlot → cross-links to other tools. Scroll position must never jump between
states; every state except "processing" has a way back.

DropZone drag interaction: making the whole viewport a drop target (per PRD R13) must
ship with an explicit exit path — Esc cancels the drag-over state, and a visible
boundary/overlay appears during drag so the user always sees where the drop will land.

ResultPanel action hierarchy: exactly one primary action (the download button). "Convert
more" is a secondary/ghost button. The cross-tool suggestion is a plain text link, never
styled as a button — three competing buttons in one panel is a hierarchy failure.

Header on mobile: logo + tool menu + language switcher + theme toggle is four elements —
collapse language and theme into a single overflow menu on narrow viewports rather than
showing all four inline.

Microcopy — use these exact English strings verbatim (write Turkish translations at the
same register: serious, helpful, zero exclamation marks except optionally on success):
  DropZone idle: "Drop PDFs here — or click to browse"
  DropZone dragover: "Release to add"
  Encrypted file: "This PDF is password-protected. We can't open it (yet)."
  Partial success: "214 of 220 pages converted. 6 pages couldn't be rendered — see
    details."
  After cancel: "Stopped. 47 pages were finished — you can still download them."
  No WASM support: "Your browser can't run this tool. Try the free desktop app instead."

Accessibility (non-negotiable, WCAG 2.1 AA): fully keyboard-operable flow (DropZone opens
the file picker on Enter/Space), aria-live="polite" on progress updates, role="status" on
results, contrast ≥ 4.5:1, visible focus rings everywhere (never outline:none without a
replacement), full support for prefers-reduced-motion and dark mode (system-detected +
manual toggle).

═══════════════════════════════════════════════════════════════════════════════
3. QUALITY GATES — a phase is not "done" until all of these pass
═══════════════════════════════════════════════════════════════════════════════

1. vitest: validators, page-range parser ("1-5,8,11-13" syntax), type mappings; engine
   golden-file tests rendering test/fixtures/sample-20p.pdf and pixel-comparing against
   the golden PNGs in the same folder (must match within the tolerance proven in
   ADR-001 — effectively 0% diff).
2. Playwright e2e: full upload→convert→download-zip flow; cancel mid-run preserves a
   partial ZIP; corrupt and encrypted fixtures each produce a per-file error without
   aborting the rest of the batch; a network assertion that ZERO requests carrying file
   bytes occur during conversion (PRD R7 — this is a CI-enforced test, not a marketing
   claim).
3. Lighthouse CI ≥ 95 across all four categories on / and /pdf-to-png; CLS ≈ 0 with ad
   slots reserved at fixed height.
4. WASM budget check in CI: warn if the mupdf wasm gzip size exceeds 6MB (currently
   ~4.5MB per the spike measurement).
5. main branch auto-deploys to Cloudflare Pages; PRs get preview deployments. _headers
   sets immutable cache on hashed assets + a CSP (no COOP/COEP per ADR-002).

═══════════════════════════════════════════════════════════════════════════════
4. EXECUTION ORDER
═══════════════════════════════════════════════════════════════════════════════

Work in small, independently verifiable increments; commit per increment with
conventional commit messages; update CLAUDE.md after each:

1. Scaffold: Astro + TS + Tailwind + design tokens + CI skeleton → an empty but fully
   styled site deploys, Lighthouse ≥ 95.
2. engine/ + workers/ + the golden-file test harness → a standalone script correctly
   converts test/fixtures/sample-20p.pdf and passes the pixel comparison BEFORE any UI
   exists.
3. ToolShell state machine (upload→options→processing→done) and all components, wired to
   the worker via the message protocol.
4. Walk through PRD-pdf-to-png.md's P0 requirements (R1–R9) one by one, implementing each
   against its literal acceptance criteria, checking each off in CLAUDE.md as it passes.
5. Remaining pages, i18n (EN+TR), SEO (meta tags + HowTo/FAQ schema), legal pages, ad slot
   reservations.
6. Run every quality gate in §3. Then do a manual self-review pass: open every page at
   360px, 768px, and 1440px widths, in both light and dark mode, and fix anything that
   looks wrong before declaring the phase done.

═══════════════════════════════════════════════════════════════════════════════
5. WHAT NOT TO DO
═══════════════════════════════════════════════════════════════════════════════

- Do not add features beyond PRD P0 — P1/P2 items are deliberately deferred and
  documented; leave them alone.
- Do not add dependencies beyond those named in SISTEM_TASARIMI.md §4.4 without writing
  an ADR first.
- Do not import the PDF engine on the main thread, ever — worker only.
- Do not write placeholder or lorem-ipsum content — every string that ships is final
  copy, per §2 microcopy rules.
- Do not mark any phase or requirement complete while tests are failing, skipped, or
  incomplete.

Begin now: read WEB_PLANI.md, SISTEM_TASARIMI.md, ADR-001-pdf-motoru.md,
ADR-002-coop-coep-adsense.md, PRD-pdf-to-png.md, and UI_UX_TASARIM.md in full, then
present a short build plan (increments + risks you see) before writing any code.
```
