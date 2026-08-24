// Estado del juego, persistencia y cálculo de estadísticas derivadas.
const SAVE_KEY = 'dot_texel_save_v1';
const MAX_INVENTORY = 40;
const OFFLINE_CAP_SECONDS = 8 * 3600;

let itemIdCounter = 1;

function xpToNext(level) {
  return Math.floor(50 * Math.pow(level, 1.6));
}

function rollRarity(isBoss) {
  const key = isBoss ? 'weightBoss' : 'weight';
  const total = RARITIES.reduce((s, r) => s + r[key], 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    roll -= r[key];
    if (roll <= 0) return r;
  }
  return RARITIES[0];
}

function generateItem(slot, dropLevel, isBoss) {
  const rarity = rollRarity(isBoss);
  const profile = SLOT_PROFILE[slot];
  const stats = {};
  for (const statKey in profile) {
    const weight = profile[statKey];
    const value = dropLevel * rarity.mult * weight * STAT_FACTOR[statKey];
    stats[statKey] = statKey === 'critChance' || statKey === 'atkSpeed'
      ? Math.round(value * 100) / 100
      : Math.max(1, Math.round(value));
  }
  const rarityIndex = RARITIES.indexOf(rarity);
  const names = SLOT_INFO[slot].names;
  const name = names[Math.min(rarityIndex, names.length - 1)];
  return {
    id: 'it' + (itemIdCounter++) + '_' + Date.now().toString(36),
    slot, name, icon: SLOT_INFO[slot].icon,
    rarityId: rarity.id, level: 0, dropLevel, baseStats: stats,
  };
}

function itemCurrentStats(item) {
  const mult = 1 + item.level * 0.08;
  const out = {};
  for (const k in item.baseStats) {
    const v = item.baseStats[k] * mult;
    out[k] = (k === 'critChance' || k === 'atkSpeed') ? Math.round(v * 100) / 100 : Math.round(v);
  }
  return out;
}

function itemUpgradeCost(item) {
  const rarity = RARITIES.find(r => r.id === item.rarityId);
  return Math.round(20 * Math.pow(item.level + 1, 1.8) * rarity.mult);
}

function itemSellValue(item) {
  const stats = itemCurrentStats(item);
  const sum = Object.values(stats).reduce((a, b) => a + Math.abs(b), 0);
  return Math.max(1, Math.round(sum * 1.4));
}

function rarityInfo(id) {
  return RARITIES.find(r => r.id === id) || RARITIES[0];
}

function createNewState() {
  return {
    version: 1,
    lastSave: Date.now(),
    hero: {
      level: 1, xp: 0, hp: 50,
      str: 0, agi: 0, vit: 0, statPoints: 0,
      gold: 50, gems: 0,
      derived: {},
    },
    equipment: { arma: null, casco: null, pechera: null, guantes: null, botas: null, amuleto: null },
    inventory: [],
    skills: { golpe: { level: 1 }, grito: { level: 0 }, curacion: { level: 0 }, torbellino: { level: 0 } },
    progress: { unlockedLocations: ['bosque'], bestWave: { bosque: 0 } },
    combat: {
      locationId: 'bosque', wave: 1,
      monster: null,
      heroAtkTimer: 0, monsterAtkTimer: 0,
      buff: null,
      respawnTimer: 0,
      skillCooldowns: {},
    },
    stats: { totalKills: 0, totalGoldEarned: 0 },
  };
}

function recalcDerived(state) {
  const h = state.hero;
  let atk = 5 + (h.level - 1) * 1.2 + h.str * 1;
  let def = 2 + (h.level - 1) * 0.4 + h.str * 0.1;
  let maxHp = 50 + (h.level - 1) * 8 + h.vit * 5;
  let critChance = 5 + h.agi * 0.3;
  let atkSpeed = 1.0 + h.agi * 0.02;

  for (const slot of SLOTS) {
    const item = state.equipment[slot];
    if (!item) continue;
    const s = itemCurrentStats(item);
    atk += s.atk || 0;
    def += s.def || 0;
    maxHp += s.hp || 0;
    critChance += s.critChance || 0;
    atkSpeed += s.atkSpeed || 0;
  }

  if (state.combat.buff && state.combat.buff.type === 'atk') {
    atk *= (1 + state.combat.buff.pct);
  }

  h.derived = {
    atk: Math.round(atk * 10) / 10,
    def: Math.round(def * 10) / 10,
    maxHp: Math.round(maxHp),
    critChance: Math.min(75, Math.round(critChance * 10) / 10),
    atkSpeed: Math.round(atkSpeed * 100) / 100,
    critMult: 1.5,
  };
  if (h.hp > h.derived.maxHp) h.hp = h.derived.maxHp;
}

