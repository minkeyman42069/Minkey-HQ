# Gotchas — read before every change

## Question bank sync (most common CI failure)

- `data/questions.json` is **source of truth**
- Runtime uses embedded `BANK` in `index.html`
- After editing JSON: **`npm run sync`** then **`npm run sync-check`**
- CI runs sync-check — drift = red build

## Stale bundle (second most common)

- `game/trail.bundle.js` is **generated** from `src/`
- After editing `src/agents/` or `src/core/`: **`npm run build:trail`**
- **Commit both** source and bundle in the same PR
- Browser plays the bundle, not raw `src/`

## Stochastic reports — don't commit noise

- `npm run balance` → overwrites `data/balance-report.json` (randomized sim)
- `npm run audit` → overwrites `data/quality-report.json`
- Only commit these if you **intentionally** changed tuning/content and want the new baseline

## No npm dependencies

- `package.json` has zero dependencies
- `npm install` is a no-op (may create untracked package-lock.json — ignore it)
- First `npm run dev` fetches `serve` via npx (needs network once)

## Agent bus vs direct API

- Only **Boon Architect** and **Atlas Artisan** call `.register(bus)`
- Other agents are invoked via `Trail.agents.*.api` directly
- New hook effects: register in agent + emit from `index.html`

## Legacy globals

- `game/bootstrap.js` bridges `window.Trail` to legacy globals (`BOONS`, `SCHED`, etc.)
- Don't remove globals without checking `index.html` references

## BACB compliance

- Game is **unofficial** study tool — keep disclaimer in README
- Don't claim BACB affiliation
- Question content should align to 3rd ed. TCO, not outdated 2nd ed. tasks

## Trail-log codes

- `RBT5:…` export/import for concept tiers between runs
- Changing scheduler tiers affects import compatibility — test round-trip

## GitHub Pages deploy

- Pushes to `main` deploy repo root via `.github/workflows/pages.yml`
- `index.html` must be self-contained (synced bank + committed bundle)
