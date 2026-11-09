# SFX credits and licenses

Every sound in the film is public domain (CC0) or synthesized for this project. **No attribution is required for any of them**, nothing was paid for, and no account was used. There is no music anywhere.

Built by `scripts/build-sfx.mjs` (`npm run sfx`) into `public/sfx/`. Overhauled on 2026-10-22: real foley recordings replaced the synthetic clock ticks, crickets, pen hiss, countdown ticks, drip, peel, rewind and room tone.

## BigSoundBank – Joseph Sardin (CC0 1.0, public domain)

License page: https://bigsoundbank.com/license.html. Each sound's page says "CC0 (public domain): Free and royalty-free"; this was checked for every file at download, and the page lines are kept in `audio/sfx/sources/bigsoundbank/_index.tsv`. Downloads need no account. Credit is optional; if wanted: "Additional sounds: Joseph SARDIN – BigSoundBank.com".

| ID | Title | URL | Used for |
|---|---|---|---|
| 2454 | Body fall #3 | https://bigsoundbank.com/body-fall-3-s2454.html | thud: S01 hook and S04 fall (same file) |
| 2456 | Body fall #5 | https://bigsoundbank.com/body-fall-5-s2456.html | thud_heavy (S10), layered with 2454 |
| 0373 | feet (slipper on floor) | https://bigsoundbank.com/feet-slipper-on-floor-s0373.html | Mari's steps (6 takes), the same takes through the floor (S09), the slip scuff |
| 1383 | Drops, metal sink | https://bigsoundbank.com/drops-metal-sink-s1383.html | the dripping tap (4 takes) |
| 1796 | Whoosh #4 | https://bigsoundbank.com/whoosh-4-s1796.html | towel throw; reversed for the alert travelling to the phone |
| 1799 | Whoosh #6 | https://bigsoundbank.com/whoosh-6-s1799.html | the slip |
| 1800 | Whoosh #7 | https://bigsoundbank.com/whoosh-7-s1800.html | the device sliding in; team members sliding into the row |
| 0567 | Cassette Player: Rewind and End | https://bigsoundbank.com/cassette-player-rewind-and-end-s0567.html | the rewind (button, motor, stop) |
| 1410 | Closed book #1 | https://bigsoundbank.com/closed-book-1-s1410.html | the "2028" stamp |
| 1411 | Closed book #2 | https://bigsoundbank.com/closed-book-2-s1411.html | the device landing; the finale device |
| 0299 | Adhesive tape #3 | https://bigsoundbank.com/adhesive-tape-3-s0299.html | the camera peeling off like a sticker |
| 0630 | Plastic cup falling | https://bigsoundbank.com/plastic-cup-falling-s0630.html | the camera clattering off-screen |
| 1251 | News Paper, Manipulations | https://bigsoundbank.com/news-paper-manipulations-s1251.html | the house assembling from paper; paper slide transitions |
| 0164 | Turned Page | https://bigsoundbank.com/turned-page-s0164.html | page flips; labels being tacked on; tagline scraps |
| 2214 | Pages that turn #7 | https://bigsoundbank.com/pages-that-turn-7-s2214.html | the S02 paper flap |
| 0362 | Great Page that Turns #1 | https://bigsoundbank.com/great-page-that-turns-1-s0362.html | the pop-up book opening |
| 3233 | Pencil #2 | https://bigsoundbank.com/pencil-2-s3233.html | the seismograph pen jumping on the fall spike |
| 0023 | Mobile phone vibrator #2 | https://bigsoundbank.com/mobile-phone-vibrator-2-s0023.html | Anna's phone |
| 0666 | Chair | https://bigsoundbank.com/chair-s0666.html | Anna's chair |
| 0445 | Keys in a hand | https://bigsoundbank.com/keys-in-a-hand-s0445.html | Anna's keys |
| 1702 | Apartment Door, Opening #1 | https://bigsoundbank.com/apartment-door-opening-1-s1702.html | the door off-screen (S13) |
| 1704 | Apartment Door, Closing #1 | https://bigsoundbank.com/apartment-door-closing-1-s1704.html | the door off-screen (S13) |
| 0013 | Cloth | https://bigsoundbank.com/cloth-s0013.html | Mari's hand lifting; Mari helped up |
| 2458 | Sound Atmosphere in a House | https://bigsoundbank.com/sound-atmosphere-in-a-house-s2458.html | room tone (bathroom, house, night) |
| 0080 | Paris Apartment. Closed Window. | https://bigsoundbank.com/paris-apartment-closed-window-s0080.html | room tone at Anna's office (S12) |

Other files in `audio/sfx/sources/bigsoundbank/` were downloaded as candidates (same license) and are not in the film.

## Kenney (kenney.nl) – CC0 1.0

| Pack | URL | Used for |
|---|---|---|
| Impact Sounds | https://kenney.nl/assets/impact-sounds | towel_flop (impactSoft_medium_000), snap (impactWood_light_000) |
| RPG Audio | https://kenney.nl/assets/rpg-audio | towel_whoosh + towel_flop (cloth1, cloth2), lid_lift (cloth3), book_open (bookOpen), pop (bookFlip3) |
| Interface Sounds | https://kenney.nl/assets/interface-sounds | snap (click_001) |

License files are kept with the sources in `audio/sfx/sources/kenney-*/License.txt`.

## Synthesized here (ffmpeg, no third-party material)

- **chime**: two sine tones, E5 then A5, each with an exponential decay, as the brief specifies.
- the low "body" sweep under thud, thud_heavy and stamp.

## Rejected / not used

- Freesound: downloads need an account, so not used without Kaszti's OK.
- Mixkit: the license text could not be verified (the page renders client-side), so not used.
- BigSoundBank "Chimes" and notification tones: too musical for a film with no music.
