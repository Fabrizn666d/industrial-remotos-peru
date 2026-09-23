PROMPT FINAL DE CIERRE — INDUSTRIAL REMOTOS PERÚ

Fase visual premium + limpieza + integración + QA estricto

Trabaja sobre el estado ACTUAL de main.

No quiero otra expansión de alcance.
No quiero seguir agregando funciones por agregar.

La plataforma ya tiene Home, portales de servicios, IRP Asistente, cotizador, Mi Proyecto, checkout, solicitudes, proyectos, Libro de Reclamaciones, cookies, analytics, SEO y admin.

Ahora quiero una FASE DE CIERRE Y PULIDO REAL.

La prioridad absoluta es:

FRONTEND PREMIUM

LOADER + HERO

ANIMACIONES / TIMINGS

CONSISTENCIA VISUAL

RESPONSIVE

LIMPIEZA DE CÓDIGO Y REPO

QA REAL

CORREGIR BUGS FUNCIONALES DETECTADOS

NO quiero que el resultado se vea como:

plantilla genérica

SaaS

web hecha rápidamente con IA

secciones pegadas

animaciones por defecto

Framer Motion básico sin dirección artística

“fadeUp” repetido en todo

Quiero que se sienta como una empresa seria de arquitectura, fabricación e instalación, con lenguaje visual premium, moderno y técnico.

1. REGLA PRINCIPAL

Antes de tocar código:

revisa el estado actual

abre la Home completa

abre los 8 portales de servicio

abre Proyectos

abre un proyecto individual

abre IRP

abre Cotizador

abre Mi Proyecto

abre Contacto

abre Footer

revisa desktop y mobile

No optimices a ciegas.
Trabaja mirando el resultado real.

2. NO AGREGAR MÁS FUNCIONALIDADES GRANDES

No quiero:

dark mode nuevo

chat nuevo

sistema nuevo

CMS nuevo

librerías nuevas

nuevas páginas que no sean necesarias

más features experimentales

Solo completar/pulir lo existente.

3. LOADER CINEMATOGRÁFICO — PRIORIDAD MÁXIMA

Actualmente funciona mejor técnicamente, pero visualmente todavía NO se siente premium.

Quiero una secuencia realmente cinematográfica.

Estado actual que debe conservarse

video a 1x

logo NO viaja a navbar

intro solo una vez por sesión

Hero se revela al final

fallback si falla video

Nueva dirección visual

Inicio

Durante los primeros instantes:

fondo del video totalmente visible

logo centrado

logo limpio

sin caja

sin borde

sin tarjeta

sin glow exagerado

sin bounce

Logo:

entrada extremadamente suave

opacity 0 → 1

scale .985 → 1

blur muy pequeño

duración aprox. 700–900ms

No usar scale(.94).
Usar algo mucho más fino: scale(.985).

Fade del logo

El logo debe comenzar a desaparecer cuando la puerta ya está claramente moviéndose.

No hacer que desaparezca demasiado pronto.

Ajustar mirando el video REAL.

Debe sentirse:
logo presente
→ puerta empieza
→ logo se desvanece naturalmente
→ queda solo el movimiento del garaje

Fade:
aprox. 800–1100ms.

Sin movimiento de posición.

4. TRANSICIÓN VIDEO → HERO

NO quiero:
video
→ corte
→ de golpe fondo oscuro
→ de golpe textos

Quiero:
video termina
→ la escena permanece visualmente estable
→ entra suavemente el overlay izquierdo
→ aparece navbar
→ entra trabajador
→ entra contenido

La imagen final debe parecer el mismo frame del video.

Evitar flashes de:

negro

blanco

background image distinta

cambio abrupto de saturación

cambio abrupto de zoom

5. ORDEN EXACTO DE APARICIÓN HERO

Usar una timeline coherente.

Después del final del video:

T + 0ms

Se mantiene exterior.

T + 80ms

Comienza degradado izquierdo.

