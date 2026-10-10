# Home Narrative Terminal Design

Date: 2026-10-09  
Status: Approved design, pending implementation plan  
Repository: `guilhermehrcst/guilhermehrcst.github.io`  
Base commit: `3429b7a308f98fa79f99a39b4ebdbddf76bdca1b`

## 1. Decision

The site's Home becomes the primary living résumé / portfolio experience.

It combines the strongest editorial content from the current Home and Résumé into one coherent long-form page, narrated by a persistent terminal on large screens. The terminal is not interactive. It is a scroll-synchronized narrator and status surface.

The formal Résumé remains available at:

- English: `/resume/`
- Portuguese: `/pt/curriculo/`

That route stays optimized for fast reading, recruiters, printing, and PDF output.

Courses remain an independent public editorial product at:

- English: `/courses/`
- Portuguese: `/pt/cursos/`

## 2. Product intent

The Home should feel less like a conventional portfolio and more like a living technical document about Guilherme Henrique.

The experience should communicate three things at once:

1. identity and professional positioning;
2. evidence through real projects, screenshots, research, and implementation details;
3. a visible engineering mindset through the narrative terminal.

The terminal must add rhythm and context without competing with the editorial content.

Success means a visitor can understand the page without the terminal, while the terminal makes the experience more distinctive, coherent, and memorable.

## 3. Current architecture to preserve

The current codebase already has several useful primitives:

- `Home.astro` composes the Home from independent sections.
- `Resume.astro` contains résumé-specific project, capabilities, AI workflow, education, coursework, and influence content.
- `Command.astro` already establishes the visual language of numbered command prompts.
- `motion.ts` owns progressive motion behavior and already uses `IntersectionObserver`.
- `Base.astro` gates motion before first paint and respects `prefers-reduced-motion`.
- i18n is centralized in the typed PT/EN dictionaries.
- the influences section already uses an endless editorial rail with eight references.

The new experience should extend these conventions rather than introduce a second animation framework or a parallel content system.

## 4. Information architecture

### Home routes

- `/` remains the English Home.
- `/pt/` remains the Portuguese Home.

The Home becomes the living résumé / portfolio.

### Formal résumé routes

- `/resume/`
- `/pt/curriculo/`

These remain formal, concise, and printable. They must not depend on the narrative terminal.

### Courses routes

No role change. Courses remain separate.

## 5. Home chapter order

The target narrative order is:

1. `whoami`
2. `pexiscale`
3. `lume`
4. `pexis-machine`
5. `capabilities`
6. `ai-workflow`
7. `education`
8. `influences`
9. `principles`
10. `contact`

The final implementation should avoid duplicating the same information in multiple full sections. Existing Home and Résumé material should be merged selectively.

The content hierarchy is:

- terminal = narrator / status;
- editorial page = source of truth / proof;
- formal résumé = concise professional document.

## 6. Narrative terminal

### 6.1 Role

The terminal is a visual narrator.

It must not:

- accept input;
- expose a fake command line;
- behave like an actual shell;
- contain information unavailable elsewhere on the page;
- become the only accessible representation of any fact.

It may display shell-like commands as narrative cues.

Example:

```text
gh@portfolio:~$

> whoami
Guilherme Henrique
Software Engineer · Backend · Systems · AI

> open pexiscale
workspace........ready
catalog..........ready
sales............ready
AI...............connected
```

### 6.2 Persistence

On large screens, the terminal is persistent and sticky while the editorial document scrolls.

Initial sizing target:

- terminal column: roughly 320–380 px;
- editorial area: remaining width;
- exact width determined optically in implementation, not by a hardcoded product requirement.

The terminal should not create a device mockup, browser chrome, card stack, glass effect, or generic SaaS panel.

It should feel like part of the site's editorial grid.

### 6.3 Narrative accumulation

The terminal keeps a short accumulated history of chapters already narrated during the current page visit.

Rules:

