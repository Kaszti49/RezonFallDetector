import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CollageLetters } from "../components/Collage";
import { KeyLight } from "../components/material/KeyLight";
import { keys, onTwos, ramp } from "../lib/anim";
import { Book, ON, Pedestal } from "../props/Props";
import { LED, RezonHero } from "../props/Rezon";
import { TeamMember, useFaces } from "../puppets/TeamMember";
import { PALETTE, VIDEO } from "../theme";
import { FPS, lineText, lineTiming, scene, type SceneId } from "../timeline";

// S14–S19 are one continuous pop-up book on a team clock (0 = start of S14).
const S14_LEN = scene("S14").seconds;
const MEMBER_SCENES: SceneId[] = ["S15", "S16", "S17", "S18"];
const LINES = ["team_1", "team_2", "team_3", "team_4"] as const;
const memberStart = (i: number) =>
  MEMBER_SCENES.slice(0, i).reduce((s, id) => s + scene(id).seconds, S14_LEN);
const FINALE = memberStart(4);

const CENTER = 960;
const BASE_Y = 760;
// Final lineup reads left to right in speaking order, with the device on its pedestal in the middle.
const SLOTS = [300, 640, 1280, 1620];

// Mouth flap from the recording's loudness (RMS per frame): open on syllable peaks – above 15 % of
// the line's peak and within 80 % of the loudest frame ±3 around it – so the mouth closes in the dips
// between syllables. The state only flips after the new level has held for 2 frames (hysteresis);
// read one frame ahead to cancel that lag.
// Two shape rules then keep a flat or flickering envelope talking: an opening longer than MAX_OPEN
// frames is split evenly by 2-frame closures, and while the voice is above the floor the mouth never
// stays shut longer than MAX_SHUT frames (open 3, shut 2). Gaps between openings stay ≥ 2 frames.
const MAX_OPEN = 7;
const MAX_SHUT = 6;
const runs = (n: number, keep: (i: number) => boolean) => {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    if (!keep(i)) continue;
    let j = i;
    while (j + 1 < n && keep(j + 1)) j++;
    out.push([i, j]);
    i = j;
  }
  return out;
};
const flapTrack = (rms: readonly number[]) => {
  const peak = Math.max(...rms);
  const voiced = (i: number) => rms[i] > 0.15 * peak;
  const loud = (i: number) =>
    voiced(i) &&
    rms[i] > 0.8 * Math.max(...rms.slice(Math.max(0, i - 3), i + 4));
  const held: boolean[] = [];
  let open = false;
  let run = 0;
  for (let i = 0; i < rms.length; i++) {
    if (loud(i) !== open) {
      run++;
      if (run >= 2) {
        open = !open;
        run = 0;
      }
    } else run = 0;
    held.push(open);
  }
  const s = rms.map((_, f) => held[Math.min(f + 1, rms.length - 1)]);
  const out = [...s];
  for (const [a, b] of runs(s.length, (i) => s[i])) {
    const len = b - a + 1;
    if (len <= MAX_OPEN) continue;
    // n pieces of ≤ 5 open + 2 shut each; the open frames are shared out evenly.
    const n = Math.ceil((len + 2) / MAX_OPEN);
    const opens = len - 2 * (n - 1);
    for (let k = 0, i = a; k < n - 1; k++) {
      i += Math.floor(opens / n) + (k < opens % n ? 1 : 0);
      out[i] = out[i + 1] = false;
      i += 2;
    }
  }
  for (const [a0, b0] of runs(s.length, (i) => !s[i] && voiced(i))) {
    if (b0 - a0 + 1 <= MAX_SHUT) continue;
    const a = a0 > 0 && s[a0 - 1] ? a0 + 2 : a0;
    const b = b0 < s.length - 1 && s[b0 + 1] ? b0 - 2 : b0;
    for (let k = 0; k < Math.floor((b - a + 3) / 5); k++)
      for (let i = a + 5 * k; i < a + 5 * k + 3; i++) out[i] = true;
  }
  return out;
};
const TRACKS = new Map<readonly number[], boolean[]>();
const flap = (rms: readonly number[], f: number) => {
  if (!TRACKS.has(rms)) TRACKS.set(rms, flapTrack(rms));
  return TRACKS.get(rms)![Math.min(f, rms.length - 1)] ? 1 : 0;
};

