# Home Narrative Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Home into the primary living résumé / portfolio, narrated by a persistent, scroll-synchronized, non-interactive terminal while preserving the formal résumé and Courses as separate routes.

**Architecture:** Keep the server-rendered editorial document as the source of truth. Add a small typed narrative domain plus a pure state reducer, then a single DOM controller that observes semantic section markers and drives a progressive-enhancement terminal. On wide screens, a `HomeNarrative` shell uses a 3/9 split with a sticky terminal; below 1180px the terminal becomes a compact sticky strip and the editorial document returns to full width.

**Tech Stack:** Astro 7, TypeScript 6, CSS, native `IntersectionObserver`, `AbortController`, Node 22 built-in test runner, existing Google Sans Flex and project motion primitives. No UI or animation framework.

**Spec:** `docs/superpowers/specs/2026-10-09-home-narrative-terminal-design.md`

## Global Constraints

- Home routes stay `/` and `/pt/`; formal résumé stays `/resume/` and `/pt/curriculo/`; Courses stays `/courses/` and `/pt/cursos/`.
- The terminal is narrator-only: no input, command parser, keyboard command navigation, chatbot, or fake operating system.
- The editorial page remains the semantic source of truth; terminal content must be derivable from content already rendered elsewhere on Home.
- No React, Vue, Svelte, GSAP, Framer Motion, Swiper, or new animation/UI runtime.
- JavaScript failure must leave the Home complete and readable.
- `prefers-reduced-motion: reduce` must remove character-by-character typing and cursor animation.
- The terminal is web-only and hidden from print.
- Preserve the existing white / black / electric-blue visual system, Google Sans Flex, hairlines, monumental typography, and restrained radii.
- Pexiscale remains a product chapter with real workspace evidence; Lume remains research; Pexis Machine remains an experimental computing chapter.
- Influence order stays Jensen Huang, Elon Musk, Mark Zuckerberg, Steve Jobs, Larry Page & Sergey Brin, Sam Altman, Dario Amodei, Tim Cook.
- Per-person influence numbers are removed.
- EN/PT dictionary parity remains compile-time enforced.
- Existing factual limits in `src/i18n/pt.ts` and `src/i18n/en.ts` remain in force: do not invent metrics, users, clients, titles, production status, or performance claims.

## Review Focus

- **Rapid scrolling across multiple chapters:** stale typing must be cancelled and the newest active chapter must win. Covered by Task 1 reducer tests and Task 3 controller behavior.
- **Revisiting a completed chapter:** it must not replay or duplicate history. Covered by Task 1 reducer tests.
- **Reduced motion / no motion gate:** chapter state must update immediately without typing. Covered by Task 1 tests and Task 3 implementation.
- **Hidden tab while typing:** no timers should continue needlessly; returning to the tab must show a current, non-stale state. Covered by Task 3.
- **Responsive collapse around 1180px and 640px:** terminal must stop stealing reading width and must never overlap the fixed header. Covered by Task 4 and Task 8 browser QA.

---

### Task 1: Add the narrative state model and test harness

**Files:**
- Create: `src/lib/narrative-state.ts`
- Create: `tests/narrative-state.test.ts`
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces:
  - `NarrativeChapterId`
  - `NARRATIVE_ORDER: readonly NarrativeChapterId[]`
  - `NarrativeState`
  - `pickActiveChapter(samples, focusY) -> NarrativeChapterId | null`
  - `activateChapter(state, next, motionEnabled) -> { state, shouldAnimate }`
  - `completeChapter(state, id) -> NarrativeState`
  - `visibleNarrativeIds(state, maxCompleted) -> readonly NarrativeChapterId[]`
- Consumes: nothing from later tasks.

- [ ] **Step 1: Write failing state tests**

Create `tests/narrative-state.test.ts` with Node's built-in `node:test` and assertions for:

```ts
assert.equal(pickActiveChapter([
  { id: 'pexiscale', top: 100, bottom: 700 },
  { id: 'lume', top: 700, bottom: 1400 },
], 450), 'pexiscale');

assert.equal(
  activateChapter(activateChapter(initialState, 'pexiscale', true).state, 'lume', true).state.active,
  'lume',
);

assert.equal(
  activateChapter(completeChapter(initialState, 'pexiscale'), 'pexiscale', true).shouldAnimate,
  false,
);

assert.deepEqual(
  visibleNarrativeIds(
    { active: 'contact', completed: ['whoami', 'pexiscale', 'lume', 'pexis-machine', 'capabilities'] },
    3,
  ),
  ['lume', 'pexis-machine', 'capabilities', 'contact'],
);
```

