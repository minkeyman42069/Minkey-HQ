#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadBankFromJson } from './lib/load-bank.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bank = loadBankFromJson();
const htmlPath = join(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

const start = html.indexOf('const BANK = [');
const forEachIdx = html.indexOf('BANK.forEach', start);
if (start < 0 || forEachIdx < 0) throw new Error('BANK anchor not found');
const end = html.lastIndexOf('];', forEachIdx);
const forEachEnd = html.indexOf('\n', html.indexOf(');', forEachIdx)) + 1;

function serialize(q) {
  const parts = [`cat:${JSON.stringify(q.cat)}`];
  if (q.dom) parts.push(`dom:${JSON.stringify(q.dom)}`);
  if (q.task) parts.push(`task:${JSON.stringify(q.task)}`);
  if (q.type && q.type !== 'mc') parts.push(`type:${JSON.stringify(q.type)}`);
  if (q.source) parts.push(`source:${JSON.stringify(q.source)}`);
  parts.push(`q:${JSON.stringify(q.q)}`);
  if (q.type === 'tf') parts.push(`correct:${q.correct}`);
  else {
    parts.push(`a:${JSON.stringify(q.a)}`);
    parts.push(`c:${q.c}`);
  }
  parts.push(`e:${JSON.stringify(q.e)}`);
  return `{${parts.join(',')}}`;
}

let body = 'const BANK = [\n';
let lastCat = null;
bank.forEach((q) => {
  if (q.cat !== lastCat) {
    body += `\n/* ${q.cat} */\n`;
    lastCat = q.cat;
  }
  body += serialize(q) + ',\n';
});
body += '];\nBANK.forEach(function(q,i){ q.id=i; if(!q.type) q.type=\'mc\'; });';

const out = html.slice(0, start) + body + html.slice(forEachEnd);
writeFileSync(htmlPath, out);
console.log(`Injected ${bank.length} questions into index.html`);
