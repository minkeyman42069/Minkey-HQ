#!/usr/bin/env node
/**
 * Applies explanation-contrast fixes to data/questions.json
 * Run: npm run fix:contrast && npm run sync
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { normalizeBank } from './lib/load-bank.mjs';
import { ensureExplanationContrast } from './lib/explanation-contrast.mjs';
import { scoreQuestion } from './lib/quality-rubric.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'data/questions.json');
let bank = JSON.parse(readFileSync(path, 'utf8'));
normalizeBank(bank);

let fixed = 0;
bank = bank.map((q) => {
  if (q.type !== 'mc') return q;
  const before = scoreQuestion(q);
  if (!before.flags.includes('EXPLANATION_NO_CONTRAST')) return q;
  const e = ensureExplanationContrast(q);
  if (e === q.e) return q;
  fixed++;
  return { ...q, e };
});

normalizeBank(bank);
writeFileSync(path, JSON.stringify(bank, null, 2) + '\n');
console.log(`Fixed explanation contrast on ${fixed} questions (${bank.length} total)`);
