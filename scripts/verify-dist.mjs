// Post-build invariants for dist/. Runs after `astro build`; any violation
// fails the build (and therefore the deploy). No dependencies.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://guilhermehrcst.github.io';

/** Every page, its language, and whether it is a placeholder (noindex). */
const PAGES = [
  { path: '/', lang: 'en', noindex: false, pair: '/pt/' },
  { path: '/pt/', lang: 'pt-BR', noindex: false, pair: '/' },
  { path: '/resume/', lang: 'en', noindex: false, pair: '/pt/curriculo/' },
  { path: '/pt/curriculo/', lang: 'pt-BR', noindex: false, pair: '/resume/' },
  { path: '/courses/', lang: 'en', noindex: false, pair: '/pt/cursos/' },
  { path: '/pt/cursos/', lang: 'pt-BR', noindex: false, pair: '/courses/' },
];

/** The only external destinations this site may link to. Personal data is published on purpose and only here. */
const EXTERNAL_ALLOW = new Set([
  'mailto:guilhermehrcst@gmail.com',
  'https://www.linkedin.com/in/guilherme-henrique-8927093b6',
  'https://www.instagram.com/guilhermehrcst/',
  'https://github.com/guilhermehrcst',
  'https://github.com/guilhermehrcst/lume',
  'https://pexiscale.com',
]);

/** Course pages may also link out, but only to the institutions' own sites (exact hosts, HTTPS), and
 *  every such link must open in a new tab without handing the page a reference back (noopener noreferrer). */
const COURSE_PAGES = new Set(['/courses/', '/pt/cursos/']);
const COURSE_HOSTS = new Set([
  'cs50.harvard.edu',
  'ocw.mit.edu',
  'www.ev.org.br',
  'educacao-executiva.fgv.br',
  'www.netacad.com',
  'learn.microsoft.com',
  'skillsbuild.org',
]);

/** The Home: one narrative shell, with exactly one terminal, hidden from assistive tech, and ten
 *  chapters, each exactly once and in this order (src/lib/narrative-state.ts: NARRATIVE_ORDER). */
const HOME_PAGES = new Set(['/', '/pt/']);
const NARRATIVE_ORDER = ['whoami', 'pexiscale', 'lume', 'pexis-machine', 'capabilities', 'ai-workflow', 'education', 'influences', 'principles', 'contact'];
const RESUME_PAGES = new Set(['/resume/', '/pt/curriculo/']);
/** The résumé's terminal session, in order (src/lib/resume-session.ts: RESUME_STEPS). */
const RESUME_STEPS = ['whoami', 'projects', 'capabilities', 'ai-workflow', 'education', 'influences', 'contact', 'exit'];
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const textOf = (html) => decode(html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');

const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/, /sk_(live|test)_[0-9a-zA-Z]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ghp_[0-9A-Za-z]{30,}/, /eyJhbGciOi/];

/** The terminal's markup: from its root to the end of its chapter data (it holds no nested <template>). */
function terminalHtml(html) {
  const start = html.search(/<[a-z]+\b[^>]*\sdata-narrative-terminal[\s>=]/);
  const end = html.indexOf('</template>', start);
  return start < 0 || end < 0 ? '' : html.slice(start, end + '</template>'.length);
}

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const fileFor = (p) => join(DIST, p.endsWith('/') ? p + 'index.html' : p);
const attrs = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

