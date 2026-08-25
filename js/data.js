// Datos estáticos: elementos, clases, rareza, luchadores, zonas y habilidades.

// Sistema de rareza igual que D.o.T.: 5 escalones (Común/Infrecuente/Raro/Épico/Legendario).
// Cada luchador evoluciona exactamente 2 veces (3 formas), pero según su "tier" de
// partida ocupa un tramo distinto de esta escalera de 5 — solo los que arrancan en
// Raro (tier 3) llegan a Legendario; ver comentario sobre FIGHTERS más abajo.
const RARITIES = [
  { id: 'comun', label: 'Común', color: '#a8a8a0', glow: 'rgba(168,168,160,0.55)', mult: 1.0 },
  { id: 'infrecuente', label: 'Infrecuente', color: '#4caf6b', glow: 'rgba(76,175,107,0.55)', mult: 1.5 },
  { id: 'raro', label: 'Raro', color: '#3f9fe0', glow: 'rgba(63,159,224,0.6)', mult: 2.2 },
  { id: 'epico', label: 'Épico', color: '#a463e0', glow: 'rgba(164,99,224,0.65)', mult: 3.2 },
  { id: 'legendario', label: 'Legendario', color: '#e8a23c', glow: 'rgba(232,162,60,0.75)', mult: 4.6 },
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
//   Tier 1 (topo, heraldo):            Común → Infrecuente → Raro
//   Tier 2 (triton, vidente):          Infrecuente → Raro → Épico
//   Tier 3 (ascua, nigro, lagarto,
//           duende, chispa):           Raro → Épico → Legendario
const FIGHTERS = [
  // --- Tier 3: llegan a Legendario ---
  { id: 'ascua_raro', name: 'Cachorro de Ascua', element: 'fuego', class: 'campeon', rarity: 'raro', family: 'ascua', evolvesTo: 'ascua_epico', skillId: 'escudo' },
  { id: 'ascua_epico', name: 'Fénix Centinela', element: 'fuego', class: 'campeon', rarity: 'epico', family: 'ascua', evolvesTo: 'ascua_legendario', skillId: 'escudo' },
  { id: 'ascua_legendario', name: 'Drakón Adulto de Fuego', element: 'fuego', class: 'campeon', rarity: 'legendario', family: 'ascua', evolvesTo: null, skillId: 'escudo', image: 'ascua_legendario.png' },

  { id: 'nigro_raro', name: 'Cría de las Mareas', element: 'agua', class: 'brujo', rarity: 'raro', family: 'nigro', evolvesTo: 'nigro_epico', skillId: 'arrasar' },
  { id: 'nigro_epico', name: 'Nigromante de las Mareas', element: 'agua', class: 'brujo', rarity: 'epico', family: 'nigro', evolvesTo: 'nigro_legendario', skillId: 'arrasar' },
  { id: 'nigro_legendario', name: 'Señor del Maelström', element: 'agua', class: 'brujo', rarity: 'legendario', family: 'nigro', evolvesTo: null, skillId: 'arrasar' },

  { id: 'lagarto_raro', name: 'Lagarto de Cuarzo', element: 'tierra', class: 'explorador', rarity: 'raro', family: 'lagarto', evolvesTo: 'lagarto_epico', skillId: 'debilitar' },
  { id: 'lagarto_epico', name: 'Guardián de Obsidiana', element: 'tierra', class: 'explorador', rarity: 'epico', family: 'lagarto', evolvesTo: 'lagarto_legendario', skillId: 'debilitar' },
  { id: 'lagarto_legendario', name: 'Monarca de Piedra Negra', element: 'tierra', class: 'explorador', rarity: 'legendario', family: 'lagarto', evolvesTo: null, skillId: 'debilitar' },

  { id: 'duende_raro', name: 'Duende del Vendaval', element: 'viento', class: 'picaro', rarity: 'raro', family: 'duende', evolvesTo: 'duende_epico', skillId: 'furia' },
  { id: 'duende_epico', name: 'Sombra del Ciclón', element: 'viento', class: 'picaro', rarity: 'epico', family: 'duende', evolvesTo: 'duende_legendario', skillId: 'furia' },
  { id: 'duende_legendario', name: 'Titán de las Corrientes', element: 'viento', class: 'picaro', rarity: 'legendario', family: 'duende', evolvesTo: null, skillId: 'furia' },

  { id: 'chispa_raro', name: 'Chispa Errante', element: 'rayo', class: 'guru', rarity: 'raro', family: 'chispa', evolvesTo: 'chispa_epico', skillId: 'bendicion' },
  { id: 'chispa_epico', name: 'Oráculo de Tormenta', element: 'rayo', class: 'guru', rarity: 'epico', family: 'chispa', evolvesTo: 'chispa_legendario', skillId: 'bendicion' },
  { id: 'chispa_legendario', name: 'Tirano de la Tormenta', element: 'rayo', class: 'guru', rarity: 'legendario', family: 'chispa', evolvesTo: null, skillId: 'bendicion' },

  // --- Tier 2: llegan a Épico ---
  { id: 'triton_infrecuente', name: 'Renacuajo Ágil', element: 'agua', class: 'explorador', rarity: 'infrecuente', family: 'triton', evolvesTo: 'triton_raro', skillId: 'debilitar' },
  { id: 'triton_raro', name: 'Tritón Errante', element: 'agua', class: 'explorador', rarity: 'raro', family: 'triton', evolvesTo: 'triton_epico', skillId: 'debilitar' },
  { id: 'triton_epico', name: 'Tritón Abisal', element: 'agua', class: 'explorador', rarity: 'epico', family: 'triton', evolvesTo: null, skillId: 'debilitar' },

  { id: 'vidente_infrecuente', name: 'Aprendiz de Cenizas', element: 'fuego', class: 'guru', rarity: 'infrecuente', family: 'vidente', evolvesTo: 'vidente_raro', skillId: 'curar' },
  { id: 'vidente_raro', name: 'Vidente de Cenizas', element: 'fuego', class: 'guru', rarity: 'raro', family: 'vidente', evolvesTo: 'vidente_epico', skillId: 'curar' },
  { id: 'vidente_epico', name: 'Profeta de Brasas', element: 'fuego', class: 'guru', rarity: 'epico', family: 'vidente', evolvesTo: null, skillId: 'curar' },

  // --- Tier 1: llegan a Raro ---
  { id: 'topo_comun', name: 'Topo Acorazado', element: 'tierra', class: 'campeon', rarity: 'comun', family: 'topo', evolvesTo: 'topo_infrecuente', skillId: 'golpe' },
  { id: 'topo_infrecuente', name: 'Topo de Granito', element: 'tierra', class: 'campeon', rarity: 'infrecuente', family: 'topo', evolvesTo: 'topo_raro', skillId: 'golpe' },
  { id: 'topo_raro', name: 'Coloso de Raíces', element: 'tierra', class: 'campeon', rarity: 'raro', family: 'topo', evolvesTo: null, skillId: 'golpe' },

  { id: 'heraldo_comun', name: 'Heraldo Menor', element: 'rayo', class: 'brujo', rarity: 'comun', family: 'heraldo', evolvesTo: 'heraldo_infrecuente', skillId: 'aturdir' },
  { id: 'heraldo_infrecuente', name: 'Heraldo del Relámpago', element: 'rayo', class: 'brujo', rarity: 'infrecuente', family: 'heraldo', evolvesTo: 'heraldo_raro', skillId: 'aturdir' },
  { id: 'heraldo_raro', name: 'Heraldo del Trueno', element: 'rayo', class: 'brujo', rarity: 'raro', family: 'heraldo', evolvesTo: null, skillId: 'aturdir' },
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
const XP_LEVEL_CAP = 40;
function fighterXpToNext(level) { return Math.floor(20 * Math.pow(level, 1.5)); }
