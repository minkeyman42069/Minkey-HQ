#!/usr/bin/env node
/**
 * Validates the question BANK embedded in index.html.
 * Run: npm run validate
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const start = html.indexOf('const BANK = [');
const end = html.indexOf('];\nBANK.forEach', start);
if (start < 0 || end < 0) {
  console.error('Could not locate BANK array in index.html');
  process.exit(1);
}

const bankSrc = html.slice(start + 'const BANK = '.length, end + 1);
let bank;
try {
  bank = Function(`"use strict"; return (${bankSrc});`)();
} catch (e) {
  console.error('Failed to parse BANK:', e.message);
  process.exit(1);
}

const DOMAINS = new Set(['A', 'B', 'C', 'D', 'E', 'F']);
const TYPES = new Set(['mc', 'odd', 'tf']);
let errors = 0;

function fail(msg) {
  console.error('ERROR:', msg);
  errors++;
}

// IDs are assigned at runtime in the game (BANK.forEach)
bank.forEach((q, i) => {
  q.id = i;
  if (!q.type) q.type = 'mc';
});

const seen = new Set();
bank.forEach((q, i) => {
  if (q.id !== i) fail(`Question at index ${i} has id ${q.id}`);
  if (seen.has(q.id)) fail(`Duplicate id ${q.id}`);
  seen.add(q.id);
  if (!q.cat) fail(`#${i}: missing cat`);
  if (!q.q) fail(`#${i}: missing question text`);
  if (!q.e) fail(`#${i}: missing explanation`);

  const type = q.type || 'mc';
  if (!TYPES.has(type)) fail(`#${i}: unknown type ${type}`);

  if (type === 'tf') {
    if (typeof q.correct !== 'boolean') fail(`#${i}: tf needs boolean correct`);
  } else {
    if (!Array.isArray(q.a) || q.a.length < 2) fail(`#${i}: mc/odd needs 2+ answers`);
    if (q.c < 0 || q.c >= q.a.length) fail(`#${i}: correct index out of range`);
  }

  if (q.dom && !DOMAINS.has(q.dom)) fail(`#${i}: invalid dom ${q.dom}`);
});

const withDom = bank.filter((q) => q.dom).length;
const cats = [...new Set(bank.map((q) => q.cat))].sort();

console.log(`Validated ${bank.length} questions across ${cats.length} categories`);
console.log(`Exam-aligned (dom tag): ${withDom}/${bank.length} (${Math.round((withDom / bank.length) * 100)}%)`);

if (errors) {
  console.error(`\n${errors} validation error(s)`);
  process.exit(1);
}

console.log('All checks passed.');
