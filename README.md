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

## Typography

- **Google Sans Flex** (SIL OFL 1.1) is the only text and display family. It is self-hosted from `@fontsource-variable/google-sans-flex`, which republishes the Google Fonts release (`github.com/google/fonts`). Only the `opsz` build is shipped: weight and optical size. Width, grade, roundness and slant axes are deliberately left out.
- Metadata, labels and section indices are the same family, small, uppercase, tracked, with tabular figures (`.meta`). JetBrains Mono is no longer shipped.
- Licences are published with the site at `/licenses/`.
- Monumental all-caps lines use the `--display-*` and `--fit-*` tokens in `src/styles/global.css`. Their optical size is pinned to the display cut so the fit-to-grid maths is identical on every viewport; `--fit-name` is the measured advance of `GUILHERME` at the display weight and tracking. If the display weight, tracking or font changes, re-measure it (render `GUILHERME` at 250px with the same weight, tracking and `opsz 144`, divide its width by 250, and add ~0.7%) or the names stop spanning the grid.

## Scale and rhythm

- **One ladder, in `global.css`** (values at 1440px): display XL 207 (the hero name), display L 135 (`--fs-display-l`: Lume, Pexiscale, footer), display M 109 (principles, `--fs-display-m`), headline L 81 (`--fs-statement`), headline M 52 (`--fs-h3`), lead 22 (`--fs-lead`, supporting copy), body 17 (`--fs-body`), meta 12-14 (`--fs-meta`, `--fs-meta-l`). Components take sizes from these tokens; do not add one-off sizes. Sizes that change with the layout (display L and M, the hero statement, action and metadata rows) are **one continuous function of the viewport width**, not one value per breakpoint: a per-breakpoint value jumps by 20-30% when the window grows by a pixel.
- **The hero name has two bounds**: the width of the grid (`--fit-name`, as before) and the window height. `font-size: min(width-fit, (50svh - chrome) / 1.68)`, so the photo and the column start at about 50% of the viewport on any desktop or tablet window, and on a tall or narrow window the name stays full-bleed. `1.68` is two lines at `line-height: 0.84`; if either changes, change both.
- **Spacing scale**: `--space-xs` ... `--space-2xl` and `--space-section` (all `clamp`). Gaps in components come from here or from `--margin` / `--gap`; the old per-component `clamp(56px, 9vw, 140px)`-style values are gone. `--space-section` no longer depends on the window height.
- **Header**: `--header-h` is 60-68px on desktop and tablet (`4.4vw`) and 57px on mobile (two rows of ~28px); the 1px rule is on top of it.

## Colour

Tokens live once, in `:root` of `src/styles/global.css`: `--gh-blue #078EFB`, `--gh-black`, `--gh-white`, `--gh-gray-50/200/300/600`, `--gh-void`. Components use the semantic roles (`--paper`, `--ink`, `--muted`, `--rule`, `--surface`, `--signal`, `--void*`); no hex codes elsewhere. The blue is a signature (roughly 10%): the slash, rules, arrows, focus rings, diagram marks, one marked word. It is 3.35:1 on white, so it is never used for small text; text is blue only at 24px and above (contact hover). Lume stays dark (`--gh-void`).

The slash is a component of the system: `.sl` / `.slash` in `global.css`. It nudges 0.12em on link hover and slides in once when a section label or giant heading enters.

## Hero photo

`src/assets/hero/guilherme.jpg` is the only image of a person on the site: a 4:5 crop (980x1225) of the original, with no colour grading and **no metadata** (EXIF/GPS stripped). It was cropped on purpose to leave out the posters on the elevator walls. Astro generates the WebP sizes and the JPEG fallback at build time. Never commit the uncropped original: it is a phone photo and this repository's history is permanent.

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
2. Section slashes, rules, the marked word and the Lume column grid reveal once on first view (`data-reveal` → `.is-in`; transform and opacity only). The header's reading-progress line is a CSS scroll timeline, with no JS.
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
