import { useMemo } from "react";
import { tornRectPath } from "../lib/paths";
import { LAYER_SHADOW, PALETTE } from "../theme";
import { GrainLayer } from "./Grain";

// Torn white paper strip (caption background, tags). Content is centered on top.
export const PaperStrip: React.FC<{
  width: number;
  height: number;
  seed: number;
  color?: string;
  tear?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  width,
  height,
  seed,
  color = PALETTE.paper,
  tear = 5,
  style,
  children,
}) => {
  const d = useMemo(
    () => tornRectPath(width, height, seed, { tear }),
    [width, height, seed, tear],
  );
  const clipId = `strip-clip-${seed}`;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        filter: LAYER_SHADOW,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={color} />
        <g clipPath={`url(#${clipId})`}>
          <GrainLayer
            id={`strip-grain-${seed}`}
            width={width}
            height={height}
            seed={seed}
            opacity={0.16}
          />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};
