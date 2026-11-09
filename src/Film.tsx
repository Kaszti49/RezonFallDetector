import { AbsoluteFill, getInputProps, Sequence } from "remotion";
import { SfxTrack } from "./audio/SfxTrack";
import { VoTrack } from "./audio/VoTrack";
import { CaptionTrack } from "./components/CaptionTrack";
import { Enter } from "./components/Enter";
import { MaterialDefs } from "./components/material/MaterialDefs";
import { S01, S02, S03, S04, S05, S06 } from "./scenes/Problem";
import { S07, S08, S09, S10, S11, S12, S13 } from "./scenes/Product";
import { S14, S15, S16, S17, S18, S19 } from "./scenes/TeamScenes";
import { PALETTE } from "./theme";
import { ENTER_FRAMES, TIMELINE, type SceneId } from "./timeline";

const SCENES: Record<SceneId, React.FC> = { S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19 };

// The whole film. Each scene keeps playing for the next scene's entrance (paper slide/flip/flap),
// so the outgoing picture is still alive underneath. Captions sit on top of everything.
export const Film: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PALETTE.ink }}>
    <MaterialDefs />
    {TIMELINE.map((s, i) => {
      const next = TIMELINE[i + 1];
      const tail = next ? ENTER_FRAMES[next.enter] : 0;
      const Scene = SCENES[s.id];
      return (
        <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.frames + tail}>
          <Enter kind={s.enter}>
            <Scene />
          </Enter>
        </Sequence>
      );
    })}
    <CaptionTrack />
    {audio === "all" || audio === "vo" ? <VoTrack /> : null}
    {audio === "all" || audio === "sfx" ? <SfxTrack /> : null}
  </AbsoluteFill>
);

// Sound stems: --props='{"audio":"vo"}' or '"sfx"' renders one stem for the mix; "none" (or the older
// {"noAudio":true}) is for check renders of scattered frames – Remotion's audio mixing cannot write a
// non-contiguous frame list. The film itself always renders "all".
const props = getInputProps();
const audio: "all" | "vo" | "sfx" | "none" = props.noAudio ? "none" : ((props.audio as "all" | "vo" | "sfx" | "none" | undefined) ?? "all");
