// Pure selections over the catalogue. Pages compose lists at build time from these; nothing here
// runs in the browser.
import { areaOf, isPractice, publishedResources } from './learning-resources.ts';
import { publishedTracks } from './tech-tracks.ts';
import { AREA_ORDER, AREAS, EXAM_ORDER, PATH_ORDER, SUBJECTS, subjectsOf } from './taxonomy.ts';
import type {
  LearningFormatId,
  LearningSubjectId,
  PublishedLearningResource,
} from './learning-resources';
import type { AreaId, ExamId, ObjectiveId, PathId, SubjectId } from './taxonomy';

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

/** A path seen through the school areas (Technology aside, it has its own path): each area with its subjects,
 *  each with the published resources that declare the path. Without `practice`, practice is left out (on
 *  Vestibular it lives on the exam pages). An empty subject or area is left out, never shown empty. The one
 *  source of both the map and its in-page navigation. */
export const mapSections = (
  path: PathId,
  { practice = true }: { practice?: boolean } = {},
  resources: readonly PublishedLearningResource[] = publishedResources,
): { id: AreaId; label: string; subjects: { id: SubjectId; label: string; resources: PublishedLearningResource[] }[] }[] =>
  AREA_ORDER.filter((id) => id !== 'tecnologia')
    .map((id) => ({
      id,
      label: AREAS[id].label,
      subjects: subjectsOf(id)
        .map((s) => ({ id: s, label: SUBJECTS[s].label, resources: filterResources(resources, { subject: s, paths: [path] }).filter((r) => practice || !isPractice(r)) }))
        .filter((s) => s.resources.length > 0),
    }))
    .filter((area) => area.subjects.length > 0);

/** The in-page navigation rows for a path's map: each area with its subjects; an area named like its only
 *  subject (Matemática) says how many resources it holds instead, so its link never reads like the link to
 *  the subject's page. */
export const mapNavItems = (
  path: PathId,
  options: { practice?: boolean } = {},
  facts: (resources: number) => string,
): { id: AreaId; label: string; why: string }[] =>
  mapSections(path, options).map((area) => {
    const names = area.subjects.map((s) => s.label);
    const resources = new Set(area.subjects.flatMap((s) => s.resources.map((r) => r.id))).size;
    return { id: area.id, label: area.label, why: names.length === 1 && names[0] === area.label ? facts(resources) : names.join(', ') };
  });
