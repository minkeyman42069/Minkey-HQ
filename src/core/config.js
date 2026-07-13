/** Shared CONFIG — single source for economy knobs (sync with climb-balance.mjs targets). */
export const CONFIG = {
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
  EXAM_PASS: 80,
  // --- Adaptive scheduler (SM-2-lite spacing, in "questions seen" units) ---
  DUE_GAP: [0, 2, 5, 12, 26],   // base spacing per tier before an item is due again
  EASE_START: 2.5,              // per-item ease factor (SM-2 default)
  EASE_MIN: 1.3,
  EASE_MAX: 2.9,
  EASE_UP: 0.12,                // ease gain on a correct recall
  EASE_DOWN_MISS: 0.25,         // ease loss on a wrong answer
  EASE_DOWN_TIMEOUT: 0.15,      // ease loss on a timeout (softer — knew it, ran out of time)
  PROMOTE_STREAK_FROM: 2,       // tiers >= this need 2 consecutive correct to promote
  INTERLEAVE_PENALTY: 0.55,     // down-weight an item sharing the last item's TCO domain
};
