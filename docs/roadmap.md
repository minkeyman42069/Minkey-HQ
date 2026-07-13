# Minkey — Roadmap

**Owner:** Producer

## Status
- **Shipped:** v0.1 playable prototype — 3 levels, full loop (title → play → clear →
  win/game-over), synthesized SFX, HUD, double jump, snakes, pits.
- **Next:** Milestone 1 (Polish & Fairness).
- **At risk:** nothing yet.

## Milestone 1 — Polish & Fairness (target: v0.2)
Goal: the prototype feels *fair* and *finished* at its current scope.
- MK-001 (Design) Difficulty review of all 3 levels; retune snake speed per level if needed.
- MK-002 (Engine) Coyote time (~80 ms) and jump buffering (~100 ms) for fairer jumps.
- MK-003 (UI/UX) Pause on `P`/`Esc` with resume/restart options.
- MK-004 (UI/UX) Best score + fastest time persisted in `localStorage`, shown on title.
- MK-005 (Audio) "Goal unlocked" cue when the last banana is collected.
- MK-006 (Art) Parallax background layers + player idle animation.
- MK-007 (QA) Full regression pass and bug bash on the above.

## Milestone 2 — More Game (target: v0.3)
Goal: double the content and add one new mechanic.
- MK-008 (Levels) Three new levels (4–6) continuing the difficulty curve.
- MK-009 (Design→Engine) Moving platforms: spec, then implement.
- MK-010 (Design→Engine) Stomp-to-defeat snakes (+150 points), with bounce.
- MK-011 (Design) Speed bonus: score += max(0, 300 − seconds) per level.
- MK-012 (Audio) Procedural background music loop, mute-aware.

## Milestone 3 — Reach (target: v0.4)
Goal: playable by more people in more places.
- MK-013 (UI/UX) Touch controls for mobile.
- MK-014 (UI/UX) Responsive canvas scaling with `prefers-reduced-motion` support.
- MK-015 (Producer) Deploy to static hosting (GitHub Pages) with a decision item first.
- MK-016 (Art) Optional sprite-sheet pipeline decision item (procedural fallback stays).

## Release process
1. All milestone items merged and QA (MK-x07-style pass) signed off.
2. Producer tags `v0.x` on `main` and updates the Status section above.
