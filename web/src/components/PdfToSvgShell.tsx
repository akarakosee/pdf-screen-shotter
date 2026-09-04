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
import { FileCode2, ArrowRight } from 'lucide-react';
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
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isThumbLoading, setIsThumbLoading] = useState<boolean>(false);

  const isTr = t.lang === 'tr';
  const isTrRef = useRef(isTr);
  isTrRef.current = isTr;

  const tRef = useRef(t);
  tRef.current = t;

  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onPdfToSvgProgress: (processed, total) => {
        const pct = total > 0 ? Math.max(10, Math.round((processed / total) * 100)) : 50;
        setProgress({
          message: isTrRef.current
            ? `Sayfalar SVG formatına dönüştürülüyor: ${processed} / ${total}...`
            : `Converting page ${processed} of ${total} to SVG...`,
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
    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    setThumbUrl(null);
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setFile(null);
    setPageCount(0);
    setPhase('upload');
  }, [thumbUrl]);

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

    try {
      const buf = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(Math.max(1, pdfDoc.getPageCount()));
    } catch (e) {
      setPageCount(1);
    }

    setFile(f);
    setPhase('options');
  }, []);

  // First page thumbnail rendering
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;
    setIsThumbLoading(true);

    controller.current
      ?.previewPage(file, 1, 140)
      .then((blob) => {
        if (!active) return;
        setThumbUrl(URL.createObjectURL(blob));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsThumbLoading(false);
      });

    return () => {
      active = false;
    };
  }, [file, phase]);

  const processFile = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    setProgress({
      message: isTr ? 'SVG dönüşümü başlatılıyor...' : 'Starting SVG conversion...',
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
        <div className="phase-enter w-full flex flex-col gap-4">
          <div className="rounded-2xl border bg-surface p-5 sm:p-6 shadow-sm dark:bg-surface-dark flex flex-col gap-5">
            {/* File Info & Format Conversion Header */}
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-11 shrink-0 rounded-xl border border-ink-faint bg-white dark:bg-surface-2-dark overflow-hidden shadow-xs flex items-center justify-center">
                {thumbUrl ? (
                  <img src={thumbUrl} alt={file.name} className="w-full h-full object-contain" />
                ) : isThumbLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                ) : (
                  <FileCode2 className="h-6 w-6 text-amber-dark dark:text-amber" />
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber-dark font-semibold">
                    PDF <ArrowRight className="w-3 h-3 inline" /> SVG
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
                <h3 className="truncate text-sm font-semibold text-ink dark:text-ink-dark" title={file.name}>
                  {file.name}
                </h3>
              </div>
            </div>

            {/* Clean Format Summary Box */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-ink-faint bg-bg/50 dark:bg-bg-dark/50 text-xs text-ink-muted dark:text-ink-muted-dark">
              <span>{isTr ? 'Çıktı Formatı:' : 'Output Format:'}</span>
              <span className="font-semibold text-ink dark:text-ink-dark flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {pageCount > 1
                  ? isTr
                    ? `${pageCount}x Vektörel SVG (.zip)`
                    : `${pageCount}x Vector SVGs (.zip)`
                  : isTr
                  ? 'Vektörel SVG (.svg)'
                  : 'Vector SVG (.svg)'}
              </span>
            </div>

            {/* Simple Direct Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-faint dark:border-ink-faint-dark">
              <Button variant="ghost" onClick={reset}>
                {t.cancel || (isTr ? 'İptal' : 'Cancel')}
              </Button>
              <Button onClick={processFile}>
                {isTr ? `SVG'ye Dönüştür` : `Convert to SVG`}
              </Button>
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
                ? 'PDF sayfaları başarıyla SVG formatına dönüştürüldü!'
                : 'PDF pages successfully converted to SVG!'
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
