// /cursos/ (V0.6): the course grid and course pages are views of the published catalogue. Nothing is
// invented (no rating, count, lesson total or description), no candidate reaches them, no filter is empty,
// and a course page exists only with a verified presentation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { courseCards, courseFilterPaths, libraryCourses, thumbLabelOf } from '../src/lib/course-library.ts';
import { COURSE_PRESENTATIONS, presentationProblems, type CoursePresentation } from '../src/lib/course-presentations.ts';
import { libraryGroups } from '../src/lib/libraries.ts';
import { publishedResources, type PublishedLearningResource } from '../src/lib/learning-resources.ts';
import { canonicalPaths, routes } from '../src/lib/routes.ts';
import { MILITARY_L003_CANDIDATES } from '../src/lib/staging-military.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { PATH_ORDER } from '../src/lib/taxonomy.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const cards = courseCards();

test('the grid shows exactly the courses of the library, once, in its order', () => {
  assert.deepEqual(cards.map((c) => c.resource.id), libraryGroups('cursos').flatMap((g) => g.resources.map((r) => r.id)));
  assert.equal(new Set(cards.map((c) => c.resource.id)).size, cards.length);
  const published = new Set(publishedResources.map((r) => r.id));
  for (const r of [...GATEB_NEW_RESOURCES, ...MILITARY_L003_CANDIDATES]) {
    if (!published.has(r.id)) assert.ok(!cards.some((c) => c.resource.id === r.id), `${r.id} is not published`);
  }
});

test('a card holds only the record\'s facts: its paths in the approved order, its own record', () => {
  for (const card of cards) {
    assert.equal(card.resource, publishedResources.find((r) => r.id === card.resource.id), 'the record itself, not a copy');
    assert.deepEqual(card.paths, PATH_ORDER.filter((p) => card.resource.paths.includes(p)));
    assert.ok(card.thumbLabel.length > 0);
  }
  const card = read('src/components/CourseCard.astro');
  assert.doesNotMatch(card, /rating|views|visualiza|avalia|aulas\b|lessons\.length/i, 'no invented statistic');
  assert.match(card, /r\.duration \?/, 'a duration only when the record has one');
});

test('the fallback label is an existing grouping: a track, a subject or a path', () => {
  assert.equal(thumbLabelOf({ id: 'cs50x', subject: 'tecnologia', paths: ['tecnologia'] }), 'Começar a programar');
  assert.equal(thumbLabelOf({ id: 'x', subject: 'matematica', paths: ['ensino-medio'] }), 'Matemática');
  assert.equal(thumbLabelOf({ id: 'x', subject: null, paths: ['ensino-superior'] }), 'Ensino Superior');
});

test('a filter is offered only for a path that holds courses, and the CSS answers every path', () => {
  const paths = courseFilterPaths(cards);
  for (const path of paths) assert.ok(cards.some((c) => c.paths.includes(path)), path);
  for (const path of PATH_ORDER.filter((p) => !paths.includes(p))) assert.ok(!cards.some((c) => c.paths.includes(path)), path);
  assert.deepEqual(courseFilterPaths([]), []);
  assert.deepEqual(libraryCourses([]), []);
  const css = read('src/components/CourseLibrary.astro');
  for (const path of PATH_ORDER) assert.match(css, new RegExp(`#caminho-${path}:checked\\) \\.grid > :global\\(li:not\\(\\[data-paths~='${path}'\\]\\)\\)`), path);
});

test('thumbnails are local: no third-party image, the supplied files or the Academy frame', () => {
  const thumb = read('src/components/CourseThumb.astro');
  assert.match(thumb, /import \{ resourceImages \} from '\.\.\/lib\/resource-images'/);
  assert.doesNotMatch(thumb, /https?:\/\//, 'no remote image');
  assert.match(thumb, /aria-hidden="true"/, 'decorative: the title names the course');
});

test('no course page today: none without a verified presentation', () => {
  assert.deepEqual(COURSE_PRESENTATIONS, []);
  assert.ok(!canonicalPaths().some((p) => /^\/cursos\/[^/]+\/$/.test(p)));
  assert.throws(() => routes.course('cs50x'), /has no page/);
  assert.match(read('scripts/verify-dist.mjs'), /const COURSE_PAGES = \[\];/, 'verify-dist mirrors the empty list');
});

const course = (id: string) => publishedResources.find((r) => r.id === id) as PublishedLearningResource;
const valid: CoursePresentation = {
  id: 'cs50x',
  summary: 'Uma introdução à ciência da computação e à programação, para quem tem ou não experiência prévia, com problemas semanais.',
  source: 'https://cs50.harvard.edu/x/',
  checkedOn: '2026-10-14',
};
const now = new Date('2026-10-14T12:00:00Z');

test('a valid presentation passes', () => {
  assert.deepEqual(presentationProblems([valid], publishedResources, now), []);
  assert.deepEqual(presentationProblems([{ ...valid, modules: ['Scratch', 'C'] }], publishedResources, now), []);
});

test('a presentation is refused when it is not grounded in the published course', () => {
  const problems = (p: Partial<CoursePresentation>) => presentationProblems([{ ...valid, ...p }], publishedResources, now).join('\n');
  assert.match(problems({ id: 'nao-existe' }), /not a published resource/);
  assert.match(problems({ id: GATEB_NEW_RESOURCES.find((r) => !publishedResources.some((p) => p.id === r.id))!.id }), /not a published resource/);
  assert.match(problems({ id: 'uerj-math-practice' }), /not a course/);
  assert.match(problems({ summary: 'Curto.' }), /80-600/);
  assert.match(problems({ source: 'http://cs50.harvard.edu/x/' }), /https/);
  assert.match(problems({ source: 'https://www.youtube.com/watch?v=abcdefghijk' }), /own host/);
  assert.match(problems({ checkedOn: '2026-13-01' }), /not a date/);
  assert.match(problems({ checkedOn: '2026-10-15' }), /future/);
  assert.match(problems({ modules: ['C', 'C'] }), /twice/);
  assert.match(problems({ modules: [' '] }), /non-empty/);
  assert.match(problems({ video: { youtubeId: 'x' } }), /not a YouTube id/);
  assert.match(problems({ video: { youtubeId: 'abcdefghijk' } }), /hosted on YouTube/);
  assert.match(presentationProblems([valid, valid], publishedResources, now).join('\n'), /two presentations/);
  assert.ok(course('cs50x'));
});

test('a course page never embeds: the video is a link, no iframe, no script', () => {
  const page = read('src/pages/cursos/[id].astro');
  assert.doesNotMatch(page, /<iframe|<script|youtube-nocookie/);
  assert.match(page, /getStaticPaths = \(\) => \{\s*const cards = courseCards\(\);\s*return COURSE_PRESENTATIONS\.map/);
});
