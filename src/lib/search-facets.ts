// The options of each search filter (V0.4 M4), built at build time from the published resources: only
// values some resource has, in the taxonomy's order, each with its label. A facet never offers an option
// that would always come back empty.
import { LEARNING_FORMATS, type PublishedLearningResource } from './learning-resources.ts';
import { FACETS, providerKey, resourceFacets, type FacetId } from './search-filter.ts';
import { OBJECTIVES, PATH_ORDER, SUBJECT_ORDER, SUBJECTS } from './taxonomy.ts';
import { pt as t } from '../i18n/pt.ts';

export type FacetOption = { value: string; label: string };

export const facetOptions = (resources: readonly PublishedLearningResource[]): Record<FacetId, FacetOption[]> => {
  const has = (facet: FacetId, value: string) => resources.some((r) => resourceFacets(r)[facet].includes(value));
  const providers = [...new Set(resources.map((r) => r.provider))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const keys = providers.map(providerKey);
  if (new Set(keys).size !== keys.length) throw new Error('search-facets: two providers share a filter value');
  const options: Record<FacetId, FacetOption[]> = {
    caminho: PATH_ORDER.filter((id) => has('caminho', id)).map((id) => ({ value: id, label: OBJECTIVES[id].label })),
    materia: SUBJECT_ORDER.filter((id) => has('materia', id)).map((id) => ({ value: id, label: SUBJECTS[id].label })),
    instituicao: providers.map((provider) => ({ value: providerKey(provider), label: provider })),
    idioma: (['pt', 'en', 'es'] as const).filter((id) => has('idioma', id)).map((id) => ({ value: id, label: t.search.languages[id] })),
    formato: LEARNING_FORMATS.filter((id) => has('formato', id)).map((id) => ({ value: id, label: t.resource.formats[id] })),
  };
  for (const facet of FACETS) if (!options[facet].length) throw new Error(`search-facets: ${facet} offers nothing`);
  return options;
};
