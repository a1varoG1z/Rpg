// Motor de combate: generación de monstruos, ataques, habilidades y recompensas.
const EVENTS = [];
function emit(type, data) { EVENTS.push(Object.assign({ type }, data || {})); }

const MONSTER_ATK_SPEED_BASE = 0.7;
const TAP_COOLDOWN_MS = 200;
let lastTapTime = 0;

function spawnMonster(state) {
  const loc = locationById(state.combat.locationId);
  const wave = state.combat.wave;
  const isBoss = wave % BOSS_WAVE_INTERVAL === 0;
  const growth = Math.pow(WAVE_GROWTH, wave - 1);

  let hp = loc.base.hp * growth;
  let atk = loc.base.atk * growth;
  let def = loc.base.def * growth;
  let gold = loc.base.gold * growth;
  let xp = loc.base.xp * growth;

  let def2 = { name: '', emoji: '' };
  if (isBoss) {
    hp *= BOSS_HP_MULT; atk *= BOSS_ATK_MULT; def *= BOSS_DEF_MULT;
    gold *= BOSS_REWARD_MULT; xp *= BOSS_REWARD_MULT;
    def2 = loc.boss;
  } else {
    def2 = loc.monsters[Math.floor(Math.random() * loc.monsters.length)];
  }

  state.combat.monster = {
    name: def2.name, emoji: def2.emoji, isBoss,
    hp: Math.round(hp), maxHp: Math.round(hp),
    atk: atk, def: def,
    goldReward: Math.round(gold), xpReward: Math.round(xp),
  };
  state.combat.heroAtkTimer = 0;
  state.combat.monsterAtkTimer = 0;
}

function ensureMonster(state) {
  if (!state.combat.monster) spawnMonster(state);
}

function rollDamage(atk, def, critChance, critMult) {
  const base = Math.max(1, atk - def * 0.5);
  const variance = base * (0.9 + Math.random() * 0.2);
  const isCrit = Math.random() * 100 < critChance;
  const dmg = isCrit ? variance * critMult : variance;
  return { amount: Math.max(1, Math.round(dmg)), isCrit };
}

function damageMonster(state, amount, isCrit) {
  const m = state.combat.monster;
  if (!m) return;
  m.hp -= amount;
  emit('damage', { target: 'monster', amount, isCrit });
  if (m.hp <= 0) killMonster(state);
}

function killMonster(state) {
  const m = state.combat.monster;
  state.hero.gold += m.goldReward;
  state.stats.totalGoldEarned += m.goldReward;
  state.stats.totalKills++;
  const leveled = addXp(state, m.xpReward);
  emit('kill', { name: m.name, gold: m.goldReward, xp: m.xpReward, isBoss: m.isBoss });
  if (leveled) emit('levelup', { level: state.hero.level });

  const dropChance = m.isBoss ? 1 : 0.12;
  if (Math.random() < dropChance) {
    const slot = SLOTS[Math.floor(Math.random() * SLOTS.length)];
    const item = generateItem(slot, state.hero.level, m.isBoss);
    addItemToInventory(state, item);
    emit('drop', { item });
  }

  if (m.isBoss) {
    const loc = locationById(state.combat.locationId);
    const idx = LOCATIONS.findIndex(l => l.id === loc.id);
    const next = LOCATIONS[idx + 1];
    if (next && !isLocationUnlocked(state, next.id)) {
      state.progress.unlockedLocations.push(next.id);
      state.progress.bestWave[next.id] = 0;
      emit('locationUnlock', { location: next });
    }
  }

  const bw = state.progress.bestWave[state.combat.locationId] || 0;
  if (state.combat.wave > bw) state.progress.bestWave[state.combat.locationId] = state.combat.wave;

  state.combat.wave++;
  state.combat.monster = null;
  spawnMonster(state);
}

function damageHero(state, amount) {
  const h = state.hero;
  h.hp -= amount;
  emit('damage', { target: 'hero', amount, isCrit: false });
  if (h.hp <= 0) {
    h.hp = 0;
    state.combat.respawnTimer = 3;
    emit('herodeath', {});
  }
}

