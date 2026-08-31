# Control — administración, CMS y CRM

## Acceso

- Sin registro público.
- Cookie `httpOnly`, `secure` en producción y `sameSite=lax`.
- Secreto obligatorio; la aplicación no incluye credenciales por defecto.
- Contraseña almacenada únicamente como hash resistente.
- Rate limit y mensaje genérico de error en login.
- Roles iniciales: `SUPER_ADMIN`, `ADMIN`, `COMMERCIAL`.
- Cada operación sensible verifica sesión, usuario activo y rol en servidor.

## Navegación prevista

- Dashboard
- Solicitudes
- Clientes
- Cotizaciones
- Proformas
- Productos
- Soluciones
- Proyectos
- Contenido Home
- Multimedia
- Precios
- Diagramas
- Usuarios y configuración

## Solicitudes

La bandeja incluye búsqueda, filtros, estado, responsable, fecha y origen. El detalle mantiene dos zonas:

- snapshot original inmutable: contacto, respuestas, items y adjuntos;
- operación: estado, responsable, cliente vinculado, notas e historial.

Estados base: `NEW`, `IN_REVIEW`, `CONTACTED`, `QUOTED`, `WON`, `LOST`, `ARCHIVED`. Las transiciones futuras deben configurarse explícitamente.

## Clientes

- No se fusionan automáticamente por teléfono o correo.
- Control sugiere coincidencias; un administrador decide vincular o crear.
- El perfil muestra solicitudes, cotizaciones, proformas, notas y actividad.

## CMS

- Formularios tipados por entidad, no editor HTML libre.
- Borrador, preview y publicación.
- Slug, SEO, estado, orden y media con ALT obligatorio.
- Los campos comerciales admiten `pending`, `verified`, fuente y fecha.
- Publicar invalida únicamente las rutas afectadas.

## Media

- Original privado y variantes optimizadas.
- UUID/key segura, MIME detectado, límite de tamaño, hash y metadatos.
- Búsqueda por nombre, etiqueta, solución o proyecto.
- No eliminar un activo referenciado sin resolver dependencias.

## Auditoría

`ActivityLog` es append-only e incluye actor, acción, entidad, ID, fecha y diff seguro. No registra contraseñas, tokens, contenido completo de cookies ni secretos.

Operaciones auditadas:

- login y bloqueo;
- cambio de estado/responsable;
- nota creada/editada;
- publicación/despublicación;
- cambio de precio;
- creación/emisión/anulación de versión;
- descarga o revocación de enlace privado.

## Estado de implementación

El primer corte habilita login, bandeja y detalle persistente. Clientes, documentos, CMS, media, pricing y diagramas se activan por módulos posteriores, sin mocks que aparenten funcionalidad completa.
