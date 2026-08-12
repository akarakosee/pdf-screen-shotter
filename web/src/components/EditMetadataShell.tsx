import { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Button } from './ui/Button';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { PDFDocument } from 'pdf-lib';
import { Download, RefreshCw, Tags } from 'lucide-react';

type Phase = 'upload' | 'edit' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function EditMetadataShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);

  const [metadata, setMetadata] = useState({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: ''
  });

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setToast({ kind: 'error', message: t.notPdf });
      return;
    }
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      
      setMetadata({
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        keywords: pdfDoc.getKeywords() || '',
        creator: pdfDoc.getCreator() || '',
        producer: pdfDoc.getProducer() || ''
      });
      
      setPhase('edit');
    } catch (err: any) {
      setToast({ kind: 'error', message: 'Could not read PDF metadata.' });
    }
  }, [t]);

  const saveMetadata = async () => {
    if (!file) return;
    setIsProcessing(true);
    setPhase('processing');

    try {
      await new Promise((r) => setTimeout(r, 50));
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      
      const outName = file.name.replace(/\.[^/.]+$/, "") + "_metadata.pdf";
      setOutput({ blob, name: outName });
      triggerDownload(blob, outName);
      setPhase('done');
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: err.message || t.errorGeneric });
      setPhase('edit');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setPhase('upload');
    setFile(null);
    setOutput(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} accept=".pdf" multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {(phase === 'edit' || phase === 'processing') && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">{file.name}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Edit Metadata</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                <input type="text" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Document Title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Author</label>
                <input type="text" value={metadata.author} onChange={e => setMetadata({...metadata, author: e.target.value})} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Document Author" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
                <input type="text" value={metadata.subject} onChange={e => setMetadata({...metadata, subject: e.target.value})} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Document Subject" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Keywords</label>
                <input type="text" value={metadata.keywords} onChange={e => setMetadata({...metadata, keywords: e.target.value})} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Comma separated keywords" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Creator</label>
                <input type="text" value={metadata.creator} onChange={e => setMetadata({...metadata, creator: e.target.value})} className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Application used to create PDF" />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button variant="secondary" onClick={reset} disabled={isProcessing}>
                Cancel
              </Button>
              <Button onClick={saveMetadata} disabled={isProcessing}>
                {isProcessing ? 'Saving...' : 'Save Metadata'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && output && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
            <Tags className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Done!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">Metadata has been updated successfully.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => triggerDownload(output.blob, output.name)} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Again
            </Button>
            <Button variant="secondary" onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Edit Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
