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
2. The kernel registers six agents on a shared event bus.
3. `index.html` owns run state (`RUN`, `ENC`), rendering (`RENDER`), and the question encounter loop.
4. Agents react to hooks (`answer:correct`, `hazard:gust`, `draft:offer`, etc.) and return deltas.

## Agents (`src/agents/`)

| Agent | File | Responsibility |
|-------|------|----------------|
| **Boon Architect** | `boon-architect.js` | Boon catalog, duos, draft weighting, hook-driven effects |
| **Hazard Warden** | `hazard-warden.js` | Node factories, bestiary, act scaling |
| **Trail Scholar** | `trail-scholar.js` | TCO domains, adaptive SM-2-lite spaced-repetition scheduler, question types |
| **Mountain Economy** | `mountain-economy.js` | Weather, relics, stamina/threat tuning |
| **Expedition Director** | `expedition-director.js` | Route assembly across acts |
| **Atlas Artisan** | `atlas-artisan.js` | UI tokens, screen copy, codex tiers, menu stats |
| **Summit Sage** | `summit-sage.js` | Study coach — domain readiness, mastery analytics, review planning (pure) |
| **Trail Chronicler** | `trail-chronicler.js` | Passive hook telemetry into a capped ring buffer (never mutates ctx) |
| **Sandbox Steward** | `sandbox-steward.js` | Deterministic control surface: spawn pitches, preview drafts, simulate climbs through the real bus |

The last three staff members are additive: **Summit Sage** and **Sandbox Steward** are pure helper agents (empty `register`), and **Trail Chronicler** only records hooks (its handlers always return `{}`), so none of them can change what a live climb does.

Core wiring lives in `src/core/`:

- `agent-bus.js` — pub/sub hook dispatcher
- `kernel.js` — agent registration and `Trail.emit()`
- `config.js` — shared tuning constants

## Build pipeline

```
src/**/*.js  +  game/bootstrap.js
        ↓  npm run build:trail  (esbuild IIFE)
game/trail.bundle.js
```

`trail.bundle.js` is committed so GitHub Pages and raw `index.html` work without a build step.

## Adaptive scheduler (Trail Scholar)

`createScheduler(config)` in `trail-scholar.js` keeps the `SCHED.pick(ids,last,run,rnd)` /
`SCHED.grade(id,correct,viaTimeout,run)` interface but upgrades the fixed Leitner boxes to an
**SM-2-lite** model. Each `run.prog[id]` gains `ease`, `nextDue` (in "questions seen" units),
`cstreak`, and `dom`. Tuning knobs live in `src/core/config.js` (`DUE_GAP`, `EASE_*`,
`PROMOTE_STREAK_FROM`, `INTERLEAVE_PENALTY`):

- **Spacing** — due/overdue items surface first; not-yet-due items are damped.
- **Per-item ease** — correct recalls lengthen intervals, lapses shorten them.
- **Lapse handling** — missing a board-ready concept drops it into relearning, not free-fall.
- **Gated promotion** — reaching Solid/Mastered needs 2 consecutive correct (no lucky-guess locks).
- **Interleaving** — items sharing the previous item's TCO domain are down-weighted.

The balance simulator (`scripts/lib/climb-balance.mjs`) is intentionally decoupled from the
scheduler, so these changes never affect `npm run balance`. Scheduler behavior is covered by
deterministic assertions in `scripts/verify-trail.mjs`.

## Question bank

- **Source:** `data/questions.json`
- **Runtime:** embedded `BANK` array inside `index.html`
- **Sync:** `npm run inject-bank.mjs` (`npm run sync`)
- **CI:** `npm run sync-check` fails if bank and HTML drift
- **Quality:** `npm run audit` scores every item and reports **TCO domain coverage** vs. the exam blueprint (`data/quality-report.json`)

## Screens (`index.html`)

| Screen ID | Purpose |
|-----------|---------|
| `menu` | Trailhead — climb CTA, Board Sim, Bestiary, import |
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
| Bestiary | Hazard Warden registry, scaled per act |
| Bus Log | Trail Chronicler live hook telemetry |

Everything is deterministic from the shared **seed** control. Run it with
`npm run sandbox` (port 4175, then open `/sandbox/`).

## Balance & quality tooling

- `scripts/simulate-balance.mjs` — Monte Carlo climb outcomes
- `scripts/quality-audit.mjs` — BACB-aligned question scoring
- `playground/index.html` — browse flagged questions visually
- `sandbox/index.html` — interactive staff-team control room (`npm run sandbox`)

## Deploy

GitHub Actions publishes the repo root to GitHub Pages on every push to `main`. The playable URL is in the README.
