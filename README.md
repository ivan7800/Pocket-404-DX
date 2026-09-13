# Pocket 404 DX

**v6.1.0 · Complete Adventure Edition**

**Rune Quest 404 DX** es una aventura web 16-bit original para navegador/PWA. Esta edición conserva la campaña conectada de Veyra y añade una capa de combate mucho más completa: arsenal persistente, ataques cargados, parry, habilidades activas de runa, IA diferenciada, drops, progresión narrativa y New Game+.

## Qué incluye v6.1

- **7 armas** con identidad jugable y desbloqueo por campaña: Traveler Blade, Briar Cleaver, Ember Sabre, Tide Pike, Prism Edge, Aether Blade y Nullbrand. Pueden cambiarse con **Q** o equiparse desde el inventario.
- Ataque inmediato + **carga manteniendo Z/A**, combo de tres golpes, knockback, burn y proyectiles de arma.
- **Parry perfecto** al inicio de la guardia; puede reflejar proyectiles y aturdir enemigos.
- **7 habilidades activas de runa**: Root Pulse, Cinder Nova, Tidal Dash, Still Second, Prism Veil, Sky Cut y Second Name. La runa equipada se puede cambiar con **T / ↻** o desde el inventario.
- **11 patrones de IA especializados** añadidos sobre el bestiario existente: picado, carga, emboscada, rebote, imitación, teletransporte, salto, ráfagas de viento, enjambre, predicción y minas.
- Drops de combate: corazón, 3 shards y **Focus** temporal (+daño).
- Taller reequilibrado con **7 mejoras permanentes**.
- Diálogos que cambian con el progreso para Edda, Sile, Lio, Orrin, Neri, Mira y Tamas.
- El sistema de guardado pasa a **schema 6** y migra las partidas anteriores sin obligar a reiniciar. Las armas correspondientes a dungeons ya superados se recuperan automáticamente.
- New Game+ conserva mejoras y armas desbloqueadas.


## Balance final v6.1

- HP de los 7 minibosses reescalado: **16 → 24 → 32 → 40 → 48 → 56 → 66**.
- HP de los 7 guardianes reescalado: **36 → 54 → 78 → 92 → 108 → 124 → 156** para que sus fases lleguen a mostrarse incluso con builds ofensivas.
- Ember Sabre ajustada de 0,23 s a **0,27 s** de cooldown para que Tide Pike y Prism Edge mantengan nichos útiles.
- Economía de ruta principal validada: permite comprar de forma natural las **7 mejoras**, una por capítulo con una prioridad razonable, sin depender de secretos ni side quests.
- Corregido el generador de `bundle.js`: una clase exportada con indentación podía dejar un `export` dentro del bundle clásico y romper el arranque en navegador.
- Añadido `tools/release_gate_v61.mjs` y regresión Chromium inline para controles, mapa, pausa, selección de arma/runa y responsive móvil.

## Contenido de la aventura

- **7 dungeons / 51 salas** internas.
- **23 pantallas de overworld** conectadas.
- **37 criaturas** en bestiario: 23 enemigos normales/especiales, 7 minibosses y 7 bosses.
- **6 herramientas**: Thorn Shears, Ember Grapple, Tide Mantle, Echo Bell, Prism Lens y Sky Anchor.
- **7 runas**: Verdant, Ember, Tide, Echo, Prism, Aether y Null.
- **7 armas** persistentes.
- **16 salas** de puzle o uso obligatorio de herramienta.
- **27 recompensas/cofres**, **12 secretos** de overworld y reliquias opcionales.
- **15 apariciones de NPC** y **6 side quests** persistentes.
- **7 mejoras** de taller comprables con shards.
- 3 slots, Continue, borrado de slot, postgame y New Game+.
- Final normal, **True Ending**, ending y créditos.
- Audio procedural mediante Web Audio, sin archivos externos.
- PWA local-first, sin backend, cuentas, telemetría, CDN ni dependencias runtime.

## Estructura de campaña

