// The editorial highlights (V0.4 spec §5.2): ten per path, sixty distinct in all. A selection over the
// catalogue, never a second catalogue: an id here must be a published resource that declares the path.
// A resource may be found in several paths through filters, but is featured in one only.
// The selection stays in 'staging' until every highlight is homologated at its source (spec §4.1); the
// 60 candidates of docs/superpowers/research/2026-10-11-v04-60-candidates.csv are not, so no list holds
// an id yet. No asset imports: this module runs under Node's test runner.
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { PATH_ORDER, type PathId } from './taxonomy.ts';

export type FeaturedState = 'staging' | 'final';

export const FEATURED_PER_PATH = 10;
export const FEATURED_STATE = 'staging' as FeaturedState;

export const FEATURED_RESOURCE_IDS_BY_PATH: Readonly<Record<PathId, readonly string[]>> = {
  'ensino-fundamental': [],
  'ensino-medio': [],
  vestibulares: [],
  'pre-militar': [],
  'ensino-superior': [],
  tecnologia: [],
};

/** Everything wrong with a selection, one line each; empty when it holds. Staging accepts fewer than ten
 *  per path; final requires exactly ten. Both refuse more than ten, unknown or unpublished ids, ids that do
 *  not declare the path, and ids listed twice or featured in two paths. */
export const featuredProblems = (
  selection: Readonly<Record<PathId, readonly string[]>>,
  state: FeaturedState,
  resources: readonly PublishedLearningResource[] = publishedResources,
): string[] => {
  const problems: string[] = [];
  const byId = new Map(resources.map((resource) => [resource.id, resource]));
  const featuredIn = new Map<string, PathId>();
  for (const path of PATH_ORDER) {
    const ids = selection[path] ?? [];
    if (ids.length > FEATURED_PER_PATH || (state === 'final' && ids.length !== FEATURED_PER_PATH)) {
      problems.push(`${path}: ${ids.length} of ${FEATURED_PER_PATH}`);
    }
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) { problems.push(`${path}: ${id} is listed twice`); continue; }
      seen.add(id);
      const resource = byId.get(id);
      if (!resource) { problems.push(`${path}: ${id} is not a published resource`); continue; }
      if (!resource.paths.includes(path)) problems.push(`${path}: ${id} does not declare ${path}`);
      const other = featuredIn.get(id);
      if (other) problems.push(`${id} is featured in ${other} and ${path}`);
      else featuredIn.set(id, path);
    }
  }
  return problems;
};

{
  const problems = featuredProblems(FEATURED_RESOURCE_IDS_BY_PATH, FEATURED_STATE);
  if (problems.length) throw new Error(`featured:\n${problems.join('\n')}`);
}

/** True only when the selection is final and holds: sixty distinct highlights, ten per path. */
export const featuredComplete = (): boolean =>
  FEATURED_STATE === 'final' && featuredProblems(FEATURED_RESOURCE_IDS_BY_PATH, 'final').length === 0;

/** A path shows its highlights only when the whole selection is valid and the path holds all ten: never an
 *  empty or partial "Destaques". Defaults to the real selection and catalogue. */
export const featuredReady = (
  path: PathId,
  selection: Readonly<Record<PathId, readonly string[]>> = FEATURED_RESOURCE_IDS_BY_PATH,
  resources: readonly PublishedLearningResource[] = publishedResources,
): boolean =>
  selection[path].length === FEATURED_PER_PATH && featuredProblems(selection, 'staging', resources).length === 0;

/** A path's highlights, in editorial order. */
export const featuredFor = (path: PathId): PublishedLearningResource[] => {
  const byId = new Map(publishedResources.map((resource) => [resource.id, resource]));
  // Every id was checked against the published catalogue when this module loaded.
  return FEATURED_RESOURCE_IDS_BY_PATH[path].map((id) => byId.get(id)!);
};
