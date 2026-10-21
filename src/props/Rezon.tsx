import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { RUBIK } from "../fonts";
import { shade } from "../lib/color";
import { cut, ellipse, roundRect, toPath, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

export type LedState = { color: string; glow: number };
export const LED = {
  ok: (glow = 1): LedState => ({ color: DERIVED.ledTeal, glow }),
  warn: (glow = 1): LedState => ({ color: PALETTE.warm, glow }),
  alarm: (glow = 1): LedState => ({ color: PALETTE.red, glow }),
};

const LedGlow: React.FC<{
  id: string;
  x: number;
  y: number;
  r: number;
  led: LedState;
}> = ({ id, x, y, r, led }) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={led.color} stopOpacity={0.9} />
        <stop offset="100%" stopColor={led.color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={`url(#${id})`}
      opacity={led.glow}
      style={{ mixBlendMode: "screen" }}
    />
  </>
);

// Hero view: the palm-sized puck at three-quarter angle. (cx, cy) = center of the body's top ellipse.
// Body = laminated cardboard discs, teal paper band, kraft lid with debossed REZON, punched grille, LED.
export const RezonHero: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  k?: number;
  h?: number;
  led?: LedState;
  seed?: string;
  lidLift?: number;
  inside?: React.ReactNode;
}> = ({
  cx,
  cy,
  rx = 300,
  k = 0.5,
  h = 110,
  led = LED.ok(),
  seed = "rezon",
  lidLift = 0,
  inside,
}) => {
  const ry = rx * k;
  const sc = rx / 300; // lid details are designed at rx = 300 and scale with the device
  const lidT = 16;
  const rl = rx + 5;
  const ryl = rl * k;
  const top = cy - lidT;

  const g = useMemo(() => {
    const arc = (yc: number, a0: number, a1: number, r = rx, n = 90): Pt[] =>
      Array.from({ length: n + 1 }, (_, i): Pt => {
        const a = a0 + ((a1 - a0) * i) / n;
        return [cx + Math.cos(a) * r, yc + Math.sin(a) * r * k];
      });
    const c = (pts: Pt[], id: string, wobble = 1.2) =>
      cut(pts, `${seed}-${id}`, { wobble, jitter: 0.3, wavelength: 50 });
    const holes: Pt[] = [];
    for (let row = -5; row <= 5; row++) {
      for (let col = -6; col <= 6; col++) {
        const u = (col * 25 + (row % 2 ? 12.5 : 0)) * (rx / 300);
        const v = row * 21.6 * (rx / 300);
        if (u * u + v * v < (104 * rx / 300) ** 2) holes.push([cx + u, top + (v - (98 * rx) / 300) * k]);
      }
    }
    return {
      body: c(
        [[cx + rx, cy], ...arc(cy + h, 0, Math.PI), [cx - rx, cy]],
        "body",
      ),
      band: c(
        [...arc(cy + 34, 0, Math.PI), ...arc(cy + 78, Math.PI, 0)],
        "band",
        0.9,
      ),
      layers: Array.from({ length: Math.floor(h / 13) }, (_, j) =>
        toPath(arc(cy + (j + 1) * 13, 0, Math.PI)).replace(/ Z$/, ""),
      ),
      lidSide: c(
        [...arc(top, 0, Math.PI, rl), ...arc(cy, Math.PI, 0, rl)],
        "lid-side",
        0.8,
      ),
      lidTop: c(ellipse(cx, top, rl, ryl, 6), "lid-top", 1),
      flutes: Array.from({ length: 64 }, (_, i) => {
        const a = (i / 63) * Math.PI;
        const x = cx + Math.cos(a) * rl;
        const y = top + Math.sin(a) * ryl;
        return `M${x.toFixed(1)} ${(y + 3).toFixed(1)} L${x.toFixed(1)} ${(y + lidT - 3).toFixed(1)}`;
      }).join(" "),
      shadow: toPath(ellipse(cx + 28, cy + h + 18, rx + 24, ry + 14, 8)),
      holes,
    };
  }, [cx, cy, rx, k, h, seed, rl, ryl, top, ry]);

  const ledAt: Pt = [cx, top + 196 * k * sc];

  return (
    <g>
      <defs>
        <linearGradient id={`${seed}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PALETTE.paper} stopOpacity={0.22} />
          <stop offset="40%" stopColor={PALETTE.paper} stopOpacity={0} />
          <stop offset="100%" stopColor={PALETTE.ink} stopOpacity={0.45} />
        </linearGradient>
        <radialGradient id={`${seed}-lid`} cx="0.32" cy="0.22" r="0.85">
          <stop offset="0%" stopColor={PALETTE.paper} stopOpacity={0.28} />
          <stop offset="55%" stopColor={PALETTE.paper} stopOpacity={0} />
          <stop offset="100%" stopColor={PALETTE.ink} stopOpacity={0.22} />
        </radialGradient>
        {/* Internals show only above the body's front rim, so they rise out of the open puck. */}
        <clipPath id={`${seed}-inside`}>
          <path
            d={`M ${cx - rx - 900} ${cy} ${Array.from(
              { length: 61 },
              (_, i) => {
                const a = Math.PI - (i / 60) * Math.PI;
                return `L ${(cx + Math.cos(a) * rx).toFixed(1)} ${(cy + Math.sin(a) * ry).toFixed(1)}`;
              },
            ).join(
              " ",
            )} L ${cx + rx + 900} ${cy} V ${cy - 3000} H ${cx - rx - 900} Z`}
          />
        </clipPath>
      </defs>

      <path
        d={g.shadow}
        fill={PALETTE.ink}
        opacity={0.5}
        filter="url(#soft-12)"
      />
      {/* Contact line where the puck meets the floor, so it sits instead of floating. */}
      <ellipse
        cx={cx + 6}
        cy={cy + h + 4}
        rx={rx + 4}
        ry={ry + 4}
        fill={PALETTE.ink}
        opacity={0.55}
        filter="url(#soft-4)"
      />

      <Piece d={g.body} fill={PALETTE.cardboard} material="card">
        {g.layers.map((d, i) => (
          <g key={i}>
            <path
              d={d}
              stroke={PALETTE.paper}
              strokeOpacity={0.16}
              strokeWidth={1.2}
              fill="none"
              transform="translate(0 1.4)"
            />
            <path
              d={d}
              stroke={PALETTE.ink}
              strokeOpacity={0.24}
              strokeWidth={1.6}
              fill="none"
            />
          </g>
        ))}
        <Piece d={g.band} fill={PALETTE.teal} shadow="sh-flat" />
        <path d={g.body} fill={`url(#${seed}-side)`} />
      </Piece>

      {lidLift > 0 ? (
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx - 3}
          ry={ry - 2}
          fill={shade(PALETTE.cardboard, 0.42)}
          stroke={shade(PALETTE.cardboard, 1.1)}
          strokeWidth={4}
        />
      ) : null}
      {inside ? <g clipPath={`url(#${seed}-inside)`}>{inside}</g> : null}
      <g
        transform={`translate(0 ${-lidLift})`}
        filter={lidLift > 0 ? "url(#sh)" : "url(#sh-flat)"}
      >
        <Piece
          d={g.lidSide}
          fill={shade(PALETTE.kraft, 0.82)}
          material="card"
          shadow={null}
        >
          <path
            d={g.flutes}
            stroke={PALETTE.ink}
            strokeOpacity={0.28}
            strokeWidth={2.2}
          />
          <path d={g.lidSide} fill={`url(#${seed}-side)`} />
        </Piece>
        <Piece d={g.lidTop} fill={PALETTE.kraft} material="kraft" shadow={null}>
          <path d={g.lidTop} fill={`url(#${seed}-lid)`} />
          <path d={g.lidTop} fill="none" stroke={shade(PALETTE.kraft, 0.6)} strokeWidth={Math.max(1.5, rx / 110)} />
          {g.holes.map(([x, y], i) => (
            <g key={i}>
              <ellipse
                cx={x + 1.4 * sc}
                cy={y + 0.9 * sc}
                rx={6.5 * sc}
                ry={6.5 * k * sc}
                fill={PALETTE.paper}
                opacity={0.35}
              />
              <ellipse
                cx={x}
                cy={y}
                rx={6.5 * sc}
                ry={6.5 * k * sc}
                fill={PALETTE.ink}
                opacity={0.82}
              />
            </g>
          ))}
          {/* Debossed: dark rim top-left, lit rim bottom-right, slightly darker floor. */}
          <g
            transform={`translate(${cx} ${top + 92 * k * sc}) scale(1 ${k})`}
            fontFamily={RUBIK}
            fontWeight={900}
            fontSize={92 * sc}
            letterSpacing={12 * sc}
            textAnchor="middle"
            dominantBaseline="central"
          >
            <text x={-2.5 * sc} y={-2.5 * sc} fill={PALETTE.ink} opacity={0.5}>
              REZON
            </text>
            <text x={2.5 * sc} y={2.5 * sc} fill={PALETTE.paper} opacity={0.45}>
              REZON
            </text>
            <text fill={shade(PALETTE.kraft, 0.88)}>REZON</text>
          </g>
        </Piece>

        <LedGlow
          id={`${seed}-glow`}
          x={ledAt[0]}
          y={ledAt[1]}
          r={110 * sc}
          led={led}
        />
        <ellipse
          cx={ledAt[0]}
          cy={ledAt[1] + 3 * sc}
          rx={24 * sc}
          ry={14 * sc}
          fill={shade(PALETTE.kraft, 0.55)}
        />
        <ellipse cx={ledAt[0]} cy={ledAt[1]} rx={21 * sc} ry={12 * sc} fill={led.color} />
        <ellipse
          cx={ledAt[0] - 6 * sc}
          cy={ledAt[1] - 4 * sc}
          rx={7 * sc}
          ry={3.4 * sc}
          fill={PALETTE.paper}
          opacity={0.85}
        />
      </g>
    </g>
  );
};

// Side view for the house cross-section. (x, y) = center of the base on the floor line.
export const RezonSide: React.FC<{
  x: number;
  y: number;
  scale?: number;
  led?: LedState;
  seed?: string;
}> = ({ x, y, scale = 1, led = LED.ok(), seed = "rezon-side" }) => {
  const p = useMemo(
    () => ({
      body: cut(roundRect(-40, -30, 80, 30, 10, 4), `${seed}-body`, {
        wobble: 0.6,
        wavelength: 20,
      }),
      band: cut(roundRect(-41, -23, 82, 11, 3, 4), `${seed}-band`, {
        wobble: 0.4,
        wavelength: 20,
      }),
      lid: cut(roundRect(-43, -39, 86, 11, 5, 4), `${seed}-lid`, {
        wobble: 0.5,
        wavelength: 20,
      }),
    }),
    [seed],
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Piece d={p.body} fill={PALETTE.cardboard} material="card" />
      <Piece d={p.band} fill={PALETTE.teal} shadow="sh-flat" />
      <Piece d={p.lid} fill={PALETTE.kraft} material="kraft" depth={2} />
      <LedGlow id={`${seed}-glow`} x={22} y={-40} r={30} led={led} />
      <ellipse cx={22} cy={-40} rx={5.5} ry={3.2} fill={led.color} />
    </g>
  );
};
