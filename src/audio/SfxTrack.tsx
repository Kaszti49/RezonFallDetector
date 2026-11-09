import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { hashSeed, mulberry32 } from "../lib/random";
import { REWIND_END, S01_HIT } from "../scenes/Problem";
import { BEATS, s07Build, SECTION } from "../scenes/Product";
import { DRIP, FALL_DELAY, FALL_HIT, STORY_END, STORY_START, STORY_STEPS, THROW } from "../story/bathroomStory";
import { CUES, FPS, lineTiming, scene, TOTAL_FRAMES, wordAt, type SceneId } from "../timeline";

// Every sound is placed from the same constants the picture uses (walk plans, fall times, beats,
// VO word times), so a sound can never drift off its frame. Each one has a visible source or a
// story job; repeated events rotate real takes. No music anywhere. (Sources: scripts/build-sfx.mjs.)

type Cue = { file: string; frame: number; volume: number; duck: number };

const at = (id: SceneId, seconds: number) => scene(id).from + Math.round(seconds * FPS);
const story = (tau: number) => scene("S02").from + Math.round(tau * FPS);
const section = (sigma: number) => scene("S09").from + Math.round(sigma * FPS);
// Small seeded level differences, so no two steps or drops are identical.
const vary = (seed: string, spread = 0.3) => 1 - spread / 2 + mulberry32(hashSeed(seed))() * spread;

const cues: Cue[] = [];
// duck: how far the sound dips while someone speaks (0 = never, 0.45 ≈ −5 dB).
const add = (file: string, frame: number, volume = 1, duck = 0.45) => cues.push({ file, frame, volume, duck });

// ---- S01 – the hook: one dull fall on a tiled floor in the dark. ----
add("thud", at("S01", S01_HIT), 1, 0);

// ---- S02–S05 – the bathroom. ----
add("flap", at("S02", 0), 0.6);
// Her slippers, heel by heel, as she shuffles in and walks over under the camera.
STORY_STEPS.filter((s) => s.t < STORY_START.S04).forEach((s, i) => add(`step_${(i % 6) + 1}`, story(s.t), 0.55 * vary(`step${i}`)));
// The tap: one sound per visible drop, on the frame it lands. Ducked hard under the voice.
for (let k = 0, tau = DRIP.fall; tau < STORY_END; k++, tau += DRIP.period) add(`drip_${(k % 4) + 1}`, story(tau), 0.5 * vary(`drip${k}`), 0.6);
add("towel_whoosh", story(THROW.release - 0.05), 0.7);
add("towel_flop", story(THROW.land), 0.8);
// S04: the slip, then the same thud as the hook. The camera's inset feed pops up: nothing to see.
add("slip", story(FALL_HIT - FALL_DELAY + 0.05), 0.8, 0);
add("thud", story(FALL_HIT), 1, 0);
add("tag_pop", at("S04", 1.25), 0.5, 0);

// ---- S06 – rewind: button, motor, and the stop clunk on the frame the picture stops (3.0 s into the file). ----
add("rewind", at("S06", REWIND_END - 3.0), 0.8, 0.35);

// ---- S07 – 2028: the stamp, the camera peeled off like a sticker and clattering off-screen,
// the house assembling from paper pieces. ----
const w07 = (i: number) => wordAt("S07", "vo_06", i);
add("stamp", at("S07", w07(0) - 0.02), 0.75, 0);
add("peel", at("S07", w07(6) - 0.1), 0.6);
add("camera_fall", at("S07", w07(6) + 1.0), 0.5);
const build07 = s07Build();
[0, 0.3, 0.6, 0.9].forEach((f, i) => add(`paper_${i + 1}`, at("S07", build07.start + f * (build07.end - build07.start)), 0.55));

// ---- S08 – the device slides in and lands, opens, each label is tacked on its word, it snaps shut. ----
const w08 = (i: number) => wordAt("S08", "vo_07", i);
add("whoosh", at("S08", 0.2), 0.5);
add("land", at("S08", BEATS.s08.land), 0.8);
add("lid_lift", at("S08", BEATS.s08.lift), 0.5);
[4, 6, 8, 10, 12].forEach((i) => add("tag_pop", at("S08", w08(i)), 0.45 * vary(`tag${i}`)));
add("snap", at("S08", BEATS.s08.snap), 0.8);

// ---- S09–S10 – what the floor hears: every step as a low thump through the slab; then the slip,
// the heavier thud, and the pen jumping once on the spike. ----
add("paper_slide", at("S09", 0), 0.5);
SECTION.steps.forEach((s, i) => add(`stepf_${(i % 6) + 1}`, section(s.t), 0.7 * vary(`stepf${i}`), 0.3));
add("slip", section(SECTION.slip + 0.05), 0.8, 0);
add("thud_heavy", section(SECTION.hit), 1, 0);
add("pencil", section(SECTION.hit + 0.03), 0.6, 0);
add("tag_pop", at("S10", BEATS.s10.rule), 0.5, 0);

