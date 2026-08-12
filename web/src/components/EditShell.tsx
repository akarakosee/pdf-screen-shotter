import { useState } from 'react';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Download, RefreshCw, Edit3 } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast } from './Toast';

interface Props {
  t?: Strings;
}

export function EditShell({ t = en }: Props) {
  const [phase, setPhase] = useState<'upload' | 'edit' | 'done'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  
  const [pageNumber, setPageNumber] = useState(1);
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(500);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(50);

  const handleFile = async (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      setPdfBytes(new Uint8Array(arrayBuffer));
      setPhase('edit');
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to load PDF.' });
    }
  };

  const handleApplyWhiteout = async () => {
    if (!pdfBytes || !file) return;

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      
      const targetPageIdx = pageNumber - 1;
      if (targetPageIdx < 0 || targetPageIdx >= pages.length) {
        setToast({ kind: 'error', message: `Invalid page number. Document has ${pages.length} pages.` });
        return;
      }
      
      const page = pages[targetPageIdx];
      page.drawRectangle({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        color: rgb(1, 1, 1), // White
      });

      const modifiedPdfBytes = await pdfDoc.save();
      
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^/.]+$/, "") + '_edited.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setPhase('done');
      setToast({ kind: 'success', message: 'PDF edited successfully!' });
    } catch (e) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to edit PDF.' });
    }
  };

  const reset = () => {
    setPhase('upload');
    setFile(null);
    setPdfBytes(null);
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

      {phase === 'edit' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{file.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Apply Whiteout (Hide Text)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Page Number</label>
                  <input type="number" min="1" value={pageNumber} onChange={e => setPageNumber(parseInt(e.target.value) || 1)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">X Position</label>
                  <input type="number" value={xPos} onChange={e => setXPos(parseInt(e.target.value) || 0)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Y Position</label>
                  <input type="number" value={yPos} onChange={e => setYPos(parseInt(e.target.value) || 0)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Width</label>
                  <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value) || 0)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Height</label>
                  <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100" />
                </div>
              </div>
              <p className="text-xs text-zinc-500">Note: This will draw an opaque white rectangle over the specified area, hiding any content underneath.</p>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={reset} className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100">
                Cancel
              </button>
              <button onClick={handleApplyWhiteout} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20">
                <Download className="w-4 h-4" /> Save Edited PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Done!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">Your edited PDF has been downloaded.</p>
          <button onClick={reset} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200">
            <RefreshCw className="w-4 h-4" /> Edit Another
          </button>
        </div>
      )}
    </div>
  );
}
