import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  blendCamera,
  Camera,
  clampCamera,
  toScreen,
  WIDE,
  type CameraState,
} from "../components/Camera";
import { CollageLetters, CollageWords } from "../components/Collage";
import { Grade, KeyLight } from "../components/material/KeyLight";
import { Piece } from "../components/material/Piece";
import { Seismograph } from "../components/Seismograph";
import { floorEnvelope, type Impact } from "../fx/ripple";
import { keys, onTwos, ramp, shake, snap } from "../lib/anim";
import { shade } from "../lib/color";
import { tornRectPath } from "../lib/paths";
import { internalsAnchors, levels, RezonInternals } from "../props/Exploded";
import {
  Chair,
  CountdownRing,
  Desk,
  Keys,
  ON,
  PaperTag,
  Phone,
  SoundBubble,
  WifiIcon,
} from "../props/Props";
import { LED, RezonHero, RezonSide, type LedState } from "../props/Rezon";
import { Anna, ANNA } from "../puppets/Anna";
import {
  Mari,
  MARI,
  walkImpacts,
  walkPose,
  walkX,
  type WalkPlan,
} from "../puppets/Mari";
import { lerpPose, type Placement, type Pose } from "../puppets/rig";
import { BathroomSet, WallCamera } from "../sets/Bathroom";
import {
  BATH_FILL,
  BathroomInHouse,
  FloorRipple,
  HOUSE,
  HouseBack,
  HouseFront,
} from "../sets/HouseSection";
import { PerspectiveFloor } from "../sets/PerspectiveFloor";
import { FALL_DELAY, fallState } from "../story/bathroomStory";
import { DERIVED, PALETTE, SAFE, VIDEO } from "../theme";
import { caption, FPS, lineTiming, scene, wordAt } from "../timeline";
import { cut, roundRect } from "../lib/shapes";
import { useMemo } from "react";

// ---- The house world (S07–S13) ----

// Picture beats in scene seconds. The sound track reads the same table, so every sound
// lands on the frame its picture event happens.
export const BEATS = {
  // The device snaps shut after the line, 0.9 s before the cut.
  s08: { land: 0.75, cut: 2.75, lift: 3.2, snap: scene("S08").seconds - 0.9 },
  s10: { rule: 2.0 },
  s11: { chime: 0.3, countFrom: 1.0, countTo: 6.8 },
  s12: { stand: 4.2, keys: 4.7 },
  s13: { smile: 2.5 },
} as const;

// S07: the house assembles from just before "hanem maga a ház" and always lands 0.45 s
// before the cut, so S08 never opens on a jump. Shared with the sound track.
export const s07Build = () => {
  const w8 = wordAt("S07", "vo_06", 8);
  const end = Math.min(w8 + 1.3, scene("S07").seconds - 0.45);
  return { start: Math.min(w8 - 0.6, end - 1.4), end };
};

const X_DEV = 1490; // Rezon on the bathroom floor, between sink and tub
const MARI_SCALE = 0.42; // matches the bathroom set's scale inside the house
const FLOOR = HOUSE.floorY;
const CAM_BATH: CameraState = clampCamera({ cx: 1340, cy: 470, zoom: 2.3 });

// Section clock σ: 0 at the start of S09, running through S10 and S11.
const S09_LEN = scene("S09").seconds;
const S10_LEN = scene("S10").seconds;
const SEC_WALK: WalkPlan = {
  t0: 0.4,
  t1: 10.4,
  x0: 330,
  period: 0.5,
  scale: MARI_SCALE,
};
const SEC_X = walkX(SEC_WALK, SEC_WALK.t1);
const SEC_SLIP = S09_LEN + 0.3;
const SEC_HIT = SEC_SLIP + FALL_DELAY;
const MARI_DOWN_X = SEC_X - 40 * MARI_SCALE;
const STEPS = walkImpacts(SEC_WALK);
const FALL: Impact = { t: SEC_HIT, x: MARI_DOWN_X - 20, kind: "fall" };
const EVENTS: Impact[] = [...STEPS, FALL];
// Section events for the sound track (σ = seconds from the start of S09).
export const SECTION = { steps: STEPS, slip: SEC_SLIP, hit: SEC_HIT } as const;

