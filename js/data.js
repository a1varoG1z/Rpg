// Datos estáticos: elementos, clases, rareza, luchadores, zonas y habilidades.

// Sistema de rareza igual que D.o.T.: 5 escalones (Común/Infrecuente/Raro/Épico/Legendario).
// Cada luchador evoluciona exactamente 2 veces (3 formas), pero según su "tier" de
// partida ocupa un tramo distinto de esta escalera de 5 — solo los que arrancan en
// Raro (tier 3) llegan a Legendario; ver comentario sobre FIGHTERS más abajo.
const RARITIES = [
  { id: 'comun', label: 'Común', color: '#a8a8a0', glow: 'rgba(168,168,160,0.55)', mult: 1.0, icon: '⚪' },
  { id: 'infrecuente', label: 'Infrecuente', color: '#4caf6b', glow: 'rgba(76,175,107,0.55)', mult: 1.5, icon: '🟢' },
  { id: 'raro', label: 'Raro', color: '#3f9fe0', glow: 'rgba(63,159,224,0.6)', mult: 2.2, icon: '🔵' },
  { id: 'epico', label: 'Épico', color: '#a463e0', glow: 'rgba(164,99,224,0.65)', mult: 3.2, icon: '🟣' },
  { id: 'legendario', label: 'Legendario', color: '#e8a23c', glow: 'rgba(232,162,60,0.75)', mult: 4.6, icon: '🟡' },
];
function rarityInfo(id) { return RARITIES.find(r => r.id === id) || RARITIES[0]; }
function rarityIndex(id) { return RARITIES.findIndex(r => r.id === id); }

// Los jefes de zona son visualmente su propio tier — ni Épico ni Raro ni
// nada de la escalera de RARITIES — para que se reconozcan de un vistazo
// como antagonistas y no como una criatura reclutable más. Es SOLO una
// etiqueta de presentación (color rojo distintivo, "Jefe" en vez de un
// nombre de rareza): la rareza real de def.rarity se sigue usando tal cual
// para las estadísticas/nivel/venta de una copia que el jugador llegue a
// poseer (ver Torre Batalla), y las stats de COMBATE del jefe como rival
// vienen de def.fixedStats (ver más abajo), no de esta escalera.
const BOSS_RARITY_INFO = { id: 'jefe', label: 'Jefe', color: '#e0392b', glow: 'rgba(224,57,43,0.8)', mult: 1, icon: '💀' };
function rarityInfoFor(def) { return def.isBoss ? BOSS_RARITY_INFO : rarityInfo(def.rarity); }

const ELEMENT_ORDER = ['fuego', 'viento', 'tierra', 'rayo', 'agua'];
const ELEMENT_INFO = {
  fuego: { label: 'Fuego', icon: '🔥', color: '#e0512f', shade: '#7a2216', glow: '#ffb23c', beats: 'viento' },
  viento: { label: 'Viento', icon: '🌪️', color: '#5fbf7a', shade: '#2b5c3a', glow: '#eaffea', beats: 'tierra' },
  tierra: { label: 'Tierra', icon: '⛰️', color: '#a9793f', shade: '#5a3c1c', glow: '#d9e07a', beats: 'rayo' },
  rayo: { label: 'Rayo', icon: '⚡', color: '#a24bd9', shade: '#4a1c73', glow: '#f5e34b', beats: 'agua' },
  agua: { label: 'Agua', icon: '💧', color: '#2f83d9', shade: '#12386b', glow: '#7be0ff', beats: 'fuego' },
};
function elementMultiplier(atkEl, defEl) {
  if (ELEMENT_INFO[atkEl].beats === defEl) return 1.25;
  if (ELEMENT_INFO[defEl].beats === atkEl) return 0.8;
  return 1.0;
}

// weights de Gurú subidos (85/9/10/16/28 → 102/11/12/19/34), a petición
// explícita del usuario tras comprobar con datos reales que "Ra, Señor del
// Sol" (Legendario) quedaba por DEBAJO de varias cartas Épicas al comparar
// en Nv.1 sin equipo — no era un bug puntual de Ra, sino que Gurú es
// estructuralmente la clase más floja bajo fighterPowerScore (hp*0.3+atk+
// def+agi*0.5+wis*0.5): con los pesos antiguos su "poder" implícito
// (85*0.3+9+10+16*0.5+28*0.5=66.5) queda un 25-34% por debajo de las otras
// 4 clases (75-89.5), así que hasta un Legendario Gurú (mult ×4.6) podía
// perder contra un Épico de otra clase (mult ×3.2) — ya le pasó antes a
// "Odín, Padre de Todo" (mismo problema, también Gurú). Mismo motivo
// exacto que ya arregló ENEMY_CLASS_TOUGHNESS_MULT para Campeón como
// RIVAL (combat.js) — aquí es la clase la que estaba mal calibrada como
// stats base, no un ajuste de rival. Subida SOLO Gurú (no las demás
// clases, ya dentro de un rango razonable entre sí) hasta un "poder"
// implícito de ~80 (escala ×1.203 sobre los 5 números, preservando la
// identidad de la clase — sigue siendo la de más WIS y de las de menos
// ATK/DEF, solo que ya no es la más floja en total). Verificado por
// simulación: "Ra, Señor del Sol" pasa de ser la carta más floja de su
// nivel (293 de poder, por debajo de 9 Épicos distintos) a la más fuerte
// con clara diferencia (352, por delante de los mismos 9 Épicos) — ver
// TODO.md para la comparación completa.
const CLASS_INFO = {
  campeon: { label: 'Campeón', icon: '🛡️', role: 'Tanque', weights: { hp: 145, atk: 17, def: 22, agi: 8, wis: 6 } },
  picaro: { label: 'Pícaro', icon: '🗡️', role: 'Daño físico', weights: { hp: 90, atk: 26, def: 10, agi: 22, wis: 6 } },
  guru: { label: 'Gurú', icon: '🔮', role: 'Daño mágico', weights: { hp: 102, atk: 11, def: 12, agi: 19, wis: 34 } },
  brujo: { label: 'Brujo', icon: '💀', role: 'Híbrido', weights: { hp: 100, atk: 21, def: 14, agi: 10, wis: 24 } },
  explorador: { label: 'Explorador', icon: '🏹', role: 'Soporte', weights: { hp: 100, atk: 16, def: 14, agi: 18, wis: 12 } },
};

// Sistema de tipos/tribus (referencia: reference/dot-original/tribu-tipo-ayuda.jpg
// — Champ/Guru/Rogue/Scout/Warlock). Cada clase ya tenía un perfil de stats
// distinto (arriba); esto añade la parte de vulnerabilidades que faltaba:
// un daño extra al recibir el tipo de ataque al que esa clase es débil.
// "Mágico" = ataques que usan Sabiduría en vez de Ataque (por ahora, las
// ultis de fila como Arrasar); todo lo demás (golpes básicos y ultis de un
// solo objetivo) cuenta como "físico". Ver applyTypeVulnerability en combat.js.
const TYPE_VULNERABILITY = {
  campeon: { magic: 0.25, desc: 'Vulnerable a ataques mágicos (+25% de daño mágico recibido).' },
  guru: { physical: 0.25, desc: 'Vulnerable a ataques físicos (+25% de daño físico recibido).' },
  picaro: { physical: 0.12, magic: 0.12, desc: 'Vulnerable a cualquier ataque (+12% de daño recibido, físico o mágico).' },
  explorador: { desc: 'Equilibrado: sin vulnerabilidad especial.' },
  brujo: { physical: 0.10, magic: 0.10, desc: 'Cruce entre Campeón y Gurú: algo vulnerable a ambos tipos de daño (+10% cada uno).' },
};

// Individualiza un poco las stats de cada familia dentro de su clase (antes
// todas las familias de una misma clase tenían exactamente el mismo perfil,
// solo con rareza/nivel distintos). La variación es determinista (siempre
// la misma para una familia+stat dados, ni aleatoria en cada partida ni
// necesita datos a mano por cada una de las +130 familias) y moderada
// (±12%), para no desequilibrar el juego.
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
function statVarianceMult(family, statKey) {
  const seed = hashStr(family + ':' + statKey);
  const frac = (((seed % 2000) + 2000) % 2000) / 2000; // 0..1 determinista
  return 0.88 + frac * 0.24; // 0.88 .. 1.12
}

// Multiplicador manual OPCIONAL por personaje, encima de todo lo anterior
// (rareza × nivel × clase × statVarianceMult). A diferencia de hardcodear
// las stats de cero (ver TODO.md — descartado por el mantenimiento que
// supondría en +330 luchadores), esto es un ajuste puntual: solo lo lleva
// el personaje al que se le asigne con setStatMult, nadie más, y sigue
// heredando el escalado automático de rareza/nivel de la fórmula. Se
// aplica tanto a stats de luchador jugable (fighterStats, state.js) como
// de rival del Mapa/Torre (buildUnitStats, combat.js) — un personaje
// jugable con statMult que además aparezca como enemigo en el pool de
// alguna zona lo mantiene en ambos papeles. NO afecta a los jefes de zona
// (fixedStats ya es su propio mecanismo de stats a mano, ver addBoss).
function fighterStatMult(def, statKey) {
  return (def.statMult && def.statMult[statKey]) || 1;
}
function setStatMult(defId, mults) {
  const d = fighterDef(defId);
  if (d) d.statMult = mults;
}

// usesWis: true marca las ultis de cariz mágico/místico (curar, bendecir,
// purificar, revivir, arrasar) — su golpe extra (bonusHitMult) y su daño
// principal usan WIS en vez de ATK en computeDamage (combat.js), y las de
// curación además escalan el propio importe curado con el WIS de quien
// cura (ver 'heal'/'healRow' en performTurn). Son ultis EXCLUSIVAS de
// Gurú (y arrasar, de Brujo/Gurú) — así WIS deja de ser decorativo para
// ellos, sin tocar Campeón/Pícaro/Explorador (golpe, furia, escudo, grito,
// aturdir, veneno, drenar siguen con ATK). "Marca Débil" (debilitar) se
// queda a propósito fuera aunque también la lleven Brujo/Gurú: un 43% de
// sus usuarios son Explorador (30 de 69 familias), cuyo ATK (16) supera a
// su WIS (12, ver CLASS_INFO) — cambiarla a WIS los habría debilitado.
const SKILL_TYPES = {
  golpe: { name: 'Golpe Certero', kind: 'damage', mult: 2.2, target: 'single', desc: 'Un golpe demoledor a un enemigo, mucho más fuerte que un golpe normal.' },
  furia: { name: 'Furia Salvaje', kind: 'damage', mult: 2.0, target: 'single', selfBuff: { stat: 'atk', pct: 0.15, turns: 2 }, desc: 'Golpea con mucha fuerza y se enardece.' },
  arrasar: { name: 'Arrasar', kind: 'damageRow', mult: 1.5, target: 'row', usesWis: true, desc: 'Daño mágico considerable a toda la fila enemiga.' },
  // El resto de ultis (curar, defensivas, de estado...) no hacían daño al
  // rival, así que un turno de ulti podía no aportar nada de daño — ahora
  // TODAS golpean también a un enemigo (bonusHitMult), más flojo que un
  // ulti de daño puro pero cercano a un golpe normal, para que ningún
  // turno se quede sin hacer daño.
  curar: { name: 'Bendición Sanadora', kind: 'heal', pct: 0.3, target: 'self', bonusHitMult: 0.85, usesWis: true, desc: 'Recupera parte de su propia vida y golpea a un enemigo.' },
  bendicion: { name: 'Aura Vital', kind: 'healRow', pct: 0.16, target: 'row-ally', bonusHitMult: 0.85, usesWis: true, desc: 'Cura a toda su fila y golpea a un enemigo.' },
  escudo: { name: 'Muro de Escamas', kind: 'buffSelf', stat: 'def', pct: 0.35, turns: 3, bonusHitMult: 0.85, desc: 'Refuerza su propia defensa y golpea a un enemigo.' },
  grito: { name: 'Grito de Guerra', kind: 'buffRow', stat: 'atk', pct: 0.2, turns: 3, bonusHitMult: 0.85, desc: 'Aumenta el ataque de su fila y golpea a un enemigo.' },
  debilitar: { name: 'Marca Débil', kind: 'debuff', stat: 'def', pct: 0.25, turns: 3, target: 'single', bonusHitMult: 0.85, desc: 'Reduce la defensa de un enemigo y lo golpea.' },
  aturdir: { name: 'Onda de Trueno', kind: 'stun', turns: 1, chance: 0.65, target: 'single', bonusHitMult: 0.85, desc: 'Puede aturdir a un enemigo y siempre lo golpea.' },
  veneno: { name: 'Mordisco Venenoso', kind: 'dot', mult: 1.5, dotPct: 0.07, dotTurns: 3, target: 'single', desc: 'Golpea con fuerza a un enemigo y lo envenena: sigue perdiendo vida 3 turnos, ignorando su defensa.' },
  drenar: { name: 'Golpe Vampírico', kind: 'drain', mult: 1.8, drainPct: 0.5, target: 'single', desc: 'Golpea con fuerza a un enemigo y recupera la mitad del daño hecho como vida propia.' },
  purificar: { name: 'Aura Purificadora', kind: 'cleanse', target: 'row-ally', bonusHitMult: 0.85, usesWis: true, desc: 'Elimina los debuffs, el veneno y el aturdimiento de toda su fila, y golpea a un enemigo.' },
  revivir: { name: 'Milagro de Vida', kind: 'revive', pct: 0.4, target: 'row-ally', bonusHitMult: 0.85, usesWis: true, desc: 'Revive a un aliado caído de su fila con parte de su vida máxima, y golpea a un enemigo.' },
  // --- Ultis nuevas (petición explícita: "implementa y reparte entre los
  // personajes existentes: barrera, golpe perforante, doble golpe, golpe
  // de gracia, ráfaga de viento, corromper, sabotaje") — repartidas entre
  // 32 familias ya existentes cuyo nombre/lore encajaba con el efecto
  // nuevo (ver los addFamily de más abajo), no añadidas como personajes
  // sueltos. Necesitaron arreglar antes un fallo real del motor de
  // combate: los buffs/debuffs/aturdimiento/veneno de varios turnos NUNCA
  // sobrevivían a un cambio de línea (ver UI.commitGroup/syncUnitFromClone
  // en ui.js) — el escudo de Barrera y el buff de Agilidad de Ráfaga de
  // Viento habrían tenido el mismo problema si no se corrige de raíz.
  barrera: { name: 'Barrera de Piedra', kind: 'shieldRow', shieldPct: 0.22, turns: 2, bonusHitMult: 0.85, desc: 'Protege a toda su fila con un escudo que absorbe daño antes que su propia vida, y golpea a un enemigo.' },
  perforar: { name: 'Golpe Perforante', kind: 'trueDamage', mult: 1.7, target: 'single', desc: 'Un golpe que atraviesa cualquier armadura, ignorando POR COMPLETO la Defensa del objetivo.' },
  dobleGolpe: { name: 'Doble Golpe', kind: 'damageDouble', mult: 1.3, hits: 2, target: 'multi', desc: 'Dos golpes rápidos seguidos, cada uno a un enemigo (puede repetir el mismo objetivo).' },
  golpeGracia: { name: 'Golpe de Gracia', kind: 'execute', mult: 1.5, executeBonusMult: 1.6, target: 'single', desc: 'Un golpe que hace mucho más daño cuanta menos vida le quede al objetivo — un rematador nato.' },
  rafaga: { name: 'Ráfaga de Viento', kind: 'buffRow', stat: 'agi', pct: 0.25, turns: 3, bonusHitMult: 0.85, desc: 'Aumenta la Agilidad de toda su fila (más críticos, ulti más rápida y actúan antes) y golpea a un enemigo.' },
  corromper: { name: 'Corromper', kind: 'dispel', target: 'row-enemy', bonusHitMult: 0.85, usesWis: true, desc: 'Elimina cualquier mejora activa (ataque/defensa/agilidad) de toda la fila enemiga, y golpea a un enemigo.' },
  sabotaje: { name: 'Sabotaje', kind: 'chargeDrain', drainAmount: 45, target: 'single', bonusHitMult: 0.85, desc: 'Reduce la carga de ulti de un enemigo, retrasando su próximo golpe especial, y lo golpea.' },
};

// Texto con los números EXACTOS de cada ulti (%, turnos, probabilidad...)
// para mostrar junto a su `desc` narrativo — pedido explícito del usuario
// ("quiero que donde se expliquen las ultis, pongas toda esa información
// con turnos, etc. porque actualmente en el juego no se entiende muy
// bien"). Antes solo se veía el `desc` de sabor ("Aumenta el ataque de su
// fila y golpea a un enemigo"), sin decir cuánto ni cuántos turnos. Se
// genera a partir de los propios campos del skill (pct/turns/mult/chance/
// dotPct/dotTurns/drainPct/bonusHitMult) en vez de escribirlo a mano en 12
// sitios, para que nunca se desincronice si se reajustan los números de
// alguna ulti más adelante.
const SKILL_STAT_LABEL = { atk: 'Ataque', def: 'Defensa', hp: 'Vida', agi: 'Agilidad', wis: 'Sabiduría' };
// Género de cada stat en español (Ataque es la única masculina de las 5) —
// necesario para que "su propio/a X"/"el/la X" concuerden bien sea cual
// sea la stat. Antes estaba fijo a mano en cada plantilla ("su propia"/
// "el") porque solo se usaban con atk o def hasta ahora; Ráfaga de Viento
// (buffRow con agi) fue la primera en dejarlo mal ("el Agilidad").
const SKILL_STAT_ARTICLE = { atk: 'el', def: 'la', hp: 'la', agi: 'la', wis: 'la' };
const SKILL_STAT_POSSESSIVE = { atk: 'propio', def: 'propia', hp: 'propia', agi: 'propia', wis: 'propia' };
function skillMechanicsText(skill) {
  const pct = (n) => Math.round(n * 100) + '%';
  const bonusHit = skill.bonusHitMult ? ` También golpea a un enemigo (×${skill.bonusHitMult} de daño${skill.usesWis ? ', según su Sabiduría' : ''}).` : '';
  switch (skill.kind) {
    case 'damage':
      return `Daño ×${skill.mult} a un enemigo.` + (skill.selfBuff
        ? ` Sube su ${SKILL_STAT_POSSESSIVE[skill.selfBuff.stat]} ${SKILL_STAT_LABEL[skill.selfBuff.stat]} un ${pct(skill.selfBuff.pct)} durante ${skill.selfBuff.turns} turnos.`
        : '');
    case 'damageRow':
      return `Daño mágico (según su Sabiduría) ×${skill.mult} a TODA la fila enemiga a la vez.`;
    case 'heal':
      return `Se cura un ${pct(skill.pct)} de su vida máxima (más cuanta más Sabiduría tenga).` + bonusHit;
    case 'healRow':
      return `Cura un ${pct(skill.pct)} de vida máxima a TODA su fila (más cuanta más Sabiduría tenga).` + bonusHit;
    case 'buffSelf':
      return `Sube su ${SKILL_STAT_POSSESSIVE[skill.stat]} ${SKILL_STAT_LABEL[skill.stat]} un ${pct(skill.pct)} durante ${skill.turns} turnos.` + bonusHit;
    case 'buffRow':
      return `Sube ${SKILL_STAT_ARTICLE[skill.stat]} ${SKILL_STAT_LABEL[skill.stat]} de TODA su fila un ${pct(skill.pct)} durante ${skill.turns} turnos.` + bonusHit;
    case 'debuff':
      return `Reduce ${SKILL_STAT_ARTICLE[skill.stat]} ${SKILL_STAT_LABEL[skill.stat]} de un enemigo un ${pct(skill.pct)} durante ${skill.turns} turnos.` + bonusHit;
    case 'stun':
      return `${Math.round(skill.chance * 100)}% de posibilidades de aturdir a un enemigo ${skill.turns} turno${skill.turns === 1 ? '' : 's'} (pierde el turno entero).` + bonusHit;
    case 'dot':
      return `Daño ×${skill.mult} a un enemigo, y lo envenena: pierde un ${pct(skill.dotPct)} de su vida máxima cada turno durante ${skill.dotTurns} turnos, ignorando su Defensa.`;
    case 'drain':
      return `Daño ×${skill.mult} a un enemigo; recupera el ${pct(skill.drainPct)} de ese daño como vida propia.`;
    case 'cleanse':
      return 'Elimina todos los debuffs, el veneno y el aturdimiento de TODA su fila.' + bonusHit;
    case 'revive':
      return `Si tiene algún aliado caído en su fila, lo revive con un ${pct(skill.pct)} de su vida máxima (sin ningún debuff/veneno/aturdimiento encima). También golpea a un enemigo (×${skill.bonusHitMult} de daño, según su Sabiduría) pase lo que pase, haya o no a quien revivir.`;
    case 'shieldRow':
      return `Da a TODA su fila un escudo igual al ${pct(skill.shieldPct)} de la vida máxima de cada uno, que absorbe daño antes que la vida durante ${skill.turns} turnos (o hasta agotarse antes).` + bonusHit;
    case 'trueDamage':
      return `Daño ×${skill.mult} a un enemigo, IGNORANDO su Defensa por completo.`;
    case 'damageDouble':
      return `${skill.hits} golpes de daño ×${skill.mult} cada uno, repartidos entre uno o varios enemigos.`;
    case 'execute':
      return `Daño ×${skill.mult} a un enemigo, que sube hasta ×${(skill.mult * (1 + skill.executeBonusMult)).toFixed(1)} cuanta menos vida le quede (hasta un ${pct(skill.executeBonusMult)} extra con el objetivo casi muerto).`;
    case 'dispel':
      return 'Elimina cualquier mejora de Ataque/Defensa/Agilidad activa en TODA la fila enemiga.' + bonusHit;
    case 'chargeDrain':
      return `Reduce en ${skill.drainAmount} puntos la carga de ulti de un enemigo (sobre un máximo de 100).` + bonusHit;
    default:
      return '';
  }
}

// Habilidad de líder de banda: una bonificación pasiva para TODA la banda
// (no solo quien la tiene), que solo está activa mientras ese luchador
// ocupe la celda central [1][1] de la Formación 3×3. Solo la tienen los
// luchadores Legendarios (ver setLeaderSkill más abajo, junto al roster).
const LEADER_SKILLS = {
  atk_boost: { name: 'Grito de Mando', stat: 'atk', pct: 0.15, desc: 'Aumenta el ataque de toda la banda un 15% mientras lidera desde el centro.' },
  def_boost: { name: 'Escudo de Mando', stat: 'def', pct: 0.15, desc: 'Aumenta la defensa de toda la banda un 15% mientras lidera desde el centro.' },
  hp_boost: { name: 'Vitalidad de Mando', stat: 'hp', pct: 0.15, desc: 'Aumenta la vida máxima de toda la banda un 15% mientras lidera desde el centro.' },
  agi_boost: { name: 'Velocidad de Mando', stat: 'agi', pct: 0.15, desc: 'Aumenta la agilidad de toda la banda un 15% mientras lidera desde el centro.' },
  wis_boost: { name: 'Sabiduría de Mando', stat: 'wis', pct: 0.15, desc: 'Aumenta la sabiduría de toda la banda un 15% mientras lidera desde el centro.' },
};

// family: agrupa toda la línea de transformación de un luchador.
// evolvesTo: id de la siguiente forma (o null si es la última que alcanza).
// image: fichero opcional en assets/creatures/ con arte real; si no está,
// se usa el sprite pixel-art generado por código (js/sprite.js) como respaldo.
//
// Cada familia evoluciona exactamente 2 veces (3 formas), igual que en D.o.T.,
// pero según su "tier" de partida ocupa un tramo distinto de la escalera de 5
// rarezas — así, no todas llegan a Legendario:
//   Tier 1 (topo, heraldo, electro,
//           marina):                   Común → Infrecuente → Raro
//   Tier 2 (triton, vidente, marejada,
//           gea):                      Infrecuente → Raro → Épico
//   Tier 3 (ascua, nigro, lagarto,
//           duende, chispa, piroman,
//           brisa):                    Raro → Épico → Legendario
// La mayoría son bestias/criaturas; piroman, brisa, marejada, gea, electro
// y marina son luchadores humanizados (3 masculinos, 3 femeninos).
const FIGHTERS = [
  // --- Tier 3: llegan a Legendario ---
  { id: 'ascua_raro', name: 'Cachorro de Ascua', element: 'fuego', class: 'campeon', rarity: 'raro', family: 'ascua', evolvesTo: 'ascua_epico', skillId: 'escudo', image: 'ascua_raro.png', lore: 'Un cachorro de dragón que aún no controla del todo su propio fuego interior.' },
  { id: 'ascua_epico', name: 'Fénix Centinela', element: 'fuego', class: 'campeon', rarity: 'epico', family: 'ascua', evolvesTo: 'ascua_legendario', skillId: 'escudo', image:'ascua_epico.png', lore: 'Renace de sus propias cenizas cada vez que cae en combate, más fuerte que antes.' },
  { id: 'ascua_legendario', name: 'Drakón Adulto de Fuego', element: 'fuego', class: 'campeon', rarity: 'legendario', family: 'ascua', evolvesTo: null, skillId: 'escudo', image: 'ascua_legendario.png', lore: 'Un dragón adulto cuyo rugido enciende los cielos de Texel.' },

  { id: 'nigro_raro', name: 'Cría de las Mareas', element: 'agua', class: 'brujo', rarity: 'raro', family: 'nigro', evolvesTo: 'nigro_epico', skillId: 'arrasar', image: 'nigro_raro.png', lore: 'Nació entre los restos de un naufragio y aprendió a hablar con las corrientes.' },
  { id: 'nigro_epico', name: 'Nigromante de las Mareas', element: 'agua', class: 'brujo', rarity: 'epico', family: 'nigro', evolvesTo: 'nigro_legendario', skillId: 'arrasar', image: 'nigro_epico.png', lore: 'Convoca a los espíritus ahogados para que luchen a su lado.' },
  { id: 'nigro_legendario', name: 'Señor del Maelström', element: 'agua', class: 'brujo', rarity: 'legendario', family: 'nigro', evolvesTo: null, skillId: 'arrasar', image: 'nigro_legendario.png', lore: 'Gobierna el remolino más temido de los mares de Texel.' },

  { id: 'lagarto_raro', name: 'Lagarto de Cuarzo', element: 'tierra', class: 'explorador', rarity: 'raro', family: 'lagarto', evolvesTo: 'lagarto_epico', skillId: 'debilitar', image: 'lagarto_raro.png', lore: 'Su piel cristalina refleja la luz de las cuevas donde habita.' },
  { id: 'lagarto_epico', name: 'Guardián de Obsidiana', element: 'tierra', class: 'explorador', rarity: 'epico', family: 'lagarto', evolvesTo: 'lagarto_legendario', skillId: 'debilitar', image: 'lagarto_epico.png', lore: 'Vigila las minas más profundas con una coraza forjada por el fuego de la tierra.' },
  { id: 'lagarto_legendario', name: 'Monarca de Piedra Negra', element: 'tierra', class: 'explorador', rarity: 'legendario', family: 'lagarto', evolvesTo: null, skillId: 'debilitar', image: 'lagarto_legendario.png', lore: 'Reina sobre las cuevas de obsidiana con un puño de piedra imposible de romper.' },

  { id: 'duende_raro', name: 'Duende del Vendaval', element: 'viento', class: 'picaro', rarity: 'raro', family: 'duende', evolvesTo: 'duende_epico', skillId: 'furia', image: 'duende_raro.png', lore: 'Se mueve más rápido de lo que el ojo puede seguir, arrastrado por su propio viento.' },
  { id: 'duende_epico', name: 'Sombra del Ciclón', element: 'viento', class: 'picaro', rarity: 'epico', family: 'duende', evolvesTo: 'duende_legendario', skillId: 'furia', image: 'duende_epico.png', lore: 'Aparece y desaparece entre ráfagas que nadie ve venir.' },
  { id: 'duende_legendario', name: 'Titán de las Corrientes', element: 'viento', class: 'picaro', rarity: 'legendario', family: 'duende', evolvesTo: null, skillId: 'furia', image: 'duende_legendario.png', lore: 'Su paso levanta tornados capaces de arrasar un ejército entero.' },

  { id: 'chispa_raro', name: 'Chispa Errante', element: 'rayo', class: 'guru', rarity: 'raro', family: 'chispa', evolvesTo: 'chispa_epico', skillId: 'bendicion', image: 'chispa_raro.png', lore: 'Nació de un rayo perdido y aún busca la tormenta que lo vio nacer.' },
  { id: 'chispa_epico', name: 'Oráculo de Tormenta', element: 'rayo', class: 'guru', rarity: 'epico', family: 'chispa', evolvesTo: 'chispa_legendario', skillId: 'bendicion', image: 'chispa_epico.png', lore: 'Lee el futuro en el chisporroteo de los relámpagos.' },
  { id: 'chispa_legendario', name: 'Tirano de la Tormenta', element: 'rayo', class: 'guru', rarity: 'legendario', family: 'chispa', evolvesTo: null, skillId: 'bendicion', image: 'chispa_legendario.png', lore: 'Doblega el cielo mismo a su voluntad, desatando tormentas a placer.' },

  // --- Tier 3 humanizados ---
  { id: 'piroman_raro', name: 'Aprendiz de las Pavesas', element: 'fuego', class: 'brujo', rarity: 'raro', family: 'piroman', evolvesTo: 'piroman_epico', skillId: 'debilitar', image: 'piroman_raro.png', lore: 'Aprendió magia de fuego jugando con las brasas de una fragua abandonada.' },
  { id: 'piroman_epico', name: 'Piromante Maldito', element: 'fuego', class: 'brujo', rarity: 'epico', family: 'piroman', evolvesTo: 'piroman_legendario', skillId: 'debilitar', image: 'piroman_epico.png', lore: 'Una maldición antigua fusionó su alma con las llamas que ahora controla.' },
  { id: 'piroman_legendario', name: 'Señor de las Cenizas Eternas', element: 'fuego', class: 'brujo', rarity: 'legendario', family: 'piroman', evolvesTo: null, skillId: 'debilitar', image: 'piroman_legendario.png', lore: 'De cada cosa que destruye nace un fuego que jamás se apaga.' },

  { id: 'brisa_raro', name: 'Exploradora de las Corrientes', element: 'viento', class: 'explorador', rarity: 'raro', family: 'brisa', evolvesTo: 'brisa_epico', skillId: 'debilitar', image: 'brisa_raro.png', lore: 'Cartografía rutas que solo el viento conoce.' },
  { id: 'brisa_epico', name: 'Arquera de las Nubes', element: 'viento', class: 'explorador', rarity: 'epico', family: 'brisa', evolvesTo: 'brisa_legendario', skillId: 'debilitar', image: 'brisa_epico.png', lore: 'Dispara flechas que cabalgan las corrientes de aire hasta dar en el blanco.' },
  { id: 'brisa_legendario', name: 'Soberana del Vendaval', element: 'viento', class: 'explorador', rarity: 'legendario', family: 'brisa', evolvesTo: null, skillId: 'debilitar', image: 'brisa_legendario.png', lore: 'Ningún viento de Texel sopla sin su permiso.' },

  // --- Tier 2: llegan a Épico ---
  { id: 'triton_infrecuente', name: 'Renacuajo Ágil', element: 'agua', class: 'explorador', rarity: 'infrecuente', family: 'triton', evolvesTo: 'triton_raro', skillId: 'debilitar', image: 'triton_infrecuente.png', lore: 'Recién salido del huevo, ya nada más rápido que cualquier pez del arrecife.' },
  { id: 'triton_raro', name: 'Tritón Errante', element: 'agua', class: 'explorador', rarity: 'raro', family: 'triton', evolvesTo: 'triton_epico', skillId: 'debilitar', image: 'triton_raro.png', lore: 'Recorre ríos y mares en busca de aguas aún sin explorar.' },
  { id: 'triton_epico', name: 'Tritón Abisal', element: 'agua', class: 'explorador', rarity: 'epico', family: 'triton', evolvesTo: null, skillId: 'debilitar', image: 'triton_epico.png', lore: 'Solo se le ve cuando emerge de las fosas más profundas del océano.' },

  { id: 'vidente_infrecuente', name: 'Aprendiz de Cenizas', element: 'fuego', class: 'guru', rarity: 'infrecuente', family: 'vidente', evolvesTo: 'vidente_raro', skillId: 'curar', image: 'vidente_infrecuente.png', lore: 'Lee mensajes ocultos en el humo de una hoguera.' },
  { id: 'vidente_raro', name: 'Vidente de Cenizas', element: 'fuego', class: 'guru', rarity: 'raro', family: 'vidente', evolvesTo: 'vidente_epico', skillId: 'curar', image: 'vidente_raro.png', lore: 'Predice el resultado de una batalla antes de que comience.' },
  { id: 'vidente_epico', name: 'Profeta de Brasas', element: 'fuego', class: 'guru', rarity: 'epico', family: 'vidente', evolvesTo: null, skillId: 'curar', image: 'vidente_epico.png', lore: 'Sus visiones han salvado (y condenado) a ejércitos enteros.' },

  // --- Tier 2 humanizados ---
  { id: 'marejada_infrecuente', name: 'Escudero de Coral', element: 'agua', class: 'campeon', rarity: 'infrecuente', family: 'marejada', evolvesTo: 'marejada_raro', skillId: 'grito', image: 'marejada_infrecuente.png', lore: 'Entrena con un escudo tallado en coral endurecido por las mareas.' },
  { id: 'marejada_raro', name: 'Caballero de las Mareas', element: 'agua', class: 'campeon', rarity: 'raro', family: 'marejada', evolvesTo: 'marejada_epico', skillId: 'grito', image: 'marejada_raro.png', lore: 'Defiende la costa con una armadura que nunca se oxida.' },
  { id: 'marejada_epico', name: 'Guardián del Abismo', element: 'agua', class: 'campeon', rarity: 'epico', family: 'marejada', evolvesTo: null, skillId: 'grito', image: 'marejada_epico.png', lore: 'Custodia las puertas que separan el mundo conocido del abismo.' },

  { id: 'gea_infrecuente', name: 'Aprendiza de Gea', element: 'tierra', class: 'guru', rarity: 'infrecuente', family: 'gea', evolvesTo: 'gea_raro', skillId: 'curar', image: 'gea_infrecuente.png', lore: 'Aprende a escuchar el latido de la tierra bajo sus pies.' },
  { id: 'gea_raro', name: 'Chamana de Raíces', element: 'tierra', class: 'guru', rarity: 'raro', family: 'gea', evolvesTo: 'gea_epico', skillId: 'curar', image: 'gea_raro.png', lore: 'Teje raíces vivas para curar heridas que la magia común no alcanza.' },
  { id: 'gea_epico', name: 'Druida Ancestral', element: 'tierra', class: 'guru', rarity: 'epico', family: 'gea', evolvesTo: null, skillId: 'curar', image: 'gea_epico.png', lore: 'Habla directamente con los bosques más antiguos de Texel.' },

  // --- Tier 1: llegan a Raro ---
  { id: 'topo_comun', name: 'Topo Acorazado', element: 'tierra', class: 'campeon', rarity: 'comun', family: 'topo', evolvesTo: 'topo_infrecuente', skillId: 'golpe', image: 'topo_comun.png', lore: 'Cava túneles bajo el campo de batalla y embiste desde donde menos se lo espera.' },
  { id: 'topo_infrecuente', name: 'Topo de Granito', element: 'tierra', class: 'campeon', rarity: 'infrecuente', family: 'topo', evolvesTo: 'topo_raro', skillId: 'golpe', image: 'topo_infrecuente.png', lore: 'Su caparazón se endureció con los años hasta parecer piedra viva.' },
  { id: 'topo_raro', name: 'Coloso de Raíces', element: 'tierra', class: 'campeon', rarity: 'raro', family: 'topo', evolvesTo: null, skillId: 'golpe', image: 'topo_raro.png', lore: 'Las raíces de su propio cuerpo lo anclan al suelo como una fortaleza.' },

  { id: 'heraldo_comun', name: 'Heraldo Menor', element: 'rayo', class: 'brujo', rarity: 'comun', family: 'heraldo', evolvesTo: 'heraldo_infrecuente', skillId: 'aturdir', image: 'heraldo_comun.png', lore: 'Anuncia tormentas con pequeñas descargas que aún no controla del todo.' },
  { id: 'heraldo_infrecuente', name: 'Heraldo del Relámpago', element: 'rayo', class: 'brujo', rarity: 'infrecuente', family: 'heraldo', evolvesTo: 'heraldo_raro', skillId: 'aturdir', image: 'heraldo_infrecuente.png', lore: 'Cada golpe suyo va acompañado de un trueno que llega segundos después.' },
  { id: 'heraldo_raro', name: 'Heraldo del Trueno', element: 'rayo', class: 'brujo', rarity: 'raro', family: 'heraldo', evolvesTo: null, skillId: 'aturdir', image: 'heraldo_raro.png', lore: 'Su voz misma retumba como una tormenta cercana.' },

  // --- Tier 1 humanizados ---
  { id: 'electro_comun', name: 'Corredor Eléctrico', element: 'rayo', class: 'explorador', rarity: 'comun', family: 'electro', evolvesTo: 'electro_infrecuente', skillId: 'debilitar', image: 'electro_comun.png', lore: 'Corre con descargas en los pies que dejan chispas a su paso.' },
  { id: 'electro_infrecuente', name: 'Cazador de Tormentas', element: 'rayo', class: 'explorador', rarity: 'infrecuente', family: 'electro', evolvesTo: 'electro_raro', skillId: 'debilitar', image: 'electro_infrecuente.png', lore: 'Persigue tormentas para absorber su energía antes de que se disipen.' },
  { id: 'electro_raro', name: 'Rastreador del Trueno', element: 'rayo', class: 'explorador', rarity: 'raro', family: 'electro', evolvesTo: null, skillId: 'debilitar', image: 'electro_raro.png', lore: 'Sigue el rastro de cualquier tormenta hasta su mismo origen.' },

  { id: 'marina_comun', name: 'Grumete Marina', element: 'agua', class: 'picaro', rarity: 'comun', family: 'marina', evolvesTo: 'marina_infrecuente', skillId: 'furia', image: 'marina_comun.png', lore: 'Su primer viaje en barco terminó en un naufragio... y en un don para el mar.' },
  { id: 'marina_infrecuente', name: 'Pirata de las Mareas', element: 'agua', class: 'picaro', rarity: 'infrecuente', family: 'marina', evolvesTo: 'marina_raro', skillId: 'furia', image: 'marina_infrecuente.png', lore: 'Navega sin mapa, guiada solo por el instinto de las corrientes.' },
  { id: 'marina_raro', name: 'Corsaria Abisal', element: 'agua', class: 'picaro', rarity: 'raro', family: 'marina', evolvesTo: null, skillId: 'furia', image: 'marina_raro.png', lore: 'Comanda su propio barco en aguas que ningún otro capitán se atreve a cruzar.' },
];

