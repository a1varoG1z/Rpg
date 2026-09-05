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
    // extraMult admite un número (multiplica las 5 stats por igual, el uso
    // de siempre — bossAdaptiveMult del Mapa, WAGER_BOSS_BOOST) o un objeto
    // { off, def } (solo lo usa torreBossMult, ver más abajo): `off` sube
    // ATK/WIS — lo que decide si un golpe hace daño de verdad, ver
    // computeDamage (dmg = ATK − DEF_rival×0.5) — y `def` sube HP/DEF/AGI
    // por separado, con un techo más bajo, para poder corregir un jefe de
    // ATK nativo muy bajo sin dispararle también la vida/defensa/agilidad
    // (que solo alargan el combate y disparan la prob. de crítico vía AGI,
    // sin hacerlo más peligroso de verdad) al mismo ritmo.
    const off = (extraMult && typeof extraMult === 'object') ? (extraMult.off || 1) : (extraMult || 1);
    const dfn = (extraMult && typeof extraMult === 'object') ? (extraMult.def || 1) : (extraMult || 1);
    return {
      maxHp: Math.round(def.fixedStats.hp * dfn),
      atk: Math.round(def.fixedStats.atk * off),
      def: Math.round(def.fixedStats.def * dfn),
      agi: Math.round(def.fixedStats.agi * dfn),
      wis: Math.round(def.fixedStats.wis * off),
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
    // extraMult puede ser un objeto { off, def } (ver buildUnitStats,
    // solo lo usa torreBossMult) — se muestra `off` (el que decide si de
    // verdad pega fuerte) en vez de "[object Object]".
    level, powerMult: (extraMult && typeof extraMult === 'object') ? (extraMult.off || 1) : (extraMult || 1),
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
// rareza/nivel. Como cada etapa encadena varias oleadas SIN curación entre
// ellas (solo se cura al empezar una etapa nueva — 2-3 originalmente,
// ahora 3-5, ver rowCount más abajo), un enfrentamiento "igualado" oleada
// a oleada se convertía en desgaste imposible: simulando miles de
// combates, un equipo a la altura de su zona perdía el 100% de las etapas
// normales en las zonas media/tardías, frente a un 0% contra el jefe de
// esa misma zona — justo lo contrario de lo que se espera de la curva de
// dificultad. MOB_POWER_MULT (afinado por la misma simulación, probando
// 0.65/0.72/0.78, cuando rowCount todavía era 2-3) devuelve el camino a
// un reto real pero superable sin tocar los jefes.
//
// Bajado de 0.72 a 0.65 al subir rowCount a 3-5 (a petición del usuario,
// para concentrar la dificultad en menos etapas, ver su comentario en
// data.js) — verificado por simulación que hacía falta: con 0.72 y el
// nuevo mínimo de 3 oleadas seguidas (antes 2), la banda inicial de solo
// 3 luchadores con la que se empieza la partida pasaba de ganar siempre
// la primerísima etapa del juego a perderla siempre (0% de victorias en
// 10 pruebas) — el "desgaste extra" de la 3ª oleada ya era demasiado para
// una banda tan pequeña y floja. Con 0.65 esa misma prueba vuelve al
// 100% de victorias, y el resto de la curva de dificultad (banda natural
// media/tardía, banda maxed de referencia) sigue dentro de lo ya
// calibrado — ver TODO.md.
const MOB_POWER_MULT = 0.65;
// `state` (nuevo parámetro): hace falta para mobAdaptiveMult (state.js),
// que mide cómo de overpowered va la banda REAL del jugador frente al
// relleno nominal de la zona — antes los mobs no recibían ningún ajuste
// por esto (a diferencia del jefe, ver bossAdaptiveMult), así que una
// banda que ya iba sobrada de Épicos/Legendarios por Fusión normal (sin
// grindear ni equipar nada) los arrasaba sin recibir apenas daño incluso
// en las primeras zonas — ver TODO.md para la simulación completa.
function buildEnemyBand(state, zoneIdx, stageIdx, bossExtraMult) {
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
  // Rampa de nº de oleadas SEGUIDAS (sin curación entre ellas) dentro de la
  // etapa — pedido explícito del usuario: menos etapas, pero cada una con
  // más oleadas, para que el desgaste acumulado suba la dificultad de
  // verdad sin tocar los stats de los rivales. Adaptada a las 24 etapas de
  // mobs actuales (antes 32, con 2/3 oleadas): las primeras 8 (un tercio)
  // traen 3 oleadas, las siguientes 14 traen 4, y las 2 últimas antes del
  // jefe traen 5 — un "último tramo" más duro justo antes del jefe de
  // zona, tal como pidió el usuario ("incluso poner un nivel o dos con 5
  // combates").
  const rowCount = stageIdx < 8 ? 3 : (stageIdx < 22 ? 4 : 5);
  const rows = [];
  const mobMult = MOB_POWER_MULT * lateZoneMult(zoneIdx) * mobAdaptiveMult(state, zoneIdx);
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let i = 0; i < 3; i++) {
      const pick = zone.pool[Math.floor(Math.random() * Math.min(2, zone.pool.length))];
      row.push(makeUnit('enemy', pick, level, mobMult));
    }
    rows.push(row);
  }
  return { rows, isBoss, level };
}

