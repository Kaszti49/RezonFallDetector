import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { shade } from "../lib/color";
import { capsule, cut, densify, ellipse, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

// Joint angles in degrees. Limbs: positive = swings forward (toward +x, she faces right).
// Knee negative = shin bends back. Torso lean / head positive = forward.
export type MariPose = {
  lean: number;
  head: number;
  nearArm: readonly [shoulder: number, elbow: number];
  farArm: readonly [shoulder: number, elbow: number];
  nearLeg: readonly [hip: number, knee: number, ankle: number];
  farLeg: readonly [hip: number, knee: number, ankle: number];
  mouth?: "flat" | "smile";
};

export const MARI_POSES = {
  shuffle: {
    lean: 8,
    head: -2,
    nearArm: [10, 24],
    farArm: [-8, 18],
    nearLeg: [12, -10, 0],
    farLeg: [-8, -14, 0],
  },
  walkPass: {
    lean: 8,
    head: 0,
    nearArm: [-14, 20],
    farArm: [16, 26],
    nearLeg: [18, -6, 0],
    farLeg: [-16, -22, 0],
  },
} satisfies Record<string, MariPose>;

const L = { thigh: 96, shin: 90, sole: 14, upper: 68, fore: 62 } as const;
const HIP_NEAR = 5;
const HIP_FAR = -6;
const SHOULDER: Pt = [6, -134];
const NECK: Pt = [-2, -152];
const FAR = 0.8; // far-side limbs sit in shade

const rad = (deg: number) => (deg * Math.PI) / 180;

// Sole depth below the hip for a leg pose, so the puppet always stands on its floor line.
const soleDepth = ([hip, knee]: readonly number[]) =>
  Math.cos(rad(hip)) * L.thigh + Math.cos(rad(hip + knee)) * L.shin + L.sole;

const buildParts = (seed: string) => {
  const c = (pts: Pt[], id: string, wobble = 1.1) => cut(pts, `${seed}-${id}`, { wobble, jitter: 0.3, wavelength: 30 });
  return {
    thigh: c(capsule(L.thigh, 34), "thigh"),
    shin: c(capsule(L.shin, 27), "shin"),
    slipper: c(densify([[-18, -6], [4, -12], [28, -10], [44, -1], [47, 12], [-19, 13], [-22, 3]], 5), "slipper"),
    pom: c(ellipse(29, -11, 8, 7, 3), "pom", 0.8),
    skirt: c(densify([[-45, -12], [45, -12], [54, 104], [30, 111], [2, 106], [-28, 112], [-56, 104]], 6), "skirt"),
    torso: c(
      densify([[-44, 10], [42, 10], [46, -38], [42, -98], [32, -136], [10, -156], [-16, -157], [-40, -142], [-52, -102], [-48, -40]], 6),
      "torso",
    ),
    pocket: c(densify([[6, -64], [34, -64], [33, -40], [7, -39]], 4), "pocket", 0.6),
    collar: c(densify([[-6, -156], [24, -150], [8, -124]], 4), "collar", 0.6),
    upper: c(capsule(L.upper, 31), "upper"),
    fore: c(capsule(L.fore, 27), "fore"),
    cuff: c(densify([[-14, L.fore - 6], [14, L.fore - 6], [14, L.fore + 5], [-14, L.fore + 5]], 4), "cuff", 0.5),
    hand: c(ellipse(1, L.fore + 16, 11, 13, 3), "hand", 0.7),
    neck: c(densify([[-11, 4], [11, 4], [11, -18], [-11, -18]], 4), "neck", 0.5),
    head: c(ellipse(6, -58, 42, 47, 5), "head", 1.0),
    nose: c(ellipse(47, -54, 9, 8, 3), "nose", 0.6),
    ear: c(ellipse(-8, -54, 8, 11, 3), "ear", 0.6),
    hair: c(
      densify([[44, -80], [38, -96], [18, -108], [-10, -109], [-34, -98], [-49, -70], [-47, -40], [-36, -22], [-24, -34], [-18, -62], [0, -82], [26, -87]], 5),
      "hair",
      1.3,
    ),
    bun: c(ellipse(-38, -97, 23, 21, 4), "bun", 1.2),
  };
};

// Brass split pin holding two puppet parts together.
const Brad: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g filter="url(#sh-s)">
    <circle cx={x} cy={y} r={4.2} fill={DERIVED.brass} />
    <circle cx={x - 1.2} cy={y - 1.2} r={1.5} fill={PALETTE.paper} opacity={0.7} />
  </g>
);

