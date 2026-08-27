import { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import {
  FileText,
  Shuffle,
  ArrowRightLeft,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  Plus,
  X,
  Upload,
} from 'lucide-react';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import { JobController } from '../app/JobController';

type Phase = 'upload' | 'options' | 'processing' | 'done';

type InterleavePattern = '1-1' | '2-2' | '1-2';

interface DocInfo {
  file: File;
  pageCount: number;
  thumbnailUrl: string | null;
}

interface Props {
  t?: Strings;
  desktopAppUrl?: string;
}

export function MixPdfShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [doc1, setDoc1] = useState<DocInfo | null>(null);
  const [doc2, setDoc2] = useState<DocInfo | null>(null);
  const [pattern, setPattern] = useState<InterleavePattern>('1-1');
  const [reverseDoc2, setReverseDoc2] = useState(false);
  const [reverseDoc1, setReverseDoc1] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [progress, setProgress] = useState<{ message: string; percentage: number } | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string; totalPages: number } | null>(null);

  // File input refs for empty slots
  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const fileInputRef2 = useRef<HTMLInputElement | null>(null);
  const [isDraggingSlot1, setIsDraggingSlot1] = useState(false);
  const [isDraggingSlot2, setIsDraggingSlot2] = useState(false);

  const controller = useRef<JobController | null>(null);
  const doc1Ref = useRef<DocInfo | null>(null);
  const doc2Ref = useRef<DocInfo | null>(null);
  doc1Ref.current = doc1;
  doc2Ref.current = doc2;

  const isTr = t.lang === 'tr';
  const isTrRef = useRef(isTr);
  isTrRef.current = isTr;

  useEffect(() => {
    controller.current = new JobController({
      onMixPdfProgress: (processed, total) => {
        setProgress({
          message: isTrRef.current
            ? `Sayfalar harmanlanıyor: ${processed} / ${total}...`
            : `Mixing pages: ${processed} of ${total}...`,
          percentage: total > 0 ? (processed / total) * 100 : 50,
        });
      },
      onMixPdfDone: (res) => {
        if (res.output) {
          setOutput({
            blob: res.output,
            name: res.outputName || `${doc1Ref.current?.file.name.replace(/\.pdf$/i, '')}_mixed.pdf`,
            totalPages: (doc1Ref.current?.pageCount || 0) + (doc2Ref.current?.pageCount || 0),
          });
          setPhase('done');
        } else {
          setErrorMsg(isTrRef.current ? 'Harmanlama işlemi tamamlanamadı.' : 'Failed to mix PDF documents.');
          setPhase('options');
        }
        setIsProcessing(false);
      },
      onFatal: (message) => {
        setToast({ kind: 'error', message: message || (isTrRef.current ? 'Hata oluştu' : 'An error occurred') });
        setIsProcessing(false);
        setPhase('options');
      },
    });

    return () => {
      controller.current?.dispose();
    };
  }, []);

  // Async non-blocking thumbnail loading for Doc 1
  useEffect(() => {
    if (doc1 && !doc1.thumbnailUrl && controller.current) {
      let isMounted = true;
      controller.current
        .previewPage(doc1.file, 1, 90)
        .then((blob) => {
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            setDoc1((prev) => (prev ? { ...prev, thumbnailUrl: url } : null));
          }
        })
        .catch((e) => {
          console.warn('Thumbnail generation failed for doc1:', e);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [doc1?.file]);

  // Async non-blocking thumbnail loading for Doc 2
  useEffect(() => {
    if (doc2 && !doc2.thumbnailUrl && controller.current) {
      let isMounted = true;
      controller.current
        .previewPage(doc2.file, 1, 90)
        .then((blob) => {
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            setDoc2((prev) => (prev ? { ...prev, thumbnailUrl: url } : null));
          }
        })
        .catch((e) => {
          console.warn('Thumbnail generation failed for doc2:', e);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [doc2?.file]);

  const loadDocInfo = async (file: File): Promise<DocInfo> => {
    try {
      const buf = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      return { file, pageCount, thumbnailUrl: null };
    } catch (e) {
      console.warn('Error reading PDF page count:', e);
      return { file, pageCount: 1, thumbnailUrl: null };
    }
  };

  const handleFilesAdded = useCallback(
    async (incoming: File[]) => {
      const validFiles: File[] = [];
      for (const f of incoming) {
        const rej = await validatePdfFile(f);
        if (!rej) validFiles.push(f);
      }

      if (validFiles.length === 0) {
        setToast({ kind: 'error', message: t.notPdf || 'No valid PDF files selected' });
        return;
      }

      if (!doc1 && !doc2) {
        if (validFiles.length >= 2) {
          const d1 = await loadDocInfo(validFiles[0]);
          const d2 = await loadDocInfo(validFiles[1]);
          setDoc1(d1);
          setDoc2(d2);
          setPhase('options');
        } else {
          const d1 = await loadDocInfo(validFiles[0]);
          setDoc1(d1);
          setPhase('options'); // Single PDF directly transitions to options!
        }
      } else if (doc1 && !doc2) {
        const d2 = await loadDocInfo(validFiles[0]);
        setDoc2(d2);
        setPhase('options');
      } else if (!doc1 && doc2) {
        const d1 = await loadDocInfo(validFiles[0]);
        setDoc1(d1);
        setPhase('options');
      }
    },
    [doc1, doc2, t]
  );

  const handleSlot1Add = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const rej = await validatePdfFile(file);
    if (rej) {
      setToast({ kind: 'error', message: t.notPdf || 'Invalid PDF file' });
      return;
    }
    const d1 = await loadDocInfo(file);
    setDoc1(d1);
  };

  const handleSlot2Add = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const rej = await validatePdfFile(file);
    if (rej) {
      setToast({ kind: 'error', message: t.notPdf || 'Invalid PDF file' });
      return;
    }
    const d2 = await loadDocInfo(file);
    setDoc2(d2);
  };

  const removeDoc1 = () => {
    if (doc1?.thumbnailUrl) URL.revokeObjectURL(doc1.thumbnailUrl);
    setDoc1(null);
    if (!doc2) setPhase('upload');
  };

  const removeDoc2 = () => {
    if (doc2?.thumbnailUrl) URL.revokeObjectURL(doc2.thumbnailUrl);
    setDoc2(null);
    if (!doc1) setPhase('upload');
  };

  const swapDocs = () => {
    const temp = doc1;
    setDoc1(doc2);
    setDoc2(temp);
  };

  const executeMix = async () => {
    if (!doc1 || !doc2) return;
    setIsProcessing(true);
    setPhase('processing');

    const step1 = pattern === '2-2' ? 2 : 1;
    const step2 = pattern === '2-2' ? 2 : pattern === '1-2' ? 2 : 1;

    try {
      await controller.current?.runMixPdf(doc1.file, doc2.file, {
        reverseDoc1,
        reverseDoc2,
        step1,
        step2,
      });
    } catch (err: any) {
      console.error(err);
      setToast({ kind: 'error', message: err?.message || (isTr ? 'İşlem başarısız oldu' : 'Mix failed') });
      setIsProcessing(false);
      setPhase('options');
    }
  };

  const cancel = useCallback(() => {
    setCancelling(true);
    controller.current?.cancel();
    setPhase('options');
    setCancelling(false);
  }, []);

  const reset = useCallback(() => {
    if (doc1?.thumbnailUrl) URL.revokeObjectURL(doc1.thumbnailUrl);
    if (doc2?.thumbnailUrl) URL.revokeObjectURL(doc2.thumbnailUrl);
    setDoc1(null);
    setDoc2(null);
    setOutput(null);
    setErrorMsg(null);
    setPattern('1-1');
    setReverseDoc1(false);
    setReverseDoc2(false);
    setPhase('upload');
  }, [doc1, doc2]);

  // Generate a live sample sequence preview
  const generatePreviewSequence = () => {
    if (!doc1 && !doc2) return [];
    const count1 = doc1 ? Math.min(doc1.pageCount, 6) : 3;
    const count2 = doc2 ? Math.min(doc2.pageCount, 6) : 3;
    const p1 = Array.from({ length: count1 }, (_, i) => `${i + 1}A`);
    if (reverseDoc1) p1.reverse();
    const p2 = Array.from({ length: count2 }, (_, i) => `${i + 1}B`);
    if (reverseDoc2) p2.reverse();

    const result: string[] = [];
    let i1 = 0;
    let i2 = 0;
    const s1 = pattern === '2-2' ? 2 : 1;
    const s2 = pattern === '2-2' ? 2 : pattern === '1-2' ? 2 : 1;

    while ((i1 < p1.length || i2 < p2.length) && result.length < 10) {
      for (let s = 0; s < s1 && i1 < p1.length && result.length < 10; s++) {
        const val = doc1 ? p1[i1] : '?A';
        i1++;
        result.push(val);
      }
      for (let s = 0; s < s2 && i2 < p2.length && result.length < 10; s++) {
        const val = doc2 ? p2[i2] : '?B';
        i2++;
        result.push(val);
      }
    }
    return result;
  };

  const sampleSeq = generatePreviewSequence();
  const totalPages = (doc1?.pageCount || 0) + (doc2?.pageCount || 0);
  const bothDocsReady = !!doc1 && !!doc2;

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* Upload Phase (Initial state before any files) */}
      {phase !== 'processing' && phase !== 'done' && !doc1 && !doc2 && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone
            t={t}
            hasFiles={false}
            onFiles={handleFilesAdded}
            multiple={true}
          />
          <PrivacyLine t={t} />
        </div>
      )}

      {/* Options Phase (Active whenever at least 1 document is present) */}
      {phase !== 'processing' && phase !== 'done' && (doc1 || doc2) && (
        <div className="phase-enter flex flex-col gap-5">
          {/* Dual Document Cards with Center Swap */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
            {/* Slot 1: Document 1 OR Empty Slot 1 */}
            {doc1 ? (
              <div className="relative group flex items-center justify-between gap-3 rounded-xl border border-ink-faint bg-bg/50 p-3 dark:bg-bg-dark/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative aspect-[1/1.3] w-12 shrink-0 rounded border bg-white overflow-hidden shadow-xs flex items-center justify-center">
                    {doc1.thumbnailUrl ? (
                      <img src={doc1.thumbnailUrl} alt="Doc 1" className="h-full w-full object-contain" />
                    ) : (
                      <FileText className="h-5 w-5 text-ink-muted" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        1. {isTr ? 'Belge (Ön / Tek)' : 'Doc (Odd / Front)'}
                      </span>
                    </div>
                    <span className="truncate text-xs font-semibold text-ink dark:text-ink-dark mt-1" title={doc1.file.name}>
                      {doc1.file.name}
                    </span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark font-mono">
                      {doc1.pageCount} {isTr ? 'Sayfa' : 'Pages'}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeDoc1}
                  className="btn-motion p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-danger dark:hover:bg-surface-dark transition-colors"
                  title={isTr ? 'Belgeyi Kaldır' : 'Remove File'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef1.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingSlot1(true);
                }}
                onDragLeave={() => setIsDraggingSlot1(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingSlot1(false);
                  if (e.dataTransfer.files) handleSlot1Add(e.dataTransfer.files);
                }}
                className={`btn-motion flex items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all min-h-[78px] ${
                  isDraggingSlot1
                    ? 'border-amber bg-amber/10 dark:bg-amber-dark/20'
                    : 'border-ink-faint hover:border-amber/60 hover:bg-amber/5 dark:border-ink-faint-dark dark:hover:bg-amber-dark/10'
                }`}
              >
                <input
                  ref={fileInputRef1}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleSlot1Add(e.target.files)}
                />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-ink dark:text-ink-dark">
                    + 1. {isTr ? 'PDF Belgesini Ekleyin' : 'Add 1st PDF Document'}
                  </span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Ön yüz / tek sayfalar' : 'Odd / front pages (Click or drag)'}
                  </span>
                </div>
              </div>
            )}

            {/* Center Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!bothDocsReady}
                onClick={swapDocs}
                className="btn-motion group flex h-10 w-10 items-center justify-center rounded-full border border-ink-faint bg-surface shadow-xs hover:border-amber hover:bg-amber/10 dark:bg-surface-dark dark:hover:bg-amber-dark/20 text-ink dark:text-ink-dark disabled:opacity-40 disabled:pointer-events-none"
                title={isTr ? 'Belgelerin Sırasını Değiştir (1 ↔ 2)' : 'Swap Document Order (1 ↔ 2)'}
              >
                <ArrowRightLeft className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
              </button>
            </div>

            {/* Slot 2: Document 2 OR Empty Slot 2 */}
            {doc2 ? (
              <div className="relative group flex items-center justify-between gap-3 rounded-xl border border-ink-faint bg-bg/50 p-3 dark:bg-bg-dark/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative aspect-[1/1.3] w-12 shrink-0 rounded border bg-white overflow-hidden shadow-xs flex items-center justify-center">
                    {doc2.thumbnailUrl ? (
                      <img src={doc2.thumbnailUrl} alt="Doc 2" className="h-full w-full object-contain" />
                    ) : (
                      <FileText className="h-5 w-5 text-ink-muted" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/15 text-amber-dark">
                        2. {isTr ? 'Belge (Arka / Çift)' : 'Doc (Even / Back)'}
                      </span>
                    </div>
                    <span className="truncate text-xs font-semibold text-ink dark:text-ink-dark mt-1" title={doc2.file.name}>
                      {doc2.file.name}
                    </span>
                    <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark font-mono">
                      {doc2.pageCount} {isTr ? 'Sayfa' : 'Pages'}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeDoc2}
                  className="btn-motion p-1.5 rounded-lg hover:bg-surface text-ink-muted hover:text-danger dark:hover:bg-surface-dark transition-colors"
                  title={isTr ? 'Belgeyi Kaldır' : 'Remove File'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef2.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingSlot2(true);
                }}
                onDragLeave={() => setIsDraggingSlot2(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingSlot2(false);
                  if (e.dataTransfer.files) handleSlot2Add(e.dataTransfer.files);
                }}
                className={`btn-motion flex items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all min-h-[78px] ${
                  isDraggingSlot2
                    ? 'border-amber bg-amber/10 dark:bg-amber-dark/20'
                    : 'border-ink-faint hover:border-amber/60 hover:bg-amber/5 dark:border-ink-faint-dark dark:hover:bg-amber-dark/10'
                }`}
              >
                <input
                  ref={fileInputRef2}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files && handleSlot2Add(e.target.files)}
                />
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark shrink-0">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-ink dark:text-ink-dark">
                    + 2. {isTr ? 'PDF Belgesini Ekleyin' : 'Add 2nd PDF Document'}
                  </span>
                  <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark">
                    {isTr ? 'Arka yüz / çift sayfalar (Tıklayın veya sürükleyin)' : 'Even / back pages (Click or drag)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mixing Settings & Pattern Controls */}
          <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-5 dark:bg-surface-dark">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
              <SlidersHorizontal className="h-4 w-4 text-amber dark:text-amber-dark" />
              <span>{isTr ? 'Harmanlama Kuralları' : 'Interleave Rules & Settings'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pattern Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Sayfa Alma Deseni:' : 'Interleave Pattern:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1-1', label: '1 - 1', desc: isTr ? 'Birebir Tek-Çift' : '1 from each' },
                    { id: '2-2', label: '2 - 2', desc: isTr ? 'İkişerli Sayfalar' : '2 from each' },
                    { id: '1-2', label: '1 - 2', desc: isTr ? '1 Ön, 2 Arka' : '1 odd, 2 even' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPattern(p.id as InterleavePattern)}
                      className={`btn-motion flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                        pattern === p.id
                          ? 'border-amber bg-amber/10 text-[#1D1108] font-bold shadow-xs dark:border-amber-dark dark:bg-amber-dark/20 dark:text-white'
                          : 'border-ink-faint bg-bg hover:border-ink-muted text-ink dark:bg-bg-dark dark:text-ink-dark'
                      }`}
                    >
                      <span className="text-sm font-bold font-mono">{p.label}</span>
                      <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reverse Scan Options */}
              <div className="flex flex-col gap-2.5 justify-center">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Ters Tarama Düzeltmeleri:' : 'Scanner Reversal Fixes:'}
                </label>

                <label
                  className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none p-2.5 rounded-lg border transition-all ${
                    reverseDoc2
                      ? 'border-amber bg-amber/15 text-ink dark:border-amber-dark dark:bg-amber-dark/20 dark:text-ink-dark shadow-xs'
                      : 'border-ink-faint bg-bg/40 text-ink hover:border-amber/60 hover:bg-amber/10 dark:border-ink-faint-dark dark:bg-bg-dark/40 dark:text-ink-dark dark:hover:border-amber-dark/60 dark:hover:bg-amber-dark/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reverseDoc2}
                    onChange={(e) => setReverseDoc2(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-faint text-amber focus:ring-amber dark:border-ink-faint-dark dark:bg-surface-dark"
                  />
                  <span>
                    {isTr
                      ? '2. Belgeyi Tersten Sırala (Ters Taranmış Arka Sayfalar)'
                      : 'Reverse 2nd Document (Back-to-front scans)'}
                  </span>
                </label>

                <label
                  className={`flex items-center gap-2.5 cursor-pointer text-xs font-medium select-none p-2.5 rounded-lg border transition-all ${
                    reverseDoc1
                      ? 'border-amber bg-amber/15 text-ink dark:border-amber-dark dark:bg-amber-dark/20 dark:text-ink-dark shadow-xs'
                      : 'border-ink-faint bg-bg/40 text-ink hover:border-amber/60 hover:bg-amber/10 dark:border-ink-faint-dark dark:bg-bg-dark/40 dark:text-ink-dark dark:hover:border-amber-dark/60 dark:hover:bg-amber-dark/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reverseDoc1}
                    onChange={(e) => setReverseDoc1(e.target.checked)}
                    className="h-4 w-4 rounded border-ink-faint text-amber focus:ring-amber dark:border-ink-faint-dark dark:bg-surface-dark"
                  />
                  <span>
                    {isTr
                      ? '1. Belgeyi Tersten Sırala'
                      : 'Reverse 1st Document'}
                  </span>
                </label>
              </div>
            </div>

            {/* Live Sequence Preview Strip */}
            <div className="flex flex-col gap-2 pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted-dark">
                  {isTr ? 'Oluşacak Sayfa Sıralaması Önizlemesi:' : 'Resulting Page Order Sequence:'}
                </span>
                <span className="text-xs font-mono text-ink-muted dark:text-ink-muted-dark">
                  {bothDocsReady
                    ? `${totalPages} ${isTr ? 'Toplam Sayfa' : 'Total Pages'}`
                    : isTr
                    ? '2. PDF Bekleniyor...'
                    : 'Awaiting 2nd PDF...'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-mono">
                {sampleSeq.map((label, idx) => {
                  const isA = label.endsWith('A');
                  const isMissing = label.startsWith('?');
                  return (
                    <div key={idx} className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-1 rounded-md font-bold text-[11px] ${
                          isMissing
                            ? 'border border-dashed border-ink-faint text-ink-muted bg-bg/40'
                            : isA
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-amber/20 text-amber-dark border border-amber/30 dark:text-amber-light'
                        }`}
                      >
                        {label
                          .replace('A', ` (${isTr ? 'Ön' : 'Odd'})`)
                          .replace('B', ` (${isTr ? 'Arka' : 'Even'})`)}
                      </span>
                      {idx < sampleSeq.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-ink-muted shrink-0" />
                      )}
                    </div>
                  );
                })}
                {totalPages > 10 && (
                  <span className="text-ink-muted px-1">...</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-ink-faint dark:border-ink-faint-dark">
            <button
              type="button"
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {t.cancel || (isTr ? 'Vazgeç' : 'Cancel')}
            </button>
            <button
              type="button"
              disabled={!bothDocsReady}
              onClick={executeMix}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Shuffle className="h-4 w-4" />
              <span>
                {bothDocsReady
                  ? isTr
                    ? `PDF'leri Karıştır ve İndir (${totalPages} Sayfa)`
                    : `Mix PDFs & Download (${totalPages} Pages)`
                  : isTr
                  ? 'Lütfen 2. PDF Belgesini Ekleyin'
                  : 'Please Add 2nd PDF Document'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Phase */}
      {phase === 'processing' && (
        <ProgressPanel
          cancelling={cancelling}
          label={progress?.message || (isTr ? 'Sayfalar harmanlanıyor...' : 'Mixing pages...')}
          progressPercent={progress?.percentage || 0}
          cancelLabel={t.cancel || (isTr ? 'İptal' : 'Cancel')}
          cancellingLabel={isTr ? 'İptal ediliyor...' : 'Cancelling...'}
          onCancel={cancel}
        />
      )}

      {/* Done Phase */}
      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 duration-700 w-full mx-auto">
          <ResultPanel
            errorMsg={errorMsg}
            customHeadline={
              output
                ? isTr
                  ? `2 belge toplam ${output.totalPages} sayfa olarak başarıyla harmanlandı!`
                  : `2 documents successfully mixed into ${output.totalPages} sequential pages!`
                : null
            }
            t={t}
            result={
              output
                ? {
                    totalPages: output.totalPages,
                    succeeded: 1,
                    failed: [],
                    durationMs: 0,
                    output: output.blob,
                    outputName: output.name,
                    cancelled: false,
                  }
                : null
            }
            skipped={[]}
            crossLink={null}
            onDownload={() => {
              if (output) triggerDownload(output.blob, output.name);
            }}
            onConvertMore={reset}
          />
        </div>
      )}
    </div>
  );
}


