#!/usr/bin/env node
/**
 * THE RBT TRAIL — terminal expedition client.
 *
 *   npm run play             random climb
 *   npm run play -- --seed 7 seeded climb (same line every time)
 *   npm run play -- --calm   no clock pressure (untimed answers)
 *
 * A complete climb in the terminal: real question bank, real Leitner
 * scheduler, real boon drafts, tales, weather, and threat — every point of
 * combat math runs through src/core/climb-engine.js, the same code the
 * browser executes. The clock is a chess clock: think as long as you like,
 * but the mountain drifts for every second you spend (and past the limit
 * your answer counts as a timeout).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout, exit } from 'node:process';
import { createKernel } from '../src/core/kernel.js';
import {
  blankRun, blankEnc, entryThreat, resolveAnswer, tickDrift, addStamina,
  applyTaleFx, clearPitch, seededRng,
} from '../src/core/climb-engine.js';

const args = process.argv.slice(2);
const argVal = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const SEED = Number(argVal('--seed')) || Math.floor(Math.random() * 1e9);
const CALM = args.includes('--calm');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BANK = JSON.parse(readFileSync(join(root, 'data', 'questions.json'), 'utf8'));
BANK.forEach((q, i) => { q.id = i; });

const trail = createKernel();
const C = trail.CONFIG;
const rnd = seededRng(SEED);
const sched = trail.createScheduler();
const rl = readline.createInterface({ input: stdin, output: stdout });

/* ---------- presentation ---------- */
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const strip = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/&mdash;|&#8212;/g, '—').replace(/&rsquo;|&#8217;/g, '’').replace(/&amp;/g, '&');
const meter = (v, max, width, on) => {
  const n = Math.round((Math.max(0, Math.min(max, v)) / max) * width);
  return on('█'.repeat(n)) + dim('░'.repeat(width - n));
};
const hud = (run, enc) => {
  let line = `  🧗 ${meter(run.stamina, C.STAM_MAX, 20, run.stamina <= 25 ? red : green)} ${Math.round(run.stamina)} stamina`;
  if (enc) line += `   ${enc.node.tic || '⛰️'} ${meter(enc.threat, enc.max, 20, yellow)} ${Math.round(enc.threat)} threat`;
  console.log(line);
};
const banners = (evs) => {
  for (const e of evs || []) {
    if (e.t === 'strike' && !e.blocked) console.log(red(`  ⛏️  The mountain pushes back — −${e.hit} stamina`));
    if (e.t === 'strike' && e.blocked) console.log(cyan('  🛡️  The strike is blocked'));
    if (e.t === 'shield') console.log(cyan(`  💠 The face cracks — ${e.left > 0 ? e.left + ' layer(s) to break' : 'the shell gives way'}`));
    if (e.t === 'phase') console.log(yellow('  💥 The slope lets go — it releases all at once'));
    if (e.t === 'crux') console.log(yellow('  🔺 The crux — one hard move from the ledge'));
    if (e.t === 'knockback') console.log(red('  🗡️  Knocked back — you slide down the ridge'));
    if (e.t === 'lastlegs') console.log(red('  🫀 Last legs — no room left for a slip'));
    if (e.t === 'iceaxe') console.log(cyan('  ⛏️  The ice axe bites — you arrest the fall at 1 stamina'));
    if ((e.t === 'banners' || e.t === 'gust') && e.banners) e.banners.forEach((b) => console.log(dim(`  · ${strip(b.title)}${b.sub ? ' — ' + strip(b.sub) : ''}`)));
  }
  if (evs) evs.length = 0;
};

let stdinClosed = false;
rl.on('close', () => { stdinClosed = true; });
async function ask(prompt) {
  if (stdinClosed) { console.log(dim('\n  (input ended — turning back to camp)')); exit(0); }
  try {
    return (await rl.question(prompt)).trim().toLowerCase();
  } catch (e) {
    console.log(dim('\n  (input ended — turning back to camp)'));
    exit(0);
  }
}

async function offerDraft(run, enc, label) {
  const picks = trail.agents.boon.api.pickDraft(trail.makeCtx(run, enc, { rnd }), rnd);
  if (!picks || !picks.length) return;
  console.log('\n  ' + bold(label));
  picks.forEach((id, i) => {
    if (id === '_stamina') { console.log(`   ${i + 1}. 🥤 Stamina cache — pack is full, take +15 stamina`); return; }
    const b = trail.agents.boon.api.resolve(id);
    if (b) console.log(`   ${i + 1}. ${b.ic} ${bold(b.name)}${b.rare ? yellow(' RARE') : ''} — ${strip(b.desc)}`);
  });
  const a = await ask(dim('  take which? (number, or enter to skip) > '));
  const idx = parseInt(a, 10) - 1;
  if (isNaN(idx) || !picks[idx]) return;
  if (picks[idx] === '_stamina') { addStamina(trail, run, null, 15, null); console.log(green('  +15 stamina.')); return; }
  run.boons.add(picks[idx]);
  trail.agents.boon.api.onAcquire(trail.makeCtx(run, enc, { rnd }), picks[idx]);
  console.log(green('  Packed.'));
}

