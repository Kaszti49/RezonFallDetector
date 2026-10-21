const parse = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const toHex = (rgb: readonly number[]) =>
  "#" +
  rgb
    .map((c) =>
      Math.round(Math.max(0, Math.min(255, c)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

// Weighted blend of palette colors. Weights are normalized.
export const mix = (...stops: [string, number][]) => {
  const total = stops.reduce((s, [, w]) => s + w, 0);
  const acc = [0, 0, 0];
  for (const [hex, w] of stops) {
    parse(hex).forEach((c, i) => {
      acc[i] += (c * w) / total;
    });
  }
  return toHex(acc);
};

// The same paper under less (k < 1) or more (k > 1) light.
export const shade = (hex: string, k: number) =>
  toHex(parse(hex).map((c) => c * k));

export const withAlpha = (hex: string, a: number) => {
  const [r, g, b] = parse(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
