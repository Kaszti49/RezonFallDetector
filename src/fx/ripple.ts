// Floor vibration as a pure function of (x, t) over one shared list of impacts.
// The floor line, the device LED and the seismograph tape all read this, so picture and signal agree.

export type Impact = { t: number; x: number; kind: "step" | "fall" };

// λ is chosen so the wave moves well under half a wavelength per 30 fps frame (no wagon-wheel strobing).
export const WAVE = {
  step: { A: 7, alpha: 7, beta: 0.0007, v: 600, lambda: 96 },
  fall: { A: 22, alpha: 1.2, beta: 0.0004, v: 600, lambda: 64 },
} as const;

// y(x,t) = Σ A·e^(−β·d)·e^(−α·(τ − d/v))·sin(k·(d − v·τ)),  d = |x − xᵢ|, τ = t − tᵢ, only where d < v·τ.
// With β = α/v this is exactly the brief's y = Σ A·e^(−α·τ)·sin(k·(d − v·τ)). Splitting the decay into
// distance attenuation (β) and ring-down after arrival (α) keeps a step visible all the way to the device
// while each step still reads as a short, separate burst.
export const floorWave = (x: number, t: number, impacts: readonly Impact[]) => {
  let y = 0;
  for (const im of impacts) {
    const tau = t - im.t;
    if (tau <= 0) continue;
    const w = WAVE[im.kind];
    const d = Math.abs(x - im.x);
    if (d >= w.v * tau) continue;
    const k = (2 * Math.PI) / w.lambda;
    y += w.A * Math.exp(-w.beta * d) * Math.exp(-w.alpha * (tau - d / w.v)) * Math.sin(k * (d - w.v * tau));
  }
  return y;
};

// Same sum without the oscillation: how strongly the floor at x is ringing right now.
export const floorEnvelope = (x: number, t: number, impacts: readonly Impact[]) => {
  let e = 0;
  for (const im of impacts) {
    const tau = t - im.t;
    if (tau <= 0) continue;
    const w = WAVE[im.kind];
    const d = Math.abs(x - im.x);
    if (d >= w.v * tau) continue;
    e += w.A * Math.exp(-w.beta * d) * Math.exp(-w.alpha * (tau - d / w.v));
  }
  return e;
};

// A steady walk: one impact per step, advancing `stride` px per step.
export const walkImpacts = (t0: number, x0: number, period: number, stride: number, count: number): Impact[] =>
  Array.from({ length: count }, (_, i) => ({ t: t0 + i * period, x: x0 + i * stride, kind: "step" as const }));
