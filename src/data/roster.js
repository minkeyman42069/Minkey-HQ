// The entire Minkey HQ team roster.
// Every agent is fully specified: identity, role, combat stats, a signature
// ability, and lore. This is the canonical source of truth for the squad.

/**
 * Role archetypes and what they are good at. Used across the UI and the help
 * guide so descriptions never drift out of sync.
 */
export const ROLES = {
  Vanguard: {
    label: 'Vanguard',
    tagline: 'Front-line tank that soaks damage and protects the squad.',
    color: '#38bdf8',
  },
  Striker: {
    label: 'Striker',
    tagline: 'High single-target damage. Ends fights quickly.',
    color: '#f87171',
  },
  Sniper: {
    label: 'Sniper',
    tagline: 'Ranged specialist with brutal critical hits.',
    color: '#c084fc',
  },
  Medic: {
    label: 'Medic',
    tagline: 'Keeps the team alive with heals and cleanses.',
    color: '#4ade80',
  },
  Trickster: {
    label: 'Trickster',
    tagline: 'Debuffs, weakens, and disrupts the enemy.',
    color: '#fbbf24',
  },
  Support: {
    label: 'Support',
    tagline: 'Buffs allies and turns the tide with utility.',
    color: '#2dd4bf',
  },
};

/**
 * The full team. Each entry:
 *  id        unique slug
 *  name      given name
 *  codename  field callsign
 *  role      one of ROLES
 *  emoji     avatar glyph
 *  accent    theme color
 *  stats     { hp, atk, def, spd }
 *  ability   { name, type, power, description }  signature move
 *  bio       lore blurb
 *  quote     catchphrase
 */
