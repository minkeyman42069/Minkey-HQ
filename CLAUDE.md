# CLAUDE.md — Minkey-HQ / The RBT Trail

You are working in **Minkey-HQ**, home of **The RBT Trail** — a roguelike spaced-repetition study game for the RBT exam.

## First commands on every session

```
/run team-orchestrator start-team
```

Or for cloud/self-hosted agents:
```
/run team-orchestrator agent-worker-start
```

## What lives here

| Path | Purpose |
|------|---------|
| `index.html` | Playable game (UI + engine + embedded bank) |
| `src/agents/` | 6 modular game agents |
| `workers/` | **22 AI workers** across 4 teams |
| `knowledge/rbt-trail/` | Shared context — read before coding |
| `docs/TEAM.md` | Full worker reference (start here for help) |

## Worker execution

Use the `/run` command (see `.claude/commands/run.md`):

```
/run {worker-id} {skill} ["arguments"]
```

Registry: `workers/registry.yaml`

## Non-negotiable rules

1. **Question bank:** edit `data/questions.json` → `npm run sync`
2. **Agent code:** edit `src/` → `npm run build:trail` → commit bundle
3. **Before PR:** `npm run check`
4. **Don't commit** balance/audit report noise unless intentional
5. Read `knowledge/rbt-trail/GOTCHAS.md` when CI fails

## npm scripts

```
npm run dev          # play → :4173
npm run check        # full CI gate
npm run build:trail  # rebuild bundle
npm run sync         # inject bank into index.html
npm run balance      # difficulty sim
npm run audit        # question quality
npm run playground   # review UI → :4174
```

## Routing tasks to workers

Don't guess — use the orchestrator:

```
/run team-orchestrator route-task "your task description"
```

## Teams

- **trail-team** (6) — one worker per in-game agent
- **dev-team** (11) — engine, QA, balance, CI, PRs
- **content-team** (3) — questions, domains, quality
- **orchestration** (2) — boot, route, shared context

## Human-in-the-loop

- Surface decisions before destructive changes
- Run verification after every worker skill
- Escalate ambiguity — never auto-decide on product scope

## More help

- `docs/TEAM.md` — complete playbook
- `knowledge/rbt-trail/WORKFLOWS.md` — multi-step pipelines
- `docs/ARCHITECTURE.md` — code layout
