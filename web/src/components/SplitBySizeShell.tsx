import { useCallback, useRef, useState } from 'react';
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
import { FileDown, Layers, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function SplitBySizeShell({ t = en, desktopAppUrl }: Props) {
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
  const [maxSizeMB, setMaxSizeMB] = useState<number>(5); // Default to 5MB parts
  const isTr = t.lang === 'tr';

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onSplitBySizeProgress: (processed, total) => {
          setProgress({
            message: isTr
              ? `Sayfalar işleniyor: ${processed} / ${total}...`
              : `Processing ${processed} of ${total} pages...`,
            percentage: (processed / total) * 100,
          });
        },
        onSplitBySizeDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: (message) => {
          setCancelling(false);
          setToast({ kind: 'error', message: message || t.corruptFile || 'An error occurred' });
          setErrorMsg(null);
          setPhase('upload');
        },
        onUnavailable: () => {
          setUnavailable(true);
        },
      });
    }
    return controllerRef.current;
  }, [t, isTr]);

  const cancel = useCallback(() => {
    setCancelling(true);
    controller().cancel();
    setErrorMsg(null);
    setPhase('options');
    setCancelling(false);
  }, [controller]);

  const reset = useCallback(() => {
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setPhase('upload');
    setFile(null);
    setPageCount(0);
  }, [controller]);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const f = files[0];
      const err = await validatePdfFile(f);
      if (err) {
        setToast({
          kind: 'error',
          message: err === 'empty-file' ? t.emptyFile || 'File is empty' : t.notPdf || 'Not a PDF file',
        });
        return;
      }

      try {
        const buf = await f.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setPageCount(pdfDoc.getPageCount());
      } catch (e) {
        setPageCount(1);
      }

      setFile(f);
      setPhase('options');
    },
    [t.emptyFile, t.notPdf]
  );

  const processFile = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    controller().runSplitBySize(file, maxSizeMB);
  }, [file, maxSizeMB, controller]);

  const preload = useCallback(() => controller().preload(), [controller]);

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : '0';
  const estParts = file ? Math.max(1, Math.ceil(parseFloat(fileSizeMB) / maxSizeMB)) : 1;

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
          <DropZone t={t} hasFiles={false} onFiles={addFiles} onPreload={preload} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Document Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <div className="relative aspect-[1/1.3] w-24 shrink-0 rounded-xl border border-ink-faint bg-white overflow-hidden shadow-xs flex items-center justify-center mx-auto md:mx-0">
              <FileDown className="h-8 w-8 text-amber-dark dark:text-amber" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber-dark font-semibold">
                  {isTr ? 'Büyük Doküman' : 'Large Document'}
                </span>
                {pageCount > 0 && (
                  <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                    {pageCount} {isTr ? 'Sayfa' : 'Pages'}
                  </span>
                )}
                <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                  · {fileSizeMB} MB
                </span>
              </div>
              <h3 className="truncate text-sm font-semibold text-ink dark:text-ink-dark mt-1" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr
                  ? `Dosya, her biri en fazla ${maxSizeMB} MB olacak parçalara bölünerek ZIP olarak paketlenecektir.`
                  : `Document will be divided into files under ${maxSizeMB} MB and packaged into a ZIP.`}
              </p>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="rounded-2xl border bg-surface p-6 shadow-sm dark:bg-surface-dark">
            <div className="max-w-md mx-auto flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-ink dark:text-ink-dark flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-amber-dark dark:text-amber" />
                    {isTr ? 'Maksimum Parça Boyutu (MB)' : 'Maximum Part Size (MB)'}
                  </label>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-surface-2 dark:bg-surface-2-dark text-ink dark:text-ink-dark">
                    {maxSizeMB} MB
                  </span>
                </div>

                {/* Preset quick buttons */}
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[1, 5, 10, 25].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setMaxSizeMB(size)}
                      className={`rounded-xl border py-2.5 text-xs font-medium transition-all ${
                        maxSizeMB === size
                          ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                          : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                      }`}
                    >
                      {size} MB
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={maxSizeMB}
                    onChange={(e) => setMaxSizeMB(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-11 flex-1 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                  />
                  <div className="text-xs px-3 py-2.5 rounded-xl border bg-amber/10 border-amber/20 text-amber-dark font-medium whitespace-nowrap">
                    {isTr ? `Tahmini ~${estParts} parça` : `Estimated ~${estParts} parts`}
                  </div>
                </div>

                <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1">
                  {isTr
                    ? 'E-posta (Gmail/Outlook) ve resmi kurum portalları için genellikle 10 MB veya 25 MB sınırı önerilir.'
                    : 'A 10 MB or 25 MB limit is recommended for email attachments (Gmail/Outlook) and portal uploads.'}
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ink-faint dark:border-ink-faint-dark">
                <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
                  {t.cancel || (isTr ? 'İptal' : 'Cancel')}
                </Button>
                <Button onClick={processFile} className="w-full sm:w-auto">
                  {isTr ? `PDF'i Böl (Maks ${maxSizeMB} MB)` : `Split PDF (Max ${maxSizeMB} MB)`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          cancelling={cancelling}
          label={progress?.message || (isTr ? 'Sayfalar taranıyor ve parçalara bölünüyor...' : 'Processing...')}
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
                ? `Belgeniz ${maxSizeMB} MB sınırını aşmayacak şekilde başarıyla parçalandı!`
                : `Document successfully split into parts under ${maxSizeMB} MB!`
              : null
          }
          skipped={[]}
          crossLink={null}
          onDownload={() => {
            if (result?.output) triggerDownload(result.output, result.outputName || 'split-parts.zip');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
