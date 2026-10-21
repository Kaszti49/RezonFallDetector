import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { shade } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { cut, densify, type Pt } from "../lib/shapes";

// Paper floor tiles receding toward a vanishing point. Two tile colors make a checkerboard.
// Far and near rows can sit out of focus.
export const PerspectiveFloor: React.FC<{
  rows: readonly number[];
  vp: Pt;
  spacing: number;
  tile: string | readonly [string, string];
  grout: string;
  seed: string;
  sharpFrom?: number;
  sharpTo?: number;
}> = ({ rows, vp, spacing, tile, grout, seed, sharpFrom = -Infinity, sharpTo = Infinity }) => {
  const top = rows[0];
  const bottom = rows[rows.length - 1];
  const bands = useMemo(() => {
    const atY = (xb: number, y: number) => vp[0] + ((xb - vp[0]) * (y - vp[1])) / (bottom - vp[1]);
    const rand = mulberry32(hashSeed(seed));
    const cols = Array.from({ length: 41 }, (_, i) => vp[0] + (i - 20) * spacing);
    return rows.slice(0, -1).map((y0, ri) => {
      const y1 = rows[ri + 1];
      const tiles = cols.slice(0, -1).flatMap((xb0, ci) => {
        const xb1 = cols[ci + 1];
        const quad: Pt[] = [
          [atY(xb0, y0), y0],
          [atY(xb1, y0), y0],
          [atY(xb1, y1), y1],
          [atY(xb0, y1), y1],
        ];
        if (quad[1][0] < -40 || quad[0][0] > 1960) return [];
        const cx = (quad[0][0] + quad[1][0] + quad[2][0] + quad[3][0]) / 4;
        const cy = (y0 + y1) / 2;
        const g = Math.min(0.9, 2.5 + (y1 - y0) * 0.05) / Math.min(y1 - y0, quad[1][0] - quad[0][0]);
        const inset = quad.map(([x, y]): Pt => [cx + (x - cx) * (1 - 2 * g), cy + (y - cy) * (1 - 2 * g)]);
        return [
          {
            d: cut(densify(inset, 10), `${seed}-${ri}-${ci}`, { wobble: 0.8, jitter: 0.25, wavelength: 28 }),
            fill: shade(typeof tile === "string" ? tile : tile[(ri + ci) % 2], 0.94 + rand() * 0.08),
          },
        ];
      });
      const blur = y1 <= sharpFrom ? "url(#dof-2)" : y0 >= sharpTo ? "url(#dof-1)" : undefined;
      return { tiles, blur, key: ri };
    });
  }, [rows, vp, spacing, tile, seed, sharpFrom, sharpTo, bottom]);

  return (
    <g>
      <rect x={-20} y={top} width={1960} height={bottom - top} fill={grout} />
      <rect x={-20} y={top} width={1960} height={bottom - top} fill="url(#tex-fiber)" opacity={0.3} />
      {bands.map((b) => (
        <g key={b.key} filter={b.blur}>
          <g filter="url(#sh-flat)">
            {b.tiles.map((t, i) => (
              <Piece key={i} d={t.d} fill={t.fill} shadow={null} />
            ))}
          </g>
        </g>
      ))}
    </g>
  );
};
