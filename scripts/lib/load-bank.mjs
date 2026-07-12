import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function loadBankFromHtml(path = join(root, 'index.html')) {
  const html = readFileSync(path, 'utf8');
  const start = html.indexOf('const BANK = [');
  const end = html.indexOf('];\nBANK.forEach', start);
  if (start < 0 || end < 0) throw new Error('BANK array not found in index.html');
  const bank = Function(
    `"use strict"; return (${html.slice(start + 'const BANK = '.length, end + 1)});`
  )();
  normalizeBank(bank);
  return bank;
}

export function loadBankFromJson(path = join(root, 'data/questions.json')) {
  const bank = JSON.parse(readFileSync(path, 'utf8'));
  normalizeBank(bank);
  return bank;
}

export function loadBank(preferJson = true) {
  const jsonPath = join(root, 'data/questions.json');
  if (preferJson && existsSync(jsonPath)) return loadBankFromJson(jsonPath);
  return loadBankFromHtml();
}

export function normalizeBank(bank) {
  bank.forEach((q, i) => {
    q.id = i;
    if (!q.type) q.type = 'mc';
  });
  return bank;
}

export function domainOf(q) {
  const MAP = {
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
  return q.dom || MAP[q.cat] || 'C';
}
