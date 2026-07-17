/**
 * CAIRN KEEPER — trail tales. A deck of narrative choice encounters met at
 * story cairns along the route. Pure helper agent: it draws tales and
 * resolves choices deterministically from the run's rng; the UI applies the
 * resulting effects. Never touches the bus.
 *
 * Effect vocabulary (`fx`) — everything the engine knows how to apply:
 *   stam        ±n   stamina now
 *   relic       true random relic from the Mountain Economist
 *   draftNext   true a promised boon draft at the next camp or gate
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
    text: 'A fixed line hangs down the face, anchors rusted, sheath bleached by more seasons than anyone has counted. Whoever set it never came back for it. It would save you an hour of honest climbing — if it holds.',
    choices: [
      {
        ic: '🧗', label: 'Trust the old line',
        desc: 'Climb the rope. If it holds you save real strength. If it doesn’t…',
        gamble: {
          p: 0.6,
          win: { stam: 16 }, winText: 'The anchors creak but hold. You top the pitch with strength to spare.',
          lose: { stam: -12 }, loseText: 'The sheath parts at the second anchor. You catch yourself, barely, and climb the rest the hard way.',
        },
      },
      {
        ic: '🥾', label: 'Break your own trail',
        desc: 'Ignore the rope and read the rock yourself. The next pitch asks one less of you.',
        fx: { easeNext: 1 },
        after: 'Slower, but every hold is yours now. You know this ground before the mountain can ask about it.',
      },
    ],
  },
  {
    id: 'portercache',
    ic: '🎒',
    title: 'The Lost Porter’s Cache',
    minAct: 1,
    text: 'A pack frame juts from the snow off the trail, canvas gone stiff, straps still buckled. Someone carried this high and set it down meaning to come back. The snow says that was a long time ago.',
    choices: [
      {
        ic: '⛏️', label: 'Dig it out',
        desc: 'Cost: 8 stamina. Whatever was worth carrying up here is yours now.',
        fx: { stam: -8, relic: true },
        after: 'The digging costs you, but the cache was packed by someone who knew the mountain.',
      },
      {
        ic: '📓', label: 'Mark it and move on',
        desc: 'Note it in the ledger for whoever comes next. Keep your pace. +5 stamina.',
        fx: { stam: 5 },
        after: 'You stack three stones over the frame and keep moving. The rhythm of the climb carries you.',
      },
    ],
  },
  {
    id: 'keeper',
    ic: '🗿',
    title: 'The Keeper of Cairns',
    minAct: 1,
    text: 'An old climber sits beside the cairn as if the two were built together, restacking its stones by feel. "Every climber who passes leaves something," the Keeper says. "Most leave what they think they know. Recite, or rest. Either is honest."',
    choices: [
      {
        ic: '🗣️', label: 'Recite what you know',
        desc: 'Give the Keeper your ledger, line by line. A boon is promised at the next camp.',
        fx: { draftNext: true },
        after: 'The Keeper listens without a word, then nods once. "The next fire you sit at will owe you something."',
      },
      {
        ic: '🤲', label: 'Admit what you don’t',
        desc: 'Name the trails where you are thinnest. Honesty rests easy. +10 stamina.',
        fx: { stam: 10 },
        after: '"Good," says the Keeper. "The mountain only punishes the ones who lie about it." You leave lighter than you came.',
      },
    ],
  },
  {
    id: 'signalmirror',
    ic: '🪞',
    title: 'The Signal Mirror',
    minAct: 1,
    text: 'Something glints on a shelf above the route — glass or steel, angled like it was left to be seen. It is a hard scramble off the line to reach it, over rock the guidebook never graded.',
    choices: [
      {
        ic: '🧗', label: 'Climb to it',
        desc: 'Off-route and ungraded. It might be worth the detour. It might just be far.',
        gamble: {
          p: 0.55,
          win: { relic: true }, winText: 'A signal kit, oiled and wrapped, left by someone who planned to need it. Now it’s yours.',
          lose: { stam: -14 }, loseText: 'A sardine tin, polished by wind. The scramble back down costs more than the shine was worth.',
        },
      },
      {
        ic: '👣', label: 'Stay on the line',
        desc: 'Shiny things put climbers in the ledger’s margins. Keep moving. +5 stamina.',
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
    text: 'The couloir narrows until the walls hold your breathing and hand it back to you. Guides say the mountain answers anyone who calls their name here. They disagree about what it answers with.',
    choices: [
      {
        ic: '🗣️', label: 'Call your name',
        desc: 'Let the mountain answer. Guides disagree on what comes back.',
        gamble: {
          p: 0.5,
          win: { stam: 12 }, winText: 'Your own voice returns steady and doubled, like a rope team you didn’t know you had. The walls feel wider going out.',
          lose: { threatNext: 12 }, loseText: 'Something else answers — lower, and from above. It knows the route ahead of you, and now it is waiting on it.',
        },
      },
      {
        ic: '🤫', label: 'Pass in silence',
        desc: 'Listen instead. The walls teach you the ground ahead — the next pitch asks one less.',
        fx: { easeNext: 1 },
        after: 'You move through on quiet feet, and the couloir tells you everything it has heard about the pitch above.',
      },
    ],
  },
  {
    id: 'bivouac',
    ic: '⛺',
    title: 'Whiteout Bivouac',
    minAct: 2,
    text: 'The cloud comes down the face like a lid closing, and an old bivouac ledge opens to your left — dry, walled, room for one. Weather like this passes. So does time, and the mountain keeps ahead of anyone who stands still.',
    choices: [
      {
        ic: '🛏️', label: 'Wait it out',
        desc: '+18 stamina — but the mountain gets ahead of you. The next pitch opens with 15 threat.',
        fx: { stam: 18, threatNext: 15 },
        after: 'You wake to clear air and stiff legs. Somewhere above, the route has been rearranging itself without you.',
      },
      {
        ic: '🌫️', label: 'Push through the cloud',
        desc: 'Cost: 10 stamina. Arrive before the weather settles — the next pitch asks one less.',
        fx: { stam: -10, easeNext: 1 },
        after: 'You climb inside the whiteout by feel and count. When it lifts, you are above it, and the pitch ahead never saw you coming.',
      },
    ],
  },
  {
    id: 'grave',
    ic: '🪦',
    title: 'The Unmarked Grave',
    minAct: 2,
    text: 'A mound of stones off the trail, too deliberate for rockfall, too old for names. An ice axe stands at its head, the way climbers mark the ones who stopped climbing. The wind has been the only visitor for years.',
    choices: [
      {
        ic: '🪨', label: 'Tend the cairn',
        desc: 'Cost: 10 stamina to restack the stones. What the climber carried passes to you.',
        fx: { stam: -10, relic: true },
        after: 'You rebuild the mound stone by stone. Beneath the axe head, wrapped in oilcloth, something the mountain never claimed.',
      },
      {
        ic: '🎩', label: 'Pass in respect',
        desc: 'A nod, and onward. Some ledgers are closed. +8 stamina.',
        fx: { stam: 8 },
        after: 'You touch the axe once and keep walking. Whoever they were, they would have told you to save your strength for the ridge.',
      },
    ],
  },
  {
    id: 'oldledger',
    ic: '📖',
    title: 'The Old Guide’s Ledger',
    minAct: 3,
    text: 'Frozen into the ice at head height: a leather journal, pages fanned open mid-entry. The hand is steady until the last line, which is not. It is a record of an attempt on this exact route — one that ends above where you stand.',
    choices: [
      {
        ic: '🧊', label: 'Read it where it froze',
        desc: 'Cost: 5 stamina in the cold. Their route notes earn you a promised boon at the next camp.',
        fx: { stam: -5, draftNext: true },
        after: 'The cold works into your gloves while you read. The last legible line: "the high camp fire owes the next one through." It meant you.',
      },
      {
        ic: '⛏️', label: 'Chip it free and carry it',
        desc: 'Cost: 8 stamina. A closed record belongs off this mountain — and the mountain pays its debts.',
        fx: { stam: -8, relic: true },
        after: 'The ice gives it up an inch at a time. The weight in your pack feels less like paper and more like something owed being repaid.',
      },
    ],
  },
  {
    id: 'thinbargain',
    ic: '🫁',
    title: 'The Thin Air Bargain',
    minAct: 3,
    text: 'Above the last camp the mountain finally speaks plainly, the way places do when the air runs out. What it says is a price. What it offers is the next pitch, already half-climbed. Nothing up here is free, and nothing is a trick either.',
    choices: [
      {
        ic: '💨', label: 'Pay in breath',
        desc: 'Cost: 15 stamina. The next pitch asks two fewer of you.',
        fx: { stam: -15, easeNext: 2 },
        after: 'You give the mountain what it asked. The route above visibly relaxes, like a fist half-opening.',
      },
      {
        ic: '🫀', label: 'Keep your lungs',
        desc: 'Refuse the trade. The mountain takes offense — the next pitch opens with 10 threat.',
        fx: { threatNext: 10 },
        after: 'You climb on with everything you came with. Above you, the route tightens back into a fist. Fair is fair.',
      },
    ],
  },
];

/**
 * Draw one tale for the given act, skipping ids already used this run.
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
    role: 'Trail tales — narrative choice encounters drawn at story cairns',
    api: { TALES, drawTale, resolveChoice },
    register() {},
  };
}
