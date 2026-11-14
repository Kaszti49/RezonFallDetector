# REZON video – production log

Owner/approver: Kaszti. Source of truth: `SCRIPT.md`. Brief: `CLAUDE.md`.
Deadline: Mon 2026-10-26 23:59 (upload before 18:00). Final render: Sun 2026-10-25 evening.

## Phase tracker

| Phase | Status | Approved |
|---|---|---|
| 0 Setup | done | 2026-10-21 |
| 1 Style test (kill test) | done | 2026-10-21 |
| 2 Animatic (960×540, silent + captions) | done | 2026-10-21 |
| 3 Full animation (+ SFX pulled forward) | done – tweaks done 2026-10-22 (captions, SFX overhaul) | 2026-10-21 |
| 4 Audio pass (VO + SFX + master) | done – all 17 lines in (team_2/team_3 added 2026-10-23) – awaiting review | – |
| 5 Team pass (heads, lines, mouth flaps) | done (photo heads, RMS mouth flaps + shape rules 2026-10-23) – awaiting review | – |
| 6 Final render + QC | – | – |

## Approvals

- 2026-10-23 – Kaszti: **submitted.** `out/REZON_Harman_2026.mp4` (the release candidate) was used for the sign-up; the team is waiting for the selection result.
- 2026-10-23 – Kaszti: the last two lines are in `uploads/`: `vo_Viktor.mp3` = team_2, `vo_Veress.m4a` = team_3 (phone recording). "After implementing them we are basically done."
- 2026-10-22 – Kaszti: name fix **Veress Bence** (two s). Updated SCRIPT.md S17 + captions.json.
- 2026-10-22 – Kaszti: team lines = **set D** („Mert mindenkinek van egy Mari nénije." / „Nem akarjuk kamerával figyelni." / „De tudni akarjuk, hogy jól van." / „Ezért építettük meg a Rezont."). SCRIPT.md S15–S18 + recording list + captions updated; `npm run check` passes.
- 2026-10-22 – Kaszti: **captions: every word its own paper cut-out**, like the tagline at the end.
- 2026-10-22 – Kaszti: **SFX: "a high-pitched one and one that repeats a lot" are annoying – massive, logical improvement.** → full overhaul (see "Sound overhaul" below).
- 2026-10-22 – Kaszti: faces = one sheet (`uploads/All 6 face cut outs.jfif`, 8 heads). Mapping: Kaszti = blond with glasses, Viktor = moustache/goatee, Bence = brown hair rounder face, Máté = light-brown hair slim face.
- 2026-10-22 – Kaszti: VO delivered as mp3 (`uploads/`); `vo_011` = vo_11, `vo_Kaszti` = team_1, `vo_Bors` = team_4. **team_2 (Viktor) and team_3 (Bence) still arriving.**

- 2026-10-21 – Kaszti: install official Remotion agent skill `remotion-dev/skills`, **project-only** (no global install). Done.
- 2026-10-21 – Kaszti: Phase 0 approved ("the letters look good").
- 2026-10-21 – Kaszti: **Remotion license – no problem.** One-off, non-commercial, only the recruiting team sees it. Closed.
- 2026-10-21 – Kaszti: **Team** (written into SCRIPT.md S15–S18 and the recording list):
  - Kaszti Benedek – design és projektvezetés – „Én adok neki formát és hangot."
  - Szabó Viktor – jelfeldolgozás és MI – „Én tanítom meg érezni a lépéseket."
  - Veres Bence – beágyazott szoftver – „Én kötöm össze a családdal."
  - Bors Máté – elektronika és prototípus – „Én pedig összerakom, hogy működjön is."
