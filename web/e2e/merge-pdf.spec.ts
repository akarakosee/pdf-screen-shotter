// web/e2e/merge-pdf.spec.ts
// E2E for /merge-pdf: upload two files, reorder them, merge, download, and
// verify the merged PDF's real page count (using mupdf directly in Node —
// no browser APIs needed for a page-count check).

import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as mupdf from 'mupdf';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../test/fixtures');
const f = (...p: string[]) => path.join(FIXTURES, ...p);

async function addFileAs(page: Page, name: string) {
  await page.locator('input[type=file]').setInputFiles({
    name,
    mimeType: 'application/pdf',
    buffer: readFileSync(f('sample-20p.pdf')),
  });
}

// MergeShell moves phase 'upload' -> 'reorder' the instant any file is added
// (see src/components/MergeShell.tsx addFiles()), which unmounts DropZone
// (and its <input type=file> + window drag listeners) — there is no "add
// more files" affordance once in the reorder phase. A real user adds every
// file in one multi-select dialog / one multi-file drop, so this helper
// mirrors that by sending every file through a single setInputFiles call.
async function addFilesAs(page: Page, files: { name: string; path: string }[]) {
  await page.locator('input[type=file]').setInputFiles(
    files.map(({ name, path: p }) => ({
      name,
      mimeType: 'application/pdf',
      buffer: readFileSync(p),
    })),
  );
}

test('upload two PDFs, reorder, merge, and download a real merged PDF (R1/R4/R6/R7)', async ({
  page,
}) => {
  await page.goto('/merge-pdf/');

  await addFilesAs(page, [
    { name: 'first.pdf', path: f('sample-20p.pdf') },
    { name: 'second.pdf', path: f('sample-20p.pdf') },
  ]);

  await expect(page.getByText('first.pdf')).toBeVisible();
  await expect(page.getByText('second.pdf')).toBeVisible();
  await expect(page.getByText('20 pages').first()).toBeVisible({ timeout: 15_000 });

  // Reorder: move second.pdf up above first.pdf.
  await page.getByRole('button', { name: 'Move second.pdf up' }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('Merged 2 files into one PDF (40 pages).')).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Download merged PDF' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('merged.pdf');

  const buf = await download.createReadStream().then(
    (stream) =>
      new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream!.on('data', (c) => chunks.push(c as Buffer));
        stream!.on('end', () => resolve(Buffer.concat(chunks)));
        stream!.on('error', reject);
      }),
  );

  const doc = mupdf.Document.openDocument(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
    'application/pdf',
  );
  try {
    expect(doc.countPages()).toBe(40);
  } finally {
    doc.destroy();
  }
});

test('Convert is disabled with fewer than 2 valid files, and shows the minimum-files notice', async ({
  page,
}) => {
  await page.goto('/merge-pdf/');
  await addFileAs(page, 'only.pdf');

  await expect(page.getByText('Add at least 2 valid PDF files to merge.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Convert', exact: true })).toBeDisabled();
});

test('an encrypted file is skipped with a clear reason while merging continues (R5)', async ({
  page,
}) => {
  await page.goto('/merge-pdf/');
  await addFilesAs(page, [
    { name: 'good-1.pdf', path: f('sample-20p.pdf') },
    { name: 'good-2.pdf', path: f('sample-20p.pdf') },
    { name: 'encrypted.pdf', path: f('broken', 'encrypted.pdf') },
  ]);

  await expect(page.getByText("This PDF is password-protected. We can't open it (yet).")).toBeVisible();
  // The two good files are still enough to merge.
  await expect(page.getByRole('button', { name: 'Convert', exact: true })).toBeEnabled();
});
