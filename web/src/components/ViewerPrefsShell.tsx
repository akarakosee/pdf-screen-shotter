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

type Phase = 'upload' | 'processing' | 'done';

interface Props {
  t?: Strings;
}

export function ViewerPrefsShell({ t = en }: Props) {
  const [phase, setPhase] = useState<Phase>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [output, setOutput] = useState<{ blob: Blob; name: string } | null>(null);
  
  // Options
  const [pageMode, setPageMode] = useState<string>('FullScreen');
  const [pageLayout, setPageLayout] = useState<string>('SinglePage');
  const [hideToolbar, setHideToolbar] = useState(true);
  const [hideMenubar, setHideMenubar] = useState(true);
  const [fitWindow, setFitWindow] = useState(true);
  const [centerWindow, setCenterWindow] = useState(true);
  const [displayDocTitle, setDisplayDocTitle] = useState(true);

  const controller = useRef<JobController | null>(null);

  useEffect(() => {
    controller.current = new JobController({
      onFileError: (_, msg) => {
        setToast({ kind: 'error', message: msg === 'encrypted' ? t.encryptedFile : t.corruptFile });
        setErrorMsg(null);
    setPhase('upload');
      },
      onViewerPrefsDone: (result) => {
        if (result.output) {
          setOutput({ blob: result.output, name: result.outputName! });
          setPhase('done');
        } else {
          setErrorMsg(null);
    const errMsg = t.lang === 'tr' ? 'Ayarlar uygulanamadı.' : 'Failed to apply preferences.';
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
  }, [t]);

  const startJob = useCallback(() => {
    if (!file) return;
    setPhase('processing');
    controller.current?.runViewerPrefs(file, {
      pageMode,
      pageLayout,
      hideToolbar,
      hideMenubar,
      fitWindow,
      centerWindow,
      displayDocTitle,
    });
  }, [file, pageMode, pageLayout, hideToolbar, hideMenubar, fitWindow, centerWindow, displayDocTitle]);

  const reset = useCallback(() => {
    setFile(null);
    setOutput(null);
    setErrorMsg(null);
    setPhase('upload');
  }, []);

  const isTr = t.lang === 'tr';

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

      {phase === 'upload' && file && (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-5">
          {/* File Card */}
          <div className="flex items-center justify-between rounded-xl border border-border dark:border-border-dark bg-surface p-3.5 sm:p-4 dark:bg-surface-dark shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/10 text-amber dark:bg-amber-dark/10 dark:text-amber-dark">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm text-ink dark:text-ink-dark">{file.name}</p>
                <p className="text-xs text-ink-muted dark:text-ink-muted-dark">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-border/30 dark:text-ink-muted-dark dark:hover:text-ink-dark transition-colors cursor-pointer"
              aria-label="Remove"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Preferences Options */}
          <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-5 shadow-sm space-y-5">
            <div>
              <h3 className="font-semibold text-sm text-ink dark:text-ink-dark">
                {isTr ? 'Görüntüleyici Açılış & Sunum Tercihleri' : 'Viewer & Presentation Preferences'}
              </h3>
              <p className="text-xs text-ink-muted dark:text-ink-muted-dark mt-0.5">
                {isTr 
                  ? 'Belge Adobe Acrobat, Foxit veya PDF okuyucularda açıldığında otomatik uygulanacak açılış kuralları:' 
                  : 'Display rules automatically applied when opened in Adobe Acrobat or PDF desktop readers:'}
              </p>
            </div>

            {/* Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Açılış Modu (Initial Page Mode)' : 'Initial View Mode'}
                </label>
                <select
                  value={pageMode}
                  onChange={e => setPageMode(e.target.value)}
                  className="w-full text-xs bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-ink dark:text-ink-dark focus:outline-none focus:border-amber cursor-pointer"
                >
                  <option value="FullScreen">{isTr ? '🖥️ Tam Ekran Sunum Modu (FullScreen)' : '🖥️ Full Screen Presentation (FullScreen)'}</option>
                  <option value="UseNone">{isTr ? '📄 Normal Açılış (UseNone)' : '📄 Standard Window (UseNone)'}</option>
                  <option value="UseOutlines">{isTr ? '📑 İçindekiler / Yer İmleri Açık (UseOutlines)' : '📑 Bookmarks Panel Open (UseOutlines)'}</option>
                  <option value="UseThumbs">{isTr ? '🖼️ Sayfa Küçük Resimleri Açık (UseThumbs)' : '🖼️ Thumbnails Panel Open (UseThumbs)'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {isTr ? 'Sayfa Düzeni (Page Layout)' : 'Page Layout'}
                </label>
                <select
                  value={pageLayout}
                  onChange={e => setPageLayout(e.target.value)}
                  className="w-full text-xs bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded-xl px-3 py-2.5 text-ink dark:text-ink-dark focus:outline-none focus:border-amber cursor-pointer"
                >
                  <option value="SinglePage">{isTr ? '📄 Tek Sayfa Görünümü' : '📄 Single Page'}</option>
                  <option value="OneColumn">{isTr ? '📜 Sürekli Dikey Kaydırma' : '📜 Continuous Vertical Scroll'}</option>
                  <option value="TwoPageLeft">{isTr ? '📖 İki Sayfalı Kitap Görünümü (Karşılıklı)' : '📖 Two-Page Facing Book Spread'}</option>
                  <option value="TwoColumnLeft">{isTr ? '📚 İki Sayfalı Sürekli Kaydırma' : '📚 Two-Column Continuous'}</option>
                </select>
              </div>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-border-dark/70 hover:border-amber/50 dark:hover:border-amber-dark/50 bg-bg/40 dark:bg-bg-dark/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hideToolbar}
                  onChange={e => setHideToolbar(e.target.checked)}
                  className="mt-0.5 rounded border-ink-muted/30 text-amber focus:ring-amber cursor-pointer"
                />
                <div>
                  <span className="font-medium text-ink dark:text-ink-dark block">
                    {isTr ? 'Araç Çubuğunu Gizle' : 'Hide Toolbars'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark block mt-0.5">
                    {isTr ? 'Acrobat üst butonlarını kapatır.' : 'Hides top toolbars in Adobe/Foxit.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-border-dark/70 hover:border-amber/50 dark:hover:border-amber-dark/50 bg-bg/40 dark:bg-bg-dark/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={hideMenubar}
                  onChange={e => setHideMenubar(e.target.checked)}
                  className="mt-0.5 rounded border-ink-muted/30 text-amber focus:ring-amber cursor-pointer"
                />
                <div>
                  <span className="font-medium text-ink dark:text-ink-dark block">
                    {isTr ? 'Menü Çubuğunu Gizle' : 'Hide Menu Bar'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark block mt-0.5">
                    {isTr ? 'Dosya, Düzenle menülerini kaldırır.' : 'Hides File, Edit menus for clean viewing.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-border-dark/70 hover:border-amber/50 dark:hover:border-amber-dark/50 bg-bg/40 dark:bg-bg-dark/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={fitWindow}
                  onChange={e => setFitWindow(e.target.checked)}
                  className="mt-0.5 rounded border-ink-muted/30 text-amber focus:ring-amber cursor-pointer"
                />
                <div>
                  <span className="font-medium text-ink dark:text-ink-dark block">
                    {isTr ? 'Pencereyi Sayfaya Sığdır' : 'Fit Window to Page'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark block mt-0.5">
                    {isTr ? 'Pencereyi belgenin tam boyutuna eşitler.' : 'Resizes window to exact document size.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-border-dark/70 hover:border-amber/50 dark:hover:border-amber-dark/50 bg-bg/40 dark:bg-bg-dark/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={centerWindow}
                  onChange={e => setCenterWindow(e.target.checked)}
                  className="mt-0.5 rounded border-ink-muted/30 text-amber focus:ring-amber cursor-pointer"
                />
                <div>
                  <span className="font-medium text-ink dark:text-ink-dark block">
                    {isTr ? 'Pencereyi Ekranda Ortala' : 'Center Window on Screen'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark block mt-0.5">
                    {isTr ? 'Belgeyi ekranın tam ortasında başlatır.' : 'Positions window right at screen center.'}
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border/70 dark:border-border-dark/70 hover:border-amber/50 dark:hover:border-amber-dark/50 bg-bg/40 dark:bg-bg-dark/40 cursor-pointer transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  checked={displayDocTitle}
                  onChange={e => setDisplayDocTitle(e.target.checked)}
                  className="mt-0.5 rounded border-ink-muted/30 text-amber focus:ring-amber cursor-pointer"
                />
                <div>
                  <span className="font-medium text-ink dark:text-ink-dark block">
                    {isTr ? 'Pencere Başlığında Belge Başlığını Göster' : 'Display Document Title in Window'}
                  </span>
                  <span className="text-[11px] text-ink-muted dark:text-ink-muted-dark block mt-0.5">
                    {isTr ? 'Dosya adı yerine PDF içindeki resmi başlığı pencere başlığında gösterir.' : 'Displays official PDF title instead of file name in window bar.'}
                  </span>
                </div>
              </label>
            </div>

            {/* Pro Tip Alert */}
            <div className="rounded-xl bg-amber/5 dark:bg-amber-dark/5 border border-amber/20 dark:border-amber-dark/20 p-3 text-xs text-ink-muted dark:text-ink-muted-dark">
              <p className="flex items-center gap-1.5 font-medium text-ink dark:text-ink-dark mb-1">
                {isTr ? 'Önemli Bilgi (Uyumluluk Notu):' : 'Compatibility Notice:'}
              </p>
              <p>
                {isTr 
                  ? 'ViewerPreferences ve FullScreen modları Adobe Acrobat Reader, Foxit ve profesyonel PDF görüntüleyicilerinde dosya açıldığında otomatik olarak devreye girer. Tarayıcılar (Chrome/Safari) güvenlik nedeniyle menü gizleme yetkilerini kısıtlayabilir.'
                  : 'ViewerPreferences and FullScreen triggers execute automatically in Adobe Acrobat Reader, Foxit, and standard desktop viewers. Web browsers may restrict window control permissions for security.'}
              </p>
            </div>

            <button
              onClick={startJob}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber hover:bg-amber-dark font-semibold text-black px-4 py-3 text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              <span>{isTr ? 'Tercihleri PDF\'e Uygula & Kaydet' : 'Apply Preferences & Save PDF'}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      )}

      {phase === 'processing' && (
        <ProgressPanel label={t.converting || 'Applying viewer preferences...'} />
      )}

      {phase === 'done' && (output || errorMsg) && (
        <div className="animate-in fade-in slide-in-from-bottom-8 flex flex-col items-center justify-center py-8 w-full mx-auto">
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
