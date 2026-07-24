/**
 * CAIRN KEEPER — waymark stories. A deck of narrative choice encounters met
 * at waymarks along the route. Pure helper agent: it draws stories and
 * resolves choices deterministically from the run's rng; the UI applies the
 * resulting effects. Never touches the bus.
 *
 * Effect vocabulary (`fx`) — everything the engine knows how to apply:
 *   stam        ±n   stamina now
 *   relic       true random relic from the Mountain Economist
 *   draftNext   true a promised gear draft at the next camp or gate
 *   threatNext  n    the next pitch opens with n threat on the board
 *   easeNext    n    the next pitch needs n fewer correct answers (min 2)
 * A choice may instead carry `gamble: { p, win, lose, winText, loseText }`
 * where win/lose are fx objects and p is the win probability.
 */

export const TALES = [
  {
    id: 'ghostrope',
    ic: '🪢',
    title: 'The Ghost Rope',
    minAct: 1,
    text: 'An old fixed rope hangs down the crux, anchors bleeding rust. Whoever set it meant to come back. It would save you an hour — if it holds.',
    choices: [
      {
        ic: '🧗', label: 'Trust the old line',
        desc: 'If it holds, you save real strength. If not, it’s a long fall to a short ledge.',
        gamble: {
          p: 0.6,
          win: { stam: 16 }, winText: 'It holds. Barely, and with complaints — but it holds. You reach the top with strength to spare.',
          lose: { stam: -12 }, loseText: 'It parts at the second anchor. You catch a flake and climb the rest of it angry.',
        },
      },
      {
        ic: '🥾', label: 'Break your own trail',
        desc: 'Slower, but you learn every hold yourself. The next pitch asks one less of you.',
        fx: { easeNext: 1 },
        after: 'You top out knowing the ground like your own kitchen. The pitch above has fewer surprises left.',
      },
    ],
  },
  {
    id: 'portercache',
    ic: '🎒',
    title: 'The Porter’s Cache',
    minAct: 1,
    text: 'A pack frame sticks out of the snow, straps still buckled. Somebody carried this high, set it down, and never came back for it.',
    choices: [
      {
        ic: '⛏️', label: 'Dig it out',
        desc: 'Costs 8 stamina. Whatever was worth hauling up here is yours.',
        fx: { stam: -8, relic: true },
        after: 'The frozen canvas fights you the whole way. Inside: something the mountain never claimed.',
      },
      {
        ic: '📓', label: 'Mark it and move on',
        desc: 'Keep your rhythm. +5 stamina.',
        fx: { stam: 5 },
        after: 'You stack three stones on the frame for the next climber and keep your pace. The rhythm pays.',
      },
    ],
  },
  {
    id: 'keeper',
    ic: '🗿',
    title: 'The Keeper of the Waymarks',
    minAct: 1,
    text: 'An old climber sits by the waymark, restacking its stones by feel. “Everyone leaves something,” they say. “Recite what you know, or admit what you don’t. Both are worth something up here.”',
    choices: [
      {
        ic: '🗣️', label: 'Recite what you know',
        desc: 'Say your ledger out loud. There’s gear in it for you at the next camp.',
        fx: { draftNext: true },
        after: '“Not bad.” They nod once. “The next fire you sit at owes you a favor.”',
      },
      {
        ic: '🤲', label: 'Admit what you don’t',
        desc: 'Honesty rests easy. +10 stamina.',
        fx: { stam: 10 },
        after: '“Good. The mountain only punishes climbers who lie about it.” You walk away lighter than you came.',
      },
    ],
  },
  {
    id: 'signalmirror',
    ic: '🪞',
    title: 'The Signal Mirror',
    minAct: 1,
    text: 'Something glints on a shelf above the route. Glass or steel, angled to be seen. It’s a hard scramble off your line to find out which.',
    choices: [
      {
        ic: '🧗', label: 'Climb to it',
        desc: 'Ungraded rock, unknown reward.',
        gamble: {
          p: 0.55,
          win: { relic: true }, winText: 'A signal kit, oiled and wrapped. Somebody planned to need this. Now it’s yours.',
          lose: { stam: -14 }, loseText: 'A sardine tin, polished by forty years of wind. The scramble down costs more than the shine was worth.',
        },
      },
      {
        ic: '👣', label: 'Stay on the line',
        desc: 'Shiny things get climbers killed. Keep moving. +5 stamina.',
        fx: { stam: 5 },
        after: 'You keep your feet on the route and your eyes on the next hold. The glint watches you go.',
      },
    ],
  },
  {
    id: 'echochamber',
    ic: '📣',
    title: 'The Echo Chamber',
    minAct: 2,
    text: 'The couloir narrows until it hands your breathing back to you. Guides say the mountain answers anyone who shouts their name here. They argue about what it answers with.',
    choices: [
      {
        ic: '🗣️', label: 'Call your name',
        desc: 'Fifty-fifty, the guides say.',
        gamble: {
          p: 0.5,
          win: { stam: 12 }, winText: 'Your voice comes back doubled and steady, like a rope team you didn’t know you had.',
          lose: { threatNext: 12 }, loseText: 'Something else answers. Lower. From above. It knows the route ahead of you, and now it’s waiting on it.',
        },
      },
      {
        ic: '🤫', label: 'Pass in silence',
        desc: 'Listen instead. The next pitch asks one less of you.',
        fx: { easeNext: 1 },
        after: 'You move through on quiet feet and leave knowing more than you came with.',
      },
    ],
  },
  {
    id: 'bivouac',
    ic: '⛺',
    title: 'Whiteout Bivouac',
    minAct: 2,
    text: 'The cloud drops like a lid. A bivouac ledge opens to your left — dry, walled, room for one. Weather passes. So does time.',
    choices: [
      {
        ic: '🛏️', label: 'Wait it out',
        desc: '+18 stamina — but the mountain gets ahead of you. Next pitch opens with 15 threat.',
        fx: { stam: 18, threatNext: 15 },
        after: 'You wake to clear air and stiff legs. The route spent the night rearranging itself without you.',
      },
      {
        ic: '🌫️', label: 'Push through the cloud',
        desc: 'Costs 10 stamina. Beat the weather up — the next pitch asks one less.',
        fx: { stam: -10, easeNext: 1 },
        after: 'You climb by feel and count. When the cloud lifts, you are above it.',
      },
    ],
  },
  {
    id: 'grave',
    ic: '🪦',
    title: 'The Unmarked Grave',
    minAct: 2,
    text: 'A mound of stones off the trail, too deliberate for rockfall. An ice axe stands at its head, the way climbers mark the ones who stopped here.',
    choices: [
      {
        ic: '🪨', label: 'Tend the cairn',
        desc: 'Costs 10 stamina to restack the stones. What they carried passes to you.',
        fx: { stam: -10, relic: true },
        after: 'You rebuild it stone by stone. Under the axe head, wrapped in oilcloth: something the mountain never claimed.',
      },
      {
        ic: '🎩', label: 'Pass in respect',
        desc: 'Some ledgers are closed. +8 stamina.',
        fx: { stam: 8 },
        after: 'You touch the axe once and move on. Whoever they were, they’d have told you to save your strength.',
      },
    ],
  },
  {
    id: 'oldledger',
    ic: '📖',
    title: 'The Old Guide’s Journal',
    minAct: 3,
    text: 'A leather journal frozen into the ice at head height, open mid-entry. The handwriting is steady until the last line, which isn’t. It’s a record of this exact route — one that ends above where you stand.',
    choices: [
      {
        ic: '🧊', label: 'Read it where it froze',
        desc: 'Costs 5 stamina in the cold. Their route notes buy you gear at the next camp.',
        fx: { stam: -5, draftNext: true },
        after: 'The last legible line: “the high camp fire owes the next one through.” That’s you.',
      },
      {
        ic: '⛏️', label: 'Chip it free and carry it',
        desc: 'Costs 8 stamina. Closed records belong off the mountain — and the mountain pays its debts.',
        fx: { stam: -8, relic: true },
        after: 'The ice gives it up an inch at a time. The weight in your pack feels like a debt being repaid.',
      },
    ],
  },
  {
    id: 'thinbargain',
    ic: '🫁',
    title: 'The Thin Air Bargain',
    minAct: 3,
    text: 'Above the last camp the mountain quits being subtle. It names a price. It offers the next pitch half-climbed. No trick — just a trade.',
    choices: [
      {
        ic: '💨', label: 'Pay in breath',
        desc: 'Costs 15 stamina. The next pitch asks two fewer of you.',
        fx: { stam: -15, easeNext: 2 },
        after: 'You pay. The route above visibly relaxes, like a fist half-opening.',
      },
      {
        ic: '🫀', label: 'Keep your lungs',
        desc: 'Refuse the trade. The mountain takes it personally — next pitch opens with 10 threat.',
        fx: { threatNext: 10 },
        after: 'You keep what you came with. Above you, the route closes back into a fist. Fair.',
      },
    ],
  },
];

