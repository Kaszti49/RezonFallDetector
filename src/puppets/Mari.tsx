import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import type { Impact } from "../fx/ripple";
import { shade } from "../lib/color";
import { capsule, cut, densify, ellipse, roundRect, type Pt } from "../lib/shapes";
import { DERIVED, PALETTE } from "../theme";
import { footReach, lerpPose, mirrorPose, Rig, type Dims, type Placement, type Pose } from "./rig";

export type { Pose as MariPose } from "./rig";

const D: Dims = { thigh: 96, shin: 90, sole: 14, upper: 68, fore: 62, hipNear: 5, hipFar: -6, shoulder: [6, -134], neck: [-2, -152] };

const STAND: Pose = { lean: 7, head: -2, nearArm: [6, 16], farArm: [-6, 14], nearLeg: [4, -4, 0], farLeg: [-4, -6, 0] };

export const MARI = {
  stand: STAND,
  carry: { ...STAND, nearArm: [8, 78] },
  lookUp: { ...STAND, lean: 2, head: -24, nearArm: [8, 70] },
  hesitate: { lean: -3, head: -18, nearArm: [2, 60], farArm: [-10, 20], nearLeg: [-6, -4, 0], farLeg: [6, -8, 0] },
  windUp: { lean: 4, head: -20, nearArm: [-50, 70], farArm: [10, 30], nearLeg: [8, -6, 0], farLeg: [-10, -10, 0] },
  release: { lean: 12, head: -26, nearArm: [150, 15], farArm: [30, 30], nearLeg: [14, -8, 0], farLeg: [-14, -12, 0] },
  slip: { lean: -30, head: -14, nearArm: [120, 30], farArm: [100, 40], nearLeg: [70, -10, 25], farLeg: [45, -24, 15] },
  lie: { lean: 0, head: 6, nearArm: [30, 25], farArm: [-12, 10], nearLeg: [4, -10, 0], farLeg: [-2, -6, 0] },
  lieReach: { lean: 0, head: 2, nearArm: [78, 46], farArm: [-12, 10], nearLeg: [4, -10, 0], farLeg: [-2, -6, 0] },
  sitFloor: { lean: 20, head: 4, nearArm: [40, 30], farArm: [20, 24], nearLeg: [88, -4, 10], farLeg: [84, -8, 10] },
  sitSmile: { lean: 16, head: -6, nearArm: [44, 40], farArm: [22, 30], nearLeg: [88, -4, 10], farLeg: [84, -8, 10], smile: 1 },
} satisfies Record<string, Pose>;

// Walk cycle: four key poses per step (contact, down, pass, up); the second step mirrors the first.
// Amplitudes are kept small: she is 81 and shuffles.
const WALK: Pose[] = [
  { lean: 9, head: 0, nearArm: [-12, 16], farArm: [12, 22], nearLeg: [18, -4, 6], farLeg: [-16, -10, -4] },
  { lean: 10, head: 1, nearArm: [-8, 18], farArm: [8, 22], nearLeg: [12, -14, 0], farLeg: [-12, -22, 0] },
  { lean: 9, head: 0, nearArm: [0, 18], farArm: [0, 20], nearLeg: [0, -6, 0], farLeg: [8, -34, 0] },
  { lean: 8, head: -1, nearArm: [8, 20], farArm: [-8, 18], nearLeg: [-10, -2, 0], farLeg: [16, -20, 0] },
];

// `phase` counts steps: 0 → 1 is one step, 1 → 2 the next (mirrored).
export const mariWalk = (phase: number): Pose => {
  const step = Math.floor(phase);
  const k = (phase - step) * 4;
  const i = Math.min(3, Math.floor(k));
  const a = WALK[i];
  const b = i < 3 ? WALK[i + 1] : mirrorPose(WALK[0]);
  const p = lerpPose(a, b, k - i);
  return step % 2 ? mirrorPose(p) : p;
};

// A stretch of walking: x advances linearly while the cycle runs. Footfalls come from the same plan,
// so the floor wave, the tape and the footstep sounds land on the frame the foot does.
export type WalkPlan = { t0: number; t1: number; x0: number; period: number; stride: number; scale: number };

export const walkX = (w: WalkPlan, t: number) =>
  w.x0 + ((Math.min(Math.max(t, w.t0), w.t1) - w.t0) / w.period) * w.stride * w.scale;

export const walkPose = (w: WalkPlan, t: number, rest: Pose = STAND): Pose =>
  t <= w.t0 || t >= w.t1 ? rest : mariWalk((t - w.t0) / w.period);

export const walkImpacts = (w: WalkPlan): Impact[] => {
  const out: Impact[] = [];
  for (let n = 0; w.t0 + n * w.period <= w.t1; n++) {
    const t = w.t0 + n * w.period;
    out.push({ t, x: walkX(w, t) + footReach(D, WALK[0].nearLeg) * w.scale, kind: "step" });
  }
  return out;
};

