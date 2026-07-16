#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { normalizeBank } from './lib/load-bank.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bankPath = join(root, 'data/questions.json');
const batchPath = join(root, 'data/overhaul-batch3.json');

let bank = JSON.parse(readFileSync(bankPath, 'utf8'));
normalizeBank(bank);
const patches = JSON.parse(readFileSync(batchPath, 'utf8'));

let applied = 0;
patches.forEach((p) => {
  if (!bank[p.id]) {
    console.warn('Skip missing id', p.id);
    return;
  }
  bank[p.id] = { ...bank[p.id], ...p };
  delete bank[p.id].id;
  applied++;
});

normalizeBank(bank);
writeFileSync(bankPath, JSON.stringify(bank, null, 2) + '\n');
console.log(`Applied ${applied} batch-3 overhauls`);
