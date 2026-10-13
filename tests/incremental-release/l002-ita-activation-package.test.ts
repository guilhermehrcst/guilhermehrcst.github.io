// The original ITA activation patch was applied atomically with the human-authorized L002
// on this isolated release branch. This suite verifies the exact scope, release pin and
// absence of accidental Fundamental activation, but never authorizes merge to main/deploy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import plan from '../../docs/academy/launch/l002-ita-only-plan.json' with { type: 'json' };
import lot from '../../src/data/academy-release/lots/L002-ita-pre-militar.json' with { type: 'json' };
import release from '../../src/data/academy-release/release.json' with { type: 'json' };
import { LOT_MANIFESTS } from '../../src/lib/release/lots.ts';
import { publishedResources, RELEASE } from '../../src/lib/learning-resources.ts';
import { PATH_STATUS, PREPARING_PATHS } from '../../src/lib/taxonomy.ts';
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../../src/lib/featured.ts';
import { activationProblems } from '../../src/lib/path-status.ts';
import { canonicalPaths, preparingPaths } from '../../src/lib/routes.ts';
import { digestOf } from '../../src/lib/release/canonical.ts';
import { record } from './fixtures.ts';

const ROOT = new URL('../../', import.meta.url).pathname;
const FILE = 'docs/academy/launch/l002-ita-activation.patch';
const patch = readFileSync(new URL('../../' + FILE, import.meta.url), 'utf8');

test('branch-only activation and L002 application were separately authorized; public deploy is pending', () => {
  assert.equal(plan.previewOnly, false);
  assert.equal(plan.lot, 'L002-ita-pre-militar');
  assert.equal(plan.editorialApproval, 'approved');
  assert.equal(plan.activationApproval, 'approved');
  assert.equal(plan.activationApprovalScope, 'release-branch-only');
  assert.equal(plan.activationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.activationApprovedOn, '2026-10-12');
  assert.equal(plan.activationExecution, 'applied-in-release-branch');
  assert.equal(plan.lotApplicationApproval, 'approved');
  assert.equal(plan.lotApplicationScope, 'release-branch-only');
  assert.equal(plan.lotApplicationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.lotApplicationApprovedOn, '2026-10-12');
  assert.equal(plan.appliedManifestDigest, digestOf(lot));
  assert.equal(plan.publicationAuthorization, 'pending');
  assert.equal(plan.activationPreparation.status, 'patch-applied-in-release-branch');
  assert.equal(plan.activationPreparation.patch, FILE);
  assert.deepEqual(plan.activationPreparation.preparedFor, ['pre-militar']);
  assert.deepEqual(plan.activationPreparation.keepPreparing, ['ensino-fundamental']);
  assert.deepEqual(plan.activate, ['pre-militar']);
  assert.deepEqual(plan.keepPreparing, ['ensino-fundamental']);
  assert.equal(plan.expectedPublishedBefore, 43);
  assert.equal(plan.expectedPublishedAfter, 44);
  assert.equal(plan.resource.id, 'ita-provas-anteriores');
  assert.equal(lot.lot, 'L002-ita-pre-militar');
  assert.equal(lot.simulation, false);
  assert.equal(lot.entries.length, 1);
  assert.equal(lot.entries[0]?.id, 'ita-provas-anteriores');
  assert.equal(lot.entries[0]?.decision, 'approved');
  assert.equal(lot.entries[0]?.digest, digestOf(record('ita-provas-anteriores')));
  assert.deepEqual(lot.authorization, { by: 'Guilherme Henrique', on: '2026-10-12' });
});

