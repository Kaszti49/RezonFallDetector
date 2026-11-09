// Builds every sound effect the film uses into public/sfx/ (48 kHz, 16-bit stereo WAV).
// Reproducible: `npm run sfx`. Sources (see audio/sfx/CREDITS.md), all CC0:
//   - BigSoundBank (Joseph Sardin): real foley recordings – audio/sfx/sources/bigsoundbank/<id>.mp3
//   - Kenney packs: audio/sfx/sources/kenney-*/
//   - ffmpeg synthesis: the two-tone device chime (as the brief asks) and the low "body" under the thuds.
// Downloaded files are only ever passed to ffmpeg as input paths.
//
// Design rules (2026-10-22 overhaul, after Kaszti found a shrill sound and a repetitive one):
//   1. Every sound has a visible source or a story job. No decorative loops.
//   2. Repeating events (steps, drips) rotate several real takes; nothing loops one sample.
//   3. Nothing shrill: no sine beeps, no high-passed hiss; bright sources are low-passed into the
//      dull, papery range of a cardboard world.
//   4. The voice wins: SfxTrack ducks effects under every line.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const OUT = "public/sfx";
mkdirSync(OUT, { recursive: true });

const k = (pack, name) => `audio/sfx/sources/kenney-${pack}/Audio/${name}.ogg`;
const b = (id) => `audio/sfx/sources/bigsoundbank/${id}.mp3`;
// Commas inside an ffmpeg expression must be escaped, or they split the filter graph.
const ev = (expr, d) => `aevalsrc=exprs=${expr.replace(/,/g, "\\,")}:s=48000:d=${d}`;
// Low sweep that gives a thud its body: f1 → f0 Hz over T seconds, exponential decay.
const sub = (f1, f0, T, decay, amp) => ev(`${amp}*sin(2*PI*(${f1}*t-(${f1 - f0})*t*t/(2*${T})))*exp(-${decay}*t)`, T + 0.3);

const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const measure = (file, filter, re) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", filter, "-f", "null", "-"], { encoding: "utf8" });
  return parseFloat(re.exec(r.stderr.split("Summary").pop())[1]);
};
const peakOf = (file) => measure(file, "volumedetect", /max_volume: (-?[\d.]+) dB/);
const lufsOf = (file) => measure(file, "ebur128", /I:\s+(-?[\d.]+) LUFS/);

// name, [file inputs], [lavfi inputs], graph ending in [out], level: { peak } dBFS or { lufs }.
const S = (name, files, lavfi, graph, level) => ({ name, files, lavfi, graph, level });
const cut = (a, z, fadeOut = 0.12) => `atrim=${a}:${z},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st=${Math.max(0, z - a - fadeOut).toFixed(3)}:d=${fadeOut}`;

// Takes picked by onset analysis (see NOTES.md): onset seconds inside each file.
const SLIPPER_STEPS = [0.88, 2.29, 3.69, 4.44, 5.85, 7.31]; // 0373 "feet (slipper on floor)"
const SINK_DROPS = [0.11, 2.12, 4.11, 6.09]; // 1383 "Drops, metal sink"
const PAPER_MOVES = [[0.4, 1.0], [4.4, 5.05], [7.3, 7.95], [11.9, 12.5]]; // 1251 newspaper handling

