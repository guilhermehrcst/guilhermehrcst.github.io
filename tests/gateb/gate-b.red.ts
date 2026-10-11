// Gate B, technical stage 01: RED tests for contracts P1–P4 (addendum after the PR #33 review).
// Deliberately outside the `npm test` glob (*.red.ts), so the existing suite and CI stay green until the
// architecture is approved. Run: node --experimental-strip-types --test tests/gateb/*.red.ts
// When a contract goes GREEN, this file (or its part) becomes tests/*.test.ts.
// The new modules do not exist yet: they are imported loosely, so a missing export is a clear failure.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../../src/lib/learning-resources.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const pathStatus = await load('../../src/lib/path-status.ts');
const taxonomy = await load('../../src/lib/taxonomy.ts');
const lr = await load('../../src/lib/learning-resources.ts');
const need = (mod: Record<string, any>, name: string) => {
  assert.equal(typeof mod[name], 'function', `${name} is not implemented`);
  return mod[name] as (...args: any[]) => any;
};

const verified = { on: '2026-10-12', by: 'official-page', freeAccess: true };
const resource = (over: Record<string, unknown>) => ({
  id: 'x', title: 'X', provider: 'P', subject: null, format: 'past-exam', paths: ['vestibulares'],
  language: 'pt', level: 'vestibular', url: 'https://example.gov.br/x', verified, ...over,
});
const ACTIVE = { 'ensino-fundamental': 'active', 'ensino-medio': 'active', vestibulares: 'active', 'pre-militar': 'active', 'ensino-superior': 'active', tecnologia: 'active' };
const TODAY = { ...ACTIVE, 'ensino-fundamental': 'preparing', 'pre-militar': 'preparing' };

/* P2: one source for a path's state; activation only with homologated content shown, atomically. */

test('P2: one status per path; PREPARING_PATHS is derived from it', () => {
  const status = taxonomy.PATH_STATUS as Record<string, string> | undefined;
  assert.ok(status, 'PATH_STATUS is not defined');
  assert.deepEqual(Object.entries(status ?? {}).filter(([, s]) => s === 'preparing').map(([p]) => p), [...taxonomy.PREPARING_PATHS]);
  assert.deepEqual(status, TODAY, 'today: Fundamental and Pré-Militar in preparation');
});

test('P2: the path pages read noindex and the preparing note from the status, not from literals', async () => {
  const { readFileSync } = await import('node:fs');
  for (const page of ['ensino-fundamental', 'pre-militar']) {
    const source = readFileSync(new URL(`../../src/pages/${page}/index.astro`, import.meta.url), 'utf8');
    assert.ok(!/<Base\b[^>]*\snoindex\s*>/.test(source), `${page}: noindex is a literal`);
    assert.ok(/isPreparing\(/.test(source), `${page}: does not read the status`);
  }
});

const PATHS = ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia'];
const emptySel = Object.fromEntries(PATHS.map((p) => [p, []]));
const pool = Array.from({ length: 10 }, (_, i) => resource({ id: `pm-${i}`, paths: ['pre-militar'] }));
const tenPm = { ...emptySel, 'pre-militar': pool.map((r) => r.id) };

test('P2: activating Pré-Militar with 0 resources, or 9 of 10 highlights, is refused', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  assert.match(problems(on, emptySel, []).join('\n'), /pre-militar: active without its ten homologated highlights/);
  assert.match(problems(on, { ...tenPm, 'pre-militar': tenPm['pre-militar']!.slice(0, 9) }, pool).join('\n'), /pre-militar: active without/);
  assert.deepEqual(problems(on, tenPm, pool), [], 'ten valid highlights: activation allowed');
});

test('P2: an unhomologated (unpublished) highlight never activates a path', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  const withPending = { ...tenPm, 'pre-militar': [...tenPm['pre-militar']!.slice(0, 9), 'pending-candidate'] };
  assert.match(problems(on, withPending, pool).join('\n'), /pre-militar/);
});

test('P2: content ready while still in preparation (noindex, invisible highlights) is refused', () => {
  const problems = need(pathStatus, 'activationProblems');
  assert.match(problems(TODAY, tenPm, pool).join('\n'), /pre-militar: ready but still in preparation/);
});

