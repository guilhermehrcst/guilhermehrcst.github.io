# Courses Learning Library V0.1 — Design

Date: 2026-10-11  
Status: approved conversational design, written specification for review  
Repository: `guilhermehrcst/guilhermehrcst.github.io`  
Branch: `design/courses-learning-library-v01`

## 1. Purpose

Expand the existing Courses page from a technology-only catalogue into a curated, free learning library for:

- Ensino Médio;
- ENEM;
- UERJ;
- other vestibulares;
- technology learning.

The product should help a visitor answer two questions quickly:

1. "What do I want to study?"
2. "What am I studying for?"

The library remains a curated publication rather than a generic link directory. Every published resource must be useful, clearly described, and 100% free to access.

## 2. Existing product context

The current Courses page is already a strongly designed editorial catalogue built from typed data in `src/lib/courses.ts`, with:

- Astro;
- shared PT/EN dictionaries;
- a 12-column editorial grid;
- curated feature entries;
- compact entries;
- category navigation;
- official source URLs;
- build-time validation;
- responsive compositions;
- no database or CMS dependency.

The redesign must evolve that architecture rather than replace it with an unrelated app.

The current technology catalogue remains valuable and should be preserved as the Technology area.

## 3. Product structure

The library is organized primarily by area of knowledge, not by exam.

Primary areas:

1. Tecnologia
2. Matemática
3. Português
4. Redação
5. Ciências da Natureza
6. Ciências Humanas
7. Inglês
8. Espanhol

Subareas:

### Ciências da Natureza

- Física
- Química
- Biologia

### Ciências Humanas

- História
- Geografia
- Filosofia
- Sociologia

### Tecnologia

The existing technology catalogue continues to cover areas such as:

- programming;
- AI;
- data;
- systems;
- security.

It should not be flattened into school-subject taxonomy.

## 4. Audience and level

The library targets:

- Ensino Médio students;
- students preparing for ENEM;
- students preparing for UERJ;
- students preparing for other vestibulares;
- people independently studying the same subjects.

Elementary-school-specific resources are out of scope for V0.1.

Resources may be introductory or advanced enough for vestibular preparation, but every item must be tagged clearly enough that visitors can understand its intended level.

## 5. Resource eligibility

The library accepts useful resources from any trustworthy educational source, including:

- universities;
- public institutions;
- educational platforms;
- cursinhos;
- independent teachers;
- YouTube channels;
- open educational projects.

Accepted formats:

- complete course;
- study track;
- playlist;
- lesson series;
- practice set / simulator / official past-exam collection.

A resource may require account registration or may open directly.

### Absolute free-access rule

Every published resource must be 100% free for the learning content represented by the entry.

Do not publish:

- trials;
- resources where essential lessons are behind a paywall;
- "free" courses that require payment to continue;
- affiliate-gated access;
- teaser-only content.

A paid optional certificate does not automatically disqualify a resource if the full learning content is free, but the entry must not imply that the certificate is free unless that is confirmed.

## 6. Curation standard

The site is not a dump of links.

Each resource should be selected based on:

- clarity;
- organization;
- depth appropriate to its purpose;
- identifiable source or teacher;
- reasonable currency where freshness matters;
- practical usefulness for Ensino Médio or vestibular preparation;
- complete free access to the represented content.

Every external link must be verified before publication.

For institutions, prefer the institution's own course page.

For independent YouTube resources, a direct official channel/playlist/video-series URL is acceptable.

Do not derive or guess URLs.

## 7. Core data model

V0.1 should move from a technology-specific `Course` model toward a reusable learning-resource model.

Conceptually:

```ts
type LearningAreaId =
  | 'technology'
  | 'math'
  | 'portuguese'
  | 'writing'
  | 'nature'
  | 'humanities'
  | 'english'
  | 'spanish';

type LearningSubjectId =
  | 'technology'
  | 'math'
  | 'portuguese'
  | 'writing'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'geography'
  | 'philosophy'
  | 'sociology'
  | 'english'
  | 'spanish';

type LearningGoalId =
  | 'high-school'
  | 'enem'
  | 'uerj'
  | 'vestibular';

type LearningFormatId =
  | 'course'
  | 'track'
  | 'playlist'
  | 'lessons'
  | 'practice';
```

A published resource should carry, at minimum:

- stable id;
- title;
- provider / teacher / institution;
- area;
- subject;
- format;
- goals;
- language;
- level;
- official/direct source URL;
- free-access verification metadata.

Optional data may include:

- duration when explicitly confirmed;
- certificate status when explicitly confirmed;
- registration requirement;
- curated/editorial prominence;
- image only where intentionally curated;
- source-specific notes.

### Single source of truth

