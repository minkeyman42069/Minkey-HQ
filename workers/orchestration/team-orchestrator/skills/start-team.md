# start-team

Boot the entire Minkey-HQ worker team and verify the game is healthy.

## Process

1. Read `workers/registry.yaml` — count workers by team
2. Run health checks:
   ```bash
   npm run verify:trail
   npm run sync-check
   node -e "const b=require('./data/questions.json'); console.log('Questions:', b.length)"
   ```
3. Print the full roster grouped by team with one-line descriptions
4. Print **Quick Start Commands** (copy-paste ready):

```
# Play locally
npm run dev                    # → http://localhost:4173

# Full CI gate
npm run check

# Question playground
npm run playground             # → http://localhost:4174/playground/

# Route a task
/run team-orchestrator route-task "your task here"

# Work on a game agent
/run boon-architect audit-boons
/run hazard-warden audit-bestiary
/run trail-scholar audit-domains
/run mountain-economy tune-config
/run expedition-director audit-route
/run atlas-artisan audit-ui

# Content pipeline
/run question-writer draft-question --domain B
/run quality-reviewer run-audit

# Dev pipeline
/run project-manager next-issue
/run qa-tester run-check
/run balance-analyst run-sim
```

5. Note any failing health checks with fix commands

## Output

Markdown brief saved to `workspace/reports/orchestration/{date}-team-start.md`
