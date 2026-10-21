import { AbsoluteFill } from "remotion";
import { CaptionStrip } from "../components/CaptionStrip";
import { CollageLetters, CollageWords, type TitleStyle } from "../components/Collage";
import { KeyLight } from "../components/material/KeyLight";
import { MaterialDefs } from "../components/material/MaterialDefs";
import { Piece } from "../components/material/Piece";
import { TornPaper } from "../components/material/TornPaper";
import { Seismograph } from "../components/Seismograph";
import { RUBIK, WEIGHT } from "../fonts";
import { floorEnvelope, walkImpacts } from "../fx/ripple";
import { cut, roundRect } from "../lib/shapes";
import { LED, RezonHero, RezonSide } from "../props/Rezon";
import { Mari, MARI_POSES } from "../puppets/Mari";
import { BATH, BathroomSet, WindowLight } from "../sets/Bathroom";
import { FloorRipple, HOUSE, HouseBack, HouseFront } from "../sets/HouseSection";
import { PerspectiveFloor } from "../sets/PerspectiveFloor";
import { DERIVED, PALETTE, SAFE, VIDEO } from "../theme";

// One frame of the film: shared defs, the SVG set, the key light, then HTML overlays (captions).
const Stage: React.FC<{ children: React.ReactNode; overlay?: React.ReactNode; light?: number }> = ({
  children,
  overlay,
  light = 1,
}) => (
  <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
    <MaterialDefs />
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {children}
    </svg>
    <KeyLight strength={light} />
    {overlay}
  </AbsoluteFill>
);

// S02: Mari shuffles into the morning bathroom.
export const StyleBathroom: React.FC = () => (
  <Stage
    overlay={
      <CaptionStrip
        seed="cap-s02"
        tone="problem"
        lines={["Ő Mari néni. Nyolcvanegy éves,", "és egyedül él."]}
        highlight={["egyedül"]}
      />
    }
  >
    <BathroomSet />
    <Mari x={470} y={BATH.floorY} pose={MARI_POSES.shuffle} />
    <WindowLight />
  </Stage>
);

// S08: macro shot of the device on the bathroom floor. Shallow focus: wall and far floor go soft.
const wallTiles = Array.from({ length: 3 }, (_, row) =>
  Array.from({ length: 11 }, (_, col) => cut(roundRect(-60 + col * 190, -150 + row * 190, 180, 180, 5, 8), `ct-${row}-${col}`, { wobble: 1.2 })),
).flat();
const skirting = cut(roundRect(-20, 418, 1960, 36, 2, 8), "ct-skirt", { wobble: 1.2 });

export const StyleDevice: React.FC = () => (
  <Stage overlay={<CaptionStrip seed="cap-s08" tone="product" lines={["Ez a Rezon."]} highlight={["rezon"]} />}>
    <g filter="url(#dof-4)">
      <rect width={1920} height={440} fill={PALETTE.kraft} />
      <g filter="url(#sh-flat)">
        {wallTiles.map((d, i) => (
          <Piece key={i} d={d} fill={PALETTE.paper} shadow={null} />
        ))}
      </g>
    </g>
    <g filter="url(#dof-2)">
      <Piece d={skirting} fill={PALETTE.cardboard} material="card" depth={5} />
    </g>
    <PerspectiveFloor
      rows={[452, 482, 520, 568, 630, 708, 810, 944, 1120]}
      vp={[960, -700]}
      spacing={300}
      tile={[PALETTE.paper, DERIVED.towel]}
      grout={DERIVED.steel}
      seed="close-floor"
      sharpFrom={522}
      sharpTo={808}
    />
    <RezonHero cx={960} cy={560} />
  </Stage>
);

// S09: Mari walks; each step sends a teal wave through the screed to the device and onto the tape.
const SECTION_T = 3.45;
const X_DEVICE = 1360;
const SECTION_STEPS = walkImpacts(-2.8, 130, 0.6, 50, 11).filter((s) => s.x >= 200 && s.t <= SECTION_T);

export const StyleSection: React.FC = () => (
  <Stage
    light={0.85}
    overlay={
      <CaptionStrip seed="cap-s09" tone="product" lines={["Minden lépésnek saját rezgése van –"]} highlight={["rezgése"]} />
    }
  >
    <HouseBack />
    <Mari x={640} y={HOUSE.floorY} scale={0.62} pose={MARI_POSES.walkPass} />
    <RezonSide x={X_DEVICE} y={HOUSE.floorY} led={LED.ok(Math.min(1, floorEnvelope(X_DEVICE, SECTION_T, SECTION_STEPS) / 2))} />
    <HouseFront />
    <FloorRipple t={SECTION_T} impacts={SECTION_STEPS} />
    <Seismograph
      x={230}
      y={786}
      w={1460}
      h={100}
      t={SECTION_T}
      impacts={SECTION_STEPS}
      xDevice={X_DEVICE}
      label="lépés-mintázat"
    />
  </Stage>
);

// Title treatments from Kaszti's reference (letters on cut scraps), three candidates side by side.
const TITLE_ROWS: { style: TitleStyle; label: string }[] = [
  { style: "rubik", label: "A – Rubik Black" },
  { style: "fraunces", label: "B – Fraunces (serif)" },
  { style: "ransom", label: "C – ransom mix" },
];

export const StyleTitles: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PALETTE.kraft }}>
    <MaterialDefs />
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }}>
      <rect width={1920} height={1080} fill="url(#tex-grain)" opacity={0.5} />
      <rect width={1920} height={1080} fill="url(#tex-fiber)" opacity={0.25} />
      <rect width={1920} height={1080} filter="url(#f-mottle)" />
    </svg>
    <KeyLight strength={0.8} />
    <AbsoluteFill
      style={{
        padding: `${SAFE.y + 10}px ${SAFE.x}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {TITLE_ROWS.map(({ style, label }) => (
        <div key={style} style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <TornPaper seed={`label-${style}`} edge="scrap" tear={4} style={{ rotate: "-2deg", width: 300 }} innerStyle={{ padding: "12px 22px" }}>
            <div style={{ fontFamily: RUBIK, fontWeight: WEIGHT.tag, fontSize: 28, color: PALETTE.ink }}>{label}</div>
          </TornPaper>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
              <CollageLetters text="2031" size={100} style={style} seed={`t2031-${style}`} />
              <CollageLetters text="REZON" size={100} style={style} seed={`trezon-${style}`} />
            </div>
            <CollageWords text="A ház, ami meghallja, ha baj van." size={46} style={style} seed={`ttag-${style}`} />
          </div>
        </div>
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);
