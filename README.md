# Defensor de Texel

RPG de colección de criaturas para jugar desde el móvil, inspirado en **D.o.T.: Defender of Texel**: recrea sus mecánicas reales (banda de luchadores en cuadrícula 3×3, combate por filas, elementos, clases, invocación por cristales, fusión/evolución, energía) con un roster de criaturas y un motor de sprites pixel-art **originales** — no se copia el arte ni los nombres del juego original, que son propiedad de sus creadores.

Juego 100% web (HTML/CSS/JS puro, sin build ni instalación), pensado para abrirse directamente desde el navegador del móvil.

## Cómo jugar

Abre la URL de GitHub Pages del repositorio desde el navegador del móvil. Opcionalmente, "Compartir → Añadir a pantalla de inicio" (iOS) o "Instalar app" (Android/Chrome) para tenerlo a pantalla completa.

El progreso se guarda automáticamente en el dispositivo (`localStorage`).

## Mecánicas

- **Banda 3×3**: coloca hasta 9 luchadores en una cuadrícula de 3×3.
- **Combinaciones en cualquier dirección, elegidas en el momento**: no hay preselección — en cada choque puedes elegir cualquiera de las 8 líneas posibles de la Formación (filas, columnas o diagonales) que aún tenga luchadores vivos, igual que en el D.o.T. real. Un luchador que pertenece a varias líneas a la vez (p. ej. el del centro, que está en su fila, su columna y las 2 diagonales) comparte el mismo HP y carga de ULTI entre todas ellas: cambiar de línea no cura ni resetea nada.
- **Elige tu combinación cada choque**: al entrar en combate, el rival revela su fila y tú eliges con cuál línea responder. Cada combinación pelea por **rondas**: todos sus luchadores vivos (y los del rival) actúan una vez y ahí termina el choque — no es un intercambio infinito. Si el enemigo sigue en pie, esa línea queda gastada para este ciclo; cuando ya se usaron todas las que siguen vivas, se reinicia el ciclo y se vuelve a elegir. Al derrotar la fila rival, todas las líneas vuelven a estar disponibles para la siguiente oleada.
- **Elementos y clases**: 5 elementos (Fuego/Viento/Tierra/Rayo/Agua, con ventajas tipo piedra-papel-tijera) y 5 clases (Campeón, Pícaro, Gurú, Brujo, Explorador) con roles de combate distintos (tanque, daño físico, daño mágico, híbrido, soporte).
- **Vulnerabilidades de tipo y stats individualizadas**: cada clase tiene una debilidad — Campeón recibe más daño mágico, Gurú más daño físico, Pícaro más de cualquier ataque, Brujo un poco de ambos, Explorador ninguna. Además, cada una de las +130 familias tiene su propia variación de stats (hasta ±12%, siempre la misma para esa familia) en vez de compartir exactamente el perfil de su clase.
- **Combate con ULTI cargable**: cada luchador ataca automáticamente según su agilidad; golpear o recibir daño llena su barra de ULTI (con un número estimado de turnos hasta que se completa), y al desatarse usa su habilidad especial en vez de un golpe normal. La vida y la carga de ULTI se mantienen durante toda la etapa, no solo dentro de un encuentro. La batalla se reproduce animada, con opción de saltar al resultado de cada ronda.
- **Invocación (gacha)**: 3 tipos de cristal (Pixite, Voxite, Doxite) con tasas de rareza distintas, obtenidos jugando o comprados con Gemas (moneda ganable en el juego, sin dinero real). La invocación x10 se revela en un carrusel, una criatura a la vez.
- **Rareza en 5 escalones y fusión manual (SEF)**: Común → Infrecuente → Raro → Épico → Legendario. Cada familia de criatura evoluciona **exactamente 2 veces (3 formas)**, igual que en D.o.T., pero según su punto de partida ocupa un tramo distinto de esa escalera de 5 — así no todas llegan a Legendario: las familias "Tier 1" van de Común a Raro, las "Tier 2" de Infrecuente a Épico, y solo las "Tier 3" (las que arrancan ya en Raro) alcanzan Legendario. Cada copia invocada se guarda por separado en la Colección (no se fusiona sola): desde la ficha del luchador eliges a mano qué copias sueltas usar como material de fusión hasta llegar a 5/5, y entonces lo evolucionas tú mismo, con una animación a pantalla completa. La Superfusión sacrifica un luchador totalmente fusionado para dar una ⭐ permanente a otro.
- **Roster grande**: más de 130 familias de criaturas invocables (137 con las 15 originales) con 3 formas cada una, además de 27 jefes únicos (sin evolución, fuera del pool de invocación — pensados como antagonistas, no como luchadores reclutables). Cada uno con su elemento, clase, habilidad y una frase de historia propia.
- **Habilidad de líder de banda**: los luchadores Legendarios llevan una habilidad pasiva de líder que bonifica a TODA la banda (no solo a quien la tiene) mientras ocupen la celda central de la Formación — un +15% a ataque, defensa, vida, agilidad o sabiduría, según el luchador.
- **Homúnculos**: no luchan nunca — solo sirven para fusionarse con cualquier luchador jugable y darle experiencia de golpe. Hay 3 tiers (a mejor tier, más experiencia) y pueden salir de cualquier invocación junto a los luchadores normales.
- **Mapa por etapas, cada una un recorrido**: 6 zonas con 8 etapas cada una. Las etapas 1-7 son un recorrido de varios encuentros (siempre 3 rivales por oleada) seguido de un nodo de recompensa — no es un único combate: hay que superar todos los encuentros para cobrar la recompensa. La 8ª etapa es el jefe de zona: un combate único, solo contra él. La vida y los desmayos de la banda persisten entre nodos de un mismo recorrido (ya no se cura sola al pasar de encuentro), así que llegar mal parado al siguiente combate es un riesgo real.
- **Tienda**: compra equipo nuevo al azar por rareza (Texel) y objetos curativos/revividores — Poción Menor y Poción Mayor (Texel) para curar a la banda entre nodos, Pluma Fénix (Gemas) para revivir a un luchador desmayado — imprescindibles para aguantar un recorrido largo sin volver a la base.
- **Equipo**: arma y armadura por luchador, mejorables con Texel.
- **Arena**: liga simulada contra bandas controladas por IA de dificultad creciente (no hay otros jugadores reales: es una app de un solo jugador).

## Sprites

Cada luchador puede tener arte propio (PNG en `assets/creatures/`, generado por el usuario) o, si no lo tiene, se dibuja por código con `js/sprite.js`: una silueta de bestia/criatura distinta según su clase (acorazada, alada, flotante...), coloreada según su elemento, con sombreado en dos tonos, contorno, brillo especular y sombra de suelo. Ningún arte ni nombre del juego original se reutiliza.

## Desarrollo

No requiere build: son ficheros estáticos. Para probarlo localmente:

```
python3 -m http.server 8000
```

y abrir `http://localhost:8000`.

## Despliegue (GitHub Pages)

El workflow `.github/workflows/deploy.yml` publica automáticamente el sitio en cada push a `main`. La primera vez hay que activarlo manualmente desde el móvil:

1. Entra en el repositorio en GitHub.
2. **Settings → Pages**.
3. En "Source", elige **GitHub Actions**.

La web quedará disponible en `https://<usuario>.github.io/<repositorio>/`.
