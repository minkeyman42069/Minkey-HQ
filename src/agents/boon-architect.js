/**
 * BOON ARCHITECT — draftable climb modifiers, duos, and hook-driven effects.
 * Tight roster: every boon does one clear job, no stacked safety clones.
 */

import { oathStamMult } from './expedition-director.js';
import { TIER_COMBAT } from './hazard-warden.js';

export const BOON_TAGS = {
  safety: { label: 'Safety', color: '#5fce9f' },
  speed: { label: 'Speed', color: '#8fc4dd' },
  streak: { label: 'Streak', color: '#f2b64e' },
  threat: { label: 'Threat', color: '#e37356' },
  opening: { label: 'Opening', color: '#c9a86a' },
  study: { label: 'Study', color: '#9b6fd0' },
};

/** 18 boons — cut piton/routebook/redline/weathereye (redundant or dead). */
export const BOONS = {
  surefoot: {
    ic: '🧊',
    name: 'Crampons',
    tag: 'safety',
    rare: false,
    desc: 'First miss each pitch costs no stamina.',
  },
  steady: {
    ic: '🫁',
    name: 'Steady Breath',
    tag: 'safety',
    rare: false,
    desc: 'First timeout each pitch costs no stamina.',
  },
  fieldnotes: {
    ic: '🔖',
    name: 'Field Notes',
    tag: 'study',
    rare: false,
    desc: 'Once per pitch, remove one wrong answer.',
  },
  headlamp: {
    ic: '🔦',
    name: 'Headlamp',
    tag: 'study',
    rare: false,
    desc: 'Every question reveals its TCO exam domain.',
  },
  momentum: {
    ic: '🔥',
    name: 'Momentum',
    tag: 'streak',
    rare: false,
    desc: 'Streaks calm the threat harder. A miss resets the bonus.',
  },
  vent: {
    ic: '💨',
    name: 'Vent',
    tag: 'threat',
    rare: false,
    desc: 'Every correct answer chips threat, streak or not.',
  },
  tailwind: {
    ic: '🌬️',
    name: 'Tailwind',
    tag: 'speed',
    rare: false,
    desc: '+5 seconds on the focus timer.',
  },
  coldfront: {
    ic: '❄️',
    name: 'Cold Front',
    tag: 'threat',
    rare: false,
    desc: 'Passive threat builds 25% slower for the whole pitch.',
  },
  provisions: {
    ic: '🎒',
    name: 'Provisions',
    tag: 'opening',
    rare: false,
    desc: 'Start each pitch with +5 stamina.',
  },
  firstlight: {
    ic: '🌅',
    name: 'First Light',
    tag: 'opening',
    rare: false,
    desc: 'Opening question each pitch: +3 stamina and +3 seconds.',
  },
  summitsurge: {
    ic: '⛰️',
    name: 'Summit Surge',
    tag: 'streak',
    rare: false,
    desc: 'Every 4 correct in a row restores 8 stamina.',
  },
  rally: {
    ic: '🚩',
    name: 'Rally',
    tag: 'safety',
    rare: true,
    desc: 'Once per pitch, a miss does not break your streak.',
  },
  bulwark: {
    ic: '🧱',
    name: 'Bulwark',
    tag: 'safety',
    rare: true,
    desc: 'Once per pitch, block the next mountain strike completely.',
  },
  pitanchor: {
    ic: '⚓',
    name: 'Pit Anchor',
    tag: 'safety',
    rare: true,
    desc: 'Mountain strikes cost 38% less stamina.',
  },
  cairn: {
    ic: '🪨',
    name: 'Cairn',
    tag: 'streak',
    rare: true,
    desc: 'Every 3 correct in a row banks stamina, paid when you clear the pitch.',
  },
  highcamp: {
    ic: '⛺',
    name: 'High Camp',
    tag: 'streak',
    rare: true,
    desc: 'Clearing a pitch on a streak restores extra stamina.',
  },
  quickdraw: {
    ic: '⏱️',
    name: 'Quick Draw',
    tag: 'speed',
    rare: true,
    desc: 'Each correct answer adds time back to the clock.',
  },
  flare: {
    ic: '🧨',
    name: 'Flare',
    tag: 'threat',
    rare: true,
    desc: 'Twice per climb, zero out the threat meter.',
  },
  allin: {
    ic: '🎲',
    name: 'All In',
    tag: 'threat',
    rare: true,
    desc: 'Correct answers calm threat much more; wrong answers spike it harder.',
  },
  fixedline: {
    ic: '🪢',
    name: 'Fixed Line',
    tag: 'safety',
    rare: true,
    desc: 'Above half stamina, mountain strikes hit 45% softer.',
  },
};

