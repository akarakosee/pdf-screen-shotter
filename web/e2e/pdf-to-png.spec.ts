// E2E for /pdf-to-png (quality gate 2). Covers: full upload→convert→download
// flow, per-file error resilience (encrypted/corrupt don't abort the batch),
// client-side fake-extension rejection, cancel with partial ZIP, and the R7
// CI-enforced assertion that ZERO network requests carry file bytes.

import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../test/fixtures');
const f = (...p: string[]) => path.join(FIXTURES, ...p);

async function addFiles(page: Page, files: string[]) {
  await page.locator('input[type=file]').setInputFiles(files);
}

/** Uploads sample-20p.pdf's real bytes under an arbitrary display name, so
 * naming edge cases (Turkish/special characters, spaces) can be tested
 * without committing extra binary fixtures. */
async function addFileAs(page: Page, name: string) {
  await page.locator('input[type=file]').setInputFiles({
    name,
    mimeType: 'application/pdf',
    buffer: readFileSync(f('sample-20p.pdf')),
  });
}

test('full flow: upload → options → convert → ZIP download (R1/R2/R3/R4/R6)', async ({
  page,
}) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);

  // FileChip shows name (mono) and page count via the inspect message (ADR-003).
  // (The new file-info card also shows the name, so scope to the chip list.)
  await expect(page.getByRole('listitem').getByText('sample-20p.pdf')).toBeVisible();
  await expect(page.getByText('20 pages')).toBeVisible();

  // PagePreview renders the first page (R3, ADR-007).
  await expect(page.getByRole('img', { name: 'Page 1' })).toBeVisible({ timeout: 15_000 });

  // Page range with clamping feedback (R2).
  await page.getByRole('textbox').fill('1-3,18-25');
  await expect(page.getByText('trimmed', { exact: false })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('6 pages converted.')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Download ZIP' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('sample-20p_pages.zip');
});

