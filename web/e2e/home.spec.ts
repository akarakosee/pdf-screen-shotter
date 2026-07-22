// E2E for the homepage live "Developing Tray" hero (ADR-006). Covers: real
// thumbnails actually render (not placeholder divs), and the demo's own
// fetch stays same-origin (R7's zero-egress claim extends to the hero too).

import { expect, test } from '@playwright/test';

test('Developing Tray renders real page thumbnails on load', async ({ page }) => {
  await page.goto('/');
  // The tray starts as empty dark cells; real <img> thumbnails replace them
  // once the idle-loaded demo finishes rendering pages via the WASM worker.
  const firstThumb = page.locator('.tray-cell--develop').first();
  await expect(firstThumb).toBeVisible({ timeout: 15_000 });
  const src = await firstThumb.getAttribute('src');
  expect(src).toMatch(/^blob:/);
});

test('the demo fetch never leaves the origin', async ({ page }) => {
  const offenders: string[] = [];
  page.on('request', (req) => {
    const local =
      req.url().startsWith('http://localhost:4321') ||
      req.url().startsWith('blob:http://localhost:4321');
    if (!local) offenders.push(req.url());
  });
  await page.goto('/');
  await expect(page.locator('.tray-cell--develop').first()).toBeVisible({ timeout: 15_000 });
  expect(offenders, `off-origin requests: ${offenders.join(', ')}`).toEqual([]);
});
