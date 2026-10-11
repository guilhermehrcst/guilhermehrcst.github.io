import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalPaths, HEADER_NAV, LEGACY_REDIRECTS, routes } from '../src/lib/routes.ts';

// Written out by hand on purpose: an independent barrier against an accidental change to routes.ts
// (spec R10). scripts/verify-dist.mjs carries its own copy.
const CANONICAL = [
  '/', '/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/', '/materias/',
  '/materias/matematica/', '/materias/portugues/', '/materias/redacao/',
  '/materias/fisica/', '/materias/quimica/', '/materias/biologia/',
  '/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/',
  '/materias/ingles/', '/materias/espanhol/',
  '/buscar/', '/sobre/',
];

test('the 21 canonical routes, exactly and in a stable order', () => {
  assert.deepEqual(canonicalPaths(), CANONICAL);
  assert.deepEqual(canonicalPaths(), canonicalPaths());
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

test('the header navigation, in order', () => {
  assert.deepEqual(HEADER_NAV.map((item) => [item.label, item.href]), [
    ['Explorar', '/materias/'],
    ['ENEM', '/enem/'],
    ['UERJ', '/uerj/'],
    ['Tecnologia', '/tecnologia/'],
    ['Buscar', '/buscar/'],
  ]);
});