T + 160ms

Navbar:

logo

enlaces

acciones

Navbar no debe caer desde -48px con blur excesivo.
Usar:

y: -12 → 0

opacity

blur máximo 3–4px

T + 250ms

Trabajador comienza a entrar.

Trabajador:

desde derecha

desplazamiento máximo 60–100px

no 280px

no clipPath inset(100%)

no blur de 14px

Usar:

opacity 0 → 1

x 70 → 0

scale .99 → 1

duración 900–1200ms

ease [0.16,1,0.3,1]

T + 300ms

Kicker.

T + 420ms

Línea 1.

T + 560ms

Línea 2.

T + 700ms

Línea 3.

T + 900ms

Descripción.

T + 1080ms

Botones.

T + 1250ms

Proof points.

Toda la revelación después del video:
aprox. 1.2–1.6s.

NO 2.5s.
NO sensación lenta.

6. ANIMACIONES HERO

Eliminar sensación “televisiva”.

No usar:

blur 14px

x 280px

clip-path exagerado

stagger de 200–300ms por cada línea

delays acumulados de casi 2 segundos

grandes movimientos

El usuario debe sentir fluidez, no notar “la animación”.

7. TRABAJADOR DEL HERO — BUG CRÍTICO

Actualmente el JSX lo convirtió en <a href="/asistente">.

Pero CSS todavía contiene:
pointer-events: none

en .irp-hero__advisor.

CORREGIR.

Debe ser:
pointer-events: auto

cuando esté visible.

Estados:

hover: máximo translateY(-2px) o un pequeño brillo

focus-visible

cursor pointer

click funcional hacia /asistente

No transformar la figura en un botón visual.

8. OVERLAY DEL HERO

Mantener solo izquierda.

Ajustar después de mirar captura real.

Referencia aproximada:

linear-gradient(
  90deg,
  rgba(4,16,34,.86) 0%,
  rgba(4,16,34,.76) 22%,
  rgba(4,16,34,.58) 34%,
  rgba(4,16,34,.28) 45%,
  rgba(4,16,34,.08) 54%,
  rgba(4,16,34,0) 61%
)

Pero ajustar según captura real.

9. NAVBAR PREMIUM

Revisar visualmente.

Quiero:

muy limpia

compacta

elegante

navegación respirada

logo con tamaño correcto

CTA principal visible

nada enorme

navbar transparente al inicio

al scroll fondo navy con blur muy moderado

No usar blur excesivo.

Hover:

pequeña línea

cambio de opacidad

transición elegante

10. HOME — HACER QUE PAREZCA UNA SOLA EXPERIENCIA

Recorrer toda la Home.

Cada sección debe conectar con la siguiente.

NO debe sentirse:
[diapositiva]
[diapositiva]
[diapositiva]

Evitar cortes secos de:

blanco

imagen

blanco

navy

blanco

Usar:

curvas sutiles

degradados

continuidad de fondo

elementos arquitectónicos

overlays

respiración

Pero sin crear franjas gigantes.

11. “¿QUÉ NECESITAS CONSTRUIR?”

Conservar el concepto visual de los seis servicios principales:

Puertas automáticas / garaje

Baranda / acero inoxidable

Mamparas y ventanas

Techo sol y sombra

Cerco eléctrico

Drywall

NO romper la composición aprobada de seis.

Pero también necesito que:

Puertas principales

Estructuras metálicas

sean fáciles de encontrar.

Solución recomendada:
debajo de los 6 principales, antes del CTA general, agregar dos accesos secundarios compactos y elegantes:

Puertas principales

Estructuras metálicas

No círculos gigantes adicionales.
No romper la fila de 6.

Pueden ser dos tarjetas horizontales pequeñas / links editoriales.

12. BANDA SUPERIOR DE BENEFICIOS

Actualmente:

Orientación técnica

Proyecto a medida

Solución integrada

Acompañamiento

Está mejor.

Pulir:

iconos

alineación

