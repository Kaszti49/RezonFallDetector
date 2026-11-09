# HANDOFF – resume here (updated 2026-10-23)

Read this first, then `NOTES.md` (decision log; the 2026-10-22 section explains every tool), `SCRIPT.md` (source of truth), `CLAUDE.md` (brief).
Deadline **Mon 2026-10-26 23:59** (upload before 18:00). Kaszti wants to finish as soon as possible.

## 1. Where we are

| Phase | Status |
|---|---|
| 0–3 | ✅ approved |
| 3 tweaks | ✅ done 2026-10-22: captions = one paper scrap per word; full SFX overhaul (real CC0 foley, no beeps or loops) |
| 4 Audio pass | ✅ built, **awaiting Kaszti's review** – **all 17 lines in** (team_2 Viktor + team_3 Bence added 2026-10-23) |
| 5 Team pass | ✅ built, **awaiting review** – photo heads, RMS mouth flaps + shape rules (2026-10-23), Veress fixed, team lines = set D |
| 6 Final render + QC | release candidate `out/REZON_Harman_2026.mp4` (2026-10-23) – automated QC in NOTES.md; **Kaszti's two watch-throughs (with sound, muted) still open** |
Git: local only. Never push.

## 2. Locked decisions (don't reopen)

- 16:9 landscape; year 2028; no music; titles = ransom collage; captions = **one paper scrap per word** (Rubik 500 44 px, highlight on a teal/red scrap).
- Team (SCRIPT.md S15–S18): Kaszti Benedek – design és projektvezetés · Szabó Viktor – jelfeldolgozás és MI · **Veress Bence** – beágyazott szoftver · Bors Máté – elektronika és prototípus. Lines = **set D**.
- Faces: `uploads/All 6 face cut outs.jfif`. Kaszti = blond/glasses, Viktor = moustache/goatee, Bence = brown hair rounder face, Máté = light-brown slim face.
- SFX: rules in `scripts/build-sfx.mjs` header; sources in `audio/sfx/CREDITS.md` (BigSoundBank CC0 + Kenney CC0).

## 3. Changing a voice line later

1. Copy the new take to `audio/vo/raw/<id>.<ext>` (wav/mp3/m4a; keep the uploads untouched).
2. `npm run vo` → re-measures all lines, writes `public/vo/*.wav` + `src/vo-timing.json`.
3. `npm run check` (captions vs SCRIPT.md + types). Team scenes grow automatically if a line is longer than 3.1 s; the guard keeps the total ≤ 118 s.
4. Team line: check the flap on stills (`--props=<file with {"audio":"none"}>`).

## 4. Final render + QC (Phase 6)

- Picture: `npx remotion render REZON out/final/_picture.mp4 --muted --crf=16 --color-space=bt709 --image-format=png` (`--color-space=bt709` → `yuv420p`, TV range, BT.709; without it Remotion writes full-range `yuvj420p`).
- Sound: `npm run master -- out/final/_picture.mp4 out/REZON_Harman_2026.mp4` (renders the VO + SFX stems, masters to −16 LUFS / −1.6 dBFS limiter, AAC 320k, +faststart). Use `--reuse` to skip the stem render when only the picture changed; re-render the stems whenever a voice line or SFX cue changed.
- Fonts stay on `@remotion/google-fonts`: a failed fetch aborts the render (no silent fallback).
- Run every item of the CLAUDE.md QC checklist and report each.

## 5. Gotchas

- **GateGuard hook:** the first Write/Edit of every file is rejected once; state the facts and retry. Destructive Bash (`rm`) also needs facts – render into fresh folders.
- **Remotion audio + sparse frames:** check renders of scattered frames pass `--props='{"audio":"none"}'` (or `{"noAudio":true}`).
- Render times here: key frames ~30 s; half-scale film ~7 min; 1080p ~20 min; each audio stem ~3 min.
- Check frames: render `--sequence --frames=a,b,c --scale=0.5 --image-format=jpeg`, tile with ffmpeg xstack, Read the image.
- Python with downloaded files: run `python -E -P` (numpy lives in the user site, so `-I` can't import it).
- BigSoundBank downloads need a Referer header of the sound's page (that's their player source; no account).

## 6. Key files

`src/timeline.ts` (all timing; reads `src/vo-timing.json`) · `src/captions.json` · `src/components/CaptionStrip.tsx` (word scraps) · `src/audio/{VoTrack,SfxTrack}.tsx` · `src/puppets/TeamMember.tsx` (photo heads) · `src/scenes/TeamScenes.tsx` (mouth flap) · `scripts/{process-vo.mjs,cut-faces.py,build-sfx.mjs,master.mjs,check-script.mjs}`.