- each chapter types only once per page visit;
- scrolling back does not replay completed typing;
- the active chapter can still be indicated without replaying;
- history is bounded so the terminal never becomes an unreadable transcript;
- older lines may remain visible when space allows, but the current chapter must always be legible.

### 6.4 Fast-scroll behavior

The terminal must follow the visitor, not lag behind them.

If the visitor crosses multiple chapters faster than the current typing sequence can finish:

1. cancel the stale typing operation;
2. discard pending intermediate animations;
3. synchronize to the newest active chapter;
4. render prior skipped state immediately if needed;
5. animate only the current relevant chapter.

The terminal must never narrate Pexiscale while the visitor is already reading Education.

### 6.5 Typing behavior

Typing is intentionally restrained.

Recommended behavior:

- command line: character-by-character;
- short values: character-by-character or rapid line reveal;
- longer status blocks: line-by-line;
- no long paragraph should be typed one character at a time;
- cursor becomes quiet after the chapter finishes;
- no perpetual blinking or decorative animation loop.

The terminal should suggest computation without forcing the visitor to wait.

### 6.6 Source of content

Narrative strings must come from typed data, preferably from the same i18n layer as the page content.

Do not scatter terminal copy through event handlers or DOM selectors.

A dedicated typed model is preferred, for example:

```ts
type NarrativeChapterId =
  | 'whoami'
  | 'pexiscale'
  | 'lume'
  | 'pexis-machine'
  | 'capabilities'
  | 'ai-workflow'
  | 'education'
  | 'influences'
  | 'principles'
  | 'contact';
```

Each language should provide the narration for every chapter.

The model should be statically checkable so missing chapters fail during development.

## 7. Scroll synchronization

Each narrative chapter in the document receives a stable semantic identifier or data attribute.

Preferred shape:

```html
<section data-narrative-section="pexiscale">
```

A single controller determines the active section.

Use one `IntersectionObserver`-based system, aligned with the existing motion architecture.

The activation zone should represent the reader's current focus, approximately the central portion of the viewport, rather than simply "any pixel is visible".

Required properties:

- deterministic section selection;
- stable behavior when two large sections overlap the activation zone;
- no observer per terminal line;
- no scroll handler doing expensive layout work every frame;
- no new animation dependency.

## 8. Relationship to existing motion system

The terminal should integrate with the existing progressive-enhancement model.

Do not add React, Vue, Svelte, GSAP, Framer Motion, Swiper, or another animation runtime for this feature.

Astro, TypeScript, CSS, `IntersectionObserver`, and a small requestAnimationFrame / timer-based typing controller are sufficient.

The implementation should avoid creating a second general-purpose motion engine beside `src/scripts/motion.ts`.

If separation improves maintainability, a focused terminal controller module may exist, but it should share the same global motion gate and reduced-motion contract.

## 9. Responsive behavior

### Desktop

- sticky persistent terminal;
- editorial content occupies the main reading column;
- terminal remains visible through chapter transitions;
- terminal must not overlap the fixed site header.

### Tablet

The terminal remains present only if the layout can preserve comfortable reading widths.

It may become narrower or move into a less dominant column.

The exact breakpoint should be determined by actual layout pressure, not device names.

### Mobile

Do not preserve the desktop two-column composition.

The terminal becomes a compact narrative surface associated with the current chapter.

Preferred behavior:

- inline or compact sticky treatment;
- command plus only a few current lines;
- no permanent 35–40% width occupation;
- no horizontally scrolling terminal;
- editorial content remains primary.

The mobile terminal may show less retained history than desktop.

## 10. Accessibility and progressive enhancement

The editorial document is always the semantic source of truth.

The terminal repeats information and therefore should not create duplicate screen-reader narration. Prefer `aria-hidden="true"` for the purely visual terminal when the same content exists semantically in the document.

No essential navigation or content may depend on the terminal.

### JavaScript disabled

The Home must remain complete and readable.

