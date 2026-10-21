import { useMemo } from "react";
import data from "../captions.json";
import { Piece } from "../components/material/Piece";
import { RUBIK, WEIGHT } from "../fonts";
import { mix, shade } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { cut, densify, roundRect, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

const R = (x: number, y: number, w: number, h: number, r: number, seed: string, wobble = 1) =>
  cut(roundRect(x, y, w, h, r, 6), seed, { wobble, jitter: 0.3, wavelength: 34 });
const W = (pts: Pt[], seed: string, wobble = 1.2) => cut(densify(pts, 7), seed, { wobble, jitter: 0.3, wavelength: 34 });

export const ON = data.onscreen;

// Rough width of a Rubik string, for sizing paper tags around it.
const textWidth = (s: string, size: number, weight = 700) => [...s].length * size * (weight >= 700 ? 0.6 : 0.55);

export const FlyingTowel: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => {
  const d = useMemo(() => W([[-56, -30], [16, -46], [60, -8], [44, 36], [-8, 48], [-52, 22]], "fly-towel", 3), []);
  const s = useMemo(() => R(-50, 14, 104, 7, 1, "fly-stripe", 0.6), []);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Piece d={d} fill={DERIVED.towel}>
        <path d={s} fill={PALETTE.paper} opacity={0.9} />
      </Piece>
    </g>
  );
};

