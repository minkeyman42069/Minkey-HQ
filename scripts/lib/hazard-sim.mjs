/**
 * Per-hazard Monte Carlo — mirrors the index.html encounter tick engine.
 *
 * Unlike climb-balance.mjs (whole-climb economy, simplified pitches), this
 * model replays a single pitch at 50ms tick fidelity with every special
 * mechanic live: rise multipliers (crux/enrage/phase, capped at 2.0), gusts,
 * drain, spikes, timer decay, shields, streak gates, escalating miss costs,
 * fatigue, swift windows, and entry threat. Keep in sync with index.html
 * startTick()/resolve() and boon-architect onCorrect/onWrong when tuning.
 */

import * as H from '../../src/agents/hazard-warden.js';

export const ENGINE = {
  STAM_MAX: 100,
  MISS_COST: 14,
  TIMEOUT_COST: 10,
  THREAT_RESET: 75,
  CRUX_RISE_MULT: 1.2,
  EASE_ON_CORRECT: 6,
  CLEAR_RESTORE_MULT: 0.85,
  TICK: 0.05,
};

/** Entry threat seeded by index.html enterCurrentNode / sandbox spawnNode. */
export function startThreatFor(kind) {
  if (kind === 'serac') return 25;
  if (kind === 'summit') return 20;
  return 0;
}

/**
 * Simulate one pitch. Player model matches climb-balance.mjs outcome split
 * (accuracy / timeoutRate / wrong) plus an answer-speed distribution so
 * time-domain mechanics (rise, gusts, drain, spikes, decay, swift) count.
 */
export function simPitch(node, opts = {}) {
  const acc = opts.accuracy ?? 0.82;
  const timeoutRate = opts.timeoutRate ?? 0.06;
  const rnd = opts.rnd ?? Math.random;
  // Answer speed: 3.5–9s think time, capped by whatever clock the node allows.
  const think = () => 3.5 + rnd() * 5.5;

  let stamina = opts.stamina ?? 75;
  let threat = node.startThreat ?? startThreatFor(node.kind);
  const max = node.max || 100;

  let done = 0;
  let shieldLeft = node.shield || 0;
  let missCount = 0;
  let easeMul = 1;
  let timeMul = 1;
  let phaseMul = 1;
  let phased = false;
  let spikeT = 0;
  let strikes = 0;
  let questions = 0;

  const strike = () => {
    threat = Math.max(0, threat - ENGINE.THREAT_RESET);
    stamina -= node.hit;
    strikes++;
  };
  const raiseThreat = (x) => {
    threat = Math.max(0, Math.min(max, threat + x));
    if (threat >= max) strike();
  };

  const guard = 200; // hard stop for pathological streak-gate loops
  while (done < node.need && stamina > 0 && questions < guard) {
    questions++;

    // Focus timer for this question (decay shrinks the window each ask).
    let timer = node.time || 16;
    if (node.decay) {
      timer = Math.max(6, timer * timeMul);
      timeMul = Math.max(0.5, timeMul - 0.09);
    }

    // Outcome split first (mirrors climb-balance), speed second.
    const roll = rnd();
    let correct = false;
    let viaTimeout = false;
    let elapsed;
    if (roll < acc) {
      correct = true;
      elapsed = Math.min(think(), timer * 0.95);
    } else if (roll < acc + timeoutRate) {
      viaTimeout = true;
      elapsed = timer;
    } else {
      elapsed = Math.min(think(), timer * 0.95);
    }
    // A decayed clock can undercut think time — that becomes a timeout too.
    if (!viaTimeout && node.decay && elapsed >= timer) {
      correct = false;
      viaTimeout = true;
      elapsed = timer;
    }

    // 50ms tick loop — passive threat, gusts, drain, spikes.
    for (let t = 0; t < elapsed && stamina > 0; t += ENGINE.TICK) {
      if (node.rise) {
        let rm = 1;
        if (node.enrage && threat >= max * 0.6) rm *= node.enrage;
        rm *= phaseMul;
        if (node.need > 1 && done >= node.need - 1) rm *= ENGINE.CRUX_RISE_MULT;
        rm = Math.min(rm, 2.0);
        raiseThreat(node.rise * ENGINE.TICK * rm);
      }
      if (node.gust && rnd() < node.gust * ENGINE.TICK) {
        raiseThreat(12 + Math.floor(rnd() * 10));
      }
      if (node.drain) stamina -= node.drain * ENGINE.TICK;
      if (node.spike) {
        spikeT += ENGINE.TICK;
        if (spikeT >= (node.spikeEvery || 3.5)) {
          spikeT = 0;
          raiseThreat(node.spike);
        }
      }
    }
    if (stamina <= 0) break;

    if (correct) {
      if (shieldLeft > 0) {
        shieldLeft--;
      } else {
        done++;
        if (node.phase && !phased && done >= Math.ceil(node.need / 2)) {
          phased = true;
          phaseMul = 1.5;
          raiseThreat(22);
        }
      }
      let ease = typeof node.ease === 'number' ? node.ease : ENGINE.EASE_ON_CORRECT;
      if (node.fatigue) {
        ease *= easeMul;
        easeMul = Math.max(0.35, easeMul - 0.14);
      }
      if (node.swift && timer > 0 && (timer - elapsed) / timer >= (node.swiftFrac ?? 0.5)) {
        ease += node.swift;
      }
      if (node.noBoonEase) ease = 0;
      threat = Math.max(0, threat - ease);
    } else {
      let cost = viaTimeout ? ENGINE.TIMEOUT_COST : ENGINE.MISS_COST;
      if (node.escalate) cost += missCount * node.escalate;
      missCount++;
      stamina -= cost;
      raiseThreat(node.miss);
      if (node.streakGate) done = Math.max(0, done - 2);
    }
  }

  const cleared = done >= node.need && stamina > 0;
  if (cleared) {
    stamina = Math.min(ENGINE.STAM_MAX, stamina + Math.round(node.restore * ENGINE.CLEAR_RESTORE_MULT));
  }
  return { cleared, stamina: Math.max(0, stamina), strikes, questions };
}

