// The incremental release engine against the adversarial scenarios of the master prompt (Phase G) and the
// proposal (§6). Separate from tests/release-candidate/, which keeps the full V0.4 contract (74 records,
// 60 highlights) untouched. Every approval here is simulated (fixtures.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { canTransition, EDITORIAL_STATES, EDITORIAL_TRANSITIONS, lotProblems } from '../../src/lib/release/engine.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { catalogue, isPublishedResource, publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
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
  assert.equal(q.ifApplied.get('google-mlcc'), 'published', 'only if its lot is applied');

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
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc', { decidedOn: '2026-10-11' })]);
  const b = lotOf('L002-suspensao', [], { suspensions: [
    { id: 'google-mlcc', reason: 'Página oficial mudou de conteúdo (simulado)', decidedBy: SIMULATED_BY, decidedOn: '2026-10-11' },
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
  const stale = lotOf('L003-retorno', [entryFor('google-mlcc')]);
  assert.match(problemsOf(project({ lots: [a, b, stale], release: releaseOf([a, b, stale], inventoryWith(['google-mlcc'], ['cs50x'])) })), /returns on evidence of 2026-10-11, not after the decision/);
  const g = record('google-mlcc');
  const fresh = { ...g, verified: { ...g.verified!, on: '2026-10-12' } };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? fresh : r));
  const back = lotOf('L003-retorno', [entryFor('google-mlcc', { digest: digestOf(fresh), evidence: { ...entryFor('google-mlcc').evidence, on: '2026-10-12' } })]);
  const q = project({ pool, lots: [a, b, back], release: releaseOf([a, b, back], inventoryWith(['google-mlcc'], ['cs50x'])) });
  assert.deepEqual(q.problems, [], 'a new approval on a fresh verification brings it back');
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
  // B was applied, then rolled back: it leaves `applied`, keeps its ledger pin.
  const rolledBack = project({ lots: [a, b], release: releaseOf([a], inventoryWith(['google-mlcc']), { ledger: releaseOf([a, b], []).ledger }) });
  assert.deepEqual(after.problems, []);
  assert.deepEqual(rolledBack.problems, []);
  assert.deepEqual(ids(rolledBack), ids(before));
  assert.deepEqual(rolledBack.published, before.published);
  assert.equal(rolledBack.ifApplied.get('ef-obmep-fracoes-6'), undefined, 'the decision stays recorded and pinned, never replayed');
  assert.equal(rolledBack.states.get('ef-obmep-fracoes-6'), 'candidate');
  const nothing = project({ lots: [a, b], release: releaseOf([], inventoryWith([])) });
  assert.deepEqual(ids(nothing), ids(project({ lots: [], release: releaseOf([], inventoryWith([])) })));
  assert.deepEqual(ids(nothing), catalogue.filter(isPublishedResource).map((r) => r.id), 'no lot: the V0.4 catalogue, in its order');
});

test('a recorded lot older than an applied one can never be applied in order, and says so', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  assert.match(problemsOf(project({ lots: [a, b], release: releaseOf([b], inventoryWith(['ef-obmep-fracoes-6'])) })), /L001-tecnologia: recorded after L002-fundamental was applied/);
});


// Codex review on PR #43 -------------------------------------------------------------------------------

test('a V0.4 host trusts only its own institution: another provider on it needs the lot to review it', () => {
  const g = record('google-mlcc');
  const url = 'https://cs50.harvard.edu/outra-pagina/';
  const forged = { ...g, url, verified: { ...g.verified!, evidence: { ...g.verified!.evidence!, url } } };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? forged : r));
  const lot = lotOf('L001-host', [entryFor('google-mlcc', { url, digest: digestOf(forged), evidence: { ...entryFor('google-mlcc').evidence, url } })], { hosts: [] });
  assert.match(problemsOf(project({ pool, lots: [lot], release: releaseOf([lot], inventoryWith(['google-mlcc'])) })),
    /cs50\.harvard\.edu is not a host this lot reviewed for Google/);
  // The same institution on its V0.4 host needs no new review.
  const mit = lotOf('L001-host', [entryFor('mit-1801sc')], { hosts: [] });
  assert.deepEqual(project({ lots: [mit], release: releaseOf([mit], inventoryWith(['mit-1801sc'])) }).problems, []);
});

