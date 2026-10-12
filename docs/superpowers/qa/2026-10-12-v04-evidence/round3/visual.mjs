import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { createHash } from 'node:crypto';
const b = await chromium.launch();
for (const w of [320, 390, 768, 1440]) {
  const h = [];
  for (const base of ['http://127.0.0.1:4322', 'http://127.0.0.1:4321']) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } }); await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
    h.push(createHash('sha256').update(await p.screenshot({ fullPage: true })).digest('hex').slice(0, 12)); await p.close();
  }
  console.log(w, 'main', h[0], 'qa', h[1], h[0] === h[1] ? 'IDENTICAL' : 'DIFFERENT');
}
await b.close();
