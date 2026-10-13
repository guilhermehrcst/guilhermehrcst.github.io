// The repository's actual L001 (six) + ITA-only L002 (one) authorized release state, and the
// build's independent verification wiring. Neither release implies merge to main or deployment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

import baseline from '../../src/data/academy-release/baseline.json' with { type: 'json' };
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import l001 from '../../src/data/academy-release/lots/L001-plano-b.json' with { type: 'json' };
import l002 from '../../src/data/academy-release/lots/L002-ita-pre-militar.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { lotProblems } from '../../src/lib/release/engine.ts';
import { catalogue, isPublishedResource, publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { lotOf, NOW, record } from './fixtures.ts';

const L001_IDS = [
  'inep-enem-provas-gabaritos', 'fuvest-acervo-2026', 'mit-1801sc',
  'yale-psyc-110', 'odin-foundations', 'ms-learn-cloud-concepts',
];

test('L001 plus precisely authorized ITA L002 publish 44 resources in the isolated release branch', () => {
  assert.equal(release.mode, 'production');
  assert.equal(l001.schema, 'pexis-academy-lot/1');
  assert.equal(l001.lot, 'L001-plano-b');
  assert.equal(l001.simulation, false);
  assert.deepEqual(l001.entries.map((entry) => entry.id), L001_IDS);
  for (const entry of l001.entries) {
    assert.equal(entry.decision, 'approved', entry.id);
    assert.equal(entry.decidedBy, 'Guilherme Henrique', entry.id);
    assert.equal(entry.decidedOn, '2026-10-12', entry.id);
  }
  assert.deepEqual(l001.authorization, { by: 'Guilherme Henrique', on: '2026-10-12' });
  assert.equal(l002.lot, 'L002-ita-pre-militar');
  assert.equal(l002.simulation, false);
  assert.deepEqual(l002.entries.map((entry) => entry.id), ['ita-provas-anteriores']);
  assert.equal(l002.entries[0]?.decision, 'approved');
  assert.equal(l002.entries[0]?.digest, digestOf(record('ita-provas-anteriores')));
  assert.deepEqual(l002.authorization, { by: 'Guilherme Henrique', on: '2026-10-12' });
  const pins = [l001, l002].map((lot) => ({ lot: lot.lot, digest: digestOf(lot) }));
  assert.deepEqual(release.applied, pins, 'authorization pins both exact manifests');
  assert.deepEqual(release.ledger, pins, 'the append-only ledger retains both authorizations');
  const expected = [...Object.keys(baseline.records), ...L001_IDS, 'ita-provas-anteriores'].sort();
  assert.equal(expected.length, 44);
  assert.equal(new Set(expected).size, 44, 'no duplicated resource');
  assert.deepEqual(release.inventory, expected);
  assert.deepEqual(publishedResources.map((resource) => resource.id).sort(), expected);
  assert.equal(RELEASE.states.get('ita-provas-anteriores'), 'published');
  assert.equal(RELEASE.ifApplied.has('ita-provas-anteriores'), false);
  assert.deepEqual(RELEASE.problems, []);
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


test('the prepared launch change sets still apply to this tree (docs/academy/launch), while no lot is applied', () => {
  if (release.applied.length > 0) return; // after the first lot the kit has done its job
  for (const plan of ['plan-a', 'plan-b']) {
    const out = execFileSync('git', ['apply', '--check', '--verbose', `docs/academy/launch/${plan}.patch`], { encoding: 'utf8', cwd: new URL('../../', import.meta.url).pathname });
    assert.doesNotMatch(out, /error/i, plan);
  }
});
