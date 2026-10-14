// The course library (/cursos/, V0.6): the published courses as a video-style grid. A view of the
// catalogue, never a second source: every card is derived here from a published record and only from
// facts the record holds (provider, paths, format, language, a verified duration). Nothing is invented:
// no rating, no view count, no number of lessons, no description. No asset imports: this module runs
// under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { libraryGroups } from './libraries.ts';
import { publishedTracks } from './tech-tracks.ts';
import { OBJECTIVES, PATH_ORDER, SUBJECTS, type PathId } from './taxonomy.ts';

export interface CourseCardData {
  resource: PublishedLearningResource;
  /** The paths it serves, in the approved order: the card's category. */
  paths: PathId[];
  /** The short label of the fallback thumbnail: the first published technology track that holds it, else
   *  its subject, else its first path. An existing editorial grouping, never a new claim. */
  thumbLabel: string;
}

/** The published courses, in catalogue order inside the library's format order. */
export const libraryCourses = (resources: readonly PublishedLearningResource[] = publishedResources): PublishedLearningResource[] =>
  libraryGroups('cursos', resources).flatMap((group) => group.resources);

export const thumbLabelOf = (r: Pick<PublishedLearningResource, 'id' | 'subject' | 'paths'>): string => {
  const track = publishedTracks().find((t) => t.resourceIds.includes(r.id));
  if (r.subject === 'tecnologia' && track) return track.label;
  if (r.subject !== null) return SUBJECTS[r.subject].label;
  return OBJECTIVES[r.paths[0]].label;
};

export const courseCards = (resources: readonly PublishedLearningResource[] = publishedResources): CourseCardData[] =>
  libraryCourses(resources).map((resource) => ({
    resource,
    paths: PATH_ORDER.filter((path) => resource.paths.includes(path)),
    thumbLabel: thumbLabelOf(resource),
  }));

/** The path filters the library offers: only paths that hold at least one course, in the approved order.
 *  A filter never comes back empty. */
export const courseFilterPaths = (cards: readonly CourseCardData[] = courseCards()): PathId[] =>
  PATH_ORDER.filter((path) => cards.some((card) => card.paths.includes(path)));
