import { AbsoluteFill } from "remotion";
import { RUBIK, WEIGHT } from "../fonts";
import { PALETTE, SAFE } from "../theme";
import { TornPaper } from "./material/TornPaper";

export type CaptionTone = "product" | "problem";

// Punctuation never decides a highlight: "egyedül" matches "egyedül." too.
const bare = (w: string) =>
  w
    .replace(/^[„"]+/, "")
    .replace(/[.,!?:;"”–]+$/, "")
    .toLowerCase();

// Torn white paper strip on a kraft backing scrap, centered at the bottom.
// `revealed` hides words past that count without changing the strip size (word-by-word reveal).
export const CaptionStrip: React.FC<{
  lines: readonly string[];
  highlight?: readonly string[];
  tone?: CaptionTone;
  seed: string;
  revealed?: number;
}> = ({ lines, highlight = [], tone = "product", seed, revealed }) => {
  const accent = tone === "product" ? PALETTE.teal : PALETTE.red;
  const keys = new Set(highlight.map((h) => h.toLowerCase()));
  const words = lines.map((line) => line.split(" "));
  const offsets = words.map((_, li) =>
    words.slice(0, li).reduce((n, ws) => n + ws.length, 0),
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: SAFE.y,
      }}
    >
      <div style={{ display: "grid" }}>
        <TornPaper
          seed={`${seed}-back`}
          color={PALETTE.kraft}
          tear={6}
          grain={0.55}
          style={{
            gridArea: "1 / 1",
            margin: "-7px -16px -9px -12px",
            rotate: "-0.8deg",
          }}
          innerStyle={{ height: "100%" }}
        />
        <TornPaper
          seed={seed}
          tear={5}
          style={{ gridArea: "1 / 1", rotate: "0.3deg" }}
          innerStyle={{ padding: "18px 46px 20px" }}
        >
          {words.map((ws, li) => (
            <div
              key={li}
              style={{
                fontFamily: RUBIK,
                fontWeight: WEIGHT.caption,
                fontSize: 44,
                lineHeight: 1.28,
                color: PALETTE.ink,
                textAlign: "center",
                whiteSpace: "pre",
              }}
            >
              {ws.map((w, wi) => (
                <span
                  key={wi}
                  style={{
                    color: keys.has(bare(w)) ? accent : undefined,
                    visibility:
                      revealed === undefined || offsets[li] + wi < revealed
                        ? "visible"
                        : "hidden",
                  }}
                >
                  {wi < ws.length - 1 ? `${w} ` : w}
                </span>
              ))}
            </div>
          ))}
        </TornPaper>
      </div>
    </AbsoluteFill>
  );
};
