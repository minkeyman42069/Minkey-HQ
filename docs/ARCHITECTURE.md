# Architecture

The RBT Trail is a **single-page static game** with a modular agent layer. Everything ships as plain HTML/JS — no framework, no backend.

## Runtime flow

```
index.html
  ├── loads game/trail.bundle.js  (IIFE → window.Trail)
  ├── inline BANK + encounter engine
  └── onclick handlers call Trail.emit() hooks + legacy globals
```

1. `game/bootstrap.js` imports `src/core/kernel.js` and exposes `window.Trail`.
2. The kernel wires the ten-agent staff team to a shared event bus.
3. `index.html` owns run state (`RUN`, `ENC`), rendering (`RENDER`), and the question encounter loop.
4. Agents react to hooks (`answer:correct`, `hazard:gust`, `draft:offer`, etc.) and return deltas.

## Agents (`src/agents/`)

| Agent | File | Responsibility |
|-------|------|----------------|
| **Boon Architect** | `boon-architect.js` | Boon catalog, duos, draft weighting, hook-driven effects |
| **Hazard Warden** | `hazard-warden.js` | Node factories, bestiary, tier combat table (`TIER_COMBAT`), act scaling |
| **Trail Scholar** | `trail-scholar.js` | TCO domains, Leitner scheduler, question types |
| **Mountain Economy** | `mountain-economy.js` | Weather, relics, stamina/threat tuning |
| **Expedition Director** | `expedition-director.js` | Route assembly across acts |
| **Atlas Artisan** | `atlas-artisan.js` | UI tokens, screen copy, codex tiers, menu stats |
| **Summit Sage** | `summit-sage.js` | Study coach — domain readiness, mastery analytics, review planning (pure; surfaces as "The Sage's counsel" on the debrief) |
| **Cairn Keeper** | `cairn-keeper.js` | Trail tales — the deck of narrative choice encounters met at story cairns (pure; draws and resolves deterministically from the run rng) |
| **Trail Chronicler** | `trail-chronicler.js` | Passive hook telemetry into a capped ring buffer (never mutates ctx) |
| **Sandbox Steward** | `sandbox-steward.js` | Deterministic control surface: spawn pitches, preview drafts, simulate climbs through the real bus |

**Summit Sage**, **Cairn Keeper**, and **Sandbox Steward** are pure helper agents (empty `register`), and **Trail Chronicler** only records hooks (its handlers always return `{}`) — none of them mutate a live climb through the bus. The Cairn Keeper's tale effects are applied by the engine after an explicit player choice, never as a hook side effect.

Core wiring lives in `src/core/`:

- `agent-bus.js` — pub/sub hook dispatcher
- `kernel.js` — agent registration and `Trail.emit()`
- `config.js` — shared tuning constants
- `climb-engine.js` — **the one combat truth** (see below)

## Climb Engine — one combat truth, four frontends

`src/core/climb-engine.js` owns every point of combat math: encounter state
(`blankRun` / `blankEnc` / `entryThreat`), answer resolution
(`resolveAnswer` — streaks, shields, phase releases, crux, streak-gate
knockbacks, every boon hook), threat and strikes (`raiseThreat` with oath /
relic mitigation), passive hazard behavior (`tickDrift` — rise, gusts,
drain, spikes), stamina and falls (`addStamina` — last-legs, ice-axe
arrest), pitch clears (`clearPitch`), tale effects (`applyTaleFx`), a
single-pitch simulator (`simulatePitchNode`), and a full headless climb
(`playClimb`) that walks a real route end-to-end through the real bus.

The engine never touches the DOM. It mutates run/enc state and appends
presentation events (`{t:'strike'|'shield'|'phase'|'fell'|…}`) that each
frontend maps to its own rendering:

| Frontend | How it drives the engine |
|----------|--------------------------|
| **Browser** (`index.html`) | wraps `resolveAnswer` / `tickDrift` / `raiseThreat` / `addStamina`, maps events to DOM, audio, and banners |
| **Staff Sandbox** (Pitch Lab, Route Setter grading) | Sandbox Steward's `simulatePitch` delegates to `simulatePitchNode` |
| **Balance gate** (`npm run balance`, CI) | Monte-Carlos `playClimb` — real climbs, not a parallel model |
| **Terminal client** (`npm run play`) | readline frontend over the same primitives, with a chess-clock timer |