spacing

contraste

Debe sentirse como proof/trust strip, no como otro proceso.

13. PROYECTOS EN HOME

Revisar visualmente la sección.

Debe:

sentirse fotográfica

dar protagonismo a la imagen

menos texto

buen balance

hover fino

evitar cards SaaS

No poner sombras enormes.

La transición desde la sección anterior debe ser suave.

14. PROYECTOS — DETALLE INDIVIDUAL

Actualmente /proyectos/[slug] es demasiado básico.

Completarlo.

Estructura:

Hero

breadcrumb

badge

título

breve descripción

ubicación general

CTA relacionado

imagen principal grande

Galería

Si el proyecto solo tiene una imagen real:

NO inventar más

no repetir la misma 6 veces

Si hay varias:

galería premium

lightbox

swipe mobile

Información

solución aplicada

tipo de proyecto

ubicación general

descripción

Servicio relacionado

CTA hacia portal correspondiente.

Otros proyectos

2–3 relacionados si existen.

NO publicar dirección exacta.

15. PORTALES DE SERVICIO — ESTRUCTURA YA APROBADA

NO rehacer la estructura.

Mantener:

Hero
→ explicación
→ carrusel izquierda
→ carrusel derecha
→ opciones
→ mini cotizador
→ proceso
→ FAQ
→ CTA final

Ahora quiero PULIDO VISUAL.

16. HERO DE CADA SERVICIO

Mejorar visual:

imagen más protagonista

mejor relación imagen/texto

reducir sensación de “card”

títulos grandes pero no excesivos

breadcrumbs más finos

badges de confianza más discretos

CTA con jerarquía clara

Desktop:
aprox. 55% imagen / 45% copy.

Mobile:
copy
→ CTA
→ imagen.

17. CARRUSELES INFINITOS — HACERLOS PREMIUM

Carrusel superior

Dirección izquierda.

Cards:

420–520px desktop

más horizontales

borde 20–24px

fotografía protagonista

caption muy limpio

Carrusel inferior

Dirección derecha.

Cards:

260–340px

detalles/acabados

Velocidad

Superior:
aprox. 50–65s por ciclo.

Inferior:
aprox. 45–60s.

Drag

Actualmente se modifica scrollLeft mientras el track tiene transform CSS animado.

Revisar que esto realmente se sienta natural.

Si genera resistencia o saltos:

pausar animation durante pointerdown

convertir posición de drag a offset del track

reanudar suavemente

no hacer snap duro

Touch:
no bloquear scroll vertical.

18. CARRUSELES CON POCAS IMÁGENES

Ahora algunos servicios usan la misma imagen 3 veces.

Eso se ve barato.

Si un servicio solo tiene una imagen válida:

no mostrar 6 copias iguales

usar una composición diferente

duplicar solo internamente para loop, pero no mostrar captions que hagan parecer que son obras distintas

Ideal:
marcar la galería como “Referencias visuales”.

19. MINI COTIZADORES

La funcionalidad está bien.

Pulir visualmente.

Quiero:

sensación de configurador

no formulario genérico

labels claros

inputs premium

preview grande

pequeña actualización visual en vivo

“Precio por confirmar”

CTA claro

En desktop:
2 columnas.

Mobile:
preview arriba o abajo, según mejor UX.

20. MINI CONFIGURADOR — DATOS

Actualmente campos no estándar terminan concatenados en notes.

No es urgente rehacer todo backend.

Pero mejorar:

preservar valores claramente

resumen legible

no perder ubicación/cerradura/etc.

si es sencillo, añadir customFields dentro de configuration de forma compatible

NO romper contratos existentes.

21. COTIZADOR PRINCIPAL

No rediseñar desde cero.

Revisar visualmente:

sidebar / pasos

preview

campos

swatches

resumen inferior

mobile

Debe sentirse más “producto industrial/configurador” y menos “formulario wizard”.

No usar glassmorphism excesivo.

