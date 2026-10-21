import { PALETTE } from "../theme";

// Paper-fiber grain for use inside an existing <svg>. Two passes: ink flecks and paper flecks,
// so the texture adds fiber without shifting the base color. Anisotropic frequency = fibers.
export const GrainLayer: React.FC<{
  id: string;
  width: number;
  height: number;
  seed?: number;
  opacity?: number;
  frequency?: string;
}> = ({ id, width, height, seed = 3, opacity = 0.22, frequency = "0.85 0.38" }) => {
  return (
    <>
      <defs>
        <filter id={`${id}-dark`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} seed={seed} />
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 ${hexChannel(PALETTE.ink, 0)}  0 0 0 0 ${hexChannel(PALETTE.ink, 1)}  0 0 0 0 ${hexChannel(PALETTE.ink, 2)}  2.4 0 0 0 -1.15`}
          />
        </filter>
        <filter id={`${id}-light`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={3} seed={seed + 17} />
          <feColorMatrix
            type="matrix"
            values={`0 0 0 0 ${hexChannel(PALETTE.paper, 0)}  0 0 0 0 ${hexChannel(PALETTE.paper, 1)}  0 0 0 0 ${hexChannel(PALETTE.paper, 2)}  -2.4 0 0 0 1.15`}
          />
        </filter>
      </defs>
      <rect width={width} height={height} filter={`url(#${id}-dark)`} opacity={opacity} />
      <rect width={width} height={height} filter={`url(#${id}-light)`} opacity={opacity * 0.8} />
    </>
  );
};

// Full-frame grain as its own absolutely positioned layer.
export const GrainOverlay: React.FC<{
  id: string;
  width: number;
  height: number;
  seed?: number;
  opacity?: number;
}> = (props) => (
  <svg
    width={props.width}
    height={props.height}
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
  >
    <GrainLayer {...props} />
  </svg>
);

const hexChannel = (hex: string, i: 0 | 1 | 2) =>
  (parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255).toFixed(4);
