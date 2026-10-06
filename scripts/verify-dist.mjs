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
  { path: '/resume/', lang: 'en', noindex: true, pair: '/pt/curriculo/' },
  { path: '/pt/curriculo/', lang: 'pt-BR', noindex: true, pair: '/resume/' },
  { path: '/courses/', lang: 'en', noindex: true, pair: '/pt/cursos/' },
  { path: '/pt/cursos/', lang: 'pt-BR', noindex: true, pair: '/courses/' },
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

const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/, /sk_(live|test)_[0-9a-zA-Z]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ghp_[0-9A-Za-z]{30,}/, /eyJhbGciOi/];

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

  // Resources must be first-party: no third-party requests.
  for (const src of attrs(html, /<(?:script|img|source|video|iframe)[^>]*\ssrc="([^"]+)"/g)) {
    if (!src.startsWith('/')) fail(pg.path, `external resource ${src}`);
  }
  for (const m of html.matchAll(/<link\b([^>]*)>/g)) {
    const rel = /rel="([^"]+)"/.exec(m[1])?.[1] ?? '';
    const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
    if (/stylesheet|preload|icon|modulepreload/.test(rel) && !href.startsWith('/')) fail(pg.path, `external ${rel} ${href}`);
  }

  // Links: internal ones must resolve; external ones must be on the allowlist.
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
    if (!EXTERNAL_ALLOW.has(href)) fail(pg.path, `external link not on allowlist: ${href}`);
  }
}

// Assets referenced from HTML and CSS must exist.
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(DIST);
for (const f of files.filter((f) => /\.(html|css|js)$/.test(f))) {
  const text = readFileSync(f, 'utf8');
  const refs = [...text.matchAll(/(?:src|href)="(\/_astro\/[^"]+)"|url\((\/_astro\/[^)]+)\)/g)].map((m) => m[1] ?? m[2]);
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
