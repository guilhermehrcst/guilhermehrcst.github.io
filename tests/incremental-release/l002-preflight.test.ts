// Historical three-resource L002 rehearsal, preserved after the independent ITA
// editorial approval. This combined plan remains pending and is NEVER published.
// The real pending ITA manifest belongs to production-state tests; this simulation
// starts from the publicly applied L001 lot and rejects fictional human approvals.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import plan from '../../docs/academy/launch/l002-plan.json' with { type: 'json' };
import actual from '../../src/data/academy-release/release.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { lotDigest } from '../../src/lib/release/engine.ts';
import { publishedResources } from '../../src/lib/learning-resources.ts';
import { PATH_STATUS } from '../../src/lib/taxonomy.ts';
import { placementOf, placementProblems } from '../../src/lib/placement.ts';
import { activationProblems } from '../../src/lib/path-status.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../../src/lib/featured.ts';
import { entryFor, lotOf, project } from './fixtures.ts';

const IDS = ['ef-sme-alfabeto-1', 'ef-sme-funcoes-9', 'ita-provas-anteriores'] as const;
const ACTIVATE = ['ensino-fundamental', 'pre-militar'] as const;
const STATES = { ...PATH_STATUS, 'ensino-fundamental': 'active' as const, 'pre-militar': 'active' as const };
const experiment = lotOf('L002-ativacao-ensaio', IDS.map(id => entryFor(id)));
const pin = { lot: experiment.lot, digest: lotDigest(experiment) };
const hypothetical = {
  ...actual,
  mode: 'simulation' as const,
  applied: [...actual.applied, pin],
  ledger: [...actual.ledger, pin],
  inventory: [...actual.inventory, ...IDS].sort(),
};
// Exclude the genuine pending ITA lot ONLY from this historical three-resource
// simulation: otherwise a fixture attempts to decide the same ITA record twice.
const appliedOnly = LOT_MANIFESTS.filter(lot => actual.applied.some(pin => pin.lot === (lot as { lot: string }).lot));
const simulate = (release: unknown = hypothetical, manifest: unknown = experiment) =>
  project({ lots: [...appliedOnly, manifest], release });

