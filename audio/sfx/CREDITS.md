# SFX credits and licenses

Every sound in the film is either public domain (CC0) or synthesized for this project. **No attribution is required for any of them**, nothing was paid for, and no account was used. There is no music anywhere.

Built by `scripts/build-sfx.mjs` (`npm run sfx`) into `public/sfx/`.

## Downloaded (CC0 1.0 – public domain)

| Pack | Author | URL | License | Used for |
|---|---|---|---|---|
| Impact Sounds | Kenney (kenney.nl) | https://kenney.nl/assets/impact-sounds | CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/) | thud, thud_heavy (impactSoft_heavy_000), steps (footstep_carpet/concrete_000–003), stamp (impactPunch_medium_000), towel_flop (impactSoft_medium_000), camera_fall (impactPlate_light_000), snap (impactWood_light_000); audition thud_B, thud_C |
| RPG Audio | Kenney | https://kenney.nl/assets/rpg-audio | CC0 1.0 | towel_whoosh (cloth1), towel_flop (cloth2), stamp (cloth2), lid_lift (cloth3), tag_pop (cloth4), click (metalLatch), land (bookPlace1), settle (bookPlace3), page_flip (bookFlip1), flap (bookFlip2), pop (bookFlip3), book_open (bookOpen + bookFlip2), keys (handleCoins), creak (creak1), door (doorOpen_1 + doorClose_1); audition step_B (footstep00) |
| Interface Sounds | Kenney | https://kenney.nl/assets/interface-sounds | CC0 1.0 | tag_pop (click_003), snap (click_001), count_tick (tick_002); audition chime_B (confirmation_002), chime_C (confirmation_004) |

License files are kept with the sources in `audio/sfx/sources/kenney-*/License.txt`.

## Synthesized here (ffmpeg, no third-party material)

room_tone, drip, slip (slipper squeak), clock_tick, clock_fast, crickets, rewind, peel, paper_slide, paper_slide_short, pen_scratch, **chime** (two sine tones E5 → A5 with exponential decay, as the brief specifies), phone_buzz, and the low "body" layer under both thuds. Audition phone_buzz_B.

## Rejected / not used

- Freesound: downloads need an account → not used without Kaszti's OK.
- Mixkit: license text could not be verified (page renders client-side) → not used.
