import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Increment 1 ships no tests yet; real suites arrive with the engine (increment 2).
    passWithNoTests: true,
  },
});
