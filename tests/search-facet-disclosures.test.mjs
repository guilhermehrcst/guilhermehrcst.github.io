// Source-level contract for progressive enhancement: the no-JS index remains complete.
// Browser behavior is additionally covered by the RC QA suite before publication.
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const component = readFileSync(new URL('../src/components/SearchIndex.astro', import.meta.url), 'utf8');
const behavior = readFileSync(new URL('../src/scripts/search.ts', import.meta.url), 'utf8');
const styles = component.slice(component.indexOf('<style>'));

test('search facets: native disclosure per filter with an accessible group legend', () => {
  assert.match(component, /<details class="facet" data-facet-disclosure=\{facet\}>/);
  assert.match(component, /<summary class="facet-summary">/);
  assert.match(component, /<fieldset data-facet=\{facet\}>/);
  assert.match(component, /<legend class="sr-only">\{f\.facets\[facet\]\}<\/legend>/);
  assert.match(component, /data-facet-count/);
});

test('search facets: selected counts derive from real checked inputs, not guessed metadata', () => {
  assert.match(behavior, /const disclosures = \[\.\.\.form\.querySelectorAll<HTMLDetailsElement>\('\[data-facet-disclosure\]'\)\]/);
  assert.match(behavior, /const updateFacetSummaries = \(\) =>/);
  assert.match(behavior, /querySelectorAll<HTMLInputElement>\('\[data-facet-option\]:checked'\)/);
  assert.match(behavior, /disclosure\.dataset\['hasSelection'\]/);
  assert.match(behavior, /updateFacetSummaries\(\)/);
});

test('search facets: shared links with an active institution/filter expand the relevant disclosure', () => {
  assert.match(behavior, /const initial = parseSelection\(params, options\)/);
  assert.match(behavior, /if \(boxes\.some\(\(b\) => b\.checked\)\)/);
  assert.match(behavior, /filters\.open = true/);
  assert.match(behavior, /if \(disclosure\.querySelector\('\[data-facet-option\]:checked'\)\) disclosure\.open = true/);
});

test('search facets: mobile options begin folded and keep a keyboard-sized disclosure target', () => {
  assert.match(styles, /\.facet-summary\s*\{[^}]*min-height:\s*48px/s);
  assert.match(styles, /\.facets\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.doesNotMatch(component, /<details class="facet"[^>]*\sopen(?:\s|>)/);
});

test('search facets: the entire directory still works when JavaScript is unavailable', () => {
  assert.match(component, /<form role="search"[^>]*hidden data-search-form>/);
  assert.match(component, /\{groups\.map\(\(group\) => \(/);
  assert.match(component, /data-search-entry/);
  assert.match(behavior, /form\.hidden = false/);
});
