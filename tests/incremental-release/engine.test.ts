// The incremental release engine against the adversarial scenarios of the master prompt (Phase G) and the
// proposal (§6). Separate from tests/release-candidate/, which keeps the full V0.4 contract (74 records,
// 60 highlights) untouched. Every approval here is simulated (fixtures.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { canTransition, EDITORIAL_STATES, EDITORIAL_TRANSITIONS, lotProblems } from '../../src/lib/release/engine.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { catalogue, publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
import { entryFor, inventoryWith, LEGACY_IDS, lotOf, NOW, POOL, project, record, releaseOf, SIMULATED_BY } from './fixtures.ts';

const ids = (p: { published: readonly { id: string }[] }) => p.published.map((r) => r.id);
const problemsOf = (p: { problems: string[] }) => p.problems.join('\n');

test('states: the transitions are the documented ones, and nothing reaches published but an approval', () => {
  assert.deepEqual([...EDITORIAL_STATES], ['candidate', 'verified', 'approved', 'published', 'held', 'suspended']);
  for (const from of EDITORIAL_STATES) {
    for (const to of EDITORIAL_TRANSITIONS[from]) assert.ok(EDITORIAL_STATES.includes(to), `${from} → ${to}`);
    assert.equal(canTransition(from, 'published'), from === 'approved', `${from} → published`);
  }
  assert.equal(canTransition('candidate', 'approved'), false, 'an approval needs a verification');
  assert.equal(canTransition('suspended', 'approved'), false, 'a suspended resource returns through a fresh verification');
  assert.equal(canTransition('held', 'published'), false);
});

test('production today: no lot applied, the 37 of V0.4 exactly, every staged record unpublished', () => {
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(publishedResources.length, 37);
  assert.deepEqual(publishedResources.map((r) => r.id).sort(), [...LEGACY_IDS].sort());
  for (const r of POOL) assert.equal(RELEASE.states.get(r.id), 'candidate', r.id);
  assert.equal(RELEASE.suspended.size, 0);
});

test('1. a resource that is not approved is not published, however complete its record', () => {
  const verifiedOnly = lotOf('L001-tecnologia', [entryFor('google-mlcc', { decision: 'verified' })]);
  const p = project({ lots: [verifiedOnly], release: releaseOf([verifiedOnly], inventoryWith([])) });
  assert.deepEqual(p.problems, []);
  assert.ok(!ids(p).includes('google-mlcc'));
  assert.equal(p.states.get('google-mlcc'), 'verified');

  const approvedNotApplied = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const q = project({ lots: [approvedNotApplied], release: releaseOf([], inventoryWith([])) });
  assert.deepEqual(q.problems, []);
  assert.ok(!ids(q).includes('google-mlcc'), 'an approval publishes nothing until its lot is applied');
  assert.equal(q.states.get('google-mlcc'), 'candidate');
  assert.equal(q.pending.get('google-mlcc'), 'approved');

  const unauthorized = lotOf('L001-tecnologia', [entryFor('google-mlcc')], { authorization: null });
  const r = project({ lots: [unauthorized], release: releaseOf([unauthorized], inventoryWith(['google-mlcc'])) });
  assert.match(problemsOf(r), /applied without an authorization to publish/);
  assert.deepEqual(ids(r), []);

  const approved = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const s = project({ lots: [approved], release: releaseOf([approved], inventoryWith(['google-mlcc'])) });
  assert.deepEqual(s.problems, []);
  assert.deepEqual(ids(s), [...LEGACY_IDS.filter((id) => ids(s).includes(id)), 'google-mlcc']);
  assert.equal(s.states.get('google-mlcc'), 'published');
});

test('2. the same id approved for one URL and typed with another is refused', () => {
  const lot = lotOf('L001-tecnologia', [entryFor('google-mlcc', { url: 'https://developers.google.com/machine-learning/' })]);
  const p = project({ lots: [lot], release: releaseOf([lot], inventoryWith(['google-mlcc'])) });
  assert.match(problemsOf(p), /google-mlcc: approved for https:\/\/developers\.google\.com\/machine-learning\/, the record points to/);
});