const buildParts = (seed: string) => {
  const c = (pts: Pt[], id: string, wobble = 1.1) => cut(pts, `${seed}-${id}`, { wobble, jitter: 0.3, wavelength: 30 });
  return {
    rig: {
      thigh: c(capsule(D.thigh, 34), "thigh"),
      shin: c(capsule(D.shin, 27), "shin"),
      foot: c(densify([[-18, -6], [4, -12], [28, -10], [44, -1], [47, 12], [-19, 13], [-22, 3]], 5), "slipper"),
      footExtra: c(ellipse(29, -11, 8, 7, 3), "pom", 0.8),
      lower: c(densify([[-45, -12], [45, -12], [54, 104], [30, 111], [2, 106], [-28, 112], [-56, 104]], 6), "skirt"),
      torso: c(
        densify([[-44, 10], [42, 10], [46, -38], [42, -98], [32, -136], [10, -156], [-16, -157], [-40, -142], [-52, -102], [-48, -40]], 6),
        "torso",
      ),
      upper: c(capsule(D.upper, 31), "upper"),
      fore: c(capsule(D.fore, 27), "fore"),
      cuff: c(densify([[-14, D.fore - 6], [14, D.fore - 6], [14, D.fore + 5], [-14, D.fore + 5]], 4), "cuff", 0.5),
      hand: c(ellipse(1, D.fore + 16, 11, 13, 3), "hand", 0.7),
    },
    pocket: c(densify([[6, -64], [34, -64], [33, -40], [7, -39]], 4), "pocket", 0.6),
    collar: c(densify([[-6, -156], [24, -150], [8, -124]], 4), "collar", 0.6),
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
    towel: c(densify([[15, 16], [15, 52], [-46, 58], [-50, 12]], 5), "carried-towel", 1.4),
    towelStripe: c(roundRect(-44, 20, 6, 34, 1, 4), "carried-stripe", 0.4),
  };
};

const MariHead: React.FC<{ P: ReturnType<typeof buildParts>; smile: number; blink: number }> = ({ P, smile, blink }) => {
  const s = Math.max(0, Math.min(1, smile));
  const mouth = `M ${27 - s} ${-31 - s * 2} Q 34 ${-29 + s * 7} ${41 + s} ${-31 - s * 2}`;
  return (
    <>
      <Piece d={P.neck} fill={shade(DERIVED.skin, 0.93)} shadow={null} />
      <Piece d={P.bun} fill={DERIVED.hair}>
        <path d="M -38 -97 m -9 0 a 9 8 0 1 1 9 8" stroke={shade(DERIVED.hair, 0.65)} strokeWidth={2} fill="none" />
      </Piece>
      <Piece d={P.head} fill={DERIVED.skin} />
      <Piece d={P.ear} fill={shade(DERIVED.skin, 0.95)} shadow="sh-s" />
      <Piece d={P.hair} fill={DERIVED.hair} />
      <Piece d={P.nose} fill={DERIVED.skin} shadow="sh-s" />
      <g fill="none" stroke={PALETTE.ink} strokeLinecap="round">
        <circle cx={22} cy={-40} r={9 + s * 2} fill={PALETTE.red} opacity={0.16 + s * 0.08} stroke="none" />
        <circle cx={30} cy={-60} r={12.5} fill={PALETTE.paper} fillOpacity={0.3} strokeWidth={3} />
        <path d="M 17.5 -61 L -4 -57" strokeWidth={2.4} />
        <path d="M 42.5 -61 L 47 -60" strokeWidth={2.4} />
        {blink > 0.5 ? (
          <path d="M 28 -60 Q 33 -57 38 -60" strokeWidth={2.4} />
        ) : (
          <circle cx={33} cy={-60} r={3.2} fill={PALETTE.ink} stroke="none" />
        )}
        <path d={`M 22 ${-79 + s} Q 31 ${-82 + s} 40 ${-78 + s}`} stroke={shade(DERIVED.hair, 0.6)} strokeWidth={3} />
        <path d="M 41 -42 q 3 4 2 8" strokeWidth={1.4} opacity={0.4} />
        <path d={mouth} strokeWidth={2.5} />
      </g>
    </>
  );
};

// Mari néni, side view facing right.
export const Mari: React.FC<{
  pose: Pose;
  place: Placement;
  scale?: number;
  tilt?: number;
  carryTowel?: boolean;
  frame?: number;
  seed?: string;
}> = ({ pose, place, scale = 1, tilt = 0, carryTowel = false, frame = 0, seed = "mari" }) => {
  const P = useMemo(() => buildParts(seed), [seed]);
  return (
    <Rig
      dims={D}
      parts={P.rig}
      colors={{
        thigh: DERIVED.stocking,
        shin: DERIVED.stocking,
        foot: DERIVED.mustard,
        footExtra: PALETTE.paper,
        lower: DERIVED.navy,
        torso: DERIVED.lilac,
        sleeve: DERIVED.lilac,
        cuff: PALETTE.paper,
        hand: DERIVED.skin,
      }}
      pose={pose}
      place={place}
      scale={scale}
      tilt={tilt}
      boilSeed={seed}
      frame={frame}
      torsoDetail={
        <>
          <path d="M 31 -138 L 41 8" stroke={shade(DERIVED.lilac, 0.7)} strokeWidth={2} fill="none" />
          <Piece d={P.pocket} fill={shade(DERIVED.lilac, 0.92)} shadow="sh-flat" />
          {[-28, -66, -104].map((by) => (
            <circle key={by} cx={36} cy={by} r={4.5} fill={PALETTE.paper} filter="url(#sh-s)" />
          ))}
        </>
      }
      overTorso={<Piece d={P.collar} fill={PALETTE.paper} shadow="sh-s" />}
      head={<MariHead P={P} smile={pose.smile ?? 0} blink={pose.blink ?? 0} />}
      handProp={
        carryTowel ? (
          <Piece d={P.towel} fill={DERIVED.towel}>
            <path d={P.towelStripe} fill={PALETTE.paper} opacity={0.9} />
          </Piece>
        ) : null
      }
    />
  );
};

// Kept for the Phase 1 stills.
export const MARI_POSES = { shuffle: MARI.stand, walkPass: WALK[2] };
