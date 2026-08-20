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
  const [pageRange, setPageRange] = useState<'all' | 'first'>('all');

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
        if (res.succeeded > 0 && res.output) {
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

  const handleRun = () => {
    if (!file) return;
    setPhase('processing');
    controller.current?.runExtractImages(file, {
      format: selectedFormat,
      minSize: filterTinyIcons ? 50 : 0,
      pageRange: pageRange,
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
    setPageRange('all');
  }, []);

  const formatCards = [
    {
      id: 'original' as FormatOption,
      titleTr: 'Orijinal Format (Önerilen)',
      titleEn: 'Original Format (Recommended)',
      descTr: 'Her görselin belgedeki doğal formatını (PNG, JPG vb.) ve piksel kalitesini korur.',
      descEn: 'Preserves each embedded image in its native format and pixel quality.',
      badgeTr: 'Kayıpsız & En Hızlı',
      badgeEn: 'Lossless & Fastest',
    },
    {
      id: 'png' as FormatOption,
      titleTr: 'Tümünü PNG Yap',
      titleEn: 'Convert All to PNG',
      descTr: 'Tüm görselleri şeffaflık ve yüksek netlik destekli kayıpsız PNG formatına çevirir.',
      descEn: 'Converts all images to lossless PNG with transparency support.',
      badgeTr: 'Şeffaf / Net',
      badgeEn: 'Transparent / Crisp',
    },
    {
      id: 'jpg' as FormatOption,
      titleTr: 'Tümünü JPG Yap',
      titleEn: 'Convert All to JPG',
      descTr: 'Tüm görselleri hafif, yüksek uyumluluk sunan standart JPG formatına çevirir.',
      descEn: 'Converts all images to standard, lightweight JPEG photos.',
      badgeTr: 'Hafif Dosya',
      badgeEn: 'Compact Size',
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? '1. Çıktı Formatını Seçin' : '1. Select Output Format'}
                </label>
              </div>

              {/* Format Cards */}
              <div className="flex flex-col gap-2.5">
                {formatCards.map((c) => {
                  const isSelected = selectedFormat === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedFormat(c.id)}
                      className={`btn-motion flex flex-col p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark shadow-sm'
                          : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-ink dark:text-ink-dark">
                            {isTr ? c.titleTr : c.titleEn}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-amber text-[#1D1108] dark:bg-amber-dark dark:text-white font-semibold'
                              : 'bg-ink-faint/40 text-ink-muted dark:text-ink-muted-dark'
                          }`}>
                            {isTr ? c.badgeTr : c.badgeEn}
                          </span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-amber dark:text-amber-dark shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-ink-faint dark:border-ink-faint-dark shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-ink-muted dark:text-ink-muted-dark mt-1 leading-relaxed">
                        {isTr ? c.descTr : c.descEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Extra Filters */}
              <div className="pt-2 border-t border-ink-faint dark:border-ink-faint-dark flex flex-col gap-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? '2. Filtre ve Kapsam' : '2. Scope & Filter'}
                </label>

                {/* Tiny icons filter toggle */}
                <button
                  type="button"
                  onClick={() => setFilterTinyIcons(!filterTinyIcons)}
                  className={`btn-motion flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    filterTinyIcons
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Filter className="w-4 h-4 text-amber dark:text-amber-dark shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {isTr ? 'Küçük Simgeleri Filtrele (>50px)' : 'Ignore Tiny Icons (>50px)'}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Nokta ve madde işaretlerini atlar, sadece gerçek resimleri alır.' : 'Skips small bullet dots and decorative markers.'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    filterTinyIcons ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark dark:text-white' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {filterTinyIcons && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              </div>

              {/* Guide Note */}
              <div className="mt-auto pt-2 text-xs text-ink-muted dark:text-ink-muted-dark bg-bg dark:bg-bg-dark p-3 rounded-xl border flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber dark:text-amber-dark shrink-0 mt-0.5" />
                <span>
                  {isTr
                    ? 'İşlem tamamen cihazınızda (tarayıcınızda) gerçekleşir. Belgeleriniz sunucuya yüklenmez, %100 gizli kalır.'
                    : 'Extraction processes 100% locally on your device via WebAssembly. Your files are never uploaded to any server.'}
                </span>
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
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778]"
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
            t={t}
            result={result}
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


