import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { ExtractImagesResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { ProgressPanel } from './ProgressPanel';
import { Toast, type ToastData } from './Toast';
import { Images, Download, Check, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

type Phase = 'upload' | 'ready' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ExtractImagesShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [progress, setProgress] = useState<{ extracted: number; totalPages: number; currentPage: number }>({
    extracted: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [result, setResult] = useState<ExtractImagesResult | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [wasmOk, setWasmOk] = useState(true);

  const isTr = t.tagline ? t.tagline.includes('gizli') : false;

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onFileError: (fileId, message) => {
          setToast({
            kind: 'error',
            message: message === 'encrypted' ? t.passwordProtected : t.corruptFile,
          });
          setPhase('upload');
        },
        onExtractImagesProgress: (extractedImages, totalPages, currentPage) => {
          setProgress({ extracted: extractedImages, totalPages, currentPage });
        },
        onExtractImagesDone: (res) => {
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile });
          setPhase('upload');
        },
        onUnavailable: () => setUnavailable(true),
      });
    }
    return controllerRef.current;
  }, [t]);

  useEffect(() => {
    if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') setWasmOk(false);
    return () => controllerRef.current?.dispose();
  }, []);

  const handleDrop = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const f = files[0];
      const rejection = await validatePdfFile(f);
      if (rejection) {
        setToast({
          kind: 'error',
          message: rejection === 'empty-file' ? (t.emptyFile || 'File is empty') : (t.notPdf || 'Invalid PDF file'),
        });
        return;
      }
      setFile(f);
      setResult(null);
      setProgress({ extracted: 0, totalPages: 0, currentPage: 0 });
      setPhase('ready');
    },
    [t]
  );

  const preload = useCallback(() => {
    controller();
  }, [controller]);

  const handleStartExtraction = () => {
    if (!file || phase === 'processing') return;
    setPhase('processing');
    setProgress({ extracted: 0, totalPages: 0, currentPage: 0 });
    controller().extractImagesStart(file, 'extract-' + Date.now());
  };

  const handleCancel = () => {
    if (!cancelling) {
      setCancelling(true);
      controller().cancel();
    }
  };

  const handleDownload = () => {
    if (result?.output && result.outputName) {
      triggerDownload(result.output, result.outputName);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setPhase('upload');
  };

  const progressPercent =
    progress.totalPages > 0 ? Math.round((progress.currentPage / progress.totalPages) * 100) : 0;

  const progressLabel =
    progress.totalPages > 0
      ? isTr
        ? `Sayfa ${progress.currentPage} / ${progress.totalPages} taranıyor (${progress.extracted} resim bulundu)`
        : `Scanning page ${progress.currentPage} of ${progress.totalPages} (${progress.extracted} images found)`
      : isTr
        ? 'Belge hazırlanıyor...'
        : 'Preparing document...';

  return (
    <div className="flex flex-col gap-5">
      {/* Toast notification */}
      {toast && (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* WASM or Unavailable alert */}
      {(!wasmOk || unavailable) && (
        <div className="rounded-2xl border border-danger/50 bg-danger/10 p-4 text-sm text-danger">
          {unavailable
            ? isTr
              ? 'PDF motoru yanıt vermiyor. Lütfen sayfayı yenilemeyi deneyin.'
              : 'PDF engine is unresponsive. Please try refreshing the page.'
            : isTr
              ? 'Tarayıcınız WebAssembly desteklemiyor.'
              : 'Your browser does not support WebAssembly.'}
        </div>
      )}

      {/* Upload Phase */}
      {phase === 'upload' && (
        <>
          <DropZone t={t} hasFiles={false} onFiles={handleDrop} onPreload={preload} multiple={false} />
          <PrivacyLine t={t} />
        </>
      )}

      {/* Ready Phase */}
      {phase === 'ready' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-amber/30 bg-surface p-5 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                  <Images className="h-5 w-5" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
                  <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {isTr ? 'Gömülü resimler çıkarılmaya hazır' : 'Ready to extract embedded images'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" onClick={handleReset}>
                  {isTr ? 'Değiştir' : 'Change file'}
                </Button>
                <Button variant="primary" onClick={handleStartExtraction}>
                  <Images className="mr-2 h-4 w-4" />
                  {isTr ? 'Resimleri Çıkar' : 'Extract Images'}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 text-xs text-amber dark:border-amber-dark/20 dark:bg-amber-dark/10 dark:text-amber-dark">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                {isTr
                  ? 'Görseller hiçbir kalite veya çözünürlük kaybı olmadan, belgedeki orijinal formatlarında (JPG/PNG) ayıklanır.'
                  : 'Images are extracted in their original embedded formats (JPG/PNG) with zero quality or resolution loss.'}
              </span>
            </div>
          </div>
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Processing Phase */}
      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-4 rounded-2xl border border-ink-muted/20 dark:border-ink-muted-dark/20 bg-surface p-5 dark:border-ink-muted/20 dark:border-ink-muted-dark/20-dark dark:bg-surface-dark">
          <ProgressPanel
            label={progressLabel}
            progressPercent={progressPercent}
            onCancel={handleCancel}
            cancelling={cancelling}
            cancelLabel={isTr ? 'İptal' : 'Cancel'}
            cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
          />
        </div>
      )}

      {/* Done Phase */}
      {phase === 'done' && result && (
        <div className="phase-enter flex flex-col gap-5 rounded-2xl border border-amber/30 bg-surface p-6 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
          {result.extractedImages > 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success dark:text-success">
                <Check className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">
                  {isTr ? 'Resimler Başarıyla Çıkarıldı!' : 'Images Successfully Extracted!'}
                </h3>
                <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                  {isTr
                    ? `${result.totalPages} sayfa tarandı ve toplam ${result.extractedImages} orijinal resim (JPG/PNG) çıkarıldı.`
                    : `Scanned ${result.totalPages} pages and extracted ${result.extractedImages} original images (JPG/PNG).`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {isTr ? 'Yeni PDF Yükle' : 'Extract Another PDF'}
                </Button>
                <Button variant="primary" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  {isTr ? 'ZIP Olarak İndir' : 'Download ZIP Archive'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">
                  {isTr ? 'Gömülü Resim Bulunamadı' : 'No Embedded Images Found'}
                </h3>
                <p className="text-sm text-ink-muted dark:text-ink-muted-dark max-w-md">
                  {isTr
                    ? 'Bu PDF belgesinde ayıklanabilir piksel tabanlı (raster) görsel veya fotoğraf tespit edilemedi. Belge yalnızca vektör veya metin içeriyor olabilir.'
                    : 'No extractable pixel-based (raster) images or photos were found in this PDF document. The document may contain only vectors or text.'}
                </p>
              </div>
              <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {isTr ? 'Farklı Bir PDF Deneyin' : 'Try Another PDF'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
