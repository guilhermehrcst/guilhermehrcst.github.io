// The two libraries (header V0.5): /cursos/ and /materiais/. Views of the published catalogue, by format,
// never a second source: a resource is listed as it is, linked to its provider, and keeps its one home page
// and anchor (src/lib/placement.ts). Each format belongs to exactly one library, so every published
// resource is in exactly one of them. No asset imports: this module runs under Node's test runner.
import { LEARNING_FORMATS, publishedResources, type LearningFormatId, type PublishedLearningResource } from './learning-resources.ts';

export type LibraryId = 'cursos' | 'materiais';

/** Courses: what is studied from start to end. In display order. */
export const COURSE_FORMATS = ['course', 'track', 'playlist', 'lessons', 'lesson'] as const satisfies readonly LearningFormatId[];
/** Materials: what is practised or consulted. In display order. */
export const MATERIAL_FORMATS = ['practice', 'simulator', 'past-exam', 'reference'] as const satisfies readonly LearningFormatId[];

export const LIBRARY_FORMATS: Readonly<Record<LibraryId, readonly LearningFormatId[]>> = {
  cursos: COURSE_FORMATS,
  materiais: MATERIAL_FORMATS,
};

/** The library a format belongs to. */
export const libraryOf = (format: LearningFormatId): LibraryId =>
  (COURSE_FORMATS as readonly LearningFormatId[]).includes(format) ? 'cursos' : 'materiais';

export interface LibraryGroup { format: LearningFormatId; resources: PublishedLearningResource[] }

/** A library's published resources, one group per format in display order, in catalogue order inside it.
 *  A format with nothing published is left out: no group is ever empty. */
export const libraryGroups = (
  library: LibraryId,
  resources: readonly PublishedLearningResource[] = publishedResources,
): LibraryGroup[] =>
  LIBRARY_FORMATS[library]
    .map((format) => ({ format, resources: resources.filter((r) => r.format === format) }))
    .filter((group) => group.resources.length > 0);

{
  // Every format in exactly one library: a new format fails here until it is placed.
  const all = [...COURSE_FORMATS, ...MATERIAL_FORMATS];
  const missing = LEARNING_FORMATS.filter((f) => !all.includes(f as never));
  if (missing.length || new Set(all).size !== all.length || all.length !== LEARNING_FORMATS.length) {
    throw new Error(`libraries: every format belongs to exactly one library (${missing.join(',') || 'duplicate'})`);
  }
}
