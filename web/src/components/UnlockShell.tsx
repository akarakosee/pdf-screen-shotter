import { useCallback, useState } from 'react';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Unlock, Eye, EyeOff, Check, Download, RefreshCw } from 'lucide-react';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function UnlockShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
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

  const unlockPdf = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      // Yield to React to paint the processing state
      await new Promise((r) => setTimeout(r, 50));

      const arrayBuffer = await file.arrayBuffer();
      const decryptedPdfBytes = await decryptPDF(new Uint8Array(arrayBuffer), password);

      const blob = new Blob([decryptedPdfBytes], { type: 'application/pdf' });
      
      const newName = file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf';
      setOutput({ blob, name: newName });
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || '';
      
      if (errorMsg.includes('password') || errorMsg.includes('Password') || errorMsg.includes('Invalid')) {
        setToast({ kind: 'error', message: t.lang === 'tr' ? 'Hatalı parola girdiniz.' : 'Incorrect password.' });
      } else {
        setToast({ kind: 'error', message: t.corruptFile || 'Failed to unlock PDF.' });
      }
      setPhase('options');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = useCallback(() => {
    setFile(null);
    setPassword('');
    setShowPassword(false);
    setOutput(null);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {phase === 'upload' && (
        <>
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Unlock className="h-5 w-5" />
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
              <label htmlFor="pdf-unlock-key" className="text-sm font-medium">
                {t.lang === 'tr' ? 'Parolayı Girin' : 'Enter Password'}
              </label>
              <div className="relative">
                <input
                  id="pdf-unlock-key"
                  name="unlock-key"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.lang === 'tr' ? 'Belgenin parolasını yazın...' : 'Enter document password...'}
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

            <p className="mt-1 text-xs text-ink-muted dark:text-ink-muted-dark">
              {t.lang === 'tr'
                ? 'Bu işlem parolanızı bilmenizi gerektirir. Parolasız bir kopya oluşturulacaktır.'
                : 'This action requires you to know the password. An unprotected copy will be created.'}
            </p>
          </div>

          <div className="flex justify-end mt-2">
            <Button onClick={unlockPdf} disabled={!password.trim() || isProcessing}>
              {t.lang === 'tr' ? 'Şifreyi Kaldır' : 'Unlock PDF'}
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

      {phase === 'done' && output && (
        <div className="phase-enter flex flex-col gap-5 rounded-2xl border border-amber/30 bg-surface p-6 shadow-[0_0_15px_rgba(232,182,95,0.15)] dark:border-amber-dark/30 dark:bg-surface-dark dark:shadow-[0_0_15px_rgba(232,182,95,0.25)]">
          <div className="flex flex-col items-center justify-center text-center gap-4 py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success dark:text-success">
              <Check className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold">
                {t.lang === 'tr' ? 'PDF Şifresi Başarıyla Kaldırıldı!' : 'PDF Successfully Unlocked!'}
              </h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark">
                {t.lang === 'tr' ? 'PDF dosyanızın parolası kaldırıldı ve indirmeye hazır.' : 'Your PDF password has been removed and is ready for download.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="ghost" onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t.lang === 'tr' ? 'Yeni Dosya Seç' : 'Unlock Another PDF'}
              </Button>
              <Button variant="primary" onClick={() => triggerDownload(output.blob, output.name)} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t.lang === 'tr' ? 'Şifresiz PDF\'i İndir' : 'Download Unlocked PDF'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClear={() => setToast(null)} />
    </div>
  );
}
