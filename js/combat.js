// Motor de combate por bandas: filas de hasta 3 luchadores luchan contra la fila
// activa rival, turno a turno, hasta que una banda entera cae.
let unitSeq = 1;

function buildUnitStats(defId, level, extraMult) {
  const def = fighterDef(defId);
  // Los jefes de zona pelean como rival con estadísticas FIJAS (def.fixedStats,
  // ver addBoss en data.js) en vez de la fórmula de rareza×nivel compartida
  // con el resto de luchadores — así se puede calibrar la dificultad de cada
  // jefe uno a uno sin que un cambio en RARITIES o en el nivel de su zona
  // los recalcule también a ellos. Solo afecta a su papel de rival: una
  // copia que el jugador llegue a poseer (ver Torre Batalla) sigue usando
  // fighterStats() en state.js, con la fórmula normal de nivel/rareza.
  if (def.fixedStats) {
    const m = extraMult || 1;
    return {
      maxHp: Math.round(def.fixedStats.hp * m),
      atk: Math.round(def.fixedStats.atk * m),
      def: Math.round(def.fixedStats.def * m),
      agi: Math.round(def.fixedStats.agi * m),
      wis: Math.round(def.fixedStats.wis * m),
    };
  }
  const w = CLASS_INFO[def.class].weights;
  const mult = rarityInfo(def.rarity).mult * levelGrowth(level) * (extraMult || 1);
  return {
    maxHp: Math.round(w.hp * mult * statVarianceMult(def.family, 'hp') * fighterStatMult(def, 'hp')),
    atk: Math.round(w.atk * mult * statVarianceMult(def.family, 'atk') * fighterStatMult(def, 'atk')),
    def: Math.round(w.def * mult * statVarianceMult(def.family, 'def') * fighterStatMult(def, 'def')),
    agi: Math.round(w.agi * mult * statVarianceMult(def.family, 'agi') * fighterStatMult(def, 'agi')),
    wis: Math.round(w.wis * mult * statVarianceMult(def.family, 'wis') * fighterStatMult(def, 'wis')),
  };
}

// Corrección de "aguante" SOLO para rivales, por clase — Campeón pesa
// mucho más HP/DEF en su fórmula de clase que Gurú/Brujo (CLASS_INFO:
// hp 145/def 22 de Campeón frente a hp 85/def 10 de Gurú, más del doble
// de DEF), y computeDamage no compensa esa diferencia.
//
// La primera pasada de este ajuste (0.8) se validó con una banda
// "invertida" de nivel medio (rareza raro, 3★, equipo raro Nv.5) y el
// efecto medido era real pero modesto — no explicaba el muro reportado en
// Llanura del Titán. Repitiendo la comparación con una banda como la que
// realmente reportó el problema (nivel 40, TODO legendario — personajes Y
// equipo Nv.15) el efecto es mucho más marcado: en una pareja de zonas de
// profundidad casi idéntica (Llanura del Titán, pool Gigante+Troll ambos
// Campeón, frente a Templo del Sol Eclipsado, pool Brujo+Gurú sin ningún
// Campeón), el daño medio recibido en un combate de 3 oleadas era ~4-6×
// mayor en Llanura sin corregir, y sigue siendo ~2× mayor incluso con el
// 0.8 ya aplicado — de ahí subir a 0.65. Es decir: el "muro" SÍ es un
// problema real de composición de clase, pero solo se hace evidente con
// una banda ya muy invertida (con una banda floja, todo pesa igual de
// duro y la diferencia por clase queda enmascarada — "efecto suelo"). Se
// toca solo HP/DEF (no ATK/AGI/WIS) para no aplanar la identidad de cada
// clase. Solo se usa aquí — makeUnit únicamente construye el lado 'enemy'
// (nunca 'player', ver todas las llamadas en este archivo), así que nunca
// toca las stats de un luchador que el jugador posea, ni las que se
// muestran en la Pokédex o Comparar (esas usan buildUnitStats
// directamente, no makeUnit).
const ENEMY_CLASS_TOUGHNESS_MULT = { campeon: 0.65 };
function enemyClassToughnessMult(cls) { return ENEMY_CLASS_TOUGHNESS_MULT[cls] || 1; }

function makeUnit(side, defId, level, extraMult, sourceUid) {
  const def = fighterDef(defId);
  const stats = buildUnitStats(defId, level, extraMult);
  if (!def.fixedStats) {
    const toughMult = enemyClassToughnessMult(def.class);
    stats.maxHp = Math.round(stats.maxHp * toughMult);
    stats.def = Math.round(stats.def * toughMult);
  }
  return {
    id: 'u' + (unitSeq++), side, defId, sourceUid: sourceUid || null,
    name: def.name, element: def.element, class: def.class, rarity: def.rarity,
    // powerMult: el extraMult con el que se generó (MOB_POWER_MULT/
    // lateZoneMult del camino, bossAdaptiveMult del jefe, etc.) — level se
    // queda en el nivel NOMINAL (capado en XP_LEVEL_CAP), así que sin este
    // campo la ficha de combate (UI.showBattleUnitStats) mostraba "Nv. 40"
    // sin ningún indicio del refuerzo real que ya llevan las stats.
    level, powerMult: extraMult || 1,
    maxHp: stats.maxHp, hp: stats.maxHp, atk: stats.atk, def: stats.def, agi: stats.agi, wis: stats.wis,
    skillId: def.skillId, ultCharge: 0, buffs: [], debuffs: [], dots: [], stunTurns: 0, alive: true,
  };
}

function makePlayerUnit(state, uid, level) {
  const entry = rosterEntry(state, uid);
  const def = fighterDef(entry.defId);
  const stats = fighterStats(state, entry);
  // Habilidad de líder de banda: si hay un luchador con leaderSkillId en el
  // centro de la Formación, TODA la banda recibe su bonificación en combate
  // (no solo quien la tiene) — no afecta a las stats mostradas en la ficha.
  const leader = activeLeaderSkill(state);
  if (leader) stats[leader.stat] = Math.round(stats[leader.stat] * (1 + leader.pct));
  return {
    id: 'u' + (unitSeq++), side: 'player', defId: entry.defId, sourceUid: uid,
    name: def.name, element: def.element, class: def.class, rarity: def.rarity,
    level: entry.level, maxHp: stats.hp, hp: stats.hp, atk: stats.atk, def: stats.def, agi: stats.agi, wis: stats.wis,
    skillId: def.skillId, ultCharge: 0, buffs: [], debuffs: [], dots: [], stunTurns: 0, alive: true,
  };
}

