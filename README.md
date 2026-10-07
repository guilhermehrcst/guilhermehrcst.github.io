# guilhermehrcst.github.io

Personal site of Guilherme Henrique. Static output, built with [Astro](https://astro.build), TypeScript and hand-written CSS. No backend, no analytics, no third-party requests at runtime (fonts are self-hosted).

| Page | English | Português |
|---|---|---|
| Home | `/` | `/pt/` |
| Résumé | `/resume/` | `/pt/curriculo/` |
| Courses (curated free courses) | `/courses/` | `/pt/cursos/` |

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
- Licences are published with the site at `/licenses/` (Google Sans Flex, OFL; Radix Icons, MIT).
- Monumental all-caps lines use the `--display-*` and `--fit-*` tokens in `src/styles/global.css`. Their optical size is pinned to the display cut so the fit-to-grid maths is identical on every viewport; `--fit-name` is the measured advance of `GUILHERME` at the display weight and tracking. If the display weight, tracking or font changes, re-measure it (render `GUILHERME` at 250px with the same weight, tracking and `opsz 144`, divide its width by 250, and add ~0.7%) or the names stop spanning the grid.

## Scale and rhythm

- **One ladder, in `global.css`** (values at 1440x900): hero name 180, display 108 (`--fs-display-l`: Lume, Pexiscale, the principles, footer; 0.6 of the hero), headline L 72 (`--fs-statement`), headline 43 (`--fs-h3`: questions, about; the hero statement follows this step, bounded by the window height: 37), lead 22 (`--fs-lead`), body 17 (`--fs-body`), meta 13-15 (`--fs-meta`, `--fs-meta-l`). Components take sizes from these tokens; do not add one-off sizes. Sizes that change with the layout are **one continuous function of the viewport width**, not one value per breakpoint: a per-breakpoint value jumps by 20-30% when the window grows by a pixel.
- **The hero is one composition with two bounds**: the name is the smaller of the grid width (`--fit-name`) and `(--hero-split - chrome) / 1.68`, with `--hero-split: 45svh`, so the photo and the column start at about 45% of the window; the column's rows, statement and action are the smaller of a width rule and a share of `--hero-rest` (what is left under the split), so on a laptop the whole hero ends at the fold, and on a tall window it keeps its width-based size. `1.68` is two lines at `line-height: 0.84`; if either changes, change both.
- **Spacing scale**: `--space-xs` ... `--space-2xl` and `--space-section` (all `clamp`). Gaps in components come from here or from `--margin` / `--gap`; the old per-component `clamp(56px, 9vw, 140px)`-style values are gone. `--space-section` no longer depends on the window height.
- **Header**: `--header-h` is 60-68px on desktop and tablet (`4.4vw`) and 57px on mobile (two rows of ~28px); the 1px rule is on top of it.

## Colour

Tokens live once, in `:root` of `src/styles/global.css`: `--gh-blue #078EFB`, `--gh-black`, `--gh-white`, `--gh-gray-50/200/300/600`, `--gh-void`. Components use the semantic roles (`--paper`, `--ink`, `--muted`, `--rule`, `--surface`, `--signal`, `--void*`); no hex codes elsewhere. The blue is a signature (roughly 10%): the slash, rules, arrows, focus rings, diagram marks, one marked word. It is 3.35:1 on white, so it is never used for small text; text is blue only at 24px and above (contact hover). Lume stays dark (`--gh-void`).

**Action blue** is a separate, functional colour: `--gh-action #0B57D0` (hover `#0842A0`, white text, 6.4:1 and 9.1:1), used only for the primary call to action of a Courses cell (`CourseCard.astro`). Blue means *act*; navigation, filters, category links and secondary links stay neutral, and the decorative `--signal` blue is unchanged.

The slash is a component of the system: `.sl` / `.slash` in `global.css`. It nudges 0.12em on link hover and slides in once when a section label or giant heading enters.

## AI tool icons (résumé, section 04)

`src/assets/ai/*.png` are the supplied artworks for the eight tools, kept exactly as received (1254px; some carry EXIF or a C2PA manifest, which the build drops). Astro converts them at build time to 28/56/84px WebP (~1 KB each). They are decorative (`alt=""`, `aria-hidden`); every name stays text. `src/lib/ai-tools.ts` maps each `AiToolName` (a closed union in `i18n/types.ts`) to its icon and an optical scale, and the mapping is exhaustive: a missing icon fails `astro check`.

## Résumé 07, influences (web only)

`src/lib/influences.ts` holds the five people (name, photo, crop, brands) and the five brand marks; the one-line texts are in the dictionaries, keyed by `InfluenceId`, so EN and PT cannot drift. The photographs are wide shots, so each one has a crop window (centre and width as fractions of the photo, against the fixed 8:9 frame); a window that leaves the photo fails the build. Brand artworks sit on large transparent canvases, so each carries its measured content box and an optical height. Photos and logos are built by Astro (WebP, responsive, lazy). The section is hidden in print. The source photos and logos are kept as supplied; their EXIF is harmless and the build drops it.

## Courses catalogue

`src/lib/courses.ts` is the only place courses are defined: section, official title (not translated), institution, category/level/language (labels in the dictionaries), and `certificate`/`duration` only when the course's own page states them. `url` must be the institution's own page for that course, never an aggregator, blog or affiliate link, and never derived from a domain's structure; each published URL records how it was confirmed (`checked`). An entry with `url: null` keeps a `review` note and is not rendered. The page lays itself out from the data (curator's picks get a typographic plate; the others are compact cells; spans follow the count), so adding a course is one entry. A new institution host also needs adding to `COURSE_HOSTS` in `scripts/verify-dist.mjs`.

