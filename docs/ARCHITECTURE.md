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
| **Trail Scholar** | `trail-scholar.js` | TCO domains, Leitner scheduler, question types |
| **Mountain Economy** | `mountain-economy.js` | Weather, relics, stamina/threat tuning |
| **Expedition Director** | `expedition-director.js` | Route assembly across acts |
| **Atlas Artisan** | `atlas-artisan.js` | UI tokens, screen copy, codex tiers, menu stats |

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

## Question bank

- **Source:** `data/questions.json`
- **Runtime:** embedded `BANK` array inside `index.html`
- **Sync:** `npm run inject-bank.mjs` (`npm run sync`)
- **CI:** `npm run sync-check` fails if bank and HTML drift

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

## Balance & quality tooling

- `scripts/simulate-balance.mjs` — Monte Carlo climb outcomes
- `scripts/quality-audit.mjs` — BACB-aligned question scoring
- `playground/index.html` — browse flagged questions visually

## Deploy

GitHub Actions publishes the repo root to GitHub Pages on every push to `main`. The playable URL is in the README.
