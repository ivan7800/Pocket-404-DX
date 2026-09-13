# Balance Report — Rune Quest 404 DX v6.1.0

## Objetivo

Evitar dos extremos: bosses que desaparecen antes de mostrar sus patrones y combates convertidos en esponjas de vida. La curva se ha calculado contra una build ofensiva plausible, no contra un jugador sin mejoras.

## Resultado

- Miniboss HP: `16 / 24 / 32 / 40 / 48 / 56 / 66`.
- Guardian HP: `36 / 54 / 78 / 92 / 108 / 124 / 156`.
- TTK mínimo teórico de guardianes: entre **6.18 y 8.99 s** con 100% de uptime.
- En una partida real la duración esperada es mayor porque hay movimiento, guardia, esquiva, proyectiles, reposicionamiento y pérdida de uptime.
- Null Regent dispone de tres tramos de vida suficientes para exponer sus tres fases.

## Economía

La ruta principal sin contenido opcional financia las siete mejoras usando una prioridad razonable. Con Archive Purse comprada en capítulo III, el jugador llega al final con las siete mejoras y 48 shards de margen. Secretos y side quests permiten adelantar compras, pero no son obligatorios para mantener viable la economía.

## Arsenal

Ember Sabre era demasiado eficiente y podía eclipsar varias armas posteriores. Su cooldown pasa de `0.23` a `0.27` s. Queda como opción rápida/de burn, mientras Tide Pike conserva la ventaja de alcance y control, Prism Edge la sinergia defensiva/parry y Aether Blade el papel de arma de endgame.

## Runas

v6.1 introduce una runa activa elegible. Tener las siete ya no significa perder el acceso práctico a las anteriores. `R` activa, `T/↻` cambia y el inventario permite selección directa.

## Release gate

El cálculo y los asserts que protegen esta curva viven en `tools/release_gate_v61.mjs`. Si un cambio futuro vuelve a reducir un guardián por debajo de 6 s de TTK teórico en la build de referencia, el gate falla.
