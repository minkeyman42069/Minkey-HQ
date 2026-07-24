/**
 * HAZARD WARDEN — encounter node factories, scaling, bestiary catalog.
 */

export const FOE_COLORS = {
  switchback: '#b8894e', storm: '#6f83e0', gate: '#8a97ab', serac: '#79cfe6', summit: '#ffcf6b',
  whiteout: '#cbd3dd', crevasse: '#4d7ea8', traverse: '#86b39a', thinair: '#a0dcd6', icefall: '#57a6d4',
  void: '#9b6fd0', knife: '#e0655a', berg: '#4fbfae', snowfield: '#bcd0e0', couloir: '#5f7a9a',
  icewall: '#6fb0d0', windslab: '#7d93b0', sealedface: '#90a4b8', longwall: '#8a9a86', tempest: '#6a5a9a',
  closing: '#d6a94e', avalanche: '#b3bcc6', corniceridge: '#9fb4c8', frozentitan: '#7fd4e8',
  rockfall: '#c2a178', verglas: '#8fd0e8',
  shrine: '#c9a86a', rest: '#d89b52', tale: '#b9a2d8',
};

export function foeColor(kind) {
  return FOE_COLORS[kind] || '#8a97ab';
}

/**
 * Tier combat table — the stamina price of a wrong answer scales with the
 * hazard's bestiary tier, so a stumble on a Tier 1 snowfield costs less than
 * one on a Tier 5 summit push. Nodes without a tier fall back to
 * CONFIG.MISS_COST / CONFIG.TIMEOUT_COST.
 */
export const TIER_COMBAT = {
  1: { missCost: 10, timeoutCost: 7 },
  2: { missCost: 12, timeoutCost: 8 },
  3: { missCost: 14, timeoutCost: 10 },
  4: { missCost: 16, timeoutCost: 11 },
  5: { missCost: 17, timeoutCost: 12 },
};

export function nSwitch(need, alt) {
  return {
    kind: 'switchback', icon: '🪨', title: 'Scree Slope',
    blurb: 'A slope of broken rock that moves underfoot. Slow is fine. Wrong is what slides.',
    need, tier: 1, time: 18, rise: 0.8, miss: 26, ease: 7, max: 100, hit: 12, restore: 14, boon: false, alt,
    tname: 'Loose scree', tic: '🪨',
  };
}

export function nStorm(need, alt) {
  return {
    kind: 'storm', icon: '🌩️', title: 'Rising Squall',
    blurb: 'Snow coming in sideways and worse by the second. Nothing you know will quiet it. Outrun it or wear it.',
    need, tier: 2, time: 12, rise: 1.85, miss: 15, ease: 0, max: 100, hit: 15, restore: 16, boon: true, noBoonEase: true, alt,
    tname: 'The squall', tic: '🌩️',
  };
}

export function nGate(need, alt, domain) {
  return {
    kind: 'gate', icon: '🛡️', title: 'Gatekeeper',
    blurb: domain
      ? 'The route narrows to a test. It asks ' + domain + ' — nothing else — and it hits harder than anything below it.'
      : 'The route narrows to a test. It asks your weakest subject — nothing else — and it hits harder than anything below it.',
    need, tier: 5, time: 16, rise: 1.55, miss: 30, ease: 10, max: 100, hit: 20, restore: 22, boon: true, domain, gateDomain: null, alt,
    tname: 'The Gatekeeper', tic: '🛡️',
  };
}

export function nRest(alt, configRef) {
  return {
    kind: 'rest', icon: '🏕️', title: 'Ledge Camp',
    blurb: 'Catch your breath. Take something for the pitch ahead.',
    need: 0, restore: configRef.REST_RESTORE, boon: true, alt,
  };
}

