import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { mix, shade } from "../lib/color";
import { cut, ellipse, toPath, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

const COPPER = mix([PALETTE.red, 0.3], [PALETTE.warm, 0.35], [PALETTE.cardboard, 0.35]);
const PCB = shade(PALETTE.teal, 0.55);

// The device's internals, stacked inside the body at e = 0 and spread upward at e = 1.
// (cx, cy) is the center of the body's top ellipse; rx and k match RezonHero.
export const EXPLODE_STEP = 100;

export const levels = (cy: number, e: number) => ({
  tray: cy - 18 - EXPLODE_STEP * 0.9 * e,
  board: cy - 30 - EXPLODE_STEP * 1.9 * e,
  speaker: cy - 40 - EXPLODE_STEP * 2.9 * e,
  lidLift: EXPLODE_STEP * 4.7 * e,
});

// Upright cylinder in the same three-quarter view: side band plus top ellipse.
const Cylinder: React.FC<{ cx: number; top: number; r: number; h: number; k: number; fill: string; topFill?: string; seed: string; children?: React.ReactNode }> = ({
  cx,
  top,
  r,
  h,
  k,
  fill,
  topFill,
  seed,
  children,
}) => {
  const p = useMemo(() => {
    const arc = (yc: number, a0: number, a1: number, n = 40): Pt[] =>
      Array.from({ length: n + 1 }, (_, i): Pt => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [cx + Math.cos(a) * r, yc + Math.sin(a) * r * k];
      });
    return {
      side: cut([...arc(top, 0, Math.PI), ...arc(top + h, Math.PI, 0)].reverse(), `${seed}-side`, { wobble: 0.6, wavelength: 26 }),
      topFace: cut(ellipse(cx, top, r, r * k, 4), `${seed}-top`, { wobble: 0.6, wavelength: 26 }),
    };
  }, [cx, top, r, h, k, seed]);
  return (
    <g>
      <Piece d={p.side} fill={shade(fill, 0.8)} />
      <Piece d={p.topFace} fill={topFill ?? fill} shadow={null}>
        {children}
      </Piece>
    </g>
  );
};

export const RezonInternals: React.FC<{ cx: number; cy: number; rx: number; k: number; e: number }> = ({ cx, cy, rx, k, e }) => {
  const L = levels(cy, e);
  const s = rx / 300;
  const p = useMemo(() => {
    const rect = (u0: number, v0: number, w: number, d: number): Pt[] => [
      [cx + u0, 0 + v0 * k],
      [cx + u0 + w, 0 + v0 * k],
      [cx + u0 + w, 0 + (v0 + d) * k],
      [cx + u0, 0 + (v0 + d) * k],
    ];
    return {
      board: toPath(rect(-150 * s, -90 * s, 300 * s, 180 * s)),
      module: toPath(rect(-50 * s, -60 * s, 110 * s, 80 * s)),
      chips: [rect(-120 * s, 20 * s, 40 * s, 30 * s), rect(70 * s, 30 * s, 50 * s, 26 * s), rect(-110 * s, -60 * s, 30 * s, 22 * s)].map(toPath),
      antenna: `M ${cx + 92 * s} ${-70 * s * k} l ${12 * s} ${8 * k} l ${12 * s} ${-8 * k} l ${12 * s} ${8 * k} l ${12 * s} ${-8 * k}`,
      battery: toPath(rect(30 * s, -60 * s, 120 * s, 100 * s)),
      batteryBand: toPath(rect(30 * s, -18 * s, 120 * s, 16 * s)),
    };
  }, [cx, k, s]);

  return (
    <g>
      {/* Tray with the geophone (copper) and the battery pack. */}
      <Cylinder cx={cx} top={L.tray} r={rx * 0.9} h={8} k={k} fill={PALETTE.paper} seed="tray" />
      <Cylinder cx={cx - rx * 0.34} top={L.tray - 70 * s} r={44 * s} h={70 * s} k={k} fill={COPPER} seed="geophone">
        <ellipse cx={cx - rx * 0.34} cy={L.tray - 70 * s} rx={18 * s} ry={18 * s * k} fill={shade(COPPER, 0.7)} />
      </Cylinder>
      <g transform={`translate(0 ${L.tray - 44 * s})`}>
        <path d={p.battery} transform={`translate(0 ${44 * s})`} fill={shade(PALETTE.night, 0.75)} />
        <Piece d={p.battery} fill={PALETTE.night}>
          <path d={p.batteryBand} fill={PALETTE.paper} opacity={0.9} />
        </Piece>
      </g>

      {/* ESP32 board: green paper PCB (palette teal, darkened), a shielded module, chips, antenna. */}
      <g transform={`translate(0 ${L.board})`}>
        <path d={p.board} transform="translate(0 6)" fill={shade(PCB, 0.7)} />
        <Piece d={p.board} fill={PCB}>
          <path d={p.module} fill={DERIVED.steel} />
          {p.chips.map((d, i) => (
            <path key={i} d={d} fill={PALETTE.ink} />
          ))}
          <path d={p.antenna} stroke={DERIVED.brass} strokeWidth={3} fill="none" />
        </Piece>
      </g>

      {/* Speaker: cardboard ring with a paper cone. */}
      <Cylinder cx={cx} top={L.speaker} r={rx * 0.5} h={22} k={k} fill={PALETTE.cardboard} topFill={PALETTE.paper} seed="speaker">
        {[0.82, 0.6, 0.36].map((f) => (
          <ellipse key={f} cx={cx} cy={L.speaker + (1 - f) * 6} rx={rx * 0.5 * f} ry={rx * 0.5 * f * k} fill="none" stroke={PALETTE.ink} strokeOpacity={0.3} strokeWidth={2} />
        ))}
        <ellipse cx={cx} cy={L.speaker + 6} rx={rx * 0.1} ry={rx * 0.1 * k} fill={PALETTE.ink} opacity={0.75} />
      </Cylinder>
    </g>
  );
};

// Where each label points (for the paper tags' strings).
export const internalsAnchors = (cx: number, cy: number, rx: number, k: number, e: number) => {
  const L = levels(cy, e);
  const s = rx / 300;
  return {
    speaker: [cx - rx * 0.5, L.speaker + 10] as Pt,
    board: [cx + 150 * s, L.board + 30 * k] as Pt,
    geophone: [cx - rx * 0.34 - 44 * s, L.tray - 30 * s] as Pt,
    battery: [cx + 150 * s, L.tray - 10 * s] as Pt,
    antenna: [cx + 130 * s, L.board - 70 * s * k] as Pt,
  };
};
