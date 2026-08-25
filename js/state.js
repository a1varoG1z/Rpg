// Estado del jugador: roster de luchadores, banda, monedas, energía, invocación,
// fusión/evolución, equipo y persistencia.
const SAVE_KEY = 'dot_texel_save_v2';
const MAX_ROSTER = 60;
const MAX_GEAR = 60;

let uidCounter = 1;
function newUid(prefix) { return prefix + (uidCounter++) + '_' + Date.now().toString(36); }

function createNewState() {
  const roster = [
    { uid: newUid('f'), defId: 'topo_comun', level: 1, xp: 0, sef: 0, stars: 0, gearArma: null, gearArmadura: null },
    { uid: newUid('f'), defId: 'heraldo_comun', level: 1, xp: 0, sef: 0, stars: 0, gearArma: null, gearArmadura: null },
    { uid: newUid('f'), defId: 'triton_infrecuente', level: 1, xp: 0, sef: 0, stars: 0, gearArma: null, gearArmadura: null },
  ];
  const band = [
    [roster[0].uid, roster[1].uid, roster[2].uid],
    [null, null, null],
    [null, null, null],
  ];
  const progress = { unlockedZones: ['bosque'], zoneStage: {} };
  ZONES.forEach(z => { progress.zoneStage[z.id] = -1; });
  return {
    version: 2,
    lastSave: Date.now(),
    currencies: { texel: 400, gemas: 20, pixite: 5, voxite: 1, doxite: 0, energy: MAX_ENERGY, energyFrac: 0 },
    roster, gearInventory: [], band, progress,
    arena: { rank: 1, bestRank: 1 },
    stats: { battlesWon: 0, battlesLost: 0 },
    settings: { infiniteEnergy: false },
  };
}

function rosterEntry(state, uid) { return state.roster.find(r => r.uid === uid); }
function gearItem(state, uid) { return state.gearInventory.find(g => g.uid === uid); }

function levelGrowth(level) { return 1 + (level - 1) * 0.10; }
function starBonus(stars) { return 1 + stars * 0.08; }

function fighterStats(state, entry) {
  const def = fighterDef(entry.defId);
  const w = CLASS_INFO[def.class].weights;
  const mult = rarityInfo(def.rarity).mult * levelGrowth(entry.level) * starBonus(entry.stars);
  const stats = {
    hp: Math.round(w.hp * mult),
    atk: Math.round(w.atk * mult),
    def: Math.round(w.def * mult),
    agi: Math.round(w.agi * mult),
    wis: Math.round(w.wis * mult),
  };
  const arma = entry.gearArma && gearItem(state, entry.gearArma);
  const armadura = entry.gearArmadura && gearItem(state, entry.gearArmadura);
  if (arma) { stats.atk += gearStatValue(arma); stats.wis += Math.round(gearStatValue(arma) * 0.4); }
  if (armadura) { stats.def += gearStatValue(armadura); stats.hp += Math.round(gearStatValue(armadura) * 2.4); }
  return stats;
}

function gearStatValue(gear) {
  const base = { comun: 4, infrecuente: 7, raro: 12, epico: 20, legendario: 32 }[gear.rarity];
  return Math.round(base * (1 + gear.level * 0.15));
}

function gearUpgradeCost(gear) {
  const rarity = rarityInfo(gear.rarity);
  return Math.round(30 * Math.pow(gear.level + 1, 1.7) * rarity.mult);
}

function upgradeGear(state, gearUid) {
  const gear = gearItem(state, gearUid);
  if (!gear) return false;
  const cost = gearUpgradeCost(gear);
  if (state.currencies.texel < cost) return false;
  state.currencies.texel -= cost;
  gear.level++;
  return true;
}

function sellGear(state, gearUid) {
  const gear = gearItem(state, gearUid);
  if (!gear) return false;
  if (equippedGearOwner(state, gearUid)) return false;
  state.currencies.texel += gearStatValue(gear) * 2;
  state.gearInventory = state.gearInventory.filter(g => g.uid !== gearUid);
  return true;
}

function generateGear(slot, rarity) {
  return { uid: newUid('g'), slot, rarity, level: 0 };
}

function addGear(state, gear) {
  if (state.gearInventory.length >= MAX_GEAR) return false;
  state.gearInventory.push(gear);
  return true;
}

// El equipo (state.gearInventory) contiene TODAS las piezas que posee el jugador,
// estén o no equipadas; los luchadores solo guardan una referencia (uid) a la pieza.
function equippedGearOwner(state, gearUid) {
  return state.roster.find(r => r.gearArma === gearUid || r.gearArmadura === gearUid);
}

function equipGear(state, fighterUid, gearUid) {
  const entry = rosterEntry(state, fighterUid);
  const gear = gearItem(state, gearUid);
  if (!entry || !gear) return false;
  const owner = equippedGearOwner(state, gearUid);
  if (owner) { if (owner.gearArma === gearUid) owner.gearArma = null; if (owner.gearArmadura === gearUid) owner.gearArmadura = null; }
  const slotKey = gear.slot === 'arma' ? 'gearArma' : 'gearArmadura';
  entry[slotKey] = gearUid;
  return true;
}

function unequipGear(state, fighterUid, slot) {
  const entry = rosterEntry(state, fighterUid);
  if (!entry) return false;
  const slotKey = slot === 'arma' ? 'gearArma' : 'gearArmadura';
  if (!entry[slotKey]) return false;
  entry[slotKey] = null;
  return true;
}

