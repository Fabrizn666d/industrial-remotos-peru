# Motor de precios

## Estados

Todo resultado comercial tiene un estado explícito:

- `pending`: no hay reglas suficientes; UI muestra **Precio por confirmar**.
- `estimated`: cálculo interno con versión de reglas y advertencia visible.
- `confirmed`: importe aprobado por un usuario autorizado.

Solo `confirmed` puede emitirse como importe final en un documento aprobado.

## Principios

- Cálculo exclusivo en servidor para solicitudes y documentos.
- Moneda y totales monetarios en unidades menores enteras.
- Dimensiones en milímetros.
- Cada cálculo guarda `ruleSetId`, versión, entradas normalizadas, desglose y fecha.
- Una regla editada crea una versión nueva; no cambia documentos existentes.
- El cliente puede enviar respuestas, nunca un total confiable.

## Reglas

Una regla tipada puede aportar o modificar componentes:

```ts
type PricingRule = {
  id: string;
  version: number;
  priority: number;
  activeFrom: string;
  activeUntil?: string;
  conditions: Condition[];
  effect:
    | { kind: "fixed"; amountMinor: number }
    | { kind: "per-area"; amountMinorPerM2: number }
    | { kind: "multiplier"; basisPoints: number }
    | { kind: "surcharge"; amountMinor: number };
  combinable: boolean;
};
```

Hasta recibir reglas verificadas, no se incluyen importes semilla en el repositorio.

## Pipeline

1. Validar configuración y catálogo publicado.
2. Normalizar unidades.
3. Seleccionar el ruleset vigente.
4. Evaluar condiciones en orden determinista.
5. Crear desglose; redondear solo en límites definidos.
6. Aplicar override autorizado, si existe, registrando motivo y autor.
7. Persistir snapshot y hash dentro de `QuoteVersion`.

## Cotizaciones y proformas

- `Quote` identifica el expediente; `QuoteVersion` es inmutable.
- Editar una versión enviada crea `v2`, no altera `v1`.
- Una proforma referencia una versión concreta de cotización y guarda su propio snapshot/PDF/hash.
- Descuentos, IGV, transporte, instalación, validez y condiciones permanecen deshabilitados hasta ser configurados.

## Pruebas mínimas

- Orden y combinación de reglas.
- Rangos y límites exactos.
- Conversión mm → m² sin pérdida inesperada.
- Redondeo y enteros monetarios.
- Versiones históricas reproducibles.
- Rechazo de totals manipulados en el navegador.
- Override con autorización, motivo e historial.