// Construye TODAS las combinaciones posibles del jugador: las 8 líneas
// (filas, columnas, diagonales) de la Formación 3×3 actual. Ya no hay
// preselección — en combate se elige, choque a choque, cualquiera de las
// líneas vivas (ver UI.showGroupPicker), no solo un subconjunto fijado antes.
// Un mismo luchador puede pertenecer a varias líneas a la vez (la celda
// central, por ejemplo, está en su fila, su columna y las 2 diagonales), así
// que se construye UN único objeto de combate por uid y se comparte entre
// todas las líneas que lo contienen — si se elige la fila y más tarde la
// columna que comparte esa celda, el daño/carga de ulti ya acumulados no se
// pierden ni se duplican.
function buildPlayerCombinations(state) {
  const unitByUid = {};
  state.band.flat().forEach(uid => { if (uid && !unitByUid[uid]) unitByUid[uid] = makePlayerUnit(state, uid); });
  return BAND_LINES.map(line => combinationFighterUids(state, line.id).map(uid => unitByUid[uid]));
}

// Un "jefe de zona" (nombre 3 del pool) es un único combate — sin oleadas
// previas de relleno — contra un único rival. Como pelea en solitario contra
// hasta 3 atacantes por ronda (desventaja numérica y de turnos: con su misma
// agilidad de base actuaría solo 1 vez por cada 3 del jugador), NO recibe
// ningún extra de ataque/agilidad/defensa por encima de lo normal para su
// nivel y rareza — solo más HP, para que el combate dure varias rondas en
// vez de acabar de un golpe. Si se le subiera también el ataque o la
// defensa (como se hacía antes) un solo Épico podía llegar a ganarle a una
// banda entera de Legendarios, que es justo lo que no tiene que pasar.
// `extraMult`, si se pasa, sí sube ataque/defensa/agilidad/sabiduría además
// del HP — solo lo usa el Duelo por apuesta (ver WAGER_BOSS_BOOST en ui.js)
// para que el revancha contra el jefe ya derrotado sea un reto de verdad en
// vez de un trámite, ya que en ese momento el jugador ya lo venció una vez.
function makeBossUnit(defId, level, extraMult) {
  const u = makeUnit('enemy', defId, level, extraMult);
  u.maxHp = Math.round(u.maxHp * 2.4);
  u.hp = u.maxHp;
  // Marca de jefe: habilita sus dos mecánicas exclusivas (ver
  // maybeTriggerEnrage y el "Golpe Devastador" en performTurn) — ningún
  // rival normal las tiene, solo afectan al camino de combate del jefe.
  u.isBoss = true;
  u.enraged = false;
  u.bossAtkCount = 0;
  return u;
}

// Cada fila devuelta aquí se planta como un nodo/encuentro separado del
// recorrido de la etapa (ver UI.renderStageRun). Las etapas normales nunca
// bajan de 2 oleadas y siempre presentan 3 rivales por oleada (aunque alguno
// sea de relleno más débil); el jefe de zona es la única pelea contra un
// único rival, sin oleadas previas.
//
// Los jefes se calibraron a fondo por simulación (ver el histórico de
// TODO.md) para dar un reto real pero siempre superable; el relleno de las
// etapas normales nunca pasó por ese mismo ajuste — usa la fórmula de
// rareza×nivel tal cual, la misma que un luchador del jugador de esa misma
// rareza/nivel. Como cada etapa encadena 2-3 oleadas SIN curación entre
// ellas (solo se cura al empezar una etapa nueva), un enfrentamiento
// "igualado" oleada a oleada se convertía en desgaste imposible: simulando
// miles de combates, un equipo a la altura de su zona perdía el 100% de
// las etapas normales en las zonas media/tardías, frente a un 0% contra el
// jefe de esa misma zona — justo lo contrario de lo que se espera de la
// curva de dificultad. MOB_POWER_MULT (afinado por la misma simulación,
// probando 0.65/0.72/0.78) devuelve el camino a un reto real pero
// superable (~26% de derrota en una muestra representativa de zonas) sin
// tocar los jefes, que ya estaban bien calibrados.
const MOB_POWER_MULT = 0.72;
function buildEnemyBand(zoneIdx, stageIdx, bossExtraMult) {
  const zone = ZONES[zoneIdx];
  const isBoss = stageIdx === STAGES_PER_ZONE - 1;
  // El nivel del rival depende SOLO de la zona (zoneEnemyLevel, data.js) —
  // todas las etapas de una misma zona pelean al mismo nivel, suba lo que
  // suba STAGES_PER_ZONE. La escalada es deliberadamente lenta (tope 40 no
  // se alcanza hasta la zona 28 de 33, ver el comentario de
  // LEVEL_CAP_ZONE_IDX en data.js) — lo que sí cambia según se avanza
  // DENTRO de una zona es cuántos rivales trae cada oleada (rowCount, más
  // abajo), no su nivel.
  const level = zoneEnemyLevel(zoneIdx);
  if (isBoss) {
    return { rows: [[makeBossUnit(zone.pool[2], level, bossExtraMult)]], isBoss, level };
  }
  // Rampa de nº de rivales dentro de la zona, adaptada a las 14 etapas de
  // mobs actuales (antes 7): las primeras 5 (un tercio) traen 2 filas, el
  // resto 3 — misma proporción que antes (3 de 7 con 3 filas).
  const rowCount = stageIdx < 5 ? 2 : 3;
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let i = 0; i < 3; i++) {
      const pick = zone.pool[Math.floor(Math.random() * Math.min(2, zone.pool.length))];
      row.push(makeUnit('enemy', pick, level, MOB_POWER_MULT * lateZoneMult(zoneIdx)));
    }
    rows.push(row);
  }
  return { rows, isBoss, level };
}

