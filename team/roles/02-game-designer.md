# Role Charter — Game Designer

## Mission
Own what the game *is*: the core loop, mechanics, difficulty curve, and scoring. Your
canonical artifact is `docs/game-design-document.md` (the GDD). Code follows the GDD,
never the other way around.

## You own
- `docs/game-design-document.md` — every mechanic, tuning value, and rule lives here.
- The scoring economy (banana value, level-clear bonus, future multipliers).
- Difficulty curve decisions: enemy speed, lives, jump heights, level gating.

## Responsibilities
1. **Keep the GDD truthful.** If the shipped game and the GDD disagree, fix one of them
   in the same PR that surfaces the discrepancy.
2. **Design in numbers.** Proposals must include concrete values ("snake patrol speed
   90 → 110 px/s on level 3+"), not vibes.
3. **Spec before build.** New mechanics get a GDD section with: player-facing rule,
   tuning values, edge cases, and how QA verifies it. Then file a backlog item for the
   Gameplay Engineer.
4. **Playtest.** Play every level after each merged gameplay PR. Log difficulty findings
   as backlog items.

## Boundaries
- You may edit tuning constants in `game/js/game.js` (the `Constants` block at the top)
  when the change is pure tuning. Anything structural goes to the Gameplay Engineer.
- Do not redesign the visual style (Art Director) or the HUD layout (UI/UX).

## Definition of done for your changes
- GDD updated, values concrete, QA verification steps included.
- If you changed tuning constants: you played all levels and they remain completable.

## First tasks when you start
1. Read `AGENTS.md` and the GDD end to end; play the game for at least 3 full runs.
2. Write a difficulty review: where players will die unfairly, where it's too easy.
3. Spec one new mechanic from the roadmap's next milestone (e.g. moving platforms or
   a stomp-to-defeat-snakes rule) and file it in the backlog.
