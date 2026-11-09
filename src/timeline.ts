import data from "./captions.json";
import measured from "./vo-timing.json";

// The only place timing lives. Scene slots come from SCRIPT.md, re-timed to the measured voiceover
// (`npm run vo` → vo-timing.json). A line without a recording yet keeps its syllable estimate
// (Hungarian: one vowel = one syllable).

export const FPS = 30;
export const HARD_CAP_SECONDS = 118; // 1:58

export type SceneId =
  | "S01"
  | "S02"
  | "S03"
  | "S04"
  | "S05"
  | "S06"
  | "S07"
  | "S08"
  | "S09"
  | "S10"
  | "S11"
  | "S12"
  | "S13"
  | "S14"
  | "S15"
  | "S16"
  | "S17"
  | "S18"
  | "S19";

// How a scene arrives over the previous one. No crossfades: paper slides, flips, flaps or a cut.
export type Enter = "cut" | "slide" | "flip" | "flap";
export const ENTER_FRAMES: Record<Enter, number> = {
  cut: 0,
  slide: 16,
  flip: 18,
  flap: 16,
};

export type LineId = (typeof data.captions)[number]["id"];
type Cue = { line: LineId; at: number };
type SceneDef = { id: SceneId; seconds: number; enter: Enter; cues: Cue[] };

// `seconds` is the scene's minimum (its action). A scene grows when its voiceover needs more:
// last cue end + HOLD (the brief: no shot holds longer than its VO plus 0.6 s).
const SCENE_DEFS: SceneDef[] = [
  { id: "S01", seconds: 6, enter: "cut", cues: [{ line: "vo_01", at: 2.0 }] },
  { id: "S02", seconds: 5, enter: "flap", cues: [{ line: "vo_02", at: 0.5 }] },
  { id: "S03", seconds: 7, enter: "cut", cues: [{ line: "vo_03", at: 0.2 }] },
  { id: "S04", seconds: 3, enter: "cut", cues: [] },
  { id: "S05", seconds: 8, enter: "cut", cues: [{ line: "vo_04", at: 0.6 }] },
  { id: "S06", seconds: 4, enter: "cut", cues: [{ line: "vo_05", at: 0.3 }] },
  { id: "S07", seconds: 7, enter: "cut", cues: [{ line: "vo_06", at: 0.3 }] },
  { id: "S08", seconds: 9.8, enter: "cut", cues: [{ line: "vo_07", at: 1.3 }] },
  {
    id: "S09",
    seconds: 11,
    enter: "slide",
    cues: [{ line: "vo_08", at: 0.45 }],
  },
  { id: "S10", seconds: 4, enter: "cut", cues: [] },
  {
    id: "S11",
    seconds: 7,
    enter: "cut",
    cues: [
      { line: "dev_01", at: 1.0 },
      { line: "dev_02", at: 4.0 },
    ],
  },
  {
    id: "S12",
    seconds: 8,
    enter: "slide",
    cues: [{ line: "vo_10", at: 0.45 }],
  },
  { id: "S13", seconds: 10, enter: "flip", cues: [{ line: "vo_11", at: 5.6 }] },
  {
    id: "S14",
    seconds: 3.7,
    enter: "flip",
    cues: [{ line: "vo_12", at: 1.0 }],
  },
  { id: "S15", seconds: 4, enter: "cut", cues: [{ line: "team_1", at: 0.9 }] },
  { id: "S16", seconds: 4, enter: "cut", cues: [{ line: "team_2", at: 0.9 }] },
  { id: "S17", seconds: 4, enter: "cut", cues: [{ line: "team_3", at: 0.9 }] },
  { id: "S18", seconds: 4, enter: "cut", cues: [{ line: "team_4", at: 0.9 }] },
  { id: "S19", seconds: 4, enter: "cut", cues: [] },
];

// ---- VO timing (estimate until measured) ----

