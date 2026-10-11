import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

// The official Pexis Academy artwork and what is derived from it (scripts/brand-assets.mjs). This test does
// not run sharp: it checks the manifest the script wrote, so a hand-edited or stale file fails here even
// if it looks right.
const root = new URL('../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root));
const manifest = JSON.parse(read('src/assets/brand/manifest.json').toString()) as {
  brandRed: string;
  artwork: { box: { width: number; height: number }; symbol: { width: number; height: number } };
  sha256: Record<string, string>;
};

test('every brand file is exactly what the script generated from the official sources', () => {
  assert.ok(Object.keys(manifest.sha256).length >= 7);
  for (const [path, hash] of Object.entries(manifest.sha256)) {
    assert.ok(existsSync(new URL(path, root)), `${path} exists`);
    assert.equal(createHash('sha256').update(read(path)).digest('hex'), hash, `${path} matches the manifest`);
  }
});

test('the official sources are kept as supplied', () => {
  // The hashes of the two files the owner supplied (2026-10-11): never re-saved, cropped or recoloured.
  assert.equal(manifest.sha256['src/assets/brand/source/pexis-academy-horizontal-white.png'], '1415d3a25dd41cb0eaaedbb0f44ba667dc3e199d2820adf4c9beb7f84c840f21');
  assert.equal(manifest.sha256['src/assets/brand/source/pexis-academy-stacked-red.png'], '868ed4a6580f95c2f9136dc908dce26a524c24227724b9d0969f4f02264036c5');
});

test('the --brand token is the red measured from the official artwork', () => {
  const css = read('src/styles/global.css').toString();
  const brand = /--brand:\s*(#[0-9a-f]{6})/i.exec(css)?.[1]?.toLowerCase();
  assert.equal(brand, manifest.brandRed);
  assert.equal(manifest.brandRed, '#720111');
});

test('the lockup keeps the artwork whole: its proportions are the original box', () => {
  const { box, symbol } = manifest.artwork;
  assert.deepEqual([box.width, box.height], [1481, 413]);
  assert.deepEqual([symbol.width, symbol.height], [477, 413]);
});

test('the page shell links the generated icons, and nothing else stands for the brand', () => {
  const base = read('src/layouts/Base.astro').toString();
  assert.ok(base.includes('href="/favicon-32.png"'), 'favicon');
  assert.ok(base.includes('href="/apple-touch-icon.png"'), 'apple touch icon');
  assert.ok(!existsSync(new URL('public/favicon.svg', root)), 'the temporary "P" favicon is gone');
  const header = read('src/components/SiteHeader.astro').toString();
  assert.ok(!/sig-a|sig-b/.test(header), 'the temporary typographic signature is gone');
});
