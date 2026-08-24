// Renderizado de pantallas, modales y reproducción de batallas.
const UI = {};
let activeScreen = 'mapa';
let mapaZoneIdx = null;

function $(id) { return document.getElementById(id); }
function el(tag, className, html) { const e = document.createElement(tag); if (className) e.className = className; if (html !== undefined) e.innerHTML = html; return e; }

// ---------- Tarjetas de criatura reutilizables ----------
function creatureCanvas(defId, sizePx) {
  const canvas = document.createElement('canvas');
  canvas.className = 'creature-canvas';
  if (sizePx) { canvas.style.width = sizePx + 'px'; canvas.style.height = (sizePx * SPR_H / SPR_W) + 'px'; }
  drawCreatureSprite(canvas, defId);
  return canvas;
}

function creatureCard(state, entry, opts) {
  opts = opts || {};
  const def = fighterDef(entry.defId);
  const rarity = rarityInfo(def.rarity);
  const card = el('div', 'creature-card rarity-' + def.rarity);
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--rg', rarity.glow);
  const wrap = el('div', 'creature-canvas-wrap');
  wrap.appendChild(creatureCanvas(entry.defId));
  card.appendChild(wrap);
  const badge = el('div', 'creature-elclass');
  badge.textContent = ELEMENT_INFO[def.element].icon + CLASS_INFO[def.class].icon;
  card.appendChild(badge);
  card.appendChild(el('div', 'creature-name', def.name));
  card.appendChild(el('div', 'creature-level', 'Nv. ' + entry.level));
  const sef = el('div', 'sef-bar');
  sef.appendChild(el('div', 'sef-fill')).style.width = (entry.sef / 5 * 100) + '%';
  card.appendChild(sef);
  if (entry.stars > 0) card.appendChild(el('div', 'star-row', '★'.repeat(entry.stars)));
  if (opts.inBand) card.appendChild(el('div', 'in-band-tag', 'En banda'));
  return card;
}

// ---------- Topbar ----------
UI.renderTopbar = function (state) {
  $('texelVal').textContent = Math.floor(state.currencies.texel).toLocaleString('es-ES');
  $('gemasVal').textContent = Math.floor(state.currencies.gemas).toLocaleString('es-ES');
  $('energiaVal').textContent = Math.floor(state.currencies.energy);
  $('energiaMax').textContent = MAX_ENERGY;
};

UI.switchScreen = function (name) {
  activeScreen = name;
  document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  UI.renderScreen(name, window.STATE);
};

UI.renderScreen = function (name, state) {
  if (name === 'mapa') UI.renderMapa(state);
  else if (name === 'banda') UI.renderBanda(state);
  else if (name === 'invocar') UI.renderInvocar(state);
  else if (name === 'arena') UI.renderArena(state);
  else if (name === 'equipo') UI.renderEquipo(state);
};

// ---------- Mapa ----------
UI.renderMapa = function (state) {
  mapaZoneIdx = null;
  $('stageList').classList.add('hidden');
  $('zoneList').classList.remove('hidden');
  const list = $('zoneList');
  list.innerHTML = '';
  ZONES.forEach((zone, idx) => {
    const unlocked = isZoneUnlocked(state, zone.id);
    const best = highestClearedStage(state, zone.id);
    const card = el('div', 'panel loc-card' + (unlocked ? '' : ' locked'));
    card.innerHTML = `
      <div class="loc-card-head"><span class="loc-card-emoji">${zone.emoji}</span><div><b>${zone.name}</b><br><small>${unlocked ? 'Progreso: ' + (best + 1) + '/' + STAGES_PER_ZONE : '🔒 Bloqueado'}</small></div></div>
      ${unlocked ? `<button class="primary-btn" id="openzone-${zone.id}">Entrar</button>` : `<div class="locked-tag">Derrota al jefe de la zona anterior</div>`}`;
    list.appendChild(card);
    if (unlocked) $('openzone-' + zone.id).addEventListener('click', () => UI.openZoneStages(state, idx));
  });
};

