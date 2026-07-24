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
  {
    id: 'martatea',
    ic: '🫖',
    title: 'Tea with Marta',
    minAct: 1,
    text: 'Marta the Keeper has a kettle going in the lee of a boulder, like it is the most normal thing in the world at four thousand meters. "Sit. It needs a minute. Everything good needs a minute." She pours two cups without asking.',
    choices: [
      {
        ic: '🍵', label: 'Sit and drink',
        desc: 'The tea is hot and the company is better. +12 stamina.',
        fx: { stam: 12, flag: 'tea' },
        after: 'You talk about nothing. The route, the weather, a bird she is feuding with. It is the best twenty minutes of the climb so far, and she waves you off before you can thank her.',
      },
      {
        ic: '🚶', label: 'Politely keep moving',
        desc: 'Light is short. The next pitch asks one less — Marta points out the good line as you go.',
        fx: { easeNext: 1 },
        after: '"Suit yourself." She points with her cup. "Stay left of the dark rock. The dark rock is lying to you." She is, of course, right.',
      },
    ],
  },
  {
    id: 'ptarmigan',
    ic: '🐦',
    title: 'The Ptarmigan',
    minAct: 1,
    text: 'A fat white bird lands on your pack and looks at you the way a landlord looks at a tenant. It is standing on your food. It knows it is standing on your food.',
    choices: [
      {
        ic: '🥪', label: 'Share your lunch',
        desc: 'Cost: 6 stamina. You cannot explain why this feels important. It does.',
        fx: { stam: -6, flag: 'bird' },
        after: 'It eats like it paid for the meal, bobs once — which you choose to read as gratitude — and flies up the route. Somehow you feel lighter, six stamina poorer, and completely certain you will see it again.',
      },
      {
        ic: '👋', label: 'Shoo it off',
        desc: 'It is YOUR lunch. +6 stamina, and the moral high ground.',
        fx: { stam: 6 },
        after: 'It leaves slowly, insultingly slowly, taking one crumb as a tax. You get the feeling you have made a very small, very patient enemy.',
      },
    ],
  },
  {
    id: 'cartographer',
    ic: '🗺️',
    title: 'Emil, Mapping the Wind',
    minAct: 2,
    text: 'A man sits cross-legged on the ledge with pencils lined up by length, drawing a map of things that move. "Emil," he says, not looking up. "I chart the gusts. Everyone laughs. Then they climb into one." He taps an empty stretch of paper. "I will trade you a corner of tomorrow for a fact you are sure of."',
    choices: [
      {
        ic: '🗣️', label: 'Trade him a fact',
        desc: 'Tell him something you know cold. He fills in your next pitch — it opens calm.',
        fx: { flag: 'emil' },
        after: 'He writes your fact into the margin like it is a bearing. "Good. Solid ground on paper is solid ground underfoot." He shows you where the next pitch breathes — and where it holds its breath.',
      },
      {
        ic: '🎁', label: 'Ask what he has spare',
        desc: 'Cost: 8 stamina hauling his kit up a step. Mapmakers carry strange, useful things.',
        fx: { stam: -8, relic: true },
        after: 'You carry his crate up the awkward step and he rummages in it with real joy. "For your trouble. I have two, and the second one was never mine to keep."',
      },
    ],
  },
  {
    id: 'letters',
    ic: '✉️',
    title: 'The Letter Tin',
    minAct: 2,
    text: 'A biscuit tin wedged under a flat stone, streaked with old wax. Inside, letters — climbers writing to whoever comes next. The top one reads: "If you are reading this, the weather let you. Write something true and go on."',
    choices: [
      {
        ic: '✍️', label: 'Write something true',
        desc: 'Leave a line for the next climber. Some things you only learn by saying them. +8 stamina.',
        fx: { stam: 8, flag: 'letter' },
        after: 'You write the truest thing you know about being this tired and this far up, and feel better the moment the lid closes. Strange how that works. It will be there when someone needs it.',
      },
      {
        ic: '📖', label: 'Read them all',
        desc: 'Cost: 5 stamina sitting in the cold. Sixty years of advice from people who stood right here.',
        fx: { stam: -5, draftNext: true },
        after: 'Grocery lists. Confessions. A recipe. And threaded through all of it, real route advice from people who wanted a stranger to make it. The next camp will make more sense because of them.',
      },
    ],
  },
  {
    id: 'younggide',
    ic: '🧒',
    title: 'The Apprentice',
    minAct: 2,
    text: 'A young guide is re-coiling a rope for the fourth time, jaw set, eyes wet with frustration and altitude. "I froze on the traverse. Marta says everyone freezes once. Did you freeze?" They look at you like the answer matters. It does.',
    choices: [
      {
        ic: '💬', label: 'Tell them the truth',
        desc: 'Yes. You froze. Talk them through what unfroze you. Teaching it locks it in — the next pitch asks one less.',
        fx: { easeNext: 1, flag: 'apprentice' },
        after: 'You explain it plainly — the freeze, the breath, the first small move that breaks it. Saying it out loud, you finally understand it yourself. They nod, and coil the rope right on the fifth try.',
      },
      {
        ic: '🤝', label: 'Rope up with them a while',
        desc: 'Cost: 10 stamina at their pace. Nobody should re-learn courage alone.',
        fx: { stam: -10, draftNext: true, flag: 'apprentice' },
        after: 'You climb a rope-length together, slow and honest. At the anchor they press something from their kit into your hand. "Marta says gear you are given works better than gear you buy." ',
      },
    ],
  },
  {
    id: 'summitbell',
    ic: '🔔',
    title: 'The Bell Above the Clouds',
    minAct: 3,
    text: 'A small bronze bell hangs from an iron post, older than every map of this mountain. The rule, scratched beneath it in four languages: RING IT GOING UP AND YOU OWE THE TOP THE TRUTH. IT RINGS BACK FOR EVERY CLIMBER WHO KEPT THEIR WORD.',
    choices: [
      {
        ic: '🔔', label: 'Ring it',
        desc: 'Make the summit a promise. The next pitch opens with 8 threat — the mountain heard you.',
        fx: { threatNext: 8, flag: 'bell' },
        after: 'One clear note, and the wind goes quiet around it — listening, or counting. There is no taking it back now. The top knows you are coming.',
      },
      {
        ic: '🤫', label: 'Leave it silent',
        desc: 'Promises are heavy at altitude. Save your breath. +8 stamina.',
        fx: { stam: 8 },
        after: 'You pass without a sound. The bell hangs still, patient as the mountain under it. It has waited out braver silences than yours.',
      },
    ],
  },
];

