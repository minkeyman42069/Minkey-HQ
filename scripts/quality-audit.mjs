#!/usr/bin/env node
/**
 * Scores every question against the BACB-aligned quality rubric.
 * Run: npm run audit
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadBank } from './lib/load-bank.mjs';
import { auditBank } from './lib/quality-rubric.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bank = loadBank();
const { results, summary } = auditBank(bank);

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data/quality-report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary, results }, null, 2));

console.log('\n=== RBT Trail Quality Audit ===\n');
console.log(`Questions: ${summary.total}`);
console.log(`Average quality score: ${summary.avgQuality}/100`);
console.log(`Grades: A=${summary.grades.A} B=${summary.grades.B} C=${summary.grades.C} D=${summary.grades.D} F=${summary.grades.F}\n`);
console.log('Top flags:');
Object.entries(summary.flagCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
  .forEach(([f, n]) => console.log(`  ${f.padEnd(28)} ${n}`));

const worst = results.filter((r) => r.quality < 55 || r.flags.includes('DUPLICATE_STEM')).slice(0, 15);
console.log('\nLowest quality / duplicates (first 15):');
worst.forEach((r) => console.log(`  #${r.id} [${r.grade} ${r.quality}] ${r.flags.join(', ')} — ${r.preview}…`));

console.log(`\nFull report → data/quality-report.json`);