type Puppet = { pose: Pose; place: Placement; tilt: number };

const mariInSection = (sigma: number): Puppet => {
  if (sigma < SEC_SLIP) {
    return {
      pose: walkPose(SEC_WALK, sigma),
      place: { mode: "stand", x: walkX(SEC_WALK, sigma), floor: FLOOR },
      tilt: 0,
    };
  }
  const f = fallState(sigma, SEC_SLIP, SEC_X, FLOOR, MARI_SCALE);
  const s11 = sigma - S09_LEN - S10_LEN;
  if (s11 <= 0) return f;
  // She tries to get up: the hand lifts weakly, twice, and drops.
  const w = keys(s11, [
    [1.3, 0],
    [2.0, 1],
    [2.6, 0.15],
    [3.7, 0.85],
    [4.4, 0.1],
  ]);
  return { ...f, pose: lerpPose(MARI.lie, MARI.lieReach, w) };
};

const SectionWorld: React.FC<{
  frame: number;
  assemble?: number;
  bathroomCamera?: React.ReactNode;
  mari?: Puppet | null;
  anna?: React.ReactNode;
  device?: { y: number; led: LedState } | null;
  ripple?: { t: number; impacts: readonly Impact[] };
  extra?: React.ReactNode;
  clockHours?: number;
}> = ({
  frame,
  assemble = 1,
  bathroomCamera,
  mari,
  anna,
  device,
  ripple,
  extra,
  clockHours,
}) => (
  <>
    <HouseBack
      assemble={assemble}
      rightRoom={
        <BathroomInHouse>
          <BathroomSet camera={bathroomCamera} clockHours={clockHours} />
        </BathroomInHouse>
      }
    />
    {mari ? (
      <Mari
        pose={mari.pose}
        place={mari.place}
        tilt={mari.tilt}
        scale={MARI_SCALE}
        frame={frame}
      />
    ) : null}
    {anna}
    {device ? <RezonSide x={X_DEV} y={device.y} led={device.led} /> : null}
    {extra}
    <HouseFront assemble={assemble} />
    {ripple ? (
      <>
        <FloorRipple
          t={ripple.t}
          impacts={ripple.impacts.filter((i) => i.kind === "step")}
        />
        <FloorRipple
          t={ripple.t}
          impacts={ripple.impacts.filter((i) => i.kind === "fall")}
          color={PALETTE.red}
          guide={false}
        />
      </>
    ) : null}
  </>
);

const Frame: React.FC<{
  children: React.ReactNode;
  overlay?: React.ReactNode;
  light?: number;
}> = ({ children, overlay, light = 0.9 }) => (
  <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </svg>
    <KeyLight strength={light} />
    {overlay}
  </AbsoluteFill>
);

const ScreenSvg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={VIDEO.width}
    height={VIDEO.height}
    style={{ position: "absolute", inset: 0 }}
  >
    {children}
  </svg>
);

const sectionClock = (frame: number, offset: number) =>
  offset + onTwos(frame) / FPS;
const deviceGlow = (t: number, impacts: readonly Impact[]) =>
  Math.min(1, 0.25 + floorEnvelope(X_DEV, t, impacts) / 2);
const clockAt = (sigma: number) => 8 + (10 + sigma * 0.12) / 60;

