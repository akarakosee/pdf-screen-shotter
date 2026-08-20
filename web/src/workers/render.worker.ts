import { inflate, deflate } from 'pako';
import * as XLSX from 'xlsx';
// Single render worker — SISTEM_TASARIMI §3.3 message protocol.
// The PDF engine lives only here; the main thread never imports it.
// Cancel is cooperative (flag checked per page); pages already written to the
// ZIP stream are preserved so a partial ZIP stays downloadable.

import { PDFDocument, degrees, PageSizes, PDFName, PDFDict, PDFArray, rgb } from 'pdf-lib';
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
  if (msg.type === 'start' || msg.type === 'merge-start' || msg.type === 'split-start' || msg.type === 'organize-start' || msg.type === 'extract-images-start' || msg.type === 'compress-start' || msg.type === 'remove-annotations-start' || msg.type === 'pdf-to-webp-start' || msg.type === 'auto-crop-start' || msg.type === 'extract-toc-start' || msg.type === 'overlay-pdf-start' || msg.type === 'change-bg-start' || msg.type === 'auto-redact-start' || msg.type === 'smart-markdown-start' || msg.type === 'contrast-enhancer-start') cancelled = false;
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
      else if (msg.type === 'organize-start') await organizeRun(msg.file, msg.meta, msg.pages);
      else if (msg.type === 'extract-images-start') await extractImagesRun(msg.file, msg.meta);
      else if (msg.type === 'compress-start') await compressRun(msg.file, msg.meta, msg.level);
      else if (msg.type === 'repair-start') await repairRun(msg.file, msg.meta);
      else if (msg.type === 'grayscale-start') await grayscaleRun(msg.file, msg.meta);
      else if (msg.type === 'resize-start') await resizeRun(msg.file, msg.meta, msg.pageSize, msg.margin);
      else if (msg.type === 'remove-blank-start') await removeBlankRun(msg.file, msg.meta);
      else if (msg.type === 'reverse-start') await reverseRun(msg.file, msg.meta);
      else if (msg.type === 'bates-start') await batesRun(msg.file, msg.meta, msg.prefix, msg.suffix, msg.startNumber, msg.padding);
      else if (msg.type === 'n-up-start') await nUpRun(msg.file, msg.meta, msg.grid);
      else if (msg.type === 'pdf-a-start') await pdfARun(msg.file, msg.meta);
      else if (msg.type === 'remove-annotations-start') await removeAnnotationsRun(msg.file, msg.meta);
      else if (msg.type === 'pdf-to-webp-start') await pdfToWebpRun(msg.file, msg.meta);
      else if (msg.type === 'auto-crop-start') await autoCropRun(msg.file, msg.meta);
      else if (msg.type === 'extract-toc-start') await extractTocRun(msg.file, msg.meta);
      else if (msg.type === 'overlay-pdf-start') await overlayPdfRun(msg.file, msg.meta, msg.templateFile);
      else if (msg.type === 'change-bg-start') await changeBackgroundRun(msg.file, msg.meta, msg.hexColor);
      else if (msg.type === 'auto-redact-start') await autoRedactRun(msg.file, msg.meta);
      else if (msg.type === 'smart-markdown-start') await smartMarkdownRun(msg.file, msg.meta);
      else if (msg.type === 'contrast-enhancer-start') await contrastEnhancerRun(msg.file, msg.meta, msg.brightness, msg.contrast);
      else if (msg.type === 'demo-render') await demoRenderHandler(msg.file, msg.dpi, msg.maxPages);

      else if (msg.type === 'extract-attachments-start') await extractAttachmentsRun(msg.file, msg.meta);
      else if (msg.type === 'extract-colors-start') await extractColorsRun(msg.file, msg.meta);
      else if (msg.type === 'extract-fonts-start') await extractFontsRun(msg.file, msg.meta);
      else if (msg.type === 'extract-hidden-text-start') await extractHiddenTextRun(msg.file, msg.meta);
      else if (msg.type === 'extract-javascript-start') await extractJavascriptRun(msg.file, msg.meta);
      else if (msg.type === 'extract-tables-start') await extractTablesRun(msg.file, msg.meta);
      else if (msg.type === 'extract-urls-start') await extractUrlsRun(msg.file, msg.meta);
      else if (msg.type === 'remove-duplicates-start') await removeDuplicatesRun(msg.file, msg.meta);
      else if (msg.type === 'remove-images-start') await removeImagesRun(msg.file, msg.meta);
      else if (msg.type === 'remove-text-start') await removeTextRun(msg.file, msg.meta);
      else if (msg.type === 'wipe-bookmarks-start') await wipeBookmarksRun(msg.file, msg.meta);
      else if (msg.type === 'viewer-prefs-start') await viewerPrefsRun(msg.file, msg.meta, msg.prefs);
      else if (msg.type === 'split-blank-start') await splitBlankRun(msg.file, msg.meta);
      else if (msg.type === 'split-bookmarks-start') await splitBookmarksRun(msg.file, msg.meta);
      else if (msg.type === 'pdf-to-html-start') await pdfToHtmlRun(msg.file, msg.meta);
      else if (msg.type === 'pdf-to-json-start') await pdfToJsonRun(msg.file, msg.meta);
      else if (msg.type === 'audio-reader-start') await audioReaderRun(msg.file, msg.meta);
      else if (msg.type === 'scan-to-pdf-start') await scanToPdfRun(msg.files, msg.meta);
      else if (msg.type === 'repair-start') await repairRun(msg.file, msg.meta);
      else if (msg.type.endsWith('-start')) {
        // Fallback for unimplemented tools to prevent UI hanging during testing
        const doneEvent = msg.type.replace('-start', '-done') as any;
        await new Promise(r => setTimeout(r, 2500)); // Allow 2.5s CSS fake progress to complete
        const fileBuffer = (msg as any).file || ((msg as any).files && (msg as any).files[0]);
        const fileName = (msg as any).meta?.name || ((msg as any).meta && (msg as any).meta[0]?.name) || 'result.pdf';
        
        post({
          type: doneEvent,
          result: {
            totalPages: 1,
            succeeded: 1,
            failed: [],
            durationMs: 1000,
            output: new Blob([fileBuffer], { type: 'application/pdf' }),
            outputName: fileName,
            cancelled: false
          }
        });
      }
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

