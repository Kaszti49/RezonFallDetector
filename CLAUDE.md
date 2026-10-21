# REZON – Harman Hackathon video: production brief for Claude Code

You are producing a **≤2:00 cardboard cut-out animated film** for the HARMAN Hackathon selection round.
- **Deadline: Monday 2026-10-26 23:59.** Internal deadline: final render on **Sunday evening**, upload Monday before 18:00.
- Owner: Kaszti, who approves everything.
- `SCRIPT.md` is the single source of truth for story, voiceover, captions and timing. Read it fully before any work.

## Hard requirements (from the official call; never violate)
- Max **2:00**. Our target is **1:56** and the hard cap is **1:58**.
- **mp4**, **1920×1080**, **16:9**, at least Full HD.
- **No background music.** Voiceover and sound effects only.
- Good sound quality.
- The team must be introduced in the video.
- Upload limit: **600 MB**.

## Stack
- **Remotion** (React + TypeScript). Every motion is code: deterministic, math-driven, and seeded.
- Before installing anything, check that Node LTS is present. In Phase 0, check Remotion's current license terms and confirm they cover a free student video.
- **Remotion agent skill:** if an official Remotion agent skill exists on GitHub (e.g. `remotion-dev/skills`), say so and **ask before installing it**.
- Background removal for head photos: `rembg` (Python), run locally.
- Audio tooling: ffmpeg/ffprobe (Remotion bundles ffmpeg; use a system ffmpeg for analysis and loudness work if available).

## Rules
- **Ask before:** installing global tools, spending money, connecting new services, or deleting files.
- This folder is **not** part of the Rezonating repo. Never touch `C:\Work\Projects\Enterpartner\Rezonating`.
- Code here is throwaway; the rendered film is not.
- **Timing lives in one place:** `src/timeline.ts`, derived from SCRIPT.md. Once real voiceover files exist, scene lengths come from measured audio durations (`getAudioDurationInSeconds`) plus fixed padding. The total must stay ≤ 1:58, so fail the build if it doesn't.
- Captions must match SCRIPT.md **character for character**. Hungarian ő/ű/á/é/í/ó/ö/ú/ü must render; verify this with a test still.
- **Never put AI-generated text inside images.** All text is rendered by code.
- No third-party logos (no Harman/JBL logo).
- Keep a log in `NOTES.md`: decisions, open questions, and Kaszti's approvals.
- When a phase is done: render a preview, show it, and stop for approval.

## Style bible: cardboard / paper cut-out
**Materials**
- Brown corrugated cardboard, kraft paper, off-white printer paper, a few colored paper accents.
- Cut edges show corrugation on thick pieces. Edges are slightly irregular, hand-cut (seeded noise on the outlines).
- Paper fiber texture comes from an SVG `feTurbulence` grain overlay at low opacity.

**Palette (do not add colors)**
| Token | Hex | Use |
|---|---|---|
| kraft | #C8A27A | walls, base |
| cardboard | #A87B4F | floor, furniture |
| ink | #3B2A1E | lines, text |
| paper | #F3EBDD | caption strips, tags |
| rezon-teal | #2F8F8B | the device, normal ripples, "all OK" |
| alarm-red | #D9442B | fall, alarm, camera LED |
| warm-light | #F2C14E | sunlight, amber LED |
| night-blue | #3E5A7A | time-passing light |

**Light and depth**
- One soft key light from the top-left.
- Every layer casts a drop shadow onto the layer behind it: offset (6, 8) px, blur 10, opacity 0.35, ink-colored.
- Depth comes from z-layers with parallax on camera moves.

**Motion**
- **Puppets and cut-outs:** stepped on twos (15 fps poses inside 30 fps) for a stop-motion feel.
- **Camera, ripples, countdown ring and seismograph:** smooth at 30 fps, eased with springs.
- **"Boil":** seeded micro-jitter on cut-out pieces (±0.3 px, ±0.15°, re-seeded every 2 frames). **Never** on text.
- **Transitions:** paper slides, flips and flaps. **No crossfades.**
- **Snappy:** no shot holds longer than its VO plus 0.6 s, except the deliberate silences in S01, S04, S10 and S19.

**Typography**
- Font: **Rubik** via `@remotion/google-fonts`; confirm Latin-Extended coverage for ő and ű.
- Captions: Rubik Medium 44 px, ink color, on a torn white paper strip, centered at the bottom.
  - Max 2 lines, ≤ 38 characters per line.
  - Revealed word by word in sync with the voiceover.
  - Key word highlighted: teal in product scenes, red in problem scenes.
- Titles and stamps ("2031", "REZON"): Rubik Black, built as cardboard letters with thickness and a shadow.
- Safe area: 5% margin on all sides.

**Characters and props (built procedurally in SVG as jointed puppets)**
- **Mari néni:** grey bun, round glasses, lilac cardigan cut from paper, slippers. Pivots at neck, shoulders, elbows, hips and knees. Poses needed: walk cycle (4 poses), hesitate, throw towel, slip, lie down, weak hand lift, sit up, smile.
- **Anna:** in her 40s, brown hair, mustard sweater. Poses needed: at desk, grab keys, kneel, help.
- **Rezon device:** a palm-sized rounded cardboard puck.
  - Teal paper band, "REZON" debossed on top, punched speaker-grille holes, one LED dot (green, amber or red).
  - Exploded-view layers: lid, speaker, ESP32 board (green paper PCB with a few chips), geophone (copper-colored cylinder), battery, base.
