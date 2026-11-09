# REZON final pitch: slide motion specs

These are the Cavalry-built MP4 clips for the Canva deck. Each slide advances on a click.
Kaszti uploads them to Canva himself; don't use Cavalry's Canva upload.

## Global (all slides)
- **Output:** MP4, H.264 yuv420p, 1920×1080, **60 fps**, Cavalry "Very High" quality, AA Enhanced (MSAA), no audio.
  - Renders go to `presentation/renders/S##_name_v#.mp4`.
  - Scene files go to `presentation/cavalry/S##_name.cv`.
  - AI images go to `uploads/`; processed assets go to `presentation/assets/`.
- **Continuity:**
  - Each slide is built in a copy of the previous slide's scene, with the comp timeline extended.
  - Render frame 0 of slide N must equal the last frame of slide N−1.
  - Check this with ffmpeg PSNR. About 54 dB means identical apart from compression.
- **Palette** (clean and premium, no neon or glow):

| Token | Hex | Use |
|---|---|---|
| bg-navy | `#09141F` | background (comp background colour) |
| text-white | `#F4F7FA` | all text |
| cyan | `#5BBCD0` | main accent: wavy lines, particles, image rings |
| cyan-pale | `#9FD6E2` | secondary accent (some particles and sparks) |
| image navy | `#0F2133` | background requested in AI image prompts |

- **Font:** **Canva Sans Bold**. It's installed locally and is native in Canva, so text typed in Canva matches the videos.
- **Coordinates:** Cavalry space, centre (0,0), +Y up, comp edges at ±960 / ±540.
- **Visual language:** the cyan wavy line (20 px, round caps, ripple ±15 px) is the brand's signal motif. It snaps, stretches and flows between slides.

### Cavalry gotchas (learned the hard way)
- **Out-frames:** a layer's out-frame is fixed to the comp's end at the moment the layer is created. After extending a comp timeline, run `api.setOutFrame(id, 100000)` on every layer recursively, or old layers vanish past the old end.
- **New layers become selected,** and `api.create("group")` wraps the current selection. Call `api.select([])` before creating any group.
- **Parenting keeps world position.** Parent first, then set the local `position`, `rotation` and `scale`. For editable paths, set position to [0,0] after parenting.
- **Comp snapshots with a `frame` argument can be misleading.** Confirm with a real render and an ffmpeg contact sheet.

---

## S01: REZON title (approved v3, 2026-11-09)
Files: `renders/S01_REZON_v3.mp4` and `cavalry/S01_REZON.cv`. Comp frames 0–299 (300 frames, 5.0 s).

**Title**
- Five separate text layers R E Z O N, in the group "REZON title" (`group#2`). Canva Sans Bold, 150 px, white.
- Baseline y = −12. Optical gap between letter inks is 34 px.

| Letter | Layer position x | Ink L / R |
|---|---|---|
| R | −245.15 | −281.3 / −199.7 |
| E | −132.03 | −164.1 / −91.9 |
| Z | −17.46 | −56.8 / 21.8 |
| O | 106.54 | 56.6 / 156.4 |
| N | 236.54 | 191.7 / 281.3 |

- The ink top is +94.8 and the bottom is −12.3 (O: +96.3 / −13.8). The word spans x −281…+281.

**Pop**
- Each letter starts at 0.3× its final x, scale 0.4, opacity 0.
- Over 28 frames it springs to its final x and scale 1 with `OvershootOut`. Opacity 0→100 over 8 frames with `SlowOut`.
- Stagger from the centre outward: Z at f6, E and O at f8, R and N at f10.

**Squiggle line (hero)**
- `editableShape#2`, resampled every 2.5 px. Stroke 20 px, round caps and joins, cyan. Trim is driven by head/tail JS utilities.
- Ripple: oscillator with `useNormals`, ±15 px, wavelength ≈ 84 px, frequency 1.2.
  - Its `time` is driven by a JS utility: linear to f150, then `SlowOut` to a stop at f235 (value 192.5).
