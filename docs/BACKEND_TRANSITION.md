# Primer corte backend y Control

Este corte introduce una frontera de servidor sin cambiar todavía el flujo visual público.

## Qué está disponible

- contratos Zod para solicitudes, items, sesión, estados e historial;
- interfaz `RequestRepository`;
- adapter JSON exclusivo de desarrollo con lock entre procesos cooperantes, archivo temporal y `rename` atómico;
- correlativo anual `IRP-YYYY-####` e idempotencia por `clientSubmissionId`;
- cookie administrativa `httpOnly`, firmada con HMAC-SHA-256 y con expiración de ocho horas;
- verificación de contraseña `scrypt` usando exclusivamente hash configurado en entorno;
- `POST /api/admin/session`, `GET /api/admin/session` y `DELETE /api/admin/session`;
- `POST /api/requests` público y `GET /api/requests` protegido;
- `/admin/login`, `/admin`, `/admin/solicitudes` y `/admin/solicitudes/[id]`;
- contrato PostgreSQL equivalente en `database/migrations/0001_request_backend.sql`.

El listado y detalle son de solo lectura en este corte. No aparentan acciones de CRM que aún no tienen transacción e historial.

## Configuración local

No existen credenciales, secretos ni datos comerciales predeterminados. Configurar fuera del repositorio:

```dotenv
IRP_ADMIN_EMAIL=
IRP_ADMIN_PASSWORD_HASH=
IRP_ADMIN_ROLE=SUPER_ADMIN
IRP_AUTH_SECRET=
IRP_REPOSITORY_DRIVER=json
IRP_JSON_DATA_PATH=
DATABASE_URL=
IRP_BUSINESS_TIME_ZONE=America/Lima
```

Restricciones:

- `IRP_AUTH_SECRET` debe tener al menos 32 bytes impredecibles.
- `IRP_ADMIN_ROLE` acepta `SUPER_ADMIN`, `ADMIN` o `COMMERCIAL`.
- `IRP_ADMIN_PASSWORD_HASH` nunca contiene la contraseña en texto plano.
- `IRP_JSON_DATA_PATH` es opcional en desarrollo; si se omite, se usa `.data/irp-development.json`.
- el adapter JSON se niega a arrancar con `NODE_ENV=production`.

Generar el hash mediante una terminal interactiva, para no dejar la contraseña en historial, argumentos ni logs:

```powershell
node scripts/generate-admin-hash.mjs
```

Copiar únicamente el resultado codificado a `IRP_ADMIN_PASSWORD_HASH`. La entrada no se guarda.

## Contrato de envío público

`POST /api/requests` requiere `Content-Type: application/json` y un cuerpo máximo de 256 KiB. Estructura resumida:

```json
{
  "clientSubmissionId": "<uuid generado una sola vez por intento>",
  "contact": {
    "name": "<nombre>",
    "email": "<correo>",
    "phone": "<teléfono>"
  },
  "details": {
    "projectType": "<tipo>",
    "location": "<ubicación>"
  },
  "items": [
    {
      "clientItemId": "<id local opcional>",
      "productId": "<id de producto opcional>",
      "name": "<nombre visible>",
      "quantity": 1,
      "configuration": {}
    }
  ],
  "attachmentNames": [],
  "source": "CONFIGURATOR"
}
```

La respuesta entrega `id`, código humano, fecha, indicador `replayed` y un `accessToken` opaco únicamente en la primera creación. El token no debe enviarse a analítica ni incluirse en logs. Una repetición con el mismo `clientSubmissionId` recupera el mismo expediente, pero no vuelve a revelar el token.

Los campos de precio del navegador se excluyen deliberadamente. El backend no acepta ni confía en `unitPrice` o `total`.

## Integración pendiente con el flujo público

`components/CheckoutExperience.tsx` permanece sin cambios por alcance. Para conectarlo:

1. Crear un `clientSubmissionId` con `crypto.randomUUID()` y conservarlo durante los reintentos.
2. Convertir cada `QuoteItem` al contrato anterior; medidas y acabado pertenecen a `configuration`.
3. No transmitir precios actuales al backend.
4. Hacer `POST /api/requests` antes de vaciar `ProjectContext`.
5. Conservar la respuesta y navegar usando el código retornado, no uno generado con `Math.random()`.
6. Solo limpiar el proyecto después de una respuesta exitosa.
7. Reemplazar el fallback de ejemplo en la confirmación por una consulta pública autenticada con el token opaco.

`attachmentNames` preserva únicamente nombres declarados por el formulario heredado. No equivale a subir archivos. Los binarios requieren un adapter `ObjectStorage`, inspección de firma/MIME, límites y una tabla de assets antes de habilitarse.

## PostgreSQL productivo

`PostgresRequestRepository` implementa el mismo contrato con el driver `pg`. La migración SQL conserva los mismos estados, snapshots e idempotencia. Para activarlo:

1. Crear una base PostgreSQL y configurar `DATABASE_URL` fuera del repositorio.
2. Aplicar `database/migrations/0001_request_backend.sql` una sola vez mediante el proceso de despliegue.
3. Configurar `IRP_REPOSITORY_DRIVER=postgres`.
4. Iniciar la aplicación; el pool se crea de forma diferida al primer acceso y el build no consulta la base.

La creación usa un único `PoolClient` desde `BEGIN` hasta `COMMIT`: serializa cada clave idempotente con un advisory lock, asigna el correlativo con `INSERT ... ON CONFLICT ... RETURNING`, guarda solicitud, items y ActivityLog, y hace rollback ante cualquier fallo. Las consultas están parametrizadas; solo el nombre de campo de la búsqueda por ID procede de una unión literal interna. El endpoint administrativo omite `publicTokenHash` de sus DTOs.

## Límites de seguridad conocidos

- `proxy.ts` realiza solo una comprobación optimista de presencia de cookie; páginas y APIs verifican firma, expiración e identidad.
- el rate limit incluido es local al proceso. Un despliegue con réplicas necesita un limitador compartido o controles en el reverse proxy.
- una única identidad configurada por entorno no sustituye gestión de usuarios, recuperación ni MFA.
- el almacenamiento JSON no sustituye PostgreSQL, bloqueo distribuido, backups ni alta disponibilidad.
- las rutas públicas ya viven bajo un route group con layout propio; `/admin` no monta Header, Footer ni ProjectProvider. El módulo CSS conserva defensas de aislamiento para evitar regresiones visuales.