The same resource must not be duplicated manually for ENEM, UERJ, and the general library.

Exam pages query/filter the same central catalogue.

## 8. General Courses page

Routes remain:

- English: `/courses/`
- Portuguese: `/pt/cursos/`

The page becomes the main library, preserving the existing editorial visual language.

The primary browse experience should expose the eight areas:

- Tecnologia
- Matemática
- Português
- Redação
- Ciências da Natureza
- Ciências Humanas
- Inglês
- Espanhol

The page should support filtering by goal:

- Ensino Médio
- ENEM
- UERJ
- Vestibulares

And by format:

- Curso
- Trilha
- Playlist
- Aulas
- Prática / Simulados

Filters must be progressive enhancement where practical. Core content must remain meaningful in server-rendered HTML.

A visitor should be able to combine an area with a goal. Example:

- Matemática + UERJ
- Redação + ENEM
- Ciências da Natureza + Vestibulares

The existing technology resources remain accessible within Tecnologia.

## 9. ENEM page

Create a dedicated study-track page.

Routes:

- English structural counterpart: `/courses/enem/`
- Portuguese: `/pt/cursos/enem/`

This is not merely a pre-filtered copy of the catalogue.

It is an editorial study path powered by the shared resource data.

Suggested structure:

1. Comece por aqui
2. Matemática
3. Linguagens / Português
4. Redação
5. Ciências da Natureza
6. Ciências Humanas
7. Inglês / Espanhol
8. Recursos recomendados
9. Simulados / prática

The page should explain what to study and surface selected free resources for each stage.

Do not duplicate resource definitions.

## 10. UERJ page

Create a dedicated study-track page.

Routes:

- English structural counterpart: `/courses/uerj/`
- Portuguese: `/pt/cursos/uerj/`

Like ENEM, this is an editorial study path backed by the shared catalogue.

Suggested structure:

1. Comece por aqui
2. Matemática
3. Português
4. Redação
5. Ciências da Natureza
6. Ciências Humanas
7. Inglês / Espanhol
8. Recursos recomendados
9. Simulados / prática

Exam-specific organization must be based on verified current information during implementation. If a claim about the current UERJ or ENEM format cannot be verified, do not invent it.

## 11. Filters and navigation

### Goal filter

The general library should allow:

- Ensino Médio
- ENEM
- UERJ
- Vestibulares

### Format filter

The general library should allow:

- Curso
- Trilha
- Playlist
- Aulas
- Prática / Simulados

### Subject navigation

Areas with subsubjects should expose them without making the top-level navigation explode in size.

Nature remains one primary area with Physics, Chemistry, and Biology beneath it.

Humanities remains one primary area with History, Geography, Philosophy, and Sociology beneath it.

## 12. Visual direction

Preserve the current Courses visual system:

- white editorial canvas;
- black type;
- hairlines;
- blue signal/accent;
- strong typography;
- responsive grid;
- no generic SaaS dashboard appearance.

Do not turn the library into a marketplace grid of floating cards.

The current CourseCard language may evolve into a generic resource cell, but the publication should still feel like the same site.

Use images selectively, not as a requirement for every resource.

Technology can retain its existing curated visual assets.

New school-subject resources should not require custom artwork to be publishable.

## 13. Information shown per resource

A resource entry should expose only useful facts.

Recommended facts:

- provider;
- subject/category;
- format;
- level;
- language;
- goal relevance;
- registration requirement if relevant;
- duration only when verified;
- certificate only when verified.

The primary CTA should link directly to the free resource.

Avoid marketing copy invented by the site.

## 14. Source and verification policy

Every published resource must have a verification record.

The implementation may use a shape such as:

```ts
verified: {
  on: 'YYYY-MM-DD',
  by: 'official-page' | 'youtube-page' | 'search-index',
  freeAccess: true
}
```

The exact field names may change during implementation, but the invariant must remain:

A resource is not published until its URL and free-access status are verified.

If a promising resource cannot be confirmed, keep it unpublished with a review note, following the same philosophy the current catalogue already uses.

## 15. Internationalization

Maintain PT/EN route parity.

The Brazilian exam names ENEM and UERJ remain proper names in both languages.

English pages may explain the Brazilian context in English, but they should not fabricate an international equivalent.

Typed dictionaries must continue preventing PT/EN drift.

## 16. SEO and metadata

Update the Courses metadata so it no longer describes the page as technology-only.

The Portuguese page should communicate free resources for:

- Ensino Médio;
- ENEM;
- UERJ;
- vestibulares;
- technology.

ENEM and UERJ pages receive their own titles, descriptions, canonical URLs, and hreflang counterparts.

Do not keyword-stuff.

## 17. Accessibility

