// Regression test for the "dead vertical gap under the idle DropZone"
// defect found during the secondary-pages UI audit (2026-07-22): the
// ToolShell region wrapper was hardcoded to min-h-[420px], leaving 200px+
// of blank space between the DropZone/privacy line and "How it works" on
// first load, before any file is dropped. This asserts the gap stays small.

import { expect, test } from '@playwright/test';

test('idle-state DropZone has no large dead zone before "How it works"', async ({ page }) => {
  await page.goto('/pdf-to-png/');

  const privacyLine = page.getByText('Files are processed on your device', { exact: false });
  const howItWorks = page.locator('h2', { hasText: 'How it works' });

  const privacyBottom = await privacyLine.evaluate((el) => el.getBoundingClientRect().bottom);
  const howItWorksTop = await howItWorks.evaluate((el) => el.getBoundingClientRect().top);

  expect(howItWorksTop - privacyBottom).toBeLessThan(120);
});
