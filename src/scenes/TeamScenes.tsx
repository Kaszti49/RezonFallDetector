import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CollageLetters } from "../components/Collage";
import { KeyLight } from "../components/material/KeyLight";
import { keys, onTwos, ramp } from "../lib/anim";
import { Book, ON, Pedestal } from "../props/Props";
import { LED, RezonHero } from "../props/Rezon";
import { TeamMember } from "../puppets/TeamMember";
import { PALETTE, VIDEO } from "../theme";
import { FPS, lineText, lineTiming, scene, type SceneId } from "../timeline";

// S14–S19 are one continuous pop-up book on a team clock (0 = start of S14).
const S14_LEN = scene("S14").seconds;
const MEMBER_SCENES: SceneId[] = ["S15", "S16", "S17", "S18"];
const LINES = ["team_1", "team_2", "team_3", "team_4"] as const;
const memberStart = (i: number) => MEMBER_SCENES.slice(0, i).reduce((s, id) => s + scene(id).seconds, S14_LEN);
const FINALE = memberStart(4);

const CENTER = 960;
const BASE_Y = 760;
// Final lineup reads left to right in speaking order, with the device on its pedestal in the middle.
const SLOTS = [300, 640, 1280, 1620];

// Mouth flap until real audio exists: open on the first 60 % of each estimated syllable.
const mouthOpen = (line: (typeof LINES)[number], t: number) => {
  const { words, duration } = lineTiming(line);
  if (t < 0 || t > duration) return 0;
  const text = lineText(line).split(" ");
  for (let i = words.length - 1; i >= 0; i--) {
    if (t >= words[i]) {
      const syl = Math.max(1, (text[i].match(/[aáeéiíoóöőuúüű]/gi) ?? []).length);
      const k = (t - words[i]) * 4.6;
      return k < syl && k % 1 < 0.6 ? 1 : 0;
    }
  }
  return 0;
};

const pop = (p: number) => keys(p, [[0, 0], [0.7, 1.12], [1, 1]]);

const TeamStage: React.FC<{ offset: number }> = ({ offset }) => {
  const frame = useCurrentFrame();
  const tt = offset + frame / FPS;
  const tw = offset + onTwos(frame) / FPS;
  const finale = tt - FINALE;
  const brand = pop(ramp(finale, 0.1, 0.6, 0, 1, (v) => v));
  const device = pop(ramp(finale, 0.4, 0.9, 0, 1, (v) => v));
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
      <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} style={{ position: "absolute", inset: 0 }}>
        <rect width={1920} height={1080} fill="url(#tex-grain)" opacity={0.5} />
        <rect width={1920} height={1080} fill="url(#tex-fiber)" opacity={0.25} />
        <rect width={1920} height={1080} filter="url(#f-mottle)" />
        <Book open={ramp(tt, 0.05, 0.9)} />
        {finale > 0 ? (
          <g transform={`translate(${CENTER} ${BASE_Y}) scale(1 ${device.toFixed(3)}) translate(${-CENTER} ${-BASE_Y})`}>
            <Pedestal x={CENTER} y={BASE_Y} w={300} h={110} />
            <RezonHero cx={CENTER} cy={BASE_Y - 126 - 48 - 65} rx={130} k={0.5} h={48} seed="finale" led={LED.ok(1)} />
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
            <g key={line} transform={`translate(${x} ${BASE_Y}) scale(${s}) translate(${-x} ${-BASE_Y})`}>
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
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70, transformOrigin: "50% 30%", scale: `${brand}` }}>
          <CollageLetters text={ON.brand} size={150} style="ransom" seed="finale-brand" />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const at = (id: SceneId) => {
  const order: SceneId[] = ["S14", "S15", "S16", "S17", "S18", "S19"];
  return order.slice(0, order.indexOf(id)).reduce((s, x) => s + scene(x).seconds, 0);
};

export const S14: React.FC = () => <TeamStage offset={at("S14")} />;
export const S15: React.FC = () => <TeamStage offset={at("S15")} />;
export const S16: React.FC = () => <TeamStage offset={at("S16")} />;
export const S17: React.FC = () => <TeamStage offset={at("S17")} />;
export const S18: React.FC = () => <TeamStage offset={at("S18")} />;
export const S19: React.FC = () => <TeamStage offset={at("S19")} />;