Also assert that `activateChapter(..., motionEnabled=false)` immediately marks the target completed.

- [ ] **Step 2: Add the test command and verify the test fails**

In `package.json` add:

```json
"test": "node --experimental-strip-types --test tests/narrative-state.test.ts"
```

Run: `npm test`  
Expected: FAIL because `src/lib/narrative-state.ts` does not exist.

- [ ] **Step 3: Implement the pure state module**

In `src/lib/narrative-state.ts`, define this exact chapter union and order:

```ts
export type NarrativeChapterId =
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

`pickActiveChapter` must prefer the section containing `focusY`; otherwise choose the sample whose nearest edge is closest to `focusY`; ties resolve by `NARRATIVE_ORDER`.

`activateChapter` must replace stale active state immediately. Completed chapters never request animation again. With motion disabled, activation completes immediately.

`visibleNarrativeIds` returns at most `maxCompleted` completed chapters plus the active chapter, without duplicates.

- [ ] **Step 4: Run the state tests**

Run: `npm test`  
Expected: PASS.

- [ ] **Step 5: Put tests into pull-request CI**

Add `npm test` after `npm ci` and before `npx astro check` in `.github/workflows/deploy.yml`.

Run: `npm test && npm run check`  
Expected: both PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/narrative-state.ts tests/narrative-state.test.ts package.json .github/workflows/deploy.yml
git commit -m "test: add narrative terminal state model"
```

---

### Task 2: Add typed narrative content and Pexis Machine copy

**Files:**
- Create: `src/lib/narrative-content.ts`
- Create: `tests/narrative-content.test.ts`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/pt.ts`
- Modify: `src/i18n/en.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `NarrativeChapterId`, `NARRATIVE_ORDER` from Task 1; existing `Dict`, résumé data, principles, contact data, and `influences`.
- Produces:
  - `PexisMachineCopy` on `Dict`
  - `NarrativeChapter { id, command, lines }`
  - `buildNarrative(dict: Dict): readonly NarrativeChapter[]`

- [ ] **Step 1: Write failing content tests**

Create `tests/narrative-content.test.ts` with assertions that:

- `buildNarrative(en).map(x => x.id)` equals `NARRATIVE_ORDER`.
- `buildNarrative(pt).map(x => x.id)` equals `NARRATIVE_ORDER`.
- every chapter has a non-empty command and at least one non-empty output line;
- influence narration contains all eight names from `src/lib/influences.ts`;
- Pexis Machine narration contains only content also present in `dict.pexisMachine`;
- the returned arrays contain exactly ten chapters.

Update `npm test` to run both test files explicitly.

Run: `npm test`  
Expected: FAIL because the new copy/model does not exist.

- [ ] **Step 2: Add `PexisMachineCopy` to the typed dictionary**

In `src/i18n/types.ts` add:

```ts
export interface PexisMachineCopy {
  label: string;
  name: string;
  kind: string;
  question: string;
  body: string;
  facts: [Fact, Fact, Fact];
}
```

Add `pexisMachine: PexisMachineCopy` to `Dict`.

- [ ] **Step 3: Add conservative PT/EN Pexis Machine copy**

Use only these approved facts:

**PT**
- label: `04 / Experimento`
- name: `Pexis Machine`
- kind: `Laboratório de arquitetura computacional em software`
- question: `Como observar o comportamento de uma máquina computacional completa dentro do navegador?`
- body: `Um laboratório experimental que simula uma máquina em software. O núcleo de simulação é a fonte de verdade; a interface visual apenas observa o estado produzido por ele.`
- facts:
  1. `Máquina em software` — `CPU, memória, interconexão e aceleradores são modelados como partes do sistema, não como uma animação decorativa.`
  2. `Core como fonte de verdade` — `A visualização lê o estado produzido pelo simulador; a interface não decide o comportamento da máquina.`
  3. `Laboratório evolutivo` — `O primeiro uso é experimentar ideias ligadas ao Lume, preservando espaço para novos subsistemas e estudos de arquitetura.`