// --- Roster masivo (personajes/mobs/jefes pedidos por el usuario) ---
// Mismo patrón de 3 tiers que el resto del roster (o forma única para los
// jefes). Todavía sin arte real: usan el sprite procedural de respaldo
// (js/sprite.js) hasta que se vaya generando arte para cada uno — ver la
// lista de sprites pendientes en TODO.md.
const TIER_CHAINS = {
  1: ['comun', 'infrecuente', 'raro'],
  2: ['infrecuente', 'raro', 'epico'],
  3: ['raro', 'epico', 'legendario'],
};
// Pequeño matiz de tier añadido a la frase de lore base de cada familia
// (joven -> adulta -> forma definitiva), para no tener que escribir 3 frases
// completas a mano por cada una de las ~120 familias nuevas.
const TIER_LORE_SUFFIX = {
  1: ['', ' Todavía está aprendiendo a controlar su don.', ' Ya domina por completo su naturaleza.'],
  2: ['', ' Ha templado su poder en decenas de combates.', ' Pocos se atreven a desafiarla en su plenitud.'],
  3: ['', ' Su leyenda empieza a extenderse por Texel.', ' Es ya una fuerza que decide el destino de reinos enteros.'],
};
// `lores` acepta un array de 3 frases (una por evolución, escrita a mano
// para que cada etapa cuente su propia parte de la historia) o, por
// compatibilidad con llamadas antiguas, una única frase base a la que se le
// añade el sufijo genérico de TIER_LORE_SUFFIX según el tier.
function addFamily(slug, tier, element, cls, skillId, names, lores, hasImages) {
  const rarities = TIER_CHAINS[tier];
  const suffixes = TIER_LORE_SUFFIX[tier];
  const isCustom = Array.isArray(lores);
  rarities.forEach((rarity, i) => {
    const entry = {
      id: slug + '_' + rarity, name: names[i], element, class: cls, rarity, family: slug,
      evolvesTo: i < 2 ? slug + '_' + rarities[i + 1] : null, skillId,
      lore: isCustom ? lores[i] : lores + suffixes[i],
    };
    if (hasImages) entry.image = slug + '_' + rarity + '.png';
    FIGHTERS.push(entry);
  });
}

// Los mobs "normales" del mapa (14.3) NO son luchadores jugables: nunca
// salen en la invocación, ni en la Arena, ni se pueden colocar en la
// Formación — son personajes creados específicamente para ser rivales de
// los encuentros normales del recorrido (pool[0]/pool[1] de cada zona), por
// eso viven en su propia lista MOBS en vez de en FIGHTERS. Mismo patrón de
// 3 tiers y misma forma de ficha que el resto (fighterDef los reconoce
// igual, ver más abajo).
const MOBS = [];
// Mismo mecanismo de arte real que addFamily: pásale `true` como último
// argumento una vez hayas subido assets/creatures/<slug>_<rareza>.png (una
// por cada una de las 3 formas) y las usará en vez del sprite procedural.
// `lores` acepta un array de 3 frases (una por evolución, igual que
// addFamily) o, por compatibilidad, una única frase base a la que se le
// añade el sufijo genérico de TIER_LORE_SUFFIX.
function addMobFamily(slug, tier, element, cls, skillId, names, lores, hasImages) {
  const rarities = TIER_CHAINS[tier];
  const suffixes = TIER_LORE_SUFFIX[tier];
  const isCustom = Array.isArray(lores);
  rarities.forEach((rarity, i) => {
    const entry = {
      id: slug + '_' + rarity, name: names[i], element, class: cls, rarity, family: slug,
      evolvesTo: i < 2 ? slug + '_' + rarities[i + 1] : null, skillId,
      lore: isCustom ? lores[i] : lores + suffixes[i],
    };
    if (hasImages) entry.image = slug + '_' + rarity + '.png';
    MOBS.push(entry);
  });
}

// Los jefes son combates únicos (sin transformaciones) y viven en su propia
// lista, separada de FIGHTERS, para que NO aparezcan en la invocación (gacha)
// ni en la Arena — son antagonistas, no luchadores reclutables. fighterDef
// los reconoce igualmente (ver más abajo) para que el resto del código
// (sprite, batallas) los trate igual que a cualquier otro luchador el día
// que se usen como jefes de mapa.
// Al no tener evoluciones, un jefe solo necesita UNA imagen (no hay rareza
// por forma): pásale `true` una vez subido assets/creatures/<slug>.png.
// `fixedStats` ({hp,atk,def,agi,wis}) son las estadísticas de combate REALES
// con las que el jefe pelea como rival (ver makeBossUnit en combat.js) —
// fijas y ajustables a mano aquí mismo, independientes de la fórmula de
// nivel/rareza compartida con el resto de luchadores, para poder calibrar
// la dificultad de cada jefe uno a uno (ver torreMobMult/torreBossMult en
// combat.js para cómo se reescala dentro de la Torre Batalla).
//
// El parámetro `rarity` que se le sigue pasando a cada addBoss YA NO decide
// la rareza final del jefe (antes sí, y por eso un jefe de zona temprana
// como el Guardián del Bosque quedaba con rareza Común como luchador
// jugable) — se ignora a propósito y se deja aquí solo porque ~33 llamadas
// ya lo pasaban y no aporta nada quitarlo. Todo jefe capturado en la Torre
// Batalla es SIEMPRE Legendario (fighterDef.rarity), y además recibe un
// plus sobre eso en sus stats de luchador jugable, escalado con su
// fixedStats real (ver bossPlayerPremium en fighterStats, state.js) —
// pedido explícito del
// usuario: "los bosses tienen que ser más poderosos siempre que la mejor
// legendaria, si no, no tiene sentido que sean bosses". Antes, con la
// rareza original de cada uno (Común/Infrecuente/Raro en su mayoría), el
// Coloso de Cristal (Común) aparecía como "el más poderoso" al ordenar por
// potencia base en la Colección pese a tener stats muy por debajo de
// cualquier Legendario — un bug de ordenación aparte (ver
// baseCompareStats/basePlayerStats en ui.js) que además delataba esta
// inconsistencia de fondo.
const BOSSES = [];
function addBoss(slug, element, cls, skillId, name, lore, rarity, hasImage, fixedStats) {
  const entry = {
    id: 'boss_' + slug, name, element, class: cls, rarity: 'legendario', family: 'boss_' + slug,
    evolvesTo: null, skillId, lore, isBoss: true, fixedStats: fixedStats || null,
  };
  if (hasImage) entry.image = slug + '.png';
  BOSSES.push(entry);
}
function bossDef(id) { return BOSSES.find(b => b.id === id); }

