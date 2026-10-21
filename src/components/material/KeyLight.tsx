import { AbsoluteFill } from "remotion";
import { withAlpha } from "../../lib/color";
import { PALETTE } from "../../theme";

// Scene mood: a soft palette-color wash, from the edges (tension) or the center (relief).
export const Grade: React.FC<{
  color: string;
  strength: number;
  from?: "edges" | "center";
  blend?: "multiply" | "screen";
}> = ({ color, strength, from = "edges", blend = "multiply" }) =>
  strength <= 0 ? null : (
    <AbsoluteFill
      style={{
        background:
          from === "edges"
            ? `radial-gradient(ellipse 80% 75% at 50% 50%, rgba(0,0,0,0) 40%, ${withAlpha(color, strength)} 100%)`
            : `radial-gradient(ellipse 70% 65% at 50% 55%, ${withAlpha(color, strength)} 0%, rgba(0,0,0,0) 100%)`,
        mixBlendMode: blend,
        pointerEvents: "none",
      }}
    />
  );

// One soft key light from the top-left: warm lift near the source, falloff toward bottom-right.
export const KeyLight: React.FC<{ strength?: number; warmth?: number }> = ({
  strength = 1,
  warmth = 1,
}) => (
  <>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 130% 120% at 12% -6%, rgba(0,0,0,0) 30%, ${withAlpha(PALETTE.ink, 0.45 * strength)} 100%)`,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 60% 55% at 8% 0%, ${withAlpha(PALETTE.warm, 0.16 * warmth)} 0%, rgba(0,0,0,0) 100%)`,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  </>
);
