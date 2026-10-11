# Pexis Academy V0.3: QA record

Date: 2026-10-11. Branch `claude/pexis-academy-v01`, from `main` at `9006c57`. Local only: not pushed,
merged or deployed. Spec: `docs/superpowers/specs/2026-10-11-pexis-academy-v03-design.md`. Design
system: `docs/superpowers/design-system.md`.

## Results

| Check | Result |
| --- | --- |
| `npm test` | 107/107 |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| Build + verify-dist | 22 canonical pages, 2 in preparation, 7 redirects, 404: all invariants hold |
| Browser matrix: 27 paths × 360/390/768/1024/1440 | Status, no horizontal overflow, target sizes ≥ 24px at ≤ 390: 0 problems |
| No-JS parity | 24 pages |
| Keyboard | Header order: lockup → Explorar → Vestibular → Pré-Militar → Tecnologia → Buscar. The menus open with Enter, and Tab enters the first link (360–1440). |
| Reduced motion | Animations and transitions off |
| CLS (Home, load and full scroll) | 0.0000 at 360, 768, 1024, 1440 |
| Anchors under the sticky header | Land at 96px, below the 65px header, from 320 to 1440 |
| Path names on the Home | One line, 16px from their description, at 900/1024/1180/1440 |

## Defects found and fixed during V0.3

1. The Explorar panel overflowed the page: 113px at 1024 and 9px at 1440. It now hangs from the header
   bar.
2. Anchors were hidden under the header on phones, because the header became sticky at every width. The
   offset now applies at every width.
3. "Ensino Fundamental" ran into its description at 1024. The name now scales with the width.
4. Borders sat on `.wrap`, so they ran into the gutter, in the PreparingNote and the footer legal bar.
   They moved to inner elements.
5. The mobile menu button's `aria-label` did not contain its visible text, "Menu" (WCAG 2.5.3). Removed.

## Every new verify-dist rule was shown to fail on an injected fault

- A resource on a preparing page.
- A preparing page without `noindex`.
- A preparing page without its state.
- A missing breadcrumb.
- The earlier rules of this branch (Vestibular hub, exam breadcrumbs) failed first, before their
  implementation.

## Known limitations

- **Unverifiable sources.** No official source is reachable from the build environment. So:
  - Pré-Militar names the processes but shows no edital, requirement or link.
  - Fundamental shows no resource.
  - The six brands (OpenAI, Anthropic, Google, NVIDIA, AWS, IBM) stay pending.
- **Menus without JavaScript.** They do not close on Escape or an outside click.
- **Raster logo.** The official logo is a raster file; the editable vector is still requested.
- **Browsers.** Only headless Chromium was used. Safari and Firefox were not tested.
- **No PDF of the current site was supplied.** The baseline was the build of `main`.
