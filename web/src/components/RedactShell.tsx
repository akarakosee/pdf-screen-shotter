import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { PDFDocument, rgb } from 'pdf-lib';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ShieldAlert, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'editor' | 'processing' | 'done';

interface RectFrac {
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

interface Props {
  t?: Strings;
}

export function RedactShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  // Redactions by page number (1-indexed)
  const [redactions, setRedactions] = useState<Record<number, RectFrac[]>>({});
  
  // Drawing state
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingRect, setDrawingRect] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const isDragging = useRef(false);

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
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  const addFile = async (files: File[]) => {
    if (!files.length) return;
    const v = await validatePdfFile(files[0]);
    if (!v.ok) { setToast({ kind: 'error', message: v.reason || 'Invalid PDF' }); return; }
    
    setFile(files[0]);
    setPhase('editor');
    loadPageCount(files[0]);
  };

  const loadPageCount = async (f: File) => {
    try {
      const buf = await f.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setTotalPages(doc.getPageCount());
      setCurrentPage(1);
      loadImages(1, f);
    } catch (e) {
      setToast({ kind: 'error', message: 'Failed to inspect document' });
      setErrorMsg(null);
    setPhase('upload');
    }
  };

  const loadImages = async (page: number, f = file) => {
    if (!f) return;
    setIsLoadingImages(true);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const ctrl = getController();
    try {
      // 150 DPI for sharp drawing
      const res = await ctrl.previewPage(f, page, 150);
      setBlobUrl(URL.createObjectURL(res));
    } catch (e) {
      setToast({ kind: 'error', message: 'Failed to render page' });
    } finally {
      setIsLoadingImages(false);
    }
  };

  const goPrev = () => {
    if (currentPage > 1) {
      const p = currentPage - 1;
      setCurrentPage(p);
      loadImages(p);
    }
  };

  const goNext = () => {
    if (currentPage < totalPages) {
      const p = currentPage + 1;
      setCurrentPage(p);
      loadImages(p);
    }
  };

  // Drawing interactions
  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDragging.current = true;
    setDrawingRect({ startX: x, startY: y, currentX: x, currentY: y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current || !drawingRect) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setDrawingRect({ ...drawingRect, currentX: x, currentY: y });
  };

  const onPointerUp = () => {
    if (!isDragging.current || !drawingRect || !containerRef.current) return;
    isDragging.current = false;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    const minX = Math.min(drawingRect.startX, drawingRect.currentX);
    const minY = Math.min(drawingRect.startY, drawingRect.currentY);
    const w = Math.abs(drawingRect.currentX - drawingRect.startX);
    const h = Math.abs(drawingRect.currentY - drawingRect.startY);

    // Ignore tiny accidental clicks
    if (w > 5 && h > 5) {
      const newRect: RectFrac = {
        xFrac: minX / rect.width,
        yFrac: minY / rect.height,
        wFrac: w / rect.width,
        hFrac: h / rect.height
      };
      
      setRedactions(prev => {
        const pageRects = prev[currentPage] || [];
        return { ...prev, [currentPage]: [...pageRects, newRect] };
      });
    }
    
    setDrawingRect(null);
  };

  const removeRedaction = (index: number) => {
    setRedactions(prev => {
      const pageRects = prev[currentPage] || [];
      const updated = pageRects.filter((_, i) => i !== index);
      return { ...prev, [currentPage]: updated };
    });
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

      // Apply redactions
      Object.entries(redactions).forEach(([pageStr, rects]) => {
        const pageNum = parseInt(pageStr, 10);
        // Page index in pdf-lib is 0-based
        const page = pages[pageNum - 1];
        if (!page) return;

        const { width, height } = page.getSize();
        
        rects.forEach(rect => {
          // pdf-lib's origin is bottom-left
          const x = rect.xFrac * width;
          const y = (1 - rect.yFrac - rect.hFrac) * height;
          const w = rect.wFrac * width;
          const h = rect.hFrac * height;

          page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            color: rgb(0, 0, 0),
          });
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newName = file.name.replace(/\.pdf$/i, '') + '-redacted.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: t.corruptFile });
      }
      setPhase('editor');
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
    setRedactions({});
    setErrorMsg(null);
    setPhase('upload');
    setCurrentPage(1);
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
  };

  // Helper to render temp rect
  const getTempRectStyle = () => {
    if (!drawingRect) return {};
    const minX = Math.min(drawingRect.startX, drawingRect.currentX);
    const minY = Math.min(drawingRect.startY, drawingRect.currentY);
    const w = Math.abs(drawingRect.currentX - drawingRect.startX);
    const h = Math.abs(drawingRect.currentY - drawingRect.startY);
    return { left: minX, top: minY, width: w, height: h };
  };

  const hasAnyRedactions = Object.values(redactions).some(rects => rects.length > 0);

  return (
    <div className="w-full">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'upload' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DropZone onFiles={addFile} multiple={false} accept=".pdf" t={t} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'editor' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-4 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm">
              <strong>Privacy Warning:</strong> This tool draws black boxes over your content. It does not permanently destroy the underlying text data in the PDF file stream.
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border  bg-white p-4 shadow-sm dark: dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={reset}>
                 <X className="mr-2 h-4 w-4" />
                 Cancel
               </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={currentPage === 1 || isLoadingImages}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={goNext} disabled={currentPage === totalPages || isLoadingImages}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Button onClick={processPdf} disabled={!hasAnyRedactions || isProcessing}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Apply Redactions
            </Button>
          </div>

          {/* Viewer Area */}
          <div className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border  bg-zinc-50/50 dark: dark:bg-zinc-900/20">
            {!blobUrl && (
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Loading preview...</p>
            )}

            {blobUrl && (
              <div 
                className="relative shadow-2xl cursor-crosshair touch-none" 
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                <img src={blobUrl} alt="Page Preview" className="max-h-[80vh] w-auto max-w-full" draggable={false} />
                
                {/* Drawn Redactions for this page */}
                {(redactions[currentPage] || []).map((rect, idx) => (
                  <div
                    key={idx}
                    className="absolute bg-zinc-950/90 group flex items-center justify-center border-2 border-black"
                    style={{
                      left: `${rect.xFrac * 100}%`,
                      top: `${rect.yFrac * 100}%`,
                      width: `${rect.wFrac * 100}%`,
                      height: `${rect.hFrac * 100}%`
                    }}
                  >
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1"
                      onClick={(e) => { e.stopPropagation(); removeRedaction(idx); }}
                      title="Remove redaction"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Actively drawing rect */}
                {drawingRect && (
                  <div 
                    className="absolute bg-zinc-900/50 border border-zinc-950 pointer-events-none"
                    style={getTempRectStyle()}
                  />
                )}
              </div>
            )}
            
            <p className="absolute bottom-4 text-xs font-medium text-ink-muted dark:text-ink-muted-dark bg-white/80 dark:bg-zinc-900/80 px-3 py-1.5 rounded-full pointer-events-none shadow-sm">
              Click and drag to redact areas
            </p>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-ink dark:text-ink-dark">Applying Redactions...</h3>
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark mt-1">Drawing blackout boxes...</p>
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
            onDownload={handleDownload}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
