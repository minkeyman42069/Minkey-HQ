// Lightweight persistent game state (squad selection + campaign progress),
// stored in localStorage so progress survives a refresh.

import { MISSIONS } from './data/enemies.js';

const KEY = 'minkey-hq-save-v1';

const defaultState = () => ({
  squad: ['kong', 'rocket', 'patch'], // three starting picks
  clearedMissions: [], // ids of beaten missions
  screen: 'hq',
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — run in-memory only */
  }
}

export function getState() {
  return state;
}

export function setSquad(ids) {
  state.squad = ids.slice(0, 3);
  save();
}

export function toggleSquadMember(id) {
  const idx = state.squad.indexOf(id);
  if (idx >= 0) {
    state.squad.splice(idx, 1);
  } else if (state.squad.length < 3) {
    state.squad.push(id);
  }
  save();
  return state.squad;
}

export function markCleared(missionId) {
  if (!state.clearedMissions.includes(missionId)) {
    state.clearedMissions.push(missionId);
    save();
  }
}

export function isMissionUnlocked(missionId) {
  const idx = MISSIONS.findIndex((m) => m.id === missionId);
  if (idx <= 0) return true; // first mission always open
  return state.clearedMissions.includes(MISSIONS[idx - 1].id);
}

export function resetProgress() {
  state = defaultState();
  save();
}
