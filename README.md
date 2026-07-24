# The RBT Trail

Roguelike spaced-repetition study game for the **RBT exam** (3rd ed. Test Content Outline). Draft boons, survive hazards, and lock in ABA concepts on the climb.

> Unofficial study tool — not affiliated with the BACB.

## Play online

**[Play the game →](https://minkeyman42069.github.io/Minkey-HQ/)**

No install required. Works on phone and desktop.

> **Hosting setup (repo owner):** In **Settings → Pages → Build and deployment**, set **Source: GitHub Actions** (not “Deploy from a branch”). Pushes to `main` run the `Deploy GitHub Pages` workflow automatically.
>
> If you see `Get Pages site failed` on an old Actions run, that was from before Pages was enabled — ignore those. Re-run only the latest workflow, or push a new commit to `main`.

## Play locally

```bash
git clone https://github.com/minkeyman42069/Minkey-HQ.git
cd Minkey-HQ
npm run dev
```

Open **http://localhost:4173**

You can also open `index.html` directly in a browser — works offline after the first load.

## What you get

| Mode | What it does |
|------|----------------|
| **Climb the mountain** | Full roguelike run with Leitner scheduling, boon drafts, hazard encounters, and waymark stories along the route |
| **Today's Ridge** | Daily seeded route — same line for every climber each day |
| **Board Sim** | 40-question mock exam weighted to TCO domains |
| **Bestiary** | Hazard reference + duo synergy codex |
| **Terminal climb** | `npm run play` — the whole game in your terminal, same engine as the browser |

On the route you'll pass **waymarks** — short story encounters with a real mechanical choice (wager stamina on a ghost rope, trade breath for an easier pitch, tend an unmarked grave). Every outcome is deterministic from the run seed, so Today's Ridge tells every climber the same tales. After a climb, the **Summit Sage** reads your ledger on the debrief screen: which exam domain to focus, where accuracy dipped, and which concepts to open the next climb with. And the mountain remembers: every miss becomes a **loose stone** in your lifetime ledger. The trailhead shows your mastery across all six exam domains, **Morning Review** drills exactly the concepts you keep missing (each clean answer promotes them a Leitner tier), and the named Gatekeepers pick their subject from everything you have ever gotten wrong — not just today.

The mountain also keeps a record of *you*: a **daily study streak** at the trailhead (the proven way to actually show up), a **summit register** signing every top with its grade, weather, and date, and a **living bestiary** that tracks how many times you have faced and cleared each hazard. After each run you receive an `RBT5:…` trail-log code. Paste it on the trailhead to import concept tiers from finished climbs.

The sandbox's **Route Setter** lets you author a named line, grade it (alpine F–ED via Monte Carlo through the real agent bus), and cut a `LINE1:…` code. Anyone who pastes that code at the trailhead climbs your set route — summiting an imported line earns the **First Ascent** badge.

## Repo layout

```
index.html                 # Deployable game shell (UI, engine, embedded question bank)
game/
  bootstrap.js             # Agent kernel entry + legacy global bridge
  trail.bundle.js          # Built IIFE bundle (commit this — no build step to play)
data/
  questions.json           # Question bank source of truth (433 items)
  quality-report.json      # Latest audit output (generated)
  balance-report.json      # Balance sim output (generated)
src/
  core/                    # Agent bus, kernel, shared config, climb engine
  agents/                  # Modular game systems / staff team (see docs/ARCHITECTURE.md)
playground/index.html      # Visual question-quality reviewer
sandbox/index.html         # Interactive staff-team control room (npm run sandbox)
scripts/                   # Bank tooling, balance sim, bundle build
docs/ARCHITECTURE.md       # How the codebase is organized
```

## Staff Sandbox

`npm run sandbox` opens an interactive control room for the game's full staff
team (ten modular agents). Spawn any hazard, build a loadout, and **simulate a
pitch through the real hook bus**; preview seeded boon drafts; assemble a
three-act route; run a Leitner study session and get coached by the Summit Sage;
and watch every hook fire in the Trail Chronicler bus log — all deterministic
from one seed. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#staff-sandbox).

**Where to read code**

- **Combat math (one source of truth)** → `src/core/climb-engine.js` — answer resolution, threat, strikes, drift, falls; the browser, sandbox, balance gate, and terminal client all run this same code
- **Gameplay flow & UI** → `index.html` (screens, rendering, audio, meta — presentation over the engine)
- **Boons, weather, hazards, scheduling** → `src/agents/`
- **Questions** → `data/questions.json` (synced into `index.html` via `npm run sync`)

## Development

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local game server (port 4173) |
| `npm run play` | Play a full climb in the terminal (`-- --seed N` for a set line, `-- --calm` untimed) |
| `npm run playground` | Quality reviewer (port 4174) |
| `npm run sandbox` | Staff-team control room (port 4175, open `/sandbox/`) |
| `npm run check` | Validate bank, sync, build bundle, verify trail |
| `npm run balance` | Run climb balance simulator |
| `npm run balance:hazards` | Per-hazard Monte Carlo — ranks every enemy within its tier |
| `npm run audit` | Score every question → `data/quality-report.json` |
| `npm run sync` | Inject `data/questions.json` into `index.html` |
| `npm run build:trail` | Rebuild `game/trail.bundle.js` from `src/` |
| `npm run refresh` | Full bank overhaul pipeline |

### Question bank workflow

```
data/questions.json     ← edit here
        ↓ npm run sync
index.html              ← embedded BANK (single-file deploy)
```

### Agent changes

If you edit anything under `src/`:

```bash
npm run build:trail
npm run verify:trail
```

Then commit both source and `game/trail.bundle.js`.

## Content sources

Question content aligns to:

- [RBT Test Content Outline (3rd ed.)](https://www.bacb.com/wp-content/uploads/2023/12/RBT-3rd-Edition-Test-Content-Outline-240903-a.pdf)
- [RBT Handbook sample items](https://www.bacb.com/wp-content/uploads/2025/08/RBTHandbook_260116-a.pdf)

## License

Study content is for personal exam prep. BACB trademarks belong to the BACB.