/** Retired IDs — old trail logs still display cleanly. */
export const LEGACY_BOONS = {
  piton: { ic: '📌', name: 'Piton Pair', tag: 'safety', rare: false, desc: 'Retired. Crampons covers the first miss now.' },
  updraft: { ic: '🎈', name: 'Updraft', tag: 'threat', rare: false, desc: 'Retired. Now Cold Front.' },
  wildfire: { ic: '✨', name: 'Wildfire', tag: 'threat', rare: false, desc: 'Retired. Now Vent.' },
  redline: { ic: '🩸', name: 'Red Line', tag: 'streak', rare: false, desc: 'Retired.' },
  routebook: { ic: '📖', name: 'Route Book', tag: 'study', rare: false, desc: 'Retired.' },
  weathereye: { ic: '👁️', name: 'Weather Eye', tag: 'study', rare: true, desc: 'Retired.' },
  alpinestart: { ic: '🌅', name: 'Alpine Start', tag: 'opening', rare: false, desc: 'Retired. Now First Light.' },
  secondwind: { ic: '💨', name: 'Second Wind', tag: 'streak', rare: false, desc: 'Retired. Now Summit Surge.' },
  secondhand: { ic: '⏱️', name: 'Second Hand', tag: 'speed', rare: true, desc: 'Retired. Now Quick Draw.' },
  gambit: { ic: '🎲', name: 'Gambit', tag: 'threat', rare: true, desc: 'Retired. Now All In.' },
  buddyrope: { ic: '🪢', name: 'Buddy Rope', tag: 'safety', rare: true, desc: 'Retired. Now Fixed Line.' },
  anchor: { ic: '⚓', name: 'Storm Anchor', tag: 'safety', rare: true, desc: 'Retired. Now Pit Anchor.' },
  woolsocks: { ic: '🧦', name: 'Wool Socks', tag: 'opening', rare: false, desc: 'Dry feet fix more than you would think. Camps and cleared ledges heal +6 more.' },
  whetstone: { ic: '🪨', name: 'Whetstone', tag: 'threat', rare: false, desc: 'Your first correct answer each pitch bites deep — it sheds 15 extra threat.' },
  whistle: { ic: '🎶', name: 'Tin Whistle', tag: 'safety', rare: true, desc: 'The mountain likes a tune. Gusts and falling-ice volleys hit for half.' },
};

export const DUOS = [
  { ids: ['momentum', 'allin'], name: 'Runout', ic: '🏔️', desc: 'On a 5+ streak, correct answers shove threat back hard.' },
  { ids: ['vent', 'momentum'], name: 'Thermal', ic: '🔥', desc: 'Vent chips more threat the longer your streak runs.' },
  { ids: ['cairn', 'summitsurge'], name: 'Deep Pockets', ic: '🎒', desc: 'Cairn banks +3 extra stamina per stack.' },
  { ids: ['provisions', 'highcamp'], name: 'Base Camp', ic: '⛺', desc: 'Open each pitch with +9 stamina; finish it stronger.' },
  { ids: ['rally', 'bulwark'], name: 'Unbreakable', ic: '🛡️', desc: 'Using Rally also resets Bulwark.' },
  { ids: ['pitanchor', 'bulwark'], name: 'Fortress', ic: '🏰', desc: 'Strikes that get through hurt even less.' },
  { ids: ['surefoot', 'steady'], name: 'Solid Footing', ic: '🧊', desc: 'Your first mistake each pitch also sheds threat.' },
  { ids: ['tailwind', 'quickdraw'], name: 'Slipstream', ic: '🌀', desc: 'Quick Draw returns more time per correct.' },
  { ids: ['surefoot', 'fixedline'], name: 'Belay', ic: '🤝', desc: 'Crampons\' free miss also restores 3 stamina.' },
  { ids: ['firstlight', 'momentum'], name: 'Dawn Line', ic: '🌄', desc: 'First Light bonus fires again after your opening correct.' },
  { ids: ['headlamp', 'fieldnotes'], name: 'Night School', ic: '🌙', desc: 'Headlamp also tags the question type on each stem.' },
  { ids: ['woolsocks', 'provisions'], name: 'Home Comforts', ic: '🏡', desc: 'Camps and ledges heal +9 instead. The mountain almost feels like a kitchen.' },
  { ids: ['whetstone', 'vent'], name: 'Sharp Edge', ic: '🔪', desc: 'The Whetstone opener sheds 24 threat instead of 15.' },
];

