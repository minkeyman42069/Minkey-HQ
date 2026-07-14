#!/usr/bin/env node
/**
 * Per-hazard balance report — ranks every bestiary enemy within its tier.
 * Run after touching node stats in hazard-warden.js:  npm run balance:hazards
 *
 * Each hazard is met in its real route context (act scaling + need) by the
 * same simulated climber (82% accuracy, 6% timeouts, 75 stamina at entry).
 * `score` = stamina bled + death risk; `xMed` compares it to its tier median.
 */
import { writeFileSync } from 'node:fs';
import { simBestiary } from './lib/hazard-sim.mjs';

const RUNS = Number(process.env.HAZARD_RUNS || 4000);
const ACC = Number(process.env.HAZARD_ACC || 0.82);

const rows = simBestiary({ runs: RUNS, accuracy: ACC });

const TIER_NAMES = { 1: 'Tier 1 — Approach', 2: 'Tier 2 — Headwall', 3: 'Tier 3 — Hard Ground', 4: 'Tier 4 — Death Zone', 5: 'Tier 5 — Fixed Points' };

console.log('\n=== RBT Trail Hazard Balance (per-pitch Monte Carlo) ===');
console.log(`runs/hazard ${RUNS} · accuracy ${ACC} · entry stamina 75\n`);
const pad = (s, n) => String(s).padEnd(n);
const num = (s, n) => String(s).padStart(n);

for (const t of [1, 2, 3, 4, 5]) {
  const group = rows.filter((r) => r.tier === t).sort((a, b) => b.score - a.score);
  if (!group.length) continue;
  console.log(TIER_NAMES[t]);
  console.log('  ' + pad('hazard', 18) + num('score', 6) + num('vsMed', 7) + num('cost', 7) + num('death%', 8) + num('strikes', 9) + num('Qs', 6) + '  flag');
  for (const r of group) {
    console.log(
      '  ' + pad(r.kind, 18) + num(r.score, 6) + num(r.vsTierMedian > 0 ? '+' + r.vsTierMedian : r.vsTierMedian, 7) + num(r.avgCost, 7) +
      num((r.deathRate * 100).toFixed(1), 8) + num(r.avgStrikes, 9) + num(r.avgQuestions, 6) +
      (r.flag ? '  ⚠ ' + r.flag : ''),
    );
  }
  console.log('');
}

const flagged = rows.filter((r) => r.flag);
if (flagged.length) {
  console.log('⚠ Outliers: ' + flagged.map((r) => `${r.kind} (T${r.tier} ${r.flag.toLowerCase()}, ${r.vsTierMedian > 0 ? '+' : ''}${r.vsTierMedian} vs median)`).join(', '));
} else {
  console.log('✓ Every tier sits inside its median band (tier 5 set-pieces exempt)');
}

writeFileSync('data/hazard-report.json', JSON.stringify({ generatedAt: new Date().toISOString(), runsPerHazard: RUNS, accuracy: ACC, rows }, null, 2) + '\n');
console.log('\nWrote data/hazard-report.json\n');
