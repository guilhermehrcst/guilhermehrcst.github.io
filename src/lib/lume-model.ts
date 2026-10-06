// Schematic model behind the Lume figure. It is an illustration, not data:
// blocks of a linear address space, some live and some dead. A compactor
// sweeps left to right; dead blocks are reclaimed and live blocks slide into
// a contiguous prefix. Seeded, so server and client draw the same picture.

export interface Block {
  /** Start address before compaction (cell index). */
  from: number;
  /** Start address after compaction. -1 for dead blocks. */
  to: number;
  len: number;
  live: boolean;
  /** Progress window in which this block moves (live) or is reclaimed (dead). */
  t0: number;
  t1: number;
}

export interface Model { cols: number; rows: number; blocks: Block[] }

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lumeModel(cols: number, rows: number, seed = 0x10e5): Model {
  const rand = mulberry32(seed);
  const size = cols * rows;
  const blocks: Block[] = [];
  let addr = Math.floor(rand() * 3);
  // Fill ~62% of the space with blocks, separated by irregular gaps.
  while (true) {
    const len = 1 + Math.floor(rand() * rand() * 11);
    if (addr + len > size) break;
    blocks.push({ from: addr, to: -1, len, live: rand() > 0.3, t0: 0, t1: 0 });
    addr += len + Math.floor(rand() * rand() * 9);
  }
  let cursor = 0;
  const n = blocks.length;
  blocks.forEach((b, i) => {
    // The sweep: block i starts when the compactor reaches it.
    // Narrow windows: only a few blocks are in flight at any moment.
    b.t0 = 0.02 + (i / n) * 0.8;
    b.t1 = b.t0 + (b.live ? 0.13 : 0.02);
    if (b.live) {
      b.to = cursor;
      cursor += b.len;
    }
  });
  return { cols, rows, blocks };
}

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Address of a block's first cell at progress p, quantised to whole cells: data moves in cells, not pixels. */
export function addressAt(b: Block, p: number): { addr: number; moving: boolean; gone: boolean } {
  if (!b.live) return { addr: b.from, moving: false, gone: p >= b.t1 };
  if (p <= b.t0) return { addr: b.from, moving: false, gone: false };
  if (p >= b.t1) return { addr: b.to, moving: false, gone: false };
  const k = easeOut((p - b.t0) / (b.t1 - b.t0));
  return { addr: Math.round(b.from + (b.to - b.from) * k), moving: b.from !== b.to, gone: false };
}

export function stateIndex(p: number): 0 | 1 | 2 {
  return p <= 0.02 ? 0 : p >= 0.98 ? 2 : 1;
}
