# SUPER PROMPT CODEX — INDUSTRIAL REMOTOS PERÚ
## Fase: Integración real de servicios + loader/hero + portales + IRP + cotizador + SEO + QA

Trabaja directamente sobre el repositorio actual de **Industrial Remotos Perú**.

El objetivo de esta fase NO es rehacer todo el proyecto desde cero ni cambiar arbitrariamente el estilo ya aprobado. Quiero integrar correctamente lo que la web promete con lo que realmente existe en servicios, páginas, cotizador, IRP Asistente, formularios, backend, SEO y responsive.

Antes de modificar:
- Revisa primero el estado actual del repo.
- Entiende la arquitectura existente y reutiliza componentes/datos.
- No destruyas funciones ya operativas del admin, solicitudes, cotizaciones, proformas, cookies, contacto, libro de reclamaciones ni backend.
- Si algo ya está bien, consérvalo.
- No reemplaces piezas aprobadas con soluciones genéricas SaaS.
- Respeta la identidad actual: blanco, celeste, azul, navy usado con moderación, arquitectura premium, formas onduladas limpias, Plus Jakarta Sans, animaciones elegantes.
- Evita que toda la web sea azul oscuro/negra. Alterna fondos claros, blancos y celestes.
- No inventes cifras, testimonios, direcciones, obras o clientes.
- No llames “proyecto real” a una imagen que no está verificada como proyecto real.
- No uses imágenes equivocadas de puertas para representar barandas, techos, drywall, cerco eléctrico, etc.
- Mantén accesibilidad, `prefers-reduced-motion`, focus visible y navegación por teclado.
- Prioriza Next.js limpio, datos centralizados y componentes reutilizables.

---

# 1. PRIORIDAD CRÍTICA — CORREGIR LOADER + HERO

Actualmente el loader todavía tiene lógica que mueve el logo hacia la navbar. ESO DEBE ELIMINARSE.

## Comportamiento final obligatorio

### Secuencia
1. Entramos al HOME.
2. Se muestra el video cinematográfico existente: `/NUEVO/Garage_door_opening_transition_1080p_20260921110657.mp4`.
3. Logo de Industrial Remotos centrado como overlay al inicio.
4. Durante la apertura de la puerta el logo simplemente se desvanece.
5. EL LOGO NO VIAJA NI SE “DOCKEA” A LA NAVBAR.
6. El video debe ser protagonista.
7. La navbar, textos del hero, botones y trabajador NO deben aparecer antes de tiempo.
8. Al llegar realmente al final del video, se revela el Hero.
9. El trabajador entra desde la derecha con animación suave.
10. La navbar aparece con su propio logo normal.
11. El texto del Hero aparece con stagger elegante.

### Timing
- `playbackRate`: aprox. `1` o máximo `1.15`.
- No usar `heroRevealLeadSeconds: 3.8`.
- Revelar Hero cuando queden aprox. `0.15–0.25s` o directamente en `ended`.
- No cortar el video artificialmente.

### Primera visita
Implementar control por `sessionStorage`, por ejemplo `irp-intro-v4=seen`.
- Primera visita de la sesión: loader completo.
- Si el usuario vuelve al Home durante la misma sesión: NO repetir los 10 segundos.
- Puede mostrar Hero directamente con transición corta.

### Eliminar
- Cálculo de coordenadas hacia `.site-header__logo`.
- `logoDockAtVideoSeconds`.
- `logoDockMs`.
- movimiento a navbar.
- dependencias del loader respecto al logo del header.

### Trabajador del Hero
El trabajador actualmente es decorativo. Quiero que se convierta en una entrada clara hacia **IRP Asistente**:
- clickable.
- cursor adecuado.
- hover muy sutil.
- al tocar/click abrir `/asistente` o el panel IRP según la arquitectura actual.
- no parecer un botón gigante.
- conservar la imagen actual y su globo.

### Degradado Hero
Mantener el degradado únicamente del lado izquierdo, detrás de los textos. No oscurecer toda la imagen. Debe asegurar legibilidad sin apagar la casa ni al trabajador.

---

