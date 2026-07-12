# AGENTS.md

## Cursor Cloud specific instructions

**Product:** "The RBT Trail" — a single-page, offline-capable browser game (roguelike spaced-repetition study tool for the RBT exam). The whole game ships as `index.html`; there is no backend/database. Commands and layout are documented in `README.md`; scripts live in `package.json`.

**Runtime:** Pure Node.js ESM scripts (`scripts/*.mjs`) plus a static file server. CI pins Node 20; the code also runs fine on the Node 22 present in this environment. There are **no npm dependencies** (`package.json` has no `dependencies`/`devDependencies`), so `npm install` is effectively a no-op that only creates an untracked `package-lock.json`.

**Run / build / check (see `package.json` scripts):**
- `npm run dev` → serves the game at http://localhost:4173 (via `npx --yes serve`, fetched on first use — needs network the first time).
- `npm run playground` → question-quality reviewer at http://localhost:4174/playground/.
- `npm run check` = `validate` + `analyze` + `sync-check` + `build:trail` + `verify:trail`. This plus `npm run audit` and `npm run balance` are exactly what CI (`.github/workflows/ci.yml`) runs. There is no separate lint step.

**Non-obvious gotchas:**
- `data/questions.json` is the source of truth for the question bank. After editing it you must run `npm run sync` to inject it into `index.html`; `npm run sync-check` (part of `npm run check` and CI) fails if the two drift out of sync.
- `game/trail.bundle.js` is generated from `src/agents/` and `src/core/` by `npm run build:trail`. Rebuild after editing agent/core source, or the browser will run a stale bundle.
- `npm run balance` and `npm run audit` overwrite `data/balance-report.json` / `data/quality-report.json` on every run, and the balance sim is stochastic — do not commit the resulting diffs unless the change is intentional.
