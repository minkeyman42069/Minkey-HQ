#!/usr/bin/env node
/**
 * Ensures embedded BANK in index.html matches data/questions.json.
 * Prevents the #1 real-world drift bug: edit JSON, forget npm run sync.
 */
import { createHash } from 'node:crypto';
import { loadBankFromHtml, loadBankFromJson } from './lib/load-bank.mjs';

const jsonBank = loadBankFromJson();
const htmlBank = loadBankFromHtml();

function fingerprint(bank) {
  const stems = bank.map((q) => `${q.q}|${q.c}|${(q.a || []).join('§')}|${q.type || 'mc'}`);
  return createHash('sha256').update(stems.join('\n')).digest('hex').slice(0, 16);
}

const jsonFp = fingerprint(jsonBank);
const htmlFp = fingerprint(htmlBank);

console.log(`JSON bank: ${jsonBank.length} questions  fingerprint ${jsonFp}`);
console.log(`HTML bank: ${htmlBank.length} questions  fingerprint ${htmlFp}`);

if (jsonBank.length !== htmlBank.length) {
  console.error(`\n✗ Count mismatch — run: npm run sync`);
  process.exit(1);
}

if (jsonFp !== htmlFp) {
  console.error(`\n✗ Content drift — index.html is stale. Run: npm run sync`);
  process.exit(1);
}

console.log('\n✓ Bank in sync (JSON ↔ index.html)');
