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
import { ResultPanel } from './ResultPanel';
import { Search, FileText, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function ExtractByKeywordShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const [keyword, setKeyword] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [matchWholeWord, setMatchWholeWord] = useState<boolean>(false);

  const [progress, setProgress] = useState<{ message: string; percentage?: number } | null>(null);
  const [result, setResult] = useState<{ res: ExportResult; pagesKept: number } | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const controller = useRef<JobController | null>(null);
  const isTr = t.lang === 'tr';
  const isTrRef = useRef(isTr);
  isTrRef.current = isTr;

  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    controller.current = new JobController({
      onExtractByKeywordProgress: (actionPhase, processed, total) => {
        if (actionPhase === 'extracting') {
          setProgress({
            message: isTrRef.current
              ? `Sayfalar taranıyor: ${processed} / ${total}...`
              : `Searching page ${processed} of ${total}...`,
            percentage: total > 0 ? (processed / total) * 100 : 50,
          });
        } else {
          setProgress({
            message: isTrRef.current ? 'Eşleşen sayfalar kaydediliyor...' : 'Saving matching pages...',
            percentage: 100,
          });
        }
      },
      onExtractByKeywordDone: (res, pagesKept) => {
        setResult({ res, pagesKept });
        setPhase('done');
      },
      onFatal: (message) => {
        setToast({ kind: 'error', message: message || (isTrRef.current ? 'Hata oluştu' : 'An error occurred') });
        setPhase('options');
      },
      onFileError: (_, message) => {
        setToast({
          kind: 'error',
          message:
            message === 'no-matches'
              ? isTrRef.current
                ? 'Aradığınız kelime hiçbir sayfada bulunamadı.'
                : 'Keyword not found on any page.'
              : isTrRef.current
              ? 'Dosya işlenemedi veya bozuk.'
              : 'Could not process file.',
        });
        setPhase('options');
      },
    });

    return () => {
      controller.current?.dispose();
    };
  }, []);

  // Thumbnail loader
  useEffect(() => {
    if (file && !thumbnailUrl && controller.current) {
      let isMounted = true;
      controller.current
        .previewPage(file, 1, 140)
        .then((blob) => {
          if (isMounted) setThumbnailUrl(URL.createObjectURL(blob));
        })
        .catch((e) => console.warn('Thumbnail generation failed:', e));
      return () => {
        isMounted = false;
      };
    }
  }, [file, thumbnailUrl]);

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const f = files[0];
      const rej = await validatePdfFile(f);
      if (rej) {
        setToast({ kind: 'error', message: rej === 'empty-file' ? t.emptyFile : t.notPdf });
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
    if (!file || !keyword.trim()) return;
    setPhase('processing');
    setProgress({
      message: isTr ? 'Tarama başlatılıyor...' : 'Starting search...',
      percentage: 0,
    });
    controller.current?.runExtractByKeyword(file, keyword.trim(), caseSensitive, matchWholeWord);
  }, [caseSensitive, file, isTr, keyword, matchWholeWord]);

  const reset = useCallback(() => {
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    setResult(null);
    setProgress(null);
    setErrorMsg(null);
    setKeyword('');
    setFile(null);
    setPageCount(0);
    setThumbnailUrl(null);
    setPhase('upload');
  }, [thumbnailUrl]);

  const quickSuggestions = isTr
    ? ['FATURA', 'GİZLİ', 'VERGİ', 'SÖZLEŞME', 'RAPOR', 'INVOICE']
    : ['INVOICE', 'CONFIDENTIAL', 'TAX', 'CONTRACT', 'REPORT', 'PAYMENT'];

  return (
    <div className="w-full flex flex-col gap-5">
      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}

      {/* Upload Phase */}
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFiles} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Options Phase */}
      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Document Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <div className="relative aspect-[1/1.3] w-24 shrink-0 rounded-xl border border-ink-faint bg-white overflow-hidden shadow-xs flex items-center justify-center mx-auto md:mx-0">
              {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="Preview" className="h-full w-full object-contain" />
              ) : (
                <FileText className="h-8 w-8 text-ink-muted" />
              )}
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  {isTr ? 'Taranacak Belge' : 'Target Document'}
                </span>
                <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                  {pageCount} {isTr ? 'Sayfa' : 'Pages'}
                </span>
              </div>
              <h3 className="truncate text-sm font-semibold text-ink dark:text-ink-dark mt-1" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr
                  ? 'Girdiğiniz anahtar kelimenin geçtiği sayfalar filtrelenip yeni bir PDF olarak kaydedilecek.'
                  : 'Pages containing your keyword will be extracted into a new filtered PDF document.'}
              </p>
            </div>
          </div>

          {/* Search Controls Card */}
          <div className="flex flex-col gap-5 rounded-2xl border bg-surface p-5 dark:bg-surface-dark">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark flex items-center gap-2">
                <Search className="h-4 w-4 text-amber dark:text-amber-dark" />
                <span>{isTr ? 'Aranacak Anahtar Kelime veya İfade:' : 'Keyword or Phrase to Search:'}</span>
              </label>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={keyword}
                  placeholder={isTr ? 'Örn: FATURA, GİZLİ, VERGİ, SÖZLEŞME...' : 'e.g. Invoice, Confidential, Tax...'}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && keyword.trim()) processFile();
                  }}
                  autoFocus
                  className="h-12 w-full rounded-xl border border-ink-faint bg-bg/50 px-4 pl-11 text-sm font-medium text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/20 dark:bg-bg-dark/50 dark:border-ink-faint-dark dark:text-ink-dark"
                />
                <Search className="absolute left-3.5 h-4 w-4 text-ink-muted" />
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Hızlı Örnekler:' : 'Quick Suggestions:'}
              </span>
              {quickSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setKeyword(sug)}
                  className={`btn-motion px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    keyword === sug
                      ? 'border-amber bg-amber/15 text-amber-dark font-bold'
                      : 'border-ink-faint bg-bg/40 text-ink-muted hover:border-amber/50 hover:text-ink dark:bg-bg-dark/40 dark:text-ink-muted-dark dark:hover:text-ink-dark'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Matching Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
              <label
                className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none p-3 rounded-lg border transition-all ${
                  caseSensitive
                    ? 'border-amber bg-amber/15 text-ink dark:border-amber-dark dark:bg-amber-dark/20 dark:text-ink-dark'
                    : 'border-ink-faint bg-bg/40 text-ink hover:border-amber/60 hover:bg-amber/10 dark:border-ink-faint-dark dark:bg-bg-dark/40 dark:text-ink-dark dark:hover:border-amber-dark/60 dark:hover:bg-amber-dark/15'
                }`}
              >
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-faint text-amber focus:ring-amber dark:border-ink-faint-dark dark:bg-surface-dark"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{isTr ? 'Büyük / Küçük Harfe Duyarlı' : 'Case Sensitive Match'}</span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Yalnızca birebir aynı harf boyutunu arar' : 'Exact letter casing only'}
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none p-3 rounded-lg border transition-all ${
                  matchWholeWord
                    ? 'border-amber bg-amber/15 text-ink dark:border-amber-dark dark:bg-amber-dark/20 dark:text-ink-dark'
                    : 'border-ink-faint bg-bg/40 text-ink hover:border-amber/60 hover:bg-amber/10 dark:border-ink-faint-dark dark:bg-bg-dark/40 dark:text-ink-dark dark:hover:border-amber-dark/60 dark:hover:bg-amber-dark/15'
                }`}
              >
                <input
                  type="checkbox"
                  checked={matchWholeWord}
                  onChange={(e) => setMatchWholeWord(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-faint text-amber focus:ring-amber dark:border-ink-faint-dark dark:bg-surface-dark"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{isTr ? 'Tam Kelime Eşleşmesi' : 'Whole Word Only'}</span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Kelimelerin içindeki ekleri eşleştirmez' : 'Exclude substrings / partial words'}
                  </span>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
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
                onClick={processFile}
                disabled={!keyword.trim()}
                className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-105 active:brightness-95 hover:shadow-[0_18px_36px_-10px_rgba(232,182,95,0.65)] dark:from-amber-dark dark:to-[#F0C778] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>{isTr ? 'Eşleşen Sayfaları Çıkar' : 'Extract Matching Pages'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Phase */}
      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{progress?.message || (isTr ? 'İşleniyor...' : 'Searching document...')}</span>
            <span className="font-mono">{Math.round(progress?.percentage || 50)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg border bg-surface dark:bg-surface-dark">
            <div
              className="h-full bg-amber transition-all duration-300 dark:bg-amber-dark"
              style={{
                width: `${progress?.percentage || 50}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Done Phase */}
      {phase === 'done' && (result || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            customHeadline={
              result
                ? isTr
                  ? `"${keyword}" kelimesi ${result.pagesKept} sayfada bulundu ve çıkarıldı!`
                  : `Keyword "${keyword}" matched on ${result.pagesKept} pages!`
                : null
            }
            t={t}
            result={result?.res || null}
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              if (result?.res.output) triggerDownload(result.res.output, result.res.outputName || 'extracted.pdf');
            }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}

