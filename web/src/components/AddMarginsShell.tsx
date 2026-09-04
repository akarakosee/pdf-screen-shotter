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
import { Maximize, Layers, BookOpen, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

type Phase = 'upload' | 'options' | 'processing' | 'done';
type MarginMode = 'uniform' | 'gutter' | 'custom';

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

// 1 mm = 2.83465 pt
const MM_TO_PT = 2.83465;

export function AddMarginsShell({ t = en, desktopAppUrl }: Props) {
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

  // Margin states in millimeters
  const [mode, setMode] = useState<MarginMode>('uniform');
  const [uniformMm, setUniformMm] = useState<number>(10);
  const [gutterMm, setGutterMm] = useState<number>(20);
  const [topMm, setTopMm] = useState<number>(10);
  const [rightMm, setRightMm] = useState<number>(10);
  const [bottomMm, setBottomMm] = useState<number>(10);
  const [leftMm, setLeftMm] = useState<number>(20);

  // Preview states
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState<number>(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const cacheRef = useRef<Map<number, string>>(new Map());

  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onAddMarginsProgress: (processed, total) => {
        const pct = total > 0 ? Math.max(10, Math.round((processed / total) * 100)) : 50;
        setProgress({
          message: isTrRef.current
            ? `Sayfalara boşluk ekleniyor: ${processed} / ${total}...`
            : `Adding margins to page ${processed} of ${total}...`,
          percentage: pct,
        });
      },
      onAddMarginsDone: (res) => {
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

  // Real page preview with prefetching
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
      message: isTr ? 'Sayfalara kenar boşlukları ekleniyor...' : 'Applying margins...',
      percentage: 10,
    });

    let marginsPt: { top: number; right: number; bottom: number; left: number };
    if (mode === 'uniform') {
      const pt = Math.max(0, uniformMm) * MM_TO_PT;
      marginsPt = { top: pt, right: pt, bottom: pt, left: pt };
    } else if (mode === 'gutter') {
      const gPt = Math.max(0, gutterMm) * MM_TO_PT;
      marginsPt = { top: 0, right: 0, bottom: 0, left: gPt };
    } else {
      marginsPt = {
        top: Math.max(0, topMm) * MM_TO_PT,
        right: Math.max(0, rightMm) * MM_TO_PT,
        bottom: Math.max(0, bottomMm) * MM_TO_PT,
        left: Math.max(0, leftMm) * MM_TO_PT,
      };
    }

    controller.current?.runAddMargins(file, marginsPt);
  }, [file, isTr, mode, uniformMm, gutterMm, topMm, rightMm, bottomMm, leftMm]);

  const preload = useCallback(() => controller.current?.preload(), []);

  const formattedFileSize = file
    ? file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`
    : '0 KB';

  // Preview margins calculation (in px for miniature visual preview)
  const activeLeftMm = mode === 'uniform' ? uniformMm : mode === 'gutter' ? gutterMm : leftMm;
  const activeRightMm = mode === 'uniform' ? uniformMm : mode === 'gutter' ? 0 : rightMm;
  const activeTopMm = mode === 'uniform' ? uniformMm : mode === 'gutter' ? 0 : topMm;
  const activeBottomMm = mode === 'uniform' ? uniformMm : mode === 'gutter' ? 0 : bottomMm;

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
                <Maximize className="h-5 w-5 text-amber-dark dark:text-amber" />
              )}
            </div>

            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber/15 text-amber-dark font-semibold">
                  {isTr ? 'Kenar Boşluğu' : 'Page Margins'}
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

          {/* Configuration Card with Live Dynamic Page Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 rounded-2xl border bg-surface p-6 shadow-sm dark:bg-surface-dark items-start">
            <div className="flex flex-col gap-6">
              {/* Mode Tabs */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Boşluk Ekleme Modu' : 'Margin Type'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('uniform')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                      mode === 'uniform'
                        ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                        : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {isTr ? 'Eşit (Tüm Kenarlar)' : 'Uniform (All Sides)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('gutter')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                      mode === 'gutter'
                        ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                        : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {isTr ? 'Cilt / Delgeç Payı' : 'Binding Gutter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('custom')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-medium transition-all ${
                      mode === 'custom'
                        ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                        : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                    }`}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    {isTr ? 'Özel / Yönlü' : 'Custom Margins'}
                  </button>
                </div>
              </div>

              {/* Mode-specific Controls */}
              {mode === 'uniform' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
                      {isTr ? 'Hızlı Seçimler (Tüm Kenarlar)' : 'Quick Presets (All Sides)'}
                    </label>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-surface-2 dark:bg-surface-2-dark text-ink dark:text-ink-dark">
                      {uniformMm} mm
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { mm: 5, label: isTr ? '5 mm (Dar)' : '5 mm (Thin)' },
                      { mm: 10, label: isTr ? '10 mm (Normal)' : '10 mm (Normal)' },
                      { mm: 20, label: isTr ? '20 mm (Geniş)' : '20 mm (Wide)' },
                      { mm: 30, label: isTr ? '30 mm (Ekstra)' : '30 mm (Extra)' },
                    ].map((p) => (
                      <button
                        key={p.mm}
                        type="button"
                        onClick={() => setUniformMm(p.mm)}
                        className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                          uniformMm === p.mm
                            ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                            : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={uniformMm}
                      onChange={(e) => setUniformMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-11 flex-1 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                    <span className="text-xs text-ink-muted font-medium">mm (milimetre)</span>
                  </div>
                </div>
              )}

              {mode === 'gutter' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-ink-muted dark:text-ink-muted-dark">
                      {isTr ? 'Ciltleme & Delgeç Seçenekleri (Sol Kenar)' : 'Binding Presets (Left Gutter)'}
                    </label>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-surface-2 dark:bg-surface-2-dark text-ink dark:text-ink-dark">
                      {gutterMm} mm
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { mm: 10, label: isTr ? '10 mm' : '10 mm' },
                      { mm: 15, label: isTr ? '15 mm (Spiral)' : '15 mm (Spiral)' },
                      { mm: 20, label: isTr ? '20 mm (Klasör)' : '20 mm (Ring Binder)' },
                      { mm: 30, label: isTr ? '30 mm (Tez/Kitap)' : '30 mm (Thesis)' },
                    ].map((p) => (
                      <button
                        key={p.mm}
                        type="button"
                        onClick={() => setGutterMm(p.mm)}
                        className={`rounded-xl border py-2 text-xs font-medium transition-all ${
                          gutterMm === p.mm
                            ? 'border-amber bg-amber/15 text-amber-dark font-semibold shadow-xs'
                            : 'border-ink-faint bg-surface hover:bg-surface-2 text-ink-muted dark:bg-surface-dark'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={gutterMm}
                      onChange={(e) => setGutterMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-11 flex-1 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                    <span className="text-xs text-ink-muted font-medium">mm (Sol Kenar)</span>
                  </div>
                </div>
              )}

              {mode === 'custom' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-muted">{isTr ? 'Üst (Top)' : 'Top'}</label>
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={topMm}
                      onChange={(e) => setTopMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-10 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-muted">{isTr ? 'Sağ (Right)' : 'Right'}</label>
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={rightMm}
                      onChange={(e) => setRightMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-10 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-muted">{isTr ? 'Alt (Bottom)' : 'Bottom'}</label>
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={bottomMm}
                      onChange={(e) => setBottomMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-10 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-ink-muted">{isTr ? 'Sol (Left)' : 'Left'}</label>
                    <input
                      type="number"
                      min={0}
                      max={150}
                      value={leftMm}
                      onChange={(e) => setLeftMm(Math.max(0, parseInt(e.target.value) || 0))}
                      className="h-10 rounded-xl border bg-bg px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-amber dark:bg-bg-dark dark:border-border-dark dark:text-ink-dark font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-ink-faint dark:border-ink-faint-dark">
                <Button variant="ghost" onClick={reset} className="w-full sm:w-auto">
                  {t.cancel || (isTr ? 'İptal' : 'Cancel')}
                </Button>
                <Button onClick={processFile} className="w-full sm:w-auto">
                  {isTr ? 'Kenar Boşluklarını Ekle' : 'Add Margins to PDF'}
                </Button>
              </div>
            </div>

            {/* Live Dynamic PDF Page Preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed border-ink-faint bg-bg/50 dark:bg-bg-dark/50 relative overflow-hidden min-h-[440px] select-none">
              <div className="w-full flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark flex items-center gap-1.5">
                  <Maximize className="h-3.5 w-3.5 text-amber-dark dark:text-amber" />
                  {isTr ? 'Canlı Sayfa Önizlemesi' : 'Live Margin Preview'}
                </span>
                <span className="text-[11px] font-mono text-amber-dark dark:text-amber font-semibold bg-amber/10 px-2 py-0.5 rounded">
                  {mode === 'uniform'
                    ? `${uniformMm} mm`
                    : mode === 'gutter'
                    ? `+${gutterMm} mm ${isTr ? 'Sol' : 'Left'}`
                    : `${topMm}/${rightMm}/${bottomMm}/${leftMm} mm`}
                </span>
              </div>

              {/* A4 Sheet Container */}
              <div className="relative w-full max-w-[220px] aspect-[1/1.414] bg-white border border-border shadow-md rounded-md overflow-hidden flex items-center justify-center p-1.5">
                {isPreviewLoading && !previewUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                  </div>
                )}

                {/* Content boundary representing page margins */}
                <div
                  className="w-full h-full flex items-center justify-center transition-all duration-200 border border-dashed border-amber/60 bg-amber/[0.04] rounded-xs overflow-hidden"
                  style={{
                    paddingTop: `${Math.min(32, Math.max(2, activeTopMm * 0.7))}px`,
                    paddingRight: `${Math.min(32, Math.max(2, activeRightMm * 0.7))}px`,
                    paddingBottom: `${Math.min(32, Math.max(2, activeBottomMm * 0.7))}px`,
                    paddingLeft: `${Math.min(32, Math.max(2, activeLeftMm * 0.7))}px`,
                  }}
                >
                  {previewUrl ? (
                    <img
                      key={previewPageNum}
                      src={previewUrl}
                      alt={`Page ${previewPageNum}`}
                      className="w-full h-full object-contain rounded-xs shadow-xs bg-white border border-ink-faint/30 animate-in fade-in zoom-in-95 duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-ink-muted text-xs p-2">
                      <Maximize className="h-6 w-6 text-amber/40 mb-1" />
                      <span>{isTr ? `Sayfa ${previewPageNum}` : `Page ${previewPageNum}`}</span>
                    </div>
                  )}
                </div>

                {/* Gutter punch-hole indicator if gutter / left margin >= 15mm */}
                {activeLeftMm >= 15 && (
                  <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around py-3 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full border border-ink-muted/50 bg-bg/80 shadow-xs" />
                    <div className="w-1.5 h-1.5 rounded-full border border-ink-muted/50 bg-bg/80 shadow-xs" />
                    <div className="w-1.5 h-1.5 rounded-full border border-ink-muted/50 bg-bg/80 shadow-xs" />
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

              <div className="mt-2 text-[10px] font-mono text-ink-muted dark:text-ink-muted-dark text-center">
                {isTr
                  ? `Sol: ${activeLeftMm}mm · Sağ: ${activeRightMm}mm\nÜst: ${activeTopMm}mm · Alt: ${activeBottomMm}mm`
                  : `L: ${activeLeftMm}mm · R: ${activeRightMm}mm\nT: ${activeTopMm}mm · B: ${activeBottomMm}mm`}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel
          cancelling={cancelling}
          label={progress?.message || (isTr ? 'Sayfalara kenar boşlukları ekleniyor...' : 'Applying margins...')}
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
                ? 'Kenar boşlukları tüm sayfalara başarıyla eklendi!'
                : 'Margins successfully added to all pages!'
              : null
          }
          skipped={[]}
          crossLink={null}
          onDownload={() => {
            if (result?.output) triggerDownload(result.output, result.outputName || 'padded.pdf');
          }}
          onConvertMore={reset}
        />
      )}

      {toast && <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
