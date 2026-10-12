import { test } from 'node:test';
import assert from 'node:assert/strict';
import { higherEducation, HIGHER_EDUCATION_GROUP_PLAN, HIGHER_EDUCATION_GROUPS } from '../src/lib/higher-education.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { UNIVERSITY_PUBLISHERS } from './university-publishers.ts';

// Ensino Superior shows university courses already verified in the catalogue, grouped by field. It
// never invents a programme: every id must be published, and every provider is a university.

test('the groups follow the plan order; none is empty; the two V0.3 groups keep at least two courses', () => {
  const plan = HIGHER_EDUCATION_GROUP_PLAN.map((g) => g.id);
  const shown = higherEducation();
  assert.deepEqual(shown.map((g) => g.id), plan.filter((id) => shown.some((g) => g.id === id)), 'plan order');
  for (const group of shown) assert.ok(group.resources.length >= 1, `${group.id} is empty`);
  for (const id of ['matematica', 'computacao']) assert.ok(shown.find((g) => g.id === id)!.resources.length >= 2, id);
});

test('staging today: exactly the two V0.3 groups are shown (no Gate B course is published yet)', () => {
  assert.deepEqual(HIGHER_EDUCATION_GROUPS.map((g) => g.id), ['matematica', 'computacao']);
});

test('every course is published, unique, and published by a university', () => {
  const ids = higherEducation().flatMap((g) => g.resources.map((r) => r.id));
  assert.equal(new Set(ids).size, ids.length);
  const published = new Set(publishedResources.map((r) => r.id));
  for (const id of ids) assert.ok(published.has(id), id);
  for (const r of higherEducation().flatMap((g) => g.resources)) assert.ok(UNIVERSITY_PUBLISHERS.includes(r.provider), `${r.id}: ${r.provider}`);
});

test('an unknown id fails the build instead of leaving a gap', async () => {
  const { resolveGroups } = await import('../src/lib/higher-education.ts');
  assert.throws(() => resolveGroups([{ id: 'matematica', label: 'x', why: 'x', resourceIds: ['nope'] }]));
});

test('staging today: the Superior summary is the released V0.3 text, in the menu and on the Home', async () => {
  const copy = await import('../src/lib/superior-copy.ts') as Record<string, any>;
  const { pt } = await import('../src/i18n/pt.ts');
  assert.equal(copy.objectiveSummaryFor?.('ensino-superior'), pt.home.objectives.items['ensino-superior']);
});

test('the "Explorar" menu reads the path summaries from the shared source, not the fixed text', async () => {
  const { readFileSync } = await import('node:fs');
  const header = readFileSync(new URL('../src/components/SiteHeader.astro', import.meta.url), 'utf8');
  assert.match(header, /objectiveSummaryFor\(item\.id\)/);
  assert.doesNotMatch(header, /t\.home\.objectives\.items\[item\.id\]/);
});
