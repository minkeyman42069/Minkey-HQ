# Minkey-HQ

Headquarters for **Minkey — Banana Scramble**: a dependency-free browser platformer,
built and run by a full agent-worker team.

<p align="center"><i>Guide Minkey the monkey through the jungle — grab every banana,
dodge the snakes, and reach the golden idol.</i></p>

## Play it

```bash
python3 -m http.server 8000 --directory game
# open http://localhost:8000
```

No install, no build. Controls: **←/→** (or A/D) move, **Space/W/↑** jump — press again
mid-air to double jump, **Enter** start/restart, **M** mute.

## The team

This repo ships with a complete, ready-to-run staffing plan for agent workers:

- **[`team/README.md`](team/README.md)** — roster, working agreements, how to dispatch.
- **[`team/roles/`](team/roles/)** — 8 role charters (Producer, Game Designer, Gameplay
  Engineer, Level Designer, Art Director, Audio Designer, UI/UX, QA). Each is a
  self-contained brief: mission, ownership, boundaries, definition of done, first tasks.
- **[`team/launch-prompts.md`](team/launch-prompts.md)** — copy-paste kickoff prompts to
  spin up each role as a Cloud Agent.

## The paper trail

- [`docs/game-design-document.md`](docs/game-design-document.md) — canonical mechanics & tuning.
- [`docs/roadmap.md`](docs/roadmap.md) — milestones v0.2 → v0.4.
- [`docs/backlog.md`](docs/backlog.md) — 16 groomed, prioritized work items (MK-001…016).
- [`docs/playtest-qa-plan.md`](docs/playtest-qa-plan.md) — regression checklist & bug template.
- [`docs/art-style-guide.md`](docs/art-style-guide.md) — palette, motion language, composition rules.
- [`AGENTS.md`](AGENTS.md) — the manual every agent reads first.

## Repo layout

```
game/   the playable game (HTML/CSS/JS, zero dependencies)
team/   role charters + launch prompts for agent workers
docs/   GDD, roadmap, backlog, QA plan, art guide
```
