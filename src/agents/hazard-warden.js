/**
 * HAZARD WARDEN — encounter node factories, scaling, bestiary catalog.
 */

export const FOE_COLORS = {
  switchback: '#b8894e', storm: '#6f83e0', gate: '#8a97ab', serac: '#79cfe6', summit: '#ffcf6b',
  whiteout: '#cbd3dd', crevasse: '#4d7ea8', traverse: '#86b39a', thinair: '#a0dcd6', icefall: '#57a6d4',
  void: '#9b6fd0', knife: '#e0655a', berg: '#4fbfae', snowfield: '#bcd0e0', couloir: '#5f7a9a',
  icewall: '#6fb0d0', windslab: '#7d93b0', sealedface: '#90a4b8', longwall: '#8a9a86', tempest: '#6a5a9a',
  closing: '#d6a94e', avalanche: '#b3bcc6', corniceridge: '#9fb4c8', frozentitan: '#7fd4e8',
  shrine: '#c9a86a', rest: '#d89b52',
};

export function foeColor(kind) {
  return FOE_COLORS[kind] || '#8a97ab';
}

export function nSwitch(need, alt) {
  return {
    kind: 'switchback', icon: '🪨', title: 'Scree Slope',
    blurb: 'Loose scree — it slides when you misstep. Time barely matters here; footing is everything.',
    need, time: 18, rise: 0.8, miss: 26, ease: 7, max: 100, hit: 12, restore: 14, boon: false, alt,
    tname: 'Loose scree', tic: '🪨',
  };
}

export function nStorm(need, alt) {
  return {
    kind: 'storm', icon: '🌩️', title: 'Rising Squall',
    blurb: "A squall building by the second. Correct answers won't calm it — only speed clears the ridge.",
    need, time: 12, rise: 2.0, miss: 15, ease: 0, max: 100, hit: 16, restore: 16, boon: true, noBoonEase: true, alt,
    tname: 'The squall', tic: '🌩️',
  };
}

export function nGate(need, alt, domain) {
  return {
    kind: 'gate', icon: '🛡️', title: 'Gatekeeper',
    blurb: domain
      ? 'It tests you on ' + domain + '. Every wrong answer emboldens it; every right one drives it back.'
      : 'It tests your weakest exam domain. Every wrong answer emboldens it; every right one drives it back.',
    need, time: 17, rise: 1.35, miss: 30, ease: 12, max: 100, hit: 20, restore: 22, boon: true, domain, gateDomain: null, alt,
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
    blurb: 'The last pitch — wind, ice, and everything the mountain has saved for the top.',
    need, time: 15, rise: 2.1, miss: 22, ease: 8, max: 100, hit: 20, restore: 14, boon: false, alt,
    tname: 'Summit push', tic: '❄️',
  };
}

export function nSerac(need, alt) {
  return {
    kind: 'serac', icon: '🧊', title: 'Falling Serac',
    blurb: 'A wall of unstable ice — it can go at any second. Fast, punishing, and it hits hard.',
    need, time: 13, rise: 2.5, miss: 24, ease: 10, max: 100, hit: 22, restore: 20, boon: true, alt,
    tname: 'The serac', tic: '🧊',
  };
}

export function nWhiteout(need, alt) {
  return {
    kind: 'whiteout', icon: '🌫️', title: 'Blinding Whiteout',
    blurb: 'The cloud swallows the ridge whole. You climb by feel now — and you climb fast, before it closes for good.',
    need, time: 10, rise: 2.4, miss: 13, ease: 5, max: 100, hit: 15, restore: 16, boon: true, alt,
    tname: 'The whiteout', tic: '🌫️',
  };
}

export function nCrevasse(need, alt) {
  return {
    kind: 'crevasse', icon: '🕳️', title: 'Snow Bridge',
    blurb: 'A snow bridge over a black drop. Only a few steps to cross — but one wrong step and the mountain takes you.',
    need, time: 15, rise: 1.0, miss: 28, ease: 12, max: 100, hit: 24, restore: 18, boon: true, alt,
    tname: 'The snow bridge', tic: '🕳️',
  };
}

export function nTraverse(need, alt) {
  return {
    kind: 'traverse', icon: '🧗', title: 'Exposed Traverse',
    blurb: 'A long, exposed line across the face. Nothing here is hard — but it never ends, and the wind never once stops.',
    need, time: 16, rise: 1.5, miss: 16, ease: 6, max: 100, hit: 14, restore: 16, boon: true, alt,
    tname: 'The traverse', tic: '🧗',
  };
}

