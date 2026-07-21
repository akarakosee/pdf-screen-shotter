// Visual-review screenshots: light+dark @1280 for /, /tr/, and /pdf-to-png in
// options and result states. Output: web/screenshots/ (gitignored).
// Usage: npm run preview (or dev) on :4321, then `node scripts/screenshots.mjs`.

import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(root, 'screenshots');
const FIXTURE = path.resolve(root, '../test/fixtures/sample-20p.pdf');
const BASE = 'http://localhost:4321';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// Optional responsive pass: `node scripts/screenshots.mjs --responsive` also
// captures 360px and 768px widths for the review checklist (increment 6).
const widths = process.argv.includes('--responsive') ? [360, 768, 1280] : [1280];

for (const scheme of ['light', 'dark'])
for (const width of widths) {
  const suffix = width === 1280 ? '' : `-${width}`;
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  const shot = (name, opts = {}) =>
    page.screenshot({ path: path.join(OUT, `${name}${suffix}-${scheme}.png`), ...opts });

  await page.goto(`${BASE}/`);
  await shot('home', { fullPage: true });

  await page.goto(`${BASE}/tr/`);
  await shot('home-tr', { fullPage: true });

  await page.goto(`${BASE}/pdf-to-png/`);
  await shot('tool-empty');

  await page.locator('input[type=file]').setInputFiles(FIXTURE);
  await page.getByText('20 pages').waitFor({ timeout: 15_000 });
  await page.locator('figure img').waitFor({ timeout: 15_000 });
  await page.getByRole('textbox').fill('1-4,18-25'); // shows the clamp notice too
  await shot('tool-options');

  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  await page.getByText(/pages converted\./).waitFor({ timeout: 30_000 });
  await shot('tool-result');

  await ctx.close();
}

await browser.close();
console.log(`screenshots written to ${OUT}`);
