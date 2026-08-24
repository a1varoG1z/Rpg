// Generador de sprites pixel-art para los luchadores. Cada silueta está
// diseñada a mano, píxel a píxel (no por fórmulas geométricas): cada fila es
// una cadena de texto que describe, de dentro (centro) hacia fuera, qué hay
// en cada columna; se refleja para dar la criatura completa y simétrica.
// El sombreado sí es automático, pero simula una luz direccional de verdad
// (arriba-izquierda) con contorno selectivo — la técnica que distingue el
// pixel art bien hecho del "relleno con contorno negro uniforme".

const SPR_HALF = 10, SPR_W = SPR_HALF * 2, SPR_H = 20, SPR_CELL = 6;

const CAT_EMPTY = 0, CAT_BODY = 1, CAT_OUT_DARK = 2, CAT_OUT_LIGHT = 3, CAT_SHADE = 4,
  CAT_HILITE = 5, CAT_EYE = 6, CAT_CHEEK = 7, CAT_ACCENT = 8, CAT_PATCH = 9, CAT_SHINE = 10;

function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v)).toString(16).padStart(2, '0')).join('');
}
function darken(hex, amt) { return lighten(hex, -amt); }
function mix(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16), b = parseInt(hexB.slice(1), 16);
  const ar = a >> 16, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = b >> 16, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return '#' + [r, g, bl].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// index 0 = columna central, index 9 = borde exterior.
// . vacío · B cuerpo · A accesorio (cuerno/ala/gema) · E ojo · P mejilla (sombra sutil) · C mancha clara
const CLASS_ROWS = {
  campeon: [
    '......A...', '.....AA...', 'BBBBBBB...', 'BBBBBBBB..', 'BBBBBBBBB.',
    'BPEBBBBBB.', 'BBBBBBBBB.', 'BBBBBBBB..', 'BBBBBBB...', 'BBBBB.....',
    'BBBBBBBBBB', 'CCBBBBBBBB', 'BBBBBBBBBB', 'BBBBBBBBB.', 'BBBBBBBB..',
    'BBBBBBB...', '..BBBB....', '..BBBB....', '.BBBBB....', '.BBBB.....',
  ].map(r => r.padEnd(10, '.')),
  picaro: [
    '..AA......', '.AAAA.....', 'BBBBBB....', 'BBBBBBB...', 'BBBPEBB...',
    'BBBBBBB...', 'BBBBBB....', 'BBBBB.....', 'BBBB......', 'BBBBBB....',
    'BBBBBBB...', 'BBBBBBBA..', 'BBBBBBBAA.', 'BBBBBBB...', 'BBBBBB....',
    'BBBBB.....', 'BBB.......', 'BBB.......', 'BBBB......', 'BBB.......',
  ].map(r => r.padEnd(10, '.')),
  guru: [
    'A.........', 'BBBB......', 'BBBBBB....', 'BBBBBBB...', 'BBPEBBB...',
    'BBBBBBB...', 'BBBBBB....', 'BBBBBBB...', 'BBBBBBBB..', 'BBBBBBBB..',
    'BBBBBBBBB.', 'BBBBBBBB..', 'BBBBBBBB..', 'BBBBBBB...', 'BBBBBB....',
    'BBBBB.....', 'BBBB......', 'BBB.......', 'BBB.......', 'BB........',
  ].map(r => r.padEnd(10, '.')),
  brujo: [
    '.....AA...', 'BBBBBBB...', 'BBBBBBBB..', 'BPEBBBBB..', 'BBBBBBBB..',
    'BBBBBBB...', '.BBBBB....', 'BBBBBBB...', 'BBBBBBBAAA', 'BBBBBBAAAA',
    'BBBBBAAAAA', 'BBBBBB.AAA', 'BBBBBBB.A.', 'BBBBBBB...', 'BBBBBB....',
    'BBBBB.....', '..BBB.....', '..BBB.....', '.BBBB.....', '.BBB......',
  ].map(r => r.padEnd(10, '.')),
  explorador: [
    'A.........', 'BBBB......', 'BBBBBB....', 'BBPEBB....', 'BBBBBBB...',
    'ABBBBBB...', 'BBBBBB....', 'BBBBB.....', 'BBBBBAAA..', 'BBBBBAAAA.',
    'BBBBBBAA..', 'BBBBBB....', 'BBBBB.....', 'BBBB......', 'BBB.......',
    'BBB.......', 'BB........', 'BB........', 'B.........', '..........',
  ].map(r => r.padEnd(10, '.')),
};

