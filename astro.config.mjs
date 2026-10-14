// @ts-check
import { defineConfig } from 'astro/config';
import { LEGACY_REDIRECTS } from './src/lib/routes.ts';

// Author/root-relative paths are intentional: the independent historical verifier checks them
// BEFORE scripts/rebase-dist.mjs prefixes the generated output for the GitHub Pages project
// URL /pexis-academy/. A second independent verifier tests the prefixed artifact.
// Do not set Astro `base` here without migrating those contracts and both build verifiers.
// Legacy routes redirect via static refresh pages because Pages cannot issue HTTP redirects.
export default defineConfig({
  site: 'https://guilhermehrcst.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  output: 'static',
  redirects: { ...LEGACY_REDIRECTS },
});
