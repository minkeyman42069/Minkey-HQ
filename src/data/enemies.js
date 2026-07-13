// Enemy squads, organized as a campaign of escalating missions. Each foe uses
// the same stat/ability shape as roster agents so the battle engine treats
// both sides identically.

const foe = (id, name, emoji, accent, stats, ability, role = 'Enemy') => ({
  id,
  name,
  codename: '',
  role,
  emoji,
  accent,
  stats,
  ability,
  enemy: true,
});

export const MISSIONS = [
  {
    id: 'm1',
    name: 'Mission 1 — Alley Scuffle',
    brief: 'Rival street crew is muscling in on HQ turf. Send them a message.',
    reward: 'Unlocks Mission 2',
    squad: [
      foe('rat1', 'Gutter Rat', '🐀', '#94a3b8', { hp: 90, atk: 18, def: 6, spd: 9 }, {
        name: 'Cheap Shot', type: 'damage', power: 22, description: 'A dirty little jab.',
      }),
      foe('rat2', 'Alley Cat', '🐈', '#a3a3a3', { hp: 100, atk: 20, def: 8, spd: 11 }, {
        name: 'Scratch', type: 'damage', power: 24, description: 'Claws that sting.',
      }),
    ],
  },
  {
    id: 'm2',
    name: 'Mission 2 — Warehouse Raid',
    brief: 'Smugglers are stashing stolen bananas in the docks. Clean it out.',
    reward: 'Unlocks Mission 3',
    squad: [
      foe('boar1', 'Dock Boar', '🐗', '#b45309', { hp: 130, atk: 24, def: 12, spd: 6 }, {
        name: 'Tusk Charge', type: 'damage', power: 30, description: 'A heavy goring rush.',
      }),
      foe('croc1', 'Sewer Croc', '🐊', '#65a30d', { hp: 120, atk: 26, def: 10, spd: 8 }, {
        name: 'Death Roll', type: 'damage', power: 32, description: 'A bone-crunching spin.',
      }),
      foe('rat2b', 'Alley Cat', '🐈', '#a3a3a3', { hp: 100, atk: 20, def: 8, spd: 11 }, {
        name: 'Scratch', type: 'damage', power: 24, description: 'Claws that sting.',
      }),
    ],
  },
  {
    id: 'm3',
    name: 'Mission 3 — Rooftop Ambush',
    brief: 'Enemy snipers have the high ground. Take it back before dawn.',
    reward: 'Unlocks the Boss',
    squad: [
      foe('hawk1', 'Hawk Sniper', '🦅', '#7c3aed', { hp: 100, atk: 34, def: 8, spd: 14 }, {
        name: 'Dive Bomb', type: 'crit', power: 40, description: 'A screaming critical dive.',
      }),
      foe('owl1', 'Night Owl', '🦉', '#6d28d9', { hp: 110, atk: 28, def: 10, spd: 12 }, {
        name: 'Silent Talon', type: 'damage', power: 30, description: 'Strikes from the dark.',
      }),
      foe('bat1', 'Cave Bat', '🦇', '#8b5cf6', { hp: 95, atk: 24, def: 7, spd: 15 }, {
        name: 'Swarm', type: 'aoe', power: 20, description: 'A blur of wings hits everyone.',
      }),
    ],
  },
  {
    id: 'm4',
    name: 'Boss — The Baron',
    brief: 'The crime lord behind it all. End this. Bring the whole team.',
    reward: 'HQ secured. You win.',
    squad: [
      foe('baron', 'Baron Von Grubb', '👹', '#dc2626', { hp: 260, atk: 34, def: 18, spd: 10 }, {
        name: 'Reign of Terror', type: 'aoe', power: 34, description: 'A devastating hit to the whole squad.',
      }, 'Boss'),
      foe('bruteg', 'Baron Enforcer', '🐗', '#991b1b', { hp: 150, atk: 30, def: 14, spd: 7 }, {
        name: 'Crush', type: 'damage', power: 36, description: 'A merciless slam.',
      }),
      foe('hawkg', 'Baron Marksman', '🦅', '#b91c1c', { hp: 120, atk: 34, def: 9, spd: 13 }, {
        name: 'Kill Shot', type: 'crit', power: 44, description: 'Aims for the weakest link.',
      }),
    ],
  },
];

export const getMission = (id) => MISSIONS.find((m) => m.id === id);