// ### Personajes (14.1)
addFamily('sirena', 2, 'agua', 'brujo', 'arrasar', ['Sirena de Voz Dulce', 'Sirena Encantadora', 'Reina de las Profundidades'], ['Su canto embruja a los marineros que se acercan demasiado a la costa.', 'Su voz ha aprendido a moldear el oleaje tanto como los corazones de quien la escucha.', 'Gobierna las profundidades como una reina que nadie ha visto y todos temen.'], true);
addFamily('gorila', 1, 'tierra', 'campeon', 'golpe', ['Gorila Montaraz', 'Gorila de Espalda Plateada', 'Rey de la Jungla de Piedra'], ['Gobierna su territorio a puñetazos que parten la roca.', 'El plateado de su espalda es una advertencia que toda la jungla reconoce a distancia.', 'Ni la roca más dura resiste ya el peso de sus puños.'], true);
addFamily('cocodrilo', 2, 'agua', 'campeon', 'escudo', ['Guerrero Cocodrilo', 'Centurión del Pantano', 'Señor de las Aguas Turbias'], ['Su piel curtida ha detenido más golpes de los que nadie recuerda.', 'Patrulla el pantano con la disciplina de un verdadero centurión, sin dejar pasar ni una brecha.', 'Las aguas turbias del pantano le pertenecen, y quien las cruza sin permiso no vuelve a salir.'], true);
addFamily('hidradragon', 3, 'rayo', 'brujo', 'arrasar', ['Cría de Mil Fauces', 'Dragón de Tres Cabezas', 'Soberano de las Siete Cabezas'], ['Cada cabeza que pierde en combate vuelve a crecer el doble de fuerte.', 'Tres cabezas piensan — y muerden — mejor que una.', 'Siete cabezas, siete fauces: ningún ejército ha sobrevivido para contarlas todas.'], true);
addFamily('avefenix', 3, 'fuego', 'guru', 'curar', ['Polluelo de Cenizas', 'Ave de Fuego Eterno', 'Fénix Inmortal'], ['Cuando muere, renace de sus propias cenizas más brillante que antes.', 'El fuego que la consume ya no es un castigo, sino la fuente de su poder.', 'Ha muerto tantas veces que ya no recuerda tener miedo a la última.'], true);
addFamily('hipogrifo', 2, 'viento', 'explorador', 'rafaga', ['Potro Alado', 'Hipogrifo Salvaje', 'Señor de los Cielos Altos'], ['Mitad caballo, mitad grifo, surca el cielo más rápido que cualquier ave.', 'Vuela libre por cielos que ningún jinete se atreve a cruzar sin su permiso.', 'Ni el águila más veloz alcanza la sombra que deja tras de sí.'], true);
addFamily('cerbero', 3, 'fuego', 'campeon', 'barrera', ['Cachorro de Tres Cabezas', 'Guardián del Umbral', 'Cerbero, Custodio del Inframundo'], ['Vigila la puerta que separa el mundo de los vivos del de los muertos.', 'Cada una de sus tres cabezas vigila una dirección distinta: nada cruza sin ser visto.', 'Ninguna alma, viva o muerta, ha logrado pasar junto a él sin su consentimiento.'], true);
addFamily('centauro', 2, 'tierra', 'explorador', 'debilitar', ['Potrillo Centauro', 'Centauro Arquero', 'Jefe de la Manada Salvaje'], ['Combina la fuerza de un corcel con la puntería de un cazador nato.', 'Su flecha nunca falla, y su galope nunca se cansa.', 'Lidera a la manada entera con el arco en una mano y las riendas de su propio cuerpo en la otra.'], true);
addFamily('minotauro', 2, 'tierra', 'campeon', 'furia', ['Toro Joven del Laberinto', 'Minotauro Furioso', 'Amo del Laberinto Eterno'], ['Nadie que entra en su laberinto vuelve a encontrar la salida.', 'Su furia crece con cada golpe, tanto como los pasillos de su laberinto.', 'El laberinto entero es una extensión de su ira: perderse en él es perderlo todo.'], true);
addFamily('kraken', 3, 'agua', 'brujo', 'arrasar', ['Cría de Kraken', 'Kraken de las Profundidades', 'Devorador de Flotas'], ['Sus tentáculos han hundido más barcos de los que nadie se atreve a contar.', 'Cada tentáculo que pierde en batalla vuelve más grueso y más letal.', 'Las flotas que zarpan hacia su territorio ya no regresan a puerto.'], true);
addFamily('leviatan', 3, 'agua', 'campeon', 'escudo', ['Serpiente de Mar Joven', 'Leviatán de las Mareas', 'Leviatán, Terror del Océano'], ['Su sola presencia hace que el mar entero se agite de terror.', 'Las mareas mismas cambian de rumbo cuando él decide moverse.', 'Ningún capitán se atreve siquiera a nombrarlo en alta mar.'], true);
addFamily('fenrir', 3, 'viento', 'picaro', 'furia', ['Lobezno de Hierro', 'Fenrir Encadenado', 'Fenrir, el Lobo del Fin del Mundo'], ['Se dice que su rugido anunciará el fin de los tiempos.', 'Las cadenas que lo atan se tensan un poco más cada día que pasa.', 'El día que rompa sus cadenas, ni los dioses podrán detenerlo.'], true);
addFamily('nahual', 2, 'tierra', 'brujo', 'corromper', ['Aprendiz de Nahual', 'Nahual Cambiapieles', 'Gran Brujo Nahual'], ['Puede transformarse en la bestia que más tema su enemigo.', 'Cada combate le enseña una nueva forma que dominar.', 'Ya no hay bestia en Texel cuya piel no pueda vestir a voluntad.'], true);
addFamily('quetzalcoatl', 3, 'viento', 'guru', 'bendicion', ['Serpiente Emplumada Joven', 'Quetzalcóatl Ascendente', 'Quetzalcóatl, Señor del Viento'], ['Serpiente y ave a la vez, trajo el conocimiento a su pueblo.', 'Su vuelo entre las nubes reparte tanto sabiduría como tormentas.', 'El propio viento de Texel obedece el batir de sus plumas.'], true);
addFamily('cadejo', 1, 'tierra', 'picaro', 'aturdir', ['Cadejo Blanco', 'Cadejo Guardián', 'Cadejo Protector de Caminantes'], ['Aparece en los caminos de noche para proteger — o asustar — a quien los recorre.', 'Camina toda la noche junto a los viajeros sin que ninguno note su presencia.', 'Ningún caminante que reza su nombre se pierde jamás en la oscuridad.'], true);
addFamily('hada', 1, 'viento', 'guru', 'curar', ['Hada Menor', 'Hada del Bosque', 'Reina de las Hadas'], ['Su polvo brillante puede curar heridas o gastar una broma, según su humor.', 'Su polvo dorado convierte cualquier claro del bosque en su propio reino.', 'Todas las hadas del bosque responden a su llamada.'], true);
addFamily('shenlong', 3, 'rayo', 'brujo', 'arrasar', ['Dragoncillo de las Nubes', 'Shenlong Danzante', 'Shenlong, Dragón de la Lluvia'], ['Su danza entre las nubes trae la lluvia a los campos de Texel.', 'Su danza en el cielo ya reúne nubes de tormenta antes de empezar a bailar.', 'Los campos de Texel dependen de su humor: sin su lluvia, la tierra se seca.'], true);
addFamily('zeus', 3, 'rayo', 'campeon', 'grito', ['Joven del Olimpo', 'Heredero del Rayo', 'Zeus, Señor del Trueno'], ['Ningún cielo se atreve a nublarse sin su permiso.', 'Cada rayo que lanza deja claro de quién es el cielo.', 'El Olimpo entero calla cuando él decide hablar con el trueno.'], true);
addFamily('guerreromedieval', 1, 'tierra', 'campeon', 'golpe', ['Recluta de Armadura', 'Caballero de Armas', 'Comandante de la Guardia'], ['Entrenado desde niño para defender su reino con espada y escudo.', 'Ha subido de rango tras defender la muralla en incontables asedios.', 'Comanda a toda la guardia del reino con la misma disciplina que lo formó a él.'], true);
addFamily('valquiria', 2, 'rayo', 'campeon', 'grito', ['Escudera Valquiria', 'Valquiria de Combate', 'Elegidora de los Caídos'], ['Decide quién de los caídos en batalla merece cabalgar hasta el Valhalla.', 'Ha cabalgado sobre incontables campos de batalla en busca de los caídos más dignos.', 'Su juicio decide quién cruza las puertas del Valhalla y quién se queda atrás.'], true);
addFamily('golem', 2, 'tierra', 'campeon', 'escudo', ['Golem de Barro', 'Golem de Piedra', 'Golem de Hierro Ancestral'], ['Animado por magia antigua, no conoce el cansancio ni el miedo.', 'La piedra que lo forma se ha endurecido tras incontables golpes.', 'El hierro ancestral que lo recorre ya no conoce la palabra derrota.'], true);
addFamily('satiromusico', 2, 'viento', 'guru', 'bendicion', ['Sátiro Flautista', 'Sátiro de la Fiesta Eterna', 'Sumo Sátiro de Dioniso'], ['Su flauta pone a bailar hasta al enemigo más serio.', 'Su melodía ya no distingue entre aliados y enemigos: todos terminan bailando.', 'El mismísimo Dioniso reconoce en él a su discípulo favorito.'], true);
addFamily('mandragora', 1, 'tierra', 'brujo', 'corromper', ['Brote de Mandrágora', 'Mandrágora Chillona', 'Mandrágora Ancestral'], ['Su grito al ser arrancada deja aturdido a quien lo escuche.', 'Su chillido se ha vuelto tan agudo que aturde a quien la desentierra sin cuidado.', 'Sus raíces llevan siglos bajo tierra, y su grito ya es leyenda entre los campesinos.'], true);
addFamily('pazuzu', 3, 'viento', 'brujo', 'corromper', ['Espíritu Menor del Viento', 'Heraldo de Pazuzu', 'Pazuzu, Señor de los Vientos del Sur'], ['Rey de los demonios del viento, tan temido como respetado.', 'Su heraldo recorre el desierto anunciando tormentas de arena a su paso.', 'Ni el viento del sur se atreve a soplar sin su permiso.'], true);
addFamily('garuda', 2, 'viento', 'explorador', 'rafaga', ['Polluelo de Garuda', 'Garuda Cazadora', 'Garuda, Montura de los Dioses'], ['Ave gigante capaz de cargar a un dios entero sobre su lomo.', 'Caza presas cada vez más grandes con garras cada vez más firmes.', 'Los propios dioses eligen montarla para cruzar el cielo.'], true);
addFamily('anubis', 3, 'tierra', 'brujo', 'corromper', ['Chacal del Desierto', 'Sacerdote de Anubis', 'Anubis, Guardián de los Muertos'], ['Pesa el corazón de cada alma antes de dejarla pasar al más allá.', 'Cada alma que pesa en su balanza aprende a temer su juicio.', 'Ningún muerto de Texel cruza al más allá sin pasar antes por él.'], true);
addFamily('ra', 3, 'fuego', 'guru', 'arrasar', ['Disco Solar Joven', 'Heraldo de Ra', 'Ra, Señor del Sol'], ['Su carro cruza el cielo cada día, y con él, la luz del mundo.', 'Su heraldo recorre el cielo anunciando el amanecer cada mañana.', 'Sin su carro cruzando el cielo, ningún día en Texel volvería a amanecer.'], true);
addFamily('osiris', 3, 'tierra', 'guru', 'revivir', ['Aprendiz del Nilo', 'Sacerdote de Osiris', 'Osiris, Señor de la Resurrección'], ['Murió una vez y volvió, y desde entonces gobierna el más allá.', 'Sirve fielmente al Nilo hasta el día en que la muerte lo reclamó por primera vez.', 'Gobierna el más allá con la calma de quien ya no le teme a la muerte.'], true);
addFamily('hombretigre', 2, 'tierra', 'picaro', 'golpeGracia', ['Cachorro Tigre', 'Guerrero Tigre', 'Señor de las Rayas Doradas'], ['Ataca en silencio y golpea con la fuerza de un tigre de bengala.', 'Sus rayas doradas ya son sinónimo de un ataque certero y silencioso.', 'Nadie ve venir al Señor de las Rayas Doradas hasta que ya es tarde.'], true);
addFamily('hombrelobo', 2, 'viento', 'picaro', 'dobleGolpe', ['Joven Maldito', 'Hombre Lobo', 'Alfa de la Luna Llena'], ['Cada luna llena pierde el control... y gana una fuerza brutal.', 'Cada luna llena le arrebata más control... y le entrega más fuerza.', 'Como alfa, ya no necesita esperar a la luna llena para desatar su furia.'], true);
addFamily('dracula', 3, 'rayo', 'brujo', 'drenar', ['Vástago de la Noche', 'Noble de Sangre Oscura', 'Drácula, Señor de la Noche'], ['Ha sobrevivido siglos alimentándose de las sombras de Texel.', 'Cada noble que se cruza en su camino termina siendo parte de su corte de sombras.', 'Ningún amanecer en Texel se atreve a alcanzarlo antes de que regrese a su castillo.'], true);
addFamily('genbu', 2, 'agua', 'campeon', 'barrera', ['Tortuga Joven de Genbu', 'Genbu, Guardián del Norte', 'Genbu, Escudo de las Profundidades'], ['Su caparazón ha resistido más golpes de los que nadie puede contar.', 'Guarda el norte con la paciencia de quien lleva siglos sin ceder terreno.', 'Su caparazón se ha convertido en el escudo más profundo de todo Texel.'], true);
addFamily('escualo', 1, 'agua', 'picaro', 'golpeGracia', ['Aprendiz Tiburón', 'Escualo de Combate', 'Depredador de los Siete Mares'], ['Huele la sangre — y la debilidad — antes que nadie.', 'Cada combate afila más sus instintos de depredador.', 'Los siete mares le pertenecen: nada débil sobrevive donde él caza.'], true);
addFamily('hercules', 3, 'tierra', 'campeon', 'golpe', ['Joven de Fuerza Divina', 'Hércules en sus Trabajos', 'Hércules, el Semidiós'], ['Ha completado hazañas que ningún mortal lograría siquiera empezar.', 'Cada trabajo imposible que completa añade una hazaña más a su leyenda.', 'Su fuerza ya no se mide como la de un mortal, sino como la de un dios.'], true);
addFamily('ciclope', 2, 'tierra', 'campeon', 'golpe', ['Cíclope Pastor', 'Cíclope Forjador', 'Cíclope, Ojo del Trueno'], ['Con un solo ojo ve más peligro que la mayoría con dos.', 'Su forja produce armas capaces de atravesar la piedra más dura de la montaña.', 'Su único ojo ve venir la tormenta antes de que el propio cielo se oscurezca.'], true);
addFamily('driada', 1, 'tierra', 'guru', 'curar', ['Brote de Dríada', 'Dríada del Bosque', 'Dríada Madre del Bosque Ancestral'], ['Su vida está ligada al árbol que la vio nacer.', 'Su raíz se extiende cada vez más profunda en el corazón del bosque.', 'Es la madre de todos los árboles del bosque ancestral, y ellos la protegen a su vez.'], true);
addFamily('ent', 2, 'tierra', 'campeon', 'barrera', ['Retoño Andante', 'Ent Guardián', 'Ent Ancestral del Bosque Viejo'], ['Piensa despacio, pero cuando decide actuar, nada lo detiene.', 'Cada año que pasa, sus raíces se hunden un poco más en la tierra vieja.', 'El bosque viejo entero escucha su voz cuando por fin decide hablar.'], true);
addFamily('hidraserpiente', 2, 'agua', 'brujo', 'arrasar', ['Hidra Recién Nacida', 'Hidra de Pantano', 'Hidra de las Nueve Cabezas'], ['Corta una cabeza y otras dos crecerán en su lugar.', 'Cada cabeza cortada solo alimenta más su furia — y su número.', 'Nueve cabezas vigilan el pantano: ninguna presa escapa a todas a la vez.'], true);
addFamily('hombreoso', 1, 'tierra', 'campeon', 'golpe', ['Joven Oso', 'Guerrero Oso', 'Gran Oso de las Montañas'], ['Su abrazo es tan mortal como su zarpazo.', 'Su fuerza ha crecido tanto como su territorio en las montañas.', 'Ningún rival sobrevive a un abrazo del Gran Oso de las Montañas.'], true);
addFamily('mujercisne', 2, 'agua', 'guru', 'bendicion', ['Doncella Cisne', 'Mujer Cisne', 'Reina de los Lagos Blancos'], ['Su plumaje esconde una gracia que desarma a cualquier rival.', 'Su gracia en el combate desarma a quien la subestima por su belleza.', 'Gobierna los lagos blancos con la misma elegancia con la que vuela.'], true);
addFamily('unicornio', 2, 'viento', 'guru', 'purificar', ['Potrillo con Cuerno', 'Unicornio Radiante', 'Unicornio de Luz Pura'], ['Su cuerno puede curar cualquier herida... o purificar cualquier veneno.', 'Su luz ya brilla lo suficiente para curar heridas que nadie más podría sanar.', 'Su cuerno de luz pura purifica cualquier veneno con solo rozarlo.'], true);
addFamily('esfinge', 3, 'tierra', 'guru', 'debilitar', ['Cachorra de Esfinge', 'Esfinge Guardiana', 'Esfinge, Guardiana de Enigmas'], ['Solo deja pasar a quien resuelve su acertijo — a los demás, se los come.', 'Cada acertijo que plantea es más difícil — y más mortal — que el anterior.', 'Solo los más sabios de Texel se atreven a intentar cruzar ante ella.'], true);
addFamily('grifo', 2, 'viento', 'explorador', 'rafaga', ['Polluelo de Grifo', 'Grifo Cazador', 'Grifo, Rey de las Alturas'], ['Mitad águila, mitad león, caza tanto en tierra como en el aire.', 'Caza con la misma facilidad en tierra que en el aire, sin dar tregua a su presa.', 'Es el rey indiscutido de las alturas, y ningún ave se atreve a desafiarlo.'], true);
addFamily('lamasu', 2, 'tierra', 'campeon', 'barrera', ['Guardián Menor Lamasu', 'Lamasu de las Puertas', 'Lamasu, Custodio de Palacios'], ['Vigila las puertas de los palacios antiguos con cuerpo de toro y alas de águila.', 'Vigila cada entrada del palacio sin perder jamás la concentración.', 'Ningún intruso ha logrado cruzar las puertas que él custodia.'], true);
addFamily('pegaso', 2, 'viento', 'explorador', 'rafaga', ['Potrillo Alado', 'Pegaso Veloz', 'Pegaso, Corcel de las Nubes'], ['Ningún jinete olvida jamás la primera vez que voló sobre sus alas.', 'Su velocidad en el aire ya deja atrás a cualquier otra criatura alada.', 'Cabalgar sobre él es cabalgar entre las nubes mismas.'], true);
addFamily('silfide', 1, 'viento', 'guru', 'bendicion', ['Brisa Menor', 'Sílfide del Viento', 'Sílfide, Espíritu del Aire Puro'], ['Tan ligera que apenas roza el suelo al caminar.', 'El viento la lleva cada vez más lejos, casi sin tocar el suelo.', 'Es pura esencia del aire: nadie ha logrado verla completamente quieta.'], true);
addFamily('wyvern', 2, 'viento', 'picaro', 'perforar', ['Cría de Wyvern', 'Wyvern Cazador', 'Wyvern, Terror de los Cielos'], ['Más ágil que un dragón, y su aguijón es igual de letal.', 'Su aguijón se ha vuelto tan letal como sus garras.', 'Es el terror indiscutido de los cielos: ni los dragones se atreven a cruzarse en su camino.'], true);
addFamily('cecaelia', 2, 'agua', 'brujo', 'sabotaje', ['Joven Cecaelia', 'Cecaelia de los Arrecifes', 'Cecaelia, Bruja del Coral'], ['Mitad mujer, mitad pulpo, teje hechizos tan enredados como sus tentáculos.', 'Sus hechizos se enredan tanto como sus propios tentáculos entre el coral.', 'Ninguna bruja del arrecife teje magia tan retorcida como ella.'], true);
addFamily('hipocampo', 1, 'agua', 'explorador', 'debilitar', ['Hipocampo Joven', 'Hipocampo de las Corrientes', 'Hipocampo, Corcel del Mar'], ['Mitad caballo, mitad pez, tira de los carros de los dioses del mar.', 'Tira de carros cada vez más pesados entre las corrientes marinas.', 'Es el corcel elegido de los dioses del mar para cruzar cualquier tormenta.'], true);
addFamily('enano', 1, 'tierra', 'campeon', 'golpe', ['Enano Aprendiz', 'Enano Herrero', 'Enano Rey de la Montaña'], ['Forja armas capaces de atravesar la piedra más dura.', 'Cada arma que forja es más resistente que la anterior.', 'Su yunque ha forjado las armas que defienden la montaña entera.'], true);
addFamily('duendetravieso', 1, 'viento', 'picaro', 'aturdir', ['Duende Travieso', 'Duende Embaucador', 'Duende Rey de las Bromas'], ['Le encanta más gastar una broma que ganar una pelea.', 'Cada broma que gasta es más elaborada — y más difícil de evitar.', 'Es el rey indiscutido de las bromas, temido y adorado a partes iguales.'], true);
addFamily('guerreroleopardo', 2, 'tierra', 'picaro', 'golpeGracia', ['Joven Leopardo', 'Guerrero Leopardo', 'Señor de las Manchas Doradas'], ['Ataca desde las sombras y desaparece antes de que puedan responder.', 'Sus manchas doradas ya son sinónimo de un ataque que nadie ve venir.', 'Nadie sobrevive a un encuentro con el Señor de las Manchas Doradas.'], true);
addFamily('panteranegra', 2, 'tierra', 'picaro', 'aturdir', ['Cachorro de Pantera', 'Guerrero Pantera Negra', 'Rey de la Pantera Negra'], ['Se mueve en total silencio hasta que ya es demasiado tarde para su presa.', 'Su sigilo ya es legendario entre quienes han sobrevivido para contarlo.', 'Es el rey indiscutido de las sombras: nadie lo ve llegar.'], true);
addFamily('armaduratecno', 3, 'rayo', 'explorador', 'golpe', ['Prototipo de Armadura', 'Piloto de Armadura de Combate', 'Titán de Acero y Rayo'], ['Su armadura convierte a un simple mortal en una máquina de guerra.', 'Cada batalla perfecciona un poco más el ajuste entre su armadura y su cuerpo.', 'Ya no hay distinción entre el piloto y la máquina: son un único titán.'], true);
addFamily('genio', 3, 'fuego', 'brujo', 'arrasar', ['Genio Encerrado', 'Genio Liberado', 'Genio, Señor de los Tres Deseos'], ['Concede poder a quien lo libera... a cambio de un precio que rara vez se ve venir.', 'Cada deseo que concede le devuelve un poco más de su antigua libertad.', 'Nadie recuerda ya el precio real de sus tres deseos... hasta que es demasiado tarde.'], true);
addFamily('amazona', 2, 'viento', 'picaro', 'dobleGolpe', ['Joven Amazona', 'Guerrera Amazona', 'Reina de las Amazonas'], ['Entrenada desde niña para no depender de nadie en la batalla.', 'Ha luchado en más batallas de las que puede contar sin perder ni una.', 'Gobierna a las Amazonas con la misma independencia que le enseñaron de niña.'], true);
addFamily('bigfoot', 1, 'tierra', 'campeon', 'golpe', ['Rastro en el Bosque', 'Bigfoot Solitario', 'Bigfoot, Leyenda del Bosque'], ['Pocos lo han visto, y menos aún han vivido para contarlo con detalle.', 'Cada avistamiento añade un capítulo más a su leyenda del bosque.', 'Es ya más mito que criatura, pero el bosque entero sabe que es real.'], true);
addFamily('nessie', 2, 'agua', 'campeon', 'escudo', ['Cría del Lago', 'Monstruo del Lago', 'Nessie, Leyenda de las Aguas Frías'], ['Ha esquivado a cazadores y curiosos durante siglos sin ser jamás atrapada.', 'Ha aprendido a esconderse de cazadores cada vez más decididos a encontrarla.', 'Su leyenda ha sobrevivido a siglos de curiosos sin que nadie logre atraparla.'], true);
addFamily('samurai', 2, 'rayo', 'picaro', 'perforar', ['Aprendiz de Samurái', 'Samurái Errante', 'Maestro Espadachín del Trueno'], ['Su espada se mueve más rápido de lo que el ojo puede seguir.', 'Su espada se ha movido en tantos duelos que ya no necesita pensar antes de golpear.', 'Su corte es tan rápido como el propio trueno que lleva por nombre.'], true);
addFamily('hombrefuego', 1, 'fuego', 'brujo', 'sabotaje', ['Chispa Viviente', 'Hombre de Fuego', 'Avatar de las Llamas'], ['Cada paso que da deja un rastro de brasas ardientes.', 'Las brasas que deja a su paso ya arden más tiempo que antes.', 'Es la llama misma hecha carne: nada que toca vuelve a ser lo mismo.'], true);
addFamily('sacerdote', 1, 'tierra', 'guru', 'curar', ['Acólito', 'Sacerdote Bendecido', 'Sumo Sacerdote de Texel'], ['Dedica su vida a curar a quienes protegen el reino.', 'Sus bendiciones han salvado a más soldados de los que puede recordar.', 'Es el guía espiritual de todo Texel, y su fe cura donde la magia común falla.'], true);
addFamily('thor', 3, 'rayo', 'campeon', 'golpe', ['Joven del Martillo', 'Guerrero de Asgard', 'Thor, Dios del Trueno'], ['Solo el digno puede levantar su martillo... y desatar la tormenta.', 'Cada batalla en Asgard fortalece más su brazo — y su martillo.', 'Solo él puede levantar el martillo, y solo él puede desatar la tormenta que trae.'], true);
addFamily('gladiador', 1, 'tierra', 'campeon', 'golpe', ['Esclavo de la Arena', 'Gladiador Veterano', 'Campeón del Coliseo'], ['Ha sobrevivido a cientos de combates ante multitudes sedientas de sangre.', 'Cada victoria en la arena le gana más respeto — y más enemigos.', 'Es el campeón indiscutido del coliseo, y las multitudes corean su nombre.'], true);
addFamily('hombrehielo', 1, 'agua', 'brujo', 'debilitar', ['Escarcha Viviente', 'Hombre de Hielo', 'Avatar del Invierno Eterno'], ['Congela todo lo que toca, incluso el ánimo de sus rivales.', 'El frío que desprende ya congela el aire a su alrededor.', 'Es el invierno eterno hecho carne: nada sobrevive mucho tiempo a su lado.'], true);
addFamily('odin', 3, 'rayo', 'guru', 'bendicion', ['Joven Vidente', 'Odín, el Errante', 'Odín, Padre de Todo'], ['Sacrificó un ojo por sabiduría, y con ella gobierna Asgard.', 'Cada viaje errante le enseña un secreto más del destino de los mundos.', 'Gobierna Asgard entero con la sabiduría que pagó con su propio ojo.'], true);
addFamily('sunwukong', 3, 'viento', 'picaro', 'dobleGolpe', ['Mono de Piedra', 'Rey Mono', 'Sun Wukong, el Sabio Igualado al Cielo'], ['Su bastón puede crecer hasta el cielo... y su ingenio, aún más alto.', 'Su bastón crece más alto con cada batalla que libra.', 'Ni el cielo mismo ha logrado igualar su ingenio.'], true);
addFamily('leonhumanizado', 2, 'tierra', 'campeon', 'grito', ['Cachorro de León', 'Guerrero León', 'Rey de la Sabana Dorada'], ['Su rugido basta para que la manada entera se ponga en pie.', 'Su rugido ya reúne a toda la manada en un solo instante.', 'Gobierna la sabana dorada como el rey indiscutido que siempre fue.'], true);
addFamily('yeti', 2, 'agua', 'campeon', 'escudo', ['Cría de Yeti', 'Yeti de las Cumbres', 'Yeti, Señor de las Nieves Eternas'], ['Sobrevive donde nada más puede, en las cumbres más heladas de Texel.', 'Sobrevive en cumbres donde ninguna otra criatura se atreve a quedarse.', 'Es el señor indiscutido de las nieves eternas, y el frío le obedece.'], true);
addFamily('deerwoman', 2, 'tierra', 'picaro', 'golpeGracia', ['Joven del Bosque', 'Deer Woman', 'Deer Woman, Espíritu Vengador'], ['Atrae a quien le falta el respeto al bosque... y no todos vuelven.', 'Su presencia ya avisa a quienes le faltan el respeto al bosque.', 'Es el espíritu vengador del bosque: quien la ofende rara vez regresa.'], true);
addFamily('gatubela', 2, 'viento', 'picaro', 'dobleGolpe', ['Aprendiz Felina', 'Gatúbela', 'Reina de los Tejados'], ['Se mueve entre las sombras de la ciudad sin dejar ni un solo rastro.', 'Se desliza entre los tejados de la ciudad sin dejar ni un solo sonido.', 'Gobierna los tejados de la ciudad como su propio reino secreto.'], true);
addFamily('afrodita', 3, 'agua', 'guru', 'bendicion', ['Doncella Nacida del Mar', 'Afrodita en Flor', 'Afrodita, Diosa del Amor'], ['Nació de la espuma del mar y con ella trajo la belleza al mundo.', 'Su belleza ya desarma tanto a aliados como a enemigos por igual.', 'Es la diosa del amor, y ningún corazón en Texel es inmune a su presencia.'], true);
addFamily('basajaun', 2, 'tierra', 'campeon', 'barrera', ['Joven Basajaun', 'Basajaun del Bosque', 'Basajaun, Señor de los Bosques Vascos'], ['Protege a los rebaños del bosque de cualquier peligro, incluso de los cazadores.', 'Vigila cada rebaño del bosque con paciencia inquebrantable.', 'Es el señor de los bosques vascos, y ningún cazador se atreve a desafiarlo.'], true);
addFamily('icaro', 1, 'viento', 'explorador', 'rafaga', ['Aprendiz de Alas de Cera', 'Ícaro en Vuelo', 'Ícaro, el que Desafió al Sol'], ['Voló más alto de lo que nadie creía posible... y pagó el precio por ello.', 'Cada vuelo lo lleva más alto de lo que sus alas de cera deberían soportar.', 'Desafió al sol mismo, y su leyenda vuela más alto de lo que él jamás llegó.'], true);
addFamily('orangutan', 1, 'tierra', 'campeon', 'golpe', ['Cría de Orangután', 'Orangután de la Selva', 'Sabio Orangután de la Jungla'], ['Tan fuerte como paciente, rara vez pelea sin motivo.', 'Su paciencia solo es superada por la fuerza que guarda para cuando de verdad la necesita.', 'Es el sabio indiscutido de la jungla, respetado por su fuerza y su calma.'], true);
addFamily('poseidon', 3, 'agua', 'campeon', 'grito', ['Joven del Tridente', 'Guardián de las Mareas', 'Poseidón, Señor de los Mares'], ['Con un golpe de su tridente puede calmar — o desatar — cualquier tormenta.', 'Su tridente ya agita mareas enteras con un solo golpe.', 'Es el señor de los mares, y ninguna tormenta se forma sin su voluntad.'], true);
addFamily('davyjones', 2, 'agua', 'brujo', 'sabotaje', ['Marinero Maldito', 'Davy Jones, el Maldito', 'Davy Jones, Capitán del Abismo'], ['Su barco solo aparece cuando ya es demasiado tarde para escapar.', 'Su maldición se ha vuelto tan profunda como el abismo que ahora gobierna.', 'Es el capitán del abismo, y su barco solo aparece cuando ya no hay escapatoria.'], true);
addFamily('velociraptor', 1, 'tierra', 'picaro', 'perforar', ['Cría de Velocirraptor', 'Velocirraptor Cazador', 'Líder de la Manada de Raptores'], ['Caza en manada, y para cuando lo ves, ya es tarde.', 'Su manada ha aprendido a cazar en perfecta coordinación bajo su liderazgo.', 'Es el líder indiscutido de la manada, y nadie escapa de su emboscada.'], true);
addFamily('hombrepez', 1, 'agua', 'explorador', 'debilitar', ['Joven Hombre Pez', 'Hombre Pez de las Profundidades', 'Ancestro de las Profundidades'], ['Respira bajo el agua tan fácil como tú respiras aire.', 'Ha explorado profundidades donde ningún otro ser humano ha logrado sobrevivir.', 'Es el ancestro de las profundidades, y el mar entero reconoce su linaje.'], true);
addFamily('bastet', 2, 'fuego', 'guru', 'curar', ['Gatita Sagrada', 'Sacerdotisa de Bastet', 'Bastet, Diosa Felina'], ['Protectora de los hogares, y de quien tenga la suerte de ganarse su favor.', 'Su templo recibe cada vez más ofrendas de quienes buscan su favor.', 'Es la diosa felina, y su bendición protege cada hogar que la honra.'], true);
addFamily('orcahumanoide', 2, 'agua', 'campeon', 'golpe', ['Joven Orca', 'Guerrera Orca', 'Matriarca de las Orcas'], ['Caza en manada y nunca deja a un miembro de su familia atrás.', 'Lidera a su manada en cacerías cada vez más coordinadas.', 'Es la matriarca de las orcas, y ningún miembro de su familia queda atrás jamás.'], true);
addFamily('mujerconejo', 1, 'tierra', 'picaro', 'aturdir', ['Joven Conejo', 'Mujer Conejo', 'Gran Coneja de la Luna'], ['Tan rápida que apenas la ves antes de que ya haya golpeado.', 'Su velocidad ya es casi imposible de seguir a simple vista.', 'Es la Gran Coneja de la Luna, y nadie logra anticipar su golpe.'], true);
addFamily('tiburonmartillo', 2, 'agua', 'picaro', 'perforar', ['Grumete Martillo', 'Pirata Tiburón Martillo', 'Capitán de los Siete Mares'], ['Su cabeza en forma de martillo esconde un instinto asesino infalible.', 'Su instinto de pirata se ha vuelto tan afilado como su propia mordida.', 'Es el capitán indiscutido de los siete mares, y su bandera es temida en cada puerto.'], true);
addFamily('espantapajaros', 1, 'tierra', 'brujo', 'debilitar', ['Espantapájaros Roto', 'Espantapájaros Animado', 'Guardián del Campo Maldito'], ['Cobró vida una noche sin luna, y desde entonces vigila el campo.', 'Cada noche sin luna afianza un poco más su extraña vida.', 'Es el guardián del campo maldito, y nada cruza sus tierras sin su permiso.'], true);
addFamily('escorpionhumanoide', 2, 'tierra', 'picaro', 'veneno', ['Joven Escorpión', 'Guerrero Escorpión', 'Señor del Aguijón Mortal'], ['Su aguijón lleva un veneno que debilita hasta al rival más fuerte.', 'Su aguijón se ha vuelto tan letal que un solo roce basta para debilitar a cualquiera.', 'Es el señor del aguijón mortal, y ningún antídoto conocido detiene su veneno.'], true);
addFamily('dientesdesable', 2, 'tierra', 'campeon', 'furia', ['Cría Dientes de Sable', 'Guerrero Dientes de Sable', 'Señor de la Era del Hielo'], ['Sus colmillos son más antiguos que cualquier leyenda de Texel.', 'Sus colmillos han derribado presas cada vez más grandes con el paso de los siglos.', 'Es el señor de la Era del Hielo, y su rugido aún resuena entre los glaciares.'], true);
addFamily('cangrejo', 1, 'agua', 'campeon', 'escudo', ['Cangrejo Pequeño', 'Cangrejo Acorazado', 'Rey Cangrejo de las Rocas'], ['Su caparazón es tan duro que pocas armas logran atravesarlo.', 'Su caparazón se ha endurecido tanto que ya ni las armas más afiladas lo atraviesan.', 'Es el rey cangrejo de las rocas, y su territorio en la costa no admite intrusos.'], true);
addFamily('zapador', 1, 'tierra', 'explorador', 'sabotaje', ['Zapador Novato', 'Zapador de Túneles', 'Maestro Zapador de las Profundidades'], ['Conoce cada túnel bajo Texel mejor que su propia casa.', 'Cada túnel nuevo que excava conecta un rincón más de Texel bajo tierra.', 'Es el maestro indiscutido de las profundidades, y ningún mapa conoce mejor que él.'], true);
addFamily('plantacarnivora', 1, 'tierra', 'brujo', 'debilitar', ['Brote Carnívoro', 'Planta Carnívora', 'Devoradora de las Profundidades del Bosque'], ['Atrae a sus presas con un aroma dulce... y no las suelta jamás.', 'Su aroma ya atrae presas desde cada vez más lejos del bosque.', 'Es la devoradora de las profundidades del bosque, y nada que atrapa vuelve a salir.'], true);
addFamily('estatua', 2, 'tierra', 'campeon', 'escudo', ['Estatua Agrietada', 'Estatua Animada', 'Coloso de Piedra Viviente'], ['Permanece inmóvil durante siglos... hasta que alguien comete el error de despertarla.', 'Cada siglo inmóvil acumula más poder bajo su superficie de piedra.', 'Es un coloso de piedra viviente, y su despertar puede derribar murallas enteras.'], true);
addFamily('tortugahumanoide', 1, 'agua', 'campeon', 'escudo', ['Tortuga Guerrera Novata', 'Tortuga Guerrera Veterana', 'Maestra Tortuga del Caparazón Eterno'], ['Su caparazón ha detenido lanzas, flechas y hasta el paso del tiempo.', 'Su caparazón ha soportado incontables batallas sin ceder ni un centímetro.', 'Es la maestra del caparazón eterno, y ningún golpe conocido ha logrado quebrarla.'], true);

// --- Ronda de mitologías poco representadas (kappa/tanuki/tengu japoneses,
// baba yaga/huldra eslavo-nórdicas, naga hindú, chupacabra cryptid,
// ganesha/amaterasu/susanoo/anansi/tlaloc dioses de panteones distintos a
// los ya muy presentes griego/egipcio/nórdico) — 5 familias de cada tier,
// pedidas explícitamente por el usuario.
addFamily('kappa', 1, 'agua', 'picaro', 'aturdir', ['Kappa Juguetón', 'Kappa de las Corrientes', 'Kappa Maestro del Estanque'], ['Guarda un cuenco de agua sagrada en la cabeza: si se derrama, pierde todo su poder.', 'Ha aprendido a proteger su cuenco en pleno combate sin derramar ni una gota.', 'Ningún río de Texel se cruza sin su permiso, y su cuenco nunca se ha vaciado.'], true);
addFamily('tanuki', 1, 'tierra', 'explorador', 'sabotaje', ['Tanuki Curioso', 'Tanuki Embaucador', 'Gran Tanuki de las Mil Formas'], ['Puede transformar su propio cuerpo para parecer cualquier cosa... o cualquiera.', 'Sus disfraces ya engañan hasta a quien conoce bien sus trucos.', 'Ha adoptado tantas formas que ya nadie recuerda cuál es la suya de verdad.'], true);
addFamily('salamandraignea', 1, 'fuego', 'brujo', 'arrasar', ['Cría de Salamandra', 'Salamandra de Brasas', 'Salamandra del Corazón del Volcán'], ['Nació en el centro de una hoguera y jamás ha sentido frío.', 'Las brasas por las que camina se reavivan solas a su paso.', 'Vive en el corazón de un volcán, donde ni la lava logra herirla.'], true);
addFamily('thunderbird', 1, 'rayo', 'explorador', 'furia', ['Cría de Thunderbird', 'Thunderbird Joven', 'Thunderbird de las Tormentas'], ['Cada aleteo suyo hace crepitar el aire con pequeñas chispas.', 'Ya es capaz de convocar una tormenta con solo alzar el vuelo.', 'Su vuelo desata tormentas que se ven llegar desde el otro lado de Texel.'], true);
addFamily('selkie', 1, 'agua', 'guru', 'purificar', ['Cría de Selkie', 'Selkie de las Mareas', 'Selkie Guardiana de su Piel'], ['Su piel de foca guarda toda su magia — y todo su secreto.', 'Ha aprendido a moverse entre ambas formas sin perder ni un ápice de su don.', 'Nadie que le arrebate su piel ha logrado quedársela para siempre.'], true);

addFamily('babayaga', 2, 'tierra', 'brujo', 'corromper', ['Aprendiz de Baba Yaga', 'Baba Yaga Errante', 'Baba Yaga, Señora del Bosque Negro'], ['Vive en una choza que se mueve sobre patas de gallina, siempre un paso por delante.', 'Su mortero vuela cada vez más rápido entre los árboles del bosque.', 'Ningún viajero perdido en el bosque negro escapa a su maldición.'], true);
addFamily('ragnar', 3, 'tierra', 'campeon', 'golpe', ['Ragnar Lothbrok', 'Ragnar, Rey Vikingo', 'Ragnar Lothbrok, Leyenda del Norte'], ['Un joven guerrero destinado a conquistar tierras más allá del mar.', 'Su nombre ya es temido por reyes y guerreros de toda Escandinavia.', 'Convertido en leyenda, su espíritu aún guía a los vikingos hacia la batalla.'], true);

// --- Segunda ronda de mitologías/inspiraciones poco representadas (hindú,
// celta, mesoamericana, africana, polinesia, persa, filipina, china de los
// 4 guardianes, animales nuevos, y varios guiños directos a cine/anime) —
// 38 familias nuevas pedidas explícitamente por el usuario tras una sesión
// de brainstorming, repartidas por tier (1/2/3) según su peso narrativo.
addFamily("ganesha", 3, "tierra", "guru", "bendicion", ["Cría de Ganesha","Ganesha, Portador de Sabiduría","Ganesha, Señor de los Nuevos Comienzos"], ["Con trompa de elefante y mente de sabio, nada empieza bien sin su bendición.","Ya retira obstáculos del camino de ejércitos enteros con un solo gesto.","Ningún comienzo en Texel se considera de buen augurio sin que él lo bendiga primero."], true);
addFamily("amaterasu", 3, "fuego", "guru", "curar", ["Joven Diosa del Alba","Amaterasu en Vuelo","Amaterasu, Diosa del Sol Naciente"], ["Su luz devuelve el calor a quien lo ha perdido en la más larga de las noches.","Su resplandor ya cura heridas que la oscuridad creía eternas.","Es el sol mismo hecho diosa, y su luz devuelve la vida allí donde se posa."], true);
addFamily("susanoo", 3, "rayo", "campeon", "furia", ["Joven Dios de la Tormenta","Susanoo, Señor de los Mares y Tormentas","Susanoo, Domador de la Serpiente de Ocho Cabezas"], ["Expulsado del cielo por su temperamento, desató su furia contra el mar embravecido.","Cada tormenta que provoca ya es tan temida como su propio genio.","Domó a la serpiente de ocho cabezas, y desde entonces nada en la tierra lo desafía."], true);
addFamily("anansi", 2, "tierra", "explorador", "sabotaje", ["Araña Curiosa","Anansi, Tejedor de Historias","Anansi, Dueño de Todas las Historias del Mundo"], ["Teje su tela con la misma facilidad con la que teje sus engaños.","Sus historias ya han engañado a dioses mucho más fuertes que él.","Compró todas las historias del mundo con astucia, y ninguna se cuenta ya sin su nombre."], true);
addFamily("tlaloc", 2, "agua", "guru", "arrasar", ["Portador de Lluvia Menor","Tlaloc, Señor de la Tormenta","Tlaloc, Dueño de las Cuatro Lluvias"], ["Un gesto suyo basta para que el cielo entero se abra en tormenta.","Sus tormentas ya arrasan cosechas enteras cuando se enfada.","Gobierna las cuatro lluvias sagradas, y ningún campo florece sin su permiso."], true);
addFamily("hanuman", 2, "fuego", "campeon", "escudo", ["Joven Devoto de Cola Larga","Hanuman, Guerrero Leal","Hanuman, Protector Eterno de los Suyos"], ["Su lealtad es tan grande como la montaña que una vez cargó sobre sus hombros.","Ya ha cruzado océanos enteros de un salto por proteger a quien lo necesita.","Es el protector eterno de los suyos, y ninguna distancia ha sido nunca demasiado grande para él."], true);
addFamily("kali", 3, "tierra", "brujo", "golpeGracia", ["Sombra de la Destructora","Kali en Danza de Guerra","Kali, Devoradora del Tiempo"], ["Su danza anuncia el final de algo, aunque nadie sepa todavía el qué.","Cada collar que porta cuenta una batalla que puso fin a algo mucho más grande.","Es la devoradora del tiempo mismo, y ante ella hasta los ciclos del mundo terminan."], true);
addFamily("cernunnos", 3, "tierra", "guru", "bendicion", ["Joven de la Cornamenta","Cernunnos, Señor de los Bosques Salvajes","Cernunnos, Guardián de Todo lo Vivo"], ["Cada ciervo del bosque reconoce en su cornamenta a uno de los suyos.","Su bendición ya hace florecer el bosque entero a su paso.","Es el guardián de todo lo vivo, y ningún cazador entra en su bosque sin su permiso."], true);
addFamily("maui", 3, "rayo", "explorador", "rafaga", ["Joven Semidiós Embaucador","Maui, Domador del Sol","Maui, Semidiós de las Mil Hazañas"], ["Robó el fuego y ató el sol solo para tener más horas de aventura por delante.","Cada hazaña suya ya se cuenta antes de que termine de completar la siguiente.","Sus mil hazañas son ya leyenda, y ninguna isla de Texel olvida su nombre."], true);
addFamily("pele", 3, "fuego", "guru", "arrasar", ["Joven del Fuego Sagrado","Pele, Señora de las Cenizas Vivas","Pele, Diosa del Volcán Eterno"], ["Su temperamento es tan cambiante como la lava que corre bajo sus pies.","Cada isla que forma nace ya marcada por su furia y su fuego.","Es la diosa del volcán eterno, y el propio suelo de Texel obedece a su ira."], true);
addFamily("xolotl", 2, "rayo", "explorador", "revivir", ["Cachorro del Ocaso","Xolotl, Guía del Inframundo","Xolotl, Señor de las Almas que Vuelven"], ["Guía a las almas perdidas por el camino que ni ellas mismas recuerdan.","Ya ha cruzado el inframundo tantas veces que conoce cada uno de sus atajos.","Es el señor de las almas que vuelven, y ninguna se pierde ya bajo su guía."], true);
addFamily("coatlicue", 3, "tierra", "brujo", "debilitar", ["Hija de la Falda de Serpientes","Coatlicue en Vigilia","Coatlicue, Madre de Todo lo que Nace y Muere"], ["Viste una falda de serpientes vivas, y ninguna se atreve a desobedecerla.","Su presencia ya marchita todo lo que la vida no protege con fuerza.","Es la madre de todo lo que nace y muere, y ante ella el ciclo entero del mundo se inclina."], true);
addFamily("mamiwata", 2, "agua", "guru", "curar", ["Joven Espíritu del Río","Mami Wata, Señora de las Aguas","Mami Wata, Madre de Todos los Ríos"], ["Su canto atrae tanto la fortuna como la perdición, según a quién visite.","Sus aguas ya curan males que ningún sanador de tierra firme logra sanar.","Es la madre de todos los ríos, y su favor decide quién prospera cerca de sus orillas."], true);
addFamily("leprechaun", 1, "tierra", "explorador", "aturdir", ["Duende de Bolsillos Llenos","Leprechaun Escurridizo","Leprechaun, Guardián del Oro al Final del Arcoíris"], ["Promete un tesoro y desaparece antes de que puedas pedírselo dos veces.","Ya ha escapado de más cazadores de tesoros de los que puede recordar.","Es el guardián del oro al final del arcoíris, y nadie ha logrado seguirlo hasta él."], true);
addFamily("puca", 1, "viento", "explorador", "sabotaje", ["Sombra Cambiante","Púca de las Encrucijadas","Gran Púca, Señor de las Mil Formas de la Noche"], ["Nunca se sabe si el animal que cruza tu camino de noche es lo que parece.","Cambia de forma cada vez más rápido, sin dejar tiempo a que lo reconozcan.","Es el señor de las mil formas de la noche, y nadie ha visto jamás su rostro verdadero."], true);
addFamily("apsara", 1, "viento", "explorador", "rafaga", ["Aprendiz de Danza Celestial","Apsara de los Salones Eternos","Gran Apsara, Danzarina del Cielo Mismo"], ["Cada paso de su danza roba el aliento a quien tiene la suerte de verla.","Su danza ya mueve el viento a su alrededor como si respondiera a su ritmo.","Danza en los salones del cielo mismo, y ningún mortal olvida haberla visto una vez."], true);
addFamily("naga", 2, "agua", "brujo", "veneno", ["Joven de Sangre Serpentina","Naga de las Aguas Profundas","Reina Naga del Río Sagrado"], ["Su mitad serpiente esconde un veneno tan sagrado como letal.","Su veneno ya se ha vuelto tan sagrado en su templo como temido fuera de él.","Gobierna el río sagrado entero, y ninguna criatura de sus aguas se mueve sin su permiso."], true);
addFamily("tikbalang", 2, "tierra", "picaro", "dobleGolpe", ["Potrillo de Dos Piernas","Tikbalang de los Caminos Perdidos","Gran Tikbalang, Señor de las Sendas que Engañan"], ["Con cabeza de caballo y piernas larguísimas, hace perder el rumbo a cualquiera.","Sus sendas engañan cada vez a más viajeros que juraban conocer el camino.","Es el señor de las sendas que engañan, y solo él conoce el camino de vuelta."], true);
addFamily("simurgh", 2, "viento", "guru", "curar", ["Cría de Ave Sabia","Simurgh de las Alturas Eternas","Gran Simurgh, Guardiana de la Sabiduría del Mundo"], ["Ha vivido tantos ciclos del mundo que ya recuerda cómo empezaron todos.","Sus alas ya curan con el mismo viento que desatan al volar.","Es la guardiana de la sabiduría del mundo, y ningún ave ha volado jamás tan alto como ella."], true);
addFamily("qinglong", 2, "viento", "brujo", "arrasar", ["Cría del Dragón Azur","Qinglong, Guardián del Este","Gran Qinglong, Dragón Celeste del Amanecer"], ["Nació con la primera luz del este, y con ella sigue guardando el amanecer.","Su aliento ya arrasa nubes enteras cuando surca el cielo del amanecer.","Es el guardián celeste del este, y ningún amanecer llega a Texel sin su bendición."], true);
addFamily("baihu", 2, "tierra", "campeon", "perforar", ["Cachorro del Tigre Blanco","Baihu, Guardián del Oeste","Gran Baihu, Tigre Celeste de Colmillos de Acero"], ["Su pelaje blanco como la nieve esconde una fuerza que nadie subestima dos veces.","Sus colmillos ya atraviesan armaduras que antes creía imposibles de romper.","Es el guardián celeste del oeste, y ningún colmillo forjado ha logrado igualar el suyo."], true);
addFamily("zhuque", 2, "fuego", "guru", "bendicion", ["Cría del Fénix Bermellón","Zhuque, Guardiana del Sur","Gran Zhuque, Fénix Celeste de Llamas Eternas"], ["Sus plumas arden sin consumirse jamás, como el propio verano que custodia.","Su bendición ya reaviva el ánimo de ejércitos enteros antes de la batalla.","Es la guardiana celeste del sur, y su llama eterna nunca se ha apagado en Texel."], true);
addFamily("rinoceronte", 1, "tierra", "campeon", "escudo", ["Cría de Rinoceronte","Rinoceronte Acorazado","Gran Rinoceronte, Muralla de la Sabana"], ["Su coraza natural ha detenido cargas que romperían cualquier escudo forjado.","Su coraza ya ha resistido embestidas que destrozarían una muralla de piedra.","Es la muralla viviente de la sabana, y nada ha logrado derribarlo jamás."], true);
addFamily("elefante", 2, "tierra", "campeon", "golpe", ["Cría de Elefante","Elefante de Guerra","Gran Elefante, Coloso Imparable de la Sabana"], ["Entrenado para la guerra desde pequeño, su carga ya hace temblar el suelo.","Su carga ya ha derribado murallas de campamentos enteros.","Es el coloso imparable de la sabana, y ningún ejército lo detiene una vez que embiste."], true);
addFamily("pangolin", 1, "tierra", "campeon", "barrera", ["Cría de Pangolín","Pangolín Acorazado","Gran Pangolín, Escudo Viviente de Escamas"], ["Se enrosca en una bola de escamas ante cualquier peligro, y nada la atraviesa.","Sus escamas ya han desviado garras y colmillos por igual sin ceder ni un centímetro.","Es el escudo viviente de escamas, y ningún depredador ha logrado jamás desenroscarlo."], true);
addFamily("buhosabio", 1, "viento", "guru", "debilitar", ["Polluelo Curioso","Búho Sabio de la Noche","Gran Búho, Vidente de las Sombras del Bosque"], ["Ve en la oscuridad lo que ningún otro ojo del bosque logra distinguir.","Sus consejos ya guían a cazadores y viajeros perdidos por igual.","Es el vidente de las sombras del bosque, y nada se mueve de noche sin que él lo sepa."], true);
addFamily("camaleon", 1, "tierra", "explorador", "aturdir", ["Cría de Camaleón","Camaleón Sigiloso","Gran Camaleón, Fantasma de Mil Colores"], ["Cambia de color tan rápido que su presa nunca lo ve venir.","Su camuflaje ya engaña incluso a quien sabe exactamente dónde buscarlo.","Es el fantasma de mil colores, y nadie ha logrado verlo llegar jamás."], true);
addFamily("morsa", 1, "agua", "campeon", "escudo", ["Cría de Morsa","Morsa Guerrera de los Hielos","Gran Morsa, Patriarca de las Costas Heladas"], ["Sus colmillos han abierto agujeros en el hielo más grueso sin esfuerzo.","Su grosor ya absorbe golpes que hundirían a cualquier otra criatura de las costas.","Es el patriarca de las costas heladas, y ninguna tormenta del norte lo ha hecho ceder."], true);
addFamily("ninjasombra", 2, "viento", "picaro", "dobleGolpe", ["Aprendiz de las Sombras","Ninja de los Clones Fantasma","Gran Ninja, Maestro de las Mil Sombras"], ["Deja tras de sí una sombra que golpea igual que él, para confundir al rival.","Sus clones ya golpean con la misma fuerza y velocidad que el original.","Es el maestro de las mil sombras, y nadie sabe jamás cuál de ellas es la real."], true);
addFamily("cazadordemonios", 2, "fuego", "picaro", "perforar", ["Aprendiz de la Hoja Sagrada","Cazador de Demonios","Gran Cazador, Verdugo de lo que Acecha en la Sombra"], ["Su espada corta tanto la carne como cualquier maldición que la proteja.","Su hoja ya ha atravesado corazas que ningún demonio creía vulnerables.","Es el verdugo de lo que acecha en la sombra, y ningún demonio duerme tranquilo sabiéndolo cerca."], true);
addFamily("tezcatlipoca", 3, "tierra", "brujo", "corromper", ["Sombra del Espejo Humeante","Tezcatlipoca, Señor de la Noche","Tezcatlipoca, Dueño del Destino de los Hombres"], ["Su espejo de obsidiana refleja el destino de quien se atreve a mirarlo.","Su sombra ya se extiende sobre reinos enteros que temen su juicio.","Es el dueño del destino de los hombres, y ninguna fortuna cambia sin que él lo decida."], true);
addFamily("camazotz", 2, "viento", "picaro", "dobleGolpe", ["Cría de Camazotz","Camazotz, Murciélago de la Noche Maya","Gran Camazotz, Señor de la Casa del Murciélago"], ["Vuela sin hacer ruido, y para cuando lo oyes ya es demasiado tarde.","Su casa de murciélagos ya no perdona a quien se atreve a cruzarla de noche.","Es el señor de la Casa del Murciélago, y ningún viajero nocturno olvida su nombre."], true);
addFamily("ares", 3, "fuego", "campeon", "furia", ["Joven de la Lanza Ardiente","Ares, Heraldo de la Guerra","Ares, Dios de la Guerra sin Cuartel"], ["Disfruta del fragor de la batalla más que ningún otro dios del Olimpo.","Cada campo de batalla que pisa ya se vuelve más brutal con su sola presencia.","Es el dios de la guerra sin cuartel, y ningún campo de batalla queda en calma mientras él vive."], true);
addFamily("artemisa", 3, "viento", "explorador", "perforar", ["Joven Cazadora de la Luna","Artemisa, Señora de la Caza","Artemisa, Diosa de la Luna y los Bosques Salvajes"], ["Ninguna flecha suya ha fallado jamás el blanco que se propuso alcanzar.","Su puntería ya atraviesa defensas que ningún cazador mortal lograría perforar.","Es la diosa de la luna y los bosques salvajes, y su flecha nunca conoce la piedad."], true);
addFamily("atenea", 3, "tierra", "guru", "bendicion", ["Joven Estratega del Olimpo","Atenea, Señora de la Guerra Justa","Atenea, Diosa de la Sabiduría y la Estrategia"], ["Nació ya armada, y con esa misma astucia sigue decidiendo batallas enteras.","Su estrategia ya ha cambiado el rumbo de guerras que parecían perdidas.","Es la diosa de la sabiduría y la estrategia, y ningún ejército gana sin honrar su nombre."], true);
addFamily("sekhmet", 3, "fuego", "campeon", "furia", ["Cachorra de la Diosa Leona","Sekhmet, Guerrera del Desierto Ardiente","Sekhmet, Diosa de la Guerra y la Peste"], ["Su aliento es tan ardiente como la arena del desierto al mediodía.","Su furia ya ha arrasado ejércitos enteros que subestimaron su ira.","Es la diosa de la guerra y la peste, y ningún enemigo de Texel sobrevive a su furia desatada."], true);
addFamily("gollum", 2, "tierra", "picaro", "sabotaje", ["Criatura Consumida","Criatura de las Cavernas Profundas","El que Susurra en la Oscuridad"], ["Una vez fue como cualquiera, hasta que algo que encontró lo cambió para siempre.","Se mueve entre las sombras de las cuevas más profundas sin que nadie lo escuche llegar.","Es el que susurra en la oscuridad, y nadie que se adentra en sus cuevas sale del todo igual."], true);
addFamily("sobek", 3, "agua", "campeon", "escudo", ["Cría de Sobek","Sobek, Guardián del Nilo","Sobek, Dios Cocodrilo del Río Sagrado"], ["Sus fauces han cerrado el paso a más invasores de los que nadie recuerda.","Sus fauces ya han detenido ejércitos enteros que intentaron cruzar su río.","Es el dios cocodrilo del río sagrado, y ninguna orilla de Texel está a salvo sin su vigilancia."], true);

