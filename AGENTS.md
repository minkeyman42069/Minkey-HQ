# AGENTS.md

## Cursor Cloud specific instructions

**Product:** "The RBT Trail" — a single-page, offline-capable browser game (roguelike spaced-repetition study tool for the RBT exam). The whole game ships as `index.html`; there is no backend/database.

**Worker team:** This repo includes a full HQ-style agent worker team (22 workers). Boot with:
```
/run team-orchestrator start-team
```
Full reference: `docs/TEAM.md`

**Runtime:** Pure Node.js ESM scripts (`scripts/*.mjs`) plus a static file server. CI pins Node 20; Node 22 also works. **No npm dependencies** — `npm install` is a no-op.

**Run / build / check:**
- `npm run dev` → http://localhost:4173
- `npm run playground` → http://localhost:4174/playground/
- `npm run check` = validate + analyze + sync-check + build:trail + verify:trail
- CI also runs `npm run audit` and `npm run balance`

**Worker routing (common tasks):**
| Task | Worker |
|------|--------|
| Boot team | `team-orchestrator start-team` |
| Route unknown task | `team-orchestrator route-task` |
| Boon/hazard/scheduler changes | `trail-team/{agent-id}` |
| index.html engine | `game-engine-dev` |
| src/agents/ code | `agent-dev` |
| Question bank | `question-writer` → `content-bank-editor` |
| CI fix | `infra-dev fix-ci` |
| Pre-PR check | `qa-tester run-check` |

**Non-obvious gotchas:**
- `data/questions.json` is source of truth → `npm run sync` after edits
- `game/trail.bundle.js` is generated → `npm run build:trail` after `src/` edits
- `npm run balance` / `npm run audit` are stochastic — don't commit report diffs unless intentional
- See `knowledge/rbt-trail/GOTCHAS.md` for full list

**Knowledge base:** `knowledge/rbt-trail/` — read OVERVIEW.md and GOTCHAS.md before changes.
