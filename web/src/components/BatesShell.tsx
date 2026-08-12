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

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function BatesShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Configuration for Bates numbering
  const [prefix, setPrefix] = useState('Exhibit ');
  const [suffix, setSuffix] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [padding, setPadding] = useState(6);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onWasmFail: () => setWasmOk(false),
        onBatesProgress: (processed, total) => {
           setProgress({ message: `Stamping page ${processed} of ${total}...`, percentage: (processed / total) * 100 });
        },
        onDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: (message) => {
          setCancelling(false);
          setToast({ kind: 'error', message: message || t.corruptFile || 'An error occurred' });
          setPhase('upload');
        },
      });
    }
    return controllerRef.current;
  }, [t]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
    setPhase('upload');
  }, [controller]);

  const reset = useCallback(() => {
    controller().clear();
    setResult(null);
    setProgress(null);
    setPhase('upload');
  }, [controller]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      setPhase('processing');
      controller().runBates(file, prefix, suffix, startNumber, padding);
    },
    [controller, prefix, suffix, startNumber, padding]
  );

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
            {t.reload || 'Reload'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {toast && (
        <div className="mb-4">
          <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {phase === 'upload' && (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-surface p-4 shadow-sm dark:bg-surface-dark grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prefix</label>
              <input 
                type="text" 
                value={prefix} 
                onChange={e => setPrefix(e.target.value)}
                className="w-full rounded-md border p-2 text-sm dark:bg-bg-dark"
                placeholder="Exhibit "
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Suffix</label>
              <input 
                type="text" 
                value={suffix} 
                onChange={e => setSuffix(e.target.value)}
                className="w-full rounded-md border p-2 text-sm dark:bg-bg-dark"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Number</label>
              <input 
                type="number" 
                value={startNumber} 
                onChange={e => setStartNumber(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full rounded-md border p-2 text-sm dark:bg-bg-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Padding (zeros)</label>
              <input 
                type="number" 
                value={padding} 
                onChange={e => setPadding(parseInt(e.target.value) || 0)}
                min={1} max={10}
                className="w-full rounded-md border p-2 text-sm dark:bg-bg-dark"
              />
            </div>
          </div>
          <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
            <DropZone t={t} hasFiles={false} onFiles={addFiles} onPreload={preload} multiple={false} accept=".pdf" />
            <PrivacyLine desktopAppUrl={desktopAppUrl} t={t} />
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          t={t}
          progress={progress}
          cancelling={cancelling}
          onCancel={cancel}
        />
      )}

      {phase === 'done' && result && (
        <ResultPanel
          t={t}
          result={result}
          onDownload={() => triggerDownload(result.output, result.outputName)}
          onReset={reset}
        />
      )}
    </div>
  );
}
