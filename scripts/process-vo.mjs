// Cleans every voiceover recording and measures it. Reproducible: `npm run vo`.
// In:  audio/vo/raw/<id>.(wav|mp3|m4a)   (originals, never modified)
// Out: public/vo/<id>.wav                 (48 kHz mono, trimmed, leveled; DEV lines through the "device speaker")
//      src/vo-timing.json                 ({ id: { duration, words[], rms[] } }, seconds; rms per 30 fps frame)
// Word starts use the approved method (a): detected speech segments + syllable-weighted distribution,
// with phrase breaks preferred at punctuation.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const RAW = "audio/vo/raw";
const OUT = "public/vo";
const FPS = 30;
const RATE = 48000;
mkdirSync(OUT, { recursive: true });

const { captions } = JSON.parse(readFileSync("src/captions.json", "utf8"));
const lineText = (c) => c.pages.map((p) => p.join(" ")).join(" ");

const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stderr;
};
const loudness = (file) => parseFloat(/I:\s+(-?[\d.]+) LUFS/.exec(ff(["-i", file, "-af", "ebur128", "-f", "null", "-"]).split("Summary")[1])[1]);
const samples = (file) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(RATE), "-"], { maxBuffer: 1 << 28 });
  const b = r.stdout;
  return new Float32Array(b.buffer, b.byteOffset, b.length / 4);
};

// Speech segments from a 10 ms RMS envelope: above `gate` dBFS, gaps shorter than `minGap` bridged,
// blips shorter than `minSeg` dropped (lip smacks, clicks).
const speech = (x, gate = -36, minGap = 0.12, minSeg = 0.12) => {
  const hop = RATE / 100;
  const on = [];
  for (let i = 0; i + hop <= x.length; i += hop) {
    let s = 0;
    for (let j = i; j < i + hop; j++) s += x[j] * x[j];
    on.push(10 * Math.log10(s / hop + 1e-12) > gate);
  }
  let segs = [];
  for (let i = 0; i < on.length; i++) {
    if (!on[i]) continue;
    let j = i;
    while (j + 1 < on.length && on[j + 1]) j++;
    segs.push([i / 100, (j + 1) / 100]);
    i = j;
  }
  const merged = [];
  for (const s of segs) {
    const last = merged[merged.length - 1];
    if (last && s[0] - last[1] < minGap) last[1] = s[1];
    else merged.push([...s]);
  }
  segs = merged.filter(([a, b]) => b - a >= minSeg);
  return segs;
};

const syl = (w) => (w.match(/[aáeéiíoóöőuúüű]/gi) ?? []).length;
// A phrase may end after punctuation; a lone "–" closes the phrase before it.
const isBreak = (words, i) => /[.,!?:;–]$/.test(words[i]);

// Assign consecutive word groups to consecutive speech segments (dynamic programming), then spread
// each group's word starts over its segment by syllable count.
const wordStarts = (words, segs) => {
  const S = words.map(syl);
  const voiced = words.filter((_, i) => S[i] > 0).length;
  segs = segs.map((s) => [...s]);
  while (segs.length > voiced) {
    // More segments than spoken words: close the shortest gap.
    let g = 0;
    for (let i = 1; i < segs.length - 1; i++) if (segs[i + 1][0] - segs[i][1] < segs[g + 1][0] - segs[g][1]) g = i;
    segs.splice(g, 2, [segs[g][0], segs[g + 1][1]]);
  }
  const n = words.length;
  const k = segs.length;
  const total = S.reduce((a, b) => a + b, 0);
  const voicedTime = segs.reduce((a, [s, e]) => a + e - s, 0);
  const R = total / voicedTime;
  const sylSum = (a, b) => S.slice(a, b + 1).reduce((x, y) => x + y, 0);
  const f = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity));
  const from = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(-1));
  f[0][0] = 0;
  for (let j = 1; j <= k; j++) {
    const dur = segs[j - 1][1] - segs[j - 1][0];
    for (let i = 1; i <= n; i++) {
      for (let a = 0; a < i; a++) {
        if (f[j - 1][a] === Infinity) continue;
        const s = sylSum(a, i - 1);
        if (s === 0) continue;
        const cost = (s / R - dur) ** 2 / Math.max(dur, 0.3) + (a > 0 && !isBreak(words, a - 1) ? 0.25 : 0);
        if (f[j - 1][a] + cost < f[j][i]) {
          f[j][i] = f[j - 1][a] + cost;
          from[j][i] = a;
        }
      }
    }
  }
  const groups = [];
  for (let j = k, i = n; j > 0; j--) {
    const a = from[j][i];
    groups.unshift([a, i - 1]);
    i = a;
  }
  const starts = new Array(n).fill(0);
  groups.forEach(([a, b], j) => {
    const [s0, s1] = segs[j];
    const g = sylSum(a, b);
    let acc = 0;
    for (let i = a; i <= b; i++) {
      // A lone dash (no syllables) lands where the word before it ends.
      starts[i] = s0 + (acc / g) * (s1 - s0);
      acc += S[i];
    }
  });
  return starts.map((t) => Math.round(t * 1000) / 1000);
};

