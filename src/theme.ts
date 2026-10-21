// Style bible tokens (CLAUDE.md). Do not add colors.
export const PALETTE = {
  kraft: "#C8A27A",
  cardboard: "#A87B4F",
  ink: "#3B2A1E",
  paper: "#F3EBDD",
  teal: "#2F8F8B",
  red: "#D9442B",
  warm: "#F2C14E",
  night: "#3E5A7A",
} as const;

export type PaletteKey = keyof typeof PALETTE;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

// 5% safe margin on all sides.
export const SAFE = {
  x: VIDEO.width * 0.05,
  y: VIDEO.height * 0.05,
} as const;

// Every layer casts this onto the layer behind it: offset (6, 8), blur 10, 35% ink.
export const LAYER_SHADOW = "drop-shadow(6px 8px 10px rgba(59, 42, 30, 0.35))";
