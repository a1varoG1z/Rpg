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
- [x] Revisar si hace falta ampliar el número de **elementos** (ahora 5:
      Fuego/Viento/Tierra/Rayo/Agua) — el usuario preguntó, respuesta dada
      en el chat (probablemente no hace falta, el círculo de 5 con ventajas
      ya es el sistema real de D.o.T.) — pregunta cerrada, sin acción de
      código pendiente
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
- [x] Más ideas de **personajes nuevos** — el usuario pidió sugerencias,
      dadas en el chat, casi todas ya creadas (25 familias nuevas entre
      las dos tandas del 27/08) — sin acción de código pendiente; se puede
      seguir ampliando si se pide más en el futuro
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
- [x] Revisar si hacen falta más **jefes** o si 33 (uno por zona) es
      suficiente — el usuario preguntó, respuesta dada en el chat —
      pregunta cerrada, sin acción de código pendiente
- [x] Más criaturas jugables de **tier 1** (las que empiezan en Común) — el
      usuario preguntó si hacen falta más; de las 105 familias jugables
      actuales ~27 son tier 1 (~26%), similar proporción que tier 2 y tier 3,
      así que no está especialmente escaso — pregunta cerrada, sin acción de
      código pendiente; se puede seguir añadiendo si se pide más

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
- [x] **Torre infinita**: implementada como el modo **Roguelike** de Retos
      (pedido explícitamente por el usuario) — ver la entrada dedicada más
      abajo, en la sección de la ronda de peticiones sobre Roguelike/TODO/
      balance/sugerencias de modos.
- [ ] **Sinergias de equipo**: bonus de combate si la línea activa elegida
      comparte elemento o clase (p.ej. +10% de daño si los 3 luchadores son
      del mismo elemento) — daría sentido estratégico a cómo se monta la
      Formación más allá de "meter a los más fuertes". Sugerido por Claude
- [ ] **Sets de equipo**: lleva 2-3 piezas del mismo tipo (p.ej. todo
      "rúnico") a la vez y da un bonus extra de estadísticas, para dar más
      profundidad al sistema de equipo (`GEAR_SLOTS`) ya existente.
      Sugerido por Claude

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

### Sprites que faltan por subir en TODO el juego (verificado 02/09)

El juego tiene 3 sistemas de arte distintos, cada uno con su propia
carpeta bajo `assets/` y su propio patrón de nombre de archivo — este es
el estado real de los 3, comprobado contra lo que hay subido de verdad
(no contra lo que dicen las listas más largas de más abajo, que se han
quedado desactualizadas a medida que se subía arte real). Todo lo que
falta cae en la carpeta indicada con el nombre EXACTO entre comillas —
en cuanto el archivo exista con ese nombre, se usa solo, sin tocar código
(cae automáticamente en la imagen real en vez del respaldo procedural o
del color liso).

#### 1. Criaturas (`assets/creatures/`) — 468/468, completo ✅

- [x] `shenlong_legendario.png`, `tengu_comun.png` y `chupacabra_comun.png`
      — las 3 que faltaban, subidas el 02/09.

#### 2. Fondos de escenario (`assets/scenery/`) — 33/33, completo ✅

Las 33 zonas del Mapa tienen ya su `.jpg` (nombrado con el `id` de cada
zona), subidas el 02/09. De paso se arregló que la pantalla de "Etapas"
(la rejilla de 8 números por zona) no llevaba fondo de zona como sí lo
llevan el recorrido de nodos y la tarjeta de zona del Mapa — se le añadió
(`UI.openZoneStages` en ui.js) para que se vea también ahí.

#### 3. Fondos de combate de los modos sin zona propia (`assets/scenery/`) — 7/7, completo ✅

Prueba del Campeón, Mazmorra Elemental y Torre Batalla no pelean dentro de
ninguna zona del Mapa, así que no tenían NINGÚN fondo (ni en su
recorrido/duelo ni en la propia pantalla de batalla). Arreglado en código
(mismo mecanismo `zoneBackgroundStyle` de siempre, vía un nuevo
`runPseudoZone(run)` en `ui.js` para Torre/Mazmorra, y un `zone` fijo
para la Prueba del Campeón) y las 7 imágenes
(`campeon.jpg`, `torre.jpg`, `elemental_fuego/viento/tierra/rayo/agua.jpg`)
subidas el 02/09.
- [ ] `elemental_agua.jpg` — Mazmorra Elemental de Agua

#### 4. Iconos de equipo (`assets/gear/`) — 0/90, faltan los 90

La carpeta `assets/gear/` tampoco existe todavía — todo el equipo usa el
icono de emoji de respaldo sobre un fondo del color de su rareza. Son 18
tipos (3 por cada uno de los 6 huecos) × 5 rarezas = 90 archivos `.png`,
nombrados `<tipo>_<rareza>.png` (el nombre del tipo ya es único en todo
el juego, no hace falta indicar el hueco en el nombre). Rarezas, siempre
en el mismo orden: `comun`, `infrecuente`, `raro`, `epico`, `legendario`.

- [ ] **espada** (Arma): `espada_comun.png`, `espada_infrecuente.png`, `espada_raro.png`, `espada_epico.png`, `espada_legendario.png`
- [ ] **hacha** (Arma): `hacha_comun.png`, `hacha_infrecuente.png`, `hacha_raro.png`, `hacha_epico.png`, `hacha_legendario.png`
- [ ] **lanza** (Arma): `lanza_comun.png`, `lanza_infrecuente.png`, `lanza_raro.png`, `lanza_epico.png`, `lanza_legendario.png`
- [ ] **cota** (Armadura): `cota_comun.png`, `cota_infrecuente.png`, `cota_raro.png`, `cota_epico.png`, `cota_legendario.png`
- [ ] **placas** (Armadura): `placas_comun.png`, `placas_infrecuente.png`, `placas_raro.png`, `placas_epico.png`, `placas_legendario.png`
- [ ] **tunica** (Armadura): `tunica_comun.png`, `tunica_infrecuente.png`, `tunica_raro.png`, `tunica_epico.png`, `tunica_legendario.png`
- [ ] **yelmo** (Casco): `yelmo_comun.png`, `yelmo_infrecuente.png`, `yelmo_raro.png`, `yelmo_epico.png`, `yelmo_legendario.png`
- [ ] **capucha** (Casco): `capucha_comun.png`, `capucha_infrecuente.png`, `capucha_raro.png`, `capucha_epico.png`, `capucha_legendario.png`
- [ ] **diadema** (Casco): `diadema_comun.png`, `diadema_infrecuente.png`, `diadema_raro.png`, `diadema_epico.png`, `diadema_legendario.png`
- [ ] **guantes** (Guantes): `guantes_comun.png`, `guantes_infrecuente.png`, `guantes_raro.png`, `guantes_epico.png`, `guantes_legendario.png`
- [ ] **garras** (Guantes): `garras_comun.png`, `garras_infrecuente.png`, `garras_raro.png`, `garras_epico.png`, `garras_legendario.png`
- [ ] **manoplas** (Guantes): `manoplas_comun.png`, `manoplas_infrecuente.png`, `manoplas_raro.png`, `manoplas_epico.png`, `manoplas_legendario.png`
- [ ] **botas** (Botas): `botas_comun.png`, `botas_infrecuente.png`, `botas_raro.png`, `botas_epico.png`, `botas_legendario.png`
- [ ] **sandalias** (Botas): `sandalias_comun.png`, `sandalias_infrecuente.png`, `sandalias_raro.png`, `sandalias_epico.png`, `sandalias_legendario.png`
- [ ] **grebas** (Botas): `grebas_comun.png`, `grebas_infrecuente.png`, `grebas_raro.png`, `grebas_epico.png`, `grebas_legendario.png`
- [ ] **amuleto** (Amuleto): `amuleto_comun.png`, `amuleto_infrecuente.png`, `amuleto_raro.png`, `amuleto_epico.png`, `amuleto_legendario.png`
- [ ] **anillo** (Amuleto): `anillo_comun.png`, `anillo_infrecuente.png`, `anillo_raro.png`, `anillo_epico.png`, `anillo_legendario.png`
- [ ] **reliquia** (Amuleto): `reliquia_comun.png`, `reliquia_infrecuente.png`, `reliquia_raro.png`, `reliquia_epico.png`, `reliquia_legendario.png`

No hay ningún otro sistema de arte en el juego aparte de estos 3 (se
comprobó cada referencia a `assets/` en todo el código) — la lista
"Sprites no-personaje pendientes de pedir (15)" de más abajo es un
wishlist de ideas futuras (efectos, animaciones...) que todavía no están
enganchadas a ningún código, no forma parte de este recuento.

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
- [x] **Fix: luchadores "desaparecidos" y Formación/orden rotos** (28/08):
      el usuario reportó que no le funcionaba elegir personajes en la
      Formación, ni ordenar la Colección, y que no le salían todos los
      luchadores que tenía, "como si hubieran desaparecido". Causa raíz: el
      propio usuario había borrado a mano 17 familias de `FIGHTERS` desde
      GitHub (ver nota anterior de esta sesión); las copias que ya tenía
      guardadas en su partida (localStorage) de esas familias se quedaron
      con un `defId` que ya no existe en `data.js`. `fighterDef()` devuelve
      `undefined` para ellas, y tanto `sortRosterEntries` (todos los modos
      salvo "reciente") como `creatureCard` leen `def.name`/`def.rarity`/
      etc. sin comprobar antes — bastaba con que UNA ficha de la Colección
      fuera huérfana para que la excepción cortara a mitad el `forEach` que
      pinta la rejilla entera, dejando la Colección vacía o a medias y
      rompiendo el selector de la Formación (mismo `creatureCard`) en
      cualquier orden que no fuera "Más reciente"
      Arreglado en el origen, en `loadGame()` (`state.js`): al cargar la
      partida se retiran ahora del roster las fichas cuyo `defId` ya no
      resuelve a ningún personaje/mob/jefe/homúnculo real, y se limpian
      también los huecos de la Formación que ocuparan (el equipo que
      llevaran puesto no se pierde, solo se queda sin equipar en el
      inventario, listo para ponérselo a otro luchador). Se avisa una vez
      con un toast ("Se ha(n) retirado N luchador(es)...") la primera vez
      que se detecta, para que no parezca un fallo silencioso.
      Verificado con Playwright: partida con 1 luchador válido + 1 huérfano
      (`huldra_comun`, familia borrada) → tras recargar, roster queda en 1,
      el hueco de Formación que ocupaba el huérfano queda vacío, aparece el
      toast de aviso, y los 6 modos de orden de la Colección + el selector
      de la Formación funcionan sin excepción
- [x] **Orden de la ficha de personaje: Historia antes que Homúnculos**
      (28/08): a petición del usuario, en `UI.openFighterModal` el panel
      "📜 Historia" (el lore de esa forma concreta) ahora se pinta justo
      debajo de la cabecera (retrato + nombre/rareza/nivel), antes que el
      panel "🧪 Homúnculos" — antes iba después de Homúnculos, Estadísticas
      y Ulti
