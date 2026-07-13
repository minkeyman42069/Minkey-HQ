/**
 * EXPEDITION DIRECTOR — procedural climb route assembly, oaths, achievements.
 */

import * as defaultHazards from './hazard-warden.js';

/** Pre-run modifiers — pick one at the trailhead. */
export const OATHS = [
  {
    id: 'none',
    name: 'Open Route',
    ic: '🧭',
    desc: 'No vow. Standard climb.',
    mods: {},
  },
  {
    id: 'swift',
    name: 'Swift Line',
    ic: '⚡',
    desc: '+18% focus timer. Passive threat builds 12% faster.',
    mods: { time: 1.18, rise: 1.12 },
  },
  {
    id: 'iron',
    name: 'Iron Lungs',
    ic: '🫁',
    desc: 'Miss & strike costs −18%. Camp heals −22%.',
    mods: { stamCost: 0.82, heal: 0.78 },
  },
  {
    id: 'scholar',
    name: "Scholar's Vow",
    ic: '📚',
    desc: 'Gatekeepers hit harder (+25% strike). Extra boon draft entering Act III.',
    mods: { gateHit: 1.25, act3Draft: true },
  },
];

export const ACHIEVEMENTS = [
  { id: 'first_summit', ic: '🏔️', name: 'Top Out', desc: 'Reach the summit once.' },
  { id: 'summit_5', ic: '⭐', name: 'Regular', desc: 'Summit five times.' },
  { id: 'duo_found', ic: '🔗', name: 'Synergy', desc: 'Activate your first duo power.' },
  { id: 'clutch_3', ic: '💀', name: 'Last Legs', desc: 'Clear 3 pitches on last legs in one run.' },
  { id: 'board_50', ic: '📋', name: 'Half Ready', desc: '50+ board-ready concepts.' },
  { id: 'exam_pass', ic: '✅', name: 'Mock Pass', desc: 'Pass Board Sim at 80% or higher.' },
  { id: 'daily_ridge', ic: '🌅', name: 'Ridge Walker', desc: "Complete Today's Ridge." },
  { id: 'oath_summit', ic: '🤝', name: 'Bound', desc: 'Summit with an expedition oath sworn.' },
  { id: 'grade_s', ic: '💎', name: 'Alpine Grade', desc: 'Earn an S grade on a summit run.' },
];

const HARD_KINDS = new Set([
  'void', 'knife', 'icewall', 'tempest', 'avalanche', 'frozentitan', 'whiteout',
  'closing', 'corniceridge', 'sealedface', 'longwall', 'thinair', 'icefall',
]);

export function oathById(id) {
  return OATHS.find((o) => o.id === id) || OATHS[0];
}

export function applyOathMods(run, base) {
  const oath = oathById(run.oath || 'none');
  const m = oath.mods || {};
  let t = base;
  if (m.time) t *= m.time;
  return t;
}

export function oathStamMult(run) {
  const m = oathById(run.oath || 'none').mods || {};
  return m.stamCost || 1;
}

export function oathHealMult(run) {
  const m = oathById(run.oath || 'none').mods || {};
  return m.heal || 1;
}

export function oathRiseMult(run) {
  const m = oathById(run.oath || 'none').mods || {};
  return m.rise || 1;
}

export function oathGateHitMult(run) {
  const m = oathById(run.oath || 'none').mods || {};
  return m.gateHit || 1;
}

export function spoilsDraftEligible(node, mode) {
  if (mode !== 'clear' || !node?.boon) return false;
  if (node.kind === 'gate' || node.kind === 'rest') return false;
  return node.act >= 2 || HARD_KINDS.has(node.kind);
}

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function createSeededRng(seed) {
  let s = (seed % 2147483646) + 1;
  return function seeded() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

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

  // ACT III - The Death Zone: T3, three T4 brutes, Gatekeeper, high camp, Serac, Summit
  A(pick(T3, 1)[0](nd(4), step(295)), 3);
  pick(T4, 3).forEach((fn) => { A(fn(nd(4), step(305)), 3); });
  A(nGate(nd(5), step(315), null), 3);
  A(nRest(step(140), config), 3);
  A(nSerac(5, step(320)), 3);
  A(nSummit(6, step(360)), 3);

  return r;
}

export { ACTS } from './hazard-warden.js';
