# Pexis Academy · Home V2.2 — Educational Path Cards — QA

Branch `feat/academy-home-v2-2-paths`, base `main` (Home V2.1 + header hotfix). Measured on 2026-10-15 against
the built site (`npm run build`, served under `/pexis-academy/`), in Chromium (Playwright). No merge, no deploy.

Scope: the "Qual é o seu objetivo?" section of the Home only. The catalogues, `/cursos/` and the header menus are
untouched. Outside `#objetivo` the built Home HTML is byte-identical to `main`, and every other built file is
identical too (the only differing files are `index.html` and its stylesheet).

## Diagnosis (from my own render of `main`)

The attached screenshot and the LabAcademy and Prolingo references **did not reach this session**, so I did not
compare against them. The diagnosis below comes from rendering `main` (`compare-*.jpg`, left side):

1. The art was one small symbol (blocks, book, compass, answer sheet, building, code window) in a cut-corner panel:
   an icon in a box, with the card around it mostly empty.
2. The cards alternated: the arrow disc and the text swapped places from one card to the next, so the eye had no
   fixed route.
3. The text and the label floated at different heights from card to card.
4. The middle card of each row was turned over, so the reading order of the six was not the order of the header.

## What changed

- **Order.** Fundamental, Médio, Pré-Militar, Vestibular, Superior, Tecnologia: the header's order, from a typed list
  of the Home's own (`HOME_PATH_ORDER`, `src/lib/home-featured.ts`). `PATH_ORDER` is untouched.
- **Card.** One structure for all six: art panel (top), serif name, one line, outlined label (count or "Em
  preparação"), and a paper disc at the lower right. The whole card is one link. Rows share one height per part
  (CSS subgrid, with a flex fallback).
- **Art.** `PathArt.astro` rewritten: six original scenes (a notebook with a paper plane and blocks; books, flask
  and graph; clipboard, stopwatch and flag; answer sheet, booklet and pencil; a columned facade with books and a
  mortarboard; a code window with a wireframe and a chip), all from the palette's tokens, in one art direction.
  No `clip-path`, no photographs, no `<image>`.
- **Section head.** The support line now sits under the title, at a reading width (46ch), at every size.
- **Responsive.** 3 columns from 1080px, 2 from 640px, 1 below. On a phone a card is a row (art left); below 360px
  it is a column again so the words keep a comfortable measure.
- **Contracts.** `verify-dist` compares the built `#objetivo` links with a hand-written list of the six paths
  (not derived from the source list); `tests/home.test.ts` holds the order, the one structure per card, the single
  link, and that the art stays free of images and external references.

## Photographs

None were used. No photographs with rights I could verify were available in the repository, and the image hosts
were not reachable from this environment. Rather than mix stock photos with illustration, the six cards use original
SVG compositions in one art direction. Replacing a scene with a licensed photograph is a change to `PathArt.astro`
only.

## Evidence

| Check | Result |
| --- | --- |
| `npm test` | 429/429 |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` (verify-dist, project base) | all invariants hold |
| Built site vs `main` | only `index.html` and its stylesheet differ; the Home outside `#objetivo` is byte-identical |
| 13 viewports, 320 to 1920 (`paths-qa`) | 0 problems: order, six names level per row, reading order, no overflow, no clipped text |
| Counts | each label agrees with the catalogue (12, 1, 22, 8, 19 resources + 8 trilhas; Fundamental "Em preparação") |
| Card height, wide layouts | 325 to 351px (brief: about 300 to 330px; the upper end is over it, see below) |
| Card height, phone row / 320px column | about 192 to 203px / 291 to 311px |
| Whole card is the link | art, disc, name and label all lead to the card's page |
| Focus | 3px ring in the action colour; Tab order follows the reading order |
| Hover | disc takes the wine; lift and lean only without `prefers-reduced-motion`; no transitions with reduced motion |
| axe-core | 0 violations; the cards also work without JavaScript |
| Home and search battery (390 / 834 / 1194 / 1440) | 0 problems (overflow, broken images, search, no-JS search, 44 internal links) |

## Found and fixed during QA

- The pencil of the Fundamental scene was hidden by a block and left a stray mark; redrawn after the blocks.
- Several scenes touched the panel edges, or left the sides empty on desktop; scenes were recentred and given props.
- The arrow disc covered the art; it moved to the lower right.
- On a phone the crop cut the scenes; they are scaled for the narrow panel.
- At 375 and 320px the row layout gave the words a sliver (5 to 7 line descriptions); the art column is now
  clamped, and below 360px the card is a column.

## Not verified, or residual

- **The user's screenshot and the LabAcademy / Prolingo references** were not received, so there is no comparison
  against them.
- **Safari / WebKit** was not available. CSS subgrid and the SVG transforms were exercised only in Chromium; the
  flex fallback exists but was not run in a real browser without subgrid.
- **Photographs** were not used (see above).
- Card height reaches up to 351px on some wide layouts, above the brief's 300 to 330px guide; I kept the type
  size and the art height rather than shrink them.
- `compare-1440x900.jpg`: the "before" capture is cut at the bottom and narrower than the page. I did not
  establish whether that is my capture clip or the page at that width; the rest of `main`'s layout is as shown.

## Files

- `compare-1440x900.jpg`, `compare-1194x834.jpg`: before above, after below.
- `compare-834x1194.jpg`, `compare-390x844.jpg`: before left, after right.
- `after-320.jpg`: the narrowest phone, after.
- `detail-row1-2x.jpg`: the first row at 2× (detail of the art).