export function nSummit(need, alt) {
  return {
    kind: 'summit', icon: '🏔️', title: 'Summit Push',
    blurb: 'Six moves of ridge left. The shoulder is steady, the cornice is not, and the last two moves belong to whoever wants them more.',
    need, tier: 5, time: 15, rise: 2.1, miss: 22, ease: 8, max: 100, hit: 20, restore: 14, boon: false, alt,
    stages: [
      { at: 2, title: 'The Shoulder is behind you', sub: 'the ridge narrows — the wind picks a side', set: { rise: 2.7 }, threat: 12 },
      { at: 4, title: 'The Cornice', sub: 'snow over empty air — nothing heavy stands here', set: { rise: 3.2, time: 12 }, threat: 16 },
    ],
    tname: 'Summit push', tic: '❄️',
  };
}

export function nSerac(need, alt) {
  return {
    kind: 'serac', icon: '🧊', title: 'Falling Serac',
    blurb: 'A hanging wall of ice, creaking before you even rope up. It was falling today with or without you. Be quick, and be elsewhere.',
    need, tier: 5, time: 13, rise: 2.6, miss: 22, ease: 10, max: 100, hit: 22, restore: 20, boon: true, alt,
    tname: 'The serac', tic: '🧊',
  };
}

export function nWhiteout(need, alt) {
  return {
    kind: 'whiteout', icon: '🌫️', title: 'Blinding Whiteout',
    blurb: 'The cloud comes up the face and the world goes to milk. No ridge, no sky, no down. Climb by feel, and climb now.',
    need, tier: 4, time: 10, rise: 2.4, miss: 13, ease: 5, max: 100, hit: 15, restore: 16, boon: true, alt,
    tname: 'The whiteout', tic: '🌫️',
  };
}

export function nCrevasse(need, alt) {
  return {
    kind: 'crevasse', icon: '🕳️', title: 'Snow Bridge',
    blurb: 'A rib of old snow over a dark with no bottom. A few careful steps and you are across. It only counts the wrong ones.',
    need, tier: 2, time: 15, rise: 1.25, miss: 32, ease: 11, max: 100, hit: 24, restore: 18, boon: true, alt,
    tname: 'The snow bridge', tic: '🕳️',
  };
}

export function nTraverse(need, alt) {
  return {
    kind: 'traverse', icon: '🧗', title: 'Exposed Traverse',
    blurb: 'Ledges strung across the face for the better part of a mile. None of it is hard. All of it is long, and the wind leans on you the whole way.',
    need, tier: 1, time: 16, rise: 1.5, miss: 16, ease: 6, max: 100, hit: 14, restore: 16, boon: true, alt,
    tname: 'The traverse', tic: '🧗',
  };
}

export function nThinAir(need, alt) {
  return {
    kind: 'thinair', icon: '🫁', title: 'The Thin Air',
    blurb: 'The air up here is a rumor. Your body burns whether you move or not — so move.',
    need, tier: 4, time: 16, rise: 1.1, miss: 18, ease: 8, max: 100, hit: 13, restore: 16, boon: true, drain: 0.34, alt,
    tname: 'Thin air', tic: '🫁',
  };
}

export function nIcefall(need, alt) {
  return {
    kind: 'icefall', icon: '☄️', title: 'The Icefall',
    blurb: 'The serac field above calves on its own clock, tons at a time. Watch. Count. Cross. The ice does not aim, and it does not need to.',
    need, tier: 4, time: 14, rise: 0.8, miss: 18, ease: 9, max: 100, hit: 15, restore: 16, boon: true, spike: 13, spikeEvery: 5, alt,
    tname: 'The icefall', tic: '☄️',
  };
}

export function nVoid(need, alt) {
  return {
    kind: 'void', icon: '🌑', title: 'Bare Ridge',
    blurb: 'Rock scoured bare by a hundred winters. Nothing in your pack works up here — no gear, no notes, no flare. Just you, and whatever stuck.',
    need, tier: 3, time: 15, rise: 1.6, miss: 22, ease: 9, max: 100, hit: 17, restore: 18, boon: false, suppress: true, alt,
    tname: 'Bare ridge', tic: '🌑',
  };
}