// ---- S07: 2028. The camera peels off; the bathroom becomes a cross-section of the whole house. ----
export const S07: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const w = (i: number) => wordAt("S07", "vo_06", i);
  const peel = ramp(t, w(6) - 0.1, w(6) + 0.9, 0, 1, (v) => v);
  const B = s07Build();
  const build = ramp(t, B.start, B.end);
  const cam = blendCamera(BATH_FILL, WIDE, build);
  const slam = keys(t, [
    [w(0) - 0.12, 2.6],
    [w(0), 1],
    [w(0) + 0.08, 0.93],
    [w(0) + 0.18, 1],
  ]);
  const park = ramp(t, w(0) + 1.4, w(0) + 1.9);
  return (
    <Frame
      overlay={
        t >= w(0) - 0.12 ? (
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              translate: `${-park * 700}px ${-park * 400}px`,
              scale: `${slam * (1 - park * 0.6)}`,
            }}
          >
            <CollageLetters
              text={ON.year}
              size={170}
              style="ransom"
              seed="stamp-year"
            />
          </AbsoluteFill>
        ) : null
      }
    >
      <Camera state={cam}>
        <SectionWorld
          frame={frame}
          assemble={build}
          bathroomCamera={<WallCamera ledOn={t % 1 < 0.5} peel={peel} />}
        />
      </Camera>
    </Frame>
  );
};

// ---- S08: the device lands, push in, exploded view with labels, snap back together. ----
const HERO = { cx: 960, cy: 690, rx: 220, k: 0.5, h: 80 };
const CUT_TO_HERO = BEATS.s08.cut;

const heroBackdrop = {
  wall: Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 11 }, (_, col) =>
      cut(
        roundRect(-60 + col * 190, -150 + row * 190, 180, 180, 5, 8),
        `ht-${row}-${col}`,
        { wobble: 1.2 },
      ),
    ),
  ).flat(),
  skirting: cut(roundRect(-20, 418, 1960, 36, 2, 8), "ht-skirt", {
    wobble: 1.2,
  }),
};

const HeroBackdrop: React.FC = () => (
  <>
    <g filter="url(#dof-4)">
      <rect width={1920} height={440} fill={PALETTE.kraft} />
      <g filter="url(#sh-flat)">
        {heroBackdrop.wall.map((d, i) => (
          <Piece key={i} d={d} fill={PALETTE.paper} shadow={null} />
        ))}
      </g>
    </g>
    <g filter="url(#dof-2)">
      <Piece
        d={heroBackdrop.skirting}
        fill={PALETTE.cardboard}
        material="card"
        depth={5}
      />
    </g>
    <PerspectiveFloor
      rows={[452, 482, 520, 568, 630, 708, 810, 944, 1120]}
      vp={[960, -700]}
      spacing={300}
      tile={[PALETTE.paper, DERIVED.towel]}
      grout={DERIVED.steel}
      seed="close-floor"
      sharpFrom={522}
      sharpTo={808}
    />
  </>
);

