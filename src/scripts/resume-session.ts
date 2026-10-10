// The résumé's terminal session: each command runs when the reader scrolls to it, and stays.
//
// Enrichment only. Resume.astro hides the steps that have not run (.t-pending, set before first
// paint and only when motion is allowed); this file runs them and marks itself live (.t-live). If
// it never starts, the inline fail-open there removes .t-pending and the whole session shows.
//
//   - Nothing runs at the top of the page: the hero says "scroll to execute". The first scroll (or a
//     load already scrolled, a reload, an anchor) starts the session.
//   - A step runs when its command line passes 85% of the viewport height. Earlier steps that did
//     not run yet (a fast scroll, a jump) appear at once; only the reached one is typed
//     (src/lib/resume-session.ts: advance). Nothing runs twice and nothing is ever hidden again.
//   - One IntersectionObserver over the command lines; it disconnects once the session is complete.

import { advance } from '../lib/resume-session';

const root = document.documentElement;
const steps = [...document.querySelectorAll<HTMLElement>('[data-step]')];

function init() {
  if (!root.classList.contains('t-pending') || !steps.length) return;
  const ran = steps.map(() => false);
  let started = window.scrollY > 0;

  function sync() {
    if (!started) return;
    const line = window.innerHeight * 0.85;
    let reached = -1;
    steps.forEach((s, i) => {
      const cmd = s.querySelector('.t-cmd') ?? s;
      if (cmd.getBoundingClientRect().top < line) reached = i;
    });
    const { instant, animate } = advance(ran, reached);
    for (const i of instant) {
      ran[i] = true;
      steps[i]!.classList.add('is-now');
    }
    if (animate !== null) {
      ran[animate] = true;
      steps[animate]!.classList.add('is-run');
    }
    if (ran.every(Boolean)) {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    }
  }

  const io = new IntersectionObserver(sync, { rootMargin: '0px 0px -15% 0px' });
  steps.forEach((s) => io.observe(s.querySelector('.t-cmd') ?? s));
  const onScroll = () => {
    started = true;
    sync();
  };
  // Passive and cheap: it only matters until the first scroll and between observer callbacks.
  window.addEventListener('scroll', onScroll, { passive: true });
  root.classList.add('t-live');
  sync();
}

try {
  init();
} catch {
  root.classList.remove('t-pending'); // fail open: the session is complete without this file
}