- [x] **Fix: rejillas de selección de luchador desbordaban el modal**
      (28/08): captura de pantalla del usuario mostrando el panel
      "Sustituir por" (dentro de la ficha de un luchador colocado en la
      Formación) con la 3ª columna de cada fila cortada por el borde del
      modal — "está descuadrado, no cabe bien". Causa: `.picker-grid` (y
      `.creature-grid`, `.stage-grid`, `.item-grid`, que comparten el mismo
      patrón) usaban `grid-template-columns: repeat(N, 1fr)` sin
      `minmax(0, ...)` — con nombres largos de luchador (p.ej. "Titán de
      las Corrientes", "Señor del Maelström") el ancho mínimo de contenido
      de una columna podía superar el ancho disponible, y sin un límite de
      0 la rejilla entera crecía más allá del modal en vez de encogerse,
      desbordando visualmente por la derecha (el modal solo recorta
      overflow vertical, no horizontal). Arreglado: las 4 rejillas ahora
      usan `repeat(N, minmax(0, 1fr))`, más `min-width: 0` en
      `.creature-card` y `overflow-wrap: break-word` en `.creature-name`
      como refuerzo para que una palabra larga se ajuste dentro de la
      tarjeta en vez de forzar su ancho. Verificado con Playwright a 360px
      de ancho de viewport (Android estrecho típico) con los mismos
      luchadores del pantallazo (Titán de las Corrientes, Señor del
      Maelström) llenando las 5 tarjetas candidatas del panel: ninguna
      sobresale del borde del modal
- [x] **Fix: carga de ulti invisible en el selector de línea del combate**
      (28/08): el usuario avisó que, tras el cambio anterior que superpuso
      la carga de ulti a la foto del personaje en las tarjetas de la fila
      de batalla, seguía sin verse bien en la rejilla 3×3 de "Desliza para
      elegir 1 línea" — la captura mostraba las 9 celdas sin ningún
      indicador visible de carga. Causa: `.picker-cell-ult` (a diferencia
      de `.ult-turns` en `.battle-unit-canvas-wrap`, ya arreglado antes)
      seguía con el estilo antiguo: texto plano de 0.48rem sin fondo,
      pegado al borde inferior de la celda, encima o detrás del arte del
      personaje — prácticamente ilegible, sobre todo con arte real de
      colores similares. Arreglado con el mismo tratamiento que ya
      funciona en la fila de batalla: ahora es una píldora con fondo
      oscuro semitransparente, borde dorado y texto en negrita, anclada en
      la esquina superior derecha de cada celda (`top:-6px; right:-6px;
      z-index:3`) para no taparse con el propio retrato. Verificado con
      capturas de Playwright: se ve con claridad tanto sobre sprites
      procedurales como sobre arte real ya subido (arpía, dullahan,
      goblin)
- [x] **Guía del juego** (28/08): el usuario preguntó qué significaban los
      avisos de vulnerabilidad de tipo en la ficha de un luchador ("cruce
      entre Campeón y Gurú...", "vulnerable a ataques mágicos") y pidió un
      botón de guía en Ajustes con una guía completa de las mecánicas
      actuales (combate, estadísticas, ultis, tipos, bonificaciones...).
      Añadido `UI.openGuide()` — nuevo modal `#guideModal`, botón "📖 Guía
      del juego" al principio de Ajustes — con 9 secciones de referencia
      estática (no depende de la partida, es la misma para cualquiera):
      Elementos (círculo de ventajas ±25%/-20%), Clases/Tribus (rol de
      cada una + su vulnerabilidad de tipo, y qué cuenta como daño
      "mágico" vs "físico" — solo las ultis de fila como Arrasar usan
      Sabiduría y cuentan como mágicas, todo lo demás es físico y usa
      Ataque), Estadísticas (qué hace cada una: HP/ATK/DEF/AGI/WIS, crítico
      ×1.5, varianza ±10%), Rareza y evolución (5 escalones, Fusión/SEF,
      Superfusión +8% por estrella hasta 3), Nivel/XP/Homúnculos, Ultis
      (carga, los 10 tipos de ulti que existen, el golpe extra de las que
      no hacen daño por sí mismas), Formación y combate (líder, las 8
      líneas, cómo se tachan al usarse), Equipo (6 huecos, 18 tipos, cómo
      reparten sus bonificaciones) y Progreso (Pokédex/Jefes/Objetivos).
      Verificado con Playwright: se abre sin errores desde Ajustes, las 9
      secciones se pintan, y no hay desbordamiento horizontal ni siquiera
      a 360px de ancho de viewport
- [x] **Fix: la Guía se abría detrás de Ajustes** (28/08): el usuario avisó
      que al pulsar "Guía del juego" desde Ajustes, el modal de la Guía se
      pintaba POR DEBAJO del modal de Ajustes en vez de encima — había que
      cerrar Ajustes primero para poder leerla. Causa: todos los `.modal`
      comparten el mismo z-index; sin una diferencia explícita, quien esté
      más abajo en el HTML se pinta encima cuando dos están abiertos a la
      vez, y `#guideModal` estaba declarado ANTES que `#settingsModal` en
      `index.html`. Arreglado moviendo el bloque de `#guideModal` a justo
      después de `#settingsModal` en el HTML. Verificado con Playwright:
      con Ajustes y Guía abiertos a la vez, el elemento que recibe el click
      en la zona del botón de cerrar es ahora el de la Guía, y cerrarla
      deja Ajustes debajo sin cerrarlo también
- [x] **Torre Batalla** (28/08): nuevo modo endgame pedido por el usuario —
      se desbloquea al completar el mapa entero, y el objetivo es capturar
      como jugables a los mobs y jefes del mapa. Antes de implementar se
      preguntaron 4 dudas de diseño (niveles por familia vs. por forma,
      contra qué tier se lucha, si son 100% jugables o solo de Pokédex, y
      dónde vive en la interfaz) — respuestas: por familia, la forma más
      fuerte, 100% jugables, y pestaña nueva en la barra inferior.
      - **Escalera** (`buildTorreLevels()` en `data.js`, `TORRE_LEVELS`):
        66 niveles — uno por cada una de las 33 familias de `MOBS`, luego
        uno por cada uno de los 33 `BOSSES`, ordenados por la zona del
        mapa en la que aparecen por primera vez (el último es el jefe de
        la última zona, como pidió el usuario). Cada nivel enfrenta
        siempre a la forma MÁS FUERTE de esa familia (o al jefe), y da
        como recompensa 1 copia del tier MÁS BAJO de esa familia (o del
        jefe) — el jugador la sube él mismo con Fusión/Evolución normal.
        Rivales y dificultad reutilizan el mismo cálculo ya calibrado de
        `buildEnemyBand` (nivel tope 40, capado) atado a la zona de origen,
        sin inventar una escala nueva. Nº de rivales por nivel: crece cada
        8 escalones de su propia escalera (mobs en filas de hasta 3 a la
        vez, de 3 a 12; jefes SIEMPRE en solitario en oleadas sucesivas —
        nunca en compañía, ver `makeBossUnit` — de 1 a 5).
      - **100% jugables**: gana un nivel de Torre y usa exactamente
        `applySummonResult()`, la misma función que ya usa una invocación
        normal — la copia entra al roster con uid propio, se puede
        colocar en la Formación, equipar, fusionar/evolucionar (Fusión y
        Superfusión incluidas) y vender, sin ningún camino especial. Los
        niveles son rejugables para conseguir más copias (útiles como
        material de Fusión).
      - **Desbloqueo secuencial**: nivel 1 siempre abierto; cada uno más
        se abre en cuanto se supera el anterior al menos una vez (igual
        que las etapas de una zona), y se queda abierto para siempre.
        `state.torre.clears` (clave = familia o id de jefe) lleva la
        cuenta de cuántas veces se ha superado cada uno.
      - **Pantalla nueva**: pestaña "🗼 Torre" en la barra inferior (7ª,
        antes eran 6) con una lista de las 33 familias de mob y los 33
        jefes, mostrando nivel/rareza del rival, nº de copias y "supera el
        nivel anterior" mientras esté bloqueado. Reutiliza el mismo
        recorrido nodo-a-nodo que una etapa normal del Mapa
        (`UI.renderStageRun`/`UI.fightStageRunNode`, con ramas `run.isTorre`
        para el título/recompensa) en vez de duplicar esa pantalla entera.
      - **Pokédex ampliada**: como pedía el usuario ("hay que añadirlos a
        la pokédex"), `UI.openPokedex` ahora tiene una segunda sección
        "🗼 Torre Batalla" con los 99 `MOBS` + 33 `BOSSES`, con el mismo
        formato de fichas bloqueadas/"???" que ya tenía la sección de
        personajes jugables — aparte del contador principal, porque son
        dos sistemas de desbloqueo distintos (invocación vs. Torre).
      - **Ajustes**: toggle "🗼 Torre Batalla (modo de prueba)" para
        habilitarla en cualquier momento sin tener que completar el mapa
        primero, pedido explícitamente para poder probarla.
      - **Fix de arquitectura necesario**: `#stageRunView` vivía anidado
        dentro de `#screen-mapa`, así que abrir un nivel de Torre desde la
        pestaña Torre se quedaba invisible (su ancestro `.screen` no
        activo lo ocultaba igual, aunque su propia clase `.hidden` se
        hubiera quitado). Se movió fuera de cualquier `.screen`, como
        elemento de nivel superior con su propio `position:fixed` (igual
        que ya hace `#battleOverlay`, con z-index por debajo para que la
        Batalla siga abriéndose por encima) — funciona igual desde el
        Mapa que desde la Torre.
      Verificado extensamente con Playwright: escalera de 66 niveles bien
      generada y ordenada; nivel de mob (1 oleada) y dos niveles de jefe
      (1 y 2 oleadas sucesivas) superados con victoria, recompensa y copia
      correctas; desbloqueo del siguiente nivel confirmado; Pokédex con
      las dos secciones y el conteo correcto (132 = 99+33); la copia
      capturada colocada en la Formación genera una unidad de combate
      válida con estadísticas correctas; y el recorrido normal del Mapa
      sigue funcionando igual tras mover `#stageRunView`. Sin
      desbordamiento horizontal en la nueva pantalla ni en la barra de 7
      pestañas a 360px de ancho
- [x] **Barra de vida en el selector de línea del combate** (29/08): el
      usuario pidió que se viera la vida que le queda a cada luchador
      también en la rejilla 3×3 de "Desliza para elegir 1 línea" (antes
      solo se veía en la fila de batalla de arriba, no en el propio
      selector de abajo). Añadida una `.hp-bar.small` bajo cada celda
      ocupada, junto a la píldora de carga de ulti que ya tenía. Al
      añadirla apareció un problema de apilamiento (z-index): el círculo
      claro de fondo tras el retrato (`.creature-canvas-wrap::before`) la
      tapaba por completo y quedaba invisible — arreglado dándole
      `position: relative; z-index: 1` explícito a la barra. También se
      subió la altura de la celda (58px → 66px) y se pasó su layout a
      columna para que quepan holgados el retrato, la píldora y la barra.
      Verificado con capturas de Playwright con distintos niveles de vida
      simulados por celda: la barra se ve con claridad, y sigue sin haber
      desbordamiento horizontal ni a 340px de ancho de viewport
- [x] **Combate automático, aviso de ventaja elemental y habilidades de
      jefe** (29/08): tres mejoras de combate pedidas por el usuario tras
      preguntarle sugerencias.
      - **Botón "🤖 Auto"** (junto a "Saltar »" en la cabecera de la
        Batalla): resuelve la batalla entera sin elegir línea a mano —
        cada vez que tocaría mostrar el selector, `UI.promptNextClash`
        elige sola la línea con mejor ventaja elemental media
        (`pickAutoGroup`/`rowElementScore` en `combat.js`) y sigue
        jugando. Se recuerda entre combates (`UI.autoBattleEnabled`, igual
        que el orden de la Colección) para no tener que reactivarlo en
        cada nodo de un recorrido o nivel de Torre — es un "déjalo jugar
        solo" para todo el recorrido, no un combate suelto. Se puede
        activar/desactivar en cualquier momento, incluso a mitad de un
        combate.
      - **Aviso de ventaja elemental**: cada personaje del selector de
        línea ahora muestra ▲ verde o ▼ rojo si tiene ventaja o
        desventaja elemental clara contra la fila enemiga activa
        (`unitElementScore` en `combat.js`, mismo criterio que usa el
        combate automático para elegir), sin icono si es neutro. Se ve el
        propio pantallazo del usuario del punto anterior para confirmar
        que hacía falta este aviso.
      - **Habilidades propias de jefe**: hasta ahora un jefe combatía
        exactamente igual que cualquier otro rival de su clase — dos
        mecánicas EXCLUSIVAS de `makeBossUnit` (nunca de un mob normal,
        marcadas con `u.isBoss`):
        - **Furia**: al bajar del 30% de su vida (`BOSS_ENRAGE_HP_PCT`),
          gana +25% de Ataque y Sabiduría para el resto del combate — un
          único disparo (`maybeTriggerEnrage`, revisado tanto en golpes
          normales como en veneno/quemadura). Deliberadamente TARDÍO y
          MODESTO: con el ×2.4 de vida que ya tiene un jefe (ver el
          comentario de `makeBossUnit`) tarda varias rondas en llegar
          ahí, y no reintroduce el bug de balance ya arreglado antes (un
          jefe con demasiado ataque desde el turno 1 podía ganarle a una
          banda entera de Legendarios).
        - **Golpe Devastador**: cada 4º golpe BÁSICO suyo (no ulti) es un
          crítico garantizado y algo más fuerte (×1.6 en vez de ×1) —
          `computeDamage` ganó un parámetro `forceCrit` para esto. Dos
          eventos de log nuevos (`enrage`/`bossattack`) con su propia
          línea en el registro de combate.
      Verificado con Playwright: 3 luchadores de agua muestran ▲ y 6 de
      viento muestran ▼ contra un rival de fuego (círculo de ventajas
      correcto); una batalla completa se resuelve sola con "Auto"
      activado sin que el selector de línea llegue a aparecer nunca; un
      jefe de prueba dispara Furia exactamente una vez al cruzar el 30% de
      vida (+25% ataque/sabiduría exactos) y Golpe Devastador cada 4º
      golpe básico (7 veces en 30 golpes básicos de 40 turnos, con 10
      turnos de ulti intercalados); un mob normal nunca dispara ninguna de
      las dos mecánicas
- [x] **Historial de combate y filtro de la Colección** (29/08): dos
      mejoras que Claude había sugerido y el usuario pidió implementar.
      - **Resumen post-combate** (`battleStatsSummaryHtml` en `ui.js`):
        cada pantalla de resultado de un combate (encuentro intermedio,
        victoria o derrota — no solo al ganar del todo) añade un panel
        "📊 Resumen del combate" con daño total hecho, daño total
        recibido, curación (si hubo) y el luchador MVP (más daño, con las
        bajas rivales que se le atribuyen pesando en el desempate). Se
        acumula en `view.battleStats` a lo largo de TODO el combate (todas
        las líneas/oleadas de un mismo `UI.openBattle`, no se resetea
        entre choques) desde `UI.applyBattleEvent`. Las bajas se
        atribuyen gracias a un `killerId` nuevo en el evento `faint` que
        genera `applyDamage` en `combat.js`.
      - **Filtro de la Colección**: 3 `<select>` nuevos bajo el de orden
        ("Ordenar por") — elemento, clase y rareza, poblados dinámicamente
        desde `ELEMENT_ORDER`/`CLASS_INFO`/`RARITIES` (nada duplicado a
        mano) — que se combinan entre sí (`UI.rosterFilter`,
        `rosterMatchesFilter`) antes de ordenar y pintar `#rosterGrid`. Un
        texto pequeño avisa cuántos luchadores se están mostrando cuando
        el filtro reduce la lista, o que ninguno coincide.
      Verificado con Playwright: filtrar por elemento+rareza a la vez deja
      solo la tarjeta esperada, y el aviso de "ninguno coincide" aparece
      cuando la combinación no tiene resultados; una batalla completa
      (auto-combate, 2 oleadas) termina mostrando daño hecho/recibido y el
      MVP correctos; sin desbordamiento horizontal en la fila de 3
      filtros ni a 340px de ancho de viewport
- [x] **Mazmorra Elemental** (29/08): nuevo modo de mitad de partida, idea
      que Claude había sugerido y el usuario pidió implementar, calculando
      a partir de qué punto de la partida desbloquearla para que quede
      balanceado.
      - **Desbloqueo** (`elementalDungeonUnlocked` en `state.js`): al
        completar las 6 zonas ORIGINALES del mapa (hasta desbloquear
        `cantera`, la 7ª) — mucho antes que Torre Batalla, que pide el
        mapa entero. Se eligió ese punto porque antes el roster invocado
        normalmente no tiene todavía 3 copias del mismo elemento para
        formar equipo, y porque para entonces el nivel de rival ya está
        topado en 40 de todas formas (el mismo cálculo que ya usa
        `buildEnemyBand`), así que no tiene sentido desbloquearlo antes.
        Toggle de prueba "🌋 Mazmorra Elemental" en Ajustes para saltarse
        la condición, igual patrón que ya tenía Torre Batalla.
      - **5 mazmorras, una por elemento** (`ELEMENTAL_DUNGEONS` en
        `data.js`, calculado con `buildElementalDungeons()`): cada una
        poblada por el elemento que CONTRARRESTA al elegido en el círculo
        de ventajas (`findCounterElement`) — una mazmorra de Fuego
        enfrenta a un equipo de fuego contra enemigos de Agua, con la
        desventaja elemental de partida que eso conlleva (-20% de daño
        hecho, +25% de daño recibido) a propósito: un reto real de nivel y
        equipo, no un farm cómodo. 2 oleadas de relleno (la forma más
        fuerte de 2 familias de `MOBS` de ese elemento contrario) + un
        Guardián Elemental final en solitario (un `BOSS` de ese elemento).
      - **Equipo de hasta 3, no la Formación completa**: a diferencia del
        Mapa/Torre (que usan la Formación 3×3 y sus 8 líneas), aquí el
        jugador elige directamente hasta 3 luchadores del elemento exacto
        (`UI.openElementalTeamPicker`, mismo patrón de multi-selección que
        el material de Fusión) — se guardan en `state.elementalTeams` para
        la próxima vez, editables siempre. Al combatir se genera un único
        grupo (`buildElementalTeamUnits`), así que nunca hay selector de
        línea que elegir — se autoconfirma solo, igual que cuando a una
        etapa normal ya solo le queda una combinación viva.
      - **Recompensa**: más generosa que una etapa normal de esa misma
        zona (`elementalDungeonRewards` en `combat.js`) y con una pieza de
        equipo SIEMPRE garantizada (no al azar como las etapas normales),
        para compensar la dificultad de la desventaja elemental.
      - **Pantalla**: vive en la misma pestaña que Torre Batalla (renombrada
        de "Torre Batalla" a "Retos" en la barra inferior/cabecera, ya que
        ahora aloja dos modos), como sección aparte arriba del todo, ya que
        se desbloquea mucho antes.
      - **Refactor necesario para reutilizar el recorrido nodo-a-nodo**:
        `UI.renderStageRun`/`UI.useStageRunItem` asumían que el equipo
        que combate es siempre `state.band` (la Formación); ahora usan un
        `runFighterUids(state, run)` que resuelve a la Formación normal o
        al equipo mono-elemento según el tipo de recorrido, con una vista
        de una sola fila (sin huecos de la Formación 3×3) para el caso
        mono-elemento.
      - **Fix encontrado con las pruebas**: el botón "Continuar" de después
        de UNA VICTORIA (no una derrota ni un encuentro intermedio) seguía
        comprobando solo `run.isTorre` para decidir volver a "Retos" en
        vez de `UI.openZoneStages(state, run.zoneIdx)` — con
        `run.isElemental` (que no tiene `zoneIdx`) esto rompía al terminar
        la mazmorra con victoria. Arreglado añadiendo la misma condición
        `run.isTorre || run.isElemental` que ya tenían el resto de sitios.
      Verificado extensamente con Playwright: bloqueada/desbloqueada según
      el ajuste; el selector de equipo filtra correctamente por elemento
      (3 candidatos de fuego, ninguno de agua) y guarda la selección;
      arrancar la mazmorra usa SOLO el equipo elegido (no arrastra
      luchadores de la Formación principal); enemigo confirmado del
      elemento contrario correcto; recorrido completo (2 oleadas + Guardián)
      superado con victoria, Texel/XP/equipo garantizado y contador de
      superaciones correctos; una derrota (equipo débil a propósito) no da
      ninguna recompensa y vuelve a "Retos" sin errores; el recorrido
      normal del Mapa y Torre Batalla siguen funcionando igual tras el
      refactor de `runFighterUids`; sin desbordamiento horizontal a 360px
  - [x] **Prueba del Campeón, Mercader Itinerante, Duelo por apuesta y
    control de velocidad de combate** (4 funcionalidades pedidas juntas):
    - **Prueba del Campeón** (sección Retos, siempre disponible desde el
      principio — no necesita desbloqueo ni profundidad de roster, solo 1
      luchador): se elige un único luchador de la Colección que encadena
      duelos 1 contra 1 cada vez más difíciles, SIN curarse ni recargar
      ulti entre ellos — perder termina el intento ahí donde esté. El
      rival de cada duelo se genera al vuelo (`buildChampionOpponent` en
      combat.js): nivel `1 + 1.5×duelo` (tope de nivel normal del juego) y
      probabilidad creciente de rareza Épica/Legendaria según el duelo. Se
      guarda la mejor racha conseguida (`state.champion.bestStreak`) y da
      Texel/XP crecientes por duelo ganado (`championDuelRewards`). Usa un
      run propio (`window.__championRun`, con `uid/duelIdx/hp/ultCharge`)
      en vez de reutilizar `window.__stageRun`, porque no es un recorrido
      de nodos con encuentros fijos sino una cadena potencialmente
      indefinida de duelos generados uno a uno; `UI.fightChampionDuel` se
      relanza sola desde `battleCloseBtn` mientras la racha siga viva.
    - **Mercader Itinerante** (sección Tienda, panel superior): una oferta
      diaria determinista (sin servidor: semilla = hash de la fecha local,
      `merchantOffer()` en data.js) que cambia N copias sueltas de una
      rareza por una pieza de equipo de la rareza siguiente o por cristales
      — solo se puede canjear una vez al día
      (`state.merchant.lastRedeemedKey`). El selector de copias exige
      elegir exactamente el número pedido antes de habilitar el botón de
      confirmar.
    - **Duelo por apuesta**: en cada zona con al menos 1 etapa superada,
      un botón en "Etapas" abre un combate rápido (una sola oleada, no el
      recorrido de nodos) contra el relleno de la etapa más avanzada ya
      superada de esa zona, apostando 100/300/1000 Texel (solo se ofrecen
      las cantidades que el jugador puede pagar) — ganar devuelve el
      doble, perder pierde lo apostado. No usa `window.__stageRun`: es una
      llamada directa a `UI.openBattle`.
    - **Control de velocidad de combate**: botón ⏱️ en la cabecera de
      batalla que cicla 1×→2×→3×→1× (`UI.cycleBattleSpeed`); cambia
      `UI.battleSpeed`, que divide el intervalo de 420 ms entre eventos de
      `UI.stepBattle` — la velocidad se aplica a toda animación de
      combate, cualquiera que sea el modo.
    - **Bug encontrado y arreglado durante las pruebas**: como
      `window.__championRun` no se limpiaba al empezar CUALQUIER otro tipo
      de combate (etapa normal, Torre, Mazmorra Elemental, Arena, Duelo
      por apuesta), si el jugador dejaba una Prueba del Campeón a medias
      (sin ganar ni perder el último duelo) y luego luchaba en otro sitio,
      al cerrar ESE OTRO combate `battleCloseBtn` reanudaba por error la
      Prueba del Campeón en vez de volver a la pantalla correcta —
      confirmado escribiendo un test que deja la Prueba del Campeón activa
      y arranca una etapa normal después. Arreglado limpiando
      `window.__championRun = null` al arrancar cualquier otro combate
      (`UI.startStageBattle`, `UI.startTorreLevel`,
      `UI.startElementalDungeon`, `UI.startArenaBattle`,
      `UI.startWagerDuel`) y `window.__stageRun = null` al arrancar la
      Prueba del Campeón, para que los distintos tipos de combate en curso
      sean siempre mutuamente excluyentes.
    Verificado con Playwright (bucle de avance rápido de
    `UI.stepBattle(view, true)`, sin esperas en tiempo real): Prueba del
    Campeón sin luchador elegido muestra el aviso correcto; el selector
    filtra y guarda el luchador elegido; una racha de 6 duelos ganados
    (HP/carga de ulti persistiendo sin curarse entre ellos) termina en
    derrota en el duelo 7, con la mejor racha (6) guardada correctamente y
    el run limpiado; Mercader Itinerante genera la misma oferta dos veces
    en el mismo día (determinismo confirmado), el canje descuenta
    exactamente las copias pedidas y suma los cristales/equipo prometido,
    y el botón queda deshabilitado con "Ya cambiado hoy" tras canjear;
    Duelo por apuesta no aparece sin etapas superadas, aparece tras
    superar una, y ganar duplica el Texel apostado; velocidad de combate
    cicla 1×→2×→3×→1× y el texto del botón se actualiza en cada clic; el
    bug de contaminación entre `window.__championRun`/`window.__stageRun`
    ya no se reproduce tras el fix.
  - [x] **Estadísticas históricas, exportar/importar partida y acciones en
    lote** (3 funcionalidades pedidas juntas):
    - **Estadísticas históricas de toda la partida** (Objetivos → nuevo
      panel "📊 Estadísticas históricas"): combates totales, derrotas, %
      de victorias, daño total infligido/recibido, curación total, golpe
      más fuerte y Texel/XP de luchador ganados en combate — acumulados
      en TODOS los modos (etapa normal, Torre, Mazmorra Elemental, Arena,
      Prueba del Campeón, Duelo por apuesta) desde un único punto:
      `UI.endBattle`, el único sitio por el que pasa el cierre de
      cualquier combate del juego. Se apoya en `view.battleStats` (ya
      existía para el resumen post-combate) más un nuevo `maxHit` que
      registra el golpe más fuerte de cada combate. Antes de esto,
      `state.stats.battlesWon/Lost` solo se incrementaba en 2 de los 6
      flujos de combate (etapa/Torre/Elemental y Arena) — se centralizó
      en `UI.endBattle` y se retiraron los incrementos sueltos para no
      contar por duplicado.
    - **Exportar/Importar partida** (Ajustes → "💾 Copia de seguridad"):
      exporta la partida completa a un código de texto (base64 de sus
      bytes UTF-8, `exportSaveCode`/`importSaveCode` en state.js) para
      guardarla a salvo o pasarla a otro dispositivo, sin depender de
      ningún servidor. Para que un código de una versión antigua del
      juego se ponga al día igual que una partida cargada normal, se
      extrajo toda la lógica de migración/limpieza de huérfanos de
      `loadGame()` a una función nueva `migrateState(state)` que ambos
      caminos reutilizan. Importar pide confirmación (sustituye la
      partida actual sin poder deshacerse) y recarga la página.
    - **Acciones en lote** (Colección → "☑️ Selección múltiple"): activa
      un modo en el que tocar tarjetas las selecciona en vez de abrir su
      ficha, con una barra de acciones que permite vender todas las
      seleccionadas de golpe (con el Texel total y confirmación antes) o
      fusionar duplicados del mismo luchador en la copia de mayor nivel
      del grupo (solo se habilita con 2+ copias del mismo defId
      seleccionadas) — antes había que hacer ambas cosas una copia a la
      vez desde la ficha.
    Verificado con Playwright: las estadísticas históricas suben tras
    combates de verdad (daño hecho/recibido, Texel/XP ganado, golpe más
    fuerte) y se ven en el panel nuevo de Objetivos; exportar genera un
    código base64 válido cuyo `importSaveCode` reconstruye exactamente el
    mismo roster/Texel/estadísticas que la partida en curso (ida y
    vuelta), y un código corrupto se rechaza con un error controlado en
    vez de romper la página; selección múltiple marca visualmente las
    tarjetas elegidas, fusionar 3 copias del mismo luchador en lote
    consume 2 como material (el roster baja en 2, la de mayor nivel sube
    su barra de SEF), y vender 2 luchadores en lote los retira del
    roster y suma el Texel correcto, con la selección vaciándose sola
    después de cada acción.
  - [x] **Jefes con tier propio (recuadro rojo) y estadísticas de combate
    fijas**, a petición del usuario:
    - **Tier visual distintivo**: los jefes ya no se muestran con el color
      de su `rarity` real (Raro/Épico...) en ninguna tarjeta — llevan
      siempre un recuadro rojo pulsante propio ("Jefe", 💀), vía un nuevo
      `BOSS_RARITY_INFO`/`rarityInfoFor(def)` en data.js que devuelve este
      tier cuando `def.isBoss` es true, en vez de tocar la escalera
      compartida `RARITIES` (así ningún código que itera esa lista —
      Mercader, Tienda, evolución, Superfusión... — se ve afectado). Se
      aplica en la Colección, la ficha de luchador, la galería de Jefes y
      la tarjeta de combate (`.battle-unit`, que no usaba antes ningún
      color de rareza).
    - **Estadísticas de combate fijas**: cada jefe tiene ahora un
      `fixedStats` ({hp, atk, def, agi, wis}) hardcodeado directamente en
      su `addBoss(...)` de data.js, usado por `buildUnitStats` (combat.js)
      en vez de la fórmula compartida de rareza×nivel×clase — así se puede
      recalibrar la dificultad de un jefe concreto sin que un cambio en
      `RARITIES` o en el nivel de su zona afecte también a los demás. Los
      33 jefes se sembraron ejecutando la fórmula ANTIGUA una sola vez
      (mismo nivel/rareza/clase que ya tenían en su zona) para no cambiar
      la dificultad actual del juego ni un punto — a partir de ahora son
      libremente editables a mano en data.js. El bonus de ×2.4 HP de jefe
      (para que aguante varias rondas en solitario) se sigue aplicando
      igual, por encima del `fixedStats.hp` fijo.
    - **Decisión de diseño**: `fixedStats` solo afecta al jefe en su papel
      de RIVAL (`makeBossUnit`/`buildUnitStats`). Una copia que el jugador
      llegue a poseer (premio de Torre Batalla) sigue usando `fighterStats`
      en state.js sin tocar — la fórmula normal de nivel/rareza/equipo —
      para no romper que se pueda subir de nivel, equipar y vender como
      cualquier otro luchador; solo cambia el color de su tarjeta (rojo
      "Jefe" también cuando está en tu Colección).
    Verificado con Playwright: los 33 jefes tienen `isBoss`/`fixedStats`
    correctos y `makeBossUnit` reproduce EXACTAMENTE el HP/ATK/DEF/AGI/WIS
    que tenían antes del cambio (0 diferencias, comparado contra la fórmula
    vieja); la tarjeta de la Colección, la ficha y la galería de Jefes
    muestran `rarity-jefe` con `--rc` rojo; una copia propia de jefe
    (nivel 1 vs. nivel 20) sigue subiendo de estadísticas con el nivel con
    normalidad; y la tarjeta de combate del jefe en una pelea de zona real
    lleva la clase `battle-unit rarity-jefe`.
  - [x] **Tifón y Balrog como los 2 últimos jefes del mapa, y los más
    fuertes**, a petición del usuario: se intercambió su `pool[2]` con el
    de Loki y el Mago Oscuro (que ocupaban las 2 últimas zonas,
    `salon_enganos` y `torre_prohibida`) — sin tocar el orden ni el número
    de zonas, solo qué jefe pelea en cada una. Tifón queda en la ÚLTIMA
    zona de todas (final del juego) y Balrog en la penúltima. Sus
    `fixedStats` se subieron muy por encima del resto (antes eran del
    nivel medio del pool de jefes): ahora dominan estrictamente en las 5
    estadísticas a los otros 31 jefes — Tifón (2850/480/420/430/480) un
    poco por encima de Balrog (2700/460/400/410/460), que a su vez supera
    con holgura al que antes era el jefe más fuerte del juego (Dracorex,
    2372 HP). Como el nivel de zona ya estaba al tope (40) desde bastante
    antes en el mapa, mover a un jefe de zona no cambiaba nada por sí solo
    — hacía falta subir sus `fixedStats` a mano para que de verdad fueran
    más difíciles, que es justo la ventaja de tenerlos fijos en vez de
    atados a la fórmula de zona. Verificado con Playwright: la última y
    penúltima zona del mapa llevan a Tifón y Balrog; ambos superan a los
    otros 31 jefes en las 5 estadísticas; y el orden de la Torre Batalla
    (que se basa en `pool[2]` para calcular su tramo) los coloca también
    como los 2 últimos de su escalera de jefes.
  - [x] **Rebalanceo completo de los 31 jefes de zona restantes** (todos
    menos Balrog/Tifón, ya calibrados aparte como los 2 últimos y más
    fuertes), a petición del usuario tras detectar que el orden de poder
    no tenía sentido: Dracorex (zona 5, de cuando el juego solo tenía 6
    zonas) era más fuerte que jefes 20 zonas por delante, y el tramo
    "épico" (zonas 13-30) apenas escalaba — dos jefes 11-12 zonas después
    (Surtr/Behemoth) eran más flojos que uno anterior (Basilisco).
    - **Se encontró y arregló de paso un bug real**: `pool[0]` de la zona
      `aldea_nian` apuntaba a `'chupacabras_raro'`, que no existe — la
      familia se llama `chupacabra` (singular). Cualquier oleada normal de
      esa zona que tocara sacar ese relleno (probabilidad 1/2 por
      enemigo) rompía el combate entero (`fighterDef` devolvía
      `undefined`). Corregido a `chupacabra_raro`.
    - **Metodología**: en vez de una curva de poder teórica (que ya había
      fallado una vez: escalarla proporcionalmente subía tanto el ATK
      como la DEF del jefe a la vez, y como el daño real resta
      `defVal×0.5` del atacante, subir ambos a la par podía dejar al
      jugador haciendo 1 de daño por golpe), se AJUSTÓ CADA JEFE POR
      SIMULACIÓN REAL: para cada una de las 31 zonas, un equipo "suelo"
      de 3 luchadores (sin equipo ni estrellas — el peor caso real, la
      misma rareza/nivel que ya usa el relleno de esa zona como referencia
      del nivel de jugador esperado ahí) lucha contra el jefe con el motor
      de combate de verdad (`UI.stepBattle` a velocidad instantánea) varias
      veces; si gana casi siempre se le sube HP/ATK/DEF, si pierde casi
      siempre se identifica SI el problema es que el jugador apenas hace
      daño (DEF del jefe demasiado alta) o que el jugador muere demasiado
      rápido (ATK/SAB del jefe demasiado altos) y se corrige ESE lado en
      concreto — no un multiplicador ciego a los 5 stats a la vez. Se
      repitió hasta que la tasa de victorias de ese equipo suelo cayera
      entre 35-85% (reto real, pero factible) en cada una de las 31 zonas.
    - Tras el rebalanceo, se revisó que Balrog/Tifón siguieran dominando
      estrictamente las 5 estadísticas sobre los 31 (alguno, como
      Behemoth en Defensa, había quedado por encima) y se les subió un
      poco más para recuperar el margen.
    Verificado con Playwright (además de la propia simulación de
    calibración): los 33 jefes conservan `isBoss`/`fixedStats` válidos;
    Balrog/Tifón vuelven a dominar las 5 estadísticas sobre el resto;
    comprobación cruzada en varias zonas (0, 5, 12, 19, 25, 30) de que la
    tasa de victorias del equipo suelo sigue en un rango de reto real
    (no trivial, no imposible); y que una etapa normal (no de jefe) sigue
    funcionando igual tras el cambio, sin verse afectada por la rama de
    `fixedStats` en `buildUnitStats`.
  - [x] **Arreglado: "Reiniciar partida" no reiniciaba de verdad**, a
    reporte del usuario. Causa real: `location.reload()` (tanto en
    Reiniciar partida como en Importar partida) hace que la pestaña se
    oculte/descargue antes de que cargue la página nueva, así que dispara
    igual los eventos `visibilitychange`/`pagehide` — y su autoguardado
    (en `main.js`) reescribía sin condición la partida VIEJA (la que
    seguía en la variable `state` de ese cierre) justo por encima de la
    recién borrada/importada, justo antes de que la página recargada
    llegara a leer el cambio. Se arregló con un freno compartido
    `UI.suppressAutosave`: Reiniciar partida e Importar partida lo activan
    justo antes de su `location.reload()`, y los 3 sitios de autoguardado
    en `main.js` (intervalo de 15s, `visibilitychange`, `pagehide`)
    comprueban que no esté activo antes de guardar. Verificado con
    Playwright: partida con progreso de mentira (Texel, racha del
    Campeón) → Reiniciar partida → tras la recarga, todo vuelve
    exactamente a los valores de `createNewState()`; y por separado,
    Importar partida con un código exportado de otra partida distinta →
    tras la recarga, el Texel es el de la partida importada, no el que
    había antes de importar (mismo bug, mismo arreglo).
  - [x] **Aviso de cómo rellenar los huecos vacíos de la Formación**. El
    usuario pidió empezar la partida con 6 luchadores en vez de 3 para
    poder librar un combate completo desde el principio, pero al comentar
    el porqué (con 3 luchadores solo llenas 1 fila de las 3, y en las
    etapas con varias oleadas te tocan líneas de 1 solo luchador contra 3
    rivales) se aclaró que el problema real no era el número de
    luchadores de inicio, sino que NO estaba indicado que hay que ir a
    Invocar para conseguir más y llenar la Formación — así que se dejó la
    banda de inicio tal cual (3) y en su lugar se añadió un aviso nuevo,
    justo debajo de la rejilla de Formación en Banda
    (`#formationFillHint`), que distingue dos casos mientras queden huecos
    vacíos: si ya tienes luchadores sueltos sin colocar, invita a tocar un
    hueco "+"; si no te queda ninguno suelto, invita a ir a la pestaña
    "Invocar". Desaparece solo en cuanto se llenan los 9 huecos.
    Verificado con Playwright los 3 estados (banda nueva con huecos vacíos
    y sin sueltos → aviso de Invocar; con un luchador suelto sin colocar →
    aviso de tocar el hueco; los 9 huecos llenos → aviso oculto).
  - [x] **Arreglados: sprite de jefe pequeño en combate, y cristales de
    invocación invisibles en el resumen de victoria**, a reporte del
    usuario (captura del Guardián del Bosque muy pequeño junto a las 3
    criaturas del jugador).
    - **Sprites pequeños**: no era un bug de código — `creatureCanvas`
      pone el mismo ancho fijo (76px en combate) a TODOS los sprites, así
      que si la imagen tiene mucho margen transparente alrededor del
      personaje, el propio personaje ocupa menos de ese ancho. Se
      comprobó con Python/PIL el `bbox` (recuadro real del contenido no
      transparente) de los 468 sprites de criatura: **24 tenían menos del
      75% de relleno** en algún eje — casi todos jefes con el lienzo
      panorámico 1408×768 sin recortar de cerca (`guardianbosque.png`
      solo llenaba el 40% del ancho), más un puñado de personajes sueltos
      (`chispa_raro`, `duende_epico/raro`, `ragnar_legendario`,
      `thor_raro`). Se recortaron los 24 a su recuadro real con un margen
      del 4% (sin regenerar ni tocar el contenido, solo recorte del
      espacio transparente sobrante) — quedan entre 86-98% de relleno,
      igual que el resto del roster.
    - **Cristales invisibles en el resumen**: sí era un bug real. Los
      cristales de invocación (pixite/voxite/doxite) que caen al ganar un
      combate (jefe de zona, etapa normal, Mazmorra Elemental) SÍ se
      sumaban a `state.currencies` — pero el HTML de "¡Victoria!" en
      `UI.endBattle` solo mostraba el objeto de equipo (`🎁 Objeto`), nunca
      los cristales, así que subían en la topbar sin que el jugador supiera
      de dónde salían. Añadidas sus líneas al resumen
      (`⚪/🟢/🟡 Cristal X +N`), igual que ya se hacía con el equipo.
    Verificado con Playwright: los 24 sprites recortados abren sin error y
    ahora rellenan 86-98% de su lienzo (antes 26-77%); y un combate ganado
    con drop de cristal (jefe de zona) muestra "⚪ Cristal Voxite +1" en el
    resumen de la pantalla de victoria.
  - [x] **Comparar luchadores, de dónde salen las Gemas, y personajes que
    se salían de su hueco en la Formación** — 3 peticiones/reportes del
    usuario:
    - **Comparar luchadores**: nuevo botón "🆚 Comparar con otro
      luchador" en la ficha de cualquier luchador (`UI.openComparePicker`
      + `UI.showCompare`, reutilizando el `pickerModal` genérico en vez de
      un modal nuevo). Elige un segundo luchador y pone sus 5
      estadísticas totales (con el equipo puesto ya sumado, las mismas
      cifras de la ficha normal) lado a lado, resaltando en verde quién
      gana cada una — para decidir de un vistazo a cuál meter en la
      Formación. Documentado también en la Guía.
    - **De dónde salen las Gemas**: el usuario preguntó cómo conseguir más
      para comprar cristales — la respuesta real es que ahora mismo la
      ÚNICA fuente son las victorias de Arena (pocas por combate, algo
      más cuanto más alto el rango); no hay ningún otro sistema del juego
      que dé Gemas. Se añadió un aviso en la pantalla Invocar, justo
      encima de los paneles de cristales, explicándolo — antes no había
      ninguna pista de dónde salían.
    - **Personajes que se salían de su hueco en la Formación** (bug real,
      con foto): `creatureCanvas` pone un ancho fijo (46px) a todos los
      sprites y dejaba el alto en "auto" según la proporción real de cada
      imagen — un personaje recortado muy alto (retrato de cuerpo entero,
      poco margen) se salía del hueco de 76px de la Formación y tapaba el
      "Nv.X" de debajo. Arreglado con CSS: el hueco de la imagen dentro de
      `.formation-slot` ahora tiene un recuadro fijo de 46×46 con
      `object-fit: contain`, así que cualquier sprite encoge
      proporcionalmente para caber en vez de desbordar.
    Verificado con Playwright: el flujo completo de comparar (ficha →
    elegir segundo luchador → tabla con 5 filas de stats y clases de
    ganador/perdedor) funciona sin errores; el aviso de Gemas aparece en
    Invocar; y un luchador con sprite muy alto (`thor_raro`, recortado la
    ronda anterior) ya no se sale del recuadro de 46×46 de la Formación
    (antes se salía por completo, ahora coincide justo con el borde
    superior del texto "Nv.X").

- [x] **Recompensa de Gemas al completar objetivos y al completar zonas por
    primera vez / ampliación grande de la lista de objetivos**. El usuario
    pidió esto tras confirmar en la ronda anterior que las Gemas solo salían
    de Arena — ahora hay dos fuentes nuevas, además de una lista de
    objetivos mucho más grande para tener siempre algo a mano según lo
    avanzada que vaya la partida.
    - **Bonificación de Gemas por zona**: `recordStageClear` (state.js) ahora
      da `15 + 3 × índice de zona` Gemas la primera vez que se derrota al
      jefe de cada zona (etapa final), y no vuelve a darlas si se rejuega esa
      etapa. Cambió la forma del valor que devuelve, de `next|null` a
      `{ unlockedZone, zoneGemsBonus }` — el único punto de llamada
      (`UI.fightStageRunNode`, para etapas normales del Mapa; Torre Batalla y
      Mazmorra Elemental no pasan por aquí) se actualizó para leer ambos
      campos. El resumen de victoria (`UI.endBattle`) muestra una línea
      "🎉 Zona completada +N 💎" cuando corresponde, antes del aviso de zona
      desbloqueada.
    - **Objetivos (Logros)**: se amplió la lista de objetivos de ~20 a 49
      entradas nuevas (`OBJECTIVES` en data.js), organizadas en 6 bloques —
      Mapa (zonas/etapas/jefes), Colección (formas/familias/roster/
      elementos/clases/nivel máx./forma final/estrellas de Superfusión),
      Combate (victorias/daño/golpe crítico/rango de Arena), Equipo (piezas
      conseguidas/inventario lleno), Retos especiales (racha de Prueba del
      Campeón, Mazmorras Elementales, niveles de Torre Batalla) y
      Homúnculos. Cada objetivo da una recompensa de Gemas de una sola vez
      (10 a 150 según dificultad) al reclamarlo — se añadió
      `state.objectivesClaimed` (lista de ids ya reclamados, con su
      migración) y `claimObjective(state, objId)` en state.js, que valida
      que esté completado y no reclamado antes de dar las Gemas.
    - La pantalla de Objetivos (`UI.openObjectives`, ui.js) ganó un panel
      nuevo "🏆 Logros" debajo del resumen de progreso existente, con badge
      de reclamados/total y una fila por objetivo (icono, descripción,
      progreso actual/objetivo, coste en Gemas) ordenadas para que las
      reclamables aparezcan primero, luego las bloqueadas, y al final las ya
      reclamadas. El botón de cada fila reclama al momento, actualiza la
      barra superior y muestra un toast de confirmación.
    Verificado con Playwright: las 49 entradas de `OBJECTIVES` resuelven
    `get`/`target` sin errores (incluidos los objetivos con `target` como
    función, como "ten un luchador de cada elemento/clase" o "llena el
    inventario", y los que leen directamente del estado sin pasar por
    `objectivesSummary`, como la racha de la Prueba del Campeón o las
    Mazmorras Elementales superadas); el panel de Logros renderiza las 49
    filas sin error, con el badge y el orden de clasificación correctos;
    reclamar un objetivo completado (tanto llamando a `claimObjective`
    directamente como haciendo clic en el botón real de la interfaz) da las
    Gemas correctas, lo marca como reclamado y bloquea un segundo intento de
    cobro; y la bonificación de zona (`recordStageClear`) da
    `15 + 3 × índice` Gemas la primera vez que se completa una zona y 0 al
    volver a jugar la misma etapa.

- [x] **Auditoría de balance completa + ampliación de Logros con recompensas
    variadas**. El usuario pidió una auditoría de dificultad/progresión/
    recompensas/objetivos, y por separado que se añadieran muchos más
    Logros, no todos con Gemas como recompensa.
    - **Auditoría (análisis, no solo simulación)**: con las fórmulas reales
      del juego en vez de solo una partida de ejemplo —
      - Dificultad de jefes: ya rebalanceada por simulación en la ronda
        anterior de este mismo trabajo (31 jefes ajustados a una banda de
        victoria objetivo según nivel esperado del jugador); sigue vigente.
      - Economía de Texel: ingreso por etapa `(20 + índiceGlobal×8) ×
        (3 si es jefe)` crece mucho más rápido que los gastos (equipo de
        Tienda 60-2000, objetos 40/120, mejora de equipo `30×nivel^1.7×
        multiplicador de rareza`) — el Texel es abundante casi desde el
        principio y se vuelve trivial en las últimas zonas; es una curva de
        recompensa habitual en este tipo de juego (el sumidero real es la
        mejora de equipo, que escala sin techo) y no se tocó.
      - Economía de cristales de invocación: la mayoría no sale de Gemas
        sino de las propias etapas (35% de soltar 1 Pixite en etapa normal,
        Voxite garantizado + 30% Doxite en cada jefe, más en Mazmorra
        Elemental) — a lo largo de un solo mapa completo eso son ≈81
        Pixite + ≈33 Voxite + ≈12 Doxite de caída directa, antes de contar
        Arena ni Gemas. Las Gemas son un extra para completar huecos, no la
        fuente principal.
      - Economía de Gemas: antes de esta ronda, solo Arena las daba
        (`3 + rango/3` por victoria). La ronda anterior sumó dos fuentes
        nuevas grandes (bono de zona + 49 Logros, ≈4.100 Gemas acumulables
        en una partida completa) — comparado con el diseño original
        (Gemas escasas), eso es mucho de golpe. Con los cristales ya
        cayendo con generosidad de las propias etapas, no es un problema
        grave, pero sí motivo para no seguir sumando solo Gemas al ampliar
        Logros — de ahí el rediseño de recompensas de abajo.
    - **Recompensas variadas en Logros**: cada objetivo tiene ahora
      `reward: { type, ... }` en vez de un valor fijo de Gemas —
      `rG`/`rT`/`rI`/`rGear`/`rC` (data.js) construyen recompensas de
      Gemas, Texel, un objeto consumible (Poción/Pluma Fénix), una pieza de
      equipo de una rareza dada, o cristales, respectivamente.
      `grantObjectiveReward` (state.js) reparte según el tipo; si toca
      equipo y el inventario está lleno, se vende sola al momento (mismo
      cálculo que vender equipo a mano) para que reclamar un logro nunca se
      pierda por falta de hueco. Reparto pensado para no depender solo de
      Gemas: Texel en los hitos tempranos (donde más hace falta), objetos
      consumibles como premio de sensación inmediata, equipo como variante
      "física", y Gemas reservadas sobre todo para los hitos más largos o
      tardíos.
    - **Ampliación de Logros**: de 49 a 81 entradas. Objetivos nuevos en
      categorías ya existentes (más escalones intermedios: p.ej.
      `jefes_1`, `roster_5`, `formas_25`, `victorias_100`, `arena_1`,
      `equipo_10`, `campeon_30`, `torre_20`, `homunculos_50`...) y dos
      categorías nuevas:
      - **Formación**: llenar los 9 huecos de la Formación, y un objetivo
        por cada elemento (5) y por cada clase (5) por tener una Formación
        de un único elemento/clase (mínimo 3 luchadores) — un reto de
        composición de equipo con su propia recompensa de equipo.
      - **Constancia**: jugar en 3/7/30 días distintos — nuevo
        `state.progress.daysPlayed` (lista de fechas, sin duplicados),
        registrado una vez por partida cargada vía `recordPlayDay`
        (state.js, llamado desde main.js justo al cargar el estado). No
        necesita sesiones de 24h reales, solo días de calendario distintos.
    Verificado con Playwright: las 81 entradas resuelven `get`/`target` y
    `rewardLabel` sin errores, sin ids duplicados; el panel de Logros
    renderiza las 81 filas; reclamar un objetivo de cada tipo de recompensa
    (Gemas, Texel, objeto, equipo) aplica el cambio correcto al estado —
    incluida la venta automática si el inventario de equipo está lleno — y
    un segundo intento de cobro queda bloqueado; los objetivos de Formación
    mono-elemento exigen que TODOS los huecos ocupados compartan elemento
    (una Formación mixta con 3 luchadores de fuego pero otros huecos ya
    ocupados de otro elemento no lo completa) y se completan correctamente
    al vaciar la Formación y llenarla solo de un elemento; `daysPlayed`
    registra la fecha de la sesión de prueba correctamente.

- [x] **Comprar Gemas con Texel en la Tienda / Duelo por apuesta solo contra
    el jefe ya derrotado, con estadísticas reforzadas**. Dos pedidos del
    usuario en la misma ronda.
    - **Gemas por Texel**: panel nuevo "💎 Gemas" en la Tienda (antes del de
      Equipo nuevo), con 3 lotes fijos y repetibles —
      `GEMAS_TEXEL_OFFERS` en data.js: 10 Gemas por 600 Texel, 50 por
      2.500, 200 por 8.000 (mejora algo el precio por Gema en los lotes
      grandes, como cualquier tienda con descuento por volumen). A
      propósito caro — Texel es abundante y Gemas escasas, no debía ser
      una forma barata de saltarse esa escasez — pero siempre disponible,
      así que quedarse sin Gemas y sin cristales ya no bloquea del todo
      poder seguir invocando. `buyGemasWithTexel` en state.js. También se
      actualizó el aviso de la pantalla Invocar (desactualizado desde la
      ronda anterior: ya no es verdad que Arena sea "la única fuente") para
      mencionar Objetivos, la bonificación de zona y esta compra.
    - **Duelo por apuesta**: antes estaba disponible con solo 1 etapa
      superada en la zona y luchaba contra el relleno (mobs normales) de
      la etapa más avanzada — nunca contra el jefe. Ahora solo aparece
      cuando el jefe de la zona ya está derrotado, y el combate es
      SIEMPRE la revancha contra ese jefe. Como ya se le venció una vez,
      pelea con estadísticas reforzadas (`WAGER_BOSS_BOOST = 1.3` en
      ui.js): a diferencia del jefe normal (que por diseño NUNCA sube
      ataque/defensa, solo HP, para que sea matemáticamente imposible que
      gane a una banda entera — ver el comentario de `makeBossUnit` en
      combat.js), esta revancha SÍ sube también ataque/defensa/agilidad/
      sabiduría un 30% además del HP (`makeBossUnit`/`buildEnemyBand`
      ganaron un `extraMult` opcional para esto), para que apostar el
      doble sea un riesgo real y no un trámite.
    Verificado con Playwright: el botón de Duelo por apuesta no aparece sin
    ninguna etapa superada, sigue sin aparecer tras superar una etapa
    normal (no jefe), y aparece en cuanto se derrota al jefe; las
    estadísticas del jefe en el duelo (HP/ataque/defensa) son exactamente
    ×1.3 las del combate normal contra ese mismo jefe; el panel de Gemas
    de la Tienda muestra los 3 lotes, comprar descuenta el Texel y suma las
    Gemas correctas, y los botones se deshabilitan sin Texel suficiente.

- [x] **Sprites que se salían de su cuadro, arreglado de raíz en TODAS las
    pantallas (no solo Formación)**. El usuario mandó una foto del
    recorrido de etapa (la rejilla 3×3 que muestra la banda antes de
    luchar) con varios personajes desbordando su cuadro, y pidió
    solucionarlo en todas partes, no solo ahí.
    - **Causa raíz**: `creatureCanvas(defId, sizePx)` (ui.js) fijaba el
      ANCHO de la imagen real (`img.style.width`) pero dejaba el alto en
      `"auto"` según la proporción real del PNG — cualquier rejilla de
      tamaño fijo que la usara (recorrido de etapa, filas de la Torre
      Batalla, colas de combate, selector de rivales...) confiaba en que
      la imagen respetaría el alto declarado en el CSS de esa rejilla,
      pero un `<img>` con alto inline `auto` ignora por completo esa altura
      del CSS externo — solo Formación se había arreglado antes (con un
      `!important` específico para ese caso).
    - **Arreglo de raíz**: en vez de parchear cada rejilla una a una, se
      corrigió la función compartida — ahora fija SIEMPRE ancho y alto en
      proporción 72×81 (la misma proporción 8:9 que ya usaba por defecto
      la clase `.creature-canvas` del CSS, y que TODAS las rejillas ya
      declaraban sin saberlo: 40×45, 26×29 son exactamente esa proporción).
      Con ambos fijos, `object-fit: contain` (ya presente en la clase base)
      encoge la imagen para caber siempre dentro sin deformarla, en vez de
      desbordar. Una sola línea de cambio arregla todos los sitios a la
      vez, incluidos los que puedan añadirse en el futuro.
    Verificado con Playwright: la rejilla del recorrido de etapa (la misma
    de la foto) ya no desborda — alto exacto 45px dentro de su cuadro de
    52×68; comprobado también en las filas de la Torre Batalla; y un
    barrido de TODAS las imágenes `.creature-canvas` visibles en las
    pantallas Mapa/Banda/Torre no encontró ninguna que sobrepase el cuadro
    de su elemento padre (0 desbordamientos). Formación sigue funcionando
    igual que antes (su `!important` específico sigue ganando).

- [x] **Punto rojo en 🎯 cuando hay Logros sin reclamar / indicador "En
    formación" en todos los sitios / opción de sustituir en la Formación al
    comparar luchadores**. Tres pedidos del usuario en la misma ronda.
    - **Aviso de Logros pendientes**: el botón 🎯 de la barra superior gana
      un punto rojo (`#objectivesBadge`, `.icon-btn-badge` en CSS) cuando
      hay al menos un objetivo completado y sin reclamar — se recalcula en
      cada `UI.renderTopbar` (que ya se llama tras cualquier acción que
      pueda completar uno) y desaparece en cuanto no queda ninguno
      reclamable.
    - **"En formación" en todos los sitios**: la etiqueta ya existía
      (`opts.inBand` en `creatureCard`, ver TODO de la ronda de Comparar)
      pero solo se usaba en la rejilla de Colección. Ahora también aparece
      en: la ficha de un luchador (`UI.openFighterModal`), el selector de
      material de fusión normal, el selector de sacrificio de
      Superfusión (aviso importante — sacrificar a alguien de la
      Formación lo saca de su hueco sin previo aviso), el selector de la
      Prueba del Campeón, el selector de equipo de Mazmorra Elemental, y
      el selector de copias del Mercader Itinerante (mismo aviso que
      Superfusión: cambiarlo también lo saca de la Formación). Como casi
      todos estos selectores comparten `renderPickerCandidates`, bastó con
      calcular `inBand` una vez ahí para cubrir varios sitios a la vez;
      los 2-3 que no pasan por esa función (fusión, Superfusión, Mercader)
      se tocaron a mano. Nuevo helper `bandPositionOf(state, uid)` en
      state.js (hueco `{row,col}` o `null`) para no repetir la búsqueda en
      la rejilla 3×3 en cada sitio.
    - **Sustituir en la Formación al comparar**: `UI.showCompare` ahora
      marca con la misma etiqueta "En formación" a cada luchador comparado
      que esté en un hueco, y si exactamente UNO de los dos está en la
      Formación y el otro no, muestra un botón "🔄 Sustituir a X en la
      Formación por Y" que hace el cambio al momento (mismo hueco) y
      refresca la comparación para ver el resultado sin cerrar el modal.
      Si los dos están ya en la Formación, o ninguno, no tiene sentido
      "ceder" un hueco de uno a otro, así que no aparece el botón.
    Verificado con Playwright: el punto rojo aparece/desaparece
    correctamente al completar y reclamar un objetivo; la etiqueta "En
    formación" aparece en la rejilla de Colección, la ficha de un
    luchador, el selector de sacrificio de Superfusión y el selector de la
    Prueba del Campeón; el botón de sustituir solo aparece cuando
    exactamente uno de los dos comparados está en la Formación, y al
    pulsarlo el que estaba en el hueco sale y el otro entra en su lugar
    (comprobado leyendo `bandPositionOf` de ambos antes/después); no
    aparece botón si ambos o ninguno están en la Formación.

- [x] **Combate automático más inteligente (daño + reparto de golpes)**. El
    usuario pidió mejorar la IA del modo Auto para que priorice hacer daño
    de verdad y repartir quién recibe el golpe de vuelta.
    - Antes `pickAutoGroup` (ui.js) solo miraba la ventaja elemental media
      de la línea (`rowElementScore`, ahora eliminada por no usarse ya en
      ningún sitio) — entre líneas del mismo elemento no distinguía nada,
      ni el daño real ni cuántos luchadores arriesgaba. Ahora usa
      `rowDamageScore` (combat.js, nueva): la misma fórmula simplificada de
      `computeDamage` (ataque menos la mitad de la defensa rival media, con
      la ventaja elemental de cada atacante ya aplicada) sumada para cada
      superviviente de la línea — así prioriza siempre la línea que más
      daño le haría al rival. Además, a igualdad de daño aproximado, un
      bonus del +15% por cada superviviente extra en la línea hace que gane
      la más numerosa: como el rival ataca a quien esté en la línea activa,
      repartir entre más personajes evita que siempre encaje los golpes el
      mismo único superviviente.
    Verificado con Playwright: entre dos líneas del mismo elemento, la de
    más daño total gana aunque tenga menos miembros (prioridad correcta), y
    entre dos líneas de daño similar gana la más numerosa (desempate
    correcto); una defensa rival más alta reduce `rowDamageScore` como se
    espera.
    - **Corrección sobre este mismo cambio**: en la misma ronda se había
      quitado también la insignia "⚡N" (turnos para la ulti) de las
      tarjetas de combate y del selector de línea, entendiendo mal la
      petición de "quitar los medallones" — el usuario aclaró después que
      esa insignia NO debía tocarse, y que "el medallón" es en realidad el
      círculo de fondo decorativo tras el retrato (`.creature-canvas-wrap
      ::before`, el mismo que ya controla el ajuste "Mostrar medallón" de
      Ajustes). Revertido íntegro: `.ult-turns`/`.picker-cell-ult` y
      `UI.updateUnitCardCharge` vuelven a estar como antes. Ver la entrada
      siguiente para el arreglo correcto.

- [x] **Quitar el medallón (círculo de fondo) del selector de línea del
    combate / bug de "undefined" al sustituir en Comparar / comparar
    estadísticas base además de las actuales**. Tres pedidos del usuario
    en la misma ronda, el primero una corrección directa del punto anterior.
    - **Medallón fuera SOLO del selector de línea**: de los 6 sitios del
      código que envuelven un retrato en `.creature-canvas-wrap` (y por
      tanto pintan el círculo de fondo vía `::before`), el único que forma
      parte de la pantalla de combate en sí es el selector de línea
      (`.picker-cell`, la rejilla 3×3 "Desliza para elegir 1 línea") — las
      tarjetas de combate activas (`.battle-unit`) usan su propia clase
      `.battle-unit-canvas-wrap` sin medallón, así que no hacía falta
      tocarlas. Se añadió `.picker-cell .creature-canvas-wrap::before {
      display: none; }` en vez de tocar el ajuste global "Mostrar
      medallón" — la Colección, la Pokédex, la ficha de jefes, etc. lo
      siguen mostrando igual que antes.
    - **Bug real de "undefined" al sustituir en Comparar** (de la ronda
      anterior): el botón "Sustituir a X en la Formación por Y" leía
      `toEntry.name` de un objeto ENTRY del roster (`{uid, defId, level,
      ...}`, sin campo `name`) en vez del objeto DEF (`fighterDef(...)`,
      que sí tiene `.name`) — de ahí el "undefined" tanto en el botón como
      en el aviso posterior. Arreglado pasando también el DEF del luchador
      que entra a la Formación (`swapInBtn(fromDef, fromPos, toEntry,
      toDef)`), usando `toDef.name` para mostrar y `toEntry.uid` solo para
      la operación real de `setBandSlot`.
    - **Comparar estadísticas base**: `UI.showCompare` gana un parámetro
      `mode` ('current', por defecto — nivel/estrellas/equipo ya sumados —
      o 'base') con dos botones para alternar entre ambas sin cerrar la
      comparación. "Base" reutiliza `buildUnitStats(defId, 1)` (combat.js,
      la misma fórmula que ya usa la ficha de solo lectura de la Pokédex
      para "Estadísticas base Nv.1") — nivel 1, sin estrellas de
      Superfusión ni equipo puesto — para poder ver qué forma es realmente
      mejor "de fábrica" sin que la inversión ya hecha en una de las dos
      decida la comparación.
    Verificado con Playwright: el medallón desaparece en el selector de
    línea de una batalla real pero sigue mostrándose con normalidad en la
    rejilla de Colección; el botón de sustituir y el aviso posterior ya no
    contienen "undefined" en ningún caso; alternar entre "Actuales" y
    "Base" con un luchador subido de nivel (Nv.15, 2 estrellas) cambia de
    verdad las cifras mostradas (ataque 53→19, vida 384→138) y marca el
    botón activo correcto.

- [x] **El cristal garantizado del jefe de zona solo se da la primera vez /
    auditoría de las tasas de invocación**. El usuario preguntó (con
    razón) si rejugar el jefe de la zona 1 para farmear Voxite gratis sin
    límite no rompía el juego, y por separado si las tasas de rareza de
    los cristales eran de verdad las que decían o había algún bug (le
    tocaron 2 legendarios en solo 6 Voxite).
    - **Auditoría de tasas de invocación (sin bug)**: se simuló
      `rollCrystalRarity('voxite')` 200.000 veces fuera del navegador (con
      `vm` de Node cargando data.js/state.js tal cual) — el resultado
      (legendario 2.95% vs 3% declarado, épico 17.02% vs 17%, el resto
      igual de ajustado) confirma que el algoritmo de tirada pondera bien
      y no hay ningún bug. La probabilidad real de sacar 2 o más
      legendarios en solo 6 Voxite (p=3% cada uno) es ≈1,25% — rara, pero
      nada indica que no fuera solo suerte.
    - **Cristal de jefe solo garantizado la primera vez**: `stageRewards`
      (combat.js) no distinguía primera vez de repetición — rejugar el
      jefe de la zona 1 (un solo enemigo, trivial con Auto + velocidad 3×)
      daba Voxite GARANTIZADO cada vez más 30% de Doxite extra, así que
      cualquiera podía acumular cristales caros sin límite y saltarse la
      escasez del gacha. Ahora recibe un nuevo parámetro `isFirstClear`
      (calculado en `UI.fightStageRunNode`, ui.js, comparando contra
      `highestClearedStage` ANTES de que `recordStageClear` actualice el
      progreso): con `true` se mantiene el Voxite garantizado + 30% de
      Doxite de siempre (la recompensa real es por VENCER al jefe la
      primera vez, no por pelear contra él); con `false` (cualquier
      repetición, incluida la etapa normal rejugada) baja a 20% de Voxite
      y 5% de Doxite, del mismo orden que una etapa normal. El equipo
      (70% siempre) no se tocó — no es lo que rompía la economía.
    Verificado con Playwright: simulación de 2.000 llamadas a
    `stageRewards` confirma 100%/28,5% (voxite/doxite) en primera vez y
    20,1%/4,4% en repetición, ajustado a los porcentajes objetivo; y una
    prueba de extremo a extremo con la banda a nivel 40 y energía
    infinita, jugando el jefe de la zona 1 de verdad a través de todo el
    flujo de combate (Auto + `pickAutoGroup`), dio exactamente 1 Voxite en
    la primera victoria y 9 Voxite en 40 repeticiones reales posteriores
    (22,5%, dentro de lo esperable para un 20% con esa muestra).

- [x] **La rareza del equipo que sueltan los jefes tampoco sube sin límite
    al repetirlos**. Continuación directa de la entrada anterior: el
    usuario preguntó si rejugar jefes no soltaba también demasiado equipo,
    y tenía razón — era un problema más grave todavía que el de los
    cristales.
    - `gearDropRarity(globalIdx)` hacía crecer la probabilidad de
      Legendario CON `globalIdx` sin ningún techo — combinado con el 70%
      de probabilidad de soltar equipo en cualquier jefe (frente al 30% de
      una etapa normal), simulando 100.000 combates por caso: el jefe de
      la ZONA 1 (el más fácil del juego) ya daba ~7% de Legendario por
      victoria; zona 3, ~18%; zona 6, ~35%; zona 16 en adelante,
      prácticamente el 100% garantizado. Cualquiera que desbloqueara una
      zona avanzada podía volver a un jefe ya vencido y farmear equipo
      Legendario casi seguro, indefinidamente.
    - Mismo arreglo que con el Voxite: `gearDropRarity` gana un segundo
      parámetro `isFirstClear` — con `true` (o sin pasarlo, para no tocar
      las etapas normales ni la Mazmorra Elemental) se comporta exactamente
      igual que antes; con `false` (solo lo pasan las repeticiones de
      jefe, desde `stageRewards`) usa una tabla de rareza FIJA, la misma
      en cualquier zona, sin el bonus de `globalIdx`.
    Verificado: simulación de 100.000 combates por zona confirma que la
    probabilidad de Legendario en primera vez no cambió (6,90%/17,99%/
    35,20%/69,89% en zonas 1/3/6/16) mientras que en repetición queda
    plana alrededor del 2% en las cuatro zonas; y con Playwright, 150
    repeticiones reales del jefe de la zona 1 (banda a nivel 40, energía
    infinita) llenaron el inventario de equipo (60/60) con solo 1
    Legendario de 60 piezas (1,7%, coherente con la tabla fija).
    - El mismo problema en la Mazmorra Elemental (ver más abajo) se
      confirmó y arregló en la siguiente entrada.

- [x] **Mismo arreglo en la Mazmorra Elemental**: el usuario confirmó que
    quería el mismo tratamiento ahí. `elementalDungeonRewards()`
    (combat.js) tampoco distinguía primera vez de repetición — daba Voxite
    garantizado + 40% de Doxite Y equipo con la rareza fija de su zona
    ("Cantera Devorada", ~58% de Legendario) CADA vez que se completaba,
    aunque es contenido explícitamente repetible (tiene su propio contador
    `state.elementalClears`). Mismo patrón: gana un parámetro
    `isFirstClear` (calculado en `UI.fightStageRunNode`, ui.js, como
    `!state.elementalClears[run.elementId]` antes de que
    `recordElementalClear` lo actualice) — con `true` se comporta
    exactamente igual que antes (Voxite+Doxite garantizados, rareza de
    equipo alta), con `false` el Voxite baja a 25%/Doxite a 8% y el equipo
    (que sigue siendo 100% garantizado, eso no cambió) usa la tabla de
    rareza fija en vez de la de la zona. Los valores de repetición son algo
    más altos que los de un jefe de zona normal (20%/5%) porque la
    Mazmorra es un combate más largo y exigente (varias oleadas, con
    desventaja elemental de partida) cada vez que se repite.
    Verificado con una simulación directa de 100.000 llamadas a
    `elementalDungeonRewards` por caso: primera vez sin cambios
    (100%/58,0% voxite/legendario), repetición plana (25,1%/2,94%). No se
    forzó una victoria real de extremo a extremo con Playwright para esta
    (el equipo de prueba pierde contra la Mazmorra por el mismo motivo que
    contra un jefe avanzado — desventaja elemental + rivales fuertes en
    varias oleadas, requeriría un equipo bien equipado para ganar de
    verdad) — se confirmó en su lugar que `UI.startElementalDungeon`
    arranca la Mazmorra correctamente y que el cálculo de `isFirstClear`
    en el punto de llamada usa el mismo orden ya probado (antes de
    `recordElementalClear`) que la versión de jefes de zona, ya verificada
    de extremo a extremo.

- [x] **El Texel/XP del jefe también baja al repetirlo / el reborde de la
    Formación marca el tier del personaje**. Dos pedidos del usuario en la
    misma ronda.
    - **Texel/XP de jefe, solo desproporcionado en repetición**: un jefe es
      UNA sola oleada, mientras que la recompensa de una etapa normal ya
      cubre sus 2-3 oleadas juntas en un único pago — con el mismo ×3/×2.5
      en cualquier repetición, el jefe pagaba de 8 a 23 veces más Texel/XP
      por combate individual que jugar el resto de la etapa (228 Texel /
      108 XP por UNA oleada en el jefe de la zona 1, frente a ~10-23
      Texel / ~7-13 XP por oleada en una etapa normal de esa misma zona),
      con diferencia la forma más eficiente de farmear ambos. La primera
      vez mantiene el premio completo (×3/×2.5, recompensa real por
      avanzar); las repeticiones bajan a ×1.5/×1.5 en `stageRewards`
      (combat.js) — sigue pagando algo más que una etapa normal, pero ya
      no de forma desproporcionada. No se tocó la Mazmorra Elemental esta
      vez (el usuario preguntó específicamente por "los jefes").
    - **Reborde de Formación por tier**: `UI.renderBanda` (ui.js) calcula
      ahora `rarityInfoFor(def)` para cada hueco ocupado y le pone la
      misma clase `rarity-<id>` y las variables CSS `--rc`/`--rg` que ya
      usa `creatureCard` en la Colección — el CSS nuevo
      (`.formation-slot:not(.empty) { border-color: var(--rc, ...); }`)
      hace que el borde adopte el color de la rareza, y de paso hereda
      gratis el resplandor/animación que ya tienen las clases `.rarity-*`
      genéricas (pulso en Legendario, flotación en Raro+). El hueco central
      conserva su marco dorado especial SOLO mientras está vacío (para
      seguir señalando cuál es el puesto de líder); en cuanto hay alguien
      colocado, gana el color de su propia rareza como cualquier otro hueco.
    Verificado con Playwright: `stageRewards` da 228/108 en la primera
    victoria del jefe de la zona 1 y exactamente 114/65 en la repetición
    (×1.5 preciso), sin tocar la etapa normal (20/15 igual que siempre); en
    la Formación, un luchador Común y uno Legendario colocados en huecos
    distintos muestran colores de borde distintos y correctos (gris vs
    dorado/naranja), los huecos vacíos normales mantienen el marco
    marrón-dorado de siempre y el hueco central vacío sigue en dorado
    pleno.

- [x] **El camino a un jefe era más duro que el propio jefe — rebalanceo
    del relleno de las etapas normales**. El usuario notó que los mobs del
    camino mataban a más criaturas que el jefe al que llevan, y preguntó
    si eso desvirtuaba la curva de dificultad.
    - **Confirmado, y peor de lo que parecía**: los jefes se calibraron a
      fondo por simulación en una ronda anterior de este mismo trabajo; el
      relleno de las etapas normales nunca pasó por ese ajuste, solo usa
      la fórmula de rareza×nivel tal cual (la misma que un luchador del
      jugador de esa rareza/nivel). Como cada etapa encadena 2-3 oleadas
      SIN curación entre ellas, un enfrentamiento "igualado" oleada a
      oleada se volvía desgaste imposible: simulando miles de combates con
      un equipo a la altura de su zona (misma rareza que el propio relleno
      de esa zona), las etapas normales de las zonas media/tardías tenían
      una tasa de DERROTA del 100% — mientras que el jefe de esa misma
      zona no perdía NUNCA (0%). Justo lo contrario de lo que se espera.
    - **Arreglo**: `MOB_POWER_MULT = 0.72` (combat.js), aplicado solo al
      relleno de las etapas normales vía el `extraMult` de `makeUnit` (ya
      existía para el Duelo por apuesta) — no toca ni jefes, ni Torre
      Batalla, ni Mazmorra Elemental. El valor se afinó probando 0.65
      (demasiado flojo, ~8% de derrota) y 0.78 (demasiado duro, ~49%) antes
      de converger en 0.72 (~26% de derrota en una muestra de 9 zonas
      repartidas por todo el mapa, con equipos de composición aleatoria
      para no sesgar por clase).
    - **Nota para el futuro, no bloqueante**: incluso con el multiplicador
      ya aplicado, la zona 17 ("Desierto de Espinas", índice 16) sigue
      quedando algo por encima del resto (~41-44% de derrota en las dos
      rondas de simulación, frente a un 13-36% en el resto de zonas
      probadas) — el mismo tipo de "pico" aislado que ya se corrigió una
      vez en Dracorex durante el rebalanceo de jefes. No se tocó esta
      ronda por estar fuera de lo preguntado (era sobre la relación
      camino/jefe en general, no una zona en particular), pero merece una
      mirada aparte si se nota especialmente dura jugando.
    Verificado con Playwright, con las funciones REALES del juego
    (`buildEnemyBand`, no una reimplementación aparte): el ataque de un
    mob de muestra baja de 42 a 31 con el multiplicador aplicado; y tras el
    arreglo, jugando de verdad zonas 1/9/17/25/31, las etapas normales caen
    a 13,6%-41,4% de derrota (antes 100% en las tardías) mientras el jefe
    de esas mismas zonas se mantiene en 0-20% (sin cambios, dentro del
    ruido esperado de una muestra de 20 combates).

- [x] **¿Por qué los jefes no matan a nadie? (análisis, sin cambios de
    código) / filtro y venta múltiple de equipo sin usar / la probabilidad
    misma de que un jefe repetido suelte equipo también baja mucho**. Tres
    pedidos del usuario en la misma ronda.
    - **Análisis de por qué los jefes se sienten inofensivos**: se simuló
      el jefe de 5 zonas repartidas por el mapa con el mismo equipo "a la
      altura de su zona" de la entrada anterior, probando 3 niveles de
      inversión de equipo (multiplicador de estadísticas uniforme:
      1.0=sin nada, 1.15=equipo ligero, 1.3=equipo decente). Con CERO
      equipo, el jefe es un reto real: 9,3% de derrotas, 1,03 luchadores
      caídos de media, y un combate ganado deja a la banda con solo el 51%
      de su vida total de media — nada inofensivo. Pero con un 15% extra
      de estadísticas (equipo ligero, nada del otro mundo) ya cae a 2,7%
      de derrotas y 0,40 caídos; con un 30% extra (equipo decente) es
      0% de derrotas y solo 0,12 caídos — el jefe deja de suponer ningún
      riesgo real. **Conclusión**: los jefes SÍ son un reto de verdad para
      un equipo sin ninguna pieza de equipo puesta (que es como se
      calibraron), pero pierden casi todo su filo en cuanto el jugador
      lleva encima aunque sea poco equipo — lo cual, con las mejoras
      recientes al drop de equipo, pasa bastante rápido. No es que estén
      "rotos", es que la curva de dificultad de los jefes es muy sensible
      al equipo y probablemente el jugador ya iba, sin saberlo, muy por
      encima del caso base con el que se calibraron. No se tocó ningún
      valor de jefe esta vez — el usuario pidió opinión, no un ajuste; si
      se quiere que los jefes sigan suponiendo reto incluso con equipo
      puesto, haría falta volver a calibrarlos (con simulación, como la
      ronda original) contra un caso base con algo de equipo en vez de
      ninguno, lo cual toca los 31 jefes de nuevo.
    - **Filtro y venta múltiple de Equipo**: la pantalla Equipo gana un
      selector (Todo/Solo sin usar/Solo equipado, `UI.gearFilterMode`) y
      un botón de selección múltiple (mismo patrón que ya existía en
      Colección) — `UI.gearBulkMode`/`UI.gearBulkSelection` en ui.js,
      `renderGearBulkActionBar` calcula el valor total en Texel
      (`gearStatValue(g) * 2`, la misma fórmula que vender una pieza
      suelta) y vende todas las seleccionadas de golpe tras confirmar.
      Tocar una pieza EQUIPADA en modo selección la rechaza con un aviso
      en vez de añadirla (hay que quitársela a su dueño primero).
    - **Probabilidad de equipo de jefe repetido, mucho más baja**: la
      ronda anterior ya bajó la RAREZA del equipo de jefe repetido a una
      tabla fija, pero la probabilidad misma de que caiga algo seguía en
      70% siempre. Ahora baja a 8% en las repeticiones (`bossGearChance`
      en `stageRewards`, combat.js) — la primera vez no cambia.
    Verificado con Playwright: el filtro separa correctamente sin
    usar/equipado (3 y 1 de 4 piezas de prueba); seleccionar y vender 3
    piezas sin usar da el Texel correcto y las quita del inventario sin
    tocar la equipada; y `stageRewards` da equipo ~69% de las veces en la
    primera victoria del jefe (sin cambios) y ~8% en la repetición (antes
    70%).

- [x] **Auditoría exhaustiva de la curva de dificultad completa, con el
    motor de combate real jugando partidas de principio a fin / el jefe
    nunca puede quedarse en 0 de daño real**. El usuario contó su
    experiencia real (partida nueva, 3 iniciales + 6 invocaciones de los
    cristales de inicio, arrasó la zona 1 entera sin que el jefe le
    derrotara a ninguna criatura) y pidió una revisión exhaustiva de toda
    la dificultad del juego.
    - **Reproducido exacto**: jugando la zona 1 de verdad (motor de combate
      real, sin atajos) con una banda de 3 iniciales + 6 invocaciones, 0
      bajas en las 8 etapas — jefe incluido, que no llegó a hacer daño
      relevante.
    - **Causa raíz**: la dificultad de cada zona/jefe es una función FIJA
      de su índice — nivel y rareza del rival no dependen en nada de lo
      fuerte que sea la banda real del jugador. Pero las invocaciones no
      están limitadas a la rareza de la zona en la que se está — con solo
      6 cristales de inicio (5 Pixite + 1 Voxite) es fácil sacar algo Raro
      o Épico, que a nivel 1 ya supera en estadísticas a cualquier rival
      Común de la zona 1. Si toca algo así de entrada, la zona entera
      (jefe incluido) se vuelve un paseo.
    - **Auditoría con partidas completas simuladas** (banda de mayor
      poder, invocando con cada cristal que cae, jugando zona a zona con
      el motor de combate real — no una aproximación con equipos
      sintéticos como en rondas anteriores): el patrón NO es "todo fácil"
      ni "todo difícil" — es siempre el mismo desde el principio: zonas
      1-2 un paseo perfecto (0 bajas) sea cual sea la suerte de invocación,
      y sobre la zona 2-3 aparece un muro real (una partida se atascó 5
      intentos seguidos en la etapa 3 de Cuevas de Cristal, con la banda
      solo a nivel 7). Desde ese muro, repetir una etapa fácil ya superada
      solo 20 veces (rápido con Auto + velocidad 3×) bastó para subir lo
      suficiente y superarlo — el bucle de "si te atascas, grindea un
      poco" ya funciona bien, así que no hacía falta tocarlo.
      (Nota de método: la primera pasada de esta auditoría, con un tope de
      3.000 pasos por combate, dio un falso "atascado" en una zona — un
      combate real simplemente necesitaba más pasos para resolverse y el
      tope cortaba la simulación a medias, leyendo el resultado de un
      combate anterior por error. Subir el tope a 20.000 y distinguir
      explícitamente "resultado real" de "tope agotado" lo confirmó: 0
      combates realmente colgados en la auditoría final.)
    - **Arreglo, alcance acotado a pedido del usuario ("solo el jefe")**:
      nuevo `bossAdaptiveMult(state, zoneIdx)` en state.js — compara el
      "poder" medio de la banda actual (misma fórmula que ya se usó en
      esta ronda de simulaciones: hp×0.3 + atk + def + agi×0.5 + wis×0.5)
      contra el de un luchador "a la par" de esa zona (misma rareza que su
      propio relleno, al nivel del jefe, sin equipo — la referencia ya
      usada para calibrar los jefes). Si la banda no supera esa
      referencia, el multiplicador es exactamente 1× — un jefe ya
      calibrado para una banda floja no cambia en nada. Si la supera, el
      jefe sube (ataque/defensa/vida, vía el `extraMult` que ya tenía
      `makeBossUnit` desde el Duelo por apuesta) según la raíz cuadrada del
      exceso — amortiguado a propósito (una banda 4× más fuerte solo sube
      el jefe 2×, no 4×) y con techo en 3×, para que el mérito de invocar
      bien se siga notando sin volver al jefe imposible ni dejarlo sin
      ninguna oportunidad real de golpear. Se aplica solo a la pelea normal
      del jefe en el Mapa (`UI.startStageBattle`); el Duelo por apuesta
      mantiene su propio refuerzo fijo de antes, sin cambios.
    Verificado con Playwright: `bossAdaptiveMult` da ~1,0-1,05× (ruido de
    variación de estadísticas, no un cambio real) para una banda "a la
    par" en dos zonas distintas, y 1,73× para una banda de Legendarios a
    nivel 1 contra el jefe de la zona 1; comparación A/B con la MISMA banda
    extrema (todo Legendario/Épico a nivel 1) contra el jefe de la zona 1:
    sin el arreglo, ~7,5 de daño recibido de media (irrelevante); con el
    arreglo, ~323,2 de media — más de 40 veces más. La reproducción íntegra
    del caso original ahora sí recibe daño real del jefe.

- [x] **La etiqueta "¡Nuevo!" no desaparecía al cerrar la ficha de un
    luchador**. El usuario notó que la marca seguía en la tarjeta de la
    Colección incluso después de cerrar el perfil, hasta cambiar de
    pantalla y volver a Banda. Causa: `UI.openFighterModal` ya ponía
    `entry.isNew = false` y guardaba la partida al abrir la ficha, pero
    nunca volvía a pintar la rejilla de la Colección — la tarjeta ya
    dibujada en pantalla no se enteraba del cambio hasta el siguiente
    `UI.renderBanda` (al reentrar a esa pantalla). Ahora, si la pantalla
    activa es Banda, se refresca ahí mismo al abrir la ficha, así que la
    etiqueta desaparece al momento en vez de quedarse hasta salir y volver.
    Verificado con Playwright: la etiqueta está presente antes de abrir la
    ficha, desaparece en cuanto se abre (sin ni siquiera cerrarla todavía),
    y sigue sin aparecer después de cerrar el modal.

- [x] **Los cristales de repetir un jefe seguían siendo demasiado
    generosos**. El usuario preguntó por el porcentaje exacto (20% Voxite
    / 5% Doxite tras la ronda anterior) y coincidió en que seguía siendo
    más rentable que jugar una etapa normal (35% de Pixite, el cristal más
    flojo) — repetir el jefe más fácil del juego con Auto + velocidad 3×
    no debía seguir siendo la mejor fuente de Voxite. Propuso los números
    y se aplicaron tal cual: en la repetición, 10% Pixite / 3% Voxite / 1%
    Doxite (antes 0% / 20% / 5%) — ahora apunta sobre todo al cristal más
    flojo, con Voxite/Doxite como rareza puntual en vez de la norma. La
    primera vez (Voxite garantizado + 30% Doxite) no cambia.
    Verificado con una simulación de 100.000 llamadas a `stageRewards`:
    9,98% / 2,96% / 1,03% en la repetición (ajustado a los porcentajes
    pedidos), primera vez sin cambios.

- [x] **Ordenar criaturas por stats individuales y por stat global, de
    carta base y de actual**. Pedido: poder ordenar la Colección por
    HP/Ataque/Defensa/Agilidad/Sabiduría por separado y por un "poder"
    global (suma de las 5), y elegir si esas cifras son las ACTUALES
    (nivel/estrellas/equipo puestos, vía `fighterStats`) o las de BASE
    (Nv.1 de fábrica, sin nada de eso — misma fórmula que el modo "Base" ya
    existente en Comparar, vía `buildUnitStats`/`baseCompareStats`).
    Implementación: `sortRosterEntries(state, roster, mode, variant)`
    ahora acepta 6 modos nuevos (`poder`, `hp`, `atk`, `def`, `agi`, `wis`)
    además de los 6 ya existentes, y un `variant` ('current'/'base') que
    solo afecta a esos 6. En Colección (`#rosterSortSelect`) se añadieron
    esas 6 opciones al desplegable, más un toggle Actuales/Base
    (`#rosterStatVariantRow`, reutilizando el mismo patrón visual
    `.compare-mode-row` de Comparar) que solo se muestra cuando el modo de
    orden activo es uno de stat. La misma extensión se aplicó al selector
    compartido de los pickers (`SORT_OPTIONS`/`buildSortSelect`, usado al
    elegir hueco de Formación, sustituir un luchador colocado, elegir
    campeón de Retos y elegir el segundo luchador de Comparar) para que
    también se pueda ordenar por poder/stat ahí, con su propio toggle
    Actuales/Base (`UI.pickerStatVariant`, independiente del de Colección).
    Verificado con Playwright: el orden real de las tarjetas en pantalla
    coincide exactamente con `sortRosterEntries` para 'poder' (actual y
    base) y para 'hp'; alternar a Base cambia el orden respecto a Actuales
    en un roster con niveles/estrellas/equipo variados; el toggle
    Actuales/Base se oculta en modos no numéricos (p. ej. 'tier') y
    reaparece en modos de stat; en el picker de Formación, el desplegable
    incluye las nuevas opciones y el toggle Base/Actuales funciona
    (cambia la clase `active` correctamente tras reconstruir el panel).

- [x] **La curva de dificultad se aplanaba tras el tope de nivel 40**.
    Diagnóstico pedido: "una vez llegas por primera vez a los rivales de
    Nv.40, subes de nivel al equipo para poder pasártelo, pero como es el
    nivel máximo, la curva de dificultad se para ahí, tu equipo sigue
    mejorando pero los rivales no, así que siempre ganas todo sin
    dificultad". Confirmado: el nivel del rival (`1 + globalIdx`, capado en
    `XP_LEVEL_CAP`=40) toca ese tope justo en el jefe de Ruinas Abisales
    (zona índice 4 de 33) y la rareza del pool de cada zona también tope en
    Épico desde la zona 6 (Guarida del Dragón) — ambos ejes se quedan
    PLANOS las ~28 zonas restantes (85% del mapa), mientras el poder del
    jugador no tiene techo (equipo, Superfusión hasta 5★, invocaciones
    legendarias sin relación con la zona en la que esté). Solo el jefe
    tenía algo de escalado adaptativo (`bossAdaptiveMult`, tope ×3); el
    camino normal usaba un multiplicador fijo (`MOB_POWER_MULT`=0.72) sin
    ninguna reacción al progreso del jugador.
    Se plantearon 3 direcciones (quitar el tope de nivel al rival sin más,
    escalado adaptativo también en el camino normal, o combinar una curva
    determinista por zona con revisar el tope del jefe) — el usuario eligió
    combinar ambas. OJO: quitar sin más el tope de nivel al rival YA se
    había probado antes y se descartó (ver el comentario de
    `buildEnemyBand`): sin tope, el rival llegaba a nivel 264 en la última
    zona frente al tope 40 del jugador, más de 5× su multiplicador de stats
    — matemáticamente imposible. Implementación: nuevo `lateZoneMult(zoneIdx)`
    (`data.js`, junto a `XP_LEVEL_CAP`) — 1× hasta la zona del tope de nivel
    (índice 4) y a partir de ahí `1 + √(zonas_pasado_el_tope) × 0.35`, mucho
    más suave que la escalada lineal por nivel para no repetir esa
    explosión (en la última zona, ×2.85). Se aplica como multiplicador
    extra a `MOB_POWER_MULT` en los mobs del camino (`buildEnemyBand`,
    combat.js) y al TECHO del escalado adaptativo del jefe (`3 ×
    lateZoneMult`, antes fijo en 3, en `bossAdaptiveMult`, state.js) — así
    el jefe conserva margen para seguir por delante de su propio camino en
    zonas avanzadas. No toca las zonas 0-4 (nada cambia en early game) ni
    el nivel/rareza tope en sí, solo añade una segunda curva, determinista
    por zona (no depende de la banda actual del jugador, así que rejugar
    zonas ya superadas sigue siendo tan farmeable como antes).
    Verificado: simulación pura confirma la curva (mult del camino de 0.72×
    en zona 4 a 2.05× en zona 32; techo del jefe de 3× a 8.56×), sin
    explosión. Con Playwright, una banda de control en zona 1 sigue
    ganando sin recibir ni un punto de daño (cero regresión en zonas
    tempranas); una banda del TOPE teórico (9 legendarios Nv.40, 5★, equipo
    legendario Nv.10 en Formación completa) gana en las zonas 29 y 32
    (camino y jefe) pero ahora SÍ recibe daño real (antes, 0) — ya no es un
    paseo garantizado; y sigue siendo matemáticamente superable (no se
    reprodujo la explosión del bug antiguo). Una banda "a la altura de su
    zona" (rareza nativa del pool + solo 2★ + equipo Raro Nv.3, sin
    optimizar) pierde el camino normal en zonas tardías y el jefe de la
    última zona — dificultad real esperable para quien no ha invertido, sin
    afectar al jefe de una banda realmente a la par (el multiplicador
    adaptativo del jefe solo sube del 1× cuando la banda ya supera el
    nivel "a la par" de esa zona, igual que antes).

