// Hotfix QA: where each of the six header menus opens. Measures geometry; prints problems (P) and a table (R).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
const B = 'http://localhost:4611/pexis-academy';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const IDS = ['ensino-fundamental', 'ensino-medio', 'pre-militar', 'vestibulares', 'ensino-superior', 'tecnologia'];
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const P = []; const R = [];
const browsers = { chromium: await chromium.launch(), noAnchorApi: await chromium.launch({ args: ['--disable-features=CSSAnchorPositioning'] }) };

const measure = (p, id) => p.evaluate((id) => {
  const panel = document.getElementById(`menu-${id}`), btn = document.querySelector(`.trigger[data-path="${id}"]`), bar = document.querySelector('.bar');
  const a = panel.getBoundingClientRect(), k = btn.getBoundingClientRect(), cs = getComputedStyle(bar);
  return { open: panel.matches(':popover-open'), align: panel.dataset.align ?? null, pl: a.left, pr: a.right, pt: a.top, pb: a.bottom, bl: k.left, br: k.right, bb: k.bottom, cw: document.documentElement.clientWidth, ch: innerHeight, edgeL: parseFloat(cs.paddingLeft), edgeR: parseFloat(cs.paddingRight), sw: document.documentElement.scrollWidth, headerH: document.querySelector('.site-header').getBoundingClientRect().height, mainTop: document.querySelector('main').getBoundingClientRect().top };
}, id);

const verify = (label, m, { expectPlaced = true } = {}) => {
  const tol = 1;
  if (!m.open) { P.push(`${label}: did not open`); return; }
  if (m.pt < m.bb - tol || m.pt - m.bb > 16) P.push(`${label}: not directly under its button (${(m.pt - m.bb).toFixed(1)}px)`);
  if (m.pl < m.edgeL - tol) P.push(`${label}: left margin broken (${m.pl.toFixed(1)} < ${m.edgeL})`);
  if (m.pr > m.cw - m.edgeR + tol) P.push(`${label}: right margin broken (${m.pr.toFixed(1)} > ${m.cw - m.edgeR})`);
  if (m.pb > m.ch + tol) P.push(`${label}: below the viewport`);
  if (m.sw > m.cw) P.push(`${label}: horizontal overflow ${m.sw - m.cw}`);
  if (expectPlaced) {
    if (!(m.pl <= m.br + tol && m.pr >= m.bl - tol)) P.push(`${label}: does not overlap its button horizontally`);
    const clampedRight = Math.abs(m.pr - (m.cw - m.edgeR)) <= tol, clampedLeft = Math.abs(m.pl - m.edgeL) <= tol;
    if (m.align === 'start' && !(Math.abs(m.pl - m.bl) <= tol || clampedRight)) P.push(`${label}: start-aligned but left ${m.pl.toFixed(1)} vs button ${m.bl.toFixed(1)}`);
    if (m.align === 'end' && !(Math.abs(m.pr - m.br) <= tol || clampedLeft)) P.push(`${label}: end-aligned but right ${m.pr.toFixed(1)} vs button ${m.br.toFixed(1)}`);
    if (!m.align) P.push(`${label}: not placed by the script`);
  }
};

const run = async (engine, [w, h], page, { touch = false } = {}) => {
  const ctx = await browsers[engine].newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? IPAD_UA : undefined });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(B + page, { waitUntil: 'networkidle' });
  const closed = await p.evaluate(() => ({ headerH: document.querySelector('.site-header').getBoundingClientRect().height, mainTop: document.querySelector('main').getBoundingClientRect().top, sw: document.documentElement.scrollWidth }));
  for (const id of IDS) {
    const label = `${engine} ${w}x${h}${touch ? ' touch' : ''} ${page} ${id}`;
    await (touch ? p.tap(`.trigger[data-path="${id}"]`) : p.click(`.trigger[data-path="${id}"]`));
    await p.waitForTimeout(220);
    const m = await measure(p, id); verify(label, m);
    if (m.headerH !== closed.headerH || Math.abs(m.mainTop - closed.mainTop) > 0.5) P.push(`${label}: layout moved when open (header ${closed.headerH}->${m.headerH}, main ${closed.mainTop}->${m.mainTop})`);
    R.push([engine, `${w}x${h}${touch ? 't' : ''}`, page, id, m.align, Math.round(m.bl), Math.round(m.br), Math.round(m.pl), Math.round(m.pr), Math.round(m.pt - m.bb)]);
    if (id === 'tecnologia' && engine === 'chromium' && page === '/cursos/' && [1024, 1194, 1440].includes(w)) await p.screenshot({ path: `${OUT}/tecnologia-${w}${touch ? '-touch' : ''}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, 520) } });
    if (id === 'ensino-fundamental' && engine === 'chromium' && page === '/cursos/' && [1024, 1194].includes(w)) await p.screenshot({ path: `${OUT}/fundamental-${w}${touch ? '-touch' : ''}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, 520) } });
    await p.keyboard.press('Escape');
    if ((await p.evaluate(() => [...document.querySelectorAll('.panel')].some((e) => e.matches(':popover-open'))))) P.push(`${label}: Escape did not close`);
  }
  if (errs.length) P.push(`${engine} ${w} ${page}: console ${errs[0]}`);
  await ctx.close();
};

// 1. Every menu, every width, both engines (the second without Chromium's CSS anchor positioning), mouse.
for (const engine of ['chromium', 'noAnchorApi']) for (const vp of [[1024, 768], [1194, 834], [1280, 800], [1440, 900], [1920, 1080]]) for (const page of ['/', '/cursos/', '/vestibulares/']) {
  if (engine === 'noAnchorApi' && page !== '/cursos/') continue;
  await run(engine, vp, page);
}
// 2. Touch at iPad size, both orientations that show the line (landscape), and the library page with the chips.
for (const vp of [[1194, 834], [1366, 1024], [1024, 768]]) for (const page of ['/', '/cursos/']) await run('chromium', vp, page, { touch: true });

