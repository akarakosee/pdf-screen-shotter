import { useCallback, useEffect, useRef, useState } from 'react';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { ExportResult } from '../core/types';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { ProgressPanel } from './ProgressPanel';
import { ResultPanel } from './ResultPanel';
import { Toast, type ToastData } from './Toast';

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function SanitizeShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
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
        onFileError: (_fileId, message) => {
          clearTimer();
          setToast({
            kind: 'error',
            message: message === 'encrypted' ? (t.encryptedFile || (isTr ? 'Bu belge şifreli. Önce kilidini açmalısınız.' : 'This document is encrypted. Please unlock it first.')) : (t.corruptFile || 'Could not process file.'),
          });
          setErrorMsg(null);
          setPhase('upload');
        },
        onSanitizeDone: (res) => {
          clearTimer();
          setProgressPct(100);
          if (res.output && res.succeeded > 0) {
            setResult(res);
            setCancelling(false);
            setPhase('done');
          } else {
            const err = isTr ? 'Meta veriler temizlenirken bir hata oluştu.' : 'Failed to sanitize PDF.';
            setErrorMsg(err);
            setToast({ kind: 'error', message: err });
            setPhase('done');
          }
        },
        onFatal: () => {
          clearTimer();
          setCancelling(false);
          setToast({ kind: 'error', message: t.corruptFile || 'Fatal error occurred.' });
          setPhase('upload');
        },
        onUnavailable: () => setUnavailable(true),
      });
    }
    return controllerRef.current;
  }, [t, isTr]);

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
      setErrorMsg(null);
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
      controller().runSanitize(f);
    },
    [t, controller]
  );

  const preload = useCallback(() => {
    controller();
  }, [controller]);

  const handleCancel = () => {
    if (!cancelling) {
      clearTimer();
      setCancelling(true);
      controller().cancel();
      setPhase('upload');
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
    setErrorMsg(null);
    setProgressPct(0);
    setPhase('upload');
  };

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

      {/* Processing Phase - Standard frameless progress panel with percentage */}
      {phase === 'processing' && (
        <ProgressPanel
          label={t.converting || (isTr ? 'Meta veriler, gizli izler ve gömülü dosyalar temizleniyor...' : 'Scrubbing metadata, hidden traces, and embedded files...')}
          progressPercent={progressPct}
          onCancel={handleCancel}
          cancelling={cancelling}
          cancelLabel={isTr ? 'İptal' : 'Cancel'}
          cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
        />
      )}

      {/* Done Phase - Standard GoSecurePDF ResultPanel */}
      {phase === 'done' && (result || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={result}
            customHeadline={
              result && result.succeeded > 0
                ? isTr
                  ? 'Yazar adları, oluşturma tarihi, gömülü dosyalar ve gizli meta veriler temizlendi.'
                  : 'Author info, creation dates, embedded files, and hidden metadata were scrubbed.'
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
