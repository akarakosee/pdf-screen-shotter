// JobController — queue, cancel, worker lifecycle (SISTEM_TASARIMI §2.2/§3.3).
// Owns the single render worker. On `fatal` it terminates and respawns the
// worker so one bad PDF cannot take down the tab.
//
// Respawn is capped: if the worker fails to even initialize (a broken module
// in its graph, not a runtime crash after loading), every respawn re-fetches
// the identical broken graph and fails identically — this happened for real
// with an unbundled worker dependency, producing an unbounded loop of failed
// requests. After MAX_FATALS_PER_WINDOW fatals within FATAL_WINDOW_MS, stop
// respawning and surface onUnavailable once instead of retrying forever.

import type {
  ExportOptions,
  ExportResult,
  ExtractImagesResult,
  CompressResult,
  FileMeta,
  MergeResult,
  OrganizeResult,
  PageError,
  PerFileExportOptions,
  ProgressData,
  SplitResult,
  UiToWorkerMessage,
  WorkerToUiMessage,
} from '../core/types';
import { PREVIEW_DPI } from '../core/config';

export interface JobEvents {
  onReady?: () => void;
  onInspect?: (fileId: string, pageCount: number) => void;
  onProgress?: (data: ProgressData) => void;
  onPageError?: (error: PageError) => void;
  onFileError?: (fileId: string, message: string) => void;
  onDone?: (result: ExportResult) => void;
  /** ADR-008: one file finished opening during a merge run. */
  onMergeProgress?: (fileIndex: number, totalFiles: number) => void;
  /** ADR-008: the merge finished (or was cancelled). */
  onMergeDone?: (result: MergeResult) => void;
  onSplitProgress?: (extractedPages: number, totalSelected: number) => void;
  onSplitDone?: (result: SplitResult) => void;
  onOrganizeProgress?: (processedPages: number, totalPages: number) => void;
  onOrganizeDone?: (result: OrganizeResult) => void;
  onExtractImagesProgress?: (extractedImages: number, totalPages: number, currentPage: number) => void;
  onExtractImagesDone?: (result: ExtractImagesResult) => void;
  onRemoveBlankProgress?: (processedPages: number, totalPages: number) => void;
  onReverseProgress?: (processedPages: number, totalPages: number) => void;
  onBatesProgress?: (processedPages: number, totalPages: number) => void;
  onNUpProgress?: (processedPages: number, totalPages: number) => void;
  onPdfAProgress?: (processedPages: number, totalPages: number) => void;
  onSplitHalfProgress?: (processedPages: number, totalPages: number) => void;
  onAddMarginsProgress?: (processedPages: number, totalPages: number) => void;
  onPdfToSvgProgress?: (processedPages: number, totalPages: number) => void;
  onSplitBySizeProgress?: (processedPages: number, totalPages: number) => void;
  onExtractByKeywordProgress?: (phase: 'extracting' | 'splitting', processed: number, total: number) => void;
  onMixPdfProgress?: (processedPages: number, totalPages: number) => void;
  onMixPdfDone?: (result: ExportResult) => void;
  onExtractByKeywordDone?: (result: ExportResult, pagesKept: number) => void;
  onSplitBySizeDone?: (result: ExportResult) => void;
  onPdfToSvgDone?: (result: ExportResult) => void;
  onAddMarginsDone?: (result: ExportResult) => void;
  onSplitHalfDone?: (result: ExportResult) => void;
  onCompressDone?: (result: CompressResult) => void;
  onRemoveAnnotationsProgress?: (processedPages: number, totalPages: number) => void;
  onRemoveAnnotationsDone?: (result: ExportResult) => void;
  onPdfToWebpProgress?: (processedPages: number, totalPages: number) => void;
  onPdfToWebpDone?: (result: ExportResult) => void;
  onAutoCropProgress?: (processedPages: number, totalPages: number) => void;
  onAutoCropDone?: (result: ExportResult) => void;
  onExtractTocProgress?: (processedPages: number, totalPages: number) => void;
  onExtractTocDone?: (result: ExportResult) => void;
  onOverlayPdfProgress?: (processedPages: number, totalPages: number) => void;
  onOverlayPdfDone?: (result: ExportResult) => void;
  onChangeBgProgress?: (processedPages: number, totalPages: number) => void;
  onChangeBgDone?: (result: ExportResult) => void;
  onAutoRedactProgress?: (processedPages: number, totalPages: number) => void;
  onAutoRedactDone?: (result: ExportResult) => void;
  onSmartMarkdownProgress?: (processedPages: number, totalPages: number) => void;
  onSmartMarkdownDone?: (result: ExportResult) => void;
  onContrastEnhancerProgress?: (processedPages: number, totalPages: number) => void;
  onContrastEnhancerDone?: (result: ExportResult) => void;
  onPdfToHtmlProgress?: (processedPages: number, totalPages: number) => void;
  onPdfToHtmlDone?: (result: ExportResult) => void;
  onExtractFontsProgress?: (processedPages: number, totalPages: number) => void;
  onExtractFontsDone?: (result: ExportResult) => void;
  onRemoveImagesProgress?: (processedPages: number, totalPages: number) => void;
  onRemoveImagesDone?: (result: ExportResult) => void;
  onExtractUrlsProgress?: (processedPages: number, totalPages: number) => void;
  onExtractUrlsDone?: (result: ExportResult) => void;
  onRemoveDuplicatesProgress?: (processedPages: number, totalPages: number) => void;
  onRemoveDuplicatesDone?: (result: ExportResult) => void;
  onExtractAttachmentsProgress?: (processedPages: number, totalPages: number) => void;
  onExtractAttachmentsDone?: (result: ExportResult) => void;
  onExtractColorsProgress?: (processedPages: number, totalPages: number) => void;
  onExtractColorsDone?: (result: ExportResult) => void;
  onRemoveTextProgress?: (processedPages: number, totalPages: number) => void;
  onRemoveTextDone?: (result: ExportResult) => void;
  onExtractJavascriptProgress?: (processedPages: number, totalPages: number) => void;
  onExtractJavascriptDone?: (result: ExportResult) => void;
  onSplitBookmarksProgress?: (processedPages: number, totalPages: number) => void;
  onSplitBookmarksDone?: (result: ExportResult) => void;
  onSplitBlankProgress?: (processedPages: number, totalPages: number) => void;
  onSplitBlankDone?: (result: ExportResult) => void;
  onViewerPrefsDone?: (result: ExportResult) => void;
  onExtractHiddenTextProgress?: (processedPages: number, totalPages: number) => void;
  onExtractHiddenTextDone?: (result: ExportResult) => void;
  onWipeBookmarksDone?: (result: ExportResult) => void;
  onExtractTablesProgress?: (processedPages: number, totalPages: number) => void;
  onExtractTablesDone?: (result: ExportResult) => void;
  onPdfToJsonProgress?: (processedPages: number, totalPages: number) => void;
  onPdfToJsonDone?: (result: ExportResult) => void;
  onAudioReaderProgress?: (processedPages: number, totalPages: number) => void;
  onAudioReaderDone?: (result: ExportResult) => void;
  onScanToPdfProgress?: (processedPages: number, totalPages: number) => void;
  onScanToPdfDone?: (result: ExportResult) => void;
  onFatal?: (message: string) => void;
  /** Fired once, instead of onFatal, when the worker has failed too many
   * times in a row and JobController has given up respawning it. Every
   * method becomes a no-op after this until the page is reloaded. */
  onUnavailable?: (message: string) => void;
  /** ADR-006: one real thumbnail from the homepage live demo arrived. */
  onDemoPage?: (page: number, blob: Blob) => void;
  /** ADR-006: the demo finished rendering all its pages. */
  onDemoDone?: () => void;
  /** ADR-006: the demo failed — never fatal, caller falls back to a static image. */
  onDemoError?: (message: string) => void;
}

