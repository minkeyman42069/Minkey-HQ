#!/usr/bin/env node
/**
 * Prints coverage stats for the RBT exam blueprint.
 * Run: npm run analyze
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const start = html.indexOf('const BANK = [');
const end = html.indexOf('];\nBANK.forEach', start);
const bank = Function(`"use strict"; return (${html.slice(start + 'const BANK = '.length, end + 1)});`)();
bank.forEach((q, i) => {
  q.id = i;
  if (!q.type) q.type = 'mc';
});

const DOMAIN_OF = {
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

const BLUEPRINT = {
  A: { name: 'Data Collection & Graphing', pct: 17 },
  B: { name: 'Behavior Assessment', pct: 11 },
  C: { name: 'Behavior Acquisition', pct: 25 },
  D: { name: 'Behavior Reduction', pct: 19 },
  E: { name: 'Documentation & Reporting', pct: 13 },
  F: { name: 'Ethics', pct: 15 },
};

function domainOf(q) {
  return q.dom || DOMAIN_OF[q.cat] || 'C';
}

const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
const types = { mc: 0, odd: 0, tf: 0 };
bank.forEach((q) => {
  counts[domainOf(q)]++;
  types[q.type || 'mc']++;
});

console.log('\n=== RBT Trail Question Bank Analysis ===\n');
console.log(`Total questions: ${bank.length}`);
console.log(`Formats: MC ${types.mc} · Odd-one-out ${types.odd} · True/False ${types.tf}\n`);
console.log('Domain coverage (3rd ed. TCO weights):');
console.log('Domain | Questions | % of bank | Exam weight');
console.log('-------|-----------|-----------|------------');

Object.keys(BLUEPRINT).forEach((d) => {
  const n = counts[d];
  const pct = ((n / bank.length) * 100).toFixed(1);
  const target = BLUEPRINT[d].pct;
  const bar = '█'.repeat(Math.round(n / 8)) + '░'.repeat(Math.max(0, 15 - Math.round(n / 8)));
  console.log(
    `  ${d}    | ${String(n).padStart(4)}     | ${pct.padStart(5)}%   | ${target}%  ${bar}`
  );
});

const cats = {};
bank.forEach((q) => {
  cats[q.cat] = (cats[q.cat] || 0) + 1;
});
const topCats = Object.entries(cats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);
console.log('\nTop categories:');
topCats.forEach(([c, n]) => console.log(`  ${n.toString().padStart(3)}  ${c}`));
