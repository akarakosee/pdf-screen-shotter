import React, { useCallback, useRef, useState, useEffect } from 'react';
import { triggerDownload } from '../app/download';
import { buildPdfFromImages } from '../engine/imgToPdf';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Toast, type ToastData } from './Toast';
import { ProgressPanel } from './ProgressPanel';
import { ResultPanel } from './ResultPanel';
import { Camera, Check, X, SwitchCamera, Trash2 } from 'lucide-react';

type Phase = 'capture' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function ScanShell({ t = en, desktopAppUrl }: Props) {
  const [phase, setPhase] = useState<Phase>('capture');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [images, setImages] = useState<{ id: string; blob: Blob; url: string }[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [durationMs, setDurationMs] = useState(0);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (e) {
      console.error('Camera error', e);
      setToast({ kind: 'error', message: 'Could not access camera. Please check permissions.' });
    }
  }, [facingMode]);

  useEffect(() => {
    if (phase === 'capture') {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [phase, facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setImages((prev) => [...prev, { id: Math.random().toString(36).slice(2), blob, url }]);
    }, 'image/jpeg', 0.9);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx !== -1) URL.revokeObjectURL(prev[idx].url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setPhase('processing');
    setIsProcessing(true);

    try {
      // Yield to let UI update
      await new Promise((r) => setTimeout(r, 50));
      
      const files = images.map((i, idx) => new File([i.blob], `scanned_page_${idx + 1}.jpg`, { type: 'image/jpeg' }));
      const start = Date.now();
      const res = await buildPdfFromImages(files, { pageSize: 'a4', orientation: 'auto', marginPt: 0 });
      
      setResultBlob(res.output);
      setResultName('scanned_document.pdf');
      setDurationMs(res.durationMs);
      setPhase('done');
    } catch (err) {
      console.error(err);
      setToast({ kind: 'error', message: 'Failed to create PDF.' });
      setPhase('capture');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
    setResultBlob(null);
    setPhase('capture');
  };

  return (
    <div className="flex flex-col gap-5">
      {phase === 'capture' && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm dark:bg-surface-dark">
            <div className="flex flex-col md:flex-row h-full">
              {/* Camera Feed */}
              <div className="relative flex-1 bg-black/5 flex flex-col items-center justify-center p-4 min-h-[300px]">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="max-h-[400px] w-full rounded-xl object-contain bg-black"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute bottom-6 flex gap-4">
                  <button 
                    onClick={toggleCamera}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-lg hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
                  >
                    <SwitchCamera className="h-5 w-5 text-ink dark:text-ink-dark" />
                  </button>
                  <button 
                    onClick={captureFrame}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/20 transition-transform hover:scale-105 active:scale-95 text-white"
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Captured Pages */}
              <div className="flex w-full md:w-64 flex-col border-l border-ink-muted/20 bg-surface dark:border-ink-muted-dark/20 dark:bg-surface-dark">
                <div className="p-4 border-b border-ink-muted/20 dark:border-ink-muted-dark/20">
                  <h3 className="font-semibold text-ink dark:text-ink-dark">Scanned Pages</h3>
                  <p className="text-xs text-ink-muted dark:text-ink-muted-dark">{images.length} pages captured</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[200px] max-h-[400px]">
                  {images.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-ink-muted dark:text-ink-muted-dark">
                      No pages yet. Tap camera to scan.
                    </div>
                  ) : (
                    images.map((img, i) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-ink-muted/20 dark:border-ink-muted-dark/20">
                        <img src={img.url} alt={`Page ${i + 1}`} className="w-full h-auto" />
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-md">
                          {i + 1}
                        </div>
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-danger/80 text-white p-1 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 border-t border-ink-muted/20 dark:border-ink-muted-dark/20">
                  <button
                    disabled={images.length === 0}
                    onClick={convertToPdf}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    Create PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || 'Building PDF...'}
          progressPercent={100} // Deterministic sync operation, just show spinner
          cancelling={false}
          onCancel={() => {}}
        />
      )}

      {phase === 'done' && resultBlob && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={{
              totalPages: images.length,
              succeeded: images.length,
              failed: [],
              durationMs,
              output: resultBlob,
              outputName: resultName,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              triggerDownload(resultBlob, resultName);
            }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
