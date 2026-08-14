import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { GitCompare, ChevronLeft, ChevronRight, Layers, SlidersHorizontal, RefreshCw, X } from 'lucide-react';

type Phase = 'upload' | 'viewer';
type ViewMode = 'overlay' | 'slider';

interface Props {
  t?: Strings;
}

export function CompareShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Viewer state
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  
  // Image blobs
  const [blobA, setBlobA] = useState<string | null>(null);
  const [blobB, setBlobB] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Slider state
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100 percentage
  const containerRef = useRef<HTMLDivElement>(null);
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
      if (blobA) URL.revokeObjectURL(blobA);
      if (blobB) URL.revokeObjectURL(blobB);
    };
  }, []);

  const addFileA = async (files: File[]) => {
    if (!files.length) return;
    const v = await validatePdfFile(files[0]);
    if (!v.ok) { setToast({ kind: 'error', message: v.reason || 'Invalid PDF' }); return; }
    setFileA(files[0]);
    checkStart(files[0], fileB);
  };

  const addFileB = async (files: File[]) => {
    if (!files.length) return;
    const v = await validatePdfFile(files[0]);
    if (!v.ok) { setToast({ kind: 'error', message: v.reason || 'Invalid PDF' }); return; }
    setFileB(files[0]);
    checkStart(fileA, files[0]);
  };

  const addFilesCombo = async (files: File[]) => {
    if (files.length === 2) {
      const v1 = await validatePdfFile(files[0]);
      const v2 = await validatePdfFile(files[1]);
      if (!v1.ok || !v2.ok) { setToast({ kind: 'error', message: 'One or more invalid PDFs' }); return; }
      setFileA(files[0]);
      setFileB(files[1]);
      checkStart(files[0], files[1]);
    } else {
      setToast({ kind: 'error', message: 'Please select exactly two files' });
    }
  };

  const checkStart = (a: File | null, b: File | null) => {
    if (a && b) {
      setPhase('viewer');
      loadPageCount(a, b);
    }
  };

  const loadPageCount = async (a: File, b: File) => {
    try {
      const ctrl = getController();
      let maxPages = 1;
      
      const aBuf = await a.arrayBuffer();
      const bBuf = await b.arrayBuffer();
      
      // We will parse with pdf-lib to get page count synchronously without dealing with worker callbacks for 2 files
      const { PDFDocument } = await import('pdf-lib');
      const docA = await PDFDocument.load(aBuf, { ignoreEncryption: true });
      const docB = await PDFDocument.load(bBuf, { ignoreEncryption: true });
      
      maxPages = Math.max(docA.getPageCount(), docB.getPageCount());
      setTotalPages(maxPages);
      setCurrentPage(1);
      loadImages(1, a, b);
    } catch (e) {
      setToast({ kind: 'error', message: 'Failed to inspect documents' });
    }
  };

  const loadImages = async (page: number, a = fileA, b = fileB) => {
    if (!a || !b) return;
    setIsLoadingImages(true);
    
    // Cleanup old blobs
    if (blobA) URL.revokeObjectURL(blobA);
    if (blobB) URL.revokeObjectURL(blobB);
    
    const ctrl = getController();
    
    try {
      // 150 DPI for good comparison detail
      const dpi = 150;
      
      const pA = ctrl.previewPage(a, page, dpi).catch(() => null);
      const pB = ctrl.previewPage(b, page, dpi).catch(() => null);
      
      const [resA, resB] = await Promise.all([pA, pB]);
      
      if (resA) setBlobA(URL.createObjectURL(resA));
      else setBlobA(null);
      
      if (resB) setBlobB(URL.createObjectURL(resB));
      else setBlobB(null);
      
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

  const reset = () => {
    setFileA(null);
    setFileB(null);
    if (blobA) URL.revokeObjectURL(blobA);
    if (blobB) URL.revokeObjectURL(blobB);
    setBlobA(null);
    setBlobB(null);
    setPhase('upload');
  };

  // Slider Mouse/Touch Handlers
  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onPointerDown = () => { isDragging.current = true; };
  const onPointerUp = () => { isDragging.current = false; };
  const onPointerMove = (e: React.PointerEvent) => handleMove(e.clientX);

  useEffect(() => {
    const handleUp = () => { isDragging.current = false; };
    const handleMoveGlobal = (e: PointerEvent) => { if (isDragging.current) handleMove(e.clientX); };
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointermove', handleMoveGlobal);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointermove', handleMoveGlobal);
    };
  }, [handleMove]);

  return (
    <div className="w-full">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {phase === 'upload' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium text-ink dark:text-ink-dark">Original Document</h3>
              <DropZone onFiles={addFileA} multiple={false} accept=".pdf" t={t} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium text-ink dark:text-ink-dark">Modified Document</h3>
              <DropZone onFiles={addFileB} multiple={false} accept=".pdf" t={t} />
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-ink-muted dark:text-ink-muted-dark font-medium">OR</p>
            <div className="w-full">
               <DropZone onFiles={addFilesCombo} multiple={true} accept=".pdf" t={t} />
               <p className="text-center text-xs text-ink-muted dark:text-ink-muted-dark mt-2">Upload exactly 2 files at once</p>
            </div>
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'viewer' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border  bg-white p-4 shadow-sm dark: dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={reset}>
                 <X className="mr-2 h-4 w-4" />
                 Close
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

            <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'slider' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-ink-muted dark:text-ink-muted-dark hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Slider
              </button>
              <button
                onClick={() => setViewMode('overlay')}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'overlay' ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100' : 'text-ink-muted dark:text-ink-muted-dark hover:text-zinc-900 dark:hover:text-zinc-300'}`}
              >
                <Layers className="h-4 w-4" />
                Overlay
              </button>
            </div>
          </div>

          {/* Viewer Area */}
          <div className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border  bg-zinc-50/50 dark: dark:bg-zinc-900/20">
            {isLoadingImages && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-zinc-950/50">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            )}

            {!blobA && !blobB && !isLoadingImages && (
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Failed to render page {currentPage}</p>
            )}

            {/* Render comparison only if at least one blob exists */}
            {(blobA || blobB) && (
              <div 
                className="relative shadow-2xl" 
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                style={{ touchAction: 'none' }}
              >
                {/* Overlay Mode */}
                {viewMode === 'overlay' && (
                  <div className="relative">
                    {blobA && <img src={blobA} alt="Original" className="max-h-[80vh] w-auto max-w-full" />}
                    {blobB && (
                      <img 
                        src={blobB} 
                        alt="Modified" 
                        className="absolute inset-0 max-h-[80vh] w-auto max-w-full"
                        style={{ mixBlendMode: 'difference' }} 
                      />
                    )}
                  </div>
                )}

                {/* Slider Mode */}
                {viewMode === 'slider' && (
                  <div className="relative select-none">
                    {/* Base Image (File B - Modified) */}
                    {blobB ? (
                       <img src={blobB} alt="Modified" className="max-h-[80vh] w-auto max-w-full" draggable={false} />
                    ) : (
                       <div className="flex h-full w-full items-center justify-center bg-zinc-200 max-h-[80vh]">No Modified Page</div>
                    )}
                    
                    {/* Top Image (File A - Original) with Clip Path */}
                    {blobA && (
                      <div 
                        className="absolute inset-0"
                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      >
                        <img src={blobA} alt="Original" className="max-h-[80vh] w-auto max-w-full h-full object-contain object-left" draggable={false} />
                      </div>
                    )}
                    
                    {/* Slider Handle */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 cursor-col-resize bg-amber-500"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 shadow-md ring-2 ring-white dark:ring-zinc-900">
                        <GitCompare className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-ink-muted dark:text-ink-muted-dark px-2">
            <div><span className="font-semibold text-amber-600 dark:text-amber-400">Left:</span> Original Document ({fileA?.name})</div>
            <div><span className="font-semibold text-blue-600 dark:text-blue-400">Right/Overlay:</span> Modified Document ({fileB?.name})</div>
          </div>
        </div>
      )}
    </div>
  );
}