test('the approved evidence is the record\'s evidence: what was observed must match its note', () => {
  const lot = lotOf('L001-evidencia', [entryFor('google-mlcc', { evidence: { ...entryFor('google-mlcc').evidence, observed: 'Outra observação qualquer, sem relação com o registro.' } })]);
  assert.match(problemsOf(project({ lots: [lot], release: releaseOf([lot], inventoryWith(['google-mlcc'])) })), /google-mlcc: the approved observation is not the record's evidence note/);
});

test('a recorded approval that does not match its record fails the build before it is applied', () => {
  const lot = lotOf('L001-pendente', [entryFor('google-mlcc', { digest: `sha256:${'0'.repeat(64)}`, url: 'https://developers.google.com/outra/' })]);
  const p = project({ lots: [lot], release: releaseOf([], inventoryWith([])) });
  assert.match(problemsOf(p), /L001-pendente google-mlcc: approved for https:\/\/developers\.google\.com\/outra\//);
  assert.match(problemsOf(p), /L001-pendente google-mlcc: the record changed after its approval/);
  assert.ok(!ids(p).includes('google-mlcc'), 'still not published');
});

test('a suspension is a person\'s decision: a tool named as its author is refused (Codex review)', () => {
  const real = (decidedBy: string) => lotProblems({ ...lotOf('L001-suspensao', []), simulation: false, authorization: null,
    suspensions: [{ id: 'cs50x', reason: 'Página oficial fora do ar', decidedBy, decidedOn: '2026-10-12' }] }, NOW).join('\n');
  assert.match(real('Codex'), /not a person/);
  assert.match(real('Claude'), /not a person/);
  assert.doesNotMatch(real('Responsável editorial'), /not a person/);
});

test('a changed V0.4 record does not vouch for its own new host (Codex review)', () => {
  const old = record('cs50x');
  const url = 'https://unreviewed.example/course';
  const changed = { ...old, url, provider: 'Unreviewed Provider', verified: { on: '2026-10-12', by: 'official-page' as const, freeAccess: true as const,
    evidence: { url, checked: ['free', 'scope', 'language', 'format', 'path', 'registration', 'certificate'] as const, note: 'Observação simulada da página nova.' } }, registration: 'not-required' as const, certificate: 'none' as const };
  const cat = catalogue.map((r) => (r.id === 'cs50x' ? changed : r));
  const entry = { ...entryFor('google-mlcc'), id: 'cs50x', url, digest: digestOf(changed), institution: 'Unreviewed Provider', format: changed.format,
    evidence: { on: '2026-10-12', version: 'fixture', method: 'official-page', url, observed: 'Observação simulada da página nova.' } };
  const lot = lotOf('L001-reaprovacao', [entry], { hosts: [] });
  assert.match(problemsOf(project({ catalogue: cat, lots: [lot], release: releaseOf([lot], inventoryWith([])) })),
    /unreviewed\.example is not a host this lot reviewed for Unreviewed Provider/);
});

test('a held or suspended resource returns only on evidence dated strictly after that decision (Codex review)', () => {
  const g = record('google-mlcc');
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc', { decidedOn: '2026-10-11' })]);
  const b = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Página mudou', decidedBy: SIMULATED_BY, decidedOn: '2026-10-11' }] });
  // Same record, same (older) evidence: refused.
  const stale = lotOf('L003-retorno', [entryFor('google-mlcc')]);
  const old = project({ lots: [a, b, stale], release: releaseOf([a, b, stale], inventoryWith(['google-mlcc'])) });
  assert.match(problemsOf(old), /L003-retorno: google-mlcc returns on evidence of 2026-10-11, not after the decision of 2026-10-11 that took it out/);
  // A fresh verification (the record now carries evidence dated after the suspension): accepted.
  const fresh = { ...g, verified: { ...g.verified!, on: '2026-10-12' } };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? fresh : r));
  const back = lotOf('L003-retorno', [entryFor('google-mlcc', { digest: digestOf(fresh), evidence: { ...entryFor('google-mlcc').evidence, on: '2026-10-12' } })]);
  // a and b were approved against the old record: a re-approval history is checked only for the lots that publish it.
  const q = project({ pool, lots: [a, b, back], release: releaseOf([a, b, back], inventoryWith(['google-mlcc'])) });
  assert.doesNotMatch(problemsOf(q), /returns on evidence/);
  // Held, then approved on the same old evidence: refused too.
  const held = lotOf('L001-retido', [entryFor('google-mlcc', { decision: 'held', reason: 'Pendência', decidedOn: '2026-10-12' })]);
  const again = lotOf('L002-aprovado', [entryFor('google-mlcc')]);
  assert.match(problemsOf(project({ lots: [held, again], release: releaseOf([held, again], inventoryWith(['google-mlcc'])) })), /returns on evidence of 2026-10-11, not after the decision of 2026-10-12/);
});


