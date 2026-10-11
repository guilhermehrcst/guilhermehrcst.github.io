import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';

// Nothing is kept out of fear: every component and module is used, every token is read. Text scan of
// imports, no dependency. Declared exceptions are listed by hand, with their reason.
const root = new URL('../', import.meta.url);
const walk = (dir: string): string[] =>
  readdirSync(new URL(dir, root)).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(new URL(path, root)).isDirectory() ? walk(path) : [path];
  });
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const sources = [...walk('src'), ...walk('tests'), 'astro.config.mjs'].filter((p) => /\.(astro|ts|mjs|css)$/.test(p));
const importsOf = (path: string) => [...read(path).matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map((m) => m[1]!);
const imported = new Set(sources.flatMap((p) => importsOf(p).map((spec) => spec.split('/').pop()!.replace(/\.(ts|astro)$/, ''))));

/** Kept on purpose, unused in V0.1: the curated course images wait for a visual decision (spec §2.2).
 *  featured (V0.4 M1): the editorial selection in staging, validated by tests/featured.test.ts until the
 *  path pages render it (M3); remove it from here then. */
const EXCEPTIONS = new Set(['resource-images', 'featured']);

test('every component is used', () => {
  for (const path of walk('src/components')) {
    const name = path.split('/').pop()!.replace(/\.astro$/, '');
    assert.ok(imported.has(name), `orphan component ${path}`);
  }
});

test('every module in src/lib is used, but for the declared exceptions', () => {
  for (const path of walk('src/lib')) {
    const name = path.split('/').pop()!.replace(/\.ts$/, '');
    assert.ok(imported.has(name) || EXCEPTIONS.has(name), `orphan module ${path}`);
  }
});

test('every global token is read somewhere', () => {
  const css = read('src/styles/global.css');
  const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
  const tokens = [...rootBlock.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]!);
  const everything = sources.map(read).join('\n');
  for (const token of tokens) assert.ok(everything.includes(`var(${token})`), `unused token ${token}`);
});

test('every repository path the README cites exists', () => {
  const readme = read('README.md');
  const paths = [...readme.matchAll(/`((?:src|scripts|docs|tests|\.github)\/[^`*{}]+)`/g)].map((m) => m[1]!);
  assert.ok(paths.length > 5);
  for (const path of paths) {
    let exists = true;
    try { statSync(new URL(path, root)); } catch { exists = false; }
    assert.ok(exists, `README cites a missing path: ${path}`);
  }
});
