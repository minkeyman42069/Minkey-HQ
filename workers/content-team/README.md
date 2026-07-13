# Content Team

Three workers for the RBT question bank (`data/questions.json`).

| Worker | Skills | Purpose |
|--------|--------|---------|
| question-writer | draft-question, rewrite-question, batch-draft | New BACB-aligned items |
| domain-auditor | audit-coverage, rebalance-domains, domain-report | TCO A–F distribution |
| quality-reviewer | run-audit, review-flagged, create-overhaul-batch | Quality scoring |

## Pipeline

```
question-writer → domain-auditor → content-bank-editor sync-bank → quality-reviewer
```

## Always sync after bank edits

```bash
npm run validate
npm run sync
npm run sync-check
```

See `knowledge/rbt-trail/TCO-DOMAINS.md` for domain weights and question schema.