const CAPTIONS = new Map(data.captions.map((c) => [c.id as LineId, c]));
export const caption = (id: LineId) => {
  const c = CAPTIONS.get(id);
  if (!c) throw new Error(`No caption for ${id}`);
  return c;
};
export const lineText = (id: LineId) =>
  caption(id)
    .pages.map((p) => p.join(" "))
    .join(" ");

const RATE = 4.6; // syllables per second, calm narration
const syllables = (w: string) => (w.match(/[aáeéiíoóöőuúüű]/gi) ?? []).length;
const pauseAfter = (w: string) =>
  /[.!?]$/.test(w) ? 0.38 : /[,:–]$/.test(w) ? 0.24 : 0;

// duration = audio file length (s); words = word starts (s); rms = loudness per frame (measured only).
export type LineTiming = { duration: number; words: number[]; rms?: number[] };

const estimate = (id: LineId): LineTiming => {
  const words = lineText(id).split(" ");
  const starts: number[] = [];
  let t = 0;
  let end = 0;
  for (const w of words) {
    starts.push(t);
    t += syllables(w) / RATE;
    end = t;
    t += pauseAfter(w);
  }
  return { duration: end, words: starts };
};

// Measured recordings (scripts/process-vo.mjs). Each file starts 0.08 s before its first syllable.
const MEASURED: Partial<Record<LineId, LineTiming>> = measured;
export const hasRecording = (id: LineId) => id in MEASURED;

export const lineTiming = (id: LineId): LineTiming =>
  MEASURED[id] ?? estimate(id);

// ---- Scene table in frames ----

const HOLD = 0.4; // a measured file already ends 0.2 s after its last syllable → 0.6 s in all

export type SceneTiming = SceneDef & { from: number; frames: number };

let cursor = 0;
export const TIMELINE: SceneTiming[] = SCENE_DEFS.map((s) => {
  const voEnd = Math.max(
    0,
    ...s.cues.map((c) => c.at + lineTiming(c.line).duration + HOLD),
  );
  const seconds = Math.ceil(Math.max(s.seconds, voEnd) * FPS) / FPS;
  const t = { ...s, seconds, from: cursor, frames: Math.round(seconds * FPS) };
  cursor += t.frames;
  return t;
});
export const TOTAL_FRAMES = cursor;

export const scene = (id: SceneId) => {
  const s = TIMELINE.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

// Absolute cue table for the caption track (and later the audio track).
export type AbsoluteCue = {
  line: LineId;
  scene: SceneId;
  from: number;
  timing: LineTiming;
};
export const CUES: AbsoluteCue[] = TIMELINE.flatMap((s) =>
  s.cues.map((c) => ({
    line: c.line,
    scene: s.id,
    from: s.from + Math.round(c.at * FPS),
    timing: lineTiming(c.line),
  })),
);

// Seconds from scene start at which word `i` of a cue's line is spoken.
export const wordAt = (sceneId: SceneId, line: LineId, i: number) => {
  const cue = scene(sceneId).cues.find((c) => c.line === line);
  if (!cue) throw new Error(`${line} is not cued in ${sceneId}`);
  return cue.at + lineTiming(line).words[i];
};

// ---- Guards: the build fails rather than ship a broken cut ----

if (TOTAL_FRAMES > HARD_CAP_SECONDS * FPS) {
  throw new Error(
    `Timeline is ${(TOTAL_FRAMES / FPS).toFixed(2)} s, over the ${HARD_CAP_SECONDS} s hard cap.`,
  );
}
for (const [id, m] of Object.entries(MEASURED)) {
  if (m && m.words.length !== lineText(id as LineId).split(" ").length) {
    throw new Error(
      `${id}: vo-timing.json has ${m.words.length} words; the caption has a different count. Re-run npm run vo.`,
    );
  }
}
for (const s of TIMELINE) {
  for (const c of s.cues) {
    const end = c.at + lineTiming(c.line).duration;
    if (end > s.seconds + 0.05) {
      throw new Error(
        `${c.line} ends at ${end.toFixed(2)} s, past the end of ${s.id} (${s.seconds} s).`,
      );
    }
  }
}