// ---- S11 – Rezon's chime; the countdown runs silently; her hand lifts twice and drops. ----
add("chime", at("S11", BEATS.s11.chime), 0.8, 0.3);
[1.35, 2.65].forEach((t) => add("cloth", at("S11", t), 0.5));

// ---- S12 – the alert travels to the phone (rising swell), the phone vibrates on "riasztja",
// her chair creaks, she grabs the keys. ----
const tLit = wordAt("S12", "vo_10", 6);
add("paper_slide", at("S12", 0), 0.5);
add("signal", at("S12", tLit - 0.85), 0.5);
add("phone_buzz", at("S12", tLit), 0.75, 0.25);
add("creak", at("S12", BEATS.s12.stand), 0.6);
add("keys", at("S12", BEATS.s12.keys), 0.5);

// ---- S13 – she is there: the flat's door, cloth as Mari sits up, the tagline built scrap by scrap. ----
add("page_flip", at("S13", 0), 0.6);
add("door", at("S13", -0.3), 0.45);
add("cloth", at("S13", 1.0), 0.6);
const tag = scene("S13").cues[0].at;
lineTiming("vo_11").words.forEach((w, i) => add(i === 0 ? "pop" : "tag_pop", at("S13", tag + w), (i === 0 ? 0.5 : 0.3) * vary(`tl${i}`)));

// ---- S14–S19 – the pop-up book: it opens, each member pops up and slides into the row. ----
add("page_flip", at("S14", 0), 0.6);
add("book_open", at("S14", 0.1), 0.7);
(["S15", "S16", "S17", "S18"] as const).forEach((id) => {
  add("pop", at(id, 0), 0.7);
  add("whoosh", at(id, 3.25), 0.35);
});
[0.1, 0.22, 0.34, 0.46, 0.58].forEach((d, i) => add("pop", at("S19", d), 0.45 * vary(`fin${i}`), 0));
add("land", at("S19", 0.45), 0.6, 0);

// ---- Rooms: real indoor air under everything, per location. Short fades at the cuts; during the
// S05 time-lapse the morning room slowly gives way to the night. ----
type Bed = { file: string; from: number; to: number; volume: number; fadeIn: number; fadeOut: number };
const S = (id: SceneId) => scene(id).from;
const nightFrom = story(STORY_START.S05 + 0.4);
const nightTo = story(STORY_END - 0.6);
const BEDS: Bed[] = [
  { file: "room_night", from: 0, to: S("S02"), volume: 0.5, fadeIn: 6, fadeOut: 6 },
  { file: "room_bath", from: S("S02"), to: nightTo, volume: 0.6, fadeIn: 6, fadeOut: nightTo - nightFrom },
  { file: "room_night", from: nightFrom, to: S("S06"), volume: 0.7, fadeIn: nightTo - nightFrom, fadeOut: 6 },
  { file: "room_bath", from: S("S06"), to: S("S12"), volume: 0.5, fadeIn: 6, fadeOut: 6 },
  { file: "room_city", from: S("S12"), to: S("S13"), volume: 0.6, fadeIn: 6, fadeOut: 6 },
  { file: "room_bath", from: S("S13"), to: TOTAL_FRAMES, volume: 0.4, fadeIn: 6, fadeOut: 6 },
];

// Voice activity (frames) from the cue table: effects dip 3 frames before a line, recover over 8 after.
const SPEECH = CUES.map((c) => [c.from, c.from + Math.round(c.timing.duration * FPS)] as const);
const speaking = (f: number) =>
  Math.max(0, ...SPEECH.map(([a, z]) => interpolate(f, [a - 3, a, z, z + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

// Overall effects level against the voice (the brief: about 8 dB under the VO).
const SFX_GAIN = 1;

export const SfxTrack: React.FC = () => (
  <>
    {BEDS.map((bed, i) => {
      const len = bed.to - bed.from;
      return (
        <Sequence key={`bed${i}`} from={bed.from} durationInFrames={len} layout="none" name={bed.file}>
          <Audio
            src={staticFile(`sfx/${bed.file}.wav`)}
            loop
            volume={(f: number) =>
              SFX_GAIN *
              bed.volume *
              (1 - 0.3 * speaking(bed.from + f)) *
              interpolate(f, [0, bed.fadeIn, len - bed.fadeOut, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            }
          />
        </Sequence>
      );
    })}
    {cues.map((c, i) => (
      <Sequence key={i} from={c.frame} layout="none" name={c.file}>
        <Audio src={staticFile(`sfx/${c.file}.wav`)} volume={(f: number) => SFX_GAIN * c.volume * (1 - c.duck * speaking(c.frame + f))} />
      </Sequence>
    ))}
  </>
);