Nueva partida → Bellwether → Moss Gate → Sunken Forge → Tideglass Grotto → Clockwood → Obsidian Keep → Starfall Sanctum → Null Archive → Null Regent → ending → créditos.

Las herramientas abren rutas nuevas y también permiten volver a zonas antiguas para descubrir secretos. Las armas se desbloquean con hitos de campaña; las runas añaden pasivas y una habilidad activa con enfriamiento.

## Controles

- **WASD / flechas**: movimiento.
- **Z / A**: ataque. Mantén pulsado para cargar y suelta para ejecutar el golpe cargado.
- **X / B**: guardia. Si bloqueas al inicio de la pulsación realizas un parry perfecto.
- **Q / ARMA**: cambiar entre armas desbloqueadas.
- **R / RUNA**: activar la habilidad de la runa más reciente.
- **C / E / Enter / C táctil**: interactuar, hablar, usar herramienta o entrar en santuario.
- **Esc / START**: pausa.
- **SELECT**: mapa de Veyra.

En móvil, la cruceta, A/B/C y los controles ARMA/RUNA de la carcasa son interactivos mediante Pointer Events.

## Pocket 404 DX · Authentic Handheld UI

La partida se presenta dentro de una consola horizontal Pocket 404 DX: pantalla 16:9 central, D-pad a la izquierda, A/B/C a la derecha, SELECT/START y HUD integrado en la carcasa. La antigua columna lateral tipo dashboard no forma parte de la vista de juego.

## Arquitectura

- `index.html` — hub, campaña, inventario, juego, ending y diálogos.
- `css/app.css` — UI responsive y carcasa.
- `js/data.js` — mundo, dungeons, armas, runas, enemigos, quests y lore.
- `js/engine.js` — Canvas 2D, combate, IA, drops, parry, runas y progresión.
- `js/audio.js` — audio procedural.
- `js/save.js` — slots, migración y persistencia.
- `js/app.js` — UI, navegación, settings y bindings.
- `js/bundle.js` — bundle generado para ejecución estática.
- `tools/build_bundle.py` — reconstrucción del bundle.
- `sw.js` / `manifest.webmanifest` — PWA.
- `ADVENTURE_BIBLE.md` — canon y reglas de diseño.
- `PROGRESSION_MATRIX.md` — campaña, gates y arsenal.
- `QA_REPORT.md` — pruebas y limitaciones verificadas.

## Desarrollo

Después de modificar los módulos del runtime:

```bash
python3 tools/build_bundle.py
node --check js/bundle.js
node --check js/engine.js
node --check js/app.js
node --check js/save.js
node --check sw.js
```

## GitHub Pages

Todo usa rutas relativas y está preparado para una URL del tipo `https://usuario.github.io/REPOSITORIO/`.

1. Sube el contenido del ZIP a la raíz del repositorio.
2. Activa **Settings → Pages → Deploy from branch**.
3. Haz una recarga forzada tras sustituir una versión anterior.
4. Comprueba Nueva partida, Continue, ARMA, RUNA, MAPA y guardado.
5. Instala la PWA y valida offline en HTTPS real.

## Privacidad y seguridad

El progreso se almacena en `localStorage`. No se envían partidas, identificadores ni telemetría. La aplicación usa CSP restrictiva, no incluye `eval`/`new Function` y no carga recursos runtime remotos.

## Originalidad

Es un homenaje espiritual a los action-adventure de 16 bits, no una reproducción de una obra existente. No contiene mapas, personajes, sprites, música, diálogos, nombres ni recursos de Zelda / A Link to the Past. Veyra, su historia, enemigos y sistemas son originales.

## Estado de validación

Los módulos pasan comprobación sintáctica; se han verificado por pruebas de motor la migración de saves, arsenal, ataque cargado, parry, runas, IA especializada y progresión estructural de los 7 dungeons hasta True Ending. La validación interactiva completa de v6 en navegador real y una partida humana 0→créditos en hardware móvil siguen siendo comprobaciones manuales pendientes; consulta `QA_REPORT.md`.
