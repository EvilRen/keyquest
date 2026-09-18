# Key Quest

A keyboard-learning game for kids. A word appears, the matching key glows on an
on-screen keyboard that carries both English and Hebrew legends, and pressing the
right key makes your fighter strike. Press the wrong one and the enemy strikes back.

Built with my seven-year-old, whose idea this was.

## What's in it

- **16 missions** — home row, top row, bottom row, space, Shift and capitals,
  number row, symbols, long words, sentences, speed drills, passwords
- **Dual-legend keyboard** — English and Hebrew on every keycap, matching a
  physical Israeli keyboard. Hebrew legends toggle off in the header
- **6 playable fighters** with different hearts and coin rates, unlocked with coins
- **10 named enemies** that appear as the missions get harder
- **Stars and ranks** — three stars for a flawless mission, XP toward nine ranks
- **Voice pack** — record your own voice for each letter; falls back to the
  browser's speech synthesis, which says "D. D for dog." for clarity
- **Combat sound** — synthesised swing, impact and death effects, layered from
  an oscillator sweep and a band-passed noise burst. No audio files. The
  header's Sound button mutes them separately from the letter voice
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
index.html        markup only
src/styles.css    all styling, themed with CSS custom properties
src/app.js        game logic, sprite animation, keyboard model
assets/atlas.png  sprite atlas, 44x32 frames, 10 animation rows
```

The atlas rows are, in order: soldier idle/walk/attack/hurt/death, then orc
idle/walk/attack/hurt/death. Extra fighters and enemies are canvas hue-rotate
recolours of those two sprites.

## Saved data

Progress, coins and settings live in `localStorage` under `keyquest`.
Recorded voice clips live in IndexedDB under `keyquest-voice`. Both are per-browser.

## Credits

Character sprites: Tiny RPG Character Asset Pack 01 (Free Soldier & Orc).
Check the pack's own licence file for attribution terms before publishing.
