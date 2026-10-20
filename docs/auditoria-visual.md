# Auditoría visual previa

Fecha de revisión: 20 de octubre de 2026.

## Alcance protegido

- El loader y el hero de Home quedan fuera de este rediseño.
- Se conservan textos, datos reales, precios, rutas, SEO, APIs y funcionamiento del cotizador.

## Estado observado

- Home ya posee buenas fotografías y composiciones protagonistas, pero el nivel de profundidad cambia entre secciones: algunas tienen fondos escénicos y otras vuelven a superficies blancas planas.
- Las entradas están repartidas entre Framer Motion, GSAP y un runtime global. Las duraciones, distancias y tratamiento de desenfoque no comparten una regla única.
- Varias tarjetas reaccionan poco al cursor; imagen, borde y sombra no se coordinan como una sola pieza.
- Las páginas editoriales de soluciones y proyectos tienen revelados básicos, pero les faltan luz ambiental, parallax moderado y transiciones suaves entre escenas.
- El footer tiene buena información y jerarquía, aunque en escritorio se percibe muy claro y plano para el cierre de una experiencia premium.
- El menú móvil funciona y conserva las acciones principales, pero el movimiento y el acabado visual pueden unificarse con el resto del sitio.
- El cotizador tiene transiciones funcionales; los campos y opciones necesitan estados de foco, elevación y confirmación más consistentes sin cambiar su lógica.

## Hallazgos técnicos

- La matriz inicial no presenta desbordamiento horizontal en los anchos revisados.
- La verificación detectó diferencias de hidratación en componentes que consultan `prefers-reduced-motion` directamente durante el primer render.
- El script de verificación conservaba una clave antigua de sesión para la intro; se actualizó solo el test, sin modificar loader ni hero.
- Ya existen Framer Motion y GSAP/ScrollTrigger; no es necesario agregar otra librería pesada.

## Dirección de mejora

- Unificar entradas, escalonados, blur y reduced-motion en primitivas compartidas.
- Introducir luces ambientales y elevación por capas con límites claros para evitar una apariencia recargada.
- Mejorar hover, foco, revelado de imágenes, botones principales, footer y progreso de scroll.
- Mantener el movimiento más corto en celular y validar de 320 a 1920 px.