export const Puddle: React.FC<{ x: number; y: number; amount: number }> = ({ x, y, amount }) => {
  const d = useMemo(() => W([[-100, 0], [-60, -12], [10, -10], [80, -14], [110, -2], [70, 10], [-20, 12], [-80, 9]], "puddle", 2), []);
  if (amount <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${amount} 1)`} opacity={0.85}>
      <Piece d={d} fill={DERIVED.mirror} shadow="sh-flat">
        <path d="M -40 -4 L 20 -6" stroke={PALETTE.paper} strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      </Piece>
    </g>
  );
};

// Cardboard cassette whose reels spin during the rewind.
export const Cassette: React.FC<{ x: number; y: number; angle: number; scale?: number }> = ({ x, y, angle, scale = 1 }) => {
  const p = useMemo(
    () => ({
      body: R(-110, -70, 220, 140, 14, "cas-body"),
      label: R(-92, -58, 184, 46, 6, "cas-label", 0.6),
      window: R(-70, 0, 140, 46, 20, "cas-window", 0.6),
    }),
    [],
  );
  const reel = (cx: number) => (
    <g transform={`translate(${cx} 23) rotate(${angle})`}>
      <circle r={19} fill={PALETTE.paper} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x={-2.5} y={-17} width={5} height={9} fill={PALETTE.ink} transform={`rotate(${a})`} />
      ))}
      <circle r={6} fill={PALETTE.ink} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Piece d={p.body} fill={PALETTE.cardboard} material="card" depth={6}>
        <path d={p.label} fill={PALETTE.paper} />
        <path d="M -80 -38 H 80 M -80 -26 H 40" stroke={PALETTE.teal} strokeWidth={4} strokeLinecap="round" />
        <path d={p.window} fill={shade(PALETTE.ink, 1.3)} />
        {reel(-38)}
        {reel(38)}
      </Piece>
      {/* Rewind arrows, cut from red paper. */}
      <g transform="translate(0 -104)" filter="url(#sh-s)">
        <path d="M 6 -18 L -24 0 L 6 18 Z M 40 -18 L 10 0 L 40 18 Z" fill={PALETTE.red} />
      </g>
    </g>
  );
};

// A paper label. Optional string to the thing it names.
export const PaperTag: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  rot?: number;
  fill?: string;
  ink?: string;
  anchor?: Pt;
  seed: string;
  scale?: number;
}> = ({ x, y, text, size = 30, rot = -2, fill = PALETTE.paper, ink = PALETTE.ink, anchor, seed, scale = 1 }) => {
  const w = textWidth(text, size) + size * 1.4;
  const h = size * 1.7;
  const d = useMemo(
    () =>
      W(
        [
          [-w / 2 + h * 0.35, -h / 2],
          [w / 2, -h / 2],
          [w / 2, h / 2],
          [-w / 2 + h * 0.35, h / 2],
          [-w / 2, 0],
        ],
        seed,
        0.8,
      ),
    [w, h, seed],
  );
  if (scale <= 0.01) return null;
  return (
    <g>
      {anchor ? (
        <path
          d={`M ${x - w * scale * 0.42} ${y} Q ${(x + anchor[0]) / 2} ${Math.max(y, anchor[1]) + 30} ${anchor[0]} ${anchor[1]}`}
          stroke={PALETTE.ink}
          strokeWidth={2}
          fill="none"
          opacity={0.75}
        />
      ) : null}
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
        <Piece d={d} fill={fill} depth={2}>
          <circle cx={-w / 2 + h * 0.36} cy={0} r={4.5} fill={shade(fill, 0.55)} />
          <text
            x={h * 0.18}
            y={1}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily={RUBIK}
            fontWeight={WEIGHT.tag}
            fontSize={size}
            fill={ink}
          >
            {text}
          </text>
        </Piece>
      </g>
    </g>
  );
};

export const WifiIcon: React.FC<{ x: number; y: number; scale?: number; color?: string }> = ({ x, y, scale = 1, color = PALETTE.teal }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#sh-s)" fill="none" stroke={color} strokeLinecap="round">
    <path d="M -36 -10 A 52 52 0 0 1 36 -10" strokeWidth={9} />
    <path d="M -22 4 A 32 32 0 0 1 22 4" strokeWidth={9} />
    <circle cx={0} cy={20} r={7} fill={color} stroke="none" />
  </g>
);

// Speech bubble cut with sound-wave arcs on its edge: the device is talking.
export const SoundBubble: React.FC<{ x: number; y: number; text: string; revealed: number; tail: Pt; size?: number }> = ({
  x,
  y,
  text,
  revealed,
  tail,
  size = 40,
}) => {
  const words = text.split(" ");
  const w = textWidth(text, size, 500) + 90;
  const h = size * 2.1;
  const body = useMemo(() => R(-w / 2, -h / 2, w, h, h / 2, `bubble-${text}`), [w, h, text]);
  const tailD = useMemo(
    () =>
      W(
        [
          [-24, h / 2 - 6],
          [24, h / 2 - 6],
          [tail[0] - x, tail[1] - y],
        ],
        `bubble-tail-${text}`,
        0.6,
      ),
    [h, tail, x, y, text],
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${-w / 2 - 16 - i * 16} ${-h / 2 + 10} Q ${-w / 2 - 34 - i * 18} 0 ${-w / 2 - 16 - i * 16} ${h / 2 - 10}`}
          stroke={DERIVED.ledTeal}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={0.9 - i * 0.25}
        />
      ))}
      <Piece d={tailD} fill={PALETTE.paper} />
      <Piece d={body} fill={PALETTE.paper} depth={3}>
        <text textAnchor="middle" dominantBaseline="central" fontFamily={RUBIK} fontWeight={WEIGHT.caption} fontSize={size} fill={PALETTE.ink}>
          {words.map((wd, i) => (
            <tspan key={i} visibility={i < revealed ? "visible" : "hidden"}>
              {i < words.length - 1 ? `${wd} ` : wd}
            </tspan>
          ))}
        </text>
      </Piece>
    </g>
  );
};

