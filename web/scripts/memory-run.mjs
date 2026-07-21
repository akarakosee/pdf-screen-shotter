// Manual large-file run (PRD R4: 1000 pages @300 DPI must not crash the tab;
// memory stays bounded thanks to the streaming ZIP). Not part of CI — run by
// hand: node scripts/memory-run.mjs <path-to-big.pdf> [dpi]
// Reports page throughput and JS heap samples along the way.

import { chromium } from '@playwright/test';

const pdfPath = process.argv[2];
const dpi = process.argv[3] ?? '300';
if (!pdfPath) {
  console.error('usage: node scripts/memory-run.mjs <big.pdf> [dpi]');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:4321/pdf-to-png/');
await page.locator('input[type=file]').setInputFiles(pdfPath);
await page.getByText(/pages$/).waitFor({ timeout: 60_000 });
await page.getByRole('radio', { name: dpi }).click();

const started = Date.now();
await page.getByRole('button', { name: 'Convert', exact: true }).click();

const heapSamples = [];
const timer = setInterval(async () => {
  try {
    const heap = await page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
    heapSamples.push(heap);
    const progress = await page
      .locator('[aria-live]')
      .first()
      .textContent()
      .catch(() => '');
    process.stdout.write(
      `\r${progress?.trim() ?? ''} · main-thread heap ${(heap / 1e6).toFixed(0)} MB   `,
    );
  } catch {
    /* page busy */
  }
}, 5000);

await page.getByText(/pages converted\./).waitFor({ timeout: 30 * 60_000 });
clearInterval(timer);

const secs = ((Date.now() - started) / 1000).toFixed(0);
const headline = await page.locator('[role=status] p').first().textContent();
console.log(`\nresult: "${headline}" in ${secs}s`);
console.log(
  `main-thread heap min/max: ${(Math.min(...heapSamples) / 1e6).toFixed(0)} / ${(Math.max(...heapSamples) / 1e6).toFixed(0)} MB (${heapSamples.length} samples)`,
);
await browser.close();
