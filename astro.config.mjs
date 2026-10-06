// @ts-check
import { defineConfig } from 'astro/config';

// User site (guilhermehrcst.github.io): served from the domain root, so no `base`.
// Output is fully static; GitHub Pages serves `dist/` as uploaded by the deploy workflow.
export default defineConfig({
  site: 'https://guilhermehrcst.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  output: 'static',
});
