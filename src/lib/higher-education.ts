// Ensino Superior (V0.3): university courses already verified in the catalogue, grouped by field. It is
// not a programme or a curriculum: each group names a field and lists real courses, by id, in reading
// order. An unknown or unpublished id fails the build. A field with no verified course is not shown.
// No asset imports: this module runs under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';

export type HigherEducationGroupId = 'matematica' | 'computacao';

export interface HigherEducationGroup {
  id: HigherEducationGroupId;
  label: string;
  why: string;
  resourceIds: readonly string[];
}

export const HIGHER_EDUCATION_GROUPS: readonly HigherEducationGroup[] = [
  {
    id: 'matematica',
    label: 'Matemática',
    why: 'Disciplinas de matemática de cursos universitários, com aulas e materiais publicados pelo MIT.',
    resourceIds: ['mit-1806', 'mit-6042j'],
  },
  {
    id: 'computacao',
    label: 'Computação',
    why: 'Cursos introdutórios e de base da computação, como são ensinados em Harvard e no MIT.',
    resourceIds: ['cs50x', 'mit-6100l', 'mit-6006', 'mit-60002'],
  },
];

export const resolveGroups = (
  groups: readonly HigherEducationGroup[],
  resources: readonly PublishedLearningResource[] = publishedResources,
): { id: HigherEducationGroupId; label: string; why: string; resources: PublishedLearningResource[] }[] => {
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    why: group.why,
    resources: group.resourceIds.map((id) => {
      const resource = byId.get(id);
      if (!resource) throw new Error(`higher-education: unknown or unpublished resource ${id}`);
      return resource;
    }),
  }));
};

export const higherEducation = () => resolveGroups(HIGHER_EDUCATION_GROUPS);
