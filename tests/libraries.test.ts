// The two libraries (header V0.5): /cursos/ and /materiais/ are views of the published catalogue by format.
// They publish nothing: every resource they list is published, every published resource is in exactly one,
// and no candidate (staged, Gate B, L003) ever reaches them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSE_FORMATS, MATERIAL_FORMATS, libraryGroups, libraryOf } from '../src/lib/libraries.ts';
import { LEARNING_FORMATS, publishedResources } from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { MILITARY_L003_CANDIDATES } from '../src/lib/staging-military.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const ids = (library: 'cursos' | 'materiais') => libraryGroups(library).flatMap((g) => g.resources.map((r) => r.id));

test('the formats, as approved: courses and materials, each format in exactly one library', () => {
  assert.deepEqual([...COURSE_FORMATS], ['course', 'track', 'playlist', 'lessons', 'lesson']);
  assert.deepEqual([...MATERIAL_FORMATS], ['practice', 'simulator', 'past-exam', 'reference']);
  assert.deepEqual([...COURSE_FORMATS, ...MATERIAL_FORMATS].sort(), [...LEARNING_FORMATS].sort());
  for (const f of COURSE_FORMATS) assert.equal(libraryOf(f), 'cursos');
  for (const f of MATERIAL_FORMATS) assert.equal(libraryOf(f), 'materiais');
});

test('every published resource is in exactly one library, and nothing else is', () => {
  const courses = ids('cursos');
  const materials = ids('materiais');
  assert.ok(courses.length > 0 && materials.length > 0, 'neither library is empty');
  assert.equal(new Set([...courses, ...materials]).size, courses.length + materials.length, 'no resource twice');
  assert.deepEqual([...courses, ...materials].sort(), publishedResources.map((r) => r.id).sort());
});

test('no candidate reaches a library', () => {
  const listed = new Set([...ids('cursos'), ...ids('materiais')]);
  const published = new Set(publishedResources.map((r) => r.id));
  for (const r of [...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES, ...MILITARY_L003_CANDIDATES]) {
    if (!published.has(r.id)) assert.ok(!listed.has(r.id), `${r.id} is not published`);
  }
});

test('groups follow the format order, are never empty, and keep the catalogue order', () => {
  for (const library of ['cursos', 'materiais'] as const) {
    const groups = libraryGroups(library);
    const order = library === 'cursos' ? COURSE_FORMATS : MATERIAL_FORMATS;
    assert.deepEqual(groups.map((g) => g.format), order.filter((f) => groups.some((g) => g.format === f)));
    for (const g of groups) {
      assert.ok(g.resources.length > 0);
      const positions = g.resources.map((r) => publishedResources.indexOf(r));
      assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    }
  }
  // A format with nothing published is left out rather than shown empty.
  assert.deepEqual(libraryGroups('materiais', []), []);
});

test('verify-dist keeps an equal, hand-written copy of the libraries', () => {
  const dist = read('scripts/verify-dist.mjs');
  assert.ok(dist.includes(`'/cursos/': ${JSON.stringify([...COURSE_FORMATS]).replace(/"/g, "'").replace(/,/g, ', ')}`));
  assert.ok(dist.includes(`'/materiais/': ${JSON.stringify([...MATERIAL_FORMATS]).replace(/"/g, "'").replace(/,/g, ', ')}`));
});

test('a library page is a view: the same cards, no resource anchor, linked to the providers', () => {
  const page = read('src/components/LibraryPage.astro');
  assert.match(page, /<ResourceList resources=\{group\.resources\} \/>/, 'no `anchored`: the anchor stays on the resource\'s own page');
  assert.doesNotMatch(page, /anchored=|resourceAnchor|id={?["'`]recurso-/);
});
