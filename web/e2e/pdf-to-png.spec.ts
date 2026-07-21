// E2E for /pdf-to-png (quality gate 2). Covers: full upload→convert→download
// flow, per-file error resilience (encrypted/corrupt don't abort the batch),
// client-side fake-extension rejection, cancel with partial ZIP, and the R7
// CI-enforced assertion that ZERO network requests carry file bytes.

import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../test/fixtures');
const f = (...p: string[]) => path.join(FIXTURES, ...p);

async function addFiles(page: Page, files: string[]) {
  await page.locator('input[type=file]').setInputFiles(files);
}

test('full flow: upload → options → convert → ZIP download (R1/R2/R3/R4/R6)', async ({
  page,
}) => {
  await page.goto('/pdf-to-png/');
  await addFiles(page, [f('sample-20p.pdf')]);

  // FileChip shows name (mono) and page count via the inspect message (ADR-003).
  await expect(page.getByText('sample-20p.pdf')).toBeVisible();
  await expect(page.getByText('20 pages')).toBeVisible();

  // Preview renders (R3).
  await expect(page.locator('figure img')).toBeVisible({ timeout: 15_000 });

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
    if (req.postData() && req.postData()!.length > 0) offenders.push(`${req.method()} ${req.url()}`);
    if (!req.url().startsWith('http://localhost:4321')) offenders.push(req.url());
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
