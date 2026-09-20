# Key Quest

A keyboard-learning game for kids. A word appears, the matching key glows on an
on-screen keyboard that carries both English and Hebrew legends, and pressing the
right key makes your fighter strike. Press the wrong one and the enemy strikes back.

Built with my seven-year-old, whose idea this was.

## What's in it

- **30 missions** — home row, top row, bottom row, space, Shift and capitals,
  number row, symbols, long words, sentences, speed drills, passwords, double
  letters, one hand at a time, punctuation, brackets, the b/d/p/q twins, place
  names, email and web, and a final exam
- **Dual-legend keyboard** — English and Hebrew on every keycap, matching a
  physical Israeli keyboard. Hebrew legends toggle off in the header
- **36 playable fighters** with different hearts and coin rates. Twenty-four are
  bought, on a ladder from 100 to 20,000 coins; the other twelve cannot be
  bought at any price and open only by clearing missions, mastering keys, typing
  fast or accurately, keeping a streak, meeting every enemy or fighting in every
  arena. Your fighter stands in the Play bar and is tapped to swap;
  the full roster is a sheet with tabs and a search, so the menu is the same
  height at six fighters or sixty
- **20 named enemies** that appear as the missions get harder, recorded in a
  bestiary — the ones you have not met yet are shadows
- **Stars and ranks** — three stars for a flawless mission, XP toward nine ranks
- **Voice pack** — record your own voice for each key, in Settings → Your own
  voice. Grouped into Letters / Numbers / Symbols / Keys with a filter and a
  "not recorded" toggle, so it stays usable however many keys there are. Falls
  back to speech synthesis, which says the letter, pauses, then "D for dog." 
- **Combat sound** — synthesised swing, impact and death effects, layered from
  an oscillator sweep and a band-passed noise burst. No audio files. The
  header's Sound button mutes them separately from the letter voice
- **Sixteen environments** — neon city, moonlit wood, crystal cave, sun dunes,
  frost peaks, orbit deck, ashfall, keep hall, sunken reef, sky temple,
  scrapyard, neon dojo, hollow wood, circuit board and two more. A mission walks
  to the next one; fireflies, snow, embers, bubbles and wisps move
- **Hints that fade** — the on-screen keyboard lights the target key only while
  the key is still being learned; once it is mastered nothing lights up and the
  child has to find it. A miss or a few seconds of hesitation brings the hint
  straight back, and on a touch screen it always shows, because there the
  on-screen keyboard is the input
- **Per-key mastery** — every press is scored on accuracy *and* time to find the
  key. Target practice builds a drill from the weakest keys and the ones never
  tried, and the Progress sheet shows a keyboard heat map
- **Dailies, a streak and achievements** — three date-seeded missions a day, a
  day streak, twenty-two achievements that are pure functions of lifetime counters
- **Settings** — voice, game sound, Hebrew legends, the computer voice and the
  arena, all behind one button
- **Free practice** — type any word or password and the keys light up for it

## Running it

Static site, no build step:

```bash
cd keyquest        # the repo root
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from the filesystem works too, though some browsers
restrict microphone access there — use the local server for the voice pack.

## Tests

No dependencies:

```bash
node tests/test-content.js
```

It loads the real `src/app.js` and compares every pair of lists that must
agree — lesson characters against the keyboard, against what the voice can
say, against the voice-pack tiles; sprites, shop items and defaults against
the tables they point into. See `tests/README.md`.

## Deploying

Vercel: import the repo, framework preset **Other**, leave build command empty and
output directory as the repo root.

## Structure

```
index.html           markup only
src/styles.css       all styling, themed with CSS custom properties
src/app.js           game logic, sprite animation, keyboard model
assets/atlas.png     sprite atlas, 44x32 frames, 10 animation rows
assets/favicon.svg   tab icon, a keycap
assets/icon-180.png  the same icon for Apple home screens
tests/               node, no dependencies
```

The atlas rows are, in order: soldier idle/walk/attack/hurt/death, then orc
idle/walk/attack/hurt/death. Extra fighters and enemies are canvas hue-rotate
recolours of those two sprites.

## Saved data

Progress, coins, per-key mastery and settings live in `localStorage` under
`keyquest`.
Recorded voice clips live in IndexedDB under `keyquest-voice`. Both are per-browser.

## Licence and credits

Copyright (c) 2026 Benny Ankri. All rights reserved — see [LICENSE](LICENSE).

Character sprites are from the **Tiny RPG Character Asset Pack 01 (Free Soldier
& Orc)** and are *not* covered by that licence; they remain their author's
property under the pack's own terms, and are credited in the game and here.
Anyone reusing this project must obtain the pack from its author and comply
with its licence separately.

The Rubik typeface comes from Google Fonts under the SIL Open Font License.
