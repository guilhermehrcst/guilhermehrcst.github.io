// The Home's "Aprenda com fontes oficiais" (V0.2, V0.4 QA P1-RC1): each institution with published courses,
// how many, in which areas, and one internal link to them. An institution whose courses all live on one
// page leads to the track that holds its first course, as before. One whose courses span pages (MIT once
// its university courses are published) leads to the search filtered by that institution: a real filter
// value the search page offers, never an invented URL. The guards stay: only courses are counted, a course
// without a subject or without a page to show it fails the build. No asset imports (runs under Node).
import { institutions } from './learning-library.ts';
import type { PublishedLearningResource } from './learning-resources.ts';
import { facetOptions } from './search-facets.ts';
import { providerKey } from './search-filter.ts';
import { routes } from './routes.ts';
import type { TechTrack } from './tech-tracks.ts';
import { AREAS, SUBJECTS } from './taxonomy.ts';

export interface HomeSource {
  provider: string;
  count: number;
  /** The areas its courses cover, in catalogue order (one area: the page it leads to). */
  areas: string[];
  href: string;
}

export const homeSources = (
  providers: readonly string[],
  resources: readonly PublishedLearningResource[],
  tracks: readonly TechTrack[],
): HomeSource[] => {
  return institutions(providers, resources).map(({ provider, resources: own }) => {
    // The count reads "cursos": fail the build rather than let it say so of anything else.
    if (own.some((r) => r.format !== 'course')) throw new Error(`OfficialSources: ${provider} has a resource that is not a course`);
    const subjects = own.map((r) => {
      if (r.subject === null) throw new Error(`OfficialSources: ${provider} has a resource without a subject; say where`);
      return r.subject;
    });
    const areas = [...new Set(subjects.map((s) => AREAS[SUBJECTS[s].area].label))];
    const [first] = own;
    if (!first) throw new Error(`OfficialSources: ${provider} has no resource`);
    if (new Set(subjects).size === 1) {
      // The anchor is the published track that holds the first course: a real section on that page.
      const track = tracks.find((tr) => tr.resourceIds.includes(first.id));
      if (!track || first.subject !== 'tecnologia') throw new Error(`OfficialSources: ${provider} has no track to lead to`);
      return { provider, count: own.length, areas, href: `${routes.subject('tecnologia')}#${track.id}` };
    }
    // Several pages: the search, filtered by this institution, lists all of its courses.
    const value = providerKey(provider);
    if (!facetOptions(resources).instituicao.some((o) => o.value === value)) throw new Error(`OfficialSources: ${provider} has no search filter to lead to`);
    return { provider, count: own.length, areas, href: `${routes.search}?instituicao=${value}` };
  });
};
