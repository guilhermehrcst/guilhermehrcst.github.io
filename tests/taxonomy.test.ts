import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AREA_ORDER, AREAS, OBJECTIVE_ORDER, OBJECTIVES, SUBJECTS, SUBJECT_ORDER, subjectsOf } from '../src/lib/taxonomy.ts';

test('the five objectives keep the Home order', () => {
  assert.deepEqual(OBJECTIVE_ORDER, ['enem', 'uerj', 'ensino-medio', 'vestibulares', 'tecnologia']);
});

test('the six areas keep the Home order', () => {
  assert.deepEqual(AREA_ORDER, ['matematica', 'linguagens', 'natureza', 'humanas', 'idiomas', 'tecnologia']);
});

test('twelve academic subjects plus technology, each in exactly one area', () => {
  assert.deepEqual([...SUBJECT_ORDER].sort(), [
    'biologia', 'espanhol', 'filosofia', 'fisica', 'geografia', 'historia', 'ingles',
    'matematica', 'portugues', 'quimica', 'redacao', 'sociologia', 'tecnologia',
  ]);
  assert.deepEqual(subjectsOf('matematica'), ['matematica']);
  assert.deepEqual(subjectsOf('linguagens'), ['portugues', 'redacao']);
  assert.deepEqual(subjectsOf('natureza'), ['fisica', 'quimica', 'biologia']);
  assert.deepEqual(subjectsOf('humanas'), ['historia', 'geografia', 'filosofia', 'sociologia']);
  assert.deepEqual(subjectsOf('idiomas'), ['ingles', 'espanhol']);
  assert.deepEqual(subjectsOf('tecnologia'), ['tecnologia']);
  const all = AREA_ORDER.flatMap((area) => subjectsOf(area));
  assert.equal(new Set(all).size, SUBJECT_ORDER.length);
});

test('slugs are unique, lowercase and unaccented', () => {
  const slugs = SUBJECT_ORDER.map((id) => SUBJECTS[id].slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.ok(/^[a-z]+(-[a-z]+)*$/.test(slug), slug);
});

test('every objective, area and subject has a human label', () => {
  for (const id of OBJECTIVE_ORDER) assert.ok(OBJECTIVES[id].label.trim().length > 1, id);
  for (const id of AREA_ORDER) assert.ok(AREAS[id].label.trim().length > 1, id);
  for (const id of SUBJECT_ORDER) assert.ok(SUBJECTS[id].label.trim().length > 1, id);
  assert.equal(AREAS.natureza.label, 'Ciências da Natureza');
  assert.equal(SUBJECTS.matematica.label, 'Matemática');
});

test('every topic names its source and none is published in V0.1', () => {
  for (const id of SUBJECT_ORDER) {
    for (const topic of SUBJECTS[id].topics) {
      assert.equal(topic.source, 'inep-matriz-enem', `${id}/${topic.id}`);
      assert.equal(topic.published, false, `${id}/${topic.id}`);
      assert.ok(/^[a-z]+(-[a-z]+)*$/.test(topic.id), topic.id);
    }
  }
});

test('no subject has a learning map until each topic is checked against its source', () => {
  // The Mathematics map is prepared but unpublished: the ENEM reference matrix could not be opened at
  // its official source on 2026-10-11 (docs/superpowers/research/2026-10-11-learning-library-sources.md,
  // "Pexis Academy: re-verification"). Plan T4.3: unverifiable → empty.
  for (const id of SUBJECT_ORDER) assert.deepEqual(SUBJECTS[id].topics, [], id);
});
