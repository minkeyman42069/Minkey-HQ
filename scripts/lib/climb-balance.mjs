/**
 * Climb economy model — mirrors index.html stamina/threat math.
 * Keep in sync with CONFIG + node factories when rebalancing.
 */

export const BALANCE = {
  STAM_MAX: 100,
  MISS_COST: 14,
  TIMEOUT_COST: 10,
  REST_RESTORE: 28,
  CLEAR_RESTORE_MULT: 0.85,
  EASE_ON_CORRECT: 6,
  THREAT_RESET: 75,
  CRUX_RISE_MULT: 1.2,
  ACT_SCALE: { rise: 0.20, miss: 0.08, hit: 0.10, timeDrop: 2 },
  MAX_BOONS: 5,
};

/** Representative post-rebalance route (~58 questions, 3 rests). */
export function defaultRoute() {
  const nd = (b) => b + (Math.random() < 0.5 ? 0 : 1);
  const scale = (n, act) => {
    if (n.kind === 'rest') return n;
    const sc = 1 + (act - 1) * BALANCE.ACT_SCALE.rise;
    return {
      ...n,
      act,
      rise: +(n.rise * sc).toFixed(2),
      miss: Math.round(n.miss * (1 + (act - 1) * BALANCE.ACT_SCALE.miss)),
      hit: Math.round(n.hit * (1 + (act - 1) * BALANCE.ACT_SCALE.hit)),
      time: Math.max(8, n.time - (act - 1) * BALANCE.ACT_SCALE.timeDrop),
    };
  };

  const nodes = [
    scale({ kind: 'switchback', need: nd(3), time: 18, rise: 0.8, miss: 26, ease: 7, hit: 12, restore: 14 }, 1),
    scale({ kind: 'traverse', need: nd(3), time: 16, rise: 1.5, miss: 16, ease: 6, hit: 14, restore: 16 }, 1),
    scale({ kind: 'crevasse', need: nd(4), time: 15, rise: 1.0, miss: 28, ease: 12, hit: 24, restore: 18 }, 1),
    scale({ kind: 'gate', need: nd(4), time: 17, rise: 1.35, miss: 30, ease: 12, hit: 20, restore: 22 }, 1),
    { kind: 'rest', restore: BALANCE.REST_RESTORE },
    scale({ kind: 'storm', need: nd(5), time: 12, rise: 2.0, miss: 15, ease: 0, hit: 16, restore: 16, noBoonEase: true }, 2),
    scale({ kind: 'berg', need: nd(5), time: 15, rise: 1.0, miss: 14, ease: 10, hit: 16, restore: 18, escalate: 4 }, 2),
    scale({ kind: 'void', need: nd(5), time: 15, rise: 1.4, miss: 20, ease: 10, hit: 16, restore: 18 }, 2),
    scale({ kind: 'gate', need: nd(5), time: 17, rise: 1.35, miss: 30, ease: 12, hit: 20, restore: 22 }, 2),
    { kind: 'rest', restore: BALANCE.REST_RESTORE },
    scale({ kind: 'icewall', need: nd(4), time: 14, rise: 1.6, miss: 24, ease: 9, hit: 20, restore: 18 }, 3),
    scale({ kind: 'thinair', need: nd(4), time: 16, rise: 1.0, miss: 18, ease: 8, hit: 12, restore: 16, drain: 0.20 }, 3),
    scale({ kind: 'whiteout', need: nd(4), time: 10, rise: 2.4, miss: 13, ease: 5, hit: 15, restore: 16 }, 3),
    scale({ kind: 'gate', need: nd(5), time: 17, rise: 1.35, miss: 30, ease: 12, hit: 20, restore: 22 }, 3),
    scale({ kind: 'serac', need: 5, time: 13, rise: 2.5, miss: 24, ease: 10, hit: 22, restore: 20, startThreat: 25 }, 3),
    { kind: 'rest', restore: BALANCE.REST_RESTORE },
    scale({ kind: 'summit', need: 6, time: 15, rise: 2.1, miss: 22, ease: 8, hit: 20, restore: 14, startThreat: 20 }, 3),
  ];
  return nodes;
}

function questionOutcome(acc, timeoutRate) {
  const r = Math.random();
  if (r < acc) return { correct: true, timeout: false };
  if (r < acc + timeoutRate) return { correct: false, timeout: true };
  return { correct: false, timeout: false };
}

function simPitch(node, stamina, acc, timeoutRate, boons) {
  let threat = node.startThreat || 0;
  const max = 100;
  let done = 0;
  let missCount = 0;
  let strikes = 0;

  if (boons.provisions) stamina = Math.min(BALANCE.STAM_MAX, stamina + 5);

  for (let q = 0; q < node.need; q++) {
    const time = node.time || 16;
    const crux = node.need > 1 && done >= node.need - 1;
    let riseMult = crux ? BALANCE.CRUX_RISE_MULT : 1;
    if (boons.updraft) riseMult *= 0.68;

    // passive threat per question: rise * 0.05 per 50ms tick ≈ rise * seconds
    threat += node.rise * time * riseMult;
    if (node.drain) stamina -= node.drain * time;

    const out = questionOutcome(acc, timeoutRate);
    if (out.correct) {
      done++;
      let ease = typeof node.ease === 'number' ? node.ease : BALANCE.EASE_ON_CORRECT;
      if (node.noBoonEase) ease = 0;
      else if (boons.wildfire) ease += 2;
      threat = Math.max(0, threat - ease);
    } else {
      let cost = out.timeout ? BALANCE.TIMEOUT_COST : BALANCE.MISS_COST;
      if (node.escalate) cost += missCount * node.escalate;
      missCount++;
      stamina -= cost;
      threat += node.miss;
    }

    while (threat >= max && stamina > 0) {
      threat = Math.max(0, threat - BALANCE.THREAT_RESET);
      let hit = node.hit;
      if (boons.anchor) hit = Math.round(hit * 0.62);
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
  const route = opts.route ?? defaultRoute();

  let stamina = BALANCE.STAM_MAX;
  let summited = false;
  let totalStrikes = 0;
  let act3Entry = null;

  for (const node of route) {
    if (node.act === 3 && act3Entry === null) act3Entry = stamina;

    if (node.kind === 'rest') {
      stamina = Math.min(BALANCE.STAM_MAX, stamina + node.restore);
      continue;
    }

    const res = simPitch(node, stamina, acc, timeoutRate, boons);
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

  for (let i = 0; i < n; i++) {
    const r = simulateClimb(opts);
    if (r.summited) wins++;
    if (r.act3Entry !== null && r.act3Entry > 0) act3Alive++;
    totalStrikes += r.totalStrikes;
  }

  return {
    runs: n,
    summitRate: +(wins / n).toFixed(3),
    act3Survival: +(act3Alive / n).toFixed(3),
    avgStrikes: +(totalStrikes / n).toFixed(2),
    opts,
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
