// Independent final-artifact gate: catch every unprefixed internal URL or missing asset.
// The existing verify-dist.mjs validates the original root-relative catalogue first.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECT_BASE, SITE_ORIGIN } from './project-base.mjs';

const dist = resolve(process.argv[2] ?? fileURLToPath(new URL('../dist/', import.meta.url)));
const errors = [];
const site = SITE_ORIGIN + PROJECT_BASE;
let checked = 0;

const targetFile = (input) => {
  const url = new URL(input, SITE_ORIGIN);
  if (!url.pathname.startsWith(PROJECT_BASE + '/')) return null;
  const relative = url.pathname.slice(PROJECT_BASE.length + 1);
  return join(dist, !relative || relative.endsWith('/') ? relative + 'index.html' : relative);
};
const fail = (path, reason) => errors.push(path + ': ' + reason);
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap(item =>
  item.isDirectory() ? files(join(dir, item.name)) : [join(dir, item.name)]);

for (const file of files(dist)) {
  if (!/\.(html|css)$/.test(file)) continue;
  checked++;
  const name = file.slice(dist.length + 1);
  const content = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const [, attribute,, raw] of content.matchAll(/\b(href|src|srcset|action|poster)\s*=\s*(["'])(.*?)\2/gi)) {
      const urls = attribute.toLowerCase() === 'srcset'
        ? raw.split(',').map(value => value.trim().split(/\s+/)[0]) : [raw];
      for (const href of urls) {
        if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith(PROJECT_BASE + '/'))
          fail(name, 'unprefixed ' + attribute + '=' + href);
        if (href.startsWith(SITE_ORIGIN + '/') && !href.startsWith(site + '/'))
          fail(name, 'old root URL ' + href);
        if (href.startsWith(PROJECT_BASE + '/')) {
          const filePath = targetFile(href);
          if (!filePath || !existsSync(filePath)) fail(name, 'missing page/asset ' + href);
        }
      }
    }
    if (/\bcontent=["']\s*\d+\s*;\s*url=\/(?!\/|pexis-academy\/)/i.test(content))
      fail(name, 'root-relative meta refresh');
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(content)?.[1];
    if (canonical && !canonical.startsWith(site + '/')) fail(name, 'canonical outside project ' + canonical);
    const og = /<meta property="og:url" content="([^"]+)"/.exec(content)?.[1];
    if (og && !og.startsWith(site + '/')) fail(name, 'og:url outside project ' + og);
  } else {
    for (const match of content.matchAll(/url\(\s*["']?(\/(?!\/)[^\)"']+)/gi)) {
      const href = match[1];
      if (!href.startsWith(PROJECT_BASE + '/')) fail(name, 'unprefixed CSS url(' + href + ')');
      else if (!existsSync(targetFile(href))) fail(name, 'missing CSS asset ' + href);
    }
  }
}

const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
if (urls.length < 20) fail('sitemap.xml', 'too few canonical pages');
for (const url of urls) {
  if (!url.startsWith(site + '/')) fail('sitemap.xml', 'invalid canonical URL ' + url);
  else if (!existsSync(targetFile(url))) fail('sitemap.xml', 'missing sitemap page ' + url);
}
if (!readFileSync(join(dist, 'robots.txt'), 'utf8').includes('Sitemap: ' + site + '/sitemap.xml'))
  fail('robots.txt', 'sitemap not rebased');
if (errors.length) throw new Error('project-base: ' + errors.length + ' violations:\n' +
  errors.slice(0, 25).join('\n') + (errors.length > 25 ? '\n... and more' : ''));
console.log('project-base: verified ' + checked + ' pages/styles, ' + urls.length +
  ' sitemap URLs, local assets and all internal links');
