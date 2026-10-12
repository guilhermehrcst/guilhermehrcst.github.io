// Revised versions of records that are already published (or already decided), kept apart from the live
// record. A re-approval in a lot binds to the revision; until that lot is applied, the public catalogue
// keeps the live record exactly as published, and the build stays green. Once applied, the revision is
// what is published; folding it into the live record later (and removing it here) changes nothing, since
// the applied approval then matches the live record. Editing a live record in place still fails the build.
// See docs/academy/operacao-publicacao-incremental.md ("Mudar um recurso já publicado").
import type { LearningResource } from '../learning-resources.ts';

export const RECORD_REVISIONS: readonly LearningResource[] = [];
