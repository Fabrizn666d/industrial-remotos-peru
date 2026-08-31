# IRP Control — Cotizaciones y proformas

## Alcance implementado

- Listado administrativo en `/admin/cotizaciones`.
- Editor guiado de cinco pasos en `/admin/cotizaciones/nueva`.
- Catálogo editable en `/admin/configuracion/productos-cotizacion`.
- Estados `DRAFT`, `ISSUED` y `VOID`.
- Duplicación de cotizaciones con un código nuevo.
- Snapshot de productos, descripciones, SVG, medidas y precios en cada ítem.
- Totales recalculados en servidor y moneda fija `PEN`.
- Vista previa y descarga desde `/api/admin/quotes/[id]/pdf`.
- PDF vectorial/selectable generado con `@react-pdf/renderer`.

## Persistencia

En desarrollo se usa un archivo ignorado por Git:

```text
.data/irp-control.json
```

Puede cambiarse con `IRP_CONTROL_JSON_DATA_PATH`. El adaptador JSON está bloqueado en producción.

En producción se usa PostgreSQL con:

```text
database/migrations/0001_request_backend.sql
database/migrations/0002_control_quotes.sql
```

La segunda migración crea contadores, plantillas de producto, cotizaciones e ítems separados. Los ítems guardan un snapshot JSON inmutable después de emitir.

## Seguridad y reglas

- Todas las rutas administrativas exigen una sesión IRP Control válida.
- Las mutaciones validan origen y `Content-Type`.
- Zod valida textos, fechas, correo opcional, medidas, cantidad y precios.
- El servidor ignora totales enviados por el navegador y vuelve a calcular área, subtotales, base imponible, IGV y total.
- Una cotización emitida no puede editarse. Para modificarla se duplica y se genera un borrador nuevo.
- Los PDF no contienen firma del asesor, aceptación del cliente ni textos de demostración.

## Verificación local

Con el servidor levantado y credenciales QA temporales:

```powershell
npm.cmd run typecheck
npm.cmd run build
node scripts/quote-control-check.mjs
node scripts/quote-pagination-check.mjs
node scripts/quote-status-check.mjs
```

Los tres scripts de flujo requieren `IRP_QA_EMAIL`, `IRP_QA_PASSWORD` y, opcionalmente, `SITE_URL`.

