// Post-build invariants for dist/. Runs after `astro build`; any violation fails the build (and
// therefore the deploy). No dependencies.
//
// The lists below are written out by hand on purpose. They repeat what src/lib/routes.ts derives, so an
// accidental change there is caught here by an independent path (spec R10), not confirmed by it.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://guilhermehrcst.github.io';

/** The indexable pages of V0.1 (spec §5.1). */
const CANONICAL = [
  '/', '/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/', '/materias/',
  '/materias/matematica/', '/materias/portugues/', '/materias/redacao/',
  '/materias/fisica/', '/materias/quimica/', '/materias/biologia/',
  '/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/',
  '/materias/ingles/', '/materias/espanhol/',
  '/buscar/', '/sobre/',
];

/** Routes of the former personal site that keep a destination (spec §8.4). */
const REDIRECTS = {
  '/pt/': '/',
  '/courses/': '/materias/',
  '/pt/cursos/': '/materias/',
  '/courses/enem/': '/enem/',
  '/pt/cursos/enem/': '/enem/',
  '/courses/uerj/': '/uerj/',
  '/pt/cursos/uerj/': '/uerj/',
};

/** Routes of the former personal site that are gone: they fall through to the 404 (spec §8.4, Q2). */
const GONE = ['/resume/', '/pt/curriculo/'];

/** The header navigation, in order (spec §6.5). */
const HEADER_NAV = [
  ['/materias/', 'Explorar'],
  ['/enem/', 'ENEM'],
  ['/uerj/', 'UERJ'],
  ['/tecnologia/', 'Tecnologia'],
  ['/buscar/', 'Buscar'],
];

/** Hosts a page may link out to: the providers of published resources and the official exam pages.
 *  Mirrors COURSE_HOSTS in src/lib/learning-resources.ts and OFFICIAL_HOSTS in src/lib/official-sources.ts
 *  (a unit test keeps the copies equal). */
const COURSE_HOSTS = [
  'cs50.harvard.edu',
  'ocw.mit.edu',
  'www.ev.org.br',
  'educacao-executiva.fgv.br',
  'www.netacad.com',
  'kultivi.com',
  'www.gov.br',
  'www.revista.vestibular.uerj.br',
];
const OFFICIAL_HOSTS = ['www.gov.br', 'sistema.vestibular.uerj.br', 'www.revista.vestibular.uerj.br'];
const EXTERNAL_HOSTS = new Set([...COURSE_HOSTS, ...OFFICIAL_HOSTS]);

/** Pages that may run JavaScript. Every other page is complete, static HTML (spec §7). */
const SCRIPT_PAGES = new Set([]);

/** The former personal site must leave no trace (spec §3, §9.2). The site's own origin is allowed only
 *  inside canonical and og:url, which are stripped before this check runs. */
const DENY = [/Guilherme/, /guilhermehrcst/, /linkedin\.com\/in\//, /instagram\.com\//, /Pexiscale/, /pexiscale\.com/, /\bLume\b/, /Pexis Machine/];

const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/, /sk_(live|test)_[0-9a-zA-Z]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ghp_[0-9A-Za-z]{30,}/, /eyJhbGciOi/];

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const fileFor = (p) => join(DIST, p.endsWith('/') ? p + 'index.html' : p);
const attrs = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const meta = (html, attr, name) => new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`).exec(html)?.[1];

/* Generic checks: they hold for any page this site builds. -------------------------------------- */

function checkLandmarks(path, html) {
  if (!/<main id="main"/.test(html) || !/href="#main"/.test(html)) fail(path, 'skip link or main landmark missing');
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) fail(path, 'expected exactly one <h1>');
}

/** Every image says what it is (alt, empty only when decorative; Astro prints an empty alt as a bare
 *  `alt`) and reserves its box (width and height), so nothing shifts when it loads. */
function checkImages(path, html) {
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) {
    if (!/\salt(?=[\s=>])/.test(tag)) fail(path, `<img> without alt: ${tag.slice(0, 80)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) fail(path, `<img> without width and height: ${tag.slice(0, 80)}`);
  }
}