**EN**
- label: `04 / Experiment`
- name: `Pexis Machine`
- kind: `Software computer-architecture laboratory`
- question: `How can the behavior of a complete computer be observed inside the browser?`
- body: `An experimental laboratory that simulates a machine in software. The simulation core is the source of truth; the visual interface only observes the state it produces.`
- facts:
  1. `Machine in software` — `CPU, memory, interconnect and accelerators are modeled as parts of the system, not as decorative animation.`
  2. `Core as source of truth` — `The visualization reads state produced by the simulator; the interface does not decide machine behavior.`
  3. `Evolving laboratory` — `Its first use is to experiment with ideas related to Lume while leaving room for new subsystems and architecture studies.`

Do not add a public link or performance claim.

- [ ] **Step 4: Implement `buildNarrative(dict)`**

Commands are fixed, language-independent strings:

```text
whoami
open pexiscale
open lume
open pexis-machine
capabilities
ai-workflow
education
influences
principles
contact
```

Narrative lines must be derived from the same data already used by the editorial page:

- whoami: name + résumé role + place;
- Pexiscale: name + résumé kind + résumé stack;
- Lume: name + résumé kind + résumé stack;
- Pexis Machine: name + kind + body;
- capabilities: capability group titles;
- AI workflow: résumé flow items joined with ` → `;
- education: education school names, then coursework school names without duplicates;
- influences: the eight names from `influences`;
- principles: principle titles;
- contact: contact item labels.

Do not invent terminal-only claims.

- [ ] **Step 5: Run tests and type checking**

Run: `npm test && npm run check`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/narrative-content.ts tests/narrative-content.test.ts src/i18n/types.ts src/i18n/pt.ts src/i18n/en.ts package.json
git commit -m "feat: add typed home narrative content"
```

---

### Task 3: Build the narrator-only terminal and controller

**Files:**
- Create: `src/components/NarrativeTerminal.astro`
- Create: `src/scripts/narrative-terminal.ts`
- Modify: `src/lib/narrative-state.ts`
- Modify: `tests/narrative-state.test.ts`

**Interfaces:**
- Consumes: `buildNarrative(dict)`, `NarrativeChapterId`, reducer functions from Tasks 1–2.
- Produces DOM hooks:
  - root: `[data-narrative-terminal]`
  - log: `[data-narrative-log]`
  - hidden chapter definitions: `[data-narrative-chapter][data-id][data-command]`
  - output lines: `[data-narrative-line]`
  - document sections: `[data-narrative-section="<id>"]`

- [ ] **Step 1: Add state tests for the controller contract**

Extend `tests/narrative-state.test.ts` to assert:

- switching `pexiscale -> lume -> education` before completion leaves `education` active and does not mark the stale chapters completed;
- completing a chapter twice does not duplicate it;
- visible history always includes the active chapter even when the completed-history bound is reached.

Run: `npm test`  
Expected: FAIL until the reducer behavior matches the contract.

- [ ] **Step 2: Make the reducer satisfy the controller contract**

Keep the reducer pure. Do not put timers or DOM references into `src/lib/narrative-state.ts`.

Run: `npm test`  
Expected: PASS.

- [ ] **Step 3: Render the terminal component**

`NarrativeTerminal.astro` receives `lang: Lang`, builds the ten chapters, and SSR-renders `whoami` as the quiet no-JS initial state.

Requirements:

- root has `aria-hidden="true"`;
- no `input`, `textarea`, `form`, `contenteditable`, or button;
- visual prompt is `gh@portfolio:~$`;
- initial visible block is `> whoami` plus its lines;
- chapter definitions are present as hidden DOM data for the controller;
- terminal text uses the existing mono stack;
- no black terminal card, green text, glass, shadow, fake traffic-light controls, or browser chrome;
- a single blue cursor may exist only while actively typing.

- [ ] **Step 4: Implement the DOM controller**

In `src/scripts/narrative-terminal.ts`:

- observe all `[data-narrative-section]` with `rootMargin: '-42% 0px -52% 0px'`;
- use `pickActiveChapter(..., window.innerHeight * 0.45)` when observation changes;
- initialize `whoami` as completed because it is already server-rendered;
- one active `AbortController` owns each typing sequence;
- on chapter change, abort the old sequence before starting the new one;
- completed chapters render immediately on revisit and never replay;
- character delay: 22 ms for command text;
- line gap: 80 ms;
- longer output lines appear line-by-line rather than character-by-character;
- keep the last 3 completed chapters plus the active chapter in desktop history;
- on `document.visibilityState === 'hidden'`, abort typing and stop pending work;
- when visible again, synchronize immediately to the current active chapter instead of replaying stale typing;
- if reduced motion is active, render chapter state immediately;
- if `IntersectionObserver` is unavailable, leave the SSR initial state untouched.

Use `textContent` / DOM nodes, never runtime `innerHTML`.

- [ ] **Step 5: Verify**

Run: `npm test && npm run check && npm run build`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/NarrativeTerminal.astro src/scripts/narrative-terminal.ts src/lib/narrative-state.ts tests/narrative-state.test.ts
git commit -m "feat: add scroll-synchronized narrative terminal"
```

