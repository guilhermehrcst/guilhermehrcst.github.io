# Pexis Academy: official identity on the site

Date: 2026-10-11. This replaces the temporary typographic signature and the blue action colour.

## Sources (as supplied by the owner, never edited)

| File | What | SHA-256 |
| --- | --- | --- |
| `src/assets/brand/source/pexis-academy-horizontal-white.png` | Horizontal lockup: symbol, PEXIS and ACADEMY, white on transparency, 1672×941 RGBA | `1415d3a2…4c840f21` |
| `src/assets/brand/source/pexis-academy-stacked-red.png` | Stacked lockup on the brand red, 1254×1254 RGB | `868ed4a6…02264036c5` |

Both are raster files. **No vector original was supplied.** Nothing has been vectorised or redrawn.
The editable file (SVG, PDF or AI) is still requested. Once it arrives, it replaces these sources and
`node scripts/brand-assets.mjs` regenerates every derived file.

## Derived files (`scripts/brand-assets.mjs`, committed outputs)

| File | Use | How |
| --- | --- | --- |
| `src/assets/brand/lockup-white.png` (1481×413) | Header and footer | The horizontal artwork cropped to its box. The supplier's near-invisible haze (alpha ≤ 8/255) is dropped. |
| `src/assets/brand/symbol-white.png` (477×413) | Icons | The symbol alone, cropped at the gap before the wordmark |
| `public/favicon-32.png`, `public/icon-192.png`, `public/apple-touch-icon.png` | Browser and home-screen icons | The symbol, whole and centred on the brand red |

The script checks that every artwork pixel (alpha > 8) is byte-identical to the source. It also writes
`src/assets/brand/manifest.json` with the measurements and the SHA-256 of every file.
`tests/brand.test.ts` checks those hashes without running sharp, so a hand-edited or stale file fails
the tests. The site serves the lockup as lossless PNG: the brand is never re-encoded as lossy WebP.

## Colour

- **Brand red `#720111`.** It is the median of the stacked original's background, RGB(114, 1, 17), with a
  standard deviation of about 1.5 (compression noise). Two tools measured it independently: PIL during
  the analysis and sharp in the script.
- **It is also the one action colour** (`--action`), so no second hue competes with the mark. The former
  Pexis blue `#0C5FE8` is gone from the interface (tested).
- **Hover** is `#8c1023`. The **pale tint** for grounds is `#f6e9ea`.

| Pair | Contrast |
| --- | --- |
| White artwork on `#720111` | 12.15:1 |
| `#720111` on paper `#faf8f4` (links, text) | 11.46:1 |
| Paper on `#720111` (button text) | 11.46:1 |
| Paper on hover `#8c1023` | 8.94:1 |
| Ink / muted / brand on tint `#f6e9ea` | 13.70 / 5.72 / 10.28:1 |

## Rules of use

- **Placement.** The artwork appears as supplied: white, whole, on a plate of the brand red. The rest of
  the interface stays off-white.
- **Minimum size of the full lockup.** ACADEMY is 13.1% of the artwork's height (54 of 413 px). The full
  lockup is used only where ACADEMY keeps at least 6 CSS px, which means an artwork at least 46 px tall.
  - Header: 46 px.
  - Footer: 64 px (ACADEMY at 8.4 px).
- **Below that size**, the symbol alone is used: favicon and app icons.
- **Clear space on the plate.** Header: 10 px above and below, 20 px at the sides. Footer: 14 / 20 px.
- **Header geometry.** The header plate hangs from the top edge. The header is 67 px tall from 640 px up,
  which is within the 72 px anchor offset. On phones it is static, with the menu on one row from 360 px.

## Pending

1. The editable vector original of both lockups.
2. Written brand guidelines from the owner (clear space, minimum sizes, colour variants). The rules
   above are the site's conservative reading of the artwork. They are not official guidelines.
