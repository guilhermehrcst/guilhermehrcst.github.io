# Staging guards and release-candidate tests (V0.4 QA, 2026-10-12)

The suite has two kinds of test.

- **`tests/release-candidate/`** proves the code is ready for the catalogue a release would publish (`context.ts`: the 37 published records plus the typed Gate B candidates). These tests pass **today and after the release**; a release must not touch them.
- **Every other test** holds the current state. The ones listed below (42) are *staging guards and snapshots*: they pass today and **fail by design** once a release promotes the candidates. A release commit updates each of them deliberately, one by one, with the reason; it never deletes or skips one.

Measured on 2026-10-12 by applying a release's deliberate steps (`docs/superpowers/qa/2026-10-12-v04-evidence/rc-apply.py`: promotion, 60 highlights released, Fundamental and Pré-Militar active, verify-dist hand lists) to a discardable worktree, with **no workaround** for any finding: build and verify-dist pass (24 pages), `tests/release-candidate/` passes, and exactly these fail (41 measured on 2026-10-12, plus one added with the menu fix from the Codex review on PR #38).

**Since the incremental release engine (branch `feat/academy-incremental-release-engine-v01`):** a release
no longer promotes staging into the catalogue; it applies authorized lots (`src/data/academy-release/`,
`docs/academy/operacao-publicacao-incremental.md`). `rc-apply.py` is kept as the record of this measurement
and is refused by the engine if run today. The guards a partial (lot) release meets are measured separately
in `docs/superpowers/qa/2026-10-12-incremental-release/guards-AB.txt`. This table and its 42 rows are
unchanged.

Kinds: **A** guards against publication or activation (they must flip only with an authorised release); **B** snapshots of counts and lists that grow with the catalogue.

| File | Test | Kind |
|---|---|---|
| `exam-guides.test.ts` | staging today: the INEP source is not shown as a resource, so the note keeps its external link | A |
| `featured.test.ts` | staging today: no highlight is homologated, so every list is empty and the selection is incomplete | A |
| `featured.test.ts` | featuredFor resolves a path to its published resources in order | A |
| `featured.test.ts` | featuredReady: a path is ready only with ten valid highlights | A |
| `gateb-conditional-placement.test.ts` | T2 higher education: six new offerings have conditional field destinations without premature groups | A |
| `gateb-conditional-placement.test.ts` | T2 technology: seven existing published tracks stay unchanged until future candidates enter catalogue | A |
| `gateb-conditional-placement.test.ts` | T2 all verified candidates have future placement; real publication flags remain unchanged | A |
| `gateb-higher-education-content.test.ts` | T2 higher education: the existing two-group copy remains unchanged until a new resource is published | A |
| `gateb-higher-education-content.test.ts` | T2 higher education: every future university course has an anchor when its group is published | A |
| `gateb-higher-education-content.test.ts` | T2 higher education: no staged group is rendered or described before the release | A |
| `gateb-selection-preview.test.ts` | T2: draft matches the audited manifest exactly, slot by slot and in editorial order | A |
| `gateb-selection-preview.test.ts` | T2: draft uses the original catalogue and two staging sets, never duplicates data | A |
| `gateb-selection-preview.test.ts` | T2: all sixty provisional candidates obey P4 and the existing featured gate | A |
| `gateb-selection-preview.test.ts` | T2: all nine previously missing destinations have conditional routes without public activation | A |
| `gateb-selection-preview.test.ts` | T2: Fundamental and Pré-Militar remain preparing until a separately approved release | A |
| `gateb-typed-staging.test.ts` | Gate B: reuse 23 published and 23 typed staging records, add exactly 14 without duplicates | A |
| `gateb-typed-staging.test.ts` | Gate B: publication remains disabled and all earlier partial attempts remain historical | A |
| `higher-education.test.ts` | staging today: exactly the two V0.3 groups are shown (no Gate B course is published yet) | A |
| `home-sources.test.ts` | staging today: every institution keeps its single-page link and count, exactly as before | A |
| `learning-axes.test.ts` | a technology resource serves Tecnologia and never Ensino Médio by inheritance | B |
| `learning-axes.test.ts` | every count is the number of distinct published resources of that path or exam | B |
| `learning-library.test.ts` | objectivesFor derives, in the Home order, the objectives a subject has resources for | B |
| `learning-library.test.ts` | objectiveFacts counts what each path really holds | B |
| `learning-library.test.ts` | institutions lists only providers that publish, with their resources in catalogue order | B |
| `learning-resources.test.ts` | the catalogue is exactly the 40 records of the snapshot, field by field | B |
| `learning-resources.test.ts` | 37 published, 3 held back with a review note | B |
| `path-status.test.ts` | P2: one status per path; PREPARING_PATHS is derived from it | A |
| `placement.test.ts` | P1: the 37 published resources keep exactly the page they live on at 5bc12a6 (ENEM/UERJ unchanged) | B |
| `placement.test.ts` | P1: no destination on a page in preparation; a published resource without a destination fails | A |
| `routes.test.ts` | the 22 canonical routes, exactly and in a stable order | B |
| `routes.test.ts` | the paths in preparation have pages but are not canonical (noindex, out of the sitemap) | A |
| `search-filter.test.ts` | facet options: only values some resource has, in the taxonomy order, each with its label | B |
| `search-index.test.ts` | one entry per objective, area, subject, published track and published resource | B |
| `staging-lote03.test.ts` | Lote 03: the three military collections stay partial: recorded, never staged as ready, never in the draft | A |
| `staging.test.ts` | reuse: the published ids are re-verified, never duplicated | A |
| `staging.test.ts` | staged records are not published: not in the catalogue, not imported by any page or component | A |
| `staging.test.ts` | nothing is released or activated by this lot | A |
| `taxonomy.test.ts` | the paths in preparation are named, and are paths | A |
| `tech-tracks.test.ts` | the tracks and their resources are exactly the spec | B |
| `tech-tracks.test.ts` | a published track is never empty; a planned one is never shown | B |
| `verification.test.ts` | P4: the legacy set is exactly the 37 published today, and they need nothing new | B |
| `higher-education.test.ts` | staging today: the Superior summary is the released V0.3 text, in the menu and on the Home | B |
