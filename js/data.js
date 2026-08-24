// Datos estáticos: elementos, clases, rareza, luchadores, zonas y habilidades.

const RARITIES = [
  { id: 'comun', label: 'Común', color: '#a8a8a0', glow: 'rgba(168,168,160,0.55)', mult: 1.0 },
  { id: 'infrecuente', label: 'Infrecuente', color: '#4caf50', glow: 'rgba(76,175,80,0.55)', mult: 1.35 },
  { id: 'raro', label: 'Raro', color: '#3f9fe0', glow: 'rgba(63,159,224,0.6)', mult: 1.8 },
  { id: 'epico', label: 'Épico', color: '#a463e0', glow: 'rgba(164,99,224,0.65)', mult: 2.4 },
  { id: 'legendario', label: 'Legendario', color: '#e8a23c', glow: 'rgba(232,162,60,0.75)', mult: 3.3 },
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
  golpe: { name: 'Golpe Certero', cooldown: 3, kind: 'damage', mult: 2.0, target: 'single', desc: 'Un golpe demoledor a un enemigo.' },
  furia: { name: 'Furia Salvaje', cooldown: 3, kind: 'damage', mult: 1.5, target: 'single', selfBuff: { stat: 'atk', pct: 0.15, turns: 2 }, desc: 'Golpea con fuerza y se enardece.' },
  arrasar: { name: 'Arrasar', cooldown: 4, kind: 'damageRow', mult: 1.05, target: 'row', desc: 'Daño mágico a toda la fila enemiga.' },
  curar: { name: 'Bendición Sanadora', cooldown: 4, kind: 'heal', pct: 0.3, target: 'self', desc: 'Recupera parte de su propia vida.' },
  bendicion: { name: 'Aura Vital', cooldown: 4, kind: 'healRow', pct: 0.16, target: 'row-ally', desc: 'Cura a toda su fila.' },
  escudo: { name: 'Muro de Escamas', cooldown: 3, kind: 'buffSelf', stat: 'def', pct: 0.35, turns: 3, desc: 'Refuerza su propia defensa.' },
  grito: { name: 'Grito de Guerra', cooldown: 3, kind: 'buffRow', stat: 'atk', pct: 0.2, turns: 3, desc: 'Aumenta el ataque de su fila.' },
  debilitar: { name: 'Marca Débil', cooldown: 3, kind: 'debuff', stat: 'def', pct: 0.25, turns: 3, target: 'single', desc: 'Reduce la defensa de un enemigo.' },
  aturdir: { name: 'Onda de Trueno', cooldown: 5, kind: 'stun', turns: 1, chance: 0.65, target: 'single', desc: 'Puede aturdir a un enemigo.' },
};

// family: agrupa forma base + evolución. evolvesTo: id de la forma evolucionada (o null).
const FIGHTERS = [
  { id: 'ascua_comun', name: 'Cachorro de Ascua', element: 'fuego', class: 'campeon', rarity: 'comun', family: 'ascua', evolvesTo: 'ascua_rara', skillId: 'escudo' },
  { id: 'ascua_rara', name: 'Fénix Centinela', element: 'fuego', class: 'campeon', rarity: 'raro', family: 'ascua', evolvesTo: null, skillId: 'escudo' },

  { id: 'triton_comun', name: 'Renacuajo Ágil', element: 'agua', class: 'explorador', rarity: 'comun', family: 'triton', evolvesTo: 'triton_rara', skillId: 'debilitar' },
  { id: 'triton_rara', name: 'Tritón Errante', element: 'agua', class: 'explorador', rarity: 'raro', family: 'triton', evolvesTo: null, skillId: 'debilitar' },

  { id: 'topo_comun', name: 'Topo Acorazado', element: 'tierra', class: 'campeon', rarity: 'comun', family: 'topo', evolvesTo: 'topo_rara', skillId: 'golpe' },
  { id: 'topo_rara', name: 'Coloso de Raíces', element: 'tierra', class: 'campeon', rarity: 'raro', family: 'topo', evolvesTo: null, skillId: 'golpe' },

  { id: 'duende_infre', name: 'Duende del Vendaval', element: 'viento', class: 'picaro', rarity: 'infrecuente', family: 'duende', evolvesTo: 'duende_epica', skillId: 'furia' },
  { id: 'duende_epica', name: 'Sombra del Ciclón', element: 'viento', class: 'picaro', rarity: 'epico', family: 'duende', evolvesTo: null, skillId: 'furia' },

  { id: 'chispa_infre', name: 'Chispa Errante', element: 'rayo', class: 'guru', rarity: 'infrecuente', family: 'chispa', evolvesTo: 'chispa_epica', skillId: 'bendicion' },
  { id: 'chispa_epica', name: 'Oráculo de Tormenta', element: 'rayo', class: 'guru', rarity: 'epico', family: 'chispa', evolvesTo: null, skillId: 'bendicion' },

  { id: 'lagarto_infre', name: 'Lagarto de Cuarzo', element: 'tierra', class: 'explorador', rarity: 'infrecuente', family: 'lagarto', evolvesTo: 'lagarto_epica', skillId: 'debilitar' },
  { id: 'lagarto_epica', name: 'Guardián de Obsidiana', element: 'tierra', class: 'explorador', rarity: 'epico', family: 'lagarto', evolvesTo: null, skillId: 'debilitar' },

  { id: 'nigro_rara', name: 'Nigromante de las Mareas', element: 'agua', class: 'brujo', rarity: 'raro', family: 'nigro', evolvesTo: 'nigro_legendaria', skillId: 'arrasar' },
  { id: 'nigro_legendaria', name: 'Señor del Maelström', element: 'agua', class: 'brujo', rarity: 'legendario', family: 'nigro', evolvesTo: null, skillId: 'arrasar' },

  { id: 'vidente_rara', name: 'Vidente de Cenizas', element: 'fuego', class: 'guru', rarity: 'raro', family: 'vidente', evolvesTo: 'vidente_legendaria', skillId: 'curar' },
  { id: 'vidente_legendaria', name: 'Profeta del Volcán', element: 'fuego', class: 'guru', rarity: 'legendario', family: 'vidente', evolvesTo: null, skillId: 'curar' },

  { id: 'heraldo_rara', name: 'Heraldo del Trueno', element: 'rayo', class: 'brujo', rarity: 'raro', family: 'heraldo', evolvesTo: 'heraldo_legendaria', skillId: 'aturdir' },
  { id: 'heraldo_legendaria', name: 'Tirano de la Tormenta', element: 'rayo', class: 'brujo', rarity: 'legendario', family: 'heraldo', evolvesTo: null, skillId: 'aturdir' },

  { id: 'titan_corrientes', name: 'Titán de las Corrientes', element: 'viento', class: 'campeon', rarity: 'legendario', family: 'titan_corrientes', evolvesTo: null, skillId: 'grito' },
  { id: 'monarca_piedra', name: 'Monarca de Piedra Negra', element: 'tierra', class: 'brujo', rarity: 'legendario', family: 'monarca_piedra', evolvesTo: null, skillId: 'arrasar' },
  { id: 'fantasma_profundo', name: 'Fantasma de las Profundidades', element: 'agua', class: 'picaro', rarity: 'legendario', family: 'fantasma_profundo', evolvesTo: null, skillId: 'furia' },
  { id: 'cazador_brasas', name: 'Cazador de Brasas', element: 'fuego', class: 'explorador', rarity: 'legendario', family: 'cazador_brasas', evolvesTo: null, skillId: 'grito' },
];
function fighterDef(id) { return FIGHTERS.find(f => f.id === id); }