// Oleadas de un nivel de la Torre Batalla (ver TORRE_LEVELS en data.js):
// siempre el mismo rival del nivel, repetido level.enemyCount veces. Los
// mobs llegan en filas de hasta 3 simultáneos, como una oleada normal; los
// jefes SIEMPRE en solitario, en oleadas sucesivas — un jefe nunca debe
// recibir compañía (ver el comentario de makeBossUnit más arriba).
//
// bossExtraMult (solo para level.kind === 'boss'): sus fixedStats son las
// mismas con las que ese jefe pelea en su zona de origen del Mapa,
// calibradas para un jugador "a la par" de ESA zona — pero aquí, como gran
// final de partida, los pelea un jugador que YA terminó el mapa entero, así
// que un jefe de zona temprana (p.ej. el de la 1ª zona) se quedaba
// trivial (~1 de daño recibido en pruebas). Se le pasa
// bossAdaptiveMult(state, level.originZoneIdx) — el MISMO mecanismo ya
// calibrado para el jefe de Mapa — así un jefe de zona temprana, medido
// contra la banda real (de nivel endgame) del jugador, sube hasta su
// techo; uno de zona tardía, cuya referencia ya está cerca del ritmo
// endgame, apenas cambia (ya era un reto real sin tocarlo, ver TODO.md).
function buildTorreEncounters(level, bossExtraMult) {
  const perRow = level.kind === 'boss' ? 1 : 3;
  const rows = [];
  let remaining = level.enemyCount;
  while (remaining > 0) {
    const count = Math.min(perRow, remaining);
    const row = [];
    for (let i = 0; i < count; i++) {
      row.push(level.kind === 'boss' ? makeBossUnit(level.fightDefId, level.enemyLevel, bossExtraMult) : makeUnit('enemy', level.fightDefId, level.enemyLevel));
    }
    rows.push(row);
    remaining -= count;
  }
  return rows;
}

// Oleadas de un nivel de Tope de Tier (ver TIER_CAP_LEVELS en data.js): el
// rival se saca del MISMO filtro rareza/elemento/clase que se le exige al
// jugador (ver formationMeetsConstraint en state.js) — así el combate
// queda "en igualdad de condiciones" dentro de esa restricción, en vez de
// ser un muro fijo sin relación con lo que se le permite traer al
// jugador. Nivel y nº de rivales crecen suavemente con la posición en la
// escalera (idx), igual que el resto de escaleras de Retos.
function buildTierCapEncounters(level, idx) {
  const pool = FIGHTERS.filter(f => rarityIndex(f.rarity) <= rarityIndex(level.constraint.rarityMax)
    && (!level.constraint.element || f.element === level.constraint.element)
    && (!level.constraint.class || f.class === level.constraint.class));
  const enemyLevel = Math.min(XP_LEVEL_CAP, 6 + idx * 3);
  const rowCount = idx < 5 ? 1 : (idx < 10 ? 2 : 3);
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let i = 0; i < 3; i++) {
      const def = pool[Math.floor(Math.random() * pool.length)];
      row.push(makeUnit('enemy', def.id, enemyLevel));
    }
    rows.push(row);
  }
  return rows;
}

// Trial de familia de Tope de Tier — Fase 2 (ver FAMILY_TRIALS en
// data.js): UNA sola oleada (a diferencia de todo lo demás en Retos, que
// encadena varias), con un "guardián" de la MISMA rareza tope que la
// familia puesta a prueba — ni un trámite ni un muro injusto — y más
// compañía cuanto más alto su tier (1/2/3 rivales).
function buildFamilyTrialEncounter(trial) {
  const pool = FIGHTERS.filter(f => f.rarity === trial.maxRarity);
  const level = Math.min(XP_LEVEL_CAP, 8 + trial.tier * 10);
  const row = [];
  for (let i = 0; i < trial.tier; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level));
  }
  return row;
}

// Equipo mono-elemento elegido para una Mazmorra Elemental (ver
// UI.openElementalTeamPicker) — hasta 3 uids, sin las 8 líneas de la
// Formación normal porque aquí solo hay un grupo posible.
function buildElementalTeamUnits(state, elementId) {
  return elementalTeamUids(state, elementId).map(uid => makePlayerUnit(state, uid));
}

// Oleadas de una Mazmorra Elemental (ver ELEMENTAL_DUNGEONS en data.js):
// 2 oleadas de relleno (3 copias de la forma más fuerte de cada una de 2
// familias de MOBS del elemento que contrarresta al elegido) + un
// Guardián Elemental final en solitario (mismo patrón que un jefe de
// zona, ver makeBossUnit).
function buildElementalDungeonEncounters(elementId) {
  const dungeon = ELEMENTAL_DUNGEONS[elementId];
  const level = elementalDungeonLevel();
  const rows = dungeon.waveDefIds.map(defId => [0, 1, 2].map(() => makeUnit('enemy', defId, level)));
  rows.push([makeBossUnit(dungeon.guardianDefId, level)]);
  return rows;
}

