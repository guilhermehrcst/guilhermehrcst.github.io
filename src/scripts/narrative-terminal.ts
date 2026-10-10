// The Home's narrative terminal: follows the chapter being read and narrates it once.
//
// Enrichment only. The terminal is server-rendered with `whoami` already typed; if anything here
// is missing or throws, that static state stays and the page is complete. Rules (what is active,
// what was narrated, what is shown) live in src/lib/narrative-state.ts and are tested in Node;
// this file owns only the DOM, one IntersectionObserver and the typing timers.
//
//   - One observer over the chapter sections. On each callback the sections are measured once and
//     the one under the focus line (45% of the viewport) becomes active.
//   - One AbortController per typing sequence. A new chapter aborts the old sequence first, so the
//     terminal never narrates a chapter the reader has already left.
//   - A narrated chapter is never typed again; under reduced motion nothing is typed at all.
//   - A hidden tab stops all typing; on return the terminal shows the current chapter at once.

import {
  activateChapter,
  completeChapter,
  pickActiveChapter,
  visibleNarrativeIds,
  NARRATIVE_ORDER,
  type NarrativeChapterId,
  type NarrativeState,
} from '../lib/narrative-state';

const CHAR_MS = 22; // per character of a command
const LINE_MS = 80; // between output lines
const HISTORY = 3; // narrated chapters kept above the active one
const FOCUS = 0.45; // the focus line, as a fraction of the viewport height

interface Chapter { command: string; lines: readonly string[] }

const isChapterId = (s: string | undefined): s is NarrativeChapterId =>
  (NARRATIVE_ORDER as readonly string[]).includes(s ?? '');

/** Resolves after `ms`, or rejects as soon as `signal` aborts (and then leaves no timer behind). */
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(t);
      reject(signal.reason);
    };
    const t = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function el(tag: string, cls: string, text?: string) {
  const e = document.createElement(tag);
  e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function init(root: HTMLElement) {
  const log = root.querySelector<HTMLElement>('[data-narrative-log]');
  const defs = root.querySelector<HTMLTemplateElement>('template[data-narrative-chapters]');
  if (!log || !defs || !('IntersectionObserver' in window)) return; // the static state stays

  const chapters = new Map<NarrativeChapterId, Chapter>();
  defs.content.querySelectorAll<HTMLElement>('[data-narrative-chapter]').forEach((c) => {
    const id = c.dataset.id;
    if (!isChapterId(id) || !c.dataset.command) return;
    const lines = [...c.querySelectorAll('[data-narrative-line]')].map((l) => l.textContent ?? '');
    chapters.set(id, { command: c.dataset.command, lines });
  });

  const sections: { id: NarrativeChapterId; el: Element }[] = [];
  document.querySelectorAll<HTMLElement>('[data-narrative-section]').forEach((s) => {
    const id = s.dataset.narrativeSection;
    if (isChapterId(id) && chapters.has(id)) sections.push({ id, el: s });
  });
  if (!sections.length) return;

  const motion = document.documentElement.classList.contains('motion'); // the pre-paint gate (Base.astro)
  let state: NarrativeState = completeChapter({ active: 'whoami', completed: [] }, 'whoami'); // as rendered
  let typing: AbortController | null = null;

  /** A chapter's block, complete (or with an empty command, ready to be typed). */
  function block(id: NarrativeChapterId, empty: boolean) {
    const c = chapters.get(id)!;
    const b = el('div', 'nt-block');
    b.dataset.block = id;
    const cmd = el('p', 'nt-cmd');
    const text = el('span', 'nt-c', empty ? '' : c.command);
    text.lang = 'en';
    cmd.append(el('span', 'nt-p', '>'), ' ', text);
    b.append(cmd);
    if (!empty) for (const l of c.lines) b.append(el('p', 'nt-line', l));
    return { b, text };
  }

  /** Redraws the log from the state; returns the active block when it is to be typed. */
  function render(typeId: NarrativeChapterId | null) {
    let typed: ReturnType<typeof block> | null = null;
    const blocks = visibleNarrativeIds(state, HISTORY).map((id) => {
      const x = block(id, id === typeId);
      if (id === typeId) typed = x;
      if (id === state.active) x.b.classList.add('is-active');
      return x.b;
    });
    log!.replaceChildren(...blocks);
    return typed as ReturnType<typeof block> | null;
  }

  async function narrate(id: NarrativeChapterId) {
    const ctl = new AbortController();
    typing = ctl;
    const target = render(id)!;
    const c = chapters.get(id)!;
    target.b.classList.add('is-typing');
    try {
      for (const ch of c.command) {
        target.text.textContent += ch;
        await wait(CHAR_MS, ctl.signal);
      }
      for (const l of c.lines) {
        await wait(LINE_MS, ctl.signal);
        target.b.append(el('p', 'nt-line', l));
      }
      state = completeChapter(state, id);
    } catch (e) {
      if (!ctl.signal.aborted) throw e; // aborted: a newer chapter or a hidden tab took over
    } finally {
      target.b.classList.remove('is-typing');
      if (typing === ctl) typing = null;
    }
  }

  function stop() {
    typing?.abort();
    typing = null;
  }

  /** Show `id`. `immediate`: no typing, whatever the motion setting (first sync, return to the tab). */
  function show(id: NarrativeChapterId, immediate: boolean) {
    if (id === state.active && (state.completed.includes(id) || (typing && !immediate))) return;
    stop();
    const next = activateChapter(state, id, motion && !immediate);
    state = next.state;
    if (next.shouldAnimate) void narrate(id);
    else render(null);
  }

  function current() {
    const samples = sections.map(({ id, el: s }) => {
      const r = s.getBoundingClientRect();
      return { id, top: r.top, bottom: r.bottom };
    });
    return pickActiveChapter(samples, window.innerHeight * FOCUS);
  }

  let synced = false;
  const io = new IntersectionObserver(
    () => {
      if (document.visibilityState === 'hidden') return;
      const id = current();
      if (id) show(id, !synced); // the first callback reflects the load position: no typing
      synced = true;
    },
    { rootMargin: '-42% 0px -52% 0px' },
  );
  for (const s of sections) io.observe(s.el);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') return stop();
    const id = current();
    if (id) show(id, true);
  });
}

const root = document.querySelector<HTMLElement>('[data-narrative-terminal]');
if (root) {
  try {
    init(root);
  } catch {
    // Fail open: the server-rendered state is complete on its own.
  }
}
