// Arranque del juego, bucle principal y manejadores de eventos de la interfaz.
(function () {
  let loaded = loadGame();
  const isNewGame = !loaded;
  let state = loaded || createNewState();
  window.STATE = state;
  recordPlayDay(state);
  saveGame(state);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => UI.switchScreen(btn.dataset.screen));
  });

  document.body.classList.toggle('hide-medallion', !state.settings.showMedallion);

  UI.rosterSortMode = 'reciente';
  UI.rosterStatVariant = 'current';
  $('rosterSortSelect').addEventListener('change', (e) => {
    UI.rosterSortMode = e.target.value;
    UI.renderBanda(state);
  });
  $('rosterStatVariantCurrentBtn').addEventListener('click', () => {
    UI.rosterStatVariant = 'current';
    $('rosterStatVariantCurrentBtn').classList.add('active');
    $('rosterStatVariantBaseBtn').classList.remove('active');
    UI.renderBanda(state);
  });
  $('rosterStatVariantBaseBtn').addEventListener('click', () => {
    UI.rosterStatVariant = 'base';
    $('rosterStatVariantBaseBtn').classList.add('active');
    $('rosterStatVariantCurrentBtn').classList.remove('active');
    UI.renderBanda(state);
  });
  $('rosterFilterElement').addEventListener('change', (e) => { UI.rosterFilter.element = e.target.value; UI.renderBanda(state); });
  $('rosterFilterClass').addEventListener('change', (e) => { UI.rosterFilter.class = e.target.value; UI.renderBanda(state); });
  $('rosterFilterRarity').addEventListener('change', (e) => { UI.rosterFilter.rarity = e.target.value; UI.renderBanda(state); });

  $('settingsBtn').addEventListener('click', () => {
    $('infiniteEnergyToggle').checked = state.settings.infiniteEnergy;
    $('showMedallionToggle').checked = state.settings.showMedallion;
    $('enableTorreToggle').checked = state.settings.enableTorreBatalla;
    $('enableElementalToggle').checked = state.settings.enableElementalDungeon;
    $('enableRoguelikeToggle').checked = state.settings.enableRoguelike;
    $('settingsModal').classList.remove('hidden');
  });
  $('settingsModalClose').addEventListener('click', () => $('settingsModal').classList.add('hidden'));
  $('pokedexBtn').addEventListener('click', () => UI.openPokedex(state));
  $('formationPresetsBtn').addEventListener('click', () => UI.openFormationPresets(state));
  $('bulkModeBtn').addEventListener('click', () => {
    UI.bulkMode = !UI.bulkMode;
    UI.bulkSelection.clear();
    UI.renderBanda(state);
  });
  $('gearFilterSelect').addEventListener('change', (e) => { UI.gearFilterMode = e.target.value; UI.renderEquipo(state); });
  $('gearBulkModeBtn').addEventListener('click', () => {
    UI.gearBulkMode = !UI.gearBulkMode;
    UI.gearBulkSelection.clear();
    UI.renderEquipo(state);
  });
  $('unequipBenchBtn').addEventListener('click', () => {
    const count = unequipBenchedGear(state);
    saveGame(state);
    UI.renderEquipo(state);
    UI.showToast(count > 0 ? `🎒 ${count} pieza${count === 1 ? '' : 's'} desequipada${count === 1 ? '' : 's'} de la banca` : '🎒 Nadie en la banca llevaba equipo puesto');
  });
  $('sellUnequippedBtn').addEventListener('click', () => {
    const unequippedCount = state.gearInventory.filter(g => !equippedGearOwner(state, g.uid)).length;
    if (unequippedCount === 0) { UI.showToast('🪙 No tienes equipo sin usar'); return; }
    if (!confirm(`¿Vender las ${unequippedCount} piezas de equipo sin usar? No se puede deshacer.`)) return;
    const { count, totalValue } = sellAllUnequippedGear(state);
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderEquipo(state);
    UI.showToast(`🪙 Vendidas ${count} piezas por +${totalValue} Texel`);
  });
  $('pokedexModalClose').addEventListener('click', () => $('pokedexModal').classList.add('hidden'));
  $('pokedexEntryModalClose').addEventListener('click', () => $('pokedexEntryModal').classList.add('hidden'));
  $('objectivesBtn').addEventListener('click', () => UI.openObjectives(state));
  $('objectivesModalClose').addEventListener('click', () => $('objectivesModal').classList.add('hidden'));
  $('bossesModalClose').addEventListener('click', () => $('bossesModal').classList.add('hidden'));
  $('bossEntryModalClose').addEventListener('click', () => $('bossEntryModal').classList.add('hidden'));
  $('familyTrialsModalClose').addEventListener('click', () => $('familyTrialsModal').classList.add('hidden'));
  $('guideBtn').addEventListener('click', () => UI.openGuide());
  $('guideModalClose').addEventListener('click', () => $('guideModal').classList.add('hidden'));
  $('exportSaveBtn').addEventListener('click', () => UI.openExportSave(state));
  $('importSaveBtn').addEventListener('click', () => UI.openImportSave());
  $('resetBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar tu progreso y empezar de nuevo?')) {
      UI.suppressAutosave = true;
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
  $('showMedallionToggle').addEventListener('change', (e) => {
    state.settings.showMedallion = e.target.checked;
    saveGame(state);
    document.body.classList.toggle('hide-medallion', !state.settings.showMedallion);
    UI.showToast(state.settings.showMedallion ? '⚪ Medallón activado' : '⚪ Medallón desactivado');
  });
  $('enableTorreToggle').addEventListener('change', (e) => {
    state.settings.enableTorreBatalla = e.target.checked;
    saveGame(state);
    if (activeScreen === 'torre') UI.renderTorre(state);
    UI.showToast(state.settings.enableTorreBatalla ? '🗼 Torre Batalla activada (modo de prueba)' : '🗼 Torre Batalla desactivada');
  });
  $('enableElementalToggle').addEventListener('change', (e) => {
    state.settings.enableElementalDungeon = e.target.checked;
    saveGame(state);
    if (activeScreen === 'torre') UI.renderTorre(state);
    UI.showToast(state.settings.enableElementalDungeon ? '🌋 Mazmorra Elemental activada (modo de prueba)' : '🌋 Mazmorra Elemental desactivada');
  });
  $('enableRoguelikeToggle').addEventListener('change', (e) => {
    state.settings.enableRoguelike = e.target.checked;
    saveGame(state);
    if (activeScreen === 'torre') UI.renderTorre(state);
    UI.showToast(state.settings.enableRoguelike ? '🌀 Roguelike activado (modo de prueba)' : '🌀 Roguelike desactivado');
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
  $('battleAutoBtn').addEventListener('click', () => UI.toggleAutoBattle());
  $('battleSpeedBtn').addEventListener('click', () => UI.cycleBattleSpeed());
  $('battleCloseBtn').addEventListener('click', () => {
    $('battleOverlay').classList.add('hidden');
    window.__battleView = null;
    UI.renderTopbar(state);
    // Prueba del Campeón: flujo aparte del recorrido nodo-a-nodo (window.__stageRun) —
    // si sigue viva (ganó el duelo), el siguiente duelo empieza ya mismo; si acabó
    // (perdió), UI.fightChampionDuel ya la puso a null dentro de onEnd.
    if (window.__championRun) { UI.fightChampionDuel(state); return; }
    if (window.__familyTrialActive) {
      // Trial de familia: combate único (sin window.__stageRun propio, ver
      // UI.startFamilyTrial) — al cerrar el resultado, de vuelta a la
      // rejilla de Trials en vez de la pantalla normal, para poder
      // encadenar el siguiente sin tener que reabrir el modal a mano.
      window.__familyTrialActive = false;
      UI.openFamilyTrials(state);
      return;
    }
    if (window.__roguelikeRun) {
      // Ronda superada (pendingBoon): elegir bono antes de la siguiente
      // ronda. Derrota: onEnd ya puso window.__roguelikeRun a null, así que
      // este bloque no se alcanza — cae al render normal de más abajo.
      if (window.__roguelikeRun.pendingBoon) { window.__roguelikeRun.pendingBoon = false; UI.openRoguelikeBoonPicker(state); }
      return;
    }
    const run = window.__stageRun;
    if (run && !run.failed && run.nodeIdx < run.encounters.length) {
      // Encuentro intermedio superado: de vuelta al recorrido, no a la pantalla normal.
      UI.renderStageRun(state);
    } else if (run) {
      window.__stageRun = null;
      if (run.isTorre || run.isElemental || run.isTierCap) UI.renderTorre(state); else UI.openZoneStages(state, run.zoneIdx);
    } else {
      UI.renderScreen(activeScreen, state);
    }
  });

  const energyGained = isNewGame ? 0 : computeOfflineEnergy(state);
  if (energyGained > 0) UI.showOfflineModal(energyGained);
  saveGame(state);

  UI.renderTopbar(state);
  UI.renderScreen(activeScreen, state);

  if (state.__orphanCount) {
    const n = state.__orphanCount;
    delete state.__orphanCount;
    saveGame(state);
    UI.showToast('⚠️ Se ' + (n > 1 ? 'han retirado ' + n + ' luchadores' : 'ha retirado 1 luchador') + ' de tu Colección/Formación: ya no existen en el juego');
  }

  setInterval(() => {
    tickEnergy(state, 1);
    UI.renderTopbar(state);
  }, 1000);

  // UI.suppressAutosave: lo activan Reiniciar partida e Importar partida
  // justo antes de un location.reload() que ya ha dejado el localStorage
  // como toca (borrado o con la partida importada) — sin este freno, el
  // reload dispara igualmente pagehide/visibilitychange (la pestaña se
  // oculta/descarga antes de que cargue la nueva) y el autoguardado de
  // aquí reescribía por encima la partida VIEJA (la que sigue en la
  // variable `state` de este cierre), deshaciendo el reinicio/importación
  // justo antes de que la página recargada llegara a leer el cambio.
  setInterval(() => { if (!UI.suppressAutosave) saveGame(state); }, 15000);
  document.addEventListener('visibilitychange', () => { if (document.hidden && !UI.suppressAutosave) saveGame(state); });
  window.addEventListener('pagehide', () => { if (!UI.suppressAutosave) saveGame(state); });
})();
