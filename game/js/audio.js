/**
 * Tiny WebAudio synth for SFX — no asset files needed.
 * Exposes a global `Sfx` object used by game.js.
 */
(function () {
  "use strict";

  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  /** Play a short tone. type: oscillator type, f0->f1 freq sweep over dur seconds. */
  function tone(type, f0, f1, dur, gainPeak) {
    if (muted) return;
    const ac = ensureCtx();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    gain.gain.setValueAtTime(gainPeak, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  window.Sfx = {
    unlock: ensureCtx,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    jump() {
      tone("square", 220, 520, 0.14, 0.12);
    },
    doubleJump() {
      tone("square", 330, 720, 0.16, 0.12);
    },
    banana() {
      tone("sine", 660, 990, 0.12, 0.16);
    },
    hurt() {
      tone("sawtooth", 300, 70, 0.3, 0.2);
    },
    levelClear() {
      tone("triangle", 440, 440, 0.12, 0.16);
      setTimeout(() => tone("triangle", 554, 554, 0.12, 0.16), 120);
      setTimeout(() => tone("triangle", 659, 659, 0.12, 0.16), 240);
      setTimeout(() => tone("triangle", 880, 880, 0.25, 0.18), 360);
    },
    gameOver() {
      tone("sawtooth", 220, 220, 0.18, 0.16);
      setTimeout(() => tone("sawtooth", 185, 185, 0.18, 0.16), 200);
      setTimeout(() => tone("sawtooth", 147, 110, 0.5, 0.18), 400);
    },
  };
})();
