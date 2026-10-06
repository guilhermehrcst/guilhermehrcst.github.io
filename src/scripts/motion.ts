// Motion. Everything here is enrichment: the page is complete without it.
//
// What moves, and only this:
//   1. The hero name rises once through its line masks (CSS; this file only
//      decides *when*, after fonts are ready).
//   2. Section slashes, rules and the Lume grid reveal once on first view.
//   3. The dither band between paper and Lume follows scroll position.
//   4. The Lume schematic compacts with scroll position.
//   5. The Pexiscale composition assembles once when in view (CSS transitions).
// Everything else moves only because the document scrolls.

import { bandCell, bandCols, BAND_ROWS, BAND_STATIC_P, INK, SIGNAL } from '../lib/dither';
import { addressAt, lumeModel, stateIndex, type Model } from '../lib/lume-model';

const root = document.documentElement;
const animate = root.classList.contains('motion'); // false under reduced motion
const css = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/* 1. Load ----------------------------------------------------------------- */
if (animate) {
  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 900))]).then(() => {
    requestAnimationFrame(() => root.classList.add('loaded'));
  });
}

/* Scroll-linked modules: one passive listener, one rAF, only while visible. */
type Scrubber = { el: Element; visible: boolean; update: (r: DOMRect, vh: number) => void };
const scrubbers: Scrubber[] = [];
let queued = false;
function frame() {
  queued = false;
  const vh = window.innerHeight;
  for (const s of scrubbers) if (s.visible) s.update(s.el.getBoundingClientRect(), vh);
}
function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(frame);
  }
}
const visibility = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const s = scrubbers.find((x) => x.el === e.target);
      if (s) s.visible = e.isIntersecting;
    }
    schedule();
  },
  { rootMargin: '20% 0px' },
);
function addScrubber(s: Scrubber) {
  scrubbers.push(s);
  visibility.observe(s.el);
  // Measure once now: the first IntersectionObserver callback is asynchronous,
  // and the figure must never show a stale state while waiting for it.
  s.update(s.el.getBoundingClientRect(), window.innerHeight);
}
if (animate) {
  addEventListener('scroll', schedule, { passive: true });
}
addEventListener('resize', schedule, { passive: true });

/** Canvas sized to its box at device resolution (capped at 2x). Calls draw on resize. */
function fitCanvas(canvas: HTMLCanvasElement, onResize: () => void) {
  const ro = new ResizeObserver(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      onResize();
    }
  });
  ro.observe(canvas);
}

/* 2. Reveal ---------------------------------------------------------------
   Elements marked data-reveal get .is-in once, the first time they enter the viewport.
   CSS decides what that means (slash slides in, rule draws, grid surfaces); the hidden
   starting state exists only after .reveal-ready is set here, so it is fail-open. */
if (animate) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  root.classList.add('reveal-ready');
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

/* 3. Dither band ---------------------------------------------------------- */
document.querySelectorAll<HTMLElement>('[data-band]').forEach((band) => {
  const canvas = band.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return; // the server-rendered SVG stays
  const colors = { paper: css('--paper'), ink: css('--void'), signal: css('--signal') };
  let last = -1;
  const draw = (p: number) => {
    const q = Math.round(p * 32) / 32; // quantised: the band changes in discrete steps
    if (q === last) return;
    last = q;
    const W = canvas.width, H = canvas.height;
    const cols = bandCols(window.innerWidth);
    const cw = W / cols, ch = H / BAND_ROWS;
    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < BAND_ROWS; y++) {
      const y0 = Math.round(y * ch), y1 = Math.round((y + 1) * ch);
      for (let x = 0; x < cols; x++) {
        const c = bandCell(x, y, q);
        if (c !== INK && c !== SIGNAL) continue;
        const x0 = Math.round(x * cw), x1 = Math.round((x + 1) * cw);
        ctx.fillStyle = c === INK ? colors.ink : colors.signal;
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      }
    }
  };
  let p = BAND_STATIC_P;
  fitCanvas(canvas, () => { last = -1; draw(p); });
  band.classList.add('is-live');
  if (!animate) return;
  addScrubber({
    el: band,
    visible: false,
    update(r, vh) {
      // 0 when the band's top meets the bottom edge, 1 when its bottom meets the top.
      p = clamp01((vh - r.top) / (vh + r.height));
      draw(p);
    },
  });
});

