---
description: Run a worker or list available workers
allowed-tools: Task, Read, Glob, Grep, Bash, Edit, Write, WebSearch, WebFetch, AskUserQuestion
argument-hint: [worker-id] [skill] [args]
---

# /run — Worker Execution

Unified interface to run Minkey-HQ workers for The RBT Trail.

**Usage:**
```
/run                                    # List all workers
/run team-orchestrator start-team       # Boot the full team
/run {worker-id}                        # Show worker skills
/run {worker-id} {skill}                # Execute skill
/run {worker-id} {skill} "arguments"    # Execute with args
```

**User's input:** $ARGUMENTS

## Process

### No arguments → List workers

Read `workers/registry.yaml` and display workers grouped by team:

```
Orchestration
  team-orchestrator    Boot team, route tasks, daily brief
  trail-kernel         Shared context library

Trail Team (game agents)
  boon-architect       Boon catalog, duos, draft
  ...

Dev Team
  project-manager      PRD lifecycle
  ...

Content Team
  question-writer      Draft exam questions
  ...
```

Point to `docs/TEAM.md` for full reference.

### Worker ID only → Show skills

1. Find worker in `workers/registry.yaml`
2. Read `workers/{path}/worker.yaml`
3. List skills with descriptions

### Worker + Skill → Execute

1. Load worker context from `worker.yaml` `context.base` paths
2. Load skill from `workers/{path}/skills/{skill}.md`
3. Follow skill instructions (`$ARGUMENTS` = user args after skill name)
4. Run `verification.post_execute` checks from worker.yaml
5. Write report to `output.destination` if specified

### Execution pattern

1. **Load context** — worker.yaml, knowledge/rbt-trail/, source files
2. **Execute** — follow skill.md step by step
3. **Verify** — `npm run check` or worker-specific commands
4. **Report** — summarize in workspace/reports/

## Quick examples

```
/run team-orchestrator start-team
/run team-orchestrator route-task "add frost hazard to act 2"
/run boon-architect audit-boons
/run balance-analyst run-sim
/run qa-tester run-check
/run question-writer draft-question "domain A measurement"
```

## Notes

- Game agents (trail-team) require `npm run build:trail` after code edits
- Question edits require `npm run sync`
- See `knowledge/rbt-trail/GOTCHAS.md` before committing
