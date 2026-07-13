#!/usr/bin/env node
/**
 * Smoke-test the Trail staff team and hook bus without a browser.
 */
import { createKernel } from '../src/core/kernel.js';

const Trail = createKernel();

const required = ['boon', 'hazard', 'scholar', 'economy', 'expedition', 'atlas', 'sage', 'steward', 'chronicler'];
for (const k of required) {
  if (!Trail.agents[k]) throw new Error(`Missing agent: ${k}`);
}

if (!Trail.economy?.grantRelic) throw new Error('Mountain economy API incomplete');
if (Object.keys(Trail.agents.boon.api.catalog).length < 16) throw new Error('Boon catalog too small');
if (Trail.agents.boon.api.duos.length < 8) throw new Error('Duo catalog too small');
if (!Trail.meta || Trail.meta.length !== 9) throw new Error('Agent meta incomplete');
for (const m of Trail.meta) {
  if (!m.id || !m.name || !m.icon || !m.blurb) throw new Error(`Agent meta entry incomplete: ${m.id}`);
}

const run = {
  boons: new Set(['provisions', 'vent']),
  stamina: 50,
  nodeIdx: 0,
  flares: 0,
  relics: new Set(),
  weather: null,
};
const enc = {
  node: { need: 3, kind: 'switchback', restore: 14, miss: 20, hit: 12, ease: 6 },
  done: 0,
  streak: 0,
  threat: 0,
  max: 100,
};

const ctx = Trail.makeCtx(run, enc, { rnd: () => 0.5 });
const enter = Trail.emit('pitch:enter', ctx);
if (!enter.staminaDelta) throw new Error('pitch:enter hook did not apply provisions');

const correct = Trail.emit('answer:correct', { ...ctx, enc: { ...enc, streak: 2, streakEase: 2 } });
if (correct.threatDelta === undefined) throw new Error('answer:correct hook missing threatDelta');

const draft = Trail.agents.boon.api.pickDraft(Trail.makeCtx({ ...run, boons: new Set() }, enc), () => 0.2);
if (!Array.isArray(draft) || !draft.length) throw new Error('draft pick failed');

// --- Adaptive scheduler (SM-2-lite spacing, lapse, gated promotion) ---
const sched = Trail.createScheduler();
const sr = { prog: {}, locked: new Set(), mastered: new Set(), recent: [], seen: 0 };
// Gated promotion: a single correct at Familiar (tier 2) must NOT reach Solid.
sr.prog[0] = { tier: 2, seen: 0, right: 0, wrong: 0 };
sched.grade(0, true, false, sr); sr.seen++;
if (sr.prog[0].tier !== 2) throw new Error('Scheduler promoted tier 2→3 on a single correct (should need 2)');
sched.grade(0, true, false, sr); sr.seen++;
if (sr.prog[0].tier !== 3) throw new Error('Scheduler did not promote after 2 consecutive correct');
if (!sr.locked.has(0)) throw new Error('Scheduler did not lock a board-ready concept');
if (sr.prog[0].nextDue <= sr.prog[0].lastSeen) throw new Error('Scheduler did not schedule a future due');
// Lapse: a board-ready miss drops into relearning (LOCK_TIER-1), not free-fall.
sched.grade(0, false, false, sr); sr.seen++;
if (sr.prog[0].tier !== Trail.CONFIG.LOCK_TIER - 1) throw new Error('Lapse from board-ready did not enter relearning');
if (sr.locked.has(0)) throw new Error('Lapsed concept still marked locked');
if (sr.prog[0].ease >= (Trail.CONFIG.EASE_START || 2.5)) throw new Error('Ease did not drop on a lapse');
// Due-aware selection: an overdue weak item should out-weight a not-yet-due fresh item.
sched.grade(0, false, false, sr); sr.seen = 40;
sr.prog[1] = { tier: 4, seen: 1, right: 1, wrong: 0, ease: 2.9, nextDue: 999, dom: 'C' };
let hit0 = 0;
for (let i = 0; i < 200; i++) if (sched.pick([0, 1], -1, sr, () => Math.random()) === 0) hit0++;
if (hit0 < 150) throw new Error('Scheduler did not prioritize the overdue weak concept');

// --- Summit Sage analytics ---
const sageBank = [
  { id: 0, cat: 'Reinforcement' },
  { id: 1, cat: 'Ethics & Scope' },
  { id: 2, cat: 'Documentation & Reporting' },
];
const sageRun = { prog: { 0: { tier: 4, seen: 3, right: 3, wrong: 0 }, 1: { tier: 1, seen: 2, right: 1, wrong: 1 } } };
const breakdown = Trail.agents.sage.api.domainBreakdown(sageRun, sageBank, Trail.CONFIG);
if (!Array.isArray(breakdown) || breakdown.length !== 6) throw new Error('Sage breakdown incomplete');
const readiness = Trail.agents.sage.api.readiness(sageRun, sageBank, Trail.CONFIG);
if (readiness.ready !== 1) throw new Error('Sage readiness miscount');
if (!Trail.agents.sage.api.recommend(sageRun, sageBank, Trail.CONFIG).length) throw new Error('Sage produced no tips');

// --- Sandbox Steward deterministic simulation ---
const steward = Trail.agents.steward.api;
if (steward.pitchKinds().length < 20) throw new Error('Steward exposes too few pitch kinds');
const spawned = steward.spawnNode(Trail, { kind: 'gate', act: 3, need: 5 });
if (spawned.kind !== 'gate' || spawned.act !== 3) throw new Error('Steward spawnNode failed');
const simA = steward.simulatePitch(Trail, {
  kind: 'switchback', act: 1, need: 3, boons: ['vent', 'provisions'], seed: 7,
  answers: [true, true, true],
});
const simB = steward.simulatePitch(Trail, {
  kind: 'switchback', act: 1, need: 3, boons: ['vent', 'provisions'], seed: 7,
  answers: [true, true, true],
});
if (!simA.cleared) throw new Error('Steward sim should clear an easy pitch');
if (simA.final.stamina !== simB.final.stamina) throw new Error('Steward sim is not deterministic');
const draftPrev = steward.previewDraft(Trail, { owned: [], seed: 3, count: 3 });
if (draftPrev.length !== 3) throw new Error('Steward previewDraft failed');

// --- Trail Chronicler telemetry ---
const chron = Trail.agents.chronicler.api;
chron.clear();
Trail.emit('answer:correct', Trail.makeCtx(run, { ...enc, streak: 1 }, { rnd: () => 0.5 }));
if (chron.log().length < 1) throw new Error('Chronicler recorded nothing');
if ((chron.stats()['answer:correct'] || 0) < 1) throw new Error('Chronicler stats missing event');

console.log('Trail staff OK:', Trail.meta.map((m) => m.id).join(', '));
