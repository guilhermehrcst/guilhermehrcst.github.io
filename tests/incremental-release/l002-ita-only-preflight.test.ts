// The ITA-only L002 is genuinely applied in the isolated branch. These tests pin that fact
// and preserve an independent historical 43-to-44 rehearsal from L001 for rollback reasoning.
// The separate production authorization is recorded, but deployment must still be confirmed by GitHub Actions.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import plan from '../../docs/academy/launch/l002-ita-only-plan.json' with { type: 'json' };
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import l002 from '../../src/data/academy-release/lots/L002-ita-pre-militar.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
import { PATH_STATUS } from '../../src/lib/taxonomy.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../../src/lib/featured.ts';
import { activationProblems } from '../../src/lib/path-status.ts';
import { placementOf, placementProblems } from '../../src/lib/placement.ts';
import { lotDigest } from '../../src/lib/release/engine.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { entryFor, lotOf, project, record } from './fixtures.ts';

const ID = 'ita-provas-anteriores';
const simulation = lotOf('L002-ita-only-ensaiado', [entryFor(ID)]);
// Historical L001-only projection: keep the prior test fixture separate from the actual
// L002-applied branch so the synthetic lot never decides the ITA resource twice.
const historicalRelease = {
  ...release,
  applied: release.applied.filter((pin) => pin.lot === 'L001-plano-b'),
  ledger: release.ledger.filter((pin) => pin.lot === 'L001-plano-b'),
  inventory: release.inventory.filter((id) => id !== ID),
};
const simulatedPin = { lot: simulation.lot, digest: lotDigest(simulation) };
const hypothetical = {
  ...historicalRelease,
  mode: 'simulation' as const,
  applied: [...historicalRelease.applied, simulatedPin],
  ledger: [...historicalRelease.ledger, simulatedPin],
  inventory: [...historicalRelease.inventory, ID].sort(),
};
const states = { ...PATH_STATUS, 'pre-militar': 'active' as const };
// The historical fixture replays L001 plus its simulated L002, never the real L002.
const appliedOnly = LOT_MANIFESTS.filter(lot => historicalRelease.applied.some(pin => pin.lot === (lot as { lot: string }).lot));
const run = (r: unknown = hypothetical, lot: unknown = simulation) =>
  project({ lots: [...appliedOnly, lot], release: r });

test('ITA L002 is authorized for the isolated branch and has a separate production publishing approval', () => {
  assert.equal(plan.previewOnly, false);
  assert.equal(plan.editorialApproval, 'approved');
  assert.equal(plan.editorialApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.editorialApprovedOn, '2026-10-12');
  assert.equal(plan.lot, 'L002-ita-pre-militar');
  assert.equal(plan.editorialManifest, 'src/data/academy-release/lots/L002-ita-pre-militar.json');
  assert.equal(plan.editorialRecordDigest, digestOf(record(ID)));
  assert.equal(plan.activationApproval, 'approved');
  assert.equal(plan.activationApprovalScope, 'release-branch-only');
  assert.equal(plan.activationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.activationApprovedOn, '2026-10-12');
  assert.equal(plan.activationExecution, 'applied-in-release-branch');
  assert.equal(plan.lotApplicationApproval, 'approved');
  assert.equal(plan.lotApplicationScope, 'release-branch-only');
  assert.equal(plan.lotApplicationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.lotApplicationApprovedOn, '2026-10-12');
  assert.equal(plan.publicationAuthorization, 'approved');
  assert.equal(plan.publicationScope, 'main-and-github-pages-l002-ita-only');
  assert.equal(plan.publicationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.publicationApprovedOn, '2026-10-13');
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
  assert.equal(l002.simulation, false);
  assert.equal(l002.lot, 'L002-ita-pre-militar');
  assert.equal(l002.entries.length, 1);
  const entry = l002.entries[0]!;
  assert.equal(entry.id, ID);
  assert.equal(entry.decision, 'approved');
  assert.equal(entry.decidedBy, 'Guilherme Henrique');
  assert.equal(entry.decidedOn, '2026-10-12');
  assert.equal(entry.url, record(ID).url);
  assert.equal(entry.institution, record(ID).provider);
  assert.equal(entry.format, record(ID).format);
  assert.equal(entry.digest, digestOf(record(ID)), 'approved record is locked to exact metadata');
  assert.equal(entry.evidence.on, record(ID).verified?.on);
  assert.equal(entry.evidence.method, record(ID).verified?.by);
  assert.equal(entry.evidence.url, record(ID).verified?.evidence?.url);
  assert.equal(entry.evidence.observed, record(ID).verified?.evidence?.note);
  assert.deepEqual(l002.hosts, [{ host: 'vestibular.ita.br', institution: 'ITA' }]);
  assert.deepEqual(l002.authorization, { by: 'Guilherme Henrique', on: '2026-10-12' });
  assert.equal(plan.appliedManifestDigest, digestOf(l002));
});

test('L002 release branch contains 44 resources, both pinned lots and only Pré-Militar activated', () => {
  assert.equal(release.mode, 'production');
  assert.equal(release.inventory.length, 44);
  assert.equal(publishedResources.length, 44);
  assert.deepEqual(release.applied.map(pin => pin.lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.deepEqual(release.ledger, release.applied, 'both original manifests remain pinned');
  assert.deepEqual(LOT_MANIFESTS.map(lot => (lot as { lot: string }).lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.equal(release.applied[1]?.digest, digestOf(l002));
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(RELEASE.states.get(ID), 'published');
  assert.equal(RELEASE.ifApplied.has(ID), false);
  assert.equal(PATH_STATUS['pre-militar'], 'active');
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(FEATURED_RELEASE['pre-militar'], 'staging');
  assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH['pre-militar'], []);
  assert.ok(publishedResources.some(resource => resource.id === ID && resource.format === 'past-exam'));
  assert.ok(release.inventory.includes(ID));
});

test('historical SIMULAÇÃO from L001 still projects 43 to 44 with exact approved ITA content', () => {
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
  for (const oldId of historicalRelease.inventory) assert.ok(result.published.some(x => x.id === oldId), oldId);
});

test('SIMULAÇÃO activates only pre-militar when its one official archive is published', () => {
  const result = run();
  assert.deepEqual(result.problems, []);
  const resource = result.published.find(x => x.id === ID);
  if (!resource) throw new Error('simulated ITA resource not found');
  assert.ok(placementProblems(result.published, { ...PATH_STATUS, 'pre-militar': 'preparing' }).some(issue => issue.includes(ID)));
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
  const r = { ...hypothetical, applied: [...historicalRelease.applied, forged], ledger: [...historicalRelease.ledger, forged] };
  assert.match(run(r, invalid).problems.join('\n'), /record changed after its approval/);
});
