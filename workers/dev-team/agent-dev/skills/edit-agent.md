# edit-agent

Modify game agents under `src/agents/`.

## Process
1. Identify target agent file
2. Edit — match existing factory pattern (`createX()`, `api`, optional `register(bus)`)
3. `npm run build:trail && npm run verify:trail`
4. Commit both source AND `game/trail.bundle.js`
