// The audio master: renders the voice and effects stems from the composition, mixes them, brings
// the mix to −16 LUFS integrated with a true-peak ceiling of −1.6 dBFS (4× oversampled limiter, so
// the AAC encode stays under −1 dBTP), and lays it under a picture render.
//   npm run master -- <picture.mp4> <out.mp4>        (picture may be muted; its audio is replaced)
//   npm run master -- --reuse <picture.mp4> <out.mp4>  (keep the stems from the last run)
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
const reuse = args[0] === "--reuse";
const [picture, out] = reuse ? args.slice(1) : args;
if (!picture || !out) throw new Error("usage: npm run master -- [--reuse] <picture.mp4> <out.mp4>");

const DIR = "out/audio";
const TARGET = -16;
mkdirSync(DIR, { recursive: true });
const sh = (cmd, a) => execFileSync(cmd, a, { stdio: "inherit", shell: cmd === "npx" });
const ff = (a) => sh("ffmpeg", ["-v", "error", "-y", ...a]);
const loud = (file) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const s = r.stderr.split("Summary").pop();
  return { I: parseFloat(/I:\s+(-?[\d.]+)/.exec(s)[1]), peak: parseFloat(/Peak:\s+(-?[\d.]+)/.exec(s)[1]) };
};

for (const stem of ["vo", "sfx"]) {
  if (reuse && existsSync(`${DIR}/${stem}.wav`)) continue;
  console.log(`Rendering the ${stem} stem…`);
  writeFileSync(`${DIR}/props-${stem}.json`, JSON.stringify({ audio: stem }));
  sh("npx", ["remotion", "render", "REZON", `${DIR}/${stem}.wav`, "--codec=wav", `--props=${DIR}/props-${stem}.json`, "--log=error"]);
}

ff(["-i", `${DIR}/vo.wav`, "-i", `${DIR}/sfx.wav`, "-filter_complex", "[0][1]amix=inputs=2:normalize=0:duration=longest", "-c:a", "pcm_f32le", `${DIR}/mix.wav`]);
const gain = TARGET - loud(`${DIR}/mix.wav`).I;
ff(["-i", `${DIR}/mix.wav`, "-af", `volume=${gain.toFixed(2)}dB,aresample=192000,alimiter=limit=0.83:level=disabled:attack=1:release=60,aresample=48000`, "-c:a", "pcm_s24le", `${DIR}/master.wav`]);
ff(["-i", picture, "-i", `${DIR}/master.wav`, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out]);

const m = loud(out);
console.log(`Master: gain ${gain.toFixed(2)} dB → ${out}: ${m.I} LUFS integrated, true peak ${m.peak} dBFS`);