/** Resources must be first-party: no third-party requests. */
function checkThirdParty(path, html) {
  for (const src of attrs(html, /<(?:script|img|source|video|iframe)[^>]*\ssrc="([^"]+)"/g)) {
    if (!src.startsWith('/')) fail(path, `external resource ${src}`);
  }
  for (const m of html.matchAll(/<link\b([^>]*)>/g)) {
    const rel = /rel="([^"]+)"/.exec(m[1])?.[1] ?? '';
    const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
    if (/stylesheet|preload|icon|modulepreload/.test(rel) && !href.startsWith('/')) fail(path, `external ${rel} ${href}`);
  }
}

/** Internal links resolve and anchors exist. Every external link goes to an allowed host over HTTPS, in
 *  a new tab, without handing the page a reference back (noopener noreferrer). */
function checkLinks(path, html) {
  for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
    const raw = /\shref="([^"]+)"/.exec(m[1])?.[1];
    if (raw === undefined) continue;
    const href = raw.replace(/&amp;/g, '&');
    if (href.startsWith('#')) {
      if (!html.includes(`id="${href.slice(1)}"`)) fail(path, `dangling anchor ${href}`);
      continue;
    }
    if (href.startsWith('/')) {
      const [target, hash] = href.split('#');
      if (!existsSync(fileFor(target))) fail(path, `broken internal link ${href}`);
      else if (hash && !readFileSync(fileFor(target), 'utf8').includes(`id="${hash}"`)) fail(path, `dangling anchor ${href}`);
      continue;
    }
    let url;
    try { url = new URL(href); } catch { fail(path, `bad link ${href}`); continue; }
    if (url.protocol !== 'https:') fail(path, `external link not https: ${href}`);
    if (!EXTERNAL_HOSTS.has(url.hostname)) fail(path, `external link to a host that is not allowed: ${href}`);
    if (!/target="_blank"/.test(m[1])) fail(path, `external link must open in a new tab: ${href}`);
    const rel = /rel="([^"]+)"/.exec(m[1])?.[1] ?? '';
    if (!/\bnoopener\b/.test(rel) || !/\bnoreferrer\b/.test(rel)) fail(path, `external link without rel="noopener noreferrer": ${href}`);
  }
}

function checkScripts(path, html) {
  if (!SCRIPT_PAGES.has(path) && /<script\b/.test(html)) fail(path, 'content pages carry no JavaScript');
}

/* Canonical pages. --------------------------------------------------------------------------------- */

function checkHead(path, html) {
  if (!html.includes('<html lang="pt-BR"')) fail(path, 'expected <html lang="pt-BR">');
  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '';
  if (title.length < 5) fail(path, 'missing <title>');
  if (path === '/' ? !title.startsWith('Pexis Academy') : !title.endsWith('| Pexis Academy')) fail(path, `title pattern: ${title}`);
  const description = meta(html, 'name', 'description') ?? '';
  if (description.length < 70 || description.length > 160) fail(path, `description must be 70-160 characters (${description.length})`);
  if (!html.includes(`<link rel="canonical" href="${SITE}${path}"`)) fail(path, 'canonical mismatch');
  if (meta(html, 'property', 'og:site_name') !== 'Pexis Academy') fail(path, 'og:site_name must be Pexis Academy');
  if (meta(html, 'property', 'og:locale') !== 'pt_BR') fail(path, 'og:locale must be pt_BR');
  if (/hreflang=/.test(html)) fail(path, 'V0.1 is Portuguese only: no hreflang');
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) fail(path, 'must be indexable');
}

function checkShell(path, html) {
  if (!/<header\b/.test(html) || !/<footer\b/.test(html)) fail(path, 'header or footer landmark missing');
  const nav = /<nav\b[^>]*aria-label="Principal"[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1];
  if (!nav) { fail(path, 'main navigation (aria-label="Principal") missing'); return; }
  const items = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, '').trim()]);
  if (JSON.stringify(items) !== JSON.stringify(HEADER_NAV)) fail(path, `header navigation ${JSON.stringify(items)}`);
  for (const m of nav.matchAll(/<a\b([^>]*)>/g)) {
    const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
    const current = /aria-current="page"/.test(m[1]);
    const expected = href === path || (href === '/materias/' && path.startsWith('/materias/'));
    if (current !== expected) fail(path, `aria-current on ${href} should be ${expected}`);
  }
}

/* Product rules: what each page promises. --------------------------------------------------------- */

/** Every rendered resource: an item of a resource list, named in its own language (translate="no"),
 *  with exactly one link out, which says it opens in a new tab. Returns the resource items. */
