var TrailBundle = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // game/bootstrap.js
  var bootstrap_exports = {};
  __export(bootstrap_exports, {
    default: () => bootstrap_default
  });

  // src/core/agent-bus.js
  function createAgentBus() {
    const handlers = /* @__PURE__ */ new Map();
    function on(event, fn, agentId) {
      if (!handlers.has(event)) handlers.set(event, []);
      handlers.get(event).push({ fn, agentId });
    }
    function off(agentId) {
      handlers.forEach((list, event) => {
        handlers.set(
          event,
          list.filter((h) => h.agentId !== agentId)
        );
      });
    }
    function emit(event, ctx) {
      const list = handlers.get(event) || [];
      const out = { ...ctx };
      for (const { fn } of list) {
        const patch = fn(out) || {};
        Object.assign(out, patch);
      }
      return out;
    }
    return { on, off, emit };
  }

  // src/core/config.js
  var CONFIG = {
    STAM_MAX: 100,
    MISS_COST: 14,
    TIMEOUT_COST: 10,
    REST_RESTORE: 28,
    CLEAR_RESTORE_MULT: 0.85,
    THREAT_RESET: 75,
    CRUX_RISE_MULT: 1.2,
    MAX_BOONS: 5,
    MODS: { weather: true, relics: true, shrines: true },
    LOCK_TIER: 3,
    MASTER_TIER: 4,
    BOX_WEIGHTS: [9, 6.5, 5, 3.5, 2],
    EASE_ON_CORRECT: 6,
    AUDIO: true,
    EXAM_N: 40,
    EXAM_PASS: 80
  };

  // src/agents/hazard-warden.js
  var hazard_warden_exports = {};
  __export(hazard_warden_exports, {
    ACTS: () => ACTS,
    BESTIARY: () => BESTIARY,
    FOE_COLORS: () => FOE_COLORS,
    foeColor: () => foeColor,
    nAvalanche: () => nAvalanche,
    nBergschrund: () => nBergschrund,
    nClosing: () => nClosing,
    nCorniceRidge: () => nCorniceRidge,
    nCouloir: () => nCouloir,
    nCrevasse: () => nCrevasse,
    nFrozenTitan: () => nFrozenTitan,
    nGate: () => nGate,
    nIcefall: () => nIcefall,
    nIcewall: () => nIcewall,
    nKnife: () => nKnife,
    nLongWall: () => nLongWall,
    nRest: () => nRest,
    nSealedFace: () => nSealedFace,
    nSerac: () => nSerac,
    nShrine: () => nShrine,
    nSnowfield: () => nSnowfield,
    nStorm: () => nStorm,
    nSummit: () => nSummit,
    nSwitch: () => nSwitch,
    nTempest: () => nTempest,
    nThinAir: () => nThinAir,
    nTraverse: () => nTraverse,
    nVoid: () => nVoid,
    nWhiteout: () => nWhiteout,
    nWindslab: () => nWindslab,
    nodeEmoji: () => nodeEmoji,
    nodeSub: () => nodeSub,
    scaleNode: () => scaleNode
  });
  var FOE_COLORS = {
    switchback: "#b8894e",
    storm: "#6f83e0",
    gate: "#8a97ab",
    serac: "#79cfe6",
    summit: "#ffcf6b",
    whiteout: "#cbd3dd",
    crevasse: "#4d7ea8",
    traverse: "#86b39a",
    thinair: "#a0dcd6",
    icefall: "#57a6d4",
    void: "#9b6fd0",
    knife: "#e0655a",
    berg: "#4fbfae",
    snowfield: "#bcd0e0",
    couloir: "#5f7a9a",
    icewall: "#6fb0d0",
    windslab: "#7d93b0",
    sealedface: "#90a4b8",
    longwall: "#8a9a86",
    tempest: "#6a5a9a",
    closing: "#d6a94e",
    avalanche: "#b3bcc6",
    corniceridge: "#9fb4c8",
    frozentitan: "#7fd4e8",
    shrine: "#c9a86a",
    rest: "#d89b52"
  };
  function foeColor(kind) {
    return FOE_COLORS[kind] || "#8a97ab";
  }
  function nSwitch(need, alt) {
    return {
      kind: "switchback",
      icon: "\u{1FAA8}",
      title: "Scree Slope",
      blurb: "Loose scree \u2014 it slides when you misstep. Time barely matters here; footing is everything.",
      need,
      time: 18,
      rise: 0.8,
      miss: 26,
      ease: 7,
      max: 100,
      hit: 12,
      restore: 14,
      boon: false,
      alt,
      tname: "Loose scree",
      tic: "\u{1FAA8}"
    };
  }
  function nStorm(need, alt) {
    return {
      kind: "storm",
      icon: "\u{1F329}\uFE0F",
      title: "Rising Squall",
      blurb: "A squall building by the second. Correct answers won't calm it \u2014 only speed clears the ridge.",
      need,
      time: 12,
      rise: 2,
      miss: 15,
      ease: 0,
      max: 100,
      hit: 16,
      restore: 16,
      boon: true,
      noBoonEase: true,
      alt,
      tname: "The squall",
      tic: "\u{1F329}\uFE0F"
    };
  }
  function nGate(need, alt, domain) {
    return {
      kind: "gate",
      icon: "\u{1F6E1}\uFE0F",
      title: "Gatekeeper",
      blurb: domain ? "It tests you on " + domain + ". Every wrong answer emboldens it; every right one drives it back." : "It tests your weakest exam domain. Every wrong answer emboldens it; every right one drives it back.",
      need,
      time: 17,
      rise: 1.35,
      miss: 30,
      ease: 12,
      max: 100,
      hit: 20,
      restore: 22,
      boon: true,
      domain,
      gateDomain: null,
      alt,
      tname: "The Gatekeeper",
      tic: "\u{1F6E1}\uFE0F"
    };
  }
  function nRest(alt, configRef) {
    return {
      kind: "rest",
      icon: "\u{1F3D5}\uFE0F",
      title: "Ledge Camp",
      blurb: "Catch your breath. Take something for the pitch ahead.",
      need: 0,
      restore: configRef.REST_RESTORE,
      boon: true,
      alt
    };
  }
  function nSummit(need, alt) {
    return {
      kind: "summit",
      icon: "\u{1F3D4}\uFE0F",
      title: "Summit Push",
      blurb: "The last pitch \u2014 wind, ice, and everything the mountain has saved for the top.",
      need,
      time: 15,
      rise: 2.1,
      miss: 22,
      ease: 8,
      max: 100,
      hit: 20,
      restore: 14,
      boon: false,
      alt,
      tname: "Summit push",
      tic: "\u2744\uFE0F"
    };
  }
  function nSerac(need, alt) {
    return {
      kind: "serac",
      icon: "\u{1F9CA}",
      title: "Falling Serac",
      blurb: "A wall of unstable ice \u2014 it can go at any second. Fast, punishing, and it hits hard.",
      need,
      time: 13,
      rise: 2.5,
      miss: 24,
      ease: 10,
      max: 100,
      hit: 22,
      restore: 20,
      boon: true,
      alt,
      tname: "The serac",
      tic: "\u{1F9CA}"
    };
  }
  function nWhiteout(need, alt) {
    return {
      kind: "whiteout",
      icon: "\u{1F32B}\uFE0F",
      title: "Blinding Whiteout",
      blurb: "The cloud swallows the ridge whole. You climb by feel now \u2014 and you climb fast, before it closes for good.",
      need,
      time: 10,
      rise: 2.4,
      miss: 13,
      ease: 5,
      max: 100,
      hit: 15,
      restore: 16,
      boon: true,
      alt,
      tname: "The whiteout",
      tic: "\u{1F32B}\uFE0F"
    };
  }
  function nCrevasse(need, alt) {
    return {
      kind: "crevasse",
      icon: "\u{1F573}\uFE0F",
      title: "Snow Bridge",
      blurb: "A snow bridge over a black drop. Only a few steps to cross \u2014 but one wrong step and the mountain takes you.",
      need,
      time: 15,
      rise: 1,
      miss: 28,
      ease: 12,
      max: 100,
      hit: 24,
      restore: 18,
      boon: true,
      alt,
      tname: "The snow bridge",
      tic: "\u{1F573}\uFE0F"
    };
  }
  function nTraverse(need, alt) {
    return {
      kind: "traverse",
      icon: "\u{1F9D7}",
      title: "Exposed Traverse",
      blurb: "A long, exposed line across the face. Nothing here is hard \u2014 but it never ends, and the wind never once stops.",
      need,
      time: 16,
      rise: 1.5,
      miss: 16,
      ease: 6,
      max: 100,
      hit: 14,
      restore: 16,
      boon: true,
      alt,
      tname: "The traverse",
      tic: "\u{1F9D7}"
    };
  }
  function nThinAir(need, alt) {
    return {
      kind: "thinair",
      icon: "\u{1FAC1}",
      title: "The Thin Air",
      blurb: "The air is too thin to breathe. Standing still costs you now \u2014 every second up here bleeds you dry. Keep moving.",
      need,
      time: 16,
      rise: 1,
      miss: 18,
      ease: 8,
      max: 100,
      hit: 12,
      restore: 16,
      boon: true,
      drain: 0.2,
      alt,
      tname: "Thin air",
      tic: "\u{1FAC1}"
    };
  }
  function nIcefall(need, alt) {
    return {
      kind: "icefall",
      icon: "\u2604\uFE0F",
      title: "The Icefall",
      blurb: "Ice comes down the couloir in volleys, on its own grim schedule. Read the rhythm \u2014 move between the falls.",
      need,
      time: 14,
      rise: 0.8,
      miss: 18,
      ease: 9,
      max: 100,
      hit: 15,
      restore: 16,
      boon: true,
      spike: 13,
      spikeEvery: 5,
      alt,
      tname: "The icefall",
      tic: "\u2604\uFE0F"
    };
  }
  function nVoid(need, alt) {
    return {
      kind: "void",
      icon: "\u{1F311}",
      title: "Bare Ridge",
      blurb: "Up here nothing works \u2014 no flare, no field notes, no tricks. Just you and what you actually know.",
      need,
      time: 15,
      rise: 1.4,
      miss: 20,
      ease: 10,
      max: 100,
      hit: 16,
      restore: 18,
      boon: false,
      suppress: true,
      alt,
      tname: "Bare ridge",
      tic: "\u{1F311}"
    };
  }
  function nKnife(need, alt) {
    return {
      kind: "knife",
      icon: "\u{1F5E1}\uFE0F",
      title: "The Knife-Edge",
      blurb: "A ridge one boot wide, a clean fall on either side. Falter and you slide back \u2014 the edge forgives nothing.",
      need,
      time: 15,
      rise: 1.2,
      miss: 20,
      ease: 10,
      max: 100,
      hit: 16,
      restore: 18,
      boon: true,
      streakGate: true,
      alt,
      tname: "The knife-edge",
      tic: "\u{1F5E1}\uFE0F"
    };
  }
  function nBergschrund(need, alt) {
    return {
      kind: "berg",
      icon: "\u26CF\uFE0F",
      title: "Widening Crack",
      blurb: "The gap between snow and ice widens with every slip. Stumble once and it yawns; stumble again and it swallows.",
      need,
      time: 15,
      rise: 1,
      miss: 14,
      ease: 10,
      max: 100,
      hit: 16,
      restore: 18,
      boon: true,
      escalate: 4,
      alt,
      tname: "The widening crack",
      tic: "\u26CF\uFE0F"
    };
  }
  function nSnowfield(need, alt) {
    return {
      kind: "snowfield",
      icon: "\u{1F328}\uFE0F",
      title: "The Snowfield",
      blurb: "Deep, soft snow \u2014 slow and plodding, but it forgives a stumble. Find your pace.",
      need,
      time: 18,
      rise: 0.7,
      miss: 12,
      ease: 10,
      max: 100,
      hit: 10,
      restore: 14,
      boon: true,
      alt,
      tname: "The snowfield",
      tic: "\u{1F328}\uFE0F"
    };
  }
  function nCouloir(need, alt) {
    return {
      kind: "couloir",
      icon: "\u{1F5FB}",
      title: "The Couloir",
      blurb: "A steep gully that funnels everything downward. Keep pace, or the mountain wears you down.",
      need,
      time: 13,
      rise: 1.9,
      miss: 18,
      ease: 6,
      max: 100,
      hit: 17,
      restore: 16,
      boon: true,
      alt,
      tname: "The couloir",
      tic: "\u{1F5FB}"
    };
  }
  function nIcewall(need, alt) {
    return {
      kind: "icewall",
      icon: "\u{1F4A0}",
      title: "The Ice Wall",
      blurb: "Vertical ice. Every placement matters, and it does not forgive hesitation.",
      need,
      time: 14,
      rise: 1.6,
      miss: 24,
      ease: 9,
      max: 100,
      hit: 20,
      restore: 18,
      boon: true,
      alt,
      tname: "The ice wall",
      tic: "\u{1F4A0}"
    };
  }
  function nWindslab(need, alt) {
    return {
      kind: "windslab",
      icon: "\u{1F300}",
      title: "Gust Field",
      blurb: "Wind-loaded snow, primed to release. Gusts of threat come without warning \u2014 brace and keep moving through them.",
      need,
      time: 14,
      rise: 1,
      miss: 16,
      ease: 8,
      max: 100,
      hit: 16,
      restore: 16,
      boon: true,
      gust: 0.5,
      alt,
      tname: "The gust field",
      tic: "\u{1F300}"
    };
  }
  function nSealedFace(need, alt) {
    return {
      kind: "sealedface",
      icon: "\u{1F512}",
      title: "Ice Shell",
      blurb: "A face sealed in hard blue ice. Your first correct answers break the shell \u2014 then you can climb for real.",
      need,
      time: 15,
      rise: 1.2,
      miss: 20,
      ease: 10,
      max: 100,
      hit: 17,
      restore: 18,
      boon: true,
      shield: 2,
      alt,
      tname: "The ice shell",
      tic: "\u{1F512}"
    };
  }
  function nLongWall(need, alt) {
    return {
      kind: "longwall",
      icon: "\u{1FA9C}",
      title: "The Long Wall",
      blurb: "A wall with no top in sight. The longer you are on it, the less each breather gives back \u2014 and it knows it.",
      need,
      time: 16,
      rise: 1.3,
      miss: 18,
      ease: 12,
      max: 100,
      hit: 16,
      restore: 16,
      boon: true,
      fatigue: true,
      alt,
      tname: "The long wall",
      tic: "\u{1FA9C}"
    };
  }
  function nTempest(need, alt) {
    return {
      kind: "tempest",
      icon: "\u{1F32A}\uFE0F",
      title: "The Tempest",
      blurb: "A storm that feeds on chaos. The closer you are to the edge, the harder it drives you toward it.",
      need,
      time: 13,
      rise: 1.4,
      miss: 20,
      ease: 8,
      max: 100,
      hit: 18,
      restore: 18,
      boon: true,
      enrage: 1.7,
      alt,
      tname: "The tempest",
      tic: "\u{1F32A}\uFE0F"
    };
  }
  function nClosing(need, alt) {
    return {
      kind: "closing",
      icon: "\u23F3",
      title: "The Closing Window",
      blurb: "The weather window is slamming shut. Every second you are given is shorter than the last \u2014 climb.",
      need,
      time: 16,
      rise: 1.2,
      miss: 18,
      ease: 9,
      max: 100,
      hit: 17,
      restore: 18,
      boon: true,
      decay: true,
      alt,
      tname: "The closing window",
      tic: "\u23F3"
    };
  }
  function nAvalanche(need, alt) {
    return {
      kind: "avalanche",
      icon: "\u{1F4A5}",
      title: "The Avalanche",
      blurb: "The whole slope is loaded and silent. It waits, and waits \u2014 then lets go all at once. Be past it when it does.",
      need,
      time: 15,
      rise: 1,
      miss: 20,
      ease: 9,
      max: 100,
      hit: 20,
      restore: 18,
      boon: true,
      phase: true,
      alt,
      tname: "The avalanche",
      tic: "\u{1F4A5}"
    };
  }
  function nShrine(alt) {
    return {
      kind: "shrine",
      icon: "\u26E9\uFE0F",
      title: "Weathered Shrine",
      blurb: "Cairns and faded prayer flags. Climbers leave something here, and the mountain remembers.",
      need: 0,
      restore: 0,
      boon: false,
      alt
    };
  }
  function nCorniceRidge(need, alt) {
    return {
      kind: "corniceridge",
      icon: "\u{1F32C}\uFE0F",
      title: "Wind Lip",
      blurb: "A wind-carved lip of snow over empty air. Gusts hammer it, and one wrong step sends you sliding back.",
      need,
      time: 15,
      rise: 1.1,
      miss: 18,
      ease: 9,
      max: 100,
      hit: 17,
      restore: 16,
      boon: true,
      gust: 0.4,
      streakGate: true,
      alt,
      tname: "The wind lip",
      tic: "\u{1F32C}\uFE0F"
    };
  }
  function nFrozenTitan(need, alt) {
    return {
      kind: "frozentitan",
      icon: "\u{1F9CA}",
      title: "Glacier Block",
      blurb: "A pillar of ancient blue ice. Break through three frozen layers \u2014 then it rages when the threat runs high.",
      need,
      time: 14,
      rise: 1.2,
      miss: 20,
      ease: 9,
      max: 100,
      hit: 18,
      restore: 20,
      boon: true,
      shield: 3,
      enrage: 1.5,
      alt,
      tname: "The glacier block",
      tic: "\u{1F9CA}"
    };
  }
  var ACTS = [
    { name: "The Approach", flavor: "Warm rock, open glacier. The mountain lets you find your rhythm before it shows its teeth." },
    { name: "The Headwall", flavor: "The face rears up. Easy ground is gone \u2014 every pitch wants technique, nerve, and recall under pressure." },
    { name: "The Death Zone", flavor: "Above the last camp the air turns to knives. Everything the mountain saved for the summit push, thrown at once." }
  ];
  function scaleNode(n, act) {
    n.act = act;
    if (n.kind === "rest") return n;
    const sc = 1 + (act - 1) * 0.2;
    n.rise = +(n.rise * sc).toFixed(2);
    n.miss = Math.round(n.miss * (1 + (act - 1) * 0.08));
    n.hit = Math.round(n.hit * (1 + (act - 1) * 0.1));
    n.time = Math.max(8, n.time - (act - 1) * 2);
    return n;
  }
  var BESTIARY = [
    { fn: nSwitch, t: 1, a: "Accuracy", m: "Loose footing. Time barely matters here \u2014 it is all about getting the answer right." },
    { fn: nTraverse, t: 1, a: "Endurance", m: "Nothing is hard, but it never ends and the wind never stops. Steady, grinding pressure." },
    { fn: nSnowfield, t: 1, a: "Accuracy", m: "Deep, forgiving snow. Slow going, but it lets a stumble slide. A place to find your rhythm." },
    { fn: nCrevasse, t: 2, a: "Precision", m: "A snow bridge over a black drop. Few steps to cross, but a single miss is punishing." },
    { fn: nBergschrund, t: 2, a: "Escalating", m: "A widening crack. Every slip costs more stamina than the one before it." },
    { fn: nStorm, t: 2, a: "Speed", m: "A squall building by the second. Correct answers will not calm it \u2014 only speed clears the ridge." },
    { fn: nCouloir, t: 2, a: "Speed", m: "A steep gully funneling everything down. Keep pace, or it wears you down." },
    { fn: nWindslab, t: 2, a: "Chaos", m: "Wind-loaded snow. Gusts of threat come without warning \u2014 brace and push through them." },
    { fn: nVoid, t: 3, a: "No boons", m: "Bare ridge \u2014 nothing works here. No flare, no field notes, no tricks. Just what you know." },
    { fn: nKnife, t: 3, a: "Consistency", m: "A ridge one boot wide. Falter and you slide back down it \u2014 a miss undoes your progress." },
    { fn: nIcewall, t: 3, a: "Precision", m: "Vertical ice. Every placement matters, and it does not forgive hesitation." },
    { fn: nSealedFace, t: 3, a: "Armored", m: "Hard blue ice shell. Your first correct answers break the layers before any climbing counts." },
    { fn: nLongWall, t: 3, a: "Attrition", m: "A wall with no top in sight. The longer you are on it, the less each breather gives back." },
    { fn: nWhiteout, t: 4, a: "Speed", m: "The cloud swallows the ridge. You climb blind and fast, before it closes for good." },
    { fn: nThinAir, t: 4, a: "Attrition", m: "Air too thin to breathe. Standing still bleeds you dry \u2014 keep moving or waste away." },
    { fn: nIcefall, t: 4, a: "Timing", m: "Ice comes down in volleys on its own grim schedule. Read the rhythm; move between the falls." },
    { fn: nTempest, t: 4, a: "Enrage", m: "A storm that feeds on chaos. The closer you are to the edge, the harder it drives you toward it." },
    { fn: nClosing, t: 4, a: "Countdown", m: "A weather window slamming shut. Every second you are given is shorter than the last." },
    { fn: nAvalanche, t: 4, a: "Release", m: "A loaded, silent slope. It waits \u2014 then lets go all at once at the halfway point. Be past it." },
    { fn: nCorniceRidge, t: 3, a: "Chaos ridge", m: "Wind lip over empty air. Random gusts hammer the crossing, and a single miss sends you sliding back." },
    { fn: nFrozenTitan, t: 4, a: "Armored elite", m: "Glacier block with three ice layers to break \u2014 then it rages when the threat runs high." },
    { fn: (n, al) => nGate(n, al, null), t: 5, a: "Competence duel", m: "Tests your weakest TCO exam domain at entry. Every wrong answer emboldens it; every right one drives it back." },
    { fn: nSerac, t: 5, a: "Elite", m: "A wall of unstable ice that can go at any second. Fast, punishing, and it hits hard." },
    { fn: nSummit, t: 5, a: "Final pitch", m: "Summit push \u2014 wind, ice, and everything the mountain has saved for the top." }
  ];
  function nodeEmoji(kind) {
    const m = {
      storm: "\u26C8\uFE0F",
      gate: "\u{1F6E1}\uFE0F",
      rest: "\u{1F3D5}\uFE0F",
      summit: "\u{1F3D4}\uFE0F",
      serac: "\u{1F9CA}",
      whiteout: "\u{1F32B}\uFE0F",
      crevasse: "\u{1F573}\uFE0F",
      traverse: "\u{1F9D7}",
      thinair: "\u{1FAC1}",
      icefall: "\u2604\uFE0F",
      void: "\u{1F311}",
      knife: "\u{1F5E1}\uFE0F",
      berg: "\u26CF\uFE0F",
      snowfield: "\u{1F328}\uFE0F",
      couloir: "\u{1F5FB}",
      icewall: "\u{1F4A0}",
      windslab: "\u{1F300}",
      sealedface: "\u{1F512}",
      longwall: "\u{1FA9C}",
      tempest: "\u{1F32A}\uFE0F",
      closing: "\u23F3",
      avalanche: "\u{1F4A5}",
      corniceridge: "\u{1F32C}\uFE0F",
      frozentitan: "\u{1F9CA}",
      shrine: "\u26E9\uFE0F"
    };
    return m[kind] || "\u26F0\uFE0F";
  }
  function nodeSub(node) {
    const n = node.need;
    if (node.kind === "switchback") return "Footing over speed \u2014 " + n + " to clear";
    if (node.kind === "storm") return "Speed only \u2014 correct answers won't calm it (" + n + ")";
    if (node.kind === "gate") return node.domain ? "Weakest domain \u2014 " + node.domain : "Gatekeeper duel";
    if (node.kind === "rest") return "Catch your breath, then draft a boon";
    if (node.kind === "shrine") return "Leave an offering for a relic, or pass by";
    if (node.kind === "serac") return "Fast and punishing \u2014 " + n + " before the ice lets go";
    if (node.kind === "summit") return "The final pitch \u2014 " + n + " to top out";
    if (node.kind === "whiteout") return "Move fast \u2014 " + n + " before the cloud closes";
    if (node.kind === "crevasse") return "One clean step at a time \u2014 " + n + " to cross";
    if (node.kind === "traverse") return "Endurance \u2014 " + n + " across the long line";
    if (node.kind === "thinair") return "Race your own lungs \u2014 " + n + " before the air takes you";
    if (node.kind === "icefall") return "Between the volleys \u2014 " + n + " to clear";
    if (node.kind === "void") return "No boons, no tricks \u2014 just " + n + " and what you know";
    if (node.kind === "knife") return "Stay clean \u2014 a slip sends you back (" + n + ")";
    if (node.kind === "berg") return "Each slip costs more \u2014 " + n + " across the crack";
    if (node.kind === "snowfield") return "Find your pace \u2014 " + n + " to cross";
    if (node.kind === "couloir") return "Keep pace \u2014 " + n + " before it wears you";
    if (node.kind === "icewall") return "Every placement counts \u2014 " + n + " to the top";
    if (node.kind === "windslab") return "Brace for gusts \u2014 " + n + " through the chaos";
    if (node.kind === "sealedface") return "Break the ice shell first \u2014 " + n + " past the layers";
    if (node.kind === "longwall") return "It never ends \u2014 " + n + ", and rest gives less each time";
    if (node.kind === "tempest") return "It feeds on danger \u2014 " + n + " before it rages";
    if (node.kind === "closing") return "The window is closing \u2014 " + n + ", faster each time";
    if (node.kind === "avalanche") return "It waits, then breaks \u2014 " + n + " before the slope goes";
    if (node.kind === "corniceridge") return "Gusts + setbacks \u2014 " + n + " across the wind lip";
    if (node.kind === "frozentitan") return "Break 3 ice layers \u2014 " + n + " past the glacier block";
    return n + " to clear";
  }

  // src/agents/expedition-director.js
  var OATHS = [
    {
      id: "none",
      name: "Open Route",
      ic: "\u{1F9ED}",
      desc: "No vow. Standard climb.",
      mods: {}
    },
    {
      id: "swift",
      name: "Swift Line",
      ic: "\u26A1",
      desc: "+18% focus timer. Passive threat builds 12% faster.",
      mods: { time: 1.18, rise: 1.12 }
    },
    {
      id: "iron",
      name: "Iron Lungs",
      ic: "\u{1FAC1}",
      desc: "Miss & strike costs \u221218%. Camp heals \u221222%.",
      mods: { stamCost: 0.82, heal: 0.78 }
    },
    {
      id: "scholar",
      name: "Scholar's Vow",
      ic: "\u{1F4DA}",
      desc: "Gatekeepers hit harder (+25% strike). Extra boon draft entering Act III.",
      mods: { gateHit: 1.25, act3Draft: true }
    }
  ];
  var ACHIEVEMENTS = [
    { id: "first_summit", ic: "\u{1F3D4}\uFE0F", name: "Top Out", desc: "Reach the summit once." },
    { id: "summit_5", ic: "\u2B50", name: "Regular", desc: "Summit five times." },
    { id: "duo_found", ic: "\u{1F517}", name: "Synergy", desc: "Activate your first duo power." },
    { id: "clutch_3", ic: "\u{1F480}", name: "Last Legs", desc: "Clear 3 pitches on last legs in one run." },
    { id: "board_50", ic: "\u{1F4CB}", name: "Half Ready", desc: "50+ board-ready concepts." },
    { id: "exam_pass", ic: "\u2705", name: "Mock Pass", desc: "Pass Board Sim at 80% or higher." },
    { id: "daily_ridge", ic: "\u{1F305}", name: "Ridge Walker", desc: "Complete Today's Ridge." },
    { id: "oath_summit", ic: "\u{1F91D}", name: "Bound", desc: "Summit with an expedition oath sworn." },
    { id: "grade_s", ic: "\u{1F48E}", name: "Alpine Grade", desc: "Earn an S grade on a summit run." }
  ];
  var HARD_KINDS = /* @__PURE__ */ new Set([
    "void",
    "knife",
    "icewall",
    "tempest",
    "avalanche",
    "frozentitan",
    "whiteout",
    "closing",
    "corniceridge",
    "sealedface",
    "longwall",
    "thinair",
    "icefall"
  ]);
  function oathById(id) {
    return OATHS.find((o) => o.id === id) || OATHS[0];
  }
  function applyOathMods2(run, base) {
    const oath = oathById(run.oath || "none");
    const m = oath.mods || {};
    let t = base;
    if (m.time) t *= m.time;
    return t;
  }
  function oathStamMult(run) {
    const m = oathById(run.oath || "none").mods || {};
    return m.stamCost || 1;
  }
  function oathHealMult2(run) {
    const m = oathById(run.oath || "none").mods || {};
    return m.heal || 1;
  }
  function oathRiseMult(run) {
    const m = oathById(run.oath || "none").mods || {};
    return m.rise || 1;
  }
  function oathGateHitMult(run) {
    const m = oathById(run.oath || "none").mods || {};
    return m.gateHit || 1;
  }
  function spoilsDraftEligible(node, mode) {
    if (mode !== "clear" || !node?.boon) return false;
    if (node.kind === "gate" || node.kind === "rest") return false;
    return node.act >= 2 || HARD_KINDS.has(node.kind);
  }
  function dailySeed(date = /* @__PURE__ */ new Date()) {
    return date.getFullYear() * 1e4 + (date.getMonth() + 1) * 100 + date.getDate();
  }
  function createSeededRng(seed) {
    let s = seed % 2147483646 + 1;
    return function seeded() {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
  }
  function shuffle(a, rnd2) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd2() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }
  function buildRoute(rnd2, topic, config, hazards = hazard_warden_exports) {
    const {
      scaleNode: scaleNode2,
      nSwitch: nSwitch2,
      nTraverse: nTraverse2,
      nSnowfield: nSnowfield2,
      nCrevasse: nCrevasse2,
      nBergschrund: nBergschrund2,
      nStorm: nStorm2,
      nCouloir: nCouloir2,
      nWindslab: nWindslab2,
      nVoid: nVoid2,
      nKnife: nKnife2,
      nIcewall: nIcewall2,
      nSealedFace: nSealedFace2,
      nLongWall: nLongWall2,
      nCorniceRidge: nCorniceRidge2,
      nWhiteout: nWhiteout2,
      nThinAir: nThinAir2,
      nIcefall: nIcefall2,
      nTempest: nTempest2,
      nClosing: nClosing2,
      nAvalanche: nAvalanche2,
      nFrozenTitan: nFrozenTitan2,
      nGate: nGate2,
      nRest: nRest2,
      nShrine: nShrine2,
      nSerac: nSerac2,
      nSummit: nSummit2
    } = hazards;
    let alt = 1600;
    const step = (g) => {
      alt += g + Math.floor(rnd2() * 70);
      return alt;
    };
    const r = [];
    const A = (n, act) => {
      r.push(scaleNode2(n, act));
      return n;
    };
    const pick = (pool, k) => shuffle(pool.slice(), rnd2).slice(0, k);
    const nd = (base) => base + Math.floor(rnd2() * 2);
    const T1 = [nSwitch2, nTraverse2, nSnowfield2];
    const T2 = [nCrevasse2, nBergschrund2, nStorm2, nCouloir2, nWindslab2];
    const T3 = [nVoid2, nKnife2, nIcewall2, nSealedFace2, nLongWall2, nCorniceRidge2];
    const T4 = [nWhiteout2, nThinAir2, nIcefall2, nTempest2, nClosing2, nAvalanche2, nFrozenTitan2];
    A(nSwitch2(nd(3), step(215)), 1);
    pick([nTraverse2, nSnowfield2], 1).forEach((fn) => {
      A(fn(nd(3), step(220)), 1);
    });
    A(pick(T2, 1)[0](nd(4), step(240)), 1);
    A(nGate2(nd(4), step(235), null), 1);
    A(nRest2(step(150), config), 1);
    pick(T2, 2).forEach((fn) => {
      A(fn(nd(5), step(255)), 2);
    });
    A(pick(T3, 1)[0](nd(5), step(270)), 2);
    if (config.MODS.shrines) A(nShrine2(step(110)), 2);
    A(nGate2(nd(5), step(280), null), 2);
    A(nRest2(step(165), config), 2);
    A(pick(T3, 1)[0](nd(4), step(295)), 3);
    pick(T4, 3).forEach((fn) => {
      A(fn(nd(4), step(305)), 3);
    });
    A(nGate2(nd(5), step(315), null), 3);
    A(nRest2(step(140), config), 3);
    A(nSerac2(5, step(320)), 3);
    A(nSummit2(6, step(360)), 3);
    return r;
  }

  // src/agents/boon-architect.js
  var BOON_TAGS = {
    safety: { label: "Safety", color: "#5fce9f" },
    speed: { label: "Speed", color: "#8fc4dd" },
    streak: { label: "Streak", color: "#f2b64e" },
    threat: { label: "Threat", color: "#e37356" },
    opening: { label: "Opening", color: "#c9a86a" },
    study: { label: "Study", color: "#9b6fd0" }
  };
  var BOONS = {
    surefoot: {
      ic: "\u{1F9CA}",
      name: "Crampons",
      tag: "safety",
      rare: false,
      desc: "First miss each pitch costs no stamina."
    },
    steady: {
      ic: "\u{1FAC1}",
      name: "Steady Breath",
      tag: "safety",
      rare: false,
      desc: "First timeout each pitch costs no stamina."
    },
    fieldnotes: {
      ic: "\u{1F516}",
      name: "Field Notes",
      tag: "study",
      rare: false,
      desc: "Once per pitch, remove one wrong answer."
    },
    headlamp: {
      ic: "\u{1F526}",
      name: "Headlamp",
      tag: "study",
      rare: false,
      desc: "Every question reveals its TCO exam domain."
    },
    momentum: {
      ic: "\u{1F525}",
      name: "Momentum",
      tag: "streak",
      rare: false,
      desc: "Streaks calm the threat harder. A miss resets the bonus."
    },
    vent: {
      ic: "\u{1F4A8}",
      name: "Vent",
      tag: "threat",
      rare: false,
      desc: "Every correct answer chips threat, streak or not."
    },
    tailwind: {
      ic: "\u{1F32C}\uFE0F",
      name: "Tailwind",
      tag: "speed",
      rare: false,
      desc: "+5 seconds on the focus timer."
    },
    coldfront: {
      ic: "\u2744\uFE0F",
      name: "Cold Front",
      tag: "threat",
      rare: false,
      desc: "Passive threat builds 25% slower for the whole pitch."
    },
    provisions: {
      ic: "\u{1F392}",
      name: "Provisions",
      tag: "opening",
      rare: false,
      desc: "Start each pitch with +5 stamina."
    },
    firstlight: {
      ic: "\u{1F305}",
      name: "First Light",
      tag: "opening",
      rare: false,
      desc: "Opening question each pitch: +3 stamina and +3 seconds."
    },
    summitsurge: {
      ic: "\u26F0\uFE0F",
      name: "Summit Surge",
      tag: "streak",
      rare: false,
      desc: "Every 4 correct in a row restores 8 stamina."
    },
    rally: {
      ic: "\u{1F6A9}",
      name: "Rally",
      tag: "safety",
      rare: true,
      desc: "Once per pitch, a miss does not break your streak."
    },
    bulwark: {
      ic: "\u{1F9F1}",
      name: "Bulwark",
      tag: "safety",
      rare: true,
      desc: "Once per pitch, block the next mountain strike completely."
    },
    pitanchor: {
      ic: "\u2693",
      name: "Pit Anchor",
      tag: "safety",
      rare: true,
      desc: "Mountain strikes cost 38% less stamina."
    },
    cairn: {
      ic: "\u{1FAA8}",
      name: "Cairn",
      tag: "streak",
      rare: true,
      desc: "Every 3 correct in a row banks stamina, paid when you clear the pitch."
    },
    highcamp: {
      ic: "\u26FA",
      name: "High Camp",
      tag: "streak",
      rare: true,
      desc: "Clearing a pitch on a streak restores extra stamina."
    },
    quickdraw: {
      ic: "\u23F1\uFE0F",
      name: "Quick Draw",
      tag: "speed",
      rare: true,
      desc: "Each correct answer adds time back to the clock."
    },
    flare: {
      ic: "\u{1F9E8}",
      name: "Flare",
      tag: "threat",
      rare: true,
      desc: "Twice per climb, zero out the threat meter."
    },
    allin: {
      ic: "\u{1F3B2}",
      name: "All In",
      tag: "threat",
      rare: true,
      desc: "Correct answers calm threat much more; wrong answers spike it harder."
    },
    fixedline: {
      ic: "\u{1FAA2}",
      name: "Fixed Line",
      tag: "safety",
      rare: true,
      desc: "Above half stamina, mountain strikes hit 45% softer."
    }
  };
  var LEGACY_BOONS = {
    piton: { ic: "\u{1F4CC}", name: "Piton Pair", tag: "safety", rare: false, desc: "Retired. Crampons covers the first miss now." },
    updraft: { ic: "\u{1F388}", name: "Updraft", tag: "threat", rare: false, desc: "Retired. Now Cold Front." },
    wildfire: { ic: "\u2728", name: "Wildfire", tag: "threat", rare: false, desc: "Retired. Now Vent." },
    redline: { ic: "\u{1FA78}", name: "Red Line", tag: "streak", rare: false, desc: "Retired." },
    routebook: { ic: "\u{1F4D6}", name: "Route Book", tag: "study", rare: false, desc: "Retired." },
    weathereye: { ic: "\u{1F441}\uFE0F", name: "Weather Eye", tag: "study", rare: true, desc: "Retired." },
    alpinestart: { ic: "\u{1F305}", name: "Alpine Start", tag: "opening", rare: false, desc: "Retired. Now First Light." },
    secondwind: { ic: "\u{1F4A8}", name: "Second Wind", tag: "streak", rare: false, desc: "Retired. Now Summit Surge." },
    secondhand: { ic: "\u23F1\uFE0F", name: "Second Hand", tag: "speed", rare: true, desc: "Retired. Now Quick Draw." },
    gambit: { ic: "\u{1F3B2}", name: "Gambit", tag: "threat", rare: true, desc: "Retired. Now All In." },
    buddyrope: { ic: "\u{1FAA2}", name: "Buddy Rope", tag: "safety", rare: true, desc: "Retired. Now Fixed Line." },
    anchor: { ic: "\u2693", name: "Storm Anchor", tag: "safety", rare: true, desc: "Retired. Now Pit Anchor." }
  };
  var DUOS = [
    { ids: ["momentum", "allin"], name: "Runout", ic: "\u{1F3D4}\uFE0F", desc: "On a 5+ streak, correct answers shove threat back hard." },
    { ids: ["vent", "momentum"], name: "Thermal", ic: "\u{1F525}", desc: "Vent chips more threat the longer your streak runs." },
    { ids: ["cairn", "summitsurge"], name: "Deep Pockets", ic: "\u{1F392}", desc: "Cairn banks +3 extra stamina per stack." },
    { ids: ["provisions", "highcamp"], name: "Base Camp", ic: "\u26FA", desc: "Open each pitch with +9 stamina; finish it stronger." },
    { ids: ["rally", "bulwark"], name: "Unbreakable", ic: "\u{1F6E1}\uFE0F", desc: "Using Rally also resets Bulwark." },
    { ids: ["pitanchor", "bulwark"], name: "Fortress", ic: "\u{1F3F0}", desc: "Strikes that get through hurt even less." },
    { ids: ["surefoot", "steady"], name: "Solid Footing", ic: "\u{1F9CA}", desc: "Your first mistake each pitch also sheds threat." },
    { ids: ["tailwind", "quickdraw"], name: "Slipstream", ic: "\u{1F300}", desc: "Quick Draw returns more time per correct." },
    { ids: ["surefoot", "fixedline"], name: "Belay", ic: "\u{1F91D}", desc: "Crampons' free miss also restores 3 stamina." },
    { ids: ["firstlight", "momentum"], name: "Dawn Line", ic: "\u{1F304}", desc: "First Light bonus fires again after your opening correct." },
    { ids: ["headlamp", "fieldnotes"], name: "Night School", ic: "\u{1F319}", desc: "Headlamp also tags the question type on each stem." }
  ];
  function hasDuo(ctx, name) {
    return (ctx.duos || []).some((d) => d.name === name);
  }
  function canUse(ctx, id) {
    if (ctx.enc?.node?.suppress) return false;
    return ctx.run?.boons?.has(id);
  }
  function ownedTags(ctx) {
    const tags = /* @__PURE__ */ new Set();
    (ctx.run?.boons || /* @__PURE__ */ new Set()).forEach((id) => {
      const t = BOONS[id]?.tag;
      if (t) tags.add(t);
    });
    return tags;
  }
  function createBoonArchitect() {
    const api = {
      catalog: BOONS,
      legacy: LEGACY_BOONS,
      resolve(id) {
        return BOONS[id] || LEGACY_BOONS[id] || null;
      },
      duos: DUOS,
      tags: BOON_TAGS,
      has: (ctx, id) => canUse(ctx, id),
      activeDuos(ctx) {
        const owned = ctx.run?.boons || /* @__PURE__ */ new Set();
        return DUOS.filter((d) => owned.has(d.ids[0]) && owned.has(d.ids[1]));
      },
      focusTime(ctx, base) {
        return base + (canUse(ctx, "tailwind") ? 5 : 0);
      },
      riseMultiplier(ctx) {
        return canUse(ctx, "coldfront") ? 0.75 : 1;
      },
      draftPool(ctx) {
        const owned = ctx.run.boons;
        const pool = Object.keys(BOONS).filter((id) => !owned.has(id));
        const tags = ownedTags(ctx);
        const low = ctx.run.stamina < 40;
        const weights = pool.map((id) => {
          const b = BOONS[id];
          let weight = b.rare ? 1 : 3;
          if (low && b.tag === "safety") weight *= 2;
          if (ctx.run.nodeIdx >= 8 && b.tag === "threat") weight *= 1.35;
          if (b.tag === "safety" && tags.has("safety")) {
            const safetyCount = [...owned].filter((x) => BOONS[x]?.tag === "safety").length;
            if (safetyCount >= 2) weight *= 0.3;
            else if (safetyCount >= 1) weight *= 0.55;
          }
          return weight;
        });
        return { pool, weights };
      },
      pickDraft(ctx, rnd2, count = 3) {
        if (ctx.run.boons.size >= (ctx.config?.MAX_BOONS ?? 5)) return ["_stamina"];
        const { pool, weights } = api.draftPool(ctx);
        const pick = [];
        const work = pool.slice();
        const w = weights.slice();
        while (pick.length < count && work.length) {
          const total = w.reduce((a, b) => a + b, 0);
          let r = rnd2() * total;
          let k = 0;
          for (; k < work.length; k++) {
            r -= w[k];
            if (r <= 0) break;
          }
          if (k >= work.length) k = work.length - 1;
          pick.push(work[k]);
          work.splice(k, 1);
          w.splice(k, 1);
        }
        return pick;
      },
      onAcquire(ctx, id) {
        if (id === "flare") ctx.run.flares = 2;
      },
      onPitchEnter(ctx) {
        const banners = [];
        if (canUse(ctx, "provisions")) {
          const bonus = hasDuo(ctx, "Base Camp") ? 9 : 5;
          ctx.staminaDelta = (ctx.staminaDelta || 0) + bonus;
          banners.push({ title: "Provisions", sub: "+" + bonus + " stamina" });
        }
        ctx.enc.firstLightUsed = false;
        ctx.enc.dawnLineUsed = false;
        return { banners };
      },
      onQuestionStart(ctx) {
        if (canUse(ctx, "firstlight") && !ctx.enc.firstLightUsed && ctx.enc.done === 0) {
          ctx.enc.firstLightUsed = true;
          return {
            staminaDelta: 3,
            timeDelta: 3,
            banners: [{ title: "First Light", sub: "+3 stamina \xB7 +3s" }]
          };
        }
        if (canUse(ctx, "firstlight") && hasDuo(ctx, "Dawn Line") && ctx.enc.done === 1 && ctx.enc.streak >= 1 && !ctx.enc.dawnLineUsed) {
          ctx.enc.dawnLineUsed = true;
          return { timeDelta: 2, banners: [{ title: "Dawn Line", sub: "+2s" }] };
        }
        return {};
      },
      onCorrect(ctx) {
        const banners = [];
        let threatDelta = 0;
        let staminaDelta = 0;
        let timeDelta = 0;
        if (canUse(ctx, "momentum") && !ctx.enc.node.noBoonEase) {
          ctx.enc.streakEase = Math.min(7, (ctx.enc.streakEase || 0) + 1.4);
        }
        if (canUse(ctx, "vent") && !ctx.enc.node.noBoonEase) {
          threatDelta -= hasDuo(ctx, "Thermal") ? 2 + Math.min(5, ctx.enc.streak) : 2;
        }
        if (canUse(ctx, "summitsurge") && ctx.enc.streak % 4 === 0) {
          staminaDelta += 8;
          banners.push({ title: "Summit Surge", sub: "+8 stamina" });
        }
        if (canUse(ctx, "quickdraw")) timeDelta += hasDuo(ctx, "Slipstream") ? 2.2 : 1.5;
        if (canUse(ctx, "cairn") && ctx.enc.streak % 3 === 0) {
          const cb = hasDuo(ctx, "Deep Pockets") ? 9 : 6;
          ctx.enc.cairnBank = (ctx.enc.cairnBank || 0) + cb;
          banners.push({ title: "Cairn stacked", sub: "+" + cb + " at clear" });
        }
        let ease = (typeof ctx.enc.node.ease === "number" ? ctx.enc.node.ease : ctx.config.EASE_ON_CORRECT) + (canUse(ctx, "momentum") && !ctx.enc.node.noBoonEase ? ctx.enc.streakEase || 0 : 0);
        if (ctx.enc.node.fatigue) {
          ease *= ctx.enc.easeMul || 1;
          ctx.enc.easeMul = Math.max(0.35, (ctx.enc.easeMul || 1) - 0.14);
        }
        if (canUse(ctx, "allin")) ease *= 1.45;
        if (hasDuo(ctx, "Runout") && ctx.enc.streak >= 5) {
          ease += 9;
          banners.push({ title: "Runout", sub: "threat gives way" });
        }
        if (ctx.enc.node.noBoonEase) ease = 0;
        threatDelta -= ease;
        return { threatDelta, staminaDelta, timeDelta, banners };
      },
      onWrong(ctx) {
        const banners = [];
        let threatDelta = ctx.enc.node.miss;
        let staminaCost = ctx.viaTimeout ? ctx.config.TIMEOUT_COST : ctx.config.MISS_COST;
        let freed = false;
        let keepStreak = false;
        if (ctx.viaTimeout && canUse(ctx, "steady") && !ctx.enc.firstTimeoutUsed) {
          ctx.enc.firstTimeoutUsed = true;
          staminaCost = 0;
          freed = true;
          banners.push({ title: "Steady Breath", sub: "no stamina lost" });
        } else if (!ctx.viaTimeout && canUse(ctx, "surefoot") && !ctx.enc.firstMissUsed) {
          ctx.enc.firstMissUsed = true;
          staminaCost = 0;
          freed = true;
          if (hasDuo(ctx, "Belay")) {
            banners.push({ title: "Belay", sub: "crampons hold \xB7 +3 stamina" });
            return { threatDelta, staminaCost: 0, staminaDelta: 3, banners, keepStreak: false };
          }
          banners.push({ title: "Crampons", sub: "no stamina lost" });
        }
        if (canUse(ctx, "rally") && !ctx.enc.rallyUsed && ctx.enc.streak > 0) {
          ctx.enc.rallyUsed = true;
          if (hasDuo(ctx, "Unbreakable")) ctx.enc.bulwarkUsed = false;
          keepStreak = true;
          banners.push({ title: "Rally", sub: "streak held" });
        }
        if (staminaCost > 0 && ctx.enc.node.escalate) staminaCost += ctx.enc.missCount * ctx.enc.node.escalate;
        if (staminaCost > 0) staminaCost = Math.round(staminaCost * oathStamMult(ctx.run));
        ctx.enc.missCount++;
        if (canUse(ctx, "allin")) threatDelta *= 1.45;
        if (freed && hasDuo(ctx, "Solid Footing")) threatDelta -= 9;
        return { threatDelta, staminaCost, banners, keepStreak };
      },
      onStrike(ctx) {
        if (canUse(ctx, "bulwark") && !ctx.enc.bulwarkUsed) {
          ctx.enc.bulwarkUsed = true;
          return { blocked: true, banners: [{ title: "Bulwark", sub: "strike blocked" }] };
        }
        let hit = ctx.enc.node.hit;
        if (canUse(ctx, "pitanchor")) hit = Math.round(hit * (hasDuo(ctx, "Fortress") ? 0.52 : 0.62));
        if (canUse(ctx, "fixedline") && ctx.run.stamina > ctx.config.STAM_MAX * 0.5) hit = Math.round(hit * 0.55);
        return { hit };
      },
      onGust(ctx) {
        const base = ctx.gust ?? 12 + Math.floor(ctx.rnd() * 10);
        return { threatDelta: base };
      },
      onPitchClear(ctx) {
        let bonus = ctx.enc.cairnBank || 0;
        if (canUse(ctx, "highcamp")) bonus += Math.min(18, ctx.enc.streak * (hasDuo(ctx, "Base Camp") ? 3 : 2));
        return { clearBonus: bonus };
      }
    };
    return {
      id: "boon-architect",
      name: "Boon Architect",
      role: "Draftable modifiers, duos, and pitch-long effects",
      api,
      register(bus) {
        bus.on("pitch:enter", (ctx) => api.onPitchEnter(ctx), "boon-architect");
        bus.on("question:start", (ctx) => api.onQuestionStart(ctx), "boon-architect");
        bus.on("answer:correct", (ctx) => api.onCorrect(ctx), "boon-architect");
        bus.on("answer:wrong", (ctx) => api.onWrong(ctx), "boon-architect");
        bus.on("mountain:strike", (ctx) => api.onStrike(ctx), "boon-architect");
        bus.on("hazard:gust", (ctx) => api.onGust(ctx), "boon-architect");
        bus.on("pitch:clear", (ctx) => api.onPitchClear(ctx), "boon-architect");
      }
    };
  }

  // src/agents/mountain-economy.js
  var WEATHERS = [
    { name: "Clear Dawn", ic: "\u{1F304}", rise: 1, time: 1, heal: 1, score: 1, desc: "A rare kind morning. The mountain, as it is." },
    { name: "Gathering Storm", ic: "\u26C8\uFE0F", rise: 1.18, time: 1, heal: 1, score: 1.1, desc: "Threat builds faster all climb. Summits count for more." },
    { name: "Dead of Night", ic: "\u{1F30C}", rise: 1, time: 0.88, heal: 1, score: 1.15, desc: "Shorter focus windows in the dark \u2014 but the mountain yields more relics." },
    { name: "Thin Season", ic: "\u{1F976}", rise: 1, time: 1, heal: 0.75, score: 1.12, desc: "The mountain gives less back. Endure." }
  ];
  var RELICS = {
    iceaxe: { ic: "\u26CF\uFE0F", name: "Ice Axe", desc: "Once per climb, arrest a fatal fall and hold on at 1 stamina." },
    carabiner: { ic: "\u{1F517}", name: "Lucky Carabiner", desc: "The first strike each pitch costs half." },
    oxygen: { ic: "\u{1F4A8}", name: "Oxygen Cache", desc: "Firing a flare also restores 12 stamina." },
    chalk: { ic: "\u{1F45D}", name: "Chalk Bag", desc: "Reclaiming a loose stone fully calms the threat." },
    rope: { ic: "\u{1F9F6}", name: "Woven Rope", desc: "Gatekeepers strike 25% softer." },
    stone: { ic: "\u{1F48E}", name: "Summit Stone", desc: "Worth +15 summit score. It wants to go home." }
  };
  function pitchRestore(node, mode, run, config) {
    const heal = run.weather ? run.weather.heal : 1;
    if (mode === "rest") return Math.round(node.restore * heal);
    return Math.round(node.restore * config.CLEAR_RESTORE_MULT * heal);
  }
  function hasDuo2(ctx, name) {
    if (ctx.hasDuo) return ctx.hasDuo(name);
    return (ctx.duos || []).some((d) => d.name === name);
  }
  function boonHas(ctx, id) {
    if (ctx.enc?.node?.suppress) return false;
    if (ctx.boon?.has) return ctx.boon.has(ctx, id);
    return ctx.run?.boons?.has(id);
  }
  function createEconomyApi() {
    return {
      raiseThreat(ctx, x) {
        const enc = ctx.enc;
        if (!enc) return;
        enc.threat = Math.max(0, Math.min(enc.max, enc.threat + x));
        if (enc.threat >= enc.max) this.mountainStrikes(ctx);
        ctx.render?.threat?.();
      },
      mountainStrikes(ctx) {
        const { enc, config, run } = ctx;
        enc.threat = Math.max(0, enc.threat - config.THREAT_RESET);
        if (boonHas(ctx, "bulwark") && !enc.bulwarkUsed) {
          enc.bulwarkUsed = true;
          ctx.audio?.tick?.();
          ctx.render?.encChrome?.();
          ctx.banner?.("Bulwark holds", "no stamina lost");
          return { blocked: true };
        }
        let hit = enc.node.hit;
        if (boonHas(ctx, "pitanchor")) hit = Math.round(hit * (hasDuo2(ctx, "Fortress") ? 0.55 : 0.62));
        if (run.relics?.has("carabiner") && !enc.luckyUsed) {
          enc.luckyUsed = true;
          hit = Math.round(hit * 0.5);
        }
        if (run.relics?.has("rope") && enc.node.kind === "gate") hit = Math.round(hit * 0.75);
        if (ctx.addStamina) ctx.addStamina(-hit);
        else if (typeof ctx.staminaDelta === "number") ctx.staminaDelta -= hit;
        else run.stamina = Math.max(0, Math.min(config.STAM_MAX, run.stamina - hit));
        ctx.audio?.strike?.();
        ctx.render?.encChrome?.();
        ctx.render?.stam?.();
        ctx.banner?.("The mountain pushes back", "&#8722;" + hit + " stamina");
        return { hit };
      },
      grantRelic(ctx, id) {
        const { run, config, rnd: rnd2 } = ctx;
        if (!config.MODS.relics) return null;
        const pool = Object.keys(RELICS).filter((k) => !run.relics.has(k));
        if (!pool.length) return null;
        const pick = id && !run.relics.has(id) ? id : pool[Math.floor(rnd2() * pool.length)];
        run.relics.add(pick);
        run.relicLog.push(pick);
        const r = RELICS[pick];
        ctx.banner?.(r.ic + " " + r.name, r.desc);
        ctx.renderHeld?.();
        return pick;
      }
    };
  }

  // src/agents/trail-scholar.js
  var DOMAINS = {
    A: { n: "Data Collection & Graphing", pct: 17 },
    B: { n: "Behavior Assessment", pct: 11 },
    C: { n: "Behavior Acquisition", pct: 25 },
    D: { n: "Behavior Reduction", pct: 19 },
    E: { n: "Documentation & Reporting", pct: 13 },
    F: { n: "Ethics", pct: 15 }
  };
  var DOMAIN_OF = {
    "Continuous Measurement": "A",
    "Discontinuous Measurement": "A",
    "Graphing & Data": "A",
    "Data Collection & Graphing": "A",
    "Assessment & FBA": "B",
    "Preference Assessment": "B",
    "Behavior Assessment": "B",
    Chaining: "C",
    "Generalization & Maintenance": "C",
    Prompting: "C",
    "Prompting & Fading": "C",
    Reinforcement: "C",
    "Reinforcement & Punishment": "C",
    "Schedules of Reinforcement": "C",
    Shaping: "C",
    "Teaching Procedures": "C",
    "Token Economy": "C",
    "Verbal Operants": "C",
    "Motivating Operations": "C",
    "Behavior Reduction": "D",
    "Crisis & Emergency": "D",
    "Differential Reinforcement": "D",
    Extinction: "D",
    "Extinction & Replacement": "D",
    "Functions of Behavior": "D",
    "Documentation & Reporting": "E",
    "Ethics & Scope": "F",
    "Professionalism & Scope": "F"
  };
  function domainOf(q) {
    return q.dom || DOMAIN_OF[q.cat] || "C";
  }
  function weakestDomainLetter(run, bank) {
    const seen = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    const wrong = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    Object.keys(run.prog || {}).forEach((id) => {
      const q = bank[id];
      if (!q) return;
      const d = domainOf(q);
      seen[d] = (seen[d] || 0) + 1;
      wrong[d] += run.prog[id].wrong || 0;
    });
    const order = ["E", "B", "A", "F", "D", "C"];
    let pick = "C";
    let score = -1;
    order.forEach((d) => {
      const s = (wrong[d] || 0) * 3 + Math.max(0, 4 - (seen[d] || 0));
      if (s > score) {
        score = s;
        pick = d;
      }
    });
    return pick;
  }
  var TIERS = [
    { name: "New", c: "var(--t0)" },
    { name: "Learning", c: "var(--t1)" },
    { name: "Familiar", c: "var(--t2)" },
    { name: "Solid", c: "var(--t3)" },
    { name: "Mastered", c: "var(--t4)" }
  ];
  var _rnd = Math.random;
  var _isBusy = () => false;
  function configureTypes({ rnd: rnd2, isBusy }) {
    if (rnd2) _rnd = rnd2;
    if (isBusy) _isBusy = isBusy;
  }
  function shuffle2(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(_rnd() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }
  var TYPES = {
    mc: {
      label: "",
      lifeline: true,
      render(q, host, onPick) {
        const opts = q.a.map((t, idx) => ({ t, correct: idx === q.c }));
        const sh = shuffle2(opts);
        const letters = ["A", "B", "C", "D", "E", "F"];
        host.innerHTML = "";
        function revealAll(chosen) {
          [].slice.call(host.children).forEach((b, k) => {
            b.disabled = true;
            if (sh[k].correct) b.classList.add("correct");
            else if (k === chosen) b.classList.add("wrong");
            else b.classList.add("dim");
          });
        }
        sh.forEach((o, idx) => {
          const b = document.createElement("button");
          b.className = "opt";
          b.innerHTML = '<span class="lx">' + letters[idx] + "</span><span>" + o.t + "</span>";
          b.onclick = function() {
            if (_isBusy()) return;
            revealAll(idx);
            onPick(o.correct, b);
          };
          host.appendChild(b);
        });
        return {
          reveal() {
            revealAll(-1);
          },
          removeWrong() {
            const kids = [].slice.call(host.children);
            for (let k = 0; k < kids.length; k++) {
              if (!sh[k].correct && !kids[k].classList.contains("gone")) {
                kids[k].classList.add("gone");
                return true;
              }
            }
            return false;
          }
        };
      }
    }
  };
  TYPES.odd = { label: "Odd one out", lifeline: true, render: TYPES.mc.render };
  TYPES.tf = {
    label: "True or false",
    lifeline: false,
    render(q, host, onPick) {
      host.innerHTML = "";
      const defs = [
        { t: "True", v: true },
        { t: "False", v: false }
      ];
      function revealAll(chosen) {
        [].slice.call(host.children).forEach((b, k) => {
          b.disabled = true;
          if (defs[k].v === q.correct) b.classList.add("correct");
          else if (k === chosen) b.classList.add("wrong");
          else b.classList.add("dim");
        });
      }
      defs.forEach((o, idx) => {
        const b = document.createElement("button");
        b.className = "opt tf";
        b.innerHTML = '<span class="lx">' + (idx === 0 ? "T" : "F") + "</span><span>" + o.t + "</span>";
        b.onclick = function() {
          if (_isBusy()) return;
          revealAll(idx);
          onPick(o.v === q.correct, b);
        };
        host.appendChild(b);
      });
      return {
        reveal() {
          revealAll(-1);
        },
        removeWrong() {
          return false;
        }
      };
    }
  };
  function createScheduler(config) {
    return {
      pick(ids, last, run, rnd2) {
        if (ids.length === 1) return ids[0];
        const recent = run.recent || [];
        let total = 0;
        const w = ids.map((id) => {
          let wt = config.BOX_WEIGHTS[run.prog[id] ? run.prog[id].tier : 0];
          if (id === last) wt = 0;
          else if (recent.indexOf(id) >= 0) wt *= 0.12;
          total += wt;
          return wt;
        });
        if (total <= 0) return ids[Math.floor(rnd2() * ids.length)];
        let r = rnd2() * total;
        for (let k = 0; k < ids.length; k++) {
          r -= w[k];
          if (r <= 0) return ids[k];
        }
        return ids[ids.length - 1];
      },
      grade(id, correct, viaTimeout, run) {
        const p = run.prog[id] || (run.prog[id] = { tier: 0, seen: 0, right: 0, wrong: 0 });
        p.seen++;
        const lt = config.LOCK_TIER;
        if (correct) {
          p.right++;
          p.tier = Math.min(config.MASTER_TIER, p.tier + 1);
        } else {
          p.wrong++;
          p.tier = viaTimeout ? Math.max(0, p.tier - 1) : Math.max(0, p.tier - 2);
        }
        if (p.tier >= lt) run.locked.add(id);
        else run.locked.delete(id);
        if (p.tier >= config.MASTER_TIER) run.mastered.add(id);
        return p;
      }
    };
  }

  // src/agents/atlas-artisan.js
  var ATLAS_TOKENS = {
    radii: { sm: 10, md: 14, lg: 18, pill: 999 },
    glass: {
      bg: "rgba(8, 18, 30, 0.78)",
      bgSoft: "rgba(8, 18, 30, 0.52)",
      border: "rgba(49, 89, 122, 0.55)",
      blur: "14px"
    },
    glow: {
      lantern: "0 0 28px rgba(242, 182, 78, 0.38)",
      pine: "0 0 22px rgba(95, 206, 159, 0.32)",
      rust: "0 0 20px rgba(227, 115, 86, 0.28)"
    },
    codexTier: {
      1: { label: "Tier I", color: "#5fce9f" },
      2: { label: "Tier II", color: "#8fc4dd" },
      3: { label: "Tier III", color: "#f2b64e" },
      4: { label: "Tier IV", color: "#e37356" },
      5: { label: "Fixed", color: "#9b6fd0" }
    },
    type: {
      hero: "'Space Grotesk', sans-serif",
      body: "'Inter', system-ui, sans-serif",
      mono: "'Space Mono', monospace"
    }
  };
  var MENU_COPY = {
    kicker: "Roguelike study climb",
    tagline: "Know your terms, or the mountain wins.",
    lore: "Draft boons at ledge camps. Survive hazards that punish the concepts you haven\u2019t locked in. What you master on the climb stays learned when you fall.",
    primaryCta: "Climb the mountain",
    focusSummary: "Focus one trail",
    importSummary: "Import saved progress"
  };
  var SCREEN_COPY = {
    map: {
      kicker: "Your line to the summit",
      title: "The route ahead",
      quit: "Turn back & log the climb"
    },
    encounter: {
      stamina: "Stamina",
      threat: "Threat"
    },
    ledge: {
      draft: "Take one for the climb",
      claim: "Claim a boon",
      go: "Back to the route"
    },
    debrief: {
      title: "Trail log",
      trails: "Where each trail stands",
      share: "Share your result",
      export: "Copy trail log",
      exportHint: "Send me your trail log"
    },
    exam: {
      kicker: "Board simulation",
      title: "Mock exam",
      sub: "40 questions weighted to the RBT 3rd-ed blueprint.",
      quit: "End & score now"
    },
    bestiary: {
      kicker: "Mountain codex",
      title: "The Bestiary",
      sub: "Every hazard on the climb \u2014 what it costs, how it kills, and what beats it."
    }
  };
  var DEBRIEF_COPY = {
    summit: {
      icon: "\u{1F3C6}",
      title: "Summit reached",
      sub: "You topped out. The mountain remembers who climbs it \u2014 and what you locked in stays banked."
    },
    fell: {
      icon: "\u{1F30D}",
      title: "Driven back",
      sub: "Stamina ran dry. The mountain sent you down, but every concept you sealed is still yours."
    },
    quit: {
      icon: "\u{1F3D5}",
      title: "Back at camp",
      sub: "You turned back before the ridge took everything. Here\u2019s what the climb still taught you."
    }
  };
  var ACT_TRANSITIONS = {
    2: {
      title: "The Headwall",
      sub: "Easy ground is gone. The face rears up and every pitch wants nerve under pressure.",
      ic: "\u{1F9D7}"
    },
    3: {
      title: "The Death Zone",
      sub: "Above the last camp the air turns to knives. Everything saved for the summit \u2014 thrown at once.",
      ic: "\u2620\uFE0F"
    }
  };
  var DAILY_RIDGE_COPY = {
    label: "Today's Ridge",
    sub: "Same route & weather for every climber today. One shot at the daily line."
  };
  var SECONDARY_ACTIONS = [
    { id: "exam", label: "Board Sim", icon: "\u{1F4CB}", action: "startExam()" },
    { id: "bestiary", label: "Bestiary", icon: "\u{1F4D6}", action: "openBestiary()" }
  ];
  function applyDesignTokens() {
    if (typeof document === "undefined") return;
    const r = document.documentElement.style;
    const t = ATLAS_TOKENS;
    r.setProperty("--glass-bg", t.glass.bg);
    r.setProperty("--glass-bg-soft", t.glass.bgSoft);
    r.setProperty("--glass-border", t.glass.border);
    r.setProperty("--glass-blur", t.glass.blur);
    r.setProperty("--glow-lantern-soft", t.glow.lantern);
    r.setProperty("--glow-pine-soft", t.glow.pine);
    r.setProperty("--radius-ui", t.radii.md + "px");
  }
  function createAtlasArtisan() {
    const api = {
      tokens: ATLAS_TOKENS,
      copy: { menu: MENU_COPY, screens: SCREEN_COPY, debrief: DEBRIEF_COPY, actTransitions: ACT_TRANSITIONS, daily: DAILY_RIDGE_COPY },
      achievementsMarkup(unlocked, total) {
        const n = unlocked.length;
        return '<div class="achieve-hd"><span class="achieve-title">Expedition badges</span><span class="achieve-count">' + n + "/" + total + '</span></div><div class="achieve-grid">' + unlocked.slice(-6).map(function(a) {
          return '<span class="achieve-chip" title="' + a.desc + '">' + a.ic + " " + a.name + "</span>";
        }).join("") + (n === 0 ? '<span class="achieve-empty">Climb to earn your first badge</span>' : "") + "</div>";
      },
      secondaryActions: SECONDARY_ACTIONS,
      applyDesignTokens,
      debriefFor(kind) {
        return DEBRIEF_COPY[kind] || DEBRIEF_COPY.quit;
      },
      codexTier(t) {
        return ATLAS_TOKENS.codexTier[t] || ATLAS_TOKENS.codexTier[1];
      },
      statsMarkup(meta, helpers) {
        const { boardReady, careerRank, fmt, BANK: BANK2 } = helpers;
        const br = boardReady();
        const tot = BANK2.length;
        const pct = tot ? Math.round(br / tot * 100) : 0;
        return '<div class="stat-rank"><span class="stat-rank-name">' + careerRank() + '</span><span class="stat-rank-meta">' + meta.summits + " summit" + (meta.summits === 1 ? "" : "s") + " \xB7 " + meta.runs + " climb" + (meta.runs === 1 ? "" : "s") + " \xB7 best " + fmt(meta.bestAlt || 1600) + 'm</span></div><div class="stat-bar"><span style="width:' + pct + '%"></span></div><div class="stat-foot"><b>' + br + "</b> of " + tot + " board-ready \xB7 " + fmt(meta.miles) + " trail miles</div>";
      },
      mapSubline(run, helpers) {
        const { fmt } = helpers;
        const idx = run.nodeIdx || 0;
        const pit = (run.route || []).filter((n) => n.kind !== "rest").length;
        const cleared = run.nodeCleared || 0;
        if (idx === 0) return "Tap a pitch to scout it. The summit is always one more ridge than you think.";
        let s = cleared + " of " + pit + " pitches behind you";
        if (run.weather && run.weather.name !== "Clear Dawn") s += " under " + run.weather.name;
        if (run.recovered) s += ". You reclaimed " + run.recovered + " loose stone" + (run.recovered > 1 ? "s" : "");
        if (run.clutch) s += ". " + run.clutch + " pitch" + (run.clutch > 1 ? "es" : "") + " cleared on your last legs";
        return s + ".";
      }
    };
    return {
      id: "atlas-artisan",
      name: "Atlas Artisan",
      role: "Visual design system, screen copy, and UI polish",
      api,
      register() {
      }
    };
  }

  // src/core/kernel.js
  var AGENT_META = [
    {
      id: "boon-architect",
      name: "Boon Architect",
      icon: "\u{1F392}",
      color: "#f2b64e",
      blurb: "Draftable modifiers, contextual picks, and duo synergies. Every boon effect routes through one hook bus."
    },
    {
      id: "hazard-warden",
      name: "Hazard Warden",
      icon: "\u26C8\uFE0F",
      color: "#6f83e0",
      blurb: "Encounter factories, act scaling, bestiary truth. Names match mechanics because definitions live in one registry."
    },
    {
      id: "trail-scholar",
      name: "Trail Scholar",
      icon: "\u{1F4DA}",
      color: "#5fce9f",
      blurb: "TCO domains, Leitner scheduling, question formats, and gatekeeper domain targeting from live performance."
    },
    {
      id: "mountain-economy",
      name: "Mountain Economist",
      icon: "\u2696\uFE0F",
      color: "#8fc4dd",
      blurb: "Stamina, threat, weather, relics. One ledger \u2014 UI payout matches code payout."
    },
    {
      id: "expedition-director",
      name: "Expedition Director",
      icon: "\u{1F9ED}",
      color: "#c9a86a",
      blurb: "Three-act route assembly, camp pacing, and summit sequencing tuned by the balance simulator."
    },
    {
      id: "atlas-artisan",
      name: "Atlas Artisan",
      icon: "\u{1F3A8}",
      color: "#e8a0c8",
      blurb: "Visual design tokens, menu composition, and UI polish \u2014 presentation separated from mechanics."
    }
  ];
  function createKernel() {
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
        id: "hazard-warden",
        name: "Hazard Warden",
        api: hazard_warden_exports
      },
      scholar: {
        id: "trail-scholar",
        name: "Trail Scholar",
        api: { DOMAINS, DOMAIN_OF, domainOf, weakestDomainLetter, TIERS, TYPES, configureTypes }
      },
      economy: {
        id: "mountain-economy",
        name: "Mountain Economist",
        api: { WEATHERS, RELICS, pitchRestore, economy }
      },
      expedition: {
        id: "expedition-director",
        name: "Expedition Director",
        api: {
          buildRoute,
          ACTS,
          OATHS,
          ACHIEVEMENTS,
          oathById,
          applyOathMods: applyOathMods2,
          oathStamMult,
          oathHealMult: oathHealMult2,
          oathRiseMult,
          oathGateHitMult,
          spoilsDraftEligible,
          dailySeed,
          createSeededRng
        }
      },
      atlas: atlasAgent
    };
    function makeCtx(run, enc, extras = {}) {
      return {
        run,
        enc,
        config: CONFIG,
        duos: boonAgent.api.activeDuos({ run, enc, config: CONFIG }),
        ...extras
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
      buildRoute: (rnd2, topic) => buildRoute(rnd2, topic, CONFIG, hazard_warden_exports),
      weakestDomain: (run, bank) => weakestDomainLetter(run, bank),
      pitchRestore: (node, mode, run) => pitchRestore(node, mode, run, CONFIG),
      createScheduler: () => scheduler
    };
  }

  // game/bootstrap.js
  var Trail = createKernel();
  window.Trail = Trail;
  var Exp = Trail.agents.expedition.api;
  window.CONFIG = Trail.CONFIG;
  window.BOONS = Trail.agents.boon.api.catalog;
  window.BOON_TAGS = Trail.agents.boon.api.tags;
  window.DUOS = Trail.agents.boon.api.duos;
  window.OATHS = Exp.OATHS;
  window.ACHIEVEMENTS = Exp.ACHIEVEMENTS;
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
  window.spoilsDraftEligible = Exp.spoilsDraftEligible;
  window.dailySeed = Exp.dailySeed;
  window.createSeededRng = Exp.createSeededRng;
  window.applyOathMods = Exp.applyOathMods;
  window.oathStamMult = Exp.oathStamMult;
  window.oathHealMult = Exp.oathHealMult;
  window.oathRiseMult = Exp.oathRiseMult;
  window.oathGateHitMult = Exp.oathGateHitMult;
  var H = Trail.agents.hazard.api;
  [
    "nSwitch",
    "nStorm",
    "nGate",
    "nRest",
    "nSummit",
    "nSerac",
    "nWhiteout",
    "nCrevasse",
    "nTraverse",
    "nThinAir",
    "nIcefall",
    "nVoid",
    "nKnife",
    "nBergschrund",
    "nSnowfield",
    "nCouloir",
    "nIcewall",
    "nWindslab",
    "nSealedFace",
    "nLongWall",
    "nTempest",
    "nClosing",
    "nAvalanche",
    "nShrine",
    "nCorniceRidge",
    "nFrozenTitan"
  ].forEach((k) => {
    window[k] = H[k];
  });
  window.weakestDomainLetter = function() {
    return Trail.weakestDomain(typeof RUN !== "undefined" ? RUN : { prog: {} }, typeof BANK !== "undefined" ? BANK : []);
  };
  window.pitchRestore = function(node, mode) {
    const run = typeof RUN !== "undefined" ? RUN : { weather: null };
    const base = Trail.pitchRestore(node, mode, run);
    if (mode === "rest" || mode === "clear") {
      return Math.round(base * (typeof oathHealMult === "function" ? oathHealMult(run) : 1));
    }
    return base;
  };
  window.buildRoute = function(topic) {
    return Trail.buildRoute(typeof rnd !== "undefined" ? rnd : Math.random, topic);
  };
  window.configureTypes = Trail.agents.scholar.api.configureTypes;
  var _sched = Trail.createScheduler();
  window.SCHED = {
    pick: function(ids, last) {
      return _sched.pick(ids, last, typeof RUN !== "undefined" ? RUN : { prog: {}, recent: [], locked: /* @__PURE__ */ new Set(), mastered: /* @__PURE__ */ new Set() }, typeof rnd !== "undefined" ? rnd : Math.random);
    },
    grade: function(id, correct, viaTimeout) {
      return _sched.grade(id, correct, viaTimeout, RUN);
    }
  };
  window.resolveBoon = function(id) {
    return Trail.agents.boon.api.resolve(id);
  };
  window.BOON = {
    has(id) {
      if (typeof ENC !== "undefined" && ENC?.node?.suppress) return false;
      return typeof RUN !== "undefined" && RUN.boons && RUN.boons.has(id);
    },
    focusTime(base) {
      const t = Trail.agents.boon.api.focusTime(Trail.makeCtx(typeof RUN !== "undefined" ? RUN : {}, typeof ENC !== "undefined" ? ENC : {}), base);
      return typeof applyOathMods === "function" ? applyOathMods(typeof RUN !== "undefined" ? RUN : {}, t) : t;
    }
  };
  window.activeDuos = function() {
    return Trail.agents.boon.api.activeDuos(Trail.makeCtx(RUN, ENC));
  };
  window.hasDuo = function(name) {
    return activeDuos().some((d) => d.name === name);
  };
  window.draftBoons = function() {
    return Trail.agents.boon.api.pickDraft(Trail.makeCtx(RUN, ENC), rnd);
  };
  window.TrailAgents = Trail.meta;
  if (Trail.agents.atlas?.api?.applyDesignTokens) {
    Trail.agents.atlas.api.applyDesignTokens();
  }
  window.dispatchEvent(new CustomEvent("trail:agents-ready", { detail: Trail }));
  var bootstrap_default = Trail;
  return __toCommonJS(bootstrap_exports);
})();