export function nKnife(need, alt) {
  return {
    kind: 'knife', icon: '🗡️', title: 'The Knife-Edge',
    blurb: 'A crest the width of your boot with air on both sides. There is no standing still here. One bad step puts you back where the move began.',
    need, tier: 3, time: 15, rise: 1.2, miss: 20, ease: 10, max: 100, hit: 16, restore: 18, boon: true, streakGate: true, alt,
    tname: 'The knife-edge', tic: '🗡️',
  };
}

export function nBergschrund(need, alt) {
  return {
    kind: 'berg', icon: '⛏️', title: 'Widening Crack',
    blurb: 'The crack between glacier and mountain runs right beside your line. Every stumble feeds it, and the next one always costs more.',
    need, tier: 2, time: 15, rise: 1.2, miss: 17, ease: 9, max: 100, hit: 16, restore: 18, boon: true, escalate: 6, alt,
    tname: 'The widening crack', tic: '⛏️',
  };
}

export function nSnowfield(need, alt) {
  return {
    kind: 'snowfield', icon: '🌨️', title: 'The Snowfield',
    blurb: 'Thigh-deep powder that swallows your mistakes along with your boots. Slow going. Kind going. Find a rhythm and keep it.',
    need, tier: 1, time: 18, rise: 0.7, miss: 12, ease: 10, max: 100, hit: 10, restore: 14, boon: true, alt,
    tname: 'The snowfield', tic: '🌨️',
  };
}

export function nCouloir(need, alt) {
  return {
    kind: 'couloir', icon: '🗻', title: 'The Couloir',
    blurb: 'A chute of ice between rock walls. Everything the mountain sheds comes down through here, and your route goes up it. Do not linger.',
    need, tier: 2, time: 13, rise: 1.9, miss: 18, ease: 6, max: 100, hit: 17, restore: 16, boon: true, alt,
    tname: 'The couloir', tic: '🗻',
  };
}

export function nIcewall(need, alt) {
  return {
    kind: 'icewall', icon: '💠', title: 'The Ice Wall',
    blurb: 'Ninety degrees of blue ice. Swing, test, trust, step up. Rush one placement and the whole pitch knows it.',
    need, tier: 3, time: 14, rise: 1.6, miss: 24, ease: 9, max: 100, hit: 20, restore: 18, boon: true, alt,
    tname: 'The ice wall', tic: '💠',
  };
}

export function nWindslab(need, alt) {
  return {
    kind: 'windslab', icon: '🌀', title: 'Gust Field',
    blurb: 'Wind-packed slabs that boom underfoot. The gusts keep no schedule and send no warning. Stay low and keep moving.',
    need, tier: 2, time: 14, rise: 1.0, miss: 16, ease: 8, max: 100, hit: 16, restore: 16, boon: true, gust: 0.11, alt,
    tname: 'The gust field', tic: '🌀',
  };
}

export function nSealedFace(need, alt) {
  return {
    kind: 'sealedface', icon: '🔒', title: 'Ice Shell',
    blurb: 'Overnight melt froze the face into a single blue glaze. Break the shell first. The climbing starts underneath.',
    need, tier: 3, time: 15, rise: 1.2, miss: 20, ease: 10, max: 100, hit: 17, restore: 18, boon: true, shield: 2, alt,
    tname: 'The ice shell', tic: '🔒',
  };
}

export function nLongWall(need, alt) {
  return {
    kind: 'longwall', icon: '🪜', title: 'The Long Wall',
    blurb: 'You cannot see the top from the bottom, and not from halfway either. The first breather on this wall helps. The fifth barely does.',
    need, tier: 3, time: 16, rise: 1.5, miss: 20, ease: 11, max: 100, hit: 16, restore: 16, boon: true, fatigue: true, alt,
    tname: 'The long wall', tic: '🪜',
  };
}

export function nTempest(need, alt) {
  return {
    kind: 'tempest', icon: '🌪️', title: 'The Tempest',
    blurb: 'A storm with an appetite. Let the danger build and the wind rises to meet it, driving you toward the edge it wants you over. Starve it calm.',
    need, tier: 4, time: 13, rise: 1.55, miss: 22, ease: 8, max: 100, hit: 18, restore: 18, boon: true, enrage: 1.9, alt,
    tname: 'The tempest', tic: '🌪️',
  };
}