- [x] **Los jefes de la Torre Batalla no suponían ningún reto** (pedido:
    "quiero subir en general la dificultad de los bosses en la torre
    batalla, todos tienen que ser un reto, es el final del juego"; mobs
    dejados tal cual, a petición explícita). Diagnóstico: `buildTorreEncounters`
    nunca pasaba ningún extraMult a `makeBossUnit` — cada jefe peleaba con
    sus fixedStats de zona TAL CUAL, calibradas para un jugador "a la par"
    de SU zona de origen en el Mapa, no para uno que ya terminó el mapa
    entero (que es literalmente el único que puede llegar a la Torre). En
    pruebas, el primer nivel de jefe (zona 0) apenas hacía 1 de daño a una
    banda de fin de mapa normal.
    Implementación: nueva `torreBossMult(state, level)` en state.js,
    reutilizando `bossAdaptiveMult(state, level.originZoneIdx)` — el MISMO
    mecanismo ya calibrado del Mapa, referenciado a la zona de ORIGEN de
    cada jefe. Así un jefe de zona temprana, medido contra la banda real
    (de nivel endgame) del jugador, sube hasta su techo; uno de zona
    tardía, cuya referencia ya está cerca del ritmo endgame, apenas
    cambia (ya era un reto real). PERO cada jefe se repite
    `level.enemyCount` veces SEGUIDAS sin curación (hasta 5×) — aplicar el
    techo pensado para UN único encuentro del Mapa sin más volvía el
    último nivel IMPOSIBLE hasta para la mejor banda teóricamente
    alcanzable (0/5 combates ganados en pruebas). Se amortigua el EXCESO
    sobre 1× dividiéndolo entre `√level.enemyCount` — en enemyCount=1 (los
    primeros niveles de jefe) no se amortigua nada, porque ahí es donde
    hace falta la subida completa.
    Verificado con Playwright (banda "recién llegada", épica Nv.40 2★
    equipo Raro Nv.3, y banda TOPE teórico, 9 legendarios Nv.40 5★ equipo
    legendario Nv.10): los mobs de Torre (índices 0/8/20/32) idénticos a
    antes (0/2845/544/2973 de daño, sin cambios); los primeros niveles de
    jefe pasan de ~1 de daño a 216-1366; el nivel final (66, jefe final
    ×5) hace perder a la banda "recién llegada" (23470 de daño) y, tras
    amortiguar por √5, la banda TOPE lo gana consistentemente pero con
    daño real (5/5 victorias, 4505-7423 de daño en la ronda anterior a
    amortiguar — 0/5; 5/5 tras amortiguar, 5116-7299 de daño) — nunca
    matemáticamente imposible, siempre un reto real. Nivel 34 (primer
    jefe, zona 0 de origen) se queda en unos pocos puntos de daño incluso
    tras el ajuste — límite estructural aceptado (un jefe SOLO contra una
    Formación de 9 nunca puede escalar tanto como uno acompañado sin
    volverse injustamente tanque; el propio jefe de zona 0 del Mapa tiene
    la misma limitación).