function checkResources(path, html) {
  const items = [...html.matchAll(/<li\b([^>]*\sdata-resource-id="[^"]+"[^>]*)>([\s\S]*?)<\/li>/g)];
  const inLists = [...html.matchAll(/<ul\b[^>]*\sdata-resource-list[\s>=][\s\S]*?<\/ul>/g)]
    .reduce((n, m) => n + (m[0].match(/\sdata-resource-id="/g) ?? []).length, 0);
  if (inLists !== items.length) fail(path, `every resource must be an item of a resource list (${inLists}/${items.length})`);
  for (const [, attributes, body] of items) {
    const id = /data-resource-id="([^"]+)"/.exec(attributes)?.[1] ?? '?';
    const links = [...body.matchAll(/<a\b([^>]*)>/g)];
    if (links.length !== 1 || !/target="_blank"/.test(links[0][1])) fail(path, `resource ${id} needs exactly one outbound link`);
    if (!/translate="no"/.test(body)) fail(path, `resource ${id}: the official title must carry translate="no"`);
    if (!/class="sr-only"[^>]*>[^<]*nova aba/.test(body)) fail(path, `resource ${id}: the link must say it opens in a new tab`);
  }
  return items;
}

/** The hrefs of the links inside the first element matching `open`, up to its closing `tag`. */
function sectionOf(html, open, tag = 'section') {
  const start = html.search(open);
  if (start < 0) return null;
  const end = html.indexOf(`</${tag}>`, start);
  return html.slice(start, end < 0 ? undefined : end);
}
const hrefsIn = (fragment) => attrs(fragment, /<a\b[^>]*\shref="([^"]+)"/g);

/** The Home orients; it does not pour out content (spec §5.2). */
function checkHome(path, html, resources) {
  const objective = sectionOf(html, /<section\b[^>]*\sid="objetivo"/);
  if (!objective) fail(path, 'section#objetivo missing');
  else {
    if (!/<h2[^>]*>Qual é o seu objetivo\?<\/h2>/.test(objective)) fail(path, '#objetivo must ask "Qual é o seu objetivo?"');
    const hrefs = hrefsIn(objective);
    const expected = ['/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/'];
    if (JSON.stringify(hrefs) !== JSON.stringify(expected)) fail(path, `#objetivo links ${hrefs.join(',')}`);
  }
  const areas = sectionOf(html, /<section\b[^>]*\sid="areas"/);
  if (!areas) fail(path, 'section#areas missing');
  else checkAreaGroups(path, areas);
  if (resources.length) fail(path, `the Home lists no resources (found ${resources.length})`);

  // The order is fixed and closed: no section joins without a written reason (spec §5.2, R9).
  const main = /<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '';
  const sections = attrs(main, /<section\b[^>]*\sid="([^"]+)"/g);
  if (JSON.stringify(sections) !== JSON.stringify(['objetivo', 'areas', 'curadoria'])) fail(path, `Home sections ${sections.join(',')}`);
  if (main.search(/<h1[\s>]/) > main.search(/<section\b/)) fail(path, 'the hero (with the h1) comes first');
  if ((main.match(/<section\b/g) ?? []).length !== sections.length) fail(path, 'every Home section has an id');
  const curation = sectionOf(html, /<section\b[^>]*\sid="curadoria"/);
  if (curation && !hrefsIn(curation).includes('/sobre/')) fail(path, '#curadoria must lead to /sobre/');
}

/** The six areas, in order, each linking exactly its subjects (spec §5.2, item 3; §6.1). */
const AREA_GROUPS = [
  ['matematica', ['/materias/matematica/']],
  ['linguagens', ['/materias/portugues/', '/materias/redacao/']],
  ['natureza', ['/materias/fisica/', '/materias/quimica/', '/materias/biologia/']],
  ['humanas', ['/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/']],
  ['idiomas', ['/materias/ingles/', '/materias/espanhol/']],
  ['tecnologia', ['/tecnologia/']],
];
function checkAreaGroups(path, fragment) {
  const groups = [...fragment.matchAll(/<(\w+)\b[^>]*\sdata-area="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => [m[2], hrefsIn(m[3])]);
  if (JSON.stringify(groups) !== JSON.stringify(AREA_GROUPS)) fail(path, `area groups ${JSON.stringify(groups)}`);
}

/** /sobre/: the curation policy, how verification works (with the same date as the footer), and
 *  independence from the institutions cited (spec §6.3). */
function checkAbout(path, html) {
  for (const id of ['curadoria', 'verificacao', 'afiliacao']) {
    if (!new RegExp(`<section\\b[^>]*\\sid="${id}"`).test(html)) fail(path, `section#${id} missing`);
  }
  const verification = sectionOf(html, /<section\b[^>]*\sid="verificacao"/) ?? '';
  const footerDate = /<time datetime="([^"]+)" data-verified-on/.exec(html)?.[1];
  const pageDate = /<time datetime="([^"]+)"/.exec(verification)?.[1];
  if (!footerDate || pageDate !== footerDate) fail(path, `verification date ${pageDate} must match the footer's ${footerDate}`);
}

