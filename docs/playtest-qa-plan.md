# Minkey — Playtest & QA Plan

**Owner:** QA Lead. Run the regression checklist against every PR touching `game/`, and
in full before any release tag.

## Environment
1. From the repo root: `python3 -m http.server 8000 --directory game`
2. Open `http://localhost:8000` in Chrome (reference browser). Keep DevTools console
   open — **any uncaught error during the run is an automatic P0.**

## Regression checklist (v0.1 scope)

### Boot & title
- [ ] Page loads with title overlay ("MINKEY", instructions, pulsing "Press ENTER").
- [ ] Controls hint footer visible under the canvas.
- [ ] No console errors on load; no audio plays before first interaction.

### Core movement
- [ ] ←/→ and A/D both move; player faces movement direction.
- [ ] Space, W, and ↑ all jump; holding jump does not auto-repeat jumps.
- [ ] Double jump: exactly one extra jump per airtime; restored on any landing.
- [ ] Player cannot leave the screen horizontally.
- [ ] One-way platforms (`=`): land from above, pass through when jumping from below.
- [ ] Solid blocks (`#`) collide on all sides (test head bonk under a block).

### Hazards & lives
- [ ] Touching a snake costs a life, triggers screen shake + hurt sound, respawns player
      at spawn with ~1.5 s blinking invulnerability.
- [ ] During invulnerability, snake contact does nothing.
- [ ] Falling into a pit costs a life and respawns (or game-overs at 0 lives).
- [ ] Collected bananas stay collected after a death within the same level.
- [ ] Third life lost → GAME OVER overlay with final score; Enter restarts fresh
      (score 0, lives 3, level 1).

### Pickups & goal
- [ ] Each banana collects on touch: +100 score, sound, counter updates.
- [ ] Idol does nothing while bananas remain.
- [ ] On last banana: "reach the golden idol" banner appears.
- [ ] Touching idol with all bananas: +500, LEVEL CLEAR overlay, jingle, auto-advance
      after ~1.6 s.
- [ ] Clearing level 3 shows WIN overlay with time and score; Enter restarts.

### Levels
- [ ] Level 1, 2, 3 each completable with all bananas (full playthrough).
- [ ] Every snake patrols and reverses at its floor edges; none walk off ledges or
      through walls.

### HUD & audio
- [ ] HUD shows score, banana x/y, hearts, timer, level name — all update live.
- [ ] M toggles mute; mute icon appears; all sounds (including jingles) silenced.
- [ ] Sounds map correctly: jump / double jump / banana / hurt / level clear / game over.

### Robustness (exploratory)
- [ ] Hold ← and → together: no jitter or error.
- [ ] Spam Enter on every overlay: no double-starts or state corruption.
- [ ] Switch tabs mid-jump for 5+ s, return: player has not tunnelled through the floor
      (dt clamp) and game continues normally.
- [ ] Jump at the exact lip of a platform repeatedly: no snag-through.
- [ ] Resize the browser window: canvas scales, game keeps running.

## Bug report template
File in `docs/backlog.md` as:

```
### MK-BUG-### — <one-line summary>
- Owner: <role that owns the fix> • Priority: P0/P1/P2 • Found on: <commit/branch>
- Steps: 1) … 2) … 3) …
- Expected: … / Actual: …
- Level & location: <level #, approx tile position> • Browser: <name + version>
- Evidence: <screenshot/recording path>
```

## Playtest script (feel, not bugs)
Once per milestone, do a "fresh eyes" run and answer in your PR:
1. Where did you die first, and did it feel fair?
2. Was any banana's route unclear for more than ~5 seconds?
3. Did any level drag? Which 10 seconds would you cut?
4. Does anything in the HUD go unread? What's missing?
