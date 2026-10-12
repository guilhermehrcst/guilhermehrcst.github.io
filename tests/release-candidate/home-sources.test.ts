import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RC_CATALOGUE } from './context.ts';
import { publishedResources } from '../../src/lib/learning-resources.ts';
import { publishedTracksFor } from '../../src/lib/tech-tracks.ts';
import { facetOptions } from '../../src/lib/search-facets.ts';

// P1-RC1 (homologation 2026-10-12): publishing MIT 18.01SC, 8.01SC and 7.012 made the Home's "Aprenda com
// fontes oficiais" throw "MIT OpenCourseWare spans pages; say where", and the Home was not built. A
// provider whose courses live on several pages now leads to the search filtered by that institution, a
// real URL the search page honours, and its count names every area it covers.
const lib = await import('../../src/lib/home-sources.ts').catch(() => ({})) as Record<string, any>;
const PROVIDERS = ['Harvard University', 'MIT OpenCourseWare', 'FGV', 'Cisco Networking Academy', 'Fundação Bradesco', 'Fundação Bradesco + Microsoft'];

test('today: every institution keeps its single-page link and count, exactly as before', () => {
  const sources = lib.homeSources(PROVIDERS, publishedResources, publishedTracksFor(publishedResources));
  assert.deepEqual(sources.map((s: any) => [s.provider, s.count, s.areas, s.href]), [
    ['Harvard University', 5, ['Tecnologia'], '/tecnologia/#comecar-a-programar'],
    ['MIT OpenCourseWare', 5, ['Tecnologia'], '/tecnologia/#python'],
    ['FGV', 3, ['Tecnologia'], '/tecnologia/#dados'],
    ['Cisco Networking Academy', 1, ['Tecnologia'], '/tecnologia/#seguranca-e-privacidade'],
    ['Fundação Bradesco', 2, ['Tecnologia'], '/tecnologia/#comecar-a-programar'],
    ['Fundação Bradesco + Microsoft', 1, ['Tecnologia'], '/tecnologia/#inteligencia-artificial'],
  ]);
});

test('release candidate: MIT spans three areas and leads to the search filtered by MIT, a real filter value', () => {
  const sources = lib.homeSources(PROVIDERS, RC_CATALOGUE, publishedTracksFor(RC_CATALOGUE));
  const mit = sources.find((s: any) => s.provider === 'MIT OpenCourseWare');
  assert.deepEqual(mit.areas, ['Tecnologia', 'Matemática', 'Ciências da Natureza']);
  assert.equal(mit.count, 8);
  assert.equal(mit.href, '/buscar/?instituicao=mit-opencourseware');
  const value = new URL(mit.href, 'https://x').searchParams.get('instituicao');
  assert.ok(facetOptions(RC_CATALOGUE).instituicao.some((o) => o.value === value), 'the filter value is offered by the search page');
  for (const s of sources.filter((x: any) => x.provider !== 'MIT OpenCourseWare')) assert.match(s.href, /^\/tecnologia\/#[\w-]+$/, s.provider);
});

test('the guards stay: a non-course or a resource without a subject still fails, never a fictitious link', () => {
  const [mit] = publishedResources.filter((r) => r.provider === 'MIT OpenCourseWare');
  assert.throws(() => lib.homeSources(['MIT OpenCourseWare'], [{ ...mit!, format: 'past-exam' }], publishedTracksFor()), /not a course/);
  assert.throws(() => lib.homeSources(['MIT OpenCourseWare'], [{ ...mit!, subject: null }], publishedTracksFor()), /without a subject/);
  assert.throws(() => lib.homeSources(['MIT OpenCourseWare'], [{ ...mit!, id: 'nowhere', subject: 'matematica' }], publishedTracksFor()), /no track to lead to/);
});

test('the count names every area an institution covers, and reads as before for one area', async () => {
  const { pt } = await import('../../src/i18n/pt.ts');
  const s = pt.home.sources as any;
  assert.equal(s.count(5, 'Tecnologia'), '5 cursos em Tecnologia');
  assert.equal(s.countAreas?.(8, ['Tecnologia', 'Matemática', 'Ciências da Natureza']), '8 cursos em Tecnologia, Matemática e Ciências da Natureza');
  assert.equal(s.countAreas?.(2, ['Tecnologia', 'Matemática']), '2 cursos em Tecnologia e Matemática');
});