- Path: starts at the top of the Z (10,100), up and left around the top-left, down the left side, across the bottom, up the right side, then left into the underline.
  - A low-frequency meander (±40 px × varying amplitude, wavelength 560) fades out before the underline.
- Head travel f10→f205 with custom bezier (out handle (45,30), in handle (70,100)).
- **Resting underline:** y = −72, x −165…+157 (E left edge to O right edge, including caps). At rest from f205; ripple frozen from f235.

**Particle burst**
- 14 wavy strokes, 5–9 px, cyan with some pale cyan.
- They leave from an ellipse behind the word (rx 90, ry 28 around (0,42)) and fly outward 230–400 px on an oval spread. They start between f9 and f13 and last 40–56 frames.
- Trims use `SlowOut` with a 4-frame lag and fade over the last 14 frames. All are gone by about f70.
- They're drawn behind the title, with a gap around 78° where the hero line leaves.

---

## S02: three reasons the current system fails (approved v3, 2026-11-09)
Files: `renders/S02_problems_v3.mp4` and `cavalry/S02_problems.cv`.
- Comp "S02 problems", frames **299→479** (181 frames, 3.02 s). T0 = 299.
- Render frame 0 = S01 f299 (PSNR 54.2 dB).

**Themes** (psychological; images made by Kaszti with the shared style prompt):
1. Forgetful: the watch is left on the night shelf (`assets/S02_1_forgetful_circle.png`).
2. Privacy: they don't want to be seen; towel (`assets/S02_2_privacy_circle.png`).
3. Accidental failure rate: it's a gamble; dice showing snake eyes (`assets/S02_3_chance_circle.png`).
- The circle cut-outs were made by detecting the AI-drawn circle and trimming 16 px inside it, as transparent PNGs about 890 px across.

**Timeline**

| Frames (T0+) | Event |
|---|---|
| 0–7 | Hold on the S01 end frame |
| 7→8 | S01 underline (`editableShape#2`) opacity 100→0; the two halves appear in its place |
| 8 | **Snap:** 8 tiny sparks burst from the break point (−4, −72): 4–7 px, `SlowOut` trims, gone by about +42 |
| 8→14 | Recoil kick: left half x −80→−106, right half x 72→98; y −72→−64; both rotate 0→+10°; `SlowOut` |
| 10→55 | Title group y 0→345, scale 1→1.15, `SlowInSlowOut` |
| 14→42 | Halves fly to their centres and turn to **79.5°** (both identical), `SlowInSlowOut` |
| 8→40 | Length 151→128 (squash), `SlowInSlowOut` |
| 40→127 | **Rubber stretch** of length: 128 → 760 (+72) → 622 (+90) → 684 (+104) → 656 (+116) → 663 (+127). First segment `SlowOut`, the rest `SlowInSlowOut` |
| 8→127 | Stroke width with the stretch: 20 → 23 (+40) → 14 (+72) → 21 (+90) → 18.5 (+104) → 20.4 (+116) → 20 (+127) |
| 100 / 108 / 116 | Circles pop left to right: scale 0→1 and rotation −8°→0 with `OvershootOut` over 22 frames; opacity 0→100 over 6 frames, `SlowOut` |
| 138–180 | Everything static (end frame = S03 start) |

**Dividers**
- They're `basicLine#2` (left) and `basicLine#3` (right). Their rigs are **identical**, verified the same size every frame.
  - `basicLine`, 600 divisions, stroke 20 px cyan, round caps and joins.
  - Oscillator deformer: `useNormals`, ±15 px, frequency 0 (static ripple).
  - Length JS driver: `javaScript#7` (left) and `#9` (right) → `generator.length`.
  - Wave count JS: `n0/(84+14*clamp((n0-151)/512,0,1))`, so the wavelength eases 84→98 as the line grows. It gains waves instead of straightening.

**End-frame layout (f479 = S03 start)**

