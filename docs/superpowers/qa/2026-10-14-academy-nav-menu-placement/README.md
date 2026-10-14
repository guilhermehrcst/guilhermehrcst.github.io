# Pexis Academy · Hotfix P0 — header menu placement (Safari / iPad)

Branch `fix/academy-nav-menu-position`, base `main` 26b791a (Global Navigation V1). No merge, no deploy.
Scope: where the six header menus open. The header design, the Home, the catalogue and the menu contents are
untouched.

## Report

On an iPad (Safari), "Tecnologia", the rightmost button, opened its panel at the far left of the page, over the
course thumbnails. (The screenshot attached to the request did not reach this session; the description of the
symptom was used.)

## Root cause

The V1 stylesheet placed the panel **only** through CSS anchor positioning:

```css
.panel { position: fixed; inset: auto; top: 72px; right: var(--gutter); … }      /* fallback */
@supports (position-area: block-end) {
  .panel { top: auto; right: auto; position-area: block-end span-inline-end; position-try-fallbacks: flip-inline; }
}
```

The `@supports` block **removes the fallback coordinates** (`top: auto; right: auto`, with `inset: auto` already
set) and leaves `position-area` as the panel's only position. A popover is in the top layer, so its coordinates
are the viewport's. If the engine reports the feature as supported and still does not resolve the anchor for a
top-layer box, the panel has **no position of its own** and falls back to its static position. That is
engine-dependent, and not under the stylesheet's control. A feature test (`@supports`) says the property parses;
it does not say the placement works.

What was verified, and what was not:

- **Verified (Chromium):** with the anchor unresolved, the panel loses every coordinate and lands at
  `left: 798px; top: 8px` (1194px viewport), for Fundamental and for Tecnologia alike. So the design has no
  safe fallback.
- **Not verified:** the exact behaviour of WebKit. No WebKit/Safari is available in this environment (only
  Chromium, and the setup is fixed), so the Safari failure itself was **not reproduced**. The cause above is
  the mechanism that the code makes possible and that the symptom matches. It is not a measured WebKit result.

## Fix

One mechanism for the six menus, independent of the engine's anchor support:

- `src/scripts/menu-placement.ts` (new, 708 bytes shipped): when a menu opens (the button's `click`, which runs
  before the popover shows, and `beforetoggle`) it reads the button's `getBoundingClientRect()` and writes
  `--anchor-left`, `--anchor-right`, `--anchor-bottom` and `data-align` on the panel. It places it again if the
  viewport changes while the menu is open (an iPad turned). No network, no storage, no dependency, no coordinate
  per path.
- `src/lib/menu-placement.ts` (new, pure): the one decision, which edge of the button the panel hangs from. A
  button in the left half of the page opens its panel from its own left edge, one in the right half from its own
  right edge.
- `src/components/SiteHeader.astro`: the CSS anchor positioning is **removed** (`anchor-name`, `position-anchor`,
  `position-area`, `position-try-fallbacks`, and the `@supports` block). `left` is
  `clamp(var(--edge-l), anchor, 100% − panel width − var(--edge-r))`, so the panel always stays between the side
  margins, which are `max(gutter, env(safe-area-inset-*))`. `top` is the button's bottom plus 8px.
- Without the script (or before it runs): the panel hangs from the right margin, under the header: always
  inside the viewport, only not under its own button. The menus themselves (open, Escape, outside click,
  navigation, keyboard, touch) are native and need no script.
- `scripts/verify-dist.mjs`: the contract "content pages carry no JavaScript" becomes "no JavaScript but the
  header's placement script": exactly one per page (plus the search page's own), a first-party module, under
  2 KiB, with no network, storage, cookie or dynamic import. 9 mutations of the built HTML, all caught.
- `tests/menu-placement.test.ts` (new) and `tests/site-header.test.ts`: the side decision, no anchor
  positioning, no per-path coordinate, no negative margin or transform, and the script's limits.

## Evidence

| Check | Result |
| --- | --- |
| `npm test` | 427/427 |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` (verify-dist, project base) | all invariants hold |
| Geometry, 6 menus × 1024, 1194, 1280, 1440, 1920 × Home, /cursos/, /vestibulares/ (mouse) | 0 problems |
| Same, touch with an iPad user agent, 1194×834, 1366×1024, 1024×768 | 0 problems |
| Same on Chromium with CSS anchor positioning disabled (`--disable-features=CSSAnchorPositioning`) | 0 problems, identical numbers |
| Per menu, asserted | open; directly under its button (gap 8px); inside the side margins; inside the viewport; overlaps its button; aligned to its button's left or right edge (or pinned to the margin); no horizontal overflow; header and `<main>` do not move |
| Extremes | Fundamental opens from its left edge, Tecnologia from its right edge (panel right = button right, e.g. 1136 at 1194px) |
| Escape; click or tap outside; opening another menu; following a link | all close it (mouse and touch); the link lands on the filtered view |
| Resize with a menu open (1440→1194→1100→1280→820) | placed again each time; hidden at 820 (compact menu) |
| No JavaScript | opens under the header at the right margin, inside the viewport (1024, 1194, 1440) |
| Compact menu at 390 and 820 | unchanged: no desktop button visible, the sheet opens, no overflow |
| V1 browser battery (keyboard, focus, 10 filtered URLs, axe, bottom nav) | 0 problems |
| Home / search battery of V2.1 | 0 problems |
| V1 menu contract mutations (`neg-nav`) | 15/15 caught |

Screenshots: `01…06` in this folder. `menu-placement-qa.mjs` is the measuring script (it needs Playwright and a
served build; the repo has no browser test infrastructure, so it is kept here rather than in `npm test`).

## Not verified

- **Safari / WebKit, iPadOS.** Not available here. The touch runs use Chromium with an iPad viewport and user
  agent: they exercise the layout and the events, not WebKit. The fix does not depend on anything WebKit-specific
  that is not widely supported (`getBoundingClientRect`, custom properties, `clamp()`, `popover`, `click`,
  `beforetoggle`). `beforetoggle` is the one event whose support is the most recent. The button's `click` covers
  placement before the first paint even if a browser lacks it. **This needs one real check on an iPad before it
  is called fixed in Safari.**
- `env(safe-area-inset-*)` cannot be set in Chromium: the margins were measured with the safe areas at 0. The
  expression is `max(var(--gutter), env(safe-area-inset-left|right))`, the same the bar uses.
