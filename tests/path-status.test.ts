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
// Historical negative scenarios use TODAY; the real branch has now activated only Pré-Militar.
const REAL_AFTER_L002 = { ...TODAY, 'pre-militar': 'active' };

/* P2: one source for a path's state; activation only with homologated content shown, atomically. */

test('P2: one status per path; PREPARING_PATHS is derived from it', () => {
  const status = taxonomy.PATH_STATUS as Record<string, string> | undefined;
  assert.ok(status, 'PATH_STATUS is not defined');
  assert.deepEqual(Object.entries(status ?? {}).filter(([, s]) => s === 'preparing').map(([p]) => p), [...taxonomy.PREPARING_PATHS]);
  assert.deepEqual(status, REAL_AFTER_L002, 'L002: Pré-Militar active, Fundamental still preparing');
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

// Academy incremental release (proposal §5): activating a path and releasing its highlights are separate
// decisions. Fundamental and Pré-Militar activate with one published resource on their own page; the ten
// highlights stay a separate, complete-or-absent release.
test('P2: activating Pré-Militar with no resource is refused; one resource on its own page is enough', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  const others = publishedResources.filter((r) => !r.paths.includes('pre-militar'));
  const nothing = problems(on, emptySel, others, STAGING).join('\n');
  assert.match(nothing, /pre-militar: active without a page that shows its resources/);
  assert.match(nothing, /pre-militar: active with no published resource/);
  assert.deepEqual(problems(on, emptySel, [...others, pool[0]!], STAGING), [], 'one resource on /pre-militar/, no highlights: activation allowed');
  assert.doesNotMatch(problems(on, emptySel, [...others, pool[0]!], STAGING).join('\n'), /highlight/);
});

test('P2: highlights are released only complete: 9 of 10, or ten filled in staging, never show', () => {
  const problems = need(pathStatus, 'activationProblems');
  const on = { ...TODAY, 'pre-militar': 'active' };
  const nine = { ...tenPm, 'pre-militar': tenPm['pre-militar']!.slice(0, 9) };
  assert.match(problems(on, nine, [...publishedResources, ...pool], RELEASED_PM).join('\n'), /pre-militar: released without ten valid highlights/);
  assert.deepEqual(problems(on, tenPm, [...publishedResources, ...pool], RELEASED_PM), [], 'ten valid highlights, released');
  assert.deepEqual(problems(on, tenPm, [...publishedResources, ...pool], STAGING), [], 'ten in staging: the path is active, the highlights are not shown');
  assert.deepEqual(problems(TODAY, tenPm, [...publishedResources, ...pool], STAGING), [], 'staging while in preparation is ordinary editorial work');
});

test('P2: a gated path is active only with a page that shows its resources', () => {
  const problems = need(pathStatus, 'activationProblems');
  // Ten highlights placed elsewhere (a subject page), none on Pré-Militar itself: shown somewhere, but not
  // on the path's own page. The guard is separate from the count of shown resources.
  const elsewhere = pool.map((r) => ({ ...r, subject: 'matematica', format: 'course', paths: ['pre-militar', 'vestibulares'] }));
  const on = { ...TODAY, 'pre-militar': 'active' };
  const found = problems(on, tenPm, elsewhere, RELEASED_PM).join('\n');
  assert.match(found, /pre-militar: active without a page that shows its resources/);
  assert.doesNotMatch(found, /pre-militar: active with no published resource/, 'the resources are shown, just not there');
  assert.match(problems(on, emptySel, [elsewhere[0]!], STAGING).join('\n'), /pre-militar: active without a page that shows its resources/);
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


test('Pré-Militar names Escola Naval under Marinha, as structure only: no date, link or requirement', async () => {
  const { pt } = await import('../src/i18n/pt.ts');
  const marinha = pt.preMilitar.branches.find((b) => b.force === 'Marinha');
  assert.deepEqual(marinha?.schools.map((s) => s.acronym), ['CN', 'EN']);
  assert.equal(marinha?.schools.find((s) => s.acronym === 'EN')?.name, 'Escola Naval');
  // The general orientation (processesWhy) replaces a status repeated on every school (owner, PR review).
  assert.ok(!('status' in pt.preMilitar), 'no repeated per-school status');
  assert.match(pt.preMilitar.processesWhy, /conferido na fonte oficial/);
  // A school carries, at most, the typed id of a catalogue record: never a URL, a date or a requirement.
  for (const school of pt.preMilitar.branches.flatMap((b) => b.schools)) {
    for (const key of Object.keys(school)) assert.ok(['acronym', 'name', 'resourceId'].includes(key), `${school.acronym}: ${key}`);
    for (const value of Object.values(school)) assert.doesNotMatch(String(value), /https?:|\/\//, `${school.acronym}: no link in the copy`);
  }
});

test('Pré-Militar: a school resourceId names a typed Pré-Militar record of that school; ITA names its past exams', async () => {
  const { pt } = await import('../src/i18n/pt.ts');
  const { catalogue } = await import('../src/lib/learning-resources.ts');
  const { STAGED_RESOURCES } = await import('../src/lib/staging.ts');
  const { GATEB_NEW_RESOURCES } = await import('../src/lib/staging-gateb.ts');
  const records = new Map([...catalogue, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES].map((r) => [r.id, r]));
  const linked = pt.preMilitar.branches.flatMap((b) => b.schools).filter((s) => s.resourceId !== undefined);
  assert.deepEqual(linked.map((s) => [s.acronym, s.resourceId]), [['ITA', 'ita-provas-anteriores']]);
  for (const school of linked) {
    const record = records.get(school.resourceId!);
    assert.ok(record, `${school.acronym}: ${school.resourceId} is not a typed record`);
    assert.ok(record!.paths.includes('pre-militar'), `${school.resourceId}: not a Pré-Militar record`);
    assert.equal(record!.provider, school.acronym, `${school.resourceId}: published by ${record!.provider}`);
  }
});

test('Pré-Militar page: availability, the materials section and the step link come from the placed catalogue only', async () => {
  const { readFileSync } = await import('node:fs');
  const page = readFileSync(new URL('../src/pages/pre-militar/index.astro', import.meta.url), 'utf8');
  assert.match(page, /placedOnPath\('pre-militar'\)/, 'availability is read from the placed catalogue');
  assert.match(page, /school\.resourceId !== undefined && placed\.has\(school\.resourceId\)/, 'a school is available only when its record is placed here');
  assert.match(page, /hasMaterials \? '#materiais' : routes\.objective\('ensino-medio'\)/, 'no link to an anchor that is not rendered');
  assert.doesNotMatch(page, /https?:\/\//, 'no URL written in the page');
  assert.doesNotMatch(page, /ita-provas-anteriores/, 'no resource id written in the page');
});
