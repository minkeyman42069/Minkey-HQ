/**
 * ATLAS ARTISAN — visual design system, screen copy, and UI polish.
 * Presentation layer only; gameplay agents stay mechanics-only.
 */

export const ATLAS_TOKENS = {
  radii: { sm: 10, md: 14, lg: 18, pill: 999 },
  glass: {
    bg: 'rgba(8, 18, 30, 0.78)',
    bgSoft: 'rgba(8, 18, 30, 0.52)',
    border: 'rgba(49, 89, 122, 0.55)',
    blur: '14px',
  },
  glow: {
    lantern: '0 0 28px rgba(242, 182, 78, 0.38)',
    pine: '0 0 22px rgba(95, 206, 159, 0.32)',
    rust: '0 0 20px rgba(227, 115, 86, 0.28)',
  },
  codexTier: {
    1: { label: 'Tier I', color: '#5fce9f' },
    2: { label: 'Tier II', color: '#8fc4dd' },
    3: { label: 'Tier III', color: '#f2b64e' },
    4: { label: 'Tier IV', color: '#e37356' },
    5: { label: 'Fixed', color: '#9b6fd0' },
  },
  type: {
    hero: "'Space Grotesk', sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'Space Mono', monospace",
  },
};

export const MENU_COPY = {
  kicker: 'Roguelike study climb',
  tagline: 'Know your terms, or the mountain wins.',
  lore: 'The hazards up there test what you can still recall with the wind up, and every camp offers help you must choose between. Fall as often as it takes \u2014 the ledger keeps each concept you lock in.',
  primaryCta: 'Climb the mountain',
  focusSummary: 'Focus one trail',
  importSummary: 'Import saved progress',
};

export const SCREEN_COPY = {
  map: {
    kicker: 'Your line to the summit',
    title: 'The route ahead',
    quit: 'Turn back & log the climb',
  },
  encounter: {
    stamina: 'Stamina',
    threat: 'Threat',
  },
  ledge: {
    draft: 'Take one for the climb',
    claim: 'Claim a boon',
    go: 'Back to the route',
  },
  debrief: {
    title: 'Trail log',
    trails: 'Where each trail stands',
    share: 'Share your result',
    export: 'Copy trail log',
    exportHint: 'Carry it to your next climb',
  },
  exam: {
    kicker: 'Board simulation',
    title: 'Mock exam',
    sub: '40 questions weighted to the RBT 3rd-ed blueprint.',
    quit: 'End & score now',
  },
  bestiary: {
    kicker: 'Mountain codex',
    title: 'The Bestiary',
    sub: 'Every hazard between the trailhead and the summit, and the particular way each one wants to stop you.',
  },
};

export const DEBRIEF_COPY = {
  summit: {
    icon: '\u{1F3C6}',
    title: 'Summit reached',
    sub: 'Topped out in the first light. It goes in the ledger: the route, the weather, and every concept that held your weight.',
  },
  fell: {
    icon: '\u{1F30D}',
    title: 'Driven back',
    sub: 'The mountain kept the summit this time. It does not keep what you learned \u2014 that goes in the ledger, same as any climb.',
  },
  quit: {
    icon: '\u{1F3D5}',
    title: 'Back at camp',
    sub: 'Turning back is a skill. Ask anyone still climbing at sixty. The ledger takes lessons, not summits.',
  },
};

export const ACT_TRANSITIONS = {
  2: {
    title: 'The Headwall',
    sub: 'You tie in at the base of the face. It runs up out of sight, and it wants better answers than the approach did.',
    ic: '🧗',
  },
  3: {
    title: 'The Death Zone',
    sub: 'Past this camp there is no rest that counts and no one coming. Move well, and do not stop long.',
    ic: '☠️',
  },
};

export const DAILY_RIDGE_COPY = {
  label: "Today's Ridge",
  sub: 'Same route & weather for every climber today. One shot at the daily line.',
};
export const SECONDARY_ACTIONS = [
  { id: 'exam', label: 'Board Sim', icon: '\u{1F4CB}', action: 'startExam()' },
  { id: 'bestiary', label: 'Bestiary', icon: '\u{1F4D6}', action: 'openBestiary()' },
];

/** Inject extended design tokens onto :root (call once at boot). */
export function applyDesignTokens() {
  if (typeof document === 'undefined') return;
  const r = document.documentElement.style;
  const t = ATLAS_TOKENS;
  r.setProperty('--glass-bg', t.glass.bg);
  r.setProperty('--glass-bg-soft', t.glass.bgSoft);
  r.setProperty('--glass-border', t.glass.border);
  r.setProperty('--glass-blur', t.glass.blur);
  r.setProperty('--glow-lantern-soft', t.glow.lantern);
  r.setProperty('--glow-pine-soft', t.glow.pine);
  r.setProperty('--radius-ui', t.radii.md + 'px');
}

export function createAtlasArtisan() {
  const api = {
    tokens: ATLAS_TOKENS,
    copy: { menu: MENU_COPY, screens: SCREEN_COPY, debrief: DEBRIEF_COPY, actTransitions: ACT_TRANSITIONS, daily: DAILY_RIDGE_COPY },
    achievementsMarkup(unlocked, total) {
      const n = unlocked.length;
      return (
        '<div class="achieve-hd"><span class="achieve-title">Expedition badges</span>' +
        '<span class="achieve-count">' + n + '/' + total + '</span></div>' +
        '<div class="achieve-grid">' +
        unlocked.slice(-6).map(function (a) {
          return '<span class="achieve-chip" title="' + a.desc + '">' + a.ic + ' ' + a.name + '</span>';
        }).join('') +
        (n === 0 ? '<span class="achieve-empty">Climb to earn your first badge</span>' : '') +
        '</div>'
      );
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
      const { boardReady, careerRank, fmt, BANK } = helpers;
      const br = boardReady();
      const tot = BANK.length;
      const pct = tot ? Math.round((br / tot) * 100) : 0;
      return (
        '<div class="stat-rank">' +
        '<span class="stat-rank-name">' + careerRank() + '</span>' +
        '<span class="stat-rank-meta">' + meta.summits + ' summit' + (meta.summits === 1 ? '' : 's') +
        ' \u00b7 ' + meta.runs + ' climb' + (meta.runs === 1 ? '' : 's') +
        ' \u00b7 best ' + fmt(meta.bestAlt || 1600) + 'm</span></div>' +
        '<div class="stat-bar"><span style="width:' + pct + '%"></span></div>' +
        '<div class="stat-foot"><b>' + br + '</b> of ' + tot + ' board-ready \u00b7 ' + fmt(meta.miles) + ' trail miles</div>'
      );
    },
    mapSubline(run, helpers) {
      const { fmt } = helpers;
      const idx = run.nodeIdx || 0;
      const pit = (run.route || []).filter((n) => n.kind !== 'rest').length;
      const cleared = run.nodeCleared || 0;
      if (idx === 0) return 'Tap a pitch to scout it. The summit is always one more ridge than you think.';
      let s = cleared + ' of ' + pit + ' pitches behind you';
      if (run.weather && run.weather.name !== 'Clear Dawn') s += ' under ' + run.weather.name;
      if (run.recovered) s += '. You reclaimed ' + run.recovered + ' loose stone' + (run.recovered > 1 ? 's' : '');
      if (run.clutch) s += '. ' + run.clutch + ' pitch' + (run.clutch > 1 ? 'es' : '') + ' cleared on your last legs';
      return s + '.';
    },
  };

  return {
    id: 'atlas-artisan',
    name: 'Atlas Artisan',
    role: 'Visual design system, screen copy, and UI polish',
    api,
    register() {},
  };
}
