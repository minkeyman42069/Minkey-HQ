/**
 * TRAIL SCHOLAR — TCO domains, Leitner scheduler, mastery tiers, question-type renderers.
 */

export const DOMAINS = {
  A: { n: 'Data Collection & Graphing', pct: 17 },
  B: { n: 'Behavior Assessment', pct: 11 },
  C: { n: 'Behavior Acquisition', pct: 25 },
  D: { n: 'Behavior Reduction', pct: 19 },
  E: { n: 'Documentation & Reporting', pct: 13 },
  F: { n: 'Ethics', pct: 15 },
};

export const DOMAIN_OF = {
  'Continuous Measurement': 'A',
  'Discontinuous Measurement': 'A',
  'Graphing & Data': 'A',
  'Data Collection & Graphing': 'A',
  'Assessment & FBA': 'B',
  'Preference Assessment': 'B',
  'Behavior Assessment': 'B',
  Chaining: 'C',
  'Generalization & Maintenance': 'C',
  Prompting: 'C',
  'Prompting & Fading': 'C',
  Reinforcement: 'C',
  'Reinforcement & Punishment': 'C',
  'Schedules of Reinforcement': 'C',
  Shaping: 'C',
  'Teaching Procedures': 'C',
  'Token Economy': 'C',
  'Verbal Operants': 'C',
  'Motivating Operations': 'C',
  'Behavior Reduction': 'D',
  'Crisis & Emergency': 'D',
  'Differential Reinforcement': 'D',
  Extinction: 'D',
  'Extinction & Replacement': 'D',
  'Functions of Behavior': 'D',
  'Documentation & Reporting': 'E',
  'Ethics & Scope': 'F',
  'Professionalism & Scope': 'F',
};

export function domainOf(q) {
  return q.dom || DOMAIN_OF[q.cat] || 'C';
}

export function weakestDomainLetter(run, bank) {
  const seen = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  const wrong = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  Object.keys(run.prog || {}).forEach((id) => {
    const q = bank[id];
    if (!q) return;
    const d = domainOf(q);
    seen[d] = (seen[d] || 0) + 1;
    wrong[d] += run.prog[id].wrong || 0;
  });
  const order = ['E', 'B', 'A', 'F', 'D', 'C'];
  let pick = 'C';
  let score = -1;
  order.forEach((d) => {
    const s = (wrong[d] || 0) * 3 + Math.max(0, 4 - (seen[d] || 0));
    if (s > score) {
      score = s;
      pick = d;
    }
  });
  return pick;
}

export const TIERS = [
  { name: 'New', c: 'var(--t0)' },
  { name: 'Learning', c: 'var(--t1)' },
  { name: 'Familiar', c: 'var(--t2)' },
  { name: 'Solid', c: 'var(--t3)' },
  { name: 'Mastered', c: 'var(--t4)' },
];

let _rnd = Math.random;
let _isBusy = () => false;

/** Wire RNG and busy guard used by TYPES renderers (matches index.html RUN.busy checks). */
export function configureTypes({ rnd, isBusy }) {
  if (rnd) _rnd = rnd;
  if (isBusy) _isBusy = isBusy;
}

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(_rnd() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export const TYPES = {
  mc: {
    label: '',
    lifeline: true,
    render(q, host, onPick) {
      const opts = q.a.map((t, idx) => ({ t, correct: idx === q.c }));
      const sh = shuffle(opts);
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      host.innerHTML = '';
      function revealAll(chosen) {
        [].slice.call(host.children).forEach((b, k) => {
          b.disabled = true;
          if (sh[k].correct) b.classList.add('correct');
          else if (k === chosen) b.classList.add('wrong');
          else b.classList.add('dim');
        });
      }
      sh.forEach((o, idx) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.innerHTML = '<span class="lx">' + letters[idx] + '</span><span>' + o.t + '</span>';
        b.onclick = function () {
          if (_isBusy()) return;
          revealAll(idx);
          onPick(o.correct, b);
        };
        host.appendChild(b);
      });
      return {
        reveal() {
          revealAll(-1);
        },
        removeWrong() {
          const kids = [].slice.call(host.children);
          for (let k = 0; k < kids.length; k++) {
            if (!sh[k].correct && !kids[k].classList.contains('gone')) {
              kids[k].classList.add('gone');
              return true;
            }
          }
          return false;
        },
      };
    },
  },
};

TYPES.odd = { label: 'Odd one out', lifeline: true, render: TYPES.mc.render };
TYPES.tf = {
  label: 'True or false',
  lifeline: false,
  render(q, host, onPick) {
    host.innerHTML = '';
    const defs = [
      { t: 'True', v: true },
      { t: 'False', v: false },
    ];
    function revealAll(chosen) {
      [].slice.call(host.children).forEach((b, k) => {
        b.disabled = true;
        if (defs[k].v === q.correct) b.classList.add('correct');
        else if (k === chosen) b.classList.add('wrong');
        else b.classList.add('dim');
      });
    }
    defs.forEach((o, idx) => {
      const b = document.createElement('button');
      b.className = 'opt tf';
      b.innerHTML = '<span class="lx">' + (idx === 0 ? 'T' : 'F') + '</span><span>' + o.t + '</span>';
      b.onclick = function () {
        if (_isBusy()) return;
        revealAll(idx);
        onPick(o.v === q.correct, b);
      };
      host.appendChild(b);
    });
    return {
      reveal() {
        revealAll(-1);
      },
      removeWrong() {
        return false;
      },
    };
  },
};

export function createScheduler(config) {
  return {
    pick(ids, last, run, rnd) {
      if (ids.length === 1) return ids[0];
      const recent = run.recent || [];
      let total = 0;
      const w = ids.map((id) => {
        let wt = config.BOX_WEIGHTS[run.prog[id] ? run.prog[id].tier : 0];
        if (id === last) wt = 0;
        else if (recent.indexOf(id) >= 0) wt *= 0.12;
        total += wt;
        return wt;
      });
      if (total <= 0) return ids[Math.floor(rnd() * ids.length)];
      let r = rnd() * total;
      for (let k = 0; k < ids.length; k++) {
        r -= w[k];
        if (r <= 0) return ids[k];
      }
      return ids[ids.length - 1];
    },
    grade(id, correct, viaTimeout, run) {
      const p = run.prog[id] || (run.prog[id] = { tier: 0, seen: 0, right: 0, wrong: 0 });
      p.seen++;
      const lt = config.LOCK_TIER;
      if (correct) {
        p.right++;
        p.tier = Math.min(config.MASTER_TIER, p.tier + 1);
      } else {
        p.wrong++;
        p.tier = viaTimeout ? Math.max(0, p.tier - 1) : Math.max(0, p.tier - 2);
      }
      if (p.tier >= lt) run.locked.add(id);
      else run.locked.delete(id);
      if (p.tier >= config.MASTER_TIER) run.mastered.add(id);
      return p;
    },
  };
}
