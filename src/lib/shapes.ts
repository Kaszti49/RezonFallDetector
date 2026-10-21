import { noise2D } from "@remotion/noise";
import { hashSeed, mulberry32 } from "./random";

export type Pt = [number, number];

// Dense closed outlines. Everything is sampled finely so roughen() can wobble any shape.

export const densify = (poly: Pt[], step = 8): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const n = Math.max(
      1,
      Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step),
    );
    for (let j = 0; j < n; j++) {
      out.push([
        a[0] + ((b[0] - a[0]) * j) / n,
        a[1] + ((b[1] - a[1]) * j) / n,
      ]);
    }
  }
  return out;
};

export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  step = 6,
): Pt[] => {
  const perimeter =
    Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const n = Math.max(14, Math.round(perimeter / step));
  return Array.from({ length: n }, (_, i): Pt => {
    const t = (i / n) * Math.PI * 2;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
  });
};

export const roundRect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  step = 6,
): Pt[] => {
  const rr = Math.max(0.5, Math.min(r, w / 2, h / 2));
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    const n = Math.max(2, Math.round(((Math.PI / 2) * rr) / step));
    for (let i = 0; i <= n; i++) {
      const t = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr]);
    }
  };
  corner(x + rr, y + rr, Math.PI);
  corner(x + w - rr, y + rr, -Math.PI / 2);
  corner(x + w - rr, y + h - rr, 0);
  corner(x + rr, y + h - rr, Math.PI / 2);
  return densify(pts, step);
};

// Limb with round ends, from the pivot (0,0) down to (0,len). Round ends overlap like a real puppet joint.
export const capsule = (len: number, w: number) =>
  roundRect(-w / 2, -w / 2, w, len + w, w / 2, 5);

// Offsets every vertex along its normal: smooth seeded wobble (scissor path) plus small facets.
// Noise is sampled on a circle so the outline closes without a seam.
export const roughen = (
  pts: Pt[],
  seed: string,
  {
    wobble = 1.4,
    jitter = 0.35,
    wavelength = 46,
  }: { wobble?: number; jitter?: number; wavelength?: number } = {},
): Pt[] => {
  const n = pts.length;
  const cum = [0];
  for (let i = 1; i <= n; i++) {
    const a = pts[i - 1];
    const b = pts[i % n];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[n] || 1;
  const radius = total / (2 * Math.PI * wavelength);
  const rand = mulberry32(hashSeed(seed));
  return pts.map((p, i): Pt => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const tl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = (b[1] - a[1]) / tl;
    const ny = -(b[0] - a[0]) / tl;
    const th = (cum[i] / total) * Math.PI * 2;
    const off =
      noise2D(seed, radius * Math.cos(th), radius * Math.sin(th)) * wobble +
      (rand() - 0.5) * 2 * jitter;
    return [p[0] + nx * off, p[1] + ny * off];
  });
};

export const toPath = (pts: Pt[]) =>
  pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ") + " Z";

// Hand-cut outline as an SVG path.
export const cut = (
  pts: Pt[],
  seed: string,
  opts?: Parameters<typeof roughen>[2],
) => toPath(roughen(pts, seed, opts));
