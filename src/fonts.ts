import { loadFont } from "@remotion/google-fonts/Rubik";

// latin-ext carries ő/ű/Ő/Ű (U+0150, U+0151, U+0170, U+0171).
const { fontFamily } = loadFont("normal", {
  weights: ["500", "700", "900"],
  subsets: ["latin", "latin-ext"],
});

export const RUBIK = fontFamily;

export const WEIGHT = {
  caption: 500,
  tag: 700,
  title: 900,
} as const;
