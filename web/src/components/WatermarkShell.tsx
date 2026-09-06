import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Stamp } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

async function createWatermarkPng(text: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve({ dataUrl: '', width: 0, height: 0 });
      return;
    }

    const fontSize = 80;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const metrics = ctx.measureText(text);
    const textWidth = Math.max(100, Math.ceil(metrics.width));
    const textHeight = Math.ceil(fontSize * 1.5);

    const padX = 40;
    const padY = 20;
    canvas.width = textWidth + padX * 2;
    canvas.height = textHeight + padY * 2;

    ctx.font = `bold ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgb(180, 180, 180)';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    resolve({
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    });
  });
}

interface Props {
  t?: Strings;
}

export function WatermarkShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
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

  const addWatermark = async () => {
    if (!file || !watermarkText.trim() || phase === 'processing') return;
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
      // Yield to let the browser paint the progress animation smoothly
      await new Promise((r) => setTimeout(r, 450));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      const { dataUrl, width: imgW, height: imgH } = await createWatermarkPng(watermarkText.trim());
      const pngImage = await pdfDoc.embedPng(dataUrl);

      for (const page of pages) {
        const { width, height } = page.getSize();
        const targetWidth = Math.min(width, height) * 0.85;
        const scale = targetWidth / Math.max(1, imgW);
        const drawW = imgW * scale;
        const drawH = imgH * scale;

        const angle = Math.PI / 4; // 45 deg
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const dx = (drawW / 2) * cos - (drawH / 2) * sin;
        const dy = (drawW / 2) * sin + (drawH / 2) * cos;

        page.drawImage(pngImage, {
          x: (width / 2) - dx,
          y: (height / 2) - dy,
          width: drawW,
          height: drawH,
          opacity: 0.45,
          rotate: degrees(45),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const newName = file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf';
      
      clearTimer();
      setProgressPct(100);
      await new Promise((r) => setTimeout(r, 200));

      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      clearTimer();
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: isTr ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: err?.message || (isTr ? 'Filigran eklenirken hata oluştu.' : 'Failed to add watermark.') });
      }
      setPhase('options');
    }
  };

  const reset = useCallback(() => {
    clearTimer();
    setFile(null);
    setOutput(null);
    setWatermarkText(isTr ? 'GİZLİDİR' : 'CONFIDENTIAL');
    setErrorMsg(null);
    setProgressPct(0);
    setPhase('upload');
  }, [isTr]);

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
              <Stamp className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label htmlFor="watermark-input" className="text-sm font-medium">
              {isTr ? 'Filigran Metni' : 'Watermark Text'}
            </label>
            <input
              id="watermark-input"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="h-11 w-full rounded-lg border bg-bg px-3 text-sm focus:border-amber focus:outline-none dark:bg-bg-dark"
              placeholder={isTr ? 'Örn: GİZLİDİR' : 'e.g. CONFIDENTIAL'}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button variant="ghost" onClick={reset} className="text-xs">
              {isTr ? 'Değiştir' : 'Change file'}
            </Button>
            <Button onClick={addWatermark} disabled={!watermarkText.trim()}>
              {isTr ? 'Filigran Ekle' : 'Add Watermark'}
            </Button>
          </div>
        </div>
      )}

      {/* Processing Phase - Standard frameless progress panel with percentage */}
      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || (isTr ? 'Filigran belgenize damgalanıyor...' : 'Applying watermark to your document...')}
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
