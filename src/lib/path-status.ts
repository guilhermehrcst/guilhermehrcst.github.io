// The consistency of the paths' publication state (V0.4 Gate B, P2). PATH_STATUS (taxonomy) is the one
// source; this module refuses any state in which status, highlights and catalogue disagree, so a path is
// never active without its content shown, nor indexed while in preparation:
//   - Fundamental and Pré-Militar are active only with their ten homologated highlights released and a
//     page that shows their resources (placement puts at least one there);
//   - a released selection on a path in preparation is refused (highlights would sit under noindex);
//   - every active path shows at least one published resource;
//   - a path's highlights are released only when active.
// Ten ids filled in staging authorise nothing. The four paths active since V0.3 need no highlights.
// No asset imports: this module runs under Node's test runner.
import { FEATURED_RELEASE, FEATURED_RESOURCE_IDS_BY_PATH, featuredReady, type FeaturedRelease } from './featured.ts';
import { publishedResources, type PublishedLearningResource } from './learning-resources.ts';
import { placementOf } from './placement.ts';
import { routes } from './routes.ts';
import { isPreparing, PATH_ORDER, PATH_STATUS, type PathId, type PathState } from './taxonomy.ts';

export { isPreparing };

/** The paths that leave preparation only with their ten highlights released. */
export const GATED_PATHS: readonly PathId[] = ['ensino-fundamental', 'pre-militar'];

export const activationProblems = (
  states: Readonly<Record<PathId, PathState>> = PATH_STATUS,
  selection: Readonly<Record<PathId, readonly string[]>> = FEATURED_RESOURCE_IDS_BY_PATH,
  resources: readonly PublishedLearningResource[] = publishedResources,
  release: Readonly<Record<PathId, FeaturedRelease>> = FEATURED_RELEASE,
): string[] => {
  const problems: string[] = [];
  for (const path of PATH_ORDER) {
    const active = states[path] === 'active';
    const released = release[path] === 'released';
    // Resources of this path that some page shows (on this path's page or a subject, exam or field page).
    const shown = resources.filter((r) => r.paths.includes(path) && placementOf(r, states) !== null).length;
    if (released && !active) problems.push(`${path}: released but still in preparation`);
    if (released && !featuredReady(path, selection, resources)) problems.push(`${path}: released without ten valid highlights`);
    if (!active) continue;
    if (GATED_PATHS.includes(path) && !(released && featuredReady(path, selection, resources))) {
      problems.push(`${path}: active without its ten homologated highlights released`);
    }
    if (GATED_PATHS.includes(path) && !resources.some((r) => placementOf(r, states)?.page === routes.objective(path))) {
      problems.push(`${path}: active without a page that shows its resources`);
    }
    if (shown === 0) problems.push(`${path}: active with no published resource`);
  }
  return problems;
};

{
  const problems = activationProblems();
  if (problems.length) throw new Error(`path-status:\n${problems.join('\n')}`);
}
