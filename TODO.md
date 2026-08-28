# TODO — Defensor de Texel

Lista de trabajo para ir acercando el juego a D.o.T. real, organizada por
iteraciones. Se marca `[x]` lo terminado y `[ ]` lo pendiente. Cuando un punto
necesita algo del usuario (imagen de referencia, sprite, decisión de diseño)
se indica explícitamente.

## Hecho

- [x] Ordenar la Colección en Banda (más reciente, nombre, familia, elemento,
      tier, más copias/SEF)
- [x] Icono de tier reconocible en tarjetas de criatura y de objeto (además
      del borde de color)
- [x] Arreglar el "bug" de las imágenes lentas al elegir personajes para la
      Formación — carga progresiva/diferida en vez de dibujar todo de golpe
- [x] Fusión manual: al llegar a SEF 5/5 ya NO evoluciona sola; aparece un
      botón "Evolucionar" con una animación de transformación
- [x] Destacar en otro color las estadísticas mejoradas por equipo (arma/armadura)
- [x] Insignia "¡Nuevo!" en luchadores recién obtenidos hasta que se ven una vez
- [x] Animación en la invocación x10 (actualmente solo se ve en x1)
- [x] **Combate**: elegir criaturas en cualquier dirección de la Formación 3×3
      (fila, columna o diagonal) como combinación — ya NO se preseleccionan en
      Banda: cada choque se puede elegir cualquiera de las 8 líneas posibles
      que sigan vivas (como en el D.o.T. real, "swipe to choose 1 line"). Un
      mismo luchador que pertenece a varias líneas a la vez (p.ej. el del
      centro) comparte el mismo HP/carga de ulti entre todas ellas, no se
      duplica ni se resetea al cambiar de línea
- [x] **Combate**: ya no es "atacar en bucle hasta que alguien gana". Se elige
      una combinación, cada luchador vivo de ambos bandos actúa UNA vez (una
      ronda) y ahí termina el choque; si el enemigo sigue en pie esa
      combinación se marca gastada y toca elegir otra; cuando las combinaciones
      vivas ya se usaron todas contra la fila activa, se reinicia el ciclo
      ("se vuelve a elegir"); al caer la fila enemiga, las combinaciones vuelven
      a estar disponibles para la siguiente oleada
- [x] Indicador de ulti más claro: número de turnos estimados junto a la barra
      (o "¡LISTA!" cuando ya se puede desatar)
- [x] **Mapa**: cada etapa ya no es un único combate — se abre un "recorrido"
      con un nodo (⚔️) por cada oleada de enemigos y un nodo final de
      recompensa (🎁); se lucha nodo a nodo, con una pantalla de progreso
      entre combates, y solo se cobra la recompensa de la etapa al superar
      el último nodo. Cada etapa tiene siempre 2-3 nodos de combate como
      mínimo (antes algunas etapas tempranas eran un solo combate)
- [x] **Tienda**: pestaña nueva "🛒 Tienda" con equipo nuevo (arma/armadura al
      azar por rareza, pagado en Texel) y objetos curativos/revividores
      (Poción Menor, Poción Mayor en Texel; Pluma Fénix en Gemas). Para que
      curar/revivir tenga sentido dentro de un recorrido con varios combates,
      la vida y los desmayos de la banda ahora persisten ENTRE nodos de una
      misma etapa (`run.hpMap`/`run.faintedSet`, antes cada nodo curaba sola
      a la banda al completo); la pantalla de recorrido muestra la vida/estado
      de cada luchador y botones para usar objetos entre combates
- [x] La Colección también se puede ordenar al elegir personajes para un
      hueco de la Formación (mismo selector de orden reutilizado en el picker
      de hueco vacío y en el panel de "sustituir" de la ficha)
- [x] Fusión manual de verdad: cada copia invocada se guarda por separado en
      el roster con su propio SEF 0/5 (ya no se fusiona sola al invocar un
      duplicado); desde la ficha del luchador se eligen a mano qué copias
      sueltas usar como material de fusión hasta llegar a 5/5. La insignia
      "¡Nuevo!" ahora solo aparece en la primera copia de cada defId, no en
      cada duplicado
- [x] La animación de evolución ahora sale a pantalla completa (mismo overlay
      que al abrir invocaciones), con la forma antigua y la nueva una al lado
      de la otra, en vez del pequeño destello sobre la ficha
- [x] Invocación x10 rehecha: carrusel de una criatura a la vez (con avance
      automático, al tocar, o botón "Saltar »" al resumen final) en vez de la
      rejilla estática que aparecía toda de golpe
- [x] Clicar un hueco YA OCUPADO de la Formación abre la ficha normal del
      luchador (con stats, historia, etc.) con un panel añadido para quitarlo
      de la formación o sustituirlo por otro, en vez del selector aparte de antes
- [x] Cada personaje ya existente tiene una frase de historia/lore (panel
      "📜 Historia" en su ficha)
- [x] **Mapa**: la etapa de jefe de zona ahora es un combate ÚNICO, solo
      contra el jefe (antes tenía 2 oleadas de relleno antes del jefe). Las
      etapas normales siempre presentan 3 rivales por oleada (antes podían
      ser 1 o 2 según lo avanzada que estuviera la etapa)
- [x] **Combate — rebalanceo**: el jefe de zona ya no combina "+3 niveles" y
      "×1.7 a todas las stats" (ese doble escalado hacía que un solo Épico
      pudiera ganarle a una banda entera de Legendarios — se comprobó con 200
      combates simulados y perdía casi la mitad). Ahora el jefe usa las stats
      normales de su nivel y rareza SIN ningún extra de ataque/agilidad/
      defensa (pelea en solitario contra hasta 3 atacantes por ronda, así que
      cualquier bonus ahí lo desequilibra) y solo tiene más HP (×2.4) para que
      el combate dure varias rondas en vez de un solo golpe. Con esto, 200
      combates simulados de una banda legendaria contra el jefe de una zona
      intermedia dieron 200/200 victorias, en ~10 rondas de media
- [x] La vida y la carga de ULTI ahora se mantienen durante TODA la etapa
      (no solo dentro de un mismo nodo del recorrido) — llegar a un encuentro
      con la ulti ya cargada de un combate anterior es posible
- [x] **Roster masivo (14.1/14.2/14.3)**: creados los 89 personajes, 33
      enemigos/mobs (cada uno con sus 3 formas, 366 fichas nuevas en total) y
      27 jefes (forma única cada uno, en una lista `BOSSES` aparte para que
      NO salgan en la invocación ni en la Arena) que pedía la lista original.
      Todos con elemento/clase/habilidad/rareza asignados y su propia frase
      de historia, con sprite procedural de respaldo hasta que haya arte
      real — ver la lista de nombres de archivo exactos que hacen falta más
      abajo ("Sprites de personajes/mobs/jefes pendientes")
- [x] **Habilidad de líder de banda**: los 30 luchadores Legendarios llevan
      una habilidad pasiva de líder (repartida por clase/tema: +15% ataque,
      defensa, vida, agilidad o sabiduría a TODA la banda) que solo está
      activa mientras ese luchador ocupe la celda central [1][1] de la
      Formación — verificado que el bonus se aplica a otros luchadores de la
      banda, no solo al que lidera. La Banda muestra una corona en el hueco
      central y una barra con el líder activo (o un aviso si no hay
      ninguno); la ficha del luchador muestra su habilidad de líder si la tiene
- [x] **Homúnculos**: nueva "criatura" que nunca lucha (no entra en el
      roster ni en la Formación) y solo sirve para fusionarse con cualquier
      luchador jugable y darle experiencia directamente. 3 tiers (Menor/
      Mediano/Mayor, +80/+260/+700 XP) — pueden "tocar" al invocar con
      cualquier cristal (~12% de las invocaciones, con el tier decidido por
      la misma tirada de rareza que ya se hacía, así que un cristal con más
      rarezas altas también da homúnculos de mejor tier de media). Se
      fusionan desde la ficha del luchador, con botones que muestran cuántos
      tienes de cada tier
- [x] **Tipos/tribus y estadísticas individualizadas**, usando por fin la
      imagen de referencia (`reference/dot-original/tribu-tipo-ayuda.jpg`,
      Champ/Guru/Rogue/Scout/Warlock). El sistema de 5 elementos con ventajas
      en círculo (Fuego→Viento→Tierra→Rayo→Agua→Fuego) YA era el mismo
      concepto que los "signos" de la imagen, así que no hacía falta tocarlo.
      Lo nuevo:
  - Cada una de las 5 clases (Campeón≈Champ, Gurú≈Guru, Pícaro≈Rogue,
    Explorador≈Scout, Brujo≈Warlock) tiene ahora una vulnerabilidad de tipo:
    Campeón +25% daño mágico recibido, Gurú +25% daño físico recibido,
    Pícaro +12% a cualquier ataque, Explorador sin vulnerabilidad (equilibrado),
    Brujo +10% a ambos (cruce entre Campeón y Gurú). "Mágico" = ataques que
    usan Sabiduría (por ahora, las ultis de fila tipo Arrasar); el resto
    cuenta como físico. Verificado con daño sintético que cada vulnerabilidad
    da exactamente el multiplicador esperado (×1.25, ×1.12, ×1.10, etc.)
  - Ya NO todas las familias de una misma clase tienen las mismas stats:
    cada familia tiene una variación determinista de hasta ±12% por
    estadística (siempre la misma para esa familia, no cambia entre
    partidas ni hace falta rellenarla a mano para cada una de las +130
    familias). Se aplica igual a jugador, enemigos y jefes
  - La ficha del luchador muestra su vulnerabilidad de tipo junto a
    clase/elemento. Se revalidó que una banda legendaria sigue ganando
    200/200 combates simulados contra un jefe de zona intermedio con este
    sistema activo (el rebalanceo del punto anterior sigue funcionando)
- [x] **Ampliar mapas/zonas**: 27 zonas nuevas (de 6 a 33 en total), cada una
      con 2 personajes/mobs del roster masivo (14.1/14.3) de relleno y uno de
      los 27 jefes (14.2, creados en la iteración anterior pero sin usar
      todavía en ningún mapa) como jefe único de su etapa 8. La rareza del
      relleno sube por tramos según la zona está más avanzada (Raro → Épico
      → Épico/Legendario) para acompañar el escalado por nivel, igual que ya
      hacían las 6 zonas originales — no hizo falta tocar el motor de
      combate ni el de mapa, los jefes nuevos encajan directamente como
      `pool[2]` de una zona (fighterDef ya los reconocía desde que se
      crearon). Probado de extremo a extremo: las 33 zonas se listan y
      desbloquean en cadena correctamente, un recorrido normal y una pelea
      de jefe de una zona nueva se juegan bien por la UI real, y una banda
      legendaria a nivel apropiado gana 100/100 combates simulados contra
      Loki (el jefe de la última zona, nivel 264)
