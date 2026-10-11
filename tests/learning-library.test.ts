import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterResources, resourcesByArea, resourcesByIds } from '../src/lib/learning-library.ts';
import type { PublishedLearningResource } from '../src/lib/learning-resources.ts';

const verified = { on: '2026-10-11', by: 'official-page' as const, freeAccess: true as const };
const items: PublishedLearningResource[] = [
  { id: 'a', title: 'A', provider: 'P', area: 'math', subject: 'math', format: 'course', goals: ['high-school', 'enem'], language: 'pt', level: 'high-school', url: 'https://example.com/a', verified },
  { id: 'b', title: 'B', provider: 'P', area: 'math', subject: 'math', format: 'playlist', goals: ['uerj', 'vestibular'], language: 'pt', level: 'vestibular', url: 'https://example.com/b', verified },
  { id: 'c', title: 'C', provider: 'P', area: 'nature', subject: 'physics', format: 'lessons', goals: ['enem', 'uerj'], language: 'pt', level: 'vestibular', url: 'https://example.com/c', verified },
];

test('one selected goal matches a multi-goal resource', () => {
  assert.deepEqual(filterResources(items, { goals: ['enem'] }).map((r) => r.id), ['a', 'c']);
});

test('multiple selected goals use OR semantics', () => {
  assert.deepEqual(filterResources(items, { goals: ['high-school', 'uerj'] }).map((r) => r.id), ['a', 'b', 'c']);
});

test('multiple selected formats use OR semantics', () => {
  assert.deepEqual(filterResources(items, { formats: ['course', 'lessons'] }).map((r) => r.id), ['a', 'c']);
});

test('dimensions combine with AND semantics', () => {
  assert.deepEqual(filterResources(items, { area: 'math', goals: ['uerj'], formats: ['playlist'] }).map((r) => r.id), ['b']);
});

test('subject narrows within an area', () => {
  assert.deepEqual(filterResources(items, { area: 'nature', subject: 'physics' }).map((r) => r.id), ['c']);
});

test('empty filter restores the full ordered list', () => {
  assert.deepEqual(filterResources(items, {}).map((r) => r.id), ['a', 'b', 'c']);
});

test('resourcesByArea preserves source order', () => {
  assert.deepEqual(resourcesByArea(items, 'math').map((r) => r.id), ['a', 'b']);
});

test('resourcesByIds follows requested order and omits unknown ids', () => {
  assert.deepEqual(resourcesByIds(items, ['c', 'missing', 'a']).map((r) => r.id), ['c', 'a']);
});
