# Minkey-HQ — Agent Manual

This repo is the headquarters for **Minkey — Banana Scramble**, a dependency-free
browser platformer, built and maintained by a team of agent workers.

## Start here (by role)
You should have been given a role in your kickoff prompt. Read your charter first:

- Producer → `team/roles/01-producer.md`
- Game Designer → `team/roles/02-game-designer.md`
- Gameplay Engineer → `team/roles/03-gameplay-engineer.md`
- Level Designer → `team/roles/04-level-designer.md`
- Art Director → `team/roles/05-art-director.md`
- Audio Designer → `team/roles/06-audio-designer.md`
- UI/UX Designer → `team/roles/07-ui-ux-designer.md`
- QA Lead → `team/roles/08-qa-lead.md`

If you were not given a role, act as the Producer, and read `team/README.md` for the
working agreements that bind every role.

## Repo map
```
game/            The game. No build step, no dependencies.
  index.html     Page shell + controls hint
  css/style.css  Page styling
  js/game.js     Loop, physics, entities, levels, rendering, HUD
  js/audio.js    WebAudio SFX synth (global `Sfx`)
team/            Role charters + agent launch prompts
docs/            GDD, roadmap, backlog, QA plan, art style guide
```

## Running & testing the game
```bash
python3 -m http.server 8000 --directory game
# open http://localhost:8000
```
Opening `game/index.html` directly also works, but serve it for a faithful test.

- **Always test in a real browser** for changes under `game/`. A full playthrough of all
  levels is the baseline; run the relevant sections of `docs/playtest-qa-plan.md` too.
- There is no automated test suite — the QA checklist is the contract.
- JS syntax can be smoke-checked with `node --check game/js/game.js game/js/audio.js`.

## Hard rules
1. **`main` must always be playable.** Verify a full playthrough before opening a PR.
2. **No dependencies, frameworks, or build steps** without an approved decision item in
   `docs/backlog.md`.
3. **Stay in your lane.** Each charter has a "You own" and "Boundaries" section. Cross-
   role needs become backlog items, not drive-by edits.
4. **Docs move with code.** Mechanics ↔ `docs/game-design-document.md`; visuals ↔
   `docs/art-style-guide.md`; new mechanics ↔ new lines in `docs/playtest-qa-plan.md`.
5. **Tuning values live in two places** (GDD table + constants block in `game.js`) and
   must match.
6. Branches: `cursor/<role-or-topic>-...`; one concern per PR; evidence (screenshot or
   recording) for anything visible.

## Code conventions
- Vanilla ES2020+, IIFE modules, `"use strict"`, 2-space indent.
- Constants SCREAMING_SNAKE_CASE at the top of the file; entities are plain objects.
- Comments explain intent and non-obvious math, not mechanics of the code.

## Cursor Cloud specific instructions
- Serve the game with `python3 -m http.server 8000 --directory game` (Python 3 is
  preinstalled; no npm install is needed — there are no dependencies).
- Use GUI-based manual testing (browser at `http://localhost:8000`) for any change under
  `game/`, and record a demo video of a playthrough for the PR.
