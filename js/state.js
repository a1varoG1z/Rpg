// Estado del jugador: roster de luchadores, banda, monedas, energía, invocación,
// fusión/evolución, equipo y persistencia.
const SAVE_KEY = 'dot_texel_save_v2';

let uidCounter = 1;
function newUid(prefix) { return prefix + (uidCounter++) + '_' + Date.now().toString(36); }

// Un hueco vacío por cada tipo de equipo existente (ver GEAR_SLOTS).
function emptyGearSet() {
  const gear = {};
  GEAR_SLOT_IDS.forEach(slot => { gear[slot] = null; });
  return gear;
}

// Estadísticas de combate acumuladas POR LUCHADOR (a diferencia de
// state.stats, que es el total de toda la partida) — sobreviven a la
// Fusión/Evolución porque viven en el mismo roster entry (mismo uid) que
// solo cambia de defId, nunca se recrea. Se acumulan en UI.endBattle
// (ui.js), el mismo punto único por el que pasa cualquier combate.
function newFighterStats() {
  return { battles: 0, dmgDealt: 0, dmgReceived: 0, healDone: 0, kills: 0, highestHit: 0 };
}

function createNewState() {
  const roster = [
    { uid: newUid('f'), defId: 'topo_comun', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet(), stats: newFighterStats() },
    { uid: newUid('f'), defId: 'heraldo_comun', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet(), stats: newFighterStats() },
    { uid: newUid('f'), defId: 'triton_infrecuente', level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet(), stats: newFighterStats() },
  ];
  const band = [
    [roster[0].uid, roster[1].uid, roster[2].uid],
    [null, null, null],
    [null, null, null],
  ];
  const progress = { unlockedZones: ['bosque'], zoneStage: {}, daysPlayed: [] };
  ZONES.forEach(z => { progress.zoneStage[z.id] = -1; });
  return {
    version: 2,
    lastSave: Date.now(),
    currencies: { texel: 400, gemas: 20, pixite: 5, voxite: 1, doxite: 0, energy: MAX_ENERGY, energyFrac: 0 },
    roster, gearInventory: [], band, progress,
    // seasonKey/seasonPeakRank: ver checkArenaSeasonReset más abajo. rank
    // sirve de arranque también para el pico de la primera temporada.
    // scoutedChampionLeagueId: id de ARENA_LEAGUES si el rival ya
    // explorado (scouted) es el campeón fijo de esa liga, null si es un
    // rival aleatorio normal (ver arenaChampionForRank en data.js).
    arena: { rank: 1, bestRank: 1, seasonKey: arenaSeasonKey(), seasonPeakRank: 1, scoutedChampionLeagueId: null },
    // Estadísticas históricas de toda la partida — se acumulan en
    // UI.endBattle, el único punto por el que pasa TODO combate (etapa,
    // Torre, Mazmorra Elemental, Arena, Prueba del Campeón, Duelo por
    // apuesta), así que cuentan de verdad todo lo jugado sin importar el modo.
    stats: {
      battlesWon: 0, battlesLost: 0,
      totalDmgDealt: 0, totalDmgReceived: 0, totalHealDone: 0,
      totalTexelEarned: 0, totalFighterXpEarned: 0, highestSingleHit: 0,
      crystalsConverted: 0,
      // Contadores DE POR VIDA (nunca bajan, a diferencia de finalFormCount/
      // totalSefStars en objectivesSummary, que son una foto del estado
      // actual del roster) — totalFusionsMade cuenta copias consumidas como
      // material (fuseMaterials), totalEvolutions cuenta evoluciones
      // completadas (evolveFighter), para poder dar Logros por la ACCIÓN de
      // fusionar/evolucionar en sí, no solo por lo que se tenga ahora mismo.
      totalFusionsMade: 0, totalEvolutions: 0,
    },
    settings: { infiniteEnergy: false, showMedallion: true, enableTorreBatalla: false, enableElementalDungeon: false, enableRoguelike: false },
    // Torre Batalla: cuántas veces se ha superado cada nivel (clave =
    // level.key de TORRE_LEVELS en data.js) — 0/ausente = nivel no
    // superado todavía (y por tanto el siguiente sigue bloqueado).
    torre: { clears: {} },
    // Tope de Tier: cuántas veces se ha superado cada nivel (clave =
    // level.id de TIER_CAP_LEVELS en data.js), igual que torre.clears.
    // familyTrialClears: lo mismo pero para la Fase 2 (clave = trial.id de
    // FAMILY_TRIALS) — objeto aparte porque son dos escaleras
    // independientes (una secuencial, la otra no).
    tierCap: { clears: {}, familyTrialClears: {} },
    // Mazmorra Elemental: equipo de hasta 3 uids elegido para cada
    // elemento (se recuerda entre visitas, editable en cualquier momento)
    // y cuántas veces se ha superado cada una.
    elementalTeams: { fuego: [], viento: [], tierra: [], rayo: [], agua: [] },
    elementalClears: { fuego: 0, viento: 0, tierra: 0, rayo: 0, agua: 0 },
    // Prueba del Campeón: luchador elegido para los duelos 1 contra 1 y la
    // mejor racha (duelos ganados seguidos) conseguida hasta ahora.
    champion: { selectedUid: null, bestStreak: 0 },
    // Roguelike: mejor ronda alcanzada (una "run" en sí — window.__roguelikeRun,
    // ver ui.js — vive solo en memoria, como window.__championRun, así que no
    // sobrevive a un recargo de página; solo se guarda el récord).
    roguelike: { bestRound: 0 },
    // Mercader Itinerante: la clave (fecha) de la última oferta ya
    // canjeada, para no poder repetirla hasta que cambie la oferta del día.
    merchant: { lastRedeemedKey: null },
    // Objetivos (ver OBJECTIVES en data.js) ya reclamados — lista de ids,
    // para no poder cobrar dos veces la misma recompensa de Gemas aunque
    // el progreso que lo desbloqueó (p.ej. nº de luchadores) siga vigente.
    objectivesClaimed: [],
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
    // Formaciones guardadas: hasta poder alternar entre varias sin tener
    // que rehacerlas a mano cada vez — cada una es una copia independiente
    // de state.band en el momento de guardarla (ver saveFormationPreset).
    formationPresets: [],
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

// "Poder" de un conjunto de stats {hp,atk,def,agi,wis}, ponderado en vez de
// sumado a pelo — de lo contrario cualquier comparación de poder favorece
// SIEMPRE a las clases con más HP base (Campeón) sobre las de más
// ATK/WIS (Brujo/Gurú), porque el HP es la stat con la escala numérica más
// grande con diferencia, no porque de verdad pegue/aguante más en combate.
// Mismos pesos que ya usaba bossAdaptiveMult para medir la banda del
// jugador contra el rival de referencia — reutilizados aquí como fórmula
// única de "poder" para toda la partida (también en el orden de la
// Colección, ver sortRosterEntries en ui.js).
function fighterPowerScore(stats) {
  return stats.hp * 0.3 + stats.atk + stats.def + stats.agi * 0.5 + stats.wis * 0.5;
}

// Suma de todo lo que aporta el equipo puesto (6 huecos, ver GEAR_SLOTS) a
// cada estadística — cada pieza reparte su valor entre una stat principal y
// una secundaria más floja.
function gearBonusForEntry(state, entry) {
  const bonus = { hp: 0, atk: 0, def: 0, agi: 0, wis: 0 };
  GEAR_SLOT_IDS.forEach(slotKey => {
    const gearUid = entry.gear[slotKey];
    const g = gearUid && gearItem(state, gearUid);
    if (!g) return;
    const t = gearTypeInfo(g);
    const val = gearStatValue(g);
    bonus[t.primary] += Math.round(val * t.primaryMult);
    if (t.secondary) bonus[t.secondary] += Math.round(val * t.secondaryMult);
  });
  return bonus;
}

function fighterStats(state, entry) {
  const def = fighterDef(entry.defId);
  const w = CLASS_INFO[def.class].weights;
  const mult = rarityInfo(def.rarity).mult * levelGrowth(entry.level) * starBonus(entry.stars);
  const stats = {
    hp: Math.round(w.hp * mult * statVarianceMult(def.family, 'hp') * fighterStatMult(def, 'hp')),
    atk: Math.round(w.atk * mult * statVarianceMult(def.family, 'atk') * fighterStatMult(def, 'atk')),
    def: Math.round(w.def * mult * statVarianceMult(def.family, 'def') * fighterStatMult(def, 'def')),
    agi: Math.round(w.agi * mult * statVarianceMult(def.family, 'agi') * fighterStatMult(def, 'agi')),
    wis: Math.round(w.wis * mult * statVarianceMult(def.family, 'wis') * fighterStatMult(def, 'wis')),
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

// Vende de un tirón TODO el equipo sin usar (mismo precio que sellGear,
// ×2 gearStatValue) — la Selección múltiple ya cubre elegir piezas
// concretas una a una, esto es para vaciar de golpe el sobrante de bajo
// tier que se acumula farmeando (ver el filtro "Solo sin usar" de
// Equipo). Nunca toca una pieza puesta, igual que sellGear. Devuelve
// cuántas piezas se han vendido y el Texel total ganado.
function sellAllUnequippedGear(state) {
  const uids = state.gearInventory.filter(g => !equippedGearOwner(state, g.uid)).map(g => g.uid);
  let totalValue = 0;
  uids.forEach(uid => {
    const gear = gearItem(state, uid);
    totalValue += gearStatValue(gear) * 2;
  });
  uids.forEach(uid => sellGear(state, uid));
  return { count: uids.length, totalValue };
}

function generateGear(slot, rarity, type) {
  return { uid: newUid('g'), slot, type: type || randomGearType(slot), rarity, level: 0 };
}

function addGear(state, gear) {
  state.gearInventory.push(gear);
  return true;
}

// --- Tienda ---
// Devuelve la pieza creada (para que la UI pueda mostrar su tipo/nombre
// concretos en el toast) o null si no se pudo comprar.
function buyShopGear(state, slot, rarity) {
  const price = GEAR_SHOP_PRICES[rarity];
  if (state.currencies.texel < price) return null;
  state.currencies.texel -= price;
  const gear = generateGear(slot, rarity);
  addGear(state, gear);
  return gear;
}

function buyConsumable(state, itemId) {
  const item = CONSUMABLES[itemId];
  if (state.currencies[item.currency] < item.price) return false;
  state.currencies[item.currency] -= item.price;
  state.items[itemId] = (state.items[itemId] || 0) + 1;
  return true;
}

// Ver GEMAS_TEXEL_OFFERS en data.js — comprar Gemas con Texel, repetible.
function buyGemasWithTexel(state, offer) {
  if (state.currencies.texel < offer.price) return false;
  state.currencies.texel -= offer.price;
  state.currencies.gemas += offer.amount;
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

// La mejor pieza disponible para ese hueco: entre las libres (sin dueño) más
// la que ya lleva puesta ahí mismo (si la hay), la de mayor gearStatValue —
// que solo depende de rareza+nivel, no del tipo concreto (espada/hacha/...),
// así que es una comparación justa entre piezas de tipos distintos dentro
// del mismo hueco. null si no hay ninguna opción.
function bestGearForSlot(state, fighterUid, slotKey) {
  const entry = rosterEntry(state, fighterUid);
  if (!entry) return null;
  const currentUid = entry.gear[slotKey];
  const options = state.gearInventory.filter(g => g.slot === slotKey && (g.uid === currentUid || !equippedGearOwner(state, g.uid)));
  if (!options.length) return null;
  return options.reduce((best, g) => gearStatValue(g) > gearStatValue(best) ? g : best);
}
// Equipa la mejor pieza disponible en cada uno de los 6 huecos a la vez —
// devuelve cuántos huecos cambiaron respecto a lo que ya llevaba puesto.
function autoEquipBest(state, fighterUid) {
  let changed = 0;
  GEAR_SLOT_IDS.forEach(slotKey => {
    const entry = rosterEntry(state, fighterUid);
    const currentUid = entry.gear[slotKey];
    const best = bestGearForSlot(state, fighterUid, slotKey);
    if (best && best.uid !== currentUid) { equipGear(state, fighterUid, best.uid); changed++; }
  });
  return changed;
}

function unequipGear(state, fighterUid, slot) {
  const entry = rosterEntry(state, fighterUid);
  if (!entry || !entry.gear[slot]) return false;
  entry.gear[slot] = null;
  return true;
}

// Desequipa TODO el equipo de cualquier luchador del roster que no esté
// colocado en la Formación actual — pensado para recuperar de un tirón el
// equipo bueno que se ha quedado puesto en luchadores de banca (ya
// sustituidos, o invocados y nunca llegados a poner), sin tener que abrir
// la ficha de cada uno a mano. El equipo no se pierde, solo vuelve al
// inventario (sin dueño) listo para ponerlo en quien esté jugando de
// verdad. Devuelve cuántas piezas se han desequipado.
function unequipBenchedGear(state) {
  const bandUids = new Set(state.band.flat().filter(Boolean));
  let count = 0;
  state.roster.forEach(entry => {
    if (bandUids.has(entry.uid)) return;
    GEAR_SLOT_IDS.forEach(slot => {
      if (entry.gear[slot]) { entry.gear[slot] = null; count++; }
    });
  });
  return count;
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

// --- Conversión de cristales ---
// Pixite tiene que ser con diferencia la fuente principal de cristales
// (ver CRYSTALS y stageRewards) — Voxite/Doxite se dejaron deliberadamente
// escasos para que Legendario siga costando de verdad. Esto deja al
// jugador sin ninguna válvula de escape si tiene mala suerte concreta con
// Voxite/Doxite aunque le sobre Pixite: esta conversión (Pixite→Voxite→
// Doxite, siempre en dos pasos, nunca un salto directo) es esa válvula —
// cara a propósito (peor ratio que la caída natural media de cristales,
// ver comentario de CRYSTAL_CONVERT_RATES) y bloqueada hasta bien entrado
// el mapa (CRYSTAL_CONVERT_UNLOCK_ZONES), para que no sirva de atajo
// gratis en las primeras zonas donde ni falta hacen los cristales altos.
const CRYSTAL_CONVERT_UNLOCK_ZONES = 11; // desbloqueada al llegar a la zona 10 (11 zonas desbloqueadas)
// Ratio peor que la media de caída natural (~16:1 Pixite:Voxite, ~5:1
// Voxite:Doxite con las tasas actuales de stageRewards) para que convertir
// nunca sea mejor que jugar con suerte normal, solo un seguro caro contra
// la mala suerte puntual.
const CRYSTAL_CONVERT_RATES = { pixite: { to: 'voxite', cost: 25 }, voxite: { to: 'doxite', cost: 8 } };
function crystalConvertUnlocked(state) {
  return state.progress.unlockedZones.length >= CRYSTAL_CONVERT_UNLOCK_ZONES;
}
function convertCrystals(state, fromType) {
  if (!crystalConvertUnlocked(state)) return false;
  const rate = CRYSTAL_CONVERT_RATES[fromType];
  if (!rate || state.currencies[fromType] < rate.cost) return false;
  state.currencies[fromType] -= rate.cost;
  state.currencies[rate.to]++;
  state.stats.crystalsConverted++;
  return true;
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
  const entry = { uid: newUid('f'), defId, level: 1, xp: 0, sef: 0, stars: 0, gear: emptyGearSet(), stats: newFighterStats(), isNew: !everDiscovered, readyToEvolve: false };
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
  state.stats.totalFusionsMade += used;
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
  // Registro permanente de la Pokédex (state.discoveredDefIds, ver
  // applySummonResult más arriba) — faltaba aquí, así que la forma
  // evolucionada nunca se marcaba como "ya vista": si más tarde tocaba
  // por invocación, applySummonResult la trataba otra vez como
  // "everDiscovered = false" (nueva de verdad) en vez de duplicado, pese
  // a que el jugador ya la tenía desde que evolucionó por primera vez.
  if (!state.discoveredDefIds) state.discoveredDefIds = [];
  if (!state.discoveredDefIds.includes(entry.defId)) state.discoveredDefIds.push(entry.defId);
  state.stats.totalEvolutions++;
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
  // El sacrificio debe estar en su forma FINAL (sin evolvesTo) — sacrificar
  // una forma intermedia con SEF 5/5 tiraría a la basura una evolución ya
  // lista (readyToEvolve, ver fuseMaterials) que el jugador podría haber
  // completado en su lugar. sef>=5 por sí solo no bastaba: una forma no
  // final con SEF lleno sigue pudiendo evolucionar antes de sacrificarse.
  if (fighterDef(sac.defId).evolvesTo) return false;
  // El OBJETIVO también debe estar en forma final: las ★ de Superfusión
  // son una inversión de POST-evolución (mismo criterio que selfSuperFuse,
  // que ya lo exigía) — sin este check, cualquier forma todavía
  // evolucionable (p.ej. un Común recién invocado) podía recibir ★
  // sacrificando a OTRO luchador, sin haber avanzado su propia cadena de
  // fusión/evolución para nada. Común e Infrecuente nunca son forma
  // final de ninguna familia (siempre evolucionan 2 veces desde ahí), así
  // que con este check ningún luchador de esas dos rarezas puede llegar
  // nunca a tener ★ — solo Raro/Épico/Legendario, y solo en su forma
  // final concreta dentro de esa rareza.
  if (fighterDef(target.defId).evolvesTo) return false;
  if (target.stars >= 3) return false;
  target.stars++;
  removeFromRoster(state, sacrificeUid);
  return true;
}

// Autofusión: un luchador en forma final con SEF 5/5 no ganaba nada por sí
// mismo con ese SEF — solo quedaba "listo para ser sacrificado" en la
// Superfusión de OTRO luchador (ver superFuse). Si el jugador quiere
// CONSERVAR justo a ese luchador (p.ej. su Odín ya invertido), esa
// inversión se quedaba desaprovechada a menos que sacrificara una copia
// SEPARADA construida aparte hasta forma final + SEF 5/5 (mucho más
// material: esa copia aparte también tiene que subir toda su propia
// cadena de evolución). Autofusión salta ese rodeo: una copia MÁS del
// propio luchador (ya en forma final, así que necesariamente del mismo
// tier, sin cadena de evolución que reconstruir) le da +1★ a sí mismo
// directamente, reiniciando su SEF a 0 para la siguiente estrella.
function selfSuperFuse(state, targetUid, materialUid) {
  if (targetUid === materialUid) return false;
  const target = rosterEntry(state, targetUid);
  const material = rosterEntry(state, materialUid);
  if (!target || !material) return false;
  if (material.defId !== target.defId) return false;
  const def = fighterDef(target.defId);
  if (def.evolvesTo) return false;
  if (target.sef < 5) return false;
  if (target.stars >= 3) return false;
  target.stars++;
  target.sef = 0;
  removeFromRoster(state, materialUid);
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

// Hueco {row, col} donde está colocado un uid en la Formación, o null si no
// está en ninguno — usado para saber si un luchador concreto está en banda
// (y en qué hueco, para poder sustituirlo) sin recorrer la rejilla a mano
// en cada sitio que lo necesita.
function bandPositionOf(state, uid) {
  for (let r = 0; r < BAND_ROWS; r++) for (let c = 0; c < BAND_COLS; c++) {
    if (state.band[r][c] === uid) return { row: r, col: c };
  }
  return null;
}

// Primer hueco libre de la Formación (fila a fila), o null si está
// completa — para poder añadir un luchador de un toque desde su ficha sin
// que el jugador tenga que elegir hueco a mano cuando cualquiera vale.
function firstEmptyBandSlot(state) {
  for (let r = 0; r < BAND_ROWS; r++) for (let c = 0; c < BAND_COLS; c++) {
    if (!state.band[r][c]) return { row: r, col: c };
  }
  return null;
}

// --- Formaciones guardadas ---
// Cada preset es una copia independiente de state.band en el momento de
// guardarlo — cambiar la Formación actual después no afecta a los presets
// ya guardados, ni al revés. Sin tope de cuántos se pueden guardar.
function saveFormationPreset(state, name) {
  const preset = { id: newUid('fp'), name: name.trim() || 'Formación', band: state.band.map(row => row.slice()) };
  state.formationPresets.push(preset);
  return preset;
}
function renameFormationPreset(state, presetId, name) {
  const preset = state.formationPresets.find(p => p.id === presetId);
  if (!preset || !name.trim()) return false;
  preset.name = name.trim();
  return true;
}
function deleteFormationPreset(state, presetId) {
  const before = state.formationPresets.length;
  state.formationPresets = state.formationPresets.filter(p => p.id !== presetId);
  return state.formationPresets.length < before;
}
// Aplica un preset guardado como Formación actual — sustituye state.band
// entero. Cualquier uid del preset que ya no exista en el roster (vendido,
// o la familia se retiró de FIGHTERS) se salta en vez de romper la
// Formación resultante, ya que un preset puede guardarse mucho antes de
// aplicarse y el roster puede haber cambiado por el medio.
function applyFormationPreset(state, presetId) {
  const preset = state.formationPresets.find(p => p.id === presetId);
  if (!preset) return false;
  state.band = preset.band.map(row => row.map(uid => (uid && rosterEntry(state, uid)) ? uid : null));
  return true;
}

// Los jefes de zona tienen estadísticas FIJAS calibradas para un jugador
// "a la par" de esa zona (mismo nivel/rareza que su propio relleno, sin
// equipo) — pero las invocaciones no están limitadas a esa rareza, así que
// una tirada con suerte con solo un puñado de cristales de inicio puede dar
// un luchador Raro o Épico capaz de barrer toda una zona temprana sin que
// el jefe llegue a hacer ni un solo punto de daño real. Este multiplicador
// (pasado como extraMult a makeBossUnit, ver buildEnemyBand en combat.js)
// SOLO entra en juego cuando la banda del jugador supera claramente ese
// nivel "a la par" — nunca reduce por debajo de 1×, así que un jefe ya
// calibrado para una banda floja sigue exactamente igual de accesible que
// siempre. El exceso se amortigua con exponente 0.85 (una banda 4× más
// fuerte de lo esperado sube el jefe ~3.6×, no 4×) y con un techo de 4.5×,
// para que siga notándose el mérito de haber invocado bien sin que el jefe
// se vuelva imposible ni deje de tener nunca ninguna oportunidad de golpear.
//
// Antes se amortiguaba con raíz cuadrada (exponente 0.5), pensado sobre
// todo para los jefes de la Torre Batalla (ver torreBossMult más abajo,
// que YA divide el exceso entre la repetición sin curación — con esa
// segunda capa de damping, un jefe de Mapa de encuentro único quedaba
// doblemente suavizado sin necesidad). Con una banda nivel 40 TODO
// legendario (equipo Nv.15 incluido) medí que "overpower" real ronda 2×
// sobre el jefe de referencia, pero raíz cuadrada solo subía el jefe a
// 1.4× — el jefe recibía de vuelta 100-1000 de daño frente a una banda con
// ~27000 HP total, es decir apenas un rasguño en casi todas las zonas. Con
// exponente 0.85 el jefe pasa a recibir 500-20000 de daño según la zona
// (varias veces más), sin perder ninguna partida salvo en la zona ya más
// dura de por sí (Salón de los Engaños), que pasa de trámite garantizado a
// desafío real. Con una banda floja (rareza raro, equipo raro Nv.5) el
// cambio no rompe nada: sigue ganando siempre salvo en esa misma zona.
//
// BOSS_EARLY_BOOST (ver earlyGameBoostMult en data.js): capa añadida
// después, sin tocar nada de lo anterior — el jugador reportó cero bajas y
// apenas daño recibido jugando en serio (sin grindear ni equipar nada)
// hasta la zona 7, con una banda que ya iba de sobra en Épicos/Legendarios
// por la Fusión normal. El "overpower" de arriba ya lo detecta, pero
// bandaba fuerte solo si superaba 1× — con baseline aún bajo en zonas
// tempranas (ver bossLevelCorrectionMult), el jefe salía blando incluso
// con overpower real. BOSS_EARLY_BOOST multiplica baseline ANTES del
// overpower, desvaneciéndose a ×1 según bossLevelCorrectionMult se acerca
// a 1 — es decir, se apaga solo justo donde ya no hace falta (zonas
// tardías, la calibración de arriba ya probada con banda TODO Legendario
// incluida, ver TODO.md: con esta capa esa banda sigue sacando el mismo
// ~70% de daño recibido en Salón de los Engaños que sin ella, porque ahí
// baseline ya vale ~1).
//
// 1.6→1.9 (pedido explícito del usuario tras revisar capturas reales de
// su propia partida en Salón del Juicio/Sabana Ardiente): con 1.6 el
// jefe ya dolía de verdad pero se ganaba SIEMPRE con una banda natural
// (0 derrotas en 10-12 simulaciones en varias zonas tempranas/medias) —
// el usuario pidió específicamente que exista riesgo real de perder
// contra el jefe (no solo los mobs, que dejó explícitamente igual).
// Verificado por simulación (banda "natural" real, motor de combate
// real): con 1.9 aparecen derrotas reales en zonas tempranas/medias
// (p.ej. ~40-50% de derrotas en Salón del Juicio/Sabana Ardiente en una
// muestra), mientras que la banda maxed de referencia (TODO Legendario)
// sigue ganando siempre en Llanura del Titán/Salón de los Engaños
// (72-73% de daño recibido, sin cambio significativo) — la propia
// tapered de arriba protege esa calibración tardía sea cual sea este
// valor, porque ahí bossLevelCorrectionMult ya vale ~1.
//
// MIN_BAND_FOR_BOOST: ni este refuerzo ni el "overpower" de más abajo se
// aplican con una banda todavía muy pequeña (menos de 6 huecos ocupados,
// como la banda inicial de solo 3) — verificado por simulación: la
// primerísima etapa del juego (banda inicial de 3, 2 oleadas SEGUIDAS sin
// curación) ya está ajustada de por sí con solo la fórmula original, y
// cualquier refuerzo encima (incluso uno modesto) la convertía en derrota
// garantizada. El "overpower" medido con solo 2-3 luchadores tampoco es
// una señal fiable — la propia banda inicial (1 Infrecuente entre 2
// Comunes) ya sale ligeramente "sobrada" sin que eso signifique que el
// jugador esté invocando con más suerte de la cuenta.
const BOSS_EARLY_BOOST = 1.9, MIN_BAND_FOR_BOOST = 6;
function bossAdaptiveMult(state, zoneIdx) {
  const zone = ZONES[zoneIdx];
  const level = zoneEnemyLevel(zoneIdx);
  // Corrige el desfase de fixedStats frente a la nueva curva de nivel (ver
  // el comentario de bossLevelCorrectionMult en data.js) — se aplica
  // SIEMPRE, incluso sin overpower, porque el problema que corrige existe
  // ya en la base (fixedStats calibrado para el ritmo antiguo), no algo
  // que dependa de cómo de bien vaya el jugador.
  const rawBaseline = bossLevelCorrectionMult(zoneIdx);
  const bandUids = state.band.flat().filter(Boolean);
  const baseline = bandUids.length >= MIN_BAND_FOR_BOOST ? rawBaseline * earlyGameBoostMult(rawBaseline, BOSS_EARLY_BOOST) : rawBaseline;
  if (bandUids.length < MIN_BAND_FOR_BOOST) return baseline;
  const refStats = buildUnitStats(zone.pool[0], level);
  const refPower = fighterPowerScore({ hp: refStats.maxHp, atk: refStats.atk, def: refStats.def, agi: refStats.agi, wis: refStats.wis });
  if (refPower <= 0) return baseline;
  let bandTotal = 0, counted = 0;
  bandUids.forEach(uid => {
    const entry = rosterEntry(state, uid);
    if (!entry) return;
    bandTotal += fighterPowerScore(fighterStats(state, entry));
    counted++;
  });
  if (!counted) return baseline;
  const overpower = (bandTotal / counted) / refPower;
  if (overpower <= 1) return baseline;
  // El techo también crece con la zona (lateZoneMult, ver data.js) para que
  // el jefe conserve margen sobre su propio camino en zonas avanzadas, en
  // vez de quedarse siempre en el mismo ×4.5 mientras el camino ya sigue
  // subiendo con lateZoneMult.
  return baseline * Math.min(4.5 * lateZoneMult(zoneIdx), Math.pow(overpower, 0.85));
}

// Mismo concepto que bossAdaptiveMult pero para los MOBS de una etapa
// normal — antes de este cambio los mobs solo escalaban con
// MOB_POWER_MULT×lateZoneMult (ver buildEnemyBand en combat.js), sin
// ningún ajuste por banda real ni por zona: siempre igual de blandos,
// jugara como jugara el jugador. Reutiliza el mismo "overpower" (banda
// real vs. zone.pool[0] como referencia), el mismo earlyGameBoostMult y el
// mismo guardarraíl MIN_BAND_FOR_BOOST que el jefe (ver su comentario más
// arriba — imprescindible aquí también: las etapas normales encadenan 2-3
// oleadas SEGUIDAS sin curación, así que una banda diminuta es todavía
// MÁS frágil frente a cualquier refuerzo que un jefe de un único
// encuentro), pero con exponente y techo más suaves (0.7/×3 frente a
// 0.85/×4.5) — el mismo exceso de stats pesa más acumulado a lo largo de
// varias oleadas que en un jefe de un único encuentro.
const MOB_EARLY_BOOST = 1.6, MOB_OVERPOWER_EXP = 0.7, MOB_OVERPOWER_CAP = 3;
function mobAdaptiveMult(state, zoneIdx) {
  const zone = ZONES[zoneIdx];
  const level = zoneEnemyLevel(zoneIdx);
  const bandUids = state.band.flat().filter(Boolean);
  if (bandUids.length < MIN_BAND_FOR_BOOST) return 1;
  const boosted = earlyGameBoostMult(bossLevelCorrectionMult(zoneIdx), MOB_EARLY_BOOST);
  const refStats = buildUnitStats(zone.pool[0], level);
  const refPower = fighterPowerScore({ hp: refStats.maxHp, atk: refStats.atk, def: refStats.def, agi: refStats.agi, wis: refStats.wis });
  if (refPower <= 0) return boosted;
  let bandTotal = 0, counted = 0;
  bandUids.forEach(uid => {
    const entry = rosterEntry(state, uid);
    if (!entry) return;
    bandTotal += fighterPowerScore(fighterStats(state, entry));
    counted++;
  });
  if (!counted) return boosted;
  const overpower = (bandTotal / counted) / refPower;
  if (overpower <= 1) return boosted;
  return boosted * Math.min(MOB_OVERPOWER_CAP * lateZoneMult(zoneIdx), Math.pow(overpower, MOB_OVERPOWER_EXP));
}

// Jefes de la Torre Batalla: reutiliza bossAdaptiveMult referenciado a la
// zona de ORIGEN de ese jefe (level.originZoneIdx) — así un jefe de zona
// temprana (calibrado para un jugador muy por debajo del que ya terminó el
// mapa entero) sube hasta su techo al medirse contra la banda real del
// jugador, mientras uno de zona tardía (cuya referencia ya está cerca del
// ritmo endgame) apenas cambia, porque ya era un reto real de por sí.
// PERO cada nivel de jefe se repite level.enemyCount veces SEGUIDAS sin
// curación (ver buildTorreEncounters) — aplicar el mismo techo que en el
// Mapa (pensado para UN único encuentro) sin más lo volvía injugable hasta
// para la banda mejor posible (9 legendarios Nv.40 5★ con equipo
// legendario tope: 0/5 combates ganados contra el último nivel en
// pruebas). Se amortigua el EXCESO sobre 1× dividiéndolo entre la raíz de
// las veces que se repite, para que la propia repetición ya cuente como
// parte del reto en vez de sumarse sin más al multiplicador de un solo
// golpe — en enemyCount=1 (los primeros niveles de jefe, sin amortiguar)
// se necesita la subida completa para dejar de ser triviales.
function torreBossMult(state, level) {
  const raw = bossAdaptiveMult(state, level.originZoneIdx);
  if (raw <= 1) return raw;
  return 1 + (raw - 1) / Math.sqrt(level.enemyCount);
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
// Capado a STAGES_PER_ZONE-1: una partida guardada de cuando STAGES_PER_ZONE
// era mayor (33, antes de bajarlo a 25) puede tener un índice de etapa por
// encima del máximo actual — sin este tope se veía como "33/25" en el Mapa
// para cualquier zona ya terminada bajo el número de etapas antiguo.
// migrateState también reescribe el valor guardado (ver más abajo) para
// que quede limpio de una vez, pero este tope se deja aquí también para
// que ninguna lectura futura pueda volver a mostrar un valor imposible.
function highestClearedStage(state, zoneId) {
  const v = state.progress.zoneStage[zoneId];
  return v === undefined ? -1 : Math.min(v, STAGES_PER_ZONE - 1);
}
function isZoneUnlocked(state, zoneId) { return state.progress.unlockedZones.includes(zoneId); }
function isStageUnlocked(state, zoneId, stageIdx) {
  if (!isZoneUnlocked(state, zoneId)) return false;
  return stageIdx <= highestClearedStage(state, zoneId) + 1;
}
// Devuelve { unlockedZone, zoneGemsBonus }: la zona siguiente si se acaba
// de desbloquear (null si no), y las Gemas de bonificación por completar
// esta zona por primera vez (0 si ya se había derrotado antes a este jefe
// — la bonificación es un premio de una sola vez, no se repite al rejugar
// la etapa). El bono crece con la zona (15 + 3 por cada zona de distancia
// al inicio) para que las últimas, mucho más difíciles, den bastante más.
function recordStageClear(state, zoneIdx, stageIdx) {
  const zone = ZONES[zoneIdx];
  const wasAlreadyCleared = stageIdx <= highestClearedStage(state, zone.id);
  if (!wasAlreadyCleared) state.progress.zoneStage[zone.id] = stageIdx;
  let unlockedZone = null;
  let zoneGemsBonus = 0;
  if (stageIdx === STAGES_PER_ZONE - 1) {
    if (!wasAlreadyCleared) {
      zoneGemsBonus = 15 + zoneIdx * 3;
      state.currencies.gemas += zoneGemsBonus;
    }
    const next = ZONES[zoneIdx + 1];
    if (next && !isZoneUnlocked(state, next.id)) { state.progress.unlockedZones.push(next.id); unlockedZone = next; }
  }
  return { unlockedZone, zoneGemsBonus };
}

// --- Torre Batalla (ver TORRE_LEVELS en data.js) ---
function mapFullyCleared(state) { return ZONES.every(z => highestClearedStage(state, z.id) >= STAGES_PER_ZONE - 1); }
function torreUnlocked(state) { return !!state.settings.enableTorreBatalla || mapFullyCleared(state); }
function torreClearCount(state, level) { return state.torre.clears[level.key] || 0; }
// Escalera secuencial, igual que las etapas de una zona: el nivel 0
// siempre está abierto; cada uno más se abre en cuanto se supera el
// anterior al menos una vez (y se queda abierto para siempre, aunque luego
// se rejueguen niveles anteriores por más copias).
function isTorreLevelUnlocked(state, idx) {
  if (idx === 0) return true;
  return torreClearCount(state, TORRE_LEVELS[idx - 1]) > 0;
}
function recordTorreClear(state, idx) {
  const level = TORRE_LEVELS[idx];
  state.torre.clears[level.key] = torreClearCount(state, level) + 1;
}

// --- Tope de Tier (ver TIER_CAP_LEVELS en data.js) ---
// Disponible desde el principio (no necesita haber terminado nada) — es
// una restricción de CÓMO montas la Formación, no una escalera de poder,
// así que no tiene sentido gatearla detrás de otro contenido.
function tierCapClearCount(state, level) { return state.tierCap.clears[level.id] || 0; }
function isTierCapLevelUnlocked(state, idx) {
  if (idx === 0) return true;
  return tierCapClearCount(state, TIER_CAP_LEVELS[idx - 1]) > 0;
}
function recordTierCapClear(state, idx) {
  const level = TIER_CAP_LEVELS[idx];
  state.tierCap.clears[level.id] = tierCapClearCount(state, level) + 1;
}
// Solo mira los huecos OCUPADOS de la Formación (los vacíos no cuentan ni
// a favor ni en contra) — así el jugador puede optar por dejar huecos
// libres si no tiene suficientes luchadores que cumplan la restricción, a
// cambio de menos líneas de combate entre las que elegir, sin que eso
// bloquee poder intentarlo. Al menos 1 hueco ocupado para poder empezar.
function formationMeetsConstraint(state, constraint) {
  const filled = state.band.flat().filter(Boolean);
  if (!filled.length) return false;
  return filled.every(uid => {
    const entry = rosterEntry(state, uid);
    if (!entry) return false;
    const def = fighterDef(entry.defId);
    if (constraint.rarityMax && rarityIndex(def.rarity) > rarityIndex(constraint.rarityMax)) return false;
    if (constraint.element && def.element !== constraint.element) return false;
    if (constraint.class && def.class !== constraint.class) return false;
    return true;
  });
}

// --- Tope de Tier — Fase 2: Trials de Familia (ver FAMILY_TRIALS en
// data.js) --- Sin desbloqueo secuencial entre ellos (no son una
// escalera de poder): cada Trial solo depende de si esa familia se ha
// conseguido alguna vez (para no listar 112 filas todas en "???") y, para
// poder EMPEZARLO, de si hay al menos 1 copia fichada ahora mismo en la
// Formación (huecos vacíos no cuentan, el resto de la Formación puede ser
// cualquier cosa — a diferencia de la Fase 1, aquí no se restringe nada
// más que "que esté esa familia").
function familyTrialClearCount(state, trial) { return state.tierCap.familyTrialClears[trial.id] || 0; }
function familyTrialDiscovered(state, trial) {
  const discovered = new Set(state.discoveredDefIds || []);
  return trial.formIds.some(id => discovered.has(id));
}
function formationHasFamily(state, family) {
  return state.band.flat().filter(Boolean).some(uid => {
    const entry = rosterEntry(state, uid);
    return entry && fighterDef(entry.defId).family === family;
  });
}
function recordFamilyTrialClear(state, trial) {
  state.tierCap.familyTrialClears[trial.id] = familyTrialClearCount(state, trial) + 1;
}

// --- Mazmorra Elemental (ver ELEMENTAL_DUNGEONS en data.js) ---
// Se desbloquea al completar las 6 zonas originales del mapa (contenido de
// mitad de partida, mucho antes que Torre Batalla, que pide el mapa
// entero) — ver el comentario de ELEMENTAL_DUNGEON_ZONE_ID en data.js.
function elementalDungeonUnlocked(state) { return !!state.settings.enableElementalDungeon || isZoneUnlocked(state, ELEMENTAL_DUNGEON_ZONE_ID); }
function recordElementalClear(state, elementId) { state.elementalClears[elementId] = (state.elementalClears[elementId] || 0) + 1; }
// Filtra los uids del equipo elegido que ya no existen en el roster
// (vendidos, evolucionados...) y, si encuentra alguno, deja el hueco
// limpio guardado — evita que un uid huérfano llegue a combate.
function elementalTeamUids(state, elementId) {
  const raw = state.elementalTeams[elementId] || [];
  const valid = raw.filter(uid => rosterEntry(state, uid));
  if (valid.length !== raw.length) state.elementalTeams[elementId] = valid;
  return valid;
}

// --- Arena (ver buildArenaBand en combat.js y arenaSeasonKey en data.js) ---
// Se llama al abrir la pantalla de Arena (UI.renderArena) — si la clave de
// temporada real ya cambió desde la última vez, aplica el reset parcial y
// devuelve el resumen para mostrarlo (null si todavía es la misma
// temporada, el caso normal). bestRank (récord de toda la partida) nunca
// se toca aquí, solo rank/seasonPeakRank (el progreso "de temporada").
function checkArenaSeasonReset(state) {
  const currentKey = arenaSeasonKey();
  if (state.arena.seasonKey === currentKey) return null;
  const previousPeak = state.arena.seasonPeakRank;
  const reward = arenaSeasonReward(previousPeak);
  state.currencies.gemas += reward.gemas;
  const newRank = Math.max(1, Math.round(previousPeak * ARENA_SEASON_RESET_FRACTION));
  state.arena.rank = newRank;
  state.arena.seasonPeakRank = newRank;
  state.arena.seasonKey = currentKey;
  return { previousPeak, reward, newRank };
}

// --- Prueba del Campeón (duelos 1 contra 1, ver combat.js) ---
function recordChampionStreak(state, duelsWon) {
  if (duelsWon > state.champion.bestStreak) state.champion.bestStreak = duelsWon;
}

// --- Roguelike (ver buildRoguelikeEnemyRow en combat.js) ---
// Extensión de la Torre Batalla para cuando ya se ha superado del todo (66
// niveles fijos) — un modo survival sin fin, con dificultad creciente sin
// tope (a propósito, como Arena: la gracia es ver hasta dónde se puede
// llegar, no que sea siempre superable — ver la auditoría de dificultad en
// TODO.md) y bonos elegidos a mano entre ronda y ronda que sí se quedan
// para el resto de la run.
function roguelikeUnlocked(state) {
  return !!state.settings.enableRoguelike || TORRE_LEVELS.every(level => torreClearCount(state, level) > 0);
}
function recordRoguelikeRun(state, roundsCleared) {
  if (roundsCleared > state.roguelike.bestRound) state.roguelike.bestRound = roundsCleared;
}

// --- Mercader Itinerante (ver merchantOffer en data.js) ---
function merchantOfferRedeemedToday(state) { return state.merchant.lastRedeemedKey === merchantOffer().key; }

// --- Constancia (objetivo "juega N días distintos") ---
// Se llama una vez al cargar la partida; guarda la fecha (día del calendario
// local, no necesita sesiones de 24h reales) si no estaba ya registrada.
function recordPlayDay(state) {
  const today = new Date().toISOString().slice(0, 10);
  if (!state.progress.daysPlayed.includes(today)) state.progress.daysPlayed.push(today);
}

// --- Objetivos (ver OBJECTIVES en data.js) ---
// Da la recompensa de un objetivo (ver los constructores rG/rT/rI/rGear/rC
// en data.js) al estado. Si es una pieza de equipo y el inventario está
// lleno, se vende sola al momento (mismo cálculo que sellGear) para que
// reclamar un logro nunca se pierda por no tener hueco.
function grantObjectiveReward(state, reward) {
  if (reward.type === 'gemas') state.currencies.gemas += reward.amount;
  else if (reward.type === 'texel') state.currencies.texel += reward.amount;
  else if (reward.type === 'crystal') state.currencies[reward.crystalType] += reward.amount;
  else if (reward.type === 'item') state.items[reward.itemId] = (state.items[reward.itemId] || 0) + reward.amount;
  else if (reward.type === 'gear') {
    const gear = generateGear(randomGearSlot(), reward.rarity);
    if (!addGear(state, gear)) state.currencies.texel += gearStatValue(gear) * 2;
  }
}

// Reclama la recompensa de un objetivo ya completado — devuelve el objeto
// `reward` dado (ver grantObjectiveReward), o null si no se pudo (no
// completado todavía, o ya reclamado antes).
function claimObjective(state, objId) {
  if (state.objectivesClaimed.includes(objId)) return null;
  const obj = OBJECTIVES.find(o => o.id === objId);
  if (!obj) return null;
  const s = objectivesSummary(state);
  if (!objectiveCompleted(obj, state, s)) return null;
  state.objectivesClaimed.push(objId);
  grantObjectiveReward(state, obj.reward);
  return obj.reward;
}

// --- Objetivos (pantalla de progreso general) ---
// Todo de solo lectura: agrega números ya presentes en otras partes del
// estado (progreso de zonas, Pokédex, roster, arena, equipo...) en un único
// resumen para la pantalla de Objetivos. No guarda nada nuevo en el save.
function objectivesSummary(state) {
  let stagesCleared = 0, bossesDefeated = 0;
  ZONES.forEach(z => {
    stagesCleared += highestClearedStage(state, z.id) + 1;
    if (highestClearedStage(state, z.id) >= STAGES_PER_ZONE - 1) bossesDefeated++;
  });
  const discovered = new Set(state.discoveredDefIds || []);
  const familyIds = {};
  FIGHTERS.forEach(f => { (familyIds[f.family] ||= []).push(f.id); });
  const families = Object.values(familyIds);
  const familiesComplete = families.filter(ids => ids.every(id => discovered.has(id))).length;
  const rosterDefs = state.roster.map(r => fighterDef(r.defId));
  return {
    unlockedZones: state.progress.unlockedZones.length, totalZones: ZONES.length,
    stagesCleared, totalStages: ZONES.length * STAGES_PER_ZONE,
    bossesDefeated, totalBosses: ZONES.length,
    formsDiscovered: discovered.size, totalForms: FIGHTERS.length,
    familiesComplete, totalFamilies: families.length,
    rosterSize: state.roster.length,
    maxLevelCount: state.roster.filter(r => r.level >= XP_LEVEL_CAP).length,
    finalFormCount: rosterDefs.filter(d => d && !d.evolvesTo).length,
    legendarioCount: rosterDefs.filter(d => d && d.rarity === 'legendario').length,
    totalSefStars: state.roster.reduce((sum, r) => sum + r.stars, 0),
    starredCount: state.roster.filter(r => r.stars >= 3).length,
    elementsInRoster: new Set(rosterDefs.map(d => d && d.element)).size, totalElements: ELEMENT_ORDER.length,
    classesInRoster: new Set(rosterDefs.map(d => d && d.class)).size, totalClasses: Object.keys(CLASS_INFO).length,
    battlesWon: state.stats.battlesWon, battlesLost: state.stats.battlesLost,
    totalDmgDealt: state.stats.totalDmgDealt, totalDmgReceived: state.stats.totalDmgReceived,
    totalHealDone: state.stats.totalHealDone, highestSingleHit: state.stats.highestSingleHit,
    totalTexelEarned: state.stats.totalTexelEarned, totalFighterXpEarned: state.stats.totalFighterXpEarned,
    arenaRank: state.arena.rank, arenaBestRank: state.arena.bestRank,
    roguelikeBestRound: state.roguelike.bestRound,
    gearOwned: state.gearInventory.length,
    gearLegendarioCount: state.gearInventory.filter(g => g.rarity === 'legendario').length,
    homunculosTotal: state.homunculos.homunculo_t1 + state.homunculos.homunculo_t2 + state.homunculos.homunculo_t3,
    crystalsConverted: state.stats.crystalsConverted,
    totalFusionsMade: state.stats.totalFusionsMade, totalEvolutions: state.stats.totalEvolutions,
  };
}

// Desglose de la Colección por tier (rareza) — pedido explícito del
// usuario, para la pantalla de Objetivos/Estadísticas: cuántos personajes
// de cada rareza ha descubierto ALGUNA VEZ (discoveredDefIds, la Pokédex
// permanente — igual que formsDiscovered en objectivesSummary, pero
// desglosado por tier en vez de un único total) sobre el total de esa
// rareza, y cuántos le faltan.
//
// "Maxeado" (3★ de Superfusión, el tope — mismo criterio que
// starredCount) es aparte y con su PROPIO total, no el mismo `total` de
// arriba: las ★ son una inversión de POST-evolución (ver el check de
// !evolvesTo añadido a superFuse), y Común/Infrecuente NUNCA son la
// forma final de ninguna familia (siempre evolucionan 2 veces desde
// ahí) — ninguna carta de esas dos rarezas puede llegar a tener ★ jamás,
// así que contarlas sobre el total de la rareza entera (como se hacía
// antes) daba un "0 maxeables de 36" sin sentido. `maxable` (formas
// finales de esa rareza) es el total correcto para esta métrica — 0 en
// Común/Infrecuente, así que la UI puede directamente no mostrar la fila
// de maxeados ahí. Un personaje cuenta como maxeado si CUALQUIER copia
// suya en el roster actual llegó a 3★, no hace falta que sea la única
// copia que se tenga ni que sea el resto de copias también las máximas.
function rarityCollectionStats(state) {
  const discovered = new Set(state.discoveredDefIds || []);
  const maxedDefIds = new Set(state.roster.filter(r => r.stars >= 3).map(r => r.defId));
  return RARITIES.map(r => {
    const ids = FIGHTERS.filter(f => f.rarity === r.id).map(f => f.id);
    const finalIds = ids.filter(id => !fighterDef(id).evolvesTo);
    const found = ids.filter(id => discovered.has(id)).length;
    const maxed = finalIds.filter(id => maxedDefIds.has(id)).length;
    return { id: r.id, label: r.label, icon: r.icon, total: ids.length, found, missing: ids.length - found, maxable: finalIds.length, maxed };
  });
}

// Una entrada por zona con su jefe y si ya se ha derrotado alguna vez (misma
// condición que bossesDefeated en objectivesSummary: haber superado la
// última etapa de esa zona). `level` es el nivel real al que se combate ese
// jefe (mismo tope de XP_LEVEL_CAP que buildEnemyBand en combat.js), para
// poder mostrar sus estadísticas de combate reales en la ficha.
function bossesOverview(state) {
  return ZONES.map((zone, zoneIdx) => ({
    zoneIdx, zone, def: bossDef(zone.pool[2]),
    defeated: highestClearedStage(state, zone.id) >= STAGES_PER_ZONE - 1,
    level: zoneEnemyLevel(zoneIdx),
  }));
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
    return migrateState(JSON.parse(raw));
  } catch (e) { return null; }
}

// Normaliza/migra un objeto de partida ya parseado (de localStorage o de un
// código de Exportar/Importar partida, ver exportSaveCode/importSaveCode) a
// la forma actual del estado — null si no es una partida válida.
function migrateState(state) {
  try {
    if (!state || state.version !== 2 || !state.roster) return null;
    state.roster.forEach(r => { if (!r.stats) r.stats = newFighterStats(); });
    // Partidas guardadas de cuando STAGES_PER_ZONE era mayor (33, antes de
    // bajarlo a 25): el índice de etapa más alta superada de cada zona
    // puede quedar por encima del máximo actual — se capa aquí de una vez
    // (además del tope de lectura en highestClearedStage) para que el
    // propio dato guardado quede limpio, no solo lo que se muestra.
    if (state.progress && state.progress.zoneStage) {
      Object.keys(state.progress.zoneStage).forEach(zoneId => {
        if (state.progress.zoneStage[zoneId] > STAGES_PER_ZONE - 1) state.progress.zoneStage[zoneId] = STAGES_PER_ZONE - 1;
      });
    }
    if (!state.settings) state.settings = { infiniteEnergy: false, showMedallion: true };
    if (state.settings.showMedallion === undefined) state.settings.showMedallion = true;
    if (state.settings.enableTorreBatalla === undefined) state.settings.enableTorreBatalla = false;
    if (state.settings.enableElementalDungeon === undefined) state.settings.enableElementalDungeon = false;
    if (state.settings.enableRoguelike === undefined) state.settings.enableRoguelike = false;
    if (!state.items) state.items = { pocion_menor: 0, pocion_mayor: 0, pluma_fenix: 0 };
    if (!state.homunculos) state.homunculos = { homunculo_t1: 0, homunculo_t2: 0, homunculo_t3: 0 };
    if (!state.torre) state.torre = { clears: {} };
    if (!state.tierCap) state.tierCap = { clears: {}, familyTrialClears: {} };
    if (!state.tierCap.familyTrialClears) state.tierCap.familyTrialClears = {};
    // Partidas guardadas antes de las temporadas de Arena: arrancan la
    // primera temporada ya mismo, con el rango actual como pico (así no se
    // resetea de golpe nada más migrar, solo a partir de la próxima
    // semana natural).
    if (state.arena.seasonKey === undefined) {
      state.arena.seasonKey = arenaSeasonKey();
      state.arena.seasonPeakRank = state.arena.rank;
    }
    if (state.arena.scoutedChampionLeagueId === undefined) state.arena.scoutedChampionLeagueId = null;
    if (!state.elementalTeams) state.elementalTeams = { fuego: [], viento: [], tierra: [], rayo: [], agua: [] };
    if (!state.elementalClears) state.elementalClears = { fuego: 0, viento: 0, tierra: 0, rayo: 0, agua: 0 };
    if (!state.champion) state.champion = { selectedUid: null, bestStreak: 0 };
    if (!state.roguelike) state.roguelike = { bestRound: 0 };
    if (!state.merchant) state.merchant = { lastRedeemedKey: null };
    if (!state.objectivesClaimed) state.objectivesClaimed = [];
    if (!state.formationPresets) state.formationPresets = [];
    if (!state.progress.daysPlayed) state.progress.daysPlayed = [];
    if (!state.stats) state.stats = { battlesWon: 0, battlesLost: 0 };
    ['totalDmgDealt', 'totalDmgReceived', 'totalHealDone', 'totalTexelEarned', 'totalFighterXpEarned', 'highestSingleHit', 'crystalsConverted', 'totalFusionsMade', 'totalEvolutions'].forEach(key => {
      if (state.stats[key] === undefined) state.stats[key] = 0;
    });
    // Partidas guardadas antes de que existiera este registro: se
    // reconstruye a partir de lo que haya ahora mismo en el roster (no es
    // perfecto — no recuerda luchadores vendidos/evolucionados antes de
    // esta versión — pero es lo mejor que se puede inferir retroactivamente).
    if (!state.discoveredDefIds) state.discoveredDefIds = [...new Set(state.roster.map(r => r.defId))];
    // Arreglo retroactivo de un bug: evolveFighter no añadía la forma
    // evolucionada a discoveredDefIds, así que una partida que evolucionó a
    // un luchador ANTES de este arreglo puede tener en el roster una forma
    // que la Pokédex no reconoce como "ya vista" — se completa (unión, no
    // sustituye nada) con TODO defId presente ahora mismo en el roster, sea
    // cual sea el motivo por el que discoveredDefIds ya existiera.
    state.roster.forEach(r => { if (!state.discoveredDefIds.includes(r.defId)) state.discoveredDefIds.push(r.defId); });
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
    // Limpieza de luchadores huérfanos: si una familia se elimina de
    // FIGHTERS/MOBS/BOSSES/HOMUNCULOS (p.ej. el jugador la borra a mano en
    // data.js), las copias que ya tenía guardadas en el roster se quedan
    // apuntando a un defId que ya no existe. fighterDef() devuelve undefined
    // para ellas, y como muchas pantallas (orden de la Colección, selector
    // de Formación...) leen def.name/def.rarity/etc. sin comprobar antes,
    // una sola ficha huérfana rompía silenciosamente TODA la lista — de ahí
    // que desaparecieran luchadores y fallara elegir/ordenar en la
    // Formación. Se retiran aquí, junto con su hueco en la Formación si lo
    // ocupaban (el equipo que llevaran puestos no se pierde, solo queda sin
    // equipar en el inventario).
    const orphanUids = new Set();
    state.roster = state.roster.filter(entry => {
      if (fighterDef(entry.defId)) return true;
      orphanUids.add(entry.uid);
      return false;
    });
    if (orphanUids.size > 0) {
      state.band = state.band.map(row => row.map(uid => (uid && orphanUids.has(uid)) ? null : uid));
      state.__orphanCount = orphanUids.size;
    }
    return state;
  } catch (e) { return null; }
}

function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// ---------- Exportar/Importar partida ----------
// Códigos de texto (base64 de los bytes UTF-8 del JSON de la partida) para
// hacer copia de seguridad manual o pasar la partida a otro dispositivo,
// sin depender de ningún servidor. Se convierte en trozos (en vez de
// String.fromCharCode(...bytes) de una vez) para no reventar la pila con
// partidas grandes.
function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function exportSaveCode(state) {
  return bytesToBase64(new TextEncoder().encode(JSON.stringify(state)));
}
// Reutiliza migrateState (las mismas migraciones/limpiezas que una partida
// cargada normal) para que un código exportado en una versión anterior del
// juego se ponga al día igual que cualquier partida guardada. Lanza si el
// código no es un base64 válido o no decodifica a JSON.
function importSaveCode(code) {
  const bytes = base64ToBytes(code.trim());
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  const state = migrateState(parsed);
  if (!state) throw new Error('Código de partida no válido.');
  return state;
}