export function nThinAir(need, alt) {
  return {
    kind: 'thinair', icon: '🫁', title: 'The Thin Air',
    blurb: 'The air is too thin to breathe. Standing still costs you now — every second up here bleeds you dry. Keep moving.',
    need, time: 16, rise: 1.0, miss: 18, ease: 8, max: 100, hit: 12, restore: 16, boon: true, drain: 0.20, alt,
    tname: 'Thin air', tic: '🫁',
  };
}

export function nIcefall(need, alt) {
  return {
    kind: 'icefall', icon: '☄️', title: 'The Icefall',
    blurb: 'Ice comes down the couloir in volleys, on its own grim schedule. Read the rhythm — move between the falls.',
    need, time: 14, rise: 0.8, miss: 18, ease: 9, max: 100, hit: 15, restore: 16, boon: true, spike: 13, spikeEvery: 5, alt,
    tname: 'The icefall', tic: '☄️',
  };
}

export function nVoid(need, alt) {
  return {
    kind: 'void', icon: '🌑', title: 'Bare Ridge',
    blurb: 'Up here nothing works — no flare, no field notes, no tricks. Just you and what you actually know.',
    need, time: 15, rise: 1.4, miss: 20, ease: 10, max: 100, hit: 16, restore: 18, boon: false, suppress: true, alt,
    tname: 'Bare ridge', tic: '🌑',
  };
}

export function nKnife(need, alt) {
  return {
    kind: 'knife', icon: '🗡️', title: 'The Knife-Edge',
    blurb: 'A ridge one boot wide, a clean fall on either side. Falter and you slide back — the edge forgives nothing.',
    need, time: 15, rise: 1.2, miss: 20, ease: 10, max: 100, hit: 16, restore: 18, boon: true, streakGate: true, alt,
    tname: 'The knife-edge', tic: '🗡️',
  };
}

export function nBergschrund(need, alt) {
  return {
    kind: 'berg', icon: '⛏️', title: 'Widening Crack',
    blurb: 'The gap between snow and ice widens with every slip. Stumble once and it yawns; stumble again and it swallows.',
    need, time: 15, rise: 1.0, miss: 14, ease: 10, max: 100, hit: 16, restore: 18, boon: true, escalate: 4, alt,
    tname: 'The widening crack', tic: '⛏️',
  };
}

export function nSnowfield(need, alt) {
  return {
    kind: 'snowfield', icon: '🌨️', title: 'The Snowfield',
    blurb: 'Deep, soft snow — slow and plodding, but it forgives a stumble. Find your pace.',
    need, time: 18, rise: 0.7, miss: 12, ease: 10, max: 100, hit: 10, restore: 14, boon: true, alt,
    tname: 'The snowfield', tic: '🌨️',
  };
}

export function nCouloir(need, alt) {
  return {
    kind: 'couloir', icon: '🗻', title: 'The Couloir',
    blurb: 'A steep gully that funnels everything downward. Keep pace, or the mountain wears you down.',
    need, time: 13, rise: 1.9, miss: 18, ease: 6, max: 100, hit: 17, restore: 16, boon: true, alt,
    tname: 'The couloir', tic: '🗻',
  };
}

export function nIcewall(need, alt) {
  return {
    kind: 'icewall', icon: '💠', title: 'The Ice Wall',
    blurb: 'Vertical ice. Every placement matters, and it does not forgive hesitation.',
    need, time: 14, rise: 1.6, miss: 24, ease: 9, max: 100, hit: 20, restore: 18, boon: true, alt,
    tname: 'The ice wall', tic: '💠',
  };
}

export function nWindslab(need, alt) {
  return {
    kind: 'windslab', icon: '🌀', title: 'Gust Field',
    blurb: 'Wind-loaded snow, primed to release. Gusts of threat come without warning — brace and keep moving through them.',
    need, time: 14, rise: 1.0, miss: 16, ease: 8, max: 100, hit: 16, restore: 16, boon: true, gust: 0.5, alt,
    tname: 'The gust field', tic: '🌀',
  };
}

