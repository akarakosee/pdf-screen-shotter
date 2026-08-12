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

export type ImageRejection = 'not-image-extension' | 'not-image-content' | 'empty-file';

export async function validateImageFile(file: File): Promise<ImageRejection | null> {
  const name = file.name.toLowerCase();
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!validExts.some((ext) => name.endsWith(ext))) return 'not-image-extension';
  if (file.size === 0) return 'empty-file';

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  // JPEG: FFD8FF
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return null;
  // PNG: 89 50 4E 47
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return null;
  // WebP: RIFF ... WEBP
  const text = new TextDecoder('latin1').decode(head);
  if (text.startsWith('RIFF') && text.includes('WEBP')) return null;

  return 'not-image-content';
}