test('P2: the real state today is consistent', () => {
  const problems = need(pathStatus, 'activationProblems');
  assert.deepEqual(problems(), []);
});

/* P3: school year, 1º to 9º, only with evidence. */

test('P3: schoolYears accepts 1..9, distinct, ascending, only on Fundamental, only with individual evidence', () => {
  const problems = need(lr, 'schoolYearProblems');
  const evidence = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'grade'], note: 'Página indica 2º ano.' };
  const fund = (years: unknown, ev: unknown = evidence) =>
    resource({ id: 'f', subject: 'portugues', format: 'lesson', paths: ['ensino-fundamental'], schoolYears: years, verified: { ...verified, evidence: ev } });
  assert.deepEqual(problems(fund([2])), []);
  assert.deepEqual(problems(fund([6, 7, 8, 9])), []);
  assert.match(problems(fund([0])).join('\n'), /school year 0/);
  assert.match(problems(fund([10])).join('\n'), /school year 10/);
  assert.match(problems(fund([2, 2])).join('\n'), /repeats/);
  assert.match(problems(fund([5, 2])).join('\n'), /ascending/);
  assert.match(problems(fund([])).join('\n'), /empty/);
  assert.match(problems(fund([2], { ...evidence, checked: ['free', 'scope'] })).join('\n'), /without evidence of the school year/);
  assert.match(problems(resource({ id: 'm', paths: ['ensino-medio'], subject: 'matematica', schoolYears: [9] })).join('\n'), /only on Ensino Fundamental/);
});

test('P3: a multidisciplinary Fundamental resource needs no subject; no resource is forced to have a year', () => {
  const problems = need(lr, 'schoolYearProblems');
  assert.deepEqual(problems(resource({ id: 'atlas', format: 'reference', paths: ['ensino-fundamental'] })), []);
  for (const r of publishedResources) assert.deepEqual(problems(r), [], r.id);
});

test('P3: the stage is derived from the years, never typed', () => {
  const stages = need(lr, 'stagesOf');
  assert.deepEqual(stages([1, 2]), ['anos-iniciais']);
  assert.deepEqual(stages([6]), ['anos-finais']);
  assert.deepEqual(stages([5, 6]), ['anos-iniciais', 'anos-finais']);
});

/* P4: a new resource carries its own verification and conditions; the 37 legacy records are frozen. */

test('P4: the legacy set is exactly the 37 published today, and they need nothing new', () => {
  const legacy = lr.LEGACY_VERIFIED_IDS as readonly string[] | undefined;
  assert.ok(legacy, 'LEGACY_VERIFIED_IDS is not defined');
  assert.deepEqual([...(legacy ?? [])].sort(), publishedResources.map((r) => r.id).sort());
  const problems = need(lr, 'verificationProblems');
  for (const r of publishedResources) assert.deepEqual(problems(r), [], r.id);
});

test('P4: a new resource needs individual evidence: HTTPS source, what was checked, a note', () => {
  const problems = need(lr, 'verificationProblems');
  const ok = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'registration', 'certificate'], note: 'Aberto em 12/10/2026.' };
  const fresh = (ev: unknown, over: Record<string, unknown> = {}) =>
    resource({ id: 'new-1', registration: 'not-required', certificate: 'none', verified: { ...verified, evidence: ev }, ...over });
  assert.deepEqual(problems(fresh(ok)), []);
  assert.match(problems(fresh(undefined)).join('\n'), /new-1: no individual evidence/);
  assert.match(problems(fresh({ ...ok, url: 'http://example.gov.br/x' })).join('\n'), /https/);
  assert.match(problems(fresh({ ...ok, checked: ['scope'] })).join('\n'), /free access not checked/);
  assert.match(problems(fresh({ ...ok, note: ' ' })).join('\n'), /note/);
});

test('P4: a new resource states its registration and certificate (never left unknown by omission)', () => {
  const problems = need(lr, 'verificationProblems');
  const ev = { url: 'https://example.gov.br/x', checked: ['free', 'scope', 'language', 'registration', 'certificate'], note: 'ok' };
  const base = { id: 'new-2', verified: { ...verified, evidence: ev } };
  assert.match(problems(resource({ ...base, certificate: 'none' })).join('\n'), /registration/);
  assert.match(problems(resource({ ...base, registration: 'required' })).join('\n'), /certificate/);
});
