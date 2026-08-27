import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import { JobController } from '../app/JobController';
import { Palette, FileText, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

interface ColorPreset {
  id: string;
  nameTr: string;
  nameEn: string;
  hex: string;
  textColor: string;
}

const PRESETS: ColorPreset[] = [
  {
    id: 'sepia',
    nameTr: 'Sıcak Sepya',
    nameEn: 'Warm Sepia',
    hex: '#F4ECD8',
    textColor: '#2E2211',
  },
  {
    id: 'mint',
    nameTr: 'Göz Koruma Yeşili',
    nameEn: 'Eye-Care Mint',
    hex: '#E8F5E9',
    textColor: '#15361B',
  },
  {
    id: 'blue',
    nameTr: 'Pastel Mavi',
    nameEn: 'Soft Blue',
    hex: '#E3F2FD',
    textColor: '#0D274D',
  },
  {
    id: 'cream',
    nameTr: 'Krem & Fildişi',
    nameEn: 'Cream & Ivory',
    hex: '#FFF9E6',
    textColor: '#332914',
  },
  {
    id: 'rose',
    nameTr: 'Gül Kurusu',
    nameEn: 'Soft Rose',
    hex: '#FCE4EC',
    textColor: '#3E1825',
  },
  {
    id: 'dark',
    nameTr: 'Gece Modu',
    nameEn: 'Dark Mode',
    hex: '#1E1E1E',
    textColor: '#FFFFFF',
  },
];

export function ChangeBackgroundShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  const [hexColor, setHexColor] = useState<string>('#F4ECD8');
  const [customInput, setCustomInput] = useState<string>('#F4ECD8');
  const [activePreset, setActivePreset] = useState<string>('sepia');

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
      onChangeBgDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
          const errMsg = isTr ? 'Arka plan rengi uygulanamadı. Lütfen dosyayı kontrol ediniz.' : 'Failed to apply background color.';
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

  const handleSelectPreset = (preset: ColorPreset) => {
    setActivePreset(preset.id);
    setHexColor(preset.hex);
    setCustomInput(preset.hex);
  };

  const handlePickerChange = (val: string) => {
    const upper = val.toUpperCase();
    setHexColor(upper);
    setCustomInput(upper);
    const found = PRESETS.find(p => p.hex.toLowerCase() === upper.toLowerCase());
    setActivePreset(found ? found.id : 'custom');
  };

  const handleTextInputChange = (raw: string) => {
    setCustomInput(raw);
    let clean = raw.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
      let fullHex = clean;
      if (clean.length === 4) {
        fullHex = '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3];
      }
      const upper = fullHex.toUpperCase();
      setHexColor(upper);
      const found = PRESETS.find(p => p.hex.toLowerCase() === upper.toLowerCase());
      setActivePreset(found ? found.id : 'custom');
    }
  };

  const reset = useCallback(() => {
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
    setPreviewPageNum(1);
    setTotalPages(1);
    setHexColor('#F4ECD8');
    setCustomInput('#F4ECD8');
    setActivePreset('sepia');
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
          {/* File Header Bar */}
          <div className="flex items-center gap-3.5 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Palette className="h-6 w-6" />
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

          {/* Color Palettes and Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Preset Palettes & Custom Picker */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Okuma & Zemin Paletleri' : 'Reading & Tint Palettes'}
                </label>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-bg dark:bg-bg-dark border text-ink dark:text-ink-dark">
                  {hexColor.toUpperCase()}
                </span>
              </div>

              {/* Preset Cards Grid (Fixed height, no layout shift) */}
              <div className="grid grid-cols-2 gap-3">
                {PRESETS.map((preset) => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`btn-motion flex h-14 items-center justify-between px-3.5 rounded-2xl border text-left transition-all duration-200 select-none overflow-hidden ${
                        isSelected
                          ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-2 ring-amber dark:ring-amber-dark shadow-sm'
                          : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-black/10 shadow-sm shrink-0 dark:border-white/10"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-xs font-semibold text-ink dark:text-ink-dark truncate">
                          {isTr ? preset.nameTr : preset.nameEn}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-amber dark:text-amber-dark shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Selector Bar */}
              <div className="flex flex-col gap-2 pt-3 border-t dark:border-ink-faint-dark/20">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Özel Renk Seç (Custom HEX)' : 'Custom Color (HEX)'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input
                      type="color"
                      value={hexColor.startsWith('#') && hexColor.length === 7 ? hexColor : '#F4ECD8'}
                      onChange={(e) => handlePickerChange(e.target.value)}
                      className="h-11 w-12 rounded-xl cursor-pointer border border-ink-faint dark:border-ink-faint-dark p-0.5 bg-surface dark:bg-surface-dark"
                    />
                  </div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => handleTextInputChange(e.target.value)}
                    maxLength={7}
                    placeholder="#F4ECD8"
                    className="h-11 w-32 rounded-xl border bg-bg px-3.5 font-mono text-sm font-semibold uppercase text-ink focus:border-amber focus:outline-none dark:bg-bg-dark dark:text-ink-dark dark:focus:border-amber-dark"
                  />
                  <div
                    className="h-11 flex-1 rounded-xl border border-ink-faint dark:border-ink-faint-dark shadow-inner transition-colors duration-200"
                    style={{ backgroundColor: hexColor }}
                  />
                </div>
              </div>

              <div className="mt-auto pt-2 text-xs text-ink-muted dark:text-ink-muted-dark bg-bg dark:bg-bg-dark p-3 rounded-xl border">
                <strong>{isTr ? 'İpucu:' : 'Tip:'}</strong> {isTr ? 'Sepya ve Krem tonları göz yorgunluğunu %60 oranında azaltarak uzun okumalarda konfor sağlar.' : 'Sepia and warm ivory tints significantly reduce blue-light glare and eye strain during long reading.'}
              </div>
            </div>

            {/* Right Column: Interactive Live Document Preview with Color Tint */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[480px] select-none">
              {isPreviewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg/50 dark:bg-bg-dark/50 z-20 backdrop-blur-[1px]">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
                </div>
              )}

              <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-2">
                {previewUrl && (
                  <div
                    className="relative max-h-[450px] w-auto rounded border shadow-lg overflow-hidden transition-all duration-300 ease-out animate-in fade-in zoom-in-95"
                    style={{ backgroundColor: hexColor }}
                  >
                    <img
                      key={previewPageNum}
                      src={previewUrl}
                      alt="PDF Page Tint Preview"
                      className="max-h-[450px] w-auto object-contain transition-all duration-200"
                      style={
                        hexColor.toLowerCase() === '#1e1e1e' || hexColor.toLowerCase() === '#121212' || hexColor.toLowerCase() === '#000000'
                          ? { filter: 'invert(0.92) hue-rotate(180deg)' }
                          : { mixBlendMode: 'multiply' }
                      }
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

          {/* Action Buttons Bar */}
          <div className="flex justify-between items-center mt-2 border-t dark:border-ink-faint-dark/20 pt-4">
            <button
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {isTr ? 'İptal' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                setPhase('processing');
                controller.current?.runChangeBackground(file, hexColor);
              }}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] disabled:pointer-events-none disabled:opacity-50 dark:from-amber-dark dark:to-[#F0C778]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isTr ? 'Arka Plan Rengini Uygula' : 'Apply Background Color'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={isTr ? 'Arka plan rengi PDF sayfalarına işleniyor...' : 'Applying background color tint to PDF pages...'} />
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

