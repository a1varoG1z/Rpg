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
  // extraMult objeto { off, def } (solo lo usa torreMobMult, ver más abajo):
  // mismo mecanismo que ya tenía el jefe de fixedStats arriba, extendido
  // aquí a los MOBS normales (fórmula de rareza×nivel×clase). Bug real
  // reportado por el usuario ("la torre batalla no es muy complicada? […]
  // que sea posible ganar con un equipo completo de legendarios"):
  // torreMobMult aplicaba un ÚNICO multiplicador escalar (derivado de
  // fighterPowerScore, que solo pesa el HP a 0.3×) a las 5 stats por
  // igual — un mob de clase con mucho peso de HP nativo (p.ej. la Reina
  // Araña, pícaro con hp:90/atk:26) necesitaba un multiplicador grande
  // para alcanzar la potencia objetivo (el HP "cuenta poco"), y ese mismo
  // multiplicador grande disparaba su ATK muy por encima de lo previsto
  // — verificado con la araña del nivel 0 de la Torre llegando a 1149 de
  // ATK contra una banda de Legendarios con ~500 de DEF, un golpe de
  // ~900+ que aniquilaba en 1-2 turnos a cualquier equipo que no fuera ya
  // el más optimizado posible. Con el objeto { off, def } el ATK/WIS (lo
  // que decide si un golpe hace daño real, computeDamage = ATK−DEF×0.5)
  // se calibra contra un objetivo de ATK ABSOLUTO (torreMobAtkTarget,
  // independiente de la "forma" de stats nativa del mob) en vez de
  // heredar sin querer el multiplicador que hacía falta para el HP.
  if (extraMult && typeof extraMult === 'object') {
    const off = extraMult.off || 1, dfn = extraMult.def || 1;
    const base = rarityInfo(def.rarity).mult * levelGrowth(level);
    return {
      maxHp: Math.round(w.hp * base * dfn * statVarianceMult(def.family, 'hp') * fighterStatMult(def, 'hp')),
      atk: Math.round(w.atk * base * off * statVarianceMult(def.family, 'atk') * fighterStatMult(def, 'atk')),
      def: Math.round(w.def * base * dfn * statVarianceMult(def.family, 'def') * fighterStatMult(def, 'def')),
      agi: Math.round(w.agi * base * dfn * statVarianceMult(def.family, 'agi') * fighterStatMult(def, 'agi')),
      wis: Math.round(w.wis * base * off * statVarianceMult(def.family, 'wis') * fighterStatMult(def, 'wis')),
    };
  }
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
    skillId: def.skillId, ultCharge: 0, buffs: [], debuffs: [], dots: [], stunTurns: 0, shield: null, alive: true,
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
    skillId: def.skillId, ultCharge: 0, buffs: [], debuffs: [], dots: [], stunTurns: 0, shield: null, alive: true,
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
function buildEnemyBand(state, zoneIdx, stageIdx, bossExtraMult, tier) {
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
  // lockedMobAdaptiveMult (state.js): bloqueada la primera vez que se entra
  // a esta zona, igual que el jefe — ver su comentario ahí. Solo se llega
  // aquí desde una etapa de mobs real (UI.startStageBattle); el Duelo por
  // apuesta siempre pasa stageIdx = etapa del jefe, así que nunca entra en
  // esta rama.
  const mobMult = MOB_POWER_MULT * lateZoneMult(zoneIdx) * lockedMobAdaptiveMult(state, zoneIdx, tier);
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
// v3 (recalibración completa, petición explícita del usuario): "hay que
// recalcular la dificultad de la torre batalla. Piensa que llegas ahí una
// vez que has superado al último boss del último mapa, ahí es cuando se
// desbloquea. Ese debe ser más o menos el nivel de dificultad de la torre
// batalla [al empezar]... tiene que ser posible con un equipo full
// legendario (de los mejores) y con equipación legendaria... tiene que
// partir de una dificultad mayor [que antes]. Hay bosses que de muy pocos
// golpes acabas con ellos... sin ofrecer resistencia, y los mobs lo mismo."
// La v2 (commit anterior) se había calibrado contra la banda de Legendarios
// MÁS FLOJA posible para arreglar un bug real (el nivel 0 aniquilaba a esa
// banda) — pero eso dejó la escalera entera trivial para la banda de
// referencia de SIEMPRE (9 MEJORES Legendarios Nv.40 3★ + equipo Legendario
// Nv.15, la misma que usa el resto del juego, ver TODO.md): con objetivos
// de ATK calibrados contra ~500 de Defensa (la floja) en vez de los ~684 de
// la banda buena, esta última no recibía apenas daño (techo de 1 de daño
// por computeDamage), y con objetivos de HP igual de bajos la mataba de
// 1-2 golpes por su propio daño de salida altísimo. Recalibrado point por
// point contra la banda BUENA (medido de verdad: enfrentándola en Playwright
// al jefe final del Mapa, Tifón, con el Mapa entero marcado como superado —
// ATK 480/DEF 500 nativo de Tifón, banda con ~684 de Defensa media y ~772
// de ATK medio) como ancla de "así de duro se siente el reto que acabas de
// superar para desbloquear la Torre": el primer escalón de cada sección
// (mob tanda de 3, jefe de enemyCount 1) apunta a un daño por golpe y una
// vida similar a ESE combate, ya fijando directamente una VIDA absoluta
// (TORRE_MOB_HP_TARGET/TORRE_BOSS_HP_TARGET_BY_TIER) en vez de derivarla de
// fighterPowerScore o de un ratio ligado al ATK — así ni el HP "regala" un
// multiplicador de ATK barato (el bug de la v1) ni el ATK evita que el
// rival aguante lo suficiente para que el combate se note (el problema de
// esta v2 reportado ahora). Ambos (ATK y HP) escalan con tabla propia por
// tanda/tier, cada vez más dura, hasta un tramo final (mob 15, jefe 6) muy
// por encima de Tifón — Torre es contenido posterior al Mapa entero, así
// que su techo debe superar con margen lo último que ya se superó.
const TORRE_MOB_ATK_TARGET = { 3: 480, 6: 560, 9: 650, 12: 740, 15: 850 };
const TORRE_MOB_HP_TARGET = { 3: 3800, 6: 4300, 9: 4800, 12: 5400, 15: 6100 };
const TORRE_MOB_OFF_CAP = 20, TORRE_MOB_DEF_CAP = 10;
const TORRE_BOSS_ATK_TARGET_BY_TIER = { 1: 480, 2: 542, 3: 613, 4: 692, 5: 782, 6: 884 };
const TORRE_BOSS_HP_TARGET_BY_TIER = { 1: 7000, 2: 7910, 3: 8938, 4: 10100, 5: 11413, 6: 12897 };
const TORRE_BOSS_OFF_CAP = 40, TORRE_BOSS_DEF_CAP = 20;
// Techo ABSOLUTO de Defensa final por tier (aparte del objetivo de HP) —
// bug real encontrado calibrando esta v3: Surtr (nativo DEF 419, ya alto de
// fábrica respecto a su propio ATK 161) escalaba su DEF con el MISMO
// multiplicador que su HP (ambos bajo `def`, ver buildUnitStats) para
// llegar al objetivo de HP del tier — pero eso disparaba su DEF final muy
// por encima del ATK de la banda de referencia, dejando computeDamage
// (ATK−DEF×0.5) en 1 de daño SIEMPRE: la banda no podía ni rascarle,
// mientras Surtr sí le hacía daño real cada turno — un muro imposible, no
// un reto duro. TORRE_BOSS_DEF_MAX limita cuánto puede subir la DEF
// aunque eso deje a un jefe de DEF nativa ya alta un poco por debajo de su
// objetivo de HP — mejor quedarse corto de vida que crear un muro
// invencible.
const TORRE_BOSS_DEF_MAX = { 1: 380, 2: 440, 3: 500, 4: 560, 5: 630, 6: 700 };
function torreMobMult(level) {
  const u = makeUnit('enemy', level.fightDefId, XP_LEVEL_CAP);
  const rawOff = Math.min(TORRE_MOB_OFF_CAP, TORRE_MOB_ATK_TARGET[level.enemyCount] / u.atk);
  const rawDef = Math.min(TORRE_MOB_DEF_CAP, TORRE_MOB_HP_TARGET[level.enemyCount] / u.maxHp);
  return {
    off: rawOff <= 1 ? 1 : rawOff,
    def: rawDef <= 1 ? 1 : rawDef,
  };
}
// `def` YA NO se amortigua con la raíz del nº de repeticiones (a diferencia
// de la v2) — apuntando ya a un objetivo de HP absoluto y creciente por
// tier, amortiguarlo además dejaba a los jefes de tier alto con menos vida
// de la pretendida, justo el "sin ofrecer resistencia" reportado.
// Empujón extra SOLO para jefes (petición explícita del usuario: "los
// bosses de la torre batalla, al ser solo un personaje y un único combate,
// no deberían ser un poco más poderosos?"). Un jefe pelea en solitario
// contra hasta 3 luchadores a la vez (sin la ayuda de 2 compañeros que sí
// tiene cualquier mob de una tanda), así que puede permitirse ser más
// fuerte 1 contra 3 de lo que le haría falta a un mob que ya lucha
// acompañado. TORRE_BOSS_POWER_BOOST se aplica sobre el EXCESO por encima
// de 1 (no sobre el ratio entero) para no romper el suelo "sin cambio si
// ya native ≥ objetivo" que ya tenían off/def.
// Calibrado con ~35 simulaciones reales en Playwright (5 combates enteros
// de los 45 jefes, con la banda de referencia FUERTE y objetos curativos,
// para cada valor de 1.4 a 2.0): 1.4-1.6 superan la escalera entera SIEMPRE
// (0/5 fallos); en 1.7 ya falla el 80% de las veces (4/5) justo en
// Jormungandr (tier 6); de 1.8 en adelante falla siempre y cada vez antes.
// 1.5 se queda con margen de sobra por debajo de ese precipicio (1.7)
// mientras casi TRIPLICA las pociones que hacían falta antes (24→75 de
// media en los 45 jefes) — un salto real de dificultad, no cosmético.
const TORRE_BOSS_POWER_BOOST = 1.5;
function torreBossMult(level) {
  const fixed = fighterDef(level.fightDefId).fixedStats;
  const rawOff = Math.min(TORRE_BOSS_OFF_CAP, TORRE_BOSS_ATK_TARGET_BY_TIER[level.enemyCount] / fixed.atk);
  let rawDef = Math.min(TORRE_BOSS_DEF_CAP, TORRE_BOSS_HP_TARGET_BY_TIER[level.enemyCount] / fixed.hp);
  const defMaxRatio = TORRE_BOSS_DEF_MAX[level.enemyCount] / fixed.def;
  if (rawDef > defMaxRatio) rawDef = Math.max(1, defMaxRatio);
  const off = rawOff <= 1 ? 1 : 1 + (rawOff - 1) * TORRE_BOSS_POWER_BOOST;
  const def = rawDef <= 1 ? 1 : 1 + (rawDef - 1) * TORRE_BOSS_POWER_BOOST;
  return { off, def };
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
// jugador.
//
// Petición explícita del usuario: "que haya más de una pelea, varios
// escenarios diferentes que superar... con una dificultad en subida" —
// antes cada nivel era una única oleada (o hasta 3 en los últimos, pero
// todas al MISMO nivel fijo: ni un solo nivel subía de dificultad por
// dentro). Ahora cada nivel es siempre un recorrido de VARIAS oleadas
// SEGUIDAS sin curarse entre ellas (como una etapa del Mapa), y cada
// oleada dentro del mismo nivel sube unos puntos de nivel de rival
// respecto a la anterior — una escalera de dificultad propia DENTRO de
// cada reto, además de la escalera ya existente ENTRE unos retos y
// otros (idx).
function buildTierCapEncounters(level, idx) {
  const pool = FIGHTERS.filter(f => rarityIndex(f.rarity) <= rarityIndex(level.constraint.rarityMax)
    && (!level.constraint.element || f.element === level.constraint.element)
    && (!level.constraint.class || f.class === level.constraint.class));
  const baseLevel = Math.min(XP_LEVEL_CAP, 6 + idx * 3);
  const waveCount = tierCapWaveCount(idx);
  const rows = [];
  for (let w = 0; w < waveCount; w++) {
    const enemyLevel = Math.min(XP_LEVEL_CAP, baseLevel + w * 3);
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
// encadena varias), con "guardianes" de la MISMA rareza tope que la
// familia puesta a prueba. Endurecido a petición explícita del usuario,
// sobre la primera versión ya en producción ("en trials de familia
// también subir la dificultad de los rivales") — encaja además con que
// el equipo ya no admite genéricas de relleno (ver
// familyTrialOwnsAllForms, state.js): el trío que se presenta es siempre
// 3 copias reales, así que el rival puede exigir más sin ser injusto.
// tier+1 guardianes (2/3/3, antes 2/3/4 — ver fix de count abajo) con un
// multiplicador de stats creciente por tier (mult, antes ninguno).
//
// Fix: tier3 (familias tope Legendario) pedía tier+1 = 4 guardianes, el
// MISMO bug que el usuario reportó primero en el Torneo de Bracket y
// luego en la Jauría de Cacería del Tesoro ("en trials de familia pasa
// lo mismo") — el motor de combate por bandas solo admite filas de HASTA
// 3 luchadores (cabecera de combat.js), así que la línea de 3 del
// jugador se enfrentaba a 4 guardianes a la vez en cualquier Trial de
// tier 3. Corregido con Math.min(3, ...) y compensando la dificultad
// perdida en tier3 con un mult mayor (1.8 → 2.1, misma proporción usada
// para compensar la ronda 4 del Torneo).
function buildFamilyTrialEncounter(trial) {
  const pool = FIGHTERS.filter(f => f.rarity === trial.maxRarity);
  const level = familyTrialLevel(trial);
  const mult = trial.tier === 3 ? 2.1 : 1.2 + trial.tier * 0.2; // tier1: 1.4 · tier2: 1.6 · tier3: 2.1
  const count = Math.min(3, trial.tier + 1);
  const row = [];
  for (let i = 0; i < count; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level, mult));
  }
  return row;
}

// Equipo de un Trial de Familia: SIEMPRE los 3 eslabones de trial.formIds
// (ya en orden ascendente de rareza) con COPIAS REALES — picks es un
// array paralelo a formIds de uids ya validados por
// familyTrialOwnsAllForms (ver UI.startFamilyTrial), nunca null aquí.
function buildFamilyTrialSquad(state, trial, picks) {
  return picks.map(uid => makePlayerUnit(state, uid));
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
// zona, ver makeBossUnit). `iteration` (state.elementalClears[elementId]
// antes del intento actual, ver UI.startElementalDungeon) sube el
// multiplicador de stats de TODOS los rivales sin techo (ver
// elementalDungeonDifficultyMult en data.js) — petición explícita del
// usuario: "cada iteración tiene que ser más complicada".
function buildElementalDungeonEncounters(elementId, iteration) {
  const dungeon = ELEMENTAL_DUNGEONS[elementId];
  const level = elementalDungeonLevel();
  const mult = elementalDungeonDifficultyMult(iteration);
  const rows = dungeon.waveDefIds.map(defId => [0, 1, 2].map(() => makeUnit('enemy', defId, level, mult)));
  rows.push([makeBossUnit(dungeon.guardianDefId, level, mult)]);
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

// `iteration` (state.elementalClears[elementId] antes del intento actual):
// petición explícita del usuario ("de recompensa doxite, aumentandose la
// recompensa") — Doxite pasa de una posibilidad menor (40%/8% de +1) a un
// drop GARANTIZADO cuya cantidad sube con cada repetición, en vez de solo
// depender del azar. Texel/XP escalan con la misma dificultad creciente
// (elementalDungeonDifficultyMult) que ya suben los propios rivales, para
// que una mazmorra más dura pague de verdad más que la anterior.
function elementalDungeonRewards(isFirstClear, iteration) {
  const zoneIdx = ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID);
  const mult = elementalDungeonDifficultyMult(iteration);
  // Más generoso que el jefe de esa misma zona (×3.5/×3 en vez de la
  // porción normal de jefe) — la desventaja elemental de partida contra
  // el Guardián hace que el reto sea mayor.
  const texel = Math.round(zoneTexelTotal(zoneIdx) * 0.35 * 3.5 * mult);
  const fighterXp = Math.round(zoneXpTotal(zoneIdx) * 0.30 * 3 * mult);
  const drops = { voxite: isFirstClear ? 1 : 0, doxite: elementalDungeonDoxiteReward(iteration), gear: null };
  // El equipo aquí era antes incondicional (SIEMPRE caía una pieza, a
  // diferencia de voxite justo debajo, que sí distingue primera vez de
  // repetición) — con 5 mazmorras (una por elemento) repetibles sin
  // límite, eso era una fuente de equipo garantizada sin tope. Se alinea
  // ahora con el resto del recorte de equipo: garantizado solo la primera
  // vez (premio de hito de la mazmorra), 20% en repeticiones.
  if (Math.random() < (isFirstClear ? 1 : 0.2)) drops.gear = generateGear(randomGearSlot(), gearDropRarity(zoneIdx, isFirstClear));
  if (!isFirstClear && Math.random() < 0.25) drops.voxite = 1;
  return { texel, fighterXp, drops };
}

// `isFirstClear` (solo importa para jefes): el Voxite garantizado + 30% de
// Doxite extra es la recompensa de VENCER a este jefe por primera vez, no
// de pelear contra él — sin este control, rejugar el jefe más fácil del
// Mapa (un solo enemigo, trivial con Auto + velocidad 3×) daba cristales
// caros gratis sin límite y rompía la escasez del gacha. Las repeticiones
// (rejugar la etapa, o el Duelo por apuesta) usan en su lugar una
// probabilidad baja, del mismo orden que una etapa normal.
function stageRewards(zoneIdx, stageIdx, isBoss, isFirstClear, tier) {
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
  // rewardMult (MAP_DIFFICULTIES, data.js): Texel/XP suben algo con la
  // dificultad del Mapa seleccionada, aparte del bonus de Gemas propio
  // (mucho mayor, ver recordStageClear en state.js) al completar cada
  // zona por primera vez en esa dificultad.
  const rewardMult = MAP_DIFFICULTIES[tier || 0].rewardMult;
  texel = Math.round(texel * rewardMult);
  fighterXp = Math.round(fighterXp * rewardMult);
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

// ---------- Torneo de Bracket (Retos) ----------
// Eliminatoria de combates seguidos contra IA cada vez más fuerte — mismo
// patrón de rareza creciente que buildChampionOpponent, pero con una FILA
// de hasta varios rivales (como el Roguelike) en vez de 1 contra 1, con
// rondas FIJAS (no sin techo) así que la escalada es mucho más brusca
// ronda a ronda. A diferencia del Roguelike, cada ronda se juega con la
// banda curada al completo (ver UI.fightBracketRound) — un torneo real
// con descanso entre cruces, no una supervivencia.
//
// Endurecido a petición explícita del usuario ("con el torneo pasa igual
// [que Cacería del Tesoro], es demasiado sencillo... toda la sección de
// retos está pensada para el endgame"): de 3 a 4 rondas, nivel tope
// (XP_LEVEL_CAP) desde la 2ª ronda en vez de solo la 3ª, más rivales por
// ronda (hasta el tope real de 3 que respeta el motor de combate por
// bandas, ver comentario en la cabecera del archivo — la 4ª ronda llegó a
// probar count:4, un bug reportado por el usuario: "me ha tocado
// enfrentarme a 4 rivales a la vez, eso está mal, el máximo a la vez
// combatiendo son 3", corregido de vuelta a 3 y compensado subiendo mult)
// y un multiplicador de stats por ronda (mult, aplicado como extraMult de
// makeUnit — el nivel solo ya no basta para seguir escalando una vez
// todas las rondas tocan el tope de nivel). La última ronda es casi
// enteramente Legendario: el filo real del torneo.
const BRACKET_ROUNDS = [
  { level: 30, count: 2, mult: 1.1, epicChance: 0.35, legendaryChance: 0.10 },
  { level: 40, count: 3, mult: 1.45, epicChance: 0.45, legendaryChance: 0.30 },
  { level: 40, count: 3, mult: 1.85, epicChance: 0.30, legendaryChance: 0.60 },
  { level: 40, count: 3, mult: 2.7, epicChance: 0.15, legendaryChance: 0.85 },
];
function buildBracketOpponentRow(round) {
  const cfg = BRACKET_ROUNDS[round];
  const row = [];
  for (let i = 0; i < cfg.count; i++) {
    const roll = Math.random();
    const pool = roll < cfg.legendaryChance
      ? FIGHTERS.filter(f => f.rarity === 'legendario')
      : roll < cfg.legendaryChance + cfg.epicChance
        ? FIGHTERS.filter(f => f.rarity === 'epico')
        : FIGHTERS.filter(f => f.rarity === 'comun' || f.rarity === 'infrecuente' || f.rarity === 'raro');
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, cfg.level, cfg.mult));
  }
  return row;
}
function bracketRoundRewards(round) {
  return { texel: Math.round(80 + round * 60), fighterXp: Math.round(70 + round * 50) };
}
// Recompensa de ganar el torneo COMPLETO (las 3 rondas): 10 cristales del
// mejor tier, pedido explícito del usuario ("10 del mejor tier" = Doxite,
// ver CRYSTALS en data.js — 0% común, 20% legendario). Limitada a una vez
// al día (mismo mecanismo de clave por fecha que el Mercader Itinerante,
// ver merchantTodayKey/bracketWonToday) para que no se pueda farmear en
// bucle — el torneo se puede seguir jugando las veces que se quiera para
// practicar/Texel/XP, solo el bonus de cristales se limita.
const BRACKET_WIN_CRYSTAL_TYPE = 'doxite';
const BRACKET_WIN_CRYSTAL_AMOUNT = 10;

// ---------- Cacería del Tesoro (Retos) ----------
// Recorrido de nodos elegidos por el jugador (ver TREASURE_HUNT_NODE_TYPES)
// más un guardián final fijo. A diferencia del Torneo de Bracket y el
// Roguelike, las recompensas de cada nodo NO se suman a la cuenta
// permanente al momento — se acumulan en un "botín" local de la expedición
// (run.pool, ver UI.startTreasureHunt) que solo se cobra de verdad al
// terminar la expedición (guardián derrotado O una emboscada perdida),
// igual que quien vuelve de una cacería real con lo que ha encontrado
// hasta el momento en que tiene que retirarse. El único nodo que puede
// REDUCIR ese botín es la trampa — el resto solo suma, así que el único
// riesgo real de perder algo ya ganado es la trampa, nunca un combate
// perdido (una emboscada perdida corta la expedición ahí, pero no borra lo
// ya encontrado antes).
//
// Endurecido a petición explícita del usuario, en dos rondas:
// 1) "quiero más nodos, más opciones de selección y que los combates sean
//    muchísimo más difíciles, con un equipo legendario no hay oposición" —
//    de 5 a 9 nodos, 2 tipos nuevos, 3 opciones por nodo.
// 2) "quiero que contenga muchos más nodos... no quiero que aumentes el
//    número para elegir en cada nodo, 3 está bien, pero quiero que
//    aumentes muchísimo la VARIEDAD de esas opciones" — de 9 a
//    TREASURE_HUNT_STEPS nodos (el doble) y de 6 a 12 tipos de nodo
//    distintos, sin tocar las 3 opciones por paso. Los 6 tipos nuevos no
//    son variantes de los ya existentes — cada uno tiene un mecanismo
//    propio que no tenía ningún otro nodo: una bendición que dura el
//    resto de la expedición, una apuesta con Gemas YA propias (no del
//    botín), una elección de verdad DENTRO del nodo (sigilo o ataque), un
//    cristal garantizado sin pasar por combate, un sacrificio de riesgo
//    real (puede no dar nada a cambio) y una oleada de enjambre (muchos
//    rivales flojos, en vez de pocos fuertes).
//
// Rescalado de dificultad: los combates ya escalaban con `step` sin
// techo (mult = base + step×tasa) — duplicar TREASURE_HUNT_STEPS sin
// tocar esa tasa habría disparado el último nodo mucho más allá de lo ya
// calibrado (mult llegaría a ~4.7 en vez de ~2.8). Las tasas bajan a la
// mitad para que el ÚLTIMO nodo del recorrido largo alcance
// aproximadamente el mismo techo que alcanzaba el último nodo del
// recorrido corto — la dificultad de pico no cambia, solo se reparte en
// una rampa más larga y gradual.
const TREASURE_HUNT_STEPS = 18;
const TREASURE_HUNT_NODE_TYPES = [
  { id: 'chest_small', icon: '🪙', label: 'Cofre pequeño', weight: 16 },
  { id: 'chest_large', icon: '💰', label: 'Cofre grande', weight: 10 },
  { id: 'ambush', icon: '⚔️', label: 'Emboscada', weight: 14 },
  { id: 'elite_ambush', icon: '💀', label: 'Emboscada de élite', weight: 8 },
  { id: 'pack_hunters', icon: '🐺', label: 'Jauría', weight: 10 },
  { id: 'market', icon: '🏪', label: 'Mercader furtivo', weight: 9 },
  { id: 'trap', icon: '🕳️', label: 'Trampa', weight: 10 },
  { id: 'blessing', icon: '🙏', label: 'Altar de Bendición', weight: 9 },
  { id: 'wishing_well', icon: '⛲', label: 'Fuente de los Deseos', weight: 8 },
  { id: 'sleeping_guardian', icon: '😴', label: 'Guardián Dormido', weight: 7 },
  { id: 'ancient_crypt', icon: '⚰️', label: 'Cripta Antigua', weight: 8 },
  { id: 'sacrifice_altar', icon: '🩸', label: 'Altar de Sacrificio', weight: 7 },
];
// 3 tipos DISTINTOS (sin repetir del mismo pool), para que la elección
// entre ellos sea una decisión real con más matices — con 12 tipos en el
// pool, cada paso puede tocar una combinación bien distinta de la anterior.
function rollTreasureNodeChoices() {
  const pool = [...TREASURE_HUNT_NODE_TYPES];
  const pick = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const totalWeight = pool.reduce((s, n) => s + n.weight, 0);
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) { roll -= pool[idx].weight; if (roll <= 0) break; }
    pick.push(pool.splice(idx, 1)[0]);
  }
  return pick;
}
function treasureHuntEnemyRow(step) {
  const level = Math.min(XP_LEVEL_CAP, 14 + step * 3);
  const count = step < 4 ? 2 : 3;
  const mult = 1 + step * 0.11;
  const legendaryChance = Math.min(0.45, step * 0.032);
  const epicChance = Math.min(0.4, 0.12 + step * 0.02);
  const row = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    const pool = roll < legendaryChance
      ? FIGHTERS.filter(f => f.rarity === 'legendario')
      : roll < legendaryChance + epicChance
        ? FIGHTERS.filter(f => f.rarity === 'epico' || f.rarity === 'raro')
        : FIGHTERS.filter(f => f.rarity === 'raro' || f.rarity === 'infrecuente');
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level, mult));
  }
  return row;
}
// Emboscada de Élite: mismo paso que una emboscada normal pero un rival
// mucho más serio (casi siempre Épico/Legendario, con más multiplicador de
// stats) — la opción de riesgo/recompensa alto del recorrido.
function treasureHuntEliteEnemyRow(step) {
  const level = Math.min(XP_LEVEL_CAP, 20 + step * 3);
  const count = step < 8 ? 2 : 3;
  const mult = 1.5 + step * 0.12;
  const legendaryChance = Math.min(0.75, 0.3 + step * 0.032);
  const row = [];
  for (let i = 0; i < count; i++) {
    const pool = Math.random() < legendaryChance
      ? FIGHTERS.filter(f => f.rarity === 'legendario')
      : FIGHTERS.filter(f => f.rarity === 'epico');
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level, mult));
  }
  return row;
}
// Jauría: el reverso de la Emboscada de Élite — en vez de pocos rivales
// muy fuertes, MUCHOS rivales de rareza baja/media (4-5, crece con el
// paso) pero cada uno bastante más flojo. Mismo peligro agregado que una
// emboscada normal, pero un patrón de combate distinto (repartir daño
// entre varios objetivos en vez de concentrarlo en 2-3).
//
// Devuelve VARIAS oleadas (filas de hasta 3, el tope real del motor de
// combate por bandas — ver cabecera del archivo) en vez de una única fila
// de 4-5. Primera versión metía los 4-5 en una sola fila y reproducía
// exactamente el bug que el usuario reportó en el Torneo de Bracket ("me
// ha tocado enfrentarme a 4 rivales a la vez, eso está mal, el máximo a
// la vez combatiendo son 3") — aquí se corrige repartiendo la jauría en
// oleadas consecutivas sin curación entre medias (mismo patrón que
// STAGES_PER_ZONE para stages con más de 3 mobs), conservando la
// sensación de "muchos rivales" sin romper el 3 vs 3.
function treasureHuntPackEnemyRow(step) {
  const level = Math.min(XP_LEVEL_CAP, 12 + step * 3);
  const count = step < 6 ? 4 : 5;
  const mult = 0.6 + step * 0.05;
  const pool = FIGHTERS.filter(f => f.rarity === 'infrecuente' || f.rarity === 'raro');
  const units = [];
  for (let i = 0; i < count; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    units.push(makeUnit('enemy', def.id, level, mult));
  }
  const rows = [];
  for (let i = 0; i < units.length; i += 3) rows.push(units.slice(i, i + 3));
  return rows;
}
// Guardián Dormido — mitad del combate: si se elige "Atacar" (ver
// UI.resolveSleepingGuardian), un guardián intermedio entre una Emboscada
// de Élite y el Guardián final, de un solo rival muy tanque.
function treasureHuntSleepingGuardianRow(step) {
  const level = Math.min(XP_LEVEL_CAP, 24 + step * 3);
  const mult = 1.7 + step * 0.13;
  const pool = FIGHTERS.filter(f => f.rarity === 'legendario');
  const def = pool[Math.floor(Math.random() * pool.length)];
  return [makeUnit('enemy', def.id, level, mult)];
}
// Guardián final: antes 1 solo rival Épico/Legendario con un mult apenas
// perceptible (1.15) — trivial para un equipo endgame. Ahora 3 Legendarios
// a tope de nivel con mult 2.0, un combate que exige de verdad.
function treasureHuntGuardianRow() {
  const pool = FIGHTERS.filter(f => f.rarity === 'legendario');
  const row = [];
  for (let i = 0; i < 3; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, XP_LEVEL_CAP, 2.0));
  }
  return row;
}
function treasureHuntNodeReward(nodeId, step) {
  const scale = 1 + step * 0.15;
  if (nodeId === 'chest_small') return { texel: Math.round((30 + Math.random() * 30) * scale), gemas: Math.round(1 + Math.random() * 2) };
  if (nodeId === 'chest_large') return { texel: Math.round((80 + Math.random() * 70) * scale), gemas: Math.round(3 + Math.random() * 3) };
  if (nodeId === 'ambush') return { texel: Math.round((50 + Math.random() * 50) * scale), gemas: Math.round(2 + Math.random() * 3) };
  if (nodeId === 'elite_ambush') return { texel: Math.round((160 + Math.random() * 100) * scale), gemas: Math.round(7 + Math.random() * 6), crystalType: 'doxite', crystalAmount: 1 };
  if (nodeId === 'pack_hunters') return { texel: Math.round((70 + Math.random() * 60) * scale), gemas: Math.round(3 + Math.random() * 4) };
  return { texel: 0, gemas: 0 };
}
function treasureHuntTrapResult(pool) {
  if (Math.random() < 0.5) return { kind: 'find', gemas: Math.round(2 + Math.random() * 3) };
  const lost = Math.min(pool.texel, Math.round(pool.texel * (0.15 + Math.random() * 0.15)));
  return { kind: 'lose', texel: lost };
}
// Mercader furtivo: sin combate, cambia una parte del Texel YA acumulado
// en el botín por un cristal — una forma de convertir un botín ya grande
// en algo más escaso y valioso a media expedición, en vez de solo seguir
// sumando Texel.
function treasureHuntMarketResult(pool) {
  const spend = Math.min(pool.texel, Math.round(pool.texel * (0.3 + Math.random() * 0.2)));
  const roll = Math.random();
  const crystalType = roll < 0.35 ? 'doxite' : roll < 0.65 ? 'voxite' : 'pixite';
  const crystalAmount = crystalType === 'doxite' ? 1 : crystalType === 'voxite' ? 2 : 3;
  return { spend, crystalType, crystalAmount };
}
// Altar de Bendición: sin combate, ninguna recompensa inmediata — en vez
// de eso, un buff aleatorio que se queda para el RESTO de la expedición
// (ver applyTreasureHuntBuffs, aplicado a cada combate siguiente: emboscadas,
// Jauría, Guardián Dormido y el Guardián final). Con varios Altares en la
// misma run los buffs se ACUMULAN (no se sustituyen).
const TREASURE_HUNT_BLESSINGS = [
  { id: 'atk', label: '+18% Ataque', icon: '⚔️', stat: 'atk', pct: 0.18 },
  { id: 'def', label: '+18% Defensa', icon: '🛡️', stat: 'def', pct: 0.18 },
  { id: 'agi', label: '+18% Agilidad', icon: '💨', stat: 'agi', pct: 0.18 },
  { id: 'wis', label: '+18% Sabiduría', icon: '🧠', stat: 'wis', pct: 0.18 },
  { id: 'hp', label: '+18% Vida máxima', icon: '❤️', stat: 'hp', pct: 0.18 },
];
function rollTreasureHuntBlessing() {
  return TREASURE_HUNT_BLESSINGS[Math.floor(Math.random() * TREASURE_HUNT_BLESSINGS.length)];
}
// Aplica TODOS los buffs de Bendición acumulados en la run a una fila de
// unidades ya construidas (después de makeUnit/makePlayerUnit) — mismo
// patrón que applyRoguelikeRelicStats (ui.js), pero sobre stats planas en
// vez de sobre entry.stats, porque aquí no hay una "run.squad" propia:
// afecta a quien vaya en la Formación normal (buildPlayerCombinations).
function applyTreasureHuntBuffs(units, run) {
  if (!run.buffs || !run.buffs.length) return;
  units.forEach(u => {
    run.buffs.forEach(b => {
      if (b.stat === 'hp') { u.maxHp = Math.round(u.maxHp * (1 + b.pct)); u.hp = u.maxHp; }
      else u[b.stat] = Math.round(u[b.stat] * (1 + b.pct));
    });
  });
}
// Fuente de los Deseos: sin combate, apuesta GEMAS YA PROPIAS del jugador
// (state.currencies.gemas, NO el botín de la run) por un premio aleatorio
// que sí va al botín — a diferencia de la Trampa (riesgo pasivo/
// automático) o el Mercader (cambio siempre seguro), aquí el jugador
// arriesga algo que ya tenía fuera de la expedición a cambio de un
// premio que puede ser mucho mayor... o casi nada.
const TREASURE_HUNT_WISHING_WELL_COST = 5;
function treasureHuntWishingWellResult(step, cost) {
  const scale = 1 + step * 0.15;
  const roll = Math.random();
  if (roll < 0.08) return { tier: 'jackpot', texel: Math.round(220 * scale), crystalType: 'doxite', crystalAmount: 1, cost };
  if (roll < 0.30) return { tier: 'grande', texel: Math.round(120 * scale), gemas: Math.round(4 * scale), cost };
  if (roll < 0.65) return { tier: 'mediano', texel: Math.round(50 * scale), gemas: Math.round(1 * scale), cost };
  return { tier: 'pequeño', texel: Math.round(15 * scale), cost };
}
// Guardián Dormido: al elegir el nodo se presenta una 2ª decisión real
// (ver UI.openSleepingGuardianChoice) — "pasar de puntillas" (sin
// combate, premio modesto garantizado) o "atacar" (combate contra
// treasureHuntSleepingGuardianRow, premio mucho mejor con cristal
// incluido). La única opción del recorrido con una elección DENTRO de la
// propia elección.
function treasureHuntSleepingGuardianSneakReward(step) {
  const scale = 1 + step * 0.15;
  return { texel: Math.round((60 + Math.random() * 40) * scale), gemas: Math.round(2 + Math.random() * 2) };
}
function treasureHuntSleepingGuardianAttackReward(step) {
  const scale = 1 + step * 0.15;
  const crystalType = Math.random() < 0.5 ? 'doxite' : 'voxite';
  return {
    texel: Math.round((200 + Math.random() * 120) * scale), gemas: Math.round((9 + Math.random() * 6) * scale),
    crystalType, crystalAmount: crystalType === 'doxite' ? 1 : 2,
  };
}
// Cripta Antigua: sin combate, SIEMPRE un cristal (nunca Texel/Gemas
// solos) — a diferencia del resto de nodos sin combate, que dan moneda
// como mucho con una posibilidad de cristal de refilón. La probabilidad
// de que sea Doxite en vez de Voxite/Pixite crece con el paso.
function treasureHuntCryptReward(step) {
  const doxiteChance = Math.min(0.5, 0.1 + step * 0.025);
  const voxiteChance = 0.4;
  const roll = Math.random();
  const crystalType = roll < doxiteChance ? 'doxite' : roll < doxiteChance + voxiteChance ? 'voxite' : 'pixite';
  const crystalAmount = crystalType === 'doxite' ? 1 : crystalType === 'voxite' ? 2 : 3;
  return { crystalType, crystalAmount };
}
// Altar de Sacrificio: sin combate, apuesta una parte GRANDE del Texel YA
// ACUMULADO en el botín (a diferencia del Mercader, que siempre da algo
// seguro a cambio) por una POSIBILIDAD de un cristal grande — puede no
// dar nada en absoluto, un riesgo real y deliberado en vez del riesgo
// pasivo de la Trampa.
function treasureHuntSacrificeResult(pool) {
  const spend = Math.min(pool.texel, Math.round(pool.texel * (0.4 + Math.random() * 0.2)));
  if (Math.random() < 0.5) return { kind: 'fail', spend };
  const crystalType = Math.random() < 0.4 ? 'doxite' : 'voxite';
  return { kind: 'success', spend, crystalType, crystalAmount: crystalType === 'doxite' ? 2 : 3 };
}
function treasureHuntGuardianReward() {
  const crystalType = Math.random() < 0.5 ? 'doxite' : 'voxite';
  return {
    texel: 420 + Math.round(Math.random() * 260), gemas: 18 + Math.round(Math.random() * 10),
    crystalType, crystalAmount: crystalType === 'doxite' ? 3 + Math.round(Math.random() * 2) : 5 + Math.round(Math.random() * 3),
  };
}

