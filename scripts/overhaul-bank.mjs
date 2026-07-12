#!/usr/bin/env node
/**
 * Applies BACB-aligned quality overhauls to data/questions.json
 * Run: npm run overhaul && npm run sync
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { domainOf, normalizeBank } from './lib/load-bank.mjs';
import { BACB_SAMPLES } from './lib/quality-rubric.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'data/questions.json');
let bank = JSON.parse(readFileSync(path, 'utf8'));
normalizeBank(bank);

const FUNCTION_OPTS = [
  'Access to tangibles',
  'Escape/avoidance',
  'Attention',
  'Automatic reinforcement',
];

function improveExplanation(q) {
  let e = q.e || '';
  if (e.length < 60 && q.type === 'mc' && q.a) {
    const correct = q.a[q.c];
    const wrong = q.a.filter((_, i) => i !== q.c).slice(0, 1)[0];
    if (wrong && !/not\b/i.test(e)) {
      e = e.replace(/\.$/, '') + `. This is not <b>${wrong}</b> because it does not match the scenario.`;
    }
  }
  return e;
}

function scenarioReinforcement(q, idx) {
  const scenarios = [
    {
      q: 'After a client completes a worksheet, the RBT delivers praise and a preferred sticker. The client begins completing more worksheets. This consequence is an example of:',
      a: ['Positive reinforcement', 'Negative reinforcement', 'Positive punishment', 'Negative punishment'],
      c: 0,
      e: '<b>Positive reinforcement:</b> a stimulus (praise/sticker) is <b>added</b> after the behavior and the behavior <b>increases</b>. Negative reinforcement would remove an aversive; punishment would decrease behavior.',
      dom: 'C',
      cat: 'Reinforcement & Punishment',
    },
    {
      q: 'A client screams during toothbrushing. When the RBT stops brushing, screaming increases the next day. Removing brushing is functioning as:',
      a: ['Negative reinforcement', 'Positive reinforcement', 'Negative punishment', 'Extinction'],
      c: 0,
      e: '<b>Negative reinforcement:</b> an aversive event (brushing) is <b>removed</b> when screaming occurs, and screaming <b>increases</b>. This is escape-maintained behavior, not punishment.',
      dom: 'D',
      cat: 'Reinforcement & Punishment',
    },
    {
      q: 'A teacher adds extra homework after a student throws materials, and throwing decreases. This is:',
      a: ['Positive punishment', 'Negative punishment', 'Positive reinforcement', 'Negative reinforcement'],
      c: 0,
      e: '<b>Positive punishment:</b> an aversive stimulus (extra homework) is <b>added</b> and the behavior <b>decreases</b>. Removing a preferred item would be negative punishment.',
      dom: 'D',
      cat: 'Reinforcement & Punishment',
    },
    {
      q: 'Tokens are removed after a client hits, and hitting decreases. This is best described as:',
      a: ['Negative punishment (response cost)', 'Positive punishment', 'Extinction', 'Negative reinforcement'],
      c: 0,
      e: '<b>Negative punishment:</b> a preferred stimulus (tokens) is <b>removed</b> and hitting <b>decreases</b>. Response cost is a common form used in token economies.',
      dom: 'D',
      cat: 'Reinforcement & Punishment',
    },
  ];
  return scenarios[idx % scenarios.length];
}

// --- Per-ID surgical overhauls ---
const ID_PATCHES = {
  763: {
    q: 'During snack time, a client cries and the RBT immediately provides a preferred cracker. Crying increases the next day. The most likely function is:',
    a: FUNCTION_OPTS,
    c: 0,
    e: 'The crying is followed by <b>access to a tangible</b> (cracker). Attention would require social reaction; escape would remove a demand; automatic would occur without anyone present.',
    dom: 'D',
  },
  764: {
    q: 'A student tells jokes during instruction and peers turn toward the student and laugh. Joking increases. The most likely function is:',
    a: FUNCTION_OPTS,
    c: 2,
    e: '<b>Attention</b> from peers maintains the behavior. No tangible is gained and no demand is removed.',
    dom: 'D',
  },
  765: {
    q: 'When a difficult math sheet is presented, a learner pushes the materials away and is sent to the break area, ending the task. Pushing materials away increases. Function?',
    a: FUNCTION_OPTS,
    c: 1,
    e: '<b>Escape/avoidance</b> — the behavior removes or postpones the non-preferred task.',
    dom: 'D',
  },
  766: {
    q: 'A client hand-flaps in an empty room with no demands and no one attending. The behavior persists unchanged. The most likely function is:',
    a: FUNCTION_OPTS,
    c: 3,
    e: '<b>Automatic reinforcement</b> — sensory consequences maintain the behavior without social mediation.',
    dom: 'D',
  },
  768: {
    q: 'A BCBA asks the RBT to identify why a behavior keeps occurring. The RBT should report the behavior\'s:',
    a: ['Function', 'Topography', 'Latency', 'Interobserver agreement'],
    c: 0,
    e: '<b>Function</b> = the environmental reason the behavior is reinforced. Topography is form; latency and IOA are measurement concepts.',
    dom: 'D',
  },
  769: {
    q: 'A client grabs a peer\'s tablet and begins playing. Grabbing increases across sessions. Most likely function?',
    a: FUNCTION_OPTS,
    c: 0,
    e: 'The client gains <b>access to a tangible</b> (the tablet).',
    dom: 'D',
  },
  801: {
    q: 'An RBT delivers praise and a token each time a client uses a communication card instead of screaming. Screaming is placed on extinction. This package is best described as:',
    a: ['DRA with extinction', 'DRO only', 'DRL', 'NCR'],
    c: 0,
    e: '<b>DRA</b> reinforces an appropriate alternative (communication card) while withholding reinforcement for screaming (<b>extinction</b> of the problem behavior).',
    dom: 'D',
  },
  802: {
    q: 'Reinforcement is delivered for hands-in-lap while reinforcement for hitting is withheld. Hitting and hands-in-lap cannot occur at the same time. This is:',
    a: ['DRI', 'DRA', 'DRO', 'DRL'],
    c: 0,
    e: '<b>DRI</b> — the replacement behavior is <b>incompatible</b> with the problem behavior. DRA does not require incompatibility.',
    dom: 'D',
  },
  803: {
    q: 'An RBT delivers a reinforcer if no aggression occurs for a 2-minute interval. Which procedure is this?',
    a: ['DRO', 'DRA', 'DRI', 'DRH'],
    c: 0,
    e: '<b>DRO</b> (differential reinforcement of other behavior) reinforces intervals with <b>zero</b> occurrences of the target behavior.',
    dom: 'D',
  },
};

// Replace definition-only reinforcement stems (772-776)
[772, 773, 774, 775].forEach((id, i) => {
  const s = scenarioReinforcement(bank[id], i);
  bank[id] = { ...bank[id], ...s };
});

// Apply ID patches
Object.entries(ID_PATCHES).forEach(([id, patch]) => {
  bank[+id] = { ...bank[+id], ...patch };
  if (!bank[+id].cat) bank[+id].cat = bank[+id].dom === 'D' && /function|FERB|extinction|DRO|DRI|DRA/i.test(bank[+id].q)
    ? (bank[+id].q.includes('function') ? 'Functions of Behavior' : 'Differential Reinforcement')
    : bank[+id].cat || 'Behavior Acquisition';
});

// Normalize function-of-behavior options across category
bank.forEach((q) => {
  if (q.cat === 'Functions of Behavior' && q.type !== 'tf' && q.type !== 'odd' && Array.isArray(q.a)) {
    const map = { Access: 'Access to tangibles', Escape: 'Escape/avoidance', Automatic: 'Automatic reinforcement' };
    q.a = q.a.map((opt) => map[opt] || opt);
  }
  if (!q.dom) q.dom = domainOf(q);
  if (q.type === 'mc') q.e = improveExplanation(q);
});

// Remove near-duplicate stems (keep higher-quality / dom-tagged version)
const stemKey = (q) => q.q.toLowerCase().replace(/[^a-z0-9 ]/g, '').slice(0, 72);
const groups = new Map();
bank.forEach((q, i) => {
  const k = stemKey(q);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(i);
});

const toRemove = new Set();
groups.forEach((ids) => {
  if (ids.length < 2) return;
  ids.sort((a, b) => {
    const qa = bank[a];
    const qb = bank[b];
    const score = (q) => (q.dom ? 2 : 0) + (q.q.length > 90 ? 1 : 0) + ((q.e || '').length > 70 ? 1 : 0);
    return score(qb) - score(qa);
  });
  ids.slice(1).forEach((id) => toRemove.add(id));
});

bank = bank.filter((_, i) => !toRemove.has(i));
normalizeBank(bank);

// Add BACB retired samples at front of relevant sections
BACB_SAMPLES.forEach((sample) => {
  const exists = bank.some((q) => q.source === sample.source);
  if (!exists) bank.push({ ...sample, type: 'mc' });
});

// New Domain E questions (documentation gap)
const DOMAIN_E_NEW = [
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.4',
    q: 'Which session note entry is objective and appropriate for the permanent record?',
    a: [
      'Client completed 8 of 10 tact trials with 2 gestural prompts',
      'Client had a wonderful attitude today',
      'Client was manipulative during transitions',
      'Client seemed bored and unmotivated',
    ],
    c: 0,
    e: 'Objective notes describe <b>observable, measurable</b> events. Attitude, intent, and motivation labels are subjective interpretations.',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.3',
    q: 'A caregiver reports the client started a new medication yesterday. The RBT should:',
    a: [
      'Document the report and notify the supervising BCBA promptly',
      'Wait until the next team meeting to mention it',
      'Adjust the behavior plan independently',
      'Skip programming until medication is stable',
    ],
    c: 0,
    e: 'Medication changes may affect behavior and data. RBTs <b>document and report promptly</b> (E.3) but do not change programs without supervision.',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.2',
    q: 'The RBT is unsure how to implement a revised prompt-fading step in the behavior plan. The RBT should:',
    a: [
      'Contact the supervising BCBA for clinical direction',
      'Use full physical prompts until the next session',
      'Ask the caregiver how they want it done',
      'Skip the program and collect only ABC data',
    ],
    c: 0,
    e: 'RBTs <b>seek clinical direction</b> through the chain of command when uncertain (E.2).',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.1',
    q: 'A parent requests that the RBT add a new home goal not in the written plan. The RBT should:',
    a: [
      'Relay the request to the supervising BCBA',
      'Add the goal for today only',
      'Decline and end the session',
      'Write a new goal and begin teaching it',
    ],
    c: 0,
    e: 'Program changes are the BCBA\'s responsibility. The RBT <b>communicates caregiver requests</b> to the supervisor (E.1/E.2).',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.4',
    q: 'When should session notes be completed?',
    a: [
      'During or immediately after the session',
      'At the end of the week from memory',
      'Only when insurance requires them',
      'After the BCBA reviews the data',
    ],
    c: 0,
    e: 'Contemporaneous documentation supports accuracy and meets legal/workplace requirements (E.4).',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.3',
    q: 'The client arrives after a poor night of sleep and has not eaten breakfast. The RBT should:',
    a: [
      'Record the variables in the note and inform the supervisor',
      'Cancel data collection for the day',
      'Increase demands to test resilience',
      'Ignore it unless behavior escalates',
    ],
    c: 0,
    e: 'Setting events (sleep, meals) can affect behavior and data quality. Document and <b>report in a timely manner</b>.',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.4',
    q: 'Which statement violates objective documentation standards?',
    a: [
      'The client was noncompliant and defiant',
      'The client refused the demand 3 of 5 opportunities',
      'The client left the table for 45 seconds',
      'The client used the FERB on 4 of 6 opportunities',
    ],
    c: 0,
    e: '"Noncompliant and defiant" are <b>subjective labels</b>. Counts, durations, and objective descriptions belong in session notes.',
  },
  {
    cat: 'Documentation & Reporting',
    dom: 'E',
    task: 'E.2',
    q: 'Data collected today appear inconsistent with the behavior plan definition. The RBT should:',
    a: [
      'Notify the supervising BCBA and follow their direction',
      'Change the definition to match what was recorded',
      'Delete the outlier data points',
      'Continue collecting until the pattern is clear',
    ],
    c: 0,
    e: 'Data integrity issues require <b>supervisor consultation</b> — RBTs do not unilaterally alter definitions or discard data.',
  },
];

DOMAIN_E_NEW.forEach((q) => {
  if (!bank.some((b) => b.q === q.q)) bank.push({ ...q, type: 'mc' });
});

// Ethics expansions aligned to handbook sample style
const DOMAIN_F_NEW = [
  {
    cat: 'Ethics & Scope',
    dom: 'F',
    task: 'F.5',
    q: 'A neighbor recognizes the RBT and asks which clients they work with. The RBT should:',
    a: [
      'Decline to discuss any client-related information',
      'Share first names only',
      'Confirm clients but not share goals',
      'Discuss clients if the neighbor also works in schools',
    ],
    c: 0,
    e: 'Protect confidentiality — <b>no client information</b> should be disclosed in casual conversation, including confirming client status.',
  },
  {
    cat: 'Ethics & Scope',
    dom: 'F',
    task: 'F.6',
    q: 'A caregiver invites the RBT to a personal social media group for "team updates." The best response is to:',
    a: [
      'Decline and keep communication on approved professional channels',
      'Join but avoid posting',
      'Join and post weekly progress photos',
      'Join only if the BCBA is also a member',
    ],
    c: 0,
    e: 'Professional <b>boundaries</b> limit social-media entanglements that blur the therapeutic relationship (F.6).',
  },
  {
    cat: 'Ethics & Scope',
    dom: 'F',
    task: 'F.7',
    q: 'A family offers the RBT paid babysitting on weekends. This is problematic because it creates a:',
    a: ['Multiple relationship', 'Supervision deficit', 'Token economy', 'Motivating operation'],
    c: 0,
    e: 'A <b>multiple relationship</b> can impair objectivity and create conflicts of interest (F.7).',
  },
];

DOMAIN_F_NEW.forEach((q) => {
  if (!bank.some((b) => b.q === q.q)) bank.push({ ...q, type: 'mc' });
});

normalizeBank(bank);
writeFileSync(path, JSON.stringify(bank, null, 2) + '\n');
console.log(`Overhauled bank: ${bank.length} questions`);
console.log(`Removed ${toRemove.size} duplicates`);
console.log(`Added ${BACB_SAMPLES.length} BACB samples + ${DOMAIN_E_NEW.length} Domain E + ${DOMAIN_F_NEW.length} Ethics items`);
