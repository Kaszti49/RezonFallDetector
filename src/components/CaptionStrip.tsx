import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { RUBIK, WEIGHT } from "../fonts";
import { keys, onTwos } from "../lib/anim";
import { scrapClip } from "../lib/clip";
import { shade } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { DERIVED, LAYER_SHADOW, PALETTE, SAFE } from "../theme";
import { GrainFill } from "./material/TornPaper";

export type CaptionTone = "product" | "problem";

// Punctuation never decides a highlight: "egyedül" matches "egyedül." too.
const bare = (w: string) =>
  w
    .replace(/^[„"]+/, "")
    .replace(/[.,!?:;"”–]+$/, "")
    .toLowerCase();

// Light papers carry ink, the dark one carries paper – the same pairs as the tagline collage.
const PAPERS: readonly (readonly [string, string, number])[] = [
  [PALETTE.paper, PALETTE.ink, 0.55],
  [shade(PALETTE.kraft, 1.14), PALETTE.ink, 0.2],
  [DERIVED.steel, PALETTE.ink, 0.15],
  [PALETTE.ink, PALETTE.paper, 0.1],
];

type Scrap = { bg: string; fg: string; rot: number; dy: number; clip: string };

const pickScrap = (seed: string, key: boolean, accent: string): Scrap => {
  const r = mulberry32(hashSeed(seed));
  let x = r();
  let [bg, fg] = PAPERS[0];
  for (const [b, f, w] of PAPERS) {
    if (x < w) {
      [bg, fg] = [b, f];
      break;
    }
    x -= w;
  }
  return {
    bg: key ? accent : bg,
    fg: key ? PALETTE.paper : fg,
    rot: (r() - 0.5) * 4.4,
    dy: (r() - 0.5) * 6,
    clip: scrapClip(seed, 5),
  };
};

// One word = one scissor-cut paper scrap, popped onto the frame when it is spoken (on twos, like
// every cut-out). The scrap moves; the letters on it never boil.
const WordScrap: React.FC<{ word: string; s: Scrap; age: number | null }> = ({
  word,
  s,
  age,
}) => {
  const a = age === null ? 0 : onTwos(age);
  const scale = keys(a, [
    [0, 0.45],
    [2, 1.12],
    [4, 0.97],
    [6, 1],
  ]);
  const lift = keys(a, [
    [0, -16],
    [4, 0],
  ]);
  const wiggle = keys(a, [
    [0, 5],
    [4, 0],
  ]);
  return (
    <div
      style={{
        display: "grid",
        visibility: age === null ? "hidden" : "visible",
        rotate: `${(s.rot + wiggle).toFixed(2)}deg`,
        translate: `0 ${(s.dy + lift).toFixed(1)}px`,
        scale: `${scale.toFixed(3)}`,
        filter: LAYER_SHADOW,
      }}
    >
      {/* Card thickness: the same scrap in shade, pushed toward bottom-right. */}
      <div
        style={{
          gridArea: "1 / 1",
          background: shade(s.bg, 0.62),
          clipPath: s.clip,
          translate: "2px 3px",
        }}
      />
      <div
        style={{
          gridArea: "1 / 1",
          position: "relative",
          background: s.bg,
          clipPath: s.clip,
          padding: "5px 15px 7px",
        }}
      >
        <GrainFill opacity={0.45} fiber={s.bg === PALETTE.paper ? 0 : 0.35} />
        <span
          style={{
            position: "relative",
            display: "block",
            fontFamily: RUBIK,
            fontWeight: WEIGHT.caption,
            fontSize: 44,
            lineHeight: 1.2,
            color: s.fg,
            whiteSpace: "pre",
          }}
        >
          {word}
        </span>
      </div>
    </div>
  );
};

// Caption page, centered at the bottom: max 2 lines, every word on its own paper scrap.
// `revealed` hides words past that count without moving the others (word-by-word reveal);
// `ages` (frames since each word appeared) drives the pop.
export const CaptionStrip: React.FC<{
  lines: readonly string[];
  highlight?: readonly string[];
  tone?: CaptionTone;
  seed: string;
  revealed?: number;
  ages?: readonly number[];
}> = ({ lines, highlight = [], tone = "product", seed, revealed, ages }) => {
  const accent = tone === "product" ? PALETTE.teal : PALETTE.red;
  const words = useMemo(() => lines.map((line) => line.split(" ")), [lines]);
  const scraps = useMemo(() => {
    const keySet = new Set(highlight.map((h) => h.toLowerCase()));
    return words.map((ws, li) =>
      ws.map((w, wi) =>
        pickScrap(`${seed}-${li}-${wi}`, keySet.has(bare(w)), accent),
      ),
    );
  }, [words, highlight, seed, accent]);
  const offsets = words.map((_, li) =>
    words.slice(0, li).reduce((n, ws) => n + ws.length, 0),
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: SAFE.y,
        gap: 12,
      }}
    >
      {words.map((ws, li) => (
        <div
          key={li}
          style={{ display: "flex", gap: 10, justifyContent: "center" }}
        >
          {ws.map((w, wi) => {
            const i = offsets[li] + wi;
            const shown = revealed === undefined || i < revealed;
            return (
              <WordScrap
                key={wi}
                word={w}
                s={scraps[li][wi]}
                age={shown ? (ages?.[i] ?? 99) : null}
              />
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};
