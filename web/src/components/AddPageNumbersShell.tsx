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

export function AddPageNumbersShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{ message: string; percentage?: number } | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onBatesProgress: (processed, total) => {
           setProgress({ message: `Converting page ${processed} of ${total} to SVG...`, percentage: (processed / total) * 100 });
        },
        onDone: (res) => {
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
  }, [controller]);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const file = files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setToast({ kind: 'error', message: t.notPdf || 'Not a PDF file' });
        return;
      }
      setPhase('processing');
      controller().runBatesNumbering(files[0], 'Page ', '', 1, 0);
    },
    [controller]
  );

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
            if (result.output) triggerDownload(result.output, result.outputName || 'svgs.zip');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast toast={toast} onClear={() => setToast(null)} />}
    </div>
  );
}
