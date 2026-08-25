// Arranque del juego, bucle principal y manejadores de eventos de la interfaz.
(function () {
  let loaded = loadGame();
  const isNewGame = !loaded;
  let state = loaded || createNewState();
  window.STATE = state;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => UI.switchScreen(btn.dataset.screen));
  });

  UI.rosterSortMode = 'reciente';
  $('rosterSortSelect').addEventListener('change', (e) => {
    UI.rosterSortMode = e.target.value;
    UI.renderBanda(state);
  });

  $('settingsBtn').addEventListener('click', () => {
    $('infiniteEnergyToggle').checked = state.settings.infiniteEnergy;
    $('settingsModal').classList.remove('hidden');
  });
  $('settingsModalClose').addEventListener('click', () => $('settingsModal').classList.add('hidden'));
  $('resetBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar tu progreso y empezar de nuevo?')) {
      resetGame();
      location.reload();
    }
  });

  $('infiniteEnergyToggle').addEventListener('change', (e) => {
    state.settings.infiniteEnergy = e.target.checked;
    saveGame(state);
    UI.renderTopbar(state);
    UI.showToast(state.settings.infiniteEnergy ? '⚡ Energía infinita activada' : '⚡ Energía infinita desactivada');
  });
  $('cheatGemasBtn').addEventListener('click', () => {
    state.currencies.gemas += 1000;
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderScreen(activeScreen, state);
    UI.showToast('💎 +1000 Gemas');
  });
  $('cheatCrystalsBtn').addEventListener('click', () => {
    state.currencies.pixite += 20;
    state.currencies.voxite += 20;
    state.currencies.doxite += 20;
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderScreen(activeScreen, state);
    UI.showToast('🎁 +20 de cada cristal');
  });

  $('fighterModalClose').addEventListener('click', () => $('fighterModal').classList.add('hidden'));
  $('fighterModal').addEventListener('click', (e) => { if (e.target.id === 'fighterModal') $('fighterModal').classList.add('hidden'); });
  $('gearModalClose').addEventListener('click', () => $('gearModal').classList.add('hidden'));
  $('gearModal').addEventListener('click', (e) => { if (e.target.id === 'gearModal') $('gearModal').classList.add('hidden'); });
  $('pickerModalClose').addEventListener('click', () => $('pickerModal').classList.add('hidden'));
  $('pickerModal').addEventListener('click', (e) => { if (e.target.id === 'pickerModal') $('pickerModal').classList.add('hidden'); });
  $('summonRevealClose').addEventListener('click', () => {
    $('summonRevealModal').classList.add('hidden');
    if (UI.pendingEvolveUid) {
      const evolvedUid = UI.pendingEvolveUid;
      UI.pendingEvolveUid = null;
      if (rosterEntry(state, evolvedUid)) UI.openFighterModal(state, evolvedUid);
    }
  });
  $('offlineClose').addEventListener('click', () => $('offlineModal').classList.add('hidden'));

  $('battleSkipBtn').addEventListener('click', () => {
    const view = window.__battleView;
    if (view) UI.stepBattle(view, true);
  });
  $('battleCloseBtn').addEventListener('click', () => {
    $('battleOverlay').classList.add('hidden');
    window.__battleView = null;
    UI.renderTopbar(state);
    const run = window.__stageRun;
    if (run && !run.failed && run.nodeIdx < run.encounters.length) {
      // Encuentro intermedio superado: de vuelta al recorrido, no a la pantalla normal.
      UI.renderStageRun(state);
    } else if (run) {
      window.__stageRun = null;
      UI.openZoneStages(state, run.zoneIdx);
    } else {
      UI.renderScreen(activeScreen, state);
    }
  });

  const energyGained = isNewGame ? 0 : computeOfflineEnergy(state);
  if (energyGained > 0) UI.showOfflineModal(energyGained);
  saveGame(state);

  UI.renderTopbar(state);
  UI.renderScreen(activeScreen, state);

  setInterval(() => {
    tickEnergy(state, 1);
    UI.renderTopbar(state);
  }, 1000);

  setInterval(() => saveGame(state), 15000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(state); });
  window.addEventListener('pagehide', () => saveGame(state));
})();
