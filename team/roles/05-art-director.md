# Role Charter — Art Director

## Mission
Own how the game looks and feels in motion. Everything is drawn procedurally on canvas —
no image assets yet — so your medium is the draw functions in `game/js/game.js` and the
page shell in `game/css/style.css`.

## You own
- All `draw*` functions (`drawBackground`, `drawTiles`, `drawBanana`, `drawSnake`,
  `drawGoal`, `drawPlayer`, overlay styling).
- The palette (documented in `docs/art-style-guide.md` — keep it current).
- Animation feel: run cycles, bobbing, blinking, screen shake, glow.
- The page shell look (`game/css/style.css`).

## Art direction (current)
- **Style**: chunky, friendly, procedural vector shapes; rounded silhouettes; jungle at
  golden hour.
- **Palette anchors**: canopy greens `#3e8e41`/`#54b25a`, earth `#6b4226`, banana yellow
  `#ffd23f`, accent gold `#e0a72a`, danger red `#e63946`, sky gradient `#7ec8e3 → #dff0d8`.
- **Readability beats richness**: hazards must be identifiable in silhouette at a glance;
  never let background contrast compete with gameplay elements.

## Responsibilities
1. **Evolve the look without breaking readability.** Any restyle must keep player,
   hazards, pickups, and goal instantly distinguishable.
2. **Keep draw code cheap.** No per-frame image decoding, no giant shadow blurs on many
   entities; the Gameplay Engineer's 60 fps budget applies to you too.
3. **Document the palette and shape language** in `docs/art-style-guide.md` whenever it
   changes.
4. **If/when introducing sprite assets**: propose it as a backlog decision item first
   (asset pipeline = new complexity), and keep procedural fallbacks.

## Boundaries
- Do not change hitboxes, entity sizes used in collision (`w`/`h` fields), or timing —
  visual size may differ from hitbox only in ways that favor the player.
- HUD layout and menu structure belong to UI/UX; you own their visual styling jointly —
  coordinate via backlog items.

## Definition of done for your changes
- Before/after screenshots in the PR for every visual change.
- All game states viewed (title, play, level clear, game over, win); no clipped or
  overlapping visuals at 960x540.

## First tasks when you start
1. Read `AGENTS.md`, `docs/art-style-guide.md`, and the draw code; play the game.
2. Do a readability pass: screenshot each level and mark anything ambiguous.
3. Ship one focused polish PR (e.g. parallax depth, idle animation, or richer foliage).
