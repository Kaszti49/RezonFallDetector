import { useCurrentFrame } from "remotion";
import { snap } from "../lib/anim";
import { caption, CUES, FPS, scene } from "../timeline";
import { CaptionStrip } from "./CaptionStrip";

const LINGER = 0.7; // seconds a page stays after its last word

// Global caption layer: word-by-word reveal in sync with each VO cue, one page at a time.
// Bubble (device voice) and collage (tagline) lines are drawn by their scenes instead.
export const CaptionTrack: React.FC = () => {
  const frame = useCurrentFrame();

  for (const cue of CUES) {
    const c = caption(cue.line);
    if (c.display !== "strip") continue;
    const t = (frame - cue.from) / FPS;
    const { words, duration } = cue.timing;
    // A caption never straddles a cut: it clears at the end of its own scene.
    const sceneEnd = scene(cue.scene).from + scene(cue.scene).frames;
    if (t < 0 || t > duration + LINGER || frame >= sceneEnd) continue;

    let first = 0;
    for (let p = 0; p < c.pages.length; p++) {
      const count = c.pages[p].reduce((n, l) => n + l.split(" ").length, 0);
      const last = first + count - 1;
      const nextStart = p + 1 < c.pages.length ? words[last + 1] : duration + LINGER;
      if (t >= words[first] && t < nextStart) {
        const revealed = words.filter((w, i) => i >= first && i <= last && w <= t).length;
        const pop = snap(Math.min(1, ((t - words[first]) * FPS) / 4));
        return (
          <div style={{ position: "absolute", inset: 0, scale: `${0.94 + 0.06 * pop}`, transformOrigin: "50% 95%" }}>
            <CaptionStrip
              seed={`${cue.line}-p${p}`}
              lines={c.pages[p]}
              highlight={c.highlight}
              tone={c.tone as "problem" | "product"}
              revealed={revealed}
            />
          </div>
        );
      }
      first = last + 1;
    }
  }
  return null;
};
