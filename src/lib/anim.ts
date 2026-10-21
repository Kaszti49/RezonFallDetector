import { Easing, interpolate } from "remotion";
import { hashSeed, mulberry32 } from "./random";

export const smooth = Easing.bezier(0.45, 0, 0.2, 1);
export const snap = Easing.bezier(0.2, 0.9, 0.3, 1.25);

// Clamped interpolation over [t0, t1] (any unit, usually seconds).
export const ramp = (t: number, t0: number, t1: number, from = 0, to = 1, easing = smooth) =>
  interpolate(t, [t0, t1], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// Piecewise keyframes [[t, value], ...] with one easing per segment.
export const keys = (t: number, k: readonly (readonly [number, number])[], easing = smooth) =>
  interpolate(
    t,
    k.map(([kt]) => kt),
    k.map(([, v]) => v),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing },
  );

// Cut-outs move on twos: poses sample a 15 fps clock inside the 30 fps film.
export const onTwos = (frame: number) => frame - (frame % 2);

// Stop-motion "boil": seeded micro-jitter, re-seeded every 2 frames. Never applied to text.
export const boil = (seed: string, frame: number, amp = 1) => {
  const r = mulberry32((hashSeed(seed) ^ Math.imul(Math.floor(frame / 2) + 1, 2654435761)) >>> 0);
  return { dx: (r() - 0.5) * 0.6 * amp, dy: (r() - 0.5) * 0.6 * amp, rot: (r() - 0.5) * 0.3 * amp };
};
export const boilTransform = (seed: string, frame: number, cx = 0, cy = 0, amp = 1) => {
  const b = boil(seed, frame, amp);
  return `translate(${b.dx.toFixed(2)} ${b.dy.toFixed(2)}) rotate(${b.rot.toFixed(3)} ${cx} ${cy})`;
};

// One damped camera shake (the thud): 3 px, ~14 Hz, gone in about half a second.
export const shake = (t: number, hit: number, amp = 3) => {
  const tau = t - hit;
  if (tau < 0) return { x: 0, y: 0 };
  const e = amp * Math.exp(-8 * tau);
  return { x: e * Math.sin(2 * Math.PI * 14 * tau), y: e * 0.6 * Math.sin(2 * Math.PI * 11 * tau + 1.3) };
};
