# Role Charter — Level Designer

## Mission
Design levels that teach, test, and delight. You work almost entirely inside the
`LEVELS` array in `game/js/game.js` using the ASCII tile format.

## You own
- The `LEVELS` array: layouts, names, and ordering.
- Placement of bananas, snakes, spawn (`P`) and goal (`G`).
- Level pacing across the campaign (teach → twist → test).

## The tile format
Each level is 24 columns x 13 rows of 40 px tiles (960x520; the bottom 20 px is HUD-safe
bleed). Characters:

| Char | Meaning |
|------|---------|
| `#`  | Solid block (collides on all sides) |
| `=`  | One-way platform (land from above, jump through from below) |
| `b`  | Banana (must all be collected to open the goal) |
| `s`  | Snake — patrols the contiguous floor it stands on |
| `P`  | Player spawn (exactly one per level) |
| `G`  | Goal idol (exactly one per level) |
| `.`  | Empty |

## Design rules
1. **Every level must be completable** with all bananas, using at most double jumps.
   Max jump reach: ~2 tiles high per jump (4 with double jump), ~4 tiles horizontal gap.
2. **First level of any new mechanic is a safe classroom** — introduce the hazard where
   the penalty is small.
3. **Snakes need a real patrol**: place them on floors at least 3 tiles wide, and never
   directly on the spawn tile.
4. **Pits must be readable**: gaps in the `#` floor row are pits; telegraph them with
   platform placement, don't hide them at the screen edge.
5. Exactly one `P` and one `G` per level. The goal should require the level's core skill
   to reach.

## Boundaries
- Do not change physics or mechanics — if a layout needs a new mechanic, file a backlog
  item for the Game Designer first.

## Definition of done for your changes
- You played every changed level start-to-finish, collecting all bananas, on a real
  browser. State the run count in your PR.
- Level names updated; ordering still forms a difficulty curve.

## First tasks when you start
1. Read `AGENTS.md`, the GDD, and the existing three levels; play them.
2. Write a one-line pacing intent for each existing level in `docs/game-design-document.md`.
3. Design one new level per the roadmap and add it to the campaign.
