# create-prd

Create a PRD for a new RBT Trail feature.

## Arguments
`$ARGUMENTS` = feature name

## Process
1. Create `projects/{feature}/prd.json` with epics and user stories
2. Each story needs: id, title, acceptance_criteria, priority, passes: false, worker_hints
3. Map worker_hints to registry IDs (boon-architect, game-engine-dev, etc.)
4. Summarize scope and estimated worker sequence

## Story ID format
US-001, US-002, ...
