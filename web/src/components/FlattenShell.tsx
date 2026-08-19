import { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import { flattenPdf, type FlattenPdfOptions } from '../engine/flattenPdf';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Layers, CheckSquare, Square, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function FlattenShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; hadForm: boolean } | null>(null);
  const [removeAnnotations, setRemoveAnnotations] = useState(true);

  const addFile = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setToast({ kind: 'error', message: t.notPdf });
      return;
    }
    setFile(f);
    setPhase('options');
  }, [t]);

  const handleFlatten = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));

      const res = await flattenPdf(file, { removeAnnotations });

      setOutput({
        blob: res.output,
        name: res.outputName,
        hadForm: res.hadForm,
      });
      setPhase('done');
    } catch (err: any) {
      console.error('Flatten PDF failed:', err);
      setToast({
        kind: 'error',
        message: err?.message === 'ENCRYPTED_PDF_UNSUPPORTED'
          ? (t.lang === 'tr' ? 'Şifreli PDF dosyaları desteklenmiyor.' : 'Encrypted PDF files are not supported.')
          : (t.lang === 'tr' ? 'PDF düzleştirilemedi, dosya bozuk olabilir.' : 'Failed to flatten PDF, file may be corrupted.'),
      });
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber/30 bg-surface p-4 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)] min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeAnnotations}
                onChange={(e) => setRemoveAnnotations(e.target.checked)}
                className="sr-only"
              />
              <div className="text-amber dark:text-amber-dark">
                {removeAnnotations ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5 text-ink-muted" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {t.lang === 'tr' ? 'Açıklama ve notları da düzleştir' : 'Flatten annotations and notes'}
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                  {t.lang === 'tr'
                    ? 'Form alanlarına ek olarak yorum ve çizimleri de sabit katman haline getirir.'
                    : 'In addition to form fields, converts comments and highlights into static content.'}
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={handleFlatten} disabled={isProcessing}>
              {t.lang === 'tr' ? 'PDF\'i Düzleştir' : 'Flatten PDF'}
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || 'Processing...'}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
        </div>
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
              output: output?.blob,
              outputName: output?.name,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (output) triggerDownload(output.blob, output.name); }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
