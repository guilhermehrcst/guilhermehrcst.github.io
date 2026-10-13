// Pré-Militar: group only published resources by their actual content format.
// Independent video lessons are not military exam archives.
import type { LearningFormatId } from './learning-resources.ts';
export const MILITARY_MATERIAL_GROUPS = [
  { id: 'cursos', label: 'Cursos e videoaulas', formats: ['course', 'track', 'playlist', 'lessons', 'lesson'] },
  { id: 'exercicios', label: 'Exercícios e simulados', formats: ['practice', 'simulator'] },
  { id: 'provas', label: 'Provas oficiais anteriores', formats: ['past-exam'] },
  { id: 'apoio', label: 'Materiais de apoio', formats: ['reference'] },
] as const satisfies readonly { id: string; label: string; formats: readonly LearningFormatId[] }[];
export const militaryMaterialGroups = <R extends { format: LearningFormatId }>(resources: readonly R[]) =>
  MILITARY_MATERIAL_GROUPS.map(group => ({ id: group.id, label: group.label,
    resources: resources.filter(r => (group.formats as readonly LearningFormatId[]).includes(r.format)),
  })).filter(group => group.resources.length > 0);
