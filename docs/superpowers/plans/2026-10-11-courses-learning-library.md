# Courses Learning Library V0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing Courses catalogue into a typed, curated library of 100%-free resources for Ensino Médio, ENEM, UERJ, vestibulares, and technology, with dedicated ENEM/UERJ study-track pages.

**Architecture:** Keep Astro and the existing editorial Courses visual system. Replace the technology-only course domain with one central typed learning-resource catalogue plus pure filtering/track helpers; the general library and both exam pages render from that shared data. Filters are progressive enhancement with server-rendered content as the fail-open baseline.

**Tech Stack:** Astro 7.3.6, TypeScript 6.0.3, Node >=22.12.0 built-in test runner, native DOM APIs, existing Google Sans Flex/CSS system.

**Spec:** `docs/superpowers/specs/2026-10-11-courses-learning-library-design.md`

## Global Constraints

- Primary areas: Tecnologia, Matemática, Português, Redação, Ciências da Natureza, Ciências Humanas, Inglês, Espanhol.
- Nature subsubjects: Física, Química, Biologia. Humanities subsubjects: História, Geografia, Filosofia, Sociologia.
- Audience: Ensino Médio and vestibular preparation; Ensino Fundamental-specific content is out of scope.
- Accepted formats: complete course, study track, playlist, lesson series, practice/simulator/past-exam collection.
- Publish only resources whose represented learning content is 100% free; trials, teaser-only resources, and essential paywalls are forbidden.
- Account-required and direct-access free resources are both allowed.
- ENEM and UERJ are both filters and dedicated study-track pages.
- One central resource definition must feed the general library and exam pages; no duplicated resource records.
- Preserve PT/EN parity and the current editorial Courses system; no framework or CMS is added.
- External URLs must be verified, never guessed.
- Client-side filters must fail open: with JavaScript disabled, the complete server-rendered library remains usable.

## Review Focus

- **Resource with multiple goals**: it must appear when any selected goal matches, without duplicating the entry.
- **No-JS / script failure**: all resources remain visible and all links remain usable; filters do not leave content hidden.
- **Empty filter combination**: the page shows a clear localized empty-state and the reset control restores all entries.
- **New external provider / YouTube URL**: build verification accepts only the explicitly verified HTTPS host and still requires `target="_blank"` + `rel="noopener noreferrer"`.
- **Exam-track drift**: every resource id referenced by ENEM/UERJ tracks must exist, be published, be free-verified, and carry the matching exam goal.

---

## File Structure

### Domain/data
- Create `src/lib/learning-resources.ts` — resource types, catalogue, publication validation, existing technology migration.
- Create `src/lib/learning-library.ts` — pure area/goal/format/subject filter helpers.
- Create `src/lib/study-tracks.ts` — ENEM/UERJ track definitions and validation.
- Create `tests/learning-resources.test.ts` — catalogue invariants and coverage.
- Create `tests/learning-library.test.ts` — pure filter behavior.
- Create `tests/study-tracks.test.ts` — track-to-catalogue integrity.

### UI
- Modify `src/components/Courses.astro` — general library shell and area sections.
- Create `src/components/LearningResourceCard.astro` — generic resource cell based on the current CourseCard visual language.
- Modify `src/components/CourseProvider.astro` — make copy/provider fallback generic to resources.
- Create `src/components/CourseFilters.astro` — goal + format controls and empty state.
- Create `src/scripts/course-filters.ts` — progressive filter enhancement.
- Create `src/components/StudyTrack.astro` — shared ENEM/UERJ editorial track page.
- Create `src/components/StudyTrackSection.astro` — one track chapter with shared catalogue resources.

### Routes/i18n
- Modify `src/i18n/types.ts`, `src/i18n/en.ts`, `src/i18n/pt.ts`, `src/i18n/routes.ts`.
- Modify `src/layouts/Base.astro` and `src/components/Header.astro` so subroutes keep Courses highlighted and language-switch correctly.
- Create `src/pages/courses/enem/index.astro`.
- Create `src/pages/pt/cursos/enem/index.astro`.
- Create `src/pages/courses/uerj/index.astro`.
- Create `src/pages/pt/cursos/uerj/index.astro`.

### Verification/research
- Create `docs/superpowers/research/2026-10-11-learning-library-sources.md` — audited source list and exam references.
- Modify `scripts/verify-dist.mjs`.
- Modify `package.json` and `.github/workflows/deploy.yml` only where test labels/scripts need to include the new suites.
- Retire `src/lib/courses.ts` and `src/components/CourseCard.astro` only after all consumers move to the new domain/UI.