function pickQuestion(run, enc) {
  let ids;
  if (enc.node.gateDomain) {
    const gd = enc.node.gateDomain;
    ids = BANK.filter((q) => trail.agents.scholar.api.domainOf(q) === gd).map((q) => q.id);
  } else ids = BANK.map((q) => q.id);
  const id = sched.pick(ids, enc.lastId, run, rnd);
  enc.lastId = id;
  return BANK[id];
}

async function fightPitch(run, node) {
  const enc = blankEnc(node, { threat: entryThreat(node) });
  run.altitude = node.alt || run.altitude;
  const evs = [];
  const H = trail.agents.hazard.api;
  console.log(`\n${node.icon}  ${bold(node.title)}  ${dim('· act ' + node.act + ' · ≈' + node.alt + 'm')}`);
  console.log(dim('  ' + strip(node.blurb)));
  console.log(dim('  ' + strip(H.nodeSub(node))));
  if (node.kind === 'gate') {
    const gd = trail.weakestDomain(run, BANK);
    enc.node.gateDomain = gd;
    console.log(yellow(`  🛡️  The Gatekeeper has read your ledger — Domain ${gd}: ${trail.agents.scholar.api.DOMAINS[gd].n}`));
  }
  const pe = trail.emit('pitch:enter', trail.makeCtx(run, enc, { rnd }));
  if (pe.staminaDelta) addStamina(trail, run, enc, pe.staminaDelta, evs);
  banners(evs);

  while (run.stamina > 0 && enc.done < enc.need) {
    hud(run, enc);
    const q = pickQuestion(run, enc);
    const limit = CALM ? Infinity : trail.agents.boon.api.focusTime(trail.makeCtx(run, enc, { rnd }), (node.time || 16) * (run.weather ? run.weather.time : 1));
    console.log(`\n  ${bold(strip(q.q))}${CALM ? '' : dim('   ⏱ ' + Math.round(limit) + 's')}`);
    const isTf = q.type === 'tf';
    const opts = isTf ? ['True', 'False'] : q.a;
    opts.forEach((o, i) => console.log(`   ${'abcd'[i]}) ${strip(o)}`));
    const t0 = Date.now();
    const a = await ask(dim('  > '));
    const elapsed = Math.min((Date.now() - t0) / 1000, CALM ? 0 : limit);
    if (elapsed > 0) { tickDrift(trail, run, enc, elapsed, rnd, evs); banners(evs); }
    if (run.stamina <= 0) break;
    const viaTimeout = !CALM && (Date.now() - t0) / 1000 > limit;
    const pickIdx = 'abcd'.indexOf(a[0]);
    let correct = false;
    if (!viaTimeout) {
      if (isTf) {
        const ans = a[0] === 't' ? true : a[0] === 'f' ? false : pickIdx === 0 ? true : pickIdx === 1 ? false : null;
        correct = ans !== null && ans === q.correct;
      } else correct = pickIdx === q.c;
    }
    const qs = trail.emit('question:start', trail.makeCtx(run, enc, { rnd }));
    if (qs.staminaDelta) addStamina(trail, run, enc, qs.staminaDelta, evs);
    sched.grade(q.id, correct, viaTimeout, run);
    run.seen++;
    resolveAnswer(trail, run, enc, { correct, viaTimeout, rnd, events: evs });
    if (viaTimeout) console.log(red('  ⏱ Out of time.'));
    else if (correct) console.log(green('  ✓ Locked in.') + (enc.done >= enc.need ? '' : dim(`  (${enc.done}/${enc.need})`)));
    else console.log(red('  ✗ ' + (isTf ? 'Wrong.' : 'Wrong — ' + strip(opts[q.c] ?? ''))) + '\n  ' + dim(strip(q.e || '')));
    banners(evs);
  }

  if (run.stamina <= 0) return false;
  const res = clearPitch(trail, run, enc, {
    rnd,
    grantRelic: () => trail.economy.grantRelic({
      run, config: C, rnd,
      banner: (t, s) => console.log(cyan(`  🎁 ${strip(t)} — ${strip(s)}`)),
      renderHeld: null,
    }),
  });
  console.log(green(`\n  🏔  Pitch cleared — +${res.restore} stamina at the ledge.`) + (res.clutch ? yellow('  Clutch — cleared on your last legs.') : ''));
  const promised = run.freeDraft;
  if (promised) { run.freeDraft = false; run.freeDraftFrom = null; }
  const spoils = trail.agents.expedition.api.spoilsDraftEligible(node, 'clear') && rnd() < 0.42;
  if (node.kind === 'gate' || spoils || promised) {
    await offerDraft(run, enc, promised ? "The Keeper's promise — claim a boon" : spoils ? 'Spoils of the pitch — claim a boon' : 'The ridge lets you pass — claim a boon');
  }
  return true;
}

