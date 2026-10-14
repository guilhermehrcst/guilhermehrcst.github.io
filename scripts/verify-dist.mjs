// Post-build invariants for dist/. Runs after `astro build`; any violation fails the build (and
// therefore the deploy). No dependencies.
//
// The lists below are written out by hand on purpose. They repeat what src/lib/routes.ts derives, so an
// accidental change there is caught here by an independent path (spec R10), not confirmed by it.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://guilhermehrcst.github.io';

/** Course pages (V0.6): /cursos/<id>/ for each course with a presentation. A hand-written mirror of
 *  COURSE_PRESENTATIONS in src/lib/course-presentations.ts; empty until a presentation is approved. */
const COURSE_PAGES = [];

/** The indexable pages (V0.3: each ready path, Vestibular's exams after it). */
const CANONICAL = [
  '/', '/ensino-medio/', '/vestibulares/', '/enem/', '/uerj/', '/pre-militar/', '/ensino-superior/', '/tecnologia/', '/materias/',
  '/materias/matematica/', '/materias/portugues/', '/materias/redacao/',
  '/materias/fisica/', '/materias/quimica/', '/materias/biologia/',
  '/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/',
  '/materias/ingles/', '/materias/espanhol/',
  '/cursos/', ...COURSE_PAGES, '/materiais/',
  '/buscar/', '/sobre/',
];

/** The six paths, in the approved order (V0.3), and the paths still in preparation: built and linked, but
 *  noindex, out of the sitemap, and listing no resource. */
const PATHS = ['/ensino-fundamental/', '/ensino-medio/', '/vestibulares/', '/pre-militar/', '/ensino-superior/', '/tecnologia/'];
const PREPARING = ['/ensino-fundamental/'];

/** The fields of Ensino Superior, in page order (V0.4 QA P1-RC2): Matemática and Computação since V0.3, then
 *  the fields planned for the Gate B university courses. A field is shown only with a published course. */
const SUPERIOR_FIELDS = ['matematica', 'computacao', 'fisica', 'biologia', 'psicologia', 'economia', 'meio-ambiente'];

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

/** The header navigation (V0.5): Cursos and Materiais, the "Explorar" menu (the six paths and nothing
 *  else), then search, a magnifying glass named "Buscar" for assistive tech. In this order. */
const EXPLORE_MENU = [
  ['/ensino-fundamental/', 'Ensino Fundamental'],
  ['/ensino-medio/', 'Ensino Médio'],
  ['/vestibulares/', 'Vestibular'],
  ['/pre-militar/', 'Pré-Militar'],
  ['/ensino-superior/', 'Ensino Superior'],
  ['/tecnologia/', 'Tecnologia'],
];
const HEADER_NAV = [
  ['/cursos/', 'Cursos'],
  ['/materiais/', 'Materiais'],
  ['/buscar/', 'Buscar'],
];
/** The two libraries (V0.5): which formats each lists. A hand-written mirror of src/lib/libraries.ts. */
const LIBRARIES = {
  '/cursos/': ['course', 'track', 'playlist', 'lessons', 'lesson'],
  '/materiais/': ['practice', 'simulator', 'past-exam', 'reference'],
};

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
  // L001: hosts reviewed in the lot manifest, each with its institution.
  'www.fuvest.br',
  'oyc.yale.edu',
  'www.theodinproject.com',
  'learn.microsoft.com',
  'vestibular.ita.br',
];
const OFFICIAL_HOSTS = ['www.gov.br', 'sistema.vestibular.uerj.br', 'www.revista.vestibular.uerj.br'];
const EXTERNAL_HOSTS = new Set([...COURSE_HOSTS, ...OFFICIAL_HOSTS]);

/** Pages that may run JavaScript. Every other page is complete, static HTML (spec §7). */
const SCRIPT_PAGES = new Set(['/buscar/']);

/** The former personal site must leave no trace (spec §3, §9.2). The site's own origin is allowed only
 *  inside canonical and og:url, which are stripped before this check runs. */
