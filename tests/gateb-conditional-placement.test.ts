import { test } from 'node:test';
import assert from 'node:assert/strict';

import { publishedResources } from '../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../src/lib/staging-gateb.ts';
import { GATEB_DRAFT_SELECTION, gatebPlacementGaps, gatebUnreleasedDestinations } from '../src/lib/gateb-selection-preview.ts';
import { HIGHER_EDUCATION_GROUPS, higherEducationGroupsFor } from '../src/lib/higher-education.ts';
import { techTracks, publishedTracks, techTracksFor, publishedTracksFor, GATEB_TECH_TRACK_ASSIGNMENTS } from '../src/lib/tech-tracks.ts';
import { placementOf } from '../src/lib/placement.ts';
import { PATH_ORDER, PATH_STATUS, type PathId } from '../src/lib/taxonomy.ts';

const future = [...publishedResources, ...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES];
const active = Object.fromEntries(PATH_ORDER.map((path) => [path, 'active'])) as Record<PathId, 'active'>;
const byId = new Map(future.map((resource) => [resource.id, resource]));

test('T2 higher education: six new offerings have conditional field destinations without premature groups', () => {
  assert.deepEqual(HIGHER_EDUCATION_GROUPS.map((group) => group.id), ['matematica', 'computacao']);
  const projected = higherEducationGroupsFor(future);
  assert.deepEqual(projected.map((group) => group.id), [
    'matematica', 'computacao', 'fisica', 'biologia', 'psicologia', 'economia', 'meio-ambiente',
  ]);

  const expected = new Map([
    ['mit-1801sc', 'matematica'],
    ['mit-801sc', 'fisica'],
    ['mit-7012', 'biologia'],
    ['yale-psyc-110', 'psicologia'],
    ['yale-econ-252', 'economia'],
    ['ou-environment-treading-lightly', 'meio-ambiente'],
  ]);
  for (const [id, field] of expected) {
    const resource = byId.get(id);
    if (!resource) throw new Error(`missing ${id}`);
    assert.equal(HIGHER_EDUCATION_GROUPS.some((group) => group.resourceIds.includes(id)), false, id);
    const groups = projected.filter((group) => group.resourceIds.includes(id));
    assert.deepEqual(groups.map((group) => group.id), [field], id);
    assert.equal(placementOf(resource, active), null, `${id} is still unpublished`);
    assert.deepEqual(placementOf(resource, active, future), {
      page: '/ensino-superior/', anchor: `recurso-${id}`,
    });
  }
  const all = projected.flatMap((group) => group.resourceIds);
  assert.equal(new Set(all).size, all.length, 'higher-education groups never duplicate IDs');
  assert.ok(projected[0]?.resourceIds.includes('mit-1806'), 'existing mathematics resources preserved');
  assert.ok(projected[1]?.resourceIds.includes('cs50x'), 'existing computing resources preserved');
});

test('T2 technology: seven existing published tracks stay unchanged until future candidates enter catalogue', () => {
  assert.equal(techTracks.length, 8, 'seven published tracks plus Git planned');
  assert.equal(publishedTracks().length, 7);
  assert.ok(!techTracks.some((track) => track.id === 'computacao-em-nuvem'));
  assert.deepEqual(GATEB_TECH_TRACK_ASSIGNMENTS, {
    'odin-foundations': 'desenvolvimento-web',
    'google-mlcc': 'inteligencia-artificial',
    'ms-learn-cloud-concepts': 'computacao-em-nuvem',
  });
  const preview = techTracksFor(future);
  assert.equal(preview.length, 9, 'the extra cloud track exists only in a proposed context');
  assert.equal(publishedTracksFor(future).length, 8);
  assert.equal(preview.find((track) => track.id === 'git-e-github')?.status, 'planned');
  assert.equal(preview.find((track) => track.id === 'comecar-a-programar')?.resourceIds.join(','), techTracks[0]?.resourceIds.join(','));

  for (const [id, track] of Object.entries(GATEB_TECH_TRACK_ASSIGNMENTS)) {
    const item = byId.get(id);
    if (!item) throw new Error(`missing ${id}`);
    assert.ok(!publishedTracks().some((entry) => entry.resourceIds.includes(id)), `${id}: hidden now`);
    assert.equal(preview.find((entry) => entry.id === track)?.resourceIds.includes(id), true, id);
    assert.equal(placementOf(item, active), null, `${id}: unpublished ID must have no destination yet`);
    assert.deepEqual(placementOf(item, active, future), { page: '/tecnologia/', anchor: `recurso-${id}` }, id);
  }
});

test('T2 cloud is a distinct genuine topic; no false Security attribution or certification', () => {
  const resource = STAGED_RESOURCES.find((r) => r.id === 'ms-learn-cloud-concepts');
  if (!resource) throw new Error('missing Microsoft Learn Cloud fundamentals');
  assert.equal(resource.subject, 'tecnologia');
  assert.deepEqual(resource.technology, { section: 'cloud', topic: 'cloud-fundamentals' });
  assert.equal(resource.certificate, 'unconfirmed');
  const cloud = techTracksFor(future).find((track) => track.id === 'computacao-em-nuvem');
  if (!cloud) throw new Error('missing future Cloud track');
  assert.deepEqual(cloud.resourceIds, ['ms-learn-cloud-concepts']);
  assert.ok(!techTracksFor(future).find((track) => track.id === 'seguranca-e-privacidade')?.resourceIds.includes(resource.id));
  assert.equal(GATEB_DRAFT_SELECTION.tecnologia.filter((id) => id === resource.id).length, 1);
});

test('T2 placement context refuses to route a tech resource with a forged non-tech subject or path', () => {
  const resource = STAGED_RESOURCES.find((r) => r.id === 'ms-learn-cloud-concepts');
  if (!resource) throw new Error('missing Microsoft Learn Cloud fundamentals');
  const wrongSubject = { ...resource, subject: null };
  const wrongPath = { ...resource, paths: ['ensino-superior'] as const };
  assert.equal(placementOf(wrongSubject, active, future), null);
  assert.equal(placementOf(wrongPath, active, future), null);
  assert.ok(!techTracksFor([{ ...resource, subject: null }]).some((track) => track.id === 'computacao-em-nuvem'));
  assert.ok(!techTracksFor([{ ...resource, paths: ['ensino-superior'] }]).some((track) => track.id === 'computacao-em-nuvem'));
});

test('T2 all verified candidates have future placement; real publication flags remain unchanged', () => {
  assert.deepEqual(gatebPlacementGaps(), []);
  assert.equal(gatebUnreleasedDestinations().length, 9);
  assert.equal(future.length, 74);
  for (const resource of publishedResources) {
    assert.deepEqual(placementOf(resource), placementOf(resource, PATH_STATUS, future), `${resource.id}: existing home must be stable`);
  }
  assert.equal(publishedResources.length, 37);
  assert.equal(PATH_STATUS['ensino-fundamental'], 'preparing');
  assert.equal(PATH_STATUS['pre-militar'], 'preparing');
});