Acceptable terminal behavior without JavaScript:

- render a quiet static initial state; or
- omit the terminal enhancement.

It must never leave hidden content or blank reserved space that harms the page.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- no character-by-character typing;
- no cursor animation;
- terminal state updates immediately;
- scroll synchronization may remain functional;
- all editorial content is unchanged.

This must use the same pre-paint motion contract already established by `Base.astro`.

## 11. Home content migration

The Home should not become `Home + Resume` concatenated.

For each subject, choose one strongest editorial representation.

### Whoami

Preserve the existing strong Home hero language and identity.

The terminal provides concise context, not a second biography.

### Pexiscale

Use the richer product presentation with real workspace screenshots and concrete evidence.

The terminal gives a short system-style interpretation.

### Lume

Preserve Lume as research, not a marketing product.

Show method, experiment evidence, and the current scientific framing.

The terminal can summarize focus and method.

### Pexis Machine

Add as an experimental computing / architecture project chapter.

Its visual treatment should follow the editorial system rather than becoming a generic product card.

### Capabilities

Use the résumé's evidence-oriented capabilities language.

Avoid proficiency bars, scores, or decorative badges.

### AI workflow

Show how AI is actually used in the work process.

Keep tools subordinate to method.

### Education

Merge education and relevant coursework into one coherent chapter where possible.

The formal résumé may retain more traditional row structures.

### Influences

Reuse the endless editorial rail.

Order:

1. Jensen Huang
2. Elon Musk
3. Mark Zuckerberg
4. Steve Jobs
5. Larry Page & Sergey Brin
6. Sam Altman
7. Dario Amodei
8. Tim Cook

Remove the per-person visible numbering from influence cards.

The section-level command / chapter identity may remain numbered if the overall page system uses chapter numbering.

Cards remain editorial:

- portrait;
- name;
- organization / brand;
- short principle.

No card backgrounds, shadows, glass, dots, large arrows, or SaaS carousel controls.

### Principles

Keep a concise section about how Guilherme thinks and builds.

Do not duplicate the same language already present in project evidence.

### Contact

Finish the narrative with direct professional contact paths.

The terminal can close with a short ready / contact state rather than a novelty shell prompt.

## 12. Visual language

Preserve the established site system:

- white paper;
- black ink;
- electric blue as signal;
- Google Sans Flex;
- monospaced metadata only where technically meaningful;
- hairline rules;
- monumental typography;
- minimal radius;
- no generic card-heavy layout;
- no fake browser / laptop frames;
- no glassmorphism;
- no terminal-green-on-black cliché.

The terminal should be editorial and quiet.

A light terminal treatment is preferred so it belongs to the site rather than looking pasted in from another visual language.

## 13. Component boundaries

Target responsibilities, names may vary after implementation review:

### `NarrativeTerminal.astro`

Responsible for:

- terminal markup;
- visual presentation;
- initial static state;
- data hooks for the controller.

Not responsible for:

- detecting page sections;
- owning canonical project content;
- hardcoding PT/EN chapter text inside event handlers.

### Narrative model

Responsible for:

- typed chapter IDs;
- chapter order;
- PT/EN narration;
- compile-time completeness.

### Terminal controller

Responsible for:

- active-section observation;
- chapter transition scheduling;
- typing cancellation;
- completed-chapter tracking;
- fast-scroll synchronization;
- page visibility handling if timers are active.

### Editorial sections

Responsible for:

- semantic source content;
- `data-narrative-section` markers;
- their own visual layout.

No section should reach into terminal internals.

## 14. State model

A minimal terminal state machine is sufficient:

- `idle`
- `typing`
- `settled`

Per chapter:

- `unseen`
- `active`
- `completed`

Transitions:

1. observer selects a new chapter;
2. current typing is cancelled if it targets another chapter;
3. previously completed chapters are not replayed;
4. unseen active chapter enters `typing` when motion is enabled;
5. after completion it enters `completed`;
6. under reduced motion it moves directly to `completed`.

