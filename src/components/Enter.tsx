import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ramp } from "../lib/anim";
import { ENTER_FRAMES, type Enter as EnterKind } from "../timeline";

const EDGE_SHADOW = "drop-shadow(-10px 0 16px rgba(59, 42, 30, 0.45))";

// How a scene arrives over the one before it (which keeps playing underneath for these frames).
// Paper moves only: a sheet slides in, a page flips over, or a flap folds down. Never a crossfade.
export const Enter: React.FC<{
  kind: EnterKind;
  children: React.ReactNode;
}> = ({ kind, children }) => {
  const frame = useCurrentFrame();
  const n = ENTER_FRAMES[kind];
  if (n === 0 || frame >= n) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = ramp(frame, 0, n);

  if (kind === "slide") {
    return (
      <AbsoluteFill
        style={{
          translate: `${(1 - p) * 104}% 0`,
          rotate: `${(1 - p) * 2.5}deg`,
          filter: EDGE_SHADOW,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  if (kind === "flip") {
    return (
      <AbsoluteFill style={{ perspective: 2400 }}>
        <AbsoluteFill
          style={{
            transformOrigin: "0% 50%",
            transform: `rotateY(${(1 - p) * -100}deg)`,
            backfaceVisibility: "hidden",
            filter: EDGE_SHADOW,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // flap: folds down from the top edge like a pop-up card.
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <AbsoluteFill
        style={{
          transformOrigin: "50% 0%",
          transform: `rotateX(${(1 - p) * 95}deg)`,
          backfaceVisibility: "hidden",
          filter: "drop-shadow(0 14px 18px rgba(59, 42, 30, 0.45))",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
