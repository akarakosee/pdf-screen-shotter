import { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Download, RefreshCw, Code, Copy, FileUp } from 'lucide-react';

type Phase = 'choose' | 'upload_pdf' | 'paste_base64' | 'result_base64' | 'done';

interface Props {
  t?: Strings;
}

export function Base64Shell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('choose');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // State for PDF to Base64
  const [base64Output, setBase64Output] = useState('');
  const [fileName, setFileName] = useState('');
  
  // State for Base64 to PDF
  const [base64Input, setBase64Input] = useState('');

  const handlePdfUpload = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setToast({ kind: 'error', message: t.notPdf });
      return;
    }
    
    setFileName(f.name);
    
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // The result includes the Data URL prefix: "data:application/pdf;base64,..."
        // We can just strip the prefix to get the raw base64, or keep it depending on the user.
        // Let's keep the raw base64, but also offer a data URL option if needed. We'll just provide raw base64.
        const base64 = result.split(',')[1] || result;
        setBase64Output(base64);
        setPhase('result_base64');
      };
      reader.onerror = () => {
        setToast({ kind: 'error', message: 'Failed to read file.' });
      };
      reader.readAsDataURL(f);
    } catch (err: any) {
      setToast({ kind: 'error', message: err.message || t.errorGeneric });
    }
  }, [t]);

  const convertBase64ToPdf = () => {
    if (!base64Input.trim()) {
      setToast({ kind: 'error', message: 'Please paste a Base64 string first.' });
      return;
    }

    try {
      let rawBase64 = base64Input.trim();
      // Remove data URL prefix if present
      if (rawBase64.startsWith('data:application/pdf;base64,')) {
        rawBase64 = rawBase64.replace('data:application/pdf;base64,', '');
      }

      // atob parses the base64 string to a binary string
      const binaryString = window.atob(rawBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' });
      triggerDownload(blob, 'decoded_document.pdf');
      setPhase('done');
    } catch (err: any) {
      setToast({ kind: 'error', message: 'Invalid Base64 string.' });
    }
  };

  const copyToBase64 = () => {
    navigator.clipboard.writeText(base64Output).then(() => {
      setToast({ kind: 'success', message: 'Copied to clipboard!' });
    }).catch(() => {
      setToast({ kind: 'error', message: 'Failed to copy.' });
    });
  };

  const reset = () => {
    setPhase('choose');
    setBase64Input('');
    setBase64Output('');
    setFileName('');
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'choose' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setPhase('upload_pdf')}
              className="flex flex-col items-center justify-center p-8 bg-surface dark:bg-surface-dark border-2 border-dashed border-black/20 dark:border-white/20 rounded-2xl hover:border-amber dark:hover:border-amber-dark transition-colors group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-8 h-8 text-accent dark:text-amber-dark" />
              </div>
              <h3 className="text-lg font-medium text-ink dark:text-ink-dark">PDF to Base64</h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark mt-2 text-center">Convert a PDF file into a Base64 string</p>
            </button>

            <button 
              onClick={() => setPhase('paste_base64')}
              className="flex flex-col items-center justify-center p-8 bg-surface dark:bg-surface-dark border-2 border-dashed border-black/20 dark:border-white/20 rounded-2xl hover:border-amber dark:hover:border-amber-dark transition-colors group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileUp className="w-8 h-8 text-accent dark:text-amber-dark" />
              </div>
              <h3 className="text-lg font-medium text-ink dark:text-ink-dark">Base64 to PDF</h3>
              <p className="text-sm text-ink-muted dark:text-ink-muted-dark mt-2 text-center">Decode a Base64 string back into a PDF file</p>
            </button>
          </div>
          <div className="mt-8 flex justify-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'upload_pdf' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark border-amber/60 dark:border-amber-dark/60">
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
              <span className="text-sm font-medium text-ink dark:text-ink-dark">Upload a PDF file</span>
              <Button variant="secondary" size="sm" onClick={() => setPhase('choose')}>&larr; Back</Button>
            </div>
            <DropZone t={t} hasFiles={false} onFiles={handlePdfUpload} accept=".pdf" multiple={false} />
          </div>
          <div className="mt-8 flex justify-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'result_base64' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark border-amber/60 dark:border-amber-dark/60">
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
               <span className="text-sm font-medium text-ink-muted dark:text-ink-muted-dark truncate max-w-[50%]">Output for: {fileName}</span>
               <div className="flex gap-2">
                 <Button variant="secondary" size="sm" onClick={reset}>Start Over</Button>
                 <Button onClick={copyToBase64} className="flex items-center gap-2">
                   <Copy className="w-4 h-4" /> Copy
                 </Button>
               </div>
            </div>

            <div className="bg-surface dark:bg-surface-dark rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
               <textarea 
                 readOnly 
                 value={base64Output}
                 className="w-full h-64 p-4 text-sm font-mono bg-transparent focus:outline-none focus:ring-0 text-ink dark:text-ink-dark resize-none break-all"
               />
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'paste_base64' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark border-amber/60 dark:border-amber-dark/60">
            <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/10 dark:border-white/10">
               <Button variant="secondary" size="sm" onClick={() => setPhase('choose')}>&larr; Back</Button>
               <Button onClick={convertBase64ToPdf} className="flex items-center gap-2">
                 <Download className="w-4 h-4" /> Download PDF
               </Button>
            </div>

            <div className="bg-surface dark:bg-surface-dark rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
               <textarea 
                 value={base64Input}
                 onChange={(e) => setBase64Input(e.target.value)}
                 placeholder="data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmoK... (or just raw base64)"
                 className="w-full h-64 p-4 text-sm font-mono bg-transparent focus:outline-none focus:ring-0 text-ink dark:text-ink-dark resize-none"
               />
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <PrivacyLine t={t} />
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark border-amber/60 dark:border-amber-dark/60">
            <div className="bg-surface dark:bg-surface-dark rounded-xl border border-black/10 dark:border-white/10 p-12 flex flex-col items-center justify-center text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-2">Downloaded!</h2>
              <p className="text-ink-muted dark:text-ink-muted-dark mb-8">Your PDF has been saved to your device.</p>
              
              <Button onClick={reset} className="flex items-center gap-2 mx-auto">
                <RefreshCw className="w-4 h-4" /> Convert Another
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
