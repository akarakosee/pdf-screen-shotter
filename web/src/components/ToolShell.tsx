// ToolShell — upload → options → processing → done state machine
// (SISTEM_TASARIMI §2.2), wired to the render worker via JobController.
// The tool region keeps a fixed min-height so no state change moves scroll.

import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { reasonText } from '../app/fileErrors';
import { parsePageRange, PageRangeError } from '../app/pageRange';
import { validatePdfFile } from '../app/validators';
import { DEFAULT_DPI, PREVIEW_DPI } from '../core/config';
import type { ExportOptions, ExportResult, PageError, ProgressData } from '../core/types';
import type { Strings } from '../i18n/en';
import { en, fmt } from '../i18n/en';
import { DropZone } from './DropZone';
import { FileChip, formatSize, type ChipData } from './FileChip';
import { OptionsPanel } from './OptionsPanel';
import { PagePreview } from './PagePreview';
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

// Per-file render settings (dpi/pageRange/backgroundColor). deliveryMethod
// stays batch-level (see PerFileExportOptions in core/types.ts).
interface FileConfig {
  dpi: ExportOptions['dpi'];
  pageRange: string;
  backgroundColor: NonNullable<ExportOptions['backgroundColor']>;
}

const defaultFileConfig = (): FileConfig => ({
  dpi: DEFAULT_DPI,
  pageRange: '',
  backgroundColor: 'white',
});

