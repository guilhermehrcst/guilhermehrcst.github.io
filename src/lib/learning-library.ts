// Pure selections over the catalogue. Pages compose lists at build time from these; nothing here
// runs in the browser.
import { areaOf, publishedResources } from './learning-resources.ts';
import { higherEducation } from './higher-education.ts';
import { publishedTracks } from './tech-tracks.ts';
import type {
  LearningFormatId,
  LearningGoalId,
  LearningSubjectId,
  PublishedLearningResource,
} from './learning-resources';
import type { AreaId, ObjectiveId } from './taxonomy';

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
  GOAL_ORDER.filter((goal) => resources.some((resource) => resource.subject === subject && resource.goals.includes(goal)));

/** The order in which a subject page lists the objectives it serves (exams first, as since V0.1). */
const GOAL_ORDER: readonly LearningGoalId[] = ['enem', 'uerj', 'ensino-medio', 'vestibulares'];

/** What a path or exam really holds, counted from the catalogue. Vestibular holds its exams; Ensino
 *  Superior holds its university courses; Tecnologia adds its tracks; a path in preparation holds nothing. */
export const objectiveFacts = (
  objective: ObjectiveId,
  resources: readonly PublishedLearningResource[] = publishedResources,
): { resources: number; tracks?: number } => {
  switch (objective) {
    case 'tecnologia':
      return { resources: resources.filter((resource) => resource.subject === 'tecnologia').length, tracks: publishedTracks().length };
    case 'vestibulares':
      return { resources: filterResources(resources, { goals: ['vestibulares', 'enem', 'uerj'] }).length };
    case 'ensino-superior':
      return { resources: higherEducation().flatMap((group) => group.resources).length };
    case 'ensino-fundamental':
    case 'pre-militar':
      return { resources: 0 };
    default:
      return { resources: filterResources(resources, { goals: [objective] }).length };
  }
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
