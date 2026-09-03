// Renderizado de pantallas, modales y reproducción de batallas.
const UI = {};
let activeScreen = 'mapa';
let mapaZoneIdx = null;

function $(id) { return document.getElementById(id); }
function el(tag, className, html) { const e = document.createElement(tag); if (className) e.className = className; if (html !== undefined) e.innerHTML = html; return e; }

// ---------- Fondos de zona ----------
// Mismo espíritu que el respaldo procedural de las criaturas (dibujar algo
// de momento, sustituible por arte real más tarde), pero mucho más simple
// porque una imagen de fondo CSS no necesita detectar el fallo a mano: si
// `assets/scenery/<id>.jpg` no existe todavía, esa capa del `background`
// simplemente no se pinta y se ve el degradado de abajo sin más código —
// a diferencia del sprite de criatura (que sí necesita un <img> con
// `onerror` porque ahí cambia de elemento entero, canvas vs imagen). En
// cuanto el usuario suba `assets/scenery/<id>.jpg` (mismo `id` que la zona
// en ZONES) se ve automáticamente, sin tocar código.
function shadeColor(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt), g = clamp(((num >> 8) & 0xff) + amt), b = clamp((num & 0xff) + amt);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
function zoneBackgroundStyle(zone) {
  const light = shadeColor(zone.color, 25);
  const dark = shadeColor(zone.color, -35);
  return `linear-gradient(rgba(10,6,3,0.45), rgba(10,6,3,0.7)), url('assets/scenery/${zone.id}.jpg') center/cover no-repeat, radial-gradient(ellipse at 50% 30%, ${light}, ${zone.color} 55%, ${dark} 100%)`;
}

// ---------- Tarjetas de criatura reutilizables ----------
// Si el luchador tiene arte real asignado (data.js -> image), se usa esa
// imagen; si no, se genera un sprite pixel-art por código como respaldo.
// Dibuja el sprite en diferido (siguiente frame) en vez de bloquear el hilo
// principal: cuando se listan muchas tarjetas de golpe (Colección, selector
// de Formación) dibujarlas todas de forma síncrona notaba como un "bloqueo"
// o tarjetas a medio pintar. Con esto cada tarjeta aparece con un pequeño
// fundido en cuanto está lista, sin congelar el resto de la pantalla.
function proceduralCreatureCanvas(defId, sizePx) {
  const canvas = document.createElement('canvas');
  canvas.className = 'creature-canvas creature-canvas-loading';
  if (sizePx) { canvas.style.width = sizePx + 'px'; canvas.style.height = (sizePx * SPR_H / SPR_W) + 'px'; }
  requestAnimationFrame(() => {
    drawCreatureSprite(canvas, defId);
    canvas.classList.remove('creature-canvas-loading');
  });
  return canvas;
}

// El atributo nativo loading="lazy" decide solo cuándo cargar cada imagen
// según su propia heurística interna — en listas largas dentro de un
// contenedor con scroll propio (la Pokédex, sobre todo: 336 tarjetas de
// golpe) algunos navegadores/WebView de móvil no la disparan de forma
// fiable, dejando la tarjeta en blanco (opacity:0, sin marcador de carga)
// de forma indefinida en vez de solo un instante.
//
// Un primer intento con IntersectionObserver (root: null, el viewport del
// documento) tenía el mismo problema: cuando el scroll ocurre dentro de un
// contenedor anidado con overflow propio (cualquier .modal-box de este
// juego, incluida la propia Pokédex) el observador no vuelve a evaluar la
// intersección al hacer scroll — solo procesa la tanda inicial y se queda
// mudo el resto del tiempo, comprobado a mano. Habría que pasarle el
// contenedor real como `root`, pero creatureCanvas se usa en sitios muy
// distintos (dentro de modales, dentro de pantallas normales) y no hay un
// único contenedor válido para todos.
//
// getBoundingClientRect() sí es siempre relativo a la ventana real, pase
// lo que pase por en medio (contenedores anidados, scroll del documento o
// de un modal) — así que en vez de IntersectionObserver, un listener de
// scroll en el documento con `capture: true` (los eventos de scroll no
// burbujean, pero SÍ se capturan desde cualquier ancestro, así que uno
// solo en document basta para cualquier contenedor) revisa qué imágenes
// pendientes han entrado ya en pantalla (con margen) y les asigna el src
// real. Limitado a una comprobación por frame con requestAnimationFrame.
const LAZY_IMAGE_MARGIN = 400;
const pendingLazyImages = new Set();
let lazyCheckScheduled = false;
function isNearViewport(elem) {
  const r = elem.getBoundingClientRect();
  return r.bottom > -LAZY_IMAGE_MARGIN && r.top < window.innerHeight + LAZY_IMAGE_MARGIN
    && r.right > -LAZY_IMAGE_MARGIN && r.left < window.innerWidth + LAZY_IMAGE_MARGIN;
}
function resolvePendingLazyImages() {
  lazyCheckScheduled = false;
  pendingLazyImages.forEach(img => {
    if (!img.isConnected) { pendingLazyImages.delete(img); return; }
    if (!isNearViewport(img)) return;
    pendingLazyImages.delete(img);
    if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
  });
}
function scheduleLazyImageCheck() {
  if (lazyCheckScheduled) return;
  lazyCheckScheduled = true;
  requestAnimationFrame(resolvePendingLazyImages);
}
document.addEventListener('scroll', scheduleLazyImageCheck, { capture: true, passive: true });
window.addEventListener('resize', scheduleLazyImageCheck);

function creatureCanvas(defId, sizePx) {
  const def = fighterDef(defId);
  if (def && def.image) {
    const img = document.createElement('img');
    img.className = 'creature-canvas creature-canvas-loading';
    img.alt = def.name;
    // Alto fijo (misma proporción 72×81 que la caja por defecto de
    // .creature-canvas en style.css) en vez de "auto" según la proporción
    // real del PNG — con "auto", un sprite recortado más alto de lo normal
    // (poco margen, retrato de cuerpo entero) se salía de la caja fija de
    // cualquier rejilla que lo usara (Formación, recorrido de etapa, Torre
    // Batalla, colas de combate...) y tapaba lo que hubiera debajo. Con
    // ancho+alto fijos, object-fit:contain (ya en la clase base) encoge la
    // imagen para caber siempre dentro, sin deformarla.
    if (sizePx) { img.style.width = sizePx + 'px'; img.style.height = Math.round(sizePx * 81 / 72) + 'px'; }
    img.addEventListener('load', () => img.classList.remove('creature-canvas-loading'), { once: true });
    // Si el PNG falla al cargar (red inestable en móvil, caché corrupta...)
    // se sustituye por el sprite procedural en vez de dejar un hueco vacío
    // para siempre (el <img> roto se quedaba con opacity:0 sin más).
    img.addEventListener('error', () => {
      const fallback = proceduralCreatureCanvas(defId, sizePx);
      if (img.parentNode) img.parentNode.replaceChild(fallback, img);
    }, { once: true });
    img.dataset.src = 'assets/creatures/' + def.image;
    pendingLazyImages.add(img);
    scheduleLazyImageCheck();
    return img;
  }
  return proceduralCreatureCanvas(defId, sizePx);
}

// ---------- Icono de equipo reutilizable ----------
// Mismo patrón que creatureCanvas: intenta la imagen real
// (assets/gear/<tipo>_<rareza>.png — un archivo por cada tipo Y rareza,
// igual de granular que las criaturas por evolución: 18 tipos × 5 rarezas
// = 90 imágenes en total, el nombre del tipo ya es único en todo el
// juego) y, si no existe todavía, cae en un icono generado por código
// (el emoji de ese tipo, ya definido en data.js, sobre un fondo del color
// de su rareza) que se sustituye solo por el arte real en cuanto se suba.
function proceduralGearIcon(typeInfo, rarityId, sizePx) {
  const size = sizePx || 32;
  const box = document.createElement('div');
  box.className = 'gear-icon-fallback';
  box.style.width = size + 'px';
  box.style.height = size + 'px';
  box.style.fontSize = Math.round(size * 0.6) + 'px';
  box.style.borderColor = rarityInfo(rarityId).color;
  box.textContent = typeInfo.icon;
  return box;
}
function gearIcon(gear, sizePx) {
  const typeInfo = gearTypeInfo(gear);
  const size = sizePx || 32;
  const img = document.createElement('img');
  img.className = 'gear-icon gear-icon-loading';
  img.alt = typeInfo.names[gear.rarity];
  img.loading = 'lazy';
  img.style.width = size + 'px';
  img.style.height = size + 'px';
  img.addEventListener('load', () => img.classList.remove('gear-icon-loading'), { once: true });
  img.addEventListener('error', () => {
    const fallback = proceduralGearIcon(typeInfo, gear.rarity, size);
    if (img.parentNode) img.parentNode.replaceChild(fallback, img);
  }, { once: true });
  img.src = 'assets/gear/' + gear.type + '_' + gear.rarity + '.png';
  return img;
}

// Modos de ordenación por estadística: individuales + 'poder' (fighterPowerScore
// de las 5 juntas, ver state.js — ponderado, no una suma a pelo, para no
// favorecer siempre a las clases con más HP base sobre las de más ATK/WIS).
// variant decide qué cifras se usan para esos modos: 'current' (nivel/
// estrellas/equipo actuales, vía fighterStats) o 'base' (Nv.1 de fábrica,
// sin nada de eso — misma fórmula que el modo "Base" de Comparar, vía
// baseCompareStats), para poder distinguir quién es realmente mejor "de
// carta" de quién simplemente tiene más invertido.
//
// A propósito NO fuerza la rareza por delante del poder medido: el
// objetivo de este orden es precisamente poder DETECTAR cuándo una carta
// de rareza superior mide de verdad peor que una inferior (por su reparto
// de clase) — forzar la rareza escondería justo el caso que hace falta
// ver para decidir si esa carta necesita un ajuste manual (ver
// setStatMult en data.js).
const STAT_SORT_MODES = ['poder', 'hp', 'atk', 'def', 'agi', 'wis'];
function statsForSort(state, entry, variant) {
  return variant === 'base' ? baseCompareStats(entry) : fighterStats(state, entry);
}

// mode: 'reciente' (orden de obtención, más nuevo primero), 'nombre',
// 'familia', 'elemento', 'tier' (rareza, más alta primero), 'copias' (SEF),
// o uno de STAT_SORT_MODES (ver variant arriba).
function sortRosterEntries(state, roster, mode, variant) {
  const list = [...roster];
  if (STAT_SORT_MODES.includes(mode)) {
    return list.sort((a, b) => {
      const sa = statsForSort(state, a, variant), sb = statsForSort(state, b, variant);
      const va = mode === 'poder' ? fighterPowerScore(sa) : sa[mode];
      const vb = mode === 'poder' ? fighterPowerScore(sb) : sb[mode];
      return vb - va;
    });
  }
  switch (mode) {
    case 'nombre':
      return list.sort((a, b) => fighterDef(a.defId).name.localeCompare(fighterDef(b.defId).name));
    case 'familia':
      return list.sort((a, b) => fighterDef(a.defId).family.localeCompare(fighterDef(b.defId).family)
        || rarityIndex(fighterDef(a.defId).rarity) - rarityIndex(fighterDef(b.defId).rarity) || b.level - a.level);
    case 'elemento':
      return list.sort((a, b) => ELEMENT_ORDER.indexOf(fighterDef(a.defId).element) - ELEMENT_ORDER.indexOf(fighterDef(b.defId).element) || b.level - a.level);
    case 'copias':
      return list.sort((a, b) => b.sef - a.sef || rarityIndex(fighterDef(b.defId).rarity) - rarityIndex(fighterDef(a.defId).rarity));
    case 'reciente':
      return list.reverse();
    case 'tier':
    default:
      return list.sort((a, b) => rarityIndex(fighterDef(b.defId).rarity) - rarityIndex(fighterDef(a.defId).rarity) || b.level - a.level);
  }
}

function creatureCard(state, entry, opts) {
  opts = opts || {};
  const def = fighterDef(entry.defId);
  const rarity = rarityInfoFor(def);
  const card = el('div', 'creature-card rarity-' + rarity.id);
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--rg', rarity.glow);
  if (entry.isNew) card.appendChild(el('div', 'new-badge', '¡Nuevo!'));
  const wrap = el('div', 'creature-canvas-wrap');
  wrap.appendChild(creatureCanvas(entry.defId));
  card.appendChild(wrap);
  const badge = el('div', 'creature-elclass');
  badge.textContent = ELEMENT_INFO[def.element].icon + CLASS_INFO[def.class].icon;
  card.appendChild(badge);
  card.appendChild(el('div', 'creature-tier-icon', rarity.icon));
  card.appendChild(el('div', 'creature-name', def.name));
  card.appendChild(el('div', 'creature-level', 'Nv. ' + entry.level));
  const sef = el('div', 'sef-bar');
  sef.appendChild(el('div', 'sef-fill')).style.width = (entry.sef / 5 * 100) + '%';
  card.appendChild(sef);
  if (entry.stars > 0) card.appendChild(el('div', 'star-row', '★'.repeat(entry.stars)));
  if (opts.inBand) card.appendChild(el('div', 'in-band-tag', 'En banda'));
  return card;
}

// Ficha de Pokédex: a diferencia de creatureCard (una copia concreta del
// roster, con nivel/SEF/estrellas), aquí solo importa si esa forma se ha
// conseguido ALGUNA VEZ (state.discoveredDefIds) — no si se tiene ahora
// mismo una copia suelta. Las formas nunca conseguidas se muestran
// bloqueadas, sin nombre ni arte, para no hacer spoiler de qué son.
function pokedexCard(def, discovered) {
  if (!discovered) {
    const card = el('div', 'creature-card pokedex-locked');
    card.appendChild(el('div', 'pokedex-lock-icon', '❔'));
    card.appendChild(el('div', 'creature-name', '???'));
    return card;
  }
  const rarity = rarityInfo(def.rarity);
  const card = el('div', 'creature-card rarity-' + def.rarity);
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--rg', rarity.glow);
  const wrap = el('div', 'creature-canvas-wrap');
  wrap.appendChild(creatureCanvas(def.id));
  card.appendChild(wrap);
  const badge = el('div', 'creature-elclass');
  badge.textContent = ELEMENT_INFO[def.element].icon + CLASS_INFO[def.class].icon;
  card.appendChild(badge);
  card.appendChild(el('div', 'creature-tier-icon', rarity.icon));
  card.appendChild(el('div', 'creature-name', def.name));
  card.addEventListener('click', () => UI.showPokedexEntry(def));
  return card;
}

// Ficha de solo lectura de una forma de la Pokédex: arte, descripción,
// tipo/tier y estadísticas BASE (nivel 1, sin nivel/equipo/estrellas del
// jugador — las mismas para cualquiera). A diferencia de la ficha del
// roster (openFighterModal) no tiene ninguna acción — ni fusión, ni
// equipo, ni venta — es solo información de referencia.
UI.showPokedexEntry = function (def) {
  const rarity = rarityInfo(def.rarity);
  const vuln = TYPE_VULNERABILITY[def.class];
  const stats = buildUnitStats(def.id, 1);
  const body = $('pokedexEntryModalBody');
  body.innerHTML = '';
  const head = el('div', 'fighter-modal-head');
  head.appendChild(creatureCanvas(def.id, 90));
  const info = el('div');
  info.innerHTML = `<div class="item-modal-name" style="color:${rarity.color}">${def.name}</div>
    <div class="item-modal-rarity">${rarity.label} · ${ELEMENT_INFO[def.element].label} ${ELEMENT_INFO[def.element].icon} · ${CLASS_INFO[def.class].label} ${CLASS_INFO[def.class].icon}</div>
    ${vuln ? `<div class="type-vuln-note">${vuln.desc}</div>` : ''}`;
  head.appendChild(info);
  body.appendChild(head);

  if (def.lore) {
    const lorePanel = el('div', 'panel');
    lorePanel.innerHTML = `<h3>📜 Historia</h3><p class="settings-info">${def.lore}</p>`;
    body.appendChild(lorePanel);
  }

  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = `<h3>Estadísticas base (Nv. 1)</h3>
    <div class="stat-row"><span>❤️ Vida</span><span>${stats.maxHp}</span></div>
    <div class="stat-row"><span>⚔️ Ataque</span><span>${stats.atk}</span></div>
    <div class="stat-row"><span>🛡️ Defensa</span><span>${stats.def}</span></div>
    <div class="stat-row"><span>💨 Agilidad</span><span>${stats.agi}</span></div>
    <div class="stat-row"><span>🧠 Sabiduría</span><span>${stats.wis}</span></div>`;
  body.appendChild(statsPanel);

  const skill = SKILL_TYPES[def.skillId];
  const skillPanel = el('div', 'panel');
  skillPanel.innerHTML = `<h3>⚡ ${skill.name} (Ulti)</h3><p class="settings-info">${skill.desc}</p>`;
  body.appendChild(skillPanel);

  $('pokedexEntryModal').classList.remove('hidden');
};

// ---------- Pokédex ----------
// Registro de todas las formas jugables (FIGHTERS) alguna vez conseguidas,
// agrupadas por familia y ordenadas por tier — igual que "ordenar por
// familia" en la Colección, pero cubriendo TODO el roster invocable, no
// solo lo que tienes ahora mismo en el inventario.
UI.openPokedex = function (state) {
  const body = $('pokedexModalBody');
  body.innerHTML = '';
  const discovered = new Set(state.discoveredDefIds || []);
  const sorted = [...FIGHTERS].sort((a, b) => a.family.localeCompare(b.family) || rarityIndex(a.rarity) - rarityIndex(b.rarity));
  const discoveredCount = sorted.filter(def => discovered.has(def.id)).length;
  body.appendChild(el('h3', null, `📖 Pokédex ${discoveredCount}/${sorted.length}`));
  body.appendChild(el('p', 'settings-info', 'Todas las criaturas jugables que existen en Texel. Se desbloquean para siempre la primera vez que las invocas.'));
  const grid = el('div', 'creature-grid pokedex-grid');
  sorted.forEach(def => grid.appendChild(pokedexCard(def, discovered.has(def.id))));
  body.appendChild(grid);

  // Mobs y jefes solo se consiguen ganando su nivel en la Torre Batalla
  // (ver TORRE_LEVELS en data.js) — se listan aparte porque son un sistema
  // de desbloqueo totalmente distinto al de invocación, no porque cuenten
  // para el mismo porcentaje de arriba.
  const torreSorted = [...MOBS, ...BOSSES].sort((a, b) => a.family.localeCompare(b.family) || rarityIndex(a.rarity) - rarityIndex(b.rarity));
  const torreDiscoveredCount = torreSorted.filter(def => discovered.has(def.id)).length;
  body.appendChild(el('h3', null, `🗼 Torre Batalla ${torreDiscoveredCount}/${torreSorted.length}`));
  body.appendChild(el('p', 'settings-info', 'Mobs y jefes del mapa, jugables al derrotarlos en la Torre Batalla (ver la pestaña Torre).'));
  const torreGrid = el('div', 'creature-grid pokedex-grid');
  torreSorted.forEach(def => torreGrid.appendChild(pokedexCard(def, discovered.has(def.id))));
  body.appendChild(torreGrid);

  $('pokedexModal').classList.remove('hidden');
};

// ---------- Objetivos ----------
// Fila de un objetivo con barra de progreso (X/Y). Solo lectura — agrupa
// números que ya existen en otras pantallas (mapa, Pokédex, banda, arena,
// equipo) en un único resumen de progreso general, ver objectivesSummary
// en state.js.
function objRow(label, current, total) {
  const pct = total > 0 ? Math.min(100, Math.round(current / total * 100)) : 0;
  const row = el('div', 'obj-row');
  row.innerHTML = `<div class="obj-row-top"><span>${label}</span><span>${current}/${total}</span></div>
    <div class="obj-bar"><div class="obj-fill" style="width:${pct}%"></div></div>`;
  return row;
}

UI.openObjectives = function (state) {
  const s = objectivesSummary(state);
  const body = $('objectivesModalBody');
  body.innerHTML = '';
  body.appendChild(el('h3', null, '🎯 Objetivos'));
  body.appendChild(el('p', 'settings-info', 'Resumen de tu progreso general en Defensor de Texel.'));

  const mapPanel = el('div', 'panel');
  mapPanel.innerHTML = '<h3>🗺️ Mapa</h3>';
  mapPanel.appendChild(objRow('Zonas desbloqueadas', s.unlockedZones, s.totalZones));
  mapPanel.appendChild(objRow('Etapas superadas', s.stagesCleared, s.totalStages));
  mapPanel.appendChild(objRow('Jefes derrotados', s.bossesDefeated, s.totalBosses));
  const bossesShortcut = el('button', 'primary-btn', '👹 Ver jefes');
  bossesShortcut.addEventListener('click', () => { $('objectivesModal').classList.add('hidden'); UI.openBosses(state); });
  mapPanel.appendChild(bossesShortcut);
  body.appendChild(mapPanel);

  const dexPanel = el('div', 'panel');
  dexPanel.innerHTML = '<h3>📖 Colección</h3>';
  dexPanel.appendChild(objRow('Criaturas descubiertas', s.formsDiscovered, s.totalForms));
  dexPanel.appendChild(objRow('Familias completas (3/3 formas)', s.familiesComplete, s.totalFamilies));
  dexPanel.appendChild(objRow('Elementos en tu banda', s.elementsInRoster, s.totalElements));
  dexPanel.appendChild(objRow('Clases en tu banda', s.classesInRoster, s.totalClasses));
  const pokedexShortcut = el('button', 'primary-btn', '📖 Abrir Pokédex');
  pokedexShortcut.addEventListener('click', () => { $('objectivesModal').classList.add('hidden'); UI.openPokedex(state); });
  dexPanel.appendChild(pokedexShortcut);
  body.appendChild(dexPanel);

  const rosterPanel = el('div', 'panel');
  rosterPanel.innerHTML = `<h3>⭐ Progresión de luchadores</h3>
    <div class="stat-row"><span>Luchadores en tu banda</span><span>${s.rosterSize}</span></div>
    <div class="stat-row"><span>A nivel máximo (${XP_LEVEL_CAP})</span><span>${s.maxLevelCount}</span></div>
    <div class="stat-row"><span>En su evolución final</span><span>${s.finalFormCount}</span></div>
    <div class="stat-row"><span>Estrellas de Superfusión totales</span><span>${s.totalSefStars} ★</span></div>`;
  body.appendChild(rosterPanel);

  const combatPanel = el('div', 'panel');
  const totalBattles = s.battlesWon + s.battlesLost;
  const winRate = totalBattles > 0 ? Math.round(s.battlesWon / totalBattles * 100) : 0;
  combatPanel.innerHTML = `<h3>⚔️ Combate</h3>
    <div class="stat-row"><span>Victorias totales</span><span>${s.battlesWon}</span></div>
    <div class="stat-row"><span>Rango de Arena actual</span><span>${s.arenaRank}</span></div>
    <div class="stat-row"><span>Mejor rango de Arena</span><span>${s.arenaBestRank}</span></div>
    <div class="stat-row"><span>Mejor ronda de Roguelike</span><span>${s.roguelikeBestRound}</span></div>`;
  body.appendChild(combatPanel);

  const historyPanel = el('div', 'panel');
  historyPanel.innerHTML = `<h3>📊 Estadísticas históricas</h3>
    <p class="settings-info">Acumuladas en TODOS los combates de la partida, sea cual sea el modo.</p>
    <div class="stat-row"><span>Combates totales</span><span>${totalBattles}</span></div>
    <div class="stat-row"><span>Derrotas totales</span><span>${s.battlesLost}</span></div>
    <div class="stat-row"><span>% de victorias</span><span>${winRate}%</span></div>
    <div class="stat-row"><span>⚔️ Daño total infligido</span><span>${Math.round(s.totalDmgDealt).toLocaleString('es-ES')}</span></div>
    <div class="stat-row"><span>🛡️ Daño total recibido</span><span>${Math.round(s.totalDmgReceived).toLocaleString('es-ES')}</span></div>
    <div class="stat-row"><span>💚 Curación total</span><span>${Math.round(s.totalHealDone).toLocaleString('es-ES')}</span></div>
    <div class="stat-row"><span>💥 Golpe más fuerte</span><span>${Math.round(s.highestSingleHit).toLocaleString('es-ES')}</span></div>
    <div class="stat-row"><span>🪙 Texel ganado en combate</span><span>${Math.round(s.totalTexelEarned).toLocaleString('es-ES')}</span></div>
    <div class="stat-row"><span>⭐ XP de luchador ganada</span><span>${Math.round(s.totalFighterXpEarned).toLocaleString('es-ES')}</span></div>`;
  body.appendChild(historyPanel);

  const resPanel = el('div', 'panel');
  resPanel.innerHTML = '<h3>🎒 Recursos</h3>';
  resPanel.appendChild(objRow('Equipo en inventario', s.gearOwned, s.gearMax));
  resPanel.appendChild(el('div', 'stat-row', `<span>Homúnculos conseguidos</span><span>${s.homunculosTotal}</span>`));
  body.appendChild(resPanel);

  // ---------- Logros (con recompensa de Gemas) ----------
  const claimedCount = OBJECTIVES.filter(o => state.objectivesClaimed.includes(o.id)).length;
  const achPanel = el('div', 'panel');
  achPanel.innerHTML = `<h3>🏆 Logros <span class="badge">${claimedCount}/${OBJECTIVES.length}</span></h3>
    <p class="settings-info">Cada uno da Gemas la primera vez que lo completas — tócalo para reclamarlo en
    cuanto se desbloquee. Los que ya puedes reclamar aparecen primero.</p>`;
  const achList = el('div', 'torre-list');
  const rankObjective = (obj) => {
    if (state.objectivesClaimed.includes(obj.id)) return 2;
    const { value, target } = objectiveProgress(obj, state, s);
    return value >= target ? 0 : 1;
  };
  OBJECTIVES.slice().sort((a, b) => rankObjective(a) - rankObjective(b)).forEach(obj => achList.appendChild(objectiveRow(state, s, obj)));
  achPanel.appendChild(achList);
  body.appendChild(achPanel);

  $('objectivesModal').classList.remove('hidden');
};

