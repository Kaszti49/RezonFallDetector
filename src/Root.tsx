import { Folder, Still } from "remotion";
import { FontTest } from "./tests/FontTest";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Tests">
        <Still id="FontTest" component={FontTest} width={1920} height={1080} />
      </Folder>
    </>
  );
};
