import { useCallback, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Eraser, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function SanitizeShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    setFile(f);
    setPhase('options');
  }, [t]);

  const sanitizePdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      // Yield to React to paint the processing state
      await new Promise((r) => setTimeout(r, 50));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Clear all possible metadata
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      const emptyDate = new Date(0);
      pdfDoc.setCreationDate(emptyDate);
      pdfDoc.setModificationDate(emptyDate);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const newName = file.name.replace(/\.pdf$/i, '') + '-sanitized.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: t.corruptFile || 'Failed to sanitize PDF.' });
      }
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
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Eraser className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="mt-1 text-sm text-ink-muted dark:text-ink-muted-dark">
              {t.lang === 'tr'
                ? 'Bu işlem belgenizdeki yazar adını, oluşturulma tarihini, kullanılan program bilgisini ve tüm gizli meta verileri kalıcı olarak silecektir.'
                : 'This action will permanently delete the author name, creation date, software used, and all hidden metadata from your document.'}
            </p>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={sanitizePdf} disabled={isProcessing}>
              {t.lang === 'tr' ? 'Meta Verileri Temizle' : 'Sanitize PDF'}
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
