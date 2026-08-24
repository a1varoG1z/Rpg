// Datos estáticos del juego: localizaciones, monstruos, objetos y habilidades.
const RARITIES = [
  { id: 'comun', label: 'Común', color: '#a8a8a0', mult: 1, weight: 55, weightBoss: 8 },
  { id: 'infrecuente', label: 'Infrecuente', color: '#4caf50', mult: 1.35, weight: 28, weightBoss: 27 },
  { id: 'raro', label: 'Raro', color: '#3f9fe0', mult: 1.8, weight: 12, weightBoss: 35 },
  { id: 'epico', label: 'Épico', color: '#a463e0', mult: 2.4, weight: 4, weightBoss: 22 },
  { id: 'legendario', label: 'Legendario', color: '#e8a23c', mult: 3.2, weight: 1, weightBoss: 8 },
];

const SLOTS = ['arma', 'casco', 'pechera', 'guantes', 'botas', 'amuleto'];

const SLOT_INFO = {
  arma: { label: 'Arma', icon: '🗡️', names: ['Espada Oxidada', 'Espada de Acero', 'Hoja Fina', 'Hoja Encantada', 'Colmillo de Dragón'] },
  casco: { label: 'Casco', icon: '⛑️', names: ['Gorro de Cuero', 'Yelmo de Hierro', 'Yelmo del Caballero', 'Corona Mística', 'Yelmo Titánico'] },
  pechera: { label: 'Pechera', icon: '🥋', names: ['Chaleco de Cuero', 'Cota de Malla', 'Armadura de Placas', 'Armadura Rúnica', 'Armadura de Dragón'] },
  guantes: { label: 'Guantes', icon: '🧤', names: ['Guantes de Tela', 'Guantes de Cuero', 'Guanteletes de Hierro', 'Guanteletes Rúnicos', 'Guanteletes Titánicos'] },
  botas: { label: 'Botas', icon: '🥾', names: ['Botas Gastadas', 'Botas de Cuero', 'Grebas de Hierro', 'Botas Veloces', 'Grebas Titánicas'] },
  amuleto: { label: 'Amuleto', icon: '💍', names: ['Anillo de Cobre', 'Anillo de Plata', 'Anillo de Oro', 'Amuleto Místico', 'Talismán de Dragón'] },
};

// Perfil de estadísticas por ranura: qué stats puede tener y su peso relativo.
const SLOT_PROFILE = {
  arma: { atk: 1.0 },
  casco: { def: 0.65, hp: 0.35 },
  pechera: { def: 1.0, hp: 0.6 },
  guantes: { atk: 0.45, def: 0.4 },
  botas: { def: 0.5, hp: 0.3, atkSpeed: 0.02 },
  amuleto: { critChance: 0.5, atk: 0.35 },
};

const STAT_FACTOR = { atk: 1.6, def: 1.15, hp: 5.2, critChance: 0.16, atkSpeed: 0.012 };

