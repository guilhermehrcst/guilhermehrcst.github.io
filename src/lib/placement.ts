// Where a resource lives (V0.4 Gate B, P1): its one canonical page and anchor, for search and for the
// anchor the page carries. Derived from the very rules the pages render by, in a fixed order of contexts,
// never from a blind fallback: a context places a resource only if its page shows it.
//   1. a published technology track (/tecnologia/);
//   2. its subject's page, for a school subject of Ensino Médio or Vestibular (/materias/<subject>/);
//   3. an exam guide that shows it (/enem/, /uerj/);
//   4. the Ensino Superior field groups (/ensino-superior/);
//   5. the general section of an active path page that has one (Fundamental, Vestibular, Pré-Militar),
//      which renders exactly the resources placed there.
// A resource no context places has no destination, and a published one fails the build: nothing is
// published without a page that shows it. No asset imports: this module runs under Node's test runner.
import { publishedResources, type LearningResource, type PublishedLearningResource } from './learning-resources.ts';
import { guideShows } from './exam-guides.ts';
import { HIGHER_EDUCATION_GROUPS } from './higher-education.ts';
import { routes } from './routes.ts';
import { publishedTracks } from './tech-tracks.ts';
import { ACADEMIC_SUBJECTS, EXAM_ORDER, PATH_ORDER, PREPARING_PATHS, type ExamId, type PathId, type SubjectId } from './taxonomy.ts';

export type PathState = 'preparing' | 'active';
export type PathStates = Readonly<Record<PathId, PathState>>;

/** What placement reads of a resource. */
export type Placeable = Pick<LearningResource, 'id' | 'subject' | 'format'> & {
  paths?: readonly PathId[] | undefined;
  exams?: readonly ExamId[] | undefined;
};

export interface Placement { page: string; anchor: string }

/** The paths whose school subjects the subject pages serve. A Fundamental resource is not among them. */
export const SUBJECT_PAGE_PATHS: readonly PathId[] = ['ensino-medio', 'vestibulares'];
/** The path pages with a general section (#materiais or #outras-provas). */
export const GENERAL_SECTION_PATHS: readonly PathId[] = ['ensino-fundamental', 'vestibulares', 'pre-militar'];

const currentStates = (): PathStates =>
  Object.fromEntries(PATH_ORDER.map((path) => [path, PREPARING_PATHS.includes(path) ? 'preparing' : 'active'])) as Record<PathId, PathState>;

/** Whether a subject's page shows this resource (the rule SubjectResources renders by). */
export const subjectPageShows = (r: Placeable, subject: SubjectId): boolean =>
  r.subject === subject && ACADEMIC_SUBJECTS.includes(subject) && (r.paths ?? []).some((path) => SUBJECT_PAGE_PATHS.includes(path));

const generalPage = (r: Placeable, states: PathStates): PathId | undefined =>
  PATH_ORDER.find((path) => GENERAL_SECTION_PATHS.includes(path) && states[path] === 'active' && (r.paths ?? []).includes(path));

export const placementOf = (r: Placeable, states: PathStates = currentStates()): Placement | null => {
  const at = (page: string): Placement => ({ page, anchor: `recurso-${r.id}` });
  if (publishedTracks().some((track) => track.resourceIds.includes(r.id))) return at(routes.objective('tecnologia'));
  if (r.subject !== null && subjectPageShows(r, r.subject)) return at(routes.subject(r.subject));
  const exam = EXAM_ORDER.find((id) => guideShows(id, r));
  if (exam) return at(routes.objective(exam));
  if (HIGHER_EDUCATION_GROUPS.some((group) => group.resourceIds.includes(r.id))) return at(routes.objective('ensino-superior'));
  const path = generalPage(r, states);
  return path ? at(routes.objective(path)) : null;
};

/** The resources a path page's general section renders: exactly those placed on it. */
export const placedOnPath = (path: PathId, states: PathStates = currentStates()): PublishedLearningResource[] =>
  publishedResources.filter((r) => placementOf(r, states)?.page === routes.objective(path));

export const placementProblems = (resources: readonly Placeable[] = publishedResources, states: PathStates = currentStates()): string[] =>
  resources.filter((r) => placementOf(r, states) === null).map((r) => `placement: ${r.id} has no page that shows it`);

{
  const problems = placementProblems();
  if (problems.length) throw new Error(problems.join('\n'));
}
