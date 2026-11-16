# Wick

A one-touch swing through a dark cave. Hold to cast a line at a crystal, let go to fly.
**Your speed is your light**: the faster you move, the farther you see, and you can only
catch anchors inside your light. Slow down and you go blind.

- One file, no assets. Every visual and sound is generated in code (Canvas 2D + Web Audio).
- **Today's cave** is seeded by the date, so everyone swings the same cave each day.
- Your best run of the day comes back as a ghost to race.
- The result card copies a share grid: one moon per 100 m showing how bright you burned.

Play: open `index.html`, or `/labs/wick/` on the GitHub Pages site.

## Fairness bench

`node labs/wick/bench.cjs` runs a four-line bot headless through 12 caves (today's plus 11
random). It is the tuning gate: a sloppy bot should get far but die often, from both ceiling
and floor. At the time of writing it reaches 270 m to about 2,000 m.
