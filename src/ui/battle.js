import { getAgent } from '../data/roster.js';
import { getState, markCleared } from '../state.js';
import {
  startBattle,
  currentActor,
  isPlayerTurn,
  performAction,
  advanceTurn,
  enemyChooseAndAct,
} from '../game/battle.js';
import { el, clear, hpBar } from './dom.js';

// Ability types that target a single enemy.
const ENEMY_TARGET = new Set(['damage', 'crit', 'poison', 'debuff']);
// Ability types that target a single ally.
const ALLY_TARGET = new Set(['hasteBuff']);
// Everything else (aoe / shield / heal / healAll / buff) resolves with no pick.

export function renderBattle(root, mission, navigate) {
  const state = getState();
  const playerDefs = state.squad.map((id) => getAgent(id));
  const battle = startBattle(playerDefs, mission.squad);

  // pending = { actionType, needsTarget, side } while player selects a target
  let pending = null;
  const container = el('div', {});
  root.appendChild(container);

  function unitCard(c, clickable, onClick) {
    const dead = !c.alive;
    const status = el('div', { class: 'status-icons' }, [
      c.shield > 0 ? el('span', { class: 'st', title: `Barrier ${c.shield}`, text: `🛡️${c.shield}` }) : null,
      c.atkMult > 1 ? el('span', { class: 'st buff', title: 'Attack up', text: '⚔️↑' }) : null,
      c.atkMult < 1 ? el('span', { class: 'st debuff', title: 'Attack down', text: '⚔️↓' }) : null,
      c.poison ? el('span', { class: 'st debuff', title: 'Poisoned', text: '☠️' }) : null,
      c.defDown > 0 ? el('span', { class: 'st debuff', title: 'Defense down', text: '🛡️↓' }) : null,
    ]);

    const isActor = currentActor(battle) === c;
    return el('div', {
      class: `unit${dead ? ' dead' : ''}${clickable ? ' targetable' : ''}${isActor ? ' acting' : ''}`,
      style: { '--accent': c.accent },
      onClick: clickable && !dead ? onClick : null,
    }, [
      status,
      el('div', { class: 'unit-emoji', text: c.emoji }),
      el('div', { class: 'unit-name', text: c.name }),
      el('div', { class: 'unit-role', text: c.role }),
      hpBar(c.hp, c.maxHp, c.accent),
    ]);
  }

  function actionPanel() {
    if (battle.status !== 'active') return resultPanel();

    const actor = currentActor(battle);
    if (!actor) return el('div', { class: 'action-panel' }, [el('p', { text: '…' })]);

    if (!isPlayerTurn(battle)) {
      return el('div', { class: 'action-panel enemy-turn' }, [
        el('p', { class: 'turn-note', html: `<strong>${actor.emoji} ${actor.name}</strong> (enemy) is acting…` }),
      ]);
    }

    if (pending && pending.needsTarget) {
      return el('div', { class: 'action-panel' }, [
        el('p', { class: 'turn-note', text: pending.side === 'ally' ? 'Choose an ally to target.' : 'Choose an enemy to target.' }),
        el('button', { class: 'ghost', text: 'Cancel', onClick: () => { pending = null; rerender(); } }),
      ]);
    }

    const ab = actor.ability;
    return el('div', { class: 'action-panel' }, [
      el('p', { class: 'turn-note', html: `Your turn — <strong>${actor.emoji} ${actor.name}</strong>` }),
      el('div', { class: 'action-buttons' }, [
        el('button', {
          class: 'act-btn attack',
          text: '👊 Attack',
          onClick: () => beginAction('attack', 'enemy', true),
        }),
        el('button', {
          class: 'act-btn ability',
          title: ab.description,
          html: `✨ ${ab.name}<small>${ab.description}</small>`,
          onClick: () => {
            if (ENEMY_TARGET.has(ab.type)) beginAction('ability', 'enemy', true);
            else if (ALLY_TARGET.has(ab.type)) beginAction('ability', 'ally', true);
            else resolve('ability', null); // no target needed
          },
        }),
      ]),
    ]);
  }

  function resultPanel() {
    const won = battle.status === 'won';
    if (won) markCleared(mission.id);
    return el('div', { class: `action-panel result ${won ? 'win' : 'lose'}` }, [
      el('h2', { text: won ? '🎉 Mission Complete!' : '💀 Squad Down' }),
      el('p', { text: won ? mission.reward : 'The Baron laughs. Regroup and redeploy.' }),
      el('div', { class: 'action-buttons' }, [
        el('button', { class: 'primary', text: 'Return to HQ', onClick: () => navigate('hq') }),
        el('button', { class: 'ghost', text: 'Retry Mission', onClick: () => navigate('battle', mission) }),
      ]),
    ]);
  }

  function beginAction(actionType, side, needsTarget) {
    pending = { actionType, side, needsTarget };
    rerender();
  }

  function resolve(actionType, targetUid) {
    const actor = currentActor(battle);
    performAction(battle, actor, actionType, targetUid);
    pending = null;
    rerender();
    if (battle.status === 'active') {
      advanceTurn(battle);
      rerender();
      scheduleEnemy();
    } else {
      rerender();
    }
  }

  function scheduleEnemy() {
    if (battle.status !== 'active') return;
    if (isPlayerTurn(battle)) return;
    setTimeout(() => {
      if (battle.status !== 'active') { rerender(); return; }
      enemyChooseAndAct(battle);
      rerender();
      if (battle.status === 'active') {
        advanceTurn(battle);
        rerender();
        scheduleEnemy();
      }
    }, 850);
  }

  function targetHandler(c) {
    if (!pending || !pending.needsTarget) return null;
    const wantAlly = pending.side === 'ally';
    const matches = wantAlly ? c.side === 'player' : c.side === 'enemy';
    if (!matches) return null;
    return () => resolve(pending.actionType, c.uid);
  }

  function rerender() {
    clear(container);

    const logBox = el('div', { class: 'log' },
      battle.log.slice(-40).map((l) => el('div', { class: `log-line ${l.kind}`, text: l.text })));

    const board = el('div', { class: 'battle-board' }, [
      el('div', { class: 'team-column player-col' }, [
        el('h3', { class: 'col-title', text: 'Your Squad' }),
        el('div', { class: 'unit-list' },
          battle.player.map((c) => {
            const h = targetHandler(c);
            return unitCard(c, !!h, h);
          })),
      ]),
      el('div', { class: 'vs-mark' }, [
        el('span', { class: 'round-pill', text: `Round ${battle.round}` }),
        el('span', { class: 'vs-text', text: 'VS' }),
      ]),
      el('div', { class: 'team-column enemy-col' }, [
        el('h3', { class: 'col-title', text: mission.name.split('—')[0].trim() }),
        el('div', { class: 'unit-list' },
          battle.enemy.map((c) => {
            const h = targetHandler(c);
            return unitCard(c, !!h, h);
          })),
      ]),
    ]);

    container.append(
      el('header', { class: 'battle-bar' }, [
        el('button', { class: 'ghost small', text: '← Retreat to HQ', onClick: () => navigate('hq') }),
        el('h2', { text: mission.name }),
        el('span', {}),
      ]),
      el('main', { class: 'battle-screen' }, [board, actionPanel(), logBox]),
    );
    // keep log scrolled to the newest line
    logBox.scrollTop = logBox.scrollHeight;
  }

  rerender();
  scheduleEnemy(); // in case an enemy has the fastest opening move
}
