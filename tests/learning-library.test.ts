import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterResources, resourcesByArea, resourcesByIds } from '../src/lib/learning-library.ts';
import type { PublishedLearningResource } from '../src/lib/learning-resources.ts';

const verified = { on: '2026-10-11', by: 'official-page' as const, freeAccess: true as const };
const items: PublishedLearningResource[] = [
  { id: 'a', title: 'A', provider: 'P', subject: 'matematica', format: 'course', paths: ['ensino-medio', 'vestibulares'], exams: ['enem'], language: 'pt', level: 'high-school', url: 'https://example.com/a', verified },
  { id: 'b', title: 'B', provider: 'P', subject: 'matematica', format: 'playlist', paths: ['vestibulares'], exams: ['uerj'], language: 'pt', level: 'vestibular', url: 'https://example.com/b', verified },
  { id: 'c', title: 'C', provider: 'P', subject: 'fisica', format: 'lessons', paths: ['vestibulares'], exams: ['enem', 'uerj'], language: 'pt', level: 'vestibular', url: 'https://example.com/c', verified },
];

test('one selected goal matches a multi-goal resource', () => {
  assert.deepEqual(filterResources(items, { exams: ['enem'] }).map((r) => r.id), ['a', 'c']);
});

test('values inside one dimension use OR semantics', () => {
  assert.deepEqual(filterResources(items, { exams: ['enem', 'uerj'] }).map((r) => r.id), ['a', 'b', 'c']);
  assert.deepEqual(filterResources(items, { paths: ['ensino-medio', 'tecnologia'] }).map((r) => r.id), ['a']);
});

test('path and exam are separate dimensions and combine with AND', () => {
  assert.deepEqual(filterResources(items, { paths: ['vestibulares'], exams: ['uerj'] }).map((r) => r.id), ['b', 'c']);
  assert.deepEqual(filterResources(items, { paths: ['ensino-medio'], exams: ['uerj'] }).map((r) => r.id), []);
});

test('multiple selected formats use OR semantics', () => {
  assert.deepEqual(filterResources(items, { formats: ['course', 'lessons'] }).map((r) => r.id), ['a', 'c']);
});

test('dimensions combine with AND semantics', () => {
  assert.deepEqual(filterResources(items, { area: 'matematica', exams: ['uerj'], formats: ['playlist'] }).map((r) => r.id), ['b']);
});

test('the area is derived from the subject', () => {
  assert.deepEqual(filterResources(items, { area: 'natureza' }).map((r) => r.id), ['c']);
  assert.deepEqual(filterResources(items, { subject: 'fisica' }).map((r) => r.id), ['c']);
});

test('empty filter restores the full ordered list', () => {
  assert.deepEqual(filterResources(items, {}).map((r) => r.id), ['a', 'b', 'c']);
});

test('resourcesByArea preserves source order', () => {
  assert.deepEqual(resourcesByArea(items, 'matematica').map((r) => r.id), ['a', 'b']);
});

test('resourcesByIds follows the requested order', () => {
  assert.deepEqual(resourcesByIds(items, ['c', 'a']).map((r) => r.id), ['c', 'a']);
});

test('resourcesByIds fails closed on an unknown id', () => {
  assert.throws(() => resourcesByIds(items, ['c', 'missing']));
});

test('objectivesFor derives, in the Home order, the objectives a subject has resources for', async () => {
  const { objectivesFor } = await import('../src/lib/learning-library.ts');
  assert.deepEqual(objectivesFor('matematica'), ['enem', 'uerj', 'ensino-medio', 'vestibulares']);
  assert.deepEqual(objectivesFor('quimica'), ['enem', 'ensino-medio', 'vestibulares']);
  assert.deepEqual(objectivesFor('redacao'), ['enem', 'uerj', 'ensino-medio', 'vestibulares']);
});

test('objectiveFacts counts what each path really holds', async () => {
  const { objectiveFacts } = await import('../src/lib/learning-library.ts');
  const { publishedResources } = await import('../src/lib/learning-resources.ts');
  const { higherEducation } = await import('../src/lib/higher-education.ts');
  const onPath = (path: string) => publishedResources.filter((r) => (r.paths as readonly string[]).includes(path)).length;
  const forExam = (exam: string) => publishedResources.filter((r) => (r.exams as readonly string[] | undefined)?.includes(exam)).length;
  assert.deepEqual(objectiveFacts('ensino-fundamental'), { resources: 0 });
  assert.deepEqual(objectiveFacts('ensino-medio'), { resources: onPath('ensino-medio') });
  // Vestibular holds its exams: an exam's resources declare its parent path.
  assert.deepEqual(objectiveFacts('vestibulares'), { resources: onPath('vestibulares') });
  assert.equal(objectiveFacts('vestibulares').resources, 20);
  assert.deepEqual(objectiveFacts('pre-militar'), { resources: 0 });
  assert.deepEqual(objectiveFacts('ensino-superior'), { resources: higherEducation().flatMap((g) => g.resources).length });
  assert.deepEqual(objectiveFacts('tecnologia'), { resources: 17, tracks: 7 });
  assert.deepEqual(objectiveFacts('enem'), { resources: forExam('enem') });
  assert.deepEqual(objectiveFacts('uerj'), { resources: 7 });
});

test('institutions lists only providers that publish, with their resources in catalogue order', async () => {
  const { institutions } = await import('../src/lib/learning-library.ts');
  const { publishedResources } = await import('../src/lib/learning-resources.ts');
  const list = institutions(['Harvard University', 'Microsoft Learn', 'FGV']);
  // Microsoft Learn has no published resource: it is left out, never shown empty.
  assert.deepEqual(list.map((i) => i.provider), ['Harvard University', 'FGV']);
  const harvard = publishedResources.filter((r) => r.provider === 'Harvard University').map((r) => r.id);
  assert.deepEqual(list[0]?.resources.map((r) => r.id), harvard);
  assert.equal(list[0]?.resources.length, 5);
});
