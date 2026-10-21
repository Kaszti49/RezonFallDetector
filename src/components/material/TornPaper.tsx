import { useMemo } from "react";
import { scrapClip, tornClip } from "../../lib/clip";
import { LAYER_SHADOW, PALETTE } from "../../theme";

export const GrainFill: React.FC<{ opacity: number; fiber?: number }> = ({ opacity, fiber = 0 }) => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
    <rect width="100%" height="100%" fill="url(#tex-grain)" opacity={opacity} />
    {fiber > 0 ? <rect width="100%" height="100%" fill="url(#tex-fiber)" opacity={fiber} /> : null}
  </svg>
);

// HTML paper piece that sizes itself to its content: torn long edges, or a scissor-cut scrap.
export const TornPaper: React.FC<{
  seed: string;
  color?: string;
  edge?: "torn" | "scrap";
  tear?: number;
  grain?: number;
  shadow?: boolean;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  seed,
  color = PALETTE.paper,
  edge = "torn",
  tear = 5,
  grain = 0.4,
  shadow = true,
  style,
  innerStyle,
  children,
}) => {
  const clipPath = useMemo(
    () => (edge === "torn" ? tornClip(seed, { tear }) : scrapClip(seed, tear)),
    [seed, edge, tear],
  );
  return (
    <div style={{ filter: shadow ? LAYER_SHADOW : undefined, ...style }}>
      <div style={{ position: "relative", background: color, clipPath, ...innerStyle }}>
        <GrainFill opacity={grain} />
        <div style={{ position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};
