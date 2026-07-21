// ToolShell — upload → options → processing → done state machine
// (SISTEM_TASARIMI §2.2), wired to the render worker via JobController.
// The tool region keeps a fixed min-height so no state change moves scroll.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { parsePageRange, PageRangeError } from '../app/pageRange';
import { validatePdfFile } from '../app/validators';
import { DEFAULT_DPI } from '../core/config';
import type { ExportOptions, ExportResult, PageError, ProgressData } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { DropZone } from './DropZone';
import { FileChip, type ChipData } from './FileChip';
import { OptionsPanel } from './OptionsPanel';
import { Preview } from './Preview';
import { PrivacyLine } from './PrivacyLine';
import { ProgressPanel } from './ProgressPanel';
import { ResultPanel } from './ResultPanel';
import { Toast, type ToastData } from './Toast';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  format: 'png' | 'jpg';
  t?: Strings;
  crossLink?: { href: string; label: string } | null;
  desktopAppUrl?: string;
}

let nextId = 0;
const newId = () => `f${++nextId}`;

export function ToolShell({ format, t = en, crossLink = null, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [phase, setPhase] = useState<Phase>('upload');
  const [chips, setChips] = useState<ChipData[]>([]);
  const filesRef = useRef(new Map<string, File>());
  const [dpi, setDpi] = useState<ExportOptions['dpi']>(DEFAULT_DPI);
  const [pageRange, setPageRange] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const pageErrorsRef = useRef<PageError[]>([]);
  const fileErrorsRef = useRef<Map<string, string>>(new Map());

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setChips((cs) => cs.map((c) => (c.id === fileId ? { ...c, pageCount } : c)));
        },
        onPreview: (blob) => {
          setPreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return URL.createObjectURL(blob);
          });
          setPreviewState('ready');
        },
        onProgress: (data) => setProgress(data),
        onPageError: (error) => {
          pageErrorsRef.current.push(error);
        },
        onFileError: (fileId, message) => {
          fileErrorsRef.current.set(fileId, message);
          setChips((cs) =>
            cs.map((c) =>
              c.id === fileId ? { ...c, status: 'failed', reason: reasonText(message, t) } : c,
            ),
          );
        },
        onDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile });
          setPhase((p) => (p === 'processing' ? 'options' : p));
        },
      });
    }
    return controllerRef.current;
  }, [t]);

  useEffect(() => {
    if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') setWasmOk(false);
    return () => controllerRef.current?.dispose();
  }, []);

  const preload = useCallback(() => {
    controller().preload();
  }, [controller]);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const added: ChipData[] = [];
      for (const file of incoming) {
        const rejection = await validatePdfFile(file);
        const id = newId();
        if (rejection) {
          added.push({
            id,
            name: file.name,
            size: file.size,
            pageCount: null,
            status: 'invalid',
            reason:
              rejection === 'empty-file'
                ? t.emptyFile
                : t.notPdf,
          });
        } else {
          filesRef.current.set(id, file);
          added.push({ id, name: file.name, size: file.size, pageCount: null, status: 'valid' });
          void controller().inspect(id, file); // ADR-003: fills pageCount / flags bad files early
        }
      }
      setChips((cs) => {
        const next = [...cs, ...added];
        const firstValid = next.find((c) => c.status === 'valid');
        if (firstValid && added.some((c) => c.id === firstValid.id)) {
          setPreviewState('loading');
          const f = filesRef.current.get(firstValid.id);
          if (f) void controller().preview(f, dpi);
        }
        return next;
      });
      setPhase((p) => (p === 'upload' ? 'options' : p));
    },
    [controller, dpi, t],
  );

  // Preview follows DPI (PRD R3).
  useEffect(() => {
    const first = chips.find((c) => c.status === 'valid');
    if (!first || phase !== 'options') return;
    const f = filesRef.current.get(first.id);
    if (!f) return;
    setPreviewState('loading');
    void controller().preview(f, dpi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpi]);

  const removeFile = useCallback((id: string) => {
    filesRef.current.delete(id);
    setChips((cs) => {
      const next = cs.filter((c) => c.id !== id);
      if (!next.some((c) => c.status === 'valid')) {
        setPhase('upload');
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return null;
        });
      }
      return next;
    });
  }, []);

  const onRangeChange = useCallback((value: string) => {
    setPageRange(value);
  }, []);

  // Validate syntax and detect clamping (R2) against known page counts (ADR-003).
  const [rangeNotice, setRangeNotice] = useState<string | null>(null);
  useEffect(() => {
    if (pageRange.trim() === '') {
      setRangeError(null);
      setRangeNotice(null);
      return;
    }
    const known = chips.filter((c) => c.status === 'valid' && c.pageCount != null);
    const maxPages = known.length > 0 ? Math.max(...known.map((c) => c.pageCount!)) : null;
    try {
      const parsed = parsePageRange(pageRange, maxPages ?? Number.MAX_SAFE_INTEGER);
      setRangeError(null);
      setRangeNotice(maxPages != null && parsed.clamped ? t.pageRangeClamped : null);
    } catch (e) {
      setRangeNotice(null);
      setRangeError(e instanceof PageRangeError ? t.pageRangeInvalid : String(e));
    }
  }, [pageRange, chips, t]);

  const convert = useCallback(() => {
    const valid = chips.filter((c) => c.status === 'valid');
    if (valid.length === 0 || rangeError) return;
    pageErrorsRef.current = [];
    fileErrorsRef.current = new Map();
    setProgress(null);
    setPhase('processing');
    const options: ExportOptions = {
      dpi,
      format,
      ...(pageRange.trim() !== '' ? { pageRange: pageRange.trim() } : {}),
    };
    void controller().start(
      valid.map((c) => ({ fileId: c.id, file: filesRef.current.get(c.id)! })),
      options,
    );
  }, [chips, controller, dpi, format, pageRange, rangeError]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
  }, [controller]);

  const reset = useCallback(() => {
    filesRef.current.clear();
    setChips([]);
    setResult(null);
    setProgress(null);
    setPageRange('');
    setRangeError(null);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setPhase('upload');
  }, []);

  const skippedRows = useMemo(() => {
    if (!result) return [];
    const rows: { fileName: string; detail: string }[] = [];
    for (const [fileId, message] of fileErrorsRef.current) {
      const chip = chips.find((c) => c.id === fileId);
      rows.push({ fileName: chip?.name ?? fileId, detail: reasonText(message, t) });
    }
    for (const err of pageErrorsRef.current) {
      const chip = chips.find((c) => c.id === err.fileId);
      rows.push({ fileName: chip?.name ?? err.fileId, detail: `p. ${err.page}: ${err.message}` });
    }
    return rows;
  }, [result, chips, t]);

  if (!wasmOk) {
    return (
      <div className="rounded-m border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.noWasm}</p>
        {desktopAppUrl && (
          <p className="mt-2 text-xs">
            <a href={desktopAppUrl} className="underline underline-offset-2 text-accent">
              {t.desktopAppLink}
            </a>
          </p>
        )}
      </div>
    );
  }

  const validChips = chips.filter((c) => c.status !== 'invalid');
  const invalidChips = chips.filter((c) => c.status === 'invalid');

  return (
    <div className="flex min-h-[420px] flex-col gap-5">
      {phase !== 'processing' && phase !== 'done' && (
        <div>
          <DropZone t={t} hasFiles={chips.length > 0} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {(validChips.length > 0 || invalidChips.length > 0) && phase !== 'done' && (
        <ul className="flex flex-col gap-2">
          {[...validChips, ...invalidChips].map((c) => (
            <FileChip
              key={c.id}
              t={t}
              data={c}
              onRemove={phase === 'processing' ? undefined : removeFile}
            />
          ))}
        </ul>
      )}

      {phase === 'options' && validChips.length > 0 && (
        <>
          <div className="grid gap-5 md:grid-cols-[3fr_2fr]">
            <OptionsPanel
              t={t}
              dpi={dpi}
              onDpi={setDpi}
              pageRange={pageRange}
              onPageRange={onRangeChange}
              rangeError={rangeError}
              rangeNotice={rangeNotice}
            />
            <Preview t={t} state={previewState} url={previewUrl} />
          </div>
          <div>
            <button
              type="button"
              onClick={convert}
              disabled={rangeError != null}
              className="inline-flex min-h-11 items-center justify-center rounded-s bg-accent px-6 text-sm font-medium text-white transition-colors duration-[120ms] hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-50"
            >
              {t.convert}
            </button>
          </div>
        </>
      )}

      {phase === 'processing' && (
        <ProgressPanel t={t} progress={progress} cancelling={cancelling} onCancel={cancel} />
      )}

      {phase === 'done' && result && (
        <ResultPanel
          t={t}
          result={result}
          skipped={skippedRows}
          crossLink={crossLink}
          onDownload={() => triggerDownload(result.output, result.outputName)}
          onConvertMore={reset}
        />
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}

function reasonText(code: string, t: Strings): string {
  switch (code) {
    case 'encrypted':
      return t.encryptedFile;
    case 'zero-pages':
      return t.zeroPages;
    default:
      return t.corruptFile;
  }
}
