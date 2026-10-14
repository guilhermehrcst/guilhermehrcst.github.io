// Books (Global Navigation V1): which published resources are reading materials, by an editorial decision,
// never by inference. A record's format says what a resource is (a reference may be an atlas, a table or a
// portal); being a book, an apostila or a reading is a further claim, made here, one id at a time, after the
// editorial check. An editorial layer outside the catalogue records (like course-presentations.ts): the
// records and their release digests stay untouched. Empty until a reading material is approved: until then
// "Livros" says "Em preparação" on every path. No asset imports: this module runs under Node's test runner.
import { publishedResources, type LearningFormatId, type PublishedLearningResource } from './learning-resources.ts';

export const BOOK_KINDS = ['livro', 'apostila', 'leitura'] as const;
export type BookKind = (typeof BOOK_KINDS)[number];

export interface BookClassification {
  /** A published resource. */
  id: string;
  kind: BookKind;
}

/** Only a reference can be a reading material: a course, an exercise list or a past exam never is. */
export const BOOK_FORMATS = ['reference'] as const satisfies readonly LearningFormatId[];

/** The approved classifications. Empty: no reading material has passed the editorial check yet. */
export const BOOK_CLASSIFICATIONS: readonly BookClassification[] = [];

/** Every classification names a published reference, once, with a known kind. Throws otherwise: a wrong
 *  classification fails the build instead of reaching a page. */
export const validateBooks = (
  classifications: readonly BookClassification[],
  resources: readonly Pick<PublishedLearningResource, 'id' | 'format'>[],
): void => {
  const seen = new Set<string>();
  for (const { id, kind } of classifications) {
    if (seen.has(id)) throw new Error(`books: ${id} is classified twice`);
    seen.add(id);
    if (!(BOOK_KINDS as readonly string[]).includes(kind)) throw new Error(`books: ${id} has an unknown kind ${kind}`);
    const resource = resources.find((r) => r.id === id);
    if (!resource) throw new Error(`books: ${id} is not a published resource`);
    if (!(BOOK_FORMATS as readonly LearningFormatId[]).includes(resource.format)) throw new Error(`books: ${id} is a ${resource.format}, not a reference`);
  }
};

validateBooks(BOOK_CLASSIFICATIONS, publishedResources);

/** The kind of a published resource that is a reading material, or null. */
export const bookKindOf = (id: string, classifications: readonly BookClassification[] = BOOK_CLASSIFICATIONS): BookKind | null =>
  classifications.find((c) => c.id === id)?.kind ?? null;
