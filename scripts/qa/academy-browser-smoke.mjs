// Browser QA for PR #37 HTML. Run only against a LOCAL Astro preview.
// Executed by an isolated GitHub Actions QA PR. Does not deploy or alter content.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE = (process.env.QA_BASE_URL || 'http://127.0.0.1:4321').replace(/\/$/, '');
const OUT = resolve('artifacts/academy-browser-qa');
const WIDTHS = [320, 390, 768, 1024, 1440];
const checks = [];
const errors = [];
await mkdir(OUT, { recursive: true });

function check(name, passed, evidence = '') {
  const record = { name, passed: Boolean(passed), evidence: String(evidence).slice(0, 350) };
  checks.push(record);
  console.log((record.passed ? 'PASS ' : 'FAIL ') + name + (record.evidence ? ' | ' + record.evidence : ''));
}
async function safe(label, fn) {
  try { await fn(); } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    check(label, false, message);
    errors.push({ label, message });
  }
}
async function ready(page, path = '/buscar/') {
  const response = await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 });
  if (!response || response.status() !== 200) throw new Error('Unexpected route HTTP status: ' + response?.status());
  await page.waitForFunction(() => {
    const form = document.querySelector('[data-search-form]');
    return form && form.hidden === false;
  }, null, { timeout: 7000 });
}
function visibleEntries(page) {
  return page.locator('[data-search-entry]:visible').evaluateAll(
    (els) => els.map((el) => ({
      id: el.getAttribute('data-entry-id'),
      caminho: el.getAttribute('data-facet-caminho'),
      instituicao: el.getAttribute('data-facet-instituicao'),
    })),
  );
}
async function noOverflow(page) {
  return page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
}

const available = await Promise.race([
  (async () => {
    for (let i = 0; i < 35; i++) {
      try { if ((await fetch(BASE + '/buscar/')).ok) return true; } catch {}
      await new Promise((res) => setTimeout(res, 500));
    }
    return false;
  })(),
]);
if (!available) throw new Error('Local Astro preview never became ready');