export const S08: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tw = onTwos(frame) / FPS;
  const w = (i: number) => wordAt("S08", "vo_07", i);

  if (t < CUT_TO_HERO) {
    const y = keys(tw, [
      [0.2, -260],
      [BEATS.s08.land, FLOOR],
      [0.83, FLOOR - 16],
      [0.92, FLOOR],
    ]);
    const landing: Impact[] = [{ t: BEATS.s08.land, x: X_DEV, kind: "step" }];
    const cam = blendCamera(
      WIDE,
      clampCamera({ cx: X_DEV, cy: 560, zoom: 3.4 }),
      ramp(t, 1.4, CUT_TO_HERO),
    );
    return (
      <Frame>
        <Camera state={cam}>
          <SectionWorld
            frame={frame}
            device={{ y, led: LED.ok(deviceGlow(tw, landing)) }}
            ripple={{ t: tw, impacts: landing }}
            clockHours={clockAt(-10)}
          />
        </Camera>
      </Frame>
    );
  }

  // Exploded view: lift, hold while the labels pop on their words, snap back together.
  const SNAP = BEATS.s08.snap;
  const e = keys(tw, [
    [BEATS.s08.lift, 0],
    [4.2, 1],
    [SNAP - 0.35, 1],
    [SNAP, -0.04],
    [SNAP + 0.1, 0],
  ]);
  const L = levels(HERO.cy, Math.max(0, e));
  const A = internalsAnchors(HERO.cx, HERO.cy, HERO.rx, HERO.k, Math.max(0, e));
  const tagScale = (word: number) =>
    snap(ramp(t, w(word), w(word) + 0.25)) *
    (1 - ramp(t, SNAP - 0.55, SNAP - 0.3));
  const cam = blendCamera(
    WIDE,
    clampCamera({ cx: 960, cy: 560, zoom: 1.05 }),
    ramp(t, CUT_TO_HERO, scene("S08").seconds),
  );
  const pulse = 0.55 + 0.45 * Math.sin(t * 5);
  return (
    <Frame light={0.8}>
      <Camera state={cam}>
        <HeroBackdrop />
        <RezonHero
          cx={HERO.cx}
          cy={HERO.cy}
          rx={HERO.rx}
          k={HERO.k}
          h={HERO.h}
          seed="hero8"
          led={LED.ok(t > SNAP + 0.1 ? 1 : pulse)}
          lidLift={L.lidLift}
          inside={
            e > 0 ? (
              <RezonInternals
                cx={HERO.cx}
                cy={HERO.cy}
                rx={HERO.rx}
                k={HERO.k}
                e={Math.max(0, e)}
              />
            ) : null
          }
        />
        <PaperTag
          x={540}
          y={L.speaker}
          text={ON.parts[0]}
          anchor={A.speaker}
          seed="tag-speaker"
          scale={tagScale(6)}
        />
        <PaperTag
          x={1390}
          y={L.board + 10}
          text={ON.parts[1]}
          anchor={A.board}
          seed="tag-esp"
          rot={2}
          scale={tagScale(8)}
        />
        <PaperTag
          x={1410}
          y={L.tray - 6}
          text={ON.parts[3]}
          anchor={A.battery}
          seed="tag-battery"
          rot={3}
          scale={tagScale(10)}
        />
        <PaperTag
          x={520}
          y={L.tray - 40}
          text={ON.parts[2]}
          anchor={A.geophone}
          seed="tag-geofon"
          scale={tagScale(12)}
        />
        <g transform={`translate(1340 ${L.board - 150}) scale(${tagScale(4)})`}>
          <WifiIcon x={0} y={0} scale={1.4} />
        </g>
        <PaperTag
          x={1560}
          y={L.board - 146}
          text={ON.wireless}
          seed="tag-wireless"
          rot={-3}
          scale={tagScale(4)}
        />
      </Camera>
    </Frame>
  );
};

// ---- S09: she walks; every step travels through the floor to Rezon and onto the tape. ----
const Tape: React.FC<{ sigma: number }> = ({ sigma }) => (
  <ScreenSvg>
    <Seismograph
      x={230}
      y={786}
      w={1460}
      h={100}
      t={sigma}
      impacts={EVENTS}
      xDevice={X_DEV}
      label={ON.stepPattern}
    />
  </ScreenSvg>
);

export const S09: React.FC = () => {
  const frame = useCurrentFrame();
  const sigma = sectionClock(frame, 0);
  const cam = blendCamera(
    WIDE,
    clampCamera({ cx: 1000, cy: 520, zoom: 1.04 }),
    ramp(frame / FPS, 0, 11),
  );
  return (
    <Frame overlay={<Tape sigma={sigma} />}>
      <Camera state={cam}>
        <SectionWorld
          frame={frame}
          mari={mariInSection(sigma)}
          device={{ y: FLOOR, led: LED.ok(deviceGlow(sigma, EVENTS)) }}
          ripple={{ t: sigma, impacts: EVENTS }}
          clockHours={clockAt(sigma)}
        />
      </Camera>
    </Frame>
  );
};

