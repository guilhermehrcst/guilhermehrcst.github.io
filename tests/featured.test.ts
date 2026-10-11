import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PublishedLearningResource } from '../src/lib/learning-resources.ts';

// V0.4 M1 (spec §5.2): ten editorial highlights per path, sixty distinct in all. A selection, not the
// catalogue: the catalogue keeps everything verified. Until every highlight is homologated, the selection
// is in staging and nothing may present it as complete (spec §4.1, plan Gate B).
const featured = await import('../src/lib/featured.ts').catch(() => ({})) as Record<string, any>;
const verified = { on: '2026-10-11', by: 'official-page' as const, freeAccess: true as const };
const make = (id: string, paths: string[]) =>
  ({ id, title: id, provider: 'P', subject: 'matematica', format: 'course', paths, language: 'pt', level: 'high-school', url: `https://example.com/${id}`, verified }) as unknown as PublishedLearningResource;
const PATHS = ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia'];
const pool = PATHS.flatMap((p) => Array.from({ length: 10 }, (_, i) => make(`${p}-${i}`, [p])));
const full = Object.fromEntries(PATHS.map((p) => [p, Array.from({ length: 10 }, (_, i) => `${p}-${i}`)]));
const empty = Object.fromEntries(PATHS.map((p) => [p, []]));
const check = (selection: Record<string, string[]>, state: 'staging' | 'final', resources = pool): string[] =>
  featured.featuredProblems(selection, state, resources);

test('the selection has one list per path and holds ten per path', () => {
  assert.equal(featured.FEATURED_PER_PATH, 10);
  assert.deepEqual(Object.keys(featured.FEATURED_RESOURCE_IDS_BY_PATH ?? {}), PATHS);
});

test('staging today: no highlight is homologated, so every list is empty and the selection is incomplete', () => {
  assert.equal(featured.FEATURED_STATE, 'staging');
  for (const p of PATHS) assert.deepEqual(featured.FEATURED_RESOURCE_IDS_BY_PATH[p], [], p);
  assert.equal(featured.featuredComplete(), false);
  assert.deepEqual(check(featured.FEATURED_RESOURCE_IDS_BY_PATH, 'staging', []), []);
});

test('sixty distinct, ten per path, is a valid final selection', () => {
  assert.deepEqual(check(full, 'final'), []);
});

test('final requires exactly ten in every path; staging accepts fewer but never more', () => {
  const short = { ...full, tecnologia: full.tecnologia!.slice(0, 9) };
  assert.match(check(short, 'final').join('\n'), /tecnologia: 9 of 10/);
  assert.deepEqual(check(short, 'staging'), []);
  assert.deepEqual(check(empty, 'staging'), []);
  const long = { ...full, tecnologia: [...full.tecnologia!, 'ensino-medio-0'] };
  assert.match(check(long, 'staging').join('\n'), /tecnologia: 11 of 10/);
});

test('an unknown or unpublished id is refused', () => {
  const bad = { ...empty, 'ensino-medio': ['nope'] };
  assert.match(check(bad, 'staging').join('\n'), /ensino-medio: nope is not a published resource/);
});

test('a highlight must declare the path it is featured in', () => {
  const bad = { ...empty, tecnologia: ['ensino-medio-0'] };
  assert.match(check(bad, 'staging').join('\n'), /tecnologia: ensino-medio-0 does not declare tecnologia/);
});

test('an id repeated in one list, or featured in two paths, is refused: sixty must be distinct', () => {
  const twice = { ...empty, 'ensino-medio': ['ensino-medio-0', 'ensino-medio-0'] };
  assert.match(check(twice, 'staging').join('\n'), /ensino-medio: ensino-medio-0 is listed twice/);
  const both = make('both', ['ensino-medio', 'vestibulares']);
  const shared = { ...empty, 'ensino-medio': ['both'], vestibulares: ['both'] };
  assert.match(check(shared, 'staging', [...pool, both]).join('\n'), /both is featured in ensino-medio and vestibulares/);
});

test('featuredFor resolves a path to its published resources in order', () => {
  assert.deepEqual(featured.featuredFor('tecnologia'), []);
});

// M3: a path shows its highlights only when its list is complete and valid: never an empty or partial
// "Destaques", never on a path still in preparation (it must leave preparation first, deliberately).
test('featuredReady: a path is ready only with ten valid highlights', () => {
  const ready = featured.featuredReady;
  assert.equal(typeof ready, 'function');
  assert.equal(ready('ensino-medio', full, pool), true);
  assert.equal(ready('ensino-medio', { ...full, 'ensino-medio': full['ensino-medio']!.slice(0, 9) }, pool), false);
  assert.equal(ready('ensino-medio', empty, pool), false);
  assert.equal(ready('ensino-medio', { ...full, tecnologia: ['nope'] }, pool), false, 'an invalid selection is never ready anywhere');
  for (const p of PATHS) assert.equal(ready(p), false, `${p} is not ready today`);
});
