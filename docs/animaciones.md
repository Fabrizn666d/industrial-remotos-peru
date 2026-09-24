# Sistema de animaciones — Industrial Remotos Perú

## Inventario inicial

- Intro y estado de sesión: `components/HomeIntroController.tsx`.
  - `?intro=1` fuerza la reproducción.
  - En producción, `sessionStorage` con la clave `irp-intro-v4` evita repetirlo durante la misma sesión.
- Capa visual inicial: `components/IntroLoader.tsx` (logo sobre el video real, sin spinner).
- Video, fondo y contenido del hero: `components/home/HeroSection.tsx`.
- Header y navegación móvil: `components/Header.tsx`.
- Acciones flotantes: `components/FloatingActions.tsx` y componentes públicos del layout.
- Secciones principales: `components/home/*` y `components/Reveal.tsx`.
- Tokens visuales: `DESIGN_SYSTEM.md`, `tailwind.config.ts` y `app/globals.css`.

## Decisiones

- Se conserva Framer Motion como única librería para el movimiento del intro y del hero.
- No se cambia la lógica de `?intro=1`, sesión, cotizador, carrito, WhatsApp ni chatbot.
- Los colores se mantienen dentro de la paleta navy `#000A13` / azul `#1677FF` / azul claro `#6BB6FF`.
- El video existente continúa siendo la fuente real de la apertura del portón. Los defectos que pertenezcan al metraje se tratarán con capas ópticas discretas, sin sobrescribir el MP4.
- En movimiento reducido se conserva la misma cronología, eliminando los desplazamientos no esenciales.

## Tokens de movimiento

Definidos en `lib/motion.ts`:

- Entrada: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Movimiento largo: `cubic-bezier(0.65, 0, 0.35, 1)`.
- Microinteracción: `0.24 s`.
- Entrada normal: `0.8 s`.
- Entrada hero: `1.16 s`.
- Distancia scroll: `28 px`.
- Distancia hero: `48 px`.
- Stagger general: `0.08 s`; hero: `0.10 s`.
- Activación de scroll: una vez, al `20%` visible.

## Fases

- [x] Fase 1 — lectura, plan, tokens y componente de reveal reutilizable.
- [x] Fase 2 — defectos visibles del intro, título y primer pintado.
- [x] Fase 3 — coreografía del intro y opción “Saltar intro”.
- [x] Fase 4 — entrada y movimiento continuo del hero.
- [x] Fase 5 — movimiento del resto de la web.
- [x] Fase 6 — responsive, accesibilidad, rendimiento, limpieza y QA final.

## Cronología final

- El MP4 dura exactamente `10 s` y se reproduce a `1x`.
- `0–2.6 s`: el video es la única fuente visual y el logo permanece centrado.
- `2.6–3.45 s`: el logo se desvanece durante `850 ms`, sin desplazamiento de salida.
- `5 s`: comienza el reveal progresivo mientras el MP4 continúa reproduciéndose.
- `5.14–5.98 s`: navbar, asesor, kicker y las tres líneas del título entran por cues independientes.
- `6.20–6.72 s`: descripción, ambos CTA y prueba social completan la composición.
- `6.86–6.96 s`: ola y asistente cierran la secuencia; quedan cerca de tres segundos de video estable.
- `10 s`: `onEnded` marca la sesión como vista sin remontar ni reiniciar el hero.
- Con movimiento reducido se respetan los mismos cues; los presets eliminan traslaciones y escalas no esenciales.

## Correcciones de fuente

- El MP4 original se conserva intacto y `garage-door-closed-polished.png` funciona únicamente como poster del mismo elemento `<video>`.
- Los puntos blancos de las bisagras pertenecen al metraje. Se suavizan durante la fase interior con una capa óptica localizada de bajo contraste que desaparece antes del hero.
- Las líneas del título tienen `line-height` y reserva inferior propia para no recortar descendentes, comas, tildes ni eñes; el `h1` mantiene su texto completo mediante `aria-label`.
- El loader tiene poster y color base desde el HTML/CSS inicial, por lo que no depende de la hidratación para pintar el primer fotograma.

## Movimiento continuo del hero

- El fondo conserva el encuadre y respira entre escala `1` y `1.06` durante `24 s`, además del parallax vertical existente.
- El halo azul detrás del asesor cambia de opacidad cada `9 s`; el asesor flota un máximo de `4 px` y responde al puntero un máximo de `6 px` únicamente en dispositivos con mouse.
- La barra de la burbuja completa un ciclo de `6 s` y las palabras azules reciben un solo barrido de luz después de entrar.
- Los bucles se detienen cuando el hero sale del viewport o la pestaña deja de estar visible. Con movimiento reducido quedan desactivados.
- Los botones usan desplazamiento de `2 px`, presión a escala `.98`, foco visible y desplazamiento del degradado sin alterar el layout.

## Movimiento del resto del sitio

- Las secciones principales activan una sola vez al `20%` visible con fade y desplazamiento de `28 px`; las tarjetas usan una cascada de `0.08 s`.
- Las líneas decorativas se dibujan con `scaleX`, mientras títulos, galerías, proceso, soluciones y rutas de proyecto comparten los mismos tokens.
- El menú móvil escalona sus enlaces, el contador de “Mi proyecto” responde a cambios y los paneles combinan fondo gradual con desplazamiento corto.
- Las rutas públicas tienen un fade de `0.3 s`; cobertura, contacto y footer también aparecen al entrar en pantalla.
- Los hovers de tarjetas no superan `6 px`, amplían sus imágenes dentro del marco y los flotantes mantienen pulsos discretos de `9 s`.

## QA final

- `npm run typecheck`: correcto.
- `npm run build`: correcto, `52` páginas generadas.
- `npm run visual-check`: correcto en `12` viewports y todas las rutas públicas, sin overflow ni errores de consola.
- `npm run loader-frame-audit`: correcto en `1440×900` y `390×844`; el video reporta `1920×1080`, `10 s`, sin error y conserva el asesor después de `ended`.
- Comprobación específica en `768×1024` y `390×844`: título dentro del viewport, sin scroll horizontal; movimiento reducido termina en `intro-skipped` sin mantener video ni loader.
- En móvil se reduce y desplaza ligeramente el asesor para que no bloquee los CTA. En tablet el contenido tiene ancho propio y permite saltos naturales, evitando recortes de texto.
