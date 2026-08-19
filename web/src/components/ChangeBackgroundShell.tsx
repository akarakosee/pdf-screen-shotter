import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { JobController } from '../app/JobController';
import { FileUp, Palette, FileText } from 'lucide-react';


type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ChangeBackgroundShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  
  const [hexColor, setHexColor] = useState<string>("#1E1E1E");

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
    setPhase('upload');
      },
      onChangeBgDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
    const errMsg = t.corruptFile;
          setErrorMsg(errMsg);
          setToast({ kind: 'error', message: errMsg });
          setPhase('done');
        }
      }
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t]);

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

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo/10 text-indigo dark:bg-indigo-dark/20 dark:text-indigo-dark">
              <Palette className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <div className="overflow-x-auto whitespace-nowrap scrollbar-thin text-sm font-medium pr-2" title={file.name}>{file.name}</div>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            <label className="text-sm font-medium">{t.lang === 'tr' ? 'Arka Plan Rengi (HEX)' : 'Background Color (HEX)'}</label>
            <div className="flex items-center gap-3">
              <input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="h-10 w-10 rounded-md cursor-pointer border-0 p-0" />
              <input type="text" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="h-10 w-24 rounded-lg border bg-bg px-3 text-sm focus:border-indigo focus:outline-none dark:bg-bg-dark uppercase" />
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setHexColor('#1E1E1E')} className="px-3 py-1 text-xs rounded-full bg-[#1E1E1E] text-white border border-gray-600">Dark Mode</button>
              <button onClick={() => setHexColor('#F4ECD8')} className="px-3 py-1 text-xs rounded-full bg-[#F4ECD8] text-black border border-gray-300">Sepia</button>
              <button onClick={() => setHexColor('#E5F0FF')} className="px-3 py-1 text-xs rounded-full bg-[#E5F0FF] text-black border border-gray-300">Light Blue</button>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <button className="rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white hover:bg-indigo/90 dark:bg-indigo-dark dark:hover:bg-indigo-dark/90 disabled:opacity-50" onClick={() => { setPhase('processing'); controller.current?.runChangeBackground(file, hexColor); }}>
              {t.lang === 'tr' ? 'Rengi Değiştir' : 'Change Background'}
            </button>
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

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            t={t}
            result={output ? { totalPages: 1, succeeded: 1, failed: [], durationMs: 0, output: output.blob, outputName: output.name, cancelled: false } : null}
            skipped={[]}
            crossLink={null}
            onDownload={() => output && triggerDownload(output.blob, output.name)}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}
