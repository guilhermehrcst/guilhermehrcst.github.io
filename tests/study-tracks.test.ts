import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedResources } from '../src/lib/learning-resources.ts';
import { STUDY_TRACK_SECTION_ORDER, studyTracks } from '../src/lib/study-tracks.ts';

for (const exam of ['enem', 'uerj'] as const) {
  test(`${exam}: track sections use the canonical order`, () => {
    assert.deepEqual(studyTracks[exam].sections.map((section) => section.id), STUDY_TRACK_SECTION_ORDER);
  });

  test(`${exam}: every referenced resource exists, is free-verified and matches the exam`, () => {
    const byId = new Map(publishedResources.map((resource) => [resource.id, resource]));
    for (const section of studyTracks[exam].sections) {
      for (const id of section.resourceIds) {
        const resource = byId.get(id);
        assert.ok(resource, `${exam}: missing ${id}`);
        assert.equal(resource.verified.freeAccess, true);
        assert.ok(resource.goals.includes(exam), `${exam}: ${id} lacks matching goal`);
      }
    }
  });

  test(`${exam}: resource ids are not duplicated inside the track`, () => {
    const ids = studyTracks[exam].sections.flatMap((section) => section.resourceIds);
    assert.equal(new Set(ids).size, ids.length);
  });

  test(`${exam}: practice section contains at least one practice resource`, () => {
    const practice = studyTracks[exam].sections.find((section) => section.id === 'practice')!;
    const byId = new Map(publishedResources.map((resource) => [resource.id, resource]));
    assert.ok(practice.resourceIds.some((id) => byId.get(id)?.format === 'practice'));
  });
}