- [x] **Lote de 7 correcciones/ampliaciones pedidas de golpe**:
  - [x] Bug visual: al invocar x10, la pantalla-resumen final se quedaba con
        la rejilla vacía (las imágenes no se veían aunque el sorteo era
        correcto). Causa real: el `@keyframes revealPop` nunca fijaba
        `opacity` en su 100%, así que `animation-fill-mode: forwards`
        bloqueaba para siempre el `opacity: 0` estático declarado junto a la
        animación. Corregido añadiendo `opacity: 1` al 100% del keyframe;
        verificado con `getComputedStyle` antes/después y con captura visual
  - [x] Combate — ver estadísticas: las cartas de luchador de la banda en
        combate ahora son pulsables y abren una ficha modal con
        HP/ataque/defensa/agilidad/sabiduría y la ulti (nombre, descripción,
        barra de carga y turnos restantes), reutilizando el modal de picker
        ya existente (subido su z-index por encima del overlay de combate
        para que se vea bien al abrirse en mitad de una pelea)
  - [x] Equipo — de 2 a 6 huecos: arma, armadura, casco, guantes, botas y
        amuleto, cada uno con una estadística principal y una secundaria más
        floja propias (antes solo existían arma/armadura). Refactor de
        `entry.gearArma/gearArmadura` (campos planos) a `entry.gear{}`
        (objeto genérico por slot), con migración automática y retrocompatible
        de partidas guardadas antiguas. Las recompensas y la tienda ahora
        sueltan pieza de un slot aleatorio entre los 6, no solo arma/armadura
  - [x] Jefes de mapa balanceados por zona (confirmado el problema y
        corregido): se comprobó que casi todos los jefes tenían rareza fija
        Épica o Legendaria (por un `rarity || 'legendario'` por defecto en
        `addBoss` que casi nadie sobreescribía), sin relación con lo
        avanzada que estuviera su zona — un jefe Legendario/Épico contra un
        equipo recién empezado (rareza Común/Infrecuente) perdía por goleada
        pase lo que pase. Simulación con banda completa de 9 luchadores y
        ciclado real de combos (como se juega de verdad) confirmó el
        problema: 0 victorias de 60 en 4 de las 5 zonas probadas antes de la
        corrección. Se reasignó la rareza de los 33 jefes para que coincida
        con la de los enemigos normales de su propia zona (progresión
        Común→Infrecuente→Raro→Épico, igual que ya subía el relleno). Tras
        el cambio, una banda completa a nivel y rareza apropiados para cada
        una de las 33 zonas gana 20/20 combates contra su propio jefe, en
        7-23 rondas de media (varios ciclos de refuerzos, no un solo golpe)
  - [x] Enemigos y jefes de mapa son ahora contenido dedicado, no jugable:
        nueva lista `MOBS` (99 entradas, mismo sistema de 3 tiers que los
        personajes jugables) para el relleno de las 33 zonas, separada de
        `FIGHTERS` (jugables/invocables). Auditado con script: 0 zonas
        referencian ya ninguna criatura jugable, ni de relleno ni de jefe
  - [x] Anotado en este TODO (este mismo punto)