export function nClosing(need, alt) {
  return {
    kind: 'closing', icon: '⏳', title: 'The Closing Window',
    blurb: 'The forecast bought you an hour and the mountain is spending it fast. Each chance you get is briefer than the last. Go.',
    need, tier: 4, time: 14, rise: 2.0, miss: 24, ease: 7, max: 100, hit: 17, restore: 18, boon: true, decay: true, alt,
    tname: 'The closing window', tic: '⏳',
  };
}

export function nAvalanche(need, alt) {
  return {
    kind: 'avalanche', icon: '💥', title: 'The Avalanche',
    blurb: 'A loaded slope, quiet the way held breath is quiet. Somewhere past the middle it lets go. Where you stand when it does is up to you.',
    need, tier: 4, time: 15, rise: 1.25, miss: 22, ease: 9, max: 100, hit: 20, restore: 18, boon: true, phase: true, alt,
    tname: 'The avalanche', tic: '💥',
  };
}

export function nRockfall(need, alt) {
  return {
    kind: 'rockfall', icon: '🥌', title: 'Rockfall Gully',
    blurb: 'Pebbles come down the gully in bursts, rattling off the walls ahead of you. Count the quiet between volleys. That is when you move.',
    need, tier: 1, time: 18, rise: 0.7, miss: 14, ease: 8, max: 100, hit: 12, restore: 15, boon: true, spike: 7, spikeEvery: 7, alt,
    tname: 'The rockfall', tic: '🥌',
  };
}

export function nVerglas(need, alt) {
  return {
    kind: 'verglas', icon: '🪞', title: 'The Verglas',
    blurb: 'Meltwater froze over the rock in a skin too thin to see. Your edges bite for a moment after every move. Move again before they skate.',
    need, tier: 3, time: 15, rise: 1.9, miss: 18, ease: 4, max: 100, hit: 17, restore: 18, boon: true, swift: 9, alt,
    tname: 'The verglas', tic: '🪞',
  };
}

export function nShrine(alt) {
  return {
    kind: 'shrine', icon: '⛩️', title: 'Weathered Shrine',
    blurb: 'Stacked stones and faded prayer flags. Climbers leave an offering here for luck. Sometimes the luck is real.',
    need: 0, restore: 0, boon: false, alt,
  };
}

export function nTale(alt) {
  return {
    kind: 'tale', icon: '🗿', title: 'Waymark',
    blurb: 'Something off the route wants a decision from you. No clock, no threat — just a choice you keep.',
    need: 0, restore: 0, boon: false, alt,
  };
}

export function nCorniceRidge(need, alt) {
  return {
    kind: 'corniceridge', icon: '🌬️', title: 'Wind Lip',
    blurb: 'A lip of snow curled over empty air by wind that has not stopped in years. It bucks without warning, and a slip undoes honest work.',
    need, tier: 3, time: 15, rise: 0.9, miss: 14, ease: 9, max: 100, hit: 15, restore: 18, boon: true, gust: 0.05, streakGate: true, alt,
    tname: 'The wind lip', tic: '🌬️',
  };
}

export function nFrozenTitan(need, alt) {
  return {
    kind: 'frozentitan', icon: '🧊', title: 'Glacier Block',
    blurb: 'A pillar of glacier ice three winters thick. All three layers break before the climbing counts, and old ice splinters hard when it starts to lose.',
    need, tier: 4, time: 14, rise: 1.1, miss: 19, ease: 9, max: 100, hit: 17, restore: 20, boon: true, shield: 3, enrage: 1.8, alt,
    tname: 'The glacier block', tic: '🧊',
  };
}

export const ACTS = [
  { name: 'The Approach', flavor: 'Warm rock and open glacier under a late moon. The mountain lets you settle in. It can afford to.' },
  { name: 'The Headwall', flavor: 'The face goes vertical and easy ground becomes a memory. Nothing past this point is given away.' },
  { name: 'The Death Zone', flavor: 'Above the last camp the air stops helping. Whatever the mountain held in reserve, it spends on you now.' },
];

