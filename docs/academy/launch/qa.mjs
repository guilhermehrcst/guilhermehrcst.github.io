// Browser QA of a rehearsed launch build (SIMULAÇÃO): docs/academy/launch/rehearse.sh, then
//   node docs/academy/launch/qa.mjs <base-url> <rehearsal-dir> <label> [out-dir]
// Every page of the sitemap at 360 and 1280 px: HTTP 200, one h1, no horizontal overflow, indexable.
// Each resource of the plan: on the page placement gives it, its anchor lands on it, it is visible, it
// has exactly one external link, equal to its record's URL, opening in a new tab with noopener
// noreferrer; the search finds it. No request leaves the site and no page throws. Exits 1 on a failure.
// Playwright is not a dependency of the site: PLAYWRIGHT names its module when it is installed elsewhere.
const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');
import { readFileSync, writeFileSync } from 'node:fs';
const [, , BASE, DIR, LABEL, OUT = '.'] = process.argv;
const plan = JSON.parse(readFileSync(`${DIR}/plan-placement.json`, 'utf8'));
const sitemap = readFileSync(`${DIR}/dist/sitemap.xml`, 'utf8');
const PAGES = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const rows = [];
const ok = (name, pass, detail = '') => rows.push({ name, ok: !!pass, detail: pass ? '' : String(detail).slice(0, 300) });
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
for (const width of [360, 1280]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  const external = new Set(); const errors = [];
  page.on('request', (r) => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') external.add(u.host); });
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const path of PAGES) {
    const response = await page.goto(BASE + path, { waitUntil: 'load' });
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h1: document.querySelectorAll('h1').length, robots: document.querySelector('meta[name=robots]')?.content ?? '' }));
    ok(`${width} ${path} 200`, response.status() === 200, response.status());
    ok(`${width} ${path} no horizontal overflow`, m.sw <= m.cw, `${m.sw}>${m.cw}`);
    ok(`${width} ${path} one h1`, m.h1 === 1, m.h1);
    ok(`${width} ${path} indexable`, !/noindex/.test(m.robots), m.robots);
  }
  for (const [id, { url, page: at }] of Object.entries(plan)) {
    await page.goto(`${BASE}${at}#recurso-${id}`);
    for (let last = -1, i = 0; i < 20; i++) { await page.waitForTimeout(150); const y = await page.evaluate(() => scrollY); if (y === last) break; last = y; }
    const item = await page.evaluate((id) => {
      const el = document.getElementById(`recurso-${id}`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, height: r.height, resource: el.getAttribute('data-resource-id'), links: [...el.querySelectorAll('a[href^="http"]')].map((a) => ({ href: a.href, target: a.target, rel: a.rel })) };
    }, id);
    ok(`${width} ${at}#recurso-${id} exists, is the resource`, item && item.resource === id, JSON.stringify(item));
    if (!item) continue;
    ok(`${width} ${id} anchor lands in view`, item.top >= -2 && item.top < 900 && item.height > 0, `top ${item.top}`);
    ok(`${width} ${id} one external link`, item.links.length === 1, JSON.stringify(item.links));
    const link = item.links[0] ?? {};
    ok(`${width} ${id} links its record's URL`, link.href === new URL(url).href, `${link.href} vs ${url}`);
    ok(`${width} ${id} new tab, noopener noreferrer`, link.target === '_blank' && /noopener/.test(link.rel) && /noreferrer/.test(link.rel), JSON.stringify(link));
  }
  ok(`${width} no external request`, external.size === 0, [...external].join(' '));
  ok(`${width} no page error`, errors.length === 0, errors.join(' | '));
  await context.close();
}
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
await page.goto(BASE + '/buscar/');
const html = await page.content();
for (const id of Object.keys(plan)) ok(`search finds ${id}`, html.includes(`recurso-${id}`), 'absent');
await browser.close();
const failed = rows.filter((r) => !r.ok);
writeFileSync(`${OUT}/qa-${LABEL}.json`, JSON.stringify({ label: LABEL, pages: PAGES.length, resources: Object.keys(plan).length, checks: rows.length, failed }, null, 2) + '\n');
console.log(LABEL, 'pages', PAGES.length, 'checks', rows.length, 'failed', failed.length);
for (const r of failed.slice(0, 20)) console.log(' FAIL', r.name, r.detail);
if (failed.length) process.exitCode = 1;
