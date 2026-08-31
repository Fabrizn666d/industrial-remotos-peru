# Auditoría de implementación

Fecha de corte: 2026-08-31  
Base auditada: `c1c6be4`

## Resumen ejecutivo

El repositorio es una base visual útil, no una plataforma operativa terminada. El sitio público compila y ya contiene una navegación, Home, páginas de soluciones y proyectos. Sin embargo, el flujo de cotización era una demostración ejecutada completamente en el navegador: no existían API, base de datos, autenticación, almacenamiento real de archivos ni panel administrativo.

La reconstrucción se realizará por cortes verticales verificables. El primero conecta una solicitud pública persistente con una bandeja administrativa protegida. El contenido no verificado, los precios simulados y los expedientes de ejemplo deben salir de cualquier experiencia que pueda confundirse con producción.

## Inventario encontrado

- Next.js 16, React 19, TypeScript estricto y App Router.
- Plus Jakarta Sans alojada localmente.
- Home, soluciones, detalle de solución, proyectos, contacto, configurador, Mi proyecto, finalización, confirmación y proforma.
- Datos públicos en `data/*.ts` y estado de proyecto en `localStorage`.
- 23 rutas compiladas en el control previo existente.
- Fotografías reales y recursos temporales mezclados; los temporales están identificados parcialmente.
- Sin rutas `/admin`, Route Handlers de negocio, ORM, migraciones ni autenticación.

## Hallazgos críticos

### Confianza e integridad

1. `data/products.ts` contenía importes sin fuente y `Configurator.tsx` calculaba estimados con una fórmula inventada en cliente.
2. `CheckoutExperience.tsx` generaba códigos con `Math.random`, guardaba la solicitud en `sessionStorage` y borraba el borrador sin enviarlo a ningún servidor.
3. Los adjuntos conservaban únicamente el nombre del archivo, no su contenido.
4. Confirmación y proforma recurrían a un expediente ficticio cuando faltaba la sesión local.
5. La proforma afirmaba IGV, vigencia, asesor y correo no verificados y generaba un PDF rasterizando el DOM.
6. La Home mostraba testimonios y métricas no verificadas como si fueran hechos.
7. El formulario de contacto de Home interceptaba el envío sin realizar ninguna acción.

### Producto y experiencia

1. `/productos` y `/productos/[slug]` redirigían a soluciones; no había catálogo operativo.
2. El mismo configurador de puertas se aplicaba a techos, mamparas, acero y estructuras.
3. La configuración completa no se guardaba en `QuoteItem`; editar abría un configurador nuevo y no actualizaba el ítem.
4. “¿Qué necesitas construir?” renderizaba siete tarjetas fotográficas grandes; en móvil terminaban apiladas en una sola columna y producían una página excesivamente larga.
5. `globals.css` acumuló varias generaciones de reglas para loader, header y Home. Hay selectores que se contradicen y reglas de movimiento que ignoran `prefers-reduced-motion`.
6. El menú móvil no garantiza scroll en pantallas bajas y oculta el acceso a Mi proyecto.

### Datos y contenido

1. Las taxonomías de `solutions`, `solution-pages`, navegación y `products` no comparten identificadores canónicos.
2. Teléfono, cobertura, domicilio, métricas, ubicaciones y afirmaciones comerciales no cuentan con estado `verified` ni fuente.
3. Varias especialidades reutilizan fotografías de puertas sin una procedencia explícita por activo.
4. Faltan rutas legales enlazadas desde el footer.

## Croquis entregado

La fotografía se interpreta como referencia de familias geométricas, no como fuente de reglas comerciales. Muestra combinaciones de paños verticales, composiciones apiladas, cotas globales e internas, y etiquetas manuscritas como `C`, `F`, `S60` y `Serie 80`.

No se asignará significado público a esas abreviaturas hasta recibir confirmación. El motor usará nombres internos semánticos —por ejemplo `fixed`, `sliding-left`, `sliding-right`, `swing-left`— y etiquetas visibles configurables. Las medidas se almacenarán en una unidad canónica y el diagrama se renderizará como SVG determinista; no se incrustará el croquis como imagen de producto.

## Decisiones de reconstrucción

- Separar dominio, persistencia y presentación.
- Conservar el borrador local como experiencia resiliente, dentro de un envelope versionado y validado.
- Generar códigos humanos en servidor y usar un token opaco independiente para consulta pública.
- Tratar la solicitud original como snapshot inmutable; estados, responsable, notas y cotizaciones son capas posteriores.
- El servidor no acepta importes calculados por el navegador.
- Mostrar `Precio por confirmar` hasta que existan reglas comerciales verificadas y versionadas.
- Usar PostgreSQL en producción y un adapter local explícitamente limitado al desarrollo.
- Mantener archivos privados fuera de `public/` y abstraer el almacenamiento para R2/S3.
- Diseñar el CMS como formularios tipados por dominio, no como page builder ni HTML libre.

## Orden de entrega

1. Saneamiento de contenido ficticio y reconstrucción responsive de Home.
2. Solicitud persistente, autenticación y bandeja administrativa.
3. Borrador versionado, catálogo y configurador declarativo por producto.
4. Clientes, pipeline, notas, responsables y auditoría.
5. Pricing versionado, cotizaciones, proformas inmutables y PDF de servidor.
6. Biblioteca multimedia, CMS, preview y publicación.
7. Editor de diagramas SVG basado en presets del croquis.
8. Hardening, accesibilidad, rendimiento, backups y QA 320–1920 px.

## Datos pendientes del cliente

Los datos no confirmados se enumeran en `docs/CLIENT_PENDING_DATA.md`. Hasta su validación no deben aparecer como hechos, precios, reseñas, garantías, métricas ni condiciones comerciales.
