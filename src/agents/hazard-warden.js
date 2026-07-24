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
    blurb: 'A slope of loose, broken rock that shifts under your boots. Test each hold and keep your weight easy; the scree slides when you hurry it.',
    need, tier: 1, time: 18, rise: 0.8, miss: 26, ease: 7, max: 100, hit: 12, restore: 14, boon: false, alt,
    tname: 'Loose scree', tic: '🪨',
  };
}

export function nStorm(need, alt) {
  return {
    kind: 'storm', icon: '🌩️', title: 'Rising Squall',
    blurb: 'Snow driving in sideways, worse by the second. No answer you give will settle a squall like this; the only way past it is speed.',
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
    blurb: 'Six moves of ridge to the top. The first few are steady. The last cross a cornice — snow curled over open air — with no margin left on them.',
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
    blurb: 'A hanging wall of ice, groaning before you even rope up. It will come down today whether you are under it or not. Climb fast.',
    need, tier: 5, time: 13, rise: 2.6, miss: 22, ease: 10, max: 100, hit: 22, restore: 20, boon: true, alt,
    stages: [
      { at: 3, title: 'The ice lets go above', sub: 'run the last moves — do not look up', set: { rise: 3.1 }, threat: 18 },
    ],
    tname: 'The serac', tic: '🧊',
  };
}

export function nWhiteout(need, alt) {
  return {
    kind: 'whiteout', icon: '🌫️', title: 'Blinding Whiteout',
    blurb: 'The cloud swallows the face and everything turns white. No ridge, no sky, no sense of which way is down. A whiteout is climbed on feel alone, and it will not wait for you to find your bearings.',
    need, tier: 4, time: 10, rise: 2.4, miss: 13, ease: 5, max: 100, hit: 15, restore: 16, boon: true, alt,
    tname: 'The whiteout', tic: '🌫️',
  };
}

export function nCrevasse(need, alt) {
  return {
    kind: 'crevasse', icon: '🕳️', title: 'Snow Bridge',
    blurb: 'A rib of old snow bridging a crack with no visible bottom. A few careful steps put you across. One wrong step drops you through it.',
    need, tier: 2, time: 15, rise: 1.25, miss: 32, ease: 11, max: 100, hit: 24, restore: 18, boon: true, alt,
    tname: 'The snow bridge', tic: '🕳️',
  };
}

export function nTraverse(need, alt) {
  return {
    kind: 'traverse', icon: '🧗', title: 'Exposed Traverse',
    blurb: 'Narrow ledges strung across the face for most of a mile. No single move is hard; there are just a great many of them, and the wind pushes at you the whole way.',
    need, tier: 1, time: 16, rise: 1.5, miss: 16, ease: 6, max: 100, hit: 14, restore: 16, boon: true, alt,
    tname: 'The traverse', tic: '🧗',
  };
}

export function nThinAir(need, alt) {
  return {
    kind: 'thinair', icon: '🫁', title: 'The Thin Air',
    blurb: 'This high, every breath returns less than it should. Your body burns through its own reserves whether you climb or stand still.',
    need, tier: 4, time: 16, rise: 1.1, miss: 18, ease: 8, max: 100, hit: 13, restore: 16, boon: true, drain: 0.34, alt,
    tname: 'Thin air', tic: '🫁',
  };
}

export function nIcefall(need, alt) {
  return {
    kind: 'icefall', icon: '☄️', title: 'The Icefall',
    blurb: 'The ice above sheds on its own schedule, tons at a time. The falls keep a rough rhythm, and the quiet between them is your only window across.',
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
    blurb: 'Thigh-deep powder. Every step is work, but the soft snow forgives a clumsy one. It is slow and tiring, and about the kindest ground the mountain offers.',
    need, tier: 1, time: 18, rise: 0.7, miss: 12, ease: 10, max: 100, hit: 10, restore: 14, boon: true, alt,
    tname: 'The snowfield', tic: '🌨️',
  };
}

export function nCouloir(need, alt) {
  return {
    kind: 'couloir', icon: '🗻', title: 'The Chute',
    blurb: 'A chute of ice between rock walls. Everything the mountain sheds comes down through here, and your route goes up it. Do not linger.',
    need, tier: 2, time: 13, rise: 1.9, miss: 18, ease: 6, max: 100, hit: 17, restore: 16, boon: true, alt,
    tname: 'The chute', tic: '🗻',
  };
}

export function nIcewall(need, alt) {
  return {
    kind: 'icewall', icon: '💠', title: 'The Ice Wall',
    blurb: 'Ninety degrees of blue ice. Swing the axe, test it, weight it, step up, and again. Rush one placement and it fails with your weight on it.',
    need, tier: 3, time: 14, rise: 1.6, miss: 24, ease: 9, max: 100, hit: 20, restore: 18, boon: true, alt,
    tname: 'The ice wall', tic: '💠',
  };
}

