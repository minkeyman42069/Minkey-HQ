/**
 * Bootstrap — loads the five Trail agents and bridges legacy globals for index.html onclick handlers.
 */
import { createKernel } from '../src/core/kernel.js';

const Trail = createKernel();
window.Trail = Trail;

// Legacy globals (index.html engine references these)
window.CONFIG = Trail.CONFIG;
window.BOONS = Trail.agents.boon.api.catalog;
window.BOON_TAGS = Trail.agents.boon.api.tags;
window.DUOS = Trail.agents.boon.api.duos;
window.WEATHERS = Trail.agents.economy.api.WEATHERS;
window.RELICS = Trail.agents.economy.api.RELICS;
window.DOMAINS = Trail.agents.scholar.api.DOMAINS;
window.DOMAIN_OF = Trail.agents.scholar.api.DOMAIN_OF;
window.domainOf = Trail.agents.scholar.api.domainOf;
window.TIERS = Trail.agents.scholar.api.TIERS;
window.TYPES = Trail.agents.scholar.api.TYPES;
window.ACTS = Trail.agents.hazard.api.ACTS;
window.BESTIARY = Trail.agents.hazard.api.BESTIARY;
window.FOE_COLORS = Trail.agents.hazard.api.FOE_COLORS;
window.foeColor = Trail.agents.hazard.api.foeColor;
window.nodeSub = Trail.agents.hazard.api.nodeSub;
window.nodeEmoji = Trail.agents.hazard.api.nodeEmoji;
window.scaleNode = Trail.agents.hazard.api.scaleNode;

// Node factories on window for any inline references
const H = Trail.agents.hazard.api;
[
  'nSwitch', 'nStorm', 'nGate', 'nRest', 'nSummit', 'nSerac', 'nWhiteout', 'nCrevasse',
  'nTraverse', 'nThinAir', 'nIcefall', 'nVoid', 'nKnife', 'nBergschrund', 'nSnowfield',
  'nCouloir', 'nIcewall', 'nWindslab', 'nSealedFace', 'nLongWall', 'nTempest', 'nClosing',
  'nAvalanche', 'nShrine', 'nCorniceRidge', 'nFrozenTitan',
].forEach((k) => { window[k] = H[k]; });

window.weakestDomainLetter = function () {
  return Trail.weakestDomain(typeof RUN !== 'undefined' ? RUN : { prog: {} }, typeof BANK !== 'undefined' ? BANK : []);
};

window.pitchRestore = function (node, mode) {
  return Trail.pitchRestore(node, mode, typeof RUN !== 'undefined' ? RUN : { weather: null });
};

window.buildRoute = function (topic) {
  return Trail.buildRoute(typeof rnd !== 'undefined' ? rnd : Math.random, topic);
};

window.configureTypes = Trail.agents.scholar.api.configureTypes;

var _sched = Trail.createScheduler();
window.SCHED = {
  pick: function(ids, last){ return _sched.pick(ids, last, typeof RUN!=='undefined'?RUN:{prog:{},recent:[],locked:new Set(),mastered:new Set()}, typeof rnd!=='undefined'?rnd:Math.random); },
  grade: function(id, correct, viaTimeout){ return _sched.grade(id, correct, viaTimeout, RUN); }
};

window.resolveBoon = function (id) {
  return Trail.agents.boon.api.resolve(id);
};

window.BOON = {
  has(id) {
    if (typeof ENC !== 'undefined' && ENC?.node?.suppress) return false;
    return typeof RUN !== 'undefined' && RUN.boons && RUN.boons.has(id);
  },
  focusTime(base) {
    return Trail.agents.boon.api.focusTime(Trail.makeCtx(typeof RUN !== 'undefined' ? RUN : {}, typeof ENC !== 'undefined' ? ENC : {}), base);
  },
};

window.activeDuos = function () {
  return Trail.agents.boon.api.activeDuos(Trail.makeCtx(RUN, ENC));
};

window.hasDuo = function (name) {
  return activeDuos().some((d) => d.name === name);
};

window.draftBoons = function () {
  return Trail.agents.boon.api.pickDraft(Trail.makeCtx(RUN, ENC), rnd);
};

window.TrailAgents = Trail.meta;

if (Trail.agents.atlas?.api?.applyDesignTokens) {
  Trail.agents.atlas.api.applyDesignTokens();
}

// Signal that agents are ready
window.dispatchEvent(new CustomEvent('trail:agents-ready', { detail: Trail }));

export default Trail;
