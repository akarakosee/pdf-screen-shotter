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
import { FileDown } from 'lucide-react';
import { Button } from './ui/Button';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function SplitBySizeShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{ message: string; percentage?: number } | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [maxSizeMB, setMaxSizeMB] = useState<number>(5); // Default to 5MB parts

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onSplitBySizeProgress: (processed, total) => {
           setProgress({ message: `Processing ${processed} of ${total} pages...`, percentage: (processed / total) * 100 });
        },
        onSplitBySizeDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: (message) => {
          setCancelling(false);
          setToast({ kind: 'error', message: message || t.corruptFile || 'An error occurred' });
          setErrorMsg(null);
    setPhase('upload');
        },
        onUnavailable: () => {
          setUnavailable(true);
        }
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
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setPhase('upload');
    setFile(null);
  }, [controller]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const f = files[0];
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        setToast({ kind: 'error', message: t.notPdf || 'Not a PDF file' });
        return;
      }
      setFile(f);
      setPhase('options');
    },
    [t]
  );

  const processFile = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    controller().runSplitBySize(file, maxSizeMB);
  }, [file, maxSizeMB, controller]);

  const preload = useCallback(() => controller().preload(), [controller]);

  if (!wasmOk) {
    return (
      <div className="w-full rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.noWasm || 'WASM not supported'}</p>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div role="alert" className="w-full rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable || 'Tool unavailable'}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            {t.reload || 'Reload page'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
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
                <FileDown className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-ink dark:text-ink-dark">
                {t.lang === 'tr' ? 'Boyuta Göre Böl' : 'Split By Size'}
              </h2>
              <p className="mt-2 max-w-[400px] text-sm text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr'
                  ? 'PDF dosyanızı belirlenen maksimum dosya boyutunu aşmayacak parçalara ayırın.'
                  : 'Split your PDF file into parts that do not exceed the specified maximum file size.'}
              </p>
              
              <div className="mt-8 flex w-full max-w-[300px] flex-col gap-4 text-left">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink dark:text-ink-dark">
                    {t.lang === 'tr' ? 'Maksimum Dosya Boyutu (MB)' : 'Maximum File Size (MB)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxSizeMB}
                    onChange={(e) => setMaxSizeMB(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-11 rounded-lg border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark"
                  />
                  <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {t.lang === 'tr' ? 'Örn: Dosyanızı 5MB parçalara bölmek için 5 girin.' : 'Hint: Enter 5 to split your file into 5MB chunks.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t bg-bg/50 p-4 sm:flex-row sm:items-center dark:bg-bg-dark/50">
              <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={processFile} className="w-full sm:w-auto">
                {t.lang === 'tr' ? 'PDF\'i Böl' : 'Split PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          cancelling={cancelling}
          label={progress?.message || (t.lang === 'tr' ? 'İşleniyor...' : 'Processing...')}
          progressPercent={progress?.percentage || 0}
          cancelLabel={t.cancel || 'Cancel'}
          cancellingLabel={t.lang === 'tr' ? 'İptal ediliyor...' : 'Cancelling...'}
          onCancel={cancel}
        />
      )}

      {phase === 'done' && (result || errorMsg) && (
        <ResultPanel
            errorMsg={errorMsg}
          t={t}
          result={result}
          skipped={[]}
          crossLink={null}
                    onDownload={() => {
            if (result.output) triggerDownload(result.output, result.outputName || 'split-parts.zip');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast toast={toast} onClear={() => setToast(null)} />}
    </div>
  );
}