UI.openZoneStages = function (state, zoneIdx) {
  mapaZoneIdx = zoneIdx;
  $('zoneList').classList.add('hidden');
  const wrap = $('stageList');
  wrap.classList.remove('hidden');
  wrap.innerHTML = '';
  const zone = ZONES[zoneIdx];
  const back = el('button', 'mini-btn', '« Volver al mapa');
  back.addEventListener('click', () => UI.renderMapa(state));
  wrap.appendChild(back);
  wrap.appendChild(el('h3', null, zone.emoji + ' ' + zone.name));
  const grid = el('div', 'stage-grid');
  for (let i = 0; i < STAGES_PER_ZONE; i++) {
    const isBoss = i === STAGES_PER_ZONE - 1;
    const unlocked = isStageUnlocked(state, zone.id, i);
    const cleared = i <= highestClearedStage(state, zone.id);
    const btn = el('button', 'stage-btn' + (isBoss ? ' boss' : '') + (cleared ? ' cleared' : '') + (!unlocked ? ' locked' : ''));
    btn.innerHTML = isBoss ? '👑' : (i + 1);
    if (cleared) btn.innerHTML += '<span class="stage-check">✓</span>';
    if (unlocked) btn.addEventListener('click', () => UI.startStageBattle(state, zoneIdx, i));
    else btn.disabled = true;
    grid.appendChild(btn);
  }
  wrap.appendChild(grid);
  wrap.appendChild(el('p', 'settings-info', 'Cada etapa cuesta ' + STAGE_ENERGY_COST + ' ⚡. La etapa 8 es el jefe de zona.'));
};

UI.startStageBattle = function (state, zoneIdx, stageIdx) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
  state.currencies.energy -= STAGE_ENERGY_COST;
  const { rows: enemyRows, isBoss } = buildEnemyBand(zoneIdx, stageIdx);
  UI.openBattle(state, buildPlayerRows(state), enemyRows, {
    title: ZONES[zoneIdx].name + ' · ' + (isBoss ? 'Jefe' : 'Etapa ' + (stageIdx + 1)),
    onEnd: (result) => {
      if (result === 'victoria') {
        const rewards = stageRewards(zoneIdx, stageIdx, isBoss);
        state.currencies.texel += rewards.texel;
        if (rewards.drops.pixite) state.currencies.pixite += rewards.drops.pixite;
        if (rewards.drops.voxite) state.currencies.voxite += rewards.drops.voxite;
        if (rewards.drops.doxite) state.currencies.doxite += rewards.drops.doxite;
        if (rewards.drops.gear) addGear(state, rewards.drops.gear);
        const leveled = [];
        state.band.flat().filter(Boolean).forEach(uid => {
          const entry = rosterEntry(state, uid);
          if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
        });
        const unlockedZone = recordStageClear(state, zoneIdx, stageIdx);
        state.stats.battlesWon++;
        saveGame(state);
        return { rewards, leveled, unlockedZone };
      }
      state.stats.battlesLost++;
      saveGame(state);
      return null;
    },
  });
};

// ---------- Banda ----------
UI.renderBanda = function (state) {
  const grid = $('formationGrid');
  grid.innerHTML = '';
  for (let r = 0; r < BAND_ROWS; r++) {
    const rowEl = el('div', 'formation-row');
    for (let c = 0; c < BAND_COLS; c++) {
      const uid = state.band[r][c];
      const slot = el('div', 'formation-slot' + (uid ? '' : ' empty'));
      if (uid) {
        const entry = rosterEntry(state, uid);
        if (entry) {
          slot.appendChild(creatureCanvas(entry.defId, 46));
          slot.appendChild(el('div', 'formation-lvl', 'Nv.' + entry.level));
        }
      } else {
        slot.textContent = '+';
      }
      slot.addEventListener('click', () => UI.openFormationPicker(state, r, c));
      rowEl.appendChild(slot);
    }
    grid.appendChild(rowEl);
  }

  $('rosterCount').textContent = state.roster.length;
  const rGrid = $('rosterGrid');
  rGrid.innerHTML = '';
  const sorted = [...state.roster].sort((a, b) => rarityIndex(fighterDef(b.defId).rarity) - rarityIndex(fighterDef(a.defId).rarity) || b.level - a.level);
  const bandUids = state.band.flat().filter(Boolean);
  sorted.forEach(entry => {
    const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
    card.addEventListener('click', () => UI.openFighterModal(state, entry.uid));
    rGrid.appendChild(card);
  });
};

