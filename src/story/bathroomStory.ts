import type { Impact } from "../fx/ripple";
import { keys, ramp } from "../lib/anim";
import { MARI, walkImpacts, walkPose, walkX, type WalkPlan } from "../puppets/Mari";
import { lerpPose, type Placement, type Pose } from "../puppets/rig";
import { BATH } from "../sets/Bathroom";
import { scene, wordAt } from "../timeline";

// S02–S05 as one continuous story in seconds (τ = 0 at the start of S02). S02–S05 play it forward;
// S06 plays it backwards, so the rewind shows exactly what the viewer just saw.

const S02 = scene("S02").seconds;
const T03 = S02;
const T04 = T03 + scene("S03").seconds;
const T05 = T04 + scene("S04").seconds;
export const STORY_END = T05 + scene("S05").seconds;
export const STORY_START = { S02: 0, S03: T03, S04: T04, S05: T05 } as const;

const FLOOR = BATH.floorY;

// She shuffles in with her towel over her arm, then walks over under the camera.
const WALK_IN: WalkPlan = { t0: 0.3, t1: 4.4, x0: -120, period: 0.6, stride: 95, scale: 1 };
const WALK_OVER: WalkPlan = { t0: T03, t1: T03 + 3, x0: walkX(WALK_IN, WALK_IN.t1), period: 0.6, stride: 95, scale: 1 };
const SPOT = walkX(WALK_OVER, WALK_OVER.t1);
export const PUDDLE_X = SPOT + 60;
export const STORY_STEPS: Impact[] = [...walkImpacts(WALK_IN), ...walkImpacts(WALK_OVER)];

// The towel lands on the last word of VO-03 ("… fürdeni?"): the joke's punchline.
const LAND = T03 + wordAt("S03", "vo_03", 11) + 0.6;
export const THROW = { wind: LAND - 0.95, release: LAND - 0.55, land: LAND };

// The slip: feet go, she tilts back, and hits the floor (the same thud as S01).
const SLIP = T04 + 0.25;
export const FALL_HIT = SLIP + 0.6;
const HAND: [number, number] = [SPOT + 70, FLOOR - 330];
const DRAPE: [number, number] = [1770, 120];

export type BathState = {
  mari: { pose: Pose; place: Placement; tilt: number; carry: boolean };
  flyingTowel: { x: number; y: number; rot: number } | null;
  covered: number;
  night: number;
  clockHours: number;
  drip: number;
  ledOn: boolean;
  puddle: number;
};

const stand = (x: number): Placement => ({ mode: "stand", x, floor: FLOOR });

const mariAt = (tau: number): BathState["mari"] => {
  const carry = tau < THROW.release;
  const holding = (p: Pose): Pose => (carry ? { ...p, nearArm: MARI.carry.nearArm } : p);

  if (tau < WALK_IN.t1) return { pose: holding(walkPose(WALK_IN, tau)), place: stand(walkX(WALK_IN, tau)), tilt: 0, carry };
  if (tau < WALK_OVER.t0) return { pose: MARI.carry, place: stand(walkX(WALK_IN, tau)), tilt: 0, carry };
  if (tau < WALK_OVER.t1) return { pose: holding(walkPose(WALK_OVER, tau)), place: stand(walkX(WALK_OVER, tau)), tilt: 0, carry };

  if (tau < SLIP) {
    const seq: [number, Pose][] = [
      [WALK_OVER.t1, MARI.carry],
      [WALK_OVER.t1 + 0.5, MARI.lookUp],
      [THROW.wind - 0.9, MARI.lookUp],
      [THROW.wind - 0.4, MARI.hesitate],
      [THROW.wind, MARI.hesitate],
      [THROW.release - 0.1, MARI.windUp],
      [THROW.release + 0.1, MARI.release],
      [THROW.land + 0.5, MARI.lookUp],
      [SLIP, MARI.stand],
    ];
    let pose: Pose = seq[seq.length - 1][1];
    for (let i = 0; i < seq.length - 1; i++) {
      const [ta, pa] = seq[i];
      const [tb, pb] = seq[i + 1];
      if (tau >= ta && tau < tb) pose = lerpPose(pa, pb, ramp(tau, ta, tb));
    }
    return { pose: holding(pose), place: stand(SPOT), tilt: 0, carry };
  }

  return { ...fallState(tau, SLIP, SPOT, FLOOR, 1), carry: false };
};

// The slip, reusable at any scale (S04 in the bathroom, S10 in the cross-section): the feet go,
// the hip is pinned and lowered to the floor while the body tips back. Impact at slip + 0.6 s.
export const FALL_DELAY = 0.6;
export const fallState = (t: number, slip: number, x0: number, floor: number, s: number) => {
  const hit = slip + FALL_DELAY;
  const pose =
    t < slip + 0.35 ? lerpPose(MARI.stand, MARI.slip, ramp(t, slip, slip + 0.35)) : lerpPose(MARI.slip, MARI.lie, ramp(t, slip + 0.35, hit));
  const y = keys(t, [
    [slip, floor - 199 * s],
    [slip + 0.3, floor - 175 * s],
    [hit, floor - 50 * s],
    [hit + 0.08, floor - 57 * s],
    [hit + 0.18, floor - 50 * s],
  ]);
  const x = keys(t, [
    [slip, x0],
    [hit, x0 - 40 * s],
  ]);
  const tilt = keys(t, [
    [slip, 0],
    [slip + 0.3, -32],
    [hit, -90],
  ]);
  return { pose, place: { mode: "hip", x, y } as Placement, tilt };
};

export const bathAt = (tau: number): BathState => {
  const fly = ramp(tau, THROW.release, THROW.land, 0, 1, (v) => v);
  const flying = tau >= THROW.release && tau < THROW.land;
  return {
    mari: mariAt(tau),
    flyingTowel: flying
      ? {
          x: HAND[0] + (DRAPE[0] - HAND[0]) * fly,
          y: HAND[1] + (DRAPE[1] - HAND[1]) * fly - 260 * 4 * fly * (1 - fly),
          rot: fly * 380,
        }
      : null,
    covered: tau >= THROW.land ? Math.min(1, (tau - THROW.land) / 0.12) : 0,
    night: ramp(tau, T05 + 0.4, STORY_END - 0.6),
    clockHours: 8 + 5 / 60 + ramp(tau, T05 + 0.4, STORY_END - 0.6, 0, 10, (v) => v),
    drip: ((tau % 1.6) + 1.6) % 1.6 < 0.6 ? (((tau % 1.6) + 1.6) % 1.6) / 0.6 : 0,
    ledOn: ((tau % 1) + 1) % 1 < 0.5,
    puddle: ramp(tau, T04 - 1, T04),
  };
};
