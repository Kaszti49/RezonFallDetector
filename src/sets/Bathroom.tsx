import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { shade } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { cut, densify, ellipse, roundRect, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";
import { PerspectiveFloor } from "./PerspectiveFloor";

export const BATH = {
  floorY: 890,
  tileTop: 446,
  window: { x: 170, y: 120, w: 350, h: 280 },
  clock: { x: 800, y: 230 },
  camera: { x: 1780, y: 96 },
  ledAt: [1806, 82] as Pt,
  tap: [1200, 440] as Pt,
};

const W = (pts: Pt[], seed: string, wobble = 1.3) =>
  cut(densify(pts, 8), seed, { wobble, jitter: 0.3, wavelength: 40 });
const R = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  seed: string,
  wobble = 1.3,
) =>
  cut(roundRect(x, y, w, h, r, 7), seed, {
    wobble,
    jitter: 0.3,
    wavelength: 40,
  });
const E = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string,
  wobble = 1,
) =>
  cut(ellipse(cx, cy, rx, ry, 5), seed, {
    wobble,
    jitter: 0.25,
    wavelength: 30,
  });

const { x: wx, y: wy, w: ww, h: wh } = BATH.window;
const DISC = { cx: wx + ww / 2, cy: wy + wh + 170, r: 330 };

