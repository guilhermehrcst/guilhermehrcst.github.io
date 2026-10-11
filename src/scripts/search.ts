// /buscar/: filters the directory already on the page (spec §6.8). Fail-open: the form starts hidden and
// is revealed only here, so if this script never runs the reader keeps the complete directory. No fetch,
// no storage; the query lives in the URL (?q=) so a search can be shared.
import { filterEntries } from '../lib/search-normalize';

const root = document.querySelector<HTMLElement>('[data-search]');
const form = root?.querySelector<HTMLFormElement>('[data-search-form]');
const input = root?.querySelector<HTMLInputElement>('[data-search-input]');
const status = root?.querySelector<HTMLElement>('[data-search-status]');
const empty = root?.querySelector<HTMLElement>('[data-search-empty]');

if (root && form && input && status && empty) {
  const items = [...root.querySelectorAll<HTMLElement>('[data-search-entry]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-search-group]')];
  const entries = items.map((li) => ({ id: li.dataset['entryId'] ?? '', terms: li.dataset['terms'] ?? '' }));
  const one = status.dataset['one'] ?? '';
  const many = status.dataset['many'] ?? '';

  const apply = (query: string) => {
    const { visible, count } = filterEntries(entries, query);
    const shown = new Set(visible);
    items.forEach((li, i) => { li.hidden = !shown.has(entries[i]!.id); });
    for (const group of groups) group.hidden = !group.querySelector('[data-search-entry]:not([hidden])');
    empty.hidden = count !== 0;
    status.textContent = query.trim() ? (count === 1 ? one : many.replace('{n}', String(count))) : '';

    const url = new URL(location.href);
    if (query.trim()) url.searchParams.set('q', query);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };

  form.hidden = false;
  input.value = new URLSearchParams(location.search).get('q') ?? '';
  if (input.value) apply(input.value);
  input.addEventListener('input', () => apply(input.value));
  form.addEventListener('submit', (event) => { event.preventDefault(); apply(input.value); });
}
