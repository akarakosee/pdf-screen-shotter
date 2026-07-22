# Secondary Pages Taste Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Prose template (About/Contact/Privacy/Terms, EN+TR) and the ToolPage template (PDF to PNG/JPG, EN+TR) up to the homepage's darkroom card/motion visual language, and fix three functional defects on the ToolPage template found during a full-site UI audit (dead vertical space under the idle DropZone, an FAQ section that stays invisible without a real scroll event, and an unlabeled bare AdSlot box).

**Architecture:** Pure presentation-layer change inside the existing Astro + Tailwind v4 + React-islands stack. No new dependencies, no new color tokens, no new WASM/worker surface. Reuses two design primitives that already exist in `web/src/styles/global.css` but are only used on the homepage today — the `shadow-1` Tailwind utility (from `--shadow-1` in the `@theme` block) and the `.filmstrip`/`.filmstrip-frame` CSS (from ADR-006) — plus two small new pieces: a `.prose-accent` card class (renamed from the existing `.contact-card`) and a `.corner-mark` decorative class for AdSlot.

**Tech Stack:** Astro 5, Tailwind v4 (`@theme` tokens in `global.css`), React 18 islands (`ToolShell.tsx`), Vitest, Playwright.

## Global Constraints

- No new color tokens — stay inside the existing darkroom palette in `web/src/styles/global.css`'s `@theme` block (ADR-005/006 binding rule).
- `--shadow-3` / `.elev-3` stay scoped to drag-overlay + `ResultPanel` only — do not apply them anywhere in this plan (existing CLAUDE.md binding rule).
- **Correction to the approved spec:** the spec called for adding a new `--shadow-1` / `.elev-1` tier. Investigation during planning found `--shadow-1: 0 1px 2px rgba(0, 0, 0, 0.05)` already exists in the `@theme` block and is already used as the Tailwind utility class `shadow-1` on the homepage's tool-grid cards (`web/src/pages/index.astro:62`, `tr/index.astro:63`). This plan reuses that existing `shadow-1` utility class combined with the existing `.card-lit` top-highlight class instead of inventing a duplicate token — smaller diff, same visual result, no new primitive needed.
- FAQ `<dl>` clustering (`chunk(faq, 3)`, one `border-t` per group of 3) is unchanged — already follows the taste-skill anti-slop rule.
- Prose page body copy (the actual paragraphs) is unchanged — only selected call-out blocks gain card treatment.
- No new hero sections, illustrations, or per-page "signature" motifs — the homepage's Developing Tray hero stays unique.

---

### Task 1: Global CSS primitives — `.prose-accent` and `.corner-mark`

