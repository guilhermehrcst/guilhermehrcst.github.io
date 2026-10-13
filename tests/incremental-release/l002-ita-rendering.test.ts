// Release-specific invariants that cross the registered lot, path placement, search index
// and student-facing route. No endorsement of main merge or production deployment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../../src/lib/learning-resources.ts';
import { placedOnPath, placementOf } from '../../src/lib/placement.ts';
import { buildSearchIndex, resourceHome } from '../../src/lib/search-index.ts';
import { canonicalPaths, preparingPaths } from '../../src/lib/routes.ts';
import { isPreparing, PATH_STATUS } from '../../src/lib/taxonomy.ts';
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import l002 from '../../src/data/academy-release/lots/L002-ita-pre-militar.json' with { type: 'json' };
import plan from '../../docs/academy/launch/l002-ita-only-plan.json' with { type: 'json' };

test('L002 activates the ITA-only path with a discoverable, internal, anchored search result', () => {
  const id = 'ita-provas-anteriores';
  const r = publishedResources.find(resource => resource.id === id);
  assert.ok(r, 'authorized ITA resource must actually be in the published catalogue');
  assert.equal(r.format, 'past-exam', 'official past papers must not be called a course');
  assert.deepEqual(r.paths, ['pre-militar']);
  assert.equal(r.url, 'https://vestibular.ita.br/provas.htm');
  assert.equal(placementOf(r)?.page, '/pre-militar/');
  assert.deepEqual(placedOnPath('pre-militar').map(resource => resource.id), [id]);
  assert.equal(resourceHome(r), '/pre-militar/');
  const item = buildSearchIndex().find(entry => entry.id === `recurso:${id}`);
  assert.equal(item?.url, '/pre-militar/#recurso-ita-provas-anteriores');
  assert.ok(canonicalPaths().includes('/pre-militar/'));
  assert.ok(!preparingPaths().includes('/pre-militar/'));
  assert.equal(isPreparing('pre-militar'), false);
});

test('isolation: precisely one ITA resource, no Fundamental activation, no highlights or deployment consent', () => {
  assert.equal(plan.activationApproval, 'approved');
  assert.equal(plan.lotApplicationApproval, 'approved');
  assert.equal(plan.lotApplicationScope, 'release-branch-only');
  assert.equal(plan.publicationAuthorization, 'pending');
  assert.equal(plan.previewOnly, false);
  assert.equal(l002.entries.length, 1);
  assert.equal(l002.entries[0]?.id, 'ita-provas-anteriores');
  assert.deepEqual(l002.authorization, { by: 'Guilherme Henrique', on: '2026-10-12' });
  assert.equal(release.inventory.length, 44);
  assert.equal(release.applied.length, 2);
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(PATH_STATUS['pre-militar'], 'active');
  assert.deepEqual(preparingPaths(), ['/ensino-fundamental/']);
  assert.ok(!release.inventory.includes('ef-sme-alfabeto-1'));
  assert.ok(!release.inventory.includes('ef-sme-funcoes-9'));
});