// Texto corto para la recompensa de un objetivo (ver rG/rT/rI/rGear/rC en
// data.js) — se usa tanto en la fila de Logros como en el toast al reclamar.
function rewardLabel(reward) {
  if (reward.type === 'gemas') return `💎 ${reward.amount}`;
  if (reward.type === 'texel') return `🪙 ${reward.amount}`;
  if (reward.type === 'crystal') return `${CRYSTALS[reward.crystalType].icon} ${reward.amount} ${CRYSTALS[reward.crystalType].label}`;
  if (reward.type === 'item') return `${CONSUMABLES[reward.itemId].icon} ${CONSUMABLES[reward.itemId].label}${reward.amount > 1 ? ' ×' + reward.amount : ''}`;
  if (reward.type === 'gear') return `🎒 Equipo ${rarityInfo(reward.rarity).label}`;
  return '';
}

function objectiveRow(state, s, obj) {
  const { value, target } = objectiveProgress(obj, state, s);
  const claimed = state.objectivesClaimed.includes(obj.id);
  const completed = value >= target;
  const row = el('div', 'torre-row' + (claimed ? ' locked' : ''));
  row.appendChild(el('div', 'torre-row-empty-icon', obj.icon));
  const info = el('div', 'torre-row-info');
  info.appendChild(el('div', 'torre-row-name', obj.label));
  info.appendChild(el('div', 'torre-row-sub', `${Math.min(value, target)}/${target} · ${rewardLabel(obj.reward)}`));
  row.appendChild(info);
  const btnCol = el('div', 'torre-row-btns');
  if (claimed) {
    btnCol.appendChild(el('div', 'torre-row-sub', '✅ Reclamado'));
  } else {
    const btn = el('button', 'mini-btn' + (completed ? ' active' : ''), completed ? '🎁 Reclamar' : '🔒');
    btn.disabled = !completed;
    btn.addEventListener('click', () => {
      const gained = claimObjective(state, obj.id);
      if (gained) {
        saveGame(state);
        UI.renderTopbar(state);
        UI.showToast(`${rewardLabel(gained)} — ${obj.label}`);
        UI.openObjectives(state);
      }
    });
    btnCol.appendChild(btn);
  }
  row.appendChild(btnCol);
  return row;
}

// ---------- Jefes ----------
// Misma idea que pokedexCard, pero para los 33 jefes de zona: los nunca
// derrotados se muestran bloqueados (sin arte ni nombre), los derrotados
// muestran su ficha normal y se pueden tocar para ver su perfil.
function bossCard(entry) {
  if (!entry.defeated) {
    const card = el('div', 'creature-card pokedex-locked');
    card.appendChild(el('div', 'pokedex-lock-icon', '❔'));
    card.appendChild(el('div', 'creature-name', '???'));
    return card;
  }
  const def = entry.def;
  const rarity = rarityInfoFor(def);
  const card = el('div', 'creature-card rarity-' + rarity.id);
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--rg', rarity.glow);
  const wrap = el('div', 'creature-canvas-wrap');
  wrap.appendChild(creatureCanvas(def.id));
  card.appendChild(wrap);
  const badge = el('div', 'creature-elclass');
  badge.textContent = ELEMENT_INFO[def.element].icon + CLASS_INFO[def.class].icon;
  card.appendChild(badge);
  card.appendChild(el('div', 'creature-tier-icon', rarity.icon));
  card.appendChild(el('div', 'creature-name', def.name));
  card.addEventListener('click', () => UI.showBossEntry(entry));
  return card;
}

UI.openBosses = function (state) {
  const body = $('bossesModalBody');
  body.innerHTML = '';
  const overview = bossesOverview(state);
  const defeatedCount = overview.filter(e => e.defeated).length;
  body.appendChild(el('h3', null, `👹 Jefes ${defeatedCount}/${overview.length}`));
  body.appendChild(el('p', 'settings-info', 'Los jefes de zona que has derrotado alguna vez. Supera la última etapa de una zona para desbloquear su ficha.'));
  const grid = el('div', 'creature-grid pokedex-grid');
  overview.forEach(entry => grid.appendChild(bossCard(entry)));
  body.appendChild(grid);
  $('bossesModal').classList.remove('hidden');
};

// Ficha de solo lectura de un jefe: arte, historia, tipo/tier y las
// estadísticas de combate REALES con las que se lucha en su zona (mismo
// nivel y bonus de HP de jefe que buildEnemyBand/makeBossUnit en
// combat.js) — a diferencia de la Pokédex no tiene sentido mostrar stats
// "base nivel 1", porque un jefe no es un luchador que el jugador suba de
// nivel, siempre se combate a su nivel de zona.
UI.showBossEntry = function (entry) {
  const def = entry.def;
  const rarity = rarityInfoFor(def);
  const vuln = TYPE_VULNERABILITY[def.class];
  const unit = makeBossUnit(def.id, entry.level);
  const body = $('bossEntryModalBody');
  body.innerHTML = '';
  const head = el('div', 'fighter-modal-head');
  head.appendChild(creatureCanvas(def.id, 90));
  const info = el('div');
  info.innerHTML = `<div class="item-modal-name" style="color:${rarity.color}">${def.name}</div>
    <div class="item-modal-rarity">${rarity.label} · ${ELEMENT_INFO[def.element].label} ${ELEMENT_INFO[def.element].icon} · ${CLASS_INFO[def.class].label} ${CLASS_INFO[def.class].icon}</div>
    <div class="item-modal-rarity">👹 Jefe de ${entry.zone.name} ${entry.zone.emoji}</div>
    ${vuln ? `<div class="type-vuln-note">${vuln.desc}</div>` : ''}`;
  head.appendChild(info);
  body.appendChild(head);

  if (def.lore) {
    const lorePanel = el('div', 'panel');
    lorePanel.innerHTML = `<h3>📜 Historia</h3><p class="settings-info">${def.lore}</p>`;
    body.appendChild(lorePanel);
  }

  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = `<h3>Estadísticas de combate (Nv. ${entry.level})</h3>
    <div class="stat-row"><span>❤️ Vida</span><span>${unit.maxHp}</span></div>
    <div class="stat-row"><span>⚔️ Ataque</span><span>${unit.atk}</span></div>
    <div class="stat-row"><span>🛡️ Defensa</span><span>${unit.def}</span></div>
    <div class="stat-row"><span>💨 Agilidad</span><span>${unit.agi}</span></div>
    <div class="stat-row"><span>🧠 Sabiduría</span><span>${unit.wis}</span></div>`;
  body.appendChild(statsPanel);

  const skill = SKILL_TYPES[def.skillId];
  const skillPanel = el('div', 'panel');
  skillPanel.innerHTML = `<h3>⚡ ${skill.name} (Ulti)</h3><p class="settings-info">${skill.desc}</p>`;
  body.appendChild(skillPanel);

  $('bossEntryModal').classList.remove('hidden');
};

// ---------- Guía ----------
// Referencia estática de todas las mecánicas del juego (elementos, clases,
// estadísticas, rareza/evolución, ultis, Formación/combate, equipo...) —
// pedida por el usuario tras preguntar qué significan los avisos de
// vulnerabilidad de tipo en la ficha de un luchador. No depende de `state`,
// es la misma para cualquier partida; se abre desde el botón "📖 Guía" de
// Ajustes.
function guideSection(title, bodyHtml) {
  const panel = el('div', 'panel');
  panel.innerHTML = `<h3>${title}</h3>${bodyHtml}`;
  return panel;
}
UI.openGuide = function () {
  const body = $('guideModalBody');
  body.innerHTML = '';
  body.appendChild(el('h3', null, '📖 Guía de Defensor de Texel'));
  body.appendChild(el('p', 'settings-info', 'Todas las mecánicas del juego explicadas en un solo sitio.'));

  body.appendChild(guideSection('🌪️ Elementos', `
    <p class="settings-info">Cada luchador tiene un elemento de los 5, en un círculo de ventajas
    (cada uno es fuerte contra el siguiente y débil contra el anterior):</p>
    <p class="settings-info">🔥 Fuego → 🌪️ Viento → ⛰️ Tierra → ⚡ Rayo → 💧 Agua → 🔥 Fuego (y vuelta a empezar)</p>
    <p class="settings-info">Atacar a un elemento del que eres fuerte da <b>+25% de daño</b>; atacar a uno
    del que eres débil hace <b>-20% de daño</b> (0.8×). Sin ventaja ni desventaja, el daño es el normal.</p>`));

  body.appendChild(guideSection('🎭 Clases / Tribus', `
    <p class="settings-info">Cada luchador pertenece a una de 5 clases, que fijan su perfil de
    estadísticas y su rol:</p>
    <p class="settings-info">🛡️ <b>Campeón</b> — Tanque: mucha vida y defensa.<br>
    🗡️ <b>Pícaro</b> — Daño físico: mucho ataque y agilidad.<br>
    🔮 <b>Gurú</b> — Daño mágico: mucha sabiduría.<br>
    💀 <b>Brujo</b> — Híbrido entre ataque y sabiduría.<br>
    🏹 <b>Explorador</b> — Soporte: estadísticas equilibradas.</p>
    <p class="settings-info">Además, cada clase tiene una <b>vulnerabilidad de tipo</b> (el aviso que
    aparece en la ficha del luchador) — daño extra según si el golpe que recibe es "físico" o
    "mágico":</p>
    <p class="settings-info">🛡️ Campeón: <b>+25% de daño mágico</b> recibido.<br>
    🔮 Gurú: <b>+25% de daño físico</b> recibido.<br>
    🗡️ Pícaro: <b>+12% de cualquier daño</b> recibido (físico y mágico).<br>
    💀 Brujo: cruce entre Campeón y Gurú, <b>+10% de cada tipo</b> de daño recibido.<br>
    🏹 Explorador: sin vulnerabilidad especial, no recibe ningún extra.</p>
    <p class="settings-info"><b>¿Qué cuenta como "mágico"?</b> Solo las ultis que golpean a toda una
    fila enemiga a la vez (como Arrasar) — usan la Sabiduría del atacante en vez del Ataque. Todo lo
    demás (golpes básicos y ultis de un solo objetivo) cuenta como "físico" y usa el Ataque.</p>`));

  body.appendChild(guideSection('📊 Estadísticas', `
    <p class="settings-info">❤️ <b>Vida (HP)</b> — cuánto daño aguanta antes de caer.<br>
    ⚔️ <b>Ataque (ATK)</b> — potencia de los golpes básicos y de casi todas las ultis (las "físicas").<br>
    🛡️ <b>Defensa (DEF)</b> — reduce el daño físico y mágico que recibe (la mitad de la Defensa se
    resta directamente del Ataque/Sabiduría de quien golpea).<br>
    💨 <b>Agilidad (AGI)</b> — decide el orden de turnos (actúa antes quien tenga más), sube la
    probabilidad de golpe crítico (+0.15% por punto, hasta 40%) y la carga de ulti que se gana al
    golpear.<br>
    🧠 <b>Sabiduría (WIS)</b> — potencia de las ultis "mágicas" (las de fila, como Arrasar).</p>
    <p class="settings-info">Un golpe <b>crítico</b> multiplica el daño ×1.5; el daño también varía
    de forma aleatoria un ±10% en cada golpe, así que dos ataques idénticos nunca hacen exactamente
    lo mismo.</p>
    <p class="settings-info">🆚 Desde la ficha de cualquier luchador, el botón "Comparar con otro
    luchador" pone sus estadísticas totales (ya con el equipo puesto) lado a lado con las de otro,
    resaltando en verde quién gana cada una — útil para decidir a cuál meter en la Formación.</p>`));

  body.appendChild(guideSection('⭐ Rareza y evolución', `
    <p class="settings-info">5 escalones de rareza: ⚪ Común → 🟢 Infrecuente → 🔵 Raro → 🟣 Épico →
    🟡 Legendario. Cada escalón multiplica bastante las estadísticas base.</p>
    <p class="settings-info">💀 <b>Los jefes de zona son su propio tier</b>, fuera de esta escalera —
    recuadro rojo siempre distintivo, y estadísticas de combate FIJAS ajustadas a mano (no dependen
    del nivel ni de la rareza), para poder calibrar la dificultad de cada uno por separado.</p>
    <p class="settings-info">Cada familia de luchador evoluciona 2 veces (3 formas en total), pero
    no todas arrancan en Común: algunas empiezan más arriba en la escalera y llegan más lejos.</p>
    <p class="settings-info"><b>Fusión (SEF)</b>: usa copias sueltas del mismo luchador como material
    (cada una suma 1 a la barra, hasta 5/5) para poder evolucionarlo a su siguiente forma. Al
    evolucionar, la barra SEF vuelve a 0 para la nueva forma.</p>
    <p class="settings-info"><b>Superfusión</b>: cuando un luchador ya está en su forma máxima (no
    evoluciona más) y tiene la barra SEF a 5/5, se puede <b>sacrificar</b> como material de
    Superfusión de OTRO luchador (en la forma máxima) para darle una ⭐ permanente — hasta 3
    estrellas, cada una da <b>+8% a todas sus estadísticas</b> para siempre.</p>`));

  body.appendChild(guideSection('📈 Nivel, XP y Homúnculos', `
    <p class="settings-info">Los luchadores suben de nivel (hasta el tope de nivel ${XP_LEVEL_CAP})
    ganando experiencia al ganar combates — cada nivel sube todas sus estadísticas un poco.</p>
    <p class="settings-info">Los <b>Homúnculos</b> (se consiguen invocando) no luchan nunca: se
    fusionan directamente con un luchador de tu Colección para darle experiencia al instante, sin
    tener que combatir. Cuanto mayor el Homúnculo, más experiencia da.</p>`));

  body.appendChild(guideSection('⚡ Ultis', `
    <p class="settings-info">Cada luchador tiene una única habilidad especial (ulti) que se carga
    peleando: golpear o recibir daño llena la barra morada. Al llegar al máximo, se desata sola en
    el siguiente turno de ese luchador en vez de un golpe normal.</p>
    <p class="settings-info">Hay ultis de varios tipos: daño a un objetivo, daño mágico a toda una
    fila (Arrasar), curar (a sí mismo o a toda la fila propia), subir una estadística (a sí mismo o
    a toda la fila), debilitar la defensa rival, aturdir (con probabilidad de fallar), veneno/quemadura
    que muerde varios turnos ignorando defensa, drenar vida (cura una parte del daño hecho),
    purificar (quita todos los males de estado de la fila propia) y revivir a un aliado caído.</p>
    <p class="settings-info">Las ultis que no hacen daño por sí mismas (curar, subir estadísticas,
    purificar, revivir...) también golpean a un enemigo con un golpe extra más flojo — ningún turno
    de ulti se queda sin hacer daño.</p>`));

  body.appendChild(guideSection('🐾 Formación y combate', `
    <p class="settings-info">La Formación es una rejilla 3×3 donde colocas hasta 9 luchadores. La
    celda central es la de <b>líder</b>: si el luchador que la ocupa tiene habilidad de líder, esa
    bonificación (+15% a una estadística de toda la banda) se aplica mientras esté ahí colocado.</p>
    <p class="settings-info">En combate, cada ronda eliges 1 de las 8 líneas posibles de la
    Formación (3 filas, 3 columnas, 2 diagonales) deslizando el dedo sobre la rejilla — esos 3
    luchadores se enfrentan a la fila enemiga activa. Una vez usada, esa línea queda tachada hasta
    que se agoten las demás; cuando ya no queda ninguna línea viva sin usar, todas vuelven a estar
    disponibles.</p>
    <p class="settings-info">El pequeño número junto al rayo ⚡ sobre cada luchador indica cuántos
    golpes le faltan para tener la ulti lista ("¡LISTA!" cuando ya puede desatarla).</p>
    <p class="settings-info">Cada personaje del selector también muestra un ▲ verde o ▼ rojo si
    tiene ventaja o desventaja elemental clara contra la fila enemiga activa — útil para decidir qué
    línea enviar. El botón "🤖 Auto" resuelve la batalla entera sin tener que elegir línea cada
    ronda (elige siempre la de mejor ventaja elemental media); queda activado para el resto de la
    partida hasta que lo desactives, incluidos los siguientes combates de un mismo recorrido. El
    botón ⏱️ junto a él cicla la velocidad de la animación de combate entre 1×, 2× y 3×.</p>
    <p class="settings-info">Los jefes de zona tienen 2 mecánicas propias que ningún otro rival
    tiene: al bajar del 30% de su vida entran en <b>Furia</b> (+25% Ataque y Sabiduría el resto del
    combate), y cada 4º golpe básico suyo es un <b>Golpe Devastador</b> — crítico garantizado y algo
    más fuerte de lo normal.</p>`));

  body.appendChild(guideSection('🗡️ Equipo', `
    <p class="settings-info">6 huecos de equipo por luchador (arma, armadura, casco, guantes,
    botas, amuleto), cada uno con 3 tipos distintos que reparten sus bonificaciones entre dos
    estadísticas de forma diferente (p.ej. un hacha da mucho Ataque y algo de Vida; una lanza da
    Ataque y Agilidad). Cada pieza tiene su propia rareza (igual escalera que los luchadores) y se
    puede mejorar con Texel para subir su bonificación un poco más en cada nivel.</p>`));

  body.appendChild(guideSection('🌋 Mazmorra Elemental', `
    <p class="settings-info">Reto de mitad de partida: se desbloquea al completar las primeras
    ${ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID)} zonas del mapa, o antes desde
    Ajustes con el modo de prueba. Hay una mazmorra por cada uno de los 5 elementos.</p>
    <p class="settings-info">Eliges hasta 3 luchadores del MISMO elemento (se guardan para la
    próxima vez) y se enfrentan a 2 oleadas y un Guardián Elemental del elemento que CONTRARRESTA
    al tuyo — desventaja elemental de partida a propósito, así que hace falta buen nivel y equipo
    para ganar. Recompensa mejor que una etapa normal, con una pieza de equipo garantizada.</p>`));

  body.appendChild(guideSection('🗼 Torre Batalla', `
    <p class="settings-info">Modo endgame: se desbloquea al completar el mapa entero (derrotar al
    jefe de las ${ZONES.length} zonas), o antes desde Ajustes con el modo de prueba. Una escalera de
    ${TORRE_LEVELS.length} niveles: primero uno por cada familia de mob, después uno por cada jefe
    del mapa, del más sencillo al más difícil.</p>
    <p class="settings-info">Cada nivel enfrenta siempre al mismo rival (su forma más fuerte, o el
    jefe en sí) repetido varias veces. Ganar da 1 copia del tier más bajo de esa familia (o del
    jefe) para tu Colección — jugable igual que cualquier otro luchador: se puede colocar en la
    Formación, equipar y evolucionar. Los niveles son rejugables para conseguir más copias, y se
    desbloquean en orden, superando siempre el anterior.</p>`));

  body.appendChild(guideSection('⚔️ Prueba del Campeón', `
    <p class="settings-info">Disponible desde el principio, sin desbloqueo: elige UN único luchador
    de tu Colección para encadenar duelos 1 contra 1 cada vez más difíciles, sin curarse ni recargar
    ulti entre uno y otro — perder termina el intento donde esté. Cada duelo ganado da Texel y XP
    crecientes, y se guarda tu mejor racha de duelos seguidos.</p>`));

  body.appendChild(guideSection('🧳 Mercader Itinerante', `
    <p class="settings-info">En la Tienda: una oferta nueva cada día que cambia varias copias sueltas
    de una rareza por una pieza de equipo o un puñado de cristales — solo se puede canjear una vez al
    día, así que conviene revisarla a menudo.</p>`));

  body.appendChild(guideSection('🎲 Duelo por apuesta', `
    <p class="settings-info">En cualquier zona cuyo jefe ya hayas derrotado: una revancha contra
    él, con las estadísticas reforzadas respecto a la primera vez, apostando Texel — ganas
    y te devuelve el doble, pierdes y lo pierdes.</p>`));

  body.appendChild(guideSection('🎯 Progreso', `
    <p class="settings-info">📖 <b>Pokédex</b> (en Colección): registro de todas las formas
    jugables que has conseguido alguna vez, y de los mobs/jefes conseguidos en la Torre Batalla.<br>
    👹 <b>Jefes</b> (en Objetivos → Mapa): igual que la Pokédex, pero de los jefes derrotados.<br>
    🎯 <b>Objetivos</b>: resumen general de tu progreso — zonas, etapas, Pokédex, jefes, banda,
    equipo y más, incluidas las <b>estadísticas históricas</b> de toda la partida (combates,
    daño hecho/recibido, Texel y XP ganados en combate...), acumuladas en todos los modos.</p>`));

  body.appendChild(guideSection('💾 Copia de seguridad y acciones en lote', `
    <p class="settings-info">Desde Ajustes puedes <b>exportar tu partida</b> a un código de texto
    para guardarla a salvo o pasarla a otro dispositivo, y <b>importarla</b> pegando ese código —
    sustituye la partida actual, así que exporta primero si quieres conservarla.</p>
    <p class="settings-info">En la Colección, el botón "☑️ Selección múltiple" te deja tocar varios
    luchadores a la vez para venderlos o fusionar duplicados del mismo tipo de golpe, en vez de
    tener que hacerlo uno a uno.</p>`));

  $('guideModal').classList.remove('hidden');
};

// ---------- Topbar ----------
UI.renderTopbar = function (state) {
  $('texelVal').textContent = Math.floor(state.currencies.texel).toLocaleString('es-ES');
  $('gemasVal').textContent = Math.floor(state.currencies.gemas).toLocaleString('es-ES');
  $('energiaVal').textContent = state.settings.infiniteEnergy ? '∞' : Math.floor(state.currencies.energy);
  $('energiaMax').textContent = state.settings.infiniteEnergy ? '∞' : MAX_ENERGY;
  // Punto rojo en 🎯: hay al menos un Logro completado y sin reclamar.
  const s = objectivesSummary(state);
  const hasClaimable = OBJECTIVES.some(obj => !state.objectivesClaimed.includes(obj.id) && objectiveCompleted(obj, state, s));
  $('objectivesBadge').classList.toggle('hidden', !hasClaimable);
};

