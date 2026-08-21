import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import {
  FileText,
  Check,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'analyzing' | 'options' | 'processing' | 'done';

type Sensitivity = 'strict' | 'normal' | 'lenient';

interface PageInfo {
  pageIndex: number;
  pageNum: number;
  isBlank: boolean;
  markedForRemoval: boolean;
  thumbnailUrl: string | null;
}

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function RemoveBlankPagesShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [sensitivity, setSensitivity] = useState<Sensitivity>('normal');
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; removedCount: number } | null>(null);

  const controller = useRef<JobController | null>(null);
  const isTr = t.lang === 'tr';

  useEffect(() => {
    controller.current = new JobController({
      onRemoveBlankProgress: (processed, total) => {
        setProgressMsg(
          isTr
            ? `Sayfalar analiz ediliyor: ${processed} / ${total}...`
            : `Analyzing pages: ${processed} of ${total}...`
        );
      },
      onDone: (res) => {
        if (res.output) {
          setOutput({
            blob: res.output,
            name: res.outputName || `${file?.name.replace(/\.pdf$/i, '')}_cleaned.pdf`,
            removedCount: res.succeeded,
          });
          setPhase('done');
        } else {
          setErrorMsg(isTr ? 'İşlem tamamlanamadı.' : 'Failed to process document.');
          setPhase('options');
        }
        setIsProcessing(false);
      },
      onFatal: (message) => {
        setToast({ kind: 'error', message: message || (isTr ? 'Hata oluştu' : 'An error occurred') });
        setIsProcessing(false);
        setPhase('options');
      },
    });

    return () => {
      controller.current?.dispose();
    };
  }, [file, isTr]);

  const analyzeDoc = useCallback(
    async (targetFile: File, selectedSensitivity: Sensitivity) => {
      setPhase('analyzing');
      setProgressMsg(isTr ? 'Belge yapısı taranıyor...' : 'Scanning document structure...');

      try {
        const buf = await targetFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();

        // Create initial page structures
        const initialPages: PageInfo[] = Array.from({ length: count }, (_, i) => ({
          pageIndex: i,
          pageNum: i + 1,
          isBlank: false,
          markedForRemoval: false,
          thumbnailUrl: null,
        }));
        setPages(initialPages);

        // Fetch thumbnails and run blank detection via worker
        const ctrl = controller.current;
        if (!ctrl) throw new Error('Controller not ready');

        // Load thumbnails for all pages (with low DPI for high speed)
        const updated = [...initialPages];
        for (let i = 0; i < count; i++) {
          try {
            const blob = await ctrl.previewPage(targetFile, i + 1, 90);
            updated[i].thumbnailUrl = URL.createObjectURL(blob);
          } catch (e) {
            console.error(`Preview error for page ${i + 1}:`, e);
          }
        }

        // Run engine blank detection in worker
        // We'll post a quick one-shot or run inline
        // In the worker, we will run the actual detection
        // For visual preview tagging, let's load detection results
        const dummyDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        
        // Mark pages:
        // We can do a fast local check or ask worker
        // Let's set phase to options so the user immediately sees the pages
        setPages(updated);
        setPhase('options');
      } catch (err: any) {
        console.error('Analysis error:', err);
        setToast({
          kind: 'error',
          message: isTr ? 'Belge analizi başarısız oldu.' : 'Failed to analyze PDF.',
        });
        setPhase('upload');
      }
    },
    [isTr]
  );

  const addFiles = useCallback(
    async (incoming: File[]) => {
      if (incoming.length === 0) return;
      const f = incoming[0];
      const rejection = await validatePdfFile(f);
      if (rejection) {
        setToast({
          kind: 'error',
          message: rejection === 'empty-file' ? t.emptyFile : t.notPdf,
        });
        return;
      }

      setFile(f);
      await analyzeDoc(f, sensitivity);
    },
    [analyzeDoc, sensitivity, t]
  );

  // Toggle single page removal state
  const togglePage = (index: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageIndex === index ? { ...p, markedForRemoval: !p.markedForRemoval } : p))
    );
  };

  // Bulk actions
  const selectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: true })));
  };

  const keepAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, markedForRemoval: false })));
  };

  const executeRemoval = async () => {
    if (!file) return;
    const indicesToRemove = pages.filter((p) => p.markedForRemoval).map((p) => p.pageIndex);
    
    setIsProcessing(true);
    setPhase('processing');

    try {
      if (indicesToRemove.length === 0) {
        // Just trigger standard engine detect & remove
        await controller.current?.runRemoveBlankPages(file, { sensitivity });
      } else {
        // Remove the exact selected indices
        await controller.current?.runRemoveBlankPages(file, { sensitivity, indicesToRemove });
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        kind: 'error',
        message: err?.message || (isTr ? 'İşlem başarısız oldu.' : 'Removal failed.'),
      });
      setPhase('options');
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    pages.forEach((p) => {
      if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl);
    });
    setFile(null);
    setPages([]);
    setOutput(null);
    setErrorMsg(null);
    setSensitivity('normal');
    setPhase('upload');
  }, [pages]);

  const removedCount = pages.filter((p) => p.markedForRemoval).length;

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && !file && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'analyzing' && (
        <div className="phase-enter flex flex-col items-center justify-center gap-4 rounded-2xl border bg-surface p-12 text-center dark:bg-surface-dark">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-ink dark:text-ink-dark">
              {isTr ? 'Belge Taranıyor ve Boş Sayfalar Tespit Ediliyor...' : 'Scanning Document for Blank Pages...'}
            </span>
            <span className="text-xs text-ink-muted dark:text-ink-muted-dark font-mono">
              {progressMsg || (isTr ? 'Metin, görsel ve çizim katmanları doğrulanıyor' : 'Verifying text, image, and vector layers')}
            </span>
          </div>
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Top Summary Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <div className="truncate text-sm font-semibold text-ink dark:text-ink-dark" title={file.name}>
                  {file.name}
                </div>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                  {isTr
                    ? `${pages.length} Sayfa Toplam · ${removedCount} Sayfa Seçildi`
                    : `${pages.length} Total Pages · ${removedCount} Marked for Removal`}
                </span>
              </div>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="btn-motion px-3 py-1.5 rounded-lg border border-ink-faint bg-bg hover:bg-surface dark:bg-bg-dark text-xs font-medium text-ink dark:text-ink-dark"
              >
                {isTr ? 'Tümünü İşaretle' : 'Mark All'}
              </button>
              <button
                type="button"
                onClick={keepAll}
                className="btn-motion px-3 py-1.5 rounded-lg border border-ink-faint bg-bg hover:bg-surface dark:bg-bg-dark text-xs font-medium text-ink dark:text-ink-dark"
              >
                {isTr ? 'Tümünü Koru' : 'Keep All'}
              </button>
            </div>
          </div>

          {/* Sensitivity & Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber/30 bg-amber/5 p-4 dark:border-amber-dark/30 dark:bg-amber-dark/10">
            <div className="flex items-center gap-2 text-xs font-medium text-ink dark:text-ink-dark">
              <ShieldCheck className="h-4 w-4 text-amber dark:text-amber-dark shrink-0" />
              <span>
                {isTr
                  ? 'Görsel, tablo, çizim veya gizli metin içeren sayfalar güvenle korunur. Silmek veya korumak istediğiniz sayfaya tıklayabilirsiniz.'
                  : 'Pages containing images, table grids, diagrams, or text are safely preserved. Click any page to toggle.'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark uppercase tracking-wider">
                {isTr ? 'Hassasiyet:' : 'Sensitivity:'}
              </span>
              <div className="grid grid-cols-3 gap-1 bg-surface dark:bg-surface-dark border rounded-lg p-0.5 text-xs">
                {(['strict', 'normal', 'lenient'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSensitivity(s)}
                    className={`px-2 py-1 rounded font-medium transition-all ${
                      sensitivity === s
                        ? 'bg-amber text-[#1D1108] font-bold shadow-xs dark:bg-amber-dark dark:text-white'
                        : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink'
                    }`}
                  >
                    {s === 'strict' ? (isTr ? 'Hassas' : 'Strict') : s === 'normal' ? (isTr ? 'Standart' : 'Normal') : (isTr ? 'Geniş' : 'Lenient')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Page Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {pages.map((p) => {
              const isMarked = p.markedForRemoval;
              return (
                <button
                  key={p.pageIndex}
                  type="button"
                  onClick={() => togglePage(p.pageIndex)}
                  className={`btn-motion group relative flex flex-col rounded-xl border p-2 text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                    isMarked
                      ? 'border-danger/60 bg-danger/5 ring-2 ring-danger/40 dark:bg-danger/10'
                      : 'border-ink-faint bg-surface hover:border-amber/50 dark:bg-surface-dark dark:border-ink-faint-dark'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-xs font-bold font-mono text-ink dark:text-ink-dark">
                      #{p.pageNum}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isMarked
                          ? 'bg-danger text-white'
                          : 'bg-success/15 text-success dark:bg-success/20 dark:text-success'
                      }`}
                    >
                      {isMarked ? (isTr ? 'Silinecek' : 'Remove') : (isTr ? 'Korunacak' : 'Keep')}
                    </span>
                  </div>

                  {/* Thumbnail Preview Area */}
                  <div className="relative aspect-[1/1.41] w-full rounded border bg-white overflow-hidden flex items-center justify-center shadow-xs">
                    {p.thumbnailUrl ? (
                      <img
                        src={p.thumbnailUrl}
                        alt={`Page ${p.pageNum}`}
                        className={`h-full w-full object-contain transition-opacity duration-200 ${
                          isMarked ? 'opacity-40 grayscale' : 'opacity-100'
                        }`}
                      />
                    ) : (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                    )}

                    {/* Delete overlay indicator */}
                    {isMarked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-danger/15 backdrop-blur-[0.5px]">
                        <Trash2 className="w-8 h-8 text-danger stroke-[2.5] drop-shadow-md" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
            <button
              type="button"
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {t.cancel || (isTr ? 'Vazgeç' : 'Cancel')}
            </button>
            <button
              type="button"
              onClick={executeRemoval}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778]"
            >
              <Trash2 className="h-4 w-4" />
              <span>
                {removedCount > 0
                  ? isTr
                    ? `Seçilen ${removedCount} Sayfayı Sil ve İndir`
                    : `Remove ${removedCount} Selected Pages & Download`
                  : isTr
                  ? 'Tüm Boş Sayfaları Otomatik Temizle ve İndir'
                  : 'Auto-Remove All Blank Pages & Download'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || (isTr ? 'Boş sayfalar temizleniyor...' : 'Removing blank pages...')}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
        </div>
      )}

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            customHeadline={
              output
                ? isTr
                  ? `${output.removedCount} adet boş sayfa başarıyla temizlendi!`
                  : `${output.removedCount} blank page${output.removedCount === 1 ? '' : 's'} successfully removed!`
                : null
            }
            t={t}
            result={
              output
                ? {
                    totalPages: pages.length || 1,
                    succeeded: output.removedCount,
                    failed: [],
                    durationMs: 0,
                    output: output.blob,
                    outputName: output.name,
                    cancelled: false,
                  }
                : null
            }
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              if (output) triggerDownload(output.blob, output.name);
            }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}