| Element | Values |
|---|---|
| Title | group pos (0, 345), scale 1.15. Word ink x −323…+323, baseline y ≈ 331, cap top ≈ 454 |
| Left divider | centre (−303, −274), rot 79.5°, length 663 (≈ 6.8 waves, λ 98). Top end ≈ (−243, 52) + 10 px cap; bottom off-screen ≈ (−363, −600) |
| Right divider | centre (352, −274), same rig. Top ≈ (412, 52); bottom ≈ (292, −600) |
| Circle 1 (forgetful) | centre (−640, −150), r 210, 5 px cyan ring, image shader Fit Cover |
| Circle 2 (privacy) | centre (33, −150), r 210 |
| Circle 3 (chance) | centre (672, −150), r 210 |

- The circle tops (y ≈ 60) are level with the divider tops.

---

## S03: collide → crack → tear the screen open (v1, 2026-11-09; awaiting review)
Files: `renders/S03_crack_v1.mp4` and `cavalry/S03_crack.cv`.
- **Render the master comp** "S03 crack" (`compNode#2`): frames 479→639 (161 frames, 2.68 s), render item `renderQueueItem#2`.
- Seam with S02 f180: PSNR 46.6 dB, visually identical. The precomp re-render adds a slight edge difference.
- The 3D device model comes later, at the competition. The current device is a **placeholder**.

**Structure**
- **Content comp** "S03 screen content" (`compNode#1`): the old S01/S02 comp, extended to 639. It contains the line animation and the crack.
  - A navy "screen surface" rectangle (1940×1100) sits at the back, so the halves are opaque.
  - The lines, smear copies, sparks and crack are drawn **in front of** the circles.
- **Master comp** "S03 crack" (`compNode#2`), background `#050B12` (backstage):
  - group "SCREEN (shake)" (`group#7`) → "screen L" / "screen R" groups;
  - each holds a `compositionReference` of the content comp, masked by a polygon on its side of the crack, with a drop shadow (blur 22, offset ±16/−6, black α170).
  - The "DEVICE placeholder" group (`group#6`) sits behind the screen.

**Timeline** (T0 = 479)

| Frames (T0+) | Event |
|---|---|
| 0–8 | Hold on the S02 end frame |
| 8→14 | Wind-up: lines move 34 px outward, `SlowInSlowOut` |
| 14→22 | Rush: both lines to x = 30, `VerySlowIn` (accelerating), with 4 smear copies per line. The copies are baked with `makeEditable(line,true)` (**this hides the original; unhide it**), trail 1–4 frames behind at opacity 55/38/24/12% and stroke 17.5–10 px, and vanish on arrival |
| 22 | **Impact:** right line hidden (the two coincide exactly). 12 sparks shoot sideways along the line. Screen shake ±10 px decaying over 7 frames, plus a zoom punch 1→1.03→1 (`SlowOut`, 10 frames) so the edges never show |
| 22→36 | The merged line vibrates (oscillator frequency 9) while its ripple drops 15→0 (`SlowOut`). It rotates 79.5°→90° and moves x 30→35. Stroke 20→30 (+24)→18 (+28)→9 (+36) |
| 36 | The straight line is swapped for the jagged **crack** (cyan, 9 px, mitre joins). The crack grows from the line's top to the screen top over +36→+44 (`SlowOut`) |
| 44→52 | Strain: halves move ±12 px; 52→55 settle back to ±7 |
| 55→100 | **Tear:** halves pull apart to ±660 px, `VerySlowInVerySlowOut` |
| 56→100 | Device placeholder fades in, scale 0.82→1 (`SlowOut`). Ripple rings from +84, every 22 frames: scale 1→2.1, opacity 55→0 |
| 100–160 | Hold: torn halves at the sides, device in the middle |

**Crack polyline**, top to bottom:
(40,560) (52,470) (38,420) (55,360) (30,300) (48,230) (22,170) (44,110) (18,40) (50,−30) (26,−100) (46,−170) (14,−240) (42,−320) (20,−400) (48,−470) (30,−560).
- It passes between the Z and the O of the title, so the halves read "REZ" | "ON".
