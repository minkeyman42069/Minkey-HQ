# route-task

Given a natural-language task, recommend which workers to run and in what order.

## Arguments

`$ARGUMENTS` = task description (required)

## Process

1. Parse the task for keywords:
   - boon, draft, duo, modifier → `boon-architect`
   - hazard, encounter, node, bestiary → `hazard-warden`
   - domain, leitner, scheduler, question type → `trail-scholar`
   - stamina, threat, weather, relic, CONFIG → `mountain-economy`
   - route, act, camp, summit → `expedition-director`
   - UI, CSS, menu, screen, token → `atlas-artisan` or `frontend-dev`
   - question, bank, explanation → `question-writer` → `content-bank-editor`
   - balance, win rate, difficulty → `balance-analyst`
   - CI, workflow, deploy → `infra-dev`
   - test, verify, smoke → `qa-tester`
   - PR, review → `code-reviewer`
   - engine, encounter loop, RUN state → `game-engine-dev`
   - agent bus, kernel, bundle → `agent-dev`

2. Build a **worker sequence** with rationale per step
3. List verification commands for the task type
4. Flag if task spans multiple teams → suggest `project-manager` first

## Output format

```
Task: {summary}

Recommended sequence:
1. /run {worker} {skill} — {why}
2. /run {worker} {skill} — {why}
...

Verify with:
  npm run {commands}

Risks / gotchas:
  - {list from knowledge/rbt-trail/GOTCHAS.md}
```
