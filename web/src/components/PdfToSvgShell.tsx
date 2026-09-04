import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { ExportResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { ProgressPanel } from './ProgressPanel';
import { ResultPanel } from './ResultPanel';
import { FileCode2, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Button } from './ui/Button';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function PdfToSvgShell({ t = en, desktopAppUrl }: Props) {
  const [wasmOk, setWasmOk] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [phase, setPhase] = useState<Phase>('upload');
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{ message: string; percentage?: number } | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const isTr = t.lang === 'tr';
  const isTrRef = useRef(isTr);
  isTrRef.current = isTr;

  const tRef = useRef(t);
  tRef.current = t;

  // Live preview & thumbnail states
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState<number>(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const cacheRef = useRef<Map<number, string>>(new Map());

  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onPdfToSvgProgress: (processed, total) => {
        const pct = total > 0 ? Math.max(10, Math.round((processed / total) * 100)) : 50;
        setProgress({
          message: isTrRef.current
            ? `Sayfalar vektörel SVG formatına dönüştürülüyor: ${processed} / ${total}...`
            : `Converting page ${processed} of ${total} to SVG vector...`,
          percentage: pct,
        });
      },
      onPdfToSvgDone: (res) => {
        setResult(res);
        setCancelling(false);
        setPhase('done');
      },
      onFatal: (message) => {
        setCancelling(false);
        setToast({ kind: 'error', message: message || (isTrRef.current ? 'Hata oluştu' : 'An error occurred') });
        setErrorMsg(null);
        setPhase('options');
      },
      onFileError: (_, message) => {
        setCancelling(false);
        setToast({
          kind: 'error',
          message: isTrRef.current ? 'Dosya işlenemedi veya bozuk.' : 'Could not process file.',
        });
        setPhase('options');
      },
      onUnavailable: () => {
        setUnavailable(true);
      },
    });

    return () => {
      controller.current?.dispose();
      cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller.current?.cancel();
    setErrorMsg(null);
    setPhase('options');
    setCancelling(false);
  }, []);

  const reset = useCallback(() => {
    cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setThumbUrl(null);
    setPreviewUrl(null);
    setPreviewPageNum(1);
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setFile(null);
    setPageCount(0);
    setPhase('upload');
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    const err = await validatePdfFile(f);
    if (err) {
      setToast({
        kind: 'error',
        message: err === 'empty-file' ? tRef.current.emptyFile || 'File is empty' : tRef.current.notPdf || 'Not a PDF file',
      });
      return;
    }

    let count = 1;
    try {
      const buf = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      count = Math.max(1, pdfDoc.getPageCount());
      setPageCount(count);
    } catch (e) {
      setPageCount(1);
    }

    setFile(f);
    setPreviewPageNum(1);
    cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setPhase('options');
  }, []);

  // Live page preview with prefetching
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;

    const cached = cacheRef.current.get(previewPageNum);
    if (cached) {
      setPreviewUrl(cached);
      setIsPreviewLoading(false);
      if (previewPageNum === 1 && !thumbUrl) {
        setThumbUrl(cached);
      }
    } else {
      setIsPreviewLoading(true);
      controller.current
        ?.previewPage(file, previewPageNum, 160)
        .then((blob) => {
          if (!active) return;
          const u = URL.createObjectURL(blob);
          cacheRef.current.set(previewPageNum, u);
          setPreviewUrl(u);
          if (previewPageNum === 1) {
            setThumbUrl(u);
          }
        })
        .catch((err) => {
          console.error('Preview error:', err);
          if (previewPageNum > 1 && active) setPreviewPageNum((p) => Math.max(1, p - 1));
        })
        .finally(() => {
          if (active) setIsPreviewLoading(false);
        });
    }

    for (const neighbour of [previewPageNum - 1, previewPageNum + 1]) {
      if (neighbour < 1 || neighbour > pageCount || cacheRef.current.has(neighbour)) continue;
      controller.current
        ?.previewPage(file, neighbour, 160)
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
  }, [file, previewPageNum, pageCount, phase, thumbUrl]);

  const processFile = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    setProgress({
      message: isTr ? 'Vektörel SVG dönüşümü başlatılıyor...' : 'Starting vector SVG conversion...',
      percentage: 10,
    });
    controller.current?.runPdfToSvg(file);
  }, [file, isTr]);

  const preload = useCallback(() => controller.current?.preload(), []);

  const formattedFileSize = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`
    : '0 KB';

  if (!wasmOk) {
    return (
      <div className="w-full rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.noWasm || 'WASM not supported'}</p>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div role="alert" className="w-full rounded-2xl border bg-surface p-6 dark:bg-surface-dark">
        <p className="text-sm">{t.toolUnavailable || 'Tool unavailable'}</p>
        <div className="mt-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border bg-surface px-4 text-sm font-medium hover:bg-bg dark:bg-surface-dark dark:hover:bg-bg-dark"
          >
            {t.reload || 'Reload page'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} multiple={false} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Compact Document Summary Bar */}
          <div className="flex items-center gap-3.5 rounded-2xl border bg-surface p-3.5 sm:p-4 dark:bg-surface-dark min-w-0 shadow-xs">
            <div className="relative h-12 w-9 sm:h-14 sm:w-11 shrink-0 rounded-lg border border-ink-faint bg-white dark:bg-surface-2-dark overflow-hidden shadow-xs flex items-center justify-center">
              {thumbUrl ? (
                <img src={thumbUrl} alt={file.name} className="w-full h-full object-contain" />
              ) : isPreviewLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber border-t-transparent" />
              ) : (
                <FileCode2 className="h-5 w-5 text-amber-dark dark:text-amber" />
              )}
            </div>

            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber-dark font-semibold">
                  {isTr ? 'Vektörel SVG' : 'Vector SVG'}
                </span>
                {pageCount > 0 && (
                  <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                    {pageCount} {isTr ? 'Sayfa' : 'Pages'}
                  </span>
                )}
                <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                  · {formattedFileSize}
                </span>
              </div>
              <div className="truncate text-sm font-semibold text-ink dark:text-ink-dark mt-0.5" title={file.name}>
                {file.name}
              </div>
            </div>
          </div>

          {/* Settings and Live Document Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 rounded-2xl border bg-surface p-6 shadow-sm dark:bg-surface-dark items-start">
            {/* Left Column: Features & Convert CTA */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold text-ink dark:text-ink-dark flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-dark dark:text-amber" />
                  {isTr ? 'Ölçeklenebilir Vektör Çıktısı (SVG)' : 'Scalable Vector Graphics (SVG)'}
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-muted-dark leading-relaxed">
                  {isTr
                    ? 'PDF içindeki tüm çizimler, logolar, tablolar, diyagramlar ve tipografiler piksellenme olmadan sonsuz çözünürlüklü SVG formatına dönüştürülür.'
                    : 'All PDF vector paths, diagrams, typography, and logos are extracted into clean, resolution-independent SVG markup.'}
                </p>
              </div>

              {/* Feature Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-ink-faint/80 bg-bg/50 dark:bg-bg-dark/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center shrink-0 text-amber-dark dark:text-amber">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                      {isTr ? 'Sonsuz Ölçeklenebilirlik' : 'Infinite Scalability'}
                    </span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                      {isTr ? 'Bulanıklaşma ve kalite kaybı yok' : 'No pixelation or quality degradation'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-ink-faint/80 bg-bg/50 dark:bg-bg-dark/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center shrink-0 text-amber-dark dark:text-amber">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                      {isTr ? 'Tasarım Araçlarıyla Uyumlu' : 'Design Ready'}
                    </span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                      {isTr ? 'Figma, Illustrator, Canva, Web' : 'Figma, Illustrator, Canva & Web'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery info box */}
              <div className="p-3.5 rounded-xl border border-amber/20 bg-amber/5 text-xs text-ink-muted dark:text-ink-muted-dark flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-dark dark:text-amber shrink-0 mt-0.5" />
                <span>
                  {pageCount > 1
                    ? isTr
                      ? `Belgeniz ${pageCount} sayfa içeriyor. Tüm sayfalar ayrı ayrı .svg dosyalarına dönüştürülüp tek bir ZIP paketi olarak sunulacaktır.`
                      : `Your document contains ${pageCount} pages. All pages will be exported as individual .svg files bundled into a ZIP archive.`
                    : isTr
                    ? 'Tek sayfalık belgeniz doğrudan saf .svg formatında indirilecektir.'
                    : 'Single-page document will be downloaded directly as a standalone .svg file.'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ink-faint dark:border-ink-faint-dark mt-2">
                <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
                  {t.cancel || (isTr ? 'İptal' : 'Cancel')}
                </Button>
                <Button onClick={processFile} className="w-full sm:w-auto">
                  {isTr ? `SVG'ye Dönüştür (${pageCount} Sayfa)` : `Convert to SVG (${pageCount} Pages)`}
                </Button>
              </div>
            </div>

            {/* Right Column: Live Interactive Page Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-ink-faint bg-bg/50 dark:bg-bg-dark/50 relative overflow-hidden min-h-[420px] select-none">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark flex items-center gap-1.5">
                  <FileCode2 className="h-3.5 w-3.5 text-amber-dark dark:text-amber" />
                  {isTr ? 'Sayfa Önizlemesi' : 'Page Preview'}
                </span>
                <span className="text-[11px] font-mono text-amber-dark dark:text-amber font-semibold bg-amber/10 px-2 py-0.5 rounded">
                  .SVG
                </span>
              </div>

              {/* A4 Sheet Container */}
              <div className="relative w-full max-w-[220px] aspect-[1/1.414] bg-white border border-border shadow-md rounded-md overflow-hidden flex items-center justify-center p-1.5">
                {isPreviewLoading && !previewUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                  </div>
                )}

                {previewUrl ? (
                  <img
                    key={previewPageNum}
                    src={previewUrl}
                    alt={`Page ${previewPageNum}`}
                    className="w-full h-full object-contain rounded-xs bg-white animate-in fade-in zoom-in-95 duration-200"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted text-xs p-2">
                    <FileCode2 className="h-6 w-6 text-amber/40 mb-1" />
                    <span>{isTr ? `Sayfa ${previewPageNum}` : `Page ${previewPageNum}`}</span>
                  </div>
                )}
              </div>

              {/* Page Navigation Chevrons */}
              <div className="flex items-center gap-2 mt-4 bg-surface/90 dark:bg-surface-dark/90 px-3 py-1 rounded-full shadow-sm backdrop-blur-md border border-ink-faint dark:border-ink-faint-dark z-10 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setPreviewPageNum((p) => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  aria-label={isTr ? 'Önceki Sayfa' : 'Previous Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono min-w-[4.5rem] text-center font-medium select-none text-ink dark:text-ink-dark">
                  {isTr
                    ? `Sayfa ${previewPageNum} / ${pageCount}`
                    : `Page ${previewPageNum} of ${pageCount}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPageNum((p) => Math.min(pageCount, p + 1))}
                  disabled={previewPageNum >= pageCount}
                  aria-label={isTr ? 'Sonraki Sayfa' : 'Next Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          cancelling={cancelling}
          label={progress?.message || (isTr ? 'Sayfalar SVG formatına dönüştürülüyor...' : 'Converting to SVG...')}
          progressPercent={progress?.percentage || 0}
          cancelLabel={t.cancel || (isTr ? 'İptal' : 'Cancel')}
          cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
          onCancel={cancel}
        />
      )}

      {phase === 'done' && (result || errorMsg) && (
        <ResultPanel
          errorMsg={errorMsg}
          t={t}
          result={result}
          customHeadline={
            result?.output
              ? isTr
                ? 'PDF sayfaları başarıyla vektörel SVG formatına dönüştürüldü!'
                : 'PDF pages successfully converted to scalable vector SVG!'
              : null
          }
          skipped={[]}
          crossLink={null}
          onDownload={() => {
            if (result?.output) triggerDownload(result.output, result.outputName || 'vector-export.svg');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
