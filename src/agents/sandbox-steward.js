/**
 * SANDBOX STEWARD — deterministic control surface for the Staff Sandbox.
 *
 * This agent never touches a live climb. It builds throwaway run/encounter
 * state, then drives the *real* Trail hook bus so the sandbox shows exactly
 * what every gameplay staff member would do — reproducibly, from a seed.
 */

/** Kind → Hazard Warden factory name. Pitch nodes only (no rest/shrine). */
export const NODE_FACTORIES = {
  switchback: 'nSwitch', storm: 'nStorm', gate: 'nGate', serac: 'nSerac', summit: 'nSummit',
  whiteout: 'nWhiteout', crevasse: 'nCrevasse', traverse: 'nTraverse', thinair: 'nThinAir',
  icefall: 'nIcefall', void: 'nVoid', knife: 'nKnife', berg: 'nBergschrund', snowfield: 'nSnowfield',
  couloir: 'nCouloir', icewall: 'nIcewall', windslab: 'nWindslab', sealedface: 'nSealedFace',
  longwall: 'nLongWall', tempest: 'nTempest', closing: 'nClosing', avalanche: 'nAvalanche',
  corniceridge: 'nCorniceRidge', frozentitan: 'nFrozenTitan', rockfall: 'nRockfall', verglas: 'nVerglas',
};

/** Small deterministic PRNG (mulberry32) so every sandbox run is reproducible. */
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

