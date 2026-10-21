import { loadFont as loadAbril } from "@remotion/google-fonts/AbrilFatface";
import { loadFont as loadAlfa } from "@remotion/google-fonts/AlfaSlabOne";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadUltra } from "@remotion/google-fonts/Ultra";
import { RUBIK } from "./fonts";

// Display faces for collage titles. All carry latin-ext, so ő/ű render.
const FRAUNCES = loadFraunces("normal", {
  weights: ["900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const ALFA = loadAlfa("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const ABRIL = loadAbril("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const ULTRA = loadUltra("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
const PLAYFAIR = loadPlayfair("normal", {
  weights: ["900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export type Face = { family: string; weight: number; scale: number };

export const FACES = {
  rubik: { family: RUBIK, weight: 900, scale: 1 },
  fraunces: { family: FRAUNCES, weight: 900, scale: 1.04 },
} satisfies Record<string, Face>;

// Ransom-note mix: one face per letter, picked by seed.
export const RANSOM: Face[] = [
  FACES.rubik,
  FACES.fraunces,
  { family: ALFA, weight: 400, scale: 0.94 },
  { family: ABRIL, weight: 400, scale: 1.1 },
  { family: ULTRA, weight: 400, scale: 0.9 },
  { family: PLAYFAIR, weight: 900, scale: 1.06 },
];
