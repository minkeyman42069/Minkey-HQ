/**
 * BOON ARCHITECT — draftable climb modifiers, duos, and hook-driven effects.
 * All boon logic lives here; the encounter engine only emits events.
 */

export const BOON_TAGS = {
  safety: { label: 'Safety', color: '#5fce9f' },
  speed: { label: 'Speed', color: '#8fc4dd' },
  streak: { label: 'Streak', color: '#f2b64e' },
  threat: { label: 'Threat', color: '#e37356' },
  opening: { label: 'Opening', color: '#c9a86a' },
  study: { label: 'Study', color: '#9b6fd0' },
};

export const BOONS = {
  surefoot: { ic: '🦶', name: 'Sure Footing', tag: 'safety', rare: false, desc: 'Your first miss each pitch costs no stamina.' },
  steady: { ic: '⌚', name: 'Steady Nerves', tag: 'safety', rare: false, desc: 'The first timeout each pitch costs no stamina.' },
  piton: { ic: '📌', name: 'Piton Pair', tag: 'safety', rare: false, desc: 'Your first two misses each pitch cost no stamina.' },
  fieldnotes: { ic: '🔖', name: 'Field Notes', tag: 'study', rare: false, desc: 'Once per pitch, rule out one wrong answer.' },
  routebook: { ic: '📖', name: 'Route Book', tag: 'study', rare: false, desc: 'Explanations linger longer so you can actually learn from them.' },
  momentum: { ic: '🔥', name: 'Momentum', tag: 'streak', rare: false, desc: 'Each correct answer in a row calms the threat more. A miss resets the bonus.' },
  wildfire: { ic: '✨', name: 'Wildfire', tag: 'threat', rare: false, desc: 'Every correct answer calms the threat — even without a streak.' },
  redline: { ic: '🩸', name: 'Red Line', tag: 'streak', rare: false, desc: 'On a 3+ streak, each correct answer restores 2 stamina.' },
  tailwind: { ic: '🌬️', name: 'Tailwind', tag: 'speed', rare: false, desc: 'Adds 5 seconds to the focus timer.' },
  updraft: { ic: '🎈', name: 'Updraft', tag: 'threat', rare: false, desc: 'Passive threat rises 32% slower all pitch long.' },
  provisions: { ic: '🎒', name: 'Provisions', tag: 'opening', rare: false, desc: 'Begin every pitch with +5 stamina.' },
  alpinestart: { ic: '🌅', name: 'Alpine Start', tag: 'opening', rare: false, desc: 'First question each pitch: +3 stamina and +3 seconds.' },
  secondwind: { ic: '💨', name: 'Second Wind', tag: 'streak', rare: false, desc: 'Every 4 correct in a row restores 8 stamina.' },
  rally: { ic: '🚩', name: 'Rally', tag: 'safety', rare: true, desc: 'Once per pitch, a miss will not break your streak.' },
  bulwark: { ic: '🧱', name: 'Bulwark', tag: 'safety', rare: true, desc: 'Once per pitch, the next mountain strike costs no stamina.' },
  anchor: { ic: '⚓', name: 'Storm Anchor', tag: 'safety', rare: true, desc: 'Mountain strikes cost 38% less stamina.' },
  cairn: { ic: '🪨', name: 'Cairn Builder', tag: 'streak', rare: true, desc: 'Every 3 correct in a row banks stamina, paid when you clear the pitch.' },
  highcamp: { ic: '⛺', name: 'High Camp', tag: 'streak', rare: true, desc: 'Clearing a pitch on a streak restores extra stamina.' },
  secondhand: { ic: '⏱️', name: 'Second Hand', tag: 'speed', rare: true, desc: 'Every correct answer adds time back to the clock.' },
  flare: { ic: '🧨', name: 'Signal Flare', tag: 'threat', rare: true, desc: 'Twice per climb, fire a flare to calm the threat to zero.' },
  gambit: { ic: '🎲', name: 'Gambit', tag: 'threat', rare: true, desc: 'Correct answers calm threat much more — wrong answers enrage it more.' },
  buddyrope: { ic: '🪢', name: 'Buddy Rope', tag: 'safety', rare: true, desc: 'While above half stamina, mountain strikes deal 45% less damage.' },
  weathereye: { ic: '👁️', name: 'Weather Eye', tag: 'study', rare: true, desc: 'On gust hazards, random gusts hit 40% softer.' },
};