function hasDuo(ctx, name) {
  return (ctx.duos || []).some((d) => d.name === name);
}

function canUse(ctx, id) {
  if (ctx.enc?.node?.suppress) return false;
  return ctx.run?.boons?.has(id);
}

function ownedTags(ctx) {
  const tags = new Set();
  (ctx.run?.boons || new Set()).forEach((id) => {
    const t = BOONS[id]?.tag;
    if (t) tags.add(t);
  });
  return tags;
}

export function createBoonArchitect() {
  const api = {
    catalog: BOONS,
    legacy: LEGACY_BOONS,
    resolve(id) {
      return BOONS[id] || LEGACY_BOONS[id] || null;
    },
    duos: DUOS,
    tags: BOON_TAGS,
    has: (ctx, id) => canUse(ctx, id),
    activeDuos(ctx) {
      const owned = ctx.run?.boons || new Set();
      return DUOS.filter((d) => owned.has(d.ids[0]) && owned.has(d.ids[1]));
    },
    focusTime(ctx, base) {
      return base + (canUse(ctx, 'tailwind') ? 5 : 0);
    },
    riseMultiplier(ctx) {
      return canUse(ctx, 'coldfront') ? 0.75 : 1;
    },
    draftPool(ctx) {
      const owned = ctx.run.boons;
      const pool = Object.keys(BOONS).filter((id) => !owned.has(id));
      const tags = ownedTags(ctx);
      const low = ctx.run.stamina < 40;
      const weights = pool.map((id) => {
        const b = BOONS[id];
        let weight = b.rare ? 1 : 3;
        if (low && b.tag === 'safety') weight *= 2;
        if (ctx.run.nodeIdx >= 8 && b.tag === 'threat') weight *= 1.35;
        // Don't flood the pack with another safety pick if you already run two safety boons
        if (b.tag === 'safety' && tags.has('safety')) {
          const safetyCount = [...owned].filter((x) => BOONS[x]?.tag === 'safety').length;
          if (safetyCount >= 2) weight *= 0.3;
          else if (safetyCount >= 1) weight *= 0.55;
        }
        return weight;
      });
      return { pool, weights };
    },
    pickDraft(ctx, rnd, count = 3) {
      // Full pack: still deal two picks so camps can offer a swap, with a
      // stamina cache as the walk-away option.
      const full = ctx.run.boons.size >= (ctx.config?.MAX_BOONS ?? 5);
      if (full) count = 2;
      const { pool, weights } = api.draftPool(ctx);
      const pick = [];
      const work = pool.slice();
      const w = weights.slice();
      while (pick.length < count && work.length) {
        const total = w.reduce((a, b) => a + b, 0);
        let r = rnd() * total;
        let k = 0;
        for (; k < work.length; k++) { r -= w[k]; if (r <= 0) break; }
        if (k >= work.length) k = work.length - 1;
        pick.push(work[k]);
        work.splice(k, 1);
        w.splice(k, 1);
      }
      if (full) pick.push('_stamina');
      return pick;
    },
    onAcquire(ctx, id) {
      if (id === 'flare') ctx.run.flares = 2;
    },
    onPitchEnter(ctx) {
      const banners = [];
      if (canUse(ctx, 'provisions')) {
        const bonus = hasDuo(ctx, 'Base Camp') ? 9 : 5;
        ctx.staminaDelta = (ctx.staminaDelta || 0) + bonus;
        banners.push({ title: 'Provisions', sub: '+' + bonus + ' stamina' });
      }
      ctx.enc.firstLightUsed = false;
      ctx.enc.dawnLineUsed = false;
      return { banners };
    },
    onQuestionStart(ctx) {
      if (canUse(ctx, 'firstlight') && !ctx.enc.firstLightUsed && ctx.enc.done === 0) {
        ctx.enc.firstLightUsed = true;
        return {
          staminaDelta: 3,
          timeDelta: 3,
          banners: [{ title: 'First Light', sub: '+3 stamina · +3s' }],
        };
      }
      if (canUse(ctx, 'firstlight') && hasDuo(ctx, 'Dawn Line') && ctx.enc.done === 1 && ctx.enc.streak >= 1 && !ctx.enc.dawnLineUsed) {
        ctx.enc.dawnLineUsed = true;
        return { timeDelta: 2, banners: [{ title: 'Dawn Line', sub: '+2s' }] };
      }
      return {};
    },
    onCorrect(ctx) {
      if (canUse(ctx, 'whetstone') && !ctx.enc.whetUsed) {
        ctx.enc.whetUsed = true;
        const bite = hasDuo(ctx, 'Sharp Edge') ? 24 : 15;
        ctx.threatDelta = (ctx.threatDelta || 0) - bite;
        (ctx.banners = ctx.banners || []).push({ title: 'Whetstone', sub: 'first answer bites — threat −' + bite });
      }
      const banners = [];
      let threatDelta = 0;
      let staminaDelta = 0;
      let timeDelta = 0;

      if (canUse(ctx, 'momentum') && !ctx.enc.node.noBoonEase) {
        ctx.enc.streakEase = Math.min(7, (ctx.enc.streakEase || 0) + 1.4);
      }
      if (canUse(ctx, 'vent') && !ctx.enc.node.noBoonEase) {
        threatDelta -= hasDuo(ctx, 'Thermal') ? 2 + Math.min(5, ctx.enc.streak) : 2;
      }
      if (canUse(ctx, 'summitsurge') && ctx.enc.streak % 4 === 0) {
        staminaDelta += 8;
        banners.push({ title: 'Summit Surge', sub: '+8 stamina' });
      }
      if (canUse(ctx, 'quickdraw')) timeDelta += hasDuo(ctx, 'Slipstream') ? 2.2 : 1.5;
      if (canUse(ctx, 'cairn') && ctx.enc.streak % 3 === 0) {
        const cb = hasDuo(ctx, 'Deep Pockets') ? 9 : 6;
        ctx.enc.cairnBank = (ctx.enc.cairnBank || 0) + cb;
        banners.push({ title: 'Cairn stacked', sub: '+' + cb + ' at clear' });
      }

      let ease =
        (typeof ctx.enc.node.ease === 'number' ? ctx.enc.node.ease : ctx.config.EASE_ON_CORRECT) +
        (canUse(ctx, 'momentum') && !ctx.enc.node.noBoonEase ? ctx.enc.streakEase || 0 : 0);
      if (ctx.enc.node.fatigue) {
        ease *= ctx.enc.easeMul || 1;
        ctx.enc.easeMul = Math.max(0.35, (ctx.enc.easeMul || 1) - 0.14);
      }
      // Fluency window (verglas): a correct answer with at least half the
      // focus clock still standing sheds bonus threat.
      if (ctx.enc.node.swift && ctx.run.maxTime > 0 &&
          ctx.run.timeLeft / ctx.run.maxTime >= (ctx.enc.node.swiftFrac ?? 0.5)) {
        ease += ctx.enc.node.swift;
        if (!ctx.enc.swiftTold) {
          ctx.enc.swiftTold = true;
          banners.push({ title: 'Quick placement', sub: 'fast answers shed extra threat' });
        }
      }
      if (canUse(ctx, 'allin')) ease *= 1.45;
      if (hasDuo(ctx, 'Runout') && ctx.enc.streak >= 5) {
        ease += 9;
        banners.push({ title: 'Runout', sub: 'threat gives way' });
      }
      if (ctx.enc.node.noBoonEase) ease = 0;
      threatDelta -= ease;

      return { threatDelta, staminaDelta, timeDelta, banners };
    },
    onWrong(ctx) {
      const banners = [];
      let threatDelta = ctx.enc.node.miss;
      const tierCombat = TIER_COMBAT[ctx.enc.node.tier];
      let staminaCost = ctx.viaTimeout
        ? (tierCombat ? tierCombat.timeoutCost : ctx.config.TIMEOUT_COST)
        : (tierCombat ? tierCombat.missCost : ctx.config.MISS_COST);
      let freed = false;
      let keepStreak = false;

      if (ctx.viaTimeout && canUse(ctx, 'steady') && !ctx.enc.firstTimeoutUsed) {
        ctx.enc.firstTimeoutUsed = true;
        staminaCost = 0;
        freed = true;
        banners.push({ title: 'Steady Breath', sub: 'no stamina lost' });
      } else if (!ctx.viaTimeout && canUse(ctx, 'surefoot') && !ctx.enc.firstMissUsed) {
        ctx.enc.firstMissUsed = true;
        staminaCost = 0;
        freed = true;
        if (hasDuo(ctx, 'Belay')) {
          banners.push({ title: 'Belay', sub: 'crampons hold · +3 stamina' });
          return { threatDelta, staminaCost: 0, staminaDelta: 3, banners, keepStreak: false };
        }
        banners.push({ title: 'Crampons', sub: 'no stamina lost' });
      }

      if (canUse(ctx, 'rally') && !ctx.enc.rallyUsed && ctx.enc.streak > 0) {
        ctx.enc.rallyUsed = true;
        if (hasDuo(ctx, 'Unbreakable')) ctx.enc.bulwarkUsed = false;
        keepStreak = true;
        banners.push({ title: 'Rally', sub: 'streak held' });
      }

      if (staminaCost > 0 && ctx.enc.node.escalate) staminaCost += ctx.enc.missCount * ctx.enc.node.escalate;
      if (staminaCost > 0) staminaCost = Math.round(staminaCost * oathStamMult(ctx.run));
      ctx.enc.missCount++;
      if (canUse(ctx, 'allin')) threatDelta *= 1.45;
      if (freed && hasDuo(ctx, 'Solid Footing')) threatDelta -= 9;

      return { threatDelta, staminaCost, banners, keepStreak };
    },
    onStrike(ctx) {
      if (canUse(ctx, 'bulwark') && !ctx.enc.bulwarkUsed) {
        ctx.enc.bulwarkUsed = true;
        return { blocked: true, banners: [{ title: 'Bulwark', sub: 'strike blocked' }] };
      }
      let hit = ctx.enc.node.hit;
      if (canUse(ctx, 'pitanchor')) hit = Math.round(hit * (hasDuo(ctx, 'Fortress') ? 0.52 : 0.62));
      if (canUse(ctx, 'fixedline') && ctx.run.stamina > ctx.config.STAM_MAX * 0.5) hit = Math.round(hit * 0.55);
      return { hit };
    },
    onGust(ctx) {
      const base = ctx.gust ?? 12 + Math.floor(ctx.rnd() * 10);
      return { threatDelta: base };
    },
    onPitchClear(ctx) {
      let bonus = ctx.enc.cairnBank || 0;
      if (canUse(ctx, 'highcamp')) bonus += Math.min(18, ctx.enc.streak * (hasDuo(ctx, 'Base Camp') ? 3 : 2));
      return { clearBonus: bonus };
    },
  };

  return {
    id: 'boon-architect',
    name: 'Boon Architect',
    role: 'Draftable modifiers, duos, and pitch-long effects',
    api,
    register(bus) {
      bus.on('pitch:enter', (ctx) => api.onPitchEnter(ctx), 'boon-architect');
      bus.on('question:start', (ctx) => api.onQuestionStart(ctx), 'boon-architect');
      bus.on('answer:correct', (ctx) => api.onCorrect(ctx), 'boon-architect');
      bus.on('answer:wrong', (ctx) => api.onWrong(ctx), 'boon-architect');
      bus.on('mountain:strike', (ctx) => api.onStrike(ctx), 'boon-architect');
      bus.on('hazard:gust', (ctx) => api.onGust(ctx), 'boon-architect');
      bus.on('pitch:clear', (ctx) => api.onPitchClear(ctx), 'boon-architect');
    },
  };
}