Preserve:

- semantic headings;
- lists for collections;
- real links;
- keyboard access;
- visible focus;
- readable contrast;
- reduced-motion behavior;
- meaningful link labels;
- no content that exists only through JavaScript.

Filters must be operable by keyboard and understandable by assistive technology.

## 18. Responsive behavior

The library must remain useful on:

- desktop;
- tablet;
- mobile.

The existing 1180px Courses composition boundary may be retained where appropriate.

On phones:

- areas and filters must not require precision tapping;
- no page-level horizontal overflow;
- resource facts stack cleanly;
- exam tracks remain readable in one column.

## 19. Architecture

Recommended boundaries:

### Data

A central typed learning-resource catalogue.

Technology entries should migrate with minimal factual rewriting.

### Domain helpers

Pure helpers for:

- published-resource selection;
- goal filtering;
- area filtering;
- subject filtering;
- format filtering;
- exam-track resource selection;
- catalogue validation.

### UI

Likely components:

- general library shell;
- area navigation;
- goal/format filters;
- generic resource card/cell;
- study-track page;
- track section.

Names are implementation details. Keep components small and purpose-specific.

### Routes

Add ENEM and UERJ route pairs while preserving the existing Courses routes.

## 20. Progressive enhancement

The catalogue should work as a useful server-rendered document without JavaScript.

If client-side filtering is implemented:

- all resource data should still be rendered semantically;
- JavaScript should enhance visibility/filter state;
- filtering should fail open;
- no framework should be added solely for filters.

Astro + TypeScript + native browser APIs are sufficient unless repository evidence shows otherwise.

## 21. Testing and build invariants

Add or extend tests for:

- unique resource ids;
- published resource URL verification;
- 100%-free invariant;
- valid area/subject relationships;
- valid goal values;
- no duplicate resource definitions;
- ENEM/UERJ tracks referencing only existing published resources;
- PT/EN route parity where applicable.

Extend `verify-dist` as appropriate to ensure:

- main Courses routes still build;
- ENEM and UERJ route pairs build;
- each page has one H1;
- canonical/hreflang remain correct;
- internal links resolve;
- external resource links are present in semantic HTML.

Run:

- `npm test`
- `npm run check`
- `npm run build`

## 22. Research during implementation

The initial expansion requires web research because actual free resources and current exam information are time-sensitive.

Research rules:

- prefer official institutional pages;
- use direct official YouTube resources for independent teachers;
- verify that the learning content is fully free;
- verify current ENEM/UERJ information before writing exam-specific guidance;
- cite research in the implementation report / PR notes where useful;
- never publish a resource solely from a guessed URL or remembered title.

## 23. V0.1 scope

V0.1 includes:

- the reusable learning-resource domain model;
- the eight primary areas;
- the existing Technology catalogue migrated/preserved;
- filters by goal and format;
- dedicated ENEM study-track page;
- dedicated UERJ study-track page;
- an initial curated set of verified free resources across the new academic areas;
- PT/EN route and copy parity;
- tests and build validation.

V0.1 does not include:

- accounts;
- saved progress;
- grades;
- study streaks;
- personalized recommendations;
- paid resources;
- a CMS;
- user-submitted resources;
- exam-score prediction;
- calendar/planner functionality.

Those would be separate future products or specs.

## 24. Success criteria

The redesign succeeds when:

1. a visitor can browse free learning resources by subject;
2. a visitor can filter resources by ENEM, UERJ, Ensino Médio, or general vestibular relevance;
3. ENEM and UERJ each have a useful dedicated study path;
4. every published resource is genuinely free and verified;
5. the existing Technology catalogue survives without losing its quality;
6. the site still feels like the same editorial product;
7. PT and EN remain synchronized;
8. the implementation stays static, maintainable, typed, accessible, and build-validated.

## 25. Approved product decisions

These decisions are fixed for V0.1 unless explicitly revisited:

- organize the library by knowledge area, not by exam;
- primary areas are Tecnologia, Matemática, Português, Redação, Ciências da Natureza, Ciências Humanas, Inglês, and Espanhol;
- Português and Redação are separate;
- Nature and Humanities remain grouped at the primary-navigation level;
- include English and Spanish;
- target Ensino Médio and vestibular preparation, not Ensino Fundamental;
- accept complete courses, tracks, playlists, lesson series, and free practice/simulation resources;
- accept universities, platforms, cursinhos, independent teachers, YouTube, and public projects;
- publish only 100% free learning resources;
- both direct-access and account-required free resources are allowed;
- support filtering by exam/goal;
- ENEM and UERJ receive dedicated study-track pages;
- exam pages reuse the central resource catalogue rather than duplicate entries.
