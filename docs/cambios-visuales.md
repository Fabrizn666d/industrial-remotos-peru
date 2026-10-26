# Renovación visual premium

## Alcance protegido

Por indicación expresa, no se modificó el loader ni la coreografía del hero del Home. El trabajo comienza después de ese bloque y se extiende al resto de las rutas públicas.

## Cambios realizados

- Se actualizaron las reglas de `DESIGN_SYSTEM.md` para incorporar profundidad, degradados, luz difusa, vidrio puntual, sombras en capas y un sistema de movimiento consistente.
- Se reforzó el runtime público de entradas al hacer scroll: dirección configurable, distancia adaptable, fade, desenfoque breve, máscaras, escalonado y parallax limitado.
- Se incorporó una respuesta magnética muy leve en los botones principales de escritorio. Se desactiva en pantallas táctiles y con `prefers-reduced-motion`.
- Se estabilizó la lectura de `prefers-reduced-motion` en el contacto, el cotizador y los contadores para evitar diferencias entre el HTML inicial y la hidratación.
- Servicios y secciones del Home conservan su composición aprobada y ahora comparten la nueva respuesta de botones, focos y transiciones.
- La galería pública de Proyectos recibió profundidad real: fondo ambiental, tarjetas con bordes y sombras en capas, zoom moderado, controles de vidrio y un visor más sobrio.
- El cotizador mantiene exactamente su lógica y datos, pero mejora el tratamiento visual de la vista previa, tarjetas, opciones, imágenes, focos y navegación.
- Las imágenes editoriales seleccionadas de Nosotros y Soluciones incluyen parallax mínimo fuera del hero.
- El pie de página conserva su presentación clara original por decisión final del cliente; no participa del rediseño oscuro.
- Se añadieron estados de foco visibles, brillo en botones principales y una mezcla más suave entre secciones.

## Piezas reutilizables

- `components/PublicMotionRuntime.tsx`: orquestador único de entradas, máscaras, stagger y parallax.
- `components/motion/public-motion-config.ts`: constantes de distancia, duración, easing, blur y parallax.
- `components/motion/MagneticButtonsRuntime.tsx`: interacción magnética accesible y limitada a dispositivos con puntero preciso.
- `app/public-premium.css`: acabado visual común de las rutas públicas sin intervenir el hero.

## Librerías

No se agregó ninguna dependencia. Se reutilizaron Framer Motion y GSAP, que ya formaban parte del proyecto. No se incorporó Lenis porque el sitio ya tiene desplazamiento suave y varias escenas con ScrollTrigger; añadir otro controlador de scroll no aportaba suficiente beneficio frente al riesgo de conflicto y costo móvil.

## Decisiones de diseño

- Se priorizó un movimiento corto y editorial en celular, sin interacciones dependientes del mouse.
- El blur solo existe durante la entrada y se elimina al terminar para no mantener capas costosas.
- El parallax se limitó a imágenes editoriales concretas y queda excluido del hero.
- El glassmorphism se usa únicamente donde hay un fondo capaz de justificarlo: controles y tarjetas importantes.
- Se conservaron textos, métricas, precios, imágenes administradas, rutas y lógica comercial.

## Verificación

- TypeScript sin errores.
- Revisión visual automatizada en 1920, 1440, 1366, 1280, 1024, 768, 430, 412, 390, 375, 360 y 320 px.
- Sin overflow horizontal en las rutas públicas revisadas.
- Sin errores de consola o hidratación en la comprobación final.
- Menú móvil, cabecera flotante, asistente, cotizador y rutas públicas disponibles.

## Mejora futura sugerida

La mejora con mayor impacto posterior sería sustituir fotografías antiguas o de baja resolución por material real homogéneo, con encuadre y tratamiento de color consistentes. El sistema actual ya está preparado para recibir esas imágenes sin rediseñar los componentes.
