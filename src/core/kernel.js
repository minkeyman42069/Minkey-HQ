import { createAgentBus } from './agent-bus.js';
import { CONFIG } from './config.js';
import { createBoonArchitect } from '../agents/boon-architect.js';
import { createEconomyApi, WEATHERS, RELICS, pitchRestore } from '../agents/mountain-economy.js';
import {
  DOMAINS,
  DOMAIN_OF,
  domainOf,
  weakestDomainLetter,
  createScheduler,
  TIERS,
  TYPES,
  configureTypes,
} from '../agents/trail-scholar.js';
import * as HazardWarden from '../agents/hazard-warden.js';
import {
  buildRoute,
  ACTS as ROUTE_ACTS,
  OATHS,
  ACHIEVEMENTS,
  oathById,
  applyOathMods,
  oathStamMult,
  oathHealMult,
  oathRiseMult,
  oathGateHitMult,
  spoilsDraftEligible,
  dailySeed,
  createSeededRng,
} from '../agents/expedition-director.js';
import { createAtlasArtisan } from '../agents/atlas-artisan.js';

const AGENT_META = [
  {
    id: 'boon-architect',
    name: 'Boon Architect',
    icon: '🎒',
    color: '#f2b64e',
    blurb: 'Draftable modifiers, contextual picks, and duo synergies. Every boon effect routes through one hook bus.',
  },
  {
    id: 'hazard-warden',
    name: 'Hazard Warden',
    icon: '⛈️',
    color: '#6f83e0',
    blurb: 'Encounter factories, act scaling, bestiary truth. Names match mechanics because definitions live in one registry.',
  },
  {
    id: 'trail-scholar',
    name: 'Trail Scholar',
    icon: '📚',
    color: '#5fce9f',
    blurb: 'TCO domains, Leitner scheduling, question formats, and gatekeeper domain targeting from live performance.',
  },
  {
    id: 'mountain-economy',
    name: 'Mountain Economist',
    icon: '⚖️',
    color: '#8fc4dd',
    blurb: 'Stamina, threat, weather, relics. One ledger — UI payout matches code payout.',
  },
  {
    id: 'expedition-director',
    name: 'Expedition Director',
    icon: '🧭',
    color: '#c9a86a',
    blurb: 'Three-act route assembly, camp pacing, and summit sequencing tuned by the balance simulator.',
  },
  {
    id: 'atlas-artisan',
    name: 'Atlas Artisan',
    icon: '🎨',
    color: '#e8a0c8',
    blurb: 'Visual design tokens, menu composition, and UI polish — presentation separated from mechanics.',
  },
];

export function createKernel() {
  const bus = createAgentBus();
  const boonAgent = createBoonArchitect();
  const economy = createEconomyApi();
  const atlasAgent = createAtlasArtisan();
  const scheduler = createScheduler(CONFIG);
  boonAgent.register(bus);
  atlasAgent.register(bus);

  const agents = {
    boon: boonAgent,
    hazard: {
      id: 'hazard-warden',
      name: 'Hazard Warden',
      api: HazardWarden,
    },
    scholar: {
      id: 'trail-scholar',
      name: 'Trail Scholar',
      api: { DOMAINS, DOMAIN_OF, domainOf, weakestDomainLetter, TIERS, TYPES, configureTypes },
    },
    economy: {
      id: 'mountain-economy',
      name: 'Mountain Economist',
      api: { WEATHERS, RELICS, pitchRestore, economy },
    },
    expedition: {
      id: 'expedition-director',
      name: 'Expedition Director',
      api: {
        buildRoute,
        ACTS: ROUTE_ACTS,
        OATHS,
        ACHIEVEMENTS,
        oathById,
        applyOathMods,
        oathStamMult,
        oathHealMult,
        oathRiseMult,
        oathGateHitMult,
        spoilsDraftEligible,
        dailySeed,
        createSeededRng,
      },
    },
    atlas: atlasAgent,
  };

  function makeCtx(run, enc, extras = {}) {
    return {
      run,
      enc,
      config: CONFIG,
      duos: boonAgent.api.activeDuos({ run, enc, config: CONFIG }),
      ...extras,
    };
  }

  function emit(event, ctx) {
    return bus.emit(event, ctx);
  }

  return {
    CONFIG,
    bus,
    agents,
    meta: AGENT_META,
    makeCtx,
    emit,
    economy,
    buildRoute: (rnd, topic) => buildRoute(rnd, topic, CONFIG, HazardWarden),
    weakestDomain: (run, bank) => weakestDomainLetter(run, bank),
    pitchRestore: (node, mode, run) => pitchRestore(node, mode, run, CONFIG),
    createScheduler: () => scheduler,
  };
}
