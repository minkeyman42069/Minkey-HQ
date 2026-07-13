# Minkey HQ 🐵

**Minkey HQ** is a browser-based, turn-based team-battle game. You run the
headquarters of an elite squad of monkey secret agents — the *Minkeys*.
Assemble a team of three from the full roster, deploy across four escalating
missions, and take down crime lord **Baron Von Grubb** to secure the jungle.

This repo contains the whole game **and the entire team**: a complete roster of
fully-specified agents (stats, roles, signature abilities, and lore), a
turn-based combat engine, a polished HQ + battle UI, and an in-game Field
Manual with everything you need to play.

---

## Quick start

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
```

Then open the printed URL in your browser.

### Other scripts

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build
```

Requires Node 18+ (developed on Node 22).

---

## How to play

1. **Build your squad** — on the HQ screen, add any **3** agents to your Active
   Squad. Tap a filled slot to remove an agent.
2. **Pick a mission** — missions unlock in order. Clear one to open the next.
3. **Fight** — on each of your agents' turns, choose **Attack** or their
   **signature ability**, then pick a target. Enemies act automatically.
4. **Win the campaign** — defeat Baron Von Grubb in Mission 4.

Your squad and campaign progress are saved automatically in your browser
(`localStorage`). Use **Reset progress** on the HQ screen to start over.

The in-game **Field Manual** (top-right nav) contains the full rulebook, role
guide, per-agent tips, squad-building advice, and an FAQ.

---

## The team

A full roster of 12 agents across 6 roles:

| Role      | What they do                                                |
| --------- | ----------------------------------------------------------- |
| Vanguard  | Front-line tanks that soak damage and shield the squad.     |
| Striker   | High single-target damage — end fights fast.                |
| Sniper    | Ranged specialists with armor-piercing critical hits.       |
| Medic     | Keep the team alive with heals and cleanses.                |
| Trickster | Debuff, weaken, poison, and disrupt the enemy.              |
| Support   | Buff allies and bend the battle with utility.               |

The canonical roster lives in [`src/data/roster.js`](src/data/roster.js) — each
agent has stats (`hp`, `atk`, `def`, `spd`), a signature ability, a bio, and a
catchphrase. Enemy squads and the campaign live in
[`src/data/enemies.js`](src/data/enemies.js).

---

## Combat rules

- **Turn order** is decided by `SPD` each round; faster agents act first (your
  squad wins ties).
- **Damage** = attacker `ATK` (with buffs) minus target `DEF`; a minimum of 1
  damage always lands.
- **Critical hits** deal ~80% extra damage and ignore half of `DEF`. Basic
  attacks crit ~12% of the time; some abilities always crit.
- **Barriers (🛡️)** absorb damage before HP is touched.
- **Poison (☠️)** ticks damage at the end of each round and lowers `DEF`.
- **Buffs / debuffs** raise or lower `ATK` for a few rounds.
- **AoE** abilities hit every enemy; heals and team buffs affect the whole squad.

---

## Project structure

```
index.html            # app shell
src/
  main.js             # entry + in-memory screen router
  state.js            # squad + campaign progress (localStorage)
  styles.css          # all styling (dark "jungle ops" theme)
  data/
    roster.js         # THE TEAM — full agent roster + roles
    enemies.js        # enemy squads + campaign missions
  game/
    battle.js         # turn-based combat engine (side-agnostic)
  ui/
    dom.js            # tiny DOM helpers
    hq.js             # HQ: squad select, roster, missions
    battle.js         # interactive battle screen
    help.js           # Field Manual
```

The battle engine treats both teams as identical "combatants", so every rule
applies symmetrically. There is no framework dependency — just Vite for the dev
server and bundling.

---

## Extending the team

Add a new agent by appending an object to `ROSTER` in
[`src/data/roster.js`](src/data/roster.js). Give it a unique `id`, a `role` from
`ROLES`, stats, and an `ability` whose `type` is handled in
`resolveAbility()` inside [`src/game/battle.js`](src/game/battle.js)
(`damage`, `crit`, `aoe`, `poison`, `debuff`, `shield`, `heal`, `healAll`,
`buff`, `hasteBuff`). It will automatically appear in the roster, squad picker,
and Field Manual.

---

## License

MIT.