export function nSealedFace(need, alt) {
  return {
    kind: 'sealedface', icon: '🔒', title: 'Ice Shell',
    blurb: 'A face sealed in hard blue ice. Your first correct answers break the shell — then you can climb for real.',
    need, time: 15, rise: 1.2, miss: 20, ease: 10, max: 100, hit: 17, restore: 18, boon: true, shield: 2, alt,
    tname: 'The ice shell', tic: '🔒',
  };
}

export function nLongWall(need, alt) {
  return {
    kind: 'longwall', icon: '🪜', title: 'The Long Wall',
    blurb: 'A wall with no top in sight. The longer you are on it, the less each breather gives back — and it knows it.',
    need, time: 16, rise: 1.3, miss: 18, ease: 12, max: 100, hit: 16, restore: 16, boon: true, fatigue: true, alt,
    tname: 'The long wall', tic: '🪜',
  };
}

export function nTempest(need, alt) {
  return {
    kind: 'tempest', icon: '🌪️', title: 'The Tempest',
    blurb: 'A storm that feeds on chaos. The closer you are to the edge, the harder it drives you toward it.',
    need, time: 13, rise: 1.4, miss: 20, ease: 8, max: 100, hit: 18, restore: 18, boon: true, enrage: 1.7, alt,
    tname: 'The tempest', tic: '🌪️',
  };
}

export function nClosing(need, alt) {
  return {
    kind: 'closing', icon: '⏳', title: 'The Closing Window',
    blurb: 'The weather window is slamming shut. Every second you are given is shorter than the last — climb.',
    need, time: 16, rise: 1.2, miss: 18, ease: 9, max: 100, hit: 17, restore: 18, boon: true, decay: true, alt,
    tname: 'The closing window', tic: '⏳',
  };
}

export function nAvalanche(need, alt) {
  return {
    kind: 'avalanche', icon: '💥', title: 'The Avalanche',
    blurb: 'The whole slope is loaded and silent. It waits, and waits — then lets go all at once. Be past it when it does.',
    need, time: 15, rise: 1.0, miss: 20, ease: 9, max: 100, hit: 20, restore: 18, boon: true, phase: true, alt,
    tname: 'The avalanche', tic: '💥',
  };
}

export function nShrine(alt) {
  return {
    kind: 'shrine', icon: '⛩️', title: 'Weathered Shrine',
    blurb: 'Cairns and faded prayer flags. Climbers leave something here, and the mountain remembers.',
    need: 0, restore: 0, boon: false, alt,
  };
}

export function nCorniceRidge(need, alt) {
  return {
    kind: 'corniceridge', icon: '🌬️', title: 'Wind Lip',
    blurb: 'A wind-carved lip of snow over empty air. Gusts hammer it, and one wrong step sends you sliding back.',
    need, time: 15, rise: 1.1, miss: 18, ease: 9, max: 100, hit: 17, restore: 16, boon: true, gust: 0.4, streakGate: true, alt,
    tname: 'The wind lip', tic: '🌬️',
  };
}

export function nFrozenTitan(need, alt) {
  return {
    kind: 'frozentitan', icon: '🧊', title: 'Glacier Block',
    blurb: 'A pillar of ancient blue ice. Break through three frozen layers — then it rages when the threat runs high.',
    need, time: 14, rise: 1.2, miss: 20, ease: 9, max: 100, hit: 18, restore: 20, boon: true, shield: 3, enrage: 1.5, alt,
    tname: 'The glacier block', tic: '🧊',
  };
}

export const ACTS = [
  { name: 'The Approach', flavor: 'Warm rock, open glacier. The mountain lets you find your rhythm before it shows its teeth.' },
  { name: 'The Headwall', flavor: 'The face rears up. Easy ground is gone — every pitch wants technique, nerve, and recall under pressure.' },
  { name: 'The Death Zone', flavor: 'Above the last camp the air turns to knives. Everything the mountain saved for the summit push, thrown at once.' },
];

export function scaleNode(n, act) {
  n.act = act;
  if (n.kind === 'rest') return n;
  const sc = 1 + (act - 1) * 0.20;
  n.rise = +(n.rise * sc).toFixed(2);
  n.miss = Math.round(n.miss * (1 + (act - 1) * 0.08));
  n.hit = Math.round(n.hit * (1 + (act - 1) * 0.10));
  n.time = Math.max(8, n.time - (act - 1) * 2);
  return n;
}

