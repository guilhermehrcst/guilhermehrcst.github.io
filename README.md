# Pexis Academy

A free, Portuguese-first place to study with direction: ENEM, UERJ, Ensino Médio, vestibulares and technology. Pexis Academy does not produce lessons; it organises free resources from universities, public institutions and educational platforms by objective, area and subject, and says where to start.

Static output, built with [Astro](https://astro.build), TypeScript and hand-written CSS. No backend, no accounts, no analytics, no cookies, no third-party requests at runtime (fonts are self-hosted). The only JavaScript runs on `/buscar/`, and the page is complete without it.

Design and plan: `docs/superpowers/specs/2026-10-11-pexis-academy-v01-design.md`, `docs/superpowers/plans/2026-10-11-pexis-academy-v01.md`.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: choose an objective, or explore by area |
| `/enem/`, `/uerj/`, `/ensino-medio/`, `/vestibulares/` | Objectives |
| `/tecnologia/` | Technology: objective, area and its tracks |
| `/materias/` | All areas and subjects ("Explorar") |
| `/materias/{matematica,portugues,redacao,fisica,quimica,biologia,historia,geografia,filosofia,sociologia,ingles,espanhol}/` | Subjects |
| `/buscar/` | Search: a full directory, filtered in the browser |
| `/sobre/` | Curation rules, verification, independence |

`/pt/` and the former `/courses/*`, `/pt/cursos/*` routes redirect (a page that refreshes to its destination, `noindex`: GitHub Pages cannot send HTTP redirects). `/resume/` and `/pt/curriculo/` are gone and answer with the 404.

Every URL comes from `src/lib/routes.ts`, derived from `src/lib/taxonomy.ts`. Pages never write an internal path by hand.

## Develop

Requires Node 22.12+.

```sh
npm ci
npm run dev       # http://localhost:4321
npm test          # unit tests (tests/**/*.test.{ts,mjs}, Node's test runner)
npx astro check   # types
npm run build     # astro build + scripts/verify-dist.mjs
```

CI (`.github/workflows/deploy.yml`) runs the same three steps; a push to `main` deploys `dist/` to GitHub Pages.

## Content model

All content is typed TypeScript, validated at build time.

- `src/lib/taxonomy.ts`: objectives, areas, subjects and their topics. A subject belongs to exactly one area; the area is never stored anywhere else.
- `src/lib/learning-resources.ts`: the catalogue, the single definition of every resource.
- `src/lib/exam-guides.ts`: the ENEM and UERJ guides. Resource sections are derived from the catalogue by goal and format; editorial sections cite official sources.
- `src/lib/official-sources.ts`: official INEP and UERJ pages, with their verification.
- `src/lib/tech-tracks.ts`: the technology tracks, as ordered lists of catalogue ids.
- `src/lib/featured.ts`: the editorial highlights, ten per path, in staging until every one is homologated (V0.4).
- `src/lib/search-index.ts`: the search index, derived from all of the above.
- `src/i18n/pt.ts`: interface copy (V0.1 is Portuguese only; the typed shape is kept for a future `/en/`).

### Add a resource

1. Open the resource on the provider's own page and confirm that the learning content is entirely free (no trial, no paywall, no teaser, no affiliate link; a free account is fine; a paid optional certificate is fine when the lessons are free).
2. Add it to `catalogue` in `src/lib/learning-resources.ts` with its official title (never translated), provider, subject (`null` for a multidisciplinary resource such as a complete past exam, never a false subject), its real format (a past exam, a lesson or an atlas is not a course), the `paths` it serves, the `exams` it prepares for (only with evidence), language, level and `url`, and `verified: { on, by, freeAccess: true }`. Duration and certificate only when the provider's page states them. Technology resources declare `tecnologia`, never Ensino Médio.
3. A resource that cannot be confirmed stays with `url: null` and a `review` note: it is not shown.
4. A new provider host must also be added to `COURSE_HOSTS` in `scripts/verify-dist.mjs` (a test keeps that list equal to the catalogue).
5. Record the evidence in `docs/superpowers/research/2026-10-11-learning-library-sources.md`.

Subject pages, objective pages, the search index and the footer's verification date update from the data.

### Add a technology track

Add it to `src/lib/tech-tracks.ts` with ids of published technology resources. A track without a verified resource is `planned` and never shown.

### Add topics to a subject (learning map)

Each topic needs a source (`TopicSourceId`), and is published only after it was checked against that source. The Mathematics map is prepared but unpublished: see "Pexis Academy: re-verification" in the source audit.

## Build invariants

`scripts/verify-dist.mjs` checks `dist/` after every build and fails the deploy on any violation, among them:

- exactly the 21 canonical pages, the 7 redirects and the 404, nothing else;
- per page: `lang="pt-BR"`, title and description patterns, canonical, Open Graph, one `h1`, unique ids, landmarks, the header navigation;
- every internal link resolves; every external link is HTTPS, to an allowed host, in a new tab with `rel="noopener noreferrer"`;
- every resource is an item of a resource list, with one outbound link that says it opens in a new tab;
- page-specific structure (the Home's sections, the ENEM and UERJ sections, subject pages, technology tracks, the search directory);
- JavaScript only on `/buscar/`, no third-party requests, no secrets, and no trace of the former personal site.

Its lists (routes, redirects, hosts) are written by hand on purpose: they are an independent barrier against a mistake in `src/lib/routes.ts`, and tests keep the copies equal where they mirror data.

## Visual system

"Acadêmica acolhedora": warm paper, graphite ink, hairlines and space instead of shadows and cards.

**Brand red.** The brand red `#720111` (`--brand`) is measured from the official artwork. It is also the only action colour (`--action`): links, calls to action and highlights. No second hue competes with the mark; the former blue is retired, and a test fails if it returns.

**Tokens.** Tokens live once, in `:root` of `src/styles/global.css`; no hex code appears elsewhere.

**Fonts.** Two typefaces are self-hosted, both under the SIL OFL 1.1: Newsreader (`@fontsource-variable/newsreader`) for headings and Google Sans Flex (`@fontsource-variable/google-sans-flex`) for text. Their licences are published at `/licenses/`.

**Identity.** The official Pexis Academy artwork is kept as supplied in `src/assets/brand/source`. It appears white on a plate of the brand red, never redrawn. `scripts/brand-assets.mjs` derives the lockup, the symbol and the icons, and `tests/brand.test.ts` checks them against its manifest. Rules of use: `docs/superpowers/brand/2026-10-11-pexis-academy-identity.md`.

**Motion.** Motion is limited to small hover and focus transitions and is off under `prefers-reduced-motion`.

## Kept, unused

`src/lib/resource-images.ts` and `src/assets/courses` hold the curated images of six technology courses. V0.1 does not show images in resource lists; they stay until a visual decision (spec §2.2).
