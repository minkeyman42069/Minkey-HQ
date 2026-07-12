#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadBankFromHtml } from './lib/load-bank.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bank = loadBankFromHtml();
mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data/questions.json'), JSON.stringify(bank, null, 2) + '\n');
console.log(`Extracted ${bank.length} questions → data/questions.json`);
