import { mix } from "./lib/color";

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

// Character and prop colors. Every one is a blend of palette tokens, so no new hue enters the film.
// The palette has no purple, so Mari's "lilac" cardigan is the closest blend: a dusty plum-mauve.
export const DERIVED = {
  skin: mix([PALETTE.paper, 0.72], [PALETTE.kraft, 0.22], [PALETTE.red, 0.06]),
  hair: mix([PALETTE.paper, 0.62], [PALETTE.night, 0.18], [PALETTE.ink, 0.2]),
  lilac: mix([PALETTE.paper, 0.2], [PALETTE.night, 0.55], [PALETTE.red, 0.25]),
  stocking: mix([PALETTE.kraft, 0.55], [PALETTE.paper, 0.45]),
  navy: mix([PALETTE.night, 0.85], [PALETTE.ink, 0.15]),
  mustard: mix([PALETTE.warm, 0.75], [PALETTE.cardboard, 0.25]),
  steel: mix([PALETTE.paper, 0.6], [PALETTE.night, 0.25], [PALETTE.ink, 0.15]),
  mirror: mix([PALETTE.night, 0.38], [PALETTE.paper, 0.62]),
  sky: mix([PALETTE.warm, 0.35], [PALETTE.paper, 0.65]),
  towel: mix([PALETTE.night, 0.55], [PALETTE.paper, 0.45]),
  brass: mix([PALETTE.warm, 0.6], [PALETTE.cardboard, 0.4]),
  tape: mix([PALETTE.paper, 0.7], [PALETTE.warm, 0.3]),
  ledTeal: mix([PALETTE.teal, 0.7], [PALETTE.paper, 0.3]),
} as const;

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
