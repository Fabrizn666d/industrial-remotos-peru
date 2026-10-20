# Industrial Remotos Perú — sistema de diseño

Referencia visual compartida para Web, Cotiza y Control.

## Principios

- Presencia arquitectónica, técnica y sobria; no apariencia de ecommerce ni SaaS genérico.
- La fotografía y el proyecto construido son protagonistas.
- Una escena principal por sección; evitar mosaicos de tarjetas equivalentes.
- Jerarquía clara, aire editorial y densidad funcional en Control.
- Movimiento editorial, fluido y con propósito. Cada escena debe ayudar a leer la jerarquía; `prefers-reduced-motion` siempre prevalece.

## Tokens base

- Navy principal: `#000A13`
- Navy de superficie: `#071A2B`
- Navy intermedio: `#0C2942`
- Azul de acción: `#1677FF`
- Azul claro: `#6BB6FF`
- Fondo claro: `#F3F7FB`
- Superficie: `#FFFFFF`
- Texto oscuro: `#000A13`
- Texto secundario: `#5E6F82`
- Verde: reservado para WhatsApp y estados positivos verificables.

## Tipografía

- Única familia: Plus Jakarta Sans, alojada localmente.
- Títulos editoriales: peso 520–620, tracking negativo moderado.
- Texto: peso 400–520, altura de línea 1.55–1.75.
- Eyebrows: 10–12 px, mayúsculas y tracking `0.10em–0.14em`.

## Profundidad, forma y elevación

- Radios funcionales: 12–18 px.
- Contenedores protagonistas: 22–30 px.
- Botones principales tipo píldora solo cuando ayudan a reconocer la acción.
- Combinar bordes finos con sombras en dos capas: una cercana para separar y otra amplia, azulada y de baja opacidad para dar profundidad.
- Las secciones extensas pueden usar degradados suaves entre navy, azul intermedio, azul de acción y fondos marfil; evitar grandes superficies visualmente planas.
- Se permiten hasta tres luces difusas de baja opacidad por escena. Deben permanecer detrás del contenido y nunca reducir el contraste.
- El vidrio esmerilado se reserva para navegación, controles o tarjetas puntuales sobre fotografía o color. No se aplica indiscriminadamente.
- En fondos oscuros puede existir una textura o grano casi imperceptible para evitar una apariencia digital plana.
- Las transiciones entre secciones usan degradados, velos o formas suaves; no dependen de franjas vacías ni cortes abruptos.

## Sistema de movimiento

- Entrada estándar: `520–720 ms`, curva `[0.16, 1, 0.3, 1]`, opacidad `0 → 1`, desenfoque máximo de `8 px` y recorrido de `24–48 px`.
- En móvil: recorridos de `14–24 px`, duraciones de `420–560 ms` y sin efectos que dependan del cursor.
- Grupos: escalonado de `60–90 ms`; no retrasar más de seis elementos ni bloquear contenido esencial.
- Títulos protagonistas pueden revelarse por línea o palabra. Cuerpo, formularios y datos legales aparecen como bloques completos para conservar legibilidad.
- Parallax: desplazamiento máximo de `12–28 px` y solo en imágenes o decoración. Nunca altera el flujo ni la posición accesible del contenido.
- Hover en escritorio: elevación de `2–6 px`, escala máxima `1.015` y sombra progresiva. No usar rebotes, giros o zoom agresivo.
- Animar principalmente `transform` y `opacity`. El blur se usa solo durante entradas breves; no animar dimensiones ni márgenes.
- Cada animación de scroll se ejecuta una vez salvo carruseles o indicadores que expresen progreso real.
- `prefers-reduced-motion: reduce` elimina recorridos, parallax, flotación, scroll suave y bucles decorativos; conserva fundidos breves de hasta `180 ms`.
- Loader y hero mantienen su coreografía aprobada y no se mezclan con el runtime general de movimiento.

## Composición responsive

- Diseñar explícitamente 320, 360, 375, 390, 430, 768, 1024, 1280, 1440 y 1920 px.
- Móvil no es una reducción del escritorio: reorganizar controles, evitar alturas fijas y preservar el CTA.
- Ningún carrusel horizontal puede ocultar la única vía de acceso a contenido o acciones.
- Respetar `env(safe-area-inset-*)` en elementos fijos.

## Reglas de confianza

- No publicar precios, métricas, testimonios, garantías, certificaciones ni datos legales sin verificación.
- Los estimados no confirmados se presentan como `Precio por confirmar`.
- Activos temporales deben llevar procedencia/estado en datos; no se describen como obra real.
- El configurador no se denomina 3D si la representación es 2D.
- Los estados vacíos explican qué falta y qué acción puede realizarse.

## Superficies

- Web pública: editorial, visual y orientada a descubrir soluciones y evidencia.
- Cotiza: visual dominante, configuración progresiva y resumen persistente.
- Control: navegación compacta, tablas y formularios densos, trazabilidad visible y confirmación para operaciones irreversibles.
