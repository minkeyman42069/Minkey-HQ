# sync-bank

Sync question bank from JSON into index.html.

## Process
1. Confirm edits are in `data/questions.json` (source of truth)
2. `npm run validate && npm run analyze`
3. `npm run sync`
4. `npm run sync-check` must pass