# 2. DEFINIR DE VERDAD EL CATÁLOGO DE SERVICIOS

Actualmente la Home promete más servicios que el sistema interno. Quiero centralizar y alinear servicios, páginas, buscador, IRP, cotizador, navegación y Home.

## Servicios principales definitivos

1. **Puertas automáticas y de garaje**: seccionales, levadizas, corredizas, batientes, automatización y control.
2. **Puertas principales**: accesos peatonales exteriores, puertas principales metálicas/decorativas, contraplacadas/acabados si realmente se ofrecen. No mezclar automáticamente con garaje.
3. **Techos y coberturas**: sol y sombra, policarbonato, coberturas metálicas, terrazas/patios/cocheras.
4. **Mamparas y ventanas**: mamparas corredizas, ventanas de aluminio, divisiones de vidrio.
5. **Acero inoxidable y barandas**: barandas, pasamanos, acero inoxidable, combinaciones con vidrio cuando corresponda.
6. **Estructuras metálicas**: estructuras, soportes, cerramientos, fabricación especial.
7. **Cerco eléctrico**: protección perimetral, energizadores/control, instalación, accesorios relacionados.
8. **Drywall y cielorrasos**: divisiones, cielorrasos, revestimientos/soluciones ligeras si corresponde.

## Reglas de integración
Cada servicio debe existir consistentemente en:
- `data/solution-pages.ts`
- `data/solutions.ts`
- `data/products.ts` si aplica al cotizador
- buscador
- navegación de soluciones
- Home
- IRP Asistente
- cotizador
- sitemap
- metadata
- páginas de detalle

Evitar que “Cerco eléctrico” y “Drywall” lleven a “Trabajos especiales”. Deben tener portal propio.

Evitar que “Puertas principales” quede escondido dentro de puertas automáticas.

Si algunos productos no permiten estimación automática todavía:
- pueden existir en cotizador,
- mostrar “Precio por confirmar”,
- recolectar medidas/configuración,
- guardar la solicitud,
- permitir continuar a evaluación comercial.

---

# 3. PORTALES DE CADA SERVICIO — NUEVO ESTÁNDAR

Cada servicio debe sentirse como una verdadera landing comercial, NO una plantilla genérica repetida. Mantener una estructura coherente, pero cambiar contenido, imágenes, iconografía, atributos y controles según cada servicio.

## A. HERO DEL SERVICIO
Desktop:
- breadcrumbs pequeños.
- eyebrow.
- título grande.
- descripción breve.
- CTA “Cotizar esta solución”.
- CTA secundario “Hablar con un asesor”.
- una imagen principal grande del servicio.
- badges pequeños: A medida / Instalación profesional / Asesoría técnica.

Mobile:
- texto primero.
- imagen después.
- CTAs accesibles.
- sin desbordes.
- sin reducir el texto a tamaños ridículos.

NO usar una foto genérica si existe material real apropiado.

## B. EXPLICACIÓN / VALOR
Después del Hero:
- fondo claro.
- título y texto.
- qué resuelve.
- beneficios.
- aplicaciones.
- materiales/sistemas disponibles.
- ninguna lista kilométrica.

Usar layout editorial premium con aire.

## C. CARRUSEL INFINITO #1 — PROYECTOS / REFERENCIAS
Debajo de la explicación.

Quiero un carrusel horizontal infinito:
- movimiento automático lento hacia la IZQUIERDA.
- loop continuo, sin salto visible.
- pausa/reducción al hover.
- drag con mouse.
- swipe en móvil.
- sin scrollbar visible.
- tarjetas fotográficas grandes.
- esquinas elegantes.
- nombre/tipo al hover o pequeña etiqueta.
- `prefers-reduced-motion`: detener autoplay o simplificar.

IMPORTANTE: solo usar imágenes correspondientes al servicio. Si no hay fotografías reales verificadas suficientes, utilizar “Referencia visual” o duplicación inteligente de imágenes válidas para el loop, pero NO inventar proyectos reales diferentes.