UI.switchScreen = function (name) {
  activeScreen = name;
  document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
  $('screen-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
  UI.renderScreen(name, window.STATE);
};

UI.renderScreen = function (name, state) {
  if (name === 'mapa') UI.renderMapa(state);
  else if (name === 'banda') UI.renderBanda(state);
  else if (name === 'invocar') UI.renderInvocar(state);
  else if (name === 'arena') UI.renderArena(state);
  else if (name === 'equipo') UI.renderEquipo(state);
  else if (name === 'tienda') UI.renderTienda(state);
  else if (name === 'torre') UI.renderTorre(state);
};

// ---------- Mapa ----------
UI.renderMapa = function (state) {
  mapaZoneIdx = null;
  $('stageList').classList.add('hidden');
  $('stageRunView').classList.add('hidden');
  $('zoneList').classList.remove('hidden');
  const list = $('zoneList');
  list.innerHTML = '';
  ZONES.forEach((zone, idx) => {
    const unlocked = isZoneUnlocked(state, zone.id);
    const best = highestClearedStage(state, zone.id);
    const card = el('div', 'panel loc-card' + (unlocked ? '' : ' locked'));
    card.style.background = zoneBackgroundStyle(zone);
    card.innerHTML = `
      <div class="loc-card-head"><span class="loc-card-emoji">${zone.emoji}</span><div><b>${zone.name}</b><br><small>${unlocked ? 'Progreso: ' + (best + 1) + '/' + STAGES_PER_ZONE : '🔒 Bloqueado'}</small></div></div>
      ${unlocked ? `<button class="primary-btn" id="openzone-${zone.id}">Entrar</button>` : `<div class="locked-tag">Derrota al jefe de la zona anterior</div>`}`;
    list.appendChild(card);
    if (unlocked) $('openzone-' + zone.id).addEventListener('click', () => UI.openZoneStages(state, idx));
  });
};

UI.openZoneStages = function (state, zoneIdx) {
  mapaZoneIdx = zoneIdx;
  $('zoneList').classList.add('hidden');
  $('stageRunView').classList.add('hidden');
  const wrap = $('stageList');
  wrap.classList.remove('hidden');
  wrap.innerHTML = '';
  const zone = ZONES[zoneIdx];
  wrap.style.background = zoneBackgroundStyle(zone);
  const back = el('button', 'mini-btn', '« Volver al mapa');
  back.addEventListener('click', () => UI.renderMapa(state));
  wrap.appendChild(back);
  wrap.appendChild(el('h3', null, zone.emoji + ' ' + zone.name));
  const grid = el('div', 'stage-grid');
  for (let i = 0; i < STAGES_PER_ZONE; i++) {
    const isBoss = i === STAGES_PER_ZONE - 1;
    const unlocked = isStageUnlocked(state, zone.id, i);
    const cleared = i <= highestClearedStage(state, zone.id);
    const btn = el('button', 'stage-btn' + (isBoss ? ' boss' : '') + (cleared ? ' cleared' : '') + (!unlocked ? ' locked' : ''));
    btn.innerHTML = isBoss ? '👑' : (i + 1);
    if (cleared) btn.innerHTML += '<span class="stage-check">✓</span>';
    if (unlocked) btn.addEventListener('click', () => UI.startStageBattle(state, zoneIdx, i));
    else btn.disabled = true;
    grid.appendChild(btn);
  }
  wrap.appendChild(grid);
  wrap.appendChild(el('p', 'settings-info', 'Cada etapa cuesta ' + STAGE_ENERGY_COST + ' ⚡ y se recorre nodo a nodo, con varios encuentros antes de la recompensa. La etapa 8 es el jefe de zona: un único combate, solo contra él.'));

  // Duelo por apuesta: solo si ya se derrotó al jefe de esta zona — una
  // revancha contra ÉL (con las estadísticas reforzadas, ver
  // WAGER_BOSS_BOOST) arriesgando Texel a cambio del doble si se gana.
  if (highestClearedStage(state, zone.id) >= STAGES_PER_ZONE - 1) {
    const wagerBtn = el('button', 'mini-btn', '🎲 Duelo por apuesta');
    wagerBtn.addEventListener('click', () => UI.openWagerDuel(state, zoneIdx));
    wrap.appendChild(wagerBtn);
  }
};

// ---------- Duelo por apuesta ----------
// Revancha contra el jefe de una zona ya derrotada — un único combate,
// arriesgando Texel por adelantado a cambio del doble si se gana, nada si
// se pierde. El jefe pelea con estadísticas reforzadas respecto a la
// primera vez (ver WAGER_BOSS_BOOST más abajo): ya se le venció una vez con
// el nivel de esa zona, así que sin el refuerzo sería un trámite en vez de
// un reto que justifique arriesgar el doble.
//
// Es repetible sin límite, así que además del ×1.3 fijo se combina con
// bossAdaptiveMult(state, zoneIdx) — el mismo escalado del jefe normal del
// Mapa: sin él, una vez la banda del jugador supera el ritmo de esa zona
// (a través de equipo/estrellas/invocaciones, sin relación con "haber
// vencido antes a ese jefe"), la apuesta deja de tener riesgo real y se
// convierte en Texel gratis repetible sin fin — el mismo fallo de fondo
// que hacía trivial al jefe del Mapa, pero aquí además con un exploit de
// economía detrás.
const WAGER_BOSS_BOOST = 1.3;
UI.openWagerDuel = function (state, zoneIdx) {
  const zone = ZONES[zoneIdx];
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>🎲 Duelo por apuesta</h3>
    <p class="settings-info">Revancha contra ${zone.emoji} ${zone.name} · el jefe de la zona, con las
    estadísticas reforzadas — más difícil que la primera vez que lo venciste.
    Ganas y te devuelve el doble de lo apostado; pierdes y lo pierdes.
    Cuesta ${STAGE_ENERGY_COST} ⚡ como cualquier otro combate.</p>`;
  const wagerOptions = [100, 300, 1000].filter(amount => amount <= state.currencies.texel);
  if (wagerOptions.length === 0) {
    body.appendChild(el('div', 'empty-hint', 'No tienes suficiente Texel para apostar.'));
  } else {
    wagerOptions.forEach(amount => {
      const btn = el('button', 'primary-btn', '🪙 Apostar ' + amount + ' (ganas ' + amount * 2 + ')');
      btn.addEventListener('click', () => {
        $('pickerModal').classList.add('hidden');
        UI.startWagerDuel(state, zoneIdx, amount);
      });
      body.appendChild(btn);
    });
  }
  $('pickerModal').classList.remove('hidden');
};

UI.startWagerDuel = function (state, zoneIdx, amount) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (state.currencies.texel < amount) { UI.showToast('⚠️ No tienes suficiente Texel.'); return; }
  // Es la única actividad de combate repetible del juego que no costaba
  // Energía (Etapas y Torre sí) — combinado con bossAdaptiveMult, que no
  // siempre puede reforzar lo suficiente a un jefe SOLO de una zona floja
  // frente a una banda ya de fin de partida (un jefe de zona 1 nunca puede
  // ponerse tan tanque como uno propio de zona 30 sin volverse injusto),
  // eso convertía la apuesta en Texel gratis repetible sin límite. El
  // mismo coste que ya frena el resto del contenido pone un tope real a
  // cuántas veces se puede intentar, tenga o no riesgo real esa zona en
  // concreto.
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
  }
  window.__championRun = null;
  state.currencies.texel -= amount;
  saveGame(state);
  UI.renderTopbar(state);
  const { rows } = buildEnemyBand(zoneIdx, STAGES_PER_ZONE - 1, WAGER_BOSS_BOOST * bossAdaptiveMult(state, zoneIdx));
  const combos = buildPlayerCombinations(state);
  UI.openBattle(state, combos, [rows[0]], {
    title: '🎲 Apuesta · ' + ZONES[zoneIdx].name + ' (jefe reforzado)',
    zone: ZONES[zoneIdx],
    onEnd: (result) => {
      if (result === 'victoria') {
        state.currencies.texel += amount * 2;
        saveGame(state);
        return { wagerWon: amount * 2 };
      }
      saveGame(state);
      return { wagerLost: amount };
    },
  });
};

// Entrar en una etapa ya no abre directamente una batalla: se paga la
// energía una vez y se abre el recorrido (ver renderStageRun), con un nodo
// de combate por cada oleada que antes se libraba dentro de una única
// batalla. Solo al superar el último nodo se entrega la recompensa de la
// etapa; perder cualquier nodo termina el recorrido sin recompensa.
UI.startStageBattle = function (state, zoneIdx, stageIdx) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  // El multiplicador adaptativo (ver bossAdaptiveMult en state.js) solo
  // afecta a la etapa del jefe (buildEnemyBand lo ignora en el resto) y
  // solo sube por encima de 1× si la banda ya va muy por encima de lo
  // esperado para esta zona — nunca debilita al jefe.
  const { rows, isBoss } = buildEnemyBand(zoneIdx, stageIdx, bossAdaptiveMult(state, zoneIdx));
  const encounters = rows.filter(r => r.length > 0);
  // hpMap/faintedSet/chargeMap llevan la cuenta de la vida, los desmayos y la
  // carga de ulti de cada luchador durante TODA la etapa (entre nodos del
  // recorrido) — ya no se cura ni se reinicia la ulti sola al pasar de
  // encuentro, de ahí que la Tienda venda pociones y plumas fénix.
  window.__championRun = null;
  window.__stageRun = { zoneIdx, stageIdx, isBoss, encounters, nodeIdx: 0, failed: false, hpMap: {}, faintedSet: new Set(), chargeMap: {} };
  UI.renderStageRun(state);
};

// Uids que realmente combaten en este recorrido: la Formación 3×3 normal
// para una etapa del Mapa o un nivel de Torre, o el equipo mono-elemento
// de 3 elegido para una Mazmorra Elemental (ver UI.openElementalTeamPicker).
function runFighterUids(state, run) {
  return run.isElemental ? elementalTeamUids(state, run.elementId) : state.band.flat().filter(Boolean);
}

// Fondo de zona "pseudo" para Torre Batalla y Mazmorra Elemental — no son
// una zona real de ZONES, pero reutilizan el mismo mecanismo de
// zoneBackgroundStyle (assets/scenery/<id>.jpg si existe, degradado del
// color de respaldo si no) tanto en el recorrido de nodos como en la
// propia batalla, en vez de quedarse sin fondo alguno.
function runPseudoZone(run) {
  if (run.isElemental) return { id: 'elemental_' + run.elementId, color: ELEMENT_INFO[run.elementId].color };
  if (run.isTorre) return { id: 'torre', color: '#3a3a4a' };
  if (run.isTierCap) return { id: 'tiercap', color: '#3a2a4a' };
  return null;
}

UI.renderStageRun = function (state) {
  $('zoneList').classList.add('hidden');
  $('stageList').classList.add('hidden');
  const wrap = $('stageRunView');
  wrap.classList.remove('hidden');
  wrap.innerHTML = '';
  const run = window.__stageRun;
  const zone = (run.isTorre || run.isElemental || run.isTierCap) ? null : ZONES[run.zoneIdx];
  wrap.style.background = zoneBackgroundStyle(runPseudoZone(run) || zone);

  const back = el('button', 'mini-btn', '« Retirarse');
  back.addEventListener('click', () => {
    window.__stageRun = null;
    if (run.isTorre || run.isElemental || run.isTierCap) UI.renderTorre(state); else UI.openZoneStages(state, run.zoneIdx);
  });
  wrap.appendChild(back);
  wrap.appendChild(el('h3', null, run.isElemental
    ? ELEMENT_INFO[run.elementId].icon + ' Mazmorra de ' + ELEMENT_INFO[run.elementId].label
    : run.isTorre
    ? '🗼 Torre — ' + torreLevelLabel(TORRE_LEVELS[run.torreIdx])
    : run.isTierCap
    ? '🎯 Tope de Tier — ' + TIER_CAP_LEVELS[run.tierCapIdx].label
    : zone.emoji + ' ' + zone.name + ' · ' + (run.isBoss ? 'Jefe de zona' : 'Etapa ' + (run.stageIdx + 1))));

  const path = el('div', 'stage-run-path');
  run.encounters.forEach((enemyRow, i) => {
    const isFinalCombat = run.isBoss && i === run.encounters.length - 1;
    const node = el('div', 'stage-run-node' + (i < run.nodeIdx ? ' cleared' : i === run.nodeIdx ? ' current' : ' locked'));
    node.textContent = i < run.nodeIdx ? '✓' : (isFinalCombat ? '👑' : '⚔️');
    path.appendChild(node);
    path.appendChild(el('div', 'stage-run-connector' + (i < run.nodeIdx ? ' cleared' : '')));
  });
  const chestNode = el('div', 'stage-run-node chest' + (run.nodeIdx >= run.encounters.length ? ' cleared' : ' locked'));
  chestNode.textContent = '🎁';
  path.appendChild(chestNode);
  wrap.appendChild(path);

  if (run.nodeIdx < run.encounters.length) {
    const bandUids = runFighterUids(state, run);
    const fighterCard = (uid) => {
      const entry = rosterEntry(state, uid);
      const status = runFighterStatus(state, run, uid);
      const card = el('div', 'stage-run-fighter' + (status.fainted ? ' fainted' : ''));
      card.appendChild(creatureCanvas(entry.defId, 40));
      const hpBar = el('div', 'hp-bar small');
      const fill = el('div', 'hp-fill');
      fill.style.width = Math.max(0, status.hp / status.maxHp * 100) + '%';
      hpBar.appendChild(fill);
      card.appendChild(hpBar);
      if (status.fainted) card.appendChild(el('div', 'fainted-icon', '💀'));
      return card;
    };
    const bandStatus = el('div', 'stage-run-band');
    if (run.isElemental) {
      // Equipo mono-elemento de hasta 3: una única fila, sin huecos vacíos
      // de la Formación 3×3 (aquí no aplica esa forma).
      const rowEl = el('div', 'stage-run-band-row');
      bandUids.forEach(uid => rowEl.appendChild(fighterCard(uid)));
      bandStatus.appendChild(rowEl);
    } else {
      // Se muestra con la forma real de la Formación 3×3 (huecos vacíos
      // incluidos) en vez de una fila seguida, para que se vea de un
      // vistazo qué línea puede formarse antes de entrar al combate.
      for (let r = 0; r < BAND_ROWS; r++) {
        const rowEl = el('div', 'stage-run-band-row');
        for (let c = 0; c < BAND_COLS; c++) {
          const uid = state.band[r][c];
          if (!uid || !rosterEntry(state, uid)) { rowEl.appendChild(el('div', 'stage-run-fighter empty')); continue; }
          rowEl.appendChild(fighterCard(uid));
        }
        bandStatus.appendChild(rowEl);
      }
    }
    wrap.appendChild(bandStatus);

    const hasFainted = bandUids.some(uid => run.faintedSet.has(uid));
    const hasDamaged = bandUids.some(uid => { const st = runFighterStatus(state, run, uid); return !st.fainted && st.hp < st.maxHp; });
    if (hasDamaged || hasFainted) {
      const itemsRow = el('div', 'stage-run-items');
      if (hasDamaged) {
        ['pocion_menor', 'pocion_mayor'].forEach(itemId => {
          const count = state.items[itemId] || 0;
          if (count <= 0) return;
          const item = CONSUMABLES[itemId];
          const btn = el('button', 'mini-btn', item.icon + ' ' + item.label + ' (' + count + ')');
          btn.addEventListener('click', () => UI.useStageRunItem(state, itemId));
          itemsRow.appendChild(btn);
        });
      }
      if (hasFainted && (state.items.pluma_fenix || 0) > 0) {
        const item = CONSUMABLES.pluma_fenix;
        const btn = el('button', 'mini-btn', item.icon + ' ' + item.label + ' (' + state.items.pluma_fenix + ')');
        btn.addEventListener('click', () => UI.useStageRunItem(state, 'pluma_fenix'));
        itemsRow.appendChild(btn);
      }
      wrap.appendChild(itemsRow);
    }

    const preview = el('div', 'stage-run-preview');
    run.encounters[run.nodeIdx].forEach(u => preview.appendChild(creatureCanvas(u.defId, 56)));
    wrap.appendChild(preview);
    const fightBtn = el('button', 'primary-btn', 'Luchar (encuentro ' + (run.nodeIdx + 1) + '/' + run.encounters.length + ')');
    fightBtn.disabled = bandUids.every(uid => run.faintedSet.has(uid));
    fightBtn.addEventListener('click', () => UI.fightStageRunNode(state));
    wrap.appendChild(fightBtn);
  }
};

function runFighterStatus(state, run, uid) {
  const entry = rosterEntry(state, uid);
  const stats = fighterStats(state, entry);
  const fainted = run.faintedSet.has(uid);
  const hp = fainted ? 0 : (run.hpMap[uid] !== undefined ? run.hpMap[uid] : stats.hp);
  return { hp, maxHp: stats.hp, fainted };
}

UI.useStageRunItem = function (state, itemId) {
  const run = window.__stageRun;
  if (!run || (state.items[itemId] || 0) <= 0) return;
  const item = CONSUMABLES[itemId];
  const bandUids = runFighterUids(state, run);
  if (item.healPct) {
    bandUids.forEach(uid => {
      if (run.faintedSet.has(uid)) return;
      const entry = rosterEntry(state, uid);
      const stats = fighterStats(state, entry);
      const current = run.hpMap[uid] !== undefined ? run.hpMap[uid] : stats.hp;
      run.hpMap[uid] = Math.min(stats.hp, current + Math.round(stats.hp * item.healPct));
    });
  } else if (item.revivePct) {
    const target = bandUids.find(uid => run.faintedSet.has(uid));
    if (!target) return;
    const entry = rosterEntry(state, target);
    const stats = fighterStats(state, entry);
    run.faintedSet.delete(target);
    run.hpMap[target] = Math.round(stats.hp * item.revivePct);
  }
  state.items[itemId]--;
  saveGame(state);
  UI.renderTopbar(state);
  UI.renderStageRun(state);
  UI.showToast(item.icon + ' ' + item.label + ' usada');
};

UI.fightStageRunNode = function (state) {
  const run = window.__stageRun;
  const enemyRow = run.encounters[run.nodeIdx];
  // Una Mazmorra Elemental no tiene 8 líneas entre las que elegir (solo un
  // equipo fijo de hasta 3) — se le pasa a UI.openBattle como una única
  // fila, igual que cuando a una etapa normal solo le queda 1 combinación
  // viva: se autoconfirma sin mostrar el selector de línea.
  const playerCombos = run.isElemental ? [buildElementalTeamUnits(state, run.elementId)] : buildPlayerCombinations(state);
  // Aplica el HP/estado/carga de ulti con el que ha llegado cada luchador de
  // nodos anteriores de este recorrido — ya no se cura ni se reinicia la
  // ulti sola al pasar de encuentro.
  playerCombos.forEach(row => row.forEach(u => {
    if (!u.sourceUid) return;
    if (run.faintedSet.has(u.sourceUid)) { u.hp = 0; u.alive = false; }
    else if (run.hpMap[u.sourceUid] !== undefined) { u.hp = Math.min(u.maxHp, run.hpMap[u.sourceUid]); }
    if (run.chargeMap[u.sourceUid] !== undefined) u.ultCharge = run.chargeMap[u.sourceUid];
  }));
  UI.openBattle(state, playerCombos, [enemyRow], {
    title: run.isElemental
      ? ELEMENT_INFO[run.elementId].icon + ' Mazmorra de ' + ELEMENT_INFO[run.elementId].label + ' · Encuentro ' + (run.nodeIdx + 1) + '/' + run.encounters.length
      : run.isTorre
      ? '🗼 Torre · Encuentro ' + (run.nodeIdx + 1) + '/' + run.encounters.length
      : run.isTierCap
      ? '🎯 Tope de Tier · Encuentro ' + (run.nodeIdx + 1) + '/' + run.encounters.length
      : ZONES[run.zoneIdx].name + ' · Encuentro ' + (run.nodeIdx + 1) + '/' + run.encounters.length,
    zone: runPseudoZone(run) || ZONES[run.zoneIdx],
    onEnd: (result, view) => {
      if (view) {
        view.playerGroups.forEach(g => g.row.forEach(u => {
          if (!u.sourceUid) return;
          run.hpMap[u.sourceUid] = u.hp;
          run.chargeMap[u.sourceUid] = u.ultCharge;
          if (u.alive) run.faintedSet.delete(u.sourceUid); else run.faintedSet.add(u.sourceUid);
        }));
      }
      if (result !== 'victoria') {
        run.failed = true;
        saveGame(state);
        return null;
      }
      run.nodeIdx++;
      if (run.nodeIdx < run.encounters.length) {
        saveGame(state);
        return { intermediate: true };
      }
      if (run.isElemental) {
        const isFirstClear = !state.elementalClears[run.elementId];
        const rewards = elementalDungeonRewards(isFirstClear);
        state.currencies.texel += rewards.texel;
        if (rewards.drops.voxite) state.currencies.voxite += rewards.drops.voxite;
        if (rewards.drops.doxite) state.currencies.doxite += rewards.drops.doxite;
        if (rewards.drops.gear) addGear(state, rewards.drops.gear);
        const leveled = [];
        (state.elementalTeams[run.elementId] || []).forEach(uid => {
          const entry = rosterEntry(state, uid);
          if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
        });
        recordElementalClear(state, run.elementId);
        saveGame(state);
        return { rewards, leveled };
      }
      if (run.isTorre) {
        const level = TORRE_LEVELS[run.torreIdx];
        const rewards = torreRewards(run.torreIdx);
        state.currencies.texel += rewards.texel;
        const leveled = [];
        state.band.flat().filter(Boolean).forEach(uid => {
          const entry = rosterEntry(state, uid);
          if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
        });
        const capture = applySummonResult(state, level.rewardDefId);
        recordTorreClear(state, run.torreIdx);
        saveGame(state);
        return { rewards, leveled, capturedCopy: fighterDef(level.rewardDefId), capturedIsNew: capture.outcome === 'nuevo' };
      }
      if (run.isTierCap) {
        const rewards = tierCapRewards(run.tierCapIdx);
        state.currencies.texel += rewards.texel;
        const leveled = [];
        state.band.flat().filter(Boolean).forEach(uid => {
          const entry = rosterEntry(state, uid);
          if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
        });
        recordTierCapClear(state, run.tierCapIdx);
        saveGame(state);
        return { rewards, leveled };
      }
      const isFirstClear = run.stageIdx > highestClearedStage(state, ZONES[run.zoneIdx].id);
      const rewards = stageRewards(run.zoneIdx, run.stageIdx, run.isBoss, isFirstClear);
      state.currencies.texel += rewards.texel;
      if (rewards.drops.pixite) state.currencies.pixite += rewards.drops.pixite;
      if (rewards.drops.voxite) state.currencies.voxite += rewards.drops.voxite;
      if (rewards.drops.doxite) state.currencies.doxite += rewards.drops.doxite;
      if (rewards.drops.gear) addGear(state, rewards.drops.gear);
      const leveled = [];
      state.band.flat().filter(Boolean).forEach(uid => {
        const entry = rosterEntry(state, uid);
        if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
      });
      const { unlockedZone, zoneGemsBonus } = recordStageClear(state, run.zoneIdx, run.stageIdx);
      saveGame(state);
      return { rewards, leveled, unlockedZone, zoneGemsBonus };
    },
  });
};

// ---------- Retos (Mazmorra Elemental + Torre Batalla) ----------
// Ambas reutilizan el mismo recorrido nodo-a-nodo que una etapa normal del
// Mapa (UI.renderStageRun/UI.fightStageRunNode, con ramas `run.isElemental`
// / `run.isTorre` para el título/fondo/recompensa) en vez de duplicar esa
// pantalla entera.
function torreLevelLabel(level) {
  return (level.kind === 'mob' ? 'Mob ' : 'Jefe ') + (level.sectionIdx + 1) + ': ' + fighterDef(level.fightDefId).name;
}
UI.renderTorre = function (state) {
  $('stageRunView').classList.add('hidden');
  const wrap = $('torreBody');
  wrap.innerHTML = '';
  UI.renderChampionTrial(state, wrap);
  UI.renderTierCap(state, wrap);
  UI.renderElementalDungeons(state, wrap);

  if (!torreUnlocked(state)) {
    const cleared = ZONES.filter(z => highestClearedStage(state, z.id) >= STAGES_PER_ZONE - 1).length;
    wrap.appendChild(el('div', 'panel', `
      <h3>🔒 Torre Batalla bloqueada</h3>
      <p class="settings-info">Se desbloquea al completar el mapa entero: derrota al jefe de las
      ${ZONES.length} zonas. Progreso actual: ${cleared}/${ZONES.length} jefes de zona derrotados.</p>
      <p class="settings-info">También puedes activarla ya para probarla desde Ajustes → "Torre Batalla (modo de prueba)".</p>`));
  } else {
    wrap.appendChild(el('h3', null, '🗼 Torre Batalla'));
    wrap.appendChild(el('p', 'settings-info', `Un nivel por cada mob y cada jefe del juego. Enfréntate
      a su forma más fuerte repetida varias veces — ganar da 1 copia del tier más bajo de esa familia
      (o del jefe) para tu Colección, jugable igual que cualquier otro luchador. Los niveles son
      rejugables para conseguir más copias.`));

    const renderSection = (title, kind) => {
      wrap.appendChild(el('h3', null, title));
      const list = el('div', 'torre-list');
      TORRE_LEVELS.forEach((level, idx) => {
        if (level.kind !== kind) return;
        const unlocked = isTorreLevelUnlocked(state, idx);
        const clears = torreClearCount(state, level);
        const row = el('div', 'torre-row' + (unlocked ? '' : ' locked'));
        row.appendChild(creatureCanvas(level.fightDefId, 40));
        const info = el('div', 'torre-row-info');
        info.appendChild(el('div', 'torre-row-name', torreLevelLabel(level)));
        info.appendChild(el('div', 'torre-row-sub', unlocked
          ? `Nv. ${level.enemyLevel} · ×${level.enemyCount}${clears > 0 ? ' · superado ' + clears + 'x' : ''}`
          : '🔒 Supera el nivel anterior'));
        row.appendChild(info);
        if (unlocked) row.addEventListener('click', () => UI.startTorreLevel(state, idx));
        list.appendChild(row);
      });
      wrap.appendChild(list);
    };
    renderSection('👹 Mobs', 'mob');
    renderSection('👑 Jefes', 'boss');
  }

  // Se renderiza SIEMPRE (con su propio panel de "bloqueado" si hace
  // falta), igual que Prueba del Campeón/Mazmorra Elemental más arriba —
  // si no, cuando la Torre Batalla en sí está bloqueada (el caso normal
  // durante la mayor parte de la partida) esta sección entera desaparecía
  // sin más, en vez de mostrarse como "bloqueado hasta terminar la Torre".
  UI.renderRoguelike(state, wrap);
};

// ---------- Tope de Tier ----------
// Reto de restricción de Formación (ver TIER_CAP_LEVELS en data.js): antes
// de dejar empezar cada nivel se comprueba formationMeetsConstraint
// (state.js) sobre TODA la Formación actual (huecos vacíos no cuentan).
// Sin desbloqueo (disponible desde el principio, como Prueba del Campeón)
// — no es una escalera de poder, es una restricción de montaje, así que no
// tiene sentido gatearla detrás de otro contenido.
UI.renderTierCap = function (state, wrap) {
  wrap.appendChild(el('h3', null, '🎯 Tope de Tier'));
  wrap.appendChild(el('p', 'settings-info', `Antes de cada nivel, monta tu Formación entera dentro de la
    restricción indicada (rareza/elemento/clase) — un reto pensado para forzarte a usar luchadores
    distintos a tu equipo habitual.`));
  const list = el('div', 'torre-list');
  TIER_CAP_LEVELS.forEach((level, idx) => {
    const unlocked = isTierCapLevelUnlocked(state, idx);
    const clears = tierCapClearCount(state, level);
    const meetsNow = unlocked && formationMeetsConstraint(state, level.constraint);
    const row = el('div', 'torre-row' + (unlocked ? '' : ' locked'));
    row.appendChild(el('div', 'torre-row-empty-icon', '🎯'));
    const info = el('div', 'torre-row-info');
    info.appendChild(el('div', 'torre-row-name', level.label));
    info.appendChild(el('div', 'torre-row-sub', unlocked
      ? tierCapConstraintLabel(level.constraint) + (clears > 0 ? ' · superado ' + clears + 'x' : '') + (!meetsNow ? ' · ⚠️ tu Formación actual no cumple la restricción' : '')
      : '🔒 Supera el nivel anterior'));
    row.appendChild(info);
    if (unlocked) row.addEventListener('click', () => UI.startTierCapLevel(state, idx));
    list.appendChild(row);
  });
  wrap.appendChild(list);

  const trialsCleared = Object.values(state.tierCap.familyTrialClears).filter(v => v > 0).length;
  const trialsBtn = el('button', 'primary-btn', `🧬 Trials de Familia (${trialsCleared}/${FAMILY_TRIALS.length})`);
  trialsBtn.addEventListener('click', () => UI.openFamilyTrials(state));
  wrap.appendChild(trialsBtn);
};

UI.startTierCapLevel = function (state, idx) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (!isTierCapLevelUnlocked(state, idx)) return;
  const level = TIER_CAP_LEVELS[idx];
  if (!formationMeetsConstraint(state, level.constraint)) {
    UI.showToast('⚠️ Tu Formación no cumple la restricción: ' + tierCapConstraintLabel(level.constraint));
    return;
  }
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  const encounters = buildTierCapEncounters(level, idx);
  window.__championRun = null;
  window.__roguelikeRun = null;
  window.__stageRun = {
    isTierCap: true, tierCapIdx: idx, isBoss: false,
    encounters, nodeIdx: 0, failed: false, hpMap: {}, faintedSet: new Set(), chargeMap: {},
  };
  UI.renderStageRun(state);
};

// ---------- Tope de Tier — Fase 2: Trials de Familia ----------
// Modal aparte (como la Pokédex) en vez de una lista dentro de Retos — 112
// filas no caben razonablemente en la pantalla principal. Reutiliza el
// mismo patrón visual de tarjeta que pokedexCard (bloqueada/???/con arte),
// con dos estados añadidos propios de este Trial: superado (✅) y "no está
// en tu Formación ahora mismo" (⚠️, se puede intentar cuando se coloque).
UI.familyTrialFilter = 'all'; // 'all' | 'pending' | 'cleared' | 'undiscovered'
UI.openFamilyTrials = function (state) {
  const body = $('familyTrialsModalBody');
  const cleared = Object.values(state.tierCap.familyTrialClears).filter(v => v > 0).length;
  body.innerHTML = `<h3>🧬 Trials de Familia ${cleared}/${FAMILY_TRIALS.length}</h3>
    <p class="settings-info">Un combate rápido (1 sola oleada) por cada familia jugable del juego — para
    intentarlo necesitas tener al menos 1 copia de esa familia colocada en tu Formación ahora mismo (el resto
    de la Formación puede ser cualquier cosa). Superarlos todos completa Retos al 100%.</p>`;
  const filterRow = el('div', 'roster-filter-row');
  const select = document.createElement('select');
  [['all', 'Todas'], ['pending', 'Sin superar'], ['cleared', 'Superadas'], ['undiscovered', 'No conseguidas']].forEach(([v, label]) => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = label;
    if (v === UI.familyTrialFilter) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', (e) => { UI.familyTrialFilter = e.target.value; UI.openFamilyTrials(state); });
  filterRow.appendChild(select);
  body.appendChild(filterRow);

  const grid = el('div', 'creature-grid pokedex-grid');
  FAMILY_TRIALS.forEach(trial => {
    const discovered = familyTrialDiscovered(state, trial);
    const clearedCount = familyTrialClearCount(state, trial);
    if (UI.familyTrialFilter === 'pending' && (!discovered || clearedCount > 0)) return;
    if (UI.familyTrialFilter === 'cleared' && clearedCount === 0) return;
    if (UI.familyTrialFilter === 'undiscovered' && discovered) return;
    grid.appendChild(familyTrialCard(state, trial));
  });
  if (grid.children.length === 0) grid.appendChild(el('div', 'empty-hint', 'Ninguna familia coincide con este filtro.'));
  body.appendChild(grid);
  $('familyTrialsModal').classList.remove('hidden');
};

function familyTrialCard(state, trial) {
  if (!familyTrialDiscovered(state, trial)) {
    const card = el('div', 'creature-card pokedex-locked');
    card.appendChild(el('div', 'pokedex-lock-icon', '❔'));
    card.appendChild(el('div', 'creature-name', '???'));
    return card;
  }
  const def = fighterDef(trial.displayDefId);
  const rarity = rarityInfo(def.rarity);
  const cleared = familyTrialClearCount(state, trial) > 0;
  const card = el('div', 'creature-card rarity-' + def.rarity);
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--rg', rarity.glow);
  const wrap = el('div', 'creature-canvas-wrap');
  wrap.appendChild(creatureCanvas(def.id));
  card.appendChild(wrap);
  const badge = el('div', 'creature-elclass');
  badge.textContent = ELEMENT_INFO[def.element].icon + CLASS_INFO[def.class].icon;
  card.appendChild(badge);
  card.appendChild(el('div', 'creature-tier-icon', rarity.icon));
  card.appendChild(el('div', 'creature-name', def.name));
  if (cleared) card.appendChild(el('div', 'in-band-tag', '✅ Superado'));
  else if (!formationHasFamily(state, trial.family)) card.appendChild(el('div', 'new-badge', '⚠️ No está en tu Formación'));
  card.addEventListener('click', () => UI.startFamilyTrial(state, trial.id));
  return card;
}

UI.startFamilyTrial = function (state, trialId) {
  const trial = FAMILY_TRIALS.find(t => t.id === trialId);
  if (!trial) return;
  if (!familyTrialDiscovered(state, trial)) { UI.showToast('⚠️ Todavía no has conseguido ningún ' + trial.family); return; }
  if (!formationHasFamily(state, trial.family)) {
    UI.showToast('⚠️ Coloca a un luchador de esa familia en tu Formación para intentarlo.');
    return;
  }
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  $('familyTrialsModal').classList.add('hidden');
  window.__championRun = null;
  window.__roguelikeRun = null;
  window.__stageRun = null;
  window.__familyTrialActive = true;
  const enemyRow = buildFamilyTrialEncounter(trial);
  const combos = buildPlayerCombinations(state);
  UI.openBattle(state, combos, [enemyRow], {
    title: '🧬 Trial: ' + fighterDef(trial.displayDefId).name,
    onEnd: (result) => {
      if (result !== 'victoria') { saveGame(state); return null; }
      const rewards = familyTrialRewards(trial);
      state.currencies.texel += rewards.texel;
      const leveled = [];
      state.band.flat().filter(Boolean).forEach(uid => {
        const entry = rosterEntry(state, uid);
        if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
      });
      recordFamilyTrialClear(state, trial);
      saveGame(state);
      return { rewards, leveled };
    },
  });
};

UI.startTorreLevel = function (state, idx) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (!isTorreLevelUnlocked(state, idx)) return;
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  const level = TORRE_LEVELS[idx];
  const bossExtraMult = level.kind === 'boss' ? torreBossMult(state, level) : undefined;
  const encounters = buildTorreEncounters(level, bossExtraMult);
  window.__championRun = null;
  window.__stageRun = {
    isTorre: true, torreIdx: idx, isBoss: level.kind === 'boss',
    encounters, nodeIdx: 0, failed: false, hpMap: {}, faintedSet: new Set(), chargeMap: {},
  };
  UI.renderStageRun(state);
};

// ---------- Roguelike ----------
// Extensión de la Torre Batalla para cuando ya se ha superado del todo —
// una única fila rival por ronda (como la Prueba del Campeón, pero con la
// Formación entera y sus 8 líneas en vez de un solo luchador), sin curarse
// entre rondas y con dificultad sin techo (ver buildRoguelikeEnemyRow en
// combat.js — a propósito, como Arena: la gracia es ver hasta dónde se
// llega). Entre ronda y ronda se elige un bono (ver ROGUELIKE_BOONS en
// combat.js) que se queda para el resto de la run. Termina al perder (no
// afecta a la Colección, solo a esta run) — se guarda la mejor ronda.
UI.renderRoguelike = function (state, wrap) {
  wrap.appendChild(el('h3', null, '🌀 Roguelike'));
  if (!roguelikeUnlocked(state)) {
    const cleared = Object.values(state.torre.clears).filter(v => v > 0).length;
    wrap.appendChild(el('div', 'panel', `
      <h3>🔒 Roguelike bloqueado</h3>
      <p class="settings-info">Se desbloquea al superar los ${TORRE_LEVELS.length} niveles de la Torre
      Batalla al menos una vez. Progreso actual: ${cleared}/${TORRE_LEVELS.length}.</p>
      <p class="settings-info">También puedes activarlo ya para probarlo desde Ajustes → "Roguelike
      (modo de prueba)".</p>`));
    return;
  }
  const panel = el('div', 'panel');
  panel.innerHTML = `<p class="settings-info">Rondas sin fin, cada vez más difíciles, sin curarte entre
    ellas — pierdes y se acaba la run (tu Colección no se ve afectada). Entre ronda y ronda eliges un
    bono que se queda contigo para el resto de la run.</p>
    <div class="stat-row"><span>Mejor ronda alcanzada</span><span>${state.roguelike.bestRound}</span></div>`;
  const startBtn = el('button', 'primary-btn', '🌀 Empezar run');
  startBtn.addEventListener('click', () => UI.startRoguelikeRun(state));
  panel.appendChild(startBtn);
  wrap.appendChild(panel);
};

