import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { floorEnvelope, floorWave, type Impact } from "../fx/ripple";
import { mix, shade } from "../lib/color";
import { cut, densify, roundRect, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

// Two-room cutaway on a cardboard table. Every cut face shows its corrugation.
export const HOUSE = {
  x0: 150,
  x1: 1770,
  wall: 34,
  ceilY: 196,
  ceilT: 30,
  floorY: 610,
  screedTop: 624,
  screedMid: 639,
  slabTop: 654,
  slabBottom: 702,
  groundBottom: 746,
  part: { x: 930, w: 26, doorTop: 372 },
} as const;

const R = (x: number, y: number, w: number, h: number, r: number, seed: string, wobble = 1.1) =>
  cut(roundRect(x, y, w, h, r, 7), seed, { wobble, jitter: 0.3, wavelength: 40 });
const W = (pts: Pt[], seed: string, wobble = 1.1) => cut(densify(pts, 8), seed, { wobble, jitter: 0.3, wavelength: 40 });

// Cut edge of corrugated board: two liners with the fluted wave between them.
const Corrugated: React.FC<{ x: number; y: number; w: number; h: number; vertical?: boolean; seed: string }> = ({
  x,
  y,
  w,
  h,
  vertical = false,
  seed,
}) => {
  const p = useMemo(() => {
    const thick = vertical ? w : h;
    const len = vertical ? h : w;
    const liner = Math.max(3, thick * 0.15);
    const amp = thick / 2 - liner - 0.5;
    const pts: string[] = [];
    for (let s = 0; s <= len; s += 1.5) {
      const off = Math.sin((s / 15) * Math.PI * 2) * amp;
      const [px, py] = vertical ? [x + w / 2 + off, y + s] : [x + s, y + h / 2 + off];
      pts.push(`${s === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return {
      outline: R(x, y, w, h, 1, seed, 0.8),
      wave: pts.join(" "),
      liners: vertical
        ? [
            [x, y, liner, h],
            [x + w - liner, y, liner, h],
          ]
        : [
            [x, y, w, liner],
            [x, y + h - liner, w, liner],
          ],
    };
  }, [x, y, w, h, vertical, seed]);
  return (
    <Piece d={p.outline} fill={shade(PALETTE.cardboard, 0.48)} material="card">
      <path d={p.wave} stroke={shade(PALETTE.cardboard, 1.06)} strokeWidth={2.4} fill="none" />
      {p.liners.map(([lx, ly, lw, lh], i) => (
        <rect key={i} x={lx} y={ly} width={lw} height={lh} fill={PALETTE.cardboard} />
      ))}
    </Piece>
  );
};

const build = () => {
  const { x0, x1, floorY, part } = HOUSE;
  const roof: Pt[] = [
    [x0 - 40, 206],
    [960, 34],
    [x1 + 40, 206],
  ];
  const shingles = Array.from({ length: 4 }, (_, j) => {
    const yRow = 204 - j * 40;
    const r = 21;
    let d = `M ${x0 - 60} ${yRow - 46} H ${x1 + 60} V ${yRow}`;
    for (let x = x1 + 60; x > x0 - 60; x -= 2 * r) d += ` A ${r} ${r} 0 0 1 ${x - 2 * r} ${yRow}`;
    return { d: `${d} Z`, fill: shade(PALETTE.kraft, j % 2 ? 0.92 : 1.02) };
  });
  const rightTiles = Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 21 }, (_, col) => R(958 + col * 38, 458 + row * 38, 34, 34, 2, `wt-${row}-${col}`, 0.6)),
  ).flat();
  const floorTiles = Array.from({ length: 51 }, (_, i) => {
    const x = x0 + i * 32;
    return { d: R(x, floorY + 1, 29, 12, 1, `ft-${i}`, 0.5), fill: x < part.x ? PALETTE.kraft : PALETTE.paper };
  });
  return {
    roof: W(roof, "roof", 1.4),
    roofPath: `M ${roof.map((p) => p.join(" ")).join(" L ")} Z`,
    shingles,
    eave: R(x0 - 46, 198, x1 - x0 + 92, 12, 2, "eave"),
    chimney: R(1330, 64, 64, 120, 3, "chimney"),
    leftWall: R(184, 226, part.x - 184, floorY - 226, 0, "left-wall", 0.6),
    rightWall: R(part.x + part.w, 226, 1736 - part.x - part.w, floorY - 226, 0, "right-wall", 0.6),
    rightTiles,
    skirting: R(184, floorY - 14, part.x - 184, 14, 1, "skirt-l", 0.6),
    frame: R(430, 330, 130, 100, 4, "pic-frame"),
    picture: R(444, 344, 102, 72, 2, "picture", 0.6),
    pictureSun: cut(roundRect(498, 360, 26, 26, 13, 3), "pic-sun", { wobble: 0.5 }),
    cabinet: R(230, 520, 120, 90, 3, "cabinet"),
    lampShade: W([[246, 454], [334, 454], [346, 500], [234, 500]], "lamp-shade", 0.8),
    lampStem: R(286, 500, 8, 20, 1, "lamp-stem", 0.4),
    lintel: R(part.x - 12, part.doorTop - 6, part.w + 24, 12, 2, "lintel"),
    mirrorFrame: R(1010, 300, 110, 120, 16, "m-frame"),
    mirrorGlass: R(1020, 310, 90, 100, 10, "m-glass", 0.6),
    sinkRim: R(990, 470, 150, 12, 4, "s-rim"),
    basin: W([[996, 482], [1134, 482], [1120, 508], [1010, 508]], "s-basin", 0.7),
    pedestal: W([[1052, 506], [1078, 506], [1086, floorY], [1044, floorY]], "s-ped", 0.6),
    tubRim: R(1528, 512, 220, 14, 6, "t-rim"),
    tub: R(1536, 524, 200, 86, 22, "t-body"),
    floorTiles,
    screed: R(x0, HOUSE.screedTop, x1 - x0, HOUSE.slabTop - HOUSE.screedTop, 0, "screed", 0.6),
    ground: R(x0 - 30, HOUSE.slabBottom, x1 - x0 + 60, HOUSE.groundBottom - HOUSE.slabBottom, 2, "ground", 1.6),
    table: R(-20, HOUSE.groundBottom, 1960, 1100 - HOUSE.groundBottom, 0, "table", 0.8),
  };
};

export const useHouse = () => useMemo(build, []);

// Backdrop, table, roof, back walls and furniture: everything behind the characters.
export const HouseBack: React.FC = () => {
  const P = useHouse();
  return (
    <g>
      <defs>
        <pattern id="wallpaper" patternUnits="userSpaceOnUse" width={46} height={10}>
          <rect width={15} height={10} fill={PALETTE.kraft} opacity={0.3} />
        </pattern>
        <clipPath id="roof-clip">
          <path d={P.roofPath} />
        </clipPath>
      </defs>
      <rect width={1920} height={1080} fill={PALETTE.kraft} />
      <rect width={1920} height={1080} fill="url(#tex-grain)" opacity={0.5} />
      <rect width={1920} height={1080} filter="url(#f-mottle)" />
      <Piece d={P.table} fill={PALETTE.cardboard} material="card" shadow={null} />

      <Piece d={P.chimney} fill={PALETTE.cardboard} material="card" depth={5} />
      <Piece d={P.roof} fill={PALETTE.cardboard} material="card" depth={8}>
        <g clipPath="url(#roof-clip)">
          {P.shingles.map((s, i) => (
            <Piece key={i} d={s.d} fill={s.fill} material="kraft" shadow="sh-flat" />
          ))}
        </g>
      </Piece>
      <Piece d={P.eave} fill={shade(PALETTE.cardboard, 0.9)} material="card" depth={4} />

      <Piece d={P.leftWall} fill={PALETTE.paper} shadow={null}>
        <path d={P.leftWall} fill="url(#wallpaper)" />
      </Piece>
      <Piece d={P.rightWall} fill={PALETTE.kraft} material="kraft" shadow={null} />
      <g filter="url(#sh-flat)">
        {P.rightTiles.map((d, i) => (
          <Piece key={i} d={d} fill={PALETTE.paper} shadow={null} />
        ))}
      </g>
      <Piece d={P.skirting} fill={PALETTE.cardboard} material="card" shadow="sh-flat" />

      <Piece d={P.frame} fill={PALETTE.cardboard} material="card" depth={4}>
        <Piece d={P.picture} fill={DERIVED.sky} shadow="sh-flat">
          <path d={P.pictureSun} fill={PALETTE.warm} />
        </Piece>
      </Piece>
      <Piece d={P.cabinet} fill={shade(PALETTE.cardboard, 1.05)} material="card" depth={6} />
      <Piece d={P.lampStem} fill={DERIVED.steel} shadow="sh-s" />
      <Piece d={P.lampShade} fill={mix([PALETTE.warm, 0.45], [PALETTE.paper, 0.55])} depth={3} />

      <Piece d={P.mirrorFrame} fill={PALETTE.cardboard} material="card" depth={4}>
        <path d={P.mirrorGlass} fill={DERIVED.mirror} />
      </Piece>
      <Piece d={P.pedestal} fill={shade(PALETTE.paper, 0.97)} />
      <Piece d={P.basin} fill={PALETTE.paper} depth={2} />
      <Piece d={P.sinkRim} fill={PALETTE.paper} depth={3} />
      <Piece d={P.tub} fill={PALETTE.paper} depth={5} />
      <Piece d={P.tubRim} fill={PALETTE.paper} depth={3} />
    </g>
  );
};

// The section plane: walls, ceiling and the floor build-up (tiles, screed, slab, ground).
export const HouseFront: React.FC = () => {
  const P = useHouse();
  const { x0, x1, wall, ceilY, ceilT, floorY, part } = HOUSE;
  return (
    <g>
      <Corrugated x={x0} y={ceilY} w={x1 - x0} h={ceilT} seed="ceil" />
      <Corrugated x={x0} y={ceilY} w={wall} h={HOUSE.slabBottom - ceilY} vertical seed="wall-l" />
      <Corrugated x={x1 - wall} y={ceilY} w={wall} h={HOUSE.slabBottom - ceilY} vertical seed="wall-r" />
      <Corrugated x={part.x} y={ceilY + ceilT} w={part.w} h={part.doorTop - ceilY - ceilT} vertical seed="part" />
      <Piece d={P.lintel} fill={PALETTE.cardboard} material="card" depth={3} />

      <rect x={x0} y={floorY} width={x1 - x0} height={HOUSE.screedTop - floorY} fill={DERIVED.steel} />
      <g filter="url(#sh-flat)">
        {P.floorTiles.map((t, i) => (
          <Piece key={i} d={t.d} fill={t.fill} shadow={null} />
        ))}
      </g>
      <Piece d={P.screed} fill={PALETTE.kraft} material="kraft" shadow="sh-flat">
        <path d={P.screed} fill="url(#tex-grain)" opacity={0.6} />
      </Piece>
      <Corrugated x={x0} y={HOUSE.slabTop} w={x1 - x0} h={HOUSE.slabBottom - HOUSE.slabTop} seed="slab" />
      <Piece d={P.ground} fill={shade(PALETTE.cardboard, 0.62)} material="card" />
    </g>
  );
};

// The vibration travelling through the screed, drawn as a teal line. Brightness follows the envelope,
// so quiet floor stays a faint guide line and a passing wave lights up.
export const FloorRipple: React.FC<{ t: number; impacts: readonly Impact[]; color?: string }> = ({
  t,
  impacts,
  color = PALETTE.teal,
}) => {
  const step = 4;
  const chunk = 6;
  const samples: { x: number; y: number; e: number }[] = [];
  for (let x = HOUSE.x0 + 2; x <= HOUSE.x1 - 2; x += step) {
    samples.push({ x, y: HOUSE.screedMid + floorWave(x, t, impacts), e: floorEnvelope(x, t, impacts) });
  }
  const chunks: { d: string; o: number }[] = [];
  for (let i = 0; i < samples.length - 1; i += chunk) {
    const part = samples.slice(i, i + chunk + 1);
    const e = Math.max(...part.map((s) => s.e));
    chunks.push({
      d: part.map((s, j) => `${j === 0 ? "M" : "L"}${s.x} ${s.y.toFixed(2)}`).join(" "),
      o: 0.2 + 0.8 * Math.min(1, e / 2.2),
    });
  }
  const marks = impacts.filter((im) => t - im.t >= 0 && t - im.t < 0.4);
  return (
    <g>
      {chunks.map((c, i) => (
        <path key={`g${i}`} d={c.d} stroke={color} strokeWidth={9} strokeOpacity={c.o * 0.28} fill="none" strokeLinecap="round" />
      ))}
      {chunks.map((c, i) => (
        <path key={i} d={c.d} stroke={color} strokeWidth={3.4} strokeOpacity={c.o} fill="none" strokeLinecap="round" />
      ))}
      {marks.map((im, i) => {
        const age = (t - im.t) / 0.4;
        return [12, 22, 32].map((r, j) => (
          <path
            key={`${i}-${j}`}
            d={`M ${im.x - r * (1 + age)} ${HOUSE.floorY - 2} A ${r * (1 + age)} ${r * (1 + age) * 0.55} 0 0 1 ${im.x + r * (1 + age)} ${HOUSE.floorY - 2}`}
            stroke={color}
            strokeWidth={2.6}
            strokeOpacity={(1 - age) * (1 - j * 0.25)}
            fill="none"
          />
        ));
      })}
    </g>
  );
};