## D. CARRUSEL INFINITO #2 — DETALLES / ACABADOS
Segundo carrusel:
- movimiento automático hacia la DERECHA.
- dirección opuesta al anterior.
- tarjetas algo más pequeñas.
- mostrar detalles, acabados, sistemas, componentes, materiales o variantes.
- drag/swipe.
- loop sin cortes.

La combinación debe sentirse dinámica:
Carrusel 1 → izquierda.
Carrusel 2 → derecha.

NO hacer ambos demasiado rápidos.

## E. OPCIONES DEL SERVICIO
Debajo de los carruseles:
- cards de subtipos.
- imagen.
- título.
- descripción.
- características.
- CTA “Quiero cotizar”.
- hover sobrio.
- no cards SaaS genéricas.

Ejemplos:
- Puertas: seccional, levadiza, corrediza, batiente, automatización.
- Techos: sol y sombra, policarbonato, estructural.
- Cerco eléctrico: vivienda, comercio, perímetro amplio/industrial, según datos disponibles.
- Drywall: división, cielorraso, solución especial.

## F. MINI COTIZADOR DEL SERVICIO
Este bloque es MUY IMPORTANTE.

No quiero simplemente un botón a `/cotizar`. Cada página debe tener un **mini configurador adaptado al servicio**.

Visual:
- fondo claro/celeste.
- panel dividido.
- configuración a la izquierda.
- preview o imagen a la derecha.
- progress ligero.
- animaciones suaves.

Campos sugeridos:
- Puertas: tipo, ancho, alto, acabado, automatización sí/no, uso residencial/comercial/industrial.
- Techos: tipo de cobertura, ancho, largo, estructura, acabado, ubicación.
- Mamparas: ancho, alto, cantidad de hojas, sistema, color perfilería, tipo de vidrio.
- Barandas: metros lineales, ubicación, acero/vidrio, acabado.
- Estructuras: medidas aproximadas, uso, ubicación, descripción.
- Cerco: metros lineales, tipo de inmueble, configuración aproximada si corresponde, ubicación.
- Drywall: tipo, dimensiones/área, acabado, ubicación.
- Puerta principal: ancho, alto, tipo, material/acabado, cerradura/sistema, ubicación.

Funcionamiento:
- “Agregar a Mi Proyecto” o “Continuar cotización”.
- reutilizar `ProjectContext`.
- pasar configuración al cotizador principal.
- NO perder datos.
- al ir a `/cotizar`, precargar campos.
- no usar precios inventados.
- si no hay pricing real: **Precio por confirmar**.

## G. PROCESO
Proceso corto específico de 4 pasos:
1. Revisamos.
2. Diseñamos/definimos.
3. Fabricamos/preparamos.
4. Instalamos/entregamos.

## H. FAQ ESPECÍFICO
No reutilizar exactamente las mismas preguntas para todo. Crear preguntas relevantes por servicio. No inventar garantías/tiempos exactos si no están confirmados.

## I. CTA FINAL
Bloque limpio: “Cuéntanos qué necesitas y preparemos el siguiente paso.”
Botones: Diseñar y cotizar / WhatsApp.

---

# 4. COMPONENTE DE CARRUSEL REUTILIZABLE

No copies la misma lógica ocho veces. Crear un componente reutilizable, por ejemplo:
`components/shared/InfiniteMediaRail.tsx`

Props sugeridas:
- `items`
- `direction: "left" | "right"`
- `speed`
- `cardVariant`
- `ariaLabel`
- `pauseOnHover`
- `draggable`

Requisitos:
- loop continuo.
- duplicación interna correcta.
- drag.
- swipe.
- pointer events consistentes.
- accesibilidad.
- performance.
- reduced motion.

Evitar librerías nuevas si no son necesarias.

---

# 5. IRP ASISTENTE — VOLVERLO REALMENTE ÚTIL

No convertirlo en un “ChatGPT falso”. Debe seguir siendo un asistente guiado determinista pero más completo.

Flujo recomendado:
1. ¿Qué necesitas? Puerta automática / Puerta principal / Techo / Mampara / Baranda / Estructura / Cerco / Drywall / No estoy seguro.
2. Tipo de uso: Residencial / Comercial / Industrial.
3. Ubicación.
4. Medidas aproximadas adaptadas al servicio.
5. Acabado/necesidad según servicio.
6. Resultado con recomendación, resumen, imagen, “Precio por confirmar”, botones Configurar / Agregar a Mi Proyecto / WhatsApp.