// --- Tercera ronda: dioses que faltaban en panteones ya muy presentes
// (egipcio: Isis/Horus; nórdico: Freya/Tyr; griego: Hermes/Hefesto — mismo
// criterio que el caso Ares) + 5 animales humanizados nuevos (tejón
// mielero, hiena, dragón de Komodo, búfalo, mapache) — pedidos
// explícitamente por el usuario tras una sesión de brainstorming.
addFamily("isis", 3, "agua", "guru", "revivir", ["Joven Guardiana de la Magia","Isis en Vuelo de Alas Doradas","Isis, Señora de la Magia y la Vida"], ["Conoce palabras de poder que ni los propios dioses se atreven a pronunciar.","Sus alas doradas ya han devuelto el aliento a más de uno que se daba por perdido.","Reunió el cuerpo de Osiris pedazo a pedazo y le devolvió la vida con su magia — desde entonces, ninguna muerte le parece definitiva."], true);
addFamily("horus", 3, "viento", "campeon", "perforar", ["Joven Halcón del Cielo","Horus, Vengador del Trono","Horus, Señor del Cielo y la Realeza"], ["Perdió un ojo luchando por el trono de su padre, y con el otro ve más lejos que nadie.","Su picado en vuelo ya atraviesa cualquier guardia que se interponga en su camino.","Gobierna el cielo y la realeza de Egipto entera, y su ojo vigilante no se cierra jamás."], true);
addFamily("freya", 3, "rayo", "brujo", "bendicion", ["Joven Señora de los Gatos","Freya, Elegidora de los Caídos","Freya, Diosa del Amor y la Guerra"], ["Su carro, tirado por gatos, la lleva tan rápido al amor como a la batalla.","Elige a la mitad de los caídos en combate antes incluso que el propio Odín.","Es la diosa del amor y la guerra a la vez, y ningún guerrero de Asgard cuestiona su elección."], true);
addFamily("tyr", 3, "tierra", "campeon", "barrera", ["Joven Guardián del Juramento","Tyr, el de la Mano Perdida","Tyr, Dios de la Guerra y la Justicia"], ["Jura proteger incluso a quien sabe que puede costarle la mano.","Perdió la mano en las fauces de Fenrir para que los demás dioses pudieran encadenarlo.","Es el dios de la guerra y la justicia, y ningún juramento se rompe mientras él lo vigile."], true);
addFamily("hermes", 3, "viento", "picaro", "rafaga", ["Joven de Sandalias Aladas","Hermes, el más Veloz del Olimpo","Hermes, Mensajero de los Dioses"], ["Nadie lo ve llegar, y para cuando reaccionas, ya se ha vuelto a marchar.","Sus sandalias aladas ya lo llevan de un extremo a otro de Texel en un parpadeo.","Es el mensajero de los dioses, y ningún recado —ni ningún engaño— se le resiste."], true);
addFamily("hefesto", 3, "fuego", "campeon", "escudo", ["Joven Aprendiz de la Fragua","Hefesto, Maestro del Yunque","Hefesto, Señor de la Forja Divina"], ["Cojo de nacimiento, pero ningún dios forja con más maestría que él.","Su yunque ya ha forjado armas y armaduras para los dioses más poderosos de Texel.","Es el señor de la forja divina, y ninguna armadura salida de sus manos ha fallado jamás."], true);
addFamily("tejonmielero", 1, "tierra", "campeon", "furia", ["Cría de Tejón Mielero","Guerrero Tejón Mielero","Gran Tejón, el que Nunca Retrocede"], ["No conoce el miedo: ataca a presas diez veces más grandes que él sin dudarlo.","Ni el veneno más letal logra detenerlo por mucho tiempo.","Es el que nunca retrocede, y ningún depredador de Texel se atreve ya a subestimarlo."], true);
addFamily("hiena", 1, "tierra", "picaro", "aturdir", ["Cría de Hiena","Hiena Embaucadora","Gran Hiena, Reina de la Carcajada Cazadora"], ["Su risa desorienta a la presa un instante antes del ataque.","Caza en manada, y su risa ya confunde a rivales cada vez más grandes.","Es la reina de la carcajada cazadora, y ningún rival sabe ya cuándo va en serio."], true);
addFamily("dragonkomodo", 2, "tierra", "brujo", "veneno", ["Cría de Dragón de Komodo","Guerrero Dragón de Komodo","Gran Dragón de Komodo, Señor de la Isla Perdida"], ["Su mordida no mata al instante — pero el veneno que deja nunca perdona.","Su veneno ya debilita a presas mucho más grandes antes de que noten el peligro.","Gobierna su isla perdida sin rival, y su veneno es tan legendario como su paciencia."], true);
addFamily("bufalo", 2, "tierra", "campeon", "golpe", ["Cría de Búfalo","Búfalo de la Manada","Gran Búfalo, Muralla de la Llanura"], ["Embiste con el peso de toda la manada detrás de sus cuernos.","Su embestida ya ha dispersado a depredadores mucho más numerosos.","Es la muralla de la llanura, y ninguna carga enemiga logra ya moverlo del sitio."], true);
addFamily("mapache", 1, "tierra", "explorador", "sabotaje", ["Cría de Mapache","Mapache Ladrón de Sombras","Gran Mapache, Maestro de los Mil Bolsillos"], ["Sus manos ágiles abren cualquier cerrojo que se cruce en su camino.","Ya ha vaciado los bolsillos de más de un viajero distraído sin que se diera cuenta.","Es el maestro de los mil bolsillos, y nada queda a salvo de sus manos cuando decide robarlo."], true);

// --- Cuarta ronda: guerreros épicos/históricos (pedidos explícitamente
// tras dar una lista de sugerencias) + un personaje de sueños/arena +
// dos señores de la guerra nómadas (Atila histórico, y un arquetipo de
// khan de las estepas ORIGINAL — el usuario pidió expresamente no usar
// el nombre de ningún personaje de ficción registrado para este último).
addFamily("sigurd", 3, "fuego", "campeon", "perforar", ["Joven Escudero del Norte","Sigurd, Portador de Gram","Sigurd, el que Mató al Dragón"], ["Forjó su propia espada rota de nuevo, más afilada que cualquier otra hoja del norte.","Su espada Gram ya ha probado sangre de bestias que ningún otro guerrero se atrevió a enfrentar.","Atravesó el corazón de Fafnir desde abajo, y se bañó en su sangre para volverse casi invulnerable."], true);
addFamily("aquiles", 3, "agua", "picaro", "golpeGracia", ["Joven de Pies Ligeros","Aquiles, Azote de Troya","Aquiles, el Casi Invencible"], ["Su madre lo sumergió en aguas sagradas al nacer, dejando solo un punto débil en todo su cuerpo.","Ningún guerrero troyano ha sobrevivido a un duelo frente a frente con él.","Es el casi invencible, y su lanza ha decidido el destino de guerras enteras con un solo golpe certero."], true);
addFamily("sanson", 3, "tierra", "campeon", "furia", ["Joven de Cabello Sagrado","Sansón, el Nazareo","Sansón, el de la Fuerza Sin Límite"], ["Su fuerza crece con su fe, y nunca se ha dejado cortar el cabello que la contiene.","Ha derribado puertas de ciudades enteras con sus propias manos, sin ayuda de nadie.","Es el de la fuerza sin límite, y ni mil guerreros armados han logrado detenerlo cuando su ira despierta."], true);
addFamily("musashi", 3, "viento", "picaro", "dobleGolpe", ["Joven Ronin Errante","Musashi, el de las Dos Espadas","Musashi, el Espadachín Invicto"], ["Empuña una espada en cada mano, y ninguna de las dos conoce la derrota.","Ha ganado más de sesenta duelos sin perder ni uno solo en toda su vida.","Es el espadachín invicto, y su estilo de dos espadas ya es leyenda en cada dojo de Texel."], true);
addFamily("guanyu", 3, "rayo", "campeon", "golpe", ["Joven Portador de la Alabarda","Guan Yu, el de la Barba Larga","Guan Yu, Dios de la Guerra y la Lealtad"], ["Jura lealtad eterna a sus hermanos de armas, y jamás ha roto un juramento.","Su alabarda de dragón verde ya ha decidido batallas enteras de un solo golpe.","Su lealtad y su fuerza lo elevaron a dios de la guerra, y su nombre se invoca aún antes de cada batalla."], true);
addFamily("atila", 3, "fuego", "campeon", "grito", ["Joven Príncipe de las Estepas","Atila, el que Cabalga al Frente","Atila, Azote de Dios"], ["Une a tribus enteras bajo un solo estandarte con solo su presencia.","Ningún imperio ha logrado detener el avance de su horda por mucho que lo haya intentado.","Es el azote de Dios, y se dice que donde pisa su caballo, la hierba no vuelve a crecer."], true);
addFamily("khagan", 3, "rayo", "picaro", "rafaga", ["Joven Jinete de las Llanuras","Kan de la Horda Interminable","Gengis Kan, Señor de Todas las Estepas"], ["Nació sobre un caballo antes casi que sobre tierra firme.","Su horda ya no conoce fronteras que no haya cruzado a caballo.","Es el señor de todas las estepas, y ningún pueblo se atreve a alzar sus murallas sin temer su llegada."], true);

// --- Quinta ronda: 12 familias tier 1 (Común -> Raro) pedidas
// explícitamente para nivelar el reparto de tiers (antes 47/64/58,
// desequilibrado hacia tier 2/3) — animales sencillos y espíritus
// menores de folclore, todos con identidad propia ("humanizados" en
// actitud/nombre, no solo la bestia en sí), como pidió el usuario.
addFamily("erizo", 1, "tierra", "campeon", "barrera", ["Cría de Erizo","Erizo Guerrero de Púas","Gran Erizo, Fortaleza de Espinas Vivientes"], ["Se enrosca en una bola de púas ante el primer indicio de peligro.","Sus púas ya han detenido garras y colmillos por igual sin ceder terreno.","Es la fortaleza de espinas vivientes, y nada logra ya desenroscarlo por la fuerza."], true);
addFamily("ardilla", 1, "viento", "picaro", "dobleGolpe", ["Cría de Ardilla","Ardilla Saltarina de Garras Rápidas","Gran Ardilla, Relámpago de las Copas"], ["Salta de rama en rama más rápido de lo que el ojo puede seguir.","Sus garras ya golpean dos veces antes de que el rival reaccione a la primera.","Es el relámpago de las copas, y ningún árbol de Texel guarda secretos que ella no conozca."], true);
addFamily("rana", 1, "agua", "brujo", "veneno", ["Renacuajo Curioso","Rana Venenosa de Colores Vivos","Gran Rana, Reina del Estanque Ponzoñoso"], ["Sus colores brillantes son la única advertencia antes de tocarla.","Su piel ya segrega un veneno capaz de nublar los sentidos al instante.","Gobierna el estanque ponzoñoso entero, y ningún depredador se atreve ya a probarla."], true);
addFamily("nutria", 1, "agua", "explorador", "curar", ["Cría de Nutria","Nutria Juguetona de Manos Hábiles","Gran Nutria, Guardiana del Río en Calma"], ["Cuida de su familia con la misma dedicación con la que juega entre las corrientes.","Sus cuidados ya devuelven las fuerzas a cualquier compañero herido del grupo.","Es la guardiana del río en calma, y bajo su cuidado nadie del grupo queda atrás."], true);
addFamily("abeja", 1, "viento", "picaro", "veneno", ["Abeja Obrera","Abeja Guerrera del Aguijón Certero","Gran Abeja Reina, Señora del Enjambre Infinito"], ["Un solo aguijonazo suyo basta para hacer huir a presas mucho más grandes.","Su aguijón ya no falla nunca, y su veneno actúa antes de que el rival lo note.","Es la señora del enjambre infinito, y quien la ataca a ella se enfrenta a miles más."], true);
addFamily("foca", 1, "agua", "campeon", "escudo", ["Cría de Morsa","Morsa Guerrera de Piel Gruesa","Gran Morsa, Centinela de las Rocas Heladas"], ["Su grasa gruesa absorbe golpes que hundirían a cualquier otro nadador.","Ya ha resistido embestidas en las rocas que partirían huesos a cualquier otro.","Es la centinela de las rocas heladas, y ninguna ola ni ningún golpe logran ya moverla."], true);
addFamily("cabramontes", 1, "tierra", "campeon", "golpe", ["Cría de Cabra Montés","Cabra Montés de Cuernos de Piedra","Gran Cabra Montés, Señora de los Riscos Imposibles"], ["Trepa riscos que ningún otro animal de Texel se atreve siquiera a mirar.","Su cabezazo ya ha derribado rivales que la doblaban en tamaño.","Es la señora de los riscos imposibles, y ninguna cima de Texel queda fuera de su alcance."], true);
addFamily("mofeta", 1, "tierra", "brujo", "debilitar", ["Cría de Mofeta","Mofeta del Hedor Insoportable","Gran Mofeta, Terror de Nariz Sensible"], ["Su advertencia es clara: nadie se acerca dos veces tras oler lo que puede hacer.","Su hedor ya debilita la guardia de cualquier rival que se acerque demasiado.","Es el terror de nariz sensible, y ningún depredador de Texel se atreve ya a arriesgarse."], true);
addFamily("cuervo", 1, "viento", "brujo", "corromper", ["Cría de Cuervo","Cuervo Susurrador de Malos Augurios","Gran Cuervo, Heraldo de las Sombras Aladas"], ["Su graznido se dice que anuncia desgracias antes de que ocurran.","Sus susurros ya deshacen la buena fortuna de quien se cruza en su vuelo.","Es el heraldo de las sombras aladas, y ninguna bendición sobrevive mucho bajo su mirada."], true);
addFamily("musarana", 1, "tierra", "picaro", "aturdir", ["Cría de Musaraña","Musaraña Frenética de Mordisco Rápido","Gran Musaraña, Furia en Miniatura"], ["Se mueve tan rápido que parece estar en varios sitios a la vez.","Sus mordiscos ya llegan tan seguidos que el rival apenas tiene tiempo de reaccionar.","Es la furia en miniatura, y ningún rival grande la ha visto venir a tiempo."], true);
addFamily("duendehogar", 1, "fuego", "guru", "bendicion", ["Duendecillo del Hogar","Duende del Hogar, Guardián de la Chimenea","Gran Duende del Hogar, Protector de Cada Techo"], ["Vive escondido tras la chimenea, y cuida de la casa mientras nadie mira.","Su bendición ya mantiene el fuego encendido en las noches más frías.","Es el protector de cada techo de Texel, y ningún hogar que honra su presencia pasa hambre."], true);
addFamily("gnomojardin", 1, "tierra", "explorador", "sabotaje", ["Gnomo de Jardín Travieso","Gnomo de Jardín, Guardián de las Macetas","Gran Gnomo, Señor de Todos los Jardines Secretos"], ["Mueve las herramientas de sitio de la noche a la mañana solo por diversión.","Sus travesuras ya confunden a cualquiera que intente cuidar un jardín sin su permiso.","Es el señor de todos los jardines secretos, y ninguna planta de Texel crece sin que él lo sepa."], true);

// --- Sexta ronda: 12 familias tier 1 mas, segunda tanda de propuestas
// para seguir nivelando el reparto de tiers - animales humanizados.
addFamily("colibri", 1, "viento", "picaro", "rafaga", ["Cría de Colibrí","Colibrí Guerrero de Alas Veloces","Gran Colibrí, Destello que Nadie Alcanza"], ["Sus alas baten tan rápido que apenas se distinguen del aire mismo.","Ya esquiva golpes que ningún ojo logra seguir a tiempo.","Es el destello que nadie alcanza, y ningún rival ha logrado tocarlo dos veces."], true);
addFamily("libelula", 1, "viento", "picaro", "aturdir", ["Cría de Libélula","Libélula de Vuelo Errático","Gran Libélula, Espíritu de las Cuatro Alas"], ["Cambia de dirección en pleno vuelo antes de que nadie pueda anticiparla.","Su vuelo errático ya desorienta a rivales mucho más grandes que ella.","Es el espíritu de las cuatro alas, y ningún patrón de vuelo suyo se repite jamás."], true);
addFamily("castor", 1, "agua", "campeon", "barrera", ["Cría de Castor","Castor Ingeniero de Diques Firmes","Gran Castor, Maestro Constructor del Río"], ["Nada obstáculo se le resiste: si no existe un paso, él mismo lo construye.","Sus diques ya han desviado ríos enteros para proteger a los suyos.","Es el maestro constructor del río, y ninguna corriente logra ya derribar lo que levanta."], true);
addFamily("comadreja", 1, "tierra", "picaro", "sabotaje", ["Cría de Comadreja","Comadreja Escurridiza de Colmillos Finos","Gran Comadreja, Sombra que se Cuela por Cualquier Hueco"], ["Se cuela por espacios que ningún otro depredador considera siquiera posibles.","Ya ha robado provisiones enteras sin que nadie note su paso.","Es la sombra que se cuela por cualquier hueco, y ninguna guardia la ha detenido jamás."], true);
addFamily("zarigueya", 1, "tierra", "brujo", "debilitar", ["Cría de Zarigüeya","Zarigüeya que Finge su Propia Muerte","Gran Zarigüeya, Engañadora de Mil Caras"], ["Cae \"muerta\" al primer indicio de peligro... hasta que baja la guardia de su rival.","Su engaño ya ha convencido a depredadores mucho más experimentados que ella.","Es la engañadora de mil caras, y nadie sabe ya si lo que ve de ella es real."], true);
addFamily("mariposa", 1, "viento", "guru", "purificar", ["Oruga Silenciosa","Mariposa de Alas Recién Abiertas","Gran Mariposa, Alma Renacida de Mil Colores"], ["Se transforma por completo antes de mostrar su verdadera forma al mundo.","Sus alas ya purifican el aire a su alrededor con cada aleteo.","Es el alma renacida de mil colores, y ningún veneno ni maldición sobrevive a su roce."], true);
addFamily("escarabajo", 1, "tierra", "campeon", "escudo", ["Cría de Escarabajo","Escarabajo de Caparazón de Hierro","Gran Escarabajo, Coraza Viviente Indestructible"], ["Su caparazón ha resistido pisotones que aplastarían a cualquier otro insecto.","Ya ha cargado el doble de su propio peso sin que su coraza ceda ni un poco.","Es la coraza viviente indestructible, y ningún golpe conocido ha logrado agrietarlo."], true);
addFamily("caracol", 1, "agua", "campeon", "escudo", ["Cría de Caracol","Caracol de Concha Reforzada","Gran Caracol, Fortaleza que Nunca se Apresura"], ["No le hace falta ser rápido cuando nada logra atravesar su concha.","Su concha ya ha detenido ataques que destrozarían corazas mucho más grandes.","Es la fortaleza que nunca se apresura, y quien lo ataca solo pierde el tiempo."], true);
addFamily("pelicano", 1, "agua", "explorador", "drenar", ["Cría de Pelícano","Pelícano Pescador de Buche Profundo","Gran Pelícano, Señor de las Corrientes Costeras"], ["Su buche guarda más de lo que cualquiera esperaría a simple vista.","Cada zambullida suya ya recupera fuerzas que parecían perdidas del todo.","Es el señor de las corrientes costeras, y ninguna presa se le escapa dos veces."], true);
addFamily("ratacallejera", 1, "tierra", "picaro", "veneno", ["Cría de Rata Callejera","Rata Callejera de Callejones Sin Ley","Gran Rata, Reina de las Alcantarillas Olvidadas"], ["Sobrevive donde nadie más lo consigue, comiendo lo que otros desechan.","Su mordida ya porta enfermedades que ningún sanador logra curar del todo.","Es la reina de las alcantarillas olvidadas, y ninguna ciudad de Texel está libre de su influencia."], true);
//addFamily("fuegofatuo", 1, "fuego", "brujo", "corromper", ["Chispa Errante","Fuego Fatuo de los Pantanos Nocturnos","Gran Fuego Fatuo, Luz que Guía a Ninguna Parte"], ["Flota sobre los pantanos de noche, tentando a los viajeros a seguirlo.","Su luz ya ha desviado a más de un grupo de viajeros lejos del camino seguro.","Es la luz que guía a ninguna parte, y quien lo sigue rara vez encuentra el camino de vuelta."], true);
addFamily("ganso", 1, "viento", "campeon", "grito", ["Cría de Ganso","Ganso Guardián de Pico Furioso","Gran Ganso, Terror Emplumado del Corral"], ["Nadie subestima dos veces a un ganso que ya ha decidido perseguirlo.","Su graznido de guerra ya ha puesto en fuga a intrusos mucho más grandes que él.","Es el terror emplumado del corral, y ni el guerrero más curtido se libra de sus picotazos."], true);