export function ToolShell({ format, t = en, crossLink = null, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [chips, setChips] = useState<ChipData[]>([]);
  const filesRef = useRef(new Map<string, File>());
  // Per-file config, keyed by fileId — the "Per-File Configuration" refactor:
  // each queued file renders with its own dpi/pageRange/backgroundColor.
  const [fileOptions, setFileOptions] = useState<Record<string, FileConfig>>({});
  // ADR-007: which file's preview/config is shown when several are queued.
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // §4.1: scroll must never jump between states. The options state is usually
  // the tallest; when it unmounts for processing/done we pin the region to the
  // height it had at Convert time.
  const regionRef = useRef<HTMLDivElement>(null);
  const [regionMinHeight, setRegionMinHeight] = useState<number | null>(null);
  const pageErrorsRef = useRef<PageError[]>([]);
  const fileErrorsRef = useRef<Map<string, string>>(new Map());
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setChips((cs) => cs.map((c) => (c.id === fileId ? { ...c, pageCount } : c)));
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
        onUnavailable: () => {
          // JobController gave up respawning — every retry has hit the same
          // broken worker, so retrying again from here would just repeat it.
          // This is a permanent, non-dismissing state (unlike the fatal
          // toast), since there is nothing more this session can do.
          setUnavailable(true);
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
          // ADR-007: first-page thumbnail for the FileChip row and the
          // output-size estimate. Independent of the filmstrip's own
          // lazy-loaded thumbnails (this always fetches page 1 up front).
          void controller()
            .previewPage(file, 1)
            .then((blob) => {
              const url = URL.createObjectURL(blob);
              setChips((cs) =>
                cs.map((c) =>
                  c.id === id ? { ...c, thumbnailUrl: url, thumbnailBytes: blob.size } : c,
                ),
              );
            })
            .catch(() => {
              // Filmstrip's own per-page fetch will surface the same failure
              // inline; the FileChip simply keeps its no-thumbnail layout.
            });
        }
      }
      setChips((cs) => [...cs, ...added]);
      setFileOptions((opts) => {
        const next = { ...opts };
        for (const c of added) if (c.status === 'valid') next[c.id] = defaultFileConfig();
        return next;
      });
      setPhase((p) => (p === 'upload' ? 'options' : p));
    },
    [controller, t],
  );

  // Keep the filmstrip pointed at a real file: falls back to the first valid
  // chip whenever the active one is removed, or none is selected yet.
  useEffect(() => {
    if (chips.some((c) => c.id === activeFileId && c.status === 'valid')) return;
    setActiveFileId(chips.find((c) => c.status === 'valid')?.id ?? null);
  }, [chips, activeFileId]);

  const removeFile = useCallback((id: string) => {
    filesRef.current.delete(id);
    setChips((cs) => {
      const removed = cs.find((c) => c.id === id);
      if (removed?.thumbnailUrl) URL.revokeObjectURL(removed.thumbnailUrl);
      const next = cs.filter((c) => c.id !== id);
      if (!next.some((c) => c.status === 'valid')) setErrorMsg(null);
    setPhase('upload');
      return next;
    });
    setFileOptions((opts) => {
      if (!(id in opts)) return opts;
      const next = { ...opts };
      delete next[id];
      return next;
    });
  }, []);

  // The active file's own config — read and edited independently per file.
  const activeConfig: FileConfig = fileOptions[activeFileId ?? ''] ?? defaultFileConfig();

  const setActiveDpi = useCallback(
    (dpi: ExportOptions['dpi']) => {
      if (!activeFileId) return;
      setFileOptions((opts) => ({
        ...opts,
        [activeFileId]: { ...(opts[activeFileId] ?? defaultFileConfig()), dpi },
      }));
    },
    [activeFileId],
  );

  const setActivePageRange = useCallback(
    (pageRange: string) => {
      if (!activeFileId) return;
      setFileOptions((opts) => ({
        ...opts,
        [activeFileId]: { ...(opts[activeFileId] ?? defaultFileConfig()), pageRange },
      }));
    },
    [activeFileId],
  );

  const setActiveBackgroundColor = useCallback(
    (backgroundColor: NonNullable<ExportOptions['backgroundColor']>) => {
      if (!activeFileId) return;
      setFileOptions((opts) => ({
        ...opts,
        [activeFileId]: { ...(opts[activeFileId] ?? defaultFileConfig()), backgroundColor },
      }));
    },
    [activeFileId],
  );

  // Validate the ACTIVE file's own range against its own page count (R2).
  // Each file's range is independent now, so this only ever reflects
  // whichever file is currently selected in the switcher/preview.
  const { rangeError, rangeNotice } = useMemo(() => {
    const value = activeConfig.pageRange;
    if (value.trim() === '') return { rangeError: null, rangeNotice: null };
    const maxPages = chips.find((c) => c.id === activeFileId)?.pageCount ?? null;
    try {
      const parsed = parsePageRange(value, maxPages ?? Number.MAX_SAFE_INTEGER);
      return {
        rangeError: null as string | null,
        rangeNotice: maxPages != null && parsed.clamped ? t.pageRangeClamped : null,
      };
    } catch (e) {
      return {
        rangeError: e instanceof PageRangeError ? t.pageRangeInvalid : String(e),
        rangeNotice: null as string | null,
      };
    }
  }, [activeConfig.pageRange, activeFileId, chips, t]);

  const hasGlobalRangeError = useMemo(() => {
    return chips.some((c) => {
      if (c.status !== 'valid') return false;
      const range = fileOptions[c.id]?.pageRange;
      if (!range || range.trim() === '') return false;
      try {
        parsePageRange(range, c.pageCount ?? Number.MAX_SAFE_INTEGER);
        return false;
      } catch {
        return true;
      }
    });
  }, [chips, fileOptions]);

  const convert = useCallback(() => {
    const valid = chips.filter((c) => c.status === 'valid');
    if (valid.length === 0 || hasGlobalRangeError) return;
    pageErrorsRef.current = [];
    fileErrorsRef.current = new Map();
    setProgress(null);
    if (regionRef.current) setRegionMinHeight(regionRef.current.offsetHeight);
    setPhase('processing');
    // On small screens the Convert button sits below the fold; the panel that
    // replaces it renders at the region top. Bring it into view once —
    // otherwise the user is left looking at reserved blank space.
    regionRef.current?.scrollIntoView({ block: 'nearest' });
    void controller().start(
      valid.map((c) => {
        const cfg = fileOptions[c.id] ?? defaultFileConfig();
        const range = cfg.pageRange.trim();
        // Defensive: this file's own range is only validated live while it's
        // the active one in the switcher. A mistake left behind on a
        // different (currently unselected) file must never block or crash
        // the whole batch — fall back to "all pages" for that file instead.
        let pageRange: string | undefined;
        if (range !== '' && c.pageCount != null) {
          try {
            parsePageRange(range, c.pageCount);
            pageRange = range;
          } catch {
            pageRange = undefined;
          }
        } else if (range !== '') {
          pageRange = range;
        }
        return {
          fileId: c.id,
          file: filesRef.current.get(c.id)!,
          dpi: cfg.dpi,
          backgroundColor: cfg.backgroundColor,
          pageRange,
        };
      }),
      { format, deliveryMethod: 'zip' },
    );
  }, [chips, controller, fileOptions, format, hasGlobalRangeError]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
  }, [controller]);

  const reset = useCallback(() => {
    filesRef.current.clear();
    setChips((cs) => {
      cs.forEach((c) => {
        if (c.thumbnailUrl) URL.revokeObjectURL(c.thumbnailUrl);
      });
      return [];
    });
    setActiveFileId(null);
    setFileOptions({});
    setResult(null);
    setProgress(null);
    setRegionMinHeight(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  // ADR-007: rough output-size estimate. Each file's own page-1 thumbnail
  // (rendered at the fixed PREVIEW_DPI) is scaled by pixel-count ratio to the
  // chosen export DPI, then multiplied by that file's own selected page
  // count. Per-file config refactor: this now reflects only the ACTIVE
  // file, matching the OptionsPanel it sits under (each file's estimate is
  // independent, so a batch-wide sum no longer means anything coherent).
  // CLS fix: this must only ever return `null` when there's no active file
  // — that's the one case where the whole options phase (and this bar)
  // isn't rendered at all. Every other "can't compute a real number yet"
  // case (invalid range, thumbnail still loading, a caught parse error)
  // returns a zero-value fallback instead, so the bar and the PrivacyLine
  // mounted alongside it in OptionsPanel never unmount and collapse the panel.
  const estimatedSize = useMemo(() => {
    const chip = chips.find((c) => c.id === activeFileId && c.status === 'valid');
    if (!chip) return null;
    const unavailable = { bytes: 0, text: t.estimatedSizeUnavailable };
    if (rangeError) return unavailable;
    if (chip.pageCount == null || chip.thumbnailBytes == null) return unavailable;
    const dpiRatio = (activeConfig.dpi / PREVIEW_DPI) ** 2;
    let total = 0;
    try {
      const effectivePages = activeConfig.pageRange.trim()
        ? parsePageRange(activeConfig.pageRange, chip.pageCount).pages.length
        : chip.pageCount;
      total = chip.thumbnailBytes * dpiRatio * effectivePages;
    } catch {
      // parsePageRange can throw during typing, before rangeError catches up.
      return unavailable;
    }
    return { bytes: total, text: fmt(t.estimatedSize, { size: formatSize(total) }) };
  }, [chips, activeFileId, activeConfig.dpi, activeConfig.pageRange, rangeError, t]);

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
      <div className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
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

  if (unavailable) {
    return (
      <div role="alert" className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            {t.reloadPage}
          </button>
        </div>
      </div>
    );
  }

  const validChips = chips.filter((c) => c.status !== 'invalid');
  const invalidChips = chips.filter((c) => c.status === 'invalid');
  const selectableChips = chips.filter((c) => c.status === 'valid');
  const activeChip = selectableChips.find((c) => c.id === activeFileId) ?? null;
  const activeFile = activeChip ? filesRef.current.get(activeChip.id) : undefined;

  return (
    <div
      ref={regionRef}
      className="flex flex-col gap-5"
      style={regionMinHeight != null ? { minHeight: regionMinHeight } : undefined}
    >
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={chips.length > 0} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {(validChips.length > 0 || invalidChips.length > 0) && phase !== 'done' && (
        <div className="mb-4">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...validChips, ...invalidChips].map((c, i) => {
              let hasError = false;
              if (c.status === 'valid') {
                const range = fileOptions[c.id]?.pageRange;
                if (range && range.trim() !== '') {
                  try {
                    parsePageRange(range, c.pageCount ?? Number.MAX_SAFE_INTEGER);
                  } catch {
                    hasError = true;
                  }
                }
              }
              return (
                <FileChip
                  key={c.id}
                  t={t}
                  data={c}
                  enterDelay={i * 40}
                  onRemove={phase === 'processing' ? undefined : removeFile}
                  isActive={phase === 'options' && c.id === activeFileId}
                  hasError={hasError}
                  onClick={phase === 'options' ? () => setActiveFileId(c.id) : undefined}
                />
              );
            })}
            {phase === 'options' && (
              <li className="flex">
                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  aria-label={t.addFile}
                  title={t.addFile}
                  className="btn-motion flex h-full min-h-[58px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber/60 bg-gradient-to-br from-amber/10 to-[#F0C778]/20 text-amber shadow-[0_0_15px_rgba(232,182,95,0.15)] transition-all duration-200 hover:border-amber hover:from-amber/20 hover:to-[#F0C778]/30 hover:shadow-[0_0_20px_rgba(232,182,95,0.4)] dark:border-amber-dark/60 dark:from-amber-dark/20 dark:to-[#F0C778]/20 dark:text-amber-dark dark:hover:from-amber-dark/30 dark:hover:to-[#F0C778]/30"
                >
                  <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={2.25} />
                </button>
                <input
                  ref={addFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const incoming = e.currentTarget.files;
                    if (incoming && incoming.length > 0) void addFiles([...incoming]);
                    e.currentTarget.value = '';
                  }}
                />
              </li>
            )}
          </ul>
        </div>
      )}

      {phase === 'options' && validChips.length > 0 && (
        <div className="phase-enter flex flex-col gap-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <OptionsPanel
              t={t}
              dpi={activeConfig.dpi}
              onDpi={setActiveDpi}
              pageRange={activeConfig.pageRange}
              onPageRange={setActivePageRange}
              rangeError={rangeError}
              rangeNotice={rangeNotice}
              estimatedSize={estimatedSize}
              format={format}
              backgroundColor={activeConfig.backgroundColor}
              onBackgroundColor={setActiveBackgroundColor}
              fileInfo={
                activeChip
                  ? { name: activeChip.name, pageCount: activeChip.pageCount, size: activeChip.size }
                  : null
              }
            />
            <div className="card-lit flex w-fit max-w-full min-w-0 flex-col self-start rounded-lg border bg-surface pb-2 dark:bg-surface-dark">
              <div className="mb-2 flex items-center justify-between gap-2 px-3 pt-1.5">
                <p className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
                  {t.previewTitle}
                </p>
              </div>
              {activeFile && activeChip?.pageCount ? (
                <PagePreview
                  key={activeChip.id}
                  t={t}
                  file={activeFile}
                  pageCount={activeChip.pageCount}
                  backgroundColor={activeConfig.backgroundColor}
                  getPage={(page) =>
                    controller().previewPage(
                      activeFile,
                      page,
                      PREVIEW_DPI,
                      activeConfig.backgroundColor,
                    )
                  }
                />
              ) : (
                <div className="flex flex-1 items-center justify-center px-3 pb-2">
                  <p className="text-xs text-ink-muted dark:text-ink-muted-dark" aria-live="polite">
                    {t.previewNoFile}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-3 mt-4">
            <PrivacyLine t={t} />
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={convert}
                disabled={hasGlobalRangeError}
                className="btn-motion inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:from-amber-dark dark:to-[#F0C778]"
              >
                {t.convert}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter">
          <ProgressPanel 
            label={t.converting || 'Processing...'}
            progressPercent={progress ? (progress.totalFiles > 1 ? ((progress.fileIndex + progress.page / progress.totalPages) / progress.totalFiles) * 100 : (progress.page / progress.totalPages) * 100) : 0}
            cancelling={cancelling} 
            onCancel={cancel} 
            cancelLabel={t.cancel || 'Cancel'}
            cancellingLabel={t.cancelling || 'Cancelling...'}
          />
        </div>
      )}

      {phase === 'done' && (result || errorMsg) && (
        <ResultPanel
            errorMsg={errorMsg}
          t={t}
          result={result}
          skipped={skippedRows}
          crossLink={crossLink}
          onDownload={() => {
            if (result.pages) {
              // Multiple simultaneous downloads get blocked/prompted by the
              // browser — a small stagger keeps every file landing cleanly.
              result.pages.forEach((f, i) => {
                setTimeout(() => triggerDownload(f.blob, f.name), i * 300);
              });
            } else if (result.output && result.outputName) {
              triggerDownload(result.output, result.outputName);
            }
          }}
          onConvertMore={reset}
        />
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
