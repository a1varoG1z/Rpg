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

const SKILL_TYPES = {
  golpe: { name: 'Golpe Certero', kind: 'damage', mult: 2.0, target: 'single', desc: 'Un golpe demoledor a un enemigo.' },
  furia: { name: 'Furia Salvaje', kind: 'damage', mult: 1.5, target: 'single', selfBuff: { stat: 'atk', pct: 0.15, turns: 2 }, desc: 'Golpea con fuerza y se enardece.' },
  arrasar: { name: 'Arrasar', kind: 'damageRow', mult: 1.05, target: 'row', desc: 'Daño mágico a toda la fila enemiga.' },
  curar: { name: 'Bendición Sanadora', kind: 'heal', pct: 0.3, target: 'self', desc: 'Recupera parte de su propia vida.' },
  bendicion: { name: 'Aura Vital', kind: 'healRow', pct: 0.16, target: 'row-ally', desc: 'Cura a toda su fila.' },
  escudo: { name: 'Muro de Escamas', kind: 'buffSelf', stat: 'def', pct: 0.35, turns: 3, desc: 'Refuerza su propia defensa.' },
  grito: { name: 'Grito de Guerra', kind: 'buffRow', stat: 'atk', pct: 0.2, turns: 3, desc: 'Aumenta el ataque de su fila.' },
  debilitar: { name: 'Marca Débil', kind: 'debuff', stat: 'def', pct: 0.25, turns: 3, target: 'single', desc: 'Reduce la defensa de un enemigo.' },
  aturdir: { name: 'Onda de Trueno', kind: 'stun', turns: 1, chance: 0.65, target: 'single', desc: 'Puede aturdir a un enemigo.' },
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
  { id: 'ascua_raro', name: 'Cachorro de Ascua', element: 'fuego', class: 'campeon', rarity: 'raro', family: 'ascua', evolvesTo: 'ascua_epico', skillId: 'escudo' },
  { id: 'ascua_epico', name: 'Fénix Centinela', element: 'fuego', class: 'campeon', rarity: 'epico', family: 'ascua', evolvesTo: 'ascua_legendario', skillId: 'escudo' },
  { id: 'ascua_legendario', name: 'Drakón Adulto de Fuego', element: 'fuego', class: 'campeon', rarity: 'legendario', family: 'ascua', evolvesTo: null, skillId: 'escudo', image: 'ascua_legendario.png' },

  { id: 'nigro_raro', name: 'Cría de las Mareas', element: 'agua', class: 'brujo', rarity: 'raro', family: 'nigro', evolvesTo: 'nigro_epico', skillId: 'arrasar', image: 'nigro_raro.png' },
  { id: 'nigro_epico', name: 'Nigromante de las Mareas', element: 'agua', class: 'brujo', rarity: 'epico', family: 'nigro', evolvesTo: 'nigro_legendario', skillId: 'arrasar', image: 'nigro_epico.png' },
  { id: 'nigro_legendario', name: 'Señor del Maelström', element: 'agua', class: 'brujo', rarity: 'legendario', family: 'nigro', evolvesTo: null, skillId: 'arrasar', image: 'nigro_legendario.png' },

  { id: 'lagarto_raro', name: 'Lagarto de Cuarzo', element: 'tierra', class: 'explorador', rarity: 'raro', family: 'lagarto', evolvesTo: 'lagarto_epico', skillId: 'debilitar', image: 'lagarto_raro.png' },
  { id: 'lagarto_epico', name: 'Guardián de Obsidiana', element: 'tierra', class: 'explorador', rarity: 'epico', family: 'lagarto', evolvesTo: 'lagarto_legendario', skillId: 'debilitar', image: 'lagarto_epico.png' },
  { id: 'lagarto_legendario', name: 'Monarca de Piedra Negra', element: 'tierra', class: 'explorador', rarity: 'legendario', family: 'lagarto', evolvesTo: null, skillId: 'debilitar', image: 'lagarto_legendario.png' },

  { id: 'duende_raro', name: 'Duende del Vendaval', element: 'viento', class: 'picaro', rarity: 'raro', family: 'duende', evolvesTo: 'duende_epico', skillId: 'furia', image: 'duende_raro.png' },
  { id: 'duende_epico', name: 'Sombra del Ciclón', element: 'viento', class: 'picaro', rarity: 'epico', family: 'duende', evolvesTo: 'duende_legendario', skillId: 'furia', image: 'duende_epico.png' },
  { id: 'duende_legendario', name: 'Titán de las Corrientes', element: 'viento', class: 'picaro', rarity: 'legendario', family: 'duende', evolvesTo: null, skillId: 'furia', image: 'duende_legendario.png' },

  { id: 'chispa_raro', name: 'Chispa Errante', element: 'rayo', class: 'guru', rarity: 'raro', family: 'chispa', evolvesTo: 'chispa_epico', skillId: 'bendicion', image: 'chispa_raro.png' },
  { id: 'chispa_epico', name: 'Oráculo de Tormenta', element: 'rayo', class: 'guru', rarity: 'epico', family: 'chispa', evolvesTo: 'chispa_legendario', skillId: 'bendicion', image: 'chispa_epico.png' },
  { id: 'chispa_legendario', name: 'Tirano de la Tormenta', element: 'rayo', class: 'guru', rarity: 'legendario', family: 'chispa', evolvesTo: null, skillId: 'bendicion', image: 'chispa_legendario.png' },

  // --- Tier 3 humanizados ---
  { id: 'piroman_raro', name: 'Aprendiz de las Pavesas', element: 'fuego', class: 'brujo', rarity: 'raro', family: 'piroman', evolvesTo: 'piroman_epico', skillId: 'debilitar', image: 'piroman_raro.png' },
  { id: 'piroman_epico', name: 'Piromante Maldito', element: 'fuego', class: 'brujo', rarity: 'epico', family: 'piroman', evolvesTo: 'piroman_legendario', skillId: 'debilitar', image: 'piroman_epico.png' },
  { id: 'piroman_legendario', name: 'Señor de las Cenizas Eternas', element: 'fuego', class: 'brujo', rarity: 'legendario', family: 'piroman', evolvesTo: null, skillId: 'debilitar', image: 'piroman_legendario.png' },

  { id: 'brisa_raro', name: 'Exploradora de las Corrientes', element: 'viento', class: 'explorador', rarity: 'raro', family: 'brisa', evolvesTo: 'brisa_epico', skillId: 'debilitar' },
  { id: 'brisa_epico', name: 'Arquera de las Nubes', element: 'viento', class: 'explorador', rarity: 'epico', family: 'brisa', evolvesTo: 'brisa_legendario', skillId: 'debilitar' },
  { id: 'brisa_legendario', name: 'Soberana del Vendaval', element: 'viento', class: 'explorador', rarity: 'legendario', family: 'brisa', evolvesTo: null, skillId: 'debilitar' },

  // --- Tier 2: llegan a Épico ---
  { id: 'triton_infrecuente', name: 'Renacuajo Ágil', element: 'agua', class: 'explorador', rarity: 'infrecuente', family: 'triton', evolvesTo: 'triton_raro', skillId: 'debilitar', image: 'triton_infrecuente.png' },
  { id: 'triton_raro', name: 'Tritón Errante', element: 'agua', class: 'explorador', rarity: 'raro', family: 'triton', evolvesTo: 'triton_epico', skillId: 'debilitar', image: 'triton_raro.png' },
  { id: 'triton_epico', name: 'Tritón Abisal', element: 'agua', class: 'explorador', rarity: 'epico', family: 'triton', evolvesTo: null, skillId: 'debilitar', image: 'triton_epico.png' },

  { id: 'vidente_infrecuente', name: 'Aprendiz de Cenizas', element: 'fuego', class: 'guru', rarity: 'infrecuente', family: 'vidente', evolvesTo: 'vidente_raro', skillId: 'curar', image: 'vidente_infrecuente.png' },
  { id: 'vidente_raro', name: 'Vidente de Cenizas', element: 'fuego', class: 'guru', rarity: 'raro', family: 'vidente', evolvesTo: 'vidente_epico', skillId: 'curar', image: 'vidente_raro.png' },
  { id: 'vidente_epico', name: 'Profeta de Brasas', element: 'fuego', class: 'guru', rarity: 'epico', family: 'vidente', evolvesTo: null, skillId: 'curar', image: 'vidente_epico.png' },

  // --- Tier 2 humanizados ---
  { id: 'marejada_infrecuente', name: 'Escudero de Coral', element: 'agua', class: 'campeon', rarity: 'infrecuente', family: 'marejada', evolvesTo: 'marejada_raro', skillId: 'grito', image: 'marejada_infrecuente.png' },
  { id: 'marejada_raro', name: 'Caballero de las Mareas', element: 'agua', class: 'campeon', rarity: 'raro', family: 'marejada', evolvesTo: 'marejada_epico', skillId: 'grito', image: 'marejada_raro.png' },
  { id: 'marejada_epico', name: 'Guardián del Abismo', element: 'agua', class: 'campeon', rarity: 'epico', family: 'marejada', evolvesTo: null, skillId: 'grito', image: 'marejada_epico.png' },

  { id: 'gea_infrecuente', name: 'Aprendiza de Gea', element: 'tierra', class: 'guru', rarity: 'infrecuente', family: 'gea', evolvesTo: 'gea_raro', skillId: 'curar' },
  { id: 'gea_raro', name: 'Chamana de Raíces', element: 'tierra', class: 'guru', rarity: 'raro', family: 'gea', evolvesTo: 'gea_epico', skillId: 'curar' },
  { id: 'gea_epico', name: 'Druida Ancestral', element: 'tierra', class: 'guru', rarity: 'epico', family: 'gea', evolvesTo: null, skillId: 'curar' },

  // --- Tier 1: llegan a Raro ---
  { id: 'topo_comun', name: 'Topo Acorazado', element: 'tierra', class: 'campeon', rarity: 'comun', family: 'topo', evolvesTo: 'topo_infrecuente', skillId: 'golpe', image: 'topo_comun.png' },
  { id: 'topo_infrecuente', name: 'Topo de Granito', element: 'tierra', class: 'campeon', rarity: 'infrecuente', family: 'topo', evolvesTo: 'topo_raro', skillId: 'golpe', image: 'topo_infrecuente.png' },
  { id: 'topo_raro', name: 'Coloso de Raíces', element: 'tierra', class: 'campeon', rarity: 'raro', family: 'topo', evolvesTo: null, skillId: 'golpe', image: 'topo_raro.png' },

  { id: 'heraldo_comun', name: 'Heraldo Menor', element: 'rayo', class: 'brujo', rarity: 'comun', family: 'heraldo', evolvesTo: 'heraldo_infrecuente', skillId: 'aturdir', image: 'heraldo_comun.png' },
  { id: 'heraldo_infrecuente', name: 'Heraldo del Relámpago', element: 'rayo', class: 'brujo', rarity: 'infrecuente', family: 'heraldo', evolvesTo: 'heraldo_raro', skillId: 'aturdir', image: 'heraldo_infrecuente.png' },
  { id: 'heraldo_raro', name: 'Heraldo del Trueno', element: 'rayo', class: 'brujo', rarity: 'raro', family: 'heraldo', evolvesTo: null, skillId: 'aturdir', image: 'heraldo_raro.png' },

  // --- Tier 1 humanizados ---
  { id: 'electro_comun', name: 'Corredor Eléctrico', element: 'rayo', class: 'explorador', rarity: 'comun', family: 'electro', evolvesTo: 'electro_infrecuente', skillId: 'debilitar' },
  { id: 'electro_infrecuente', name: 'Cazador de Tormentas', element: 'rayo', class: 'explorador', rarity: 'infrecuente', family: 'electro', evolvesTo: 'electro_raro', skillId: 'debilitar' },
  { id: 'electro_raro', name: 'Rastreador del Trueno', element: 'rayo', class: 'explorador', rarity: 'raro', family: 'electro', evolvesTo: null, skillId: 'debilitar' },

  { id: 'marina_comun', name: 'Grumete Marina', element: 'agua', class: 'picaro', rarity: 'comun', family: 'marina', evolvesTo: 'marina_infrecuente', skillId: 'furia' },
  { id: 'marina_infrecuente', name: 'Pirata de las Mareas', element: 'agua', class: 'picaro', rarity: 'infrecuente', family: 'marina', evolvesTo: 'marina_raro', skillId: 'furia' },
  { id: 'marina_raro', name: 'Corsaria Abisal', element: 'agua', class: 'picaro', rarity: 'raro', family: 'marina', evolvesTo: null, skillId: 'furia' },
];
function fighterDef(id) { return FIGHTERS.find(f => f.id === id); }

