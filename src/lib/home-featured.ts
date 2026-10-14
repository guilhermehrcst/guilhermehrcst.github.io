// The Home's courses (Home V1, V2): two short editorial lists of ids, never a second catalogue. Each id must
// name a published course of the library (src/lib/libraries.ts); the records, their titles, providers and
// facts come from the catalogue itself. An unknown, unpublished or non-course id fails the build: the Home
// never shows what the library does not hold, and never the same course twice (the two lists are disjoint).
// No asset imports: this module runs under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { libraryOf } from './libraries.ts';

/** The hero's composition (V2): the first is its large tile, so it must be a photograph; the second a
 *  supplied image. Each is named on the composition by its title and institution. */
export const HERO_COURSE_IDS = ['cs50x', 'fgv-datasci'] as const;
/** "Explore novas possibilidades": a small sample across paths, chosen by the editors. */
export const FEATURED_COURSE_IDS = ['cs50p', 'kultivi-writing-enem', 'mit-1801sc', 'fluencia'] as const;

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
  if (courses[0]?.curated?.image?.kind !== 'photo') throw new Error('home-featured (hero): the large tile must be a photograph');
  const shared = sharedHomeCourses();
  if (shared.length) throw new Error(`home-featured: ${shared.join(', ')} on the hero and in the featured row`);
  return courses;
};
export const featuredCourses = (): PublishedLearningResource[] => resolve(FEATURED_COURSE_IDS, false, 'featured');
