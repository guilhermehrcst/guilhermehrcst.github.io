import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// V0.4 QA (2026-10-12): the route separators in the Home hero demo are decoration. They are drawn in
// --rule-strong (1.6:1 on paper), exactly like the breadcrumb separators, which are CSS-generated and so
// never announced. As real <span>s they were read aloud ("barra") and counted as low-contrast text.
// They stay visible; they are hidden from assistive technology, like every other separator on the site.
test('the hero demo separators are decorative: hidden from assistive technology', () => {
  const source = readFileSync(new URL('../src/components/HeroDemo.astro', import.meta.url), 'utf8');
  const separators = [...source.matchAll(/<span([^>]*)>\/<\/span>/g)];
  assert.ok(separators.length >= 2, 'the demo still shows its route separators');
  for (const [, attrs] of separators) assert.match(attrs!, /aria-hidden="true"/);
});