async function visitTale(run, node) {
  const keeper = trail.agents.keeper.api;
  const tale = keeper.drawTale(rnd, node.act || 1, run.usedTales);
  run.usedTales.push(tale.id);
  console.log(`\n${tale.ic}  ${bold(tale.title)}`);
  console.log('  ' + strip(tale.text));
  tale.choices.forEach((ch, i) => console.log(`   ${i + 1}. ${ch.ic} ${bold(ch.label)} — ${strip(ch.desc)}`));
  let idx = parseInt(await ask(dim('  choose > ')), 10) - 1;
  if (isNaN(idx) || !tale.choices[idx]) idx = 0;
  const out = keeper.resolveChoice(tale.choices[idx], rnd);
  const evs = [];
  applyTaleFx(trail, run, out.fx, {
    events: evs,
    grantRelic: () => trail.economy.grantRelic({
      run, config: C, rnd,
      banner: (t, s) => console.log(cyan(`  🎁 ${strip(t)} — ${strip(s)}`)),
      renderHeld: null,
    }),
  });
  console.log((out.won === false ? red : out.won === true ? green : cyan)('  ' + strip(out.text)));
  banners(evs);
}

/* ---------- the climb ---------- */
const run = blankRun({ weather: C.MODS.weather ? trail.agents.economy.api.WEATHERS[Math.floor(rnd() * trail.agents.economy.api.WEATHERS.length)] : null });
run.route = trail.buildRoute(rnd, null);

console.log(bold('\n═══ THE RBT TRAIL — terminal expedition ═══'));
console.log(dim(`seed ${SEED} · ${run.route.filter((n) => !['rest', 'shrine', 'tale'].includes(n.kind)).length} pitches · same engine the browser runs`));
if (run.weather) console.log(`${run.weather.ic}  ${bold(run.weather.name)} — ${strip(run.weather.desc)}`);
console.log(dim('\nRoute: ' + run.route.map((n) => n.icon).join(' ')));

let fell = false;
for (let ni = 0; ni < run.route.length && !fell; ni++) {
  const node = run.route[ni];
  run.nodeIdx = ni;
  if (node.kind === 'rest') {
    const heal = trail.pitchRestore(node, 'rest', run);
    addStamina(trail, run, null, heal, null);
    console.log(green(`\n🏕  Ledge Camp — fire's warm. +${heal} stamina.`));
    const promised = run.freeDraft;
    if (promised) { run.freeDraft = false; run.freeDraftFrom = null; }
    await offerDraft(run, null, promised ? "The Keeper's promise — claim a boon" : 'Take one for the climb');
    continue;
  }
  if (node.kind === 'shrine') {
    console.log(`\n⛩  ${bold('Weathered Shrine')} — leave an offering (12 stamina) for a relic?`);
    if ((await ask(dim('  offer? (y/n) > '))).startsWith('y')) {
      addStamina(trail, run, null, -12, null);
      trail.economy.grantRelic({ run, config: C, rnd, banner: (t, s) => console.log(cyan(`  🎁 ${strip(t)} — ${strip(s)}`)), renderHeld: null });
    } else console.log(dim('  You pass by.'));
    continue;
  }
  if (node.kind === 'tale') { await visitTale(run, node); continue; }
  fell = !(await fightPitch(run, node));
  if (node.kind === 'summit' && !fell) { run.summited = true; break; }
}

/* ---------- debrief ---------- */
const acc = run.seen ? Math.round((run.right / run.seen) * 100) : 0;
console.log(bold(run.summited ? '\n🏆  SUMMIT. You topped out.' : '\n🌑  Driven back. The mountain keeps the rest.'));
console.log(`  ${run.seen} questions · ${acc}% accuracy · best streak ${run.bestStreak} · ${Math.round(run.altitude)}m`);
const tips = trail.agents.sage.api.recommend(run, BANK, C).slice(0, 3);
console.log(bold('\n🧠  The Sage’s counsel'));
tips.forEach((t) => console.log('  · ' + strip(t)));
rl.close();
exit(0);
