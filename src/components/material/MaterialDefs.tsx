import { PALETTE } from "../../theme";

const channel = (hex: string, i: number) => (parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255).toFixed(4);

// Color matrix that paints `hex` with an alpha derived from the noise's red channel.
const tint = (hex: string, alphaRow: string) =>
  `0 0 0 0 ${channel(hex, 0)}  0 0 0 0 ${channel(hex, 1)}  0 0 0 0 ${channel(hex, 2)}  ${alphaRow}`;

const Shadow: React.FC<{
  id: string;
  margin: number;
  dx?: number;
  dy?: number;
  std?: number;
  opacity?: number;
}> = ({ id, margin, dx = 6, dy = 8, std = 5, opacity = 0.35 }) => (
  <filter
    id={id}
    x={`${-margin}%`}
    y={`${-margin}%`}
    width={`${100 + margin * 2.6}%`}
    height={`${100 + margin * 2.6}%`}
    colorInterpolationFilters="sRGB"
  >
    <feDropShadow dx={dx} dy={dy} stdDeviation={std} floodColor={PALETTE.ink} floodOpacity={opacity} />
  </filter>
);

// One hidden <svg> per composition holds the shared textures, shadows and blurs.
// Any SVG or HTML piece in the document can reference them by id.
// Textures are seamless 256 px tiles in the piece's own user space, so grain travels with the piece.
export const MaterialDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
    <defs>
      <filter id="f-grain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={5} stitchTiles="stitch" result="n1" />
        <feColorMatrix in="n1" type="matrix" values={tint(PALETTE.ink, "2.8 0 0 0 -1.32")} result="dark" />
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={23} stitchTiles="stitch" result="n2" />
        <feColorMatrix in="n2" type="matrix" values={tint(PALETTE.paper, "-2.8 0 0 0 1.42")} result="light" />
        <feMerge>
          <feMergeNode in="dark" />
          <feMergeNode in="light" />
        </feMerge>
      </filter>
      <pattern id="tex-grain" patternUnits="userSpaceOnUse" width={256} height={256}>
        <rect width={256} height={256} filter="url(#f-grain)" />
      </pattern>

      {/* Short fibers of kraft and cardboard liners. */}
      <filter id="f-fiber" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.16 0.55" numOctaves={3} seed={9} stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="matrix" values={tint(PALETTE.ink, "3.0 0 0 0 -1.62")} />
      </filter>

      {/* Large soft blotches: no sheet of kraft is evenly colored. Used once per backdrop. */}
      <filter id="f-mottle" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves={3} seed={41} result="n" />
        <feColorMatrix in="n" type="matrix" values={tint(PALETTE.ink, "0.6 0 0 0 -0.26")} />
      </filter>
      <pattern id="tex-fiber" patternUnits="userSpaceOnUse" width={256} height={256}>
        <rect width={256} height={256} filter="url(#f-fiber)" />
      </pattern>

      {/* Flutes of the corrugation showing faintly through a cardboard liner. */}
      <pattern id="tex-flutes" patternUnits="userSpaceOnUse" width={9} height={9}>
        <rect width={2.6} height={9} fill={PALETTE.ink} />
      </pattern>

      <Shadow id="sh" margin={25} />
      <Shadow id="sh-s" margin={120} />
      <Shadow id="sh-flat" margin={25} dx={3} dy={4} std={2.5} opacity={0.3} />

      <filter id="dof-1" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation={1} />
      </filter>
      <filter id="dof-2" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation={2.2} />
      </filter>
      <filter id="dof-4" x="-5%" y="-5%" width="110%" height="110%">
        <feGaussianBlur stdDeviation={4} />
      </filter>
      <filter id="soft-12" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={12} />
      </filter>
      <filter id="soft-4" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={4} />
      </filter>
    </defs>
  </svg>
);
