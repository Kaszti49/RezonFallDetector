import { Piece } from "../components/material/Piece";
import { boilTransform } from "../lib/anim";
import { shade } from "../lib/color";
import type { Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";

// Joint angles in degrees. Limbs: positive = swings forward (toward +x; puppets face right).
// Knee negative = shin bends back. Lean / head positive = forward. Elbow positive = forearm forward.
export type Pose = {
  lean: number;
  head: number;
  nearArm: readonly [shoulder: number, elbow: number];
  farArm: readonly [shoulder: number, elbow: number];
  nearLeg: readonly [hip: number, knee: number, ankle: number];
  farLeg: readonly [hip: number, knee: number, ankle: number];
  smile?: number; // 0 neutral … 1 smile
  blink?: number; // 0 open … 1 closed
};

const mixN = (a: number, b: number, t: number) => a + (b - a) * t;
const mixT = <T extends readonly number[]>(a: T, b: T, t: number) => a.map((v, i) => mixN(v, b[i], t)) as unknown as T;

export const lerpPose = (a: Pose, b: Pose, t: number): Pose => ({
  lean: mixN(a.lean, b.lean, t),
  head: mixN(a.head, b.head, t),
  nearArm: mixT(a.nearArm, b.nearArm, t),
  farArm: mixT(a.farArm, b.farArm, t),
  nearLeg: mixT(a.nearLeg, b.nearLeg, t),
  farLeg: mixT(a.farLeg, b.farLeg, t),
  smile: mixN(a.smile ?? 0, b.smile ?? 0, t),
  blink: mixN(a.blink ?? 0, b.blink ?? 0, t),
});

// Swap near and far limbs: the second step of a walk cycle.
export const mirrorPose = (p: Pose): Pose => ({ ...p, nearArm: p.farArm, farArm: p.nearArm, nearLeg: p.farLeg, farLeg: p.nearLeg });

export type Dims = {
  thigh: number;
  shin: number;
  sole: number;
  upper: number;
  fore: number;
  hipNear: number;
  hipFar: number;
  shoulder: Pt;
  neck: Pt;
};

const rad = (deg: number) => (deg * Math.PI) / 180;

// Lowest point of a leg below the hip: the sole, or the knee when kneeling.
export const legDepth = (d: Dims, [hip, knee]: readonly number[]) => {
  const kneeY = Math.cos(rad(hip)) * d.thigh;
  const ankleY = kneeY + Math.cos(rad(hip + knee)) * d.shin;
  return Math.max(kneeY + 15, ankleY + d.sole);
};

// Horizontal reach of a foot in front of the hip (for footstep impact positions).
export const footReach = (d: Dims, [hip, knee]: readonly number[]) =>
  Math.sin(rad(hip)) * d.thigh + Math.sin(rad(hip + knee)) * d.shin + 14;

export type Placement = { mode: "stand"; x: number; floor: number } | { mode: "hip"; x: number; y: number };

export type Parts = {
  thigh: string;
  shin: string;
  foot: string;
  footExtra?: string;
  lower?: string; // skirt, hangs from the hip over the thighs
  torso: string;
  upper: string;
  fore: string;
  cuff?: string;
  hand: string;
};

export type Colors = {
  thigh: string;
  shin: string;
  foot: string;
  footExtra?: string;
  lower?: string;
  torso: string;
  sleeve: string;
  cuff?: string;
  hand: string;
};

const FAR = 0.8; // far-side limbs sit in shade

// Brass split pin holding two puppet parts together.
export const Brad: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g filter="url(#sh-s)">
    <circle cx={x} cy={y} r={4.2} fill={DERIVED.brass} />
    <circle cx={x - 1.2} cy={y - 1.2} r={1.5} fill={PALETTE.paper} opacity={0.7} />
  </g>
);

export const Rig: React.FC<{
  dims: Dims;
  parts: Parts;
  colors: Colors;
  pose: Pose;
  place: Placement;
  scale?: number;
  tilt?: number;
  flip?: boolean;
  head: React.ReactNode;
  torsoDetail?: React.ReactNode;
  overTorso?: React.ReactNode;
  handProp?: React.ReactNode;
  boilSeed?: string;
  frame?: number;
}> = ({ dims: D, parts: P, colors: C, pose, place, scale = 1, tilt = 0, flip = false, head, torsoDetail, overTorso, handProp, boilSeed, frame = 0 }) => {
  const hipY = place.mode === "stand" ? place.floor - Math.max(legDepth(D, pose.nearLeg), legDepth(D, pose.farLeg)) * scale : place.y;

  const leg = ([hip, knee, ankle]: Pose["nearLeg"], near: boolean) => {
    const k = near ? 1 : FAR;
    return (
      <g transform={`translate(${near ? D.hipNear : D.hipFar} 0) rotate(${-hip})`}>
        <Piece d={P.thigh} fill={shade(C.thigh, k)} />
        <g transform={`translate(0 ${D.thigh}) rotate(${-knee})`}>
          <Piece d={P.shin} fill={shade(C.shin, k)} />
          <g transform={`translate(0 ${D.shin}) rotate(${hip + knee - ankle})`}>
            <Piece d={P.foot} fill={shade(C.foot, k)} />
            {P.footExtra && C.footExtra ? <Piece d={P.footExtra} fill={shade(C.footExtra, k)} shadow="sh-s" /> : null}
          </g>
        </g>
      </g>
    );
  };

  const arm = ([shoulder, elbow]: Pose["nearArm"], near: boolean) => {
    const k = near ? 1 : FAR;
    return (
      <g transform={`translate(${D.shoulder[0]} ${D.shoulder[1]}) rotate(${-shoulder})`}>
        <Piece d={P.upper} fill={shade(C.sleeve, k)} />
        <g transform={`translate(0 ${D.upper}) rotate(${-elbow})`}>
          <Piece d={P.fore} fill={shade(C.sleeve, k)} />
          {P.cuff && C.cuff ? <Piece d={P.cuff} fill={shade(C.cuff, k * 0.97)} shadow="sh-s" /> : null}
          <Piece d={P.hand} fill={shade(C.hand, k)} shadow="sh-s" />
          {near ? handProp : null}
        </g>
        {near ? <Brad x={0} y={D.upper} /> : null}
        {near ? <Brad x={0} y={0} /> : null}
      </g>
    );
  };

  const skirtSwing = (-(pose.nearLeg[0] + pose.farLeg[0]) / 2) * 0.35;
  const jitter = boilSeed ? boilTransform(boilSeed, frame, 0, -120) : undefined;

  return (
    <g transform={`translate(${place.x.toFixed(2)} ${hipY.toFixed(2)}) scale(${flip ? -scale : scale} ${scale}) rotate(${tilt})`}>
      <g transform={jitter}>
        <g transform={`rotate(${pose.lean})`}>{arm(pose.farArm, false)}</g>
        {leg(pose.farLeg, false)}
        {leg(pose.nearLeg, true)}
        {P.lower && C.lower ? <Piece d={P.lower} fill={C.lower} transform={`rotate(${skirtSwing})`} /> : null}
        <g transform={`rotate(${pose.lean})`}>
          <Piece d={P.torso} fill={C.torso}>
            {torsoDetail}
          </Piece>
          {overTorso}
          <g transform={`translate(${D.neck[0]} ${D.neck[1]}) rotate(${pose.head})`}>{head}</g>
          {arm(pose.nearArm, true)}
        </g>
      </g>
    </g>
  );
};
