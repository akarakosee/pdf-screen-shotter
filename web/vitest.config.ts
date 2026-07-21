import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Increment 1 ships no tests yet; real suites arrive with the engine (increment 2).
    passWithNoTests: true,
    // e2e/ holds Playwright specs, which use their own test()/expect() globals
    // and must not be collected by vitest.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
});
