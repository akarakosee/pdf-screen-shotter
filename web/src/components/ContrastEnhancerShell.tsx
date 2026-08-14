import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';
import { FileUp, FileText, Sun } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ContrastEnhancerShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(200);

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setPhase('upload');
      },
      onContrastEnhancerDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setPhase('upload');
          setToast({ kind: 'error', message: t.corruptFile });
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
    setFile(f);
    setPhase('options');
  }, [t]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;
    setIsPreviewLoading(true);
    
    // We fetch a 150 DPI preview for crisp display
    controller.current?.previewPage(file, previewPageNum, 150)
      .then((blob) => {
        if (!active) return;
        setPreviewUrl(URL.createObjectURL(blob));
      })
      .catch((err) => {
        console.error('Preview error:', err);
        // If out of bounds, maybe go back to 1
        if (previewPageNum > 1 && active) setPreviewPageNum(previewPageNum - 1);
      })
      .finally(() => {
        if (active) setIsPreviewLoading(false);
      });

    return () => {
      active = false;
      // Clean up previous URL to avoid memory leaks
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [file, previewPageNum, phase]);

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setPhase('upload');
    setBrightness(100);
    setContrast(100);
    setPreviewPageNum(1);
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

            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[300px]">
              {isPreviewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
                </div>
              )}
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="PDF Preview" 
                  className="max-h-[350px] w-auto object-contain shadow-sm border dark:border-ink-faint-dark transition-all duration-75"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                />
              )}
              <div className="absolute bottom-3 flex items-center gap-2 bg-surface/90 dark:bg-surface-dark/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border">
                <button 
                  onClick={() => setPreviewPageNum(p => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-bg dark:hover:bg-bg-dark disabled:opacity-30 disabled:hover:bg-transparent text-lg leading-none"
                >
                  -
                </button>
                <span className="text-xs font-mono min-w-[3rem] text-center">
                  {t.lang === 'tr' ? 'Sayfa' : 'Page'} {previewPageNum}
                </span>
                <button 
                  onClick={() => setPreviewPageNum(p => p + 1)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-bg dark:hover:bg-bg-dark text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button onClick={() => { setPhase('processing'); controller.current?.runContrastEnhancer(file, brightness, contrast); }} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-teal-dark disabled:opacity-50">
              {t.lang === 'tr' ? 'Geliştir' : 'Enhance Document'}
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || 'Processing...'}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            t={t}
            result={{ totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: output.blob, outputName: output.name, cancelled: false }}
            skipped={[]}
            crossLink={null}
            onDownload={() => triggerDownload(output.blob, output.name)}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
