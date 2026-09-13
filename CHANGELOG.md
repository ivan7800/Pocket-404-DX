# Changelog

## v6.1.0 · Final Balance & Playthrough Pass

- Rebalanceo de 7 minibosses y 7 guardianes para asegurar exposición real de patrones y fases.
- Ember Sabre pasa a 0,27 s de cooldown para evitar que domine todo el midgame.
- Runa equipada persistente (`equippedRune`), cambio rápido con **T / ↻** y selección desde inventario.
- Armas y runas poseídas pueden equiparse directamente desde las fichas de inventario.
- Save schema 6 con migración automática desde v5; conserva progreso y asigna como runa equipada la última recuperada.
- Protección contra key-repeat de guardia: mantener X ya no puede refrescar indefinidamente la ventana de parry perfecto.
- **Fix crítico del bundle:** `build_bundle.py` ahora elimina `export` aunque exista indentación. La build anterior podía dejar `export class RuneQuestEngine` dentro del script clásico y fallar al arrancar.
- Nuevo release gate automatizado: integridad de campaña, economía, TTK mínimo de bosses, migración, runa equipada, guard/parry, ending verdadero, DOM y assets PWA.
- Regresión Chromium funcional mediante carga inline: boot, nueva partida, movimiento, guardia, pausa, mapa, cambio/activación de runa, cambio de arma, inventario y viewport 390×844 sin overflow.

## v6.0.0 · Complete Adventure Pass

- 7-weapon arsenal with campaign unlocks, weapon cycling and persistent equipment.
- Charged attacks, three-hit weapon combos, knockback, burn and ranged charged wave.
- Perfect-parry timing window, projectile reflection and new combat achievements.
- Active abilities for all seven runes with cooldowns; existing passive rune effects preserved.
- Distinct AI behaviours for Thornbat, Emberling, Brinecrawler, Gearling, Shardling, Mirror Shade, Scree Imp, Gale Eye, Null Mote, Archive Echo and Ink Mote.
- Combat drops: heart, shard cluster and temporary Focus damage buff.
- Three new workshop upgrades and rebalanced shard prices.
- Progress-aware NPC dialogue across Edda, Sile, Lio, Orrin, Neri, Mira and Tamas.
- Handheld HUD now exposes weapon cycling and rune burst controls on desktop and touch.
- Save schema 5 migrates existing slot data in place.
- NG+ carries unlocked weapons and upgrades.
- Fixed ending/audio scene callback wiring in the engine so the final credits view is actually reached after Null Regent.


## v5.1.0 — Authentic Handheld UI
- Rediseño completo de la vista de juego como **Pocket 404 DX horizontal** inspirada en la portada.
- Pantalla 16:9 central ampliada; se elimina el panel lateral permanente que hacía que la partida pareciera un dashboard.
- Cruceta física a la izquierda y botones A/B/C a la derecha, todos reutilizando los controles táctiles reales del motor.
- SELECT abre el mapa y START controla pausa/reanudación.
- Añadido modo fullscreen en escritorio.
- La topbar web se oculta durante la partida para una presentación inmersiva.
- HUD Canvas existente se conserva para evitar duplicados; vida, shards y objetivo se integran discretamente en la carcasa.
- Layout responsive rehecho para escritorio, tablet y móvil sin overflow horizontal.
- Service Worker actualizado a `pocket-404-dx-v5.1.0-authentic-handheld` y cache busting `?v=5.1.0`.
- Se conservan los fixes anteriores: retirada de Classic legacy, estados no interactivos para juegos futuros y limpieza de caches DX antiguos.
- QA de la v5.1: Chromium desktop 1440×1000 y móvil 390×844 pasó arranque, Canvas, mapa, pausa/reanudación y controles táctiles. La v6.0 amplía el motor y requiere su propia regresión E2E.


## 5.0.0 — 16-Bit Definitive Edition
- Renderer renovado a estética 16-bit: héroe con animación de paso/bob, contornos, sombras, luces y ataque/guardia más expresivos.
- Tiles con microdetalle, sombras y variaciones por región.
- FX ambientales propios por bioma: hojas/luciérnagas, brasas, reflejos de agua, motas temporales, destellos, nieve/estrellas y fragmentos Null.
- Proyectiles con halo y bosses con pulso/iluminación reforzada.
- HUD Canvas rediseñado con corazones por celdas y lectura más clara.
- UI exterior refinada para coherencia 16-bit sin aumentar dependencias ni peso de assets.
- Nuevo namespace de caché PWA `pocket-404-dx-v5.0.0-16bit`.
- Overworld explorable ampliado a 23 pantallas conectadas.
- Campaña de 7 dungeons y 51 salas internas.
- Se añaden Tideglass Grotto y Starfall Sanctum y se amplía Null Archive a 9 salas.
- 6 herramientas de exploración con gates reales en overworld y puzles de dungeon.
- 7 runas, 37 entradas de bestiario, 7 minibosses y 7 bosses.
- 6 side quests, 12 secretos de overworld, 27 cofres y 15 apariciones de NPC.
- 3 slots de guardado, Continue, borrado por slot y New Game+.
- Inventario de herramientas/runas/reliquias y mapa de Veyra por descubrimiento.
- Final normal, True Ending, ending dedicado y créditos.
- Audio procedural por escena con controles separados de música/efectos.
- PWA actualizada a caché `pocket-404-dx-v5.0.0-16bit`.
- Corregido clipping de A/B/C en móvil estrecho.
- Bundle regenerable mediante `tools/build_bundle.py`.
- QA de campaña, reachability, responsive, selectores, assets y seguridad renovado.