## Hero photo

`src/assets/hero/guilherme.jpg` is the only image of a person on the site: a 4:5 crop (980x1225) of the original, with no colour grading and **no metadata** (EXIF/GPS stripped). It was cropped on purpose to leave out the posters on the elevator walls. Astro generates the WebP sizes and the JPEG fallback at build time. Never commit the uncropped original: it is a phone photo and this repository's history is permanent.

## Structure

- `src/i18n/` — `types.ts` defines one `Dict` shape; `en.ts` and `pt.ts` implement it. A key missing in either language is a type error. `routes.ts` is the single source of truth for URLs and `hreflang` pairs.
- `src/components/` — one component per section of the home (`Hero`, `Statement`, `DitherBand`, `Lume`, `Pexiscale`, `Principles`, `About`, `Contact`, `Monument`), plus `Header`, `Label`, `ProjectDetail`, `Resume` (the résumé page, with `Command` for its section prompts) and `Courses` + `CourseCard` (the Courses page).
- `src/lib/` — deterministic models shared by the server render and the canvas: `dither.ts` (8×8 Bayer band) and `lume-model.ts` (seeded schematic of memory compaction).
- `src/scripts/motion.ts` — every runtime animation, in one file.
- `src/styles/global.css` — tokens (palette, grid, type, motion) and base.
- `scripts/verify-dist.mjs` — post-build invariants: all routes exist; `lang`, canonical and `hreflang` are correct; pages are indexable or `noindex` as declared; internal links resolve; no third-party resources; external links are limited to an allowlist (the contacts below, Lume, Pexiscale), except on the Courses pages, where course links may also go to the institutions' own hosts (exact list, HTTPS, `target="_blank"` with `rel="noopener noreferrer"`); no secret-shaped strings.

## Motion

The page is complete without JavaScript and under `prefers-reduced-motion: reduce`; motion is enrichment. Scrolling is native: no smooth-scroll library, no snapping, no parallax. Only these things animate:

1. Hero name rises through a line mask once on load (CSS, 850 ms, expo-out).
2. Section slashes, rules, the marked word and the Lume column grid reveal once on first view (`data-reveal` → `.is-in`; transform and opacity only). The header's reading-progress line is a CSS scroll timeline, with no JS.
3. The dither band between the statement and Lume follows scroll position.
4. The Lume schematic compacts with scroll position (reversible).
5. The Pexiscale composition assembles once when in view; table rows then regroup by organization.
6. Résumé: the title rises once on load; each section's command opens through a short mask on first view and a cursor shows for a few frames, then turns off.

