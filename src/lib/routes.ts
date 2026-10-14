// Every internal URL, derived from the taxonomy (spec §6.2). Pages never write an internal path by
// hand: they ask here. URLs stay short and human; the technical grouping stays in the code.
import { ACADEMIC_SUBJECTS, EXAM_ORDER, OBJECTIVES, PATH_ORDER, PREPARING_PATHS, SUBJECTS, type ObjectiveId, type SubjectId } from './taxonomy.ts';

const objective = (id: ObjectiveId): string => `/${id}/`;

/** Technology is both an objective and a subject, with one page: /tecnologia/. */
const subject = (id: SubjectId): string => (id === 'tecnologia' ? objective('tecnologia') : `/materias/${SUBJECTS[id].slug}/`);

const topic = (subjectId: SubjectId, topicId: string): string => {
  const found = SUBJECTS[subjectId].topics.find((t) => t.id === topicId);
  // `published` is the literal `false` in V0.1; the check stays so the rule survives the type widening.
  if (!found || !(found.published as boolean)) throw new Error(`routes: topic ${subjectId}/${topicId} has no page`);
  return `${subject(subjectId)}${topicId}/`;
};

export const routes = {
  home: '/',
  objective,
  subjectIndex: '/materias/',
  subject,
  topic,
  search: '/buscar/',
  about: '/sobre/',
  /** The two libraries (header V0.5): every published resource, by what it is. */
  courses: '/cursos/',
  materials: '/materiais/',
} as const;

/** The indexable pages, in a stable order: each ready path, with Vestibular's exams right after it. */
export const canonicalPaths = (): string[] => [
  routes.home,
  ...PATH_ORDER.filter((id) => !PREPARING_PATHS.includes(id)).flatMap((id) =>
    id === 'vestibulares' ? [objective(id), ...EXAM_ORDER.map(objective)] : [objective(id)]),
  routes.subjectIndex,
  ...ACADEMIC_SUBJECTS.map(subject),
  routes.courses,
  routes.materials,
  routes.search,
  routes.about,
];

/** Pages of paths in preparation: built and linked, but noindex and out of the sitemap. */
export const preparingPaths = (): string[] => PREPARING_PATHS.map(objective);

/** Routes of the former personal site that keep a destination (spec §8.4). The résumé has none: it is gone. */
export const LEGACY_REDIRECTS: Readonly<Record<string, string>> = {
  '/pt/': routes.home,
  '/courses/': routes.subjectIndex,
  '/pt/cursos/': routes.subjectIndex,
  '/courses/enem/': objective('enem'),
  '/pt/cursos/enem/': objective('enem'),
  '/courses/uerj/': objective('uerj'),
  '/pt/cursos/uerj/': objective('uerj'),
};

/** The header (V0.5): Cursos and Materiais, the "Explorar" menu with the six paths, then search as an icon. */
export const HEADER_NAV: readonly { label: string; href: string }[] = [
  { label: 'Cursos', href: routes.courses },
  { label: 'Materiais', href: routes.materials },
];

/** The header's "Explorar" menu: the six paths, in the approved order. Nothing else. */
export const EXPLORE_MENU = {
  label: 'Explorar',
  items: PATH_ORDER.map((id) => ({ id, label: OBJECTIVES[id].label, href: objective(id) })),
} as const;

export type HeaderSection = 'cursos' | 'materiais' | 'explorar' | 'buscar';

/** The header item a page belongs to: a library, search, or Explorar for the paths, the exams inside
 *  Vestibular and the subjects (the /materias/ hub is Explorar's own page). Null when none holds it. */
export const sectionOf = (path: string): HeaderSection | null => {
  if (path === routes.courses) return 'cursos';
  if (path === routes.materials) return 'materiais';
  if (path === routes.search) return 'buscar';
  if ([...PATH_ORDER, ...EXAM_ORDER].some((id) => objective(id) === path) || path.startsWith(routes.subjectIndex)) return 'explorar';
  return null;
};
