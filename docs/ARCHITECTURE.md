# Arquitectura

## Superficies

La aplicación se divide lógicamente en tres superficies que comparten dominio y diseño:

- **Web**: descubrimiento, soluciones, proyectos y contacto.
- **Cotiza**: asistente, configurador, borrador, envío y seguimiento.
- **Control**: solicitudes, clientes, contenido, catálogo, precios, documentos y media.

Las rutas públicas nunca importan módulos `server-only`. Control puede consumir el mismo dominio, pero toda lectura sensible vuelve a comprobar sesión y rol junto al dato.

## Capas

```text
app/                     rutas, layouts y Route Handlers
components/              presentación e interacción
data/                    contenido semilla y catálogos todavía no migrados
types/                   contratos serializables del dominio
lib/domain/              reglas puras
lib/server/              auth, persistencia, storage y servicios de servidor
database/migrations/     contrato SQL versionado para PostgreSQL
docs/                    decisiones, operación y pendientes
```

### Dominio

Objetos principales:

- `Product` y `ConfiguratorSchema`
- `ProjectDraft` y `QuoteRequest`
- `Client`
- `Quote` / `QuoteVersion`
- `Proforma` / `ProformaVersion`
- `DiagramDefinition`
- `MediaAsset`
- `ContentEntry`
- `ActivityLog`

Una solicitud original es un snapshot inmutable. Cambiar estado, responsable, cliente vinculado o notas no reescribe lo que envió el visitante.

### Persistencia

- Producción: PostgreSQL y migraciones SQL revisables.
- Desarrollo sin infraestructura: adapter JSON explícito, con escritura temporal + rename para reducir corrupción.
- Archivos: interfaz `ObjectStorage`; local privado en desarrollo y S3/R2 en producción.
- El adapter local no es un sustituto productivo de PostgreSQL ni de backups.

## Flujo de solicitud

```text
Borrador local versionado
        ↓ Zod
POST /api/requests
        ↓ validación + idempotencia
Repository.createRequest()
        ↓
IRP-YYYY-#### + token público opaco
        ↓
Confirmación pública / Bandeja de Control
```

El código humano sirve para atención; no concede acceso. La consulta pública requiere un token aleatorio, del que solo se almacena un hash cuando el adapter lo soporte.

## Límites de confianza

- El navegador nunca determina precio final, correlativo, estado ni rol.
- Toda entrada se valida en servidor.
- Los archivos se validan por tamaño, extensión, MIME y firma antes de persistir.
- El contenido público solo usa campos publicados/verificados.
- La autorización se aplica en servicios/repositorios; una redirección de middleware no basta.
- Las operaciones administrativas generan historial append-only.

## Render y caché

- Home y páginas editoriales pueden usar caché con invalidación al publicar.
- Solicitudes, clientes, precios y documentos son dinámicos y nunca se cachean públicamente.
- El build no debe depender de que PostgreSQL esté disponible.
- Los seeds locales permiten compilar; la publicación migra cada dominio una sola vez al repositorio.

## Despliegue

Variables mínimas:

- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL` en producción
- `AUTH_SECRET`
- credenciales bootstrap únicamente durante provisión, nunca como defaults versionados
- configuración S3/R2 para media privada

El contenedor standalone debe ejecutar como usuario no privilegiado. Base, media y backups tienen ciclos separados; restaurar solo uno no constituye una recuperación completa.

## Estado de migración

- [x] Auditoría y límites de confianza definidos.
- [x] Selector visual de soluciones desacoplado.
- [x] Modelo inicial de diagramas SVG.
- [ ] Solicitud pública conectada al repositorio.
- [ ] PostgreSQL activado en el entorno de despliegue.
- [ ] Catálogo/CMS migrados desde `data/*.ts`.
- [ ] Object storage productivo configurado.
