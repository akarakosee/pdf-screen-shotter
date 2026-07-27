import { useCallback, useState } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Stamp, Check, Download, RefreshCw } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

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

  const addWatermark = async () => {
    if (!file || !watermarkText.trim()) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      // Yield to React to paint the processing state
      await new Promise((r) => setTimeout(r, 50));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const { dataUrl, width: imgW, height: imgH } = await createWatermarkPng(watermarkText);
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
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: err?.message || 'Failed to add watermark.' });
      }
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setWatermarkText('CONFIDENTIAL');
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <>
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </>
      )}

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
              {t.lang === 'tr' ? 'Filigran Metni' : 'Watermark Text'}
            </label>
            <input
              id="watermark-input"
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="h-11 w-full rounded-lg border bg-bg px-3 text-sm focus:border-amber focus:outline-none dark:bg-bg-dark"
              placeholder={t.lang === 'tr' ? 'Örn: GİZLİDİR' : 'e.g. CONFIDENTIAL'}
            />
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={addWatermark} disabled={isProcessing || !watermarkText.trim()}>
              {t.lang === 'tr' ? 'Filigran Ekle' : 'Add Watermark'}
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
            <div className="h-full w-full origin-left animate-custom-pulse bg-ink dark:bg-ink-dark" />
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="phase-enter flex flex-col gap-5 rounded-2xl border border-amber/30 bg-surface p-6 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
          <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success dark:text-success">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">
                {t.lang === 'tr' ? 'Filigran Başarıyla Eklendi!' : 'Watermark Successfully Added!'}
              </h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'PDF belgeniz damgalandı ve indirmeye hazır.' : 'Your PDF has been stamped and is ready for download.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="ghost" onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t.lang === 'tr' ? 'Yeni Dosya Seç' : 'Watermark Another PDF'}
              </Button>
              <Button variant="primary" onClick={() => triggerDownload(output.blob, output.name)} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t.lang === 'tr' ? 'Damgalı PDF İndir' : 'Download Watermarked PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
