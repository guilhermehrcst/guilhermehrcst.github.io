# Pexis Academy V0.2 — visual transformation: QA record

Date: 2026-10-11. Branch: `claude/pexis-academy-v01`, based on `main` at 84fc0a2. Not merged, not deployed.
Reference: the Claude Code product page (PDF supplied with the brief), used for rhythm, composition and
finish only. Nothing was taken from it: no text, identity, illustration, component or pixel layout, and
no pricing section.

## What changed on the Home

The sections run in this order, and verify-dist fixes that order.

| Section | Content | Real data from |
| --- | --- | --- |
| Hero | "Aprenda com direção." with two CTAs, beside a window showing the real `/materias/matematica/` page | `filterResources`, `objectivesFor` |
| `#objetivo` | Editorial index of the 5 objectives with counts (13, 7, 29, 12, 17 · 7 trilhas) | `objectiveFacts` (tested) |
| `#caminho` | ENEM → Matemática → Assunto ("Em preparação": no topic verified yet) → Matemática para ENEM (Kultivi) → Provas e gabaritos do Enem (INEP) | `resolveGuide`, `resourcesByIds`, `officialSources` |
| `#fontes` | Six institutions as their supplied marks, each linked to its track on /tecnologia/; an independence statement | `institutions` (tested), `providerMarks`, `publishedTracks` |
| `#areas` | Editorial grid of the 6 areas, with subjects as 44px rows (shared with /materias/) | `subjectsOf` |
| `#trilhas` | ENEM guide, UERJ guide, "Começar a programar" | `resolveGuide`, `publishedTracks`, `resourcesByIds` |
| `#curadoria` | Policy sentence, verified-date stamp, three rules, link to /sobre/ | `VERIFIED_ON` |
| `#perguntas` | Six native `<details>`, with answers checked against the data | — |
| Footer | Objetivos · Matérias · Tecnologia · Sobre a Academy; independence; licences | taxonomy, tracks, routes |

Design system:

- Newsreader (OFL) for headings, Google Sans Flex for text.
- Pexis blue #0C5FE8, measured at 5.19:1 on paper.
- Off-white paper, raised and tinted surfaces.
- Temporary serif signature "Pexis Academy" in the header, footer and favicon.

## Fail-closed guarantees added

**Build-time throws**, so the page cannot quietly state something false:

- the path module's resource leaves the ENEM study section, or its source leaves the practice section;
- an institution listed under "cursos" has a non-course resource;
- an institution has no track to link to.

**verify-dist**, on top of the V0.1 invariants:

- The hero links `#objetivo` and `/materias/`, and holds a product window.
- A product window is aria-hidden, holds nothing focusable, is captioned by a link, and shows only published ids.
- `#caminho`:
  - has five steps, in order;
  - a pending step links nowhere;
  - every other step links to exactly one internal page.
- `#fontes`: three or more institutions, each linking to one internal anchor.
- `#trilhas`: one to three paths, each with two or more steps and one internal link.
- `#perguntas`: four or more `<details>`, each with a `<summary>` question.
- Forbidden claims: the Home's text never says partner, sponsor, supported or endorsed, nor tutor, saved progress or an Academy certificate.
- The footer of every page links every objective, every subject, `/materias/`, `/buscar/` and `/sobre/`.
- No page has a duplicate id.
- Anchors must match an `id` attribute exactly. This fixed a substring check that `data-resource-id` satisfied, and so caught six dangling links before release.
- A link's accessible name counts an image's `alt` and a `role="img"` label.

Each new rule was shown to fail on an injected fault, then to pass on the clean build:

- a pending step given a link;
- an invented demo id;
- the word "parceiros";
- "IA tutora";
- a summary without "?";
- a footer missing Física;
- the six dangling anchors.

## Results

| Check | Result |
| --- | --- |
| `npm test` | 88/88 pass |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| `astro build` + verify-dist | 21 pages, 7 redirects, 404, 73 files: all invariants hold |
| Browser matrix: 24 paths × 360/390/768/1024/1440 | Status codes, no horizontal overflow, targets ≥ 24px at ≤ 390: 0 problems |
| No-JS parity | 21 pages |
| Keyboard order | Header first, logical; focus ring global |
| `prefers-reduced-motion: reduce` | All animation and transition off (global rule); content visible |
| CLS on load + full scroll (Home) | 0.0000 at 360, 768, 1024, 1440 |
| Logo integrity in `#fontes` | No mark cut or overlapping its count at 320–1440, including both sides of every breakpoint |

## Known limitations

1. **Brand asset.** The approved red-book symbol of Pexis Academy was not found in the repository, its
   history or the uploads. The header uses a temporary typographic signature. The official asset is needed.
2. **Brands.** OpenAI, Anthropic, Google, NVIDIA, AWS and IBM are not shown. Their official pages could not
   be checked from this environment. They are recorded as pending, with candidates, in
   `docs/superpowers/research/2026-10-11-official-brands.md`.
3. **Microsoft** appears only as co-publisher of FluêncIA ("Fundação Bradesco + Microsoft"). The Microsoft
   Learn entries remain held back in the catalogue.
4. **Topics.** No subject has verified topics yet, so the path's "Assunto" step honestly reads "Em preparação".
5. **Screenshots** were taken in headless Chromium only. Safari and Firefox were not tested.
