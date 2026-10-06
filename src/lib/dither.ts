// Ordered dither (8x8 Bayer). Shared by the server-rendered fallback and the
// canvas, so the static and animated band are the same picture at the same p.

const B8 = (() => {
  // Recursive Bayer construction: deterministic, no table to mistype.
  let m = [[0]];
  while (m.length < 8) {
    const n = m.length;
    const next: number[][] = Array.from({ length: n * 2 }, () => new Array<number>(n * 2).fill(0));
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const v = 4 * m[y]![x]!;
        next[y]![x] = v;
        next[y]![x + n] = v + 2;
        next[y + n]![x] = v + 3;
        next[y + n]![x + n] = v + 1;
      }
    m = next;
  }
  return m.flat().map((v) => (v + 0.5) / 64);
})();

export const BAND_ROWS = 8;
/** Progress used when nothing animates (reduced motion, no JS). */
export const BAND_STATIC_P = 0.6;

export const PAPER = 0, INK = 1, SIGNAL = 2;
export type Cell = typeof PAPER | typeof INK | typeof SIGNAL;

/** Cell state for column x, row y at progress p ∈ [0, 1]. Rows go paper → ink downwards. */
export function bandCell(x: number, y: number, p: number): Cell {
  const t = B8[(y % 8) * 8 + (x % 8)]!;
  const level = (y / (BAND_ROWS - 1)) * 1.1 - 0.35 + p * 0.6;
  if (t < level) return INK;
  if (t < level + 0.05) return SIGNAL;
  return PAPER;
}

export function bandCols(width: number): number {
  return width >= 1024 ? 64 : width >= 640 ? 40 : 24;
}
