// Turn-based battle engine for Minkey HQ.
//
// Both the player squad and the enemy squad are represented as "combatants"
// with the same shape, so every rule applies symmetrically. The UI drives the
// flow: it asks whose turn it is, requests an action for player units, and lets
// the engine resolve enemy turns automatically.

let uid = 0;

/** Build a live combatant from a static agent/foe definition. */
export function createCombatant(def, side) {
  return {
    uid: `c${uid++}`,
    ref: def,
    name: def.name,
    codename: def.codename,
    emoji: def.emoji,
    accent: def.accent,
    role: def.role,
    ability: def.ability,
    side,
    maxHp: def.stats.hp,
    hp: def.stats.hp,
    atk: def.stats.atk,
    def: def.stats.def,
    spd: def.stats.spd,
    alive: true,
    shield: 0,
    atkMult: 1,
    atkMultTurns: 0,
    defDown: 0,
    defDownTurns: 0,
    poison: null, // { dmg, turns }
  };
}

export function startBattle(playerDefs, enemyDefs) {
  const battle = {
    player: playerDefs.map((d) => createCombatant(d, 'player')),
    enemy: enemyDefs.map((d) => createCombatant(d, 'enemy')),
    round: 1,
    order: [],
    turnIndex: 0,
    log: [],
    status: 'active', // active | won | lost
  };
  buildOrder(battle);
  logMsg(battle, `Round 1 — deploy!`, 'round');
  return battle;
}

export function allUnits(battle) {
  return [...battle.player, ...battle.enemy];
}

export function livingOf(battle, side) {
  return battle[side].filter((c) => c.alive);
}

function buildOrder(battle) {
  battle.order = allUnits(battle)
    .filter((c) => c.alive)
    .sort((a, b) => {
      if (b.spd !== a.spd) return b.spd - a.spd;
      // player edges ties, then stable by uid
      if (a.side !== b.side) return a.side === 'player' ? -1 : 1;
      return a.uid.localeCompare(b.uid);
    })
    .map((c) => c.uid);
  battle.turnIndex = 0;
}

export function currentActor(battle) {
  if (battle.status !== 'active') return null;
  const uidAt = battle.order[battle.turnIndex];
  const actor = allUnits(battle).find((c) => c.uid === uidAt);
  if (!actor || !actor.alive) return null;
  return actor;
}

export function isPlayerTurn(battle) {
  const a = currentActor(battle);
  return !!a && a.side === 'player';
}

function logMsg(battle, text, kind = 'info') {
  battle.log.push({ text, kind });
}

function effectiveAtk(c) {
  return Math.round(c.atk * c.atkMult);
}

function effectiveDef(c) {
  return Math.max(0, c.def - c.defDown);
}

function applyDamage(battle, target, amount, { crit = false } = {}) {
  let dmg = Math.max(1, Math.round(amount));
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, dmg);
    target.shield -= absorbed;
    dmg -= absorbed;
    if (absorbed > 0) {
      logMsg(battle, `🛡️ ${target.name}'s barrier absorbs ${absorbed}.`, 'shield');
    }
  }
  target.hp = Math.max(0, target.hp - dmg);
  logMsg(
    battle,
    `${crit ? '💥 CRIT! ' : ''}${target.name} takes ${dmg} damage${target.hp === 0 ? ' and is down!' : ''}.`,
    crit ? 'crit' : 'hit',
  );
  if (target.hp === 0) target.alive = false;
  return dmg;
}

function healUnit(battle, target, amount) {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + Math.round(amount));
  const gained = target.hp - before;
  logMsg(battle, `💚 ${target.name} recovers ${gained} health.`, 'heal');
  return gained;
}

function enemiesOf(battle, actor) {
  return livingOf(battle, actor.side === 'player' ? 'enemy' : 'player');
}

function alliesOf(battle, actor) {
  return livingOf(battle, actor.side);
}

/**
 * Resolve an action. actionType is 'attack' or 'ability'.
 * targetUid is required for single-target actions; ignored otherwise.
 * Returns true if the action was resolved.
 */
export function performAction(battle, actor, actionType, targetUid) {
  if (battle.status !== 'active' || !actor.alive) return false;

  if (actionType === 'attack') {
    const target = allUnits(battle).find((c) => c.uid === targetUid);
    if (!target || !target.alive) return false;
    const crit = Math.random() < 0.12;
    let raw = effectiveAtk(actor) - effectiveDef(target);
    if (crit) raw = effectiveAtk(actor) * 1.8 - effectiveDef(target) * 0.5;
    logMsg(battle, `${actor.emoji} ${actor.name} strikes ${target.name}.`, 'action');
    applyDamage(battle, target, raw, { crit });
  } else {
    resolveAbility(battle, actor, targetUid);
  }

  postActionCleanup(battle);
  return true;
}

