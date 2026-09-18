# Tests

No dependencies, no install. From the repo root:

    node tests/test-content.js

It loads the real `src/app.js` inside a Node VM with a small DOM stub
(`dom-stub.js`) and checks the shipped tables, not a copy of them — a copy
would be a second list, and two lists maintained by hand always drift.

## What it guards

Every check compares **two lists that must agree**:

| List | must agree with |
|---|---|
| characters the lessons ask for | keys that exist on the keyboard |
| characters the lessons ask for | `NAMES` / `LW` (what the voice says) |
| symbols the lessons ask for | `VTOKENS` (voice-pack tiles) |
| `FIGHTERS` / `BESTIARY` sprite rows | rows that exist in `BASE` |
| shop arena skins | palettes in `ARENA` |
| `DEF.owned` | things that actually exist |
| Hebrew legends, finger zones, shifted symbols | real keys |

This suite exists because of a real bug: the Symbols mission shipped asking
for `! ? @ # $ % & *` while `NAMES` still held only the six control keys, so
the game asked a child to find a key and said nothing. `LESSONS` and `NAMES`
were written months apart and nothing ever compared them. `VTOKENS` is now
derived from `LESSONS` rather than hand-kept, so that particular pair cannot
drift again.

A check that cannot fail is worse than no check. Before trusting a new one,
break the thing it guards and confirm it goes red.
