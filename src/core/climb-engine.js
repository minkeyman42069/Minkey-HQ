/**
 * CLIMB ENGINE — the one combat truth.
 *
 * Every consumer of the climb's combat math drives this module:
 *   - index.html (browser UI) wraps these functions with DOM/audio,
 *   - the Sandbox Steward's pitch simulator delegates here,
 *   - the balance gate Monte-Carlos whole climbs through `playClimb`,
 *   - the terminal client (`npm run play`) is a thin readline frontend.
 *
 * Nothing in here touches the DOM. State mutations happen on the caller's
 * run/enc objects; anything a frontend must present (strikes, banners,
 * shield cracks, falls) is appended to an `events` array the caller maps
 * to its own rendering. All randomness comes through an injected rng so a
 * seeded climb is identical everywhere.
 */

/** Small deterministic PRNG (mulberry32). Canonical home; steward re-exports. */
export function seededRng(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

/** Minimal run state shaped like index.html's freshRun. */
export function blankRun(over = {}) {
  const run = {
    topic: over.topic || null,
    oath: over.oath || 'none',
    route: over.route || [],
    nodeIdx: over.nodeIdx || 0,
    prog: over.prog || {},
    locked: new Set(over.locked || []),
    mastered: new Set(over.mastered || []),
    boons: new Set(over.boons || []),
    flares: over.flares || 0,
    stamina: over.stamina != null ? over.stamina : 100,
    altitude: over.altitude || 1600,
    seen: 0,
    right: 0,
    bestStreak: 0,
    nodeCleared: 0,
    summited: false,
    stones: {},
    stoneNow: null,
    recovered: 0,
    weather: over.weather || null,
    relics: new Set(over.relics || []),
    relicLog: [],
    iceaxeUsed: false,
    clutch: 0,
    lastLegsTold: false,
    freeDraft: false,
    freeDraftFrom: null,
    usedTales: [],
    recent: [],
    ending: false,
  };
  if (run.boons.has('flare')) run.flares = run.flares || 2;
  return run;
}

/** Encounter state shaped like index.html's ENC. */
export function blankEnc(node, over = {}) {
  return {
    node,
    need: node.need,
    done: 0,
    threat: over.threat != null ? over.threat : node.startThreat || 0,
    max: node.max || 100,
    lifelineUsed: false,
    firstMissUsed: false,
    firstTimeoutUsed: false,
    rallyUsed: false,
    bulwarkUsed: false,
    streakEase: 0,
    cairnBank: 0,
    missCount: 0,
    spikeT: 0,
    shieldLeft: node.shield || 0,
    easeMul: 1,
    timeMul: 1,
    phaseMul: 1,
    phased: false,
    luckyUsed: false,
    cruxTold: false,
    streak: 0,
    lastId: -1,
  };
}

/** Entry threat for a pitch: kind seeds merged with any route-set startThreat. */
export function entryThreat(node) {
  let t = node.startThreat || 0;
  if (node.kind === 'serac') t = Math.max(t, 25);
  if (node.kind === 'summit') t = Math.max(t, 20);
  return t;
}

const ctxOf = (trail, run, enc, rnd, extra) =>
  trail.makeCtx(run, enc, { rnd, ...(extra || {}) });

/**
 * Clamp stamina and detect falls. `enc` may be null (camps, tales); falls
 * and last-legs only trigger inside an encounter, matching the browser.
 * Events: {t:'lastlegs'} | {t:'iceaxe'} | {t:'fell'}
 */
export function addStamina(trail, run, enc, x, events) {
  const C = trail.CONFIG;
  run.stamina = clamp(run.stamina + x, 0, C.STAM_MAX);
  if (run.stamina > 0 && run.stamina <= 25 && enc && !run.lastLegsTold) {
    run.lastLegsTold = true;
    if (events) events.push({ t: 'lastlegs' });
  }
  if (run.stamina <= 0 && enc && !run.ending) {
    if (C.MODS.relics && run.relics && run.relics.has('iceaxe') && !run.iceaxeUsed) {
      run.iceaxeUsed = true;
      run.stamina = 1;
      if (events) events.push({ t: 'iceaxe' });
      return;
    }
    run.ending = true;
    if (events) events.push({ t: 'fell' });
  }
}

/**
 * The mountain strikes: threat crossed the bar. Order of mitigation matches
 * the browser exactly — oath gate mult, then carabiner, then rope.
 * Events: {t:'strike', blocked, hit}
 */
function mountainStrike(trail, run, enc, rnd, events) {
  const C = trail.CONFIG;
  enc.threat = Math.max(0, enc.threat - C.THREAT_RESET);
  const sout = trail.emit('mountain:strike', ctxOf(trail, run, enc, rnd));
  if (sout.blocked) {
    if (events) events.push({ t: 'strike', blocked: true, hit: 0, banners: sout.banners || [] });
    return;
  }
  let hit = sout.hit != null ? sout.hit : enc.node.hit;
  if (enc.node.kind === 'gate') {
    hit = Math.round(hit * trail.agents.expedition.api.oathGateHitMult(run));
  }
  if (run.relics && run.relics.has('carabiner') && !enc.luckyUsed) {
    enc.luckyUsed = true;
    hit = Math.round(hit * 0.5);
  }
  if (run.relics && run.relics.has('rope') && enc.node.kind === 'gate') hit = Math.round(hit * 0.75);
  addStamina(trail, run, enc, -hit, events);
  if (events) events.push({ t: 'strike', blocked: false, hit, banners: sout.banners || [] });
}

/** Raise threat; a full bar resolves into one strike (browser semantics). */
export function raiseThreat(trail, run, enc, x, rnd, events) {
  if (!enc) return;
  enc.threat = clamp(enc.threat + x, 0, enc.max);
  if (enc.threat >= enc.max) mountainStrike(trail, run, enc, rnd, events);
}

/**
 * Passive hazard behavior for `dt` seconds on the pitch: threat rise (with
 * enrage / phase / crux / oath / weather multipliers), gusts, drain, spikes.
 * The browser calls this once per 50ms tick; simulators batch whole seconds.
 * Events: {t:'gust', amount, banners} | {t:'spike'} plus strike/fall events.
 */
export function tickDrift(trail, run, enc, dt, rnd, events) {
  const C = trail.CONFIG;
  const node = enc.node;
  if (node.rise) {
    let rm = trail.agents.boon.api.riseMultiplier(ctxOf(trail, run, enc, rnd));
    if (node.enrage && enc.threat >= enc.max * 0.6) rm *= node.enrage;
    if (enc.phaseMul) rm *= enc.phaseMul;
    if (enc.need > 1 && enc.done >= enc.need - 1) rm *= C.CRUX_RISE_MULT;
    rm = Math.min(rm, 2.0);
    const oathR = trail.agents.expedition.api.oathRiseMult(run);
    raiseThreat(trail, run, enc, node.rise * dt * rm * (run.weather ? run.weather.rise : 1) * oathR, rnd, events);
  }
  if (node.gust && rnd() < node.gust * dt) {
    const gustAmt = 12 + Math.floor(rnd() * 10);
    const gout = trail.emit('hazard:gust', ctxOf(trail, run, enc, rnd, { gust: gustAmt }));
    raiseThreat(trail, run, enc, gout.threatDelta != null ? gout.threatDelta : gustAmt, rnd, events);
    if (events) events.push({ t: 'gust', amount: gustAmt, banners: gout.banners || [] });
  }
  if (node.drain) addStamina(trail, run, enc, -node.drain * dt, events);
  if (node.spike) {
    enc.spikeT += dt;
    while (enc.spikeT >= (node.spikeEvery || 3.5)) {
      enc.spikeT -= node.spikeEvery || 3.5;
      if (events) events.push({ t: 'spike' });
      raiseThreat(trail, run, enc, node.spike, rnd, events);
    }
  }
}

/**
 * Resolve one answer against the current encounter — streaks, shields,
 * phase release, crux flag, streak-gate knockback, and every boon hook.
 * Pure engine: scheduler grading, audio, and rendering stay with the caller.
 *
 * Returns { events, timeDelta, cleared } — timeDelta is for callers with a
 * live clock; `cleared` means done reached need on this answer.
 * Events: {t:'shield', left} | {t:'phase'} | {t:'crux'} | {t:'knockback'}
 *         | {t:'banners', banners} plus strike/fall events.
 *
 * `run.seen` stays caller-owned (the browser bumps it before its
 * loose-stone bookkeeping); `run.right` and streaks are owned here.
 */
export function resolveAnswer(trail, run, enc, opts) {
  const { correct, viaTimeout, rnd } = opts;
  const events = opts.events || [];
  let timeDelta = 0;
  if (correct) {
    run.right++;
    enc.streak++;
    run.bestStreak = Math.max(run.bestStreak, enc.streak);
    if (enc.shieldLeft > 0) {
      enc.shieldLeft--;
      events.push({ t: 'shield', left: enc.shieldLeft });
    } else {
      enc.done++;
      if (enc.node.phase && !enc.phased && enc.done >= Math.ceil(enc.need / 2)) {
        enc.phased = true;
        enc.phaseMul = 1.5;
        raiseThreat(trail, run, enc, 22, rnd, events);
        events.push({ t: 'phase' });
      }
      if (enc.need > 1 && enc.done === enc.need - 1 && !enc.cruxTold) {
        enc.cruxTold = true;
        events.push({ t: 'crux' });
      }
    }
    const bout = trail.emit('answer:correct', ctxOf(trail, run, enc, rnd));
    if (bout.staminaDelta) addStamina(trail, run, enc, bout.staminaDelta, events);
    if (bout.timeDelta) timeDelta = bout.timeDelta;
    if (bout.threatDelta) raiseThreat(trail, run, enc, bout.threatDelta, rnd, events);
    if (bout.banners && bout.banners.length) events.push({ t: 'banners', banners: bout.banners });
  } else {
    const wout = trail.emit('answer:wrong', ctxOf(trail, run, enc, rnd, { viaTimeout: !!viaTimeout }));
    if (!wout.keepStreak) {
      enc.streak = 0;
      enc.streakEase = 0;
    }
    if (wout.staminaCost > 0) addStamina(trail, run, enc, -wout.staminaCost, events);
    else if (wout.staminaDelta) addStamina(trail, run, enc, wout.staminaDelta, events);
    if (wout.threatDelta) raiseThreat(trail, run, enc, wout.threatDelta, rnd, events);
    if (wout.banners && wout.banners.length) events.push({ t: 'banners', banners: wout.banners });
    if (enc.node.streakGate) {
      enc.done = Math.max(0, enc.done - 2);
      events.push({ t: 'knockback' });
    }
  }
  return { events, timeDelta, cleared: enc.done >= enc.need };
}

/** Next pitch that will actually be fought (skips camps and choice nodes). */
export function nextCombatNode(run) {
  for (let i = run.nodeIdx; i < run.route.length; i++) {
    const k = run.route[i].kind;
    if (k !== 'rest' && k !== 'shrine' && k !== 'tale') return run.route[i];
  }
  return null;
}

/**
 * Apply a Cairn Keeper tale effect object to the run. Relic grants go
 * through `opts.grantRelic` so each frontend keeps its own presentation.
 * Pass `opts.enc` (the browser passes its lingering ENC) so a fatal
 * stamina cost at a cairn still ends the run, exactly as before.
 */
export function applyTaleFx(trail, run, fx, opts = {}) {
  if (!fx) return;
  if (fx.stam) addStamina(trail, run, opts.enc || null, fx.stam, opts.events);
  if (fx.relic && opts.grantRelic) opts.grantRelic();
  if (fx.draftNext) {
    run.freeDraft = true;
    run.freeDraftFrom = 'tale';
  }
  if (fx.threatNext) {
    const n = nextCombatNode(run);
    if (n) n.startThreat = Math.min(90, (n.startThreat || 0) + fx.threatNext);
  }
  if (fx.easeNext) {
    const m = nextCombatNode(run);
    if (m && m.need) m.need = Math.max(2, m.need - fx.easeNext);
  }
}

/* ---------- Headless single-pitch simulator ---------- */

/**
 * Simulate one pitch on a prepared node by driving the real hook bus.
 * This is the Staff Sandbox's Pitch Lab and the Route Setter's grader.
 * Output shape matches the sandbox UI contract:
 *   { node, start, steps, strikes, cleared, final }
 * with steps rows {n, correct, viaTimeout, stamina, threat, streak, done,
 * banners[], shield?, cleared?} interleaved with {kind:'strike', ...} rows.
 */
export function simulatePitchNode(trail, node, opts = {}) {
  const C = trail.CONFIG;
  const rnd = seededRng(opts.seed || 1);
  const run = blankRun({
    boons: opts.boons || [],
    relics: opts.relics || [],
    weather: opts.weather || null,
    stamina: opts.stamina != null ? opts.stamina : C.STAM_MAX,
    nodeIdx: opts.nodeIdx || 0,
  });
  const enc = blankEnc(node, { threat: node.startThreat || 0 });
  const steps = [];
  let strikes = 0;
  const evts = [];

  // Map engine events onto sandbox step rows. Strike rows are their own
  // entries (chronologically before the answer row that caused them).
  const drain = (step) => {
    for (const e of evts) {
      if (e.t === 'strike') {
        if (!e.blocked) strikes++;
        steps.push({ kind: 'strike', blocked: e.blocked, hit: e.hit, banners: e.banners || [] });
      } else if (step) {
        if (e.t === 'banners' && e.banners) step.banners.push(...e.banners);
        if (e.t === 'gust' && e.banners) step.banners.push(...e.banners);
        if (e.t === 'shield') step.shield = e.left;
        if (e.t === 'phase') step.banners.push({ title: 'The slope lets go', sub: 'it releases all at once' });
        if (e.t === 'knockback') step.banners.push({ title: 'Knocked back', sub: 'you slide down the ridge' });
      }
    }
    evts.length = 0;
  };

  const pe = trail.emit('pitch:enter', ctxOf(trail, run, enc, rnd));
  if (pe.staminaDelta) addStamina(trail, run, enc, pe.staminaDelta, evts);
  drain(null);
  const start = { stamina: run.stamina, threat: Math.round(enc.threat), banners: pe.banners || [] };

  const answers = (opts.answers || []).map((a) =>
    typeof a === 'boolean' ? { correct: a, viaTimeout: false } : a,
  );
  const dps = opts.secondsPerQuestion || 0;

  for (let i = 0; i < answers.length && run.stamina > 0; i++) {
    const a = answers[i];
    if (dps) tickDrift(trail, run, enc, dps, rnd, evts);
    drain(null);
    if (run.stamina <= 0) break;

    const qs = trail.emit('question:start', ctxOf(trail, run, enc, rnd));
    if (qs.staminaDelta) addStamina(trail, run, enc, qs.staminaDelta, evts);

    const step = { n: i + 1, correct: a.correct, viaTimeout: !!a.viaTimeout, banners: [] };
    if (qs.banners && qs.banners.length) step.banners.push(...qs.banners);

    run.seen++;
    resolveAnswer(trail, run, enc, { correct: a.correct, viaTimeout: !!a.viaTimeout, rnd, events: evts });
    drain(step);

    step.stamina = run.stamina;
    step.threat = Math.round(enc.threat);
    step.streak = enc.streak;
    step.done = enc.done;
    steps.push(step);
    if (enc.done >= enc.need) {
      step.cleared = true;
      break;
    }
  }

  const cleared = enc.done >= enc.need;
  let clearRestore = 0;
  if (cleared) {
    const co = trail.emit('pitch:clear', ctxOf(trail, run, enc, rnd));
    clearRestore = (co.clearBonus || 0) + trail.pitchRestore(node, 'clear', run);
    addStamina(trail, run, null, clearRestore, null);
  }

  return {
    node,
    start,
    steps,
    strikes,
    cleared,
    final: {
      stamina: run.stamina,
      threat: Math.round(enc.threat),
      streak: enc.streak,
      bestStreak: run.bestStreak,
      done: enc.done,
      need: enc.need,
      clearRestore,
      survived: run.stamina > 0,
    },
  };
}

/* ---------- Headless whole-climb driver ---------- */

function questionOutcome(accuracy, timeoutRate, rnd) {
  const r = rnd();
  if (r < accuracy) return { correct: true, viaTimeout: false };
  return { correct: false, viaTimeout: r < accuracy + timeoutRate };
}

/** Relic-drop kinds on clear, mirroring the browser's list. */
const RELIC_DROP_KINDS = ['whiteout', 'thinair', 'icefall', 'tempest', 'closing', 'avalanche', 'frozentitan'];

/**
 * Book a cleared pitch: clutch ledger, pitch:clear payout, stamina restore,
 * and hard-kind relic drops. Returns { restore, clutch, relic }.
 */
export function clearPitch(trail, run, enc, opts = {}) {
  const rnd = opts.rnd || Math.random;
  run.nodeCleared++;
  const cout = trail.emit('pitch:clear', ctxOf(trail, run, enc, rnd));
  const clutch = run.stamina > 0 && run.stamina <= 25;
  if (clutch) run.clutch = (run.clutch || 0) + 1;
  const restore = trail.pitchRestore(enc.node, 'clear', run) + (cout.clearBonus || 0);
  addStamina(trail, run, null, restore, null);
  let relic = false;
  if (RELIC_DROP_KINDS.indexOf(enc.node.kind) >= 0 &&
      rnd() < (run.weather && run.weather.name === 'Dead of Night' ? 0.5 : 0.3)) {
    relic = true;
    if (opts.grantRelic) opts.grantRelic();
  }
  return { restore, clutch, relic };
}

/**
 * Play one full climb headlessly through the real bus.
 *
 * opts:
 *   seed            rng seed (default 1)
 *   accuracy        P(correct) per question (default 0.82)
 *   timeoutRate     P(timeout | wrong) share of the remaining mass (default 0.06)
 *   answerSeconds   passive-hazard seconds burned per question (default 7)
 *   fixedBoons      boon ids granted at the trailhead (default [])
 *   draftPolicy     'none' | 'first' — take drafts at camps/gates/spoils (default 'none')
 *   talePolicy      'skip' | 'first' | 'second' — story cairn choices (default 'skip';
 *                   'skip' keeps the balance gate neutral on player-driven nodes)
 *   shrinePolicy    'pass' | 'offer' (default 'pass')
 *   weather         weather object or null (default null)
 *   maxQuestionsPerPitch  loop guard (default need*3+10)
 *
 * Returns { summited, fell, stamina, act3Entry, strikes, seen, right,
 *           bestStreak, nodeCleared, altitude, questions }
 */
export function playClimb(trail, opts = {}) {
  const C = trail.CONFIG;
  const rnd = seededRng(opts.seed != null ? opts.seed : 1);
  const accuracy = opts.accuracy != null ? opts.accuracy : 0.82;
  const timeoutRate = opts.timeoutRate != null ? opts.timeoutRate : 0.06;
  const answerSeconds = opts.answerSeconds != null ? opts.answerSeconds : 7;
  const draftPolicy = opts.draftPolicy || 'none';
  const talePolicy = opts.talePolicy || 'skip';
  const run = blankRun({ weather: opts.weather || null, stamina: C.STAM_MAX });
  run.route = trail.buildRoute(rnd, opts.topic || null);
  const grantRelic = () => trail.economy.grantRelic({ run, config: C, rnd, banner: null, renderHeld: null });

  for (const id of opts.fixedBoons || []) {
    run.boons.add(id);
    trail.agents.boon.api.onAcquire(ctxOf(trail, run, null, rnd), id);
  }

  const takeDraft = (enc) => {
    if (draftPolicy === 'none') return;
    if (run.boons.size >= C.MAX_BOONS) return;
    const picks = trail.agents.boon.api.pickDraft(ctxOf(trail, run, enc, rnd), rnd);
    const real = (picks || []).filter((p) => p !== '_stamina');
    if (real.length) {
      run.boons.add(real[0]);
      trail.agents.boon.api.onAcquire(ctxOf(trail, run, enc, rnd), real[0]);
    }
  };

  let act3Entry = null;
  let strikes = 0;
  let questions = 0;

  for (let ni = 0; ni < run.route.length; ni++) {
    const node = run.route[ni];
    run.nodeIdx = ni;
    if (node.act === 3 && act3Entry === null) act3Entry = run.stamina;

    if (node.kind === 'rest') {
      addStamina(trail, run, null, trail.pitchRestore(node, 'rest', run), null);
      const scholarDraft = run.freeDraft;
      if (scholarDraft) { run.freeDraft = false; run.freeDraftFrom = null; }
      if (draftPolicy !== 'none' || scholarDraft) takeDraft(null);
      continue;
    }
    if (node.kind === 'shrine') {
      if (opts.shrinePolicy === 'offer') { addStamina(trail, run, null, -12, null); grantRelic(); }
      continue;
    }
    if (node.kind === 'tale') {
      if (talePolicy === 'skip') continue;
      const keeper = trail.agents.keeper.api;
      const tale = keeper.drawTale(rnd, node.act || 1, run.usedTales);
      run.usedTales.push(tale.id);
      const choice = tale.choices[talePolicy === 'second' ? 1 : 0] || tale.choices[0];
      const out = keeper.resolveChoice(choice, rnd);
      applyTaleFx(trail, run, out.fx, { grantRelic });
      continue;
    }

    // Combat pitch through the real bus.
    const enc = blankEnc(node, { threat: entryThreat(node) });
    run.altitude = node.alt || run.altitude;
    const evts = [];
    const pe = trail.emit('pitch:enter', ctxOf(trail, run, enc, rnd));
    if (pe.staminaDelta) addStamina(trail, run, enc, pe.staminaDelta, evts);

    const cap = opts.maxQuestionsPerPitch || node.need * 3 + 10;
    let asked = 0;
    while (run.stamina > 0 && enc.done < enc.need && asked < cap) {
      asked++;
      questions++;
      tickDrift(trail, run, enc, answerSeconds, rnd, evts);
      if (run.stamina <= 0) break;
      const qs = trail.emit('question:start', ctxOf(trail, run, enc, rnd));
      if (qs.staminaDelta) addStamina(trail, run, enc, qs.staminaDelta, evts);
      const o = questionOutcome(accuracy, timeoutRate, rnd);
      run.seen++;
      resolveAnswer(trail, run, enc, { correct: o.correct, viaTimeout: o.viaTimeout, rnd, events: evts });
    }
    strikes += evts.filter((e) => e.t === 'strike' && !e.blocked).length;

    if (run.stamina <= 0 || enc.done < enc.need) {
      return {
        summited: false, fell: true, stamina: run.stamina, act3Entry, strikes,
        seen: run.seen, right: run.right, bestStreak: run.bestStreak,
        nodeCleared: run.nodeCleared, altitude: run.altitude, questions,
      };
    }

    // Clear: clutch ledger, hook payout, restore, relic drops, spoils draft.
    clearPitch(trail, run, enc, { rnd, grantRelic });
    if (node.kind === 'summit') {
      run.summited = true;
      return {
        summited: true, fell: false, stamina: run.stamina, act3Entry, strikes,
        seen: run.seen, right: run.right, bestStreak: run.bestStreak,
        nodeCleared: run.nodeCleared, altitude: run.altitude, questions,
      };
    }
    const spoils = trail.agents.expedition.api.spoilsDraftEligible(node, 'clear') && rnd() < 0.42;
    const promised = run.freeDraft;
    if (promised) { run.freeDraft = false; run.freeDraftFrom = null; }
    if (node.kind === 'gate' || spoils || promised) takeDraft(enc);
  }

  return {
    summited: false, fell: run.stamina <= 0, stamina: run.stamina, act3Entry, strikes,
    seen: run.seen, right: run.right, bestStreak: run.bestStreak,
    nodeCleared: run.nodeCleared, altitude: run.altitude, questions,
  };
}
