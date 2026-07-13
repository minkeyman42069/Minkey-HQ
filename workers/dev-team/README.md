# Dev Team

11 development workers for The RBT Trail. See `docs/TEAM.md` for full routing.

## Workflow

```
project-manager → task-executor → specialists → qa-tester → code-reviewer
```

## Workers

| Worker | Key skills |
|--------|------------|
| project-manager | create-prd, next-issue, update-learnings |
| task-executor | execute, analyze-issue, validate-completion |
| game-engine-dev | edit-encounter, edit-screen, fix-engine-bug |
| agent-dev | edit-agent, add-hook, rebuild-bundle |
| frontend-dev | style-screen, fix-layout, a11y-pass |
| qa-tester | run-check, smoke-test, verify-agents |
| balance-analyst | run-sim, compare-runs, set-targets |
| content-bank-editor | edit-question, sync-bank, validate-bank |
| infra-dev | fix-ci, update-workflow, check-pages |
| code-reviewer | review-pr, check-bundle, check-sync |
| knowledge-curator | update-docs, capture-learning, check-drift |

## Quick start

```
/run project-manager create-prd "feature-name"
/run qa-tester run-check
/run game-engine-dev edit-encounter "fix timeout handling"
```
