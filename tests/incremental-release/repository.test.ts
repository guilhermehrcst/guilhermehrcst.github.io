// The repository's own release state (this PR adds the engine and publishes nothing) and the wiring the
// build and the independent verifier rely on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

import baseline from '../../src/data/academy-release/baseline.json' with { type: 'json' };
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { lotProblems } from '../../src/lib/release/engine.ts';
import { catalogue, isPublishedResource, publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { lotOf, NOW, record } from './fixtures.ts';

test('this PR applies no lot: production mode, nothing applied, the inventory is the 37 of V0.4', () => {
  assert.equal(release.mode, 'production');
  assert.deepEqual(release.applied, []);
  assert.deepEqual(release.inventory, Object.keys(baseline.records).sort());
  assert.deepEqual(release.inventory, catalogue.filter(isPublishedResource).map((r) => r.id).sort());
  assert.deepEqual(RELEASE.problems, []);
  assert.deepEqual(publishedResources.map((r) => r.id), catalogue.filter(isPublishedResource).map((r) => r.id), 'same records, same order');
});

test('the baseline locks each of the 37 to the record as typed today', () => {
  for (const r of catalogue.filter(isPublishedResource)) assert.equal(baseline.records[r.id as keyof typeof baseline.records], digestOf(r), r.id);
});

test('every lot manifest on disk is registered, in order, and none is registered without its file', () => {
  const dir = new URL('../../src/data/academy-release/lots/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const names = LOT_MANIFESTS.map((lot) => `${(lot as { lot: string }).lot}.json`);
  assert.deepEqual(names, files);
  for (const file of files) assert.deepEqual(JSON.parse(readFileSync(new URL(file, dir), 'utf8')), LOT_MANIFESTS[files.indexOf(file)], file);
});

test('the independent verifier reads the same release manifest and refuses a simulated release', () => {
  const verifier = readFileSync(new URL('../../scripts/verify-dist.mjs', import.meta.url), 'utf8');
  assert.match(verifier, /academy-release\//);
  assert.match(verifier, /a simulated release is never published/);
  assert.match(verifier, /the suspended resource \$\{id\} is still in dist/);
  assert.doesNotMatch(verifier, /staging/, 'the verifier never reads the candidate records');
});

test('the operator tool prints only skeletons the schema refuses until a person decides', () => {
  const printed = execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', 'tools/academy-release.ts', 'entry', 'google-mlcc'], { encoding: 'utf8' });
  const entry = JSON.parse(printed);
  assert.equal(entry.digest, digestOf(record('google-mlcc')));
  const problems = lotProblems({ ...lotOf('L001-rascunho', []), simulation: false, authorization: null, entries: [entry] }, NOW).join('\n');
  assert.match(problems, /is not a decision/);
  assert.match(problems, /decidedOn: .* is not a date/);
  for (const field of ['entries[0].evidence.version', 'entries[0].decision', 'entries[0].decidedBy', 'entries[0].decidedOn']) {
    assert.match(problems, new RegExp(`${field.replace(/[.[\]]/g, '\\$&')} is still a placeholder`), field);
  }
});

test('the operator tool reads records without the projection, so it works while a record change is unapproved (Codex review)', () => {
  const tool = readFileSync(new URL('../../tools/academy-release.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(tool, /^import [^;]*learning-resources/m, 'no static import of the projection');
  const records = readFileSync(new URL('../../src/lib/catalogue-records.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(records, /^import (?!type )/m, 'the records module imports types only');
  assert.doesNotMatch(records, /projectRelease|throw new Error\(`learning-resources: release/, 'the records module never projects');
});

