# Projects

PRDs and feature specs for `project-manager` and `task-executor` workers.

## Create a project

```
/run project-manager create-prd "my-feature-name"
```

Creates `projects/my-feature-name/prd.json`:

```json
{
  "project": "my-feature-name",
  "epics": [{
    "id": "E1",
    "title": "Epic title",
    "stories": [{
      "id": "US-001",
      "title": "Story title",
      "acceptance_criteria": ["..."],
      "priority": 1,
      "passes": false,
      "worker_hints": ["boon-architect", "balance-analyst", "qa-tester"]
    }]
  }]
}
```

## Execute

```
/run project-manager next-issue --project my-feature-name
/run task-executor execute US-001 my-feature-name
```

## Worker hints

Use registry IDs from `workers/registry.yaml`:
- Game mechanics → trail-team workers
- Engine/UI → `game-engine-dev`, `frontend-dev`, `agent-dev`
- Content → content-team workers
- Gate → `qa-tester`, `code-reviewer`