- [x] **Bug: el nivel del rival mostraba siempre "Nv. 40" sin reflejar el
    refuerzo de zona/adaptativo**. Causa: `makeUnit`/`makeBossUnit` guardan
    `level` como el nivel NOMINAL (capado en XP_LEVEL_CAP) pasado a
    `buildUnitStats`, pero las estadísticas reales sí llevan aplicado el
    extraMult (lateZoneMult, bossAdaptiveMult...) — la ficha de combate
    (`UI.showBattleUnitStats`) solo mostraba ese nivel nominal, sin ningún
    indicio del refuerzo. Fix: nuevo campo `powerMult` en la unidad
    (`extraMult || 1`), mostrado como "· 💪 Reforzado ×N.NN" junto al
    nivel cuando `powerMult > 1.02` (evita marcar como "reforzado" el
    MOB_POWER_MULT=0.72, que es un NERF, no un refuerzo) y solo en
    rivales, nunca en el propio luchador. Verificado con Playwright: una
    unidad de camino en zona 32 (powerMult≈2.05) muestra "Nv. 40 · 💪
    Reforzado ×2.05"; una de zona 0 (powerMult=0.72, sin refuerzo) muestra
    solo "Nv. 4", sin la etiqueta.

- [x] **Auditoría completa de la dificultad del juego** (pedido explícito,
    para asegurar que esta clase de fallo — dificultad que deja de
    escalar mientras el jugador sigue mejorando sin límite — no reaparezca
    en otro sistema). Revisados todos los puntos donde se genera un rival
    de combate:
    - **Mapa (camino y jefe)**: ya arreglado (ver entrada anterior de
      `lateZoneMult`).
    - **Torre Batalla (jefes)**: ya arreglado arriba (`torreBossMult`).
      Torre (mobs): revisados, sin cambios a petición del usuario — su
      única imperfección conocida (el orden no es estrictamente monótono,
      porque el tope de rareza de cada familia es independiente de en qué
      zona aparece primero) no afecta a los dos momentos que más importan
      (entrada trivial a propósito, nivel final un reto real), así que se
      deja tal cual.
    - **Duelo por Apuesta (revancha contra un jefe ya vencido)**: BUG real
      encontrado y arreglado. Usaba un refuerzo fijo (`WAGER_BOSS_BOOST`
      ×1.3) sin ningún escalado adaptativo — el mismo fallo de fondo que
      el jefe del Mapa antes de arreglarlo, pero AQUÍ además con un
      exploit de economía detrás: es repetible sin límite (a diferencia
      del jefe del Mapa) apostando Texel al doble. Combinado con que era
      la ÚNICA actividad de combate repetible del juego sin coste de
      Energía, una banda de fin de mapa normal (ni siquiera el tope
      teórico) ganaba la apuesta de la zona más floja arriesgando solo
      5-28 de daño — Texel gratis, sin límite de intentos. Doble fix: (1)
      `WAGER_BOSS_BOOST * bossAdaptiveMult(state, zoneIdx)` en vez del
      ×1.3 fijo, mismo mecanismo que el jefe del Mapa; (2) coste de
      Energía (`STAGE_ENERGY_COST`, igual que Etapas y Torre) añadido a
      `UI.startWagerDuel`, que antes no descontaba nada — pone un tope
      real a cuántos intentos gratis son posibles, tenga o no riesgo real
      esa zona en concreto (el mismo límite estructural de "jefe solo
      contra Formación de 9" que en Torre nivel 1 hace que incluso la
      banda tope apenas reciba daño en la zona más floja). Verificado con
      Playwright: banda "a la par" de su zona sin cambios apreciables (mismo
      orden de daño que antes, ~6700-9300); coste de Energía descontado
      correctamente (100→94 con STAGE_ENERGY_COST=6) y bloqueado sin
      gastar Texel si no hay energía suficiente.
    - **Mazmorra Elemental (Guardián)**: revisada, sin cambios. Es
      contenido de mitad de partida por diseño (se desbloquea mucho antes
      que el mapa completo, ver el comentario de `ELEMENTAL_DUNGEONS` en
      data.js) y sus recompensas ya estaban gateadas contra el mismo tipo
      de exploit (`isFirstClear`, arreglado en una ronda anterior) — que
      se vuelva cómoda de farmear en fin de partida es la evolución
      esperable de contenido de mitad de partida, no un fallo.
    - **Arena**: revisada, sin cambios. `buildArenaBand` sube de nivel
      sin ningún tope (`rank * 1.8`, sin `Math.min(XP_LEVEL_CAP, ...)`) —
      a primera vista el mismo patrón, pero aquí es al revés: es un
      ranking de "sube mientras puedas" (perder no baja de rango, solo
      no sube), sin gatear nada más del juego y con logros hasta el
      Rango 50 — llegar a un techo natural donde ya no se puede seguir
      subiendo es el diseño previsto de un ranking así, no un fallo de
      progresión bloqueada.
    - **Prueba del Campeón**: revisada, sin cambios. `buildChampionOpponent`
      sí topa en XP_LEVEL_CAP y su rareza satura sobre el duelo ~20, pero
      es un modo de racha (sin curación entre duelos, un solo luchador) —
      su reto viene del desgaste acumulado duelo a duelo contra un fondo
      de rivales fuertes y acotados, no de que cada rival individual siga
      escalando; ese es un mecanismo de dificultad distinto y válido, no
      el mismo bug.

