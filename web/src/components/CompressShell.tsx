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
import { Minimize2, Download, Check, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';
type CompressLevel = 'recommended' | 'extreme' | 'fast';

interface Props {
  t?: Strings;
}

export function CompressShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressLevel>('extreme');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
          setErrorMsg(null);
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
          setErrorMsg(null);
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
    controller().compressStart(file, 'compress-' + Date.now(), level);
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
    setErrorMsg(null);
    setPhase('upload');
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-amber/30 bg-surface p-5 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
                  <Minimize2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                  <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
                  <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                    {formatSize(file.size)} • {isTr ? 'Akıllı tekilleştirme ile sıkıştırmaya hazır' : 'Ready for smart deduplication & optimization'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button variant="ghost" onClick={handleReset}>
                  {isTr ? 'Değiştir' : 'Change file'}
                </Button>
                <Button variant="primary" onClick={handleStartCompression}>
                  <Minimize2 className="mr-2 h-4 w-4" />
                  {isTr ? 'PDF Sıkıştır' : 'Compress PDF'}
                </Button>
              </div>
            </div>
          </div>
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Processing Phase */}
      {phase === 'processing' && (
        <div className="phase-enter flex flex-col gap-4 rounded-2xl border border-ink-muted/20 dark:border-ink-muted-dark/20 bg-surface p-5 dark:border-ink-muted/20 dark:border-ink-muted-dark/20-dark dark:bg-surface-dark">
          <ProgressPanel
            label={isTr ? 'PDF sıkıştırılıyor ve optimize ediliyor...' : 'Compressing and optimizing PDF...'}
            progressPercent={100}
            onCancel={handleCancel}
            cancelling={cancelling}
            cancelLabel={isTr ? 'İptal' : 'Cancel'}
            cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
          />
        </div>
      )}

      {/* Done Phase */}
      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={{
              totalPages: 1,
              succeeded: 1,
              failed: [],
              durationMs: 0,
              output: result?.output,
              outputName: result?.outputName,
              cancelled: false
            }}
            skipped={[]}
            crossLink={null}
            onDownload={() => { if (result?.output) triggerDownload(result?.output, result?.outputName); }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
