// The global navigation (V1): six paths in the owner's order, three kinds of content each, derived from the
// published catalogue. A kind with nothing published links nowhere; practice is never a prova; a reference
// is a book only by an editorial classification of a published reference.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK_CLASSIFICATIONS, bookKindOf, validateBooks } from '../src/lib/books.ts';
import { CONTENT_TYPES, contentTypeOf, countOf, globalNav, libraryViews, NAV_PATHS, navPathOf, viewHref, viewId } from '../src/lib/global-nav.ts';
import { publishedResources, type PublishedLearningResource } from '../src/lib/learning-resources.ts';
import { canonicalPaths, preparingPaths } from '../src/lib/routes.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { MILITARY_L003_CANDIDATES } from '../src/lib/staging-military.ts';
import { PATH_ORDER, PREPARING_PATHS } from '../src/lib/taxonomy.ts';

const fake = (id: string, format: PublishedLearningResource['format'], paths: PublishedLearningResource['paths']): PublishedLearningResource =>
  ({ ...publishedResources[0]!, id, format, paths });

test('the six paths, in the order the owner set, with their short names', () => {
  assert.deepEqual(globalNav().map((m) => [m.label, m.explore]), [
    ['Fundamental', '/ensino-fundamental/'],
    ['Médio', '/ensino-medio/'],
    ['Pré-Militar', '/pre-militar/'],
    ['Vestibular', '/vestibulares/'],
    ['Superior', '/ensino-superior/'],
    ['Tecnologia', '/tecnologia/'],
  ]);
  assert.deepEqual([...NAV_PATHS].sort(), [...PATH_ORDER].sort());
  for (const menu of globalNav()) {
    assert.deepEqual(menu.entries.map((e) => e.type), ['cursos', 'livros', 'provas']);
    assert.ok([...canonicalPaths(), ...preparingPaths()].includes(menu.explore), menu.explore);
  }
});

test('every count is the catalogue, and a kind with nothing published links nowhere', () => {
  for (const menu of globalNav()) {
    for (const entry of menu.entries) {
      const expected = PREPARING_PATHS.includes(menu.id) ? 0 : publishedResources.filter((r) => r.paths.includes(menu.id) && contentTypeOf(r) === entry.type).length;
      assert.equal(entry.count, expected, `${menu.id} ${entry.type}`);
      assert.equal(entry.href, expected > 0 ? viewHref(entry.type, menu.id) : null, `${menu.id} ${entry.type}`);
    }
  }
  // A path in preparation offers nothing yet, and nothing published serves it (so its views agree).
  for (const path of PREPARING_PATHS) {
    assert.ok(globalNav().find((m) => m.id === path)!.entries.every((e) => e.href === null), path);
    assert.ok(!publishedResources.some((r) => r.paths.includes(path)), path);
  }
});

test('the state of the catalogue today: no book yet, provas only where past exams are published', () => {
  const hrefs = (type: string) => globalNav().filter((m) => m.entries.find((e) => e.type === type)!.href).map((m) => m.id);
  assert.deepEqual(hrefs('livros'), [], 'no reading material has passed the editorial check');
  assert.deepEqual(hrefs('provas'), ['pre-militar', 'vestibulares']);
  assert.deepEqual(hrefs('cursos'), ['ensino-medio', 'vestibulares', 'ensino-superior', 'tecnologia']);
});

test('practice is never a prova, a reference is never a book by itself', () => {
  assert.equal(contentTypeOf(fake('x', 'practice', ['vestibulares'])), null);
  assert.equal(contentTypeOf(fake('x', 'reference', ['vestibulares'])), null);
  assert.equal(contentTypeOf(fake('x', 'past-exam', ['vestibulares'])), 'provas');
  assert.equal(contentTypeOf(fake('x', 'simulator', ['vestibulares'])), 'provas');
  for (const format of ['course', 'track', 'playlist', 'lessons', 'lesson'] as const) assert.equal(contentTypeOf(fake('x', format, ['tecnologia'])), 'cursos');
  // Published practice exists and counts nowhere.
  const practice = publishedResources.filter((r) => r.format === 'practice');
  assert.ok(practice.length > 0);
  for (const r of practice) assert.equal(contentTypeOf(r), null, r.id);
});

test('a classified reference is a book; the classification is checked against the published catalogue', () => {
  const ref = fake('atlas-x', 'reference', ['ensino-medio']);
  const books = [{ id: 'atlas-x', kind: 'livro' as const }];
  assert.equal(contentTypeOf(ref, books), 'livros');
  assert.equal(countOf('livros', 'ensino-medio', [ref], books), 1);
  assert.equal(countOf('livros', 'vestibulares', [ref], books), 0);
  assert.equal(globalNav([ref], books).find((m) => m.id === 'ensino-medio')!.entries[1]!.href, '/materiais/?caminho=ensino-medio&tipo=livros#livros-ensino-medio');
  assert.equal(bookKindOf('atlas-x', books), 'livro');
  validateBooks(books, [ref]); // throws on a wrong classification
  assert.throws(() => validateBooks(books, []), /not a published resource/);
  assert.throws(() => validateBooks([{ id: 'c', kind: 'livro' }], [fake('c', 'course', ['tecnologia'])]), /not a reference/);
  assert.throws(() => validateBooks([...books, ...books], [ref]), /twice/);
  assert.throws(() => validateBooks([{ id: 'atlas-x', kind: 'revista' as never }], [ref]), /unknown kind/);
});

test('the approved books are published references, and no candidate is one', () => {
  validateBooks(BOOK_CLASSIFICATIONS, publishedResources); // throws on a wrong classification
  const candidates = new Set([...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES, ...MILITARY_L003_CANDIDATES].map((r) => r.id));
  const published = new Set(publishedResources.map((r) => r.id));
  for (const { id } of BOOK_CLASSIFICATIONS) assert.ok(published.has(id) || !candidates.has(id), id);
});

test('views: one URL per kind and path, on the library that holds the kind', () => {
  assert.equal(viewHref('cursos', 'vestibulares'), '/cursos/?caminho=vestibulares#cursos-vestibulares');
  assert.equal(viewHref('provas', 'pre-militar'), '/materiais/?caminho=pre-militar&tipo=provas#provas-pre-militar');
  assert.equal(viewId('livros', 'ensino-medio'), 'livros-ensino-medio');
  assert.deepEqual(libraryViews('cursos').map((v) => v.id), NAV_PATHS.map((p) => `cursos-${p}`));
  assert.deepEqual(libraryViews('materiais').map((v) => v.id), [...NAV_PATHS.map((p) => `livros-${p}`), ...NAV_PATHS.map((p) => `provas-${p}`)]);
  for (const library of ['cursos', 'materiais'] as const) {
    for (const v of libraryViews(library)) assert.equal(v.count, countOf(v.type, v.path), v.id);
  }
  assert.deepEqual([...CONTENT_TYPES], ['cursos', 'livros', 'provas']);
});

test('the current path: its page, or an exam inside it; nothing else', () => {
  for (const path of PATH_ORDER) assert.equal(navPathOf(`/${path}/`), path);
  assert.equal(navPathOf('/enem/'), 'vestibulares');
  assert.equal(navPathOf('/uerj/'), 'vestibulares');
  for (const page of ['/', '/cursos/', '/materiais/', '/materias/', '/materias/fisica/', '/buscar/', '/sobre/', '/pt/cursos/']) assert.equal(navPathOf(page), null, page);
});
