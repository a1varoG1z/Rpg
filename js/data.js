// Datos estáticos: elementos, clases, rareza, luchadores, zonas y habilidades.

// Sistema de rareza igual que D.o.T.: 3 escalones (Común/Raro/Legendario).
// La mayoría de familias evolucionan por las 3; algunas se quedan en Raro.
const RARITIES = [
  { id: 'comun', label: 'Común', color: '#a8a8a0', glow: 'rgba(168,168,160,0.55)', mult: 1.0 },
  { id: 'raro', label: 'Raro', color: '#3f9fe0', glow: 'rgba(63,159,224,0.6)', mult: 2.1 },
  { id: 'legendario', label: 'Legendario', color: '#e8a23c', glow: 'rgba(232,162,60,0.75)', mult: 3.8 },
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
const FIGHTERS = [
  // --- Familias principales (Común → Raro → Legendario), una por elemento ---
  { id: 'ascua_comun', name: 'Cachorro de Ascua', element: 'fuego', class: 'campeon', rarity: 'comun', family: 'ascua', evolvesTo: 'ascua_raro', skillId: 'escudo' },
  { id: 'ascua_raro', name: 'Fénix Centinela', element: 'fuego', class: 'campeon', rarity: 'raro', family: 'ascua', evolvesTo: 'ascua_legendario', skillId: 'escudo' },
  { id: 'ascua_legendario', name: 'Drakón Adulto de Fuego', element: 'fuego', class: 'campeon', rarity: 'legendario', family: 'ascua', evolvesTo: null, skillId: 'escudo', image: 'ascua_legendario.png' },

  { id: 'nigro_comun', name: 'Cría de las Mareas', element: 'agua', class: 'brujo', rarity: 'comun', family: 'nigro', evolvesTo: 'nigro_raro', skillId: 'arrasar' },
  { id: 'nigro_raro', name: 'Nigromante de las Mareas', element: 'agua', class: 'brujo', rarity: 'raro', family: 'nigro', evolvesTo: 'nigro_legendario', skillId: 'arrasar' },
  { id: 'nigro_legendario', name: 'Señor del Maelström', element: 'agua', class: 'brujo', rarity: 'legendario', family: 'nigro', evolvesTo: null, skillId: 'arrasar' },

  { id: 'lagarto_comun', name: 'Lagarto de Cuarzo', element: 'tierra', class: 'explorador', rarity: 'comun', family: 'lagarto', evolvesTo: 'lagarto_raro', skillId: 'debilitar' },
  { id: 'lagarto_raro', name: 'Guardián de Obsidiana', element: 'tierra', class: 'explorador', rarity: 'raro', family: 'lagarto', evolvesTo: 'lagarto_legendario', skillId: 'debilitar' },
  { id: 'lagarto_legendario', name: 'Monarca de Piedra Negra', element: 'tierra', class: 'explorador', rarity: 'legendario', family: 'lagarto', evolvesTo: null, skillId: 'debilitar' },

  { id: 'duende_comun', name: 'Duende del Vendaval', element: 'viento', class: 'picaro', rarity: 'comun', family: 'duende', evolvesTo: 'duende_raro', skillId: 'furia' },
  { id: 'duende_raro', name: 'Sombra del Ciclón', element: 'viento', class: 'picaro', rarity: 'raro', family: 'duende', evolvesTo: 'duende_legendario', skillId: 'furia' },
  { id: 'duende_legendario', name: 'Titán de las Corrientes', element: 'viento', class: 'picaro', rarity: 'legendario', family: 'duende', evolvesTo: null, skillId: 'furia' },

  { id: 'chispa_comun', name: 'Chispa Errante', element: 'rayo', class: 'guru', rarity: 'comun', family: 'chispa', evolvesTo: 'chispa_raro', skillId: 'bendicion' },
  { id: 'chispa_raro', name: 'Oráculo de Tormenta', element: 'rayo', class: 'guru', rarity: 'raro', family: 'chispa', evolvesTo: 'chispa_legendario', skillId: 'bendicion' },
  { id: 'chispa_legendario', name: 'Tirano de la Tormenta', element: 'rayo', class: 'guru', rarity: 'legendario', family: 'chispa', evolvesTo: null, skillId: 'bendicion' },

  // --- Familias secundarias: no todas llegan a Legendario ---
  { id: 'triton_comun', name: 'Renacuajo Ágil', element: 'agua', class: 'explorador', rarity: 'comun', family: 'triton', evolvesTo: 'triton_raro', skillId: 'debilitar' },
  { id: 'triton_raro', name: 'Tritón Errante', element: 'agua', class: 'explorador', rarity: 'raro', family: 'triton', evolvesTo: null, skillId: 'debilitar' },

  { id: 'topo_comun', name: 'Topo Acorazado', element: 'tierra', class: 'campeon', rarity: 'comun', family: 'topo', evolvesTo: 'topo_raro', skillId: 'golpe' },
  { id: 'topo_raro', name: 'Coloso de Raíces', element: 'tierra', class: 'campeon', rarity: 'raro', family: 'topo', evolvesTo: null, skillId: 'golpe' },

  { id: 'vidente_comun', name: 'Aprendiz de Cenizas', element: 'fuego', class: 'guru', rarity: 'comun', family: 'vidente', evolvesTo: 'vidente_raro', skillId: 'curar' },
  { id: 'vidente_raro', name: 'Vidente de Cenizas', element: 'fuego', class: 'guru', rarity: 'raro', family: 'vidente', evolvesTo: null, skillId: 'curar' },

  { id: 'heraldo_comun', name: 'Heraldo Menor', element: 'rayo', class: 'brujo', rarity: 'comun', family: 'heraldo', evolvesTo: 'heraldo_raro', skillId: 'aturdir' },
  { id: 'heraldo_raro', name: 'Heraldo del Trueno', element: 'rayo', class: 'brujo', rarity: 'raro', family: 'heraldo', evolvesTo: null, skillId: 'aturdir' },
];
function fighterDef(id) { return FIGHTERS.find(f => f.id === id); }

const ZONES = [
  { id: 'bosque', name: 'Linde del Bosque', emoji: '🌲', color: '#2f4f2f', pool: ['topo_comun', 'duende_comun', 'topo_raro'] },
  { id: 'pantano', name: 'Pantano Oscuro', emoji: '🐊', color: '#3a4a2f', pool: ['triton_comun', 'lagarto_comun', 'nigro_comun'] },
  { id: 'cuevas', name: 'Cuevas de Cristal', emoji: '💎', color: '#2f3a4a', pool: ['lagarto_comun', 'chispa_comun', 'lagarto_raro'] },
  { id: 'picos', name: 'Picos Helados', emoji: '❄️', color: '#2f4650', pool: ['triton_raro', 'duende_raro', 'chispa_raro'] },
  { id: 'ruinas', name: 'Ruinas Abisales', emoji: '💀', color: '#3a2f45', pool: ['heraldo_comun', 'lagarto_legendario', 'heraldo_raro'] },
  { id: 'guarida', name: 'Guarida del Dragón', emoji: '🐉', color: '#4a2f2f', pool: ['vidente_raro', 'vidente_comun', 'ascua_legendario'] },
];
const STAGES_PER_ZONE = 8;
const STAGE_ENERGY_COST = 6;

const CRYSTALS = {
  pixite: { label: 'Cristal Pixite', color: '#a8815a', icon: '🟤', rates: { comun: 0.80, raro: 0.19, legendario: 0.01 } },
  voxite: { label: 'Cristal Voxite', color: '#c9c9d9', icon: '⚪', rates: { comun: 0.25, raro: 0.60, legendario: 0.15 } },
  doxite: { label: 'Cristal Doxite', color: '#e8c23c', icon: '🟡', rates: { comun: 0, raro: 0.40, legendario: 0.60 } },
};

const GEAR_SLOTS = {
  arma: { label: 'Arma', icon: '🗡️', names: { comun: 'Daga Roma', raro: 'Hoja Rúnica', legendario: 'Colmillo Ancestral' }, stat: 'atk' },
  armadura: { label: 'Armadura', icon: '🥋', names: { comun: 'Cota Sencilla', raro: 'Placas Rúnicas', legendario: 'Coraza Ancestral' }, stat: 'def' },
};

const MAX_ENERGY = 60;
const ENERGY_REGEN_SECONDS = 45; // 1 punto cada 45s
const BAND_ROWS = 3;
const BAND_COLS = 3;
const XP_LEVEL_CAP = 40;
function fighterXpToNext(level) { return Math.floor(20 * Math.pow(level, 1.5)); }
