# Pexis Academy V0.3: design and educational architecture

Date: 2026-10-11. Branch `claude/pexis-academy-v01`, restarted from `main` at `9006c57` (PR #31, the official
identity, merged). Push, merge and deploy only with the owner's authorisation.

## 1. Real state (M0)

- **Stack.** Static Astro 7 with TypeScript strict.
  - Tests: Node's test runner, 94 tests.
  - `astro check` passes.
  - `scripts/verify-dist.mjs` runs post-build invariants with hand-written route lists.
  - No JavaScript except on `/buscar/`.
- **Routes.** 21 canonical, 7 legacy redirects, plus the 404.
  - The five Home "objectives": ENEM, UERJ, Ensino Médio, Vestibulares, Tecnologia.
  - Header: Explorar, ENEM, UERJ, Tecnologia, Buscar.
- **Identity** (PR #31):
  - the official lockup on a red plate in the header and footer, symbol icons;
  - `--brand` = `--action` = `#720111`, measured from the official artwork;
  - no vector original.
- **Catalogue.** 37 published resources, 3 held back, 7 technology tracks, 3 official exam sources.
  Every resource is tagged with goals: ensino-medio, enem, uerj, vestibulares.
- **No PDF of the current site was supplied.** The "current site" baseline is the build of `main`, screenshotted.
- **Network.** From this environment, every provider and official site is unreachable (curl and WebFetch
  both fail: proxy and DNS). No new source can be verified on its own page, and the promise on `/sobre/`
  requires exactly that.

## 2. Decisions

### 2.1 Six paths, in the approved order

| # | Path | Route | State in V0.3 |
| --- | --- | --- | --- |
| 1 | Ensino Fundamental | `/ensino-fundamental/` | **Em preparação.** Structure only, no resources: nothing in the catalogue is suited to the stage, and Ensino Médio material is never presented as Fundamental. `noindex`, not in the sitemap. |
| 2 | Ensino Médio | `/ensino-medio/` | Preserved and restyled. |
| 3 | Vestibular | `/vestibulares/` (unchanged) | The hub of entrance exams: ENEM and UERJ first, then the common base by subject. The title becomes "Vestibular". |
| 4 | Pré-Militar | `/pre-militar/` | **Em preparação.** Lists the selection processes by their official names only, with no requirement, subject, date or link. Edital verification is pending. `noindex`, not in the sitemap. |
| 5 | Ensino Superior | `/ensino-superior/` | University courses already verified in the catalogue (MIT OpenCourseWare, Harvard), grouped as Matemática and Computação. States openly that other areas are not yet covered. Indexable. |
| 6 | Tecnologia | `/tecnologia/` | Tracks preserved. |

ENEM (`/enem/`) and UERJ (`/uerj/`) stay as pages and routes. They are **exams under Vestibular**: they no
longer appear among the Home's paths. They appear inside Vestibular, under the Formação column of the
footer, and in breadcrumbs ("Vestibular / ENEM").

**In the code:**

- `PATH_ORDER` holds the six paths.
- `EXAM_ORDER` holds ENEM and UERJ, each with parent `vestibulares`.
- `ObjectiveId` is the union of both, and `routes.objective(id)` keeps working.
- Resource goals (`LearningGoalId`) are **not changed**: no academic data moves.

A page "em preparação" is named in `PREPARING_PATHS`. It:

- carries `noindex` and no canonical;
- is absent from the sitemap and from the canonical list;
- is still linked from the Home, the header and the footer, with its state shown.

### 2.2 Institutional header and footer

- **Header and footer.** Both are wine `#720111`, with the official lockup in white directly on the
  ground (no plate). The rest of the page stays off-white.
- **Header navigation:** Explorar (a disclosure menu listing the six paths and "Todas as matérias"),
  Vestibular, Pré-Militar, Tecnologia, Buscar.
- **Small screens:** below 900px the navigation folds into a "Menu" disclosure button.
- **No JavaScript.** Both are native `<details>`: keyboard operable, and they work without JavaScript.
  The cost is that a menu closes by its own button, not by Escape or an outside click.
- **Footer groups:**
  - Institucional: lockup, one paragraph, verification date, independence.
  - Formação: the six paths, with ENEM and UERJ indented under Vestibular.
  - Matérias.
  - Explorar: Explorar, Buscar, Sobre, Como verificamos.
  - A bottom bar with the real licences and the brand attribution.
  - No fictitious legal policy.

### 2.3 Colour

The wine is the institutional colour and the only action colour (unchanged from PR #31). New tokens for
the wine grounds:

- `--on-brand`: white, for text on wine;
- `--on-brand-muted`: a pale rose for secondary text;
- `--brand-deep`: a darker wine for hover and active states on wine;
- `--brand-line`: hairlines on wine.

Every pair is measured in `tests/contrast.test.ts`, including hover and focus.

### 2.4 Home

1. **Hero.** "Aprenda com direção.", a short lead, "Escolher meu objetivo" and "Explorar matérias".
   On the right, a product window showing a real route: Vestibular → ENEM → Matemática → Conteúdo
   (Matemática para ENEM, Kultivi) → Prática (Provas e gabaritos do Enem, INEP).
2. **"Qual é o seu objetivo?"** The six paths, numbered, with real counts. The preparing paths say
   "Em preparação" instead of a number.
3. **"Um caminho mais claro para aprender."** Objetivo → Área → Assunto → Conteúdo → Prática, with a
   second real example: Vestibular → Ciências da Natureza / Física → (topic pending) → Física para ENEM
   (Kultivi) → Questões de Física (Revista do Vestibular UERJ).
4. **Fontes oficiais.** Verified institutions only. The status of the six brands is unchanged: still
   pending, because nothing could be checked from here.
5. The remaining sections, restyled where needed: Áreas, Trilhas, Curadoria, FAQ.

### 2.5 Internal pages

- **Intro.** A shared intro gives every page a breadcrumb, an eyebrow, a serif H1, a lead and a "state"
  note when the page is in preparation.
- **Explorar.** `/materias/` becomes the hub: the six paths, then areas and subjects.
- **404.** Restyled.

### 2.6 Non-goals

No new dependency, no React, no animation library, no physical or medical training module, no
simulated exam, no invented requirement, programme or progress.

## 3. Barriers

- **Tests.** The six paths are checked in order, and so are the header navigation, the preparing set
  and the Superior groups (fail-closed ids).
- **verify-dist:**
  - The Home links the six paths in order.
  - `/vestibulares/` links `/enem/` and `/uerj/`.
  - `/enem/` and `/uerj/` carry a breadcrumb back to `/vestibulares/`.
  - Preparing pages are `noindex`, absent from the sitemap and list no resource.
  - Header and footer are wine, with the lockup.
  - The footer reaches every path, both exams, every subject, `/materias/`, `/buscar/` and `/sobre/`.
