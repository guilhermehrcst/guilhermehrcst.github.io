// Derives the site's brand files from the official Pexis Academy artwork (src/assets/brand/source, as
// supplied, never edited). Run by hand when a source changes: `node scripts/brand-assets.mjs`; the
// outputs are committed. Uses sharp, which Astro already installs; nothing else depends on it at build.
//
// What it may do to the artwork: crop it, drop the near-invisible haze the supplier's cut-out left
// around it (alpha <= 8 of 255), and place it whole on the brand red. It never redraws, recolours or
// resizes the artwork itself in the site files (the browser scales it); the icons are the only resized
// outputs. Every pixel of the artwork (alpha > 8) is checked to be unchanged.
//
// The brand red is measured from the stacked red original (median of its background), not chosen.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const SRC_H = 'src/assets/brand/source/pexis-academy-horizontal-white.png';
const SRC_V = 'src/assets/brand/source/pexis-academy-stacked-red.png';
const HAZE = 8;

const raw = async (path) => {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};
const fail = (message) => { console.error(`brand-assets: ${message}`); process.exit(1); };

// 1. The brand red: the median of the stacked original's background (pixels clearly red).
const v = await raw(SRC_V);
const channels = [[], [], []];
for (let i = 0; i < v.data.length; i += 4) {
  const [r, g, b] = [v.data[i], v.data[i + 1], v.data[i + 2]];
  if (r > 80 && g < 40 && b < 40) { channels[0].push(r); channels[1].push(g); channels[2].push(b); }
}
const median = (list) => list.sort((a, b) => a - b)[list.length >> 1];
const red = channels.map(median);
const hex = `#${red.map((c) => c.toString(16).padStart(2, '0')).join('')}`;

// 2. The artwork of the horizontal original: its box (alpha > HAZE), and the symbol's box (the first run of
//    columns with artwork, left of the wordmark).
const h = await raw(SRC_H);
const alpha = (x, y) => h.data[(y * h.width + x) * 4 + 3];
const box = (x0, x1) => {
  let top = Infinity, bottom = -1, left = Infinity, right = -1;
  for (let y = 0; y < h.height; y++) for (let x = x0; x < x1; x++) {
    if (alpha(x, y) > HAZE) { top = Math.min(top, y); bottom = Math.max(bottom, y); left = Math.min(left, x); right = Math.max(right, x); }
  }
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
};
const all = box(0, h.width);
const columns = [];
for (let x = all.left; x < all.left + all.width; x++) {
  let any = false;
  for (let y = all.top; y < all.top + all.height && !any; y++) any = alpha(x, y) > HAZE;
  columns.push(any);
}
const gap = columns.indexOf(false);
if (gap < 0) fail('no gap between the symbol and the wordmark');
const symbol = box(all.left, all.left + gap);

// 3. Cut out, without the haze; then check that every artwork pixel is the original's.
const cut = async (region, out) => {
  const { data, info } = await sharp(SRC_H).ensureAlpha().extract(region).raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] <= HAZE) { data[i - 3] = data[i - 2] = data[i - 1] = data[i] = 0; }
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const o = ((region.top + y) * h.width + region.left + x) * 4;
    const n = (y * info.width + x) * 4;
    if (h.data[o + 3] > HAZE) for (let c = 0; c < 4; c++) if (h.data[o + c] !== data[n + c]) fail(`${out}: pixel ${x},${y} changed`);
  }
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(out);
  return info;
};
const lockup = await cut(all, 'src/assets/brand/lockup-white.png');
const mark = await cut(symbol, 'src/assets/brand/symbol-white.png');

// 4. Icons: the symbol, whole, centred on the brand red (the only resized outputs).
const icon = async (size, margin, out) => {
  const inner = Math.round(size * (1 - 2 * margin));
  const art = await sharp('src/assets/brand/symbol-white.png').resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: red[0], g: red[1], b: red[2], alpha: 1 } } })
    .composite([{ input: art, gravity: 'centre' }]).png({ compressionLevel: 9 }).toFile(out);
};
await icon(32, 0.09, 'public/favicon-32.png');
await icon(180, 0.16, 'public/apple-touch-icon.png');
await icon(192, 0.16, 'public/icon-192.png');

// 5. The manifest: what was measured and the hash of every file, so a test can tell a hand-edited or stale
//    output from a generated one without running sharp.
const sha = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const files = [SRC_H, SRC_V, 'src/assets/brand/lockup-white.png', 'src/assets/brand/symbol-white.png', 'public/favicon-32.png', 'public/apple-touch-icon.png', 'public/icon-192.png'];
const manifest = {
  brandRed: hex,
  artwork: { box: all, symbol, lockup: { width: lockup.width, height: lockup.height }, mark: { width: mark.width, height: mark.height } },
  sha256: Object.fromEntries(files.map((f) => [f, sha(f)])),
};
writeFileSync('src/assets/brand/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`brand-assets: red ${hex}; lockup ${lockup.width}x${lockup.height}; symbol ${mark.width}x${mark.height}; ${files.length} files hashed`);
