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
    REST_RESTORE: 42,
    CLEAR_RESTORE_MULT: 0.92,
    THREAT_RESET: 75,
    CRUX_RISE_MULT: 1.2,
    MAX_BOONS: 5,
    MODS: { weather: true, relics: true, shrines: true, tales: true },
    LOCK_TIER: 3,
    MASTER_TIER: 4,
    BOX_WEIGHTS: [9, 6.5, 5, 3.5, 2],
    EASE_ON_CORRECT: 6,
    AUDIO: true,
    EXAM_N: 40,
    EXAM_PASS: 80
  };

  // src/core/climb-engine.js
  var climb_engine_exports = {};
  __export(climb_engine_exports, {
    addStamina: () => addStamina,
    applyTaleFx: () => applyTaleFx,
    blankEnc: () => blankEnc,
    blankRun: () => blankRun,
    clearPitch: () => clearPitch,
    entryThreat: () => entryThreat,
    nextCombatNode: () => nextCombatNode,
    playClimb: () => playClimb,
    raiseThreat: () => raiseThreat,
    resolveAnswer: () => resolveAnswer,
    seededRng: () => seededRng,
    simulatePitchNode: () => simulatePitchNode,
    tickDrift: () => tickDrift
  });
  function seededRng(seed) {
    let a = seed >>> 0 || 1;
    return function() {
      a |= 0;
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function blankRun(over = {}) {
    const run = {
      topic: over.topic || null,
      oath: over.oath || "none",
      route: over.route || [],
      nodeIdx: over.nodeIdx || 0,
      prog: over.prog || {},
      locked: new Set(over.locked || []),
      mastered: new Set(over.mastered || []),
      boons: new Set(over.boons || []),
      flares: over.flares || 0,
      stamina: over.stamina != null ? over.stamina : 100,
      altitude: over.altitude || 1600,
      seen: 0,
      right: 0,
      bestStreak: 0,
      nodeCleared: 0,
      summited: false,
      stones: {},
      stoneNow: null,
      recovered: 0,
      weather: over.weather || null,
      relics: new Set(over.relics || []),
      relicLog: [],
      iceaxeUsed: false,
      clutch: 0,
      lastLegsTold: false,
      freeDraft: false,
      freeDraftFrom: null,
      usedTales: [],
      storyFlags: {},
      featherUsed: false,
      recent: [],
      ending: false
    };
    if (run.boons.has("flare")) run.flares = run.flares || 2;
    return run;
  }
  function blankEnc(node, over = {}) {
    return {
      node,
      need: node.need,
      done: 0,
      threat: over.threat != null ? over.threat : node.startThreat || 0,
      max: node.max || 100,
      lifelineUsed: false,
      firstMissUsed: false,
      firstTimeoutUsed: false,
      rallyUsed: false,
      bulwarkUsed: false,
      streakEase: 0,
      cairnBank: 0,
      missCount: 0,
      spikeT: 0,
      shieldLeft: node.shield || 0,
      easeMul: 1,
      timeMul: 1,
      phaseMul: 1,
      phased: false,
      luckyUsed: false,
      cruxTold: false,
      streak: 0,
      lastId: -1
    };
  }
  function entryThreat(node) {
    let t = node.startThreat || 0;
    if (node.kind === "serac") t = Math.max(t, 25);
    if (node.kind === "summit") t = Math.max(t, 20);
    return t;
  }
  var ctxOf = (trail, run, enc, rnd2, extra) => trail.makeCtx(run, enc, { rnd: rnd2, ...extra || {} });
  function addStamina(trail, run, enc, x, events) {
    const C = trail.CONFIG;
    run.stamina = clamp(run.stamina + x, 0, C.STAM_MAX);
    if (run.stamina > 0 && run.stamina <= 25 && enc && !run.lastLegsTold) {
      run.lastLegsTold = true;
      if (events) events.push({ t: "lastlegs" });
    }
    if (run.stamina <= 0 && enc && !run.ending) {
      if (C.MODS.relics && run.relics && run.relics.has("iceaxe") && !run.iceaxeUsed) {
        run.iceaxeUsed = true;
        run.stamina = 1;
        if (events) events.push({ t: "iceaxe" });
        return;
      }
      run.ending = true;
      if (events) events.push({ t: "fell" });
    }
  }
  function mountainStrike(trail, run, enc, rnd2, events) {
    const C = trail.CONFIG;
    enc.threat = Math.max(0, enc.threat - C.THREAT_RESET);
    const sout = trail.emit("mountain:strike", ctxOf(trail, run, enc, rnd2));
    if (sout.blocked) {
      if (events) events.push({ t: "strike", blocked: true, hit: 0, banners: sout.banners || [] });
      return;
    }
    let hit = sout.hit != null ? sout.hit : enc.node.hit;
    if (enc.node.kind === "gate") {
      hit = Math.round(hit * trail.agents.expedition.api.oathGateHitMult(run));
    }
    if (run.relics && run.relics.has("carabiner") && !enc.luckyUsed) {
      enc.luckyUsed = true;
      hit = Math.round(hit * 0.5);
    }
    if (run.relics && run.relics.has("rope") && enc.node.kind === "gate") hit = Math.round(hit * 0.75);
    addStamina(trail, run, enc, -hit, events);
    if (events) events.push({ t: "strike", blocked: false, hit, banners: sout.banners || [] });
  }
  function raiseThreat(trail, run, enc, x, rnd2, events) {
    if (!enc) return;
    enc.threat = clamp(enc.threat + x, 0, enc.max);
    if (enc.threat >= enc.max) mountainStrike(trail, run, enc, rnd2, events);
  }
  function tickDrift(trail, run, enc, dt, rnd2, events) {
    const C = trail.CONFIG;
    const node = enc.node;
    if (node.rise) {
      let rm = trail.agents.boon.api.riseMultiplier(ctxOf(trail, run, enc, rnd2));
      if (node.enrage && enc.threat >= enc.max * 0.6) rm *= node.enrage;
      if (enc.phaseMul) rm *= enc.phaseMul;
      if (enc.need > 1 && enc.done >= enc.need - 1) rm *= C.CRUX_RISE_MULT;
      rm = Math.min(rm, 2);
      const oathR = trail.agents.expedition.api.oathRiseMult(run);
      raiseThreat(trail, run, enc, node.rise * dt * rm * (run.weather ? run.weather.rise : 1) * oathR, rnd2, events);
    }
    const whistle = !node.suppress && run.boons && run.boons.has("whistle");
    if (node.gust && rnd2() < node.gust * dt) {
      let gustAmt = 12 + Math.floor(rnd2() * 10);
      if (whistle) gustAmt = Math.round(gustAmt / 2);
      const gout = trail.emit("hazard:gust", ctxOf(trail, run, enc, rnd2, { gust: gustAmt }));
      let gustHit = gout.threatDelta != null ? gout.threatDelta : gustAmt;
      if (whistle && gout.threatDelta != null) gustHit = Math.round(gustHit / 2);
      raiseThreat(trail, run, enc, gustHit, rnd2, events);
      if (events) events.push({ t: "gust", amount: gustAmt, banners: gout.banners || [] });
    }
    if (node.drain) addStamina(trail, run, enc, -node.drain * dt, events);
    if (node.spike) {
      enc.spikeT += dt;
      while (enc.spikeT >= (node.spikeEvery || 3.5)) {
        enc.spikeT -= node.spikeEvery || 3.5;
        if (events) events.push({ t: "spike" });
        raiseThreat(trail, run, enc, whistle ? Math.round(node.spike / 2) : node.spike, rnd2, events);
      }
    }
  }
  function resolveAnswer(trail, run, enc, opts) {
    const { correct, viaTimeout, rnd: rnd2 } = opts;
    const events = opts.events || [];
    let timeDelta = 0;
    if (correct) {
      run.right++;
      enc.streak++;
      run.bestStreak = Math.max(run.bestStreak, enc.streak);
      if (enc.shieldLeft > 0) {
        enc.shieldLeft--;
        events.push({ t: "shield", left: enc.shieldLeft });
      } else {
        enc.done++;
        if (enc.node.phase && !enc.phased && enc.done >= Math.ceil(enc.need / 2)) {
          enc.phased = true;
          enc.phaseMul = 1.5;
          raiseThreat(trail, run, enc, 22, rnd2, events);
          events.push({ t: "phase" });
        }
        if (enc.node.stages) {
          for (const st of enc.node.stages) {
            if (!st.entered && enc.done >= st.at && enc.done < enc.need) {
              st.entered = true;
              if (st.set) Object.assign(enc.node, st.set);
              if (st.threat) raiseThreat(trail, run, enc, st.threat, rnd2, events);
              events.push({ t: "stage", title: st.title, sub: st.sub });
            }
          }
        }
        if (enc.need > 1 && enc.done === enc.need - 1 && !enc.cruxTold) {
          enc.cruxTold = true;
          events.push({ t: "crux" });
        }
      }
      if (enc.streak === 4 || enc.streak === 8 || enc.streak === 12) {
        events.push({ t: "streakmark", streak: enc.streak });
      }
      const bout = trail.emit("answer:correct", ctxOf(trail, run, enc, rnd2));
      if (bout.staminaDelta) addStamina(trail, run, enc, bout.staminaDelta, events);
      if (bout.timeDelta) timeDelta = bout.timeDelta;
      if (bout.threatDelta) raiseThreat(trail, run, enc, bout.threatDelta, rnd2, events);
      if (bout.banners && bout.banners.length) events.push({ t: "banners", banners: bout.banners });
    } else {
      const feather = viaTimeout && !run.featherUsed && trail.CONFIG.MODS.relics && run.relics && run.relics.has("feather");
      if (feather) run.featherUsed = true;
      const wout = trail.emit("answer:wrong", ctxOf(trail, run, enc, rnd2, { viaTimeout: !!viaTimeout }));
      if (!wout.keepStreak && !feather) {
        enc.streak = 0;
        enc.streakEase = 0;
      }
      if (feather) {
        events.push({ t: "feather" });
      } else if (wout.staminaCost > 0) addStamina(trail, run, enc, -wout.staminaCost, events);
      else if (wout.staminaDelta) addStamina(trail, run, enc, wout.staminaDelta, events);
      if (wout.threatDelta) raiseThreat(trail, run, enc, wout.threatDelta, rnd2, events);
      if (wout.banners && wout.banners.length) events.push({ t: "banners", banners: wout.banners });
      if (enc.node.streakGate) {
        enc.done = Math.max(0, enc.done - 2);
        events.push({ t: "knockback" });
      }
    }
    return { events, timeDelta, cleared: enc.done >= enc.need };
  }
  function nextCombatNode(run) {
    for (let i = run.nodeIdx; i < run.route.length; i++) {
      const k = run.route[i].kind;
      if (k !== "rest" && k !== "shrine" && k !== "tale") return run.route[i];
    }
    return null;
  }
  function applyTaleFx(trail, run, fx, opts = {}) {
    if (!fx) return;
    if (fx.stam) addStamina(trail, run, opts.enc || null, fx.stam, opts.events);
    if (fx.relic && opts.grantRelic) opts.grantRelic();
    if (fx.flag) {
      run.storyFlags = run.storyFlags || {};
      run.storyFlags[fx.flag] = true;
    }
    if (fx.draftNext) {
      run.freeDraft = true;
      run.freeDraftFrom = "tale";
    }
    if (fx.threatNext) {
      const n = nextCombatNode(run);
      if (n) n.startThreat = Math.min(90, (n.startThreat || 0) + fx.threatNext);
    }
    if (fx.easeNext) {
      const m = nextCombatNode(run);
      if (m && m.need) m.need = Math.max(2, m.need - fx.easeNext);
    }
  }
  function simulatePitchNode(trail, node, opts = {}) {
    const C = trail.CONFIG;
    const rnd2 = seededRng(opts.seed || 1);
    const run = blankRun({
      boons: opts.boons || [],
      relics: opts.relics || [],
      weather: opts.weather || null,
      stamina: opts.stamina != null ? opts.stamina : C.STAM_MAX,
      nodeIdx: opts.nodeIdx || 0
    });
    const enc = blankEnc(node, { threat: node.startThreat || 0 });
    const steps = [];
    let strikes = 0;
    const evts = [];
    const drain = (step) => {
      for (const e of evts) {
        if (e.t === "strike") {
          if (!e.blocked) strikes++;
          steps.push({ kind: "strike", blocked: e.blocked, hit: e.hit, banners: e.banners || [] });
        } else if (step) {
          if (e.t === "banners" && e.banners) step.banners.push(...e.banners);
          if (e.t === "gust" && e.banners) step.banners.push(...e.banners);
          if (e.t === "shield") step.shield = e.left;
          if (e.t === "phase") step.banners.push({ title: "The slope lets go", sub: "it releases all at once" });
          if (e.t === "stage") step.banners.push({ title: e.title, sub: e.sub });
          if (e.t === "knockback") step.banners.push({ title: "Knocked back", sub: "you slide down the ridge" });
        }
      }
      evts.length = 0;
    };
    const pe = trail.emit("pitch:enter", ctxOf(trail, run, enc, rnd2));
    if (pe.staminaDelta) addStamina(trail, run, enc, pe.staminaDelta, evts);
    drain(null);
    const start = { stamina: run.stamina, threat: Math.round(enc.threat), banners: pe.banners || [] };
    const answers = (opts.answers || []).map(
      (a) => typeof a === "boolean" ? { correct: a, viaTimeout: false } : a
    );
    const dps = opts.secondsPerQuestion || 0;
    for (let i = 0; i < answers.length && run.stamina > 0; i++) {
      const a = answers[i];
      if (dps) tickDrift(trail, run, enc, dps, rnd2, evts);
      drain(null);
      if (run.stamina <= 0) break;
      const qs = trail.emit("question:start", ctxOf(trail, run, enc, rnd2));
      if (qs.staminaDelta) addStamina(trail, run, enc, qs.staminaDelta, evts);
      const step = { n: i + 1, correct: a.correct, viaTimeout: !!a.viaTimeout, banners: [] };
      if (qs.banners && qs.banners.length) step.banners.push(...qs.banners);
      run.seen++;
      resolveAnswer(trail, run, enc, { correct: a.correct, viaTimeout: !!a.viaTimeout, rnd: rnd2, events: evts });
      drain(step);
      step.stamina = run.stamina;
      step.threat = Math.round(enc.threat);
      step.streak = enc.streak;
      step.done = enc.done;
      steps.push(step);
      if (enc.done >= enc.need) {
        step.cleared = true;
        break;
      }
    }
    const cleared = enc.done >= enc.need;
    let clearRestore = 0;
    if (cleared) {
      const co = trail.emit("pitch:clear", ctxOf(trail, run, enc, rnd2));
      clearRestore = (co.clearBonus || 0) + trail.pitchRestore(node, "clear", run);
      addStamina(trail, run, null, clearRestore, null);
    }
    return {
      node,
      start,
      steps,
      strikes,
      cleared,
      final: {
        stamina: run.stamina,
        threat: Math.round(enc.threat),
        streak: enc.streak,
        bestStreak: run.bestStreak,
        done: enc.done,
        need: enc.need,
        clearRestore,
        survived: run.stamina > 0
      }
    };
  }
  function questionOutcome(accuracy, timeoutRate, rnd2) {
    const r = rnd2();
    if (r < accuracy) return { correct: true, viaTimeout: false };
    return { correct: false, viaTimeout: r < accuracy + timeoutRate };
  }
  var RELIC_DROP_KINDS = ["whiteout", "thinair", "icefall", "tempest", "closing", "avalanche", "frozentitan"];
  function clearPitch(trail, run, enc, opts = {}) {
    const rnd2 = opts.rnd || Math.random;
    run.nodeCleared++;
    const cout = trail.emit("pitch:clear", ctxOf(trail, run, enc, rnd2));
    const clutch = run.stamina > 0 && run.stamina <= 25;
    if (clutch) run.clutch = (run.clutch || 0) + 1;
    const restore = trail.pitchRestore(enc.node, "clear", run) + (cout.clearBonus || 0);
    addStamina(trail, run, null, restore, null);
    let relic = false;
    if (RELIC_DROP_KINDS.indexOf(enc.node.kind) >= 0 && rnd2() < (run.weather && run.weather.name === "Dead of Night" ? 0.5 : 0.3)) {
      relic = true;
      if (opts.grantRelic) opts.grantRelic();
    }
    return { restore, clutch, relic };
  }
  function playClimb(trail, opts = {}) {
    const C = trail.CONFIG;
    const rnd2 = seededRng(opts.seed != null ? opts.seed : 1);
    const accuracy = opts.accuracy != null ? opts.accuracy : 0.82;
    const timeoutRate = opts.timeoutRate != null ? opts.timeoutRate : 0.06;
    const answerSeconds = opts.answerSeconds != null ? opts.answerSeconds : 7;
    const draftPolicy = opts.draftPolicy || "none";
    const talePolicy = opts.talePolicy || "skip";
    const run = blankRun({ weather: opts.weather || null, stamina: C.STAM_MAX });
    run.route = trail.buildRoute(rnd2, opts.topic || null);
    const grantRelic = () => trail.economy.grantRelic({ run, config: C, rnd: rnd2, banner: null, renderHeld: null });
    for (const id of opts.fixedBoons || []) {
      run.boons.add(id);
      trail.agents.boon.api.onAcquire(ctxOf(trail, run, null, rnd2), id);
    }
    const takeDraft = (enc) => {
      if (draftPolicy === "none") return;
      if (run.boons.size >= C.MAX_BOONS) return;
      const picks = trail.agents.boon.api.pickDraft(ctxOf(trail, run, enc, rnd2), rnd2);
      const real = (picks || []).filter((p) => p !== "_stamina");
      if (real.length) {
        run.boons.add(real[0]);
        trail.agents.boon.api.onAcquire(ctxOf(trail, run, enc, rnd2), real[0]);
      }
    };
    let act3Entry = null;
    let strikes = 0;
    let questions = 0;
    for (let ni = 0; ni < run.route.length; ni++) {
      const node = run.route[ni];
      run.nodeIdx = ni;
      if (node.act === 3 && act3Entry === null) act3Entry = run.stamina;
      if (node.kind === "rest") {
        addStamina(trail, run, null, trail.pitchRestore(node, "rest", run), null);
        const scholarDraft = run.freeDraft;
        if (scholarDraft) {
          run.freeDraft = false;
          run.freeDraftFrom = null;
        }
        if (draftPolicy !== "none" || scholarDraft) takeDraft(null);
        continue;
      }
      if (node.kind === "shrine") {
        if (opts.shrinePolicy === "offer") {
          addStamina(trail, run, null, -12, null);
          grantRelic();
        }
        continue;
      }
      if (node.kind === "tale") {
        if (talePolicy === "skip") continue;
        const keeper = trail.agents.keeper.api;
        const tale = keeper.drawTale(rnd2, node.act || 1, run.usedTales);
        run.usedTales.push(tale.id);
        const choice = tale.choices[talePolicy === "second" ? 1 : 0] || tale.choices[0];
        const out = keeper.resolveChoice(choice, rnd2);
        applyTaleFx(trail, run, out.fx, { grantRelic });
        continue;
      }
      const enc = blankEnc(node, { threat: entryThreat(node) });
      run.altitude = node.alt || run.altitude;
      const evts = [];
      const pe = trail.emit("pitch:enter", ctxOf(trail, run, enc, rnd2));
      if (pe.staminaDelta) addStamina(trail, run, enc, pe.staminaDelta, evts);
      const cap = opts.maxQuestionsPerPitch || node.need * 3 + 10;
      let asked = 0;
      while (run.stamina > 0 && enc.done < enc.need && asked < cap) {
        asked++;
        questions++;
        tickDrift(trail, run, enc, answerSeconds, rnd2, evts);
        if (run.stamina <= 0) break;
        const qs = trail.emit("question:start", ctxOf(trail, run, enc, rnd2));
        if (qs.staminaDelta) addStamina(trail, run, enc, qs.staminaDelta, evts);
        const o = questionOutcome(accuracy, timeoutRate, rnd2);
        run.seen++;
        resolveAnswer(trail, run, enc, { correct: o.correct, viaTimeout: o.viaTimeout, rnd: rnd2, events: evts });
      }
      strikes += evts.filter((e) => e.t === "strike" && !e.blocked).length;
      if (run.stamina <= 0 || enc.done < enc.need) {
        return {
          summited: false,
          fell: true,
          stamina: run.stamina,
          act3Entry,
          strikes,
          seen: run.seen,
          right: run.right,
          bestStreak: run.bestStreak,
          nodeCleared: run.nodeCleared,
          altitude: run.altitude,
          questions
        };
      }
      clearPitch(trail, run, enc, { rnd: rnd2, grantRelic });
      if (node.kind === "summit") {
        run.summited = true;
        return {
          summited: true,
          fell: false,
          stamina: run.stamina,
          act3Entry,
          strikes,
          seen: run.seen,
          right: run.right,
          bestStreak: run.bestStreak,
          nodeCleared: run.nodeCleared,
          altitude: run.altitude,
          questions
        };
      }
      const spoils = trail.agents.expedition.api.spoilsDraftEligible(node, "clear") && rnd2() < 0.42;
      const promised = run.freeDraft;
      if (promised) {
        run.freeDraft = false;
        run.freeDraftFrom = null;
      }
      if (node.kind === "gate" || spoils || promised) takeDraft(enc);
    }
    return {
      summited: false,
      fell: run.stamina <= 0,
      stamina: run.stamina,
      act3Entry,
      strikes,
      seen: run.seen,
      right: run.right,
      bestStreak: run.bestStreak,
      nodeCleared: run.nodeCleared,
      altitude: run.altitude,
      questions
    };
  }

  // src/agents/hazard-warden.js
  var hazard_warden_exports = {};
  __export(hazard_warden_exports, {
    ACTS: () => ACTS,
    BESTIARY: () => BESTIARY,
    FOE_COLORS: () => FOE_COLORS,
    GATEKEEPERS: () => GATEKEEPERS,
    TIER_COMBAT: () => TIER_COMBAT,
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
    nRockfall: () => nRockfall,
    nSealedFace: () => nSealedFace,
    nSerac: () => nSerac,
    nShrine: () => nShrine,
    nSnowfield: () => nSnowfield,
    nStorm: () => nStorm,
    nSummit: () => nSummit,
    nSwitch: () => nSwitch,
    nTale: () => nTale,
    nTempest: () => nTempest,
    nThinAir: () => nThinAir,
    nTraverse: () => nTraverse,
    nVerglas: () => nVerglas,
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
    rockfall: "#c2a178",
    verglas: "#8fd0e8",
    shrine: "#c9a86a",
    rest: "#d89b52",
    tale: "#b9a2d8"
  };
  function foeColor(kind) {
    return FOE_COLORS[kind] || "#8a97ab";
  }
  var TIER_COMBAT = {
    1: { missCost: 10, timeoutCost: 7 },
    2: { missCost: 12, timeoutCost: 8 },
    3: { missCost: 14, timeoutCost: 10 },
    4: { missCost: 16, timeoutCost: 11 },
    5: { missCost: 17, timeoutCost: 12 }
  };
  function nSwitch(need, alt) {
    return {
      kind: "switchback",
      icon: "\u{1FAA8}",
      title: "Scree Slope",
      blurb: "A slope of broken rock that moves underfoot. Slow is fine. Wrong is what slides.",
      need,
      tier: 1,
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
      blurb: "Snow coming in sideways and worse by the second. Nothing you know will quiet it. Outrun it or wear it.",
      need,
      tier: 2,
      time: 12,
      rise: 1.85,
      miss: 15,
      ease: 0,
      max: 100,
      hit: 15,
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
      blurb: domain ? "The route narrows to a test. It asks " + domain + " \u2014 nothing else \u2014 and it hits harder than anything below it." : "The route narrows to a test. It asks your weakest subject \u2014 nothing else \u2014 and it hits harder than anything below it.",
      need,
      tier: 5,
      time: 16,
      rise: 1.55,
      miss: 30,
      ease: 10,
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
      blurb: "Six moves of ridge to the top. The first few are steady. The last cross a cornice \u2014 snow curled over open air \u2014 with no margin left on them.",
      need,
      tier: 5,
      time: 15,
      rise: 2.1,
      miss: 22,
      ease: 8,
      max: 100,
      hit: 20,
      restore: 14,
      boon: false,
      alt,
      stages: [
        { at: 2, title: "The Shoulder is behind you", sub: "the ridge narrows \u2014 the wind picks a side", set: { rise: 2.7 }, threat: 12 },
        { at: 4, title: "The Cornice", sub: "snow over empty air \u2014 nothing heavy stands here", set: { rise: 3.2, time: 12 }, threat: 16 }
      ],
      tname: "Summit push",
      tic: "\u2744\uFE0F"
    };
  }
  function nSerac(need, alt) {
    return {
      kind: "serac",
      icon: "\u{1F9CA}",
      title: "Falling Serac",
      blurb: "A hanging wall of ice, groaning before you even rope up. It will come down today whether you are under it or not. Climb fast.",
      need,
      tier: 5,
      time: 13,
      rise: 2.6,
      miss: 22,
      ease: 10,
      max: 100,
      hit: 22,
      restore: 20,
      boon: true,
      alt,
      stages: [
        { at: 3, title: "The ice lets go above", sub: "run the last moves \u2014 do not look up", set: { rise: 3.1 }, threat: 18 }
      ],
      tname: "The serac",
      tic: "\u{1F9CA}"
    };
  }
  function nWhiteout(need, alt) {
    return {
      kind: "whiteout",
      icon: "\u{1F32B}\uFE0F",
      title: "Blinding Whiteout",
      blurb: "The cloud comes up the face and the world goes to milk. No ridge, no sky, no down. Climb by feel, and climb now.",
      need,
      tier: 4,
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
      blurb: "A rib of old snow over a dark with no bottom. A few careful steps and you are across. It only counts the wrong ones.",
      need,
      tier: 2,
      time: 15,
      rise: 1.25,
      miss: 32,
      ease: 11,
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
      blurb: "Ledges strung across the face for the better part of a mile. None of it is hard. All of it is long, and the wind leans on you the whole way.",
      need,
      tier: 1,
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
      blurb: "The air up here is a rumor. Your body burns whether you move or not \u2014 so move.",
      need,
      tier: 4,
      time: 16,
      rise: 1.1,
      miss: 18,
      ease: 8,
      max: 100,
      hit: 13,
      restore: 16,
      boon: true,
      drain: 0.34,
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
      blurb: "The serac field above calves on its own clock, tons at a time. Watch. Count. Cross. The ice does not aim, and it does not need to.",
      need,
      tier: 4,
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
      blurb: "Rock scoured bare by a hundred winters. Nothing in your pack works up here \u2014 no gear, no notes, no flare. Just you, and whatever stuck.",
      need,
      tier: 3,
      time: 15,
      rise: 1.6,
      miss: 22,
      ease: 9,
      max: 100,
      hit: 17,
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
      blurb: "A crest the width of your boot with air on both sides. There is no standing still here. One bad step puts you back where the move began.",
      need,
      tier: 3,
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
      blurb: "The crack between glacier and mountain runs right beside your line. Every stumble feeds it, and the next one always costs more.",
      need,
      tier: 2,
      time: 15,
      rise: 1.2,
      miss: 17,
      ease: 9,
      max: 100,
      hit: 16,
      restore: 18,
      boon: true,
      escalate: 6,
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
      blurb: "Thigh-deep powder that swallows your mistakes along with your boots. Slow going. Kind going. Find a rhythm and keep it.",
      need,
      tier: 1,
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
      title: "The Chute",
      blurb: "A chute of ice between rock walls. Everything the mountain sheds comes down through here, and your route goes up it. Do not linger.",
      need,
      tier: 2,
      time: 13,
      rise: 1.9,
      miss: 18,
      ease: 6,
      max: 100,
      hit: 17,
      restore: 16,
      boon: true,
      alt,
      tname: "The chute",
      tic: "\u{1F5FB}"
    };
  }
  function nIcewall(need, alt) {
    return {
      kind: "icewall",
      icon: "\u{1F4A0}",
      title: "The Ice Wall",
      blurb: "Ninety degrees of blue ice. Swing, test, trust, step up. Rush one placement and the whole pitch knows it.",
      need,
      tier: 3,
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
      blurb: "Wind-packed slabs that boom underfoot. The gusts keep no schedule and send no warning. Stay low and keep moving.",
      need,
      tier: 2,
      time: 14,
      rise: 1,
      miss: 16,
      ease: 8,
      max: 100,
      hit: 16,
      restore: 16,
      boon: true,
      gust: 0.11,
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
      blurb: "Overnight melt froze the face into a single blue glaze. Break the shell first. The climbing starts underneath.",
      need,
      tier: 3,
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
      blurb: "You cannot see the top from the bottom, and not from halfway either. The first breather on this wall helps. The fifth barely does.",
      need,
      tier: 3,
      time: 16,
      rise: 1.5,
      miss: 20,
      ease: 11,
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
      blurb: "A storm with an appetite. Let the danger build and the wind rises to meet it, driving you toward the edge it wants you over. Starve it calm.",
      need,
      tier: 4,
      time: 13,
      rise: 1.55,
      miss: 22,
      ease: 8,
      max: 100,
      hit: 18,
      restore: 18,
      boon: true,
      enrage: 1.9,
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
      blurb: "The forecast bought you an hour and the mountain is spending it fast. Each chance you get is briefer than the last. Go.",
      need,
      tier: 4,
      time: 14,
      rise: 2,
      miss: 24,
      ease: 7,
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
      blurb: "A loaded slope, quiet the way held breath is quiet. Somewhere past the middle it lets go. Where you stand when it does is up to you.",
      need,
      tier: 4,
      time: 15,
      rise: 1.25,
      miss: 22,
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
  function nRockfall(need, alt) {
    return {
      kind: "rockfall",
      icon: "\u{1F94C}",
      title: "Rockfall Gully",
      blurb: "Pebbles come down the gully in bursts, rattling off the walls ahead of you. Count the quiet between volleys. That is when you move.",
      need,
      tier: 1,
      time: 18,
      rise: 0.7,
      miss: 14,
      ease: 8,
      max: 100,
      hit: 12,
      restore: 15,
      boon: true,
      spike: 7,
      spikeEvery: 7,
      alt,
      tname: "The rockfall",
      tic: "\u{1F94C}"
    };
  }
  function nVerglas(need, alt) {
    return {
      kind: "verglas",
      icon: "\u{1FA9E}",
      title: "Black Ice",
      blurb: "Meltwater froze over the rock in a skin too thin to see. Your edges bite for a moment after every move. Move again before they skate.",
      need,
      tier: 3,
      time: 15,
      rise: 1.9,
      miss: 18,
      ease: 4,
      max: 100,
      hit: 17,
      restore: 18,
      boon: true,
      swift: 9,
      alt,
      tname: "The black ice",
      tic: "\u{1FA9E}"
    };
  }
  function nShrine(alt) {
    return {
      kind: "shrine",
      icon: "\u26E9\uFE0F",
      title: "Weathered Shrine",
      blurb: "Stacked stones and faded prayer flags. Climbers leave an offering here for luck. Sometimes the luck is real.",
      need: 0,
      restore: 0,
      boon: false,
      alt
    };
  }
  function nTale(alt) {
    return {
      kind: "tale",
      icon: "\u{1F5FF}",
      title: "Waymark",
      blurb: "Something off the route wants a decision from you. No clock, no threat \u2014 just a choice you keep.",
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
      blurb: "A lip of snow curled over empty air by wind that has not stopped in years. It bucks without warning, and a slip undoes honest work.",
      need,
      tier: 3,
      time: 15,
      rise: 0.9,
      miss: 14,
      ease: 9,
      max: 100,
      hit: 15,
      restore: 18,
      boon: true,
      gust: 0.05,
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
      blurb: "A pillar of glacier ice three winters thick. All three layers break before the climbing counts, and old ice splinters hard when it starts to lose.",
      need,
      tier: 4,
      time: 14,
      rise: 1.1,
      miss: 19,
      ease: 9,
      max: 100,
      hit: 17,
      restore: 20,
      boon: true,
      shield: 3,
      enrage: 1.8,
      alt,
      tname: "The glacier block",
      tic: "\u{1F9CA}"
    };
  }
  var ACTS = [
    { name: "The Approach", flavor: "Firm rock, open glacier, the last of the day\u2019s warmth still in the stone. The summit stands a long way overhead." },
    { name: "The Headwall", flavor: "The glacier ends at a wall of rock and blue ice, dead vertical. The walking is finished. From here it is your hands, your edges, and what you actually know." },
    { name: "The Death Zone", flavor: "Above the last camp the air holds half the oxygen it did below. Your legs burn, your thoughts blur, your body stops recovering. Keep moving." }
  ];
  var GATEKEEPERS = {
    1: { name: "Bram of the First Narrows", line: '"Everyone thinks they know the low ground. Show me."', beaten: '"Hm. Go on, then. Odile is less patient than I am."' },
    2: { name: "Odile of the Headwall", line: '"Bram goes easy. I am the reason climbers study."', beaten: '"Adequate. Say nothing to the one above \u2014 words are wasted there."' },
    3: { name: "The Last Examiner", line: "It says nothing. It simply opens the ledger of everything you have ever missed.", beaten: "It closes the ledger, and for one moment \u2014 you would swear \u2014 it bows." }
  };
  function scaleNode(n, act) {
    n.act = act;
    if (n.kind === "gate" && GATEKEEPERS[act]) {
      n.title = GATEKEEPERS[act].name;
      n.bossLine = GATEKEEPERS[act].line;
      n.bossBeaten = GATEKEEPERS[act].beaten;
      n.tname = GATEKEEPERS[act].name.split(" ")[0] === "The" ? "The Examiner" : GATEKEEPERS[act].name.split(" ")[0];
    }
    if (n.kind === "rest") return n;
    const sc = 1 + (act - 1) * 0.22;
    n.rise = +(n.rise * sc).toFixed(2);
    n.miss = Math.round(n.miss * (1 + (act - 1) * 0.08));
    n.hit = Math.round(n.hit * (1 + (act - 1) * 0.1));
    n.time = Math.max(8, n.time - (act - 1) * 2);
    if (n.restore) n.restore = Math.max(8, Math.round(n.restore * (1 - (act - 1) * 0.08)));
    if (n.kind === "gate") {
      if (act === 1) {
        n.decay = true;
        n.miss = Math.round(n.miss * 0.8);
      } else if (act === 2) {
        n.streakGate = true;
        n.enrage = 1.3;
        n.miss = Math.round(n.miss * 0.68);
      } else if (act === 3) {
        n.enrage = 1.4;
        n.lapsePool = true;
        n.startThreat = Math.max(n.startThreat || 0, 8);
        n.miss = Math.round(n.miss * 0.82);
        n.stages = [
          { at: 2, title: "It turns a page", sub: "the questions sharpen \u2014 it has found an edge", set: { rise: +(n.rise * 1.12).toFixed(2) }, threat: 9 },
          { at: 4, title: "It reads the last line", sub: "everything you have missed, all at once", set: { rise: +(n.rise * 1.28).toFixed(2) }, threat: 12 }
        ];
      }
    }
    return n;
  }
  var BESTIARY = [
    { fn: nSwitch, a: "Accuracy", m: "Accuracy check. Generous clock, ordinary misses, no surprises." },
    { fn: nTraverse, a: "Endurance", m: "Endurance check. Steady passive threat across a long, easy line." },
    { fn: nSnowfield, a: "Accuracy", m: "Recovery ground. Slow clock, soft misses, forgiving all around." },
    { fn: nRockfall, a: "Timing", m: "Timing drill. Small threat spikes land on a fixed rhythm." },
    { fn: nCrevasse, a: "Precision", m: "Precision check. Few questions, heavy cost per miss." },
    { fn: nBergschrund, a: "Escalating", m: "Escalating misses. Each slip costs more stamina than the one before." },
    { fn: nStorm, a: "Speed", m: "Pure speed. Correct answers shed no threat here; only pace survives it." },
    { fn: nCouloir, a: "Speed", m: "Speed check. Fast-building threat, ordinary misses." },
    { fn: nWindslab, a: "Chaos", m: "Chaos. Random gusts of threat, no warning and no pattern." },
    { fn: nVoid, a: "No boons", m: "Boon suppression. Flare, notes, and every boon go dark for the pitch." },
    { fn: nKnife, a: "Consistency", m: "Consistency check. A miss knocks your progress back down the ridge." },
    { fn: nIcewall, a: "Precision", m: "Precision under pace. Expensive misses on a quick clock." },
    { fn: nSealedFace, a: "Armored", m: "Armored. Two correct answers break the shell before progress counts." },
    { fn: nLongWall, a: "Attrition", m: "Attrition. The threat relief on each correct answer keeps shrinking." },
    { fn: nVerglas, a: "Fluency", m: "Fluency check. Quick correct answers shed extra threat; slow ones shed almost none." },
    { fn: nWhiteout, a: "Speed", m: "Blind speed. The shortest clock on the mountain and thin relief." },
    { fn: nThinAir, a: "Attrition", m: "Attrition. Stamina drains every second you stand on the pitch." },
    { fn: nIcefall, a: "Timing", m: "Timing. Heavy threat volleys land on a fixed schedule." },
    { fn: nTempest, a: "Enrage", m: "Enrage. Past sixty percent threat, everything builds faster." },
    { fn: nClosing, a: "Countdown", m: "Countdown. Each question\u2019s clock is shorter than the last." },
    { fn: nAvalanche, a: "Release", m: "Release. At the halfway mark the slope lets go all at once." },
    { fn: nCorniceRidge, a: "Chaos ridge", m: "Chaos ridge. Gusts without warning, and a miss slides you back." },
    { fn: nFrozenTitan, a: "Armored elite", m: "Armored elite. Three shield layers, and it enrages when threat runs high." },
    { fn: (n, al) => nGate(n, al, null), a: "The examiners", m: "Three fights, not one: Bram rapid-fires on a tightening clock, Odile knocks you back on a miss, the Last Examiner drills everything you have ever missed in stages." },
    { fn: nSerac, a: "Elite", m: "Elite. Starts angry \u2014 a quarter of the threat bar is already lit." },
    { fn: nSummit, a: "Final pitch", m: "Final pitch in three stages \u2014 shoulder, cornice, top \u2014 each faster and angrier than the last." }
  ].map((e) => ({ ...e, t: e.fn(1, 0).tier }));
  function nodeEmoji(kind) {
    const m = {
      switchback: "\u{1FAA8}",
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
      rockfall: "\u{1F94C}",
      verglas: "\u{1FA9E}",
      shrine: "\u26E9\uFE0F",
      tale: "\u{1F5FF}"
    };
    return m[kind] || "\u26F0\uFE0F";
  }
  function nodeSub(node) {
    const n = node.need;
    const map = {
      switchback: `Loose rock. Take it slow and clean \u2014 ${n} careful answers gets you up.`,
      storm: `Right answers won't calm this one. Only speed will. Outclimb it in ${n}.`,
      gate: node.domain ? `An examiner. It asks ${node.domain}, and nothing else.` : `An examiner. It asks whatever you know least.`,
      rest: `A fire, a flat spot, and a moment to pick new gear.`,
      shrine: `Leave an offering if you like. Sometimes the mountain answers.`,
      tale: `A story is waiting here. How it ends is up to you.`,
      serac: `The ice above is already falling. Be gone in ${n} before it lands.`,
      summit: `The last ${n}. Three stages, each meaner than the one before.`,
      whiteout: `You can't see three meters. Answer ${n} fast, on instinct.`,
      crevasse: `A thin snow bridge. ${n} steady steps across \u2014 a slip here costs dearly.`,
      traverse: `A long, easy line that never quite ends. Pace yourself through ${n}.`,
      thinair: `The air itself drains you every second. Finish ${n} before your legs notice.`,
      icefall: `Ice falls on a rhythm here. Learn the rhythm, clear ${n} between volleys.`,
      void: `Nothing in your pack works up here. Just you and ${n} honest answers.`,
      knife: `A ridge the width of your boot. One slip knocks you back down it. ${n} to cross.`,
      berg: `A widening crack beside the route. Every slip feeds it, and each one costs more. ${n} to pass.`,
      snowfield: `Deep, forgiving snow. Find a rhythm and put ${n} behind you.`,
      couloir: `A narrow chute that funnels everything the mountain drops. Move \u2014 ${n} and out.`,
      icewall: `Vertical blue ice. Misses are expensive here. ${n} solid placements to the top.`,
      windslab: `Gusts with no schedule and no warning. Hold steady through ${n}.`,
      sealedface: `The face is sealed in an ice shell. Crack it first, then climb ${n}.`,
      longwall: `A wall that keeps going. Each breather helps less than the last. ${n} to top out.`,
      tempest: `A storm that feeds on danger. Keep the threat starved while you clear ${n}.`,
      closing: `Your weather window is closing, and every chance is shorter. ${n}, quickly.`,
      avalanche: `The slope is loaded. Past halfway, it lets go \u2014 plan your ${n} around it.`,
      corniceridge: `Wind, gusts, and a lip of snow that punishes slips. ${n} across.`,
      frozentitan: `Old glacier ice in three layers. Break all three, then land ${n} \u2014 and it gets angry late.`,
      rockfall: `Pebbles come down in timed bursts. Move in the quiet. ${n} to clear.`,
      verglas: `Ice too thin to see. Answer fast and it sheds threat; hesitate and it doesn't. ${n} to cross.`
    };
    return map[node.kind] || `${n} to clear.`;
  }

  // src/agents/sandbox-steward.js
  var NODE_FACTORIES = {
    switchback: "nSwitch",
    storm: "nStorm",
    gate: "nGate",
    serac: "nSerac",
    summit: "nSummit",
    whiteout: "nWhiteout",
    crevasse: "nCrevasse",
    traverse: "nTraverse",
    thinair: "nThinAir",
    icefall: "nIcefall",
    void: "nVoid",
    knife: "nKnife",
    berg: "nBergschrund",
    snowfield: "nSnowfield",
    couloir: "nCouloir",
    icewall: "nIcewall",
    windslab: "nWindslab",
    sealedface: "nSealedFace",
    longwall: "nLongWall",
    tempest: "nTempest",
    closing: "nClosing",
    avalanche: "nAvalanche",
    corniceridge: "nCorniceRidge",
    frozentitan: "nFrozenTitan",
    rockfall: "nRockfall",
    verglas: "nVerglas"
  };
  var seededRng2 = seededRng;
  function clamp2(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function createSandboxSteward() {
    const api = {
      factories: NODE_FACTORIES,
      seededRng: seededRng2,
      /** All pitch kinds this sandbox can spawn. */
      pitchKinds() {
        return Object.keys(NODE_FACTORIES);
      },
      /** Throwaway RUN/ENC state comes straight from the Climb Engine. */
      blankRun,
      blankEnc,
      /** Spawn any pitch node via the real Hazard Warden factories, scaled to an act. */
      spawnNode(trail, opts = {}) {
        const H2 = trail.agents.hazard.api;
        const kind = opts.kind || "switchback";
        const fnName = NODE_FACTORIES[kind];
        if (!fnName || !H2[fnName]) throw new Error("Unknown pitch kind: " + kind);
        const need = opts.need != null ? opts.need : 4;
        const alt = opts.alt != null ? opts.alt : 2e3;
        const act = clamp2(opts.act || 1, 1, 3);
        let node;
        if (kind === "gate") node = H2.nGate(need, alt, opts.domain || null);
        else node = H2[fnName](need, alt);
        if (kind === "serac") node.startThreat = 25;
        if (kind === "summit") node.startThreat = 20;
        return H2.scaleNode(node, act);
      },
      /** Preview the boon draft a ledge would offer, deterministically. */
      previewDraft(trail, opts = {}) {
        const run = api.blankRun({
          boons: opts.owned || [],
          stamina: opts.stamina != null ? opts.stamina : 60,
          nodeIdx: opts.nodeIdx || 0
        });
        const enc = api.blankEnc(api.spawnNode(trail, { kind: "switchback" }));
        const ctx = trail.makeCtx(run, enc);
        const rnd2 = seededRng2(opts.seed || 1);
        return trail.agents.boon.api.pickDraft(ctx, rnd2, opts.count || 3);
      },
      /**
       * Simulate a single pitch by driving the real hook bus — spawns the node
       * here, then hands off to the Climb Engine (the same code the browser
       * runs). Since the engine unification this includes full hazard drift:
       * gusts, spikes, and drain now count when secondsPerQuestion > 0.
       *
       * @param {object} trail  kernel handle (window.Trail)
       * @param {object} opts
       *   kind, act, need, boons[], relics[], weather (object), seed,
       *   answers: array of booleans OR {correct, viaTimeout},
       *   secondsPerQuestion: passive hazard seconds between answers (0 = off)
       * @returns {{node, start, steps, final, cleared, strikes}}
       */
      simulatePitch(trail, opts = {}) {
        const node = api.spawnNode(trail, {
          kind: opts.kind,
          need: opts.need,
          act: opts.act,
          alt: opts.alt,
          domain: opts.domain
        });
        return simulatePitchNode(trail, node, opts);
      },
      /**
       * Grade a set line the way a guidebook would: Monte Carlo the whole
       * route through the real bus and map the summit rate to an alpine
       * grade (F → ED). Deterministic from the seed.
       */
      gradeLine(trail, spec, opts = {}) {
        const CONFIG2 = trail.CONFIG;
        const runs = opts.runs || 200;
        const acc = opts.accuracy ?? 0.82;
        const timeoutRate = opts.timeoutRate ?? 0.06;
        const route = trail.agents.expedition.api.buildSetRoute(spec, CONFIG2);
        const pitchIdx = route.map((n, i) => i).filter((i) => route[i].kind !== "rest");
        const deaths = route.map(() => 0);
        let summits = 0;
        let endSum = 0;
        for (let r = 0; r < runs; r++) {
          const rnd2 = seededRng2((opts.seed || 1) * 7919 + r);
          let stamina = CONFIG2.STAM_MAX;
          let alive = true;
          for (let i = 0; i < route.length && alive; i++) {
            const node = route[i];
            if (node.kind === "rest") {
              stamina = Math.min(CONFIG2.STAM_MAX, stamina + CONFIG2.REST_RESTORE);
              continue;
            }
            const answers = [];
            for (let q = 0; q < node.need * 3 + 6; q++) {
              const roll = rnd2();
              if (roll < acc) answers.push({ correct: true, viaTimeout: false });
              else answers.push({ correct: false, viaTimeout: roll < acc + timeoutRate });
            }
            const res = api.simulatePitch(trail, {
              kind: node.kind,
              need: node.need,
              act: node.act,
              alt: node.alt,
              stamina,
              seed: Math.floor(rnd2() * 1e9) + 1,
              answers,
              secondsPerQuestion: 6
            });
            stamina = res.final.stamina;
            if (!res.final.survived || !res.cleared) {
              alive = false;
              deaths[i]++;
            }
          }
          if (alive) {
            summits++;
            endSum += stamina;
          }
        }
        const rate = summits / runs;
        const GRADES = [
          [0.7, "F", "Facile"],
          [0.55, "PD", "Peu Difficile"],
          [0.4, "AD", "Assez Difficile"],
          [0.25, "D", "Difficile"],
          [0.12, "TD", "Tr\xE8s Difficile"],
          [-1, "ED", "Extr\xEAmement Difficile"]
        ];
        const g = GRADES.find((x) => rate >= x[0]);
        let worst = -1;
        for (const i of pitchIdx) if (worst < 0 || deaths[i] > deaths[worst]) worst = i;
        return {
          route,
          runs,
          summitRate: +rate.toFixed(3),
          avgEndStamina: summits ? +(endSum / summits).toFixed(1) : 0,
          grade: g[1],
          gradeName: g[2],
          deaths,
          cruxIndex: worst,
          crux: worst >= 0 ? route[worst] : null
        };
      },
      /** Convenience: the whole staff roster for the sandbox gallery. */
      roster(trail) {
        return trail.meta;
      }
    };
    return {
      id: "sandbox-steward",
      name: "Sandbox Steward",
      role: "Deterministic simulation & control surface for the Staff Sandbox",
      api,
      register() {
      }
    };
  }

  // src/agents/expedition-director.js
  var OATHS = [
    {
      id: "none",
      name: "Open Route",
      ic: "\u{1F9ED}",
      desc: "No vow, no strings. The mountain as it comes.",
      mods: {}
    },
    {
      id: "swift",
      name: "Swift Line",
      ic: "\u26A1",
      desc: "More time to think (+18% clock), but the mountain moves quicker too (+12% threat). For climbers who read every option.",
      mods: { time: 1.18, rise: 1.12 }
    },
    {
      id: "iron",
      name: "Iron Lungs",
      ic: "\u{1FAC1}",
      desc: "Hits hurt less (\u221218% miss and strike costs), camps help less (\u221222% heals). For climbers who trust their floor.",
      mods: { stamCost: 0.82, heal: 0.78 }
    },
    {
      id: "scholar",
      name: "Scholar's Vow",
      ic: "\u{1F4DA}",
      desc: "The examiners hit +25% harder, and you carry extra gear into Act III. For climbers who want the fight.",
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
    { id: "grade_s", ic: "\u{1F48E}", name: "Alpine Grade", desc: "Earn an S grade on a summit run." },
    { id: "first_ascent", ic: "\u26CF\uFE0F", name: "First Ascent", desc: "Summit a set line from the guidebook." },
    { id: "tale_5", ic: "\u{1F5FF}", name: "Keeper's Audience", desc: "Face five stories at the waymarks." },
    { id: "bird_friend", ic: "\u{1F426}", name: "Bird of Good Standing", desc: "Feed the ptarmigan, then summit. It keeps accounts." },
    { id: "review_5", ic: "\u{1FAA8}", name: "Stone Mason", desc: "Reclaim loose stones in five Morning Reviews." }
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
    "icefall",
    "verglas"
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
    const { scaleNode: scaleNode2, nSwitch: nSwitch2, nGate: nGate2, nRest: nRest2, nShrine: nShrine2, nTale: nTale2, nSerac: nSerac2, nSummit: nSummit2 } = hazards;
    const tales = config.MODS.tales !== false && typeof nTale2 === "function";
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
    const tierPool = (t) => hazards.BESTIARY.filter((b) => b.t === t).map((b) => b.fn);
    const T2 = tierPool(2);
    const T3 = tierPool(3);
    const T4 = tierPool(4);
    A(nSwitch2(nd(3), step(215)), 1);
    pick(tierPool(1).filter((fn) => fn !== nSwitch2), 1).forEach((fn) => {
      A(fn(nd(3), step(220)), 1);
    });
    A(pick(T2, 1)[0](nd(4), step(240)), 1);
    if (tales) A(nTale2(step(90)), 1);
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
    if (tales) A(nTale2(step(95)), 3);
    A(nSerac2(5, step(320)), 3);
    A(nSummit2(6, step(360)), 3);
    return r;
  }
  var LINE_LIMITS = { minPitches: 5, maxPitches: 18, needMin: 3, needMax: 7, nameMax: 36 };
  function lineChecksum(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(36).slice(-4);
  }
  function b64encode(s) {
    if (typeof btoa === "function") return btoa(unescape(encodeURIComponent(s)));
    return Buffer.from(s, "utf8").toString("base64");
  }
  function b64decode(s) {
    if (typeof atob === "function") return decodeURIComponent(escape(atob(s)));
    return Buffer.from(s, "base64").toString("utf8");
  }
  var cleanText = (s, max) => String(s || "").replace(/[<>&]/g, "").trim().slice(0, max);
  function encodeLine(spec) {
    const p = spec.pitches.map((x) => x.kind === "rest" ? "R" : [x.kind, x.need]);
    const payload = { v: 1, name: cleanText(spec.name, LINE_LIMITS.nameMax), setter: cleanText(spec.setter, LINE_LIMITS.nameMax), p };
    payload.cs = lineChecksum(JSON.stringify({ v: payload.v, name: payload.name, setter: payload.setter, p: payload.p }));
    return "LINE1:" + b64encode(JSON.stringify(payload));
  }
  function decodeLine(code) {
    const m = String(code || "").trim().match(/^LINE1:(.+)$/);
    if (!m) return { ok: false, err: "Not a guidebook line code." };
    let payload;
    try {
      payload = JSON.parse(b64decode(m[1]));
    } catch (e) {
      return { ok: false, err: "Could not read that line code." };
    }
    if (payload.cs && lineChecksum(JSON.stringify({ v: payload.v, name: payload.name, setter: payload.setter, p: payload.p })) !== payload.cs) {
      return { ok: false, err: "Checksum failed \u2014 the code may be truncated." };
    }
    const L = LINE_LIMITS;
    const pitches = [];
    for (const x of payload.p || []) {
      if (x === "R") {
        pitches.push({ kind: "rest" });
        continue;
      }
      const kind = x && x[0];
      if (kind === "summit" || !NODE_FACTORIES[kind] && kind !== "rest") continue;
      pitches.push({ kind, need: Math.max(L.needMin, Math.min(L.needMax, Math.round(x[1]) || 4)) });
    }
    const real = pitches.filter((x) => x.kind !== "rest");
    if (real.length < L.minPitches) return { ok: false, err: "A line needs at least " + L.minPitches + " pitches." };
    if (real.length > L.maxPitches) return { ok: false, err: "No line is that long. Max " + L.maxPitches + " pitches." };
    return {
      ok: true,
      spec: { name: cleanText(payload.name, L.nameMax) || "Unnamed Line", setter: cleanText(payload.setter, L.nameMax) || "unknown", pitches }
    };
  }
  function buildSetRoute(spec, config, hazards = hazard_warden_exports) {
    const real = spec.pitches.filter((x) => x.kind !== "rest").length;
    let alt = 1600;
    let seen = 0;
    const r = [];
    for (const p of spec.pitches) {
      if (p.kind === "rest") {
        alt += 140;
        r.push(hazards.scaleNode(hazards.nRest(alt, config), r.length ? r[r.length - 1].act : 1));
        continue;
      }
      seen++;
      const act = seen <= Math.ceil(real / 3) ? 1 : seen <= Math.ceil(2 * real / 3) ? 2 : 3;
      alt += 210 + seen * 37 % 70;
      const fn = hazards[NODE_FACTORIES[p.kind]];
      const node = p.kind === "gate" ? hazards.nGate(p.need, alt, null) : fn(p.need, alt);
      if (p.kind === "serac") node.startThreat = 25;
      r.push(hazards.scaleNode(node, act));
    }
    const summit = hazards.nSummit(6, alt + 340);
    summit.startThreat = 20;
    r.push(hazards.scaleNode(summit, 3));
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
      desc: "+5 seconds on every clock. Time is stamina you have not spent yet."
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
      desc: "Finish a pitch on a 3+ streak and the ledge heals you extra."
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
      desc: "Twice per climb, fire it and the threat meter drops to zero. Save one for the summit."
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
    anchor: { ic: "\u2693", name: "Storm Anchor", tag: "safety", rare: true, desc: "Retired. Now Pit Anchor." },
    woolsocks: { ic: "\u{1F9E6}", name: "Wool Socks", tag: "opening", rare: false, desc: "Dry feet fix more than you would think. Camps and cleared ledges heal +6 more." },
    whetstone: { ic: "\u{1FAA8}", name: "Whetstone", tag: "threat", rare: false, desc: "Your first correct answer each pitch bites deep \u2014 it sheds 15 extra threat." },
    whistle: { ic: "\u{1F3B6}", name: "Tin Whistle", tag: "safety", rare: true, desc: "The mountain likes a tune. Gusts and falling-ice volleys hit for half." }
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
    { ids: ["headlamp", "fieldnotes"], name: "Night School", ic: "\u{1F319}", desc: "Headlamp also tags the question type on each stem." },
    { ids: ["woolsocks", "provisions"], name: "Home Comforts", ic: "\u{1F3E1}", desc: "Camps and ledges heal +9 instead. The mountain almost feels like a kitchen." },
    { ids: ["whetstone", "vent"], name: "Sharp Edge", ic: "\u{1F52A}", desc: "The Whetstone opener sheds 24 threat instead of 15." }
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
        const full = ctx.run.boons.size >= (ctx.config?.MAX_BOONS ?? 5);
        if (full) count = 2;
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
        if (full) pick.push("_stamina");
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
        if (canUse(ctx, "whetstone") && !ctx.enc.whetUsed) {
          ctx.enc.whetUsed = true;
          const bite = hasDuo(ctx, "Sharp Edge") ? 24 : 15;
          ctx.threatDelta = (ctx.threatDelta || 0) - bite;
          (ctx.banners = ctx.banners || []).push({ title: "Whetstone", sub: "first answer bites \u2014 threat \u2212" + bite });
        }
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
        if (ctx.enc.node.swift && ctx.run.maxTime > 0 && ctx.run.timeLeft / ctx.run.maxTime >= (ctx.enc.node.swiftFrac ?? 0.5)) {
          ease += ctx.enc.node.swift;
          if (!ctx.enc.swiftTold) {
            ctx.enc.swiftTold = true;
            banners.push({ title: "Quick placement", sub: "fast answers shed extra threat" });
          }
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
        const tierCombat = TIER_COMBAT[ctx.enc.node.tier];
        let staminaCost = ctx.viaTimeout ? tierCombat ? tierCombat.timeoutCost : ctx.config.TIMEOUT_COST : tierCombat ? tierCombat.missCost : ctx.config.MISS_COST;
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
    { name: "Clear Dawn", ic: "\u{1F304}", rise: 1, time: 1, heal: 1, score: 1, desc: "A rare, kind morning. No tricks today \u2014 just you and the route." },
    { name: "Gathering Storm", ic: "\u26C8\uFE0F", rise: 1.18, time: 1, heal: 1, score: 1.1, desc: "Trouble builds faster all day. Summit in this and it counts for more." },
    { name: "Dead of Night", ic: "\u{1F30C}", rise: 1, time: 0.88, heal: 1, score: 1.15, desc: "Short clocks in the dark, but the mountain drops more treasure at night." },
    { name: "Thin Season", ic: "\u{1F976}", rise: 1, time: 1, heal: 0.75, score: 1.12, desc: "Camps and ledges heal less this season. Pack patience." }
  ];
  var RELICS = {
    iceaxe: { ic: "\u26CF\uFE0F", name: "Ice Axe", desc: "Once per climb, arrest a fatal fall and hold on at 1 stamina." },
    carabiner: { ic: "\u{1F517}", name: "Lucky Carabiner", desc: "The first strike each pitch costs half." },
    oxygen: { ic: "\u{1F4A8}", name: "Oxygen Cache", desc: "Firing a flare also restores 12 stamina." },
    chalk: { ic: "\u{1F45D}", name: "Chalk Bag", desc: "Answer a question you once missed and the threat goes fully quiet." },
    rope: { ic: "\u{1F9F6}", name: "Woven Rope", desc: "Gatekeepers strike 25% softer." },
    stone: { ic: "\u{1F48E}", name: "Summit Stone", desc: "Does nothing but weigh a little and mean a lot. +15 summit score \u2014 it wants to go home." },
    feather: { ic: "\u{1FAB6}", name: "Ptarmigan Feather", desc: "Once per climb, a timeout costs nothing and your streak survives. A small bird pays a small debt." }
  };
  function pitchRestore(node, mode, run, config) {
    const heal = run.weather ? run.weather.heal : 1;
    let socks = 0;
    if (run.boons && run.boons.has("woolsocks")) {
      socks = run.boons.has("provisions") ? 9 : 6;
    }
    if (mode === "rest") return Math.round(node.restore * heal) + socks;
    return Math.round(node.restore * config.CLEAR_RESTORE_MULT * heal) + socks;
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
  function weakestDomainLetter(run, bank, lapses) {
    const seen = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    const wrong = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    Object.keys(run.prog || {}).forEach((id) => {
      const q = bank[id];
      if (!q) return;
      const d = domainOf(q);
      seen[d] = (seen[d] || 0) + 1;
      wrong[d] += run.prog[id].wrong || 0;
    });
    Object.keys(lapses || {}).forEach((id) => {
      const q = bank[id];
      if (!q) return;
      wrong[domainOf(q)] += (lapses[id] || 0) * 0.5;
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
    lore: "The hazards up there test what you can still recall with the wind up, and every camp offers help you must choose between. Fall as often as it takes \u2014 the ledger keeps each concept you lock in.",
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
      exportHint: "Carry it to your next climb"
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
      sub: "Every hazard between the trailhead and the summit, and the particular way each one wants to stop you."
    }
  };
  var DEBRIEF_COPY = {
    summit: {
      icon: "\u{1F3C6}",
      title: "Summit reached",
      sub: "Topped out in the first light. It goes in the ledger: the route, the weather, and every concept that held your weight."
    },
    fell: {
      icon: "\u{1F30D}",
      title: "Driven back",
      sub: "The mountain kept the summit this time. It does not keep what you learned \u2014 that goes in the ledger, same as any climb."
    },
    quit: {
      icon: "\u{1F3D5}",
      title: "Back at camp",
      sub: "Turning back is a skill. Ask anyone still climbing at sixty. The ledger takes lessons, not summits."
    }
  };
  var ACT_TRANSITIONS = {
    2: {
      title: "The Headwall",
      sub: "You tie in at the base of the face. It runs up out of sight, and it wants better answers than the approach did.",
      ic: "\u{1F9D7}"
    },
    3: {
      title: "The Death Zone",
      sub: "Past this camp there is no rest that counts and no one coming. Move well, and do not stop long.",
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

  // src/agents/trail-chronicler.js
  var WATCHED = [
    "pitch:enter",
    "question:start",
    "answer:correct",
    "answer:wrong",
    "mountain:strike",
    "hazard:gust",
    "pitch:clear"
  ];
  function summarize(event, ctx) {
    const enc = ctx.enc || {};
    const run = ctx.run || {};
    const bits = [];
    if (typeof enc.streak === "number") bits.push("streak " + enc.streak);
    if (typeof enc.threat === "number") bits.push("threat " + Math.round(enc.threat));
    if (typeof run.stamina === "number") bits.push("stam " + Math.round(run.stamina));
    if (enc.node && enc.node.kind) bits.push(enc.node.kind);
    return bits.join(" \xB7 ");
  }
  function createTrailChronicler(limit = 500) {
    let seq = 0;
    const buffer = [];
    const listeners = /* @__PURE__ */ new Set();
    function record(event, ctx) {
      const entry = {
        seq: ++seq,
        t: Date.now(),
        event,
        summary: summarize(event, ctx)
      };
      buffer.push(entry);
      if (buffer.length > limit) buffer.shift();
      listeners.forEach((fn) => {
        try {
          fn(entry);
        } catch (_) {
        }
      });
      return {};
    }
    const api = {
      events: WATCHED,
      /** All recorded entries (oldest first). */
      log() {
        return buffer.slice();
      },
      /** Most recent n entries. */
      tail(n = 20) {
        return buffer.slice(-n);
      },
      /** Count of records grouped by event name. */
      stats() {
        const out = {};
        buffer.forEach((e) => {
          out[e.event] = (out[e.event] || 0) + 1;
        });
        return out;
      },
      clear() {
        buffer.length = 0;
        seq = 0;
      },
      /** Subscribe to live records; returns an unsubscribe fn. */
      onRecord(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      }
    };
    return {
      id: "trail-chronicler",
      name: "Trail Chronicler",
      role: "Passive hook telemetry & run event log",
      api,
      register(bus) {
        WATCHED.forEach((event) => {
          bus.on(event, (ctx) => record(event, ctx), "trail-chronicler");
        });
      }
    };
  }

  // src/agents/summit-sage.js
  function emptyTally() {
    return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  }
  function createSummitSage() {
    const api = {
      domains: DOMAINS,
      /** Per-domain seen / right / wrong / board-ready / mastered / accuracy. */
      domainBreakdown(run, bank, config) {
        const lock = config && config.LOCK_TIER || 3;
        const master = config && config.MASTER_TIER || 4;
        const seen = emptyTally();
        const right = emptyTally();
        const wrong = emptyTally();
        const ready = emptyTally();
        const mastered = emptyTally();
        const total = emptyTally();
        (bank || []).forEach((q, i) => {
          const d = domainOf(q);
          if (total[d] == null) return;
          total[d]++;
          const p = run.prog && run.prog[q.id != null ? q.id : i];
          if (!p) return;
          seen[d] += p.seen ? 1 : 0;
          right[d] += p.right || 0;
          wrong[d] += p.wrong || 0;
          if (p.tier >= lock) ready[d]++;
          if (p.tier >= master) mastered[d]++;
        });
        return Object.keys(DOMAINS).map((d) => {
          const attempts = right[d] + wrong[d];
          return {
            domain: d,
            name: DOMAINS[d].n,
            weight: DOMAINS[d].pct,
            total: total[d],
            seen: seen[d],
            ready: ready[d],
            mastered: mastered[d],
            accuracy: attempts ? Math.round(right[d] / attempts * 100) : null,
            readyPct: total[d] ? Math.round(ready[d] / total[d] * 100) : 0
          };
        });
      },
      /** Overall board readiness: concepts at/above lock tier. */
      readiness(run, bank, config) {
        const lock = config && config.LOCK_TIER || 3;
        let ready = 0;
        let mastered = 0;
        const master = config && config.MASTER_TIER || 4;
        const total = (bank || []).length;
        (bank || []).forEach((q, i) => {
          const p = run.prog && run.prog[q.id != null ? q.id : i];
          if (!p) return;
          if (p.tier >= lock) ready++;
          if (p.tier >= master) mastered++;
        });
        return {
          ready,
          mastered,
          total,
          readyPct: total ? Math.round(ready / total * 100) : 0
        };
      },
      /** Lowest-tier, most-missed concepts to review next. */
      nextReview(run, bank, n = 8) {
        const scored = [];
        (bank || []).forEach((q, i) => {
          const id = q.id != null ? q.id : i;
          const p = run.prog && run.prog[id];
          if (!p || !p.seen) return;
          const score = p.tier * 10 - (p.wrong || 0) * 5;
          scored.push({ id, cat: q.cat, domain: domainOf(q), tier: p.tier, wrong: p.wrong || 0, score });
        });
        return scored.sort((a, b) => a.score - b.score).slice(0, n);
      },
      /** Human-readable coaching tips from the breakdown. */
      recommend(run, bank, config) {
        const rows = api.domainBreakdown(run, bank, config).slice();
        const tips = [];
        const weakest = rows.filter((r) => r.total > 0).sort((a, b) => a.readyPct - b.readyPct)[0];
        if (weakest) {
          tips.push(
            "Focus Domain " + weakest.domain + " (" + weakest.name + ") \u2014 " + weakest.ready + "/" + weakest.total + " board-ready (" + weakest.readyPct + "%)."
          );
        }
        const shaky = rows.filter((r) => r.accuracy != null && r.accuracy < 70);
        shaky.forEach((r) => {
          tips.push("Accuracy dip in " + r.name + ": " + r.accuracy + "% correct so far.");
        });
        const due = api.nextReview(run, bank, 100).filter((x) => x.tier < (config && config.LOCK_TIER || 3));
        if (due.length) tips.push(due.length + " concept" + (due.length === 1 ? "" : "s") + " still below board-ready.");
        if (!tips.length) tips.push("Strong footing across every domain \u2014 press for the summit.");
        return tips;
      }
    };
    return {
      id: "summit-sage",
      name: "Summit Sage",
      role: "Study coach \u2014 domain readiness, mastery analytics, review planning",
      api,
      register() {
      }
    };
  }

  // src/agents/cairn-keeper.js
  var TALES = [
    {
      id: "ghostrope",
      ic: "\u{1FAA2}",
      title: "The Ghost Rope",
      minAct: 1,
      text: "An old fixed rope hangs down the crux, anchors bleeding rust. Whoever set it meant to come back. It would save you an hour \u2014 if it holds.",
      choices: [
        {
          ic: "\u{1F9D7}",
          label: "Trust the old line",
          desc: "If it holds, you save real strength. If not, it\u2019s a long fall to a short ledge.",
          gamble: {
            p: 0.6,
            win: { stam: 16 },
            winText: "It holds. Barely, and with complaints \u2014 but it holds. You reach the top with strength to spare.",
            lose: { stam: -12 },
            loseText: "It parts at the second anchor. You catch a flake and climb the rest of it angry."
          }
        },
        {
          ic: "\u{1F97E}",
          label: "Break your own trail",
          desc: "Slower, but you learn every hold yourself. The next pitch asks one less of you.",
          fx: { easeNext: 1 },
          after: "You top out knowing the ground like your own kitchen. The pitch above has fewer surprises left."
        }
      ]
    },
    {
      id: "portercache",
      ic: "\u{1F392}",
      title: "The Porter\u2019s Cache",
      minAct: 1,
      text: "A pack frame sticks out of the snow, straps still buckled. Somebody carried this high, set it down, and never came back for it.",
      choices: [
        {
          ic: "\u26CF\uFE0F",
          label: "Dig it out",
          desc: "Costs 8 stamina. Whatever was worth hauling up here is yours.",
          fx: { stam: -8, relic: true },
          after: "The frozen canvas fights you the whole way. Inside: something the mountain never claimed."
        },
        {
          ic: "\u{1F4D3}",
          label: "Mark it and move on",
          desc: "Keep your rhythm. +5 stamina.",
          fx: { stam: 5 },
          after: "You stack three stones on the frame for the next climber and keep your pace. The rhythm pays."
        }
      ]
    },
    {
      id: "keeper",
      ic: "\u{1F5FF}",
      title: "The Keeper of the Waymarks",
      minAct: 1,
      text: "An old climber sits by the waymark, restacking its stones by feel. \u201CEveryone leaves something,\u201D they say. \u201CRecite what you know, or admit what you don\u2019t. Both are worth something up here.\u201D",
      choices: [
        {
          ic: "\u{1F5E3}\uFE0F",
          label: "Recite what you know",
          desc: "Say your ledger out loud. There\u2019s gear in it for you at the next camp.",
          fx: { draftNext: true },
          after: "\u201CNot bad.\u201D They nod once. \u201CThe next fire you sit at owes you a favor.\u201D"
        },
        {
          ic: "\u{1F932}",
          label: "Admit what you don\u2019t",
          desc: "Honesty rests easy. +10 stamina.",
          fx: { stam: 10 },
          after: "\u201CGood. The mountain only punishes climbers who lie about it.\u201D You walk away lighter than you came."
        }
      ]
    },
    {
      id: "signalmirror",
      ic: "\u{1FA9E}",
      title: "The Signal Mirror",
      minAct: 1,
      text: "Something glints on a shelf above the route. Glass or steel, angled to be seen. It\u2019s a hard scramble off your line to find out which.",
      choices: [
        {
          ic: "\u{1F9D7}",
          label: "Climb to it",
          desc: "Ungraded rock, unknown reward.",
          gamble: {
            p: 0.55,
            win: { relic: true },
            winText: "A signal kit, oiled and wrapped. Somebody planned to need this. Now it\u2019s yours.",
            lose: { stam: -14 },
            loseText: "A sardine tin, polished by forty years of wind. The scramble down costs more than the shine was worth."
          }
        },
        {
          ic: "\u{1F463}",
          label: "Stay on the line",
          desc: "Shiny things get climbers killed. Keep moving. +5 stamina.",
          fx: { stam: 5 },
          after: "You keep your feet on the route and your eyes on the next hold. The glint watches you go."
        }
      ]
    },
    {
      id: "echochamber",
      ic: "\u{1F4E3}",
      title: "The Echo Chamber",
      minAct: 2,
      text: "The couloir narrows until it hands your breathing back to you. Guides say the mountain answers anyone who shouts their name here. They argue about what it answers with.",
      choices: [
        {
          ic: "\u{1F5E3}\uFE0F",
          label: "Call your name",
          desc: "Fifty-fifty, the guides say.",
          gamble: {
            p: 0.5,
            win: { stam: 12 },
            winText: "Your voice comes back doubled and steady, like a rope team you didn\u2019t know you had.",
            lose: { threatNext: 12 },
            loseText: "Something else answers. Lower. From above. It knows the route ahead of you, and now it\u2019s waiting on it."
          }
        },
        {
          ic: "\u{1F92B}",
          label: "Pass in silence",
          desc: "Listen instead. The next pitch asks one less of you.",
          fx: { easeNext: 1 },
          after: "You move through on quiet feet and leave knowing more than you came with."
        }
      ]
    },
    {
      id: "bivouac",
      ic: "\u26FA",
      title: "Whiteout Bivouac",
      minAct: 2,
      text: "The cloud drops like a lid. A bivouac ledge opens to your left \u2014 dry, walled, room for one. Weather passes. So does time.",
      choices: [
        {
          ic: "\u{1F6CF}\uFE0F",
          label: "Wait it out",
          desc: "+18 stamina \u2014 but the mountain gets ahead of you. Next pitch opens with 15 threat.",
          fx: { stam: 18, threatNext: 15 },
          after: "You wake to clear air and stiff legs. The route spent the night rearranging itself without you."
        },
        {
          ic: "\u{1F32B}\uFE0F",
          label: "Push through the cloud",
          desc: "Costs 10 stamina. Beat the weather up \u2014 the next pitch asks one less.",
          fx: { stam: -10, easeNext: 1 },
          after: "You climb by feel and count. When the cloud lifts, you are above it."
        }
      ]
    },
    {
      id: "grave",
      ic: "\u{1FAA6}",
      title: "The Unmarked Grave",
      minAct: 2,
      text: "A mound of stones off the trail, too deliberate for rockfall. An ice axe stands at its head, the way climbers mark the ones who stopped here.",
      choices: [
        {
          ic: "\u{1FAA8}",
          label: "Tend the cairn",
          desc: "Costs 10 stamina to restack the stones. What they carried passes to you.",
          fx: { stam: -10, relic: true },
          after: "You rebuild it stone by stone. Under the axe head, wrapped in oilcloth: something the mountain never claimed."
        },
        {
          ic: "\u{1F3A9}",
          label: "Pass in respect",
          desc: "Some ledgers are closed. +8 stamina.",
          fx: { stam: 8 },
          after: "You touch the axe once and move on. Whoever they were, they\u2019d have told you to save your strength."
        }
      ]
    },
    {
      id: "oldledger",
      ic: "\u{1F4D6}",
      title: "The Old Guide\u2019s Journal",
      minAct: 3,
      text: "A leather journal frozen into the ice at head height, open mid-entry. The handwriting is steady until the last line, which isn\u2019t. It\u2019s a record of this exact route \u2014 one that ends above where you stand.",
      choices: [
        {
          ic: "\u{1F9CA}",
          label: "Read it where it froze",
          desc: "Costs 5 stamina in the cold. Their route notes buy you gear at the next camp.",
          fx: { stam: -5, draftNext: true },
          after: "The last legible line: \u201Cthe high camp fire owes the next one through.\u201D That\u2019s you."
        },
        {
          ic: "\u26CF\uFE0F",
          label: "Chip it free and carry it",
          desc: "Costs 8 stamina. Closed records belong off the mountain \u2014 and the mountain pays its debts.",
          fx: { stam: -8, relic: true },
          after: "The ice gives it up an inch at a time. The weight in your pack feels like a debt being repaid."
        }
      ]
    },
    {
      id: "thinbargain",
      ic: "\u{1FAC1}",
      title: "The Thin Air Bargain",
      minAct: 3,
      text: "Above the last camp the mountain quits being subtle. It names a price. It offers the next pitch half-climbed. No trick \u2014 just a trade.",
      choices: [
        {
          ic: "\u{1F4A8}",
          label: "Pay in breath",
          desc: "Costs 15 stamina. The next pitch asks two fewer of you.",
          fx: { stam: -15, easeNext: 2 },
          after: "You pay. The route above visibly relaxes, like a fist half-opening."
        },
        {
          ic: "\u{1FAC0}",
          label: "Keep your lungs",
          desc: "Refuse the trade. The mountain takes it personally \u2014 next pitch opens with 10 threat.",
          fx: { threatNext: 10 },
          after: "You keep what you came with. Above you, the route closes back into a fist. Fair."
        }
      ]
    },
    {
      id: "martatea",
      ic: "\u{1FAD6}",
      title: "Tea with Marta",
      minAct: 1,
      text: 'Marta the Keeper has a kettle going in the lee of a boulder, like it is the most normal thing in the world at four thousand meters. "Sit. It needs a minute. Everything good needs a minute." She pours two cups without asking.',
      choices: [
        {
          ic: "\u{1F375}",
          label: "Sit and drink",
          desc: "The tea is hot and the company is better. +12 stamina.",
          fx: { stam: 12, flag: "tea" },
          after: "You talk about nothing. The route, the weather, a bird she is feuding with. It is the best twenty minutes of the climb so far, and she waves you off before you can thank her."
        },
        {
          ic: "\u{1F6B6}",
          label: "Politely keep moving",
          desc: "Light is short. The next pitch asks one less \u2014 Marta points out the good line as you go.",
          fx: { easeNext: 1 },
          after: '"Suit yourself." She points with her cup. "Stay left of the dark rock. The dark rock is lying to you." She is, of course, right.'
        }
      ]
    },
    {
      id: "ptarmigan",
      ic: "\u{1F426}",
      title: "The Ptarmigan",
      minAct: 1,
      text: "A fat white bird lands on your pack and looks at you the way a landlord looks at a tenant. It is standing on your food. It knows it is standing on your food.",
      choices: [
        {
          ic: "\u{1F96A}",
          label: "Share your lunch",
          desc: "Cost: 6 stamina. You cannot explain why this feels important. It does.",
          fx: { stam: -6, flag: "bird" },
          after: "It eats like it paid for the meal, bobs once \u2014 which you choose to read as gratitude \u2014 and flies up the route. Somehow you feel lighter, six stamina poorer, and completely certain you will see it again."
        },
        {
          ic: "\u{1F44B}",
          label: "Shoo it off",
          desc: "It is YOUR lunch. +6 stamina, and the moral high ground.",
          fx: { stam: 6 },
          after: "It leaves slowly, insultingly slowly, taking one crumb as a tax. You get the feeling you have made a very small, very patient enemy."
        }
      ]
    },
    {
      id: "cartographer",
      ic: "\u{1F5FA}\uFE0F",
      title: "Emil, Mapping the Wind",
      minAct: 2,
      text: 'A man sits cross-legged on the ledge with pencils lined up by length, drawing a map of things that move. "Emil," he says, not looking up. "I chart the gusts. Everyone laughs. Then they climb into one." He taps an empty stretch of paper. "I will trade you a corner of tomorrow for a fact you are sure of."',
      choices: [
        {
          ic: "\u{1F5E3}\uFE0F",
          label: "Trade him a fact",
          desc: "Tell him something you know cold. He fills in your next pitch \u2014 it opens calm.",
          fx: { flag: "emil" },
          after: 'He writes your fact into the margin like it is a bearing. "Good. Solid ground on paper is solid ground underfoot." He shows you where the next pitch breathes \u2014 and where it holds its breath.'
        },
        {
          ic: "\u{1F381}",
          label: "Ask what he has spare",
          desc: "Cost: 8 stamina hauling his kit up a step. Mapmakers carry strange, useful things.",
          fx: { stam: -8, relic: true },
          after: 'You carry his crate up the awkward step and he rummages in it with real joy. "For your trouble. I have two, and the second one was never mine to keep."'
        }
      ]
    },
    {
      id: "letters",
      ic: "\u2709\uFE0F",
      title: "The Letter Tin",
      minAct: 2,
      text: 'A biscuit tin wedged under a flat stone, streaked with old wax. Inside, letters \u2014 climbers writing to whoever comes next. The top one reads: "If you are reading this, the weather let you. Write something true and go on."',
      choices: [
        {
          ic: "\u270D\uFE0F",
          label: "Write something true",
          desc: "Leave a line for the next climber. Some things you only learn by saying them. +8 stamina.",
          fx: { stam: 8, flag: "letter" },
          after: "You write the truest thing you know about being this tired and this far up, and feel better the moment the lid closes. Strange how that works. It will be there when someone needs it."
        },
        {
          ic: "\u{1F4D6}",
          label: "Read them all",
          desc: "Cost: 5 stamina sitting in the cold. Sixty years of advice from people who stood right here.",
          fx: { stam: -5, draftNext: true },
          after: "Grocery lists. Confessions. A recipe. And threaded through all of it, real route advice from people who wanted a stranger to make it. The next camp will make more sense because of them."
        }
      ]
    },
    {
      id: "younggide",
      ic: "\u{1F9D2}",
      title: "The Apprentice",
      minAct: 2,
      text: 'A young guide is re-coiling a rope for the fourth time, jaw set, eyes wet with frustration and altitude. "I froze on the traverse. Marta says everyone freezes once. Did you freeze?" They look at you like the answer matters. It does.',
      choices: [
        {
          ic: "\u{1F4AC}",
          label: "Tell them the truth",
          desc: "Yes. You froze. Talk them through what unfroze you. Teaching it locks it in \u2014 the next pitch asks one less.",
          fx: { easeNext: 1, flag: "apprentice" },
          after: "You explain it plainly \u2014 the freeze, the breath, the first small move that breaks it. Saying it out loud, you finally understand it yourself. They nod, and coil the rope right on the fifth try."
        },
        {
          ic: "\u{1F91D}",
          label: "Rope up with them a while",
          desc: "Cost: 10 stamina at their pace. Nobody should re-learn courage alone.",
          fx: { stam: -10, draftNext: true, flag: "apprentice" },
          after: 'You climb a rope-length together, slow and honest. At the anchor they press something from their kit into your hand. "Marta says gear you are given works better than gear you buy." '
        }
      ]
    },
    {
      id: "summitbell",
      ic: "\u{1F514}",
      title: "The Bell Above the Clouds",
      minAct: 3,
      text: "A small bronze bell hangs from an iron post, older than every map of this mountain. The rule, scratched beneath it in four languages: RING IT GOING UP AND YOU OWE THE TOP THE TRUTH. IT RINGS BACK FOR EVERY CLIMBER WHO KEPT THEIR WORD.",
      choices: [
        {
          ic: "\u{1F514}",
          label: "Ring it",
          desc: "Make the summit a promise. The next pitch opens with 8 threat \u2014 the mountain heard you.",
          fx: { threatNext: 8, flag: "bell" },
          after: "One clear note, and the wind goes quiet around it \u2014 listening, or counting. There is no taking it back now. The top knows you are coming."
        },
        {
          ic: "\u{1F92B}",
          label: "Leave it silent",
          desc: "Promises are heavy at altitude. Save your breath. +8 stamina.",
          fx: { stam: 8 },
          after: "You pass without a sound. The bell hangs still, patient as the mountain under it. It has waited out braver silences than yours."
        }
      ]
    }
  ];
  function campLine(run, rnd2) {
    const f = run.storyFlags || {};
    const lines = [];
    if (f.bird) lines.push("\u{1F426} The ptarmigan is here. It has clearly been waiting. It inspects your camp, approves of nothing, and settles in by the fire like family.");
    if (f.tea) lines.push("\u{1FAD6} There is a tin cup by the fire ring that was not in your pack this morning. Marta moves fast for her age. It improves the evening enormously.");
    if (f.letter) lines.push("\u2709\uFE0F You think about your line in the letter tin, and the stranger who will read it someday. Write true, climb true.");
    if (f.apprentice) lines.push("\u{1F9D2} Two ledges down, a headlamp is repeating your route, move for move. The apprentice is climbing again. That one is yours.");
    if (f.emil) lines.push("\u{1F5FA}\uFE0F Far below, a small light traces slow circles on a ledge. Emil, charting the night wind. You sleep better knowing the gusts are being taken seriously.");
    if (run.clutch > 0) lines.push("\u{1F525} Your hands have finally stopped shaking from that last pitch. The fire helps. Being alive helps more.");
    if (run.bestStreak >= 8) lines.push('\u{1F525} Somewhere on the wind you would swear you hear Marta: "Eight in a row. Now do it tired." You are tired. You grin anyway.');
    if (run.relics && run.relics.size >= 2) lines.push("\u{1F392} You lay the mountain\u2019s gifts out by the fire and take inventory like a dragon. A small hoard, honestly earned.");
    lines.push("\u{1F3D5}\uFE0F The fire cracks. The stars are doing their enormous quiet thing. For one full minute you forget to study, and that is fine too.");
    lines.push("\u{1F3D5}\uFE0F Wind on the tent fly, tea going cold too fast, every muscle honest about the day. You would not trade this for a desk. Not tonight.");
    return lines[Math.floor(rnd2() * lines.length)];
  }
  function epilogue(run, kind) {
    const f = run.storyFlags || {};
    if (kind === "summit") {
      if (f.bell) return "The bell\u2019s answer reaches you on the summit \u2014 one clear note rising through the cloud. You kept your word. The mountain keeps count.";
      if (f.bird) return "On the summit cairn sits a fat white bird, entirely unimpressed by the view. It waited for you. You split what is left of lunch, as is now tradition.";
      if (f.apprentice) return "From the top you can see the whole line you climbed \u2014 and a small figure on the lower ridge, climbing it after you. Somewhere below, the apprentice found their nerve. Pass it on. That is the whole game.";
      if (f.letter) return "Standing on top, you finally know what you should have written in the tin. Next climb, you tell yourself. The mountain will hold you to it.";
      if (f.tea) return 'The summit wind smells faintly, impossibly, of Marta\u2019s tea. "Everything good needs a minute," she said. This took considerably more than a minute. Worth it.';
      if ((run.clutch || 0) >= 2) return "You topped out on fumes and stubbornness, twice nearly nothing left. Those are the summits you remember. Nobody frames a photo of an easy day.";
      return "The top, at last \u2014 wind, light, and the whole world arranged below you like a map of everything you now know. Write it in the ledger. This one is yours.";
    }
    if (f.apprentice) return "The mountain sent you down today. So it goes. Somewhere below, an apprentice is still climbing because of what you told them \u2014 so get up. You have your own advice to follow.";
    if (f.bird) return "You fell, and a certain fat white bird escorted you partway down, offering no sympathy whatsoever. Eat something. Sleep. The route is not going anywhere, and neither is the bird.";
    if (f.tea) return '"Everyone comes down the mountain," Marta says, pouring without asking. "The good ones come down taking notes." Drink your tea. Read your misses. Go again.';
    return "The mountain kept this one. Fine \u2014 it keeps the first draft of everybody. What you learned on the way down is yours forever, and the route will still be there at first light.";
  }
  function drawTale(rnd2, act, usedIds) {
    const used = usedIds || [];
    let pool = TALES.filter((t) => t.minAct <= (act || 1) && used.indexOf(t.id) < 0);
    if (!pool.length) pool = TALES.filter((t) => t.minAct <= (act || 1));
    if (!pool.length) pool = TALES;
    return pool[Math.floor(rnd2() * pool.length)];
  }
  function resolveChoice(choice, rnd2) {
    if (choice.gamble) {
      const g = choice.gamble;
      const won = rnd2() < g.p;
      return { fx: (won ? g.win : g.lose) || {}, text: won ? g.winText : g.loseText, won };
    }
    return { fx: choice.fx || {}, text: choice.after || "", won: null };
  }
  function createCairnKeeper() {
    return {
      id: "cairn-keeper",
      name: "Cairn Keeper",
      role: "Waymark stories \u2014 narrative choice encounters on the route",
      api: { TALES, drawTale, resolveChoice, campLine, epilogue },
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
    },
    {
      id: "summit-sage",
      name: "Summit Sage",
      icon: "\u{1F9E0}",
      color: "#7fd4a0",
      blurb: "Study coach. Domain readiness, mastery analytics, and what to review next \u2014 pure functions over run progress."
    },
    {
      id: "cairn-keeper",
      name: "Cairn Keeper",
      icon: "\u{1F5FF}",
      color: "#b9a2d8",
      blurb: "Trail tales. Narrative choice encounters at story cairns \u2014 risks, bargains, and promises, deterministic from the run seed."
    },
    {
      id: "trail-chronicler",
      name: "Trail Chronicler",
      icon: "\u{1F4D3}",
      color: "#c0b0e6",
      blurb: "Passive telemetry. Records every hook the bus emits into a capped log without ever changing the outcome."
    },
    {
      id: "sandbox-steward",
      name: "Sandbox Steward",
      icon: "\u{1F9EA}",
      color: "#e6c36a",
      blurb: "Deterministic control surface. Spawns any pitch, previews drafts, and simulates climbs through the real bus."
    }
  ];
  function createKernel() {
    const bus = createAgentBus();
    const boonAgent = createBoonArchitect();
    const economy = createEconomyApi();
    const atlasAgent = createAtlasArtisan();
    const sageAgent = createSummitSage();
    const keeperAgent = createCairnKeeper();
    const stewardAgent = createSandboxSteward();
    const chroniclerAgent = createTrailChronicler();
    const scheduler = createScheduler(CONFIG);
    boonAgent.register(bus);
    atlasAgent.register(bus);
    chroniclerAgent.register(bus);
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
          createSeededRng,
          encodeLine,
          decodeLine,
          LINE_LIMITS,
          buildSetRoute: (spec) => buildSetRoute(spec, CONFIG, hazard_warden_exports)
        }
      },
      atlas: atlasAgent,
      sage: sageAgent,
      keeper: keeperAgent,
      steward: stewardAgent,
      chronicler: chroniclerAgent
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
      engine: climb_engine_exports,
      buildRoute: (rnd2, topic) => buildRoute(rnd2, topic, CONFIG, hazard_warden_exports),
      weakestDomain: (run, bank, lapses) => weakestDomainLetter(run, bank, lapses),
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
  window.decodeLine = Exp.decodeLine;
  window.buildSetRoute = Exp.buildSetRoute;
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
    "nFrozenTitan",
    "nRockfall",
    "nVerglas"
  ].forEach((k) => {
    window[k] = H[k];
  });
  window.weakestDomainLetter = function() {
    const lapses = typeof META !== "undefined" && META.lapses ? META.lapses : {};
    return Trail.weakestDomain(typeof RUN !== "undefined" ? RUN : { prog: {} }, typeof BANK !== "undefined" ? BANK : [], lapses);
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
