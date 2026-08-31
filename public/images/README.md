# Biblioteca visual

## Fotografias reales

`reales/` contiene las fotografias entregadas por Industrial Remotos Peru:

- `puerta-01.jpg` a `puerta-41.jpg`: registros cuadrados de proyectos.
- `portada-puerta-seccional.jpg`: portada horizontal usada en el hero.

Las fotografias cuadradas se muestran en contenedores de hasta 280 px para no
forzar su resolucion. Los nombres utilizados por cada producto y proyecto estan
definidos en `data/products.ts` y `data/projects.ts`.

## Ilustraciones

Las vistas grandes de producto se generan como SVG desde
`components/DoorIllustration.tsx`. Estas piezas funcionan como referencias
visuales premium y siempre incluyen la etiqueta `Referencia ilustrativa`.

## Activos anteriores

Los JPG ubicados directamente en `public/images/` se conservan por compatibilidad
con la estructura original, pero las secciones principales ya usan la biblioteca
real y las ilustraciones SVG.