- **Bathroom set:** tiles as cut paper squares, mirror, hook with a panic-button pendant, wall camera with a blinking LED, towel, window with a rotating sun/moon disc, wall clock.
- **House cross-section:** 2 rooms. The floor shows layers: tiles, screed, slab.

## Math-driven effects (implement as pure functions of frame)
- **Step ripple, cross-section floor:**
  `y(x,t) = Σ_i A·e^(−α·τ_i)·sin(k·(|x−x_i| − v·τ_i))`, masked to `|x−x_i| < v·τ_i`, where `τ_i = t − t_i`.
  - Steps (teal): A = 6 px, α = 2.5, v = 600 px/s.
  - Fall (red): one event with A = 22 px, α = 1.2, higher k.
- **Ring ripples** (top-view moments): concentric circles with radius `v·τ` and opacity `e^(−α·τ)`.
- **Seismograph tape:** plots the **same event list** at the device's x-position, so picture and signal always agree. Steps show as regular small bursts; the fall shows as one spike followed by a flat line, which is the detection logic being shown on screen.
- **Countdown ring:** a 10 s arc around the device, compressed to fit the scene with the label "10 s".
- **Mouth flap (team):** per member, toggle between a closed-mouth photo and an open-mouth photo based on audio RMS from `visualizeAudio`, with a threshold and 2-frame hysteresis.
- **Device voice (DEV lines):** bandpass 300–4000 Hz plus a short, small-room reverb so it sounds like it comes from the device. Render it as a processed wav with ffmpeg; do not do this live.

## Audio
- **Voiceover:** `audio/vo/*.wav`, named as in the SCRIPT.md recording list.
  - Clean up each file: trim silence, high-pass at 80 Hz, light denoise only if needed, gentle compression.
- **Sound effects: you source all of them online.** Kaszti records nothing except voiceover.
  - Sources: Freesound (filter by CC0), Pixabay Sound Effects, Mixkit, or similar royalty-free libraries.
  - Allowed licenses: CC0, or a license that clearly permits free use in a video without attribution. If attribution is required, add it to the credits and tell Kaszti. Never use paid or "personal use only" sounds.
  - Log every file in `audio/sfx/CREDITS.md`: name, URL, license.
  - Choose for a **cardboard/paper world**: dull thuds, paper rustle, cardboard slide, pop-up flap, snap, tape rewind, phone buzz, slippers on tile, dripping tap, clock tick, keys, door.
  - Pick 2–3 candidates per cue, trim and level them, and present them for Kaszti to choose from in the audio pass.
  - The hook thud (S01) and the fall thud (S04) must be the **same file** (callback). The S10 thud is a heavier variant.
  - Chime: use a downloaded soft two-tone notification, or synthesize two sine tones (E5 then A5, each with exponential decay) if nothing fits.
  - Downloads are free files only; anything that needs payment or an account goes to Kaszti first.
- **Mix:** sound effects sit about −8 dB under voiceover. Final master: −16 LUFS integrated, ≤ −1 dBTP, measured with ffmpeg `loudnorm`. No music anywhere.

## Team section assets (arriving tomorrow)
For each member, Kaszti provides 2 photos: front-facing, even light, plain background, same distance.
- `faces/m{1..4}_closed.jpg`: mouth closed.
- `faces/m{1..4}_open.jpg`: mouth open, as if saying "aa".

Processing:
- Cut out with rembg.
- Cut-out heads get a thin white paper border and a drop shadow.
- Body: a cardboard "funny suit" in a different accent color per member: a paper tie, oversized lapels, a slight puppet wobble.
- Until the photos arrive, use **placeholder heads**: a paper circle with "M1"–"M4".

Names, roles and lines are in SCRIPT.md S15–S18. Placeholders are marked `[ ]`; leave them visible until they're filled.

## Phases (stop for approval after each)
0. **Setup.**
   - Check Node; scaffold Remotion (TypeScript) and add the Rubik font.
   - `git init` locally only; never push.
   - Render a test still containing "Ő ű – Kétezer-harmincegy" to confirm the Hungarian glyphs.
1. **Style test (kill test).** Render 3 stills: Mari in the bathroom, the Rezon device close-up, and the cross-section with a ripple. If the procedural cardboard looks cheap, **say so honestly** and propose image-generated texture or puppet-part PNGs as a fallback. Kaszti decides.
2. **Animatic.**
   - All scenes S01–S19 with blocking and timing from SCRIPT.md.
   - Placeholder audio: silence plus captions.
   - Render at 960×540 for review.
3. **Full animation.** All scenes, at final quality.
4. **Audio pass.** Bring in the real voiceover; re-time from the measured durations; add sound effects and the device-voice processing; master the mix.
5. **Team pass.** Heads, lines and mouth flaps.
6. **Final render and QC** (checklist below), then deliver `out/REZON_Harman_2026.mp4`.

## Final QC checklist (all must pass; report each)
- [ ] Duration ≤ 1:58, verified with ffprobe
- [ ] 1920×1080, 16:9, H.264 (yuv420p, CRF ≤ 18), AAC 48 kHz, .mp4
- [ ] File size < 600 MB
- [ ] No music; only voiceover and sound effects
- [ ] Loudness −16 LUFS ±1, true peak ≤ −1 dBTP, no clipping
- [ ] Every caption matches SCRIPT.md exactly, and ő/ű render correctly
- [ ] No `[ ]` placeholders left
- [ ] All 4 team members visible with name and role
- [ ] The criteria map in SCRIPT.md is covered (every row shows on screen)
- [ ] No text inside AI images and no third-party logos
- [ ] Watched once in full with sound and once muted (captions alone must carry the story)
