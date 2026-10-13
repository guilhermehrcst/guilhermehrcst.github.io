import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { publishedResources, RELEASE } from '../src/lib/learning-resources.ts';
import { buildSearchIndex } from '../src/lib/search-index.ts';
import { PATH_STATUS } from '../src/lib/taxonomy.ts';
import release from '../src/data/academy-release/release.json' with { type: 'json' };

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const coursePages = [
  'src/pages/ensino-fundamental/index.astro',
  'src/pages/ensino-medio/index.astro',
  'src/pages/vestibulares/index.astro',
  'src/pages/pre-militar/index.astro',
  'src/pages/ensino-superior/index.astro',
  'src/pages/tecnologia/index.astro',
  'src/pages/materias/index.astro',
  'src/pages/materias/[subject]/index.astro',
  'src/pages/enem/index.astro',
  'src/pages/uerj/index.astro',
];

test('the editorial course-page design is shared by study routes but not the home or search', () => {
  for (const path of coursePages) assert.match(read(path), /<Base\b[^>]*\bcourseEdition>/, path);
  for (const path of ['src/pages/index.astro', 'src/pages/buscar/index.astro', 'src/pages/sobre/index.astro']) {
    assert.doesNotMatch(read(path), /\bcourseEdition\b/, path);
  }
  const shell = read('src/layouts/Base.astro');
  assert.match(shell, /courseEdition\?: boolean/);
  assert.match(shell, /course-edition-page/);
  assert.match(shell, /course-edition/);
});

test('editorial cards retain a single authentic accessible outbound source link', () => {
  const item = read('src/components/ResourceItem.astro');
  assert.match(item, /class="resource-poster" aria-hidden="true"/);
  assert.match(item, /src="\/icon-192\.png" alt=""/, 'the brand poster seal must reuse the official app icon');
  assert.match(item, /<ProviderMark name=\{r\.provider\}/);
  assert.match(item, /data-poster-format=\{r\.format\}/);
  assert.equal((item.match(/<a\s/g) ?? []).length, 1);
  const start = item.indexOf('<a href={r.url} target="_blank" rel="noopener noreferrer">');
  const end = item.indexOf('</a>', start);
  const action = item.indexOf('data-source-action');
  assert.ok(start >= 0 && action > start && action < end);
});

test('reference-inspired styling uses own Academy artwork, no GitHub/stock image URLs', () => {
  const css = read('src/styles/global.css');
  const item = read('src/components/ResourceItem.astro');
  assert.match(css, /\.course-edition \.band \.intro/);
  assert.match(css, /\.course-edition \.track > \.head/);
  assert.match(css, /\.course-edition \.resource \.resource-poster/);
  assert.match(css, /\.course-edition \.resource \.source-action/);
  assert.match(css, /@media\(max-width:767px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(item, /github|unsplash\.com|https:\/\/images\./i);
  assert.doesNotMatch(css, /github\.com|img\.youtube\.com|unsplash\.com/i);
  assert.match(css, /var\(--action\)/);
});

test('only the public L001/L002 records enter the edited layout', () => {
  assert.equal(release.inventory.length, 44);
  assert.equal(publishedResources.length, 44);
  assert.deepEqual(release.applied.map(lot => lot.lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  const ita = buildSearchIndex().find(entry => entry.id === 'recurso:ita-provas-anteriores');
  assert.equal(ita?.url, '/pre-militar/#recurso-ita-provas-anteriores');
});
