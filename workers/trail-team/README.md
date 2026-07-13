# Trail Team

Six workers — one per in-game agent in `src/agents/`. Each maps 1:1 to runtime code.

| Worker | Source | Maintains |
|--------|--------|-----------|
| boon-architect | `boon-architect.js` | 18 boons, 10 duos, draft weighting |
| hazard-warden | `hazard-warden.js` | Encounters, bestiary, act scaling |
| trail-scholar | `trail-scholar.js` | TCO domains, Leitner scheduler |
| mountain-economy | `mountain-economy.js` | Stamina, threat, weather, relics |
| expedition-director | `expedition-director.js` | Route assembly, camp pacing |
| atlas-artisan | `atlas-artisan.js` | UI tokens, copy, polish hooks |

## After any code change

```bash
npm run build:trail && npm run verify:trail
```

Balance-sensitive changes: also `npm run balance`.

## Audit everything

```
/run boon-architect audit-boons
/run hazard-warden audit-bestiary
/run trail-scholar audit-domains
/run mountain-economy tune-config
/run expedition-director audit-route
/run atlas-artisan audit-ui
```
