#!/usr/bin/env node
/**
 * Bundle Trail agents for browsers without native module graph on inline handlers.
 * Output: game/trail.bundle.js (IIFE on window.TrailBundle)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'game');
mkdirSync(outDir, { recursive: true });
const outfile = join(outDir, 'trail.bundle.js');

const entry = join(root, 'game/bootstrap.js');
const cmd = `npx --yes esbuild@${'0.25.0'} "${entry}" --bundle --format=iife --global-name=TrailBundle --outfile="${outfile}" --log-level=warning`;

execSync(cmd, { cwd: root, stdio: 'inherit' });
console.log('Wrote', outfile);
