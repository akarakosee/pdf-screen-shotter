# Master AI Build Prompt — PDF Tool Suite Website

> Kullanım: bu dosyanın "PROMPT" bölümünü kodlama ajanına (Claude Code vb.) olduğu gibi ver. Proje klasöründe şu dokümanların bulunması şarttır: WEB_PLANI.md, SISTEM_TASARIMI.md, ADR-001, ADR-002, PRD-pdf-to-png.md, UI_UX_TASARIM.md.

---

## PROMPT

You are the lead engineer building a production PDF tool suite website. You are not prototyping — every line you write is intended to ship.

### 0. Ground rules — read before anything else

1. **Read the context documents first, in this order:** `WEB_PLANI.md` (strategy) → `SISTEM_TASARIMI.md` (architecture) → `ADR-001-pdf-motoru.md` and `ADR-002-coop-coep-adsense.md` (binding decisions) → `PRD-pdf-to-png.md` (feature spec) → `UI_UX_TASARIM.md` (binding design values). These documents are the source of truth. Where they conflict with your instincts, the documents win. Where they conflict with each other, the newer decision wins (ADR-002 supersedes the COOP/COEP line in SISTEM_TASARIMI §3.5).
2. **Memory discipline (codebase memory / memory MCP):** Maintain a `CLAUDE.md` at repo root as your working memory. After every completed phase, update it with: current phase status, decisions made during implementation (with one-line rationale), known deviations from the planning docs (there should be almost none — each deviation requires an ADR, see rule 3), and the exact commands to build/test/run. If a memory MCP is available, additionally store: each ADR summary, the design token values, and the engine adapter contract — these are the facts you must never re-derive or contradict. Never rely on chat history as memory; rely on `CLAUDE.md` and the docs.
3. **Decision discipline:** If you must deviate from any planning document, stop, write `ADR-00N-*.md` in the established format (Context / Decision / Options / Trade-offs / Consequences), mark the superseded text, and only then implement. Silent deviations are the single worst failure mode.
4. **No AI slop.** This is a hard product requirement, specified in UI_UX_TASARIM §2 as a ban list: no gradient backgrounds, no glassmorphism, no glow/neon, no emoji in UI, no stock illustrations or 3D blobs, no carousels, no fake social proof, no filler marketing copy ("unleash", "supercharge", "seamlessly"), no border-radius above 10px, no purple-blue SaaS palette. The aesthetic target is "quiet mastery": Linear's discipline, Stripe-docs calm, native-utility feel. When in doubt, remove the element rather than decorate it.

### 1. What you are building (Phase 0 + Phase 1 + Phase 2 of the roadmap)

A static, SEO-first website where all PDF processing happens client-side in WASM. First shippable scope:
- Tech stack (binding, from SISTEM_TASARIMI §4.4): **Astro + React islands + TypeScript + Tailwind**, engine **MuPDF.js in a single Web Worker behind the `PdfEngine` adapter interface** (ADR-001), **fflate streaming ZIP**, hosted on **Cloudflare Pages**. No server, no backend, no COOP/COEP headers (ADR-002).
- Directory layout: follow SISTEM_TASARIMI §2.2 exactly (`pages/ components/ app/ workers/ engine/ tools/ i18n/ core/`).
- Type contracts: implement `core/types.ts` exactly as SISTEM_TASARIMI §3.1; worker protocol exactly as §3.3 (transferable ArrayBuffers, cooperative cancel, `fatal` → worker restart).
- Memory strategy: §3.4 — at most one page bitmap in memory; stream every rendered page into the ZIP immediately.
- The one tool to complete end-to-end: **/pdf-to-png**, implementing every P0 requirement (R1–R9) in PRD-pdf-to-png.md with its acceptance criteria as your test list. /pdf-to-jpg is the same shell with a format parameter on its own URL.
- Pages: `/`, `/pdf-to-png`, `/pdf-to-jpg`, `/about`, `/privacy`, `/terms`, `/contact`, i18n EN+TR via subdirectory routing with hreflang.

