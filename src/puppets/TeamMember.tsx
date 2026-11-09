import { useEffect, useMemo, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { Piece } from "../components/material/Piece";
import faces from "../faces.json";
import { RUBIK, WEIGHT } from "../fonts";
import { boilTransform } from "../lib/anim";
import { shade } from "../lib/color";
import { cut, densify, roundRect, type Pt } from "../lib/shapes";
import { ON } from "../props/Props";
import { DERIVED, PALETTE } from "../theme";

export const MEMBER_COLORS = [
  PALETTE.teal,
  PALETTE.red,
  PALETTE.warm,
  PALETTE.night,
] as const;

// Photo heads (scripts/cut-faces.py): mouth closed / open, aligned on one canvas per member.
// The canvas has 40 px of margin around the head (hair top to chin).
const FACE_PAD = 40;
const FACE_H = 285; // hair to chin, in puppet units: a big cut-out head on a small suit
const CHIN_Y = -282; // the chin overlaps the collar
const faceSrc = (index: number, open: boolean) =>
  staticFile(`faces/m${index + 1}_${open ? "open" : "closed"}.png`);

// SVG <image> is not awaited by Remotion: decode all eight heads before the first team frame.
const keep: HTMLImageElement[] = [];
let decoded: Promise<void> | null = null;
const decodeFaces = () =>
  (decoded ??= Promise.all(
    [0, 1, 2, 3].flatMap((i) =>
      [false, true].map((open) => {
        const img = new Image();
        img.src = faceSrc(i, open);
        keep.push(img);
        return img.decode();
      }),
    ),
  ).then(() => undefined));

export const useFaces = () => {
  const [handle] = useState(() => delayRender("Decoding team faces"));
  useEffect(() => {
    decodeFaces()
      .then(() => continueRender(handle))
      .catch((e) => cancelRender(e));
  }, [handle]);
};

const build = (i: number) => {
  const c = (pts: Pt[], id: string, wobble = 1.2) =>
    cut(densify(pts, 7), `member${i}-${id}`, {
      wobble,
      jitter: 0.3,
      wavelength: 32,
    });
  return {
    suit: c(
      [
        [-112, 0],
        [112, 0],
        [104, -228],
        [72, -272],
        [-72, -272],
        [-104, -228],
      ],
      "suit",
    ),
    shirt: c(
      [
        [-36, -272],
        [36, -272],
        [0, -168],
      ],
      "shirt",
      0.6,
    ),
    tie: c(
      [
        [-12, -262],
        [12, -262],
        [19, -172],
        [0, -146],
        [-19, -172],
      ],
      "tie",
      0.6,
    ),
    lapelL: c(
      [
        [-36, -272],
        [-86, -262],
        [-52, -146],
      ],
      "lapel-l",
      0.8,
    ),
    lapelR: c(
      [
        [36, -272],
        [86, -262],
        [52, -146],
      ],
      "lapel-r",
      0.8,
    ),
    armL: c(
      [
        [-112, -230],
        [-90, -236],
        [-118, -40],
        [-142, -44],
      ],
      "arm-l",
    ),
    armR: c(
      [
        [112, -230],
        [90, -236],
        [118, -40],
        [142, -44],
      ],
      "arm-r",
    ),
    neck: c(
      [
        [-22, -262],
        [22, -262],
        [22, -300],
        [-22, -300],
      ],
      "neck",
      0.5,
    ),
    tag: cut(roundRect(-210, 30, 420, 104, 6, 6), `member${i}-tag`, {
      wobble: 1,
    }),
  };
};

// One team member popping up from the book's fold. `pop` 0 → 1 unfolds them; `mouth` > 0.5 = open.
export const TeamMember: React.FC<{
  index: number;
  x: number;
  y: number;
  pop: number;
  mouth: number;
  frame: number;
  tag: number;
}> = ({ index, x, y, pop, mouth, frame, tag }) => {
  const P = useMemo(() => build(index), [index]);
  const color = MEMBER_COLORS[index];
  const tieColor = MEMBER_COLORS[(index + 2) % 4];
  const who = ON.team[index];
  const sway =
    Math.sin(((frame - (frame % 2)) / 30) * Math.PI * 1.6 + index) * 1.4;
  const face = faces[`m${index + 1}` as keyof typeof faces];
  const k = FACE_H / (face.h - 2 * FACE_PAD);
  if (pop <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`scale(1 ${pop.toFixed(3)}) rotate(${sway.toFixed(2)})`}>
        <g transform={boilTransform(`member${index}`, frame, 0, -200)}>
          <Piece d={P.armL} fill={shade(color, 0.85)} depth={4} />
          <Piece d={P.armR} fill={shade(color, 0.85)} depth={4} />
          <circle
            cx={-132}
            cy={-34}
            r={18}
            fill={DERIVED.skin}
            filter="url(#sh-s)"
          />
          <circle
            cx={132}
            cy={-34}
            r={18}
            fill={DERIVED.skin}
            filter="url(#sh-s)"
          />
          <Piece d={P.suit} fill={color} depth={6}>
            <Piece d={P.shirt} fill={PALETTE.paper} shadow="sh-flat" />
            <Piece d={P.tie} fill={tieColor} shadow="sh-s" />
            <Piece d={P.lapelL} fill={shade(color, 0.78)} shadow="sh-s" />
            <Piece d={P.lapelR} fill={shade(color, 0.78)} shadow="sh-s" />
            {[-110, -60].map((by) => (
              <circle
                key={by}
                cx={0}
                cy={by}
                r={6}
                fill={PALETTE.paper}
                filter="url(#sh-s)"
              />
            ))}
          </Piece>
          <Piece d={P.neck} fill={shade(DERIVED.skin, 0.93)} shadow={null} />
          {/* The photo head on its paper sticker; the mouth flap swaps closed / open. */}
          <g filter="url(#sh)">
            <image
              href={faceSrc(index, mouth > 0.5)}
              x={(-face.w * k) / 2}
              y={CHIN_Y - (face.h - FACE_PAD) * k}
              width={face.w * k}
              height={face.h * k}
            />
          </g>
        </g>
      </g>
      {tag > 0 ? (
        <g
          transform={`translate(0 ${(1 - tag) * 40}) rotate(${-1.5 + index}) scale(${Math.min(1, tag).toFixed(3)})`}
        >
          <Piece d={P.tag} fill={PALETTE.paper} depth={2}>
            <text
              x={0}
              y={66}
              textAnchor="middle"
              fontFamily={RUBIK}
              fontWeight={WEIGHT.tag}
              fontSize={32}
              fill={PALETTE.ink}
            >
              {who.name}
            </text>
            <text
              x={0}
              y={108}
              textAnchor="middle"
              fontFamily={RUBIK}
              fontWeight={WEIGHT.caption}
              fontSize={26}
              fill={shade(color, color === PALETTE.warm ? 0.55 : 0.8)}
            >
              {who.role}
            </text>
          </Piece>
        </g>
      ) : null}
    </g>
  );
};
