# Arkdle

Arkdle es un juego web de adivinanza inspirado en títulos como *Loldle*, ambientado en el universo de **ARK: Survival Evolved**. El proyecto fue creado como un regalo de cumpleaños, pero también como un proyecto personal serio enfocado en aplicar buenas prácticas de desarrollo web.

El juego es completamente jugable desde el navegador y fue desplegado con **Vercel**, lo que permite jugarlo fácilmente tanto desde dispositivos móviles como de escritorio.

---

## Juego y modos

Arkdle cuenta con **cuatro modos de juego**, cada uno con mecánicas propias:

### Dinosaurio

El objetivo es encontrar un dinosaurio oculto realizando intentos con otros dinosaurios. En cada intento, el juego compara distintos atributos entre el dinosaurio ingresado y el objetivo, mostrando feedback visual que indica qué tan cerca está la respuesta.

A medida que se realizan intentos fallidos, se van desbloqueando pistas adicionales para ayudar al jugador a llegar a la respuesta correcta.

### Mapa

Se muestra una imagen de una ubicación del mundo de ARK. Primero, el jugador debe identificar a qué mapa pertenece dicha ubicación. Una vez seleccionado el mapa correcto, debe marcar sobre él la posición aproximada donde se encuentra esa zona.

Este modo incluye actualmente **80 ubicaciones seleccionadas manualmente** a lo largo de distintos mapas del juego.

### Criatura

En este modo se presenta la **silueta en negro** de un dinosaurio. La imagen comienza rotada y con zoom para aumentar la dificultad.

Desde los ajustes es posible:

* Desactivar la rotación
* Habilitar o deshabilitar el zoom progresivo, el cual se va reduciendo con cada intento fallido para mostrar mejor la forma del dinosaurio

### Montura

Similar al modo Criatura, pero en lugar de una silueta se muestra una imagen a color de la montura. El objetivo es identificar a qué dinosaurio pertenece dicha montura.

---

## Mecánicas generales

* No existe una condición estricta de victoria o derrota.
* El desafío consiste en encontrar la respuesta correcta en la **menor cantidad de intentos posible**.
* En los modos Dinosaurio, Criatura y Montura, el jugador escribe el nombre y recibe **sugerencias automáticas** que pueden seleccionarse con el mouse o mediante el teclado (flechas y Enter).
* En el modo Mapa, se selecciona el mapa desde una lista y luego se interactúa directamente con la imagen.

---

## Modo diario y modo aleatorio

Cada modo puede jugarse en:

* **Modo diario**: el objetivo cambia cada día y es el mismo para todos los jugadores. Cada modo genera su propio objetivo diario a partir de una semilla basada en la fecha, modificada internamente para que el resultado sea distinto en cada modo.
* **Modo aleatorio**: el objetivo se elige de forma aleatoria en cada partida.

---

## Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript (ES Modules)
* JSON para el almacenamiento de datos del juego
* Imágenes en formato WebP para optimizar el rendimiento
* Vercel para despliegue y hosting

---

## Diseño responsive

El juego fue diseñado para ser **totalmente responsive**, permitiendo una experiencia cómoda tanto en computadoras como en dispositivos móviles.

---

## Motivación

Arkdle nació como un regalo de cumpleaños para una persona con quien comparto el interés por ARK, pero también como una oportunidad para desarrollar un proyecto web completo y publicarlo en línea.

El objetivo fue crear algo accesible, funcional y entretenido, que pudiera jugarse desde cualquier lugar.

---

## Posibles mejoras futuras

Aunque el proyecto se considera terminado, existen ideas que podrían explorarse a futuro:

* Modos de juego por tiempo (por ejemplo, modo Flash)
* Incorporación de nuevos dinosaurios de **ARK: Survival Ascended**
* Actualización de mapas reworkeados
* Ampliación del número de ubicaciones disponibles

---

## Estado del proyecto

Proyecto finalizado, funcional y abierto a mejoras futuras. Pensado como proyecto personal y parte de un portafolio de desarrollo web.
