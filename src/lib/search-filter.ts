// The search filters (V0.4 M4, spec §6): five facets of a resource. Values combine with AND across facets
// and OR inside one; an empty facet does not filter. A resource without a subject has no subject value, so
// a subject filter leaves it out and the others keep it: it is never given a false subject. Pure, with no
// catalogue or copy imports: it runs at build time and in the /buscar/ script.
import { normalize } from './search-normalize.ts';
import type { PublishedLearningResource } from './learning-resources.ts';

export const FACETS = ['caminho', 'materia', 'instituicao', 'idioma', 'formato'] as const;
export type FacetId = (typeof FACETS)[number];
export type Facets = Record<FacetId, string[]>;
export type Selection = Partial<Record<FacetId, readonly string[]>>;

/** A provider as a URL-safe value: "Fundação Bradesco + Microsoft" → "fundacao-bradesco-microsoft". */
export const providerKey = (provider: string): string => normalize(provider).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const resourceFacets = (r: Pick<PublishedLearningResource, 'paths' | 'subject' | 'provider' | 'language' | 'format'>): Facets => ({
  caminho: [...r.paths],
  materia: r.subject === null ? [] : [r.subject],
  instituicao: [providerKey(r.provider)],
  idioma: [r.language],
  formato: [r.format],
});

/** An entry without facets (a path, an area, a subject page) is shown only when no filter is set. */
export const entryMatches = (facets: Facets | undefined, selection: Selection): boolean => {
  const active = FACETS.filter((facet) => (selection[facet]?.length ?? 0) > 0);
  if (!active.length) return true;
  if (!facets) return false;
  return active.every((facet) => selection[facet]!.some((value) => facets[facet].includes(value)));
};

/** The selection in the URL (?caminho=a,b&idioma=pt). Only known facets and values offered by the page are
 *  kept: the URL is input, never trusted. */
export const parseSelection = (
  params: URLSearchParams,
  options: Readonly<Record<FacetId, readonly { value: string }[]>>,
): Selection => {
  const selection: Selection = {};
  for (const facet of FACETS) {
    const offered = new Set(options[facet]?.map((option) => option.value));
    const values = [...new Set((params.get(facet) ?? '').split(',').filter((value) => offered.has(value)))];
    if (values.length) selection[facet] = values;
  }
  return selection;
};

export const writeSelection = (params: URLSearchParams, selection: Selection): void => {
  for (const facet of FACETS) {
    params.delete(facet);
    if (selection[facet]?.length) params.set(facet, selection[facet]!.join(','));
  }
};
