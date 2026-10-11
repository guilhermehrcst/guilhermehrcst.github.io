import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('hidden always wins over component display rules', () => {
  assert.ok(/\[hidden\]\s*\{[^}]*display:\s*none\s*!important/mi.test(css));
});
