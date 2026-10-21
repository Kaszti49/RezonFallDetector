# REZON video – production log

Owner/approver: Kaszti. Source of truth: `SCRIPT.md`. Brief: `CLAUDE.md`.
Deadline: Mon 2026-10-26 23:59 (upload before 18:00). Final render: Sun 2026-10-25 evening.

## Phase tracker

| Phase | Status | Approved |
|---|---|---|
| 0 Setup | done | 2026-10-21 |
| 1 Style test (kill test) | done, awaiting approval | – |
| 2 Animatic (960×540, silent + captions) | – | – |
| 3 Full animation | – | – |
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
- 2026-10-21 – Kaszti: **text and captions on paper/cardboard backgrounds.** Reference: `out/Font example.png` (ransom-note collage alphabet: each letter on its own cut/torn scrap of cream, kraft, grey or dark-brown paper, slightly rotated, heavy serif letters, own shadow per scrap).

## Decisions

- 2026-10-21 – **Stack pinned:** Remotion 4.0.537 (exact versions, all `@remotion/*` matched), React 19.2.3, TypeScript 5.9.3. Node v24.13.0 (LTS line). Packages: `@remotion/google-fonts`, `transitions`, `media`, `media-utils`, `noise`.
- 2026-10-21 – **Scaffold:** official `create-video --blank --no-tailwind`, generated in scratch then moved into this folder (folder was non-empty).
- 2026-10-21 – **Git:** `git init` local only. No remote. Never push.
- 2026-10-21 – **Font:** Rubik via `@remotion/google-fonts`, weights 500 (captions) / 700 (tags) / 900 (titles), subsets `latin` + `latin-ext`. latin-ext range U+0100–02BA covers Ő/ő/Ű/ű (U+0150/0151/0170/0171).
- 2026-10-21 – **Glyph test:** `out/phase0/font_test.png`. Fallback font deliberately set to Courier New so any missing glyph would show as typewriter type – none did. Ő ű render with the double acute at 44 px (caption) and 116 px (cardboard title). PASS.
- 2026-10-21 – **Timing estimates before real VO:** Hungarian syllables = vowels, so VO length is estimated from the exact script text (calm 4.6 syl/s). Phase 2 animatic uses these; Phase 4 replaces them with measured durations.

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
