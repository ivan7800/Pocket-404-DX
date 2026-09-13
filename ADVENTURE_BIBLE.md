# Rune Quest 404 DX — Adventure Bible v5.0

## Identidad

Veyra es un mundo donde los recuerdos pueden convertirse en infraestructura. El Gran Archivo intentó conservarlo todo y terminó convirtiendo memoria en obligación. La aventura gira alrededor de una pregunta: **¿qué merece ser recordado y quién tiene derecho a decidirlo?**

Es un homenaje espiritual al ritmo de los action-adventure de 16 bits, nunca una copia. Mundo, nombres, historia, criaturas, herramientas, arte procedural y audio son propios.

## Actos

### Acto I — El mundo olvida
Edda envía al protagonista sin nombre desde Lantern House hacia Bellwether. Moss Gate y Sunken Forge revelan que el colapso fue provocado deliberadamente.

### Acto II — Copias y ecos
Glasswater/Tideglass y Clockwood enseñan que conservar recuerdos también los deforma. El jugador obtiene herramientas que abren rutas anteriores y nuevas zonas.

### Acto III — La identidad
Obsidian Keep revela que Edda borró el nombre del protagonista para ocultarlo del Archivo. Starfall demuestra que el mundo puede existir sin ser registrado.

### Final — Null Archive
El protagonista desciende al Archivo enterrado y descubre a Oran/Null Regent: antagonista trágico que destruyó un sistema inmoral y quedó atrapado dentro de su solución. Derrotarlo no reconstruye el viejo Archivo; abre la posibilidad de uno voluntario.

## Regiones / dungeons

1. Moss Gate — vegetación, memoria, Thorn Shears, Verdant.
2. Sunken Forge — hierro y órdenes antiguas, Ember Grapple, Ember.
3. Tideglass Grotto — recuerdos devueltos por el mar, Tide Mantle, Tide.
4. Clockwood — tiempo repetido, Echo Bell, Echo.
5. Obsidian Keep — copias e identidad, Prism Lens, Prism.
6. Starfall Sanctum — lo no archivado, Sky Anchor, Aether.
7. Null Archive — silencio y consentimiento, Null.

Cada dungeon contiene combate, puzle, miniboss, herramienta o prueba de dominio, secretos/reliquias y boss. Null Archive funciona como dungeon final ampliado.

## Herramientas

- Thorn Shears: corta gates vegetales.
- Ember Grapple: cruza anclajes y pasos rotos.
- Tide Mantle: atraviesa corrientes profundas.
- Echo Bell: revela estructuras fuera de fase.
- Prism Lens: revela sellos y barreras ópticas.
- Sky Anchor: estabiliza rutas de viento y grandes vacíos.

Cada herramienta debe cumplir cuatro funciones: progreso principal, backtracking, secretos y una interacción contextual inesperada.

## Personajes

- Edda — última archivista y mentora imperfecta.
- Oran / Null Regent — antiguo custodio; antagonista trágico.
- Sile — memoria del bosque.
- Orrin — herrero que rechaza obediencia sin elección.
- Neri — guardiana de Glasswater.
- Mira — escriba atrapada alrededor del último día.
- Tamas — explorador del cielo.

## Finales

- **The Name Returns:** completar los siete dungeons y derrotar a Null Regent.
- **The Voluntary Archive:** cumplir además las condiciones opcionales de reliquias y side quests.

## Reglas de diseño

- No usar assets, nombres, mapas, música, enemigos ni objetos protegidos de otras IP.
- Ninguna ruta principal puede depender de un secreto sin pista.
- Los objetos opcionales no deben convertirse en llaves obligatorias ocultas.
- Las side quests deben reaccionar a datos persistentes del jugador.
- Prioridad: completabilidad > estabilidad > progreso > controles > guardado > gameplay > rendimiento > UX > contenido > decoración.


## v6.0 · Complete Adventure combat layer

### Arsenal
Traveler Blade → Briar Cleaver → Ember Sabre → Tide Pike → Prism Edge → Aether Blade → Nullbrand. Las armas se desbloquean con el progreso, se conservan en save schema 6 y se pueden rotar con Q, el inventario o el control táctil ARMA.

### Runes activas
Verdant/Root Pulse, Ember/Cinder Nova, Tide/Tidal Dash, Echo/Still Second, Prism/Prism Veil, Aether/Sky Cut y Null/Second Name. R activa la runa más reciente; todas mantienen sus pasivas previas.

### Combate
Ataque inmediato + carga manteniendo Z/A, combo de tres golpes por arma, parry al inicio de guardia, reflejo de proyectiles, knockback, burn, drops y Focus temporal.

### IA diferenciada
El bestiario mantiene 37 criaturas pero once enemigos normales/especiales usan patrones propios (picado, carga, emboscada, rebote, imitación, teletransporte, salto, viento, enjambre, predicción y minas).

## Sistema de runa equipada (v6.1)

Las siete runas recuperadas siguen aportando sus pasivas, pero la habilidad activa usa `equippedRune`. Se puede cambiar con T/↻ durante la partida o desde el inventario. Al recuperar una nueva runa se equipa automáticamente para que el jugador pruebe su habilidad inmediatamente.

## Curva de guardianes v6.1

La vida de minibosses y guardianes crece por capítulo para evitar victorias de pocos segundos con builds ofensivas. El release gate exige al menos 6 s de TTK teórico con 100% de uptime sobre cada guardián; en juego real, esquiva, reposicionamiento y patrones amplían esa duración.
