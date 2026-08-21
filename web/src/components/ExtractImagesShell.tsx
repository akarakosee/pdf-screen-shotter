import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { ExtractImagesResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';
import { Image, ChevronLeft, ChevronRight, Sparkles, Check, ShieldCheck, FileType, Filter, CheckCircle2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

type FormatOption = 'original' | 'png' | 'jpg';

export function ExtractImagesShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractImagesResult | null>(null);
  const controller = useRef<JobController | null>(null);

  // Interactive Options State
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>('original');
  const [filterTinyIcons, setFilterTinyIcons] = useState(false);
  const [pageScope, setPageScope] = useState<'all' | 'custom'>('all');
  const [customPagesInput, setCustomPagesInput] = useState<string>('');

  // Live Preview State
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
      onExtractImagesDone: (res) => {
        if (res.extractedImages > 0 && res.output) {
          setResult(res);
          setPhase('done');
        } else {
          setErrorMsg(null);
          const errMsg = isTr ? 'Bu belgede gömülü resim bulunamadı.' : 'No embedded raster images found in this PDF.';
          setErrorMsg(errMsg);
          setToast({ kind: 'info', message: errMsg });
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

  const validateCustomPagesInput = (input: string, maxPages: number): { isValid: boolean; errorMsg?: string } => {
    const trimmed = input.trim();
    if (!trimmed) {
      return { isValid: false };
    }

    const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      return { isValid: false };
    }

    for (const part of parts) {
      if (part.includes('-')) {
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (!match) {
          return { isValid: false, errorMsg: isTr ? 'Geçersiz aralık formatı.' : 'Invalid range format.' };
        }
        const start = parseInt(match[1], 10);
        const end = parseInt(endStrSafe(match[2]), 10);
        if (start < 1 || end > maxPages || start > end) {
          return {
            isValid: false,
            errorMsg: isTr ? `Sayfa numaraları 1 ile ${maxPages} arasında olmalıdır.` : `Page numbers must be between 1 and ${maxPages}.`
          };
        }
      } else {
        const match = part.match(/^(\d+)$/);
        if (!match) {
          return { isValid: false, errorMsg: isTr ? 'Geçersiz sayfa formatı.' : 'Invalid page format.' };
        }
        const num = parseInt(match[1], 10);
        if (num < 1 || num > maxPages) {
          return {
            isValid: false,
            errorMsg: isTr ? `Sayfa numaraları 1 ile ${maxPages} arasında olmalıdır.` : `Page numbers must be between 1 and ${maxPages}.`
          };
        }
      }
    }

    return { isValid: true };
  };

  const endStrSafe = (val: string) => val;

  const customValidation = validateCustomPagesInput(customPagesInput, totalPages);
  const hasCustomError = pageScope === 'custom' && customPagesInput.trim().length > 0 && !customValidation.isValid;
  const isExecuteDisabled = pageScope === 'custom' && (!customPagesInput.trim() || !customValidation.isValid);

  const parsePageRange = (str: string, max: number): number[] => {
    const pages = new Set<number>();
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= 1 && num <= max) {
          pages.add(num);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleRun = () => {
    if (!file || isExecuteDisabled) return;
    setPhase('processing');

    let effectiveRange: 'all' | number | number[] = 'all';
    if (pageScope === 'custom') {
      const parsed = parsePageRange(customPagesInput, totalPages);
      effectiveRange = parsed.length > 0 ? parsed : 'all';
    }

    controller.current?.runExtractImages(file, {
      format: selectedFormat,
      minSize: filterTinyIcons ? 50 : 0,
      pageRange: effectiveRange,
    });
  };

  const reset = useCallback(() => {
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    setPhase('upload');
    setPreviewPageNum(1);
    setTotalPages(1);
    setSelectedFormat('original');
    setFilterTinyIcons(false);
    setPageScope('all');
    setCustomPagesInput('');
  }, []);

  const formatCards = [
    {
      id: 'original' as FormatOption,
      titleTr: 'Orijinal Format',
      titleEn: 'Original Format',
    },
    {
      id: 'png' as FormatOption,
      titleTr: 'Tümünü PNG Yap',
      titleEn: 'Convert All to PNG',
    },
    {
      id: 'jpg' as FormatOption,
      titleTr: 'Tümünü JPG Yap',
      titleEn: 'Convert All to JPG',
    },
  ];

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
          {/* File Header Bar */}
          <div className="flex items-center gap-3.5 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Image className="h-6 w-6" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Seçilen PDF Belgesi' : 'Target PDF Document'}
              </span>
              <div className="truncate text-sm font-medium pr-2 text-ink dark:text-ink-dark" title={file.name}>
                {file.name}
              </div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr ? `${totalPages} Sayfa` : `${totalPages} Pages`}
              </span>
            </div>
          </div>

          {/* Settings and Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Interactive Options */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              {/* 1. Format */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Çıktı Formatı' : 'Output Format'}
                </label>
                <div className="flex flex-col gap-2">
                  {formatCards.map((c) => {
                    const isSelected = selectedFormat === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedFormat(c.id)}
                        className={`btn-motion flex items-center justify-between h-11 px-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark shadow-sm'
                            : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                        }`}
                      >
                        <span className="text-sm font-semibold text-ink dark:text-ink-dark">
                          {isTr ? c.titleTr : c.titleEn}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-amber dark:text-amber-dark shrink-0 ml-2" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-ink-faint dark:border-ink-faint-dark shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Page Scope */}
              <div className="pt-3 border-t border-ink-faint dark:border-ink-faint-dark flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Sayfa Kapsamı' : 'Page Scope'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageScope('all')}
                    className={`btn-motion flex items-center justify-center h-10 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer text-center ${
                      pageScope === 'all'
                        ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark text-ink dark:text-ink-dark'
                        : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark text-ink-muted dark:text-ink-muted-dark'
                    }`}
                  >
                    {isTr ? `Tüm Sayfalar` : `All Pages`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageScope('custom')}
                    className={`btn-motion flex items-center justify-center h-10 px-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer text-center ${
                      pageScope === 'custom'
                        ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark text-ink dark:text-ink-dark'
                        : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark text-ink-muted dark:text-ink-muted-dark'
                    }`}
                  >
                    {isTr ? `Özel Sayfa Seçimi` : `Custom Pages`}
                  </button>
                </div>

                {/* Custom Page Range Input Box */}
                {pageScope === 'custom' && (
                  <div className="pt-1 flex flex-col gap-1">
                    <input
                      type="text"
                      value={customPagesInput}
                      onChange={(e) => setCustomPagesInput(e.target.value)}
                      placeholder={isTr ? `Sayfa aralığı (örn: 1-2, 4) (Maks: ${totalPages})` : `Pages (e.g. 1-2, 4) (Max: ${totalPages})`}
                      className={`w-full h-10 px-3 rounded-xl border text-xs transition-all ${
                        hasCustomError
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-red-400/50'
                          : 'border-amber/50 bg-bg dark:bg-bg-dark text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-amber dark:focus:ring-amber-dark placeholder:text-ink-muted/50'
                      }`}
                    />
                    {hasCustomError && (
                      <span className="text-[11px] text-red-500 font-medium animate-in fade-in flex items-center gap-1 pl-1">
                        {customValidation.errorMsg}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Filter */}
              <div className="pt-3 border-t border-ink-faint dark:border-ink-faint-dark flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Filtre' : 'Filter'}
                </label>

                <button
                  type="button"
                  onClick={() => setFilterTinyIcons(!filterTinyIcons)}
                  className={`btn-motion flex items-center justify-between h-11 px-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    filterTinyIcons
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Filter className="w-4 h-4 text-amber dark:text-amber-dark shrink-0" />
                    <span className="text-xs font-semibold text-ink dark:text-ink-dark truncate">
                      {isTr ? 'Küçük Simgeleri Filtrele (>50px)' : 'Ignore Tiny Icons (>50px)'}
                    </span>
                  </div>
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                    filterTinyIcons ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark dark:text-white' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {filterTinyIcons && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              </div>

              {/* 4. Quick Specs Bar (Fills remaining height symmetrically) */}
              <div className="mt-auto pt-3 border-t border-ink-faint dark:border-ink-faint-dark grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-ink-faint/60 bg-bg p-2.5 dark:border-ink-faint-dark/60 dark:bg-bg-dark flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-semibold text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Çıktı Biçimi' : 'Package Type'}
                  </span>
                  <span className="font-semibold text-ink dark:text-ink-dark truncate">
                    ZIP Arşivi
                  </span>
                </div>
                <div className="rounded-xl border border-ink-faint/60 bg-bg p-2.5 dark:border-ink-faint-dark/60 dark:bg-bg-dark flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-semibold text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Çözünürlük' : 'Resolution'}
                  </span>
                  <span className="font-semibold text-ink dark:text-ink-dark truncate">
                    {isTr ? 'Orijinal Piksel' : 'Native Pixels'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Document Preview */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[480px] select-none">
              {isPreviewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg/50 dark:bg-bg-dark/50 z-20 backdrop-blur-[1px]">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
                </div>
              )}

              <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-2">
                {previewUrl && (
                  <div className="relative max-h-[450px] w-auto rounded border shadow-lg overflow-hidden transition-all duration-300 ease-out animate-in fade-in zoom-in-95 bg-white">
                    <img
                      key={previewPageNum}
                      src={previewUrl}
                      alt="PDF Page Preview"
                      className="max-h-[450px] w-auto object-contain"
                    />
                  </div>
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
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {t.cancel || (isTr ? 'Vazgeç' : 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={isExecuteDisabled}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isTr ? 'Resimleri Ayıkla ve İndir (ZIP)' : 'Extract Images (ZIP)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || (isTr ? 'Gömülü resimler ayıklanıyor...' : 'Extracting embedded images...')}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
          </div>
        </div>
      )}

      {phase === 'done' && (result || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            customHeadline={
              result && result.output
                ? (isTr
                    ? `${result.extractedImages} adet görsel başarıyla ayıklandı.`
                    : `${result.extractedImages} image${result.extractedImages === 1 ? '' : 's'} successfully extracted.`)
                : null
            }
            t={t}
            result={
              result && result.output
                ? {
                    totalPages: result.totalPages,
                    succeeded: result.extractedImages,
                    failed: [],
                    durationMs: result.durationMs,
                    output: result.output,
                    outputName: result.outputName,
                    cancelled: result.cancelled,
                  }
                : null
            }
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              if (result?.output) triggerDownload(result.output, result.outputName || 'images.zip');
            }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}


