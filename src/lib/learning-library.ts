import type {
  LearningAreaId,
  LearningFormatId,
  LearningGoalId,
  LearningSubjectId,
  PublishedLearningResource,
} from './learning-resources';

export type LearningFilter = {
  area?: LearningAreaId;
  subject?: LearningSubjectId;
  goals?: readonly LearningGoalId[];
  formats?: readonly LearningFormatId[];
};

export const filterResources = (
  resources: readonly PublishedLearningResource[],
  filter: LearningFilter,
): PublishedLearningResource[] => resources.filter((resource) => {
  if (filter.area && resource.area !== filter.area) return false;
  if (filter.subject && resource.subject !== filter.subject) return false;
  if (filter.goals?.length && !filter.goals.some((goal) => resource.goals.includes(goal))) return false;
  if (filter.formats?.length && !filter.formats.includes(resource.format)) return false;
  return true;
});

export const resourcesByArea = (
  resources: readonly PublishedLearningResource[],
  area: LearningAreaId,
): PublishedLearningResource[] => filterResources(resources, { area });

export const resourcesByIds = (
  resources: readonly PublishedLearningResource[],
  ids: readonly string[],
): PublishedLearningResource[] => {
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  return ids.flatMap((id) => {
    const resource = byId.get(id);
    return resource ? [resource] : [];
  });
};