const buildBathroom = () => {
  const rand = mulberry32(hashSeed("bath-tiles"));
  const tiles = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 24 }, (_, col) => {
      const x = 3 + col * 80;
      const y = BATH.tileTop + row * 80;
      const tilt = rand() < 0.3 ? (rand() - 0.5) * 1.6 : 0;
      return {
        d: R(x, y, 74, 74, 3, `tile-${row}-${col}`, 0.9),
        fill: shade(PALETTE.paper, 0.95 + rand() * 0.06),
        transform: tilt
          ? `rotate(${tilt.toFixed(2)} ${x + 37} ${y + 37})`
          : undefined,
      };
    }),
  ).flat();

  const frame = `${R(wx, wy, ww, wh, 8, "win-out")} ${R(wx + 20, wy + 20, ww - 40, wh - 40, 4, "win-in", 0.8)}`;
  const starRand = mulberry32(hashSeed("stars"));
  const stars = Array.from({ length: 14 }, () => {
    const a = Math.PI * (0.15 + starRand() * 0.7);
    const r = 120 + starRand() * 190;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 2 + starRand() * 2.5 };
  });

  const clockTicks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 38 : 42;
    return {
      x1: Math.sin(a) * r0,
      y1: -Math.cos(a) * r0,
      x2: Math.sin(a) * 47,
      y2: -Math.cos(a) * 47,
      w: i % 3 === 0 ? 4 : 2.4,
    };
  });

  return {
    tiles,
    trim: R(-10, 424, 1940, 14, 2, "trim", 0.8),
    skirting: R(-10, 838, 1940, 30, 2, "skirting", 1),
    sky: R(wx + 16, wy + 16, ww - 32, wh - 32, 4, "sky", 0.6),
    skyClip: `M ${wx + 18} ${wy + 18} H ${wx + ww - 18} V ${wy + wh - 18} H ${wx + 18} Z`,
    dayHalf: W(
      [
        [-DISC.r, 0],
        [-DISC.r * 0.7, -DISC.r * 0.7],
        [0, -DISC.r],
        [DISC.r * 0.7, -DISC.r * 0.7],
        [DISC.r, 0],
      ],
      "disc-day",
      1,
    ),
    nightHalf: W(
      [
        [DISC.r, 0],
        [DISC.r * 0.7, DISC.r * 0.7],
        [0, DISC.r],
        [-DISC.r * 0.7, DISC.r * 0.7],
        [-DISC.r, 0],
      ],
      "disc-night",
      1,
    ),
    sun: E(0, -DISC.r + 105, 44, 44, "sun"),
    moon: `${E(0, DISC.r - 105, 38, 38, "moon")}`,
    moonBite: E(16, DISC.r - 113, 32, 32, "moon-bite", 0.6),
    stars,
    cloud: W(
      [
        [wx + 200, wy + 196],
        [wx + 226, wy + 170],
        [wx + 262, wy + 166],
        [wx + 288, wy + 182],
        [wx + 300, wy + 204],
        [wx + 196, wy + 210],
      ],
      "cloud",
      1.6,
    ),
    frame,
    mullionV: R(wx + 169, wy + 20, 12, wh - 40, 1, "mull-v", 0.6),
    mullionH: R(wx + 20, wy + 134, ww - 40, 12, 1, "mull-h", 0.6),
    sill: R(wx - 14, wy + wh - 4, ww + 28, 20, 3, "sill"),
    clockRim: E(0, 0, 64, 64, "clock-rim", 1.4),
    clockFace: E(0, 0, 53, 53, "clock-face", 0.8),
    clockTicks,
    hourHand: W(
      [
        [-4, 6],
        [4, 6],
        [2.5, -30],
        [-2.5, -30],
      ],
      "hour",
      0.4,
    ),
    minuteHand: W(
      [
        [-3, 8],
        [3, 8],
        [1.5, -44],
        [-1.5, -44],
      ],
      "minute",
      0.4,
    ),
    mirrorFrame: R(1030, 150, 260, 270, 34, "mirror-frame"),
    mirrorGlass: R(1046, 166, 228, 238, 22, "mirror-glass", 0.8),
    glare1: W(
      [
        [1100, 186],
        [1128, 186],
        [1080, 250],
        [1052, 250],
      ],
      "glare1",
      0.5,
    ),
    glare2: W(
      [
        [1140, 186],
        [1152, 186],
        [1124, 226],
        [1112, 226],
      ],
      "glare2",
      0.4,
    ),
    hookPlate: R(1340, 184, 24, 14, 4, "hook-plate", 0.5),
    pendant: E(1350, 318, 20, 20, "pendant", 0.7),
    button: E(1350, 318, 9, 9, "button", 0.4),
    sinkRim: R(990, 452, 340, 20, 8, "sink-rim"),
    basin: W(
      [
        [1000, 470],
        [1320, 470],
        [1300, 520],
        [1250, 546],
        [1070, 546],
        [1020, 520],
      ],
      "basin",
    ),
    pedestal: W(
      [
        [1132, 544],
        [1188, 544],
        [1204, 850],
        [1116, 850],
      ],
      "pedestal",
    ),
    tap: W(
      [
        [1150, 460],
        [1150, 416],
        [1206, 416],
        [1206, 432],
        [1170, 432],
        [1170, 460],
      ],
      "tap",
      0.6,
    ),
    tapHandle: E(1160, 410, 12, 5, "tap-handle", 0.5),
    rail: R(1440, 462, 210, 8, 3, "rail", 0.5),
    towel: W(
      [
        [1462, 466],
        [1628, 466],
        [1636, 700],
        [1600, 706],
        [1540, 701],
        [1490, 707],
        [1456, 702],
      ],
      "towel",
      2,
    ),
    towelFold: R(1462, 466, 166, 22, 3, "towel-fold", 1),
    stripe1: R(1458, 636, 178, 8, 1, "stripe1", 0.8),
    stripe2: R(1458, 654, 178, 8, 1, "stripe2", 0.8),
    tubRim: R(1416, 676, 540, 26, 12, "tub-rim"),
    tub: R(1430, 694, 520, 176, 38, "tub"),
  };
};