// --- Recompensas del Mapa: escaladas por ZONA, no por etapa ---
// Texel/XP/Pixite de limpiar una zona entera una vez (todas sus etapas de
// mobs + el jefe) se fijan aquí en función de zoneIdx SOLO — stageRewards
// reparte ese total entre las MOB_STAGES_PER_ZONE etapas de mobs (a partes
// iguales, todas "flojas") + una porción aparte para el jefe. Así, subir
// STAGES_PER_ZONE reparte el mismo total en trozos más finos sin cambiar
// cuánto da limpiar la zona, ni acelerar la escalada de nivel (que ya no
// depende de esto en absoluto, ver zoneEnemyLevel en data.js).
const MOB_STAGES_PER_ZONE = STAGES_PER_ZONE - 1;
// Calibrado (ver TODO.md) para que la XP acumulada de un jugador NATURAL
// (sin grindear, una sola pasada) alcance el total necesario para Nv.40
// justo sobre LEVEL_CAP_ZONE_IDX (zona 28) — el mismo objetivo que antes
// se perseguía bajando fighterXpToNext, ahora conseguido por el lado de
// la recompensa en vez del coste.
function zoneTexelTotal(zoneIdx) { return 540 + zoneIdx * 640; }
function zoneXpTotal(zoneIdx) { return 40 + zoneIdx * 190; }
// Pixite total de una zona NO escala con zoneIdx (a diferencia de Texel/
// XP) — es la "moneda de invocación", no un indicador de poder, así que
// no hay motivo de diseño para que una zona temprana dé menos que una
// tardía. Se mantiene igual al total medio que ya daba la ronda de
// cambios anterior (~94/zona con 8 etapas) para no re-litigar otra vez el
// ritmo de Superfusión ya validado, solo repartirlo en trozos más finos
// (14 etapas de mobs en vez de 7 → ~6.8 de media por etapa en vez de
// ~12.8, ya no "un pufo de 15-20 cristales de golpe").
const ZONE_PIXITE_TOTAL = 95;
const MOB_STAGE_PIXITE_VARIANCE = 2; // +-2 sobre la media, entero

function elementalDungeonRewards(isFirstClear) {
  const zoneIdx = ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID);
  // Más generoso que el jefe de esa misma zona (×3.5/×3 en vez de la
  // porción normal de jefe) — la desventaja elemental de partida contra
  // el Guardián hace que el reto sea mayor.
  const texel = Math.round(zoneTexelTotal(zoneIdx) * 0.35 * 3.5);
  const fighterXp = Math.round(zoneXpTotal(zoneIdx) * 0.30 * 3);
  const drops = { voxite: 0, doxite: 0, gear: generateGear(randomGearSlot(), gearDropRarity(zoneIdx, isFirstClear)) };
  if (isFirstClear) {
    drops.voxite = 1;
    if (Math.random() < 0.4) drops.doxite = 1;
  } else {
    if (Math.random() < 0.25) drops.voxite = 1;
    if (Math.random() < 0.08) drops.doxite = 1;
  }
  return { texel, fighterXp, drops };
}

// `isFirstClear` (solo importa para jefes): el Voxite garantizado + 30% de
// Doxite extra es la recompensa de VENCER a este jefe por primera vez, no
// de pelear contra él — sin este control, rejugar el jefe más fácil del
// Mapa (un solo enemigo, trivial con Auto + velocidad 3×) daba cristales
// caros gratis sin límite y rompía la escasez del gacha. Las repeticiones
// (rejugar la etapa, o el Duelo por apuesta) usan en su lugar una
// probabilidad baja, del mismo orden que una etapa normal.
function stageRewards(zoneIdx, stageIdx, isBoss, isFirstClear) {
  const zTexel = zoneTexelTotal(zoneIdx), zXp = zoneXpTotal(zoneIdx);
  // El jefe (una sola oleada) se lleva una porción fija del total de la
  // zona (35% Texel / 30% XP) — el resto se reparte a partes iguales
  // entre las MOB_STAGES_PER_ZONE etapas de mobs. En repetición el jefe
  // baja a ~0.5-0.6× ese reparto (sigue pagando algo más que una etapa
  // normal, un jefe sigue siendo un combate más duro, pero ya no de forma
  // desproporcionada — mismo criterio que antes de esta ronda de cambios).
  const drops = { pixite: 0, voxite: 0, doxite: 0, gear: null };
  let texel, fighterXp;
  if (isBoss) {
    const texelMult = isFirstClear ? 1 : 0.5;
    const xpMult = isFirstClear ? 1 : 0.6;
    texel = Math.round(zTexel * 0.35 * texelMult);
    fighterXp = Math.round(zXp * 0.30 * xpMult);
    if (isFirstClear) {
      drops.voxite = 1;
      if (Math.random() < 0.3) drops.doxite = 1;
    } else {
      // Superfusión necesita ~21 copias EXACTAS del mismo personaje —
      // Voxite/Doxite (los cristales de los que depende un duplicado de
      // Épico/Legendario, los que de verdad importan para invertir en un
      // luchador concreto tipo Odín) casi no existían en repetición
      // (3%/1%) — un jugador podía terminar el mapa entero sin conseguir
      // NINGUNA superfusión real (reportado directamente: llegar a la
      // zona 22 con 0). Subido a Pixite garantizado (3-6) + 25%/8%.
      drops.pixite = 3 + Math.floor(Math.random() * 4);
      if (Math.random() < 0.25) drops.voxite = 1;
      if (Math.random() < 0.08) drops.doxite = 1;
    }
    // Igual que el cristal: el 70% de probabilidad de equipo es el premio
    // de vencer al jefe por primera vez. Repetirlo lo bajaba a una tabla de
    // rareza floja (ver gearDropRarity) pero seguía dando equipo el 70% de
    // las veces — con un jefe fácil de repetir en segundos (Auto +
    // velocidad 3×), eso seguía siendo mucho volumen de piezas, aunque
    // fueran de rareza baja. En la repetición baja también la probabilidad
    // misma de que caiga algo, a un 8%.
    const bossGearChance = isFirstClear ? 0.7 : 0.08;
    if (Math.random() < bossGearChance) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx, isFirstClear));
  } else {
    texel = Math.round(zTexel * 0.65 / MOB_STAGES_PER_ZONE);
    fighterXp = Math.round(zXp * 0.70 / MOB_STAGES_PER_ZONE);
    const pixiteAvg = ZONE_PIXITE_TOTAL / MOB_STAGES_PER_ZONE;
    const v = MOB_STAGE_PIXITE_VARIANCE;
    drops.pixite = Math.max(0, Math.round(pixiteAvg) - v + Math.floor(Math.random() * (2 * v + 1)));
    if (Math.random() < 0.05) drops.voxite = 1;
    if (Math.random() < 0.01) drops.doxite = 1;
    if (Math.random() < 0.3) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx));
  }
  return { texel, fighterXp, drops };
}

