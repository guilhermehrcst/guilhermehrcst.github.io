// The Home's courses (Home V1): two short editorial lists of ids, never a second catalogue. Each id must
// name a published course of the library (src/lib/libraries.ts); the records, their titles, providers and
// facts come from the catalogue itself. An unknown, unpublished or non-course id fails the build: the Home
// never shows what the library does not hold. No asset imports: this module runs under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { libraryOf } from './libraries.ts';

/** The hero's composition: real course thumbnails, so only courses with a supplied image. */
export const HERO_COURSE_IDS = ['cs50x', 'cs50ai', 'fgv-datasci'] as const;
/** "Cursos em destaque": a small sample across paths, chosen by the editors. */
export const FEATURED_COURSE_IDS = ['cs50x', 'kultivi-writing-enem', 'mit-1801sc', 'fluencia'] as const;

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

const resolve = (ids: readonly string[], needImage: boolean, what: string): PublishedLearningResource[] => {
  const problems = homeCourseProblems(ids, publishedResources, needImage);
  if (problems.length) throw new Error(`home-featured (${what}): ${problems.join('; ')}`);
  return ids.map((id) => publishedResources.find((r) => r.id === id)!);
};

export const heroCourses = (): PublishedLearningResource[] => resolve(HERO_COURSE_IDS, true, 'hero');
export const featuredCourses = (): PublishedLearningResource[] => resolve(FEATURED_COURSE_IDS, false, 'featured');
