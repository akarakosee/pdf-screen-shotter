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
import { FileChip } from './FileChip';
import { Shuffle, ArrowRightLeft } from 'lucide-react';
import { Button } from './ui/Button';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

let nextId = 0;
const newId = () => `mix-${++nextId}`;

export function MixShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{ message: string; percentage?: number } | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onMixPdfProgress: (processed, total) => {
           setProgress({ message: `Mixing page ${processed} of ${total}...`, percentage: (processed / total) * 100 });
        },
        onMixPdfDone: (res) => {
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
    setFiles([]);
  }, [controller]);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid = incoming.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
      if (valid.length === 0) {
        setToast({ kind: 'error', message: t.notPdf || 'Not a PDF file' });
        return;
      }
      
      const newFiles = valid.map(f => ({ id: newId(), file: f }));
      
      setFiles(prev => {
        const next = [...prev, ...newFiles].slice(0, 2); // Max 2 files
        if (next.length === 2) {
          setPhase('options');
        }
        return next;
      });
    },
    [t]
  );
  
  const removeFile = (id: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (next.length < 2) setErrorMsg(null);
    setPhase('upload');
      return next;
    });
  };
  
  const swapFiles = () => {
    setFiles(prev => [prev[1]!, prev[0]!]);
  };

  const processFile = useCallback(() => {
    if (files.length !== 2) return;
    setPhase('processing');
    controller().runMixPdf(files[0]!.file, files[1]!.file);
  }, [files, controller]);

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
          {files.length === 1 && (
            <div className="mb-4 px-2">
              <p className="text-sm font-medium mb-2 text-ink dark:text-ink-dark">
                {t.lang === 'tr' ? '1 dosya daha ekleyin:' : 'Add 1 more file:'}
              </p>
              <FileChip
                name={files[0]!.file.name}
                status="valid"
                onRemove={() => removeFile(files[0]!.id)}
                t={t}
              />
            </div>
          )}
          <DropZone t={t} hasFiles={files.length > 0} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && files.length === 2 && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm dark:bg-surface-dark">
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                <Shuffle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-ink dark:text-ink-dark">
                {t.lang === 'tr' ? 'Sırayı Ayarla' : 'Arrange Order'}
              </h2>
              <p className="mt-2 max-w-[400px] text-sm text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr'
                  ? 'Sayfalar önce 1. dosyadan, sonra 2. dosyadan alınarak sırayla birleştirilecek.'
                  : 'Pages will be alternated starting with the 1st file, then the 2nd file.'}
              </p>
              
              <div className="mt-8 flex w-full max-w-[400px] flex-col gap-4 text-left relative">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">1. {t.lang === 'tr' ? 'Dosya' : 'File'}</span>
                  <FileChip
                    name={files[0]!.file.name}
                    status="valid"
                    onRemove={() => removeFile(files[0]!.id)}
                    t={t}
                  />
                </div>
                
                <div className="flex justify-center -my-2 z-10">
                  <button 
                    onClick={swapFiles}
                    className="p-2 bg-surface dark:bg-surface-dark border rounded-full shadow-sm hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-transform hover:scale-105"
                    title={t.lang === 'tr' ? 'Yer değiştir' : 'Swap files'}
                  >
                    <ArrowRightLeft className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">2. {t.lang === 'tr' ? 'Dosya' : 'File'}</span>
                  <FileChip
                    name={files[1]!.file.name}
                    status="valid"
                    onRemove={() => removeFile(files[1]!.id)}
                    t={t}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t bg-bg/50 p-4 sm:flex-row sm:items-center dark:bg-bg-dark/50">
              <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={processFile} className="w-full sm:w-auto">
                {t.lang === 'tr' ? "PDF'leri Karıştır" : 'Mix PDFs'}
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
            if (result.output) triggerDownload(result.output, result.outputName || 'mixed.pdf');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast toast={toast} onClear={() => setToast(null)} />}
    </div>
  );
}