const CHAR_CAT = { B: CAT_BODY, A: CAT_ACCENT, E: CAT_EYE, P: CAT_CHEEK, C: CAT_PATCH };

function buildSpriteGrid(className) {
  const grid = Array.from({ length: SPR_H }, () => new Array(SPR_W).fill(CAT_EMPTY));
  const rows = CLASS_ROWS[className];
  for (let y = 0; y < SPR_H; y++) {
    const row = rows[y];
    for (let i = 0; i < SPR_HALF; i++) {
      const ch = row[i];
      if (ch === '.' || !ch) continue;
      const cat = CHAR_CAT[ch] || CAT_BODY;
      grid[y][SPR_HALF - 1 - i] = cat;
      grid[y][SPR_HALF + i] = cat;
    }
  }

  // Luz direccional real: diagonal desde arriba-izquierda. Se mide la posición
  // de cada celda de cuerpo dentro de su caja delimitadora para decidir si cae
  // en la banda iluminada, la banda en sombra, o el tono base.
  let minX = SPR_W, maxX = 0, minY = SPR_H, maxY = 0;
  for (let y = 0; y < SPR_H; y++) for (let x = 0; x < SPR_W; x++) {
    if (grid[y][x] === CAT_BODY) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const spanX = Math.max(1, maxX - minX), spanY = Math.max(1, maxY - minY);
  const zone = (x, y) => {
    const score = (x - minX) / spanX * 0.55 + (y - minY) / spanY * 0.75;
    if (score < 0.55) return 'hi';
    if (score > 1.15) return 'sh';
    return 'mid';
  };
  const cellZone = Array.from({ length: SPR_H }, () => new Array(SPR_W).fill('mid'));
  for (let y = 0; y < SPR_H; y++) for (let x = 0; x < SPR_W; x++) {
    if (grid[y][x] !== CAT_BODY) continue;
    const z = zone(x, y);
    cellZone[y][x] = z;
    grid[y][x] = z === 'hi' ? CAT_HILITE : z === 'sh' ? CAT_SHADE : CAT_BODY;
  }

  // Contorno selectivo: en la zona iluminada se usa un contorno cálido y
  // claro (deja "respirar" la luz); en el resto, un contorno oscuro normal.
  for (let y = 0; y < SPR_H; y++) {
    for (let x = 0; x < SPR_W; x++) {
      const cat = grid[y][x];
      if (cat !== CAT_BODY && cat !== CAT_HILITE && cat !== CAT_SHADE) continue;
      const up = y > 0 ? grid[y - 1][x] : CAT_EMPTY;
      const down = y < SPR_H - 1 ? grid[y + 1][x] : CAT_EMPTY;
      const left = x > 0 ? grid[y][x - 1] : CAT_EMPTY;
      const right = x < SPR_W - 1 ? grid[y][x + 1] : CAT_EMPTY;
      if (up === CAT_EMPTY || down === CAT_EMPTY || left === CAT_EMPTY || right === CAT_EMPTY) {
        grid[y][x] = cellZone[y][x] === 'hi' ? CAT_OUT_LIGHT : CAT_OUT_DARK;
      }
    }
  }

  // Brillo especular: un único píxel cerca de la parte alta iluminada.
  outer:
  for (let y = minY; y < minY + 4; y++) {
    for (let x = minX; x < maxX; x++) {
      if (grid[y][x] === CAT_HILITE) { grid[y][x] = CAT_SHINE; break outer; }
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
  const el = ELEMENT_INFO[def.element];
  const glowEye = def.class === 'brujo' || def.class === 'guru';
  const outlineBase = darken(el.color, 78);
  const palette = {
    [CAT_BODY]: el.color,
    [CAT_HILITE]: lighten(el.color, 42),
    [CAT_SHADE]: darken(el.color, 32),
    [CAT_OUT_DARK]: mix(outlineBase, '#1a1006', 0.4),
    [CAT_OUT_LIGHT]: mix(el.color, outlineBase, 0.55),
    [CAT_EYE]: glowEye ? el.glow : darken(el.color, 85),
    [CAT_CHEEK]: darken(el.color, 18),
    [CAT_ACCENT]: el.glow,
    [CAT_PATCH]: lighten(el.color, 78),
    [CAT_SHINE]: '#fffdf6',
  };
  canvas.width = SPR_W * SPR_CELL;
  canvas.height = SPR_H * SPR_CELL;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height - SPR_CELL * 0.9, canvas.width * 0.3, SPR_CELL * 0.9, 0, 0, Math.PI * 2);
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
