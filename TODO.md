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
      (fila, columna o diagonal) como combinación — panel "Combinaciones" en
      Banda con las 8 líneas posibles, hasta 3 activas a la vez
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

## Pendiente — sistemas grandes (necesitan diseño propio, iteración aparte)

- [ ] **Combate — pulido visual**: falta(n) imagen(es) de referencia del
      combate real de D.o.T. que el usuario mencionó (selección de filas,
      movimiento de ataque) — no llegaron adjuntas; la mecánica ya está
      implementada, esto es para afinar cómo se ve/anima
- [ ] **Mapa — pulido visual**: falta(n) imagen(es) de referencia del
      recorrido de escenario y encuentro con enemigo — no llegaron adjuntas;
      el recorrido nodo a nodo ya funciona, esto es para el arte del camino
      (ahora mismo son círculos con emoji, sin sprites de escenario)
  - [ ] Ampliar el número de mapas/zonas (van a crecer mucho los jefes) —
        depende del roster masivo (14.1-14.3), que aún no está creado
  - [ ] Sprites de escenario/paisaje pendientes (ver lista de sprites no-personaje)
- [ ] **Habilidad de líder de banda**: una criatura (sobre todo legendarias)
      puede tener una habilidad pasiva que bonifica a todo el equipo cuando
      esa criatura ocupa el centro de la formación
- [ ] **Homúnculos**: nueva "criatura" que sirve para fusionarse con
      cualquier luchador jugable y subirle de nivel (no lucha). Tiers 1/2/3,
      a mejor tier más experiencia otorgada.
- [ ] **Estadísticas individualizadas por personaje** (no todas las de una
      clase son iguales) + sistema de tipos/tribus que genera debilidades y
      fortalezas (p.ej. Campeón superior en ataque/defensa pero débil contra
      magia) — necesita la imagen de tipos y tribus que el usuario mencionó
      (no llegó adjunta, pedir que la reenvíe)
  - [ ] Más tipos de ulti variados (curación, etc., no solo daño/debuff/buff
        ya existentes)
  - [ ] Adaptar TODOS los personajes ya creados al nuevo sistema de stats y
        tipos/tribus una vez esté definido

## Pendiente — contenido (roster masivo)

Objetivo: como mínimo un personaje/mob/boss por cada nombre de la lista.
Excepto los jefes, todos con 3 transformaciones (igual que el resto del
roster). Primero con sprite procedural (fallback ya existente), arte real
después según el usuario lo vaya generando.

Ya pendientes de arte real (del roster humanizado ya creado en data.js):
Marina, Gea, Brisa, Electro.

### Personajes (14.1)
sirena, gorila, cocodrilo humanizado, dragón de varias cabezas, ave Fénix,
hipogrifo, cerbero, centauro, minotauro, kraken, Leviatán, fenrir, nahual,
quetzalcoatl, cadejo, hada, shenlong, zeus, guerrero medieval, valquiria,
golem, sátiros, mandrágora, pazuzu, garuda, anubis, ra, osiris, hombre
tigre, hombre lobo, Drácula, genbu, escualo humanizado, Hércules, ciclope,
dríada, ent, hidra, hombre oso, mujer cisne, unicornio, esfinge, grifo,
lamasu, pegaso, sílfide, wyvern, cecaelia, hipocampo, enano, duende
(variante distinta al ya existente), guerrero leopardo, black panther,
hombre con armadura tecnológica (tipo iron man), genio de la lámpara,
amazona, big foot, monstruo del lago ness, espadachín samurái, hombre de
fuego, sacerdote, thor, gladiador, hombre de hielo, odín, sun wukong, león
humanizado, yeti, deer woman, gatúbela, afrodita, basajaun, ícaro,
orangután, Poseidón, davy jones (hombre pulpo), velociraptor, hombre pez,
bastet, orca humanoide, mujer conejo, tiburón martillo pirata,
espantapájaros, escorpión humanoide, dientes de sable humanoide, cangrejo,
topo (variante distinta al ya existente), planta carnívora, estatua

### Jefes / bosses (14.2)
Tifón, quimera, garn, nian, tiamat, surtr, behemoth, gorgona medusa, apofis,
ammit, cthulhu, balrog, león de Nemea, pájaro roc, toro de Creta, basilisco,
ettin, gorgonas, rakshasa, mantícora, liche, mago oscuro (tipo Voldemort),
loki, joker, acromántula, wendigo, mantis religiosa

### Enemigos / mobs normales (14.3)
arpías, dullahan, tengu, goblin, trasgos, demonio, esqueleto, draugr,
chupacabras, kitsune, momia, orcos, dementor, araña, jabalí, gárgola,
gigante, ogro, sátiro, troll, estirge, ondina, zombi, banshee, lamia,
hombre de arena, babosa, sapo, serpiente, seta humanoide, Frankenstein,
hombre de 6 brazos, insecto

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

- El usuario mencionó adjuntar una imagen de "tipos y tribus" y varias
  imágenes de referencia del D.o.T. real (selección de filas, movimiento de
  ataque, recorrido de escenario, encuentro con enemigo, recompensa post
  combate) pero no llegaron adjuntas a la conversación — hace falta que las
  reenvíe cuando se aborden esos puntos.
