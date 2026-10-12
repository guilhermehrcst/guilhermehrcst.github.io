import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const [, , BASE, DIST, LABEL, OUT] = process.argv;
const RES = JSON.parse(readFileSync(new URL('./records.json', import.meta.url), 'utf8'));
const sitemap = readFileSync(`${DIST}/sitemap.xml`, 'utf8');
const PAGES = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const rows = []; const ok = (n, c, d = '') => rows.push({ n, ok: !!c, d: c ? '' : String(d).slice(0, 300) });
const b = await chromium.launch();
for (const w of [360, 1280]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage(); const external = new Set(); const errs = [];
  p.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') external.add(u.host); });
  p.on('pageerror', (e) => errs.push(String(e)));
  for (const path of PAGES) {
    const resp = await p.goto(BASE + path, { waitUntil: 'load' });
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h1: document.querySelectorAll('h1').length, robots: document.querySelector('meta[name=robots]')?.content ?? '' }));
    ok(`${w} ${path} 200`, resp.status() === 200, resp.status());
    ok(`${w} ${path} no horizontal overflow`, m.sw <= m.cw, `${m.sw}>${m.cw}`);
    ok(`${w} ${path} one h1`, m.h1 === 1, m.h1);
    ok(`${w} ${path} indexable`, !/noindex/.test(m.robots), m.robots);
  }
  for (const path of ['/ensino-fundamental/', '/pre-militar/']) {
    await p.goto(BASE + path);
    const items = await p.$$eval('[data-resource-id]', (els) => els.map((e) => ({ id: e.getAttribute('data-resource-id'), links: [...e.querySelectorAll('a[href^="http"]')].map((a) => ({ href: a.href, target: a.target, rel: a.rel })), visible: e.getBoundingClientRect().height > 0 })));
    ok(`${w} ${path} shows resources`, items.length > 0, 'none');
    for (const it of items) {
      ok(`${w} ${path} ${it.id} visible`, it.visible);
      ok(`${w} ${path} ${it.id} one external link`, it.links.length === 1, JSON.stringify(it.links));
      const l = it.links[0] ?? {};
      ok(`${w} ${path} ${it.id} official URL`, l.href === RES[it.id], `${l.href} vs ${RES[it.id]}`);
      ok(`${w} ${path} ${it.id} new tab, noopener noreferrer`, l.target === '_blank' && /noopener/.test(l.rel) && /noreferrer/.test(l.rel), JSON.stringify(l));
    }
    const text = await p.evaluate(() => document.querySelector('main').innerText);
    ok(`${w} ${path} no Destaques section`, !(await p.$('#destaques')), 'present');
    ok(`${w} ${path} no preparation copy`, !/em prepara[çc][ãa]o/i.test(text), text.match(/.{0,40}em prepara.{0,40}/i)?.[0]);
    if (w === 360) await p.screenshot({ path: `${OUT}/${LABEL}${path.replaceAll('/', '_')}360.png`, fullPage: true });
  }
  for (const [path, id] of [['/ensino-fundamental/', 'ef-obmep-fracoes-6'], ['/pre-militar/', 'ita-provas-anteriores']]) {
    await p.goto(`${BASE}${path}#recurso-${id}`);
    // The site scrolls smoothly: wait until the scroll has settled before measuring.
    for (let last = -1, i = 0; i < 20; i++) { await p.waitForTimeout(150); const y = await p.evaluate(() => scrollY); if (y === last) break; last = y; }
    const inView = await p.evaluate((id) => { const r = document.getElementById(`recurso-${id}`)?.getBoundingClientRect(); return !!r && r.top >= -2 && r.top < innerHeight; }, id);
    ok(`${w} ${path}#recurso-${id} anchor lands on the resource`, inView);
  }
  ok(`${w} no external request`, external.size === 0, [...external].join(' '));
  ok(`${w} no page error`, errs.length === 0, errs.join(' | '));
  await ctx.close();
}
// Search: the published ids are found and open their page at their anchor; the suspended one is not.
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
await p.goto(BASE + '/buscar/');
const idx = await p.evaluate(() => [...document.querySelectorAll('[data-resource-id]')].map((e) => e.getAttribute('data-resource-id')));
const html = await p.content();
for (const id of Object.keys(RES)) {
  const expected = JSON.parse(readFileSync(new URL('./expected.json', import.meta.url), 'utf8'))[LABEL];
  const shown = html.includes(`recurso-${id}`) || idx.includes(id);
  ok(`search ${id} ${expected.includes(id) ? 'present' : 'absent'}`, shown === expected.includes(id), `shown=${shown}`);
}
await b.close();
writeFileSync(`${OUT}/qa-${LABEL}.json`, JSON.stringify({ label: LABEL, pages: PAGES.length, checks: rows.length, failed: rows.filter((r) => !r.ok) }, null, 2));
console.log(LABEL, 'pages', PAGES.length, 'checks', rows.length, 'failed', rows.filter((r) => !r.ok).length);
for (const r of rows.filter((r) => !r.ok).slice(0, 15)) console.log(' FAIL', r.n, r.d);
