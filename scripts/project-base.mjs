// The repository is a GitHub Pages *project* site, not the account's root site.
// Keep all source routes and the historical 44-resource verifier root-relative.
// AFTER that original verifier passes, rebase static output for project hosting.
export const SITE_ORIGIN = 'https://guilhermehrcst.github.io';
export const PROJECT_BASE = '/pexis-academy';

export function publicPath(path) {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (path === PROJECT_BASE || path.startsWith(PROJECT_BASE + '/')) return path;
  return PROJECT_BASE + path;
}

export function rebaseHtml(html) {
  let out = html.replace(/https:\/\/guilhermehrcst\.github\.io\/(?!pexis-academy(?:\/|$))/g,
    SITE_ORIGIN + PROJECT_BASE + '/');

  // Only URL-valued HTML attributes. Preserve hashes and links to course providers.
  out = out.replace(/\b(href|src|srcset|action|poster)\s*=\s*(["'])(.*?)\2/gi, (match, key, quote, value) => {
    if (key.toLowerCase() === 'srcset') {
      const rewritten = value.replace(/(^|,\s*)(\/(?!\/)[^\s,]+)(?=\s|,|$)/g,
        (_m, start, path) => start + publicPath(path));
      return key + '=' + quote + rewritten + quote;
    }
    return key + '=' + quote + publicPath(value) + quote;
  });

  // Astro static legacy redirects use meta refresh, not 301 (GitHub Pages).
  out = out.replace(/(\bcontent=["']\s*\d+\s*;\s*url=)(\/(?!\/)[^"']*)(["'])/gi,
    (_m, start, path, end) => start + publicPath(path) + end);
  return out;
}

export function rebaseCss(css) {
  // CSS @font-face and url(/_astro/...) need the project prefix as well.
  return css.replace(/url\(\s*(["']?)(\/(?!\/)[^'"\)]+)\1\s*\)/gi,
    (_m, quote, path) => 'url(' + quote + publicPath(path.trim()) + quote + ')');
}

export function rebaseMetadata(source) {
  return source.replace(/https:\/\/guilhermehrcst\.github\.io\/(?!pexis-academy(?:\/|$))/g,
    SITE_ORIGIN + PROJECT_BASE + '/');
}
