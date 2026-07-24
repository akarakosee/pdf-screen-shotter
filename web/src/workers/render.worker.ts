// Single render worker — SISTEM_TASARIMI §3.3 message protocol.
// The PDF engine lives only here; the main thread never imports it.
// Cancel is cooperative (flag checked per page); pages already written to the
// ZIP stream are preserved so a partial ZIP stays downloadable.

import type {
  ExportResult,
  FileMeta,
  PageError,
  PerFileExportOptions,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from '../core/types';
import { DEFAULT_JPG_QUALITY, PREVIEW_DPI } from '../core/config';
import { MuPdfEngine } from '../engine/MuPdfEngine';
import { EncryptedError } from '../engine/PdfEngine';
import { ZipStream } from './zipStream';
import { mergedFileName, pageFileName, sanitizeBaseName, zipFileName } from '../app/naming';
import { parsePageRange } from '../app/pageRange';
import { renderDemoPages } from './demoRender';

const engine = new MuPdfEngine();
let cancelled = false;

const post = (msg: WorkerToUiMessage) => self.postMessage(msg);

const ready = engine
  .init()
  .then(() => post({ type: 'ready' }))
  .catch((e) => post({ type: 'fatal', message: String(e) }));

// Messages are processed strictly one at a time: the WASM engine is not
// reentrant, so interleaving inspect/preview/start handlers corrupts state.
// `cancel` bypasses the queue (it only flips a flag read by the running job).
let queue: Promise<void> = Promise.resolve();

self.onmessage = (ev: MessageEvent<UiToWorkerMessage>) => {
  const msg = ev.data;
  if (msg.type === 'cancel') {
    cancelled = true;
    return;
  }
  // Reset on arrival (not when the queued run starts) so a cancel sent while
  // earlier messages are still processing isn't lost.
  if (msg.type === 'start' || msg.type === 'merge-start' || msg.type === 'split-start') cancelled = false;
  queue = queue.then(async () => {
    try {
      await ready;
      if (msg.type === 'preview-page')
        await previewPage(msg.file, msg.dpi ?? PREVIEW_DPI, msg.page, msg.requestId);
      else if (msg.type === 'inspect') await inspect(msg.fileId, msg.file);
      else if (msg.type === 'start')
        await run(
          msg.files,
          msg.meta,
          msg.perFileOptions,
          msg.format,
          msg.jpgQuality ?? DEFAULT_JPG_QUALITY,
          msg.deliveryMethod,
        );
      else if (msg.type === 'merge-start') await mergeRun(msg.files, msg.meta);
      else if (msg.type === 'split-start') await splitRun(msg.file, msg.meta, msg.selectedPages, msg.mode);
      else if (msg.type === 'demo-render') await demoRenderHandler(msg.file, msg.dpi, msg.maxPages);
    } catch (e) {
      // Unrecoverable (e.g. WASM OOM): JobController terminates + respawns us.
      post({ type: 'fatal', message: e instanceof Error ? e.message : String(e) });
    }
  });
};

// ADR-003: open + count + close, no rendering. Errors reuse file-error with
// the existing taxonomy (encrypted | corrupt | zero-pages).
async function inspect(fileId: string, file: ArrayBuffer): Promise<void> {
  let doc;
  try {
    doc = await engine.open(file);
  } catch (e) {
    // The UI only ever sees the coarse taxonomy below; the real MuPDF message
    // (a genuine corrupt file vs. an edge case in a valid PDF) is only visible
    // here, so it's not lost entirely.
    console.error('[worker] inspect: engine.open failed:', e);
    post({
      type: 'file-error',
      fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
    return;
  }
  try {
    const pageCount = engine.pageCount(doc);
    if (pageCount === 0) post({ type: 'file-error', fileId, message: 'zero-pages' });
    else post({ type: 'inspect-done', fileId, pageCount });
  } finally {
    engine.close(doc);
  }
}

// A bad thumbnail must never take the whole worker down with it — unlike
// inspect()/run(), this used to have no catch around open()/renderPage()
// (back when this was the single-page preview() handler), so an
// unpreviewable file fell through to the outer 'fatal' handler, which
// terminates and respawns the worker (silently dropping any other queued
// message for the same file, e.g. its 'inspect'). preview-page-error is
// scoped to this one page/request instead. ADR-007: filmstrip thumbnails,
// one request per page, correlated by requestId (multiple pages/files can
// be in flight from the UI at once).
async function previewPage(
  file: ArrayBuffer,
  dpi: number,
  page: number,
  requestId: string,
): Promise<void> {
  let doc;
  try {
    doc = await engine.open(file);
  } catch (e) {
    console.error('[worker] previewPage: engine.open failed:', e);
    post({
      type: 'preview-page-error',
      requestId,
      page,
      message: e instanceof Error ? e.message : String(e),
    });
    return;
  }
  try {
    const out = await engine.renderPage(doc, page, dpi, 'png');
    post({
      type: 'preview-page-done',
      requestId,
      page,
      blob: new Blob([out.data as BlobPart], { type: 'image/png' }),
    });
  } catch (e) {
    console.error('[worker] previewPage: renderPage failed:', e);
    post({
      type: 'preview-page-error',
      requestId,
      page,
      message: e instanceof Error ? e.message : String(e),
    });
  } finally {
    engine.close(doc);
  }
}

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

async function run(
  files: ArrayBuffer[],
  meta: FileMeta[],
  perFileOptions: PerFileExportOptions[],
  format: 'png' | 'jpg',
  jpgQuality: number,
  deliveryMethod: 'zip' | 'individual' | undefined,
): Promise<void> {
  const started = Date.now();
  const zip = new ZipStream();
  const failed: PageError[] = [];
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const individual = deliveryMethod === 'individual';
  let totalPages = 0;
  let succeeded = 0;
  let lastSingle: { data: Uint8Array; name: string } | null = null;
  const individualFiles: { data: Uint8Array; name: string }[] = [];

  outer: for (let i = 0; i < files.length; i++) {
    const { fileId, name } = meta[i]!;
    const fileOpts = perFileOptions[i]!;
    const base = sanitizeBaseName(name);
    let doc;
    try {
      doc = await engine.open(files[i]!);
    } catch (e) {
      console.error('[worker] run: engine.open failed:', e);
      post({
        type: 'file-error',
        fileId,
        message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
      });
      continue;
    }
    try {
      const count = engine.pageCount(doc);
      if (count === 0) {
        post({ type: 'file-error', fileId, message: 'zero-pages' });
        continue;
      }
      const pages = fileOpts.pageRange
        ? parsePageRange(fileOpts.pageRange, count).pages
        : range(count);
      totalPages += pages.length;
      for (const [idx, page] of pages.entries()) {
        // Yield a macrotask so a pending 'cancel' message can be delivered —
        // the WASM render itself is synchronous and never yields (R4: cancel
        // must take effect within ~1s).
        await new Promise((r) => setTimeout(r, 0));
        if (cancelled) break outer;
        post({
          type: 'progress',
          data: {
            fileId,
            page: idx + 1,
            totalPages: pages.length,
            fileIndex: i + 1,
            totalFiles: files.length,
          },
        });
        try {
          const out = await engine.renderPage(
            doc,
            page,
            fileOpts.dpi,
            format,
            jpgQuality,
            fileOpts.backgroundColor ?? 'white',
          );
          const entryName = pageFileName(base, page, format);
          const zipEntryPath = meta.length > 1 ? `${base}/${entryName}` : entryName;
          if (individual) individualFiles.push({ data: out.data, name: entryName });
          else zip.add(zipEntryPath, out.data);
          lastSingle = { data: out.data, name: entryName };
          succeeded++;
        } catch (e) {
          const err: PageError = {
            fileId,
            page,
            message: e instanceof Error ? e.message : String(e),
          };
          failed.push(err);
          post({ type: 'page-error', error: err });
        }
      }
    } finally {
      engine.close(doc);
    }
  }

  // Single successful page → always a direct image download, regardless of
  // delivery mode (PRD R6). Multiple pages: either the individual files
  // list, or the existing ZIP behavior — unchanged when delivery is 'zip'.
  const singleBase = meta.length === 1 ? sanitizeBaseName(meta[0]!.name) : 'converted';
  let output: Blob | undefined;
  let outputName: string | undefined;
  let pages: { name: string; blob: Blob }[] | undefined;
  if (succeeded === 1 && lastSingle) {
    output = new Blob([lastSingle.data as BlobPart], { type: mime });
    outputName = lastSingle.name;
  } else if (individual) {
    pages = individualFiles.map((f) => ({
      name: f.name,
      blob: new Blob([f.data as BlobPart], { type: mime }),
    }));
  } else {
    output = await zip.toBlob();
    outputName = zipFileName(singleBase);
  }

  const result: ExportResult = {
    totalPages,
    succeeded,
    failed,
    durationMs: Date.now() - started,
    output,
    outputName,
    pages,
    cancelled,
  };
  post({ type: 'done', result });
}

// ADR-008: combines every successfully-opened file's pages, in array order,
// into one merged PDF. A per-file cooperative-cancel check mirrors run()'s
// per-page one; cancelling before any file merges means merge-done carries
// no output (mirrors ExportResult's existing cancelled-with-no-output shape).
async function mergeRun(files: ArrayBuffer[], meta: FileMeta[]): Promise<void> {
  const started = Date.now();
  const docs: Awaited<ReturnType<typeof engine.open>>[] = [];
  let totalPages = 0;

  for (let i = 0; i < files.length; i++) {
    // Yield a macrotask so a pending 'cancel' can be delivered between files.
    await new Promise((r) => setTimeout(r, 0));
    if (cancelled) break;

    const { fileId } = meta[i]!;
    try {
      const doc = await engine.open(files[i]!);
      const count = engine.pageCount(doc);
      if (count === 0) {
        engine.close(doc);
        post({ type: 'file-error', fileId, message: 'zero-pages' });
      } else {
        docs.push(doc);
        totalPages += count;
      }
    } catch (e) {
      console.error('[worker] merge: engine.open failed:', e);
      post({
        type: 'file-error',
        fileId,
        message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
      });
    }
    post({ type: 'merge-progress', fileIndex: i + 1, totalFiles: files.length });
  }

  let output: Blob | undefined;
  let outputName: string | undefined;
  if (!cancelled && docs.length > 0) {
    const merged = await engine.merge(docs);
    output = new Blob([merged as BlobPart], { type: 'application/pdf' });
    outputName = mergedFileName();
  }
  for (const doc of docs) engine.close(doc);

  post({
    type: 'merge-done',
    result: {
      totalPages,
      mergedFiles: docs.length,
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}

async function splitRun(
  file: ArrayBuffer,
  meta: FileMeta,
  selectedPages: number[],
  mode: 'extract' | 'burst'
): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let extractedPages = 0;
  let doc: Awaited<ReturnType<typeof engine.open>> | undefined;

  try {
    doc = await engine.open(file);
    const totalPages = engine.pageCount(doc);

    if (mode === 'extract') {
      const extracted = await engine.split(doc, selectedPages);
      output = new Blob([extracted as BlobPart], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-extracted.pdf`;
      extractedPages = selectedPages.length;
      post({ type: 'split-progress', extractedPages, totalSelected: selectedPages.length });
    } else if (mode === 'burst') {
      const zip = new ZipStream();
      const base = sanitizeBaseName(meta.name);

      for (let i = 0; i < selectedPages.length; i++) {
        await new Promise((r) => setTimeout(r, 0));
        if (cancelled) break;

        const pageNum = selectedPages[i]!;
        const extracted = await engine.split(doc, [pageNum]);
        const entryName = `${base}-page-${pageNum}.pdf`;
        zip.add(entryName, extracted);

        extractedPages++;
        post({ type: 'split-progress', extractedPages, totalSelected: selectedPages.length });
      }

      if (!cancelled) {
        output = await zip.toBlob();
        outputName = zipFileName(`${base}-burst`);
      }
    }
  } catch (e) {
    console.error('[worker] splitRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
  } finally {
    if (doc) engine.close(doc);
  }

  post({
    type: 'split-done',
    result: {
      totalPages: doc ? engine.pageCount(doc) : 0,
      extractedPages,
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}