/**
 * Draw one story for the given act, skipping ids already used this run.
 * Deterministic from rnd. Falls back to reuse if the fresh pool is empty.
 */
export function drawTale(rnd, act, usedIds) {
  const used = usedIds || [];
  let pool = TALES.filter((t) => t.minAct <= (act || 1) && used.indexOf(t.id) < 0);
  if (!pool.length) pool = TALES.filter((t) => t.minAct <= (act || 1));
  if (!pool.length) pool = TALES;
  return pool[Math.floor(rnd() * pool.length)];
}

/**
 * Resolve a choice into { fx, text }. Gambles roll against rnd here so the
 * outcome is deterministic under a seeded run (Daily Ridge included).
 */
export function resolveChoice(choice, rnd) {
  if (choice.gamble) {
    const g = choice.gamble;
    const won = rnd() < g.p;
    return { fx: (won ? g.win : g.lose) || {}, text: won ? g.winText : g.loseText, won };
  }
  return { fx: choice.fx || {}, text: choice.after || '', won: null };
}

export function createCairnKeeper() {
  return {
    id: 'cairn-keeper',
    name: 'Cairn Keeper',
    role: 'Waymark stories — narrative choice encounters on the route',
    api: { TALES, drawTale, resolveChoice },
    register() {},
  };
}