function skillDef(id) { return SKILLS.find(s => s.id === id); }

function useSkill(state, skillId) {
  const def = skillDef(skillId);
  const learned = state.skills[skillId];
  if (!def || !learned || learned.level <= 0) return false;
  if (state.hero.level < def.unlockLevel) return false;
  const cd = state.combat.skillCooldowns[skillId] || 0;
  if (cd > 0) return false;
  if (state.combat.respawnTimer > 0) return false;
  ensureMonster(state);

  if (def.power) {
    const hits = def.hits || 1;
    for (let i = 0; i < hits; i++) {
      const dmg = Math.round(state.hero.derived.atk * def.power(learned.level));
      damageMonster(state, dmg, false);
      if (!state.combat.monster) break;
    }
  }
  if (def.buffPct) {
    state.combat.buff = { type: 'atk', pct: def.buffPct(learned.level), timeLeft: def.buffDuration };
    recalcDerived(state);
  }
  if (def.healPct) {
    state.hero.hp = Math.min(state.hero.derived.maxHp, state.hero.hp + Math.round(state.hero.derived.maxHp * def.healPct(learned.level)));
  }
  state.combat.skillCooldowns[skillId] = def.cooldown(learned.level);
  emit('skillused', { skillId });
  return true;
}

function upgradeSkill(state, skillId) {
  const def = skillDef(skillId);
  const learned = state.skills[skillId];
  if (!def || !learned) return false;
  if (state.hero.level < def.unlockLevel) return false;
  if (learned.level >= def.maxLevel) return false;
  const cost = def.cost(learned.level);
  if (state.hero.gold < cost) return false;
  state.hero.gold -= cost;
  learned.level++;
  return true;
}

function tapAttack(state) {
  const now = Date.now();
  if (now - lastTapTime < TAP_COOLDOWN_MS) return;
  if (state.combat.respawnTimer > 0) return;
  lastTapTime = now;
  ensureMonster(state);
  const dmg = Math.max(1, Math.round(state.hero.derived.atk * 0.25));
  damageMonster(state, dmg, false);
  emit('tap', {});
}

function travelToLocation(state, locId) {
  if (!isLocationUnlocked(state, locId)) return false;
  state.combat.locationId = locId;
  state.combat.wave = Math.max(1, state.progress.bestWave[locId] || 1);
  state.combat.monster = null;
  state.combat.buff = null;
  spawnMonster(state);
  return true;
}

function tickCombat(state, dt) {
  recalcDerived(state);
  const c = state.combat;

  if (c.respawnTimer > 0) {
    c.respawnTimer -= dt;
    if (c.respawnTimer <= 0) {
      c.respawnTimer = 0;
      state.hero.hp = state.hero.derived.maxHp;
    }
    return;
  }

  ensureMonster(state);

  for (const id in c.skillCooldowns) {
    if (c.skillCooldowns[id] > 0) c.skillCooldowns[id] = Math.max(0, c.skillCooldowns[id] - dt);
  }

  if (c.buff) {
    c.buff.timeLeft -= dt;
    if (c.buff.timeLeft <= 0) { c.buff = null; recalcDerived(state); }
  }

  const h = state.hero;
  c.heroAtkTimer += dt;
  const heroInterval = 1 / Math.max(0.1, h.derived.atkSpeed);
  if (c.heroAtkTimer >= heroInterval) {
    c.heroAtkTimer -= heroInterval;
    const { amount, isCrit } = rollDamage(h.derived.atk, c.monster.def, h.derived.critChance, h.derived.critMult);
    damageMonster(state, amount, isCrit);
  }

  if (!c.monster) return;
  const monsterInterval = 1 / MONSTER_ATK_SPEED_BASE;
  c.monsterAtkTimer += dt;
  if (c.monsterAtkTimer >= monsterInterval) {
    c.monsterAtkTimer -= monsterInterval;
    const { amount } = rollDamage(c.monster.atk, h.derived.def, 0, 1);
    damageHero(state, amount);
  }
}