const LOCATIONS = [
  {
    id: 'bosque', name: 'Linde del Bosque', emoji: '🌲', color: '#2f4f2f',
    monsters: [{ name: 'Lobo', emoji: '🐺' }, { name: 'Jabalí', emoji: '🐗' }, { name: 'Araña', emoji: '🕷️' }],
    boss: { name: 'Oso Alfa', emoji: '🐻' },
    base: { hp: 30, atk: 4, def: 1, gold: 5, xp: 6 },
  },
  {
    id: 'pantano', name: 'Pantano Oscuro', emoji: '🐊', color: '#3a4a2f',
    monsters: [{ name: 'Serpiente', emoji: '🐍' }, { name: 'Sapo Gigante', emoji: '🐸' }, { name: 'Mosquito Gigante', emoji: '🦟' }],
    boss: { name: 'Señor del Pantano', emoji: '🐊' },
    base: { hp: 65, atk: 7.5, def: 1.7, gold: 9, xp: 10 },
  },
  {
    id: 'cuevas', name: 'Cuevas de Cristal', emoji: '💎', color: '#2f3a4a',
    monsters: [{ name: 'Murciélago', emoji: '🦇' }, { name: 'Araña Cavernaria', emoji: '🕸️' }, { name: 'Gólem Menor', emoji: '🗿' }],
    boss: { name: 'Coloso de Cristal', emoji: '🗿' },
    base: { hp: 145, atk: 14, def: 3, gold: 16, xp: 17 },
  },
  {
    id: 'picos', name: 'Picos Helados', emoji: '❄️', color: '#2f4650',
    monsters: [{ name: 'Lobo de Hielo', emoji: '🐺' }, { name: 'Elemental de Hielo', emoji: '🧊' }, { name: 'Gólem de Nieve', emoji: '☃️' }],
    boss: { name: 'Titán de Escarcha', emoji: '🐻‍❄️' },
    base: { hp: 320, atk: 27, def: 5, gold: 29, xp: 30 },
  },
  {
    id: 'ruinas', name: 'Ruinas Abisales', emoji: '💀', color: '#3a2f45',
    monsters: [{ name: 'Esqueleto', emoji: '💀' }, { name: 'Espectro', emoji: '👻' }, { name: 'Zombi', emoji: '🧟' }],
    boss: { name: 'Señor Vampiro', emoji: '🧛' },
    base: { hp: 700, atk: 52, def: 8, gold: 52, xp: 50 },
  },
  {
    id: 'guarida', name: 'Guarida del Dragón', emoji: '🐉', color: '#4a2f2f',
    monsters: [{ name: 'Dragoncillo', emoji: '🐲' }, { name: 'Diablillo de Fuego', emoji: '🔥' }, { name: 'Guardián Ígneo', emoji: '👹' }],
    boss: { name: 'Dragón Ancestral', emoji: '🐉' },
    base: { hp: 1550, atk: 99, def: 14, gold: 94, xp: 85 },
  },
];

const WAVE_GROWTH = 1.07;
const BOSS_WAVE_INTERVAL = 10;
const BOSS_HP_MULT = 6;
const BOSS_ATK_MULT = 2;
const BOSS_DEF_MULT = 1.5;
const BOSS_REWARD_MULT = 5;

const SKILLS = [
  {
    id: 'golpe', name: 'Golpe Poderoso', emoji: '💥', unlockLevel: 1, maxLevel: 10,
    desc: 'Un golpe certero que inflige gran daño al enemigo actual.',
    cooldown: (lvl) => Math.max(3, 8 - lvl * 0.4),
    power: (lvl) => 1.5 + lvl * 0.15,
    cost: (lvl) => Math.round(50 * Math.pow(1.55, lvl)),
  },
  {
    id: 'grito', name: 'Grito de Guerra', emoji: '📢', unlockLevel: 5, maxLevel: 10,
    desc: 'Aumenta tu ataque durante unos segundos.',
    cooldown: () => 20,
    buffPct: (lvl) => 0.2 + lvl * 0.03,
    buffDuration: 8,
    cost: (lvl) => Math.round(70 * Math.pow(1.55, lvl)),
  },
  {
    id: 'curacion', name: 'Curación', emoji: '✨', unlockLevel: 8, maxLevel: 10,
    desc: 'Recuperas parte de tu salud máxima al instante.',
    cooldown: () => 18,
    healPct: (lvl) => 0.2 + lvl * 0.02,
    cost: (lvl) => Math.round(80 * Math.pow(1.55, lvl)),
  },
  {
    id: 'torbellino', name: 'Torbellino', emoji: '🌀', unlockLevel: 12, maxLevel: 10,
    desc: 'Golpeas 3 veces seguidas al enemigo actual.',
    cooldown: () => 25,
    power: (lvl) => 0.7 + lvl * 0.05,
    hits: 3,
    cost: (lvl) => Math.round(100 * Math.pow(1.55, lvl)),
  },
];