---

### Task 4: Add the responsive Home narrative shell

**Files:**
- Create: `src/components/HomeNarrative.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `NarrativeTerminal lang={lang}`.
- Produces:
  - one terminal rail;
  - one slotted editorial document;
  - responsive layout behavior used by `Home.astro` in Task 6.

- [ ] **Step 1: Add a build invariant that will fail before the shell is used**

In `scripts/verify-dist.mjs`, prepare Home-only assertions for a future `data-home-narrative` root and exactly one `data-narrative-terminal` on each Home route.

Do not add chapter-count assertions yet; those arrive in Task 7.

Run: `npm run build`  
Expected: FAIL because Home does not yet contain the shell.

- [ ] **Step 2: Implement `HomeNarrative.astro`**

Wide layout, `min-width: 1180px`:

```css
.home-narrative {
  display: grid;
  grid-template-columns: minmax(280px, 3fr) minmax(0, 9fr);
  gap: var(--gap);
  padding-inline: var(--margin);
  align-items: start;
}
```

Terminal rail:

- `position: sticky`;
- `top: calc(var(--header-h) + var(--space-md))`;
- max usable height: `calc(100svh - var(--header-h) - 2 * var(--space-md))`;
- content column gets `min-width: 0` and locally sets `--margin: 0px` so nested section grids do not double-pad.

Below 1180px:

- shell becomes one column;
- editorial content returns to the normal page margin;
- terminal becomes a compact sticky strip below the fixed header;
- terminal background stays `var(--paper)` with hairline bottom rule and z-index below the site header.

Below 640px:

- terminal displays only the current chapter block, not retained history;
- it must not horizontally scroll;
- it must not consume more than roughly 30% of the viewport height.

Print:

- hide `[data-narrative-terminal]`.

- [ ] **Step 3: Temporarily mount the shell around an empty slot in a local branch check**

Use the component from a minimal temporary Home edit only long enough to verify CSS and build behavior, then keep the real composition change for Task 6.

Run: `npm run check && npm run build`  
Expected: PASS after the real Home shell marker exists. If the temporary mount is needed to satisfy the invariant, leave the shell mounted around the current Home sections; Task 6 will replace its contents.

- [ ] **Step 4: Commit**

```bash
git add src/components/HomeNarrative.astro src/styles/global.css scripts/verify-dist.mjs src/components/Home.astro
git commit -m "feat: add responsive home narrative shell"
```

---

### Task 5: Add Home-specific capability, AI, education, and influence chapters

**Files:**
- Create: `src/components/HomeCapabilities.astro`
- Create: `src/components/HomeAiWorkflow.astro`
- Create: `src/components/HomeEducation.astro`
- Create: `src/components/HomeInfluences.astro`
- Modify: `src/components/ResumeInfluences.astro`

**Interfaces:**
- Consumes:
  - `dicts[lang].resume.capabilities`
  - `dicts[lang].resume.ai`
  - `dicts[lang].resume.education`
  - `dicts[lang].resume.coursework`
  - `dicts[lang].resume.influences`
  - existing `aiIcons`, `institutionLogos`, `ResumeInfluences`
- Produces semantic Home sections with:
  - `data-narrative-section="capabilities"`
  - `data-narrative-section="ai-workflow"`
  - `data-narrative-section="education"`
  - `data-narrative-section="influences"`

- [ ] **Step 1: Build the four sections from existing typed résumé content**

Use `Command.astro` as the small technical label:

- `05 > capabilities`
- `06 > ai-workflow`
- `07 > education`
- `08 > influences`

Keep the résumé's content as the data source. Home markup may be more editorial, but must not duplicate copy into new dictionary fields.

Capabilities:
- plain words / groups;
- no levels, bars, percentages, or badges.

AI workflow:
- method first;
- tools second;
- existing icons may be reused;
- no proficiency claims.

Education:
- merge education and coursework into one chapter;
- preserve institution names, programs, and statuses;
- keep logos subordinate to text.

Influences:
- wrapper introduces the chapter and reuses `ResumeInfluences`.

- [ ] **Step 2: Remove per-person influence numbering**

In `ResumeInfluences.astro`:

- change the semantic list from ordered to unordered;
- remove `.infl-n` markup and CSS;
- reduce the shared card row model from five rows to four rows;
- update comments that still describe numbering;
- keep the eight-person order unchanged;
- keep rail drift, accessibility, clone behavior, reduced motion, and manual scrolling unchanged.

- [ ] **Step 3: Verify the shared influence rail**

Run: `npm run check && npm run build`  
Expected: PASS, with no `infl-n` class emitted on Home or résumé.

- [ ] **Step 4: Commit**

```bash
git add src/components/HomeCapabilities.astro src/components/HomeAiWorkflow.astro src/components/HomeEducation.astro src/components/HomeInfluences.astro src/components/ResumeInfluences.astro
git commit -m "feat: add home résumé chapters"
```

---

### Task 6: Add Pexis Machine and recompose the Home

**Files:**
- Create: `src/components/PexisMachine.astro`
- Modify: `src/components/Home.astro`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Pexiscale.astro`
- Modify: `src/components/Lume.astro`
- Modify: `src/components/Principles.astro`
- Modify: `src/components/Contact.astro`
- Modify: `src/i18n/pt.ts`
- Modify: `src/i18n/en.ts`