---

### Task 1: Learning-resource domain and technology migration

**Files:**
- Create: `src/lib/learning-resources.ts`
- Create: `tests/learning-resources.test.ts`
- Modify: `package.json`
- Read/migrate from: `src/lib/courses.ts`

**Interfaces:**
- Produces:
  - `LearningAreaId`
  - `LearningSubjectId`
  - `LearningGoalId`
  - `LearningFormatId`
  - `LearningLanguageId = 'pt' | 'en' | 'es'`
  - `LearningLevelId = 'high-school' | 'vestibular' | 'beginner' | 'beginner-intermediate' | 'intermediate'`
  - `LearningRegistrationId = 'required' | 'not-required'`
  - `VerificationMethod = 'official-page' | 'youtube-page' | 'search-index'`
  - `LearningResource`
  - `PublishedLearningResource = LearningResource & { url: string; verified: { on: string; by: VerificationMethod; freeAccess: true } }`
  - `catalogue: readonly LearningResource[]`
  - `publishedResources: readonly PublishedLearningResource[]`
  - `AREA_SUBJECTS: Readonly<Record<LearningAreaId, readonly LearningSubjectId[]>>`

- [ ] **Step 1: Write failing catalogue-invariant tests**

In `tests/learning-resources.test.ts`, assert:
- ids are unique;
- every published resource has HTTPS `url`;
- every published resource has `verified.freeAccess === true`;
- every published resource has `verified.on` and `verified.by`;
- every resource subject belongs to its declared area via `AREA_SUBJECTS`;
- every unpublished resource has a non-empty review note;
- the migrated technology records preserve every currently published technology course id and URL.

- [ ] **Step 2: Run the focused test and record RED**

Run:
`node --experimental-strip-types --test tests/learning-resources.test.ts`

Expected: FAIL because `src/lib/learning-resources.ts` does not exist.

- [ ] **Step 3: Implement the typed domain and migrate existing technology entries**

Use these exact ids:

```ts
export type LearningAreaId =
  | 'technology' | 'math' | 'portuguese' | 'writing'
  | 'nature' | 'humanities' | 'english' | 'spanish';

export type LearningSubjectId =
  | 'technology' | 'math' | 'portuguese' | 'writing'
  | 'physics' | 'chemistry' | 'biology'
  | 'history' | 'geography' | 'philosophy' | 'sociology'
  | 'english' | 'spanish';

export type LearningGoalId = 'high-school' | 'enem' | 'uerj' | 'vestibular';
export type LearningFormatId = 'course' | 'track' | 'playlist' | 'lessons' | 'practice';
```

`LearningResource` must carry: `id`, `title`, `provider`, `area`, `subject`, `format`, non-empty `goals`, `language`, `level`, `url: string | null`, optional `verified`, optional `review`, and optional duration/certificate/registration/curated-image data. A resource is published only when `url` is non-null and `verified.freeAccess === true`. Move the existing `CourseImageLayout` / `CourseImage` types into this module so technology imagery survives retirement of `src/lib/courses.ts`. Keep the current technology topic/category metadata as an optional technology-specific field rather than exploding the school-subject union.

- [ ] **Step 4: Update `npm test` to include the new suite and run GREEN**

Run:
`npm test`

Expected: all existing narrative/resume tests plus `learning-resources.test.ts` PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/learning-resources.ts tests/learning-resources.test.ts package.json
git commit -m "feat: add typed learning resource catalogue"
```

---

### Task 2: Pure library filtering

**Files:**
- Create: `src/lib/learning-library.ts`
- Create: `tests/learning-library.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `LearningResource`, `LearningAreaId`, `LearningSubjectId`, `LearningGoalId`, `LearningFormatId`.
- Produces:
  - `type LearningFilter = { area?: LearningAreaId; subject?: LearningSubjectId; goals?: readonly LearningGoalId[]; formats?: readonly LearningFormatId[] }`
  - `filterResources(resources: readonly PublishedLearningResource[], filter: LearningFilter): PublishedLearningResource[]`
  - `resourcesByArea(resources, area)`
  - `resourcesByIds(resources, ids)`

- [ ] **Step 1: Write failing filter tests**

Assert:
- one goal matches a multi-goal resource;
- multiple selected goals use OR semantics;
- multiple selected formats use OR semantics;
- area + goal + format combine with AND semantics across dimensions;
- subject narrows within its valid area;
- empty filter returns all resources in original order;
- unknown ids passed to `resourcesByIds` are omitted from the result rather than fabricating data.

