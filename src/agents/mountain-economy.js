/**
 * MOUNTAIN ECONOMY — weather, relics, stamina restore, threat / strike helpers.
 */

export const WEATHERS = [
  { name: 'Clear Dawn', ic: '\uD83C\uDF04', rise: 1, time: 1, heal: 1, score: 1, desc: 'A clear, still morning, the rarest kind of weather this high. Nothing works against you today but the climb itself.' },
  { name: 'Gathering Storm', ic: '\u26C8\uFE0F', rise: 1.18, time: 1, heal: 1, score: 1.1, desc: 'A storm building over the high peaks, hours out but coming for you. The threat rises faster all day under it, and a summit earned in this counts for more.' },
  { name: 'Dead of Night', ic: '\uD83C\uDF0C', rise: 1, time: 0.88, heal: 1, score: 1.15, desc: 'You climb this one by headlamp, with less time to read each move. In return, the mountain gives up more of its buried gear in the dark.' },
  { name: 'Thin Season', ic: '\uD83E\uDD76', rise: 1, time: 1, heal: 0.75, score: 1.12, desc: 'The lean months, when the mountain gives nothing back easily. Every camp and every ledge restores less than it should.' },
];

export const RELICS = {
  iceaxe: { ic: '\u26CF\uFE0F', name: 'Ice Axe', desc: 'Once per climb, arrest a fatal fall and hold on at 1 stamina.' },
  carabiner: { ic: '\uD83D\uDD17', name: 'Lucky Carabiner', desc: 'The first strike each pitch costs half.' },
  oxygen: { ic: '\uD83D\uDCA8', name: 'Oxygen Cache', desc: 'Firing a flare also restores 12 stamina.' },
  chalk: { ic: '\uD83D\uDC5D', name: 'Chalk Bag', desc: 'Answer a question you once missed and the threat goes fully quiet.' },
  rope: { ic: '\uD83E\uDDF6', name: 'Woven Rope', desc: 'Gatekeepers strike 25% softer.' },
  stone: { ic: '\uD83D\uDC8E', name: 'Summit Stone', desc: 'Does nothing but weigh a little and mean a lot. +15 summit score \u2014 it wants to go home.' },
  feather: { ic: '\uD83E\uDEB6', name: 'Ptarmigan Feather', desc: 'Once per climb, a timeout costs nothing and your streak survives. A small bird pays a small debt.' },
};

export function pitchRestore(node, mode, run, config) {
  const heal = run.weather ? run.weather.heal : 1;
  // Wool Socks: every camp and every cleared ledge heals a little more.
  // With Provisions it becomes Home Comforts and heals more still.
  let socks = 0;
  if (run.boons && run.boons.has('woolsocks')) {
    socks = run.boons.has('provisions') ? 9 : 6;
  }
  if (mode === 'rest') return Math.round(node.restore * heal) + socks;
  return Math.round(node.restore * config.CLEAR_RESTORE_MULT * heal) + socks;
}

function hasDuo(ctx, name) {
  if (ctx.hasDuo) return ctx.hasDuo(name);
  return (ctx.duos || []).some((d) => d.name === name);
}

function boonHas(ctx, id) {
  if (ctx.enc?.node?.suppress) return false;
  if (ctx.boon?.has) return ctx.boon.has(ctx, id);
  return ctx.run?.boons?.has(id);
}

export function createEconomyApi() {
  return {
    raiseThreat(ctx, x) {
      const enc = ctx.enc;
      if (!enc) return;
      enc.threat = Math.max(0, Math.min(enc.max, enc.threat + x));
      if (enc.threat >= enc.max) this.mountainStrikes(ctx);
      ctx.render?.threat?.();
    },

    mountainStrikes(ctx) {
      const { enc, config, run } = ctx;
      enc.threat = Math.max(0, enc.threat - config.THREAT_RESET);

      if (boonHas(ctx, 'bulwark') && !enc.bulwarkUsed) {
        enc.bulwarkUsed = true;
        ctx.audio?.tick?.();
        ctx.render?.encChrome?.();
        ctx.banner?.('Bulwark holds', 'no stamina lost');
        return { blocked: true };
      }

      let hit = enc.node.hit;
      if (boonHas(ctx, 'pitanchor')) hit = Math.round(hit * (hasDuo(ctx, 'Fortress') ? 0.55 : 0.62));
      if (run.relics?.has('carabiner') && !enc.luckyUsed) {
        enc.luckyUsed = true;
        hit = Math.round(hit * 0.5);
      }
      if (run.relics?.has('rope') && enc.node.kind === 'gate') hit = Math.round(hit * 0.75);

      if (ctx.addStamina) ctx.addStamina(-hit);
      else if (typeof ctx.staminaDelta === 'number') ctx.staminaDelta -= hit;
      else run.stamina = Math.max(0, Math.min(config.STAM_MAX, run.stamina - hit));

      ctx.audio?.strike?.();
      ctx.render?.encChrome?.();
      ctx.render?.stam?.();
      ctx.banner?.('The mountain pushes back', '&#8722;' + hit + ' stamina');
      return { hit };
    },

    grantRelic(ctx, id) {
      const { run, config, rnd } = ctx;
      if (!config.MODS.relics) return null;
      const pool = Object.keys(RELICS).filter((k) => !run.relics.has(k));
      if (!pool.length) return null;
      const pick = id && !run.relics.has(id) ? id : pool[Math.floor(rnd() * pool.length)];
      run.relics.add(pick);
      run.relicLog.push(pick);
      const r = RELICS[pick];
      ctx.banner?.(r.ic + ' ' + r.name, r.desc);
      ctx.renderHeld?.();
      return pick;
    },
  };
}
