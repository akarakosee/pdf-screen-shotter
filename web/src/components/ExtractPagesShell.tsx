import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { JobController } from '../app/JobController';
import { triggerDownload } from '../app/download';
import { validatePdfFile } from '../app/validators';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { Button } from './ui/Button';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { PageCard } from './PageCard';
import { ProgressPanel } from './ProgressPanel';
import { Download, Check, FilePlus } from 'lucide-react';
import { ResultPanel } from './ResultPanel';

type Phase = 'upload' | 'grid' | 'processing' | 'done';

interface ExtractPageData {
  id: string;
  originalPage: number;
  isSelected: boolean;
}

interface Props {
  t?: Strings;
}

function PageItem(props: {
  pageData: ExtractPageData;
  index: number;
  file: File;
  controller: JobController;
  onToggleSelect: (id: string) => void;
}) {
  const { pageData, index, file, controller, onToggleSelect } = props;

  return (
    <div 
      onClick={() => onToggleSelect(pageData.id)}
      className="relative cursor-pointer group"
    >
      <div className={`transition-all duration-200 ${pageData.isSelected ? 'ring-4 ring-blue-500 scale-95 rounded-lg' : 'hover:scale-105'}`}>
        <PageCard
          page={pageData.originalPage}
          file={file}
          controller={controller}
          index={index}
          rotation={0}
          badgeText={index + 1}
        />
        
        {/* Selection Overlay */}
        <div className={`absolute inset-0 rounded-lg flex items-center justify-center transition-opacity duration-200 ${pageData.isSelected ? 'bg-blue-500/20 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${pageData.isSelected ? 'bg-blue-500' : 'bg-white/20 border-2 border-white'}`}>
            {pageData.isSelected && <Check className="w-6 h-6" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtractPagesShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ExtractPageData[]>([]);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState({ text: '', percentage: 0 });
  const [resultSize, setResultSize] = useState<number | null>(null);

  const controllerRef = useRef<JobController | null>(null);

  useEffect(() => {
    controllerRef.current = new JobController();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = async (selectedFiles: File[]) => {
    const f = selectedFiles[0];
    const err = validatePdfFile(f);
    if (err) {
      setToast({ kind: 'error', message: err });
      return;
    }
    
    setPhase('processing');
    setProgress({ text: 'Reading PDF...', percentage: 10 });
    
    try {
      if (!controllerRef.current) throw new Error("Controller not initialized");
      
      const arrayBuffer = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const numPages = pdfDoc.getPageCount();
      
      const initialPages: ExtractPageData[] = Array.from({ length: numPages }).map((_, i) => ({
        id: `page-${i}-${Date.now()}`,
        originalPage: i + 1,
        isSelected: false, // Nothing selected initially
      }));

      setPages(initialPages);
      setFile(f);
      setPhase('grid');
    } catch (e: any) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to load PDF. It might be encrypted or corrupted.' });
      setErrorMsg(null);
    setPhase('upload');
    }
  };

  const handleToggleSelect = (id: string) => {
    setPages(pages.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  const selectAll = () => setPages(pages.map(p => ({ ...p, isSelected: true })));
  const clearSelection = () => setPages(pages.map(p => ({ ...p, isSelected: false })));

  const handleExtract = async () => {
    const selectedPages = pages.filter(p => p.isSelected);
    if (selectedPages.length === 0) {
      setToast({ kind: 'error', message: 'Please select at least one page to extract.' });
      return;
    }
    
    if (!file) return;
    
    setPhase('processing');
    setProgress({ text: 'Extracting pages...', percentage: 30 });
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress({ text: 'Loading PDF...', percentage: 50 });
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();
      
      const pageIndices = selectedPages.map(p => p.originalPage - 1);
      setProgress({ text: 'Copying pages...', percentage: 70 });
      
      const copiedPages = await newPdf.copyPages(srcDoc, pageIndices);
      copiedPages.forEach(p => newPdf.addPage(p));
      
      setProgress({ text: 'Saving new PDF...', percentage: 90 });
      const pdfBytes = await newPdf.save();
      setResultSize(pdfBytes.byteLength);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      triggerDownload(blob, file.name.replace(/\.[^/.]+$/, "") + '_extracted.pdf');
      
      setPhase('done');
    } catch (e: any) {
      console.error(e);
      setToast({ kind: 'error', message: 'Failed to extract pages.' });
      setPhase('grid');
    }
  };

  const handleReset = () => {
    setErrorMsg(null);
    setPhase('upload');
    setFile(null);
    setPages([]);
    setResultSize(null);
  };

  const selectedCount = pages.filter(p => p.isSelected).length;

  return (
    <div className="flex flex-col gap-5">
      {toast && <Toast data={toast} onDismiss={() => setToast(null)} />}
      
      {phase === 'upload' && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={handleFileSelect} accept=".pdf" />
          <PrivacyLine t={t} />
        </div>
      )}
      
      {phase === 'processing' && (
        <div className="animate-in fade-in duration-300">
          <ProgressPanel text={progress.text} percentage={progress.percentage} />
        </div>
      )}

      {phase === 'grid' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-surface dark:bg-surface-dark border  rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-4 z-20">
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
                Select Pages to Extract
              </h2>
              <p className="text-ink-muted dark:text-ink-muted-dark text-sm">
                {selectedCount} / {pages.length} pages selected
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" onClick={selectAll}>Select All</Button>
              <Button variant="ghost" onClick={clearSelection}>Clear</Button>
              <Button onClick={handleExtract} disabled={selectedCount === 0} className="ml-2 gap-2">
                <FilePlus className="w-4 h-4" /> Extract Pages
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4">
            {pages.map((page, index) => (
              <PageItem
                key={page.id}
                pageData={page}
                index={index}
                file={file}
                controller={controllerRef.current!}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <ResultPanel
            errorMsg={errorMsg} 
          filename={file?.name.replace(/\.[^/.]+$/, "") + '_extracted.pdf' || 'extracted.pdf'}
          sizeBytes={resultSize || 0}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
