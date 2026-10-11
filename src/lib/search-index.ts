// The search index (spec §6.8): one entry per objective, area, subject, published track and published
// resource, in a fixed order. Pure and deterministic. Every entry leads to a page of the site (a
// resource leads to where it is shown, never straight out), so /buscar/ stays a directory of the site.
// About 70 entries live inline in /buscar/; past ~500, move the index to a JSON file built at build time
// and loaded on demand.
import { areaOf, publishedResources } from './learning-resources.ts';
import { routes } from './routes.ts';
import { normalize } from './search-normalize.ts';
import { publishedTracks } from './tech-tracks.ts';
import { AREA_ORDER, AREAS, OBJECTIVE_ORDER, OBJECTIVES, SUBJECT_ORDER, SUBJECTS, subjectsOf, type SubjectId } from './taxonomy.ts';

export type SearchKind = 'objetivo' | 'area' | 'materia' | 'trilha' | 'recurso';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  url: string;
  context: string;
  terms: string;
}

const entry = (kind: SearchKind, key: string, title: string, url: string, context: string, extra: readonly string[] = []): SearchEntry =>
  ({ id: `${kind}:${key}`, kind, title, url, context, terms: normalize([title, context, ...extra].join(' ')) });

/** Where a resource is shown: its subject's page, or the first technology track that holds it. */
const homeOf = (id: string, subject: SubjectId): string => {
  if (subject !== 'tecnologia') return routes.subject(subject);
  const track = publishedTracks().find((t) => t.resourceIds.includes(id));
  return `${routes.objective('tecnologia')}${track ? `#${track.id}` : ''}`;
};

export const buildSearchIndex = (): SearchEntry[] => [
  ...OBJECTIVE_ORDER.map((id) => entry('objetivo', id, OBJECTIVES[id].label, routes.objective(id), 'Objetivo')),
  ...AREA_ORDER.map((id) => entry('area', id, AREAS[id].label, `${routes.subjectIndex}#area-${id}`, 'Área',
    subjectsOf(id).map((s) => SUBJECTS[s].label))),
  ...SUBJECT_ORDER.map((id) => entry('materia', id, SUBJECTS[id].label, routes.subject(id), AREAS[SUBJECTS[id].area].label)),
  ...publishedTracks().map((t) => entry('trilha', t.id, t.label, `${routes.objective('tecnologia')}#${t.id}`, 'Trilha de Tecnologia', [t.why])),
  ...publishedResources.map((r) => entry('recurso', r.id, r.title, homeOf(r.id, r.subject),
    `${r.provider} · ${SUBJECTS[r.subject].label}`, [AREAS[areaOf(r)].label])),
];
