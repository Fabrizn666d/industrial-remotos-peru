# Entrega del panel administrativo IRP

Base exacta: `c20bf7d77a35211987310aafdb78623c7e4c32ec`, rama `mejoras-animaciones`.

Esta entrega reconstruye el trabajo cuyo primer archivo temporal dejó de estar disponible. Conserva el alcance y las funciones registradas en la sesión; no se presenta como una copia idéntica byte por byte del parche original.

## Incluye

- Navegación por secciones, accesos por rol y resumen de gestión.
- Clientes: crear, editar, notas, archivar/restaurar e historial de solicitudes.
- Solicitudes: búsqueda, filtros, paginación, selección múltiple, estados, archivo/restauración y CSV.
- Proformas: edición visible, filtros por fechas, paginación y eliminación únicamente de borradores.
- CMS: borradores separados del contenido publicado, vista previa autenticada, publicación y recuperación de 30 versiones.
- Biblioteca: búsqueda, filtros, carpetas, etiquetas, nombre, descripción, acciones múltiples y consulta de uso. Las referencias en borradores y versiones también impiden eliminar archivos.
- Equipo: cuentas, roles, activación y cambio de contraseña. Cambiar una cuenta invalida sus sesiones. La cuenta principal del servidor conserva su acceso.
- Actividad: cambios de clientes, solicitudes, proformas, archivos, usuarios y contenido.
- Estilo azul moderno, navegación compacta y adaptación para móvil; tablas con desplazamiento horizontal.

No se modifican componentes, modelos, precios, preguntas ni endpoints del cotizador inteligente. La biblioteca solo consulta su catálogo para detectar archivos en uso.

## Aplicación con Codex en el proyecto local

1. Entregar a Codex este ZIP completo y pedirle que lea este documento.
2. Verificar la base actual y guardar los cambios locales existentes antes de aplicar. No sobrescribir trabajo ajeno.
3. Desde la raíz del proyecto: `git apply --check RUTA/irp-admin-cms.patch` y después `git apply RUTA/irp-admin-cms.patch`.
4. Si la base ha cambiado, integrar los archivos de `archivos-modificados/` y resolver las diferencias conservando cambios recientes. No copiar esa carpeta sobre todo el repositorio a ciegas.
5. PostgreSQL: ejecutar `database/migrations/0010_admin_workspaces.sql` antes de iniciar la nueva versión. Agrega una tabla sin eliminar datos existentes. Usar `IRP_REPOSITORY_DRIVER=postgres` en producción.
6. La gestión de usuarios requiere una cuenta `SUPER_ADMIN`; conservar los secretos y credenciales existentes del servidor.
7. Validar con `npm run typecheck` y `node scripts/admin-cms-check.mjs`. La prueba HTTP crea datos temporales aislados y los elimina al finalizar.
8. Revisar escritorio y móvil y probar archivos, formularios, diálogos y acciones masivas con datos de prueba. No hacer push ni despliegue automáticamente.

No se realizó commit, push ni despliegue. La validación funcional con JSON no sustituye una prueba con PostgreSQL. No se ha validado visualmente en navegador.
