import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedTracks, techTracks } from '../src/lib/tech-tracks.ts';
import { publishedResources } from '../src/lib/learning-resources.ts';

// The tracks and their resources as the spec lists them (§6.3), by hand.
const SPEC = [
  ['comecar-a-programar', ['cs50x', 'cs50p', 'fb-python']],
  ['ciencia-da-computacao', ['cs50x', 'mit-6006', 'mit-6042j', 'mit-1806']],
  ['desenvolvimento-web', ['cs50w', 'fb-web', 'odin-foundations']],
  ['python', ['cs50p', 'mit-6100l', 'fb-python']],
  ['inteligencia-artificial', ['cs50ai', 'fluencia']],
  ['dados', ['fgv-datasci', 'mit-60002', 'cs50sql']],
  ['seguranca-e-privacidade', ['cisco-cyber', 'fgv-security', 'fgv-privacy']],
  ['git-e-github', []],
  // L001: the cloud track exists once its one resource is published.
  ['computacao-em-nuvem', ['ms-learn-cloud-concepts']],
];

test('the tracks and their resources are exactly the spec', () => {
  assert.deepEqual(techTracks.map((t) => [t.id, [...t.resourceIds]]), SPEC);
});

test('every referenced resource exists, is published and is technology', () => {
  const byId = new Map(publishedResources.map((r) => [r.id, r]));
  for (const track of techTracks) {
    for (const id of track.resourceIds) {
      assert.ok(byId.has(id), `${track.id}: ${id}`);
      assert.equal(byId.get(id)!.subject, 'tecnologia', id);
    }
  }
});

test('a published track is never empty; a planned one is never shown', () => {
  for (const track of techTracks) {
    if (track.status === 'published') assert.ok(track.resourceIds.length > 0, track.id);
  }
  assert.equal(techTracks.find((t) => t.id === 'git-e-github')!.status, 'planned');
  assert.ok(!publishedTracks().some((t) => t.id === 'git-e-github'));
  assert.equal(publishedTracks().length, 8);
});

test('no published technology resource is left out of every track', () => {
  const inTracks = new Set(publishedTracks().flatMap((t) => [...t.resourceIds]));
  for (const r of publishedResources.filter((r) => r.subject === 'tecnologia')) assert.ok(inTracks.has(r.id), `orphan ${r.id}`);
});

test('every track says what it is and why', () => {
  for (const track of techTracks) {
    assert.ok(track.label.trim().length > 1, track.id);
    assert.ok(track.why.trim().length > 10, track.id);
  }
});
