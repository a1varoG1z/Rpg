// Renderizado de todas las pantallas y manejo de eventos visuales.
const UI = {};
let activeScreen = 'battle';
let modalItemId = null;

function $(id) { return document.getElementById(id); }

UI.switchScreen = function (name) {
  activeScreen = name;
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  UI.renderScreen(name, window.STATE);
};

UI.renderScreen = function (name, state) {
  if (name === 'battle') UI.renderBattle(state);
  else if (name === 'hero') UI.renderHero(state);
  else if (name === 'inventory') UI.renderInventory(state);
  else if (name === 'skills') UI.renderSkills(state);
  else if (name === 'map') UI.renderMap(state);
};

UI.renderTopbar = function (state) {
  $('goldVal').textContent = Math.floor(state.hero.gold).toLocaleString('es-ES');
  $('gemVal').textContent = Math.floor(state.hero.gems).toLocaleString('es-ES');
  const loc = locationById(state.combat.locationId);
  $('locEmoji').textContent = loc.emoji;
  $('locName').textContent = loc.name;
  $('waveVal').textContent = state.combat.wave;
};

UI.renderBattle = function (state) {
  const h = state.hero;
  const c = state.combat;
  $('heroLevelBattle').textContent = h.level;
  const hpPct = Math.max(0, (h.hp / h.derived.maxHp) * 100);
  $('heroHpFill').style.width = hpPct + '%';
  $('heroHpText').textContent = Math.max(0, Math.round(h.hp)) + '/' + h.derived.maxHp;
  $('heroSprite').classList.toggle('low-hp', hpPct < 30);

  $('respawnOverlay').classList.toggle('hidden', c.respawnTimer <= 0);
  if (c.respawnTimer > 0) $('respawnTimer').textContent = Math.ceil(c.respawnTimer);

  const m = c.monster;
  if (m) {
    $('monsterSprite').textContent = m.emoji;
    $('monsterName').textContent = m.name;
    const mPct = Math.max(0, (m.hp / m.maxHp) * 100);
    $('monsterHpFill').style.width = mPct + '%';
    $('monsterHpText').textContent = Math.max(0, Math.round(m.hp)) + '/' + m.maxHp;
    $('bossTag').classList.toggle('hidden', !m.isBoss);
    $('monsterTapZone').classList.toggle('boss', !!m.isBoss);
  }

  const cyclePos = ((c.wave - 1) % BOSS_WAVE_INTERVAL);
  $('waveFill').style.width = ((cyclePos / BOSS_WAVE_INTERVAL) * 100) + '%';

  UI.renderSkillsBar(state);
};

UI.renderSkillsBar = function (state) {
  const bar = $('skillsBar');
  const learned = SKILLS.filter(s => state.skills[s.id].level > 0 && state.hero.level >= s.unlockLevel);
  if (bar.dataset.count !== String(learned.length)) {
    bar.innerHTML = '';
    learned.forEach(def => {
      const btn = document.createElement('button');
      btn.className = 'skill-btn';
      btn.dataset.skill = def.id;
      btn.innerHTML = `<span class="skill-emoji">${def.emoji}</span><div class="skill-cd-overlay"></div>`;
      btn.addEventListener('click', () => { useSkill(window.STATE, def.id); UI.renderBattle(window.STATE); });
      bar.appendChild(btn);
    });
    bar.dataset.count = String(learned.length);
  }
  learned.forEach(def => {
    const btn = bar.querySelector(`[data-skill="${def.id}"]`);
    if (!btn) return;
    const cd = state.combat.skillCooldowns[def.id] || 0;
    const maxCd = def.cooldown(state.skills[def.id].level);
    const overlay = btn.querySelector('.skill-cd-overlay');
    if (cd > 0) {
      overlay.style.height = Math.min(100, (cd / maxCd) * 100) + '%';
      btn.classList.add('on-cd');
    } else {
      overlay.style.height = '0%';
      btn.classList.remove('on-cd');
    }
  });
};

UI.spawnFloatingNumber = function (text, isHero, isCrit) {
  const container = $('floatingNumbers');
  const el = document.createElement('div');
  el.className = 'float-num' + (isHero ? ' hero-num' : ' enemy-num') + (isCrit ? ' crit' : '');
  el.textContent = text;
  const side = isHero ? 25 : 70;
  el.style.left = (side + (Math.random() * 10 - 5)) + '%';
  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
};

