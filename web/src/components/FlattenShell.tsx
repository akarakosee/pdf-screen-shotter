import { useCallback, useEffect, useRef, useState } from 'react';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import { flattenPdf } from '../engine/flattenPdf';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Layers, CheckSquare, Square } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function FlattenShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; hadForm: boolean } | null>(null);
  const [removeAnnotations, setRemoveAnnotations] = useState(true);
  const [progressPct, setProgressPct] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const isTr = t.tagline ? t.tagline.includes('gizli') : (t.lang === 'tr');

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    setFile(f);
    setOutput(null);
    setErrorMsg(null);
    setPhase('options');
  }, [t]);

  const handleFlatten = async () => {
    if (!file || phase === 'processing') return;
    setPhase('processing');
    setProgressPct(15);
    clearTimer();
    timerRef.current = setInterval(() => {
      setProgressPct((prev) => {
        if (prev < 40) return prev + 12;
        if (prev < 75) return prev + 7;
        if (prev < 90) return prev + 3;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 120);

    try {
      // Yield to paint the progress animation smoothly
      await new Promise((r) => setTimeout(r, 450));

      const res = await flattenPdf(file, { removeAnnotations });

      clearTimer();
      setProgressPct(100);
      await new Promise((r) => setTimeout(r, 200));

      setOutput({
        blob: res.output,
        name: res.outputName,
        hadForm: res.hadForm,
      });
      setPhase('done');
    } catch (err: any) {
      clearTimer();
      console.error('Flatten PDF failed:', err);
      if (err?.message === 'ENCRYPTED_PDF_UNSUPPORTED' || err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: isTr ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: isTr ? 'PDF düzleştirilemedi, dosya bozuk olabilir.' : 'Failed to flatten PDF, file may be corrupted.' });
      }
      setPhase('options');
    }
  };

  const reset = useCallback(() => {
    clearTimer();
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setProgressPct(0);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Toast notification */}
      {toast && (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Upload Phase */}
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Options Phase */}
      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
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
                  {isTr ? 'Açıklama ve notları da düzleştir' : 'Flatten annotations and notes'}
                </span>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                  {isTr
                    ? 'Form alanlarına ek olarak yorum ve çizimleri de sabit katman haline getirir.'
                    : 'In addition to form fields, converts comments and highlights into static content.'}
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button variant="ghost" onClick={reset} className="text-xs">
              {isTr ? 'Değiştir' : 'Change file'}
            </Button>
            <Button onClick={handleFlatten}>
              {isTr ? 'PDF\'i Düzleştir' : 'Flatten PDF'}
            </Button>
          </div>
        </div>
      )}

      {/* Processing Phase - Standard frameless progress panel with percentage */}
      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || (isTr ? 'PDF formları ve katmanları düzleştiriliyor...' : 'Flattening form fields and layers...')}
          progressPercent={progressPct}
        />
      )}

      {/* Done Phase - Standard GoSecurePDF ResultPanel */}
      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={output ? {
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: output.blob,
              outputName: output.name,
              cancelled: false
            } : null}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (output) triggerDownload(output.blob, output.name); }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