export const ROSTER = [
  {
    id: 'kong',
    name: 'Kong Bananas',
    codename: 'The Wall',
    role: 'Vanguard',
    emoji: '🦍',
    accent: '#38bdf8',
    stats: { hp: 180, atk: 22, def: 18, spd: 6 },
    ability: {
      name: 'Iron Canopy',
      type: 'shield',
      power: 45,
      description: 'Raises a barrier that absorbs the next chunk of damage for the whole squad.',
    },
    bio: 'Former demolition crew boss. Kong walks into gunfire so the rookies do not have to.',
    quote: "You want the team? Go through me first.",
  },
  {
    id: 'rocket',
    name: 'Rico Rocket',
    codename: 'Fast Hands',
    role: 'Striker',
    emoji: '🐒',
    accent: '#f87171',
    stats: { hp: 110, atk: 40, def: 8, spd: 14 },
    ability: {
      name: 'Banana Blitz',
      type: 'damage',
      power: 55,
      description: 'A flurry of strikes that hits a single enemy for massive damage.',
    },
    bio: 'The quickest paws in the HQ. Rico closes distance before enemies finish their coffee.',
    quote: "Blink and you already lost.",
  },
  {
    id: 'scope',
    name: 'Mona Scope',
    codename: 'Deadeye',
    role: 'Sniper',
    emoji: '🙈',
    accent: '#c084fc',
    stats: { hp: 95, atk: 34, def: 7, spd: 11 },
    ability: {
      name: 'Coconut Round',
      type: 'crit',
      power: 60,
      description: 'A guaranteed critical shot from range. Ignores half of enemy defense.',
    },
    bio: 'One shot, one snack. Mona has never missed a target she actually meant to hit.',
    quote: "I already called this shot yesterday.",
  },
  {
    id: 'patch',
    name: 'Dr. Patch',
    codename: 'Lifeline',
    role: 'Medic',
    emoji: '🐵',
    accent: '#4ade80',
    stats: { hp: 120, atk: 16, def: 12, spd: 10 },
    ability: {
      name: 'Jungle Remedy',
      type: 'heal',
      power: 50,
      description: 'Restores a large amount of health to the most wounded ally.',
    },
    bio: 'Field surgeon with a med-kit made of leaves and stubbornness. Nobody dies on Patch shift.',
    quote: "Hold still, this only tastes terrible.",
  },
  {
    id: 'jester',
    name: 'Gigi Jester',
    codename: 'Banana Peel',
    role: 'Trickster',
    emoji: '🙉',
    accent: '#fbbf24',
    stats: { hp: 105, atk: 24, def: 10, spd: 13 },
    ability: {
      name: 'Slip & Slide',
      type: 'debuff',
      power: 30,
      description: 'Weakens an enemy attack for several turns and chips their health.',
    },
    bio: 'Chaos with a grin. Gigi turns the battlefield into a slapstick routine the enemy never rehearsed.',
    quote: "Watch your step. Or don't.",
  },
  {
    id: 'sarge',
    name: 'Sergeant Sway',
    codename: 'Warcry',
    role: 'Support',
    emoji: '🐈‍⬛',
    accent: '#2dd4bf',
    stats: { hp: 130, atk: 20, def: 14, spd: 9 },
    ability: {
      name: 'Rally Screech',
      type: 'buff',
      power: 35,
      description: 'Boosts the attack of the entire squad for the next few turns.',
    },
    bio: 'Drill instructor turned battle conductor. When Sway screeches, the whole team hits harder.',
    quote: "Louder! The jungle can't hear you!",
  },
  {
    id: 'brute',
    name: 'Bongo Brute',
    codename: 'Earthquake',
    role: 'Vanguard',
    emoji: '🦧',
    accent: '#60a5fa',
    stats: { hp: 165, atk: 28, def: 15, spd: 5 },
    ability: {
      name: 'Ground Pound',
      type: 'aoe',
      power: 30,
      description: 'Slams the earth, damaging every enemy at once.',
    },
    bio: 'Half orangutan, half wrecking ball. Bongo settles arguments with tectonics.',
    quote: "Bongo smash. Bongo apologize later.",
  },
  {
    id: 'shade',
    name: 'Silka Shade',
    codename: 'Ghost',
    role: 'Striker',
    emoji: '🐆',
    accent: '#fb7185',
    stats: { hp: 100, atk: 38, def: 9, spd: 16 },
    ability: {
      name: 'Shadow Fang',
      type: 'damage',
      power: 50,
      description: 'A silent strike that always moves first and pierces defense.',
    },
    bio: 'You do not see Silka. You only see the aftermath.',
    quote: "I was never here.",
  },
  {
    id: 'spark',
    name: 'Volt Spark',
    codename: 'Circuit',
    role: 'Sniper',
    emoji: '⚡',
    accent: '#a78bfa',
    stats: { hp: 90, atk: 36, def: 6, spd: 12 },
    ability: {
      name: 'Chain Lightning',
      type: 'aoe',
      power: 28,
      description: 'Arcs electricity across the enemy line, hitting everyone.',
    },
    bio: 'Wired the whole HQ security grid, then rewired herself. Runs a little hot.',
    quote: "Everything's a conductor if you believe.",
  },
  {
    id: 'root',
    name: 'Mama Root',
    codename: 'Evergreen',
    role: 'Medic',
    emoji: '🌿',
    accent: '#34d399',
    stats: { hp: 140, atk: 14, def: 16, spd: 8 },
    ability: {
      name: 'Regrowth',
      type: 'healAll',
      power: 28,
      description: 'Heals every ally for a steady amount and cleanses weakening effects.',
    },
    bio: 'The oldest agent in the HQ and its calmest heart. The jungle answers when Root calls.',
    quote: "Breathe. The vines have you.",
  },
  {
    id: 'blitz',
    name: 'Turbo Blitz',
    codename: 'Redline',
    role: 'Support',
    emoji: '🏎️',
    accent: '#22d3ee',
    stats: { hp: 115, atk: 22, def: 11, spd: 15 },
    ability: {
      name: 'Overdrive',
      type: 'hasteBuff',
      power: 40,
      description: 'Supercharges an ally, sharply raising their attack and speed.',
    },
    bio: 'Getaway driver with no getaway. Turbo just keeps the whole squad moving faster than fair.',
    quote: "Buckle up. Actually, don't. No time.",
  },
  {
    id: 'hex',
    name: 'Nyx Hex',
    codename: 'Voodoo',
    role: 'Trickster',
    emoji: '🐍',
    accent: '#f472b6',
    stats: { hp: 100, atk: 30, def: 9, spd: 12 },
    ability: {
      name: 'Curse of Thorns',
      type: 'poison',
      power: 18,
      description: 'Poisons an enemy, dealing damage every turn and lowering their defense.',
    },
    bio: 'Trades in bad luck and worse omens. Cross Nyx and your own shadow turns on you.',
    quote: "You brought this on yourself. I just noticed.",
  },
];

export const getAgent = (id) => ROSTER.find((a) => a.id === id);