- [x] **Modo Roguelike en Retos** (pedido explícito): "añade un modo en
    retos que sea roguelike". Cumple además la sugerencia pendiente de
    "Torre infinita" (ver arriba, sugerida por Claude en una ronda
    anterior). Se desbloquea al superar los 66 niveles de la Torre Batalla
    al menos una vez (o antes desde Ajustes → "Roguelike (modo de
    prueba)", mismo patrón que Torre/Mazmorra Elemental). Diseño:
    - **Rondas sin fin**: una fila rival (1-3 luchadores, crece con la
      ronda) por ronda, generada por `buildRoguelikeEnemyRow(round)` en
      combat.js — nivel y rareza SIN techo a propósito (como Arena: la
      gracia es ver hasta dónde se llega, no que sea siempre superable).
    - **Sin curarse entre rondas**: vida y carga de ulti persisten de una
      ronda a la siguiente (mismo patrón que un recorrido de etapa/Torre/
      Prueba del Campeón) — perder termina la run entera, sin afectar a la
      Colección real del jugador.
    - **Bonos entre rondas** (la pieza específicamente "roguelike" del
      modo, ausente en Torre/Arena/Prueba del Campeón): al superar una
      ronda se eligen 3 de 7 bonos al azar (`ROGUELIKE_BOONS` en
      combat.js) — +15/20% a una stat (ataque/defensa/vida/agilidad/
      sabiduría, acumulativo el resto de la run) o un efecto inmediato
      (curar al 50% y revivir a un caído, o ulti lista para la próxima
      ronda). Reutiliza el picker genérico (`UI.openRoguelikeBoonPicker`).
    - Recompensas de Texel/XP por cada ronda superada (crecientes,
      `roguelikeRoundRewards`); se guarda la mejor ronda alcanzada
      (`state.roguelike.bestRound`, mostrada en Retos y en Objetivos) y 3
      logros nuevos (ronda 5/15/30, sección "Retos especiales" de
      `OBJECTIVES`).
    - Implementación técnica: `window.__roguelikeRun` (solo en memoria,
      como `window.__championRun` — no sobrevive a un recargo de página,
      solo el récord se guarda), rama nueva en el `battleCloseBtn` de
      main.js, y las salidas `roguelikeContinue`/`roguelikeDefeat` en el
      resumen de combate de ui.js.
    Verificado con Playwright: bloqueado sin el ajuste de prueba,
    desbloqueado con él; coste de Energía descontado UNA vez al empezar la
    run (no por ronda); vida persiste entre rondas (no se cura); una banda
    épica/Nv.40/3★/equipo Raro Nv.5 superó 8 rondas seguidas acumulando
    bonos (+30% ataque, +30% defensa, +60% vida) sin errores ni timeouts;
    una banda deliberadamente floja (Común, Nv.1) pierde en la ronda 1 y
    registra correctamente "Mejor ronda: 0"; los logros de ronda 5/15/30
    evalúan `state.roguelike.bestRound` correctamente. Simulación numérica
    del poder medio de la fila rival por ronda: sube de forma suave y
    constante (165 en la ronda 1 a ~6800 en la ronda 40), sin picos ni
    saltos — misma banda de prueba (épica/Nv.40) superó las primeras 8
    rondas con margen real (recibiendo daño, no un paseo) sin llegar a
    perder, consistente con una curva "fácil al empezar, un reto real
    pasadas varias rondas, sin techo al final" — el objetivo del modo.
    Corregido de paso un bug propio de esta implementación: `UI.renderTorre`
    tenía un `return` anticipado si la Torre Batalla en sí estaba
    bloqueada, así que la sección de Roguelike (que debía mostrarse
    SIEMPRE, con su propio panel de "bloqueado" si hace falta, igual que
    Prueba del Campeón/Mazmorra Elemental) desaparecía sin más durante la
    mayor parte de la partida — arreglado convirtiendo ese `return` en un
    `if/else` para que el resto de la función siga ejecutándose.

- [x] **TODO.md: marcar como hechas las respuestas dadas solo por chat**
    (pedido explícito). Repasados los `[ ]` de la sección "ronda de 14
    preguntas/peticiones" — 4 puntos que eran preguntas del usuario ya
    respondidas en el chat en su momento (sin ninguna acción de código
    pendiente) seguían marcados `[ ]`: número de elementos, más ideas de
    personajes, más jefes, más criaturas de tier 1. Marcados `[x]` con una
    nota aclarando que la pregunta está cerrada. El punto "7. Curarse en el
    recorrido del mapa" se queda `[ ]` a propósito — ahí no hubo respuesta
    cerrada, sigue pendiente de que el usuario aclare qué le faltaba
    exactamente. "Torre infinita" (sugerencia antigua de Claude) se marca
    `[x]` y redirige a la entrada de Roguelike de arriba, que la cumple.

- [ ] **Notas pendientes apuntadas por el usuario** (sin implementar
    todavía, solo para no perderlas): completar la guía del juego con las
    novedades de las últimas rondas (Roguelike, Torre Batalla, Duelo por
    apuesta, tipos de equipo/ulti nuevos... revisar qué le falta a
    `UI.openGuide`/el modal de guía actual); revisar el balance de las
    ultis (¿alguna claramente floja o rota entre los 12 tipos?); revisar
    el balance de los bonos de líder (30 Legendarios, +15% de una stat a
    toda la banda — ¿algún reparto desigual entre los 5?).