// Ten-second countdown arc around the device, compressed to fit the scene.
export const CountdownRing: React.FC<{ cx: number; cy: number; r: number; progress: number; k?: number }> = ({
  cx,
  cy,
  r,
  progress,
  k = 0.42,
}) => {
  const a1 = -Math.PI / 2 + progress * Math.PI * 2;
  const large = progress > 0.5 ? 1 : 0;
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy + Math.sin(a1) * r * k;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * k} fill="none" stroke={PALETTE.paper} strokeOpacity={0.55} strokeWidth={10} />
      {progress > 0.002 ? (
        <path
          d={`M ${cx} ${cy - r * k} A ${r} ${r * k} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
          stroke={PALETTE.warm}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          filter="url(#sh-s)"
        />
      ) : null}
      <PaperTag x={cx + r + 70} y={cy - r * k - 10} text={ON.countdown} size={30} seed="countdown-tag" rot={3} />
    </g>
  );
};

// Cardboard phone. `lit` 0 → 1 wakes the screen and slides the notification in.
export const Phone: React.FC<{ x: number; y: number; lit: number; rot?: number; scale?: number }> = ({ x, y, lit, rot = 0, scale = 1 }) => {
  const p = useMemo(
    () => ({
      body: R(-120, -230, 240, 460, 34, "phone-body"),
      screen: R(-100, -196, 200, 392, 14, "phone-screen", 0.5),
      card: R(-96, -150, 192, 196, 12, "phone-card", 0.6),
    }),
    [],
  );
  const body = ["Mari néni elesett", "a fürdőszobában.", "Nem válaszol."];
  if (body.join(" ") !== ON.phoneBody) throw new Error("Phone text drifted from SCRIPT.md");
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <Piece d={p.body} fill={PALETTE.ink} depth={6}>
        <path d={p.screen} fill={lit > 0 ? mix([PALETTE.paper, 0.5 + lit * 0.5], [PALETTE.night, 0.5 - lit * 0.5]) : shade(PALETTE.night, 0.6)} />
        <text x={0} y={-168} textAnchor="middle" fontFamily={RUBIK} fontWeight={WEIGHT.tag} fontSize={22} fill={PALETTE.ink} opacity={lit}>
          {ON.phoneTime}
        </text>
        {lit > 0 ? (
          <g transform={`translate(0 ${(1 - Math.min(1, lit * 1.4)) * -60})`} opacity={Math.min(1, lit * 2)}>
            <Piece d={p.card} fill={PALETTE.paper} depth={2} shadow="sh-s">
              <rect x={-96} y={-150} width={192} height={38} fill={PALETTE.teal} />
              <circle cx={-74} cy={-131} r={8} fill={PALETTE.red} />
              <text x={-58} y={-131} dominantBaseline="central" fontFamily={RUBIK} fontWeight={900} fontSize={24} fill={PALETTE.paper}>
                {ON.phoneApp}
              </text>
              {body.map((l, i) => (
                <text key={i} x={-84} y={-80 + i * 34} fontFamily={RUBIK} fontWeight={WEIGHT.caption} fontSize={20} fill={PALETTE.ink}>
                  {l}
                </text>
              ))}
            </Piece>
          </g>
        ) : null}
      </Piece>
    </g>
  );
};

export const Keys: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} filter="url(#sh-s)">
    <circle r={11} fill="none" stroke={DERIVED.brass} strokeWidth={4} />
    <path d="M 6 8 l 6 34 l 6 -2 l -2 -8 l 4 -1 l -2 -6 l -4 1 l -3 -20 Z" fill={DERIVED.steel} />
    <path d="M -6 9 l -10 28 l 5 2 l 3 -7 l 4 1 l 2 -5 l -4 -2 l 4 -14 Z" fill={DERIVED.brass} />
  </g>
);

export const Desk: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const p = useMemo(
    () => ({
      top: R(-300, -18, 600, 26, 4, "desk-top"),
      legL: R(-270, 8, 26, 260, 2, "desk-leg-l"),
      legR: R(244, 8, 26, 260, 2, "desk-leg-r"),
      laptopBase: R(-200, -40, 230, 22, 4, "laptop-base"),
      laptopLid: W([[-196, -44], [-150, -200], [40, -200], [10, -44]], "laptop-lid", 0.8),
      mug: R(120, -80, 54, 62, 8, "mug"),
    }),
    [],
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <Piece d={p.legL} fill={shade(PALETTE.cardboard, 0.85)} material="card" />
      <Piece d={p.legR} fill={shade(PALETTE.cardboard, 0.85)} material="card" />
      <Piece d={p.top} fill={PALETTE.cardboard} material="card" depth={6} />
      <Piece d={p.laptopLid} fill={DERIVED.steel} depth={3} />
      <Piece d={p.laptopBase} fill={shade(DERIVED.steel, 0.9)} depth={3} />
      <Piece d={p.mug} fill={PALETTE.teal} depth={3}>
        <path d="M 174 -66 q 22 4 0 28" stroke={PALETTE.teal} strokeWidth={8} fill="none" />
      </Piece>
    </g>
  );
};

export const Chair: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const p = useMemo(
    () => ({
      seat: R(-80, -120, 160, 20, 4, "chair-seat"),
      back: R(-96, -330, 22, 230, 6, "chair-back"),
      leg: R(-8, -100, 16, 100, 2, "chair-leg"),
      foot: R(-70, -8, 140, 10, 4, "chair-foot"),
    }),
    [],
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <Piece d={p.back} fill={PALETTE.ink} />
      <Piece d={p.leg} fill={DERIVED.steel} />
      <Piece d={p.foot} fill={DERIVED.steel} />
      <Piece d={p.seat} fill={PALETTE.ink} depth={3} />
    </g>
  );
};

export const Pedestal: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 260, h = 120 }) => {
  const d = useMemo(() => R(-w / 2, -h, w, h, 6, "pedestal"), [w, h]);
  const top = useMemo(() => R(-w / 2 - 14, -h - 16, w + 28, 18, 4, "pedestal-top"), [w, h]);
  return (
    <g transform={`translate(${x} ${y})`}>
      <Piece d={d} fill={PALETTE.cardboard} material="card" depth={8} />
      <Piece d={top} fill={shade(PALETTE.cardboard, 1.08)} material="card" depth={4} />
    </g>
  );
};

// Paper specks that drift down after the thud in the dark (S01).
export const Dust: React.FC<{ t: number; hit: number; count?: number }> = ({ t, hit, count = 40 }) => {
  const specks = useMemo(() => {
    const r = mulberry32(hashSeed("s01-dust"));
    return Array.from({ length: count }, () => ({ x: 300 + r() * 1320, y0: 80 + r() * 500, v: 40 + r() * 70, s: 1.2 + r() * 2.6, ph: r() * 6 }));
  }, [count]);
  const tau = t - hit;
  if (tau <= 0) return null;
  return (
    <g>
      {specks.map((p, i) => (
        <circle
          key={i}
          cx={p.x + Math.sin(tau * 1.3 + p.ph) * 10}
          cy={p.y0 + p.v * tau}
          r={p.s}
          fill={PALETTE.paper}
          opacity={Math.min(0.75, tau * 3) * Math.max(0, 1 - tau / 5)}
        />
      ))}
    </g>
  );
};

// The camera's own view after the towel: towel weave and a red "NINCS KÉP" label.
export const MonitorInset: React.FC<{ x: number; y: number; show: number }> = ({ x, y, show }) => {
  const p = useMemo(
    () => ({
      frame: R(-190, -125, 380, 250, 14, "mon-frame"),
      screen: R(-170, -105, 340, 210, 8, "mon-screen", 0.5),
    }),
    [],
  );
  if (show <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * show}) rotate(${(1 - show) * -6})`} opacity={show >= 1 ? 1 : show}>
      <defs>
        <pattern id="weave" patternUnits="userSpaceOnUse" width={12} height={12}>
          <rect width={12} height={12} fill={DERIVED.towel} />
          <path d="M 0 3 H 12 M 0 9 H 12" stroke={shade(DERIVED.towel, 0.82)} strokeWidth={2} />
          <path d="M 3 0 V 12 M 9 0 V 12" stroke={shade(DERIVED.towel, 1.08)} strokeWidth={1.4} />
        </pattern>
      </defs>
      <Piece d={p.frame} fill={PALETTE.ink} depth={5}>
        <path d={p.screen} fill="url(#weave)" />
        <circle cx={142} cy={-80} r={8} fill={PALETTE.red} />
      </Piece>
      <PaperTag x={0} y={8} text={ON.noPicture} size={40} ink={PALETTE.red} seed="no-picture" rot={-4} />
    </g>
  );
};

// Pop-up book base: two kraft pages, opening from closed (0) to flat (1).
export const Book: React.FC<{ open: number }> = ({ open }) => {
  const p = useMemo(
    () => ({
      left: R(-860, -330, 860, 560, 10, "book-left"),
      right: R(0, -330, 860, 560, 10, "book-right"),
      cover: R(-880, -350, 1760, 600, 18, "book-cover"),
    }),
    [],
  );
  const lift = (1 - open) * 85;
  return (
    <g transform="translate(960 640)">
      <Piece d={p.cover} fill={shade(PALETTE.cardboard, 0.8)} material="card" depth={8} />
      <g style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}>
        <g transform={`scale(${Math.cos((lift * Math.PI) / 180).toFixed(4)} 1)`}>
          <Piece d={p.left} fill={PALETTE.kraft} material="kraft" />
        </g>
        <Piece d={p.right} fill={shade(PALETTE.kraft, 1.04)} material="kraft" />
      </g>
      <path d="M 0 -330 V 230" stroke={PALETTE.ink} strokeOpacity={0.35} strokeWidth={4} />
    </g>
  );
};