// Without a recording yet: open on the first 60 % of each estimated syllable.
const mouthOpen = (line: (typeof LINES)[number], t: number) => {
  const { words, duration, rms } = lineTiming(line);
  if (t < 0 || t > duration) return 0;
  if (rms) return flap(rms, Math.floor(t * FPS));
  const text = lineText(line).split(" ");
  for (let i = words.length - 1; i >= 0; i--) {
    if (t >= words[i]) {
      const syl = Math.max(
        1,
        (text[i].match(/[aáeéiíoóöőuúüű]/gi) ?? []).length,
      );
      const k = (t - words[i]) * 4.6;
      return k < syl && k % 1 < 0.6 ? 1 : 0;
    }
  }
  return 0;
};

const pop = (p: number) =>
  keys(p, [
    [0, 0],
    [0.7, 1.12],
    [1, 1],
  ]);

const TeamStage: React.FC<{ offset: number }> = ({ offset }) => {
  useFaces();
  const frame = useCurrentFrame();
  const tt = offset + frame / FPS;
  const tw = offset + onTwos(frame) / FPS;
  const finale = tt - FINALE;
  const brand = pop(ramp(finale, 0.1, 0.6, 0, 1, (v) => v));
  const device = pop(ramp(finale, 0.4, 0.9, 0, 1, (v) => v));
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
        style={{ position: "absolute", inset: 0 }}
      >
        <rect width={1920} height={1080} fill="url(#tex-grain)" opacity={0.5} />
        <rect
          width={1920}
          height={1080}
          fill="url(#tex-fiber)"
          opacity={0.25}
        />
        <rect width={1920} height={1080} filter="url(#f-mottle)" />
        <Book open={ramp(tt, 0.05, 0.9)} />
        {finale > 0 ? (
          <g
            transform={`translate(${CENTER} ${BASE_Y}) scale(1 ${device.toFixed(3)}) translate(${-CENTER} ${-BASE_Y})`}
          >
            <Pedestal x={CENTER} y={BASE_Y} w={300} h={110} />
            <RezonHero
              cx={CENTER}
              cy={BASE_Y - 126 - 48 - 65}
              rx={130}
              k={0.5}
              h={48}
              seed="finale"
              led={LED.ok(1)}
            />
          </g>
        ) : null}
        {LINES.map((line, i) => {
          const local = tw - memberStart(i);
          if (local < 0) return null;
          const slide = ramp(local, 3.25, 3.85);
          const x = CENTER + (SLOTS[i] - CENTER) * slide;
          const s = 1 - 0.22 * slide;
          const cueAt = scene(MEMBER_SCENES[i]).cues[0].at;
          return (
            <g
              key={line}
              transform={`translate(${x} ${BASE_Y}) scale(${s}) translate(${-x} ${-BASE_Y})`}
            >
              <TeamMember
                index={i}
                x={x}
                y={BASE_Y}
                pop={pop(ramp(local, 0, 0.45, 0, 1, (v) => v))}
                tag={pop(ramp(local, 0.3, 0.6, 0, 1, (v) => v))}
                mouth={mouthOpen(line, tt - memberStart(i) - cueAt)}
                frame={frame}
              />
            </g>
          );
        })}
      </svg>
      <KeyLight strength={0.75} />
      {finale > 0 ? (
        <AbsoluteFill
          style={{
            alignItems: "center",
            paddingTop: 70,
            transformOrigin: "50% 30%",
            scale: `${brand}`,
          }}
        >
          <CollageLetters
            text={ON.brand}
            size={150}
            style="ransom"
            seed="finale-brand"
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const at = (id: SceneId) => {
  const order: SceneId[] = ["S14", "S15", "S16", "S17", "S18", "S19"];
  return order
    .slice(0, order.indexOf(id))
    .reduce((s, x) => s + scene(x).seconds, 0);
};

export const S14: React.FC = () => <TeamStage offset={at("S14")} />;
export const S15: React.FC = () => <TeamStage offset={at("S15")} />;
export const S16: React.FC = () => <TeamStage offset={at("S16")} />;
export const S17: React.FC = () => <TeamStage offset={at("S17")} />;
export const S18: React.FC = () => <TeamStage offset={at("S18")} />;
export const S19: React.FC = () => <TeamStage offset={at("S19")} />;
