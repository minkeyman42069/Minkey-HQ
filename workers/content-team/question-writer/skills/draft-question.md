# draft-question

Draft a new RBT exam question.

## Arguments
`$ARGUMENTS` = domain letter (A-F) and topic

## Process
1. Read `knowledge/rbt-trail/TCO-DOMAINS.md` for domain scope
2. Follow BACB item-writing style (scenario → question → 4 options)
3. Schema: `{ id, q, a: [4 strings], c: correctIndex, cat, dom, type, expl }`
4. Explanation must teach the concept, not just justify the answer
5. Append to `data/questions.json`, run `npm run validate`
6. Hand off to `content-bank-editor` for sync

## Sources
- RBT 3rd Edition TCO (BACB)
- RBT Handbook sample items
