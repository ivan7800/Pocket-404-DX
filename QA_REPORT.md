# QA Report — Pocket 404 DX v6.1.0 · Complete Adventure Edition

## Estado final

**PUBLICABLE CON LIMITACIONES**

La v6.1.0 corrige un bloqueante real de arranque descubierto durante la regresión final, reequilibra la campaña completa y añade una selección de runa activa persistente. El proyecto supera el release gate estructural, un autoplay de las 51 salas y una regresión funcional real en Chromium mediante inyección inline del HTML/CSS/JS. La navegación por URL del navegador del entorno está bloqueada administrativamente, por lo que la instalación PWA sobre HTTPS/GitHub Pages y la prueba física en iPhone/Android siguen pendientes.

## Bloqueante encontrado y corregido

### [REL-001] `bundle.js` podía contener sintaxis ESM inválida

- **Severidad:** CRÍTICA
- **Estado:** CORREGIDO
- **Archivo:** `tools/build_bundle.py`, `js/bundle.js`
- **Evidencia:** `engine.js` declara `export class RuneQuestEngine` con indentación. El generador antiguo solo eliminaba `export` al principio exacto de la línea, por lo que podía dejar `export class RuneQuestEngine` dentro de `bundle.js`.
- **Impacto:** `index.html` carga `bundle.js` como script clásico; un `export` superviviente provoca `Unexpected token 'export'` y bloquea el arranque completo.
- **Corrección:** la expresión regular del bundler ahora conserva la indentación y elimina `export` con o sin espacios iniciales.
- **Verificación:** `grep` confirma cero `import/export` de nivel superior en el bundle; Chromium ejecuta el bundle y renderiza las 4 fichas del hub sin errores.

## Balance final v6.1

### Minibosses

| Capítulo | Miniboss | HP |
|---|---|---:|
| I | Barkmaw | 16 |
| II | Magma Ox | 24 |
| III | Kelp Maw | 32 |
| IV | Copper Owl | 40 |
| V | Glass Knight | 48 |
| VI | Rocling | 56 |
| VII | Forgotten Scribe | 66 |

### Guardianes

| Capítulo | Guardián | HP | Arma de referencia | TTK mínimo teórico* |
|---|---|---:|---|---:|
| I | Bramble Heart | 36 | Traveler Blade | 7.56 s |
| II | Forge Keeper | 54 | Briar Cleaver | 7.02 s |
| III | Abyss Ray | 78 | Ember Sabre | 6.18 s |
| IV | Clock Stag | 92 | Ember Sabre | 7.29 s |
| V | Obsidian Warden | 108 | Ember Sabre | 8.55 s |
| VI | Astral Ram | 124 | Prism Edge | 8.63 s |
| VII | Null Regent | 156 | Aether Blade | 8.99 s |

\* TTK calculado con 100% de uptime cuerpo a cuerpo y una progresión ofensiva razonable. Es un límite inferior deliberadamente irreal: en juego real la esquiva, el reposicionamiento y los patrones de proyectiles alargan los combates.

### Armas

- Ember Sabre: cooldown ajustado de `0.23` a `0.27` s para evitar que domine Tide Pike y Prism Edge durante casi todo el midgame.
- Las 7 armas siguen teniendo nichos diferenciados por alcance, anchura, combo, knockback, velocidad y carga.
- El arsenal se puede ciclar con `Q` y equipar desde el inventario.

### Runas

- Nuevo `equippedRune` persistente.
- `R` activa la habilidad equipada.
- `T` o `↻` cambia de runa durante la partida.
- También puede elegirse directamente desde el inventario.
- Al recuperar una runa nueva se equipa automáticamente para que el jugador pruebe la habilidad recién obtenida.
- Save schema actualizado a 6; partidas v5 migran asignando como runa equipada la última recuperada.

### Guardia / parry

Se ha endurecido la entrada de guardia para que el `keydown` repetido de `X` no pueda refrescar indefinidamente la ventana de parry perfecto. La prueba automatizada confirma que el parry real sigue reflejando proyectiles e incrementando el contador.

## Economía de ruta principal

El release gate simula una ruta sin secretos, side quests ni cofres opcionales. Con una prioridad de mejoras razonable, se puede comprar una mejora por capítulo:

| Capítulo | Ingreso principal | Mejora comprada | Saldo |
|---|---:|---|---:|
| I | 36 | Tempered Edge | 2 |
| II | 36 | Swift Thread | 8 |
| III | 36 | Archive Purse | 12 |
| IV | 47 | Pocket Vessel | 33 |
| V | 47 | Prism Guard Core | 42 |
| VI | 47 | Rune Capacitor | 45 |
| VII | 51 | Charged Edge | 48 |

Resultado: las 7 mejoras son comprables sin exigir contenido opcional y queda margen final. Secretos y side quests actúan como aceleradores, no como requisito para que la economía funcione.

## Pruebas ejecutadas

### Sintaxis y bundle

