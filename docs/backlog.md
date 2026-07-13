# Minkey — Backlog

**Owner:** Producer. One prioritized list; workers pull from the top of their role's
items. Priorities: **P0** = blocks play, **P1** = current milestone, **P2** = later.

Item template:

```
### MK-### — <title>
- Owner: <role> • Priority: P# • Milestone: M#
- Spec: <what to build, with concrete values>
- Acceptance: <how a reviewer verifies it's done>
```

---

### MK-001 — Difficulty review of levels 1–3
- Owner: Game Designer • Priority: P1 • Milestone: M1
- Spec: Play ≥3 full runs; document unfair deaths and dead time per level in the GDD's
  level-intent table. Propose per-level snake speeds if a flat 90 px/s is wrong.
- Acceptance: GDD updated with findings; any tuning changes played through completely.

### MK-002 — Coyote time + jump buffering
- Owner: Gameplay Engineer • Priority: P1 • Milestone: M1
- Spec: Allow a ground jump within 80 ms of walking off a ledge (coyote time). Queue a
  jump input pressed within 100 ms of landing (buffer). Both as constants in the top block.
- Acceptance: Off-ledge jump works when pressed just after leaving a platform; jump
  fires when pressed just before landing. GDD tuning table gains both values.

### MK-003 — Pause menu
- Owner: UI/UX Designer • Priority: P1 • Milestone: M1
- Spec: `P` or `Esc` toggles a PAUSED state during PLAYING: dim overlay, "Resume (P)" and
  "Restart level (R)" options. Timer and all entity updates freeze.
- Acceptance: No entity moves while paused; timer excludes paused duration; controls
  hint footer updated.

### MK-004 — Persistent best score / fastest win
- Owner: UI/UX Designer • Priority: P1 • Milestone: M1
- Spec: On WIN, store best score and fastest completion in `localStorage`
  (`minkey.best`). Title overlay shows "Best: <score> • Fastest: <s>s" when present.
- Acceptance: Survives page reload; absent on first visit; no errors when
  `localStorage` is unavailable.

### MK-005 — "Goal unlocked" audio cue
- Owner: Audio Designer • Priority: P1 • Milestone: M1
- Spec: New `Sfx.goalOpen()` — short rising two-note motif, distinct from banana and
  level-clear sounds — plus a backlog note for the Engineer to call it when the last
  banana is collected.
- Acceptance: Fires exactly once per level, on the final banana; respects mute.

### MK-006 — Background parallax + player idle animation
- Owner: Art Director • Priority: P1 • Milestone: M1
- Spec: 2–3 background layers with subtle differential drift; player breathes/tail-sways
  when idle. No hitbox changes.
- Acceptance: Before/after screenshots; 60 fps maintained; readability unharmed.

### MK-007 — Milestone 1 regression pass
- Owner: QA Lead • Priority: P1 • Milestone: M1
- Spec: Execute full checklist in `docs/playtest-qa-plan.md` on the milestone candidate;
  bug-bash the new features.
- Acceptance: Checklist results posted; all P0/P1 bugs filed; sign-off comment for the
  Producer.

### MK-008 — Levels 4–6
- Owner: Level Designer • Priority: P2 • Milestone: M2
- Spec: Three new levels continuing the curve; level 4 introduces whatever M2 mechanic
  lands first as a "safe classroom".
- Acceptance: Each verified completable (all bananas) with a recording.

### MK-009 — Moving platforms (spec, then build)
- Owner: Game Designer → Gameplay Engineer • Priority: P2 • Milestone: M2
- Spec: Designer writes GDD section (path types, speeds, player-carrying rules), then
  Engineer implements. New tile chars needed — coordinate with Level Designer.
- Acceptance: Player rides platforms without jitter; standing player moves with platform.

### MK-010 — Stomp to defeat snakes
- Owner: Game Designer → Gameplay Engineer • Priority: P2 • Milestone: M2
- Spec: Landing on a snake's top half while falling defeats it (+150 pts, small bounce
  ~55% of jump velocity). Side contact still hurts.
- Acceptance: Stomp is reliable and side-hits still damage; values in GDD.

### MK-011 — Speed bonus scoring
- Owner: Game Designer • Priority: P2 • Milestone: M2
- Spec: On level clear, score += max(0, 300 − elapsed level seconds). Show the bonus on
  the LEVEL_CLEAR overlay.
- Acceptance: Bonus displayed and added correctly; GDD scoring table updated.

### MK-012 — Procedural music loop
- Owner: Audio Designer • Priority: P2 • Milestone: M2
- Spec: Light jungle-flavored loop via WebAudio scheduling; starts with gameplay, stops
  on overlays; respects mute.
- Acceptance: No drift over 5 minutes; mute silences instantly; no autoplay errors.

### MK-013 — Touch controls
- Owner: UI/UX Designer • Priority: P2 • Milestone: M3
- Spec: On-screen left/right/jump zones on touch devices; propose layout before building.
- Acceptance: Full playthrough possible on a touch viewport without keyboard.

### MK-014 — Responsive canvas + reduced motion
- Owner: UI/UX Designer • Priority: P2 • Milestone: M3
- Spec: Canvas scales to viewport preserving aspect; `prefers-reduced-motion` disables
  screen shake and background drift.
- Acceptance: Playable at 360 px-wide viewport; media query verified.

### MK-015 — Static hosting decision + deploy
- Owner: Producer • Priority: P2 • Milestone: M3
- Spec: Decision item weighing GitHub Pages vs. alternatives; then deploy `game/`.
- Acceptance: Public URL plays identically to local.

### MK-016 — Sprite pipeline decision item
- Owner: Art Director • Priority: P2 • Milestone: M3
- Spec: Written pros/cons of introducing image assets vs. staying procedural; Producer
  approves or rejects. Procedural fallback must remain either way.
- Acceptance: Decision recorded here with rationale.
