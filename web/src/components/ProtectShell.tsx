import { useCallback, useEffect, useRef, useState } from 'react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Lock, Eye, EyeOff, Check, Download, RefreshCw } from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ProtectShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

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

  const protectPdf = async () => {
    if (!file || !password || password !== confirmPassword) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      // Yield to React to paint the processing state
      await new Promise((r) => setTimeout(r, 50));

      const arrayBuffer = await file.arrayBuffer();
      const encryptedPdfBytes = await encryptPDF(new Uint8Array(arrayBuffer), password, password);

      const blob = new Blob([encryptedPdfBytes], { type: 'application/pdf' });
      
      const newName = file.name.replace(/\.pdf$/i, '') + '-protected.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: t.corruptFile || 'Failed to protect PDF.' });
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setOutput(null);
    setErrorMsg(null);
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
              <Lock className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pdf-lock-key" className="text-sm font-medium">
                {t.lang === 'tr' ? 'Parola Belirle' : 'Set Password'}
              </label>
              <div className="relative">
                <input
                  id="pdf-lock-key"
                  name="lock-key"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.lang === 'tr' ? 'Parolanızı yazın...' : 'Enter password...'}
                  className="h-11 w-full rounded-lg border bg-surface pl-3 pr-10 text-sm focus:border-amber focus:outline-none dark:bg-surface-dark dark:focus:border-amber-dark"
                  autoComplete="off"
                  spellCheck="false"
                  data-lpignore="true"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber hover:text-amber-dark dark:text-amber-dark dark:hover:text-amber"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pdf-lock-key-confirm" className="text-sm font-medium">
                {t.lang === 'tr' ? 'Parolayı Doğrula' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  id="pdf-lock-key-confirm"
                  name="lock-key-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.lang === 'tr' ? 'Parolayı tekrar yazın...' : 'Enter password again...'}
                  className="h-11 w-full rounded-lg border bg-surface pl-3 pr-10 text-sm focus:border-amber focus:outline-none dark:bg-surface-dark dark:focus:border-amber-dark"
                  autoComplete="off"
                  spellCheck="false"
                  data-lpignore="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber hover:text-amber-dark dark:text-amber-dark dark:hover:text-amber"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-danger">
                {t.lang === 'tr' ? 'Parolalar eşleşmiyor.' : 'Passwords do not match.'}
              </p>
            )}

            <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
              {t.lang === 'tr'
                ? 'Belgeyi açmak isteyen herkes bu parolayı girmek zorunda kalacak.'
                : 'Anyone who wants to open this document will need to enter this password.'}
            </p>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={protectPdf} disabled={!password.trim() || password !== confirmPassword || isProcessing}>
              {t.lang === 'tr' ? 'Şifrele ve Kaydet' : 'Protect PDF'}
            </Button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.converting || 'Processing...'} />
      )}

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
