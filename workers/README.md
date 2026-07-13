# Workers

Minkey-HQ agent worker team for **The RBT Trail**.

## Start here

```bash
/run team-orchestrator start-team
```

Full guide: **[docs/TEAM.md](../docs/TEAM.md)**

## Teams (22 workers)

| Team | Workers | Directory |
|------|---------|-----------|
| Orchestration | 2 | `orchestration/` |
| Trail Team | 6 | `trail-team/` |
| Dev Team | 11 | `dev-team/` |
| Content Team | 3 | `content-team/` |

## Usage

```
/run                              # list workers (reads registry.yaml)
/run {worker-id}                  # show skills
/run {worker-id} {skill}          # execute skill
/run {worker-id} {skill} "args"   # with arguments
```

## Examples

```
/run team-orchestrator start-team
/run boon-architect audit-boons
/run balance-analyst run-sim
/run question-writer draft-question "domain B assessment"
/run qa-tester run-check
/run project-manager create-prd "daily-challenge-mode"
```

## Each worker contains

```
workers/{team}/{worker-id}/
  worker.yaml          # identity, context, verification, skills list
  skills/
    {skill}.md         # step-by-step instructions ($ARGUMENTS)
```

## Adding a worker

1. Copy `workers/trail-team/boon-architect/` as template
2. Edit `worker.yaml` + skills
3. Register in `workers/registry.yaml`
4. Update `docs/TEAM.md` routing table

Or: `/run team-orchestrator route-task` to see if an existing worker fits first.
