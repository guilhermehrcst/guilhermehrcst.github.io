// The Home (Home V1, V2): it answers what to learn, where the content is and how to start, from the published
// catalogue only. The featured courses are an editorial list of ids, never a second catalogue; the search is
// the site's own (/buscar/?q=); nothing promises what the catalogue does not keep.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { FEATURED_COURSE_IDS, HERO_COURSE_IDS, featuredCourses, heroCourses, homeCourseProblems, sharedHomeCourses } from '../src/lib/home-featured.ts';
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
  // V2 (McGill): the hero shows one photograph, and no course is shown twice on the Home.
  assert.equal(heroCourses().length, 1);
  assert.equal(heroCourses()[0]!.curated?.image?.kind, 'photo');
  assert.deepEqual(sharedHomeCourses(), []);
  assert.deepEqual(sharedHomeCourses(['cs50x'], ['cs50x', 'fluencia']), ['cs50x']);
});

test('the featured cards cover only with a photograph and invent no metric; every area has its signs', async () => {
  const feature = read('src/components/HomeCourseFeature.astro');
  assert.match(feature, /r\.curated\?\.image\?\.kind === 'photo'/, 'a graphic with its own lettering is never covered');
  assert.match(feature, /target="_blank" rel="noopener noreferrer"/);
  assert.match(feature, /\.has-photo \{ background: var\(--ink\);/, 'white type keeps a dark ground if the photo fails');
  assert.doesNotMatch(feature.replace(/^\/\/.*$/gm, ''), /listeners|ouvintes|progress|rating/i, 'no metric outside the comments');
  const { AREA_SIGNS } = await import('../src/lib/area-signs.ts');
  const { AREA_ORDER } = await import('../src/lib/taxonomy.ts');
  for (const area of AREA_ORDER) assert.ok(AREA_SIGNS[area].length >= 6, area);
});

test('the path illustrations are original drawings: no image, no link, decorative, colours from tokens', () => {
  const art = read('src/components/PathArt.astro');
  assert.doesNotMatch(art, /<image\b|<img\b|href=|xlink|url\(|@import/, 'nothing loaded or linked from elsewhere');
  assert.match(art, /<svg class="path-art" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"/);
  for (const path of ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'ensino-superior', 'tecnologia', 'pre-militar']) {
    assert.match(art, new RegExp(`path === '${path}'`), `${path} has its drawing`);
  }
  assert.match(read('src/components/HomePaths.astro'), /<PathArt path=\{id\} \/>/);
});

test('the six path cards read in the order of the header, from a list of their own (V2.2)', async () => {
  const { HOME_PATH_ORDER } = await import('../src/lib/home-featured.ts');
  const { NAV_PATHS } = await import('../src/lib/global-nav.ts');
  const { PATH_ORDER } = await import('../src/lib/taxonomy.ts');
  assert.deepEqual([...HOME_PATH_ORDER], ['ensino-fundamental', 'ensino-medio', 'pre-militar', 'vestibulares', 'ensino-superior', 'tecnologia']);
  assert.deepEqual([...HOME_PATH_ORDER], [...NAV_PATHS], 'the page and the header read alike');
  assert.deepEqual([...HOME_PATH_ORDER].sort(), [...PATH_ORDER].sort(), 'every path once');
  // The taxonomy's own order orders other pages (filters, footer, sitemap): the Home does not change it.
  assert.deepEqual([...PATH_ORDER], ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'pre-militar', 'ensino-superior', 'tecnologia']);
  const paths = read('src/components/HomePaths.astro');
  assert.match(paths, /\{HOME_PATH_ORDER\.map\(\(id\) => \{/);
  assert.doesNotMatch(paths, /(?<!HOME_)PATH_ORDER\.map/);
});

test('every path card has one structure, in one reading order, and one link (V2.2)', () => {
  const paths = read('src/components/HomePaths.astro');
  const markup = paths.slice(paths.indexOf('<ul class="paths"'), paths.indexOf('</ul>'));
  // The same four parts, in order, for every card: art, the way in, the name, the line, the label.
  const parts = [...markup.matchAll(/<span class="(art|go|name|what|pill)"/g)].map((m) => m[1]);
  assert.deepEqual(parts, ['art', 'go', 'name', 'what', 'pill']);
  assert.equal((markup.match(/<a\b/g) ?? []).length, 1, 'one link per card, nothing inside it that is a link or a button');
  assert.doesNotMatch(markup, /<button\b/);
  // No card turns over, and nothing cuts the art with a polygon.
  assert.doesNotMatch(paths, /flip|clip-path|rotate\(/);
  // The disc and the art are decorative; the words are the link's name.
  assert.match(markup, /<span class="go" aria-hidden="true">/);
  // Hover and the arrow's move are for readers who accept motion; nothing loops.
  assert.match(paths, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.card:hover \{ transform: translateY\(-2px\); \}/);
  assert.doesNotMatch(paths, /@keyframes|animation:/);
  assert.match(paths, /\.card:focus-visible \{ outline: 3px solid var\(--action\); outline-offset: 3px; \}/);
  // The rows are shared by a row of cards, so names, lines and labels line up; and a column on a phone.
  assert.match(paths, /grid-template-rows: subgrid/);
  assert.match(paths, /@media \(min-width: 1080px\) \{ \.paths \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \} \}/);
  assert.match(paths, /@media \(min-width: 640px\) \{ \.paths \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  // Colours and type come from the tokens only.
  assert.doesNotMatch(paths.slice(paths.indexOf('<style>')), /#[0-9a-f]{3,8}\b|font-family: (?!var\()/i);
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
  // The hero sets the lema in two faces (serif, then sans bold): the two parts are the lema, word for word.
  assert.equal(`${pt.home.hero.headingLead} ${pt.home.hero.headingStrong}`, pt.pages.home.heading);
  assert.match(read('src/components/HomeHero.astro'), /<h1><span class="h-serif">\{h\.headingLead\}<\/span> <span class="h-strong">\{h\.headingStrong\}<\/span><\/h1>/);
  const copy = JSON.stringify(pt.home);
  assert.doesNotMatch(copy, /Em português · Fontes oficiais/i, 'not every course is in Portuguese nor every source official');
  assert.doesNotMatch(copy, /patroc[ií]n|parceir[oa]s? oficia|endoss/i);
  assert.ok(pt.home.curation.commitments.some((c) => /Independente/.test(c.title)));
});

test('the paths on the Home are counted from the catalogue, never typed', () => {
  const paths = read('src/components/HomePaths.astro');
  assert.match(paths, /const facts = objectiveFacts\(id\)/);
  assert.match(paths, /data-path-count=\{preparing \? undefined : facts\.resources\}/);
  assert.match(paths, /const superior = superiorCopyFor\(\)/);
  assert.doesNotMatch(paths, /\b\d+ recursos\b/);
});

test('the long learning demo is gone; the sections keep their order (V2 restores #fontes)', () => {
  for (const file of ['HeroDemo', 'LearningPath', 'ProductWindow']) assert.ok(!existsSync(new URL(`../src/components/${file}.astro`, import.meta.url)), file);
  const page = read('src/pages/index.astro');
  const order = [...page.matchAll(/<section class="[^"]*\bblock\b[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ['objetivo', 'cursos', 'trilhas', 'areas', 'fontes', 'curadoria', 'perguntas']);
  assert.match(page, /featuredCourses\(\)/);
});
