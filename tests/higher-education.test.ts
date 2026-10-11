import { test } from 'node:test';
import assert from 'node:assert/strict';
import { higherEducation, HIGHER_EDUCATION_GROUPS } from '../src/lib/higher-education.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';

// Ensino Superior shows university courses already verified in the catalogue, grouped by field. It
// never invents a programme: every id must be published, and every provider is a university.
test('the groups, in order, each with courses', () => {
  assert.deepEqual(HIGHER_EDUCATION_GROUPS.map((g) => g.id), ['matematica', 'computacao']);
  for (const group of higherEducation()) assert.ok(group.resources.length >= 2, group.id);
});

test('every course is published, unique, and published by a university', () => {
  const ids = higherEducation().flatMap((g) => g.resources.map((r) => r.id));
  assert.equal(new Set(ids).size, ids.length);
  const published = new Set(publishedResources.map((r) => r.id));
  for (const id of ids) assert.ok(published.has(id), id);
  for (const r of higherEducation().flatMap((g) => g.resources)) {
    assert.ok(['MIT OpenCourseWare', 'Harvard University'].includes(r.provider), `${r.id}: ${r.provider}`);
  }
});

test('an unknown id fails the build instead of leaving a gap', async () => {
  const { resolveGroups } = await import('../src/lib/higher-education.ts');
  assert.throws(() => resolveGroups([{ id: 'matematica', label: 'x', why: 'x', resourceIds: ['nope'] }]));
});
