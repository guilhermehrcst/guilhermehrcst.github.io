import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex } from '../src/lib/search-index.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';

// V0.4 M4 (spec §5.4, §6): a resource result opens the page that shows it, at the resource itself; filters
// by path, subject, institution, language and format combine with AND across facets and OR inside one.
// A resource without a subject is never given one: a subject filter leaves it out, the others keep it.
const si = await import('../src/lib/search-index.ts') as Record<string, any>;
const sf = await import('../src/lib/search-filter.ts').catch(() => ({})) as Record<string, any>;
const { facetOptions } = await import('../src/lib/search-facets.ts').catch(() => ({ facetOptions: () => ({}) })) as Record<string, any>;
const index = buildSearchIndex();
const resources = index.filter((e) => e.kind === 'recurso');

test('a resource result leads to its home page, at the resource itself (#recurso-<id>)', () => {
  assert.equal(typeof si.resourceAnchor, 'function');
  for (const r of publishedResources) {
    const entry = resources.find((e) => e.id === `recurso:${r.id}`)!;
    const [page, hash] = entry.url.split('#');
    assert.equal(page, si.resourceHome(r).split('#')[0], r.id);
    assert.equal(hash, si.resourceAnchor(r.id), r.id);
    assert.match(hash!, /^recurso-[a-z0-9-]+$/, r.id);
  }
});

test('anchorPlan anchors a resource once, on its home page only, at its first occurrence', () => {
  const math = publishedResources.find((r) => r.id === 'kultivi-math-enem')!;
  const cs50x = publishedResources.find((r) => r.id === 'cs50x')!;
  const cs50p = publishedResources.find((r) => r.id === 'cs50p')!;
  const plan = si.anchorPlan('/tecnologia/', [[cs50x, cs50p], [cs50x, math]]);
  assert.deepEqual(plan.map((s: Set<string>) => [...s]), [['cs50x', 'cs50p'], []]);
  assert.deepEqual(si.anchorPlan('/materias/matematica/', [[math, cs50x]]).map((s: Set<string>) => [...s]), [['kultivi-math-enem']]);
});

test('a resource without a subject lives on the exam page that shows it; with no such page it has no destination', () => {
  // An exam's past papers (practice) are shown by its guide: that is where they live.
  assert.equal(si.resourceHome({ id: 'x', subject: null, format: 'past-exam', paths: ['vestibulares'], exams: ['enem'] }), '/enem/');
  assert.equal(si.resourceHome({ id: 'x', subject: null, format: 'past-exam', paths: ['vestibulares'], exams: ['uerj'] }), '/uerj/');
  assert.throws(() => si.resourceHome({ id: 'x', subject: null, format: 'past-exam', paths: ['ensino-medio'] }), /no page shows/);
});

test('resource entries carry their facets; other entries carry none', () => {
  for (const r of publishedResources) {
    const entry = resources.find((e) => e.id === `recurso:${r.id}`)! as unknown as { facets?: Record<string, string[]> };
    assert.deepEqual(entry.facets, {
      caminho: [...r.paths],
      materia: r.subject === null ? [] : [r.subject],
      instituicao: [sf.providerKey?.(r.provider)],
      idioma: [r.language],
      formato: [r.format],
    }, r.id);
  }
  for (const e of index.filter((x) => x.kind !== 'recurso')) assert.equal((e as { facets?: unknown }).facets, undefined, e.id);
});

test('facet options: only values some resource has, in the taxonomy order, each with its label', () => {
  const options = facetOptions(publishedResources);
  assert.deepEqual(Object.keys(options), ['caminho', 'materia', 'instituicao', 'idioma', 'formato']);
  assert.deepEqual(options.caminho.map((o: { value: string }) => o.value), ['ensino-medio', 'vestibulares', 'ensino-superior', 'tecnologia']);
  assert.deepEqual(options.caminho.map((o: { label: string }) => o.label), ['Ensino Médio', 'Vestibular', 'Ensino Superior', 'Tecnologia']);
  assert.deepEqual(options.idioma.map((o: { value: string }) => o.value), ['pt', 'en']);
  assert.deepEqual(options.formato.map((o: { value: string }) => o.value), ['course', 'track', 'practice', 'past-exam']);
  assert.equal(options.materia.length, 13);
  assert.ok(options.instituicao.some((o: { value: string; label: string }) => o.label === 'Harvard University' && o.value === 'harvard-university'));
  for (const facet of Object.values(options) as { value: string }[][]) {
    assert.equal(new Set(facet.map((o) => o.value)).size, facet.length, 'no option twice');
  }
});

const facets = (over: Partial<Record<string, string[]>> = {}) => ({ caminho: ['vestibulares'], materia: ['matematica'], instituicao: ['kultivi'], idioma: ['pt'], formato: ['course'], ...over });

test('entryMatches: AND across facets, OR inside one; no selection matches everything', () => {
  const m = sf.entryMatches;
  assert.equal(m(facets(), {}), true);
  assert.equal(m(facets(), { caminho: ['vestibulares'], idioma: ['pt'] }), true);
  assert.equal(m(facets(), { caminho: ['vestibulares'], idioma: ['en'] }), false);
  assert.equal(m(facets(), { formato: ['practice', 'course'] }), true);
  assert.equal(m(facets(), { materia: ['fisica', 'quimica'] }), false);
  assert.equal(m(facets(), { caminho: [] }), true, 'an empty facet does not filter');
});

test('a resource without a subject is left out by a subject filter and kept by the others', () => {
  const exam = facets({ materia: [], formato: ['past-exam'] });
  assert.equal(sf.entryMatches(exam, { materia: ['matematica'] }), false);
  assert.equal(sf.entryMatches(exam, { caminho: ['vestibulares'], formato: ['past-exam'] }), true);
});

test('an entry without facets (a path, an area, a subject page) is shown only when no filter is set', () => {
  assert.equal(sf.entryMatches(undefined, {}), true);
  assert.equal(sf.entryMatches(undefined, { idioma: ['pt'] }), false);
});

test('the selection lives in the URL; unknown facets and values are dropped, never trusted', () => {
  const options = facetOptions(publishedResources);
  const params = new URLSearchParams('q=python&caminho=tecnologia,nope&idioma=en&hack=1&formato=');
  assert.deepEqual(sf.parseSelection(params, options), { caminho: ['tecnologia'], idioma: ['en'] });
  const out = new URLSearchParams('q=python');
  sf.writeSelection(out, { caminho: ['tecnologia', 'ensino-superior'], idioma: [] });
  assert.equal(out.toString(), 'q=python&caminho=tecnologia%2Censino-superior');
  assert.deepEqual(sf.parseSelection(out, options), { caminho: ['tecnologia', 'ensino-superior'] });
});

test('filtering the real index: Tecnologia in Portuguese is exactly the Portuguese technology resources', () => {
  const visible = resources.filter((e) => sf.entryMatches((e as { facets?: Record<string, string[]> }).facets, { caminho: ['tecnologia'], idioma: ['pt'] })).map((e) => e.id.slice(8)).sort();
  const expected = publishedResources.filter((r) => r.paths.includes('tecnologia') && r.language === 'pt').map((r) => r.id).sort();
  assert.deepEqual(visible, expected);
  assert.ok(expected.length > 0);
});