const launchOptions = { headless: true };
if (process.env.CHROME_PATH) launchOptions.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launchOptions);
try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: width < 640,
      hasTouch: width < 640,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (err) => errors.push({ label: 'script-error-' + width, message: err.message }));
    await safe('Search initial load @' + width, async () => {
      await ready(page);
      const facets = page.locator('details[data-facet-disclosure]');
      check('Five facet groups @' + width, await facets.count() === 5);
      check('Facets closed by default @' + width, (await facets.evaluateAll((xs) => xs.every((x) => !x.open))));
      const initial = await noOverflow(page);
      check('No horizontal overflow initial @' + width, initial.scrollWidth <= initial.viewport + 1, JSON.stringify(initial));
      if (width === 320 || width === 390 || width === 1440) {
        await page.screenshot({ path: OUT + '/search-' + width + '-default.png' });
      }
    });
    await safe('Filter interaction @' + width, async () => {
      await page.locator('details[data-search-filters] > summary').click();
      const summary = page.locator('details[data-facet-disclosure="caminho"] > summary');
      const height = await summary.evaluate((el) => Math.round(el.getBoundingClientRect().height));
      check('Facet summary touch target >=44px @' + width, height >= 44, String(height));
      await summary.click();
      const option = page.locator('input[name="caminho"][value="tecnologia"]');
      check('Technology filter visible @' + width, await option.isVisible());
      await option.check();
      await page.waitForTimeout(110);
      const entries = await visibleEntries(page);
      check('Technology filter matches only Technology resource @' + width,
        entries.length > 0 && entries.every((e) => e.id?.startsWith('recurso:') && e.caminho?.split(' ').includes('tecnologia')),
        entries.length + ' visible resources');
      check('Facet selected count = 1 @' + width,
        (await page.locator('[data-facet-disclosure="caminho"] [data-facet-count]').innerText()).trim() === '1');
      check('URL synchronized @' + width, new URL(page.url()).searchParams.getAll('caminho').includes('tecnologia'), page.url());
      const expanded = await noOverflow(page);
      check('No horizontal overflow expanded @' + width, expanded.scrollWidth <= expanded.viewport + 1, JSON.stringify(expanded));
      if (width === 320 || width === 390 || width === 1440) {
        await page.locator('[data-search-input]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: OUT + '/search-' + width + '-filtered.png' });
      }
      await summary.focus();
      const before = await page.locator('details[data-facet-disclosure="caminho"]').evaluate((el) => el.open);
      await page.keyboard.press('Enter');
      const after = await page.locator('details[data-facet-disclosure="caminho"]').evaluate((el) => el.open);
      check('Keyboard Enter toggles facet @' + width, before !== after);
      await page.keyboard.press('Enter');
      const again = await page.locator('details[data-facet-disclosure="caminho"]').evaluate((el) => el.open);
      check('Keyboard can reopen facet @' + width, again === before);
      await page.locator('form [data-filter-clear]').click();
      check('Clear filters resets URL @' + width, !new URL(page.url()).searchParams.has('caminho'));
      check('Clear resets selected count @' + width, (await page.locator('[data-facet-disclosure="caminho"] [data-facet-count]').innerText()).trim() === '');
    });

    if (width === 390 || width === 1440) {
      await safe('Shared provider deep link @' + width, async () => {
        const providerOptions = await page.locator('input[name="instituicao"]').evaluateAll((xs) => xs.map((x) => x.value));
        const provider = providerOptions.includes('mit-opencourseware') ? 'mit-opencourseware' : providerOptions[0];
        if (!provider) throw new Error('No institution facet option');
        await ready(page, '/buscar/?instituicao=' + encodeURIComponent(provider));
        check('External deep link opens parent filter @' + width,
          await page.locator('[data-search-filters]').evaluate((el) => el.open));
        check('External deep link opens selected institution facet @' + width,
          await page.locator('[data-facet-disclosure="instituicao"]').evaluate((el) => el.open));
        check('External deep link checks correct option @' + width,
          await page.locator('input[name="instituicao"][value="' + provider + '"]').isChecked(), provider);
        const entries = await visibleEntries(page);
        check('Institution filter returns correct resources @' + width,
          entries.length > 0 && entries.every((e) => e.id?.startsWith('recurso:') && e.instituicao?.split(' ').includes(provider)),
          String(entries.length));
        await page.screenshot({ path: OUT + '/search-' + width + '-provider.png' });
      });
      await safe('Text search and empty state @' + width, async () => {
        await ready(page);
        await page.locator('[data-search-input]').fill('python');
        await page.waitForTimeout(150);
        const rows = await visibleEntries(page);
        check('Python query returns expected resource @' + width, rows.some((x) => x.id?.endsWith(':cs50p')), String(rows.length));
        await page.locator('[data-search-input]').fill('zzzzqqq_404_absent');
        await page.waitForTimeout(90);
        check('No result state visible @' + width,
          await page.locator('[data-search-empty]').isVisible() || await page.locator('[data-search-empty-filtered]').isVisible());
        await ready(page, '/buscar/?caminho=nao-existe&formato=xyz');
        check('Unknown filter values removed @' + width,
          !page.url().includes('nao-existe') && !page.url().includes('xyz'));
      });
    }
    if (width === 390 || width === 1440) {
      await safe('Resource card visibility and semantics @' + width, async () => {
        const response = await page.goto(BASE + '/tecnologia/', { waitUntil: 'networkidle' });
        if (!response || response.status() !== 200) throw new Error('Technology page unavailable');
        const rows = page.locator('li.resource');
        const total = await rows.count();
        check('Technology displays legacy resources @' + width, total > 0, String(total));
        const actions = page.locator('li.resource [data-source-action]');
        check('Official source action visible @' + width, await actions.count() > 0 && await actions.first().isVisible());
        const facts = await rows.first().evaluate((el) => ({
          anchors: el.querySelectorAll('a').length,
          actionInAnchor: el.querySelector('[data-source-action]')?.closest('a') !== null,
          rel: el.querySelector('a')?.getAttribute('rel'),
          target: el.querySelector('a')?.getAttribute('target'),
        }));
        check('One official link per resource @' + width, facts.anchors === 1 && facts.actionInAnchor, JSON.stringify(facts));
        check('Outbound link has safe rel @' + width,
          facts.target === '_blank' && facts.rel?.includes('noopener') && facts.rel?.includes('noreferrer'));
        const overflow = await noOverflow(page);
        check('No overflow on Technology cards @' + width, overflow.scrollWidth <= overflow.viewport + 1, JSON.stringify(overflow));
        await page.screenshot({ path: OUT + '/resources-' + width + '.png' });
      });
    }
    await context.close();
  }
  await safe('No-JavaScript progressive enhancement @390', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, javaScriptEnabled: false });
    try {
      const page = await context.newPage();
      const response = await page.goto(BASE + '/buscar/', { waitUntil: 'load' });
      check('No JS search returns HTTP 200', response?.status() === 200);
      check('No JS filter form remains hidden', await page.locator('[data-search-form]').isHidden());
      const entries = await page.locator('[data-search-entry]:visible').count();
      check('No JS complete directory visible', entries > 37, String(entries));
      await page.screenshot({ path: OUT + '/search-no-js-390.png' });
    } finally { await context.close(); }
  });
} finally {
  await browser.close();
}
for (const x of errors) check(x.label, false, x.message);
const total = checks.length, passed = checks.filter((x) => x.passed).length, failed = total - passed;
await writeFile(OUT + '/results.json', JSON.stringify({
  source: 'Pexis Academy PR #37 staged build, dedicated QA branch',
  testedAt: new Date().toISOString(), widths: WIDTHS,
  passed, failed, total, checks, errors,
}, null, 2) + '\n');
console.log('BROWSER_QA_RESULT ' + JSON.stringify({ passed, failed, total }));
if (failed) process.exitCode = 1;
