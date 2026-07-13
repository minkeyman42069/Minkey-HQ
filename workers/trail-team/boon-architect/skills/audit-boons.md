# audit-boons

Audit the boon catalog in `src/agents/boon-architect.js`.

## Process
1. List all 18 boons: id, name, tag, rare, desc
2. List all duos and which boon pairs they require
3. Check `pickDraft` weighting logic — any dead or overpowered picks?
4. Trace hook registrations (`answer:correct`, `pitch:enter`, etc.)
5. Cross-check `CONFIG.MAX_BOONS` (max 5 per run)
6. Run `npm run balance` — note win-rate impact if boons changed recently

## Output
Table of boons + recommendations → workspace report