// Codex review, round 3 ---------------------------------------------------------------------------------

test('a verified entry does not clear a suspension: only a checked approval on fresh evidence does', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Página mudou', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  // Claims a fresh date but binds nothing to the record; then the old record is approved again.
  const fake = lotOf('L003-verificado', [entryFor('google-mlcc', { decision: 'verified', digest: `sha256:${'1'.repeat(64)}`, evidence: { ...entryFor('google-mlcc').evidence, on: '2026-10-12' } })]);
  const again = lotOf('L004-retorno', [entryFor('google-mlcc')]);
  const p = project({ lots: [a, b, fake, again], release: releaseOf([a, b, fake, again], inventoryWith(['google-mlcc'])) });
  assert.match(problemsOf(p), /L004-retorno: google-mlcc returns on evidence of 2026-10-11, not after the decision of 2026-10-12/);
});

test('verified and held decisions are a person\'s too: a tool named as author is refused', () => {
  for (const decision of ['verified', 'held'] as const) {
    const lot = { ...lotOf('L001-pessoa', [entryFor('google-mlcc', { decision, reason: 'Pendência', decidedBy: 'Codex' })]), simulation: false, authorization: null };
    assert.match(lotProblems(lot, NOW).join('\n'), /Codex is not a person/, decision);
  }
});

test('a rolled-back lot keeps its pin: the ledger of every lot ever applied is append-only and checked', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  const ledger = releaseOf([a, b], []).applied;
  // Rolled back: B leaves `applied`, stays in the ledger.
  const rolledBack = releaseOf([a], inventoryWith(['google-mlcc']), { ledger });
  assert.deepEqual(project({ lots: [a, b], release: rolledBack }).problems, []);
  // Editing or deleting B afterwards breaks the ledger.
  const edited = { ...b, title: 'Lote B reescrito' };
  assert.match(problemsOf(project({ lots: [a, edited], release: rolledBack })), /L002-fundamental: changed after it was applied/);
  assert.match(problemsOf(project({ lots: [a], release: rolledBack })), /L002-fundamental is in the ledger but has no manifest/);
  // Every applied lot is in the ledger, with the same digest.
  assert.match(problemsOf(project({ lots: [a, b], release: releaseOf([a, b], inventoryWith(['google-mlcc', 'ef-obmep-fracoes-6']), { ledger: ledger.slice(0, 1) }) })), /L002-fundamental is applied but not in the ledger/);
});

test('a rolled-back lot stays preserved and out of the way: later lots apply normally (Codex review, round 4)', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  const c = lotOf('L003-tecnologia', [entryFor('odin-foundations')]);
  const ledger = releaseOf([a, b, c], []).ledger;
  const p = project({ lots: [a, b, c], release: releaseOf([a, c], inventoryWith(['google-mlcc', 'odin-foundations']), { ledger }) });
  assert.deepEqual(p.problems, []);
  assert.ok(!p.published.some((r) => r.id === 'ef-obmep-fracoes-6'), 'the rolled-back decision is not published');
  assert.equal(p.ifApplied.get('ef-obmep-fracoes-6'), undefined, 'nor replayed as pending');
  // Still pinned: editing it fails.
  assert.match(problemsOf(project({ lots: [a, { ...b, title: 'x' }, c], release: releaseOf([a, c], inventoryWith(['google-mlcc', 'odin-foundations']), { ledger }) })), /L002-fundamental: changed after it was applied/);
});

// Codex review, round 5 ---------------------------------------------------------------------------------