export const DUOS = [
  { ids: ['momentum', 'gambit'], name: 'Avalanche', ic: '🏔️', desc: 'On a 5+ streak, a correct answer crushes the threat.' },
  { ids: ['wildfire', 'momentum'], name: 'Wildfire Spread', ic: '🔥', desc: 'Each correct calms the threat more the longer your streak.' },
  { ids: ['cairn', 'secondwind'], name: 'Deep Reserves', ic: '🎓', desc: 'Cairn banks more stamina per streak.' },
  { ids: ['provisions', 'highcamp'], name: 'Base Camp', ic: '⛺', desc: 'Start each pitch with +9 stamina, and finish it stronger.' },
  { ids: ['rally', 'bulwark'], name: 'Unbreakable', ic: '🛡️', desc: 'Rally also refreshes your Bulwark.' },
  { ids: ['anchor', 'bulwark'], name: 'Fortress', ic: '🏰', desc: 'Strikes that land are blunted even further.' },
  { ids: ['surefoot', 'steady'], name: 'Crampons', ic: '🧦', desc: 'Your first mistake each pitch also calms the threat.' },
  { ids: ['tailwind', 'secondhand'], name: 'Slipstream', ic: '🌀', desc: 'Time flows even more in your favor.' },
  { ids: ['piton', 'buddyrope'], name: 'Rope Team', ic: '🤝', desc: 'Piton misses also restore 3 stamina.' },
  { ids: ['alpinestart', 'redline'], name: 'Dawn Patrol', ic: '🌄', desc: 'Alpine Start bonus also fires after your first correct answer.' },
];

function hasDuo(ctx, name) {
  return (ctx.duos || []).some((d) => d.name === name);
}

function canUse(ctx, id) {
  if (ctx.enc?.node?.suppress) return false;
  return ctx.run?.boons?.has(id);
}

