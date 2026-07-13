import './styles.css';
import { getState } from './state.js';
import { renderHQ } from './ui/hq.js';
import { renderBattle } from './ui/battle.js';
import { renderHelp } from './ui/help.js';
import { clear } from './ui/dom.js';

const root = document.getElementById('app');

// Simple hash-free router held in memory. Screens call navigate() to move.
const routes = {
  hq: renderHQ,
  help: renderHelp,
};

let currentBattleMission = null;

export function navigate(screen, payload) {
  clear(root);
  if (screen === 'battle') {
    currentBattleMission = payload;
    renderBattle(root, payload, navigate);
    return;
  }
  const view = routes[screen] || routes.hq;
  view(root, navigate);
  window.scrollTo(0, 0);
}

// Boot
navigate(getState().screen || 'hq');

// Expose for quick manual debugging in the console.
window.__minkey = { navigate, currentBattleMission: () => currentBattleMission };
