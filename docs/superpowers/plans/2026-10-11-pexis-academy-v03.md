# Pexis Academy V0.3: incremental plan

Spec: `docs/superpowers/specs/2026-10-11-pexis-academy-v03-design.md`.

Each step ends green before it is committed: the tests, `astro check`, the build and verify-dist. The
visible steps also need screenshots at 360, 768, 1024 and 1440.

| Step | Milestone | Commit content |
| --- | --- | --- |
| 1 | M0 | This plan and the spec. |
| 2 | M4 | Taxonomy and routes. `PATH_ORDER` and `EXAM_ORDER` (parent `vestibulares`) replace `OBJECTIVE_ORDER`. The preparing set and the canonical list are updated. The changes reach the search index, sitemap, verify-dist lists and tests (written first). |
| 3 | M4 | New pages. `/ensino-fundamental/` and `/pre-militar/` are in preparation and `noindex`; `/ensino-superior/` is built from `higher-education.ts`, with fail-closed ids. |
| 4 | M4 | `/vestibulares/` becomes "Vestibular", the exam hub. ENEM and UERJ get breadcrumbs. |
| 5 | M1 + M2 | Wine tokens and contrast pairs. The institutional header gets its disclosure menus; the wine footer gets its groups. |
| 6 | M3 | Home. Hero route demo; six objectives; journey with a second real example; sections restyled. |
| 7 | M5 | Internal pages. Shared intro with breadcrumb and state; Explorar hub; subject, tech, search and about pages; 404. |
| 8 | M6 | Brands. The status is re-checked and recorded, and is still pending if nothing can be verified. |
| 9 | M7 + M8 | Browser matrix, CLS, anchors, keyboard and menus, then the visual audit with fixes. Design-system doc, QA record and report. |

Not in scope: push, merge, deploy (they need authorisation) and any change to resource data.