function addXp(state, amount) {
  const h = state.hero;
  h.xp += amount;
  let leveled = false;
  while (h.xp >= xpToNext(h.level)) {
    h.xp -= xpToNext(h.level);
    h.level++;
    h.statPoints++;
    leveled = true;
  }
  if (leveled) {
    recalcDerived(state);
    h.hp = h.derived.maxHp;
  }
  return leveled;
}

function allocateStat(state, stat) {
  const h = state.hero;
  if (h.statPoints <= 0) return false;
  if (!['str', 'agi', 'vit'].includes(stat)) return false;
  h[stat]++;
  h.statPoints--;
  recalcDerived(state);
  return true;
}

function addItemToInventory(state, item) {
  if (state.inventory.length >= MAX_INVENTORY) {
    state.hero.gold += itemSellValue(item);
    return false;
  }
  state.inventory.push(item);
  return true;
}

function equipItem(state, itemId) {
  const idx = state.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return false;
  const item = state.inventory[idx];
  const current = state.equipment[item.slot];
  state.inventory.splice(idx, 1);
  state.equipment[item.slot] = item;
  if (current) state.inventory.push(current);
  recalcDerived(state);
  return true;
}

function unequipItem(state, slot) {
  const item = state.equipment[slot];
  if (!item) return false;
  if (state.inventory.length >= MAX_INVENTORY) return false;
  state.equipment[slot] = null;
  state.inventory.push(item);
  recalcDerived(state);
  return true;
}

function sellItem(state, itemId) {
  const idx = state.inventory.findIndex(i => i.id === itemId);
  if (idx === -1) return false;
  const item = state.inventory[idx];
  state.hero.gold += itemSellValue(item);
  state.inventory.splice(idx, 1);
  return true;
}

function upgradeItem(state, itemId) {
  let item = state.inventory.find(i => i.id === itemId);
  let equipped = false;
  if (!item) {
    for (const slot of SLOTS) {
      if (state.equipment[slot] && state.equipment[slot].id === itemId) {
        item = state.equipment[slot];
        equipped = true;
        break;
      }
    }
  }
  if (!item) return false;
  const cost = itemUpgradeCost(item);
  if (state.hero.gold < cost) return false;
  state.hero.gold -= cost;
  item.level++;
  if (equipped) recalcDerived(state);
  return true;
}

function locationById(id) {
  return LOCATIONS.find(l => l.id === id);
}

function isLocationUnlocked(state, locId) {
  return state.progress.unlockedLocations.includes(locId);
}

function saveGame(state) {
  state.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) { /* almacenamiento lleno o no disponible */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || !state.hero) return null;
    return state;
  } catch (e) {
    return null;
  }
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// Estimación simplificada de progreso offline: no simula oleada a oleada,
// calcula un ritmo medio de muertes/min según el DPS del héroe en su localización actual.
function computeOfflineProgress(state) {
  const now = Date.now();
  let elapsed = Math.floor((now - state.lastSave) / 1000);
  if (elapsed < 60) return null;
  elapsed = Math.min(elapsed, OFFLINE_CAP_SECONDS);

  const loc = locationById(state.combat.locationId);
  const wave = state.combat.wave;
  const monsterHp = loc.base.hp * Math.pow(WAVE_GROWTH, wave - 1);
  const monsterGold = loc.base.gold * Math.pow(WAVE_GROWTH, wave - 1);
  const monsterXp = loc.base.xp * Math.pow(WAVE_GROWTH, wave - 1);

  const dps = state.hero.derived.atk * state.hero.derived.atkSpeed * 0.8;
  const timePerKill = Math.max(1.5, monsterHp / Math.max(1, dps));
  const kills = Math.floor(elapsed / timePerKill);

  const goldGain = Math.round(kills * monsterGold);
  const xpGain = Math.round(kills * monsterXp);

  state.hero.gold += goldGain;
  const leveled = addXp(state, xpGain);
  state.stats.totalKills += kills;
  state.stats.totalGoldEarned += goldGain;

  return { seconds: elapsed, kills, gold: goldGain, xp: xpGain, leveled };
}
