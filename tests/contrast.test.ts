import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { contrast } from '../src/lib/contrast.ts';

// Contrast is measured, not estimated (spec §6.7, R8). WCAG 2.x: 4.5:1 for text, 7:1 for body ink.
const root = new URL('../', import.meta.url);
const css = readFileSync(new URL('src/styles/global.css', root), 'utf8');
const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
const token = (name: string): string => {
  const value = new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(rootBlock)?.[1];
  assert.ok(value, `--${name} is a hex token`);
  return value!;
};

test('the contrast function matches a known reference', () => {
  assert.ok(Math.abs(contrast('#ffffff', '#0b57d0') - 6.4) < 0.05, String(contrast('#ffffff', '#0b57d0')));
  assert.equal(Math.round(contrast('#000000', '#ffffff') * 100) / 100, 21);
  assert.equal(contrast('#777777', '#777777'), 1);
});

const pairs: [string, string, number][] = [
  ['ink', 'paper', 7], ['ink', 'surface', 7],
  ['muted', 'paper', 4.5], ['muted', 'surface', 4.5],
  ['action', 'paper', 4.5], ['action', 'surface', 4.5], ['action-hover', 'paper', 4.5],
  ['on-action', 'action', 4.5], ['on-action', 'action-hover', 4.5],
  ['ink', 'raised', 7], ['muted', 'raised', 4.5], ['action', 'raised', 4.5],
  ['ink', 'tint-brand', 7], ['muted', 'tint-brand', 4.5], ['action', 'tint-brand', 4.5],
  // The official artwork is white on the brand red; text set on the plate uses --on-action.
  ['on-action', 'brand', 7],
  // The institutional header and footer (V0.3): text and secondary text on the wine, at rest and on hover.
  ['on-brand', 'brand', 7], ['on-brand-muted', 'brand', 4.5],
  ['on-brand', 'brand-deep', 7], ['on-brand-muted', 'brand-deep', 4.5],
  // The menus open on paper panels under the wine header.
  ['ink', 'raised', 7], ['action', 'raised', 4.5],
  ['ink', 'tint-sand', 7], ['muted', 'tint-sand', 4.5],
  // The video library (/cursos/, V0.7): text, metadata and chips on the dark ground and its surfaces.
  ['video-ink', 'video-bg', 7], ['video-muted', 'video-bg', 4.5],
  ['video-ink', 'video-surface', 7], ['video-muted', 'video-surface', 4.5],
  ['video-ink', 'video-surface-hover', 4.5], ['video-bg', 'video-ink', 7],
];
for (const [fg, bg, min] of pairs) {
  test(`--${fg} on --${bg} is at least ${min}:1`, () => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(ratio >= min, `${ratio.toFixed(2)}:1`);
  });
}

test('no hex colour outside :root, but the theme-color meta, which equals --paper', () => {
  const walk = (dir: string): string[] => readdirSync(new URL(dir, root)).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(new URL(path, root)).isDirectory() ? walk(path) : [path];
  });
  for (const path of walk('src').filter((p) => /\.(astro|css)$/.test(p))) {
    let text = readFileSync(new URL(path, root), 'utf8');
    if (path.endsWith('global.css')) text = text.replace(rootBlock, '');
    const theme = /<meta name="theme-color" content="(#[0-9a-f]{6})">/i.exec(text);
    if (theme) {
      assert.equal(theme[1]!.toLowerCase(), token('paper'), 'theme-color equals --paper');
      text = text.replace(theme[0], '');
    }
    // The video library's dark theme (V0.7): the theme colour follows the page, --video-bg or --paper.
    const themed = /<meta name="theme-color" content=\{theme === 'dark' \? '(#[0-9a-f]{6})' : '(#[0-9a-f]{6})'\}>/i.exec(text);
    if (themed) {
      assert.equal(themed[1]!.toLowerCase(), token('video-bg'), 'the dark theme-color equals --video-bg');
      assert.equal(themed[2]!.toLowerCase(), token('paper'), 'theme-color equals --paper');
      text = text.replace(themed[0], '');
    }
    assert.ok(!/#[0-9a-f]{3,8}\b(?![\w-])/i.test(text.replace(/href="#[^"]*"|`#\$\{[^}]*\}`|'#[a-z-]*'/g, '')), `hex colour in ${path}`);
  }
});

test('one action colour, and it is the brand red (the official mark leads; no blue competes)', () => {
  assert.equal(token('action'), token('brand'));
  assert.ok(!/#0c5fe8/i.test(css), 'the former blue is gone');
});
