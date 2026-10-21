# REZON video – production log

Owner/approver: Kaszti. Source of truth: `SCRIPT.md`. Brief: `CLAUDE.md`.
Deadline: Mon 2026-10-26 23:59 (upload before 18:00). Final render: Sun 2026-10-25 evening.

## Phase tracker

| Phase | Status | Approved |
|---|---|---|
| 0 Setup | done, awaiting approval | – |
| 1 Style test (kill test) | – | – |
| 2 Animatic (960×540, silent + captions) | – | – |
| 3 Full animation | – | – |
| 4 Audio pass (VO + SFX + master) | – | – |
| 5 Team pass (heads, lines, mouth flaps) | – | – |
| 6 Final render + QC | – | – |

## Approvals

- 2026-10-21 – Kaszti: install official Remotion agent skill `remotion-dev/skills`, **project-only** (no global install). Done.

## Decisions

- 2026-10-21 – **Stack pinned:** Remotion 4.0.537 (exact versions, all `@remotion/*` matched), React 19.2.3, TypeScript 5.9.3. Node v24.13.0 (LTS line). Packages: `@remotion/google-fonts`, `transitions`, `media`, `media-utils`, `noise`.
- 2026-10-21 – **Scaffold:** official `create-video --blank --no-tailwind`, generated in scratch then moved into this folder (folder was non-empty).
- 2026-10-21 – **Git:** `git init` local only. No remote. Never push.
- 2026-10-21 – **Font:** Rubik via `@remotion/google-fonts`, weights 500 (captions) / 700 (tags) / 900 (titles), subsets `latin` + `latin-ext`. latin-ext range U+0100–02BA covers Ő/ő/Ű/ű (U+0150/0151/0170/0171).
- 2026-10-21 – **Glyph test:** `out/phase0/font_test.png`. Fallback font deliberately set to Courier New so any missing glyph would show as typewriter type – none did. Ő ű render with the double acute at 44 px (caption) and 116 px (cardboard title). PASS.
- 2026-10-21 – **Timing estimates before real VO:** Hungarian syllables = vowels, so VO length is estimated from the exact script text (calm 4.6 syl/s). Phase 2 animatic uses these; Phase 4 replaces them with measured durations.

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

1. Remotion license grey area: OK to proceed as an individual (recommended), or email Remotion first?
2. Team: names/roles for members 3–4 and all four lines (`[ ]` placeholders stay visible until filled).
3. Viktor to OK the technical claims (SCRIPT.md, bottom).
4. VO recording date. **Recommendation:** record a quick phone scratch take of all lines early, so the timing locks before Phase 3, then the clean take for Phase 4.
5. S13 "soft relief beat (no music)": plan = non-musical SFX only (door, a soft exhale/paper settle). No tonal sting, to stay clear of the "no background music" rule.
6. Phase 4 word-sync method for captions: (a) silence detection + syllable-weighted timing, no installs (default), or (b) whisper.cpp word timestamps (needs an install plus a ~1.5 GB model; ask first).

## Risks and mitigations

- **Render time:** full-frame `feTurbulence` grain on every layer is expensive. Mitigation: bake the code-generated textures to PNG once and reuse them (still deterministic, no AI images).
- **Font fetched from Google at render time:** before the final render, switch to a local copy of Rubik (SIL OFL, redistribution allowed) so an offline or failed fetch cannot break the render.
- **Black first frame:** S01 opens black, so an upload thumbnail would be black. Fine for a form upload; flag if the platform shows thumbnails.