// La rareza del equipo que sueltan los jefes sube con `zoneIdx` SIN TECHO
// — bien como recompensa de la primera vez que se vence a un jefe (cuanto
// más avanzada la zona, mejor el premio), pero roto si se puede repetir
// sin límite. `isFirstClear` (ver stageRewards) evita esto en las
// repeticiones usando una tabla FIJA, la misma en cualquier zona, sin el
// bonus de `zoneIdx` — solo se pasa `false` explícitamente desde jefes; el
// resto de llamadas (etapas normales, Mazmorra Elemental) no cambia.
// Coeficiente 0.08 (antes 0.01 sobre globalIdx 0-263, máximo ~2.63) para
// dar un máximo similar sobre zoneIdx 0-32 (máx. ~2.56).
function gearDropRarity(zoneIdx, isFirstClear) {
  const roll = isFirstClear === false ? Math.random() : Math.random() + zoneIdx * 0.08;
  if (roll > 0.97) return 'legendario';
  if (roll > 0.85) return 'epico';
  if (roll > 0.55) return 'raro';
  if (roll > 0.25) return 'infrecuente';
  return 'comun';
}

function buildArenaBand(rank) {
  const level = Math.max(1, Math.round(rank * 1.8));
  const legendaryChance = Math.min(0.35, rank * 0.015);
  const epicChance = Math.min(0.35, rank * 0.02);
  const rows = [[], [], []];
  for (let r = 0; r < 3; r++) {
    const row = [];
    const count = r === 0 ? 3 : (r === 1 ? (rank > 5 ? 3 : 2) : (rank > 12 ? 3 : (rank > 6 ? 2 : 0)));
    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      const pool = roll < legendaryChance
        ? FIGHTERS.filter(f => f.rarity === 'legendario')
        : roll < legendaryChance + epicChance
          ? FIGHTERS.filter(f => f.rarity === 'epico')
          : FIGHTERS.filter(f => f.rarity === 'comun' || f.rarity === 'infrecuente' || f.rarity === 'raro');
      const def = pool[Math.floor(Math.random() * pool.length)];
      row.push(makeUnit('enemy', def.id, level));
    }
    rows[r] = row;
  }
  return { rows, level };
}

// Campeón de liga (ver ARENA_LEAGUES en data.js): al explorar rival justo
// en el rango de entrada a una liga con campeón asignado, en vez de una
// banda aleatoria de hasta 3 se enfrenta EN SOLITARIO a un Legendario fijo
// y siempre el mismo para esa liga — un hito reconocible en vez de un
// rival genérico más. Mismo nivel que tocaría por rango (buildArenaBand),
// con un extraMult fijo para que un solo rival compense no traer compañía
// (mismo mecanismo que WAGER_BOSS_BOOST, ver ui.js).
const ARENA_CHAMPION_BOOST = 1.3;
function buildArenaChampionEncounter(rank, league) {
  const level = Math.max(1, Math.round(rank * 1.8));
  return { rows: [[makeUnit('enemy', league.championDefId, level, ARENA_CHAMPION_BOOST)]], level };
}

// Prueba del Campeón: un único rival por duelo, cada vez más fuerte según
// cuántos duelos seguidos se lleven ganados — mismo patrón de rareza
// creciente que buildArenaBand, pero con un solo enemigo en vez de una
// banda entera (es un duelo 1 contra 1).
function buildChampionOpponent(duelIdx) {
  const level = Math.min(XP_LEVEL_CAP, Math.max(1, 1 + Math.round(duelIdx * 1.5)));
  const legendaryChance = Math.min(0.4, duelIdx * 0.02);
  const epicChance = Math.min(0.3, duelIdx * 0.02);
  const roll = Math.random();
  const pool = roll < legendaryChance
    ? FIGHTERS.filter(f => f.rarity === 'legendario')
    : roll < legendaryChance + epicChance
      ? FIGHTERS.filter(f => f.rarity === 'epico')
      : FIGHTERS.filter(f => f.rarity === 'comun' || f.rarity === 'infrecuente' || f.rarity === 'raro');
  const def = pool[Math.floor(Math.random() * pool.length)];
  return makeUnit('enemy', def.id, level);
}
function championDuelRewards(duelIdx) {
  return { texel: Math.round(30 + duelIdx * 10), fighterXp: Math.round(20 + duelIdx * 8) };
}

// ---------- Roguelike (Retos) ----------
// Rival de una ronda: mismo patrón de rareza creciente que buildArenaBand/
// buildChampionOpponent (nivel y rareza sin techo — es survival, la gracia
// es ver hasta dónde se llega), pero como fila de hasta 3 a la vez (no 1
// contra 1 como la Prueba del Campeón) para que la Formación completa y sus
// 8 líneas también importen aquí. El número de rivales por ronda crece
// igual que el nº de oleadas de una etapa avanzada del Mapa.
function buildRoguelikeEnemyRow(round) {
  const level = Math.max(1, Math.round(round * 2));
  const legendaryChance = Math.min(0.4, round * 0.02);
  const epicChance = Math.min(0.3, round * 0.025);
  const count = round < 3 ? 1 : (round < 6 ? 2 : 3);
  const row = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const pool = roll < legendaryChance
      ? FIGHTERS.filter(f => f.rarity === 'legendario')
      : roll < legendaryChance + epicChance
        ? FIGHTERS.filter(f => f.rarity === 'epico')
        : FIGHTERS.filter(f => f.rarity === 'comun' || f.rarity === 'infrecuente' || f.rarity === 'raro');
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level));
  }
  return row;
}
function roguelikeRoundRewards(round) {
  return { texel: Math.round(35 + round * 9), fighterXp: Math.round(18 + round * 6) };
}