UI.openFormationPicker = function (state, row, col) {
  const uid = state.band[row][col];
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>Elegir luchador</h3>';
  if (uid) {
    const removeBtn = el('button', 'danger-btn', 'Quitar de la formación');
    removeBtn.addEventListener('click', () => { setBandSlot(state, row, col, null); saveGame(state); $('pickerModal').classList.add('hidden'); UI.renderBanda(state); });
    body.appendChild(removeBtn);
  }
  const list = el('div', 'picker-grid');
  const placed = state.band.flat();
  state.roster.forEach(entry => {
    if (placed.includes(entry.uid) && entry.uid !== uid) return;
    const card = creatureCard(state, entry, {});
    card.addEventListener('click', () => { setBandSlot(state, row, col, entry.uid); saveGame(state); $('pickerModal').classList.add('hidden'); UI.renderBanda(state); });
    list.appendChild(card);
  });
  body.appendChild(list);
  $('pickerModal').classList.remove('hidden');
};

UI.openFighterModal = function (state, uid) {
  const entry = rosterEntry(state, uid);
  if (!entry) return;
  const def = fighterDef(entry.defId);
  const rarity = rarityInfo(def.rarity);
  const stats = fighterStats(state, entry);
  const skill = SKILL_TYPES[def.skillId];
  const body = $('fighterModalBody');
  body.innerHTML = '';
  const head = el('div', 'fighter-modal-head');
  head.appendChild(creatureCanvas(entry.defId, 90));
  const info = el('div');
  info.innerHTML = `<div class="item-modal-name" style="color:${rarity.color}">${def.name}</div>
    <div class="item-modal-rarity">${rarity.label} · ${ELEMENT_INFO[def.element].label} ${ELEMENT_INFO[def.element].icon} · ${CLASS_INFO[def.class].label} ${CLASS_INFO[def.class].icon}</div>
    <div class="xp-bar" style="margin-top:6px"><div class="xp-fill" style="width:${entry.level >= XP_LEVEL_CAP ? 100 : (entry.xp / fighterXpToNext(entry.level) * 100)}%"></div></div>
    <div class="xp-text">Nv. ${entry.level}${entry.level >= XP_LEVEL_CAP ? ' (máx.)' : ' · ' + entry.xp + '/' + fighterXpToNext(entry.level)}</div>`;
  head.appendChild(info);
  body.appendChild(head);

  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = `
    <div class="stat-row"><span>❤️ Vida</span><span>${stats.hp}</span></div>
    <div class="stat-row"><span>⚔️ Ataque</span><span>${stats.atk}</span></div>
    <div class="stat-row"><span>🛡️ Defensa</span><span>${stats.def}</span></div>
    <div class="stat-row"><span>💨 Agilidad</span><span>${stats.agi}</span></div>
    <div class="stat-row"><span>🧠 Sabiduría</span><span>${stats.wis}</span></div>`;
  body.appendChild(statsPanel);

  const skillPanel = el('div', 'panel');
  skillPanel.innerHTML = `<h3>${skill.name}</h3><p class="settings-info">${skill.desc}</p><div class="stat-row"><span>Enfriamiento</span><span>${skill.cooldown} turnos</span></div>`;
  body.appendChild(skillPanel);

  const sefPanel = el('div', 'panel');
  sefPanel.innerHTML = `<h3>Fusión (SEF) <span class="badge">${entry.sef}/5</span></h3>
    <div class="sef-bar big"><div class="sef-fill" style="width:${entry.sef / 5 * 100}%"></div></div>
    <p class="settings-info">${def.evolvesTo ? 'Al llegar a 5/5 evoluciona a <b>' + fighterDef(def.evolvesTo).name + '</b>. Consíguelo invocando duplicados.' : 'Forma máxima: los duplicados se convierten en Texel.'}</p>`;
  if (entry.stars > 0) sefPanel.innerHTML += `<div class="stat-row"><span>Superfusión</span><span>${'★'.repeat(entry.stars)}${'☆'.repeat(3 - entry.stars)}</span></div>`;
  body.appendChild(sefPanel);
  if (entry.stars < 3) {
    const superBtn = el('button', 'primary-btn', 'Superfusionar (sacrificar otro luchador)');
    superBtn.addEventListener('click', () => UI.openSuperFusePicker(state, uid));
    body.appendChild(superBtn);
  }

  const gearPanel = el('div', 'panel');
  gearPanel.innerHTML = '<h3>Equipo</h3>';
  const gearRow = el('div', 'gear-slots-row');
  ['arma', 'armadura'].forEach(slotKey => {
    const gearUid = slotKey === 'arma' ? entry.gearArma : entry.gearArmadura;
    const box = el('div', 'doll-slot' + (gearUid ? '' : ' empty'));
    if (gearUid) {
      const g = gearItem(state, gearUid);
      box.innerHTML = `<div class="doll-icon">${GEAR_SLOTS[slotKey].icon}</div><div class="doll-plus">+${g.level}</div>`;
    } else {
      box.innerHTML = `<div class="doll-icon">${GEAR_SLOTS[slotKey].icon}</div><div class="doll-label">${GEAR_SLOTS[slotKey].label}</div>`;
    }
    box.addEventListener('click', () => UI.openGearPickerForFighter(state, uid, slotKey));
    gearRow.appendChild(box);
  });
  gearPanel.appendChild(gearRow);
  body.appendChild(gearPanel);

  $('fighterModal').classList.remove('hidden');
};

