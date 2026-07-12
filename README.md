# The RBT Trail

A roguelike spaced-repetition study game for the **RBT exam** (3rd ed. Test Content Outline). Climb the mountain, draft boons, survive encounters, and lock in ABA concepts.

> Unofficial study tool — not affiliated with the BACB.

## Play

Open `index.html` in any browser, or run a local server:

```bash
npm run dev
# → http://localhost:4173
```

Works offline after first load. Add to home screen on mobile via the PWA manifest.

## Modes

| Mode | What it does |
|------|----------------|
| **Set out** | Full roguelike climb with Leitner scheduling |
| **Daily Ascent** | Same route, seeded daily (Wordle-style) |
| **Board Simulation** | 40-question mock exam weighted to TCO domains |
| **The Bestiary** | Reference for every hazard on the mountain |
| **Expedition Mods** | Weather, relics, shrine events |

## Trail-log codes

After each run you get an `RBT5:…` code. Paste it on the menu to resume progress, or paste it to an AI tutor to generate questions for your weak spots.

## Dev tooling (Cursor-ready)

```bash
npm run validate   # lint the question BANK
npm run analyze    # domain coverage vs. exam blueprint
npm run check      # both
```

### Project layout

```
index.html              # complete single-file game (deploy target)
manifest.json           # PWA install metadata
scripts/
  validate-bank.mjs     # CI validation for BANK integrity
  analyze-bank.mjs      # coverage stats by TCO domain
.github/workflows/ci.yml
```

### Extending content

Questions live in the `BANK` array inside `index.html`. Each card supports:

- `cat` — study category
- `dom` — official TCO domain (`A`–`F`)
- `type` — `mc` (default), `odd`, or `tf`
- `q`, `a`, `c`, `e` — prompt, choices, correct index, explanation

IDs are assigned at runtime; run `npm run validate` after edits.

## What Cursor can do next

- Split `BANK` into `data/questions.json` for easier content PRs
- Add Vitest for Leitner scheduler + trail-log round-trip tests
- Generate targeted question batches from your trail-log weak spots
- Wire GitHub Pages deploy on merge to `main`