export function nWindslab(need, alt) {
  return {
    kind: 'windslab', icon: '🌀', title: 'Gust Field',
    blurb: 'Wind-packed slabs that boom underfoot. The gusts arrive with no pattern and no warning, and nothing about the slope tells you when.',
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
    blurb: 'A wall so long you cannot see the top of it, even from halfway up. The rests still come, but each one gives back a little less than the last.',
    need, tier: 3, time: 16, rise: 1.5, miss: 20, ease: 11, max: 100, hit: 16, restore: 16, boon: true, fatigue: true, alt,
    tname: 'The long wall', tic: '🪜',
  };
}

export function nTempest(need, alt) {
  return {
    kind: 'tempest', icon: '🌪️', title: 'The Tempest',
    blurb: 'A violent storm on fully exposed ground, and it only builds. There is no lull to wait out. The longer it runs the harder it blows, and its worst comes late, when you are already worn down.',
    need, tier: 4, time: 13, rise: 1.55, miss: 22, ease: 8, max: 100, hit: 18, restore: 18, boon: true, enrage: 1.9, alt,
    tname: 'The tempest', tic: '🌪️',
  };
}

export function nClosing(need, alt) {
  return {
    kind: 'closing', icon: '⏳', title: 'The Closing Window',
    blurb: 'The weather window is closing, and closing fast. Each question leaves you a little less time than the one before it.',
    need, tier: 4, time: 14, rise: 2.0, miss: 24, ease: 7, max: 100, hit: 17, restore: 18, boon: true, decay: true, alt,
    tname: 'The closing window', tic: '⏳',
  };
}

export function nAvalanche(need, alt) {
  return {
    kind: 'avalanche', icon: '💥', title: 'The Avalanche',
    blurb: 'A slope loaded with snow, silent for now. Somewhere past the halfway mark it releases all at once. Get the hard climbing done before it does.',
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
    kind: 'verglas', icon: '🪞', title: 'Black Ice',
    blurb: 'Meltwater froze over the rock in a skin too thin to see. Your edges bite for a moment after every move. Move again before they skate.',
    need, tier: 3, time: 15, rise: 1.9, miss: 18, ease: 4, max: 100, hit: 17, restore: 18, boon: true, swift: 9, alt,
    tname: 'The black ice', tic: '🪞',
  };
}

export function nShrine(alt) {
  return {
    kind: 'shrine', icon: '⛩️', title: 'Weathered Shrine',
    blurb: 'Stacked stones and old prayer flags, left by climbers before the hard ground above. You could leave something too.',
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
    blurb: 'A lip of snow curled out over empty air, shaped by wind that never quits. It heaves without warning, and a slip here drops you back down the ridge.',
    need, tier: 3, time: 15, rise: 0.9, miss: 14, ease: 9, max: 100, hit: 15, restore: 18, boon: true, gust: 0.05, streakGate: true, alt,
    tname: 'The wind lip', tic: '🌬️',
  };
}

export function nFrozenTitan(need, alt) {
  return {
    kind: 'frozentitan', icon: '🧊', title: 'Glacier Block',
    blurb: 'A pillar of glacier ice, three winters thick. All three layers have to break before any climbing counts, and the old ice throws sharp shards once it starts to fail.',
    need, tier: 4, time: 14, rise: 1.1, miss: 19, ease: 9, max: 100, hit: 17, restore: 20, boon: true, shield: 3, enrage: 1.8, alt,
    tname: 'The glacier block', tic: '🧊',
  };
}

export const ACTS = [
  { name: 'The Approach', flavor: 'Firm rock, open glacier, the last of the day’s warmth still in the stone. The summit stands a long way overhead.' },
  { name: 'The Headwall', flavor: 'The glacier ends at a wall of rock and blue ice, dead vertical. The walking is finished. From here it is your hands, your edges, and what you actually know.' },
  { name: 'The Death Zone', flavor: 'Above the last camp the air holds half the oxygen it did below. Your legs burn, your thoughts blur, your body stops recovering. Keep moving.' },
];

/** The three examiners. Every climber meets them in order. */
export const GATEKEEPERS = {
  1: { name: 'Bram of the First Narrows', line: '"Everyone thinks they know the low ground. Show me."', beaten: '"Hm. Go on, then. Odile is less patient than I am."' },
  2: { name: 'Odile of the Headwall', line: '"Bram goes easy. I am the reason climbers study."', beaten: '"Adequate. Say nothing to the one above — words are wasted there."' },
  3: { name: 'The Last Examiner', line: 'It says nothing. It simply opens the ledger of everything you have ever missed.', beaten: 'It closes the ledger, and for one moment — you would swear — it bows.' },
};