// ---- S10: the same slip. One big red ripple, a spike, then a flat line: the detection rule. ----
export const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sigma = sectionClock(frame, S09_LEN);
  const sh = shake(S09_LEN + t, SEC_HIT, 4);
  const cam = {
    ...clampCamera({ cx: 1000, cy: 520, zoom: 1.04 }),
    sx: sh.x,
    sy: sh.y,
  };
  const rule = snap(ramp(t, BEATS.s10.rule, BEATS.s10.rule + 0.3));
  return (
    <Frame
      overlay={
        <>
          <Tape sigma={sigma} />
          <ScreenSvg>
            {rule > 0 ? (
              <PaperTag
                x={960}
                y={752}
                text={ON.fallRule}
                size={36}
                ink={PALETTE.red}
                seed="fall-rule"
                rot={-1.5}
                scale={rule}
              />
            ) : null}
          </ScreenSvg>
        </>
      }
    >
      <Camera state={cam}>
        <SectionWorld
          frame={frame}
          mari={mariInSection(sigma)}
          device={{ y: FLOOR, led: LED.ok(deviceGlow(sigma, EVENTS)) }}
          ripple={{ t: sigma, impacts: EVENTS }}
          clockHours={clockAt(sigma)}
        />
      </Camera>
    </Frame>
  );
};

// ---- S11: amber LED, the device speaks, a 10-second countdown runs; she cannot get up. ----
const Rings: React.FC<{
  t: number;
  x: number;
  y: number;
  color: string;
  speed?: number;
  max?: number;
}> = ({ t, x, y, color, speed = 1.1, max = 120 }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const p = (((t * speed + i / 3) % 1) + 1) % 1;
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={16 + p * max}
          ry={(16 + p * max) * 0.42}
          fill="none"
          stroke={color}
          strokeWidth={4 - p * 2.5}
          opacity={(1 - p) * 0.9}
        />
      );
    })}
  </g>
);

const wordsShown = (t: number, line: "dev_01" | "dev_02", at: number) =>
  lineTiming(line).words.filter((w) => w <= t - at).length;

export const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sigma = sectionClock(frame, S09_LEN + S10_LEN);
  const cam = blendCamera(
    clampCamera({ cx: 1000, cy: 520, zoom: 1.04 }),
    CAM_BATH,
    ramp(t, 0, 0.9),
  );
  const dev = toScreen(cam, X_DEV, FLOOR - 40);
  const cue1 = scene("S11").cues[0].at;
  const cue2 = scene("S11").cues[1].at;
  const speaking =
    t < cue2
      ? { line: "dev_01" as const, at: cue1 }
      : { line: "dev_02" as const, at: cue2 };
  const shown = wordsShown(t, speaking.line, speaking.at);
  const amber = LED.warn(0.6 + 0.4 * Math.abs(Math.sin(t * 3)));
  return (
    <Frame
      overlay={
        <>
          {/* Alarm mood: an amber wash from the edges, breathing with the LED. */}
          <Grade
            color={PALETTE.warm}
            strength={ramp(
              t,
              0.2,
              1.0,
              0,
              0.2 + 0.08 * Math.abs(Math.sin(t * 3)),
            )}
          />
          <ScreenSvg>
            {t >= cue1 ? (
              <SoundBubble
                x={dev.x - 430}
                y={dev.y - 300}
                text={caption(speaking.line).pages[0][0]}
                revealed={shown}
                tail={[dev.x - 40, dev.y - 70]}
              />
            ) : null}
          </ScreenSvg>
        </>
      }
    >
      <Camera state={cam}>
        <SectionWorld
          frame={frame}
          mari={mariInSection(sigma)}
          device={{ y: FLOOR, led: amber }}
          clockHours={clockAt(sigma)}
          extra={
            <>
              {t > BEATS.s11.chime ? (
                <Rings
                  t={t}
                  x={X_DEV + 20}
                  y={FLOOR - 44}
                  color={PALETTE.warm}
                />
              ) : null}
              <CountdownRing
                cx={X_DEV}
                cy={FLOOR - 18}
                r={78}
                progress={ramp(
                  t,
                  BEATS.s11.countFrom,
                  BEATS.s11.countTo,
                  0,
                  1,
                  (v) => v,
                )}
              />
            </>
          }
        />
      </Camera>
    </Frame>
  );
};