function resolveAbility(battle, actor, targetUid) {
  const ab = actor.ability;
  const target = allUnits(battle).find((c) => c.uid === targetUid);
  logMsg(battle, `✨ ${actor.name} uses ${ab.name}!`, 'ability');

  switch (ab.type) {
    case 'damage': {
      if (!target) return;
      applyDamage(battle, target, effectiveAtk(actor) + ab.power - effectiveDef(target) * 0.5);
      break;
    }
    case 'crit': {
      if (!target) return;
      applyDamage(battle, target, (effectiveAtk(actor) + ab.power) * 1.6 - effectiveDef(target) * 0.5, {
        crit: true,
      });
      break;
    }
    case 'aoe': {
      enemiesOf(battle, actor).forEach((t) =>
        applyDamage(battle, t, effectiveAtk(actor) * 0.5 + ab.power - effectiveDef(t)),
      );
      break;
    }
    case 'poison': {
      if (!target) return;
      applyDamage(battle, target, ab.power);
      target.poison = { dmg: ab.power, turns: 3 };
      target.defDown += 4;
      target.defDownTurns = Math.max(target.defDownTurns, 3);
      logMsg(battle, `☠️ ${target.name} is poisoned and weakened.`, 'debuff');
      break;
    }
    case 'debuff': {
      if (!target) return;
      applyDamage(battle, target, ab.power - effectiveDef(target) * 0.5);
      target.atkMult = Math.max(0.4, target.atkMult - 0.4);
      target.atkMultTurns = 3;
      logMsg(battle, `📉 ${target.name}'s attack drops.`, 'debuff');
      break;
    }
    case 'shield': {
      alliesOf(battle, actor).forEach((a) => {
        a.shield += ab.power;
      });
      logMsg(battle, `🛡️ The whole squad gains a ${ab.power}-point barrier.`, 'shield');
      break;
    }
    case 'heal': {
      const wounded = alliesOf(battle, actor).sort(
        (a, b) => a.hp / a.maxHp - b.hp / b.maxHp,
      )[0];
      if (wounded) healUnit(battle, wounded, ab.power);
      break;
    }
    case 'healAll': {
      alliesOf(battle, actor).forEach((a) => {
        healUnit(battle, a, ab.power);
        // cleanse weakening effects, but keep positive buffs intact
        if (a.atkMult < 1) {
          a.atkMult = 1;
          a.atkMultTurns = 0;
        }
        a.defDown = 0;
        a.defDownTurns = 0;
        a.poison = null;
      });
      logMsg(battle, `🌿 Weakening effects cleansed.`, 'heal');
      break;
    }
    case 'buff': {
      alliesOf(battle, actor).forEach((a) => {
        a.atkMult = Math.max(a.atkMult, 1.4);
        a.atkMultTurns = 3;
      });
      logMsg(battle, `⚔️ The squad's attack surges!`, 'buff');
      break;
    }
    case 'hasteBuff': {
      if (!target) return;
      target.atkMult = Math.max(target.atkMult, 1.6);
      target.atkMultTurns = 3;
      target.spd += 6;
      logMsg(battle, `🚀 ${target.name} is supercharged!`, 'buff');
      break;
    }
    default:
      break;
  }
}

/** Simple but competent enemy AI. */
export function enemyChooseAndAct(battle) {
  const actor = currentActor(battle);
  if (!actor || actor.side !== 'enemy') return;
  const targets = enemiesOf(battle, actor); // enemies-of-enemy = player units
  if (targets.length === 0) return;

  // Prefer the ability ~55% of the time when it makes sense.
  const useAbility = Math.random() < 0.55;
  const ab = actor.ability;

  if (useAbility && ab) {
    if (['aoe', 'shield', 'heal', 'healAll', 'buff'].includes(ab.type)) {
      performAction(battle, actor, 'ability', null);
      return;
    }
    // single-target ability: hit the lowest-health player unit
    const focus = [...targets].sort((a, b) => a.hp - b.hp)[0];
    performAction(battle, actor, 'ability', focus.uid);
    return;
  }

  // basic attack: focus the weakest target
  const focus = [...targets].sort((a, b) => a.hp - b.hp)[0];
  performAction(battle, actor, 'attack', focus.uid);
}

function postActionCleanup(battle) {
  checkEnd(battle);
}

/** Advance to the next actor, handling round rollover and status ticks. */
export function advanceTurn(battle) {
  if (battle.status !== 'active') return;

  do {
    battle.turnIndex++;
    if (battle.turnIndex >= battle.order.length) {
      endOfRound(battle);
      if (battle.status !== 'active') return;
      battle.round++;
      buildOrder(battle);
      logMsg(battle, `Round ${battle.round}`, 'round');
    }
  } while (currentActor(battle) === null && battle.status === 'active');
}

function endOfRound(battle) {
  // poison ticks and status durations tick down at the end of each round
  allUnits(battle).forEach((c) => {
    if (!c.alive) return;
    if (c.poison) {
      applyDamage(battle, c, c.poison.dmg);
      c.poison.turns--;
      if (c.poison.turns <= 0) c.poison = null;
    }
    if (c.atkMultTurns > 0) {
      c.atkMultTurns--;
      if (c.atkMultTurns === 0) c.atkMult = 1;
    }
    if (c.defDownTurns > 0) {
      c.defDownTurns--;
      if (c.defDownTurns === 0) c.defDown = 0;
    }
  });
  checkEnd(battle);
}

function checkEnd(battle) {
  const playerAlive = livingOf(battle, 'player').length;
  const enemyAlive = livingOf(battle, 'enemy').length;
  if (enemyAlive === 0 && playerAlive > 0) {
    battle.status = 'won';
    logMsg(battle, '🎉 Victory! HQ holds the line.', 'win');
  } else if (playerAlive === 0) {
    battle.status = 'lost';
    logMsg(battle, '💀 Squad wiped. Regroup and try again.', 'lose');
  }
}
