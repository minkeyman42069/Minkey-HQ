# Minkey-HQ — Game Team Roster

This folder is the staffing plan for the Minkey game. Each file is a **role charter**: a
self-contained brief you can hand to an agent worker (or a human) so they can start
producing immediately without any other context.

## How to spin up a worker

1. Pick a role below and open its charter file.
2. Start a new Cloud Agent on this repository.
3. Paste the matching launch prompt from [`launch-prompts.md`](launch-prompts.md) as the
   agent's first message. The prompt tells the agent to read its charter, `AGENTS.md`,
   and the docs in `docs/` before doing anything.
4. Each worker delivers on its own `cursor/<role>-...` branch and opens a PR. The
   Producer role owns merge order and conflict arbitration.

## Roster

| # | Role | Charter | Owns |
|---|------|---------|------|
| 1 | Producer / Team Lead | [`roles/01-producer.md`](roles/01-producer.md) | Roadmap, backlog, PR merge order, releases |
| 2 | Game Designer | [`roles/02-game-designer.md`](roles/02-game-designer.md) | GDD, mechanics, difficulty, economy/scoring |
| 3 | Gameplay Engineer | [`roles/03-gameplay-engineer.md`](roles/03-gameplay-engineer.md) | `game/js/game.js`, physics, entities, game states |
| 4 | Level Designer | [`roles/04-level-designer.md`](roles/04-level-designer.md) | Level maps, pacing, enemy/banana placement |
| 5 | Art Director | [`roles/05-art-director.md`](roles/05-art-director.md) | Visual style, canvas rendering, palette, animation |
| 6 | Audio Designer | [`roles/06-audio-designer.md`](roles/06-audio-designer.md) | `game/js/audio.js`, SFX, music |
| 7 | UI/UX Designer | [`roles/07-ui-ux-designer.md`](roles/07-ui-ux-designer.md) | HUD, menus, page shell, accessibility, mobile |
| 8 | QA Lead | [`roles/08-qa-lead.md`](roles/08-qa-lead.md) | Test plan, bug triage, regression checklists |

## Working agreements (all roles)

- **One branch, one PR, one concern.** Branch names: `cursor/<role>-<topic>-74a3`.
- **The game must stay playable on every merge to `main`.** If your change breaks the
  loop, fix it before opening the PR.
- **No build step, no dependencies** unless the Producer approves it in writing (an
  accepted backlog item). The game is plain HTML/CSS/JS on purpose.
- **Evidence in every PR**: a screenshot or short recording for anything visible, and a
  note on what you manually tested.
- **Docs move with code.** If you change a mechanic, update `docs/game-design-document.md`
  in the same PR.
- Cross-role requests go through the backlog (`docs/backlog.md`), not ad-hoc edits to
  another role's files.