export function createBoonArchitect() {
  const api = {
    catalog: BOONS,
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
      return canUse(ctx, 'updraft') ? 0.68 : 1;
    },
    draftPool(ctx) {
      const owned = ctx.run.boons;
      const pool = Object.keys(BOONS).filter((id) => !owned.has(id));
      const low = ctx.run.stamina < 40;
      const weights = pool.map((id) => {
        const b = BOONS[id];
        let weight = b.rare ? 1 : 3;
        if (low && b.tag === 'safety') weight *= 2.2;
        if (ctx.run.nodeIdx >= 8 && b.tag === 'threat') weight *= 1.4;
        return weight;
      });
      return { pool, weights };
    },
    pickDraft(ctx, rnd, count = 3) {
      if (ctx.run.boons.size >= (ctx.config?.MAX_BOONS ?? 5)) return ['_stamina'];
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
      ctx.enc.alpineStartUsed = false;
      ctx.enc.dawnPatrolUsed = false;
      ctx.enc.pitonUsed = 0;
      return { banners };
    },
    onQuestionStart(ctx) {
      if (canUse(ctx, 'alpinestart') && !ctx.enc.alpineStartUsed && ctx.enc.done === 0) {
        ctx.enc.alpineStartUsed = true;
        return {
          staminaDelta: 3,
          timeDelta: 3,
          banners: [{ title: 'Alpine Start', sub: '+3 stamina · +3s' }],
        };
      }
      if (canUse(ctx, 'alpinestart') && hasDuo(ctx, 'Dawn Patrol') && ctx.enc.done === 1 && ctx.enc.streak >= 1 && !ctx.enc.dawnPatrolUsed) {
        ctx.enc.dawnPatrolUsed = true;
        return { timeDelta: 2, banners: [{ title: 'Dawn Patrol', sub: '+2s momentum' }] };
      }
      return {};
    },
    onCorrect(ctx) {
      const banners = [];
      let threatDelta = 0;
      let staminaDelta = 0;
      let timeDelta = 0;

      if (canUse(ctx, 'momentum') && !ctx.enc.node.noBoonEase) {
        ctx.enc.streakEase = Math.min(7, (ctx.enc.streakEase || 0) + 1.4);
      }
      if (canUse(ctx, 'wildfire') && !ctx.enc.node.noBoonEase) {
        threatDelta -= hasDuo(ctx, 'Wildfire Spread') ? 2 + Math.min(5, ctx.enc.streak) : 2;
      }
      if (canUse(ctx, 'redline') && ctx.enc.streak >= 3) staminaDelta += 2;
      if (canUse(ctx, 'secondwind') && ctx.enc.streak % 4 === 0) {
        staminaDelta += 8;
        banners.push({ title: 'Second Wind', sub: '+8 stamina' });
      }
      if (canUse(ctx, 'secondhand')) timeDelta += hasDuo(ctx, 'Slipstream') ? 2.2 : 1.5;
      if (canUse(ctx, 'cairn') && ctx.enc.streak % 3 === 0) {
        const cb = hasDuo(ctx, 'Deep Reserves') ? 9 : 6;
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
      if (canUse(ctx, 'gambit')) ease *= 1.45;
      if (hasDuo(ctx, 'Avalanche') && ctx.enc.streak >= 5) {
        ease += 9;
        banners.push({ title: 'Avalanche', sub: 'threat gives way' });
      }
      if (ctx.enc.node.noBoonEase) ease = 0;
      threatDelta -= ease;

      return { threatDelta, staminaDelta, timeDelta, banners };
    },
    onWrong(ctx) {
      const banners = [];
      let threatDelta = ctx.enc.node.miss;
      let staminaCost = ctx.viaTimeout ? ctx.config.TIMEOUT_COST : ctx.config.MISS_COST;
      let freed = false;
      let keepStreak = false;

      if (ctx.viaTimeout && canUse(ctx, 'steady') && !ctx.enc.firstTimeoutUsed) {
        ctx.enc.firstTimeoutUsed = true;
        staminaCost = 0;
        freed = true;
        banners.push({ title: 'Steady nerves', sub: 'no stamina lost' });
      } else if (!ctx.viaTimeout) {
        if (canUse(ctx, 'piton') && (ctx.enc.pitonUsed || 0) < 2) {
          ctx.enc.pitonUsed = (ctx.enc.pitonUsed || 0) + 1;
          staminaCost = 0;
          freed = true;
          if (hasDuo(ctx, 'Rope Team')) {
            banners.push({ title: 'Rope Team', sub: 'piton holds · +3 stamina' });
            return { threatDelta, staminaCost: 0, staminaDelta: 3, banners, keepStreak: false };
          }
          banners.push({ title: 'Piton holds', sub: 'no stamina lost' });
        } else if (canUse(ctx, 'surefoot') && !ctx.enc.firstMissUsed) {
          ctx.enc.firstMissUsed = true;
          staminaCost = 0;
          freed = true;
          banners.push({ title: 'Sure footing', sub: 'no stamina lost' });
        }
      }

      if (canUse(ctx, 'rally') && !ctx.enc.rallyUsed && ctx.enc.streak > 0) {
        ctx.enc.rallyUsed = true;
        if (hasDuo(ctx, 'Unbreakable')) ctx.enc.bulwarkUsed = false;
        keepStreak = true;
        banners.push({ title: 'Rally', sub: 'streak held' });
      }

      if (staminaCost > 0 && ctx.enc.node.escalate) staminaCost += ctx.enc.missCount * ctx.enc.node.escalate;
      ctx.enc.missCount++;
      if (canUse(ctx, 'gambit')) threatDelta *= 1.45;
      if (freed && hasDuo(ctx, 'Crampons')) threatDelta -= 9;

      return { threatDelta, staminaCost, banners, keepStreak };
    },
    onStrike(ctx) {
      if (canUse(ctx, 'bulwark') && !ctx.enc.bulwarkUsed) {
        ctx.enc.bulwarkUsed = true;
        return { blocked: true, banners: [{ title: 'Bulwark holds', sub: 'no stamina lost' }] };
      }
      let hit = ctx.enc.node.hit;
      if (canUse(ctx, 'anchor')) hit = Math.round(hit * (hasDuo(ctx, 'Fortress') ? 0.52 : 0.62));
      if (canUse(ctx, 'buddyrope') && ctx.run.stamina > ctx.config.STAM_MAX * 0.5) hit = Math.round(hit * 0.55);
      return { hit };
    },
    onGust(ctx) {
      const base = ctx.gust ?? 12 + Math.floor(ctx.rnd() * 10);
      if (!canUse(ctx, 'weathereye')) return { threatDelta: base };
      return {
        threatDelta: Math.round(base * 0.6),
        banners: [{ title: 'Weather Eye', sub: 'you saw it coming' }],
      };
    },
    onPitchClear(ctx) {
      let bonus = ctx.enc.cairnBank || 0;
      if (canUse(ctx, 'highcamp')) bonus += Math.min(18, ctx.enc.streak * (hasDuo(ctx, 'Base Camp') ? 3 : 2));
      return { clearBonus: bonus };
    },
    explainLingerMs(ctx) {
      return canUse(ctx, 'routebook') ? 2800 : 0;
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
