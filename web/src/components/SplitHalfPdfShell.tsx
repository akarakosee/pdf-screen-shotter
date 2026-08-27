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
  Scissors,
  ArrowRight,
  SlidersHorizontal,
  BookOpen,
  ArrowLeftRight,
  ArrowUpDown,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'options' | 'processing' | 'done';

type SplitDirection = 'vertical' | 'horizontal';
type ReadingOrder = 'ltr' | 'rtl';

interface Props {
  t?: Strings;
}

export function SplitHalfPdfShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [splitDirection, setSplitDirection] = useState<SplitDirection>('vertical');
  const [readingOrder, setReadingOrder] = useState<ReadingOrder>('ltr');
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ processed: number; total: number } | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; totalPages: number } | null>(null);

  const controller = useRef<JobController | null>(null);
  const fileRef = useRef<File | null>(null);
  fileRef.current = file;

  const isTr = t.lang === 'tr';
  const isTrRef = useRef(isTr);
  isTrRef.current = isTr;

  useEffect(() => {
    controller.current = new JobController({
      onSplitHalfProgress: (processed, total) => {
        setProgress({ processed, total });
      },
      onSplitHalfDone: (result) => {
        if (result.output) {
          const calcPages = skipFirstPage ? (pageCount - 1) * 2 + 1 : pageCount * 2;
          setOutput({
            blob: result.output,
            name: result.outputName || `${fileRef.current?.name.replace(/\.pdf$/i, '')}_split_half.pdf`,
            totalPages: calcPages,
          });
          setPhase('done');
        } else {
          setErrorMsg(isTrRef.current ? 'Sayfa bölme işlemi tamamlanamadı.' : 'Failed to split pages in half.');
          setPhase('options');
        }
      },
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setPhase('upload');
      },
      onFatal: (msg) => {
        setToast({ kind: 'error', message: msg || (isTrRef.current ? 'Hata oluştu' : 'An error occurred') });
        setPhase('options');
      },
    });

    return () => {
      controller.current?.dispose();
    };
  }, [pageCount, skipFirstPage, t.corruptFile, t.encryptedFile]);

  // Load thumbnail when file changes
  useEffect(() => {
    if (file && !thumbnailUrl && controller.current) {
      let isMounted = true;
      controller.current
        .previewPage(file, 1, 140)
        .then((blob) => {
          if (isMounted) {
            setThumbnailUrl(URL.createObjectURL(blob));
          }
        })
        .catch((e) => {
          console.warn('Thumbnail generation failed:', e);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [file, thumbnailUrl]);

  const addFile = useCallback(
    async (incoming: File[]) => {
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
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        setFile(f);
        setPhase('options');
      } catch (e) {
        console.warn('Error reading PDF:', e);
        setPageCount(1);
        setFile(f);
        setPhase('options');
      }
    },
    [t.emptyFile, t.notPdf]
  );

  const executeSplit = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress({ processed: 0, total: pageCount });

    try {
      await controller.current?.runSplitHalf(file, {
        splitDirection,
        readingOrder,
        skipFirstPage,
      });
    } catch (e: any) {
      console.error(e);
      setToast({ kind: 'error', message: e?.message || (isTr ? 'İşlem başarısız oldu' : 'Split failed') });
      setPhase('options');
    }
  };

  const reset = useCallback(() => {
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    setFile(null);
    setPageCount(0);
    setThumbnailUrl(null);
    setOutput(null);
    setErrorMsg(null);
    setSplitDirection('vertical');
    setReadingOrder('ltr');
    setSkipFirstPage(false);
    setPhase('upload');
  }, [thumbnailUrl]);

  const calculatedOutputPages = skipFirstPage ? Math.max(1, (pageCount - 1) * 2 + 1) : pageCount * 2;

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {/* Upload Phase */}
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Options Phase */}
      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* File Card with Interactive Slicing Preview */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            {/* Visual Spread Thumbnail with Slicing Guideline */}
            <div className="relative aspect-[1.4/1] w-36 sm:w-44 shrink-0 rounded-xl border border-ink-faint bg-white overflow-hidden shadow-xs flex items-center justify-center mx-auto md:mx-0">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Spread Preview" className="h-full w-full object-contain" />
              ) : (
                <BookOpen className="h-8 w-8 text-ink-muted" />
              )}

              {/* Dynamic Slicing Cut Overlay Guideline */}
              {splitDirection === 'vertical' ? (
                <div className="absolute inset-y-0 left-1/2 w-0 border-r-2 border-dashed border-amber drop-shadow-[0_0_4px_rgba(232,182,95,0.8)] flex items-center justify-center">
                  <div className="rounded-full bg-amber text-[#1D1108] p-1 shadow-sm -ml-[1px]">
                    <Scissors className="h-3 w-3" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-x-0 top-1/2 h-0 border-b-2 border-dashed border-amber drop-shadow-[0_0_4px_rgba(232,182,95,0.8)] flex items-center justify-center">
                  <div className="rounded-full bg-amber text-[#1D1108] p-1 shadow-sm -mt-[1px]">
                    <Scissors className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>

            {/* Document Details & Quick Info */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber-dark">
                  {isTr ? 'Çift Sayfalı Doküman' : 'Dual-Page Document'}
                </span>
                <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                  {pageCount} {isTr ? 'Geniş Sayfa' : 'Spread Pages'}
                </span>
              </div>
              <h3 className="truncate text-sm font-semibold text-ink dark:text-ink-dark mt-1" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr
                  ? `Her bir çift sayfa ortadan kesilerek toplam ${calculatedOutputPages} tekil sayfaya dönüştürülecek.`
                  : `Each 2-page spread will be sliced down the middle into ${calculatedOutputPages} individual pages.`}
              </p>
            </div>
          </div>

          {/* Slicing Controls & Options */}
          <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-5 dark:bg-surface-dark">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
              <SlidersHorizontal className="h-4 w-4 text-amber dark:text-amber-dark" />
              <span>{isTr ? 'Bölme Ayarları' : 'Split Settings'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Split Direction */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Bölme Yönü (Kesim Ekseni):' : 'Split Direction:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitDirection('vertical')}
                    className={`btn-motion flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                      splitDirection === 'vertical'
                        ? 'border-amber bg-amber/10 text-[#1D1108] font-bold shadow-xs dark:border-amber-dark dark:bg-amber-dark/20 dark:text-white'
                        : 'border-ink-faint bg-bg hover:border-ink-muted text-ink dark:bg-bg-dark dark:text-ink-dark'
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4 text-amber dark:text-amber-dark shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold">{isTr ? 'Dikey Bölme' : 'Vertical Cut'}</span>
                      <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Sol ve Sağ Sayfa' : 'Left & Right Pages'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitDirection('horizontal')}
                    className={`btn-motion flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                      splitDirection === 'horizontal'
                        ? 'border-amber bg-amber/10 text-[#1D1108] font-bold shadow-xs dark:border-amber-dark dark:bg-amber-dark/20 dark:text-white'
                        : 'border-ink-faint bg-bg hover:border-ink-muted text-ink dark:bg-bg-dark dark:text-ink-dark'
                    }`}
                  >
                    <ArrowUpDown className="h-4 w-4 text-amber dark:text-amber-dark shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold">{isTr ? 'Yatay Bölme' : 'Horizontal Cut'}</span>
                      <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Üst ve Alt Sayfa' : 'Top & Bottom Pages'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Reading Order */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Okuma / Sayfa Sıralaması:' : 'Reading Order:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingOrder('ltr')}
                    className={`btn-motion flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                      readingOrder === 'ltr'
                        ? 'border-amber bg-amber/10 text-[#1D1108] font-bold shadow-xs dark:border-amber-dark dark:bg-amber-dark/20 dark:text-white'
                        : 'border-ink-faint bg-bg hover:border-ink-muted text-ink dark:bg-bg-dark dark:text-ink-dark'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold">{isTr ? 'Soldan Sağa (LTR)' : 'Left to Right (LTR)'}</span>
                      <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? '1. Sol, 2. Sağ (Standart)' : '1. Left, 2. Right (Default)'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReadingOrder('rtl')}
                    className={`btn-motion flex items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all ${
                      readingOrder === 'rtl'
                        ? 'border-amber bg-amber/10 text-[#1D1108] font-bold shadow-xs dark:border-amber-dark dark:bg-amber-dark/20 dark:text-white'
                        : 'border-ink-faint bg-bg hover:border-ink-muted text-ink dark:bg-bg-dark dark:text-ink-dark'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold">{isTr ? 'Sağdan Sola (RTL)' : 'Right to Left (RTL)'}</span>
                      <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? '1. Sağ, 2. Sol (Manga/Arapça)' : '1. Right, 2. Left (Manga)'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Skip First Page (Cover Protection) Toggle */}
            <div className="pt-2 border-t border-ink-faint dark:border-ink-faint-dark">
              <label
                className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none p-3 rounded-lg border transition-all ${
                  skipFirstPage
                    ? 'border-amber bg-amber/15 text-ink dark:border-amber-dark dark:bg-amber-dark/20 dark:text-ink-dark shadow-xs'
                    : 'border-ink-faint bg-bg/40 text-ink hover:border-amber/60 hover:bg-amber/10 dark:border-ink-faint-dark dark:bg-bg-dark/40 dark:text-ink-dark dark:hover:border-amber-dark/60 dark:hover:bg-amber-dark/15'
                }`}
              >
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-faint text-amber focus:ring-amber dark:border-ink-faint-dark dark:bg-surface-dark"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {isTr ? 'İlk sayfayı bölme (Tekli Kapak Sayfası Olarak Koru)' : 'Skip first page (Keep single cover page intact)'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                    {isTr
                      ? 'Kitap taramalarında 1. sayfa genellikle tekli kapaktır. İşaretlenirse 1. sayfa bölünmez, 2. sayfadan itibaren bölünür.'
                      : 'Cover page remains a full single sheet; splitting begins from page 2.'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
            <button
              type="button"
              onClick={reset}
              className="btn-motion rounded-lg border border-ink-faint bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-ink-muted hover:bg-bg/40 dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark/40"
            >
              {t.cancel || (isTr ? 'Farklı Dosya Seç' : 'Choose Another File')}
            </button>

            <button
              type="button"
              onClick={executeSplit}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-105 active:brightness-95 hover:shadow-[0_18px_36px_-10px_rgba(232,182,95,0.65)] dark:from-amber-dark dark:to-[#F0C778] cursor-pointer"
            >
              <Scissors className="h-4 w-4" />
              <span>
                {isTr
                  ? `Sayfaları İkiye Böl ve İndir (${calculatedOutputPages} Sayfa)`
                  : `Split Pages in Half & Download (${calculatedOutputPages} Pages)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Phase */}
      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>
              {isTr
                ? `Sayfalar ikiye bölünüyor: ${progress?.processed || 0} / ${progress?.total || pageCount}...`
                : `Splitting pages: ${progress?.processed || 0} of ${progress?.total || pageCount}...`}
            </span>
            <span className="font-mono">
              {progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 50}%
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg border bg-surface dark:bg-surface-dark">
            <div
              className="h-full bg-amber transition-all duration-300 dark:bg-amber-dark"
              style={{
                width: `${progress && progress.total > 0 ? (progress.processed / progress.total) * 100 : 50}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Done Phase */}
      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            customHeadline={
              output
                ? isTr
                  ? `Belge başarıyla ${output.totalPages} tekil sayfaya bölündü!`
                  : `Document successfully split into ${output.totalPages} single pages!`
                : null
            }
            t={t}
            result={
              output
                ? {
                    totalPages: output.totalPages,
                    succeeded: 1,
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
            onDownload={() => output && triggerDownload(output.blob, output.name)}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}