// ---------- Roguelike v2: encuentros por acto ----------
// A diferencia del viejo pool plano por rareza, cada acto pesca sus
// encuentros de los MOBS reales de las zonas de su propio tramo (ver
// ROGUELIKE_ACTS en data.js): un nodo de Combate usa un mob cualquiera de
// esas zonas, un nodo Élite usa el JEFE de una de esas zonas (que no sea el
// jefe final del acto, reservado para el nodo de Jefe) — así cada acto
// tiene encuentros diseñados con identidad propia de su propio "bioma", no
// tirados al azar de un pool genérico de todo el juego.
function roguelikeActMobPool(act) {
  const mobIds = new Set();
  act.zoneIds.forEach(zoneId => {
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return;
    [zone.pool[0], zone.pool[1]].forEach(id => { if (id) mobIds.add(id); });
  });
  const pool = [...mobIds].map(id => MOBS.find(m => m.id === id)).filter(Boolean);
  return pool.length ? pool : MOBS;
}
function roguelikeActEliteBossIds(act) {
  return act.zoneIds.map(zoneId => ZONES.find(z => z.id === zoneId)).filter(Boolean)
    .map(z => z.pool[2]).filter(id => id && id !== act.bossDefId);
}
function buildRoguelikeCombatRow(act, difficultyMult) {
  const pool = roguelikeActMobPool(act);
  const count = 2 + (Math.random() < 0.5 ? 1 : 0);
  const level = Math.min(XP_LEVEL_CAP, Math.round(18 * difficultyMult));
  const row = [];
  for (let i = 0; i < count; i++) {
    const def = pool[Math.floor(Math.random() * pool.length)];
    row.push(makeUnit('enemy', def.id, level));
  }
  return row;
}
function buildRoguelikeEliteRow(act, difficultyMult) {
  const eliteIds = roguelikeActEliteBossIds(act);
  const level = Math.min(XP_LEVEL_CAP, Math.round(28 * difficultyMult));
  if (!eliteIds.length) return [makeUnit('enemy', act.bossDefId, level, 0.8)];
  const id = eliteIds[Math.floor(Math.random() * eliteIds.length)];
  return [makeUnit('enemy', id, level, 0.9)];
}
function buildRoguelikeBossRow(act, difficultyMult) {
  return [makeUnit('enemy', act.bossDefId, Math.min(XP_LEVEL_CAP, Math.round(35 * difficultyMult)))];
}
function roguelikeTreasureNodeReward(difficultyMult) {
  return { texel: Math.round((60 + Math.random() * 60) * difficultyMult), gemas: Math.round(2 + Math.random() * 3) };
}
// 3 posibles resultados de un nodo de Evento — con "mejor resultado
// garantizado" si la reliquia r_eventluck está activa (nunca sale el
// hazard, ver bestOutcome).
function roguelikeEventNodeOutcome(bestOutcome) {
  const outcomes = [
    { kind: 'gemas', gemas: 6 + Math.round(Math.random() * 6) },
    { kind: 'heal', pct: 0.35 },
    { kind: 'hazard', lossPct: 0.1 },
  ];
  const pool = bestOutcome ? outcomes.slice(0, 2) : outcomes;
  return pool[Math.floor(Math.random() * pool.length)];
}
function roguelikeActRewards(actIdx) {
  const mult = roguelikeActDifficultyMult(actIdx);
  return { texel: Math.round(150 * mult), fighterXp: Math.round(120 * mult) };
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

// Escudo (Barrera de Piedra, ver SKILL_TYPES): absorbe daño ANTES que la
// vida, hasta agotarse o hasta que expiren sus turnos (ver tickTimers). Un
// golpe totalmente absorbido no llega a tocar la vida ni a cargar la ulti
// de quien lo recibe — un bloqueo completo de verdad, no una reducción.
function applyDamage(log, attacker, target, rawAmount, isCrit, label) {
  let amount = rawAmount;
  if (target.shield && target.shield.amount > 0) {
    const absorbed = Math.min(target.shield.amount, amount);
    target.shield.amount -= absorbed;
    amount -= absorbed;
    log.push({ type: 'shieldabsorb', unitId: target.id, amount: absorbed });
    if (target.shield.amount <= 0) target.shield = null;
  }
  if (amount <= 0) return;
  const before = target.hp;
  target.hp = Math.max(0, target.hp - amount);
  log.push({ type: 'attack', attackerId: attacker.id, targetId: target.id, amount, isCrit, label });
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

// AGI "efectiva" de un luchador contando su buff de Agilidad activo (ver
// Ráfaga de Viento en SKILL_TYPES) — a diferencia de atk/def, cuya lectura
// ya pasaba por sus buffs/debuffs aquí mismo, el resto del motor leía
// unit.agi en crudo en 4 sitios distintos (crítico, ganancia de carga de
// ulti ×2, orden de turnos) sin que ningún buff de Agilidad pudiera
// afectarles — necesario centralizarlo aquí para que Ráfaga de Viento
// tenga efecto de verdad en los 4 sitios a la vez.
function effectiveAgi(unit) {
  const buff = unit.buffs.find(b => b.stat === 'agi');
  return unit.agi * (1 + (buff ? buff.pct : 0));
}

function computeDamage(attacker, target, mult, useWis, forceCrit, ignoreDef) {
  const power = useWis ? attacker.wis : attacker.atk;
  const atkBuff = attacker.buffs.find(b => b.stat === 'atk');
  const power2 = power * (1 + (atkBuff ? atkBuff.pct : 0));
  const defDebuff = target.debuffs.find(b => b.stat === 'def');
  const defBuff = target.buffs.find(b => b.stat === 'def');
  let defVal = target.def * (1 + (defBuff ? defBuff.pct : 0)) * (1 - (defDebuff ? defDebuff.pct : 0));
  const base = Math.max(1, power2 - (ignoreDef ? 0 : defVal * 0.5));
  const elMult = elementDamageMult(attacker.element, target.element);
  const vulnMult = typeVulnerabilityMult(target.class, useWis);
  const variance = 0.9 + Math.random() * 0.2;
  const critChance = Math.min(40, 5 + effectiveAgi(attacker) * 0.15);
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
  if (unit.shield) {
    unit.shield.turnsLeft--;
    if (unit.shield.turnsLeft <= 0) unit.shield = null;
  }
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
    log.push({ type: 'stunned', unitId: unit.id, reason: unit.stunReason || 'stun' });
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
      const gain = Math.round(22 + effectiveAgi(unit) * 0.4);
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
      if (success) { target.stunTurns = (target.stunTurns || 0) + skill.turns; target.stunReason = 'stun'; }
      log.push({ type: 'stunattempt', unitId: unit.id, targetId: target.id, success });
      applyUltBonusHit(log, unit, enemyRow, skill, target);
      break;
    }
    case 'dot': {
      // Daño instantáneo más flojo que golpear, pero deja un veneno que
      // sigue mordiendo varios turnos — bueno contra objetivos que curan
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
    case 'burn': {
      // Quemadura: como el veneno, un DoT que ignora defensa, pero además
      // el propio fuego debilita al objetivo mientras arde (debuff de
      // Ataque durante los mismos turnos) — un veneno puro no toca stats.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      if (target.alive) {
        const tick = Math.max(1, Math.round(target.maxHp * skill.dotPct));
        target.dots.push({ amount: tick, turnsLeft: skill.dotTurns, label: skill.name });
        target.debuffs.push({ stat: 'atk', pct: skill.burnAtkPct, turnsLeft: skill.dotTurns });
        log.push({ type: 'debuff', unitId: unit.id, targetId: target.id, stat: 'atk', pct: skill.burnAtkPct });
      }
      break;
    }
    case 'freeze': {
      // Congelación: SIEMPRE ralentiza (debuff de Agilidad garantizado,
      // varios turnos) y además tiene una probabilidad de congelar del
      // todo (pierde el turno entero, como aturdir pero con probabilidad
      // propia) — a diferencia de aturdir (solo probabilidad, sin ralentizar
      // si falla) o debilitar (solo debuff, nunca hace perder el turno).
      const target = pickTarget(enemyRow);
      if (!target) break;
      const success = Math.random() < skill.chance;
      if (success) { target.stunTurns = (target.stunTurns || 0) + skill.freezeTurns; target.stunReason = 'freeze'; }
      target.debuffs.push({ stat: 'agi', pct: skill.slowPct, turnsLeft: skill.slowTurns });
      log.push({ type: 'freezeattempt', unitId: unit.id, targetId: target.id, success });
      log.push({ type: 'debuff', unitId: unit.id, targetId: target.id, stat: 'agi', pct: skill.slowPct });
      applyUltBonusHit(log, unit, enemyRow, skill, target);
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
        fallen.buffs = []; fallen.debuffs = []; fallen.dots = []; fallen.stunTurns = 0; fallen.shield = null;
        log.push({ type: 'revive', unitId: unit.id, targetId: fallen.id, amount: fallen.hp });
      }
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'shieldRow': {
      // Barrera de Piedra: da a cada aliado vivo un escudo propio (importe
      // según SU PROPIA vida máxima) que absorbe daño antes que la vida —
      // ver applyDamage. Expira solo por turnos (tickTimers), no por uso:
      // puede absorber varios golpes seguidos mientras dure el importe.
      ownRow.filter(u => u.alive).forEach(ally => {
        const amount = Math.round(ally.maxHp * skill.shieldPct);
        ally.shield = { amount, turnsLeft: skill.turns };
        log.push({ type: 'shield', unitId: ally.id, amount });
      });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'trueDamage': {
      // Golpe Perforante: ignora la Defensa del objetivo por completo (ver
      // el parámetro ignoreDef de computeDamage) — sigue afectado por
      // elemento/vulnerabilidad/crítico igual que cualquier otro golpe.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis, false, true);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      break;
    }
    case 'damageDouble': {
      // Doble Golpe: repite pickTarget tantas veces como skill.hits — si el
      // primer objetivo muere, el siguiente golpe ya elige entre los que
      // queden vivos, nunca golpea a un enemigo ya derrotado.
      for (let i = 0; i < skill.hits; i++) {
        const target = pickTarget(enemyRow);
        if (!target) break;
        const { amount, isCrit } = computeDamage(unit, target, skill.mult, !!skill.usesWis);
        applyDamage(log, unit, target, amount, isCrit, skill.name);
      }
      break;
    }
    case 'execute': {
      // Golpe de Gracia: el multiplicador de daño sube cuanta menos vida le
      // quede al objetivo (hasta +executeBonusMult al 0% de vida) — pickTarget
      // ya prioriza el objetivo con menos vida el 70% de las veces, así que
      // esta ulti tiende a rematar a quien ya esté más débil.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const missingFrac = 1 - target.hp / target.maxHp;
      const finalMult = skill.mult * (1 + skill.executeBonusMult * missingFrac);
      const { amount, isCrit } = computeDamage(unit, target, finalMult, !!skill.usesWis);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      break;
    }
    case 'dispel': {
      // Corromper: el espejo de "cleanse" pero contra el rival — quita
      // cualquier buff (ataque/defensa/agilidad) activo de toda la fila
      // enemiga. No toca debuffs/dots/aturdimiento (esos son negativos para
      // ELLOS, no algo que "corromper" tenga sentido que quite).
      enemyRow.filter(u => u.alive).forEach(target => {
        const hadBuffs = target.buffs.length > 0;
        target.buffs = [];
        if (hadBuffs) log.push({ type: 'dispel', unitId: target.id });
      });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'chargeDrain': {
      // Sabotaje: resta carga de ulti a un enemigo, retrasando su próxima
      // ulti — reutiliza el propio evento 'charge' (ya sincronizado por la
      // UI) para reflejar el nuevo valor, además de 'chargedrain' para el
      // mensaje de combate.
      const target = pickTarget(enemyRow);
      if (!target) break;
      const before = target.ultCharge;
      target.ultCharge = Math.max(0, target.ultCharge - skill.drainAmount);
      if (before !== target.ultCharge) {
        log.push({ type: 'chargedrain', unitId: unit.id, targetId: target.id, amount: before - target.ultCharge });
        log.push({ type: 'charge', unitId: target.id, value: target.ultCharge });
      }
      applyUltBonusHit(log, unit, enemyRow, skill, target);
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
  const allUnits = [...playerRow, ...enemyRow];
  // Efectos de varios turnos (buffs/debuffs/veneno-quemadura/escudo) decaen
  // UNA VEZ POR RONDA, aquí al principio para TODO el mundo a la vez —
  // antes se ticaban dentro del bucle de abajo, en el turno individual de
  // cada uno, lo que dejaba duraciones asimétricas para un efecto aplicado
  // a la vez a varias unidades por la misma ulti de fila (reportado por el
  // usuario: un escudo de fila mostraba "2 turnos" en un luchador y "1
  // turno" en otro que lo recibió en el mismo instante). La causa: quien
  // actuara DESPUÉS del lanzador dentro de esa misma ronda recibía un tic
  // de más (el de su propio turno, de camino) que quien ya hubiera
  // actuado ANTES no recibía hasta la ronda siguiente. Tickando aquí,
  // antes de que nadie actúe todavía, cualquier efecto aplicado DURANTE
  // esta ronda (por una ulti que actúe más tarde) queda intacto hasta el
  // principio de la ronda siguiente, para todos por igual, sin importar
  // el orden de turnos. El aturdimiento (stunTurns) se queda fuera a
  // propósito: su cuenta atrás significa literalmente "sáltate tus
  // próximos N turnos", así que sigue consumiéndose en el turno propio de
  // cada uno (ver performTurn), no aquí.
  allUnits.forEach(u => { if (u.alive) tickTimers(u, log); });
  const order = allUnits.filter(u => u.alive).sort((a, b) => effectiveAgi(b) - effectiveAgi(a) || Math.random() - 0.5);
  const seen = new Set(order.map(u => u.id));
  for (let i = 0; i < order.length; i++) {
    const unit = order[i];
    if (!unit.alive) continue;
    const ownRow = unit.side === 'player' ? playerRow : enemyRow;
    const foeRow = unit.side === 'player' ? enemyRow : playerRow;
    if (!rowAlive(ownRow) || !rowAlive(foeRow)) break;
    performTurn(log, unit, ownRow, foeRow);
    // Un aliado revivido a mitad de ronda (ver kind:'revive' en
    // performTurn) estaba muerto cuando se calculó `order` arriba, así
    // que se quedaba sin actuar hasta la ronda siguiente aunque fuera
    // más ágil que quien lo revivió — insertado ahora en lo que queda de
    // ESTA ronda, en la posición que le tocaría por agilidad como a
    // cualquier otro (antes del primero más lento que él entre los que
    // todavía no han actuado).
    allUnits.forEach(u => {
      if (!u.alive || seen.has(u.id)) return;
      seen.add(u.id);
      let insertAt = order.length;
      for (let j = i + 1; j < order.length; j++) {
        if (effectiveAgi(order[j]) < effectiveAgi(u)) { insertAt = j; break; }
      }
      order.splice(insertAt, 0, u);
    });
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
  const gainPerTurn = Math.round(22 + effectiveAgi(unit) * 0.4);
  return Math.max(1, Math.ceil((ULT_CHARGE_MAX - unit.ultCharge) / gainPerTurn));
}
