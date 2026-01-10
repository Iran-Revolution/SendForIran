import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
  output: 'static',
  
  site: 'https://sendforiran.org',
  
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    preact(),
  ],
  
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fa', 'de', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});

