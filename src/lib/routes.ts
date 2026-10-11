// Every internal URL, derived from the taxonomy (spec §6.2). Pages never write an internal path by
// hand: they ask here. URLs stay short and human; the technical grouping stays in the code.
import { ACADEMIC_SUBJECTS, OBJECTIVE_ORDER, SUBJECTS, type ObjectiveId, type SubjectId } from './taxonomy.ts';

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

/** The indexable pages of V0.1, in a stable order. */
export const canonicalPaths = (): string[] => [
  routes.home,
  ...OBJECTIVE_ORDER.map(objective),
  routes.subjectIndex,
  ...ACADEMIC_SUBJECTS.map(subject),
  routes.search,
  routes.about,
];

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

export const HEADER_NAV: readonly { label: string; href: string }[] = [
  { label: 'Explorar', href: routes.subjectIndex },
  { label: 'ENEM', href: objective('enem') },
  { label: 'UERJ', href: objective('uerj') },
  { label: 'Tecnologia', href: objective('tecnologia') },
  { label: 'Buscar', href: routes.search },
];
