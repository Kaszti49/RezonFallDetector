import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { mix, shade } from "../lib/color";
import { capsule, cut, densify, ellipse, roundRect, type Pt } from "../lib/shapes";
import { Keys } from "../props/Props";
import { DERIVED, PALETTE } from "../theme";
import { Rig, type Dims, type Placement, type Pose } from "./rig";

const D: Dims = { thigh: 100, shin: 94, sole: 13, upper: 70, fore: 64, hipNear: 4, hipFar: -5, shoulder: [4, -140], neck: [-2, -158] };

const HAIR = mix([PALETTE.cardboard, 0.55], [PALETTE.ink, 0.45]);
const TROUSERS = shade(PALETTE.night, 0.72);

export const ANNA = {
  stand: { lean: 2, head: 0, nearArm: [4, 10], farArm: [-4, 10], nearLeg: [3, -3, 0], farLeg: [-3, -4, 0] },
  sit: { lean: 6, head: 6, nearArm: [52, 48], farArm: [48, 52], nearLeg: [86, -84, 0], farLeg: [84, -86, 0] },
  sitAlert: { lean: 10, head: -4, nearArm: [76, 30], farArm: [48, 52], nearLeg: [86, -84, 0], farLeg: [84, -86, 0] },
  grabKeys: { lean: 16, head: 2, nearArm: [96, 12], farArm: [-24, 20], nearLeg: [24, -30, 0], farLeg: [-8, -10, 0] },
  kneel: { lean: 22, head: 16, nearArm: [58, 30], farArm: [48, 40], nearLeg: [0, -90, 0], farLeg: [80, -84, 0] },
  help: { lean: 30, head: 20, nearArm: [74, 22], farArm: [84, 30], nearLeg: [0, -90, 0], farLeg: [80, -84, 0], smile: 0.6 },
} satisfies Record<string, Pose>;

const buildParts = (seed: string) => {
  const c = (pts: Pt[], id: string, wobble = 1.1) => cut(pts, `${seed}-${id}`, { wobble, jitter: 0.3, wavelength: 30 });
  return {
    rig: {
      thigh: c(capsule(D.thigh, 34), "thigh"),
      shin: c(capsule(D.shin, 30), "shin"),
      foot: c(densify([[-16, -4], [28, -7], [46, 3], [46, 12], [-18, 13]], 5), "shoe"),
      torso: c(
        densify([[-40, 8], [40, 8], [42, -40], [40, -100], [30, -140], [10, -162], [-14, -162], [-36, -148], [-44, -100], [-42, -40]], 6),
        "torso",
      ),
      upper: c(capsule(D.upper, 30), "upper"),
      fore: c(capsule(D.fore, 26), "fore"),
      cuff: c(densify([[-13, D.fore - 6], [13, D.fore - 6], [13, D.fore + 6], [-13, D.fore + 6]], 4), "cuff", 0.5),
      hand: c(ellipse(1, D.fore + 17, 11, 13, 3), "hand", 0.7),
    },
    hem: c(roundRect(-42, -12, 84, 20, 2, 5), "hem", 0.6),
    neckline: c(densify([[-12, -162], [14, -162], [6, -146], [-6, -146]], 4), "neckline", 0.5),
    neck: c(densify([[-10, 4], [10, 4], [10, -18], [-10, -18]], 4), "neck", 0.5),
    head: c(ellipse(6, -60, 40, 46, 5), "head", 1.0),
    nose: c(ellipse(45, -56, 8, 7, 3), "nose", 0.6),
    ear: c(ellipse(-6, -56, 7, 10, 3), "ear", 0.6),
    hair: c(
      densify([[46, -78], [40, -100], [16, -112], [-14, -112], [-40, -100], [-52, -70], [-52, -18], [-30, -10], [-24, -44], [-14, -66], [6, -82], [30, -84]], 5),
      "hair",
      1.4,
    ),
  };
};

const AnnaHead: React.FC<{ P: ReturnType<typeof buildParts>; smile: number; blink: number }> = ({ P, smile, blink }) => {
  const s = Math.max(0, Math.min(1, smile));
  return (
    <>
      <Piece d={P.neck} fill={shade(DERIVED.skin, 0.93)} shadow={null} />
      <Piece d={P.head} fill={DERIVED.skin} />
      <Piece d={P.ear} fill={shade(DERIVED.skin, 0.95)} shadow="sh-s" />
      <Piece d={P.hair} fill={HAIR} />
      <Piece d={P.nose} fill={DERIVED.skin} shadow="sh-s" />
      <g fill="none" stroke={PALETTE.ink} strokeLinecap="round">
        <circle cx={22} cy={-40} r={8} fill={PALETTE.red} opacity={0.12 + s * 0.08} stroke="none" />
        {blink > 0.5 ? (
          <path d="M 26 -62 Q 31 -59 36 -62" strokeWidth={2.4} />
        ) : (
          <circle cx={31} cy={-62} r={3.4} fill={PALETTE.ink} stroke="none" />
        )}
        <path d="M 22 -78 Q 30 -81 39 -77" stroke={shade(HAIR, 0.7)} strokeWidth={3.2} />
        <path d={`M ${27 - s} ${-32 - s * 2} Q 34 ${-30 + s * 7} ${41 + s} ${-32 - s * 2}`} strokeWidth={2.5} />
      </g>
    </>
  );
};

// Anna, Mari's daughter. Side view facing right; `flip` turns her to face left.
export const Anna: React.FC<{
  pose: Pose;
  place: Placement;
  scale?: number;
  tilt?: number;
  flip?: boolean;
  keys?: boolean;
  frame?: number;
  seed?: string;
}> = ({ pose, place, scale = 1, tilt = 0, flip = false, keys = false, frame = 0, seed = "anna" }) => {
  const P = useMemo(() => buildParts(seed), [seed]);
  return (
    <Rig
      dims={D}
      parts={P.rig}
      colors={{
        thigh: TROUSERS,
        shin: TROUSERS,
        foot: PALETTE.ink,
        torso: DERIVED.mustard,
        sleeve: DERIVED.mustard,
        cuff: shade(DERIVED.mustard, 0.88),
        hand: DERIVED.skin,
      }}
      pose={pose}
      place={place}
      scale={scale}
      tilt={tilt}
      flip={flip}
      boilSeed={seed}
      frame={frame}
      torsoDetail={
        <>
          <path d={P.hem} fill={shade(DERIVED.mustard, 0.88)} />
          {[-30, -18, -6, 6, 18, 30].map((x) => (
            <path key={x} d={`M ${x} -10 V 6`} stroke={shade(DERIVED.mustard, 0.75)} strokeWidth={1.6} />
          ))}
        </>
      }
      overTorso={<Piece d={P.neckline} fill={shade(DERIVED.mustard, 0.86)} shadow={null} />}
      head={<AnnaHead P={P} smile={pose.smile ?? 0} blink={pose.blink ?? 0} />}
      handProp={keys ? <Keys x={4} y={D.fore + 24} rot={20} /> : null}
    />
  );
};
