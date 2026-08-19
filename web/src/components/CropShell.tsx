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
import { Crop, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function CropShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);

  // Crop box state (fractions 0 to 1)
  const [cropBox, setCropBox] = useState({ xFrac: 0.1, yFrac: 0.1, widthFrac: 0.8, heightFrac: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl', 'tr', 'bl', 'br', or null

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; box: typeof cropBox } | null>(null);

  const controllerRef = useRef<JobController | null>(null);
  const getController = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setTotalPages(pageCount);
          setPreviewPageNum(1); // Default to first page
        },
        onFatal: () => {
          setToast({ kind: 'error', message: 'Worker failed — try reloading the page' });
        },
        onUnavailable: () => {
          setToast({ kind: 'error', message: 'Preview unavailable — worker disabled' });
        },
      });
    }
    return controllerRef.current;
  }, []);

  useEffect(() => {
    return () => controllerRef.current?.dispose();
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
    void getController().inspect('crop1', f);
    setPhase('options');
  }, [t, getController]);

  // Load preview image
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;
    setIsLoadingPreview(true);
    getController()
      .previewPage(file, previewPageNum, 400)
      .then((blob) => {
        if (active) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setIsLoadingPreview(false);
        }
      })
      .catch(() => {
        if (active) setIsLoadingPreview(false);
      });
    return () => { active = false; };
  }, [file, previewPageNum, phase, getController]);

  // --- Drag and Resize Logic ---
  const getMouseFrac = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    if (!previewContainerRef.current) return { xFrac: 0, yFrac: 0 };
    const rect = previewContainerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    const xFrac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const yFrac = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return { xFrac, yFrac };
  };

  const handleBoxMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const { xFrac, yFrac } = getMouseFrac(e);
    dragStartRef.current = { x: xFrac, y: yFrac, box: { ...cropBox } };
  };

  const handleResizeMouseDown = (handle: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    const { xFrac, yFrac } = getMouseFrac(e);
    dragStartRef.current = { x: xFrac, y: yFrac, box: { ...cropBox } };
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return;
      if (!dragStartRef.current) return;

      const { xFrac, yFrac } = getMouseFrac(e);
      const dx = xFrac - dragStartRef.current.x;
      const dy = yFrac - dragStartRef.current.y;
      const startBox = dragStartRef.current.box;

      if (isDragging) {
        let newX = startBox.xFrac + dx;
        let newY = startBox.yFrac + dy;
        newX = Math.max(0, Math.min(1 - startBox.widthFrac, newX));
        newY = Math.max(0, Math.min(1 - startBox.heightFrac, newY));
        setCropBox((prev) => ({ ...prev, xFrac: newX, yFrac: newY }));
      } else if (isResizing) {
        let newX = startBox.xFrac;
        let newY = startBox.yFrac;
        let newW = startBox.widthFrac;
        let newH = startBox.heightFrac;

        if (isResizing.includes('l')) {
          const delta = Math.max(-startBox.xFrac, Math.min(startBox.widthFrac - 0.05, dx));
          newX += delta;
          newW -= delta;
        }
        if (isResizing.includes('r')) {
          newW = Math.max(0.05, Math.min(1 - startBox.xFrac, startBox.widthFrac + dx));
        }
        if (isResizing.includes('t')) {
          const delta = Math.max(-startBox.yFrac, Math.min(startBox.heightFrac - 0.05, dy));
          newY += delta;
          newH -= delta;
        }
        if (isResizing.includes('b')) {
          newH = Math.max(0.05, Math.min(1 - startBox.yFrac, startBox.heightFrac + dy));
        }

        setCropBox({ xFrac: newX, yFrac: newY, widthFrac: newW, heightFrac: newH });
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      dragStartRef.current = null;
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('touchend', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, isResizing]);

  const processPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        // pdf-lib's origin is bottom-left
        const x = cropBox.xFrac * width;
        const y = (1 - cropBox.yFrac - cropBox.heightFrac) * height;
        const w = cropBox.widthFrac * width;
        const h = cropBox.heightFrac * height;

        page.setCropBox(x, y, w, h);
        page.setMediaBox(x, y, w, h);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newName = file.name.replace(/\.pdf$/i, '') + '-cropped.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: t.corruptFile });
      }
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
    setCropBox({ xFrac: 0.1, yFrac: 0.1, widthFrac: 0.8, heightFrac: 0.8 });
    setPreviewPageNum(1);
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

      {phase === 'options' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'PDF Önizleme ve Kırpma Alanı' : 'PDF Preview & Crop Area'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={previewPageNum <= 1}
                  onClick={() => setPreviewPageNum((p) => Math.max(1, p - 1))}
                >
                  &larr;
                </Button>
                <span className="text-xs font-medium">
                  {t.lang === 'tr' ? `Sayfa ${previewPageNum} / ${totalPages}` : `Page ${previewPageNum} / ${totalPages}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={previewPageNum >= totalPages}
                  onClick={() => setPreviewPageNum((p) => Math.min(totalPages, p + 1))}
                >
                  &rarr;
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center bg-surface-2 dark:bg-surface-2-dark rounded border border-ink-muted/20 dark:border-ink-muted-dark/20 p-4 overflow-hidden min-h-[400px]">
              {isLoadingPreview && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 text-xs text-white font-medium">
                  {t.lang === 'tr' ? 'Sayfa önizlemesi yükleniyor...' : 'Loading page preview...'}
                </div>
              )}
              {previewUrl ? (
                <div
                  ref={previewContainerRef}
                  className="relative shadow-lg bg-white select-none inline-block max-w-full touch-none"
                >
                  <img src={previewUrl} alt="PDF Page Preview" className="max-h-[600px] w-auto block pointer-events-none" draggable={false} />
                  
                  {/* The dark overlay outside crop box */}
                  <div className="absolute inset-0 pointer-events-none z-10" style={{
                    boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`,
                    clipPath: `polygon(
                      0% 0%, 0% 100%, ${cropBox.xFrac * 100}% 100%, ${cropBox.xFrac * 100}% ${cropBox.yFrac * 100}%, 
                      ${(cropBox.xFrac + cropBox.widthFrac) * 100}% ${cropBox.yFrac * 100}%, ${(cropBox.xFrac + cropBox.widthFrac) * 100}% ${(cropBox.yFrac + cropBox.heightFrac) * 100}%, 
                      ${cropBox.xFrac * 100}% ${(cropBox.yFrac + cropBox.heightFrac) * 100}%, ${cropBox.xFrac * 100}% 100%, 100% 100%, 100% 0%
                    )`
                  }} />

                  {/* The Crop Box */}
                  <div
                    className="absolute z-20 cursor-move"
                    style={{
                      left: `${cropBox.xFrac * 100}%`,
                      top: `${cropBox.yFrac * 100}%`,
                      width: `${cropBox.widthFrac * 100}%`,
                      height: `${cropBox.heightFrac * 100}%`,
                      border: '2px dashed #e8b65f',
                    }}
                    onMouseDown={handleBoxMouseDown}
                    onTouchStart={handleBoxMouseDown}
                  >
                    {/* Handles */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber dark:bg-amber-dark rounded-full cursor-nwse-resize" onMouseDown={(e) => handleResizeMouseDown('tl', e)} onTouchStart={(e) => handleResizeMouseDown('tl', e)} />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber dark:bg-amber-dark rounded-full cursor-nesw-resize" onMouseDown={(e) => handleResizeMouseDown('tr', e)} onTouchStart={(e) => handleResizeMouseDown('tr', e)} />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber dark:bg-amber-dark rounded-full cursor-nesw-resize" onMouseDown={(e) => handleResizeMouseDown('bl', e)} onTouchStart={(e) => handleResizeMouseDown('bl', e)} />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber dark:bg-amber-dark rounded-full cursor-nwse-resize" onMouseDown={(e) => handleResizeMouseDown('br', e)} onTouchStart={(e) => handleResizeMouseDown('br', e)} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-ink-muted min-h-[250px]">
                  {t.lang === 'tr' ? 'Önizleme hazırlanamadı' : 'Preview not available'}
                </div>
              )}
            </div>
            <span className="text-[11px] text-center text-ink-muted dark:text-ink-muted-dark">
              {t.lang === 'tr'
                ? '💡 İpucu: Kırpma kutusunu köşelerinden tutarak yeniden boyutlandırabilir veya sürükleyerek taşıyabilirsiniz.'
                : '💡 Tip: Drag the corners to resize the crop area, or click inside to move it.'}
            </span>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-ink dark:text-ink-dark">
                {t.lang === 'tr' ? 'Kırpılacak Alanı Seçtiniz mi?' : 'Ready to Crop?'}
              </span>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr'
                  ? 'Seçtiğiniz alan PDF belgesindeki tüm sayfalara uygulanacaktır.'
                  : 'The selected crop area will be applied to all pages in the document.'}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Button variant="ghost" onClick={reset}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={processPdf} icon={<Crop className="h-4 w-4" />}>
                {t.lang === 'tr' ? 'Kırp (Crop)' : 'Crop PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-20 duration-500">
          <RefreshCw className="h-10 w-10 animate-spin text-amber" />
          <h2 className="mt-6 text-xl font-semibold">{t.converting || 'Processing...'}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t.lang === 'tr' ? 'PDF kırpılıyor...' : 'Cropping PDF...'}
          </p>
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
            onDownload={handleDownload}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
