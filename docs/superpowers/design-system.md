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
  - 900px: the header menus become desktop menus; editorial rows go to one line.
  - 1024px: the hero becomes two columns.
  - 1180px: five-column modules and the full footer.

## Components

| Component | What it is |
| --- | --- |
| `SiteHeader` | Wine bar with the white lockup, 46px tall: the minimum size at which ACADEMY keeps 6px letters. "Explorar" is a `<details>` menu of the six paths plus "Todas as matérias", followed by four direct links. Below 900px, a single "Menu" `<details>`. `aria-current="page"` marks the current page; a hairline marks the section. Sticky, 65px, one row at every width. |
| `SiteFooter` | Wine, with the lockup at 64px. Columns: Institucional, Formação (exams under Vestibular), Matérias, Explorar, then a legal bar with the real licences and attribution. |
| `PageIntro` | Surface band with a breadcrumb (Início → section), a wine eyebrow, a serif H1 and a lead. |
| `PreparingNote` | The state of a path in preparation, said once ([data-preparing]). |
| `ProductWindow` | A decorative window around real product data. It is `aria-hidden`, holds nothing focusable, and is captioned by a real link. |
| `ObjectiveList` | Editorial index: number, serif name, one line, and real counts or "Em preparação". |
| `LearningPath` | Five steps on a rail: vertical below 1180px, horizontal above. A pending step links nowhere. |
| `OfficialSources` | Supplied third-party marks, shown whole, in a ruled panel. |
| `AreaList` | Editorial grid of areas, with subjects as 44px rows. |
| `SectionNav` (V0.4) | In-page navigation of a long path page: ruled rows (label, one muted line), two columns from 768px, each leading to a section id. verify-dist checks it lists every section of the page, in order. |
| `FeaturedResources` (V0.4) | A path's ten editorial highlights (`#destaques`, `[data-featured]`). Renders nothing until the path's selection is complete and valid; never on a path in preparation. |
| `ResourceGroups` (V0.4) | Resources by what the student does: Para estudar, Para praticar (practice, past exams, simulators), Para consultar (reference). Empty groups are omitted. |

**Cards** are used only where a unit is self-contained: an exam on Vestibular, a featured path, a mark.
Lists are ruled rows.

**Buttons and links.**

- The primary button is the wine with paper text, at least 52px tall.
- Secondary actions are text links with an arrow, at least 44px tall.
- Inline links are underlined.

## Motion

Only hover and focus transitions (180ms) and the hero's entrance. All of it is off under
`prefers-reduced-motion` (global rule, checked in dist). There is no scroll hijacking, parallax or
carousel.

## Barriers

`scripts/verify-dist.mjs` checks the built site: the header and footer on the wine, the menus, the
breadcrumbs, the six paths, the preparing pages, the official lockup and icons, the contrast-relevant
tokens, links and anchors.

The unit tests check the tokens, the taxonomy, the routes and the brand file hashes.
