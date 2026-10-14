// The global navigation (V1): the six paths in the header, each with what it holds by kind of content:
// Cursos, Livros and Provas. Derived at build time from the published catalogue and the editorial book
// layer, never typed: a kind with nothing published says "Em preparação" and links nowhere. The
// destinations are the two libraries, filtered by a shareable URL (the path in the query, the view in the
// fragment, which the page answers in CSS with :target: no JavaScript, no page per combination).
// No asset imports: this module runs under Node's test runner.
import { BOOK_CLASSIFICATIONS, bookKindOf, type BookClassification } from './books.ts';
import { publishedResources, type LearningFormatId, type PublishedLearningResource } from './learning-resources.ts';
import { COURSE_FORMATS, type LibraryId } from './libraries.ts';
import { routes } from './routes.ts';
import { EXAM_ORDER, EXAM_PARENT, OBJECTIVES, PATH_ORDER, PREPARING_PATHS, type PathId } from './taxonomy.ts';

/** The header's order, as the owner set it (it differs from PATH_ORDER on purpose). */
export const NAV_PATHS = ['ensino-fundamental', 'ensino-medio', 'pre-militar', 'vestibulares', 'ensino-superior', 'tecnologia'] as const satisfies readonly PathId[];

/** The short names of the header line. The full names (OBJECTIVES) title the menus. */
export const NAV_LABELS: Readonly<Record<PathId, string>> = {
  'ensino-fundamental': 'Fundamental',
  'ensino-medio': 'Médio',
  'pre-militar': 'Pré-Militar',
  vestibulares: 'Vestibular',
  'ensino-superior': 'Superior',
  tecnologia: 'Tecnologia',
};

export const CONTENT_TYPES = ['cursos', 'livros', 'provas'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

/** Provas: past exams (with their answer keys) and simulados. An exercise list is practice, never a prova. */
export const EXAM_FORMATS = ['past-exam', 'simulator'] as const satisfies readonly LearningFormatId[];

/** The kind of content a published resource is, or null when it is none of the three (practice, or a
 *  reference not classified as a reading material). */
export const contentTypeOf = (
  resource: Pick<PublishedLearningResource, 'id' | 'format'>,
  books: readonly BookClassification[] = BOOK_CLASSIFICATIONS,
): ContentType | null => {
  if ((COURSE_FORMATS as readonly LearningFormatId[]).includes(resource.format)) return 'cursos';
  if ((EXAM_FORMATS as readonly LearningFormatId[]).includes(resource.format)) return 'provas';
  if (bookKindOf(resource.id, books) !== null) return 'livros';
  return null;
};

/** The library that holds each kind. */
export const LIBRARY_OF_TYPE: Readonly<Record<ContentType, LibraryId>> = { cursos: 'cursos', livros: 'materiais', provas: 'materiais' };

/** The id of a filtered view on its library page: the fragment of its URL. */
export const viewId = (type: ContentType, path: PathId): string => `${type}-${path}`;

/** The shareable URL of a filtered view. The query names it for people (and makes every view a distinct
 *  document, so following one always closes the menu it came from); the fragment selects it. */
export const viewHref = (type: ContentType, path: PathId): string =>
  type === 'cursos'
    ? `${routes.courses}?caminho=${path}#${viewId(type, path)}`
    : `${routes.materials}?caminho=${path}&tipo=${type}#${viewId(type, path)}`;

/** How many published resources of this kind serve this path. A path in preparation lists none. */
export const countOf = (
  type: ContentType,
  path: PathId,
  resources: readonly PublishedLearningResource[] = publishedResources,
  books: readonly BookClassification[] = BOOK_CLASSIFICATIONS,
): number =>
  PREPARING_PATHS.includes(path) ? 0 : resources.filter((r) => r.paths.includes(path) && contentTypeOf(r, books) === type).length;

export interface NavEntry {
  type: ContentType;
  count: number;
  /** Null: nothing published yet ("Em preparação"), and no link. */
  href: string | null;
}

export interface NavMenu {
  id: PathId;
  /** The short name, on the header line. */
  label: string;
  /** The full name, titling the menu. */
  name: string;
  preparing: boolean;
  /** The path's own page. */
  explore: string;
  entries: NavEntry[];
}

export const globalNav = (
  resources: readonly PublishedLearningResource[] = publishedResources,
  books: readonly BookClassification[] = BOOK_CLASSIFICATIONS,
): NavMenu[] =>
  NAV_PATHS.map((id) => ({
    id,
    label: NAV_LABELS[id],
    name: OBJECTIVES[id].label,
    preparing: PREPARING_PATHS.includes(id),
    explore: routes.objective(id),
    entries: CONTENT_TYPES.map((type) => {
      const count = countOf(type, id, resources, books);
      return { type, count, href: count > 0 ? viewHref(type, id) : null };
    }),
  }));

/** The filtered views a library page answers: every path for each kind it holds, empty ones included, so a
 *  shared URL always lands on a view that says what it holds. */
export const libraryViews = (
  library: LibraryId,
  resources: readonly PublishedLearningResource[] = publishedResources,
  books: readonly BookClassification[] = BOOK_CLASSIFICATIONS,
): { id: string; type: ContentType; path: PathId; count: number }[] =>
  CONTENT_TYPES.filter((type) => LIBRARY_OF_TYPE[type] === library).flatMap((type) =>
    NAV_PATHS.map((path) => ({ id: viewId(type, path), type, path, count: countOf(type, path, resources, books) })));

/** The path a page belongs to, for the header's current marker: a path's page, or an exam inside it. The
 *  libraries are marked by their view (in CSS); other pages belong to no path. */
export const navPathOf = (pathname: string): PathId | null => {
  const path = PATH_ORDER.find((id) => routes.objective(id) === pathname);
  if (path) return path;
  const exam = EXAM_ORDER.find((id) => routes.objective(id) === pathname);
  return exam ? EXAM_PARENT[exam] : null;
};
