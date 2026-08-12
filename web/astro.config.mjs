// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://example.pages.dev', // replaced with the real domain before launch
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom']
    },
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
      //
      // Same failure mode for @dnd-kit/*: OrganizeShell.tsx (organize-pdf,
      // rotate-pdf, remove-pages) and ImgToPdfShell.tsx (img-to-pdf,
      // png-to-pdf) are React islands hydrated lazily, so the scanner never
      // sees their @dnd-kit import at server start either — manifested as
      // "504 Outdated Optimize Dep" on @dnd-kit_core/sortable/utilities,
      // which aborts island hydration entirely (file picker looks dead:
      // select a file, nothing happens, no error surfaces to the user).
      //
      // Identical structural risk for @pdfsmaller/pdf-decrypt (unlock-pdf)
      // and @pdfsmaller/pdf-encrypt-lite (protect-pdf) — also only reachable
      // through their own lazy islands. Not currently observed 504ing in a
      // long-running dev session (already discovered by an earlier visit),
      // but a fresh `npm run dev` hits the identical cold-start gap.
      include: [
        'fflate',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        '@pdfsmaller/pdf-decrypt',
        '@pdfsmaller/pdf-encrypt-lite',
      ],
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
