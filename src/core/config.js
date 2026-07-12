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
};
