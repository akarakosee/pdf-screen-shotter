// E2E for the homepage Developing Tray hero (ADR-006, revised). The tray is
// a purely representative CSS illustration now (no real document render, no
// WASM/worker involved) — covers: the illustrated pages actually reveal on
// load, and the page makes zero off-origin requests (nothing to fetch, no
// engine to load, so this is trivially true but worth asserting as a
// regression guard).

import { expect, test } from '@playwright/test';

test('Developing Tray reveals its illustrated pages on load', async ({ page }) => {
  await page.goto('/');
  const tray = page.locator('[data-tray-reveal]');
  await expect(tray).toHaveClass(/is-revealed/, { timeout: 5_000 });
  await expect(page.locator('.tray-page')).toHaveCount(6);
});

test('the homepage makes zero off-origin requests', async ({ page }) => {
  const offenders: string[] = [];
  page.on('request', (req) => {
    if (!req.url().startsWith('http://localhost:4321')) offenders.push(req.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-tray-reveal]')).toHaveClass(/is-revealed/, { timeout: 5_000 });
  expect(offenders, `off-origin requests: ${offenders.join(', ')}`).toEqual([]);
});
