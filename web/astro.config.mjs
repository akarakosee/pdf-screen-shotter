// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.pages.dev', // replaced with the real domain before launch
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // The render worker dynamically imports the mupdf WASM module; the default
    // iife worker format can't code-split, so build workers as ES modules.
    worker: { format: 'es' },
    optimizeDeps: {
      // render.worker.ts is only reached via `new Worker(new URL(...))`,
      // created lazily on hover/dragenter — Vite's dep scanner never crawls
      // into that graph at server start, so fflate (a CJS package the worker
      // statically imports via zipStream.ts) is undiscovered until the
      // worker's first real request. Optimizing it on-demand mid-session
      // triggers a "new dep, reloading" cycle that re-requests the same
      // worker graph, which re-triggers the same discovery — an infinite
      // loop of 504s on fflate.js in dev. Declaring it upfront makes it part
      // of the initial pre-bundle instead.
      include: ['fflate'],
      // mupdf is real ESM ("type": "module") and ships a large WASM binary;
      // esbuild pre-bundling it is unnecessary and risks mishandling its
      // internal wasm asset resolution. It's already loaded via a runtime
      // dynamic import (engine/MuPdfEngine.ts), so exclude it explicitly
      // rather than let the scanner guess.
      exclude: ['mupdf'],
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
