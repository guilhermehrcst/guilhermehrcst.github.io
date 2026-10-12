// /buscar/: filters the directory already on the page (spec §6.8). Fail-open: the form starts hidden and
// is revealed only here, so if this script never runs the reader keeps the complete directory. No fetch,
// no storage; the query and the filters live in the URL (?q=…&caminho=…) so a search can be shared.
// V0.4 M4: the resources also filter by five facets (src/lib/search-filter.ts): AND across facets, OR
// inside one. While a filter is set, only resources can match.
import { filterEntries } from '../lib/search-normalize';
import { entryMatches, FACETS, parseSelection, writeSelection, type FacetId, type Facets, type Selection } from '../lib/search-filter';

const root = document.querySelector<HTMLElement>('[data-search]');
const form = root?.querySelector<HTMLFormElement>('[data-search-form]');
const input = root?.querySelector<HTMLInputElement>('[data-search-input]');
const status = root?.querySelector<HTMLElement>('[data-search-status]');
const empty = root?.querySelector<HTMLElement>('[data-search-empty]');
const emptyFiltered = root?.querySelector<HTMLElement>('[data-search-empty-filtered]');
const filters = root?.querySelector<HTMLDetailsElement>('[data-search-filters]');
const activeCount = root?.querySelector<HTMLElement>('[data-filter-count]');

if (root && form && input && status && empty && emptyFiltered && filters && activeCount) {
  const items = [...root.querySelectorAll<HTMLElement>('[data-search-entry]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-search-group]')];
  const boxes = [...form.querySelectorAll<HTMLInputElement>('[data-facet-option]')];
  const clears = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-clear]')];
  const facetsOf = (li: HTMLElement): Facets | undefined => {
    if (li.dataset['facetCaminho'] === undefined) return undefined;
    const read = (facet: FacetId) => (li.getAttribute(`data-facet-${facet}`) ?? '').split(' ').filter(Boolean);
    return Object.fromEntries(FACETS.map((facet) => [facet, read(facet)])) as Facets;
  };
  const entries = items.map((li) => ({ id: li.dataset['entryId'] ?? '', terms: li.dataset['terms'] ?? '', facets: facetsOf(li) }));
  const options = Object.fromEntries(FACETS.map((facet) => [facet, boxes.filter((b) => b.name === facet).map((b) => ({ value: b.value }))])) as Record<FacetId, { value: string }[]>;
  const one = status.dataset['one'] ?? '';
  const many = status.dataset['many'] ?? '';

  const selected = (): Selection =>
    Object.fromEntries(FACETS.map((facet) => [facet, boxes.filter((b) => b.name === facet && b.checked).map((b) => b.value)]));

  const apply = () => {
    const query = input.value;
    const selection = selected();
    const active = boxes.filter((b) => b.checked).length;
    const byText = new Set(filterEntries(entries, query).visible);
    const shown = new Set(entries.filter((e) => byText.has(e.id) && entryMatches(e.facets, selection)).map((e) => e.id));
    items.forEach((li, i) => { li.hidden = !shown.has(entries[i]!.id); });
    for (const group of groups) group.hidden = !group.querySelector('[data-search-entry]:not([hidden])');
    const count = shown.size;
    empty.hidden = count !== 0 || active > 0;
    emptyFiltered.hidden = count !== 0 || active === 0;
    for (const clear of clears) if (!emptyFiltered.contains(clear)) clear.hidden = active === 0;
    activeCount.textContent = active ? ` (${active})` : '';
    status.textContent = query.trim() || active ? (count === 1 ? one : many.replace('{n}', String(count))) : '';

    const url = new URL(location.href);
    if (query.trim()) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    writeSelection(url.searchParams, selection);
    history.replaceState(null, '', url);
  };

  form.hidden = false;
  const params = new URLSearchParams(location.search);
  input.value = params.get('q') ?? '';
  const initial = parseSelection(params, options);
  for (const box of boxes) box.checked = initial[box.name as FacetId]?.includes(box.value) ?? false;
  if (boxes.some((b) => b.checked)) filters.open = true;
  apply();
  input.addEventListener('input', apply);
  form.addEventListener('change', apply);
  form.addEventListener('submit', (event) => { event.preventDefault(); apply(); });
  for (const clear of clears) clear.addEventListener('click', () => {
    for (const box of boxes) box.checked = false;
    apply();
    input.focus();
  });
}
