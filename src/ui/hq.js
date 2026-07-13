import { ROSTER, ROLES, getAgent } from '../data/roster.js';
import { MISSIONS } from '../data/enemies.js';
import {
  getState,
  toggleSquadMember,
  isMissionUnlocked,
  resetProgress,
} from '../state.js';
import { el } from './dom.js';

function header(navigate) {
  return el('header', { class: 'topbar' }, [
    el('div', { class: 'brand' }, [
      el('span', { class: 'brand-mark', text: '🐵' }),
      el('div', {}, [
        el('h1', { text: 'Minkey HQ' }),
        el('p', { class: 'brand-sub', text: 'Elite Simian Operations Division' }),
      ]),
    ]),
    el('nav', { class: 'nav' }, [
      el('button', { class: 'nav-link active', text: 'HQ', onClick: () => navigate('hq') }),
      el('button', { class: 'nav-link', text: 'Field Manual', onClick: () => navigate('help') }),
    ]),
  ]);
}

function statRow(label, value, max = 200) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return el('div', { class: 'stat-row' }, [
    el('span', { class: 'stat-label', text: label }),
    el('div', { class: 'stat-track' }, [
      el('div', { class: 'stat-fill', style: { width: `${pct}%` } }),
    ]),
    el('span', { class: 'stat-num', text: String(value) }),
  ]);
}

function agentCard(agent, navigate) {
  const state = getState();
  const inSquad = state.squad.includes(agent.id);
  const role = ROLES[agent.role];

  const card = el('article', {
    class: `agent-card${inSquad ? ' selected' : ''}`,
    style: { '--accent': agent.accent },
  }, [
    el('div', { class: 'agent-top' }, [
      el('div', { class: 'agent-avatar', text: agent.emoji }),
      el('div', { class: 'agent-id' }, [
        el('h3', { text: agent.name }),
        el('p', { class: 'agent-codename', text: `"${agent.codename}"` }),
        el('span', {
          class: 'role-chip',
          style: { '--role': role.color },
          text: agent.role,
        }),
      ]),
    ]),
    el('p', { class: 'agent-bio', text: agent.bio }),
    el('div', { class: 'agent-stats' }, [
      statRow('HP', agent.stats.hp, 200),
      statRow('ATK', agent.stats.atk, 45),
      statRow('DEF', agent.stats.def, 20),
      statRow('SPD', agent.stats.spd, 18),
    ]),
    el('div', { class: 'ability-box' }, [
      el('div', { class: 'ability-head' }, [
        el('strong', { text: agent.ability.name }),
        el('span', { class: 'ability-tag', text: agent.ability.type }),
      ]),
      el('p', { text: agent.ability.description }),
    ]),
    el('p', { class: 'agent-quote', text: `“${agent.quote}”` }),
    el('button', {
      class: `pick-btn${inSquad ? ' picked' : ''}`,
      text: inSquad ? '✓ On Squad' : 'Add to Squad',
      onClick: () => {
        toggleSquadMember(agent.id);
        navigate('hq');
      },
    }),
  ]);
  return card;
}

function squadBar(navigate) {
  const state = getState();
  const slots = [0, 1, 2].map((i) => {
    const id = state.squad[i];
    const agent = id ? getAgent(id) : null;
    return el('div', {
      class: `squad-slot${agent ? ' filled' : ''}`,
      style: agent ? { '--accent': agent.accent } : {},
      onClick: agent ? () => { toggleSquadMember(agent.id); navigate('hq'); } : null,
      title: agent ? 'Remove from squad' : 'Empty slot',
    }, agent
      ? [el('span', { class: 'slot-emoji', text: agent.emoji }), el('span', { class: 'slot-name', text: agent.codename })]
      : [el('span', { class: 'slot-empty', text: `Slot ${i + 1}` })]);
  });

  return el('section', { class: 'squad-bar' }, [
    el('div', { class: 'squad-bar-head' }, [
      el('h2', { text: 'Active Squad' }),
      el('p', { class: 'muted', text: 'Pick any 3 agents. Tap a slot to remove.' }),
    ]),
    el('div', { class: 'squad-slots' }, slots),
  ]);
}

