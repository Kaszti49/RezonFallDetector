import { useMemo } from "react";
import { floorWave, type Impact } from "../fx/ripple";
import { RUBIK, WEIGHT } from "../fonts";
import { tornRectPath } from "../lib/paths";
import { cut, roundRect } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";
import { Piece } from "./material/Piece";

// Paper tape that plots the floor signal at the device's x over the last `windowSec` seconds.
// It reads the same impact list as the floor wave, so a step on screen is a burst on the tape.
export const Seismograph: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
  impacts: readonly Impact[];
  xDevice: number;
  label: string;
  gain?: number;
  windowSec?: number;
  color?: string;
}> = ({ x, y, w, h, t, impacts, xDevice, label, gain = 9, windowSec = 4, color = PALETTE.teal }) => {
  const paths = useMemo(
    () => ({
      tape: tornRectPath(w, h, 71, { tear: 4 }),
      tag: cut(roundRect(0, 0, 250, 46, 4, 6), "seis-tag", { wobble: 0.8 }),
      tapePiece: cut(roundRect(0, 0, 56, 20, 1, 4), "seis-tape", { wobble: 0.6 }),
      stylus: cut(
        [
          [0, 0],
          [34, -14],
          [40, -6],
          [6, 6],
        ],
        "seis-stylus",
        { wobble: 0.4 },
      ),
    }),
    [w, h],
  );

  const plotX0 = 26;
  const plotW = w - 92;
  const mid = h / 2;
  const n = 360;
  const trace = Array.from({ length: n + 1 }, (_, i) => {
    const s = i / n;
    const v = floorWave(xDevice, t - windowSec + s * windowSec, impacts) * gain;
    const py = mid - Math.max(-mid + 10, Math.min(mid - 10, v));
    return `${i === 0 ? "M" : "L"}${(plotX0 + s * plotW).toFixed(1)} ${py.toFixed(1)}`;
  }).join(" ");
  const nowY = mid - Math.max(-mid + 10, Math.min(mid - 10, floorWave(xDevice, t, impacts) * gain));

  return (
    <g transform={`translate(${x} ${y})`}>
      <Piece d={paths.tape} fill={PALETTE.paper}>
        {Array.from({ length: 17 }, (_, i) => (
          <line
            key={i}
            x1={plotX0 + (i / 16) * plotW}
            x2={plotX0 + (i / 16) * plotW}
            y1={8}
            y2={h - 8}
            stroke={PALETTE.ink}
            strokeOpacity={i % 4 === 0 ? 0.18 : 0.08}
            strokeWidth={1.2}
          />
        ))}
        <line x1={plotX0} x2={plotX0 + plotW} y1={mid} y2={mid} stroke={PALETTE.ink} strokeOpacity={0.2} strokeWidth={1.4} />
        <path d={trace} stroke={color} strokeWidth={3} fill="none" strokeLinejoin="round" />
      </Piece>
      <g transform={`translate(${plotX0 + plotW} ${nowY})`}>
        <Piece d={paths.stylus} fill={PALETTE.cardboard} material="card" shadow="sh-s" />
        <circle r={4} fill={PALETTE.ink} />
      </g>
      <g transform="translate(18 -30) rotate(-2.5)">
        <Piece d={paths.tag} fill={PALETTE.paper} depth={2}>
          <text
            x={125}
            y={24}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={RUBIK}
            fontWeight={WEIGHT.tag}
            fontSize={26}
            fill={PALETTE.ink}
          >
            {label}
          </text>
        </Piece>
        <Piece d={paths.tapePiece} fill={DERIVED.tape} opacity={0.82} shadow="sh-flat" transform="translate(-16 -6) rotate(-28)" />
      </g>
    </g>
  );
};
