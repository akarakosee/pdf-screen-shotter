// File intake validation (PRD R1): extension + magic bytes. The PDF header
// "%PDF-" may legally appear within the first 1024 bytes.

export type FileRejection = 'not-pdf-extension' | 'not-pdf-content' | 'empty-file';

const HEADER = '%PDF-';

export async function validatePdfFile(file: File): Promise<FileRejection | null> {
  if (!file.name.toLowerCase().endsWith('.pdf')) return 'not-pdf-extension';
  if (file.size === 0) return 'empty-file';
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const text = new TextDecoder('latin1').decode(head);
  return text.includes(HEADER) ? null : 'not-pdf-content';
}
