# daily-brief

Morning standup brief for The RBT Trail repo.

## Process

1. **Git state**: branch, uncommitted files, last 3 commits
2. **Bank stats**: question count, domain distribution (`npm run analyze` output summary)
3. **Bundle freshness**: compare `src/` mtime vs `game/trail.bundle.js`
4. **Sync status**: `npm run sync-check` pass/fail
5. **CI**: read `.github/workflows/ci.yml` — list what `npm run check` covers
6. **Open work**: scan `projects/` for in-progress PRDs
7. **Suggested focus**: one sentence based on repo state

## Output

Brief markdown → `workspace/reports/orchestration/{date}-daily-brief.md`
