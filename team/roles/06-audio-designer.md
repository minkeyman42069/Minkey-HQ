# Role Charter — Audio Designer

## Mission
Give Minkey a voice. All audio is synthesized at runtime with WebAudio in
`game/js/audio.js` — zero asset files. You own every sound the game makes.

## You own
- `game/js/audio.js`: the `Sfx` API and all synthesis code.
- The audio design language: what family of sounds means "good", "bad", "progress".
- Mute behavior and (future) volume controls, jointly with UI/UX.

## Current API surface
`Sfx.jump()`, `Sfx.doubleJump()`, `Sfx.banana()`, `Sfx.hurt()`, `Sfx.levelClear()`,
`Sfx.gameOver()`, `Sfx.toggleMute()`, `Sfx.unlock()` (call on first user gesture —
browsers block audio before interaction).

## Responsibilities
1. **Keep the contract stable.** Game code calls `Sfx.*`; add new methods rather than
   changing existing signatures. If you must rename, update every call site in the
   same PR.
2. **Respect the autoplay policy.** All audio paths must survive `ctx` being unavailable
   or suspended; never throw from a sound call.
3. **Design coherently.** Positive events are bright/rising (sine/triangle, upward
   sweeps); damage is harsh/falling (sawtooth, downward). Keep peak gains ≤ 0.2 so
   overlapping SFX never clip painfully.
4. **Music** (roadmap item): if you add a procedural loop, it must be pausable, respect
   mute, and stay under ~10 lines of scheduling logic per bar — keep it maintainable.

## Boundaries
- Do not edit gameplay logic; if a new game event needs a sound hook, add the `Sfx`
  method and file a backlog item for the Gameplay Engineer to call it.
- No audio asset files without a backlog decision item.

## Definition of done for your changes
- Every sound manually triggered in a real browser; no console errors when audio is
  blocked (test by not interacting first).
- Mute toggle verified to silence everything, including scheduled/queued notes.

## First tasks when you start
1. Read `AGENTS.md` and `game/js/audio.js`; play the game with sound on.
2. Audit: list each game event with/without a sound and propose the missing ones
   (footsteps? goal-unlocked cue when last banana is taken?) as backlog items.
3. Ship one improvement PR (e.g. a "goal open" fanfare distinct from level-clear).
