import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { JobController } from '../app/JobController';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { BookOpen, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function BookletShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const controllerRef = useRef<JobController | null>(null);
  const getController = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setTotalPages(pageCount);
        },
        onFatal: () => {
          setToast({ kind: 'error', message: 'Worker failed — try reloading the page' });
        },
      });
    }
    return controllerRef.current;
  }, []);

  useEffect(() => {
    return () => controllerRef.current?.dispose();
  }, []);

  const addFile = async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const v = await validatePdfFile(f);
    if (!v.ok) {
      setToast({ kind: 'error', message: v.reason || 'Invalid PDF file' });
      return;
    }
    setFile(f);
    setPhase('options');
    
    // Use worker to get page count, but we will process natively in main thread via pdf-lib
    const ctrl = getController();
    ctrl.inspectPdf('preview', f);
  };

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const originalCount = pages.length;

      // Padded to multiple of 4
      const paddedCount = Math.ceil(originalCount / 4) * 4;
      const firstPageSize = pages[0] ? pages[0].getSize() : { width: 595.28, height: 841.89 };
      const w = firstPageSize.width;
      const h = firstPageSize.height;

      const outDoc = await PDFDocument.create();
      const embeddedPages = await outDoc.embedPdf(arrayBuffer);

      for (let i = 0; i < paddedCount / 4; i++) {
        // Front Sheet
        const pFront = outDoc.addPage([w * 2, h]);
        const leftFrontIdx = paddedCount - 1 - 2 * i;
        const rightFrontIdx = 2 * i;
        
        if (leftFrontIdx < originalCount) {
          pFront.drawPage(embeddedPages[leftFrontIdx], { x: 0, y: 0, width: w, height: h });
        }
        if (rightFrontIdx < originalCount) {
          pFront.drawPage(embeddedPages[rightFrontIdx], { x: w, y: 0, width: w, height: h });
        }

        // Back Sheet
        const pBack = outDoc.addPage([w * 2, h]);
        const leftBackIdx = 2 * i + 1;
        const rightBackIdx = paddedCount - 2 - 2 * i;
        
        if (leftBackIdx < originalCount) {
          pBack.drawPage(embeddedPages[leftBackIdx], { x: 0, y: 0, width: w, height: h });
        }
        if (rightBackIdx < originalCount) {
          pBack.drawPage(embeddedPages[rightBackIdx], { x: w, y: 0, width: w, height: h });
        }
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newName = file.name.replace(/\.pdf$/i, '') + '-booklet.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err) {
      console.error(err);
      setToast({ kind: 'error', message: 'Failed to create booklet' });
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (output) triggerDownload(output.blob, output.name);
  };

  const reset = () => {
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
  };

  return (
    <div className="w-full">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'upload' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DropZone onFiles={addFile} multiple={false} accept=".pdf" t={t} />
          <div className="mt-6">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'options' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
          <div className="flex flex-col items-center gap-6 rounded-2xl border  bg-white p-8 text-center shadow-sm dark: dark:bg-zinc-900/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <BookOpen className="h-8 w-8" />
            </div>
            
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-medium text-ink dark:text-ink-dark">
                Ready to create booklet
              </h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                {file.name} ({totalPages} pages)
              </p>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                This will arrange your {totalPages} pages into a {Math.ceil(totalPages / 4)} sheet booklet layout.
                You will need to print the result double-sided (short-edge binding) and fold it in half.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={reset}
                className="min-w-[140px]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={processPdf}
                disabled={isProcessing}
                className="min-w-[140px]"
              >
                {isProcessing ? 'Processing...' : 'Create Booklet'}
              </Button>
            </div>
          </div>
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.lang === 'tr' ? 'Kitapçık düzeni oluşturuluyor...' : 'Creating Booklet...'} />
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
            onDownload={handleDownload}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
