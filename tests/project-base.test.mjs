import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicPath, rebaseHtml, rebaseCss, rebaseMetadata, PROJECT_BASE } from '../scripts/project-base.mjs';

test('project prefix is idempotent, and external/relative/hash URLs stay intact', () => {
  assert.equal(PROJECT_BASE, '/pexis-academy');
  for (const [input, expected] of [
    ['/', '/pexis-academy/'],
    ['/buscar/?q=ita', '/pexis-academy/buscar/?q=ita'],
    ['/pexis-academy/', '/pexis-academy/'],
    ['#main', '#main'], ['?q=ita', '?q=ita'],
    ['//cdn.example.org/a.png', '//cdn.example.org/a.png'],
    ['https://kultivi.com/', 'https://kultivi.com/']
  ]) assert.equal(publicPath(input), expected);
});

test('HTML rebases canonical, open graph, assets, nav, srcset and legacy redirects exactly once', () => {
  const input = '<link rel="canonical" href="https://guilhermehrcst.github.io/buscar/">' +
    '<meta property="og:url" content="https://guilhermehrcst.github.io/buscar/">' +
    '<link rel="icon" href="/favicon-32.png">' +
    '<a href="/">Home</a><a href="/pre-militar/#materiais">Materiais</a>' +
    '<a href="https://kultivi.com/">Externo</a><a href="#main">Pular</a>' +
    '<img src="/_astro/img.png" srcset="/_astro/img.png 1x, /_astro/img2.png 2x">' +
    '<form action="/buscar/" method="get"></form>' +
    '<meta http-equiv="refresh" content="0;url=/materias/">';
  const result = rebaseHtml(input);
  assert.match(result, /href="\/pexis-academy\/pre-militar\/#materiais"/);
  assert.match(result, /href="\/pexis-academy\/favicon-32.png"/);
  assert.match(result, /srcset="\/pexis-academy\/_astro\/img.png 1x, \/pexis-academy\/_astro\/img2.png 2x"/);
  assert.match(result, /action="\/pexis-academy\/buscar\/"/);
  assert.match(result, /content="0;url=\/pexis-academy\/materias\/"/);
  assert.match(result, /https:\/\/guilhermehrcst.github.io\/pexis-academy\/buscar\//);
  assert.match(result, /href="https:\/\/kultivi.com\/"/);
  assert.match(result, /href="#main"/);
  assert.equal(rebaseHtml(result), result);
});

test('CSS font paths and sitemap metadata use project URL and remain idempotent', () => {
  const css = '@font-face{src:url(/_astro/font.woff2)}.a{background:url("/icon-192.png")}' +
    '.b{background:url(data:image/png;base64,AAA)}';
  const result = rebaseCss(css);
  assert.match(result, /url\(\/pexis-academy\/_astro\/font.woff2\)/);
  assert.match(result, /url\("\/pexis-academy\/icon-192.png"\)/);
  assert.match(result, /url\(data:image\/png;base64,AAA\)/);
  assert.equal(rebaseCss(result), result);
  assert.equal(rebaseMetadata('Sitemap: https://guilhermehrcst.github.io/sitemap.xml'),
    'Sitemap: https://guilhermehrcst.github.io/pexis-academy/sitemap.xml');
});