// ### Enemigos / mobs normales (14.3)
addMobFamily('arpia', 1, 'viento', 'picaro', 'furia', ['Arpía Joven', 'Arpía Chillona', 'Arpía Matriarca del Nido'], ['Ataca en bandada, chillando para desorientar a su presa.', 'Su chillido ya basta para desorientar a toda una banda de viajeros.', 'Gobierna el nido entero, y ninguna arpía ataca sin su permiso.'], true);
addMobFamily('dullahan', 2, 'rayo', 'brujo', 'debilitar', ['Jinete sin Cabeza Menor', 'Dullahan Cabalgante', 'Dullahan, Heraldo de la Muerte'], ['Lleva su propia cabeza bajo el brazo, y donde se detiene, alguien muere.', 'Su montura ya no se detiene ante nada que se cruce en su camino.', 'Es el heraldo de la muerte misma: nadie sobrevive a su visita.'], true);
addMobFamily('tengu', 1, 'viento', 'picaro', 'aturdir', ['Tengu Travieso', 'Tengu Guerrero', 'Gran Tengu de la Montaña'], ['Maestro del engaño y la espada a partes iguales.', 'Su espada ya corta tan rápido como su ingenio engaña.', 'Gobierna la montaña entera, y ningún guerrero se atreve a desafiarlo.'], true);
addMobFamily('goblin', 1, 'tierra', 'picaro', 'golpe', ['Goblin Novato', 'Goblin Saqueador', 'Jefe de la Horda Goblin'], ['Solo, es débil. En horda, es una plaga imparable.', 'Ya no ataca solo: siempre llega acompañado de su banda de saqueo.', 'Lidera a toda la horda, y ninguna aldea cercana está a salvo.'], true);
addMobFamily('trasgo', 1, 'viento', 'picaro', 'aturdir', ['Trasgo Menor', 'Trasgo Revoltoso', 'Trasgo Rey de las Travesuras'], ['Le divierte más molestar a los viajeros que robarles.', 'Sus travesuras ya son legendarias entre los viajeros del camino.', 'Es el rey de las travesuras, y ningún trasgo se atreve a superarlo.'], true);
addMobFamily('demonio', 2, 'fuego', 'brujo', 'debilitar', ['Demonio Menor', 'Demonio de las Llamas', 'Archidemonio del Abismo'], ['Cada trato que ofrece esconde una trampa que nadie ve venir.', 'Sus llamas ya consumen tanto como sus tratos envenenados.', 'Gobierna el abismo entero, y ningún trato con él sale gratis.'], true);
addMobFamily('esqueleto', 1, 'tierra', 'campeon', 'golpe', ['Esqueleto Andante', 'Esqueleto Guerrero', 'Comandante de Huesos'], ['Ni la muerte pudo con las ganas de pelear de este guerrero.', 'Ha peleado en tantas batallas que ya ni recuerda cuándo murió.', 'Comanda un ejército entero de huesos que nunca se cansan de luchar.'], true);
addMobFamily('draugr', 2, 'agua', 'campeon', 'escudo', ['Draugr Recién Alzado', 'Draugr Vikingo', 'Rey Draugr del Túmulo'], ['Se niega a abandonar el tesoro que custodió en vida.', 'Su fuerza como no-muerto ya supera la que tuvo en vida.', 'Gobierna su túmulo como un rey, y su tesoro jamás será robado.'], true);
addMobFamily('chupacabra', 1, 'viento', 'picaro', 'furia', ['Chupacabras Joven', 'Chupacabras Nocturno', 'Terror de los Rebaños'], ['Nadie lo ha visto de cerca... y quien lo hizo no vivió para describirlo.', 'Caza de noche, y nadie ha vivido para describir bien su forma.', 'Es el terror de todos los rebaños, y ningún corral está a salvo de noche.'], true);
addMobFamily('kitsune', 2, 'fuego', 'brujo', 'debilitar', ['Kitsune de Una Cola', 'Kitsune de Tres Colas', 'Kitsune de Nueve Colas'], ['Cuantas más colas gana, más poderosa (y más traviesa) se vuelve su magia.', 'Sus tres colas ya esconden trucos que ningún cazador logra prever.', 'Con sus nueve colas, su magia ya rivaliza con la de los espíritus mayores.'], true);
addMobFamily('momia', 1, 'tierra', 'brujo', 'debilitar', ['Momia Menor', 'Momia Vendada', 'Faraón Momificado'], ['Duerme durante siglos, hasta que alguien profana su tumba.', 'Sus vendas ya se mueven solas para proteger su tumba de intrusos.', 'Fue faraón en vida, y su maldición sigue gobernando su tumba en la muerte.'], true);
addMobFamily('orco', 1, 'tierra', 'campeon', 'furia', ['Orco Recluta', 'Orco Guerrero', 'Jefe de Guerra Orco'], ['Vive para la batalla, y muere feliz si es peleando.', 'Ha sobrevivido a tantas batallas que ya perdió la cuenta de las cicatrices.', 'Lidera a toda su tribu a la guerra, y ninguno se atreve a desobedecerlo.'], true);
addMobFamily('dementor', 2, 'viento', 'brujo', 'debilitar', ['Sombra Menor', 'Dementor Errante', 'Dementor, Ladrón de Almas'], ['Su sola presencia arranca hasta el último recuerdo feliz.', 'Ya vaga sin rumbo fijo, dejando tras de sí solo desesperanza.', 'Roba almas enteras, y nadie que lo cruza vuelve a ser el mismo.'], true);
addMobFamily('arana', 1, 'tierra', 'picaro', 'aturdir', ['Araña Pequeña', 'Araña Venenosa', 'Reina Araña del Nido'], ['Teje su telaraña en silencio, y espera con paciencia infinita.', 'Su veneno ya es lo bastante fuerte como para inmovilizar a cualquier presa.', 'Gobierna un nido entero, y ninguna araña teje sin su permiso.'], true);
addMobFamily('jabali', 1, 'tierra', 'campeon', 'furia', ['Jabatillo', 'Jabalí Salvaje', 'Gran Jabalí del Bosque Oscuro'], ['Embiste sin dudar a cualquiera que se cruce en su camino.', 'Sus colmillos ya son capaces de partir un escudo de un solo golpe.', 'Gobierna el bosque oscuro entero, y nada se atreve a cruzarse en su camino.'], true);
addMobFamily('gargola', 2, 'tierra', 'campeon', 'escudo', ['Gárgola Dormida', 'Gárgola Vigilante', 'Gárgola Ancestral de Piedra'], ['De día es solo piedra... de noche, otra cosa muy distinta.', 'Ya vigila cada noche sin descanso, convertida en piedra solo de día.', 'Es tan antigua como las propias ruinas que custodia, ancestral e implacable.'], true);
addMobFamily('gigante', 2, 'tierra', 'campeon', 'golpe', ['Joven Gigante', 'Gigante de las Colinas', 'Gigante de las Montañas Rotas'], ['Cada paso suyo hace temblar el suelo a su alrededor.', 'Su paso ya derriba árboles enteros al cruzar las colinas.', 'Ha roto montañas enteras a puñetazos, y nada se le resiste.'], true);
addMobFamily('ogro', 1, 'tierra', 'campeon', 'furia', ['Ogro Pequeño', 'Ogro Garrotero', 'Gran Ogro del Pantano'], ['No es el más listo, pero su garrote no necesita estrategia.', 'Su garrote ya ha aplastado más de una armadura sin esfuerzo.', 'Gobierna el pantano entero, y su garrote no ha conocido la derrota.'], true);
addMobFamily('satirosalvaje', 1, 'viento', 'picaro', 'furia', ['Sátiro Salvaje', 'Sátiro del Bosque Profundo', 'Señor de los Sátiros Salvajes'], ['Vive libre en el bosque, lejos de cualquier regla o fiesta civilizada.', 'Se adentra cada vez más en el bosque profundo, lejos de cualquier civilización.', 'Gobierna a todos los sátiros salvajes, y ninguna regla lo alcanza ya.'], true);
addMobFamily('troll', 2, 'tierra', 'campeon', 'golpe', ['Troll de Puente Menor', 'Troll de las Cavernas', 'Gran Troll Regenerador'], ['Sus heridas se cierran casi tan rápido como se las hacen.', 'En las cavernas, sus heridas ya se cierran casi al instante.', 'Su regeneración es tan grande que ninguna herida logra detenerlo por mucho tiempo.'], true);
addMobFamily('estirge', 1, 'viento', 'picaro', 'debilitar', ['Estirge Menor', 'Estirge Sedienta', 'Enjambre de Estirges'], ['Drena la vida de su presa gota a gota, sin prisa.', 'Su sed ya no se sacia con poco: drena a su presa hasta dejarla exhausta.', 'Ataca en enjambre, y ninguna presa escapa a tantas bocas sedientas a la vez.'], true);
addMobFamily('ondina', 2, 'agua', 'guru', 'debilitar', ['Ondina Menor', 'Ondina de las Corrientes', 'Gran Ondina del Río Eterno'], ['Su canto arrastra a los incautos hasta el fondo del río.', 'Su canto ya domina las corrientes enteras del río.', 'Gobierna el río eterno, y su canto no ha dejado de arrastrar incautos jamás.'], true);
addMobFamily('zombi', 1, 'tierra', 'campeon', 'furia', ['Zombi Recién Alzado', 'Zombi Putrefacto', 'Zombi Alfa de la Horda'], ['No siente dolor, no conoce el miedo, y no se detiene jamás.', 'Su cuerpo putrefacto ya no siente ni el más mínimo daño.', 'Lidera a toda la horda, y ningún zombi se detiene mientras él avance.'], true);
addMobFamily('banshee', 2, 'viento', 'brujo', 'debilitar', ['Banshee Susurrante', 'Banshee Lamentosa', 'Gran Banshee, Heraldo de la Muerte'], ['Su lamento anuncia una muerte antes de que ocurra.', 'Su lamento ya se escucha desde más lejos cada vez que se acerca la muerte.', 'Es la heraldo de la muerte misma, y su grito nunca se equivoca.'], true);
addMobFamily('lamia', 2, 'tierra', 'brujo', 'debilitar', ['Lamia Joven', 'Lamia Serpentina', 'Reina Lamia del Oasis Maldito'], ['Su mitad de serpiente esconde una mordedura tan letal como su encanto.', 'Su mordedura serpentina ya es tan letal como su propio encanto.', 'Gobierna el oasis maldito, y ni su encanto ni su veneno perdonan a nadie.'], true);
addMobFamily('hombrearena', 1, 'tierra', 'brujo', 'aturdir', ['Remolino de Arena', 'Hombre de Arena', 'Señor de las Dunas Eternas'], ['Se deshace y se reforma a voluntad, imposible de atrapar.', 'Ya se deshace y reforma tan rápido que ningún golpe logra alcanzarlo.', 'Gobierna las dunas eternas, y nadie ha logrado atraparlo jamás.'], true);
addMobFamily('babosa', 1, 'agua', 'campeon', 'debilitar', ['Babosa Pequeña', 'Babosa Gigante', 'Reina Babosa del Pantano'], ['Lenta pero imparable, su rastro disuelve casi cualquier cosa.', 'Su rastro ya disuelve metal y piedra por igual a su paso.', 'Gobierna el pantano entero, y su rastro no deja nada intacto tras de sí.'], true);
addMobFamily('sapo', 1, 'agua', 'guru', 'debilitar', ['Renacuajo', 'Sapo Venenoso', 'Gran Sapo del Pantano Sagrado'], ['Su piel segrega un veneno capaz de nublar los sentidos del rival.', 'Su veneno ya es lo bastante fuerte como para nublar los sentidos al instante.', 'Gobierna el pantano sagrado, y su veneno es reverenciado tanto como temido.'], true);
addMobFamily('serpiente', 1, 'tierra', 'picaro', 'debilitar', ['Serpiente Joven', 'Serpiente Venenosa', 'Gran Serpiente del Desierto'], ['Ataca en silencio, y su veneno hace el resto del trabajo.', 'Su veneno ya actúa antes de que la presa note siquiera la mordida.', 'Gobierna el desierto entero, y su veneno no ha fallado ni una sola vez.'], true);
addMobFamily('setahumanoide', 1, 'tierra', 'brujo', 'debilitar', ['Seta Pequeña', 'Seta Humanoide', 'Gran Seta Ancestral del Bosque'], ['Sus esporas dejan aturdido a cualquiera que se acerque demasiado.', 'Sus esporas ya cubren un área mucho mayor a su alrededor.', 'Es tan antigua como el propio bosque, y sus esporas no perdonan a ningún intruso.'], true);
addMobFamily('frankenstein', 2, 'rayo', 'campeon', 'furia', ['Criatura Recién Cosida', 'Criatura de Frankenstein', 'Monstruo Perfeccionado'], ['Cosida a partir de partes de otros, cobró vida gracias a un rayo.', 'Cada nueva parte cosida la hace más fuerte que la anterior.', 'Es la creación perfeccionada, y ningún rayo podría ya devolverla a la nada.'], true);
addMobFamily('hombreseisbrazos', 2, 'rayo', 'picaro', 'furia', ['Aprendiz de Seis Brazos', 'Guerrero de Seis Brazos', 'Maestro de las Seis Espadas'], ['Con seis brazos, nunca le falta un arma más que blandir.', 'Sus seis brazos ya se mueven en perfecta coordinación en pleno combate.', 'Es el maestro de las seis espadas, y ningún rival logra seguirle el ritmo.'], true);
addMobFamily('insectogigante', 1, 'tierra', 'picaro', 'aturdir', ['Insecto Pequeño', 'Insecto Gigante', 'Enjambre Alfa'], ['Solo es un insecto... hasta que ves cuántos son.', 'Ya ha crecido lo suficiente como para ser una amenaza por sí solo.', 'Lidera al enjambre entero, y ningún insecto se mueve sin su señal.'], true);

// ### Jefes / bosses (14.2) — combate único, sin evolución, fuera del pool de invocación.
// Tifón y Balrog son a propósito los dos últimos jefes del mapa (zonas
// 'salon_enganos' y 'torre_prohibida', las 2 últimas de ZONES) y los más
// fuertes de los 33 en TODAS sus estadísticas — el final del juego. Tifón
// (la última zona de todas) es ligeramente más fuerte que Balrog (penúltima).
addBoss('tifon', 'rayo', 'brujo', 'arrasar', 'Tifón, Padre de los Monstruos', 'El monstruo más temible de todos, capaz de desafiar a los propios dioses.', 'epico', true, { hp: 2850, atk: 480, def: 500, agi: 430, wis: 480 });
addBoss('quimera', 'fuego', 'campeon', 'arrasar', 'Quimera, la Bestia de Tres Cabezas', 'León, cabra y serpiente en un solo cuerpo, y fuego en cada aliento.', 'epico', true, { hp: 2041, atk: 187, def: 348, agi: 137, wis: 68 });
addBoss('garn', 'tierra', 'campeon', 'golpe', 'Garn, el Devorador de Piedra', 'Se alimenta de roca y escupe fragmentos capaces de atravesar una armadura.', 'raro', true, { hp: 1758, atk: 166, def: 210, agi: 54, wis: 47 });
addBoss('nian', 'fuego', 'campeon', 'furia', 'Nian, la Bestia del Año Nuevo', 'Solo el ruido y el color rojo lo mantienen alejado de los pueblos.', 'raro', true, { hp: 1558, atk: 168, def: 173, agi: 65, wis: 44 });
addBoss('tiamat', 'agua', 'brujo', 'arrasar', 'Tiamat, Madre del Caos', 'De su furia nacieron los primeros monstruos del mundo.', 'epico', true, { hp: 1410, atk: 261, def: 248, agi: 190, wis: 301 });
addBoss('surtr', 'fuego', 'campeon', 'golpe', 'Surtr, Señor de las Llamas de Muspelheim', 'Su espada ardiente se dice que incendiará los nueve mundos al final de los tiempos.', 'epico', true, { hp: 1944, atk: 161, def: 419, agi: 176, wis: 63 });
addBoss('behemoth', 'tierra', 'campeon', 'golpe', 'Behemoth, la Bestia Primigenia', 'Tan grande y antiguo que su sola existencia desafía toda lógica.', 'epico', true, { hp: 1398, atk: 186, def: 476, agi: 185, wis: 66 });
addBoss('medusa', 'tierra', 'brujo', 'debilitar', 'Medusa, la Gorgona de Mirada Pétrea', 'Una sola mirada a sus ojos convierte a cualquiera en piedra.', 'raro', true, { hp: 1498, atk: 245, def: 156, agi: 86, wis: 189 });
addBoss('apofis', 'tierra', 'brujo', 'arrasar', 'Apofis, la Serpiente del Caos', 'Cada noche intenta devorar al sol, y cada noche es derrotado — por poco.', 'epico', true, { hp: 1688, atk: 297, def: 288, agi: 187, wis: 294 });
addBoss('ammit', 'tierra', 'campeon', 'furia', 'Ammit, Devoradora de Corazones', 'Devora el corazón de quien no es digno de pasar al más allá.', 'raro', true, { hp: 1286, atk: 169, def: 254, agi: 64, wis: 48 });
addBoss('cthulhu', 'agua', 'brujo', 'arrasar', 'Cthulhu, el que Duerme en las Profundidades', 'Su despertar traería la locura a cualquiera que lo presencie.', 'epico', true, { hp: 1884, atk: 254, def: 343, agi: 281, wis: 324 });
addBoss('balrog', 'fuego', 'brujo', 'arrasar', 'Balrog, Demonio de Sombra y Fuego', 'Envuelto en llamas y sombra, ningún pasillo es lo bastante estrecho para detenerlo.', 'epico', true, { hp: 2700, atk: 475, def: 490, agi: 410, wis: 460 });
addBoss('leondenemea', 'tierra', 'campeon', 'golpe', 'León de Nemea, Piel Impenetrable', 'Ningún arma forjada por mortales ha logrado atravesar su piel.', 'raro', true, { hp: 1422, atk: 174, def: 228, agi: 83, wis: 57 });
addBoss('pajaroroc', 'viento', 'explorador', 'furia', 'Roc, el Ave que Oscurece el Cielo', 'Sus alas al abrirse tapan el sol entero sobre el desierto.', 'raro', true, { hp: 1212, atk: 207, def: 183, agi: 191, wis: 115 });
addBoss('torodecreta', 'tierra', 'campeon', 'furia', 'Toro de Creta, Furia Desatada', 'Arrasó campos enteros antes de que nadie lograra domarlo.', 'raro', true, { hp: 1616, atk: 165, def: 260, agi: 80, wis: 60 });
addBoss('basilisco', 'tierra', 'brujo', 'debilitar', 'Basilisco, Rey de las Serpientes', 'Su mirada mata, y su veneno no perdona ni a la piedra.', 'epico', true, { hp: 2276, atk: 395, def: 194, agi: 109, wis: 239 });
addBoss('ettin', 'tierra', 'campeon', 'golpe', 'Ettin, el Gigante de Dos Cabezas', 'Dos cabezas significan el doble de mal genio... y el doble de fuerza.', 'epico', true, { hp: 2020, atk: 248, def: 367, agi: 94, wis: 69 });
addBoss('gorgonas', 'tierra', 'brujo', 'debilitar', 'Las Gorgonas, Hermanas de Piedra', 'Donde una gorgona falla, sus hermanas terminan el trabajo.', 'epico', true, { hp: 2054, atk: 359, def: 229, agi: 109, wis: 300 });
addBoss('rakshasa', 'fuego', 'brujo', 'debilitar', 'Rakshasa, el Cambiante Maldito', 'Puede tomar cualquier forma para acercarse a su presa sin ser detectado.', 'epico', true, { hp: 902, atk: 353, def: 388, agi: 216, wis: 287 });
addBoss('manticora', 'fuego', 'picaro', 'furia', 'Mantícora, la Devoradora de Hombres', 'Su cola de escorpión dispara espinas tan letales como su mordida.', 'epico', true, { hp: 1254, atk: 376, def: 149, agi: 276, wis: 87 });
addBoss('liche', 'rayo', 'brujo', 'debilitar', 'Liche, Señor de los No-Muertos', 'Selló su alma en un objeto oculto para no morir jamás de verdad.', 'epico', true, { hp: 1826, atk: 298, def: 333, agi: 204, wis: 346 });
addBoss('magooscuro', 'rayo', 'brujo', 'debilitar', 'El Mago Oscuro sin Nombre', 'Su nombre se ha borrado del recuerdo — pero su sombra sigue creciendo.', 'epico', true, { hp: 1861, atk: 379, def: 205, agi: 159, wis: 348 });
addBoss('loki', 'rayo', 'brujo', 'debilitar', 'Loki, el Dios del Engaño', 'Nunca se sabe si su ayuda es un regalo o el inicio de una trampa.', 'epico', true, { hp: 1831, atk: 361, def: 276, agi: 228, wis: 358 });
addBoss('joker', 'viento', 'picaro', 'aturdir', 'El Bufón de la Locura', 'Nadie entiende su chiste hasta que ya es demasiado tarde para reírse.', 'epico', true, { hp: 1335, atk: 361, def: 137, agi: 231, wis: 73 });
addBoss('acromantula', 'tierra', 'picaro', 'aturdir', 'Acromántula, Madre de la Colonia', 'Donde hay una, hay cientos más esperando entre las sombras.', 'epico', true, { hp: 1425, atk: 384, def: 153, agi: 365, wis: 91 });
addBoss('wendigo', 'viento', 'brujo', 'furia', 'Wendigo, Hambre sin Fin', 'Cuanto más devora, más hambriento se vuelve — nunca se sacia.', 'epico', true, { hp: 1720, atk: 404, def: 267, agi: 143, wis: 309 });
addBoss('mantisreligiosa', 'viento', 'picaro', 'furia', 'Mantis, la Segadora Silenciosa', 'Espera inmóvil durante horas... y ataca en una fracción de segundo.', 'epico', true, { hp: 1097, atk: 435, def: 173, agi: 405, wis: 101 });

// Jefes de las 6 zonas ORIGINALES: al principio usaban luchadores jugables
// (topo_infrecuente, nigro_raro, lagarto_epico, etc.) como jefe de zona, lo
// que violaba la regla de "ni jefes ni enemigos de mapa pueden ser
// criaturas jugables". Estos 6 los sustituyen, uno por zona, con la misma
// rareza aproximada que tenían antes.
addBoss('guardianbosque', 'tierra', 'campeon', 'escudo', 'Guardián del Bosque Ancestral', 'Un espíritu milenario que protege cada árbol de la Linde del Bosque.', 'comun', true, { hp: 715, atk: 26, def: 14, agi: 44, wis: 31 });
addBoss('brujapantano', 'agua', 'brujo', 'debilitar', 'Bruja del Pantano Eterno', 'Conoce cada raíz y cada sombra del Pantano Oscuro, y las usa contra los intrusos.', 'infrecuente', true, { hp: 501, atk: 79, def: 74, agi: 54, wis: 86 });
addBoss('colosocristal', 'tierra', 'campeon', 'golpe', 'Coloso de Cristal', 'Sus puños de cuarzo han sepultado a más de un intruso en las Cuevas de Cristal.', 'raro', true, { hp: 704, atk: 65, def: 143, agi: 45, wis: 19 });
addBoss('titanhielo', 'agua', 'campeon', 'escudo', 'Titán de Hielo Eterno', 'Ni la escalada más dura prepara a nadie para enfrentarse a él en la cima de los Picos Helados.', 'raro', true, { hp: 1458, atk: 142, def: 175, agi: 53, wis: 37 });
addBoss('reyruinas', 'tierra', 'brujo', 'debilitar', 'Rey Espectral de las Ruinas', 'Gobierna las Ruinas Abisales desde un trono que se desmorona junto con su reino.', 'raro', true, { hp: 1659, atk: 276, def: 131, agi: 63, wis: 138 });
addBoss('dragonguarida', 'fuego', 'campeon', 'escudo', 'Dracorex, Señor de la Guarida', 'El dragón más temido de Texel, dueño absoluto de su Guarida.', 'epico', true, { hp: 2441, atk: 256, def: 237, agi: 58, wis: 40 });

// Homúnculos: no luchan nunca (no entran en FIGHTERS ni en la Formación).
// Sirven solo como material de experiencia — se fusionan con cualquier
// luchador jugable desde su ficha para subirle de nivel directamente. A
// mejor tier, más experiencia otorgan. element/class/rarity son solo de
// cara al sprite procedural y al color de la revelación de invocación, no
// afectan a ninguna stat de combate (nunca llegan a construir una unidad).
const HOMUNCULOS = [
  { id: 'homunculo_t1', name: 'Homúnculo Menor', tier: 1, element: 'tierra', class: 'explorador', rarity: 'comun', xpValue: 80, lore: 'Un intento imperfecto de crear vida — inútil en combate, pero rebosante de energía vital que puede transmitir a otro luchador.' },
  { id: 'homunculo_t2', name: 'Homúnculo Mediano', tier: 2, element: 'rayo', class: 'brujo', rarity: 'raro', xpValue: 260, lore: 'Una creación alquímica más estable que la anterior, cargada con aún más experiencia para ceder.' },
  { id: 'homunculo_t3', name: 'Homúnculo Mayor', tier: 3, element: 'fuego', class: 'guru', rarity: 'legendario', xpValue: 700, lore: 'La cúspide del arte alquímico: no sirve para pelear, pero fusionarlo con un luchador equivale a decenas de batallas de experiencia.' },
];
function homunculoDef(id) { return HOMUNCULOS.find(h => h.id === id); }
function homunculoTierForRarity(rarity) {
  if (rarity === 'legendario') return 3;
  if (rarity === 'raro' || rarity === 'epico') return 2;
  return 1;
}

function fighterDef(id) { return FIGHTERS.find(f => f.id === id) || BOSSES.find(f => f.id === id) || MOBS.find(f => f.id === id) || HOMUNCULOS.find(f => f.id === id); }

// Solo los Legendarios llevan habilidad de líder (ver LEADER_SKILLS), como
// pedía el usuario ("sobre todo legendarias"). Repartida a mano por clase y
// tema de cada uno, no todo el mismo tipo de bonus.
function setLeaderSkill(defId, skillId) { const d = fighterDef(defId); if (d) d.leaderSkillId = skillId; }
setLeaderSkill('ascua_legendario', 'def_boost');
setLeaderSkill('nigro_legendario', 'wis_boost');
setLeaderSkill('lagarto_legendario', 'def_boost');
setLeaderSkill('duende_legendario', 'agi_boost');
setLeaderSkill('chispa_legendario', 'wis_boost');
setLeaderSkill('piroman_legendario', 'atk_boost');
setLeaderSkill('brisa_legendario', 'agi_boost');
setLeaderSkill('hidradragon_legendario', 'hp_boost');
setLeaderSkill('avefenix_legendario', 'hp_boost');
setLeaderSkill('cerbero_legendario', 'hp_boost');
setLeaderSkill('kraken_legendario', 'def_boost');
setLeaderSkill('leviatan_legendario', 'def_boost');
setLeaderSkill('fenrir_legendario', 'atk_boost');
setLeaderSkill('quetzalcoatl_legendario', 'agi_boost');
setLeaderSkill('shenlong_legendario', 'wis_boost');
setLeaderSkill('zeus_legendario', 'atk_boost');
setLeaderSkill('pazuzu_legendario', 'agi_boost');
setLeaderSkill('anubis_legendario', 'wis_boost');
setLeaderSkill('ra_legendario', 'atk_boost');
setLeaderSkill('osiris_legendario', 'hp_boost');
setLeaderSkill('dracula_legendario', 'atk_boost');
setLeaderSkill('hercules_legendario', 'hp_boost');
setLeaderSkill('esfinge_legendario', 'wis_boost');
setLeaderSkill('armaduratecno_legendario', 'atk_boost');
setLeaderSkill('genio_legendario', 'wis_boost');
setLeaderSkill('thor_legendario', 'atk_boost');
setLeaderSkill('odin_legendario', 'wis_boost');
setLeaderSkill('sunwukong_legendario', 'agi_boost');
setLeaderSkill('afrodita_legendario', 'hp_boost');
setLeaderSkill('poseidon_legendario', 'def_boost');
setLeaderSkill('ragnar_legendario', 'def_boost');

// Ejemplo (desactivado) de setStatMult (ver la función más arriba, junto a
// statVarianceMult): sube el ATK de Hércules un 20% en sus 3 formas, sin
// tocar el resto de sus stats ni a ningún otro Campeón de Tierra. Para
// tocar cualquier otro personaje, cambia el defId y el multiplicador —
// las claves válidas son hp/atk/def/agi/wis, y 1 = sin cambio.
// setStatMult('hercules_raro', { atk: 1.2 });
// setStatMult('hercules_epico', { atk: 1.2 });
// setStatMult('hercules_legendario', { atk: 1.2 });

// Odín (a diferencia del ejemplo de arriba, este SÍ está activo): medido
// con fighterPowerScore, su forma final (Gurú — reparte casi todo en WIS,
// que pesa ×0.5) quedaba por detrás de varias Épicas de clase Campeón
// (que meten casi todo en HP/DEF, con más peso) pese a ser Legendario —
// nada mal calculado, solo un reparto de clase que no hacía justicia a
// "el dios que gobierna Asgard". Sube HP/ATK/DEF/AGI para que compita de
// verdad con el resto de Legendarios de primera fila, sin tocar su WIS
// (137 base, el más alto del roster — sigue siendo su seña de identidad).
// ATK subido de nuevo (×1.4 → ×1.7): con curar/bendicion/debilitar ahora
// usando WIS (ver SKILL_TYPES) su ulti ya no depende de su ATK, pero
// sigue atacando con él en los turnos SIN ulti — un ATK más alto evita
// que esos turnos se sientan flojos.
// Escalado de nuevo (×1.02436 extra sobre el vector de arriba, no
// reemplazado) al ampliar el top 5 más abajo (ver el bloque de
// Zeus/Poseidón/Thor/Hércules/Maui) — necesitaba más margen sobre Ares
// para que el top 5 quedase separado de verdad y no en un empate frágil
// a merced del redondeo por stat. Multiplicar TODO el vector asimétrico
// por un mismo factor mantiene su identidad (ATK el más subido, WIS
// intacto en proporción al resto) mientras sube el total.
setStatMult('odin_legendario', { hp: 1.22896, atk: 1.74102, def: 1.33137, agi: 1.12654, wis: 1.02413 });

// hombreseisbrazos (Pícaro): a diferencia de Odín, aquí el problema era el
// contrario — un pico de dificultad, no un bajón. Al fijar el nivel de la
// Torre Batalla a XP_LEVEL_CAP para todos los rivales (antes escalaba con
// la zona de origen, ver buildTorreLevels), el peso de ATK/AGI de Pícaro
// (el más alto de las 5 clases en ambas stats — pensado como "glass
// cannon") combinado con la rareza Épica (×3.2, la más alta de ese tramo
// de la escalera) dejaba a este mob con 435 ATK / 351 AGI a Nv.40 — muy
// por encima de sus vecinos de la MISMA tanda de 12 rivales (todos Brujo/
// Campeón/Gurú en esa tanda, con 115-356 ATK / 115-298 AGI): agi tan alta
// significa que sus 3 atacantes por oleada golpean SIEMPRE antes que la
// línea del jugador, y con ese ATK cada golpe pesa mucho más — combinado
// con las 4 oleadas seguidas sin curación de este nivel, la tasa de
// victoria de una banda recién terminado el mapa se desplomaba al
// 10-45% frente al ~100% de sus vecinos en simulación. Rebajado con
// setStatMult para devolverlo a una dificultad en línea con el resto de
// esa tanda (228 AGI / 326 ATK a Nv.40, ~98% de victorias en la misma
// simulación) sin perder del todo su identidad de Pícaro rápido/pegador
// — sigue siendo de los más ágiles y contundentes de su tanda, solo que
// ya no es un muro aislado en mitad de una escalera pensada para subir
// de dificultad progresivamente, no a saltos.
setStatMult('hombreseisbrazos_epico', { agi: 0.65, atk: 0.75 });

// Zeus/Thor/Fenrir/Sun Wukong: petición explícita del usuario tras
// preguntarle mi opinión sobre el orden de poder de los Legendarios y
// contestar con estos 4 — "pon a zeus, thor, fenrir y sun wukong en el
// orden que has dicho, así que hincha sus estadísticas hasta llegar a
// esas posiciones". El criterio no es de combate sino de "fantasía de
// poder" mitológica/pop: Zeus por delante de Poseidón (su hermano, pero
// menos "rey de los dioses" en la cultura popular), Thor por delante de
// Hércules, y Sun Wukong/Fenrir — infravalorados por su clase (Pícaro,
// que reparte casi todo en ATK/AGI en vez de HP/DEF, lo que pesa menos en
// fighterPowerScore) — subidos a la primera fila junto a ellos.
// Multiplicador UNIFORME (misma proporción en las 5 stats, no solo una)
// para no romper la identidad de cada uno, calculado para aterrizar en el
// poder base (Nv.1, sin equipo) exacto que deja este orden final:
// Odín(439) > Zeus(437) > Poseidón(433) > Thor(427) > Hércules(424) >
// ... > Sun Wukong(405) > Fenrir(403) > Leviatán(401) > ...
// — verificado por simulación antes de aplicarlo, recalculando el ranking
// completo de los 31 Legendarios con los 4 multiplicadores ya puestos.
setStatMult('sunwukong_legendario', { hp: 1.095, atk: 1.095, def: 1.095, agi: 1.095, wis: 1.095 });
setStatMult('fenrir_legendario', { hp: 1.148, atk: 1.148, def: 1.148, agi: 1.148, wis: 1.148 });

// Corrección posterior: al añadir 38 Legendarios/personajes nuevos (ver
// más abajo), 3 de ellos (Ares, Sobek, Sekhmet) colaron por delante de
// Zeus/Poseidón/Thor en el ranking — el usuario confirmó que el top 5
// correcto es Odín > Zeus > Poseidón > Thor > Hércules, así que los 4
// (más Odín arriba) se recalibran para que ese orden se cumpla con
// margen de verdad frente a Ares (438.7, el más alto de los 3 intrusos)
// en vez de un empate a merced del redondeo. Multiplicador uniforme
// (reemplaza al de Zeus/Thor de arriba, que ya no basta) calculado por
// convergencia iterativa (el redondeo POR STAT individual hace que un
// solo cálculo directo target/base se quede corto) para aterrizar en:
// Odín(450) > Zeus(447) > Poseidón(445) > Thor(443) > Hércules(441) >
// Ares(438.7) > Sobek(434.2) > Sekhmet(429) — verificado por simulación
// recalculando el ranking completo de los 45 Legendarios.
setStatMult('zeus_legendario', { hp: 1.09415, atk: 1.09415, def: 1.09415, agi: 1.09415, wis: 1.09415 });
setStatMult('poseidon_legendario', { hp: 1.02631, atk: 1.02631, def: 1.02631, agi: 1.02631, wis: 1.02631 });
setStatMult('thor_legendario', { hp: 1.14467, atk: 1.14467, def: 1.14467, agi: 1.14467, wis: 1.14467 });
setStatMult('hercules_legendario', { hp: 1.03895, atk: 1.03895, def: 1.03895, agi: 1.03895, wis: 1.03895 });

