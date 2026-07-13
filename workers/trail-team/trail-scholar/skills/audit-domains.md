# audit-domains

Audit TCO domain coverage in `src/agents/trail-scholar.js` and `data/questions.json`.

## Process
1. Run `npm run analyze` — domain A–F distribution
2. Review `DOMAINS`, `DOMAIN_OF`, `weakestDomainLetter` logic
3. Check Leitner tier weights in `CONFIG.BOX_WEIGHTS`
4. Flag domains under 12% or over 22% of bank
5. Review question type renderers (`TYPES`)

## Output
Domain distribution report + scheduler recommendations