function missionCard(mission, navigate) {
  const state = getState();
  const unlocked = isMissionUnlocked(mission.id);
  const cleared = state.clearedMissions.includes(mission.id);
  const squadReady = state.squad.length === 3;

  return el('article', { class: `mission-card${unlocked ? '' : ' locked'}` }, [
    el('div', { class: 'mission-head' }, [
      el('h3', { text: mission.name }),
      cleared
        ? el('span', { class: 'badge cleared', text: '✓ Cleared' })
        : unlocked
          ? el('span', { class: 'badge open', text: 'Available' })
          : el('span', { class: 'badge locked', text: '🔒 Locked' }),
    ]),
    el('p', { class: 'mission-brief', text: mission.brief }),
    el('div', { class: 'mission-foes' },
      mission.squad.map((f) => el('span', { class: 'foe-chip', title: f.name }, [
        el('span', { text: f.emoji }), el('span', { text: f.name }),
      ]))),
    el('button', {
      class: 'deploy-btn',
      disabled: !unlocked || !squadReady,
      text: !unlocked ? 'Locked' : !squadReady ? 'Fill your squad first' : cleared ? 'Replay Mission' : 'Deploy Squad',
      onClick: (!unlocked || !squadReady) ? null : () => navigate('battle', mission),
    }),
  ]);
}

export function renderHQ(root, navigate) {
  const state = getState();

  root.append(
    header(navigate),
    el('main', { class: 'page' }, [
      el('section', { class: 'hero' }, [
        el('div', { class: 'hero-text' }, [
          el('h2', { text: 'Assemble the team. Take back the jungle.' }),
          el('p', {
            text: 'Minkey HQ is home to a full roster of elite monkey agents. Choose your squad of three, deploy across four escalating missions, and topple Baron Von Grubb.',
          }),
          el('div', { class: 'hero-actions' }, [
            el('button', {
              class: 'primary',
              text: 'View Field Manual',
              onClick: () => navigate('help'),
            }),
          ]),
        ]),
        el('div', { class: 'hero-stats' }, [
          el('div', { class: 'hero-stat' }, [el('strong', { text: String(ROSTER.length) }), el('span', { text: 'Agents' })]),
          el('div', { class: 'hero-stat' }, [el('strong', { text: String(Object.keys(ROLES).length) }), el('span', { text: 'Roles' })]),
          el('div', { class: 'hero-stat' }, [el('strong', { text: String(MISSIONS.length) }), el('span', { text: 'Missions' })]),
          el('div', { class: 'hero-stat' }, [el('strong', { text: `${state.clearedMissions.length}/${MISSIONS.length}` }), el('span', { text: 'Cleared' })]),
        ]),
      ]),

      squadBar(navigate),

      el('section', { class: 'section' }, [
        el('div', { class: 'section-head' }, [
          el('h2', { text: 'The Roster' }),
          el('p', { class: 'muted', text: 'The entire Minkey HQ team — every agent, stat, and signature move.' }),
        ]),
        el('div', { class: 'roster-grid' }, ROSTER.map((a) => agentCard(a, navigate))),
      ]),

      el('section', { class: 'section' }, [
        el('div', { class: 'section-head' }, [
          el('h2', { text: 'Missions' }),
          el('p', { class: 'muted', text: 'Clear each mission to unlock the next. The Baron waits at the end.' }),
        ]),
        el('div', { class: 'mission-grid' }, MISSIONS.map((m) => missionCard(m, navigate))),
      ]),

      el('footer', { class: 'footer' }, [
        el('span', { text: 'Minkey HQ — a team you build, a jungle you save.' }),
        el('button', {
          class: 'link-btn',
          text: 'Reset progress',
          onClick: () => {
            if (confirm('Reset squad and campaign progress?')) {
              resetProgress();
              navigate('hq');
            }
          },
        }),
      ]),
    ]),
  );
}
