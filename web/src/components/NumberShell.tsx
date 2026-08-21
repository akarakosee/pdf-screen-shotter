import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import {
  Hash,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'options' | 'processing' | 'done';

type Position =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right';

type NumberStyle = 'simple' | 'prefix' | 'slash' | 'full' | 'roman';

function toRoman(num: number): string {
  if (num <= 0 || isNaN(num)) return num.toString();
  const lookup: [string, number][] = [
    ['M', 1000],
    ['CM', 900],
    ['D', 500],
    ['CD', 400],
    ['C', 100],
    ['XC', 90],
    ['L', 50],
    ['XL', 40],
    ['X', 10],
    ['IX', 9],
    ['V', 5],
    ['IV', 4],
    ['I', 1],
  ];
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i][1]) {
      roman += lookup[i][0];
      num -= lookup[i][1];
    }
  }
  return roman;
}

function getPageNumberText(
  style: NumberStyle,
  current: number,
  total: number,
  isTr: boolean
): string {
  switch (style) {
    case 'prefix':
      return isTr ? `Sayfa ${current}` : `Page ${current}`;
    case 'slash':
      return `${current} / ${total}`;
    case 'full':
      return isTr ? `Sayfa ${current} / ${total}` : `Page ${current} of ${total}`;
    case 'roman':
      return toRoman(current);
    case 'simple':
    default:
      return current.toString();
  }
}

interface Props {
  t?: Strings;
}