test('combined three-resource L002 is still blocked; the public L001 inventory remains untouched', () => {
  assert.equal(plan.previewOnly, true);
  assert.equal(plan.editorialApproval, 'pending');
  assert.equal(plan.activationApproval, 'pending');
  assert.equal(plan.publicationAuthorization, 'pending');
  assert.deepEqual(plan.resources.map(r => r.id), [...IDS]);
  assert.deepEqual(plan.activate, [...ACTIVATE]);
  assert.equal(plan.expectedPublishedBefore, 43);
  assert.equal(plan.expectedPublishedAfter, 46);
  assert.deepEqual(actual.applied.map(lot => lot.lot), ['L001-plano-b']);
  assert.deepEqual(actual.ledger.map(lot => lot.lot), ['L001-plano-b']);
  assert.equal(actual.inventory.length, 43);
  assert.equal(publishedResources.length, 43);
  assert.deepEqual(LOT_MANIFESTS.map(lot => (lot as { lot: string }).lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  for (const id of IDS) assert.ok(!publishedResources.some(r => r.id === id), id);
  for (const id of ACTIVATE) assert.equal(PATH_STATUS[id], 'preparing', id);
  for (const path of Object.keys(FEATURED_RELEASE)) {
    assert.equal(FEATURED_RELEASE[path as keyof typeof FEATURED_RELEASE], 'staging', path);
    assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH[path as keyof typeof FEATURED_RESOURCE_IDS_BY_PATH], [], path);
  }
});

test('the combined Fundamental plus ITA proposal still has no collective approval or activation', () => {
  assert.equal(plan.reviewReadiness, 'blocked-pending-editorial-recuration');
  assert.equal(plan.reviewRecommendationsOnly, true);
  assert.equal(plan.reviewReport, 'docs/academy/launch/l002-editorial-review-2026-10-12.md');
  assert.deepEqual(plan.resources.map(resource => resource.technicalRecommendation), [
    'recurate-before-human-approval',
    'recurate-before-human-approval',
    'eligible-for-human-editorial-decision',
  ]);
  for (const resource of plan.resources.slice(0, 2)) {
    assert.equal(resource.proposedAlternative?.status, 'not-audited-for-release', resource.id);
    assert.equal(resource.proposedAlternative?.newDigestRequired, true, resource.id);
  }
  assert.equal(plan.editorialApproval, 'pending');
  assert.equal(plan.activationApproval, 'pending');
  assert.equal(plan.publicationAuthorization, 'pending');
});

test('SIMULAÇÃO: L001 remains pinned; a later L002 can project 43 → 46 without touching baseline', () => {
  assert.equal(experiment.simulation, true);
  assert.match(experiment.authorization?.by ?? '', /^SIMULAÇÃO/);
  assert.ok(experiment.entries.every(entry => entry.decidedBy.startsWith('SIMULAÇÃO')));
  assert.deepEqual(hypothetical.applied.slice(0, 1), actual.applied);
  assert.deepEqual(hypothetical.ledger.slice(0, 1), actual.ledger);
  const result = simulate();
  assert.deepEqual(result.problems, []);
  assert.equal(result.published.length, 46);
  const next = result.published.map(r => r.id);
  assert.deepEqual([...next].sort(), hypothetical.inventory);
  assert.ok(actual.inventory.every(id => next.includes(id)), 'all 43 current records remain published');
  for (const id of IDS) assert.equal(result.states.get(id), 'published', id);
});

test('SIMULAÇÃO: the two path activations and three resources must arrive together', () => {
  const result = simulate();
  assert.deepEqual(result.problems, []);
  const pendingGaps = placementProblems(result.published, PATH_STATUS);
  for (const id of IDS) {
    assert.ok(pendingGaps.some(problem => problem.includes(id)), `without activation ${id} must have no destination`);
  }
  assert.deepEqual(placementProblems(result.published, STATES), []);
  const expected = {
    'ef-sme-alfabeto-1': '/ensino-fundamental/',
    'ef-sme-funcoes-9': '/ensino-fundamental/',
    'ita-provas-anteriores': '/pre-militar/',
  } as const;
  for (const [id, page] of Object.entries(expected)) {
    const resource = result.published.find(resource => resource.id === id);
    if (!resource) throw new Error(`missing simulated L002 resource ${id}`);
    assert.equal(placementOf(resource, STATES, result.published)?.page, page);
    assert.equal(placementOf(resource, STATES, result.published)?.anchor, `recurso-${id}`);
  }
  assert.deepEqual(activationProblems(STATES, FEATURED_RESOURCE_IDS_BY_PATH, result.published, FEATURED_RELEASE), []);
});

test('SIMULAÇÃO: neither empty gated path may be activated, even if the other path has lessons', () => {
  const result = simulate();
  assert.deepEqual(result.problems, []);
  const noITA = result.published.filter(resource => resource.id !== 'ita-provas-anteriores');
  assert.match(activationProblems(STATES, FEATURED_RESOURCE_IDS_BY_PATH, noITA, FEATURED_RELEASE).join('\n'), /pre-militar: active without a page/);
  const noFundamental = result.published.filter(resource => !IDS.slice(0, 2).includes(resource.id as typeof IDS[0] | typeof IDS[1]));
  assert.match(activationProblems(STATES, FEATURED_RESOURCE_IDS_BY_PATH, noFundamental, FEATURED_RELEASE).join('\n'), /ensino-fundamental: active without a page/);
});

test('SIMULAÇÃO is refused in any production release, even with a forged applied pin', () => {
  const result = simulate({ ...hypothetical, mode: 'production' });
  assert.match(result.problems.join('\n'), /a simulated lot in a production release/);
  assert.equal(result.published.length, 0);
});

test('SIMULAÇÃO: changing the record digest breaks the hypothetical L002 projection', () => {
  const first = experiment.entries[0]!;
  const changed = { ...experiment, entries: [
    { ...first, digest: 'sha256:' + '0'.repeat(64) },
    ...experiment.entries.slice(1),
  ] };
  const newPin = { lot: changed.lot, digest: lotDigest(changed) };
  const modifiedRelease = {
    ...hypothetical,
    applied: [...actual.applied, newPin],
    ledger: [...actual.ledger, newPin],
  };
  const result = simulate(modifiedRelease, changed);
  assert.match(result.problems.join('\n'), /record changed after its approval/);
});
