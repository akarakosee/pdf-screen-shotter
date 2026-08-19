import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { SplitResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en, fmt } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { PageCard } from './PageCard';
import { ProgressPanel } from './ProgressPanel';
import { Scissors, FileArchive, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'grid' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function SplitShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<{ id: string; file: File; pageCount: number } | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [cancelling, setCancelling] = useState(false);
  
  const [splitProgress, setSplitProgress] = useState<{ extractedPages: number; totalSelected: number } | null>(null);
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setFile((prev) => prev?.id === fileId ? { ...prev, pageCount } : prev);
          const all = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
          setSelectedPages(all);
          setPhase('grid');
        },
        onFileError: (fileId, message) => {
          setToast({ kind: 'error', message: t.corruptFile });
          setErrorMsg(null);
    setPhase('upload');
        },
        onSplitProgress: (extractedPages, totalSelected) => setSplitProgress({ extractedPages, totalSelected }),
        onSplitDone: (result) => {
          setSplitResult(result);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile });
          setPhase((p) => (p === 'processing' ? 'grid' : p));
        },
        onUnavailable: () => setUnavailable(true),
      });
    }
    return controllerRef.current;
  }, [t]);

  useEffect(() => {
    if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') setWasmOk(false);
    return () => controllerRef.current?.dispose();
  }, []);

  const preload = useCallback(() => controller().preload(), [controller]);

  const addFiles = useCallback(
    async (incoming: File[]) => {
      // Split takes only ONE file.
      const f = incoming[0];
      if (!f) return;
      
      const rejection = await validatePdfFile(f);
      if (rejection) {
        setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
        return;
      }
      
      const id = 's1';
      setFile({ id, file: f, pageCount: 0 });
      void controller().inspect(id, f);
    },
    [controller, t]
  );

  const togglePage = useCallback((page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!file) return;
    const all = new Set(Array.from({ length: file.pageCount }, (_, i) => i + 1));
    setSelectedPages(all);
  }, [file]);

  const clearSelection = useCallback(() => setSelectedPages(new Set()), []);

  const runSplit = useCallback(
    (mode: 'extract' | 'burst') => {
      if (!file || selectedPages.size === 0) return;
      
      // Sort selected pages
      const pages = Array.from(selectedPages).sort((a, b) => a - b);
      setPhase('processing');
      setSplitProgress({ extractedPages: 0, totalSelected: pages.length });
      controller().splitFiles(file.file, file.id, pages, mode).catch(() => {
        setToast({ kind: 'error', message: t.fatalError });
        setPhase('grid');
      });
    },
    [file, selectedPages, controller, t]
  );

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
  }, [controller]);

  const reset = useCallback(() => {
    setFile(null);
    setSelectedPages(new Set());
    setSplitResult(null);
    setSplitProgress(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  const splitSameFile = useCallback(() => {
    setSelectedPages(new Set());
    setSplitResult(null);
    setSplitProgress(null);
    setPhase('grid');
  }, []);

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

  // The grid display
  const pages = file && file.pageCount > 0 ? Array.from({ length: file.pageCount }, (_, i) => i + 1) : [];

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'grid' && file && (
        <div className="phase-enter flex flex-col gap-6 pb-24" style={{ perspective: '1000px' }}>
          
          <div className="flex items-center justify-between px-2 gap-4">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="text-sm font-semibold overflow-x-auto whitespace-nowrap scrollbar-thin pr-2" title={file.file.name}>{file.file.name}</div>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {fmt(t.splitPagesSelected, { selected: selectedPages.size, total: file.pageCount })}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary" onClick={selectAll} className="text-xs h-8 px-3">{t.splitSelectAll}</Button>
              <Button variant="secondary" onClick={clearSelection} disabled={selectedPages.size === 0} className="text-xs h-8 px-3">{t.splitClear}</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pages.map((page, i) => (
              <PageCard
                key={page}
                page={page}
                file={file.file}
                controller={controller()}
                isSelected={selectedPages.has(page)}
                onToggle={togglePage}
                index={i}
              />
            ))}
          </div>

          <div className={`
            sticky z-50 bottom-6 mt-8 mx-auto p-2 rounded-2xl border
            bg-white/80 dark:bg-ink/80 backdrop-blur-xl shadow-2xl
            flex gap-2 transition-all duration-500 ease-out transform
            ${selectedPages.size > 0 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}
          `}>
            <button
              onClick={() => runSplit('extract')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-surface/80 hover:bg-surface border border-transparent hover:border-ink/10 dark:bg-surface-dark/80 dark:hover:bg-surface-dark dark:hover:border-surface-300 hover:scale-[1.02] active:scale-95"
            >
              <Scissors className="w-4 h-4" />
              <span className="text-sm">{t.splitExtract}</span>
            </button>
            <button
              onClick={() => runSplit('burst')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-amber text-white shadow-[0_0_20px_rgba(232,182,95,0.4)] hover:bg-amber-hover hover:shadow-[0_0_30px_rgba(232,182,95,0.6)] dark:bg-amber-dark dark:hover:bg-amber-dark hover:scale-[1.05] active:scale-95"
            >
              <FileArchive className="w-4 h-4" />
              <span className="text-sm">{t.splitBurst}</span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          label={
            splitProgress && file?.pageCount
              ? `Processing page ${splitProgress.extractedPages} of ${splitProgress.totalSelected}...`
              : t.converting || 'Processing...'
          }
          progressPercent={
            splitProgress
              ? (splitProgress.extractedPages / splitProgress.totalSelected) * 100
              : 0
          }
          onCancel={cancel}
          cancelling={cancelling}
          cancelLabel={t.cancel || 'Cancel'}
          cancellingLabel={t.cancelling || 'Cancelling...'}
        />
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: splitResult?.output,
              outputName: splitResult?.outputName,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if(splitResult?.output) triggerDownload(splitResult.output, splitResult.outputName || "split.pdf"); else if(splitResult?.outputUrl) { const a = document.createElement("a"); a.href = splitResult.outputUrl; a.download = splitResult.outputName; a.click(); } }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
