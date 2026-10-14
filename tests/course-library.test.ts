// /cursos/ (V0.6): the course grid and course pages are views of the published catalogue. Nothing is
// invented (no rating, count, lesson total or description), no candidate reaches them, no filter is empty,
// and a course page exists only with a verified presentation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COURSE_FILTER_ORDER, courseCards, emptyFilterPaths, initialsOf, libraryCourses, thumbLabelOf } from '../src/lib/course-library.ts';
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
  const card = read('src/components/CourseCard.astro').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(card, /rating|views|visualiza|avalia|aulas\b|lessons\.length/i, 'no invented statistic');
});

test('the fallback label is an existing grouping: a track, a subject or a path', () => {
  assert.equal(thumbLabelOf({ id: 'cs50x', subject: 'tecnologia', paths: ['tecnologia'] }), 'Começar a programar');
  assert.equal(thumbLabelOf({ id: 'x', subject: 'matematica', paths: ['ensino-medio'] }), 'Matemática');
  assert.equal(thumbLabelOf({ id: 'x', subject: null, paths: ['ensino-superior'] }), 'Ensino Superior');
});

test('the filters (V0.7): every path in the owner\'s order; an empty one answers with its empty state', () => {
  assert.deepEqual([...COURSE_FILTER_ORDER], ['ensino-fundamental', 'ensino-medio', 'vestibulares', 'ensino-superior', 'tecnologia', 'pre-militar']);
  assert.deepEqual([...COURSE_FILTER_ORDER].sort(), [...PATH_ORDER].sort());
  const empty = emptyFilterPaths(cards);
  for (const path of COURSE_FILTER_ORDER) assert.equal(empty.includes(path), !cards.some((c) => c.paths.includes(path)), path);
  assert.deepEqual(emptyFilterPaths([]), [...COURSE_FILTER_ORDER]);
  assert.deepEqual(libraryCourses([]), []);
  const library = read('src/components/CourseLibrary.astro');
  for (const path of PATH_ORDER) {
    assert.match(library, new RegExp(`#caminho-${path}:checked\\) \\.grid > :global\\(li:not\\(\\[data-paths~='${path}'\\]\\)\\)`), path);
    assert.match(library, new RegExp(`#caminho-${path}:checked\\) \\.empty\\[data-empty-for='${path}'\\]`), path);
  }
  assert.doesNotMatch(library, /class="n"/, 'no counts in the chips');
  assert.match(read('scripts/verify-dist.mjs'), /const COURSE_FILTERS = \['ensino-fundamental', 'ensino-medio', 'vestibulares', 'ensino-superior', 'tecnologia', 'pre-militar'\];/);
});

test('an avatar shows the official mark only when square, else the initials', () => {
  assert.equal(initialsOf('MIT OpenCourseWare'), 'MIT');
  assert.equal(initialsOf('FGV'), 'FGV');
  assert.equal(initialsOf('Harvard University'), 'HU');
  assert.equal(initialsOf('Fundação Bradesco + Microsoft'), 'FB');
  assert.equal(initialsOf('The Odin Project'), 'OP');
  assert.equal(initialsOf('Kultivi'), 'K');
  assert.match(read('src/components/CourseAvatar.astro'), /r > 0\.8 && r < 1\.25/);
});

test('the dark theme and the bottom navigation belong to /cursos/ alone', () => {
  assert.match(read('src/pages/cursos/index.astro'), /<Base [^>]*theme="dark" bottomNav>/);
  for (const file of ['src/components/LibraryPage.astro', 'src/pages/index.astro', 'src/pages/materias/index.astro', 'src/pages/cursos/[id].astro']) {
    assert.doesNotMatch(read(file), /theme="dark"|bottomNav/, file);
  }
  const header = read('src/components/SiteHeader.astro');
  assert.ok(header.split(/\n/).filter((l) => /video-/.test(l)).every((l) => /html\[data-(theme='dark'|bottom-nav)\]|var\(--video-side/.test(l)), 'every dark rule is gated');
});

test('a duration appears on the thumbnail only when the record states it', () => {
  const thumb = read('src/components/CourseThumb.astro');
  assert.match(thumb, /const duration = r\.duration \?/);
  assert.match(thumb, /\{duration && <span class="duration"/);
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