// ---- S12: split screen. The alert travels from the house to Anna's phone; she grabs her keys. ----
const RIGHT_FLOOR = 1000;
const MINI = { x: 30, y: 300, s: 0.47 };

const Divider: React.FC = () => {
  const d = useMemo(() => tornRectPath(1120, 44, 404, { tear: 6 }), []);
  return (
    <g transform="translate(990 -20) rotate(90)">
      <Piece d={d} fill={PALETTE.paper} />
    </g>
  );
};

export const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tw = onTwos(frame) / FPS;
  const w = (i: number) => wordAt("S12", "vo_10", i);
  const tLit = w(6);
  const travel = ramp(t, w(3) - 0.2, tLit, 0, 1, (v) => v);
  const lit = ramp(t, tLit, tLit + 0.3);
  const buzz = t > tLit && t < tLit + 0.8 ? Math.sin(t * 90) * 4 : 0;

  // From the device in the mini house to the phone screen, as a travelling teal wave.
  const from = {
    x: MINI.x + X_DEV * MINI.s,
    y: MINI.y + (FLOOR - 30) * MINI.s,
  };
  const to = { x: 1700, y: 430 };
  const pts: string[] = [];
  const n = 90;
  for (let i = 0; i <= n * travel; i++) {
    const p = i / n;
    const x = from.x + (to.x - from.x) * p;
    const y = from.y + (to.y - from.y) * p - Math.sin(p * Math.PI) * 160;
    pts.push(
      `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(y + Math.sin(p * 42) * 10).toFixed(1)}`,
    );
  }

  const standUp = ramp(tw, BEATS.s12.stand, BEATS.s12.stand + 0.7);
  const annaPose =
    tw < tLit + 0.2
      ? ANNA.sit
      : tw < 4.2
        ? lerpPose(ANNA.sit, ANNA.sitAlert, ramp(tw, tLit + 0.2, tLit + 0.6))
        : lerpPose(ANNA.sitAlert, ANNA.grabKeys, standUp);
  const hipY = keys(tw, [
    [4.2, RIGHT_FLOOR - 104],
    [4.9, RIGHT_FLOOR - 180],
  ]);
  const hasKeys = tw > BEATS.s12.keys;

  return (
    <Frame light={0.85}>
      {/* Left: the house, small. */}
      <g transform={`translate(${MINI.x} ${MINI.y}) scale(${MINI.s})`}>
        <SectionWorld
          frame={frame}
          mari={mariInSection(S09_LEN + S10_LEN + 6)}
          device={{ y: FLOOR, led: LED.warn(1) }}
          clockHours={clockAt(30)}
        />
      </g>
      {/* Right: Anna at work. */}
      <rect
        x={990}
        y={0}
        width={930}
        height={RIGHT_FLOOR}
        fill={shade(PALETTE.kraft, 1.07)}
      />
      <rect
        x={990}
        y={0}
        width={930}
        height={RIGHT_FLOOR}
        fill="url(#tex-grain)"
        opacity={0.5}
      />
      <rect
        x={990}
        y={RIGHT_FLOOR}
        width={930}
        height={120}
        fill={PALETTE.cardboard}
      />
      <rect
        x={990}
        y={RIGHT_FLOOR}
        width={930}
        height={120}
        fill="url(#tex-fiber)"
        opacity={0.4}
      />
      <Chair x={1210} y={RIGHT_FLOOR + 20} />
      <Anna
        pose={annaPose}
        place={{ mode: "hip", x: 1210 + standUp * 40, y: hipY }}
        scale={0.95}
        keys={hasKeys}
        frame={frame}
      />
      <g
        transform={`translate(1590 ${RIGHT_FLOOR - 222}) scale(0.84) translate(-1590 ${-(RIGHT_FLOOR - 222)})`}
      >
        <Desk x={1590} y={RIGHT_FLOOR - 222} />
      </g>
      {!hasKeys ? <Keys x={1450} y={RIGHT_FLOOR - 252} rot={-70} /> : null}
      <Phone x={1730 + buzz} y={518} lit={lit} rot={-4} />
      <Divider />
      {travel > 0 && t < tLit + 1.2 ? (
        <path
          d={pts.join(" ")}
          stroke={PALETTE.teal}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          filter="url(#sh-s)"
        />
      ) : null}
    </Frame>
  );
};

