import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const BASE = process.argv[2] ?? 'http://127.0.0.1:4321';
const OUT = process.argv[3] ?? '/tmp/claude-0/qa/d';
const NINE = ['mit-1801sc','mit-801sc','mit-7012','yale-psyc-110','yale-econ-252','ou-environment-treading-lightly','odin-foundations','google-mlcc','ms-learn-cloud-concepts'];
const expectNine = process.argv[4] === 'rc';
const b = await chromium.launch(); const rows = []; const ok = (n, c, d = '') => rows.push({ n, ok: !!c, d: c ? '' : d });
for (const width of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width, height: 800 } }); const p = await ctx.newPage();
  await p.goto(`${BASE}/buscar/`);
  const entries = await p.$$eval('[data-entry-id^="recurso:"] a', (as) => as.map((a) => ({ id: a.closest('[data-entry-id]').dataset.entryId.replace(/^recurso:+/, ""), href: a.getAttribute('href') })));
  if (width === 390) console.log('search resource entries', entries.length);
  let bad = 0;
  for (const e of entries) {
    await p.goto(`${BASE}/buscar/`);
    await p.click(`[data-entry-id$=":${e.id}"][data-entry-id^="recurso"] a`);
    await p.waitForLoadState('load'); await p.waitForFunction(() => new Promise((res) => { let last = -1, n = 0; const t = setInterval(() => { if (scrollY === last && ++n >= 3) { clearInterval(t); res(true); } else if (scrollY !== last) { n = 0; last = scrollY; } }, 100); }), null, { timeout: 8000 });
    const r = await p.evaluate((id) => {
      const el = document.getElementById(`recurso-${id}`); if (!el) return { exists: false, hash: location.hash };
      const hdr = [...document.querySelectorAll('header')].find((h) => ['sticky', 'fixed'].includes(getComputedStyle(h).position));
      const top = el.getBoundingClientRect().top; const hb = hdr ? hdr.getBoundingClientRect().bottom : 0;
      return { exists: true, hash: location.hash, top, hb, inView: top < innerHeight, text: el.textContent.trim().slice(0, 60) };
    }, e.id);
    const good = r.exists && r.hash === `#recurso-${e.id}` && r.top >= r.hb - 1 && r.inView;
    if (!good) { bad++; await p.screenshot({ path: `${OUT}/anchor-fail-${width}-${e.id}.png` }); }
    ok(`D1@${width} ${e.id} → ${e.href}`, good, JSON.stringify(r));
  }
  await ctx.close();
}
// Search and filters
{
  const p = await b.newPage();
  await p.goto(`${BASE}/buscar/`);
  const vis = () => p.$$eval('[data-search-entry]', (es) => es.filter((e) => e.offsetParent !== null).map((e) => e.dataset.entryId));
  await p.fill('[data-search-input] input, input[data-search-input]', 'python');
  await p.waitForTimeout(300);
  const py = await vis(); ok('D2 query "python" finds cs50p and only python-related', py.some((i) => i.endsWith(':cs50p')) && py.length < 20, py.join(','));
  await p.fill('[data-search-input] input, input[data-search-input]', '');
  await p.click('details[data-search-filters] > summary'); await p.check('input[name="caminho"][value="tecnologia"]'); await p.waitForTimeout(200);
  const tech = await vis(); ok('D3 filter caminho=tecnologia shows only tech entries', tech.length > 0 && tech.every((i) => i.startsWith('recurso:')), tech.length);
  ok('D4 filter state in URL', /caminho=tecnologia/.test(p.url()), p.url());
  await p.goto(`${BASE}/buscar/?caminho=nao-existe&formato=xyz`); await p.waitForTimeout(200);
  ok('D5 unknown URL facet values are dropped', !/nao-existe|xyz/.test(p.url()), p.url());
  await p.goto(`${BASE}/buscar/?q=zzzzqqq`); await p.waitForTimeout(200);
  ok('D6 empty state visible for no results', await p.isVisible('[data-search-empty]') || await p.isVisible('[data-search-empty-filtered]'));
  await p.close();
}
// Legacy routes
{
  const p = await b.newPage();
  for (const [from, to] of [['/courses/', '/materias/'], ['/courses/enem/', '/enem/'], ['/courses/uerj/', '/uerj/'], ['/pt/', '/'], ['/pt/cursos/', '/materias/'], ['/pt/cursos/enem/', '/enem/'], ['/pt/cursos/uerj/', '/uerj/']]) {
    await p.goto(`${BASE}${from}`); await p.waitForURL(`${BASE}${to}`, { timeout: 5000 }).catch(() => {});
    ok(`D7 ${from} → ${to}`, new URL(p.url()).pathname === to, p.url());
  }
  const r404 = await p.goto(`${BASE}/nao-existe/`); ok('D8 unknown route serves 404', r404.status() === 404, r404.status());
  await p.close();
}
// Unreleased destinations and copy
{
  const p = await b.newPage(); const html = {};
  for (const path of ['/', '/ensino-superior/', '/tecnologia/', '/buscar/']) { await p.goto(`${BASE}${path}`); html[path] = await p.content(); }
  for (const id of NINE) ok(`D9 ${id} anchor ${expectNine ? 'present' : 'absent'}`, expectNine === Object.values(html).some((h) => h.includes(`id="recurso-${id}"`)));
  const cloud = /Computação em Nuvem|Nuvem/i.test(await (await p.goto(`${BASE}/tecnologia/`), p.innerText('main')));
  ok(`D10 cloud track ${expectNine ? 'shown' : 'not shown'} on /tecnologia/`, cloud === expectNine);
  await p.goto(`${BASE}/ensino-superior/`); const sup = await p.innerText('main');
  const groups = ['Física', 'Biologia', 'Psicologia', 'Economia', 'Meio ambiente'].filter((g) => new RegExp(`\\b${g}\\b`, 'i').test(sup));
  ok(`D11 Superior shows ${expectNine ? 'all new' : 'no unreleased'} groups`, expectNine ? groups.length === 5 : groups.length === 0, groups.join(','));
  await p.goto(`${BASE}/`);
  // The Home intentionally summarizes seven subjects as "Matemática, Computação e mais 5 áreas".
  // Test the actual `Ensino Superior` objective copy in both staging and RC,
  // instead of incorrectly looking for all seven full labels in condensed text.
  const homeSummary = (await p.locator('.objectives a[href="/ensino-superior/"] .what').innerText())
    .replace(/\\s+/g, ' ').trim();
  const mentionsFiveNewAreas = /Matemática,\\s*Computação\\s+e\\s+mais\\s+5\\s+áreas/i.test(homeSummary);
  const staleCopy = /Por enquanto|somente Matemática e Computação/i.test(homeSummary);
  ok(`D12 Home Superior summary ${expectNine ? 'reflects 5 published new fields' : 'does not advertise unreleased fields'}`,
    expectNine ? mentionsFiveNewAreas && !staleCopy : !mentionsFiveNewAreas,
    homeSummary);
  console.log('SUPERIOR_TEXT', sup.replace(/\s+/g, ' ').slice(0, 700));
  await p.close();
}
await b.close();
for (const r of rows.filter((r) => !r.ok)) console.log('FAIL', r.n, r.d);
console.log(`${rows.filter((r) => r.ok).length}/${rows.length} pass`);
if (rows.some((r) => !r.ok)) process.exitCode = 1; // A QA gate must fail its process on a regression.
