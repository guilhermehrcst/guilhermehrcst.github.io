// This is the LAST write to dist/: independent verify-dist.mjs runs FIRST.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rebaseHtml, rebaseCss, rebaseMetadata } from './project-base.mjs';

const dist = resolve(process.argv[2] ?? fileURLToPath(new URL('../dist/', import.meta.url)));
let modified = 0;

async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const pathname = join(dir, item.name);
    if (item.isDirectory()) { await walk(pathname); continue; }
    if (!item.isFile()) continue;
    const ext = extname(item.name);
    let transform;
    if (ext === '.html') transform = rebaseHtml;
    else if (ext === '.css') transform = rebaseCss;
    else if (item.name === 'sitemap.xml' || item.name === 'robots.txt') transform = rebaseMetadata;
    else continue;
    const before = await readFile(pathname, 'utf8');
    const after = transform(before);
    if (after !== before) { await writeFile(pathname, after, 'utf8'); modified++; }
  }
}
await walk(dist);
if (modified === 0) throw new Error('project-base: no rewritten references; check build order and project base');
console.log('project-base: rewrote ' + modified + ' HTML/CSS/metadata files for /pexis-academy/');
