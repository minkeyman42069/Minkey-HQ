/**
 * SUMMIT SAGE — study coach & analytics. Pure functions over a run's progress
 * and the question bank: domain readiness, mastery, and what to review next.
 * No bus mutation; safe to call any time from UI, sandbox, or debrief.
 */

import { DOMAINS, domainOf } from './trail-scholar.js';

function emptyTally() {
  return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
}

export function createSummitSage() {
  const api = {
    domains: DOMAINS,

    /** Per-domain seen / right / wrong / board-ready / mastered / accuracy. */
    domainBreakdown(run, bank, config) {
      const lock = (config && config.LOCK_TIER) || 3;
      const master = (config && config.MASTER_TIER) || 4;
      const seen = emptyTally();
      const right = emptyTally();
      const wrong = emptyTally();
      const ready = emptyTally();
      const mastered = emptyTally();
      const total = emptyTally();

      (bank || []).forEach((q, i) => {
        const d = domainOf(q);
        if (total[d] == null) return;
        total[d]++;
        const p = run.prog && run.prog[q.id != null ? q.id : i];
        if (!p) return;
        seen[d] += p.seen ? 1 : 0;
        right[d] += p.right || 0;
        wrong[d] += p.wrong || 0;
        if (p.tier >= lock) ready[d]++;
        if (p.tier >= master) mastered[d]++;
      });

      return Object.keys(DOMAINS).map((d) => {
        const attempts = right[d] + wrong[d];
        return {
          domain: d,
          name: DOMAINS[d].n,
          weight: DOMAINS[d].pct,
          total: total[d],
          seen: seen[d],
          ready: ready[d],
          mastered: mastered[d],
          accuracy: attempts ? Math.round((right[d] / attempts) * 100) : null,
          readyPct: total[d] ? Math.round((ready[d] / total[d]) * 100) : 0,
        };
      });
    },

    /** Overall board readiness: concepts at/above lock tier. */
    readiness(run, bank, config) {
      const lock = (config && config.LOCK_TIER) || 3;
      let ready = 0;
      let mastered = 0;
      const master = (config && config.MASTER_TIER) || 4;
      const total = (bank || []).length;
      (bank || []).forEach((q, i) => {
        const p = run.prog && run.prog[q.id != null ? q.id : i];
        if (!p) return;
        if (p.tier >= lock) ready++;
        if (p.tier >= master) mastered++;
      });
      return {
        ready,
        mastered,
        total,
        readyPct: total ? Math.round((ready / total) * 100) : 0,
      };
    },

    /** Lowest-tier, most-missed concepts to review next. */
    nextReview(run, bank, n = 8) {
      const scored = [];
      (bank || []).forEach((q, i) => {
        const id = q.id != null ? q.id : i;
        const p = run.prog && run.prog[id];
        if (!p || !p.seen) return;
        const score = p.tier * 10 - (p.wrong || 0) * 5;
        scored.push({ id, cat: q.cat, domain: domainOf(q), tier: p.tier, wrong: p.wrong || 0, score });
      });
      return scored.sort((a, b) => a.score - b.score).slice(0, n);
    },

    /** Human-readable coaching tips from the breakdown. */
    recommend(run, bank, config) {
      const rows = api.domainBreakdown(run, bank, config).slice();
      const tips = [];
      const weakest = rows
        .filter((r) => r.total > 0)
        .sort((a, b) => a.readyPct - b.readyPct)[0];
      if (weakest) {
        tips.push(
          'Focus Domain ' + weakest.domain + ' (' + weakest.name + ') — ' +
            weakest.ready + '/' + weakest.total + ' board-ready (' + weakest.readyPct + '%).',
        );
      }
      const shaky = rows.filter((r) => r.accuracy != null && r.accuracy < 70);
      shaky.forEach((r) => {
        tips.push('Accuracy dip in ' + r.name + ': ' + r.accuracy + '% correct so far.');
      });
      const due = api.nextReview(run, bank, 100).filter((x) => x.tier < ((config && config.LOCK_TIER) || 3));
      if (due.length) tips.push(due.length + ' concept' + (due.length === 1 ? '' : 's') + ' still below board-ready.');
      if (!tips.length) tips.push('Strong footing across every domain — press for the summit.');
      return tips;
    },
  };

  return {
    id: 'summit-sage',
    name: 'Summit Sage',
    role: 'Study coach — domain readiness, mastery analytics, review planning',
    api,
    register() {},
  };
}
