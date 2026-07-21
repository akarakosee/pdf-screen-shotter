// Single render worker — SISTEM_TASARIMI §3.3 message protocol.
// The PDF engine lives only here; the main thread never imports it.
// Cancel is cooperative (flag checked per page); pages already written to the
// ZIP stream are preserved so a partial ZIP stays downloadable.

import type {
  ExportOptions,
  ExportResult,
  FileMeta,
  PageError,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from '../core/types';
import { DEFAULT_JPG_QUALITY, PREVIEW_DPI } from '../core/config';
import { MuPdfEngine } from '../engine/MuPdfEngine';
import { EncryptedError } from '../engine/PdfEngine';
import { ZipStream } from './zipStream';
import { pageFileName, sanitizeBaseName, zipFileName } from '../app/naming';
import { parsePageRange } from '../app/pageRange';

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
  if (msg.type === 'start') cancelled = false;
  queue = queue.then(async () => {
    try {
      await ready;
      if (msg.type === 'preview') await preview(msg.file, msg.dpi ?? PREVIEW_DPI);
      else if (msg.type === 'inspect') await inspect(msg.fileId, msg.file);
      else if (msg.type === 'start') await run(msg.files, msg.meta, msg.options);
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

// A bad preview must never take the whole worker down with it — unlike
// inspect()/run(), this used to have no catch around open()/renderPage(),
// so a single unpreviewable file fell through to the outer 'fatal' handler,
// which terminates and respawns the worker (silently dropping any other
// queued message for the same file, e.g. its 'inspect'). preview-error is
// scoped to this one operation instead.
async function preview(file: ArrayBuffer, dpi: number): Promise<void> {
  let doc;
  try {
    doc = await engine.open(file);
  } catch (e) {
    console.error('[worker] preview: engine.open failed:', e);
    post({ type: 'preview-error', message: e instanceof Error ? e.message : String(e) });
    return;
  }
  try {
    const out = await engine.renderPage(doc, 1, dpi, 'png');
    post({
      type: 'preview-done',
      blob: new Blob([out.data as BlobPart], { type: 'image/png' }),
    });
  } catch (e) {
    console.error('[worker] preview: renderPage failed:', e);
    post({ type: 'preview-error', message: e instanceof Error ? e.message : String(e) });
  } finally {
    engine.close(doc);
  }
}

async function run(files: ArrayBuffer[], meta: FileMeta[], options: ExportOptions): Promise<void> {
  const started = Date.now();
  const zip = new ZipStream();
  const failed: PageError[] = [];
  const mime = options.format === 'png' ? 'image/png' : 'image/jpeg';
  let totalPages = 0;
  let succeeded = 0;
  let lastSingle: { data: Uint8Array; name: string } | null = null;

  outer: for (let i = 0; i < files.length; i++) {
    const { fileId, name } = meta[i]!;
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
      const pages = options.pageRange ? parsePageRange(options.pageRange, count).pages : range(count);
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
            options.dpi,
            options.format,
            options.jpgQuality ?? DEFAULT_JPG_QUALITY,
          );
          const entryName = pageFileName(base, page, options.format);
          zip.add(entryName, out.data);
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

  // Single successful page → direct image download; otherwise ZIP (PRD R6).
  const singleBase = meta.length === 1 ? sanitizeBaseName(meta[0]!.name) : 'converted';
  let output: Blob;
  let outputName: string;
  if (succeeded === 1 && lastSingle) {
    output = new Blob([lastSingle.data as BlobPart], { type: mime });
    outputName = lastSingle.name;
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
    cancelled,
  };
  post({ type: 'done', result });
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}
