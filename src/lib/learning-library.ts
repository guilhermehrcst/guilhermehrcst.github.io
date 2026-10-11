// Pure selections over the catalogue. Pages compose lists at build time from these; nothing here
// runs in the browser.
import { areaOf, publishedResources } from './learning-resources.ts';
import { publishedTracks } from './tech-tracks.ts';
import { EXAM_ORDER, PATH_ORDER } from './taxonomy.ts';
import type {
  LearningFormatId,
  LearningSubjectId,
  PublishedLearningResource,
} from './learning-resources';
import type { AreaId, ExamId, ObjectiveId, PathId } from './taxonomy';

/** Dimensions combine with AND; the values inside one dimension combine with OR. */
export type LearningFilter = {
  area?: AreaId;
  subject?: LearningSubjectId;
  paths?: readonly PathId[];
  exams?: readonly ExamId[];
  formats?: readonly LearningFormatId[];
};

export const filterResources = (
  resources: readonly PublishedLearningResource[],
  filter: LearningFilter,
): PublishedLearningResource[] => resources.filter((resource) => {
  if (filter.area && areaOf(resource) !== filter.area) return false;
  if (filter.subject && resource.subject !== filter.subject) return false;
  if (filter.paths?.length && !filter.paths.some((path) => resource.paths.includes(path))) return false;
  if (filter.exams?.length && !filter.exams.some((exam) => resource.exams?.includes(exam))) return false;
  if (filter.formats?.length && !filter.formats.includes(resource.format)) return false;
  return true;
});

export const resourcesByArea = (
  resources: readonly PublishedLearningResource[],
  area: AreaId,
): PublishedLearningResource[] => filterResources(resources, { area });

/** The resources with these ids, in this order. An unknown id is an error, never a silent gap. */
export const resourcesByIds = (
  resources: readonly PublishedLearningResource[],
  ids: readonly string[],
): PublishedLearningResource[] => {
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  return ids.map((id) => {
    const resource = byId.get(id);
    if (!resource) throw new Error(`learning-library: unknown or unpublished resource ${id}`);
    return resource;
  });
};

const isExam = (objective: ObjectiveId): objective is ExamId => (EXAM_ORDER as readonly ObjectiveId[]).includes(objective);

/** The objectives a subject has published resources for: its exams first (as since V0.1), then its paths,
 *  each in the taxonomy's order. Derived, never typed. */
export const objectivesFor = (
  subject: LearningSubjectId,
  resources: readonly PublishedLearningResource[] = publishedResources,
): ObjectiveId[] => {
  const own = resources.filter((resource) => resource.subject === subject);
  return [
    ...EXAM_ORDER.filter((exam) => own.some((resource) => resource.exams?.includes(exam))),
    ...PATH_ORDER.filter((path) => own.some((resource) => resource.paths.includes(path))),
  ];
};

/** What a path or exam really holds: its distinct published resources, as each declares them (an exam's
 *  resources also declare its parent path, so Vestibular holds ENEM and UERJ). Tecnologia adds its tracks.
 *  A path nothing declares holds nothing. */
export const objectiveFacts = (
  objective: ObjectiveId,
  resources: readonly PublishedLearningResource[] = publishedResources,
): { resources: number; tracks?: number } => {
  if (isExam(objective)) return { resources: filterResources(resources, { exams: [objective] }).length };
  const count = filterResources(resources, { paths: [objective] }).length;
  return objective === 'tecnologia' ? { resources: count, tracks: publishedTracks().length } : { resources: count };
};

/** The institutions among these provider names that publish something, each with its published resources
 *  (catalogue order). A provider with nothing published is left out: the Home never shows an empty name. */
export const institutions = (
  providers: readonly string[],
  resources: readonly PublishedLearningResource[] = publishedResources,
): { provider: string; resources: PublishedLearningResource[] }[] =>
  providers
    .map((provider) => ({ provider, resources: resources.filter((resource) => resource.provider === provider) }))
    .filter((institution) => institution.resources.length > 0);
