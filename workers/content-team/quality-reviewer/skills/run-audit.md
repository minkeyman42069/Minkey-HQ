# run-audit

Run quality audit on entire question bank.

## Process
```bash
npm run audit
```
1. Summarize `data/quality-report.json`
2. List questions scoring below threshold
3. Open `npm run playground` for visual review of flagged items
4. Propose overhaul batch → `data/overhaul-batch2.json` format
