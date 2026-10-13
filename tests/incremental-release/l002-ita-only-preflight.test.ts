// Isolated, simulation-only rehearsal on the REAL published L001 inventory.
// A pass here NEVER means that a human signed or authorized ITA publication.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import plan from '../../docs/academy/launch/l002-ita-only-plan.json' with { type: 'json' };
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { publishedResources } from '../../src/lib/learning-resources.ts';
import { PATH_STATUS } from '../../src/lib/taxonomy.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../../src/lib/featured.ts';
import { activationProblems } from '../../src/lib/path-status.ts';
import { placementOf, placementProblems } from '../../src/lib/placement.ts';
import { lotDigest } from '../../src/lib/release/engine.ts';
import { entryFor, lotOf, project, record } from './fixtures.ts';

const ID = 'ita-provas-anteriores';
const simulation = lotOf('L002-ita-only-ensaiado', [entryFor(ID)]);
const simulatedPin = { lot: simulation.lot, digest: lotDigest(simulation) };
const hypothetical = {
  ...release,
  mode: 'simulation' as const,
  applied: [...release.applied, simulatedPin],
  ledger: [...release.ledger, simulatedPin],
  inventory: [...release.inventory, ID].sort(),
};
const states = { ...PATH_STATUS, 'pre-militar': 'active' as const };
const run = (r: unknown = hypothetical, lot: unknown = simulation) =>
  project({ lots: [...LOT_MANIFESTS, lot], release: r });

test('ITA-only scope never pre-approves editorial, activation or publication', () => {
  assert.equal(plan.previewOnly, true);
  assert.equal(plan.editorialApproval, 'pending');
  assert.equal(plan.activationApproval, 'pending');
  assert.equal(plan.publicationAuthorization, 'pending');
  assert.deepEqual(plan.activate, ['pre-militar']);
  assert.deepEqual(plan.keepPreparing, ['ensino-fundamental']);
  assert.equal(plan.expectedPublishedBefore, 43);
  assert.equal(plan.expectedPublishedAfter, 44);
  assert.equal(plan.resource.id, ID);
  assert.equal(plan.resource.format, 'past-exam');
  assert.equal(plan.resource.technicalRecommendation, 'eligible-for-human-editorial-decision');
  assert.equal(plan.resource.auditSample.mobileViewport390, 'not-verified');
  assert.equal(plan.resource.auditSample.screenReader, 'not-verified');
  assert.equal(plan.resource.auditSample.questionCount, 48);
  assert.deepEqual(plan.resource.auditSample.cancelledQuestionNumbers, [9, 18]);
  assert.equal(record(ID).registration, 'not-required');
  assert.equal(record(ID).format, 'past-exam');
});

test('no repo state changed: 43 resources and real L001 ledger alone', () => {
  assert.equal(release.mode, 'production');
  assert.equal(release.inventory.length, 43);
  assert.equal(publishedResources.length, 43);
  assert.deepEqual(release.applied.map(lot => lot.lot), ['L001-plano-b']);
  assert.deepEqual(release.ledger.map(lot => lot.lot), ['L001-plano-b']);
  assert.equal(LOT_MANIFESTS.length, 1);
  assert.equal(PATH_STATUS['pre-militar'], 'preparing');
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(FEATURED_RELEASE['pre-militar'], 'staging');
  assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH['pre-militar'], []);
  assert.ok(!publishedResources.some(resource => resource.id === ID));
});

test('SIMULAÇÃO projects 43 to 44 without changing the L001 pin or published records', () => {
  assert.equal(simulation.simulation, true);
  assert.match(simulation.authorization?.by ?? '', /^SIMULAÇÃO/);
  assert.ok(simulation.entries.every(entry => entry.decidedBy.startsWith('SIMULAÇÃO')));
  assert.deepEqual(hypothetical.applied[0], release.applied[0]);
  assert.deepEqual(hypothetical.ledger[0], release.ledger[0]);
  const result = run();
  assert.deepEqual(result.problems, []);
  assert.equal(result.published.length, 44);
  assert.deepEqual(result.published.map(resource => resource.id).sort(), hypothetical.inventory);
  assert.equal(new Set(hypothetical.inventory).size, 44);
  assert.equal(result.states.get(ID), 'published');
  for (const oldId of release.inventory) assert.ok(result.published.some(x => x.id === oldId), oldId);
});

test('SIMULAÇÃO activates only pre-militar when its one official archive is published', () => {
  const result = run();
  assert.deepEqual(result.problems, []);
  const resource = result.published.find(x => x.id === ID);
  if (!resource) throw new Error('simulated ITA resource not found');
  assert.ok(placementProblems(result.published, PATH_STATUS).some(issue => issue.includes(ID)));
  assert.deepEqual(placementProblems(result.published, states), []);
  assert.equal(placementOf(resource, states, result.published)?.page, '/pre-militar/');
  assert.equal(placementOf(resource, states, result.published)?.anchor, `recurso-${ID}`);
  assert.equal(states['ensino-fundamental'], 'preparing');
  assert.deepEqual(activationProblems(states, FEATURED_RESOURCE_IDS_BY_PATH, result.published, FEATURED_RELEASE), []);
});

test('SIMULAÇÃO refuses accidental activation of empty ensino-fundamental', () => {
  const result = run();
  assert.deepEqual(result.problems, []);
  const both = { ...states, 'ensino-fundamental': 'active' as const };
  const problems = activationProblems(both, FEATURED_RESOURCE_IDS_BY_PATH, result.published, FEATURED_RELEASE);
  assert.ok(problems.some(problem => problem.includes('ensino-fundamental: active without a page')), problems.join('\n'));
});

test('SIMULAÇÃO is rejected if accidentally used as a production lot', () => {
  const result = run({ ...hypothetical, mode: 'production' });
  assert.match(result.problems.join('\n'), /a simulated lot in a production release/);
  assert.equal(result.published.length, 0);
});

test('SIMULAÇÃO: a changed ITA record digest cannot pass verification', () => {
  const invalid = {
    ...simulation,
    entries: [{ ...simulation.entries[0]!, digest: 'sha256:' + '0'.repeat(64) }],
  };
  const forged = { lot: invalid.lot, digest: lotDigest(invalid) };
  const r = { ...hypothetical, applied: [...release.applied, forged], ledger: [...release.ledger, forged] };
  assert.match(run(r, invalid).problems.join('\n'), /record changed after its approval/);
});
