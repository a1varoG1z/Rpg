# Defensor de Texel

Un RPG *idle* de mazmorras para jugar desde el móvil, inspirado en **D.o.T.: Defender of Texel**. Tu héroe combate automáticamente contra oleadas de monstruos; tú ayudas tocando la pantalla, usando habilidades, mejorando el equipo y subiendo de nivel.

Juego 100% web (HTML/CSS/JS puro, sin build ni instalación) pensado para abrirse directamente desde el navegador del móvil.

## Cómo jugar

Abre la URL de GitHub Pages del repositorio desde el navegador del móvil (Safari/Chrome). Opcionalmente, usa "Compartir → Añadir a pantalla de inicio" (iOS) o el menú "Instalar app" (Android/Chrome) para tenerlo como una app a pantalla completa.

El progreso se guarda automáticamente en el propio dispositivo (`localStorage`), incluidas las ganancias mientras no juegas (progreso offline, hasta 8 horas).

## Mecánicas

- **Combate automático**: tu héroe ataca solo según su velocidad de ataque; toca al enemigo para infligir daño extra.
- **Oleadas y jefes**: cada localización tiene oleadas infinitas de dificultad creciente; cada 10ª oleada aparece un jefe. Derrotarlo desbloquea la siguiente zona.
- **Nivel y características**: gana experiencia, sube de nivel y reparte puntos entre Fuerza, Agilidad y Vitalidad.
- **Equipo**: 6 ranuras (arma, casco, pechera, guantes, botas, amuleto) con rareza (común → legendario), mejorables con oro.
- **Habilidades activas**: Golpe Poderoso, Grito de Guerra, Curación y Torbellino, cada una mejorable y con tiempo de reutilización.
- **Mapa**: 6 localizaciones temáticas (Bosque, Pantano, Cuevas de Cristal, Picos Helados, Ruinas Abisales, Guarida del Dragón), desbloqueadas progresivamente.
- **Progreso offline**: al volver, se calcula una estimación de oro/experiencia ganados mientras estabas fuera.

## Desarrollo

No requiere build: son ficheros estáticos (`index.html`, `css/`, `js/`). Para probarlo localmente basta con servirlo con cualquier servidor estático, por ejemplo:

```
python3 -m http.server 8000
```

y abrir `http://localhost:8000`.

## Despliegue (GitHub Pages)

El workflow `.github/workflows/deploy.yml` publica automáticamente el sitio en GitHub Pages en cada push a `main`. La primera vez hay que activarlo manualmente (una sola vez) desde el móvil:

1. Entra en el repositorio en GitHub (navegador móvil vale).
2. **Settings → Pages**.
3. En "Build and deployment" → "Source", elige **GitHub Actions**.

Tras eso, la web quedará disponible en `https://<usuario>.github.io/<repositorio>/`.