const ZONES = [
  { id: 'bosque', name: 'Linde del Bosque', emoji: '🌲', color: '#2f4f2f', pool: ['topo_comun', 'heraldo_comun', 'topo_infrecuente'] },
  { id: 'pantano', name: 'Pantano Oscuro', emoji: '🐊', color: '#3a4a2f', pool: ['triton_infrecuente', 'heraldo_infrecuente', 'nigro_raro'] },
  { id: 'cuevas', name: 'Cuevas de Cristal', emoji: '💎', color: '#2f3a4a', pool: ['lagarto_raro', 'vidente_infrecuente', 'lagarto_epico'] },
  { id: 'picos', name: 'Picos Helados', emoji: '❄️', color: '#2f4650', pool: ['triton_raro', 'chispa_raro', 'duende_epico'] },
  { id: 'ruinas', name: 'Ruinas Abisales', emoji: '💀', color: '#3a2f45', pool: ['heraldo_raro', 'vidente_raro', 'chispa_epico'] },
  { id: 'guarida', name: 'Guarida del Dragón', emoji: '🐉', color: '#4a2f2f', pool: ['vidente_epico', 'triton_epico', 'ascua_legendario'] },
];
const STAGES_PER_ZONE = 8;
const STAGE_ENERGY_COST = 6;