const DENY = [/Guilherme/, /guilhermehrcst/, /linkedin\.com\/in\//, /instagram\.com\//, /Pexiscale/, /pexiscale\.com/, /\bLume\b/, /Pexis Machine/];

const SECRET_PATTERNS = [/AKIA[0-9A-Z]{16}/, /sk_(live|test)_[0-9a-zA-Z]{10,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /ghp_[0-9A-Za-z]{30,}/, /eyJhbGciOi/];

const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);
const fileFor = (p) => join(DIST, p.endsWith('/') ? p + 'index.html' : p);
const attrs = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
/** The footer is the site map: every objective, every subject, search and about (hand-written, independent of the routes module). */
const FOOTER_PAGES = [
  ...PATHS, '/enem/', '/uerj/',
  '/materias/', '/materias/matematica/', '/materias/portugues/', '/materias/redacao/', '/materias/fisica/', '/materias/quimica/',
  '/materias/biologia/', '/materias/historia/', '/materias/geografia/', '/materias/filosofia/', '/materias/sociologia/',
  '/materias/ingles/', '/materias/espanhol/', '/buscar/', '/sobre/',
];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const meta = (html, attr, name) => new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`).exec(html)?.[1];

/* Generic checks: they hold for any page this site builds. -------------------------------------- */

function checkLandmarks(path, html) {
  const ids = attrs(html, /\sid="([^"]+)"/g);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(path, `duplicate id: ${[...new Set(dup)].join(', ')}`);
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
/** The page has an element with this id: the attribute itself, never a suffix such as data-resource-id. */
const hasId = (html, id) => new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(html);
function checkLinks(path, html) {
  for (const m of html.matchAll(/<a\b([^>]*)>/g)) {
    const raw = /\shref="([^"]+)"/.exec(m[1])?.[1];
    if (raw === undefined) continue;
    const href = raw.replace(/&amp;/g, '&');
    if (href.startsWith('#')) {
      if (!hasId(html, href.slice(1))) fail(path, `dangling anchor ${href}`);
      continue;
    }
    if (href.startsWith('/')) {
      const [beforeHash, hash] = href.split('#');
      const target = beforeHash.split('?')[0];
      if (!existsSync(fileFor(target))) fail(path, `broken internal link ${href}`);
      else if (hash && !hasId(readFileSync(fileFor(target), 'utf8'), hash)) fail(path, `dangling anchor ${href}`);
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
  const scripts = html.match(/<script\b[^>]*>/g) ?? [];
  if (!SCRIPT_PAGES.has(path)) {
    if (scripts.length) fail(path, 'content pages carry no JavaScript');
    return;
  }
  // The one script of a page that has one: a first-party module (inlined or from /_astro/).
  if (scripts.length !== 1 || !/type="module"/.test(scripts[0])) fail(path, `expected exactly one module script, found ${scripts.length}`);
  for (const tag of scripts) {
    const src = /\ssrc="([^"]+)"/.exec(tag)?.[1];
    if (src && !src.startsWith('/_astro/')) fail(path, `script from outside the site: ${src}`);
  }
}

/* Accessibility, structurally (spec §7): what can be read from the HTML without a browser. */
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
/** A link's accessible name: aria-label, else its text without what is hidden from assistive tech. */
const nameOf = (attributes, inner) => {
  const label = /\saria-label="([^"]*)"/.exec(attributes)?.[1];
  if (label !== undefined) return decode(label).trim();
  // As a browser computes it: an image counts by its alt, an element with role="img" by its label.
  const named = inner
    .replace(/<([a-z]+)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<[a-z]+\b[^>]*\srole="img"[^>]*\saria-label="([^"]*)"[^>]*>/g, ' $1 ')
    .replace(/<img\b[^>]*\salt="([^"]*)"[^>]*>/g, ' $1 ');
  return decode(named.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
};

function checkAccessibility(path, html) {
  const main = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, '');
  // Headings never skip a level on the way down.
  let previous = 0;
  for (const m of main.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1]);
    if (previous && level > previous + 1) fail(path, `heading skips from h${previous} to h${level}`);
    previous = level;
  }
  // Every link has a name, and one name never leads to two different places.
  const names = new Map();
  for (const m of main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = /\shref="([^"]*)"/.exec(m[1])?.[1] ?? '';
    const name = nameOf(m[1], m[2]);
    if (!name) { fail(path, `link without an accessible name: ${href}`); continue; }
    if (names.has(name) && names.get(name) !== href) fail(path, `"${name}" leads to ${names.get(name)} and ${href}`);
    names.set(name, href);
    if (/target="_blank"/.test(m[1]) && !/class="sr-only"[^>]*>[^<]*nova aba/.test(m[2])) fail(path, `new-tab link does not say so: ${href}`);
  }
  // Navigation landmarks are told apart.
  const navs = [...main.matchAll(/<nav\b([^>]*)>/g)].map((m) => /aria-label(?:ledby)?="([^"]+)"/.exec(m[1])?.[1] ?? '');
  if (navs.some((n) => !n)) fail(path, 'every nav has a label');
  if (new Set(navs).size !== navs.length) fail(path, `nav labels repeat: ${navs.join(', ')}`);
  if (/\stabindex="[1-9]/.test(main)) fail(path, 'no positive tabindex');
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
  // "About 60 characters" (spec §8.1), held to 65 so a long subject name still fits.
  if (title.length > 65) fail(path, `title longer than 65 characters (${title.length})`);
  if (meta(html, 'property', 'og:title') !== title) fail(path, 'og:title must equal the title');
  if (meta(html, 'property', 'og:description') !== description) fail(path, 'og:description must equal the description');
  if (meta(html, 'property', 'og:url') !== `${SITE}${path}`) fail(path, 'og:url must equal the canonical');
  if (meta(html, 'name', 'twitter:card') !== 'summary') fail(path, 'twitter:card must be summary');
  if (/og:image/.test(html)) fail(path, 'no og:image in V0.1');
  seenTitles.push([path, title]);
  seenDescriptions.push([path, description]);
}
const seenTitles = [];
const seenDescriptions = [];
function checkUnique(list, what) {
  const byValue = new Map();
  for (const [path, value] of list) byValue.set(value, [...(byValue.get(value) ?? []), path]);
  for (const [value, paths] of byValue) if (paths.length > 1) fail(paths.join(', '), `share the same ${what}: ${value}`);
}

function checkShell(path, html) {
  if (!/<header\b/.test(html) || !/<footer\b/.test(html)) fail(path, 'header or footer landmark missing');
  // An id names one element: a second one makes anchors and aria references ambiguous.
  const ids = attrs(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ''), /<[a-z][^>]*\sid="([^"]+)"/g);
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) fail(path, `duplicate id "${id}"`);
  // The brand is the official lockup in every header (a link home, named by its label) and footer, and the
  // icons are the generated ones (scripts/brand-assets.mjs); no typographic stand-in.
  const header = /<header class="site-header"[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';
  const brandLink = /<a\b[^>]*\sdata-brand[^>]*>([\s\S]*?)<\/a>/.exec(header);
  if (!brandLink || !/href="\/"/.test(brandLink[0]) || !/aria-label="[^"]+"/.test(brandLink[0]) || !/<img\b[^>]*src="\/_astro\/lockup-white\.[^"]+"/.test(brandLink[1])) fail(path, 'the header shows the official lockup, linked home');
  if (/sig-a|sig-b/.test(html)) fail(path, 'the temporary typographic signature is gone');
  for (const icon of ['/favicon-32.png', '/icon-192.png', '/apple-touch-icon.png']) {
    if (!html.includes(`href="${icon}"`)) fail(path, `the page links ${icon}`);
    else if (!existsSync(fileFor(icon))) fail(path, `${icon} is missing from dist`);
  }
  const footer = /<footer\b[\s\S]*<\/footer>/.exec(html)?.[0] ?? '';
  const footerLinks = new Set(hrefsIn(footer));
  for (const page of FOOTER_PAGES) if (!footerLinks.has(page)) fail(path, `the footer does not link ${page}`);
  // A path in preparation says so wherever it is linked, the footer included (V0.3 §2.1).
  for (const page of PREPARING) {
    if (!new RegExp(`href="${page}"[^>]*>[^<]*</a>\\s*<span\\b[^>]*\\sdata-path-state[^>]*>Em preparação</span>`).test(footer)) fail(path, `the footer marks ${page} as in preparation`);
  }
  if (!/<img\b[^>]*src="\/_astro\/lockup-white\.[^"]+"[^>]*alt="Pexis Academy"|<img\b[^>]*alt="Pexis Academy"[^>]*src="\/_astro\/lockup-white\./.test(footer)) fail(path, 'the footer shows the official lockup');
  // The header is the institutional wine (checked in the stylesheet below), with the Explorar menu and the
  // direct links in order, and a mobile menu that reaches the same places. No JavaScript: native <details>.
  const nav = /<nav\b[^>]*aria-label="Principal"[^>]*>([\s\S]*?)<\/nav>/.exec(header)?.[1];
  if (!nav) { fail(path, 'main navigation (aria-label="Principal") missing'); return; }
  const menu = /<details\b[^>]*data-menu="explorar"[^>]*>([\s\S]*?)<\/details>/.exec(nav)?.[1] ?? '';
  if (!/<summary\b[^>]*>\s*Explorar\b/.test(menu)) fail(path, 'the Explorar menu is a <summary> named "Explorar"');
  const linkItems = (fragment) => [...fragment.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
    .map((m) => [m[1], m[2].replace(/<span class="tag"[\s\S]*?<\/span>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/ →$/, '').trim()]);
  const menuHrefs = hrefsIn(menu);
  if (JSON.stringify(menuHrefs) !== JSON.stringify(EXPLORE_MENU.map((i) => i[0]))) fail(path, `Explorar menu ${menuHrefs.join(',')}`);
  // The order of the line: Cursos, Materiais, Explorar, search.
  const order = [...nav.matchAll(/<a\b[^>]*href="([^"]+)"|<details\b[^>]*data-menu="explorar"/g)].filter((m) => !EXPLORE_MENU.some(([href]) => href === m[1])).map((m) => m[1] ?? 'explorar');
  if (JSON.stringify(order) !== JSON.stringify(['/cursos/', '/materiais/', 'explorar', '/buscar/'])) fail(path, `header order ${order.join(',')}`);
  const direct = linkItems(nav.replace(/<details\b[\s\S]*?<\/details>/, ''));
  if (JSON.stringify(direct) !== JSON.stringify(HEADER_NAV)) fail(path, `header navigation ${JSON.stringify(direct)}`);
  // Search is an icon: its name comes from text hidden for sight, never from the glyph.
  for (const m of header.matchAll(/<a\b[^>]*\sdata-search-link[^>]*>([\s\S]*?)<\/a>/g)) {
    if (!/<svg\b[^>]*aria-hidden="true"/.test(m[1]) || !/<span class="sr-only"[^>]*>Buscar<\/span>/.test(m[1])) fail(path, 'the search icon is decorative and its link is named "Buscar"');
  }
  if (!/<p class="panel-label"[^>]*>Escolha seu caminho<\/p>/.test(menu)) fail(path, 'the Explorar menu is titled "Escolha seu caminho"');
  for (const m of header.matchAll(/<a\b([^>]*)>/g)) {
    const href = /href="([^"]+)"/.exec(m[1])?.[1] ?? '';
    const current = /aria-current="page"/.test(m[1]);
    if (current !== (href === path)) fail(path, `aria-current on ${href} should be ${href === path}`);
  }
  const mobile = /<details\b[^>]*data-menu="mobile"[^>]*>([\s\S]*?)<\/details>/.exec(header)?.[1] ?? '';
  if (!/<summary\b/.test(mobile)) fail(path, 'the mobile menu is a <details> with a <summary>');
  const mobileHrefs = hrefsIn(mobile);
  const expected = ['/cursos/', '/materiais/', ...EXPLORE_MENU.map(([href]) => href)];
  if (JSON.stringify(mobileHrefs) !== JSON.stringify(expected)) fail(path, `the mobile menu ${mobileHrefs.join(',')}`);
  if (!/<details\b[^>]*data-menu="mobile-explorar"[^>]*>\s*<summary\b[^>]*>\s*Explorar caminhos/.test(mobile)) fail(path, 'the mobile menu holds the paths under "Explorar caminhos"');
  // Search stays one tap away on a phone, outside the menu.
  if ((header.match(/\sdata-search-link[\s>]/g) ?? []).length !== 2) fail(path, 'search is in the bar at every width');
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
    // One link: out to the source in a new tab, or (V0.6) to the course's own page when it has one.
    const ownPage = links.length === 1 && /\shref="([^"]+)"/.exec(links[0][1])?.[1] === `/cursos/${id}/` && COURSE_PAGES.includes(`/cursos/${id}/`);
    if (links.length !== 1 || (!ownPage && !/target="_blank"/.test(links[0][1]))) fail(path, `resource ${id} needs exactly one outbound link`);
    if (!/translate="no"/.test(body)) fail(path, `resource ${id}: the official title must carry translate="no"`);
    if (!ownPage && !/class="sr-only"[^>]*>[^<]*nova aba/.test(body)) fail(path, `resource ${id}: the link must say it opens in a new tab`);
  }
  return items;
}

/** /cursos/ (V0.6): one grid of course cards, each with its 16:9 thumbnail (a local image or the Academy's
 *  frame), and path filters that are native radios: "Todos" first and checked, then only paths that hold a
 *  course, in the approved order, each counting what it shows. A card links to its source or, with a
 *  presentation, to its own page. */
function checkCourseLibrary(path, html, resources) {
  const grids = html.match(/<ul\b[^>]*\sdata-course-grid[\s>]/g) ?? [];
  if (grids.length !== 1) fail(path, `one course grid (${grids.length})`);
  for (const [, attributes, body] of resources) {
    const id = /data-resource-id="([^"]+)"/.exec(attributes)?.[1];
    if (!/\sdata-thumb="(image|frame)"/.test(body)) fail(path, `course ${id} has no thumbnail`);
    const href = /<a\b[^>]*\shref="([^"]+)"/.exec(body)?.[1] ?? '';
    if (href.startsWith('/') ? !COURSE_PAGES.includes(href) || href !== `/cursos/${id}/` : !/target="_blank"/.test(body)) fail(path, `course ${id} links ${href}`);
  }
  for (const id of COURSE_PAGES.map((page) => page.split('/')[2])) {
    if (!resources.some(([, attributes, body]) => attributes.includes(`data-resource-id="${id}"`) && body.includes(`href="/cursos/${id}/"`))) fail(path, `the card of ${id} leads to its page`);
  }
  const fieldset = /<fieldset\b[^>]*\sdata-course-filters[\s\S]*?<\/fieldset>/.exec(html)?.[0] ?? '';
  const radios = [...fieldset.matchAll(/<input\b([^>]*)>/g)].map((m) => m[1]);
  const values = radios.map((a) => /\svalue="([^"]+)"/.exec(a)?.[1]);
  if (!radios.every((a) => /type="radio"/.test(a) && /name="caminho"/.test(a))) fail(path, 'the course filters are radios of one group');
  if (values[0] !== 'todos' || !/\schecked/.test(radios[0] ?? '')) fail(path, '"Todos" comes first and is chosen');
  if (radios.slice(1).some((a) => /\schecked/.test(a))) fail(path, 'only "Todos" starts chosen');
  const served = PATHS.map((p) => p.slice(1, -1)).filter((p) => resources.some((item) => resourceAttr(item, 'data-paths').split(' ').includes(p)));
  if (JSON.stringify(values.slice(1)) !== JSON.stringify(served)) fail(path, `course filters ${values.slice(1).join(',')} ≠ paths with courses ${served.join(',')}`);
  for (const value of values) {
    const label = new RegExp(`<label\\b[^>]*for="caminho-${value}"[^>]*>[\\s\\S]*?<span class="n"[^>]*>(\\d+)</span>`).exec(fieldset)?.[1];
    const shown = value === 'todos' ? resources.length : resources.filter((item) => resourceAttr(item, 'data-paths').split(' ').includes(value)).length;
    if (Number(label) !== shown) fail(path, `filter ${value} says ${label}, shows ${shown}`);
  }
}

/** The hrefs of the links inside the first element matching `open`, up to its closing `tag`. */
function sectionOf(html, open, tag = 'section') {
  const start = html.search(open);
  if (start < 0) return null;
  const end = html.indexOf(`</${tag}>`, start);
  return html.slice(start, end < 0 ? undefined : end);
}
const hrefsIn = (fragment) => attrs(fragment, /<a\b[^>]*\shref="([^"]+)"/g);

/** Resource ids that decorative product demos show: each must be a real, published resource (checked
 *  against every page's resource lists once all pages are read). */
const DEMO_RESOURCE_IDS = new Set();
const PUBLISHED_RESOURCE_IDS = new Set();
/** Each search result for a resource, and the page#anchor it opens (V0.4 M4). */
const SEARCH_RESOURCE_TARGETS = new Map();
/** Institution filters the Home's #fontes leads to (V0.4 QA P1-RC1); each must work on the built search. */
const HOME_SEARCH_FILTERS = new Set();
/** The distinct resources each page renders, and the count the Home prints for each path (V0.4 §5.3). */
const PAGE_RESOURCE_IDS = new Map();
const HOME_PATH_COUNTS = new Map();

/** A product demo (a window that shows the real product) is decorative for assistive tech, holds nothing
 *  focusable, shows only real resources, and is captioned by a real link. */
function checkProductWindow(path, figure) {
  const hidden = (/<div\b[^>]*\saria-hidden="true"[^>]*>[\s\S]*/.exec(figure)?.[0] ?? '').split('<figcaption')[0];
  if (!hidden) fail(path, 'a product window is aria-hidden');
  if (/<(a|button|input|select|textarea)\b|tabindex=/.test(hidden)) fail(path, 'a product window holds nothing focusable');
  if (/<h[1-6][\s>]/.test(hidden)) fail(path, 'a product window holds no headings (the page outline stays the page\'s)');
  const ids = attrs(figure, /\sdata-demo-resource-id="([^"]+)"/g);
  if (ids.length === 0) fail(path, 'a product window shows at least one real resource');
  for (const id of ids) DEMO_RESOURCE_IDS.add(id);
  const caption = /<figcaption\b[\s\S]*?<\/figcaption>/.exec(figure)?.[0] ?? '';
  if (!/<a\b[^>]*href="\//.test(caption)) fail(path, 'a product window is captioned by a link to the real page');
}

/** The Home orients; it does not pour out content (spec §5.2). */
function checkHome(path, html, resources) {
  const main = /<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '';
  const hero = main.slice(0, Math.max(0, main.search(/<section\b/)));
  if (!hero.includes('href="#objetivo"') || !hero.includes('href="/materias/"')) fail(path, 'the hero offers "#objetivo" and "/materias/"');
  const window = /<figure\b[^>]*\sdata-product-window[\s\S]*?<\/figure>/.exec(hero)?.[0];
  if (!window) fail(path, 'the hero shows the product (figure[data-product-window])');
  else {
    checkProductWindow(path, window);
    // The hero's window shows a real route (V0.3): Vestibular, ENEM, Matemática, content, practice.
    const route = attrs(window, /\sdata-route-step="([^"]+)"/g);
    if (JSON.stringify(route) !== JSON.stringify(['caminho', 'prova', 'area', 'conteudo', 'pratica'])) fail(path, `hero route ${route.join(',')}`);
  }
  const objective = sectionOf(html, /<section\b[^>]*\sid="objetivo"/);
  if (!objective) fail(path, 'section#objetivo missing');
  else {
    if (!/<h2[^>]*>Qual é o seu objetivo\?<\/h2>/.test(objective)) fail(path, '#objetivo must ask "Qual é o seu objetivo?"');
    const hrefs = hrefsIn(objective);
    if (JSON.stringify(hrefs) !== JSON.stringify(PATHS)) fail(path, `#objetivo links ${hrefs.join(',')}`);
    for (const [, href, n, body] of objective.matchAll(/<a\b[^>]*\shref="([^"]+)"[^>]*\sdata-path-count="(\d+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      if (!new RegExp(`>${n} recursos?\\b`).test(body)) fail(path, `#objetivo ${href} prints a count other than ${n}`);
      HOME_PATH_COUNTS.set(href, Number(n));
    }
  }
  // The learning path: the five steps, in order, each a real thing. A step that has nothing published yet
  // says so and links nowhere; the others lead to the page that holds them.
  const path_ = sectionOf(html, /<section\b[^>]*\sid="caminho"/);
  if (!path_) fail(path, 'section#caminho missing');
  else {
    const steps = [...path_.matchAll(/<li\b[^>]*\sdata-path-step="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];
    const order = ['objetivo', 'area', 'assunto', 'conteudo', 'pratica'];
    if (JSON.stringify(steps.map((m) => m[1])) !== JSON.stringify(order)) fail(path, `#caminho steps ${steps.map((m) => m[1]).join(',')}`);
    for (const [, step, body] of steps) {
      const links = hrefsIn(body);
      const pending = /\sdata-path-pending[\s>=]/.test(body);
      if (pending ? links.length : links.length !== 1 || !links[0].startsWith('/')) fail(path, `#caminho step ${step} links ${links.join(',') || 'nowhere'}`);
    }
    for (const id of attrs(path_, /\sdata-demo-resource-id="([^"]+)"/g)) DEMO_RESOURCE_IDS.add(id);
  }
  // Official sources: institutions that publish free material here, each leading to that material on this
  // site. Never a partner, a sponsor or an endorsement (docs/superpowers/research/2026-10-11-official-brands.md).
  const sources = sectionOf(html, /<section\b[^>]*\sid="fontes"/);
  if (!sources) fail(path, 'section#fontes missing');
  else {
    const cells = [...sources.matchAll(/<li\b[^>]*\sdata-institution="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];
    if (cells.length < 3) fail(path, `#fontes shows ${cells.length} institutions`);
    for (const [, name, body] of cells) {
      const links = hrefsIn(body);
      // A track on one page, or (V0.4 QA P1-RC1) the search filtered by the institution when its courses
      // span pages; that filter value is checked against the built search page below.
      const filtered = /^\/buscar\/\?instituicao=([a-z0-9-]+)$/.exec(links[0] ?? '');
      if (filtered) HOME_SEARCH_FILTERS.add(filtered[1]);
      if (links.length !== 1 || !(/^\/[^#]*#[\w-]+$/.test(links[0]) || filtered)) fail(path, `#fontes ${name} links ${links.join(',') || 'nowhere'}`);
    }
  }
  // Featured paths: at most three, each a real guide or track with its steps, opened by one internal link.
  const featured = sectionOf(html, /<section\b[^>]*\sid="trilhas"/);
  if (!featured) fail(path, 'section#trilhas missing');
  else {
    const cards = [...featured.matchAll(/<article\b[^>]*\sdata-featured="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];
    if (cards.length < 1 || cards.length > 3) fail(path, `#trilhas shows ${cards.length} paths (1 to 3)`);
    for (const [, id, body] of cards) {
      const links = hrefsIn(body);
      if (links.length !== 1 || !links[0].startsWith('/')) fail(path, `#trilhas ${id} links ${links.join(',') || 'nowhere'}`);
      if ((body.match(/<li\b/g) ?? []).length < 2) fail(path, `#trilhas ${id} lists fewer than two steps`);
    }
  }
  const plain = main.replace(/<[^>]+>/g, ' ');
  // Nor a feature the product does not have (V0.2 brief): no tutor, no saved progress, no Academy certificate.
  const claim = /parceir|patrocin|apoiad|endoss|oficial da pexis|tutor|progresso salvo|salvamos|certificado da (pexis|academy)/i.exec(plain);
  if (claim) fail(path, `the Home claims an association ("${claim[0]}")`);
  const areas = sectionOf(html, /<section\b[^>]*\sid="areas"/);
  if (!areas) fail(path, 'section#areas missing');
  else checkAreaGroups(path, areas);
  if (resources.length) fail(path, `the Home lists no resources (found ${resources.length})`);

  // The order is fixed and closed: no section joins without a written reason (spec §5.2, R9).
  const sections = attrs(main, /<section\b[^>]*\sid="([^"]+)"/g);
  if (JSON.stringify(sections) !== JSON.stringify(['objetivo', 'caminho', 'fontes', 'areas', 'trilhas', 'curadoria', 'perguntas'])) fail(path, `Home sections ${sections.join(',')}`);
  if (main.search(/<h1[\s>]/) > main.search(/<section\b/)) fail(path, 'the hero (with the h1) comes first');
  if ((main.match(/<section\b/g) ?? []).length !== sections.length) fail(path, 'every Home section has an id');
  // Questions as native disclosure (no JavaScript): each a <details> with its <summary>.
  const faq = sectionOf(html, /<section\b[^>]*\sid="perguntas"/);
  if (!faq) fail(path, 'section#perguntas missing');
  else {
    const items = faq.match(/<details\b[\s\S]*?<\/details>/g) ?? [];
    if (items.length < 4) fail(path, `#perguntas has ${items.length} questions`);
    for (const item of items) if (!/<summary\b[^>]*>[\s\S]*?\?[\s\S]*?<\/summary>/.test(item)) fail(path, 'a question is a <summary> ending in "?"');
  }
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

const OBJECTIVE_PATHS = ['/enem/', '/uerj/', '/ensino-medio/', '/vestibulares/', '/ensino-superior/', '/tecnologia/'];
/** The formats a student practises with (V0.4 §4.3). Mirrors PRACTICE_FORMATS; a test keeps them equal. */
const PRACTICE_FORMATS = ['practice', 'past-exam', 'simulator'];
const PRACTICE_ATTR = new RegExp(`data-format="(?:${PRACTICE_FORMATS.join('|')})"`);
const NON_PRACTICE_ATTR = new RegExp(`data-format="(?!(?:${PRACTICE_FORMATS.join('|')})")`);
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
  if (content && PRACTICE_ATTR.test(content)) fail(path, '#conteudo holds no practice');
  if (practice && NON_PRACTICE_ATTR.test(practice)) fail(path, '#pratique holds practice only');
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
  // The official page itself, or (V0.4 QA P2-RC5) the resource on this section that is that page: an
  // element #recurso-<id> in the same section, whose own link is on an official host.
  const target = (href) => {
    const local = /^#(recurso-[\w-]+)$/.exec(href);
    if (!local) return href;
    const item = new RegExp(`<([a-z]+)\\b[^>]*\\sid="${local[1]}"[^>]*>[\\s\\S]*?<\\/\\1>`).exec(fragment)?.[0] ?? '';
    return hrefsIn(item).find((h) => /^https:/.test(h)) ?? '';
  };
  const hosts = hrefsIn(note).map((h) => { try { return new URL(target(h)).hostname; } catch { return ''; } });
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
  if (PRACTICE_ATTR.test(deepen)) fail(path, '#aprofunde holds no practice');
}

/** /uerj/: its own personality, with past exams as the spine (spec §6.3). */
const UERJ_PRACTICE = ['uerj-math-practice', 'uerj-portuguese-practice', 'uerj-writing-practice', 'uerj-physics-practice', 'uerj-history-practice', 'uerj-geography-practice', 'uerj-spanish-practice'];
function checkUerj(path, html) {
  const ids = sectionIds(html);
  if (JSON.stringify(ids) !== JSON.stringify(['entenda', 'prepare', 'materias', 'provas'])) fail(path, `UERJ sections ${ids.join(',')}`);
  checkSourceNote(path, sectionOf(html, /<section\b[^>]*\sid="entenda"/) ?? '', '#entenda');
  const prepare = sectionOf(html, /<section\b[^>]*\sid="prepare"/) ?? '';
  checkSourceNote(path, prepare, '#prepare');
  if (/<table\b/.test(prepare)) fail(path, '#prepare points to the official rules; it copies no table');
  const exams = sectionOf(html, /<section\b[^>]*\sid="provas"/) ?? '';
  const found = attrs(exams, /\sdata-resource-id="([^"]+)"/g).sort();
  if (JSON.stringify(found) !== JSON.stringify([...UERJ_PRACTICE].sort())) fail(path, `#provas must hold the seven UERJ collections (${found.join(',')})`);
  const subjects = hrefsIn(sectionOf(html, /<section\b[^>]*\sid="materias"/) ?? '');
  const expected = ['/materias/matematica/', '/materias/portugues/', '/materias/redacao/', '/materias/fisica/', '/materias/historia/', '/materias/geografia/', '/materias/espanhol/'];
  if (JSON.stringify(subjects) !== JSON.stringify(expected)) fail(path, `#materias links ${subjects.join(',')}`);
}

/** A path page that maps subjects by area: only resources that declare the path (spec §6.3, V0.4 §5.1). */
function checkObjectiveMap(path, html, resources, pathId) {
  if (resources.length === 0) fail(path, 'shows at least one resource');
  for (const item of resources) {
    if (!resourceAttr(item, 'data-paths').split(' ').includes(pathId)) fail(path, `resource ${resourceAttr(item, 'data-resource-id')} does not declare ${pathId}`);
  }
}

function checkProduct(path, html) {
  const resources = checkResources(path, html);
  for (const item of resources) PUBLISHED_RESOURCE_IDS.add(resourceAttr(item, 'data-resource-id'));
  PAGE_RESOURCE_IDS.set(path, new Set(resources.map((item) => resourceAttr(item, 'data-resource-id'))));
  if (path === '/') checkHome(path, html, resources);
  if (path === '/sobre/') checkAbout(path, html);
  // Every internal page says where it sits (V0.3): a breadcrumb from Início, through its section.
  if (path !== '/') {
    const crumbs = /<nav\b[^>]*\sdata-breadcrumb[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1];
    if (!crumbs) fail(path, 'an internal page carries a breadcrumb');
    else {
      const trail = hrefsIn(crumbs);
      if (trail[0] !== '/') fail(path, 'the breadcrumb starts at Início');
      if (/^\/materias\/[a-z-]+\/$/.test(path) && JSON.stringify(trail) !== JSON.stringify(['/', '/materias/'])) fail(path, `a subject's breadcrumb goes through Explorar (${trail.join(',')})`);
    }
  }
  if (path === '/materias/') {
    const paths = hrefsIn(sectionOf(html, /<section\b[^>]*\sid="caminhos"/) ?? '');
    if (JSON.stringify(paths) !== JSON.stringify(PATHS)) fail(path, `Explorar lists the six paths in order (${paths.join(',')})`);
  }
  // An exam lives inside Vestibular: its breadcrumb leads back there (V0.3).
  if (path === '/enem/' || path === '/uerj/') {
    const crumbs = /<nav\b[^>]*\sdata-breadcrumb[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    if (JSON.stringify(hrefsIn(crumbs)) !== JSON.stringify(['/', '/vestibulares/'])) fail(path, `breadcrumb ${hrefsIn(crumbs).join(',') || 'missing'}`);
    if (!/aria-current="page"/.test(crumbs)) fail(path, 'the breadcrumb marks the current page');
  }
  if (path === '/enem/') checkEnem(path, html);
  if (path === '/uerj/') checkUerj(path, html);
  if (path === '/vestibulares/') {
    checkObjectiveMap(path, html, resources, 'vestibulares');
    // Vestibular is the hub of its exams (V0.3): it opens with them, ENEM then UERJ, then the editorial note.
    // Released highlights (#destaques, checked on their own) may come first, and only first (V0.4 QA P2-RC3).
    const all = sectionIds(html);
    if (all.indexOf('destaques') > 0) fail(path, `#destaques must lead the page (${all.join(',')})`);
    const ids = all.filter((id) => id !== 'destaques');
    if (ids[0] !== 'provas' || ids[1] !== 'nota-editorial') fail(path, `Vestibular opens with its exams, then the editorial note (${ids.join(',')})`);
    const exams = hrefsIn(sectionOf(html, /<section\b[^>]*\sid="provas"/) ?? '');
    if (JSON.stringify(exams) !== JSON.stringify(['/enem/', '/uerj/'])) fail(path, `#provas links ${exams.join(',')}`);
    if (!/<h1[^>]*>Vestibular<\/h1>/.test(html)) fail(path, 'the page is titled "Vestibular"');
  }
  if (path === '/buscar/') {
    // The directory: without JavaScript it links every content page (Home, Buscar and Sobre are in the
    // shell of every page); with it, a hidden search form filters the same entries.
    const main = /<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '';
    const linked = new Set(hrefsIn(main).map((h) => h.split('#')[0]));
    // A course's own page is reached from its card on /cursos/; the directory lists the course itself.
    for (const page of CANONICAL.filter((p) => !['/', '/buscar/', '/sobre/', ...COURSE_PAGES].includes(p))) {
      if (!linked.has(page)) fail(path, `the directory does not reach ${page}`);
    }
    const entries = main.match(/<li\b[^>]*\sdata-search-entry[\s>=][^>]*>/g) ?? [];
    if (entries.length < 60) fail(path, `expected the full index, found ${entries.length} entries`);
    for (const li of entries) {
      const terms = /\sdata-terms="([^"]+)"/.exec(li)?.[1] ?? '';
      if (!terms || terms !== terms.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()) fail(path, `entry without normalized terms: ${li.slice(0, 80)}`);
    }
    if (!/<form\b[^>]*role="search"[^>]*\shidden[\s>=]/.test(main)) fail(path, 'the search form starts hidden (revealed by JavaScript)');
    // V0.4 M4: a resource result opens its page at the resource itself, and carries its facets; the form
    // filters by the five facets, in this order (it stays hidden without JavaScript).
    for (const li of main.match(/<li\b[^>]*\sdata-entry-id="recurso:[^"]+"[^>]*>[\s\S]*?<\/li>/g) ?? []) {
      const id = /data-entry-id="recurso:([^"]+)"/.exec(li)[1];
      const href = hrefsIn(li)[0] ?? '';
      if (!href.endsWith(`#recurso-${id}`)) fail(path, `result ${id} must open its page at #recurso-${id} (${href})`);
      SEARCH_RESOURCE_TARGETS.set(id, href);
      if (!/\sdata-facet-caminho="[^"]+"/.test(li) || !/\sdata-facet-formato="[^"]+"/.test(li)) fail(path, `result ${id} carries no facets`);
    }
    const facets = attrs(/<form\b[\s\S]*?<\/form>/.exec(main)?.[0] ?? '', /<fieldset\b[^>]*\sdata-facet="([^"]+)"/g);
    if (JSON.stringify(facets) !== JSON.stringify(['caminho', 'materia', 'instituicao', 'idioma', 'formato'])) fail(path, `search facets ${facets.join(',')}`);
  }
  if (path === '/tecnologia/') {
    const tracks = [...html.matchAll(/<section\b[^>]*\sdata-track="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
    const order = ['comecar-a-programar', 'ciencia-da-computacao', 'desenvolvimento-web', 'python', 'inteligencia-artificial', 'dados', 'seguranca-e-privacidade', 'computacao-em-nuvem'];
    if (JSON.stringify(tracks.map((m) => m[1])) !== JSON.stringify(order)) fail(path, `tracks ${tracks.map((m) => m[1]).join(',')}`);
    for (const [, id, body] of tracks) if (!/\sdata-resource-id="/.test(body)) fail(path, `track ${id} is empty`);
  }
  if (path === '/ensino-medio/') {
    checkObjectiveMap(path, html, resources, 'ensino-medio');
    // The editorial highlights (#destaques) may lead the map once complete; they are checked on their own.
    const ids = sectionIds(html).filter((id) => id !== 'destaques');
    if (JSON.stringify(ids) !== JSON.stringify(['matematica', 'linguagens', 'natureza', 'humanas', 'idiomas', 'tecnologia'])) fail(path, `Ensino Médio sections ${ids.join(',')}`);
    if (!hrefsIn(sectionOf(html, /<section\b[^>]*\sid="tecnologia"/) ?? '').includes('/tecnologia/')) fail(path, '#tecnologia leads to /tecnologia/');
  }
  if (path === '/ensino-superior/') {
    // University courses only, by field (V0.4 QA P1-RC2). The fields, in order, written out by hand: the two of
    // V0.3 always, first, each with at least two courses; a later field only when it holds a published course.
    // A field never appears empty, out of order, twice, or under a name not listed here.
    const groups = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].filter((m) => m[1] !== 'destaques').map((m) => [m[1], (m[2].match(/\sdata-resource-id="/g) ?? []).length]);
    const ids = groups.map((g) => g[0]);
    const known = ids.filter((id) => SUPERIOR_FIELDS.includes(id));
    const inOrder = known.length === ids.length && new Set(ids).size === ids.length && ids.every((id, i) => i === 0 || SUPERIOR_FIELDS.indexOf(id) > SUPERIOR_FIELDS.indexOf(ids[i - 1]));
    if (!inOrder || ids[0] !== 'matematica' || ids[1] !== 'computacao') fail(path, `Ensino Superior groups ${ids.join(',')}`);
    for (const [id, n] of groups) if (n < (['matematica', 'computacao'].includes(id) ? 2 : 1)) fail(path, `group ${id} lists ${n} courses`);
  }
  if (path in LIBRARIES) {
    // A library is a view: each resource once, of one of its formats, grouped by format in order, and
    // never the anchor a search result opens (that stays on the resource's own page).
    const ids = resources.map((item) => resourceAttr(item, 'data-resource-id'));
    if (new Set(ids).size !== ids.length) fail(path, 'a library lists each resource once');
    if (ids.length === 0) fail(path, 'a library is never empty');
    for (const item of resources) if (!LIBRARIES[path].includes(resourceAttr(item, 'data-format'))) fail(path, `resource ${resourceAttr(item, 'data-resource-id')} is not of this library`);
    if (/\sid="recurso-/.test(html)) fail(path, 'a library carries no resource anchor');
    if (path === '/cursos/') checkCourseLibrary(path, html, resources);
    else {
      const groups = attrs(/<main\b[\s\S]*<\/main>/.exec(html)?.[0] ?? '', /<section\b[^>]*\sid="formato-([^"]+)"/g);
      const present = LIBRARIES[path].filter((f) => resources.some((item) => resourceAttr(item, 'data-format') === f));
      if (JSON.stringify(groups) !== JSON.stringify(present)) fail(path, `library groups ${groups.join(',')}`);
    }
  }
  if (COURSE_PAGES.includes(path)) {
    // A course's own page: the breadcrumb goes through Cursos, one action out to the course's source, and the
    // presentation's date; the course itself is never listed as one of its related courses.
    const id = path.split('/')[2];
    const crumbs = /<nav\b[^>]*\sdata-breadcrumb[^>]*>([\s\S]*?)<\/nav>/.exec(html)?.[1] ?? '';
    if (JSON.stringify(hrefsIn(crumbs)) !== JSON.stringify(['/', '/cursos/'])) fail(path, `breadcrumb ${hrefsIn(crumbs).join(',')}`);
    const article = /<article\b[^>]*\sdata-course-page="([^"]+)"[\s\S]*?<\/article>/.exec(html);
    if (!article || article[1] !== id) fail(path, 'the page presents its own course');
    else if ((article[0].match(/<a\b[^>]*target="_blank"/g) ?? []).length !== 1) fail(path, 'one action to the source');
    if (resources.some((item) => resourceAttr(item, 'data-resource-id') === id)) fail(path, 'a course is not related to itself');
  }
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
  checkAccessibility(path, html);
}

/* An active path page never says it is in preparation (V0.4 Gate B, P2): its state and its page agree. */
for (const path of PATHS.filter((p) => !PREPARING.includes(p))) {
  const html = existsSync(fileFor(path)) ? readFileSync(fileFor(path), 'utf8') : '';
  if (/\sdata-preparing[\s>=]/.test(html)) fail(path, 'an active path does not say it is in preparation');
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) fail(path, 'an active path is indexable');
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? '';
  if (/prepara[çc][ãa]o|ainda n[ãa]o/i.test(description)) fail(path, 'an active path\'s description does not speak of preparation');
}
/* …and a path in preparation says so in its description too. */
for (const path of PREPARING) {
  const html = existsSync(fileFor(path)) ? readFileSync(fileFor(path), 'utf8') : '';
  if (!/<meta name="description" content="[^"]*prepara[çc][ãa]o/i.test(html)) fail(path, 'a path in preparation says so in its description');
}

/* Paths in preparation: real pages, linked from the Home, the header and the footer, that say what
   they are and list nothing. Not canonical, not in the sitemap. */
for (const path of PREPARING) {
  const file = fileFor(path);
  if (!existsSync(file)) { fail(path, 'missing'); continue; }
  const html = readFileSync(file, 'utf8');
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail(path, 'a path in preparation is noindex');
  if (/<link rel="canonical"/.test(html)) fail(path, 'a path in preparation has no canonical');
  if (!/\sdata-preparing[\s>=]/.test(html)) fail(path, 'a path in preparation says so ([data-preparing])');
  if (/\sdata-resource-id="/.test(html)) fail(path, 'a path in preparation lists no resource');
  if (!html.includes('<html lang="pt-BR"')) fail(path, 'expected <html lang="pt-BR">');
  if (!/<title>[^<]*\| Pexis Academy<\/title>/.test(html)) fail(path, 'title pattern');
  checkShell(path, html);
  checkLandmarks(path, html);
  checkImages(path, html);
  checkThirdParty(path, html);
  checkLinks(path, html);
  checkScripts(path, html);
  checkAccessibility(path, html);
}

/* In-page navigation (V0.4 M3): a long path page opens with a nav[data-section-nav] that leads, in order,
   to every section of the page, and to nothing else. */
const SECTION_NAV_PAGES = ['/ensino-medio/', '/vestibulares/', '/tecnologia/'];
for (const path of SECTION_NAV_PAGES) {
  const html = existsSync(fileFor(path)) ? readFileSync(fileFor(path), 'utf8') : '';
  const nav = /<nav\b[^>]*\sdata-section-nav[\s\S]*?<\/nav>/.exec(html)?.[0];
  if (!nav) { fail(path, 'a long path page opens with nav[data-section-nav]'); continue; }
  const targets = hrefsIn(nav).map((href) => href.replace(/^#/, ''));
  if (JSON.stringify(targets) !== JSON.stringify(sectionIds(html))) fail(path, `section nav ${targets.join(',')} ≠ sections ${sectionIds(html).join(',')}`);
}

/* Editorial highlights (V0.4 §5.2): a section[data-featured] appears only complete: ten distinct resources,
   each declaring the page's path, none featured on two pages, none on a path in preparation. */
{
  const FEATURED_PAGES = { '/ensino-fundamental/': 'ensino-fundamental', '/ensino-medio/': 'ensino-medio', '/vestibulares/': 'vestibulares', '/pre-militar/': 'pre-militar', '/ensino-superior/': 'ensino-superior', '/tecnologia/': 'tecnologia' };
  const seen = new Map();
  for (const [path, pathId] of Object.entries(FEATURED_PAGES)) {
    const html = existsSync(fileFor(path)) ? readFileSync(fileFor(path), 'utf8') : '';
    const sections = [...html.matchAll(/<section\b[^>]*\sdata-featured[\s>=][\s\S]*?<\/section>/g)].map((m) => m[0]);
    if (sections.length > 1) fail(path, 'one featured section at most');
    if (!sections.length) continue;
    if (PREPARING.includes(path)) fail(path, 'a path in preparation features nothing');
    const items = [...sections[0].matchAll(/<li\b([^>]*\sdata-resource-id="[^"]+"[^>]*)>/g)];
    const ids = items.map((item) => resourceAttr(item, 'data-resource-id'));
    if (ids.length !== 10 || new Set(ids).size !== 10) fail(path, `featured holds ${ids.length} (${new Set(ids).size} distinct), not ten`);
    for (const item of items) {
      const id = resourceAttr(item, 'data-resource-id');
      if (!resourceAttr(item, 'data-paths').split(' ').includes(pathId)) fail(path, `featured ${id} does not declare ${pathId}`);
      if (seen.has(id)) fail(path, `${id} is also featured on ${seen.get(id)}`);
      seen.set(id, path);
    }
  }
}

/* Every count the Home prints for a path is the number of distinct resources that path's pages render:
   Vestibular holds its exams' pages too (V0.4 §5.3). Counted from the DOM, never from the data module. */
{
  const PATH_PAGES = {
    '/ensino-medio/': ['/ensino-medio/'],
    '/vestibulares/': ['/vestibulares/', '/enem/', '/uerj/'],
    '/pre-militar/': ['/pre-militar/'],
    '/ensino-superior/': ['/ensino-superior/'],
    '/tecnologia/': ['/tecnologia/'],
  };
  const counted = [...HOME_PATH_COUNTS.keys()].sort();
  if (JSON.stringify(counted) !== JSON.stringify(Object.keys(PATH_PAGES).sort())) fail('/', `#objetivo counts ${counted.join(',')}`);
  for (const [href, pages] of Object.entries(PATH_PAGES)) {
    const rendered = new Set(pages.flatMap((page) => [...(PAGE_RESOURCE_IDS.get(page) ?? [])]));
    if (HOME_PATH_COUNTS.get(href) !== rendered.size) fail('/', `#objetivo says ${HOME_PATH_COUNTS.get(href)} for ${href}; its pages render ${rendered.size}`);
  }
}

/* The libraries together list exactly the resources the rest of the site renders: nothing more (no
   resource without a home), nothing less (V0.5). */
{
  const elsewhere = new Set([...PAGE_RESOURCE_IDS].filter(([page]) => !(page in LIBRARIES)).flatMap(([, ids]) => [...ids]));
  const listed = Object.keys(LIBRARIES).flatMap((page) => [...(PAGE_RESOURCE_IDS.get(page) ?? [])]);
  if (new Set(listed).size !== listed.length) fail('/cursos/ /materiais/', 'a resource is in both libraries');
  if (JSON.stringify([...new Set(listed)].sort()) !== JSON.stringify([...elsewhere].sort())) fail('/cursos/ /materiais/', `the libraries list ${listed.length}, the site renders ${elsewhere.size}`);
}

/* Resource anchors (V0.4 §5.4): every published resource has a search result, which opens the page that
   shows it at an element that is that resource; an anchor is never on anything else, and never twice. */
for (const id of PUBLISHED_RESOURCE_IDS) if (!SEARCH_RESOURCE_TARGETS.has(id)) fail('/buscar/', `no result for the published resource ${id}`);
for (const [id, href] of SEARCH_RESOURCE_TARGETS) {
  const [page] = href.split('#');
  const html = existsSync(fileFor(page)) ? readFileSync(fileFor(page), 'utf8') : '';
  const at = html.match(new RegExp(`<[a-z]+\\b[^>]*\\sid="recurso-${id}"[^>]*>`, 'g')) ?? [];
  if (at.length !== 1 || !at[0].includes(`data-resource-id="${id}"`)) fail(page, `#recurso-${id} must be the resource itself, once (${at.length})`);
}
for (const path of CANONICAL) {
  const html = existsSync(fileFor(path)) ? readFileSync(fileFor(path), 'utf8') : '';
  for (const m of html.matchAll(/<[a-z]+\b([^>]*)\sid="recurso-([^"]+)"([^>]*)>/g)) {
    if (!`${m[1]}${m[3]}`.includes(`data-resource-id="${m[2]}"`)) fail(path, `#recurso-${m[2]} is not that resource`);
  }
}

/* A #fontes link to the search filtered by institution must be a filter the built search page offers, and
   that filter must list results on more than one page (the reason it is used instead of a track link). */
{
  const search = existsSync(fileFor('/buscar/')) ? readFileSync(fileFor('/buscar/'), 'utf8') : '';
  for (const value of HOME_SEARCH_FILTERS) {
    if (!new RegExp(`<input\\b[^>]*\\sname="instituicao"[^>]*\\svalue="${value}"`).test(search)) fail('/', `#fontes leads to a search filter the search page does not offer (${value})`);
    const pages = new Set([...search.matchAll(/<li\b[^>]*\sdata-entry-id="recurso:[^"]+"[^>]*>[\s\S]*?<\/li>/g)]
      .map((m) => m[0]).filter((li) => new RegExp(`\\sdata-facet-instituicao="${value}"`).test(li)).map((li) => (hrefsIn(li)[0] ?? '').split('#')[0]));
    if (pages.size < 2) fail('/', `#fontes filters the search by ${value}, whose results are on ${pages.size} page(s): link the track instead`);
  }
}

for (const id of DEMO_RESOURCE_IDS) {
  if (!PUBLISHED_RESOURCE_IDS.has(id)) fail('/', `a product demo shows ${id}, which no page publishes`);
}
checkUnique(seenTitles, 'title');
checkUnique(seenDescriptions, 'description');

/* Redirects, gone routes and the 404. ------------------------------------------------------------- */

for (const [from, to] of Object.entries(REDIRECTS)) {
  const file = fileFor(from);
  if (!existsSync(file)) { fail(from, 'redirect page missing'); continue; }
  const html = readFileSync(file, 'utf8');
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) fail(from, 'redirect must be noindex');
  if (!new RegExp(`<meta http-equiv="refresh" content="0;\\s*url=${to.replace(/\//g, '\\/')}"`).test(html)) fail(from, `redirect must refresh to ${to}`);
  if (!CANONICAL.includes(to) || !existsSync(fileFor(to))) fail(from, `redirect target ${to} is not a canonical page`);
  if (!html.includes(`<link rel="canonical" href="${SITE}${to}">`)) fail(from, `redirect must name ${to} as canonical`);
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
    checkAccessibility('/404.html', html);
    for (const href of ['/', '/materias/', '/buscar/']) {
      if (!new RegExp(`<main[\\s\\S]*href="${href}"[\\s\\S]*</main>`).test(html)) fail('/404.html', `must offer a way to ${href}`);
    }
  }
}

const files = walk(DIST);

/* The stylesheet keeps a visible focus and honours reduced motion (spec §7). */
{
  const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n');
  if (!/:focus-visible\s*\{[^}]*outline:\s*2px/.test(css)) fail('css', 'a visible :focus-visible outline is required');
  // The institutional header and footer stand on the brand wine (V0.3).
  if (!/\.site-header\[[^\]]+\]\s*\{[^}]*background:\s*var\(--brand\)|\.site-header\s*\{[^}]*background:\s*var\(--brand\)/.test(css)) fail('css', 'the header stands on the brand wine');
  if (!/\.site-footer\[[^\]]+\]\s*\{[^}]*background:\s*var\(--brand\)|\.site-footer\s*\{[^}]*background:\s*var\(--brand\)/.test(css)) fail('css', 'the footer stands on the brand wine');
  if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[^}]*transition:\s*none/.test(css)) fail('css', 'reduced motion must switch transitions off');
}

/* Sitemap and robots (spec §8.2): the sitemap lists exactly the canonical pages, absolute; no redirect,
   no 404. Compared with the hand-written list above: two independent sources must agree (spec R10). */
{
  const sitemap = join(DIST, 'sitemap.xml');
  if (!existsSync(sitemap)) fail('/sitemap.xml', 'missing');
  else {
    const xml = readFileSync(sitemap, 'utf8');
    if (!/^<\?xml version="1.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(xml)) fail('/sitemap.xml', 'not a sitemap urlset');
    const locs = attrs(xml, /<loc>([^<]+)<\/loc>/g);
    const expected = CANONICAL.map((p) => SITE + p);
    if (JSON.stringify([...locs].sort()) !== JSON.stringify([...expected].sort())) fail('/sitemap.xml', `locations differ from the canonical pages: ${locs.length} vs ${expected.length}`);
  }
  const robots = join(DIST, 'robots.txt');
  if (!existsSync(robots)) fail('/robots.txt', 'missing');
  else if (!readFileSync(robots, 'utf8').includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('/robots.txt', 'must point to the sitemap');
}

/* The whole of dist/. ----------------------------------------------------------------------------- */

const known = new Set([...CANONICAL, ...PREPARING, ...Object.keys(REDIRECTS)].map((p) => fileFor(p)).concat(join(DIST, '404.html')));
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

/* The release inventory (Academy incremental release). An independent reading of the same manifests the
 * build projects from: the resources dist shows are exactly the ones release.json declares, and no id an
 * applied lot suspended survives anywhere in dist (page, anchor, search data, asset name). A release
 * manifest in simulation mode never passes here unless the simulation itself asks for it. */
{
  const RELEASE_DIR = new URL('../src/data/academy-release/', import.meta.url).pathname;
  const release = JSON.parse(readFileSync(join(RELEASE_DIR, 'release.json'), 'utf8'));
  if (release.mode !== 'production' && process.env.ACADEMY_RELEASE_SIMULATION !== '1') {
    fail('release.json', `mode ${release.mode}: a simulated release is never published`);
  }
  const shown = new Set();
  for (const f of files.filter((f) => f.endsWith('.html'))) {
    for (const m of readFileSync(f, 'utf8').matchAll(/\sdata-resource-id="([^"]+)"/g)) shown.add(m[1]);
  }
  const declared = new Set(release.inventory);
  for (const id of declared) if (!shown.has(id)) fail('release.json', `inventory: ${id} is declared but no page shows it`);
  for (const id of shown) if (!declared.has(id)) fail('release.json', `inventory: ${id} is shown but not declared`);
  const suspended = [];
  for (const { lot } of release.applied) {
    const file = join(RELEASE_DIR, 'lots', `${lot}.json`);
    if (!existsSync(file)) { fail('release.json', `${lot} is applied but has no manifest`); continue; }
    for (const s of JSON.parse(readFileSync(file, 'utf8')).suspensions ?? []) suspended.push(s.id);
  }
  // A later lot may re-approve a suspended id; only ids still out of the inventory must be absent.
  const absent = suspended.filter((id) => !declared.has(id));
  for (const f of files.filter((f) => /\.(html|js|json|xml|txt)$/.test(f) || f.includes('/_astro/'))) {
    const name = relative(DIST, f).split(sep).join('/');
    const text = /\.(html|js|json|xml|txt|css|svg)$/.test(f) ? readFileSync(f, 'utf8') : '';
    for (const id of absent) {
      // The id as a token of its own, or after the generated `recurso-` prefix (anchors and their links);
      // never as part of a longer id.
      const re = new RegExp(`(?:(?<![\\w-])|(?<=recurso-))${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
      if (re.test(text) || re.test(name)) fail('/' + name, `the suspended resource ${id} is still in dist`);
    }
  }
}

if (errors.length) {
  console.error(`verify-dist: ${errors.length} problem(s)\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`verify-dist: ${CANONICAL.length} pages, ${PREPARING.length} in preparation, ${Object.keys(REDIRECTS).length} redirects, 404, ${files.length} files — all invariants hold.`);