- `node --check js/data.js` — **PASS**
- `node --check js/engine.js` — **PASS**
- `node --check js/audio.js` — **PASS**
- `node --check js/save.js` — **PASS**
- `node --check js/app.js` — **PASS**
- `node --check js/bundle.js` — **PASS**
- `node --check sw.js` — **PASS**
- Bundle clásico sin `import`/`export` superviviente — **PASS**

### Release gate v6.1

`node tools/release_gate_v61.mjs` — **PASS**

Comprueba:

- versión 6.1.0 / schema 6;
- 7 dungeons / 51 salas;
- 7 armas / 7 runas / 37 bestiario;
- migración de save v5 → v6;
- round-trip real `saveSlot()` → `loadSlot()` con `localStorage` simulado y conservación de `equippedRune`;
- runa equipada y cambio de runa;
- protección contra key-repeat de parry;
- parry perfecto y reflexión de proyectil;
- economía capítulo a capítulo;
- TTK mínimo de los siete guardianes;
- progresión creciente de miniboss/guardian HP;
- autoplay estructural de **las 51 salas** con carga, enemigos, puzzles/tool gates, cofres, herramientas, runas, armas y bosses;
- campaña completa, 7 runas, 7 armas, ending y créditos;
- condición estructural de True Ending;
- vecinos/portales de overworld;
- IDs de DOM usados por `app.js`;
- assets declarados por Service Worker.

### Chromium funcional

`python tools/browser_e2e_inline.py` — **PASS**

La prueba usa Chromium real, pero carga los recursos inline porque el entorno bloquea navegación por URL. Verificado:

- boot de aplicación;
- 4 tarjetas del hub;
- nueva partida;
- entrada en vista de juego;
- movimiento por teclado;
- guardia `X` y protección anti-repeat;
- pausa/reanudación;
- mapa y cierre de diálogo;
- cambio de arma;
- cambio de runa con botón `↻` y teclado `T`;
- activación de habilidad con `R`/botón;
- equipar runa y arma desde inventario;
- callback del final verdadero y llegada a la pantalla `The Voluntary Archive`;
- postgame;
- viewport móvil 390×844;
- controles ARMA/RUNA/↻ visibles;
- cero overflow horizontal;
- **0 errores JavaScript de consola/pageerror**.

Capturas de regresión incluidas: `QA_V61_DESKTOP.png` y `QA_V61_MOBILE.png`.

### Servidor HTTP local

Respuestas **200 OK** verificadas para:

- `index.html`
- `js/bundle.js?v=6.1.0`
- `css/app.css?v=6.1.0`
- `manifest.webmanifest?v=6.1.0`
- `sw.js`
- `assets/icons/icon-192.png`

## Funciones importantes

| Función | Estado |
|---|---|
| Campaña 7 dungeons / 51 salas | REAL / AUTOPLAY VERIFICADO |
| 7 armas | REAL |
| 7 runas activas seleccionables | REAL |
| Ataque / carga / combo | REAL |
| Guardia / parry / reflexión | REAL |
| IA diferenciada | REAL |
| Bosses y fases | REAL / BALANCE ESTÁTICO VERIFICADO |
| Herramientas y gates | REAL |
| Side quests | REAL por implementación; no se ha hecho una partida humana completa de cada una |
| Final normal / True Ending / créditos | REAL / CALLBACK E2E VERIFICADO |
| Save migration v5→v6 | REAL |
| NG+ | REAL por implementación y regresión estructural |
| GitHub Pages | COMPATIBLE POR ESTRUCTURA; despliegue público v6.1 pendiente |
| PWA offline | ESTRUCTURA VERIFICADA; instalación HTTPS real pendiente |

## Riesgos / limitaciones pendientes

1. No se ha realizado una partida **humana** de varias horas 0→créditos; el autoplay y el balance matemático no sustituyen la sensación real de dificultad.
2. El entorno bloquea la navegación de Chromium por URL, por lo que el Service Worker no puede validarse aquí como instalación PWA real sobre HTTPS.
3. Falta una regresión física en iPhone/Android de los nuevos controles de runa y de sesiones largas táctiles.
4. GitHub Pages debe comprobarse después de subir esta build concreta para confirmar la transición de caché desde v6.0/v5.x.

## Puntuación

- Producto: 9.5
- Arquitectura: 9.3
- Código: 9.3
- UX/UI: 9.5
- Móvil: 9.2
- QA: 9.4
- Seguridad/privacidad: 9.5
- Rendimiento: 9.4
- Accesibilidad: 9.1
- PWA: 9.0
- Mantenibilidad: 9.2
- Documentación: 9.5
- Preparación de release: 9.4

**Puntuación global prudente: 9.4/10.**

No se eleva a 9.5+ hasta completar una partida humana larga y una instalación/actualización PWA real en GitHub Pages o un origen HTTPS equivalente.

## Veredicto

**PUBLICABLE CON LIMITACIONES.**

La v6.1.0 sí puede publicarse como juego web. El bloqueante de bundle está corregido y las rutas críticas tienen evidencia automatizada y de navegador. Las limitaciones pendientes son de validación final en condiciones reales, no bloqueos conocidos del código.