const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/tecnologia/'];
const resourceAttr = (item, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(item[1])?.[1] ?? '';

/** A subject page: content, then practice, then the objectives it serves (spec §6.3). An empty
 *  subject is never published. */
function checkSubject(path, html, resources) {
  const subject = path.split('/')[2];
  if (resources.length === 0) fail(path, 'a subject page shows at least one resource');
  for (const item of resources) {
    if (resourceAttr(item, 'data-subject') !== subject) fail(path, `resource ${resourceAttr(item, 'data-resource-id')} is not ${subject}`);
  }
  const content = sectionOf(html, /<section\b[^>]*\sid="conteudo"/);
  const practice = sectionOf(html, /<section\b[^>]*\sid="pratique"/);
  const objectives = sectionOf(html, /<section\b[^>]*\sid="objetivos"/);
  if (content && /data-format="practice"/.test(content)) fail(path, '#conteudo holds no practice');
  if (practice && /data-format="(?!practice")/.test(practice)) fail(path, '#pratique holds practice only');
  if (!content && !practice) fail(path, 'neither #conteudo nor #pratique');
  // A learning map, when present, is an ordered list of plain items that names its source; V0.1 topics have no pages.
  const map = sectionOf(html, /<section\b[^>]*\sdata-learning-map[\s>=]/);
  if (map) {
    if (!/<ol\b/.test(map) || !/data-source-note/.test(map)) fail(path, 'a learning map is an <ol> that cites its source');
    const items = /<ol\b[\s\S]*?<\/ol>/.exec(map)?.[0] ?? '';
    if (/<a\b/.test(items)) fail(path, 'learning-map topics have no pages in V0.1');
  }
  if (!objectives) fail(path, 'section#objetivos missing');
  else for (const href of hrefsIn(objectives)) if (!OBJECTIVE_PATHS.includes(href)) fail(path, `#objetivos links ${href}`);
}

const sectionIds = (html) => attrs(/<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '', /<section\b[^>]*\sid="([^"]+)"/g);

/** An official source cited on the page: a note with a link to an official host and the verification date. */
function checkSourceNote(path, fragment, where) {
  const note = /<[a-z]+\b[^>]*\sdata-source-note[\s\S]*?<\/(p|div)>/.exec(fragment)?.[0];
  if (!note) { fail(path, `${where}: official source note missing`); return; }
  const hosts = hrefsIn(note).map((h) => { try { return new URL(h).hostname; } catch { return ''; } });
  if (!hosts.some((h) => OFFICIAL_HOSTS.includes(h))) fail(path, `${where}: source note must link an official page`);
  if (!/<time datetime="\d{4}-\d{2}-\d{2}"/.test(note)) fail(path, `${where}: source note must date its verification`);
}

/** The ENEM as INEP organises it: four areas and the essay, each linking its subjects. */
const ENEM_GROUPS = [
  ['linguagens', ['/materias/portugues/', '/materias/ingles/', '/materias/espanhol/']],
  ['humanas', ['/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/']],
  ['natureza', ['/materias/fisica/', '/materias/quimica/', '/materias/biologia/']],
  ['matematica', ['/materias/matematica/']],
  ['redacao', ['/materias/redacao/']],
];

