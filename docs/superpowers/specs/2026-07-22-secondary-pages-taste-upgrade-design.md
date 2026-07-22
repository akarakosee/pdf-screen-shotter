# Secondary pages taste upgrade — design spec

Date: 2026-07-22
Status: approved (brainstorming), ready for implementation plan

## Problem

The homepage (`index.astro` / `tr/index.astro`) received a full "darkroom" signature
treatment under ADR-004/005/006: dark palette, card elevation system, motion tokens,
Developing Tray hero, filmstrip "How it works". Every other page — the Prose template
(About, Contact, Privacy, Terms) and the ToolPage template (PDF to PNG, PDF to JPG,
EN+TR each) — still uses the plain, pre-ADR-006 layout: flat text, no cards, no motion,
no visual accents. A hands-on visual audit (Playwright screenshots, light+dark,
desktop+mobile, all 12 non-home pages) confirmed this and also surfaced three
functional defects on the ToolPage template that read as "empty/broken" to a visitor:

1. `ToolShell.tsx`'s idle-state wrapper is hardcoded `min-h-[420px]`, but the empty
   DropZone only needs ~194px — leaving 200–450px of dead blank space before "How it
   works" starts. On a 390px-wide mobile viewport this dead zone eats over a third of
   the initial screen.
2. `.reveal` sections (`global.css` L473–483) start at `opacity:0` and only reach
   `opacity:1` once an `IntersectionObserver` fires. The FAQ section sits below the
   initial viewport, so on load (or on a fast/no-scroll visit — screen readers, print,
   automated screenshots) it never becomes visible at all — not just faded, genuinely
   `opacity:0`.
3. `AdSlot.astro` renders a bare `aria-hidden` box with a barely-visible dashed border
   and no label — reads as a broken/empty component, not an intentional placeholder.

Goal: bring the Prose and ToolPage templates up to the homepage's visual language
(same darkroom tokens, same card/motion system) without giving every page its own
"signature" moment — the homepage's hero stays unique — and fix the three defects
above as part of the same pass, since they touch the same files.

## Non-goals

- No new hero sections, illustrations, or page-specific "signature" motifs on
  Prose/legal pages (rejected option during brainstorming — over-decorating a Privacy
  Policy undermines the trust framing).
- No new color tokens (stays within the existing darkroom palette — binding per
  ADR-005/006).
- No change to `--shadow-3` / `.elev-3` scope (stays drag-overlay + ResultPanel only,
  per the existing CLAUDE.md binding rule).
- No restructuring of legal/about page copy or information architecture — visual layer
  only.

## Design

### 1. New shared primitives (`web/src/styles/global.css`)

- `--shadow-1` + `.elev-1`: a new, lighter card-elevation tier for the three new card
  uses below (Prose accents, AdSlot, filmstrip frames if needed). Approx
  `0 2px 8px rgba(0,0,0,.05)` light / a darker equivalent for `.dark`, combined with
  the existing `.card-lit` top-highlight inset. `--shadow-3`/`.elev-3` are untouched.
- `.corner-marks`: four `aria-hidden` decorative corner-bracket elements (amber,
  ~2px border, low opacity) — the "negative frame" motif for AdSlot.
- `.prose-accent`: replaces/absorbs the existing `.contact-card` class — `.elev-1` +
  a monospace micro-label pattern, used for the selective Prose-page callouts.

### 2. Prose template (About, Contact, Privacy, Terms — EN+TR)

Body copy stays single-column editorial prose, unchanged — this was an explicit
brainstorming decision (over-carding legal text reads as untrustworthy). Only
selected call-out blocks move to the new `.prose-accent` card:

- **About**: the existing GitHub link block → `.prose-accent`.
- **Contact**: both existing `contact-card` blocks (issue tracker, email) →
  `.prose-accent`, spacing tightened.
- **Privacy**: new `.prose-accent` under "Your files" — a "Verify it yourself" callout
  pointing at DevTools/Network tab, making concrete a claim the About page already
  makes in prose.
- **Terms**: new `.prose-accent` under "Open source" linking the AGPL-3.0 license.

`.contact-card` is renamed/merged into `.prose-accent` in `global.css`; all current
usages are updated to match, so there is exactly one card class for this template, not
two parallel ones. No new scroll-reveal is added here — Prose pages are short, so the
"invisible until scroll" risk that hit the FAQ section doesn't apply.

### 3. ToolPage template (PDF to PNG / PDF to JPG — EN+TR)

**"How it works" → filmstrip.** Reuses the homepage's existing `.filmstrip` /
`.filmstrip-frame` CSS (sprocket-hole top rule, dashed vertical dividers between
frames) for the 3-step how-to, replacing the current plain `<ol>`. The `chunk()`
helper already in `ToolPage.astro` stays; only the render markup for the 3 steps
changes shape. (Brainstorming explicitly chose reusing the homepage motif over a
distinct "stepped rail" alternative — consistency over a second signature.)

**FAQ visibility fix.** Root cause: `IntersectionObserver`-gated `.reveal` never fires
for below-the-fold content without a real scroll event (confirmed via a live opacity
check with and without scroll). Fix, scoped to `ToolPage.astro`'s existing reveal
script:
- Tighten the observer's `rootMargin` so sections trigger earlier as the user
  approaches them (e.g. `'200px'` instead of the default `'0px'`).
- Add a fallback: any `[data-reveal]` element still missing `.reveal-in` ~500ms after
  load gets it added directly (same code path already used for
  `prefers-reduced-motion`). This guarantees content is never permanently invisible
  (screen readers, print, fast/no-scroll visits, automated tooling) while leaving the
  fade-in intact for the normal scrolling case.

**AdSlot redesign.** `.corner-marks` (four corner brackets) + a centered monospace
"Ad space" / "Reklam alanı" label + `.elev-1`. Stays `aria-hidden` and stays at its
current fixed height (CLS safety, PRD R9 — unchanged).

**Dead-zone fix.** Remove the hardcoded `min-h-[420px]` from `ToolShell.tsx`'s idle
wrapper; let it size to its actual content. The separate `regionMinHeight` mechanism
(the one that pins height across options→processing→done to prevent scroll-jump) is
untouched — this fix only removes the static idle-state minimum.

FAQ `<dl>` clustering (`chunk(faq, 3)`, one `border-t` per cluster of 3) is unchanged —
it already follows the taste-skill anti-slop rule and isn't part of this defect.

## Testing / verification

- Visual: re-run a Playwright screenshot pass (light+dark, 1280+390px) across all 12
  non-home pages before/after, same method used during the audit.
- FAQ fix: automate the same opacity check used during the audit (`getComputedStyle`
  on `[data-reveal]` elements) as a Vitest/Playwright assertion — element must reach
  `opacity: 1` within ~1s of load with zero scroll and zero pointer events, to lock in
  the fallback-timer behavior.
- CLS: existing Lighthouse CI gate must stay ≤0.02 on `/pdf-to-png` and `/pdf-to-jpg`
  after the `min-h-[420px]` removal and AdSlot restyle — both are common CLS
  regression points.
- No new WASM/JS is introduced — `check-wasm-budget.mjs` gate is unaffected.

## Open questions

None — all decisions were resolved during brainstorming (filmstrip reuse, AdSlot
corner-marks style, Prose card style, new `--shadow-1` tier all explicitly approved).
