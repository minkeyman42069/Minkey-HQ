# edit-encounter

Modify the encounter engine in `index.html`.

## Arguments
`$ARGUMENTS` = what to change

## Process
1. Find encounter loop (RUN, ENC, question grading)
2. Trace `Trail.emit()` calls for hook integration
3. Keep legacy global bridge in `game/bootstrap.js` working
4. Test: `npm run dev` + manual smoke OR `npm run verify:trail`
5. Do NOT break BANK sync or trail-log export