Persistencia:
- durante la misma sesión no perder inmediatamente la conversación.
- usar sessionStorage de forma moderada.

Actualizar quick replies del IRP flotante para incluir todos los servicios reales.

---

# 6. COTIZADOR INTELIGENTE PRINCIPAL

No romper el configurador actual. Extenderlo.

Debe soportar todas las familias de servicios.

Arquitectura:
- evitar condiciones gigantes dentro de un solo componente.
- schemas por servicio.
- pasos declarativos.
- campos dinámicos.
- previews específicas.
- reutilizar `data/configurator-schemas.ts` si existe y mejorarlo.

Flujo general:
- servicio.
- subtipo.
- medidas.
- diseño/sistema.
- materiales/acabado.
- extras.
- instalación.
- resumen.
- agregar a proyecto.

No todos los servicios deben tener exactamente 8 pasos.

Diseño:
- premium.
- limpio.
- gran preview.
- navegación clara.
- mobile usable.
- sticky resumen solo donde no moleste.
- validaciones visibles.
- no mostrar opciones irrelevantes.

Mientras no exista matriz real de precios:
- no calcular números falsos.
- mostrar “Precio por confirmar”.
- guardar todas las especificaciones.
- generar solicitud correctamente.
- generar código.
- permitir gestión desde Control/Admin.

---

# 7. MI PROYECTO + CHECKOUT

Revisar que las nuevas familias:
- aparezcan bien.
- tengan imagen correcta.
- tengan resumen legible.
- permitan cantidad/eliminar.
- persistan localmente.
- lleguen al checkout.
- lleguen a `/api/requests`.
- lleguen al Admin.
- no rompan proforma.

No guardar UTM dentro de `item.configuration`.
Crear propiedad `attribution` o equivalente con source, medium, campaign, content, term y landingPage si existen.
Actualizar contratos backend y repositorios de forma compatible.

---

# 8. PROYECTOS

Mantener el Home actual de proyectos, pero completar funcionalidad.

`/proyectos`:
- filtrar por categoría.
- cards reales.
- modal/lightbox o página de detalle.
- imágenes optimizadas.
- animaciones elegantes.

Si ya existen `slug`, crear `/proyectos/[slug]` si tiene sentido.

Detalle:
- título.
- categoría.
- ubicación si está confirmada.
- galería.
- descripción.
- solución utilizada.
- CTA relacionado.

No inventar ubicación/categoría.

---

# 9. HOME — NO REDISEÑAR TODO

Mantener el orden actual salvo ajustes necesarios:
1. Hero cinematográfico.
2. Qué necesitas construir / servicios.
3. Proyectos.
4. Proceso.
5. Soluciones integradas al espacio.
6. ¿Cómo quieres avanzar? — IRP / Cotizador.
7. Cobertura.
8. Contacto.
9. Footer.

Corrección de duplicidad:
En `NeedsSection`, la banda Asesoría / Diseño / Fabricación / Instalación se siente repetida con la sección completa de Proceso.
Convertir esa banda en beneficios distintos o simplificarla. No volver a contar el mismo proceso dos veces.

Espaciados:
Eliminar hacks innecesarios:
- min-heights gigantes.
- `padding-bottom: 220px` solo para hacer calzar imágenes.
- márgenes negativos frágiles.

El layout debe responder por contenido, no por screenshot específico.

---

# 10. FORMULARIOS

Mantener lo ya bueno en Contacto.
Revisar loading, success, error, retry, persistencia visual, validación servidor/cliente, honeypot, tamaño máximo, rate limit.
No enviar PII a Analytics.

---

# 11. LIBRO DE RECLAMACIONES

Conservar el flujo creado.
Mejorar backend:
- fecha no futura.
- validar monto si se envía.
- validar número de documento según tipo sin bloquear casos legítimos.
- sanitizar/normalizar.

