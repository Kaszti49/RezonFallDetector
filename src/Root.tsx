import { Composition, Folder, Still } from "remotion";
import { Film } from "./Film";
import { StyleBathroom, StyleDevice, StyleSection, StyleTitles } from "./stills/Phase1";
import { FontTest } from "./tests/FontTest";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="REZON" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
      <Folder name="Tests">
        <Still id="FontTest" component={FontTest} width={1920} height={1080} />
      </Folder>
      <Folder name="Phase1">
        <Still id="StyleBathroom" component={StyleBathroom} width={1920} height={1080} />
        <Still id="StyleDevice" component={StyleDevice} width={1920} height={1080} />
        <Still id="StyleSection" component={StyleSection} width={1920} height={1080} />
        <Still id="StyleTitles" component={StyleTitles} width={1920} height={1080} />
      </Folder>
    </>
  );
};