UI.showToast = function (text) {
  const container = $('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 2800);
};

UI.renderHero = function (state) {
  const h = state.hero;
  $('heroLevelVal').textContent = 'Nivel ' + h.level;
  $('xpText').textContent = Math.floor(h.xp) + '/' + xpToNext(h.level);
  $('xpFill').style.width = Math.min(100, (h.xp / xpToNext(h.level)) * 100) + '%';
  $('statAtk').textContent = h.derived.atk;
  $('statDef').textContent = h.derived.def;
  $('statHp').textContent = h.derived.maxHp;
  $('statCrit').textContent = h.derived.critChance + '%';
  $('statSpeed').textContent = h.derived.atkSpeed + '/s';
  $('statPointsVal').textContent = h.statPoints;
  $('strVal').textContent = h.str;
  $('agiVal').textContent = h.agi;
  $('vitVal').textContent = h.vit;
  document.querySelectorAll('.alloc-btn').forEach(b => b.disabled = h.statPoints <= 0);

  const doll = $('paperdoll');
  doll.innerHTML = '';
  SLOTS.forEach(slot => {
    const item = state.equipment[slot];
    const box = document.createElement('div');
    box.className = 'doll-slot';
    if (item) {
      const rarity = rarityInfo(item.rarityId);
      box.style.borderColor = rarity.color;
      box.innerHTML = `<div class="doll-icon">${item.icon}</div><div class="doll-plus">${item.level > 0 ? '+' + item.level : ''}</div>`;
      box.addEventListener('click', () => UI.openItemModal(item.id, true));
    } else {
      box.classList.add('empty');
      box.innerHTML = `<div class="doll-icon">${SLOT_INFO[slot].icon}</div><div class="doll-label">${SLOT_INFO[slot].label}</div>`;
    }
    doll.appendChild(box);
  });
};

UI.renderInventory = function (state) {
  $('invCount').textContent = state.inventory.length + '/' + MAX_INVENTORY;
  const grid = $('itemGrid');
  grid.innerHTML = '';
  $('invEmptyHint').classList.toggle('hidden', state.inventory.length > 0);
  state.inventory.forEach(item => {
    const rarity = rarityInfo(item.rarityId);
    const cell = document.createElement('div');
    cell.className = 'item-cell';
    cell.style.borderColor = rarity.color;
    cell.innerHTML = `<div class="item-icon">${item.icon}</div>${item.level > 0 ? `<div class="item-plus">+${item.level}</div>` : ''}`;
    cell.addEventListener('click', () => UI.openItemModal(item.id, false));
    grid.appendChild(cell);
  });
};

UI.openItemModal = function (itemId, isEquipped) {
  modalItemId = itemId;
  const state = window.STATE;
  let item = isEquipped
    ? Object.values(state.equipment).find(i => i && i.id === itemId)
    : state.inventory.find(i => i.id === itemId);
  if (!item) return;
  const rarity = rarityInfo(item.rarityId);
  const stats = itemCurrentStats(item);
  const statLabels = { atk: '⚔️ Ataque', def: '🛡️ Defensa', hp: '❤️ Vida', critChance: '💢 Crítico %', atkSpeed: '⏱️ Vel. ataque' };
  const statsHtml = Object.keys(stats).map(k => `<div class="stat-row"><span>${statLabels[k] || k}</span><span>+${stats[k]}</span></div>`).join('');
  const upgradeCost = itemUpgradeCost(item);
  const sellValue = itemSellValue(item);

  $('itemModalBody').innerHTML = `
    <div class="item-modal-header" style="color:${rarity.color}">
      <span class="item-modal-icon">${item.icon}</span>
      <div>
        <div class="item-modal-name">${item.name}${item.level > 0 ? ' +' + item.level : ''}</div>
        <div class="item-modal-rarity">${rarity.label} · ${SLOT_INFO[item.slot].label}</div>
      </div>
    </div>
    <div class="panel">${statsHtml}</div>
    <div class="modal-actions">
      <button class="primary-btn" id="modalEquipBtn">${isEquipped ? 'Desequipar' : 'Equipar'}</button>
      <button class="primary-btn" id="modalUpgradeBtn">Mejorar (🪙 ${upgradeCost})</button>
      ${isEquipped ? '' : `<button class="danger-btn" id="modalSellBtn">Vender (🪙 ${sellValue})</button>`}
    </div>
  `;
  $('itemModal').classList.remove('hidden');

  $('modalEquipBtn').addEventListener('click', () => {
    if (isEquipped) unequipItem(state, item.slot); else equipItem(state, item.id);
    saveGame(state);
    UI.closeModal();
    UI.renderHero(state); UI.renderInventory(state);
  });
  $('modalUpgradeBtn').addEventListener('click', () => {
    if (upgradeItem(state, item.id)) {
      saveGame(state);
      UI.openItemModal(itemId, isEquipped);
      UI.renderHero(state); UI.renderTopbar(state);
    }
  });
  const sellBtn = $('modalSellBtn');
  if (sellBtn) sellBtn.addEventListener('click', () => {
    sellItem(state, item.id);
    saveGame(state);
    UI.closeModal();
    UI.renderInventory(state); UI.renderTopbar(state);
  });
};

UI.closeModal = function () {
  $('itemModal').classList.add('hidden');
  modalItemId = null;
};

UI.renderSkills = function (state) {
  const list = $('skillList');
  list.innerHTML = '';
  SKILLS.forEach(def => {
    const learned = state.skills[def.id];
    const locked = state.hero.level < def.unlockLevel;
    const maxed = learned.level >= def.maxLevel;
    const card = document.createElement('div');
    card.className = 'panel skill-card' + (locked ? ' locked' : '');
    let effectText = '';
    if (def.power) effectText = `Daño: ${Math.round(def.power(Math.max(learned.level, 1)) * 100)}% ATQ`;
    if (def.buffPct) effectText = `Bono ATQ: +${Math.round(def.buffPct(Math.max(learned.level, 1)) * 100)}% (${def.buffDuration}s)`;
    if (def.healPct) effectText = `Curación: ${Math.round(def.healPct(Math.max(learned.level, 1)) * 100)}% Vida máx.`;

    if (locked) {
      card.innerHTML = `<div class="skill-card-head"><span class="skill-card-emoji">${def.emoji}</span><div><b>${def.name}</b><br><small>${def.desc}</small></div></div><div class="locked-tag">🔒 Se desbloquea en nivel ${def.unlockLevel}</div>`;
    } else {
      const cost = def.cost(learned.level);
      card.innerHTML = `
        <div class="skill-card-head"><span class="skill-card-emoji">${def.emoji}</span><div><b>${def.name}</b> <span class="badge">Nv. ${learned.level}/${def.maxLevel}</span><br><small>${def.desc}</small></div></div>
        <div class="stat-row"><span>Efecto actual</span><span>${learned.level > 0 ? effectText : '—'}</span></div>
        <div class="stat-row"><span>Enfriamiento</span><span>${def.cooldown(learned.level).toFixed(1)}s</span></div>
        ${maxed ? '<button class="primary-btn" disabled>Nivel máximo</button>' : `<button class="primary-btn" id="upg-${def.id}">${learned.level === 0 ? 'Aprender' : 'Mejorar'} (🪙 ${cost})</button>`}
      `;
    }
    list.appendChild(card);
    if (!locked && !maxed) {
      $('upg-' + def.id).addEventListener('click', () => {
        if (upgradeSkill(state, def.id)) { saveGame(state); UI.renderSkills(state); UI.renderTopbar(state); }
      });
    }
  });
};

UI.renderMap = function (state) {
  const list = $('locationList');
  list.innerHTML = '';
  LOCATIONS.forEach(loc => {
    const unlocked = isLocationUnlocked(state, loc.id);
    const isCurrent = state.combat.locationId === loc.id;
    const card = document.createElement('div');
    card.className = 'panel loc-card' + (unlocked ? '' : ' locked') + (isCurrent ? ' current' : '');
    const best = state.progress.bestWave[loc.id] || 0;
    card.innerHTML = `
      <div class="loc-card-head"><span class="loc-card-emoji">${loc.emoji}</span><div><b>${loc.name}</b><br><small>${unlocked ? 'Mejor oleada: ' + best : '🔒 Bloqueado'}</small></div></div>
      ${unlocked ? `<button class="primary-btn" ${isCurrent ? 'disabled' : ''} id="travel-${loc.id}">${isCurrent ? 'Aquí ahora' : 'Viajar'}</button>` : `<div class="locked-tag">Derrota al jefe de la zona anterior</div>`}
    `;
    list.appendChild(card);
    if (unlocked && !isCurrent) {
      $('travel-' + loc.id).addEventListener('click', () => {
        travelToLocation(state, loc.id);
        saveGame(state);
        UI.renderMap(state); UI.renderTopbar(state); UI.renderBattle(state);
      });
    }
  });
};

UI.drainEvents = function (state) {
  while (EVENTS.length) {
    const ev = EVENTS.shift();
    if (ev.type === 'damage') {
      const text = (ev.target === 'hero' ? '-' : '-') + ev.amount + (ev.isCrit ? '!' : '');
      UI.spawnFloatingNumber(text, ev.target === 'hero', ev.isCrit);
    } else if (ev.type === 'levelup') {
      UI.showToast('🎉 ¡Has subido a nivel ' + ev.level + '!');
    } else if (ev.type === 'drop') {
      const rarity = rarityInfo(ev.item.rarityId);
      if (rarity.mult >= 1.8) UI.showToast('🎁 ' + rarity.label + ': ' + ev.item.name);
    } else if (ev.type === 'locationUnlock') {
      UI.showToast('🗺️ ¡Nueva zona desbloqueada: ' + ev.location.name + '!');
    } else if (ev.type === 'herodeath') {
      if (navigator.vibrate) navigator.vibrate(200);
    } else if (ev.type === 'tap') {
      if (navigator.vibrate) navigator.vibrate(15);
    }
  }
};

UI.showOfflineModal = function (summary) {
  const hours = Math.floor(summary.seconds / 3600);
  const mins = Math.floor((summary.seconds % 3600) / 60);
  $('offlineBody').innerHTML = `
    <p>Estuviste fuera ${hours > 0 ? hours + 'h ' : ''}${mins}min.</p>
    <div class="stat-row"><span>💀 Enemigos derrotados</span><span>${summary.kills}</span></div>
    <div class="stat-row"><span>🪙 Oro ganado</span><span>${summary.gold}</span></div>
    <div class="stat-row"><span>⭐ Experiencia</span><span>${summary.xp}</span></div>
  `;
  $('offlineModal').classList.remove('hidden');
};
