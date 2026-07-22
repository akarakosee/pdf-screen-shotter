// Regression test for the "FAQ invisible until scroll" defect found during
// the secondary-pages UI audit (2026-07-22): `.reveal` sections start at
// opacity:0 and only reach opacity:1 once an IntersectionObserver fires.
// The FAQ section sits below the initial viewport, so without a real scroll
// event it stayed at opacity:0 forever — invisible to screen readers, print,
// and any visit that doesn't scroll. This test loads the page and asserts
// the FAQ becomes visible WITHOUT performing any scroll or pointer action.

import { expect, test } from '@playwright/test';

test('FAQ section becomes visible without any scroll (ADR-006 reveal fallback)', async ({
  page,
}) => {
  await page.goto('/pdf-to-png/');

  const faqHeading = page.locator('h2', { hasText: 'Frequently asked questions' });
  const faqSection = faqHeading.locator('xpath=..');

  await expect
    .poll(async () => faqSection.evaluate((el) => getComputedStyle(el).opacity), {
      message: 'FAQ section should reach opacity 1 within ~1s without any scroll',
      timeout: 2_000,
    })
    .toBe('1');
});
