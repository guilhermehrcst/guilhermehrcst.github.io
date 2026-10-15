// The Home's courses (Home V1, V2): two short editorial lists of ids, never a second catalogue. Each id must
// name a published course of the library (src/lib/libraries.ts); the records, their titles, providers and
// facts come from the catalogue itself. An unknown, unpublished or non-course id fails the build: the Home
// never shows what the library does not hold, and never the same course twice (the two lists are disjoint).
// V2.2 adds the order of the six path cards, the one thing here that is not about courses.
// No asset imports: this module runs under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { libraryOf } from './libraries.ts';
import type { PathId } from './taxonomy.ts';

/** The order of the six path cards on the Home ("Qual é o seu objetivo?", V2.2): the order of the header's line
 *  (Fundamental, Médio, Pré-Militar, Vestibular, Superior, Tecnologia), so the page and the navigation read
 *  alike. It is the Home's own list, typed and kept here on purpose: PATH_ORDER (src/lib/taxonomy.ts) orders
 *  other pages (the course filters, the footer, the sitemap) and stays as it is. A test holds the two orders
 *  that must agree (this one and the header's NAV_PATHS) and that every path appears once. */
export const HOME_PATH_ORDER = ['ensino-fundamental', 'ensino-medio', 'pre-militar', 'vestibulares', 'ensino-superior', 'tecnologia'] as const satisfies readonly PathId[];

/** The hero's photograph (V2, after the McGill reference: one large picture): a course whose supplied image
 *  is a photograph, named in the caption by its title and institution. */
export const HERO_COURSE_IDS = ['cs50x'] as const;
/** "Explore novas possibilidades": a small sample across paths, chosen by the editors. */
export const FEATURED_COURSE_IDS = ['cs50p', 'kultivi-writing-enem', 'mit-1801sc', 'cs50ai'] as const;

export const homeCourseProblems = (
  ids: readonly string[],
  published: readonly PublishedLearningResource[] = publishedResources,
  needImage = false,
): string[] => {
  const problems: string[] = [];
  if (new Set(ids).size !== ids.length) problems.push('a course is listed twice');
  for (const id of ids) {
    const r = published.find((resource) => resource.id === id);
    if (!r) { problems.push(`${id} is not a published resource`); continue; }
    if (libraryOf(r.format) !== 'cursos') problems.push(`${id} is a ${r.format}, not a course`);
    if (needImage && !r.curated?.image) problems.push(`${id} has no supplied image`);
  }
  return problems;
};

/** A course on the Home appears once: the hero and the featured row never share one. */
export const sharedHomeCourses = (hero: readonly string[] = HERO_COURSE_IDS, featured: readonly string[] = FEATURED_COURSE_IDS): string[] =>
  hero.filter((id) => featured.includes(id));

const resolve = (ids: readonly string[], needImage: boolean, what: string): PublishedLearningResource[] => {
  const problems = homeCourseProblems(ids, publishedResources, needImage);
  if (problems.length) throw new Error(`home-featured (${what}): ${problems.join('; ')}`);
  return ids.map((id) => publishedResources.find((r) => r.id === id)!);
};

export const heroCourses = (): PublishedLearningResource[] => {
  const courses = resolve(HERO_COURSE_IDS, true, 'hero');
  if (courses[0]?.curated?.image?.kind !== 'photo') throw new Error('home-featured (hero): the hero shows a photograph');
  const shared = sharedHomeCourses();
  if (shared.length) throw new Error(`home-featured: ${shared.join(', ')} on the hero and in the featured row`);
  return courses;
};
export const featuredCourses = (): PublishedLearningResource[] => resolve(FEATURED_COURSE_IDS, false, 'featured');