const Face: React.FC<{ mouth: "flat" | "smile" }> = ({ mouth }) => (
  <g fill="none" stroke={PALETTE.ink} strokeLinecap="round">
    <circle cx={22} cy={-40} r={9} fill={PALETTE.red} opacity={0.16} stroke="none" />
    <circle cx={30} cy={-60} r={12.5} fill={PALETTE.paper} fillOpacity={0.3} strokeWidth={3} />
    <path d="M 17.5 -61 L -4 -57" strokeWidth={2.4} />
    <path d="M 42.5 -61 L 47 -60" strokeWidth={2.4} />
    <circle cx={33} cy={-60} r={3.2} fill={PALETTE.ink} stroke="none" />
    <path d="M 22 -79 Q 31 -82 40 -78" stroke={shade(DERIVED.hair, 0.6)} strokeWidth={3} />
    <path d="M 41 -42 q 3 4 2 8" strokeWidth={1.4} opacity={0.4} />
    {mouth === "smile" ? (
      <path d="M 26 -33 Q 34 -25 42 -33" strokeWidth={2.6} />
    ) : (
      <path d="M 27 -31 Q 34 -29 41 -31" strokeWidth={2.4} />
    )}
  </g>
);

// Mari néni, side view facing right. (x, y) = hip x and floor line y.
export const Mari: React.FC<{ x: number; y: number; scale?: number; pose: MariPose; seed?: string }> = ({
  x,
  y,
  scale = 1,
  pose,
  seed = "mari",
}) => {
  const P = useMemo(() => buildParts(seed), [seed]);
  const hipY = -Math.max(soleDepth(pose.nearLeg), soleDepth(pose.farLeg));

  const leg = ([hip, knee, ankle]: MariPose["nearLeg"], near: boolean) => {
    const k = near ? 1 : FAR;
    return (
      <g transform={`translate(${near ? HIP_NEAR : HIP_FAR} 0) rotate(${-hip})`}>
        <Piece d={P.thigh} fill={shade(DERIVED.stocking, k)} />
        <g transform={`translate(0 ${L.thigh}) rotate(${-knee})`}>
          <Piece d={P.shin} fill={shade(DERIVED.stocking, k)} />
          <g transform={`translate(0 ${L.shin}) rotate(${hip + knee - ankle})`}>
            <Piece d={P.slipper} fill={shade(DERIVED.mustard, k)} />
            <Piece d={P.pom} fill={shade(PALETTE.paper, k)} shadow="sh-s" />
          </g>
        </g>
      </g>
    );
  };

  const arm = ([shoulder, elbow]: MariPose["nearArm"], near: boolean) => {
    const k = near ? 1 : FAR;
    return (
      <g transform={`translate(${SHOULDER[0]} ${SHOULDER[1]}) rotate(${-shoulder})`}>
        <Piece d={P.upper} fill={shade(DERIVED.lilac, k)} />
        <g transform={`translate(0 ${L.upper}) rotate(${-elbow})`}>
          <Piece d={P.fore} fill={shade(DERIVED.lilac, k)} />
          <Piece d={P.cuff} fill={shade(PALETTE.paper, k * 0.97)} shadow="sh-s" />
          <Piece d={P.hand} fill={shade(DERIVED.skin, k)} shadow="sh-s" />
        </g>
        {near ? <Brad x={0} y={L.upper} /> : null}
        {near ? <Brad x={0} y={0} /> : null}
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) translate(0 ${hipY.toFixed(2)})`}>
      <g transform={`rotate(${pose.lean})`}>{arm(pose.farArm, false)}</g>
      {leg(pose.farLeg, false)}
      {leg(pose.nearLeg, true)}
      <Piece
        d={P.skirt}
        fill={DERIVED.navy}
        transform={`rotate(${(-(pose.nearLeg[0] + pose.farLeg[0]) / 2) * 0.35})`}
      />
      <g transform={`rotate(${pose.lean})`}>
        <Piece d={P.torso} fill={DERIVED.lilac}>
          <path d="M 31 -138 L 41 8" stroke={shade(DERIVED.lilac, 0.7)} strokeWidth={2} fill="none" />
          <Piece d={P.pocket} fill={shade(DERIVED.lilac, 0.92)} shadow="sh-flat" />
          {[-28, -66, -104].map((by) => (
            <circle key={by} cx={36} cy={by} r={4.5} fill={PALETTE.paper} filter="url(#sh-s)" />
          ))}
        </Piece>
        <Piece d={P.collar} fill={PALETTE.paper} shadow="sh-s" />
        <g transform={`translate(${NECK[0]} ${NECK[1]}) rotate(${pose.head})`}>
          <Piece d={P.neck} fill={shade(DERIVED.skin, 0.93)} shadow={null} />
          <Piece d={P.bun} fill={DERIVED.hair}>
            <path d="M -38 -97 m -9 0 a 9 8 0 1 1 9 8" stroke={shade(DERIVED.hair, 0.65)} strokeWidth={2} fill="none" />
          </Piece>
          <Piece d={P.head} fill={DERIVED.skin} />
          <Piece d={P.ear} fill={shade(DERIVED.skin, 0.95)} shadow="sh-s" />
          <Piece d={P.hair} fill={DERIVED.hair} />
          <Piece d={P.nose} fill={DERIVED.skin} shadow="sh-s" />
          <Face mouth={pose.mouth ?? "flat"} />
        </g>
        {arm(pose.nearArm, true)}
      </g>
    </g>
  );
};
