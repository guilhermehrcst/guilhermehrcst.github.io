# guilhermehrcst.github.io

Personal site of Guilherme Henrique. Static output, built with [Astro](https://astro.build), TypeScript and hand-written CSS. No backend, no analytics, no third-party requests at runtime (fonts are self-hosted).

| Page | English | Português |
|---|---|---|
| Home | `/` | `/pt/` |
| Résumé (placeholder, `noindex`) | `/resume/` | `/pt/curriculo/` |
| Courses (placeholder, `noindex`) | `/courses/` | `/pt/cursos/` |

## Develop

Requires Node 22.12+.

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build    # astro build + scripts/verify-dist.mjs
npx astro check  # type check, including EN/PT parity
```

## Structure

- `src/i18n/` — `types.ts` defines one `Dict` shape; `en.ts` and `pt.ts` implement it. A key missing in either language is a type error. `routes.ts` is the single source of truth for URLs and `hreflang` pairs.
- `src/components/` — one component per section of the home (`Hero`, `Statement`, `DitherBand`, `Lume`, `Pexiscale`, `Principles`, `About`, `Contact`, `Monument`), plus `Header`, `Label`, `ProjectDetail` and `Shell` (placeholder pages).
- `src/lib/` — deterministic models shared by the server render and the canvas: `dither.ts` (8×8 Bayer band) and `lume-model.ts` (seeded schematic of memory compaction).
- `src/scripts/motion.ts` — every runtime animation, in one file.
- `src/styles/global.css` — tokens (palette, grid, type, motion) and base.
- `scripts/verify-dist.mjs` — post-build invariants: all routes exist; `lang`, canonical and `hreflang` are correct; placeholders are `noindex`; internal links resolve; no third-party resources; external links are limited to an allowlist (the contacts below, Lume, Pexiscale); no secret-shaped strings.

## Motion

The page is complete without JavaScript and under `prefers-reduced-motion: reduce`; motion is enrichment. Scrolling is native: no smooth-scroll library, no snapping, no parallax. Only these things animate:

1. Hero name rises through a line mask once on load (CSS, 850 ms, expo-out).
2. Mono section labels decode once on first view.
3. The dither band between the statement and Lume follows scroll position.
4. The Lume schematic compacts with scroll position (reversible).
5. The Pexiscale composition assembles once when in view; table rows then regroup by organization.

Without JS, the server-rendered SVGs show the final state. Under reduced motion, canvases draw the final state once and nothing else moves.

## Deploy

The site is deployed by `.github/workflows/deploy.yml` (build → verify → upload `dist/` → deploy). This requires a one-time manual change:

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

Until that switch is made, Pages keeps publishing the branch root, where the **legacy static site** (`index.html`, `pt/index.html`, `assets/style.css`, with `.nojekyll`) still lives. So merging does not break the live site; the workflow's deploy job simply fails until the source is switched. Rollback is the same switch in reverse.

After the new site is confirmed live from Actions, delete the legacy root files in a follow-up change.

To use a custom domain later, add it under Pages settings. Do not use a pexiscale.com subdomain.

## Rules for this repository

It is public and its history is permanent. Never commit secrets, `.env` files, addresses, ID numbers, customer or store data, or code from private repositories. The contacts in the contact section (email, LinkedIn, Instagram, GitHub) are published on purpose and are the only personal data meant to be public. Describe decisions in text instead.

Copy rules: no invented achievements, metrics, users, clients or titles. Every claim on the site already existed on the previous version (see git history) or is a direct restatement of it.
