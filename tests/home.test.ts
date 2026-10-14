// The Home (Home V1): it answers what to learn, where the content is and how to start, from the published
// catalogue only. The featured courses are an editorial list of ids, never a second catalogue; the search is
// the site's own (/buscar/?q=); nothing promises what the catalogue does not keep.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { FEATURED_COURSE_IDS, HERO_COURSE_IDS, featuredCourses, heroCourses, homeCourseProblems } from '../src/lib/home-featured.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { libraryOf } from '../src/lib/libraries.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { pt } from '../src/i18n/pt.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('the Home courses are published courses of the library, three or four, with images in the hero', () => {
  assert.ok(FEATURED_COURSE_IDS.length >= 3 && FEATURED_COURSE_IDS.length <= 4);
  for (const r of featuredCourses()) assert.equal(libraryOf(r.format), 'cursos', r.id);
  for (const r of heroCourses()) assert.ok(r.curated?.image, `${r.id} has a supplied image`);
  assert.deepEqual(heroCourses().map((r) => r.id), [...HERO_COURSE_IDS]);
  // The records themselves, not copies.
  for (const r of featuredCourses()) assert.equal(r, publishedResources.find((p) => p.id === r.id));
});

test('an id that is not a published course is refused', () => {
  const unpublished = GATEB_NEW_RESOURCES.find((r) => !publishedResources.some((p) => p.id === r.id))!.id;
  assert.match(homeCourseProblems(['nao-existe']).join(), /not a published resource/);
  assert.match(homeCourseProblems([unpublished]).join(), /not a published resource/);
  assert.match(homeCourseProblems(['uerj-math-practice']).join(), /not a course/);
  assert.match(homeCourseProblems(['cs50x', 'cs50x']).join(), /twice/);
  assert.match(homeCourseProblems(['kultivi-writing-enem'], publishedResources, true).join(), /no supplied image/);
  assert.deepEqual(homeCourseProblems([...FEATURED_COURSE_IDS]), []);
});

test('the hero search is the site search: a native GET form to /buscar/ with q, labelled', () => {
  const hero = read('src/components/HomeHero.astro');
  assert.match(hero, /<form class="search" action=\{routes\.search\} method="get" role="search" data-home-search>/);
  assert.match(hero, /<label class="sr-only" for="home-q">/);
  assert.match(hero, /<input id="home-q" name="q" type="search" placeholder=\{h\.searchPlaceholder\}/);
  assert.equal(pt.home.hero.searchPlaceholder, 'O que você quer aprender?');
  assert.match(read('src/scripts/search.ts'), /input\.value = params\.get\('q'\) \?\? ''/, 'the search page reads q');
  assert.doesNotMatch(hero, /<script/);
});

test('the Home keeps its promise: the lema, and no claim the catalogue does not keep', () => {
  assert.equal(pt.pages.home.heading, 'Aprenda com direção.');
  const copy = JSON.stringify(pt.home);
  assert.doesNotMatch(copy, /Em português · Fontes oficiais/i, 'not every course is in Portuguese nor every source official');
  assert.doesNotMatch(copy, /patrocin|parceir[oa]s? oficia|endoss/i);
  assert.ok(pt.home.curation.commitments.some((c) => /Independente/.test(c.title)));
});

test('the paths on the Home are counted from the catalogue, never typed', () => {
  const paths = read('src/components/HomePaths.astro');
  assert.match(paths, /const facts = objectiveFacts\(id\)/);
  assert.match(paths, /data-path-count=\{preparing \? undefined : facts\.resources\}/);
  assert.match(paths, /const superior = superiorCopyFor\(\)/);
  assert.doesNotMatch(paths, /\b\d+ recursos\b/);
});

test('the long learning demo is gone; its components with it', () => {
  for (const file of ['HeroDemo', 'LearningPath', 'ProductWindow']) assert.ok(!existsSync(new URL(`../src/components/${file}.astro`, import.meta.url)), file);
  const page = read('src/pages/index.astro');
  const order = [...page.matchAll(/<section class="wrap block" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ['objetivo', 'cursos', 'trilhas', 'areas', 'curadoria', 'perguntas']);
  assert.match(page, /featuredCourses\(\)/);
});
