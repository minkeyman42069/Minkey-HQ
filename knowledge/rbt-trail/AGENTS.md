# In-Game Agents Reference

Maps trail-team workers to runtime code.

## Registration (`src/core/kernel.js`)

```javascript
const boonAgent = createBoonArchitect();
const atlasAgent = createAtlasArtisan();
boonAgent.register(bus);   // hooks: answer:correct, pitch:enter, ...
atlasAgent.register(bus);  // hooks: UI polish events
```

## Agent bus events

| Event | Typical emit site | Who listens |
|-------|-------------------|-------------|
| `pitch:enter` | index.html pitch start | boon-architect |
| `question:start` | question displayed | boon-architect |
| `answer:correct` | grading | boon-architect, atlas-artisan |
| `answer:wrong` | grading | boon-architect |
| `mountain:strike` | stamina loss | boon-architect |
| `hazard:gust` | hazard proc | boon-architect |
| `pitch:clear` | pitch complete | boon-architect |

## Direct API access (no bus registration)

```javascript
Trail.agents.hazard.api     // HazardWarden module
Trail.agents.scholar.api    // DOMAINS, scheduler, TYPES
Trail.agents.economy.api    // WEATHERS, RELICS, pitchRestore
Trail.agents.expedition.api // buildRoute, ACTS
```

## CONFIG (`src/core/config.js`)

```javascript
STAM_MAX, MISS_COST, MAX_BOONS, LOCK_TIER, MASTER_TIER, BOX_WEIGHTS, EXAM_N
```

Tune via `mountain-economy` worker. Always re-run balance sim after CONFIG changes.

## Verify all agents

```bash
npm run verify:trail
```

Script checks: all 6 agents export expected APIs, bus hooks fire, buildRoute returns valid route.
