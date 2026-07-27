# Crop PDF tool — design spec

Date: 2026-07-27
Status: Approved, pending implementation plan

## Context

Open-source PDF tool research (`docs/open-source-pdf-tools-research-2026-07-27.md`)
ranked Crop PDF as the highest-ROI, lowest-complexity gap in the current
21-tool lineup: no worker protocol change, no new WASM dependency, and two
existing patterns cover nearly all of it.

- `CompressShell.tsx` is the reference for the shell's state machine: a
  single-file tool with `phase: 'upload' | 'options' | 'processing' | 'done'`,
  `DropZone` intake, `JobController` for the (here: trivial) processing step,
  a result card with one primary download action.
- `SignShell.tsx` (this session) already has the exact interaction Crop
  needs: a draggable/resizable fractional-coordinate box
  (`customBox: { xFrac, yFrac, widthFrac, heightFrac }`) overlaid on a live
  page preview image, with the `suppressNextClickRef` guard that stops the
  box from re-centering after a drag/resize release.

Crop itself needs no WASM rendering to *apply* — it is a `pdf-lib`
`page.setCropBox()` metadata change, not a rasterization. The existing
`mupdf`/worker pipeline is only used to render the *preview* image the user
drags the box over (via `JobController.previewPage`, same as `SignShell`).

## Decision

Build Crop as its own page and its own shell component (`CropShell.tsx`),
per WEB_PLANI's "each tool lives at its own URL" rule (already the pattern
for every tool in this codebase — see `2026-07-23-merge-pdf-design.md`).
The crop itself runs synchronously via `pdf-lib` in a new `engine/cropPdf.ts`
file (same style as `engine/signPdf.ts`/`engine/flattenPdf.ts` — no worker
message, no `JobController` method beyond the existing `previewPage` used
for the drag-box preview).

**One crop box, applied to every page.** The user draws a single crop
rectangle against page 1's preview; that same fractional region is applied
to all pages, scaled independently to each page's own dimensions (handles
mixed A4/Letter documents correctly, since the crop is stored as a fraction
of page width/height, not absolute points). No per-page crop, no preset
aspect ratios, no undo/redo — confirmed with the user as out of scope for
this pass.

## Architecture

### Pages & routing
- `web/src/pages/crop-pdf.astro` (EN) and `web/src/pages/tr/crop-pdf.astro`
  (TR), built on the existing shared `ToolPage.astro` layout (same SEO/FAQ/
  JSON-LD scaffolding every tool page uses), mounting `<CropShell client:load>`.
