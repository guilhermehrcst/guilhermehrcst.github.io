// Every internal URL, derived from the taxonomy (spec §6.2). Pages never write an internal path by
// hand: they ask here. URLs stay short and human; the technical grouping stays in the code.
import { ACADEMIC_SUBJECTS, EXAM_ORDER, EXAM_PARENT, OBJECTIVES, PATH_ORDER, PREPARING_PATHS, SUBJECTS, type ExamId, type ObjectiveId, type SubjectId } from './taxonomy.ts';

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
} as const;

/** The indexable pages, in a stable order: each ready path, with Vestibular's exams right after it. */
export const canonicalPaths = (): string[] => [
  routes.home,
  ...PATH_ORDER.filter((id) => !PREPARING_PATHS.includes(id)).flatMap((id) =>
    id === 'vestibulares' ? [objective(id), ...EXAM_ORDER.map(objective)] : [objective(id)]),
  routes.subjectIndex,
  ...ACADEMIC_SUBJECTS.map(subject),
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

/** The header's "Explorar" menu: the six paths in the approved order, then every subject. */
export const EXPLORE_MENU = {
  label: 'Explorar',
  items: PATH_ORDER.map((id) => ({ id, label: OBJECTIVES[id].label, href: objective(id) })),
  all: { label: 'Todas as matérias', href: routes.subjectIndex },
} as const;

/** The header's direct links, after the menu (V0.3). The other paths are one step away, in Explorar. */
export const HEADER_NAV: readonly { label: string; href: string }[] = [
  { label: OBJECTIVES.vestibulares.label, href: objective('vestibulares') },
  { label: OBJECTIVES['pre-militar'].label, href: objective('pre-militar') },
  { label: OBJECTIVES.tecnologia.label, href: objective('tecnologia') },
  { label: 'Buscar', href: routes.search },
];

/** The header item a page belongs to: itself, or the section that holds it (an exam is inside
 *  Vestibular, a subject inside Explorar). Null when no header item holds it. */
export const sectionOf = (path: string): string | null => {
  const exam = EXAM_ORDER.find((id) => objective(id) === path);
  if (exam) return objective(EXAM_PARENT[exam as ExamId]);
  if (path.startsWith(routes.subjectIndex)) return routes.subjectIndex;
  return HEADER_NAV.some((item) => item.href === path) ? path : null;
};