// Bonos elegidos entre ronda y ronda (ver UI.openRoguelikeBoonPicker) —
// porcentajes ACUMULADOS de toda la run (no por ronda), aplicados de cero
// cada vez sobre las stats ya recalculadas de ese luchador (fighterStats),
// así que nunca se componen entre sí (dos bonos de +15% ataque dan +30%
// total, no +32,25%). El de vida también reescala el HP actual en la misma
// proporción para no perder ni ganar % de vida restante solo por subir el
// bono a mitad de combate.
const ROGUELIKE_BOONS = [
  { id: 'atk', icon: '⚔️', label: '+15% Ataque', stat: 'atk', pct: 0.15 },
  { id: 'def', icon: '🛡️', label: '+15% Defensa', stat: 'def', pct: 0.15 },
  { id: 'hp', icon: '❤️', label: '+20% Vida máxima', stat: 'hp', pct: 0.20 },
  { id: 'agi', icon: '💨', label: '+15% Agilidad', stat: 'agi', pct: 0.15 },
  { id: 'wis', icon: '🧠', label: '+15% Sabiduría', stat: 'wis', pct: 0.15 },
  { id: 'heal', icon: '💚', label: 'Cura al 50% a toda la banda y revive a un caído', instant: true },
  { id: 'ult', icon: '⚡', label: 'Ulti lista para todos en la próxima ronda', instant: true },
];
function applyRoguelikeBuffs(u, buffs) {
  if (!buffs) return;
  ['atk', 'def', 'agi', 'wis'].forEach(k => { if (buffs[k]) u[k] = Math.round(u[k] * (1 + buffs[k])); });
  if (buffs.hp) {
    const pctLeft = u.hp / u.maxHp;
    u.maxHp = Math.round(u.maxHp * (1 + buffs.hp));
    u.hp = Math.round(u.maxHp * pctLeft);
  }
}

// --- Motor de turnos ---
function elementDamageMult(a, d) { return elementMultiplier(a, d); }

// Ventaja elemental media de un luchador contra los rivales vivos de la
// fila enemiga activa — 1.0 = neutro, >1 = ventaja, <1 = desventaja (mismos
// umbrales que elementMultiplier: ±25%/-20%). Usado por el aviso visual
// (▲/▼) del selector manual de línea.
function unitElementScore(unit, enemyRow) {
  const aliveEnemy = enemyRow.filter(u => u.alive);
  if (!aliveEnemy.length) return 1;
  return aliveEnemy.reduce((sum, e) => sum + elementMultiplier(unit.element, e.element), 0) / aliveEnemy.length;
}

// Daño total estimado que causaría esta línea contra la fila enemiga activa
// en un choque: la misma fórmula simplificada de computeDamage (ataque menos
// mitad de la defensa rival media, con la ventaja elemental de cada
// atacante ya aplicada) sumada para cada superviviente de la línea, sin
// crítico ni varianza — solo sirve para comparar líneas entre sí, nunca
// para aplicar daño real. La usa el combate automático (ver pickAutoGroup
// en ui.js) para elegir siempre la línea que más daño le hace al rival.
function rowDamageScore(row, enemyRow) {
  const aliveRow = row.filter(u => u.alive);
  const aliveEnemy = enemyRow.filter(u => u.alive);
  if (!aliveRow.length || !aliveEnemy.length) return 0;
  const avgDef = aliveEnemy.reduce((sum, e) => sum + e.def, 0) / aliveEnemy.length;
  return aliveRow.reduce((sum, u) => sum + Math.max(1, u.atk - avgDef * 0.5) * unitElementScore(u, enemyRow), 0);
}

function pickTarget(row) {
  const alive = row.filter(u => u.alive);
  if (alive.length === 0) return null;
  if (Math.random() < 0.7) {
    return alive.reduce((min, u) => (u.hp < min.hp ? u : min), alive[0]);
  }
  return alive[Math.floor(Math.random() * alive.length)];
}

const ULT_CHARGE_MAX = 100;
const ULT_CHARGE_ON_HIT = 9;

// Furia de jefe: la única mecánica propia de los BOSSES (ver makeBossUnit),
// que si no son mecánicamente idénticos a cualquier otro rival de su clase.
// Al caer por debajo del 30% de su vida, gana +25% de Ataque y Sabiduría
// para el resto del combate — un único disparo (target.enraged evita que
// se repita). Deliberadamente MODESTO y TARDÍO (con el ×2.4 de vida de
// makeBossUnit, un jefe tarda varias rondas en llegar ahí): la razón por
// la que un jefe NO recibe bonus de ataque/defensa desde el principio (ver
// el comentario de makeBossUnit) sigue aplicando — esto no la contradice,
// solo añade un "segundo aliento" tardío y siempre igual de moderado.
const BOSS_ENRAGE_HP_PCT = 0.3;
const BOSS_ENRAGE_MULT = 1.25;
function maybeTriggerEnrage(log, target) {
  if (!target.isBoss || target.enraged || !target.alive) return;
  if (target.hp / target.maxHp > BOSS_ENRAGE_HP_PCT) return;
  target.enraged = true;
  target.atk = Math.round(target.atk * BOSS_ENRAGE_MULT);
  target.wis = Math.round(target.wis * BOSS_ENRAGE_MULT);
  log.push({ type: 'enrage', unitId: target.id });
}

function applyDamage(log, attacker, target, rawAmount, isCrit, label) {
  const before = target.hp;
  target.hp = Math.max(0, target.hp - rawAmount);
  log.push({ type: 'attack', attackerId: attacker.id, targetId: target.id, amount: rawAmount, isCrit, label });
  if (before > 0 && target.hp <= 0) {
    target.alive = false;
    log.push({ type: 'faint', unitId: target.id, side: target.side, killerId: attacker.id });
  } else if (target.alive) {
    target.ultCharge = Math.min(ULT_CHARGE_MAX, target.ultCharge + ULT_CHARGE_ON_HIT);
    log.push({ type: 'charge', unitId: target.id, value: target.ultCharge });
    maybeTriggerEnrage(log, target);
  }
}

// Vulnerabilidad de tipo/tribu (ver TYPE_VULNERABILITY en data.js): daño
// extra según si el ataque es "mágico" (useWis) o "físico", y la clase del
// que lo recibe. Independiente del multiplicador de elemento.
function typeVulnerabilityMult(targetClass, useWis) {
  const vuln = TYPE_VULNERABILITY[targetClass];
  if (!vuln) return 1;
  return 1 + (useWis ? (vuln.magic || 0) : (vuln.physical || 0));
}