export class JobController {
  private static readonly MAX_FATALS_PER_WINDOW = 3;
  private static readonly FATAL_WINDOW_MS = 10_000;
  private static nextRequestId = 0;

  private worker: Worker | null = null;
  private events: JobEvents;
  private running = false;
  private disabled = false;
  private fatalTimestamps: number[] = [];
  private pendingPreviewPages = new Map<
    string,
    { resolve: (blob: Blob) => void; reject: (err: Error) => void }
  >();
  private pendingDetectBlanks = new Map<
    number,
    { resolve: (indices: number[]) => void; reject: (err: Error) => void }
  >();

  constructor(events: JobEvents) {
    this.events = events;
  }

  /** Idempotent. Called from preload triggers (hover/dragenter) so the WASM is
   * usually warm before the user drops a file (ADR-001 preload strategy). */
  preload(): void {
    if (this.disabled) return;
    this.ensureWorker();
  }

  /** ADR-003: page count without rendering; errors arrive as file-error. */
  async inspect(fileId: string, file: File): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'inspect', fileId, file: buf }, [buf]);
  }

  /** ADR-007: one filmstrip thumbnail. Always renders at the fixed
   * PREVIEW_DPI (72), independent of the user's chosen export DPI — thumbnails
   * stay small and fast regardless of what resolution will actually be
   * exported. Correlated by requestId so many concurrent page requests
   * (scrolling the filmstrip, multiple queued files) resolve independently. */
  previewPage(file: File, page: number, dpi: number = PREVIEW_DPI): Promise<Blob> {
    if (this.disabled) return Promise.reject(new Error('disabled'));
    const requestId = `p${++JobController.nextRequestId}`;
    const result = new Promise<Blob>((resolve, reject) => {
      this.pendingPreviewPages.set(requestId, { resolve, reject });
    });
    void file.arrayBuffer().then((buf) => {
      this.post({ type: 'preview-page', file: buf, dpi, page, requestId }, [buf]);
    });
    return result;
  }

  detectBlankPages(file: File, sensitivity: 'strict' | 'normal' | 'lenient' = 'normal'): Promise<number[]> {
    if (this.disabled) return Promise.reject(new Error('disabled'));
    const requestId = ++JobController.nextRequestId;
    const result = new Promise<number[]>((resolve, reject) => {
      this.pendingDetectBlanks.set(requestId, { resolve, reject });
    });
    void file.arrayBuffer().then((buf) => {
      this.post({ type: 'detect-blank-start', file: buf, meta: { fileId: file.name, name: file.name }, sensitivity, requestId }, [buf]);
    });
    return result;
  }

  /** ADR-006: renders up to maxPages of a bundled sample PDF for the
   * homepage's live hero demo. Never throws — failures arrive as
   * onDemoError, same scoped-error pattern as previewPage(). */
  async demoRender(file: File, dpi: number, maxPages: number): Promise<void> {
    if (this.disabled) return;
    const buf = await file.arrayBuffer();
    this.post({ type: 'demo-render', file: buf, dpi, maxPages }, [buf]);
  }

  /** Each file carries its own render settings (dpi/pageRange/backgroundColor);
   * `shared` is the batch-level format and delivery packaging (ADR-008). */
  async start(
    files: (PerFileExportOptions & { file: File; fileId: string })[],
    shared: { format: ExportOptions['format']; jpgQuality?: number; deliveryMethod?: ExportOptions['deliveryMethod'] },
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    const perFileOptions: PerFileExportOptions[] = files.map((f) => ({
      dpi: f.dpi,
      pageRange: f.pageRange,
      backgroundColor: f.backgroundColor,
    }));
    this.post({ type: 'start', files: buffers, meta, perFileOptions, ...shared }, buffers);
  }

  /** ADR-008: combines every given file's pages, in array order, into one
   * merged PDF. Unlike start(), there is no per-file render config — merge
   * has no DPI/page-range/background concept. */
  async mergeFiles(files: { file: File; fileId: string }[]): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
    const meta: FileMeta[] = files.map((f) => ({ fileId: f.fileId, name: f.file.name }));
    this.post({ type: 'merge-start', files: buffers, meta }, buffers);
  }

  async splitFiles(file: File, fileId: string, selectedPages: number[], mode: 'extract' | 'burst'): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'split-start', file: buf, meta: { fileId, name: file.name }, selectedPages, mode }, [buf]);
  }

  async organizeFiles(file: File, fileId: string, pages: { pageIndex: number; rotation: number }[]): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'organize-start', file: buf, meta: { fileId, name: file.name }, pages }, [buf]);
  }

  async extractImagesStart(file: File, fileId: string): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-images-start', file: buf, meta: { fileId, name: file.name } }, [buf]);
  }

  async compressStart(
    file: File,
    fileId: string,
    level: 'recommended' | 'extreme' | 'fast'
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'compress-start', file: buf, meta: { fileId, name: file.name }, level }, [buf]);
  }

  async runRepair(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'repair-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runGrayscale(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'grayscale-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runResize(file: File, pageSize: 'A4' | 'Letter' | 'Fit', margin: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'resize-start', file: buf, meta: { fileId: file.name, name: file.name }, pageSize, margin }, [buf]);
  }

  async runRemoveBlank(file: File, options?: { sensitivity?: 'strict' | 'normal' | 'lenient'; indicesToRemove?: number[] }): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'remove-blank-start', file: buf, meta: { fileId: file.name, name: file.name }, ...options }, [buf]);
  }

  async runReverse(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'reverse-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runRemoveAnnotations(
    file: File,
    options: {
      removeHighlights?: boolean;
      removeComments?: boolean;
      removeDrawings?: boolean;
      preserveLinks?: boolean;
    } = { removeHighlights: true, removeComments: true, removeDrawings: true, preserveLinks: true }
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({
      type: 'remove-annotations-start',
      file: buf,
      meta: { fileId: file.name, name: file.name },
      ...options,
    }, [buf]);
  }

  async runPdfToWebp(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'pdf-to-webp-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runAutoCrop(file: File, options: { padding?: number } = { padding: 12 }): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'auto-crop-start', file: buf, meta: { fileId: file.name, name: file.name }, ...options }, [buf]);
  }

  async runExtractToc(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-toc-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runOverlayPdf(
    file: File,
    templateFile: File,
    mode: 'background' | 'foreground' = 'background',
    pageRange: 'all' | 'first' | 'except-first' = 'all'
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    const templateBuf = await templateFile.arrayBuffer();
    this.post({
      type: 'overlay-pdf-start',
      file: buf,
      meta: { fileId: file.name, name: file.name },
      templateFile: templateBuf,
      mode,
      pageRange,
    }, [buf, templateBuf]);
  }

  async runChangeBackground(file: File, hexColor: string): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'change-bg-start', file: buf, meta: { fileId: file.name, name: file.name }, hexColor }, [buf]);
  }

  async runAutoRedact(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'auto-redact-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runSmartMarkdown(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'smart-markdown-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runContrastEnhancer(file: File, brightness: number, contrast: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'contrast-enhancer-start', file: buf, meta: { fileId: file.name, name: file.name }, brightness, contrast }, [buf]);
  }

  async runPdfToHtml(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'pdf-to-html-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractFonts(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-fonts-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runRemoveImages(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'remove-images-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractUrls(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-urls-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runRemoveDuplicates(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'remove-duplicates-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractAttachments(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-attachments-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractColors(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-colors-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runRemoveText(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'remove-text-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractJavascript(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-javascript-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runSplitBookmarks(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'split-bookmarks-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runSplitBlank(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'split-blank-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runViewerPrefs(file: File, prefs: { fullScreen: boolean; hideToolbar: boolean; hideMenubar: boolean; fitWindow: boolean; centerWindow: boolean }): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'viewer-prefs-start', file: buf, meta: { fileId: file.name, name: file.name }, prefs }, [buf]);
  }

  async runExtractHiddenText(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-hidden-text-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runWipeBookmarks(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'wipe-bookmarks-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runExtractTables(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-tables-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runPdfToJson(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'pdf-to-json-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runAudioReader(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'audio-reader-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runScanToPdf(files: File[], name: string): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const bufs = await Promise.all(files.map(f => f.arrayBuffer()));
    this.post({ type: 'scan-to-pdf-start', files: bufs, meta: { fileId: name, name } }, bufs);
  }

  async runBates(file: File, prefix: string, suffix: string, startNumber: number, padding: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'bates-start', file: buf, meta: { fileId: file.name, name: file.name }, prefix, suffix, startNumber, padding }, [buf]);
  }

  async runNUp(file: File, grid: 2 | 4 | 9 | 16): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'n-up-start', file: buf, meta: { fileId: file.name, name: file.name }, grid }, [buf]);
  }

  async runPdfA(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'pdf-a-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runMixPdf(
    file1: File,
    file2: File,
    options?: {
      reverseDoc1?: boolean;
      reverseDoc2?: boolean;
      step1?: number;
      step2?: number;
    }
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf1 = await file1.arrayBuffer();
    const buf2 = await file2.arrayBuffer();
    this.post(
      {
        type: 'mix-pdf-start',
        files: [buf1, buf2],
        meta: [
          { fileId: file1.name, name: file1.name },
          { fileId: file2.name, name: file2.name },
        ],
        ...options,
      },
      [buf1, buf2]
    );
  }

  async runExtractByKeyword(
    file: File,
    keyword: string,
    caseSensitive: boolean = false,
    matchWholeWord: boolean = false
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post(
      {
        type: 'extract-by-keyword-start',
        file: buf,
        meta: { fileId: file.name, name: file.name },
        keyword,
        caseSensitive,
        matchWholeWord,
      },
      [buf]
    );
  }

  async runSplitBySize(file: File, maxSizeMB: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'split-by-size-start', file: buf, meta: { fileId: file.name, name: file.name }, maxSizeMB }, [buf]);
  }

  async runPdfToSvg(file: File): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'pdf-to-svg-start', file: buf, meta: { fileId: file.name, name: file.name } }, [buf]);
  }

  async runAddMargins(file: File, marginPt: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'add-margins-start', file: buf, meta: { fileId: file.name, name: file.name }, marginPt }, [buf]);
  }

  async runSplitHalf(
    file: File,
    options?: {
      splitDirection?: 'vertical' | 'horizontal';
      readingOrder?: 'ltr' | 'rtl';
      skipFirstPage?: boolean;
    }
  ): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post(
      {
        type: 'split-half-start',
        file: buf,
        meta: { fileId: file.name, name: file.name },
        ...options,
      },
      [buf]
    );
  }

  async runExtractImages(file: File, options?: { format?: 'original' | 'png' | 'jpg'; minSize?: number; pageRange?: 'all' | 'first' | number | number[] }): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'extract-images-start', file: buf, meta: { fileId: file.name, name: file.name }, ...options }, [buf]);
  }

  async runRemoveBlankPages(file: File, options?: { sensitivity?: 'strict' | 'normal' | 'lenient'; indicesToRemove?: number[] }): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'remove-blank-start', file: buf, meta: { fileId: file.name, name: file.name }, ...options }, [buf]);
  }

  async runBatesNumbering(file: File, prefix: string, suffix: string, startNumber: number, padding: number): Promise<void> {
    if (this.disabled || this.running) return;
    this.running = true;
    const buf = await file.arrayBuffer();
    this.post({ type: 'bates-start', file: buf, meta: { fileId: file.name, name: file.name }, prefix, suffix, startNumber, padding }, [buf]);
  }

  cancel(): void {
    if (this.disabled) return;
    this.post({ type: 'cancel' });
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
  }

  private post(msg: UiToWorkerMessage, transfer: Transferable[] = []): void {
    if (this.disabled) return;
    this.ensureWorker().postMessage(msg, transfer);
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(new URL('../workers/render.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (ev: MessageEvent<WorkerToUiMessage>) => this.handle(ev.data);
    worker.onerror = () => this.handleFatal('worker crashed');
    this.worker = worker;
    return worker;
  }

  private handle(msg: WorkerToUiMessage): void {
    switch (msg.type) {
      case 'ready':
        this.events.onReady?.();
        break;
      case 'preview-page-done':
        this.pendingPreviewPages.get(msg.requestId)?.resolve(msg.blob);
        this.pendingPreviewPages.delete(msg.requestId);
        break;
      case 'preview-page-error':
        this.pendingPreviewPages.get(msg.requestId)?.reject(new Error(msg.message));
        this.pendingPreviewPages.delete(msg.requestId);
        break;
      case 'inspect-done':
        this.events.onInspect?.(msg.fileId, msg.pageCount);
        break;
      case 'progress':
        this.events.onProgress?.(msg.data);
        break;
      case 'page-error':
        this.events.onPageError?.(msg.error);
        break;
      case 'file-error':
        this.events.onFileError?.(msg.fileId, msg.message);
        break;
      case 'done':
        this.running = false;
        this.events.onDone?.(msg.result);
        break;
      case 'merge-progress':
        this.events.onMergeProgress?.(msg.fileIndex, msg.totalFiles);
        break;
      case 'merge-done':
        this.running = false;
        this.events.onMergeDone?.(msg.result);
        break;
      case 'split-progress':
        this.events.onSplitProgress?.(msg.extractedPages, msg.totalSelected);
        break;
      case 'split-done':
        this.running = false;
        this.events.onSplitDone?.(msg.result);
        break;
      case 'organize-progress':
        this.events.onOrganizeProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'organize-done':
        this.running = false;
        this.events.onOrganizeDone?.(msg.result);
        break;
      case 'extract-images-progress':
        this.events.onExtractImagesProgress?.(msg.extractedImages, msg.totalPages, msg.currentPage);
        break;
      case 'extract-images-done':
        this.running = false;
        this.events.onExtractImagesDone?.(msg.result);
        break;
      case 'remove-blank-progress':
        this.events.onRemoveBlankProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'detect-blank-done': {
        const pending = this.pendingDetectBlanks.get(msg.requestId);
        if (pending) {
          this.pendingDetectBlanks.delete(msg.requestId);
          pending.resolve(msg.blankIndices);
        }
        break;
      }
      case 'reverse-progress':
        this.events.onReverseProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'bates-progress':
        this.events.onBatesProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'n-up-progress':
        this.events.onNUpProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'pdf-a-progress':
        this.events.onPdfAProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'mix-pdf-progress':
        this.events.onMixPdfProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'mix-pdf-done':
        this.running = false;
        this.events.onMixPdfDone?.(msg.result);
        break;
      case 'extract-by-keyword-progress':
        this.events.onExtractByKeywordProgress?.(msg.phase, msg.processed, msg.total);
        break;
      case 'extract-by-keyword-done':
        this.running = false;
        this.events.onExtractByKeywordDone?.(msg.result, msg.pagesKept);
        break;
      case 'split-by-size-progress':
        this.events.onSplitBySizeProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'split-by-size-done':
        this.running = false;
        this.events.onSplitBySizeDone?.(msg.result);
        break;
      case 'pdf-to-svg-progress':
        this.events.onPdfToSvgProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'pdf-to-svg-done':
        this.running = false;
        this.events.onPdfToSvgDone?.(msg.result);
        break;
      case 'add-margins-progress':
        this.events.onAddMarginsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'add-margins-done':
        this.running = false;
        this.events.onAddMarginsDone?.(msg.result);
        break;
      case 'split-half-progress':
        this.events.onSplitHalfProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'split-half-done':
        this.running = false;
        this.events.onSplitHalfDone?.(msg.result);
        break;
      case 'compress-done':
        this.running = false;
        this.events.onCompressDone?.(msg.result);
        break;
      case 'remove-annotations-progress':
        this.events.onRemoveAnnotationsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'remove-annotations-done':
        this.running = false;
        this.events.onRemoveAnnotationsDone?.(msg.result);
        break;
      case 'pdf-to-webp-progress':
        this.events.onPdfToWebpProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'pdf-to-webp-done':
        this.running = false;
        this.events.onPdfToWebpDone?.(msg.result);
        break;
      case 'auto-crop-progress':
        this.events.onAutoCropProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'auto-crop-done':
        this.running = false;
        this.events.onAutoCropDone?.(msg.result);
        break;
      case 'extract-toc-progress':
        this.events.onExtractTocProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-toc-done':
        this.running = false;
        this.events.onExtractTocDone?.(msg.result);
        break;
      case 'overlay-pdf-progress':
        this.events.onOverlayPdfProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'overlay-pdf-done':
        this.running = false;
        this.events.onOverlayPdfDone?.(msg.result);
        break;
      case 'change-bg-progress':
        this.events.onChangeBgProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'change-bg-done':
        this.running = false;
        this.events.onChangeBgDone?.(msg.result);
        break;
      case 'auto-redact-progress':
        this.events.onAutoRedactProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'auto-redact-done':
        this.running = false;
        this.events.onAutoRedactDone?.(msg.result);
        break;
      case 'smart-markdown-progress':
        this.events.onSmartMarkdownProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'smart-markdown-done':
        this.running = false;
        this.events.onSmartMarkdownDone?.(msg.result);
        break;
      case 'contrast-enhancer-progress':
        this.events.onContrastEnhancerProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'contrast-enhancer-done':
        this.running = false;
        this.events.onContrastEnhancerDone?.(msg.result);
        break;
      case 'pdf-to-html-progress':
        this.events.onPdfToHtmlProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'pdf-to-html-done':
        this.running = false;
        this.events.onPdfToHtmlDone?.(msg.result);
        break;
      case 'extract-fonts-progress':
        this.events.onExtractFontsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-fonts-done':
        this.running = false;
        this.events.onExtractFontsDone?.(msg.result);
        break;
      case 'remove-images-progress':
        this.events.onRemoveImagesProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'remove-images-done':
        this.running = false;
        this.events.onRemoveImagesDone?.(msg.result);
        break;
      case 'extract-urls-progress':
        this.events.onExtractUrlsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-urls-done':
        this.running = false;
        this.events.onExtractUrlsDone?.(msg.result);
        break;
      case 'remove-duplicates-progress':
        this.events.onRemoveDuplicatesProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'remove-duplicates-done':
        this.running = false;
        this.events.onRemoveDuplicatesDone?.(msg.result);
        break;
      case 'extract-attachments-progress':
        this.events.onExtractAttachmentsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-attachments-done':
        this.running = false;
        this.events.onExtractAttachmentsDone?.(msg.result);
        break;
      case 'extract-colors-progress':
        this.events.onExtractColorsProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-colors-done':
        this.running = false;
        this.events.onExtractColorsDone?.(msg.result);
        break;
      case 'remove-text-progress':
        this.events.onRemoveTextProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'remove-text-done':
        this.running = false;
        this.events.onRemoveTextDone?.(msg.result);
        break;
      case 'extract-javascript-progress':
        this.events.onExtractJavascriptProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-javascript-done':
        this.running = false;
        this.events.onExtractJavascriptDone?.(msg.result);
        break;
      case 'split-bookmarks-progress':
        this.events.onSplitBookmarksProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'split-bookmarks-done':
        this.running = false;
        this.events.onSplitBookmarksDone?.(msg.result);
        break;
      case 'split-blank-progress':
        this.events.onSplitBlankProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'split-blank-done':
        this.running = false;
        this.events.onSplitBlankDone?.(msg.result);
        break;
      case 'viewer-prefs-done':
        this.running = false;
        this.events.onViewerPrefsDone?.(msg.result);
        break;
      case 'extract-hidden-text-progress':
        this.events.onExtractHiddenTextProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-hidden-text-done':
        this.running = false;
        this.events.onExtractHiddenTextDone?.(msg.result);
        break;
      case 'wipe-bookmarks-done':
        this.running = false;
        this.events.onWipeBookmarksDone?.(msg.result);
        break;
      case 'extract-tables-progress':
        this.events.onExtractTablesProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'extract-tables-done':
        this.running = false;
        this.events.onExtractTablesDone?.(msg.result);
        break;
      case 'pdf-to-json-progress':
        this.events.onPdfToJsonProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'pdf-to-json-done':
        this.running = false;
        this.events.onPdfToJsonDone?.(msg.result);
        break;
      case 'audio-reader-progress':
        this.events.onAudioReaderProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'audio-reader-done':
        this.running = false;
        this.events.onAudioReaderDone?.(msg.result);
        break;
      case 'scan-to-pdf-progress':
        this.events.onScanToPdfProgress?.(msg.processedPages, msg.totalPages);
        break;
      case 'scan-to-pdf-done':
        this.running = false;
        this.events.onScanToPdfDone?.(msg.result);
        break;
      case 'fatal':
        this.handleFatal(msg.message);
        break;
      case 'demo-page':
        this.events.onDemoPage?.(msg.page, msg.blob);
        break;
      case 'demo-done':
        this.events.onDemoDone?.();
        break;
      case 'demo-error':
        this.events.onDemoError?.(msg.message);
        break;
    }
  }

  private handleFatal(message: string): void {
    this.running = false;
    this.dispose();
    for (const { reject } of this.pendingPreviewPages.values()) reject(new Error(message));
    this.pendingPreviewPages.clear();

    if (this.events.onFatal) {
      this.events.onFatal(message);
    } else if (this.events.onFileError) {
      this.events.onFileError('fatal', 'corrupt');
    }

    const now = Date.now();
    this.fatalTimestamps = [...this.fatalTimestamps, now].filter(
      (t) => now - t < JobController.FATAL_WINDOW_MS,
    );

    if (this.fatalTimestamps.length > JobController.MAX_FATALS_PER_WINDOW) {
      // Respawning has failed repeatedly in a short window — almost
      // certainly the same broken module graph every time, not independent
      // one-off crashes. Stop hammering it and surface a single error.
      this.disabled = true;
      this.events.onUnavailable?.(message);
      return;
    }

    this.ensureWorker(); // respawn — most fatals are a one-off (e.g. WASM OOM)
    this.events.onFatal?.(message);
  }

















}
