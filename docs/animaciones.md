# Intro / Hero IRP: arquitectura final

## Responsabilidades

- `HomeIntroController.tsx`: únicamente lifecycle, sesión y errores. No hay estado por cue.
- `app/(site)/layout.tsx` y `lib/home-intro-session.ts`: preflight de sesión antes de pintar la home.
- `IntroLoader.tsx`: logo visible desde el HTML inicial; referencia compartida para su único fade de salida.
- `home/HeroSection.tsx`: media plane estable, overlay/wave y UI. Una timeline GSAP para todo el reveal.
- `PremiumScrollIndicator.tsx`: progreso directo del scroll nativo, sin spring.
- `globals.css`: bloques HOME INTRO, HOME HERO BASE, HOME HERO RESPONSIVE y PREMIUM SCROLL INDICATOR.

El resto del producto conserva su sistema de animaciones.

En la primera visita de una pestaña se reproduce la intro completa. Al recargar esa
misma pestaña, el preflight detecta `irp-intro-v4` antes de pintar y muestra el hero
directamente; no enseña 1–2 segundos del poster para luego saltar. `/?intro=1`
fuerza siempre la intro completa y evita ese preflight. La decisión se sincroniza
después con React sin cambiar la coreografía del video.

## Media

Fuentes aprobadas y seleccionadas mediante `<source media>`:

- Desktop/tablet: `Garage_door_opening_transition_1080p_20260921110657.mp4`,
  1920 × 1080, 240 frames, 24 fps, 10.000 s.
- Móvil ≤767 px: `HERO MOPVIL.mp4`, 1080 × 1920, 240 frames, 24 fps,
  10.000 s.

Ambas se reproducen a 1× y comparten el mismo reloj de reveal.

Frames técnicos extraídos sin corrección, reencuadre ni reescalado:

- `garage-intro-first-frame.webp`: frame 0, WebP lossless, poster y fondo técnico inicial.
- `garage-intro-last-frame.webp`: frame 239, WebP lossless, siempre debajo del video.
- `mobile-intro-first-frame.webp` y `mobile-intro-last-frame.webp`: frames 0 y
  239 lossless de la fuente vertical, usados únicamente por el hero móvil.

Extracción reproducible:

```powershell
ffmpeg -i public/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4 -vf "select=eq(n\,0),format=rgb24" -frames:v 1 -c:v libwebp -lossless 1 -pix_fmt bgra public/NUEVO/garage-intro-first-frame.webp
ffmpeg -i public/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4 -vf "select=eq(n\,239),format=rgb24" -frames:v 1 -c:v libwebp -lossless 1 -pix_fmt bgra public/NUEVO/garage-intro-last-frame.webp
```

Validación: la decodificación RGB de cada WebP coincide píxel a píxel con un PNG
lossless del mismo frame extraído con `format=rgb24`. MD5 de los píxeles RGB:
primer frame `a5969ee98479cd26ce04f4746742ff60`;
último frame `36b57d3b4a83ac248c953d1e40e61105`.

Las capas comparten inset, dimensiones, object-fit y object-position. En móvil el
hero usa una composición vertical propia: navegación simplificada, título de cuatro
líneas, CTA ancho, beneficios inferiores y asesor grande detrás de la onda. El nodo video
permanece montado en completed. onEnded solo detiene el observador, marca la sesión
y cambia el lifecycle. No cambia src, geometría ni animación.

El fondo exterior únicamente se monta en skipped/failed. Los errores reales de carga
se detectan incluso antes de la hidratación. No existen watchdogs que abandonen el MP4.

## Timeline

El reloj usa requestVideoFrameCallback, con requestAnimationFrame como alternativa.
Solo consulta el video hasta disparar el reveal una vez; luego se cancela el muestreo.
El logo se desvanece a t=2.6 durante 850 ms, sin entrada ni movimiento.

T=0 del reveal corresponde a duration − 5 = 5.000 s del MP4.
Valores editables en HERO_TIMELINE.

| Elemento | Inicio | Duración | Propiedades |
| --- | ---: | ---: | --- |
| Overlay | 0.00 | 0.78 | Opacity |
| Wave | 0.18 | 0.86 | Opacity, y 54 → 0 |
| Header completo | 0.42 | 0.68 | Opacity, y −16 → 0 |
| Kicker + línea 1 | 0.82 | 0.82 | Opacity, y 18 → 0 |
| Línea 2 | 1.02 | 0.82 | Opacity, y 18 → 0 |
| Línea 3 | 1.22 | 0.82 | Opacity, y 18 → 0 |
| Descripción | 1.48 | 0.72 | Opacity, y 16 → 0 |
| Ambos CTA juntos | 1.82 | 0.70 | Opacity, y 16 → 0 |
| Proof | 2.12 | 0.64 | Opacity, y 12 → 0 |
| Asesor desktop | 1.52 | 1.38 / 0.82 | x 190 → 0 / opacity 0 → 1 |
| Asesor móvil/tablet ≤900px | 2.52 | 1.18 / 0.82 | x 90 → 0 / opacity 0 → 1 |

En desktop el asesor comienza un segundo antes que en móvil y termina cerca de
2.90 s del reveal. En móvil continúa como el último gesto y termina cerca de 3.70 s,
dejando la composición estable antes de acabar el video.
Ease sine.inOut; logo power1.inOut.

GSAP se inicializa dentro de gsap.context y se limpia con timeline.kill/ctx.revert.
No hay Framer Motion, CSS transitions, masks ni blur controlando estos mismos targets.
will-change se activa solo al empezar cada movimiento y se elimina al terminar.
Reduced motion conserva los mismos cues escalonados y usa fundidos de hasta 420 ms.
El asesor mantiene un recorrido reducido de 34 px para comunicar su entrada final
sin convertir toda la composición en una aparición simultánea.

## Scroll y flotantes

Scrollbar nativa oculta; sin compensación padding-right ni interceptación de input.
Indicador: track 1px, punto 10px, recorrido 168px, a 12px del borde derecho.
Progreso directo, oculto durante intro y en ≤900px.
Asistente flotante: fade únicamente a completed + 500ms.

## QA reproducible

```powershell
npm.cmd run typecheck
npm.cmd run build
$env:PORT='3100'
npm.cmd run start
# En otra terminal:
$env:SITE_URL='http://127.0.0.1:3100'
$env:AUDIT_MODE='production'
npm.cmd run loader-frame-audit
npm.cmd run platform-check
```

El auditor reproduce naturalmente (sin seeks), conserva grabaciones completas y
capturas en 1440×900, 1920×1080 y 390×844. Reporta el instante real de cada captura;
la latencia de screenshots puede desplazar su ejecución respecto de la etiqueta.
La medición de frame pacing ocurre en una pasada independiente sin capturas ni
grabación, entre video 4.7–7.5s. El resultado es diagnóstico local, no garantía
de 60fps en todos los dispositivos. El metraje fuente continúa siendo 24fps.

Evidencias: `.visual-audit/intro-gsap/{dev,production}/`.
`report.json` contiene geometría, identidad del video, opacidades, rendimiento,
reduced motion, visitas repetidas y errores. Las grabaciones terminan ≥2s después
de ended. `returning-first-paint.jpg` comprueba que el hero aparezca directo en
visitas ya vistas de esa pestaña.
