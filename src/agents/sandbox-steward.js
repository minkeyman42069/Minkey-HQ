/**
 * SANDBOX STEWARD — deterministic control surface for the Staff Sandbox.
 *
 * This agent never touches a live climb. It spawns throwaway nodes and
 * run/encounter state, then hands them to the Climb Engine — the same code
 * the browser and the balance gate run — so the sandbox shows exactly what
 * every gameplay staff member would do, reproducibly, from a seed.
 */

import {
  seededRng as engineSeededRng,
  blankRun as engineBlankRun,
  blankEnc as engineBlankEnc,
  simulatePitchNode,
} from '../core/climb-engine.js';

/** Kind → Hazard Warden factory name. Pitch nodes only (no rest/shrine). */
export const NODE_FACTORIES = {
  switchback: 'nSwitch', storm: 'nStorm', gate: 'nGate', serac: 'nSerac', summit: 'nSummit',
  whiteout: 'nWhiteout', crevasse: 'nCrevasse', traverse: 'nTraverse', thinair: 'nThinAir',
  icefall: 'nIcefall', void: 'nVoid', knife: 'nKnife', berg: 'nBergschrund', snowfield: 'nSnowfield',
  couloir: 'nCouloir', icewall: 'nIcewall', windslab: 'nWindslab', sealedface: 'nSealedFace',
  longwall: 'nLongWall', tempest: 'nTempest', closing: 'nClosing', avalanche: 'nAvalanche',
  corniceridge: 'nCorniceRidge', frozentitan: 'nFrozenTitan', rockfall: 'nRockfall', verglas: 'nVerglas',
};

/** Canonical PRNG lives in the Climb Engine; re-exported for sandbox users. */
export const seededRng = engineSeededRng;

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

    /** Throwaway RUN/ENC state comes straight from the Climb Engine. */
    blankRun: engineBlankRun,
    blankEnc: engineBlankEnc,

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
     * Simulate a single pitch by driving the real hook bus — spawns the node
     * here, then hands off to the Climb Engine (the same code the browser
     * runs). Since the engine unification this includes full hazard drift:
     * gusts, spikes, and drain now count when secondsPerQuestion > 0.
     *
     * @param {object} trail  kernel handle (window.Trail)
     * @param {object} opts
     *   kind, act, need, boons[], relics[], weather (object), seed,
     *   answers: array of booleans OR {correct, viaTimeout},
     *   secondsPerQuestion: passive hazard seconds between answers (0 = off)
     * @returns {{node, start, steps, final, cleared, strikes}}
     */
    simulatePitch(trail, opts = {}) {
      const node = api.spawnNode(trail, {
        kind: opts.kind,
        need: opts.need,
        act: opts.act,
        alt: opts.alt,
        domain: opts.domain,
      });
      return simulatePitchNode(trail, node, opts);
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