export function createSandboxSteward() {
  const api = {
    factories: NODE_FACTORIES,
    seededRng,

    /** All pitch kinds this sandbox can spawn. */
    pitchKinds() {
      return Object.keys(NODE_FACTORIES);
    },

    /** Build a throwaway RUN shaped like index.html's freshRun (minimal). */
    blankRun(over = {}) {
      const run = {
        topic: over.topic || null,
        route: [],
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
        recovered: 0,
        weather: over.weather || null,
        relics: new Set(over.relics || []),
        relicLog: [],
        recent: [],
      };
      if (run.boons.has('flare')) run.flares = run.flares || 2;
      return run;
    },

    /** Build a throwaway ENC shaped like index.html's encounter state. */
    blankEnc(node, over = {}) {
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
    },

    /** Spawn any pitch node via the real Hazard Warden factories, scaled to an act. */
    spawnNode(trail, opts = {}) {
      const H = trail.agents.hazard.api;
      const kind = opts.kind || 'switchback';
      const fnName = NODE_FACTORIES[kind];
      if (!fnName || !H[fnName]) throw new Error('Unknown pitch kind: ' + kind);
      const need = opts.need != null ? opts.need : 4;
      const alt = opts.alt != null ? opts.alt : 2000;
      const act = clamp(opts.act || 1, 1, 3);
      let node;
      if (kind === 'gate') node = H.nGate(need, alt, opts.domain || null);
      else node = H[fnName](need, alt);
      // Encounter-entry threat seeds (mirrors index.html enterCurrentNode).
      if (kind === 'serac') node.startThreat = 25;
      if (kind === 'summit') node.startThreat = 20;
      return H.scaleNode(node, act);
    },

    /** Preview the boon draft a ledge would offer, deterministically. */
    previewDraft(trail, opts = {}) {
      const run = api.blankRun({
        boons: opts.owned || [],
        stamina: opts.stamina != null ? opts.stamina : 60,
        nodeIdx: opts.nodeIdx || 0,
      });
      const enc = api.blankEnc(api.spawnNode(trail, { kind: 'switchback' }));
      const ctx = trail.makeCtx(run, enc);
      const rnd = seededRng(opts.seed || 1);
      return trail.agents.boon.api.pickDraft(ctx, rnd, opts.count || 3);
    },

    /**
     * Simulate a single pitch by driving the real hook bus.
     *
     * @param {object} trail  kernel handle (window.Trail)
     * @param {object} opts
     *   kind, act, need, boons[], relics[], weather (object), seed,
     *   answers: array of booleans OR {correct, viaTimeout},
     *   secondsPerQuestion: passive threat drift applied between answers (0 = off)
     * @returns {{node, start, steps, final, cleared, strikes}}
     */
    simulatePitch(trail, opts = {}) {
      const CONFIG = trail.CONFIG;
      const rnd = seededRng(opts.seed || 1);
      const node = api.spawnNode(trail, {
        kind: opts.kind,
        need: opts.need,
        act: opts.act,
        alt: opts.alt,
        domain: opts.domain,
      });
      const run = api.blankRun({
        boons: opts.boons || [],
        relics: opts.relics || [],
        weather: opts.weather || null,
        stamina: opts.stamina != null ? opts.stamina : CONFIG.STAM_MAX,
        nodeIdx: opts.nodeIdx || 0,
      });
      const enc = api.blankEnc(node, { threat: node.startThreat || 0 });
      const steps = [];
      let strikes = 0;

      const ctx = (extra) => trail.makeCtx(run, enc, { rnd, ...(extra || {}) });
      const addStamina = (x) => {
        run.stamina = clamp(run.stamina + x, 0, CONFIG.STAM_MAX);
      };

      // Faithful re-implementation of index.html raiseThreat + mountainStrikes.
      const raiseThreat = (x) => {
        enc.threat = clamp(enc.threat + x, 0, enc.max);
        if (enc.threat >= enc.max) {
          enc.threat = Math.max(0, enc.threat - CONFIG.THREAT_RESET);
          const sout = trail.emit('mountain:strike', ctx());
          if (sout.blocked) {
            steps.push({ kind: 'strike', blocked: true, banners: sout.banners || [] });
            return;
          }
          let hit = sout.hit != null ? sout.hit : node.hit;
          if (run.relics.has('carabiner') && !enc.luckyUsed) {
            enc.luckyUsed = true;
            hit = Math.round(hit * 0.5);
          }
          if (run.relics.has('rope') && node.kind === 'gate') hit = Math.round(hit * 0.75);
          addStamina(-hit);
          strikes++;
          steps.push({ kind: 'strike', blocked: false, hit, banners: sout.banners || [] });
        }
      };

      const weatherRise = run.weather ? run.weather.rise : 1;
      const driftPerSec = opts.secondsPerQuestion || 0;
      const applyDrift = () => {
        if (!driftPerSec || !node.rise) return;
        let rm = trail.agents.boon.api.riseMultiplier(ctx());
        if (node.enrage && enc.threat >= enc.max * 0.6) rm *= node.enrage;
        if (enc.phaseMul) rm *= enc.phaseMul;
        if (enc.need > 1 && enc.done >= enc.need - 1) rm *= CONFIG.CRUX_RISE_MULT;
        rm = Math.min(rm, 2.0);
        raiseThreat(node.rise * rm * weatherRise * driftPerSec);
      };

      // --- pitch:enter ---
      const pe = trail.emit('pitch:enter', ctx());
      if (pe.staminaDelta) addStamina(pe.staminaDelta);
      const start = { stamina: run.stamina, threat: Math.round(enc.threat), banners: pe.banners || [] };

      const answers = (opts.answers || []).map((a) =>
        typeof a === 'boolean' ? { correct: a, viaTimeout: false } : a,
      );

      for (let i = 0; i < answers.length && run.stamina > 0; i++) {
        const a = answers[i];
        applyDrift();

        const qs = trail.emit('question:start', ctx());
        if (qs.staminaDelta) addStamina(qs.staminaDelta);

        const step = { n: i + 1, correct: a.correct, viaTimeout: !!a.viaTimeout, banners: [] };
        if (qs.banners && qs.banners.length) step.banners.push(...qs.banners);

        if (a.correct) {
          enc.streak++;
          run.bestStreak = Math.max(run.bestStreak, enc.streak);
          if (enc.shieldLeft > 0) {
            enc.shieldLeft--;
            step.shield = enc.shieldLeft;
          } else {
            enc.done++;
            if (node.phase && !enc.phased && enc.done >= Math.ceil(enc.need / 2)) {
              enc.phased = true;
              enc.phaseMul = 1.5;
              raiseThreat(22);
              step.banners.push({ title: 'The slope lets go', sub: 'it releases all at once' });
            }
          }
          const out = trail.emit('answer:correct', ctx());
          if (out.staminaDelta) addStamina(out.staminaDelta);
          if (out.threatDelta) raiseThreat(out.threatDelta);
          if (out.banners) step.banners.push(...out.banners);
          step.threatDelta = out.threatDelta || 0;
        } else {
          const out = trail.emit('answer:wrong', ctx({ viaTimeout: a.viaTimeout }));
          if (!out.keepStreak) {
            enc.streak = 0;
            enc.streakEase = 0;
          }
          if (out.staminaCost > 0) addStamina(-out.staminaCost);
          else if (out.staminaDelta) addStamina(out.staminaDelta);
          if (out.threatDelta) raiseThreat(out.threatDelta);
          if (out.banners) step.banners.push(...out.banners);
          if (node.streakGate) {
            enc.done = Math.max(0, enc.done - 2);
            step.banners.push({ title: 'Knocked back', sub: 'you slide down the ridge' });
          }
          step.threatDelta = out.threatDelta || 0;
        }

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
        const co = trail.emit('pitch:clear', ctx());
        clearRestore = (co.clearBonus || 0) + trail.pitchRestore(node, 'clear', run);
        addStamina(clearRestore);
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
    },

    /**
     * Grade a set line the way a guidebook would: Monte Carlo the whole
     * route through the real bus and map the summit rate to an alpine
     * grade (F → ED). Deterministic from the seed.
     */
    gradeLine(trail, spec, opts = {}) {
      const CONFIG = trail.CONFIG;
      const runs = opts.runs || 200;
      const acc = opts.accuracy ?? 0.82;
      const timeoutRate = opts.timeoutRate ?? 0.06;
      const route = trail.agents.expedition.api.buildSetRoute(spec, CONFIG);
      const pitchIdx = route.map((n, i) => i).filter((i) => route[i].kind !== 'rest');
      const deaths = route.map(() => 0);
      let summits = 0;
      let endSum = 0;

      for (let r = 0; r < runs; r++) {
        const rnd = seededRng((opts.seed || 1) * 7919 + r);
        let stamina = CONFIG.STAM_MAX;
        let alive = true;
        for (let i = 0; i < route.length && alive; i++) {
          const node = route[i];
          if (node.kind === 'rest') {
            stamina = Math.min(CONFIG.STAM_MAX, stamina + CONFIG.REST_RESTORE);
            continue;
          }
          const answers = [];
          for (let q = 0; q < node.need * 3 + 6; q++) {
            const roll = rnd();
            if (roll < acc) answers.push({ correct: true, viaTimeout: false });
            else answers.push({ correct: false, viaTimeout: roll < acc + timeoutRate });
          }
          const res = api.simulatePitch(trail, {
            kind: node.kind, need: node.need, act: node.act, alt: node.alt,
            stamina, seed: Math.floor(rnd() * 1e9) + 1, answers, secondsPerQuestion: 6,
          });
          stamina = res.final.stamina;
          if (!res.final.survived || !res.cleared) { alive = false; deaths[i]++; }
        }
        if (alive) { summits++; endSum += stamina; }
      }

      const rate = summits / runs;
      const GRADES = [
        [0.70, 'F', 'Facile'], [0.55, 'PD', 'Peu Difficile'], [0.40, 'AD', 'Assez Difficile'],
        [0.25, 'D', 'Difficile'], [0.12, 'TD', 'Très Difficile'], [-1, 'ED', 'Extrêmement Difficile'],
      ];
      const g = GRADES.find((x) => rate >= x[0]);
      let worst = -1;
      for (const i of pitchIdx) if (worst < 0 || deaths[i] > deaths[worst]) worst = i;
      return {
        route,
        runs,
        summitRate: +rate.toFixed(3),
        avgEndStamina: summits ? +(endSum / summits).toFixed(1) : 0,
        grade: g[1],
        gradeName: g[2],
        deaths,
        cruxIndex: worst,
        crux: worst >= 0 ? route[worst] : null,
      };
    },

    /** Convenience: the whole staff roster for the sandbox gallery. */
    roster(trail) {
      return trail.meta;
    },
  };

  return {
    id: 'sandbox-steward',
    name: 'Sandbox Steward',
    role: 'Deterministic simulation & control surface for the Staff Sandbox',
    api,
    register() {},
  };
}
