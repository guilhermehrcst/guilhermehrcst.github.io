# Pexis Academy design system (V0.3)

Direction: academic, warm, premium and contemporary. The institutional wine frames every page in the
header and footer. The reading surface between them stays light.

The stack is Astro with plain CSS:

- Tokens live once, in `:root` of `src/styles/global.css`, and no hex code appears anywhere else (tested).
- Component styles are scoped in their `.astro` files.
- There is no UI framework, animation library or JavaScript, except on `/buscar/`.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--brand` | `#720111` | Institutional wine, measured from the official artwork. Header, footer, and the one action colour. |
| `--action` | `#720111` | Links, primary buttons, eyebrows, focus on light grounds. Equal to `--brand` (tested). |
| `--action-hover` | `#8c1023` | Hover of actions on light grounds. |
| `--on-brand` | `#ffffff` | Text and the lockup on the wine. |
| `--on-brand-muted` | `#e9c6cb` | Secondary text on the wine. |
| `--brand-deep` | `#5a000d` | Hover and open states on the wine. |
| `--brand-line` | `#94394a` | Hairlines on the wine. |
| `--paper` | `#faf8f4` | Page ground. |
| `--surface` | `#f2efe9` | Bands: the page intro, side rails. |
| `--raised` | `#fffdf9` | Panels and menus. |
| `--tint-brand` / `--tint-sand` | `#f6e9ea` / `#efe7da` | Quiet grounds. |
| `--ink` / `--muted` | `#1d2125` / `#565c63` | Text and secondary text. |
| `--rule` / `--rule-strong` | `#e2ddd4` / `#cfc8bb` | Hairlines. |
| `--sage` `--peach` `--sky` `--cream` `--blush` `--sand` | `#d3e5c1` `#fbd2b6` `#cfe0f3` `#f3e2bb` `#f5d3d6` `#e8dcc6` | Home V2: the grounds of the six path cards (soft but present, after LabAcademy). Never an action colour. Ink ≥ 11.5:1, muted ≥ 4.8:1, measured. |
| `--*-deep` | `#a8c98c` `#f3a97c` `#9cbde2` `#dfc07a` `#e3a3a9` `#cdb994` | Home V2: illustration panels and the area cards' ground, never under text (ink on them ≥ 7.7:1). |

### Measured contrast (`tests/contrast.test.ts`)

| Pair | Ratio |
| --- | --- |
| White on wine | 12.15:1 |
| Muted rose on wine | 7.76:1 |
| White on deep wine (hover) | 14.58:1 |
| Muted rose on deep wine | 9.31:1 |
| Wine on paper | 11.46:1 |
| Paper on wine (button text) | 11.46:1 |
| Paper on hover `#8c1023` | 8.94:1 |
| Ink on paper | 15.27:1 |
| Muted on paper | at least 4.5:1, every ground tested |

**Focus.** The outline is 2px: white on the wine, wine on light grounds.

## Type

- **Faces.** Newsreader for display (H1, H2, names) and Google Sans Flex for text. Both are SIL OFL 1.1,
  self-hosted and preloaded.
- **Scale.** Fluid tokens, one continuous function of the width: `--fs-small`, `--fs-body`, `--fs-lead`,
  `--fs-h3`, `--fs-h2`, `--fs-h1` and `--fs-hero`.
- **Display weights.** 440–460, with negative tracking.
- **Labels.** Eyebrows and list captions are small uppercase at 0.08em, for one or two words only.

## Space and layout

- **Spacing.** Tokens `--space-1` to `--space-8`; the last two are fluid.
- **Container.** `.wrap`, with a max width of `--page` (72rem) plus gutters `--gutter` (16–40px).
- **Borders.** Never put a border on `.wrap` itself, because its padding is the gutter. Use an inner
  element (fixed twice in V0.3).
- **Breakpoints.**
  - 640px: two columns appear.
  - 900px: editorial rows go to one line.
  - 1024px: the hero becomes two columns; the header shows its line of six paths (where popovers exist)
    and the bottom navigation of /cursos/ gives way.
  - 1180px: five-column modules and the full footer.

## Components

