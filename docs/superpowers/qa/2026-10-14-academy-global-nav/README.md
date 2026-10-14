# Pexis Academy · Global Navigation V1 — QA

Branch `feat/academy-global-nav`, base `main` b661be9 (Home V2.1). Measured on 2026-10-14 against the built
site (`npm run build`, served under `/pexis-academy/`), in Chromium (Playwright). No merge, no deploy.

## What changed

- **Header.** From 1024px: Fundamental · Médio · Pré-Militar · Vestibular · Superior · Tecnologia, then search.
  Each path is a `<button popovertarget>` that opens a native popover. Escape, a click outside or opening another
  menu closes it. Following a link loads another document, which closes it too. Each menu holds Cursos, Livros
  and Provas, each with an icon, a line and its published count. A kind with nothing published says
  "Em preparação" and is not a link. The menu ends with "Explorar [caminho]". There is no JavaScript.
- **Compact menu.** Below 1024px, and in any browser without popovers, there is one "Menu" `<details>` sheet.
  It holds the six paths as an accordion (`<details name>`, one open at a time; the current path starts open),
  then "Todos os cursos" and "Todos os materiais". It respects the safe areas. At 320px the button keeps only
  its icon, still named "Menu".
- **Destinations.** The menus reuse the two existing libraries; there is no page per combination:
  - `/cursos/?caminho=X#cursos-X`
  - `/materiais/?caminho=X&tipo=provas#provas-X`
  - `/materiais/?caminho=X&tipo=livros#livros-X`

  How the URL works:
  - The fragment selects a view. The page answers it in CSS (`:target` with `:has`).
  - The query names the view for people, and makes every view a distinct document.

  The URLs are shareable and need no JavaScript. Every view titles itself and states an empty kind. The
  chips of `/cursos/` are now links to the same URLs.
- **Books.** `src/lib/books.ts` is a typed editorial layer that sits outside the catalogue records:
  - each entry is an id plus a kind (`livro`, `apostila` or `leitura`);
  - it accepts only a published `reference`, and fails the build otherwise;
  - it is empty today, so Livros says "Em preparação" on every path.

  No reference is ever a book by itself.
- **Provas.** Provas covers past exams and simulados (`past-exam`, `simulator`). Exercises (`practice`) are
  never provas.
- **Libraries still reachable.**
  - The footer's Explorar column now starts with Cursos and Materiais.
  - The Home and search are unchanged.
  - The compact menu ends with both libraries.
- **/cursos/ bottom navigation.** It now shows below 1024px, the same width as the compact header. There the
  header hides its own search and the sheet's libraries, so nothing is offered twice, and the sheet stops above
  the bar.

## State of the catalogue (counted at build time, never typed)

| Path | Cursos | Livros | Provas |
| --- | --- | --- | --- |
| Fundamental (in preparation) | Em preparação | Em preparação | Em preparação |
| Médio | 12 | Em preparação | Em preparação |
| Pré-Militar | Em preparação | Em preparação | 1 (ITA) |
| Vestibular | 12 | Em preparação | 2 (INEP ENEM, Fuvest) |
| Superior | 8 | Em preparação | Em preparação |
| Tecnologia | 19 | Em preparação | Em preparação |

The 8 practice resources of Vestibular are not counted as provas.

## Evidence

| Check | Result |
| --- | --- |
| `npm test` | 424/424 |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` (verify-dist, project base) | all invariants hold |
| verify-dist mutations (`neg-nav.py`, 15 mutations of the built HTML) | 15/15 caught |
| Line at 1024 / 1180 / 1440 / 1920 | fits, no overflow, every button ≥ 44px |
| Each of the 6 menus at each width | opens on click, under its button, inside the viewport (flips at the right edge) |
| Escape, click outside, its own button, another menu | closes; Escape gives the focus back to the button |
| Keyboard | Tab reaches the 6 buttons; Enter and Space open; Tab enters the menu; visible focus everywhere |
| Following a menu link (keyboard, mouse, touch, no JS) | lands on the filtered view; the menu is closed |
| Filtered URLs (10 combinations, 1440 and 390) | exact counts (12, 19, 12, 8, 0, 0, 2, 1, 0, 0); empty state exactly when 0; no practice in Provas |
| Header marks the current path | on its page, its exams (ENEM, UERJ under Vestibular), and its library views |
| Compact menu at 820 / 390 / 320 (touch) | accordion one-at-a-time; no target under 44px; no horizontal overflow |
| /cursos/ at 390 / 820 | bottom bar visible; search and libraries not offered twice; the sheet stops above the bar |
| /cursos/ at 1180 | full line, no bottom bar |
| axe-core | 0 violations (menu open 1440; 4 destinations at 1440 and 390; sheet open at 820 / 390 / 320) |
| Reduced motion | the menu appears without transition |
| Regression (`<main>` vs `main` at 390 / 834 / 1280) | 15 pages pixel-identical |
| Regression (`/cursos/`) | the only difference is the chip row, 0.4–1.4px shorter. The grid HTML is byte-identical to `main` and its height is equal |
| Home / search battery of V2.1 | 0 problems (overflow, broken images, search, no-JS search, links) |

## Found and fixed during QA

- The exit transition let two menus show together for 140ms. Menus now ease in and leave at once.
- The menu at 21.5rem wrapped every line. It is now 24rem.
- Links with the same name led to different places ("Cursos …, 12" in two menus; "Vestibular" chip vs.
  footer). Every entry now carries its path in its name ("Cursos de Vestibular").
- At 320px the header was 346px wide. This was already the case on `main` (a WCAG 1.4.10 reflow failure).
  The Menu button is now a 44px icon below 360px.
- The browser's blue tap flash on the sheet's summaries is now neutralised.

## Not verified, or residual

- **Browsers.** Only Chromium was exercised. These are not verified in a real browser:
  - Safari, iPadOS and Firefox. Popovers and `:has` are supported from Safari 17 and Firefox 125.
  - Anchor positioning. Where it is absent, the menu hangs from the bar's right edge (CSS fallback).
  - The fallback to the compact menu without popovers (`@supports selector(:popover-open)`) is verified by
    the source test, not in a browser that lacks popovers.
- **Following the current destination again** from its own menu is a same-document navigation, so that menu
  stays open until Escape or a click outside.
- **The skip link on a filtered library page** replaces the fragment, so the view returns to the whole
  library. A fragment navigation already moves the focus start to the view, so the skip link is rarely needed
  there.
- **Older browsers without `:has`** show the whole library and no view title. This is the safe state.
