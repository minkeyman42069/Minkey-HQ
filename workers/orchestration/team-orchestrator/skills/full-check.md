# full-check

Run the complete verification suite and summarize results.

## Process

1. Run in order, capture output:
   ```bash
   npm run validate
   npm run analyze
   npm run sync-check
   npm run build:trail
   npm run verify:trail
   npm run audit
   npm run balance
   ```
2. Summarize pass/fail per step
3. Pull highlights from `data/quality-report.json` (lowest-scoring questions count)
4. Pull highlights from `data/balance-report.json` (win rate, avg stamina)
5. **Do not commit** balance/audit report diffs unless user requested tuning

## Output

Report → `workspace/reports/orchestration/{date}-full-check.md`