test('3. any metadata changed after the approval is refused, the URL unchanged', () => {
  const original = record('google-mlcc');
  const lot = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  for (const changed of [
    { ...original, title: `${original.title} (novo)` },
    { ...original, certificate: 'available' as const },
    { ...original, registration: 'required' as const },
    { ...original, paths: ['tecnologia', 'ensino-superior'] as const },
    { ...original, verified: { ...original.verified!, on: '2026-10-12' } },
  ]) {
    const pool = POOL.map((r) => (r.id === 'google-mlcc' ? changed : r));
    const p = project({ pool, lots: [lot], release: releaseOf([lot], inventoryWith(['google-mlcc'])) });
    assert.match(problemsOf(p), /google-mlcc: the record changed after its approval/, JSON.stringify(changed).slice(0, 60));
  }
  // A V0.4 record is locked the same way, by the baseline digest.
  const legacy = record('cs50x');
  const catalogueChanged = catalogue.map((r) => (r.id === 'cs50x' ? { ...legacy, title: 'CS50x (renomeado)' } : r));
  const q = project({ catalogue: catalogueChanged, lots: [], release: releaseOf([], inventoryWith([])) });
  assert.match(problemsOf(q), /cs50x: changed since it was published/);
});

test('4. an unknown certificate is never turned into a claim: the approval binds it as unconfirmed', () => {
  const unknown = POOL.filter((r) => r.certificate === 'unconfirmed');
  assert.ok(unknown.length > 0, 'the pool has records whose certificate is unknown');
  const r = unknown[0]!;
  const lot = lotOf('L001-certificado', [entryFor(r.id)]);
  const p = project({ lots: [lot], release: releaseOf([lot], inventoryWith([r.id])) });
  assert.deepEqual(p.problems, []);
  assert.equal(p.published.find((x) => x.id === r.id)?.certificate, 'unconfirmed');
  const invented = POOL.map((x) => (x.id === r.id ? { ...x, certificate: 'available' as const } : x));
  assert.match(problemsOf(project({ pool: invented, lots: [lot], release: releaseOf([lot], inventoryWith([r.id])) })), /changed after its approval/);
});

test('5. duplicates are refused: an id decided twice, a URL published twice, a lot or record twice; a V0.4 id is re-approved only on its own evidence', () => {
  const twice = lotOf('L001-dup', [entryFor('google-mlcc'), entryFor('google-mlcc')]);
  assert.match(problemsOf(project({ lots: [twice], release: releaseOf([twice], inventoryWith(['google-mlcc'])) })), /google-mlcc is decided twice/);

  const cs50xEntry = { ...entryFor('google-mlcc'), id: 'cs50x', url: record('cs50x').url!, digest: digestOf(record('cs50x')), institution: record('cs50x').provider, format: record('cs50x').format };
  const legacyAgain = lotOf('L001-dup', [cs50xEntry]);
  assert.match(problemsOf(project({ lots: [legacyAgain], release: releaseOf([legacyAgain], inventoryWith([])) })), /cs50x: approved evidence at .*the record's is at undefined/);

  const cs50x = record('cs50x');
  const clone = { ...record('google-mlcc'), url: cs50x.url };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? clone : r));
  const sameUrl = lotOf('L001-dup', [entryFor('google-mlcc', { url: cs50x.url!, digest: digestOf(clone) })], { hosts: [{ host: 'cs50.harvard.edu', institution: clone.provider }] });
  assert.match(problemsOf(project({ pool, lots: [sameUrl], release: releaseOf([sameUrl], inventoryWith(['google-mlcc'])) })), /same URL as cs50x/);

  const lot = lotOf('L001-dup', [entryFor('google-mlcc')]);
  const release = releaseOf([lot, lot], inventoryWith(['google-mlcc']));
  assert.match(problemsOf(project({ lots: [lot], release })), /applied twice/);
  assert.match(problemsOf(project({ lots: [lot, lot], release: releaseOf([lot], inventoryWith(['google-mlcc'])) })), /two manifests with this name/);
  const dupRecord = [...POOL, record('google-mlcc')];
  assert.match(problemsOf(project({ pool: dupRecord, lots: [], release: releaseOf([], inventoryWith([])) })), /google-mlcc: two records with this id/);
});

test('6. a host the lot did not review is refused, and so are http, credentials, ports and unknown ids', () => {
  const noHost = lotOf('L001-hosts', [entryFor('google-mlcc')], { hosts: [] });
  assert.match(problemsOf(project({ lots: [noHost], release: releaseOf([noHost], inventoryWith(['google-mlcc'])) })), /developers\.google\.com is not a host this lot reviewed/);
  const wrongInstitution = lotOf('L001-hosts', [entryFor('google-mlcc')], { hosts: [{ host: 'developers.google.com', institution: 'Outra instituição' }] });
  assert.match(problemsOf(project({ lots: [wrongInstitution], release: releaseOf([wrongInstitution], inventoryWith(['google-mlcc'])) })), /not a host this lot reviewed/);

  for (const url of ['http://developers.google.com/machine-learning/crash-course', 'https://user:pw@developers.google.com/x', 'https://developers.google.com:8443/x']) {
    assert.ok(lotProblems(lotOf('L001-hosts', [entryFor('google-mlcc', { url })]), NOW).length > 0, url);
  }
  const unknown = lotOf('L001-hosts', [{ ...entryFor('google-mlcc'), id: 'curso-inventado' }]);
  assert.match(problemsOf(project({ lots: [unknown], release: releaseOf([unknown], inventoryWith([])) })), /curso-inventado is not a known record/);
});