22. IRP ASISTENTE

Funcionalmente está mucho mejor.

Pulir:

presentación

progresión

mensajes

quick replies

mobile

transiciones

No hacerlo parecer ChatGPT.

Debe sentirse como orientador técnico de Industrial Remotos.

23. HOME: IRP + COTIZADOR

La sección “¿Cómo quieres avanzar?” debe tener mucha claridad.

Dos caminos:

IRP Asistente

Cotizador inteligente

No repetir servicios.
No saturar de elementos.

24. SOLUCIONES INTEGRADAS EN LA CASA

Mantener.

Pero corregir:
la descripción de Puertas todavía mezcla “puertas de garaje + puertas principales”.

Ahora ya existe portal de Puertas principales.

Actualizar copy:
Puertas automáticas:
solo garage/acceso vehicular/automatización.

Agregar un hotspot secundario pequeño para:
Puerta principal

que lleve a:
/soluciones/puertas-principales

No mezclar ambas.

25. TRANSICIONES ENTRE SECCIONES

Revisar:

Hero → Needs

Needs → Projects

Projects → Process

Process → Integrated Solutions

Integrated → Project Path

Project Path → Coverage

Coverage → Contact/Footer

No crear componentes “TransitionSection”.

Resolver dentro de secciones:

pseudo-elements

ondas

fondos

overlaps pequeños

Máximo overlap razonable:
20–60px.

26. TIPOGRAFÍA

Evitar:

títulos enormes de 4.5rem cuando la composición no lo soporta

letter-spacing exagerado

font-weight demasiado alto

párrafos demasiado pequeños

Desktop:
texto base 15–17px.

Mobile:
mínimo práctico 14–16px para cuerpo.

No usar font-size: 9px salvo eyebrow muy puntual.

27. BOTONES

Unificar.

Primario:
azul.

Secundario:
outline/white/glass según fondo.

Hover:

translateY(-1px)

arrow +3px

ligera sombra

No escalar 1.05.

28. CARDS

Eliminar look genérico.

No todo debe:

tener borde

tener shadow

tener radius 28px

flotar

Alternar:

layouts editoriales

imágenes sin card

líneas

fondos

composiciones abiertas

29. COLORES

No abusar del navy.

La página debe respirar.

Aproximación:
60–70% claro
20–30% fotografía
10–15% navy/azul fuerte

30. RESPONSIVE

Hacer una revisión visual REAL.

Capturas:

1920×1080

1440×900

1366×768

1280×800

1024×768

768×1024

430×932

412×915

390×844

375×812

360×800

320×720

No pasar simplemente tests DOM.

MIRAR capturas.

Revisar:

espacios muertos

overflow

texto cortado

worker

carruseles

footer

cards

navbar

botones

modales

31. MOBILE HERO

Especial atención.

No intentar copiar desktop.

Mobile:

fondo correctamente encuadrado

texto legible

botones full/semifull

trabajador reducido

no tapar textos

no tapar CTA

onda inferior limpia

32. FOOTER

Revisar contraste.

Debe ser:

claro

elegante

compacto

5 bloques desktop

legible

background arquitectónico visible pero discreto

Mobile:
no debe sentirse interminable.

33. LIMPIEZA DEL REPO

ELIMINAR:

SUPER_PROMPT_CODEX_IRP_SERVICIOS_PORTALES_COTIZADOR.md

app/SUPER_PROMPT_CODEX_IRP_SERVICIOS_PORTALES_COTIZADOR.md

El prompt NO debe formar parte de producción.

Revisar:

.artifacts/

screenshots

PDFs QA

archivos temporales

public/fotos-reales-industrial-remotos.zip

Si no son necesarios en runtime:

sacar de public

agregar a .gitignore

agregar a .dockerignore

no incluir en .next/standalone

NO borrar fotos reales necesarias.

34. LIMPIEZA CSS

Hay muchas reglas antiguas de Hero/Loader.

Consolidar.