- [ ] **Step 2: Run RED**

Run:
`node --experimental-strip-types --test tests/learning-library.test.ts`

Expected: FAIL because helper module does not exist.

- [ ] **Step 3: Implement the pure helpers without DOM code**

Preserve catalogue reading order. Do not mutate the input arrays.

- [ ] **Step 4: Add suite to `npm test` and run GREEN**

Run:
`npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/learning-library.ts tests/learning-library.test.ts package.json
git commit -m "feat: add learning library filters"
```

---

### Task 3: Research and initial academic catalogue

**Files:**
- Create: `docs/superpowers/research/2026-10-11-learning-library-sources.md`
- Modify: `src/lib/learning-resources.ts`
- Modify: `tests/learning-resources.test.ts`

**Interfaces:**
- Consumes: resource types/invariants from Task 1.
- Produces: verified academic records and an auditable research note.

- [ ] **Step 1: Add failing coverage tests for the V0.1 seed catalogue**

Assert that the published catalogue contains:
- at least one resource for each of `math`, `portuguese`, `writing`, `english`, `spanish`;
- at least one resource for each Nature subject: physics, chemistry, biology;
- at least one resource for each Humanities subject: history, geography, philosophy, sociology;
- at least one published `practice` resource tagged `enem`;
- at least one published `practice` resource tagged `uerj`;
- every technology resource that remains published has newly recorded free-access verification, not only the legacy URL check.

- [ ] **Step 2: Run RED**

Run:
`node --experimental-strip-types --test tests/learning-resources.test.ts`

Expected: coverage assertions FAIL because the academic seed catalogue is not populated.

- [ ] **Step 3: Research current free resources and exam sources**

Re-verify every migrated technology resource under the new 100%-free rule, then research the new academic catalogue.

For each candidate:
- open the direct official/provider page;
- confirm the represented learning content is fully free;
- record provider, title, URL, format, subject, goals, registration requirement when known, verification date/method;
- reject trials, teaser-only resources, guessed URLs, and essential paywalls.

For exam guidance, verify current ENEM information from official INEP/MEC sources and current UERJ vestibular information from official UERJ/Vestibular UERJ sources.

Write the evidence table to `docs/superpowers/research/2026-10-11-learning-library-sources.md`.

- [ ] **Step 4: Add only verified resources to the catalogue**

Every published entry must satisfy the Task 1 validation contract. If a useful candidate cannot be verified, keep it unpublished with `url: null` and a review note, or leave it out of V0.1.

- [ ] **Step 5: Run GREEN**

Run:
`npm test`

Expected: PASS, including subject/exam-practice coverage.

- [ ] **Step 6: Commit**

```bash
git add src/lib/learning-resources.ts tests/learning-resources.test.ts docs/superpowers/research/2026-10-11-learning-library-sources.md
git commit -m "content: add verified free academic resources"
```

---

### Task 4: General library UI and eight-area information architecture