function computeDamage(attacker, target, mult, useWis, forceCrit) {
  const power = useWis ? attacker.wis : attacker.atk;
  const atkBuff = attacker.buffs.find(b => b.stat === 'atk');
  const power2 = power * (1 + (atkBuff ? atkBuff.pct : 0));
  const defDebuff = target.debuffs.find(b => b.stat === 'def');
  const defBuff = target.buffs.find(b => b.stat === 'def');
  let defVal = target.def * (1 + (defBuff ? defBuff.pct : 0)) * (1 - (defDebuff ? defDebuff.pct : 0));
  const base = Math.max(1, power2 - defVal * 0.5);
  const elMult = elementDamageMult(attacker.element, target.element);
  const vulnMult = typeVulnerabilityMult(target.class, useWis);
  const variance = 0.9 + Math.random() * 0.2;
  const critChance = Math.min(40, 5 + attacker.agi * 0.15);
  const isCrit = forceCrit || Math.random() * 100 < critChance;
  const dmg = base * elMult * vulnMult * mult * variance * (isCrit ? 1.5 : 1);
  return { amount: Math.max(1, Math.round(dmg)), isCrit };
}

// Las ultis que no son de daño puro (curar, buffs, debilitar, aturdir,
// purificar, revivir) también deben golpear al rival — ningún turno de
// ulti debe quedarse sin hacer daño. `existingTarget` reutiliza el mismo
// objetivo que el efecto propio de la ulti ya eligió (debilitar/aturdir),
// para que el golpe caiga sobre quien recibió el efecto; el resto elige
// uno nuevo con pickTarget.
function applyUltBonusHit(log, unit, enemyRow, skill, existingTarget) {
  if (!skill.bonusHitMult) return;
  const target = (existingTarget && existingTarget.alive) ? existingTarget : pickTarget(enemyRow);
  if (!target) return;
  const { amount, isCrit } = computeDamage(unit, target, skill.bonusHitMult, !!skill.usesWis);
  applyDamage(log, unit, target, amount, isCrit, skill.name);
}

// Cuánto escala la curación con el WIS de quien cura (curar/bendicion,
// las dos únicas ultis de curación, ya marcadas usesWis en SKILL_TYPES) —
// antes el importe curado dependía solo del maxHp de a quien se cura, así
// que el WIS de un Gurú no tenía ningún efecto ni siquiera en su propio
// ulti de firma. +0.1% de curación extra por punto de WIS: un Gurú tope
// (WIS ~800) casi duplica lo que cura respecto a alguien con WIS bajo.
function healWisMult(healer, skill) {
  return skill.usesWis ? 1 + healer.wis * 0.001 : 1;
}

function tickTimers(unit, log) {
  unit.buffs = unit.buffs.filter(b => --b.turnsLeft > 0);
  unit.debuffs = unit.debuffs.filter(b => --b.turnsLeft > 0);
  if (unit.dots && unit.dots.length) {
    unit.dots.forEach(d => {
      if (!unit.alive) return;
      const before = unit.hp;
      unit.hp = Math.max(0, unit.hp - d.amount);
      log.push({ type: 'dot', unitId: unit.id, amount: d.amount, label: d.label });
      if (before > 0 && unit.hp <= 0) { unit.alive = false; log.push({ type: 'faint', unitId: unit.id, side: unit.side }); }
      else maybeTriggerEnrage(log, unit);
      d.turnsLeft--;
    });
    unit.dots = unit.dots.filter(d => d.turnsLeft > 0);
  }
}

