// Run: node phaseE.mjs [candidate-base] [main-base] [evidence-dir] [staging|rc]
// Fetch the sitemap from the live preview under test; never use an unrelated checkout's dist.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const BASE = (process.argv[2] ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
const MAIN = (process.argv[3] ?? 'http://127.0.0.1:4322').replace(/\/$/, '');
const OUT = resolve(process.argv[4] ?? './qa-phaseE');
const MODE = process.argv[5] ?? 'staging';
if (!['staging', 'rc'].includes(MODE)) throw new Error('phaseE: mode must be staging or rc');
mkdirSync(`${OUT}/shots`, { recursive: true });
const sitemapResponse = await fetch(`${BASE}/sitemap.xml`);
if (!sitemapResponse.ok) throw new Error(`phaseE: candidate sitemap unavailable (${sitemapResponse.status})`);
const sitemap = await sitemapResponse.text();
const sitemapPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!sitemapPages.length) throw new Error('phaseE: empty candidate sitemap');
const PAGES = [...new Set([...sitemapPages, '/ensino-fundamental/', '/pre-militar/', '/nao-existe/'])];
const WIDTHS = [320, 360, 390, 768, 1024, 1440];
const SHOT = new Set(['/', '/ensino-superior/', '/tecnologia/', '/buscar/', '/ensino-fundamental/', '/pre-militar/', '/vestibulares/', '/ensino-medio/', '/enem/', '/materias/matematica/', '/nao-existe/']);
const rows = []; const ok = (n, c, d = '') => rows.push({ n, ok: !!c, d: c ? '' : String(d).slice(0, 300) });
const b = await chromium.launch();
const lum = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0]; const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
console.log('pages', PAGES.length);
for (const w of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const external = new Set();
  p.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') external.add(u.host); });
  const consoleErr = []; p.on('pageerror', (e) => consoleErr.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) consoleErr.push(m.text()); });
  for (const path of PAGES) {
    const resp = await p.goto(BASE + path, { waitUntil: 'load' });
    const m = await p.evaluate(() => {
      const de = document.documentElement;
      const overflowers = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 3).map((e) => e.tagName + '.' + e.className);
      const targets = [...document.querySelectorAll('a[href], button, summary, input, select')].filter((e) => e.offsetParent !== null).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.textContent || e.getAttribute('aria-label') || e.name || '').trim().slice(0, 30), w: r.width, h: r.height, inline: getComputedStyle(e).display === 'inline' && e.closest('p,li') && e.tagName === 'A' }; });
      const small = targets.filter((t) => !t.inline && (t.h < 24 || t.w < 24));
      const imgsNoAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).length;
      const h1 = document.querySelectorAll('h1').length;
      const textEls = [...document.querySelectorAll('p, li, a, h1, h2, h3, span, label, summary, dt, dd')].filter((e) => e.offsetParent !== null && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).slice(0, 400)
        .map((e) => { const cs = getComputedStyle(e); let bg = 'rgba(0, 0, 0, 0)', x = e; while (x && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { bg = getComputedStyle(x).backgroundColor; x = x.parentElement; } return { fg: cs.color, bg, size: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 700, t: e.textContent.trim().slice(0, 25), img: x && getComputedStyle(x).backgroundImage !== 'none' }; });
      return { sw: de.scrollWidth, cw: de.clientWidth, overflowers, small: small.slice(0, 4), nSmall: small.length, imgsNoAlt, h1, lang: de.lang, textEls,
        canonical: document.querySelector('link[rel=canonical]')?.href ?? null, robots: document.querySelector('meta[name=robots]')?.content ?? null, title: document.title };
    });
    const tag = `${w} ${path}`;
    ok(`E1 no horizontal overflow ${tag}`, m.sw <= m.cw, `${m.sw}>${m.cw} ${m.overflowers.join(' ')}`);
    ok(`E2 one h1, lang=pt-BR ${tag}`, m.h1 === 1 && /^pt/.test(m.lang), `${m.h1} ${m.lang}`);
    ok(`E3 images have alt ${tag}`, m.imgsNoAlt === 0, m.imgsNoAlt);
    ok(`E4 targets ≥24×24 (WCAG 2.5.8) ${tag}`, m.nSmall === 0, JSON.stringify(m.small));
    const lowC = m.textEls.filter((e) => !e.img).map((e) => { const a = lum(e.fg), c = lum(e.bg); const r = (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05); return { ...e, r }; }).filter((e) => e.r < ((e.size >= 24 || (e.size >= 18.66 && e.bold)) ? 3 : 4.5));
    ok(`E5 text contrast AA ${tag}`, lowC.length === 0, JSON.stringify(lowC.slice(0, 3).map((e) => [e.t, e.fg, e.bg, e.r.toFixed(2)])));
    if (w === 1440) {
      const st = resp.status();
      const isPrep = MODE === 'staging' && ['/ensino-fundamental/', '/pre-militar/'].includes(path);
      ok(`E6 status ${path}`, path === '/nao-existe/' ? st === 404 : st === 200, st);
      if (path !== '/nao-existe/') {
        ok(`E7 canonical ${path}`, isPrep
          ? m.canonical === null
          : m.canonical === `https://guilhermehrcst.github.io${path}`, m.canonical);
        ok(`E8 robots ${path}`, isPrep ? /noindex/.test(m.robots ?? '') : !/noindex/.test(m.robots ?? ''), m.robots);
        ok(`E9 sitemap ${path}`, isPrep ? !sitemap.includes(path === '/' ? 'xx' : path) : sitemap.includes(`https://guilhermehrcst.github.io${path}<`), path);
      }
    }
    if (SHOT.has(path)) await p.screenshot({ path: `${OUT}/shots/${w}${path.replaceAll('/', '_') || '_'}.png`, fullPage: w <= 390 || w === 1440 });
  }
  ok(`E10 no external requests at ${w}`, external.size === 0, [...external].join(','));
  ok(`E11 no console/page errors at ${w}`, consoleErr.length === 0, consoleErr.slice(0, 3).join(' | '));
  await ctx.close();
}
// Keyboard focus visibility on Home, Busca, Superior
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const path of ['/', '/buscar/', '/ensino-superior/', '/tecnologia/']) {
    await p.goto(BASE + path); let invisible = 0, n = 0;
    for (let i = 0; i < 25; i++) {
      await p.keyboard.press('Tab');
      const f = await p.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const cs = getComputedStyle(e); return { tag: e.tagName, o: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, bs: cs.boxShadow !== 'none' }; });
      if (!f) continue; n++; if (!f.o && !f.bs) invisible++;
    }
    ok(`E12 focus visible on ${n} tab stops ${path}`, invisible === 0 && n > 0, `${invisible}/${n} without outline`);
  }
  // skip link
  await p.goto(BASE + '/'); await p.keyboard.press('Tab');
  const first = await p.evaluate(() => ({ t: document.activeElement.textContent.trim(), href: document.activeElement.getAttribute('href') }));
  ok('E13 first tab stop is a skip link', /conte[úu]do|pular/i.test(first.t) || first.href?.startsWith('#'), JSON.stringify(first));
  await p.close();
}
// No-JS
{
  const ctx = await b.newContext({ javaScriptEnabled: false }); const p = await ctx.newPage();
  await p.goto(BASE + '/buscar/'); const n = await p.$$eval('[data-search-entry]', (es) => es.filter((e) => e.offsetParent !== null).length);
  ok('E14 no-JS: search shows the full directory', n >= 71, n);
  await p.goto(BASE + '/'); ok('E15 no-JS: Home renders main content', (await p.innerText('main')).length > 500);
  await p.goto(BASE + '/'); await p.setViewportSize({ width: 390, height: 800 });
  const menu = await p.$('details[data-menu="mobile"]'); ok('E16 no-JS: mobile menu is native details', !!menu);
  await ctx.close();
}
// Reduced motion
{
  const ctx = await b.newContext({ reducedMotion: 'reduce' }); const p = await ctx.newPage(); await p.goto(BASE + '/');
  const anim = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const cs = getComputedStyle(e); return (parseFloat(cs.animationDuration) > 0.01 && cs.animationName !== 'none') || parseFloat(cs.transitionDuration) > 0.01; }).length);
  const sb = await p.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  ok('E17 reduced motion: no animations/transitions', anim === 0, anim);
  ok('E17b reduced motion: no smooth scroll', sb !== 'smooth', sb);
  await ctx.close();
}
// Internal links resolve
{
  const p = await b.newPage(); const hrefs = new Set();
  for (const path of PAGES.slice(0, -1)) { await p.goto(BASE + path); (await p.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))).forEach((h) => hrefs.add(h)); }
  const internal = [...hrefs].filter((h) => h.startsWith('/')); const broken = [];
  for (const h of internal) { const r = await p.request.get(BASE + h.split('#')[0]); if (r.status() !== 200) broken.push(`${h}:${r.status()}`); }
  ok(`E18 ${internal.length} internal links resolve`, broken.length === 0, broken.join(','));
  const ext = [...hrefs].filter((h) => /^https?:/.test(h));
  ok('E19 external links are https', ext.every((h) => h.startsWith('https://')), ext.filter((h) => !h.startsWith('https://')).join(','));
  const unsafe = []; for (const path of PAGES.slice(0, -1)) { await p.goto(BASE + path); unsafe.push(...await p.$$eval('a[target=_blank]', (as) => as.filter((a) => !/noopener/.test(a.rel)).map((a) => a.href))); }
  ok('E20 target=_blank links carry rel=noopener', unsafe.length === 0, unsafe.slice(0, 3).join(','));
  writeFileSync(`${OUT}/external-links.txt`, ext.sort().join('\n'));
  await p.close();
}
// Visual diff vs main (V0.3/V0.4-tech baseline)
{
  const { createHash } = await import('node:crypto');
  for (const path of ['/', '/ensino-superior/', '/tecnologia/', '/buscar/', '/ensino-medio/']) for (const w of [390, 1440]) {
    const sh = async (base) => { const pg = await b.newPage({ viewport: { width: w, height: 900 } }); await pg.goto(base + path); const buf = await pg.screenshot({ fullPage: true }); await pg.close(); return buf; };
    const [a, c] = [await sh(BASE), await sh(MAIN)];
    const same = createHash('sha256').update(a).digest('hex') === createHash('sha256').update(c).digest('hex');
    if (!same) { writeFileSync(`${OUT}/shots/diff-${w}${path.replaceAll('/', '_')}-pr37.png`, a); writeFileSync(`${OUT}/shots/diff-${w}${path.replaceAll('/', '_')}-main.png`, c); }
    console.log('VISUAL', w, path, same ? 'identical to main' : 'DIFFERS from main');
  }
}
await b.close();
writeFileSync(`${OUT}/phaseE.json`, JSON.stringify(rows, null, 1));
const fails = rows.filter((r) => !r.ok);
const byKind = {}; for (const f of fails) { const k = f.n.split(' ')[0]; byKind[k] = (byKind[k] ?? 0) + 1; }
console.log('FAIL BY KIND', JSON.stringify(byKind));
for (const f of fails.slice(0, 40)) console.log('FAIL', f.n, f.d);
console.log(`${rows.length - fails.length}/${rows.length} pass`);
if (fails.length) process.exitCode = 1; // Fail the visual QA gate on any regression.
