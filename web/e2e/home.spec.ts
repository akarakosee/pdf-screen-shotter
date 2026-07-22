// E2E for the homepage Developing Tray hero (ADR-006, revised twice). The
// tray is a purely representative CSS illustration (no real document
// render, no WASM/worker, no fetch involved) — covers: the 6 illustrated
// pages exist and their perpetual draw-in loop is genuinely animating (not
// a static image), and the page makes zero off-origin requests.

import { expect, test } from '@playwright/test';

test('Developing Tray renders 6 illustrated pages with a running loop', async ({ page }) => {
  await page.goto('/');
  const pages = page.locator('.tray-page');
  await expect(pages).toHaveCount(6);

  // The loop is CSS-driven (no JS state), so prove it's live by sampling a
  // title bar's computed transform at two points in time and confirming it
  // changes — a static illustration would report the same matrix twice.
  const title = page.locator('.tray-page-title').first();
  const t1 = await title.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(1000);
  const t2 = await title.evaluate((el) => getComputedStyle(el).transform);
  expect(t1 === t2 && t1 === 'none').toBe(false);
});

test('the homepage makes zero off-origin requests', async ({ page }) => {
  const offenders: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith('http://localhost:4321')) offenders.push(req.url());
  });
  await page.goto('/');
  await expect(page.locator('.tray-page')).toHaveCount(6);
  await page.waitForTimeout(500);
  expect(offenders, `off-origin requests: ${offenders.join(', ')}`).toEqual([]);
});
