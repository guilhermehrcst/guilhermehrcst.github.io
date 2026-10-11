// Search text as students type it: lowercase, without accents, single spaces. Shared by the index (at
// build time) and the /buscar/ script (in the browser), so both sides read words the same way.

export const normalize = (s: string): string =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Every word of the query appears in the terms, in any order. An empty query matches everything. */
export const matches = (terms: string, query: string): boolean =>
  normalize(query).split(' ').filter(Boolean).every((word) => terms.includes(word));

export const filterEntries = (
  entries: readonly { id: string; terms: string }[],
  query: string,
): { visible: string[]; count: number } => {
  const visible = entries.filter((entry) => matches(entry.terms, query)).map((entry) => entry.id);
  return { visible, count: visible.length };
};
