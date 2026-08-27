// Estado del jugador: roster de luchadores, banda, monedas, energía, invocación,
// fusión/evolución, equipo y persistencia.
const SAVE_KEY = 'dot_texel_save_v2';
const MAX_GEAR = 60;

let uidCounter = 1;
function newUid(prefix) { return prefix + (uidCounter++) + '_' + Date.now().toString(36); }

// Un hueco vacío por cada tipo de equipo existente (ver GEAR_SLOTS).
function emptyGearSet() {
  const gear = {};
  GEAR_SLOT_IDS.forEach(slot => { gear[slot] = null; });
  return gear;
}

function createNewState() {
  const roster = [
    { uid: newUid('f'), defId: 'topo_comun', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet() },
    { uid: newUid('f'), defId: 'heraldo_comun', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet() },
    { uid: newUid('f'), defId: 'triton_infrecuente', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet() },
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
    settings: { infiniteEnergy: false, showMedallion: true },
    // Objetos consumibles comprados en la Tienda (pociones, plumas fénix).
    items: { pocion_menor: 0, pocion_mayor: 0, pluma_fenix: 0 },
    // Homúnculos conseguidos por invocación: solo cuentan (no tienen uid
    // propio ni entran en el roster/Formación, no luchan nunca).
    homunculos: { homunculo_t1: 0, homunculo_t2: 0, homunculo_t3: 0 },
    // Registro permanente de todo defId obtenido alguna vez (para el
    // distintivo "¡Nuevo!" y la futura Pokédex) — a diferencia de mirar el
    // roster actual, esto no "olvida" un luchador si se vendiera/evolucionara
    // y ya no quedara ninguna copia suelta con ese defId exacto.
    discoveredDefIds: [roster[0].defId, roster[1].defId, roster[2].defId],
  };
}

function rosterEntry(state, uid) { return state.roster.find(r => r.uid === uid); }
function gearItem(state, uid) { return state.gearInventory.find(g => g.uid === uid); }

// --- Líneas de combate (Formación 3×3) ---
// Devuelve los uid de los luchadores colocados en una línea (fila, columna o
// diagonal) de la Formación. Ya no hay "combinaciones" preelegidas: en
// combate se puede elegir cualquiera de las 8 líneas posibles cada choque
// (ver buildPlayerCombinations en combat.js).
function combinationFighterUids(state, lineId) {
  const line = bandLineInfo(lineId);
  return line.cells.map(([r, c]) => state.band[r][c]).filter(Boolean);
}

function levelGrowth(level) { return 1 + (level - 1) * 0.10; }
function starBonus(stars) { return 1 + stars * 0.08; }

// Suma de todo lo que aporta el equipo puesto (6 huecos, ver GEAR_SLOTS) a
// cada estadística — cada pieza reparte su valor entre una stat principal y
// una secundaria más floja.
function gearBonusForEntry(state, entry) {
  const bonus = { hp: 0, atk: 0, def: 0, agi: 0, wis: 0 };
  GEAR_SLOT_IDS.forEach(slotKey => {
    const gearUid = entry.gear[slotKey];
    const g = gearUid && gearItem(state, gearUid);
    if (!g) return;
    const slot = GEAR_SLOTS[slotKey];
    const val = gearStatValue(g);
    bonus[slot.primary] += Math.round(val * slot.primaryMult);
    if (slot.secondary) bonus[slot.secondary] += Math.round(val * slot.secondaryMult);
  });
  return bonus;
}

function fighterStats(state, entry) {
  const def = fighterDef(entry.defId);
  const w = CLASS_INFO[def.class].weights;
  const mult = rarityInfo(def.rarity).mult * levelGrowth(entry.level) * starBonus(entry.stars);
  const stats = {
    hp: Math.round(w.hp * mult * statVarianceMult(def.family, 'hp')),
    atk: Math.round(w.atk * mult * statVarianceMult(def.family, 'atk')),
    def: Math.round(w.def * mult * statVarianceMult(def.family, 'def')),
    agi: Math.round(w.agi * mult * statVarianceMult(def.family, 'agi')),
    wis: Math.round(w.wis * mult * statVarianceMult(def.family, 'wis')),
  };
  const bonus = gearBonusForEntry(state, entry);
  Object.keys(bonus).forEach(k => { stats[k] += bonus[k]; });
  return stats;
}

