// Generador procedural de sprites pixel-art para los luchadores: cada clase es
// una silueta de criatura (no humanoide) construida con óvalos, coloreada según
// su elemento, con sombreado en dos tonos, contorno, brillo especular y una
// sombra de suelo — sin depender de ningún asset externo.

const SPR_W = 20, SPR_H = 22, SPR_CELL = 6;
const CAT_EMPTY = 0, CAT_BODY = 1, CAT_OUTLINE = 2, CAT_SHADE = 3, CAT_HILITE = 4, CAT_EYE = 5, CAT_PUPIL = 6, CAT_ACCENT = 7, CAT_SHINE = 8;

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v)).toString(16).padStart(2, '0')).join('');
}
function darken(hex, amt) { return lighten(hex, -amt); }

// x = distancia al eje central (0 = centro, mayor = hacia fuera); y = de arriba a abajo.
function ellipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx, dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

const CLASS_SHAPES = {
  // Campeón: bestia rechoncha y acorazada.
  campeon: [
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 12.5, 5.6, 5.2) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 5, 3.3, 3.2) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 3.1, 2.2, 1.2, 1.4) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 2.6, 18, 1.8, 2.1) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 0, 11, 2, 1.5) },
    { cat: CAT_EYE, test: (x, y) => ellipse(x, y, 1.3, 4.6, 0.9, 0.9) },
    { cat: CAT_PUPIL, test: (x, y) => ellipse(x, y, 1.5, 4.9, 0.4, 0.4) },
  ],
  // Pícaro: depredador esbelto con aletas afiladas.
  picaro: [
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 10.5, 3.6, 4.8) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 4, 2.6, 2.6) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 2.1, 1.6, 1, 1.3) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 4.6, 9, 1.4, 3.2) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 1.6, 17.5, 1.4, 2.1) },
    { cat: CAT_EYE, test: (x, y) => ellipse(x, y, 1.1, 3.6, 0.85, 0.85) },
    { cat: CAT_PUPIL, test: (x, y) => ellipse(x, y, 1.3, 3.9, 0.4, 0.4) },
  ],
  // Gurú: espíritu flotante envuelto en un manto.
  guru: [
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 0, 0.6, 1.1, 1.1) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 4.2, 3, 3) },
    { cat: CAT_BODY, test: (x, y) => y >= 5.5 && y <= 19 && x <= 2.6 + (y - 5.5) * 0.2 },
    { cat: CAT_ACCENT, test: (x, y) => y >= 15 && y <= 20 && x >= 1.6 && x <= 2.6 },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 1.2, 3.6, 0.9, 0.9) },
  ],
  // Brujo: criatura alada de la noche.
  brujo: [
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 11.5, 3.8, 4.8) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 4.6, 2.9, 2.8) },
    { cat: CAT_ACCENT, test: (x, y) => y <= 2 && x >= 1.8 && x <= 3 && x >= (y === 0 ? 2.4 : 1.8) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 6.2, 9.5, 3.2, 4.6) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 1.7, 18, 1.5, 2) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 1.2, 4.2, 0.85, 0.85) },
  ],
  // Explorador: criatura alada y veloz, tipo ave.
  explorador: [
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 10.5, 3.3, 4.4) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 0, 4, 2.7, 2.6) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 0, 5.6, 0.9, 0.6) },
    { cat: CAT_ACCENT, test: (x, y) => ellipse(x, y, 5.2, 9, 2.3, 3.6) },
    { cat: CAT_BODY, test: (x, y) => ellipse(x, y, 1.5, 17, 1.3, 1.9) },
    { cat: CAT_EYE, test: (x, y) => ellipse(x, y, 1.2, 3.6, 0.8, 0.8) },
    { cat: CAT_PUPIL, test: (x, y) => ellipse(x, y, 1.4, 3.9, 0.38, 0.38) },
  ],
};

function buildSpriteGrid(className) {
  const grid = Array.from({ length: SPR_H }, () => new Array(SPR_W).fill(CAT_EMPTY));
  const half = SPR_W / 2;
  const set = (xHalf, y, cat) => {
    if (y < 0 || y >= SPR_H || xHalf < 0 || xHalf >= half) return;
    const left = half - 1 - xHalf, right = half + xHalf;
    grid[y][left] = cat;
    grid[y][right] = cat;
  };
  const rules = CLASS_SHAPES[className];
  for (const rule of rules) {
    for (let x = 0; x < half; x++) {
      for (let y = 0; y < SPR_H; y++) {
        if (rule.test(x + 0.5, y)) set(x, y, rule.cat);
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
  // Sombreado global: luz suave desde arriba — la franja superior del cuerpo
  // se ilumina, la inferior se oscurece, dando un acabado pulido y redondeado.
  let minY = SPR_H, maxY = 0;
  for (let y = 0; y < SPR_H; y++) for (let x = 0; x < SPR_W; x++) if (grid[y][x] === CAT_BODY) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
  if (maxY >= minY) {
    const span = Math.max(1, maxY - minY);
    const hiBand = minY + span * 0.32;
    const shBand = maxY - span * 0.32;
    for (let y = 0; y < SPR_H; y++) {
      for (let x = 0; x < SPR_W; x++) {
        if (grid[y][x] !== CAT_BODY) continue;
        if (y <= hiBand) grid[y][x] = CAT_HILITE;
        else if (y >= shBand) grid[y][x] = CAT_SHADE;
      }
    }
    // Brillo especular: un par de píxeles cerca de la parte superior del cuerpo.
    for (let y = minY; y < minY + 3; y++) {
      const cell = grid[y][half - 2];
      if (cell === CAT_HILITE || cell === CAT_BODY) { grid[y][half - 2] = CAT_SHINE; break; }
    }
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
  const elInfo = ELEMENT_INFO[def.element];
  const glowEye = def.class === 'brujo' || def.class === 'guru';
  const palette = {
    [CAT_BODY]: elInfo.color,
    [CAT_OUTLINE]: '#140d08',
    [CAT_SHADE]: darken(elInfo.color, 35),
    [CAT_HILITE]: lighten(elInfo.color, 45),
    [CAT_EYE]: glowEye ? elInfo.glow : '#fef6e4',
    [CAT_PUPIL]: glowEye ? '#140d08' : '#140d08',
    [CAT_ACCENT]: elInfo.glow,
    [CAT_SHINE]: '#fffdf6',
  };
  canvas.width = SPR_W * SPR_CELL;
  canvas.height = SPR_H * SPR_CELL;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - SPR_CELL * 1.1, canvas.width * 0.3, SPR_CELL * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let y = 0; y < SPR_H; y++) {
    for (let x = 0; x < SPR_W; x++) {
      const cat = grid[y][x];
      if (cat === CAT_EMPTY) continue;
      ctx.fillStyle = palette[cat];
      ctx.fillRect(x * SPR_CELL, y * SPR_CELL, SPR_CELL, SPR_CELL);
    }
  }
}
