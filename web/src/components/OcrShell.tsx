import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ScanText, Download, RefreshCw, Copy } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import Tesseract from 'tesseract.js';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function OcrShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useState<string>('');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);

  const controllerRef = useRef<JobController | null>(null);
  const getController = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onFatal: () => setToast({ kind: 'error', message: 'Worker failed — try reloading the page' }),
      });
    }
    return controllerRef.current;
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.dispose();
    };
  }, []);

  const addFile = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    
    // We allow images and PDFs
    if (f.type === 'application/pdf') {
      const v = await validatePdfFile(f);
      if (!v.ok) { setToast({ kind: 'error', message: v.reason || 'Invalid PDF' }); return; }
    } else if (!f.type.startsWith('image/')) {
      setToast({ kind: 'error', message: 'Only PDF and images are supported.' });
      return;
    }

    setFile(f);
    processFile(f);
  };

  const processFile = async (f: File) => {
    setPhase('processing');
    setExtractedText('');
    setProgressMsg('Loading AI Engine...');
    setProgressPct(0);

    try {
      let fullText = '';
      
      const logger = (m: any) => {
        if (m.status === 'recognizing text') {
          setProgressPct(Math.round(m.progress * 100));
          setProgressMsg(`Recognizing text... ${Math.round(m.progress * 100)}%`);
        } else if (m.status === 'loading tesseract core') {
          setProgressMsg('Loading Tesseract Core (one-time)...');
        } else if (m.status === 'loading language traineddata') {
          setProgressMsg(`Downloading AI language model (one-time)... ${Math.round(m.progress * 100)}%`);
        } else {
          setProgressMsg(m.status);
        }
      };

      if (f.type.startsWith('image/')) {
        // Direct image OCR
        const result = await Tesseract.recognize(f, 'eng+tur', { logger });
        fullText = result.data.text;
      } else {
        // PDF OCR - process page by page
        setProgressMsg('Reading PDF pages...');
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await f.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const totalPages = pdfDoc.getPageCount();

        const ctrl = getController();
        
        for (let i = 1; i <= totalPages; i++) {
          setProgressMsg(`Rasterizing page ${i} of ${totalPages}...`);
          // 200 DPI gives decent OCR accuracy without being too slow
          const blob = await ctrl.previewPage(f, i, 200);
          
          setProgressMsg(`Running OCR on page ${i} of ${totalPages}...`);
          const result = await Tesseract.recognize(blob, 'eng+tur', { logger });
          
          fullText += `--- Page ${i} ---\n\n`;
          fullText += result.data.text + '\n\n';
        }
      }

      setExtractedText(fullText.trim());
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: err?.message || 'Failed to extract text. Check console for details.' });
      setErrorMsg(null);
    setPhase('upload');
    }
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const newName = file.name.replace(/\.[^/.]+$/, "") + '-ocr.txt';
    triggerDownload(blob, newName);
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setToast({ kind: 'success', message: t.lang === 'tr' ? 'Panoya kopyalandı!' : 'Copied to clipboard!' });
    });
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setErrorMsg(null);
    setPhase('upload');
  };

  return (
    <div className="w-full">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'upload' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DropZone onFiles={addFile} multiple={false} accept=".pdf,.png,.jpg,.jpeg" t={t} />
          <p className="mt-2 text-center text-sm text-ink-muted dark:text-ink-muted-dark">
            {t.lang === 'tr' ? 'PDF veya Resim dosyalarını destekler (JPG, PNG)' : 'Supports PDF or Image files (JPG, PNG)'}
          </p>
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          label={progressMsg || (t.lang === 'tr' ? 'Yapay zeka ile metin taranıyor...' : 'Extracting text via AI...')}
          progressPercent={progressPct}
        />
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
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

          <div className="relative flex flex-col overflow-hidden rounded-xl border  bg-white shadow-sm dark: dark:bg-zinc-900/50">
            <div className="flex items-center justify-between border-b  bg-zinc-50 px-4 py-2 dark: dark:bg-zinc-900/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'OCR SONUÇLARI' : 'OCR RESULTS'}
              </span>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium" onClick={handleCopy}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {t.lang === 'tr' ? 'Kopyala' : 'Copy Text'}
              </Button>
            </div>
            <textarea
              className="w-full resize-y min-h-[400px] p-4 text-sm font-mono text-zinc-800 bg-transparent focus:outline-none dark:text-zinc-200"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder={t.lang === 'tr' ? 'Metin bulunamadı...' : 'No text found...'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
