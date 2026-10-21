// Verifies that every caption and on-screen string matches SCRIPT.md character for character.
// Run before every render: `npm run check`. Exits 1 on any mismatch.
import { readFileSync } from "node:fs";

const root = new URL("..", import.meta.url);
const script = readFileSync(new URL("SCRIPT.md", root), "utf8");
// On-screen labels may also be defined by the brief (e.g. the countdown's "10 s").
const brief = readFileSync(new URL("CLAUDE.md", root), "utf8");
const { captions, onscreen } = JSON.parse(readFileSync(new URL("src/captions.json", root), "utf8"));

const MAX_LINE = 38;
const MAX_LINES = 2;
const errors = [];

// Recording list rows: | vo_01.wav | text *(optional note)* |
const recorded = new Map();
for (const m of script.matchAll(/^\| (\w+)\.wav \| (.+?) \|$/gm)) {
  recorded.set(m[1], m[2].replace(/\s*\*\([^)]*\)\*\s*$/, ""));
}

const bare = (w) => w.replace(/^[„"]+/, "").replace(/[.,!?:;"”–]+$/, "").toLowerCase();

for (const c of captions) {
  const expected = recorded.get(c.id);
  if (expected === undefined) {
    errors.push(`${c.id}: not in SCRIPT.md recording list`);
    continue;
  }
  const joined = c.pages.map((p) => p.join(" ")).join(" ");
  if (joined !== expected) errors.push(`${c.id}: caption differs from SCRIPT.md\n    script : ${expected}\n    caption: ${joined}`);
  if (c.display === "strip") {
    for (const page of c.pages) {
      if (page.length > MAX_LINES) errors.push(`${c.id}: page has ${page.length} lines (max ${MAX_LINES})`);
      for (const line of page) {
        if ([...line].length > MAX_LINE) errors.push(`${c.id}: line over ${MAX_LINE} chars: "${line}"`);
      }
    }
  }
  const words = new Set(expected.split(" ").map(bare));
  for (const h of c.highlight) if (!words.has(h)) errors.push(`${c.id}: highlight "${h}" is not a word of the line`);
}
for (const id of recorded.keys()) {
  if (!captions.some((c) => c.id === id)) errors.push(`${id}: in SCRIPT.md but has no caption`);
}

const strings = [];
const collect = (v) => (typeof v === "string" ? strings.push(v) : Object.values(v).forEach(collect));
collect(onscreen);
for (const s of strings) {
  if (!script.includes(s) && !brief.includes(s)) errors.push(`on-screen text not found in SCRIPT.md or CLAUDE.md: "${s}"`);
}

if (errors.length) {
  console.error(`SCRIPT CHECK FAILED (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Script check OK: ${captions.length} captions, ${strings.length} on-screen strings match SCRIPT.md.`);
