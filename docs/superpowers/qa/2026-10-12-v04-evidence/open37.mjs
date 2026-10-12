import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const list = JSON.parse(readFileSync('/tmp/claude-0/qa/37.json', 'utf8'));
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
const ctx = await browser.newContext({ ignoreHTTPSErrors: false });
const results = [];
for (const r of list) {
  const page = await ctx.newPage();
  const res = { id: r.id, url: r.url, at: new Date().toISOString() };
  try {
    const resp = await page.goto(r.url, { timeout: 30000, waitUntil: 'domcontentloaded' });
    res.status = resp?.status() ?? null; res.finalUrl = page.url();
    res.contentType = resp?.headers()['content-type'] ?? null;
    res.title = await page.title().catch(() => null);
    res.text = (await page.evaluate(() => document.body?.innerText ?? '').catch(() => '')).slice(0, 300);
  } catch (e) { res.error = String(e.message).split('\n')[0]; }
  results.push(res); await page.close();
  console.log(r.id, res.status ?? '', res.error ?? res.title ?? '');
}
await browser.close();
writeFileSync('/tmp/claude-0/qa/b/open37-results.json', JSON.stringify(results, null, 1));
