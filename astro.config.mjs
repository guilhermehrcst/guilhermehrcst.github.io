// @ts-check
import { defineConfig } from 'astro/config';
import { LEGACY_REDIRECTS } from './src/lib/routes.ts';

// Served from the domain root, so no `base`. Output is fully static; GitHub Pages serves `dist/` as
// uploaded by the deploy workflow. GitHub Pages cannot send HTTP redirects, so each former route
// becomes a small page that refreshes to its destination (spec §8.4).
export default defineConfig({
  site: 'https://guilhermehrcst.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  output: 'static',
  redirects: { ...LEGACY_REDIRECTS },
});