UI.openSuperFusePicker = function (state, targetUid) {
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>Sacrificar luchador (SEF 5/5)</h3><p class="settings-info">Otorga una ★ permanente al luchador objetivo.</p>';
  const list = el('div', 'picker-grid');
  const candidates = state.roster.filter(r => r.uid !== targetUid && r.sef >= 5);
  if (candidates.length === 0) list.appendChild(el('div', 'empty-hint', 'No tienes luchadores con SEF 5/5 disponibles.'));
  candidates.forEach(entry => {
    const card = creatureCard(state, entry, {});
    card.addEventListener('click', () => {
      if (superFuse(state, targetUid, entry.uid)) {
        saveGame(state);
        $('pickerModal').classList.add('hidden');
        UI.openFighterModal(state, targetUid);
        UI.renderBanda(state);
      }
    });
    list.appendChild(card);
  });
  body.appendChild(list);
  $('pickerModal').classList.remove('hidden');
};

UI.openGearPickerForFighter = function (state, fighterUid, slotKey) {
  const entry = rosterEntry(state, fighterUid);
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>Equipar ${GEAR_SLOTS[slotKey].label}</h3>`;
  const currentUid = slotKey === 'arma' ? entry.gearArma : entry.gearArmadura;
  if (currentUid) {
    const removeBtn = el('button', 'danger-btn', 'Quitar equipo');
    removeBtn.addEventListener('click', () => { unequipGear(state, fighterUid, slotKey); saveGame(state); $('pickerModal').classList.add('hidden'); UI.openFighterModal(state, fighterUid); });
    body.appendChild(removeBtn);
  }
  const list = el('div', 'item-grid');
  const options = state.gearInventory.filter(g => g.slot === slotKey && !equippedGearOwner(state, g.uid) || g.uid === currentUid);
  if (options.length === 0) list.appendChild(el('div', 'empty-hint', 'No tienes piezas de este tipo.'));
  options.forEach(g => {
    const rarity = rarityInfo(g.rarity);
    const cell = el('div', 'item-cell');
    cell.style.borderColor = rarity.color;
    cell.innerHTML = `<div class="item-icon">${GEAR_SLOTS[g.slot].icon}</div><div class="item-plus">+${g.level}</div>`;
    cell.addEventListener('click', () => { equipGear(state, fighterUid, g.uid); saveGame(state); $('pickerModal').classList.add('hidden'); UI.openFighterModal(state, fighterUid); });
    list.appendChild(cell);
  });
  body.appendChild(list);
  $('pickerModal').classList.remove('hidden');
};

// ---------- Invocar ----------
UI.renderInvocar = function (state) {
  const wrap = $('summonPanels');
  wrap.innerHTML = '';
  Object.keys(CRYSTALS).forEach(type => {
    const c = CRYSTALS[type];
    const panel = el('div', 'panel summon-panel');
    const rateText = Object.keys(c.rates).filter(r => c.rates[r] > 0).map(r => rarityInfo(r).label + ' ' + Math.round(c.rates[r] * 100) + '%').join(' · ');
    panel.innerHTML = `<h3>${c.icon} ${c.label} <span class="badge">${state.currencies[type]}</span></h3><p class="settings-info">${rateText}</p>`;
    const btnRow = el('div', 'modal-actions');
    const btn1 = el('button', 'primary-btn', 'Invocar x1');
    btn1.disabled = state.currencies[type] < 1;
    btn1.addEventListener('click', () => UI.doSummon(state, type, 1));
    const btn10 = el('button', 'primary-btn', 'Invocar x10');
    btn10.disabled = state.currencies[type] < 10;
    btn10.addEventListener('click', () => UI.doSummon(state, type, 10));
    btnRow.appendChild(btn1); btnRow.appendChild(btn10);
    panel.appendChild(btnRow);
    const buyBtn = el('button', 'mini-btn', 'Comprar 1 por 💎' + crystalGemCost(type));
    buyBtn.disabled = state.currencies.gemas < crystalGemCost(type);
    buyBtn.addEventListener('click', () => {
      const cost = crystalGemCost(type);
      if (state.currencies.gemas >= cost) { state.currencies.gemas -= cost; state.currencies[type]++; saveGame(state); UI.renderInvocar(state); UI.renderTopbar(state); }
    });
    panel.appendChild(buyBtn);
    wrap.appendChild(panel);
  });
};
function crystalGemCost(type) { return { pixite: 6, voxite: 35, doxite: 140 }[type]; }

UI.doSummon = function (state, type, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const r = summonOne(state, type);
    if (r) results.push(r);
  }
  saveGame(state);
  UI.renderTopbar(state);
  UI.renderInvocar(state);
  if (results.length === 0) return;
  if (count === 1) UI.showSingleReveal(results[0]);
  else UI.showMultiReveal(results);
};

UI.showSingleReveal = function (result) {
  const def = fighterDef(result.defId);
  const rarity = rarityInfo(def.rarity);
  const body = $('summonRevealBody');
  body.className = 'reveal-flash rarity-' + def.rarity;
  const outcomeText = { nuevo: '¡Nuevo luchador!', duplicado: 'Duplicado · SEF ' + result.sef + '/5', evolucion: '¡Evolución!', duplicado_max: 'Convertido en Texel', inventario_lleno: 'Colección llena · Convertido en Texel' }[result.outcome];
  body.innerHTML = `<div class="reveal-canvas-wrap"></div><div class="item-modal-name" style="color:${rarity.color}">${def.name}</div><div class="item-modal-rarity">${rarity.label}</div><div class="reveal-outcome">${outcomeText}</div>`;
  body.querySelector('.reveal-canvas-wrap').appendChild(creatureCanvas(result.defId, 120));
  $('summonRevealClose').classList.remove('hidden');
  $('summonRevealModal').classList.remove('hidden');
};

UI.showMultiReveal = function (results) {
  const body = $('summonRevealBody');
  body.className = '';
  body.innerHTML = '<h3>Resultados</h3>';
  const grid = el('div', 'item-grid');
  results.forEach(r => {
    const def = fighterDef(r.defId);
    const rarity = rarityInfo(def.rarity);
    const cell = el('div', 'item-cell');
    cell.style.borderColor = rarity.color;
    cell.appendChild(creatureCanvas(r.defId, 56));
    grid.appendChild(cell);
  });
  body.appendChild(grid);
  $('summonRevealClose').classList.remove('hidden');
  $('summonRevealModal').classList.remove('hidden');
};

// ---------- Arena ----------
UI.renderArena = function (state) {
  $('arenaRankPanel').innerHTML = `<h3>Rango actual: ${state.arena.rank}</h3><div class="stat-row"><span>Mejor rango</span><span>${state.arena.bestRank}</span></div>`;
  const enemyPanel = $('arenaEnemyPanel');
  enemyPanel.innerHTML = '';
  if (!state.arena.scouted) {
    enemyPanel.innerHTML = '<h3>Sin rival explorado</h3>';
    const scoutBtn = el('button', 'primary-btn', 'Buscar rival');
    scoutBtn.addEventListener('click', () => {
      const { rows } = buildArenaBand(state.arena.rank);
      state.arena.scouted = rows.map(row => row.map(u => ({ defId: u.defId, level: u.level })));
      saveGame(state);
      UI.renderArena(state);
    });
    enemyPanel.appendChild(scoutBtn);
    return;
  }
  enemyPanel.appendChild(el('h3', null, 'Rival explorado'));
  state.arena.scouted.forEach((row, i) => {
    if (row.length === 0) return;
    const rowEl = el('div', 'formation-row');
    row.forEach(u => { const slot = el('div', 'formation-slot filled'); slot.appendChild(creatureCanvas(u.defId, 40)); rowEl.appendChild(slot); });
    enemyPanel.appendChild(rowEl);
  });
  const fightBtn = el('button', 'primary-btn', 'Combatir');
  fightBtn.addEventListener('click', () => UI.startArenaBattle(state));
  enemyPanel.appendChild(fightBtn);
  const rescout = el('button', 'mini-btn', 'Buscar otro rival');
  rescout.addEventListener('click', () => { state.arena.scouted = null; saveGame(state); UI.renderArena(state); });
  enemyPanel.appendChild(rescout);
};

UI.startArenaBattle = function (state) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  const enemyRows = state.arena.scouted.map(row => row.map(u => makeUnit('enemy', u.defId, u.level)));
  UI.openBattle(state, buildPlayerRows(state), enemyRows, {
    title: 'Arena · Rango ' + state.arena.rank,
    onEnd: (result) => {
      state.arena.scouted = null;
      if (result === 'victoria') {
        state.arena.rank++;
        state.arena.bestRank = Math.max(state.arena.bestRank, state.arena.rank);
        const texel = 40 + state.arena.rank * 6, gemas = 3 + Math.floor(state.arena.rank / 3);
        state.currencies.texel += texel; state.currencies.gemas += gemas;
        state.stats.battlesWon++;
        saveGame(state);
        return { rewards: { texel, fighterXp: 0, drops: {} }, leveled: [], gemas };
      }
      state.stats.battlesLost++;
      saveGame(state);
      return null;
    },
  });
};

// ---------- Equipo ----------
UI.renderEquipo = function (state) {
  $('gearCount').textContent = state.gearInventory.length;
  const grid = $('gearGrid');
  grid.innerHTML = '';
  $('gearEmptyHint').classList.toggle('hidden', state.gearInventory.length > 0);
  state.gearInventory.forEach(g => {
    const rarity = rarityInfo(g.rarity);
    const owner = equippedGearOwner(state, g.uid);
    const cell = el('div', 'item-cell');
    cell.style.borderColor = rarity.color;
    cell.innerHTML = `<div class="item-icon">${GEAR_SLOTS[g.slot].icon}</div><div class="item-plus">+${g.level}</div>${owner ? '<div class="equipped-dot"></div>' : ''}`;
    cell.addEventListener('click', () => UI.openGearModal(state, g.uid));
    grid.appendChild(cell);
  });
};

UI.openGearModal = function (state, gearUid) {
  const g = gearItem(state, gearUid);
  const rarity = rarityInfo(g.rarity);
  const owner = equippedGearOwner(state, gearUid);
  const body = $('gearModalBody');
  body.innerHTML = `
    <div class="item-modal-header" style="color:${rarity.color}"><span class="item-modal-icon">${GEAR_SLOTS[g.slot].icon}</span>
      <div><div class="item-modal-name">${GEAR_SLOTS[g.slot].names[g.rarity]} +${g.level}</div><div class="item-modal-rarity">${rarity.label} · ${GEAR_SLOTS[g.slot].label}</div></div></div>
    <div class="panel"><div class="stat-row"><span>${g.slot === 'arma' ? '⚔️ Ataque' : '🛡️ Defensa'}</span><span>+${gearStatValue(g)}</span></div></div>
    ${owner ? `<p class="settings-info">Equipado en ${fighterDef(rosterEntry(state, owner.uid).defId).name}.</p>` : ''}
  `;
  const actions = el('div', 'modal-actions');
  const upgradeBtn = el('button', 'primary-btn', 'Mejorar (🪙 ' + gearUpgradeCost(g) + ')');
  upgradeBtn.addEventListener('click', () => { if (upgradeGear(state, gearUid)) { saveGame(state); UI.openGearModal(state, gearUid); UI.renderTopbar(state); } });
  actions.appendChild(upgradeBtn);
  if (!owner) {
    const sellBtn = el('button', 'danger-btn', 'Vender (🪙 ' + gearStatValue(g) * 2 + ')');
    sellBtn.addEventListener('click', () => { sellGear(state, gearUid); saveGame(state); $('gearModal').classList.add('hidden'); UI.renderEquipo(state); UI.renderTopbar(state); });
    actions.appendChild(sellBtn);
  }
  body.appendChild(actions);
  $('gearModal').classList.remove('hidden');
};

// ---------- Batalla ----------
UI.openBattle = function (state, playerRowsOriginal, enemyRowsOriginal, opts) {
  const simRows = JSON.parse(JSON.stringify({ p: playerRowsOriginal, e: enemyRowsOriginal }));
  const { log, result } = simulateBattle(simRows.p, simRows.e);
  const unitById = {};
  [...playerRowsOriginal, ...enemyRowsOriginal].flat().forEach(u => { unitById[u.id] = u; });

  const view = {
    playerRows: playerRowsOriginal, enemyRows: enemyRowsOriginal, unitById, log, idx: 0,
    activeP: 0, activeE: 0, timer: null, opts, state, result,
  };
  window.__battleView = view;
  $('battleTitle').textContent = opts.title;
  $('battleResult').classList.add('hidden');
  $('battleLog').innerHTML = '';
  UI.renderBattleRows(view);
  $('battleOverlay').classList.remove('hidden');
  UI.stepBattle(view, false);
};

UI.renderBattleRows = function (view) {
  const renderSide = (rows, activeIdx, activeElId, queuedElId, side) => {
    const activeEl = $(activeElId);
    activeEl.innerHTML = '';
    const row = rows[activeIdx] || [];
    row.forEach(u => activeEl.appendChild(UI.battleUnitCard(u)));
    const queuedEl = $(queuedElId);
    queuedEl.innerHTML = '';
    for (let i = activeIdx + 1; i < 3; i++) {
      if (!rows[i] || rows[i].length === 0) continue;
      const mini = el('div', 'queued-row-mini');
      rows[i].forEach(u => { const s = creatureCanvas(u.defId, 26); mini.appendChild(s); });
      queuedEl.appendChild(mini);
    }
  };
  renderSide(view.playerRows, view.activeP, 'playerActiveRow', 'playerQueuedRows', 'player');
  renderSide(view.enemyRows, view.activeE, 'enemyActiveRow', 'enemyQueuedRows', 'enemy');
};

UI.battleUnitCard = function (u) {
  const card = el('div', 'battle-unit rarity-' + u.rarity + (u.alive ? '' : ' fainted'));
  card.dataset.unitId = u.id;
  card.appendChild(creatureCanvas(u.defId, 52));
  const hpBar = el('div', 'hp-bar small');
  const fill = el('div', 'hp-fill');
  fill.style.width = Math.max(0, u.hp / u.maxHp * 100) + '%';
  hpBar.appendChild(fill);
  card.appendChild(hpBar);
  card.appendChild(el('div', 'battle-unit-name', u.name));
  return card;
};

UI.updateUnitCardHp = function (u) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${u.id}"]`);
  if (!cardEl) return;
  const fill = cardEl.querySelector('.hp-fill');
  if (fill) fill.style.width = Math.max(0, u.hp / u.maxHp * 100) + '%';
  if (!u.alive) cardEl.classList.add('fainted');
};