UI.startRoguelikeRun = function (state) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  window.__championRun = null;
  window.__stageRun = null;
  window.__roguelikeRun = { round: 1, hpMap: {}, chargeMap: {}, faintedSet: new Set(), buffs: {} };
  UI.fightRoguelikeRound(state);
};

UI.fightRoguelikeRound = function (state) {
  const run = window.__roguelikeRun;
  const enemyRow = buildRoguelikeEnemyRow(run.round);
  const playerCombos = buildPlayerCombinations(state);
  // Mismo patrón de persistencia entre combates que un recorrido de etapa
  // (ver UI.fightStageRunNode): ni la vida ni la carga de ulti se
  // restablecen de una ronda a otra, y los bonos elegidos (run.buffs) se
  // aplican de cero cada vez sobre las stats ya recalculadas.
  playerCombos.forEach(row => row.forEach(u => {
    if (!u.sourceUid) return;
    if (run.faintedSet.has(u.sourceUid)) { u.hp = 0; u.alive = false; }
    else if (run.hpMap[u.sourceUid] !== undefined) u.hp = Math.min(u.maxHp, run.hpMap[u.sourceUid]);
    if (run.chargeMap[u.sourceUid] !== undefined) u.ultCharge = run.chargeMap[u.sourceUid];
    applyRoguelikeBuffs(u, run.buffs);
  }));
  UI.openBattle(state, playerCombos, [enemyRow], {
    title: '🌀 Roguelike · Ronda ' + run.round,
    zone: { id: 'roguelike', color: '#241a33' },
    onEnd: (result, view) => {
      if (view) {
        view.playerGroups.forEach(g => g.row.forEach(u => {
          if (!u.sourceUid) return;
          run.hpMap[u.sourceUid] = u.hp;
          run.chargeMap[u.sourceUid] = u.ultCharge;
          if (u.alive) run.faintedSet.delete(u.sourceUid); else run.faintedSet.add(u.sourceUid);
        }));
      }
      if (result !== 'victoria') {
        const roundsCleared = run.round - 1;
        recordRoguelikeRun(state, roundsCleared);
        window.__roguelikeRun = null;
        saveGame(state);
        return { roguelikeDefeat: true, roundsCleared, bestRound: state.roguelike.bestRound };
      }
      const clearedRound = run.round;
      const rewards = roguelikeRoundRewards(clearedRound);
      state.currencies.texel += rewards.texel;
      const leveled = [];
      state.band.flat().filter(Boolean).forEach(uid => {
        const entry = rosterEntry(state, uid);
        if (entry && fighterAddXp(entry, rewards.fighterXp)) leveled.push(fighterDef(entry.defId).name);
      });
      recordRoguelikeRun(state, clearedRound);
      run.pendingBoon = true;
      saveGame(state);
      return { rewards, leveled, roguelikeContinue: true, roundsCleared: clearedRound };
    },
  });
};