test('the patch changes only the ITA-only status and its independent build verifier', () => {
  const modified = [...patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm)].map(match => {
    assert.equal(match[1], match[2], 'a file may not be renamed');
    return match[1];
  });
  assert.deepEqual(modified, ['src/lib/taxonomy.ts', 'scripts/verify-dist.mjs']);
  assert.deepEqual(plan.activationPreparation.patchScope, modified);
  assert.equal((patch.match(/^\+  'pre-militar': 'active',\s*$/gm) ?? []).length, 1);
  assert.equal((patch.match(/^-  'pre-militar': 'preparing',\s*$/gm) ?? []).length, 1);
  assert.equal((patch.match(/^\+const PREPARING = \['\/ensino-fundamental\/'\];$/gm) ?? []).length, 1);
  assert.equal((patch.match(/^\+  'vestibular\.ita\.br',\s*$/gm) ?? []).length, 1);
  const additions = patch.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++ '));
  const deletions = patch.split('\n').filter(line => line.startsWith('-') && !line.startsWith('--- '));
  assert.equal(additions.length, 5, 'scope is five added lines, including Home objective mapping');
  assert.equal(deletions.length, 3, 'scope is three removed lines');
  assert.ok(additions.some(line => line.includes("'/pre-militar/'") && line.includes("'/ensino-superior/'")), 'pre-militar becomes canonical');
  assert.ok(!additions.some(line => /'ensino-fundamental': 'active'/.test(line)), 'Fundamental must remain preparing');
  assert.match(patch, /vestibular\.ita\.br/);
});

test('the activation patch mirrors the Home objective path counter for Pré-Militar', () => {
  // verify-dist compares visible Home path counters against PATH_PAGES keys.
  // Without this addition, a correctly activated /pre-militar/ causes
  // verify-dist to reject the future 44-resource site.
  const required = "+    '/pre-militar/': ['/pre-militar/'],";
  assert.ok(
    patch.split('\n').includes(required),
    'active Pré-Militar must be reflected in the independent PATH_PAGES verifier map',
  );
});

test('the applied package is exactly reverse-applicable and only scoped files changed', () => {
  // Reversing must succeed without changing files; the historic patch was applied once.
  assert.equal(execFileSync('git', ['apply', '--reverse', '--check', FILE], { cwd: ROOT, encoding: 'utf8' }), '');
  const taxonomy = readFileSync(new URL('../../src/lib/taxonomy.ts', import.meta.url), 'utf8');
  const verifier = readFileSync(new URL('../../scripts/verify-dist.mjs', import.meta.url), 'utf8');
  assert.match(taxonomy, /'pre-militar': 'active'/);
  assert.match(taxonomy, /'ensino-fundamental': 'preparing'/);
  assert.match(verifier, /const PREPARING = \['\/ensino-fundamental\/'\];/);
  assert.match(verifier, /\n  'vestibular\.ita\.br',/);
  assert.match(verifier, /'\/pre-militar\/': \['\/pre-militar\/'\]/);
});

test('isolated branch now has the exact L001 and L002 pins, 44 resources and active Pré-Militar', () => {
  assert.equal(release.mode, 'production');
  assert.equal(release.inventory.length, 44);
  assert.equal(publishedResources.length, 44);
  assert.deepEqual(release.applied.map(pin => pin.lot), ['L001-plano-b', 'L002-ita-pre-militar']);
  assert.deepEqual(release.ledger, release.applied);
  assert.equal(release.applied[1]?.digest, digestOf(lot));
  assert.deepEqual(LOT_MANIFESTS.map(x => (x as { lot: string }).lot), ['L001-plano-b','L002-ita-pre-militar']);
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(RELEASE.states.get('ita-provas-anteriores'), 'published');
  assert.equal(RELEASE.ifApplied.has('ita-provas-anteriores'), false);
  assert.equal(PATH_STATUS['pre-militar'], 'active');
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.deepEqual(PREPARING_PATHS, ['ensino-fundamental']);
  assert.deepEqual(preparingPaths(), ['/ensino-fundamental/']);
  assert.ok(canonicalPaths().includes('/pre-militar/'));
  assert.ok(release.inventory.includes('ita-provas-anteriores'));
  assert.equal(FEATURED_RELEASE['pre-militar'], 'staging');
  assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH['pre-militar'], []);
});

test('removing the ITA record from an active path is rejected before build, and Fundamental stays gated', () => {
  const withoutITA = publishedResources.filter(r => r.id !== 'ita-provas-anteriores');
  const issues = activationProblems(PATH_STATUS, FEATURED_RESOURCE_IDS_BY_PATH, withoutITA, FEATURED_RELEASE);
  assert.ok(issues.some(issue => issue.includes('pre-militar: active without a page')), issues.join('\n'));
  assert.ok(issues.some(issue => issue.includes('pre-militar: active with no published resource')), issues.join('\n'));
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.deepEqual(activationProblems(), [], 'the actual authorized branch is consistent');
});
