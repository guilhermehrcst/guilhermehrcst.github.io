// V0.4 Gate B, P1: a resource's one canonical destination, derived from the rules the pages render by.
// Converted from the RED tests of tests/gateb/gate-b.red.ts once the contract was implemented.
import { PATH_STATUS } from '../src/lib/taxonomy.ts';
import baseline from '../src/data/academy-release/baseline.json' with { type: 'json' };
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { routes } from '../src/lib/routes.ts';

const load = async (path: string): Promise<Record<string, any>> => import(path).catch(() => ({}));
const placement = await load('../src/lib/placement.ts');
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

/* P1: a multidisciplinary resource is placed by its data, never by an ENEM/UERJ association it lacks. */

test('P1: the 37 published resources keep exactly the page they live on at 5bc12a6 (ENEM/UERJ unchanged)', () => {
  const placementOf = need(placement, 'placementOf');
  // The rule of 5bc12a6, written out: technology on /tecnologia/, every other resource on its subject's page.
  const before = (r: (typeof publishedResources)[number]) => (r.subject === 'tecnologia' ? '/tecnologia/' : routes.subject(r.subject!));
  // The 37 of the V0.4 baseline: what later lots publish lives where its own rules put it.
  const legacy = publishedResources.filter((r) => r.id in baseline.records);
  assert.equal(legacy.length, 37);
  for (const r of legacy) {
    assert.equal(placementOf(r, TODAY)?.page, before(r), r.id);
    assert.equal(placementOf(r, TODAY)?.anchor, `recurso-${r.id}`, r.id);
  }
});

test('P1: a military past exam (no subject, no ENEM/UERJ) lives on Pré-Militar once that page is active', () => {
  const placementOf = need(placement, 'placementOf');
  const esa = resource({ id: 'esa-provas', paths: ['pre-militar'] });
  assert.deepEqual(placementOf(esa, ACTIVE), { page: '/pre-militar/', anchor: 'recurso-esa-provas' });
});

test('P1: a Fuvest past exam (no subject, no ExamId) lives on the Vestibular hub', () => {
  const placementOf = need(placement, 'placementOf');
  const fuvest = resource({ id: 'fuvest-provas', paths: ['vestibulares'] });
  assert.deepEqual(placementOf(fuvest, TODAY), { page: '/vestibulares/', anchor: 'recurso-fuvest-provas' });
});

test('P1: no destination on a page in preparation; a published resource without a destination fails', () => {
  const placementOf = need(placement, 'placementOf');
  const problems = need(placement, 'placementProblems');
  const esa = resource({ id: 'esa-provas', paths: ['pre-militar'] });
  assert.equal(placementOf(esa, TODAY), null, 'never a link to a page that shows nothing');
  assert.match(problems([esa], TODAY).join('\n'), /esa-provas has no page that shows it/);
  // The 37 of V0.4 have a destination even with both paths in preparation; every published resource has
  // one under the real path states (a lot that publishes a Fundamental resource activates its path).
  assert.deepEqual(problems(publishedResources.filter((r) => r.id in baseline.records), TODAY), [], 'the 37 all have a destination');
  assert.deepEqual(problems(publishedResources, PATH_STATUS), [], 'every published resource has a destination');
});

test('P1: a destination is always a built, indexable page of the site', async () => {
  const placementOf = need(placement, 'placementOf');
  const { canonicalPaths } = await import('../src/lib/routes.ts');
  const cases = [resource({ id: 'a', paths: ['vestibulares'] }), resource({ id: 'b', paths: ['ensino-superior'], subject: null })];
  for (const r of [...publishedResources, ...cases]) {
    const at = placementOf(r, TODAY);
    if (at) assert.ok(canonicalPaths().includes(at.page), `${r.id}: ${at.page}`);
  }
});

test('P1: a Fundamental resource with a school subject lives on Fundamental, never among the Médio subject pages', () => {
  const placementOf = need(placement, 'placementOf');
  const math5 = resource({ id: 'mat-5', subject: 'matematica', format: 'course', paths: ['ensino-fundamental'], level: 'beginner' });
  assert.equal(placementOf(math5, ACTIVE)?.page, '/ensino-fundamental/');
  assert.equal(placementOf(math5, TODAY), null);
});

