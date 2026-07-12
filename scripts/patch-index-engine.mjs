#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'index.html');
let html = readFileSync(path, 'utf8');

if (!html.includes('game/trail.bundle.js')) {
  html = html.replace(
    '<script>\n/* ============================================================================',
    '<script src="game/trail.bundle.js"></script>\n<script>\n/* ============================================================================',
  );
}

const startMarker = 'BANK.forEach(function(q,i)';
const endMarker = '/* ---------- RUN STATE + ENCOUNTER CONTROLLER ---------- */';
const si = html.indexOf(startMarker);
const ei = html.indexOf(endMarker);
if (si < 0 || ei < 0) throw new Error('patch anchors not found');

const bridge = `BANK.forEach(function(q,i){ q.id=i; if(!q.type) q.type='mc'; });
/* ---------- AGENT BRIDGE (see src/agents/ + game/trail.bundle.js) ---------- */
function lockTierNow(){ return CONFIG.LOCK_TIER; }
function trailCtx(extra){ return Trail.makeCtx(RUN, ENC, Object.assign({ rnd: rnd }, extra||{})); }
function showBanners(banners){ if(!banners) return; for(var i=0;i<banners.length;i++){ var b=banners[i]; banner(b.title, b.sub); } }
function grantRelic(id){
  if(!CONFIG.MODS.relics) return;
  Trail.economy.grantRelic({ run: RUN, config: CONFIG, rnd: rnd, banner: banner, renderHeld: typeof renderHeld==='function'?renderHeld:null }, id);
}
configureTypes({ rnd: function(){ return rnd(); }, isBusy: function(){ return !!(RUN&&RUN.busy); } });

`;

html = html.slice(0, si) + bridge + html.slice(ei);
writeFileSync(path, html);
console.log('Patched index.html — agent bridge installed');