// ---- S13: Anna helps her sit up; Mari smiles. Pull back to the calm house; the tagline. ----
const TAG_WORDS = lineTiming("vo_11").words;

export const S13: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tw = onTwos(frame) / FPS;
  const s = MARI_SCALE;
  const up = ramp(tw, 1.0, 2.4);
  const mariPose =
    tw < 2.4
      ? lerpPose(MARI.lie, MARI.sitFloor, up)
      : lerpPose(
          MARI.sitFloor,
          MARI.sitSmile,
          ramp(tw, BEATS.s13.smile, BEATS.s13.smile + 0.5),
        );
  const mari: Puppet = {
    pose: mariPose,
    place: { mode: "hip", x: MARI_DOWN_X, y: FLOOR - (50 - 16 * up) * s },
    tilt: -90 * (1 - up),
  };
  const annaPose = lerpPose(ANNA.kneel, ANNA.help, ramp(tw, 0.3, 1.0));
  const cam = blendCamera(CAM_BATH, WIDE, ramp(t, 3.4, 5.5));
  const calm = t > 2.6;
  const at = scene("S13").cues[0].at;
  const pop = (i: number) =>
    snap(ramp(t, at + TAG_WORDS[i], at + TAG_WORDS[i] + 0.22));
  return (
    <Frame
      overlay={
        <>
          {/* Relief: once Rezon turns calm, a soft teal lift from the center. */}
          <Grade
            color={PALETTE.teal}
            strength={ramp(t, 2.6, 4.2, 0, 0.12)}
            from="center"
            blend="screen"
          />
          {t >= at ? (
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: SAFE.y + 6,
                gap: 14,
              }}
            >
              <div style={{ scale: `${pop(0)}` }}>
                <CollageWords
                  text={caption("vo_11").pages[0][0]}
                  size={92}
                  style="ransom"
                  seed="tagline-brand"
                />
              </div>
              <CollageWords
                text={caption("vo_11").pages[0][1]}
                size={54}
                style="ransom"
                seed="tagline"
                scales={[1, 2, 3, 4, 5, 6, 7].map(pop)}
              />
            </AbsoluteFill>
          ) : null}
        </>
      }
    >
      <Camera state={cam}>
        <SectionWorld
          frame={frame}
          mari={mari}
          anna={
            <Anna
              pose={annaPose}
              place={{ mode: "stand", x: MARI_DOWN_X - 120 * s, floor: FLOOR }}
              scale={s}
              frame={frame}
            />
          }
          device={{
            y: FLOOR,
            led: calm ? LED.ok(0.7 + 0.3 * Math.sin(t * 2)) : LED.warn(1),
          }}
          clockHours={clockAt(60)}
          extra={
            calm ? (
              <Rings
                t={t}
                x={X_DEV}
                y={FLOOR - 10}
                color={PALETTE.teal}
                speed={0.45}
                max={170}
              />
            ) : null
          }
        />
      </Camera>
    </Frame>
  );
};
