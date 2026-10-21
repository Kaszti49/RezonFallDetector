import { RUBIK, WEIGHT } from "../fonts";
import { LAYER_SHADOW, PALETTE } from "../theme";

// Rubik Black letters cut from cardboard: a lit face plus stacked side layers.
// Key light is top-left, so the thickness extrudes toward bottom-right and sits in shade.
export const CardboardText: React.FC<{
  text: string;
  size: number;
  depth?: number;
  face?: string;
  style?: React.CSSProperties;
}> = ({ text, size, depth = 9, face = PALETTE.cardboard, style }) => {
  const base: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    whiteSpace: "pre",
    fontFamily: `${RUBIK}, "Courier New", monospace`,
    fontWeight: WEIGHT.title,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: size * 0.01,
  };

  return (
    <div style={{ position: "relative", filter: LAYER_SHADOW, ...style }}>
      {/* Invisible copy reserves the layout box. */}
      <div style={{ ...base, position: "relative", visibility: "hidden" }}>
        {text}
      </div>
      {Array.from({ length: depth }, (_, i) => depth - i).map((d) => (
        <div
          key={d}
          style={{
            ...base,
            color: face,
            translate: `${d * 0.55}px ${d * 0.75}px`,
            filter: `brightness(${d === depth ? 0.55 : 0.68})`,
          }}
        >
          {text}
        </div>
      ))}
      <div style={{ ...base, color: face }}>{text}</div>
      {/* Top-left rim catches the key light. */}
      <div
        style={{
          ...base,
          color: "transparent",
          WebkitTextStroke: `${Math.max(1, size * 0.012)}px ${PALETTE.paper}`,
          opacity: 0.35,
          translate: "-1px -1px",
          clipPath: "inset(0 0 55% 0)",
        }}
      >
        {text}
      </div>
    </div>
  );
};
