// This is the INERT activation package. It must stay safe in the GitHub PR and
// only become effective in the separate, explicitly authorized L002 release PR.
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

test('branch-scoped category activation approval cannot apply L002 or publish the site', () => {
  assert.equal(plan.previewOnly, true);
  assert.equal(plan.lot, 'L002-ita-pre-militar');
  assert.equal(plan.editorialApproval, 'approved');
  assert.equal(plan.activationApproval, 'approved');
  assert.equal(plan.activationApprovalScope, 'release-branch-only');
  assert.equal(plan.activationApprovedBy, 'Guilherme Henrique');
  assert.equal(plan.activationApprovedOn, '2026-10-12');
  assert.equal(plan.activationExecution, 'awaiting-l002-authorization');
  assert.equal(plan.publicationAuthorization, 'pending');
  assert.equal(plan.activationPreparation.status, 'patch-ready-for-review');
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
  assert.equal(lot.authorization, null);
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

test('git can apply the package to the exact branch, but CI never applies it', () => {
  const result = execFileSync('git', ['apply', '--check', FILE], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result, '');
  const taxonomy = readFileSync(new URL('../../src/lib/taxonomy.ts', import.meta.url), 'utf8');
  const verifier = readFileSync(new URL('../../scripts/verify-dist.mjs', import.meta.url), 'utf8');
  assert.match(taxonomy, /'pre-militar': 'preparing'/);
  assert.match(verifier, /const PREPARING = \['\/ensino-fundamental\/', '\/pre-militar\/'\];/);
  assert.doesNotMatch(verifier, /\n  'vestibular\.ita\.br',/);
});

test('current public and staged release stay 43 with only L001 applied', () => {
  assert.equal(release.mode, 'production');
  assert.equal(release.inventory.length, 43);
  assert.equal(publishedResources.length, 43);
  assert.deepEqual(release.applied.map(pin => pin.lot), ['L001-plano-b']);
  assert.deepEqual(release.ledger.map(pin => pin.lot), ['L001-plano-b']);
  assert.deepEqual(LOT_MANIFESTS.map(x => (x as { lot: string }).lot), ['L001-plano-b','L002-ita-pre-militar']);
  assert.deepEqual(RELEASE.problems, []);
  assert.equal(RELEASE.states.get('ita-provas-anteriores'), 'candidate');
  assert.equal(RELEASE.ifApplied.get('ita-provas-anteriores'), 'published');
  assert.equal(PATH_STATUS['pre-militar'], 'preparing');
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.deepEqual(PREPARING_PATHS, ['ensino-fundamental','pre-militar']);
  assert.deepEqual(preparingPaths(), ['/ensino-fundamental/','/pre-militar/']);
  assert.ok(!canonicalPaths().includes('/pre-militar/'));
  assert.ok(!release.inventory.includes('ita-provas-anteriores'));
  assert.equal(FEATURED_RELEASE['pre-militar'], 'staging');
  assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH['pre-militar'], []);
});

test('activation on its own is rejected until the authorized ITA resource is published', () => {
  const hypotheticalStatus = { ...PATH_STATUS, 'pre-militar': 'active' as const };
  const issues = activationProblems(hypotheticalStatus, FEATURED_RESOURCE_IDS_BY_PATH, publishedResources, FEATURED_RELEASE);
  assert.ok(issues.some(issue => issue.includes('pre-militar: active without a page')), issues.join('\n'));
  assert.ok(issues.some(issue => issue.includes('pre-militar: active with no published resource')), issues.join('\n'));
  assert.equal(hypotheticalStatus['ensino-fundamental'], 'preparing');
});