export function scaleNode(n, act) {
  n.act = act;
  if (n.kind === 'rest') return n;
  const sc = 1 + (act - 1) * 0.22;
  n.rise = +(n.rise * sc).toFixed(2);
  n.miss = Math.round(n.miss * (1 + (act - 1) * 0.08));
  n.hit = Math.round(n.hit * (1 + (act - 1) * 0.10));
  n.time = Math.max(8, n.time - (act - 1) * 2);
  // Thin air gives less back: pitch payouts shrink as the acts climb.
  if (n.restore) n.restore = Math.max(8, Math.round(n.restore * (1 - (act - 1) * 0.08)));
  return n;
}

/* Tier (`t`) is read off the node itself, so the codex grouping, the route
 * pools, and the combat math can never disagree about a hazard's tier. */
export const BESTIARY = [
  { fn: nSwitch, a: 'Accuracy', m: 'Accuracy check. Generous clock, ordinary misses, no surprises.' },
  { fn: nTraverse, a: 'Endurance', m: 'Endurance check. Steady passive threat across a long, easy line.' },
  { fn: nSnowfield, a: 'Accuracy', m: 'Recovery ground. Slow clock, soft misses, forgiving all around.' },
  { fn: nRockfall, a: 'Timing', m: 'Timing drill. Small threat spikes land on a fixed rhythm.' },
  { fn: nCrevasse, a: 'Precision', m: 'Precision check. Few questions, heavy cost per miss.' },
  { fn: nBergschrund, a: 'Escalating', m: 'Escalating misses. Each slip costs more stamina than the one before.' },
  { fn: nStorm, a: 'Speed', m: 'Pure speed. Correct answers shed no threat here; only pace survives it.' },
  { fn: nCouloir, a: 'Speed', m: 'Speed check. Fast-building threat, ordinary misses.' },
  { fn: nWindslab, a: 'Chaos', m: 'Chaos. Random gusts of threat, no warning and no pattern.' },
  { fn: nVoid, a: 'No boons', m: 'Boon suppression. Flare, notes, and every boon go dark for the pitch.' },
  { fn: nKnife, a: 'Consistency', m: 'Consistency check. A miss knocks your progress back down the ridge.' },
  { fn: nIcewall, a: 'Precision', m: 'Precision under pace. Expensive misses on a quick clock.' },
  { fn: nSealedFace, a: 'Armored', m: 'Armored. Two correct answers break the shell before progress counts.' },
  { fn: nLongWall, a: 'Attrition', m: 'Attrition. The threat relief on each correct answer keeps shrinking.' },
  { fn: nVerglas, a: 'Fluency', m: 'Fluency check. Quick correct answers shed extra threat; slow ones shed almost none.' },
  { fn: nWhiteout, a: 'Speed', m: 'Blind speed. The shortest clock on the mountain and thin relief.' },
  { fn: nThinAir, a: 'Attrition', m: 'Attrition. Stamina drains every second you stand on the pitch.' },
  { fn: nIcefall, a: 'Timing', m: 'Timing. Heavy threat volleys land on a fixed schedule.' },
  { fn: nTempest, a: 'Enrage', m: 'Enrage. Past sixty percent threat, everything builds faster.' },
  { fn: nClosing, a: 'Countdown', m: 'Countdown. Each question’s clock is shorter than the last.' },
  { fn: nAvalanche, a: 'Release', m: 'Release. At the halfway mark the slope lets go all at once.' },
  { fn: nCorniceRidge, a: 'Chaos ridge', m: 'Chaos ridge. Gusts without warning, and a miss slides you back.' },
  { fn: nFrozenTitan, a: 'Armored elite', m: 'Armored elite. Three shield layers, and it enrages when threat runs high.' },
  { fn: (n, al) => nGate(n, al, null), a: 'Competence duel', m: 'Competence duel. Draws every question from your weakest exam domain.' },
  { fn: nSerac, a: 'Elite', m: 'Elite. Starts angry — a quarter of the threat bar is already lit.' },
  { fn: nSummit, a: 'Final pitch', m: 'Final pitch in three stages — shoulder, cornice, top — each faster and angrier than the last.' },
].map((e) => ({ ...e, t: e.fn(1, 0).tier }));

