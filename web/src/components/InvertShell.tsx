import { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { MuPdfEngine } from '../engine/MuPdfEngine';
import { buildPdfFromImages } from '../engine/imgToPdf';
import { ProgressPanel } from './ProgressPanel';
import { Download, RefreshCw, Moon } from 'lucide-react';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function InvertShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const invertColors = async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const file = incoming[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setToast({ kind: 'error', message: t.notPdf });
      return;
    }

    setPhase('processing');
    setIsProcessing(true);
    setProgress(0);

    try {
      await new Promise(r => setTimeout(r, 50));
      const arrayBuffer = await file.arrayBuffer();
      const engine = new MuPdfEngine();
      await engine.init();
      const doc = await engine.openDocument(new Uint8Array(arrayBuffer));
      
      const numPages = await doc.countPages();
      const invertedImages: File[] = [];

      for (let i = 1; i <= numPages; i++) {
        // High DPI rendering for quality
        const pixmap = await doc.renderPage(i, 200);
        
        // The pixmap provides raw pixels in RGBA
        const imgData = new ImageData(
          new Uint8ClampedArray(pixmap.pixels.buffer, pixmap.pixels.byteOffset, pixmap.pixels.byteLength), 
          pixmap.width, 
          pixmap.height
        );
        
        // Invert the pixels (ignoring alpha)
        const data = imgData.data;
        for (let p = 0; p < data.length; p += 4) {
          data[p] = 255 - data[p];     // R
          data[p+1] = 255 - data[p+1]; // G
          data[p+2] = 255 - data[p+2]; // B
          // keep Alpha as is
        }

        const canvas = new OffscreenCanvas(pixmap.width, pixmap.height);
        const ctx = canvas.getContext('2d')!;
        ctx.putImageData(imgData, 0, 0);

        const blob = await canvas.convertToBlob({ type: 'image/png' });
        invertedImages.push(new File([blob], `page_${i}.png`, { type: 'image/png' }));
        
        pixmap.destroy();
        setProgress(Math.round((i / numPages) * 100));
        await new Promise(r => setTimeout(r, 5));
      }
      
      doc.destroy();
      
      // Rebuild PDF
      const pdfResult = await buildPdfFromImages(invertedImages, {
        pageSize: 'fit',
        orientation: 'auto',
        marginPt: 0
      });
      
      const outName = file.name.replace(/\.[^/.]+$/, "") + "_inverted.pdf";
      setOutput({ blob: pdfResult.output, name: outName });
      triggerDownload(pdfResult.output, outName);
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: err.message || t.errorGeneric });
      setPhase('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPhase('upload');
    setOutput(null);
    setProgress(0);
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={invertColors} accept=".pdf" multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'processing' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProgressPanel progress={progress} text="Inverting colors..." />
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
            <Moon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Done!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">Your dark mode PDF is ready.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => triggerDownload(output.blob, output.name)} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Again
            </Button>
            <Button variant="secondary" onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Invert Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
