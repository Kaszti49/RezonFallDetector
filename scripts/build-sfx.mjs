// Builds every sound effect the film uses into public/sfx/ (48 kHz, 16-bit stereo WAV), plus
// audition candidates into audio/sfx/audition/. Reproducible: `npm run sfx`.
// Sources: Kenney CC0 packs (audio/sfx/sources, see audio/sfx/CREDITS.md) and sounds synthesized
// here with ffmpeg. Downloaded files are only ever passed to ffmpeg as input paths.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const OUT = "public/sfx";
const AUD = "audio/sfx/audition";
mkdirSync(OUT, { recursive: true });
mkdirSync(AUD, { recursive: true });

const k = (pack, name) => `audio/sfx/sources/kenney-${pack}/Audio/${name}.ogg`;
// Commas inside an ffmpeg expression must be escaped, or they split the filter graph.
const ev = (expr, d) => `aevalsrc=exprs=${expr.replace(/,/g, "\\,")}:s=48000:d=${d}`;
// Low sweep that gives a thud its body: f1 → f0 Hz over T seconds, exponential decay.
const sub = (f1, f0, T, decay, amp) => ev(`${amp}*sin(2*PI*(${f1}*t-(${f1 - f0})*t*t/(2*${T})))*exp(-${decay}*t)`, T + 0.3);
const noise = (color, d, seed) => `anoisesrc=color=${color}:amplitude=0.6:d=${d}:seed=${seed}:r=48000`;

const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const peakOf = (file) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" });
  return parseFloat(/max_volume: (-?[\d.]+) dB/.exec(r.stderr)[1]);
};

// name, where, [file inputs], [lavfi inputs], graph ending in [out], target peak dBFS.
const S = (name, dir, files, lavfi, graph, peak) => ({ name, dir, files, lavfi, graph, peak });

const THUD_BODY = "[0]lowpass=f=2600,bass=g=4:f=90[a];[1]volume=1[b];[a][b]amix=inputs=2:normalize=0:duration=longest[out]";