UI.logLine = function (text) {
  const logEl = $('battleLog');
  const line = el('div', 'battle-log-line', text);
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.children.length > 40) logEl.removeChild(logEl.firstChild);
};

UI.stepBattle = function (view, instant) {
  if (view.timer) { clearTimeout(view.timer); view.timer = null; }
  const advance = () => {
    if (view.idx >= view.log.length) { UI.finishBattle(view); return; }
    const ev = view.log[view.idx++];
    UI.applyBattleEvent(view, ev);
    if (!instant) view.timer = setTimeout(advance, 420);
    else advance();
  };
  advance();
};

UI.applyBattleEvent = function (view, ev) {
  const u = ev.unitId ? view.unitById[ev.unitId] : null;
  const attacker = ev.attackerId ? view.unitById[ev.attackerId] : null;
  const target = ev.targetId ? view.unitById[ev.targetId] : null;
  switch (ev.type) {
    case 'row_enter':
      if (ev.side === 'player') view.activeP = ev.rowIndex; else view.activeE = ev.rowIndex;
      UI.renderBattleRows(view);
      break;
    case 'row_clear':
      UI.logLine((ev.side === 'player' ? 'Tu fila' : 'Fila rival') + ' ha caído.');
      break;
    case 'skill':
      UI.logLine(`✨ ${u.name} usa ${ev.skillName}`);
      break;
    case 'attack':
      target.hp = Math.max(0, target.hp - ev.amount);
      UI.updateUnitCardHp(target);
      UI.spawnBattleFloat(target.id, '-' + ev.amount + (ev.isCrit ? '!' : ''), ev.isCrit);
      UI.logLine(`${attacker.name} → ${target.name}: -${ev.amount}${ev.isCrit ? ' ¡CRÍTICO!' : ''}`);
      break;
    case 'heal':
      target.hp = Math.min(target.maxHp, target.hp + ev.amount);
      UI.updateUnitCardHp(target);
      UI.spawnBattleFloat(target.id, '+' + ev.amount, false);
      break;
    case 'faint':
      if (u) { u.alive = false; UI.updateUnitCardHp(u); }
      UI.logLine(`💀 ${u ? u.name : ''} ha caído.`);
      break;
    case 'stunattempt':
      UI.logLine(ev.success ? `⚡ ${target.name} queda aturdido.` : `${target.name} resiste el aturdimiento.`);
      break;
    case 'stunned':
      UI.logLine(`😵 ${u.name} está aturdido y no puede actuar.`);
      break;
    case 'buff':
    case 'debuff':
      break;
    case 'battle_end':
      break;
  }
};