// Igual que fighterStats, pero separa qué parte de cada estadística viene
// del equipo (6 huecos) para poder destacarla en otro color en la UI.
function fighterStatsBreakdown(state, entry) {
  const total = fighterStats(state, entry);
  const bonus = gearBonusForEntry(state, entry);
  return { total, bonus };
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

// --- Tienda ---
function buyShopGear(state, slot, rarity) {
  const price = GEAR_SHOP_PRICES[rarity];
  if (state.currencies.texel < price) return false;
  if (state.gearInventory.length >= MAX_GEAR) return false;
  state.currencies.texel -= price;
  addGear(state, generateGear(slot, rarity));
  return true;
}

function buyConsumable(state, itemId) {
  const item = CONSUMABLES[itemId];
  if (state.currencies[item.currency] < item.price) return false;
  state.currencies[item.currency] -= item.price;
  state.items[itemId] = (state.items[itemId] || 0) + 1;
  return true;
}

// El equipo (state.gearInventory) contiene TODAS las piezas que posee el jugador,
// estén o no equipadas; los luchadores solo guardan una referencia (uid) a la pieza.
function equippedGearOwner(state, gearUid) {
  return state.roster.find(r => GEAR_SLOT_IDS.some(slot => r.gear[slot] === gearUid));
}

function equipGear(state, fighterUid, gearUid) {
  const entry = rosterEntry(state, fighterUid);
  const gear = gearItem(state, gearUid);
  if (!entry || !gear || !GEAR_SLOTS[gear.slot]) return false;
  const owner = equippedGearOwner(state, gearUid);
  if (owner) { GEAR_SLOT_IDS.forEach(slot => { if (owner.gear[slot] === gearUid) owner.gear[slot] = null; }); }
  entry.gear[gear.slot] = gearUid;
  return true;
}

function unequipGear(state, fighterUid, slot) {
  const entry = rosterEntry(state, fighterUid);
  if (!entry || !entry.gear[slot]) return false;
  entry.gear[slot] = null;
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
  // Cada invocación puede "tocar" un Homúnculo en vez de un luchador — su
  // tier sale de la misma tirada de rareza, así que un cristal que da más
  // rarezas altas también da homúnculos de mejor tier de media.
  if (Math.random() < HOMUNCULO_SUMMON_CHANCE) {
    return applyHomunculoResult(state, homunculoTierForRarity(rarity));
  }
  const pool = FIGHTERS.filter(f => f.rarity === rarity);
  const def = pool[Math.floor(Math.random() * pool.length)];
  return applySummonResult(state, def.id);
}

function applyHomunculoResult(state, tier) {
  const id = 'homunculo_t' + tier;
  state.homunculos[id] = (state.homunculos[id] || 0) + 1;
  return { defId: id, outcome: 'homunculo' };
}

// Fusiona un Homúnculo con un luchador jugable para darle experiencia
// directamente (no lucha nunca, solo sirve para esto). Devuelve si subió de
// nivel, o null si no había homúnculos de ese tipo o el luchador no existe.
function useHomunculo(state, targetUid, homunculoId) {
  const entry = rosterEntry(state, targetUid);
  const hom = homunculoDef(homunculoId);
  if (!entry || !hom || (state.homunculos[homunculoId] || 0) <= 0) return null;
  state.homunculos[homunculoId]--;
  return fighterAddXp(entry, hom.xpValue);
}

// Cada copia invocada se guarda por separado en el roster (uid propio, SEF 0):
// ya no se fusiona sola al invocar un duplicado. El jugador decide más tarde,
// desde la ficha del luchador, cuáles de esas copias usar como material de
// fusión (ver fuseMaterials). Si el luchador ya está en su forma máxima (sin
// evolvesTo), un duplicado no sirve de nada y se convierte en Texel al momento,
// igual que si el roster está lleno.
function applySummonResult(state, defId) {
  const def = fighterDef(defId);
  if (!state.discoveredDefIds) state.discoveredDefIds = [];
  const everDiscovered = state.discoveredDefIds.includes(defId);
  if (!everDiscovered) state.discoveredDefIds.push(defId);
  // Los duplicados (incluidos los de forma máxima, que ya no pueden
  // evolucionar) se quedan en la Colección como copias sueltas: sirven de
  // material para Superfusión (ver fuseMaterials/superFuse) o se pueden
  // vender manualmente por Texel — nunca se convierten solos.
  const entry = { uid: newUid('f'), defId, level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet(), isNew: !everDiscovered, readyToEvolve: false };
  state.roster.push(entry);
  return { defId, outcome: everDiscovered ? 'duplicado' : 'nuevo', uid: entry.uid };
}

// Fusión manual: consume copias sueltas del roster (mismas defId que el
// objetivo) para llenar su barra de SEF, hasta 5/5. Cada copia usada como
// material se elimina del roster (y de la Formación, si estaba colocada).
// Un luchador en forma máxima (sin evolvesTo) también puede llenar su SEF —
// no evoluciona a nada, pero llegar a 5/5 es justo lo que lo habilita como
// sacrificio válido para Superfusión (ver superFuse). Devuelve cuántas
// copias se han consumido de verdad.
function fuseMaterials(state, targetUid, materialUids) {
  const target = rosterEntry(state, targetUid);
  const def = target && fighterDef(target.defId);
  if (!target || !def) return 0;
  let used = 0;
  materialUids.forEach(matUid => {
    if (target.sef >= 5) return;
    if (matUid === targetUid) return;
    const mat = rosterEntry(state, matUid);
    if (!mat || mat.defId !== target.defId) return;
    removeFromRoster(state, matUid);
    target.sef = Math.min(5, target.sef + 1);
    used++;
  });
  if (target.sef >= 5 && def.evolvesTo) target.readyToEvolve = true;
  return used;
}

// Dispara manualmente la evolución de un luchador con SEF 5/5. Devuelve el
// nuevo defId si evolucionó, o null si no cumplía las condiciones.
function evolveFighter(state, uid) {
  const entry = rosterEntry(state, uid);
  if (!entry) return null;
  const def = fighterDef(entry.defId);
  if (entry.sef < 5 || !def.evolvesTo) return null;
  entry.defId = def.evolvesTo;
  entry.sef = 0;
  entry.readyToEvolve = false;
  entry.isNew = true;
  return entry.defId;
}

// --- Venta manual de luchadores ---
// Cuánto Texel da vender un luchador del roster — sube con la rareza y con
// las estrellas de Superfusión que ya tenga invertidas (representan copias
// ya consumidas, así que el valor de venta las reconoce en vez de tirarlas).
function fighterSellValue(entry) {
  const def = fighterDef(entry.defId);
  return Math.round(40 * rarityInfo(def.rarity).mult * (1 + entry.stars * 0.15));
}

function sellFighter(state, uid) {
  const entry = rosterEntry(state, uid);
  if (!entry) return 0;
  const value = fighterSellValue(entry);
  removeFromRoster(state, uid);
  state.currencies.texel += value;
  return value;
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

// Habilidad de líder de banda: solo está activa si el luchador que la tiene
// ocupa la celda central [1][1] de la Formación. Devuelve el LEADER_SKILLS
// correspondiente (o null si no hay líder activo), para aplicarlo a TODA
// la banda al construir las unidades de combate (ver makePlayerUnit).
function activeLeaderSkill(state) {
  const centerUid = state.band[1][1];
  if (!centerUid) return null;
  const entry = rosterEntry(state, centerUid);
  if (!entry) return null;
  const def = fighterDef(entry.defId);
  if (!def || !def.leaderSkillId) return null;
  return Object.assign({ leaderName: def.name }, LEADER_SKILLS[def.leaderSkillId]);
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
    if (!state.settings) state.settings = { infiniteEnergy: false, showMedallion: true };
    if (state.settings.showMedallion === undefined) state.settings.showMedallion = true;
    if (!state.items) state.items = { pocion_menor: 0, pocion_mayor: 0, pluma_fenix: 0 };
    if (!state.homunculos) state.homunculos = { homunculo_t1: 0, homunculo_t2: 0, homunculo_t3: 0 };
    // Partidas guardadas antes de que existiera este registro: se
    // reconstruye a partir de lo que haya ahora mismo en el roster (no es
    // perfecto — no recuerda luchadores vendidos/evolucionados antes de
    // esta versión — pero es lo mejor que se puede inferir retroactivamente).
    if (!state.discoveredDefIds) state.discoveredDefIds = [...new Set(state.roster.map(r => r.defId))];
    // Migración de equipo: antes cada luchador guardaba el arma/armadura en
    // dos campos sueltos (gearArma/gearArmadura); ahora todo vive en un
    // único entry.gear{} con un hueco por cada tipo de equipo (6 ahora,
    // pueden ser más en el futuro) — se preservan las piezas ya equipadas.
    state.roster.forEach(entry => {
      if (!entry.gear) {
        entry.gear = emptyGearSet();
        entry.gear.arma = entry.gearArma || null;
        entry.gear.armadura = entry.gearArmadura || null;
        delete entry.gearArma;
        delete entry.gearArmadura;
      } else {
        GEAR_SLOT_IDS.forEach(slot => { if (!(slot in entry.gear)) entry.gear[slot] = null; });
      }
    });
    return state;
  } catch (e) { return null; }
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}
