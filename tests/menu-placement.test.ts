// Where the header's six menus open (Global Navigation hotfix). The side a menu hangs from is a pure decision;
// the clamping to the viewport is CSS. Source guards keep the two halves honest: no CSS anchor positioning (an
// unresolved anchor leaves a top-layer panel without a position, engine by engine), no coordinates per path, and
// a script that stays small, local and progressive. The rendered geometry is measured in a browser (the QA folder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { menuAlign } from '../src/lib/menu-placement.ts';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const header = read('src/components/SiteHeader.astro');
const css = header.slice(header.indexOf('<style>'));
const script = read('src/scripts/menu-placement.ts');
const code = script.replace(/^\s*\/\/.*$/gm, ''); // what runs, not what is said about it

test('a button in the left half opens its panel from its left edge, one in the right half from its right edge', () => {
  // 1440px: the line sits at the right; Fundamental is left of centre, Tecnologia right of it.
  assert.equal(menuAlign({ left: 580, right: 700 }, 1440), 'start');
  assert.equal(menuAlign({ left: 1260, right: 1380 }, 1440), 'end');
  // 1024px, where the six buttons crowd the right: the decision follows the button, not the order.
  assert.equal(menuAlign({ left: 277, right: 390 }, 1024), 'start');
  assert.equal(menuAlign({ left: 830, right: 940 }, 1024), 'end');
  // On the middle line the panel grows toward the middle of the page, never off its edge.
  assert.equal(menuAlign({ left: 500, right: 540 }, 1040), 'start');
  assert.equal(menuAlign({ left: 500, right: 540.1 }, 1040), 'end');
});

test('the stylesheet places every panel with plain coordinates, clamped between the side margins and the notch', () => {
  assert.doesNotMatch(header, /anchor-name|position-anchor|position-area|position-try|anchor\(/, 'no CSS anchor positioning');
  // The same rule for the six: no coordinate is written per path.
  assert.doesNotMatch(css, /#menu-[a-z-]+|\.panel\[data-menu=/);
  for (const side of ['start', 'end']) {
    assert.match(css, new RegExp(`\\.panel\\[data-align='${side}'\\] \\{[^}]*left: clamp\\(var\\(--edge-l\\), [^}]*calc\\(100% - var\\(--panel-w\\) - var\\(--edge-r\\)\\)\\);`), side);
  }
  assert.match(css, /--edge-l: max\(var\(--library-side, var\(--gutter\)\), env\(safe-area-inset-left\)\);/);
  assert.match(css, /--edge-r: max\(var\(--library-side, var\(--gutter\)\), env\(safe-area-inset-right\)\);/);
  assert.match(css, /--panel-w: min\(24rem, calc\(100% - var\(--edge-l\) - var\(--edge-r\)\)\);/);
  // Never a hack: no negative margin and no transform to move a panel into place.
  const panel = /\.panel \{[^}]*\}/.exec(css)?.[0] ?? '';
  assert.match(panel, /position: fixed;/);
  assert.match(panel, /top: calc\(var\(--anchor-bottom, 64px\) \+ 8px\);/);
  assert.match(panel, /right: var\(--edge-r\);/, 'without the script it hangs from the right margin, inside the viewport');
  assert.doesNotMatch(panel, /margin: -|margin-left|translate:|transform:/);
  assert.doesNotMatch(css, /\.panel[^{]*\{[^}]*margin: -/);
});

test('the script is small, local and progressive: it reads one box, writes custom properties, and loads nothing', () => {
  assert.match(script, /if \('showPopover' in HTMLElement\.prototype\)/);
  assert.match(script, /getBoundingClientRect\(\)/);
  for (const property of ['--anchor-left', '--anchor-right', '--anchor-bottom']) assert.match(script, new RegExp(`setProperty\\('${property}'`), property);
  assert.match(script, /dataset\['align'\] = menuAlign\(/);
  // Before the popover is painted, by the button's click and by beforetoggle; again when the viewport changes.
  assert.match(script, /addEventListener\('click', \(\) => place\(panel\)\)/);
  assert.match(script, /addEventListener\('beforetoggle'/);
  assert.match(script, /addEventListener\('resize'/);
  assert.doesNotMatch(code, /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB)\b|document\.cookie|import\s*\(/);
  assert.doesNotMatch(code, /https?:\/\//);
  assert.deepEqual([...code.matchAll(/^import .*$/gm)].map((m) => m[0]), ["import { menuAlign } from '../lib/menu-placement';"]);
  // Nothing in it names a path: one mechanism for the six.
  assert.doesNotMatch(code, /tecnologia|fundamental|ensino-|vestibular|pre-militar/i);
  assert.ok(script.split('\n').length < 45, 'it only places six menus');
});
