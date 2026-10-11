// Pure selections over the catalogue. Pages compose lists at build time from these; nothing here
// runs in the browser.
import { areaOf, publishedResources } from './learning-resources.ts';
import { OBJECTIVE_ORDER } from './taxonomy.ts';
import type {
  LearningFormatId,
  LearningGoalId,
  LearningSubjectId,
  PublishedLearningResource,
} from './learning-resources';
import type { AreaId } from './taxonomy';

export type LearningFilter = {
  area?: AreaId;
  subject?: LearningSubjectId;
  goals?: readonly LearningGoalId[];
  formats?: readonly LearningFormatId[];
};

export const filterResources = (
  resources: readonly PublishedLearningResource[],
  filter: LearningFilter,
): PublishedLearningResource[] => resources.filter((resource) => {
  if (filter.area && areaOf(resource) !== filter.area) return false;
  if (filter.subject && resource.subject !== filter.subject) return false;
  if (filter.goals?.length && !filter.goals.some((goal) => resource.goals.includes(goal))) return false;
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

/** The objectives a subject has published resources for, in the Home's order. Derived, never typed. */
export const objectivesFor = (
  subject: LearningSubjectId,
  resources: readonly PublishedLearningResource[] = publishedResources,
): LearningGoalId[] =>
  OBJECTIVE_ORDER.filter((goal): goal is LearningGoalId =>
    goal !== 'tecnologia' && resources.some((resource) => resource.subject === subject && resource.goals.includes(goal as LearningGoalId)));
