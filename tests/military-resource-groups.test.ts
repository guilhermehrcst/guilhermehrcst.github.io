import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MILITARY_MATERIAL_GROUPS, militaryMaterialGroups } from '../src/lib/military-resource-groups.ts';
import { placedOnPath } from '../src/lib/placement.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { MILITARY_L003_CANDIDATES } from '../src/lib/staging-military.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { pt } from '../src/i18n/pt.ts';

test('every learning format belongs to exactly one Pré-Militar section', () => {
  assert.deepEqual(MILITARY_MATERIAL_GROUPS.map(g => g.id), ['cursos', 'exercicios', 'provas', 'apoio']);
  const fixtures = MILITARY_MATERIAL_GROUPS.flatMap(g => g.formats.map(format => ({ id: format, format })));
  const groups = militaryMaterialGroups(fixtures);
  assert.equal(groups.length, 4);
  assert.equal(groups.flatMap(g => g.resources).length, fixtures.length);
  assert.equal(new Set(groups.flatMap(g => g.resources).map(r => r.id)).size, fixtures.length);
  assert.deepEqual(groups.find(g => g.id === 'cursos')?.resources.map(r => r.format), ['course', 'track', 'playlist', 'lessons', 'lesson']);
  assert.deepEqual(groups.find(g => g.id === 'provas')?.resources.map(r => r.format), ['past-exam']);
});

test('only published ITA resource is visible while L003 remains in editorial review', () => {
  const groups = militaryMaterialGroups(placedOnPath('pre-militar'));
  assert.deepEqual(groups.map(g => g.id), ['provas']);
  assert.deepEqual(groups.flatMap(g => g.resources).map(r => r.id), ['ita-provas-anteriores']);
  const pubIds = new Set(publishedResources.map(r => r.id));
  const candidates = [...GATEB_NEW_RESOURCES.filter(r => r.paths.includes('pre-militar')), ...MILITARY_L003_CANDIDATES];
  assert.equal(candidates.length, 20);
  assert.ok(candidates.every(r => !pubIds.has(r.id)));
  assert.equal(pt.preMilitar.materialsTitle, 'Materiais para estudar e praticar');
});

test('grouped view reuses canonical anchors and resource list without duplicate cards', () => {
  const groupFile = readFileSync(new URL('../src/components/ResourceGroups.astro', import.meta.url), 'utf8');
  const pageFile = readFileSync(new URL('../src/components/PathResources.astro', import.meta.url), 'utf8');
  assert.match(groupFile, /militaryMaterialGroups\(resources\)/);
  assert.match(groupFile, /anchorPlan\(page, groups\.map/);
  assert.match(groupFile, /<ResourceList resources=\{group\.resources\}/);
  assert.match(pageFile, /military=\{path === 'pre-militar'\}/);
});