No persistence across browser sessions is required.

## 15. Performance requirements

The terminal must be inexpensive.

Requirements:

- one section-observation system;
- no continuous DOM measurement loop for the terminal;
- no canvas for terminal text;
- no animation framework;
- cancelled timers / frames must not leak;
- hidden-page behavior must not continue needless typing work;
- layout shift from terminal updates should be controlled.

The terminal history area should have a predictable visual height on desktop so new lines do not move the editorial column.

## 16. Print behavior

The formal résumé remains the print-first artifact.

The narrative terminal is a web-only enhancement and should not appear in print output.

If Home is printed, it should degrade to the underlying editorial content without terminal chrome.

## 17. SEO and semantics

The Home continues to expose actual headings, paragraphs, lists, project names, and links in server-rendered HTML.

Do not move meaningful text into canvas, CSS-generated content, or runtime-only terminal output.

Canonical and hreflang behavior must remain valid for the existing routes.

## 18. Error handling

The feature must fail open.

If:

- JavaScript fails;
- the terminal controller throws;
- an observer is unavailable;
- typing is cancelled unexpectedly;

the user should still receive the complete editorial page.

No runtime error should leave the document hidden or make navigation unusable.

## 19. Implementation scope

This feature is allowed to modify:

- Home composition;
- shared Home / Résumé content boundaries where deduplication is necessary;
- i18n types and dictionaries;
- motion / narrative scripts;
- new terminal component and focused supporting modules;
- section markup to add narrative hooks;
- responsive CSS;
- influence card numbering presentation;
- Pexis Machine presentation if the content source is available in the repository.

It should avoid unrelated redesigns of Courses, global navigation, deployment, or the formal résumé.

## 20. Testing strategy

Required automated / build checks:

- `npm ci`
- `npm run check`
- `npm run build`

Add focused unit tests for pure terminal logic if the repository test setup supports them without introducing new infrastructure.

Required browser QA:

1. desktop slow scroll;
2. desktop rapid scroll through multiple chapters;
3. reverse scroll;
4. revisit a completed chapter;
5. reload at top;
6. deep-link / restoration into the middle of the page where applicable;
7. resize across terminal layout breakpoints;
8. iPad portrait;
9. iPad landscape;
10. small mobile viewport;
11. large desktop viewport;
12. reduced motion;
13. JavaScript disabled;
14. tab hidden and restored while typing;
15. keyboard focus through page links;
16. print preview of formal résumé;
17. EN and PT routes.

## 21. Acceptance criteria

The implementation is complete only when all of the following are true:

- Home functions as the primary living résumé / portfolio.
- Formal résumé routes remain available and printable.
- Courses remain independent.
- Terminal is persistent on sufficiently wide screens.
- Terminal is narrator-only and accepts no input.
- Terminal tracks the active chapter accurately.
- Each chapter types at most once per page visit.
- Fast scrolling cancels stale narration and catches up.
- Reduced motion removes typing animation.
- No-JS Home remains fully readable.
- Terminal contains no exclusive factual content.
- Editorial content remains semantic HTML.
- Pexiscale, Lume, and Pexis Machine are represented as distinct kinds of work.
- Influences rail contains the eight approved references.
- Visible per-influence numbers are removed.
- No new animation/UI framework is added.
- Existing visual language remains recognizable.
- PT and EN remain complete.
- `npm run check` and `npm run build` pass.

## 22. Non-goals

This project does not include:

- an interactive shell;
- command parsing;
- keyboard command navigation;
- a chatbot;
- terminal command history controlled by the visitor;
- a fake operating system;
- a full-site dark mode;
- a redesign of Courses;
- removing the formal résumé route;
- replacing the site's typography or brand system.

## 23. Implementation principle

The terminal is not the product.

The page is the product.

The terminal is the page's narrator: synchronized, restrained, technically credible, and invisible to the experience when it cannot add value.
