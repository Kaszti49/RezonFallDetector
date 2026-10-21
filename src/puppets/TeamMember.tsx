import { useMemo } from "react";
import { Piece } from "../components/material/Piece";
import { RUBIK, WEIGHT } from "../fonts";
import { boilTransform } from "../lib/anim";
import { shade } from "../lib/color";
import { cut, densify, ellipse, roundRect, type Pt } from "../lib/shapes";
import { ON } from "../props/Props";
import { DERIVED, PALETTE } from "../theme";

export const MEMBER_COLORS = [PALETTE.teal, PALETTE.red, PALETTE.warm, PALETTE.night] as const;

const build = (i: number) => {
  const c = (pts: Pt[], id: string, wobble = 1.2) => cut(densify(pts, 7), `member${i}-${id}`, { wobble, jitter: 0.3, wavelength: 32 });
  return {
    suit: c([[-112, 0], [112, 0], [104, -228], [72, -272], [-72, -272], [-104, -228]], "suit"),
    shirt: c([[-36, -272], [36, -272], [0, -168]], "shirt", 0.6),
    tie: c([[-12, -262], [12, -262], [19, -172], [0, -146], [-19, -172]], "tie", 0.6),
    lapelL: c([[-36, -272], [-86, -262], [-52, -146]], "lapel-l", 0.8),
    lapelR: c([[36, -272], [86, -262], [52, -146]], "lapel-r", 0.8),
    armL: c([[-112, -230], [-90, -236], [-118, -40], [-142, -44]], "arm-l"),
    armR: c([[112, -230], [90, -236], [118, -40], [142, -44]], "arm-r"),
    neck: c([[-22, -262], [22, -262], [22, -300], [-22, -300]], "neck", 0.5),
    head: cut(ellipse(0, -372, 80, 86, 5), `member${i}-head`, { wobble: 1.2, wavelength: 30 }),
    headRim: cut(ellipse(0, -372, 88, 94, 5), `member${i}-rim`, { wobble: 1.4, wavelength: 30 }),
    tag: cut(roundRect(-210, 30, 420, 104, 6, 6), `member${i}-tag`, { wobble: 1 }),
  };
};

// One team member popping up from the book's fold. `pop` 0 → 1 unfolds them; `mouth` > 0.5 = open.
export const TeamMember: React.FC<{ index: number; x: number; y: number; pop: number; mouth: number; frame: number; tag: number }> = ({
  index,
  x,
  y,
  pop,
  mouth,
  frame,
  tag,
}) => {
  const P = useMemo(() => build(index), [index]);
  const color = MEMBER_COLORS[index];
  const tieColor = MEMBER_COLORS[(index + 2) % 4];
  const who = ON.team[index];
  const sway = Math.sin(((frame - (frame % 2)) / 30) * Math.PI * 1.6 + index) * 1.4;
  if (pop <= 0) return null;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`scale(1 ${pop.toFixed(3)}) rotate(${sway.toFixed(2)})`}>
        <g transform={boilTransform(`member${index}`, frame, 0, -200)}>
          <Piece d={P.armL} fill={shade(color, 0.85)} depth={4} />
          <Piece d={P.armR} fill={shade(color, 0.85)} depth={4} />
          <circle cx={-132} cy={-34} r={18} fill={DERIVED.skin} filter="url(#sh-s)" />
          <circle cx={132} cy={-34} r={18} fill={DERIVED.skin} filter="url(#sh-s)" />
          <Piece d={P.suit} fill={color} depth={6}>
            <Piece d={P.shirt} fill={PALETTE.paper} shadow="sh-flat" />
            <Piece d={P.tie} fill={tieColor} shadow="sh-s" />
            <Piece d={P.lapelL} fill={shade(color, 0.78)} shadow="sh-s" />
            <Piece d={P.lapelR} fill={shade(color, 0.78)} shadow="sh-s" />
            {[-110, -60].map((by) => (
              <circle key={by} cx={0} cy={by} r={6} fill={PALETTE.paper} filter="url(#sh-s)" />
            ))}
          </Piece>
          <Piece d={P.neck} fill={shade(DERIVED.skin, 0.93)} shadow={null} />
          {/* Placeholder head until the photos arrive: a paper circle with M1–M4. */}
          <Piece d={P.headRim} fill={PALETTE.paper} depth={3} />
          <Piece d={P.head} fill={shade(PALETTE.kraft, 1.1)} shadow={null}>
            <text x={0} y={-392} textAnchor="middle" dominantBaseline="central" fontFamily={RUBIK} fontWeight={900} fontSize={58} fill={PALETTE.ink}>
              {`M${index + 1}`}
            </text>
            {mouth > 0.5 ? (
              <ellipse cx={0} cy={-330} rx={18} ry={12} fill={PALETTE.ink} />
            ) : (
              <path d="M -18 -332 Q 0 -324 18 -332" stroke={PALETTE.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            )}
          </Piece>
        </g>
      </g>
      {tag > 0 ? (
        <g transform={`translate(0 ${(1 - tag) * 40}) rotate(${-1.5 + index}) scale(${Math.min(1, tag).toFixed(3)})`}>
          <Piece d={P.tag} fill={PALETTE.paper} depth={2}>
            <text x={0} y={66} textAnchor="middle" fontFamily={RUBIK} fontWeight={WEIGHT.tag} fontSize={32} fill={PALETTE.ink}>
              {who.name}
            </text>
            <text x={0} y={108} textAnchor="middle" fontFamily={RUBIK} fontWeight={WEIGHT.caption} fontSize={26} fill={shade(color, 0.8)}>
              {who.role}
            </text>
          </Piece>
        </g>
      ) : null}
    </g>
  );
};