export function nodeEmoji(kind) {
  const m = {
    switchback: '🪨', storm: '⛈️', gate: '🛡️', rest: '🏕️', summit: '🏔️', serac: '🧊', whiteout: '🌫️', crevasse: '🕳️',
    traverse: '🧗', thinair: '🫁', icefall: '☄️', void: '🌑', knife: '🗡️', berg: '⛏️', snowfield: '🌨️',
    couloir: '🗻', icewall: '💠', windslab: '🌀', sealedface: '🔒', longwall: '🪜', tempest: '🌪️',
    closing: '⏳', avalanche: '💥', corniceridge: '🌬️', frozentitan: '🧊', rockfall: '🥌', verglas: '🪞', shrine: '⛩️', tale: '🗿',
  };
  return m[kind] || '⛰️';
}

export function nodeSub(node) {
  const n = node.need;
  if (node.kind === 'switchback') return 'Footing over speed — ' + n + ' to clear';
  if (node.kind === 'storm') return "Speed only — correct answers won't calm it (" + n + ')';
  if (node.kind === 'gate') return node.domain ? 'Weakest domain — ' + node.domain : 'Gatekeeper duel';
  if (node.kind === 'rest') return 'Catch your breath, then draft a boon';
  if (node.kind === 'shrine') return 'Leave an offering for a relic, or pass by';
  if (node.kind === 'tale') return 'A story, not a fight — it ends how you choose';
  if (node.kind === 'serac') return 'Fast and punishing — ' + n + ' before the ice lets go';
  if (node.kind === 'summit') return 'The final pitch — ' + n + ' to top out';
  if (node.kind === 'whiteout') return 'Move fast — ' + n + ' before the cloud closes';
  if (node.kind === 'crevasse') return 'One clean step at a time — ' + n + ' to cross';
  if (node.kind === 'traverse') return 'Endurance — ' + n + ' across the long line';
  if (node.kind === 'thinair') return 'Race your own lungs — ' + n + ' before the air takes you';
  if (node.kind === 'icefall') return 'Between the volleys — ' + n + ' to clear';
  if (node.kind === 'void') return 'No boons, no tricks — just ' + n + ' and what you know';
  if (node.kind === 'knife') return 'Stay clean — a slip sends you back (' + n + ')';
  if (node.kind === 'berg') return 'Each slip costs more — ' + n + ' across the crack';
  if (node.kind === 'snowfield') return 'Find your pace — ' + n + ' to cross';
  if (node.kind === 'couloir') return 'Keep pace — ' + n + ' before it wears you';
  if (node.kind === 'icewall') return 'Every placement counts — ' + n + ' to the top';
  if (node.kind === 'windslab') return 'Brace for gusts — ' + n + ' through the chaos';
  if (node.kind === 'sealedface') return 'Break the ice shell first — ' + n + ' past the layers';
  if (node.kind === 'longwall') return 'It never ends — ' + n + ', and rest gives less each time';
  if (node.kind === 'tempest') return 'It feeds on danger — ' + n + ' before it rages';
  if (node.kind === 'closing') return 'The window is closing — ' + n + ', faster each time';
  if (node.kind === 'avalanche') return 'It waits, then breaks — ' + n + ' before the slope goes';
  if (node.kind === 'corniceridge') return 'Gusts + setbacks — ' + n + ' across the wind lip';
  if (node.kind === 'frozentitan') return 'Break 3 ice layers — ' + n + ' past the glacier block';
  if (node.kind === 'rockfall') return 'Move between the volleys — ' + n + ' to clear';
  if (node.kind === 'verglas') return 'Answer fast, shed threat — ' + n + ' across the glaze';
  return n + ' to clear';
}