- [x] **Re-auditoría de dificultad tras el modo Roguelike** (pedido
    explícito: "revisa de nuevo que todo esté bien balanceado... para que
    sea un reto pero factible"). La auditoría completa de la entrada
    anterior (Mapa/Torre/Duelo por apuesta/Arena/Mazmorra/Prueba del
    Campeón) sigue vigente — nada de lo tocado en esta ronda la afecta.
    Lo nuevo (Roguelike) se auditó en su propia entrada de arriba: curva
    de dificultad suave y sin techo, verificada tanto por simulación
    numérica como por combates reales — ni trivial al principio ni
    imposible desde el principio, y sin techo hacia el final (a propósito,
    mismo criterio que Arena). Sin cambios adicionales de balance en esta
    ronda.

- [x] **Sugerencias de más modos de juego para Retos** (pedido explícito).
    Además de "Sinergias de equipo" y "Sets de equipo" (ya sugeridos por
    Claude, ver arriba, sin implementar todavía), 4 ideas nuevas
    (respondidas en el chat, anotadas aquí para no perderlas si se piden
    más adelante):
    - **Gauntlet de jefes**: los 33 jefes de zona ya vencidos, en fila
      SEGUIDA sin curación (como el nivel final de Torre, pero con los 33
      distintos en vez de uno repetido) — un "modo historia" condensado,
      reutilizando bossAdaptiveMult para que siga siendo un reto aunque se
      juegue muy tarde.
    - **Reto Espejo**: combate contra una copia exacta de tu propia
      Formación actual (mismos luchadores/nivel/equipo/estrellas) — un
      test de habilidad puro (elegir bien las líneas) sin ninguna ventaja
      de stats de ningún lado.
    - **Mazmorra Diaria**: una semilla de rival fija por día (misma
      semilla para cualquier partida, cambia a medianoche) con una
      recompensa extra solo la primera vez que se supera cada día — un
      motivo para volver a diario sin depender de energía/gacha.
    - **Reto con restricciones**: rotación semanal de una condición fija
      (p.ej. "solo un elemento", "sin equipo", "solo Comunes/Infrecuentes")
      con recompensas de Gemas más altas que lo normal, para que la
      Formación "óptima" de siempre no sirva y haya que montar un equipo
      distinto a propósito.

- [x] **Bug: Ragnar sin bono de líder**. El usuario preguntó — comprobado
    con script: de los 31 Legendarios, exactamente 1 no tenía
    `leaderSkillId` asignado (`ragnar_legendario`, el único `setLeaderSkill`
    que faltaba de los 31). Añadido `setLeaderSkill('ragnar_legendario',
    'def_boost')` — def_boost porque era, junto con agi_boost, el bono
    menos repartido de los 5 (5 de 30 antes de este fix) y encaja con el
    tema de un rey vikingo que lidera y protege a sus huestes en combate.

- [x] **Pregunta: ¿Medusa tiene un mapa que no le corresponde?** (solo
    respuesta, sin cambios de código, según lo pedido). Comprobado: NO es
    un error. Hay dos jefes distintos relacionados con las Górgonas, cada
    uno en la zona que encaja con su propio matiz del mito: `boss_medusa`
    ("Medusa, la Gorgona de Mirada Pétrea") vive en **Jardín de Piedra**
    (tema petrificación/piedra — encaja perfecto con su mirada que
    convierte en piedra), y `boss_gorgonas` ("Las Gorgonas, Hermanas de
    Piedra" — las 3 hermanas gorgonas del mito, de las que Medusa es una)
    vive en **Templo de las Hermanas** (tema "hermanas" — encaja con que
    mitológicamente las gorgonas son 3 hermanas). Son dos jefes
    deliberadamente distintos para dos facetas distintas del mismo mito,
    no una redundancia ni un despiste.

- [x] **Modo "Tope de Tier" en Retos — FASE 1 y FASE 2 hechas**
    (pedido explícito, dividido en fases porque el usuario avisó de que
    podía ser grande). Objetivo final: que completar Retos al 100% obligue
    a usar prácticamente TODOS los ~112 familias jugables, no solo el
    equipo favorito de siempre.
    - **[x] Fase 1 — infraestructura + escalera curada (15 niveles)**:
      antes de dejar empezar cada nivel se exige que la Formación ENTERA
      (huecos ocupados, los vacíos no cuentan) cumpla una restricción de
      rareza máxima / elemento / clase (`formationMeetsConstraint`,
      state.js) — el aviso "⚠️ tu Formación actual no cumple la
      restricción" se ve en la lista antes de intentarlo. El rival se saca
      del MISMO filtro que se le exige al jugador (`buildTierCapEncounters`,
      combat.js) — combate en igualdad de condiciones dentro de esa
      restricción, no un muro fijo sin relación con lo permitido. 15
      niveles fijos y secuenciales (como Torre): 4 solo de tope de rareza
      (Común/Infrecuente/Raro/Épico), 5 de rareza+elemento, 5 de
      rareza+clase, y un nivel final combinando los 3 ejes a la vez (Raro +
      Fuego + Campeón, el filtro más estrecho). Sin desbloqueo previo
      (disponible desde el principio, como Prueba del Campeón) — no es una
      escalera de poder, es una restricción de montaje. 3 logros nuevos
      (primer nivel, 7 niveles, todos). Verificado con Playwright: bloquea
      empezar si la Formación no cumple (sin gastar Energía) y lo permite
      si cumple; desbloqueo secuencial correcto; con una banda
      "razonablemente progresada para cada nivel" (nivel/rareza escalados
      con la posición en la escalera, algo de equipo/estrellas) se ganan
      11 de los 15 niveles (~73%) — reto real con derrotas genuinas, no un
      paseo ni un muro; los 3 mods (Torre/Roguelike/Tope de Tier) conviven
      sin regresiones entre sí en la pantalla de Retos.
    - **[x] Fase 2 — Trials de Familia, uno por cada una de las 112
      familias jugables** (pedido explícito: "implementa el tope de tier
      como has dicho", siguiendo la recomendación dada en el chat en la
      ronda anterior). Cada Trial es un combate LIGERO de 1 sola oleada
      (a diferencia de todo lo demás en Retos, que encadena varios) que
      exige tener FICHADA al menos 1 copia de esa familia concreta en la
      Formación ahora mismo (`formationHasFamily`, state.js) — el resto de
      la Formación puede ser cualquier cosa, a diferencia de la Fase 1.
      FIGHTERS no tiene "zona de origen" real (no aparece en ZONES.pool,
      se consigue por invocación) así que en vez de agrupar por zona
      (como `buildTorreLevels`) se agrupa por el TIER de cada familia —
      techo Raro/Épico/Legendario, 36/45/31 familias respectivamente
      (`buildFamilyTrials`, data.js) — el equivalente real más cercano a
      una escalera de dificultad para el roster jugable. El rival de cada
      Trial se saca de la MISMA rareza tope que esa familia
      (`buildFamilyTrialEncounter`, combat.js), con más compañía cuanto
      más alto el tier (1/2/3 rivales) — un "guardián a su altura", ni
      trámite ni muro injusto. Pantalla dedicada tipo Pokédex
      (`#familyTrialsModal`, botón "🧬 Trials de Familia" dentro de la
      sección de Tope de Tier en Retos) con grid + filtro (Todas/Sin
      superar/Superadas/No conseguidas) en vez de una lista plana de 112
      filas — reutiliza el mismo patrón visual que `pokedexCard`
      (bloqueada/???/con arte) con dos estados propios añadidos: ✅
      superado y ⚠️ "no está en tu Formación ahora mismo" (para saber qué
      falta colocar). Recompensa pequeña por Trial (Texel/XP crecientes) +
      4 logros de hito (25/50/75/100% de familias superadas, con
      recompensas de Gemas crecientes: 50/100/180/350). Sin desbloqueo
      secuencial entre ellos (no es una escalera de poder). Verificado con
      Playwright: 112 Trials generados con la distribución de tier
      correcta (36/45/31); una familia nunca conseguida bloquea el intento
      (sin gastar Energía); una familia conseguida pero no fichada en la
      Formación también lo bloquea, con aviso claro; al fichar al
      luchador, el combate arranca y resuelve con normalidad; con una
      banda "razonablemente progresada para su tier" (misma familia y
      rareza que el Trial, nivel escalado, algo de equipo/estrellas) se
      ganan 18/18 Trials de muestra (6 por tier) con daño real y creciente
      por tier (97-433 en tier 1, 441-2469 en tier 2, 2563-8916 en tier
      3) — reto real, no trivial, pero consistentemente superable; el
      modal muestra título, filtro y las 112 tarjetas correctamente; cero
      regresiones en Torre/Roguelike/Tope de Tier Fase 1 tras el cambio.
      Nota de balance: al ser Trials ligeros de 1 sola oleada, el reto
      real de este sistema está más en la COLECCIÓN (conseguir las 112
      familias por invocación) que en el combate en sí — a propósito,
      coherente con el objetivo del pedido original.

- [x] **Auto-equipar el mejor objeto** (pedido explícito). Botón "⚡
    Auto-equipar mejor" en la ficha de cualquier luchador (panel Equipo):
    revisa los 6 huecos y equipa, en cada uno, la pieza de mayor
    `gearStatValue` disponible (libre en el inventario, o la que ya lleva
    puesta) — `gearStatValue` solo depende de rareza+nivel, no del tipo
    concreto (espada/hacha/lanza...), así que es una comparación justa
    entre tipos distintos del mismo hueco. `bestGearForSlot`/
    `autoEquipBest` en state.js. Verificado con Playwright: con una pieza
    floja ya puesta y dos mejores sin usar en el inventario, elige y
    equipa la correcta (1 hueco cambiado); una segunda pasada inmediata no
    cambia nada (0, ya lleva lo mejor); el botón aparece en la ficha.

- [x] **Estadísticas de combate por luchador** (pedido explícito). Nuevo
    panel "📊 Estadísticas de combate" en la ficha de cualquier luchador:
    combates, daño hecho, daño recibido, curación hecha, bajas y mejor
    golpe — acumulados a lo largo de TODA la partida con ese luchador
    (`entry.stats`, ver `newFighterStats` en state.js), no solo del
    combate actual. Sobreviven a Fusión/Evolución porque viven en el mismo
    roster entry (mismo uid), que solo cambia de defId. Se acumulan en
    `UI.endBattle` — el mismo punto único por el que pasa CUALQUIER
    combate del juego (Mapa, Torre, Roguelike, Tope de Tier, Arena,
    Duelo...), así que cuentan de verdad todo lo jugado sin repetir la
    lógica en cada modo. "Combates" cuenta a quien estuviera en la
    Formación al empezar el combate (aunque no le tocara actuar en ningún
    choque); el resto de campos solo a quien de verdad hizo algo — se
    amplió `battleUnitRec` (antes solo trackeaba daño hecho y bajas, para
    el MVP del resumen de UN combate) para llevar también sourceUid, daño
    recibido, curación hecha y mejor golpe por unidad. Verificado con
    Playwright: un luchador nuevo empieza en cero; tras un combate real
    gana 1 combate, daño hecho/recibido, bajas y mejor golpe correctos;
    tras evolucionar, las estadísticas acumuladas se mantienen intactas.

- [x] **Bug: la Arena no tenía fondo de batalla**. El usuario preguntó —
    comprobado: `UI.startArenaBattle` era el ÚNICO modo de combate de todo
    el juego que no pasaba `zone` a `UI.openBattle` (Mapa, Torre,
    Roguelike, Tope de Tier, Mazmorra Elemental, Prueba del Campeón y
    Duelo por apuesta sí lo hacían) — sin él, `zoneBackgroundStyle` nunca
    se llamaba y el overlay de batalla se quedaba con el fondo por defecto
    (negro liso) en vez del degradado temático que tiene cualquier otro
    combate. Arreglado con `zone: { id: 'arena', color: '#4a1f1f' }`
    (mismo patrón pseudo-zona que Torre/Roguelike/Prueba del Campeón —
    cae al degradado de respaldo hasta que exista
    `assets/scenery/arena.jpg`). Verificado con Playwright: el overlay de
    batalla de Arena ahora sí lleva el degradado de fondo.

- [x] **Sugerencias para mejorar la Arena** (pedido explícito, respuesta
    dada en el chat; la primera implementada abajo, el resto sin
    implementar):
    - **Elegir entre 2-3 rivales explorados en vez de 1**: "Buscar rival"
      da un único rival al azar ahora mismo — ofrecer 2-3 a elegir (como
      en varios PvP de gacha reales) añadiría una decisión estratégica
      real (elegir el que mejor ventaja elemental tenga tu Formación) en
      vez de aceptar lo que toque o re-tirar a ciegas.
    - **Revancha contra el mismo rival tras perder**: perder limpia
      `state.arena.scouted` y obliga a explorar uno nuevo al azar — dejar
      reintentar el MISMO rival ya explorado (sin volver a tirar) daría
      la opción de ajustar solo la Formación y probar de nuevo contra el
      matchup exacto que hizo perder, en vez de siempre cambiar de rival.
    - **Coste de Energía**: es, junto con el propio bug del fondo, la
      única inconsistencia menor encontrada — Arena es el único combate
      repetible del juego sin coste de Energía (como tenía el Duelo por
      apuesta antes de arreglarlo). Aquí el riesgo de exploit es mucho
      menor (el rango nunca baja, así que no se puede volver a un rival
      fácil ya superado a farmear) pero seguiría siendo más consistente
      con el resto del juego.

- [x] **Temporadas de Arena con reset parcial** (pedido explícito, primera
    sugerencia de la lista de arriba). Reset semanal DETERMINISTA sin
    servidor (misma idea que la oferta diaria del Mercader: se deriva de
    la fecha real con `arenaSeasonKey`, en semanas desde una fecha fija —
    `Math.floor(díasTranscurridos/7)` — así cambia sola cada semana natural
    sin depender de ningún temporizador en vivo, solo de comprobarlo al
    abrir la pantalla). Al detectar que la semana cambió
    (`checkArenaSeasonReset`, state.js, llamado desde `UI.renderArena`):
    - El rango cae a la MITAD de `seasonPeakRank` (el pico de LA
      TEMPORADA que acaba de terminar, no del rango actual si ya se venía
      perdiendo sin explorar rival nuevo) — nunca a 1, un reset parcial de
      verdad, no un borrón y cuenta nueva.
    - Recompensa de Gemas por ese pico (`arenaSeasonReward`,
      `10 + pico×3`), avisada con un toast al entrar a Arena.
    - `bestRank` (récord de TODA la partida, del que dependen los logros
      `arena_1/5/15/30/50` ya existentes) NO se toca nunca — solo baja el
      rango "de temporada", así que el progreso permanente nunca se
      pierde y los logros de siempre siguen funcionando igual.
    - Panel de Arena ampliado: pico de esta temporada, mejor rango
      histórico, y días que faltan para el próximo reset
      (`arenaSeasonDaysLeft`).
    Verificado con Playwright: sin cambio de semana no resetea nada;
    forzando el paso de una semana (pico 20 → recompensa 70 Gemas, rango
    baja a 10, exactamente la mitad) las Gemas se acreditan y `bestRank`
    se mantiene intacto; una segunda comprobación inmediata no vuelve a
    resetear (misma semana ya); el panel muestra pico/histórico/días
    correctamente; ganar un combate de Arena actualiza `seasonPeakRank`
    a la vez que `bestRank`, como debía.

- [x] **Más sugerencias para la Arena, segunda ronda** (pedido explícito,
    respuesta dada en el chat tras implementar las temporadas): rachas de
    victorias consecutivas con bonus creciente, ligas con nombre (esta
    ronda, implementada abajo), rival campeón fijo cada cierto rango (esta
    ronda, implementada abajo), y poder revisar el registro del último
    combate de Arena perdido. Rachas y revisar-combate-perdido siguen sin
    implementar, sin acción de código pendiente salvo que se pidan.

- [x] **Ligas con nombre + rival campeón por liga** (pedido explícito, las
    2 sugerencias de la ronda anterior que el usuario eligió implementar).
    - **Ligas** (`ARENA_LEAGUES`, data.js): Bronce(1)/Plata(5)/Oro(12)/
      Platino(22)/Diamante(35)/Maestro(50)/Leyenda(75) — el rango de
      entrada de cada una. `arenaLeagueForRank(rank)` sustituye el número
      de rango a secas por un nombre+icono reconocible en el panel de
      Arena. Cada liga añade además un multiplicador de recompensa
      creciente por victoria (`rewardMult`, de ×1.0 en Bronce a ×2.0 en
      Leyenda, aplicado al Texel/Gemas de cada combate ganado) — un
      pequeño extra por escalar, no solo el nombre.
    - **Rival campeón** (`buildArenaChampionEncounter`, combat.js): de
      Plata en adelante, cada liga tiene asignado un Legendario FIJO y
      siempre el mismo (Kraken/Fenrir/Quetzalcóatl/Anubis/Thor/Zeus) —
      justo al llegar al rango de ENTRADA de esa liga (no "a partir de",
      un combate puntual y reconocible), "Buscar rival" da ese campeón en
      solitario en vez de una banda aleatoria de hasta 3, con un ×1.3
      extra de stats (mismo mecanismo que WAGER_BOSS_BOOST) para
      compensar no traer compañía — mismo nivel que tocaría por rango, así
      que sigue escalando con la Formación real del jugador. Recompensa
      extra de Gemas al vencerlo (`arenaChampionBonusReward`,
      `15 + rango_entrada×1.5`), con su propio título de victoria ("👑
      ¡Campeón de [Liga] derrotado!") y de batalla.
    - `state.arena.scoutedChampionLeagueId` (nuevo campo) recuerda si el
      rival ya explorado es un campeón, para poder reconstruir sus stats
      reales al empezar el combate (con el mismo ×1.3, guardado como
      `extraMult` en el rival explorado) y mostrar el título/recompensa
      correctos.
    Verificado con Playwright: los umbrales de liga son exactos (rango 4
    sigue en Bronce, 5 ya en Plata, 11 sigue en Plata, 12 ya en Oro, 200
    se queda en Leyenda, la última); el campeón solo aparece en el rango
    EXACTO de entrada (rango 1 no, 5 sí con `id: 'plata'`, 6 no, 12 sí con
    `id: 'oro'`); explorar en un rango de campeón da un encuentro de 1
    sola fila con 1 solo rival, el defId y el `extraMult` (×1.3)
    correctos; explorar en un rango normal sigue dando una banda aleatoria
    normal; el combate contra el campeón muestra el título "👑 Arena ·
    Campeón de Plata", aplica el multiplicador de liga MÁS el bonus de
    campeón a las recompensas (+84 Texel, +29 Gemas en la prueba), y el
    resumen muestra "👑 ¡Campeón de Plata derrotado!"; el rival explorado
    se limpia correctamente después del combate en ambos casos.

- [x] Bosses del Mapa (y de Torre Batalla, que reutiliza la misma fórmula)
    más difíciles: auditoría con Playwright (3 perfiles de jugador × 6
    zonas) mostró que, en las zonas medio-tardías (10, 20, 28), el stage
    NORMAL ya perdía para las bandas "a la par" e "invertida" (13k-23k de
    daño recibido) mientras el BOSS de esa misma zona se ganaba con
    holgura (364-3083 de daño) — el jefe se había quedado por detrás de su
    propio camino, justo el problema inverso al que `MOB_POWER_MULT` se
    creó para evitar. Subido el techo de `bossAdaptiveMult` (state.js) de
    `3 * lateZoneMult(zoneIdx)` a `4.5 * lateZoneMult(zoneIdx)`, para que
    el jefe pueda escalar más cuando la banda del jugador ya supera
    claramente el ritmo esperado en esa zona. Como `torreBossMult`
    reutiliza `bossAdaptiveMult` referenciado a la zona de origen de cada
    jefe de Torre, el cambio sube también el reto de todos los jefes de la
    Torre Batalla.
    Verificado con Playwright: repetida la auditoría de las 6 zonas — los
    jefes de zonas medio-tardías ahora reciben notablemente más daño de
    las mismas bandas "a la par"/"invertida" (zona 20: de 1490/408 a
    3053/1163; zona 28: de ~1200/~600 a 2161/1589), sin dejar de ganarse
    con la banda `lucky` de referencia. En Torre Batalla, la banda
    "realista recién llegada" (épica Nv.40 2★, equipo raro Nv.3) mantiene
    el mismo patrón de antes (gana todos los niveles salvo el jefe final
    ×5 sin curación); la banda tope teórico (9 legendarios Nv.40 5★,
    equipo legendario Nv.10) sigue ganando TODOS los niveles, incluido el
    jefe final, pero ahora sufre daño real en todos ellos (antes casi 0 en
    varios, ahora 576-4483) — ningún nivel se ha vuelto imposible, pero
    todos suponen ya un reto genuino incluso para la mejor banda posible.

- [x] Arregla "Exportar partida" sin descargar nada: el botón no estaba
    roto (`UI.openExportSave` sí generaba el código y abría el modal con su
    textarea + "Copiar al portapapeles"), pero `#pickerModal` y
    `#settingsModal` comparten el mismo z-index (90, ver `.modal` en
    style.css) y `openExportSave`/`openImportSave` nunca ocultaban Ajustes
    al abrirse desde dentro de él — como `#settingsModal` está DESPUÉS en
    el DOM, se quedaba apilado ENCIMA del modal de exportar/importar y lo
    tapaba entero (fondo opaco incluido), así que al pulsar "Exportar" no
    pasaba nada visible aunque el modal sí se hubiera abierto de verdad
    detrás. Arreglado ocultando `#settingsModal` al principio de ambas
    funciones (ui.js). Aprovechando el arreglo, añadido lo que de verdad
    pedía el usuario — una descarga real de archivo (antes solo había
    copiar/pegar el código): botón "💾 Descargar archivo" en Exportar
    (Blob + `<a download>` temporal, nombre
    `defensor-de-texel-partida-AAAA-MM-DD.txt`) y un `<input type="file">`
    en Importar que rellena el textarea leyendo el archivo subido — el
    pegado manual del código se mantiene como alternativa en ambos.
    Verificado con Playwright: la descarga se dispara con el nombre y
    contenido correctos (3540 bytes, empieza por el base64 esperado);
    subir ese mismo archivo en Importar rellena el textarea con el
    contenido exacto; y una prueba de ida y vuelta completa (fijar
    `texel=123456`, exportar, cambiar `texel=1`, importar el archivo
    descargado, recargar) confirma que la partida vuelve exactamente al
    valor exportado.

- [x] Sube la probabilidad de que las etapas del Mapa suelten Cristal
    Pixite: era la única fuente de cristales al farmear el camino
    (auditoría de la economía de cristales de la conversación anterior —
    ver el punto sobre "cristales de invocación" más arriba), y el
    jugador pedía explícitamente que tocaran más, sobre todo en los
    escenarios del Mapa. Etapa normal (no jefe): 35% → 60% (combat.js,
    `stageRewards`). Repetir el jefe de zona (que ya apuntaba a Pixite
    como su cristal principal): 10% → 25%, para mantener la misma
    proporción relativa entre ambas fuentes. Voxite/Doxite del jefe (3%/1%
    en repetición, garantizado+30% la primera vez) no se tocan — siguen
    siendo la vía "premium", no la de farmeo masivo.
    Verificado con la misma simulación de economía de la conversación
    anterior (farmeador "moderado", 4 sesiones/día × 14 días en zona 10):
    Pixite acumulado sube de 202 a 328 (+62%, en línea con la subida de
    tasa) y los "cuerpos" de 5+ copias del mismo personaje (material para
    subir estrella o evolucionar) casi se triplican, de 6 a 17.

- [x] Añade `setStatMult(defId, mults)`: multiplicador manual OPCIONAL por
    personaje, encima de la fórmula normal (rareza × nivel × clase ×
    `statVarianceMult`) — a petición del usuario, que preguntaba cómo
    hacer a un personaje concreto (p.ej. Hércules) más fuerte sin
    hardcodear las stats de cero (descartado en la conversación anterior
    por el mantenimiento que supondría en +330 luchadores: se perdería la
    palanca de un solo número reajustable que ha permitido todos los
    ajustes de balance de esta sesión). `fighterStatMult(def, statKey)`
    (data.js, junto a `statVarianceMult`) se aplica tanto en
    `fighterStats` (state.js, luchador jugable) como en `buildUnitStats`
    (combat.js, rival del Mapa/Torre) — un personaje con `statMult` que
    también aparezca como enemigo en el pool de alguna zona lo mantiene en
    ambos papeles. No afecta a los jefes de zona (`fixedStats` sigue
    siendo su propio mecanismo). Dejado un ejemplo COMENTADO junto a los
    `setLeaderSkill(...)` (después de que `FIGHTERS` esté completo): sube
    el ATK de Hércules ×1.2 en sus 3 formas — desactivado por defecto,
    para que el usuario lo descomente y ajuste cuando quiera tocar algo.
    Verificado: con el multiplicador activo, ATK sube exactamente el %
    indicado (409→490, ×1.198 por redondeo) sin tocar HP/DEF/AGI/WIS de
    Hércules ni las stats de ningún otro Campeón de Tierra; con el
    ejemplo comentado (como queda en el repo), Hércules no cambia nada
    (sin campo `statMult`, stats idénticas a antes de este cambio).

- [x] Añade "🎒 Desequipar banca" en Equipo: desequipa de un tirón TODO el
    equipo de cualquier luchador del roster que no esté colocado en la
    Formación actual, sin tener que abrir la ficha de cada uno a mano —
    pensado para recuperar equipo bueno atrapado en luchadores ya
    sustituidos o invocados y nunca puestos. `unequipBenchedGear(state)`
    (state.js) recorre el roster comparando contra `state.band` aplanado;
    el equipo no se pierde, solo vuelve al inventario sin dueño. Botón
    junto al filtro de Equipo (index.html), con toast indicando cuántas
    piezas se han desequipado (o avisando si nadie en la banca llevaba
    nada puesto).
    Verificado con Playwright: banda de 9 luchadores en Formación + 3 en
    banca, los 12 con las 6 piezas de equipo puestas — tras pulsar el
    botón, los 9 de Formación mantienen sus 54 piezas intactas, los 3 de
    banca quedan a 0 (18 piezas desequipadas), y el inventario total de
    equipo no pierde ninguna pieza.

- [x] Añade "🪙 Vender sin usar" en Equipo: vende de un tirón TODO el
    equipo sin usar (mismo precio que vender uno a uno, ×2
    `gearStatValue`), para vaciar de golpe el sobrante de bajo tier que se
    acumula farmeando sin tener que pasar por Selección múltiple pieza a
    pieza. `sellAllUnequippedGear(state)` (state.js) reutiliza `sellGear`
    por cada pieza sin dueño — nunca toca una pieza puesta, igual que la
    venta individual. Botón junto a "Desequipar banca" (index.html), con
    confirmación previa (irreversible, a diferencia de desequipar) y toast
    con el Texel ganado.
    Verificado con Playwright: inventario con 18 piezas puestas + 5 sueltas
    sin dueño — tras confirmar, las 5 sueltas desaparecen del inventario
    (queda en 18) y el Texel sube exactamente su valor de venta conjunto
    (+40), sin tocar ninguna de las 18 piezas equipadas.

- [x] Pondera "⭐ Poder total" en el orden de la Colección en vez de sumar
    las 5 stats a pelo: el usuario preguntó por qué varias Épicas de clase
    Campeón salían por delante de Odín (Legendario) en ese orden — la
    causa era que una suma plana favorece SIEMPRE a las clases con más HP
    base (Campeón: HP altísimo, todo lo demás bajo) sobre las de más
    ATK/WIS (Gurú/Brujo: HP bajo, todo lo demás alto), porque el HP tiene
    la escala numérica más grande con diferencia — nada que ver con la
    rareza. Extraída `fighterPowerScore(stats)` (state.js, junto a
    `starBonus`) con los MISMOS pesos que ya usaba `bossAdaptiveMult`
    (hp×0.3 + atk + def + agi×0.5 + wis×0.5) para medir la banda del
    jugador contra el rival de referencia — una única fórmula de "poder"
    para toda la partida en vez de dos criterios distintos. Usada ahora
    tanto en `bossAdaptiveMult` (refactor puro, sin cambio de
    comportamiento) como en el modo 'poder' de `sortRosterEntries` (ui.js),
    que antes sumaba las 5 stats sin ponderar.
    Verificado: con el roster exacto de la captura del usuario (Devorador
    de Flotas, Fenrir, Guardián del Abismo/Mareas, Elegidora de los
    Caídos, Matriarca de las Orcas, Fénix Inmortal/Centinela, Odín) en
    modo Base (Nv.1), Odín pasa del último puesto (con la suma plana) al
    7º de 9 — por delante de Matriarca de las Orcas y Fénix Centinela,
    ambas Épicas de clase Campeón — sin tocar el orden de los Legendarios
    de clase con más ATK (Devorador de Flotas, Fenrir siguen 1º/2º).
    `bossAdaptiveMult` sigue devolviendo los mismos valores que antes del
    refactor (comprobado con una banda de prueba, sin NaN/undefined).

- [x] Revertido el intento de forzar la rareza por delante del poder
    medido en "Poder total" (ver el punto anterior): el usuario aclaró que
    el objetivo del orden NO es respetar la jerarquía de rareza a toda
    costa, sino poder DETECTAR con honestidad cuándo una carta mide peor
    de lo que su rareza sugiere, para decidir entonces si esa carta en
    concreto necesita un ajuste manual — forzar la rareza por delante
    escondería justo el caso que hace falta ver. `sortRosterEntries`
    (ui.js) vuelve a comparar solo por `fighterPowerScore`, sin ningún
    desempate de rareza por delante.
    Confirmado con números reales (Nv.1, 0★, sin equipo, los 9
    personajes de la captura del usuario): Odín (Legendario, Gurú) mide
    298 de poder, por DETRÁS de 4 Épicas de clase Campeón (Guardián del
    Abismo 308, Guardián de las Mareas 301, Elegidora de los Caídos 301,
    Golem de Hierro Ancestral 298) — un Gurú reparte casi todo en WIS
    (peso ×0.5 en la fórmula) mientras que un Campeón mete casi todo en
    HP/DEF (peso ×0.3/×1), así que a la misma rareza superior Odín sigue
    perdiendo en poder de combate bruto frente a un tanque de una rareza
    por debajo. Es una medición real, no un artefacto del orden — el
    usuario lo señaló porque, temáticamente, un Legendario que representa
    a un dios debería pegar más fuerte de lo que sus stats actuales dan.
    Pendiente de decisión del usuario: si quiere reforzar a Odín (u otros
    casos similares) de verdad, ya existe la herramienta para hacerlo sin
    tocar la fórmula de nadie más — `setStatMult('odin_legendario', {...})`
    (ver el punto de "multiplicador manual opcional de stats" más arriba).

- [x] Sube las stats de Odín con `setStatMult('odin_legendario', { hp:
    1.2, atk: 1.4, def: 1.3, agi: 1.1 })` (data.js, activo — no comentado
    como el ejemplo de Hércules) — el usuario pidió ajustarlo para que
    fuera "realmente una carta más poderosa" tras confirmar que medía por
    detrás de varias Épicas (punto anterior). Sube HP/ATK/DEF/AGI, sus
    puntos flojos como Gurú; WIS (137 base, la más alta del roster) se
    deja intacta — sigue siendo su seña de identidad, solo deja de ser su
    única fortaleza. `odin_legendario` no aparece en el pool de enemigos
    de ninguna zona (solo como líder/objetivo de invocación), así que el
    ajuste no toca la dificultad del Mapa en ningún punto.
    Verificado con Playwright, mismo roster de 9 cartas de antes: Odín
    pasa de 298 a 353 de poder a Nv.1/0★ (por delante de las 4 Épicas que
    antes lo superaban, a la altura de Fenrir 351 y Devorador de Flotas
    362) y sale ahora por delante de TODAS las Épicas del grupo en ambas
    variantes del orden (Actuales y Base), sin necesidad de forzar la
    rareza — es una medición honesta de sus stats ya reforzadas.

- [x] Arregla la Pokédex "bugeándose" (captura del usuario: una tarjeta
    descubierta, "Baba Yaga Errante", se quedaba completamente en blanco
    — sin arte, sin insignia de elemento/clase, sin icono de tier, solo el
    nombre — en vez de mostrar su ilustración). No era un fallo de datos
    (el `<img>` se construía con la rareza/elemento/clase correctos, ver
    `pokedexCard` en ui.js) sino de carga de imagen: `creatureCanvas`
    usaba el atributo nativo `loading="lazy"` del `<img>`, cuya heurística
    de "¿está cerca del viewport?" no dispara de forma fiable cuando el
    scroll ocurre dentro de un contenedor anidado con overflow propio — y
    TODOS los modales de este juego (incluida la propia Pokédex,
    `#pokedexModal .modal-box`) son justo eso. Un primer intento con
    IntersectionObserver (`root: null`) tenía el MISMO problema — probado
    a mano: solo procesaba la tanda de tarjetas visible al abrir el modal
    y se quedaba mudo el resto del scroll, porque `root: null` no vuelve
    a evaluar la intersección cuando quien se mueve es un contenedor
    anidado, no el documento. `creatureCanvas` se usa en demasiados
    contextos distintos (dentro de modales, dentro de pantallas normales)
    como para fijar un único `root` válido para todos.
    Arreglado con un mecanismo manual que no depende de ningún `root`:
    `getBoundingClientRect()` siempre da la posición real en pantalla, la
    atraviesen los contenedores anidados que la atraviesen. Un listener de
    scroll en `document` con `capture:true` (los eventos de scroll no
    burbujean, pero SÍ se capturan desde cualquier ancestro — uno solo
    basta para cualquier modal o pantalla) revisa, como mucho una vez por
    frame (`requestAnimationFrame`), qué imágenes pendientes (guardadas en
    `pendingLazyImages`) han entrado ya en pantalla con 400px de margen, y
    les asigna el `src` real en ese momento — antes solo se guardaba en
    `data-src`. Mismo margen que el intento anterior, misma protección
    contra fallos de red (el `error` handler que sustituye por el sprite
    procedural sigue igual).
    Verificado con Playwright (viewport de móvil 412×915, Pokédex con las
    336 formas descubiertas): antes del arreglo, con el mismo scroll
    dentro del modal, 321 de 336 imágenes se quedaban sin `src` para
    siempre (incluida "Guerrero Cocodrilo", con la tarjeta claramente
    visible en pantalla) — con el arreglo, en varios saltos de scroll
    sucesivos, CERO tarjetas visibles se quedan sin cargar en ningún
    punto; "Baba Yaga Errante" y "Guerrero Cocodrilo" cargan su arte real
    correctamente. Comprobado también que la pantalla de Banda (fuera de
    cualquier modal) sigue cargando sus tarjetas con normalidad.

- [x] El WIS deja de ser decorativo para las ultis de Gurú: el usuario
    notó que Odín "casi no puede hacer daño" — revisando `computeDamage`
    (combat.js), solo el skill `arrasar` usaba WIS; los ataques normales,
    TODAS las demás ultis de daño y hasta el "golpe extra" (bonusHitMult)
    de las ultis de apoyo (curar, debilitar, aturdir...) usaban ATK
    siempre, sin importar la clase — y la curación ni siquiera escalaba
    con ninguna stat de quien cura, solo con el maxHp de a quien se cura.
    Entre dos opciones (barajadas con el usuario): ampliar por TIPO de
    ulti qué usa WIS (elegida) frente a que cada personaje use
    automáticamente su stat más alta entre ATK/WIS (descartada: rompería
    el modelo de clase/vulnerabilidad si un buff de ATK a mitad de combate
    cambiaba de qué stat depende el daño de un turno a otro).
    Añadido `usesWis: true` en SKILL_TYPES (data.js) a las ultis
    EXCLUSIVAS de Gurú — curar, bendicion, purificar, revivir — más
    arrasar (ya usaba WIS, ahora vía el flag en vez de un caso especial
    de `kind`). `debilitar` se queda fuera a propósito aunque también la
    lleven Brujo/Gurú: un 43% de sus usuarios (30 de 69 familias) son
    Explorador, cuyo ATK (16) supera a su WIS (12 en CLASS_INFO) —
    cambiarla los habría debilitado. `computeDamage`/`applyUltBonusHit`
    (combat.js) ahora leen `skill.usesWis` en vez de tener `false`/`true`
    fijos en cada sitio. Además, `heal`/`healRow` ahora multiplican el
    importe curado por `healWisMult` (+0.1% de curación por punto de WIS
    de quien cura, solo si `skill.usesWis`) — antes ni la propia curación
    tenía en cuenta el WIS del sanador. Los ataques normales (sin ulti) se
    quedan fuera a propósito, tal y como pidió el usuario ("ampliar ultis
    que usan wis") — siguen con ATK para todo el mundo.
    De paso, subido el ATK de Odín (`setStatMult`, ×1.4 → ×1.7): aunque su
    ulti ya no dependa de su ATK, sigue atacando con él en los turnos sin
    ulti, y el usuario seguía viéndolo flojo.
    Verificado con Playwright/Node llamando a `performTurn` directamente:
    la curación de Odín (WIS 832 a Nv.40/3★) sube de 0.16×maxHp "a pelo" a
    0.16×maxHp×1.832 — 773 en sí mismo, 879 en un aliado de 3000 HP,
    coincide exacto con la fórmula; el golpe extra de su ulti pasa de
    basarse en su ATK (413) a su WIS (832), con un daño resultante (674)
    muy por encima de lo que el ATK habría dado; sus ataques normales
    (turnos sin ulti) siguen exactamente en el rango esperado por ATK
    (275). Comprobado que Cerbero (`escudo`, sin el flag) y un Explorador
    con `debilitar` no cambian de comportamiento — su golpe extra sigue
    encajando con ATK, no con WIS.

- [x] Restringe el material de Superfusión a solo formas finales: el
    usuario pidió revisarlo y, en efecto, `superFuse` (state.js) solo
    comprobaba `sef >= 5` — una forma intermedia (con `evolvesTo`) que
    llegara a SEF 5/5 se podía sacrificar igual, tirando a la basura una
    evolución ya lista para completarse en su lugar (`readyToEvolve`, ver
    `fuseMaterials`). Añadido `if (fighterDef(sac.defId).evolvesTo) return
    false;` en `superFuse`, y el mismo filtro en el listado de candidatos
    de `UI.openSuperFusePicker` (ui.js) para que ni siquiera aparezcan
    como opción — doble capa, como con el resto de acciones del roster
    (sellFighter, equipGear...), no solo un filtro de UI.
    Verificado: sacrificar una forma NO final con SEF 5/5 devuelve
    `false` y no toca el roster; la misma familia en su forma final SÍ
    funciona (target sube 1★, el sacrificio desaparece); y el picker de
    Superfusión, con las dos formas disponibles en el roster, solo
    muestra la forma final como opción.

- El bug visual de la captura en "Comparar con..." (una tarjeta en blanco
  al hacer scroll, "Titán de las Corrientes") es el MISMO fallo de carga
  perezosa de imágenes ya arreglado para la Pokédex (`creatureCanvas`
  compartida — ver el punto de "tarjetas en blanco en la Pokédex" más
  arriba), no un bug nuevo. Reproducida la misma prueba (scroll dentro de
  `#pickerModal .modal-box`, viewport de móvil) contra el código actual:
  cero tarjetas se quedan sin cargar. La captura del usuario es de antes
  de que ese arreglo llegara a su dispositivo.

- [x] Añade la animación de flotar (`floatSprite`, un ligero sube-baja) a
    las tarjetas Común e Infrecuente: el usuario notó que algunos
    personajes se movían en Banda/Pokédex y otros no. Las reglas de
    `.creature-canvas-wrap` en style.css solo cubrían Raro/Épico/
    Legendario/Jefe — Común e Infrecuente no tenían ninguna regla de
    animación. Añadidas con la misma progresión de velocidad que ya
    tenían las demás (-0.2s de duración por cada rareza hacia arriba:
    Común 3s, Infrecuente 2.8s, Raro 2.6s...).
    Verificado con Playwright: las 5 rarezas devuelven ahora
    `animationName: floatSprite` en `.creature-canvas-wrap`, con la
    duración esperada cada una.

- [x] Quita el tope de 60 piezas del inventario de Equipo (`MAX_GEAR`,
    state.js): a petición del usuario. Quitado el bloqueo en `addGear` y
    en `buyShopGear` (ambos devolvían false/null al llegar al tope); el
    botón de comprar en la Tienda ya no se desactiva por esto (ui.js). El
    logro "Llena tu inventario de equipo" (que apuntaba al propio tope
    como objetivo, `target: s => s.gearMax`) pasa a un hito fijo de
    colección — "Consigue 40 piezas de equipo" — para no perder el logro
    ni dejarlo con un target roto al desaparecer `gearMax`. La fila
    "Equipo en inventario" de Estadísticas pasa de barra de progreso
    (implicaba un máximo) a cifra simple.
    Verificado con Playwright: se pueden añadir 80+ piezas sin que
    `addGear` las rechace, comprar en la Tienda sigue funcionando muy por
    encima del antiguo tope, y el logro migrado calcula bien su progreso
    (81/40 → completado).

- [x] Añade Formaciones guardadas: hasta ahora solo existía una Formación
    activa (`state.band`), sin forma de guardar varias combinaciones y
    alternar entre ellas. `state.formationPresets` (array, sin tope de
    cuántas se pueden guardar) con `saveFormationPreset`/
    `applyFormationPreset`/`renameFormationPreset`/`deleteFormationPreset`
    (state.js) — cada preset es una copia independiente de `state.band` en
    el momento de guardarlo, no una referencia viva. `applyFormationPreset`
    salta (deja el hueco vacío) cualquier uid del preset que ya no exista
    en el roster en vez de romper, ya que un preset puede aplicarse mucho
    después de guardarlo, tras vender/perder luchadores por el medio.
    Botón "📋 Formaciones guardadas" junto al título de Formación (Banda),
    abre `pickerModal` con un campo de texto + "Guardar formación actual"
    arriba, y debajo la lista de presets ya guardados, cada uno con
    Aplicar/✏️ Renombrar (edición en línea)/🗑️ Eliminar (con
    confirmación). Migración para partidas antiguas
    (`formationPresets: []` si falta).
    Verificado con Playwright de punta a punta: guardar la Formación
    actual (3 miembros) como preset conserva exactamente esas 3 posiciones;
    cambiar la Formación a otra cosa y luego "Aplicar" el preset restaura
    la guardada tal cual; renombrar y eliminar funcionan correctamente; y
    aplicar un preset que referencia a un luchador ya vendido del roster
    coloca al resto con normalidad y deja ese hueco vacío en vez de fallar.

- [x] Añade "Añadir a la Formación" desde la ficha de un luchador de la
    Colección: antes solo se podía colocar en la banda desde el propio
    hueco vacío de la rejilla de Formación — el usuario pidió poder
    hacerlo también desde la ficha normal. `firstEmptyBandSlot(state)`
    (state.js) devuelve el primer hueco libre (o null si está completa).
    En `UI.openFighterModal` (ui.js), el panel "🐾 Formación" ahora decide
    qué mostrar según `bandPos` (dónde está YA colocado, si lo está) en
    vez de solo `formationCtx` (que solo llegaba al abrir desde el propio
    hueco) — mismo cambio, unifica dos casos que antes eran uno solo: con
    hueco libre, un botón "➕ Añadir a la Formación" lo coloca directo; con
    la Formación completa (9/9), una rejilla con los 9 colocados para
    elegir a quién sustituir. De paso, esto también arregla que abrir
    desde la Colección a alguien YA colocado en la banda (en un hueco
    distinto al que se tocó) no ofrecía "Quitar de la formación" — ahora
    sí, por el mismo cambio de `formationCtx` a `bandPos`.
    Verificado con Playwright: hueco libre → un toque coloca al luchador
    exactamente donde tocaba; abrir a alguien ya colocado desde la
    Colección (sin formationCtx) ofrece quitarlo; Formación llena (9/9) →
    la rejilla de sustitución muestra los 9 colocados y sustituir
    funciona; y abrir directamente desde un hueco ocupado de la rejilla
    de Formación (el flujo de siempre) sigue funcionando exactamente igual.

- [x] Corrección de aguante por clase para mobs rivales (`enemyClassToughnessMult`,
    combat.js) — el usuario reportó un pico de dificultad concreto en
    Llanura del Titán (Gigante + Gran Troll) que le obligaba a sobre-
    invertir, dejando el resto del juego trivial después. La investigación
    inicial (una sola tirada por zona) apuntaba a que Campeón (clase de
    ambos mobs) pesa mucho más HP/DEF en su fórmula que Gurú/Brujo
    (CLASS_INFO: hp 145/def 22 de Campeón frente a hp 85/def 10 de Gurú),
    y que las 6 zonas con pool Campeón+Campeón sufrían mucho más daño que
    zonas "vecinas" sin ningún Campeón.
    Repetida la comparación promediando varias tiradas por zona (para
    quitar el ruido de una sola tirada) antes de dar el ajuste por
    cerrado: el panorama es más matizado de lo que parecía. Zonas de la
    MISMA profundidad SIN ningún Campeón en el pool (Brujo+Brujo,
    Brujo+Gurú) resultan casi igual de duras que las de Campeón+Campeón
    una vez promediadas — el factor dominante ahí es el escalado general
    de zona tardía (`lateZoneMult`), no la clase. Incluso reduciendo el
    HP/DEF de Campeón un 60% (muy por encima de lo aplicado), 3 de 4
    zonas todo-Campeón seguían perdiéndose limpiamente. Así que la
    corrección de clase es real y medible (Campeón sí pesa de más en la
    fórmula, y `computeDamage` no lo compensa) pero NO es la explicación
    completa del pico de dificultad reportado — ni con un ajuste agresivo
    se convierte por sí sola en el arreglo del problema descrito.
    Implementado igualmente como corrección modesta y honesta: `campeon: 0.8`
    en `ENEMY_CLASS_TOUGHNESS_MULT`, aplicado solo a HP/DEF (no ATK/AGI/WIS,
    para no aplanar la identidad de la clase) y SOLO a rivales — `makeUnit`
    únicamente construye el lado 'enemy' en todo el archivo, así que nunca
    toca las stats de un luchador que el jugador posea (Cerbero y demás
    Campeón jugables no cambian) ni las de un jefe de zona (`fixedStats` es
    su propio mecanismo, sin relación con la fórmula de clase).
    Verificado: Cerbero (jugador) y un jefe Campeón (fixedStats) no
    cambian nada; `gigante_epico` como rival sí baja HP/DEF un 20%;
    promediando 4 tiradas por zona en las 4 zonas todo-Campeón más
    profundas, el daño medio recibido baja de 23.649 a 22.182 (~6%) sin
    que ninguna zona se vuelva trivial ni se rompa nada.

- [x] Confirmado y ampliado el punto anterior con la banda REAL que reportó
    el usuario (nivel 40, TODO legendario — personajes Y equipo Nv.15),
    en vez de la banda "invertida" (rareza raro, 3★, equipo raro Nv.5)
    usada en la investigación previa — el usuario rebatió con datos
    concretos que la conclusión "es solo dificultad tardía general" no
    cuadraba: con ese equipo exacto pierde un escenario de 3 oleadas en
    Llanura del Titán pero se pasa Templo del Sol Eclipsado (una zona más
    profunda, pool Brujo+Gurú sin ningún Campeón) con 0 bajas.
    Repitiendo la comparación con la banda maxeada confirma que el
    usuario tenía razón y mi banda de prueba anterior era demasiado floja
    para revelar el efecto ("efecto suelo": con poca inversión todo es
    igual de duro y la diferencia por clase queda enmascarada; solo se
    hace visible con una banda ya muy invertida). Llanura del Titán y
    Templo del Sol Eclipsado tienen prácticamente el mismo `lateZoneMult`
    (profundidad casi idéntica, 25 vs 26), así que es una comparación
    limpia: con la banda maxeada, el daño medio recibido en un combate de
    3 oleadas era ~4-6× mayor en Llanura que en Templo SIN el ajuste
    anterior (`campeon: 0.8` ya aplicado, ese ajuste sí reduce el daño a
    la mitad respecto a sin corregir, pero Llanura seguía siendo ~2× más
    dura que Templo). Subido `ENEMY_CLASS_TOUGHNESS_MULT.campeon` de 0.8 a
    0.65 (combat.js) — con la banda maxeada, Llanura pasa de 21.091 de
    daño medio (sin corrección) a 8.304 (con 0.65), frente a los 4.858 de
    Templo (zona sin ningún Campeón, no afectada por el cambio) — sigue
    habiendo diferencia (Campeón sigue siendo una clase con más aguante,
    intencionadamente) pero mucho más cerca de paridad. Verificado que
    Salón de los Engaños (otra zona todo-Campeón, la más profunda de las
    6) no se rompe ni se vuelve trivial: sigue ganándose 100% de las veces
    en todos los valores probados (0.8/0.7/0.65/0.6).

    De paso, el usuario repitió una queja recurrente de toda la sesión:
    "los bosses no parecen rivales dignos". Investigado con la misma banda
    maxeada: `bossAdaptiveMult` (state.js) amortiguaba el exceso de poder
    del jugador sobre la referencia de zona con raíz cuadrada
    (`Math.sqrt(overpower)`) — con la banda maxeada, el "overpower" real
    era de solo ~2× sobre la referencia (un mob de esa zona sin equipo),
    pero la raíz cuadrada lo dejaba en un mísero ×1.4, muy lejos del techo
    de ×4.5 (nunca se llegaba a acercar). Resultado medido: los jefes de
    Mapa recibían de vuelta 100-1.000 de daño frente a una banda con
    ~27.000 HP total — un rasguño en casi todas las zonas, pase lo que
    pase de invertido que esté el jugador. Ese damping por raíz cuadrada
    tenía sentido para los jefes de la Torre Batalla (que YA se amortiguan
    una segunda vez dividiendo entre la repetición sin curación, ver
    `torreBossMult`), pero un jefe de Mapa (un único encuentro) no tenía
    esa razón para llevar el mismo doble amortiguado. Cambiado el
    exponente de 0.5 (raíz cuadrada) a 0.85 en `bossAdaptiveMult` — con la
    banda maxeada, el daño recibido por los jefes de Mapa sube a un rango
    de 600-20.535 según la zona (varias veces más en casi todas), sin
    perder ninguna partida salvo en Salón de los Engaños (ya la zona más
    dura de las probadas también en las etapas normales), que pasa de
    trámite garantizado a desafío real. Verificado que no rompe el ritmo
    normal del juego: con la banda "invertida" original (mucho más floja,
    la que se usa para simular un jugador siguiendo el ritmo esperado) el
    cambio no hace perder ninguna de 10 zonas de prueba repartidas por
    todo el mapa salvo, de nuevo, Salón de los Engaños (80% de victorias
    en vez de 100%, sigue siendo mayoritariamente ganable) — el ajuste
    solo entra en juego cuando la banda YA supera claramente el ritmo de
    la zona (`overpower > 1`), así que un jugador que va al ritmo normal
    no nota el cambio. También revisado el impacto en Torre Batalla
    (`torreBossMult`, que reutiliza `bossAdaptiveMult` como base): el
    multiplicador final para el último nivel de jefe (el más repetido, 5
    veces sin curación) sube de forma modesta (de ×1.18 a ×1.34 con la
    banda maxeada) — muy lejos del escenario "0/5 combates ganados" que
    motivó en su día el damping adicional por repetición, así que sigue
    protegido.

- [x] Detectado y corregido un desfase de nivel jugador/rival mucho más
    grande de lo que parecía a raíz de la pregunta del usuario sobre el
    salto de dificultad entre Ruinas Abisales y Guarida del Dragón.
    Calculando la XP real (`fighterXpToNext`) que da jugar el mapa SIN
    grindear nada: un jugador natural solo llega a nivel 13 al terminar
    Ruinas Abisales (zona 4) — justo donde el rival YA toca su propio tope
    de nivel 40 (`LEVEL_CAP_ZONE_IDX`) — y no alcanza nivel 40 hasta la
    zona 22, dejando 18 zonas (más de la mitad del mapa) con el rival
    siempre a nivel tope mientras el jugador va muy por detrás. Para
    contexto de lo irreal que es cerrar ese hueco "rejugando unas cuantas
    veces" (como sugería el usuario): hacen falta ~20 vueltas completas a
    las zonas 0-4 solo de XP, o ~288 repeticiones seguidas del jefe de
    Ruinas Abisales.
    Verificado en combate (banda a nivel "natural", rareza igualada al
    pool de cada zona, inversión razonable de 2★/equipo Nv.5): con la XP
    actual, Guarida del Dragón (zona 5, el salto de rareza Raro→Épico justo
    donde el rival deja de subir de nivel) se pierde el 100% de las veces
    SEA CUAL SEA la inversión de estrellas/equipo probada (0★ hasta 3★ +
    equipo Nv.8) — no es un problema de falta de pulido, es el desfase de
    nivel en sí.
    Se plantearon 3 vías: (1) subir la XP para que el jugador suba más
    rápido, (2) retrasar `LEVEL_CAP_ZONE_IDX` (que el rival tope más
    tarde), (3) suavizar nivel/rareza rival zona a zona. Descartada la (2)
    por ser la más invasiva con diferencia: `LEVEL_CAP_ZONE_IDX` es el
    ANCLA de la que cuelga `lateZoneMult` (toda la escalada de dificultad
    de las ~28 zonas posteriores al tope) — moverla habría recalculado
    silenciosamente todo lo ya validado hoy mismo con datos reales del
    usuario (Llanura del Titán, Salón de los Engaños, el exponente de
    `bossAdaptiveMult`), sin ninguna garantía de que el resultado siguiera
    siendo el mismo. Descartada la (3) por ser un parche zona a zona sin
    atacar la causa raíz (el desfase es sistémico, no de un par de zonas
    sueltas). Implementada la (1), en el punto más quirúrgico posible:
    `fighterXpToNext` (data.js) — el ÚNICO sitio del que cuelga TODA la XP
    del juego (etapas, jefes, Torre, Mazmorra Elemental, Arena...), así
    que bajar el coste ahí equivale a subir todas las recompensas a la vez
    sin tocarlas una a una, y no afecta a ninguna banda ya construida a
    nivel fijo (así que no toca nada de lo ya validado esta sesión sobre
    bandas maxeadas a Nv.40).
    Se descartó a propósito una corrección agresiva que adelantara el tope
    de nivel natural a la zona 4-6 (el usuario planteó, con buen criterio,
    que eso dejaría la sensación de "subir de nivel" agotada casi de
    inmediato, con 27 de 33 zonas ya a nivel máximo) — se probó primero
    ÷3 (tope natural sobre la zona 12) pero, con 10 tiradas por zona para
    quitar ruido, dejaba Guarida del Dragón en un 50% de victorias — mejor
    que el 0% original, pero seguía siendo básicamente cara o cruz en la
    zona que se quería arreglar. Subido a ÷4 (tope natural sobre la zona
    10, dos zonas antes que con ÷3): Guarida del Dragón pasa a un 80-100%
    de victorias según la tirada, Ruinas Abisales y Cantera Devorada al
    100% (antes 60% y 0%). El nivel del jugador se queda bastante por
    debajo del rival en esas zonas (Nv.20-28 frente a Nv.40 del rival)
    pero ya no es un abismo, y el resto de ejes de progresión (rareza,
    estrellas, equipo) cierran la diferencia — el reparto de trabajo que
    ya tenía pensado el propio diseño una vez el nivel deja de crecer.
    Cuevas de Cristal (zona 2) queda como excepción sin explicar del todo:
    no mejora de forma limpia con más XP en ninguna prueba (20%→80-90%→
    60-90%, sin relación clara con el multiplicador) — probablemente tiene
    una causa propia aparte del desfase de nivel, pendiente de investigar
    aparte si se reporta como problema.

- [x] Investigados dos "zonas flojas" que había detectado la comprobación
    exhaustiva anterior (Cuevas de Cristal y Aldea del Año Nuevo, ambas con
    un mob Campeón en el pool) — resultaron ser un falso positivo del
    propio perfil de prueba, no del juego: Cuevas de Cristal mezcla dos
    rarezas en su pool (Gárgola Infrecuente + Insecto Gigante Raro) y el
    test igualaba al jugador con la más floja de las dos; con rareza Raro
    (la del miembro más fuerte) sube de 42% a 100% de victorias. Aldea del
    Año Nuevo no tenía nada que ver con Campeón — con 1★ (lo que daba el
    perfil de prueba en esa zona) gana un 8%, con 3★ un 92%; quitar del
    todo la corrección de Campeón apenas cambia nada (8%→0%). No se ha
    tocado ningún código por esto — el perfil de prueba estaba mal
    calibrado, no el balance del juego. Pero esto llevó a la siguiente
    investigación:

- [x] Descubierto y corregido un problema mucho más grave: la Superfusión
    (dar +1★ a un personaje) es, tal y como estaban las tasas de cristal,
    prácticamente inalcanzable jugando con normalidad — reportado
    directamente por el usuario (zona 22 del mapa, 0 superfusiones
    conseguidas). Cada +1★ necesita ~21 copias EXACTAS del mismo
    personaje en forma final (el propio objetivo + un sacrificio también
    en forma final + 5 copias más para llenarle el SEF al sacrificio), y
    cada invocación elige el personaje al AZAR entre todos los de esa
    rareza (31 a 112 según el tier), sin ningún sistema de puntería ni
    pity. Simulado por Monte Carlo (300 tiradas): la mediana real para la
    PRIMERA superfusión, incluso por el camino más favorable posible
    (cadena Común→Infrecuente→Raro, invocando con Pixite), era de
    ~14.000 invocaciones — frente a las ~100 Pixite que da jugarse el
    mapa entero una vez a la tasa anterior (0.6/etapa). Se descartó tocar
    el propio coste de fusión (decisión explícita del usuario: prefiere
    más cristales/copias, no una fusión más barata) y también se descartó
    la alternativa de alargar STAGES_PER_ZONE para repartir más tiradas
    de forma "orgánica" — ese número está metido en 22 sitios del código,
    entre ellos LEVEL_CAP_ZONE_IDX (la fórmula de la que cuelga TODA la
    escalada de zonas tardías, lateZoneMult, ya recalibrada hoy mismo
    con datos reales del usuario) — el mismo riesgo de recalcular en
    cascada todo lo ya validado que se descartó antes para no tocar
    LEVEL_CAP_ZONE_IDX directamente.
    Implementado en su lugar (combat.js): nueva waveCrystalDrops() — en
    vez de una sola tirada de 60% de 1 Pixite al terminar la etapa entera,
    una tirada POR OLEADA (2-3 según la etapa, mismo reparto que ya usa
    buildEnemyBand) de 3-7 Pixite (+5%/1% de Voxite/Doxite por oleada,
    antes inexistente en etapas normales). Además, jefes en repetición
    suben de 25%/3%/1% a Pixite garantizado (3-6) + 25%/8% de Voxite/
    Doxite. Verificado con Playwright: Pixite medio por etapa normal sube
    de 0.6 a ~12.8 (x21); con esa tasa, la mediana de ~14.000
    invocaciones se alcanza en ~1.100 combates — dentro de la franja
    de "grindeo moderado" que se acordó con el usuario (bastante más
    accesible que antes, sin ser instantáneo).
    Añadidos también 5 logros nuevos con recompensa en cristales
    (rC('pixite'|'voxite'|'doxite', N), helper ya existente en data.js
    pero sin usar hasta ahora) ligados a victorias/jefes derrotados, como
    bonus adicional sobre la subida de tasa en combate — no es la pieza
    que arregla el problema, solo un extra por seguir jugando, tal y como
    pidió el usuario.
    CORRECCIÓN a lo de arriba (el análisis inicial de Legendario era
    erróneo): el primer cálculo solo consideraba Doxite en aislado, y
    además la simulación tenía un bug (comparaba posiciones dentro de
    arrays de tamaño distinto entre rarezas como si identificaran la misma
    familia, en vez de seguir la cadena real `evolvesTo`). Rehecho bien
    (simulando las 3 rarezas de cristal a la vez — con Pixite ya tan
    abundante, su 0.5% de Legendario aporta MÁS intentos en total que el
    20% de Doxite — y siguiendo `evolvesTo` en vez de índices de array):
    mediana real ~4.100 combates para Raro→Épico→Legendario (frente a
    ~1.150 del camino Común), una curva de "cuesta más pero no imposible"
    razonable. CONCLUSIÓN FINAL: no hacía falta ningún ajuste adicional
    para Legendario, el error era de cálculo, no del juego.

- [ ] **Pendiente, a petición del usuario:** ampliar el número de Retos
    de Tope de Tier disponibles (relacionado con la queja de que los
    personajes de tier bajo/medio no tienen sitio una vez se consiguen
    tiers altos — Tope de Tier ya es el mecanismo pensado para esto, pero
    el usuario cree que hacen falta más). Aparcado hasta resolver primero
    el punto de abajo (curva de nivel/etapas), a petición explícita del
    usuario ("primero solucionemos el punto 1").

- [x] **Rediseño completo de la curva de nivel/etapas/recompensas del Mapa**
    — sustituye y deja obsoleto TODO lo anterior sobre XP/nivel de esta
    sesión (el `÷4` de `fighterXpToNext`, `LEVEL_CAP_ZONE_IDX` derivado de
    `STAGES_PER_ZONE`). El usuario, en vez de aprobar el reparto "por
    oleada" (que seguía dando 15-20 cristales de golpe por etapa), pidió
    ir a la raíz: bajar la velocidad general de la curva de nivel de todo
    el mapa Y aumentar el número de etapas de mobs por zona a la vez,
    dejando el número de etapas a mi criterio y sin importar en qué zona
    se alcance el nivel tope, con una lista de objetivos de diseño (lógica
    orgánica etapas/cristales; buena relación cristales/XP/monedas/equipo
    vs. dificultad, jefes siempre más duros que mobs por ser 1 contra 9;
    pasable sin rejugar todos los mapas muchas veces; llegar preparado a
    Torre Batalla; buen balance progresión/dificultad; priorizar que sea
    divertido sobre preservar la lógica ya hecha; calibrar con escenarios
    realistas, no de suerte extrema).
    Implementado:
    - `STAGES_PER_ZONE`: 8 → 15 (14 etapas de mobs + 1 jefe). La rampa de
      nº de rivales dentro de la zona (`rowCount` en `buildEnemyBand`,
      combat.js) se reescala proporcional (antes `stageIdx<3`, ahora
      `stageIdx<5`, misma proporción ~43%).
    - `fighterXpToNext` (data.js): REVERTIDO a la fórmula original
      (`20×nivel^1.5`, sin el `÷4`) — el ajuste de ritmo ya no vive en el
      coste de subir de nivel.
    - Nivel del rival totalmente desacoplado de `STAGES_PER_ZONE` y de la
      etapa dentro de la zona: nueva `zoneEnemyLevel(zoneIdx)` (data.js)
      depende SOLO de la zona, con una rampa deliberadamente lenta —
      `LEVEL_CAP_ZONE_IDX` pasa de derivarse de `STAGES_PER_ZONE` (antes
      efectivamente zona 4) a una constante manual = 28 (de 33), así que
      el rival no toca nivel tope hasta prácticamente el final del mapa.
      Todas las etapas de una misma zona pelean ahora al MISMO nivel (lo
      que varía dentro de la zona es solo cuántos rivales trae cada
      oleada). Actualizados todos los puntos que antes calculaban el nivel
      a mano vía `1+globalIdx` (buildEnemyBand y gearDropRarity en
      combat.js; bossAdaptiveMult y bossesOverview en state.js;
      elementalDungeonLevel y el nivel de jefe de Torre en data.js) para
      usar `zoneEnemyLevel` de forma consistente.
    - Recompensas (Texel/XP/Pixite) de `stageRewards` (combat.js)
      reescritas de cero: ya NO dependen de `globalIdx` (posición global
      en el mapa) sino de `zoneIdx` — `zoneTexelTotal(zoneIdx)` y
      `zoneXpTotal(zoneIdx)` fijan el total de limpiar una zona entera una
      vez, repartido a partes iguales entre las 14 etapas de mobs (65%/
      70% del total) + una porción para el jefe (35%/30%, con su propio
      bonus de primera vez vs. repetición). `zoneXpTotal` calibrado
      (`40+zoneIdx×190`) para que la XP acumulada de un jugador NATURAL
      (una sola pasada, sin grindear) llegue a Nv.40 justo sobre la zona
      28 — verificado con Playwright usando `fighterAddXp` real: el nivel
      natural del jugador queda SIEMPRE muy cerca del nivel del rival en
      las 33 zonas (nunca más de 2-3 niveles por detrás, a veces por
      delante), algo que nunca se había conseguido en toda la sesión.
      `ZONE_PIXITE_TOTAL` fijo en 95 (NO escala con la zona, es "moneda de
      invocación" no un indicador de poder) — mismo total medio por zona
      que la ronda de cambios anterior, pero repartido entre 14 etapas en
      vez de 7: Pixite medio por etapa baja de ~12.8 a ~7.0, verificado —
      ya no es "un pufo de cristales", es un puñado modesto por combate.
      `gearDropRarity` (combat.js) pasa a tomar `zoneIdx` en vez de
      `globalIdx` (coeficiente reescalado de 0.01→0.08 para el mismo
      máximo relativo).
    - **Bug encontrado y corregido durante la verificación**: los jefes de
      zona usan `fixedStats` fijos escritos a mano por zona (`addBoss`),
      que NUNCA dependieron de la fórmula de nivel — estaban calibrados a
      ojo para el ritmo ANTIGUO (rápido). Con la curva nueva mucho más
      lenta, un jugador natural en la zona 4 es ahora Nv.9 en vez del
      Nv.33 de antes, pero el jefe de esa zona seguía esperando al
      jugador viejo: verificado en combate, los jefes de las primeras ~12
      zonas se perdían el 100% de las veces con una banda a ritmo
      natural, mientras las oleadas de mobs de esas mismas zonas se
      ganaban sin problema (los mobs SÍ escalan con `zoneEnemyLevel`).
      Corregido con `bossLevelCorrectionMult(zoneIdx)` (data.js): reescala
      `fixedStats` por la proporción entre `levelGrowth` del nivel NUEVO y
      del nivel ANTIGUO en esa zona (converge a ×1 en las últimas zonas,
      donde ambas curvas ya tocan Nv.40) — aplicado como suelo siempre
      activo dentro de `bossAdaptiveMult` (state.js), multiplicado por el
      escalado adaptativo existente cuando el jugador va sobrado.
      Re-verificado tras el arreglo: 100% de victorias en las 33 zonas,
      tanto oleadas como jefes, con banda a ritmo natural (0-3★ según la
      zona, equipo creciendo poco a poco) Y con banda maxeada — antes del
      arreglo, la banda natural perdía el 100% de las veces en zonas 0-10.
    - Torre Batalla comprobada con una banda "recién terminado el mapa"
      (Nv.40, mezcla épico/legendario, 3★, equipo Nv.18): el nivel más
      duro tanto de mobs (15 rivales seguidos sin curar) como de jefes (el
      último, ×5 repeticiones) se gana 3/3 en la prueba — llega preparado,
      sin ser trivial (multiplicadores de jefe entre ×1.25 y ×2.65 según
      la profundidad de origen).
    - Superfusión re-verificada con el sistema nuevo: mediana de ~2.076
      ETAPAS (no invocaciones) para la primera del camino Común — con el
      mapa ahora en 495 etapas totales (antes 264), la proporción relativa
      de grindeo es prácticamente idéntica a la de la ronda anterior
      (~4.2 vueltas al mapa en ambos casos), así que el ritmo de
      Superfusión ya validado no se ha visto alterado, solo repartido en
      pasos más pequeños.
    LIMITACIÓN CONOCIDA: no se ha re-verificado exhaustivamente cada zona
    específica que se ajustó a mano en rondas anteriores de hoy (Salón de
    los Engaños sigue destacando como la más dura incluso con banda
    maxeada — jefe con ~21.450 de daño medio recibido frente a un rango de
    250-4.600 en el resto de zonas tardías — pero sigue ganándose siempre;
    no se ha repetido la comparación exacta Llanura vs. Templo con estos
    valores nuevos). Si el usuario reporta algún punto concreto raro
    jugando de verdad, investigar con datos reales como se ha hecho toda
    la sesión.

- [x] A petición del usuario: quitado el Legendario de Pixite del todo (era
    0.5%) y bajados Épico/Raro/Infrecuente (2.5%→1%, 12%→6%, 30%→23%),
    subiendo Común al resto (55%→70%) — objetivo explícito: diferenciar
    mejor el rol de cada cristal (Pixite = combustible barato de Común/
    Infrecuente para fusionar hacia arriba; Voxite = tramo medio Raro/
    Épico; Doxite = el único camino realista a Épico/Legendario por tirada
    directa) y que la fusión (evolucionar duplicados hacia arriba en vez
    de esperar suerte con la tirada) pese más en la progresión.
    Verificado el impacto real con la misma simulación de Superfusión de
    la ronda anterior (siguiendo `evolvesTo`, consumiendo los cristales
    reales de `stageRewards`): el camino Raro→Legendario, que antes de
    este cambio recibía sin querer MÁS intentos de Pixite que de Doxite
    (por puro volumen, pese a la tasa de Pixite de solo 0.5%), se disparó
    a una mediana de ~17.200 etapas con casi la mitad de las pruebas (19
    de 40) sin completarse ni en 30.000 etapas — el mismo tipo de "casi
    imposible" que ya se había corregido antes en la sesión, esta vez
    causado a propósito por el cambio de tasa. Compensado subiendo
    Voxite/Doxite de las etapas normales (5%→25%→40% / 1%→6%→12%, dos
    rondas de ajuste) y de los jefes en repetición (25%→45%→65% /
    8%→22%→35%) hasta que el camino Legendario volvió a una mediana
    razonable sin fallos: **~8.620 etapas, 0 de 40 pruebas sin completar**
    (frente a ~7.690 etapas equivalentes antes de este cambio — algo más
    lento a propósito, coherente con que ahora cueste más por tirada
    directa y haga más falta invertir en fusión). Progresión final
    verificada por camino: Común ~2.585 etapas, Infrecuente ~6.083,
    Raro→Legendario ~8.620 — una escalera sensata, cada tramo más caro que
    el anterior sin que ninguno se vuelva inalcanzable. Volumen de Voxite/
    Doxite final: ~0.4/0.12 por etapa normal, ~0.65/0.34 por jefe en
    repetición (Pixite se queda en ~7/etapa) — siguen sintiéndose cristales
    minoritarios frente a Pixite, no se ha roto la jerarquía de rareza.

- [x] Añadido botón "Invocar todo (N)" en cada panel de cristal (Invocar),
    junto a x1/x10 — a petición del usuario: con el volumen de cristales
    ya subido varias veces esta sesión, vaciar un cristal abundante a
    mano (pulsando x10 repetidamente) era tedioso. Reutiliza `UI.doSummon`
    tal cual (ya aceptaba cualquier `count`), pasando `state.currencies[type]`
    como cantidad. De paso, `UI.showMultiReveal` (el carrusel de cartas
    una a una al invocar en tanda) por encima de 20 resultados salta
    directo al resumen en cuadrícula — pasar carta a carta ya no era
    práctico invocando 50-100+ de golpe. Verificado con Playwright: con
    47 Pixite, el botón dice "Invocar todo (47)", gasta el total, y
    muestra el resumen en cuadrícula directamente (no el carrusel); con
    5 Pixite (por debajo del límite) sigue mostrando el carrusel de
    siempre, sin romper el flujo normal de tandas pequeñas.

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
