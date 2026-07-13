/**
 * TRAIL CHRONICLER — passive telemetry. Records every hook the bus emits into
 * a capped ring buffer so the sandbox (and future dev tools) can replay what
 * the staff team did. It NEVER mutates ctx — handlers always return {} — so it
 * is safe to leave registered during a live climb.
 */

const WATCHED = [
  'pitch:enter',
  'question:start',
  'answer:correct',
  'answer:wrong',
  'mountain:strike',
  'hazard:gust',
  'pitch:clear',
];

function summarize(event, ctx) {
  const enc = ctx.enc || {};
  const run = ctx.run || {};
  const bits = [];
  if (typeof enc.streak === 'number') bits.push('streak ' + enc.streak);
  if (typeof enc.threat === 'number') bits.push('threat ' + Math.round(enc.threat));
  if (typeof run.stamina === 'number') bits.push('stam ' + Math.round(run.stamina));
  if (enc.node && enc.node.kind) bits.push(enc.node.kind);
  return bits.join(' · ');
}

export function createTrailChronicler(limit = 500) {
  let seq = 0;
  const buffer = [];
  const listeners = new Set();

  function record(event, ctx) {
    const entry = {
      seq: ++seq,
      t: Date.now(),
      event,
      summary: summarize(event, ctx),
    };
    buffer.push(entry);
    if (buffer.length > limit) buffer.shift();
    listeners.forEach((fn) => {
      try {
        fn(entry);
      } catch (_) {
        /* listener errors never break the bus */
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
    },
  };

  return {
    id: 'trail-chronicler',
    name: 'Trail Chronicler',
    role: 'Passive hook telemetry & run event log',
    api,
    register(bus) {
      // Registered last so it observes the fully-resolved ctx after other
      // staff have applied their deltas. Returns {} → never mutates flow.
      WATCHED.forEach((event) => {
        bus.on(event, (ctx) => record(event, ctx), 'trail-chronicler');
      });
    },
  };
}
