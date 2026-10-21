import { AbsoluteFill } from "remotion";
import { withAlpha } from "../../lib/color";
import { PALETTE } from "../../theme";

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