const SOUNDS = [
  // The hook and the fall share one file (callback). S10 is the heavier variant.
  S("thud", OUT, [k("impact", "impactSoft_heavy_000")], [sub(95, 42, 0.4, 7, 0.8)], THUD_BODY, -2),
  S("thud_heavy", OUT, [k("impact", "impactSoft_heavy_000")], [sub(85, 34, 0.7, 4, 1.0)],
    "[0]lowpass=f=2400,bass=g=5:f=80[a];[1]volume=1[b];[a][b]amix=inputs=2:normalize=0:duration=longest,aecho=0.7:0.35:28|55:0.25|0.15[out]", -1),
  S("thud_B", AUD, [k("impact", "impactPunch_heavy_000")], [sub(95, 42, 0.4, 7, 0.6)], THUD_BODY, -2),
  S("thud_C", AUD, [k("impact", "impactWood_heavy_000")], [sub(95, 42, 0.4, 7, 0.9)], THUD_BODY.replace("2600", "2000"), -2),

  // Slippers on tile: soft carpet scuff with a little hard tile underneath.
  ...[0, 1, 2, 3].map((i) =>
    S(`step_${i + 1}`, OUT, [k("impact", `footstep_carpet_00${i}`), k("impact", `footstep_concrete_00${i}`)], [],
      "[0]lowpass=f=3200[a];[1]volume=0.3,lowpass=f=4000[b];[a][b]amix=inputs=2:normalize=0:duration=longest[out]", -10),
  ),
  S("step_B", AUD, [k("rpg", "footstep00")], [], "[0]lowpass=f=2500[out]", -10),
  S("slip", OUT, [], [ev("0.4*sin(2*PI*(900*t+1200*t*t))*exp(-6*t)", 0.28)], "[0]bandpass=f=1500:w=1400,afade=t=out:st=0.18:d=0.1[out]", -14),

  // Bathroom life: drips, the clock, room tone.
  S("drip", OUT, [], [ev("0.7*sin(2*PI*(600*t+1500*t*t/0.08))*exp(-55*t)", 0.35)], "[0]highpass=f=300,aecho=0.6:0.4:35|70:0.35|0.2[out]", -16),
  S("room_tone", OUT, [], [noise("pink", 125, 7)], "[0]highpass=f=70,lowpass=f=900[out]", -36),
  S("clock_tick", OUT, [], [ev("0.6*sin(2*PI*if(lt(mod(t,2),1),3100,2500)*t)*exp(-500*mod(t,1))", 12)], "[0]highpass=f=1500[out]", -26),
  S("clock_fast", OUT, [], [ev("0.6*sin(2*PI*if(lt(mod(t,0.24),0.12),3100,2500)*t)*exp(-500*mod(t,0.12))", 8.5)], "[0]highpass=f=1500[out]", -20),
  S("crickets", OUT, [], [ev("0.3*sin(2*PI*4300*t)*(0.5+0.5*sin(2*PI*30*t))*gt(sin(2*PI*1.7*t),0.35)+0.2*sin(2*PI*4700*t)*(0.5+0.5*sin(2*PI*26*t))*gt(sin(2*PI*1.3*t+1),0.5)", 9)], "[0]lowpass=f=6000[out]", -32),

  // Towel, rewind.
  S("towel_whoosh", OUT, [k("rpg", "cloth1")], [], "[0]highpass=f=200[out]", -10),
  S("towel_flop", OUT, [k("rpg", "cloth2"), k("impact", "impactSoft_medium_000")], [],
    "[1]volume=0.4,lowpass=f=1800[b];[0][b]amix=inputs=2:normalize=0:duration=longest[out]", -9),
  S("rewind", OUT, [], [ev("0.35*sin(2*PI*(700*t+260*t*t+12*(1-cos(2*PI*9*t))))", 2.9), noise("white", 2.9, 3)],
    "[1]bandpass=f=3500:w=3000,tremolo=f=18:d=0.6,volume=0.5[n];[0][n]amix=inputs=2:normalize=0,afade=t=in:d=0.1,afade=t=out:st=2.6:d=0.3[out]", -10),
  S("click", OUT, [k("rpg", "metalLatch")], [], "[0]highpass=f=200[out]", -8),

  // 2028: stamp, the camera peels off and clatters away, the house assembles from paper.
  S("stamp", OUT, [k("impact", "impactPunch_medium_000"), k("rpg", "cloth2")], [],
    "[0]lowpass=f=3500[a];[1]volume=0.6[b];[a][b]amix=inputs=2:normalize=0:duration=longest[out]", -5),
  S("peel", OUT, [], [noise("white", 0.75, 5)], "[0]highpass=f=1500,tremolo=f=40:d=0.9,afade=t=in:d=0.55,afade=t=out:st=0.7:d=0.05[out]", -12),
  S("camera_fall", OUT, [k("impact", "impactPlate_light_000")], [], "[0]lowpass=f=2500,aecho=0.6:0.3:40:0.2[out]", -16),
  S("paper_slide", OUT, [], [noise("pink", 0.7, 3)], "[0]bandpass=f=2200:w=2600,afade=t=in:d=0.2,afade=t=out:st=0.3:d=0.4[out]", -12),
  S("paper_slide_short", OUT, [], [noise("pink", 0.4, 9)], "[0]bandpass=f=2600:w=2600,afade=t=in:d=0.1,afade=t=out:st=0.15:d=0.25[out]", -14),

  // The device: lands, opens, labels pop, snaps shut.
  S("land", OUT, [k("rpg", "bookPlace1")], [], "[0]lowpass=f=3000[out]", -8),
  S("lid_lift", OUT, [k("rpg", "cloth3")], [], "[0]highpass=f=150[out]", -14),
  S("tag_pop", OUT, [k("interface", "click_003"), k("rpg", "cloth4")], [],
    "[0]lowpass=f=2500[a];[a][1]amix=inputs=2:normalize=0:duration=longest[out]", -14),
  S("snap", OUT, [k("impact", "impactWood_light_000"), k("interface", "click_001")], [],
    "[1]volume=0.5[b];[0][b]amix=inputs=2:normalize=0:duration=longest[out]", -6),

  // The floor listening, the alarm.
  S("pen_scratch", OUT, [], [noise("white", 16, 11)], "[0]bandpass=f=4500:w=3000,tremolo=f=7:d=0.5[out]", -30),
  S("chime", OUT, [], [ev("0.5*(sin(2*PI*659.25*t)+0.25*sin(2*PI*1318.5*t))*exp(-3.2*t)+gte(t,0.32)*0.5*(sin(2*PI*880*(t-0.32))+0.25*sin(2*PI*1760*(t-0.32)))*exp(-3*(t-0.32))", 1.9)],
    "[0]aecho=0.7:0.3:25|50:0.2|0.12,afade=t=out:st=1.5:d=0.4[out]", -8),
  S("chime_B", AUD, [k("interface", "confirmation_002")], [], "[0]anull[out]", -8),
  S("chime_C", AUD, [k("interface", "confirmation_004")], [], "[0]anull[out]", -8),
  S("count_tick", OUT, [k("interface", "tick_002")], [], "[0]lowpass=f=3500[out]", -20),
  S("phone_buzz", OUT, [], [ev("(0.6*sin(2*PI*170*t)+0.15*sin(2*PI*340*t+3*sin(2*PI*37*t)))*lt(mod(t,0.6),0.42)", 1.3)], "[0]lowpass=f=3000[out]", -8),
  S("phone_buzz_B", AUD, [], [ev("(0.6*sin(2*PI*210*t)+0.2*sin(2*PI*420*t+2*sin(2*PI*29*t)))*lt(mod(t,0.5),0.3)", 1.3)], "[0]lowpass=f=3000[out]", -8),
  S("keys", OUT, [k("rpg", "handleCoins")], [], "[0]anull[out]", -10),
  S("creak", OUT, [k("rpg", "creak1")], [], "[0]lowpass=f=3000[out]", -16),
  S("door", OUT, [k("rpg", "doorOpen_1"), k("rpg", "doorClose_1")], [],
    "[1]adelay=1000|1000[b];[0][b]amix=inputs=2:normalize=0:duration=longest,lowpass=f=2000[out]", -16),
  S("settle", OUT, [k("rpg", "bookPlace3")], [], "[0]lowpass=f=2000[out]", -14),

  // Paper transitions and the pop-up book.
  S("flap", OUT, [k("rpg", "bookFlip2")], [], "[0]anull[out]", -8),
  S("page_flip", OUT, [k("rpg", "bookFlip1")], [], "[0]anull[out]", -8),
  S("book_open", OUT, [k("rpg", "bookOpen"), k("rpg", "bookFlip2")], [],
    "[1]adelay=50|50[b];[0][b]amix=inputs=2:normalize=0:duration=longest[out]", -7),
  S("pop", OUT, [k("rpg", "bookFlip3")], [], "[0]atrim=0:0.3,highpass=f=250,afade=t=out:st=0.22:d=0.08[out]", -10),
];

for (const s of SOUNDS) {
  const args = [];
  for (const f of s.files) args.push("-i", f);
  for (const l of s.lavfi) args.push("-f", "lavfi", "-i", l);
  const tmp = `${s.dir}/_tmp.wav`;
  run([...args, "-filter_complex", s.graph, "-map", "[out]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", tmp]);
  const gain = s.peak - peakOf(tmp);
  run(["-i", tmp, "-af", `volume=${gain.toFixed(2)}dB`, "-ar", "48000", "-c:a", "pcm_s16le", `${s.dir}/${s.name}.wav`]);
  rmSync(tmp);
  console.log(`${s.dir}/${s.name}.wav  (peak ${s.peak} dBFS)`);
}