const CRYSTALS = {
  pixite: { label: 'Cristal Pixite', color: '#a8815a', icon: '🟤', rates: { comun: 0.55, infrecuente: 0.30, raro: 0.12, epico: 0.025, legendario: 0.005 } },
  voxite: { label: 'Cristal Voxite', color: '#c9c9d9', icon: '⚪', rates: { comun: 0.10, infrecuente: 0.30, raro: 0.40, epico: 0.17, legendario: 0.03 } },
  doxite: { label: 'Cristal Doxite', color: '#e8c23c', icon: '🟡', rates: { comun: 0, infrecuente: 0.05, raro: 0.30, epico: 0.45, legendario: 0.20 } },
};

const GEAR_SLOTS = {
  arma: { label: 'Arma', icon: '🗡️', names: { comun: 'Daga Roma', infrecuente: 'Espada Templada', raro: 'Hoja Rúnica', epico: 'Filo Encantado', legendario: 'Colmillo Ancestral' }, stat: 'atk' },
  armadura: { label: 'Armadura', icon: '🥋', names: { comun: 'Cota Sencilla', infrecuente: 'Cota Reforzada', raro: 'Placas Rúnicas', epico: 'Coraza Encantada', legendario: 'Coraza Ancestral' }, stat: 'def' },
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
