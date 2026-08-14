import { useCallback, useRef, useState, useEffect } from 'react';
import { JobController } from '../app/JobController';
import { PDFDocument } from 'pdf-lib';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import { signPdf, type SignaturePlacement } from '../engine/signPdf';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { PenTool, Type, Upload, Eraser, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';
type SignMode = 'draw' | 'type' | 'upload';
type PageTarget = 'last' | 'first' | 'all' | 'custom';
type PositionPreset =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'custom';

interface Props {
  t?: Strings;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function SignShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; pagesSigned: number } | null>(null);

  // Sign mode & options
  const [mode, setMode] = useState<SignMode>('draw');
  const [typedName, setTypedName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [pageTarget, setPageTarget] = useState<PageTarget>('last');
  const [customPageNum, setCustomPageNum] = useState<number>(1);
  const [position, setPosition] = useState<PositionPreset>('bottom-right');
  const [customBox, setCustomBox] = useState<{
    xFrac: number;
    yFrac: number;
    widthFrac: number;
    heightFrac: number;
  }>({
    xFrac: 0.65,
    yFrac: 0.82,
    widthFrac: 0.28,
    heightFrac: 0.12,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [previewPageNum, setPreviewPageNum] = useState<number>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [drawnDataUrl, setDrawnDataUrl] = useState<string | null>(null);
  const [isPlacingBox, setIsPlacingBox] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  // A drag/resize release always fires a native click on mouseup right after;
  // without this guard handlePreviewClick immediately re-centers the box on
  // the release point, making it look like the box "jumps" after every drop.
  const suppressNextClickRef = useRef(false);

  const controllerRef = useRef<JobController | null>(null);
  const getController = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onInspect: (fileId, pageCount) => {
          setTotalPages(pageCount);
          setPreviewPageNum(pageCount);
        },
        onFatal: () => {
          setToast({ kind: 'error', message: 'Worker failed — try reloading the page' });
        },
        onUnavailable: () => {
          setToast({ kind: 'error', message: 'Preview unavailable — worker disabled' });
        },
      });
    }
    return controllerRef.current;
  }, []);

  useEffect(() => {
    return () => controllerRef.current?.dispose();
  }, []);

  // Load PDF metadata (page count) when file is selected
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    void getController().inspect('sign1', file);
  }, [file, getController]);

  // Load preview image for selected page
  useEffect(() => {
    if (!file) return;
    let active = true;
    setIsLoadingPreview(true);
    getController()
      .previewPage(file, previewPageNum, 400)
      .then((blob) => {
        if (active) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setIsLoadingPreview(false);
        }
      })
      .catch(() => {
        if (active) setIsLoadingPreview(false);
      });
    return () => { active = false; };
  }, [file, previewPageNum, getController]);

  const handleBoxMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startXFrac = customBox.xFrac;
    const startYFrac = customBox.yFrac;
    const rect = container.getBoundingClientRect();
    setIsPlacingBox(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newXFrac = Math.max(0, Math.min(1 - customBox.widthFrac, startXFrac + deltaX / rect.width));
      const newYFrac = Math.max(0, Math.min(1 - customBox.heightFrac, startYFrac + deltaY / rect.height));
      setCustomBox((prev) => ({ ...prev, xFrac: newXFrac, yFrac: newYFrac }));
      setPosition('custom');
    };

    const onMouseUp = () => {
      setIsPlacingBox(false);
      suppressNextClickRef.current = true;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const container = previewContainerRef.current;
    if (!container) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWFrac = customBox.widthFrac;
    const startHFrac = customBox.heightFrac;
    const rect = container.getBoundingClientRect();
    setIsPlacingBox(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWFrac = Math.max(0.10, Math.min(0.85 - customBox.xFrac, startWFrac + deltaX / rect.width));
      const newHFrac = Math.max(0.05, Math.min(0.85 - customBox.yFrac, startHFrac + deltaY / rect.height));
      setCustomBox((prev) => ({ ...prev, widthFrac: newWFrac, heightFrac: newHFrac }));
      setPosition('custom');
    };

    const onMouseUp = () => {
      setIsPlacingBox(false);
      suppressNextClickRef.current = true;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const clickXFrac = (e.clientX - rect.left) / rect.width;
    const clickYFrac = (e.clientY - rect.top) / rect.height;
    const xFrac = Math.max(0, Math.min(1 - customBox.widthFrac, clickXFrac - customBox.widthFrac / 2));
    const yFrac = Math.max(0, Math.min(1 - customBox.heightFrac, clickYFrac - customBox.heightFrac / 2));
    setCustomBox((prev) => ({ ...prev, xFrac, yFrac }));
    setPosition('custom');
  };

  // CSS background crop trick: shows the horizontal band of the page at the
  // amber box's vertical position, as a tracing reference. Scale is uniform
  // (driven by heightFrac only, same factor on both axes) so the crop never
  // stretches/distorts — unlike cropping independently to widthFrac x heightFrac.
  const guideBackgroundStyle: React.CSSProperties | undefined = previewUrl
    ? (() => {
        const bgWidth = (1 / Math.max(0.01, customBox.widthFrac)) * 100;
        const bgHeight = (1 / Math.max(0.01, customBox.heightFrac)) * 100;
        const posX = Math.max(0, Math.min(100, (customBox.xFrac / Math.max(0.0001, 1 - customBox.widthFrac)) * 100));
        const posY = Math.max(0, Math.min(100, (customBox.yFrac / Math.max(0.0001, 1 - customBox.heightFrac)) * 100));
        return {
          backgroundImage: `url(${previewUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${bgWidth}% ${bgHeight}%`,
          backgroundPosition: `${posX}% ${posY}%`,
        };
      })()
    : undefined;

  const handleSelectPreset = (id: PositionPreset) => {
    setPosition(id);
    let xFrac = 0.65;
    let yFrac = 0.82;
    if (id.includes('left')) xFrac = 0.07;
    else if (id.includes('center') && id !== 'center-left' && id !== 'center-right') xFrac = 0.36;
    else xFrac = 0.65;

    if (id.startsWith('top')) yFrac = 0.05;
    else if (id.startsWith('center')) yFrac = 0.44;
    else yFrac = 0.82;
    setCustomBox((prev) => ({ ...prev, xFrac, yFrac }));
  };

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const addFile = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setToast({ kind: 'error', message: t.notPdf });
      return;
    }
    setFile(f);
    setPhase('options');
  }, [t]);

  // Handle uploaded image preview
  useEffect(() => {
    if (!uploadedImage) {
      setUploadedPreview(null);
      return;
    }
    const url = URL.createObjectURL(uploadedImage);
    setUploadedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedImage]);

  // Canvas Drawing Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; // ink dark
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setDrawnDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setDrawnDataUrl(null);
  };

  const generateSignatureBytes = async (): Promise<Uint8Array | null> => {
    if (mode === 'draw') {
      if (!hasDrawn || !canvasRef.current) return null;
      const dataUrl = canvasRef.current.toDataURL('image/png');
      return dataUrlToUint8Array(dataUrl);
    }

    if (mode === 'type') {
      if (!typedName.trim()) return null;
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'italic 72px Georgia, serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName.trim(), canvas.width / 2, canvas.height / 2);

      const dataUrl = canvas.toDataURL('image/png');
      return dataUrlToUint8Array(dataUrl);
    }

    if (mode === 'upload') {
      if (!uploadedImage) return null;
      const buffer = await uploadedImage.arrayBuffer();
      return new Uint8Array(buffer);
    }

    return null;
  };

  const handleSign = async () => {
    if (!file) return;

    const signatureBytes = await generateSignatureBytes();
    if (!signatureBytes || signatureBytes.length === 0) {
      setToast({
        kind: 'error',
        message: t.lang === 'tr'
          ? 'Lütfen önce bir imza oluşturun veya yükleyin.'
          : 'Please draw, type, or upload a signature first.',
      });
      return;
    }

    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));

      const pageIndex =
        pageTarget === 'first'
          ? 0
          : pageTarget === 'all'
          ? -2
          : pageTarget === 'custom'
          ? Math.max(0, (customPageNum || 1) - 1)
          : -1;
      const placement: SignaturePlacement = {
        pageIndex,
        xFrac: customBox.xFrac,
        yFrac: customBox.yFrac,
        widthFrac: customBox.widthFrac,
        heightFrac: customBox.heightFrac,
      };

      const res = await signPdf(file, {
        signatureBytes,
        placements: [placement],
      });

      setOutput({
        blob: res.output,
        name: res.outputName,
        pagesSigned: res.pagesSigned,
      });
      setPhase('done');
    } catch (err: any) {
      console.error('Sign PDF failed:', err);
      setToast({
        kind: 'error',
        message: err?.message === 'ENCRYPTED_PDF_UNSUPPORTED'
          ? (t.lang === 'tr' ? 'Şifreli PDF dosyaları desteklenmiyor.' : 'Encrypted PDF files are not supported.')
          : (t.lang === 'tr' ? 'PDF imzalanamadı, dosya bozuk olabilir.' : 'Failed to sign PDF, file may be corrupted.'),
      });
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
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
          <div className="flex items-center gap-3 rounded-2xl border border-amber/30 bg-surface p-4 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)] min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <PenTool className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-alt p-1 dark:bg-surface-dark-alt">
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'draw'
                  ? 'bg-surface text-amber shadow-sm dark:bg-surface-dark dark:text-amber-dark'
                  : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>{t.lang === 'tr' ? 'Çiz' : 'Draw'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-surface text-amber shadow-sm dark:bg-surface-dark dark:text-amber-dark'
                  : 'text-ink-muted hover:text-ink dark:text-ink-muted-dark dark:hover:text-ink-dark'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>{t.lang === 'tr' ? 'Yükle' : 'Upload'}</span>
            </button>
          </div>

          {/* Signature Input Container */}
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            {mode === 'draw' && (
              <div className="flex flex-col gap-2">
                <div
                  className="relative flex justify-center rounded border border-dashed border-ink-muted/30 bg-white overflow-hidden mx-auto w-full"
                  style={{
                    aspectRatio: `${Math.max(0.01, customBox.widthFrac)} / ${Math.max(0.01, customBox.heightFrac * 1.414)}`,
                    maxHeight: '220px',
                    minHeight: '130px',
                  }}
                >
                  {guideBackgroundStyle && (
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none"
                      style={guideBackgroundStyle}
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={200}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    className="relative w-full h-full cursor-crosshair touch-none block"
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-ink-muted dark:text-ink-muted-dark">
                  <span>{t.lang === 'tr' ? 'İmzanızı yukarıdaki alana çizin (soluk yazı, imza atılacak konumdur)' : 'Draw your signature here — the faint text shows exactly where it will land'}</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <Eraser className="h-3 w-3" />
                    <span>{t.lang === 'tr' ? 'Temizle' : 'Clear'}</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'type' && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder={t.lang === 'tr' ? 'Adınızı veya ünvanınızı yazın...' : 'Type your name or title...'}
                  className="w-full rounded border bg-surface p-2 text-sm text-ink dark:bg-surface-dark dark:text-ink-dark"
                />
                {typedName.trim() ? (
                  <div className="relative flex h-24 items-center justify-center rounded border border-dashed border-amber/40 bg-white p-4 overflow-hidden">
                    {guideBackgroundStyle && (
                      <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={guideBackgroundStyle}
                      />
                    )}
                    <span className="relative font-serif italic text-3xl text-ink select-none">
                      {typedName.trim()}
                    </span>
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded border border-dashed text-xs text-ink-muted">
                    {t.lang === 'tr' ? 'İmza önizlemesi burada görünecek' : 'Signature preview will appear here'}
                  </div>
                )}
              </div>
            )}

            {mode === 'upload' && (
              <div className="flex flex-col gap-3">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed p-6 text-center hover:border-amber dark:hover:border-amber-dark">
                  <Upload className="h-6 w-6 text-ink-muted" />
                  <span className="text-sm font-medium">
                    {t.lang === 'tr' ? 'İmza görseli seçin (PNG / JPG)' : 'Select signature image (PNG / JPG)'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedImage(e.target.files[0]);
                      }
                    }}
                    className="sr-only"
                  />
                </label>
                {uploadedPreview && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={uploadedPreview}
                      alt="Signature Preview"
                      className="max-h-24 rounded border bg-white p-2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Live Page Preview & Signature Placement */}
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'Canlı Sayfa Önizleme & Konum Belirleme' : 'Live Page Preview & Signature Placement'}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={previewPageNum <= 1}
                  onClick={() => {
                    setPreviewPageNum((p) => Math.max(1, p - 1));
                    setPageTarget('custom');
                    setCustomPageNum((p) => Math.max(1, p - 1));
                  }}
                >
                  &larr;
                </Button>
                <span className="text-xs font-medium">
                  {t.lang === 'tr' ? `Sayfa ${previewPageNum} / ${totalPages}` : `Page ${previewPageNum} / ${totalPages}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={previewPageNum >= totalPages}
                  onClick={() => {
                    setPreviewPageNum((p) => Math.min(totalPages, p + 1));
                    setPageTarget('custom');
                    setCustomPageNum((p) => Math.min(totalPages, p + 1));
                  }}
                >
                  &rarr;
                </Button>
              </div>
            </div>

            <div className="relative flex justify-center bg-surface-2 dark:bg-surface-2-dark rounded border border-ink-muted/20 dark:border-ink-muted-dark/20 p-4 overflow-hidden min-h-[360px]">
              {isLoadingPreview && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 text-xs text-white font-medium">
                  {t.lang === 'tr' ? 'Sayfa önizlemesi yükleniyor...' : 'Loading page preview...'}
                </div>
              )}
              {previewUrl ? (
                <div
                  ref={previewContainerRef}
                  className="relative cursor-crosshair shadow-lg bg-white select-none inline-block max-w-full"
                  onClick={handlePreviewClick}
                >
                  <img src={previewUrl} alt="PDF Page Preview" className="max-h-[500px] w-auto block pointer-events-none" />
                  {/* Floating Signature Stamp Overlay (Draggable & Resizable, NO TEXT) */}
                  <div
                    className={`absolute rounded-md flex items-center justify-center cursor-move select-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isPlacingBox
                        ? 'scale-[1.02] border border-amber bg-amber/10 shadow-[0_0_15px_rgba(232,182,95,0.25)] dark:border-amber-dark dark:bg-amber-dark/15 z-10'
                        : 'border border-amber/40 bg-transparent hover:border-amber/70 dark:border-amber-dark/40 dark:hover:border-amber-dark/70'
                    }`}
                    style={{
                      left: `${customBox.xFrac * 100}%`,
                      top: `${customBox.yFrac * 100}%`,
                      width: `${customBox.widthFrac * 100}%`,
                      height: `${customBox.heightFrac * 100}%`,
                    }}
                    onMouseDown={handleBoxMouseDown}
                  >
                    {/* Dynamic Signature Display (drawn or uploaded) */}
                    <div className="w-full h-full flex items-center justify-center p-0 pointer-events-none">
                      {mode === 'draw' && (
                        drawnDataUrl ? (
                          <img src={drawnDataUrl} alt="Signature Preview" className="w-full h-full object-fill drop-shadow" />
                        ) : (
                          <PenTool className="w-6 h-6 text-amber/60 dark:text-amber-dark/60" />
                        )
                      )}
                      {mode === 'upload' && (
                        uploadedPreview ? (
                          <img src={uploadedPreview} alt="Signature Preview" className="max-w-full max-h-full object-contain drop-shadow" />
                        ) : (
                          <Upload className="w-6 h-6 text-amber/60 dark:text-amber-dark/60" />
                        )
                      )}
                    </div>

                    {/* Resize Handle at Bottom-Right corner */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-amber dark:bg-amber-dark rounded-tl-sm cursor-se-resize flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                      onMouseDown={handleResizeMouseDown}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-ink-muted min-h-[250px]">
                  {t.lang === 'tr' ? 'Önizleme hazırlanamadı' : 'Preview not available'}
                </div>
              )}
            </div>
            <span className="text-[11px] text-center text-ink-muted dark:text-ink-muted-dark">
              {t.lang === 'tr'
                ? '💡 İpucu: İmza kutucuğunu sürükleyip taşıyabilir, sağ alt köşesinden boyutunu değiştirebilir veya sayfada herhangi bir yere tıklayabilirsiniz.'
                : '💡 Tip: Drag to move the signature box, resize it from the bottom-right corner, or click anywhere on the page preview.'}
            </span>
          </div>

          {/* Placement & Page Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-3.5 dark:bg-surface-dark">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'Sayfa Seçimi' : 'Target Pages'}
              </span>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={pageTarget === 'last'}
                    onChange={() => setPageTarget('last')}
                    className="text-amber"
                  />
                  <span>{t.lang === 'tr' ? 'Son Sayfa (Varsayılan)' : 'Last Page (Default)'}</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={pageTarget === 'first'}
                    onChange={() => setPageTarget('first')}
                    className="text-amber"
                  />
                  <span>{t.lang === 'tr' ? 'İlk Sayfa' : 'First Page'}</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={pageTarget === 'all'}
                    onChange={() => setPageTarget('all')}
                    className="text-amber"
                  />
                  <span>{t.lang === 'tr' ? 'Tüm Sayfalar' : 'All Pages'}</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="pageTarget"
                    checked={pageTarget === 'custom'}
                    onChange={() => setPageTarget('custom')}
                    className="text-amber"
                  />
                  <span>{t.lang === 'tr' ? 'Belirli Bir Sayfa...' : 'Custom Page...'}</span>
                </label>

                {pageTarget === 'custom' && (
                  <div className="flex items-center gap-2 pl-6 pt-0.5">
                    <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                      {t.lang === 'tr' ? 'Sayfa Numarası:' : 'Page No:'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={customPageNum}
                      onChange={(e) => setCustomPageNum(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 rounded border border-ink-muted/20 dark:border-ink-muted-dark/20 bg-surface px-2 py-1 text-xs text-ink dark:border-ink-muted/20 dark:border-ink-muted-dark/20-dark dark:bg-surface-dark dark:text-ink-dark focus:border-amber focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-3.5 dark:bg-surface-dark">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'İmza Konumu' : 'Signature Position'}
              </span>
              <div className="grid grid-cols-3 gap-2 flex-1">
                {(
                  [
                    { id: 'top-left', tr: 'Sol Üst', en: 'Top Left' },
                    { id: 'top-center', tr: 'Orta Üst', en: 'Top Center' },
                    { id: 'top-right', tr: 'Sağ Üst', en: 'Top Right' },
                    { id: 'center-left', tr: 'Sol Orta', en: 'Center Left' },
                    { id: 'center', tr: 'Tam Orta', en: 'Center' },
                    { id: 'center-right', tr: 'Sağ Orta', en: 'Center Right' },
                    { id: 'bottom-left', tr: 'Sol Alt', en: 'Bottom Left' },
                    { id: 'bottom-center', tr: 'Orta Alt', en: 'Bottom Center' },
                    { id: 'bottom-right', tr: 'Sağ Alt', en: 'Bottom Right' },
                  ] as const
                ).map((item) => {
                  const active = position === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPreset(item.id)}
                      className={`flex flex-col items-center justify-center rounded border px-2 py-2.5 text-center text-xs transition-all ${
                        active
                          ? 'border-amber bg-amber/15 text-amber dark:border-amber-dark dark:bg-amber-dark/25 dark:text-amber-dark font-semibold shadow-[0_0_10px_rgba(232,182,95,0.15)]'
                          : 'border-ink-muted/20 dark:border-ink-muted-dark/20/60 bg-surface-alt/50 text-ink-muted hover:border-amber/40 hover:text-ink dark:border-ink-muted/20 dark:border-ink-muted-dark/20-dark/60 dark:bg-surface-dark-alt/50 dark:text-ink-muted-dark dark:hover:text-ink-dark'
                      }`}
                    >
                      <span>{t.lang === 'tr' ? item.tr : item.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={handleSign} disabled={isProcessing}>
              {t.lang === 'tr' ? 'PDF İmzala' : 'Sign PDF'}
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
            <div className="h-full w-full origin-left animate-fake-progress progress-fill" />
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