// Morning 8:05 by default. `night` 0 → 1 turns the sun/moon disc half a turn and darkens the sky.
// `drip` 0 → 1 is one falling drop from the tap.
export const BathroomSet: React.FC<{
  clockHours?: number;
  night?: number;
  drip?: number;
  camera?: React.ReactNode;
}> = ({ clockHours = 8 + 5 / 60, night = 0, drip = 0, camera }) => {
  const P = useMemo(buildBathroom, []);
  const { x: cx, y: cy } = BATH.clock;
  const hour = ((clockHours % 12) / 12) * 360;
  const minute = ((clockHours % 1) * 360 + 360) % 360;
  const discAngle = night * 180;

  return (
    <g>
      <defs>
        <linearGradient id="tub-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.paper} stopOpacity={0} />
          <stop offset="100%" stopColor={PALETTE.ink} stopOpacity={0.16} />
        </linearGradient>
        <clipPath id="window-clip">
          <path d={P.skyClip} />
        </clipPath>
      </defs>

      <rect x={0} y={0} width={1920} height={880} fill={PALETTE.kraft} />
      <rect
        x={0}
        y={0}
        width={1920}
        height={880}
        fill="url(#tex-fiber)"
        opacity={0.28}
      />
      <rect
        x={0}
        y={0}
        width={1920}
        height={880}
        fill="url(#tex-grain)"
        opacity={0.5}
      />
      <rect x={0} y={0} width={1920} height={880} filter="url(#f-mottle)" />

      {/* Window: a half-day, half-night paper disc turns behind the cut frame. */}
      <Piece
        d={P.sky}
        fill={shade(DERIVED.sky, 1 - night * 0.55)}
        shadow={null}
      />
      <g clipPath="url(#window-clip)">
        <g transform={`translate(${DISC.cx} ${DISC.cy}) rotate(${discAngle})`}>
          <Piece d={P.dayHalf} fill={DERIVED.sky} shadow={null} />
          <Piece d={P.nightHalf} fill={PALETTE.night} shadow={null}>
            {P.stars.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.s}
                fill={PALETTE.paper}
                opacity={0.85}
              />
            ))}
          </Piece>
          <Piece d={P.sun} fill={PALETTE.warm} shadow="sh-flat" />
          <g transform={`rotate(180 0 ${DISC.r - 105})`}>
            <Piece d={P.moon} fill={PALETTE.paper} shadow="sh-flat" />
          </g>
          <path
            d={P.moonBite}
            fill={PALETTE.night}
            transform={`rotate(180 0 ${DISC.r - 105})`}
          />
        </g>
        <Piece
          d={P.cloud}
          fill={PALETTE.paper}
          shadow="sh-flat"
          opacity={1 - night}
        />
      </g>
      <Piece
        d={P.mullionV}
        fill={PALETTE.cardboard}
        material="card"
        depth={3}
      />
      <Piece
        d={P.mullionH}
        fill={PALETTE.cardboard}
        material="card"
        depth={3}
      />
      <Piece
        d={P.frame}
        fill={PALETTE.cardboard}
        material="card"
        depth={6}
        fillRule="evenodd"
      />
      <Piece
        d={P.sill}
        fill={shade(PALETTE.cardboard, 1.05)}
        material="card"
        depth={5}
      />

      <Piece d={P.trim} fill={DERIVED.towel} shadow="sh-flat" />
      <g filter="url(#sh-flat)">
        {P.tiles.map((t, i) => (
          <Piece
            key={i}
            d={t.d}
            fill={t.fill}
            shadow={null}
            transform={t.transform}
          />
        ))}
      </g>
      <Piece
        d={P.skirting}
        fill={PALETTE.cardboard}
        material="card"
        depth={5}
      />

      <g transform={`translate(${cx} ${cy})`}>
        <Piece
          d={P.clockRim}
          fill={PALETTE.cardboard}
          material="card"
          depth={6}
        />
        <Piece d={P.clockFace} fill={PALETTE.paper} shadow="sh-flat">
          {P.clockTicks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={PALETTE.ink}
              strokeWidth={t.w}
              strokeLinecap="round"
            />
          ))}
        </Piece>
        <Piece
          d={P.hourHand}
          fill={PALETTE.ink}
          shadow="sh-s"
          transform={`rotate(${hour.toFixed(2)})`}
        />
        <Piece
          d={P.minuteHand}
          fill={PALETTE.ink}
          shadow="sh-s"
          transform={`rotate(${minute.toFixed(2)})`}
        />
        <circle r={5} fill={DERIVED.brass} filter="url(#sh-s)" />
      </g>

      <Piece
        d={P.mirrorFrame}
        fill={PALETTE.cardboard}
        material="card"
        depth={6}
      />
      <Piece d={P.mirrorGlass} fill={DERIVED.mirror} shadow="sh-flat">
        <path d={P.glare1} fill={PALETTE.paper} opacity={0.55} />
        <path d={P.glare2} fill={PALETTE.paper} opacity={0.45} />
      </Piece>

      {/* The panic-button pendant: hanging on its hook, far from where Mari will fall. */}
      <Piece d={P.hookPlate} fill={DERIVED.steel} shadow="sh-s" />
      <path
        d="M 1352 194 v 12 q 0 10 -9 7"
        stroke={PALETTE.ink}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        filter="url(#sh-s)"
      />
      <path
        d="M 1352 206 Q 1349 260 1350 298"
        stroke={PALETTE.ink}
        strokeWidth={2}
        fill="none"
        filter="url(#sh-s)"
      />
      <Piece d={P.pendant} fill={PALETTE.paper} depth={3} shadow="sh-s">
        <path d={P.button} fill={PALETTE.red} />
        <circle cx={1347} cy={315} r={2.5} fill={PALETTE.paper} opacity={0.8} />
      </Piece>

      <Piece d={P.pedestal} fill={shade(PALETTE.paper, 0.97)} />
      <Piece d={P.basin} fill={PALETTE.paper} depth={3} />
      <Piece d={P.sinkRim} fill={shade(PALETTE.paper, 1.02)} depth={4} />
      <Piece d={P.tap} fill={DERIVED.steel} depth={2} shadow="sh-s" />
      <Piece d={P.tapHandle} fill={DERIVED.steel} depth={2} shadow="sh-s" />
      {drip > 0 && drip < 1 ? (
        <path
          d="M 0 -6 q 4 8 0 11 q -4 -3 0 -11 Z"
          transform={`translate(${BATH.tap[0]} ${BATH.tap[1] + drip * drip * 28})`}
          fill={DERIVED.mirror}
          stroke={shade(DERIVED.mirror, 0.8)}
          strokeWidth={0.8}
        />
      ) : null}

      <Piece d={P.rail} fill={DERIVED.steel} depth={2} shadow="sh-s" />
      <Piece d={P.towel} fill={DERIVED.towel}>
        <path d={P.towelFold} fill={shade(DERIVED.towel, 0.86)} />
        <path d={P.stripe1} fill={PALETTE.paper} opacity={0.9} />
        <path d={P.stripe2} fill={PALETTE.paper} opacity={0.9} />
      </Piece>
      <Piece d={P.tub} fill={PALETTE.paper} depth={7}>
        <path d={P.tub} fill="url(#tub-shade)" />
      </Piece>
      <Piece d={P.tubRim} fill={shade(PALETTE.paper, 1.02)} depth={4} />

      {camera}

      <PerspectiveFloor
        rows={[866, 894, 930, 976, 1034, 1104]}
        vp={[960, -900]}
        spacing={190}
        tile={[PALETTE.paper, DERIVED.towel]}
        grout={DERIVED.steel}
        seed="bath-floor"
      />
    </g>
  );
};

