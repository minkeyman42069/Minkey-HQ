# agent-worker-start

Bootstrap checklist for Cursor Cloud / self-hosted agent workers on this repo.

## Arguments

`$ARGUMENTS` = optional environment notes

## Process

1. Confirm repo layout (game + workers + knowledge)
2. Verify Node available (`node --version`)
3. Run `npm run verify:trail` and `npm run sync-check`
4. Print environment variables for self-hosted workers:

```
CURSOR_API_KEY=          # from cursor.com/settings
CURSOR_TARGET_REPOSITORY=github.com/minkeyman42069/Minkey-HQ
```

5. Print self-hosted start command:
   ```bash
   agent worker start --worker-dir /workspace
   ```

6. Print **first commands** for a fresh cloud agent on this repo:
   ```
   /run team-orchestrator start-team
   /run team-orchestrator daily-brief
   npm run dev
   ```

7. Link to `docs/TEAM.md` for full worker reference

## Notes

- This repo has **no npm dependencies** — no `npm install` needed
- `npm run dev` needs network first time (npx serve)
- Workers live in `workers/` — use `/run {worker-id} {skill}` in Cursor