export const BESTIARY = [
  { fn: nSwitch, t: 1, a: 'Accuracy', m: 'Loose footing. Time barely matters here — it is all about getting the answer right.' },
  { fn: nTraverse, t: 1, a: 'Endurance', m: 'Nothing is hard, but it never ends and the wind never stops. Steady, grinding pressure.' },
  { fn: nSnowfield, t: 1, a: 'Accuracy', m: 'Deep, forgiving snow. Slow going, but it lets a stumble slide. A place to find your rhythm.' },
  { fn: nCrevasse, t: 2, a: 'Precision', m: 'A snow bridge over a black drop. Few steps to cross, but a single miss is punishing.' },
  { fn: nBergschrund, t: 2, a: 'Escalating', m: 'A widening crack. Every slip costs more stamina than the one before it.' },
  { fn: nStorm, t: 2, a: 'Speed', m: 'A squall building by the second. Correct answers will not calm it — only speed clears the ridge.' },
  { fn: nCouloir, t: 2, a: 'Speed', m: 'A steep gully funneling everything down. Keep pace, or it wears you down.' },
  { fn: nWindslab, t: 2, a: 'Chaos', m: 'Wind-loaded snow. Gusts of threat come without warning — brace and push through them.' },
  { fn: nVoid, t: 3, a: 'No boons', m: 'Bare ridge — nothing works here. No flare, no field notes, no tricks. Just what you know.' },
  { fn: nKnife, t: 3, a: 'Consistency', m: 'A ridge one boot wide. Falter and you slide back down it — a miss undoes your progress.' },
  { fn: nIcewall, t: 3, a: 'Precision', m: 'Vertical ice. Every placement matters, and it does not forgive hesitation.' },
  { fn: nSealedFace, t: 3, a: 'Armored', m: 'Hard blue ice shell. Your first correct answers break the layers before any climbing counts.' },
  { fn: nLongWall, t: 3, a: 'Attrition', m: 'A wall with no top in sight. The longer you are on it, the less each breather gives back.' },
  { fn: nWhiteout, t: 4, a: 'Speed', m: 'The cloud swallows the ridge. You climb blind and fast, before it closes for good.' },
  { fn: nThinAir, t: 4, a: 'Attrition', m: 'Air too thin to breathe. Standing still bleeds you dry — keep moving or waste away.' },
  { fn: nIcefall, t: 4, a: 'Timing', m: 'Ice comes down in volleys on its own grim schedule. Read the rhythm; move between the falls.' },
  { fn: nTempest, t: 4, a: 'Enrage', m: 'A storm that feeds on chaos. The closer you are to the edge, the harder it drives you toward it.' },
  { fn: nClosing, t: 4, a: 'Countdown', m: 'A weather window slamming shut. Every second you are given is shorter than the last.' },
  { fn: nAvalanche, t: 4, a: 'Release', m: 'A loaded, silent slope. It waits — then lets go all at once at the halfway point. Be past it.' },
  { fn: nCorniceRidge, t: 3, a: 'Chaos ridge', m: 'Wind lip over empty air. Random gusts hammer the crossing, and a single miss sends you sliding back.' },
  { fn: nFrozenTitan, t: 4, a: 'Armored elite', m: 'Glacier block with three ice layers to break — then it rages when the threat runs high.' },
  { fn: (n, al) => nGate(n, al, null), t: 5, a: 'Competence duel', m: 'Tests your weakest TCO exam domain at entry. Every wrong answer emboldens it; every right one drives it back.' },
  { fn: nSerac, t: 5, a: 'Elite', m: 'A wall of unstable ice that can go at any second. Fast, punishing, and it hits hard.' },
  { fn: nSummit, t: 5, a: 'Final pitch', m: 'Summit push — wind, ice, and everything the mountain has saved for the top.' },
];

export function nodeEmoji(kind) {
  const m = {
    storm: '⛈️', gate: '🛡️', rest: '🏕️', summit: '🏔️', serac: '🧊', whiteout: '🌫️', crevasse: '🕳️',
    traverse: '🧗', thinair: '🫁', icefall: '☄️', void: '🌑', knife: '🗡️', berg: '⛏️', snowfield: '🌨️',
    couloir: '🗻', icewall: '💠', windslab: '🌀', sealedface: '🔒', longwall: '🪜', tempest: '🌪️',
    closing: '⏳', avalanche: '💥', corniceridge: '🌬️', frozentitan: '🧊', shrine: '⛩️',
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
  return n + ' to clear';
}