test('a verified decision is bound to its record like an approval while it is the latest decision', () => {
  const fake = lotOf('L001-verificado', [entryFor('google-mlcc', { decision: 'verified', digest: `sha256:${'0'.repeat(64)}`, evidence: { ...entryFor('google-mlcc').evidence, url: 'https://example.com/' } })]);
  for (const release of [releaseOf([fake], inventoryWith([])), releaseOf([], inventoryWith([]))]) {
    const found = problemsOf(project({ lots: [fake], release }));
    assert.match(found, /L001-verificado google-mlcc: the record changed after its approval/);
    assert.match(found, /approved evidence at https:\/\/example\.com\//);
  }
  // A true verification passes; a later approval of a newer record supersedes it.
  const real = lotOf('L001-verificado', [entryFor('google-mlcc', { decision: 'verified' })]);
  assert.deepEqual(project({ lots: [real], release: releaseOf([real], inventoryWith([])) }).problems, []);
});

test('a simulated manifest is refused in a production release even when it is not applied', () => {
  const lot = lotOf('L001-ensaio', [entryFor('google-mlcc')]);
  const p = project({ lots: [lot], release: releaseOf([], inventoryWith([]), { mode: 'production' }) });
  assert.match(problemsOf(p), /L001-ensaio: a simulated lot in a production release/);
  assert.equal(p.ifApplied.get('google-mlcc'), undefined);
});

// Codex review, round 6 ---------------------------------------------------------------------------------

test('a backdated hold never moves the take-out date earlier than a suspension', () => {
  const g = record('google-mlcc');
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Página mudou', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  const v = lotOf('L003-verificado', [entryFor('google-mlcc', { decision: 'verified', decidedOn: '2026-10-12' })]);
  const hold = lotOf('L004-retido', [entryFor('google-mlcc', { decision: 'held', reason: 'Retido', decidedOn: '2026-10-11' })]);
  const again = lotOf('L005-retorno', [entryFor('google-mlcc')]);
  const all = [a, b, v, hold, again];
  assert.match(problemsOf(project({ lots: all, release: releaseOf(all, inventoryWith(['google-mlcc'])) })), /L005-retorno: google-mlcc returns on evidence of 2026-10-11, not after the decision of 2026-10-12/);
  void g;
});

test('a new lot must sort after every ledgered lot, rolled back or not', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const c = lotOf('L003-fundamental', [entryFor('ef-obmep-fracoes-6')]);
  const b = lotOf('L002-tarde', [entryFor('odin-foundations')]);
  const release = releaseOf([a], inventoryWith(['google-mlcc']), { ledger: releaseOf([a, c], []).ledger });
  assert.match(problemsOf(project({ lots: [a, b, c], release })), /L002-tarde: recorded after L003-fundamental was applied/);
});

test('a recorded approval may not reuse a published or another recorded URL', () => {
  const cs50x = record('cs50x');
  const clone = { ...record('google-mlcc'), url: cs50x.url };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? clone : r));
  const lot = lotOf('L001-dup', [entryFor('google-mlcc', { url: cs50x.url!, digest: digestOf(clone) })], { hosts: [{ host: 'cs50.harvard.edu', institution: clone.provider }] });
  assert.match(problemsOf(project({ pool, lots: [lot], release: releaseOf([], inventoryWith([])) })), /google-mlcc: same URL as cs50x/);
});

// Codex review, round 7 ---------------------------------------------------------------------------------

test('the take-out date stays a lower bound for every later evidence, after a fresh return too', () => {
  const g = record('google-mlcc');
  const fresh = { ...g, verified: { ...g.verified!, on: '2026-10-12' } };
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const b = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Página mudou', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  const back = lotOf('L003-retorno', [entryFor('google-mlcc', { digest: digestOf(fresh), evidence: { ...entryFor('google-mlcc').evidence, on: '2026-10-12' } })]);
  const stale = lotOf('L004-reaprovacao', [entryFor('google-mlcc')]);
  const all = [a, b, back, stale];
  assert.match(problemsOf(project({ lots: all, release: releaseOf(all, inventoryWith(['google-mlcc'])) })), /L004-reaprovacao: google-mlcc returns on evidence of 2026-10-11, not after the decision of 2026-10-12/);
});

test('a lot is never authorized before it was created', () => {
  const lot = lotOf('L001-datas', [], { createdOn: '2026-10-12', authorization: { by: SIMULATED_BY, on: '2026-10-11' },
    suspensions: [{ id: 'cs50x', reason: 'Teste', decidedBy: SIMULATED_BY, decidedOn: '2026-10-10' }] });
  assert.match(lotProblems(lot, NOW).join('\n'), /L001-datas: authorized before it was created/);
});