// Maui (Explorador, tier 3): mismo problema de fondo que Sun Wukong/
// Fenrir en su momento — Explorador reparte los pesos MÁS bajos de las 5
// clases (ver CLASS_INFO), así que por mucho que sea Legendario quedaba
// el ÚLTIMO de los 45 (322.4, por detrás incluso de la Común mejor
// plantada). Subido a una posición media-alta acorde a su tier y a su
// peso narrativo ("semidiós de las mil hazañas"), sin intentar competir
// con el top 5 de dioses mayores — queda entre Shenlong y el resto de
// Legendarios "sólidos", no entre los más fuertes del roster.
setStatMult('maui_legendario', { hp: 1.20968, atk: 1.20968, def: 1.20968, agi: 1.20968, wis: 1.20968 });

// Atenea/Amaterasu (petición explícita del usuario, "ajusta atenea y
// amaterasu" tras verlas demasiado bajas en el ranking para lo que
// representan — diosas centrales de sus panteones) y Ra/Anubis (el
// usuario preguntó si no estaban demasiado bajos y pidió subirlos "si
// así lo consideras" — Ra en concreto, dios sol supremo egipcio, quedaba
// por detrás incluso de Anubis, lo que no hacía justicia a su peso).
// Subidos a la franja de Susanoo/Fenrir/Leviatán/Shenlong (~390-400),
// justo por debajo del top 8 ya fijado arriba, sin tocarlo. Ra queda
// ligeramente por delante de Anubis (dios sol > guardián de los muertos
// en peso narrativo egipcio).
setStatMult('atenea_legendario', { hp: 1.11421, atk: 1.11421, def: 1.11421, agi: 1.11421, wis: 1.11421 });
setStatMult('amaterasu_legendario', { hp: 1.09559, atk: 1.09559, def: 1.09559, agi: 1.09559, wis: 1.09559 });

// Segunda subida de Ra/Anubis: el usuario, tras ver el primer ajuste
// (arriba, ~390), preguntó objetivamente si no deberían estar en el top
// 10 o casi — respuesta sincera: sí. Ra es (en la mayoría de periodos)
// el dios creador/solar SUPREMO del panteón egipcio, no un dios
// regional como Sobek ni una diosa de la guerra como Sekhmet — no tenía
// sentido que quedara por detrás de ambos. Anubis es icónico pero
// tradicionalmente un guía/guardián, no "rey" del panteón, así que se
// queda justo en el borde del top 10 en vez de compitiendo con Ra o con
// el top 6. Multiplicadores que REEMPLAZAN a los de la subida anterior
// (no se acumulan) — calculados por convergencia igual que el resto de
// este bloque, para: Ares(438.7) > Ra(436) > Sobek(434.2) > Sekhmet(429)
// > Anubis(416) > Drakón(411.4) > ...
setStatMult('ra_legendario', { hp: 1.23518, atk: 1.23518, def: 1.23518, agi: 1.23518, wis: 1.23518 });
setStatMult('anubis_legendario', { hp: 1.15184, atk: 1.15184, def: 1.15184, agi: 1.15184, wis: 1.15184 });

// Aquiles/Musashi/Hermes: mismo sesgo estructural de clase Pícaro (ver
// Sun Wukong/Fenrir/Maui más arriba) — el usuario pidió auditar la
// escala de poder de los guerreros épicos recién añadidos y confirmó
// arreglarlo tras ver que Aquiles y Musashi caían a las dos ÚLTIMAS
// posiciones de los 58 Legendarios pese a representar "el guerrero casi
// invencible de Troya" y "el espadachín invicto en 60 duelos". Subidos
// a la franja de los guerreros legendarios ya bien situados (junto a
// Sigurd/Guan Yu y Sun Wukong/Susanoo/Fenrir respectivamente); Hermes
// (sesgo más leve, no llegaba a caer del todo al fondo) sube a la
// franja de "segundo escalón de dioses" junto a Freya/Maui.
setStatMult('aquiles_legendario', { hp: 1.2108, atk: 1.2108, def: 1.2108, agi: 1.2108, wis: 1.2108 });
setStatMult('musashi_legendario', { hp: 1.16981, atk: 1.16981, def: 1.16981, agi: 1.16981, wis: 1.16981 });
setStatMult('hermes_legendario', { hp: 1.09455, atk: 1.09455, def: 1.09455, agi: 1.09455, wis: 1.09455 });

// Sekhmet: el usuario preguntó si no debería bajar del top 9 (donde
// había quedado, sin calibrar, casi empatada con Ra y Sobek) y confirmó
// que sí. Mitológicamente es una MANIFESTACIÓN de la ira de Ra (nació
// de su ojo para castigar a la humanidad), no una gobernante suprema
// por derecho propio como Ra/Isis/Osiris — no tenía sentido que
// superase a Anubis o compitiera con el trío supremo. Bajada a la
// franja de Sigurd/Aquiles/Anubis (~415-419): sigue siendo una diosa
// temible de primera fila, solo que ya no en el top 8.
setStatMult('sekhmet_legendario', { hp: 0.97087, atk: 0.97087, def: 0.97087, agi: 0.97087, wis: 0.97087 });


// --- 11 jefes nuevos (pedidos explícitamente por el usuario), añadidos
// DESPUÉS de completar el mapa original de 33 zonas: cada uno vive en su
// propia zona nueva, apilada al FINAL (zonas 34-44) para no tocar la curva
// de nivel ya calibrada (LEVEL_CAP_ZONE_IDX=28 ya deja al jugador a tope
// mucho antes de llegar aquí) — contenido de "segunda vuelta" para quien ya
// se ha terminado el mapa entero. fixedStats calibradas con
// fighterPowerScore para aterrizar en el lugar que les corresponde por su
// peso narrativo (ver TODO.md para el ranking completo verificado):
// Titán Colosal/Kaiju/Jörmungandr quedan justo debajo de Tifón/Balrog (una
// "tercera pareja" de amenazas que rivalizan con el final del mapa
// original); Hades/Hel/Set se unen a Loki/Cthulhu en la cabecera de
// dioses de pleno derecho; Fafnir iguala a Dracorex (incluso siendo de
// familias distintas, "gran dragón" pesa parecido); Anzu/Simbionte
// Devorador quedan en la media-alta; Grendel en la media; Jersey Devil
// deliberadamente bajo, como amenaza de folclore moderno más que divina.
addBoss('jormungandr', 'agua', 'brujo', 'arrasar', 'Jörmungandr, la Serpiente que Rodea el Mundo', 'Tan grande que su cuerpo entero rodea el océano y se muerde su propia cola — el día que la suelte, los nueve mundos temblarán.', 'legendario', true, { hp: 2600, atk: 420, def: 380, agi: 220, wis: 425 });
addBoss('hades', 'tierra', 'brujo', 'debilitar', 'Hades, Señor del Inframundo', 'Gobierna el reino de los muertos con una justicia fría que ni los propios dioses se atreven a cuestionar.', 'legendario', true, { hp: 1750, atk: 380, def: 410, agi: 210, wis: 400 });
addBoss('hel', 'agua', 'brujo', 'corromper', 'Hel, Soberana de los Muertos sin Honor', 'Mitad rostro de viva, mitad de cadáver, decide el destino de quienes no cayeron con gloria en la batalla.', 'legendario', true, { hp: 1700, atk: 365, def: 390, agi: 200, wis: 390 });
addBoss('set', 'tierra', 'brujo', 'sabotaje', 'Set, Señor de las Tormentas y el Caos', 'Asesinó a su propio hermano por el trono, y desde entonces el caos que siembra no conoce límites.', 'legendario', true, { hp: 1650, atk: 347, def: 355, agi: 200, wis: 345 });
addBoss('fafnir', 'fuego', 'campeon', 'golpe', 'Fafnir, el Dragón de la Avaricia', 'Su codicia por un tesoro maldito lo transformó en el dragón más temido de su época.', 'legendario', true, { hp: 1780, atk: 230, def: 420, agi: 110, wis: 70 });
addBoss('anzu', 'viento', 'brujo', 'aturdir', 'Anzu, el Ave-Demonio de la Tormenta', 'Robó la Tablilla de los Destinos a los propios dioses, y desde entonces el trueno le obedece.', 'legendario', true, { hp: 1350, atk: 295, def: 250, agi: 230, wis: 270 });
addBoss('simbionte', 'rayo', 'brujo', 'perforar', 'El Simbionte Devorador', 'Cayó de otro mundo y se fusionó con el primer cuerpo que encontró — ya no se sabe dónde termina la bestia y empieza su portador.', 'legendario', true, { hp: 1200, atk: 335, def: 270, agi: 250, wis: 260 });
addBoss('titancolosal', 'tierra', 'campeon', 'golpe', 'El Titán Colosal', 'Ninguna muralla construida por manos mortales ha resistido jamás su avance.', 'legendario', true, { hp: 3350, atk: 280, def: 650, agi: 140, wis: 90 });
addBoss('kaiju', 'agua', 'campeon', 'arrasar', 'El Kaiju de las Profundidades', 'Emergió del fondo del océano una sola vez, y esa vez bastó para borrar una costa entera del mapa.', 'legendario', true, { hp: 3200, atk: 355, def: 550, agi: 130, wis: 100 });
addBoss('grendel', 'tierra', 'campeon', 'furia', 'Grendel, el Devorador de Salones', 'Ningún salón de guerreros, por bien custodiado que esté, ha sobrevivido intacto a una de sus visitas nocturnas.', 'legendario', true, { hp: 1580, atk: 180, def: 280, agi: 90, wis: 40 });
addBoss('jerseydevil', 'viento', 'brujo', 'debilitar', 'El Jersey Devil', 'Nadie que ha escuchado su chillido en mitad del bosque ha vuelto a dormir tranquilo.', 'legendario', true, { hp: 550, atk: 138, def: 125, agi: 135, wis: 110 });

const ZONES = [
  { id: 'bosque', name: 'Linde del Bosque', emoji: '🌲', color: '#2f4f2f', pool: ['goblin_comun', 'arana_comun', 'boss_guardianbosque'] },
  { id: 'pantano', name: 'Pantano Oscuro', emoji: '🐊', color: '#3a4a2f', pool: ['sapo_infrecuente', 'babosa_infrecuente', 'boss_brujapantano'] },
  { id: 'cuevas', name: 'Cuevas de Cristal', emoji: '💎', color: '#2f3a4a', pool: ['gargola_infrecuente', 'insectogigante_raro', 'boss_colosocristal'] },
  { id: 'picos', name: 'Picos Helados', emoji: '❄️', color: '#2f4650', pool: ['zombi_raro', 'draugr_infrecuente', 'boss_titanhielo'] },
  { id: 'ruinas', name: 'Ruinas Abisales', emoji: '💀', color: '#3a2f45', pool: ['momia_raro', 'banshee_raro', 'boss_reyruinas'] },
  { id: 'guarida', name: 'Guarida del Dragón', emoji: '🐉', color: '#4a2f2f', pool: ['troll_epico', 'demonio_epico', 'boss_dragonguarida'] },

  // --- Zonas nuevas: usan el roster masivo (14.1/14.3) como relleno y los
  // 27 jefes (14.2, antes creados pero sin usar en ningún mapa) como jefe de
  // zona. pool[0]/pool[1] son el relleno de cada oleada normal, pool[2] es
  // siempre el jefe único de la etapa 8. La rareza del relleno sube por
  // tramos según se avanza (Raro -> Épico -> Épico/Legendario) para
  // acompañar el escalado por nivel, igual que hacían las 6 zonas originales.
  { id: 'cantera', name: 'Cantera Devorada', emoji: '🪨', color: '#4a3f2f', pool: ['esqueleto_raro', 'jabali_raro', 'boss_garn'] },
  { id: 'aldea_nian', name: 'Aldea del Año Nuevo', emoji: '🧨', color: '#4a2f2f', pool: ['chupacabra_raro', 'orco_raro', 'boss_nian'] },
  { id: 'jardin_piedra', name: 'Jardín de Piedra', emoji: '🗿', color: '#3a3a2f', pool: ['serpiente_raro', 'setahumanoide_raro', 'boss_medusa'] },
  { id: 'salon_juicio', name: 'Salón del Juicio', emoji: '⚖️', color: '#3a2f24', pool: ['hombrearena_raro', 'estirge_raro', 'boss_ammit'] },
  { id: 'sabana', name: 'Sabana Ardiente', emoji: '🦁', color: '#4a3f1f', pool: ['satirosalvaje_raro', 'ogro_raro', 'boss_leondenemea'] },
  { id: 'desfiladero_roc', name: 'Desfiladero del Roc', emoji: '🏔️', color: '#3f4a4a', pool: ['arpia_raro', 'tengu_raro', 'boss_pajaroroc'] },
  { id: 'laberinto_creta', name: 'Laberinto de Creta', emoji: '🐂', color: '#4a3a2f', pool: ['trasgo_raro', 'goblin_raro', 'boss_torodecreta'] },
  { id: 'cripta_serpentina', name: 'Cripta Serpentina', emoji: '🐍', color: '#2f3a2f', pool: ['kitsune_epico', 'ondina_epico', 'boss_basilisco'] },
  { id: 'paso_gigantes', name: 'Paso de los Gigantes', emoji: '⛰️', color: '#3f3f4a', pool: ['gigante_epico', 'troll_epico', 'boss_ettin'] },
  { id: 'templo_hermanas', name: 'Templo de las Hermanas', emoji: '🐍', color: '#3a2f3f', pool: ['dullahan_epico', 'dementor_epico', 'boss_gorgonas'] },
  { id: 'desierto_espinas', name: 'Desierto de Espinas', emoji: '🦂', color: '#4a3a1f', pool: ['hombreseisbrazos_epico', 'frankenstein_epico', 'boss_manticora'] },
  { id: 'circo_maldito', name: 'Circo Maldito', emoji: '🃏', color: '#3a1f3a', pool: ['banshee_epico', 'lamia_epico', 'boss_joker'] },
  { id: 'nido_colosal', name: 'Nido Colosal', emoji: '🕷️', color: '#2f2a24', pool: ['gargola_epico', 'demonio_epico', 'boss_acromantula'] },
  { id: 'tundra_helada', name: 'Tundra Helada', emoji: '🥶', color: '#2f4550', pool: ['draugr_epico', 'ondina_epico', 'boss_wendigo'] },
  { id: 'jungla_silenciosa', name: 'Jungla Silenciosa', emoji: '🌿', color: '#2f4a2f', pool: ['lamia_epico', 'frankenstein_epico', 'boss_mantisreligiosa'] },
  { id: 'abismo_ojos', name: 'Abismo de los Cien Ojos', emoji: '👁️', color: '#1f2a3a', pool: ['troll_epico', 'gigante_epico', 'boss_magooscuro'] },
  { id: 'cima_quimerica', name: 'Cima Quimérica', emoji: '🔥', color: '#4a2a1f', pool: ['dullahan_epico', 'hombreseisbrazos_epico', 'boss_quimera'] },
  { id: 'caos_primordial', name: 'Caos Primordial', emoji: '🌊', color: '#1f3a4a', pool: ['kitsune_epico', 'banshee_epico', 'boss_tiamat'] },
  { id: 'forja_fin', name: 'Forja del Fin del Mundo', emoji: '⚒️', color: '#4a2414', pool: ['demonio_epico', 'gargola_epico', 'boss_surtr'] },
  { id: 'llanura_titan', name: 'Llanura del Titán', emoji: '🦣', color: '#3a3424', pool: ['gigante_epico', 'troll_epico', 'boss_behemoth'] },
  { id: 'templo_eclipse', name: 'Templo del Sol Eclipsado', emoji: '🌑', color: '#241f3a', pool: ['dementor_epico', 'ondina_epico', 'boss_apofis'] },
  { id: 'fosa_rlyeh', name: "Fosa de R'lyeh", emoji: '🐙', color: '#1f2a2a', pool: ['lamia_epico', 'kitsune_epico', 'boss_cthulhu'] },
  { id: 'minas_sinfondo', name: 'Minas Sin Fondo', emoji: '⛏️', color: '#3a1414', pool: ['demonio_epico', 'frankenstein_epico', 'boss_loki'] },
  { id: 'palacio_espejos', name: 'Palacio de Espejos', emoji: '🪞', color: '#3a2a4a', pool: ['dullahan_epico', 'hombreseisbrazos_epico', 'boss_rakshasa'] },
  { id: 'necropolis', name: 'Necrópolis Eterna', emoji: '💀', color: '#242424', pool: ['draugr_epico', 'banshee_epico', 'boss_liche'] },

  // --- 11 zonas nuevas de "segunda vuelta" (contenido tras completar el
  // mapa original), una por cada jefe nuevo — ver el comentario junto a
  // los addBoss correspondientes más arriba. IMPORTANTE (arreglado tras
  // un aviso del usuario, que las vio salir ANTES de Torre Prohibida/
  // Salón de los Engaños en el Mapa): van ANTES de esas dos, no después
  // — Tifón y Balrog siguen siendo a propósito los dos últimos jefes del
  // mapa entero (ver el comentario de más arriba, "el final del juego"),
  // así que estas 11 son el tramo previo a esa recta final, no un
  // añadido detrás. Ordenadas de más floja a más fuerte por poder nativo
  // (fighterPowerScore(fixedStats), el mismo criterio que el ranking de
  // jefes) para que la dificultad siga escalando sin saltos: Jersey
  // Devil(550) < Grendel(999) < Anzu(1200) < Simbionte(1220) <
  // Fafnir(1274) < Set(1470) < Hel(1560) < Hades(1620) <
  // Jörmungandr(1900) < Kaiju(1980) < Titán Colosal(2050) — y solo
  // entonces Balrog(2210)/Tifón(2290), la pareja que cierra el mapa.
  { id: 'bosque_jerseydevil', name: 'Bosque de los Pinos Malditos', emoji: '🦇', color: '#1a2a1a', pool: ['dullahan_epico', 'lamia_epico', 'boss_jerseydevil'] },
  { id: 'salon_grendel', name: 'Salón de los Huesos', emoji: '🦴', color: '#2a241a', pool: ['draugr_epico', 'banshee_epico', 'boss_grendel'] },
  { id: 'nido_anzu', name: 'Nido de la Tempestad', emoji: '🌩️', color: '#24304a', pool: ['kitsune_epico', 'dementor_epico', 'boss_anzu'] },
  { id: 'crater_simbionte', name: 'Cráter del Impacto', emoji: '☄️', color: '#2a1424', pool: ['frankenstein_epico', 'hombreseisbrazos_epico', 'boss_simbionte'] },
  { id: 'guarida_fafnir', name: 'Guarida de la Avaricia', emoji: '🐲', color: '#3a2a14', pool: ['troll_epico', 'gigante_epico', 'boss_fafnir'] },
  { id: 'tormenta_set', name: 'Tormenta Roja del Desierto', emoji: '🌪️', color: '#3a2414', pool: ['demonio_epico', 'gargola_epico', 'boss_set'] },
  { id: 'reino_hel', name: 'Reino de Hel', emoji: '⚰️', color: '#2a2434', pool: ['banshee_epico', 'dullahan_epico', 'boss_hel'] },
  { id: 'inframundo_hades', name: 'Inframundo de las Sombras Eternas', emoji: '💀', color: '#241f2a', pool: ['dementor_epico', 'draugr_epico', 'boss_hades'] },
  { id: 'oceano_jormungandr', name: 'Océano sin Fondo', emoji: '🌊', color: '#1a2f3a', pool: ['ondina_epico', 'lamia_epico', 'boss_jormungandr'] },
  { id: 'costa_kaiju', name: 'Costa Devastada', emoji: '🦑', color: '#142a3a', pool: ['ondina_epico', 'demonio_epico', 'boss_kaiju'] },
  { id: 'murallas_titan', name: 'Murallas Caídas', emoji: '🏛️', color: '#3a3424', pool: ['gigante_epico', 'troll_epico', 'boss_titancolosal'] },

  // Tifón y Balrog: los dos últimos jefes del mapa ENTERO, a propósito
  // (ver el comentario junto a addBoss más arriba) — quedan siempre al
  // final del array, después de cualquier zona que se añada en el
  // futuro, salvo que se decida expresamente lo contrario.
  { id: 'torre_prohibida', name: 'Torre Prohibida', emoji: '🏰', color: '#2a1f3a', pool: ['gargola_epico', 'dementor_epico', 'boss_balrog'] },
  { id: 'salon_enganos', name: 'Salón de los Engaños', emoji: '🎭', color: '#3a2424', pool: ['troll_epico', 'gigante_epico', 'boss_tifon'] },
];
const STAGE_ENERGY_COST = 6;

// Pixite (el cristal barato y abundante, ver stageRewards en combat.js)
// ya NO da Legendario en absoluto (antes 0.5%) y da bastante menos Épico/
// Raro/Infrecuente (a petición del usuario, para diferenciar mejor a los 3
// cristales por rol: Pixite es "combustible" de Común/Infrecuente para
// fusionar hacia arriba, Voxite cubre el tramo medio Raro/Épico, Doxite es
// el único camino realista a un Épico/Legendario por tirada directa en vez
// de por fusión). El camino a Legendario sigue existiendo vía Doxite (y en
// menor medida Voxite) y vía fusión ascendiendo desde una semilla Raro
// conseguida con cualquier cristal — ver TODO.md para los números
// verificados de cuánto tarda cada camino con esta tasa.
const CRYSTALS = {
  pixite: { label: 'Cristal Pixite', color: '#a8815a', icon: '🟤', rates: { comun: 0.70, infrecuente: 0.23, raro: 0.06, epico: 0.01, legendario: 0 } },
  voxite: { label: 'Cristal Voxite', color: '#c9c9d9', icon: '⚪', rates: { comun: 0.10, infrecuente: 0.30, raro: 0.40, epico: 0.17, legendario: 0.03 } },
  doxite: { label: 'Cristal Doxite', color: '#e8c23c', icon: '🟡', rates: { comun: 0, infrecuente: 0.05, raro: 0.30, epico: 0.45, legendario: 0.20 } },
};
// Probabilidad de que una invocación "toque" un Homúnculo en vez de un
// luchador — el tier del homúnculo sale de la misma tirada de rareza que ya
// se hace para elegir luchador, así que un cristal que da más rarezas altas
// también da homúnculos de mejor tier de media.
const HOMUNCULO_SUMMON_CHANCE = 0.12;

// 6 huecos de equipo, y dentro de cada hueco varios TIPOS distintos (p.ej.
// espada/hacha/lanza en el hueco de Arma) — no todo escala igual por rareza,
// cada tipo tiene su propio reparto de estadística principal/secundaria y su
// propia progresión de nombres, para que elegir equipo sea una decisión de
// qué build quieres, no solo de qué rareza te ha tocado.
// gearStatValue(gear) da el valor "base" de la pieza según rareza+nivel;
// primaryMult/secondaryMult (del TIPO, no del hueco) lo reparten entre las
// dos stats que toca esa pieza (ver fighterStats en state.js).
const GEAR_SLOTS = {
  arma: {
    label: 'Arma', icon: '🗡️',
    types: {
      espada: { label: 'Espada', icon: '🗡️', primary: 'atk', primaryMult: 1, secondary: 'wis', secondaryMult: 0.4,
        names: { comun: 'Daga Roma', infrecuente: 'Espada Templada', raro: 'Hoja Rúnica', epico: 'Filo Encantado', legendario: 'Colmillo Ancestral' } },
      hacha: { label: 'Hacha', icon: '🪓', primary: 'atk', primaryMult: 1.2, secondary: 'hp', secondaryMult: 1.0,
        names: { comun: 'Hacha Desgastada', infrecuente: 'Hacha de Guerra', raro: 'Hacha Rúnica', epico: 'Hacha Encantada', legendario: 'Hacha del Titán' } },
      lanza: { label: 'Lanza', icon: '🔱', primary: 'atk', primaryMult: 0.85, secondary: 'agi', secondaryMult: 0.7,
        names: { comun: 'Lanza de Madera', infrecuente: 'Lanza Templada', raro: 'Lanza Rúnica', epico: 'Lanza Encantada', legendario: 'Lanza del Cazador' } },
    },
  },
  armadura: {
    label: 'Armadura', icon: '🥋',
    types: {
      cota: { label: 'Cota', icon: '🥋', primary: 'def', primaryMult: 1, secondary: 'hp', secondaryMult: 2.4,
        names: { comun: 'Cota Sencilla', infrecuente: 'Cota Reforzada', raro: 'Placas Rúnicas', epico: 'Coraza Encantada', legendario: 'Coraza Ancestral' } },
      placas: { label: 'Placas Pesadas', icon: '🛡️', primary: 'def', primaryMult: 1.3, secondary: 'atk', secondaryMult: 0.3,
        names: { comun: 'Placas de Hierro', infrecuente: 'Placas Reforzadas', raro: 'Placas de Guerra', epico: 'Placas Encantadas', legendario: 'Placas del Coloso' } },
      tunica: { label: 'Túnica', icon: '🧥', primary: 'def', primaryMult: 0.7, secondary: 'wis', secondaryMult: 0.9,
        names: { comun: 'Túnica Sencilla', infrecuente: 'Túnica Tejida', raro: 'Túnica Rúnica', epico: 'Túnica Encantada', legendario: 'Túnica Ancestral' } },
    },
  },
  casco: {
    label: 'Casco', icon: '⛑️',
    types: {
      yelmo: { label: 'Yelmo', icon: '⛑️', primary: 'def', primaryMult: 0.6, secondary: 'wis', secondaryMult: 0.6,
        names: { comun: 'Yelmo Sencillo', infrecuente: 'Yelmo Reforzado', raro: 'Casco Rúnico', epico: 'Corona Encantada', legendario: 'Corona Ancestral' } },
      capucha: { label: 'Capucha', icon: '🥷', primary: 'def', primaryMult: 0.4, secondary: 'agi', secondaryMult: 0.7,
        names: { comun: 'Capucha Sencilla', infrecuente: 'Capucha Reforzada', raro: 'Capucha Rúnica', epico: 'Capucha Encantada', legendario: 'Capucha de las Sombras' } },
      diadema: { label: 'Diadema', icon: '👑', primary: 'wis', primaryMult: 0.7, secondary: 'def', secondaryMult: 0.4,
        names: { comun: 'Diadema Sencilla', infrecuente: 'Diadema Tallada', raro: 'Diadema Rúnica', epico: 'Diadema Encantada', legendario: 'Diadema Ancestral' } },
    },
  },
  guantes: {
    label: 'Guantes', icon: '🧤',
    types: {
      guantes: { label: 'Guantes', icon: '🧤', primary: 'atk', primaryMult: 0.6, secondary: 'agi', secondaryMult: 0.5,
        names: { comun: 'Guantes de Cuero', infrecuente: 'Guantes Reforzados', raro: 'Guanteletes Rúnicos', epico: 'Guanteletes Encantados', legendario: 'Guanteletes Ancestrales' } },
      garras: { label: 'Garras', icon: '🐾', primary: 'atk', primaryMult: 0.5, secondary: 'agi', secondaryMult: 0.8,
        names: { comun: 'Garras Rotas', infrecuente: 'Garras Afiladas', raro: 'Garras Rúnicas', epico: 'Garras Encantadas', legendario: 'Garras del Depredador' } },
      manoplas: { label: 'Manoplas', icon: '👊', primary: 'atk', primaryMult: 0.8, secondary: 'hp', secondaryMult: 0.6,
        names: { comun: 'Manoplas de Hierro', infrecuente: 'Manoplas Reforzadas', raro: 'Manoplas Rúnicas', epico: 'Manoplas Encantadas', legendario: 'Manoplas del Titán' } },
    },
  },
  botas: {
    label: 'Botas', icon: '👢',
    types: {
      botas: { label: 'Botas', icon: '👢', primary: 'agi', primaryMult: 1, secondary: 'hp', secondaryMult: 1.2,
        names: { comun: 'Botas Sencillas', infrecuente: 'Botas de Marcha', raro: 'Botas Rúnicas', epico: 'Botas Encantadas', legendario: 'Botas Ancestrales' } },
      sandalias: { label: 'Sandalias Aladas', icon: '🪽', primary: 'agi', primaryMult: 1.3, secondary: 'wis', secondaryMult: 0.4,
        names: { comun: 'Sandalias Sencillas', infrecuente: 'Sandalias Ligeras', raro: 'Sandalias Rúnicas', epico: 'Sandalias Encantadas', legendario: 'Sandalias Aladas Ancestrales' } },
      grebas: { label: 'Grebas', icon: '🦿', primary: 'agi', primaryMult: 0.7, secondary: 'def', secondaryMult: 0.6,
        names: { comun: 'Grebas Sencillas', infrecuente: 'Grebas Reforzadas', raro: 'Grebas Rúnicas', epico: 'Grebas Encantadas', legendario: 'Grebas Ancestrales' } },
    },
  },
  amuleto: {
    label: 'Amuleto', icon: '📿',
    types: {
      amuleto: { label: 'Amuleto', icon: '📿', primary: 'wis', primaryMult: 1, secondary: 'atk', secondaryMult: 0.3,
        names: { comun: 'Amuleto Sencillo', infrecuente: 'Amuleto Tallado', raro: 'Amuleto Rúnico', epico: 'Amuleto Encantado', legendario: 'Talismán Ancestral' } },
      anillo: { label: 'Anillo', icon: '💍', primary: 'wis', primaryMult: 0.6, secondary: 'agi', secondaryMult: 0.6,
        names: { comun: 'Anillo Sencillo', infrecuente: 'Anillo Tallado', raro: 'Anillo Rúnico', epico: 'Anillo Encantado', legendario: 'Anillo Ancestral' } },
      reliquia: { label: 'Reliquia', icon: '🏺', primary: 'wis', primaryMult: 0.7, secondary: 'hp', secondaryMult: 1.0,
        names: { comun: 'Reliquia Sencilla', infrecuente: 'Reliquia Tallada', raro: 'Reliquia Rúnica', epico: 'Reliquia Encantada', legendario: 'Reliquia Ancestral' } },
    },
  },
};
const GEAR_SLOT_IDS = Object.keys(GEAR_SLOTS);
function randomGearSlot() { return GEAR_SLOT_IDS[Math.floor(Math.random() * GEAR_SLOT_IDS.length)]; }
function gearTypeIds(slot) { return Object.keys(GEAR_SLOTS[slot].types); }
function randomGearType(slot) { const ids = gearTypeIds(slot); return ids[Math.floor(Math.random() * ids.length)]; }
// El primer tipo declarado en cada hueco reutiliza el mismo reparto de stats
// y nombres que tenía el hueco antes de existir los tipos, así que una pieza
// guardada de antes de esta actualización (sin campo `type`) cae aquí y no
// cambia de golpe sus estadísticas.
function gearTypeInfo(gear) {
  const slot = GEAR_SLOTS[gear.slot];
  return slot.types[gear.type] || slot.types[gearTypeIds(gear.slot)[0]];
}

// --- Tienda: equipo nuevo (nivel 0) por Texel, y objetos consumibles ---
const GEAR_SHOP_PRICES = { comun: 60, infrecuente: 150, raro: 350, epico: 800, legendario: 2000 };

const CONSUMABLES = {
  pocion_menor: { label: 'Poción Menor', icon: '🧪', desc: 'Cura al 40% de su vida máxima a toda la banda.', healPct: 0.4, price: 40, currency: 'texel' },
  pocion_mayor: { label: 'Poción Mayor', icon: '⚗️', desc: 'Cura al 100% de su vida máxima a toda la banda.', healPct: 1.0, price: 120, currency: 'texel' },
  // altPrice/altCurrency (petición explícita del usuario: "la pluma fenix
  // se tiene que poder comprar con monedas también, por un precio muy
  // elevado, más que el equivalente en diamantes"): además de su precio
  // normal en Gemas, se puede comprar con Texel — pensado como recurso de
  // emergencia caro para quien se quede sin Gemas, nunca como forma barata
  // de esquivarlas. 5000 Texel se queda MUY por encima de lo que costarían
  // 12 Gemas compradas con Texel al mejor precio posible (ver
  // GEMAS_TEXEL_OFFERS: el lote de 10 sale a 60 Texel/Gema, así que 12
  // Gemas rondarían los 720) — así la ruta directa en Texel nunca es más
  // barata que convertir y comprar con Gemas, solo más cómoda en un apuro.
  pluma_fenix: { label: 'Pluma Fénix', icon: '🪶', desc: 'Revive a un luchador caído con el 50% de su vida.', revivePct: 0.5, price: 12, currency: 'gemas', altPrice: 5000, altCurrency: 'texel' },
};

