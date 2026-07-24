/**
 * EXPEDITION DIRECTOR — procedural climb route assembly, oaths, achievements.
 */

import * as defaultHazards from './hazard-warden.js';
import { NODE_FACTORIES } from './sandbox-steward.js';

/** Pre-run modifiers — pick one at the trailhead. */
export const OATHS = [
  {
    id: 'none',
    name: 'Open Route',
    ic: '🧭',
    desc: 'No vow, no strings. The mountain as it comes.',
    mods: {},
  },
  {
    id: 'swift',
    name: 'Swift Line',
    ic: '⚡',
    desc: 'More time to think (+18% clock), but the mountain moves quicker too (+12% threat). For climbers who read every option.',
    mods: { time: 1.18, rise: 1.12 },
  },
  {
    id: 'iron',
    name: 'Iron Lungs',
    ic: '🫁',
    desc: 'Hits hurt less (−18% miss and strike costs), camps help less (−22% heals). For climbers who trust their floor.',
    mods: { stamCost: 0.82, heal: 0.78 },
  },
  {
    id: 'scholar',
    name: "Scholar's Vow",
    ic: '📚',
    desc: 'The examiners hit +25% harder, and you carry extra gear into Act III. For climbers who want the fight.',
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
  { id: 'first_ascent', ic: '⛏️', name: 'First Ascent', desc: 'Summit a set line from the guidebook.' },
  { id: 'tale_5', ic: '🗿', name: "Keeper's Audience", desc: 'Face five stories at the waymarks.' },
  { id: 'bird_friend', ic: '🐦', name: 'Bird of Good Standing', desc: 'Feed the ptarmigan, then summit. It keeps accounts.' },
  { id: 'review_5', ic: '🪨', name: 'Stone Mason', desc: 'Reclaim loose stones in five Morning Reviews.' },
];

const HARD_KINDS = new Set([
  'void', 'knife', 'icewall', 'tempest', 'avalanche', 'frozentitan', 'whiteout',
  'closing', 'corniceridge', 'sealedface', 'longwall', 'thinair', 'icefall', 'verglas',
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
  const { scaleNode, nSwitch, nGate, nRest, nShrine, nTale, nSerac, nSummit } = hazards;
  const tales = config.MODS.tales !== false && typeof nTale === 'function';

  let alt = 1600;
  const step = (g) => { alt += g + Math.floor(rnd() * 70); return alt; };
  const r = [];
  const A = (n, act) => { r.push(scaleNode(n, act)); return n; };
  const pick = (pool, k) => shuffle(pool.slice(), rnd).slice(0, k);
  const nd = (base) => base + Math.floor(rnd() * 2);

  // Pools come straight from the bestiary tiers, so a hazard's tier decides
  // where it can appear on the route. Tier 5 fixed points (gate/serac/summit)
  // are placed explicitly below.
  const tierPool = (t) => hazards.BESTIARY.filter((b) => b.t === t).map((b) => b.fn);
  const T2 = tierPool(2);
  const T3 = tierPool(3);
  const T4 = tierPool(4);

  // ACT I - The Approach: T1 hazards + a single taste of T2
  A(nSwitch(nd(3), step(215)), 1);
  pick(tierPool(1).filter((fn) => fn !== nSwitch), 1).forEach((fn) => { A(fn(nd(3), step(220)), 1); });
  A(pick(T2, 1)[0](nd(4), step(240)), 1);
  if (tales) A(nTale(step(90)), 1);
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
  if (tales) A(nTale(step(95)), 3);
  A(nSerac(5, step(320)), 3);
  A(nSummit(6, step(360)), 3);

  return r;
}

/* ---------- Set lines (Route Setter → guidebook codes) ----------
 * A "line" is a player-authored route: named, graded in the sandbox, and
 * shared as a LINE1: code that the trailhead import box accepts. */

export const LINE_LIMITS = { minPitches: 5, maxPitches: 18, needMin: 3, needMax: 7, nameMax: 36 };

export function lineChecksum(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36).slice(-4);
}

function b64encode(s) {
  if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(s)));
  return Buffer.from(s, 'utf8').toString('base64');
}
function b64decode(s) {
  if (typeof atob === 'function') return decodeURIComponent(escape(atob(s)));
  return Buffer.from(s, 'base64').toString('utf8');
}

