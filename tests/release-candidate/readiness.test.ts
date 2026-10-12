import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RC_CATALOGUE } from './context.ts';
import { publishedResources } from '../../src/lib/learning-resources.ts';
import { activationProblems } from '../../src/lib/path-status.ts';
import { featuredProblems } from '../../src/lib/featured.ts';
import { placementOf } from '../../src/lib/placement.ts';
import { GATEB_DRAFT_SELECTION } from '../../src/lib/gateb-selection-preview.ts';
import { PATH_ORDER, type PathId } from '../../src/lib/taxonomy.ts';

// The release candidate as a whole (V0.4 QA): the projected catalogue, every path active and every selection
// released passes the same gates the build runs, and the 37 published records keep their place. Partial
// activations stay refused. Nothing here changes PATH_STATUS or FEATURED_RELEASE.
const ACTIVE = Object.fromEntries(PATH_ORDER.map((p) => [p, 'active'])) as Record<PathId, 'active'>;
const RELEASED = Object.fromEntries(PATH_ORDER.map((p) => [p, 'released'])) as Record<PathId, 'released'>;

test('release candidate: 74 published, the 60 highlights valid, every path active without a problem', () => {
  assert.equal(RC_CATALOGUE.length, 74);
  assert.deepEqual(featuredProblems(GATEB_DRAFT_SELECTION, 'final', RC_CATALOGUE), []);
  assert.deepEqual(activationProblems(ACTIVE, GATEB_DRAFT_SELECTION, RC_CATALOGUE, RELEASED), []);
});

test('release candidate: every resource has a page, and the 37 published keep exactly theirs', () => {
  for (const r of RC_CATALOGUE) assert.ok(placementOf(r, ACTIVE, RC_CATALOGUE), r.id);
  for (const r of publishedResources) assert.deepEqual(placementOf(r, ACTIVE, RC_CATALOGUE), placementOf(r), r.id);
});

test('release candidate: a partial release is still refused', () => {
  const nine = { ...GATEB_DRAFT_SELECTION, 'pre-militar': GATEB_DRAFT_SELECTION['pre-militar'].slice(0, 9) };
  assert.ok(activationProblems(ACTIVE, nine, RC_CATALOGUE, RELEASED).length > 0);
  assert.ok(activationProblems(ACTIVE, GATEB_DRAFT_SELECTION, RC_CATALOGUE, { ...RELEASED, 'pre-militar': 'staging' }).length > 0);
  assert.ok(activationProblems({ ...ACTIVE, 'ensino-fundamental': 'preparing' }, GATEB_DRAFT_SELECTION, RC_CATALOGUE, RELEASED).length > 0);
});