- 2026-10-21 – Kaszti: **technical claims approved by Kaszti** (Viktor is not involved in the video; SCRIPT.md note updated).
- 2026-10-21 – Kaszti: caption word-sync = **method (a)** (silence detection + syllable-weighted timing). Switch to (b) whisper only if Kaszti dislikes the sync.
- 2026-10-21 – Kaszti: **no music, but ambience and SFX are very important to fill the empty space.** → Every scene gets a quiet ambience bed (room tone, tap drip, street/birds outside the window, clock) under the spot effects. Deliberate silences stay "quiet", never digital-dead.
- 2026-10-21 – Kaszti: will deliver the recorded lines after Phase 2 (today).
- 2026-10-21 – Kaszti: **Phase 3 "looks good overall"**; wants to tweak **some captions and some sound effects** (details tomorrow). Brings VO recordings + face photos on 2026-10-22. Resume plan: `HANDOFF.md`.
- 2026-10-21 – Kaszti: **Phase 2 approved** ("really good, I'm impressed").
- 2026-10-21 – Kaszti: **year 2031 → 2028.** VO-06 now reads „Kétezer-huszonnyolc. Mi lenne, ha nem egy kamera figyelne, hanem maga a ház?" Updated SCRIPT.md (S07 + recording list), captions.json, stamp, CLAUDE.md style example. 2028 is within the call's "next 5 years"; same 6 syllables, so timing is unchanged.
- 2026-10-21 – Kaszti asked for a standing phone (9:16) format. **Official call re-checked: "16:9 képaránnyal"** ("készülhet okostelefonnal" only means it may be shot on a phone). Kaszti chose: **keep 16:9.**
- 2026-10-21 – Kaszti: **sound effects + ambience pulled forward into Phase 3** (they don't depend on the VO). Phase 4 then adds the VO, ducking and the master.
- 2026-10-21 – Kaszti: **Phase 1 approved** – procedural cardboard look passes the kill test (no texture fallback).
- 2026-10-21 – Kaszti: **title style C – ransom mix** (letters on cut scraps, one display face per letter).
- 2026-10-21 – Kaszti: **Mari's cardigan stays the palette blend (plum-mauve)**; no new color.
- 2026-10-21 – Kaszti: **text and captions on paper/cardboard backgrounds.** Reference: `out/Font example.png` (ransom-note collage alphabet: each letter on its own cut/torn scrap of cream, kraft, grey or dark-brown paper, slightly rotated, heavy serif letters, own shadow per scrap).

## Decisions

- 2026-10-21 – **Stack pinned:** Remotion 4.0.537 (exact versions, all `@remotion/*` matched), React 19.2.3, TypeScript 5.9.3. Node v24.13.0 (LTS line). Packages: `@remotion/google-fonts`, `transitions`, `media`, `media-utils`, `noise`.
- 2026-10-21 – **Scaffold:** official `create-video --blank --no-tailwind`, generated in scratch then moved into this folder (folder was non-empty).
- 2026-10-21 – **Git:** `git init` local only. No remote. Never push.
- 2026-10-21 – **Font:** Rubik via `@remotion/google-fonts`, weights 500 (captions) / 700 (tags) / 900 (titles), subsets `latin` + `latin-ext`. latin-ext range U+0100–02BA covers Ő/ő/Ű/ű (U+0150/0151/0170/0171).
- 2026-10-21 – **Glyph test:** `out/phase0/font_test.png`. Fallback font deliberately set to Courier New so any missing glyph would show as typewriter type – none did. Ő ű render with the double acute at 44 px (caption) and 116 px (cardboard title). PASS.
- 2026-10-21 – **Timing estimates before real VO:** Hungarian syllables = vowels, so VO length is estimated from the exact script text (calm 4.6 syl/s). Phase 2 animatic uses these; Phase 4 replaces them with measured durations.

## Phase 2 – animatic (2026-10-21)

Output: `out/phase2/REZON_animatic.mp4` (960×540, silent, captions on). Composition `REZON` = `src/Film.tsx`. Render: `npm run render:animatic` (runs the script check + type check first).

**How it is built**
- `src/captions.json` – caption pages (line breaks at punctuation, BBC rules), highlight words, tone, and every on-screen string. `npm run check` (`scripts/check-script.mjs`) verifies each caption against the SCRIPT.md recording list **character for character**, ≤ 38 chars/line, ≤ 2 lines/page, and that every on-screen string exists in SCRIPT.md or CLAUDE.md. Fails the build on any mismatch.
- `src/timeline.ts` – the only place timing lives. Scene slots = SCRIPT.md (total **116.0 s = 3480 frames**). VO length estimated from syllables (calm 4.6 syl/s + pauses at punctuation) until real audio is measured. The build throws if the total > 118 s or if any VO line runs past its scene.
- Picture events are cued to **VO words** (`wordAt`), so they re-sync automatically when the real recordings replace the estimates: 2031 stamp on "Kétezer-harmincegy", camera peels on "kamera", house assembles on "hanem maga a ház", Wi-Fi tag on "vezeték", geofon tag on "érzékeli", towel lands at the end of "fürdeni?", phone lights on "riasztja", tagline scraps pop word by word.
- S02–S05 are one story function (`src/story/bathroomStory.ts`); S06 plays it backwards, so the rewind shows exactly what the viewer saw.
- S06 → S07 is a seamless hand-off: the bathroom set fits the house's right room exactly, the camera pulls back and the house assembles around it in paper pieces.
- One event list per section drives floor wave, LED, tape (and, in Phase 4, footstep SFX), so picture and signal always agree.
- Transitions: S02 flap, S09 slide, S12 slide, S13 flip, S14 flip; everything else is a cut or continuous. No crossfades.

**Decisions for Kaszti to confirm**
- **Team slide:** brief says each member slides *right*. Literal right-slides would end with the row reading M4…M1. I slide each member to their own slot so the final row reads **M1 → M4 left to right** (speaking order), device on the pedestal in the middle.
- **Device voice (S11)** is captioned inside the sound-wave speech bubble, not on the bottom strip. **Tagline (VO-11)** is captioned by the collage title itself (word by word), not a strip.
- **S07 order:** the 2031 stamp lands on the word "Kétezer-harmincegy" (start of the line), then the camera peels, then the pull-back – i.e. picture follows the voice.
- Mari inside the house is scaled to match the bathroom furniture (0.42).
- Fall ripple: α raised to 4.5 so the tape shows spike → **flat line** clearly within S10.

**Known animatic gaps (Phase 3 work)**
- Pop-up book pages are plain; add pop-up paper details.
- Team heads are placeholders (Phase 5).
- Walk has slight foot sliding; S01 dust/thud could be stronger; per-scene light grading (warm morning → blue night → calm teal) to refine.
- S07 is tight: the house finishes assembling just before the cut; real VO timing will decide.

## Last two voices, flap rules, final render (2026-10-23)

**team_2 / team_3:** copied to `audio/vo/raw/team_2.mp3` / `team_3.m4a` (uploads untouched), `npm run vo`. team_2 (Viktor) 2.03 s, team_3 (Bence) 2.26 s; the other 15 lines re-measured identically. The four team lines land within 0.6 LU of each other (−18.5…−19.1 LUFS). Viktor's take is full-band, just a darker voice; Bence's phone take is brighter with a faint hiss (~−80 dB) and phone noise-suppression holes above 12 kHz – inaudible under the room tone, so no EQ. No clicks (the full-height line in "kamerával" is the "k" release). Both lines are under the 3.1 s a 4 s team scene allows, so **the total stays 114.87 s (3446 frames)**. Captions + types pass. No local transcriber, so the words are checked by ear in the review, not by machine.

**Mouth flap shape rules** (`src/scenes/TeamScenes.tsx`): the loudness flap failed on the new takes – Viktor's flat envelope held the mouth open 0.53 s through "kamerával", and Bence's frame-to-frame flicker on "De tudni" never survived the 2-frame hysteresis, so the mouth stayed shut for the first 0.6 s. Máté's line had the same gap (0.4 s shut on "meg a"). Two rules on top of the unchanged loudness flap (open above 15 % of the peak and within 80 % of the ±3-frame local max, 2-frame hysteresis, 1 frame ahead): an opening longer than 7 frames is split evenly by 2-frame closures; while the voice is above the floor, the mouth never stays shut longer than 6 frames (open 3 / shut 2, keeping 2 shut frames next to an existing opening). Result: Kaszti 10 flaps (**identical frame for frame**), Viktor 5 → 7, Bence 5 → 9, Máté 6 → 8; longest opening ≤ 7 frames everywhere, longest voiced shut ≤ 6. Checked on stills (open/shut frames for both new lines).

**Pixel format:** every render so far was `yuvj420p` (full range, BT.601 tags), and `master.mjs` stream-copies the picture. `--color-space=bt709` gives `yuv420p`, TV range, BT.709 – the brief's format and the HD standard. Mean RGB vs a PNG still differs by ~1 level (no shift). The final picture is rendered with PNG intermediate frames (no JPEG step before x264).
**Fonts:** stay on `@remotion/google-fonts`. A failed fetch can't fall back silently (retries, then the `delayRender` times out and the render aborts), so the local-copy switch planned in HANDOFF isn't needed.

**Release candidate `out/REZON_Harman_2026.mp4`** (picture 18 min, stems + master 7 min). QC against the CLAUDE.md checklist:
| Check | Result |
|---|---|
| Duration ≤ 1:58 (ffprobe) | ✅ 114.867 s = 1:54.9, 3446 frames |
| 1920×1080, 16:9, H.264 yuv420p CRF ≤ 18, AAC 48 kHz, .mp4 | ✅ 1920×1080 square pixels, H.264 High@4.0, yuv420p TV range BT.709, x264 `crf=16.0`; AAC-LC 48 kHz stereo 320k; mp4 +faststart |
| Size < 600 MB | ✅ 225.6 MB |
| No music | ✅ only VoTrack + SfxTrack (foley + the brief's synthesized chime) |
| −16 LUFS ±1, ≤ −1 dBTP, no clipping | ✅ decoded AAC: −16.0 LUFS, true peak −1.6 dBTP, flat factor 0. VO stem −16.1 / SFX stem −24.4 LUFS (8.3 dB under) |
| Captions = SCRIPT.md, ő/ű | ✅ `npm run check` (17 captions, 22 on-screen strings); "Ő Mari néni." seen in the S02 frame |
| No `[ ]` placeholders | ✅ none in `src/` or SCRIPT.md |
| 4 team members with name + role | ✅ S15–S19 frames; Viktor 99.8–101.7 s and Bence 103.8–105.9 s present in the VO stem |
| Criteria map covered | ✅ contact sheet, one frame per scene: S02–S05 problem; S07 2028 + S11 the house speaks; S11 device voice, S09 tape, S13 tagline; camera "NINCS KÉP", pendant on the hook, exploded view; S14–S19 team; S10 "ütés + mozdulatlanság = esés" |
| No AI text in images, no third-party logos | ✅ all text is code-rendered; no Harman/JBL in `src/` |
| Watched in full with sound + muted | ⏳ **Kaszti** |

## Phase 4 + 5 – voice, sound overhaul, captions, team (2026-10-22)

**Voiceover** (`npm run vo` → `scripts/process-vo.mjs`): `audio/vo/raw/<id>.mp3` (copies of the uploads, originals untouched) → 48 kHz mono, 80 Hz high-pass, leveled to −21 LUFS, 3:1 compression, re-leveled to −19 LUFS, limiter −3 dBFS, trimmed to 0.08 s before the first syllable and 0.2 s after the last → `public/vo/<id>.wav`. No denoise: the recordings' floor is about −80 dBFS. DEV lines: speech is measured dry, then a 300–4000 Hz band (2 × 2-pole each side), a +4 dB presence bump at 1.8 kHz and a short small-room echo (17/29/43 ms), re-leveled to −20 LUFS. team_4 peaks at 0.0 dBFS in the raw file, but its flat factor is 0 (no clipping).
- **Word timing (method a):** speech segments from a 10 ms RMS envelope (gate −36 dBFS, gaps < 0.12 s bridged, blips < 0.12 s dropped, which also removes a lip smack at the start of vo_08). A dynamic program assigns word groups to segments by syllable fit, with a penalty of 0.25 for a pause that is not at punctuation; inside a segment, words are spread by syllables. A lone "–" lands at the end of the word before it, so it stays on its own caption page. Spot checks against the pauses all line up (e.g. "Egy@1.81", "ami@4.33", "másodpercek@6.00").
- `src/vo-timing.json` = duration, word starts and 30 fps RMS per line. `timeline.ts` uses it in place of the syllable estimate, and throws if a line's word count differs from its caption.
- **Re-timing:** each scene = max(action minimum, last VO end + 0.6 s). S07 7.73 s (cue moved 0.4 → 0.3), S08 9.8 s (it held ~2 s past its VO; the snap now follows the scene length), S09 11.23 s, S11 7.13 s, S12 8.27 s, S14 3.7 s. **Total 114.87 s (1:54.9).** team_2/team_3 keep the estimate (2.6 s); a longer recording grows its scene automatically.

**Captions:** each word is its own scissor-cut paper scrap (Rubik 500, 44 px, as the brief), with paper colors from the tagline collage: cream 55 %, light kraft 20 %, steel 15 %, ink with paper letters 10 %. Highlight words sit on a teal (product) or red (problem) scrap with paper letters. Each scrap pops in on its word, stepped on twos (scale 0.45 → 1.12 → 1, small drop and wiggle); hidden words keep their place so nothing reflows. Letters never boil.

**Team heads** (`npm run faces` → `scripts/cut-faces.py`, OpenCV, no rembg needed): GrabCut per head on the sheet; the open-mouth photo is aligned to the closed one by ECC (affine) on the eyes and forehead only, so the jaw can still drop. It is clipped just below the closed chin (no neck or collar). Both share one outline, so the sticker never changes shape; there is a hand-cut white paper border (7 px plus seeded wobble) and a drop shadow in the film. Head height is 285 puppet units, a big cut-out head on a small suit. Images are decoded before the first team frame (delayRender), because SVG `<image>` is not awaited.
- **Mouth flap:** RMS per frame from the processed recording (`vo-timing.json`); open above 30 % of the line's peak; the state flips only after 2 frames (hysteresis), read 1 frame ahead to cancel the lag. Lines without a recording keep the syllable flap. *Deviation from the brief:* the RMS is precomputed with ffmpeg instead of read live with `visualizeAudio`. It is the same signal, but deterministic and without async audio loading during render.

**Sound overhaul** (`scripts/build-sfx.mjs`, `src/audio/SfxTrack.tsx`). Diagnosis of Kaszti's two complaints: the old sound track had synthesized **sine-beep clock ticks at 2.5–3.1 kHz** looping through S02–S04 plus a fast version in S05, **crickets at 4.3–4.7 kHz**, a **15 s pen hiss at 4.5 kHz**, **10 countdown ticks** and **16 identical drips**. All of them are gone. Rules now:
1. Every sound has a visible source or a story job.
2. Repeated events rotate real takes (6 slipper steps, 4 sink drops) with seeded ±15 % level.
3. Nothing shrill: bright sources are low-passed; measured spectral centroids are all 0.3–4.5 kHz.
4. The voice wins: effects duck under speech (−5 dB typical, beds −3 dB).
- Sources: **BigSoundBank (CC0, real foley)**, see `audio/sfx/CREDITS.md`, plus a few Kenney sounds. The only synthesized sounds left are the brief's E5→A5 chime (softer: lower harmonics, low-passed) and the low body under the thuds.
- Cue logic: real body fall on tiles (hook = S04 fall, same file); slippers; one sink drop per visible drop (the tap now drips every 3.4 s instead of 1.6 s, picture and sound together); towel; slip scuff; inset pop; real cassette deck (button, motor, stop clunk exactly on REWIND_END); book-slam stamp; tape peel; camera clatter off-screen; paper pieces as the house assembles; whoosh and land for the device; lid; a paper tack per label; snap. **S09: the same slipper takes heard "through the floor"** (low-passed thumps: what Rezon feels). S10: heavy fall plus one pencil jump on the spike. S11: chime, then the **10 s countdown runs silently** (tension) with cloth on each weak hand lift. S12: a rising swell as the alert travels, the phone vibrating on "riasztja", chair, keys. S13: door off-screen, cloth, tagline scraps. The book: page, open, pop per member, slide.
- S05 no longer has sped-up clock ticks (SCRIPT.md suggested them; Kaszti's "repeating" complaint wins). Time passing is now the morning room slowly giving way to the night room, plus the lonely drip.
- Rooms: real house air (2458, low-passed at 2.5 kHz or 1 kHz for night), city through a closed window for Anna's office (0080). Crossfades at cuts; morning → night over the S05 time-lapse.

**Mix / master** (`npm run master -- <picture.mp4> <out.mp4>`): renders stems with `--props` `{"audio":"vo"|"sfx"}`, sums them, applies gain to −16 LUFS, then a 4×-oversampled limiter at −1.6 dBFS, AAC 320k, +faststart. Measured: VO stem −16.2 LUFS, SFX stem −24.4 LUFS (**8.2 dB under the voice**, as the brief asks); master **−16.0 LUFS, −1.6 dBFS peak**. Hit check on the SFX stem: thuds at 0.68 / 18.94 s, rewind stop 32.02 s, stamp 33.46 s, snap 49.63 s, heavy thud 62.76 s, chime 66.07 s, phone buzz 75.94 s.

## Phase 3 – full animation (2026-10-21)

Output: `out/phase3/REZON_phase3_1080p.mp4` (1920×1080, CRF 18, with SFX + ambience; no VO yet).

- **Walk without sliding:** the planted foot is locked to the floor; the hip is placed from the stance leg's reach (including the 11 px near/far hip offset). Strides are now the natural leg swing (≈117 px at full scale), so Mari reaches x≈700 in S02, ≈1290 under the camera in S03, and ≈1317 in the house walk. Footstep impacts (floor wave, tape, step sounds) fire at the true heel position. Walks settle into the resting pose over 0.25 s.
- **S07 fix:** with the estimated VO, the house assembly started on "hanem" and could not finish inside the 7 s scene → S08 opened on a jump. Now the build window (`s07Build()`, shared with the SFX) starts just before "hanem" and always ends ≥ 0.45 s before the cut, whatever the real VO timing.
- **Mood grading** (`Grade` in `KeyLight.tsx`): amber edge wash breathing with the LED in S11 (alarm), soft teal lift from the center in S13 (relief). Existing: warm morning shaft S02–S04, night-blue S05, rewind tint S06.
- **Pop-up book:** paper hills, sun and clouds fold up as the book opens (S14–S19).
- **Device:** lid details (grille, debossed REZON, LED, glow) scale with the device size; lid rim + small shadow. Fixed an unreadable finale device and cleaned up the S08 exploded view.
- **Tooling note:** Remotion's audio mixing crashes on sparse image-sequence renders (`--frames=a,b,c`) once audio exists. Check renders pass `--props='{"noAudio":true}'`; full renders always include sound (verified).

## Sound design (2026-10-21)

- **Sources:** Kenney CC0 packs (impact, RPG foley, interface) + sounds synthesized with ffmpeg. All logged in `audio/sfx/CREDITS.md`. No attribution needed, no accounts, no music. Freesound (account needed) and Mixkit (license unverifiable) not used.
- **Build:** `npm run sfx` → `scripts/build-sfx.mjs` → `public/sfx/*.wav` (48 kHz, peak-normalized per sound; cardboard flavor = low-passed sources, thuds get a synthesized low sweep for body).
- **Sync:** `src/audio/SfxTrack.tsx` places every sound from the same constants as the picture (walk plans → footsteps, fall times → thuds, `BEATS` table, VO word times → label pops / tagline pops). Verified on the rendered audio: thuds at 0.6 s / 18.85 s / 63.9 s, stamp 33.4 s, landing 40.75 s, snap 49.75 s, rewind click 32.0 s.
- **Brief rules met:** S01 hook thud and S04 fall thud are the **same file** (`thud.wav`); S10 is the heavier variant (`thud_heavy.wav`); chime = two sine tones E5 → A5 with exponential decay; room tone under everything (never digital silence).
- **Cue map:** S01 thud · S02 flap, slippers, drips, clock · S03 towel whoosh/flop · S04 slipper squeak + thud · S05 fast clock, crickets as night falls · S06 tape rewind + click · S07 stamp, sticker peel, camera clatter off-screen, paper slides as the house assembles · S08 landing, lid lift, label pops on their words, snap · S09–S10 slippers through the floor, pen on the tape, squeak, heavy thud, tag pop · S11 chime + countdown ticks · S12 slide, phone buzz on "riasztja", chair creak, keys · S13 page flip, door off-screen, soft settle, tagline pops · S14–S19 page flip, book open, pop-ups, slides.
- **Level now:** SFX-only preview = −18 LUFS integrated, true peak −0.9 dBFS (audible without VO). **Phase 4:** SFX bus down ~6–8 dB + ducking under VO, master to −16 LUFS / ≤ −1 dBTP measured on the final mp4.
- **Audition (Kaszti picks):** `audio/sfx/audition/` – thud A/B/C, steps A/B, chime A/B/C, phone buzz A/B. A = what the preview uses.

## Recording guide (for the lines Kaszti delivers after Phase 2)

- Room: the quietest, softest room (clothes, curtains, sofa). A wardrobe full of clothes is ideal. No echoey bathroom or kitchen.
- Mic: phone is fine. 15–20 cm from the mouth, slightly to the side (no "p"/"b" pops). Same distance and level for every line.
- Format: WAV 48 kHz if the app allows; otherwise the phone's normal format (I convert). One file per line, named as in SCRIPT.md (`vo_01.wav` … `team_4.wav`), 3 takes each, 1 s silence before and after.
- Also record **10 s of room tone** (silence, same spot) → used for clean noise reduction.
- Pace: calm and clear, but **VO-03 at a normal pace** (it is the tightest line). DEV-01/02 calm and slightly slower; I make them sound like the device's small speaker.
- Team lines: **each member records their own line** (team_1 Kaszti, team_2 Viktor, team_3 Bence, team_4 Máté).
- Drop the files into `audio/vo/raw/` (or send them; I file them).

## Phase 1 – style test (2026-10-21)

Stills: `out/phase1/StyleBathroom.png`, `StyleDevice.png`, `StyleSection.png`, `StyleTitles.png`; overview `out/phase1/PHASE1_contact_sheet.png`. Each still renders in ~7 s.

**What makes it read as paper (all code, no images):** seeded hand-cut outlines on every piece; seamless fiber/grain textures that move with each piece; low-frequency mottling on backdrops; card thickness extruded bottom-right; a lit top-left cut edge; per-piece drop shadow (6, 8, blur 10, 35 % ink); corrugated flutes on every cut face; brass split pins on Mari's joints; far-side limbs in shade; one warm key light top-left with falloff; shallow depth of field in the close-up.

**Iterations:** v1 → wall fibers read as wood grain, floor read as planks, Mari blended into the tiles, flat light. v2 → mottle read as stains. v3/final → fixed (short fibers, checkerboard tile floor, plum cardigan, rim light, stronger window shaft, subtle mottle, bigger LED, contact shadow, distinct step bursts).

**Decisions made (Kaszti to confirm):**
- **Derived colors:** characters/props use blends of palette tokens only (`DERIVED` in `src/theme.ts`). The palette has no purple, so Mari's "lilac" cardigan is a plum-mauve blend of night-blue + red + paper. A true lilac would be a new color – Kaszti's call.
- **LED "green" = teal** (`ledTeal`), since teal is the palette's "all OK" color and green is not in the palette.
- **Ripple model:** same formula, decay split into distance attenuation β and ring-down α (`src/fx/ripple.ts`). With β = α/v it equals the brief's formula exactly. Reason: with the brief's α = 2.5, a step's wave fades to ~0.1 px before reaching the device, so the picture could not show the signal arriving. Step: A 7 px, α 7, β 0.0007/px, v 600 px/s, λ 96 px. Fall: A 22 px, α 1.2, β 0.0004/px, λ 64 px. λ is large enough that the wave moves < ½ wavelength per frame (no strobing).
- **Every text sits on paper or card** (Kaszti): captions = torn paper strip on a kraft backing scrap; tags = cut paper with tape; titles = letters on individual cut scraps (reference: `out/Font example.png`).
- **Title typeface: open** – A Rubik Black / B Fraunces Black serif / C ransom mix.

**Honest kill-test verdict:** it does not look cheap. It reads as a coherent hand-made paper-craft world, and the cross-section + tape sell the technical idea clearly. It is "illustrated cut paper" rather than "photographed stop-motion": light is still fairly even and there is no photographic micro-texture. Motion (boil + poses on twos) will add much of the handmade feel. Fallback, if Kaszti wants more realism: photo-like generated textures (no text in them) mapped onto the same shapes – costs time and consistency; recommendation is to stay procedural.

## Phase 0 findings

### Official call verified (harmanhackathon.amk.uni-obuda.hu)
Matches CLAUDE.md: max 2 min, mp4, 16:9, ≥ Full HD, good sound, **no background music**, team introduced. Theme: an intelligent space in 5 years (home fits). Jury looks at: creativity/novelty, effect on well-being, the smart device + technical depth, overall impact of the video, complexity of the concept. Four questions to answer: problem/opportunity; human–machine relationship in 5 years; role of sound/music in the interaction; what's new vs today. SCRIPT.md's criteria map covers all four. The page does not state a file-size limit (600 MB comes from the brief; we will be far under).

### Remotion license
- Free license covers *"an individual, whether for personal or commercial use"*.
- Grey area: the FAQ also says *"an organization or team of individuals with up to 3 people"*, counted by **total headcount**. We are a team of 4.
- Why we are still fine: only Kaszti operates Remotion. The FAQ's agency rule says a client who only receives the finished video *"is not a User of the Remotion Software, so their headcount does not count"*. The teammates are in that position: they get the mp4, not the project.
- Optional zero-doubt step (free): email Remotion and ask. **Kaszti decides.**

### VO fit check (estimate, calm pace 4.6 syl/s + pauses, vs. SCRIPT slot)
All lines fit. **VO-03 is tight** (≈6.6 s in a 7 s slot) → read at a normal pace, or S03 borrows ~0.3 s from S07 (which has ~0.9 s slack). Caption reading speed is 100–155 wpm everywhere, under the BBC 160–180 wpm limit, so the film works muted.

| Line | Slot | Est. calm | Est. brisk |
|---|---|---|---|
| VO-01 | 6 s | 2.5 s | 2.0 s |
| VO-02 | 5 s | 3.9 s | 3.1 s |
| VO-03 | 7 s | 6.6 s | 5.5 s |
| VO-04 | 8 s | 6.7 s | 5.5 s |
| VO-05 | 4 s | 1.1 s | 0.9 s |
| VO-06 | 7 s | 6.1 s | 5.0 s |
| VO-07 | 12 s | 7.3 s | 6.0 s |
| VO-08 | 11 s | 9.8 s | 7.9 s |
| DEV-01+02 | 7 s | 4.2 s | 3.3 s |
| VO-10 | 8 s | 7.0 s | 5.7 s |
| VO-11 | 10 s | 3.5 s | 2.8 s |
| VO-12 | 4 s | 2.0 s | 1.6 s |

## Professional standards we apply (research, 2026-10-21)

- **Captions (BBC subtitle guidelines):** max 2 lines, ~38 chars/line (= our rule), break lines at punctuation, reading speed ≤ 160–180 wpm. Long VO lines are split into consecutive caption "pages" at sentence/clause boundaries; characters stay identical to SCRIPT.md.
- **Loudness:** −16 LUFS integrated is the loud end of the AES online range (−16…−20), good for laptop speakers. True peak: AES ceiling −1 dBTP; AAC encoding can overshoot, so we limit to about −1.5 dBTP before encoding and **measure the final mp4**, not the wav.
- **Mix:** speech intelligibility first; SFX ~8 dB under VO; check on headphones, laptop speakers and a phone; mono-compatibility check.
- **Pitch structure:** hook in the first seconds, one problem, one product, show-don't-tell demo, one memorable line, then the team. Our script already follows this.
- **Delivery:** H.264 High, yuv420p, CRF ≤ 18, AAC 48 kHz, `+faststart` (moov atom first, so web players start instantly).

## Open questions for Kaszti

1. ~~License~~ closed. ~~Team names/roles/lines~~ closed. ~~Tech claims~~ closed. ~~Word-sync~~ closed: (a).
2. S13 "soft relief beat (no music)": plan = non-musical SFX only (door, a soft exhale/paper settle). No tonal sting, to stay clear of the "no background music" rule.
3. Title typeface (decided from the Phase 1 still): Rubik Black on collage scraps vs a heavy serif like the reference.

## Risks and mitigations

- **Render time:** full-frame `feTurbulence` grain on every layer is expensive. Mitigation: bake the code-generated textures to PNG once and reuse them (still deterministic, no AI images).
- **Font fetched from Google at render time:** before the final render, switch to a local copy of Rubik (SIL OFL, redistribution allowed) so an offline or failed fetch cannot break the render.
- **Black first frame:** S01 opens black, so an upload thumbnail would be black. Fine for a form upload; flag if the platform shows thumbnails.

## Hardware: SIM800L → SIM868 (2026-11-12)

- New modem on hand: **Waveshare Pico-SIM868-GSM/GPRS/GNSS** board (photo `uploads/NewSIM.jpg`), shipped with a Pico H, a 600 mAh Li-po, a speaker and a male header strip.
- The black part in the photo is the **speaker**, not an antenna. All three u.FL sockets (GNSS, GSM, BT) are empty: the GSM antenna is mandatory and must come from the box or be bought.
- Decision (pending Kaszti's OK): keep the ESP32-S3 and use the SIM868 board as a modem only. The Pico H comes off. 5 M-F jumpers go from H2 (J29–J33) into the board's Pico sockets: pin 1 RXD ← GPIO17, pin 2 TXD → GPIO18, pin 3 GND, pin 19 PWRKEY ← GPIO16 (HIGH 1.5 s), pin 36 3V3 ← ESP32 3V3. Power comes from the 18650 (L35/L33) into the board's PH2.0 battery socket, with the board's switch on battery.
- Verified from Waveshare's schematic and demo code: UART0 GP0/GP1, PWR_EN GP14 drives an NPN on PWRKEY, and a TXB0104 level shifter on 3V3 (pin 36). Its VBUS/VSYS circuitry stays unused.
- Dropped: SIM800L sockets, the R2/R3 divider, C2 and the nano→micro adapter. C1 (1000 µF) stays at the take-off.
- The board (76 × 24 mm) stands on edge in a printed cradle at the back wall, with the antenna edge up and the GSM antenna stuck on the wall at the back left. The printed base needs the two cradle clips added.
- To buy: a PH2.0 2-pin plug with leads (not in Hestore stock), plus a u.FL GSM antenna if the box has none.
- Regenerated `Rezon_Wiring_Guide.html` and `Rezon_Wiring_List.pdf` (`wiring_source/`), plus `Rezon_Hackathon_Parts_List_SM24.pdf` and `Hackathon_shopping_list_SM24.csv` (new source: `parts_source/parts.py`).
- 2G in Hungary: still on air. Telekom's 2G moved onto Yettel's network in 2026, and a switch-off around 2030 has been reported.

### SIM868 call test on the practice ESP32 (2026-11-12)
- Kaszti asked to test a single call now. Sketch: `practice/sim868_call_test/sim868_call_test.ino` (classic ESP32 DevKit V1, the practice board).
- Practice pins differ from the final S3 map on purpose: TX D25 → board pin 1, RX D26 ← pin 2, PWRKEY D27 → pin 19, 3V3 → pin 36, GND → pin 3. D16/D17 are taken by the geophone-test Click wiring, so that wiring can stay in place.
- Power for the test: the 600 mAh Li-po that came in the box (already on the board's battery socket), so no PH2.0 plug is needed yet.
- Blocker to check: the GSM antenna (none in the photo).
- Result (2026-11-12): first outgoing call placed from the practice rig. Fixes on the way: D26/D27 jumpers were swapped (D26 sat in pin 19, D27 in pin 2), D25 needed reseating in hole 1. Modem at 115200, signal CSQ 30–31, registered on "vodafone", battery 3.99 V. The SIM still has its PIN on: it was unlocked for the session with AT+CPIN, so after every power-up it asks again. For the finished device, switch the PIN off in a phone.
- Diagnostic sketch: `practice/sim868_diag/sim868_diag.ino` (tries both RX/TX orders and 5 bauds, reads idle line levels, pulses PWRKEY only when SIM TXD is low = modem off).
- Incoming call (2026-11-12): Kaszti's phone called Rezon. Caller ID showed (+CLIP), answered with ATA on the 2nd RING, connected ~65 s until the caller hung up (NO CARRIER). Speaker from the Waveshare box on the board, AT+CLVL=100, AT+CMIC=0,10. Both directions work.

## Firmware master prompt (2026-11-12)
- Prompt for the firmware session saved as `firmware/MASTER_PROMPT.md`. Explainer PDF: `Rezon_How_It_Works.pdf` (source `explainer_source/`).
- Kaszti's decisions: fall score = feature vector · weights fitted offline on our recordings (device does vector maths only); one geophone; the button always cancels, walking cancels only as a NEW steady rhythm after the impact (people already walking never cancel); the prompt covers the whole firmware.
- Research behind it: G-Fall (Shenzhen Univ.), Clemente et al. (Univ. of Georgia), FootprintID (CMU/Stanford, SM-24), Liu et al., Shao et al. No usable repo, Hugging Face model or public fall dataset for floor vibration was found.

## Firmware phase 1: detection core, tools, two pages (2026-11-13)

Kaszti's answers: stage link = USB first, Wi-Fi later as an option · speaker gets NEW clips with the blob's words („Minden rendben van?" / „Hívok segítséget!") · device not wired yet, laptop tests only · the "I'm OK" button works in code but is not part of the stage flow.

**What exists** (all in `firmware/`, nothing committed):
- `rezon/src/core/` portable C++ (no Arduino includes): `rezon_core` (layers 1–6 of the master prompt), `rezon_alarm.h` (sequence, home/stage profiles), `rezon_proto.h` (serial lines), `rezon_weights.h` (written by `tools/fit`).
- `rezon/rezon.ino` ESP32-S3 firmware. Compiles with the IDE's arduino-cli (`esp32:esp32:esp32s3`, core 3.3.8): 389 kB flash, 79 kB RAM. **Never run on hardware.**
- `tools/replay.cpp`, `tools/fit.cpp`, `build.bat`, `train.bat`, `mixtest.sh`. Built with the g++ already on this PC.
- `ui/live.html` (stage screen) and `ui/train.html` (recording, labelling, settings). Single files, Web Serial, no internet.
- `data/labels.tsv` (provisional), `data/demo_fall.log` (one real fall with alarm lines, for rehearsing `live.html`).

**Decisions**
- Detection runs only on the device. Pages draw and record; they never decide. Exception: `live.html` has a display-only impact trigger for streams without alarm lines (old practice sketch) and for the demo.
- Events are analysed from 5 ms frames in a 4 s ring, so the work per sample is constant.
- End rule: variance rule (3× / 1.5× background) and 60 %-of-peak rule both implemented (`segMode`). Both find the same 7 falls; the peak rule finds more steps in the soft-shoe recording (22 against 11) → default = peak rule.
- An impact-sized event is analysed over a fixed 900 ms window (or until the floor is quiet). Decision arrives 0.3–0.7 s after the impact.
- A start needs a rise (last 20 ms ≥ 2× the quietest 20 ms just before), so decaying floor ringing cannot start events.
- Spectral features come from a 4-band filter bank (10–20, 20–30, 30–45, 45–65 Hz) with the background power subtracted.
- Fit tool is C++ (no Python on this PC): class-balanced logistic regression, L2, sign-constrained, leave-one-recording-out.
- Alarm order: question → countdown → "calling" clip → dial. The clip ends before dialling (power bank ≈ 1 A).

**Differences from the master prompt, wiring guide wins**
- No battery measurement (power bank build, R4/R5 dropped). Button uses the internal pull-up.
- Amp is the ZK-502M with a volume knob, so the fixed −21 dB rule no longer applies: `volume` setting, default 10 %.
- **Gain conflict:** the jumper guide says "gain 32 in firmware", the master prompt says 4. Gain 32 clips at ±1.8 mm/s and the recorded falls reach 3.9 mm/s. Firmware default = 4. Kaszti to confirm.

**Results on the recordings (2026-11-13)**
- Recordings 2 + 3: 7 of 7 impact-sized events flagged fall-shaped, 0 other alarms. Recording 4 (walking): 0 alarms.
- Fit: 7 falls / 145 others, leave-one-recording-out 7/7, 0 false alarms. **Labels are provisional** (the 7 big impacts are assumed to be the "7 known falls") and the falls are 2× stronger than anything else, so this proves little.
- Walking added on top (recording 4 at 5 offsets, 10 runs): 35/35 falls found, 0 extra alarms; added walking cancelled a fall in 1 run. With the walking doubled in level: 10 extra alarms in 10 runs.
- Sub-impact count was 1 for every event, so that feature carries no weight yet.

**Known weak points**
- Walker tracking: soft-shoe steps sit at the threshold, signatures are noisy, few tracks get confirmed. So the "walkers" gate and bystander recognition rarely engage. Needs labelled walking recordings.
- A NEW walker who starts after a fall cancels it like someone getting up (the prompt's own rule; one sensor cannot tell them apart).
- Recording 1 (gain 32, clipped): 4 fall-shaped + 12 impacts between 2.7 and 10.5 s, nature unknown.

**Open**
- Kaszti: label the events (list in the chat), confirm gain 4, deliver the two voice clips (WAV), put the number in `firmware/rezon/secrets.h`.
- Not written yet: calibration routine (`!cal`), clip converter, Wi-Fi link, hardware bring-up.

## Firmware on the real device: first upload (2026-11-14)

Device wired, on USB (COM4, CH343 = the DevKit's UART port). `firmware/rezon` compiled with arduino-cli (`esp32:esp32:esp32s3`, build in `firmware/build/`) and uploaded.

**Measured over serial**
- ADC: ID 0x2205, 998 samples/s, 0 CRC errors, 0 dropped lines at 460800 baud. Gain ×4.
- Geophone channel (ch1): quiet, sd ≈ 390 counts (≈ 0.0007 mm/s), DC offset ≈ 26 400 counts. No events while nobody touched it. **Not yet tapped**, so the geophone itself is unproven.
- ch2 is open and swings up to full scale. The firmware ignores it.
- Settings (`!get`) answer; flash defaults are the compiled ones.
- Alarm rehearsal (`!test`): ASK 1300 → WAIT 3000 → ANNOUNCE 1100 → CALL → FAIL → WATCH. FAIL is expected: no `secrets.h`, so it never dials.
- **SIM868: no answer.** Diagnostic sketch (S3 pins 17/18/16): SIM TXD (GPIO18) floats (follows the pull-up and the pull-down), 0 bytes in both wire orders at 5 bauds, before and after a PWRKEY pulse. So the modem is off or unpowered, not a swapped RX/TX. First suspect: no 4.0 V at the PH2.0 plug (the guide has the rocker OFF while on USB, and the step-down hangs behind the rocker).

**Bug fixed**
- `!test` jumped straight from ASK to WAIT. `handleLine()` took its own `millis()`, 1 ms ahead of `loop()`'s `now`, so `tick()` saw a negative (wrapped) age. The command handler now gets `loop()`'s `now`. Falls and the button were not affected (they already used it).

**Not verified (needs eyes, ears and hands)**
- LED colour, the two placeholder tones on the speaker, the button, a tap on the table, and `train.html` connecting (Web Serial needs a click on the port chooser).

## Normalised fall rule from the stage test (2026-11-14)

Kaszti's stage recording (`uploads/session_2026-11-14T01-41-28.log`, copied to `firmware/data/`, labels in `labels.tsv`): walking near 0–11 s, mid 12–30 s, far 31–43 s; falls near 43.7 s / mid 51.5 s / far 60.4 s; then 3 jumps (64.3, 70.1, 74.8 s). Gain ×2. Settings on the device were walkerMargin 1.5, impactMin 30, stepRef 8.
Kaszti's goal: a fall at the far end of the room must alarm, a hard step next to Rezon must not, even when the step is louder.

**What the old absolute rule did:** the far fall (impact-path peak ≈ 19 mm/s) never reached impactMin 30, and the 250 ms refractory swallowed its main peak, so it was split into "steps". Two jumps were flagged as falls. Near/mid falls and all jumps clip the ADC at gain ×2.

**Rule 1 (normalised), now the default (`rule = 1`):**
1. Impact-sized only when the peak ≥ `relMin` (4) × the **step level** = the second-loudest step-like event from 8 s to 1 s before the onset (`levelMs`, `levelGapMs`; `stepRef` when none). The last second is left out because each fall started with smaller hits (stumble/knee) that otherwise raised the level. `impactMin` is now only an absolute floor.
2. Fall-shaped only when the impact envelope stays ≥ 30 % of its own peak (`holdFrac`) for ≥ `holdMin` (0.25 s) within −300…+600 ms of the peak. Impact events stay open until 600 ms after the peak for this.
Both numbers ignore distance: a near step is no louder than the walking around it, and a far fall is far louder than that person's own steps and lasts.

**Results (replay):** stage session 3/3 falls (×23.8 / ×15.4 / ×9.3, hold 365 / 315 / 425 ms), 3/3 jumps rejected (hold 165–195 ms), loudest non-impact event ×3.3. Stable for relMin 4–8 and holdMin 0.20–0.30. Old recordings: walking-only still 0 alarms; 2 of the 7 *provisional* falls are now "impact" (hold 125 and 145 ms; one is 1.8 s after a detected fall). Mix test (walking added): 30/42 at ×1, 33/35 at ×2, 2 extra alarms in total.
Rule 0 (old absolute rule) is still there: `!set rule 0`.

**New settings:** rule, relMin, holdMin, holdFrac, levelMs, levelGapMs (`!set`, train page). Protocol: E lines end with `,hold,rel,level`; S lines end with `,level,impactThreshold`. The train page shows ×lvl and hold per event, plus the step level.

**Weak points / open**
- One recording, one person, one floor: 3 falls and 3 jumps. Needs more falls (different people, sitting down, dropped objects) before it is trusted.
- Two people: a loud walker near Rezon raises the level and can hide a far fall of someone who was not walking.
- Clipping at gain ×2 lengthens the measured hold of near events (falls and jumps alike). Try gain ×1 on stage and record again.
- For the stage, set `impactMin` back to a floor (6 mm/s fits this floor), not 30.

**Flashed 2026-11-14.** The board now enumerates as **COM15** (CH343); COM4 is a Bluetooth port on this laptop, so uploads to COM4 time out. Device reports rule 1 and the new settings. Settings kept in flash: stepMin 1.5, impactMin 18, walkerMargin 1.5, stepRef 8, gain ×2. Replay with exactly these: 3/3 falls, 3/3 jumps rejected. The far fall's peak (19.1) is only just above impactMin 18. Suggested: impactMin 6.
- impactMin set to 6 and stored in flash (2026-11-14), confirmed with !get.
