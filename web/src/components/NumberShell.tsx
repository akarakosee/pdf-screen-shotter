import { useCallback, useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Hash, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

type Position = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';

type NumberStyle = 'simple' | 'prefix' | 'slash' | 'full' | 'roman' | 'roman-slash';

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

function getPageNumberText(style: NumberStyle, current: number, total: number, lang: 'tr' | 'en'): string {
  switch (style) {
    case 'prefix':
      return lang === 'tr' ? `Sayfa ${current}` : `Page ${current}`;
    case 'slash':
      return `${current} / ${total}`;
    case 'full':
      return lang === 'tr' ? `Sayfa ${current} / ${total}` : `Page ${current} of ${total}`;
    case 'roman':
      return toRoman(current);
    case 'roman-slash':
      return `${toRoman(current)} / ${toRoman(total)}`;
    case 'simple':
    default:
      return current.toString();
  }
}

async function createNumberPng(text: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve({ dataUrl: '', width: 0, height: 0 });
      return;
    }

    const fontSize = 36; // 3x high-res for 12pt output
    ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    const metrics = ctx.measureText(text);
    const textWidth = Math.max(20, Math.ceil(metrics.width));
    const textHeight = Math.ceil(fontSize * 1.4);

    canvas.width = textWidth + 10;
    canvas.height = textHeight + 10;

    ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgb(30, 30, 30)';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    resolve({
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    });
  });
}

interface Props {
  t?: Strings;
}

export function NumberShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [styleMode, setStyleMode] = useState<NumberStyle>('simple');
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    setFile(f);
    setPhase('options');
  }, [t]);

  const addNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        const currentNumber = startNumber + i;
        const text = getPageNumberText(styleMode, currentNumber, total, t.lang === 'tr' ? 'tr' : 'en');

        const { dataUrl, width: imgW, height: imgH } = await createNumberPng(text);
        const pngImage = await pdfDoc.embedPng(dataUrl);

        const drawW = imgW / 3;
        const drawH = imgH / 3;

        const marginX = 36;
        const marginY = 36;

        let x = 0;
        let y = 0;

        if (position.includes('left')) {
          x = marginX;
        } else if (position.includes('right')) {
          x = width - marginX - drawW;
        } else {
          x = width / 2 - drawW / 2;
        }

        if (position.includes('bottom')) {
          y = marginY;
        } else {
          y = height - marginY - drawH;
        }

        page.drawImage(pngImage, {
          x,
          y,
          width: drawW,
          height: drawH,
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
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.' });
      } else {
        setToast({ kind: 'error', message: err?.message || 'Failed to add page numbers.' });
      }
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setStyleMode('simple');
    setPosition('bottom-center');
    setStartNumber(1);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Hash className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              <label htmlFor="position-select" className="text-sm font-medium">
                {t.lang === 'tr' ? 'Konum' : 'Position'}
              </label>
              <select
                id="position-select"
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="h-11 w-full rounded-lg border bg-bg px-3 text-sm focus:border-amber focus:outline-none dark:bg-bg-dark"
              >
                <option value="bottom-center">{t.lang === 'tr' ? 'Alt Orta' : 'Bottom Center'}</option>
                <option value="bottom-left">{t.lang === 'tr' ? 'Alt Sol' : 'Bottom Left'}</option>
                <option value="bottom-right">{t.lang === 'tr' ? 'Alt Sağ' : 'Bottom Right'}</option>
                <option value="top-center">{t.lang === 'tr' ? 'Üst Orta' : 'Top Center'}</option>
                <option value="top-left">{t.lang === 'tr' ? 'Üst Sol' : 'Top Left'}</option>
                <option value="top-right">{t.lang === 'tr' ? 'Üst Sağ' : 'Top Right'}</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              <label htmlFor="start-input" className="text-sm font-medium">
                {t.lang === 'tr' ? 'Başlangıç Numarası' : 'Starting Number'}
              </label>
              <input
                id="start-input"
                type="number"
                min="1"
                value={startNumber}
                onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                className="h-11 w-full rounded-lg border bg-bg px-3 text-sm focus:border-amber focus:outline-none dark:bg-bg-dark"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 sm:col-span-2 dark:bg-surface-dark">
              <span className="text-sm font-medium">
                {t.lang === 'tr' ? 'Gösterim Şekli' : 'Number Style'}
              </span>

              {/* 6 Clean Mode Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(t.lang === 'tr'
                  ? [
                      { id: 'simple', title: 'Sadece Rakam', example: '1, 2, 3...' },
                      { id: 'prefix', title: '"Sayfa" Yazısıyla', example: 'Sayfa 1, Sayfa 2...' },
                      { id: 'slash', title: 'Toplam Sayfayla', example: '1 / 10, 2 / 10...' },
                      { id: 'full', title: 'Tam Format', example: 'Sayfa 1 / 10...' },
                      { id: 'roman', title: 'Romen Rakamı', example: 'I, II, III...' },
                      { id: 'roman-slash', title: 'Romen + Toplam', example: 'I / XX, II / XX...' },
                    ]
                  : [
                      { id: 'simple', title: 'Number Only', example: '1, 2, 3...' },
                      { id: 'prefix', title: 'With "Page"', example: 'Page 1, Page 2...' },
                      { id: 'slash', title: 'With Total', example: '1 of 10, 2 of 10...' },
                      { id: 'full', title: 'Full Format', example: 'Page 1 of 10...' },
                      { id: 'roman', title: 'Roman Numerals', example: 'I, II, III...' },
                      { id: 'roman-slash', title: 'Roman + Total', example: 'I / XX, II / XX...' },
                    ]
                ).map((m) => {
                  const active = styleMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setStyleMode(m.id as NumberStyle)}
                      className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                        active
                          ? 'border-amber bg-amber/10 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:bg-amber-dark/20'
                          : 'border-ink-muted/20 dark:border-ink-muted-dark/20 bg-bg hover:border-amber/50 dark:bg-bg-dark'
                      }`}
                    >
                      <span className={`text-xs font-semibold ${active ? 'text-amber dark:text-amber-dark' : 'text-ink dark:text-ink-dark'}`}>
                        {m.title}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark mt-0.5">
                        {m.example}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Preview Box */}
              <div className="mt-1 flex items-center justify-between rounded-lg bg-amber/5 border border-amber/20 px-3.5 py-2.5 text-xs dark:bg-amber-dark/10 dark:border-amber-dark/20">
                <span className="text-ink-muted dark:text-ink-muted-dark font-medium">
                  {t.lang === 'tr' ? 'PDF Üzerinde Görünecek Örnek:' : 'Preview on PDF:'}
                </span>
                <span className="font-mono font-semibold text-amber dark:text-amber-dark bg-surface px-2.5 py-1 rounded border border-amber/30 dark:bg-surface-dark">
                  {getPageNumberText(styleMode, startNumber, 10, t.lang === 'tr' ? 'tr' : 'en')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={addNumbers} disabled={isProcessing}>
              {t.lang === 'tr' ? 'Sayfa Numarası Ekle' : 'Add Page Numbers'}
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-3">
          <div className="flex items-baseline justify-between text-xs text-ink-muted dark:text-ink-muted-dark">
            <span>{t.converting || 'Processing...'}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-lg bg-surface border dark:bg-surface-dark">
            <div className="h-full w-full origin-left animate-custom-pulse bg-ink dark:bg-ink-dark" />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: output?.blob,
              outputName: output?.name,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (output) triggerDownload(output.blob, output.name); }}
            onConvertMore={reset}
          />
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