// Comprar Gemas con Texel: caro a propósito (Texel es abundante, Gemas
// escasas — no debe ser una forma barata de saltarse esa escasez), pero
// siempre disponible, para que quedarse sin Gemas y sin cristales nunca
// bloquee del todo poder seguir invocando. Precio por Gema baja un poco en
// los lotes grandes (igual que cualquier tienda con descuento por volumen).
const GEMAS_TEXEL_OFFERS = [
  { amount: 10, price: 600 },
  { amount: 50, price: 2500 },
  { amount: 200, price: 8000 },
];

const MAX_ENERGY = 60;
const ENERGY_REGEN_SECONDS = 45; // 1 punto cada 45s
const BAND_ROWS = 3;
const BAND_COLS = 3;

// Las 8 líneas de 3 en raya posibles sobre la Formación 3×3 (filas, columnas
// y diagonales). El jugador elige cuáles 3 de estas 8 son sus "combinaciones"
// activas de combate — no tienen por qué ser siempre las 3 filas.
const BAND_LINES = [
  { id: 'fila1', label: 'Fila 1', cells: [[0, 0], [0, 1], [0, 2]] },
  { id: 'fila2', label: 'Fila 2', cells: [[1, 0], [1, 1], [1, 2]] },
  { id: 'fila3', label: 'Fila 3', cells: [[2, 0], [2, 1], [2, 2]] },
  { id: 'col1', label: 'Columna 1', cells: [[0, 0], [1, 0], [2, 0]] },
  { id: 'col2', label: 'Columna 2', cells: [[0, 1], [1, 1], [2, 1]] },
  { id: 'col3', label: 'Columna 3', cells: [[0, 2], [1, 2], [2, 2]] },
  { id: 'diag1', label: 'Diagonal ↘', cells: [[0, 0], [1, 1], [2, 2]] },
  { id: 'diag2', label: 'Diagonal ↙', cells: [[0, 2], [1, 1], [2, 0]] },
];
function bandLineInfo(id) { return BAND_LINES.find(l => l.id === id) || BAND_LINES[0]; }
const XP_LEVEL_CAP = 40;
// Coste de subir de nivel — el ÚNICO sitio del que cuelga toda la XP del
// juego (etapas, jefes, Torre, Mazmorra Elemental, Arena...). Fórmula
// original sin tocar — el ajuste de ritmo de nivel ya no vive aquí (se
// intentó primero bajando este coste, ver historial en TODO.md) sino en
// zoneEnemyLevel() de abajo: el nivel del rival ahora depende SOLO de la
// zona, no de cuántas etapas tenga por dentro (ver STAGES_PER_ZONE), así
// que las recompensas de XP (ver stageRewards en combat.js) son las que se
// calibran para que el ritmo NATURAL de un jugador (sin grindear) siga de
// cerca esta misma curva zona a zona.
function fighterXpToNext(level) { return Math.floor(20 * Math.pow(level, 1.5)); }

// Nº de etapas por zona — 8 originalmente, subido a 15 y luego a 33 (32 de
// mobs + 1 jefe) para que cada tirada de cristales se sintiera pequeña de
// verdad (ver historial completo en TODO.md). Bajado ahora a 25 (24 de
// mobs + 1 jefe), a petición explícita del usuario: con 32 etapas de solo
// 2-3 oleadas cada una, demasiadas se superaban sin la más mínima
// oposición — su propuesta fue MENOS etapas pero cada una con MÁS
// oleadas seguidas SIN curación entre medias (ver rowCount en
// buildEnemyBand, combat.js: ahora 3/4/5 oleadas según el tramo de la
// zona, antes 2/3), para que el desgaste acumulado suba la dificultad de
// verdad sin tocar ni un stat de los rivales. El total de oleadas por
// zona apenas cambia (90 ahora, 85 antes) — la dificultad sube por
// estructura (menos "reinicios" de vida a base de curarse entre etapas),
// no por inflar números. Recompensas de zona (texel/XP/Pixite,
// stageRewards en combat.js) siguen siendo un TOTAL por zona repartido
// entre las etapas de mobs que haya — automáticamente más grandes por
// etapa al haber menos, sin que el total de la zona cambie; las
// probabilidades de Voxite/Doxite/equipo por etapa (antes fijas) pasaron
// a derivarse igual (un total esperado por zona, dividido entre
// MOB_STAGES_PER_ZONE) para que el total esperado por zona tampoco
// cambie, solo llegue en menos tiradas más gordas. IMPORTANTE: el nivel
// del rival (zoneEnemyLevel, justo abajo) se sigue calculando a partir de
// zoneIdx, NUNCA de STAGES_PER_ZONE — este cambio no toca la escalada de
// nivel para nada. El mapa entero pasa de 1.089 a 825 etapas.
const STAGES_PER_ZONE = 25;

// El nivel del rival ya NO depende de STAGES_PER_ZONE ni de la etapa
// dentro de la zona (todas las etapas de una misma zona pelean al MISMO
// nivel; lo que cambia según se avanza dentro de la zona es la cantidad de
// rivales por oleada, ver buildEnemyBand en combat.js) — depende solo de
// zoneIdx, con una subida deliberadamente MUY gradual: nivel tope 40 no se
// alcanza hasta la zona 28 (de 33), dejando solo las últimas zonas ya a
// tope. Motivo (pedido explícito del usuario, con la vieja fórmula —nivel
// tope en la zona 4, sea cual sea STAGES_PER_ZONE— ya se había demostrado
// dos veces que se necesitaba parchear la XP del jugador para no perderla
// de vista, ver TODO.md): con una escalada tan lenta, un personaje recién
// invocado con suerte no se queda tan descolgado del nivel de la banda
// actual como para no poder meterlo directamente a pelear.
const LEVEL_CAP_ZONE_IDX = 28;
function zoneEnemyLevel(zoneIdx) {
  return Math.min(XP_LEVEL_CAP, 1 + Math.round(zoneIdx * (XP_LEVEL_CAP - 1) / LEVEL_CAP_ZONE_IDX));
}

// Los jefes de zona pelean con estadísticas FIJAS escritas a mano por zona
// (def.fixedStats, ver addBoss) — a diferencia de los mobs del camino, NO
// dependen de zoneEnemyLevel para nada, así que al ralentizar la curva de
// nivel (antes tope en zona 4, ahora zona 28) se quedaron calibrados para
// un jugador que ya no existe: uno que en la zona 4 sería nivel 33 (ritmo
// ANTIGUO, 8 etapas por zona, 1+zona×8+7) en vez del nivel 9 real de ahora
// — verificado en combate, los jefes de las primeras ~12 zonas se perdían
// el 100% de las veces con una banda a ritmo natural, mientras que las
// oleadas de mobs de esas mismas zonas se ganaban sin problema (los mobs
// SÍ escalan con zoneEnemyLevel, por eso no les afectaba). Este factor
// reescala fixedStats a la potencia que tendría un jugador a ritmo natural
// bajo la curva NUEVA en vez de la antigua, multiplicando el propio
// multiplicador adaptativo del jefe (bossAdaptiveMult, state.js) — así se
// corrige el desfase sin tocar ninguno de los ~33 jefes a mano, y
// converge a ×1 (sin cambio) en las últimas zonas, donde ambas curvas ya
// tocan el mismo tope de nivel 40.
function bossLevelCorrectionMult(zoneIdx) {
  const oldLevel = Math.min(XP_LEVEL_CAP, 1 + zoneIdx * 8 + 7);
  return levelGrowth(zoneEnemyLevel(zoneIdx)) / levelGrowth(oldLevel);
}

// Refuerzo de dificultad temprana/media (pedido explícito del usuario tras
// jugar en serio hasta la Aldea del Año Nuevo sin recibir NUNCA una baja ni
// daño real, ni de mobs ni del jefe, con una banda "natural" que ya iba
// sobrada de Épicos/Legendarios por Fusión pese a llevar solo 7 zonas —
// ver TODO.md para la simulación completa) — se desvanece a 1× según
// bossLevelCorrectionMult(zoneIdx) se acerca a 1, es decir, según la zona
// se acerca a donde la curva de nivel NUEVA ya alcanza a la ANTIGUA
// (zona ~28 en adelante). Con baseline≈1 (zonas tardías, YA calibradas a
// fondo con una banda TODO Legendario 3★ máx. equipo — ver el comentario
// de bossAdaptiveMult en state.js, especialmente Salón de los Engaños) da
// exactamente 1×, sin tocar ni un poco ese ajuste ya validado; con
// baseline bajo (zonas tempranas, mucho margen antes de ese techo) da
// hasta maxBoost×. Compartido por bossAdaptiveMult y mobAdaptiveMult
// (state.js) para que ambos se refuercen con el mismo criterio.
function earlyGameBoostMult(baseline, maxBoost) {
  return 1 + (maxBoost - 1) * (1 - baseline);
}

// Más allá de LEVEL_CAP_ZONE_IDX el nivel del rival ya no sube — pero con
// el tope ahora tan cerca del final del mapa (zona 28 de 33) apenas quedan
// zonas donde esto entre en juego (antes, con el tope en zona 4, eran 28
// de 33 zonas — el 85% del mapa — las que dependían de esto; ahora son
// solo las últimas ~5, un colofón final en vez del motor principal de
// dificultad tardía). Se mantiene igual para esas últimas zonas y para
// Torre Batalla (donde SÍ hace falta un margen de dificultad más allá del
// nivel tope, al ser contenido pensado para jugarse tras terminar el mapa
// entero).
const LATE_ZONE_GROWTH_RATE = 0.35;
function lateZoneMult(zoneIdx) {
  const zonesPastCap = Math.max(0, zoneIdx - LEVEL_CAP_ZONE_IDX);
  return zonesPastCap === 0 ? 1 : 1 + Math.sqrt(zonesPastCap) * LATE_ZONE_GROWTH_RATE;
}

// ---------- Torre Batalla ----------
// Modo endgame: se desbloquea al completar el mapa entero (ver
// mapFullyCleared en state.js), o antes con el ajuste de prueba de
// Ajustes. Una única escalera de 66 niveles: primero un nivel por cada
// una de las 33 familias de MOBS (del más sencillo al más difícil según
// en qué zona aparecen por primera vez), después un nivel por cada uno de
// los 33 BOSSES (mismo criterio) — el último es el jefe de la última zona
// del mapa, como pidió el usuario. Cada nivel enfrenta SIEMPRE al mismo
// rival repetido varias veces: la forma MÁS FUERTE de la familia de mob
// (un reto real), o el jefe en sí (que no tiene tiers). Ganar da SIEMPRE 1
// copia del tier MÁS BAJO de esa familia (o del propio jefe) — así el
// jugador la sube él mismo por el camino normal de Fusión/Evolución en
// vez de recibirla ya hecha; los niveles son rejugables para conseguir
// más copias (útil como material de Fusión/Superfusión).
function buildTorreLevels() {
  const mobFamilies = {};
  MOBS.forEach(m => { (mobFamilies[m.family] = mobFamilies[m.family] || []).push(m); });
  // Zona de origen = la primera (más temprana) cuyo pool de relleno incluye
  // alguna de las 3 formas de esa familia — así la escalera sigue el mismo
  // orden de dificultad que ya tiene calibrado el propio mapa.
  const originZoneForDefIds = (defIds) => {
    let best = ZONES.length - 1;
    ZONES.forEach((z, zi) => { if (defIds.includes(z.pool[0]) || defIds.includes(z.pool[1])) best = Math.min(best, zi); });
    return best;
  };
  const mobLevels = Object.keys(mobFamilies).map(family => {
    const forms = mobFamilies[family].slice().sort((a, b) => rarityIndex(a.rarity) - rarityIndex(b.rarity));
    return {
      kind: 'mob', family, key: 'mob_' + family,
      fightDefId: forms[forms.length - 1].id, rewardDefId: forms[0].id,
      originZoneIdx: originZoneForDefIds(forms.map(f => f.id)),
    };
  }).sort((a, b) => a.originZoneIdx - b.originZoneIdx || a.family.localeCompare(b.family));

  const bossLevels = BOSSES.map(b => {
    const zi = ZONES.findIndex(z => z.pool[2] === b.id);
    return { kind: 'boss', family: b.family, key: b.id, fightDefId: b.id, rewardDefId: b.id, originZoneIdx: zi < 0 ? ZONES.length - 1 : zi };
  }).sort((a, b) => a.originZoneIdx - b.originZoneIdx);

  [mobLevels, bossLevels].forEach(section => {
    section.forEach((level, sectionIdx) => {
      level.sectionIdx = sectionIdx;
      // Nivel del rival: SIEMPRE al tope (XP_LEVEL_CAP), sin escalar por
      // zona de origen — a diferencia del Mapa, la Torre es contenido de
      // final de partida (solo se desbloquea al completarlo entero, ver
      // torreUnlocked en state.js) al que se llega con la banda YA cerca
      // del nivel tope. Usar zoneEnemyLevel(originZoneIdx) aquí dejaba los
      // primeros niveles (familias de zonas tempranas) con un rival de
      // nivel bajísimo frente a una banda de nivel ~40 — la propia
      // levelGrowth (state.js) ya multiplica por ~5× entre nivel 1 y 40,
      // así que esa diferencia de nivel por sí sola volvía triviales esos
      // primeros niveles bastante antes de que el tier/nº de rivales
      // pesara nada. El reto real ya viene de fightDefId (siempre la forma
      // MÁS FUERTE de la familia) y de enemyCount (crece con sectionIdx,
      // más abajo) — no hace falta además escalar el nivel. A los jefes
      // (def.fixedStats) esto no les cambia ninguna estadística real (ver
      // buildUnitStats en combat.js, que ignora `level` cuando hay
      // fixedStats) — solo corrige el nivel NOMINAL mostrado en su ficha de
      // combate, que antes decía p.ej. "Nv. 3" para un jefe que en realidad
      // pelea con `torreBossMult`/fixedStats de endgame.
      level.enemyLevel = XP_LEVEL_CAP;
      // Nº de rivales: crece cada 8 niveles de su propia escalera. Los
      // mobs llegan en filas de hasta 3 simultáneos, como una oleada
      // normal; los jefes SIEMPRE en solitario, en oleadas sucesivas — un
      // jefe nunca debe recibir compañía (ver makeBossUnit en combat.js,
      // ya calibrado para pelear 1 contra hasta 3 sin ayuda).
      const tier = Math.floor(sectionIdx / 8);
      level.enemyCount = level.kind === 'mob' ? 3 * (tier + 1) : (tier + 1);
    });
  });

  const all = [...mobLevels, ...bossLevels];
  all.forEach((level, i) => { level.globalIdx = i; });
  return all;
}
const TORRE_LEVELS = buildTorreLevels();
function torreRewards(idx) {
  const level = TORRE_LEVELS[idx];
  const texel = Math.round((40 + level.globalIdx * 6) * (level.kind === 'boss' ? 2 : 1));
  const fighterXp = Math.round((25 + level.globalIdx * 5) * (level.kind === 'boss' ? 1.8 : 1));
  return { texel, fighterXp };
}

// Recompensa de REPETIR un nivel de JEFE de la Torre Batalla cuya carta ya
// se tiene (ver discoveredDefIds) — pedido explícito del usuario: "hay que
// revisar que en la torre batalla, no se pueda obtener más de una copia de
// un boss... si ya le has ganado y obtenido su carta, tienes muy buenos
// premios: mucha experiencia, dinero, gemas y 1 cristal (del tier más alto)
// garantizado (se va sumando... según se asciende)". Antes, replayear un
// nivel de jefe daba SIEMPRE otra copia (útil para Superfusión en los
// mobs, pero un jefe no tiene sentido acumularlo — es un antagonista
// único, no material de fusión) — ver UI.fightStageRunNode (ui.js), que ya
// no llama a applySummonResult si el jefe está en discoveredDefIds.
// Cristal Doxite (CRYSTALS en este archivo): el de mejor tier, con más
// probabilidad de Épico/Legendario al abrirlo — el garantizado de verdad
// que pide el usuario, no una probabilidad. Crece cada 8 escalones de la
// escalera de jefes (level.sectionIdx), el mismo ritmo que ya usa
// enemyCount en buildTorreLevels, así que el "también según se asciende"
// no es una constante aparte sino que seguir el mismo pulso ya establecido.
function torreRepeatBossRewards(level) {
  const base = torreRewards(level.globalIdx);
  return {
    texel: Math.round(base.texel * 2.5),
    fighterXp: Math.round(base.fighterXp * 2),
    gemas: 15 + level.sectionIdx * 3,
    doxite: 1 + Math.floor(level.sectionIdx / 8),
  };
}

// ---------- Tope de Tier ----------
// Reto de Retos (Fase 1, ver TODO.md): antes de empezar cada nivel, la
// Formación ENTERA (todos los huecos ocupados, los vacíos no cuentan) debe
// cumplir su `constraint` — así se fuerza a montar un equipo distinto al
// "meter siempre a los más fuertes" de cualquier otro modo. El rival de
// cada nivel se saca del MISMO filtro que el jugador (mismo tope de
// rareza/elemento/clase, ver buildTierCapEncounters en combat.js) — un
// combate "en igualdad de condiciones" dentro de esa restricción, no un
// muro artificial. Escalera fija y secuencial, como Torre Batalla (se
// desbloquea el siguiente al superar el anterior, rejugable después).
// Fase 2 pendiente (ver TODO.md): niveles que fuercen el uso de una
// familia/personaje concreto cada uno, para cubrir las ~112 familias
// jugables y que el 100% de este modo obligue a usar casi todo el roster.
const TIER_CAP_LEVELS = [
  { id: 'tc_comun', label: 'Solo Común', constraint: { rarityMax: 'comun' } },
  { id: 'tc_infrecuente', label: 'Hasta Infrecuente', constraint: { rarityMax: 'infrecuente' } },
  { id: 'tc_raro', label: 'Hasta Raro', constraint: { rarityMax: 'raro' } },
  { id: 'tc_epico', label: 'Hasta Épico', constraint: { rarityMax: 'epico' } },
  { id: 'tc_raro_fuego', label: 'Hasta Raro · Solo Fuego', constraint: { rarityMax: 'raro', element: 'fuego' } },
  { id: 'tc_raro_viento', label: 'Hasta Raro · Solo Viento', constraint: { rarityMax: 'raro', element: 'viento' } },
  { id: 'tc_raro_tierra', label: 'Hasta Raro · Solo Tierra', constraint: { rarityMax: 'raro', element: 'tierra' } },
  { id: 'tc_raro_rayo', label: 'Hasta Raro · Solo Rayo', constraint: { rarityMax: 'raro', element: 'rayo' } },
  { id: 'tc_raro_agua', label: 'Hasta Raro · Solo Agua', constraint: { rarityMax: 'raro', element: 'agua' } },
  { id: 'tc_epico_campeon', label: 'Hasta Épico · Solo Campeón', constraint: { rarityMax: 'epico', class: 'campeon' } },
  { id: 'tc_epico_picaro', label: 'Hasta Épico · Solo Pícaro', constraint: { rarityMax: 'epico', class: 'picaro' } },
  { id: 'tc_epico_guru', label: 'Hasta Épico · Solo Gurú', constraint: { rarityMax: 'epico', class: 'guru' } },
  { id: 'tc_epico_brujo', label: 'Hasta Épico · Solo Brujo', constraint: { rarityMax: 'epico', class: 'brujo' } },
  { id: 'tc_epico_explorador', label: 'Hasta Épico · Solo Explorador', constraint: { rarityMax: 'epico', class: 'explorador' } },
  { id: 'tc_final', label: 'El Filtro Final: Raro · Fuego · Campeón', constraint: { rarityMax: 'raro', element: 'fuego', class: 'campeon' } },

  // Ampliación (a petición del usuario) — mismo patrón que arriba pero un
  // escalón más duro: los 5 elementos ahora en Épico (antes solo hasta
  // Raro) y las 5 clases en Legendario (antes solo hasta Épico), más un
  // techo de rareza sin restricción de elemento/clase, y dos filtros
  // combinados nuevos con distinto elemento/clase que "El Filtro Final"
  // para que no sea el único combo de los tres ejes a la vez.
  { id: 'tc_legendario', label: 'Hasta Legendario', constraint: { rarityMax: 'legendario' } },
  { id: 'tc_epico_fuego', label: 'Hasta Épico · Solo Fuego', constraint: { rarityMax: 'epico', element: 'fuego' } },
  { id: 'tc_epico_viento', label: 'Hasta Épico · Solo Viento', constraint: { rarityMax: 'epico', element: 'viento' } },
  { id: 'tc_epico_tierra', label: 'Hasta Épico · Solo Tierra', constraint: { rarityMax: 'epico', element: 'tierra' } },
  { id: 'tc_epico_rayo', label: 'Hasta Épico · Solo Rayo', constraint: { rarityMax: 'epico', element: 'rayo' } },
  { id: 'tc_epico_agua', label: 'Hasta Épico · Solo Agua', constraint: { rarityMax: 'epico', element: 'agua' } },
  { id: 'tc_legendario_campeon', label: 'Hasta Legendario · Solo Campeón', constraint: { rarityMax: 'legendario', class: 'campeon' } },
  { id: 'tc_legendario_picaro', label: 'Hasta Legendario · Solo Pícaro', constraint: { rarityMax: 'legendario', class: 'picaro' } },
  { id: 'tc_legendario_guru', label: 'Hasta Legendario · Solo Gurú', constraint: { rarityMax: 'legendario', class: 'guru' } },
  { id: 'tc_legendario_brujo', label: 'Hasta Legendario · Solo Brujo', constraint: { rarityMax: 'legendario', class: 'brujo' } },
  { id: 'tc_legendario_explorador', label: 'Hasta Legendario · Solo Explorador', constraint: { rarityMax: 'legendario', class: 'explorador' } },
  { id: 'tc_final2', label: 'El Filtro Definitivo: Épico · Agua · Gurú', constraint: { rarityMax: 'epico', element: 'agua', class: 'guru' } },
  { id: 'tc_final3', label: 'El Filtro Absoluto: Legendario · Rayo · Pícaro', constraint: { rarityMax: 'legendario', element: 'rayo', class: 'picaro' } },
];
function tierCapConstraintLabel(c) {
  const parts = [rarityInfo(c.rarityMax).label + ' o menos'];
  if (c.element) parts.push(ELEMENT_INFO[c.element].icon + ' ' + ELEMENT_INFO[c.element].label);
  if (c.class) parts.push(CLASS_INFO[c.class].icon + ' ' + CLASS_INFO[c.class].label);
  return parts.join(' · ');
}
function tierCapRewards(idx) {
  return { texel: Math.round(50 + idx * 25), fighterXp: Math.round(30 + idx * 12) };
}

// ---------- Tope de Tier — Fase 2: Trials de Familia ----------
// Objetivo (ver TODO.md, diseño acordado con el usuario): un Trial ligero
// por cada una de las ~112 familias JUGABLES (FIGHTERS) — a diferencia de
// la Fase 1 (constraint genérica de rareza/elemento/clase, cualquier
// familia que encaje vale), aquí cada Trial exige tener FICHADA al menos
// 1 copia de ESA familia concreta en la Formación (ver
// formationHasFamily en state.js) para poder intentarlo — un combate de
// 1 SOLA oleada (no un recorrido completo), independiente y rejugable,
// sin desbloqueo secuencial entre ellos (a diferencia de la Fase 1, esto
// no es una escalera de poder). Así, completarlos todos obliga a haber
// conseguido y usado en combate prácticamente todo el roster invocable.
//
// FIGHTERS no tiene una "zona de origen" real como MOBS (no aparecen en
// ZONES.pool, se consiguen por invocación, no por avanzar el mapa), así
// que en vez de agrupar por zona (como buildTorreLevels) se agrupa por el
// TIER de cada familia — el equivalente real más cercano a una escalera
// de dificultad para el roster jugable: tier1 (techo Raro, 36 familias),
// tier2 (techo Épico, 45) y tier3 (techo Legendario, 31) — el mismo tier
// que ya decide qué tan buena puede llegar a ser cada familia en el resto
// del juego.
function buildFamilyTrials() {
  const families = {};
  FIGHTERS.forEach(f => { (families[f.family] = families[f.family] || []).push(f); });
  const TIER_BY_MAX_RARITY = { raro: 1, epico: 2, legendario: 3 };
  const trials = Object.keys(families).sort().map(family => {
    const forms = families[family].slice().sort((a, b) => rarityIndex(a.rarity) - rarityIndex(b.rarity));
    const maxForm = forms[forms.length - 1];
    return {
      id: 'trial_' + family, family,
      formIds: forms.map(f => f.id),
      displayDefId: maxForm.id, // arte/nombre de la forma más fuerte, como el resto de la Pokédex
      tier: TIER_BY_MAX_RARITY[maxForm.rarity] || 1,
      maxRarity: maxForm.rarity,
    };
  }).sort((a, b) => a.tier - b.tier || a.family.localeCompare(b.family));
  trials.forEach((t, i) => { t.globalIdx = i; });
  return trials;
}
const FAMILY_TRIALS = buildFamilyTrials();
// El rival se saca de la MISMA rareza tope de la familia puesta a prueba
// (maxRarity) — un "guardián" a su altura, ni un trámite ni un muro
// injusto — con más compañía cuanto más alto el tier (1/2/3 rivales).
function familyTrialRewards(trial) {
  return { texel: Math.round(40 + trial.globalIdx * 4), fighterXp: Math.round(25 + trial.globalIdx * 3) };
}

// ---------- Mazmorra Elemental ----------
// Reto opcional de equipo mono-elemento: se desbloquea al terminar las 6
// zonas originales del mapa (bosque..guarida, hasta desbloquear 'cantera',
// la 7ª) — antes de eso el roster invocado todavía no suele tener 3
// copias del mismo elemento para formar un equipo, y es demasiado pronto
// para el reto que supone (ver más abajo); mucho antes que Torre Batalla
// (que pide el mapa ENTERO), porque esto es contenido de mitad de
// partida, no de final. También se puede activar antes desde Ajustes con
// el ajuste de prueba (ver elementalDungeonUnlocked en state.js).
//
// Cada mazmorra de elemento X está poblada por el elemento que CONTRARRESTA
// a X en el círculo de ventajas (ELEMENT_INFO[...].beats) — un equipo de
// fuego se enfrenta a enemigos de agua, con la desventaja elemental de
// partida que eso conlleva (agua pega +25% a fuego, fuego pega -20% a
// agua): un reto real de sinergia de equipo, no un farm cómodo. 2 oleadas
// de relleno (la forma más fuerte de 2 familias distintas de MOBS de ese
// elemento) + un Guardián Elemental final (un BOSS de ese elemento, en
// solitario como cualquier jefe).
const ELEMENTAL_DUNGEON_ZONE_ID = 'cantera';
function findCounterElement(el) { return ELEMENT_ORDER.find(other => ELEMENT_INFO[other].beats === el); }
function buildElementalDungeons() {
  const dungeons = {};
  ELEMENT_ORDER.forEach(el => {
    const counter = findCounterElement(el);
    const mobFamilies = [...new Set(MOBS.filter(m => m.element === counter).map(m => m.family))].sort();
    const waveDefIds = mobFamilies.slice(0, 2).map(family => {
      const forms = MOBS.filter(m => m.family === family).sort((a, b) => rarityIndex(b.rarity) - rarityIndex(a.rarity));
      return forms[0].id; // la forma más fuerte de la familia
    });
    const bosses = BOSSES.filter(b => b.element === counter).sort((a, b) => a.id.localeCompare(b.id));
    dungeons[el] = { element: el, counterElement: counter, waveDefIds, guardianDefId: bosses[0].id };
  });
  return dungeons;
}
const ELEMENTAL_DUNGEONS = buildElementalDungeons();
function elementalDungeonLevel() {
  return zoneEnemyLevel(ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID));
}

// ---------- Arena: temporadas ----------
// El rango de Arena solo sube nunca (perder no baja) — una vez se llega al
// techo natural del jugador ya no queda ningún motivo para seguir jugando.
// Reset semanal determinista (sin servidor, misma idea que la oferta
// diaria del Mercader: se deriva de la fecha real, no de un temporizador
// en vivo — basta con comprobarlo cada vez que se abre la pantalla de
// Arena) — el rango cae a la MITAD de su pico en la temporada que acaba
// de terminar (no a 1: sería tirar todo el progreso, no un reset
// "parcial"), con una recompensa de Gemas por ese pico. bestRank (el
// récord de TODA la partida, del que dependen los logros arena_X de
// siempre) nunca se toca — solo baja el rango JUGABLE de la temporada
// nueva, para que siempre haya sitio al que volver a subir.
const ARENA_SEASON_EPOCH = Date.UTC(2024, 0, 1);
function arenaSeasonKey(date) {
  const days = Math.floor(((date || new Date()).getTime() - ARENA_SEASON_EPOCH) / 86400000);
  return Math.floor(days / 7);
}
function arenaSeasonDaysLeft(date) {
  const days = ((date || new Date()).getTime() - ARENA_SEASON_EPOCH) / 86400000;
  const daysIntoWeek = days - Math.floor(days / 7) * 7;
  return Math.max(1, Math.ceil(7 - daysIntoWeek));
}
const ARENA_SEASON_RESET_FRACTION = 0.5;
function arenaSeasonReward(peakRank) {
  return { gemas: Math.round(10 + peakRank * 3) };
}

// ---------- Arena: ligas con nombre ----------
// Rango de temporada convertido en un nombre reconocible (Bronce/Plata/.../
// Leyenda) en vez de solo un número — cada liga da además un multiplicador
// de recompensa creciente por victoria (rewardMult), y las de Plata en
// adelante tienen asignado un CAMPEÓN fijo (ver buildArenaChampionEncounter
// en combat.js): al llegar exactamente al rango de entrada de esa liga, en
// vez de un rival aleatorio más se explora un único Legendario fijo y
// siempre el mismo — un hito reconocible al cruzar cada liga.
const ARENA_LEAGUES = [
  { minRank: 1, id: 'bronce', label: 'Bronce', icon: '🥉', color: '#a8721f', rewardMult: 1.0 },
  { minRank: 5, id: 'plata', label: 'Plata', icon: '🥈', color: '#b8bfc7', rewardMult: 1.1, championDefId: 'kraken_legendario' },
  { minRank: 12, id: 'oro', label: 'Oro', icon: '🥇', color: '#e8c23c', rewardMult: 1.2, championDefId: 'fenrir_legendario' },
  { minRank: 22, id: 'platino', label: 'Platino', icon: '💠', color: '#7fd9c9', rewardMult: 1.35, championDefId: 'quetzalcoatl_legendario' },
  { minRank: 35, id: 'diamante', label: 'Diamante', icon: '💎', color: '#5fb3e8', rewardMult: 1.5, championDefId: 'anubis_legendario' },
  { minRank: 50, id: 'maestro', label: 'Maestro', icon: '👑', color: '#c95fe8', rewardMult: 1.7, championDefId: 'thor_legendario' },
  { minRank: 75, id: 'leyenda', label: 'Leyenda', icon: '🔥', color: '#e85f5f', rewardMult: 2.0, championDefId: 'zeus_legendario' },
];
function arenaLeagueForRank(rank) {
  let league = ARENA_LEAGUES[0];
  ARENA_LEAGUES.forEach(l => { if (rank >= l.minRank) league = l; });
  return league;
}
// Solo en el rango EXACTO de entrada (no "a partir de") — así es un
// combate puntual y reconocible, no todos los combates de esa liga.
function arenaChampionForRank(rank) {
  return ARENA_LEAGUES.find(l => l.minRank === rank && l.championDefId) || null;
}
function arenaChampionBonusReward(league) {
  return { gemas: Math.round(15 + league.minRank * 1.5) };
}

