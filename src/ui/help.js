import { ROLES, ROSTER } from '../data/roster.js';
import { el } from './dom.js';

function header(navigate) {
  return el('header', { class: 'topbar' }, [
    el('div', { class: 'brand' }, [
      el('span', { class: 'brand-mark', text: '🐵' }),
      el('div', {}, [
        el('h1', { text: 'Minkey HQ' }),
        el('p', { class: 'brand-sub', text: 'Field Manual' }),
      ]),
    ]),
    el('nav', { class: 'nav' }, [
      el('button', { class: 'nav-link', text: 'HQ', onClick: () => navigate('hq') }),
      el('button', { class: 'nav-link active', text: 'Field Manual' }),
    ]),
  ]);
}

function card(title, children) {
  return el('section', { class: 'manual-card' }, [
    el('h2', { text: title }),
    ...[].concat(children),
  ]);
}

function bullets(items) {
  return el('ul', { class: 'manual-list' }, items.map((t) => el('li', { html: t })));
}

export function renderHelp(root, navigate) {
  root.append(
    header(navigate),
    el('main', { class: 'page manual' }, [
      el('section', { class: 'section-head' }, [
        el('h2', { text: 'Everything you need — and more.' }),
        el('p', { class: 'muted', text: 'How to play, what every role does, per-agent tips, mission strategy, and the full combat rulebook.' }),
      ]),

      card('Quick Start', bullets([
        '<strong>1. Build your squad.</strong> On the HQ screen, add any <strong>3</strong> agents to your Active Squad.',
        '<strong>2. Pick a mission.</strong> Missions unlock in order — clear one to open the next.',
        '<strong>3. Fight.</strong> On your turn, choose <strong>Attack</strong> or your agent\'s <strong>signature ability</strong>, then pick a target.',
        '<strong>4. Win the campaign.</strong> Defeat Baron Von Grubb in the final mission to secure HQ.',
        'Progress and your squad are saved automatically in your browser.',
      ])),

      card('The Six Roles', el('div', { class: 'role-guide' },
        Object.values(ROLES).map((r) => el('div', { class: 'role-guide-item', style: { '--role': r.color } }, [
          el('strong', { text: r.label }),
          el('p', { text: r.tagline }),
        ])))),

      card('Combat Rules', bullets([
        '<strong>Turn order</strong> is decided by <strong>SPD</strong> each round — faster agents act first (your squad wins ties).',
        '<strong>Damage</strong> = attacker ATK (with buffs) minus the target\'s DEF. Minimum 1 damage always lands.',
        '<strong>Critical hits</strong> deal ~80% extra damage and ignore half of DEF. Basic attacks crit ~12% of the time; some abilities always crit.',
        '<strong>Barriers (🛡️)</strong> absorb incoming damage before HP is touched.',
        '<strong>Poison (☠️)</strong> deals damage at the end of every round and lowers DEF.',
        '<strong>Buffs (⚔️↑)</strong> and <strong>debuffs (⚔️↓)</strong> raise or lower ATK for a few rounds.',
        '<strong>AoE</strong> abilities hit every enemy at once; heals and team buffs affect your whole squad.',
      ])),

      card('Squad-Building Tips', bullets([
        'A balanced trio — one <strong>Vanguard</strong>, one damage dealer (<strong>Striker</strong>/<strong>Sniper</strong>), and one <strong>Medic</strong> or <strong>Support</strong> — clears the campaign comfortably.',
        'Facing the AoE-heavy Boss? Bring <strong>Mama Root</strong> (team heal) or <strong>Kong</strong> (team barrier) to survive <em>Reign of Terror</em>.',
        'Snipers like <strong>Mona Scope</strong> shred high-DEF enemies thanks to armor-piercing crits.',
        'Speed matters: <strong>Silka Shade</strong> and <strong>Turbo Blitz</strong> let you act before the enemy can punch back.',
        'Debuffers (<strong>Gigi</strong>, <strong>Nyx</strong>) make tough fights safer by cutting enemy damage and defense.',
      ])),

      card('Agent Tips', el('div', { class: 'tips-grid' },
        ROSTER.map((a) => el('div', { class: 'tip', style: { '--accent': a.accent } }, [
          el('div', { class: 'tip-head' }, [
            el('span', { class: 'tip-emoji', text: a.emoji }),
            el('div', {}, [
              el('strong', { text: a.name }),
              el('span', { class: 'tip-role', text: `${a.role} · ${a.ability.name}` }),
            ]),
          ]),
          el('p', { text: a.ability.description }),
        ])))),

      card('FAQ', bullets([
        '<strong>Can I change my squad mid-campaign?</strong> Yes — return to HQ any time and swap agents before deploying.',
        '<strong>What happens if I lose?</strong> Nothing permanent. Retry the mission or rebuild your squad.',
        '<strong>How do I reset everything?</strong> Use “Reset progress” at the bottom of the HQ screen.',
        '<strong>Is there a final boss?</strong> Yes — Baron Von Grubb and his enforcers in Mission 4.',
      ])),

      el('div', { class: 'manual-cta' }, [
        el('button', { class: 'primary', text: 'Back to HQ', onClick: () => navigate('hq') }),
      ]),
    ]),
  );
}
