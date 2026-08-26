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

## Pendiente — sistemas grandes (necesitan diseño propio, iteración aparte)

- [ ] **Combate — pulido visual**: las capturas de referencia del D.o.T. real
      ya llegaron y están guardadas en `reference/dot-original/` (ver Notas)
      — `combate-formacion-3x3.jpg` y `combate-elegir-linea.jpg`. La mecánica
      ya está implementada (elegir línea libremente, HP/carga compartidos);
      esto es solo para afinar cómo se ve/anima el choque (posiciones,
      movimiento de ataque) para acercarlo más al original
- [ ] **Mapa — pulido visual**: capturas de referencia ya guardadas en
      `reference/dot-original/recorrido-escenario.jpg` y
      `encuentro-enemigo.jpg`. El recorrido nodo a nodo ya funciona, esto es
      para el arte del camino (ahora mismo son círculos con emoji, sin
      sprites de escenario)
  - [ ] Ampliar el número de mapas/zonas (van a crecer mucho los jefes) —
        el roster masivo (14.1-14.3) ya está creado, así que esto ya se
        puede abordar cuando toque: hay que decidir qué personajes/mobs van
        en cada zona nueva y wirear los 27 jefes nuevos como jefes de zona
        (ahora mismo están creados pero ninguna zona los usa todavía)
  - [ ] Sprites de escenario/paisaje pendientes (ver lista de sprites no-personaje)
- [ ] **Homúnculos**: nueva "criatura" que sirve para fusionarse con
      cualquier luchador jugable y subirle de nivel (no lucha). Tiers 1/2/3,
      a mejor tier más experiencia otorgada.
- [ ] **Estadísticas individualizadas por personaje** (no todas las de una
      clase son iguales) + sistema de tipos/tribus que genera debilidades y
      fortalezas (p.ej. Champ superior en ataque/defensa pero débil contra
      magia) — la imagen de tipos y tribus YA llegó y está guardada en
      `reference/dot-original/tribu-tipo-ayuda.jpg` (5 signos elementales en
      círculo: Fuego/Agua/Rayo/Aire/Tierra, cada uno fuerte contra el
      siguiente en sentido horario y débil contra el anterior — el sistema de
      elementos actual ya sigue esa misma idea; y 5 tipos con perfiles de
      stats distintos: Champ, Guru, Rogue, Scout, Warlock) — pendiente de
      diseñar cómo mapear esto a las 5 clases actuales (Campeón/Pícaro/
      Gurú/Brujo/Explorador) y de implementar
  - [ ] Más tipos de ulti variados (curación, etc., no solo daño/debuff/buff
        ya existentes)
  - [ ] Adaptar TODOS los personajes ya creados al nuevo sistema de stats y
        tipos/tribus una vez esté definido

## Sprites de personajes/mobs/jefes pendientes (roster masivo)

Los 89 personajes, 33 mobs y 27 jefes del roster masivo (14.1/14.2/14.3) ya
están creados en `js/data.js` con sus 3 formas (o forma única para los
jefes), stats, habilidad e historia — usan el sprite procedural de
respaldo hasta que haya arte real. Nombre de archivo esperado si se genera
arte: cae directo en `assets/creatures/`, con el nombre exacto entre
comillas de cada entrada de abajo (mismo patrón que el resto del roster,
`slug_rareza.png`).

Ya pendientes de arte real (del roster humanizado ya existente, no del
roster masivo): Marina, Gea, Brisa, Electro.

### Personajes (14.1) — 89 familias × 3 formas
- **sirena**: Sirena de Voz Dulce (`sirena_infrecuente.png`) → Sirena Encantadora (`sirena_raro.png`) → Reina de las Profundidades (`sirena_epico.png`)
- **gorila**: Gorila Montaraz (`gorila_comun.png`) → Gorila de Espalda Plateada (`gorila_infrecuente.png`) → Rey de la Jungla de Piedra (`gorila_raro.png`)
- **cocodrilo**: Guerrero Cocodrilo (`cocodrilo_infrecuente.png`) → Centurión del Pantano (`cocodrilo_raro.png`) → Señor de las Aguas Turbias (`cocodrilo_epico.png`)
- **hidradragon**: Cría de Mil Fauces (`hidradragon_raro.png`) → Dragón de Tres Cabezas (`hidradragon_epico.png`) → Soberano de las Siete Cabezas (`hidradragon_legendario.png`)
- **avefenix**: Polluelo de Cenizas (`avefenix_raro.png`) → Ave de Fuego Eterno (`avefenix_epico.png`) → Fénix Inmortal (`avefenix_legendario.png`)
- **hipogrifo**: Potro Alado (`hipogrifo_infrecuente.png`) → Hipogrifo Salvaje (`hipogrifo_raro.png`) → Señor de los Cielos Altos (`hipogrifo_epico.png`)
- **cerbero**: Cachorro de Tres Cabezas (`cerbero_raro.png`) → Guardián del Umbral (`cerbero_epico.png`) → Cerbero, Custodio del Inframundo (`cerbero_legendario.png`)
- **centauro**: Potrillo Centauro (`centauro_infrecuente.png`) → Centauro Arquero (`centauro_raro.png`) → Jefe de la Manada Salvaje (`centauro_epico.png`)
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
