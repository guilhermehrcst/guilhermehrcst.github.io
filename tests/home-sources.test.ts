import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { publishedTracksFor } from '../src/lib/tech-tracks.ts';
import { homeSources } from '../src/lib/home-sources.ts';

// Staging state (V0.4 QA P1-RC1): with no Gate B course published, every institution keeps the single-page
// link and count the Home showed before homeSources() existed. A release changes MIT's line on purpose
// (tests/release-candidate/home-sources.test.ts) and updates this test with it.
const lib = { homeSources } as Record<string, any>;
const PROVIDERS = ['Harvard University', 'MIT OpenCourseWare', 'FGV', 'Cisco Networking Academy', 'Fundação Bradesco', 'Fundação Bradesco + Microsoft'];

test('staging today: every institution keeps its single-page link and count, exactly as before', () => {
  const sources = lib.homeSources(PROVIDERS, publishedResources, publishedTracksFor(publishedResources));
  assert.deepEqual(sources.map((s: any) => [s.provider, s.count, s.areas, s.href]), [
    ['Harvard University', 5, ['Tecnologia'], '/tecnologia/#comecar-a-programar'],
    ['MIT OpenCourseWare', 5, ['Tecnologia'], '/tecnologia/#python'],
    ['FGV', 3, ['Tecnologia'], '/tecnologia/#dados'],
    ['Cisco Networking Academy', 1, ['Tecnologia'], '/tecnologia/#seguranca-e-privacidade'],
    ['Fundação Bradesco', 2, ['Tecnologia'], '/tecnologia/#comecar-a-programar'],
    ['Fundação Bradesco + Microsoft', 1, ['Tecnologia'], '/tecnologia/#inteligencia-artificial'],
  ]);
});
