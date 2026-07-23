// English UI strings. Microcopy rows marked "verbatim" are binding
// (UI_UX_TASARIM §6 / AI_BUILD_PROMPT §2) — do not edit them.

export const en = {
  dropIdle: 'Drop PDFs here — or click to browse', // verbatim
  dropDragover: 'Release to add', // verbatim
  encryptedFile: "This PDF is password-protected. We can't open it (yet).", // verbatim
  afterCancel: 'Stopped. {n} pages were finished — you can still download them.', // verbatim (n interpolated)
  noWasm: "Your browser can't run this tool. Try the free desktop app instead.", // verbatim
  toolUnavailable: 'Something went wrong initializing this tool. Try reloading the page.',
  reloadPage: 'Reload page',
  partialSuccess: '{ok} of {total} pages converted. {failed} pages couldn’t be rendered — see details.', // verbatim pattern

  privacyLine: 'Files are processed on your device — nothing is uploaded.',
  privacyVerify: 'verify',
  corruptFile: "This file couldn't be opened. It may be damaged.",
  zeroPages: 'This PDF has no pages.',
  notPdf: "This doesn't look like a PDF file.",
  emptyFile: 'This file is empty.',
  dpiLabel: 'Resolution',
  dpiRecommended: 'Recommended',
  pageRangeLabel: 'Pages',
  pageRangePlaceholder: 'all pages — e.g. 1-5,8',
  pageRangeInvalid: 'Use page numbers like 1-5,8,11-13.',
  pageRangeClamped: 'Range went past the last page and was trimmed.',
  convert: 'Convert',
  converting: 'Converting…',
  cancel: 'Cancel',
  cancelling: 'Cancelling…',
  previewTitle: 'Preview',
  previewNoFile: 'No file selected',
  pageLoading: 'Loading page…',
  pageNavPrevious: 'Previous page',
  pageNavNext: 'Next page',
  pageThumbnailAlt: 'Page {n}',
  pageThumbnailUnavailable: 'Page {n} unavailable',
  showPreviewFor: 'Preview {name}',
  estimatedSize: '~{size} estimated',
  estimatedSizeLabel: 'Estimated size',
  estimatedSizeUnavailable: '—',
  backgroundColorLabel: 'Background',
  bgWhite: 'White',
  bgBlack: 'Black',
  bgTransparent: 'Transparent',
  deliveryLabel: 'Output',
  deliveryZip: 'ZIP Archive',
  deliveryIndividual: 'Individual Images',
  fileInfoTitle: 'File info',
  fileInfoName: 'Name',
  fileInfoSize: 'Size',
  downloadAllCount: 'Download all ({n} files)',
  progressFile: 'File {i} of {n}',
  progressPage: 'Page {i} of {n}',
  doneTitle: 'Done',
  allConverted: '{n} pages converted.',
  download: 'Download',
  downloadZip: 'Download ZIP',
  convertMore: 'Convert more',
  skippedDetails: 'Skipped files',
  removeFile: 'Remove {name}',
  addFile: 'Add PDF',
  moveFileUp: 'Move {name} up',
  moveFileDown: 'Move {name} down',
  mergeOrderHint: 'Files are merged in the order shown below.',
  mergeMinFiles: 'Add at least 2 valid PDF files to merge.',
  mergeResultSummary: 'Merged {n} files into one PDF ({pages} pages).',
  mergeDownload: 'Download merged PDF',
  mergeMore: 'Merge more',
  filePages: '{n} pages',
  desktopAppLink: 'Get the desktop app',
  adSpace: 'Ad space',
} as const;

export type Strings = { [K in keyof typeof en]: string };

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