export function scaleNode(n, act) {
  n.act = act;
  if (n.kind === 'gate' && GATEKEEPERS[act]) {
    n.title = GATEKEEPERS[act].name;
    n.bossLine = GATEKEEPERS[act].line;
    n.bossBeaten = GATEKEEPERS[act].beaten;
    n.tname = GATEKEEPERS[act].name.split(' ')[0] === 'The' ? 'The Examiner' : GATEKEEPERS[act].name.split(' ')[0];
  }
  if (n.kind === 'rest') return n;
  const sc = 1 + (act - 1) * 0.22;
  n.rise = +(n.rise * sc).toFixed(2);
  n.miss = Math.round(n.miss * (1 + (act - 1) * 0.08));
  n.hit = Math.round(n.hit * (1 + (act - 1) * 0.10));
  n.time = Math.max(8, n.time - (act - 1) * 2);
  // Thin air gives less back: pitch payouts shrink as the acts climb.
  if (n.restore) n.restore = Math.max(8, Math.round(n.restore * (1 - (act - 1) * 0.08)));

  // The three examiners are three different fights, not one renamed thrice.
  if (n.kind === 'gate') {
    if (act === 1) {
      // BRAM — the rapid fire. A clock that tightens with every question,
      // testing fluency on the low ground. Firm, but the fairest of the three.
      n.decay = true;
      n.miss = Math.round(n.miss * 0.8);
    } else if (act === 2) {
      // ODILE — the exacting. A miss knocks your progress back down the
      // ridge, and she builds faster once the pressure is on. The setback is
      // her teeth, so the stamina bite is lighter than an ordinary gate.
      n.streakGate = true;
      n.enrage = 1.3;
      n.miss = Math.round(n.miss * 0.68);
    } else if (act === 3) {
      // THE LAST EXAMINER — the reckoning. It reads from everything you have
      // ever missed (wired in the UI) and turns the screws in stages as it
      // finds your edges. It opens angry and only gets worse.
      n.enrage = 1.4;
      n.lapsePool = true;
      n.startThreat = Math.max(n.startThreat || 0, 8);
      n.miss = Math.round(n.miss * 0.82);
      n.stages = [
        { at: 2, title: 'It turns a page', sub: 'the questions sharpen — it has found an edge', set: { rise: +(n.rise * 1.12).toFixed(2) }, threat: 9 },
        { at: 4, title: 'It reads the last line', sub: 'everything you have missed, all at once', set: { rise: +(n.rise * 1.28).toFixed(2) }, threat: 12 },
      ];
    }
  }
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
  { fn: (n, al) => nGate(n, al, null), a: 'The examiners', m: 'Three fights, not one: Bram rapid-fires on a tightening clock, Odile knocks you back on a miss, the Last Examiner drills everything you have ever missed in stages.' },
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
  const map = {
    switchback: `Loose rock. Take it slow and clean — ${n} careful answers gets you up.`,
    storm: `Right answers won't calm this one. Only speed will. Outclimb it in ${n}.`,
    gate: node.domain ? `An examiner. It asks ${node.domain}, and nothing else.` : `An examiner. It asks whatever you know least.`,
    rest: `A fire, a flat spot, and a moment to pick new gear.`,
    shrine: `Leave an offering if you like. Sometimes the mountain answers.`,
    tale: `A story is waiting here. How it ends is up to you.`,
    serac: `The ice above is already falling. Be gone in ${n} before it lands.`,
    summit: `The last ${n}. Three stages, each meaner than the one before.`,
    whiteout: `You can't see three meters. Answer ${n} fast, on instinct.`,
    crevasse: `A thin snow bridge. ${n} steady steps across — a slip here costs dearly.`,
    traverse: `A long, easy line that never quite ends. Pace yourself through ${n}.`,
    thinair: `The air itself drains you every second. Finish ${n} before your legs notice.`,
    icefall: `Ice falls on a rhythm here. Learn the rhythm, clear ${n} between volleys.`,
    void: `Nothing in your pack works up here. Just you and ${n} honest answers.`,
    knife: `A ridge the width of your boot. One slip knocks you back down it. ${n} to cross.`,
    berg: `A widening crack beside the route. Every slip feeds it, and each one costs more. ${n} to pass.`,
    snowfield: `Deep, forgiving snow. Find a rhythm and put ${n} behind you.`,
    couloir: `A narrow chute that funnels everything the mountain drops. Move — ${n} and out.`,
    icewall: `Vertical blue ice. Misses are expensive here. ${n} solid placements to the top.`,
    windslab: `Gusts with no schedule and no warning. Hold steady through ${n}.`,
    sealedface: `The face is sealed in an ice shell. Crack it first, then climb ${n}.`,
    longwall: `A wall that keeps going. Each breather helps less than the last. ${n} to top out.`,
    tempest: `A storm that feeds on danger. Keep the threat starved while you clear ${n}.`,
    closing: `Your weather window is closing, and every chance is shorter. ${n}, quickly.`,
    avalanche: `The slope is loaded. Past halfway, it lets go — plan your ${n} around it.`,
    corniceridge: `Wind, gusts, and a lip of snow that punishes slips. ${n} across.`,
    frozentitan: `Old glacier ice in three layers. Break all three, then land ${n} — and it gets angry late.`,
    rockfall: `Pebbles come down in timed bursts. Move in the quiet. ${n} to clear.`,
    verglas: `Ice too thin to see. Answer fast and it sheds threat; hesitate and it doesn't. ${n} to cross.`,
  };
  return map[node.kind] || `${n} to clear.`;
}