UI.openRoguelikeBoonPicker = function (state) {
  const run = window.__roguelikeRun;
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>🌀 Elige un bono — Ronda ${run.round + 1}</h3>
    <p class="settings-info">Se queda para el resto de esta run.</p>`;
  const options = [...ROGUELIKE_BOONS].sort(() => Math.random() - 0.5).slice(0, 3);
  options.forEach(boon => {
    const btn = el('button', 'primary-btn', boon.icon + ' ' + boon.label);
    btn.style.display = 'block';
    btn.style.width = '100%';
    btn.style.marginBottom = '8px';
    btn.addEventListener('click', () => {
      if (boon.id === 'heal') {
        state.band.flat().filter(Boolean).forEach(uid => {
          const entry = rosterEntry(state, uid);
          const stats = fighterStats(state, entry);
          if (run.faintedSet.has(uid)) {
            run.faintedSet.delete(uid);
            run.hpMap[uid] = Math.round(stats.hp * 0.3);
          } else {
            const current = run.hpMap[uid] !== undefined ? run.hpMap[uid] : stats.hp;
            run.hpMap[uid] = Math.min(stats.hp, current + Math.round(stats.hp * 0.5));
          }
        });
      } else if (boon.id === 'ult') {
        state.band.flat().filter(Boolean).forEach(uid => { if (!run.faintedSet.has(uid)) run.chargeMap[uid] = 100; });
      } else {
        run.buffs[boon.stat] = (run.buffs[boon.stat] || 0) + boon.pct;
      }
      run.round++;
      $('pickerModal').classList.add('hidden');
      UI.fightRoguelikeRound(state);
    });
    body.appendChild(btn);
  });
  $('pickerModal').classList.remove('hidden');
};

// ---------- Prueba del Campeón ----------
// Duelos 1 contra 1: un único luchador elegido se enfrenta a rivales cada
// vez más fuertes en serie, SIN curarse entre duelos — perder termina el
// intento. Disponible desde el principio (sin desbloqueo, a diferencia de
// la Mazmorra o la Torre): no necesita profundidad de roster, solo 1
// luchador, así que sirve de reto accesible desde el primer momento.
UI.renderChampionTrial = function (state, wrap) {
  wrap.appendChild(el('h3', null, '⚔️ Prueba del Campeón'));
  wrap.appendChild(el('p', 'settings-info', `Elige un único luchador para una serie de duelos 1 contra 1
    cada vez más difíciles, sin curarse entre ellos — pierde y el intento termina ahí. Se guarda tu
    mejor racha.`));
  const uid = state.champion.selectedUid;
  const entry = uid ? rosterEntry(state, uid) : null;
  const row = el('div', 'torre-row');
  if (entry) row.appendChild(creatureCanvas(entry.defId, 40));
  else { const ph = el('div', 'torre-row-empty-icon', '❔'); row.appendChild(ph); }
  const info = el('div', 'torre-row-info');
  info.appendChild(el('div', 'torre-row-name', entry ? fighterDef(entry.defId).name : 'Ningún luchador elegido'));
  info.appendChild(el('div', 'torre-row-sub', 'Mejor racha: ' + state.champion.bestStreak + ' duelo' + (state.champion.bestStreak === 1 ? '' : 's')));
  row.appendChild(info);
  const btnCol = el('div', 'torre-row-btns');
  const pickBtn = el('button', 'mini-btn', '👤 Elegir');
  pickBtn.addEventListener('click', (e) => { e.stopPropagation(); UI.openChampionPicker(state); });
  btnCol.appendChild(pickBtn);
  row.appendChild(btnCol);
  if (entry) row.addEventListener('click', () => UI.startChampionTrial(state));
  wrap.appendChild(row);
};

UI.openChampionPicker = function (state) {
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>⚔️ Elige tu luchador</h3><p class="settings-info">Se enfrentará solo, en duelos seguidos cada vez más difíciles.</p>';
  const headerWrap = el('div');
  const listWrap = el('div');
  let mode = UI.pickerSortMode, variant = UI.pickerStatVariant;
  const pick = (entry) => {
    state.champion.selectedUid = entry.uid;
    saveGame(state);
    $('pickerModal').classList.add('hidden');
    UI.renderTorre(state);
  };
  const refresh = () => renderPickerCandidates(listWrap, state, state.roster, mode, pick, variant);
  const renderHeader = () => {
    headerWrap.innerHTML = '';
    headerWrap.appendChild(buildSortSelect(mode, (v) => { mode = v; UI.pickerSortMode = v; renderHeader(); refresh(); },
      variant, (v) => { variant = v; UI.pickerStatVariant = v; renderHeader(); refresh(); }));
  };
  renderHeader();
  body.appendChild(headerWrap);
  body.appendChild(listWrap);
  refresh();
  $('pickerModal').classList.remove('hidden');
};

UI.startChampionTrial = function (state) {
  const uid = state.champion.selectedUid;
  if (!uid || !rosterEntry(state, uid)) { UI.showToast('⚠️ Elige primero tu luchador.'); return; }
  window.__stageRun = null;
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  window.__championRun = { uid, duelIdx: 0, hp: null, ultCharge: 0 };
  UI.fightChampionDuel(state);
};

UI.fightChampionDuel = function (state) {
  const run = window.__championRun;
  const entry = rosterEntry(state, run.uid);
  const playerUnit = makePlayerUnit(state, run.uid);
  if (run.hp !== null) playerUnit.hp = Math.min(playerUnit.maxHp, run.hp);
  playerUnit.ultCharge = run.ultCharge;
  const opponent = buildChampionOpponent(run.duelIdx);
  UI.openBattle(state, [[playerUnit]], [[opponent]], {
    title: '⚔️ Prueba del Campeón · Duelo ' + (run.duelIdx + 1),
    zone: { id: 'campeon', color: '#4a3524' },
    onEnd: (result, view) => {
      if (view) {
        const u = view.playerGroups[0].row[0];
        run.hp = u.hp; run.ultCharge = u.ultCharge;
      }
      if (result !== 'victoria') {
        const duelsWon = run.duelIdx;
        recordChampionStreak(state, duelsWon);
        window.__championRun = null;
        saveGame(state);
        return { championDefeat: true, duelsWon };
      }
      run.duelIdx++;
      const rewards = championDuelRewards(run.duelIdx - 1);
      state.currencies.texel += rewards.texel;
      fighterAddXp(entry, rewards.fighterXp);
      recordChampionStreak(state, run.duelIdx);
      saveGame(state);
      return { rewards, championContinue: true, duelsWon: run.duelIdx };
    },
  });
};

// ---------- Mazmorra Elemental ----------
// Reto opcional de equipo mono-elemento (ver ELEMENTAL_DUNGEONS en
// data.js): se desbloquea a mitad de partida, mucho antes que Torre
// Batalla — por eso vive arriba del todo en esta misma pantalla.
UI.renderElementalDungeons = function (state, wrap) {
  wrap.appendChild(el('h3', null, '🌋 Mazmorra Elemental'));
  if (!elementalDungeonUnlocked(state)) {
    const cleared = ZONES.filter(z => highestClearedStage(state, z.id) >= STAGES_PER_ZONE - 1).length;
    const target = ZONES.findIndex(z => z.id === ELEMENTAL_DUNGEON_ZONE_ID);
    wrap.appendChild(el('div', 'panel', `
      <p class="settings-info">🔒 Se desbloquea al completar las ${target} primeras zonas del mapa
      (progreso actual: ${cleared}/${target}). También puedes activarla ya desde Ajustes →
      "Mazmorra Elemental (modo de prueba)".</p>`));
    return;
  }
  wrap.appendChild(el('p', 'settings-info', `Un equipo de hasta 3 luchadores del MISMO elemento se
    enfrenta a 2 oleadas y un Guardián Elemental del elemento que lo contrarresta — desventaja
    elemental de partida, así que hace falta buen nivel y equipo para ganar. Recompensa mejor que
    una etapa normal, con equipo garantizado.`));
  const list = el('div', 'torre-list');
  ELEMENT_ORDER.forEach(elementId => {
    const dungeon = ELEMENTAL_DUNGEONS[elementId];
    const teamUids = elementalTeamUids(state, elementId);
    const clears = state.elementalClears[elementId] || 0;
    const row = el('div', 'torre-row');
    row.appendChild(creatureCanvas(dungeon.guardianDefId, 40));
    const info = el('div', 'torre-row-info');
    info.appendChild(el('div', 'torre-row-name', ELEMENT_INFO[elementId].icon + ' Mazmorra de ' + ELEMENT_INFO[elementId].label));
    info.appendChild(el('div', 'torre-row-sub', `Equipo: ${teamUids.length}/3${clears > 0 ? ' · superada ' + clears + 'x' : ''}`));
    row.appendChild(info);
    const btnCol = el('div', 'torre-row-btns');
    const teamBtn = el('button', 'mini-btn', '👥 Equipo');
    teamBtn.addEventListener('click', (e) => { e.stopPropagation(); UI.openElementalTeamPicker(state, elementId); });
    btnCol.appendChild(teamBtn);
    row.appendChild(btnCol);
    if (teamUids.length > 0) row.addEventListener('click', () => UI.startElementalDungeon(state, elementId));
    list.appendChild(row);
  });
  wrap.appendChild(list);
};

// mode: si se pasa, filtra la Colección al elemento indicado y deja
// elegir hasta 3 (multi-selección, igual patrón que el material de
// fusión en la ficha de un luchador) — se guarda en
// state.elementalTeams[elementId] para la próxima vez, editable siempre.
UI.openElementalTeamPicker = function (state, elementId) {
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>${ELEMENT_INFO[elementId].icon} Equipo de ${ELEMENT_INFO[elementId].label}</h3>
    <p class="settings-info">Elige hasta 3 luchadores de este elemento para la Mazmorra. Se guardan
    para la próxima vez, y siempre puedes volver a cambiarlos.</p>`;
  const candidates = state.roster.filter(entry => fighterDef(entry.defId).element === elementId);
  const selected = new Set(elementalTeamUids(state, elementId));
  const confirmBtn = el('button', 'primary-btn', 'Guardar equipo (' + selected.size + '/3)');
  if (candidates.length === 0) {
    body.appendChild(el('div', 'empty-hint', 'Todavía no tienes ningún luchador de este elemento.'));
  } else {
    const grid = el('div', 'picker-grid');
    const bandUids = state.band.flat().filter(Boolean);
    candidates.forEach(entry => {
      const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
      if (selected.has(entry.uid)) card.classList.add('selected');
      card.addEventListener('click', () => {
        if (selected.has(entry.uid)) { selected.delete(entry.uid); card.classList.remove('selected'); }
        else { if (selected.size >= 3) return; selected.add(entry.uid); card.classList.add('selected'); }
        confirmBtn.textContent = 'Guardar equipo (' + selected.size + '/3)';
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }
  confirmBtn.addEventListener('click', () => {
    state.elementalTeams[elementId] = [...selected];
    saveGame(state);
    $('pickerModal').classList.add('hidden');
    UI.renderTorre(state);
  });
  body.appendChild(confirmBtn);
  $('pickerModal').classList.remove('hidden');
};

UI.startElementalDungeon = function (state, elementId) {
  if (!elementalDungeonUnlocked(state)) return;
  const teamUids = elementalTeamUids(state, elementId);
  if (teamUids.length === 0) { UI.showToast('⚠️ Elige primero tu equipo de ' + ELEMENT_INFO[elementId].label + '.'); return; }
  if (!state.settings.infiniteEnergy) {
    if (state.currencies.energy < STAGE_ENERGY_COST) { UI.showToast('⚡ No tienes suficiente energía.'); return; }
    state.currencies.energy -= STAGE_ENERGY_COST;
    saveGame(state);
    UI.renderTopbar(state);
  }
  const encounters = buildElementalDungeonEncounters(elementId);
  window.__championRun = null;
  window.__stageRun = {
    isElemental: true, elementId, isBoss: false,
    encounters, nodeIdx: 0, failed: false, hpMap: {}, faintedSet: new Set(), chargeMap: {},
  };
  UI.renderStageRun(state);
};

// ---------- Filtro de la Colección ----------
// Independiente del orden (UI.rosterSortMode): reduce qué tarjetas se
// pintan en #rosterGrid antes de ordenarlas, por elemento/clase/rareza a
// la vez. 'all' en cualquiera de los 3 = sin filtrar por ese criterio.
UI.rosterFilter = { element: 'all', class: 'all', rarity: 'all' };
function rosterMatchesFilter(entry) {
  const def = fighterDef(entry.defId);
  if (UI.rosterFilter.element !== 'all' && def.element !== UI.rosterFilter.element) return false;
  if (UI.rosterFilter.class !== 'all' && def.class !== UI.rosterFilter.class) return false;
  if (UI.rosterFilter.rarity !== 'all' && def.rarity !== UI.rosterFilter.rarity) return false;
  return true;
}
// Los 3 <select> se rellenan una única vez (a partir de ELEMENT_INFO/
// CLASS_INFO/RARITIES, ya definidos en data.js — nada hardcodeado a mano
// dos veces) y luego solo se sincroniza su valor mostrado con el filtro
// activo en cada render, sin reconstruir las opciones.
function buildRosterFilterSelects() {
  const elSel = $('rosterFilterElement');
  if (!elSel.options.length) {
    elSel.appendChild(new Option('Todos los elementos', 'all'));
    ELEMENT_ORDER.forEach(id => elSel.appendChild(new Option(ELEMENT_INFO[id].icon + ' ' + ELEMENT_INFO[id].label, id)));
  }
  elSel.value = UI.rosterFilter.element;
  const clsSel = $('rosterFilterClass');
  if (!clsSel.options.length) {
    clsSel.appendChild(new Option('Todas las clases', 'all'));
    Object.keys(CLASS_INFO).forEach(id => clsSel.appendChild(new Option(CLASS_INFO[id].icon + ' ' + CLASS_INFO[id].label, id)));
  }
  clsSel.value = UI.rosterFilter.class;
  const rarSel = $('rosterFilterRarity');
  if (!rarSel.options.length) {
    rarSel.appendChild(new Option('Todas las rarezas', 'all'));
    RARITIES.forEach(r => rarSel.appendChild(new Option(r.icon + ' ' + r.label, r.id)));
  }
  rarSel.value = UI.rosterFilter.rarity;
}

// ---------- Banda ----------
UI.renderBanda = function (state) {
  const grid = $('formationGrid');
  grid.innerHTML = '';
  for (let r = 0; r < BAND_ROWS; r++) {
    const rowEl = el('div', 'formation-row');
    for (let c = 0; c < BAND_COLS; c++) {
      const uid = state.band[r][c];
      const isCenter = r === 1 && c === 1;
      const slot = el('div', 'formation-slot' + (uid ? '' : ' empty') + (isCenter ? ' center' : ''));
      if (uid) {
        const entry = rosterEntry(state, uid);
        if (entry) {
          const def = fighterDef(entry.defId);
          // El reborde marca también el tier del personaje (mismo color/
          // resplandor que ya usa creatureCard en la Colección), para
          // distinguir de un vistazo la rareza de cada hueco de la Formación.
          const rarity = rarityInfoFor(def);
          slot.classList.add('rarity-' + rarity.id);
          slot.style.setProperty('--rc', rarity.color);
          slot.style.setProperty('--rg', rarity.glow);
          const wrap = el('div', 'creature-canvas-wrap');
          wrap.appendChild(creatureCanvas(entry.defId, 46));
          slot.appendChild(wrap);
          slot.appendChild(el('div', 'formation-lvl', 'Nv.' + entry.level));
          if (isCenter && def.leaderSkillId) slot.appendChild(el('div', 'leader-crown', '👑'));
        }
      } else {
        slot.textContent = '+';
      }
      slot.addEventListener('click', () => UI.openFormationPicker(state, r, c));
      rowEl.appendChild(slot);
    }
    grid.appendChild(rowEl);
  }

  // Aviso para saber cómo rellenar los huecos vacíos de la Formación:
  // distingue entre "ya tienes luchadores sueltos, solo hay que colocarlos"
  // y "no te queda ninguno suelto, hace falta invocar más" — con la banda
  // de inicio (3 luchadores) los 6 huecos vacíos, sin este aviso, no queda
  // claro que la forma de llenarlos es la pantalla Invocar.
  const placedCount = state.band.flat().filter(Boolean).length;
  const emptySlots = BAND_ROWS * BAND_COLS - placedCount;
  const fillHint = $('formationFillHint');
  if (emptySlots === 0) {
    fillHint.classList.add('hidden');
  } else if (state.roster.length > placedCount) {
    fillHint.textContent = `💡 Tienes luchadores en tu Colección sin colocar — toca un hueco "+" de la Formación para añadirlos.`;
    fillHint.classList.remove('hidden');
  } else {
    fillHint.textContent = `🔮 Te quedan ${emptySlots} huecos vacíos en la Formación. Ve a la pestaña "Invocar" para conseguir más luchadores.`;
    fillHint.classList.remove('hidden');
  }

  const leader = activeLeaderSkill(state);
  const leaderBar = $('leaderStatusBar');
  leaderBar.innerHTML = leader
    ? `👑 <b>${leader.leaderName}</b> lidera: ${leader.name} — ${leader.desc}`
    : '👑 Sin líder activo. Coloca un luchador Legendario con habilidad de líder en el centro de la Formación para bonificar a toda la banda.';
  leaderBar.classList.toggle('active', !!leader);

  $('rosterCount').textContent = state.roster.length;
  buildRosterFilterSelects();
  const filtered = state.roster.filter(rosterMatchesFilter);
  $('rosterFilterHint').textContent = filtered.length === state.roster.length ? ''
    : (filtered.length === 0 ? 'Ningún luchador coincide con el filtro.' : `Mostrando ${filtered.length} de ${state.roster.length}.`);
  const rGrid = $('rosterGrid');
  rGrid.innerHTML = '';
  const sorted = sortRosterEntries(state, filtered, UI.rosterSortMode, UI.rosterStatVariant);
  $('rosterStatVariantRow').classList.toggle('hidden', !STAT_SORT_MODES.includes(UI.rosterSortMode));
  const bandUids = state.band.flat().filter(Boolean);
  sorted.forEach(entry => {
    const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
    if (UI.bulkMode && UI.bulkSelection.has(entry.uid)) card.classList.add('selected');
    card.addEventListener('click', () => {
      if (UI.bulkMode) {
        if (UI.bulkSelection.has(entry.uid)) UI.bulkSelection.delete(entry.uid);
        else UI.bulkSelection.add(entry.uid);
        UI.renderBanda(state);
        return;
      }
      UI.openFighterModal(state, entry.uid);
    });
    rGrid.appendChild(card);
  });

  const bulkBtn = $('bulkModeBtn');
  bulkBtn.textContent = UI.bulkMode ? '✕ Cancelar selección' : '☑️ Selección múltiple';
  bulkBtn.classList.toggle('active', UI.bulkMode);
  renderBulkActionBar(state);
};

// ---------- Acciones en lote sobre la Colección ----------
// Selección múltiple de copias sueltas del roster para venderlas o
// fusionarlas todas de golpe, en vez de una a una desde la ficha — pensado
// para cuando la Colección acumula muchos duplicados de bajo tier.
UI.bulkMode = false;
UI.bulkSelection = new Set();

function renderBulkActionBar(state) {
  const bar = $('bulkActionBar');
  if (!UI.bulkMode) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
  bar.classList.remove('hidden');
  bar.innerHTML = '';
  // Descarta de la selección cualquier uid que ya no exista (p.ej. si se
  // vendió por otra vía mientras seguía seleccionado).
  const uids = [...UI.bulkSelection].filter(uid => rosterEntry(state, uid));
  if (uids.length !== UI.bulkSelection.size) UI.bulkSelection = new Set(uids);
  const entries = uids.map(uid => rosterEntry(state, uid));
  bar.appendChild(el('p', 'settings-info', entries.length === 0
    ? 'Toca luchadores de la Colección para seleccionarlos.'
    : `${entries.length} luchador${entries.length === 1 ? '' : 'es'} seleccionado${entries.length === 1 ? '' : 's'}.`));

  const totalValue = entries.reduce((sum, e) => sum + fighterSellValue(e), 0);
  const sellBtn = el('button', 'danger-btn', entries.length ? `🪙 Vender seleccionados (+${totalValue})` : '🪙 Vender seleccionados');
  sellBtn.disabled = entries.length === 0;
  sellBtn.addEventListener('click', () => {
    if (!confirm(`¿Vender ${entries.length} luchadores por ${totalValue} Texel en total? No se puede deshacer.`)) return;
    uids.forEach(uid => sellFighter(state, uid));
    UI.bulkSelection.clear();
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderBanda(state);
    UI.showToast(`🪙 Vendidos ${entries.length} luchadores por +${totalValue} Texel`);
  });
  bar.appendChild(sellBtn);

  const sameDefId = entries.length >= 2 && entries.every(e => e.defId === entries[0].defId);
  const fuseBtn = el('button', 'primary-btn', '🔗 Fusionar en el de más nivel');
  fuseBtn.disabled = !sameDefId;
  bar.appendChild(fuseBtn);
  if (!sameDefId) bar.appendChild(el('p', 'settings-info', 'Elige 2 o más copias del MISMO luchador para poder fusionarlas.'));
  fuseBtn.addEventListener('click', () => {
    if (!sameDefId) return;
    const target = entries.reduce((best, e) => (e.level > best.level ? e : best), entries[0]);
    const materials = uids.filter(uid => uid !== target.uid);
    const used = fuseMaterials(state, target.uid, materials);
    UI.bulkSelection.clear();
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderBanda(state);
    UI.showToast(`🔗 ${used} copia${used === 1 ? '' : 's'} fusionada${used === 1 ? '' : 's'} en ${fighterDef(target.defId).name}`);
  });

  if (entries.length > 0) {
    const clearBtn = el('button', 'mini-btn', 'Vaciar selección');
    clearBtn.addEventListener('click', () => { UI.bulkSelection.clear(); UI.renderBanda(state); });
    bar.appendChild(clearBtn);
  }
}

// ---------- Selector reutilizable de luchadores (con orden) ----------
// Usado por el picker de Formación (slot vacío) y por el panel de
// "sustituir" dentro de la ficha de un luchador ya colocado.
UI.pickerSortMode = 'reciente';
UI.pickerStatVariant = 'current';
const SORT_OPTIONS = [
  ['reciente', 'Más reciente'], ['nombre', 'Nombre'], ['familia', 'Familia'],
  ['elemento', 'Elemento'], ['tier', 'Tier'], ['copias', 'Más copias'],
  ['poder', '⭐ Poder total'], ['hp', '❤️ Vida'], ['atk', '⚔️ Ataque'],
  ['def', '🛡️ Defensa'], ['agi', '💨 Agilidad'], ['wis', '🧠 Sabiduría'],
];
// currentVariant/onVariantChange (opcionales): si se pasan, añade debajo el
// toggle Actuales/Base que solo importa para los modos de STAT_SORT_MODES
// (se muestra siempre por simplicidad, igual que en Comparar, pero no tiene
// efecto en los demás modos de orden).
function buildSortSelect(currentMode, onChange, currentVariant, onVariantChange) {
  const wrap = el('div', null);
  const row = el('div', 'roster-sort-row');
  row.appendChild(el('label', null, 'Ordenar por'));
  const select = document.createElement('select');
  SORT_OPTIONS.forEach(([v, label]) => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = label;
    if (v === currentMode) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', (e) => onChange(e.target.value));
  row.appendChild(select);
  wrap.appendChild(row);
  if (onVariantChange) {
    const variantRow = el('div', 'compare-mode-row');
    const curBtn = el('button', 'mini-btn' + (currentVariant !== 'base' ? ' active' : ''), 'Actuales');
    curBtn.addEventListener('click', () => onVariantChange('current'));
    const baseBtn = el('button', 'mini-btn' + (currentVariant === 'base' ? ' active' : ''), 'Base (Nv.1, sin equipo)');
    baseBtn.addEventListener('click', () => onVariantChange('base'));
    variantRow.appendChild(curBtn); variantRow.appendChild(baseBtn);
    wrap.appendChild(variantRow);
  }
  return wrap;
}
function renderPickerCandidates(container, state, candidates, mode, onPick, variant) {
  container.innerHTML = '';
  if (candidates.length === 0) { container.appendChild(el('div', 'empty-hint', 'No hay luchadores disponibles.')); return; }
  const grid = el('div', 'picker-grid');
  const bandUids = state.band.flat().filter(Boolean);
  sortRosterEntries(state, candidates, mode, variant).forEach(entry => {
    const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
    card.addEventListener('click', () => onPick(entry));
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

UI.openFormationPicker = function (state, row, col) {
  const uid = state.band[row][col];
  if (uid) { UI.openFighterModal(state, uid, { row, col }); return; }
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>Elegir luchador</h3>';
  const headerWrap = el('div');
  const listWrap = el('div');
  let mode = UI.pickerSortMode, variant = UI.pickerStatVariant;
  const pick = (entry) => { setBandSlot(state, row, col, entry.uid); saveGame(state); $('pickerModal').classList.add('hidden'); UI.renderBanda(state); };
  const refresh = () => {
    const placed = state.band.flat();
    renderPickerCandidates(listWrap, state, state.roster.filter(e => !placed.includes(e.uid)), mode, pick, variant);
  };
  const renderHeader = () => {
    headerWrap.innerHTML = '';
    headerWrap.appendChild(buildSortSelect(mode, (v) => { mode = v; UI.pickerSortMode = v; renderHeader(); refresh(); },
      variant, (v) => { variant = v; UI.pickerStatVariant = v; renderHeader(); refresh(); }));
  };
  renderHeader();
  body.appendChild(headerWrap);
  body.appendChild(listWrap);
  refresh();
  $('pickerModal').classList.remove('hidden');
};

// formationCtx (opcional): { row, col } cuando se abre la ficha desde un
// hueco ya ocupado de la Formación — añade un panel para quitarlo o
// sustituirlo sin salir de la ficha normal del luchador.
UI.openFighterModal = function (state, uid, formationCtx) {
  const entry = rosterEntry(state, uid);
  if (!entry) return;
  // Quita la etiqueta "¡Nuevo!" al abrir la ficha — se refresca la
  // Colección aquí mismo (si es la pantalla activa) para que desaparezca
  // al momento, en vez de quedarse hasta la próxima vez que se entre a
  // Banda (rosterEntry.isNew ya está en false, pero la tarjeta ya
  // pintada en pantalla no se enteraba sola).
  if (entry.isNew) {
    entry.isNew = false;
    saveGame(state);
    if (activeScreen === 'banda') UI.renderBanda(state);
  }
  const def = fighterDef(entry.defId);
  const rarity = rarityInfoFor(def);
  const { total: stats, bonus: gearBonus } = fighterStatsBreakdown(state, entry);
  const skill = SKILL_TYPES[def.skillId];
  const body = $('fighterModalBody');
  body.innerHTML = '';
  const head = el('div', 'fighter-modal-head');
  const portrait = creatureCanvas(entry.defId, 90);
  head.appendChild(portrait);
  const info = el('div');
  const vuln = TYPE_VULNERABILITY[def.class];
  const bandPos = bandPositionOf(state, uid);
  info.innerHTML = `<div class="item-modal-name" style="color:${rarity.color}">${def.name}</div>
    <div class="item-modal-rarity">${rarity.label} · ${ELEMENT_INFO[def.element].label} ${ELEMENT_INFO[def.element].icon} · ${CLASS_INFO[def.class].label} ${CLASS_INFO[def.class].icon}</div>
    ${bandPos ? `<div class="in-band-tag">🐾 En formación</div>` : ''}
    ${vuln ? `<div class="type-vuln-note">${vuln.desc}</div>` : ''}
    <div class="xp-bar" style="margin-top:6px"><div class="xp-fill" style="width:${entry.level >= XP_LEVEL_CAP ? 100 : (entry.xp / fighterXpToNext(entry.level) * 100)}%"></div></div>
    <div class="xp-text">Nv. ${entry.level}${entry.level >= XP_LEVEL_CAP ? ' (máx.)' : ' · ' + entry.xp + '/' + fighterXpToNext(entry.level)}</div>`;
  head.appendChild(info);
  body.appendChild(head);

  if (def.lore) {
    const lorePanel = el('div', 'panel');
    lorePanel.innerHTML = `<h3>📜 Historia</h3><p class="settings-info">${def.lore}</p>`;
    body.appendChild(lorePanel);
  }

  if (entry.level < XP_LEVEL_CAP) {
    const homPanel = el('div', 'panel');
    homPanel.innerHTML = '<h3>🧪 Homúnculos</h3><p class="settings-info">Fusiónalos con este luchador para darle experiencia directamente — nunca luchan, solo sirven para esto.</p>';
    const homRow = el('div', 'homunculo-row');
    HOMUNCULOS.forEach(hom => {
      const count = state.homunculos[hom.id] || 0;
      const btn = el('button', 'mini-btn homunculo-btn', `🧪 ${hom.name} (${count})`);
      btn.disabled = count <= 0;
      btn.addEventListener('click', () => {
        const leveled = useHomunculo(state, uid, hom.id);
        if (leveled === null) return;
        saveGame(state);
        UI.renderTopbar(state);
        if (activeScreen === 'banda') UI.renderBanda(state);
        UI.showToast('🧪 +' + hom.xpValue + ' XP para ' + def.name + (leveled ? ' — ¡subió de nivel!' : ''));
        UI.openFighterModal(state, uid, formationCtx);
      });
      homRow.appendChild(btn);
    });
    homPanel.appendChild(homRow);
    body.appendChild(homPanel);
  }

  const statRow = (icon, label, key) => {
    const boost = gearBonus[key] ? ` <span class="stat-boost">+${gearBonus[key]}</span>` : '';
    return `<div class="stat-row"><span>${icon} ${label}</span><span>${stats[key] - (gearBonus[key] || 0)}${boost}</span></div>`;
  };
  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = statRow('❤️', 'Vida', 'hp') + statRow('⚔️', 'Ataque', 'atk') + statRow('🛡️', 'Defensa', 'def')
    + statRow('💨', 'Agilidad', 'agi') + statRow('🧠', 'Sabiduría', 'wis');
  body.appendChild(statsPanel);

  const compareBtn = el('button', 'mini-btn', '🆚 Comparar con otro luchador');
  compareBtn.addEventListener('click', () => UI.openComparePicker(state, uid));
  body.appendChild(compareBtn);

  const skillPanel = el('div', 'panel');
  skillPanel.innerHTML = `<h3>⚡ ${skill.name} (Ulti)</h3><p class="settings-info">${skill.desc}</p><p class="settings-info">Se carga peleando: golpea o recibe daño para llenar la barra morada y desatarla.</p>`;
  body.appendChild(skillPanel);

  if (def.leaderSkillId) {
    const leaderInfo = LEADER_SKILLS[def.leaderSkillId];
    const leaderPanel = el('div', 'panel');
    leaderPanel.innerHTML = `<h3>👑 ${leaderInfo.name} (Líder)</h3><p class="settings-info">${leaderInfo.desc}</p><p class="settings-info">Solo se activa mientras este luchador ocupa la celda central de la Formación.</p>`;
    body.appendChild(leaderPanel);
  }

  const sefPanel = el('div', 'panel');
  const evoText = !def.evolvesTo
    ? (entry.sef >= 5 ? 'Forma máxima y SEF completa: ya se puede usar como sacrificio de Superfusión (elígelo desde la ficha de otro luchador en forma máxima) para darle una ⭐ permanente.'
      : 'Forma máxima: no evoluciona más, pero usar copias sueltas como material de fusión (abajo) hasta 5/5 lo deja listo para sacrificarlo en una Superfusión y dar una ⭐ permanente a otro luchador.')
    : entry.readyToEvolve ? '¡Fusión completa! Ya puedes evolucionarlo a <b>' + fighterDef(def.evolvesTo).name + '</b>.'
    : 'Usa copias sueltas de este mismo luchador como material de fusión (abajo) para llegar a 5/5 y evolucionarlo a <b>' + fighterDef(def.evolvesTo).name + '</b>.';
  sefPanel.innerHTML = `<h3>Fusión (SEF) <span class="badge">${entry.sef}/5</span></h3>
    <div class="sef-bar big"><div class="sef-fill" style="width:${entry.sef / 5 * 100}%"></div></div>
    <p class="settings-info">${evoText}</p>`;
  if (entry.stars > 0) sefPanel.innerHTML += `<div class="stat-row"><span>Superfusión</span><span>${'★'.repeat(entry.stars)}${'☆'.repeat(3 - entry.stars)}</span></div>`;
  body.appendChild(sefPanel);

  if (entry.readyToEvolve && def.evolvesTo) {
    const evoBtn = el('button', 'primary-btn evolve-btn', '✨ Evolucionar a ' + fighterDef(def.evolvesTo).name);
    evoBtn.addEventListener('click', () => {
      const oldDefId = entry.defId;
      const newDefId = evolveFighter(state, uid);
      saveGame(state);
      UI.renderTopbar(state);
      if (activeScreen === 'banda') UI.renderBanda(state);
      if (newDefId) {
        UI.pendingEvolveUid = uid;
        $('fighterModal').classList.add('hidden');
        UI.showEvolveReveal(oldDefId, newDefId);
      }
    });
    body.appendChild(evoBtn);
  } else if (entry.sef < 5) {
    // Material de fusión: copias sueltas del mismo defId, elegidas a mano
    // (ya no se fusionan solas al invocar un duplicado).
    const siblings = state.roster.filter(r => r.uid !== uid && r.defId === entry.defId);
    const fusePanel = el('div', 'panel');
    fusePanel.innerHTML = `<h3>🧬 Material de fusión</h3><p class="settings-info">Toca las copias de ${def.name} que quieras usar como material. Cada una suma 1 a la barra SEF.</p>`;
    const grid = el('div', 'picker-grid');
    const selected = new Set();
    const remaining = 5 - entry.sef;
    let fuseBtn;
    if (siblings.length === 0) {
      grid.appendChild(el('div', 'empty-hint', 'Aún no tienes más copias de ' + def.name + '. Consíguelas invocando.'));
    } else {
      const bandUids = state.band.flat().filter(Boolean);
      siblings.forEach(sib => {
        const card = creatureCard(state, sib, { inBand: bandUids.includes(sib.uid) });
        card.addEventListener('click', () => {
          if (selected.has(sib.uid)) {
            selected.delete(sib.uid);
            card.classList.remove('selected');
          } else {
            if (selected.size >= remaining) return;
            selected.add(sib.uid);
            card.classList.add('selected');
          }
          fuseBtn.disabled = selected.size === 0;
          fuseBtn.textContent = 'Fusionar (' + selected.size + '/' + remaining + ')';
        });
        grid.appendChild(card);
      });
    }
    fusePanel.appendChild(grid);
    fuseBtn = el('button', 'primary-btn', 'Fusionar');
    fuseBtn.disabled = true;
    fuseBtn.addEventListener('click', () => {
      const used = fuseMaterials(state, uid, [...selected]);
      if (used > 0) {
        saveGame(state);
        UI.renderTopbar(state);
        if (activeScreen === 'banda') UI.renderBanda(state);
        UI.showToast('🧬 Fusionadas ' + used + ' copia' + (used > 1 ? 's' : ''));
        UI.openFighterModal(state, uid, formationCtx);
      }
    });
    fusePanel.appendChild(fuseBtn);
    body.appendChild(fusePanel);
  }
  if (entry.stars < 3) {
    const superBtn = el('button', 'primary-btn', 'Superfusionar (sacrificar otro luchador)');
    superBtn.addEventListener('click', () => UI.openSuperFusePicker(state, uid));
    body.appendChild(superBtn);
  }

  const gearPanel = el('div', 'panel');
  gearPanel.innerHTML = '<h3>Equipo</h3>';
  const gearRow = el('div', 'gear-slots-row');
  GEAR_SLOT_IDS.forEach(slotKey => {
    const gearUid = entry.gear[slotKey];
    const box = el('div', 'doll-slot' + (gearUid ? '' : ' empty'));
    if (gearUid) {
      const g = gearItem(state, gearUid);
      box.innerHTML = '';
      box.appendChild(gearIcon(g, 30));
      box.appendChild(el('div', 'doll-plus', '+' + g.level));
    } else {
      box.innerHTML = `<div class="doll-icon">${GEAR_SLOTS[slotKey].icon}</div><div class="doll-label">${GEAR_SLOTS[slotKey].label}</div>`;
    }
    box.addEventListener('click', () => UI.openGearPickerForFighter(state, uid, slotKey));
    gearRow.appendChild(box);
  });
  gearPanel.appendChild(gearRow);
  const autoEquipBtn = el('button', 'mini-btn', '⚡ Auto-equipar mejor');
  autoEquipBtn.addEventListener('click', () => {
    const changed = autoEquipBest(state, uid);
    saveGame(state);
    UI.openFighterModal(state, uid, formationCtx);
    if (activeScreen === 'banda') UI.renderBanda(state);
    UI.showToast(changed > 0 ? '⚡ ' + changed + ' hueco' + (changed > 1 ? 's' : '') + ' mejorado' + (changed > 1 ? 's' : '') : '⚡ Ya llevabas puesto lo mejor disponible');
  });
  gearPanel.appendChild(autoEquipBtn);
  body.appendChild(gearPanel);

  const fs = entry.stats || newFighterStats();
  const combatHistoryPanel = el('div', 'panel');
  combatHistoryPanel.innerHTML = `<h3>📊 Estadísticas de combate</h3>
    <p class="settings-info">Acumuladas a lo largo de toda la partida con este luchador (sobreviven a Fusión/Evolución).</p>
    <div class="stat-row"><span>⚔️ Combates</span><span>${fs.battles}</span></div>
    <div class="stat-row"><span>💥 Daño hecho</span><span>${fs.dmgDealt}</span></div>
    <div class="stat-row"><span>🛡️ Daño recibido</span><span>${fs.dmgReceived}</span></div>
    <div class="stat-row"><span>💚 Curación hecha</span><span>${fs.healDone}</span></div>
    <div class="stat-row"><span>💀 Bajas</span><span>${fs.kills}</span></div>
    <div class="stat-row"><span>💢 Mejor golpe</span><span>${fs.highestHit}</span></div>`;
  body.appendChild(combatHistoryPanel);

  const sellValue = fighterSellValue(entry);
  const sellPanel = el('div', 'panel');
  sellPanel.innerHTML = `<h3>🪙 Vender</h3><p class="settings-info">Cambia a este luchador por Texel a cambio. Es definitivo — no se puede deshacer.</p>`;
  const sellBtn = el('button', 'danger-btn', `Vender por ${sellValue} 🪙`);
  sellBtn.addEventListener('click', () => {
    if (!confirm(`¿Vender a ${def.name} por ${sellValue} Texel? No se puede deshacer.`)) return;
    sellFighter(state, uid);
    saveGame(state);
    UI.renderTopbar(state);
    $('fighterModal').classList.add('hidden');
    UI.renderScreen(activeScreen, state);
    UI.showToast(`🪙 Vendido por ${sellValue} Texel`);
  });
  sellPanel.appendChild(sellBtn);
  body.appendChild(sellPanel);

  if (formationCtx) {
    const fPanel = el('div', 'panel');
    fPanel.innerHTML = '<h3>🐾 Formación</h3>';
    const removeBtn = el('button', 'danger-btn', 'Quitar de la formación');
    removeBtn.addEventListener('click', () => {
      setBandSlot(state, formationCtx.row, formationCtx.col, null);
      saveGame(state);
      $('fighterModal').classList.add('hidden');
      UI.renderBanda(state);
    });
    fPanel.appendChild(removeBtn);
    fPanel.appendChild(el('p', 'settings-info', 'Sustituir por:'));
    const subHeaderWrap = el('div');
    const subWrap = el('div');
    let subMode = UI.pickerSortMode, subVariant = UI.pickerStatVariant;
    const placed = state.band.flat();
    const candidates = () => state.roster.filter(e => e.uid !== uid && !placed.includes(e.uid));
    const subPick = (cand) => {
      setBandSlot(state, formationCtx.row, formationCtx.col, cand.uid);
      saveGame(state);
      $('fighterModal').classList.add('hidden');
      UI.renderBanda(state);
    };
    const renderSubHeader = () => {
      subHeaderWrap.innerHTML = '';
      subHeaderWrap.appendChild(buildSortSelect(subMode,
        (v) => { subMode = v; UI.pickerSortMode = v; renderSubHeader(); renderPickerCandidates(subWrap, state, candidates(), subMode, subPick, subVariant); },
        subVariant,
        (v) => { subVariant = v; UI.pickerStatVariant = v; renderSubHeader(); renderPickerCandidates(subWrap, state, candidates(), subMode, subPick, subVariant); }));
    };
    renderSubHeader();
    fPanel.appendChild(subHeaderWrap);
    fPanel.appendChild(subWrap);
    renderPickerCandidates(subWrap, state, candidates(), subMode, subPick, subVariant);
    body.appendChild(fPanel);
  }

  $('fighterModal').classList.remove('hidden');
};

// ---------- Comparar luchadores ----------
// Reutiliza el pickerModal genérico: primero para elegir el segundo
// luchador (mismo patrón que elegir hueco de Formación), luego para
// mostrar la comparación en sí — así no hace falta un modal nuevo en el
// HTML. Compara fighterStatsBreakdown().total (con equipo ya sumado, las
// mismas cifras que se ven en la ficha normal), resaltando en verde quién
// gana cada estadística para decidir de un vistazo a cuál usar.
UI.openComparePicker = function (state, uid) {
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>🆚 Comparar con...</h3>
    <p class="settings-info">Elige el segundo luchador — se compararán sus estadísticas totales (con equipo puesto) lado a lado.</p>`;
  const headerWrap = el('div');
  const listWrap = el('div');
  let mode = UI.pickerSortMode, variant = UI.pickerStatVariant;
  const pick = (entry) => UI.showCompare(state, uid, entry.uid);
  const refresh = () => renderPickerCandidates(listWrap, state, state.roster.filter(e => e.uid !== uid), mode, pick, variant);
  const renderHeader = () => {
    headerWrap.innerHTML = '';
    headerWrap.appendChild(buildSortSelect(mode, (v) => { mode = v; UI.pickerSortMode = v; renderHeader(); refresh(); },
      variant, (v) => { variant = v; UI.pickerStatVariant = v; renderHeader(); refresh(); }));
  };
  renderHeader();
  body.appendChild(headerWrap);
  body.appendChild(listWrap);
  refresh();
  $('pickerModal').classList.remove('hidden');
};

function compareStatRow(icon, label, key, statsA, statsB) {
  const a = statsA[key], b = statsB[key];
  const aClass = a > b ? 'compare-win' : (a < b ? 'compare-lose' : '');
  const bClass = b > a ? 'compare-win' : (b < a ? 'compare-lose' : '');
  return `<div class="compare-stat-row">
    <span class="compare-label">${icon} ${label}</span>
    <span class="compare-val ${aClass}">${a}</span>
    <span class="compare-val ${bClass}">${b}</span>
  </div>`;
}

// Estadísticas BASE de un luchador: nivel 1, sin estrellas de Superfusión
// ni equipo puesto — la misma fórmula que ya usa la ficha de solo lectura
// de la Pokédex (buildUnitStats(defId, 1) en combat.js) para mostrar el
// potencial "de fábrica" de una forma, aquí reutilizada para poder
// comparar dos luchadores sin que el nivel/equipo actual de cada uno
// distorsione cuál es realmente mejor.
function baseCompareStats(entry) {
  const s = buildUnitStats(entry.defId, 1);
  return { hp: s.maxHp, atk: s.atk, def: s.def, agi: s.agi, wis: s.wis };
}

// mode: 'current' (por defecto, estadísticas reales con nivel/estrellas/
// equipo ya sumados) o 'base' (nivel 1, sin nada de eso).
UI.showCompare = function (state, uidA, uidB, mode) {
  mode = mode === 'base' ? 'base' : 'current';
  const entryA = rosterEntry(state, uidA), entryB = rosterEntry(state, uidB);
  if (!entryA || !entryB) return;
  const defA = fighterDef(entryA.defId), defB = fighterDef(entryB.defId);
  const rarityA = rarityInfoFor(defA), rarityB = rarityInfoFor(defB);
  const statsA = mode === 'base' ? baseCompareStats(entryA) : fighterStatsBreakdown(state, entryA).total;
  const statsB = mode === 'base' ? baseCompareStats(entryB) : fighterStatsBreakdown(state, entryB).total;
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>🆚 Comparación</h3>';

  const posA = bandPositionOf(state, uidA), posB = bandPositionOf(state, uidB);

  const head = el('div', 'compare-head');
  const colA = el('div', 'compare-col');
  colA.appendChild(creatureCanvas(entryA.defId, 60));
  colA.appendChild(el('div', 'compare-name', defA.name));
  colA.appendChild(el('div', 'compare-sub', `${rarityA.label} · Nv.${entryA.level}`));
  if (posA) colA.appendChild(el('div', 'in-band-tag', '🐾 En formación'));
  const colB = el('div', 'compare-col');
  colB.appendChild(creatureCanvas(entryB.defId, 60));
  colB.appendChild(el('div', 'compare-name', defB.name));
  colB.appendChild(el('div', 'compare-sub', `${rarityB.label} · Nv.${entryB.level}`));
  if (posB) colB.appendChild(el('div', 'in-band-tag', '🐾 En formación'));
  head.appendChild(colA); head.appendChild(colB);
  body.appendChild(head);

  // Alternar entre estadísticas actuales (con nivel/estrellas/equipo) y
  // base (Nv.1, de fábrica) — para saber quién es realmente mejor "en
  // igualdad de condiciones" sin que la inversión ya hecha en uno de los
  // dos decida la comparación por sí sola.
  const modeRow = el('div', 'compare-mode-row');
  const curBtn = el('button', 'mini-btn' + (mode === 'current' ? ' active' : ''), 'Actuales');
  curBtn.addEventListener('click', () => UI.showCompare(state, uidA, uidB, 'current'));
  const baseBtn = el('button', 'mini-btn' + (mode === 'base' ? ' active' : ''), 'Base (Nv.1, sin equipo)');
  baseBtn.addEventListener('click', () => UI.showCompare(state, uidA, uidB, 'base'));
  modeRow.appendChild(curBtn); modeRow.appendChild(baseBtn);
  body.appendChild(modeRow);

  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = compareStatRow('❤️', 'Vida', 'hp', statsA, statsB)
    + compareStatRow('⚔️', 'Ataque', 'atk', statsA, statsB)
    + compareStatRow('🛡️', 'Defensa', 'def', statsA, statsB)
    + compareStatRow('💨', 'Agilidad', 'agi', statsA, statsB)
    + compareStatRow('🧠', 'Sabiduría', 'wis', statsA, statsB);
  body.appendChild(statsPanel);

  // Sustituir en la Formación: solo tiene sentido cuando UNO de los dos está
  // en un hueco y el otro no (si los dos están, o ninguno, no hay hueco que
  // ceder de uno a otro con un solo toque).
  const swapInBtn = (fromDef, fromPos, toEntry, toDef) => {
    const btn = el('button', 'primary-btn', `🔄 Sustituir a ${fromDef.name} en la Formación por ${toDef.name}`);
    btn.addEventListener('click', () => {
      setBandSlot(state, fromPos.row, fromPos.col, toEntry.uid);
      saveGame(state);
      UI.renderTopbar(state);
      if (activeScreen === 'banda') UI.renderBanda(state);
      UI.showToast(`🔄 ${toDef.name} sustituye a ${fromDef.name} en la Formación`);
      UI.showCompare(state, uidA, uidB, mode);
    });
    return btn;
  };
  if (posA && !posB) body.appendChild(swapInBtn(defA, posA, entryB, defB));
  else if (posB && !posA) body.appendChild(swapInBtn(defB, posB, entryA, defA));

  const swapBtn = el('button', 'mini-btn', '🔄 Elegir otro luchador para comparar');
  swapBtn.addEventListener('click', () => UI.openComparePicker(state, uidA));
  body.appendChild(swapBtn);

  $('pickerModal').classList.remove('hidden');
};

UI.openSuperFusePicker = function (state, targetUid) {
  const body = $('pickerModalBody');
  body.innerHTML = '<h3>Sacrificar luchador (SEF 5/5)</h3><p class="settings-info">Otorga una ★ permanente al luchador objetivo. Solo formas finales (sin evolución pendiente) — evoluciónalas antes si aún pueden subir.</p>';
  const list = el('div', 'picker-grid');
  const candidates = state.roster.filter(r => r.uid !== targetUid && r.sef >= 5 && !fighterDef(r.defId).evolvesTo);
  if (candidates.length === 0) list.appendChild(el('div', 'empty-hint', 'No tienes luchadores con SEF 5/5 en forma final disponibles.'));
  const bandUids = state.band.flat().filter(Boolean);
  candidates.forEach(entry => {
    const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
    card.addEventListener('click', () => {
      if (superFuse(state, targetUid, entry.uid)) {
        saveGame(state);
        $('pickerModal').classList.add('hidden');
        UI.openFighterModal(state, targetUid);
        UI.renderBanda(state);
      }
    });
    list.appendChild(card);
  });
  body.appendChild(list);
  $('pickerModal').classList.remove('hidden');
};

UI.openGearPickerForFighter = function (state, fighterUid, slotKey) {
  const entry = rosterEntry(state, fighterUid);
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>Equipar ${GEAR_SLOTS[slotKey].label}</h3>`;
  const currentUid = entry.gear[slotKey];
  if (currentUid) {
    const removeBtn = el('button', 'danger-btn', 'Quitar equipo');
    removeBtn.addEventListener('click', () => { unequipGear(state, fighterUid, slotKey); saveGame(state); $('pickerModal').classList.add('hidden'); UI.openFighterModal(state, fighterUid); });
    body.appendChild(removeBtn);
  }
  const list = el('div', 'item-grid');
  const options = state.gearInventory.filter(g => g.slot === slotKey && !equippedGearOwner(state, g.uid) || g.uid === currentUid);
  if (options.length === 0) list.appendChild(el('div', 'empty-hint', 'No tienes piezas de este tipo.'));
  options.forEach(g => {
    const rarity = rarityInfo(g.rarity);
    const cell = el('div', 'item-cell');
    cell.style.borderColor = rarity.color;
    cell.innerHTML = `<div class="item-tier-icon">${rarity.icon}</div>`;
    cell.appendChild(gearIcon(g, 30));
    cell.appendChild(el('div', 'item-plus', '+' + g.level));
    cell.addEventListener('click', () => { equipGear(state, fighterUid, g.uid); saveGame(state); $('pickerModal').classList.add('hidden'); UI.openFighterModal(state, fighterUid); });
    list.appendChild(cell);
  });
  body.appendChild(list);
  $('pickerModal').classList.remove('hidden');
};

// ---------- Invocar ----------
UI.renderInvocar = function (state) {
  const wrap = $('summonPanels');
  wrap.innerHTML = '';
  wrap.appendChild(el('p', 'settings-info', `💎 Las Gemas se consiguen ganando combates de Arena, completando
    Objetivos (🎯 arriba) y derrotando por primera vez al jefe de cada zona — y si alguna vez te quedas sin
    ninguna, siempre puedes comprar más con Texel en la Tienda (caro a propósito). Sirven para comprar cristales
    sueltos aquí abajo cuando te falten para invocar.`));
  Object.keys(CRYSTALS).forEach(type => {
    const c = CRYSTALS[type];
    const panel = el('div', 'panel summon-panel');
    const rateText = Object.keys(c.rates).filter(r => c.rates[r] > 0).map(r => rarityInfo(r).label + ' ' + Math.round(c.rates[r] * 100) + '%').join(' · ');
    panel.innerHTML = `<h3>${c.icon} ${c.label} <span class="badge">${state.currencies[type]}</span></h3><p class="settings-info">${rateText}</p>`;
    const btnRow = el('div', 'modal-actions');
    const btn1 = el('button', 'primary-btn', 'Invocar x1');
    btn1.disabled = state.currencies[type] < 1;
    btn1.addEventListener('click', () => UI.doSummon(state, type, 1));
    const btn10 = el('button', 'primary-btn', 'Invocar x10');
    btn10.disabled = state.currencies[type] < 10;
    btn10.addEventListener('click', () => UI.doSummon(state, type, 10));
    btnRow.appendChild(btn1); btnRow.appendChild(btn10);
    panel.appendChild(btnRow);
    const buyBtn = el('button', 'mini-btn', 'Comprar 1 por 💎' + crystalGemCost(type));
    buyBtn.disabled = state.currencies.gemas < crystalGemCost(type);
    buyBtn.addEventListener('click', () => {
      const cost = crystalGemCost(type);
      if (state.currencies.gemas >= cost) { state.currencies.gemas -= cost; state.currencies[type]++; saveGame(state); UI.renderInvocar(state); UI.renderTopbar(state); }
    });
    panel.appendChild(buyBtn);
    wrap.appendChild(panel);
  });
};
function crystalGemCost(type) { return { pixite: 6, voxite: 35, doxite: 140 }[type]; }

UI.doSummon = function (state, type, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const r = summonOne(state, type);
    if (r) results.push(r);
  }
  saveGame(state);
  UI.renderTopbar(state);
  UI.renderInvocar(state);
  if (results.length === 0) return;
  if (count === 1) UI.showSingleReveal(results[0]);
  else UI.showMultiReveal(results);
};

function revealOutcomeText(result) {
  return {
    nuevo: '¡Nuevo luchador!',
    duplicado: 'Duplicado · se guarda como copia suelta para fusionar o superfusionar',
    homunculo: '🧪 ¡Homúnculo! Fusiónalo con un luchador desde su ficha para darle experiencia.',
  }[result.outcome];
}

// Un anillo de rayos girando detrás del retrato + una explosión de
// chispas alrededor, solo para Legendario — para que el momento de tocar
// el tier más alto se note claramente distinto al resto de rarezas, no
// solo un resplandor un poco más grande (ver también legendaryFlash en
// .reveal-flash.rarity-legendario, el destello de luz al aparecer).
function appendLegendaryFx(wrap) {
  wrap.appendChild(el('div', 'legendary-burst'));
  for (let i = 0; i < 6; i++) {
    const spark = el('div', 'legendary-spark');
    spark.style.setProperty('--i', i);
    wrap.appendChild(spark);
  }
}

UI.showSingleReveal = function (result) {
  const def = fighterDef(result.defId);
  const rarity = rarityInfo(def.rarity);
  const body = $('summonRevealBody');
  body.className = 'reveal-flash rarity-' + def.rarity;
  body.innerHTML = `<div class="reveal-canvas-wrap"></div><div class="item-modal-name" style="color:${rarity.color}">${def.name}</div><div class="item-modal-rarity">${rarity.label}</div><div class="reveal-outcome">${revealOutcomeText(result)}</div>`;
  const canvasWrap = body.querySelector('.reveal-canvas-wrap');
  if (def.rarity === 'legendario') appendLegendaryFx(canvasWrap);
  canvasWrap.appendChild(creatureCanvas(result.defId, 120));
  $('summonRevealClose').classList.remove('hidden');
  $('summonRevealModal').classList.remove('hidden');
};

// Revelado x10: en vez del antiguo "pop" simultáneo de una rejilla (que se
// notaba tosco y no daba tiempo a fijarse en cada resultado), se muestra un
// carrusel: una criatura a la vez, a pantalla completa, con avance automático
// o al tocar, y un botón para saltar directo al resumen final en rejilla.
UI.showMultiReveal = function (results) {
  const body = $('summonRevealBody');
  $('summonRevealClose').classList.add('hidden');
  $('summonRevealModal').classList.remove('hidden');
  let i = 0;
  let timer = null;

  function renderSummary() {
    body.className = '';
    body.innerHTML = '<h3>Resultados</h3>';
    const grid = el('div', 'item-grid');
    results.forEach(r => {
      const def = fighterDef(r.defId);
      const rarity = rarityInfo(def.rarity);
      const cell = el('div', 'item-cell reveal-cell-pop');
      cell.style.borderColor = rarity.color;
      cell.style.boxShadow = '0 0 14px ' + rarity.glow;
      cell.appendChild(creatureCanvas(r.defId, 56));
      grid.appendChild(cell);
    });
    body.appendChild(grid);
    $('summonRevealClose').classList.remove('hidden');
  }

  function advance() { renderCard(); }

  function renderCard() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (i >= results.length) { renderSummary(); return; }
    const r = results[i];
    const def = fighterDef(r.defId);
    const rarity = rarityInfo(def.rarity);
    body.className = 'reveal-flash rarity-' + def.rarity;
    body.innerHTML = `<div class="reveal-progress">${i + 1} / ${results.length}</div>
      <div class="reveal-canvas-wrap"></div>
      <div class="item-modal-name" style="color:${rarity.color}">${def.name}</div>
      <div class="item-modal-rarity">${rarity.label}</div>
      <div class="reveal-outcome">${revealOutcomeText(r)}</div>
      <button class="mini-btn reveal-skip-btn" id="revealSkipBtn">Saltar »</button>`;
    const canvasWrap = body.querySelector('.reveal-canvas-wrap');
    if (def.rarity === 'legendario') appendLegendaryFx(canvasWrap);
    canvasWrap.appendChild(creatureCanvas(r.defId, 120));
    $('revealSkipBtn').addEventListener('click', (e) => { e.stopPropagation(); i = results.length; renderCard(); });
    body.addEventListener('click', advance, { once: true });
    i++;
    // Un Legendario se queda más tiempo en pantalla para que dé tiempo a
    // apreciar el destello y las chispas, en vez de pasar tan rápido como
    // el resto de rarezas.
    timer = setTimeout(advance, def.rarity === 'legendario' ? 1800 : 900);
  }
  renderCard();
};

// Animación de evolución manual: se muestra a pantalla completa, igual que
// al abrir una invocación, en vez del pequeño destello sobre la ficha.
UI.showEvolveReveal = function (oldDefId, newDefId) {
  const newDef = fighterDef(newDefId);
  const rarity = rarityInfo(newDef.rarity);
  const body = $('summonRevealBody');
  body.className = 'reveal-flash rarity-' + newDef.rarity;
  body.innerHTML = `<div class="evolve-reveal-row"><div class="reveal-canvas-wrap evolve-old"></div><div class="evolve-arrow">➜</div><div class="reveal-canvas-wrap evolve-new"></div></div>
    <div class="item-modal-name" style="color:${rarity.color}">${newDef.name}</div><div class="item-modal-rarity">${rarity.label}</div><div class="reveal-outcome">✨ ¡Evolución completa!</div>`;
  body.querySelector('.evolve-old').appendChild(creatureCanvas(oldDefId, 74));
  body.querySelector('.evolve-new').appendChild(creatureCanvas(newDefId, 100));
  $('summonRevealClose').classList.remove('hidden');
  $('summonRevealModal').classList.remove('hidden');
};

// ---------- Arena ----------
UI.renderArena = function (state) {
  // Temporadas: se comprueba cada vez que se abre la pantalla (sin
  // temporizador en vivo, como la oferta diaria del Mercader) — si la
  // semana real ya cambió desde la última vez, aplica el reset parcial y
  // lo avisa con un toast antes de dibujar los paneles ya actualizados.
  const seasonReset = checkArenaSeasonReset(state);
  if (seasonReset) {
    saveGame(state);
    UI.renderTopbar(state);
    UI.showToast(`🏆 Nueva temporada de Arena — tu pico fue Rango ${seasonReset.previousPeak} (+${seasonReset.reward.gemas} 💎). Rango de esta temporada: ${seasonReset.newRank}.`);
  }
  const league = arenaLeagueForRank(state.arena.rank);
  $('arenaRankPanel').innerHTML = `<h3>${league.icon} ${league.label} — Rango ${state.arena.rank}</h3>
    <div class="stat-row"><span>Pico de esta temporada</span><span>${state.arena.seasonPeakRank}</span></div>
    <div class="stat-row"><span>Mejor rango histórico</span><span>${state.arena.bestRank}</span></div>
    <div class="stat-row"><span>Reset de temporada en</span><span>${arenaSeasonDaysLeft()} día${arenaSeasonDaysLeft() === 1 ? '' : 's'}</span></div>
    ${league.rewardMult > 1 ? `<div class="stat-row"><span>Bonus de liga a las recompensas</span><span>+${Math.round((league.rewardMult - 1) * 100)}%</span></div>` : ''}
    <p class="settings-info">Cada semana el rango baja a la mitad de su pico (nunca a 1), con una recompensa
    de Gemas por ese pico — para tener siempre un motivo para seguir subiendo.</p>`;
  const enemyPanel = $('arenaEnemyPanel');
  enemyPanel.innerHTML = '';
  if (!state.arena.scouted) {
    enemyPanel.innerHTML = '<h3>Sin rival explorado</h3>';
    const champion = arenaChampionForRank(state.arena.rank);
    if (champion) enemyPanel.appendChild(el('p', 'settings-info', `👑 Estás en el rango de entrada a ${champion.label} — al buscar rival te enfrentarás a su campeón fijo, en solitario.`));
    const scoutBtn = el('button', 'primary-btn', 'Buscar rival');
    scoutBtn.addEventListener('click', () => {
      const { rows } = champion ? buildArenaChampionEncounter(state.arena.rank, champion) : buildArenaBand(state.arena.rank);
      state.arena.scouted = rows.map(row => row.map(u => ({ defId: u.defId, level: u.level, extraMult: u.powerMult })));
      state.arena.scoutedChampionLeagueId = champion ? champion.id : null;
      saveGame(state);
      UI.renderArena(state);
    });
    enemyPanel.appendChild(scoutBtn);
    return;
  }
  const scoutedLeague = state.arena.scoutedChampionLeagueId ? ARENA_LEAGUES.find(l => l.id === state.arena.scoutedChampionLeagueId) : null;
  enemyPanel.appendChild(el('h3', null, scoutedLeague ? `👑 Campeón de ${scoutedLeague.label}` : 'Rival explorado'));
  if (scoutedLeague) enemyPanel.appendChild(el('p', 'settings-info', `${fighterDef(state.arena.scouted[0][0].defId).name} — un rival fijo y en solitario, más duro que un rival normal de este rango.`));
  state.arena.scouted.forEach((row, i) => {
    if (row.length === 0) return;
    const rowEl = el('div', 'formation-row');
    row.forEach(u => {
      const slot = el('div', 'formation-slot filled');
      const wrap = el('div', 'creature-canvas-wrap');
      wrap.appendChild(creatureCanvas(u.defId, 40));
      slot.appendChild(wrap);
      rowEl.appendChild(slot);
    });
    enemyPanel.appendChild(rowEl);
  });
  const fightBtn = el('button', 'primary-btn', 'Combatir');
  fightBtn.addEventListener('click', () => UI.startArenaBattle(state));
  enemyPanel.appendChild(fightBtn);
  const rescout = el('button', 'mini-btn', 'Buscar otro rival');
  rescout.addEventListener('click', () => { state.arena.scouted = null; state.arena.scoutedChampionLeagueId = null; saveGame(state); UI.renderArena(state); });
  enemyPanel.appendChild(rescout);
};

UI.startArenaBattle = function (state) {
  if (bandFighterCount(state) === 0) { UI.showToast('⚠️ Coloca al menos un luchador en tu Formación.'); return; }
  window.__championRun = null;
  const scoutedLeague = state.arena.scoutedChampionLeagueId ? ARENA_LEAGUES.find(l => l.id === state.arena.scoutedChampionLeagueId) : null;
  const enemyRows = state.arena.scouted.map(row => row.map(u => makeUnit('enemy', u.defId, u.level, u.extraMult)));
  const league = arenaLeagueForRank(state.arena.rank);
  UI.openBattle(state, buildPlayerCombinations(state), enemyRows, {
    title: scoutedLeague ? `👑 Arena · Campeón de ${scoutedLeague.label}` : 'Arena · ' + league.label + ' · Rango ' + state.arena.rank,
    // Bug: era el único modo de combate del juego sin `zone`, así que el
    // overlay de batalla se quedaba sin fondo (zoneBackgroundStyle nunca se
    // llamaba). assets/scenery/arena.jpg (aún no existe, cae al degradado
    // de respaldo) — mismo patrón que Torre/Roguelike/Prueba del Campeón.
    zone: { id: 'arena', color: '#4a1f1f' },
    onEnd: (result) => {
      state.arena.scouted = null;
      state.arena.scoutedChampionLeagueId = null;
      if (result === 'victoria') {
        state.arena.rank++;
        state.arena.bestRank = Math.max(state.arena.bestRank, state.arena.rank);
        state.arena.seasonPeakRank = Math.max(state.arena.seasonPeakRank, state.arena.rank);
        const texel = Math.round((40 + state.arena.rank * 6) * league.rewardMult);
        let gemas = Math.round((3 + Math.floor(state.arena.rank / 3)) * league.rewardMult);
        if (scoutedLeague) gemas += arenaChampionBonusReward(scoutedLeague).gemas;
        state.currencies.texel += texel; state.currencies.gemas += gemas;
        saveGame(state);
        return { rewards: { texel, fighterXp: 0, drops: {} }, leveled: [], gemas, championBeaten: scoutedLeague ? scoutedLeague.label : null };
      }
      saveGame(state);
      return null;
    },
  });
};

// ---------- Equipo ----------
// ---------- Filtro y selección múltiple de Equipo ----------
// Mismo patrón que la selección múltiple de la Colección (ver
// renderBulkActionBar) — pensado para cuando el inventario de equipo (tope
// MAX_GEAR) se llena de piezas sueltas de bajo tier que nunca se van a
// equipar, y venderlas una a una es tedioso.
UI.gearFilterMode = 'all';
UI.gearBulkMode = false;
UI.gearBulkSelection = new Set();

UI.renderEquipo = function (state) {
  $('gearCount').textContent = state.gearInventory.length;
  const grid = $('gearGrid');
  grid.innerHTML = '';
  $('gearEmptyHint').classList.toggle('hidden', state.gearInventory.length > 0);
  const filtered = state.gearInventory.filter(g => {
    const used = !!equippedGearOwner(state, g.uid);
    if (UI.gearFilterMode === 'unused') return !used;
    if (UI.gearFilterMode === 'equipped') return used;
    return true;
  });
  filtered.forEach(g => {
    const rarity = rarityInfo(g.rarity);
    const owner = equippedGearOwner(state, g.uid);
    const cell = el('div', 'item-cell' + (UI.gearBulkMode && UI.gearBulkSelection.has(g.uid) ? ' selected' : ''));
    cell.style.borderColor = rarity.color;
    cell.innerHTML = `<div class="item-tier-icon">${rarity.icon}</div><div class="item-plus">+${g.level}</div>${owner ? '<div class="equipped-dot"></div>' : ''}`;
    cell.appendChild(gearIcon(g, 30));
    cell.addEventListener('click', () => {
      if (UI.gearBulkMode) {
        if (owner) { UI.showToast('⚠️ Ese equipo está puesto — quítaselo antes de venderlo.'); return; }
        if (UI.gearBulkSelection.has(g.uid)) UI.gearBulkSelection.delete(g.uid);
        else UI.gearBulkSelection.add(g.uid);
        UI.renderEquipo(state);
        return;
      }
      UI.openGearModal(state, g.uid);
    });
    grid.appendChild(cell);
  });

  const bulkBtn = $('gearBulkModeBtn');
  bulkBtn.textContent = UI.gearBulkMode ? '✕ Cancelar selección' : '☑️ Selección múltiple';
  bulkBtn.classList.toggle('active', UI.gearBulkMode);
  renderGearBulkActionBar(state);
};

function renderGearBulkActionBar(state) {
  const bar = $('gearBulkActionBar');
  if (!UI.gearBulkMode) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
  bar.classList.remove('hidden');
  bar.innerHTML = '';
  // Descarta de la selección cualquier uid que ya no exista o que se haya
  // equipado mientras seguía seleccionado.
  const uids = [...UI.gearBulkSelection].filter(uid => gearItem(state, uid) && !equippedGearOwner(state, uid));
  if (uids.length !== UI.gearBulkSelection.size) UI.gearBulkSelection = new Set(uids);
  const gears = uids.map(uid => gearItem(state, uid));
  bar.appendChild(el('p', 'settings-info', gears.length === 0
    ? 'Toca piezas de equipo sin usar para seleccionarlas.'
    : `${gears.length} pieza${gears.length === 1 ? '' : 's'} seleccionada${gears.length === 1 ? '' : 's'}.`));

  const totalValue = gears.reduce((sum, g) => sum + gearStatValue(g) * 2, 0);
  const sellBtn = el('button', 'danger-btn', gears.length ? `🪙 Vender seleccionadas (+${totalValue})` : '🪙 Vender seleccionadas');
  sellBtn.disabled = gears.length === 0;
  sellBtn.addEventListener('click', () => {
    if (!confirm(`¿Vender ${gears.length} piezas de equipo por ${totalValue} Texel en total? No se puede deshacer.`)) return;
    uids.forEach(uid => sellGear(state, uid));
    UI.gearBulkSelection.clear();
    saveGame(state);
    UI.renderTopbar(state);
    UI.renderEquipo(state);
    UI.showToast(`🪙 Vendidas ${gears.length} piezas por +${totalValue} Texel`);
  });
  bar.appendChild(sellBtn);

  if (gears.length > 0) {
    const clearBtn = el('button', 'mini-btn', 'Vaciar selección');
    clearBtn.addEventListener('click', () => { UI.gearBulkSelection.clear(); UI.renderEquipo(state); });
    bar.appendChild(clearBtn);
  }
}

// ---------- Mercader Itinerante ----------
// Oferta diaria (ver merchantOffer en data.js): cambia copias sueltas de
// una rareza concreta — que ahora solo sirven de material de Fusión — por
// 1 pieza de equipo o un puñado de cristales. Solo una vez al día
// (`state.merchant.lastRedeemedKey`); la oferta cambia sola al día
// siguiente, sin tocar nada del jugador.
function renderMerchantPanel(state) {
  const container = $('shopMerchantPanel');
  container.innerHTML = '';
  const offer = merchantOffer();
  const redeemed = merchantOfferRedeemedToday(state);
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', null, '🧳 Mercader Itinerante'));
  const rewardText = offer.kind === 'gear'
    ? '1 pieza de equipo ' + rarityInfo(offer.rewardRarity).label
    : offer.crystalAmount + ' ' + CRYSTALS[offer.crystalType].label;
  panel.appendChild(el('p', 'settings-info', `Hoy cambia ${offer.costCount} copias ${rarityInfo(offer.costRarity).label} por ${rewardText}. Oferta nueva cada día.`));
  const btn = el('button', redeemed ? 'mini-btn' : 'primary-btn', redeemed ? 'Ya cambiado hoy' : '🧳 Cambiar');
  btn.disabled = redeemed;
  if (!redeemed) btn.addEventListener('click', () => UI.openMerchantTrade(state));
  panel.appendChild(btn);
  container.appendChild(panel);
}

UI.openMerchantTrade = function (state) {
  const offer = merchantOffer();
  const body = $('pickerModalBody');
  const rewardText = offer.kind === 'gear'
    ? '1 pieza de equipo ' + rarityInfo(offer.rewardRarity).label
    : offer.crystalAmount + ' ' + CRYSTALS[offer.crystalType].label;
  body.innerHTML = `<h3>🧳 Mercader Itinerante</h3>
    <p class="settings-info">Elige ${offer.costCount} copias ${rarityInfo(offer.costRarity).label} para
    cambiarlas por ${rewardText}. Se pierden al cambiarlas.</p>`;
  const candidates = state.roster.filter(entry => fighterDef(entry.defId).rarity === offer.costRarity);
  const selected = new Set();
  const confirmBtn = el('button', 'primary-btn', 'Cambiar (0/' + offer.costCount + ')');
  confirmBtn.disabled = true;
  if (candidates.length < offer.costCount) {
    body.appendChild(el('div', 'empty-hint', 'No tienes suficientes copias ' + rarityInfo(offer.costRarity).label + ' todavía.'));
  } else {
    const grid = el('div', 'picker-grid');
    const bandUids = state.band.flat().filter(Boolean);
    candidates.forEach(entry => {
      const card = creatureCard(state, entry, { inBand: bandUids.includes(entry.uid) });
      card.addEventListener('click', () => {
        if (selected.has(entry.uid)) { selected.delete(entry.uid); card.classList.remove('selected'); }
        else { if (selected.size >= offer.costCount) return; selected.add(entry.uid); card.classList.add('selected'); }
        confirmBtn.textContent = 'Cambiar (' + selected.size + '/' + offer.costCount + ')';
        confirmBtn.disabled = selected.size !== offer.costCount;
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }
  confirmBtn.addEventListener('click', () => {
    if (selected.size !== offer.costCount) return;
    [...selected].forEach(uid => removeFromRoster(state, uid));
    if (offer.kind === 'gear') addGear(state, generateGear(randomGearSlot(), offer.rewardRarity));
    else state.currencies[offer.crystalType] += offer.crystalAmount;
    state.merchant.lastRedeemedKey = offer.key;
    saveGame(state);
    $('pickerModal').classList.add('hidden');
    UI.renderTienda(state);
    UI.showToast('🧳 Intercambio realizado');
  });
  body.appendChild(confirmBtn);
  $('pickerModal').classList.remove('hidden');
};

// ---------- Tienda ----------
UI.renderTienda = function (state) {
  renderMerchantPanel(state);

  const gemasWrap = $('shopGemasPanels');
  gemasWrap.innerHTML = '';
  GEMAS_TEXEL_OFFERS.forEach(offer => {
    const panel = el('div', 'shop-row');
    panel.appendChild(el('div', 'shop-row-icon', '💎'));
    const info = el('div', 'shop-row-info');
    info.appendChild(el('div', 'shop-row-title', offer.amount + ' Gemas'));
    const buyBtn = el('button', 'primary-btn', 'Comprar (🪙' + offer.price + ')');
    buyBtn.disabled = state.currencies.texel < offer.price;
    buyBtn.addEventListener('click', () => {
      if (buyGemasWithTexel(state, offer)) {
        saveGame(state);
        UI.renderTopbar(state);
        UI.renderTienda(state);
        UI.showToast('💎 +' + offer.amount + ' Gemas compradas');
      }
    });
    info.appendChild(buyBtn);
    panel.appendChild(info);
    gemasWrap.appendChild(panel);
  });

  const gearWrap = $('shopGearPanels');
  gearWrap.innerHTML = '';
  GEAR_SLOT_IDS.forEach(slot => {
    const slotInfo = GEAR_SLOTS[slot];
    const repType = gearTypeIds(slot)[0];
    const panel = el('div', 'shop-row');
    const iconBox = el('div', 'shop-row-icon');
    iconBox.appendChild(gearIcon({ slot, type: repType, rarity: 'raro' }, 34));
    panel.appendChild(iconBox);
    const info = el('div', 'shop-row-info');
    info.appendChild(el('div', 'shop-row-title', slotInfo.label));
    const buyRow = el('div', 'shop-buy-row');
    // Cada botón muestra la foto real de esa rareza concreta (del tipo
    // representativo del hueco — el tipo exacto que toque sigue siendo al
    // azar al comprar, como ya era), no solo un icono de color genérico.
    RARITIES.forEach(rarity => {
      const price = GEAR_SHOP_PRICES[rarity.id];
      const btn = el('button', 'shop-buy-btn');
      btn.style.borderColor = rarity.color;
      btn.appendChild(gearIcon({ slot, type: repType, rarity: rarity.id }, 30));
      btn.appendChild(el('div', 'shop-buy-price', '🪙' + price));
      btn.disabled = state.currencies.texel < price || state.gearInventory.length >= MAX_GEAR;
      btn.addEventListener('click', () => {
        const gear = buyShopGear(state, slot, rarity.id);
        if (gear) {
          saveGame(state);
          UI.renderTopbar(state);
          UI.renderTienda(state);
          const t = gearTypeInfo(gear);
          UI.showToast(`${t.icon} ${t.names[rarity.id]} comprado`);
        }
      });
      buyRow.appendChild(btn);
    });
    info.appendChild(buyRow);
    panel.appendChild(info);
    gearWrap.appendChild(panel);
  });

  const itemWrap = $('shopItemPanels');
  itemWrap.innerHTML = '';
  Object.keys(CONSUMABLES).forEach(itemId => {
    const item = CONSUMABLES[itemId];
    const panel = el('div', 'shop-row');
    panel.appendChild(el('div', 'shop-row-icon', item.icon));
    const info = el('div', 'shop-row-info');
    info.appendChild(el('div', 'shop-row-title', item.label + ' <span class="badge">' + (state.items[itemId] || 0) + '</span>'));
    info.appendChild(el('div', 'settings-info', item.desc));
    const buyBtn = el('button', 'primary-btn', 'Comprar (' + (item.currency === 'texel' ? '🪙' : '💎') + item.price + ')');
    buyBtn.disabled = state.currencies[item.currency] < item.price;
    buyBtn.addEventListener('click', () => {
      if (buyConsumable(state, itemId)) {
        saveGame(state);
        UI.renderTopbar(state);
        UI.renderTienda(state);
        UI.showToast(item.icon + ' ' + item.label + ' comprada');
      }
    });
    info.appendChild(buyBtn);
    panel.appendChild(info);
    itemWrap.appendChild(panel);
  });
};

const STAT_LABELS = { hp: '❤️ Vida', atk: '⚔️ Ataque', def: '🛡️ Defensa', agi: '💨 Agilidad', wis: '🧠 Sabiduría' };
UI.openGearModal = function (state, gearUid) {
  const g = gearItem(state, gearUid);
  const rarity = rarityInfo(g.rarity);
  const owner = equippedGearOwner(state, gearUid);
  const slot = GEAR_SLOTS[g.slot];
  const t = gearTypeInfo(g);
  const val = gearStatValue(g);
  const body = $('gearModalBody');
  body.innerHTML = `
    <div class="item-modal-header" style="color:${rarity.color}">
      <div><div class="item-modal-name">${t.names[g.rarity]} +${g.level}</div><div class="item-modal-rarity">${rarity.label} · ${slot.label} (${t.label})</div></div></div>
    <div class="panel">
      <div class="stat-row"><span>${STAT_LABELS[t.primary]}</span><span>+${Math.round(val * t.primaryMult)}</span></div>
      ${t.secondary ? `<div class="stat-row"><span>${STAT_LABELS[t.secondary]}</span><span>+${Math.round(val * t.secondaryMult)}</span></div>` : ''}
    </div>
    ${owner ? `<p class="settings-info">Equipado en ${fighterDef(rosterEntry(state, owner.uid).defId).name}.</p>` : ''}
  `;
  body.querySelector('.item-modal-header').prepend(gearIcon(g, 50));
  const actions = el('div', 'modal-actions');
  const upgradeBtn = el('button', 'primary-btn', 'Mejorar (🪙 ' + gearUpgradeCost(g) + ')');
  upgradeBtn.addEventListener('click', () => { if (upgradeGear(state, gearUid)) { saveGame(state); UI.openGearModal(state, gearUid); UI.renderTopbar(state); } });
  actions.appendChild(upgradeBtn);
  if (!owner) {
    const sellBtn = el('button', 'danger-btn', 'Vender (🪙 ' + gearStatValue(g) * 2 + ')');
    sellBtn.addEventListener('click', () => { sellGear(state, gearUid); saveGame(state); $('gearModal').classList.add('hidden'); UI.renderEquipo(state); UI.renderTopbar(state); });
    actions.appendChild(sellBtn);
  }
  body.appendChild(actions);
  $('gearModal').classList.remove('hidden');
};

// ---------- Batalla ----------
// El jugador elige, choque a choque, cuál de sus 3 combinaciones envía contra
// la fila activa del rival. A diferencia de antes, una combinación elegida no
// pelea "hasta la muerte": cada luchador vivo (de ambos bandos) actúa UNA vez
// y ahí termina la ronda. Si el enemigo sigue en pie, esa combinación queda
// gastada para este ciclo y hay que elegir otra; cuando las 3 combinaciones
// vivas ya han actuado en este ciclo sin acabar con el enemigo, se reinicia
// el ciclo y se vuelve a elegir entre ellas. Al caer la fila enemiga, las 3
// combinaciones quedan disponibles de nuevo para la siguiente oleada.
// Combate automático: se recuerda entre batallas (UI.autoBattleEnabled,
// como UI.rosterSortMode) para que no haya que reactivarlo en cada nodo de
// un recorrido o nivel de Torre — es un modo "déjalo jugar solo", no algo
// que se active por combate suelto.
UI.autoBattleEnabled = false;
UI.openBattle = function (state, playerRowsRaw, enemyRowsRaw, opts) {
  const playerGroups = playerRowsRaw.map((row, idx) => ({ idx, row, usedThisCycle: false })).filter(g => g.row.length > 0);
  const enemyRows = enemyRowsRaw.filter(r => r.length > 0);
  const view = {
    state, opts, playerGroups, enemyRows, enemyIdx: 0,
    currentPlayerRow: null, currentEnemyRow: null, unitById: {}, log: [], idx: 0, timer: null,
    autoBattle: UI.autoBattleEnabled,
    // Resumen post-combate (ver battleStatsSummaryHtml): se acumula con
    // cada evento de UI.applyBattleEvent a lo largo de este combate
    // entero (todas las líneas/oleadas), no se resetea entre choques.
    battleStats: { dmgDealt: 0, dmgReceived: 0, healDone: 0, maxHit: 0, byUnit: {} },
  };
  window.__battleView = view;
  $('battleTitle').textContent = opts.title;
  $('battleOverlay').style.background = opts.zone ? zoneBackgroundStyle(opts.zone) : '';
  $('battleResult').classList.add('hidden');
  $('groupPickerPanel').classList.add('hidden');
  $('battleLog').innerHTML = '';
  $('battleOverlay').classList.remove('hidden');
  UI.updateAutoBattleBtn(view);
  UI.updateBattleSpeedBtn();
  UI.promptNextClash(view);
};

UI.updateAutoBattleBtn = function (view) {
  const btn = $('battleAutoBtn');
  if (!btn) return;
  btn.classList.toggle('active', !!view.autoBattle);
  btn.textContent = view.autoBattle ? '🤖 Auto: ON' : '🤖 Auto';
};

// Control de velocidad de la animación de combate: cicla 1×/2×/3× (se
// recuerda entre combates, igual que el auto-combate). UI.stepBattle
// divide el retardo fijo de 420ms entre esta velocidad.
UI.battleSpeed = 1;
UI.cycleBattleSpeed = function () {
  const speeds = [1, 2, 3];
  UI.battleSpeed = speeds[(speeds.indexOf(UI.battleSpeed) + 1) % speeds.length];
  UI.updateBattleSpeedBtn();
};
UI.updateBattleSpeedBtn = function () {
  const btn = $('battleSpeedBtn');
  if (btn) btn.textContent = '⏱️ ' + UI.battleSpeed + '×';
};

UI.toggleAutoBattle = function () {
  const view = window.__battleView;
  UI.autoBattleEnabled = !UI.autoBattleEnabled;
  if (!view) return;
  view.autoBattle = UI.autoBattleEnabled;
  UI.updateAutoBattleBtn(view);
  // Si se activa justo cuando toca elegir línea, resuelve esa elección ya
  // mismo en vez de esperar al siguiente choque.
  if (view.autoBattle && !$('groupPickerPanel').classList.contains('hidden')) {
    const remaining = resolveAvailableGroups(view);
    if (remaining.length) UI.commitGroup(view, pickAutoGroup(view, remaining));
  }
};

// Heurística del combate automático: la línea que más daño estimado le
// haga a la fila enemiga activa (rowDamageScore en combat.js, que ya
// incluye la ventaja elemental de cada atacante), con un bonus por cada
// superviviente extra en la línea — así, entre dos líneas de daño similar,
// prefiere la que reparte quién recibe el golpe de vuelta entre más
// personajes en vez de enviar siempre al mismo único superviviente.
function pickAutoGroup(view, remaining) {
  const enemyRow = view.enemyRows[view.enemyIdx];
  const score = (g) => {
    const aliveCount = g.row.filter(u => u.alive).length;
    return rowDamageScore(g.row, enemyRow) * (1 + (aliveCount - 1) * 0.15);
  };
  return remaining.reduce((best, g) => score(g) > score(best) ? g : best);
}

function alivePlayerGroups(view) { return view.playerGroups.filter(g => rowAlive(g.row)); }
function unusedAliveGroups(view) { return alivePlayerGroups(view).filter(g => !g.usedThisCycle); }

// Decide qué combinaciones se pueden elegir ahora: si ya se usaron todas las
// vivas en este ciclo contra la fila enemiga activa, reinicia el ciclo
// ("se vuelve a elegir") y las devuelve todas de nuevo.
function resolveAvailableGroups(view) {
  const alive = alivePlayerGroups(view);
  if (alive.length === 0) return [];
  let usable = unusedAliveGroups(view);
  if (usable.length === 0) {
    alive.forEach(g => { g.usedThisCycle = false; });
    usable = alive;
  }
  return usable;
}

UI.promptNextClash = function (view) {
  if (view.enemyIdx >= view.enemyRows.length) { UI.endBattle(view, 'victoria'); return; }
  const remaining = resolveAvailableGroups(view);
  if (remaining.length === 0) { UI.endBattle(view, 'derrota'); return; }
  UI.renderClashPreview(view);
  if (remaining.length === 1) UI.commitGroup(view, remaining[0]);
  else if (view.autoBattle) UI.commitGroup(view, pickAutoGroup(view, remaining));
  else UI.showGroupPicker(view, remaining);
};

UI.renderClashPreview = function (view) {
  const enemyRow = view.enemyRows[view.enemyIdx];
  const activeEl = $('enemyActiveRow');
  activeEl.innerHTML = '';
  enemyRow.forEach(u => activeEl.appendChild(UI.battleUnitCard(u)));
  const queuedEl = $('enemyQueuedRows');
  queuedEl.innerHTML = '';
  for (let i = view.enemyIdx + 1; i < view.enemyRows.length; i++) {
    const mini = el('div', 'queued-row-mini');
    view.enemyRows[i].forEach(u => mini.appendChild(creatureCanvas(u.defId, 26)));
    queuedEl.appendChild(mini);
  }
  // El resto de la banda disponible ya se ve en la propia rejilla del
  // selector de línea (o, si se autoconfirma por no haber elección,
  // directamente en la ficha de combate) — mostrarla aquí también sería
  // redundante, así que esta vista previa se deja vacía hasta que
  // commitGroup rellene el banquillo real tras la elección.
  $('playerActiveRow').innerHTML = '';
  $('playerQueuedRows').innerHTML = '';
};

// Busca al luchador colocado en una celda de la Formación entre las filas ya
// calculadas por buildPlayerCombinations (view.playerGroups) — evita tener
// que reconstruir el objeto de combate desde cero, el mismo uid ya vive en
// cualquier línea que lo contenga.
function cellPickerUnit(view, uid) {
  for (const g of view.playerGroups) {
    const found = g.row.find(u => u.sourceUid === uid);
    if (found) return found;
  }
  return null;
}

// Dado un conjunto de celdas ya tocadas durante el gesto de deslizar,
// encuentra la única de las 8 BAND_LINES que las contiene todas (2 celdas
// distintas ya bastan para determinar una línea sin ambigüedad en una
// cuadrícula 3×3 — cualquier par de celdas está alineado como mucho en una
// fila, columna o diagonal). Con menos de 2 celdas, o si las celdas tocadas
// no están alineadas entre sí, no hay línea determinada todavía.
function lineForCells(cells) {
  if (cells.length < 2) return null;
  return BAND_LINES.find(line => cells.every(([r, c]) => line.cells.some(([lr, lc]) => lr === r && lc === c)));
}

// Igual que la Formación 3×3 de Banda, pero pensado para el gesto de
// "deslizar para elegir 1 línea" del D.o.T. original (ver
// reference/dot-original/combate-elegir-linea.jpg): se sigue el puntero con
// eventos pointerdown/move/up (sirven igual para dedo o ratón), se resuelve
// qué línea de las 8 posibles forman las celdas tocadas y, si esa línea
// sigue disponible este ciclo, se suelta para confirmarla — sin soltar
// sobre ninguna línea válida no pasa nada y se puede reintentar.
UI.showGroupPicker = function (view, remaining) {
  const panel = $('groupPickerPanel');
  const list = $('groupPickerList');
  list.innerHTML = '';
  list.className = 'group-picker-list';

  const remainingByIdx = {};
  remaining.forEach(g => { remainingByIdx[g.idx] = g; });

  const cellEls = [];
  for (let r = 0; r < BAND_ROWS; r++) {
    const rowEl = el('div', 'picker-row');
    for (let c = 0; c < BAND_COLS; c++) {
      const uid = view.state.band[r][c];
      const unit = uid ? cellPickerUnit(view, uid) : null;
      const cellEl = el('div', 'picker-cell' + (unit ? '' : ' empty'));
      if (unit) {
        const wrap = el('div', 'creature-canvas-wrap' + (unit.alive ? '' : ' fainted'));
        wrap.appendChild(creatureCanvas(unit.defId, 40));
        cellEl.appendChild(wrap);
        if (unit.alive) {
          cellEl.appendChild(el('div', 'picker-cell-ult', ultTurnsText(unit)));
          const hpBar = el('div', 'hp-bar small');
          const fill = el('div', 'hp-fill');
          fill.style.width = Math.max(0, unit.hp / unit.maxHp * 100) + '%';
          hpBar.appendChild(fill);
          cellEl.appendChild(hpBar);
          // Aviso de ventaja elemental: ▲ verde si este luchador pega
          // fuerte contra la fila enemiga activa, ▼ rojo si sale
          // perdiendo — mismo criterio (unitElementScore) que usa el
          // combate automático para elegir línea. Se omite si es neutro,
          // para no llenar la celda de iconos quieran decir o no nada.
          const advScore = unitElementScore(unit, view.enemyRows[view.enemyIdx]);
          if (advScore > 1.05) cellEl.appendChild(el('div', 'picker-cell-adv adv-good', '▲'));
          else if (advScore < 0.95) cellEl.appendChild(el('div', 'picker-cell-adv adv-bad', '▼'));
        }
      }
      cellEls.push(cellEl);
      rowEl.appendChild(cellEl);
    }
    list.appendChild(rowEl);
  }

  // Líneas vivas ya usadas este ciclo (no están en `remaining`, pero
  // tampoco están muertas) — se tachan con una raya sobre la rejilla para
  // que se vea de un vistazo qué ha usado ya el jugador; vuelven a
  // desaparecer solas cuando resolveAvailableGroups reinicia el ciclo
  // porque ya no queda ninguna línea viva sin usar.
  const usedLines = alivePlayerGroups(view).filter(g => g.usedThisCycle).map(g => BAND_LINES[g.idx]);
  if (usedLines.length) {
    requestAnimationFrame(() => {
      const containerRect = list.getBoundingClientRect();
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'picker-used-overlay');
      svg.setAttribute('width', containerRect.width);
      svg.setAttribute('height', containerRect.height);
      usedLines.forEach(line => {
        const [r1, c1] = line.cells[0];
        const [r2, c2] = line.cells[2];
        const p1 = cellAt(r1, c1).getBoundingClientRect();
        const p2 = cellAt(r2, c2).getBoundingClientRect();
        const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        lineEl.setAttribute('x1', p1.left + p1.width / 2 - containerRect.left);
        lineEl.setAttribute('y1', p1.top + p1.height / 2 - containerRect.top);
        lineEl.setAttribute('x2', p2.left + p2.width / 2 - containerRect.left);
        lineEl.setAttribute('y2', p2.top + p2.height / 2 - containerRect.top);
        svg.appendChild(lineEl);
      });
      list.appendChild(svg);
    });
  }

  function cellAt(r, c) { return cellEls[r * BAND_COLS + c]; }
  function clearHighlight() { cellEls.forEach(el2 => el2.classList.remove('selecting', 'invalid')); }
  function applyHighlight(line) {
    clearHighlight();
    if (!line) return;
    const group = remainingByIdx[BAND_LINES.indexOf(line)];
    const cls = group ? 'selecting' : 'invalid';
    line.cells.forEach(([r, c]) => cellAt(r, c).classList.add(cls));
  }
  function cellFromPoint(x, y) {
    const hit = document.elementFromPoint(x, y);
    const cellEl = hit && hit.closest('.picker-cell');
    if (!cellEl) return null;
    const idx = cellEls.indexOf(cellEl);
    return idx < 0 ? null : [Math.floor(idx / BAND_COLS), idx % BAND_COLS];
  }

  let dragCells = null;
  function onPointerDown(e) {
    const start = cellFromPoint(e.clientX, e.clientY);
    if (!start) return;
    dragCells = [start];
    list.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragCells) return;
    const cell = cellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    const already = dragCells.some(([r, c]) => r === cell[0] && c === cell[1]);
    if (already) return;
    const candidate = [...dragCells, cell];
    if (!lineForCells(candidate)) return; // no alineado con lo ya tocado: se ignora
    dragCells = candidate;
    applyHighlight(lineForCells(dragCells));
  }
  function onPointerUp() {
    if (!dragCells) return;
    const line = lineForCells(dragCells);
    dragCells = null;
    if (!line) { clearHighlight(); return; }
    const group = remainingByIdx[BAND_LINES.indexOf(line)];
    if (group) UI.commitGroup(view, group);
    else clearHighlight();
  }
  list.addEventListener('pointerdown', onPointerDown);
  list.addEventListener('pointermove', onPointerMove);
  list.addEventListener('pointerup', onPointerUp);
  list.addEventListener('pointercancel', onPointerUp);

  panel.classList.remove('hidden');
};

UI.commitGroup = function (view, group) {
  $('groupPickerPanel').classList.add('hidden');
  group.usedThisCycle = true;
  const playerRow = group.row;
  const enemyRow = view.enemyRows[view.enemyIdx];
  view.currentPlayerRow = playerRow;
  view.currentEnemyRow = enemyRow;
  view.unitById = {};
  [...playerRow, ...enemyRow].forEach(u => { view.unitById[u.id] = u; });

  const clone = JSON.parse(JSON.stringify({ p: playerRow, e: enemyRow }));
  const { log } = simulateOneRound(clone.p, clone.e);
  view.log = log; view.idx = 0;

  // El combate en sí siempre se muestra en fila horizontal, elijas la
  // línea que elijas (fila/columna/diagonal) — a diferencia de la
  // rejilla del selector, que sí es espacial.
  const activeEl = $('playerActiveRow');
  activeEl.innerHTML = '';
  activeEl.classList.remove('active-row-spread');
  playerRow.forEach(u => activeEl.appendChild(UI.battleUnitCard(u)));
  // Las combinaciones restantes ya no se listan aquí debajo — el jugador
  // las vuelve a ver, si hace falta, en la propia rejilla del selector
  // cuando toque elegir de nuevo.
  $('playerQueuedRows').innerHTML = '';

  UI.stepBattle(view, false);
};

UI.battleUnitCard = function (u) {
  const card = el('div', 'battle-unit rarity-' + (u.isBoss ? 'jefe' : u.rarity) + (u.alive ? '' : ' fainted'));
  card.dataset.unitId = u.id;
  card.addEventListener('click', () => UI.showBattleUnitStats(u));
  // La carga de ulti va superpuesta como insignia sobre la propia foto
  // (esquina superior), no como barra aparte debajo — deja la tarjeta
  // más compacta y legible.
  const canvasWrap = el('div', 'battle-unit-canvas-wrap');
  canvasWrap.appendChild(creatureCanvas(u.defId, 76));
  canvasWrap.appendChild(el('div', 'ult-turns', ultTurnsText(u)));
  card.appendChild(canvasWrap);
  const hpBar = el('div', 'hp-bar small');
  const fill = el('div', 'hp-fill');
  fill.style.width = Math.max(0, u.hp / u.maxHp * 100) + '%';
  hpBar.appendChild(fill);
  card.appendChild(hpBar);
  card.appendChild(el('div', 'battle-unit-name', u.name));
  return card;
};

// Además de la barra, un número claro de turnos que faltan para la ulti
// (o "¡LISTA!" si ya está cargada) — estimado en base a la ganancia propia
// por turno, ver estimatedTurnsToUlt.
function ultTurnsText(u) {
  const t = estimatedTurnsToUlt(u);
  return t === 0 ? '⚡ ¡LISTA!' : '⚡ ' + t;
}

// Ficha de estadísticas de un luchador EN COMBATE (tanto propio como
// rival) — se abre al tocar su tarjeta durante la batalla. Reutiliza el
// modal genérico de picker; el CSS del modal va por encima del overlay de
// batalla para que se vea aunque la batalla esté en pantalla completa.
UI.showBattleUnitStats = function (u) {
  const rarity = u.isBoss ? BOSS_RARITY_INFO : rarityInfo(u.rarity);
  const skill = SKILL_TYPES[u.skillId];
  const body = $('pickerModalBody');
  body.innerHTML = '';
  const head = el('div', 'fighter-modal-head');
  head.appendChild(creatureCanvas(u.defId, 80));
  const info = el('div');
  // El nivel mostrado es el NOMINAL (capado en XP_LEVEL_CAP) — a partir de
  // ahí el rival puede llevar un refuerzo extra (lateZoneMult del camino en
  // zonas avanzadas, bossAdaptiveMult del jefe...) que no cambia ese número
  // pero sí sus estadísticas reales, así que se muestra aparte para que no
  // parezca "un Nv.40 cualquiera" cuando en realidad pega mucho más fuerte.
  const boostTag = u.side === 'enemy' && u.powerMult > 1.02 ? ` · 💪 Reforzado ×${u.powerMult.toFixed(2)}` : '';
  info.innerHTML = `<div class="item-modal-name" style="color:${rarity.color}">${u.name}</div>
    <div class="item-modal-rarity">${rarity.label} · ${ELEMENT_INFO[u.element].label} ${ELEMENT_INFO[u.element].icon} · ${CLASS_INFO[u.class].label} ${CLASS_INFO[u.class].icon}</div>
    <div class="item-modal-rarity">Nv. ${u.level}${u.alive ? '' : ' · 💀 caído'}${boostTag}</div>`;
  head.appendChild(info);
  body.appendChild(head);

  const statsPanel = el('div', 'panel');
  statsPanel.innerHTML = `<div class="stat-row"><span>❤️ Vida</span><span>${Math.max(0, u.hp)}/${u.maxHp}</span></div>
    <div class="stat-row"><span>⚔️ Ataque</span><span>${u.atk}</span></div>
    <div class="stat-row"><span>🛡️ Defensa</span><span>${u.def}</span></div>
    <div class="stat-row"><span>💨 Agilidad</span><span>${u.agi}</span></div>
    <div class="stat-row"><span>🧠 Sabiduría</span><span>${u.wis}</span></div>`;
  body.appendChild(statsPanel);

  const skillPanel = el('div', 'panel');
  skillPanel.innerHTML = `<h3>⚡ ${skill.name} (Ulti)</h3><p class="settings-info">${skill.desc}</p>
    <div class="ult-bar"><div class="ult-fill" style="width:${u.ultCharge || 0}%"></div></div>
    <p class="settings-info">${ultTurnsText(u)}</p>`;
  body.appendChild(skillPanel);

  $('pickerModal').classList.remove('hidden');
};

UI.updateUnitCardHp = function (u) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${u.id}"]`);
  if (!cardEl) return;
  const fill = cardEl.querySelector('.hp-fill');
  if (fill) fill.style.width = Math.max(0, u.hp / u.maxHp * 100) + '%';
  cardEl.classList.toggle('fainted', !u.alive);
};

UI.updateUnitCardCharge = function (u) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${u.id}"]`);
  if (!cardEl) return;
  const turns = cardEl.querySelector('.ult-turns');
  if (turns) turns.textContent = ultTurnsText(u);
};

UI.logLine = function (text) {
  const logEl = $('battleLog');
  const line = el('div', 'battle-log-line', text);
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
  while (logEl.children.length > 40) logEl.removeChild(logEl.firstChild);
};

UI.stepBattle = function (view, instant) {
  if (view.timer) { clearTimeout(view.timer); view.timer = null; }
  const advance = () => {
    if (view.idx >= view.log.length) { UI.onClashDone(view); return; }
    const ev = view.log[view.idx++];
    UI.applyBattleEvent(view, ev);
    if (!instant) view.timer = setTimeout(advance, Math.round(420 / UI.battleSpeed));
    else advance();
  };
  advance();
};

UI.onClashDone = function (view) {
  if (!rowAlive(view.currentEnemyRow)) {
    view.enemyIdx++;
    // Nueva oleada: las 3 combinaciones (las que sigan vivas) vuelven a
    // estar disponibles, sin arrastrar el desgaste de la oleada anterior.
    view.playerGroups.forEach(g => { g.usedThisCycle = false; });
  }
  UI.promptNextClash(view);
};

// Registro por unidad DENTRO de este combate (view.battleStats.byUnit,
// indexado por el id efímero de la unidad, u1/u2/...) — se usa tanto para
// el MVP del resumen de combate como, con sourceUid, para acumular las
// estadísticas PERMANENTES por luchador en UI.endBattle (ver
// entry.stats/newFighterStats en state.js).
function battleUnitRec(view, unit) {
  return view.battleStats.byUnit[unit.id] || (view.battleStats.byUnit[unit.id] = {
    sourceUid: unit.sourceUid || null, name: unit.name, dmg: 0, dmgReceived: 0, healDone: 0, kills: 0, highestHit: 0,
  });
}

UI.applyBattleEvent = function (view, ev) {
  const u = ev.unitId ? view.unitById[ev.unitId] : null;
  const attacker = ev.attackerId ? view.unitById[ev.attackerId] : null;
  const target = ev.targetId ? view.unitById[ev.targetId] : null;
  switch (ev.type) {
    case 'ult':
      u.ultCharge = 0;
      UI.updateUnitCardCharge(u);
      UI.logLine(`💥 ¡${u.name} desata su ULTI: ${ev.skillName}!`);
      break;
    case 'charge':
      if (u) { u.ultCharge = ev.value; UI.updateUnitCardCharge(u); }
      break;
    case 'enrage':
      triggerBattleAnim(u.id, 'hit-shake', 400);
      UI.logLine(`🔥 ¡${u.name} entra en FURIA! (+25% ataque y sabiduría)`);
      break;
    case 'bossattack':
      UI.logLine(`💢 ¡${u.name} prepara un Golpe Devastador!`);
      break;
    case 'attack':
      triggerBattleAnim(attacker.id, attacker.side === 'player' ? 'lunge-up' : 'lunge-down', 300);
      target.hp = Math.max(0, target.hp - ev.amount);
      UI.updateUnitCardHp(target);
      triggerBattleAnim(target.id, 'hit-shake', 300);
      UI.spawnBattleFloat(target.id, '-' + ev.amount + (ev.isCrit ? '!' : ''), ev.isCrit);
      UI.logLine(`${attacker.name} → ${target.name}: -${ev.amount}${ev.isCrit ? ' ¡CRÍTICO!' : ''}`);
      if (attacker.side === 'player') {
        view.battleStats.dmgDealt += ev.amount;
        if (ev.amount > view.battleStats.maxHit) view.battleStats.maxHit = ev.amount;
        const rec = battleUnitRec(view, attacker);
        rec.dmg += ev.amount;
        if (ev.amount > rec.highestHit) rec.highestHit = ev.amount;
      } else {
        view.battleStats.dmgReceived += ev.amount;
        if (target.side === 'player') battleUnitRec(view, target).dmgReceived += ev.amount;
      }
      break;
    case 'heal':
      target.hp = Math.min(target.maxHp, target.hp + ev.amount);
      UI.updateUnitCardHp(target);
      triggerBattleAnim(target.id, 'heal-glow', 500);
      UI.spawnBattleFloat(target.id, '+' + ev.amount, false);
      if (u && u.side === 'player') {
        view.battleStats.healDone += ev.amount;
        battleUnitRec(view, u).healDone += ev.amount;
      }
      break;
    case 'faint':
      if (u) { u.alive = false; UI.updateUnitCardHp(u); }
      UI.logLine(`💀 ${u ? u.name : ''} ha caído.`);
      if (ev.side === 'enemy' && ev.killerId && view.battleStats.byUnit[ev.killerId]) view.battleStats.byUnit[ev.killerId].kills++;
      break;
    case 'stunattempt':
      UI.logLine(ev.success ? `⚡ ${target.name} queda aturdido.` : `${target.name} resiste el aturdimiento.`);
      break;
    case 'stunned':
      UI.logLine(`😵 ${u.name} está aturdido y no puede actuar.`);
      break;
    case 'dot':
      u.hp = Math.max(0, u.hp - ev.amount);
      UI.updateUnitCardHp(u);
      triggerBattleAnim(u.id, 'hit-shake', 300);
      UI.spawnBattleFloat(u.id, '-' + ev.amount, false);
      UI.logLine(`🧪 ${u.name} sufre ${ev.amount} de daño por ${ev.label}.`);
      break;
    case 'cleanse':
      UI.logLine(`✨ ${u.name} se purifica de todos sus efectos negativos.`);
      break;
    case 'revive':
      target.alive = true;
      target.hp = ev.amount;
      UI.updateUnitCardHp(target);
      triggerBattleAnim(target.id, 'heal-glow', 500);
      UI.spawnBattleFloat(target.id, '+' + ev.amount, false);
      UI.logLine(`🌟 ${u.name} revive a ${target.name}!`);
      break;
    case 'buff':
    case 'debuff':
    case 'round_end':
      break;
  }
};

UI.spawnBattleFloat = function (unitId, text, crit) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${unitId}"]`);
  if (!cardEl) return;
  const fl = el('div', 'battle-float' + (crit ? ' crit' : ''), text);
  cardEl.appendChild(fl);
  setTimeout(() => fl.remove(), 800);
};

// Reinicia y vuelve a lanzar una animación CSS de un solo disparo sobre la
// tarjeta de un luchador (forzando reflow con offsetWidth) para que se
// repita aunque el mismo golpe le vuelva a tocar antes de que termine la
// anterior; la quita sola pasado `duration` para no dejar clases colgadas.
function triggerBattleAnim(unitId, className, duration) {
  const cardEl = document.querySelector(`.battle-unit[data-unit-id="${unitId}"]`);
  if (!cardEl) return;
  cardEl.classList.remove(className);
  void cardEl.offsetWidth;
  cardEl.classList.add(className);
  setTimeout(() => cardEl.classList.remove(className), duration);
}

// Resumen post-combate (daño hecho/recibido, curación, MVP) — acumulado en
// view.battleStats por UI.applyBattleEvent a lo largo de TODOS los choques
// de este combate (puede haber varias líneas/oleadas antes de llegar aquí).
// Se muestra en la pantalla de resultado pase lo que pase (encuentro
// intermedio, victoria o derrota), no solo al ganar del todo.
function battleStatsSummaryHtml(view) {
  const stats = view.battleStats;
  if (!stats || (stats.dmgDealt === 0 && stats.dmgReceived === 0 && stats.healDone === 0)) return '';
  let mvpHtml = '';
  const entries = Object.values(stats.byUnit);
  if (entries.length) {
    const mvp = entries.reduce((best, r) => (r.dmg + r.kills * 50) > (best.dmg + best.kills * 50) ? r : best);
    mvpHtml = `<div class="stat-row"><span>⭐ MVP</span><span>${mvp.name} (${mvp.dmg} daño${mvp.kills ? ', ' + mvp.kills + ' baja' + (mvp.kills > 1 ? 's' : '') : ''})</span></div>`;
  }
  return `<div class="panel battle-stats-panel"><h3>📊 Resumen del combate</h3>
    <div class="stat-row"><span>⚔️ Daño hecho</span><span>${stats.dmgDealt}</span></div>
    <div class="stat-row"><span>🛡️ Daño recibido</span><span>${stats.dmgReceived}</span></div>
    ${stats.healDone ? `<div class="stat-row"><span>💚 Curación</span><span>${stats.healDone}</span></div>` : ''}
    ${mvpHtml}
  </div>`;
}

UI.endBattle = function (view, result) {
  const outcome = view.opts.onEnd(result, view);
  // Estadísticas históricas de toda la partida: se acumulan aquí, el único
  // punto por el que pasa el cierre de CUALQUIER combate (etapa, Torre,
  // Mazmorra Elemental, Arena, Prueba del Campeón, Duelo por apuesta), así
  // que cuentan de verdad todo lo jugado sin tener que repetir esta lógica
  // en cada modo por separado.
  const st = view.state.stats;
  if (result === 'victoria') st.battlesWon++; else st.battlesLost++;
  st.totalDmgDealt += view.battleStats.dmgDealt;
  st.totalDmgReceived += view.battleStats.dmgReceived;
  st.totalHealDone += view.battleStats.healDone;
  if (view.battleStats.maxHit > st.highestSingleHit) st.highestSingleHit = view.battleStats.maxHit;
  // Estadísticas POR LUCHADOR (entry.stats, ver newFighterStats en
  // state.js) — "combates" cuenta a todo el que estuviera en la Formación
  // cuando empezó ESTE combate (aunque no le tocara actuar en ningún
  // choque); el resto de campos solo a quien de verdad hizo algo
  // (view.battleStats.byUnit, con sourceUid añadido en battleUnitRec).
  const participantUids = new Set(view.playerGroups.flatMap(g => g.row.map(u => u.sourceUid).filter(Boolean)));
  participantUids.forEach(uid => {
    const entry = rosterEntry(view.state, uid);
    if (entry) { if (!entry.stats) entry.stats = newFighterStats(); entry.stats.battles++; }
  });
  Object.values(view.battleStats.byUnit).forEach(rec => {
    if (!rec.sourceUid) return;
    const entry = rosterEntry(view.state, rec.sourceUid);
    if (!entry) return;
    if (!entry.stats) entry.stats = newFighterStats();
    entry.stats.dmgDealt += rec.dmg;
    entry.stats.dmgReceived += rec.dmgReceived;
    entry.stats.healDone += rec.healDone;
    entry.stats.kills += rec.kills;
    if (rec.highestHit > entry.stats.highestHit) entry.stats.highestHit = rec.highestHit;
  });
  if (outcome) {
    if (outcome.rewards) {
      st.totalTexelEarned += outcome.rewards.texel || 0;
      st.totalFighterXpEarned += outcome.rewards.fighterXp || 0;
    }
    if (outcome.wagerWon !== undefined) st.totalTexelEarned += outcome.wagerWon;
  }
  saveGame(view.state);
  const body = $('battleResultBody');
  let html;
  if (outcome && outcome.championContinue) {
    html = `<h3>🏆 ¡Duelo ganado!</h3><p class="settings-info">Duelo ${outcome.duelsWon} superado — sigues sin curarte al siguiente.</p>`;
    if (outcome.rewards) {
      html += `<div class="stat-row"><span>🪙 Texel</span><span>+${outcome.rewards.texel}</span></div>
        <div class="stat-row"><span>⭐ XP</span><span>+${outcome.rewards.fighterXp}</span></div>`;
    }
  } else if (outcome && outcome.championDefeat) {
    html = `<h3>💀 Fin de la Prueba</h3><p class="settings-info">Caíste en el duelo ${outcome.duelsWon + 1}, tras ganar ${outcome.duelsWon}. Mejor racha: ${view.state.champion.bestStreak}.</p>`;
  } else if (outcome && outcome.roguelikeContinue) {
    html = `<h3>🌀 ¡Ronda ${outcome.roundsCleared} superada!</h3><p class="settings-info">Sigues sin curarte a la siguiente ronda. Elige un bono al continuar.</p>`;
    if (outcome.rewards) {
      html += `<div class="stat-row"><span>🪙 Texel</span><span>+${outcome.rewards.texel}</span></div>
        <div class="stat-row"><span>⭐ XP</span><span>+${outcome.rewards.fighterXp}</span></div>`;
    }
    if (outcome.leveled && outcome.leveled.length) html += `<p class="settings-info">¡Subieron de nivel!: ${outcome.leveled.join(', ')}</p>`;
  } else if (outcome && outcome.roguelikeDefeat) {
    html = `<h3>💀 Fin de la run</h3><p class="settings-info">Caíste en la ronda ${outcome.roundsCleared + 1}, tras superar ${outcome.roundsCleared}. Mejor ronda: ${outcome.bestRound}.</p>`;
  } else if (outcome && outcome.wagerWon !== undefined) {
    html = `<h3>🏆 ¡Apuesta ganada!</h3><div class="stat-row"><span>🪙 Texel</span><span>+${outcome.wagerWon}</span></div>`;
  } else if (outcome && outcome.wagerLost !== undefined) {
    html = `<h3>💀 Apuesta perdida</h3><p class="settings-info">Perdiste los ${outcome.wagerLost} 🪙 Texel apostados.</p>`;
  } else if (outcome && outcome.intermediate) {
    html = `<h3>✅ Encuentro superado</h3><p class="settings-info">Continúa por el resto de la etapa.</p>`;
  } else if (result === 'victoria') {
    html = outcome && outcome.championBeaten ? `<h3>👑 ¡Campeón de ${outcome.championBeaten} derrotado!</h3>` : `<h3>🏆 ¡Victoria!</h3>`;
    if (outcome && outcome.rewards) {
      html += `<div class="stat-row"><span>🪙 Texel</span><span>+${outcome.rewards.texel}</span></div>`;
      if (outcome.rewards.fighterXp) html += `<div class="stat-row"><span>⭐ XP por luchador</span><span>+${outcome.rewards.fighterXp}</span></div>`;
      if (outcome.gemas) html += `<div class="stat-row"><span>💎 Gemas</span><span>+${outcome.gemas}</span></div>`;
      if (outcome.rewards.drops) {
        // Los cristales de invocación (pixite/voxite/doxite) ya se sumaban a
        // state.currencies al ganar, pero nunca se mostraban aquí — el
        // jugador los veía subir en la topbar sin saber de dónde salían.
        ['pixite', 'voxite', 'doxite'].forEach(type => {
          const amount = outcome.rewards.drops[type];
          if (amount) html += `<div class="stat-row"><span>${CRYSTALS[type].icon} ${CRYSTALS[type].label}</span><span>+${amount}</span></div>`;
        });
        if (outcome.rewards.drops.gear) html += `<div class="stat-row"><span>🎁 Objeto</span><span>${gearTypeInfo(outcome.rewards.drops.gear).names[outcome.rewards.drops.gear.rarity]}</span></div>`;
      }
    }
    if (outcome && outcome.leveled && outcome.leveled.length) html += `<p class="settings-info">¡Subieron de nivel!: ${outcome.leveled.join(', ')}</p>`;
    if (outcome && outcome.zoneGemsBonus) html += `<div class="stat-row"><span>🎉 Zona completada</span><span>+${outcome.zoneGemsBonus} 💎</span></div>`;
    if (outcome && outcome.unlockedZone) html += `<p class="settings-info">🗺️ ¡Nueva zona desbloqueada: ${outcome.unlockedZone.name}!</p>`;
    if (outcome && outcome.capturedCopy) html += `<div class="stat-row"><span>${outcome.capturedIsNew ? '🆕' : '🔁'} ${outcome.capturedCopy.name}</span><span>+1 copia</span></div>`;
  } else {
    html = `<h3>💀 Derrota</h3><p class="settings-info">Tu banda ha caído. Mejora tu equipo y vuelve a intentarlo.</p>`;
  }
  html += battleStatsSummaryHtml(view);
  body.innerHTML = html;
  $('battleResult').classList.remove('hidden');
};

// ---------- Toasts / offline ----------
UI.showToast = function (text) {
  const container = $('toastContainer');
  const t = el('div', 'toast-item', text);
  container.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800);
};

UI.showOfflineModal = function (energyGained) {
  $('offlineBody').innerHTML = `<div class="stat-row"><span>⚡ Energía recuperada</span><span>+${energyGained}</span></div>`;
  $('offlineModal').classList.remove('hidden');
};

// ---------- Exportar/Importar partida ----------
UI.openExportSave = function (state) {
  // Se abre desde dentro de Ajustes: sin ocultarlo primero, settingsModal
  // (más tarde en el DOM, mismo z-index que cualquier .modal) se queda
  // apilado ENCIMA de este modal y lo tapa entero — el botón "Exportar"
  // parecía no hacer nada porque el modal real quedaba invisible detrás.
  $('settingsModal').classList.add('hidden');
  const code = exportSaveCode(state);
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>📤 Exportar partida</h3>
    <p class="settings-info">Descarga el archivo o copia el código y guárdalo en un sitio seguro — sirve
    para restaurar tu partida en este dispositivo o pasarla a otro, desde "📥 Importar partida".</p>`;
  const textarea = document.createElement('textarea');
  textarea.className = 'save-code-box';
  textarea.readOnly = true;
  textarea.value = code;
  body.appendChild(textarea);
  const actions = el('div', 'modal-actions');
  const downloadBtn = el('button', 'primary-btn', '💾 Descargar archivo');
  downloadBtn.addEventListener('click', () => {
    // Blob + <a download> temporal: no requiere backend, funciona igual en
    // móvil (descarga a "Archivos"/Descargas) y escritorio.
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `defensor-de-texel-partida-${stamp}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    UI.showToast('💾 Archivo descargado');
  });
  actions.appendChild(downloadBtn);
  const copyBtn = el('button', 'primary-btn', '📋 Copiar al portapapeles');
  copyBtn.addEventListener('click', () => {
    textarea.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => UI.showToast('📋 Código copiado'))
        .catch(() => UI.showToast('No se pudo copiar solo — el código ya está seleccionado, cópialo a mano'));
    } else {
      UI.showToast('El código ya está seleccionado, cópialo a mano');
    }
  });
  actions.appendChild(copyBtn);
  body.appendChild(actions);
  $('pickerModal').classList.remove('hidden');
};

