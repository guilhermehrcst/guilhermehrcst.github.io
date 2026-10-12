// The lot manifests of the Academy (src/data/academy-release/lots/), one import per file, in lot order.
// A manifest is a decision record written by a person; listing it here does not publish it: only
// src/data/academy-release/release.json applies a lot. tests/incremental-release/repository.test.ts keeps
// this list equal to the files on disk, so a manifest is never dropped or added silently.
export const LOT_MANIFESTS: readonly unknown[] = [];