Without JS, the server-rendered SVGs show the final state. Under reduced motion, canvases draw the final state once and nothing else moves.

## Résumé

`/resume/` and `/pt/curriculo/` render `Resume.astro` from `dict.resume` (typed in `i18n/types.ts`; project bullets, method, workflow and study rows are fixed-length tuples, so EN and PT cannot drift). Each section opens with a small monospaced command (system monospace stack, no font shipped) and answers it in the Home's type. All content is text in the DOM. There is no contact section on purpose: contact lives on the Home. `@media print` turns it into a plain black-on-white document (no header, footer, motion or dark block) for Print → Save as PDF; the *Print résumé* button appears only when JavaScript runs.

## Course images

The six curator's picks on `/courses/` and `/pt/cursos/` carry an image: the supplied files, unmodified, in `src/assets/courses/` (Astro makes the AVIF/WebP/JPEG sizes at build, never upscaled: the largest is the file itself, 1536px). Each is declared in `src/lib/courses.ts` (`curated.image`: `layout`, `kind`, `position`, `ratio`; the alt text is a key into `courses.imageAlts`, so EN and PT both have one), and `CourseCard.astro` composes the cell around it. There is no logic by title anywhere. A **photo** may be cropped by its frame (`position` keeps its focus) and leans in 1.5% on hover; a **graphic** (it has its own text) keeps its frame, never zooms, and the black letterbox bars of the supplied MIT and FGV frames are trimmed by that frame, not by editing the files. `scripts/verify-dist.mjs` fails the build if any `<img>` lacks `alt`, `width` or `height`, or any srcset candidate is missing.

## Course call to action

Each course has one action, "Acessar curso" / "Go to course": a 48px button in the action blue that closes the cell, inset by the cell's own padding, with the Radix Icons `ExternalLinkIcon` on the right (`ExternalLinkIcon.astro`: the glyph copied from `@radix-ui/react-icons` 1.3.2, MIT, licence in `/licenses/RadixIcons-MIT.txt`; the package itself is not a dependency because the project has no React). It opens the institution's page with `target="_blank" rel="noopener noreferrer"`; the icon is decorative and the link's text says where it goes.

## Institution marks

On the Courses page each course's institution is shown as its mark, not its name: the supplied logos, unmodified, in `src/assets/providers/`. `src/lib/providers.ts` is the one registry (each mark's artwork box, measured from the file, and its optical height; the catalogue's `institution` string is the key), and `CourseProvider.astro` draws it: the mark whole (`object-fit: contain`, its empty margin trimmed by the box, never the artwork), at one slot height so neighbouring titles line up, scaled down on tablet and phone. A partnership (Fundação Bradesco + Microsoft) is two marks and a quiet "+", with the full name as the group's accessible name. An institution without a mark renders its name as text. Two supplied files need care: the MIT OpenCourseWare logo is white, so it sits on the ink; the Microsoft file is opaque (#F3F3F3), so its frame is trimmed and its gaps stay pale.

## Deploy

The site is deployed by `.github/workflows/deploy.yml` (build → verify → upload `dist/` → deploy). This requires a one-time manual change:

**Settings → Pages → Build and deployment → Source: GitHub Actions.**

Until that switch is made, Pages keeps publishing the branch root, where the **legacy static site** (`index.html`, `pt/index.html`, `assets/style.css`, with `.nojekyll`) still lives. So merging does not break the live site; the workflow's deploy job simply fails until the source is switched. Rollback is the same switch in reverse.

After the new site is confirmed live from Actions, delete the legacy root files in a follow-up change.

To use a custom domain later, add it under Pages settings. Do not use a pexiscale.com subdomain.

## Rules for this repository

It is public and its history is permanent. Never commit secrets, `.env` files, addresses, ID numbers, customer or store data, or code from private repositories. The contacts in the contact section (email, LinkedIn, Instagram, GitHub) are published on purpose and are the only personal data meant to be public. Describe decisions in text instead.

Copy rules: no invented achievements, metrics, users, clients or titles. Every claim on the site already existed on the previous version (see git history) or is a direct restatement of it.
