/**
 * BACB-aligned question quality rubric for RBT exam prep.
 * Mirrors retired BACB item patterns: scenario stem, 4 options, one best answer.
 */
import { domainOf } from './load-bank.mjs';

const INFORMAL = /\b(kid|gonna|stuff|basically|messy|kinda|sorta)\b/i;
const SCENARIO_MARKERS =
  /\b(RBT|client|learner|student|caregiver|BCBA|session|during|recorded|instructed|observed|supervisor|parent|teacher)\b/i;
const DEFINITION_PATTERNS = [
  /^something is (added|removed)/i,
  /^reinforcement (delivered|after)/i,
  /^which of these is\b/i,
  /^the (purpose|time|total|defining)/i,
  /^simply counting/i,
  /^recording (every|behavior)/i,
  /^an operation that makes/i,
  /^anything that changes/i,
  /^providing reinforcement when/i,
  /^reinforcing (a|the|steps)/i,
  /^teaching the (first|last|whole)/i,
  /^breaking a multi/i,
  /^identifying reinforcers/i,
  /^presenting (one|two|stimuli)/i,
  /^a structured method/i,
  /^reinforcement always/i,
  /^what decides whether/i,
  /^in (an mswo|a free)/i,
];

const TERM_FIXES = {
  access: 'access to tangibles',
  escape: 'escape/avoidance',
};

export function scoreQuestion(q, ctx = {}) {
  const flags = [];
  const type = q.type || 'mc';
  const text = `${q.q} ${q.e || ''}`;
  let score = 0;

  // --- Stem context (0-25) ---
  const hasScenario = SCENARIO_MARKERS.test(q.q);
  const isDefOnly = type === 'mc' && DEFINITION_PATTERNS.some((p) => p.test(q.q));
  if (hasScenario) score += 25;
  else if (q.q.length > 100) score += 15;
  else if (type === 'odd' || type === 'tf') score += 18;
  else {
    score += 5;
    if (isDefOnly) flags.push('DEFINITION_ONLY');
  }
  if (!hasScenario && q.q.length < 70 && type === 'mc') flags.push('THIN_STEM');

  // --- Options (0-25) ---
  if (type === 'tf') {
    score += 20;
  } else if (Array.isArray(q.a)) {
    if (q.a.length === 4) score += 25;
    else {
      flags.push('WRONG_OPTION_COUNT');
      score += q.a.length === 5 ? 15 : 5;
    }
    const uniq = new Set(q.a.map((x) => x.toLowerCase().trim()));
    if (uniq.size !== q.a.length) flags.push('DUPLICATE_OPTIONS');
    const correct = q.a[q.c] || '';
    const others = q.a.filter((_, i) => i !== q.c);
    if (correct.length > Math.max(...others.map((o) => o.length)) * 1.5) flags.push('ANSWER_LEAK');
  }

  // --- Distractor plausibility heuristic (0-20) ---
  if (type === 'mc' && q.a?.length === 4) {
    const lens = q.a.map((x) => x.length);
    const spread = Math.max(...lens) - Math.min(...lens);
    if (spread < 40) score += 20;
    else if (spread < 80) score += 12;
    else flags.push('UNBALANCED_OPTIONS');
  } else if (type === 'tf') score += 18;

  // --- Explanation teaches (0-20) ---
  const expl = (q.e || '').replace(/<[^>]+>/g, '');
  if (expl.length >= 80) score += 20;
  else if (expl.length >= 45) score += 12;
  else flags.push('WEAK_EXPLANATION');
  if (!/\b(not|because|defined|means|incorrect|false)\b/i.test(expl) && type === 'mc') {
    flags.push('EXPLANATION_NO_CONTRAST');
  }

  // --- Terminology (0-10) ---
  if (INFORMAL.test(text)) flags.push('INFORMAL_LANGUAGE');
  else score += 5;
  if (type === 'mc' && q.a?.includes('Access') && q.c === q.a.indexOf('Access')) {
    // acceptable shorthand in options but flag for review
  }
  if (/\bSR\+|SP\+|SR-|SP-\b/.test(expl)) score += 5;
  else if (/\bpositive reinforcement|negative punishment\b/i.test(expl)) score += 5;
  else score += 3;

  // --- Metadata (0-10) ---
  if (q.dom || domainOf(q)) score += 5;
  else flags.push('MISSING_DOM');
  if (q.task) score += 5;
  else score += 3;

  // --- Duplicate detection ---
  const stemKey = q.q.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 72);
  if (ctx.stemIndex?.get(stemKey)?.length > 1) flags.push('DUPLICATE_STEM');

  const quality = Math.min(100, score);
  const grade = quality >= 85 ? 'A' : quality >= 70 ? 'B' : quality >= 55 ? 'C' : quality >= 40 ? 'D' : 'F';

  return { id: q.id, quality, grade, flags: [...new Set(flags)] };
}