/* ---------- The cast around the fire ---------- */

/**
 * One reactive line for a ledge camp, chosen from run state. The cast talks
 * to you like people who want you to make it — because they do.
 */
export function campLine(run, rnd) {
  const f = run.storyFlags || {};
  const lines = [];
  if (f.bird) lines.push('🐦 The ptarmigan is here. It has clearly been waiting. It inspects your camp, approves of nothing, and settles in by the fire like family.');
  if (f.tea) lines.push('🫖 There is a tin cup by the fire ring that was not in your pack this morning. Marta moves fast for her age. It improves the evening enormously.');
  if (f.letter) lines.push('✉️ You think about your line in the letter tin, and the stranger who will read it someday. Write true, climb true.');
  if (f.apprentice) lines.push('🧒 Two ledges down, a headlamp is repeating your route, move for move. The apprentice is climbing again. That one is yours.');
  if (f.emil) lines.push('🗺️ Far below, a small light traces slow circles on a ledge. Emil, charting the night wind. You sleep better knowing the gusts are being taken seriously.');
  if (run.clutch > 0) lines.push('🔥 Your hands have finally stopped shaking from that last pitch. The fire helps. Being alive helps more.');
  if (run.bestStreak >= 8) lines.push('🔥 Somewhere on the wind you would swear you hear Marta: "Eight in a row. Now do it tired." You are tired. You grin anyway.');
  if (run.relics && run.relics.size >= 2) lines.push('🎒 You lay the mountain\u2019s gifts out by the fire and take inventory like a dragon. A small hoard, honestly earned.');
  lines.push('🏕️ The fire cracks. The stars are doing their enormous quiet thing. For one full minute you forget to study, and that is fine too.');
  lines.push('🏕️ Wind on the tent fly, tea going cold too fast, every muscle honest about the day. You would not trade this for a desk. Not tonight.');
  return lines[Math.floor(rnd() * lines.length)];
}

/**
 * The last word on a climb. Reactive to how it actually went — the flags
 * you set, the saves you survived, the promises you made.
 */
export function epilogue(run, kind) {
  const f = run.storyFlags || {};
  if (kind === 'summit') {
    if (f.bell) return 'The bell\u2019s answer reaches you on the summit — one clear note rising through the cloud. You kept your word. The mountain keeps count.';
    if (f.bird) return 'On the summit cairn sits a fat white bird, entirely unimpressed by the view. It waited for you. You split what is left of lunch, as is now tradition.';
    if (f.apprentice) return 'From the top you can see the whole line you climbed — and a small figure on the lower ridge, climbing it after you. Somewhere below, the apprentice found their nerve. Pass it on. That is the whole game.';
    if (f.letter) return 'Standing on top, you finally know what you should have written in the tin. Next climb, you tell yourself. The mountain will hold you to it.';
    if (f.tea) return 'The summit wind smells faintly, impossibly, of Marta\u2019s tea. "Everything good needs a minute," she said. This took considerably more than a minute. Worth it.';
    if ((run.clutch || 0) >= 2) return 'You topped out on fumes and stubbornness, twice nearly nothing left. Those are the summits you remember. Nobody frames a photo of an easy day.';
    return 'The top, at last — wind, light, and the whole world arranged below you like a map of everything you now know. Write it in the ledger. This one is yours.';
  }
  if (f.apprentice) return 'The mountain sent you down today. So it goes. Somewhere below, an apprentice is still climbing because of what you told them — so get up. You have your own advice to follow.';
  if (f.bird) return 'You fell, and a certain fat white bird escorted you partway down, offering no sympathy whatsoever. Eat something. Sleep. The route is not going anywhere, and neither is the bird.';
  if (f.tea) return '"Everyone comes down the mountain," Marta says, pouring without asking. "The good ones come down taking notes." Drink your tea. Read your misses. Go again.';
  return 'The mountain kept this one. Fine — it keeps the first draft of everybody. What you learned on the way down is yours forever, and the route will still be there at first light.';
}

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
    api: { TALES, drawTale, resolveChoice, campLine, epilogue },
    register() {},
  };
}
