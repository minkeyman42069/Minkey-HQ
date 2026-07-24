/**
 * Climb economy gate — Monte Carlo over REAL climbs.
 *
 * Since the Climb Engine unification this no longer models pitches with its
 * own math: every simulated climb is played end-to-end by
 * `climb-engine.playClimb` through the real agent bus — the same
 * resolveAnswer / tickDrift / strike code the browser executes. The only
 * modeling assumptions left are the player ones, stated here:
 *
 *   accuracy        P(correct answer)
 *   timeoutRate     share of wrong answers that are timeouts
 *   ANSWER_SECONDS  seconds of passive hazard behavior burned per question
 *                   (gusts, spikes, drain, and threat rise all count now)
 *
 * Choice nodes (shrines, Cairn Keeper tales) stay neutral in the gate:
 * they are player-driven and roughly stamina-neutral across their options.
 */

import { createKernel } from '../../src/core/kernel.js';
import { CONFIG } from '../../src/core/config.js';
import { TIER_COMBAT } from '../../src/agents/hazard-warden.js';
import { createSeededRng } from '../../src/agents/expedition-director.js';
import { playClimb } from '../../src/core/climb-engine.js';

/** How long a typical climber leaves each question on the clock.
 * Matches the Route Setter's gradeLine assumption (secondsPerQuestion: 6)
 * so the whole codebase shares one player-speed model. */
export const ANSWER_SECONDS = 6;

export const BALANCE = {
  STAM_MAX: CONFIG.STAM_MAX,
  MISS_COST: CONFIG.MISS_COST,
  TIMEOUT_COST: CONFIG.TIMEOUT_COST,
  TIER_COMBAT,
  REST_RESTORE: CONFIG.REST_RESTORE,
  CLEAR_RESTORE_MULT: CONFIG.CLEAR_RESTORE_MULT,
  EASE_ON_CORRECT: CONFIG.EASE_ON_CORRECT,
  THREAT_RESET: CONFIG.THREAT_RESET,
  CRUX_RISE_MULT: CONFIG.CRUX_RISE_MULT,
  MAX_BOONS: CONFIG.MAX_BOONS,
  ANSWER_SECONDS,
};

const trail = createKernel();

/** Play one full climb through the real bus. */
export function simulateClimb(opts = {}) {
  const r = playClimb(trail, {
    seed: opts.seed != null ? opts.seed : Math.floor(Math.random() * 2 ** 31),
    accuracy: opts.accuracy ?? 0.82,
    timeoutRate: opts.timeoutRate ?? 0.06,
    answerSeconds: opts.answerSeconds ?? ANSWER_SECONDS,
    fixedBoons: opts.fixedBoons ?? boonIds(opts.boons),
    draftPolicy: 'none',
    talePolicy: 'skip',
    shrinePolicy: 'pass',
    weather: null,
  });
  return {
    summited: r.summited,
    stamina: r.stamina,
    act3Entry: r.act3Entry,
    totalStrikes: r.strikes,
  };
}

/** Back-compat: scenario boons were once passed as {id: true} flags. */
function boonIds(boons) {
  if (!boons) return [];
  if (Array.isArray(boons)) return boons;
  return Object.keys(boons).filter((k) => boons[k]);
}

export function runMonteCarlo(n = 3000, opts = {}) {
  let wins = 0;
  let act3Alive = 0;
  let totalStrikes = 0;
  const seedRnd = createSeededRng(opts.seed != null ? opts.seed : 1);

  for (let i = 0; i < n; i++) {
    const r = simulateClimb({ ...opts, seed: Math.floor(seedRnd() * 2 ** 31) });
    if (r.summited) wins++;
    if (r.act3Entry !== null && r.act3Entry > 0) act3Alive++;
    totalStrikes += r.totalStrikes;
  }

  return {
    runs: n,
    summitRate: +(wins / n).toFixed(3),
    act3Survival: +(act3Alive / n).toFixed(3),
    avgStrikes: +(totalStrikes / n).toFixed(2),
    opts: { ...opts, rnd: undefined },
  };
}

/** Targets for a fair roguelite study climb. */
export const TARGETS = {
  baseSummitMin: 0.32,
  baseSummitMax: 0.48,
  boonSummitMin: 0.48,
  boonSummitMax: 0.65,
};

export function assessBalance(report) {
  const issues = [];
  if (report.base.summitRate < TARGETS.baseSummitMin) {
    issues.push(`Base summit rate ${(report.base.summitRate * 100).toFixed(1)}% is below target ${TARGETS.baseSummitMin * 100}%`);
  }
  if (report.base.summitRate > TARGETS.baseSummitMax) {
    issues.push(`Base summit rate ${(report.base.summitRate * 100).toFixed(1)}% is above target ${TARGETS.baseSummitMax * 100}%`);
  }
  if (report.boon.summitRate < TARGETS.boonSummitMin) {
    issues.push(`Boon summit rate ${(report.boon.summitRate * 100).toFixed(1)}% is below target`);
  }
  if (report.boon.summitRate > TARGETS.boonSummitMax) {
    issues.push(`Boon summit rate ${(report.boon.summitRate * 100).toFixed(1)}% is above target ${TARGETS.boonSummitMax * 100}%`);
  }
  return issues;
}
