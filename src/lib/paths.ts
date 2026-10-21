import { mulberry32 } from "./random";

type Pt = readonly [number, number];

const toPath = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ") + " Z";

// Walks one edge from a to b, offsetting each vertex along the edge normal by seeded noise.
const jaggedEdge = (
  a: Pt,
  b: Pt,
  rand: () => number,
  step: number,
  amp: number,
): Pt[] => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const pts: Pt[] = [];
  let d = 0;
  while (d < len) {
    const t = d / len;
    const off = (rand() - 0.5) * 2 * amp;
    pts.push([a[0] + dx * t + nx * off, a[1] + dy * t + ny * off]);
    d += step * (0.5 + rand());
  }
  return pts;
};

// Torn paper strip: rough long edges, slightly irregular short edges.
export const tornRectPath = (
  w: number,
  h: number,
  seed: number,
  { tear = 5, cut = 1.5, step = 11 }: { tear?: number; cut?: number; step?: number } = {},
) => {
  const r = mulberry32(seed);
  const pad = tear;
  const tl: Pt = [pad, pad];
  const tr: Pt = [w - pad, pad];
  const br: Pt = [w - pad, h - pad];
  const bl: Pt = [pad, h - pad];
  return toPath([
    ...jaggedEdge(tl, tr, r, step, tear),
    ...jaggedEdge(tr, br, r, step * 2, cut),
    ...jaggedEdge(br, bl, r, step, tear),
    ...jaggedEdge(bl, tl, r, step * 2, cut),
  ]);
};

// Hand-cut rectangle: every edge is scissor-straight but not ruler-straight.
export const cutRectPath = (w: number, h: number, seed: number, wobble = 1.6) =>
  tornRectPath(w, h, seed, { tear: wobble, cut: wobble, step: 40 });
