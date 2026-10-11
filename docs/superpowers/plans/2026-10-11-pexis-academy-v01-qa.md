# Pexis Academy V0.1: QA evidence

Date: 2026-10-11. Branch `claude/pexis-academy-v01`. Plan: `2026-10-11-pexis-academy-v01.md`, T9.1 to T9.3.
Browser: the pre-installed Chromium through Playwright, driven by scripts kept outside the repository
(no dependency added). Server: `astro preview` of the production build.

## T9.1 Gate from scratch

| Step | Result |
| --- | --- |
| `rm -rf dist node_modules/.astro && npm ci` | exit 0, 0 vulnerabilities |
| `npm test` | 78 tests, 0 failures (final count, after T9.3) |
| `npx astro check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` | 21 canonical pages, 7 redirects, 404; `verify-dist: all invariants hold` |
| Dependencies | `package-lock.json` unchanged since `dd15aa4`; `package.json` changes only the test script |

## T9.2 Browser matrix

24 routes (21 canonical, an unknown route, `/resume/`, `/pt/curriculo/`) at 360, 390, 768, 1024 and 1440 px.

| Check | Result |
| --- | --- |
| HTTP status | 200 for the 21 pages; 404 (with the Pexis Academy page) for unknown and removed routes |
| Horizontal overflow | none, at every width |
| Target size (WCAG 2.2 AA 2.5.8), phones | first run: resource titles and single-subject area links under 24px; fixed (`330f599`); now none |
| Without JavaScript | main content identical on all pages; `/buscar/` shows the complete directory (68 entries) |
| Keyboard | first Tab is the visible skip link, Enter reaches `#main`; 40 stops on `/`, `/enem/`, `/buscar/`, each with a visible 2px outline |
| Reduced motion | no element transitions (`/`, `/tecnologia/`) |
| Redirects | `/courses/`, `/pt/cursos/enem/`, `/courses/uerj/`, `/pt/` land on their destinations |
| Search | accent-free query, words in any order, count announced, empty state, `?q=` shared and restored, Enter stays on the page |

## Visual audit

Each section was asked: "does this help the student decide the next step?". Changes made:

| Page | Finding | Change |
| --- | --- | --- |
| `/enem/` | "Aprofunde" was a wall of twelve near-identical cards | compact resource list (provider in the facts line) |
| `/vestibulares/`, `/ensino-medio/` | one course per subject stacked in one column: long and thin | an area's subjects side by side from a tablet up |
| subject pages | eyebrow repeated the title (MATEMÁTICA / Matemática) | eyebrow says "Matéria" when the area has the subject's name |
| `/buscar/` | same repetition in entry context | same rule |
| several | arrows glued to their link text ("ENEM→"): whitespace dropped between flex items | gap on those links |
| footer | spaces lost around the licence links | explicit spaces |

## T9.3 Adversarial review of the diff

| Search | Result |
| --- | --- |
| Internal URL written by hand in `src/` | none (only the favicon link) |
| `localStorage`, `sessionStorage`, cookies, `fetch` | none |
| Hex colour outside `:root` | none (tested; `theme-color` and the favicon are tied to the tokens by tests) |
| Personal traces | only guards (denylist, gone routes) and the site origin in canonical URLs; **the favicon was still the personal identity: replaced (`70d2a91`)** |
| TODO / FIXME | none |

## Not verified here

- GitHub Pages' real handling of `404.html` and of the redirect pages: provable only after a deploy.
- The official INEP and UERJ pages could not be reopened from this environment (proxy refused `gov.br`);
  the original audit of the same date stands. See the source audit, "Pexis Academy: re-verification".
- Screen readers were not run; structure (landmarks, headings, names, live region) is checked by `verify-dist`.
