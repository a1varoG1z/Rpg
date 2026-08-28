// Motor de combate por bandas: filas de hasta 3 luchadores luchan contra la fila
// activa rival, turno a turno, hasta que una banda entera cae.
let unitSeq = 1;

function buildUnitStats(defId, level, extraMult) {
  const def = fighterDef(defId);
  const w = CLASS_INFO[def.class].weights;
  const mult = rarityInfo(def.rarity).mult * levelGrowth(level) * (extraMult || 1);
  return {
    maxHp: Math.round(w.hp * mult * statVarianceMult(def.family, 'hp')),
    atk: Math.round(w.atk * mult * statVarianceMult(def.family, 'atk')),
    def: Math.round(w.def * mult * statVarianceMult(def.family, 'def')),
    agi: Math.round(w.agi * mult * statVarianceMult(def.family, 'agi')),
    wis: Math.round(w.wis * mult * statVarianceMult(def.family, 'wis')),
  };
}

function makeUnit(side, defId, level, extraMult, sourceUid) {
  const def = fighterDef(defId);
  const stats = buildUnitStats(defId, level, extraMult);
  return {
    id: 'u' + (unitSeq++), side, defId, sourceUid: sourceUid || null,
    name: def.name, element: def.element, class: def.class, rarity: def.rarity,
    level, maxHp: stats.maxHp, hp: stats.maxHp, atk: stats.atk, def: stats.def, agi: stats.agi, wis: stats.wis,
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
function makeBossUnit(defId, level) {
  const u = makeUnit('enemy', defId, level);
  u.maxHp = Math.round(u.maxHp * 2.4);
  u.hp = u.maxHp;
  return u;
}

// Cada fila devuelta aquí se planta como un nodo/encuentro separado del
// recorrido de la etapa (ver UI.renderStageRun). Las etapas normales nunca
// bajan de 2 oleadas y siempre presentan 3 rivales por oleada (aunque alguno
// sea de relleno más débil); el jefe de zona es la única pelea contra un
// único rival, sin oleadas previas.
function buildEnemyBand(zoneIdx, stageIdx) {
  const zone = ZONES[zoneIdx];
  const isBoss = stageIdx === STAGES_PER_ZONE - 1;
  const globalIdx = zoneIdx * STAGES_PER_ZONE + stageIdx;
  // El jugador tiene un tope de nivel (XP_LEVEL_CAP); el rival no debe
  // superarlo nunca, o las últimas zonas se vuelven matemáticamente
  // imposibles por mucho que se invierta en equipo/rareza/estrellas (con
  // 33 zonas de 8 etapas, sin este tope el rival llegaba a nivel 264 frente
  // a un jugador tope 40 — más de 3 veces su multiplicador de stats en la
  // última zona). A partir de aquí la dificultad la aporta solo la rareza
  // creciente del pool de cada zona (ver ZONES), que ya escala de Común a
  // Épico por su cuenta.
  const level = Math.min(XP_LEVEL_CAP, Math.max(1, 1 + globalIdx));
  if (isBoss) {
    return { rows: [[makeBossUnit(zone.pool[2], level)]], isBoss, level };
  }
  const rowCount = stageIdx < 3 ? 2 : 3;
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const row = [];
    for (let i = 0; i < 3; i++) {
      const pick = zone.pool[Math.floor(Math.random() * Math.min(2, zone.pool.length))];
      row.push(makeUnit('enemy', pick, level));
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
function buildTorreEncounters(level) {
  const perRow = level.kind === 'boss' ? 1 : 3;
  const rows = [];
  let remaining = level.enemyCount;
  while (remaining > 0) {
    const count = Math.min(perRow, remaining);
    const row = [];
    for (let i = 0; i < count; i++) {
      row.push(level.kind === 'boss' ? makeBossUnit(level.fightDefId, level.enemyLevel) : makeUnit('enemy', level.fightDefId, level.enemyLevel));
    }
    rows.push(row);
    remaining -= count;
  }
  return rows;
}

function stageRewards(zoneIdx, stageIdx, isBoss) {
  const globalIdx = zoneIdx * STAGES_PER_ZONE + stageIdx;
  const texel = Math.round((20 + globalIdx * 8) * (isBoss ? 3 : 1));
  const fighterXp = Math.round((15 + globalIdx * 4) * (isBoss ? 2.5 : 1));
  const drops = { pixite: 0, voxite: 0, doxite: 0, gear: null };
  if (isBoss) {
    drops.voxite = 1;
    if (Math.random() < 0.3) drops.doxite = 1;
    if (Math.random() < 0.7) drops.gear = generateGear(randomGearSlot(), gearDropRarity(globalIdx));
  } else {
    if (Math.random() < 0.35) drops.pixite = 1;
    if (Math.random() < 0.3) drops.gear = generateGear(randomGearSlot(), gearDropRarity(globalIdx));
  }
  return { texel, fighterXp, drops };
}

function gearDropRarity(globalIdx) {
  const roll = Math.random() + globalIdx * 0.01;
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

// --- Motor de turnos ---
function elementDamageMult(a, d) { return elementMultiplier(a, d); }

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

function applyDamage(log, attacker, target, rawAmount, isCrit, label) {
  const before = target.hp;
  target.hp = Math.max(0, target.hp - rawAmount);
  log.push({ type: 'attack', attackerId: attacker.id, targetId: target.id, amount: rawAmount, isCrit, label });
  if (before > 0 && target.hp <= 0) {
    target.alive = false;
    log.push({ type: 'faint', unitId: target.id, side: target.side });
  } else if (target.alive) {
    target.ultCharge = Math.min(ULT_CHARGE_MAX, target.ultCharge + ULT_CHARGE_ON_HIT);
    log.push({ type: 'charge', unitId: target.id, value: target.ultCharge });
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

function computeDamage(attacker, target, mult, useWis) {
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
  const isCrit = Math.random() * 100 < critChance;
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
  const { amount, isCrit } = computeDamage(unit, target, skill.bonusHitMult, false);
  applyDamage(log, unit, target, amount, isCrit, skill.name);
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
    const { amount, isCrit } = computeDamage(unit, target, 1.0, false);
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
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, false);
      applyDamage(log, unit, target, amount, isCrit, skill.name);
      if (skill.selfBuff) { unit.buffs.push({ stat: skill.selfBuff.stat, pct: skill.selfBuff.pct, turnsLeft: skill.selfBuff.turns }); log.push({ type: 'buff', unitId: unit.id, stat: skill.selfBuff.stat, pct: skill.selfBuff.pct }); }
      break;
    }
    case 'damageRow': {
      enemyRow.filter(u => u.alive).forEach(target => {
        const { amount, isCrit } = computeDamage(unit, target, skill.mult, true);
        applyDamage(log, unit, target, amount, isCrit, skill.name);
      });
      break;
    }
    case 'heal': {
      const amount = Math.round(unit.maxHp * skill.pct);
      unit.hp = Math.min(unit.maxHp, unit.hp + amount);
      log.push({ type: 'heal', unitId: unit.id, targetId: unit.id, amount });
      applyUltBonusHit(log, unit, enemyRow, skill);
      break;
    }
    case 'healRow': {
      ownRow.filter(u => u.alive).forEach(ally => {
        const amount = Math.round(ally.maxHp * skill.pct);
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
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, false);
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
      const { amount, isCrit } = computeDamage(unit, target, skill.mult, false);
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
