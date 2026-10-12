// Release-candidate context for tests only (V0.4 QA, 2026-10-12). It projects the catalogue a release
// would publish: the 37 published records followed by every typed Gate B candidate, in the order the
// release simulation appends them. Nothing here is imported by a page, and nothing is published: the
// production modules keep reading `publishedResources`. Tests in this folder prove the code is ready for
// that catalogue; the tests outside it hold today's staging state and must keep passing unchanged.
import { isPublishedResource, publishedResources, type PublishedLearningResource } from '../../src/lib/learning-resources.ts';
import { STAGED_RESOURCES } from '../../src/lib/staging.ts';
import { GATEB_NEW_RESOURCES } from '../../src/lib/staging-gateb.ts';
import { GATEB_DRAFT_SELECTION } from '../../src/lib/gateb-selection-preview.ts';

const selected = new Set(Object.values(GATEB_DRAFT_SELECTION).flat());
const published = new Set(publishedResources.map((r) => r.id));

export const RC_CATALOGUE: readonly PublishedLearningResource[] = [
  ...publishedResources,
  ...[...STAGED_RESOURCES, ...GATEB_NEW_RESOURCES].filter((r) => selected.has(r.id) && !published.has(r.id)).filter(isPublishedResource),
];
