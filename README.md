# Defensor de Texel

RPG de colección de criaturas para jugar desde el móvil, inspirado en **D.o.T.: Defender of Texel**: recrea sus mecánicas reales (banda de luchadores en cuadrícula 3×3, combate por filas, elementos, clases, invocación por cristales, fusión/evolución, energía) con un roster de criaturas y un motor de sprites pixel-art **originales** — no se copia el arte ni los nombres del juego original, que son propiedad de sus creadores.

Juego 100% web (HTML/CSS/JS puro, sin build ni instalación), pensado para abrirse directamente desde el navegador del móvil.

## Cómo jugar

Abre la URL de GitHub Pages del repositorio desde el navegador del móvil. Opcionalmente, "Compartir → Añadir a pantalla de inicio" (iOS) o "Instalar app" (Android/Chrome) para tenerlo a pantalla completa.

El progreso se guarda automáticamente en el dispositivo (`localStorage`).

## Mecánicas

- **Banda 3×3**: coloca hasta 9 luchadores en una cuadrícula de 3 filas (3 combinaciones de hasta 3).
- **Elige tu combinación cada choque**: al entrar en combate, el rival revela su fila y tú eliges con cuál de tus 3 combinaciones responder — puedes reservar tu mejor equipo o reaccionar a lo que enseña el enemigo. Cada combinación solo se usa una vez por batalla; si no derrota a la fila rival, la siguiente combinación que envíes retoma el combate donde quedó.
- **Elementos y clases**: 5 elementos (Fuego/Viento/Tierra/Rayo/Agua, con ventajas tipo piedra-papel-tijera) y 5 clases (Campeón, Pícaro, Gurú, Brujo, Explorador) con roles de combate distintos (tanque, daño físico, daño mágico, híbrido, soporte).
- **Combate con ULTI cargable**: cada luchador ataca automáticamente según su agilidad; golpear o recibir daño llena su barra de ULTI, y al completarse desata su habilidad especial en vez de un golpe normal. La batalla se reproduce animada, con opción de saltar al resultado de cada choque.
- **Invocación (gacha)**: 3 tipos de cristal (Pixite, Voxite, Doxite) con tasas de rareza distintas, obtenidos jugando o comprados con Gemas (moneda ganable en el juego, sin dinero real).
- **Fusión (SEF) y evolución**: invocar duplicados de un luchador aumenta su fusión (0/5); al llegar a 5/5 evoluciona a su forma superior. La Superfusión sacrifica un luchador totalmente fusionado para dar una ⭐ permanente a otro.
- **Mapa por etapas**: 6 zonas con 8 etapas cada una (la 8ª es el jefe de zona); cada intento cuesta Energía, que se regenera con el tiempo.
- **Equipo**: arma y armadura por luchador, mejorables con Texel.
- **Arena**: liga simulada contra bandas controladas por IA de dificultad creciente (no hay otros jugadores reales: es una app de un solo jugador).

## Sprites pixel-art originales

`js/sprite.js` genera cada criatura por código: una silueta de bestia/criatura distinta según su clase (acorazada, alada, flotante...), coloreada según su elemento, con sombreado en dos tonos, contorno, brillo especular y sombra de suelo. Es un sistema propio, sin assets externos ni arte con copyright.

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
