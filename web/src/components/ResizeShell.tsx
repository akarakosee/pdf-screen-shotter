import { useCallback, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import type { ExportResult, ProgressData } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { ProgressPanel } from './ProgressPanel';
import { ResultPanel } from './ResultPanel';
import { Settings2 } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function ResizeShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [margin, setMargin] = useState<number>(36); // 36 points = 0.5 inch

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onWasmFail: () => setWasmOk(false),
        onProgress: (data) => setProgress(data),
        onDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile || 'Could not process file.' });
          setErrorMsg(null);
    setPhase('upload');
        },
      });
    }
    return controllerRef.current;
  }, [t]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
    setErrorMsg(null);
    setPhase('upload');
  }, [controller]);

  const reset = useCallback(() => {
    controller().clear();
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setPhase('upload');
    setFile(null);
  }, [controller]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      setFile(files[0]);
      setPhase('options');
    },
    []
  );

  const processFile = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    controller().runResize(file, pageSize, margin);
  }, [file, pageSize, margin, controller]);

  const preload = useCallback(() => controller().preload(), [controller]);

  if (!wasmOk) {
    return (
      <div className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.noWasm || 'WASM not supported'}</p>
        {desktopAppUrl && (
          <p className="mt-2 text-xs">
            <a href={desktopAppUrl} className="underline underline-offset-2 text-accent">
              {t.desktopAppLink || 'Get desktop app'}
            </a>
          </p>
        )}
      </div>
    );
  }

  if (unavailable) {
    return (
      <div role="alert" className="rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable || 'Tool unavailable'}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm dark:bg-surface-dark">
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                <Settings2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-ink dark:text-ink-dark">
                Resize Options
              </h2>
              <p className="mt-2 max-w-[400px] text-sm text-ink-muted dark:text-ink-muted-dark">
                Choose the new page size and margin. Your pages will be scaled to fit perfectly.
              </p>
              
              <div className="mt-8 flex w-full flex-col gap-4 text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink dark:text-ink-dark">Page Size</label>
                  <select 
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="h-11 rounded-lg border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent dark:bg-bg-dark dark:text-ink-dark"
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="Letter">US Letter</option>
                    <option value="Fit">Keep Original Proportions</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink dark:text-ink-dark">Margin Size</label>
                  <select 
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="h-11 rounded-lg border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent dark:bg-bg-dark dark:text-ink-dark"
                  >
                    <option value="0">None (0px)</option>
                    <option value="36">Small (36px / ~0.5 inch)</option>
                    <option value="72">Medium (72px / ~1.0 inch)</option>
                    <option value="144">Large (144px / ~2.0 inches)</option>
                  </select>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 rounded-lg border bg-surface py-2.5 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processFile}
                    className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    Apply changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || 'Resizing pages...'}
          progressPercent={
            progress
              ? progress.totalFiles > 1
                ? ((progress.fileIndex + progress.page / progress.totalPages) / progress.totalFiles) * 100
                : (progress.page / progress.totalPages) * 100
              : 0
          }
          cancelling={cancelling}
          onCancel={cancel}
          cancelLabel={t.cancel || 'Cancel'}
          cancellingLabel={t.cancelling || 'Cancelling...'}
        />
      )}

      {phase === 'done' && (result || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={result}
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              if (result.output) triggerDownload(result.output, result.outputName || 'resized.pdf');
            }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
