import { useCallback, useEffect, useState, useRef } from 'react';
import { validatePdfFile } from '../app/validators';
import { DropZone } from './DropZone';
import { PrivacyLine } from './PrivacyLine';
import { Toast, type ToastData } from './Toast';
import { triggerDownload } from '../app/download';
import type { Strings } from '../i18n/en';
import { en } from '../i18n/en';
import { ResultPanel } from './ResultPanel';
import { ProgressPanel } from './ProgressPanel';
import { JobController } from '../app/JobController';
import { Highlighter, FileText, ChevronLeft, ChevronRight, Sparkles, Check, MessageSquare, PenTool, Link2, ShieldCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type Phase = 'upload' | 'options' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function RemoveAnnotationsShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  const controller = useRef<JobController | null>(null);

  // Options State
  const [removeHighlights, setRemoveHighlights] = useState(true);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeDrawings, setRemoveDrawings] = useState(true);
  const [preserveLinks, setPreserveLinks] = useState(true);

  // Live Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPageNum, setPreviewPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cacheRef = useRef<Map<number, string>>(new Map());

  const isTr = t.lang === 'tr';

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
        setPhase('upload');
      },
      onRemoveAnnotationsDone: (result) => {
        if (result.succeeded > 0 && result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
          const errMsg = isTr ? 'Ek açıklamalar temizlenemedi. Lütfen dosyayı kontrol ediniz.' : 'Failed to remove annotations.';
          setErrorMsg(errMsg);
          setToast({ kind: 'error', message: errMsg });
          setPhase('done');
        }
      }
    });
    return () => {
      controller.current?.dispose();
    };
  }, [t, isTr]);

  const addFile = useCallback(async (incoming: File[]) => {
    if (incoming.length === 0) return;
    const f = incoming[0];
    const rejection = await validatePdfFile(f);
    if (rejection) {
      setToast({ kind: 'error', message: rejection === 'empty-file' ? t.emptyFile : t.notPdf });
      return;
    }
    try {
      const buf = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setTotalPages(Math.max(1, pdfDoc.getPageCount()));
    } catch {
      setTotalPages(1);
    }
    setFile(f);
    setPreviewPageNum(1);
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setPhase('options');
  }, [t]);

  // Page preview with prefetching
  useEffect(() => {
    if (!file || phase !== 'options') return;
    let active = true;

    const cached = cacheRef.current.get(previewPageNum);
    if (cached) {
      setPreviewUrl(cached);
      setIsPreviewLoading(false);
    } else {
      setIsPreviewLoading(true);
      controller.current?.previewPage(file, previewPageNum, 140)
        .then((blob) => {
          if (!active) return;
          const u = URL.createObjectURL(blob);
          cacheRef.current.set(previewPageNum, u);
          setPreviewUrl(u);
        })
        .catch((err) => {
          console.error('Preview error:', err);
          if (previewPageNum > 1 && active) setPreviewPageNum(p => Math.max(1, p - 1));
        })
        .finally(() => {
          if (active) setIsPreviewLoading(false);
        });
    }

    for (const neighbour of [previewPageNum - 1, previewPageNum + 1]) {
      if (neighbour < 1 || neighbour > totalPages || cacheRef.current.has(neighbour)) continue;
      controller.current?.previewPage(file, neighbour, 140)
        .then((blob) => {
          if (!cacheRef.current.has(neighbour)) {
            cacheRef.current.set(neighbour, URL.createObjectURL(blob));
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [file, previewPageNum, totalPages, phase]);

  const handleRun = () => {
    if (!file) return;
    setPhase('processing');
    controller.current?.runRemoveAnnotations(file, {
      removeHighlights,
      removeComments,
      removeDrawings,
      preserveLinks,
    });
  };

  const reset = useCallback(() => {
    cacheRef.current.forEach(u => URL.revokeObjectURL(u));
    cacheRef.current = new Map();
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
    setPreviewPageNum(1);
    setTotalPages(1);
    setRemoveHighlights(true);
    setRemoveComments(true);
    setRemoveDrawings(true);
    setPreserveLinks(true);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <Toast kind={toast.kind} message={toast.message} onClose={() => setToast(null)} />
      )}

      {phase === 'upload' && !file && (
        <div className="space-y-3 rounded-2xl border bg-surface p-2 shadow-sm sm:p-3 dark:bg-surface-dark">
          <DropZone t={t} hasFiles={false} onFiles={addFile} multiple={false} />
          <PrivacyLine t={t} />
        </div>
      )}

      {phase === 'options' && file && (
        <div className="phase-enter flex flex-col gap-5">
          {/* File Header Bar */}
          <div className="flex items-center gap-3.5 rounded-2xl border bg-surface p-4 dark:bg-surface-dark min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber/10 text-amber dark:bg-amber-dark/20 dark:text-amber-dark">
              <Highlighter className="h-6 w-6" />
            </div>
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Seçilen PDF Belgesi' : 'Target PDF Document'}
              </span>
              <div className="truncate text-sm font-medium pr-2 text-ink dark:text-ink-dark" title={file.name}>
                {file.name}
              </div>
              <span className="text-xs text-ink-muted dark:text-ink-muted-dark">
                {isTr ? `${totalPages} Sayfa` : `${totalPages} Pages`}
              </span>
            </div>
          </div>

          {/* Settings and Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Cleaning Toggles */}
            <div className="flex flex-col gap-4 rounded-2xl border bg-surface p-4 dark:bg-surface-dark">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-muted-dark">
                {isTr ? 'Temizlenecek Katmanlar' : 'Layers to Clean'}
              </label>

              {/* Toggles List */}
              <div className="flex flex-col gap-2.5">
                {/* Highlights Toggle */}
                <button
                  type="button"
                  onClick={() => setRemoveHighlights(v => !v)}
                  className={`btn-motion flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    removeHighlights
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber dark:bg-amber-dark/25 dark:text-amber-dark">
                      <Highlighter className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {isTr ? 'Vurgular & Alt Çizgiler' : 'Highlights & Underlines'}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Metin üzeri fosforlu renkler ve çizgiler' : 'Color highlights, strikeouts, squiggly lines'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    removeHighlights ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {removeHighlights && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Comments & Sticky Notes Toggle */}
                <button
                  type="button"
                  onClick={() => setRemoveComments(v => !v)}
                  className={`btn-motion flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    removeComments
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber dark:bg-amber-dark/25 dark:text-amber-dark">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {isTr ? 'Yorumlar & Notlar' : 'Comments & Sticky Notes'}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Açılır not pencereleri ve metin kutuları' : 'Sticky notes, text popups, feedback boxes'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    removeComments ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {removeComments && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Drawings & Ink Toggle */}
                <button
                  type="button"
                  onClick={() => setRemoveDrawings(v => !v)}
                  className={`btn-motion flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    removeDrawings
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber dark:bg-amber-dark/25 dark:text-amber-dark">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {isTr ? 'Çizimler & Karalamalar' : 'Drawings & Ink Marks'}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'Serbest el çizimleri, oklar ve şekiller' : 'Freehand pen strokes, lines, geometric shapes'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    removeDrawings ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {removeDrawings && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Preserve Links Toggle */}
                <button
                  type="button"
                  onClick={() => setPreserveLinks(v => !v)}
                  className={`btn-motion flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    preserveLinks
                      ? 'border-amber bg-amber/10 dark:border-amber-dark dark:bg-amber-dark/15 ring-1 ring-amber dark:ring-amber-dark'
                      : 'border-ink-faint bg-surface hover:bg-bg dark:bg-surface-dark dark:border-ink-faint-dark dark:hover:bg-bg-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber dark:bg-amber-dark/25 dark:text-amber-dark">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-ink dark:text-ink-dark">
                        {isTr ? 'Tıklanabilir Linkleri Koru' : 'Preserve Web Links'}
                      </span>
                      <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark">
                        {isTr ? 'URL ve web bağlantılarının çalışmasını sürdürür' : 'Keep clickable hyperlinks intact in the document'}
                      </span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    preserveLinks ? 'bg-amber border-amber text-[#1D1108] dark:bg-amber-dark dark:border-amber-dark' : 'border-ink-faint dark:border-ink-faint-dark'
                  }`}>
                    {preserveLinks && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              </div>

              {/* Guide Note */}
              <div className="mt-auto pt-2 text-xs text-ink-muted dark:text-ink-muted-dark bg-bg dark:bg-bg-dark p-3 rounded-xl border flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber dark:text-amber-dark shrink-0 mt-0.5" />
                <span>
                  {isTr
                    ? 'Orijinal belge metinleri, fontlar ve sayfa düzeni %100 korunur. Yalnızca sonradan eklenen işaretleme katmanları temizlenir.'
                    : 'Original document text, vector fonts, and layout remain 100% untouched. Only overlay markup layers are stripped.'}
                </span>
              </div>
            </div>

            {/* Right Column: Live Document Preview */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 dark:bg-surface-dark items-center justify-center bg-bg dark:bg-bg-dark relative overflow-hidden min-h-[480px] select-none">
              {isPreviewLoading && !previewUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-bg/50 dark:bg-bg-dark/50 z-20 backdrop-blur-[1px]">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber border-t-transparent dark:border-amber-dark dark:border-t-transparent" />
                </div>
              )}

              <div className="flex-1 w-full flex items-center justify-center overflow-hidden p-2">
                {previewUrl && (
                  <div className="relative max-h-[450px] w-auto rounded border shadow-lg overflow-hidden transition-all duration-300 ease-out animate-in fade-in zoom-in-95 bg-white">
                    <img
                      key={previewPageNum}
                      src={previewUrl}
                      alt="PDF Page Preview"
                      className="max-h-[450px] w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Chevrons */}
              <div className="absolute bottom-3 flex items-center gap-2 bg-surface/90 dark:bg-surface-dark/90 px-3.5 py-1.5 rounded-full shadow-md backdrop-blur-md border border-ink-faint dark:border-ink-faint-dark z-10 transition-all duration-200">
                <button
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.max(1, p - 1))}
                  disabled={previewPageNum <= 1}
                  aria-label={isTr ? 'Önceki Sayfa' : 'Previous Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono min-w-[4rem] text-center font-medium select-none text-ink dark:text-ink-dark">
                  {isTr ? `Sayfa ${previewPageNum} / ${totalPages}` : `Page ${previewPageNum} of ${totalPages}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewPageNum(p => Math.min(totalPages, p + 1))}
                  disabled={previewPageNum >= totalPages}
                  aria-label={isTr ? 'Sonraki Sayfa' : 'Next Page'}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg dark:hover:bg-bg-dark text-ink dark:text-ink-dark transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="btn-motion rounded-lg border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-bg dark:bg-surface-dark dark:text-ink-dark dark:hover:bg-bg-dark"
            >
              {t.cancel || (isTr ? 'Vazgeç' : 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleRun}
              className="btn-motion inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber to-[#F0C778] px-6 text-sm font-medium text-[#1D1108] shadow-[0_14px_32px_-12px_rgba(232,182,95,0.5)] hover:brightness-[0.97] dark:from-amber-dark dark:to-[#F0C778]"
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isTr ? 'Notları Temizle ve İndir' : 'Remove Annotations'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.converting || (isTr ? 'Açıklamalar temizleniyor...' : 'Removing annotations...')} />
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
