import { createContext, useContext } from "react";
import { VIDEO } from "../theme";

export type CameraState = {
  cx: number;
  cy: number;
  zoom: number;
  sx?: number;
  sy?: number;
};

export const WIDE: CameraState = {
  cx: VIDEO.width / 2,
  cy: VIDEO.height / 2,
  zoom: 1,
};

const CameraContext = createContext<CameraState>(WIDE);

// Linear blend of two framings (callers ease `p`). Zoom blends in log space so pushes feel even.
export const blendCamera = (
  a: CameraState,
  b: CameraState,
  p: number,
): CameraState => ({
  cx: a.cx + (b.cx - a.cx) * p,
  cy: a.cy + (b.cy - a.cy) * p,
  zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * p),
});

// Keep the framed rectangle inside the set (no bare edges): clamps the center for the given zoom.
export const clampCamera = (
  c: CameraState,
  bounds = { x0: 0, y0: 0, x1: VIDEO.width, y1: VIDEO.height },
): CameraState => {
  const hw = VIDEO.width / 2 / c.zoom;
  const hh = VIDEO.height / 2 / c.zoom;
  return {
    ...c,
    cx: Math.min(Math.max(c.cx, bounds.x0 + hw), bounds.x1 - hw),
    cy: Math.min(Math.max(c.cy, bounds.y0 + hh), bounds.y1 - hh),
  };
};

// Where a world point lands on screen under a camera (for screen-space overlays such as bubbles).
export const toScreen = (c: CameraState, x: number, y: number) => ({
  x: VIDEO.width / 2 + (c.sx ?? 0) + (x - c.cx) * c.zoom,
  y: VIDEO.height / 2 + (c.sy ?? 0) + (y - c.cy) * c.zoom,
});

const transformFor = (c: CameraState, depth: number) => {
  const zoom = 1 + (c.zoom - 1) * depth;
  const cx = VIDEO.width / 2 + (c.cx - VIDEO.width / 2) * depth;
  const cy = VIDEO.height / 2 + (c.cy - VIDEO.height / 2) * depth;
  const sx = (c.sx ?? 0) * depth;
  const sy = (c.sy ?? 0) * depth;
  return `translate(${(VIDEO.width / 2 + sx).toFixed(2)} ${(VIDEO.height / 2 + sy).toFixed(2)}) scale(${zoom.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})`;
};

// Smooth virtual camera over an SVG world: (cx, cy) lands at frame center, scaled by zoom.
export const Camera: React.FC<{
  state: CameraState;
  children: React.ReactNode;
}> = ({ state, children }) => (
  <CameraContext.Provider value={state}>
    <g transform={transformFor(state, 1)}>{children}</g>
  </CameraContext.Provider>
);

// A layer further back than the action (depth < 1) moves and scales less: parallax.
// It undoes the parent camera, then applies a damped copy of it.
export const Parallax: React.FC<{
  depth: number;
  children: React.ReactNode;
}> = ({ depth, children }) => {
  const c = useContext(CameraContext);
  const z = c.zoom;
  const inverse = `translate(${c.cx} ${c.cy}) scale(${(1 / z).toFixed(5)}) translate(${-VIDEO.width / 2 - (c.sx ?? 0)} ${-VIDEO.height / 2 - (c.sy ?? 0)})`;
  return (
    <g transform={inverse}>
      <g transform={transformFor(c, depth)}>{children}</g>
    </g>
  );
};