const ZONES = [
  { id: 'bosque', name: 'Linde del Bosque', emoji: '🌲', color: '#2f4f2f', pool: ['topo_comun', 'duende_infre', 'topo_rara'] },
  { id: 'pantano', name: 'Pantano Oscuro', emoji: '🐊', color: '#3a4a2f', pool: ['triton_comun', 'lagarto_infre', 'nigro_rara'] },
  { id: 'cuevas', name: 'Cuevas de Cristal', emoji: '💎', color: '#2f3a4a', pool: ['lagarto_infre', 'chispa_infre', 'lagarto_epica'] },
  { id: 'picos', name: 'Picos Helados', emoji: '❄️', color: '#2f4650', pool: ['triton_rara', 'duende_epica', 'chispa_epica'] },
  { id: 'ruinas', name: 'Ruinas Abisales', emoji: '💀', color: '#3a2f45', pool: ['heraldo_rara', 'monarca_piedra', 'heraldo_legendaria'] },
  { id: 'guarida', name: 'Guarida del Dragón', emoji: '🐉', color: '#4a2f2f', pool: ['vidente_rara', 'cazador_brasas', 'vidente_legendaria'] },
];
const STAGES_PER_ZONE = 8;
const STAGE_ENERGY_COST = 6;

const CRYSTALS = {
  pixite: { label: 'Cristal Pixite', color: '#a8815a', icon: '🟤', rates: { comun: 0.60, infrecuente: 0.30, raro: 0.09, epico: 0.01, legendario: 0 } },
  voxite: { label: 'Cristal Voxite', color: '#c9c9d9', icon: '⚪', rates: { comun: 0, infrecuente: 0.45, raro: 0.35, epico: 0.17, legendario: 0.03 } },
  doxite: { label: 'Cristal Doxite', color: '#e8c23c', icon: '🟡', rates: { comun: 0, infrecuente: 0, raro: 0.30, epico: 0.45, legendario: 0.25 } },
};

const GEAR_SLOTS = {
  arma: { label: 'Arma', icon: '🗡️', names: { comun: 'Daga Roma', infrecuente: 'Espada Corta', raro: 'Hoja Rúnica', epico: 'Filo Encantado', legendario: 'Colmillo Ancestral' }, stat: 'atk' },
  armadura: { label: 'Armadura', icon: '🥋', names: { comun: 'Cota Sencilla', infrecuente: 'Cota Reforzada', raro: 'Placas Rúnicas', epico: 'Armadura Encantada', legendario: 'Coraza Ancestral' }, stat: 'def' },
};

const MAX_ENERGY = 60;
const ENERGY_REGEN_SECONDS = 45; // 1 punto cada 45s
const BAND_ROWS = 3;
const BAND_COLS = 3;
const XP_LEVEL_CAP = 40;
function fighterXpToNext(level) { return Math.floor(20 * Math.pow(level, 1.5)); }
