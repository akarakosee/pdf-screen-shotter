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
import { FileText, ArrowRight, Download, Check, RefreshCw } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function CompressShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);
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
        onCompressDone: (res) => {
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
    setFile(null);
    setResult(null);
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

      {/* Processing Phase */}
      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-4 rounded-2xl border border-ink-muted/20 dark:border-ink-muted-dark/20 bg-surface p-6 dark:bg-surface-dark">
          <ProgressPanel
            label={isTr ? 'PDF sıkıştırılıyor ve optimize ediliyor...' : 'Compressing and optimizing PDF...'}
            onCancel={handleCancel}
            cancelling={cancelling}
            cancelLabel={isTr ? 'İptal' : 'Cancel'}
            cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
          />
        </div>
      )}

      {/* Done Phase */}
      {phase === 'done' && result && (
        <div className="phase-enter flex flex-col items-center justify-center gap-6 w-full max-w-[620px] mx-auto rounded-2xl border border-amber/30 bg-surface p-6 sm:p-8 shadow-[0_0_20px_rgba(232,182,95,0.12)] dark:border-amber-dark/30 dark:bg-surface-dark">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-7 w-7" />
          </div>

          <div className="flex flex-col items-center text-center gap-1">
            <h3 className="text-lg font-semibold text-ink dark:text-ink-dark">
              {isTr ? 'PDF Başarıyla Sıkıştırıldı!' : 'PDF Successfully Compressed!'}
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-muted-dark truncate max-w-sm" title={result.outputName}>
              {result.outputName}
            </p>
          </div>

          {/* Size Comparison Block with Arrow */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 w-full rounded-xl border border-ink-muted/15 bg-bg/50 dark:bg-bg-dark/50 p-4 sm:p-5">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Önceki Boyut' : 'Original Size'}
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-ink-muted line-through dark:text-ink-muted-dark">
                {formatSize(result.originalSize)}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-1 text-amber dark:text-amber-dark">
              <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Yeni Boyut' : 'Compressed Size'}
              </span>
              <span className="font-mono text-base sm:text-lg font-bold text-success dark:text-success-dark">
                {formatSize(result.compressedSize)}
              </span>
            </div>

            {savedPercent > 0 && (
              <div className="hidden sm:flex items-center justify-center rounded-lg bg-success/15 px-2.5 py-1 text-xs font-bold text-success dark:text-success-dark">
                -{savedPercent}%
              </div>
            )}
          </div>

          {savedPercent > 0 && (
            <div className="sm:hidden flex items-center justify-center rounded-lg bg-success/15 px-3 py-1 text-xs font-bold text-success dark:text-success-dark">
              {isTr ? `%${savedPercent} Küçültüldü` : `${savedPercent}% Reduced`}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
            <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {isTr ? 'Başka PDF Sıkıştır' : 'Compress Another'}
            </Button>
            <Button variant="primary" onClick={handleDownload} className="flex items-center gap-2 px-6">
              <Download className="h-4 w-4" />
              {isTr ? 'Sıkıştırılmış PDF\'i İndir' : 'Download PDF'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
