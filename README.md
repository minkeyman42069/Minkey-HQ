# The RBT Trail

A roguelike spaced-repetition study game for the **RBT exam** (3rd ed. Test Content Outline). Climb the mountain, draft boons, survive encounters, and lock in ABA concepts.

> Unofficial study tool — not affiliated with the BACB.

## Play

```bash
npm run dev
# → http://localhost:4173
```

Open `index.html` directly — works offline after first load.

## Modes

| Mode | What it does |
|------|----------------|
| **Set out** | Full roguelike climb with Leitner scheduling |
| **Daily Ascent** | Same route, seeded daily |
| **Board Simulation** | 40-question mock exam weighted to TCO domains |
| **The Bestiary** | Hazard reference |
| **Expedition Mods** | Weather, relics, shrine events |

## Question quality playground

Cursor can audit and overhaul the question bank against BACB item-writing standards (scenario stems, 4 options, teaching explanations).

```bash
npm run audit        # score every question → data/quality-report.json
npm run playground   # → http://localhost:4174/playground/
npm run overhaul     # apply core quality transforms
npm run apply-batch  # apply curated scenario rewrites
npm run refresh      # overhaul + batch + audit + sync + validate
```

### Quality rubric checks

- Scenario-based stems (RBT/client/learner context)
- Exactly 4 parallel answer options (matches BACB exam format)
- Plausible distractors from the same concept family
- Explanations that teach *why* — not just label the answer
- BACB terminology (`access to tangibles`, `escape/avoidance`, MSWO, DRO, etc.)
- `dom` tags on every question (TCO domains A–F)
- Duplicate stem detection

### Bank workflow

```
data/questions.json     ← edit here (source of truth)
        ↓ npm run sync
index.html              ← game loads BANK (single-file deploy)
```

## Trail-log codes

After each run you get an `RBT5:…` code with a checksum. Paste it on the menu to resume, or paste it to Cursor to generate weak-spot question batches.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run validate` | Structural integrity checks |
| `npm run analyze` | Domain coverage vs. exam blueprint |
| `npm run audit` | Full quality scoring + flags |
| `npm run check` | validate + analyze |

## Content sources

Question overhauls align to:

- [RBT Test Content Outline (3rd ed.)](https://www.bacb.com/wp-content/uploads/2023/12/RBT-3rd-Edition-Test-Content-Outline-240903-a.pdf)
- [RBT Handbook sample items](https://www.bacb.com/wp-content/uploads/2025/08/RBTHandbook_260116-a.pdf) (retired BACB questions included)

## Project layout

```
index.html                    # deployable single-file game
data/
  questions.json              # question bank (edit here)
  quality-report.json         # latest audit (generated)
  overhaul-batch2.json        # curated rewrites
playground/index.html         # visual quality reviewer
scripts/
  lib/load-bank.mjs           # shared loader
  lib/quality-rubric.mjs      # BACB-aligned scoring
  quality-audit.mjs
  overhaul-bank.mjs
  apply-overhaul-batch.mjs
  inject-bank.mjs
```
