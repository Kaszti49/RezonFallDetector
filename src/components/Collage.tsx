import { useMemo } from "react";
import { scrapClip } from "../lib/clip";
import { shade } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { FACES, RANSOM, type Face } from "../fontsTitle";
import { DERIVED, LAYER_SHADOW, PALETTE } from "../theme";
import { GrainFill } from "./material/TornPaper";

export type TitleStyle = "rubik" | "fraunces" | "ransom";

// Scrap / letter pairs from the reference: light scraps carry dark letters, dark scraps light ones.
const TILES: readonly (readonly [string, string])[] = [
  [PALETTE.paper, PALETTE.ink],
  [PALETTE.kraft, PALETTE.ink],
  [PALETTE.cardboard, PALETTE.paper],
  [PALETTE.ink, PALETTE.paper],
  [DERIVED.steel, PALETTE.ink],
];

type Scrap = { face: Face; bg: string; fg: string; rot: number; dy: number; scale: number; clip: string };

const pickScrap = (seed: string, style: TitleStyle, size: number, tilt: number): Scrap => {
  const r = mulberry32(hashSeed(seed));
  const [bg, fg] = TILES[Math.floor(r() * TILES.length)];
  const face = style === "ransom" ? RANSOM[Math.floor(r() * RANSOM.length)] : FACES[style];
  return {
    face,
    bg,
    fg,
    rot: (r() - 0.5) * 2 * tilt,
    dy: (r() - 0.5) * size * 0.1,
    scale: 0.93 + r() * 0.14,
    clip: scrapClip(seed, size * 0.07),
  };
};

const ScrapTile: React.FC<{ s: Scrap; size: number; pad: [number, number]; children: React.ReactNode }> = ({
  s,
  size,
  pad,
  children,
}) => (
  <div style={{ display: "grid", rotate: `${s.rot}deg`, translate: `0 ${s.dy}px`, filter: LAYER_SHADOW }}>
    {/* Card thickness: the same scrap in shade, pushed toward bottom-right. */}
    <div style={{ gridArea: "1 / 1", background: shade(s.bg, 0.6), clipPath: s.clip, translate: "2px 3px" }} />
    <div
      style={{
        gridArea: "1 / 1",
        position: "relative",
        background: s.bg,
        clipPath: s.clip,
        padding: `${pad[0]}px ${pad[1]}px`,
        textAlign: "center",
      }}
    >
      <GrainFill opacity={0.45} fiber={s.bg === PALETTE.paper ? 0 : 0.45} />
      <span
        style={{
          position: "relative",
          display: "block",
          fontFamily: `${s.face.family}, "Courier New", monospace`,
          fontWeight: s.face.weight,
          fontSize: size * s.face.scale * s.scale,
          lineHeight: 1.12,
          color: s.fg,
          whiteSpace: "pre",
        }}
      >
        {children}
      </span>
    </div>
  </div>
);

// Ransom-note title: every letter on its own cut scrap (for short stamps like "2031", "REZON").
export const CollageLetters: React.FC<{ text: string; size: number; style: TitleStyle; seed: string }> = ({
  text,
  size,
  style,
  seed,
}) => {
  const scraps = useMemo(
    () => [...text].map((_, i) => pickScrap(`${seed}-${i}`, style, size, 5)),
    [text, style, size, seed],
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.06 }}>
      {[...text].map((ch, i) =>
        ch === " " ? (
          <div key={i} style={{ width: size * 0.3 }} />
        ) : (
          <ScrapTile key={i} s={scraps[i]} size={size} pad={[size * 0.06, size * 0.12]}>
            {ch}
          </ScrapTile>
        ),
      )}
    </div>
  );
};

// Longer lines (tagline): one scrap per word keeps it readable.
export const CollageWords: React.FC<{ text: string; size: number; style: TitleStyle; seed: string; scales?: readonly number[] }> = ({
  text,
  size,
  style,
  seed,
  scales,
}) => {
  const words = useMemo(() => text.split(" "), [text]);
  const scraps = useMemo(
    () => words.map((_, i) => pickScrap(`${seed}-w${i}`, style, size, 2.5)),
    [words, style, size, seed],
  );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: size * 0.18 }}>
      {words.map((w, i) => (
        <div key={i} style={{ scale: `${scales?.[i] ?? 1}` }}>
          <ScrapTile s={scraps[i]} size={size} pad={[size * 0.12, size * 0.28]}>
            {w}
          </ScrapTile>
        </div>
      ))}
    </div>
  );
};
