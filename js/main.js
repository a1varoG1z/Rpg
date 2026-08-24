// Arranque del juego, bucle principal y manejadores de eventos de la interfaz.
(function () {
  let loaded = loadGame();
  const isNewGame = !loaded;
  let state = loaded || createNewState();
  window.STATE = state;
  recalcDerived(state);
  if (!state.combat.monster) spawnMonster(state);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => UI.switchScreen(btn.dataset.screen));
  });

  $('monsterTapZone').addEventListener('click', () => {
    tapAttack(state);
    UI.renderBattle(state);
    UI.drainEvents(state);
  });

  document.querySelectorAll('.alloc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (allocateStat(state, btn.dataset.stat)) {
        saveGame(state);
        UI.renderHero(state);
      }
    });
  });

  $('settingsBtn').addEventListener('click', () => $('settingsModal').classList.remove('hidden'));
  $('settingsModalClose').addEventListener('click', () => $('settingsModal').classList.add('hidden'));
  $('resetBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar tu progreso y empezar de nuevo?')) {
      resetGame();
      location.reload();
    }
  });

  $('itemModalClose').addEventListener('click', UI.closeModal);
  $('itemModal').addEventListener('click', (e) => { if (e.target.id === 'itemModal') UI.closeModal(); });

  $('offlineClose').addEventListener('click', () => $('offlineModal').classList.add('hidden'));

  const offlineSummary = isNewGame ? null : computeOfflineProgress(state);
  if (offlineSummary) UI.showOfflineModal(offlineSummary);
  saveGame(state);

  UI.renderTopbar(state);
  UI.renderScreen(activeScreen, state);

  setInterval(() => {
    tickCombat(state, 0.2);
    UI.drainEvents(state);
    UI.renderTopbar(state);
    if (activeScreen === 'battle') UI.renderBattle(state);
  }, 200);

  setInterval(() => saveGame(state), 15000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(state); });
  window.addEventListener('pagehide', () => saveGame(state));
})();