// --- Experiencia y nivel ---
function fighterAddXp(entry, amount) {
  let leveled = false;
  entry.xp += amount;
  while (entry.level < XP_LEVEL_CAP && entry.xp >= fighterXpToNext(entry.level)) {
    entry.xp -= fighterXpToNext(entry.level);
    entry.level++;
    leveled = true;
  }
  if (entry.level >= XP_LEVEL_CAP) entry.xp = 0;
  return leveled;
}

// --- Invocación (gacha) ---
function rollCrystalRarity(crystalType) {
  const rates = CRYSTALS[crystalType].rates;
  let roll = Math.random();
  for (const r of RARITIES) {
    const p = rates[r.id] || 0;
    if (roll < p) return r.id;
    roll -= p;
  }
  return 'comun';
}

function summonOne(state, crystalType) {
  if (state.currencies[crystalType] <= 0) return null;
  state.currencies[crystalType]--;
  const rarity = rollCrystalRarity(crystalType);
  const pool = FIGHTERS.filter(f => f.rarity === rarity);
  const def = pool[Math.floor(Math.random() * pool.length)];
  return applySummonResult(state, def.id);
}

function applySummonResult(state, defId) {
  const def = fighterDef(defId);
  let entry = state.roster.find(r => r.defId === defId);
  if (!entry) {
    if (state.roster.length >= MAX_ROSTER) {
      state.currencies.texel += 50;
      return { defId, outcome: 'inventario_lleno' };
    }
    entry = { uid: newUid('f'), defId, level: 1, xp: 0, sef: 0, stars: 0, gearArma: null, gearArmadura: null };
    state.roster.push(entry);
    return { defId, outcome: 'nuevo', uid: entry.uid };
  }
  if (entry.sef >= 5 && !def.evolvesTo) {
    state.currencies.texel += 40 * rarityInfo(def.rarity).mult;
    return { defId, outcome: 'duplicado_max', uid: entry.uid };
  }
  entry.sef = Math.min(5, entry.sef + 1);
  if (entry.sef >= 5 && def.evolvesTo) {
    entry.defId = def.evolvesTo;
    entry.sef = 0;
    return { defId: def.evolvesTo, outcome: 'evolucion', uid: entry.uid, fromId: defId };
  }
  return { defId, outcome: 'duplicado', uid: entry.uid, sef: entry.sef };
}

// --- Fusión y superfusión ---
function superFuse(state, targetUid, sacrificeUid) {
  if (targetUid === sacrificeUid) return false;
  const target = rosterEntry(state, targetUid);
  const sac = rosterEntry(state, sacrificeUid);
  if (!target || !sac) return false;
  if (sac.sef < 5) return false;
  if (target.stars >= 3) return false;
  target.stars++;
  removeFromRoster(state, sacrificeUid);
  return true;
}

function removeFromRoster(state, uid) {
  state.roster = state.roster.filter(r => r.uid !== uid);
  state.band = state.band.map(row => row.map(c => c === uid ? null : c));
}

// --- Formación de banda ---
function setBandSlot(state, row, col, uid) {
  if (uid) {
    for (let r = 0; r < BAND_ROWS; r++) for (let c = 0; c < BAND_COLS; c++) {
      if (state.band[r][c] === uid) state.band[r][c] = null;
    }
  }
  state.band[row][col] = uid;
}

function bandFighterCount(state) {
  return state.band.flat().filter(Boolean).length;
}

// --- Progreso de zonas ---
function highestClearedStage(state, zoneId) {
  const v = state.progress.zoneStage[zoneId];
  return v === undefined ? -1 : v;
}
function isZoneUnlocked(state, zoneId) { return state.progress.unlockedZones.includes(zoneId); }
function isStageUnlocked(state, zoneId, stageIdx) {
  if (!isZoneUnlocked(state, zoneId)) return false;
  return stageIdx <= highestClearedStage(state, zoneId) + 1;
}
function recordStageClear(state, zoneIdx, stageIdx) {
  const zone = ZONES[zoneIdx];
  if (stageIdx > highestClearedStage(state, zone.id)) state.progress.zoneStage[zone.id] = stageIdx;
  if (stageIdx === STAGES_PER_ZONE - 1) {
    const next = ZONES[zoneIdx + 1];
    if (next && !isZoneUnlocked(state, next.id)) { state.progress.unlockedZones.push(next.id); return next; }
  }
  return null;
}

// --- Energía ---
function tickEnergy(state, dtSeconds) {
  if (state.currencies.energy >= MAX_ENERGY) { state.currencies.energyFrac = 0; return; }
  state.currencies.energyFrac += dtSeconds / ENERGY_REGEN_SECONDS;
  while (state.currencies.energyFrac >= 1 && state.currencies.energy < MAX_ENERGY) {
    state.currencies.energyFrac -= 1;
    state.currencies.energy++;
  }
}

function computeOfflineEnergy(state) {
  const elapsed = Math.floor((Date.now() - state.lastSave) / 1000);
  if (elapsed < 30) return 0;
  const before = state.currencies.energy;
  tickEnergy(state, Math.min(elapsed, ENERGY_REGEN_SECONDS * MAX_ENERGY));
  return state.currencies.energy - before;
}

// --- Persistencia ---
function saveGame(state) {
  state.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* almacenamiento no disponible */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || state.version !== 2 || !state.roster) return null;
    if (!state.settings) state.settings = { infiniteEnergy: false };
    return state;
  } catch (e) { return null; }
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
