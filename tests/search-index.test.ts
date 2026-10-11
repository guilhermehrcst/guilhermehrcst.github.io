import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex } from '../src/lib/search-index.ts';
import { filterEntries, matches, normalize } from '../src/lib/search-normalize.ts';
import { canonicalPaths } from '../src/lib/routes.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';

test('normalize: lowercase, no accents, single spaces', () => {
  assert.equal(normalize('Matemática'), 'matematica');
  assert.equal(normalize('MATEMATICA'), 'matematica');
  assert.equal(normalize('  matemática  '), 'matematica');
  assert.equal(normalize('Ciências'), 'ciencias');
  assert.equal(normalize('Inglês   e  Espanhol'), 'ingles e espanhol');
  assert.equal(normalize('Redação'), 'redacao');
});

test('matches: every word of the query, in any order; an empty query matches everything', () => {
  assert.ok(matches('matematica para enem kultivi', 'matemática'));
  assert.ok(matches('matematica para enem kultivi', 'enem mat'));
  assert.ok(!matches('matematica para enem kultivi', 'matematica uerj'));
  assert.ok(matches('qualquer coisa', '   '));
});

test('filterEntries returns the visible ids and their count', () => {
  const entries = [{ id: 'a', terms: 'fisica para enem' }, { id: 'b', terms: 'quimica para enem' }];
  assert.deepEqual(filterEntries(entries, 'física'), { visible: ['a'], count: 1 });
  assert.deepEqual(filterEntries(entries, ''), { visible: ['a', 'b'], count: 2 });
  assert.deepEqual(filterEntries(entries, 'biologia'), { visible: [], count: 0 });
});

const index = buildSearchIndex();
const count = (kind: string) => index.filter((e) => e.kind === kind).length;

test('one entry per objective, area, subject, published track and published resource', () => {
  assert.equal(count('objetivo'), 5);
  assert.equal(count('area'), 6);
  assert.equal(count('materia'), 13);
  assert.equal(count('trilha'), 7);
  assert.equal(count('recurso'), publishedResources.length);
  assert.equal(index.length, 5 + 6 + 13 + 7 + publishedResources.length);
});

test('every entry leads to a page of the site, never outside', () => {
  for (const entry of index) {
    const [path] = entry.url.split('#');
    assert.ok(canonicalPaths().includes(path!), `${entry.id}: ${entry.url}`);
  }
});

test('no duplicate entry; the index is deterministic', () => {
  assert.equal(new Set(index.map((e) => e.id)).size, index.length);
  assert.deepEqual(buildSearchIndex(), index);
});

test('terms are normalized and find what a student types', () => {
  for (const entry of index) assert.equal(entry.terms, normalize(entry.terms));
  const find = (q: string) => index.filter((e) => matches(e.terms, q)).map((e) => e.id);
  assert.ok(find('matematica').includes('materia:matematica'));
  assert.ok(find('harvard').includes('recurso:cs50x'));
  assert.ok(find('python').includes('trilha:python'));
});
