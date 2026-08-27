import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import { JobController } from '../app/JobController';
import { FileUp, FileText, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ContrastEnhancerShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(200);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cacheRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
        setPhase('upload');
      },
      onContrastEnhancerDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
          const errMsg = t.corruptFile;
          setErrorMsg(errMsg);
          setToast({ kind: 'error', message: errMsg });
          setPhase('done');
        }
      }
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t]);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    try {
      const buf = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setTotalPages(Math.max(1, pdfDoc.getPageCount()));
    } catch {
      setTotalPages(1);
    }
    setFile(f);
    setPreviewPageNum(1);
    // Clear preview cache on new file
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setPhase('options');
  }, [t]);

  // Fetch or serve from cache with smooth pre-fetching
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;

    const cached = cacheRef.current.get(previewPageNum);
    if (cached) {
      setPreviewUrl(cached);
      setIsPreviewLoading(false);
    } else {
      setIsPreviewLoading(true);
      controller.current?.previewPage(file, previewPageNum, 150)
        .then((blob) => {
          if (!active) return;
          const u = URL.createObjectURL(blob);
          cacheRef.current.set(previewPageNum, u);
          setPreviewUrl(u);
        })
        .catch((err) => {
          console.error('Preview error:', err);
          if (previewPageNum > 1 && active) setPreviewPageNum(p => Math.max(1, p - 1));
        })
        .finally(() => {
          if (active) setIsPreviewLoading(false);
        });
    }

    // Background prefetch neighbours for zero-delay instant transition
    for (const neighbour of [previewPageNum - 1, previewPageNum + 1]) {
      if (neighbour < 1 || neighbour > totalPages || cacheRef.current.has(neighbour)) continue;
      controller.current?.previewPage(file, neighbour, 150)
        .then((blob) => {
          if (!cacheRef.current.has(neighbour)) {
            cacheRef.current.set(neighbour, URL.createObjectURL(blob));
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [file, previewPageNum, totalPages, phase]);

  // Keyboard left/right arrow navigation
  useEffect(() => {
    if (phase !== 'options') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPreviewPageNum(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight') {
        setPreviewPageNum(p => Math.min(totalPages, p + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, totalPages]);

  const reset = useCallback(() => {
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
    setBrightness(100);
    setContrast(200);
    setPreviewPageNum(1);
    setTotalPages(1);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}
      
      {phase === 'upload' && !file && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Sun className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark justify-center">
              <label className="text-sm font-medium">{t.lang === 'tr' ? 'Parlaklık (%)' : 'Brightness (%)'}</label>
              <input type="range" min="50" max="200" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-center text-ink-muted dark:text-ink-muted-dark">{brightness}%</div>

              <label className="text-sm font-medium mt-2">{t.lang === 'tr' ? 'Kontrast (%)' : 'Contrast (%)'}</label>
              <input type="range" min="100" max="300" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="w-full" />
              <div className="text-xs text-center text-ink-muted dark:text-ink-muted-dark">{contrast}%</div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[340px] select-none">
              {isPreviewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg/50 dark:bg-bg-dark/50 z-20 backdrop-blur-[1px]">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
                </div>
              )}
              
              <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-2">
                {previewUrl && (
                  <img 
                    key={previewPageNum}
                    src={previewUrl} 
                    alt="PDF Preview" 
                    className="max-h-[350px] w-auto object-contain shadow-md rounded border dark:border-ink-faint-dark transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
                    style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                  />
                )}
              </div>

              {/* Smooth Left/Right Arrow Navigation Bar */}
              <div className="absolute bottom-3 flex items-center gap-2 bg-surface/90 dark:bg-surface-dark/90 px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md border border-ink-faint dark:border-ink-faint-dark z-10 transition-all duration-200">
                <button 
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  aria-label={t.lang === 'tr' ? 'Önceki Sayfa' : 'Previous Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono min-w-[4rem] text-center font-medium select-none text-ink dark:text-ink-dark">
                  {t.lang === 'tr' ? `Sayfa ${previewPageNum} / ${totalPages}` : `Page ${previewPageNum} of ${totalPages}`}
                </span>
                <button 
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.min(totalPages, p + 1))}
                  disabled={previewPageNum >= totalPages}
                  aria-label={t.lang === 'tr' ? 'Sonraki Sayfa' : 'Next Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 border-t dark:border-ink-faint-dark/20 pt-4">
            <button onClick={reset} className="px-4 py-2 text-sm font-medium text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark transition-colors">
              {t.lang === 'tr' ? 'İptal' : 'Cancel'}
            </button>
            <button onClick={() => { setPhase('processing'); controller.current?.runContrastEnhancer(file, brightness, contrast); }} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-300 bg-amber text-white shadow-[0_0_15px_rgba(181,130,47,0.3)] hover:shadow-[0_0_25px_rgba(181,130,47,0.5)] dark:bg-amber-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.3)] dark:hover:shadow-[0_0_25px_rgba(232,182,95,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              <Sun className="w-4 h-4" />
              <span className="text-sm">
                {t.lang === 'tr' ? 'PDF\'i Geliştir' : 'Enhance PDF'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.converting || 'Processing...'} />
      )}

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={output ? { totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: output.blob, outputName: output.name, cancelled: false } : null}
            skipped={[]}
            crossLink={null}
            onDownload={() => output && triggerDownload(output.blob, output.name)}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