/** /enem/: a preparation hub, not a list of courses (spec §6.3). */
function checkEnem(path, html) {
  const ids = sectionIds(html);
  if (JSON.stringify(ids) !== JSON.stringify(['entenda', 'areas', 'pratique', 'aprofunde'])) fail(path, `ENEM sections ${ids.join(',')}`);
  checkSourceNote(path, sectionOf(html, /<section\b[^>]*\sid="entenda"/) ?? '', '#entenda');
  checkSourceNote(path, sectionOf(html, /<section\b[^>]*\sid="pratique"/) ?? '', '#pratique');
  const areas = sectionOf(html, /<section\b[^>]*\sid="areas"/) ?? '';
  const groups = [...areas.matchAll(/<(\w+)\b[^>]*\sdata-exam-area="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => [m[2], hrefsIn(m[3])]);
  if (JSON.stringify(groups) !== JSON.stringify(ENEM_GROUPS)) fail(path, `ENEM area groups ${JSON.stringify(groups)}`);
  const deepen = sectionOf(html, /<section\b[^>]*\sid="aprofunde"/) ?? '';
  if (!/\sdata-resource-id="/.test(deepen)) fail(path, '#aprofunde shows at least one resource');
  if (/data-format="practice"/.test(deepen)) fail(path, '#aprofunde holds no practice');
}

function checkProduct(path, html) {
  const resources = checkResources(path, html);
  if (path === '/') checkHome(path, html, resources);
  if (path === '/sobre/') checkAbout(path, html);
  if (path === '/enem/') checkEnem(path, html);
  if (/^\/materias\/[a-z-]+\/$/.test(path)) checkSubject(path, html, resources);
  if (path === '/materias/') checkAreaGroups(path, /<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '');
}

for (const path of CANONICAL) {
  const file = fileFor(path);
  if (!existsSync(file)) { fail(path, 'missing'); continue; }
  const html = readFileSync(file, 'utf8');
  checkHead(path, html);
  checkShell(path, html);
  checkLandmarks(path, html);
  checkProduct(path, html);
  checkImages(path, html);
  checkThirdParty(path, html);
  checkLinks(path, html);
  checkScripts(path, html);
}

/* Redirects, gone routes and the 404. ------------------------------------------------------------- */

for (const [from, to] of Object.entries(REDIRECTS)) {
  const file = fileFor(from);
  if (!existsSync(file)) { fail(from, 'redirect page missing'); continue; }
  const html = readFileSync(file, 'utf8');
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail(from, 'redirect must be noindex');
  if (!new RegExp(`<meta http-equiv="refresh" content="0;\\s*url=${to.replace(/\//g, '\\/')}"`).test(html)) fail(from, `redirect must refresh to ${to}`);
  if (!CANONICAL.includes(to) || !existsSync(fileFor(to))) fail(from, `redirect target ${to} is not a canonical page`);
}
for (const path of GONE) {
  if (existsSync(join(DIST, path))) fail(path, 'must be gone (404)');
}
{
  const file = join(DIST, '404.html');
  if (!existsSync(file)) fail('/404.html', 'missing');
  else {
    const html = readFileSync(file, 'utf8');
    if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail('/404.html', 'must be noindex');
    if (!html.includes('<html lang="pt-BR"')) fail('/404.html', 'expected <html lang="pt-BR">');
    checkLandmarks('/404.html', html);
    checkLinks('/404.html', html);
    checkScripts('/404.html', html);
    for (const href of ['/', '/materias/', '/buscar/']) {
      if (!new RegExp(`<main[\\s\\S]*href="${href}"[\\s\\S]*</main>`).test(html)) fail('/404.html', `must offer a way to ${href}`);
    }
  }
}

/* The whole of dist/. ----------------------------------------------------------------------------- */

const files = walk(DIST);
const known = new Set([...CANONICAL, ...Object.keys(REDIRECTS)].map((p) => fileFor(p)).concat(join(DIST, '404.html')));
for (const f of files.filter((f) => f.endsWith('.html'))) {
  if (!known.has(f)) fail('/' + relative(DIST, f).split(sep).join('/'), 'page not in the canonical inventory');
}

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

  const visible = text
    .replace(/<link rel="canonical" href="[^"]*">/g, '')
    .replace(/<meta property="og:url" content="[^"]*">/g, '');
  for (const re of DENY) if (re.test(visible)) fail('/' + relative(DIST, f).split(sep).join('/'), `trace of the former personal site: ${re}`);
}

if (errors.length) {
  console.error(`verify-dist: ${errors.length} problem(s)\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`verify-dist: ${CANONICAL.length} pages, ${Object.keys(REDIRECTS).length} redirects, 404, ${files.length} files — all invariants hold.`);
