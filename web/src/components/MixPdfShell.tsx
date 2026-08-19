import { useCallback, useEffect, useRef, useState } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function MixPdfShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [files, setFiles] = useState<[File, File] | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
    setPhase('upload');
      },
      onMixPdfDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
    const errMsg = t.corruptFile;
          setErrorMsg(errMsg);
          setToast({ kind: 'error', message: errMsg });
          setPhase('done');
        }
      },
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t]);

  const addFiles = useCallback(async (incoming: File[]) => {
    if (incoming.length < 2) {
      setToast({ kind: 'error', message: 'Please upload exactly 2 PDF files.' });
      return;
    }
    const f1 = incoming[0];
    const f2 = incoming[1];
    for (const f of [f1, f2]) {
      const rejection = await validatePdfFile(f);
      if (rejection) {
        setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
        return;
      }
    }
    setFiles([f1, f2]);
    setPhase('processing');
    controller.current?.runMixPdf(f1, f2);
  }, [t]);

  const reset = useCallback(() => {
    setFiles(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} multiple={true} />
          <p className="px-2 text-xs text-ink-muted dark:text-ink-muted-dark">
            Upload 2 PDF files — alternating pages from each will be merged into one document.
          </p>
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>Mixing pages…</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg border bg-surface dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
          <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
            Alternating pages from both PDFs into a single document.
          </p>
        </div>
      )}

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={output ? { totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: output.blob, outputName: output.name, cancelled: false } : null}
            skipped={[]}
            crossLink={null}
            onDownload={() => output && triggerDownload(output.blob, output.name)}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