const DEVICE = "highpass=f=300:poles=2,highpass=f=300:poles=2,lowpass=f=4000:poles=2,lowpass=f=4000:poles=2,equalizer=f=1800:t=q:w=1.2:g=4,apad=pad_dur=0.4,aecho=0.8:0.55:17|29|43:0.3|0.2|0.12";
const PRE = 0.08; // kept before the first syllable
const timing = {};

for (const c of captions) {
  const src = ["wav", "mp3", "m4a"].map((e) => `${RAW}/${c.id}.${e}`).find(existsSync);
  if (!src) {
    console.log(`${c.id}: no recording yet (timeline keeps the estimate)`);
    continue;
  }
  const dev = c.id.startsWith("dev_");
  const t1 = `${OUT}/_a.wav`;
  const t2 = `${OUT}/_b.wav`;
  // 1. mono 48 kHz, rumble off.
  ff(["-i", src, "-af", `aresample=${RATE},highpass=f=80`, "-ac", "1", "-c:a", "pcm_f32le", t1]);
  // 2. level, gentle 3:1 compression, level again, safety limiter.
  const g1 = -21 - loudness(t1);
  ff(["-i", t1, "-af", `volume=${g1.toFixed(2)}dB,acompressor=threshold=-24dB:ratio=3:attack=5:release=90:knee=4`, "-c:a", "pcm_f32le", t2]);
  const g2 = -19 - loudness(t2);
  ff(["-i", t2, "-af", `volume=${g2.toFixed(2)}dB,alimiter=limit=0.708:level=disabled:attack=2:release=40`, "-c:a", "pcm_f32le", t1]);
  // 3. trim to the speech (measured on the dry voice), short fades.
  const x = samples(t1);
  const dry = speech(x);
  const start = Math.max(0, dry[0][0] - PRE);
  const end = Math.min(x.length / RATE, dry[dry.length - 1][1] + 0.2);
  const len = end - start;
  const trim = `atrim=${start.toFixed(3)}:${end.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=${(len - 0.08).toFixed(3)}:d=0.08`;
  const final = `${OUT}/${c.id}.wav`;
  const pcm = ["-ac", "1", "-ar", String(RATE), "-c:a", "pcm_s16le"];
  if (dev) {
    // DEV lines: through the device's small speaker into a small room, then leveled again.
    ff(["-i", t1, "-af", `${trim},${DEVICE}`, "-c:a", "pcm_f32le", t2]);
    const g3 = -20 - loudness(t2);
    ff(["-i", t2, "-af", `volume=${g3.toFixed(2)}dB,alimiter=limit=0.708:level=disabled:attack=2:release=40,afade=t=out:st=${(len + 0.2).toFixed(3)}:d=0.2`, ...pcm, final]);
  } else {
    ff(["-i", t1, "-af", trim, ...pcm, final]);
  }
  rmSync(t1);
  rmSync(t2, { force: true });
  // 4. word starts from the dry speech segments, shifted to the trimmed file.
  const y = samples(final);
  const words = lineText(c).split(" ");
  const segs = dry.map(([a, b]) => [a - start, b - start]);
  const ws = wordStarts(words, segs);
  if (process.env.VO_DEBUG) console.log(`  segs ${segs.map(([a, b]) => `${a.toFixed(2)}-${b.toFixed(2)}`).join(" ")}`);
  const hop = RATE / FPS;
  const rms = [];
  for (let i = 0; i < y.length; i += hop) {
    let s = 0;
    const m = Math.min(y.length, i + hop);
    for (let j = i; j < m; j++) s += y[j] * y[j];
    rms.push(Math.round(Math.sqrt(s / (m - i)) * 1000) / 1000);
  }
  timing[c.id] = { duration: Math.round((y.length / RATE) * 1000) / 1000, words: ws, rms };
  console.log(`${c.id}: ${timing[c.id].duration.toFixed(2)} s  ${words.map((w, i) => `${w}@${ws[i].toFixed(2)}`).join(" ")}`);
}

writeFileSync("src/vo-timing.json", JSON.stringify(timing));
console.log(`Wrote src/vo-timing.json (${Object.keys(timing).length} lines).`);
