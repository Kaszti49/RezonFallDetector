import { AbsoluteFill } from "remotion";
import { CardboardText } from "../components/CardboardText";
import { GrainOverlay } from "../components/Grain";
import { PaperStrip } from "../components/PaperStrip";
import { RUBIK, WEIGHT } from "../fonts";
import { PALETTE, SAFE, VIDEO } from "../theme";

// Fallback is deliberately a typewriter face: any glyph Rubik lacks would visibly stand out.
const STACK = `${RUBIK}, "Courier New", monospace`;
const TEST = "Ő ű – Kétezer-harmincegy";

const line = (size: number, weight: number): React.CSSProperties => ({
  fontFamily: STACK,
  fontWeight: weight,
  fontSize: size,
  lineHeight: 1.25,
  color: PALETTE.ink,
  whiteSpace: "pre",
});

export const FontTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
      <GrainOverlay
        id="bg"
        width={VIDEO.width}
        height={VIDEO.height}
        seed={11}
        opacity={0.3}
      />

      <div style={{ position: "absolute", left: SAFE.x, top: SAFE.y }}>
        <PaperStrip width={1060} height={62} seed={4} tear={3}>
          <span style={{ ...line(24, WEIGHT.tag), letterSpacing: 1 }}>
            FONT TEST · Rubik 500 / 700 / 900 · latin + latin-ext · fallback:
            Courier New
          </span>
        </PaperStrip>
      </div>

      <div
        style={{
          position: "absolute",
          top: 190,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CardboardText text={TEST} size={116} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 380,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={line(64, WEIGHT.caption)}>Árvíztűrő tükörfúrógép</div>
        <div style={line(64, WEIGHT.title)}>ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP</div>
        <div style={line(52, WEIGHT.caption)}>
          „Mi történik, ha senki sem hallja?”
        </div>
        <div style={{ ...line(120, WEIGHT.caption), letterSpacing: 24 }}>
          ő ö ű ü Ő Ö Ű Ü
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: SAFE.y,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PaperStrip width={720} height={96} seed={21}>
          <span style={line(44, WEIGHT.caption)}>
            Ő ű –{" "}
            <span style={{ color: PALETTE.teal }}>Kétezer-harmincegy</span>
          </span>
        </PaperStrip>
      </div>
    </AbsoluteFill>
  );
};