Crear módulo Admin `/admin/reclamos`:
- listado.
- código.
- fecha.
- consumidor.
- Reclamo/Queja.
- estado.
- detalle.
- pedido.
- cambiar estado: RECEIVED / IN_REVIEW / ANSWERED / CLOSED.
- paginación.
- acceso protegido.

---

# 12. COOKIES + ANALYTICS

Conservar banner actual.

Corregir revocación: si Analytics estaba aceptado y luego se desmarca, dejar de enviar analytics e implementar `window['ga-disable-MEASUREMENT_ID'] = true` cuando corresponda. Al volver a aceptar, reactivar correctamente.

No cargar analytics antes del consentimiento.

Eventos útiles:
- hero_cta_click
- service_open
- configurator_start
- configurator_complete
- project_add
- irp_start
- irp_recommendation
- contact_submit
- quote_submit
- complaint_submit
- whatsapp_click
- search

Nunca incluir nombre, email, teléfono, DNI o texto de reclamos.

---

# 13. SEO TÉCNICO

## Canonical
QUITAR canonical global `/` del root layout. Definir canonical correcto por página.

## Sitemap
Excluir `/mi-proyecto`, rutas privadas, confirmaciones, proforma privada, admin y APIs.

Incluir páginas públicas reales.

## Noindex
Aplicar noindex a mi-proyecto, checkout/finalizar, confirmación, proforma y admin.

## Metadata de servicios
Cada portal: title, description, canonical, OG title, OG description, OG image, Twitter.

## JSON-LD
Añadir correctamente Organization, WebSite, Service, BreadcrumbList y FAQPage donde corresponda.

No meter datos legales falsos.

---

# 14. IMÁGENES Y VERACIDAD

Crear una capa de datos `verifiedReal: true/false` o equivalente.

Si una imagen es mockup/referencia, no mostrar “Proyecto real”. Usar “Referencia visual”, “Ejemplo de solución” o nada.

Revisar `solution-pages.ts`. No usar imágenes de puertas para barandas/techos/drywall/cerco solo porque existen.

Si no hay material válido, usar placeholders honestamente hasta que llegue material real.

---

# 15. RENDIMIENTO

- usar `next/image` cuando corresponda.
- evitar `unoptimized` salvo motivo real.
- optimizar assets pesados.
- preload solo contenido crítico.
- lazy load en galerías inferiores.
- evitar filtros pesados en móvil.
- no cargar 40 imágenes grandes de carruseles al inicio.
- `sizes` correctos.
- evitar layout shift.

---

# 16. REPO / ASSETS

Limpiar del deploy basura de QA:
- `.artifacts/`
- PDFs de test
- screenshots de desarrollo
- temporales
- ZIP público si no se necesita en producción

Si deben mantenerse en git, asegurar que no se copien a producción. Revisar `.gitignore` y `.dockerignore`.

---

# 17. RESPONSIVE REAL

Probar: 1920, 1440, 1366, 1280, 1024, 768, 430, 412, 390, 375, 360, 320.

Revisar:
- sin scroll horizontal.
- cards legibles.
- títulos sin cortes absurdos.
- Hero usable.
- trabajador no tapa CTAs.
- navbar móvil.
- carruseles con touch.
- cotizador usable con una mano.
- footer limpio.
- modales dentro del viewport.
- teclado móvil no rompe formularios.

No arreglar responsive con `min-height: 2000px`.

---

# 18. ACCESIBILIDAD

- labels reales.
- aria-expanded.
- focus traps en modal.
- Escape cierra.
- devolver foco al trigger.
- botones con aria-label cuando son iconos.
- contraste suficiente.
- reduced motion.
- headings semánticos.
- alt específico cuando aporta contexto.
- decorativas con alt vacío.

---

# 19. SEGURIDAD BACKEND

Mantener Zod server-side, allowed origin, content type, límites payload, no-store, auth admin, env secrets, CSP, HSTS prod y rate limit.

Revisar que ningún endpoint admin sea público.

El rate limit en memoria puede mantenerse para VPS single-instance, pero documentar la limitación. No agregar Redis solo por agregar tecnología.

---

