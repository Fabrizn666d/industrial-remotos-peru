# Industrial Remotos Perú — sistema de diseño

Referencia visual compartida para Web, Cotiza y Control.

## Principios

- Presencia arquitectónica, técnica y sobria; no apariencia de ecommerce ni SaaS genérico.
- La fotografía y el proyecto construido son protagonistas.
- Una escena principal por sección; evitar mosaicos de tarjetas equivalentes.
- Jerarquía clara, aire editorial y densidad funcional en Control.
- Movimiento breve y con propósito. `prefers-reduced-motion` siempre prevalece.

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

## Forma y elevación

- Radios funcionales: 12–18 px.
- Contenedores protagonistas: 22–30 px.
- Botones principales tipo píldora solo cuando ayudan a reconocer la acción.
- Sombras difusas, con poco contraste; los bordes separan superficies antes que la sombra.
- No usar glassmorphism como lenguaje dominante.

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
