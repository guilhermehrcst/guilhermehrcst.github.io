// The sitemap (spec §8.2): exactly the canonical pages, from src/lib/routes.ts. No dependency.
import type { APIRoute } from 'astro';
import { canonicalPaths } from '../lib/routes';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://guilhermehrcst.github.io');
  const urls = canonicalPaths().map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