test('downloaded ZIP is a real file containing the expected page entries, with Turkish/special-character naming (R4/R6)', async ({
  page,
}) => {
  // Regression: a prior report claimed Convert produced no downloadable
  // result. Earlier tests only checked the download event's suggestedFilename
  // — never that a real file lands on disk with real, valid contents. This
  // saves the download and unzips it.
  await page.goto('/pdf-to-png/');
  await addFileAs(page, 'Özgeçmiş Taslağı (v2).pdf');
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('textbox').fill('1-3');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('3 pages converted.')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Download ZIP' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('Özgeçmiş Taslağı (v2)_pages.zip');
  const zipPath = await download.path();
  expect(zipPath, 'download must actually save a file to disk').toBeTruthy();

  const entries = unzipSync(readFileSync(zipPath!));
  expect(Object.keys(entries).sort()).toEqual([
    'Özgeçmiş Taslağı (v2)_page_001.png',
    'Özgeçmiş Taslağı (v2)_page_002.png',
    'Özgeçmiş Taslağı (v2)_page_003.png',
  ]);
  for (const bytes of Object.values(entries)) {
    expect(bytes.length).toBeGreaterThan(1000); // not an empty/placeholder entry
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    expect([...bytes.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
});

test('a single converted page downloads directly as an image, not a ZIP (R6)', async ({
  page,
}) => {
  // PRD R6's single-page branch is a common off-by-one spot: confirm it's
  // reachable and produces a real, valid image file.
  await page.goto('/pdf-to-png/');
  await addFileAs(page, 'tek sayfa.pdf');
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('textbox').fill('1');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('1 pages converted.')).toBeVisible({ timeout: 30_000 });

  const downloadButton = page.getByRole('button', { name: 'Download' });
  await expect(downloadButton).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download ZIP' })).toHaveCount(0);
  await downloadButton.click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('tek sayfa_page_001.png');
  const filePath = await download.path();
  expect(filePath, 'download must actually save a file to disk').toBeTruthy();
  const bytes = readFileSync(filePath!);
  expect(bytes.length).toBeGreaterThan(1000);
  expect([...bytes.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test('background color selector produces a valid PNG on a non-default choice', async ({
  page,
}) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('radio', { name: /Black/ }).click();
  await page.getByRole('textbox').fill('1');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('1 pages converted.')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;

  const filePath = await download.path();
  expect(filePath, 'download must actually save a file to disk').toBeTruthy();
  const bytes = readFileSync(filePath!);
  expect([...bytes.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test('individual delivery mode downloads separate files instead of a ZIP', async ({ page }) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('radio', { name: 'Individual Images' }).click();
  await page.getByRole('textbox').fill('1-3');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('3 pages converted.')).toBeVisible({ timeout: 30_000 });

  const downloadButton = page.getByRole('button', { name: 'Download all (3 files)' });
  await expect(downloadButton).toBeVisible();
  // Concurrent waitForEvent('download') calls all race to the same first
  // occurrence rather than each claiming one sequential event — a persistent
  // listener is the correct way to collect all three staggered downloads.
  const files: string[] = [];
  page.on('download', (d) => files.push(d.suggestedFilename()));
  await downloadButton.click();
  await expect.poll(() => files.length, { timeout: 10_000 }).toBe(3);
  expect(files.sort()).toEqual([
    'sample-20p_page_001.png',
    'sample-20p_page_002.png',
    'sample-20p_page_003.png',
  ]);
});

test('invalid range blocks convert (R2)', async ({ page }) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);
  await page.getByRole('textbox').fill('abc');
  await expect(page.getByText('Use page numbers like')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Convert', exact: true })).toBeDisabled();
});

test('encrypted and corrupt files fail per-file, batch continues (R5)', async ({ page }) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [
    f('broken', 'encrypted.pdf'),
    f('broken', 'corrupt-garbage.pdf'),
    f('sample-20p.pdf'),
  ]);
  // Inspect flags both bad files before conversion (exact spec microcopy).
  const chipList = page.getByRole('list');
  await expect(
    chipList.getByText("This PDF is password-protected. We can't open it (yet)."),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    chipList.getByText("This file couldn't be opened. It may be damaged."),
  ).toBeVisible();
  // No fatal toast: per-file errors must not restart the worker.
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.getByRole('textbox').fill('1-2');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('2 pages converted.')).toBeVisible({ timeout: 30_000 });
});

test('an unpreviewable file does not crash the worker or lose its inspect result', async ({
  page,
}) => {
  // Regression: dropping a single file whose engine.open() fails (here,
  // encrypted.pdf) triggers previewPage() (page-1 thumbnail) and inspect()
  // back-to-back. previewPage() scopes its error to preview-page-error —
  // it must never fall through to the worker's top-level 'fatal' handler,
  // which would terminate + respawn the worker and silently drop the
  // still-queued inspect response (the chip would then be left with no page
  // count and no failed status).
  // Both files drop together (the file input only exists during the
  // 'upload' phase, so a second sequential drop isn't possible once any
  // file has landed) — this still reproduces the original race, since both
  // files' inspect()/previewPage() calls queue back-to-back regardless.
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('broken', 'encrypted.pdf'), f('sample-20p.pdf')]);

  // The file-error from inspect() must still arrive (worker wasn't killed).
  await expect(
    page.getByText("This PDF is password-protected. We can't open it (yet)."),
  ).toBeVisible({ timeout: 15_000 });

  // No fatal toast, no worker restart signal.
  await expect(page.getByRole('alert')).toHaveCount(0);

  // The worker is still alive and usable: the valid file in the same batch
  // still gets its page count and converts normally.
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('20 pages converted.')).toBeVisible({ timeout: 30_000 });
});

test('fake .pdf extension is rejected client-side (R1)', async ({ page }) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('broken', 'fake-extension.pdf'), f('sample-20p.pdf')]);
  await expect(page.getByText("This doesn't look like a PDF file.")).toBeVisible();
  // Valid file unaffected.
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
});

test('cancel mid-run preserves a partial ZIP (R4)', async ({ page }) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  // 300 DPI over 20 pages is slow enough to cancel reliably.
  await page.getByRole('radio', { name: '300' }).click();
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  // Let at least a few pages finish so the partial ZIP is non-empty.
  await expect(page.getByText(/Page [3-9] of 20/)).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByText(/^Stopped\. [1-9]\d* pages were finished/)).toBeVisible({
    timeout: 30_000,
  });
  // Partial output is downloadable.
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download/ }).click();
  await downloadPromise;
});

test('R7: zero network requests carry file bytes during conversion', async ({ page }) => {
  const offenders: string[] = [];
  page.on('request', (req) => {
    // Any request with a body, or any non-local request after load, is suspect.
    // Same-origin blob: object URLs (preview image, download output) are local
    // memory reads — Chromium reports them as requests, but no bytes can leave
    // the device through them, so they are not offenders.
    if (req.postData() && req.postData()!.length > 0) offenders.push(`${req.method()} ${req.url()}`);
    const local =
      req.url().startsWith('http://localhost:4321') ||
      req.url().startsWith('blob:http://localhost:4321');
    if (!local) offenders.push(req.url());
  });
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);
  await expect(page.getByText('20 pages')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('textbox').fill('1-5');
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await expect(page.getByText('5 pages converted.')).toBeVisible({ timeout: 30_000 });
  expect(offenders, `requests carrying data or leaving the origin: ${offenders.join(', ')}`).toEqual(
    [],
  );
});