## 4.0.0 — World Edition
- Overworld expandido a 23 pantallas conectadas.
- 7 dungeons / 51 salas, 6 herramientas, 7 runas, 7 minibosses y 7 bosses.
- Side quests, secretos, mapa por descubrimiento, 3 slots y New Game+.
- Ending/créditos, True Ending y PWA con caché v4.
- Corrección de controles A/B/C en móvil estrecho.

## 3.2.0 — Rune Quest Adventure Edition
- Campaña ampliada de 15 a 25 salas.
- Nuevo mapa interactivo de Veyra con regiones desbloqueables.
- 15 familias de enemigos regionales con sprites diferenciados.
- 5 minibosses nuevos: Barkmaw, Magma Ox, Copper Owl, Glass Knight y The Nameless.
- Guardianes rediseñados y con más vida/patrones.
- Cofres funcionales, llaves regionales, fragmentos de corazón y 5 reliquias opcionales.
- 5 salas de puzle con activadores físicos y 5 memorias/NPC.
- Bestiario integrado de 25 entradas, desbloqueado por regiones.
- Lantern House convierte los shards en moneda útil con 3 mejoras permanentes.
- Quest Log, códice/lore y arco narrativo continuo de Edda, Oran y el Gran Archivo.
- 10 logros, incluyendo Five Relics y True Archivist.
- Runa Null con recuperación de emergencia en replay/postgame.
- HUD ampliado con reliquias y llaves.
- Caché PWA actualizada a `pocket-404-dx-v3.2.0`.
- Roadmap reajustado: Pipe Dash pasa a v3.3.

## 3.1.0 — 8-Bit Handheld Edition
- Rediseño visual completo inspirado en una portátil 8-bit original.
- Nueva carcasa física para el juego con cruceta y botones A/B interactivos.
- Hero/hub reconstruido con escena pixel-art CSS sin assets remotos.
- Campaña, biblioteca, logros, HUD y diálogos alineados con la nueva dirección visual.
- Escenarios Canvas enriquecidos por capítulo: bosque/ruinas, forja, clockwood, obsidiana y santuario Null.
- Sprites de héroe, enemigos, obstáculos, salida y HUD Canvas mejorados.
- Iconos PWA rehechos con estética Pocket 404.
- Cache PWA incrementada a `pocket-404-dx-v3.1.0`.

## 3.0.1 — Button / Startup Bugfix
- Sustituido el runtime ES Module por `js/bundle.js` no-module para compatibilidad con apertura directa y GitHub Pages.
- Corregido Service Worker DX: faltaban los iconos de `classic/assets/icons/`.
- Caché actualizada a `pocket-404-dx-v3.0.1` y `updateViaCache: none`.
- Corregido PAUSA durante diálogos.
- `localStorage` endurecido en DX y Classic para no bloquear el arranque.

## v3.0.0 — 8-Bit Reboot

- Nace la rama Pocket 404 DX.
- Nuevo hub 8-bit y biblioteca de remakes premium.
- Rune Quest 404 DX completo:
  - 5 capítulos.
  - 15 salas.
  - 5 jefes.
  - 5 runas.
  - combate, guardia, proyectiles, IA, partículas y progresión.
  - 6 logros y final de campaña.
  - guardado/continuar con `localStorage`.
- Nuevo render 256×144 pixel-perfect.
- Controles teclado + táctil.
- Audio 8-bit sintetizado localmente.
- Ajustes de scanlines, movimiento, contraste, sonido y volumen.
- PWA/offline propia con precache `cache: reload`.
- Namespaces de caché DX/Classic separados para evitar borrados cruzados.
- CSP estricta sin `unsafe-inline`.
- Sin backend, telemetría ni dependencias remotas.

### Release Auditor Pro pass
- Corregido fallback del enlace Home: `href="#"` → ruta relativa `./`.
- Corregida inconsistencia de roadmap `v4.x` → `v5.x`.
- Revalidada sintaxis JS, manifest, precache y estructura limpia del paquete.