// ---------- Dificultad de la Torre Batalla ----------
// A diferencia del Mapa (mobAdaptiveMult/bossAdaptiveMult, en state.js,
// que miden la banda REAL del jugador contra la zona) la Torre asume
// siempre el mismo público objetivo: solo se desbloquea al completar el
// Mapa entero (torreUnlocked, state.js), así que en vez de un
// multiplicador ADAPTATIVO usa uno FIJO por escalón, calibrado contra una
// banda de referencia "recién terminado el mapa" (9 Legendarios Nv.40 3★
// con equipo Legendario Nv.15 — la misma referencia ya usada para
// calibrar el tramo final del Mapa, ver TODO.md) en vez de la banda real
// de quien juega, que puede llevar mucho menos invertido en cualquier
// otro momento (Torre es repetible sin límite, así que no hay "una sola
// banda de referencia" estable como en el Mapa).
//
// Motivo del cambio original: con el nivel ya fijo a XP_LEVEL_CAP para
// todos (ver buildTorreLevels en data.js) pero sin ningún multiplicador
// extra, los mobs (ninguno) y la mayoría de jefes (el antiguo
// torreBossMult, referenciado a la zona de ORIGEN de cada jefe) no le
// hacían nada de daño de verdad a esa banda. Reportado por el usuario:
// "los bosses en la torre batalla tienen que ser mucho más difíciles y
// los mobs también... a un equipo de todo legendarios equipados con
// objetos legendarios, al nivel 40, no les hacen nada".
//
// MOBS (torreMobMult): cada tanda de enemyCount (crece cada 8 escalones)
// tiene una potencia OBJETIVO fija (TORRE_MOB_TARGET_POWER, en unidades de
// fighterPowerScore) — el multiplicador de CADA familia es el que hace
// falta para que SU potencia nativa (a ×1, la de rareza/clase de
// siempre) llegue a esa potencia objetivo, así una familia floja para su
// tanda recibe más empujón que una que ya viene fuerte de fábrica. Esto
// es seguro para mobs porque su potencia nativa, al salir de la misma
// fórmula rareza×clase que cualquier otro luchador, varía poco dentro de
// una tanda (~2-4.7× de multiplicador en toda la escalera, verificado).
//
// JEFES (torreBossMult): pasó por DOS intentos fallidos antes de este.
// 1º) normalizar por potencia nativa, igual que los mobs — PROVOCÓ UNA
// DERROTA REAL reportada por el usuario (captura: 42.511 de daño
// recibido contra un solo jefe, banda de 9 Legendarios Nv.40 arrasada):
// las stats de jefe son fixedStats puestas A MANO, con muchísima más
// variación entre sí que las de un mob (la tanda de un único jefe va de
// 584 a 2299 de potencia nativa, casi 4×), así que normalizar todos a la
// misma potencia objetivo disparó el multiplicador del jefe más flojo
// (Bruja del Pantano, zona 2) a ×14.6 sobre TODAS sus stats a la vez.
// 2º) un multiplicador FIJO por tanda (sin normalizar) — más seguro, pero
// el usuario mandó una segunda captura mostrando lo contrario: con ese
// mismo equipo ganaba al Coloso de Cristal (jefe de la 3ª zona) sin
// ningún problema (7 de daño recibido). La razón, mirando computeDamage
// (más arriba): el daño de un golpe es `ATK_atacante − DEF_rival×0.5`,
// así que lo que de verdad decide si un jefe hace daño NO es su potencia
// general sino si su ATK nativo (aquí 65) llega a superar la mitad de la
// DEF de la banda (~566 con equipo Legendario bueno, así que hacen falta
// más de 283 de ATK) — un multiplicador FIJO igual para todos los jefes
// de la tanda no puede corregir eso sin sobre-subir también a los que ya
// tenían ATK decente.
// Solución: dos multiplicadores por separado (ver el objeto { off, def }
// que acepta buildUnitStats) — `off` sube SOLO ATK/WIS hasta que cruce con
// margen ese umbral de la DEF de la banda de referencia (con techo propio,
// más alto, porque no arrastra HP/DEF/AGI consigo) y `def` sube HP/DEF/AGI
// por separado con un techo más bajo (para que el combate dure lo
// suficiente para que ese ATK ya relevante se note, sin volverse
// eterno ni disparar la prob. de crítico vía AGI sin necesidad).
// TORRE_BOSS_ATK_TARGET (700) es el ATK nativo que, multiplicado por el
// "off" de un jefe cualquiera, se intenta alcanzar; TORRE_BOSS_OFF_CAP/
// DEF_CAP limitan cuánto puede subir cada uno para un jefe de ATK nativo
// muy bajo (si no, un jefe como el Guardián del Bosque, ATK nativo 26,
// dispararía su "off" a ×27 solo por intentar llegar a 700). El exceso de
// ambos se amortigua entre la raíz del nº de repeticiones de la tanda
// (level.enemyCount) igual que antes, para que la propia repetición sin
// curación ya cuente como parte del reto.
const TORRE_MOB_TARGET_POWER = { 3: 3300, 6: 2950, 9: 2700, 12: 2646, 15: 3200 };
const TORRE_BOSS_ATK_TARGET = 700, TORRE_BOSS_OFF_CAP = 10, TORRE_BOSS_DEF_CAP = 4;
function torreMobMult(level) {
  const u = makeUnit('enemy', level.fightDefId, XP_LEVEL_CAP);
  const native = fighterPowerScore({ hp: u.maxHp, atk: u.atk, def: u.def, agi: u.agi, wis: u.wis });
  return Math.max(1, TORRE_MOB_TARGET_POWER[level.enemyCount] / native);
}
function torreBossMult(level) {
  const ratio = TORRE_BOSS_ATK_TARGET / fighterDef(level.fightDefId).fixedStats.atk;
  const rawOff = Math.min(TORRE_BOSS_OFF_CAP, ratio);
  const rawDef = Math.min(TORRE_BOSS_DEF_CAP, ratio);
  const damp = Math.sqrt(level.enemyCount);
  return {
    off: rawOff <= 1 ? 1 : 1 + (rawOff - 1) / damp,
    def: rawDef <= 1 ? 1 : 1 + (rawDef - 1) / damp,
  };
}

