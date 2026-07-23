# Merge PDF tool — design spec

Date: 2026-07-23
Status: Approved, pending implementation plan

## Context

`ToolShell.tsx` already supports multi-file upload for the raster-export tools
(`pdf-to-png`/`pdf-to-jpg`): file queue, per-file DPI/page-range/background
config, batch convert to a ZIP of PNGs/JPGs. A request came in framed as
"add multi-file support + a `toolMode` strategy pattern to `ToolShell`" to
enable a future Merge PDF tool. Investigation found multi-file upload was
already done, and that jamming a merge mode into `ToolShell` would violate
WEB_PLANI.md's binding rule: **"Her araç kendi URL'inde yaşar"** (each tool
lives at its own URL; tools share only a common engine layer, §WEB_PLANI
line 53). Merge's data flow (N PDFs → 1 merged PDF) is also incompatible
with `ToolShell`'s raster-export data flow (per-file DPI/page-range →
per-page PNG/JPG → ZIP) — forcing them into one component would mean
threading two unrelated branches through an already-587-line file.

`ToolId` in `core/types.ts` already reserves `'merge' | 'split'` — this spec
implements `merge` only. `PdfEngine` currently only rasterizes
(`open/pageCount/renderPage/close`); it has no document-manipulation
capability. `mupdf` (already a dependency, v1.28.0) supports real PDF
document editing via `PDFDocument` + `graftPage`, so merge can produce a
genuine merged PDF client-side, not a re-rasterized approximation.

## Decision

Build Merge as its own page and its own shell component, sharing only the
already-generic pieces (`DropZone`, `FileChip`, `PrivacyLine`, `Toast`).
Do not modify `ToolShell.tsx`'s state machine or add a `toolMode` prop to it.

## Architecture

### Pages & routing
- `web/src/pages/merge-pdf.astro` (EN) and `web/src/pages/tr/merge-pdf.astro`
  (TR), built on the existing shared `ToolPage.astro` layout (same SEO/FAQ/
  JSON-LD scaffolding as `/pdf-to-png`), mounting `<MergeShell client:...>`.
- `i18n/toolCopy.ts` / `en.ts` / `tr.ts` gain a `merge` tool-copy entry
  (title, FAQ, how-it-works), following the existing per-tool pattern.
- Home page tool grid gains a third card for Merge PDF.

### `MergeShell.tsx` (new component)
- State: `phase: 'upload' | 'reorder' | 'processing' | 'done'`, `chips:
  ChipData[]` (array order = merge order), `filesRef` map — same intake
  primitives `ToolShell` already uses, duplicated rather than extracted into
  a shared hook (the surrounding logic diverges enough that a forced shared
  hook would be indirection for ~30 lines, not a real reduction).
- Reuses `DropZone`, `FileChip` (gains new optional `onMoveUp`/`onMoveDown`
  props, rendered only when passed — no behavior change for `ToolShell`'s
  existing usage), `PrivacyLine`, `Toast` unchanged in their core logic.
- Does not use `OptionsPanel`, `PagePreview`, or any per-file DPI/range
  config — none of that applies to merge.
- Reordering: up/down arrow buttons on each `FileChip` in this mode (simpler,
  keyboard-accessible, no new drag library — chosen over drag-and-drop).
- Convert button disabled unless `chips.filter(status === 'valid').length >= 2`.
- Result: a single merged PDF Blob, direct download (no ZIP branch — merge
  always produces exactly one output file).

### Engine + worker protocol (ADR-008)
- `PdfEngine` interface gains `merge(docs: PdfDoc[]): Promise<Uint8Array>`.
- `MuPdfEngine.merge()` opens a new empty `PDFDocument`, uses `graftPage` to
  copy every page from each input doc in array order, serializes with
  `doc.saveToBuffer()`.
- New worker messages (mirrors the existing `inspect`/`start` pattern):
  - UI→worker: `{ type: 'merge-start'; files: ArrayBuffer[]; meta: FileMeta[] }`
  - worker→UI: `{ type: 'merge-progress'; fileIndex: number; totalFiles: number }`
  - worker→UI: `{ type: 'merge-done'; result: { output: Blob; outputName: string } }`
  - Failure paths reuse the existing `file-error`/`fatal` messages.
- `JobController` gains a `mergeFiles()` method paralleling `start()`.
- This is a new worker protocol surface, same precedent as ADR-003 (inspect)
  and ADR-006/007 (demo-render, filmstrip) — written up as ADR-008, and
  SISTEM_TASARIMI.md §3.3 gets the new message types added.

### Error handling
- Per-file validation (magic bytes, encrypted, corrupt) reuses
  `validatePdfFile` + the existing `inspect` message exactly as today — a bad
  file gets `status: 'failed'` on its chip and is excluded from the merge;
  the batch/UI continues (matches the existing skip-and-continue philosophy
  for the raster tools). Merge requires ≥2 *valid* files after exclusions,
  checked live in the Convert button's disabled state.

### Testing
- Unit test for `MuPdfEngine.merge()`: output page count equals the sum of
  input page counts across a small multi-file fixture set. No byte-level
  golden comparison (merge output isn't pixel-compared the way render is).
- E2e (`e2e/merge-pdf.spec.ts`): upload 2 fixture PDFs → reorder → merge →
  download → assert the merged PDF's page count via a PDF-parsing check
  (mirrors the existing zip-content e2e assertions for pdf-to-png).

## Non-goals (this spec)

- Split PDF — reserved `ToolId` but out of scope here.
- Drag-and-drop reordering — up/down buttons only, per the approved design.
- Per-page selection/rotation during merge — whole-document merge only.

## Out-of-scope cleanup done alongside this spec

- Fixed a pre-existing bug in `DropZone.tsx`: two `<input type="file">`
  elements both bound to the same `inputRef`, left over from in-progress
  redesign work already in the tree. Removed the duplicate; the remaining
  input (outside the clickable `div`) is functionally identical to the one
  removed. Unrelated to Merge itself, but was blocking safe reuse of
  `DropZone` in `MergeShell`.