**Files:**
- Modify: `web/src/styles/global.css:158-176` (rename `.contact-card` → `.prose-accent`)
- Modify: `web/src/styles/global.css` (insert `.corner-mark` rules after the `.filmstrip` block, before line 469's `.reveal` comment)

**Interfaces:**
- Produces: CSS class `.prose-accent` (replaces `.contact-card` — same box: `border-radius: var(--radius-m); border: 1px solid rgba(0,0,0,.09); background: var(--color-surface); padding: 22px;` with dark overrides, plus `.prose-accent a` styled in `--color-amber`/`--color-amber-dark` monospace). Task 2 consumes this class name.
- Produces: CSS classes `.corner-mark`, `.corner-mark-tl`, `.corner-mark-tr`, `.corner-mark-bl`, `.corner-mark-br` — four absolutely-positioned decorative corner brackets, `aria-hidden`-safe (purely visual, no semantic meaning). Task 4 consumes these.

- [ ] **Step 1: Rename `.contact-card` to `.prose-accent` in global.css**

Open `web/src/styles/global.css` and replace lines 158-176:

```css
@layer components {
  .contact-card {
    margin-top: 24px;
    border-radius: var(--radius-m);
    border: 1px solid rgba(0, 0, 0, 0.09);
    background: var(--color-surface);
    padding: 22px;
  }
  .dark .contact-card {
    border-color: rgba(255, 255, 255, 0.1);
    background: var(--color-surface-dark);
  }
  .contact-card a {
    font-family: var(--font-mono);
    color: var(--color-amber);
  }
  .dark .contact-card a {
    color: var(--color-amber-dark);
  }
```

with:

```css
@layer components {
  /* Selective card accent for Prose-template pages (About/Contact/Privacy/
     Terms) — body copy stays plain editorial text; only call-out blocks like
     contact links or a "verify it yourself" note use this. */
  .prose-accent {
    margin-top: 24px;
    border-radius: var(--radius-m);
    border: 1px solid rgba(0, 0, 0, 0.09);
    background: var(--color-surface);
    padding: 22px;
  }
  .dark .prose-accent {
    border-color: rgba(255, 255, 255, 0.1);
    background: var(--color-surface-dark);
  }
  .prose-accent a {
    font-family: var(--font-mono);
    color: var(--color-amber);
  }
  .dark .prose-accent a {
    color: var(--color-amber-dark);
  }
```

(Only the class name changes — `.contact-card` → `.prose-accent` — the box model, colors, and nested `a` rule are byte-identical. The `/* Signature hero effect... */` comment above this block on line 155-157 stays where it is, unrelated to this rename.)

- [ ] **Step 2: Add `.corner-mark` rules after the filmstrip block**

Find this block in `web/src/styles/global.css` (currently around line 456-467):

```css
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
  }
```

Insert immediately after its closing `}` (still inside the same `@layer components { ... }` block, before the `/* Scroll-reveal ... */` comment):

```css

  /* AdSlot "negative frame" corner marks (taste upgrade, secondary pages) —
     purely decorative, the slot itself carries aria-hidden. */
  .corner-mark {
    position: absolute;
    width: 14px;
    height: 14px;
    border-color: var(--color-amber);
    opacity: 0.5;
  }
  .dark .corner-mark {
    border-color: var(--color-amber-dark);
  }
  .corner-mark-tl {
    top: 10px;
    left: 10px;
    border-top: 2px solid;
    border-left: 2px solid;
  }
  .corner-mark-tr {
    top: 10px;
    right: 10px;
    border-top: 2px solid;
    border-right: 2px solid;
  }
  .corner-mark-bl {
    bottom: 10px;
    left: 10px;
    border-bottom: 2px solid;
    border-left: 2px solid;
  }
  .corner-mark-br {
    bottom: 10px;
    right: 10px;
    border-bottom: 2px solid;
    border-right: 2px solid;
  }
```

- [ ] **Step 3: Verify no remaining references to the old class name**

Run: `grep -rn "contact-card" /Users/ayberk/Desktop/PDF_Screen_Shotter/web/src`
Expected: no output yet (markup still uses `contact-card` until Task 2 — this step is just confirming the CSS file itself no longer defines `.contact-card`):

Run: `grep -n "\.contact-card" /Users/ayberk/Desktop/PDF_Screen_Shotter/web/src/styles/global.css`
Expected: no output (only `.prose-accent` remains in the CSS file; the `.contact-card` markup usages in the 4 About/Contact page files are handled in Task 2 and are expected to still say `contact-card` until then — this is a transient, same-commit inconsistency that Task 2 immediately fixes, so do not run the build between Task 1 and Task 2).

- [ ] **Step 4: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/styles/global.css
git commit -m "style(web): rename .contact-card to .prose-accent, add AdSlot corner-mark CSS"
```

---

### Task 2: Prose pages — apply `.prose-accent` (About/Contact rename + Privacy/Terms new blocks)

**Files:**
- Modify: `web/src/pages/about.astro`
- Modify: `web/src/pages/tr/about.astro`
- Modify: `web/src/pages/contact.astro`
- Modify: `web/src/pages/tr/contact.astro`
- Modify: `web/src/pages/privacy.astro`
- Modify: `web/src/pages/tr/privacy.astro`
- Modify: `web/src/pages/terms.astro`
- Modify: `web/src/pages/tr/terms.astro`

**Interfaces:**
- Consumes: CSS class `.prose-accent` from Task 1.

- [ ] **Step 1: Update About (EN) — rename card class**

In `web/src/pages/about.astro`, replace:

```astro
  <div class="contact-card">
    <p class="mb-2">Source code and issue tracker:</p>
```

with:

```astro
  <div class="prose-accent">
    <p class="mb-2">Source code and issue tracker:</p>
```

- [ ] **Step 2: Update About (TR) — rename card class**

In `web/src/pages/tr/about.astro`, replace:

```astro
  <div class="contact-card">
    <p class="mb-2">Kaynak kodu ve hata takip sistemi:</p>
```

with:

```astro
  <div class="prose-accent">
    <p class="mb-2">Kaynak kodu ve hata takip sistemi:</p>
```

- [ ] **Step 3: Update Contact (EN) — rename both card classes**

In `web/src/pages/contact.astro`, replace both occurrences of `<div class="contact-card">` with `<div class="prose-accent">` (one wraps "Issues & feature requests:", one wraps "Everything else:").

- [ ] **Step 4: Update Contact (TR) — rename both card classes**

In `web/src/pages/tr/contact.astro`, replace both occurrences of `<div class="contact-card">` with `<div class="prose-accent">` (one wraps "Hatalar ve öneriler:", one wraps "Diğer her şey için:").

- [ ] **Step 5: Add a new accent block to Privacy (EN)**

In `web/src/pages/privacy.astro`, replace:

```astro
  <h2>Your files</h2>
  <p>
    PDF files you use with the tools on this site are processed entirely on your device, in
    your browser. They are never uploaded, transmitted, stored, or seen by us or by any
    third party. This is not a policy choice that could quietly change — the site has no
    server capable of receiving files, and the open-source code can be inspected to verify
    it.
  </p>
```

with:

```astro
  <h2>Your files</h2>
  <p>
    PDF files you use with the tools on this site are processed entirely on your device, in
    your browser. They are never uploaded, transmitted, stored, or seen by us or by any
    third party. This is not a policy choice that could quietly change — the site has no
    server capable of receiving files, and the open-source code can be inspected to verify
    it.
  </p>
  <div class="prose-accent">
    <p class="mb-2">Verify it yourself:</p>
    <p class="text-sm">
      Open your browser's DevTools → Network tab while converting a file. You will see zero
      requests carrying file data.
    </p>
  </div>
```

- [ ] **Step 6: Add a new accent block to Privacy (TR)**

In `web/src/pages/tr/privacy.astro`, replace:

```astro
  <h2>Dosyaların</h2>
  <p>
    Bu sitedeki araçlarla kullandığın PDF dosyaları tamamen cihazında, tarayıcının içinde
    işlenir. Bize ya da herhangi bir üçüncü tarafa yüklenmez, iletilmez, saklanmaz ve
    görülmez. Bu, sessizce değişebilecek bir politika tercihi değildir — sitenin dosya
    alabilecek bir sunucusu yoktur ve açık kaynak kod incelenerek doğrulanabilir.
  </p>
```

with:

```astro
  <h2>Dosyaların</h2>
  <p>
    Bu sitedeki araçlarla kullandığın PDF dosyaları tamamen cihazında, tarayıcının içinde
    işlenir. Bize ya da herhangi bir üçüncü tarafa yüklenmez, iletilmez, saklanmaz ve
    görülmez. Bu, sessizce değişebilecek bir politika tercihi değildir — sitenin dosya
    alabilecek bir sunucusu yoktur ve açık kaynak kod incelenerek doğrulanabilir.
  </p>
  <div class="prose-accent">
    <p class="mb-2">Kendin doğrula:</p>
    <p class="text-sm">
      Bir dosyayı dönüştürürken tarayıcının DevTools → Network sekmesini aç. Dosya verisi
      taşıyan sıfır istek göreceksin.
    </p>
  </div>
```

- [ ] **Step 7: Add a new accent block to Terms (EN)**

In `web/src/pages/terms.astro`, replace:

```astro
  <h2>Open source</h2>
  <p>
    The site's code is open source under the AGPL-3.0 license. You may inspect, modify,
    and self-host it under the terms of that license.
  </p>
```

with:

```astro
  <h2>Open source</h2>
  <p>
    The site's code is open source under the AGPL-3.0 license. You may inspect, modify,
    and self-host it under the terms of that license.
  </p>
  <div class="prose-accent">
    <p class="mb-2">License:</p>
    <a href="https://github.com/ayberkkarakose/PDF_Screen_Shotter/blob/main/LICENSE" rel="noopener"
      >AGPL-3.0</a
    >
  </div>
```

- [ ] **Step 8: Add a new accent block to Terms (TR)**

In `web/src/pages/tr/terms.astro`, replace:

```astro
  <h2>Açık kaynak</h2>
  <p>
    Sitenin kodu AGPL-3.0 lisansı altında açık kaynaklıdır. Bu lisansın koşulları
    çerçevesinde inceleyebilir, değiştirebilir ve kendi sunucunda barındırabilirsin.
  </p>
```

with:

```astro
  <h2>Açık kaynak</h2>
  <p>
    Sitenin kodu AGPL-3.0 lisansı altında açık kaynaklıdır. Bu lisansın koşulları
    çerçevesinde inceleyebilir, değiştirebilir ve kendi sunucunda barındırabilirsin.
  </p>
  <div class="prose-accent">
    <p class="mb-2">Lisans:</p>
    <a href="https://github.com/ayberkkarakose/PDF_Screen_Shotter/blob/main/LICENSE" rel="noopener"
      >AGPL-3.0</a
    >
  </div>
```

- [ ] **Step 9: Confirm no `.contact-card` references remain anywhere**

Run: `grep -rn "contact-card" /Users/ayberk/Desktop/PDF_Screen_Shotter/web/src`
Expected: no output.

- [ ] **Step 10: Build and typecheck**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run check && npm run build`
Expected: both exit 0, build reports 14 pages (unchanged page count — no new routes).

- [ ] **Step 11: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/pages/about.astro web/src/pages/tr/about.astro \
  web/src/pages/contact.astro web/src/pages/tr/contact.astro \
  web/src/pages/privacy.astro web/src/pages/tr/privacy.astro \
  web/src/pages/terms.astro web/src/pages/tr/terms.astro
git commit -m "style(web): apply prose-accent cards to About/Contact/Privacy/Terms (EN+TR)"
```

---

### Task 3: i18n — add the `adSpace` string

**Files:**
- Modify: `web/src/i18n/en.ts`
- Modify: `web/src/i18n/tr.ts`

**Interfaces:**
- Produces: `Strings.adSpace: string` (new field on the shared `Strings` type). Task 4 consumes `strings.adSpace` via `ToolPage.astro`'s existing `strings` variable (`p.lang === 'tr' ? tr : en`).

- [ ] **Step 1: Add `adSpace` to the English strings**

In `web/src/i18n/en.ts`, add a new line right after `desktopAppLink: 'Get the desktop app',` (still inside the `en` object, before the closing `} as const;`):

```ts
  desktopAppLink: 'Get the desktop app',
  adSpace: 'Ad space',
} as const;
```

- [ ] **Step 2: Add `adSpace` to the Turkish strings**

In `web/src/i18n/tr.ts`, add a new line right after `desktopAppLink: 'Masaüstü uygulamayı edin',` (still inside the `tr` object, before the closing `};`):

```ts
  desktopAppLink: 'Masaüstü uygulamayı edin',
  adSpace: 'Reklam alanı',
};
```

- [ ] **Step 3: Typecheck**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run check`
Expected: exit 0. (`Strings = { [K in keyof typeof en]: string }` means `tr`'s explicit `Strings` annotation will fail to compile if `adSpace` is missing from either file — this step is the safety check for that.)

- [ ] **Step 4: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/i18n/en.ts web/src/i18n/tr.ts
git commit -m "feat(web): add adSpace i18n string for the AdSlot label"
```

---

### Task 4: AdSlot — corner-marks + label

**Files:**
- Modify: `web/src/components/AdSlot.astro`
- Modify: `web/src/layouts/ToolPage.astro:118` (pass the new `label` prop)

**Interfaces:**
- Consumes: CSS classes `.corner-mark*` (Task 1), `shadow-1` Tailwind utility (pre-existing), `.card-lit` (pre-existing), `strings.adSpace` (Task 3).
- Produces: `AdSlot` Astro component now requires a `label: string` prop (previously had none besides optional `height`). `ToolPage.astro` is the only caller in the codebase (confirmed via `grep -rn "AdSlot" web/src` in planning) so this is not a breaking change to any other consumer.

- [ ] **Step 1: Rewrite AdSlot.astro**

Replace the full contents of `web/src/components/AdSlot.astro`:

```astro
---
// AdSlot: fixed-height reservation so ads can never cause layout shift
// (CLS ≈ 0 is a hard requirement, PRD R9). States: reserved · filled.
// Until AdSense is integrated the slot stays reserved and empty — it must
// never collapse. The corner-mark + label give it a "negative frame"
// placeholder look instead of reading as a broken/empty box.
interface Props {
  height?: number;
  label: string;
}
const { height = 280, label } = Astro.props;
---

<div
  aria-hidden="true"
  data-ad-slot="reserved"
  style={`height:${height}px`}
  class="relative flex w-full items-center justify-center overflow-hidden rounded-m bg-surface shadow-1 card-lit dark:bg-surface-dark"
>
  <span class="corner-mark corner-mark-tl"></span>
  <span class="corner-mark corner-mark-tr"></span>
  <span class="corner-mark corner-mark-bl"></span>
  <span class="corner-mark corner-mark-br"></span>
  <span class="font-mono text-[11px] tracking-[0.08em] text-ink-faint uppercase dark:text-ink-faint-dark"
    >{label}</span
  >
</div>
```

- [ ] **Step 2: Pass the label from ToolPage.astro**

In `web/src/layouts/ToolPage.astro`, replace:

```astro
    <div class="mt-10">
      <AdSlot />
    </div>
```

with:

```astro
    <div class="mt-10">
      <AdSlot label={strings.adSpace} />
    </div>
```

- [ ] **Step 3: Typecheck and build**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run check && npm run build`
Expected: both exit 0. (`npm run check` will fail with a missing-required-prop error if Step 2 is skipped — that's the safety net for the new required `label` prop.)

- [ ] **Step 4: Visual check in the browser**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run dev` (leave running), then open `http://localhost:4321/pdf-to-png/` and `http://localhost:4321/tr/pdf-to-jpg/` in a browser, scroll to the bottom. Confirm: the AdSlot box shows four amber corner brackets and a centered "Ad space" / "Reklam alanı" label, in both light and dark mode (use the theme toggle in the header). Stop the dev server (Ctrl-C) when done.

- [ ] **Step 5: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/components/AdSlot.astro web/src/layouts/ToolPage.astro
git commit -m "feat(web): give AdSlot a labeled corner-mark placeholder instead of a bare box"
```

---

### Task 5: ToolPage — "How it works" becomes a filmstrip

**Files:**
- Modify: `web/src/layouts/ToolPage.astro:82-97`

**Interfaces:**
- Consumes: CSS classes `.filmstrip`, `.filmstrip-frame`, `.filmstrip-sprockets` (pre-existing, from `global.css`, currently only used by `web/src/pages/index.astro`).
- Consumes: the existing `p.steps: Step[]` prop (`{ name: string; text: string }[]`) — no shape change, only the render markup changes.

- [ ] **Step 1: Replace the numbered-list "How it works" markup with a filmstrip**

In `web/src/layouts/ToolPage.astro`, replace:

```astro
    <section class="reveal" data-reveal>
      <h2 class="font-heading text-lg font-semibold">{p.howItWorks}</h2>
      <ol class="mt-3 flex flex-col gap-2 text-sm">
        {
          p.steps.map((s, i) => (
            <li class="flex gap-3">
              <span class="font-mono text-xs text-ink-muted dark:text-ink-muted-dark">{i + 1}.</span>
              <span>
                <span class="font-medium">{s.name}.</span> {s.text}
              </span>
            </li>
          ))
        }
      </ol>
    </section>
```

with:

```astro
    <section class="reveal" data-reveal>
      <h2 class="font-heading text-lg font-semibold">{p.howItWorks}</h2>
      <div class="filmstrip mt-3">
        {
          p.steps.map((s, i) => (
            <div class="filmstrip-frame">
              <div class="filmstrip-sprockets" aria-hidden="true" />
              <div class="font-heading text-lg font-semibold text-accent dark:text-amber-dark">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 class="mt-3 text-sm font-semibold">{s.name}</h3>
              <p class="mt-1.5 text-xs text-ink-muted dark:text-ink-muted-dark">{s.text}</p>
            </div>
          ))
        }
      </div>
    </section>
```

(This mirrors the homepage's filmstrip exactly — see `web/src/pages/index.astro`'s "How it works" section — except the number is derived from the array index (`i + 1`) rather than a `step.n` field, since `Step` only has `{ name, text }`, and the heading/paragraph map to `s.name`/`s.text` instead of `step.h`/`step.p`.)

- [ ] **Step 2: Build and visually confirm**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run build`
Expected: exit 0, 14 pages.

Run: `npm run dev` (leave running), open `http://localhost:4321/pdf-to-png/`, scroll to "How it works". Confirm it renders as a 3-frame filmstrip with sprocket-hole dots on top and dashed dividers between frames (desktop width), and stacks to one column with a top border at mobile width (resize the browser or use DevTools device toolbar). Check both `/pdf-to-jpg/` and the `/tr/` variants too, light + dark. Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/layouts/ToolPage.astro
git commit -m "feat(web): render ToolPage's How it works as a filmstrip, matching the homepage motif"
```

---

### Task 6: ToolPage — fix the FAQ invisible-until-scroll defect

**Files:**
- Modify: `web/src/layouts/ToolPage.astro:123-142` (the reveal script)
- Create: `web/e2e/tool-page-reveal.spec.ts`

**Interfaces:**
- Consumes: `[data-reveal]` elements and the `.reveal`/`.reveal-in` CSS classes (unchanged, pre-existing in `global.css`).

- [ ] **Step 1: Write the failing e2e test first**

Create `web/e2e/tool-page-reveal.spec.ts`:

```ts
// Regression test for the "FAQ invisible until scroll" defect found during
// the secondary-pages UI audit (2026-07-22): `.reveal` sections start at
// opacity:0 and only reach opacity:1 once an IntersectionObserver fires.
// The FAQ section sits below the initial viewport, so without a real scroll
// event it stayed at opacity:0 forever — invisible to screen readers, print,
// and any visit that doesn't scroll. This test loads the page and asserts
// the FAQ becomes visible WITHOUT performing any scroll or pointer action.

import { expect, test } from '@playwright/test';

test('FAQ section becomes visible without any scroll (ADR-006 reveal fallback)', async ({
  page,
}) => {
  await page.goto('/pdf-to-png/');

  const faqHeading = page.locator('h2', { hasText: 'Frequently asked questions' });
  const faqSection = faqHeading.locator('xpath=..');

  await expect
    .poll(async () => faqSection.evaluate((el) => getComputedStyle(el).opacity), {
      message: 'FAQ section should reach opacity 1 within ~1s without any scroll',
      timeout: 2_000,
    })
    .toBe('1');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run build && npx playwright test e2e/tool-page-reveal.spec.ts`
Expected: FAIL — the polled opacity stays `'0'` and the assertion times out, because the current reveal script never fires without a scroll/intersection event.

- [ ] **Step 3: Fix the reveal script**

In `web/src/layouts/ToolPage.astro`, replace the closing `<script>` block:

```astro
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

with:

```astro
<script>
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add('reveal-in');
  } else {
    // rootMargin extends the trigger zone 200px past the real viewport edge,
    // so sections just past the fold (like FAQ, below "How it works") reveal
    // as the user approaches rather than only once fully in view.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '200px 0px' },
    );
    for (const el of targets) io.observe(el);

    // Fallback: guarantee no [data-reveal] section stays permanently
    // invisible for visitors who never trigger a real intersection —
    // screen readers, print, automated tooling, or a page tall enough that
    // rootMargin alone doesn't reach it. Whatever hasn't revealed within
    // 500ms gets it directly; the normal scroll-triggered fade-in is
    // unaffected for anything that already revealed before the timer fires.
    setTimeout(() => {
      for (const el of targets) el.classList.add('reveal-in');
      io.disconnect();
    }, 500);
  }
</script>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run build && npx playwright test e2e/tool-page-reveal.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run the full e2e suite to check for regressions**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run e2e`
Expected: all tests pass (existing `home.spec.ts` + `pdf-to-png.spec.ts` + the new `tool-page-reveal.spec.ts`).

- [ ] **Step 6: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/layouts/ToolPage.astro web/e2e/tool-page-reveal.spec.ts
git commit -m "fix(web): FAQ section no longer stays invisible without a real scroll event"
```

---

### Task 7: ToolShell — remove the dead-zone `min-h-[420px]`

**Files:**
- Modify: `web/src/components/ToolShell.tsx:309`
- Create: `web/e2e/tool-shell-idle-gap.spec.ts`

**Interfaces:**
- Consumes: nothing new. Does not touch the separate `regionMinHeight` state/mechanism (lines 53-54, 220, 253, 310) that pins height across phase transitions — that stays exactly as-is.

- [ ] **Step 1: Write the failing e2e test first**

Create `web/e2e/tool-shell-idle-gap.spec.ts`:

```ts
// Regression test for the "dead vertical gap under the idle DropZone"
// defect found during the secondary-pages UI audit (2026-07-22): the
// ToolShell region wrapper was hardcoded to min-h-[420px], leaving 200px+
// of blank space between the DropZone/privacy line and "How it works" on
// first load, before any file is dropped. This asserts the gap stays small.

import { expect, test } from '@playwright/test';

test('idle-state DropZone has no large dead zone before "How it works"', async ({ page }) => {
  await page.goto('/pdf-to-png/');

  const privacyLine = page.getByText('Files are processed on your device', { exact: false });
  const howItWorks = page.locator('h2', { hasText: 'How it works' });

  const privacyBottom = await privacyLine.evaluate((el) => el.getBoundingClientRect().bottom);
  const howItWorksTop = await howItWorks.evaluate((el) => el.getBoundingClientRect().top);

  expect(howItWorksTop - privacyBottom).toBeLessThan(120);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run build && npx playwright test e2e/tool-shell-idle-gap.spec.ts`
Expected: FAIL — the measured gap is roughly 260px (well over the 120px threshold), matching the gap measured live during the audit (`verifyBottom: 443`, `howItWorksTop: 704` at 1280px width → 261px gap).

- [ ] **Step 3: Remove the hardcoded min-height**

In `web/src/components/ToolShell.tsx`, replace:

```tsx
    <div
      ref={regionRef}
      className="flex min-h-[420px] flex-col gap-5"
      style={regionMinHeight != null ? { minHeight: regionMinHeight } : undefined}
    >
```

with:

```tsx
    <div
      ref={regionRef}
      className="flex flex-col gap-5"
      style={regionMinHeight != null ? { minHeight: regionMinHeight } : undefined}
    >
```

(The `regionMinHeight` inline `style` — set only once the user hits Convert, to pin height across processing/done and prevent scroll-jump per §4.1 — is untouched. This only removes the static `420px` floor that applied before any interaction.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run build && npx playwright test e2e/tool-shell-idle-gap.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run the full e2e and unit suites to check for regressions**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm test && npm run e2e`
Expected: all pass, including `jobControllerRespawn.test.ts` and the scroll-jump-sensitive parts of `pdf-to-png.spec.ts` (the convert flow's `regionRef.current?.scrollIntoView(...)` call is unaffected by this change since it fires after `regionMinHeight` is already set).

- [ ] **Step 6: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/components/ToolShell.tsx web/e2e/tool-shell-idle-gap.spec.ts
git commit -m "fix(web): remove ToolShell's hardcoded 420px idle-state dead zone"
```

---

### Task 8: Full verification pass

**Files:** none (verification only — no code changes).

- [ ] **Step 1: Full build + typecheck + unit + e2e**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run check && npm test && npm run build && npm run e2e`
Expected: all green, build reports 14 pages (page count unchanged from before this plan).

- [ ] **Step 2: WASM budget check**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && node scripts/check-wasm-budget.mjs`
Expected: unchanged, still under the 6MB gzip budget (this plan adds zero JS/WASM).

- [ ] **Step 3: Full responsive screenshot pass**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run preview` (leave running in one terminal), then in another: `node scripts/screenshots.mjs --responsive`.
Expected: screenshots written to `web/screenshots/`. Manually inspect `tool-empty*`, `tool-options*`, `home*`, and `home-tr*` at 360/768/1280 × light/dark. Confirm: no dead blank zone under the idle DropZone, "How it works" renders as a filmstrip, AdSlot shows corner marks + label, and the FAQ/prose-accent cards are visible without scrolling for viewport heights ≥900px (they should already have `reveal-in` from the widened `rootMargin`).

(This script does not yet cover About/Contact/Privacy/Terms or `/pdf-to-jpg/` — for those, use the manual dev-server check from Task 4 Step 4 / Task 5 Step 2 if not already done in this session.)

- [ ] **Step 4: Lighthouse CI**

Run: `cd /Users/ayberk/Desktop/PDF_Screen_Shotter/web && npm run lhci`
Expected: all assertions pass — ≥95 on all four categories, CLS ≤0.02, on both `/` and `/pdf-to-png` (the existing gate). Pay particular attention to CLS: the AdSlot still reserves its fixed height and the `min-h-[420px]` removal only affects the *idle* state (before any layout-shifting content appears), so no regression is expected, but this is the authoritative check.

- [ ] **Step 5: Final commit (only if any of the above required fixes)**

If Steps 1-4 all passed cleanly with no changes needed, there is nothing to commit here — Tasks 1-7 already committed everything. If any step required a fix, commit it with a message describing what verification caught.