// ---------- Mercader Itinerante ----------
// Oferta diaria determinista (misma oferta todo el día, cambia sola al día
// siguiente, sin necesitar servidor: se deriva de la fecha real con
// hashStr, igual mecanismo que ya usa statVarianceMult más arriba) —
// cambia copias sueltas de una rareza concreta (que ya solo servían de
// material de Fusión) por 1 pieza de equipo de rareza superior, o por un
// puñado de cristales. Sin Legendario como coste (demasiado valioso para
// un simple cambio diario).
function merchantTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}
function merchantOffer() {
  const key = merchantTodayKey();
  const seed = Math.abs(hashStr(key));
  const costRarities = ['comun', 'infrecuente', 'raro', 'epico'];
  const costRarity = costRarities[seed % costRarities.length];
  const costCount = 3 + (seed % 3);
  if (seed % 2 === 0) {
    const rewardRarity = RARITIES[Math.min(RARITIES.length - 1, rarityIndex(costRarity) + 1)].id;
    return { key, costRarity, costCount, kind: 'gear', rewardRarity };
  }
  const crystalType = ['pixite', 'voxite', 'doxite'][Math.floor(seed / 11) % 3];
  const crystalAmount = 2 + (seed % 4);
  return { key, costRarity, costCount, kind: 'crystal', crystalType, crystalAmount };
}

// ---------- Objetivos (logros) ----------
// Cada uno se reduce a "alcanza N de X": `get(state, s)` calcula el valor
// actual (reutilizando casi siempre objectivesSummary, ya calculado antes
// de llamar aquí) y `target` el umbral — se completa en cuanto
// get(...) >= target, y una vez reclamado (ver state.objectivesClaimed y
// claimObjective en state.js) no se puede volver a cobrar. Categorías de
// fácil a muy tardío dentro de cada bloque, para que siempre haya alguno a
// mano según lo avanzada que vaya la partida.
//
// `reward` no es siempre Gemas — se reparte entre varios tipos (ver
// grantObjectiveReward en state.js) para que no todo dependa de la misma
// moneda: Gemas para los hitos más largos/tardíos (son la moneda "premium",
// hay que dosificarla), Texel para los tempranos (donde más falta hace y
// donde ya es abundante más adelante), objetos consumibles como premio
// rápido de sensación inmediata, y una pieza de equipo o un cristal extra
// como variante "física" de recompensa.
const rG = (amount) => ({ type: 'gemas', amount });
const rT = (amount) => ({ type: 'texel', amount });
const rI = (itemId, amount) => ({ type: 'item', itemId, amount });
const rGear = (rarity) => ({ type: 'gear', rarity });
const rC = (crystalType, amount) => ({ type: 'crystal', crystalType, amount });

const OBJECTIVES = [
  // --- Mapa ---
  { id: 'zonas_3', icon: '🗺️', label: 'Desbloquea 3 zonas', reward: rT(60), get: (st, s) => s.unlockedZones, target: 3 },
  { id: 'zonas_10', icon: '🗺️', label: 'Desbloquea 10 zonas', reward: rT(200), get: (st, s) => s.unlockedZones, target: 10 },
  { id: 'zonas_20', icon: '🗺️', label: 'Desbloquea 20 zonas', reward: rG(20), get: (st, s) => s.unlockedZones, target: 20 },
  { id: 'zonas_todas', icon: '🗺️', label: 'Desbloquea todas las zonas', reward: rG(80), get: (st, s) => s.unlockedZones, target: ZONES.length },
  { id: 'etapas_10', icon: '⚔️', label: 'Supera 10 etapas', reward: rI('pocion_menor', 3), get: (st, s) => s.stagesCleared, target: 10 },
  { id: 'etapas_50', icon: '⚔️', label: 'Supera 50 etapas', reward: rT(300), get: (st, s) => s.stagesCleared, target: 50 },
  { id: 'etapas_100', icon: '⚔️', label: 'Supera 100 etapas', reward: rG(25), get: (st, s) => s.stagesCleared, target: 100 },
  { id: 'etapas_200', icon: '⚔️', label: 'Supera 200 etapas', reward: rG(45), get: (st, s) => s.stagesCleared, target: 200 },
  { id: 'etapas_500', icon: '⚔️', label: 'Supera 500 etapas', reward: rG(70), get: (st, s) => s.stagesCleared, target: 500 },
  { id: 'etapas_todas', icon: '⚔️', label: 'Supera todas las etapas del Mapa', reward: rG(90), get: (st, s) => s.stagesCleared, target: s => s.totalStages },
  { id: 'jefes_1', icon: '👹', label: 'Derrota tu primer jefe de zona', reward: rI('pocion_mayor', 1), get: (st, s) => s.bossesDefeated, target: 1 },
  { id: 'jefes_3', icon: '👹', label: 'Derrota 3 jefes de zona', reward: rT(150), get: (st, s) => s.bossesDefeated, target: 3 },
  { id: 'jefes_10', icon: '👹', label: 'Derrota 10 jefes de zona', reward: rG(20), get: (st, s) => s.bossesDefeated, target: 10 },
  { id: 'jefes_20', icon: '👹', label: 'Derrota 20 jefes de zona', reward: rG(55), get: (st, s) => s.bossesDefeated, target: 20 },
  { id: 'jefes_todos', icon: '👹', label: 'Derrota todos los jefes de zona', reward: rG(90), get: (st, s) => s.bossesDefeated, target: ZONES.length },

  // --- Colección / Pokédex ---
  { id: 'formas_10', icon: '📖', label: 'Descubre 10 formas', reward: rI('pocion_menor', 2), get: (st, s) => s.formsDiscovered, target: 10 },
  { id: 'formas_25', icon: '📖', label: 'Descubre 25 formas', reward: rT(250), get: (st, s) => s.formsDiscovered, target: 25 },
  { id: 'formas_50', icon: '📖', label: 'Descubre 50 formas', reward: rG(20), get: (st, s) => s.formsDiscovered, target: 50 },
  { id: 'formas_100', icon: '📖', label: 'Descubre 100 formas', reward: rG(45), get: (st, s) => s.formsDiscovered, target: 100 },
  { id: 'formas_todas', icon: '📖', label: 'Descubre todas las formas', reward: rG(120), get: (st, s) => s.formsDiscovered, target: FIGHTERS.length },
  // Un objetivo por rareza ("tier"), además del de arriba (todas las
  // formas juntas) — petición explícita del usuario: "tiene que haber un
  // logro por conseguir todas las cartas de cada tier y por conseguir
  // todas las cartas". Reutiliza s.rarityStats (objectivesSummary,
  // state.js), ya calculado con rarityCollectionStats — mismo found/total
  // que ya se muestra en Objetivos/Estadísticas, sin duplicar el conteo.
  { id: 'tier_comun', icon: '⚪', label: 'Consigue todas las cartas Comunes', reward: rT(150), get: (st, s) => s.rarityStats.find(r => r.id === 'comun').found, target: s => s.rarityStats.find(r => r.id === 'comun').total },
  { id: 'tier_infrecuente', icon: '🟢', label: 'Consigue todas las cartas Infrecuentes', reward: rT(300), get: (st, s) => s.rarityStats.find(r => r.id === 'infrecuente').found, target: s => s.rarityStats.find(r => r.id === 'infrecuente').total },
  { id: 'tier_raro', icon: '🔵', label: 'Consigue todas las cartas Raras', reward: rG(30), get: (st, s) => s.rarityStats.find(r => r.id === 'raro').found, target: s => s.rarityStats.find(r => r.id === 'raro').total },
  { id: 'tier_epico', icon: '🟣', label: 'Consigue todas las cartas Épicas', reward: rG(70), get: (st, s) => s.rarityStats.find(r => r.id === 'epico').found, target: s => s.rarityStats.find(r => r.id === 'epico').total },
  { id: 'tier_legendario', icon: '🟡', label: 'Consigue todas las cartas Legendarias', reward: rG(150), get: (st, s) => s.rarityStats.find(r => r.id === 'legendario').found, target: s => s.rarityStats.find(r => r.id === 'legendario').total },
  { id: 'familias_1', icon: '⭐', label: 'Completa 1 familia entera (3 formas)', reward: rT(100), get: (st, s) => s.familiesComplete, target: 1 },
  { id: 'familias_10', icon: '⭐', label: 'Completa 10 familias', reward: rG(25), get: (st, s) => s.familiesComplete, target: 10 },
  { id: 'familias_25', icon: '⭐', label: 'Completa 25 familias', reward: rG(60), get: (st, s) => s.familiesComplete, target: 25 },
  { id: 'familias_40', icon: '⭐', label: 'Completa 40 familias', reward: rG(100), get: (st, s) => s.familiesComplete, target: 40 },
  { id: 'roster_5', icon: '🐾', label: 'Consigue 5 luchadores en tu Colección', reward: rI('pocion_menor', 2), get: (st, s) => s.rosterSize, target: 5 },
  { id: 'roster_10', icon: '🐾', label: 'Consigue 10 luchadores en tu Colección', reward: rT(150), get: (st, s) => s.rosterSize, target: 10 },
  { id: 'roster_30', icon: '🐾', label: 'Consigue 30 luchadores en tu Colección', reward: rG(20), get: (st, s) => s.rosterSize, target: 30 },
  { id: 'roster_60', icon: '🐾', label: 'Consigue 60 luchadores en tu Colección', reward: rG(45), get: (st, s) => s.rosterSize, target: 60 },
  { id: 'roster_100', icon: '🐾', label: 'Consigue 100 luchadores en tu Colección', reward: rG(75), get: (st, s) => s.rosterSize, target: 100 },
  { id: 'elementos_todos', icon: '🌪️', label: 'Ten un luchador de cada elemento', reward: rGear('raro'), get: (st, s) => s.elementsInRoster, target: s => s.totalElements },
  { id: 'clases_todas', icon: '🎭', label: 'Ten un luchador de cada clase', reward: rGear('raro'), get: (st, s) => s.classesInRoster, target: s => s.totalClasses },
  { id: 'nivel_max_1', icon: '📈', label: 'Sube un luchador a nivel máximo', reward: rT(200), get: (st, s) => s.maxLevelCount, target: 1 },
  { id: 'nivel_max_5', icon: '📈', label: 'Ten 5 luchadores a nivel máximo', reward: rG(30), get: (st, s) => s.maxLevelCount, target: 5 },
  { id: 'nivel_max_15', icon: '📈', label: 'Ten 15 luchadores a nivel máximo', reward: rG(70), get: (st, s) => s.maxLevelCount, target: 15 },
  { id: 'nivel_max_30', icon: '📈', label: 'Ten 30 luchadores a nivel máximo', reward: rG(120), get: (st, s) => s.maxLevelCount, target: 30 },
  { id: 'forma_final_1', icon: '🧬', label: 'Consigue un luchador en su forma final', reward: rI('pluma_fenix', 1), get: (st, s) => s.finalFormCount, target: 1 },
  { id: 'forma_final_10', icon: '🧬', label: 'Ten 10 luchadores en su forma final', reward: rG(35), get: (st, s) => s.finalFormCount, target: 10 },
  { id: 'forma_final_25', icon: '🧬', label: 'Ten 25 luchadores en su forma final', reward: rG(65), get: (st, s) => s.finalFormCount, target: 25 },
  { id: 'legendarios_1', icon: '👑', label: 'Consigue tu primer luchador Legendario', reward: rC('doxite', 5), get: (st, s) => s.legendarioCount, target: 1 },
  { id: 'legendarios_5', icon: '👑', label: 'Ten 5 luchadores Legendario', reward: rG(60), get: (st, s) => s.legendarioCount, target: 5 },
  { id: 'legendarios_15', icon: '👑', label: 'Ten 15 luchadores Legendario', reward: rG(130), get: (st, s) => s.legendarioCount, target: 15 },
  { id: 'sef_estrellas_5', icon: '🌟', label: 'Acumula 5 estrellas de Superfusión', reward: rGear('infrecuente'), get: (st, s) => s.totalSefStars, target: 5 },
  { id: 'sef_estrellas_15', icon: '🌟', label: 'Acumula 15 estrellas de Superfusión', reward: rG(35), get: (st, s) => s.totalSefStars, target: 15 },
  { id: 'sef_estrellas_30', icon: '🌟', label: 'Acumula 30 estrellas de Superfusión', reward: rG(80), get: (st, s) => s.totalSefStars, target: 30 },
  { id: 'sef_estrellas_50', icon: '🌟', label: 'Acumula 50 estrellas de Superfusión', reward: rG(140), get: (st, s) => s.totalSefStars, target: 50 },
  { id: 'estrellas_max_1', icon: '💫', label: 'Lleva un luchador al máximo de 3★ de Superfusión', reward: rG(50), get: (st, s) => s.starredCount, target: 1 },
  { id: 'estrellas_max_5', icon: '💫', label: 'Lleva 5 luchadores al máximo de 3★', reward: rG(160), get: (st, s) => s.starredCount, target: 5 },
  // fusiones_X/evoluciones_X (pedido explícito del usuario: "no hay logros
  // por fusionar y evolucionar") — a diferencia de forma_final_X/
  // sef_estrellas_X de arriba (una foto del roster ACTUAL), estos usan
  // totalFusionsMade/totalEvolutions (state.js), contadores DE POR VIDA que
  // nunca bajan aunque luego se venda o se pierda el luchador — premian la
  // ACCIÓN de fusionar/evolucionar en sí, no solo lo que se tenga ahora.
  { id: 'fusiones_20', icon: '⚗️', label: 'Fusiona 20 copias como material', reward: rI('pocion_menor', 2), get: (st, s) => s.totalFusionsMade, target: 20 },
  { id: 'fusiones_75', icon: '⚗️', label: 'Fusiona 75 copias como material', reward: rG(30), get: (st, s) => s.totalFusionsMade, target: 75 },
  { id: 'fusiones_200', icon: '⚗️', label: 'Fusiona 200 copias como material', reward: rG(75), get: (st, s) => s.totalFusionsMade, target: 200 },
  { id: 'fusiones_500', icon: '⚗️', label: 'Fusiona 500 copias como material', reward: rG(150), get: (st, s) => s.totalFusionsMade, target: 500 },
  { id: 'evoluciones_5', icon: '🧬', label: 'Evoluciona 5 veces', reward: rT(180), get: (st, s) => s.totalEvolutions, target: 5 },
  { id: 'evoluciones_20', icon: '🧬', label: 'Evoluciona 20 veces', reward: rG(40), get: (st, s) => s.totalEvolutions, target: 20 },
  { id: 'evoluciones_50', icon: '🧬', label: 'Evoluciona 50 veces', reward: rG(90), get: (st, s) => s.totalEvolutions, target: 50 },
  { id: 'evoluciones_120', icon: '🧬', label: 'Evoluciona 120 veces', reward: rG(160), get: (st, s) => s.totalEvolutions, target: 120 },

  // --- Cristales --- (bonus adicional sobre la subida de tasa en combate,
  // ver stageRewards en combat.js — no es la pieza principal que arregla
  // la escasez de Superfusión, solo un extra de hitos por seguir jugando,
  // como pidió el usuario)
  { id: 'cristales_victorias_25', icon: '🔮', label: 'Gana 25 combates', reward: rC('pixite', 15), get: (st, s) => s.battlesWon, target: 25 },
  { id: 'cristales_victorias_150', icon: '🔮', label: 'Gana 150 combates', reward: rC('pixite', 40), get: (st, s) => s.battlesWon, target: 150 },
  { id: 'cristales_victorias_350', icon: '🔮', label: 'Gana 350 combates', reward: rC('voxite', 15), get: (st, s) => s.battlesWon, target: 350 },
  { id: 'cristales_victorias_700', icon: '🔮', label: 'Gana 700 combates', reward: rC('doxite', 6), get: (st, s) => s.battlesWon, target: 700 },
  { id: 'cristales_jefes_5', icon: '🔮', label: 'Derrota 5 jefes de zona', reward: rC('voxite', 10), get: (st, s) => s.bossesDefeated, target: 5 },
  { id: 'cristales_jefes_20', icon: '🔮', label: 'Derrota 20 jefes de zona', reward: rC('doxite', 8), get: (st, s) => s.bossesDefeated, target: 20 },
  { id: 'cristales_jefes_todos', icon: '🔮', label: 'Derrota todos los jefes de zona', reward: rC('doxite', 15), get: (st, s) => s.bossesDefeated, target: s => s.totalBosses },
  { id: 'cristales_convertir_1', icon: '🔮', label: 'Convierte cristales por primera vez', reward: rC('voxite', 5), get: (st, s) => s.crystalsConverted, target: 1 },
  { id: 'cristales_convertir_10', icon: '🔮', label: 'Convierte cristales 10 veces', reward: rC('doxite', 4), get: (st, s) => s.crystalsConverted, target: 10 },

  // --- Combate ---
  { id: 'victorias_10', icon: '🏆', label: 'Gana 10 combates', reward: rI('pocion_menor', 2), get: (st, s) => s.battlesWon, target: 10 },
  { id: 'victorias_50', icon: '🏆', label: 'Gana 50 combates', reward: rT(200), get: (st, s) => s.battlesWon, target: 50 },
  { id: 'victorias_100', icon: '🏆', label: 'Gana 100 combates', reward: rG(20), get: (st, s) => s.battlesWon, target: 100 },
  { id: 'victorias_200', icon: '🏆', label: 'Gana 200 combates', reward: rG(45), get: (st, s) => s.battlesWon, target: 200 },
  { id: 'victorias_500', icon: '🏆', label: 'Gana 500 combates', reward: rG(100), get: (st, s) => s.battlesWon, target: 500 },
  { id: 'victorias_1000', icon: '🏆', label: 'Gana 1.000 combates', reward: rG(180), get: (st, s) => s.battlesWon, target: 1000 },
  { id: 'dano_5000', icon: '💥', label: 'Haz 5.000 de daño total', reward: rT(80), get: (st, s) => s.totalDmgDealt, target: 5000 },
  { id: 'dano_20000', icon: '💥', label: 'Haz 20.000 de daño total', reward: rT(400), get: (st, s) => s.totalDmgDealt, target: 20000 },
  { id: 'dano_50000', icon: '💥', label: 'Haz 50.000 de daño total', reward: rG(30), get: (st, s) => s.totalDmgDealt, target: 50000 },
  { id: 'dano_200000', icon: '💥', label: 'Haz 200.000 de daño total', reward: rG(70), get: (st, s) => s.totalDmgDealt, target: 200000 },
  { id: 'dano_500000', icon: '💥', label: 'Haz 500.000 de daño total', reward: rG(120), get: (st, s) => s.totalDmgDealt, target: 500000 },
  { id: 'golpe_500', icon: '💢', label: 'Consigue un golpe de más de 500 de daño', reward: rGear('raro'), get: (st, s) => s.highestSingleHit, target: 501 },
  { id: 'curacion_10000', icon: '💚', label: 'Cura 10.000 de vida en total', reward: rT(200), get: (st, s) => s.totalHealDone, target: 10000 },
  { id: 'curacion_100000', icon: '💚', label: 'Cura 100.000 de vida en total', reward: rG(65), get: (st, s) => s.totalHealDone, target: 100000 },
  { id: 'arena_1', icon: '🥇', label: 'Gana tu primer combate de Arena', reward: rT(60), get: (st, s) => s.arenaBestRank, target: 2 },
  { id: 'arena_5', icon: '🥇', label: 'Alcanza el Rango 5 de Arena', reward: rT(250), get: (st, s) => s.arenaBestRank, target: 5 },
  { id: 'arena_15', icon: '🥇', label: 'Alcanza el Rango 15 de Arena', reward: rG(25), get: (st, s) => s.arenaBestRank, target: 15 },
  { id: 'arena_30', icon: '🥇', label: 'Alcanza el Rango 30 de Arena', reward: rG(60), get: (st, s) => s.arenaBestRank, target: 30 },
  { id: 'arena_50', icon: '🥇', label: 'Alcanza el Rango 50 de Arena', reward: rG(110), get: (st, s) => s.arenaBestRank, target: 50 },
  { id: 'arena_75', icon: '🥇', label: 'Alcanza el Rango 75 de Arena', reward: rG(170), get: (st, s) => s.arenaBestRank, target: 75 },

  // --- Equipo ---
  { id: 'equipo_5', icon: '🎒', label: 'Consigue 5 piezas de equipo', reward: rI('pocion_menor', 2), get: (st, s) => s.gearOwned, target: 5 },
  { id: 'equipo_10', icon: '🎒', label: 'Consigue 10 piezas de equipo', reward: rT(150), get: (st, s) => s.gearOwned, target: 10 },
  { id: 'equipo_20', icon: '🎒', label: 'Consigue 20 piezas de equipo', reward: rG(20), get: (st, s) => s.gearOwned, target: 20 },
  { id: 'equipo_lleno', icon: '🎒', label: 'Consigue 40 piezas de equipo', reward: rG(50), get: (st, s) => s.gearOwned, target: 40 },
  { id: 'equipo_80', icon: '🎒', label: 'Consigue 80 piezas de equipo', reward: rG(90), get: (st, s) => s.gearOwned, target: 80 },
  { id: 'equipo_nivel_10', icon: '🔧', label: 'Sube una pieza de equipo a nivel 10', reward: rG(40), get: (st) => st.gearInventory.reduce((max, g) => Math.max(max, g.level), 0), target: 10 },
  { id: 'equipo_nivel_20', icon: '🔧', label: 'Sube una pieza de equipo a nivel 20', reward: rG(90), get: (st) => st.gearInventory.reduce((max, g) => Math.max(max, g.level), 0), target: 20 },
  { id: 'equipo_legendario_1', icon: '🔧', label: 'Consigue una pieza de equipo Legendaria', reward: rG(70), get: (st, s) => s.gearLegendarioCount, target: 1 },

  // --- Retos especiales ---
  { id: 'campeon_5', icon: '⚔️', label: 'Consigue una racha de 5 en la Prueba del Campeón', reward: rT(150), get: (st) => st.champion.bestStreak, target: 5 },
  { id: 'campeon_15', icon: '⚔️', label: 'Consigue una racha de 15 en la Prueba del Campeón', reward: rG(35), get: (st) => st.champion.bestStreak, target: 15 },
  { id: 'campeon_30', icon: '⚔️', label: 'Consigue una racha de 30 en la Prueba del Campeón', reward: rG(75), get: (st) => st.champion.bestStreak, target: 30 },
  { id: 'campeon_50', icon: '⚔️', label: 'Consigue una racha de 50 en la Prueba del Campeón', reward: rG(140), get: (st) => st.champion.bestStreak, target: 50 },
  { id: 'elemental_1', icon: '🌋', label: 'Supera tu primera Mazmorra Elemental', reward: rGear('epico'), get: (st) => Object.values(st.elementalClears).reduce((a, b) => a + b, 0), target: 1 },
  { id: 'elemental_todas', icon: '🌋', label: 'Supera las 5 Mazmorras Elementales (una vez cada una)', reward: rG(70), get: (st) => Object.values(st.elementalClears).filter(v => v > 0).length, target: 5 },
  { id: 'torre_1', icon: '🗼', label: 'Supera tu primer nivel de la Torre Batalla', reward: rT(150), get: (st) => Object.values(st.torre.clears).filter(v => v > 0).length, target: 1 },
  { id: 'torre_10', icon: '🗼', label: 'Supera 10 niveles distintos de la Torre Batalla', reward: rG(35), get: (st) => Object.values(st.torre.clears).filter(v => v > 0).length, target: 10 },
  { id: 'torre_20', icon: '🗼', label: 'Supera 20 niveles distintos de la Torre Batalla', reward: rG(70), get: (st) => Object.values(st.torre.clears).filter(v => v > 0).length, target: 20 },
  { id: 'torre_40', icon: '🗼', label: 'Supera 40 niveles distintos de la Torre Batalla', reward: rG(130), get: (st) => Object.values(st.torre.clears).filter(v => v > 0).length, target: 40 },
  { id: 'torre_todos', icon: '🗼', label: 'Supera todos los niveles de la Torre Batalla', reward: rG(220), get: (st) => Object.values(st.torre.clears).filter(v => v > 0).length, target: TORRE_LEVELS.length },
  { id: 'roguelike_5', icon: '🌀', label: 'Alcanza la ronda 5 del Roguelike', reward: rT(200), get: (st) => st.roguelike.bestRound, target: 5 },
  { id: 'roguelike_15', icon: '🌀', label: 'Alcanza la ronda 15 del Roguelike', reward: rG(40), get: (st) => st.roguelike.bestRound, target: 15 },
  { id: 'roguelike_30', icon: '🌀', label: 'Alcanza la ronda 30 del Roguelike', reward: rG(85), get: (st) => st.roguelike.bestRound, target: 30 },
  { id: 'roguelike_50', icon: '🌀', label: 'Alcanza la ronda 50 del Roguelike', reward: rG(150), get: (st) => st.roguelike.bestRound, target: 50 },
  { id: 'tiercap_1', icon: '🎯', label: 'Supera tu primer nivel de Tope de Tier', reward: rT(150), get: (st) => Object.values(st.tierCap.clears).filter(v => v > 0).length, target: 1 },
  { id: 'tiercap_7', icon: '🎯', label: 'Supera 7 niveles de Tope de Tier', reward: rG(45), get: (st) => Object.values(st.tierCap.clears).filter(v => v > 0).length, target: 7 },
  { id: 'tiercap_15', icon: '🎯', label: 'Supera 15 niveles de Tope de Tier', reward: rG(90), get: (st) => Object.values(st.tierCap.clears).filter(v => v > 0).length, target: 15 },
  { id: 'tiercap_22', icon: '🎯', label: 'Supera 22 niveles de Tope de Tier', reward: rG(150), get: (st) => Object.values(st.tierCap.clears).filter(v => v > 0).length, target: 22 },
  { id: 'tiercap_todos', icon: '🎯', label: 'Supera todos los niveles de Tope de Tier', reward: rG(90), get: (st) => Object.values(st.tierCap.clears).filter(v => v > 0).length, target: TIER_CAP_LEVELS.length },
  { id: 'familytrials_25', icon: '🧬', label: 'Supera el 25% de los Trials de Familia', reward: rG(50), get: (st) => Object.values(st.tierCap.familyTrialClears).filter(v => v > 0).length, target: Math.ceil(FAMILY_TRIALS.length * 0.25) },
  { id: 'familytrials_50', icon: '🧬', label: 'Supera el 50% de los Trials de Familia', reward: rG(100), get: (st) => Object.values(st.tierCap.familyTrialClears).filter(v => v > 0).length, target: Math.ceil(FAMILY_TRIALS.length * 0.5) },
  { id: 'familytrials_75', icon: '🧬', label: 'Supera el 75% de los Trials de Familia', reward: rG(180), get: (st) => Object.values(st.tierCap.familyTrialClears).filter(v => v > 0).length, target: Math.ceil(FAMILY_TRIALS.length * 0.75) },
  { id: 'familytrials_100', icon: '🧬', label: 'Supera TODOS los Trials de Familia', reward: rG(350), get: (st) => Object.values(st.tierCap.familyTrialClears).filter(v => v > 0).length, target: FAMILY_TRIALS.length },

  // --- Homúnculos ---
  { id: 'homunculos_5', icon: '🧪', label: 'Consigue 5 Homúnculos', reward: rI('pocion_menor', 2), get: (st, s) => s.homunculosTotal, target: 5 },
  { id: 'homunculos_20', icon: '🧪', label: 'Consigue 20 Homúnculos', reward: rT(180), get: (st, s) => s.homunculosTotal, target: 20 },
  { id: 'homunculos_50', icon: '🧪', label: 'Consigue 50 Homúnculos', reward: rG(40), get: (st, s) => s.homunculosTotal, target: 50 },
  { id: 'homunculos_100', icon: '🧪', label: 'Consigue 100 Homúnculos', reward: rG(90), get: (st, s) => s.homunculosTotal, target: 100 },

  // --- Formación ---
  { id: 'formacion_completa', icon: '🧩', label: 'Llena los 9 huecos de tu Formación', reward: rI('pocion_mayor', 1), get: (st) => st.band.flat().filter(Boolean).length, target: 9 },
  ...ELEMENT_ORDER.map(elId => ({
    id: 'formacion_mono_' + elId, icon: ELEMENT_INFO[elId].icon,
    label: `Formación de solo ${ELEMENT_INFO[elId].label} (mín. 3 luchadores)`, reward: rGear('infrecuente'),
    get: (st) => {
      const uids = st.band.flat().filter(Boolean);
      if (uids.length < 3) return 0;
      const defs = uids.map(uid => fighterDef(st.roster.find(r => r.uid === uid).defId));
      return defs.every(d => d && d.element === elId) ? 1 : 0;
    },
    target: 1,
  })),
  ...Object.keys(CLASS_INFO).map(classId => ({
    id: 'formacion_mono_' + classId, icon: CLASS_INFO[classId].icon,
    label: `Formación de solo ${CLASS_INFO[classId].label} (mín. 3 luchadores)`, reward: rGear('infrecuente'),
    get: (st) => {
      const uids = st.band.flat().filter(Boolean);
      if (uids.length < 3) return 0;
      const defs = uids.map(uid => fighterDef(st.roster.find(r => r.uid === uid).defId));
      return defs.every(d => d && d.class === classId) ? 1 : 0;
    },
    target: 1,
  })),

  // --- Constancia ---
  { id: 'dias_jugados_3', icon: '📅', label: 'Juega en 3 días distintos', reward: rI('pocion_menor', 2), get: (st) => st.progress.daysPlayed.length, target: 3 },
  { id: 'dias_jugados_7', icon: '📅', label: 'Juega en 7 días distintos', reward: rT(200), get: (st) => st.progress.daysPlayed.length, target: 7 },
  { id: 'dias_jugados_30', icon: '📅', label: 'Juega en 30 días distintos', reward: rG(60), get: (st) => st.progress.daysPlayed.length, target: 30 },
  { id: 'dias_jugados_60', icon: '📅', label: 'Juega en 60 días distintos', reward: rG(120), get: (st) => st.progress.daysPlayed.length, target: 60 },

  // --- Riqueza ---
  { id: 'texel_10000', icon: '💰', label: 'Consigue un total de 10.000 Texel', reward: rI('pocion_menor', 3), get: (st, s) => s.totalTexelEarned, target: 10000 },
  { id: 'texel_100000', icon: '💰', label: 'Consigue un total de 100.000 Texel', reward: rG(60), get: (st, s) => s.totalTexelEarned, target: 100000 },
  { id: 'texel_500000', icon: '💰', label: 'Consigue un total de 500.000 Texel', reward: rG(140), get: (st, s) => s.totalTexelEarned, target: 500000 },
  { id: 'xp_10000', icon: '✨', label: 'Consigue un total de 10.000 XP de luchador', reward: rI('pocion_menor', 3), get: (st, s) => s.totalFighterXpEarned, target: 10000 },
  { id: 'xp_100000', icon: '✨', label: 'Consigue un total de 100.000 XP de luchador', reward: rG(60), get: (st, s) => s.totalFighterXpEarned, target: 100000 },
  { id: 'xp_500000', icon: '✨', label: 'Consigue un total de 500.000 XP de luchador', reward: rG(140), get: (st, s) => s.totalFighterXpEarned, target: 500000 },
];
// `target` puede ser un número fijo o una función (state, s) => número,
// para los que dependen de una constante que solo se conoce en runtime
// (número total de elementos/clases/hueco de equipo/etapas del Mapa).
function objectiveTarget(obj, state, s) { return typeof obj.target === 'function' ? obj.target(s) : obj.target; }
function objectiveProgress(obj, state, s) { return { value: obj.get(state, s), target: objectiveTarget(obj, state, s) }; }
function objectiveCompleted(obj, state, s) { const { value, target } = objectiveProgress(obj, state, s); return value >= target; }
