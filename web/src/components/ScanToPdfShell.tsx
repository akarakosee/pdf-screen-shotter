import { useCallback, useEffect, useState, useRef } from 'react';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import { JobController } from '../app/JobController';
import { Camera, StopCircle, Aperture, X } from 'lucide-react';

type Phase = 'camera' | 'processing' | 'done';

export function ScanToPdfShell({ t = en }: { t?: Strings }) {
  const [phase, setPhase] = useState<Phase>('camera');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const [images, setImages] = useState<File[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onScanToPdfDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('camera');
          setToast({ kind: 'error', message: 'Failed to create PDF.' });
        }
      }
    });
    return () => {
      controller.current?.dispose();
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setToast({ kind: 'error', message: 'Camera access denied or not available.' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (phase === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [phase]);

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `scanned_page_${images.length + 1}.jpg`, { type: 'image/jpeg' });
        setImages(prev => [...prev, file]);
      }
    }, 'image/jpeg', 0.9);
  };

  const generatePDF = () => {
    if (images.length === 0) return;
    setPhase('processing');
    controller.current?.runScanToPdf(images, 'Scanned_Document.pdf');
  };

  const reset = () => {
    setImages([]);
    setOutput(null);
    setPhase('camera');
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'camera' && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-surface p-4 shadow-sm sm:p-6 dark:bg-surface-dark">
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
            <button 
              onClick={captureFrame} 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform active:scale-90"
              aria-label="Capture"
            >
              <Aperture className="h-8 w-8" />
            </button>
          </div>
          
          <div className="flex w-full flex-col gap-4">
            {images.length > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3 text-sm dark:bg-surface-dark-alt">
                <span className="font-medium text-ink dark:text-ink-dark">{images.length} pages captured</span>
                <button 
                  onClick={generatePDF}
                  className="rounded-lg bg-brand px-4 py-2 font-medium text-white hover:bg-brand-hover active:scale-95"
                >
                  Generate PDF
                </button>
              </div>
            )}
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.converting || 'Generating PDF...'} />
      )}

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in flex flex-col items-center justify-center py-8">
          <ResultPanel
            errorMsg={errorMsg} t={t} result={output ? { totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: output.blob, outputName: output.name, cancelled: false } : null} skipped={[]} crossLink={null} onDownload={() => output && triggerDownload(output.blob, output.name)} onConvertMore={reset} />
        </div>
      )}
    </div>
  );
}