**Interfaces:**
- Consumes: Home shell from Task 4; Home chapter components from Task 5; Pexis Machine dictionary copy from Task 2.
- Produces the final Home chapter sequence and all ten `data-narrative-section` markers.

- [ ] **Step 1: Implement `PexisMachine.astro`**

Render:

- label from `dict.pexisMachine.label`;
- monumental `Pexis Machine/` heading;
- question;
- body;
- three facts.

Use the established editorial system, not a product card.

Do not add:
- fake hardware screenshots;
- 3D imagery not present in the repository;
- public repo link unless a canonical link already exists at implementation time and is explicitly approved;
- metrics or performance claims.

Add `data-narrative-section="pexis-machine"`.

- [ ] **Step 2: Re-number existing Home project/method/contact labels**

Update Home-facing copy only:

- Pexiscale label: `02 / Produto` / `02 / Product`
- Lume label: `03 / Pesquisa` / `03 / Research`
- Principles label: `09 / Método` / `09 / Method`
- Contact label: `10 / Contato` / `10 / Contact`

In `ProjectDetail` call sites:
- Pexiscale uses `num="02"`;
- Lume uses `num="03"`.

Formal résumé numbering is unchanged.

- [ ] **Step 3: Add narrative markers to existing sections**

- Hero: `data-narrative-section="whoami"`
- Pexiscale: `data-narrative-section="pexiscale"`
- Lume: `data-narrative-section="lume"`
- Principles: `data-narrative-section="principles"`
- Contact: `data-narrative-section="contact"`

Keep existing IDs such as `id="pexiscale"` and `id="lume"`.

- [ ] **Step 4: Recompose `Home.astro`**

The exact order becomes:

```astro
<Hero lang={lang} />
<HomeNarrative lang={lang}>
  <Pexiscale lang={lang} />
  <DitherBand />
  <Lume lang={lang} />
  <PexisMachine lang={lang} />
  <HomeCapabilities lang={lang} />
  <HomeAiWorkflow lang={lang} />
  <HomeEducation lang={lang} />
  <HomeInfluences lang={lang} />
  <Principles lang={lang} />
  <Contact lang={lang} />
</HomeNarrative>
```

Remove `Statement` and `About` from Home composition. Do not delete those files in this task; they can remain unused until a later cleanup.

Keep `Monument` after the main content.

- [ ] **Step 5: Verify**

