# tune-config

Tune economy knobs in `src/core/config.js` and `src/agents/mountain-economy.js`.

## Process
1. Read current CONFIG: STAM_MAX, MISS_COST, threat rates, etc.
2. Run `npm run balance` — capture win rate, avg stamina, summit rate
3. Propose CONFIG changes with predicted impact
4. If changing CONFIG: edit `src/core/config.js`, rebuild, re-sim
5. **Do not commit** balance-report.json unless tuning is intentional

## Output
Before/after balance comparison