- `i18n/toolCopy.ts` gains a `cropCopy: Record<'en' | 'tr', ToolCopy>` export
  (title/description/h1/tagline/howToName/howItWorks/faqTitle/steps/faq/
  crossLink — full `ToolCopy` shape, including `faqTitle`/`faq`, unlike some
  older entries that are missing them; this spec does not touch those).
  Tagline must fit one line at the shared 720px container (per this
  session's tagline-length fix) — draft and measure against the ~85-90
  char budget observed to be safe.
- Home page (`index.astro` + `tr/index.astro`) tool grid gains a Crop PDF
  card (icon: `Crop` from `lucide-react`, category label `UTILITY · TRIM`
  matching the `badgeLabel` convention other utility tools use).

### `engine/cropPdf.ts` (new)
```ts
export interface CropBoxFrac {
  xFrac: number;
  yFrac: number;
  widthFrac: number;
  heightFrac: number;
}

export async function cropPdf(
  file: File,
  box: CropBoxFrac
): Promise<{ output: Blob; outputName: string; durationMs: number }>
```
- Loads via `PDFDocument.load(arrayBuffer, { ignoreEncryption: true })`
  (same as every other `engine/*.ts` file).
- For each page: reads `page.getSize()` (width/height in PDF points),
  converts the screen-space (top-down) fractional box to PDF's bottom-up
  coordinate space:
  ```
  pdfX = box.xFrac * pageWidth
  pdfY = pageHeight - (box.yFrac + box.heightFrac) * pageHeight
  pdfWidth = box.widthFrac * pageWidth
  pdfHeight = box.heightFrac * pageHeight
  ```
  then calls `page.setCropBox(pdfX, pdfY, pdfWidth, pdfHeight)`. `MediaBox`
  is left untouched (standard PDF convention — `CropBox` is the visible-area
  override viewers respect; keeping `MediaBox` intact means the operation
  is non-destructive and reversible by any other tool).
- Output name via existing `sanitizeBaseName`/naming helpers, suffix
  `_cropped.pdf` (matches the `_pages.zip`/`_flattened.pdf` suffix
  convention already used by other engine files).
- Zero-page or encrypted-and-unopenable files throw the same
  `EncryptedError`/generic-error taxonomy `signPdf.ts` already uses; the
  shell maps those to existing toast copy (`t.encryptedFile`/`t.corruptFile`).

### `CropShell.tsx` (new component)
- State machine: `phase: 'upload' | 'options' | 'processing' | 'done'`
  (`CompressShell` shape — crop is a single-file, single-output tool, no
  multi-file queue).
- `upload`: `<DropZone t={t} hasFiles={false} onFiles={...} multiple={false} />`
  + `PrivacyLine`, unchanged defaults (PDF-only, no `accept`/`idleLabel`
  override needed — this is a PDF-in-PDF-out tool like Compress/Protect).
- `options`: page-1 preview fetched via the existing
  `JobController.previewPage(file, 1, dpi)` (reuses the controller/worker
  pipeline already wired for every tool; no new worker message). Overlays
  `SignShell`'s exact draggable/resizable box implementation — ported, not
  abstracted into a shared component: the two boxes serve different
  purposes (signature placement vs. crop region) and diverge in what
  renders inside them (signature preview vs. plain crop outline), so a
  forced shared component would be indirection for ~80 lines, matching the
  reasoning `2026-07-23-merge-pdf-design.md` used for not extracting a
  shared intake hook. Default box: centered, 80% width/height (a sane
  starting crop, adjustable before confirming).
- `processing`: crop runs synchronously (`cropPdf()` resolves in well under
  a second for typical documents — no page-by-page progress needed), but
  the phase is still shown briefly via the existing `ProgressPanel` pattern
  for visual consistency with every other tool (avoids an instant-flash
  transition, matches the project's binding "never leave the user with an
  instant, static screen" rule).
- `done`: single primary download button (`ResultPanel`-style card, ported
  inline as `CompressShell` does — not `ResultPanel` itself, since
  `ResultPanel` is typed around multi-file `ExportResult`/`skipped[]`, which
  doesn't apply here).

### No changes to
- `JobController.ts` — no new message type; `previewPage` already exists
  and already defaults to `PREVIEW_DPI`.
- `render.worker.ts` — crop never touches the worker beyond the existing
  preview-page path.
- `DropZone.tsx` — used with its current defaults, no new props needed.
- `core/types.ts` `ToolId` — crop is not part of the raster-export
  (`start`/`ExportResult`) pipeline, so it doesn't need a `ToolId` entry any
  more than Sign/Flatten/Compress do.

## Testing

- `test/cropPdf.test.ts` (new, mirrors `test/flattenPdf.test.ts`): verifies
  `setCropBox` values for a known input box against a fixture PDF, confirms
  `MediaBox` is unchanged, confirms mixed-page-size documents scale the
  fraction correctly per page.
- Manual visual check (per `CLAUDE.md`'s testing rule — UI verification is
  manual, not Playwright): drag-box interaction on `/crop-pdf`, confirm the
  box behaves identically to `/sign-pdf`'s placement box (no post-drag
  jump, correct amber styling), confirm the exported PDF's visible area in
  a real PDF viewer matches the drawn box.

## Out of scope (YAGNI, confirmed with user)

- Per-page independent crop boxes.
- Preset crop ratios (A4→Letter, "trim white margins" auto-detect, etc.).
- Undo/redo or a before/after preview toggle.