test('6b. the manifest schema is closed and the evidence must be sufficient', () => {
  const good = lotOf('L001-schema', [entryFor('google-mlcc')]);
  assert.deepEqual(lotProblems(good, NOW), []);
  const bad = (over: Record<string, unknown>, entryOver: Record<string, unknown> = {}) =>
    lotProblems({ ...good, ...over, entries: [{ ...good.entries[0], ...entryOver }] }, NOW).join('\n');
  assert.match(bad({ extra: 1 }), /unknown key extra/);
  assert.match(bad({}, { comment: 'x' }), /unknown key comment/);
  assert.match(bad({}, { digest: 'md5:abc' }), /digest must be sha256/);
  assert.match(bad({}, { evidence: { ...good.entries[0]!.evidence, observed: 'ok' } }), /must say what was observed/);
  assert.match(bad({}, { evidence: { ...good.entries[0]!.evidence, method: 'search-index' } }), /not a direct verification/);
  assert.match(bad({}, { evidence: { ...good.entries[0]!.evidence, version: '' } }), /without a version/);
  assert.match(bad({}, { decidedOn: '2026-10-10' }), /decided before its evidence/);
  assert.match(bad({}, { decidedOn: '2099-01-01' }), /in the future/);
  assert.match(bad({}, { decision: 'held' }), /held without a reason/);
  assert.match(bad({}, { decision: 'published' }), /is not a decision/);
  assert.match(bad({ authorization: { by: SIMULATED_BY, on: '2026-10-11' } }), /authorized before its own decisions/);
  // A real lot names people, never a tool; a simulated lot must say it is one.
  const real = { ...good, simulation: false, authorization: { by: 'Responsável editorial', on: '2026-10-12' } };
  assert.match(lotProblems({ ...real, entries: [{ ...good.entries[0], decidedBy: 'Responsável editorial' }] }, NOW).join('\n'), /^$/);
  assert.match(lotProblems({ ...real, entries: [{ ...good.entries[0], decidedBy: 'Claude (inferência)' }] }, NOW).join('\n'), /not a person; an approval is never automated/);
  assert.match(lotProblems({ ...real, entries: [{ ...good.entries[0], decidedBy: 'Responsável editorial' }], authorization: { by: 'Codex', on: '2026-10-12' } }, NOW).join('\n'), /not a person/);
  assert.match(lotProblems({ ...real, entries: [{ ...good.entries[0] }] }, NOW).join('\n'), /a simulated decision in a real lot/);
  assert.match(lotProblems({ ...good, entries: [{ ...good.entries[0], decidedBy: 'Fulano' }] }, NOW).join('\n'), /a simulated lot must say so/);
});

test('6c. a simulated lot never enters a production release', () => {
  const lot = lotOf('L001-sim', [entryFor('google-mlcc')]);
  const p = project({ lots: [lot], release: releaseOf([lot], inventoryWith(['google-mlcc']), { mode: 'production' }) });
  assert.match(problemsOf(p), /a simulated lot in a production release/);
  assert.deepEqual(ids(p), []);
});

