# Minkey — Art Style Guide

**Owner:** Art Director. Keep this in sync with the draw code in `game/js/game.js` and
`game/css/style.css`.

## Style pillars
1. **Chunky & friendly.** Rounded silhouettes, thick limbs, big readable shapes. No
   sharp realism.
2. **Procedural first.** Everything is canvas paths/arcs/gradients — zero image assets.
   This keeps the game weightless and every visual reviewable as code.
3. **Readability is law.** Player, hazards, pickups, and goal must be identifiable in
   silhouette. Background never competes in contrast with gameplay elements.

## Palette
| Token | Hex | Use |
|-------|-----|-----|
| Canopy green | `#3e8e41` | Ground grass top |
| Leaf light | `#54b25a` | Grass tufts |
| Earth brown | `#6b4226` | Solid ground body |
| Branch brown | `#8a5a2b` / `#a9773f` | One-way platforms |
| Monkey fur | `#8b5a2b` | Player body |
| Monkey skin | `#c49a6c` | Face/belly |
| Banana yellow | `#ffd23f` | Pickups, titles |
| Idol gold | `#e0a72a` | Goal |
| Snake green | `#2e8b57` / `#246b43` | Enemy body/head |
| Danger red | `#e63946` | Snake tongue (hazard accent) |
| Sky | `#7ec8e3 → #b8e0c8 → #dff0d8` | Background gradient, top→bottom |
| Page frame | `#14351f → #08170d` radial | Page background outside canvas |

## Motion language
- **Pickups** bob on a sine (±4 px, ~0.5 Hz) — "alive, take me".
- **Goal** pulses a gold glow — always visible so players can plan routes.
- **Player** run cycle swings legs/tail on `sin(t*14)`; blinks at 5 Hz while invulnerable.
- **Damage** = 0.35 s screen shake (±5 px max). Big feedback, short duration.
- Overlay call-to-action text pulses opacity (~1.4 s period).

## Composition rules
- Background silhouettes at ≤ 45% opacity; vines at ≤ 45% opacity.
- Never place high-contrast decoration within 1 tile of a hazard or pickup.
- Shadows/glows: `shadowBlur` ≤ 18 and only on singular objects (the goal), never on
  per-tile or per-entity loops — frame budget.

## Adding a new entity's look
1. Sketch in code with primitive shapes; get the silhouette right at gameplay zoom first.
2. Check contrast against both sky top and ground colors.
3. Screenshot at 100% and 50% zoom; if it's ambiguous at 50%, simplify.
4. Update the palette table if you introduce a color.
