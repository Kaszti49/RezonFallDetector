# REZON video – production log

Owner/approver: Kaszti. Source of truth: `SCRIPT.md`. Brief: `CLAUDE.md`.
Deadline: Mon 2026-10-26 23:59 (upload before 18:00). Final render: Sun 2026-10-25 evening.

## Phase tracker

| Phase | Status | Approved |
|---|---|---|
| 0 Setup | done | 2026-10-21 |
| 1 Style test (kill test) | done | 2026-10-21 |
| 2 Animatic (960×540, silent + captions) | done | 2026-10-21 |
| 3 Full animation (+ SFX pulled forward) | in progress | – |
| 4 Audio pass (VO + SFX + master) | – | – |
| 5 Team pass (heads, lines, mouth flaps) | – | – |
| 6 Final render + QC | – | – |

## Approvals

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