for (const pg of PAGES) {
  const file = fileFor(pg.path);
  if (!existsSync(file)) { fail(pg.path, 'missing'); continue; }
  const html = readFileSync(file, 'utf8');

  if (!html.includes(`<html lang="${pg.lang}"`)) fail(pg.path, `expected <html lang="${pg.lang}">`);
  if (!/<title>[^<]{5,}<\/title>/.test(html)) fail(pg.path, 'missing <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) fail(pg.path, 'missing description');
  if (!html.includes(`<link rel="canonical" href="${SITE}${pg.path}"`)) fail(pg.path, 'canonical mismatch');

  const en = pg.lang === 'en' ? pg.path : pg.pair;
  const pt = pg.lang === 'en' ? pg.pair : pg.path;
  for (const [hl, href] of [['en', en], ['pt-BR', pt], ['x-default', en]]) {
    if (!html.includes(`<link rel="alternate" hreflang="${hl}" href="${SITE}${href}"`)) fail(pg.path, `hreflang ${hl} → ${href} missing`);
  }

  const robots = /<meta name="robots" content="noindex"/.test(html);
  if (robots !== pg.noindex) fail(pg.path, pg.noindex ? 'placeholder must be noindex' : 'must be indexable');

  if (!/<main id="main"/.test(html) || !/href="#main"/.test(html)) fail(pg.path, 'skip link or main landmark missing');
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(pg.path, 'expected exactly one <h1>');

  // The narrative terminal belongs to the Home only, and repeats what the page says: aria-hidden.
  const shells = html.match(/<[a-z]+\b[^>]*\sdata-home-narrative[\s>=][^>]*>/g) ?? [];
  const terminals = html.match(/<[a-z]+\b[^>]*\sdata-narrative-terminal[\s>=][^>]*>/g) ?? [];
  if (HOME_PAGES.has(pg.path)) {
    if (shells.length !== 1) fail(pg.path, `expected one data-home-narrative, found ${shells.length}`);
    if (terminals.length !== 1) fail(pg.path, `expected one data-narrative-terminal, found ${terminals.length}`);
    for (const t of terminals) if (!/\saria-hidden="true"/.test(t)) fail(pg.path, 'narrative terminal must be aria-hidden="true"');
    if (/<(?:input|textarea|select|form|button)\b|contenteditable/.test(terminalHtml(html))) fail(pg.path, 'narrative terminal must not accept input');

    // The ten chapters, once each, in reading order.
    const ids = attrs(html, /\sdata-narrative-section="([^"]+)"/g);
    if (ids.join() !== NARRATIVE_ORDER.join()) fail(pg.path, `narrative sections ${ids.join()} != ${NARRATIVE_ORDER.join()}`);
    if (!/<h2 id="pm-title"[^>]*>Pexis Machine</.test(html)) fail(pg.path, 'Pexis Machine heading missing');

    // A narrator, not a second source: every line the terminal can print is already on the page,
    // outside the terminal (a joined flow, A → B → C, is checked step by step).
    const lines = attrs(terminalHtml(html), /<p data-narrative-line[^>]*>([^<]*)<\/p>/g).map(decode);
    if (lines.length === 0) fail(pg.path, 'narrative terminal has no chapter lines');
    const page = textOf(html.replace(terminalHtml(html), ' '));
    for (const line of lines) {
      for (const part of line.split(' → ')) if (!page.includes(part)) fail(pg.path, `terminal line not on the page: ${part}`);
    }
  } else if (shells.length || terminals.length) {
    fail(pg.path, 'narrative terminal outside the Home');
  }
  if (/class="[^"]*\binfl-n\b/.test(html)) fail(pg.path, 'influence cards must not be numbered (.infl-n)');
  if (RESUME_PAGES.has(pg.path) && !/\sdata-print[\s>=]/.test(html)) fail(pg.path, 'résumé print action (data-print) missing');
  if (RESUME_PAGES.has(pg.path)) {
    // One terminal session: the steps once each and in order, the hero (the h1) and the closing
    // footer inside it, no images, and nothing that accepts input.
    const steps = attrs(html, /\sdata-step="([^"]+)"/g);
    if (steps.join() !== RESUME_STEPS.join()) fail(pg.path, `résumé steps ${steps.join()} != ${RESUME_STEPS.join()}`);
    const term = /<main id="main" class="term"[\s\S]*<\/main>/.exec(html)?.[0] ?? '';
    if (!term) fail(pg.path, 'résumé terminal (main.term) missing');
    if (!/<h1[\s>]/.test(term)) fail(pg.path, 'résumé title must be inside the terminal');
    if (!/<footer\b[^>]*data-step="exit"/.test(term)) fail(pg.path, 'résumé must close with the exit footer inside the terminal');
    if (/<img\b/.test(html)) fail(pg.path, 'résumé terminal must have no images');
    if (/<(?:input|textarea|select|form)\b|contenteditable/.test(html)) fail(pg.path, 'résumé terminal must not accept input');
    if (/Paulex/.test(term)) fail(pg.path, 'projects --selected is Pexiscale, Lume and Pexis Machine only');
  }

  // Every image says what it is (alt, empty only when decorative; Astro prints an empty alt as a bare `alt`) and reserves its box (width and
  // height), so nothing shifts when it loads.
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt(?=[\s=>])/.test(tag)) fail(pg.path, `<img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(pg.path, `<img> without width and height: ${tag.slice(0, 80)}`);
  }

  // Resources must be first-party: no third-party requests.
  for (const src of attrs(html, /<(?:script|img|source|video|iframe)[^>]*\ssrc="([^"]+)"/g)) {
    if (!src.startsWith('/')) fail(pg.path, `external resource ${src}`);
  }
  for (const m of html.matchAll(/<link\b([^>]*)>/g)) {
    const rel = /rel="([^"]+)"/.exec(m[1])?.[1] ?? '';
    const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
    if (/stylesheet|preload|icon|modulepreload/.test(rel) && !href.startsWith('/')) fail(pg.path, `external ${rel} ${href}`);
  }

  // Course links: official hosts only, HTTPS, new tab with noopener noreferrer.
  const courseLinks = new Set();
  if (COURSE_PAGES.has(pg.path)) {
    for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
      if (!/target="_blank"/.test(m[1])) continue;
      const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
      let url;
      try { url = new URL(href.replace(/&amp;/g, '&')); } catch { fail(pg.path, `bad course url ${href}`); continue; }
      if (url.protocol !== 'https:') fail(pg.path, `course link not https: ${href}`);
      if (!COURSE_HOSTS.has(url.hostname)) fail(pg.path, `course link to a non-official host: ${href}`);
      const rel = /rel="([^"]+)"/.exec(m[1])?.[1] ?? '';
      if (!/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel)) fail(pg.path, `course link without rel="noopener noreferrer": ${href}`);
      courseLinks.add(href);
    }
    if (courseLinks.size === 0) fail(pg.path, 'course page has no course links');
  }

  // Links: internal ones must resolve; external ones must be on the allowlist (or be a checked course link).
  for (const raw of attrs(html, /<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = raw.replace(/&amp;/g, '&');
    if (href.startsWith('#')) {
      if (!html.includes(`id="${href.slice(1)}"`)) fail(pg.path, `dangling anchor ${href}`);
      continue;
    }
    if (href.startsWith('/')) {
      const target = href.split('#')[0];
      if (!existsSync(fileFor(target))) fail(pg.path, `broken internal link ${href}`);
      continue;
    }
    if (!EXTERNAL_ALLOW.has(href) && !courseLinks.has(raw)) fail(pg.path, `external link not on allowlist: ${href}`);
  }
}

// Assets referenced from HTML and CSS must exist.
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DIST);
for (const f of files.filter((f) => /\.(html|css|js)$/.test(f))) {
  const text = readFileSync(f, 'utf8');
  const refs = [...text.matchAll(/(?:src|href)="(\/_astro\/[^"]+)"|url\((\/_astro\/[^)]+)\)/g)].map((m) => m[1] ?? m[2]);
  // Every candidate of a srcset (the responsive images) must exist too.
  for (const m of text.matchAll(/srcset="([^"]+)"/g)) {
    for (const cand of m[1].split(',')) {
      const url = cand.trim().split(/\s+/)[0];
      if (url.startsWith('/_astro/')) refs.push(url);
      else if (url) fail(f, `srcset candidate outside /_astro/: ${url}`);
    }
  }
  for (const ref of refs) {
    if (!existsSync(join(DIST, ref))) fail(f, `missing asset ${ref}`);
  }
  for (const re of SECRET_PATTERNS) if (re.test(text)) fail(f, `matches secret pattern ${re}`);
}

if (errors.length) {
  console.error(`verify-dist: ${errors.length} problem(s)\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`verify-dist: ${PAGES.length} pages, ${files.length} files — all invariants hold.`);