// Oleadas de un nivel de la Torre Batalla (ver TORRE_LEVELS en data.js):
// siempre el mismo rival del nivel, repetido level.enemyCount veces. Los
// mobs llegan en filas de hasta 3 simultáneos, como una oleada normal; los
// jefes SIEMPRE en solitario, en oleadas sucesivas — un jefe nunca debe
// recibir compañía (ver el comentario de makeBossUnit más arriba).
function buildTorreEncounters(level) {
  const perRow = level.kind === 'boss' ? 1 : 3;
  const extraMult = level.kind === 'boss' ? torreBossMult(level) : torreMobMult(level);
  const rows = [];
  let remaining = level.enemyCount;
  while (remaining > 0) {
    const count = Math.min(perRow, remaining);
    const row = [];
    for (let i = 0; i < count; i++) {
      row.push(level.kind === 'boss' ? makeBossUnit(level.fightDefId, level.enemyLevel, extraMult) : makeUnit('enemy', level.fightDefId, level.enemyLevel, extraMult));
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
// cambios anterior (~94-95/zona) para no re-litigar otra vez el ritmo de
// Superfusión ya validado, solo repartirlo en trozos aún más finos (32
// etapas de mobs, antes 14, antes 7 → ~3 de media por etapa en vez de
// ~6.8/~12.8 — ya no "un pufo de cristales", un puñado de verdad pequeño).
// Varianza también apretada (2→1) para que nunca se aleje mucho de esa
// media — el objetivo explícito del usuario era que cada etapa se sienta
// una tirada pequeña, no ocasionalmente un salto grande.
const ZONE_PIXITE_TOTAL = 95;
const MOB_STAGE_PIXITE_VARIANCE = 1; // +-1 sobre la media, entero
// Totales ESPERADOS de Voxite/Doxite/equipo por zona (solo etapas de mobs,
// sin contar el jefe) — igual que ZONE_PIXITE_TOTAL, pero para probabilidades
// en vez de una cantidad continua: antes eran un % FIJO por etapa (20%/4%/
// 30%), que con STAGES_PER_ZONE bajado de 33 a 25 (ver su comentario en
// data.js — menos etapas, más oleadas por etapa) daría MENOS cristales/
// equipo de media por zona sin querer, ya que menos etapas = menos tiradas
// independientes al mismo % cada una. Se guarda en su lugar el total
// esperado de ANTES (32 etapas × 20%/4%/30%) y la probabilidad por etapa se
// deriva de él dividiendo entre MOB_STAGES_PER_ZONE (igual que ya hacía
// pixiteAvg) — así el total esperado por zona no cambia pase lo que pase
// con el nº de etapas, solo llega repartido en menos tiradas más generosas.
const ZONE_VOXITE_CHANCE_TOTAL = 6.4; // 32 * 0.20
const ZONE_DOXITE_CHANCE_TOTAL = 1.28; // 32 * 0.04
// Bajado a un tercio (32 * 0.30 = 9.6 → 3.2) a petición explícita del
// usuario: "se consiguen demasiados objetos de tipo equipo a lo largo del
// juego... yo pondría que se consigan muchos menos". Con el valor viejo,
// cada etapa de mobs tenía un 40% de soltar equipo (9.6/24) — un pase
// completo del Mapa (33 zonas) daba de media ~9.6 piezas SOLO de mobs por
// zona (~317 en total, sin contar jefes ni Mazmorra Elemental). Con 3.2 baja
// a ~13.3% por etapa (~2.6/zona, ~88 en todo el Mapa) — sigue habiendo
// equipo suficiente para las 6 ranuras de cada luchador, pero deja de
// acumularse sin parar sea cual sea el ritmo de juego.
const ZONE_GEAR_CHANCE_TOTAL = 3.2;

function elementalDungeonRewards(isFirstClear) {
  const zoneIdx = ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID);
  // Más generoso que el jefe de esa misma zona (×3.5/×3 en vez de la
  // porción normal de jefe) — la desventaja elemental de partida contra
  // el Guardián hace que el reto sea mayor.
  const texel = Math.round(zoneTexelTotal(zoneIdx) * 0.35 * 3.5);
  const fighterXp = Math.round(zoneXpTotal(zoneIdx) * 0.30 * 3);
  const drops = { voxite: 0, doxite: 0, gear: null };
  // El equipo aquí era antes incondicional (SIEMPRE caía una pieza, a
  // diferencia de voxite/doxite justo debajo, que sí distinguen primera vez
  // de repetición) — con 5 mazmorras (una por elemento) repetibles sin
  // límite, eso era una fuente de equipo garantizada sin tope. Se alinea
  // ahora con el resto del recorte de equipo: garantizado solo la primera
  // vez (premio de hito de la mazmorra), 20% en repeticiones.
  if (Math.random() < (isFirstClear ? 1 : 0.2)) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx, isFirstClear));
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
      // Voxite/Doxite en repetición de jefe: bajado (65%→45% / 35%→18%) a
      // petición explícita del usuario — insiste en que Pixite debe ser
      // la fuente principal de cristales con diferencia. Dos intentos más
      // agresivos (18%/5% y 35%/11%) dejaban Legendario prácticamente
      // inalcanzable (31 y 15 de 40 pruebas sin completar ni en 30.000
      // etapas, ver TODO.md) — este valor mantiene Legendario en "lento
      // pero posible sin fallos" mientras Voxite/Doxite se quedan
      // claramente por detrás de Pixite en volumen total.
      drops.pixite = 3 + Math.floor(Math.random() * 4);
      if (Math.random() < 0.45) drops.voxite = 1;
      if (Math.random() < 0.18) drops.doxite = 1;
    }
    // Bajado a la mitad (70%→35% / 8%→4%), en línea con el recorte de
    // ZONE_GEAR_CHANCE_TOTAL más arriba — mismo motivo: demasiado equipo en
    // total. Repetirlo sigue usando una tabla de rareza floja (ver
    // gearDropRarity) además de esta probabilidad más baja de que caiga
    // algo, ya que un jefe fácil de repetir en segundos (Auto + velocidad
    // 3×) sigue siendo mucho volumen de piezas si la probabilidad es alta.
    const bossGearChance = isFirstClear ? 0.35 : 0.04;
    if (Math.random() < bossGearChance) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx, isFirstClear));
  } else {
    texel = Math.round(zTexel * 0.65 / MOB_STAGES_PER_ZONE);
    fighterXp = Math.round(zXp * 0.70 / MOB_STAGES_PER_ZONE);
    const pixiteAvg = ZONE_PIXITE_TOTAL / MOB_STAGES_PER_ZONE;
    const v = MOB_STAGE_PIXITE_VARIANCE;
    drops.pixite = Math.max(0, Math.round(pixiteAvg) - v + Math.floor(Math.random() * (2 * v + 1)));
    // Voxite/Doxite/equipo de etapa normal: probabilidad derivada de un
    // total esperado por zona (ver ZONE_VOXITE_CHANCE_TOTAL/
    // ZONE_DOXITE_CHANCE_TOTAL/ZONE_GEAR_CHANCE_TOTAL más arriba), NO un %
    // fijo — así el total esperado por zona no depende de cuántas etapas
    // de mobs tenga (STAGES_PER_ZONE), solo de cuántas oleadas de verdad
    // se jueguen.
    if (Math.random() < ZONE_VOXITE_CHANCE_TOTAL / MOB_STAGES_PER_ZONE) drops.voxite = 1;
    if (Math.random() < ZONE_DOXITE_CHANCE_TOTAL / MOB_STAGES_PER_ZONE) drops.doxite = 1;
    if (Math.random() < ZONE_GEAR_CHANCE_TOTAL / MOB_STAGES_PER_ZONE) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx));
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
// fighterXp (pedido explícito del usuario): antes daba muy poco — incluso
// una racha larga apenas subía un par de niveles, así que en la práctica
// nadie usaba esto para levelear en serio, solo el Mapa servía. Ahora
// sube todo el fighterXp del luchador elegido (nunca se reparte con nadie
// más, es un duelo 1 contra 1) para que la Prueba del Campeón sea una vía
// real de levelear a UN luchador concreto sin tener que meterlo en la
// Formación ni tocar el Mapa — pensado sobre todo para subir de golpe un
// fichaje reciente (p.ej. recién evolucionado a Legendario) hasta un
// nivel útil. Verificado por simulación (combate real, sin aproximar):
// un luchador Nv.1 reintentando la Prueba unas 10-20 veces (60-120 de
// energía, 1-2 barras llenas) alcanza Nv.~14-24 si es Raro, Nv.~24-35 si
// es Épico, y Nv.~29-40 (tope) si es Legendario — una progresión rápida y
// con sentido, muy por delante de jugar esas mismas oleadas en el Mapa.
function championDuelRewards(duelIdx) {
  return { texel: Math.round(30 + duelIdx * 10), fighterXp: Math.round(60 + duelIdx * 45) };
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
