import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';

import release from '../src/data/academy-release/release.json' with { type: 'json' };
import { publishedResources } from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import {
  GATEB_SELECTION_AUTHORIZES_PUBLICATION,
  GATEB_DRAFT_SELECTION,
  GATEB_PLACEMENT_REQUIREMENTS,
  gatebDraftProblems,
  gatebSelectedResources,
  gatebPlacementGaps,
  gatebUnreleasedDestinations,
  gatebProjectedContext,
} from '../src/lib/gateb-selection-preview.ts';
import { featuredProblems, FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH } from '../src/lib/featured.ts';
import { PATH_ORDER, PATH_STATUS, type PathId } from '../src/lib/taxonomy.ts';
import { placementOf } from '../src/lib/placement.ts';

type ManifestItem = { id: string; path: PathId; position: number; official_url: string; publication_authorized: boolean };
const manifest = JSON.parse(readFileSync(
  new URL('../docs/superpowers/research/2026-10-11-v04-gateb-editorial-review.json', import.meta.url), 'utf8',
)) as { review_version: string; items: ManifestItem[]; featured_release_authorized: boolean };

const EXPECTED_GAPS = [
  'mit-1801sc',
  'mit-801sc',
  'mit-7012',
  'yale-psyc-110',
  'yale-econ-252',
  'ou-environment-treading-lightly',
  'odin-foundations',
  'google-mlcc',
  'ms-learn-cloud-concepts',
];

test('T2: draft matches the audited manifest exactly, slot by slot and in editorial order', () => {
  assert.equal(manifest.review_version, '2026-10-12-editorial-05');
  assert.equal(Object.keys(GATEB_DRAFT_SELECTION).length, 6);
  for (const path of PATH_ORDER) {
    const source = manifest.items.filter((item) => item.path === path).sort((a, b) => a.position - b.position);
    assert.equal(source.length, 10, path);
    assert.deepEqual(GATEB_DRAFT_SELECTION[path], source.map((item) => item.id), path);
  }
  const ids = Object.values(GATEB_DRAFT_SELECTION).flat();
  assert.equal(ids.length, 60);
  assert.equal(new Set(ids).size, 60);
  assert.equal(gatebSelectedResources().length, 60);
  assert.deepEqual(gatebSelectedResources().map((r) => r.id), ids);
});

test('T2: draft uses the original catalogue and two staging sets, never duplicates data', () => {
  // A candidate a lot has published is in both the catalogue and its pool: it counts once.
  const all = [...new Map([...publishedResources, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES].map((r) => [r.id, r])).values()];
  assert.equal(all.length, 74);
  assert.equal(gatebProjectedContext().length, 74);
  assert.equal(new Set(gatebProjectedContext().map((r) => r.id)).size, 74);
  const byId = new Map(all.map((r) => [r.id, r]));
  for (const candidate of manifest.items) {
    const actual = byId.get(candidate.id);
    if (!actual) throw new Error(`missing candidate ${candidate.id}`);
    assert.equal(actual.url, candidate.official_url, candidate.id);
    assert.ok(actual.paths.includes(candidate.path), candidate.id);
    assert.equal(candidate.publication_authorized, false, candidate.id);
  }
});

test('T2: all sixty provisional candidates obey P4 and the existing featured gate', () => {
  const referenceDate = new Date('2026-10-12T23:59:59Z');
  assert.deepEqual(gatebDraftProblems(referenceDate), []);
  const resources = gatebSelectedResources().map((r) => {
    if (!r.url || !r.verified) throw new Error(`${r.id}: not publishable`);
    return { ...r, url: r.url, verified: r.verified };
  });
  assert.deepEqual(featuredProblems(GATEB_DRAFT_SELECTION, 'final', resources), []);
  const duplicate = { ...GATEB_DRAFT_SELECTION, tecnologia: [
    ...GATEB_DRAFT_SELECTION.tecnologia.slice(0, 9), GATEB_DRAFT_SELECTION['ensino-medio'][0]!,
  ] };
  assert.match(featuredProblems(duplicate, 'final', resources).join('\n'), /does not declare tecnologia|featured in/);
});

test('T2: all nine previously missing destinations have conditional routes without public activation', () => {
  const requirements = Object.keys(GATEB_PLACEMENT_REQUIREMENTS);
  assert.deepEqual(requirements, EXPECTED_GAPS);
  const published = new Set(publishedResources.map((r) => r.id));
  assert.deepEqual(gatebUnreleasedDestinations(), EXPECTED_GAPS.filter((id) => !published.has(id)),
    'normal production context must not prematurely route unpublished IDs');
  assert.deepEqual(gatebPlacementGaps(), [], 'conditional plans resolve all 60 future destinations');

  const states = Object.fromEntries(PATH_ORDER.map((path) => [path, 'active'])) as Record<PathId, 'active'>;
  const proposed = new Map(gatebSelectedResources().map((r) => [r.id, r]));
  const future = gatebProjectedContext();
  assert.equal(future.length, 74, 'projected context includes all 37 legacies + 37 staged entries');
  for (const [id, requirement] of Object.entries(GATEB_PLACEMENT_REQUIREMENTS)) {
    const resource = proposed.get(id);
    if (!resource) throw new Error(`missing placement candidate ${id}`);
    if (published.has(id)) assert.equal(placementOf(resource, states)?.page, requirement.target, `${id}: published, shown on its page`);
    else assert.equal(placementOf(resource, states), null, `${id}: unpublished ID must not be shown`);
    const at = placementOf(resource, states, future);
    if (!at) throw new Error(`${id}: conditional route still missing`);
    assert.equal(at.page, requirement.target, id);
    assert.equal(at.anchor, `recurso-${id}`, id);
    assert.ok(requirement.next.trim().length > 20, id);
  }
  assert.equal(gatebSelectedResources().filter((r) => placementOf(r, states, future) !== null).length, 60);
});

test('T2: L002 activates only Pré-Militar, without releasing highlights or the Gate B selection', () => {
  assert.equal(GATEB_SELECTION_AUTHORIZES_PUBLICATION, false);
  assert.equal(manifest.featured_release_authorized, false);
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(PATH_STATUS['pre-militar'], 'active');
  for (const path of PATH_ORDER) {
    assert.equal(FEATURED_RELEASE[path], 'staging', path);
    assert.deepEqual(FEATURED_RESOURCE_IDS_BY_PATH[path], [], path);
  }
  // The release state itself is pinned in tests/incremental-release/repository.test.ts.
  assert.equal(publishedResources.length, release.inventory.length);
});

test('T2: preview is unreferenced by user-facing code, static scripts and the public build', () => {
  const walk = (dir: string): string[] => readdirSync(new URL(`../${dir}`, import.meta.url))
    .flatMap((name) => statSync(new URL(`../${dir}/${name}`, import.meta.url)).isDirectory()
      ? walk(`${dir}/${name}`) : [`${dir}/${name}`]);
  for (const file of [...walk('src/pages'), ...walk('src/components'), ...walk('src/layouts'), ...walk('scripts')]) {
    const code = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(code, /gateb-selection-preview|staging-gateb/, `${file}: leaked private preview`);
  }
});