// 3. Light dismiss, own button, another menu, navigation (mouse + touch).
for (const touch of [false, true]) {
  const ctx = await browsers.chromium.newContext({ viewport: { width: 1194, height: 834 }, hasTouch: touch, isMobile: touch, userAgent: touch ? IPAD_UA : undefined });
  const p = await ctx.newPage(); await p.goto(B + '/cursos/', { waitUntil: 'networkidle' });
  const act = (sel) => (touch ? p.tap(sel) : p.click(sel)); const open = () => p.evaluate(() => [...document.querySelectorAll('.panel')].filter((e) => e.matches(':popover-open')).map((e) => e.id));
  await act('.trigger[data-path="tecnologia"]'); await p.waitForTimeout(200);
  await act('.trigger[data-path="ensino-fundamental"]'); await p.waitForTimeout(200);
  const two = await open(); if (JSON.stringify(two) !== '["menu-ensino-fundamental"]') P.push(`${touch ? 'touch' : 'mouse'}: switching menus left ${two}`);
  await (touch ? p.touchscreen.tap(600, 700) : p.mouse.click(600, 700)); await p.waitForTimeout(150);
  if ((await open()).length) P.push(`${touch ? 'touch' : 'mouse'}: outside click did not close`);
  await act('.trigger[data-path="tecnologia"]'); await p.waitForTimeout(200);
  await Promise.all([p.waitForNavigation(), act('#menu-tecnologia a[data-entry="cursos"]')]);
  if ((await open()).length) P.push(`${touch ? 'touch' : 'mouse'}: menu open after navigation`);
  if (!p.url().endsWith('/cursos/?caminho=tecnologia#cursos-tecnologia')) P.push(`${touch ? 'touch' : 'mouse'}: navigated to ${p.url()}`);
  await ctx.close();
}

// 4. The viewport changes while a menu is open (resize, an iPad turned): the panel is placed again.
{
  const ctx = await browsers.chromium.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto(B + '/cursos/', { waitUntil: 'networkidle' });
  await p.click('.trigger[data-path="tecnologia"]'); await p.waitForTimeout(200);
  for (const [w, h] of [[1194, 834], [1100, 800], [1280, 800]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(250); verify(`resize ${w}x${h} tecnologia`, await measure(p, 'tecnologia')); }
  await p.setViewportSize({ width: 820, height: 1180 }); await p.waitForTimeout(250);
  if (await p.evaluate(() => document.getElementById('menu-tecnologia').checkVisibility())) P.push('resize to 820: the desktop menu is still visible');
  await ctx.close();
}

// 5. Without JavaScript: no script, so no button box; the panel still opens, inside the viewport, under the header.
for (const [w, h] of [[1024, 768], [1194, 834], [1440, 900]]) {
  const ctx = await browsers.chromium.newContext({ viewport: { width: w, height: h }, javaScriptEnabled: false }); const p = await ctx.newPage();
  await p.goto(B + '/cursos/', { waitUntil: 'networkidle' });
  for (const id of ['ensino-fundamental', 'tecnologia']) {
    await p.click(`.trigger[data-path="${id}"]`); await p.waitForTimeout(200);
    const bx = await p.locator(`#menu-${id}`).boundingBox(); const bar = await p.locator('.bar').boundingBox();
    if (!bx) { P.push(`no-JS ${w} ${id}: did not open`); continue; }
    if (bx.x < 0 || bx.x + bx.width > w || bx.y < bar.height - 4 || bx.y + bx.height > h) P.push(`no-JS ${w} ${id}: outside the viewport / over the header ${JSON.stringify(bx)}`);
    R.push(['no-JS', `${w}x${h}`, '/cursos/', id, '-', '-', '-', Math.round(bx.x), Math.round(bx.x + bx.width), Math.round(bx.y)]);
    if (id === 'tecnologia' && w === 1194) await p.screenshot({ path: `${OUT}/tecnologia-1194-no-js.png`, clip: { x: 0, y: 0, width: w, height: 520 } });
    await p.keyboard.press('Escape');
  }
  await ctx.close();
}

// 6. The compact menu is untouched at phone and iPad-portrait widths: no desktop panel, the sheet opens.
for (const [w, h] of [[390, 844], [820, 1180]]) {
  const ctx = await browsers.chromium.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  await p.goto(B + '/', { waitUntil: 'networkidle' });
  if (await p.evaluate(() => [...document.querySelectorAll('.desktop .trigger')].some((e) => e.checkVisibility()))) P.push(`${w}: desktop buttons visible`);
  await p.tap('.mobile > summary'); await p.tap('details[data-menu="mobile-tecnologia"] > summary');
  const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, open: document.querySelector('details[data-menu="mobile-tecnologia"]').open, links: document.querySelectorAll('details[data-menu="mobile-tecnologia"] a').length }));
  if (!m.open || m.links !== 2 || m.sw > m.cw) P.push(`${w}: compact menu ${JSON.stringify(m)}`);
  await ctx.close();
}

for (const b of Object.values(browsers)) await b.close();
console.log('engine  viewport   page         path                align  btnL btnR panL panR gap');
for (const r of R) console.log(r.map((x) => String(x).padEnd(8)).join(' '));
console.log('PROBLEMS', P.length); for (const x of P.slice(0, 40)) console.log(' -', x);
