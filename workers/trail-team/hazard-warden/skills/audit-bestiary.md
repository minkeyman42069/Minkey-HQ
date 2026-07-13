# audit-bestiary

Audit hazard encounters in `src/agents/hazard-warden.js`.

## Process
1. List all node factory functions and their act scaling
2. Map each hazard to bestiary entry (name ↔ mechanic alignment)
3. Check encounter difficulty curve across acts 1–3
4. Verify `index.html` encounter engine calls match factory exports
5. Run `npm run verify:trail`

## Output
Bestiary table + scaling notes
