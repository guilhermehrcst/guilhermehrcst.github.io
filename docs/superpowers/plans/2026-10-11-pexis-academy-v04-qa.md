# Pexis Academy V0.4: QA record (M1, M3, M4, M5)

Branch `claude/pexis-academy-v04`, based on `main` at `5991a4e` (V0.3). Local only: no push, PR, merge or
deploy. Reference: `docs/superpowers/specs/2026-10-11-pexis-academy-v04-design.md` and the V0.3 Home PDF.

## Gate B (editorial): not met

**0 of 60** candidates in `docs/superpowers/research/2026-10-11-v04-60-candidates.csv` are homologated
(all `PENDING_RECHECK`), because the network to the official sources is blocked in this environment.

- Nothing from the CSV is published.
- No verification date was changed.
- Every list in `src/lib/featured.ts` is empty and `FEATURED_STATE` is `'staging'`.

V0.4 is **not complete** until the sixty are homologated (spec §9).

## What changed

| Milestone | Change |
| --- | --- |
| M1 | `goals` replaced by `paths` + `exams`. Technology no longer counts in Ensino Médio (29 → 12). New formats `lesson`, `past-exam`, `simulator`, `reference`. Subjectless (multidisciplinary) resources. `featured.ts`, a typed selection in staging. |
| M3 | `SectionNav` (Médio, Vestibular, Tecnologia), `FeaturedResources` on all six path pages (renders only a complete selection), `ResourceGroups` (study / practise / consult). |
| M4 | Results open the resource at `#recurso-<id>` on its page. Five facets (path, subject, institution, language, format): AND across, OR inside. State in the URL. Fail-open without JS. |

## Commands and results (final head)

| Check | Result |
| --- | --- |
| `npm test` (Node test runner) | 140 pass, 0 fail |
| `npm run check` (`astro check`) | 0 errors, 0 warnings, 0 hints |
| `npm run build` (+ `scripts/verify-dist.mjs`) | 22 pages, 2 in preparation, 7 redirects, 404: all invariants hold |
| Each commit on its own | tests and typecheck green |

## RED → GREEN evidence

| Barrier | RED before the fix |
| --- | --- |
| `tests/learning-axes.test.ts` | 6 fail (paths missing, Ensino Médio 29) |
| `verify-dist`: Home count vs DOM | "says 29 for /ensino-medio/; its pages render 12" |
| `tests/featured.test.ts` | 8 fail, then `featuredReady` 1 fail |
| `verify-dist`: section nav | 3 pages without `nav[data-section-nav]` |
| `tests/search-filter.test.ts` | 10 fail |
| `verify-dist`: anchors and facets | 112 problems |

## Injected faults (each restored and checked afterwards)

All caught:

- **Technology resource placed in Ensino Médio** → build error.
- **Technology resource outside Tecnologia** → build error.
- **Exam outside its path** → build error.
- **Repeated path** → build error.
- **Ensino Superior groups disagree with the declared paths** → build error.
- **Featured id not declaring its path** → build error.
- **Complete selection on a path in preparation** → build error.
- **One highlight removed from the built HTML** → verify-dist: "holds 9, not ten".
- **Resource anchor removed or moved to another resource** → verify-dist: dangling anchor, and "must be the resource itself".
- **Subjectless ENEM resource** → lands on `/enem/#recurso-…`, with no subject facet. Without an exam, it fails the build.

## Browser QA (Chromium 1194, Playwright 1.56.1)

| Check | Result |
| --- | --- |
| Overflow: 24 pages + 404 × 320/360/390/768/1024/1440 | none |
| One H1, landmarks, `pt-BR`, alt text, canonical / noindex | all pages |
| Requests to third parties while loading | none |
| 7 legacy routes | land on their targets |
| 404 (`/404.html`, as GitHub Pages serves it) | noindex, three ways out |
| 37 published resources | all rendered, same outbound URLs as V0.3 |
| 7 technology tracks | same order and same resources as V0.3 |
| Sitemap | exactly the 22 canonical pages; Fundamental and Pré-Militar out |
| Home counts | equal the distinct resources rendered by each path's pages (12, 20, 6, 17) |
| Keyboard | every focused control on every page shows a ≥2px outline |
| Reduced motion | no transition or animation on the Home |
| No JavaScript | every page lists its resources; `/buscar/` keeps all 71 entries |
| Section nav | rows ≥44px; targets land below the sticky header; reachable by Tab |
| Search filters | AND/OR, text + filters, URL state, unknown values ignored, empty state, "Limpar filtros", keyboard, labels, 44px options |
| Search results | open the resource itself, below the header |

**Visual comparison with V0.3.** The Home is pixel-identical at all six widths except "29 recursos" →
"12 recursos" (between 177 and 635 pixels).

- Tecnologia is identical.
- Médio and Vestibular gain the section nav, in the V0.3 language (ruled rows, serif title, muted line).

## Not verified

- **Firefox and Safari/WebKit.** Not installed here; only Chromium was tested.
- **Screen readers.** No real assistive technology was used; structure and labels were checked in the DOM.
- **The 60 candidates.** No source could be opened. Gate B stays open.
- **GitHub Pages behaviour.** Unknown routes were checked by loading `404.html` directly.

## Risks

- **Search with a filter set.** Only resources match; the panel says so.
- **Unused highlight CSS.** Fundamental and Pré-Militar load the (unused) highlight styles: a few hundred bytes.
- **Escola Naval.** It is in the CSV but not on the Pré-Militar page: names there come from verified research.
