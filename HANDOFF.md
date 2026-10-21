# HANDOFF – resume here (written 2026-10-21, late evening)

Read this first, then `NOTES.md` (decision log), `SCRIPT.md` (source of truth), `CLAUDE.md` (brief).
Deadline **Mon 2026-10-26 23:59** (upload before 18:00). Final render target **Sun 2026-10-25 evening**.

## 1. Where we are

| Phase | Status |
|---|---|
| 0 Setup | ✅ approved |
| 1 Style test | ✅ approved (procedural look, title style C ransom, plum-mauve cardigan) |
| 2 Animatic | ✅ approved |
| 3 Full animation + SFX | ✅ "looks good overall" (2026-10-21) – **Kaszti wants to tweak some captions and some sound effects** (ask exactly which) |
| 4 Audio pass (VO) | ⏳ waiting for recordings – Kaszti brings them on 2026-10-22 |
| 5 Team pass (faces) | ⏳ waiting for photos – Kaszti brings them on 2026-10-22 |
| 6 Final render + QC | – |

Latest film: `out/phase3/REZON_phase3_1080p.mp4` (1920×1080, 116.0 s, 3480 frames, SFX + ambience, no VO, 240 MB).
Git: local only, last commit `491b5a6`. Never push.

## 2. Decisions that are locked (don't reopen)

- **16:9 landscape** (official call: "16:9 képaránnyal"). Kaszti asked about 9:16 once; after seeing the rule he chose 16:9.
- **Year 2028** (not 2031). VO-06 = „Kétezer-huszonnyolc. Mi lenne, ha nem egy kamera figyelne, hanem maga a ház?"
- Team: Kaszti Benedek – design és projektvezetés · Szabó Viktor – jelfeldolgozás és MI · Veres Bence – beágyazott szoftver · Bors Máté – elektronika és prototípus. Lines in SCRIPT.md S15–S18 (≤ 7 words).
- Titles: ransom-mix collage letters on cut scraps. Captions: torn paper strip on kraft backing, Rubik 500 44 px, word-by-word.
- No music. SFX from Kenney CC0 + ffmpeg synthesis (`audio/sfx/CREDITS.md`). Freesound/Mixkit not used.
- Team lineup reads M1→M4 left to right (each slides to its own slot); device voice captioned in its sound-wave bubble; tagline captioned by the collage title.

## 3. What I need from Kaszti tomorrow

1. **Team lines:** Kaszti may pick an alternative set (B/C/D at the end of SCRIPT.md, A = current). If so, update SCRIPT.md S15–S18 + recording list + `src/captions.json` (team_1–4 pages/highlights), then `npm run check`.
2. **VO recordings** → `audio/vo/raw/` (keep originals untouched). Expected files (names from SCRIPT.md recording list):
   `vo_01 … vo_08, dev_01, dev_02, vo_10, vo_11, vo_12, team_1 … team_4` (17 lines) + **10 s room tone**. Ask which take to use if several are delivered (or pick by noise floor / clipping and tell him).
   team_2/3/4 must be Viktor / Bence / Máté's own voices.
3. **Face photos** → `faces/m{1..4}_closed.jpg`, `faces/m{1..4}_open.jpg` (front, even light, plain background, same distance).
4. **Caption tweaks** – which ones and how (he said "the caption" needs tweaking: wording? size? position? timing? ask).
5. **SFX tweaks** – which sounds; also his picks from `audio/sfx/audition/` (thud A/B/C, step A/B, chime A/B/C, phone_buzz A/B; A = current).

## 4. Next steps, in order

### Phase 3 tweaks (first, small)
- Apply Kaszti's caption + SFX notes. Captions live in `src/captions.json` (pages/highlights) + `src/components/CaptionStrip.tsx` (look) + `src/components/CaptionTrack.tsx` (timing). Run `npm run check` after any caption text change (verifies against SCRIPT.md char-for-char).
- SFX: recipes in `scripts/build-sfx.mjs` → `npm run sfx`; placement in `src/audio/SfxTrack.tsx` (all times come from story constants / `BEATS` in `src/scenes/Product.tsx` / VO word times).