- [x] **Bug: tope de 60 en la Colección** — reportado por el usuario ("canjeo
      cajas y no me suma personajes"). Confirmado: `MAX_ROSTER = 60` bloqueaba
      invocaciones nuevas por completo una vez lleno (se convertían en 50
      Texel en silencio, con un aviso fácil de no ver en el resumen).
      Eliminado el tope — con 312+ FIGHTERS invocables no tenía sentido
      seguir capado a 60. Probado con 80 invocaciones extra seguidas: se
      añaden todas, 0 conversiones forzadas
- [x] **Bug: duplicados en forma máxima se autoconvertían en Texel** — el
      mensaje "Forma máxima: los duplicados se convierten en Texel
      automáticamente" era real y estaba mal: esos duplicados son
      precisamente el material de la Superfusión. Ahora se quedan en la
      Colección como copias sueltas, igual que cualquier otro duplicado
- [x] **Bug: la Superfusión era inalcanzable** — `fuseMaterials` exigía que
      el objetivo tuviera `evolvesTo` para aceptar material, así que un
      luchador en forma máxima nunca podía subir su SEF a 5/5 (requisito
      para poder sacrificarlo en `superFuse`). Corregido: un luchador sin
      evolución ya puede rellenar su SEF con copias sueltas (no evoluciona a
      nada, pero llegar a 5/5 lo deja listo como sacrificio). Probado de
      extremo a extremo: rellenar SEF de un duplicado en forma máxima →
      sacrificarlo → el objetivo gana su ⭐. La ficha del luchador explica
      ahora esto en vez de anunciar que se destruye solo
- [x] **Cómo funciona la Superfusión** (respondiendo a la pregunta del
      usuario): un luchador con SEF 5/5 (relleno con copias sueltas propias,
      tenga o no evolución pendiente) se puede sacrificar desde la ficha de
      OTRO luchador que esté en forma máxima, dándole una ⭐ permanente
      (hasta 3). Es el único uso de un duplicado ya maximado, aparte de
      guardarlo sin más — todavía no hay forma de venderlo manualmente por
      Texel (ver pendiente más abajo)
- [x] **Bug: el distintivo "¡Nuevo!" se basaba en si tenías una copia AHORA
      MISMO**, no en si lo habías conseguido alguna vez — si vendías o
      evolucionabas todas las copias de un luchador, la siguiente que
      cayera volvía a marcarse "¡Nuevo!". Añadido `state.discoveredDefIds`,
      un registro permanente de todo lo obtenido alguna vez (con migración
      para partidas guardadas antiguas, reconstruido a partir del roster
      actual). Sienta además la base para la futura Pokédex (ver pendiente)
- [x] **Bug: los PNG rotos se quedaban invisibles para siempre** — `creatureCanvas`
      no tenía manejo de `error` en el `<img>`, así que un fallo de red al
      cargar el sprite dejaba el hueco vacío (opacity:0) sin más. Ahora, si
      falla la carga, se sustituye automáticamente por el sprite procedural
      de siempre en vez de quedarse en blanco
- [x] **Bug: en el resumen de invocación x10, las criaturas a veces tapaban
      el botón "Continuar"** — `.item-cell` no recortaba su contenido, así
      que una imagen PNG real con proporciones más altas que las del sprite
      procedural (habitual ahora que se están añadiendo sprites reales) se
      salía del cuadro cuadrado y se superponía a lo de abajo. Añadido
      `overflow: hidden` a `.item-cell`
- [x] **Colección — orden por familia**: dentro de cada familia ahora
      ordena por tier ascendente (Común/Raro/Infrecuente primero, según el
      tramo de la familia) en vez de por nivel
- [x] **Nueva criatura jugable: tortuguahumanoide** (Tortuga Guerrera
      Novata → Veterana → Maestra del Caparazón Eterno, Agua/Campeón, tier 1)
- [x] **Boss Medusa**: ya existía desde la ampliación de mapas de esta
      sesión (`boss_medusa`, jefe de la zona Jardín de Piedra) — confirmado
      al usuario, no hacía falta crearlo de nuevo

## Pendiente — de la ronda de 14 preguntas/peticiones del usuario (26/08)

Puntos de la última tanda que son diseño/contenido grande y no se han
abordado todavía (o solo se ha dado una respuesta directa sin implementar):

- [x] **Más variedad de equipo por slot**: cada uno de los 6 huecos
      (arma/armadura/casco/guantes/botas/amuleto) ahora tiene 3 TIPOS
      distintos en vez de uno genérico, cada uno con su propio reparto de
      estadística principal/secundaria (no solo escala por rareza) y su
      propia progresión de 5 nombres:
      - Arma: Espada (atk/wis, equilibrada), Hacha (atk/hp, golpe pesado),
        Lanza (atk/agi, más ágil pero pega menos fuerte)
      - Armadura: Cota (def/hp, la de siempre), Placas Pesadas (def/atk,
        tanque puro), Túnica (def/wis, armadura de mago)
      - Casco: Yelmo (def/wis, la de siempre), Capucha (def/agi, pícaro),
        Diadema (wis/def, prioriza sabiduría)
      - Guantes: Guantes (atk/agi, los de siempre), Garras (atk/agi más
        agresivas), Manoplas (atk/hp, golpe pesado)
      - Botas: Botas (agi/hp, las de siempre), Sandalias Aladas (agi/wis,
        muy rápidas), Grebas (agi/def, más lentas pero resistentes)
      - Amuleto: Amuleto (wis/atk, el de siempre), Anillo (wis/agi),
        Reliquia (wis/hp)
      El primer tipo de cada hueco reutiliza exactamente el reparto de
      stats/nombres que tenía el hueco antes de esta actualización, así que
      el equipo ya poseído (sin campo `type`) no cambia sus números — cae
      en ese tipo por `gearTypeInfo()`, sin necesidad de migración de
      guardado. La tienda y las recompensas de combate ahora dan un tipo al
      azar dentro del slot/rareza elegidos; la ficha de objeto, el selector
      de equipar y el inventario muestran el nombre/icono/stats del tipo
      concreto. Verificado con un script headless: compra en la Tienda,
      inventario, ficha de objeto y selector de equipar muestran tipos
      distintos (espada/lanza) correctamente, sin errores de consola
- [x] **Más tipos de ulti**: 4 tipos nuevos añadidos a los 8 que ya había
      (daño, daño en fila, curar, curar en fila, buff propio, buff en fila,
      debuff, aturdir):
      - `dot` (veneno/quemadura): golpe flojo + daño por turno 3 turnos que
        ignora defensa. Nueva skill `veneno` ("Mordisco Venenoso") →
        `escorpionhumanoide` (encaja con su lore, ya mencionaba veneno)
      - `drain` (vampírico): golpe fuerte que cura al atacante el 50% del
        daño hecho. Nueva skill `drenar` ("Golpe Vampírico") → `dracula`
      - `cleanse` (purificar): limpia debuffs/veneno/aturdimiento de toda su
        fila propia. Nueva skill `purificar` ("Aura Purificadora") →
        `unicornio` (su lore ya mencionaba purificar venenos)
      - `revive` (revivir): resucita a un aliado caído de su fila al 40% de
        su HP máximo. Nueva skill `revivir` ("Milagro de Vida") → `osiris`
        (su lore ya lo llamaba "Señor de la Resurrección")
      Implementado en `combat.js` (`tickTimers` procesa `unit.dots`, 4 casos
      nuevos en `performTurn`), `SKILL_TYPES` en `data.js`, y 3 casos nuevos
      en `UI.applyBattleEvent` (`dot`/`cleanse`/`revive`). Validado con
      pruebas headless aisladas de cada tipo + batalla real en vivo con las
      4 familias reasignadas + suite de regresión completa
- [x] **Pokédex**: nuevo botón "📖 Pokédex" junto al título de la Colección
      (pantalla Banda), abre un modal con las 315 formas jugables
      (`FIGHTERS`) agrupadas por familia y ordenadas por tier, usando
      `state.discoveredDefIds`. Las no conseguidas nunca se muestran
      bloqueadas (icono ❔, "???", sin arte ni nombre, para no hacer
      spoiler) — las conseguidas muestran su ficha normal con arte/nombre/
      elemento/clase. Cabecera con contador "X/315 descubiertos". Al tocar
      una forma conseguida se abre una ficha de solo lectura
      (`UI.showPokedexEntry`, modal nuevo `#pokedexEntryModal`): arte,
      historia, tipo/elemento/clase, tier y estadísticas BASE a nivel 1
      (`buildUnitStats(defId, 1)`, iguales para cualquier jugador) — sin
      nivel/XP/equipo/fusión/venta, solo información de referencia
- [x] **Descripción única por evolución**: las ~90 familias de la expansión
      grande (todo lo añadido tras el roster original de 15 familias)
      compartían una sola frase de lore (`loreCore`) con un sufijo GENÉRICO
      por tier (el mismo texto de relleno para todas las familias de tier 1,
      todas las de tier 2, etc. — ver `TIER_LORE_SUFFIX`). El usuario detectó
      que eso hacía que las 3 evoluciones de cada familia nueva no tuvieran
      historia propia, a diferencia de las 15 familias originales (ascua,
      nigro, lagarto, duende, chispa, piroman, brisa, triton, vidente,
      marejada, gea, topo, heraldo, electro, marina), que sí tenían las 3
      frases escritas a mano desde el principio. Arreglado escribiendo 2
      frases nuevas por familia (evolución 2 y 3), únicas y con hilo con el
      nombre/tema de cada forma, para las 90 familias de `addFamily(...)`.
      `addFamily` ahora acepta un array `[lore1, lore2, lore3]` en vez de una
      única `loreCore` (se mantiene compatibilidad con el string+sufijo
      genérico por si se usa en el futuro). Verificado con un script que
      carga las 315 fichas y confirma que ninguna familia repite lore entre
      sus 3 evoluciones
- [x] **Venta manual de duplicados por Texel**: nuevo panel "🪙 Vender" en la
      ficha de cualquier luchador del roster, con confirmación (la venta es
      definitiva). Precio: `40 × multiplicador de rareza × (1 + 0.15 por
      estrella de Superfusión ya invertida)` — mismo valor base que antes
      se destruía solo, pero ahora es una decisión del jugador y reconoce
      las estrellas ya invertidas. `sellFighter`/`fighterSellValue` en
      `state.js`
- [ ] Revisar si hace falta ampliar el número de **elementos** (ahora 5:
      Fuego/Viento/Tierra/Rayo/Agua) — el usuario preguntó, respuesta dada
      en el chat (probablemente no hace falta, el círculo de 5 con ventajas
      ya es el sistema real de D.o.T.) pero sin más acción
- [x] **15 familias nuevas de mitologías poco representadas** (27/08): el
      usuario pidió 5 sugerencias de tier 1/2/3 cada una y luego pidió
      añadirlas todas. Roster jugable pasa de 105 a 120 familias (360
      fichas). Sin arte todavía (usan el sprite procedural de respaldo
      hasta que el usuario suba PNGs), con nombres/lore de 3 evoluciones y
      skillId escogidos a propósito por temática:
      - Tier 1: `kappa` (agua/pícaro/aturdir — espíritu japonés del río),
        `tanuki` (tierra/explorador/debilitar — mapache cambiaformas),
        `salamandraignea` (fuego/brujo/arrasar — salamandra elemental),
        `thunderbird` (rayo/explorador/furia — cría del ave del trueno),
        `selkie` (agua/gurú/purificar — foca transformista nórdica)
      - Tier 2: `babayaga` (tierra/brujo/debilitar), `tengu`
        (viento/explorador/furia), `chupacabra` (tierra/pícaro/drenar —
        encaja perfecto con la ulti vampírica), `huldra`
        (tierra/gurú/bendicion), `naga` (agua/brujo/arrasar)
      - Tier 3: `ganesha` (tierra/gurú/purificar), `amaterasu`
        (fuego/gurú/revivir — diosa que devuelve la luz al mundo),
        `susanoo` (agua/campeón/grito), `anansi` (tierra/pícaro/veneno —
        dios-araña embaucador), `tlaloc` (rayo/brujo/arrasar)
      Verificado con script: 360 fichas, sin ids duplicados, cada familia
      con sus 3 lores únicos
- [x] **10 familias tier 1 más de folclores poco representados** (27/08):
      segunda tanda de sugerencias, también aprobada e implementada.
      Roster jugable pasa de 120 a 130 familias (390 fichas): `fuegofatuo`
      (fuego/brujo/debilitar), `knocker` (tierra/explorador/furia),
      `kelpie` (agua/pícaro/furia), `perronegro` (viento/campeón/grito),
      `trolpuente` (tierra/campeón/escudo), `jackalope`
      (tierra/explorador/furia), `rusalka` (agua/gurú/bendicion),
      `mothman` (rayo/pícaro/aturdir), `gremlin`
      (rayo/explorador/debilitar), `boto` (agua/brujo/drenar — folclore
      amazónico). Sin arte propio, mismo patrón de 3 lores únicos por
      evolución. Verificado: 390 fichas, sin ids duplicados
- [ ] Más ideas de **personajes nuevos** — el usuario pidió sugerencias,
      dadas en el chat, casi todas ya creadas (25 familias nuevas entre
      las dos tandas del 27/08); se puede seguir ampliando si se pide más
- [x] **Auditoría de balance** (27/08): revisión numérica con un script
      (multiplicador de stats por zona/nivel, XP total para llegar a
      nivel 40, Texel total ganable en un recorrido completo):
      - **Bug real encontrado y arreglado**: el nivel del rival
        (`buildEnemyBand` en `combat.js`) crecía sin tope, 1 por etapa
        (`1 + globalIdx`), a lo largo de 33 zonas × 8 etapas = hasta
        nivel 264 — mientras que el jugador tiene un tope duro de nivel
        40 (`XP_LEVEL_CAP`). Resultado: el multiplicador de stats del
        rival superaba ya al del mejor luchador posible del jugador
        (legendario, nivel 40, 3★) a partir de la zona 5-6, y llegaba a
        ser 3 veces mayor en la última zona (mult ×87 del rival frente a
        ×28 del jugador en el mejor caso) — las últimas ~28 zonas eran
        matemáticamente imposibles de ganar por mucho equipo/estrellas
        que se invirtieran. Arreglado limitando `level` a
        `XP_LEVEL_CAP` (40) — a partir de ahí la dificultad la sigue
        aportando solo la rareza creciente del pool de cada zona (que ya
        escala de Común a Épico de forma independiente), sin tope roto.
        No afecta a las primeras 5 zonas (ahí el nivel nunca llegaba a
        40 de todas formas). Verificado con script: nivel de jefe ahora
        se estabiliza en 40 desde la zona 4/5 en vez de seguir subiendo.
      - **Curva de XP**: revisada y correcta, no hacía falta tocarla — un
        luchador que participa en toda la Formación durante un recorrido
        completo de las 33 zonas gana ~170.300 XP en total frente a
        78.423 XP necesaria para llegar a nivel 40 (ratio ~2.17), margen
        razonable
      - **Coste de la Tienda**: revisado y correcto — un recorrido
        completo da ~355.600 Texel, de sobra para el equipo más caro
        (2000 por pieza Legendaria) y varias mejoras de nivel de equipo
- [x] **Pantalla de Objetivos** (27/08): nuevo botón "🎯" en la barra
      superior (junto a Ajustes), abre `#objectivesModal` con un resumen
      de progreso de solo lectura (`objectivesSummary` en `state.js`),
      pedido explícitamente por el usuario ("bosses derrotados y cuántos
      te faltan, criaturas por encontrar, y más cosas que se te
      ocurran"):
      - 🗺️ Mapa: zonas desbloqueadas, etapas superadas, **jefes
        derrotados** (X/33 — un jefe cuenta como derrotado si se ha
        superado la última etapa de su zona)
      - 📖 Colección: **criaturas descubiertas** (X/390, con atajo para
        abrir la Pokédex), familias completas (con sus 3 formas
        descubiertas), elementos y clases representados en la banda
      - ⭐ Progresión: luchadores en la banda, a nivel máximo, en su
        evolución final, estrellas de Superfusión totales
      - ⚔️ Combate: victorias totales, rango de Arena actual y mejor
        alcanzado
      - 🎒 Recursos: equipo en inventario, homúnculos conseguidos
      Verificado en vivo: los números cuadran con una partida nueva
      (1/33 zonas, 3/390 descubiertas, etc.) y el atajo a la Pokédex
      funciona
- [x] **"Ver jefes" en Objetivos** (27/08): el usuario pidió un botón bajo
      "Jefes derrotados" que abra algo tipo Pokédex pero de jefes, con
      perfil al tocar uno. Nuevo botón "👹 Ver jefes" en el panel Mapa de
      Objetivos → `UI.openBosses` (`#bossesModal`): grid de los 33 jefes
      de zona, los nunca derrotados bloqueados (❔/"???", sin spoiler) y
      los derrotados con su ficha normal (mismo patrón visual que
      `pokedexCard`). Al tocar un jefe derrotado se abre
      `UI.showBossEntry` (`#bossEntryModal`): arte, historia, tipo/tier,
      zona a la que pertenece, y — a diferencia de la Pokédex, que
      muestra stats base nivel 1 — las estadísticas de combate REALES con
      las que se lucha en su zona (mismo nivel tope 40 y bonus ×2.4 HP de
      `makeBossUnit` en `combat.js`), porque un jefe no es un luchador
      que el jugador suba de nivel. `bossesOverview(state)` en
      `state.js` calcula por zona si su jefe está derrotado y a qué
      nivel se combate. Verificado en vivo: marcando 3 zonas como
      superadas, el grid muestra 3 desbloqueadas y 30 bloqueadas, y la
      ficha de un jefe derrotado muestra sus stats reales correctas
      (jefe de la zona 0, nivel 8, 547 HP)
- [ ] Revisar si hacen falta más **jefes** o si 33 (uno por zona) es
      suficiente — el usuario preguntó, respuesta dada en el chat
- [ ] Más criaturas jugables de **tier 1** (las que empiezan en Común) — el
      usuario preguntó si hacen falta más; de las 105 familias jugables
      actuales ~27 son tier 1 (~26%), similar proporción que tier 2 y tier 3,
      así que no está especialmente escaso, pero se puede seguir añadiendo

## Pendiente — sistemas grandes (necesitan diseño propio, iteración aparte)

- [x] **Selección de línea por deslizamiento** (27/08), parte de "Combate —
      pulido visual": el usuario señaló `reference/dot-original/
      combate-elegir-linea.jpg` — en el D.o.T. original se elige la línea
      deslizando el dedo sobre una cuadrícula 3×3 ("Swipe to choose 1
      line"), no tocando botones en una lista. El selector de combinación
      (`UI.showGroupPicker`) pasa de una lista vertical de botones a una
      cuadrícula 3×3 real (mismo layout que la Formación de Banda) con
      gesto de deslizar: `pointerdown`/`pointermove`/`pointerup` sobre la
      rejilla (sirven igual para dedo que para ratón), se determina con
      qué 2 celdas tocadas hay alineación única entre las 8 `BAND_LINES`
      posibles (fila/columna/diagonal), se resalta esa línea en dorado si
      sigue disponible este ciclo o en rojo si no (usada o inexistente), y
      soltar sobre una línea disponible la confirma — sin necesidad de
      soltar sobre ningún botón. Verificado con eventos de puntero
      sintéticos: tocar 2 celdas de una fila resalta las 3 celdas
      correctas y soltar cierra el selector confirmando esa línea; con
      Playwright real el drag headless de mouse.move+down+up no dispara
      pointermove de forma fiable en este sandbox (limitación conocida
      del entorno de test, no del código: los mismos eventos disparados
      directamente sí funcionan perfectamente)
- [x] **Movimiento de ataque en combate** (28/08), parte de "Combate —
      pulido visual (resto)": las tarjetas de combate eran completamente
      estáticas (solo cambiaba la barra de vida y el número flotante) —
      en `combate-formacion-3x3.jpg` se ve al atacante lanzarse hacia el
      rival. Añadidas 3 animaciones CSS de un solo disparo sobre
      `.battle-unit`, disparadas desde `UI.applyBattleEvent` vía el nuevo
      helper `triggerBattleAnim` (fuerza reflow para poder repetirse
      aunque el mismo golpe caiga dos veces seguidas):
      - `lunge-up`/`lunge-down`: el atacante se lanza hacia la fila
        rival (arriba si es del jugador, abajo si es del rival, ya que
        las filas se apilan en columna) y vuelve a su sitio — en cada
        evento `attack`
      - `hit-shake`: quien recibe el golpe tiembla — en `attack` y en
        el tick de veneno/quemadura (`dot`)
      - `heal-glow`: pequeño pulso de escala al curar o revivir
      Solo cosmético, no toca el timing real del combate (los eventos
      siguen resolviéndose exactamente igual, la animación es un extra
      visual de 300-500ms sobre cada tarjeta). Verificado en vivo con un
      observer de mutaciones durante una batalla real: las clases
      `lunge-down` y `hit-shake` aparecen correctamente al golpear
      - [x] **Posición real en el campo según la línea** (28/08): cuando
        la línea elegida es una columna o diagonal, los 3 luchadores ya
        no se muestran en fila recta — se colocan en `#playerActiveRow`
        (ahora con `display:grid` bajo `.active-row-spread`) en la
        posición `[fila, columna]` real que ocupan en la Formación,
        igual que en `combate-formacion-3x3.jpg`. `UI.commitGroup`
        recupera esas coordenadas repitiendo sobre `BAND_LINES[group.idx]
        .cells` el mismo filtro de huecos vacíos que ya usa
        `combinationFighterUids` (mismo orden, así que casan índice a
        índice con `playerRow`). Las tarjetas se encogen en este modo
        (icono más pequeño, sin nombre) para que quepan las 3 filas de
        la rejilla en el espacio que antes ocupaba una sola línea. Las
        líneas horizontales (fila1/2/3) no cambian nada — se renderizan
        exactamente igual que antes, cero regresión ahí. Verificado en
        vivo: seleccionar la diagonal principal coloca los 3 luchadores
        en escalera (arriba-izquierda/centro/abajo-derecha) sin
        desbordar la pantalla, y seleccionar una fila normal se ve
        idéntico a como se veía antes del cambio
- [x] **Fondos de zona procedurales (respaldo mientras no hay arte)** (28/08):
      el usuario pidió lo mismo que ya existe para los personajes — un
      respaldo generado por código mientras no haya arte real, que se
      sustituya solo en cuanto se suba la imagen, sin tocar código.
      Nuevo `zoneBackgroundStyle(zone)` en `ui.js`: capa 1 (encima de
      todo) un velo oscuro para que el texto siga legible, capa 2 la
      imagen real `assets/scenery/<id>.jpg` (mismo `id` que la zona en
      `ZONES`, p.ej. `assets/scenery/bosque.jpg`), capa 3 un degradado
      radial de respaldo hecho con el `color` que cada zona ya tenía
      definido en `ZONES` (aclarado/oscurecido con un pequeño helper
      `shadeColor`). A diferencia del sprite de criatura (que necesita
      un `<img>` con `onerror` porque cambia de un `<canvas>` a una
      `<img>`), un `background-image` de CSS que da 404 simplemente no
      se pinta y se ve la capa de abajo — no hace falta detectar el
      fallo a mano, en cuanto exista el archivo se ve solo. Aplicado en
      las 3 pantallas de la referencia: tarjetas de zona en el Mapa,
      recorrido nodo a nodo (`recorrido-escenario.jpg`) y fondo de
      combate (`encuentro-enemigo.jpg`, sin fondo de zona en la Arena,
      que no pertenece a ninguna). Verificado en vivo con capturas de
      las 3 pantallas: cada zona ya tiene un color/ambiente propio y
      distinto, con el texto perfectamente legible
  - [ ] Sprites de escenario/paisaje reales pendientes de subir — cuando
        se suba `assets/scenery/<id>.jpg` de una zona (ids en `ZONES`,
        `js/data.js`: `bosque`, `pantano`, `cuevas`, `picos`, `ruinas`,
        `guarida`, etc.) sustituye al degradado automáticamente, sin
        tocar código
- [x] Más tipos de ulti variados más allá de los que ya existen — hecho:
      "daño en el tiempo" (veneno/dot), "revivir en combate" (revive) y
      "dispersar/curar estados" (cleanse) ya están, más un vampírico
      (drain) que no estaba en esta lista original. Ver detalle en la
      sección de la ronda de 14 preguntas más arriba

## Criaturas jugables con PNG ya asignado (candidatas a sustituir)

Lista histórica de las primeras familias con arte real, de antes de que el
usuario empezara a recortar él mismo desde el móvil. **Actualización
27/08**: el usuario ha empezado a subir/renombrar imágenes directamente en
GitHub (commits `Add files via upload` + `Rename IMG_...png to
slug_rareza.png`) para MUCHAS de estas familias y también para casi todas
las de la sección "Progreso de sprites nuevos" de más abajo — ya no hace
falta pedírselas por el chat, las está gestionando él directamente en el
repo. `ascua` ya no es parcial: ahora las 3 formas tienen PNG.

- **ascua**: `ascua_raro.png`, `ascua_epico.png`, `ascua_legendario.png`
  (completada por el usuario directamente en GitHub — antes solo tenía la
  forma Legendario)
- **nigro**: `nigro_raro.png`, `nigro_epico.png`, `nigro_legendario.png`
- **lagarto**: `lagarto_raro.png`, `lagarto_epico.png`, `lagarto_legendario.png`
- **duende**: `duende_raro.png`, `duende_epico.png`, `duende_legendario.png`
- **chispa**: `chispa_raro.png`, `chispa_epico.png`, `chispa_legendario.png`
- **piroman**: `piroman_raro.png`, `piroman_epico.png`, `piroman_legendario.png`
- **triton**: `triton_infrecuente.png`, `triton_raro.png`, `triton_epico.png`
- **vidente**: `vidente_infrecuente.png`, `vidente_raro.png`, `vidente_epico.png`
- **marejada**: `marejada_infrecuente.png`, `marejada_raro.png`, `marejada_epico.png`
- **topo**: `topo_comun.png`, `topo_infrecuente.png`, `topo_raro.png`
- **heraldo**: `heraldo_comun.png`, `heraldo_infrecuente.png`, `heraldo_raro.png`

## Sprites que necesitaron quitar el fondo a mano (antes del recorte por móvil)

A partir de **sirena** el usuario manda las imágenes ya recortadas desde el
móvil (PNG con canal alfa real) — mucho más simple y fiable que lo de
antes: solo hace falta segmentar por columnas y listo, sin ningún riesgo
de comerse trocitos del personaje o dejar restos de fondo. Estas 4 familias
anteriores sí necesitaron que yo quitara el fondo manualmente (checkerboard
o fondo plano, con flood-fill/paleta de color, con más o menos iteraciones
según el caso):

- **brisa**: fondo tipo checkerboard con textura/ruido — el más complicado,
  necesitó dos pasadas (flood-fill en cadena + paleta ajustada) por una
  zona que quedaba encerrada por los efectos de viento
- **electro**: primer envío con checkerboard fino (mismo tono casi que la
  ropa del personaje, muy difícil de separar bien) — el usuario reenvió una
  versión con fondo plano que sí se pudo recortar limpio
- **marina**: fondo blanco plano, sencillo, solo hubo que descartar un
  trocito de la columna vecina que se colaba en el borde
- **gea**: checkerboard muy sutil (apenas 14 de contraste entre sus dos
  tonos), necesitó dos pasadas igual que brisa

## Imágenes marcadas para optimizar en el futuro (peso/dimensiones excesivos)

Se rellena según se vayan añadiendo sprites nuevos, si alguna imagen enviada
es extremadamente grande (peso o dimensiones) para que se pueda sustituir
más adelante por una versión más optimizada. Referencia: el resto del
roster con arte real pesa entre 8 KB y 242 KB por imagen (150-450 px de
ancho aprox.); se marca aquí lo que se salga bastante de ese rango.

- **brisa_epico.png** (431×530, ~416 KB) y **brisa_legendario.png**
  (459×557, ~487 KB): bastante más pesadas que el resto del roster (~90.000
  colores únicos por el degradado suave del arte nuevo, frente al pixel art
  de paleta reducida de antes). No bloquea nada ahora, pero son candidatas a
  recomprimir/reducir si el peso total de assets se convierte en un
  problema.
- **electro_infrecuente.png** (~349 KB) y **electro_raro.png** (~400 KB):
  mismo motivo que brisa (degradado suave, muchos colores únicos).
  `electro_comun.png` (~270 KB) también por encima del rango de referencia
  pero más moderado.
- **marina_infrecuente.png** (~325 KB) y **marina_raro.png** (~382 KB): igual
  patrón. `marina_comun.png` (~191 KB) sí entra dentro del rango de
  referencia, no hace falta marcarla.
- **gea_raro.png** (~413 KB) y **gea_epico.png** (~474 KB): igual patrón,
  esta última es la más pesada de todas las añadidas hasta ahora.
  `gea_infrecuente.png` (~253 KB) algo por encima pero moderado.
- **sirena_raro.png** (~366 KB) y **sirena_epico.png** (~604 KB, ahora la
  más pesada de todas): mismo motivo, ilustración con muchos detalles y
  degradado suave. `sirena_infrecuente.png` (~145 KB) sí entra en el rango
  de referencia.
- **gorila_infrecuente.png** (~434 KB) y **gorila_raro.png** (~493 KB):
  mismo motivo. `gorila_comun.png` (~229 KB) sí entra en el rango de
  referencia.
- **cocodrilo_raro.png** (~332 KB) y **cocodrilo_epico.png** (~601 KB):
  mismo motivo. `cocodrilo_infrecuente.png` (~203 KB) sí entra en el rango
  de referencia.
- **hidradragon_legendario.png** (~470 KB): mismo motivo. `hidradragon_raro.png`
  (~97 KB) y `hidradragon_epico.png` (~251 KB) entran en el rango de
  referencia o muy cerca.
- **avefenix_epico.png** (~288 KB) y **avefenix_legendario.png** (~473 KB):
  mismo motivo. `avefenix_raro.png` (~75 KB) entra en el rango de referencia.

## Sprites de personajes/mobs/jefes pendientes (roster masivo)

Los 89 personajes, 33 mobs y 27 jefes del roster masivo (14.1/14.2/14.3) ya
están creados en `js/data.js` con sus 3 formas (o forma única para los
jefes), stats, habilidad e historia — usan el sprite procedural de
respaldo hasta que haya arte real. Nombre de archivo esperado si se genera
arte: cae directo en `assets/creatures/`, con el nombre exacto entre
comillas de cada entrada de abajo (mismo patrón que el resto del roster,
`slug_rareza.png`).

Ya pendientes de arte real (del roster humanizado ya existente, no del
roster masivo): ninguna — las 4 (Marina, Gea, Brisa, Electro) tienen ya arte
real.

## Progreso de sprites nuevos (técnica mejorada, en curso)

Sustituyendo el sprite procedural por PNG real, familia a familia, con la
nueva técnica del usuario (que también podría acabar reemplazando a los 10+1
de la lista de arriba). El usuario manda una imagen con las 3 evoluciones,
se recorta y se asigna en `js/data.js`. Iterando en orden hasta cubrir las
104 familias jugables.

- [x] **brisa** (Viento/Explorador): Exploradora de las Corrientes
      (`brisa_raro.png`) → Arquera de las Nubes (`brisa_epico.png`) →
      Soberana del Vendaval (`brisa_legendario.png`)
- [x] **electro** (Rayo/Explorador): Corredor Eléctrico
      (`electro_comun.png`) → Cazador de Tormentas
      (`electro_infrecuente.png`) → Rastreador del Trueno
      (`electro_raro.png`)
- [x] **marina** (Agua/Pícaro): Grumete Marina (`marina_comun.png`) →
      Pirata de las Mareas (`marina_infrecuente.png`) → Corsaria Abisal
      (`marina_raro.png`)
- [x] **gea** (Tierra/Gurú): Aprendiza de Gea (`gea_infrecuente.png`) →
      Chamana de Raíces (`gea_raro.png`) → Druida Ancestral
      (`gea_epico.png`)
- [x] **sirena** (Agua/Brujo): Sirena de Voz Dulce
      (`sirena_infrecuente.png`) → Sirena Encantadora (`sirena_raro.png`) →
      Reina de las Profundidades (`sirena_epico.png`). Primera familia del
      roster masivo (creada con `addFamily`, no a mano) — se le añadió un
      parámetro `hasImages` a `addFamily` para no tener que repetir a mano
      `image: 'slug_rareza.png'` en las próximas
- [x] **gorila** (Tierra/Campeón): Gorila Montaraz (`gorila_comun.png`) →
      Gorila de Espalda Plateada (`gorila_infrecuente.png`) → Rey de la
      Jungla de Piedra (`gorila_raro.png`)
- [x] **cocodrilo** (Agua/Campeón): Guerrero Cocodrilo
      (`cocodrilo_infrecuente.png`) → Centurión del Pantano
      (`cocodrilo_raro.png`) → Señor de las Aguas Turbias
      (`cocodrilo_epico.png`)
- [x] **hidradragon** (Rayo/Brujo): Cría de Mil Fauces
      (`hidradragon_raro.png`) → Dragón de Tres Cabezas
      (`hidradragon_epico.png`) → Soberano de las Siete Cabezas
      (`hidradragon_legendario.png`). El recorte del móvil dejó restos de
      checkerboard semitransparente dentro del contorno (huecos entre las
      alas y los orbes mágicos) en las 3 formas — se limpiaron con un filtro
      dirigido (píxel casi gris + alfa medio/bajo → transparente) en vez del
      recorte directo por caja alfa que basta para el resto de imágenes
      pre-recortadas
- [x] **avefenix** (Fuego/Gurú): Polluelo de Cenizas (`avefenix_raro.png`) →
      Ave de Fuego Eterno (`avefenix_epico.png`) → Fénix Inmortal
      (`avefenix_legendario.png`). La más difícil hasta ahora: el recorte
      del móvil dejó un borde magenta/rosa alrededor de todo el contorno (el
      color "imposible" típico de las apps de recorte por chroma-key) más
      dos bolsillos de checkerboard opaco (no solo semitransparente)
      encerrados en huecos cóncavos del Polluelo (cuello-ala) que ni el
      filtro de color lograba distinguir de forma fiable de las sombras
      reales del plumaje. Se combinaron tres pasadas (filtro de tono magenta
      + limpieza manual de los dos bolsillos por coordenadas en Polluelo +
      filtro de tono magenta más permisivo en Épico/Legendario) — queda un
      resto muy fino de borde magenta apenas perceptible en Épico y
      Legendario, aceptado por tiempo invertido; si se nota mucho en el
      juego real, recortar de nuevo con fondo plano (como electro/gea) en
      vez de con transparencia real sería más simple para el usuario.
      **Actualización 27/08**: el usuario ha vuelto a subir su propio
      recorte de las 3 formas directamente en GitHub, más limpio que el
      mío (sin resto de borde magenta) — su versión es la que está en uso
      ahora mismo
- [x] **hipogrifo** (Viento/Explorador): Potro Alado → Hipogrifo Salvaje →
      Señor de los Cielos Altos — subido directamente en GitHub por el
      usuario (`hipogrifo_infrecuente/raro/epico.png`)
- [x] **cerbero** (Fuego/Campeón): Cachorro de Tres Cabezas → Guardián del
      Umbral → Cerbero, Custodio del Inframundo — subido directamente en
      GitHub por el usuario (`cerbero_raro/epico/legendario.png`)
- [x] **centauro** (Tierra/Explorador): Potrillo Centauro → Centauro
      Arquero → Jefe de la Manada Salvaje — subido directamente en GitHub
      por el usuario (`centauro_infrecuente/raro/epico.png`)

### Personajes (14.1) — 89 familias × 3 formas
(las familias ya hechas se quitan de aquí — ver la lista con checkboxes más
arriba, "Progreso de sprites nuevos", para el registro completo)
- **minotauro**: Toro Joven del Laberinto (`minotauro_infrecuente.png`) → Minotauro Furioso (`minotauro_raro.png`) → Amo del Laberinto Eterno (`minotauro_epico.png`)
- **kraken**: Cría de Kraken (`kraken_raro.png`) → Kraken de las Profundidades (`kraken_epico.png`) → Devorador de Flotas (`kraken_legendario.png`)
- **leviatan**: Serpiente de Mar Joven (`leviatan_raro.png`) → Leviatán de las Mareas (`leviatan_epico.png`) → Leviatán, Terror del Océano (`leviatan_legendario.png`)
- **fenrir**: Lobezno de Hierro (`fenrir_raro.png`) → Fenrir Encadenado (`fenrir_epico.png`) → Fenrir, el Lobo del Fin del Mundo (`fenrir_legendario.png`)
- **nahual**: Aprendiz de Nahual (`nahual_infrecuente.png`) → Nahual Cambiapieles (`nahual_raro.png`) → Gran Brujo Nahual (`nahual_epico.png`)
- **quetzalcoatl**: Serpiente Emplumada Joven (`quetzalcoatl_raro.png`) → Quetzalcóatl Ascendente (`quetzalcoatl_epico.png`) → Quetzalcóatl, Señor del Viento (`quetzalcoatl_legendario.png`)
- **cadejo**: Cadejo Blanco (`cadejo_comun.png`) → Cadejo Guardián (`cadejo_infrecuente.png`) → Cadejo Protector de Caminantes (`cadejo_raro.png`)
- **hada**: Hada Menor (`hada_comun.png`) → Hada del Bosque (`hada_infrecuente.png`) → Reina de las Hadas (`hada_raro.png`)
- **shenlong**: Dragoncillo de las Nubes (`shenlong_raro.png`) → Shenlong Danzante (`shenlong_epico.png`) → Shenlong, Dragón de la Lluvia (`shenlong_legendario.png`)
- **zeus**: Joven del Olimpo (`zeus_raro.png`) → Heredero del Rayo (`zeus_epico.png`) → Zeus, Señor del Trueno (`zeus_legendario.png`)
- **guerreromedieval**: Recluta de Armadura (`guerreromedieval_comun.png`) → Caballero de Armas (`guerreromedieval_infrecuente.png`) → Comandante de la Guardia (`guerreromedieval_raro.png`)
- **valquiria**: Escudera Valquiria (`valquiria_infrecuente.png`) → Valquiria de Combate (`valquiria_raro.png`) → Elegidora de los Caídos (`valquiria_epico.png`)
- **golem**: Golem de Barro (`golem_infrecuente.png`) → Golem de Piedra (`golem_raro.png`) → Golem de Hierro Ancestral (`golem_epico.png`)
- **satiromusico**: Sátiro Flautista (`satiromusico_infrecuente.png`) → Sátiro de la Fiesta Eterna (`satiromusico_raro.png`) → Sumo Sátiro de Dioniso (`satiromusico_epico.png`)
- **mandragora**: Brote de Mandrágora (`mandragora_comun.png`) → Mandrágora Chillona (`mandragora_infrecuente.png`) → Mandrágora Ancestral (`mandragora_raro.png`)
- **pazuzu**: Espíritu Menor del Viento (`pazuzu_raro.png`) → Heraldo de Pazuzu (`pazuzu_epico.png`) → Pazuzu, Señor de los Vientos del Sur (`pazuzu_legendario.png`)
- **garuda**: Polluelo de Garuda (`garuda_infrecuente.png`) → Garuda Cazadora (`garuda_raro.png`) → Garuda, Montura de los Dioses (`garuda_epico.png`)
- **anubis**: Chacal del Desierto (`anubis_raro.png`) → Sacerdote de Anubis (`anubis_epico.png`) → Anubis, Guardián de los Muertos (`anubis_legendario.png`)
- **ra**: Disco Solar Joven (`ra_raro.png`) → Heraldo de Ra (`ra_epico.png`) → Ra, Señor del Sol (`ra_legendario.png`)
- **osiris**: Aprendiz del Nilo (`osiris_raro.png`) → Sacerdote de Osiris (`osiris_epico.png`) → Osiris, Señor de la Resurrección (`osiris_legendario.png`)
- **hombretigre**: Cachorro Tigre (`hombretigre_infrecuente.png`) → Guerrero Tigre (`hombretigre_raro.png`) → Señor de las Rayas Doradas (`hombretigre_epico.png`)
- **hombrelobo**: Joven Maldito (`hombrelobo_infrecuente.png`) → Hombre Lobo (`hombrelobo_raro.png`) → Alfa de la Luna Llena (`hombrelobo_epico.png`)
- **dracula**: Vástago de la Noche (`dracula_raro.png`) → Noble de Sangre Oscura (`dracula_epico.png`) → Drácula, Señor de la Noche (`dracula_legendario.png`)
- **genbu**: Tortuga Joven de Genbu (`genbu_infrecuente.png`) → Genbu, Guardián del Norte (`genbu_raro.png`) → Genbu, Escudo de las Profundidades (`genbu_epico.png`)
- **escualo**: Aprendiz Tiburón (`escualo_comun.png`) → Escualo de Combate (`escualo_infrecuente.png`) → Depredador de los Siete Mares (`escualo_raro.png`)
- **hercules**: Joven de Fuerza Divina (`hercules_raro.png`) → Hércules en sus Trabajos (`hercules_epico.png`) → Hércules, el Semidiós (`hercules_legendario.png`)
- **ciclope**: Cíclope Pastor (`ciclope_infrecuente.png`) → Cíclope Forjador (`ciclope_raro.png`) → Cíclope, Ojo del Trueno (`ciclope_epico.png`)
- **driada**: Brote de Dríada (`driada_comun.png`) → Dríada del Bosque (`driada_infrecuente.png`) → Dríada Madre del Bosque Ancestral (`driada_raro.png`)
- **ent**: Retoño Andante (`ent_infrecuente.png`) → Ent Guardián (`ent_raro.png`) → Ent Ancestral del Bosque Viejo (`ent_epico.png`)
- **hidraserpiente**: Hidra Recién Nacida (`hidraserpiente_infrecuente.png`) → Hidra de Pantano (`hidraserpiente_raro.png`) → Hidra de las Nueve Cabezas (`hidraserpiente_epico.png`)
- **hombreoso**: Joven Oso (`hombreoso_comun.png`) → Guerrero Oso (`hombreoso_infrecuente.png`) → Gran Oso de las Montañas (`hombreoso_raro.png`)
- **mujercisne**: Doncella Cisne (`mujercisne_infrecuente.png`) → Mujer Cisne (`mujercisne_raro.png`) → Reina de los Lagos Blancos (`mujercisne_epico.png`)
- **unicornio**: Potrillo con Cuerno (`unicornio_infrecuente.png`) → Unicornio Radiante (`unicornio_raro.png`) → Unicornio de Luz Pura (`unicornio_epico.png`)
- **esfinge**: Cachorra de Esfinge (`esfinge_raro.png`) → Esfinge Guardiana (`esfinge_epico.png`) → Esfinge, Guardiana de Enigmas (`esfinge_legendario.png`)
- **grifo**: Polluelo de Grifo (`grifo_infrecuente.png`) → Grifo Cazador (`grifo_raro.png`) → Grifo, Rey de las Alturas (`grifo_epico.png`)
- **lamasu**: Guardián Menor Lamasu (`lamasu_infrecuente.png`) → Lamasu de las Puertas (`lamasu_raro.png`) → Lamasu, Custodio de Palacios (`lamasu_epico.png`)
- **pegaso**: Potrillo Alado (`pegaso_infrecuente.png`) → Pegaso Veloz (`pegaso_raro.png`) → Pegaso, Corcel de las Nubes (`pegaso_epico.png`)
- **silfide**: Brisa Menor (`silfide_comun.png`) → Sílfide del Viento (`silfide_infrecuente.png`) → Sílfide, Espíritu del Aire Puro (`silfide_raro.png`)
- **wyvern**: Cría de Wyvern (`wyvern_infrecuente.png`) → Wyvern Cazador (`wyvern_raro.png`) → Wyvern, Terror de los Cielos (`wyvern_epico.png`)
- **cecaelia**: Joven Cecaelia (`cecaelia_infrecuente.png`) → Cecaelia de los Arrecifes (`cecaelia_raro.png`) → Cecaelia, Bruja del Coral (`cecaelia_epico.png`)
- **hipocampo**: Hipocampo Joven (`hipocampo_comun.png`) → Hipocampo de las Corrientes (`hipocampo_infrecuente.png`) → Hipocampo, Corcel del Mar (`hipocampo_raro.png`)
- **enano**: Enano Aprendiz (`enano_comun.png`) → Enano Herrero (`enano_infrecuente.png`) → Enano Rey de la Montaña (`enano_raro.png`)
- **duendetravieso**: Duende Travieso (`duendetravieso_comun.png`) → Duende Embaucador (`duendetravieso_infrecuente.png`) → Duende Rey de las Bromas (`duendetravieso_raro.png`)
- **guerreroleopardo**: Joven Leopardo (`guerreroleopardo_infrecuente.png`) → Guerrero Leopardo (`guerreroleopardo_raro.png`) → Señor de las Manchas Doradas (`guerreroleopardo_epico.png`)
- **panteranegra**: Cachorro de Pantera (`panteranegra_infrecuente.png`) → Guerrero Pantera Negra (`panteranegra_raro.png`) → Rey de la Pantera Negra (`panteranegra_epico.png`)
- **armaduratecno**: Prototipo de Armadura (`armaduratecno_raro.png`) → Piloto de Armadura de Combate (`armaduratecno_epico.png`) → Titán de Acero y Rayo (`armaduratecno_legendario.png`)
- **genio**: Genio Encerrado (`genio_raro.png`) → Genio Liberado (`genio_epico.png`) → Genio, Señor de los Tres Deseos (`genio_legendario.png`)
- **amazona**: Joven Amazona (`amazona_infrecuente.png`) → Guerrera Amazona (`amazona_raro.png`) → Reina de las Amazonas (`amazona_epico.png`)
- **bigfoot**: Rastro en el Bosque (`bigfoot_comun.png`) → Bigfoot Solitario (`bigfoot_infrecuente.png`) → Bigfoot, Leyenda del Bosque (`bigfoot_raro.png`)
- **nessie**: Cría del Lago (`nessie_infrecuente.png`) → Monstruo del Lago (`nessie_raro.png`) → Nessie, Leyenda de las Aguas Frías (`nessie_epico.png`)
- **samurai**: Aprendiz de Samurái (`samurai_infrecuente.png`) → Samurái Errante (`samurai_raro.png`) → Maestro Espadachín del Trueno (`samurai_epico.png`)
- **hombrefuego**: Chispa Viviente (`hombrefuego_comun.png`) → Hombre de Fuego (`hombrefuego_infrecuente.png`) → Avatar de las Llamas (`hombrefuego_raro.png`)
- **sacerdote**: Acólito (`sacerdote_comun.png`) → Sacerdote Bendecido (`sacerdote_infrecuente.png`) → Sumo Sacerdote de Texel (`sacerdote_raro.png`)
- **thor**: Joven del Martillo (`thor_raro.png`) → Guerrero de Asgard (`thor_epico.png`) → Thor, Dios del Trueno (`thor_legendario.png`)
- **gladiador**: Esclavo de la Arena (`gladiador_comun.png`) → Gladiador Veterano (`gladiador_infrecuente.png`) → Campeón del Coliseo (`gladiador_raro.png`)
- **hombrehielo**: Escarcha Viviente (`hombrehielo_comun.png`) → Hombre de Hielo (`hombrehielo_infrecuente.png`) → Avatar del Invierno Eterno (`hombrehielo_raro.png`)
- **odin**: Joven Vidente (`odin_raro.png`) → Odín, el Errante (`odin_epico.png`) → Odín, Padre de Todo (`odin_legendario.png`)
- **sunwukong**: Mono de Piedra (`sunwukong_raro.png`) → Rey Mono (`sunwukong_epico.png`) → Sun Wukong, el Sabio Igualado al Cielo (`sunwukong_legendario.png`)
- **leonhumanizado**: Cachorro de León (`leonhumanizado_infrecuente.png`) → Guerrero León (`leonhumanizado_raro.png`) → Rey de la Sabana Dorada (`leonhumanizado_epico.png`)
- **yeti**: Cría de Yeti (`yeti_infrecuente.png`) → Yeti de las Cumbres (`yeti_raro.png`) → Yeti, Señor de las Nieves Eternas (`yeti_epico.png`)
- **deerwoman**: Joven del Bosque (`deerwoman_infrecuente.png`) → Deer Woman (`deerwoman_raro.png`) → Deer Woman, Espíritu Vengador (`deerwoman_epico.png`)
- **gatubela**: Aprendiz Felina (`gatubela_infrecuente.png`) → Gatúbela (`gatubela_raro.png`) → Reina de los Tejados (`gatubela_epico.png`)
- **afrodita**: Doncella Nacida del Mar (`afrodita_raro.png`) → Afrodita en Flor (`afrodita_epico.png`) → Afrodita, Diosa del Amor (`afrodita_legendario.png`)
- **basajaun**: Joven Basajaun (`basajaun_infrecuente.png`) → Basajaun del Bosque (`basajaun_raro.png`) → Basajaun, Señor de los Bosques Vascos (`basajaun_epico.png`)
- **icaro**: Aprendiz de Alas de Cera (`icaro_comun.png`) → Ícaro en Vuelo (`icaro_infrecuente.png`) → Ícaro, el que Desafió al Sol (`icaro_raro.png`)
- **orangutan**: Cría de Orangután (`orangutan_comun.png`) → Orangután de la Selva (`orangutan_infrecuente.png`) → Sabio Orangután de la Jungla (`orangutan_raro.png`)
- **poseidon**: Joven del Tridente (`poseidon_raro.png`) → Guardián de las Mareas (`poseidon_epico.png`) → Poseidón, Señor de los Mares (`poseidon_legendario.png`)
- **davyjones**: Marinero Maldito (`davyjones_infrecuente.png`) → Davy Jones, el Maldito (`davyjones_raro.png`) → Davy Jones, Capitán del Abismo (`davyjones_epico.png`)
- **velociraptor**: Cría de Velocirraptor (`velociraptor_comun.png`) → Velocirraptor Cazador (`velociraptor_infrecuente.png`) → Líder de la Manada de Raptores (`velociraptor_raro.png`)
- **hombrepez**: Joven Hombre Pez (`hombrepez_comun.png`) → Hombre Pez de las Profundidades (`hombrepez_infrecuente.png`) → Ancestro de las Profundidades (`hombrepez_raro.png`)
- **bastet**: Gatita Sagrada (`bastet_infrecuente.png`) → Sacerdotisa de Bastet (`bastet_raro.png`) → Bastet, Diosa Felina (`bastet_epico.png`)
- **orcahumanoide**: Joven Orca (`orcahumanoide_infrecuente.png`) → Guerrera Orca (`orcahumanoide_raro.png`) → Matriarca de las Orcas (`orcahumanoide_epico.png`)
- **mujerconejo**: Joven Conejo (`mujerconejo_comun.png`) → Mujer Conejo (`mujerconejo_infrecuente.png`) → Gran Coneja de la Luna (`mujerconejo_raro.png`)
- **tiburonmartillo**: Grumete Martillo (`tiburonmartillo_infrecuente.png`) → Pirata Tiburón Martillo (`tiburonmartillo_raro.png`) → Capitán de los Siete Mares (`tiburonmartillo_epico.png`)
- **espantapajaros**: Espantapájaros Roto (`espantapajaros_comun.png`) → Espantapájaros Animado (`espantapajaros_infrecuente.png`) → Guardián del Campo Maldito (`espantapajaros_raro.png`)
- **escorpionhumanoide**: Joven Escorpión (`escorpionhumanoide_infrecuente.png`) → Guerrero Escorpión (`escorpionhumanoide_raro.png`) → Señor del Aguijón Mortal (`escorpionhumanoide_epico.png`)
- **dientesdesable**: Cría Dientes de Sable (`dientesdesable_infrecuente.png`) → Guerrero Dientes de Sable (`dientesdesable_raro.png`) → Señor de la Era del Hielo (`dientesdesable_epico.png`)
- **cangrejo**: Cangrejo Pequeño (`cangrejo_comun.png`) → Cangrejo Acorazado (`cangrejo_infrecuente.png`) → Rey Cangrejo de las Rocas (`cangrejo_raro.png`)
- **zapador**: Zapador Novato (`zapador_comun.png`) → Zapador de Túneles (`zapador_infrecuente.png`) → Maestro Zapador de las Profundidades (`zapador_raro.png`)
- **plantacarnivora**: Brote Carnívoro (`plantacarnivora_comun.png`) → Planta Carnívora (`plantacarnivora_infrecuente.png`) → Devoradora de las Profundidades del Bosque (`plantacarnivora_raro.png`)
- **estatua**: Estatua Agrietada (`estatua_infrecuente.png`) → Estatua Animada (`estatua_raro.png`) → Coloso de Piedra Viviente (`estatua_epico.png`)
### Jefes / bosses (14.2) — 27, forma única cada uno
- **tifon**: Tifón, Padre de los Monstruos (`boss_tifon.png`)
- **quimera**: Quimera, la Bestia de Tres Cabezas (`boss_quimera.png`)
- **garn**: Garn, el Devorador de Piedra (`boss_garn.png`)
- **nian**: Nian, la Bestia del Año Nuevo (`boss_nian.png`)
- **tiamat**: Tiamat, Madre del Caos (`boss_tiamat.png`)
- **surtr**: Surtr, Señor de las Llamas de Muspelheim (`boss_surtr.png`)
- **behemoth**: Behemoth, la Bestia Primigenia (`boss_behemoth.png`)
- **medusa**: Medusa, la Gorgona de Mirada Pétrea (`boss_medusa.png`)
- **apofis**: Apofis, la Serpiente del Caos (`boss_apofis.png`)
- **ammit**: Ammit, Devoradora de Corazones (`boss_ammit.png`)
- **cthulhu**: Cthulhu, el que Duerme en las Profundidades (`boss_cthulhu.png`)
- **balrog**: Balrog, Demonio de Sombra y Fuego (`boss_balrog.png`)
- **leondenemea**: León de Nemea, Piel Impenetrable (`boss_leondenemea.png`)
- **pajaroroc**: Roc, el Ave que Oscurece el Cielo (`boss_pajaroroc.png`)
- **torodecreta**: Toro de Creta, Furia Desatada (`boss_torodecreta.png`)
- **basilisco**: Basilisco, Rey de las Serpientes (`boss_basilisco.png`)
- **ettin**: Ettin, el Gigante de Dos Cabezas (`boss_ettin.png`)
- **gorgonas**: Las Gorgonas, Hermanas de Piedra (`boss_gorgonas.png`)
- **rakshasa**: Rakshasa, el Cambiante Maldito (`boss_rakshasa.png`)
- **manticora**: Mantícora, la Devoradora de Hombres (`boss_manticora.png`)
- **liche**: Liche, Señor de los No-Muertos (`boss_liche.png`)
- **magooscuro**: El Mago Oscuro sin Nombre (`boss_magooscuro.png`)
- **loki**: Loki, el Dios del Engaño (`boss_loki.png`)
- **joker**: El Bufón de la Locura (`boss_joker.png`)
- **acromantula**: Acromántula, Madre de la Colonia (`boss_acromantula.png`)
- **wendigo**: Wendigo, Hambre sin Fin (`boss_wendigo.png`)
- **mantisreligiosa**: Mantis, la Segadora Silenciosa (`boss_mantisreligiosa.png`)
### Enemigos / mobs normales (14.3) — 33 familias × 3 formas
- **arpia**: Arpía Joven (`arpia_comun.png`) → Arpía Chillona (`arpia_infrecuente.png`) → Arpía Matriarca del Nido (`arpia_raro.png`)
- **dullahan**: Jinete sin Cabeza Menor (`dullahan_infrecuente.png`) → Dullahan Cabalgante (`dullahan_raro.png`) → Dullahan, Heraldo de la Muerte (`dullahan_epico.png`)
- **tengu**: Tengu Travieso (`tengu_comun.png`) → Tengu Guerrero (`tengu_infrecuente.png`) → Gran Tengu de la Montaña (`tengu_raro.png`)
- **goblin**: Goblin Novato (`goblin_comun.png`) → Goblin Saqueador (`goblin_infrecuente.png`) → Jefe de la Horda Goblin (`goblin_raro.png`)
- **trasgo**: Trasgo Menor (`trasgo_comun.png`) → Trasgo Revoltoso (`trasgo_infrecuente.png`) → Trasgo Rey de las Travesuras (`trasgo_raro.png`)
- **demonio**: Demonio Menor (`demonio_infrecuente.png`) → Demonio de las Llamas (`demonio_raro.png`) → Archidemonio del Abismo (`demonio_epico.png`)
- **esqueleto**: Esqueleto Andante (`esqueleto_comun.png`) → Esqueleto Guerrero (`esqueleto_infrecuente.png`) → Comandante de Huesos (`esqueleto_raro.png`)
- **draugr**: Draugr Recién Alzado (`draugr_infrecuente.png`) → Draugr Vikingo (`draugr_raro.png`) → Rey Draugr del Túmulo (`draugr_epico.png`)
- **chupacabras**: Chupacabras Joven (`chupacabras_comun.png`) → Chupacabras Nocturno (`chupacabras_infrecuente.png`) → Terror de los Rebaños (`chupacabras_raro.png`)
- **kitsune**: Kitsune de Una Cola (`kitsune_infrecuente.png`) → Kitsune de Tres Colas (`kitsune_raro.png`) → Kitsune de Nueve Colas (`kitsune_epico.png`)
- **momia**: Momia Menor (`momia_comun.png`) → Momia Vendada (`momia_infrecuente.png`) → Faraón Momificado (`momia_raro.png`)
- **orco**: Orco Recluta (`orco_comun.png`) → Orco Guerrero (`orco_infrecuente.png`) → Jefe de Guerra Orco (`orco_raro.png`)
- **dementor**: Sombra Menor (`dementor_infrecuente.png`) → Dementor Errante (`dementor_raro.png`) → Dementor, Ladrón de Almas (`dementor_epico.png`)
- **arana**: Araña Pequeña (`arana_comun.png`) → Araña Venenosa (`arana_infrecuente.png`) → Reina Araña del Nido (`arana_raro.png`)
- **jabali**: Jabatillo (`jabali_comun.png`) → Jabalí Salvaje (`jabali_infrecuente.png`) → Gran Jabalí del Bosque Oscuro (`jabali_raro.png`)
- **gargola**: Gárgola Dormida (`gargola_infrecuente.png`) → Gárgola Vigilante (`gargola_raro.png`) → Gárgola Ancestral de Piedra (`gargola_epico.png`)
- **gigante**: Joven Gigante (`gigante_infrecuente.png`) → Gigante de las Colinas (`gigante_raro.png`) → Gigante de las Montañas Rotas (`gigante_epico.png`)
- **ogro**: Ogro Pequeño (`ogro_comun.png`) → Ogro Garrotero (`ogro_infrecuente.png`) → Gran Ogro del Pantano (`ogro_raro.png`)
- **satirosalvaje**: Sátiro Salvaje (`satirosalvaje_comun.png`) → Sátiro del Bosque Profundo (`satirosalvaje_infrecuente.png`) → Señor de los Sátiros Salvajes (`satirosalvaje_raro.png`)
- **troll**: Troll de Puente Menor (`troll_infrecuente.png`) → Troll de las Cavernas (`troll_raro.png`) → Gran Troll Regenerador (`troll_epico.png`)
- **estirge**: Estirge Menor (`estirge_comun.png`) → Estirge Sedienta (`estirge_infrecuente.png`) → Enjambre de Estirges (`estirge_raro.png`)
- **ondina**: Ondina Menor (`ondina_infrecuente.png`) → Ondina de las Corrientes (`ondina_raro.png`) → Gran Ondina del Río Eterno (`ondina_epico.png`)
- **zombi**: Zombi Recién Alzado (`zombi_comun.png`) → Zombi Putrefacto (`zombi_infrecuente.png`) → Zombi Alfa de la Horda (`zombi_raro.png`)
- **banshee**: Banshee Susurrante (`banshee_infrecuente.png`) → Banshee Lamentosa (`banshee_raro.png`) → Gran Banshee, Heraldo de la Muerte (`banshee_epico.png`)
- **lamia**: Lamia Joven (`lamia_infrecuente.png`) → Lamia Serpentina (`lamia_raro.png`) → Reina Lamia del Oasis Maldito (`lamia_epico.png`)
- **hombrearena**: Remolino de Arena (`hombrearena_comun.png`) → Hombre de Arena (`hombrearena_infrecuente.png`) → Señor de las Dunas Eternas (`hombrearena_raro.png`)
- **babosa**: Babosa Pequeña (`babosa_comun.png`) → Babosa Gigante (`babosa_infrecuente.png`) → Reina Babosa del Pantano (`babosa_raro.png`)
- **sapo**: Renacuajo (`sapo_comun.png`) → Sapo Venenoso (`sapo_infrecuente.png`) → Gran Sapo del Pantano Sagrado (`sapo_raro.png`)
- **serpiente**: Serpiente Joven (`serpiente_comun.png`) → Serpiente Venenosa (`serpiente_infrecuente.png`) → Gran Serpiente del Desierto (`serpiente_raro.png`)
- **setahumanoide**: Seta Pequeña (`setahumanoide_comun.png`) → Seta Humanoide (`setahumanoide_infrecuente.png`) → Gran Seta Ancestral del Bosque (`setahumanoide_raro.png`)
- **frankenstein**: Criatura Recién Cosida (`frankenstein_infrecuente.png`) → Criatura de Frankenstein (`frankenstein_raro.png`) → Monstruo Perfeccionado (`frankenstein_epico.png`)
- **hombreseisbrazos**: Aprendiz de Seis Brazos (`hombreseisbrazos_infrecuente.png`) → Guerrero de Seis Brazos (`hombreseisbrazos_raro.png`) → Maestro de las Seis Espadas (`hombreseisbrazos_epico.png`)
- **insectogigante**: Insecto Pequeño (`insectogigante_comun.png`) → Insecto Gigante (`insectogigante_infrecuente.png`) → Enjambre Alfa (`insectogigante_raro.png`)
## Sprites no-personaje pendientes de pedir (15)

Lista inicial (se ampliará según haga falta):
- Fondos de zona/escenario (uno por zona del mapa, estilo D.o.T.: bosque,
  pantano, cuevas, picos, ruinas, guarida del dragón, + zonas nuevas)
- Tiles/props de recorrido de escenario (camino, obstáculos, marcadores de
  combate en el recorrido)
- Efectos de impacto por elemento (fuego, agua, tierra, rayo, viento) para
  golpes normales y ultis
- Icono/insignia por tier (Común/Infrecuente/Raro/Épico/Legendario) para
  criaturas y objetos
- Icono de "Nuevo" para luchadores recién obtenidos
- Animación/efecto de evolución (fusión manual)
- Animación de invocación x10 (destello por cristal, o similar)
- Iconos de objetos curativos/revividores de la tienda
- Icono de habilidad de líder de banda

## Pendiente — ronda de feedback tras el selector de línea por deslizamiento (28/08)

Ocho puntos que el usuario pidió anotar e ir implementando, tras probar el
selector de línea nuevo y la posición real en el campo:

- [x] **1. Imagen por objeto de equipo**: nuevo `gearIcon(gear, sizePx)` en
      `ui.js` — mismo patrón que criaturas/escenario, `<img>` apuntando a
      `assets/gear/<tipo>.png` (un archivo por cada uno de los 18 tipos de
      `GEAR_SLOTS[slot].types`, el nombre del tipo ya es único en todo el
      juego) con `onerror` que sustituye por un icono generado por código
      (el emoji del tipo, ya existente en `data.js`, sobre fondo con el
      color de su rareza) hasta que se suba el archivo real. Aplicado en
      doll-slots de la ficha de luchador, selector de equipar, inventario
      de Equipo, ficha de un objeto y fila de cada slot en la Tienda.
      Verificado en vivo: cae en el respaldo procedural correctamente al
      no existir aún el archivo
- [x] **2. Combate siempre horizontal**: confirmado que era justo lo
      contrario de lo que quería el usuario — se revierte "posición real
      en el campo" (27/08): el combate en sí siempre muestra la fila
      horizontal elijas la línea que elijas; la rejilla del selector de
      línea (deslizar) sigue siendo espacial, eso no cambia. Verificado
      en vivo: eligiendo la diagonal, el combate se sigue viendo en fila
- [x] **3. Carga de ulti en el selector**: cada celda ocupada de la rejilla
      3×3 del selector ahora muestra `ultTurnsText(unit)` (mismo texto que
      ya se usa en combate, p.ej. "⚡ 4" o "⚡ ¡LISTA!") debajo del icono.
      Verificado en vivo
- [x] **4. Quitado duplicado encima del selector**: `UI.renderClashPreview`
      ya no rellena `#playerQueuedRows` antes de mostrar el selector (esa
      información ya la da la propia rejilla) — se deja vacío hasta que
      `commitGroup` rellena el banquillo real ya dentro del combate.
      Verificado en vivo: vacío mientras el selector está abierto
- [x] **5. Líneas usadas tachadas**: al abrir el selector se dibuja un
      overlay SVG con una raya roja sobre cada línea viva ya usada este
      ciclo (`alivePlayerGroups(view).filter(g => g.usedThisCycle)`) —
      la lógica de que vuelvan a estar disponibles solo cuando se han
      usado TODAS las líneas vivas ya existía (`resolveAvailableGroups`),
      esto solo añade la señal visual que faltaba. Verificado en vivo:
      tras usar la columna 1, aparece una raya vertical roja sobre ella
- [x] **6. Toda ulti golpea al rival**: `mult` subido en las ultis de daño
      puro para que se note claramente más fuerte que un golpe normal
      (golpe 2.0→2.2, furia 1.5→2.0, arrasar 1.05→1.5, veneno 1.1→1.5,
      drenar 1.4→1.8). Nuevo campo `bonusHitMult: 0.85` en las 8 ultis
      que no son de daño puro (curar, bendición, escudo, grito, debilitar,
      aturdir, purificar, revivir) — `applyUltBonusHit` en `combat.js` las
      hace golpear también a un enemigo (el mismo objetivo si ya tenían
      uno por su efecto, como debilitar/aturdir; si no, uno nuevo), incluso
      si el efecto propio no tuvo a quién aplicarse (p.ej. revivir sin
      nadie caído). Ningún turno de ulti se queda ya sin hacer daño.
      Verificado en vivo
- [ ] **7. Curarse en el recorrido del mapa**: revisado el código — la
      curación mid-recorrido YA EXISTE y funciona (`UI.useStageRunItem`,
      botones de poción/pluma fénix en `UI.renderStageRun` cuando hay daño
      o algún caído), verificado con una prueba forzando daño simulado:
      los botones aparecen y curan correctamente. Sin poder reproducir el
      problema, puede que el usuario se refiera a otra cosa (¿curar sin
      tener pociones? ¿poder curar desde el Mapa sin entrar en un
      recorrido?) — pendiente de que el usuario aclare qué falta
      exactamente
- [x] **8. Vista previa pre-combate en Formación**: `.stage-run-band` (la
      fila de tu equipo antes de pulsar "Luchar") pasa de listar los
      luchadores seguidos a un bucle `r`/`c` que recorre la Formación 3×3
      real, con huecos vacíos donde no hay nadie colocado (`visibility:
      hidden` para no romper la forma). Verificado en vivo con una banda
      en diagonal: la vista previa muestra exactamente "X.. / .X. / ..X"

## Pendiente — segunda ronda de feedback con capturas (28/08)

Cinco puntos más, con capturas de pantalla reales del usuario jugando:

- [x] **1. Carga de ulti superpuesta a la foto**: la insignia "⚡ N" ya no
      va en una barra separada debajo de la tarjeta de combate — se
      superpone como insignia (fondo oscuro, borde dorado) en la esquina
      superior derecha de la propia foto del personaje, tanto en el
      combate como al elegir línea. Tarjeta más compacta y legible
- [x] **2. Vista previa pre-combate con el mismo estilo de cuadrados**:
      `.stage-run-fighter` pasa de icono suelto a un cuadrado con borde
      (mismo estilo que `.picker-cell`/`.doll-slot`) con la barra de vida
      debajo, dentro del propio cuadrado — ya no es solo un icono con una
      rayita de vida al lado
- [x] **3. Quitadas las combinaciones restantes debajo de tus personajes
      en combate**: `UI.commitGroup` ya no rellena `#playerQueuedRows`
      con la lista de líneas vivas que aún quedan por usar — esa
      información ya se ve, si hace falta, en la propia rejilla del
      selector la próxima vez que toque elegir
- [x] **4. Una foto por cada objeto de equipo (tipo + rareza)**: hasta
      ahora `gearIcon()` apuntaba a `assets/gear/<tipo>.png` (una imagen
      por tipo, compartida entre las 5 rarezas — de ahí que "en arma
      salga una daga" para todo). Ahora apunta a
      `assets/gear/<tipo>_<rareza>.png`: 18 tipos × 5 rarezas = 90
      imágenes posibles, mismo nivel de detalle que las criaturas por
      evolución. Los 5 botones de compra de cada hueco en la Tienda
      también muestran ya la foto real de esa rareza concreta (del tipo
      representativo del hueco) en vez de un icono de color genérico
- [x] **5. Animación distinta para invocación Legendaria**: además del
      resplandor ya existente, ahora un Legendario en Invocar (tanto x1
      como en el carrusel x10) tiene: un anillo de rayos dorados girando
      detrás del retrato (`legendary-burst`), una explosión de 6 chispas
      que salen disparadas alrededor (`legendary-spark`), y un destello
      de luz al aparecer (`legendaryFlash`, un pico de brillo). En el
      carrusel x10 también se queda 1.8s en pantalla en vez de 0.9s, para
      que dé tiempo a apreciarlo
- [x] **Arte real para mobs y jefes** (28/08): el usuario preguntó cómo
      subir fotos a los mobs (`MOBS`, los rivales de relleno del mapa) y
      a los jefes (`BOSSES`) — hasta ahora `addMobFamily`/`addBoss` no
      tenían la capacidad de `hasImages` que ya tenía `addFamily` desde
      hace tiempo, así que sus fichas siempre usaban el sprite
      procedural por mucho arte que se subiera. Añadido el mismo
      mecanismo:
      - `addMobFamily(..., hasImages)`: con `true`, la familia usa
        `assets/creatures/<slug>_<rareza>.png` (una por cada una de sus
        3 formas, igual que las criaturas jugables)
      - `addBoss(..., rarity, hasImage)`: con `true`, usa
        `assets/creatures/<slug>.png` — un jefe no tiene evoluciones, así
        que solo necesita UNA imagen, sin sufijo de rareza
      Mismo flujo de trabajo que con los personajes: subir el/los
      archivo(s) a `assets/creatures/` y añadir `true` como último
      argumento en la llamada correspondiente de `data.js`. Verificado
      con un script: las llamadas existentes sin el flag siguen sin
      `image` (comportamiento idéntico a antes), y una llamada nueva con
      el flag genera el nombre de archivo esperado en ambos casos
- [x] **Descripción única por evolución en MOBS** (28/08): el usuario avisó
      que los mobs enemigos (`MOBS`) tenían el mismo problema que antes
      tenían los personajes jugables — `addMobFamily` solo aceptaba una
      frase base por familia y le pegaba el mismo sufijo genérico de
      `TIER_LORE_SUFIX[tier][i]` a las 3 evoluciones, así que la 2ª y 3ª
      forma de cada familia de mob compartían el mismo texto de relleno
      que todas las demás familias de su tier. Arreglado exactamente igual
      que se hizo en su día con `addFamily`:
      - `addMobFamily(slug, tier, element, cls, skillId, names, lores,
        hasImages)` ahora acepta `lores` como un array de 3 frases (una
        por evolución), manteniendo compatibilidad con el string único +
        sufijo genérico si se le pasa así
      - Redactadas 2 frases nuevas y propias (evolución intermedia y
        final) para las 33 familias de `MOBS` existentes: arpía,
        dullahan, tengu, goblin, trasgo, demonio, esqueleto, draugr,
        chupacabra, kitsune, momia, orco, dementor, araña, jabalí,
        gárgola, gigante, ogro, sátiro salvaje, troll, estirge, ondina,
        zombi, banshee, lamia, hombre de arena, babosa, sapo, serpiente,
        seta humanoide, Frankenstein, hombre seis brazos e insecto
        gigante
      Verificado con un script headless: 99 `MOBS` en total (33 familias
      × 3 formas), cero lores duplicados dentro de cada familia, cero
      familias con un número de fichas distinto de 3

## Notas

- Las imágenes de referencia del D.o.T. real que se mencionaban en los puntos
  12 y 13 (pendientes durante varias iteraciones) ya llegaron y están
  guardadas en `reference/dot-original/` para no tener que volver a pedirlas:
  `signos-ayuda-1.jpg`/`signos-ayuda-2.jpg` (los 5 signos elementales y su
  círculo de ventajas), `tribu-tipo-ayuda.jpg` (los 5 tipos: Champ/Guru/
  Rogue/Scout/Warlock, con su perfil de stats), `recompensa-post-combate.jpg`,
  `encuentro-enemigo.jpg`, `recorrido-escenario.jpg`, `combate-formacion-3x3.jpg`
  y `combate-elegir-linea.jpg`. Con esto quedan desbloqueados los puntos de
  "pulido visual" y el sistema de tipos/tribus — solo falta decidir cuándo
  abordarlos (son sistemas grandes, ver más arriba).