test('7. a second lot keeps the first: the projection is cumulative, never rebuilt from the 37', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc'), entryFor('odin-foundations')]);
  const b = lotOf('L002-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  const first = project({ lots: [a], release: releaseOf([a], inventoryWith(['google-mlcc', 'odin-foundations'])) });
  const both = project({ lots: [a, b], release: releaseOf([a, b], inventoryWith(['google-mlcc', 'odin-foundations', 'ef-obmep-fracoes-6'])) });
  assert.deepEqual(first.problems, []);
  assert.deepEqual(both.problems, []);
  for (const id of ids(first)) assert.ok(ids(both).includes(id), `${id} disappeared with the second lot`);
  assert.equal(both.published.length, 40);
  assert.deepEqual(ids(both).slice(-3), ['google-mlcc', 'odin-foundations', 'ef-obmep-fracoes-6']);

  // Dropping lot A from the release, or forgetting to declare its ids, is an inventory regression.
  const dropped = project({ lots: [a, b], release: releaseOf([b], inventoryWith(['google-mlcc', 'odin-foundations', 'ef-obmep-fracoes-6'])) });
  assert.match(problemsOf(dropped), /inventory: google-mlcc is declared but not published/);
  const undeclared = project({ lots: [a, b], release: releaseOf([a, b], inventoryWith(['ef-obmep-fracoes-6'])) });
  assert.match(problemsOf(undeclared), /inventory: google-mlcc is published but not declared/);
  // Editing lot A after it was applied breaks its pin.
  const edited = { ...a, title: 'Lote A reescrito' };
  const rewritten = project({ lots: [edited, b], release: releaseOf([a, b], inventoryWith(['google-mlcc', 'odin-foundations', 'ef-obmep-fracoes-6'])) });
  assert.match(problemsOf(rewritten), /L001-tecnologia: changed after it was applied/);
  // Lots apply in order.
  assert.match(problemsOf(project({ lots: [a, b], release: releaseOf([b, a], inventoryWith(['google-mlcc', 'odin-foundations', 'ef-obmep-fracoes-6'])) })), /applied lots must be in lot order/);
});

test('8. a suspended resource leaves the projection, a V0.4 one included, and returns only by a fresh decision', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-suspensao', [], { suspensions: [
    { id: 'google-mlcc', reason: 'Página oficial mudou de conteúdo (simulado)', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' },
    { id: 'cs50x', reason: 'Suspensão simulada de um recurso da V0.4', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' },
  ] });
  const p = project({ lots: [a, b], release: releaseOf([a, b], inventoryWith([], ['cs50x'])) });
  assert.deepEqual(p.problems, []);
  assert.ok(!ids(p).includes('google-mlcc'));
  assert.ok(!ids(p).includes('cs50x'));
  assert.equal(p.states.get('cs50x'), 'suspended');
  assert.equal(p.suspended.get('google-mlcc'), 'L002-suspensao');
  assert.equal(p.published.length, 36);
  assert.ok(![...p.hosts].includes('developers.google.com'), 'its host goes with it');
  // Declaring a suspended id is an inventory error, and it says why.
  assert.match(problemsOf(project({ lots: [a, b], release: releaseOf([a, b], inventoryWith(['google-mlcc'])) })), /google-mlcc is declared but not published \(suspended by L002-suspensao\)/);
  // Suspending what is not published, or approving a suspended record without a new verification, is refused.
  const c = lotOf('L001-suspensao', [], { suspensions: [{ id: 'odin-foundations', reason: 'Simulação', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  assert.match(problemsOf(project({ lots: [c], release: releaseOf([c], inventoryWith([])) })), /odin-foundations cannot go from candidate to suspended/);
  const back = lotOf('L003-retorno', [entryFor('google-mlcc')]);
  const q = project({ lots: [a, b, back], release: releaseOf([a, b, back], inventoryWith(['google-mlcc'], ['cs50x'])) });
  assert.deepEqual(q.problems, [], 'a new approval (with its own evidence) brings it back');
  assert.ok(ids(q).includes('google-mlcc'));
});

test('14. the repository release applies nothing and the staging records stay where they were', () => {
  assert.equal(RELEASE.published.length, 37);
  for (const r of POOL) assert.ok(!RELEASE.published.some((p) => p.id === r.id), r.id);
});

test('15. rollback: removing the last lot from the release restores the earlier projection exactly', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  const before = project({ lots: [a, b], release: releaseOf([a], inventoryWith(['google-mlcc'])) });
  const after = project({ lots: [a, b], release: releaseOf([a, b], inventoryWith(['google-mlcc', 'ef-obmep-fracoes-6'])) });
  const rolledBack = project({ lots: [a, b], release: releaseOf([a], inventoryWith(['google-mlcc'])) });
  assert.deepEqual(after.problems, []);
  assert.deepEqual(rolledBack.problems, []);
  assert.deepEqual(ids(rolledBack), ids(before));
  assert.deepEqual(rolledBack.published, before.published);
  assert.equal(rolledBack.pending.get('ef-obmep-fracoes-6'), 'approved', 'the decision stays recorded, unpublished');
  const nothing = project({ lots: [a, b], release: releaseOf([], inventoryWith([])) });
  assert.deepEqual(ids(nothing), ids(project({ lots: [], release: releaseOf([], inventoryWith([])) })));
  assert.deepEqual(ids(nothing), publishedResources.map((r) => r.id));
});
