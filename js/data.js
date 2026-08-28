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

const CLASS_INFO = {
  campeon: { label: 'Campeón', icon: '🛡️', role: 'Tanque', weights: { hp: 145, atk: 17, def: 22, agi: 8, wis: 6 } },
  picaro: { label: 'Pícaro', icon: '🗡️', role: 'Daño físico', weights: { hp: 90, atk: 26, def: 10, agi: 22, wis: 6 } },
  guru: { label: 'Gurú', icon: '🔮', role: 'Daño mágico', weights: { hp: 85, atk: 9, def: 10, agi: 16, wis: 28 } },
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

const SKILL_TYPES = {
  golpe: { name: 'Golpe Certero', kind: 'damage', mult: 2.2, target: 'single', desc: 'Un golpe demoledor a un enemigo, mucho más fuerte que un golpe normal.' },
  furia: { name: 'Furia Salvaje', kind: 'damage', mult: 2.0, target: 'single', selfBuff: { stat: 'atk', pct: 0.15, turns: 2 }, desc: 'Golpea con mucha fuerza y se enardece.' },
  arrasar: { name: 'Arrasar', kind: 'damageRow', mult: 1.5, target: 'row', desc: 'Daño mágico considerable a toda la fila enemiga.' },
  // El resto de ultis (curar, defensivas, de estado...) no hacían daño al
  // rival, así que un turno de ulti podía no aportar nada de daño — ahora
  // TODAS golpean también a un enemigo (bonusHitMult), más flojo que un
  // ulti de daño puro pero cercano a un golpe normal, para que ningún
  // turno se quede sin hacer daño.
  curar: { name: 'Bendición Sanadora', kind: 'heal', pct: 0.3, target: 'self', bonusHitMult: 0.85, desc: 'Recupera parte de su propia vida y golpea a un enemigo.' },
  bendicion: { name: 'Aura Vital', kind: 'healRow', pct: 0.16, target: 'row-ally', bonusHitMult: 0.85, desc: 'Cura a toda su fila y golpea a un enemigo.' },
  escudo: { name: 'Muro de Escamas', kind: 'buffSelf', stat: 'def', pct: 0.35, turns: 3, bonusHitMult: 0.85, desc: 'Refuerza su propia defensa y golpea a un enemigo.' },
  grito: { name: 'Grito de Guerra', kind: 'buffRow', stat: 'atk', pct: 0.2, turns: 3, bonusHitMult: 0.85, desc: 'Aumenta el ataque de su fila y golpea a un enemigo.' },
  debilitar: { name: 'Marca Débil', kind: 'debuff', stat: 'def', pct: 0.25, turns: 3, target: 'single', bonusHitMult: 0.85, desc: 'Reduce la defensa de un enemigo y lo golpea.' },
  aturdir: { name: 'Onda de Trueno', kind: 'stun', turns: 1, chance: 0.65, target: 'single', bonusHitMult: 0.85, desc: 'Puede aturdir a un enemigo y siempre lo golpea.' },
  veneno: { name: 'Mordisco Venenoso', kind: 'dot', mult: 1.5, dotPct: 0.07, dotTurns: 3, target: 'single', desc: 'Golpea con fuerza a un enemigo y lo envenena: sigue perdiendo vida 3 turnos, ignorando su defensa.' },
  drenar: { name: 'Golpe Vampírico', kind: 'drain', mult: 1.8, drainPct: 0.5, target: 'single', desc: 'Golpea con fuerza a un enemigo y recupera la mitad del daño hecho como vida propia.' },
  purificar: { name: 'Aura Purificadora', kind: 'cleanse', target: 'row-ally', bonusHitMult: 0.85, desc: 'Elimina los debuffs, el veneno y el aturdimiento de toda su fila, y golpea a un enemigo.' },
  revivir: { name: 'Milagro de Vida', kind: 'revive', pct: 0.4, target: 'row-ally', bonusHitMult: 0.85, desc: 'Revive a un aliado caído de su fila con parte de su vida máxima, y golpea a un enemigo.' },
};

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
const BOSSES = [];
function addBoss(slug, element, cls, skillId, name, lore, rarity, hasImage) {
  const entry = { id: 'boss_' + slug, name, element, class: cls, rarity: rarity || 'legendario', family: 'boss_' + slug, evolvesTo: null, skillId, lore };
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
addFamily('hipogrifo', 2, 'viento', 'explorador', 'debilitar', ['Potro Alado', 'Hipogrifo Salvaje', 'Señor de los Cielos Altos'], ['Mitad caballo, mitad grifo, surca el cielo más rápido que cualquier ave.', 'Vuela libre por cielos que ningún jinete se atreve a cruzar sin su permiso.', 'Ni el águila más veloz alcanza la sombra que deja tras de sí.'], true);
addFamily('cerbero', 3, 'fuego', 'campeon', 'escudo', ['Cachorro de Tres Cabezas', 'Guardián del Umbral', 'Cerbero, Custodio del Inframundo'], ['Vigila la puerta que separa el mundo de los vivos del de los muertos.', 'Cada una de sus tres cabezas vigila una dirección distinta: nada cruza sin ser visto.', 'Ninguna alma, viva o muerta, ha logrado pasar junto a él sin su consentimiento.'], true);
addFamily('centauro', 2, 'tierra', 'explorador', 'debilitar', ['Potrillo Centauro', 'Centauro Arquero', 'Jefe de la Manada Salvaje'], ['Combina la fuerza de un corcel con la puntería de un cazador nato.', 'Su flecha nunca falla, y su galope nunca se cansa.', 'Lidera a la manada entera con el arco en una mano y las riendas de su propio cuerpo en la otra.'], true);
addFamily('minotauro', 2, 'tierra', 'campeon', 'furia', ['Toro Joven del Laberinto', 'Minotauro Furioso', 'Amo del Laberinto Eterno'], ['Nadie que entra en su laberinto vuelve a encontrar la salida.', 'Su furia crece con cada golpe, tanto como los pasillos de su laberinto.', 'El laberinto entero es una extensión de su ira: perderse en él es perderlo todo.'], true);
addFamily('kraken', 3, 'agua', 'brujo', 'arrasar', ['Cría de Kraken', 'Kraken de las Profundidades', 'Devorador de Flotas'], ['Sus tentáculos han hundido más barcos de los que nadie se atreve a contar.', 'Cada tentáculo que pierde en batalla vuelve más grueso y más letal.', 'Las flotas que zarpan hacia su territorio ya no regresan a puerto.'], true);
addFamily('leviatan', 3, 'agua', 'campeon', 'escudo', ['Serpiente de Mar Joven', 'Leviatán de las Mareas', 'Leviatán, Terror del Océano'], ['Su sola presencia hace que el mar entero se agite de terror.', 'Las mareas mismas cambian de rumbo cuando él decide moverse.', 'Ningún capitán se atreve siquiera a nombrarlo en alta mar.'], true);
addFamily('fenrir', 3, 'viento', 'picaro', 'furia', ['Lobezno de Hierro', 'Fenrir Encadenado', 'Fenrir, el Lobo del Fin del Mundo'], ['Se dice que su rugido anunciará el fin de los tiempos.', 'Las cadenas que lo atan se tensan un poco más cada día que pasa.', 'El día que rompa sus cadenas, ni los dioses podrán detenerlo.'], true);
addFamily('nahual', 2, 'tierra', 'brujo', 'debilitar', ['Aprendiz de Nahual', 'Nahual Cambiapieles', 'Gran Brujo Nahual'], ['Puede transformarse en la bestia que más tema su enemigo.', 'Cada combate le enseña una nueva forma que dominar.', 'Ya no hay bestia en Texel cuya piel no pueda vestir a voluntad.'], true);
addFamily('quetzalcoatl', 3, 'viento', 'guru', 'bendicion', ['Serpiente Emplumada Joven', 'Quetzalcóatl Ascendente', 'Quetzalcóatl, Señor del Viento'], ['Serpiente y ave a la vez, trajo el conocimiento a su pueblo.', 'Su vuelo entre las nubes reparte tanto sabiduría como tormentas.', 'El propio viento de Texel obedece el batir de sus plumas.'], true);
addFamily('cadejo', 1, 'tierra', 'picaro', 'aturdir', ['Cadejo Blanco', 'Cadejo Guardián', 'Cadejo Protector de Caminantes'], ['Aparece en los caminos de noche para proteger — o asustar — a quien los recorre.', 'Camina toda la noche junto a los viajeros sin que ninguno note su presencia.', 'Ningún caminante que reza su nombre se pierde jamás en la oscuridad.'], true);
addFamily('hada', 1, 'viento', 'guru', 'curar', ['Hada Menor', 'Hada del Bosque', 'Reina de las Hadas'], ['Su polvo brillante puede curar heridas o gastar una broma, según su humor.', 'Su polvo dorado convierte cualquier claro del bosque en su propio reino.', 'Todas las hadas del bosque responden a su llamada.'], true);
addFamily('shenlong', 3, 'rayo', 'brujo', 'arrasar', ['Dragoncillo de las Nubes', 'Shenlong Danzante', 'Shenlong, Dragón de la Lluvia'], ['Su danza entre las nubes trae la lluvia a los campos de Texel.', 'Su danza en el cielo ya reúne nubes de tormenta antes de empezar a bailar.', 'Los campos de Texel dependen de su humor: sin su lluvia, la tierra se seca.'], true);
addFamily('zeus', 3, 'rayo', 'campeon', 'grito', ['Joven del Olimpo', 'Heredero del Rayo', 'Zeus, Señor del Trueno'], ['Ningún cielo se atreve a nublarse sin su permiso.', 'Cada rayo que lanza deja claro de quién es el cielo.', 'El Olimpo entero calla cuando él decide hablar con el trueno.'], true);
addFamily('guerreromedieval', 1, 'tierra', 'campeon', 'golpe', ['Recluta de Armadura', 'Caballero de Armas', 'Comandante de la Guardia'], ['Entrenado desde niño para defender su reino con espada y escudo.', 'Ha subido de rango tras defender la muralla en incontables asedios.', 'Comanda a toda la guardia del reino con la misma disciplina que lo formó a él.'], true);
addFamily('valquiria', 2, 'rayo', 'campeon', 'grito', ['Escudera Valquiria', 'Valquiria de Combate', 'Elegidora de los Caídos'], ['Decide quién de los caídos en batalla merece cabalgar hasta el Valhalla.', 'Ha cabalgado sobre incontables campos de batalla en busca de los caídos más dignos.', 'Su juicio decide quién cruza las puertas del Valhalla y quién se queda atrás.'], true);
addFamily('golem', 2, 'tierra', 'campeon', 'escudo', ['Golem de Barro', 'Golem de Piedra', 'Golem de Hierro Ancestral'], ['Animado por magia antigua, no conoce el cansancio ni el miedo.', 'La piedra que lo forma se ha endurecido tras incontables golpes.', 'El hierro ancestral que lo recorre ya no conoce la palabra derrota.'], true);
addFamily('satiromusico', 2, 'viento', 'guru', 'bendicion', ['Sátiro Flautista', 'Sátiro de la Fiesta Eterna', 'Sumo Sátiro de Dioniso'], ['Su flauta pone a bailar hasta al enemigo más serio.', 'Su melodía ya no distingue entre aliados y enemigos: todos terminan bailando.', 'El mismísimo Dioniso reconoce en él a su discípulo favorito.'], true);
addFamily('mandragora', 1, 'tierra', 'brujo', 'debilitar', ['Brote de Mandrágora', 'Mandrágora Chillona', 'Mandrágora Ancestral'], ['Su grito al ser arrancada deja aturdido a quien lo escuche.', 'Su chillido se ha vuelto tan agudo que aturde a quien la desentierra sin cuidado.', 'Sus raíces llevan siglos bajo tierra, y su grito ya es leyenda entre los campesinos.'], true);
addFamily('pazuzu', 3, 'viento', 'brujo', 'debilitar', ['Espíritu Menor del Viento', 'Heraldo de Pazuzu', 'Pazuzu, Señor de los Vientos del Sur'], ['Rey de los demonios del viento, tan temido como respetado.', 'Su heraldo recorre el desierto anunciando tormentas de arena a su paso.', 'Ni el viento del sur se atreve a soplar sin su permiso.'], true);
addFamily('garuda', 2, 'viento', 'explorador', 'furia', ['Polluelo de Garuda', 'Garuda Cazadora', 'Garuda, Montura de los Dioses'], ['Ave gigante capaz de cargar a un dios entero sobre su lomo.', 'Caza presas cada vez más grandes con garras cada vez más firmes.', 'Los propios dioses eligen montarla para cruzar el cielo.'], true);
addFamily('anubis', 3, 'tierra', 'brujo', 'debilitar', ['Chacal del Desierto', 'Sacerdote de Anubis', 'Anubis, Guardián de los Muertos'], ['Pesa el corazón de cada alma antes de dejarla pasar al más allá.', 'Cada alma que pesa en su balanza aprende a temer su juicio.', 'Ningún muerto de Texel cruza al más allá sin pasar antes por él.'], true);
addFamily('ra', 3, 'fuego', 'guru', 'arrasar', ['Disco Solar Joven', 'Heraldo de Ra', 'Ra, Señor del Sol'], ['Su carro cruza el cielo cada día, y con él, la luz del mundo.', 'Su heraldo recorre el cielo anunciando el amanecer cada mañana.', 'Sin su carro cruzando el cielo, ningún día en Texel volvería a amanecer.'], true);
addFamily('osiris', 3, 'tierra', 'guru', 'revivir', ['Aprendiz del Nilo', 'Sacerdote de Osiris', 'Osiris, Señor de la Resurrección'], ['Murió una vez y volvió, y desde entonces gobierna el más allá.', 'Sirve fielmente al Nilo hasta el día en que la muerte lo reclamó por primera vez.', 'Gobierna el más allá con la calma de quien ya no le teme a la muerte.'], true);
addFamily('hombretigre', 2, 'tierra', 'picaro', 'furia', ['Cachorro Tigre', 'Guerrero Tigre', 'Señor de las Rayas Doradas'], ['Ataca en silencio y golpea con la fuerza de un tigre de bengala.', 'Sus rayas doradas ya son sinónimo de un ataque certero y silencioso.', 'Nadie ve venir al Señor de las Rayas Doradas hasta que ya es tarde.'], true);
addFamily('hombrelobo', 2, 'viento', 'picaro', 'furia', ['Joven Maldito', 'Hombre Lobo', 'Alfa de la Luna Llena'], ['Cada luna llena pierde el control... y gana una fuerza brutal.', 'Cada luna llena le arrebata más control... y le entrega más fuerza.', 'Como alfa, ya no necesita esperar a la luna llena para desatar su furia.'], true);
addFamily('dracula', 3, 'rayo', 'brujo', 'drenar', ['Vástago de la Noche', 'Noble de Sangre Oscura', 'Drácula, Señor de la Noche'], ['Ha sobrevivido siglos alimentándose de las sombras de Texel.', 'Cada noble que se cruza en su camino termina siendo parte de su corte de sombras.', 'Ningún amanecer en Texel se atreve a alcanzarlo antes de que regrese a su castillo.'], true);
addFamily('genbu', 2, 'agua', 'campeon', 'escudo', ['Tortuga Joven de Genbu', 'Genbu, Guardián del Norte', 'Genbu, Escudo de las Profundidades'], ['Su caparazón ha resistido más golpes de los que nadie puede contar.', 'Guarda el norte con la paciencia de quien lleva siglos sin ceder terreno.', 'Su caparazón se ha convertido en el escudo más profundo de todo Texel.'], true);
addFamily('escualo', 1, 'agua', 'picaro', 'furia', ['Aprendiz Tiburón', 'Escualo de Combate', 'Depredador de los Siete Mares'], ['Huele la sangre — y la debilidad — antes que nadie.', 'Cada combate afila más sus instintos de depredador.', 'Los siete mares le pertenecen: nada débil sobrevive donde él caza.'], true);
addFamily('hercules', 3, 'tierra', 'campeon', 'golpe', ['Joven de Fuerza Divina', 'Hércules en sus Trabajos', 'Hércules, el Semidiós'], ['Ha completado hazañas que ningún mortal lograría siquiera empezar.', 'Cada trabajo imposible que completa añade una hazaña más a su leyenda.', 'Su fuerza ya no se mide como la de un mortal, sino como la de un dios.'], true);
addFamily('ciclope', 2, 'tierra', 'campeon', 'golpe', ['Cíclope Pastor', 'Cíclope Forjador', 'Cíclope, Ojo del Trueno'], ['Con un solo ojo ve más peligro que la mayoría con dos.', 'Su forja produce armas capaces de atravesar la piedra más dura de la montaña.', 'Su único ojo ve venir la tormenta antes de que el propio cielo se oscurezca.'], true);
addFamily('driada', 1, 'tierra', 'guru', 'curar', ['Brote de Dríada', 'Dríada del Bosque', 'Dríada Madre del Bosque Ancestral'], ['Su vida está ligada al árbol que la vio nacer.', 'Su raíz se extiende cada vez más profunda en el corazón del bosque.', 'Es la madre de todos los árboles del bosque ancestral, y ellos la protegen a su vez.'], true);
addFamily('ent', 2, 'tierra', 'campeon', 'escudo', ['Retoño Andante', 'Ent Guardián', 'Ent Ancestral del Bosque Viejo'], ['Piensa despacio, pero cuando decide actuar, nada lo detiene.', 'Cada año que pasa, sus raíces se hunden un poco más en la tierra vieja.', 'El bosque viejo entero escucha su voz cuando por fin decide hablar.'], true);
addFamily('hidraserpiente', 2, 'agua', 'brujo', 'arrasar', ['Hidra Recién Nacida', 'Hidra de Pantano', 'Hidra de las Nueve Cabezas'], ['Corta una cabeza y otras dos crecerán en su lugar.', 'Cada cabeza cortada solo alimenta más su furia — y su número.', 'Nueve cabezas vigilan el pantano: ninguna presa escapa a todas a la vez.'], true);
addFamily('hombreoso', 1, 'tierra', 'campeon', 'golpe', ['Joven Oso', 'Guerrero Oso', 'Gran Oso de las Montañas'], ['Su abrazo es tan mortal como su zarpazo.', 'Su fuerza ha crecido tanto como su territorio en las montañas.', 'Ningún rival sobrevive a un abrazo del Gran Oso de las Montañas.'], true);
addFamily('mujercisne', 2, 'agua', 'guru', 'bendicion', ['Doncella Cisne', 'Mujer Cisne', 'Reina de los Lagos Blancos'], ['Su plumaje esconde una gracia que desarma a cualquier rival.', 'Su gracia en el combate desarma a quien la subestima por su belleza.', 'Gobierna los lagos blancos con la misma elegancia con la que vuela.'], true);
addFamily('unicornio', 2, 'viento', 'guru', 'purificar', ['Potrillo con Cuerno', 'Unicornio Radiante', 'Unicornio de Luz Pura'], ['Su cuerno puede curar cualquier herida... o purificar cualquier veneno.', 'Su luz ya brilla lo suficiente para curar heridas que nadie más podría sanar.', 'Su cuerno de luz pura purifica cualquier veneno con solo rozarlo.'], true);
addFamily('esfinge', 3, 'tierra', 'guru', 'debilitar', ['Cachorra de Esfinge', 'Esfinge Guardiana', 'Esfinge, Guardiana de Enigmas'], ['Solo deja pasar a quien resuelve su acertijo — a los demás, se los come.', 'Cada acertijo que plantea es más difícil — y más mortal — que el anterior.', 'Solo los más sabios de Texel se atreven a intentar cruzar ante ella.'], true);
addFamily('grifo', 2, 'viento', 'explorador', 'furia', ['Polluelo de Grifo', 'Grifo Cazador', 'Grifo, Rey de las Alturas'], ['Mitad águila, mitad león, caza tanto en tierra como en el aire.', 'Caza con la misma facilidad en tierra que en el aire, sin dar tregua a su presa.', 'Es el rey indiscutido de las alturas, y ningún ave se atreve a desafiarlo.'], true);
addFamily('lamasu', 2, 'tierra', 'campeon', 'escudo', ['Guardián Menor Lamasu', 'Lamasu de las Puertas', 'Lamasu, Custodio de Palacios'], ['Vigila las puertas de los palacios antiguos con cuerpo de toro y alas de águila.', 'Vigila cada entrada del palacio sin perder jamás la concentración.', 'Ningún intruso ha logrado cruzar las puertas que él custodia.'], true);
addFamily('pegaso', 2, 'viento', 'explorador', 'furia', ['Potrillo Alado', 'Pegaso Veloz', 'Pegaso, Corcel de las Nubes'], ['Ningún jinete olvida jamás la primera vez que voló sobre sus alas.', 'Su velocidad en el aire ya deja atrás a cualquier otra criatura alada.', 'Cabalgar sobre él es cabalgar entre las nubes mismas.'], true);
addFamily('silfide', 1, 'viento', 'guru', 'bendicion', ['Brisa Menor', 'Sílfide del Viento', 'Sílfide, Espíritu del Aire Puro'], ['Tan ligera que apenas roza el suelo al caminar.', 'El viento la lleva cada vez más lejos, casi sin tocar el suelo.', 'Es pura esencia del aire: nadie ha logrado verla completamente quieta.'], true);
addFamily('wyvern', 2, 'viento', 'picaro', 'furia', ['Cría de Wyvern', 'Wyvern Cazador', 'Wyvern, Terror de los Cielos'], ['Más ágil que un dragón, y su aguijón es igual de letal.', 'Su aguijón se ha vuelto tan letal como sus garras.', 'Es el terror indiscutido de los cielos: ni los dragones se atreven a cruzarse en su camino.'], true);
addFamily('cecaelia', 2, 'agua', 'brujo', 'debilitar', ['Joven Cecaelia', 'Cecaelia de los Arrecifes', 'Cecaelia, Bruja del Coral'], ['Mitad mujer, mitad pulpo, teje hechizos tan enredados como sus tentáculos.', 'Sus hechizos se enredan tanto como sus propios tentáculos entre el coral.', 'Ninguna bruja del arrecife teje magia tan retorcida como ella.'], true);
addFamily('hipocampo', 1, 'agua', 'explorador', 'debilitar', ['Hipocampo Joven', 'Hipocampo de las Corrientes', 'Hipocampo, Corcel del Mar'], ['Mitad caballo, mitad pez, tira de los carros de los dioses del mar.', 'Tira de carros cada vez más pesados entre las corrientes marinas.', 'Es el corcel elegido de los dioses del mar para cruzar cualquier tormenta.'], true);
addFamily('enano', 1, 'tierra', 'campeon', 'golpe', ['Enano Aprendiz', 'Enano Herrero', 'Enano Rey de la Montaña'], ['Forja armas capaces de atravesar la piedra más dura.', 'Cada arma que forja es más resistente que la anterior.', 'Su yunque ha forjado las armas que defienden la montaña entera.'], true);
addFamily('duendetravieso', 1, 'viento', 'picaro', 'aturdir', ['Duende Travieso', 'Duende Embaucador', 'Duende Rey de las Bromas'], ['Le encanta más gastar una broma que ganar una pelea.', 'Cada broma que gasta es más elaborada — y más difícil de evitar.', 'Es el rey indiscutido de las bromas, temido y adorado a partes iguales.'], true);
addFamily('guerreroleopardo', 2, 'tierra', 'picaro', 'furia', ['Joven Leopardo', 'Guerrero Leopardo', 'Señor de las Manchas Doradas'], ['Ataca desde las sombras y desaparece antes de que puedan responder.', 'Sus manchas doradas ya son sinónimo de un ataque que nadie ve venir.', 'Nadie sobrevive a un encuentro con el Señor de las Manchas Doradas.'], true);
addFamily('panteranegra', 2, 'tierra', 'picaro', 'aturdir', ['Cachorro de Pantera', 'Guerrero Pantera Negra', 'Rey de la Pantera Negra'], ['Se mueve en total silencio hasta que ya es demasiado tarde para su presa.', 'Su sigilo ya es legendario entre quienes han sobrevivido para contarlo.', 'Es el rey indiscutido de las sombras: nadie lo ve llegar.'], true);
addFamily('armaduratecno', 3, 'rayo', 'explorador', 'golpe', ['Prototipo de Armadura', 'Piloto de Armadura de Combate', 'Titán de Acero y Rayo'], ['Su armadura convierte a un simple mortal en una máquina de guerra.', 'Cada batalla perfecciona un poco más el ajuste entre su armadura y su cuerpo.', 'Ya no hay distinción entre el piloto y la máquina: son un único titán.'], true);
addFamily('genio', 3, 'fuego', 'brujo', 'arrasar', ['Genio Encerrado', 'Genio Liberado', 'Genio, Señor de los Tres Deseos'], ['Concede poder a quien lo libera... a cambio de un precio que rara vez se ve venir.', 'Cada deseo que concede le devuelve un poco más de su antigua libertad.', 'Nadie recuerda ya el precio real de sus tres deseos... hasta que es demasiado tarde.'], true);
addFamily('amazona', 2, 'viento', 'picaro', 'furia', ['Joven Amazona', 'Guerrera Amazona', 'Reina de las Amazonas'], ['Entrenada desde niña para no depender de nadie en la batalla.', 'Ha luchado en más batallas de las que puede contar sin perder ni una.', 'Gobierna a las Amazonas con la misma independencia que le enseñaron de niña.'], true);
addFamily('bigfoot', 1, 'tierra', 'campeon', 'golpe', ['Rastro en el Bosque', 'Bigfoot Solitario', 'Bigfoot, Leyenda del Bosque'], ['Pocos lo han visto, y menos aún han vivido para contarlo con detalle.', 'Cada avistamiento añade un capítulo más a su leyenda del bosque.', 'Es ya más mito que criatura, pero el bosque entero sabe que es real.'], true);
addFamily('nessie', 2, 'agua', 'campeon', 'escudo', ['Cría del Lago', 'Monstruo del Lago', 'Nessie, Leyenda de las Aguas Frías'], ['Ha esquivado a cazadores y curiosos durante siglos sin ser jamás atrapada.', 'Ha aprendido a esconderse de cazadores cada vez más decididos a encontrarla.', 'Su leyenda ha sobrevivido a siglos de curiosos sin que nadie logre atraparla.'], true);
addFamily('samurai', 2, 'rayo', 'picaro', 'furia', ['Aprendiz de Samurái', 'Samurái Errante', 'Maestro Espadachín del Trueno'], ['Su espada se mueve más rápido de lo que el ojo puede seguir.', 'Su espada se ha movido en tantos duelos que ya no necesita pensar antes de golpear.', 'Su corte es tan rápido como el propio trueno que lleva por nombre.'], true);
addFamily('hombrefuego', 1, 'fuego', 'brujo', 'debilitar', ['Chispa Viviente', 'Hombre de Fuego', 'Avatar de las Llamas'], ['Cada paso que da deja un rastro de brasas ardientes.', 'Las brasas que deja a su paso ya arden más tiempo que antes.', 'Es la llama misma hecha carne: nada que toca vuelve a ser lo mismo.'], true);
addFamily('sacerdote', 1, 'tierra', 'guru', 'curar', ['Acólito', 'Sacerdote Bendecido', 'Sumo Sacerdote de Texel'], ['Dedica su vida a curar a quienes protegen el reino.', 'Sus bendiciones han salvado a más soldados de los que puede recordar.', 'Es el guía espiritual de todo Texel, y su fe cura donde la magia común falla.'], true);
addFamily('thor', 3, 'rayo', 'campeon', 'golpe', ['Joven del Martillo', 'Guerrero de Asgard', 'Thor, Dios del Trueno'], ['Solo el digno puede levantar su martillo... y desatar la tormenta.', 'Cada batalla en Asgard fortalece más su brazo — y su martillo.', 'Solo él puede levantar el martillo, y solo él puede desatar la tormenta que trae.'], true);
addFamily('gladiador', 1, 'tierra', 'campeon', 'golpe', ['Esclavo de la Arena', 'Gladiador Veterano', 'Campeón del Coliseo'], ['Ha sobrevivido a cientos de combates ante multitudes sedientas de sangre.', 'Cada victoria en la arena le gana más respeto — y más enemigos.', 'Es el campeón indiscutido del coliseo, y las multitudes corean su nombre.'], true);
addFamily('hombrehielo', 1, 'agua', 'brujo', 'debilitar', ['Escarcha Viviente', 'Hombre de Hielo', 'Avatar del Invierno Eterno'], ['Congela todo lo que toca, incluso el ánimo de sus rivales.', 'El frío que desprende ya congela el aire a su alrededor.', 'Es el invierno eterno hecho carne: nada sobrevive mucho tiempo a su lado.'], true);
addFamily('odin', 3, 'rayo', 'guru', 'bendicion', ['Joven Vidente', 'Odín, el Errante', 'Odín, Padre de Todo'], ['Sacrificó un ojo por sabiduría, y con ella gobierna Asgard.', 'Cada viaje errante le enseña un secreto más del destino de los mundos.', 'Gobierna Asgard entero con la sabiduría que pagó con su propio ojo.'], true);
addFamily('sunwukong', 3, 'viento', 'picaro', 'furia', ['Mono de Piedra', 'Rey Mono', 'Sun Wukong, el Sabio Igualado al Cielo'], ['Su bastón puede crecer hasta el cielo... y su ingenio, aún más alto.', 'Su bastón crece más alto con cada batalla que libra.', 'Ni el cielo mismo ha logrado igualar su ingenio.'], true);
addFamily('leonhumanizado', 2, 'tierra', 'campeon', 'grito', ['Cachorro de León', 'Guerrero León', 'Rey de la Sabana Dorada'], ['Su rugido basta para que la manada entera se ponga en pie.', 'Su rugido ya reúne a toda la manada en un solo instante.', 'Gobierna la sabana dorada como el rey indiscutido que siempre fue.'], true);
addFamily('yeti', 2, 'agua', 'campeon', 'escudo', ['Cría de Yeti', 'Yeti de las Cumbres', 'Yeti, Señor de las Nieves Eternas'], ['Sobrevive donde nada más puede, en las cumbres más heladas de Texel.', 'Sobrevive en cumbres donde ninguna otra criatura se atreve a quedarse.', 'Es el señor indiscutido de las nieves eternas, y el frío le obedece.'], true);
addFamily('deerwoman', 2, 'tierra', 'picaro', 'aturdir', ['Joven del Bosque', 'Deer Woman', 'Deer Woman, Espíritu Vengador'], ['Atrae a quien le falta el respeto al bosque... y no todos vuelven.', 'Su presencia ya avisa a quienes le faltan el respeto al bosque.', 'Es el espíritu vengador del bosque: quien la ofende rara vez regresa.'], true);
addFamily('gatubela', 2, 'viento', 'picaro', 'aturdir', ['Aprendiz Felina', 'Gatúbela', 'Reina de los Tejados'], ['Se mueve entre las sombras de la ciudad sin dejar ni un solo rastro.', 'Se desliza entre los tejados de la ciudad sin dejar ni un solo sonido.', 'Gobierna los tejados de la ciudad como su propio reino secreto.'], true);
addFamily('afrodita', 3, 'agua', 'guru', 'bendicion', ['Doncella Nacida del Mar', 'Afrodita en Flor', 'Afrodita, Diosa del Amor'], ['Nació de la espuma del mar y con ella trajo la belleza al mundo.', 'Su belleza ya desarma tanto a aliados como a enemigos por igual.', 'Es la diosa del amor, y ningún corazón en Texel es inmune a su presencia.'], true);
addFamily('basajaun', 2, 'tierra', 'campeon', 'escudo', ['Joven Basajaun', 'Basajaun del Bosque', 'Basajaun, Señor de los Bosques Vascos'], ['Protege a los rebaños del bosque de cualquier peligro, incluso de los cazadores.', 'Vigila cada rebaño del bosque con paciencia inquebrantable.', 'Es el señor de los bosques vascos, y ningún cazador se atreve a desafiarlo.'], true);
addFamily('icaro', 1, 'viento', 'explorador', 'furia', ['Aprendiz de Alas de Cera', 'Ícaro en Vuelo', 'Ícaro, el que Desafió al Sol'], ['Voló más alto de lo que nadie creía posible... y pagó el precio por ello.', 'Cada vuelo lo lleva más alto de lo que sus alas de cera deberían soportar.', 'Desafió al sol mismo, y su leyenda vuela más alto de lo que él jamás llegó.'], true);
addFamily('orangutan', 1, 'tierra', 'campeon', 'golpe', ['Cría de Orangután', 'Orangután de la Selva', 'Sabio Orangután de la Jungla'], ['Tan fuerte como paciente, rara vez pelea sin motivo.', 'Su paciencia solo es superada por la fuerza que guarda para cuando de verdad la necesita.', 'Es el sabio indiscutido de la jungla, respetado por su fuerza y su calma.'], true);
addFamily('poseidon', 3, 'agua', 'campeon', 'grito', ['Joven del Tridente', 'Guardián de las Mareas', 'Poseidón, Señor de los Mares'], ['Con un golpe de su tridente puede calmar — o desatar — cualquier tormenta.', 'Su tridente ya agita mareas enteras con un solo golpe.', 'Es el señor de los mares, y ninguna tormenta se forma sin su voluntad.'], true);
addFamily('davyjones', 2, 'agua', 'brujo', 'debilitar', ['Marinero Maldito', 'Davy Jones, el Maldito', 'Davy Jones, Capitán del Abismo'], ['Su barco solo aparece cuando ya es demasiado tarde para escapar.', 'Su maldición se ha vuelto tan profunda como el abismo que ahora gobierna.', 'Es el capitán del abismo, y su barco solo aparece cuando ya no hay escapatoria.'], true);
addFamily('velociraptor', 1, 'tierra', 'picaro', 'furia', ['Cría de Velocirraptor', 'Velocirraptor Cazador', 'Líder de la Manada de Raptores'], ['Caza en manada, y para cuando lo ves, ya es tarde.', 'Su manada ha aprendido a cazar en perfecta coordinación bajo su liderazgo.', 'Es el líder indiscutido de la manada, y nadie escapa de su emboscada.'], true);
addFamily('hombrepez', 1, 'agua', 'explorador', 'debilitar', ['Joven Hombre Pez', 'Hombre Pez de las Profundidades', 'Ancestro de las Profundidades'], ['Respira bajo el agua tan fácil como tú respiras aire.', 'Ha explorado profundidades donde ningún otro ser humano ha logrado sobrevivir.', 'Es el ancestro de las profundidades, y el mar entero reconoce su linaje.'], true);
addFamily('bastet', 2, 'fuego', 'guru', 'curar', ['Gatita Sagrada', 'Sacerdotisa de Bastet', 'Bastet, Diosa Felina'], ['Protectora de los hogares, y de quien tenga la suerte de ganarse su favor.', 'Su templo recibe cada vez más ofrendas de quienes buscan su favor.', 'Es la diosa felina, y su bendición protege cada hogar que la honra.'], true);
addFamily('orcahumanoide', 2, 'agua', 'campeon', 'golpe', ['Joven Orca', 'Guerrera Orca', 'Matriarca de las Orcas'], ['Caza en manada y nunca deja a un miembro de su familia atrás.', 'Lidera a su manada en cacerías cada vez más coordinadas.', 'Es la matriarca de las orcas, y ningún miembro de su familia queda atrás jamás.'], true);
addFamily('mujerconejo', 1, 'tierra', 'picaro', 'aturdir', ['Joven Conejo', 'Mujer Conejo', 'Gran Coneja de la Luna'], ['Tan rápida que apenas la ves antes de que ya haya golpeado.', 'Su velocidad ya es casi imposible de seguir a simple vista.', 'Es la Gran Coneja de la Luna, y nadie logra anticipar su golpe.'], true);
addFamily('tiburonmartillo', 2, 'agua', 'picaro', 'furia', ['Grumete Martillo', 'Pirata Tiburón Martillo', 'Capitán de los Siete Mares'], ['Su cabeza en forma de martillo esconde un instinto asesino infalible.', 'Su instinto de pirata se ha vuelto tan afilado como su propia mordida.', 'Es el capitán indiscutido de los siete mares, y su bandera es temida en cada puerto.'], true);
addFamily('espantapajaros', 1, 'tierra', 'brujo', 'debilitar', ['Espantapájaros Roto', 'Espantapájaros Animado', 'Guardián del Campo Maldito'], ['Cobró vida una noche sin luna, y desde entonces vigila el campo.', 'Cada noche sin luna afianza un poco más su extraña vida.', 'Es el guardián del campo maldito, y nada cruza sus tierras sin su permiso.'], true);
addFamily('escorpionhumanoide', 2, 'tierra', 'picaro', 'veneno', ['Joven Escorpión', 'Guerrero Escorpión', 'Señor del Aguijón Mortal'], ['Su aguijón lleva un veneno que debilita hasta al rival más fuerte.', 'Su aguijón se ha vuelto tan letal que un solo roce basta para debilitar a cualquiera.', 'Es el señor del aguijón mortal, y ningún antídoto conocido detiene su veneno.'], true);
addFamily('dientesdesable', 2, 'tierra', 'campeon', 'furia', ['Cría Dientes de Sable', 'Guerrero Dientes de Sable', 'Señor de la Era del Hielo'], ['Sus colmillos son más antiguos que cualquier leyenda de Texel.', 'Sus colmillos han derribado presas cada vez más grandes con el paso de los siglos.', 'Es el señor de la Era del Hielo, y su rugido aún resuena entre los glaciares.'], true);
addFamily('cangrejo', 1, 'agua', 'campeon', 'escudo', ['Cangrejo Pequeño', 'Cangrejo Acorazado', 'Rey Cangrejo de las Rocas'], ['Su caparazón es tan duro que pocas armas logran atravesarlo.', 'Su caparazón se ha endurecido tanto que ya ni las armas más afiladas lo atraviesan.', 'Es el rey cangrejo de las rocas, y su territorio en la costa no admite intrusos.'], true);
addFamily('zapador', 1, 'tierra', 'explorador', 'debilitar', ['Zapador Novato', 'Zapador de Túneles', 'Maestro Zapador de las Profundidades'], ['Conoce cada túnel bajo Texel mejor que su propia casa.', 'Cada túnel nuevo que excava conecta un rincón más de Texel bajo tierra.', 'Es el maestro indiscutido de las profundidades, y ningún mapa conoce mejor que él.'], true);
addFamily('plantacarnivora', 1, 'tierra', 'brujo', 'debilitar', ['Brote Carnívoro', 'Planta Carnívora', 'Devoradora de las Profundidades del Bosque'], ['Atrae a sus presas con un aroma dulce... y no las suelta jamás.', 'Su aroma ya atrae presas desde cada vez más lejos del bosque.', 'Es la devoradora de las profundidades del bosque, y nada que atrapa vuelve a salir.'], true);
addFamily('estatua', 2, 'tierra', 'campeon', 'escudo', ['Estatua Agrietada', 'Estatua Animada', 'Coloso de Piedra Viviente'], ['Permanece inmóvil durante siglos... hasta que alguien comete el error de despertarla.', 'Cada siglo inmóvil acumula más poder bajo su superficie de piedra.', 'Es un coloso de piedra viviente, y su despertar puede derribar murallas enteras.'], true);
addFamily('tortugahumanoide', 1, 'agua', 'campeon', 'escudo', ['Tortuga Guerrera Novata', 'Tortuga Guerrera Veterana', 'Maestra Tortuga del Caparazón Eterno'], ['Su caparazón ha detenido lanzas, flechas y hasta el paso del tiempo.', 'Su caparazón ha soportado incontables batallas sin ceder ni un centímetro.', 'Es la maestra del caparazón eterno, y ningún golpe conocido ha logrado quebrarla.'], true);

// --- Ronda de mitologías poco representadas (kappa/tanuki/tengu japoneses,
// baba yaga/huldra eslavo-nórdicas, naga hindú, chupacabra cryptid,
// ganesha/amaterasu/susanoo/anansi/tlaloc dioses de panteones distintos a
// los ya muy presentes griego/egipcio/nórdico) — 5 familias de cada tier,
// pedidas explícitamente por el usuario.
addFamily('kappa', 1, 'agua', 'picaro', 'aturdir', ['Kappa Juguetón', 'Kappa de las Corrientes', 'Kappa Maestro del Estanque'], ['Guarda un cuenco de agua sagrada en la cabeza: si se derrama, pierde todo su poder.', 'Ha aprendido a proteger su cuenco en pleno combate sin derramar ni una gota.', 'Ningún río de Texel se cruza sin su permiso, y su cuenco nunca se ha vaciado.'], true);
addFamily('tanuki', 1, 'tierra', 'explorador', 'debilitar', ['Tanuki Curioso', 'Tanuki Embaucador', 'Gran Tanuki de las Mil Formas'], ['Puede transformar su propio cuerpo para parecer cualquier cosa... o cualquiera.', 'Sus disfraces ya engañan hasta a quien conoce bien sus trucos.', 'Ha adoptado tantas formas que ya nadie recuerda cuál es la suya de verdad.'], true);
addFamily('salamandraignea', 1, 'fuego', 'brujo', 'arrasar', ['Cría de Salamandra', 'Salamandra de Brasas', 'Salamandra del Corazón del Volcán'], ['Nació en el centro de una hoguera y jamás ha sentido frío.', 'Las brasas por las que camina se reavivan solas a su paso.', 'Vive en el corazón de un volcán, donde ni la lava logra herirla.'], true);
addFamily('thunderbird', 1, 'rayo', 'explorador', 'furia', ['Cría de Thunderbird', 'Thunderbird Joven', 'Thunderbird de las Tormentas'], ['Cada aleteo suyo hace crepitar el aire con pequeñas chispas.', 'Ya es capaz de convocar una tormenta con solo alzar el vuelo.', 'Su vuelo desata tormentas que se ven llegar desde el otro lado de Texel.'], true);
addFamily('selkie', 1, 'agua', 'guru', 'purificar', ['Cría de Selkie', 'Selkie de las Mareas', 'Selkie Guardiana de su Piel'], ['Su piel de foca guarda toda su magia — y todo su secreto.', 'Ha aprendido a moverse entre ambas formas sin perder ni un ápice de su don.', 'Nadie que le arrebate su piel ha logrado quedársela para siempre.'], true);

addFamily('babayaga', 2, 'tierra', 'brujo', 'debilitar', ['Aprendiz de Baba Yaga', 'Baba Yaga Errante', 'Baba Yaga, Señora del Bosque Negro'], ['Vive en una choza que se mueve sobre patas de gallina, siempre un paso por delante.', 'Su mortero vuela cada vez más rápido entre los árboles del bosque.', 'Ningún viajero perdido en el bosque negro escapa a su maldición.'], true);


// ### Enemigos / mobs normales (14.3)
addMobFamily('arpia', 1, 'viento', 'picaro', 'furia', ['Arpía Joven', 'Arpía Chillona', 'Arpía Matriarca del Nido'], ['Ataca en bandada, chillando para desorientar a su presa.', 'Su chillido ya basta para desorientar a toda una banda de viajeros.', 'Gobierna el nido entero, y ninguna arpía ataca sin su permiso.'], true);
addMobFamily('dullahan', 2, 'rayo', 'brujo', 'debilitar', ['Jinete sin Cabeza Menor', 'Dullahan Cabalgante', 'Dullahan, Heraldo de la Muerte'], ['Lleva su propia cabeza bajo el brazo, y donde se detiene, alguien muere.', 'Su montura ya no se detiene ante nada que se cruce en su camino.', 'Es el heraldo de la muerte misma: nadie sobrevive a su visita.'], true);
addMobFamily('tengu', 1, 'viento', 'picaro', 'aturdir', ['Tengu Travieso', 'Tengu Guerrero', 'Gran Tengu de la Montaña'], ['Maestro del engaño y la espada a partes iguales.', 'Su espada ya corta tan rápido como su ingenio engaña.', 'Gobierna la montaña entera, y ningún guerrero se atreve a desafiarlo.'], true);
addMobFamily('goblin', 1, 'tierra', 'picaro', 'golpe', ['Goblin Novato', 'Goblin Saqueador', 'Jefe de la Horda Goblin'], ['Solo, es débil. En horda, es una plaga imparable.', 'Ya no ataca solo: siempre llega acompañado de su banda de saqueo.', 'Lidera a toda la horda, y ninguna aldea cercana está a salvo.'], true);
addMobFamily('trasgo', 1, 'viento', 'picaro', 'aturdir', ['Trasgo Menor', 'Trasgo Revoltoso', 'Trasgo Rey de las Travesuras'], ['Le divierte más molestar a los viajeros que robarles.', 'Sus travesuras ya son legendarias entre los viajeros del camino.', 'Es el rey de las travesuras, y ningún trasgo se atreve a superarlo.'], true);
addMobFamily('demonio', 2, 'fuego', 'brujo', 'debilitar', ['Demonio Menor', 'Demonio de las Llamas', 'Archidemonio del Abismo'], ['Cada trato que ofrece esconde una trampa que nadie ve venir.', 'Sus llamas ya consumen tanto como sus tratos envenenados.', 'Gobierna el abismo entero, y ningún trato con él sale gratis.']);
addMobFamily('esqueleto', 1, 'tierra', 'campeon', 'golpe', ['Esqueleto Andante', 'Esqueleto Guerrero', 'Comandante de Huesos'], ['Ni la muerte pudo con las ganas de pelear de este guerrero.', 'Ha peleado en tantas batallas que ya ni recuerda cuándo murió.', 'Comanda un ejército entero de huesos que nunca se cansan de luchar.']);
addMobFamily('draugr', 2, 'agua', 'campeon', 'escudo', ['Draugr Recién Alzado', 'Draugr Vikingo', 'Rey Draugr del Túmulo'], ['Se niega a abandonar el tesoro que custodió en vida.', 'Su fuerza como no-muerto ya supera la que tuvo en vida.', 'Gobierna su túmulo como un rey, y su tesoro jamás será robado.']);
addMobFamily('chupacabra', 1, 'viento', 'picaro', 'furia', ['Chupacabras Joven', 'Chupacabras Nocturno', 'Terror de los Rebaños'], ['Nadie lo ha visto de cerca... y quien lo hizo no vivió para describirlo.', 'Caza de noche, y nadie ha vivido para describir bien su forma.', 'Es el terror de todos los rebaños, y ningún corral está a salvo de noche.'], true);
addMobFamily('kitsune', 2, 'fuego', 'brujo', 'debilitar', ['Kitsune de Una Cola', 'Kitsune de Tres Colas', 'Kitsune de Nueve Colas'], ['Cuantas más colas gana, más poderosa (y más traviesa) se vuelve su magia.', 'Sus tres colas ya esconden trucos que ningún cazador logra prever.', 'Con sus nueve colas, su magia ya rivaliza con la de los espíritus mayores.']);
addMobFamily('momia', 1, 'tierra', 'brujo', 'debilitar', ['Momia Menor', 'Momia Vendada', 'Faraón Momificado'], ['Duerme durante siglos, hasta que alguien profana su tumba.', 'Sus vendas ya se mueven solas para proteger su tumba de intrusos.', 'Fue faraón en vida, y su maldición sigue gobernando su tumba en la muerte.']);
addMobFamily('orco', 1, 'tierra', 'campeon', 'furia', ['Orco Recluta', 'Orco Guerrero', 'Jefe de Guerra Orco'], ['Vive para la batalla, y muere feliz si es peleando.', 'Ha sobrevivido a tantas batallas que ya perdió la cuenta de las cicatrices.', 'Lidera a toda su tribu a la guerra, y ninguno se atreve a desobedecerlo.']);
addMobFamily('dementor', 2, 'viento', 'brujo', 'debilitar', ['Sombra Menor', 'Dementor Errante', 'Dementor, Ladrón de Almas'], ['Su sola presencia arranca hasta el último recuerdo feliz.', 'Ya vaga sin rumbo fijo, dejando tras de sí solo desesperanza.', 'Roba almas enteras, y nadie que lo cruza vuelve a ser el mismo.']);
addMobFamily('arana', 1, 'tierra', 'picaro', 'aturdir', ['Araña Pequeña', 'Araña Venenosa', 'Reina Araña del Nido'], ['Teje su telaraña en silencio, y espera con paciencia infinita.', 'Su veneno ya es lo bastante fuerte como para inmovilizar a cualquier presa.', 'Gobierna un nido entero, y ninguna araña teje sin su permiso.']);
addMobFamily('jabali', 1, 'tierra', 'campeon', 'furia', ['Jabatillo', 'Jabalí Salvaje', 'Gran Jabalí del Bosque Oscuro'], ['Embiste sin dudar a cualquiera que se cruce en su camino.', 'Sus colmillos ya son capaces de partir un escudo de un solo golpe.', 'Gobierna el bosque oscuro entero, y nada se atreve a cruzarse en su camino.']);
addMobFamily('gargola', 2, 'tierra', 'campeon', 'escudo', ['Gárgola Dormida', 'Gárgola Vigilante', 'Gárgola Ancestral de Piedra'], ['De día es solo piedra... de noche, otra cosa muy distinta.', 'Ya vigila cada noche sin descanso, convertida en piedra solo de día.', 'Es tan antigua como las propias ruinas que custodia, ancestral e implacable.']);
addMobFamily('gigante', 2, 'tierra', 'campeon', 'golpe', ['Joven Gigante', 'Gigante de las Colinas', 'Gigante de las Montañas Rotas'], ['Cada paso suyo hace temblar el suelo a su alrededor.', 'Su paso ya derriba árboles enteros al cruzar las colinas.', 'Ha roto montañas enteras a puñetazos, y nada se le resiste.']);
addMobFamily('ogro', 1, 'tierra', 'campeon', 'furia', ['Ogro Pequeño', 'Ogro Garrotero', 'Gran Ogro del Pantano'], ['No es el más listo, pero su garrote no necesita estrategia.', 'Su garrote ya ha aplastado más de una armadura sin esfuerzo.', 'Gobierna el pantano entero, y su garrote no ha conocido la derrota.']);
addMobFamily('satirosalvaje', 1, 'viento', 'picaro', 'furia', ['Sátiro Salvaje', 'Sátiro del Bosque Profundo', 'Señor de los Sátiros Salvajes'], ['Vive libre en el bosque, lejos de cualquier regla o fiesta civilizada.', 'Se adentra cada vez más en el bosque profundo, lejos de cualquier civilización.', 'Gobierna a todos los sátiros salvajes, y ninguna regla lo alcanza ya.']);
addMobFamily('troll', 2, 'tierra', 'campeon', 'golpe', ['Troll de Puente Menor', 'Troll de las Cavernas', 'Gran Troll Regenerador'], ['Sus heridas se cierran casi tan rápido como se las hacen.', 'En las cavernas, sus heridas ya se cierran casi al instante.', 'Su regeneración es tan grande que ninguna herida logra detenerlo por mucho tiempo.']);
addMobFamily('estirge', 1, 'viento', 'picaro', 'debilitar', ['Estirge Menor', 'Estirge Sedienta', 'Enjambre de Estirges'], ['Drena la vida de su presa gota a gota, sin prisa.', 'Su sed ya no se sacia con poco: drena a su presa hasta dejarla exhausta.', 'Ataca en enjambre, y ninguna presa escapa a tantas bocas sedientas a la vez.']);
addMobFamily('ondina', 2, 'agua', 'guru', 'debilitar', ['Ondina Menor', 'Ondina de las Corrientes', 'Gran Ondina del Río Eterno'], ['Su canto arrastra a los incautos hasta el fondo del río.', 'Su canto ya domina las corrientes enteras del río.', 'Gobierna el río eterno, y su canto no ha dejado de arrastrar incautos jamás.']);
addMobFamily('zombi', 1, 'tierra', 'campeon', 'furia', ['Zombi Recién Alzado', 'Zombi Putrefacto', 'Zombi Alfa de la Horda'], ['No siente dolor, no conoce el miedo, y no se detiene jamás.', 'Su cuerpo putrefacto ya no siente ni el más mínimo daño.', 'Lidera a toda la horda, y ningún zombi se detiene mientras él avance.']);
addMobFamily('banshee', 2, 'viento', 'brujo', 'debilitar', ['Banshee Susurrante', 'Banshee Lamentosa', 'Gran Banshee, Heraldo de la Muerte'], ['Su lamento anuncia una muerte antes de que ocurra.', 'Su lamento ya se escucha desde más lejos cada vez que se acerca la muerte.', 'Es la heraldo de la muerte misma, y su grito nunca se equivoca.']);
addMobFamily('lamia', 2, 'tierra', 'brujo', 'debilitar', ['Lamia Joven', 'Lamia Serpentina', 'Reina Lamia del Oasis Maldito'], ['Su mitad de serpiente esconde una mordedura tan letal como su encanto.', 'Su mordedura serpentina ya es tan letal como su propio encanto.', 'Gobierna el oasis maldito, y ni su encanto ni su veneno perdonan a nadie.']);
addMobFamily('hombrearena', 1, 'tierra', 'brujo', 'aturdir', ['Remolino de Arena', 'Hombre de Arena', 'Señor de las Dunas Eternas'], ['Se deshace y se reforma a voluntad, imposible de atrapar.', 'Ya se deshace y reforma tan rápido que ningún golpe logra alcanzarlo.', 'Gobierna las dunas eternas, y nadie ha logrado atraparlo jamás.']);
addMobFamily('babosa', 1, 'agua', 'campeon', 'debilitar', ['Babosa Pequeña', 'Babosa Gigante', 'Reina Babosa del Pantano'], ['Lenta pero imparable, su rastro disuelve casi cualquier cosa.', 'Su rastro ya disuelve metal y piedra por igual a su paso.', 'Gobierna el pantano entero, y su rastro no deja nada intacto tras de sí.']);
addMobFamily('sapo', 1, 'agua', 'guru', 'debilitar', ['Renacuajo', 'Sapo Venenoso', 'Gran Sapo del Pantano Sagrado'], ['Su piel segrega un veneno capaz de nublar los sentidos del rival.', 'Su veneno ya es lo bastante fuerte como para nublar los sentidos al instante.', 'Gobierna el pantano sagrado, y su veneno es reverenciado tanto como temido.']);
addMobFamily('serpiente', 1, 'tierra', 'picaro', 'debilitar', ['Serpiente Joven', 'Serpiente Venenosa', 'Gran Serpiente del Desierto'], ['Ataca en silencio, y su veneno hace el resto del trabajo.', 'Su veneno ya actúa antes de que la presa note siquiera la mordida.', 'Gobierna el desierto entero, y su veneno no ha fallado ni una sola vez.']);
addMobFamily('setahumanoide', 1, 'tierra', 'brujo', 'debilitar', ['Seta Pequeña', 'Seta Humanoide', 'Gran Seta Ancestral del Bosque'], ['Sus esporas dejan aturdido a cualquiera que se acerque demasiado.', 'Sus esporas ya cubren un área mucho mayor a su alrededor.', 'Es tan antigua como el propio bosque, y sus esporas no perdonan a ningún intruso.']);
addMobFamily('frankenstein', 2, 'rayo', 'campeon', 'furia', ['Criatura Recién Cosida', 'Criatura de Frankenstein', 'Monstruo Perfeccionado'], ['Cosida a partir de partes de otros, cobró vida gracias a un rayo.', 'Cada nueva parte cosida la hace más fuerte que la anterior.', 'Es la creación perfeccionada, y ningún rayo podría ya devolverla a la nada.']);
addMobFamily('hombreseisbrazos', 2, 'rayo', 'picaro', 'furia', ['Aprendiz de Seis Brazos', 'Guerrero de Seis Brazos', 'Maestro de las Seis Espadas'], ['Con seis brazos, nunca le falta un arma más que blandir.', 'Sus seis brazos ya se mueven en perfecta coordinación en pleno combate.', 'Es el maestro de las seis espadas, y ningún rival logra seguirle el ritmo.']);
addMobFamily('insectogigante', 1, 'tierra', 'picaro', 'aturdir', ['Insecto Pequeño', 'Insecto Gigante', 'Enjambre Alfa'], ['Solo es un insecto... hasta que ves cuántos son.', 'Ya ha crecido lo suficiente como para ser una amenaza por sí solo.', 'Lidera al enjambre entero, y ningún insecto se mueve sin su señal.']);

// ### Jefes / bosses (14.2) — combate único, sin evolución, fuera del pool de invocación.
addBoss('tifon', 'rayo', 'brujo', 'arrasar', 'Tifón, Padre de los Monstruos', 'El monstruo más temible de todos, capaz de desafiar a los propios dioses.', 'epico');
addBoss('quimera', 'fuego', 'campeon', 'arrasar', 'Quimera, la Bestia de Tres Cabezas', 'León, cabra y serpiente en un solo cuerpo, y fuego en cada aliento.', 'epico');
addBoss('garn', 'tierra', 'campeon', 'golpe', 'Garn, el Devorador de Piedra', 'Se alimenta de roca y escupe fragmentos capaces de atravesar una armadura.', 'raro');
addBoss('nian', 'fuego', 'campeon', 'furia', 'Nian, la Bestia del Año Nuevo', 'Solo el ruido y el color rojo lo mantienen alejado de los pueblos.', 'raro');
addBoss('tiamat', 'agua', 'brujo', 'arrasar', 'Tiamat, Madre del Caos', 'De su furia nacieron los primeros monstruos del mundo.', 'epico');
addBoss('surtr', 'fuego', 'campeon', 'golpe', 'Surtr, Señor de las Llamas de Muspelheim', 'Su espada ardiente se dice que incendiará los nueve mundos al final de los tiempos.', 'epico');
addBoss('behemoth', 'tierra', 'campeon', 'golpe', 'Behemoth, la Bestia Primigenia', 'Tan grande y antiguo que su sola existencia desafía toda lógica.', 'epico');
addBoss('medusa', 'tierra', 'brujo', 'debilitar', 'Medusa, la Gorgona de Mirada Pétrea', 'Una sola mirada a sus ojos convierte a cualquiera en piedra.', 'raro');
addBoss('apofis', 'tierra', 'brujo', 'arrasar', 'Apofis, la Serpiente del Caos', 'Cada noche intenta devorar al sol, y cada noche es derrotado — por poco.', 'epico');
addBoss('ammit', 'tierra', 'campeon', 'furia', 'Ammit, Devoradora de Corazones', 'Devora el corazón de quien no es digno de pasar al más allá.', 'raro');
addBoss('cthulhu', 'agua', 'brujo', 'arrasar', 'Cthulhu, el que Duerme en las Profundidades', 'Su despertar traería la locura a cualquiera que lo presencie.', 'epico');
addBoss('balrog', 'fuego', 'brujo', 'arrasar', 'Balrog, Demonio de Sombra y Fuego', 'Envuelto en llamas y sombra, ningún pasillo es lo bastante estrecho para detenerlo.', 'epico');
addBoss('leondenemea', 'tierra', 'campeon', 'golpe', 'León de Nemea, Piel Impenetrable', 'Ningún arma forjada por mortales ha logrado atravesar su piel.', 'raro');
addBoss('pajaroroc', 'viento', 'explorador', 'furia', 'Roc, el Ave que Oscurece el Cielo', 'Sus alas al abrirse tapan el sol entero sobre el desierto.', 'raro');
addBoss('torodecreta', 'tierra', 'campeon', 'furia', 'Toro de Creta, Furia Desatada', 'Arrasó campos enteros antes de que nadie lograra domarlo.', 'raro');
addBoss('basilisco', 'tierra', 'brujo', 'debilitar', 'Basilisco, Rey de las Serpientes', 'Su mirada mata, y su veneno no perdona ni a la piedra.', 'epico');
addBoss('ettin', 'tierra', 'campeon', 'golpe', 'Ettin, el Gigante de Dos Cabezas', 'Dos cabezas significan el doble de mal genio... y el doble de fuerza.', 'epico');
addBoss('gorgonas', 'tierra', 'brujo', 'debilitar', 'Las Gorgonas, Hermanas de Piedra', 'Donde una gorgona falla, sus hermanas terminan el trabajo.', 'epico');
addBoss('rakshasa', 'fuego', 'brujo', 'debilitar', 'Rakshasa, el Cambiante Maldito', 'Puede tomar cualquier forma para acercarse a su presa sin ser detectado.', 'epico');
addBoss('manticora', 'fuego', 'picaro', 'furia', 'Mantícora, la Devoradora de Hombres', 'Su cola de escorpión dispara espinas tan letales como su mordida.', 'epico');
addBoss('liche', 'rayo', 'brujo', 'debilitar', 'Liche, Señor de los No-Muertos', 'Selló su alma en un objeto oculto para no morir jamás de verdad.', 'epico');
addBoss('magooscuro', 'rayo', 'brujo', 'debilitar', 'El Mago Oscuro sin Nombre', 'Su nombre se ha borrado del recuerdo — pero su sombra sigue creciendo.', 'epico');
addBoss('loki', 'rayo', 'brujo', 'debilitar', 'Loki, el Dios del Engaño', 'Nunca se sabe si su ayuda es un regalo o el inicio de una trampa.', 'epico');
addBoss('joker', 'viento', 'picaro', 'aturdir', 'El Bufón de la Locura', 'Nadie entiende su chiste hasta que ya es demasiado tarde para reírse.', 'epico');
addBoss('acromantula', 'tierra', 'picaro', 'aturdir', 'Acromántula, Madre de la Colonia', 'Donde hay una, hay cientos más esperando entre las sombras.', 'epico');
addBoss('wendigo', 'viento', 'brujo', 'furia', 'Wendigo, Hambre sin Fin', 'Cuanto más devora, más hambriento se vuelve — nunca se sacia.', 'epico');
addBoss('mantisreligiosa', 'viento', 'picaro', 'furia', 'Mantis, la Segadora Silenciosa', 'Espera inmóvil durante horas... y ataca en una fracción de segundo.', 'epico');

// Jefes de las 6 zonas ORIGINALES: al principio usaban luchadores jugables
// (topo_infrecuente, nigro_raro, lagarto_epico, etc.) como jefe de zona, lo
// que violaba la regla de "ni jefes ni enemigos de mapa pueden ser
// criaturas jugables". Estos 6 los sustituyen, uno por zona, con la misma
// rareza aproximada que tenían antes.
addBoss('guardianbosque', 'tierra', 'campeon', 'escudo', 'Guardián del Bosque Ancestral', 'Un espíritu milenario que protege cada árbol de la Linde del Bosque.', 'comun');
addBoss('brujapantano', 'agua', 'brujo', 'debilitar', 'Bruja del Pantano Eterno', 'Conoce cada raíz y cada sombra del Pantano Oscuro, y las usa contra los intrusos.', 'infrecuente');
addBoss('colosocristal', 'tierra', 'campeon', 'golpe', 'Coloso de Cristal', 'Sus puños de cuarzo han sepultado a más de un intruso en las Cuevas de Cristal.', 'raro');
addBoss('titanhielo', 'agua', 'campeon', 'escudo', 'Titán de Hielo Eterno', 'Ni la escalada más dura prepara a nadie para enfrentarse a él en la cima de los Picos Helados.', 'raro');
addBoss('reyruinas', 'tierra', 'brujo', 'debilitar', 'Rey Espectral de las Ruinas', 'Gobierna las Ruinas Abisales desde un trono que se desmorona junto con su reino.', 'raro');
addBoss('dragonguarida', 'fuego', 'campeon', 'escudo', 'Dracorex, Señor de la Guarida', 'El dragón más temido de Texel, dueño absoluto de su Guarida.', 'epico');

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
  { id: 'aldea_nian', name: 'Aldea del Año Nuevo', emoji: '🧨', color: '#4a2f2f', pool: ['chupacabras_raro', 'orco_raro', 'boss_nian'] },
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
  { id: 'abismo_ojos', name: 'Abismo de los Cien Ojos', emoji: '👁️', color: '#1f2a3a', pool: ['troll_epico', 'gigante_epico', 'boss_tifon'] },
  { id: 'cima_quimerica', name: 'Cima Quimérica', emoji: '🔥', color: '#4a2a1f', pool: ['dullahan_epico', 'hombreseisbrazos_epico', 'boss_quimera'] },
  { id: 'caos_primordial', name: 'Caos Primordial', emoji: '🌊', color: '#1f3a4a', pool: ['kitsune_epico', 'banshee_epico', 'boss_tiamat'] },
  { id: 'forja_fin', name: 'Forja del Fin del Mundo', emoji: '⚒️', color: '#4a2414', pool: ['demonio_epico', 'gargola_epico', 'boss_surtr'] },
  { id: 'llanura_titan', name: 'Llanura del Titán', emoji: '🦣', color: '#3a3424', pool: ['gigante_epico', 'troll_epico', 'boss_behemoth'] },
  { id: 'templo_eclipse', name: 'Templo del Sol Eclipsado', emoji: '🌑', color: '#241f3a', pool: ['dementor_epico', 'ondina_epico', 'boss_apofis'] },
  { id: 'fosa_rlyeh', name: "Fosa de R'lyeh", emoji: '🐙', color: '#1f2a2a', pool: ['lamia_epico', 'kitsune_epico', 'boss_cthulhu'] },
  { id: 'minas_sinfondo', name: 'Minas Sin Fondo', emoji: '⛏️', color: '#3a1414', pool: ['demonio_epico', 'frankenstein_epico', 'boss_balrog'] },
  { id: 'palacio_espejos', name: 'Palacio de Espejos', emoji: '🪞', color: '#3a2a4a', pool: ['dullahan_epico', 'hombreseisbrazos_epico', 'boss_rakshasa'] },
  { id: 'necropolis', name: 'Necrópolis Eterna', emoji: '💀', color: '#242424', pool: ['draugr_epico', 'banshee_epico', 'boss_liche'] },
  { id: 'torre_prohibida', name: 'Torre Prohibida', emoji: '🏰', color: '#2a1f3a', pool: ['gargola_epico', 'dementor_epico', 'boss_magooscuro'] },
  { id: 'salon_enganos', name: 'Salón de los Engaños', emoji: '🎭', color: '#3a2424', pool: ['troll_epico', 'gigante_epico', 'boss_loki'] },
];
const STAGES_PER_ZONE = 8;
const STAGE_ENERGY_COST = 6;

const CRYSTALS = {
  pixite: { label: 'Cristal Pixite', color: '#a8815a', icon: '🟤', rates: { comun: 0.55, infrecuente: 0.30, raro: 0.12, epico: 0.025, legendario: 0.005 } },
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
  pluma_fenix: { label: 'Pluma Fénix', icon: '🪶', desc: 'Revive a un luchador caído con el 50% de su vida.', revivePct: 0.5, price: 12, currency: 'gemas' },
};

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
function fighterXpToNext(level) { return Math.floor(20 * Math.pow(level, 1.5)); }
