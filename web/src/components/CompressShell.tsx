import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { CompressResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { ProgressPanel } from './ProgressPanel';
import { Toast, type ToastData } from './Toast';
import { FileText } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function CompressShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [wasmOk, setWasmOk] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const isTr = t.tagline ? t.tagline.includes('gizli') : false;

  const controllerRef = useRef<JobController | null>(null);
  const controller = useCallback((): JobController => {
    if (!controllerRef.current) {
      controllerRef.current = new JobController({
        onFileError: (fileId, message) => {
          clearTimer();
          setToast({
            kind: 'error',
            message: message === 'encrypted' ? t.passwordProtected : t.corruptFile,
          });
          setPhase('upload');
        },
        onCompressDone: (res) => {
          clearTimer();
          setProgressPct(100);
          setResult(res);
          setCancelling(false);
          setPhase('done');
        },
        onFatal: () => {
          clearTimer();
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
    return () => {
      clearTimer();
      controllerRef.current?.dispose();
    };
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
      setPhase('options');
    },
    [t]
  );

  const preload = useCallback(() => {
    controller();
  }, [controller]);

  const handleStartCompression = () => {
    if (!file || phase === 'processing') return;
    setPhase('processing');
    setProgressPct(15);
    clearTimer();
    timerRef.current = setInterval(() => {
      setProgressPct((prev) => {
        if (prev < 40) return prev + 12;
        if (prev < 75) return prev + 7;
        if (prev < 90) return prev + 3;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 120);
    controller().compressStart(file, 'compress-' + Date.now(), 'recommended');
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
    clearTimer();
    setFile(null);
    setResult(null);
    setProgressPct(0);
    setPhase('upload');
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const savedPercent =
    result && result.originalSize > 0
      ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100))
      : 0;

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
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={handleDrop} onPreload={preload} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Options Phase */}
      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-amber/30 bg-surface p-5 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-semibold pr-2 text-ink dark:text-ink-dark" title={file.name}>
                  {file.name}
                </div>
                <span className="text-xs text-ink-muted dark:text-ink-muted-dark font-mono">
                  {formatSize(file.size)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="ghost" onClick={handleReset} className="text-xs">
                {isTr ? 'Değiştir' : 'Change file'}
              </Button>
              <Button variant="primary" onClick={handleStartCompression} className="min-w-[150px] flex items-center justify-center gap-2">
                {isTr ? 'PDF Sıkıştır' : 'Compress PDF'}
              </Button>
            </div>
          </div>

          <PrivacyLine t={t} />
        </div>
      )}

      {/* Processing Phase - Standard frameless progress panel with percentage */}
      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || (isTr ? 'PDF sıkıştırılıyor...' : 'Compressing PDF...')}
          progressPercent={progressPct}
          onCancel={handleCancel}
          cancelling={cancelling}
          cancelLabel={isTr ? 'İptal' : 'Cancel'}
          cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
        />
      )}

      {/* Done Phase - Standard GoSecurePDF ResultPanel */}
      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            t={t}
            result={{
              totalPages: 1,
              succeeded: result?.output ? 1 : 0,
              failed: [],
              durationMs: result?.durationMs ?? 0,
              output: result?.output,
              outputName: result?.outputName,
              cancelled: false,
            }}
            customHeadline={
              result && result.originalSize > 0
                ? `${formatSize(result.originalSize)} → ${formatSize(result.compressedSize)} (${isTr ? `%${savedPercent} küçültüldü` : `${savedPercent}% saved`})`
                : null
            }
            skipped={[]}
            crossLink={null}
            onDownload={handleDownload}
            onConvertMore={handleReset}
          />
        </div>
      )}
    </div>
  );
}
