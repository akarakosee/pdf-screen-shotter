import { useState, useRef } from 'react';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Download, RefreshCw, PenTool } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast } from './Toast';

interface Props {
  t?: Strings;
}

export function AnnotateShell({ t = en }: Props) {
  const [phase, setPhase] = useState<'upload' | 'annotate' | 'done'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  
  const [text, setText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(700);

  const handleFile = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      setPdfBytes(new Uint8Array(arrayBuffer));
      setPhase('annotate');
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to load PDF.' });
    }
  };

  const handleAnnotate = async () => {
    if (!pdfBytes || !file || !text) {
      setToast({ kind: 'error', message: 'Please enter text to annotate.' });
      return;
    }

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      const targetPageIdx = pageNumber - 1;
      if (targetPageIdx < 0 || targetPageIdx >= pages.length) {
        setToast({ kind: 'error', message: `Invalid page number. Document has ${pages.length} pages.` });
        return;
      }
      
      const page = pages[targetPageIdx];
      page.drawText(text, {
        x: xPos,
        y: yPos,
        size: 24,
        color: rgb(1, 0, 0), // Red text for visibility
      });

      const modifiedPdfBytes = await pdfDoc.save();
      
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^/.]+$/, "") + '_annotated.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setPhase('done');
      setToast({ kind: 'success', message: 'PDF annotated successfully!' });
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to annotate PDF.' });
    }
  };

  const reset = () => {
    setPhase('upload');
    setFile(null);
    setPdfBytes(null);
    setText('');
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={handleFile} accept=".pdf" multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'annotate' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border  shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 dark:bg-teal-dark/10 flex items-center justify-center text-accent dark:text-teal-dark">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-ink dark:text-ink-dark line-clamp-1">{file.name}</h3>
                <p className="text-sm text-ink-muted dark:text-ink-muted-dark">Add Text Annotation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink dark:text-ink-dark mb-1">Text to Add</label>
                <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full rounded-md border  bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-ink-dark" placeholder="e.g. APPROVED" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink dark:text-ink-dark mb-1">Page Number</label>
                  <input type="number" min="1" value={pageNumber} onChange={e => setPageNumber(parseInt(e.target.value) || 1)} className="w-full rounded-md border  bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-ink-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink dark:text-ink-dark mb-1">X Position</label>
                  <input type="number" value={xPos} onChange={e => setXPos(parseInt(e.target.value) || 0)} className="w-full rounded-md border  bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-ink-dark" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink dark:text-ink-dark mb-1">Y Position</label>
                  <input type="number" value={yPos} onChange={e => setYPos(parseInt(e.target.value) || 0)} className="w-full rounded-md border  bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-ink dark:text-ink-dark" />
                </div>
              </div>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark">Note: PDF coordinates typically start from the bottom-left corner.</p>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={reset} className="px-4 py-2 text-sm font-medium text-ink dark:text-ink-dark hover:text-ink dark:hover:text-ink-dark">
                Cancel
              </button>
              <button onClick={handleAnnotate} className="flex items-center gap-2 px-4 py-2 bg-accent dark:bg-teal-dark text-white text-sm font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-accent/20">
                <Download className="w-4 h-4" /> Save Annotated PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-ink dark:text-ink-dark mb-2">Done!</h2>
          <p className="text-ink-muted dark:text-ink-muted-dark mb-8">Your annotated PDF has been downloaded.</p>
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 bg-ink dark:bg-ink-dark text-white dark:text-bg-dark text-sm font-medium rounded-lg hover:opacity-90">
            <RefreshCw className="w-4 h-4" /> Annotate Another
          </button>
        </div>
      )}
    </div>
  );
}
