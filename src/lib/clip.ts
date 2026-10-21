import { hashSeed, mulberry32 } from "./random";

// CSS clip-path outlines for HTML paper pieces that size themselves to their text.
// x runs in % along the edge, the tear depth is in px, so the edge looks the same at any width.

export const tornClip = (
  seed: string,
  { tear = 5, side = 1.5, steps = 56 }: { tear?: number; side?: number; steps?: number } = {},
) => {
  const r = mulberry32(hashSeed(seed));
  const edge = () => {
    // Mostly small fiber jitter, now and then a deeper bite.
    const deep = r() < 0.12 ? 1 : 0.45;
    return (r() * tear * deep).toFixed(2);
  };
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) pts.push(`${((i / steps) * 100).toFixed(2)}% ${edge()}px`);
  for (let i = 1; i < 6; i++) pts.push(`calc(100% - ${(r() * side).toFixed(2)}px) ${((i / 6) * 100).toFixed(2)}%`);
  for (let i = steps; i >= 0; i--) pts.push(`${((i / steps) * 100).toFixed(2)}% calc(100% - ${edge()}px)`);
  for (let i = 5; i > 0; i--) pts.push(`${(r() * side).toFixed(2)}px ${((i / 6) * 100).toFixed(2)}%`);
  return `polygon(${pts.join(", ")})`;
};

// Scissor-cut scrap: four slightly skewed corners and almost-straight edges.
export const scrapClip = (seed: string, corner = 7) => {
  const r = mulberry32(hashSeed(seed));
  const c = () => (r() * corner).toFixed(2);
  const j = () => ((r() - 0.5) * 2.4).toFixed(2);
  return `polygon(${c()}px ${c()}px, 50% ${j()}px, calc(100% - ${c()}px) ${c()}px, calc(100% + ${j()}px) 50%, calc(100% - ${c()}px) calc(100% - ${c()}px), 50% calc(100% + ${j()}px), ${c()}px calc(100% - ${c()}px), ${j()}px 50%)`;
};
