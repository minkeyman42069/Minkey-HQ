/**
 * ATLAS ARTISAN — visual design system, menu composition, and UI polish.
 * Owns presentation tokens so gameplay agents stay mechanics-only.
 */

export const ATLAS_TOKENS = {
  radii: { sm: 10, md: 14, lg: 18, pill: 999 },
  glass: {
    bg: 'rgba(8, 18, 30, 0.72)',
    border: 'rgba(49, 89, 122, 0.55)',
    blur: '12px',
  },
  glow: {
    lantern: '0 0 28px rgba(242, 182, 78, 0.38)',
    pine: '0 0 22px rgba(95, 206, 159, 0.32)',
  },
  type: {
    hero: "'Space Grotesk', sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'Space Mono', monospace",
  },
};

export const MENU_COPY = {
  kicker: 'Roguelike study climb',
  title: 'THE RBT',
  titleAccent: 'TRAIL',
  tagline: 'Know your terms, or the mountain wins.',
  lore: 'A spaced-repetition ascent through BACB terrain — draft boons, survive hazards, lock concepts into memory before the summit push.',
  primaryCta: 'Climb the mountain',
  focusSummary: 'Focus one trail',
  importSummary: 'Import saved progress',
};

export const SECONDARY_ACTIONS = [
  { id: 'exam', label: 'Board Sim', icon: '📋', action: 'startExam()' },
  { id: 'bestiary', label: 'Bestiary', icon: '📖', action: 'openBestiary()' },
];

/** Inject extended design tokens onto :root (call once at boot). */
export function applyDesignTokens() {
  if (typeof document === 'undefined') return;
  const r = document.documentElement.style;
  r.setProperty('--glass-bg', ATLAS_TOKENS.glass.bg);
  r.setProperty('--glass-border', ATLAS_TOKENS.glass.border);
  r.setProperty('--glass-blur', ATLAS_TOKENS.glass.blur);
  r.setProperty('--glow-lantern-soft', ATLAS_TOKENS.glow.lantern);
  r.setProperty('--radius-ui', ATLAS_TOKENS.radii.md + 'px');
}

export function createAtlasArtisan() {
  const api = {
    tokens: ATLAS_TOKENS,
    copy: MENU_COPY,
    secondaryActions: SECONDARY_ACTIONS,
    applyDesignTokens,
    statsMarkup(meta, helpers) {
      const { boardReady, careerRank, fmt, BANK, CONFIG } = helpers;
      const br = boardReady();
      const tot = BANK.length;
      const pct = tot ? Math.round((br / tot) * 100) : 0;
      return (
        '<div class="stat-rank">' +
        '<span class="stat-rank-name">' +
        careerRank() +
        '</span>' +
        '<span class="stat-rank-meta">' +
        meta.summits +
        ' summit' +
        (meta.summits === 1 ? '' : 's') +
        ' · ' +
        meta.runs +
        ' climb' +
        (meta.runs === 1 ? '' : 's') +
        ' · best ' +
        fmt(meta.bestAlt || 1600) +
        'm</span>' +
        '</div>' +
        '<div class="stat-bar"><span style="width:' +
        pct +
        '%"></span></div>' +
        '<div class="stat-foot"><b>' +
        br +
        '</b> of ' +
        tot +
        ' board-ready · ' +
        fmt(meta.miles) +
        ' trail miles</div>'
      );
    },
  };

  return {
    id: 'atlas-artisan',
    name: 'Atlas Artisan',
    role: 'Visual design system, menu composition, and UI polish',
    api,
    register() {},
  };
}
