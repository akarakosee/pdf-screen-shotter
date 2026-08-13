# Sign PDF Guide Layer Resolution Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the pixelated/blurry appearance of the Sign PDF signature-placement guide layer by quadrupling the source render resolution and capping the maximum CSS zoom ratio.

**Architecture:** `SignShell.tsx`'s live page preview and its CSS-cropped guide overlay share a single `previewUrl` image fetched via `JobController.previewPage(file, page, dpi)`. Raising that call's `dpi` argument from 200 to 400 quadruples pixel density for both consumers with no new worker messages, no new state, and no change to the two other `previewPage` call sites (`PageCard`, `ToolShell`), which don't pass a `dpi` argument and keep using the 72 DPI default. A second, independent change raises the guide's minimum-height clamp so the CSS zoom ratio can never exceed ~2500% even if the user shrinks the placement box to its minimum.

**Tech Stack:** React (TSX), TypeScript, existing `JobController`/worker preview pipeline (no changes to worker or engine layers).

## Global Constraints

- No new `UiToWorkerMessage`/`WorkerToUiMessage` variants — spec explicitly rules out the crop-render worker approach (unverified mupdf.js clip-rect API).
- No debounce, no new state, no second render request on drag/resize — spec explicitly rules out the two-tier debounce approach.
- `PageCard` and `ToolShell`'s existing `previewPage(file, page)` calls (no third argument) must keep rendering at the default 72 DPI — do not touch those call sites or the `previewPage` default parameter.
- Verification is `tsc --noEmit` plus manual visual check by the user — per project rule (`CLAUDE.md`), do not use Playwright/browser automation for visual verification of this change.

---

### Task 1: Bump guide layer resolution and clamp the zoom ceiling

**Files:**
- Modify: `web/src/components/SignShell.tsx:111` (the `previewPage` call's `dpi` argument)
- Modify: `web/src/components/SignShell.tsx:211` (the guide's `heightFrac` clamp floor)

**Interfaces:**
- Consumes: `JobController.previewPage(file: File, page: number, dpi?: number): Promise<Blob>` — the `dpi` parameter already exists (added in a prior change to this file's history) and defaults to `PREVIEW_DPI` (72) when omitted. This task only changes the literal argument value passed from `SignShell`, not the method signature.
- Produces: nothing consumed by other tasks — this is the only task in the plan.

- [ ] **Step 1: Change the preview DPI from 200 to 400**

In `web/src/components/SignShell.tsx`, find:

```ts
      .previewPage(file, previewPageNum, 200)
```

Replace with:

```ts
      .previewPage(file, previewPageNum, 400)
```

- [ ] **Step 2: Verify no new TypeScript errors**

Run: `cd web && npx tsc --noEmit -p .`

Expected: the same pre-existing error set as before this change (`t.lang` on `Strings`, `JobController()` arg count, `Button` `size` prop mismatch — all unrelated to this file's preview logic). No new errors mentioning line 111 or the `previewPage` call.

- [ ] **Step 3: Raise the guide zoom-ceiling clamp from 0.02 to 0.04**

In `web/src/components/SignShell.tsx`, find:

```ts
        const scale = 100 / Math.max(0.02, customBox.heightFrac);
```

Replace with:

```ts
        const scale = 100 / Math.max(0.04, customBox.heightFrac);
```

- [ ] **Step 4: Verify no new TypeScript errors**

Run: `cd web && npx tsc --noEmit -p .`

Expected: identical error output to Step 2 — this is a numeric literal change with no type implications.

- [ ] **Step 5: Manual visual check (user-performed, per project rule)**

Per `CLAUDE.md`'s testing strategy, visual/UI verification for this change is done manually by the user in their own browser — not via Playwright or browser automation. Ask the user to:
1. Open `/sign-pdf` in the running dev server.
2. Upload a PDF with visible printed text near where a signature would go.
3. Drag the placement box over that text and confirm the guide layer (faint text shown in the "Draw your signature" canvas) is now legibly sharp, not pixelated.
4. Shrink the box to its smallest height and confirm the guide text is still readable (not stretched into a blur past a ~2500% zoom).

- [ ] **Step 6: Commit**

```bash
cd /Users/ayberk/Desktop/PDF_Screen_Shotter
git add web/src/components/SignShell.tsx
git commit -m "$(cat <<'EOF'
fix(sign-pdf): sharpen signature guide layer at higher preview DPI

Bumps the Sign PDF live-preview render from 200 to 400 DPI and raises
the guide layer's minimum zoom-ceiling clamp from 0.02 to 0.04, fixing
the pixelated/blurry appearance reported when the placement box is
small. No new worker messages or debounce logic, per the approved
design spec (docs/superpowers/specs/2026-07-27-sign-pdf-guide-resolution-design.md).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