**Files:**
- Create: `src/components/LearningResourceCard.astro`
- Modify: `src/components/Courses.astro`
- Modify: `src/components/CourseProvider.astro`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/pt.ts`

**Interfaces:**
- Consumes: `publishedResources`, `resourcesByArea`.
- Produces: SSR markup where every resource root has `data-learning-resource`, `data-area`, `data-subject`, `data-goals`, and `data-format`.

- [ ] **Step 1: Extend typed i18n copy for the eight areas, subjects, formats, goals, registration states, and revised metadata**

The Courses page title/description must no longer describe the site as technology-only. Preserve exact PT/EN dictionary parity through the type system.

- [ ] **Step 2: Implement `LearningResourceCard.astro` from the current CourseCard visual language**

Requirements:
- editorial grid cell, not floating SaaS card;
- provider/title/facts/direct CTA;
- images optional;
- technology's existing curated image compositions remain usable;
- academic resources render cleanly without custom artwork;
- show format, level, language, goals, and registration only when known/useful;
- `target="_blank" rel="noopener noreferrer"` on resource CTA.

- [ ] **Step 3: Recompose `Courses.astro` around the eight primary areas**

Keep the existing white/black/hairline/blue language. Nature and Humanities remain primary areas with their subsubjects visible inside the section rather than promoted to top-level navigation.

- [ ] **Step 4: Run type/build checks**

Run:
`npm run check`

Expected: PASS.

Run:
`npm run build`

Expected: may still require Task 7 verify-dist updates for new external hosts only; Astro rendering itself must succeed.

- [ ] **Step 5: Commit**

```bash
git add src/components/LearningResourceCard.astro src/components/Courses.astro src/components/CourseProvider.astro src/i18n/types.ts src/i18n/en.ts src/i18n/pt.ts
git commit -m "feat: expand courses into a free learning library"
```

---

### Task 5: Progressive goal/format filters

**Files:**
- Create: `src/components/CourseFilters.astro`
- Create: `src/scripts/course-filters.ts`
- Modify: `src/components/Courses.astro`
- Create/Modify test: `tests/learning-library.test.ts`

**Interfaces:**
- Consumes: resource data attributes from Task 4 and filter semantics from Task 2.
- Produces: keyboard-operable buttons with `aria-pressed`, `data-filter-goal`, `data-filter-format`, `data-filter-reset`, and localized `data-filter-empty`.

- [ ] **Step 1: Add filter contract tests to the pure helper suite**

Pin the empty combination behavior and reset behavior by asserting `filterResources(..., {})` restores the full ordered list.

- [ ] **Step 2: Implement SSR filter controls**

Render:
- goals: Ensino Médio, ENEM, UERJ, Vestibulares;
- formats: Curso, Trilha, Playlist, Aulas, Prática/Simulados;
- reset control;
- localized empty-state.

Without JS, controls may be inert but all resources must stay visible.

- [ ] **Step 3: Implement `course-filters.ts`**

On enhancement:
- toggle `aria-pressed`;
- read each resource's server-rendered data attributes;
- hide/show resource cells;
- reveal empty-state only when zero match;
- reset restores all resources;
- never inject resource content or URLs in JS.

- [ ] **Step 4: Verify no-JS/reduced-motion/keyboard behavior manually and run checks**

Run:
`npm test && npm run check`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CourseFilters.astro src/scripts/course-filters.ts src/components/Courses.astro tests/learning-library.test.ts
git commit -m "feat: add progressive course filters"
```

---

### Task 6: Study-track domain and ENEM/UERJ pages

**Files:**
- Create: `src/lib/study-tracks.ts`
- Create: `tests/study-tracks.test.ts`
- Create: `src/components/StudyTrack.astro`
- Create: `src/components/StudyTrackSection.astro`
- Create: `src/pages/courses/enem/index.astro`
- Create: `src/pages/pt/cursos/enem/index.astro`
- Create: `src/pages/courses/uerj/index.astro`
- Create: `src/pages/pt/cursos/uerj/index.astro`
- Modify: `src/i18n/types.ts`, `src/i18n/en.ts`, `src/i18n/pt.ts`, `src/i18n/routes.ts`
- Modify: `src/layouts/Base.astro`, `src/components/Header.astro`
- Modify: `package.json`

**Interfaces:**
- Consumes: `publishedResources`, `resourcesByIds`, verified exam research from Task 3.
- Produces:
  - `type ExamId = 'enem' | 'uerj'`
  - `type StudyTrackSectionId = 'start' | 'math' | 'languages' | 'writing' | 'nature' | 'humanities' | 'foreign-language' | 'recommended' | 'practice'`
  - `StudyTrackDefinition`
  - `studyTracks: Record<ExamId, StudyTrackDefinition>`
  - `RouteId = PageId | 'courses-enem' | 'courses-uerj'`

- [ ] **Step 1: Write RED integrity tests**

For both tracks assert:
- every referenced id resolves to one published resource;
- every referenced resource has `verified.freeAccess === true`;
- ENEM track resources include goal `enem`;
- UERJ track resources include goal `uerj`;
- no resource id appears twice inside one track;
- each track contains a `practice` section with at least one practice resource.

- [ ] **Step 2: Run RED**

Run:
`node --experimental-strip-types --test tests/study-tracks.test.ts`

Expected: FAIL because track module does not exist.

- [ ] **Step 3: Define the two study tracks from verified current exam information**

Keep the approved editorial order:
- start;
- math;
- languages/Portuguese;
- writing;
- nature;
- humanities;
- foreign language;
- recommended resources;
- practice/simulations.

If current official exam structure differs, describe it accurately in copy while retaining these library navigation chapters as editorial groupings.

- [ ] **Step 4: Implement shared `StudyTrack.astro` and `StudyTrackSection.astro`**

Both exam pages must reuse `LearningResourceCard.astro`; no duplicate resource records or copied URLs.

