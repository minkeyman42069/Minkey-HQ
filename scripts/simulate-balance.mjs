#!/usr/bin/env node
/**
 * Monte Carlo balance report for The RBT Trail climb economy.
 * Run after any CONFIG / route / node rebalance.
 */
import { writeFileSync } from 'node:fs';
import {
  runMonteCarlo,
  assessBalance,
  TARGETS,
  BALANCE,
} from './lib/climb-balance.mjs';

const RUNS = Number(process.env.BALANCE_RUNS || 4000);

const base = runMonteCarlo(RUNS, { accuracy: 0.82, timeoutRate: 0.06 });
const boon = runMonteCarlo(RUNS, {
  accuracy: 0.82,
  timeoutRate: 0.05,
  boons: { provisions: true, vent: true },
});
const stacked = runMonteCarlo(RUNS, {
  accuracy: 0.82,
  timeoutRate: 0.05,
  boons: { provisions: true, pitanchor: true, vent: true },
});
const skilled = runMonteCarlo(RUNS, { accuracy: 0.88, timeoutRate: 0.04 });
const struggling = runMonteCarlo(RUNS, { accuracy: 0.72, timeoutRate: 0.10 });

const report = {
  generatedAt: new Date().toISOString(),
  runsPerScenario: RUNS,
  balance: BALANCE,
  targets: TARGETS,
  scenarios: { base, boon, stacked, skilled, struggling },
};

const issues = assessBalance({ base, boon });

console.log('\n=== RBT Trail Climb Balance Report ===\n');
console.log(`Simulations per scenario: ${RUNS}`);
console.log(`CLEAR_RESTORE_MULT: ${BALANCE.CLEAR_RESTORE_MULT} (ledge payout matches UI)\n`);

for (const [name, r] of Object.entries(report.scenarios)) {
  console.log(
    `${name.padEnd(12)} summit ${(r.summitRate * 100).toFixed(1)}%  |  act III entry alive ${(r.act3Survival * 100).toFixed(1)}%  |  avg strikes ${r.avgStrikes}`,
  );
}

console.log('\nTargets:');
console.log(`  base summit     ${TARGETS.baseSummitMin * 100}–${TARGETS.baseSummitMax * 100}%`);
console.log(`  boon summit     ${TARGETS.boonSummitMin * 100}–${TARGETS.boonSummitMax * 100}%`);

if (issues.length) {
  console.log('\n⚠ Balance warnings:');
  issues.forEach((i) => console.log(`  - ${i}`));
} else {
  console.log('\n✓ Balance within targets');
}

writeFileSync('data/balance-report.json', JSON.stringify(report, null, 2) + '\n');
console.log('\nWrote data/balance-report.json\n');

if (issues.length && process.env.CI) process.exit(1);