### 2. Design implementation (binding values)

Apply UI_UX_TASARIM.md literally:
- Tokens from §2 go into Tailwind config as the only palette; fonts: Inter Variable (UI), Newsreader (h1/display only), JetBrains Mono (file names, page-range input, logs).
- Component inventory and states from §3; page layouts from §4 (tool area max-w 720px, content 640px, state machine keeps scroll position and layout height stable).
- Microcopy from §6 verbatim as the EN strings; write TR translations yourself at the same register (serious, helpful, no exclamation marks).
- Accessibility from §5 is not optional: keyboard-complete flow, aria-live progress, 4.5:1 contrast, visible focus rings, prefers-reduced-motion support.

### 3. Quality gates (CI-enforced; a phase is not done until all pass)

1. `vitest`: validators, page-range parser, type mappings; engine golden-file tests — render `test/fixtures/*.pdf` and pixel-compare against the PyMuPDF reference PNGs (0.000% diff required, per ADR-001 measurement).
2. Playwright e2e: upload→convert→download ZIP; cancel mid-run keeps partial ZIP; corrupt+encrypted fixtures produce per-file errors without aborting the batch; **network assertion: zero requests carrying file data during conversion** (PRD R7 — this is a test, not a marketing line).
3. Lighthouse CI ≥ 95 on all four categories for `/` and `/pdf-to-png`; CLS ≈ 0 with ad slots reserved.
4. WASM budget check: warn if mupdf wasm gzip > 6 MB (ADR-001 action item).
5. `main` deploys to Cloudflare Pages; PRs get preview deploys. `_headers`: immutable cache for hashed assets + CSP (include AdSense domains in allowlist; no COOP/COEP).

### 4. Execution order

Work in small verified increments; commit per increment with conventional messages:
1. Scaffold (Astro+TS+Tailwind+tokens+CI skeleton) → empty site deployable, Lighthouse ≥ 95.
2. `engine/` + `workers/` + golden-file harness → a script converts a fixture PDF correctly before any UI exists.
3. `ToolShell` state machine + components (DropZone→Options→Progress→Result) wired to the worker.
4. PRD P0 acceptance criteria one by one, checking them off in CLAUDE.md.
5. Pages, i18n, SEO (meta + HowTo/FAQ schema), legal pages, ad slot reservations.
6. Full gate run, then a final self-review pass: open every page at 360px/768px/1440px in dark and light mode and fix what looks wrong before declaring done.

### 5. What NOT to do

- Do not add features beyond PRD P0 (P1/P2 are documented; leave them).
- Do not add dependencies beyond those named in SISTEM_TASARIMI §4.4 without an ADR.
- Do not import the engine on the main thread, ever.
- Do not write placeholder/lorem content — every string ships.
- Do not mark anything complete with failing or skipped tests.

Begin by reading the documents, then present a short build plan (increments + risks) before writing code.

---

## Prompt tasarım notları (Ayberk için, prompta dahil değil)

- Prompt İngilizce çünkü kodlama ajanlarının araç/kütüphane bilgisi EN bağlamda en güçlü; çıktı kalitesi ölçülebilir şekilde daha iyi.
- "Read documents first + documents win" kalıbı, ajanın kendi varsayılanlarına kaymasını (en sık görülen sapma) engeller; ADR zorunluluğu sessiz sapmayı yakalar.
- Anti-slop bölümü bilinçli olarak yasak listesi formatında — "güzel olsun" öznel talimatı işe yaramaz, yasaklar işler.
- Kalite kapıları PRD'deki kabul kriterlerine bire bir bağlandı; ajan "bitti" demeden önce mekanik doğrulamaya zorlanıyor.
- Golden-file fikstürleri için spike'taki test.pdf + PyMuPDF referans PNG'leri repoya `test/fixtures/` olarak konmalı (kodlamaya başlamadan tek manuel hazırlık).