UI.openImportSave = function () {
  // Mismo motivo que en UI.openExportSave: sin esto, Ajustes se queda
  // tapando este modal por encima.
  $('settingsModal').classList.add('hidden');
  const body = $('pickerModalBody');
  body.innerHTML = `<h3>📥 Importar partida</h3>
    <p class="settings-info">Sube el archivo descargado al exportar, o pega aquí el código a mano.
    <b>Sustituirá tu partida actual y no se puede deshacer</b> — expórtala primero si quieres
    conservarla por si acaso.</p>`;
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,text/plain';
  fileInput.className = 'save-code-file';
  body.appendChild(fileInput);
  const textarea = document.createElement('textarea');
  textarea.className = 'save-code-box';
  textarea.placeholder = 'Pega aquí el código de la partida...';
  body.appendChild(textarea);
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { textarea.value = String(reader.result || '').trim(); };
    reader.readAsText(file);
  });
  const importBtn = el('button', 'danger-btn', '📥 Importar y sustituir partida');
  importBtn.addEventListener('click', () => {
    let imported;
    try {
      imported = importSaveCode(textarea.value);
    } catch (e) {
      UI.showToast('⚠️ Código no válido o corrupto');
      return;
    }
    if (!confirm('¿Seguro? Se sustituirá tu partida actual por la importada — no se puede deshacer.')) return;
    // Mismo freno que Reiniciar partida (ver main.js): sin él, el
    // autoguardado disparado por el propio reload reescribía la partida
    // vieja encima de la recién importada antes de que cargara la página nueva.
    UI.suppressAutosave = true;
    saveGame(imported);
    location.reload();
  });
  body.appendChild(importBtn);
  $('pickerModal').classList.remove('hidden');
};
