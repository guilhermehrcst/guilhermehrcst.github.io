// V0.4 Gate B, P2: PATH_STATUS is the one source of a path's state; activation is explicit and consistent.
// Converted from the RED tests of tests/gateb/gate-b.red.ts (adjusted to the approved explicit release).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const pathStatus = await load('../src/lib/path-status.ts');
const taxonomy = await load('../src/lib/taxonomy.ts');
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
    const source = readFileSync(new URL(`../src/pages/${page}/index.astro`, import.meta.url), 'utf8');
    assert.ok(!/<Base\b[^>]*\snoindex\s*>/.test(source), `${page}: noindex is a literal`);
    assert.ok(/isPreparing\(/.test(source), `${page}: does not read the status`);
  }
});

const PATHS = ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia'];
const emptySel = Object.fromEntries(PATHS.map((p) => [p, []]));
const pool = Array.from({ length: 10 }, (_, i) => resource({ id: `pm-${i}`, paths: ['pre-militar'] }));
const tenPm = { ...emptySel, 'pre-militar': pool.map((r) => r.id) };

const STAGING = Object.fromEntries(PATHS.map((p) => [p, 'staging']));
const RELEASED_PM = { ...STAGING, 'pre-militar': 'released' };

test('P2: activating Pré-Militar with 0 resources, or 9 of 10 highlights, is refused', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  assert.match(problems(on, emptySel, [], RELEASED_PM).join('\n'), /pre-militar: active without its ten homologated highlights/);
  assert.match(problems(on, { ...tenPm, 'pre-militar': tenPm['pre-militar']!.slice(0, 9) }, pool, RELEASED_PM).join('\n'), /pre-militar: active without/);
  assert.deepEqual(problems(on, tenPm, [...publishedResources, ...pool], RELEASED_PM), [], 'ten valid highlights, released: activation allowed');
});

test('P2: ten ids filled in staging authorise nothing: activation needs the explicit release', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  assert.match(problems(on, tenPm, pool, STAGING).join('\n'), /pre-militar: active without its ten homologated highlights released/);
  assert.deepEqual(problems(TODAY, tenPm, [...publishedResources, ...pool], STAGING), [], 'staging while in preparation is ordinary editorial work');
});

test('P2: a gated path is active only with a page that shows its resources', () => {
  const problems = need(pathStatus, 'activationProblems');
  // Ten highlights placed elsewhere (a subject page), none on Pré-Militar itself.
  const elsewhere = pool.map((r) => ({ ...r, subject: 'matematica', format: 'course', paths: ['pre-militar', 'vestibulares'] }));
  const on = { ...TODAY, 'pre-militar': 'active' };
  assert.match(problems(on, tenPm, elsewhere, RELEASED_PM).join('\n'), /pre-militar: active without a page that shows its resources/);
});

test('P2: an unhomologated (unpublished) highlight never activates a path', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  const withPending = { ...tenPm, 'pre-militar': [...tenPm['pre-militar']!.slice(0, 9), 'pending-candidate'] };
  assert.match(problems(on, withPending, pool, RELEASED_PM).join('\n'), /pre-militar/);
});

test('P2: highlights released while still in preparation (noindex, invisible highlights) are refused', () => {
  const problems = need(pathStatus, 'activationProblems');
  assert.match(problems(TODAY, tenPm, pool, RELEASED_PM).join('\n'), /pre-militar: released but still in preparation/);
});

test('P2: a release without ten valid highlights is refused on any path', () => {
  const problems = need(pathStatus, 'activationProblems');
  assert.match(problems(TODAY, emptySel, pool, { ...STAGING, tecnologia: 'released' }).join('\n'), /tecnologia: released without ten valid highlights/);
});

test('P2: the real state today is consistent', () => {
  const problems = need(pathStatus, 'activationProblems');
  assert.deepEqual(problems(), []);
});


test('Pré-Militar names Escola Naval under Marinha, as structure only: edital in verification, no link', async () => {
  const { pt } = await import('../src/i18n/pt.ts');
  const marinha = pt.preMilitar.branches.find((b) => b.force === 'Marinha');
  assert.deepEqual(marinha?.schools.map((s) => s.acronym), ['CN', 'EN']);
  assert.equal(marinha?.schools.find((s) => s.acronym === 'EN')?.name, 'Escola Naval');
  assert.equal(pt.preMilitar.status, 'Edital em verificação');
  for (const school of marinha?.schools ?? []) assert.deepEqual(Object.keys(school).sort(), ['acronym', 'name'], 'no date, link or requirement');
});
