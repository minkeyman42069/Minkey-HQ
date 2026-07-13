# TCO Domains — RBT 3rd Edition

Reference for `trail-scholar`, `question-writer`, and `domain-auditor` workers.

## Domain letters (used in `questions.json` as `dom`)

| Letter | Domain | Exam weight (approx) |
|--------|--------|---------------------|
| **A** | Measurement | ~25% |
| **B** | Assessment | ~10% |
| **C** | Skill Acquisition | ~30% |
| **D** | Behavior Reduction | ~25% |
| **E** | Documentation & Reporting | ~5% |
| **F** | Professional Conduct | ~5% |

> Weights are approximate. Use `npm run analyze` for actual bank distribution.

## Question schema

```json
{
  "id": "unique-string",
  "q": "Question stem (scenario-based preferred)",
  "a": ["Option A", "Option B", "Option C", "Option D"],
  "c": 0,
  "cat": "category slug",
  "dom": "C",
  "type": "mc4",
  "expl": "Teaching explanation — why correct, why others wrong"
}
```

## Domain targeting in-game

- `trail-scholar.js` → `weakestDomainLetter(run, bank)` picks focus domain from live performance
- Leitner scheduler weights weak domains higher via `CONFIG.BOX_WEIGHTS`
- Board Sim (`exam` screen) weights questions to TCO proportions

## Content quality rubric

Scoring lives in `scripts/lib/quality-rubric.mjs`. Key criteria:
- Scenario realism (ABA clinical context)
- Distractor plausibility
- Explanation teaches concept (not just "A is correct")
- Domain tag accuracy
- No outdated terminology (e.g. 2nd ed. task list items)

## Sources

- [RBT 3rd Edition TCO (BACB PDF)](https://www.bacb.com/wp-content/uploads/2023/12/RBT-3rd-Edition-Test-Content-Outline-240903-a.pdf)
- [RBT Handbook sample items](https://www.bacb.com/wp-content/uploads/2025/08/RBTHandbook_260116-a.pdf)

## Target distribution for question bank

Aim for bank within ±3% of exam weights. Run `domain-auditor audit-coverage` when adding batches.