Run: `npm test && npm run check && npm run build`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/PexisMachine.astro src/components/Home.astro src/components/Hero.astro src/components/Pexiscale.astro src/components/Lume.astro src/components/Principles.astro src/components/Contact.astro src/i18n/pt.ts src/i18n/en.ts
git commit -m "feat: make home the living resume"
```

---

### Task 7: Lock the built Home invariants

**Files:**
- Modify: `scripts/verify-dist.mjs`

**Interfaces:**
- Consumes: final built HTML from Task 6.
- Produces build-time guarantees for the narrative architecture.

- [ ] **Step 1: Add Home chapter invariants**

For `/` and `/pt/`, require exactly one occurrence of each:

```text
data-narrative-section="whoami"
data-narrative-section="pexiscale"
data-narrative-section="lume"
data-narrative-section="pexis-machine"
data-narrative-section="capabilities"
data-narrative-section="ai-workflow"
data-narrative-section="education"
data-narrative-section="influences"
data-narrative-section="principles"
data-narrative-section="contact"
```

Also require:

- exactly one `data-narrative-terminal`;
- terminal root includes `aria-hidden="true"`;
- no `class="infl-n"`;
- Pexis Machine heading appears;
- Home still has exactly one `<h1>`.

For formal résumé routes, require:

- `data-print` still exists;
- no `data-narrative-terminal`.

- [ ] **Step 2: Run build and fix only architecture violations**

Run: `npm run build`  
Expected: PASS with all invariants.

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-dist.mjs
git commit -m "test: lock narrative home build invariants"
```

---

### Task 8: Full interaction, accessibility, responsive, and print verification

**Files:**
- Modify only files that fail verification.
- Do not redesign unrelated sections during this task.

**Interfaces:**
- Consumes: completed feature branch.
- Produces: release-ready branch evidence.

- [ ] **Step 1: Run the complete automated gate**

Run:

```bash
npm ci
npm test
npm run check
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Desktop browser QA**

At a wide viewport (at least 1440px):

- terminal is sticky and does not overlap the fixed header;
- content uses the remaining reading width;
- initial terminal state shows `whoami`;
- slow scrolling triggers chapters in the specified order;
- each chapter types only once;
- reverse scrolling does not replay completed chapters;
- rapid scrolling across at least three chapters cancels stale typing and catches up to the newest chapter;
- Pexiscale screenshots remain legible;
- Lume remains visually distinct as research;
- no horizontal page scrollbar appears.

- [ ] **Step 3: Tablet and iPad QA**

Check both portrait and landscape around the 1180px breakpoint:

- layout does not oscillate between modes;
- compact sticky terminal sits below the site header;
- terminal does not cover section headings;
- editorial content regains full reading width;
- orientation change does not leave stale terminal geometry.

- [ ] **Step 4: Mobile QA**

At 390px and 320px:

- terminal shows current chapter only;
- terminal height remains under roughly 30% of viewport height;
- no horizontal terminal scroll;
- influence rail remains manually scrollable;
- no visible influence numbers;
- project screenshots and text remain readable.

- [ ] **Step 5: Motion and failure-mode QA**

Verify:

- with `prefers-reduced-motion: reduce`, chapter changes are immediate, cursor does not animate, influence rail does not auto-drift;
- hide the browser tab while typing, wait, return: no stale queued typing runs;
- disable JavaScript: Home remains complete and readable, terminal stays quiet/static or absent, no editorial content is hidden;
- keyboard-tab through all real links: terminal never receives fake input focus.

- [ ] **Step 6: Formal résumé and print QA**

Check `/resume/` and `/pt/curriculo/`:

- formal résumé remains direct and printable;
- print control still works;
- terminal does not appear;
- influence cards have no visible person numbers;
- print preview contains no narrative-terminal chrome.

- [ ] **Step 7: Language QA**

Check `/` and `/pt/`:

- identical chapter order;
- commands remain the agreed code-like English tokens;
- output lines use the active page language where the source data is localized;
- no PT/EN dictionary drift.

- [ ] **Step 8: Commit any verification fixes**

If QA required changes:

```bash
git add <only-files-fixed-by-QA>
git commit -m "fix: polish narrative home interaction"
```

If no changes were required, record the successful commands and browser checks in the implementation report and do not create an empty commit.
