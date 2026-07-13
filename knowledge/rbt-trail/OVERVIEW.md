# The RBT Trail — Knowledge Base

Quick reference for all workers. Read this before touching game code or content.

## What this is

**The RBT Trail** is a single-page browser game: roguelike climb + spaced repetition for the RBT exam (3rd ed. TCO). No backend. Ships as `index.html` + committed bundle.

## Architecture (30 seconds)

```
index.html          ← UI, encounter engine, embedded BANK
game/trail.bundle.js ← built from src/ (esbuild IIFE)
src/agents/         ← 6 game agents (see trail-team workers)
src/core/           ← kernel, agent-bus, CONFIG
data/questions.json ← question bank source of truth
```

**Hook flow:** `index.html` calls `Trail.emit(event, ctx)` → agent-bus → registered handlers return deltas.

## Commands every worker should know

| Command | When |
|---------|------|
| `npm run dev` | Play locally → :4173 |
| `npm run check` | Full CI gate (always before PR) |
| `npm run build:trail` | After any `src/` edit |
| `npm run verify:trail` | Smoke-test 6 agents |
| `npm run sync` | After `data/questions.json` edit |
| `npm run balance` | After economy/boon/hazard tuning (stochastic) |
| `npm run audit` | After question content changes |
| `npm run playground` | Visual question review → :4174 |

## Worker teams

| Team | Count | Purpose |
|------|-------|---------|
| `orchestration` | 2 | Start team, route tasks, shared kernel context |
| `trail-team` | 6 | One worker per in-game agent |
| `dev-team` | 11 | Engine, agents, QA, balance, CI, PRs |
| `content-team` | 3 | Question writing, domains, quality |

**Total: 22 registered workers** (20 executable + 2 library/orchestration)

## File ownership map

| If you're changing… | Primary worker | Key files |
|--------------------|----------------|-----------|
| Boons / duos / draft | `boon-architect` | `src/agents/boon-architect.js` |
| Hazards / bestiary | `hazard-warden` | `src/agents/hazard-warden.js` |
| Scheduling / domains | `trail-scholar` | `src/agents/trail-scholar.js`, `data/questions.json` |
| Stamina / threat / weather | `mountain-economy` | `src/agents/mountain-economy.js`, `src/core/config.js` |
| Route / acts | `expedition-director` | `src/agents/expedition-director.js` |
| UI / copy / tokens | `atlas-artisan` | `src/agents/atlas-artisan.js`, `index.html` |
| Encounter loop | `game-engine-dev` | `index.html` |
| Agent wiring | `agent-dev` | `src/core/kernel.js`, `game/bootstrap.js` |
| Questions | `question-writer` → `content-bank-editor` | `data/questions.json` |
| CI / deploy | `infra-dev` | `.github/workflows/` |

See also: `GOTCHAS.md`, `TCO-DOMAINS.md`, `WORKFLOWS.md`, `AGENTS.md`
