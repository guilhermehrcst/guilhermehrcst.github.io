// The search index (spec §6.8): one entry per path and exam, area, subject, published track and published
// resource, in a fixed order. Pure and deterministic. Every entry leads to a page of the site (a
// resource leads to where it is shown, never straight out), so /buscar/ stays a directory of the site.
// About 70 entries live inline in /buscar/; past ~500, move the index to a JSON file built at build time
// and loaded on demand.
import { areaOf, publishedResources } from './learning-resources.ts';
import { routes } from './routes.ts';
import { normalize } from './search-normalize.ts';
import { publishedTracks, publishedTracksFor } from './tech-tracks.ts';
import { AREA_ORDER, AREAS, EXAM_ORDER, EXAM_PARENT, OBJECTIVES, PATH_ORDER, PATH_STATUS, PREPARING_PATHS, SUBJECT_ORDER, SUBJECTS, subjectsOf } from './taxonomy.ts';
import { resourceFacets, type Facets } from './search-filter.ts';
import { placementOf, type Placeable, type PlacementContextResource } from './placement.ts';

export type SearchKind = 'biblioteca' | 'objetivo' | 'area' | 'materia' | 'trilha' | 'recurso';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  url: string;
  context: string;
  terms: string;
  /** A resource's values for each search filter (V0.4 M4); other entries have none. */
  facets?: Facets;
}

const entry = (kind: SearchKind, key: string, title: string, url: string, context: string, extra: readonly string[] = []): SearchEntry =>
  ({ id: `${kind}:${key}`, kind, title, url, context, terms: normalize([title, context, ...extra].join(' ')) });

/** The id of the element that is a resource, on the page that shows it (V0.4 §5.4). */
export const resourceAnchor = (id: string): string => `recurso-${id}`;

/** Where a resource is shown: its canonical page (src/lib/placement.ts, the rules the pages render by), and on
 *  /tecnologia/ the first track that holds it. No page shows it: the build fails rather than send the
 *  student somewhere it is not. */
export const resourceHome = (
  resource: Placeable,
  context: readonly PlacementContextResource[] = publishedResources,
): string => {
  // Default to the real published catalogue. A Gate B test may opt into an explicit
  // candidate context without changing the actual routes or indexable content.
  const at = placementOf(resource, PATH_STATUS, context);
  if (!at) throw new Error(`search-index: ${resource.id}: no page shows it yet`);
  if (at.page !== routes.objective('tecnologia')) return at.page;
  const track = publishedTracksFor(context).find((t) => t.resourceIds.includes(resource.id));
  if (!track) throw new Error(`search-index: ${resource.id}: no published track shows it`);
  return `${at.page}#${track.id}`;
};

/** Which resources of a page's lists carry their anchor: those whose home is this page, at their first
 *  occurrence. One set per list, in order. Anchors are never repeated, never on a page that is not home. */
export const anchorPlan = (
  page: string,
  lists: readonly (readonly Placeable[])[],
  context: readonly PlacementContextResource[] = publishedResources,
): Set<string>[] => {
  const done = new Set<string>();
  return lists.map((list) => {
    const anchored = new Set<string>();
    for (const resource of list) {
      if (done.has(resource.id) || resourceHome(resource, context).split('#')[0] !== page) continue;
      anchored.add(resource.id);
      done.add(resource.id);
    }
    return anchored;
  });
};

export const buildSearchIndex = (): SearchEntry[] => [
  entry('biblioteca', 'cursos', 'Cursos', routes.courses, 'Biblioteca', ['cursos gratuitos', 'trilhas', 'playlists', 'videoaulas', 'aulas']),
  entry('biblioteca', 'materiais', 'Materiais', routes.materials, 'Biblioteca', ['exercicios', 'simulados', 'provas anteriores', 'referencia']),
  ...PATH_ORDER.map((id) => entry('objetivo', id, OBJECTIVES[id].label, routes.objective(id), PREPARING_PATHS.includes(id) ? 'Caminho em preparação' : 'Caminho')),
  ...EXAM_ORDER.map((id) => entry('objetivo', id, OBJECTIVES[id].label, routes.objective(id), OBJECTIVES[EXAM_PARENT[id]].label, ['vestibular', 'prova'])),
  ...AREA_ORDER.map((id) => entry('area', id, AREAS[id].label, `${routes.subjectIndex}#area-${id}`, 'Área',
    subjectsOf(id).map((s) => SUBJECTS[s].label))),
  // A subject's context is its area, or "Matéria" when the area has the subject's own name (Matemática).
  ...SUBJECT_ORDER.map((id) => {
    const area = AREAS[SUBJECTS[id].area].label;
    return entry('materia', id, SUBJECTS[id].label, routes.subject(id), area === SUBJECTS[id].label ? 'Matéria' : area);
  }),
  ...publishedTracks().map((t) => entry('trilha', t.id, t.label, `${routes.objective('tecnologia')}#${t.id}`, 'Trilha de Tecnologia', [t.why])),
  ...publishedResources.map((r) => {
    const area = areaOf(r);
    const url = `${resourceHome(r).split('#')[0]}#${resourceAnchor(r.id)}`;
    const context = [r.provider, r.subject === null ? null : SUBJECTS[r.subject].label].filter(Boolean).join(' · ');
    return { ...entry('recurso', r.id, r.title, url, context, area === null ? [] : [AREAS[area].label]), facets: resourceFacets(r) };
  }),
];
