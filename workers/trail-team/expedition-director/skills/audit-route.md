# audit-route

Audit route generation in `src/agents/expedition-director.js`.

## Process
1. Trace `buildRoute(rnd, topic, CONFIG, HazardWarden)` 
2. Map act structure: node counts, camp placement, summit
3. Run balance sim — check if routes feel too short/long
4. Verify hazard warden node injection points

## Output
Route structure diagram (mermaid) + pacing notes
