// One product: every study page shares the Home's shell and design system (header, footer, paper, the
// Newsreader headings, the wine action colour) and its resource cards follow the Home's ready-path cards.
// Replaces the course-edition guards: that page-only theme (light header and footer, sans headings with a
// trailing slash, invented course posters, an oversized footer wordmark) is gone and must not come back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { publishedResources, RELEASE } from '../src/lib/learning-resources.ts';
import { buildSearchIndex } from '../src/lib/search-index.ts';
import { PATH_STATUS } from '../src/lib/taxonomy.ts';
import release from '../src/data/academy-release/release.json' with { type: 'json' };

const read = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const walk = (dir: string): string[] => readdirSync(new URL(`../${dir}`, import.meta.url))
  .flatMap((name) => statSync(new URL(`../${dir}/${name}`, import.meta.url)).isDirectory() ? walk(`${dir}/${name}`) : [`${dir}/${name}`]);
const sources = [...walk('src/pages'), ...walk('src/components'), ...walk('src/layouts'), 'src/styles/global.css'];

test('no page-only theme: every page renders the same shell, with no layout flag or body class', () => {
  for (const file of sources) {
    const code = read(file);
    assert.doesNotMatch(code, /courseEdition|course-edition|--edition-/, `${file}: page-only theme`);
  }
  const shell = read('src/layouts/Base.astro');
  assert.match(shell, /<body>/, 'the body carries no page-specific class');
  assert.match(shell, /<SiteHeader \/>/);
  assert.match(shell, /<SiteFooter \/>/);
});

test('the global stylesheet never restyles the shared header or footer for some pages', () => {
  const css = read('src/styles/global.css');
  assert.doesNotMatch(css, /\.site-header|\.site-footer/, 'header and footer keep their own component styles');
  assert.doesNotMatch(css, /h[12][^{]*::after\s*\{[^}]*content:\s*'\/'/, 'no decorative slash after headings');
  assert.match(css, /h1, h2 \{ font-family: var\(--serif\)/, 'page and section titles stay in Newsreader');
});

test('resource cards follow the Home ready-path card: tokens, serif title, one real link, no invented cover', () => {
  const item = read('src/components/ResourceItem.astro');
  const paths = read('src/components/FeaturedPaths.astro');
  for (const token of ['var(--raised)', '1px solid var(--rule)', 'var(--radius-lg)']) {
    assert.ok(paths.includes(token), `the Home card uses ${token}`);
    assert.ok(item.includes(token), `the resource card uses ${token}`);
  }
  assert.match(item, /\.title \{ font-family: var\(--serif\)/);
  assert.equal((item.match(/<a\s/g) ?? []).length, 1, 'one outbound link per resource');
  assert.doesNotMatch(item, /<img\b|poster|data-resource-poster/, 'no cover or illustration is invented for a resource');
  assert.match(item, /href=\{r\.url\}/, 'the link is the record URL, never a page of ours');
});

test('only the public L001/L002 records are shown', () => {
  assert.equal(release.inventory.length, 44);
  assert.equal(publishedResources.length, 44);
  assert.deepEqual(release.applied.map((lot) => lot.lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  const ita = buildSearchIndex().find((entry) => entry.id === 'recurso:ita-provas-anteriores');
  assert.equal(ita?.url, '/pre-militar/#recurso-ita-provas-anteriores');
});