const buildCamera = () => ({
  plate: R(1846, 48, 30, 44, 6, "cam-plate", 0.6),
  arm: R(1806, 62, 46, 10, 2, "cam-arm", 0.5),
  body: R(1716, 70, 112, 56, 14, "cam-body", 0.9),
  lens: E(1726, 98, 20, 20, "lens-ring", 0.5),
  drape: W(
    [
      [1690, 52],
      [1846, 40],
      [1862, 150],
      [1830, 196],
      [1772, 176],
      [1712, 204],
      [1676, 150],
    ],
    "cam-drape",
    2.4,
  ),
  drapeStripe: R(1680, 160, 180, 7, 1, "cam-drape-stripe", 0.8),
});

// The wall camera. `covered` 0 → 1 drapes the towel over it (the LED still glows faintly through);
// `peel` 0 → 1 lifts it off the wall like a sticker and lets it fall out of frame.
export const WallCamera: React.FC<{
  ledOn: boolean;
  covered?: number;
  peel?: number;
}> = ({ ledOn, covered = 0, peel = 0 }) => {
  const P = useMemo(buildCamera, []);
  const { x, y } = BATH.camera;
  const lift = Math.min(1, peel * 2.5);
  const fall = Math.max(0, peel - 0.4) / 0.6;
  const peelT = `translate(${-lift * 6 + fall * 40} ${fall * fall * 1100}) rotate(${-lift * 18 + fall * 70} 1860 70)`;
  return (
    <g transform={peelT}>
      <defs>
        <radialGradient id="led-red">
          <stop offset="0%" stopColor={PALETTE.red} stopOpacity={0.65} />
          <stop offset="100%" stopColor={PALETTE.red} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g filter={lift > 0 ? "url(#sh)" : undefined}>
        <Piece d={P.plate} fill={DERIVED.steel} shadow="sh-s" />
        <Piece d={P.arm} fill={DERIVED.steel} shadow="sh-s" />
        <g transform={`rotate(-16 ${x} ${y})`}>
          <Piece d={P.body} fill={PALETTE.paper} depth={5}>
            <path d={P.lens} fill={PALETTE.ink} />
            <circle cx={1726} cy={98} r={11} fill={PALETTE.night} />
            <circle
              cx={1722}
              cy={94}
              r={3.5}
              fill={PALETTE.paper}
              opacity={0.85}
            />
          </Piece>
          {ledOn && covered < 1 ? (
            <circle
              cx={BATH.ledAt[0]}
              cy={BATH.ledAt[1]}
              r={28}
              fill="url(#led-red)"
            />
          ) : null}
          <circle
            cx={BATH.ledAt[0]}
            cy={BATH.ledAt[1]}
            r={6}
            fill={ledOn ? PALETTE.red : shade(PALETTE.red, 0.5)}
          />
        </g>
      </g>
      {covered > 0 ? (
        <g
          transform={`translate(${(1 - covered) * -260} ${(1 - covered) * 180}) rotate(${(1 - covered) * -40} 1770 120)`}
        >
          <Piece d={P.drape} fill={DERIVED.towel}>
            <path d={P.drapeStripe} fill={PALETTE.paper} opacity={0.9} />
          </Piece>
          {covered >= 1 && ledOn ? (
            <circle
              cx={BATH.ledAt[0] - 4}
              cy={BATH.ledAt[1] + 14}
              r={22}
              fill="url(#led-red)"
              opacity={0.55}
            />
          ) : null}
        </g>
      ) : null}
    </g>
  );
};

// Morning light through the window, painted over everything (screen blend).
export const WindowLight: React.FC<{ strength?: number }> = ({
  strength = 1,
}) => {
  const specks = useMemo(() => {
    const r = mulberry32(hashSeed("dust"));
    return Array.from({ length: 16 }, () => ({
      x: 420 + r() * 520,
      y: 300 + r() * 520,
      r: 1 + r() * 1.8,
    }));
  }, []);
  if (strength <= 0) return null;
  return (
    <g style={{ mixBlendMode: "screen" }} opacity={strength}>
      <defs>
        <linearGradient id="shaft" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={PALETTE.warm} stopOpacity={0.6} />
          <stop offset="100%" stopColor={PALETTE.warm} stopOpacity={0.04} />
        </linearGradient>
      </defs>
      <path
        d="M 190 140 L 500 140 L 1240 1000 L 760 1000 Z"
        fill="url(#shaft)"
        filter="url(#soft-12)"
      />
      <ellipse
        cx={1010}
        cy={968}
        rx={260}
        ry={40}
        fill={PALETTE.warm}
        opacity={0.24}
        filter="url(#soft-12)"
      />
      {specks.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={PALETTE.paper}
          opacity={0.5}
        />
      ))}
    </g>
  );
};