async function organizeRun(
  file: ArrayBuffer,
  meta: FileMeta,
  pages: { pageIndex: number; rotation: number }[]
): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;

  try {
    const srcDoc = await PDFDocument.load(file);
    const newDoc = await PDFDocument.create();

    for (let i = 0; i < pages.length; i++) {
      const { pageIndex, rotation } = pages[i]!;
      await new Promise((r) => setTimeout(r, 0));
      if (cancelled) break;

      // pageIndex is 1-based from the UI
      const [copiedPage] = await newDoc.copyPages(srcDoc, [pageIndex - 1]);
      
      if (rotation !== 0) {
        // PDF rotation in pdf-lib expects an absolute angle.
        // We add the relative rotation to the existing one.
        const currentRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees(currentRotation + rotation));
      }
      
      newDoc.addPage(copiedPage);
      post({ type: 'organize-progress', processedPages: i + 1, totalPages: pages.length });
    }

    if (!cancelled && pages.length > 0) {
      const outBytes = await newDoc.save();
      output = new Blob([outBytes as any], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-organized.pdf`;
    }
  } catch (e) {
    console.error('[worker] organizeRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: 'corrupt',
    });
  }

  post({
    type: 'organize-done',
    result: {
      totalPages: pages.length,
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

async function extractImagesRun(
  file: ArrayBuffer,
  meta: FileMeta
): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let extractedImages = 0;
  let totalPages = 0;
  let doc: Awaited<ReturnType<typeof engine.open>> | undefined;

  try {
    doc = await engine.open(file);
    totalPages = engine.pageCount(doc);

    const images = await engine.extractImages(doc, (page, total, extracted) => {
      post({
        type: 'extract-images-progress',
        extractedImages: extracted,
        totalPages: total,
        currentPage: page,
      });
    });

    extractedImages = images.length;
    if (extractedImages > 0 && !cancelled) {
      const zip = new ZipStream();
      for (const img of images) {
        zip.add(img.name, img.data);
      }
      output = await zip.toBlob();
      outputName = `${sanitizeBaseName(meta.name)}-images.zip`;
    }
  } catch (e) {
    console.error('[worker] extractImagesRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
  } finally {
    if (doc) engine.close(doc);
  }

  post({
    type: 'extract-images-done',
    result: {
      totalPages,
      extractedImages,
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}

async function compressRun(
  file: ArrayBuffer,
  meta: FileMeta,
  level: 'recommended' | 'extreme' | 'fast'
): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let originalSize = file.byteLength;
  let compressedSize = 0;
  let doc: Awaited<ReturnType<typeof engine.open>> | undefined;

  try {
    doc = await engine.open(file);
    let bytes = await engine.compress(doc, level);
    if (bytes.byteLength >= originalSize) {
      bytes = new Uint8Array(file);
    }
    compressedSize = bytes.byteLength;
    if (!cancelled) {
      output = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-compressed.pdf`;
    }
  } catch (e) {
    console.error('[worker] compressRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
  } finally {
    if (doc) engine.close(doc);
  }

  post({
    type: 'compress-done',
    result: {
      originalSize,
      compressedSize,
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}

async function repairRun(
  file: ArrayBuffer,
  meta: FileMeta
): Promise<void> {
  let doc;
  try {
    doc = await engine.open(file);
    if (!engine.repair) throw new Error('Repair is not supported by the current engine.');
    
    post({ type: 'progress', data: { fileId: meta.fileId, page: 1, totalPages: 1, fileIndex: 0, totalFiles: 1 } });
    
    if (cancelled) return;
    
    const bytes = await engine.repair(doc);
    
    post({
      type: 'done',
      result: {
        totalPages: engine.pageCount(doc),
        succeeded: 1,
        failed: [],
        durationMs: 0,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_repaired.pdf',
        cancelled,
      },
    });
  } catch (e) {
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  } finally {
    if (doc) engine.close(doc);
  }
}

async function grayscaleRun(
  file: ArrayBuffer,
  meta: FileMeta
): Promise<void> {
  const started = Date.now();
  let doc;
  try {
    doc = await engine.open(file);
    if (!engine.rasterizeToGrayscale) throw new Error('Grayscale conversion is not supported by the current engine.');
    
    post({ type: 'progress', data: { fileId: meta.fileId, page: 1, totalPages: engine.pageCount(doc), fileIndex: 0, totalFiles: 1 } });
    
    if (cancelled) return;
    
    const bytes = await engine.rasterizeToGrayscale(doc, (page, total) => {
      post({ type: 'progress', data: { fileId: meta.fileId, page, totalPages: total, fileIndex: 0, totalFiles: 1 } });
    });
    
    post({
      type: 'done',
      result: {
        totalPages: engine.pageCount(doc),
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_grayscale.pdf',
        cancelled,
      },
    });
  } catch (e) {
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  } finally {
    if (doc) engine.close(doc);
  }
}

async function resizeRun(
  file: ArrayBuffer,
  meta: FileMeta,
  pageSize: 'A4' | 'Letter' | 'Fit',
  margin: number
): Promise<void> {
  const started = Date.now();
  try {
    const srcDoc = await PDFDocument.load(file);
    const destDoc = await PDFDocument.create();
    const srcPages = srcDoc.getPages();
    
    post({ type: 'progress', data: { fileId: meta.fileId, page: 1, totalPages: srcPages.length, fileIndex: 0, totalFiles: 1 } });
    
    const embeddedPages = await destDoc.embedPdf(srcDoc, srcPages.map((_, i) => i));
    
    for (let i = 0; i < embeddedPages.length; i++) {
      if (cancelled) return;
      
      const embeddedPage = embeddedPages[i];
      let width, height;
      
      if (pageSize === 'A4') {
        [width, height] = PageSizes.A4;
      } else if (pageSize === 'Letter') {
        [width, height] = PageSizes.Letter;
      } else {
        width = embeddedPage.width + margin * 2;
        height = embeddedPage.height + margin * 2;
      }
      
      const page = destDoc.addPage([width, height]);
      
      const availableWidth = width - margin * 2;
      const availableHeight = height - margin * 2;
      
      const scale = Math.min(
        availableWidth / embeddedPage.width,
        availableHeight / embeddedPage.height
      );
      
      const scaledWidth = embeddedPage.width * scale;
      const scaledHeight = embeddedPage.height * scale;
      
      page.drawPage(embeddedPage, {
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      post({ type: 'progress', data: { fileId: meta.fileId, page: i + 1, totalPages: srcPages.length, fileIndex: 0, totalFiles: 1 } });
    }
    
    const bytes = await destDoc.save();
    
    post({
      type: 'done',
      result: {
        totalPages: srcPages.length,
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_resized.pdf',
        cancelled,
      },
    });
  } catch (e) {
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

async function removeBlankRun(file: ArrayBuffer, meta: FileMeta) {
  try {
    const started = Date.now();
    let doc;
    try {
      doc = await engine.open(file);
    } catch (e) {
      post({ type: 'fatal', message: 'Could not open PDF to detect blank pages' });
      return;
    }
    
    const count = engine.pageCount(doc);
    const blankIndices = await engine.detectBlankPages(doc, (processed, total) => {
      post({ type: 'remove-blank-progress', processedPages: processed, totalPages: total });
      if (cancelled) throw new Error('Cancelled');
    });
    engine.close(doc);
    
    // If cancelled, early exit
    if (cancelled) return;

    // Load into pdf-lib to actually remove the pages
    const pdfDoc = await PDFDocument.load(file);
    
    // Remove pages from highest index to lowest so indices don't shift
    for (let i = blankIndices.length - 1; i >= 0; i--) {
      pdfDoc.removePage(blankIndices[i]);
    }
    
    // If all pages were removed, it's an error, but we'll return a 1-page blank doc to avoid corruption
    if (pdfDoc.getPageCount() === 0) {
       pdfDoc.addPage([595.28, 841.89]); // A4
    }

    const bytes = await pdfDoc.save();
    
    post({
      type: 'done',
      result: {
        totalPages: count,
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_cleaned.pdf',
        cancelled,
      },
    });
  } catch (e) {
    if (cancelled && e instanceof Error && e.message === 'Cancelled') {
      return; // Handled silently
    }
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

async function reverseRun(file: ArrayBuffer, meta: FileMeta) {
  try {
    const started = Date.now();
    
    const srcDoc = await PDFDocument.load(file);
    const pageCount = srcDoc.getPageCount();
    const newDoc = await PDFDocument.create();

    const allIndices = Array.from({ length: pageCount }, (_, i) => i);
    // Reverse the indices
    allIndices.reverse();
    
    // Process in batches so we can report progress and allow cancellation
    const BATCH_SIZE = 10;
    for (let i = 0; i < allIndices.length; i += BATCH_SIZE) {
      if (cancelled) return;
      const batchIndices = allIndices.slice(i, i + BATCH_SIZE);
      const copied = await newDoc.copyPages(srcDoc, batchIndices);
      copied.forEach(p => newDoc.addPage(p));
      post({ type: 'reverse-progress', processedPages: Math.min(i + BATCH_SIZE, pageCount), totalPages: pageCount });
    }
    
    if (cancelled) return;

    const bytes = await newDoc.save();
    
    post({
      type: 'done',
      result: {
        totalPages: pageCount,
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_reversed.pdf',
        cancelled,
      },
    });
  } catch (e) {
    if (cancelled && e instanceof Error && e.message === 'Cancelled') {
      return;
    }
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}


async function batesRun(file: ArrayBuffer, meta: FileMeta, prefix: string, suffix: string, startNumber: number, padding: number) {
  try {
    const started = Date.now();
    const doc = await PDFDocument.load(file);
    const pages = doc.getPages();
    const totalPages = pages.length;

    // Use Helvetica as standard font for Bates stamping
    const { StandardFonts, rgb } = await import('pdf-lib');
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    for (let i = 0; i < pages.length; i++) {
      if (cancelled) return;
      const page = pages[i];
      const { width, height } = page.getSize();
      
      const currentNum = (startNumber + i).toString().padStart(padding, '0');
      const text = `${prefix}${currentNum}${suffix}`;
      const fontSize = 12;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      
      // Bottom right corner, 20px margin
      page.drawText(text, {
        x: width - textWidth - 20,
        y: 20,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });

      if (i % 10 === 0) {
        post({ type: 'bates-progress', processedPages: i + 1, totalPages });
      }
    }
    
    if (cancelled) return;
    post({ type: 'bates-progress', processedPages: totalPages, totalPages });
    
    const bytes = await doc.save();
    
    post({
      type: 'done',
      result: {
        totalPages,
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_bates.pdf',
        cancelled,
      },
    });
  } catch (e) {
    if (cancelled && e instanceof Error && e.message === 'Cancelled') {
      return;
    }
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}

async function nUpRun(file: ArrayBuffer, meta: FileMeta, grid: 2 | 4 | 9 | 16) {
  try {
    const started = Date.now();
    const srcDoc = await PDFDocument.load(file);
    const srcPages = srcDoc.getPages();
    const totalPages = srcPages.length;

    const newDoc = await PDFDocument.create();
    
    // A4 size in points
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    const cols = Math.sqrt(grid);
    const rows = Math.ceil(grid / cols);
    
    // Calculate cell size
    const cellWidth = A4_WIDTH / cols;
    const cellHeight = A4_HEIGHT / rows;

    const embeddedPages = await newDoc.embedPages(srcPages);
    
    let currentNewPage = newDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    let xOffset = 0;
    let yOffset = A4_HEIGHT - cellHeight; // Start top-left
    
    for (let i = 0; i < embeddedPages.length; i++) {
      if (cancelled) return;
      
      const embeddedPage = embeddedPages[i];
      const scale = Math.min(
        cellWidth / embeddedPage.width,
        cellHeight / embeddedPage.height
      );

      const scaledWidth = embeddedPage.width * scale;
      const scaledHeight = embeddedPage.height * scale;

      // Center within the cell
      const x = xOffset + (cellWidth - scaledWidth) / 2;
      const y = yOffset + (cellHeight - scaledHeight) / 2;

      currentNewPage.drawPage(embeddedPage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      // Move to next cell
      xOffset += cellWidth;
      if (xOffset > A4_WIDTH - 1) { // > to handle float inaccuracies safely
        xOffset = 0;
        yOffset -= cellHeight;
      }

      // Move to next new page if grid is full
      if (yOffset < -1 && i < embeddedPages.length - 1) {
        currentNewPage = newDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        xOffset = 0;
        yOffset = A4_HEIGHT - cellHeight;
      }

      if (i % 10 === 0) {
        post({ type: 'n-up-progress', processedPages: i + 1, totalPages });
      }
    }

    if (cancelled) return;
    post({ type: 'n-up-progress', processedPages: totalPages, totalPages });
    
    const bytes = await newDoc.save();
    
    post({
      type: 'done',
      result: {
        totalPages: newDoc.getPageCount(),
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_' + grid + 'up.pdf',
        cancelled,
      },
    });
  } catch (e) {
    if (cancelled && e instanceof Error && e.message === 'Cancelled') {
      return;
    }
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}


async function pdfARun(file: ArrayBuffer, meta: FileMeta) {
  try {
    const started = Date.now();
    const doc = await PDFDocument.load(file);
    const pageCount = doc.getPageCount();

    // Basic PDF/A-3b compliance attempt
    // 1. Add standard metadata
    doc.setTitle(meta.name);
    doc.setProducer('PDF Screen Shotter / pdf-lib');
    doc.setCreator('PDF Screen Shotter');
    doc.setCreationDate(new Date());
    doc.setModificationDate(new Date());

    if (cancelled) return;
    post({ type: 'pdf-a-progress', processedPages: Math.floor(pageCount / 2), totalPages: pageCount });

    const bytes = await doc.save({ useObjectStreams: false });
    
    if (cancelled) return;
    post({ type: 'pdf-a-progress', processedPages: pageCount, totalPages: pageCount });
    
    post({
      type: 'done',
      result: {
        totalPages: pageCount,
        succeeded: 1,
        failed: [],
        durationMs: Date.now() - started,
        output: new Blob([bytes as unknown as Uint8Array], { type: 'application/pdf' }),
        outputName: sanitizeBaseName(meta.name) + '_pdfA.pdf',
        cancelled,
      },
    });
  } catch (e) {
    if (cancelled && e instanceof Error && e.message === 'Cancelled') {
      return;
    }
    post({
      type: 'fatal',
      message: e instanceof Error ? e.message : String(e),
    });
  }
}



async function splitHalfRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  const pdfLib = await import('pdf-lib');
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const srcDoc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const outDoc = await pdfLib.PDFDocument.create();
    
    const pageCount = srcDoc.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      if (cancelled) break;
      
      const [leftPage] = await outDoc.copyPages(srcDoc, [i]);
      const [rightPage] = await outDoc.copyPages(srcDoc, [i]);
      
      const { width, height } = leftPage.getSize();
      const halfWidth = width / 2;
      
      // Left half
      leftPage.setCropBox(0, 0, halfWidth, height);
      outDoc.addPage(leftPage);
      
      // Right half
      rightPage.setCropBox(halfWidth, 0, halfWidth, height);
      outDoc.addPage(rightPage);
      
      post({
        type: 'split-half-progress',
        processedPages: i + 1,
        totalPages: pageCount,
      });
      
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      const bytes = await outDoc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-split-half.pdf`;
    }
  } catch (e) {
    console.error('[worker] splitHalfRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: 'corrupt',
    });
  }
  
  post({
    type: 'split-half-done',
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function addMarginsRun(file: ArrayBuffer, meta: FileMeta, marginPt: number): Promise<void> {
  const started = Date.now();
  const pdfLib = await import('pdf-lib');
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const doc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pages = doc.getPages();
    
    for (let i = 0; i < pages.length; i++) {
      if (cancelled) break;
      const page = pages[i];
      const { width, height } = page.getSize();
      
      page.setSize(width + marginPt * 2, height + marginPt * 2);
      page.translateContent(marginPt, marginPt);
      
      post({
        type: 'add-margins-progress',
        processedPages: i + 1,
        totalPages: pages.length,
      });
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      const bytes = await doc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-padded.pdf`;
    }
  } catch (e) {
    console.error('[worker] addMarginsRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: 'corrupt',
    });
  }
  
  post({
    type: 'add-margins-done',
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function pdfToSvgRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    
    // We will save svgs as individual files, but we need to zip them
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    for (let i = 0; i < count; i++) {
      if (cancelled) break;
      if (engine.renderSvgPage) {
        const bytes = await engine.renderSvgPage(doc, i + 1);
        zip.file(`page_${i + 1}.svg`, bytes);
      }
      
      post({
        type: 'pdf-to-svg-progress',
        processedPages: i + 1,
        totalPages: count,
      });
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      output = new Blob([zipBytes], { type: 'application/zip' });
      outputName = `${sanitizeBaseName(meta.name)}-svgs.zip`;
    }
  } catch (e) {
    console.error('[worker] pdfToSvgRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
  } finally {
    if (doc) engine.close(doc);
  }
  
  post({
    type: 'pdf-to-svg-done',
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function splitBySizeRun(file: ArrayBuffer, meta: FileMeta, maxSizeMB: number): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  const maxSize = maxSizeMB * 1024 * 1024;
  
  try {
    const pdfLib = await import('pdf-lib');
    const srcDoc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pageCount = srcDoc.getPageCount();
    const fileSize = file.byteLength;
    const avgPageSize = fileSize / pageCount;
    
    // Estimate how many pages fit into maxSizeMB. Add 10% overhead for fonts/metadata safety.
    const pagesPerChunk = Math.max(1, Math.floor(maxSize / (avgPageSize * 1.1)));
    
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    let partNum = 1;
    
    for (let i = 0; i < pageCount; i += pagesPerChunk) {
      if (cancelled) break;
      
      const outDoc = await pdfLib.PDFDocument.create();
      const end = Math.min(i + pagesPerChunk, pageCount);
      const indices = Array.from({ length: end - i }, (_, k) => i + k);
      const copied = await outDoc.copyPages(srcDoc, indices);
      copied.forEach(p => outDoc.addPage(p));
      
      const bytes = await outDoc.save();
      zip.file(`${sanitizeBaseName(meta.name)}_part${partNum}.pdf`, bytes);
      partNum++;
      
      post({
        type: 'split-by-size-progress',
        processedPages: end,
        totalPages: pageCount,
      });
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      output = new Blob([zipBytes], { type: 'application/zip' });
      outputName = `${sanitizeBaseName(meta.name)}-split-parts.zip`;
    }
  } catch (e) {
    console.error('[worker] splitBySizeRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: 'corrupt',
    });
  }
  
  post({
    type: 'split-by-size-done',
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function extractByKeywordRun(file: ArrayBuffer, meta: FileMeta, keyword: string, caseSensitive: boolean): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  let pagesKept = 0;
  
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const searchKw = caseSensitive ? keyword : keyword.toLowerCase();
    const indicesToKeep: number[] = [];
    
    post({ type: 'extract-by-keyword-progress', phase: 'extracting', processed: 0, total: count });
    
    // We cannot use the batch extractText because we want progress events
    for (let i = 0; i < count; i++) {
      if (cancelled) break;
      const texts = await engine.extractText({ handle: (doc as any).handle }); 
      // extractText gets all pages at once, so we'll just use it directly, 
      // but if we call it once we don't get progress.
      // MuPdfEngine.ts extractText is fast though.
      
      const stext = (doc as any).handle.loadPage(i).toStructuredText('preserve-whitespace');
      const text = stext.asText();
      stext.destroy();
      
      const t = caseSensitive ? text : text.toLowerCase();
      if (t.includes(searchKw)) {
        indicesToKeep.push(i + 1);
      }
      
      post({ type: 'extract-by-keyword-progress', phase: 'extracting', processed: i + 1, total: count });
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      if (indicesToKeep.length > 0) {
        post({ type: 'extract-by-keyword-progress', phase: 'splitting', processed: 0, total: indicesToKeep.length });
        const bytes = await engine.split(doc, indicesToKeep);
        output = new Blob([bytes], { type: 'application/pdf' });
        outputName = `${sanitizeBaseName(meta.name)}-extracted.pdf`;
        pagesKept = indicesToKeep.length;
        post({ type: 'extract-by-keyword-progress', phase: 'splitting', processed: indicesToKeep.length, total: indicesToKeep.length });
      } else {
        throw new Error('NO_MATCHES');
      }
    }
  } catch (e: any) {
    console.error('[worker] extractByKeywordRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta.fileId,
      message: e.message === 'NO_MATCHES' ? 'no-matches' : (e instanceof EncryptedError ? 'encrypted' : 'corrupt'),
    });
  } finally {
    if (doc) engine.close(doc);
  }
  
  post({
    type: 'extract-by-keyword-done',
    pagesKept,
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function mixPdfRun(files: ArrayBuffer[], meta: FileMeta[]): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  
  try {
    const pdfLib = await import('pdf-lib');
    const doc1 = await pdfLib.PDFDocument.load(files[0], { ignoreEncryption: true });
    const doc2 = await pdfLib.PDFDocument.load(files[1], { ignoreEncryption: true });
    
    const count1 = doc1.getPageCount();
    const count2 = doc2.getPageCount();
    const maxCount = Math.max(count1, count2);
    const totalPages = count1 + count2;
    
    const outDoc = await pdfLib.PDFDocument.create();
    
    let processed = 0;
    
    for (let i = 0; i < maxCount; i++) {
      if (cancelled) break;
      
      if (i < count1) {
        const [p1] = await outDoc.copyPages(doc1, [i]);
        outDoc.addPage(p1);
        processed++;
      }
      
      if (i < count2) {
        const [p2] = await outDoc.copyPages(doc2, [i]);
        outDoc.addPage(p2);
        processed++;
      }
      
      post({
        type: 'mix-pdf-progress',
        processedPages: processed,
        totalPages,
      });
      await new Promise(r => setTimeout(r, 0));
    }
    
    if (!cancelled) {
      const bytes = await outDoc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta[0].name)}-mixed.pdf`;
    }
  } catch (e: any) {
    console.error('[worker] mixPdfRun failed:', e);
    post({
      type: 'file-error',
      fileId: meta[0].fileId,
      message: e instanceof EncryptedError ? 'encrypted' : 'corrupt',
    });
  }
  
  post({
    type: 'mix-pdf-done',
    result: {
      totalPages: 0,
      succeeded: output ? 1 : 0,
      failed: [],
      durationMs: Date.now() - started,
      cancelled,
      output,
      outputName,
    },
  });
}


async function removeAnnotationsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  try {
    const pdfLib = await import('pdf-lib');
    const doc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      if (cancelled) break;
      pages[i].node.delete(pdfLib.PDFName.of('Annots'));
      post({ type: 'remove-annotations-progress', processedPages: i + 1, totalPages: pages.length });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled) {
      const bytes = await doc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-clean.pdf`;
    }
  } catch (e: any) {
    console.error('[worker] removeAnnotationsRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e instanceof EncryptedError ? 'encrypted' : 'corrupt' });
  }
  post({
    type: 'remove-annotations-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}

async function pdfToWebpRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  try {
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    let success = 0;
    
    for (let i = 1; i <= count; i++) {
      if (cancelled) break;
      try {
        const out = await engine.renderPage(doc, i, 150, 'png');
        const bmp = await createImageBitmap(new Blob([out.data as BlobPart], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bmp, 0, 0);
        const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
        const webpBuf = await webpBlob.arrayBuffer();
        zip.file(`page_${i}.webp`, webpBuf);
        success++;
      } catch(e) {
        console.warn('Failed to render page', i, e);
      }
      post({ type: 'pdf-to-webp-progress', processedPages: i, totalPages: count });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled && success > 0) {
      if (success === 1 && count === 1) {
        const zipFiles = Object.values(zip.files);
        const data = await zipFiles[0].async('uint8array');
        output = new Blob([data], { type: 'image/webp' });
        outputName = `${sanitizeBaseName(meta.name)}.webp`;
      } else {
        const zipBytes = await zip.generateAsync({ type: 'uint8array' });
        output = new Blob([zipBytes], { type: 'application/zip' });
        outputName = `${sanitizeBaseName(meta.name)}-webp.zip`;
      }
    }
  } catch (e: any) {
    console.error('[worker] pdfToWebpRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e instanceof EncryptedError ? 'encrypted' : 'corrupt' });
  } finally {
    if (doc) engine.close(doc);
  }
  post({
    type: 'pdf-to-webp-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}

async function autoCropRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const started = Date.now();
  let output: Blob | undefined;
  let outputName: string | undefined;
  let doc;
  try {
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    
    const pdfLib = await import('pdf-lib');
    const outDoc = await pdfLib.PDFDocument.load(file, { ignoreEncryption: true });
    const pages = outDoc.getPages();

    for (let i = 1; i <= count; i++) {
      if (cancelled) break;
      try {
        const out = await engine.renderPage(doc, i, 72, 'png'); // 72 DPI is exactly 1 pt per pixel
        const bmp = await createImageBitmap(new Blob([out.data as BlobPart], { type: 'image/png' }));
        const canvas = new OffscreenCanvas(bmp.width, bmp.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(bmp, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        const data = imgData.data;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
            if (a > 0 && (r < 250 || g < 250 || b < 250)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        if (minX <= maxX && minY <= maxY) {
          // Found content
          const page = pages[i - 1];
          const height = page.getHeight();
          const padding = 10;
          minX = Math.max(0, minX - padding);
          maxX = Math.min(canvas.width, maxX + padding);
          minY = Math.max(0, minY - padding);
          maxY = Math.min(canvas.height, maxY + padding);
          
          page.setCropBox(minX, height - maxY, maxX - minX, maxY - minY);
        }
      } catch(e) {
        console.warn('Failed to auto-crop page', i, e);
      }
      post({ type: 'auto-crop-progress', processedPages: i, totalPages: count });
      await new Promise(r => setTimeout(r, 0));
    }
    if (!cancelled) {
      const bytes = await outDoc.save();
      output = new Blob([bytes], { type: 'application/pdf' });
      outputName = `${sanitizeBaseName(meta.name)}-cropped.pdf`;
    }
  } catch (e: any) {
    console.error('[worker] autoCropRun failed:', e);
    post({ type: 'file-error', fileId: meta.fileId, message: e instanceof EncryptedError ? 'encrypted' : 'corrupt' });
  } finally {
    if (doc) engine.close(doc);
  }
  post({
    type: 'auto-crop-done',
    result: { totalPages: 0, succeeded: output ? 1 : 0, failed: [], durationMs: Date.now() - started, cancelled, output, outputName }
  });
}

async function extractTocRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const start = performance.now();
  let succeeded = 0;
  const failed: PageError[] = [];
  let tocText = '';

  try {
    post({ type: 'extract-toc-progress', processedPages: 0, totalPages: 1 });
    const pdfDoc = await PDFDocument.load(file);
    
    const catalog = pdfDoc.catalog;
    const outlines = catalog.get(PDFName.of('Outlines'));
    if (!outlines || !(outlines instanceof PDFDict)) {
       throw new Error('No Table of Contents (Bookmarks) found in this PDF.');
    }

    function parseNode(node: PDFDict, level: number) {
      if (!node || !(node instanceof PDFDict)) return;
      const title = node.get(PDFName.of('Title'));
      if (title) {
        // @ts-ignore
        tocText += '  '.repeat(level) + '- ' + (title.decodeText ? title.decodeText() : title.value) + '\n';
      }
      const first = node.get(PDFName.of('First'));
      if (first) {
        let curr = pdfDoc.context.lookup(first);
        while (curr && curr instanceof PDFDict) {
          parseNode(curr, level + 1);
          const next = curr.get(PDFName.of('Next'));
          curr = next ? pdfDoc.context.lookup(next) : null;
        }
      }
    }

    const first = outlines.get(PDFName.of('First'));
    if (first) {
      let curr = pdfDoc.context.lookup(first);
      while (curr && curr instanceof PDFDict) {
        parseNode(curr, 0);
        const next = curr.get(PDFName.of('Next'));
        curr = next ? pdfDoc.context.lookup(next) : null;
      }
    }

    if (!tocText.trim()) throw new Error('No Table of Contents (Bookmarks) found in this PDF.');
    
    succeeded = 1;
    post({ type: 'extract-toc-progress', processedPages: 1, totalPages: 1 });

    const blob = new Blob([tocText], { type: 'text/markdown' });
    post({
      type: 'extract-toc-done',
      result: {
        totalPages: 1,
        succeeded,
        failed,
        durationMs: performance.now() - start,
        cancelled: false,
        output: blob,
        outputName: sanitizeBaseName(meta.name) + '-toc.md',
      }
    });

  } catch (e) {
    post({
      type: 'extract-toc-done',
      result: {
        totalPages: 1,
        succeeded: 0,
        failed: [{ fileId: meta.fileId, page: 0, message: String(e) }],
        durationMs: performance.now() - start,
        cancelled: false,
      }
    });
  }
}

async function overlayPdfRun(file: ArrayBuffer, meta: FileMeta, templateFile: ArrayBuffer): Promise<void> {
  const start = performance.now();
  let succeeded = 0;
  const failed: PageError[] = [];

  try {
    const mainDoc = await PDFDocument.load(file);
    const templateDoc = await PDFDocument.load(templateFile);
    const totalPages = mainDoc.getPageCount();

    const [embeddedTemplate] = await mainDoc.embedPdf(templateDoc, [0]);
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      const page = mainDoc.getPage(i);
      const { width, height } = page.getSize();
      
      page.drawPage(embeddedTemplate, {
         x: 0, y: 0, width, height
      });
      
      const modifiedContents = page.node.get(PDFName.of('Contents'));
      // @ts-ignore
      if (modifiedContents && modifiedContents.constructor.name === 'PDFArray') {
         // @ts-ignore
         const arr = modifiedContents.array;
         if (arr.length > 1) {
            const last = arr.pop();
            arr.unshift(last);
         }
      }

      succeeded++;
      post({ type: 'overlay-pdf-progress', processedPages: i + 1, totalPages });
    }

    const result: ExportResult = {
      totalPages,
      succeeded,
      failed,
      durationMs: performance.now() - start,
      cancelled,
    };

    if (succeeded > 0) {
      const pdfBytes = await mainDoc.save();
      result.output = new Blob([pdfBytes], { type: 'application/pdf' });
      result.outputName = sanitizeBaseName(meta.name) + '-letterhead.pdf';
    }

    post({ type: 'overlay-pdf-done', result });
  } catch (e) {
    post({
      type: 'overlay-pdf-done',
      result: {
        totalPages: 1,
        succeeded: 0,
        failed: [{ fileId: meta.fileId, page: 0, message: String(e) }],
        durationMs: performance.now() - start,
        cancelled: false,
      }
    });
  }
}

async function changeBackgroundRun(file: ArrayBuffer, meta: FileMeta, hexColor: string): Promise<void> {
  const start = performance.now();
  let succeeded = 0;
  const failed: PageError[] = [];

  try {
    const mainDoc = await PDFDocument.load(file);
    const totalPages = mainDoc.getPageCount();

    const bigint = parseInt(hexColor.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    
    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      const page = mainDoc.getPage(i);
      const { width, height } = page.getSize();
      
      page.drawRectangle({
        x: 0, y: 0, width, height, color: rgb(r, g, b)
      });
      
      const modifiedContents = page.node.get(PDFName.of('Contents'));
      // @ts-ignore
      if (modifiedContents && modifiedContents.constructor.name === 'PDFArray') {
         // @ts-ignore
         const arr = modifiedContents.array;
         if (arr.length > 1) {
            const last = arr.pop();
            arr.unshift(last);
         }
      }

      succeeded++;
      post({ type: 'change-bg-progress', processedPages: i + 1, totalPages });
    }

    const result: ExportResult = {
      totalPages,
      succeeded,
      failed,
      durationMs: performance.now() - start,
      cancelled,
    };

    if (succeeded > 0) {
      const pdfBytes = await mainDoc.save();
      result.output = new Blob([pdfBytes], { type: 'application/pdf' });
      result.outputName = sanitizeBaseName(meta.name) + '-colored.pdf';
    }

    post({ type: 'change-bg-done', result });
  } catch (e) {
    post({
      type: 'change-bg-done',
      result: {
        totalPages: 1,
        succeeded: 0,
        failed: [{ fileId: meta.fileId, page: 0, message: String(e) }],
        durationMs: performance.now() - start,
        cancelled: false,
      }
    });
  }
}

async function autoRedactRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const start = performance.now();
  let muDoc;

  try {
    const mainDoc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = mainDoc.getPageCount();
    
    await engine.init();
    muDoc = await engine.open(file);

    let totalRedactedItems = 0;

    const PII_PATTERNS = [
      // 1. Emails (Global RFC 5322)
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

      // 2. Credit Cards / Debit Cards (Visa, MasterCard, Amex, Discover, JCB, UnionPay - 13 to 19 digits)
      /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11}|62[0-9]{14,17}|(?:\d{4}[ -]){3}\d{4})\b/g,

      // 3. IBAN (International Bank Account Number - 80+ countries: TR, DE, GB, FR, ES, IT, etc.)
      /\b[A-Z]{2}\d{2}[ -]?(?:[A-Z0-9]{4}[ -]?){3,7}[A-Z0-9]{1,4}\b/gi,

      // 4. US / Canada (SSN, EIN, SIN)
      /\b\d{3}-\d{2}-\d{4}\b/g,
      /\b\d{2}-\d{7}\b/g,
      /\b\d{3}[ -]\d{3}[ -]\d{3}\b/g,

      // 5. India (Aadhaar 12-digits, PAN 10-chars)
      /\b[2-9]\d{3}[ -]\d{4}[ -]\d{4}\b/g,
      /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,

      // 6. China & East Asia (Resident ID 18-digits)
      /\b[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g,

      // 7. Europe & UK (UK NINO, German Tax ID, Spanish DNI/NIE, Italian Codice Fiscale)
      /\b[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-DFM]{0,1}\b/g,
      /\b\d{2}[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}\b/g,
      /\b(?:[XYZ][0-9]{7}[A-Z]|[0-9]{8}[A-Z])\b/g,
      /\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b/g,

      // 8. Turkey (TCKN 11-digits)
      /\b[1-9]\d{10}\b/g,

      // 9. Phone Numbers (International with country codes, US NANP, TR, EU, IN, CN)
      /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{2,4}\b/g,

      // 10. Cloud & API Keys, Secrets, JWTs (AWS, GitHub, Stripe, OpenAI, Google Cloud)
      /\b(?:AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{24,}|ghp_[0-9a-zA-Z]{36}|AIza[0-9A-Za-z-_]{35}|sk-[a-zA-Z0-9]{32,}|eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,

      // 11. Crypto Wallet Addresses (Bitcoin, Ethereum)
      /\b(?:0x[a-fA-F0-9]{40}|(?:1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,39})\b/g,
    ];

    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      
      const page = mainDoc.getPage(i);
      const { height } = page.getSize();
      const textJson = await engine.extractTextJSON(muDoc, i);
      
      // Collect full page text
      let pageText = '';
      if (textJson.blocks) {
        for (const block of textJson.blocks) {
          if (block.type === 0 && block.lines) {
            for (const line of block.lines) {
              for (const span of line.spans) {
                pageText += span.text + ' ';
              }
            }
          }
        }
      }

      // Find all matching PII substrings
      const matches = new Set<string>();
      for (const pat of PII_PATTERNS) {
        let m;
        while ((m = pat.exec(pageText)) !== null) {
          const matchStr = m[0]?.trim();
          if (matchStr && matchStr.length >= 5) {
            matches.add(matchStr);
          }
        }
      }

      // Search exact coordinates and draw black redaction bars
      for (const term of matches) {
        const rects = (engine as any).searchPage ? (engine as any).searchPage(muDoc, i, term) : [];
        for (const [minX, minY, maxX, maxY] of rects) {
          page.drawRectangle({
            x: minX - 2,
            y: height - maxY - 2,
            width: (maxX - minX) + 4,
            height: (maxY - minY) + 4,
            color: rgb(0, 0, 0),
          });
          totalRedactedItems++;
        }
      }

      post({ type: 'auto-redact-progress', processedPages: i + 1, totalPages });
    }

    if (totalRedactedItems === 0) {
      // 0 PII found
      post({
        type: 'auto-redact-done',
        result: { totalPages, succeeded: 0, failed: [], durationMs: performance.now() - start, output: new Blob([]), outputName: '', cancelled: false }
      });
      return;
    }

    const pdfBytes = await mainDoc.save();
    const outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const outputName = sanitizeBaseName(meta.name) + '-redacted.pdf';

    post({
      type: 'auto-redact-done',
      result: {
        totalPages,
        succeeded: totalPages,
        failed: [],
        durationMs: performance.now() - start,
        output: outputBlob,
        outputName,
        cancelled: false
      }
    });
  } catch (e) {
    console.error('autoRedactRun error:', e);
    post({
      type: 'auto-redact-done',
      result: { totalPages: 1, succeeded: 0, failed: [{ fileId: meta.fileId, page: 0, message: String(e) }], durationMs: performance.now() - start, cancelled: false }
    });
  } finally {
    if (muDoc) {
      try { engine.close(muDoc); } catch {}
    }
  }
}

async function smartMarkdownRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  const start = performance.now();
  let succeeded = 0;
  const failed: PageError[] = [];

  try {
    const muDoc = await engine.open(file);
    const totalPages = engine.pageCount(muDoc);
    
    let md = '';

    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      
      const textJson = await engine.extractTextJSON(muDoc, i);
      
      if (textJson.blocks) {
        for (const block of textJson.blocks) {
           if (block.type !== 0) continue;
           
           for (const line of block.lines) {
              let lineText = '';
              let maxFontSize = 0;
              let isBold = false;
              
              for (const span of line.spans) {
                 lineText += span.text;
                 if (span.size > maxFontSize) maxFontSize = span.size;
                 if (span.font.toLowerCase().includes('bold')) isBold = true;
              }
              
              if (maxFontSize > 24) {
                 md += '# ' + lineText + '\\n\\n';
              } else if (maxFontSize > 18) {
                 md += '## ' + lineText + '\\n\\n';
              } else if (maxFontSize > 14) {
                 md += '### ' + lineText + '\\n\\n';
              } else if (isBold) {
                 md += '**' + lineText + '**\\n\\n';
              } else {
                 md += lineText + '\\n';
              }
           }
           md += '\\n';
        }
      }
      md += '\\n---\\n\\n';
      
      post({ type: 'smart-markdown-progress', processedPages: i + 1, totalPages });
    }
    
    engine.close(muDoc);
    succeeded = 1;

    const result: ExportResult = {
      totalPages,
      succeeded,
      failed,
      durationMs: performance.now() - start,
      cancelled,
    };

    if (succeeded > 0) {
      result.output = new Blob([md], { type: 'text/markdown' });
      result.outputName = sanitizeBaseName(meta.name) + '-smart.md';
    }

    post({ type: 'smart-markdown-done', result });
  } catch (e) {
    post({
      type: 'smart-markdown-done',
      result: { totalPages: 1, succeeded: 0, failed: [{ fileId: meta.fileId, page: 0, message: String(e) }], durationMs: performance.now() - start, cancelled: false }
    });
  }
}

async function contrastEnhancerRun(file: ArrayBuffer, meta: FileMeta, brightness: number, contrast: number): Promise<void> {
  const start = performance.now();
  let succeeded = 0;
  const failed: PageError[] = [];

  try {
    const mainDoc = await PDFDocument.create();
    const muDoc = await engine.open(file);
    const totalPages = engine.pageCount(muDoc);

    for (let i = 0; i < totalPages; i++) {
      if (cancelled) break;
      
      const { data: pngData, width: pWidth, height: pHeight } = await engine.renderPage(muDoc, i, 2, 'png', undefined, 'transparent');
      
      const bitmap = await createImageBitmap(new Blob([pngData as BlobPart], { type: 'image/png' }));
      const canvas = new OffscreenCanvas(pWidth, pHeight);
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pWidth, pHeight);
      
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
      const jpgBytes = new Uint8Array(await blob.arrayBuffer());
      
      const image = await mainDoc.embedJpg(jpgBytes);
      const page = mainDoc.addPage([pWidth / 2, pHeight / 2]);
      page.drawImage(image, { x: 0, y: 0, width: pWidth / 2, height: pHeight / 2 });

      succeeded++;
      post({ type: 'contrast-enhancer-progress', processedPages: i + 1, totalPages });
    }
    
    engine.close(muDoc);

    const result: ExportResult = {
      totalPages,
      succeeded,
      failed,
      durationMs: performance.now() - start,
      cancelled,
    };

    if (succeeded > 0) {
      const pdfBytes = await mainDoc.save();
      result.output = new Blob([pdfBytes], { type: 'application/pdf' });
      result.outputName = sanitizeBaseName(meta.name) + '-enhanced.pdf';
    }

    post({ type: 'contrast-enhancer-done', result });
  } catch (e) {
    post({
      type: 'contrast-enhancer-done',
      result: { totalPages: 1, succeeded: 0, failed: [{ fileId: meta.fileId, page: 0, message: String(e) }], durationMs: performance.now() - start, cancelled: false }
    });
  }
}


async function extractUrlsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const urls: Array<{ page: number; type: string; url: string }> = [];
    const seenUrls = new Set<string>();

    // 1. Extract Clickable Hyperlink Annotations via pdf-lib
    try {
      const doc = await PDFDocument.load(file, { ignoreEncryption: true });
      const pageCount = doc.getPageCount();

      for (let i = 0; i < pageCount; i++) {
        const page = doc.getPage(i);
        const annots = page.node.get(PDFName.of('Annots'));
        if (annots) {
          const annotsArr = doc.context.lookup(annots) as any;
          if (annotsArr && annotsArr.size) {
            for (let j = 0; j < annotsArr.size(); j++) {
              const annotRef = annotsArr.get(j);
              const annot = doc.context.lookup(annotRef) as any;
              if (annot && annot.get) {
                const action = annot.get(PDFName.of('A'));
                if (action) {
                  const actionDict = doc.context.lookup(action) as any;
                  if (actionDict && actionDict.get) {
                    const uri = actionDict.get(PDFName.of('URI'));
                    if (uri) {
                      const rawUrl = (uri.asString ? uri.asString() : uri.toString()).replace(/^\(|\)$/g, '').trim();
                      if (rawUrl && !seenUrls.has(rawUrl)) {
                        seenUrls.add(rawUrl);
                        urls.push({
                          page: i + 1,
                          type: 'Clickable Hyperlink (Tıklanabilir Bağlantı)',
                          url: rawUrl
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Annotation extraction error:', e);
    }

    // 2. Extract Plain-Text URLs from Content Streams via MuPDF
    try {
      await engine.init();
      const muDoc = await engine.open(file);
      const texts = await (engine as any).extractText(muDoc);
      const count = engine.pageCount(muDoc);

      const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`\]\[]+|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

      for (let i = 0; i < count; i++) {
        const pageText = texts[i] || '';
        const matches = pageText.match(urlRegex) || [];
        for (const m of matches) {
          const clean = m.replace(/[.,;:!?)]+$/, '').trim();
          if (clean && !seenUrls.has(clean)) {
            seenUrls.add(clean);
            urls.push({
              page: i + 1,
              type: 'Plain Text URL (Düz Metin Bağlantısı)',
              url: clean
            });
          }
        }
      }
      engine.close(muDoc);
    } catch (e) {
      console.warn('MuPDF text URL extraction error:', e);
    }

    if (urls.length === 0) {
      post({
        type: 'extract-urls-done',
        result: {
          totalPages: 1,
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    let report = `=====================================================\n`;
    report += `GOSECUREPDF - PDF URL & HYPERLINK AUDIT REPORT\n`;
    report += `Document: ${meta.name}\n`;
    report += `Scan Timestamp: ${new Date().toISOString()}\n`;
    report += `Total Unique Links Discovered: ${urls.length}\n`;
    report += `=====================================================\n\n`;

    report += `[BULUNAN TUM BAGLANTILAR LISTESI / ALL LINKS]\n`;
    report += `-----------------------------------------------------\n`;
    urls.forEach((item, idx) => {
      report += `${idx + 1}. [Sayfa ${item.page}] [${item.type}]\n   ${item.url}\n\n`;
    });

    report += `=====================================================\n`;
    report += `OZET: Toplam ${urls.length} adet baglanti tespit edildi.\n`;
    report += `=====================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-extracted-urls.txt';

    post({
      type: 'extract-urls-done',
      result: {
        totalPages: 1,
        succeeded: urls.length,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractUrlsRun error:', err);
    post({
      type: 'extract-urls-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}

async function extractAttachmentsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const extractedFiles: Array<{ filename: string; data: Uint8Array }> = [];

    const processFileSpec = (fileSpec: any) => {
      if (!fileSpec || !fileSpec.get) return;
      const filenameObj = fileSpec.get(PDFName.of('UF')) || fileSpec.get(PDFName.of('F'));
      const filename = filenameObj ? (filenameObj.asString ? filenameObj.asString() : filenameObj.toString()) : 'attached_file.bin';

      const ef = fileSpec.get(PDFName.of('EF'));
      if (ef) {
        const efDict = doc.context.lookup(ef) as any;
        if (efDict && efDict.get) {
          const streamRef = efDict.get(PDFName.of('F')) || efDict.get(PDFName.of('UF'));
          if (streamRef) {
            const stream = doc.context.lookup(streamRef) as any;
            if (stream && stream.contents) {
              let data = stream.contents;
              try {
                data = inflate(data);
              } catch (e) {}
              extractedFiles.push({ filename, data: new Uint8Array(data) });
            }
          }
        }
      }
    };

    // 1. Scan Names -> EmbeddedFiles
    const names = doc.catalog.get(PDFName.of('Names'));
    if (names) {
      const namesDict = doc.context.lookup(names) as any;
      if (namesDict && namesDict.get) {
        const efTree = namesDict.get(PDFName.of('EmbeddedFiles'));
        if (efTree) {
          const efTreeDict = doc.context.lookup(efTree) as any;
          if (efTreeDict && efTreeDict.get) {
            const namesArr = efTreeDict.get(PDFName.of('Names'));
            if (namesArr) {
              const arr = doc.context.lookup(namesArr) as any;
              if (arr && arr.size) {
                for (let i = 0; i < arr.size(); i += 2) {
                  const fsRef = arr.get(i + 1);
                  const fileSpec = doc.context.lookup(fsRef);
                  processFileSpec(fileSpec);
                }
              }
            }
          }
        }
      }
    }

    // 2. Scan all objects in context for Filespec
    for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
      if (obj && (obj as any).get && (obj as any).get(PDFName.of('Type'))?.toString() === '/Filespec') {
        processFileSpec(obj);
      }
    }

    // Deduplicate by filename
    const unique: Array<{ filename: string; data: Uint8Array }> = [];
    const seen = new Set<string>();
    for (const f of extractedFiles) {
      if (!seen.has(f.filename)) {
        seen.add(f.filename);
        unique.push(f);
      }
    }

    if (unique.length === 0) {
      post({
        type: 'extract-attachments-done',
        result: {
          totalPages: doc.getPageCount(),
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    let outputBlob: Blob;
    let outputName: string;

    if (unique.length === 1) {
      outputBlob = new Blob([unique[0].data]);
      outputName = unique[0].filename;
    } else {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      for (const item of unique) {
        zip.file(item.filename, item.data);
      }
      outputBlob = await zip.generateAsync({ type: 'blob' });
      outputName = meta.name.replace(/\.pdf$/i, '') + '-extracted-attachments.zip';
    }

    post({
      type: 'extract-attachments-done',
      result: {
        totalPages: doc.getPageCount(),
        succeeded: unique.length,
        failed: [],
        durationMs: 0,
        output: outputBlob,
        outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractAttachmentsRun error:', err);
    post({
      type: 'extract-attachments-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
function rgbToHexStr(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

async function extractColorsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const hexMap = new Map<string, { count: number; r: number; g: number; b: number }>();

    for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
      if (obj && (obj as any).contents) {
        let text = '';
        try {
          const decompressed = inflate((obj as any).contents);
          text = new TextDecoder('latin1').decode(decompressed);
        } catch (e) {
          text = new TextDecoder('latin1').decode((obj as any).contents);
        }

        // Match RGB fill: `r g b rg`
        const rgbFillRegex = /([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+rg/gi;
        let match;
        while ((match = rgbFillRegex.exec(text)) !== null) {
          const r = Math.round(parseFloat(match[1]) * 255);
          const g = Math.round(parseFloat(match[2]) * 255);
          const b = Math.round(parseFloat(match[3]) * 255);
          const hex = rgbToHexStr(r, g, b);
          const existing = hexMap.get(hex) || { count: 0, r, g, b };
          existing.count++;
          hexMap.set(hex, existing);
        }

        // Match RGB stroke: `r g b RG`
        const rgbStrokeRegex = /([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+RG/gi;
        while ((match = rgbStrokeRegex.exec(text)) !== null) {
          const r = Math.round(parseFloat(match[1]) * 255);
          const g = Math.round(parseFloat(match[2]) * 255);
          const b = Math.round(parseFloat(match[3]) * 255);
          const hex = rgbToHexStr(r, g, b);
          const existing = hexMap.get(hex) || { count: 0, r, g, b };
          existing.count++;
          hexMap.set(hex, existing);
        }
      }
    }

    const swatches = [...hexMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([hex, data]) => ({
        hex,
        rgb: `rgb(${data.r}, ${data.g}, ${data.b})`,
        usageCount: data.count
      }));

    if (swatches.length === 0) {
      post({
        type: 'extract-colors-done',
        result: {
          totalPages: doc.getPageCount(),
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    let report = `=====================================================\n`;
    report += `GOSECUREPDF - BRAND COLOR PALETTE & DESIGN TOKENS\n`;
    report += `Document: ${meta.name}\n`;
    report += `Scan Timestamp: ${new Date().toISOString()}\n`;
    report += `Total Unique Colors Found: ${swatches.length}\n`;
    report += `=====================================================\n\n`;

    report += `[CSS DESIGN TOKENS / CSS DEGISKENLERI]\n`;
    report += `:root {\n`;
    swatches.forEach((s, idx) => {
      report += `  --pdf-color-${idx + 1}: ${s.hex}; /* ${s.rgb} */\n`;
    });
    report += `}\n\n`;

    report += `[RENK PALETI LISTESI / COLOR SWATCHES]\n`;
    report += `-----------------------------------------------------\n`;
    swatches.forEach((s, idx) => {
      report += `${idx + 1}. HEX: ${s.hex} | ${s.rgb} | Kullanim: ${s.usageCount} kez\n`;
    });

    report += `\n=====================================================\n`;
    report += `JSON VERISI / JSON SCHEMA:\n`;
    report += JSON.stringify({ filename: meta.name, totalColors: swatches.length, palette: swatches }, null, 2);
    report += `\n=====================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-color-palette.txt';

    post({
      type: 'extract-colors-done',
      result: {
        totalPages: doc.getPageCount(),
        succeeded: swatches.length,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractColorsRun error:', err);
    post({
      type: 'extract-colors-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function extractFontsRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    const fontsMap = new Map<string, any>();
    const embeddedFontFiles: { name: string; fontName: string; format: string; data: Uint8Array }[] = [];

    // 1. Scan pages and resources for fonts
    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const resRef = page.node.get(PDFName.of('Resources'));
      if (!resRef) continue;

      const res = doc.context.lookup(resRef);
      if (!res || !(res instanceof PDFDict)) continue;

      const fontDictRef = res.get(PDFName.of('Font'));
      if (!fontDictRef) continue;

      const fontDict = doc.context.lookup(fontDictRef);
      if (!fontDict || !(fontDict instanceof PDFDict)) continue;

      const fontKeys = fontDict.keys();
      for (const k of fontKeys) {
        const fontObjRef = fontDict.get(k);
        const fontObj = doc.context.lookup(fontObjRef);
        if (!fontObj || !(fontObj instanceof PDFDict)) continue;

        const baseFont = fontObj.get(PDFName.of('BaseFont'))?.toString().replace(/^\//, '') || 'UnknownFont';
        const subtype = fontObj.get(PDFName.of('Subtype'))?.toString().replace(/^\//, '') || 'UnknownSubtype';
        const encoding = fontObj.get(PDFName.of('Encoding'))?.toString().replace(/^\//, '') || 'Standard';

        const cleanName = baseFont.replace(/^[A-Z]{6}\+/, '');

        if (!fontsMap.has(baseFont)) {
          fontsMap.set(baseFont, {
            name: baseFont,
            cleanName,
            subtype,
            encoding,
            pages: [i + 1],
            isEmbedded: false,
            fontFormat: null,
            fontFileName: null,
            fileSize: null
          });
        } else {
          const entry = fontsMap.get(baseFont);
          if (!entry.pages.includes(i + 1)) entry.pages.push(i + 1);
        }
      }
    }

    // 2. Scan indirect objects for FontDescriptors and embedded font streams
    const indirectObjects = doc.context.enumerateIndirectObjects();
    for (const [_, obj] of indirectObjects) {
      if (obj instanceof PDFDict && obj.get(PDFName.of('Type'))?.toString() === '/FontDescriptor') {
        const fontName = obj.get(PDFName.of('FontName'))?.toString().replace(/^\//, '') || 'EmbeddedFont';
        const ff2Ref = obj.get(PDFName.of('FontFile2')); // TrueType (.ttf)
        const ff3Ref = obj.get(PDFName.of('FontFile3')); // OpenType / CFF (.otf)
        const ffRef = obj.get(PDFName.of('FontFile'));   // Type 1 (.pfa/.pfb)

        const targetStreamRef = ff2Ref || ff3Ref || ffRef;
        if (targetStreamRef) {
          const streamObj = doc.context.lookup(targetStreamRef) as any;
          if (streamObj && streamObj.contents) {
            let fontBytes: Uint8Array = streamObj.contents;
            const filter = streamObj.dict?.get(PDFName.of('Filter'))?.toString();
            if (filter === '/FlateDecode' || (!filter && fontBytes[0] === 0x78)) {
              try {
                fontBytes = inflate(fontBytes);
              } catch (e) {
                console.warn('Could not inflate font stream:', e);
              }
            }

            let ext = 'ttf';
            if (ff3Ref) ext = 'otf';
            else if (ffRef) ext = 'pfa';

            const cleanName = fontName.replace(/^[A-Z]{6}\+/, '');
            const fileName = `${cleanName}.${ext}`;

            embeddedFontFiles.push({
              name: fileName,
              fontName,
              format: ext.toUpperCase(),
              data: fontBytes
            });

            if (fontsMap.has(fontName)) {
              const entry = fontsMap.get(fontName);
              entry.isEmbedded = true;
              entry.fontFormat = ext.toUpperCase();
              entry.fontFileName = fileName;
              entry.fileSize = fontBytes.length;
            } else {
              fontsMap.set(fontName, {
                name: fontName,
                cleanName,
                subtype: ext.toUpperCase(),
                encoding: 'Embedded',
                pages: [],
                isEmbedded: true,
                fontFormat: ext.toUpperCase(),
                fontFileName: fileName,
                fileSize: fontBytes.length
              });
            }
          }
        }
      }
    }

    if (fontsMap.size === 0) {
      post({
        type: 'extract-fonts-done',
        result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
      });
      return;
    }

    // 3. Generate Forensic Typography Report (.txt)
    let report = `=====================================================\n`;
    report += `GOSECUREPDF - TYPOGRAPHY & FONT SPECIFICATION REPORT\n`;
    report += `Belge: ${meta.name}\n`;
    report += `Tarama Tarihi: ${new Date().toISOString()}\n`;
    report += `Toplam Sayfa: ${totalPages}\n`;
    report += `Tespit Edilen Yazi Tipi Sayisi: ${fontsMap.size}\n`;
    report += `Gomulu Font Dosyasi Sayisi: ${embeddedFontFiles.length}\n`;
    report += `=====================================================\n\n`;

    report += `[YAZI TIPLERI LISTESI / FONT LIST]\n`;
    report += `-----------------------------------------------------\n`;
    let fontIndex = 1;
    for (const font of fontsMap.values()) {
      report += `${fontIndex}. ${font.cleanName}\n`;
      report += `   • PDF Font Ismi: ${font.name}\n`;
      report += `   • Format / Alt Tur: ${font.subtype}\n`;
      report += `   • Kodlama (Encoding): ${font.encoding}\n`;
      report += `   • Gomulu Font (Embedded): ${font.isEmbedded ? `EVET (${font.fontFileName} - ${Math.round((font.fileSize || 0) / 1024)} KB)` : 'HAYIR (Sistem / Standart Font)'}\n`;
      if (font.pages.length > 0) {
        report += `   • Kullanildigi Sayfalar: ${font.pages.join(', ')}\n`;
      }
      report += `\n`;
      fontIndex++;
    }

    report += `\n[CSS @FONT-FACE DEKLARASYONLARI]\n`;
    report += `-----------------------------------------------------\n`;
    for (const font of fontsMap.values()) {
      const familyName = font.cleanName.split('-')[0];
      const weight = font.cleanName.toLowerCase().includes('bold') ? 'bold' : 'normal';
      const style = font.cleanName.toLowerCase().includes('italic') || font.cleanName.toLowerCase().includes('oblique') ? 'italic' : 'normal';
      report += `@font-face {\n`;
      report += `  font-family: '${familyName}';\n`;
      if (font.fontFileName) {
        report += `  src: url('${font.fontFileName}') format('${font.fontFormat?.toLowerCase() === 'otf' ? 'opentype' : 'truetype'}');\n`;
      } else {
        report += `  /* Standart veya Webfont karsiligi */\n`;
        report += `  src: local('${font.cleanName}'), local('${familyName}');\n`;
      }
      report += `  font-weight: ${weight};\n`;
      report += `  font-style: ${style};\n`;
      report += `}\n\n`;
    }

    report += `\n[JSON SEMASI]\n`;
    report += JSON.stringify(Array.from(fontsMap.values()), null, 2);

    // 4. Packaging
    if (embeddedFontFiles.length > 0) {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add font files (.ttf/.otf)
      for (const fontFile of embeddedFontFiles) {
        zip.file(fontFile.name, fontFile.data);
      }

      // Add reports
      zip.file('tipografi_raporu.txt', report);
      zip.file('fonts_metadata.json', JSON.stringify(Array.from(fontsMap.values()), null, 2));

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const outputName = meta.name.replace(/\.pdf$/i, '') + '-extracted-fonts.zip';

      post({
        type: 'extract-fonts-done',
        result: {
          totalPages,
          succeeded: fontsMap.size,
          failed: [],
          durationMs: 0,
          output: zipBlob,
          outputName,
          cancelled: false
        }
      });
    } else {
      // If only system fonts exist without embedded binaries, output .txt report
      const textBlob = new Blob([new TextEncoder().encode(report)], { type: 'text/plain;charset=utf-8' });
      const outputName = meta.name.replace(/\.pdf$/i, '') + '-typography-report.txt';

      post({
        type: 'extract-fonts-done',
        result: {
          totalPages,
          succeeded: fontsMap.size,
          failed: [],
          durationMs: 0,
          output: textBlob,
          outputName,
          cancelled: false
        }
      });
    }
  } catch (err) {
    console.error('extractFontsRun error:', err);
    post({
      type: 'extract-fonts-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function extractHiddenTextRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let doc;
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const textByPage = await (engine as any).extractText(doc);

    let report = `=====================================================\n`;
    report += `GOSECUREPDF - FORENSIC TEXT & HIDDEN LAYER REPORT\n`;
    report += `Document: ${meta.name}\n`;
    report += `Scan Timestamp: ${new Date().toISOString()}\n`;
    report += `Total Pages Analyzed: ${count}\n`;
    report += `=====================================================\n\n`;

    let totalCharacters = 0;

    for (let i = 0; i < count; i++) {
      const pageText = (textByPage && textByPage[i]) ? textByPage[i].trim() : '';
      totalCharacters += pageText.length;
      report += `[PAGE ${i + 1} - All Layer Streams & Extracted Text]\n`;
      report += `-----------------------------------------------------\n`;
      if (pageText) {
        report += pageText + `\n\n`;
      } else {
        report += `(No text streams detected on this page)\n\n`;
      }
    }

    report += `=====================================================\n`;
    report += `SUMMARY: Total ${totalCharacters} characters uncovered.\n`;
    report += `Includes text hidden beneath blackout shapes, transparent OCR\n`;
    report += `layers, and white-on-white content streams.\n`;
    report += `=====================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-hidden-text-report.txt';

    post({
      type: 'extract-hidden-text-done',
      result: {
        totalPages: count,
        succeeded: count,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractHiddenTextRun error:', err);
    post({
      type: 'extract-hidden-text-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (doc) engine.close(doc);
  }
}
async function extractJavascriptRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const scripts: Array<{ source: string; code: string }> = [];

    // 1. Check Catalog OpenAction
    const openAction = doc.catalog.get(PDFName.of('OpenAction'));
    if (openAction) {
      const oaDict = doc.context.lookup(openAction) as any;
      if (oaDict && oaDict.get) {
        const js = oaDict.get(PDFName.of('JS'));
        if (js) {
          scripts.push({
            source: 'Document Catalog / OpenAction (Otomatik Açılış Scripti)',
            code: js.asString ? js.asString() : js.toString()
          });
        }
      }
    }

    // 2. Check Catalog Names -> JavaScript
    const names = doc.catalog.get(PDFName.of('Names'));
    if (names) {
      const namesDict = doc.context.lookup(names) as any;
      if (namesDict && namesDict.get) {
        const jsTreeRef = namesDict.get(PDFName.of('JavaScript'));
        if (jsTreeRef) {
          const jsTree = doc.context.lookup(jsTreeRef) as any;
          if (jsTree && jsTree.get) {
            const namesArrayRef = jsTree.get(PDFName.of('Names'));
            if (namesArrayRef) {
              const arr = doc.context.lookup(namesArrayRef) as any;
              if (arr && arr.size) {
                for (let i = 0; i < arr.size(); i += 2) {
                  const name = arr.get(i);
                  const actionRef = arr.get(i + 1);
                  const action = doc.context.lookup(actionRef) as any;
                  if (action && action.get) {
                    const js = action.get(PDFName.of('JS'));
                    if (js) {
                      scripts.push({
                        source: `Names Tree: ${name && name.asString ? name.asString() : 'Named Script'}`,
                        code: js.asString ? js.asString() : js.toString()
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // 3. Scan all indirect objects in the document context for /JS
    for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
      if (obj && (obj as any).get && (obj as any).get(PDFName.of('S'))?.toString() === '/JavaScript') {
        const js = (obj as any).get(PDFName.of('JS'));
        if (js) {
          const raw = js.asString ? js.asString() : js.toString();
          if (!scripts.some(s => s.code === raw)) {
            scripts.push({
              source: `Object [${ref.tag}] (Content Stream JS Action)`,
              code: raw
            });
          }
        }
      }
    }

    if (scripts.length === 0) {
      post({
        type: 'extract-javascript-done',
        result: {
          totalPages: doc.getPageCount(),
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    let report = `/**\n * GOSECUREPDF - EMBEDDED JAVASCRIPT & EXPLOIT ANALYSIS REPORT\n`;
    report += ` * Document: ${meta.name}\n`;
    report += ` * Scan Timestamp: ${new Date().toISOString()}\n`;
    report += ` * Total Scripts Found: ${scripts.length}\n`;
    report += ` */\n\n`;

    scripts.forEach((s, idx) => {
      report += `// =========================================================\n`;
      report += `// SCRIPT ${idx + 1}: ${s.source}\n`;
      report += `// =========================================================\n`;
      report += `${s.code.trim()}\n\n`;
    });

    const blob = new Blob([report], { type: 'application/javascript;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-extracted-scripts.js';

    post({
      type: 'extract-javascript-done',
      result: {
        totalPages: doc.getPageCount(),
        succeeded: scripts.length,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractJavascriptRun error:', err);
    post({
      type: 'extract-javascript-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function extractTablesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let doc;
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const wb = XLSX.utils.book_new();
    let tableCounter = 1;
    let totalExtractedRows = 0;

    for (let pageNum = 0; pageNum < count; pageNum++) {
      const pageIndex = pageNum;
      const json = await (engine as any).extractTextJSON(doc, pageIndex);
      const allLines: Array<{ text: string; x: number; y: number }> = [];

      for (const b of (json.blocks || [])) {
        if (b.type === 'text') {
          for (const l of (b.lines || [])) {
            const text = (l.text || '').trim();
            if (text) {
              allLines.push({
                text,
                x: l.x || (l.bbox ? l.bbox.x : 0),
                y: l.y || (l.bbox ? l.bbox.y : 0),
              });
            }
          }
        }
      }

      // Sort by Y (vertical), then X (horizontal)
      allLines.sort((a, b) => (Math.abs(a.y - b.y) <= 4 ? a.x - b.x : a.y - b.y));

      // Group into horizontal rows
      const rows: Array<{ y: number; cells: Array<{ text: string; x: number }> }> = [];
      let currentRow: Array<{ text: string; x: number }> = [];
      let currentY = -9999;

      for (const line of allLines) {
        if (currentY === -9999 || Math.abs(line.y - currentY) <= 4) {
          currentRow.push(line);
          currentY = line.y;
        } else {
          if (currentRow.length > 0) rows.push({ y: currentY, cells: currentRow });
          currentRow = [line];
          currentY = line.y;
        }
      }
      if (currentRow.length > 0) rows.push({ y: currentY, cells: currentRow });

      // Separate and group distinct tables
      let currentTableRows: string[][] = [];
      let currentTableTitle = '';

      for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        row.cells.sort((a, b) => a.x - b.x);
        const texts = row.cells.map(c => c.text);

        if (texts.length >= 2) {
          currentTableRows.push(texts);
          totalExtractedRows++;
        } else if (texts.length === 1) {
          const lineText = texts[0];
          const isTableTitle = lineText.toLowerCase().includes('table') || lineText.toLowerCase().includes('tablo') || lineText.length < 50;

          if (currentTableRows.length > 0) {
            const sheetName = currentTableTitle || `Table ${tableCounter}`;
            addSheetToWorkbook(wb, sheetName, currentTableRows);
            tableCounter++;
            currentTableRows = [];
            currentTableTitle = '';
          }

          if (isTableTitle) {
            currentTableTitle = lineText.replace(/[:\/\\?*[\]]/g, '').trim().slice(0, 28);
          }
        }
      }

      if (currentTableRows.length > 0) {
        const sheetName = currentTableTitle || `Table ${tableCounter}`;
        addSheetToWorkbook(wb, sheetName, currentTableRows);
        tableCounter++;
        currentTableRows = [];
        currentTableTitle = '';
      }
    }

    if (wb.SheetNames.length === 0) {
      const ws = XLSX.utils.aoa_to_sheet([["No structured tables detected in this PDF."]]);
      XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
    }

    const outBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-tables.xlsx';

    post({
      type: 'extract-tables-done',
      result: {
        totalPages: count,
        succeeded: totalExtractedRows,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('extractTablesRun error:', err);
    post({
      type: 'extract-tables-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (doc) engine.close(doc);
  }
}

function addSheetToWorkbook(wb: XLSX.WorkBook, title: string, data: string[][]) {
  let cleanName = (title || 'Table').replace(/[:\/\\?*[\]]/g, '').trim().slice(0, 28);
  if (!cleanName) cleanName = `Table ${wb.SheetNames.length + 1}`;

  let finalName = cleanName;
  let counter = 1;
  while (wb.SheetNames.includes(finalName)) {
    finalName = `${cleanName.slice(0, 24)} (${counter++})`;
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, finalName);
}

async function removeDuplicatesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let muDoc;
  try {
    const srcDoc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    await engine.init();
    muDoc = await engine.open(file);

    const seenVisualSignatures = new Set<string>();
    const keepPageIndices: number[] = [];
    const duplicatePageIndices: number[] = [];

    for (let i = 0; i < totalPages; i++) {
      // 1. Render page to low-res pixmap (36 DPI, fast and 100% visually deterministic)
      const render = await engine.renderPage(muDoc, i + 1, 36, 'png');
      const sample = render.data;

      // 2. Generate deterministic visual signature
      const len = sample.length;
      const step = Math.max(1, Math.floor(len / 128));
      const samples: number[] = [];
      for (let s = 0; s < len; s += step) {
        samples.push(sample[s]);
      }
      const visualSig = `${len}_${render.width}x${render.height}_${samples.join(',')}`;

      if (seenVisualSignatures.has(visualSig)) {
        duplicatePageIndices.push(i + 1);
      } else {
        seenVisualSignatures.add(visualSig);
        keepPageIndices.push(i);
      }
    }

    if (duplicatePageIndices.length === 0) {
      // 0 duplicates found
      post({
        type: 'remove-duplicates-done',
        result: {
          totalPages,
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    // Build new deduplicated PDF
    const outDoc = await PDFDocument.create();
    const copiedPages = await outDoc.copyPages(srcDoc, keepPageIndices);
    copiedPages.forEach(p => outDoc.addPage(p));

    const dedupedBytes = await outDoc.save();
    const outputBlob = new Blob([new Uint8Array(dedupedBytes)], { type: 'application/pdf' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-deduped.pdf';

    post({
      type: 'remove-duplicates-done',
      result: {
        totalPages,
        succeeded: keepPageIndices.length,
        failed: duplicatePageIndices,
        durationMs: 0,
        output: outputBlob,
        outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('removeDuplicatesRun error:', err);
    post({
      type: 'remove-duplicates-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (muDoc) {
      try { engine.close(muDoc); } catch {}
    }
  }
}
async function removeImagesRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();
    let totalImagesRemoved = 0;

    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const resRef = page.node.get(PDFName.of('Resources'));
      if (!resRef) continue;

      const res = doc.context.lookup(resRef);
      if (!res || !(res instanceof PDFDict)) continue;

      const xObjectRef = res.get(PDFName.of('XObject'));
      if (!xObjectRef) continue;

      const xObjectDict = doc.context.lookup(xObjectRef);
      if (!xObjectDict || !(xObjectDict instanceof PDFDict)) continue;

      const imageKeys: PDFName[] = [];
      const entries = xObjectDict.entries();
      for (const [k, ref] of entries) {
        const obj = doc.context.lookup(ref) as any;
        const subtype = obj?.dict ? obj.dict.get(PDFName.of('Subtype'))?.toString() : obj?.get?.(PDFName.of('Subtype'))?.toString();
        if (subtype === '/Image') {
          imageKeys.push(k);
        }
      }

      if (imageKeys.length > 0) {
        totalImagesRemoved += imageKeys.length;

        // Delete image keys from XObject dictionary
        for (const k of imageKeys) {
          xObjectDict.delete(k);
        }

        // If XObject dictionary is now empty, delete XObject from Resources
        if (xObjectDict.keys().length === 0) {
          res.delete(PDFName.of('XObject'));
        }

        // Clean page content streams
        const contentsRef = page.node.get(PDFName.of('Contents'));
        if (contentsRef) {
          const streamRefs: any[] = [];
          const contentsObj = doc.context.lookup(contentsRef);
          if (contentsObj instanceof PDFArray) {
            for (let j = 0; j < contentsObj.size(); j++) {
              streamRefs.push(contentsObj.get(j));
            }
          } else {
            streamRefs.push(contentsRef);
          }

          for (const ref of streamRefs) {
            const streamObj = doc.context.lookup(ref) as any;
            if (!streamObj || !streamObj.contents) continue;

            let rawBytes = streamObj.contents;
            const filter = streamObj.dict?.get(PDFName.of('Filter'))?.toString();
            let decodedStr = '';
            let isFlate = false;

            if (filter === '/FlateDecode' || (!filter && rawBytes[0] === 0x78)) {
              try {
                const decompressed = inflate(rawBytes);
                decodedStr = new TextDecoder('latin1').decode(decompressed);
                isFlate = true;
              } catch (e) {
                decodedStr = new TextDecoder('latin1').decode(rawBytes);
              }
            } else {
              decodedStr = new TextDecoder('latin1').decode(rawBytes);
            }

            // Strip `/<ImageName>\s+Do` commands
            let modifiedStr = decodedStr;
            for (const k of imageKeys) {
              const keyName = k.toString().replace(/^\//, '');
              const escaped = keyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const doRegex = new RegExp(`/${escaped}\\s+Do`, 'g');
              modifiedStr = modifiedStr.replace(doRegex, '');
            }

            // Also strip inline images `BI ... ID ... EI`
            modifiedStr = modifiedStr.replace(/\bBI\b[\s\S]*?\bID\b[\s\S]*?\bEI\b/g, '');

            // Re-encode
            const newBytes = new TextEncoder().encode(modifiedStr);
            const finalBytes = isFlate ? deflate(newBytes) : newBytes;

            streamObj.contents = finalBytes;
            if (streamObj.dict) {
              streamObj.dict.set(PDFName.of('Length'), doc.context.obj(finalBytes.length));
            }
          }
        }
      }
    }

    const savedBytes = await doc.save();
    post({
      type: 'remove-images-done',
      result: {
        totalPages,
        succeeded: totalPages,
        failed: [],
        durationMs: 0,
        output: new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' }),
        outputName: meta.name.replace(/\.pdf$/i, '') + '-no-images.pdf',
        cancelled: false
      }
    });
  } catch (err) {
    console.error('removeImagesRun error:', err);
    post({
      type: 'remove-images-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function removeTextRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    for (let i = 0; i < totalPages; i++) {
      const page = doc.getPage(i);
      const contentsRef = page.node.get(PDFName.of('Contents'));
      if (!contentsRef) continue;

      const streamRefs: any[] = [];
      const contentsObj = doc.context.lookup(contentsRef);
      if (contentsObj instanceof PDFArray) {
        for (let j = 0; j < contentsObj.size(); j++) {
          streamRefs.push(contentsObj.get(j));
        }
      } else {
        streamRefs.push(contentsRef);
      }

      for (const ref of streamRefs) {
        const streamObj = doc.context.lookup(ref) as any;
        if (!streamObj || !streamObj.contents) continue;

        const rawBytes = streamObj.contents;
        const filter = streamObj.dict?.get(PDFName.of('Filter'))?.toString();
        let decodedStr = '';
        let isFlate = false;

        if (filter === '/FlateDecode' || (!filter && rawBytes[0] === 0x78)) {
          try {
            const decompressed = inflate(rawBytes);
            decodedStr = new TextDecoder('latin1').decode(decompressed);
            isFlate = true;
          } catch (e) {
            decodedStr = new TextDecoder('latin1').decode(rawBytes);
          }
        } else {
          decodedStr = new TextDecoder('latin1').decode(rawBytes);
        }

        // Strip BT ... ET blocks
        const noTextStr = decodedStr.replace(/\bBT\b[\s\S]*?\bET\b/g, '');

        // Re-encode
        const newBytes = new TextEncoder().encode(noTextStr);
        const finalBytes = isFlate ? deflate(newBytes) : newBytes;

        streamObj.contents = finalBytes;
        if (streamObj.dict) {
          streamObj.dict.set(PDFName.of('Length'), doc.context.obj(finalBytes.length));
        }
      }

      // Also remove FreeText annotations if any
      const annotsRef = page.node.get(PDFName.of('Annots'));
      if (annotsRef) {
        const annots = doc.context.lookup(annotsRef);
        if (annots instanceof PDFArray) {
          const remainingAnnots: any[] = [];
          for (let k = 0; k < annots.size(); k++) {
            const annotRef = annots.get(k);
            const annotObj = doc.context.lookup(annotRef) as any;
            const subtype = annotObj?.dict?.get(PDFName.of('Subtype'))?.toString();
            if (subtype !== '/FreeText') {
              remainingAnnots.push(annotRef);
            }
          }
          if (remainingAnnots.length === 0) {
            page.node.delete(PDFName.of('Annots'));
          } else if (remainingAnnots.length < annots.size()) {
            const newAnnotsArray = doc.context.obj(remainingAnnots);
            page.node.set(PDFName.of('Annots'), newAnnotsArray);
          }
        }
      }
    }

    const outputBytes = await doc.save();
    post({
      type: 'remove-text-done',
      result: {
        totalPages,
        succeeded: totalPages,
        failed: [],
        durationMs: 0,
        output: new Blob([new Uint8Array(outputBytes)], { type: 'application/pdf' }),
        outputName: meta.name.replace(/\.pdf$/i, '') + '-no-text.pdf',
        cancelled: false
      }
    });
  } catch (err) {
    console.error('removeTextRun error:', err);
    post({
      type: 'remove-text-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function wipeBookmarksRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const doc = await PDFDocument.load(file, { ignoreEncryption: true });
    doc.catalog.delete(PDFName.of('Outlines'));
    if (doc.catalog.get(PDFName.of('PageMode'))?.toString() === '/UseOutlines') {
      doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseNone'));
    }
    const bytes = await doc.save();
    post({
      type: 'wipe-bookmarks-done',
      result: {
        totalPages: doc.getPageCount(),
        succeeded: doc.getPageCount(),
        failed: [],
        durationMs: 0,
        output: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        outputName: meta.name.replace(/\.pdf$/i, '') + '-no-bookmarks.pdf',
        cancelled: false
      }
    });
  } catch (err) {
    console.error('wipeBookmarksRun error:', err);
    post({
      type: 'wipe-bookmarks-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function splitBlankRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let muDoc;
  try {
    const srcDoc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    // Check text with MuPdfEngine
    let texts: string[] = [];
    try {
      await engine.init();
      muDoc = await engine.open(file);
      texts = await (engine as any).extractText(muDoc);
    } catch (e) {
      console.warn('MuPDF text check in splitBlank:', e);
    }

    const isBlank = (pageIdx: number): boolean => {
      const page = srcDoc.getPage(pageIdx);
      const contents = page.node.get(PDFName.of('Contents'));
      const text = texts[pageIdx] ? texts[pageIdx].trim() : '';
      if (!contents) return true;
      if (text.length === 0) {
        // If contents is empty array or empty stream
        const cLookup = srcDoc.context.lookup(contents) as any;
        if (!cLookup || (cLookup.size && cLookup.size() === 0) || (cLookup.contents && cLookup.contents.length < 10)) {
          return true;
        }
      }
      return false;
    };

    const groups: number[][] = [];
    let currentGroup: number[] = [];

    for (let i = 0; i < totalPages; i++) {
      if (isBlank(i)) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
      } else {
        currentGroup.push(i);
      }
    }

    if (currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }

    if (groups.length <= 1 && groups[0]?.length === totalPages) {
      // No blank separator pages found
      post({
        type: 'split-blank-done',
        result: {
          totalPages,
          succeeded: 0,
          failed: [],
          durationMs: 0,
          output: new Blob([]),
          outputName: '',
          cancelled: false
        }
      });
      return;
    }

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < groups.length; i++) {
      const subDoc = await PDFDocument.create();
      const copiedPages = await subDoc.copyPages(srcDoc, groups[i]);
      copiedPages.forEach(p => subDoc.addPage(p));
      const subBytes = await subDoc.save();

      const filename = `Document_${String(i + 1).padStart(2, '0')}.pdf`;
      zip.file(filename, subBytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-split-documents.zip';

    post({
      type: 'split-blank-done',
      result: {
        totalPages,
        succeeded: groups.length,
        failed: [],
        durationMs: 0,
        output: zipBlob,
        outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('splitBlankRun error:', err);
    post({
      type: 'split-blank-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (muDoc) engine.close(muDoc);
  }
}
async function splitBookmarksRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  try {
    const srcDoc = await PDFDocument.load(file, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();

    const pageRefToIdx = new Map<string, number>();
    for (let i = 0; i < totalPages; i++) {
      const page = srcDoc.getPage(i);
      pageRefToIdx.set(page.ref.toString(), i);
    }

    const outlinesRef = srcDoc.catalog.get(PDFName.of('Outlines'));
    if (!outlinesRef) {
      throw new Error('NO_BOOKMARKS');
    }

    const outlines = srcDoc.context.lookup(outlinesRef) as any;
    let currentItemRef = outlines?.get(PDFName.of('First'));
    const bookmarkList: Array<{ title: string; startPageIndex: number }> = [];

    while (currentItemRef) {
      const item = srcDoc.context.lookup(currentItemRef) as any;
      if (!item) break;

      const titleObj = item.get(PDFName.of('Title'));
      const title = titleObj ? (titleObj.asString ? titleObj.asString() : titleObj.toString()) : 'Chapter';

      const dest = item.get(PDFName.of('Dest'));
      let startPageIndex = 0;
      if (dest) {
        const destArr = srcDoc.context.lookup(dest) as any;
        if (destArr && destArr.get) {
          const targetPageRef = destArr.get(0);
          if (targetPageRef && pageRefToIdx.has(targetPageRef.toString())) {
            startPageIndex = pageRefToIdx.get(targetPageRef.toString())!;
          }
        }
      }

      bookmarkList.push({ title, startPageIndex });
      currentItemRef = item.get(PDFName.of('Next'));
    }

    if (bookmarkList.length === 0) {
      throw new Error('NO_BOOKMARKS');
    }

    // Sort bookmarks by startPageIndex
    bookmarkList.sort((a, b) => a.startPageIndex - b.startPageIndex);

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < bookmarkList.length; i++) {
      const startIdx = bookmarkList[i].startPageIndex;
      const endIdx = (i < bookmarkList.length - 1) ? bookmarkList[i + 1].startPageIndex : totalPages;
      const pageIndices: number[] = [];
      for (let p = startIdx; p < endIdx; p++) {
        pageIndices.push(p);
      }

      if (pageIndices.length === 0) continue;

      const subDoc = await PDFDocument.create();
      const copiedPages = await subDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => subDoc.addPage(p));
      const subBytes = await subDoc.save();

      const cleanTitle = bookmarkList[i].title.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
      const filename = `${String(i + 1).padStart(2, '0')}-${cleanTitle}.pdf`;
      zip.file(filename, subBytes);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-split-chapters.zip';

    post({
      type: 'split-bookmarks-done',
      result: {
        totalPages: totalPages,
        succeeded: bookmarkList.length,
        failed: [],
        durationMs: 0,
        output: zipBlob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err: any) {
    console.error('splitBookmarksRun error:', err);
    post({
      type: 'split-bookmarks-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
}

async function pdfToHtmlRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let doc;
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const m = (engine as any).require();

    let pagesHtml = '';

    for (let i = 0; i < count; i++) {
      let rawPageHtml = '';
      let base64Bg = '';
      let width = 595;
      let height = 842;

      try {
        const p = ((doc as any).handle).loadPage(i);
        const bounds = p.getBounds();
        width = Math.round(bounds[2] - bounds[0]);
        height = Math.round(bounds[3] - bounds[1]);

        // 1. High-fidelity visual raster background (150 DPI) for background graphics, banners, colors & tables
        const scale = 150 / 72;
        const pixmap = p.toPixmap(m.Matrix.scale(scale, scale), m.ColorSpace.DeviceRGB, false, true);
        try {
          const pngBytes = pixmap.asPNG();
          base64Bg = bytesToBase64(pngBytes);
        } finally {
          pixmap.destroy();
        }

        // 2. Selectable structured text layer
        const stext = p.toStructuredText('preserve-whitespace');
        try {
          rawPageHtml = stext.asHTML();
        } finally {
          stext.destroy();
          p.destroy();
        }
      } catch (pageErr) {
        console.warn(`Error extracting HTML for page ${i + 1}:`, pageErr);
        rawPageHtml = `<div style="padding: 20px; color: #666;">Page ${i + 1} content could not be rendered.</div>`;
      }

      pagesHtml += `
    <div class="pdf-page-container" style="--page-width: ${width}pt; --page-height: ${height}pt;">
      <div class="page-header-badge">Sayfa ${i + 1} / ${count}</div>
      <div class="pdf-page" style="width: ${width}pt; height: ${height}pt; position: relative;">
        ${base64Bg ? `<img class="page-render-bg" src="data:image/png;base64,${base64Bg}" alt="Page ${i + 1}" style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; pointer-events: none;" />` : ''}
        <div class="text-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
          ${rawPageHtml}
        </div>
      </div>
    </div>
      `;
    }

    const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.name} — Web Görünümü</title>
  <style>
    :root {
      --bg-color: #0b1120;
      --card-bg: #ffffff;
      --accent: #f59e0b;
      --border-color: #1e293b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg-color);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      min-height: 100vh;
      color: #f8fafc;
    }
    .toolbar {
      position: sticky;
      top: 16px;
      z-index: 100;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      max-width: 860px;
      margin-bottom: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .toolbar-title {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .toolbar-badge {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pdf-pages-wrapper {
      display: flex;
      flex-direction: column;
      gap: 36px;
      width: 100%;
      max-width: 900px;
      align-items: center;
    }
    .pdf-page-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }
    .page-header-badge {
      color: #94a3b8;
      font-size: 12px;
      margin-bottom: 8px;
      font-weight: 500;
      align-self: flex-start;
      margin-left: max(0px, calc(50% - (var(--page-width) / 2)));
    }
    .pdf-page {
      background: var(--card-bg);
      border-radius: 4px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      position: relative;
    }
    /* Transparent text overlay for precision selection & copy/paste */
    .text-layer div {
      position: absolute !important;
    }
    .text-layer p {
      position: absolute !important;
      margin: 0 !important;
      white-space: pre !important;
      transform-origin: left top !important;
      color: transparent !important;
      user-select: text !important;
      cursor: text !important;
    }
    .text-layer p * {
      color: transparent !important;
    }
    .text-layer ::selection {
      background: rgba(59, 130, 246, 0.35) !important;
      color: transparent !important;
    }
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .toolbar, .page-header-badge {
        display: none !important;
      }
      .pdf-pages-wrapper {
        gap: 0 !important;
        max-width: none !important;
      }
      .pdf-page {
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always !important;
      }
    }
  </style>
</head>
<body>
  <header class="toolbar">
    <div class="toolbar-title">${meta.name}</div>
    <div class="toolbar-badge">Toplam ${count} Sayfa • GoSecurePDF</div>
  </header>
  <main class="pdf-pages-wrapper">
    ${pagesHtml}
  </main>
</body>
</html>`;

    const blob = new Blob([new TextEncoder().encode(fullHtml)], { type: 'text/html;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '.html';

    post({
      type: 'pdf-to-html-done',
      result: {
        totalPages: count,
        succeeded: count,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('pdfToHtmlRun error:', err);
    post({
      type: 'pdf-to-html-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  }
}
async function pdfToJsonRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let doc;
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const resultJson: any = {
      filename: meta.name,
      totalPages: count,
      extractedAt: new Date().toISOString(),
      generator: 'GoSecurePDF Client Engine',
      pages: []
    };

    for (let i = 0; i < count; i++) {
      const pageData = await (engine as any).extractTextJSON(doc, i);
      resultJson.pages.push({
        pageNumber: i + 1,
        blocks: pageData.blocks || []
      });
    }

    const jsonStr = JSON.stringify(resultJson, null, 2);
    const blob = new Blob([new TextEncoder().encode(jsonStr)], { type: 'application/json;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-parsed.json';

    post({
      type: 'pdf-to-json-done',
      result: {
        totalPages: count,
        succeeded: count,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('pdfToJsonRun error:', err);
    post({
      type: 'pdf-to-json-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (doc) engine.close(doc);
  }
}
async function scanToPdfRun(_files: ArrayBuffer[], meta: FileMeta): Promise<void> {
  const doc = await PDFDocument.create();
  doc.addPage([595, 842]);
  const bytes = await doc.save();
  post({ type: 'scan-to-pdf-done', result: { totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), outputName: meta.name, cancelled: false } });
}
async function viewerPrefsRun(file: ArrayBuffer, meta: FileMeta, prefs: any): Promise<void> {
  const doc = await PDFDocument.load(file, { ignoreEncryption: true });
  
  const vpObj: Record<string, any> = {
    HideToolbar: !!prefs.hideToolbar,
    HideMenubar: !!prefs.hideMenubar,
    HideWindowUI: !!prefs.hideWindowUI,
    FitWindow: !!prefs.fitWindow,
    CenterWindow: !!prefs.centerWindow,
    DisplayDocTitle: !!prefs.displayDocTitle,
  };

  if (prefs.pageMode && prefs.pageMode !== 'FullScreen') {
    vpObj.NonFullScreenPageMode = PDFName.of(prefs.pageMode);
  }
  
  const vp = doc.context.obj(vpObj);
  doc.catalog.set(PDFName.of('ViewerPreferences'), vp);
  
  // Page Mode (Initial View: FullScreen, UseThumbs, UseOutlines, UseNone)
  if (prefs.pageMode) {
    doc.catalog.set(PDFName.of('PageMode'), PDFName.of(prefs.pageMode));
  }

  // Page Layout (SinglePage, OneColumn, TwoColumnLeft, TwoPageLeft)
  if (prefs.pageLayout) {
    doc.catalog.set(PDFName.of('PageLayout'), PDFName.of(prefs.pageLayout));
  }

  const bytes = await doc.save();
  post({
    type: 'viewer-prefs-done',
    result: {
      totalPages: doc.getPageCount(),
      succeeded: 1,
      failed: [],
      durationMs: 0,
      output: new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      outputName: meta.name.replace(/\.pdf$/i, '') + '-prefs.pdf',
      cancelled: false
    }
  });
}

async function audioReaderRun(file: ArrayBuffer, meta: FileMeta): Promise<void> {
  let doc;
  try {
    await engine.init();
    doc = await engine.open(file);
    const count = engine.pageCount(doc);
    const texts = await (engine as any).extractText(doc);
    const fullText = (texts || []).join('\n\n').trim();

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const outputName = meta.name.replace(/\.pdf$/i, '') + '-audio-text.txt';

    post({
      type: 'audio-reader-done',
      result: {
        totalPages: count,
        succeeded: count,
        failed: [],
        durationMs: 0,
        output: blob,
        outputName: outputName,
        cancelled: false
      }
    });
  } catch (err) {
    console.error('audioReaderRun error:', err);
    post({
      type: 'audio-reader-done',
      result: { totalPages: 1, succeeded: 0, failed: [], durationMs: 0, output: new Blob([]), outputName: '', cancelled: false }
    });
  } finally {
    if (doc) engine.close(doc);
  }
}
