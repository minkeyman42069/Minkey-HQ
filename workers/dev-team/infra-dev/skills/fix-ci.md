# fix-ci

Fix GitHub Actions CI failures.

## Process
1. Read `.github/workflows/ci.yml`
2. Reproduce locally: `npm run check`, `npm run audit`, `npm run balance`
3. Fix root cause — common: sync drift, stale bundle, invalid questions
4. Push fix, confirm workflow passes