- [ ] **Step 5: Add route identities, canonical/hreflang pairs, and header behavior**

Keep top-level `PageId = 'home' | 'resume' | 'courses'`. Add `RouteId = PageId | 'courses-enem' | 'courses-uerj'`. `Base.astro` accepts `RouteId`; `Header.astro` language-switches with the exact route pair and maps both exam route ids back to the top-level Courses nav item for `aria-current="page"`.

- [ ] **Step 6: Add the four route files and localized exam copy**

EN:
- `/courses/enem/`
- `/courses/uerj/`

PT:
- `/pt/cursos/enem/`
- `/pt/cursos/uerj/`

- [ ] **Step 7: Add suite to `npm test`, run GREEN, then type check**

Run:
`npm test && npm run check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/study-tracks.ts tests/study-tracks.test.ts src/components/StudyTrack.astro src/components/StudyTrackSection.astro src/pages/courses/enem/index.astro src/pages/pt/cursos/enem/index.astro src/pages/courses/uerj/index.astro src/pages/pt/cursos/uerj/index.astro src/i18n/types.ts src/i18n/en.ts src/i18n/pt.ts src/i18n/routes.ts src/layouts/Base.astro src/components/Header.astro package.json
git commit -m "feat: add ENEM and UERJ study tracks"
```

---

### Task 7: Dist verification and route invariants

**Files:**
- Modify: `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: the six Courses-family route URLs and header/canonical behavior created in Task 6.
- Produces: build-time invariants for the expanded library.

- [ ] **Step 1: Extend `verify-dist.mjs`**

Add the four pages to `PAGES` and course-page verification. For all learning-library pages:
- exactly one H1;
- canonical + EN/PT-BR/x-default pair;
- internal links resolve;
- external resource links are HTTPS;
- resource links use `target="_blank" rel="noopener noreferrer"`;
- host allowlist includes only hosts actually verified in Task 3;
- ENEM/UERJ pages contain semantic resource links and no duplicated H1.

Add a general-library invariant that each of the eight primary area ids appears exactly once in both languages.

- [ ] **Step 2: Run full build**

Run:
`npm run build`

Expected final line: `verify-dist: 10 pages, ... files — all invariants hold.`

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-dist.mjs
git commit -m "test: verify learning library routes and links"
```

---

### Task 8: Retire old course-only code and complete QA

**Files:**
- Delete only if unused after grep: `src/lib/courses.ts`, `src/components/CourseCard.astro`
- Modify comments/import names where they still claim Courses is technology-only.
- Modify: `.github/workflows/deploy.yml` test step label only if it still says tests are narrative-only.

**Interfaces:**
- No new public interface; this task proves the integrated product.

- [ ] **Step 1: Prove old modules have no consumers before deleting**

Run:
`grep -R "lib/courses\|CourseCard" -n src tests scripts || true`

Expected: no live import references outside files being retired.

- [ ] **Step 2: Remove retired modules and stale comments**

Do not delete provider assets or current technology course images that the migrated resources still use.

- [ ] **Step 3: Run the complete automated gate**

Run:
`npm ci`

Then:
`npm test`

Then:
`npm run check`

Then:
`npm run build`

Expected: all PASS.

- [ ] **Step 4: Manual QA**

Verify at minimum:
- desktop 1440px;
- iPad landscape/portrait around the existing 1180px boundary;
- mobile 390px and 320px;
- PT and EN general library;
- PT and EN ENEM;
- PT and EN UERJ;
- area navigation;
- multi-goal and multi-format filters;
- empty state + reset;
- keyboard-only filter operation;
- JavaScript disabled;
- reduced motion;
- every new resource CTA;
- no horizontal page overflow;
- technology curated images still render correctly.

- [ ] **Step 5: Commit final cleanup**

```bash
git add -A
git commit -m "chore: complete learning library migration"
```

---

## Final Delivery

Before opening a PR:

1. inspect `git status` and full diff against `origin/main`;
2. confirm the research note matches every newly published academic URL;
3. confirm no unverified resource is rendered;
4. confirm ENEM/UERJ factual copy is supported by the official references recorded in research;
5. run `npm test && npm run check && npm run build` one final time.

Suggested PR title:

`Courses: expand into a free learning library`

PR body should summarize:
- eight knowledge areas;
- 100%-free resource policy;
- goal/format filters;
- dedicated ENEM/UERJ study tracks;
- technology catalogue preservation;
- source verification;
- responsive/accessibility QA;
- exact automated test/build results.
