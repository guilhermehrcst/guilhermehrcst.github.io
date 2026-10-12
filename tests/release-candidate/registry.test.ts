import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The staging-guard registry names real tests: a renamed or removed guard must be reflected here, so the
// list a release works through stays exact (V0.4 QA).
test('every staging guard listed in STAGING-GUARDS.md is a test that exists', () => {
  const md = readFileSync(new URL('./STAGING-GUARDS.md', import.meta.url), 'utf8');
  const rows = [...md.matchAll(/^\| `([^`]+)` \| (.+) \| [AB] \|$/gm)];
  assert.equal(rows.length, 41);
  for (const [, file, name] of rows) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(source.includes(name!.replace(/\\\|/g, '|')), `${file}: "${name}"`);
  }
});
