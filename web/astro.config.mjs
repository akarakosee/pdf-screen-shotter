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
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