### Phase 4 – audio pass
1. Write `scripts/process-vo.mjs` (ffmpeg, reproducible): to 48 kHz mono → highpass 80 Hz → denoise only if noise floor is high (afftdn, profile from room tone) → trim leading/trailing silence (silenceremove both ends via areverse, keep ~50 ms) → gentle compression (≈3:1, −20 dB) → per-line loudness ≈ −19 LUFS → `public/vo/<id>.wav`.
   DEV lines extra: bandpass 300–4000 Hz + short small-room reverb (aecho) – "comes from the device".
2. Measure: duration (ffprobe) + word starts by **method (a)** (approved): silencedetect speech segments + syllable-weighted distribution (Hungarian: vowels = syllables), punctuation pauses snapped to detected gaps → write `src/vo-timing.json` and load it into `MEASURED` in `src/timeline.ts`. If sync looks off, Kaszti allowed **method (b)** whisper.cpp (needs install + ~1.5 GB model → ask first).
3. Re-time scenes from measured VO: scene seconds = max(action minimum, cue.at + duration + ~0.6 s pad); deliberate silences stay (S01, S04, S10, S19). Guard in `timeline.ts` must keep total ≤ 118 s (target 116). Picture beats follow automatically (they use `wordAt`).
4. Add `src/audio/VoTrack.tsx` (<Audio> per cue from `CUES`), SFX bus down ~6–8 dB + duck SFX while VO is active.
5. Master: render, then ffmpeg loudnorm two-pass to **−16 LUFS integrated, true peak ≤ −1 dBTP (aim −1.5 before AAC)**; measure the **final mp4** with ebur128.

### Phase 5 – team pass
- Background removal with `rembg` (Python) – **not installed; ask before installing** (prefer a project-local venv). Output `public/faces/m{n}_{closed,open}.png`.
- Replace placeholder heads in `src/puppets/TeamMember.tsx`: white paper border + drop shadow; mouth flap = swap closed/open photo by VO RMS (`@remotion/media-utils` `useAudioData` + `visualizeAudio`), threshold + 2-frame hysteresis. Preload images (delayRender) – SVG `<image>` is not awaited by Remotion.

### Phase 6 – final render + QC
- Render: `npx remotion render REZON out/REZON_Harman_2026.mp4 --crf=18 --pixel-format=yuv420p` (Phase 3 render came out **yuvj420p** – must be yuv420p).
- Before final: switch Rubik + title fonts to **local copies** (SIL OFL) so a Google Fonts fetch can't break the render.
- Run every item of the CLAUDE.md QC checklist and report each (duration via ffprobe, size, loudness, no `[ ]`, captions match, criteria map, watched with sound + muted).

## 5. Gotchas (save time)

- **GateGuard hook:** the first Write/Edit of any file is rejected once. Create new files as a tiny placeholder first, retry, then write the full content. Destructive Bash (`rm`) also needs facts – render into fresh folders instead.
- **Prettier reformats files after writes** → Read before Edit (exact strings change).
- **Remotion audio bug:** sparse frame lists (`--frames=a,b,c` image sequences) crash in audio mixing → add `--props='{"noAudio":true}'`. Single stills and full renders are fine.
- Render times on this PC: key frames ~10 s; half-scale film ~7 min; 1080p film ~20 min; audio-only (`--codec=wav`) ~3 min.
- Check frames: render with `--scale=0.5 --image-format=jpeg`, tile with ffmpeg hstack/vstack, Read the image.
- `npm run check` = script check + tsc. `npm run render:animatic` = half-scale render. `npm run sfx` = rebuild sounds.

## 6. Key files

`src/timeline.ts` (all timing, guards) · `src/captions.json` (captions + on-screen strings) · `scripts/check-script.mjs` · `src/Film.tsx` (composition) · `src/scenes/{Problem,Product,TeamScenes}.tsx` · `src/story/bathroomStory.ts` · `src/puppets/{rig,Mari,Anna,TeamMember}.tsx` · `src/sets/{Bathroom,HouseSection,PerspectiveFloor}.tsx` · `src/props/{Rezon,Exploded,Props}.tsx` · `src/fx/ripple.ts` · `src/audio/SfxTrack.tsx` · `scripts/build-sfx.mjs`.