const SOUNDS = [
  // ---- The fall. The hook (S01) and the fall (S04) share this file; S10 is the heavier variant. ----
  // A real body fall on a tiled floor, dulled toward cardboard, with a low body under it.
  S("thud", [b("2454")], [sub(85, 40, 0.35, 8, 0.5)],
    `[0]${cut(0.05, 1.4, 0.3)},lowpass=f=3200,bass=g=3:f=100[a];[1]adelay=80:all=1[s];[a][s]amix=inputs=2:normalize=0:duration=longest[out]`, { peak: -3 }),
  S("thud_heavy", [b("2456"), b("2454")], [sub(75, 32, 0.6, 4.5, 0.85)],
    `[0]${cut(0.22, 2.0, 0.5)},lowpass=f=2800[a];[1]${cut(0.03, 1.2, 0.3)},lowpass=f=2400,volume=0.7[c];[2]adelay=100:all=1[s];[a][c][s]amix=inputs=3:normalize=0:duration=longest,aecho=0.6:0.3:30|60:0.18|0.1[out]`, { peak: -1 }),

  // ---- Mari's slippers: six real takes, rotated. In the house cross-section (S09) the same takes
  // are heard "through the floor": low-passed thumps – what Rezon feels. ----
  ...SLIPPER_STEPS.map((t, i) => S(`step_${i + 1}`, [b("0373")], [], `[0]${cut(t - 0.04, t + 0.42, 0.15)},highpass=f=80,lowpass=f=6000[out]`, { peak: -10 })),
  ...SLIPPER_STEPS.map((t, i) => S(`stepf_${i + 1}`, [b("0373")], [], `[0]${cut(t - 0.04, t + 0.42, 0.15)},lowpass=f=700,bass=g=8:f=90[out]`, { peak: -10 })),
  // The slip: a quick wet scuff of the slipper plus the body starting to go.
  S("slip", [b("0373"), b("1799")], [], `[0]${cut(8.03, 8.7, 0.15)},atempo=1.5,lowpass=f=3500[a];[1]${cut(0.08, 0.5, 0.15)},lowpass=f=2500,volume=0.6[w];[a][w]amix=inputs=2:normalize=0:duration=longest[out]`, { peak: -12 }),

  // ---- The tap: real drops into a sink, a little tile reverb. One sound per visible drop. ----
  ...SINK_DROPS.map((t, i) => S(`drip_${i + 1}`, [b("1383")], [], `[0]${cut(t - 0.02, t + 0.6, 0.3)},lowpass=f=4500,aecho=0.5:0.3:22|41:0.25|0.15[out]`, { peak: -18 })),

  // ---- The towel. ----
  S("towel_whoosh", [b("1796"), k("rpg", "cloth1")], [], `[0]${cut(0.1, 0.9, 0.2)},lowpass=f=4000[a];[1]highpass=f=200,lowpass=f=5000,volume=0.5[c];[a][c]amix=inputs=2:normalize=0:duration=longest[out]`, { peak: -12 }),
  S("towel_flop", [k("rpg", "cloth2"), k("impact", "impactSoft_medium_000")], [],
    "[1]volume=0.4,lowpass=f=1800[b];[0]lowpass=f=5000[a];[a][b]amix=inputs=2:normalize=0:duration=longest[out]", { peak: -10 }),

  // ---- Rewind: a real cassette deck. Button down, the motor winding, the stop clunk exactly at 3.0 s. ----
  S("rewind", [b("0567"), b("0567"), b("0567")], [],
    `[0]${cut(3.45, 3.95, 0.15)}[p];[1]${cut(7.95, 10.75, 0.15)},highpass=f=150,lowpass=f=5000,volume=16dB,afade=t=in:d=0.25,adelay=200:all=1[w];[2]${cut(10.75, 11.2, 0.15)},adelay=2830:all=1[s];[p][w][s]amix=inputs=3:normalize=0:duration=longest,lowpass=f=6000[out]`, { peak: -9 }),

  // ---- 2028: the stamp, the camera peeled off like a sticker, its clatter off-screen, the house
  // assembling from paper pieces. ----
  S("stamp", [b("1410")], [sub(110, 50, 0.25, 10, 0.6)], `[0]${cut(0.32, 1.2, 0.3)},lowpass=f=4000[a];[1]adelay=100:all=1[s];[a][s]amix=inputs=2:normalize=0:duration=longest[out]`, { peak: -5 }),
  S("peel", [b("0299")], [], `[0]${cut(0.05, 0.85, 0.1)},lowpass=f=5000,afade=t=in:d=0.3[out]`, { peak: -16 }),
  S("camera_fall", [b("0630")], [], `[0]${cut(0, 1.1, 0.3)},lowpass=f=3000,aecho=0.6:0.4:50:0.2[out]`, { peak: -20 }),
  ...PAPER_MOVES.map(([a, z], i) => S(`paper_${i + 1}`, [b("1251")], [], `[0]${cut(a, z, 0.2)},highpass=f=150,lowpass=f=4500[out]`, { peak: -16 })),
  S("paper_slide", [b("1251")], [], `[0]${cut(45.0, 46.1, 0.35)},highpass=f=150,lowpass=f=4500,afade=t=in:d=0.08[out]`, { peak: -14 }),
  S("whoosh", [b("1800")], [], `[0]${cut(0.1, 0.8, 0.2)},lowpass=f=3500[out]`, { peak: -16 }),

  // ---- The device: slides in and lands, the lid lifts, labels are tacked on, it snaps shut. ----
  S("land", [b("1411")], [], `[0]${cut(0.08, 0.8, 0.25)},lowpass=f=3000,bass=g=4:f=120[out]`, { peak: -9 }),
  S("lid_lift", [k("rpg", "cloth3")], [], "[0]highpass=f=150,lowpass=f=5000[out]", { peak: -16 }),
  S("tag_pop", [b("0164")], [], `[0]${cut(0.08, 0.36, 0.12)},highpass=f=250,lowpass=f=4500[out]`, { peak: -18 }),
  S("snap", [k("impact", "impactWood_light_000"), k("interface", "click_001")], [],
    "[1]volume=0.5,lowpass=f=5000[b];[0][b]amix=inputs=2:normalize=0:duration=longest[out]", { peak: -8 }),

  // ---- The detection: the pen jumps once on the spike (S10). ----
  S("pencil", [b("3233")], [], `[0]${cut(2.14, 2.75, 0.15)},lowpass=f=5000[out]`, { peak: -18 }),

  // ---- The alarm: Rezon's two-tone chime (E5 → A5, exponential decay, as the brief specifies) –
  // soft and round, the house's own voice. Then the phone vibrating on Anna's desk, the chair, the keys.
  S("chime", [], [ev("0.5*(sin(2*PI*659.25*t)+0.1*sin(2*PI*1318.5*t))*exp(-3.6*t)+gte(t,0.3)*0.5*(sin(2*PI*880*(t-0.3))+0.1*sin(2*PI*1760*(t-0.3)))*exp(-3.2*(t-0.3))", 1.9)],
    "[0]lowpass=f=3500,aecho=0.7:0.3:25|50:0.18|0.1,afade=t=in:d=0.006,afade=t=out:st=1.5:d=0.4[out]", { peak: -12 }),
  S("phone_buzz", [b("0023")], [], `[0]${cut(0.25, 1.85, 0.1)},highpass=f=100,lowpass=f=4000[out]`, { peak: -10 }),
  S("signal", [b("1796")], [], `[0]${cut(0.1, 0.95, 0.05)},areverse,lowpass=f=3000,afade=t=in:d=0.3[out]`, { peak: -20 }),
  S("creak", [b("0666")], [], `[0]${cut(5.35, 6.1, 0.2)},lowpass=f=3500[out]`, { peak: -16 }),
  S("keys", [b("0445")], [], `[0]${cut(6.15, 6.9, 0.2)},lowpass=f=4000,lowpass=f=4000[out]`, { peak: -20 }),

  // ---- Help arrives: the flat's door off-screen, cloth as Mari is helped up. ----
  S("door", [b("1702"), b("1704")], [], `[0]${cut(0, 1.0, 0.2)}[o];[1]${cut(2.45, 3.4, 0.3)},adelay=900:all=1[c];[o][c]amix=inputs=2:normalize=0:duration=longest,lowpass=f=2800,aecho=0.6:0.4:35:0.2[out]`, { peak: -16 }),
  S("cloth", [b("0013")], [], `[0]${cut(0.8, 1.3, 0.2)},lowpass=f=3500,lowpass=f=3500[out]`, { peak: -24 }),

  // ---- Paper transitions and the pop-up book. ----
  S("flap", [b("2214")], [], `[0]${cut(0.2, 0.9, 0.25)},lowpass=f=6000[out]`, { peak: -12 }),
  S("page_flip", [b("0164")], [], `[0]${cut(0, 0.55, 0.15)},lowpass=f=6000[out]`, { peak: -12 }),
  S("book_open", [b("0362"), k("rpg", "bookOpen")], [], `[0]${cut(0, 1.7, 0.4)},lowpass=f=5000[a];[1]volume=0.6,lowpass=f=5000[c];[a][c]amix=inputs=2:normalize=0:duration=longest[out]`, { peak: -9 }),
  S("pop", [k("rpg", "bookFlip3")], [], "[0]atrim=0:0.3,highpass=f=250,lowpass=f=3800,lowpass=f=3800,afade=t=out:st=0.22:d=0.08[out]", { peak: -12 }),

  // ---- Rooms: real indoor air, never digital silence. Low-passed hard so no hiss remains. ----
  S("room_bath", [b("2458")], [], "[0]atrim=0:100,asetpts=PTS-STARTPTS,highpass=f=60,lowpass=f=2500[out]", { lufs: -40 }),
  S("room_night", [b("2458")], [], "[0]atrim=0:100,asetpts=PTS-STARTPTS,highpass=f=50,lowpass=f=1000[out]", { lufs: -44 }),
  S("room_city", [b("0080")], [], "[0]atrim=0:30,asetpts=PTS-STARTPTS,highpass=f=50,lowpass=f=1500[out]", { lufs: -40 }),
];

for (const s of SOUNDS) {
  const args = [];
  for (const f of s.files) args.push("-i", f);
  for (const l of s.lavfi) args.push("-f", "lavfi", "-i", l);
  const tmp = `${OUT}/_tmp.wav`;
  run([...args, "-filter_complex", s.graph, "-map", "[out]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_f32le", tmp]);
  const gain = "lufs" in s.level ? s.level.lufs - lufsOf(tmp) : s.level.peak - peakOf(tmp);
  run(["-i", tmp, "-af", `volume=${gain.toFixed(2)}dB`, "-ar", "48000", "-c:a", "pcm_s16le", `${OUT}/${s.name}.wav`]);
  rmSync(tmp);
  console.log(`${s.name}.wav  (${"lufs" in s.level ? `${s.level.lufs} LUFS` : `peak ${s.level.peak} dBFS`})`);
}