No quiero:

dos definiciones contradictorias de .irp-hero__cinema

varias definiciones de .irp-hero__advisor

overrides escondidos cientos de líneas después

estilos legacy sin uso

Especialmente revisar:

loader

Hero

Home

solution detail

Mover a CSS Modules cuando sea práctico.

Pero NO hacer migración masiva que arriesgue romper diseño.

35. globals.css

Reducir deuda.

No hace falta eliminar miles de líneas.

Pero:

eliminar reglas muertas confirmadas

unir duplicados

documentar secciones

evitar seguir agregando hacks

36. IMÁGENES

No distorsionar.

Usar:

cover

contain

Nunca:
object-fit: fill

No zoom permanente.

37. PROYECTOS REALES VS REFERENCIA

Mantener verifiedReal.

Si es referencia:

“Referencia visual”

Si es real:

“Trabajo registrado”
o “Proyecto real” solo si realmente está confirmado.

38. SEO

Mantener lo ya hecho.

Solo verificar:

canonical

sitemap

robots

metadata

noindex privadas

39. COOKIES / ANALYTICS

Mantener.

Solo verificar:

aceptar

rechazar

revocar

volver a aceptar

eventos

No redesign grande.

40. RECLAMOS

Mantener Admin ya creado.

Solo verificar:

listado

filtros

detalle

cambio de estado

persistencia

mobile razonable

No expandir ahora.

41. TESTS REALES

Esta vez no basta con crear scripts.

EJECUTARLOS:

npm run typecheck
npm run build
npm run platform-check
npm run visual-check
npm run functional-check
npm run quote-check
npm run quote-pagination-check
npm run quote-status-check
npm run pdf-check

Si falla algo:
CORREGIR.

Repetir hasta pasar.

42. SCREENSHOTS QA

Después del build:

generar capturas de:

Home desktop

Home mobile

Puertas

Puerta principal

Techos

Mamparas

Barandas

Estructuras

Cerco

Drywall

Cotizador desktop

Cotizador mobile

Proyecto detalle

Footer

Inspeccionarlas visualmente.

No asumir que “200 OK” significa que se ve bien.

43. PRUEBA MANUAL DEL LOADER

Obligatorio.

Nueva sesión:

abrir /

observar logo

observar video

observar desaparición de logo

confirmar navbar oculta

llegar al final

confirmar Hero

confirmar trabajador

click trabajador

verificar /asistente

Volver atrás a Home:
NO debe repetirse video.

Abrir nueva sesión/incógnito:
SÍ debe repetirse.

44. PRUEBA MANUAL DEL COTIZADOR

Probar:

Puerta automática

Puerta principal

Techo

Mampara

Baranda

Estructura

Cerco

Drywall

Para cada una:

seleccionar

ingresar medidas

configurar

agregar

Mi Proyecto

finalizar

solicitud

confirmar payload

45. CRITERIO FINAL

No quiero que me digas “se implementó correctamente” sin haberlo comprobado.

Al final entregar:

A. VISUAL

qué cambiaste.

B. LOADER/HERO

timing final usado.

C. PORTALES

qué se pulió.

D. BUGS

qué se corrigió.

E. LIMPIEZA

qué archivos eliminaste.

F. TESTS

cada comando y resultado real.

G. CAPTURAS

lista de screenshots generados.

H. PENDIENTES

solo lo que dependa de:

fotos reales faltantes

datos del cliente

credenciales externas

46. RESULTADO FINAL

Quiero llegar al punto donde ya no tengamos que seguir “implementando funcionalidades”.

Después de este pase solo deberían quedar:

cambios de gusto

reemplazo de fotos

pequeños ajustes visuales

datos reales del cliente

El producto debe sentirse:

Industrial Remotos Perú
arquitectura + ingeniería + fabricación + automatización
premium, moderno, elegante, confiable

No una plantilla.
No una demo.
No una web experimental.

Trabaja esta fase con atención visual extrema.