export function auditBank(bank) {
  const stemIndex = new Map();
  bank.forEach((q) => {
    const k = q.q.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 72);
    if (!stemIndex.has(k)) stemIndex.set(k, []);
    stemIndex.get(k).push(q.id);
  });

  const results = bank.map((q) => {
    const scored = scoreQuestion(q, { stemIndex });
    return {
      ...scored,
      cat: q.cat,
      dom: domainOf(q),
      type: q.type || 'mc',
      q: q.q,
      preview: q.q.slice(0, 90),
    };
  });

  const summary = {
    total: bank.length,
    avgQuality: Math.round(results.reduce((s, r) => s + r.quality, 0) / results.length),
    grades: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    flagCounts: {},
    needsWork: results.filter((r) => r.quality < 70 || r.flags.length > 0),
  };
  results.forEach((r) => {
    summary.grades[r.grade]++;
    r.flags.forEach((f) => {
      summary.flagCounts[f] = (summary.flagCounts[f] || 0) + 1;
    });
  });

  return { results, summary };
}

export const BACB_SAMPLES = [
  {
    cat: 'Data Collection & Graphing',
    dom: 'A',
    task: 'A.2',
    q: 'An RBT is recording data on how often a client engages in aggression. The client engaged in 15 occurrences of aggression during the 90-minute session. What should the RBT record as the response rate per hour for aggression in that session?',
    a: ['5 per hour', '10 per hour', '15 per hour', '25 per hour'],
    c: 1,
    e: 'Rate standardizes count by time. <b>15 ÷ 1.5 hours = 10 per hour.</b> Always match the unit in the question (here, per hour).',
    source: 'BACB RBT Handbook — retired sample 1',
  },
  {
    cat: 'Ethics & Scope',
    dom: 'F',
    task: 'F.5',
    q: "While out to dinner, an RBT's friend asks whether a child at their church is the RBT's client and uses ABA services. What is the BEST response?",
    a: [
      'Confirm the child is a client but decline to share treatment details',
      'Tell the friend you work with the child and ask them not to tell anyone',
      'Say you cannot discuss the child but you can share information about the family',
      'Decline to confirm or deny whether the person is a client, citing confidentiality',
    ],
    c: 3,
    e: '<b>Best practice:</b> do not confirm or deny client status (HIPAA/confidentiality). Option A still confirms client status; D protects privacy without disclosure.',
    source: 'BACB RBT Handbook — retired sample 2',
  },
  {
    cat: 'Differential Reinforcement',
    dom: 'D',
    task: 'D.2',
    q: 'An RBT is instructed to deliver a reinforcer every time a student raises their hand and to ignore shouting out. Which differential reinforcement procedure is being implemented?',
    a: ['DRO', 'DRA', 'DRL', 'DRI'],
    c: 1,
    e: '<b>DRA</b> reinforces an appropriate <b>alternative</b> behavior (hand-raising) while withholding reinforcement for the problem behavior (shouting). DRO would reinforce intervals with no shouting, regardless of what else occurs.',
    source: 'BACB RBT Handbook — retired sample 3',
  },
];
