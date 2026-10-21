import { AbsoluteFill, useCurrentFrame } from "remotion";
import { blendCamera, Camera, clampCamera, WIDE, type CameraState } from "../components/Camera";
import { KeyLight } from "../components/material/KeyLight";
import { keys, onTwos, ramp, shake } from "../lib/anim";
import { shade, withAlpha } from "../lib/color";
import { hashSeed, mulberry32 } from "../lib/random";
import { Cassette, Dust, FlyingTowel, MonitorInset, Puddle } from "../props/Props";
import { Mari } from "../puppets/Mari";
import { BATH, BathroomSet, WallCamera, WindowLight } from "../sets/Bathroom";
import { bathAt, FALL_HIT, PUDDLE_X, STORY_END, STORY_START } from "../story/bathroomStory";
import { PALETTE, VIDEO } from "../theme";
import { FPS } from "../timeline";

const Frame: React.FC<{ children: React.ReactNode; overlay?: React.ReactNode; light?: number; bg?: string }> = ({
  children,
  overlay,
  light = 1,
  bg = PALETTE.kraft,
}) => (
  <AbsoluteFill style={{ backgroundColor: bg }}>
    <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
    {light > 0 ? <KeyLight strength={light} /> : null}
    {overlay}
  </AbsoluteFill>
);

// ---- S01: the hook. Dark cardboard, a thud, the frame shakes once, dust settles. ----
export const S01_HIT = 0.6;

export const S01: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shake(t, S01_HIT, 3);
  return (
    <Frame light={0} bg={shade(PALETTE.ink, 0.6)}>
      <g transform={`translate(${sh.x.toFixed(2)} ${sh.y.toFixed(2)})`}>
        <rect x={-10} y={-10} width={1940} height={1100} fill={shade(PALETTE.cardboard, 0.42)} />
        <rect x={-10} y={-10} width={1940} height={1100} fill="url(#tex-flutes)" opacity={0.18} />
        <rect x={-10} y={-10} width={1940} height={1100} fill="url(#tex-fiber)" opacity={0.6} />
        <rect x={-10} y={-10} width={1940} height={1100} fill="url(#tex-grain)" opacity={0.6} />
        <Dust t={t} hit={S01_HIT} />
      </g>
      {/* Barely lit: one dim pool of light, the rest falls off to near-black brown. */}
      <defs>
        <radialGradient id="s01-dark" cx="0.5" cy="0.46" r="0.62">
          <stop offset="0%" stopColor={shade(PALETTE.ink, 0.4)} stopOpacity={0.25} />
          <stop offset="100%" stopColor={shade(PALETTE.ink, 0.25)} stopOpacity={0.94} />
        </radialGradient>
      </defs>
      <rect width={1920} height={1080} fill="url(#s01-dark)" />
    </Frame>
  );
};

// ---- S02–S05 share one bathroom, driven by the story clock τ. ----

const CAM_CORNER: CameraState = clampCamera({ cx: 1600, cy: 200, zoom: 2.2 });
const CAM_MEDIUM: CameraState = clampCamera({ cx: 1260, cy: 400, zoom: 1.45 });
const CAM_SLIP: CameraState = clampCamera({ cx: 1060, cy: 620, zoom: 1.3 });

const BathroomView: React.FC<{ tau: number; frame: number; cam: CameraState; overlay?: React.ReactNode }> = ({ tau, frame, cam, overlay }) => {
  const s = bathAt(tau);
  return (
    <Frame overlay={overlay}>
      <Camera state={cam}>
        <BathroomSet clockHours={s.clockHours} night={s.night} drip={s.drip} camera={<WallCamera ledOn={s.ledOn} covered={s.covered} />} />
        <Puddle x={PUDDLE_X} y={BATH.floorY + 10} amount={s.puddle} />
        <Mari pose={s.mari.pose} place={s.mari.place} tilt={s.mari.tilt} carryTowel={s.mari.carry} frame={frame} />
        {s.flyingTowel ? <FlyingTowel {...s.flyingTowel} /> : null}
        <WindowLight strength={1 - s.night} />
      </Camera>
      {s.night > 0 ? <rect width={1920} height={1080} fill={PALETTE.night} opacity={s.night * 0.5} style={{ mixBlendMode: "multiply" }} /> : null}
    </Frame>
  );
};

const story = (frame: number, start: number) => start + onTwos(frame) / FPS;

export const S02: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = blendCamera(WIDE, clampCamera({ cx: 820, cy: 560, zoom: 1.06 }), ramp(t, 0.5, 5));
  return <BathroomView tau={story(frame, STORY_START.S02)} frame={frame} cam={cam} />;
};

export const S03: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const push = blendCamera(clampCamera({ cx: 820, cy: 560, zoom: 1.06 }), CAM_CORNER, ramp(t, 0.1, 2.3));
  const cam = blendCamera(push, CAM_MEDIUM, ramp(t, 2.6, 3.6));
  return <BathroomView tau={story(frame, STORY_START.S03)} frame={frame} cam={cam} />;
};

export const S04: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tau = story(frame, STORY_START.S04);
  const sh = shake(STORY_START.S04 + t, FALL_HIT, 3);
  const cam = { ...blendCamera(CAM_MEDIUM, CAM_SLIP, ramp(t, 0, 0.4)), sx: sh.x, sy: sh.y };
  return (
    <BathroomView
      tau={tau}
      frame={frame}
      cam={cam}
      overlay={
        <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }}>
          <MonitorInset x={330} y={250} show={ramp(t, 1.25, 1.55)} />
        </svg>
      }
    />
  );
};

export const S05: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = blendCamera(clampCamera({ cx: 880, cy: 540, zoom: 1.05 }), clampCamera({ cx: 980, cy: 600, zoom: 1.16 }), ramp(t, 0, 8));
  return <BathroomView tau={story(frame, STORY_START.S05)} frame={frame} cam={cam} />;
};

// ---- S06: rewind. The story runs backwards, fast and jerky, and stops on the empty bathroom. ----
export const REWIND_END = 3.0;

export const S06: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // Stepped on threes with a little seeded jitter: a tape being wound back, not a smooth reverse.
  const stepped = (frame - (frame % 3)) / FPS;
  const p = keys(stepped, [
    [0.15, 0],
    [REWIND_END, 1],
  ]);
  const tau = STORY_END * (1 - Math.pow(p, 1.4));
  const r = mulberry32(hashSeed("rewind") + Math.floor(frame / 3));
  const rewinding = t < REWIND_END;
  const jitter = rewinding ? { sx: (r() - 0.5) * 10, sy: (r() - 0.5) * 4 } : {};
  const cam = { ...WIDE, ...jitter };
  return (
    <BathroomView
      tau={tau}
      frame={frame}
      cam={cam}
      overlay={
        <>
          {rewinding ? (
            <AbsoluteFill style={{ background: withAlpha(PALETTE.night, 0.12), mixBlendMode: "multiply" }} />
          ) : null}
          <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }}>
            <Cassette x={1690} y={200} angle={-onTwos(frame) * 24 * (rewinding ? 1 : 0)} scale={rewinding ? 1 : ramp(t, REWIND_END, REWIND_END + 0.3, 1, 0)} />
          </svg>
        </>
      }
    />
  );
};