function performTurn(log, unit, ownRow, enemyRow) {
  if (!unit.alive) return;
  if (unit.stunTurns > 0) {
    unit.stunTurns--;
    log.push({ type: 'stunned', unitId: unit.id });
    return;
  }
  const skill = SKILL_TYPES[unit.skillId];
  const useUlt = unit.ultCharge >= ULT_CHARGE_MAX;

  if (!useUlt) {
    const target = pickTarget(enemyRow);
    if (!target) return;
    // Golpe Devastador: la segunda mecánica exclusiva de jefe (ver
    // makeBossUnit) — cada 4º golpe básico de un jefe es un crítico
    // garantizado y algo más fuerte (×1.6 en vez de ×1), para dar un
    // ritmo reconocible al combate sin tocar su daño medio el resto de
    // golpes (que siguen siendo el ataque normal de siempre).
    const isDevastador = unit.isBoss && (unit.bossAtkCount = (unit.bossAtkCount || 0) + 1) % 4 === 0;
    if (isDevastador) log.push({ type: 'bossattack', unitId: unit.id });
    const { amount, isCrit } = computeDamage(unit, target, isDevastador ? 1.6 : 1.0, false, isDevastador);
    applyDamage(log, unit, target, amount, isCrit, null);
    if (unit.alive) {
      const gain = Math.round(22 + unit.agi * 0.4);
      unit.ultCharge = Math.min(ULT_CHARGE_MAX, unit.ultCharge + gain);
      log.push({ type: 'charge', unitId: unit.id, value: unit.ultCharge });
    }
    return;
  }

  unit.ultCharge = 0;
  log.push({ type: 'ult', unitId: unit.id, skillName: skill.name });
  switch (skill.kind) {
    case 'damage': {
      const target = pickTarget(enemyRow);
      if (!target) break;
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      if (skill.selfBuff) { unit.buffs.push({ stat: skill.selfBuff.stat, pct: skill.selfBuff.pct, turnsLeft: skill.selfBuff.turns }); log.push({ type: 'buff', unitId: unit.id, stat: skill.selfBuff.stat, pct: skill.selfBuff.pct }); }
      break;
    }
    case 'damageRow': {
      enemyRow.filter(u => u.alive).forEach(target => {
        const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
        applyDamage(log, unit, target, amount, isCrit, skill.name);
      });
      break;
    }
    case 'heal': {
      const amount = Math.round(unit.maxHp * skill.pct * healWisMult(unit, skill));
      unit.hp = Math.min(unit.maxHp, unit.hp + amount);
      log.push({ type: 'heal', unitId: unit.id, targetId: unit.id, amount });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'healRow': {
      const wisMult = healWisMult(unit, skill);
      ownRow.filter(u => u.alive).forEach(ally => {
        const amount = Math.round(ally.maxHp * skill.pct * wisMult);
        ally.hp = Math.min(ally.maxHp, ally.hp + amount);
        log.push({ type: 'heal', unitId: unit.id, targetId: ally.id, amount });
      });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'buffSelf': {
      unit.buffs.push({ stat: skill.stat, pct: skill.pct, turnsLeft: skill.turns });
      log.push({ type: 'buff', unitId: unit.id, stat: skill.stat, pct: skill.pct });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'buffRow': {
      ownRow.filter(u => u.alive).forEach(ally => {
        ally.buffs.push({ stat: skill.stat, pct: skill.pct, turnsLeft: skill.turns });
        log.push({ type: 'buff', unitId: ally.id, stat: skill.stat, pct: skill.pct });
      });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'debuff': {
      const target = pickTarget(enemyRow);
      if (!target) break;
      target.debuffs.push({ stat: skill.stat, pct: skill.pct, turnsLeft: skill.turns });
      log.push({ type: 'debuff', unitId: unit.id, targetId: target.id, stat: skill.stat, pct: skill.pct });
      applyUltBonusHit(log, unit, enemyRow, skill, target);
      break;
    }
    case 'stun': {
      const target = pickTarget(enemyRow);
      if (!target) break;
      const success = Math.random() < skill.chance;
      if (success) target.stunTurns = (target.stunTurns || 0) + skill.turns;
      log.push({ type: 'stunattempt', unitId: unit.id, targetId: target.id, success });
      applyUltBonusHit(log, unit, enemyRow, skill, target);
      break;
    }
    case 'dot': {
      // Daño instantáneo más flojo que golpear, pero deja un veneno/quemadura
      // que sigue mordiendo varios turnos — bueno contra objetivos que curan
      // o se escudan, porque el DoT ignora defensa y buffs por completo.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      if (target.alive) {
        const tick = Math.max(1, Math.round(target.maxHp * skill.dotPct));
        target.dots.push({ amount: tick, turnsLeft: skill.dotTurns, label: skill.name });
      }
      break;
    }
    case 'drain': {
      // Golpea y se cura una parte del daño hecho — el único ulti que sube
      // la vida propia sin depender de estar ileso, bueno para aguantar.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      const healAmount = Math.round(amount * skill.drainPct);
      unit.hp = Math.min(unit.maxHp, unit.hp + healAmount);
      log.push({ type: 'heal', unitId: unit.id, targetId: unit.id, amount: healAmount });
      break;
    }
    case 'cleanse': {
      // Quita todos los debuffs y el aturdimiento de toda su fila — el único
      // ulti pensado como respuesta directa a debilitar/aturdir/veneno
      // rivales en vez de hacer daño o curar vida.
      ownRow.filter(u => u.alive).forEach(ally => {
        const hadSomething = ally.debuffs.length > 0 || ally.stunTurns > 0 || ally.dots.length > 0;
        ally.debuffs = [];
        ally.dots = [];
        ally.stunTurns = 0;
        if (hadSomething) log.push({ type: 'cleanse', unitId: ally.id });
      });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'revive': {
      // Revive a un aliado caído de su propia fila con parte de su vida
      // máxima — si no hay ninguno caído, no revive a nadie este turno,
      // pero el golpe extra (bonusHitMult) se aplica igual: un turno de
      // ulti nunca se queda sin hacer daño.
      const fallen = ownRow.find(u => !u.alive);
      if (fallen) {
        fallen.alive = true;
        fallen.hp = Math.round(fallen.maxHp * skill.pct);
        fallen.buffs = []; fallen.debuffs = []; fallen.dots = []; fallen.stunTurns = 0;
        log.push({ type: 'revive', unitId: unit.id, targetId: fallen.id, amount: fallen.hp });
      }
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
  }
}

function rowAlive(row) { return row.some(u => u.alive); }

// Resuelve UNA ronda del choque entre tu combinación elegida y la fila activa
// del rival: cada luchador vivo de ambos bandos actúa exactamente una vez
// (no se repite hasta que un bando caiga). Si tras la ronda el enemigo sigue
// en pie, es la UI quien decide si toca elegir otra combinación o, si ya se
// usaron las 3, volver a elegir entre ellas otra vez.
function simulateOneRound(playerRow, enemyRow) {
  const log = [];
  const order = [...playerRow, ...enemyRow].filter(u => u.alive).sort((a, b) => b.agi - a.agi || Math.random() - 0.5);
  for (const unit of order) {
    if (!unit.alive) continue;
    tickTimers(unit, log);
    const ownRow = unit.side === 'player' ? playerRow : enemyRow;
    const foeRow = unit.side === 'player' ? enemyRow : playerRow;
    if (!rowAlive(ownRow) || !rowAlive(foeRow)) break;
    performTurn(log, unit, ownRow, foeRow);
    if (!rowAlive(playerRow) || !rowAlive(enemyRow)) break;
  }
  const result = !rowAlive(enemyRow) ? 'enemigo_derrotado' : !rowAlive(playerRow) ? 'combo_derrotada' : 'continua';
  log.push({ type: 'round_end', result });
  return { log, result };
}

// Turnos estimados hasta que un luchador dispare su ulti, asumiendo que solo
// gana carga atacando en sus propios turnos (ignora la carga extra por
// recibir golpes, que depende del rival). Solo para mostrarlo en la UI.
function estimatedTurnsToUlt(unit) {
  if (unit.ultCharge >= ULT_CHARGE_MAX) return 0;
  const gainPerTurn = Math.round(22 + unit.agi * 0.4);
  return Math.max(1, Math.ceil((ULT_CHARGE_MAX - unit.ultCharge) / gainPerTurn));
}