// Codex review, round 8 ---------------------------------------------------------------------------------

test('a resource\'s decisions never go back in time: a backdated suspension or hold is refused', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc', { decidedOn: '2026-10-12' })]);
  const b = lotOf('L002-suspensao', [], { createdOn: '2026-10-12', suspensions: [{ id: 'google-mlcc', reason: 'Retroativa', decidedBy: SIMULATED_BY, decidedOn: '2026-10-01' }] });
  const c = lotOf('L003-retorno', [entryFor('google-mlcc')]);
  const all = [a, b, c];
  assert.match(problemsOf(project({ lots: all, release: releaseOf(all, inventoryWith(['google-mlcc'])) })), /L002-suspensao: google-mlcc decided on 2026-10-01, before its previous decision of 2026-10-12/);
});

test('a standing held decision is bound to its record too (not to publishability)', () => {
  const fake = lotOf('L001-retido', [entryFor('google-mlcc', { decision: 'held', reason: 'Pendência', digest: `sha256:${'0'.repeat(64)}`, url: 'https://developers.google.com/outra/' })]);
  const found = problemsOf(project({ lots: [fake], release: releaseOf([fake], inventoryWith([])) }));
  assert.match(found, /L001-retido google-mlcc: approved for https:\/\/developers\.google\.com\/outra\//);
  assert.match(found, /L001-retido google-mlcc: the record changed after its approval/);
  // A truthful hold of the ESA record (not publishable as is) passes.
  const esa = lotOf('L001-retido', [entryFor('pm-esa-provas-2026', { decision: 'held', reason: 'PDF não abre no navegador' })]);
  assert.deepEqual(project({ lots: [esa], release: releaseOf([esa], inventoryWith([])) }).problems, []);
});

test('every ledgered lot was authorized', () => {
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc')]);
  const draft = lotOf('L002-rascunho', [entryFor('odin-foundations')], { authorization: null });
  const release = releaseOf([a], inventoryWith(['google-mlcc']), { ledger: releaseOf([a, draft], []).ledger });
  assert.match(problemsOf(project({ lots: [a, draft], release })), /L002-rascunho: in the ledger without an authorization to publish/);
});

test('recorded URLs are checked against the state the recorded lots would reach', () => {
  const a = record('google-mlcc');
  const bRecord = { ...record('odin-foundations'), url: a.url };
  const bWithEvidence = { ...bRecord, verified: { ...bRecord.verified!, evidence: { ...bRecord.verified!.evidence!, url: a.url! } } };
  const pool = POOL.map((r) => (r.id === 'odin-foundations' ? bWithEvidence : r));
  const l1 = lotOf('L001-a', [entryFor('google-mlcc')]);
  const l2 = lotOf('L002-suspende', [], { suspensions: [{ id: 'google-mlcc', reason: 'Saiu', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  const l3 = lotOf('L003-b', [{ ...entryFor('google-mlcc'), id: 'odin-foundations', url: a.url!, digest: digestOf(bWithEvidence), institution: bRecord.provider, format: bRecord.format,
    evidence: { ...entryFor('google-mlcc').evidence, url: a.url!, observed: bRecord.verified!.evidence!.note } }],
    { hosts: [{ host: new URL(a.url!).hostname, institution: bRecord.provider }] });
  const p = project({ pool, lots: [l1, l2, l3], release: releaseOf([], inventoryWith([])) });
  assert.doesNotMatch(problemsOf(p), /same URL/);
  // Without the suspension, the clash is reported before application.
  assert.match(problemsOf(project({ pool, lots: [l1, l3], release: releaseOf([], inventoryWith([])) })), /same URL/);
});

// Owner review on PR #43 (2026-10-12) ---------------------------------------------------------------------

test('a return needs evidence strictly after the take-out: same-day evidence proves no later verification', () => {
  const g = record('google-mlcc');
  const sameDay = { ...g, verified: { ...g.verified!, on: '2026-10-12' } };
  const pool = POOL.map((r) => (r.id === 'google-mlcc' ? sameDay : r));
  const a = lotOf('L001-tecnologia', [entryFor('google-mlcc', { decidedOn: '2026-10-11' })]);
  const b = lotOf('L002-suspensao', [], { suspensions: [{ id: 'google-mlcc', reason: 'Página mudou', decidedBy: SIMULATED_BY, decidedOn: '2026-10-12' }] });
  const back = lotOf('L003-retorno', [entryFor('google-mlcc', { digest: digestOf(sameDay), evidence: { ...entryFor('google-mlcc').evidence, on: '2026-10-12' } })]);
  const all = [a, b, back];
  for (const release of [releaseOf(all, inventoryWith(['google-mlcc'])), releaseOf([a, b], inventoryWith([]))]) {
    assert.match(problemsOf(project({ pool, lots: all, release })), /L003-retorno: google-mlcc returns on evidence of 2026-10-12, not after the decision of 2026-10-12 that took it out/);
  }
});

// A published record changes through a revision: the live record stays as published until its re-approval
// is applied (owner review on PR #43).
const cs50xRevision = () => {
  const live = record('cs50x');
  const evidence = { url: live.url!, checked: ['free', 'scope', 'language', 'format', 'path', 'registration'] as const, note: 'Revisão simulada: página oficial conferida com o novo título.' };
  return { ...live, title: 'CS50x: Introduction to Computer Science (revisado)', registration: 'not-required' as const, certificate: 'unconfirmed' as const,
    verified: { on: '2026-10-12', by: 'official-page' as const, freeAccess: true as const, evidence } };
};
const reapproval = (rev: ReturnType<typeof cs50xRevision>) => ({ ...entryFor('google-mlcc'), id: 'cs50x', url: rev.url!, digest: digestOf(rev), institution: rev.provider, format: rev.format,
  evidence: { on: rev.verified.on, version: 'fixture-revisao-v1', method: rev.verified.by, url: rev.verified.evidence.url, observed: rev.verified.evidence.note } });

test('a pending re-approval of a published record keeps the live record public and the build green', () => {
  const rev = cs50xRevision();
  const lot = lotOf('L001-revisao', [reapproval(rev)], { hosts: [] });
  const p = project({ revisions: [rev], lots: [lot], release: releaseOf([], inventoryWith([])) });
  assert.deepEqual(p.problems, []);
  assert.equal(p.published.find((r) => r.id === 'cs50x')?.title, record('cs50x').title, 'still the published version');
});

test('applying the re-approval publishes the revision; rolling it back restores the live record', () => {
  const rev = cs50xRevision();
  const lot = lotOf('L001-revisao', [reapproval(rev)], { hosts: [] });
  const applied = project({ revisions: [rev], lots: [lot], release: releaseOf([lot], inventoryWith([])) });
  assert.deepEqual(applied.problems, []);
  assert.equal(applied.published.find((r) => r.id === 'cs50x')?.title, rev.title);
  const rolledBack = project({ revisions: [rev], lots: [lot], release: releaseOf([], inventoryWith([]), { ledger: releaseOf([lot], []).ledger }) });
  assert.deepEqual(rolledBack.problems, []);
  assert.equal(rolledBack.published.find((r) => r.id === 'cs50x')?.title, record('cs50x').title);
});

test('a revision is bound like any record: unknown or repeated ids, and an unapproved digest, are refused', () => {
  const rev = cs50xRevision();
  assert.match(problemsOf(project({ revisions: [{ ...rev, id: 'curso-inventado' }], lots: [], release: releaseOf([], inventoryWith([])) })), /revision curso-inventado: not a known record/);
  assert.match(problemsOf(project({ revisions: [rev, rev], lots: [], release: releaseOf([], inventoryWith([])) })), /revision cs50x: two revisions/);
  // An approval for another version of the revision fails before and after application.
  const lot = lotOf('L001-revisao', [{ ...reapproval(rev), digest: `sha256:${'2'.repeat(64)}` }], { hosts: [] });
  for (const release of [releaseOf([], inventoryWith([])), releaseOf([lot], inventoryWith([]))]) {
    assert.match(problemsOf(project({ revisions: [rev], lots: [lot], release })), /cs50x: the record changed after its approval|cs50x: changed since it was published/);
  }
  // Editing the live record itself still fails, revision or not.
  const edited = catalogue.map((r) => (r.id === 'cs50x' ? { ...r, title: 'editado no lugar' } : r));
  assert.match(problemsOf(project({ catalogue: edited, revisions: [rev], lots: [], release: releaseOf([], inventoryWith([])) })), /cs50x: changed since it was published/);
});