# 20. VALIDACIÓN Y PRUEBAS

ANTES DE DECIR “TERMINADO”, ejecutar y corregir realmente:

```bash
npm run typecheck
npm run build
npm run visual-check
npm run functional-check
npm run quote-check
npm run quote-pagination-check
npm run quote-status-check
npm run pdf-check
```

Si algún script no funciona por entorno, documentar comando, error, dependencia y qué sí fue verificado. No declarar “tests pasan” si no fueron ejecutados.

Crear/actualizar tests para nuevos servicios, mini configurador, IRP, Cerco, Drywall, Puerta principal, cookies revoke, Libro de Reclamaciones, canonical, mobile overflow y sitemap exclusions.

---

# 21. NO HACER

- No WordPress.
- No rehacer todo como landing genérica.
- No meter fondos oscuros en cada sección.
- No cambiar paleta sin motivo.
- No meter librería pesada de carrusel si se puede evitar.
- No inventar precios.
- No inventar proyectos.
- No inventar testimonios.
- No romper Admin/Control.
- No romper cotizaciones/proformas.
- No reemplazar imágenes aprobadas del Hero.
- No volver a poner una transición gigante blanca entre secciones.
- No usar zoom artificial en Hero.
- No mover el logo del loader a la navbar.
- No revelar Hero 3–4 segundos antes de acabar video.

---

# 22. ORDEN DE TRABAJO

Fase A: Loader + Hero + trabajador → IRP.
Fase B: Modelo definitivo de servicios.
Fase C: Portal estándar + carruseles reutilizables.
Fase D: Crear/actualizar los 8 portales.
Fase E: IRP Asistente.
Fase F: Cotizador + mini cotizadores + Mi Proyecto.
Fase G: Proyectos.
Fase H: Reclamos Admin + validaciones.
Fase I: SEO + cookies + analytics.
Fase J: Responsive, rendimiento, QA y limpieza.

Mantener el proyecto compilable durante todo el proceso.

---

# 23. CRITERIO VISUAL FINAL DE LOS PORTALES

Quiero que cada página de servicio se sienta aproximadamente así:

**Hero** — Título + texto + gran imagen.

↓

**Explicación elegante** — Beneficios + aplicaciones.

↓

**Carrusel infinito grande** — ← fotografías / proyectos / referencias.

↓

**Carrusel infinito complementario** — → detalles / acabados / variantes.

↓

**Opciones** — 3–6 tipos claros.

↓

**Mini cotizador interactivo** — adaptado al servicio.

↓

**Proceso** — 4 pasos.

↓

**FAQ** — específico.

↓

**CTA final** — Cotizar / WhatsApp.

Debe haber ritmo visual. No debe sentirse como “diapositivas una debajo de otra”. Usar fondos blancos/celestes, ondas muy sutiles, cambios de composición y aire.

---

# 24. RESULTADO ESPERADO

Al terminar quiero que Industrial Remotos Perú se sienta como una plataforma coherente:
- Lo que Home promete existe.
- Cada servicio tiene su portal.
- Cada portal se siente específico.
- Las imágenes corresponden al servicio.
- Hay movimiento premium con 2 carruseles infinitos opuestos.
- El usuario puede cotizar desde cada servicio.
- IRP entiende las categorías.
- Mi Proyecto conserva configuraciones.
- El backend recibe correctamente.
- Admin puede trabajar las solicitudes.
- Reclamos funcionan.
- Cookies funcionan.
- SEO es correcto.
- Mobile está bien.
- No hay hacks de layout.
- No hay datos falsos.
- No hay precios falsos.
- No hay “proyectos reales” falsos.
- Todo pasa build/typecheck/tests disponibles.

Al final entrégame un resumen técnico con:
1. archivos creados.
2. archivos modificados.
3. nuevas rutas.
4. nuevas estructuras de datos.
5. cambios de backend.
6. migraciones necesarias.
7. variables de entorno necesarias.
8. pruebas ejecutadas y resultado.
9. pendientes exclusivamente por falta de datos reales del cliente.

No resumas el trabajo antes de terminar. Primero implementa, prueba y corrige.
