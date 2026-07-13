# Minkey — Banana Scramble: Game Design Document

**Owner:** Game Designer • **Status:** v0.1 (matches prototype on `main`)

## 1. Pitch
A snappy single-screen jungle platformer. You are **Minkey**, a monkey who must collect
every banana on the screen, dodge patrolling snakes, and reach the golden idol to clear
each level. Three levels, three lives, one high score.

## 2. Core loop
1. Read the level: spot bananas, snakes, pits, and the idol.
2. Route through platforms using jump + double jump.
3. Collect all bananas → the goal "opens" (HUD banner prompts the player).
4. Touch the idol → level clear bonus → next level.
5. Lose all lives → game over → restart from level 1.

## 3. Controls
| Input | Action |
|-------|--------|
| ← / → or A / D | Move left/right (instant, no acceleration) |
| Space / W / ↑ | Jump; press again mid-air for one double jump |
| Enter | Start / restart from title, game-over, win screens |
| M | Toggle mute |

## 4. Mechanics & tuning (canonical values)
These mirror the constants block in `game/js/game.js`. If you change one, change both.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Canvas | 960x540 | 24x13 grid of 40 px tiles (bottom row partially off-canvas) |
| Gravity | 2200 px/s² | |
| Move speed | 340 px/s | Constant; no momentum |
| Jump velocity | 780 px/s | ~2 tiles of height |
| Double jump | 92% of jump velocity | One per airtime; restored on landing |
| Max fall speed | 1200 px/s | |
| Snake patrol speed | 90 px/s | Patrols contiguous floor, reverses at edges |
| Lives | 3 | Lost on snake touch or falling into a pit |
| Invulnerability after hit | 1.5 s | Player blinks; snakes can't re-hit |
| dt clamp | 1/30 s | Prevents tunnelling after tab-switch |

## 5. Scoring
| Event | Points |
|-------|--------|
| Banana | 100 |
| Level clear (touch idol) | 500 |

Timer is displayed but not yet scored — a speed bonus is a roadmap candidate (MK-011).

## 6. Entities
- **Minkey (player):** 30x36 px hitbox. Respawns at level spawn on death (bananas
  already collected stay collected).
- **Banana:** 24x24 px pickup hitbox, bobbing idle animation. All must be collected to
  enable the goal.
- **Snake:** 38x22 px, patrols the contiguous run of floor tiles it spawns on.
  Contact damage only; cannot be defeated (stomp mechanic is a roadmap candidate MK-010).
- **Golden idol (goal):** 34x46 px. Inert until all bananas collected; glows always
  (readability trade-off accepted for v0.1).

## 7. Level design intent
| # | Name | Teaches / tests |
|---|------|-----------------|
| 1 | Canopy Basics | Movement, jumping, one pit, one slow hazard |
| 2 | Snake Alley | Multiple snakes, more pits, routing choices |
| 3 | Idol Ascent | Vertical climb, double-jump mastery, hazard timing |

Full tile-format rules live in `team/roles/04-level-designer.md`.

## 8. Game states
`TITLE → PLAYING ⇄ (hurt/respawn) → LEVEL_CLEAR (1.6 s) → next level … → WIN`
`PLAYING → GAME_OVER` when lives reach 0. Enter restarts from TITLE, GAME_OVER, or WIN.

## 9. Audio design language
Positive = bright, rising (sine/triangle sweeps). Negative = harsh, falling (sawtooth).
Jingles (level clear, game over) are short arpeggios. See `game/js/audio.js`.

## 10. Out of scope for v0.1 (see roadmap)
Scrolling levels, save games, touch controls, sprite art, music loop, more enemy types,
power-ups, speedrun bonus.

## 11. QA verification anchors
Each mechanic above maps to checklist lines in `docs/playtest-qa-plan.md`. New mechanics
must ship with new checklist lines.
