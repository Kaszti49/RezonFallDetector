import { shade } from "../../lib/color";

export type Material = "paper" | "kraft" | "card";
export type ShadowKind = "sh" | "sh-s" | "sh-flat";

const GRAIN: Record<Material, number> = { paper: 0.45, kraft: 0.6, card: 0.6 };

// One cut-out piece: optional card thickness (extruded toward bottom-right, away from the key light),
// a lit top-left cut edge, the face, its grain, and a drop shadow onto whatever lies behind it.
export const Piece: React.FC<{
  d: string;
  fill: string;
  material?: Material;
  depth?: number;
  shadow?: ShadowKind | null;
  fillRule?: "evenodd" | "nonzero";
  opacity?: number;
  transform?: string;
  children?: React.ReactNode;
}> = ({ d, fill, material = "paper", depth = 0, shadow = "sh", fillRule, opacity, transform, children }) => (
  <g transform={transform} filter={shadow ? `url(#${shadow})` : undefined} opacity={opacity}>
    {depth > 0 ? (
      <path
        d={d}
        fillRule={fillRule}
        fill={shade(fill, 0.6)}
        transform={`translate(${(depth * 0.6).toFixed(2)} ${(depth * 0.8).toFixed(2)})`}
      />
    ) : null}
    {shadow ? <path d={d} fillRule={fillRule} fill={shade(fill, 1.18)} transform="translate(-1.1 -1.1)" /> : null}
    <path d={d} fillRule={fillRule} fill={fill} />
    <path d={d} fillRule={fillRule} fill="url(#tex-grain)" opacity={GRAIN[material]} />
    {material !== "paper" ? <path d={d} fillRule={fillRule} fill="url(#tex-fiber)" opacity={0.3} /> : null}
    {material === "card" ? <path d={d} fillRule={fillRule} fill="url(#tex-flutes)" opacity={0.05} /> : null}
    {children}
  </g>
);
