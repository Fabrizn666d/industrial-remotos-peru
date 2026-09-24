# Sistema de animaciones — Industrial Remotos Perú

## Inventario inicial

- Intro y estado de sesión: `components/HomeIntroController.tsx`.
  - `?intro=1` fuerza la reproducción.
  - En producción, `sessionStorage` con la clave `irp-intro-v4` evita repetirlo durante la misma sesión.
- Capa visual inicial: `components/IntroLoader.tsx` y `components/Loader.tsx`.
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
- En movimiento reducido se conservan únicamente fades cortos.

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
- [ ] Fase 2 — defectos visibles del intro, título y primer pintado.
- [ ] Fase 3 — coreografía del intro y opción “Saltar intro”.
- [ ] Fase 4 — entrada y movimiento continuo del hero.
- [ ] Fase 5 — movimiento del resto de la web.
- [ ] Fase 6 — responsive, accesibilidad, rendimiento, limpieza y QA final.

## Cronología final

Se completará al terminar la Fase 6 con tiempos medidos sobre el MP4 real.