/* 4. Lume schematic ------------------------------------------------------- */
document.querySelectorAll<HTMLElement>('[data-lume]').forEach((fig) => {
  const canvas = fig.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  const stateEl = fig.querySelector<HTMLElement>('[data-lume-state]');
  if (!canvas || !ctx) return;
  const states: string[] = JSON.parse(stateEl?.dataset.states ?? '[]');
  const colors = { bg: css('--void'), ink: css('--void-ink'), muted: css('--void-muted'), signal: css('--void-signal') };
  const models = new Map<string, Model>();
  const modelFor = (cols: number, rows: number) => {
    const key = `${cols}x${rows}`;
    let m = models.get(key);
    if (!m) models.set(key, (m = lumeModel(cols, rows)));
    return m;
  };
  let last = -1;
  let shownState = -1;
  const draw = (p: number) => {
    const q = Math.round(p * 400) / 400;
    if (q === last) return;
    last = q;
    const small = window.matchMedia('(max-width: 640px)').matches;
    const m = small ? modelFor(24, 24) : modelFor(48, 20);
    const W = canvas.width, H = canvas.height;
    const size = Math.min(W / m.cols, H / m.rows);
    const gap = Math.max(1, Math.round(size * 0.16));
    const s = size - gap;
    const ox = (W - size * m.cols) / 2 + gap / 2;
    const oy = (H - size * m.rows) / 2 + gap / 2;
    const at = (i: number) => [ox + (i % m.cols) * size, oy + Math.floor(i / m.cols) * size] as const;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = colors.ink;
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < m.cols * m.rows; i++) {
      const [x, y] = at(i);
      ctx.fillRect(x, y, s, s);
    }
    ctx.globalAlpha = 1;
    const lw = Math.max(1, Math.round(size * 0.07));
    ctx.lineWidth = lw;
    for (const b of m.blocks) {
      const st = addressAt(b, q);
      if (st.gone) continue;
      for (let j = 0; j < b.len; j++) {
        const [x, y] = at(st.addr + j);
        if (!b.live) {
          ctx.strokeStyle = colors.muted;
          ctx.strokeRect(x + lw / 2, y + lw / 2, s - lw, s - lw);
        } else {
          ctx.fillStyle = st.moving ? colors.signal : colors.ink;
          ctx.globalAlpha = st.moving ? 1 : 0.86;
          ctx.fillRect(x, y, s, s);
          ctx.globalAlpha = 1;
        }
      }
    }
    const si = stateIndex(q);
    if (stateEl && si !== shownState && states[si]) {
      shownState = si;
      stateEl.textContent = states[si]!;
    }
  };
  let p = 1; // final state unless scroll says otherwise
  fitCanvas(canvas, () => { last = -1; draw(p); });
  fig.classList.add('is-live');
  if (!animate) return;
  const stage = canvas.parentElement ?? canvas;
  addScrubber({
    el: stage,
    visible: false,
    update(r, vh) {
      // Starts as the stage enters the lower part of the viewport; complete when
      // its centre passes 40% of the viewport height. Reversible by design.
      const start = vh * 0.92;
      const end = vh * 0.4 - r.height / 2;
      p = clamp01((start - r.top) / (start - end));
      draw(p);
    },
  });
});

/* 5. Assembly (Pexiscale) ------------------------------------------------- */
if (animate) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.classList.add('is-in');
      }
    },
    { threshold: 0.35 },
  );
  root.classList.add('assemble-ready');
  document.querySelectorAll('[data-assemble]').forEach((el) => io.observe(el));
}
