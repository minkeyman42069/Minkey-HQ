const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:720}});
  await p.goto('file://' + require("path").resolve(__dirname,"index.html")); await p.waitForTimeout(500);
  const res = await p.evaluate(async () => {
    const w = window.__wick, out=[];
    for (let run=0; run<12; run++){
      w.start(run===0);
      // drive the sim directly, 120 steps per simulated second, no rendering
      let t=0;
      while(!w.S.dead && t<240){
        const {P,S}=w;
        if(!P.rope){ const a=w.pickAnchor(); w.setHeld(!!a && P.vy>-150); }
        else { const past=P.x-P.rope.x; w.setHeld(!(past>P.L*0.42 && P.vy<-40)); }
        w.step(1/120); t+=1/120;
      }
      const [tp,bt]=w.bounds(w.P.x); const cause = w.P.y-tp < bt-w.P.y ? 'ceiling':'floor';
      out.push({m:w.meters(), t:+t.toFixed(1), cause: w.S.dead?cause:'alive', chain:w.S.bestChain});
    }
    return out;
  });
  console.table(res); await b.close();
})();
