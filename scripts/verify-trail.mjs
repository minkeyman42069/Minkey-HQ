#!/usr/bin/env node
/**
 * Smoke-test the five Trail agents and hook bus without a browser.
 */
import { createKernel } from '../src/core/kernel.js';

const Trail = createKernel();

const required = ['boon', 'hazard', 'scholar', 'economy', 'expedition'];
for (const k of required) {
  if (!Trail.agents[k]) throw new Error(`Missing agent: ${k}`);
}

if (!Trail.economy?.grantRelic) throw new Error('Mountain economy API incomplete');
if (Object.keys(Trail.agents.boon.api.catalog).length < 16) throw new Error('Boon catalog too small');
if (Trail.agents.boon.api.duos.length < 8) throw new Error('Duo catalog too small');
if (!Trail.meta || Trail.meta.length !== 6) throw new Error('Agent meta incomplete');

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

console.log('Trail agents OK:', Trail.meta.map((m) => m.id).join(', '));
