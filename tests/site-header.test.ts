// The header (Global Navigation V1), read from its source: the Home's identity kept (official lockup, brand
// wine, sticky, sans navigation), the six paths as buttons that open native popovers, a compact Menu of native
// <details>, search as a named icon, and one small progressive script that only places the popovers under their
// buttons. The built HTML is checked by scripts/verify-dist.mjs.
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
  assert.doesNotMatch(css, /prefers-color-scheme|data-theme/, 'one theme');
});

test('six buttons open six popovers; the menus come from the catalogue model, never typed', () => {
  // The menus work natively; the one script only places them (src/scripts/menu-placement.ts, tested apart).
  assert.equal((header.match(/<script\b/g) ?? []).length, 1);
  assert.match(header, /<script>\s*import '\.\.\/scripts\/menu-placement';\s*<\/script>/);
  assert.match(header, /const menus = globalNav\(\);/);
  assert.match(header, /<button\s+type="button"\s+class:list=\{\['trigger'[^>]*popovertarget=\{`menu-\$\{menu\.id\}`\}/);
  assert.match(header, /<div class="panel" id=\{`menu-\$\{menu\.id\}`\} popover /);
  // A kind with nothing published is a paragraph that says so, never a link.
  assert.equal((header.match(/\{entry\.href \? \(\s*<a class="entry" href=\{entry\.href\}/g) ?? []).length, 2);
  assert.equal((header.match(/<p class="entry empty" data-entry=\{entry\.type\}>/g) ?? []).length, 2);
  assert.equal((header.match(/<span class="state" data-entry-state>\{t\.preparing\.label\}<\/span>/g) ?? []).length, 2);
});

test('the compact menu: a <details> sheet, the six paths as an accordion of <details>, then the libraries', () => {
  assert.match(header, /<details class="mobile" data-menu="mobile">/);
  assert.match(header, /<details class="sheet-path" name="caminho" data-menu=\{`mobile-\$\{menu\.id\}`\}/);
  assert.match(header, /<div class="sheet-libraries" data-sheet-libraries>/);
  // At 320px (the reflow width) the button keeps its name for assistive tech and only its icon for sight.
  assert.match(header, /<span class="menu-label">\{n\.menu\}<\/span><\/summary>/);
  assert.match(css, /@media \(max-width: 359px\) \{\s*\.mobile > summary \{[^}]*width: 44px;[^}]*\}\s*\.menu-label \{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset\(50%\);/);
  // Clear of a notch and of the home indicator.
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});

test('search is a magnifying glass with a name for assistive tech, at every width', () => {
  assert.equal((header.match(/<MagnifyingGlassIcon width=\{20\} height=\{20\} \/><span class="sr-only">\{n\.search\}<\/span>/g) ?? []).length, 2);
  assert.match(css, /\.search \{[^}]*min-width: 44px;/);
});

test('one line from 1024px where popovers exist; else the Menu button (the safe state)', () => {
  assert.match(css, /@media \(min-width: 1024px\) \{\s*@supports selector\(:popover-open\) \{\s*\.desktop \{ display: block; \}\s*\.compact \{ display: none; \}/);
  assert.match(css, /\.desktop \{ display: none; \}/);
  assert.match(css, /\.trigger, \.link, \.mobile > summary \{[^}]*min-height: 44px;[^}]*white-space: nowrap;/);
  // A selector a browser does not know drops its whole rule: :popover-open never shares one.
  for (const rule of css.match(/[^{}]*:popover-open[^{}]*\{/g) ?? []) assert.doesNotMatch(rule, /,\s*(?![^()]*\))/, rule);
});

test('the bottom navigation and the header never offer the same place twice', () => {
  assert.match(css, /@media \(max-width: 1023px\) \{[^}]*html\[data-bottom-nav\]\) \.compact > \.search,\s*:global\(html\[data-bottom-nav\]\) \.sheet-libraries \{ display: none; \}/);
  assert.match(readFileSync(new URL('../src/components/BottomNav.astro', import.meta.url), 'utf8'), /@media \(min-width: 1024px\) \{\s*\.bottom-nav \{ display: none; \}/);
});