const cleanText = (s, max) => String(s || '').replace(/[<>&]/g, '').trim().slice(0, max);

/** spec: { name, setter, pitches: [{kind,need} | {kind:'rest'}] } → LINE1: code */
export function encodeLine(spec) {
  const p = spec.pitches.map((x) => (x.kind === 'rest' ? 'R' : [x.kind, x.need]));
  const payload = { v: 1, name: cleanText(spec.name, LINE_LIMITS.nameMax), setter: cleanText(spec.setter, LINE_LIMITS.nameMax), p };
  payload.cs = lineChecksum(JSON.stringify({ v: payload.v, name: payload.name, setter: payload.setter, p: payload.p }));
  return 'LINE1:' + b64encode(JSON.stringify(payload));
}

/** LINE1: code → { ok, spec?, err? } with kinds validated and needs clamped. */
export function decodeLine(code) {
  const m = String(code || '').trim().match(/^LINE1:(.+)$/);
  if (!m) return { ok: false, err: 'Not a guidebook line code.' };
  let payload;
  try { payload = JSON.parse(b64decode(m[1])); } catch (e) { return { ok: false, err: 'Could not read that line code.' } }
  if (payload.cs && lineChecksum(JSON.stringify({ v: payload.v, name: payload.name, setter: payload.setter, p: payload.p })) !== payload.cs) {
    return { ok: false, err: 'Checksum failed — the code may be truncated.' };
  }
  const L = LINE_LIMITS;
  const pitches = [];
  for (const x of payload.p || []) {
    if (x === 'R') { pitches.push({ kind: 'rest' }); continue; }
    const kind = x && x[0];
    if (kind === 'summit' || (!NODE_FACTORIES[kind] && kind !== 'rest')) continue;
    pitches.push({ kind, need: Math.max(L.needMin, Math.min(L.needMax, Math.round(x[1]) || 4)) });
  }
  const real = pitches.filter((x) => x.kind !== 'rest');
  if (real.length < L.minPitches) return { ok: false, err: 'A line needs at least ' + L.minPitches + ' pitches.' };
  if (real.length > L.maxPitches) return { ok: false, err: 'No line is that long. Max ' + L.maxPitches + ' pitches.' };
  return {
    ok: true,
    spec: { name: cleanText(payload.name, L.nameMax) || 'Unnamed Line', setter: cleanText(payload.setter, L.nameMax) || 'unknown', pitches },
  };
}

/** Build a climbable route from a decoded spec. Acts by thirds; summit appended. */
export function buildSetRoute(spec, config, hazards = defaultHazards) {
  const real = spec.pitches.filter((x) => x.kind !== 'rest').length;
  let alt = 1600;
  let seen = 0;
  const r = [];
  for (const p of spec.pitches) {
    if (p.kind === 'rest') {
      alt += 140;
      r.push(hazards.scaleNode(hazards.nRest(alt, config), r.length ? r[r.length - 1].act : 1));
      continue;
    }
    seen++;
    const act = seen <= Math.ceil(real / 3) ? 1 : seen <= Math.ceil((2 * real) / 3) ? 2 : 3;
    alt += 210 + ((seen * 37) % 70);
    const fn = hazards[NODE_FACTORIES[p.kind]];
    const node = p.kind === 'gate' ? hazards.nGate(p.need, alt, null) : fn(p.need, alt);
    if (p.kind === 'serac') node.startThreat = 25;
    r.push(hazards.scaleNode(node, act));
  }
  const summit = hazards.nSummit(6, alt + 340);
  summit.startThreat = 20;
  r.push(hazards.scaleNode(summit, 3));
  return r;
}

export { ACTS } from './hazard-warden.js';
