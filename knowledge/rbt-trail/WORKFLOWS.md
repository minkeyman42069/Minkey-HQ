# Workflows — common multi-worker pipelines

## 1. Add a new boon

```
/run boon-architect add-boon "name and effect"
/run balance-analyst run-sim
/run qa-tester run-check
/run code-reviewer review-pr
```

Files: `src/agents/boon-architect.js` → rebuild bundle

## 2. Add a new hazard

```
/run hazard-warden add-hazard "name and mechanic"
/run game-engine-dev edit-encounter "wire new node"
/run hazard-warden audit-bestiary
/run qa-tester smoke-test
```

Files: `src/agents/hazard-warden.js`, possibly `index.html`

## 3. Add questions (batch)

```
/run question-writer batch-draft "domain C, 10 questions on reinforcement"
/run domain-auditor audit-coverage
/run content-bank-editor sync-bank
/run quality-reviewer run-audit
/run qa-tester run-check
```

Files: `data/questions.json` → `npm run sync` → `index.html`

## 4. Tune difficulty

```
/run mountain-economy tune-config
/run balance-analyst run-sim
/run balance-analyst compare-runs
```

Files: `src/core/config.js`, `src/agents/mountain-economy.js`

## 5. UI polish pass

```
/run atlas-artisan audit-ui
/run frontend-dev style-screen menu
/run frontend-dev a11y-pass
```

Files: `src/agents/atlas-artisan.js`, `index.html`

## 6. New feature (full pipeline)

```
/run project-manager create-prd "feature-name"
/run project-manager next-issue
/run task-executor execute US-001 feature-name
/run knowledge-curator capture-learning
```

## 7. CI is red

```
/run team-orchestrator full-check
/run infra-dev fix-ci
/run qa-tester run-check
```

Common fixes: sync bank, rebuild bundle, fix invalid question JSON

## 8. Fresh cloud agent bootstrap

```
/run team-orchestrator agent-worker-start
/run team-orchestrator start-team
npm run dev
```
