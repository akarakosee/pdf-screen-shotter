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

self.onmessage = async (ev: MessageEvent<UiToWorkerMessage>) => {
  const msg = ev.data;
  if (msg.type === 'cancel') {
    cancelled = true;
    return;
  }
  try {
    await ready;
    if (msg.type === 'preview') await preview(msg.file, msg.dpi ?? PREVIEW_DPI);
    else if (msg.type === 'start') await run(msg.files, msg.meta, msg.options);
  } catch (e) {
    // Unrecoverable (e.g. WASM OOM): JobController terminates + respawns us.
    post({ type: 'fatal', message: e instanceof Error ? e.message : String(e) });
  }
};

async function preview(file: ArrayBuffer, dpi: number): Promise<void> {
  const doc = await engine.open(file);
  try {
    const out = await engine.renderPage(doc, 1, dpi, 'png');
    post({
      type: 'preview-done',
      blob: new Blob([out.data as BlobPart], { type: 'image/png' }),
    });
  } finally {
    engine.close(doc);
  }
}

async function run(files: ArrayBuffer[], meta: FileMeta[], options: ExportOptions): Promise<void> {
  cancelled = false;
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
