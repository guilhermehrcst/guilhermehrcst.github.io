import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPaths, EXPLORE_MENU, HEADER_NAV, LEGACY_REDIRECTS, preparingPaths, routes, sectionOf } from '../src/lib/routes.ts';

// Written out by hand on purpose: an independent barrier against an accidental change to routes.ts
// (spec R10). scripts/verify-dist.mjs carries its own copy.
const CANONICAL = [
  '/', '/ensino-medio/', '/vestibulares/', '/enem/', '/uerj/', '/pre-militar/', '/ensino-superior/', '/tecnologia/', '/materias/',
  '/materias/matematica/', '/materias/portugues/', '/materias/redacao/',
  '/materias/fisica/', '/materias/quimica/', '/materias/biologia/',
  '/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/',
  '/materias/ingles/', '/materias/espanhol/',
  '/cursos/', '/materiais/',
  '/buscar/', '/sobre/',
];

test('the 25 canonical routes, exactly and in a stable order', () => {
  assert.deepEqual(canonicalPaths(), CANONICAL);
  assert.deepEqual(canonicalPaths(), canonicalPaths());
});

test('the paths in preparation have pages but are not canonical (noindex, out of the sitemap)', () => {
  assert.deepEqual(preparingPaths(), ['/ensino-fundamental/']);
  for (const path of preparingPaths()) assert.ok(!canonicalPaths().includes(path), path);
  assert.equal(routes.objective('pre-militar'), '/pre-militar/');
  assert.equal(routes.objective('ensino-superior'), '/ensino-superior/');
});

test('every route is lowercase, unaccented, slash-terminated and unique', () => {
  for (const path of canonicalPaths()) assert.ok(/^\/([a-z]+(-[a-z]+)*\/)*$/.test(path), path);
  assert.equal(new Set(canonicalPaths()).size, canonicalPaths().length);
});

test('technology lives at /tecnologia/ only', () => {
  assert.equal(routes.subject('tecnologia'), '/tecnologia/');
  assert.equal(routes.objective('tecnologia'), '/tecnologia/');
  assert.ok(!canonicalPaths().includes('/materias/tecnologia/'));
  assert.equal(routes.subject('quimica'), '/materias/quimica/');
});

test('an unpublished topic has no route', () => {
  let threw = false;
  try { routes.topic('matematica', 'funcoes'); } catch { threw = true; }
  assert.ok(threw);
});

test('legacy routes redirect to existing canonical pages; the résumé is gone', () => {
  assert.deepEqual(LEGACY_REDIRECTS, {
    '/pt/': '/',
    '/courses/': '/materias/',
    '/pt/cursos/': '/materias/',
    '/courses/enem/': '/enem/',
    '/pt/cursos/enem/': '/enem/',
    '/courses/uerj/': '/uerj/',
    '/pt/cursos/uerj/': '/uerj/',
  });
  for (const to of Object.values(LEGACY_REDIRECTS)) assert.ok(canonicalPaths().includes(to), to);
  assert.ok(!('/resume/' in LEGACY_REDIRECTS));
  assert.ok(!('/pt/curriculo/' in LEGACY_REDIRECTS));
});

test('the header (V0.5): Cursos, Materiais, then the Explorar menu with the six paths and nothing else', () => {
  assert.deepEqual(HEADER_NAV.map((item) => [item.label, item.href]), [
    ['Cursos', '/cursos/'],
    ['Materiais', '/materiais/'],
  ]);
  assert.equal(EXPLORE_MENU.label, 'Explorar');
  assert.deepEqual(EXPLORE_MENU.items.map((item) => [item.label, item.href]), [
    ['Ensino Fundamental', '/ensino-fundamental/'],
    ['Ensino Médio', '/ensino-medio/'],
    ['Vestibular', '/vestibulares/'],
    ['Pré-Militar', '/pre-militar/'],
    ['Ensino Superior', '/ensino-superior/'],
    ['Tecnologia', '/tecnologia/'],
  ]);
  assert.ok(!('all' in EXPLORE_MENU), 'the menu lists the six paths only');
  assert.equal(routes.search, '/buscar/');
  // Every destination of the header is a page that is built.
  for (const href of [...HEADER_NAV, ...EXPLORE_MENU.items].map((i) => i.href)) {
    assert.ok([...canonicalPaths(), ...preparingPaths()].includes(href), href);
  }
});

test('a section of the header is current on its own page and on the pages inside it', () => {
  assert.equal(sectionOf('/cursos/'), 'cursos');
  assert.equal(sectionOf('/materiais/'), 'materiais');
  assert.equal(sectionOf('/buscar/'), 'buscar');
  for (const path of ['/ensino-fundamental/', '/ensino-medio/', '/vestibulares/', '/enem/', '/uerj/', '/pre-militar/', '/ensino-superior/', '/tecnologia/', '/materias/', '/materias/fisica/']) {
    assert.equal(sectionOf(path), 'explorar', path);
  }
  assert.equal(sectionOf('/'), null);
  assert.equal(sectionOf('/sobre/'), null);
  // A legacy route that once meant "courses" is not the new library.
  assert.equal(sectionOf('/pt/cursos/'), null);
});
