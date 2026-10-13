import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import release from '../src/data/academy-release/release.json' with { type: 'json' };
import { MILITARY_L003_AUTHORIZES_PUBLICATION, MILITARY_L003_CANDIDATES } from '../src/lib/staging-military.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { catalogue, publishedResources, RELEASE, resourceProblems } from '../src/lib/learning-resources.ts';
import { PATH_STATUS } from '../src/lib/taxonomy.ts';
import { placementOf } from '../src/lib/placement.ts';

const previous = GATEB_NEW_RESOURCES.filter(r => r.paths.includes('pre-militar'));
const all = [...previous, ...MILITARY_L003_CANDIDATES];
const ids = all.map(r => r.id);

test('L003 proposes exactly 12 study/exercise records and 8 official past-exam records', () => {
  assert.equal(previous.length, 9);
  assert.equal(previous.filter(r => r.format === 'past-exam').length, 8);
  assert.equal(MILITARY_L003_CANDIDATES.length, 11);
  assert.equal(all.length, 20);
  assert.equal(all.filter(r => r.format === 'past-exam').length, 8);
  assert.equal(all.filter(r => r.format !== 'past-exam').length, 12);
  assert.equal(MILITARY_L003_CANDIDATES.filter(r => r.format === 'playlist').length, 5);
  assert.equal(new Set(ids).size, 20);
  assert.equal(new Set(all.map(r => r.url)).size, 20);
  assert.ok(all.every(r => r.paths.length === 1 && r.paths[0] === 'pre-militar'));
});

test('new records remain individual unverified candidates, structurally valid and without duplicates', () => {
  assert.equal(MILITARY_L003_AUTHORIZES_PUBLICATION, false);
  const legacy = [...catalogue, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES];
  const existingIDs = new Set(legacy.map(r => r.id));
  const existingURLs = new Set(legacy.map(r => r.url));
  for (const r of MILITARY_L003_CANDIDATES) {
    assert.ok(r.url?.startsWith('https://'), r.id);
    assert.ok(!existingIDs.has(r.id), r.id);
    assert.ok(!existingURLs.has(r.url), r.id);
    assert.equal(r.verified, undefined, 'opened index != verified content');
    assert.equal(r.registration, 'unconfirmed');
    assert.equal(r.certificate, 'unconfirmed');
    assert.ok((r.review?.length ?? 0) >= 40, r.id);
    assert.deepEqual(resourceProblems(r), [], r.id);
    assert.equal(placementOf(r)?.page, '/pre-militar/', r.id);
    assert.equal(RELEASE.states.get(r.id), 'candidate', r.id);
  }
});

test('staging never changes 44 publicly published resources, or Fundamental preparation', () => {
  assert.equal(release.mode, 'production');
  assert.equal(release.inventory.length, 44);
  assert.deepEqual(release.applied.map(p => p.lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.deepEqual(release.ledger, release.applied);
  assert.equal(publishedResources.length, 44);
  assert.deepEqual(RELEASE.problems, []);
  const publishedIDs = new Set(publishedResources.map(r => r.id));
  for (const id of ids) assert.ok(!publishedIDs.has(id), id);
  assert.equal(PATH_STATUS['pre-militar'], 'active');
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
});

test('candidate CSV represents every item exactly once and classifies it correctly', () => {
  const csv = readFileSync(new URL('../docs/academy/research/l003-pre-militar-20-candidatos-2026-10-13.csv', import.meta.url), 'utf8');
  const lines = csv.trimEnd().split('\n');
  assert.equal(lines.length, 21);
  const rows = lines.slice(1).map(line => line.split(';'));
  assert.ok(rows.every(row => row.length === 8));
  assert.deepEqual(rows.map(r => r[0]).sort(), [...ids].sort());
  for (const row of rows) {
    assert.ok(all.some(r => r.id === row[0] && r.url === row[3] && r.format === row[4]), row[0]);
    assert.match(row[6]!, /aguardando|pendente/);
  }
});