All randomness is injected, so a seeded climb is identical in every
frontend. The refactor that introduced the engine was verified
behavior-identical against the pre-refactor browser: a seeded 110-question
full-summit trajectory (every stamina/threat/streak/draft value after every
answer) matches byte-for-byte.

## Build pipeline

```
src/**/*.js  +  game/bootstrap.js
        ↓  npm run build:trail  (esbuild IIFE)
game/trail.bundle.js
```

`trail.bundle.js` is committed so GitHub Pages and raw `index.html` work without a build step.

## Question bank

- **Source:** `data/questions.json`
- **Runtime:** embedded `BANK` array inside `index.html`
- **Sync:** `npm run inject-bank.mjs` (`npm run sync`)
- **CI:** `npm run sync-check` fails if bank and HTML drift

## Screens (`index.html`)

| Screen ID | Purpose |
|-----------|---------|
| `menu` | Trailhead — climb CTA, Today's Ridge, oaths, Board Sim, Bestiary, badges |
| `map` | Route map between encounters |
| `encounter` | Question + hazard chrome |
| `ledge` | Boon draft camp |
| `exam` | Board simulation |
| `debrief` | Run summary + trail-log export |
| `bestiary` | Hazard codex |

## Staff Sandbox

`sandbox/index.html` is an interactive control room for the whole staff team. It
loads `game/trail.bundle.js` and drives the **real** agent bus, so nothing in it
can drift from actual gameplay. Powered by the Sandbox Steward, Summit Sage, and
Trail Chronicler:

| Panel | Staff exercised |
|-------|-----------------|
| Staff Team | roster gallery from `Trail.meta` |
| Pitch Lab | Hazard Warden node + Boon Architect loadout + Mountain Economy → Steward `simulatePitch` |
| Boons | Boon Architect catalog, live duos, seeded draft preview |
| Route | Expedition Director `buildRoute` across three acts |
| Study & Coach | Trail Scholar Leitner scheduler → Summit Sage readiness analytics |
| Route Setter | Author a named line, grade it via Steward Monte Carlo (alpine grades F–ED), export a `LINE1:` code the trailhead import accepts |
| Bestiary | Hazard Warden registry, scaled per act |
| Bus Log | Trail Chronicler live hook telemetry |

Everything is deterministic from the shared **seed** control. Run it with
`npm run sandbox` (port 4175, then open `/sandbox/`).

## Balance & quality tooling

- `scripts/simulate-balance.mjs` — Monte Carlo climb outcomes; since the
  engine unification every simulated climb is played by
  `climb-engine.playClimb` through the real hook bus (the only remaining
  model assumptions are the player ones: accuracy, timeout rate, and
  `ANSWER_SECONDS` — shared with the Route Setter's grader)
- `scripts/simulate-hazards.mjs` — per-hazard Monte Carlo at 50ms tick fidelity (gusts, spikes, decay, shields, streak gates); ranks every enemy within its tier and flags outliers. Deliberately keeps its own tick-level model for intra-tier ranking resolution
- `scripts/play-climb.mjs` — the terminal expedition client (`npm run play`)
- `scripts/quality-audit.mjs` — BACB-aligned question scoring
- `playground/index.html` — browse flagged questions visually
- `sandbox/index.html` — interactive staff-team control room (`npm run sandbox`)

## Expedition systems (`expedition-director.js`)

- **Oaths** — pre-run modifiers (Swift Line, Iron Lungs, Scholar's Vow)
- **Today's Ridge** — date-seeded RNG for a shared daily route
- **Achievements** — persistent badges in `META.achievements`
- **Spoils drafts** — ~42% chance of a boon pick after hard pitch clears (Act II+)

## Deploy

GitHub Actions publishes the repo root to GitHub Pages on every push to `main`. The playable URL is in the README.