/** Tier → the route context this hazard is actually met in (see buildRoute). */
export const TIER_CONTEXT = {
  1: { act: 1, need: 3 },
  2: { act: 2, need: 5 },
  3: { act: 2, need: 5 },
  4: { act: 3, need: 4 },
  5: { act: 2, need: 5 }, // gate; serac/summit override below
};

export function contextFor(kind, tier) {
  if (kind === 'serac') return { act: 3, need: 5 };
  if (kind === 'summit') return { act: 3, need: 6 };
  return TIER_CONTEXT[tier];
}

/** Monte Carlo one bestiary entry in its home context. */
export function simHazard(entry, opts = {}) {
  const runs = opts.runs ?? 4000;
  const rnd = opts.rnd ?? Math.random;
  const probe = entry.fn(4, 3000);
  const ctx = contextFor(probe.kind, entry.t);

  let cleared = 0;
  let died = 0;
  let endSum = 0;
  let strikeSum = 0;
  let qSum = 0;

  for (let i = 0; i < runs; i++) {
    const need = ctx.need + (rnd() < 0.5 ? 0 : 1); // route's nd() jitter
    const node = H.scaleNode(entry.fn(need, 3000), ctx.act);
    const r = simPitch(node, { ...opts, rnd });
    if (r.cleared) cleared++;
    else died++;
    endSum += r.stamina;
    strikeSum += r.strikes;
    qSum += r.questions;
  }

  const start = opts.stamina ?? 75;
  const avgEnd = endSum / runs;
  return {
    kind: probe.kind,
    title: probe.title,
    tier: entry.t,
    act: ctx.act,
    need: ctx.need,
    clearRate: +(cleared / runs).toFixed(3),
    deathRate: +(died / runs).toFixed(3),
    avgEnd: +avgEnd.toFixed(1),
    avgCost: +(start - avgEnd).toFixed(1),
    avgStrikes: +(strikeSum / runs).toFixed(2),
    avgQuestions: +(qSum / runs).toFixed(1),
    // Single difficulty score: stamina bled + deaths weighted like a wipe.
    score: +((start - avgEnd) + (died / runs) * 60).toFixed(1),
  };
}

/** Simulate the whole bestiary, grouped + outlier-flagged per tier. */
export function simBestiary(opts = {}) {
  const rows = H.BESTIARY.map((entry) => simHazard(entry, opts));
  const tiers = {};
  for (const r of rows) (tiers[r.tier] ??= []).push(r);

  for (const t of Object.keys(tiers)) {
    const group = tiers[t].slice().sort((a, b) => a.score - b.score);
    const mid = group[Math.floor(group.length / 2)].score;
    // Allow ±35% around the median with an absolute floor so a tier of
    // near-zero warm-up scores doesn't flag on noise. Tier 5's set-pieces
    // (gate duel / serac / summit) are different roles on purpose.
    const band = Math.max(6, Math.abs(mid) * 0.35);
    for (const r of tiers[t]) {
      r.vsTierMedian = +(r.score - mid).toFixed(1);
      if (Number(t) === 5) { r.flag = ''; continue; }
      r.flag = r.score - mid > band ? 'OVERTUNED' : mid - r.score > band ? 'UNDERTUNED' : '';
    }
  }
  return rows;
}