UI.spawnBattleFloat = function (unitId, text, crit) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${unitId}"]`);
  if (!cardEl) return;
  const fl = el('div', 'battle-float' + (crit ? ' crit' : ''), text);
  cardEl.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
};

UI.finishBattle = function (view) {
  const outcome = view.opts.onEnd(view.result);
  const body = $('battleResultBody');
  if (view.result === 'victoria') {
    let html = `<h3>🏆 ¡Victoria!</h3>`;
    if (outcome && outcome.rewards) {
      html += `<div class="stat-row"><span>🪙 Texel</span><span>+${outcome.rewards.texel}</span></div>`;
      if (outcome.rewards.fighterXp) html += `<div class="stat-row"><span>⭐ XP por luchador</span><span>+${outcome.rewards.fighterXp}</span></div>`;
      if (outcome.gemas) html += `<div class="stat-row"><span>💎 Gemas</span><span>+${outcome.gemas}</span></div>`;
      if (outcome.rewards.drops && outcome.rewards.drops.gear) html += `<div class="stat-row"><span>🎁 Objeto</span><span>${GEAR_SLOTS[outcome.rewards.drops.gear.slot].names[outcome.rewards.drops.gear.rarity]}</span></div>`;
    }
    if (outcome && outcome.leveled && outcome.leveled.length) html += `<p class="settings-info">¡Subieron de nivel!: ${outcome.leveled.join(', ')}</p>`;
    if (outcome && outcome.unlockedZone) html += `<p class="settings-info">🗺️ ¡Nueva zona desbloqueada: ${outcome.unlockedZone.name}!</p>`;
    body.innerHTML = html;
  } else {
    body.innerHTML = `<h3>💀 Derrota</h3><p class="settings-info">Tu banda ha caído. Mejora tu equipo y vuelve a intentarlo.</p>`;
  }
  $('battleResult').classList.remove('hidden');
};

// ---------- Toasts / offline ----------
UI.showToast = function (text) {
  const container = $('toastContainer');
  const t = el('div', 'toast-item', text);
  container.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
};

UI.showOfflineModal = function (energyGained) {
  $('offlineBody').innerHTML = `<div class="stat-row"><span>⚡ Energía recuperada</span><span>+${energyGained}</span></div>`;
  $('offlineModal').classList.remove('hidden');
};
