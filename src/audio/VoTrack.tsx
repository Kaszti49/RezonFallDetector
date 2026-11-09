import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { CUES, FPS, hasRecording } from "../timeline";

// The voiceover: every recorded line (public/vo, cleaned by scripts/process-vo.mjs) on its cue.
// Lines without a recording yet stay silent; their captions still run on the estimated timing.
export const VoTrack: React.FC = () => (
  <>
    {CUES.filter((c) => hasRecording(c.line)).map((c) => (
      <Sequence key={c.line} from={c.from} durationInFrames={Math.ceil(c.timing.duration * FPS) + 2} layout="none" name={c.line}>
        <Audio src={staticFile(`vo/${c.line}.wav`)} />
      </Sequence>
    ))}
  </>
);
