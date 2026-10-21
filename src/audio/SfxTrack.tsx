import { Audio } from "@remotion/media";
import { interpolate, Sequence, staticFile } from "remotion";
import { REWIND_END, S01_HIT } from "../scenes/Problem";
import { BEATS, SECTION } from "../scenes/Product";
import { FALL_DELAY, FALL_HIT, STORY_END, STORY_START, STORY_STEPS, THROW } from "../story/bathroomStory";
import { FPS, lineTiming, scene, TOTAL_FRAMES, wordAt, type SceneId } from "../timeline";

// Every sound is placed from the same constants the picture uses (walk plans, fall times,
// beats, VO word times), so a sound can never drift off its frame. No music anywhere.

type Cue = { file: string; frame: number; volume?: number; loop?: boolean; frames?: number; fade?: [number, number] };

const at = (id: SceneId, seconds: number) => scene(id).from + Math.round(seconds * FPS);
const story = (tau: number) => scene("S02").from + Math.round(tau * FPS);
const section = (sigma: number) => scene("S09").from + Math.round(sigma * FPS);

const cues: Cue[] = [];
const add = (file: string, frame: number, volume = 1, extra: Partial<Cue> = {}) => cues.push({ file, frame, volume, ...extra });

// S01 – the hook: one dull cardboard thud in the dark.
add("thud", at("S01", S01_HIT));

// S02–S05 – the bathroom: slippers, drips, the clock, the towel, the slip, the same thud.
add("flap", at("S02", 0), 0.7);
STORY_STEPS.filter((s) => s.t < STORY_START.S04).forEach((s, i) => add(`step_${(i % 4) + 1}`, story(s.t), 0.9));
for (let tau = 0.6; tau < STORY_END; tau += 1.6) add("drip", story(tau), 0.8);
add("clock_tick", story(0), 0.8, { loop: true, frames: Math.round(STORY_START.S05 * FPS) });
add("towel_whoosh", story(THROW.release - 0.05), 0.9);
add("towel_flop", story(THROW.land), 1);
add("slip", story(FALL_HIT - FALL_DELAY + 0.05), 0.9);
add("thud", story(FALL_HIT));
add("clock_fast", at("S05", 0.3), 0.9);
add("crickets", at("S05", 2.5), 1, { fade: [0, 2.5] });

// S06 – rewind, then the click when it stops on the empty morning.
add("rewind", at("S06", 0.15), 0.9);
add("click", at("S06", REWIND_END));

// S07 – 2028: stamp, the camera peels and clatters off, the house slides together.
const w07 = (i: number) => wordAt("S07", "vo_06", i);
add("stamp", at("S07", w07(0)));
add("peel", at("S07", w07(6) - 0.1));
add("camera_fall", at("S07", w07(6) + 1.0), 0.6);
add("paper_slide", at("S07", w07(8) - 0.1), 0.7);
[0.35, 0.8, 1.3].forEach((d) => add("paper_slide_short", at("S07", w07(8) + d), 0.7));

// S08 – the device lands, opens, labels pop on their words, snaps shut.
const w08 = (i: number) => wordAt("S08", "vo_07", i);
add("land", at("S08", BEATS.s08.land));
add("paper_slide_short", at("S08", BEATS.s08.cut - 0.05), 0.5);
add("lid_lift", at("S08", BEATS.s08.lift));
[4, 6, 8, 10, 12].forEach((i) => add("tag_pop", at("S08", w08(i)), 0.8));
add("snap", at("S08", BEATS.s08.snap));

// S09–S10 – steps through the floor, the pen on the tape, the slip, the heavier thud.
add("paper_slide", at("S09", 0), 0.7);
SECTION.steps.forEach((s, i) => add(`step_${(i % 4) + 1}`, section(s.t), 0.6));
add("pen_scratch", at("S09", 0.2), 1, { frames: (scene("S09").frames + scene("S10").frames) - 6 });
add("slip", section(SECTION.slip + 0.05), 0.8);
add("thud_heavy", section(SECTION.hit));
add("tag_pop", at("S10", BEATS.s10.rule), 0.8);

// S11 – the two-tone chime, then the countdown ticking under the device voice.
add("chime", at("S11", BEATS.s11.chime));
for (let i = 0; i < 10; i++) {
  add("count_tick", at("S11", BEATS.s11.countFrom + (i * (BEATS.s11.countTo - BEATS.s11.countFrom)) / 10), 0.8);
}

// S12 – the alert: phone buzz on "riasztja", chair, keys.
add("paper_slide", at("S12", 0), 0.7);
add("phone_buzz", at("S12", wordAt("S12", "vo_10", 6)));
add("creak", at("S12", BEATS.s12.stand), 0.8);
add("keys", at("S12", BEATS.s12.keys), 0.9);

// S13 – Anna is there: door, relief, the tagline built scrap by scrap.
add("page_flip", at("S13", 0), 0.7);
add("door", at("S13", 0.05), 0.6);
add("settle", at("S13", BEATS.s13.smile), 0.8);
const tag = scene("S13").cues[0].at;
lineTiming("vo_11").words.forEach((w) => add("pop", at("S13", tag + w), 0.55));

// S14–S19 – the pop-up book: it opens, each member pops up and slides into the row.
add("page_flip", at("S14", 0), 0.7);
add("book_open", at("S14", 0.1), 0.8);
(["S15", "S16", "S17", "S18"] as const).forEach((id) => {
  add("pop", at(id, 0), 0.9);
  add("paper_slide_short", at(id, 3.25), 0.7);
});
[0.1, 0.22, 0.34, 0.46, 0.58].forEach((d) => add("pop", at("S19", d), 0.6));
add("land", at("S19", 0.45), 0.7);

// Room tone under everything (never digital silence), quieter in the dark hook and the book.
const roomTone = (f: number) =>
  interpolate(f, [0, scene("S02").from, scene("S14").from, TOTAL_FRAMES], [0.55, 1, 1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SfxTrack: React.FC = () => (
  <>
    <Audio src={staticFile("sfx/room_tone.wav")} volume={roomTone} />
    {cues.map((c, i) => (
      <Sequence key={i} from={c.frame} durationInFrames={c.frames} layout="none" name={c.file}>
        <Audio
          src={staticFile(`sfx/${c.file}.wav`)}
          loop={c.loop}
          volume={
            c.fade
              ? (f: number) => interpolate(f / FPS, c.fade as [number, number], [0, c.volume ?? 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : c.volume
          }
        />
      </Sequence>
    ))}
  </>
);
