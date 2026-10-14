// The header (V0.5), read from its source: the Home's identity kept (official lockup, brand wine, sticky,
// sans navigation), native menus without JavaScript, search as a named icon, one line from 720px.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../src/components/SiteHeader.astro', import.meta.url), 'utf8');
const css = header.slice(header.indexOf('<style>'));

test('the identity of the Home: the official white lockup linked home, on the sticky brand wine', () => {
  assert.match(header, /import lockup from '\.\.\/assets\/brand\/lockup-white\.png'/);
  assert.match(header, /<a class="brand" href=\{routes\.home\}[^>]*data-brand>/);
  assert.match(css, /\.site-header \{[^}]*position: sticky;[^}]*background: var\(--brand\);/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'colours come from the tokens only');
  assert.doesNotMatch(css, /font-family: (?!var\()/, 'type comes from the tokens only');
});

test('menus are native <details>, with no script: keyboard and touch work without JavaScript', () => {
  assert.doesNotMatch(header, /<script\b/);
  for (const menu of ['explorar', 'mobile', 'mobile-explorar']) assert.match(header, new RegExp(`<details class="[^"]+" data-menu="${menu}">`));
  assert.match(header, /\{t\.nav\.choose\}/, 'the Explorar panel is titled');
  assert.match(header, /\{t\.nav\.explorePaths\}/);
});

test('search is a magnifying glass with a name for assistive tech, at every width', () => {
  assert.equal((header.match(/<MagnifyingGlassIcon width=\{20\} height=\{20\} \/><span class="sr-only">\{t\.nav\.search\}<\/span>/g) ?? []).length, 2);
  assert.match(css, /\.search \{[^}]*min-width: 44px;/);
});

test('one line from 720px (iPad portrait), the Menu button below it', () => {
  assert.match(css, /@media \(min-width: 720px\) \{ \.desktop \{ display: block; \} \.compact \{ display: none; \} \}/);
  assert.match(css, /\.link, \.explore > summary, \.mobile > summary \{[^}]*min-height: 44px;[^}]*white-space: nowrap;/);
});
