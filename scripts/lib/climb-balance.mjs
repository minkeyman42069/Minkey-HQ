/**
 * Climb economy model — simulates real routes from the real node factories.
 * Routes come from expedition-director buildRoute and hazard stats from
 * hazard-warden, so the sim cannot drift from shipped gameplay math.
 * (Per-pitch tick-fidelity lives in hazard-sim.mjs; this model covers the
 * whole-climb stamina economy with simplified pitches.)
 */

import { CONFIG } from '../../src/core/config.js';
import { TIER_COMBAT } from '../../src/agents/hazard-warden.js';
import { buildRoute, createSeededRng } from '../../src/agents/expedition-director.js';
import { startThreatFor } from './hazard-sim.mjs';

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
};

/** A real route straight from the Expedition Director. */
export function defaultRoute(rnd = Math.random) {
  return buildRoute(rnd, null, CONFIG);
}

function missCosts(node) {
  const tc = TIER_COMBAT[node.tier];
  return {
    miss: tc ? tc.missCost : BALANCE.MISS_COST,
    timeout: tc ? tc.timeoutCost : BALANCE.TIMEOUT_COST,
  };
}

function questionOutcome(acc, timeoutRate, rnd) {
  const r = rnd();
  if (r < acc) return { correct: true, timeout: false };
  if (r < acc + timeoutRate) return { correct: false, timeout: true };
  return { correct: false, timeout: false };
}

function simPitch(node, stamina, acc, timeoutRate, boons, rnd) {
  let threat = node.startThreat ?? startThreatFor(node.kind);
  const max = node.max || 100;
  let done = 0;
  let missCount = 0;
  let strikes = 0;
  const costs = missCosts(node);

  if (boons.provisions) stamina = Math.min(BALANCE.STAM_MAX, stamina + 5);

  for (let q = 0; q < node.need; q++) {
    const time = node.time || 16;
    const crux = node.need > 1 && done >= node.need - 1;
    let riseMult = crux ? BALANCE.CRUX_RISE_MULT : 1;
    if (boons.coldfront) riseMult *= 0.75;

    // passive threat per question: rise * 0.05 per 50ms tick ≈ rise * seconds
    threat += node.rise * time * riseMult;
    if (node.drain) stamina -= node.drain * time;

    const out = questionOutcome(acc, timeoutRate, rnd);
    if (out.correct) {
      done++;
      let ease = typeof node.ease === 'number' ? node.ease : BALANCE.EASE_ON_CORRECT;
      if (node.noBoonEase) ease = 0;
      else if (boons.vent) ease += 2;
      threat = Math.max(0, threat - ease);
    } else {
      let cost = out.timeout ? costs.timeout : costs.miss;
      if (node.escalate) cost += missCount * node.escalate;
      missCount++;
      stamina -= cost;
      threat += node.miss;
    }

    while (threat >= max && stamina > 0) {
      threat = Math.max(0, threat - BALANCE.THREAT_RESET);
      let hit = node.hit;
      if (boons.pitanchor) hit = Math.round(hit * 0.62);
      stamina -= hit;
      strikes++;
    }

    if (stamina <= 0) return { stamina: 0, cleared: false, strikes };
  }

  const clearGain = Math.round(node.restore * BALANCE.CLEAR_RESTORE_MULT);
  return { stamina: Math.min(BALANCE.STAM_MAX, stamina + clearGain), cleared: true, strikes };
}

export function simulateClimb(opts = {}) {
  const acc = opts.accuracy ?? 0.82;
  const timeoutRate = opts.timeoutRate ?? 0.06;
  const boons = opts.boons ?? {};
  const rnd = opts.rnd ?? Math.random;
  const route = opts.route ?? defaultRoute(rnd);

  let stamina = BALANCE.STAM_MAX;
  let summited = false;
  let totalStrikes = 0;
  let act3Entry = null;

  for (const node of route) {
    if (node.act === 3 && act3Entry === null) act3Entry = stamina;

    // Choice nodes (shrine offerings, Cairn Keeper tales) are player-driven
    // and roughly stamina-neutral across their options — treat as no-ops.
    if (node.kind === 'shrine' || node.kind === 'tale') continue;
    if (node.kind === 'rest') {
      stamina = Math.min(BALANCE.STAM_MAX, stamina + node.restore);
      continue;
    }

    const res = simPitch(node, stamina, acc, timeoutRate, boons, rnd);
    stamina = res.stamina;
    totalStrikes += res.strikes;

    if (!res.cleared) return { summited: false, stamina, act3Entry, totalStrikes };
    if (node.kind === 'summit') summited = true;
  }

  return { summited, stamina, act3Entry, totalStrikes };
}

export function runMonteCarlo(n = 3000, opts = {}) {
  let wins = 0;
  let act3Alive = 0;
  let totalStrikes = 0;
  const rnd = opts.seed != null ? createSeededRng(opts.seed) : Math.random;

  for (let i = 0; i < n; i++) {
    const r = simulateClimb({ ...opts, rnd });
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
