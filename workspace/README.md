# Workspace

Runtime output from worker skills. Not committed to git (see `.gitignore`).

## Structure

```
workspace/
  reports/
    orchestration/     ← team-orchestrator output
    trail-team/        ← per game-agent worker
    dev-team/          ← dev worker reports
    content-team/      ← content worker reports
  threads/             ← session checkpoints (optional)
  learnings/           ← captured insights (optional)
```

## Reports

Workers write markdown reports after skill execution. Filename pattern:
`{date}-{worker}-{skill}.md`

## Learnings loop

After completing work:
```
/run knowledge-curator capture-learning
```

Routes insights to `knowledge/rbt-trail/` or `projects/{name}/learnings/`.
