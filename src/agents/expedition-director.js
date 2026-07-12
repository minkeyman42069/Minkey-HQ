/**
 * EXPEDITION DIRECTOR — procedural climb route assembly across three acts.
 */

import * as defaultHazards from './hazard-warden.js';

function shuffle(a, rnd) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/**
 * @param {() => number} rnd
 * @param {string|null} topic
 * @param {{ REST_RESTORE: number, MODS: { shrines?: boolean } }} config
 * @param {typeof defaultHazards} hazards
 */
export function buildRoute(rnd, topic, config, hazards = defaultHazards) {
  const {
    scaleNode,
    nSwitch, nTraverse, nSnowfield,
    nCrevasse, nBergschrund, nStorm, nCouloir, nWindslab,
    nVoid, nKnife, nIcewall, nSealedFace, nLongWall, nCorniceRidge,
    nWhiteout, nThinAir, nIcefall, nTempest, nClosing, nAvalanche, nFrozenTitan,
    nGate, nRest, nShrine, nSerac, nSummit,
  } = hazards;

  let alt = 1600;
  const step = (g) => { alt += g + Math.floor(rnd() * 70); return alt; };
  const r = [];
  const A = (n, act) => { r.push(scaleNode(n, act)); return n; };
  const pick = (pool, k) => shuffle(pool.slice(), rnd).slice(0, k);
  const nd = (base) => base + Math.floor(rnd() * 2);

  const T1 = [nSwitch, nTraverse, nSnowfield];
  const T2 = [nCrevasse, nBergschrund, nStorm, nCouloir, nWindslab];
  const T3 = [nVoid, nKnife, nIcewall, nSealedFace, nLongWall, nCorniceRidge];
  const T4 = [nWhiteout, nThinAir, nIcefall, nTempest, nClosing, nAvalanche, nFrozenTitan];

  // ACT I - The Approach: T1 hazards + a single taste of T2
  A(nSwitch(nd(3), step(215)), 1);
  pick([nTraverse, nSnowfield], 1).forEach((fn) => { A(fn(nd(3), step(220)), 1); });
  A(pick(T2, 1)[0](nd(4), step(240)), 1);
  A(nGate(nd(4), step(235), null), 1);
  A(nRest(step(150), config), 1);

  // ACT II - The Headwall: T2 core rises into a T3
  pick(T2, 2).forEach((fn) => { A(fn(nd(5), step(255)), 2); });
  A(pick(T3, 1)[0](nd(5), step(270)), 2);
  if (config.MODS.shrines) A(nShrine(step(110)), 2);
  A(nGate(nd(5), step(280), null), 2);
  A(nRest(step(165), config), 2);

  // ACT III - The Death Zone: T3, two T4 brutes, Gatekeeper, high camp, Serac, Summit
  A(pick(T3, 1)[0](nd(4), step(295)), 3);
  pick(T4, 2).forEach((fn) => { A(fn(nd(4), step(305)), 3); });
  A(nGate(nd(5), step(315), null), 3);
  A(nRest(step(140), config), 3);
  A(nSerac(5, step(320)), 3);
  A(nSummit(6, step(360)), 3);

  return r;
}

export { ACTS } from './hazard-warden.js';