| Component | What it is |
| --- | --- |
| `SiteHeader` (Global Navigation V1) | Wine bar with the white lockup, 46px tall: the minimum size at which ACADEMY keeps 6px letters. From 1024px, the six paths in the owner's order (Fundamental, Médio, Pré-Militar, Vestibular, Superior, Tecnologia), each a `<button popovertarget>` that opens a small paper menu anchored under it: Cursos, Livros, Provas (an icon, a line, the published count; "Em preparação" and no link when nothing is published), then "Explorar [caminho]". Escape, a click outside or another menu closes it. Search follows as a named icon. Below 1024px, or without popovers, a single "Menu" `<details>` sheet: the six paths as an accordion of `<details name>`, then the two libraries; at 320px the button keeps only its icon. `aria-current="true"` marks the current path's button (its page or an exam inside it); a library view marks it by `:target`. Sticky, 65px, no JavaScript. |
| `SiteFooter` | Wine, with the lockup at 64px. Columns: Institucional, Formação (exams under Vestibular), Matérias, Explorar (Cursos and Materiais first: the general libraries), then a legal bar with the real licences and attribution. |
| Library views (Global Navigation V1) | `/cursos/?caminho=X#cursos-X` and `/materiais/?caminho=X&tipo=provas#provas-X` (or `livros`): one static page per library, the view selected by the fragment and answered in CSS (`:target` with `:has`). The view titles itself and states an empty kind; the chips of /cursos/ are links to the same URLs. Provas are past exams and simulados, never practice; Livros are only references an editor classified in `src/lib/books.ts` (empty today). |
| `PageIntro` | Surface band with a breadcrumb (Início → section), a wine eyebrow, a serif H1 and a lead. |
| `PreparingNote` | The state of a path in preparation, said once ([data-preparing]). |
| `HomeHero` (V2, McGill) | Editorial split: "Aprenda" in the serif and "com direção." in the sans bold (one h1), one line, the site search (`/buscar/?q=`, native GET), the library as a button and the paths as a large underlined wine link. Beside it one photograph with square corners (a real course, named in the caption) and the wine disc with the symbol over its edge. |
| `HomePaths` + `PathArt` (V2, LabAcademy) | Wide cards on present soft grounds: an original illustration in a cut-corner panel at the top right, a white arrow disc opposite, an outlined pill with the real count or "Em preparação", the serif name and a line. The middle card of each row is turned over. On a phone, a compact row. |
| `HomeCourseFeature` (V2, ART Course) | An immersive portrait card: the course photo under a dark veil, or a wine or ink ground with the area's signs; the label large in the serif, the title, the institution, the facts; the avatar and the stated duration at the foot. A staggered row. No invented metric. |
| `HomeAreas` (V2, Prolingo) | Tall cards over a field of the area's signs (CSS generated content), a frosted panel with the name and the subjects as links, turned ±1.5° until hovered or focused. |
| `OfficialSources` | Supplied third-party marks, shown whole, in a ruled panel (Home V2: the body of `#fontes`). |
| `AreaList` | Editorial grid of areas, with subjects as 44px rows. |
| `SectionNav` (V0.4) | In-page navigation of a long path page: ruled rows (label, one muted line), two columns from 768px, each leading to a section id. verify-dist checks it lists every section of the page, in order. |
| `FeaturedResources` (V0.4) | A path's ten editorial highlights (`#destaques`, `[data-featured]`). Renders nothing until the path's selection is complete and valid; never on a path in preparation. |
| `ResourceGroups` (V0.4) | Resources by what the student does: Para estudar, Para praticar (practice, past exams, simulators), Para consultar (reference). Empty groups are omitted. |

**Cards** are used only where a unit is self-contained: an exam on Vestibular, a featured path, a mark, and (Home V2) a path, a featured course and an area of the Home.
Lists are ruled rows.

**Buttons and links.**

- The primary button is the wine with paper text, at least 52px tall.
- Secondary actions are text links with an arrow, at least 44px tall.
- Inline links are underlined.

## Motion

Only hover and focus transitions (180ms; on the Home V2 cards a 3–4px lift, a slight zoom of the illustration or photo, and the area cards straightening) and the hero's entrance. All of it is off under
`prefers-reduced-motion` (global rule, checked in dist). There is no scroll hijacking, parallax or
carousel.

## Barriers

`scripts/verify-dist.mjs` checks the built site: the header and footer on the wine, the menus (and that
every count and "Em preparação" in them agrees with what the libraries really hold), the
breadcrumbs, the six paths, the preparing pages, the official lockup and icons, the contrast-relevant
tokens, links and anchors.

The unit tests check the tokens, the taxonomy, the routes and the brand file hashes.
