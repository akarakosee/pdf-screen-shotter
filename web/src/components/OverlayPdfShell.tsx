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
import { FileUp, FileText, Layers, ChevronLeft, ChevronRight, CheckCircle2, Upload, Sparkles } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function OverlayPdfShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  const [mode, setMode] = useState<'background' | 'foreground'>('background');
  const [pageRange, setPageRange] = useState<'all' | 'first' | 'except-first'>('all');

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cacheRef = useRef<Map<number, string>>(new Map());

  const isTr = t.lang === 'tr';

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
        setPhase('upload');
      },
      onOverlayPdfDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
          const errMsg = isTr ? 'Antetli kağıt şablonu uygulanamadı. Dosyaları kontrol ediniz.' : 'Failed to apply letterhead overlay.';
          setErrorMsg(errMsg);
          setToast({ kind: 'error', message: errMsg });
          setPhase('done');
        }
      }
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t, isTr]);

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
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setPhase('options');
  }, [t]);

  const handleTemplateUpload = useCallback(async (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    setTemplateFile(f);
  }, [t]);

  // Page preview with prefetching
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;

    const cached = cacheRef.current.get(previewPageNum);
    if (cached) {
      setPreviewUrl(cached);
      setIsPreviewLoading(false);
    } else {
      setIsPreviewLoading(true);
      controller.current?.previewPage(file, previewPageNum, 140)
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

    for (const neighbour of [previewPageNum - 1, previewPageNum + 1]) {
      if (neighbour < 1 || neighbour > totalPages || cacheRef.current.has(neighbour)) continue;
      controller.current?.previewPage(file, neighbour, 140)
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

  const reset = useCallback(() => {
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setTemplateFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
    setMode('background');
    setPageRange('all');
    setPreviewPageNum(1);
    setTotalPages(1);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && !file && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Main Document & Template Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Main Document Card */}
            <div className="flex items-center gap-3.5 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? '1. Ana Metin Belgesi (Fatura / Rapor)' : '1. Main Content PDF'}
                </span>
                <div className="truncate text-sm font-medium pr-2 text-ink dark:text-ink-dark" title={file.name}>
                  {file.name}
                </div>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? `${totalPages} Sayfa` : `${totalPages} Pages`}
                </span>
              </div>
            </div>

            {/* 2. Letterhead Template Card */}
            <div className={`flex items-center gap-3.5 rounded-2xl border p-4 transition-all duration-200 min-w-0 ${templateFile ? 'bg-surface dark:bg-surface-dark border-amber/50 dark:border-amber-dark/50' : 'bg-surface/50 dark:bg-surface-dark/50 border-dashed border-amber/60 dark:border-amber-dark/60'}`}>
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${templateFile ? 'bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark' : 'bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark'}`}>
                {templateFile ? <CheckCircle2 className="h-6 w-6" /> : <FileUp className="h-6 w-6" />}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? '2. Şirket Anteti / Şablon PDF' : '2. Letterhead / Stationery PDF'}
                </span>
                {templateFile ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-amber dark:text-amber-dark" title={templateFile.name}>
                      {templateFile.name}
                    </span>
                    <label className="text-xs text-amber hover:underline cursor-pointer dark:text-amber-dark shrink-0 font-medium">
                      {isTr ? 'Değiştir' : 'Change'}
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleTemplateUpload(e.target.files)} />
                    </label>
                  </div>
                ) : (
                  <label className="text-sm font-medium text-amber hover:underline cursor-pointer dark:text-amber-dark flex items-center gap-1.5 pt-0.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isTr ? 'Antetli PDF Dosyası Seçin...' : 'Select Letterhead Template PDF...'}</span>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleTemplateUpload(e.target.files)} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Configuration and Live Preview Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Options Column */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              {/* Placement Mode */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Katman Konumu (Yerleşim)' : 'Layer Placement'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('background')}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      mode === 'background'
                        ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                        : 'border-ink-faint hover:bg-bg dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                    }`}
                  >
                    <span className="text-sm font-medium text-ink dark:text-ink-dark">
                      {isTr ? 'Arka Plan (Antet)' : 'Background (Stationery)'}
                    </span>
                    <span className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">
                      {isTr ? 'Metinlerin arkasında yer alır' : 'Placed behind text (Recommended)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('foreground')}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      mode === 'foreground'
                        ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                        : 'border-ink-faint hover:bg-bg dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                    }`}
                  >
                    <span className="text-sm font-medium text-ink dark:text-ink-dark">
                      {isTr ? 'Ön Plan (Damga)' : 'Foreground (Stamp)'}
                    </span>
                    <span className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">
                      {isTr ? 'Metinlerin üstüne basılır' : 'Superimposed on top of text'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Page Range Selection */}
              <div className="flex flex-col gap-2 pt-2 border-t dark:border-ink-faint-dark/20">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Uygulanacak Sayfa Aralığı' : 'Apply to Pages'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageRange('all')}
                    className={`btn-motion py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      pageRange === 'all'
                        ? 'border-amber bg-amber/10 text-amber dark:text-amber-dark dark:border-amber-dark font-semibold'
                        : 'border-ink-faint bg-surface text-ink-muted hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark dark:text-ink-muted-dark'
                    }`}
                  >
                    {isTr ? 'Tüm Sayfalar' : 'All Pages'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageRange('first')}
                    className={`btn-motion py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      pageRange === 'first'
                        ? 'border-amber bg-amber/10 text-amber dark:text-amber-dark dark:border-amber-dark font-semibold'
                        : 'border-ink-faint bg-surface text-ink-muted hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark dark:text-ink-muted-dark'
                    }`}
                  >
                    {isTr ? 'Yalnızca 1. Sayfa' : 'First Page Only'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageRange('except-first')}
                    className={`btn-motion py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      pageRange === 'except-first'
                        ? 'border-amber bg-amber/10 text-amber dark:text-amber-dark dark:border-amber-dark font-semibold'
                        : 'border-ink-faint bg-surface text-ink-muted hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark dark:text-ink-muted-dark'
                    }`}
                  >
                    {isTr ? '1. Sayfa Hariç' : 'Except First'}
                  </button>
                </div>
              </div>

              {/* Helpful Guide note */}
              <div className="mt-auto pt-3 text-xs text-ink-muted dark:text-ink-muted-dark bg-bg dark:bg-bg-dark p-3 rounded-xl border">
                <strong>{isTr ? 'İpucu:' : 'Tip:'}</strong> {isTr ? 'Teklif ve fatura gibi belgelerde antet arka plana giydirilir, metinleriniz orijinal vektörel keskinliğini korur.' : 'Letterhead templates are seamlessly layered behind text without rasterizing or degrading original vector font quality.'}
              </div>
            </div>

            {/* Live Document Preview Column */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[480px] select-none">
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
                    alt="PDF Page Preview"
                    className="max-h-[450px] w-auto object-contain shadow-md rounded border dark:border-ink-faint-dark transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
                  />
                )}
              </div>

              {/* Navigation Chevrons */}
              <div className="absolute bottom-3 flex items-center gap-2 bg-surface/90 dark:bg-surface-dark/90 px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md border border-ink-faint dark:border-ink-faint-dark z-10 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  aria-label={isTr ? 'Önceki Sayfa' : 'Previous Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono min-w-[4rem] text-center font-medium select-none text-ink dark:text-ink-dark">
                  {isTr ? `Sayfa ${previewPageNum} / ${totalPages}` : `Page ${previewPageNum} of ${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.min(totalPages, p + 1))}
                  disabled={previewPageNum >= totalPages}
                  aria-label={isTr ? 'Sonraki Sayfa' : 'Next Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-2 border-t dark:border-ink-faint-dark/20 pt-4">
            <button
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {isTr ? 'İptal' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                if (!templateFile) return;
                setPhase('processing');
                controller.current?.runOverlayPdf(file, templateFile, mode, pageRange);
              }}
              disabled={!templateFile}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:from-amber-dark dark:to-[#F0C778]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isTr ? 'Antetli Kağıdı Uygula' : 'Apply Letterhead Template'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{isTr ? 'Antetli kağıt şablonu belgenize giydiriliyor...' : 'Applying letterhead template to your document...'}</span>
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

