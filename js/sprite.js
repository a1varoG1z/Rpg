// Generador procedural de sprites pixel-art para los luchadores.
// Cada clase tiene una silueta propia (definida por reglas geométricas simples);
// el contorno, sombreado y brillo se derivan automáticamente para dar un
// acabado de "bloques 2D/3D" coherente en toda la colección.

const SPR_W = 16, SPR_H = 18, SPR_CELL = 7;
const CAT_EMPTY = 0, CAT_BODY = 1, CAT_OUTLINE = 2, CAT_SHADE = 3, CAT_HILITE = 4, CAT_EYE = 5, CAT_ACCENT = 6;

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v)).toString(16).padStart(2, '0')).join('');
}

const CLASS_SHAPES = {
  campeon: [
    { cat: CAT_BODY, test: (x, y) => y >= 1 && y <= 4 && x <= 2.4 },
    { cat: CAT_BODY, test: (x, y) => y >= 6 && y <= 12 && x <= 3 },
    { cat: CAT_BODY, test: (x, y) => y >= 6 && y <= 7 && x >= 4 && x <= 5 },
    { cat: CAT_BODY, test: (x, y) => y >= 8 && y <= 10 && x >= 4 && x <= 4.6 },
    { cat: CAT_BODY, test: (x, y) => y >= 13 && y <= 17 && x >= 1 && x <= 2.4 },
    { cat: CAT_ACCENT, test: (x, y) => y === 0 && x >= 2 && x <= 3.2 },
    { cat: CAT_ACCENT, test: (x, y) => y === 9 && x === 0 },
    { cat: CAT_EYE, test: (x, y) => y === 3 && x === 1 },
  ],
  picaro: [
    { cat: CAT_BODY, test: (x, y) => y >= 1 && y <= 3 && x <= 1.8 },
    { cat: CAT_ACCENT, test: (x, y) => y <= 1 && x >= 1.8 && x <= 3 },
    { cat: CAT_BODY, test: (x, y) => y >= 5 && y <= 10 && x <= 2 },
    { cat: CAT_ACCENT, test: (x, y) => y >= 6 && y <= 8 && x >= 2.6 && x <= 4.4 },
    { cat: CAT_BODY, test: (x, y) => y >= 11 && y <= 17 && x >= 1 && x <= 2 },
    { cat: CAT_EYE, test: (x, y) => y === 2 && x === 1 },
  ],
  guru: [
    { cat: CAT_ACCENT, test: (x, y) => y <= 1 && x === 0 },
    { cat: CAT_BODY, test: (x, y) => y >= 2 && y <= 4 && x <= 1.8 },
    { cat: CAT_BODY, test: (x, y) => y >= 6 && y <= 16 && x <= 1.6 + (y - 6) * 0.36 },
    { cat: CAT_ACCENT, test: (x, y) => y === 9 && x >= 3.6 && x <= 4.4 },
    { cat: CAT_EYE, test: (x, y) => y === 3 && x === 1 },
  ],
  brujo: [
    { cat: CAT_ACCENT, test: (x, y) => y === 0 && x >= 2 && x <= 3 },
    { cat: CAT_BODY, test: (x, y) => y >= 1 && y <= 4 && x <= 2.6 },
    { cat: CAT_BODY, test: (x, y) => y >= 6 && y <= 16 && x <= 2.4 + (y - 6) * 0.28 },
    { cat: CAT_ACCENT, test: (x, y) => y === 3 && x === 1 },
  ],
  explorador: [
    { cat: CAT_BODY, test: (x, y) => y >= 1 && y <= 3 && x <= 1.8 },
    { cat: CAT_ACCENT, test: (x, y) => y >= 5 && y <= 8 && x >= 2.6 && x <= 5.4 },
    { cat: CAT_BODY, test: (x, y) => y >= 5 && y <= 10 && x <= 2.2 },
    { cat: CAT_BODY, test: (x, y) => y >= 11 && y <= 17 && x >= 1 && x <= 2 },
    { cat: CAT_EYE, test: (x, y) => y === 2 && x === 1 },
  ],
};

function buildSpriteGrid(className) {
  const grid = Array.from({ length: SPR_H }, () => new Array(SPR_W).fill(CAT_EMPTY));
  const set = (xHalf, y, cat) => {
    if (y < 0 || y >= SPR_H || xHalf < 0 || xHalf > 7) return;
    const left = 7 - xHalf, right = 8 + xHalf;
    grid[y][left] = cat;
    grid[y][right] = cat;
  };
  const rules = CLASS_SHAPES[className];
  for (const rule of rules) {
    for (let x = 0; x <= 7; x++) {
      for (let y = 0; y < SPR_H; y++) {
        if (rule.test(x, y)) set(x, y, rule.cat);
      }
    }
  }
  // Contorno: celdas de cuerpo tocando el vacío pasan a contorno.
  for (let y = 0; y < SPR_H; y++) {
    for (let x = 0; x < SPR_W; x++) {
      if (grid[y][x] !== CAT_BODY) continue;
      const up = y > 0 ? grid[y - 1][x] : CAT_EMPTY;
      const down = y < SPR_H - 1 ? grid[y + 1][x] : CAT_EMPTY;
      const left = x > 0 ? grid[y][x - 1] : CAT_EMPTY;
      const right = x < SPR_W - 1 ? grid[y][x + 1] : CAT_EMPTY;
      if (up === CAT_EMPTY || down === CAT_EMPTY || left === CAT_EMPTY || right === CAT_EMPTY) {
        grid[y][x] = CAT_OUTLINE;
      }
    }
  }
  // Brillo/sombra: por fila, la celda de cuerpo más cercana al centro se ilumina,
  // la más externa se oscurece, dando un falso bisel 3D.
  for (let y = 0; y < SPR_H; y++) {
    const bodyXs = [];
    for (let x = 0; x < SPR_W; x++) if (grid[y][x] === CAT_BODY) bodyXs.push(x);
    if (bodyXs.length === 0) continue;
    const center = SPR_W / 2;
    bodyXs.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    grid[y][bodyXs[0]] = CAT_HILITE;
    const farthest = bodyXs[bodyXs.length - 1];
    if (farthest !== bodyXs[0]) grid[y][farthest] = CAT_SHADE;
  }
  return grid;
}

const spriteGridCache = {};
function getSpriteGrid(className) {
  if (!spriteGridCache[className]) spriteGridCache[className] = buildSpriteGrid(className);
  return spriteGridCache[className];
}

function drawCreatureSprite(canvas, fighterId) {
  const def = fighterDef(fighterId);
  if (!def) return;
  const grid = getSpriteGrid(def.class);
  const el = ELEMENT_INFO[def.element];
  const palette = {
    [CAT_BODY]: el.color,
    [CAT_OUTLINE]: '#140d08',
    [CAT_SHADE]: el.shade,
    [CAT_HILITE]: lighten(el.color, 60),
    [CAT_EYE]: '#fef6e4',
    [CAT_ACCENT]: el.glow,
  };
  canvas.width = SPR_W * SPR_CELL;
  canvas.height = SPR_H * SPR_CELL;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < SPR_H; y++) {
    for (let x = 0; x < SPR_W; x++) {
      const cat = grid[y][x];
      if (cat === CAT_EMPTY) continue;
      ctx.fillStyle = palette[cat];
      ctx.fillRect(x * SPR_CELL, y * SPR_CELL, SPR_CELL, SPR_CELL);
    }
  }
}