export function NumberShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [styleMode, setStyleMode] = useState<NumberStyle>('slash');
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [fontSizePt, setFontSizePt] = useState<10 | 12 | 14>(12);

  // Live Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cacheRef = useRef<Map<number, string>>(new Map());
  const controller = useRef<JobController | null>(null);

  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const isTr = t.lang === 'tr';

  useEffect(() => {
    controller.current = new JobController({});
    return () => {
      controller.current?.dispose();
    };
  }, []);

  const addFile = useCallback(
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

      try {
        const buf = await f.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setTotalPages(Math.max(1, pdfDoc.getPageCount()));
      } catch {
        setTotalPages(1);
      }

      setFile(f);
      setPreviewPageNum(1);
      cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
      cacheRef.current = new Map();
      setPhase('options');
    },
    [t]
  );

  // Page preview with caching & prefetching
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;

    const cached = cacheRef.current.get(previewPageNum);
    if (cached) {
      setPreviewUrl(cached);
      setIsPreviewLoading(false);
    } else {
      setIsPreviewLoading(true);
      controller.current
        ?.previewPage(file, previewPageNum, 140)
        .then((blob) => {
          if (!active) return;
          const u = URL.createObjectURL(blob);
          cacheRef.current.set(previewPageNum, u);
          setPreviewUrl(u);
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
      if (neighbour < 1 || neighbour > totalPages || cacheRef.current.has(neighbour)) continue;
      controller.current
        ?.previewPage(file, neighbour, 140)
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

  const addNumbers = async () => {
    if (!file) return;
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 60));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;

      const totalNumberedPages = skipFirstPage ? total - 1 : total;

      for (let i = 0; i < total; i++) {
        if (skipFirstPage && i === 0) continue;

        const page = pages[i];
        const { width, height } = page.getSize();

        const currentSeq = skipFirstPage ? i : i + 1;
        const currentNumber = startNumber + currentSeq - 1;
        const text = getPageNumberText(
          styleMode,
          currentNumber,
          totalNumberedPages,
          isTr
        );

        const fontSize = fontSizePt;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        const marginX = 36;
        const marginY = 32;

        let x = 0;
        let y = 0;

        if (position.includes('left')) {
          x = marginX;
        } else if (position.includes('right')) {
          x = width - marginX - textWidth;
        } else {
          x = (width - textWidth) / 2;
        }

        if (position.includes('bottom')) {
          y = marginY;
        } else {
          y = height - marginY - textHeight;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const newName = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';

      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('encrypted') || err?.message?.includes('password')) {
        setToast({
          kind: 'error',
          message: isTr
            ? 'Bu belge şifreli. Önce kilidini açmalısınız.'
            : 'This document is encrypted. Please unlock it first.',
        });
      } else {
        setToast({
          kind: 'error',
          message: err?.message || (isTr ? 'Sayfa numaralandırma başarısız oldu.' : 'Failed to add page numbers.'),
        });
      }
      setPhase('options');
    }
  };

  const reset = useCallback(() => {
    cacheRef.current.forEach((u) => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setOutput(null);
    setStyleMode('slash');
    setPosition('bottom-center');
    setStartNumber(1);
    setSkipFirstPage(false);
    setFontSizePt(12);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  const styleOptions: { id: NumberStyle; labelTr: string; labelEn: string; sample: string }[] = [
    { id: 'slash', labelTr: 'Toplam Sayfayla', labelEn: 'With Total', sample: '1 / 4' },
    { id: 'full', labelTr: 'Tam Metin Formatı', labelEn: 'Full Format', sample: isTr ? 'Sayfa 1 / 4' : 'Page 1 of 4' },
    { id: 'simple', labelTr: 'Sadece Sayı', labelEn: 'Number Only', sample: '1, 2, 3...' },
    { id: 'prefix', labelTr: '"Sayfa" Yazısıyla', labelEn: 'With "Page"', sample: isTr ? 'Sayfa 1' : 'Page 1' },
    { id: 'roman', labelTr: 'Romen Rakamı', labelEn: 'Roman Numerals', sample: 'I, II, III...' },
  ];

  const positions: { id: Position; labelTr: string; labelEn: string; row: number; col: number }[] = [
    { id: 'top-left', labelTr: 'Üst Sol', labelEn: 'Top Left', row: 0, col: 0 },
    { id: 'top-center', labelTr: 'Üst Orta', labelEn: 'Top Center', row: 0, col: 1 },
    { id: 'top-right', labelTr: 'Üst Sağ', labelEn: 'Top Right', row: 0, col: 2 },
    { id: 'bottom-left', labelTr: 'Alt Sol', labelEn: 'Bottom Left', row: 1, col: 0 },
    { id: 'bottom-center', labelTr: 'Alt Orta', labelEn: 'Bottom Center', row: 1, col: 1 },
    { id: 'bottom-right', labelTr: 'Alt Sağ', labelEn: 'Bottom Right', row: 1, col: 2 },
  ];

  const currentPreviewSampleText =
    skipFirstPage && previewPageNum === 1
      ? isTr
        ? '(Kapak - Numara Yok)'
        : '(Cover - No Number)'
      : getPageNumberText(
          styleMode,
          startNumber + (skipFirstPage ? previewPageNum - 2 : previewPageNum - 1),
          skipFirstPage ? totalPages - 1 : totalPages,
          isTr
        );

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
              <Hash className="h-6 w-6" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Seçilen PDF Belgesi' : 'Target PDF Document'}
              </span>
              <div className="truncate text-sm font-medium pr-2 text-ink dark:text-ink-dark" title={file.name}>
                {file.name}
              </div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr ? `${totalPages} Sayfa · ${(file.size / 1024 / 1024).toFixed(2)} MB` : `${totalPages} Pages · ${(file.size / 1024 / 1024).toFixed(2)} MB`}
              </span>
            </div>
          </div>

          {/* Settings and Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Options */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              {/* 1. Interactive Position Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Numara Konumu' : 'Position on Page'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {positions.map((p) => {
                    const isSelected = position === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPosition(p.id)}
                        className={`btn-motion flex flex-col items-center justify-center h-12 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark text-ink dark:text-ink-dark font-semibold shadow-sm'
                            : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark text-ink-muted dark:text-ink-muted-dark'
                        }`}
                      >
                        <span>{isTr ? p.labelTr : p.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Format / Style Selector */}
              <div className="pt-3 border-t border-ink-faint dark:border-ink-faint-dark flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Numaralandırma Stili' : 'Number Style'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {styleOptions.map((s) => {
                    const isSelected = styleMode === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyleMode(s.id)}
                        className={`btn-motion flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark shadow-sm'
                            : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-1">
                          <span className="text-xs font-semibold text-ink dark:text-ink-dark truncate">
                            {isTr ? s.labelTr : s.labelEn}
                          </span>
                          <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark font-mono truncate">
                            {s.sample}
                          </span>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-amber dark:text-amber-dark shrink-0 ml-1" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-ink-faint dark:border-ink-faint-dark shrink-0 ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Start Number & Font Size Grid */}
              <div className="pt-3 border-t border-ink-faint dark:border-ink-faint-dark grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="start-num-input" className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Başlangıç No' : 'Start Number'}
                  </label>
                  <input
                    id="start-num-input"
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-10 px-3 rounded-xl border border-ink-faint bg-bg dark:bg-bg-dark text-xs text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-amber dark:focus:ring-amber-dark font-mono font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Yazı Boyutu' : 'Font Size'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 h-10">
                    {([10, 12, 14] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFontSizePt(sz)}
                        className={`btn-motion flex items-center justify-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          fontSizePt === sz
                            ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark text-ink dark:text-ink-dark'
                            : 'border-ink-faint bg-bg dark:bg-bg-dark text-ink-muted dark:text-ink-muted-dark hover:bg-surface'
                        }`}
                      >
                        {sz}pt
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Skip First Page (Cover) Toggle */}
              <div className="pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
                <button
                  type="button"
                  onClick={() => setSkipFirstPage(!skipFirstPage)}
                  className={`btn-motion flex items-center justify-between h-11 px-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer w-full ${
                    skipFirstPage
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                    {isTr ? 'İlk Sayfayı Numaralandırma (Kapak Sayfası)' : 'Skip First Page (Cover Page)'}
                  </span>
                  <div
                    className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors shrink-0 ml-2 ${
                      skipFirstPage
                        ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark dark:text-white'
                        : 'border-ink-faint dark:border-ink-faint-dark'
                    }`}
                  >
                    {skipFirstPage && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
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

                    {/* Live Virtual Stamp Overlay Marker on Preview */}
                    <div
                      className={`absolute pointer-events-none transition-all duration-200 z-10 px-2 py-0.5 rounded shadow-sm text-xs font-mono font-bold backdrop-blur-sm ${
                        skipFirstPage && previewPageNum === 1
                          ? 'opacity-40 line-through bg-gray-200/90 text-gray-600'
                          : 'bg-amber text-[#1D1108] ring-1 ring-amber-dark/30 animate-pulse'
                      } ${
                        position === 'top-left'
                          ? 'top-4 left-4'
                          : position === 'top-center'
                          ? 'top-4 left-1/2 -translate-x-1/2'
                          : position === 'top-right'
                          ? 'top-4 right-4'
                          : position === 'bottom-left'
                          ? 'bottom-4 left-4'
                          : position === 'bottom-right'
                          ? 'bottom-4 right-4'
                          : 'bottom-4 left-1/2 -translate-x-1/2'
                      }`}
                    >
                      {currentPreviewSampleText}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Chevrons */}
              <div className="absolute bottom-3 flex items-center gap-2 bg-surface/90 dark:bg-surface-dark/90 px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md border border-ink-faint dark:border-ink-faint-dark z-10 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setPreviewPageNum((p) => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  aria-label={isTr ? 'Önceki Sayfa' : 'Previous Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono min-w-[4rem] text-center font-medium select-none text-ink dark:text-ink-dark">
                  {isTr
                    ? `Sayfa ${previewPageNum} / ${totalPages}`
                    : `Page ${previewPageNum} of ${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPageNum((p) => Math.min(totalPages, p + 1))}
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
              onClick={addNumbers}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778]"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isTr ? 'Sayfa Numaralarını Ekle ve İndir' : 'Add Page Numbers & Download'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || (isTr ? 'Sayfa numaraları damgalanıyor...' : 'Adding page numbers...')}</span>
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
                  ? 'Sayfa numaraları başarıyla eklendi!'
                  : 'Page numbers successfully added!'
                : null
            }
            t={t}
            result={
              output
                ? {
                    totalPages,
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
