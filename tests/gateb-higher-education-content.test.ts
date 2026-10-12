import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { publishedResources } from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { HIGHER_EDUCATION_GROUPS, higherEducationGroupsFor, higherEducation, resolveGroups } from '../src/lib/higher-education.ts';
import { superiorCopyFor } from '../src/lib/superior-copy.ts';
import { anchorPlan, resourceHome } from '../src/lib/search-index.ts';
import { placementOf } from '../src/lib/placement.ts';
import { PATH_STATUS } from '../src/lib/taxonomy.ts';
import { pt as t } from '../src/i18n/pt.ts';

const PAGE = '/ensino-superior/';
const future = [...publishedResources, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES];
const newUniversityIds = [
  'mit-1801sc', 'mit-801sc', 'mit-7012',
  'yale-psyc-110', 'yale-econ-252', 'ou-environment-treading-lightly',
];

test('T2 higher education: the existing two-group copy remains unchanged until a new resource is published', () => {
  assert.deepEqual(HIGHER_EDUCATION_GROUPS.map((g) => g.id), ['matematica', 'computacao']);
  const current = superiorCopyFor();
  assert.equal(current.description, t.pages['ensino-superior'].description);
  assert.equal(current.note, t.superior.note);
  assert.equal(current.objective, t.home.objectives.items['ensino-superior']);
  assert.equal(publishedResources.length, 37);
});

test('T2 higher education: page description, note and Home adapt to all actually available fields', () => {
  const projected = higherEducationGroupsFor(future);
  assert.deepEqual(projected.map((g) => g.id), [
    'matematica', 'computacao', 'fisica', 'biologia', 'psicologia', 'economia', 'meio-ambiente',
  ]);
  const copy = superiorCopyFor(projected);
  assert.notEqual(copy.description, t.pages['ensino-superior'].description);
  assert.notEqual(copy.note, t.superior.note);
  assert.notEqual(copy.objective, t.home.objectives.items['ensino-superior']);
  for (const field of projected) assert.ok(copy.note.includes(field.label), field.label);
  assert.ok(copy.description.includes('mais 5 áreas'), copy.description);
  assert.ok(copy.objective.includes('mais 5 áreas'), copy.objective);
  assert.doesNotMatch(copy.note, /Por enquanto, Matemática e Computação/);
  assert.doesNotMatch(copy.description, /somente Matemática e Computação/);
  assert.match(copy.note, /não oferece matrícula ou diploma/);
});

test('T2 higher education: every public resource has an actual first-occurrence anchor on its canonical university page', () => {
  const groups = higherEducation();
  const plan = anchorPlan(PAGE, groups.map((g) => g.resources));
  assert.equal(plan.length, groups.length);
  const anchored = plan.flatMap((ids) => [...ids]);
  assert.equal(new Set(anchored).size, anchored.length);
  const expected = publishedResources
    .filter((r) => placementOf(r)?.page === PAGE)
    .map((r) => r.id).sort();
  assert.deepEqual(anchored.sort(), expected);
  for (const id of anchored) assert.equal(resourceHome(publishedResources.find((r) => r.id === id)!), PAGE);
});

test('T2 higher education: every future university course has an anchor when its group is published', () => {
  const proposed = higherEducationGroupsFor(future);
  const byId = new Map(future.map((r) => [r.id, r]));
  const lists = proposed.map((group) => group.resourceIds.map((id) => {
    const resource = byId.get(id);
    if (!resource) throw new Error(`missing future group resource: ${id}`);
    return resource;
  }));
  const anchors = anchorPlan(PAGE, lists, future);
  const ids = anchors.flatMap((set) => [...set]);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of newUniversityIds) {
    const r = byId.get(id);
    if (!r) throw new Error(`missing university resource: ${id}`);
    assert.equal(resourceHome(r, future), PAGE, id);
    assert.equal(ids.filter((anchor) => anchor === id).length, 1, `${id}: one real anchor`);
  }
  const eligible = future
    .filter((r) => placementOf(r, PATH_STATUS, future)?.page === PAGE)
    .map((r) => r.id).sort();
  assert.deepEqual(ids.sort(), eligible);
});

test('T2 higher education: no staged group is rendered or described before the release', () => {
  assert.deepEqual(higherEducation().map((g) => g.id), ['matematica', 'computacao']);
  assert.ok(!HIGHER_EDUCATION_GROUPS.some((g) => newUniversityIds.some((id) => g.resourceIds.includes(id))));
  const currentText = JSON.stringify(superiorCopyFor());
  assert.doesNotMatch(currentText, /Física|Biologia|Psicologia|Economia|Meio Ambiente/);
  assert.throws(() => resolveGroups([{
    id: 'fisica', label: 'Física', why: 'Não publicado', resourceIds: ['mit-801sc'],
  }]), /unknown or unpublished resource/);
});

test('T2 higher education: university page and Home wire copy and first-occurrence anchors to production groups', () => {
  const page = readFileSync(new URL('../src/pages/ensino-superior/index.astro', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../src/components/ObjectiveList.astro', import.meta.url), 'utf8');
  assert.match(page, /const groups = higherEducation\(\)/);
  assert.match(page, /const copy = superiorCopyFor\(groups\)/);
  assert.match(page, /anchorPlan\(routes\.objective\('ensino-superior'\), groups\.map\(\(group\) => group\.resources\)\)/);
  assert.match(page, /description=\{copy\.description\}/);
  assert.match(page, /\{copy\.note\}/);
  assert.match(page, /anchored=\{anchors\[i\]\}/);
  assert.match(home, /const superior = superiorCopyFor\(\)/);
  assert.match(home, /id === 'ensino-superior' \? superior\.objective : o\.items\[id\]/);
  assert.doesNotMatch(page, /from ['"][^'"]*staging/);
  assert.doesNotMatch(home, /from ['"][^'"]*staging/);
});
