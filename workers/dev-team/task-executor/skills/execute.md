# execute

Execute a project issue by routing to the right workers.

## Arguments
`$ARGUMENTS` = issue id (e.g. US-001) and project name

## Process
1. Load `projects/{project}/prd.json`
2. Find the story, read acceptance_criteria and worker_hints
3. Spawn workers in order (Task tool or manual /run sequence)
4. After each worker: run verification from their worker.yaml
5. Mark story `passes: true` when all criteria met
6. Capture learnings → knowledge-curator
